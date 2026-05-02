import fs from "node:fs/promises";
import path from "node:path";

import { publicRoutes, SITE_URL } from "./public-routes.mjs";

const outputPath = path.resolve(process.cwd(), "public", "sitemap.xml");
const lastmod = new Date().toISOString().slice(0, 10);

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const routeToUrl = ({ path: routePath, changefreq, priority }) => {
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
