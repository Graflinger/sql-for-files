import { describe, expect, it } from "vitest";

import { guidePath, guides } from "./guides";
import { allLessons, lessonPath } from "./lessons";
import { publicRoutes } from "./publicRoutes";

describe("publicRoutes", () => {
  const routePaths = publicRoutes.map((route) => route.path);

  it("does not contain duplicate paths", () => {
    expect(new Set(routePaths).size).toBe(routePaths.length);
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
