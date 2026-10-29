import { SITE_URL } from "../src/data/publicRoutes";

/**
 * Read-only HTTP checks for a deployed SQL for Files site.
 *
 * Usage:
 *   npm run verify:live                                   # https://sqlforfiles.app
 *   npm run verify:live -- --base=http://localhost:8788   # e.g. `wrangler pages dev dist`
 *   npm run verify:live -- --pages-dev=https://sql-for-files.pages.dev
 *   npm run verify:live -- --hosts                        # also check www/http redirects
 *
 * Every sitemap URL must answer 200 directly (no redirect) and declare itself as
 * canonical; trailing-slash variants must redirect to it; unknown paths must
 * return a real 404.
 */

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, "").split("=");
    return [key, value ?? "true"] as const;
  })
);

const base = (args.get("base") ?? SITE_URL).replace(/\/$/, "");
const pagesDevBase = args.get("pages-dev")?.replace(/\/$/, "");
const checkHosts = args.has("hosts");
const results: CheckResult[] = [];

const record = (name: string, ok: boolean, detail: string) => {
  results.push({ name, ok, detail });
};

const request = (url: string) =>
  fetch(url, { redirect: "manual", headers: { "User-Agent": "sqlforfiles-verify-live/1.0" } });

const toBase = (url: string) => url.replace(SITE_URL, base);

/** Run async tasks with a small concurrency limit to stay polite to the server. */
async function mapLimit<T>(items: T[], limit: number, task: (item: T) => Promise<void>) {
  const queue = [...items];
  const workers = Array.from({ length: limit }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item !== undefined) {
        await task(item);
      }
    }
  });
  await Promise.all(workers);
}

const sitemapResponse = await request(`${base}/sitemap.xml`);
const sitemap = await sitemapResponse.text();
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
record("sitemap.xml", sitemapResponse.status === 200 && locs.length > 0, `${sitemapResponse.status}, ${locs.length} URLs`);

const failures: string[] = [];
await mapLimit(locs, 6, async (loc) => {
  const response = await request(toBase(loc));
  if (response.status !== 200) {
    failures.push(`${loc} -> ${response.status} ${response.headers.get("location") ?? ""}`);
    return;
  }
  const html = await response.text();
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
  if (canonical !== loc) {
    failures.push(`${loc} declares canonical ${canonical}`);
  }
});
record(
  "every sitemap URL answers 200 and is self-canonical",
  failures.length === 0,
  failures.length === 0 ? `${locs.length} URLs` : failures.slice(0, 10).join("; ")
);

const slashSamples = locs.filter((loc) => loc !== `${SITE_URL}/`).slice(0, 5);
for (const loc of [...slashSamples, `${SITE_URL}/editor/chapter1/01`]) {
  const response = await request(`${toBase(loc)}/`);
  const location = response.headers.get("location") ?? "";
  const target = new URL(location, base).pathname;
  record(
    `trailing slash redirects: ${new URL(loc).pathname}/`,
    [301, 308].includes(response.status) && target === new URL(loc).pathname,
    `${response.status} -> ${location}`
  );
}

for (const path of ["/this-page-does-not-exist", "/editor/chapter99/99", "/guides/does-not-exist", "/docs/extra"]) {
  const response = await request(`${base}${path}`);
  const body = await response.text();
  record(
    `unknown path returns 404: ${path}`,
    response.status === 404 && body.includes("Page not found") && body.includes('content="noindex"'),
    `${response.status}`
  );
}

const legacy = await request(`${base}/sql-for-files/docs`);
record(
  "legacy /sql-for-files/* redirects",
  legacy.status === 301 && new URL(legacy.headers.get("location") ?? "", base).pathname === "/docs",
  `${legacy.status} -> ${legacy.headers.get("location")}`
);

for (const [path, type] of [
  ["/robots.txt", "text/plain"],
  ["/llms.txt", "text/plain"],
  ["/favicon.ico", "image/"],
] as const) {
  const response = await request(`${base}${path}`);
  const contentType = response.headers.get("content-type") ?? "";
  record(`${path}`, response.status === 200 && contentType.includes(type), `${response.status} ${contentType}`);
}

const home = await (await request(`${base}/`)).text();
const asset = home.match(/\/assets\/[^"]+\.js/)?.[0];
if (asset) {
  const response = await request(`${base}${asset}`);
  const cacheControl = response.headers.get("cache-control") ?? "";
  record("hashed assets are cached immutably", cacheControl.includes("immutable"), cacheControl);
}

if (pagesDevBase) {
  const response = await request(`${pagesDevBase}/`);
  const robotsTag = response.headers.get("x-robots-tag") ?? "";
  record("pages.dev host is noindex", robotsTag.includes("noindex"), `X-Robots-Tag: ${robotsTag || "(missing)"}`);
}

if (checkHosts) {
  for (const [from, to] of [
    ["http://sqlforfiles.app/docs", `${SITE_URL}/docs`],
    ["https://www.sqlforfiles.app/docs", `${SITE_URL}/docs`],
    ["http://www.sqlforfiles.app/docs", `${SITE_URL}/docs`],
  ]) {
    const response = await request(from);
    const location = response.headers.get("location") ?? "";
    record(
      `host redirect: ${from}`,
      [301, 308].includes(response.status) && location === to,
      `${response.status} -> ${location || "(none)"}`
    );
  }
}

const width = Math.max(...results.map((result) => result.name.length));
results.forEach((result) => {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name.padEnd(width)}  ${result.detail}`);
});

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed for ${base}`);
process.exit(failed.length > 0 ? 1 : 0);
