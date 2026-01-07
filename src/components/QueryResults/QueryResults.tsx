import type { QueryResult } from "../../types/query";

interface QueryResultsProps {
  result: QueryResult | null;
  error: Error | null;
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

export default function QueryResults({ result, error }: QueryResultsProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-xl shadow-lg p-6">
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
            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                    {result.columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-slate-300"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {result.data.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      {result.columns.map((col) => (
                        <td
                          key={col}
                          className="px-4 py-3 text-sm text-slate-800 whitespace-nowrap"
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
        <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg">
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
          <p className="text-slate-500 max-w-md mx-auto">
            Write your SQL query above and click "Run Query" to see the results here.
          </p>
        </div>
      )}
    </div>
  );
}
