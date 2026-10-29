import fs from "node:fs/promises";
import path from "node:path";

import { guidePath, guides } from "../src/data/guides";
import { allLessons, chapterForLesson, lessonDescription, lessonPath } from "../src/data/lessons";
import {
  NOT_FOUND_HTML_FILE,
  publicRoutes,
  routeHtmlFile,
  routeUrl,
  SITE_URL,
} from "../src/data/publicRoutes";

/**
 * Validates the production build in dist/ for technical SEO regressions.
 *
 * Run after `npm run build`. Every check here guards a specific issue found in
 * the SEO audit; failures explain which rule broke and why it matters.
 */

const distDir = path.resolve(process.cwd(), "dist");
const publicDir = path.resolve(process.cwd(), "public");
const legacyBasePath = "/sql-for-files/";
const errors: string[] = [];

const routePaths = new Set(publicRoutes.map((route) => route.path));
const routeUrls = new Set(publicRoutes.map((route) => routeUrl(route.path)));

/** Static files that may be referenced by absolute URL (structured data, llms.txt, robots.txt). */
const allowedStaticUrls = new Set(
  ["/og-image.png", "/twitter-image.png", "/sitemap.xml", "/llms.txt", "/favicon.svg"].map(
    (file) => `${SITE_URL}${file}`
  )
);

/** Legal pages do not need structured data; every content page does. */
const ROUTES_WITHOUT_STRUCTURED_DATA = new Set(["/privacy", "/legal"]);

const fail = (message: string) => {
  errors.push(message);
};

const check = (condition: boolean, message: string) => {
  if (!condition) {
    fail(message);
  }
};

const exists = async (filePath: string) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const decodeEntities = (value: string) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ");

const textContent = (html: string) =>
  decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

const metaContent = (html: string, attribute: "name" | "property", key: string) =>
  [...html.matchAll(new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="([^"]*)"`, "g"))].map(
    (match) => decodeEntities(match[1])
  );

const headOf = (html: string) => html.split("</head>")[0] ?? "";
const bodyOf = (html: string) => html.split(/<body[^>]*>/)[1] ?? "";

/** Collect all string values from parsed JSON-LD. */
const collectStrings = (value: unknown, keyPath: string[] = []): Array<{ key: string; value: string }> => {
  if (typeof value === "string") {
    return [{ key: keyPath.join("."), value }];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectStrings(item, [...keyPath, String(index)]));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => collectStrings(item, [...keyPath, key]));
  }
  return [];
};

const collectKeys = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectKeys);
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => [key, ...collectKeys(item)]);
  }
  return [];
};

/** Internal link targets must be canonical route paths that Cloudflare serves with 200. */
const validateInternalHref = (source: string, href: string) => {
  if (href.startsWith("//") || href.startsWith("/cdn-cgi/")) {
    return;
  }

  const target = href.startsWith(SITE_URL) ? href.slice(SITE_URL.length) || "/" : href;
  const withoutFragment = target.split("#")[0].split("?")[0];

  if (withoutFragment === "") {
    return; // same-page fragment such as "#section"
  }

  const lastSegment = withoutFragment.split("/").pop() ?? "";
  if (lastSegment.includes(".")) {
    return; // static asset such as /favicon.svg or /assets/index.css
  }

  check(
    routePaths.has(withoutFragment),
    `${source}: internal link ${href} must point to a public route in canonical form (no trailing slash)`
  );
};

interface RenderedRoute {
  path: string;
  title: string;
  description: string;
  h1: string;
}

const validateRoute = async (routePath: string): Promise<RenderedRoute | null> => {
  const htmlFile = routeHtmlFile(routePath);
  const htmlPath = path.join(distDir, htmlFile);
  const canonical = routeUrl(routePath);

  if (!(await exists(htmlPath))) {
    fail(`${routePath}: missing dist/${htmlFile}; Cloudflare Pages would not serve ${canonical} with 200`);
    return null;
  }

  if (routePath !== "/") {
    const directoryIndex = path.join(distDir, routePath, "index.html");
    check(
      !(await exists(directoryIndex)),
      `${routePath}: dist${routePath}/index.html must not exist; Cloudflare Pages would 308-redirect ${canonical} to a trailing-slash URL`
    );
  }

  const html = await fs.readFile(htmlPath, "utf8");
  const head = headOf(html);
  const body = bodyOf(html);

  const titles = [...head.matchAll(/<title>([^<]*)<\/title>/g)].map((match) => decodeEntities(match[1]));
  check(titles.length === 1, `${routePath}: must have exactly one <title>`);

  const descriptions = metaContent(head, "name", "description");
  check(descriptions.length === 1, `${routePath}: must have exactly one meta description`);
  const description = descriptions[0] ?? "";
  check(
    description.length >= 70 && description.length <= 170,
    `${routePath}: meta description should be 70-170 characters (got ${description.length})`
  );

  const canonicals = [...head.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/g)].map((match) => match[1]);
  check(canonicals.length === 1, `${routePath}: must have exactly one canonical link`);
  check(canonicals[0] === canonical, `${routePath}: canonical must be ${canonical} (got ${canonicals[0]})`);

  const ogUrls = metaContent(head, "property", "og:url");
  check(ogUrls.length === 1 && ogUrls[0] === canonical, `${routePath}: og:url must equal ${canonical}`);

  const robots = metaContent(head, "name", "robots");
  check(robots.length === 1 && robots[0] === "index,follow", `${routePath}: robots meta must be index,follow`);

  check(
    metaContent(head, "name", "twitter:card").length === 1,
    `${routePath}: twitter:card must use the name attribute`
  );

  const h1s = [...body.matchAll(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/g)].map((match) => textContent(match[1]));
  check(h1s.length === 1, `${routePath}: must render exactly one h1 (got ${h1s.length})`);

  for (const artifact of ["localhost", "HeadlessChrome", "prerender=1"]) {
    check(!html.includes(artifact), `${routePath}: prerendered HTML must not contain "${artifact}"`);
  }
  check(!html.includes(legacyBasePath), `${routePath}: must not contain ${legacyBasePath}`);

  for (const match of body.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    const href = decodeEntities(match[1]);
    if (href.startsWith("/") || href.startsWith(SITE_URL)) {
      validateInternalHref(routePath, href);
    }
  }

  const jsonLdBlocks = [...head.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  check(
    jsonLdBlocks.length > 0 || ROUTES_WITHOUT_STRUCTURED_DATA.has(routePath),
    `${routePath}: must include structured data`
  );
  for (const [, json] of jsonLdBlocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      fail(`${routePath}: structured data must be valid JSON`);
      continue;
    }

    for (const key of ["aggregateRating", "review", "ratingValue", "reviewCount"]) {
      check(
        !collectKeys(parsed).includes(key),
        `${routePath}: structured data must not contain ${key} (no unverified ratings or reviews)`
      );
    }

    for (const { key, value } of collectStrings(parsed)) {
      if (!value.startsWith(SITE_URL)) {
        continue;
      }
      check(
        routeUrls.has(value) || allowedStaticUrls.has(value),
        `${routePath}: structured data ${key} references ${value}, which is not a canonical public URL`
      );
    }
  }

  return { path: routePath, title: titles[0] ?? "", description, h1: h1s[0] ?? "" };
};

/** Lesson pages must expose the full lesson in static HTML for crawlers that do not run the editor. */
const validateLessonPages = async () => {
  for (const lesson of allLessons) {
    const routePath = lessonPath(lesson.id);
    const chapter = chapterForLesson(lesson.id);
    if (!routePath || !chapter) {
      fail(`${lesson.id}: lesson has no route`);
      continue;
    }

    const htmlPath = path.join(distDir, routeHtmlFile(routePath));
    if (!(await exists(htmlPath))) {
      continue; // reported by validateRoute
    }
    const html = await fs.readFile(htmlPath, "utf8");
    const body = textContent(bodyOf(html));
    const description = metaContent(headOf(html), "name", "description")[0];

    check(description === lessonDescription(lesson), `${routePath}: meta description must be the lesson summary`);
    check(body.includes(lesson.title), `${routePath}: page must contain the lesson title`);
    if (lesson.challenge) {
      check(
        body.includes(textContent(lesson.challenge.prompt)),
        `${routePath}: page must contain the challenge prompt`
      );
    }
    check(html.includes('href="/learn-sql"'), `${routePath}: page must link to /learn-sql`);
    if (chapter.guideSlug) {
      check(
        html.includes(`href="${guidePath(chapter.guideSlug)}"`),
        `${routePath}: page must link to its companion guide ${guidePath(chapter.guideSlug)}`
      );
    }
    check(html.includes('"@type":"LearningResource"'), `${routePath}: must include LearningResource structured data`);
    check(body.split(" ").length >= 150, `${routePath}: lesson page should contain at least 150 words of static text`);
  }
};

const validateHomepage = async () => {
  const html = await fs.readFile(path.join(distDir, "index.html"), "utf8");
  const h1 = textContent(bodyOf(html).match(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/)?.[1] ?? "");
  check(
    /^Query, join, and analyze your (CSV|JSON|Parquet) files with SQL$/.test(h1),
    `/: homepage h1 must read as one file type, e.g. "Query, join, and analyze your CSV files with SQL" (got "${h1}")`
  );
};

const validateNotFoundPage = async () => {
  const htmlPath = path.join(distDir, NOT_FOUND_HTML_FILE);
  if (!(await exists(htmlPath))) {
    fail(`dist/${NOT_FOUND_HTML_FILE} is missing; Cloudflare Pages would serve the homepage with 200 for unknown URLs`);
    return;
  }

  const html = await fs.readFile(htmlPath, "utf8");
  const head = headOf(html);
  check(metaContent(head, "name", "robots")[0] === "noindex", "404.html must have robots noindex");
  check(!/<link\s+rel="canonical"/.test(head), "404.html must not declare a canonical URL");
  check(!metaContent(head, "property", "og:url").length, "404.html must not declare og:url");
  check(/<h1[^>]*>\s*Page not found\s*<\/h1>/.test(html), "404.html must render the not-found page");
  check(!html.includes("WebApplication"), "404.html must not contain homepage content");
};

const validateCloudflareConfig = async () => {
  const headersPath = path.join(distDir, "_headers");
  const redirectsPath = path.join(distDir, "_redirects");

  if (await exists(headersPath)) {
    const headers = await fs.readFile(headersPath, "utf8");
    for (const host of ["https://:project.pages.dev/*", "https://:version.:project.pages.dev/*"]) {
      check(
        new RegExp(`${host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n\\s+X-Robots-Tag: noindex`).test(headers),
        `_headers must send X-Robots-Tag: noindex for ${host} so pages.dev duplicates stay out of search`
      );
    }
  } else {
    fail("dist/_headers is missing");
  }

  if (await exists(redirectsPath)) {
    const redirects = await fs.readFile(redirectsPath, "utf8");
    check(
      /^\/sql-for-files\/\*\s+\/:splat\s+301$/m.test(redirects),
      "_redirects must 301 the legacy /sql-for-files/* base path"
    );
  } else {
    fail("dist/_redirects is missing");
  }

  check(await exists(path.join(distDir, "favicon.ico")), "dist/favicon.ico is missing");
};

const validateSitemap = async () => {
  const [distSitemap, publicSitemap] = await Promise.all([
    fs.readFile(path.join(distDir, "sitemap.xml"), "utf8"),
    fs.readFile(path.join(publicDir, "sitemap.xml"), "utf8"),
  ]);
  check(distSitemap === publicSitemap, "public/sitemap.xml is stale; run npm run generate:sitemap");

  const locs = [...distSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  check(new Set(locs).size === locs.length, "sitemap must not contain duplicate URLs");
  check(!distSitemap.includes(legacyBasePath), `sitemap must not contain ${legacyBasePath}`);

  for (const loc of locs) {
    check(routeUrls.has(loc), `sitemap URL ${loc} is not a canonical public route`);
  }
  for (const route of publicRoutes) {
    const loc = routeUrl(route.path);
    check(locs.includes(loc), `sitemap missing ${loc}`);
    check(
      distSitemap.includes(`<loc>${loc}</loc>\n    <lastmod>${route.lastmod}</lastmod>`),
      `sitemap must list lastmod ${route.lastmod} for ${loc}`
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  for (const [, lastmod] of distSitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
    check(lastmod <= today, `sitemap lastmod ${lastmod} must not be in the future`);
  }
};

const validateRobots = async () => {
  const robots = await fs.readFile(path.join(distDir, "robots.txt"), "utf8");
  check(
    robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`),
    "robots.txt must reference the canonical sitemap URL"
  );
  check(!/^Disallow:\s*\/\s*$/m.test(robots), "robots.txt must not disallow the whole site");
};

const validateLlmsTxt = async () => {
  const [distLlms, publicLlms] = await Promise.all([
    fs.readFile(path.join(distDir, "llms.txt"), "utf8"),
    fs.readFile(path.join(publicDir, "llms.txt"), "utf8"),
  ]);
  check(distLlms === publicLlms, "public/llms.txt is stale; run npm run generate:llms");

  const urls = [...distLlms.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((match) => match[1]);
  for (const url of urls) {
    if (!url.startsWith(SITE_URL)) {
      continue;
    }
    check(routeUrls.has(url), `llms.txt URL ${url} is not a canonical public route`);
  }

  for (const guide of guides) {
    check(urls.includes(routeUrl(guidePath(guide.slug))), `llms.txt must list guide ${guide.slug}`);
  }
  for (const lesson of allLessons) {
    const lessonRoute = lessonPath(lesson.id);
    check(Boolean(lessonRoute && urls.includes(routeUrl(lessonRoute))), `llms.txt must list lesson ${lesson.id}`);
  }
};

const STOPWORDS = new Set([
  "a", "an", "and", "the", "in", "with", "for", "to", "of", "your", "how", "sql", "files", "file",
  "what", "is", "it", "use", "why",
  // Shared lesson-title suffix tokens; they say nothing about the page topic.
  "interactive", "lesson", "learn",
]);

const titleTokens = (title: string) =>
  new Set(
    title
      .replace(/\|\s*SQL for Files$/i, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token && !STOPWORDS.has(token))
  );

const jaccard = (a: Set<string>, b: Set<string>) => {
  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
};

/**
 * Keyword cannibalization guard: indexable pages must not share titles, H1s,
 * or descriptions, and no two titles may be near-duplicates.
 */
const validateUniqueness = (rendered: RenderedRoute[]) => {
  for (const field of ["title", "description", "h1"] as const) {
    const seen = new Map<string, string>();
    for (const route of rendered) {
      const value = route[field].toLowerCase();
      const previous = seen.get(value);
      check(!previous, `${route.path}: ${field} duplicates ${previous}`);
      seen.set(value, route.path);
    }
  }

  const SIMILARITY_LIMIT = 0.7;
  for (let i = 0; i < rendered.length; i += 1) {
    for (let j = i + 1; j < rendered.length; j += 1) {
      const similarity = jaccard(titleTokens(rendered[i].title), titleTokens(rendered[j].title));
      check(
        similarity < SIMILARITY_LIMIT,
        `titles of ${rendered[i].path} and ${rendered[j].path} are near-duplicates (similarity ${similarity.toFixed(2)}); give each page a distinct search intent`
      );
    }
  }
};

const rendered: RenderedRoute[] = [];
for (const route of publicRoutes) {
  const result = await validateRoute(route.path);
  if (result) {
    rendered.push(result);
  }
}

await validateLessonPages();
await validateHomepage();
await validateNotFoundPage();
await validateCloudflareConfig();
await validateSitemap();
await validateRobots();
await validateLlmsTxt();
validateUniqueness(rendered);

if (errors.length > 0) {
  console.error(`[seo] ${errors.length} problem(s) found:`);
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

console.log(
  `[seo] Validated ${publicRoutes.length} routes, 404 page, sitemap, robots.txt, llms.txt, and Cloudflare config`
);
