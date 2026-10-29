import { chapters, lessonPath } from "./lessons";
import { guidePath, guides } from "./guides";
import { landingPageByPath } from "./landingPages";
import { canonicalUrl, SITE_URL } from "../utils/siteUrl";

export { SITE_URL };
/** Last content change for static pages that did not change in the SEO/Learn SQL update. */
export const STATIC_CONTENT_LASTMOD = "2026-05-03";
/** Last content change for the homepage, editor, guide index, and legal page. */
export const SITE_UPDATE_LASTMOD = "2026-10-29";
/** Last content change for /learn-sql and every lesson page. */
export const LEARN_SQL_LASTMOD = "2026-10-29";

export interface PublicRoute {
  path: string;
  changefreq: "weekly" | "monthly" | "yearly";
  priority: string;
  lastmod: string;
  title?: string;
  section?: string;
}

export const staticRoutes: PublicRoute[] = [
  {
    path: "/",
    changefreq: "weekly",
    priority: "1.0",
    lastmod: SITE_UPDATE_LASTMOD,
  },
  {
    path: "/editor",
    changefreq: "monthly",
    priority: "0.9",
    lastmod: SITE_UPDATE_LASTMOD,
  },
  {
    path: "/docs",
    changefreq: "monthly",
    priority: "0.8",
    lastmod: STATIC_CONTENT_LASTMOD,
  },
  {
    path: "/guides",
    changefreq: "monthly",
    priority: "0.8",
    lastmod: SITE_UPDATE_LASTMOD,
  },
  {
    path: "/learn-sql",
    changefreq: "monthly",
    priority: "0.8",
    lastmod: LEARN_SQL_LASTMOD,
  },
  {
    path: "/query-csv-with-sql",
    changefreq: "monthly",
    priority: "0.8",
    lastmod: landingPageByPath("/query-csv-with-sql")?.updatedAt ?? STATIC_CONTENT_LASTMOD,
  },
  {
    path: "/query-json-with-sql",
    changefreq: "monthly",
    priority: "0.8",
    lastmod: landingPageByPath("/query-json-with-sql")?.updatedAt ?? STATIC_CONTENT_LASTMOD,
  },
  {
    path: "/query-parquet-with-sql",
    changefreq: "monthly",
    priority: "0.8",
    lastmod: landingPageByPath("/query-parquet-with-sql")?.updatedAt ?? STATIC_CONTENT_LASTMOD,
  },
  {
    path: "/duckdb-wasm-sql-editor",
    changefreq: "monthly",
    priority: "0.8",
    lastmod: landingPageByPath("/duckdb-wasm-sql-editor")?.updatedAt ?? STATIC_CONTENT_LASTMOD,
  },
  {
    path: "/private-local-data-analysis",
    changefreq: "monthly",
    priority: "0.8",
    lastmod: landingPageByPath("/private-local-data-analysis")?.updatedAt ?? STATIC_CONTENT_LASTMOD,
  },
  {
    path: "/sql-examples-for-files",
    changefreq: "monthly",
    priority: "0.8",
    lastmod: landingPageByPath("/sql-examples-for-files")?.updatedAt ?? STATIC_CONTENT_LASTMOD,
  },
  {
    path: "/privacy",
    changefreq: "yearly",
    priority: "0.3",
    lastmod: STATIC_CONTENT_LASTMOD,
  },
  {
    path: "/legal",
    changefreq: "yearly",
    priority: "0.3",
    lastmod: SITE_UPDATE_LASTMOD,
  },
];

export const learnRoutes: PublicRoute[] = chapters.flatMap((chapter) =>
  chapter.lessons.flatMap((lesson) => {
    const path = lessonPath(lesson.id);
    return path
      ? [
          {
            path,
            title: lesson.title,
            section: chapter.title,
            changefreq: "monthly" as const,
            priority: "0.6",
            lastmod: LEARN_SQL_LASTMOD,
          },
        ]
      : [];
  })
);

export const guideRoutes: PublicRoute[] = guides.map((guide) => ({
  path: guidePath(guide.slug),
  title: guide.title,
  section: "Guides",
  changefreq: "monthly",
  priority: "0.7",
  lastmod: guide.updatedAt,
}));

export const publicRoutes: PublicRoute[] = [
  ...staticRoutes,
  ...guideRoutes,
  ...learnRoutes,
];

/** Absolute canonical URL for a public route (no trailing slash except `/`). */
export function routeUrl(routePath: string): string {
  return canonicalUrl(routePath);
}

/**
 * Relative file in `dist/` that serves a public route on Cloudflare Pages.
 *
 * Routes are written as flat `name.html` files so `/name` is served directly
 * with 200. A `name/index.html` layout would make Cloudflare 308-redirect
 * `/name` to `/name/`, which conflicts with the canonical URLs.
 */
export function routeHtmlFile(routePath: string): string {
  return routePath === "/" ? "index.html" : `${routePath.replace(/^\/+/, "")}.html`;
}

/** Output file for the prerendered not-found page served with a 404 status. */
export const NOT_FOUND_HTML_FILE = "404.html";
