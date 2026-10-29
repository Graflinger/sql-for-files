/** Production origin used for canonical URLs, sitemap entries, and structured data. */
export const SITE_URL = "https://sqlforfiles.app";

/** Public product name. */
export const SITE_NAME = "SQL for Files";

/**
 * Normalize a site path to the public URL form.
 *
 * Pages are deployed as flat `name.html` files on Cloudflare Pages, which serves
 * `/name` directly with 200 and permanently redirects `/name/` to `/name`.
 * Canonical URLs, sitemap entries, internal links, and llms.txt therefore use
 * the form without a trailing slash (except for the homepage `/`).
 */
export function normalizeSitePath(path: string): string {
  const withoutHash = path.split("#")[0].split("?")[0];
  const withLeadingSlash = withoutHash.startsWith("/") ? withoutHash : `/${withoutHash}`;
  const trimmed = withLeadingSlash.replace(/\/+$/, "");

  return trimmed === "" ? "/" : trimmed;
}

/** Build an absolute canonical URL for a site path; absolute URLs pass through unchanged. */
export function canonicalUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalized = normalizeSitePath(path);
  return normalized === "/" ? `${SITE_URL}/` : `${SITE_URL}${normalized}`;
}
