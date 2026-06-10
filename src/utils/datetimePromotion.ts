import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";

import { quoteIdentifier } from "./sql";

type DuckDBConnection = Awaited<ReturnType<AsyncDuckDB["connect"]>>;

interface ColumnInfo {
  name: string;
  type: string;
}

/**
 * Promote VARCHAR columns to TIMESTAMP when every non-null value parses cleanly.
 *
 * DuckDB-WASM cannot import ISO-8601 values ending in "Z" as TIMESTAMP WITH TIME
 * ZONE, so the default import keeps such columns as VARCHAR to avoid crashing.
 * This helper runs after the table is created and, for each VARCHAR column,
 * attempts a "try TIMESTAMP, otherwise keep VARCHAR" promotion:
 *
 * - A column is promoted only when it has at least one non-null value AND every
 *   non-null value casts successfully via TRY_CAST(... AS TIMESTAMP). Genuine
 *   text columns (any non-castable value) and all-null columns are left as-is.
 * - Columns named in `skipColumns` (explicit user type overrides) are never
 *   touched, so an intentional VARCHAR choice is respected.
 *
 * Returns the list of column names that were promoted to TIMESTAMP.
 */
export async function promoteDatetimeColumns(
  conn: DuckDBConnection,
  tableName: string,
  skipColumns: Iterable<string> = []
): Promise<string[]> {
  const skip = new Set<string>(skipColumns);
  const quotedTable = quoteIdentifier(tableName);

  const describeResult = await conn.query(`DESCRIBE ${quotedTable}`);
  const describeRows = describeResult.toArray() as Array<
    Record<string, unknown>
  >;

  const candidates: ColumnInfo[] = describeRows
    .map((row) => ({
      name: String(row.column_name ?? ""),
      type: String(row.column_type ?? "").toUpperCase(),
    }))
    .filter((column) => column.type === "VARCHAR" && !skip.has(column.name));

  if (candidates.length === 0) return [];

  // Single scan that, per candidate column, counts non-null values and how many
  // of those fail to parse as TIMESTAMP.
  const probeSelects = candidates.flatMap((column, index) => {
    const quotedColumn = quoteIdentifier(column.name);
    return [
      `COUNT(*) FILTER (WHERE ${quotedColumn} IS NOT NULL) AS nn_${index}`,
      `COUNT(*) FILTER (WHERE ${quotedColumn} IS NOT NULL AND TRY_CAST(${quotedColumn} AS TIMESTAMP) IS NULL) AS fail_${index}`,
    ];
  });

  const probeResult = await conn.query(
    `SELECT ${probeSelects.join(", ")} FROM ${quotedTable}`
  );
  const probeRow = (probeResult.toArray()[0] ?? {}) as Record<string, unknown>;

  const promoted: string[] = [];

  for (let index = 0; index < candidates.length; index++) {
    const nonNull = toNumber(probeRow[`nn_${index}`]);
    const failed = toNumber(probeRow[`fail_${index}`]);

    if (nonNull > 0 && failed === 0) {
      const column = candidates[index].name;
      const quotedColumn = quoteIdentifier(column);
      await conn.query(
        `ALTER TABLE ${quotedTable} ALTER COLUMN ${quotedColumn} SET DATA TYPE TIMESTAMP USING TRY_CAST(${quotedColumn} AS TIMESTAMP)`
      );
      promoted.push(column);
    }
  }

  return promoted;
}

/** DuckDB returns COUNT(*) as BigInt; normalize counts to a plain number. */
function toNumber(value: unknown): number {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  return Number(value ?? 0);
}
