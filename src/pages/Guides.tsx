import { Link } from "react-router-dom";

import SEO from "../components/SEO/SEO";
import { guidePath, guides } from "../data/guides";

const SITE_URL = "https://sqlforfiles.app";

/** Guides page listing practical SQL for Files articles. */
export default function Guides() {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SQL for Files Guides",
    itemListElement: guides.map((guide, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}${guidePath(guide.slug)}`,
      name: guide.title,
      description: guide.description,
    })),
  };
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "SQL for Files Guides",
    url: `${SITE_URL}/guides`,
    description:
      "Evergreen guides and SQL examples for querying CSV, JSON, and Parquet files locally in your browser.",
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: `${SITE_URL}/guides`,
      },
    ],
  };

  return (
    <>
      <SEO
        title="Guides | SQL for Files"
        description="Read practical guides for querying CSV, JSON, and Parquet files with SQL in your browser using SQL for Files and DuckDB WASM."
        canonicalPath="/guides"
        ogType="website"
        imageAlt="SQL for Files guides"
        structuredData={[collectionSchema, itemListSchema, breadcrumbSchema]}
      />
      <div className="theme-page min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur-sm md:p-10 dark:bg-slate-950/40">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
                Guides
              </p>
              <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                Practical SQL guides for local file analysis
              </h1>
              <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
                Learn how to query CSV, JSON, and Parquet files with SQL in the
                browser. These guides focus on real file-analysis workflows,
                privacy-aware usage, DuckDB WASM, and reusable SQL examples.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 dark:border-blue-900/80 dark:bg-blue-500/15 dark:text-blue-300">
                CSV, JSON, Parquet
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-900/80 dark:bg-emerald-500/15 dark:text-emerald-300">
                Local browser analysis
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700 dark:border-amber-900/80 dark:bg-amber-500/15 dark:text-amber-300">
                SQL examples
              </span>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {guides.map((guide) => (
                <Link
                  key={guide.slug}
                  to={guidePath(guide.slug)}
                  className="group rounded-xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm transition-colors hover:border-blue-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-700"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                      {guide.category}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Updated {guide.updatedAt}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-300">
                    {guide.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {guide.summary}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                    Read guide
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
