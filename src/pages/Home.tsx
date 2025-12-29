import { DuckDBProvider, useDuckDBContext } from "../contexts/DuckDBContext";
import FileUploader from "../components/FileUploader/FileUploader";
import SQLEditor from "../components/SQLEditor/SQLEditor";
import TableList from "../components/DatabaseManager/TableList";
import { useQueryExecution } from "../hooks/useQueryExecution";

/**
 * Home Page Content
 *
 * Layout:
 * - Top Grid: Left (File uploader + Table list) | Right (SQL Editor)
 * - Bottom: Query results (full width)
 */
function HomeContent() {
  const { db } = useDuckDBContext();
  const { executeQuery, executing, result, error } = useQueryExecution(db);

  const handleExecute = async (sql: string) => {
    await executeQuery(sql);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Left Column - File Upload + Tables */}
        <div className="col-span-1 space-y-6">
          {/* File Upload Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 p-6">
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-lg font-bold text-slate-800">Upload Data</h2>
            </div>
            <FileUploader />
          </div>

          {/* Table List Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 p-5">
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-lg font-bold text-slate-800">Tables</h2>
            </div>
            <TableList />
          </div>
        </div>

        {/* Right Column - SQL Editor */}
        <div className="col-span-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 p-6">
            <div className="flex items-center gap-2 mb-5">
              <svg
                className="w-5 h-5 text-blue-600"
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
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h2 className="text-lg font-bold text-slate-800">SQL Query</h2>
            </div>
            <SQLEditor
              onExecute={handleExecute}
              executing={executing}
              disabled={!db}
            />
          </div>
        </div>
      </div>

      {/* Query Results Section - Full Width Below Grid */}
      {result && (
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-xl shadow-lg p-6">
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
                {result.rowCount} {result.rowCount === 1 ? "row" : "rows"}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                {result.executionTime.toFixed(2)}ms
              </span>
            </div>
          </div>

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
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-5 shadow-sm">
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
    </div>
  );
}

/**
 * Home Page
 */
export default function Home() {
  return (
    <DuckDBProvider>
      <HomeContent />
    </DuckDBProvider>
  );
}
