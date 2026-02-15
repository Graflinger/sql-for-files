import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO/SEO";

/**
 * About Page - Landing Page
 *
 * Clean, minimal landing page for SQL for Files.
 * Hero with IDE mockup, features, how-it-works, and CTA.
 */
export default function About() {
  const fileTypes = ["CSV", "JSON", "Parquet"];
  const [currentType, setCurrentType] = useState(0);
  const preloadSqlEditor = () => import("./SQLEditor");
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SQL for Files",
    alternateName: "SQL Query Tool for Data Files",
    url: "https://sqlforfiles.app/",
    description:
      "Query CSV, JSON, and Parquet files with SQL in your browser. All processing happens locally for privacy.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    browserRequirements: "Requires JavaScript and WebAssembly.",
    featureList: [
      "Query CSV files with SQL",
      "Query JSON files with SQL",
      "Query Parquet files with SQL",
      "100% client-side processing",
      "Private and secure data handling",
      "SQL syntax highlighting and autocomplete",
      "Support for joins, aggregations, and window functions",
      "Export query results to CSV",
      "Zero installation required",
    ],
    screenshot: "https://sqlforfiles.app/og-image.png",
    softwareVersion: "1.0",
    author: {
      "@type": "Organization",
      name: "SQL for Files",
    },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentType((prev) => (prev + 1) % fileTypes.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <SEO
        title="SQL for Files - Query CSV, JSON & Parquet in Your Browser"
        description="Query CSV, JSON, and Parquet files with SQL in your browser. 100% private, client-side processing powered by DuckDB WASM."
        canonicalPath="/"
        ogType="website"
        imageAlt="SQL for Files - browser SQL query tool"
        structuredData={webApplicationSchema}
      />
      <div className="bg-white">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-4">
              Query your{" "}
              <span className="relative inline-block">
                <span className="invisible">Parquet</span>
                <span className="absolute inset-0 text-blue-600 transition-opacity duration-500">
                  {fileTypes[currentType]}
                </span>
              </span>{" "}
              files <span className="text-slate-400">with SQL</span>
            </h1>
            <p className="text-lg text-slate-500 mb-6 max-w-2xl mx-auto leading-relaxed">
              Drop your data files into a full SQL engine running entirely in
              your browser. Powered by DuckDB &mdash; your data never leaves
              your device.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
              <Link
                to="/editor"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors duration-150"
                onMouseEnter={preloadSqlEditor}
                onFocus={preloadSqlEditor}
              >
                Open Editor
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                <svg
                  className="w-3.5 h-3.5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Free &amp; open source
              </span>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                No account required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                100% private
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Works offline
              </span>
            </div>
          </div>

          {/* IDE Mockup */}
          <div className="mt-10 max-w-4xl mx-auto">
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Window Chrome */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                </div>
                <span className="text-xs text-slate-400 ml-2">
                  SQL for Files
                </span>
              </div>

              {/* IDE Body */}
              <div className="flex min-h-[340px]">
                {/* Sidebar */}
                <div className="hidden md:flex flex-col w-48 border-r border-slate-100 bg-white text-xs shrink-0">
                  {/* Add Data section */}
                  <div className="border-b border-slate-100">
                    <div className="flex items-center gap-2 px-3 py-2 text-slate-500">
                      <svg
                        className="w-3.5 h-3.5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="font-semibold text-slate-700">
                        Add Data
                      </span>
                    </div>
                    <div className="px-3 pb-2">
                      <div className="rounded border border-dashed border-slate-200 py-2 text-center text-slate-400 text-[10px]">
                        Drop files here
                      </div>
                    </div>
                  </div>

                  {/* Database section */}
                  <div className="border-b border-slate-100">
                    <div className="flex items-center gap-2 px-3 py-2 text-slate-500">
                      <svg
                        className="w-3.5 h-3.5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                        />
                      </svg>
                      <span className="font-semibold text-slate-700">
                        Database
                      </span>
                      <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        2
                      </span>
                    </div>
                    <div className="px-3 pb-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600 py-0.5">
                        <svg
                          className="w-3 h-3 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        orders.csv
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 py-0.5">
                        <svg
                          className="w-3 h-3 text-amber-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        users.json
                      </div>
                    </div>
                  </div>

                  {/* Query History section */}
                  <div>
                    <div className="flex items-center gap-2 px-3 py-2 text-slate-500">
                      <svg
                        className="w-3.5 h-3.5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-semibold text-slate-700">
                        Query History
                      </span>
                      <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        3
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Editor + Results Area */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Editor Tabs */}
                  <div className="flex items-center bg-slate-50/80 border-b border-slate-200 text-xs">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-r border-slate-200 text-blue-700 border-b-2 border-b-blue-600">
                      <svg
                        className="w-3 h-3 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                      <span className="font-medium">Query 1</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 border-r border-slate-200 text-slate-500">
                      <svg
                        className="w-3 h-3 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                      <span>Query 2</span>
                    </div>
                    <div className="px-2.5 py-1.5 text-slate-400">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* SQL Editor Area */}
                  <div className="flex-1 bg-slate-950 p-4 font-mono text-xs sm:text-sm leading-relaxed overflow-hidden">
                    <div className="text-slate-500 mb-1">
                      -- Find top customers by revenue
                    </div>
                    <div>
                      <span className="text-blue-400">SELECT</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-slate-300">customer_name,</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-amber-300">SUM</span>
                      <span className="text-slate-400">(</span>
                      <span className="text-slate-300">amount</span>
                      <span className="text-slate-400">)</span>
                      <span className="text-blue-400"> AS </span>
                      <span className="text-slate-300">total</span>
                    </div>
                    <div>
                      <span className="text-blue-400">FROM </span>
                      <span className="text-green-400">orders.csv</span>
                    </div>
                    <div>
                      <span className="text-blue-400">GROUP BY </span>
                      <span className="text-slate-300">customer_name</span>
                    </div>
                    <div>
                      <span className="text-blue-400">ORDER BY </span>
                      <span className="text-slate-300">total</span>
                      <span className="text-blue-400"> DESC</span>
                    </div>
                    <div>
                      <span className="text-blue-400">LIMIT </span>
                      <span className="text-amber-300">5</span>
                      <span className="text-slate-500">;</span>
                    </div>
                  </div>

                  {/* Resize Handle */}
                  <div className="h-px bg-slate-200" />

                  {/* Results Panel */}
                  <div className="flex flex-col bg-white">
                    {/* Results Header */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50/80 border-b border-slate-200">
                      <svg
                        className="w-3 h-3 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <svg
                        className="w-3.5 h-3.5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <span className="text-xs font-semibold text-slate-700">
                        Results
                      </span>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                          5 rows
                        </span>
                        <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-medium">
                          12ms
                        </span>
                      </div>
                    </div>

                    {/* Results Sub-tabs */}
                    <div className="flex items-center gap-0 px-2 border-b border-slate-200 text-[11px]">
                      <span className="px-2 py-1.5 text-blue-700 font-medium border-b border-blue-600">
                        Data
                      </span>
                      <span className="px-2 py-1.5 text-slate-400">
                        Visualisation
                      </span>
                      <span className="px-2 py-1.5 text-slate-400">
                        Classification
                      </span>
                    </div>

                    {/* Results Table */}
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left px-3 py-1.5 text-[10px] font-medium text-slate-500 tracking-wider">
                            customer_name
                          </th>
                          <th className="text-right px-3 py-1.5 text-[10px] font-medium text-slate-500 tracking-wider">
                            total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        <tr className="border-b border-slate-50">
                          <td className="px-3 py-1">Acme Corp</td>
                          <td className="px-3 py-1 text-right font-mono text-slate-500">
                            48,250
                          </td>
                        </tr>
                        <tr className="border-b border-slate-50">
                          <td className="px-3 py-1">Globex Inc</td>
                          <td className="px-3 py-1 text-right font-mono text-slate-500">
                            35,100
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-1">Initech</td>
                          <td className="px-3 py-1 text-right font-mono text-slate-500">
                            29,800
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section — 6 cards */}
        <div className="border-t border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Feature 1: Privacy */}
              <div>
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center mb-3">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                  100% Private
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Everything runs in your browser. Your files are never uploaded
                  to any server &mdash; complete privacy by design.
                </p>
              </div>

              {/* Feature 2: Full SQL Engine */}
              <div>
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                  Full SQL Engine
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Powered by DuckDB. Joins, aggregations, window functions, CTEs
                  &mdash; query CSV, JSON, and Parquet with real SQL.
                </p>
              </div>

              {/* Feature 3: Zero Setup */}
              <div>
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                  Zero Setup
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  No installation, no accounts, no configuration. Open your
                  browser and start querying data in seconds.
                </p>
              </div>

              {/* Feature 4: Smart Editor */}
              <div>
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                  Smart Editor
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Monaco-powered editor with syntax highlighting, autocomplete,
                  and multi-tab support. The same engine behind VS Code.
                </p>
              </div>

              {/* Feature 5: Multiple Formats */}
              <div>
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                  <svg
                    className="w-5 h-5 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                  Multiple Formats
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Drag and drop CSV, JSON, or Parquet files. Load multiple files
                  and join across them with standard SQL.
                </p>
              </div>

              {/* Feature 6: Export Results */}
              <div>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                  Export Results
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Export query results to CSV with one click. Sort columns,
                  explore data, and save your work.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="border-t border-slate-100 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-center mb-8">
              How it works
            </h2>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-900 font-semibold text-sm flex items-center justify-center mx-auto mb-3">
                  1
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                  Drop your files
                </h3>
                <p className="text-sm text-slate-500">
                  Drag and drop CSV, JSON, or Parquet files into the editor.
                  They load instantly in-memory.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-900 font-semibold text-sm flex items-center justify-center mx-auto mb-3">
                  2
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                  Write SQL
                </h3>
                <p className="text-sm text-slate-500">
                  Use the Monaco-powered editor with syntax highlighting and
                  autocomplete. Or paste AI-generated queries.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-900 font-semibold text-sm flex items-center justify-center mx-auto mb-3">
                  3
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                  Get results
                </h3>
                <p className="text-sm text-slate-500">
                  See results instantly, sort columns, and export to CSV. All
                  processing happens locally at full speed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI + Compliance Callout */}
        <div className="border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="rounded-xl border border-slate-200 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex-shrink-0 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    Use AI-generated SQL &mdash; stay compliant
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Ask ChatGPT, Gemini, or Claude to write your SQL queries,
                    then run them here. Your data stays on your device &mdash;
                    you get the power of AI without sending sensitive data to
                    third-party services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="border-t border-slate-100 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">
              Ready to query your data?
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              No sign-up required. Just open the editor and drop your files.
            </p>
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors duration-150"
              onMouseEnter={preloadSqlEditor}
              onFocus={preloadSqlEditor}
            >
              Open Editor
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
