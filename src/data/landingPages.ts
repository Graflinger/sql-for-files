/** Focused product landing pages for high-intent discovery queries. */
export type LandingPageKind = "csv" | "json" | "parquet" | "duckdb" | "private" | "examples";

export interface LandingPageFaq {
  question: string;
  answer: string;
}

export interface LandingPageConfig {
  title: string;
  description: string;
  canonicalPath: string;
  /** Short label used when other pages link here. */
  linkLabel: string;
  eyebrow: string;
  heading: string;
  intro: string;
  bullets: string[];
  /** Format-specific workflow shown as numbered steps. */
  steps: string[];
  examples: Array<{ label: string; sql: string }>;
  faqs: LandingPageFaq[];
  /** Supporting guide that covers the topic in tutorial depth. */
  guideSlug: string;
  /** Lessons where visitors can practice the SQL used on the page. */
  lessonIds: string[];
  /** Date the page content last changed (YYYY-MM-DD). */
  updatedAt: string;
}

const PRIVACY_FAQ: LandingPageFaq = {
  question: "Is my file uploaded anywhere?",
  answer:
    "No. SQL for Files reads the file in your browser and loads it into DuckDB-WASM running on your device. The app does not send file contents, SQL queries, or query results to a server.",
};

export const landingPages: Record<LandingPageKind, LandingPageConfig> = {
  csv: {
    title: "Query CSV Files with SQL in Your Browser | SQL for Files",
    description:
      "Query CSV files with SQL locally in your browser. Load a CSV, inspect columns, aggregate rows, and export results without uploading data.",
    canonicalPath: "/query-csv-with-sql",
    linkLabel: "Query CSV files with SQL",
    eyebrow: "CSV Analysis",
    heading: "Query CSV files with SQL in your browser",
    intro:
      "Drop a CSV file into SQL for Files, inspect the generated table, and run analytical SQL locally with DuckDB-WASM.",
    bullets: [
      "Automatic table creation for CSV files",
      "Advanced CSV options for delimiters, headers, skipped rows, null strings, and date formats",
      "Local browser-side processing without uploading file contents",
      "CSV export for full query results",
    ],
    steps: [
      "Open the editor and drop a .csv file into Add Data, or pick it from your device.",
      "DuckDB detects the delimiter, header row, and column types, and creates a table named after the file.",
      "Write SQL against the table, review or chart the results, and export the full result as CSV.",
    ],
    examples: [
      {
        label: "Preview a CSV table",
        sql: "SELECT *\nFROM sales\nLIMIT 25;",
      },
      {
        label: "Aggregate CSV rows",
        sql: "SELECT category, COUNT(*) AS rows, SUM(amount) AS revenue\nFROM sales\nGROUP BY category\nORDER BY revenue DESC;",
      },
      {
        label: "Join two CSV files",
        sql: "SELECT o.order_id, c.customer_name, o.amount\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id;",
      },
    ],
    faqs: [
      PRIVACY_FAQ,
      {
        question: "What if my CSV uses semicolons or a regional number format?",
        answer:
          "Delimiters, headers, and types are detected automatically. If detection is wrong, the advanced add options let you set the delimiter, header row, skipped rows, quote and escape characters, null string, date or timestamp format, and decimal separator before the table is created.",
      },
      {
        question: "How large can a CSV file be?",
        answer:
          "Browser memory is the main constraint. A practical working range is usually around 2 to 3 GB of data in memory, and files around 200 MB are typically the easiest place to start.",
      },
    ],
    guideSlug: "query-csv-files-with-sql",
    lessonIds: ["intro-first-query", "filtering-where", "grouping-group-by", "joins-inner"],
    updatedAt: "2026-10-29",
  },
  json: {
    title: "Query JSON Files with SQL Locally | SQL for Files",
    description:
      "Analyze JSON arrays and NDJSON files with browser-based DuckDB SQL. Filter events, flatten nested records, and keep exports on your device.",
    canonicalPath: "/query-json-with-sql",
    linkLabel: "Query JSON files with SQL",
    eyebrow: "JSON Analysis",
    heading: "Query JSON and NDJSON files with SQL",
    intro:
      "SQL for Files turns JSON arrays and newline-delimited JSON into DuckDB tables so you can filter, join, and summarize nested exports locally.",
    bullets: [
      "Supports JSON arrays and NDJSON records",
      "Useful for API exports, logs, and application data snapshots",
      "DuckDB SQL support for filtering, grouping, joining, and unnesting",
      "All processing happens in the browser",
    ],
    steps: [
      "Add a .json file that holds a JSON array of objects or newline-delimited JSON with one object per line.",
      "DuckDB's JSON reader detects fields and types; nested objects become STRUCT columns and arrays become LIST columns.",
      "Query top-level fields like normal columns, read nested fields with dot notation, and expand arrays with UNNEST.",
    ],
    examples: [
      {
        label: "Filter imported JSON records",
        sql: "SELECT id, status, created_at\nFROM events\nWHERE status = 'active'\nORDER BY created_at DESC;",
      },
      {
        label: "Summarize JSON events",
        sql: "SELECT type, COUNT(*) AS events\nFROM events\nGROUP BY type\nORDER BY events DESC;",
      },
    ],
    faqs: [
      PRIVACY_FAQ,
      {
        question: "Does SQL for Files support NDJSON?",
        answer:
          "Yes, when the file uses the .json extension. DuckDB's JSON reader handles both a single JSON array of objects and newline-delimited JSON with one object per line.",
      },
      {
        question: "How do I query nested JSON fields?",
        answer:
          "Nested objects are loaded as STRUCT columns, so you can read a field with dot notation such as customer.address.city. Arrays become LIST columns that UNNEST turns into one row per element.",
      },
    ],
    guideSlug: "query-json-files-with-sql",
    lessonIds: ["unnest-lists", "unnest-structs", "unnest-recursive", "filtering-where"],
    updatedAt: "2026-10-29",
  },
  parquet: {
    title: "Query Parquet Files in the Browser | SQL for Files",
    description:
      "Open Parquet files in a browser-based DuckDB editor. Inspect schemas, run analytical SQL, and keep columnar data local.",
    canonicalPath: "/query-parquet-with-sql",
    linkLabel: "Query Parquet files in the browser",
    eyebrow: "Parquet Analysis",
    heading: "Query Parquet files in the browser",
    intro:
      "Parquet is efficient for analytical workloads. SQL for Files lets you load Parquet into a browser-based DuckDB engine and query it immediately.",
    bullets: [
      "Columnar Parquet support through DuckDB-WASM",
      "Good fit for larger analytical extracts compared with raw CSV or JSON",
      "Schema inspection, SQL editor, charts, and column statistics",
      "Parquet ZIP database backup and restore",
    ],
    steps: [
      "Add a .parquet file from your device.",
      "DuckDB reads the schema stored in the file, so column names and types arrive without guessing.",
      "Run analytical SQL, check column statistics in the Classification tab, and export results as CSV.",
    ],
    examples: [
      {
        label: "Inspect Parquet rows",
        sql: "SELECT *\nFROM transactions\nLIMIT 100;",
      },
      {
        label: "Build chart-ready totals",
        sql: "SELECT region, DATE_TRUNC('month', order_date) AS month, SUM(amount) AS revenue\nFROM transactions\nGROUP BY region, month\nORDER BY month, revenue DESC;",
      },
    ],
    faqs: [
      PRIVACY_FAQ,
      {
        question: "Do I need Python or a database server to read Parquet?",
        answer:
          "No. DuckDB-WASM reads Parquet directly in the browser, so you can inspect a Parquet file without installing Python, pandas, or a local database.",
      },
      {
        question: "Can I convert a Parquet file to CSV?",
        answer:
          "Yes. Query the Parquet table, then export the full result as CSV from the results panel. Filter or aggregate first if you only need part of the data.",
      },
    ],
    guideSlug: "query-parquet-files-in-browser",
    lessonIds: ["aggregates-sum", "grouping-group-by", "dates-extract", "window-functions-running-total"],
    updatedAt: "2026-10-29",
  },
  duckdb: {
    title: "DuckDB-WASM SQL Editor | SQL for Files",
    description:
      "Use a DuckDB-WASM SQL editor with Monaco, autocomplete, charts, column stats, and CSV export for local CSV, JSON, and Parquet analysis.",
    canonicalPath: "/duckdb-wasm-sql-editor",
    linkLabel: "DuckDB-WASM SQL editor",
    eyebrow: "DuckDB-WASM",
    heading: "A DuckDB-WASM SQL editor for local file analysis",
    intro:
      "SQL for Files packages DuckDB-WASM, Monaco, Apache Arrow, charts, and export tools into a browser IDE for ad-hoc file analysis.",
    bullets: [
      "Full analytical SQL engine running in WebAssembly",
      "Monaco editor with syntax highlighting and autocomplete",
      "Separate tabs, query history, schema browsing, and table previews",
      "No database server installation required",
    ],
    steps: [
      "Open the editor; DuckDB-WASM starts inside your browser tab without a server or install.",
      "Add CSV, JSON, or Parquet files, or load lesson sample data, and browse tables and columns in the sidebar.",
      "Write queries with autocomplete, run them in separate tabs, and reopen earlier queries from local history.",
    ],
    examples: [
      {
        label: "Join local files",
        sql: "SELECT o.order_id, c.customer_name, o.total_amount\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nORDER BY o.total_amount DESC;",
      },
      {
        label: "Use window functions",
        sql: "SELECT customer_name, total_amount, RANK() OVER (ORDER BY total_amount DESC) AS revenue_rank\nFROM orders;",
      },
    ],
    faqs: [
      {
        question: "What is DuckDB-WASM?",
        answer:
          "DuckDB-WASM is the DuckDB analytical database compiled to WebAssembly so it runs inside a web browser. SQL for Files uses it as its query engine.",
      },
      {
        question: "Which SQL features can I use?",
        answer:
          "DuckDB SQL: joins, aggregations, window functions, CTEs, GROUPING SETS, list functions, and UNNEST all work. Features that depend on native system access can behave differently in the browser build.",
      },
      {
        question: "Do I need an account?",
        answer: "No. The editor is free and works without an account.",
      },
    ],
    guideSlug: "duckdb-wasm-browser-sql",
    lessonIds: ["window-functions-over", "grouping-sets-basics", "unnest-lists", "array-lambdas-transform"],
    updatedAt: "2026-10-29",
  },
  private: {
    title: "Private Local Data Analysis in Your Browser | SQL for Files",
    description:
      "Analyze sensitive CSV, JSON, and Parquet files locally. SQL for Files keeps files, queries, and results in your browser unless you export them.",
    canonicalPath: "/private-local-data-analysis",
    linkLabel: "Private local data analysis",
    eyebrow: "Private Analysis",
    heading: "Analyze local files without uploading data",
    intro:
      "SQL for Files is designed for sensitive ad-hoc analysis: files, imported tables, SQL queries, and results stay in browser storage unless you export them.",
    bullets: [
      "No account required",
      "File processing and SQL execution run locally in the browser",
      "IndexedDB stores persisted tables and query history on your device",
      "Useful when AI can help draft SQL but should not receive underlying data",
    ],
    steps: [
      "Open the editor; there is no sign-up step.",
      "Add the sensitive file; DuckDB-WASM reads and queries it inside your browser tab.",
      "Export only the aggregated result you need, then delete the tables or clear the site data when you are done.",
    ],
    examples: [
      {
        label: "Profile a sensitive export locally",
        sql: "SELECT status, COUNT(*) AS rows\nFROM customer_export\nGROUP BY status\nORDER BY rows DESC;",
      },
      {
        label: "Check missing data",
        sql: "SELECT COUNT(*) AS missing_email_rows\nFROM customer_export\nWHERE email IS NULL;",
      },
    ],
    faqs: [
      PRIVACY_FAQ,
      {
        question: "Can I use AI to write SQL without sharing the data?",
        answer:
          "Yes. Describe your table and column names to an AI assistant, paste the SQL it suggests into the editor, and run it locally. The rows themselves do not need to leave your device.",
      },
      {
        question: "What is stored on my device?",
        answer:
          "Tables you keep and your query history are stored in the browser's IndexedDB, and editor preferences in localStorage. Anyone with access to the same browser profile could open them.",
      },
    ],
    guideSlug: "private-local-data-analysis",
    lessonIds: ["data-basics-null", "filtering-where", "aggregates-count"],
    updatedAt: "2026-10-29",
  },
  examples: {
    title: "SQL Examples for CSV, JSON, and Parquet Files | SQL for Files",
    description:
      "Copy practical SQL examples for file analysis: preview rows, filter data, join files, find duplicates, check missing values, and prepare chart-ready results.",
    canonicalPath: "/sql-examples-for-files",
    linkLabel: "SQL examples for files",
    eyebrow: "SQL Examples",
    heading: "SQL examples for local file analysis",
    intro:
      "These starter queries work well right after importing CSV, JSON, or Parquet files into SQL for Files. Replace table and column names with your own schema.",
    bullets: [
      "Preview and profile imported tables",
      "Find missing values and duplicate keys",
      "Join two imported files",
      "Create chart-ready aggregate result sets",
    ],
    steps: [
      "Add your file and note the generated table name in the Database sidebar.",
      "Copy an example and replace my_table and the column names with your own.",
      "Run it, then adjust filters and groupings until the result answers your question.",
    ],
    examples: [
      {
        label: "Profile every column",
        sql: "SUMMARIZE my_table;",
      },
      {
        label: "Find missing values",
        sql: "SELECT COUNT(*) AS missing_rows\nFROM my_table\nWHERE important_column IS NULL;",
      },
      {
        label: "Find duplicate keys",
        sql: "SELECT id, COUNT(*) AS copies\nFROM my_table\nGROUP BY id\nHAVING COUNT(*) > 1\nORDER BY copies DESC;",
      },
      {
        label: "Create a chart-ready result",
        sql: "SELECT category, COUNT(*) AS rows, AVG(amount) AS average_amount\nFROM my_table\nGROUP BY category\nORDER BY rows DESC;",
      },
    ],
    faqs: [
      {
        question: "Which SQL dialect do these examples use?",
        answer:
          "DuckDB SQL. It follows standard SQL closely and adds conveniences such as SUMMARIZE for quick column profiles.",
      },
    ],
    guideSlug: "sql-examples-for-csv-json-parquet",
    lessonIds: ["grouping-having", "joins-find-missing", "data-basics-null", "window-functions-row-number"],
    updatedAt: "2026-10-29",
  },
};

/** Find the landing page config for a route path. */
export function landingPageByPath(path: string): LandingPageConfig | undefined {
  return Object.values(landingPages).find((config) => config.canonicalPath === path);
}
