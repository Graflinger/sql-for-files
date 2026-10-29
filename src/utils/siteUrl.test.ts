import { describe, expect, it } from "vitest";

import { canonicalUrl, normalizeSitePath } from "./siteUrl";

describe("siteUrl", () => {
  it("removes trailing slashes, queries, and fragments from site paths", () => {
    expect(normalizeSitePath("/docs/")).toBe("/docs");
    expect(normalizeSitePath("/editor/chapter1/01/")).toBe("/editor/chapter1/01");
    expect(normalizeSitePath("/learn-sql#joins")).toBe("/learn-sql");
    expect(normalizeSitePath("/editor?prerender=1")).toBe("/editor");
    expect(normalizeSitePath("guides")).toBe("/guides");
  });

  it("keeps the homepage as a single slash", () => {
    expect(normalizeSitePath("/")).toBe("/");
    expect(normalizeSitePath("")).toBe("/");
    expect(canonicalUrl("/")).toBe("https://sqlforfiles.app/");
  });

  it("builds canonical URLs in the form Cloudflare Pages serves with 200", () => {
    expect(canonicalUrl("/docs/")).toBe("https://sqlforfiles.app/docs");
    expect(canonicalUrl("/guides/sql-null-missing-values")).toBe(
      "https://sqlforfiles.app/guides/sql-null-missing-values"
    );
  });

  it("passes absolute URLs through unchanged", () => {
    expect(canonicalUrl("https://example.com/image.png")).toBe("https://example.com/image.png");
  });
});
