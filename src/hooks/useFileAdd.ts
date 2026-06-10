import { useState } from "react";

import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import { set as idbSet } from "idb-keyval";

import {
  defaultTableNameFromFile,
  sanitizeTableName,
} from "../utils/tableName";
import { withDuckDBConnection } from "../utils/duckdb";
import {
  buildCsvOptionsSql,
  type CsvAddOptions,
} from "../utils/csvOptions";
import { promoteDatetimeColumns } from "../utils/datetimePromotion";
import { quoteIdentifier, quoteStringLiteral } from "../utils/sql";

// Track progress for each file being added
interface AddProgress {
  fileName: string;
  progress: number; // 0-100
  status: "adding" | "processing" | "done" | "error";
  error?: string;
}

/**
 * useFileAdd Hook
 *
 * Provides file add functionality with progress tracking.
 * Handles CSV, JSON, and Parquet files.
 *
 * @param db - The DuckDB instance from DuckDBContext
 * @returns {addFile, adding, progress, clearProgress}
 */
interface AddOptions {
  tableNameOverride?: string;
  csvOptions?: CsvAddOptions;
}

export function useFileAdd(db: AsyncDuckDB | null) {
  const [adding, setAdding] = useState(false);
  const [progress, setProgress] = useState<AddProgress[]>([]);

  /**
   * Add a file and create a table in DuckDB
   *
   * Process:
   * 1. Store file in IndexedDB for persistence
   * 2. Register file buffer with DuckDB
   * 3. Create table using appropriate read_*_auto function
   */
  async function addFile(file: File, options?: AddOptions): Promise<string> {
    if (!db) throw new Error("Database not initialized");

    const fileName = file.name;
    const defaultTableName = defaultTableNameFromFile(fileName);
    const tableName = options?.tableNameOverride
      ? sanitizeTableName(options.tableNameOverride)
      : defaultTableName;

    // Initialize progress tracking
    setProgress((prev) => [
      ...prev,
      {
        fileName,
        progress: 0,
        status: "adding",
      },
    ]);

    try {
      setAdding(true);

      // Step 1: Store original file in IndexedDB
      // This allows us to persist files across page refreshes
      await idbSet(`file:${fileName}`, file);

      // Step 2: Read file as ArrayBuffer (raw bytes)
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Step 3: Register file with DuckDB
      // This makes the file available to DuckDB's SQL functions
      await db.registerFileBuffer(fileName, uint8Array);

      // Update progress: file registered
      setProgress((prev) =>
        prev.map((p) =>
          p.fileName === fileName
            ? { ...p, progress: 50, status: "processing" }
            : p
        )
      );

      // Step 4: Create table based on file type
      if (fileName.endsWith(".csv")) {
        const csvOptions = options?.csvOptions;
        const csvOptionsSql = buildCsvOptionsSql(csvOptions);
        // read_csv_auto automatically detects delimiters, headers, and types.
        await withDuckDBConnection(db, async (conn) => {
          await conn.query(`
            CREATE TABLE ${quoteIdentifier(tableName)} AS
            SELECT * FROM read_csv_auto(${quoteStringLiteral(
              fileName
            )}${csvOptionsSql})
          `);
          // Convenience: ISO datetimes ending in "Z" import as VARCHAR by
          // default to avoid TIMESTAMP WITH TIME ZONE failures. Try promoting
          // such text columns to TIMESTAMP when every value parses, otherwise
          // leave them as VARCHAR. Opt-out via csvOptions.autoDetectDatetime,
          // and explicit per-column overrides are always respected.
          if (csvOptions?.autoDetectDatetime !== false) {
            await promoteDatetimeColumns(
              conn,
              tableName,
              Object.keys(csvOptions?.types ?? {})
            );
          }
        });
      } else if (fileName.endsWith(".json")) {
        // read_json_auto handles both JSON arrays and newline-delimited JSON
        await withDuckDBConnection(db, async (conn) => {
          await conn.query(`
            CREATE TABLE ${quoteIdentifier(tableName)} AS
            SELECT * FROM read_json_auto(${quoteStringLiteral(fileName)})
          `);
        });
      } else if (fileName.endsWith(".parquet")) {
        // Parquet is a columnar format (like CSV but binary and compressed)
        await withDuckDBConnection(db, async (conn) => {
          await conn.query(`
            CREATE TABLE ${quoteIdentifier(tableName)} AS
            SELECT * FROM read_parquet(${quoteStringLiteral(fileName)})
          `);
        });
      } else {
        throw new Error(`Unsupported file type: ${fileName}`);
      }

      // Update progress: table created successfully
      setProgress((prev) =>
        prev.map((p) =>
          p.fileName === fileName ? { ...p, progress: 100, status: "done" } : p
        )
      );

      return tableName;
    } catch (error) {
      // Update progress with error
      setProgress((prev) =>
        prev.map((p) =>
          p.fileName === fileName
            ? { ...p, status: "error", error: (error as Error).message }
            : p
        )
      );
      throw error;
    } finally {
      try {
        await db.dropFile(fileName);
      } catch {
        // Ignore cleanup failures when the virtual file was never registered.
      }
      setAdding(false);
    }
  }

  /**
   * Clear the progress list
   * Useful after all additions are complete
   */
  function clearProgress() {
    setProgress([]);
  }

  return { addFile, adding, progress, clearProgress };
}
