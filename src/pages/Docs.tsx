import SEO from "../components/SEO/SEO";

const codeBlockClass =
  "overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100 shadow-sm";

const sectionClass = "space-y-5";
const sectionGridClass = "grid gap-6 md:gap-7";
const surfaceCardClass =
  "rounded-xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50";
const plainCardClass =
  "rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/30";
const sectionHeaderClass =
  "space-y-3 border-b border-slate-200 pb-4 dark:border-slate-800";
const sectionEyebrowClass =
  "text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400";

const pageSections = [
  { id: "quickstart", label: "Quickstart" },
  { id: "add-data", label: "Add Data" },
  { id: "ide-tour", label: "IDE Tour" },
  { id: "learn-sql", label: "Learn SQL" },
  { id: "querying-in-tabs", label: "Querying in Tabs" },
  { id: "explore-results", label: "Explore Results" },
  { id: "visualisation", label: "Visualisation" },
  { id: "classification", label: "Classification" },
  { id: "persistence", label: "Save and Export" },
  { id: "shortcuts", label: "Shortcuts" },
  { id: "limits", label: "Limits" },
  { id: "faq", label: "FAQ" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

const keyboardShortcuts = [
  {
    keys: "Ctrl/Cmd + Enter",
    description: "Run the selected SQL or the full editor contents.",
  },
  {
    keys: "Ctrl + /",
    description: "Toggle SQL comments in the Monaco editor.",
  },
  {
    keys: "Ctrl + Space",
    description:
      "Open autocomplete suggestions for tables, columns, and SQL keywords.",
  },
  {
    keys: "Ctrl/Cmd + F",
    description: "Search within the current editor tab.",
  },
  {
    keys: "Ctrl/Cmd + B",
    description: "Collapse or expand the sidebar.",
  },
  {
    keys: "Ctrl/Cmd + J",
    description: "Collapse or expand the results panel.",
  },
];

const faqItems = [
  {
    question: "Is my data really private?",
    answer:
      "Yes. File processing, SQL execution, visualisation, and classification happen in your browser. Your files, queries, and query results are not uploaded by the app.",
  },
  {
    question: "What happens if I refresh the page?",
    answer:
      "Persisted tables can be restored from IndexedDB, query history is kept locally, and editor tabs keep their saved SQL drafts. You can also export a Parquet ZIP backup and import it later.",
  },
  {
    question: "Does this work offline?",
    answer:
      "After the app has loaded, many features can keep working if the necessary assets are still cached by your browser. The first load still needs an internet connection.",
  },
  {
    question: "Can I use Excel (.xlsx) files directly?",
    answer:
      "No. This app currently supports CSV, JSON, and Parquet. Convert Excel files to CSV before adding them.",
  },
  {
    question: "How large can my files be?",
    answer:
      "Browser memory is the main constraint. A practical working range is usually around 2 to 3GB of data in memory, and files around 200MB are typically the easiest place to start.",
  },
];

/** Documentation page for the current SQL for Files workflow. */
export default function Docs() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <SEO
        title="Documentation | SQL for Files"
        description="Learn how to add files, run SQL in tabs, visualise results, inspect column stats, and save local databases in SQL for Files."
        canonicalPath="/docs"
        ogType="article"
        imageAlt="SQL for Files documentation"
        structuredData={faqSchema}
      />
      <div className="theme-page min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur-sm md:p-10 dark:bg-slate-950/40">
            <div className="max-w-3xl">
              <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                Documentation
              </h1>
              <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
                SQL for Files lets you load CSV, JSON, and Parquet into a local
                DuckDB engine running in your browser. Use the editor like a
                lightweight IDE: add data, work in multiple query tabs, inspect
                results, build charts, and keep all your data local.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 dark:border-blue-900/80 dark:bg-blue-500/15 dark:text-blue-300">
                CSV, JSON, Parquet
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-900/80 dark:bg-emerald-500/15 dark:text-emerald-300">
                Local-only processing
              </span>
              <span className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-1 text-fuchsia-700 dark:border-fuchsia-900/80 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
                Charts and column stats
              </span>
            </div>

            <div className="mt-10 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/60 p-5 shadow-sm dark:border-slate-800 dark:from-slate-950/40 dark:via-slate-950/20 dark:to-blue-950/20 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl space-y-2">
                  <p className={sectionEyebrowClass}>On This Page</p>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Jump to the part you need
                  </h2>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    The docs follow the app flow from importing data to
                    exporting results. Use the links below if you want to skip
                    straight to a specific feature.
                  </p>
                </div>
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/80 dark:bg-emerald-500/15 dark:text-emerald-300">
                  Updated for the current editor UI
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {pageSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
                  >
                    {section.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-12 space-y-14">
              <section id="quickstart" className={sectionClass}>
                <div className={sectionHeaderClass}>
                  <p className={sectionEyebrowClass}>Start Here</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Quickstart
                  </h2>
                </div>
                <ol className="mb-0 list-decimal space-y-3 pl-5 text-slate-700 dark:text-slate-300">
                  <li>
                    Open the editor and add one or more CSV, JSON, or Parquet
                    files from the <strong>Add Data</strong> sidebar section.
                  </li>
                  <li>
                    Review the generated table names in{" "}
                    <strong>Database</strong>, then expand a table to inspect
                    its schema.
                  </li>
                  <li>
                    Write a query in the current tab, or create a fresh tab for
                    a different idea.
                  </li>
                  <li>
                    Press <code>Ctrl/Cmd + Enter</code> to run the selected SQL
                    or the whole query.
                  </li>
                  <li>
                    Review the <strong>Data</strong>,{" "}
                    <strong>Visualisation</strong>, or{" "}
                    <strong>Classification</strong> result tabs.
                  </li>
                  <li>
                    Export the result as CSV, save the current database to your
                    browser, or create a Parquet ZIP backup to move elsewhere.
                  </li>
                </ol>
              </section>

              <section id="add-data" className={sectionClass}>
                <div className={sectionHeaderClass}>
                  <p className={sectionEyebrowClass}>Import</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Add Data
                  </h2>
                </div>
                <div className={`${sectionGridClass} md:grid-cols-2`}>
                  <div className={surfaceCardClass}>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Fast add
                    </h3>
                    <ul className="mb-0 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                      <li>Drag and drop files or click the add area.</li>
                      <li>
                        Supported formats: CSV, JSON arrays, NDJSON, and
                        Parquet.
                      </li>
                      <li>
                        New tables are created from your files and typically
                        saved locally for future sessions.
                      </li>
                      <li>
                        There is also a sample CSV link in the add panel if you
                        want something quick to test with.
                      </li>
                    </ul>
                  </div>
                  <div className={surfaceCardClass}>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Advanced options
                    </h3>
                    <ul className="mb-0 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                      <li>
                        Preview the first 10 rows before creating a table.
                      </li>
                      <li>Choose a custom table name.</li>
                      <li>
                        For CSV files, adjust delimiter, header handling,
                        skipped rows, quote, escape, null string, date format,
                        and decimal separator.
                      </li>
                      <li>
                        Excel <code>.xlsx</code> files are not supported
                        directly; convert them to CSV first.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="ide-tour" className={sectionClass}>
                <div className={sectionHeaderClass}>
                  <p className={sectionEyebrowClass}>Layout</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    IDE Tour
                  </h2>
                </div>
                <div className={`${sectionGridClass} md:grid-cols-3`}>
                  <div className={plainCardClass}>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Sidebar
                    </h3>
                    <p className="mb-0 text-sm text-slate-700 dark:text-slate-300">
                      The sidebar groups <strong>Add Data</strong>,
                      <strong> Database</strong>, and{" "}
                      <strong>Query History</strong>. On mobile, the same
                      sections open from the menu drawer.
                    </p>
                  </div>
                  <div className={plainCardClass}>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Query tabs
                    </h3>
                    <p className="mb-0 text-sm text-slate-700 dark:text-slate-300">
                      Work in multiple editor tabs, rename them inline, and keep
                      separate query drafts around while comparing results.
                    </p>
                  </div>
                  <div className={plainCardClass}>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Results panel
                    </h3>
                    <p className="mb-0 text-sm text-slate-700 dark:text-slate-300">
                      The results panel shows row count and execution time, can
                      be resized or collapsed, and switches between Data,
                      Visualisation, and Classification views.
                    </p>
                  </div>
                </div>
              </section>

              <section id="learn-sql" className={sectionClass}>
                <div className={sectionHeaderClass}>
                  <p className={sectionEyebrowClass}>Learning</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Learn SQL
                  </h2>
                </div>
                <div className={`${sectionGridClass} md:grid-cols-2`}>
                  <div className={surfaceCardClass}>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Open the learning panel
                    </h3>
                    <ul className="mb-0 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                      <li>
                        Click <strong>Learn SQL</strong> in the top navigation to
                        open the guided lesson panel from anywhere in the app.
                      </li>
                      <li>
                        On desktop, the lessons open in the right-side panel next
                        to the editor and results.
                      </li>
                      <li>
                        On mobile, open the editor and switch to the
                        <strong> Learn</strong> tab in the bottom tab bar.
                      </li>
                      <li>
                        Closing and reopening the panel keeps your lesson
                        progress saved locally in your browser.
                      </li>
                    </ul>
                  </div>
                  <div className={surfaceCardClass}>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Work through a lesson
                    </h3>
                    <ol className="mb-0 list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                      <li>Pick a lesson from the chapter list.</li>
                      <li>Read the explanation and example SQL.</li>
                      <li>
                        If the lesson includes sample data, click
                        <strong> Load Data</strong> to create the lesson tables.
                      </li>
                      <li>
                        Click <strong>Start in Editor</strong> to prefill the
                        active SQL tab when a challenge provides starter SQL.
                      </li>
                      <li>
                        Run your query, then click <strong>Check Answer</strong>
                        to validate the latest result.
                      </li>
                      <li>
                        Use <strong>Previous</strong> and <strong>Next</strong>
                        to move through the track, or go back to
                        <strong> All lessons</strong> at any time.
                      </li>
                    </ol>
                  </div>
                </div>
                <div className={plainCardClass}>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Progress and tips
                  </h3>
                  <ul className="mb-0 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                    <li>
                      Completed lessons are marked in the navigation and counted
                      in the progress bar at the top of the panel.
                    </li>
                    <li>
                      Lesson completion is based on passing the built-in
                      challenge check for that lesson.
                    </li>
                    <li>
                      If you want to start over, use <strong>Reset progress</strong>
                      from the lesson overview.
                    </li>
                    <li>
                      The checker uses the latest query result from the active
                      editor tab, so rerun your SQL after making changes before
                      checking again.
                    </li>
                  </ul>
                </div>
              </section>

              <section id="querying-in-tabs" className={sectionClass}>
                <div className={sectionHeaderClass}>
                  <p className={sectionEyebrowClass}>Editor</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Querying in Tabs
                  </h2>
                </div>
                <ul className="mb-5 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                  <li>
                    Monaco provides SQL syntax highlighting plus autocomplete
                    for tables, columns, and common SQL keywords.
                  </li>
                  <li>
                    If you select part of a query and run it, only the selected
                    text executes.
                  </li>
                  <li>
                    DDL changes such as creating or dropping tables refresh the
                    Database sidebar after execution.
                  </li>
                  <li>
                    Query History stores recent runs locally, including status,
                    row count, and execution time. You can reload, download, or
                    delete entries from the sidebar.
                  </li>
                  <li>
                    Editor tab names and SQL drafts are persisted locally in
                    your browser so you can come back to unfinished work.
                  </li>
                </ul>

                <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Example queries
                </h3>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Inspect an imported table
                    </p>
                    <pre className={codeBlockClass}>
                      <code>{`SELECT *
FROM sales
LIMIT 25;`}</code>
                    </pre>
                  </div>

                  <div className="space-y-3">
                    <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Join two imported files
                    </p>
                    <pre className={codeBlockClass}>
                      <code>{`SELECT
  o.order_id,
  c.customer_name,
  o.total_amount
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.total_amount > 100
ORDER BY o.total_amount DESC;`}</code>
                    </pre>
                  </div>

                  <div className="space-y-3">
                    <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Build a chart-friendly aggregation
                    </p>
                    <pre className={codeBlockClass}>
                      <code>{`SELECT
  country,
  COUNT(*) AS orders,
  AVG(total_amount) AS avg_order_value
FROM orders
GROUP BY country
ORDER BY orders DESC;`}</code>
                    </pre>
                  </div>
                </div>
              </section>

              <section id="explore-results" className={sectionClass}>
                <div className={sectionHeaderClass}>
                  <p className={sectionEyebrowClass}>Inspect</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Explore Tables and Results
                  </h2>
                </div>
                <ul className="mb-0 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                  <li>
                    Expand any table in <strong>Database</strong> to inspect its
                    columns and data types.
                  </li>
                  <li>
                    Use the preview action to open a new tab with a sample
                    query:
                    <code> SELECT * FROM table LIMIT 100</code>.
                  </li>
                  <li>
                    The data grid displays up to 1,000 rows for responsiveness.
                  </li>
                  <li>Column headers in the Data tab are sortable.</li>
                  <li>
                    CSV export uses the full Arrow result, so exported files can
                    include all rows even when the UI only shows the first
                    1,000.
                  </li>
                </ul>
              </section>

              <section id="visualisation" className={sectionClass}>
                <div className={sectionHeaderClass}>
                  <p className={sectionEyebrowClass}>Charts</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Visualisation
                  </h2>
                </div>
                <div className={surfaceCardClass}>
                  <ul className="mb-0 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                    <li>
                      Switch to the <strong>Visualisation</strong> tab after a
                      query runs.
                    </li>
                    <li>
                      Start with auto-detected defaults, then configure bar,
                      line, or pie charts in the side panel.
                    </li>
                    <li>
                      Choose category and value columns, add multiple series for
                      axis-based charts, and set title or subtitle text.
                    </li>
                    <li>
                      If your category values repeat, the app warns that a
                      <code> GROUP BY</code> query may produce a more meaningful
                      chart.
                    </li>
                    <li>
                      Export charts as SVG or PNG, or copy a PNG image directly
                      to your clipboard.
                    </li>
                  </ul>
                </div>
              </section>

              <section id="classification" className={sectionClass}>
                <div className={sectionHeaderClass}>
                  <p className={sectionEyebrowClass}>Stats</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Classification
                  </h2>
                </div>
                <div className={surfaceCardClass}>
                  <ul className="mb-0 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                    <li>
                      The <strong>Classification</strong> tab computes
                      per-column statistics for the current result set.
                    </li>
                    <li>
                      Numeric and date columns show values such as min, max,
                      mean, median, mode, and null count.
                    </li>
                    <li>
                      String columns show minimum and maximum length plus null
                      count.
                    </li>
                    <li>Boolean columns show true, false, and null counts.</li>
                    <li>
                      Stats are computed from the full query result, not just
                      the rows currently visible in the table.
                    </li>
                  </ul>
                </div>
              </section>

              <section id="persistence" className={sectionClass}>
                <div className={sectionHeaderClass}>
                  <p className={sectionEyebrowClass}>Persistence</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Save, Restore, Export, and Import
                  </h2>
                </div>
                <div className={`${sectionGridClass} md:grid-cols-2`}>
                  <div className={plainCardClass}>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Local persistence
                    </h3>
                    <ul className="mb-0 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                      <li>
                        Added and imported tables are stored locally in your
                        browser using IndexedDB.
                      </li>
                      <li>
                        On a later visit, persisted tables can be restored into
                        the database automatically.
                      </li>
                      <li>
                        Use <strong>Save</strong> after changing tables with SQL
                        if you want the current database state written back to
                        local storage.
                      </li>
                      <li>
                        Query history is stored locally in IndexedDB, while
                        layout preferences and editor tab drafts are stored
                        locally in the browser as well.
                      </li>
                    </ul>
                  </div>
                  <div className={plainCardClass}>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Backups and sharing
                    </h3>
                    <ul className="mb-0 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                      <li>
                        <strong>Export</strong> creates a ZIP backup containing
                        every table as Parquet plus metadata.
                      </li>
                      <li>
                        <strong>Import</strong> restores those backups and can
                        optionally replace existing tables.
                      </li>
                      <li>Use CSV export when you only need a query result.</li>
                      <li>
                        Use the Parquet ZIP export when you want a fuller,
                        lossless backup of your working database.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="shortcuts" className={sectionClass}>
                <div className={sectionHeaderClass}>
                  <p className={sectionEyebrowClass}>Speed Up</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Keyboard Shortcuts
                  </h2>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-900/70">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Shortcut
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950/40">
                      {keyboardShortcuts.map((item) => (
                        <tr key={item.keys}>
                          <td className="px-4 py-3 align-top text-sm font-medium text-slate-900 dark:text-slate-100">
                            <code>{item.keys}</code>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                            {item.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  On Mac, use <code>Cmd</code> anywhere the interface shows
                  <code> Ctrl</code>.
                </p>
              </section>

              <section id="limits" className={sectionClass}>
                <div className={sectionHeaderClass}>
                  <p className={sectionEyebrowClass}>Scale</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Limits and Performance
                  </h2>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/80 dark:bg-amber-950/30">
                  <ul className="mb-0 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                    <li>
                      SQL for Files runs fully in-browser, so memory is the main
                      practical limit.
                    </li>
                    <li>
                      Browsers usually top out around 4GB, with a more realistic
                      working range of roughly 2 to 3GB for analytical
                      workloads.
                    </li>
                    <li>
                      Start with <code>LIMIT</code>, filter early with
                      <code> WHERE</code>, and prefer <code>GROUP BY</code> when
                      you do not need every row.
                    </li>
                    <li>
                      Parquet is usually more memory-efficient than CSV or JSON,
                      especially for larger datasets.
                    </li>
                    <li>
                      If results are very large, the UI warns about truncation
                      and keeps the display lightweight while preserving the
                      full data for CSV export.
                    </li>
                  </ul>
                </div>
              </section>

              <section id="faq" className={sectionClass}>
                <div className={sectionHeaderClass}>
                  <p className={sectionEyebrowClass}>Common Questions</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    FAQ
                  </h2>
                </div>
                <div className="space-y-5">
                  {faqItems.map((item) => (
                    <div key={item.question} className={surfaceCardClass}>
                      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {item.question}
                      </h3>
                      <p className="mb-0 text-sm leading-6 text-slate-700 dark:text-slate-300">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="troubleshooting" className={sectionClass}>
                <div className={sectionHeaderClass}>
                  <p className={sectionEyebrowClass}>Fixes</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Troubleshooting
                  </h2>
                </div>
                <div className="space-y-5">
                  <div className={plainCardClass}>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Adding a file fails
                    </h3>
                    <ul className="mb-0 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                      <li>Check that the file is CSV, JSON, or Parquet.</li>
                      <li>
                        For JSON, use either an array of objects or newline-
                        delimited records.
                      </li>
                      <li>
                        For CSV, try the Advanced options modal to confirm
                        header handling and delimiter settings.
                      </li>
                      <li>
                        If the error persists, inspect the browser console for
                        the exact parsing or DuckDB error.
                      </li>
                    </ul>
                  </div>

                  <div className={plainCardClass}>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Queries are slow or memory-heavy
                    </h3>
                    <ul className="mb-0 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                      <li>
                        Start with a smaller sample using <code>LIMIT</code>.
                      </li>
                      <li>
                        Filter early and aggregate before exporting very large
                        result sets.
                      </li>
                      <li>Close other browser tabs to free memory.</li>
                      <li>
                        If possible, work from Parquet instead of raw CSV for
                        the largest inputs.
                      </li>
                    </ul>
                  </div>

                  <div className={plainCardClass}>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Tables or autocomplete look out of date
                    </h3>
                    <ul className="mb-0 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                      <li>
                        Check the <strong>Database</strong> section to confirm
                        the table was created successfully.
                      </li>
                      <li>
                        Run the query again after table-creating SQL so the
                        schema refresh completes.
                      </li>
                      <li>
                        Try typing part of a table or column name and then press
                        <code> Ctrl + Space</code> to reopen suggestions.
                      </li>
                    </ul>
                  </div>

                  <div className={plainCardClass}>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Import or export problems
                    </h3>
                    <ul className="mb-0 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                      <li>
                        Database import expects a ZIP backup created by SQL for
                        Files.
                      </li>
                      <li>
                        Use <strong>Replace existing tables</strong> during
                        import if you want imported tables to overwrite current
                        ones.
                      </li>
                      <li>
                        Use CSV export for query output and ZIP export for a
                        full database backup.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className={sectionClass}>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-400/30 dark:bg-blue-950/30">
                  <h2 className="mb-2 text-xl font-bold text-blue-900 dark:text-blue-100">
                    Still stuck?
                  </h2>
                  <p className="mb-3 text-sm leading-6 text-blue-900 dark:text-blue-100/90">
                    Open your browser developer tools and check the Console tab.
                    Parsing errors, DuckDB SQL errors, and import issues usually
                    show the most helpful details there.
                  </p>
                  <p className="mb-0 text-sm text-blue-900 dark:text-blue-100/90">
                    You can also write to{" "}
                    <a
                      href="mailto:info@sqlforfiles.app"
                      className="font-medium underline hover:text-blue-700 dark:hover:text-blue-200"
                    >
                      info@sqlforfiles.app
                    </a>
                    .
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
