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
              <li>
                Expand the table list card to view the schema (column names and
                types) for each table
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
                Table names are automatically derived from your file names. If a
                file name starts with a number, the prefix 'table_' is
                automatically added (e.g., '2023_sales.csv' becomes
                'table_2023_sales')
              </li>
              <li>
                Query results are limited to displaying 1000 rows in the UI for
                performance, but CSV exports include all rows from your query
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
              Memory & Performance Limits
            </h2>
            <p className="text-slate-700 mb-4">
              SQL for Files runs entirely in your browser for privacy and
              convenience, but this comes with memory constraints:
            </p>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
              <h4 className="text-lg font-semibold text-amber-800 mb-2">
                Browser Memory Limits
              </h4>
              <p className="text-amber-900 mb-2">
                Browsers have hard memory limits (typically 4GB), with a
                practical working limit of 2-3GB for data processing.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">
              How We Handle Large Results
            </h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>
                <strong>Display Optimization:</strong> Only the first 1,000 rows
                are converted to JavaScript objects and displayed in the table.
                This keeps the UI responsive even with large query results.
              </li>
              <li>
                <strong>Full Data Export:</strong> When you export to CSV, all
                rows from your query are included, not just the displayed 1,000.
              </li>
              <li>
                <strong>Automatic Warnings:</strong> The console will warn you
                when results exceed 100,000 rows and alert you about potential
                memory issues when results exceed 1,000,000 rows.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">
              Best Practices for Large Files
            </h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>
                <strong>Start Small:</strong> Test your queries with{" "}
                <code className="px-2 py-1 bg-slate-200 rounded text-sm font-mono">
                  LIMIT 100
                </code>{" "}
                first to verify correctness before running on the full dataset
              </li>
              <li>
                <strong>Use Aggregations:</strong> Instead of retrieving all
                rows, use{" "}
                <code className="px-2 py-1 bg-slate-200 rounded text-sm font-mono">
                  GROUP BY
                </code>
                ,{" "}
                <code className="px-2 py-1 bg-slate-200 rounded text-sm font-mono">
                  COUNT
                </code>
                , and other aggregations to summarize data
              </li>
              <li>
                <strong>Filter Early:</strong> Use{" "}
                <code className="px-2 py-1 bg-slate-200 rounded text-sm font-mono">
                  WHERE
                </code>{" "}
                clauses to reduce the result set before processing
              </li>
              <li>
                <strong>Parquet Format:</strong> For files over 100MB, use
                Parquet format which is more memory-efficient than CSV or JSON
              </li>
              <li>
                <strong>Watch File Sizes:</strong> Files over 200MB may cause
                performance issues. Consider splitting them or using aggregations
              </li>
            </ul>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <h4 className="text-lg font-semibold text-blue-800 mb-2">
                Why These Limits Exist
              </h4>
              <p className="text-blue-900">
                Unlike server-based SQL tools, browser applications cannot use
                disk storage for temporary data ("spilling to disk"). All query
                processing must happen in RAM. This makes the tool more private
                and convenient (no server needed!), but means very large datasets
                may need to be processed in chunks or on a traditional database
                server.
              </p>
            </div>
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
