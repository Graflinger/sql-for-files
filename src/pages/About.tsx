/**
 * About Page
 *
 * Information about SQL for Files application
 */
export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 p-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6">
            About SQL for Files
          </h1>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-700 mb-4">
              SQL for Files is a powerful browser-based tool that allows you to query CSV, JSON, and Parquet files using SQL — all without sending your data to any server.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">How It Works</h2>
            <p className="text-slate-700 mb-4">
              This application uses DuckDB WASM to provide a full SQL database engine that runs entirely in your browser. Your files are processed locally, ensuring complete privacy and security.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">Features</h2>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Query CSV, JSON, and Parquet files with standard SQL</li>
              <li>Complete data privacy - nothing leaves your browser</li>
              <li>Fast in-memory processing with DuckDB</li>
              <li>Modern SQL editor with syntax highlighting</li>
              <li>Support for complex queries and joins</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">Technology Stack</h2>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>React + TypeScript</li>
              <li>DuckDB WASM</li>
              <li>Monaco Editor</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
