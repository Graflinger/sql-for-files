import { DuckDBProvider, useDuckDBContext } from "../contexts/DuckDBContext";
import FileUploader from "../components/FileUploader/FileUploader";
import SQLEditor from "../components/SQLEditor/SQLEditor";
import TableList from "../components/DatabaseManager/TableList";
import QueryResults from "../components/QueryResults/QueryResults";
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
    <div className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-8">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - File Upload + Tables */}
        <div className="lg:col-span-1 space-y-6">
          {/* File Upload Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 p-2">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-bold text-slate-800">Upload Data</h2>
            </div>
            <div className="mb-2 text-sm text-slate-600">
              <p>
                Your data never leaves your device, everything is done inside
                your browser
              </p>
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
        <div className="lg:col-span-2">
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
          <div className="gap-6 mt-6">
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
export default function Home() {
  return (
    <DuckDBProvider>
      <HomeContent />
    </DuckDBProvider>
  );
}
