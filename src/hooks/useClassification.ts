import { useState, useEffect, useRef } from "react";
import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";

import type {
  ClassificationResult,
  ColumnClassification,
  ColumnCategory,
  NumericStats,
  DateStats,
  StringStats,
  BooleanStats,
} from "../types/classification";

const TEMP_TABLE_PREFIX = "__classification_temp";

// Module-level counter ensures unique table names across mount/unmount cycles.
// Without this, a remounted component's computation and the old unmounted
// computation would collide on the same table name.
let globalComputationId = 0;

/**
 * Map an Arrow field type name to a classification category.
 *
 * Arrow type names surfaced by DuckDB-WASM follow the pattern
 * "Int32", "Float64", "Utf8", "Timestamp", "Date", "Bool", etc.
 */
function categorizeArrowType(typeName: string): ColumnCategory {
  const t = typeName.toLowerCase();

  // Numeric types
  if (
    t.startsWith("int") ||
    t.startsWith("uint") ||
    t.startsWith("float") ||
    t.startsWith("decimal")
  ) {
    return "numeric";
  }

  // Date / timestamp types
  if (t.startsWith("date") || t.startsWith("timestamp")) {
    return "date";
  }

  // String types
  if (t === "utf8" || t === "largeutf8") {
    return "string";
  }

  // Boolean
  if (t === "bool") {
    return "boolean";
  }

  return "other";
}

/**
 * Escape a column name for use in SQL by double-quoting it
 * and escaping any embedded double quotes.
 */
function quoteCol(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

/**
 * Build SQL select expressions for a single column based on its category.
 * Returns an array of `expression AS alias` strings.
 */
function buildColumnSQL(colName: string, category: ColumnCategory): string[] {
  const q = quoteCol(colName);

  switch (category) {
    case "numeric":
      return [
        `MIN(${q}) AS "min"`,
        `MAX(${q}) AS "max"`,
        `AVG(${q}) AS "mean"`,
        `MEDIAN(${q}) AS "median"`,
        `MODE(${q}) AS "mode"`,
        `(COUNT(*) - COUNT(${q})) AS "null_count"`,
      ];

    case "date":
      return [
        `MIN(${q})::VARCHAR AS "min"`,
        `MAX(${q})::VARCHAR AS "max"`,
        `AVG(${q})::VARCHAR AS "mean"`,
        `MEDIAN(${q})::VARCHAR AS "median"`,
        `MODE(${q})::VARCHAR AS "mode"`,
        `(COUNT(*) - COUNT(${q})) AS "null_count"`,
      ];

    case "string":
      return [
        `MIN(LENGTH(${q})) AS "min_length"`,
        `MAX(LENGTH(${q})) AS "max_length"`,
        `(COUNT(*) - COUNT(${q})) AS "null_count"`,
      ];

    case "boolean":
      return [
        `COUNT_IF(${q}) AS "true_count"`,
        `COUNT_IF(NOT ${q}) AS "false_count"`,
        `(COUNT(*) - COUNT(${q})) AS "null_count"`,
      ];

    default:
      return [];
  }
}

/**
 * Parse a DuckDB result row into the appropriate stats interface
 * for the given category.
 */
function parseStats(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: Record<string, any>,
  category: ColumnCategory
): NumericStats | DateStats | StringStats | BooleanStats | null {
  switch (category) {
    case "numeric":
      return {
        min: row.min != null ? Number(row.min) : null,
        max: row.max != null ? Number(row.max) : null,
        mean: row.mean != null ? Number(row.mean) : null,
        median: row.median != null ? Number(row.median) : null,
        mode: row.mode != null ? Number(row.mode) : null,
        nullCount: Number(row.null_count ?? 0),
      } satisfies NumericStats;

    case "date":
      return {
        min: row.min != null ? String(row.min) : null,
        max: row.max != null ? String(row.max) : null,
        mean: row.mean != null ? String(row.mean) : null,
        median: row.median != null ? String(row.median) : null,
        mode: row.mode != null ? String(row.mode) : null,
        nullCount: Number(row.null_count ?? 0),
      } satisfies DateStats;

    case "string":
      return {
        minLength: row.min_length != null ? Number(row.min_length) : null,
        maxLength: row.max_length != null ? Number(row.max_length) : null,
        nullCount: Number(row.null_count ?? 0),
      } satisfies StringStats;

    case "boolean":
      return {
        trueCount: Number(row.true_count ?? 0),
        falseCount: Number(row.false_count ?? 0),
        nullCount: Number(row.null_count ?? 0),
      } satisfies BooleanStats;

    default:
      return null;
  }
}

/**
 * useClassification Hook
 *
 * Computes per-column statistics on the full Arrow result set using DuckDB SQL.
 * Computation starts eagerly when arrowTable changes and uses a separate DuckDB
 * connection so it does not block user queries.
 *
 * Staleness guard: a counter ref tracks the current arrowTable; results from
 * outdated computations are discarded.
 *
 * @param db - The DuckDB instance from DuckDBContext
 * @param arrowTable - The full Apache Arrow table from a query result
 * @returns { classification, computing, error }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useClassification(db: AsyncDuckDB | null, arrowTable: any) {
  const [classification, setClassification] =
    useState<ClassificationResult | null>(null);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Staleness counter: incremented every time arrowTable changes
  const generationRef = useRef(0);

  useEffect(() => {
    // Increment generation so any in-flight computation becomes stale
    generationRef.current += 1;
    const thisGeneration = generationRef.current;

    // Reset state when arrowTable changes
    setClassification(null);
    setError(null);

    if (!db || !arrowTable) {
      setComputing(false);
      return;
    }

    async function compute(dbInstance: AsyncDuckDB) {
      setComputing(true);
      const startTime = performance.now();

      // Unique table name for this computation to avoid collisions
      // with in-flight computations from previous mount cycles
      globalComputationId += 1;
      const tableName = `${TEMP_TABLE_PREFIX}_${globalComputationId}`;

      try {
        // Read schema to determine column types
        const fields: Array<{ name: string; type: { toString(): string } }> =
          arrowTable.schema.fields;

        const columnMeta: Array<{
          name: string;
          category: ColumnCategory;
          typeName: string;
        }> = fields.map(
          (f: { name: string; type: { toString(): string } }) => ({
            name: f.name,
            category: categorizeArrowType(f.type.toString()),
            typeName: f.type.toString(),
          })
        );

        // Open a dedicated connection for classification
        const conn = await dbInstance.connect();

        try {
          // Drop any leftover table from a previous run, then register Arrow data
          await conn.query(`DROP TABLE IF EXISTS ${tableName}`);
          await conn.insertArrowTable(arrowTable, {
            name: tableName,
          });

          const columns: ColumnClassification[] = [];

          for (const col of columnMeta) {
            // Stale check between iterations
            if (generationRef.current !== thisGeneration) return;

            if (col.category === "other") {
              columns.push({
                columnName: col.name,
                category: col.category,
                arrowTypeName: col.typeName,
                stats: null,
              });
              continue;
            }

            const selectExprs = buildColumnSQL(col.name, col.category);
            const sql = `SELECT ${selectExprs.join(", ")} FROM ${tableName}`;
            const result = await conn.query(sql);
            const rows = result.toArray();

            if (rows.length > 0) {
              const row: Record<string, unknown> = {};
              result.schema.fields.forEach(
                (f: { name: string }) => {
                  row[f.name] = rows[0][f.name];
                }
              );

              columns.push({
                columnName: col.name,
                category: col.category,
                arrowTypeName: col.typeName,
                stats: parseStats(row, col.category),
              });
            }
          }

          // Only set results if this computation is still current
          if (generationRef.current !== thisGeneration) return;

          const computationTime = performance.now() - startTime;
          setClassification({
            columns,
            totalRows: arrowTable.numRows,
            computationTime,
          });
        } finally {
          // Always clean up: drop temp table and close connection
          try {
            await conn.query(`DROP TABLE IF EXISTS ${tableName}`);
          } catch {
            // Ignore cleanup errors
          }
          await conn.close();
        }
      } catch (err) {
        console.error("Classification computation failed:", err);
        if (generationRef.current === thisGeneration) {
          setError(err as Error);
        }
      } finally {
        if (generationRef.current === thisGeneration) {
          setComputing(false);
        }
      }
    }

    compute(db);
  }, [db, arrowTable]);

  return { classification, computing, error };
}
