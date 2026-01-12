import { DuckDBProvider, useDuckDBContext } from "../contexts/DuckDBContext";
import FileUploader from "../components/FileUploader/FileUploader";
import SQLEditor from "../components/SQLEditor/SQLEditor";
import TableList from "../components/DatabaseManager/TableList";
import QueryResults from "../components/QueryResults/QueryResults";
import { useQueryExecution } from "../hooks/useQueryExecution";
import { useQueryHistory } from "../hooks/useQueryHistory";

/**
 * Home Page Content
 *
 * Layout:
 * - Top Grid: Left (File uploader + Table list) | Right (SQL Editor)
 * - Bottom: Query results (full width)
 */
function HomeContent() {
  const { db } = useDuckDBContext();
  const { addQuery } = useQueryHistory();

  const { executeQuery, executing, result, error } = useQueryExecution(db, {
    onQueryExecuted: async (params) => {
      await addQuery(params);
    },
  });

  const handleExecute = async (sql: string) => {
    await executeQuery(sql);
  };

  const handlePreviewTable = async (tableName: string) => {
    await executeQuery(`SELECT * FROM ${tableName} LIMIT 10`);
  };

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 sm:pt-6 sm:px-6 lg:pt-8 lg:px-8">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - File Upload + Tables */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* File Upload Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">Upload Data</h2>
            </div>
            <div className="mb-3 text-xs sm:text-sm text-slate-600">
              <p>
                Your data never leaves your device, everything is done inside
                your browser
              </p>
            </div>
            <FileUploader />
          </div>

          {/* Table List Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">Tables</h2>
            </div>
            <TableList onPreviewTable={handlePreviewTable} />
          </div>
        </div>

        {/* Right Column - SQL Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0"
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
              <h2 className="text-base sm:text-lg font-bold text-slate-800">SQL Query</h2>
            </div>
            <SQLEditor
              onExecute={handleExecute}
              executing={executing}
              disabled={!db}
            />
          </div>
          <div className="mt-4 sm:mt-6">
            <QueryResults result={result} error={error} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Home Page
 */
export default function SqlEditor() {
  return (
    <DuckDBProvider>
      <HomeContent />
    </DuckDBProvider>
  );
}
