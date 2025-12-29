import { useState } from 'react';
import { AsyncDuckDB } from '@duckdb/duckdb-wasm';
import { Table } from 'apache-arrow';

// Shape of query results returned to UI
interface QueryResult {
  data: any[];           // Rows as JavaScript objects
  columns: string[];     // Column names
  rowCount: number;      // Number of rows returned
  executionTime: number; // Query execution time in milliseconds
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
    if (!db) throw new Error('Database not initialized');

    setExecuting(true);
    setError(null);

    const startTime = performance.now();

    try {
      // Create a database connection
      const conn = await db.connect();

      // Execute the query
      // Returns an Apache Arrow Table (columnar data format)
      const arrowResult: Table = await conn.query(sql);

      // Convert Arrow table to JavaScript objects
      // Arrow is efficient for large datasets but we need plain objects for display
      const data = arrowResult.toArray().map(row => {
        const obj: any = {};
        // Iterate through each column and extract the value
        arrowResult.schema.fields.forEach(field => {
          obj[field.name] = row[field.name];
        });
        return obj;
      });

      // Extract column names from Arrow schema
      const columns = arrowResult.schema.fields.map(f => f.name);

      // Calculate execution time
      const executionTime = performance.now() - startTime;

      // Build result object
      const queryResult: QueryResult = {
        data,
        columns,
        rowCount: data.length,
        executionTime
      };

      setResult(queryResult);
      await conn.close();

      return queryResult;

    } catch (err) {
      console.error('Query execution failed:', err);
      setError(err as Error);
      return null;
    } finally {
      setExecuting(false);
    }
  }

  return { executeQuery, executing, result, error };
}
