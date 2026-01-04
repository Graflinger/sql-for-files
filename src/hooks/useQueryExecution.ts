import { useState } from "react";
import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import type { QueryResult } from "../types/query";

/**
 * Apply a safety LIMIT to a SQL query if it doesn't already have one
 *
 * Strategy: Wrap the user's query in a subquery with LIMIT
 * - Works with any SELECT query, CTEs, etc.
 * - Respects user's ORDER BY
 * - Only applies if no LIMIT exists
 *
 * @param sql - The original SQL query
 * @param maxRows - Maximum number of rows to return
 * @returns Modified SQL with safety limit applied
 */
function applySafetyLimit(sql: string, maxRows: number): string {
  const trimmedSql = sql.trim();

  // Use regex to match LIMIT at end of query (case-insensitive)
  const hasLimit = /\bLIMIT\s+\d+\s*$/i.test(trimmedSql);

  if (hasLimit) {
    // User already specified a limit, respect it
    return sql;
  }

  //check for semicolon at end and remove it for processing
  sql = trimmedSql.endsWith(";") ? trimmedSql.slice(0, -1).trim() : trimmedSql;

  // Wrap in subquery with safety limit
  // This preserves any ORDER BY or other clauses in the original query
  return `SELECT * FROM (${sql}) LIMIT ${maxRows}`;
}

/**
 * useQueryExecution Hook
 *
 * Provides SQL query execution functionality.
 * Converts DuckDB's Arrow format results to JavaScript objects.
 *
 * @param db - The DuckDB instance from DuckDBContext
 * @returns {executeQuery, executing, result, error}
 */
export function useQueryExecution(db: AsyncDuckDB | null) {
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Execute a SQL query
   *
   * Process:
   * 1. Connect to database
   * 2. Execute query (returns Apache Arrow Table)
   * 3. Convert Arrow format to JavaScript objects
   * 4. Return results with metadata
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

      // Apply safety LIMIT if query doesn't already have one
      const finalSql = applySafetyLimit(sql, 1000);

      // Execute the query
      // Returns an Apache Arrow Table (columnar data format)
      const arrowResult = await conn.query(finalSql);

      // Convert Arrow table to JavaScript objects
      // Arrow is efficient for large datasets but we need plain objects for display
      const data = arrowResult.toArray().map((row: any) => {
        const obj: any = {};
        // Iterate through each column and extract the value
        arrowResult.schema.fields.forEach((field: any) => {
          obj[field.name] = row[field.name];
        });
        return obj;
      });

      // Extract column names from Arrow schema
      const columns = arrowResult.schema.fields.map((f: any) => f.name);

      // Calculate execution time
      const executionTime = performance.now() - startTime;

      // Build result object
      const queryResult: QueryResult = {
        data,
        columns,
        rowCount: data.length,
        executionTime,
      };

      setResult(queryResult);
      await conn.close();

      return queryResult;
    } catch (err) {
      console.error("Query execution failed:", err);
      setError(err as Error);
      return null;
    } finally {
      setExecuting(false);
    }
  }

  return { executeQuery, executing, result, error };
}
