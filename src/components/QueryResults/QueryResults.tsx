import { useState } from "react";
import type { QueryResult } from "../../types/query";

interface QueryResultsProps {
  result: QueryResult | null;
  error: Error | null;
  /** When true, removes card wrapper for IDE embedding */
  embedded?: boolean;
}

type SortDirection = "asc" | "desc" | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

/**
 * Format a value for CSV output
 */
function formatCSVValue(value: unknown): string {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }

  // Convert to string
  const stringValue = String(value);

  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert Arrow table directly to CSV format
 * More efficient than converting through JS objects
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- DuckDB-WASM bundles its own Apache Arrow; no importable Table type
function convertArrowToCSV(arrowTable: any, columns: string[]): string {
  if (!arrowTable || arrowTable.numRows === 0) {
    return '';
  }

  // Create header row
  const headers = columns.join(',');

  // Create data rows by iterating through Arrow table
  const rows: string[] = [];
  for (let i = 0; i < arrowTable.numRows; i++) {
    const rowValues = columns.map(col => {
      const columnVector = arrowTable.getChild(col);
      const value = columnVector?.get(i);
      return formatCSVValue(value);
    });
    rows.push(rowValues.join(','));
  }

  return [headers, ...rows].join('\n');
}

/**
 * Download CSV file from full Arrow result
 */
function downloadCSV(result: QueryResult) {
  // Use Arrow table directly for more efficient CSV generation
  // This includes ALL rows, not just the displayed ones
  const csv = convertArrowToCSV(result.arrowTable, result.columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  // Create download link
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `query_results_${new Date().getTime()}.csv`);
  link.style.visibility = 'hidden';

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

export default function QueryResults({ result, error, embedded = false }: QueryResultsProps) {
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null });

  // Sort data based on current sort state
  const getSortedData = () => {
    if (!result || !sortState.column || !sortState.direction) {
      return result?.data || [];
    }

    const sorted = [...result.data].sort((a, b) => {
      const aVal = a[sortState.column!];
      const bVal = b[sortState.column!];

      // Handle null values
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      // Compare values
      if (aVal < bVal) return sortState.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortState.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const handleSort = (column: string) => {
    setSortState((prev) => {
      if (prev.column === column) {
        // Cycle through: asc -> desc -> null
        if (prev.direction === "asc") return { column, direction: "desc" };
        if (prev.direction === "desc") return { column: null, direction: null };
      }
      return { column, direction: "asc" };
    });
  };

  const sortedData = getSortedData();

  const wrapperClass = embedded
    ? "h-full overflow-auto relative"
    : "bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-xl shadow-lg p-4 sm:p-6";

  return (
    <div className={wrapperClass}>
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-600"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-800 mb-1">
                Query Error
              </h4>
              <p className="text-sm text-red-700 font-mono bg-red-100/50 px-3 py-2 rounded border border-red-200">
                {error.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success State with Results */}
      {!error && result && (
        <>
          {/* Header - Only show in non-embedded mode, or simplified in embedded */}
          {embedded ? null : (
            // Full header for standalone mode
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Query Results
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                  {result.rowCount.toLocaleString()} {result.rowCount === 1 ? "row" : "rows"}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                  {result.executionTime.toFixed(2)}ms
                </span>
                {result.rowCount > 0 && (
                  <button
                    onClick={() => downloadCSV(result)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                    title={result.wasTruncated ? `Export all ${result.rowCount.toLocaleString()} rows as CSV` : "Export results as CSV"}
                  >
                    <svg
                      className="w-4 h-4"
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Export CSV {result.wasTruncated && `(${result.rowCount.toLocaleString()} rows)`}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Truncation Warning */}
          {result.wasTruncated && (
            <div className="mb-5 bg-amber-50 border border-amber-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-amber-600"
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-800 mb-1">
                    Results Truncated for Display
                  </h4>
                  <p className="text-sm text-amber-700">
                    Showing <strong>{result.displayRowCount.toLocaleString()}</strong> of <strong>{result.rowCount.toLocaleString()}</strong> rows for optimal performance.
                    CSV export will include all {result.rowCount.toLocaleString()} rows.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Results Table */}
          {result.rowCount > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                    {result.columns.map((col) => (
                      <th
                        key={col}
                        onClick={() => handleSort(col)}
                        className="px-3 py-1.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-slate-300 cursor-pointer hover:bg-slate-200 transition-colors select-none group"
                      >
                        <div className="flex items-center gap-2">
                          <span>{col}</span>
                          {sortState.column === col ? (
                            <svg
                              className={`w-4 h-4 text-blue-600 transition-transform ${
                                sortState.direction === "desc" ? "rotate-180" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                              />
                            </svg>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {sortedData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      {result.columns.map((col) => (
                        <td
                          key={col}
                          className="px-3 py-1.5 text-sm text-slate-800 max-w-xs truncate"
                          title={row[col] !== null && row[col] !== undefined ? String(row[col]) : "null"}
                        >
                          {row[col] !== null && row[col] !== undefined ? (
                            String(row[col])
                          ) : (
                            <span className="text-slate-400 italic font-medium">
                              null
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              {embedded && (
                <button
                  onClick={() => downloadCSV(result)}
                  className="sticky bottom-2 float-right mr-2 mb-2 flex items-center justify-center w-8 h-8 bg-blue-600/80 backdrop-blur-sm text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                  title={result.wasTruncated ? `Export all ${result.rowCount.toLocaleString()} rows as CSV` : "Export CSV"}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
                  width="32"
                  height="32"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-slate-600 font-medium">
                Query executed successfully but returned no rows.
              </p>
            </div>
          )}
        </>
      )}

      {/* Empty State - No Query Executed Yet */}
      {!error && !result && (
        embedded ? (
          // Simplified empty state for embedded mode
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-500">
              Run a query to see results here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono">Ctrl+Enter</kbd>
            </p>
          </div>
        ) : (
          // Full empty state for standalone mode
          <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-blue-600"
                width="40"
                height="40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Ready to Execute
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Write your SQL query above and press <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono">Ctrl+Enter</kbd> to see results.
            </p>

            {/* Sample Queries */}
            <div className="max-w-2xl mx-auto mt-8">
              <h4 className="text-sm font-semibold text-slate-600 mb-3 text-left">Example Queries:</h4>
              <div className="space-y-2 text-left">
                <div className="bg-white border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 mb-1">Basic select with limit</p>
                      <code className="text-xs font-mono text-slate-800 bg-slate-50 px-2 py-1 rounded block overflow-x-auto">SELECT * FROM your_table LIMIT 10</code>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 mb-1">Aggregation with grouping</p>
                      <code className="text-xs font-mono text-slate-800 bg-slate-50 px-2 py-1 rounded block overflow-x-auto">SELECT category, COUNT(*) as count FROM your_table GROUP BY category</code>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 mb-1">Join multiple tables</p>
                      <code className="text-xs font-mono text-slate-800 bg-slate-50 px-2 py-1 rounded block overflow-x-auto">SELECT * FROM table1 JOIN table2 ON table1.id = table2.table1_id</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
