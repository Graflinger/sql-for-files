import { chapters, lessonPath } from "./lessons";
import { guidePath, guides } from "./guides";

export const SITE_URL = "https://sqlforfiles.app";

export interface PublicRoute {
  path: string;
  changefreq: "weekly" | "monthly" | "yearly";
  priority: string;
  title?: string;
  section?: string;
}

export const staticRoutes: PublicRoute[] = [
  {
    path: "/",
    changefreq: "weekly",
    priority: "1.0",
  },
  {
    path: "/editor",
    changefreq: "monthly",
    priority: "0.9",
  },
  {
    path: "/docs",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/guides",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/learn-sql",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/query-csv-with-sql",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/query-json-with-sql",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/query-parquet-with-sql",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/duckdb-wasm-sql-editor",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/private-local-data-analysis",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/sql-examples-for-files",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/privacy",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/legal",
    changefreq: "yearly",
    priority: "0.3",
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
}));

export const publicRoutes: PublicRoute[] = [
  ...staticRoutes,
  ...guideRoutes,
  ...learnRoutes,
];
