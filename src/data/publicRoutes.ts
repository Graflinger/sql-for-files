import { chapters, lessonPath } from "./lessons";
import { guidePath, guides } from "./guides";

export const SITE_URL = "https://sqlforfiles.app";
export const STATIC_CONTENT_LASTMOD = "2026-05-03";
export const LEARN_SQL_LASTMOD = "2026-05-03";

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
    lastmod: STATIC_CONTENT_LASTMOD,
  },
  {
    path: "/editor",
    changefreq: "monthly",
    priority: "0.9",
    lastmod: STATIC_CONTENT_LASTMOD,
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
    lastmod: STATIC_CONTENT_LASTMOD,
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
    lastmod: STATIC_CONTENT_LASTMOD,
  },
  {
    path: "/query-json-with-sql",
    changefreq: "monthly",
    priority: "0.8",
    lastmod: STATIC_CONTENT_LASTMOD,
  },
  {
    path: "/query-parquet-with-sql",
    changefreq: "monthly",
    priority: "0.8",
    lastmod: STATIC_CONTENT_LASTMOD,
  },
  {
    path: "/duckdb-wasm-sql-editor",
    changefreq: "monthly",
    priority: "0.8",
    lastmod: STATIC_CONTENT_LASTMOD,
  },
  {
    path: "/private-local-data-analysis",
    changefreq: "monthly",
    priority: "0.8",
    lastmod: STATIC_CONTENT_LASTMOD,
  },
  {
    path: "/sql-examples-for-files",
    changefreq: "monthly",
    priority: "0.8",
    lastmod: STATIC_CONTENT_LASTMOD,
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
    lastmod: STATIC_CONTENT_LASTMOD,
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
