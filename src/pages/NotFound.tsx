import { Link } from "react-router-dom";

import SEO from "../components/SEO/SEO";

const helpfulLinks = [
  {
    path: "/",
    label: "Home",
    description: "What SQL for Files does and which file formats it supports.",
  },
  {
    path: "/editor",
    label: "SQL editor",
    description: "Query CSV, JSON, and Parquet files locally in your browser.",
  },
  {
    path: "/learn-sql",
    label: "Learn SQL",
    description: "Interactive lessons with sample data and hands-on challenges.",
  },
  {
    path: "/guides",
    label: "Guides",
    description: "Practical SQL explanations and file-analysis walkthroughs.",
  },
];

/**
 * NotFound renders the fallback page for unknown URLs.
 *
 * The build prerenders this page to `dist/404.html`, which Cloudflare Pages
 * serves with a real 404 status for paths that do not match a static file.
 */
export default function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found | SQL for Files"
        description="The page you requested does not exist. Open the SQL editor, browse Learn SQL lessons, or read the SQL for Files guides."
        canonicalPath={null}
        robots="noindex"
      />
      <div className="theme-page min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm md:p-10 dark:bg-slate-950/40">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
              404
            </p>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Page not found
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
              This page does not exist or may have moved. These pages are a good
              place to continue:
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {helpfulLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 transition-colors hover:border-blue-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-700"
                >
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {link.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {link.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
