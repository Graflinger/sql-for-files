import fs from "node:fs/promises";
import path from "node:path";

import { publicRoutes, SITE_URL } from "../src/data/publicRoutes";
import type { PublicRoute } from "../src/data/publicRoutes";

const outputPath = path.resolve(process.cwd(), "public", "sitemap.xml");

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const routeToUrl = ({ path: routePath, changefreq, priority, lastmod }: PublicRoute) => {
  const loc = routePath === "/" ? `${SITE_URL}/` : `${SITE_URL}${routePath}`;

  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
};

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes.map(routeToUrl).join("\n\n")}
</urlset>
`;

await fs.writeFile(outputPath, sitemap, "utf8");
console.log(`[sitemap] Wrote ${publicRoutes.length} URLs to ${outputPath}`);
