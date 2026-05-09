import fs from "node:fs/promises";
import path from "node:path";

import { publicRoutes, SITE_URL } from "../src/data/publicRoutes";

const distDir = path.resolve(process.cwd(), "dist");
const sitemapPath = path.resolve(process.cwd(), "public", "sitemap.xml");
const legacyBasePath = "/sql-for-files/";

const routeUrl = (routePath: string) =>
  routePath === "/" ? `${SITE_URL}/` : `${SITE_URL}${routePath}`;

const htmlPathForRoute = (routePath: string) =>
  routePath === "/"
    ? path.join(distDir, "index.html")
    : path.join(distDir, routePath, "index.html");

const countMatches = (content: string, pattern: RegExp) =>
  [...content.matchAll(pattern)].length;

const requireMatch = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const validateRoute = async (routePath: string) => {
  const htmlPath = htmlPathForRoute(routePath);
  const html = await fs.readFile(htmlPath, "utf8");
  const canonicalUrl = routeUrl(routePath);

  requireMatch(
    countMatches(html, /<title>[^<]+<\/title>/g) === 1,
    `${routePath} must have exactly one <title>`
  );
  requireMatch(
    countMatches(html, /<meta\s+name="description"\s+content="[^"]+"[^>]*>/g) === 1,
    `${routePath} must have exactly one meta description`
  );
  requireMatch(
    countMatches(html, /<link\s+rel="canonical"\s+href="[^"]+"[^>]*>/g) === 1,
    `${routePath} must have exactly one canonical link`
  );
  requireMatch(
    html.includes(`<link rel="canonical" href="${canonicalUrl}"`),
    `${routePath} canonical must be ${canonicalUrl}`
  );
  requireMatch(
    countMatches(html, /<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/g) >= 1,
    `${routePath} must render at least one h1`
  );
  requireMatch(
    !html.includes(legacyBasePath),
    `${routePath} must not contain ${legacyBasePath}`
  );
};

const validateSitemap = async () => {
  const sitemap = await fs.readFile(sitemapPath, "utf8");

  requireMatch(
    !sitemap.includes(legacyBasePath),
    `sitemap must not contain ${legacyBasePath}`
  );

  publicRoutes.forEach((route) => {
    const loc = routeUrl(route.path);
    requireMatch(sitemap.includes(`<loc>${loc}</loc>`), `sitemap missing ${loc}`);
    requireMatch(
      sitemap.includes(`<lastmod>${route.lastmod}</lastmod>`),
      `sitemap missing lastmod ${route.lastmod} for ${loc}`
    );
  });
};

for (const route of publicRoutes) {
  await validateRoute(route.path);
}

await validateSitemap();

console.log(`[seo] Validated ${publicRoutes.length} prerendered routes`);
