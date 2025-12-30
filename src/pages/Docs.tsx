/**
 * Documentation Page
 *
 * User guide and documentation for SQL for Files
 */
export default function Docs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 p-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6">
            Documentation
          </h1>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">
              Getting Started
            </h2>
            <p className="text-slate-700 mb-4">
              Follow these simple steps to start querying your files:
            </p>
            <ol className="list-decimal list-inside text-slate-700 space-y-3 mb-6">
              <li>
                Upload your CSV, JSON, or Parquet files using the file uploader
              </li>
              <li>
                Your files will automatically be converted to database tables
              </li>
              <li>Write SQL queries in the editor</li>
              <li>Click "Run Query" or press Ctrl+Enter to execute</li>
              <li>View your results in the table below</li>
            </ol>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">
              Supported File Formats
            </h2>

            <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">
              CSV Files
            </h3>
            <p className="text-slate-700 mb-4">
              Comma-separated values files are automatically parsed. The first
              row is used as column names.
            </p>

            <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">
              JSON Files
            </h3>
            <p className="text-slate-700 mb-4">
              Both line-delimited JSON (NDJSON) and standard JSON arrays are
              supported.
            </p>

            <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">
              Parquet Files
            </h3>
            <p className="text-slate-700 mb-4">
              Apache Parquet files are natively supported for efficient columnar
              data processing.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">
              Keyboard Shortcuts
            </h2>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>
                <kbd className="px-2 py-1 bg-slate-200 rounded text-sm font-mono">
                  Ctrl+Enter
                </kbd>{" "}
                - Execute query
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-200 rounded text-sm font-mono">
                  Ctrl+/
                </kbd>{" "}
                - Toggle comment (in editor)
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">
              Tips & Best Practices
            </h2>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>
                Table names are automatically derived from your file names
              </li>
              <li>
                All processing happens in your browser - your data stays private
              </li>
              <li>
                Use LIMIT to preview large datasets before running complex
                queries
              </li>
              <li>
                DuckDB supports advanced SQL features like window functions and
                CTEs
              </li>
            </ul>
            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">
              SQL Examples
            </h2>

            <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">
              Basic Query
            </h3>
            <pre className="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4">
              <code>{`SELECT * FROM your_table LIMIT 10;`}</code>
            </pre>

            <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">
              Filtering Data
            </h3>
            <pre className="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4">
              <code>{`SELECT name, age, city
FROM users
WHERE age > 25
ORDER BY name;`}</code>
            </pre>

            <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">
              Aggregations
            </h3>
            <pre className="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4">
              <code>{`SELECT
  country,
  COUNT(*) as total_users,
  AVG(age) as avg_age
FROM users
GROUP BY country
ORDER BY total_users DESC;`}</code>
            </pre>

            <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">
              Joining Tables
            </h3>
            <pre className="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4">
              <code>{`SELECT
  o.order_id,
  c.customer_name,
  o.total_amount
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.total_amount > 100;`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
