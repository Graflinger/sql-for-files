import { Link } from "react-router-dom";

import SEO from "../components/SEO/SEO";

type UseCaseKind = "csv" | "json" | "parquet" | "duckdb" | "private" | "examples";

interface UseCaseProps {
  kind: UseCaseKind;
}

interface UseCaseConfig {
  title: string;
  description: string;
  canonicalPath: string;
  eyebrow: string;
  heading: string;
  intro: string;
  bullets: string[];
  examples: Array<{ label: string; sql: string }>;
}

const useCases: Record<UseCaseKind, UseCaseConfig> = {
  csv: {
    title: "Query CSV Files with SQL in Your Browser | SQL for Files",
    description:
      "Query CSV files with SQL locally in your browser. Load a CSV, inspect columns, aggregate rows, and export results without uploading data.",
    canonicalPath: "/query-csv-with-sql",
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
    examples: [
      {
        label: "Preview a CSV table",
        sql: "SELECT *\nFROM sales\nLIMIT 25;",
      },
      {
        label: "Aggregate CSV rows",
        sql: "SELECT category, COUNT(*) AS rows, SUM(amount) AS revenue\nFROM sales\nGROUP BY category\nORDER BY revenue DESC;",
      },
    ],
  },
  json: {
    title: "Query JSON Files with SQL Locally | SQL for Files",
    description:
      "Analyze JSON arrays and NDJSON files with browser-based DuckDB SQL. Filter events, flatten nested records, and keep exports on your device.",
    canonicalPath: "/query-json-with-sql",
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
  },
  parquet: {
    title: "Query Parquet Files in the Browser | SQL for Files",
    description:
      "Open Parquet files in a browser-based DuckDB editor. Inspect schemas, run analytical SQL, and keep columnar data local.",
    canonicalPath: "/query-parquet-with-sql",
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
  },
  duckdb: {
    title: "DuckDB-WASM SQL Editor | SQL for Files",
    description:
      "Use a DuckDB-WASM SQL editor with Monaco, autocomplete, charts, column stats, and CSV export for local CSV, JSON, and Parquet analysis.",
    canonicalPath: "/duckdb-wasm-sql-editor",
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
  },
  private: {
    title: "Private Local Data Analysis in Your Browser | SQL for Files",
    description:
      "Analyze sensitive CSV, JSON, and Parquet files locally. SQL for Files keeps files, queries, and results in your browser unless you export them.",
    canonicalPath: "/private-local-data-analysis",
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
  },
  examples: {
    title: "SQL Examples for CSV, JSON, and Parquet Files | SQL for Files",
    description:
      "Copy practical SQL examples for file analysis: preview rows, filter data, join files, aggregate totals, prepare charts, and check missing values.",
    canonicalPath: "/sql-examples-for-files",
    eyebrow: "SQL Examples",
    heading: "SQL examples for local file analysis",
    intro:
      "These starter queries work well after importing CSV, JSON, or Parquet files into SQL for Files. Replace table and column names with your own schema.",
    bullets: [
      "Preview and inspect imported tables",
      "Filter rows and check missing values",
      "Join two imported files",
      "Create chart-ready aggregate result sets",
    ],
    examples: [
      {
        label: "Find missing values",
        sql: "SELECT COUNT(*) AS missing_rows\nFROM my_table\nWHERE important_column IS NULL;",
      },
      {
        label: "Create a chart-ready result",
        sql: "SELECT category, COUNT(*) AS rows, AVG(amount) AS average_amount\nFROM my_table\nGROUP BY category\nORDER BY rows DESC;",
      },
    ],
  },
};

/** UseCase renders focused SEO pages for common SQL for Files discovery intents. */
export default function UseCase({ kind }: UseCaseProps) {
  const config = useCases[kind];
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: config.heading,
    description: config.description,
    url: `https://sqlforfiles.app${config.canonicalPath}`,
    dateModified: "2026-05-02",
    author: {
      "@type": "Organization",
      name: "SQL for Files",
    },
  };

  return (
    <>
      <SEO
        title={config.title}
        description={config.description}
        canonicalPath={config.canonicalPath}
        ogType="article"
        imageAlt={config.heading}
        structuredData={articleSchema}
      />
      <div className="theme-page min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm md:p-10 dark:bg-slate-950/40">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
                {config.eyebrow}
              </p>
              <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                {config.heading}
              </h1>
              <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
                {config.intro}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/editor"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Open the editor
                </Link>
                <Link
                  to="/docs"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  Read the docs
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {config.bullets.map((bullet) => (
                <div key={bullet} className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
                  <p className="text-sm leading-6 text-slate-700">{bullet}</p>
                </div>
              ))}
            </div>

            <section className="mt-12">
              <h2 className="mb-5 text-2xl font-bold text-slate-900">
                Example queries
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                {config.examples.map((example) => (
                  <div key={example.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">
                      {example.label}
                    </h3>
                    <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">
                      <code>{example.sql}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
