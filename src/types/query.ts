// Shape of query results returned to UI
export interface QueryResult {
  data: Record<string, unknown>[];  // Rows as JavaScript objects (limited for UI performance)
  columns: string[];                 // Column names
  rowCount: number;                  // Total number of rows in full result
  displayRowCount: number;           // Number of rows actually displayed in data array
  executionTime: number;             // Query execution time in milliseconds
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- DuckDB-WASM bundles its own Apache Arrow; no shared Table type available
  arrowTable: any;                   // Full Arrow table for efficient exports
  wasTruncated: boolean;             // True if results were limited for display
}
