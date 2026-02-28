import { useState } from "react";
import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import type { QueryResult } from "../types/query";

const DISPLAY_LIMIT = 1000; // Max rows to convert to JS for UI display
const LARGE_RESULT_WARNING = 100000; // Warn if result exceeds this
const MEMORY_DANGER_THRESHOLD = 1000000; // Strong warning for very large results

interface UseQueryExecutionOptions {
  onQueryExecuted?: (params: {
    query: string;
    status: 'success' | 'error';
    rowCount?: number;
    executionTime?: number;
    error?: string;
  }) => void;
}

/**
 * useQueryExecution Hook
 *
 * Provides SQL query execution functionality.
 * Keeps full Arrow result for efficient exports, but only converts
 * first 1000 rows to JavaScript objects for UI display.
 *
 * @param db - The DuckDB instance from DuckDBContext
 * @param options - Optional configuration including history callback
 * @returns {executeQuery, executing, result, error}
 */
export function useQueryExecution(db: AsyncDuckDB | null, options?: UseQueryExecutionOptions) {
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Execute a SQL query
   *
   * Process:
   * 1. Connect to database
   * 2. Execute query (returns Apache Arrow Table)
   * 3. Keep full Arrow table for exports
   * 4. Convert only first 1000 rows to JavaScript objects for UI
   * 5. Return results with metadata
   */
  async function executeQuery(sql: string): Promise<QueryResult | null> {
    if (!db) throw new Error("Database not initialized");

    setExecuting(true);
    setError(null);
    setResult(null);

    const startTime = performance.now();

    try {
      // Create a database connection
      const conn = await db.connect();

      // Execute the query without automatic limiting
      // Returns an Apache Arrow Table (columnar data format)
      const arrowResult = await conn.query(sql);

      // Get actual row count from Arrow result
      const actualRowCount = arrowResult.numRows;

      // Safety check: Warn about very large results
      if (actualRowCount > MEMORY_DANGER_THRESHOLD) {
        console.warn(
          `⚠️ Query returned ${actualRowCount.toLocaleString()} rows. ` +
          `This may cause memory issues. Consider adding a LIMIT clause.`
        );
      } else if (actualRowCount > LARGE_RESULT_WARNING) {
        console.warn(
          `Query returned ${actualRowCount.toLocaleString()} rows. ` +
          `Only first ${DISPLAY_LIMIT} will be displayed. CSV export will include all data.`
        );
      }

      // Only convert first DISPLAY_LIMIT rows to JavaScript objects for UI
      const rowsToDisplay = Math.min(DISPLAY_LIMIT, actualRowCount);
      const displaySlice = arrowResult.slice(0, rowsToDisplay);

      const data = displaySlice.toArray().map((row) => {
        const obj: Record<string, unknown> = {};
        // Iterate through each column and extract the value
        arrowResult.schema.fields.forEach((field: { name: string }) => {
          obj[field.name] = row[field.name];
        });
        return obj;
      });

      // Extract column names from Arrow schema
      const columns = arrowResult.schema.fields.map((f: { name: string }) => f.name);

      // Calculate execution time
      const executionTime = performance.now() - startTime;

      // Build result object
      const queryResult: QueryResult = {
        data,
        columns,
        rowCount: actualRowCount,           // Full count
        displayRowCount: rowsToDisplay,     // What's actually in data array
        executionTime,
        arrowTable: arrowResult,            // Keep full Arrow table for exports
        wasTruncated: actualRowCount > DISPLAY_LIMIT,
      };

      setResult(queryResult);
      await conn.close();

      // Notify callback of successful execution (for history)
      if (options?.onQueryExecuted) {
        options.onQueryExecuted({
          query: sql,
          status: 'success',
          rowCount: actualRowCount,
          executionTime,
        });
      }

      return queryResult;
    } catch (err) {
      console.error("Query execution failed:", err);
      const errorObj = err as Error;
      setError(errorObj);

      // Notify callback of failed execution (for history)
      if (options?.onQueryExecuted) {
        options.onQueryExecuted({
          query: sql,
          status: 'error',
          error: errorObj.message,
        });
      }

      return null;
    } finally {
      setExecuting(false);
    }
  }

  return { executeQuery, executing, result, error };
}
