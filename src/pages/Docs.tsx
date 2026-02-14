import SEO from "../components/SEO/SEO";

/**
 * Documentation Page
 *
 * User guide and documentation for SQL for Files
 */
export default function Docs() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is my data really private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All data processing happens entirely in your browser using WebAssembly. Your files never leave your device.",
        },
      },
      {
        "@type": "Question",
        name: "What happens if I refresh the page?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your query history is saved locally, but added files and tables are lost on refresh unless you export your database first.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use this with Excel (.xlsx) files?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Excel files are not supported in DuckDB WASM. Convert .xlsx files to CSV before adding.",
        },
      },
      {
        "@type": "Question",
        name: "How large can my files be?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Browser memory limits typically allow 2 to 3GB of working data. Files up to 200MB generally work best.",
        },
      },
      {
        "@type": "Question",
        name: "Does this work offline?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "After the initial load, most functionality works offline. The first load requires an internet connection to download DuckDB WASM files.",
        },
      },
    ],
  };

  return (
    <>
      <SEO
        title="Documentation | SQL for Files"
        description="Learn how to add CSV, JSON, and Parquet files, run SQL queries, and export results in SQL for Files."
        canonicalPath="/docs"
        ogType="article"
        imageAlt="SQL for Files documentation"
        structuredData={faqSchema}
      />
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
                Add your CSV, JSON, or Parquet files using the file adder
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
              Query History
            </h2>
            <p className="text-slate-700 mb-4">
              SQL for Files automatically saves your query history to help you
              track and reuse your work:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>
                <strong>Auto-save:</strong> Every query you execute is
                automatically saved to your browser's local storage
              </li>
              <li>
                <strong>Quick access:</strong> Click the "History" button next
                to the Run Query button to view all saved queries
              </li>
              <li>
                <strong>Load queries:</strong> Click any query in the history to
                load it back into the editor
              </li>
              <li>
                <strong>Status tracking:</strong> See success/error status and
                row counts for each executed query
              </li>
              <li>
                <strong>Download queries:</strong> Save any query as a .sql file
                for sharing or backup
              </li>
              <li>
                <strong>Clear history:</strong> Remove individual queries or
                clear all history at once
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">
              Database Export & Import
            </h2>
            <p className="text-slate-700 mb-4">
              Save your work and restore it later using the database
              export/import feature:
            </p>

            <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">
              Export Database
            </h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>
                Click the "Export" button in the Tables section to download all
                your tables
              </li>
              <li>
                Creates a ZIP file containing all table data in csv format
              </li>
              <li>
                Includes metadata with table schemas, column types, and row
                counts
              </li>
              <li>
                Perfect for backing up your work or sharing datasets with others
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">
              Import Database
            </h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>
                Click the "Import" button to restore a previously exported
                database
              </li>
              <li>Select the ZIP file you exported earlier</li>
              <li>All tables and data will be automatically recreated</li>
              <li>
                Original files are stored in browser storage for persistence
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">
              Table Preview
            </h2>
            <p className="text-slate-700 mb-4">
              Quickly preview table contents without writing a query:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>
                Click the eye icon next to any table name in the Tables list
              </li>
              <li>
                Automatically runs{" "}
                <code className="px-2 py-1 bg-slate-200 rounded text-sm font-mono">
                  SELECT * FROM table LIMIT 10
                </code>
              </li>
              <li>
                Great for quickly inspecting table structure and sample data
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">
              Keyboard Shortcuts
            </h2>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>
                <kbd className="px-2 py-1 bg-slate-200 rounded text-sm font-mono">
                  Ctrl+Enter
                </kbd>{" "}
                (or{" "}
                <kbd className="px-2 py-1 bg-slate-200 rounded text-sm font-mono">
                  Cmd+Enter
                </kbd>{" "}
                on Mac) - Execute query or selected text
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-200 rounded text-sm font-mono">
                  Ctrl+/
                </kbd>{" "}
                - Toggle comment (in editor)
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-200 rounded text-sm font-mono">
                  Escape
                </kbd>{" "}
                - Close query history dropdown
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
                performance issues. Consider splitting them or using
                aggregations
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
                and convenient (no server needed!), but means very large
                datasets may need to be processed in chunks or on a traditional
                database server.
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

            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">
              Frequently Asked Questions (FAQ)
            </h2>

            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">
                  Q: Is my data really private?
                </h4>
                <p className="text-blue-900">
                  <strong>A:</strong> Yes! All data processing happens entirely
                  in your browser using WebAssembly. Your files never leave your
                  device and are never sent to any server. You can verify this
                   by checking your browser's network tab - no data is sent.
                  occur.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">
                  Q: What happens if I refresh the page?
                </h4>
                <p className="text-blue-900">
                  <strong>A:</strong> Your query history is automatically saved
                  to browser storage and will persist across sessions. However,
                   your added files and tables are currently lost on refresh
                  unless you export your database first. We recommend exporting
                  your database before closing if you want to continue your work
                  later.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">
                  Q: Can I use this with Excel (.xlsx) files?
                </h4>
                <p className="text-blue-900">
                  <strong>A:</strong> Unfortunately, Excel files (.xlsx) are not
                  currently supported due to limitations in the DuckDB WASM
                  implementation. However, you can easily convert Excel files to
                  CSV using Excel's "Save As" feature or online converters, then
                   add the CSV file.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">
                  Q: How large can my files be?
                </h4>
                <p className="text-blue-900">
                  <strong>A:</strong> Browser memory limits typically cap
                  working data at 2-3GB. Files up to 200MB generally work well.
                  For larger files, consider using Parquet format (more
                  memory-efficient) or filtering/aggregating your data to reduce
                  result set sizes.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">
                  Q: Can I execute multiple queries at once?
                </h4>
                <p className="text-blue-900">
                  <strong>A:</strong> You can write multiple SQL statements
                  separated by semicolons, but only the last statement's results
                  will be displayed. If you want to see results from multiple
                  queries, execute them one at a time. You can also select
                  specific SQL text in the editor and press Ctrl+Enter to run
                  just that selection.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">
                  Q: Does this work offline?
                </h4>
                <p className="text-blue-900">
                  <strong>A:</strong> Once the page is loaded, most
                  functionality works offline since everything runs in your
                  browser. However, the initial page load requires an internet
                  connection to download the application and DuckDB WASM files
                  (~150MB).
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">
              Troubleshooting
            </h2>

            <div className="space-y-4">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <h4 className="text-lg font-semibold text-amber-800 mb-2">
                  Issue: "Out of memory" error
                </h4>
                <p className="text-amber-900 mb-2">
                  <strong>Solutions:</strong>
                </p>
                <ul className="list-disc list-inside text-amber-900 space-y-1">
                  <li>Use LIMIT to reduce the number of rows returned</li>
                  <li>
                    Use aggregation queries (GROUP BY, COUNT) instead of
                    selecting all rows
                  </li>
                  <li>Close other browser tabs to free up memory</li>
                  <li>
                    Try using Parquet format instead of CSV for large files
                  </li>
                  <li>Split large files into smaller chunks</li>
                </ul>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <h4 className="text-lg font-semibold text-amber-800 mb-2">
                   Issue: Adding a file fails or table creation errors
                </h4>
                <p className="text-amber-900 mb-2">
                  <strong>Solutions:</strong>
                </p>
                <ul className="list-disc list-inside text-amber-900 space-y-1">
                  <li>
                    Ensure your CSV file has a header row with column names
                  </li>
                  <li>
                    Check that your JSON file is valid (array of objects or
                    newline-delimited JSON)
                  </li>
                  <li>
                    Verify the file isn't corrupted by opening it in a text
                    editor
                  </li>
                  <li>
                    Try renaming the file if it contains special characters
                  </li>
                  <li>
                    Check browser console (F12) for detailed error messages
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <h4 className="text-lg font-semibold text-amber-800 mb-2">
                  Issue: Query runs forever or browser becomes unresponsive
                </h4>
                <p className="text-amber-900 mb-2">
                  <strong>Solutions:</strong>
                </p>
                <ul className="list-disc list-inside text-amber-900 space-y-1">
                  <li>Queries timeout after 30 seconds automatically</li>
                  <li>
                    Add LIMIT clauses to test queries before running on full
                    dataset
                  </li>
                  <li>Use WHERE clauses to filter data early in the query</li>
                  <li>Avoid cartesian joins (missing JOIN conditions)</li>
                  <li>If browser freezes, refresh the page and start over</li>
                </ul>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <h4 className="text-lg font-semibold text-amber-800 mb-2">
                  Issue: Table names don't appear or autocomplete doesn't work
                </h4>
                <p className="text-amber-900 mb-2">
                  <strong>Solutions:</strong>
                </p>
                <ul className="list-disc list-inside text-amber-900 space-y-1">
                  <li>
                     Wait a few seconds after adding files for tables to be registered
                  </li>
                  <li>
                     Try refreshing the page (note: you'll need to re-add
                     files)
                  </li>
                  <li>
                    Check the Tables section to verify your tables were created
                  </li>
                  <li>
                    Type a few characters to trigger autocomplete suggestions
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <h4 className="text-lg font-semibold text-amber-800 mb-2">
                  Issue: Page is slow to load
                </h4>
                <p className="text-amber-900 mb-2">
                  <strong>Solutions:</strong>
                </p>
                <ul className="list-disc list-inside text-amber-900 space-y-1">
                  <li>
                    First load downloads ~150MB of DuckDB WASM files - this is
                    normal
                  </li>
                  <li>
                    Subsequent loads should be faster thanks to browser caching
                  </li>
                  <li>Check your internet connection speed</li>
                  <li>
                    Try using a modern browser (Chrome, Firefox, Safari, Edge)
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-bold text-blue-800 mb-2">
                Still having issues?
              </h3>
              <p className="text-blue-900 mb-4">
                Check the browser console (press F12 → Console tab) for detailed
                error messages. These often provide specific information about
                what went wrong and can help you debug issues with your queries
                or data files.
              </p>
              <p className="text-blue-900">
                You can also reach out to{" "}
                <a
                  href="mailto:info@sqlforfiles.app"
                  className="underline hover:text-blue-700 font-medium"
                >
                  info@sqlforfiles.app
                </a>{" "}
                if problems occur. There's no guarantee, but I try to help.
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
