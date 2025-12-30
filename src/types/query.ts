// Shape of query results returned to UI
export interface QueryResult {
  data: Record<string, unknown>[];  // Rows as JavaScript objects
  columns: string[];                 // Column names
  rowCount: number;                  // Number of rows returned
  executionTime: number;             // Query execution time in milliseconds
}
