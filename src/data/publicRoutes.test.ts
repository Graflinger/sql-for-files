import { describe, expect, it } from "vitest";

import { guidePath, guides } from "./guides";
import { allLessons, lessonPath } from "./lessons";
import { landingPages } from "./landingPages";
import { lessonById } from "./lessons";
import { guideBySlug } from "./guides";
import { publicRoutes, routeHtmlFile, routeUrl } from "./publicRoutes";

describe("publicRoutes", () => {
  const routePaths = publicRoutes.map((route) => route.path);

  it("does not contain duplicate paths", () => {
    expect(new Set(routePaths).size).toBe(routePaths.length);
  });

  it("has deterministic lastmod values", () => {
    publicRoutes.forEach((route) => {
      expect(route.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it("includes guide index and all guide articles", () => {
    expect(routePaths).toContain("/guides");

    guides.forEach((guide) => {
      expect(routePaths).toContain(guidePath(guide.slug));
    });
  });

  it("includes all learn SQL lesson routes", () => {
    allLessons.forEach((lesson) => {
      const path = lessonPath(lesson.id);

      expect(path).not.toBeNull();
      expect(routePaths).toContain(path);
    });
  });

  it("includes the high-intent static landing pages", () => {
    expect(routePaths).toEqual(
      expect.arrayContaining([
        "/",
        "/editor",
        "/docs",
        "/learn-sql",
        "/query-csv-with-sql",
        "/query-json-with-sql",
        "/query-parquet-with-sql",
        "/duckdb-wasm-sql-editor",
        "/private-local-data-analysis",
        "/sql-examples-for-files",
        "/privacy",
        "/legal",
      ])
    );
  });
});

describe("public route URL form", () => {
  it("never uses trailing slashes except for the homepage", () => {
    publicRoutes.forEach((route) => {
      expect(route.path === "/" || !route.path.endsWith("/")).toBe(true);
      expect(routeUrl(route.path).endsWith("/")).toBe(route.path === "/");
    });
  });

  it("maps routes to flat HTML files that Cloudflare Pages serves without redirects", () => {
    expect(routeHtmlFile("/")).toBe("index.html");
    expect(routeHtmlFile("/docs")).toBe("docs.html");
    expect(routeHtmlFile("/editor/chapter1/01")).toBe("editor/chapter1/01.html");
    expect(routeHtmlFile("/guides/sql-null-missing-values")).toBe("guides/sql-null-missing-values.html");
  });

  it("lists every landing page with a valid guide and lessons", () => {
    const routePathSet = new Set(publicRoutes.map((route) => route.path));

    Object.values(landingPages).forEach((page) => {
      expect(routePathSet.has(page.canonicalPath)).toBe(true);
      expect(guideBySlug(page.guideSlug), page.guideSlug).toBeDefined();
      page.lessonIds.forEach((lessonId) => expect(lessonById(lessonId), lessonId).toBeDefined());
      expect(page.faqs.length).toBeGreaterThan(0);
    });
  });
});
