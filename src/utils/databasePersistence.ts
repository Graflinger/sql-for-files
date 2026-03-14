import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys } from "idb-keyval";

import { withDuckDBConnection } from "./duckdb";
import { quoteIdentifier, quoteStringLiteral } from "./sql";

// ── IndexedDB key conventions ───────────────────────────────────────────────
// "db-meta"                → { savedAt: string, tableNames: string[] }
// "db-parquet:<tableName>" → Uint8Array (Parquet buffer)

interface DatabaseMeta {
  savedAt: string;
  tableNames: string[];
}

/** Warning thresholds for row counts */
const WARN_ROWS = 1_000_000;
const STRONG_WARN_ROWS = 5_000_000;

// ── Row-count helpers ───────────────────────────────────────────────────────

/**
 * Returns the row count for a table via `SELECT COUNT(*)`.
 */
export async function getTableRowCount(
  db: AsyncDuckDB,
  tableName: string
): Promise<number> {
  return withDuckDBConnection(db, async (conn) => {
    const result = await conn.query(
      `SELECT COUNT(*) AS cnt FROM ${quoteIdentifier(tableName)}`
    );
    const raw = result.toArray()[0].cnt;
    return typeof raw === "bigint" ? Number(raw) : (raw as number);
  });
}

/**
 * Returns a warning message if the row count exceeds thresholds, or null.
 */
export function rowCountWarning(
  tableName: string,
  rowCount: number
): { level: "warn" | "strong"; message: string } | null {
  if (rowCount > STRONG_WARN_ROWS) {
    return {
      level: "strong",
      message: `Table "${tableName}" has ${rowCount.toLocaleString()} rows. Consider exporting instead — saving may use significant memory.`,
    };
  }
  if (rowCount > WARN_ROWS) {
    return {
      level: "warn",
      message: `Table "${tableName}" has ${rowCount.toLocaleString()} rows — saving may use significant memory.`,
    };
  }
  return null;
}

// ── Save helpers ────────────────────────────────────────────────────────────

/**
 * Serialize a single table to Parquet and store the buffer in IndexedDB.
 *
 * Steps:
 *  1. COPY table TO virtual-filesystem Parquet file
 *  2. copyFileToBuffer → Uint8Array
 *  3. Store under `db-parquet:<name>` in IndexedDB
 *  4. Update `db-meta` table list
 *  5. Clean up the virtual-filesystem file
 */
export async function saveTableToIndexedDB(
  db: AsyncDuckDB,
  tableName: string
): Promise<{ warning: string | null }> {
  const parquetFileName = `${tableName}.parquet`;
  let warning: string | null = null;

  // Check row count for warnings
  const rowCount = await getTableRowCount(db, tableName);
  const rowWarn = rowCountWarning(tableName, rowCount);
  if (rowWarn) {
    warning = rowWarn.message;
  }

  // Write Parquet to DuckDB virtual filesystem
  await withDuckDBConnection(db, async (conn) => {
    await conn.query(
      `COPY ${quoteIdentifier(tableName)} TO ${quoteStringLiteral(parquetFileName)} (FORMAT parquet)`
    );
  });

  // Read the Parquet buffer from virtual FS
  const buffer: Uint8Array = await db.copyFileToBuffer(parquetFileName);

  // Clean up virtual filesystem
  await db.dropFile(parquetFileName);

  // Store in IndexedDB
  await idbSet(`db-parquet:${tableName}`, buffer);

  // Update db-meta
  const meta: DatabaseMeta = (await idbGet("db-meta")) ?? {
    savedAt: "",
    tableNames: [],
  };
  if (!meta.tableNames.includes(tableName)) {
    meta.tableNames.push(tableName);
  }
  meta.savedAt = new Date().toISOString();
  await idbSet("db-meta", meta);

  return { warning };
}

/**
 * Save all tables to IndexedDB (Parquet).
 *
 * Returns summary of saved / errored tables.
 */
export async function saveAllTablesToIndexedDB(
  db: AsyncDuckDB,
  tableNames: string[]
): Promise<{
  saved: string[];
  errors: Array<{ table: string; error: string }>;
  warnings: string[];
}> {
  const saved: string[] = [];
  const errors: Array<{ table: string; error: string }> = [];
  const warnings: string[] = [];

  for (const tableName of tableNames) {
    try {
      const { warning } = await saveTableToIndexedDB(db, tableName);
      saved.push(tableName);
      if (warning) {
        warnings.push(warning);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Failed to save table "${tableName}":`, err);
      errors.push({ table: tableName, error: message });
    }
  }

  // Overwrite db-meta with the exact set of successfully saved tables
  const meta: DatabaseMeta = {
    savedAt: new Date().toISOString(),
    tableNames: saved,
  };
  await idbSet("db-meta", meta);

  return { saved, errors, warnings };
}

// ── Restore ─────────────────────────────────────────────────────────────────

/**
 * Restore all tables from IndexedDB on page load.
 *
 * For each table in db-meta:
 *  1. Read Parquet buffer from IndexedDB
 *  2. Register it with DuckDB via registerFileBuffer
 *  3. CREATE TABLE ... AS SELECT * FROM read_parquet(...)
 *
 * Returns the count and names of successfully restored tables.
 */
export async function restoreDatabaseFromIndexedDB(
  db: AsyncDuckDB
): Promise<{ restoredCount: number; tableNames: string[] }> {
  const meta: DatabaseMeta | undefined = await idbGet("db-meta");
  if (!meta || !meta.tableNames || meta.tableNames.length === 0) {
    return { restoredCount: 0, tableNames: [] };
  }

  const restored: string[] = [];

  for (const tableName of meta.tableNames) {
    const parquetFileName = `${tableName}.parquet`;

    try {
      const buffer: Uint8Array | undefined = await idbGet(
        `db-parquet:${tableName}`
      );
      if (!buffer) {
        console.warn(
          `Parquet buffer not found for table "${tableName}", skipping`
        );
        continue;
      }

      // Register Parquet buffer with DuckDB
      await db.registerFileBuffer(parquetFileName, buffer);

      // Create the table
      await withDuckDBConnection(db, async (conn) => {
        await conn.query(
          `CREATE OR REPLACE TABLE ${quoteIdentifier(tableName)} AS SELECT * FROM read_parquet(${quoteStringLiteral(parquetFileName)})`
        );
      });

      restored.push(tableName);
    } catch (err) {
      console.error(`Failed to restore table "${tableName}":`, err);
    } finally {
      try {
        await db.dropFile(parquetFileName);
      } catch {
        // Ignore cleanup failures for files that were not registered.
      }
    }
  }

  return { restoredCount: restored.length, tableNames: restored };
}

// ── Remove / Clear ──────────────────────────────────────────────────────────

/**
 * Remove a single table's Parquet data from IndexedDB and update db-meta.
 */
export async function removeTableFromIndexedDB(
  tableName: string
): Promise<void> {
  await idbDel(`db-parquet:${tableName}`);

  const meta: DatabaseMeta | undefined = await idbGet("db-meta");
  if (meta) {
    meta.tableNames = meta.tableNames.filter((n) => n !== tableName);
    meta.savedAt = new Date().toISOString();
    await idbSet("db-meta", meta);
  }
}

/**
 * Clear ALL persistence state from IndexedDB:
 *  - db-meta
 *  - all db-parquet:* keys
 *  - legacy file:* keys (from old useFileAdd)
 */
export async function clearAllDatabaseState(): Promise<void> {
  const allKeys = await idbKeys();

  const keysToDelete = allKeys.filter((key) => {
    const k = String(key);
    return (
      k === "db-meta" ||
      k.startsWith("db-parquet:") ||
      k.startsWith("file:")
    );
  });

  for (const key of keysToDelete) {
    await idbDel(key);
  }
}

// ── CSV conversion (moved from usePersistence.ts) ───────────────────────────

export async function exportTableToParquetBuffer(
  db: AsyncDuckDB,
  tableName: string,
  parquetFileName: string
): Promise<Uint8Array> {
  await withDuckDBConnection(db, async (conn) => {
    await conn.query(
      `COPY ${quoteIdentifier(tableName)} TO ${quoteStringLiteral(parquetFileName)} (FORMAT parquet)`
    );
  });

  try {
    return await db.copyFileToBuffer(parquetFileName);
  } finally {
    await db.dropFile(parquetFileName);
  }
}

/**
 * Convert array of objects to CSV string.
 * Handles special cases: nulls, quotes, commas, BigInts, Dates.
 */
export function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "bigint") {
    value = Number(value);
  }

  if (value instanceof Date) {
    value = value.toISOString();
  }

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertToCSV(data: any[], columnNames: string[]): string {
  const lines: string[] = [];
  lines.push(columnNames.map((name) => escapeCSVValue(name)).join(","));

  if (data.length === 0) {
    return `${lines[0]}\n`;
  }

  for (const row of data) {
    const values = columnNames.map((colName) => escapeCSVValue(row[colName]));
    lines.push(values.join(","));
  }

  return lines.join("\n");
}
