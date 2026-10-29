import path from "node:path";
import fs from "node:fs/promises";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";

import puppeteer from "puppeteer";
import type { Page } from "puppeteer";

import { NOT_FOUND_HTML_FILE, publicRoutes, routeHtmlFile } from "../src/data/publicRoutes";

const staticDir = path.resolve(process.cwd(), "dist");
const port = 4173;

/** Path rendered to produce dist/404.html. It must not match any app route. */
const NOT_FOUND_RENDER_PATH = "/__prerender-not-found";

interface PrerenderTarget {
  /** URL path loaded in the headless browser. */
  renderPath: string;
  /** File written relative to dist/. */
  outputFile: string;
}

const targets: PrerenderTarget[] = [
  ...publicRoutes.map((route) => ({
    renderPath: route.path,
    outputFile: routeHtmlFile(route.path),
  })),
  { renderPath: NOT_FOUND_RENDER_PATH, outputFile: NOT_FOUND_HTML_FILE },
];

const contentTypes: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
  ".txt": "text/plain",
  ".ico": "image/x-icon",
  ".map": "application/json",
  ".wasm": "application/wasm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

/** Candidate files for a request path, mirroring Cloudflare Pages' flat-file matching. */
const candidateFiles = (pathname: string) => {
  const normalized = path.normalize(decodeURIComponent(pathname)).replace(/^\.{2,}/, "");
  const safePath = normalized.replace(/^\/+/, "").replace(/\/+$/, "");

  if (!safePath || safePath === ".") {
    return [path.join(staticDir, "index.html")];
  }

  if (path.extname(safePath) !== "") {
    return [path.join(staticDir, safePath)];
  }

  return [
    path.join(staticDir, `${safePath}.html`),
    path.join(staticDir, safePath, "index.html"),
  ];
};

const handleRequest = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);
    let filePath = path.join(staticDir, "index.html");
    let data: Buffer | null = null;

    for (const candidate of candidateFiles(url.pathname)) {
      try {
        data = await fs.readFile(candidate);
        filePath = candidate;
        break;
      } catch {
        // Try the next candidate.
      }
    }

    if (!data) {
      // SPA shell fallback so the router can render any route before its file exists.
      data = await fs.readFile(filePath);
    }

    const extension = path.extname(filePath);
    const contentType = contentTypes[extension] ?? "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Prerender server error");
  }
};

const startServer = () =>
  new Promise<ReturnType<typeof createServer>>((resolve) => {
    const server = createServer((req, res) => {
      void handleRequest(req, res);
    });

    server.listen(port, () => resolve(server));
  });

const waitForAppContent = async (page: Page, renderPath: string) => {
  try {
    await page.waitForSelector("#root > *", { timeout: 10000 });
    await page.waitForFunction(() => Boolean(document.querySelector("h1")), {
      timeout: 10000,
    });
  } catch (error) {
    throw new Error(`Route ${renderPath} did not render expected app content`, {
      cause: error,
    });
  }
};

/** Remove directory-index files left by older builds; they would trigger trailing-slash redirects. */
const removeLegacyDirectoryIndex = async (outputFile: string) => {
  if (outputFile === "index.html" || outputFile === NOT_FOUND_HTML_FILE) {
    return;
  }

  const legacyIndex = path.join(staticDir, outputFile.replace(/\.html$/, ""), "index.html");
  await fs.rm(legacyIndex, { force: true });
};

const run = async () => {
  const server = await startServer();
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const { renderPath, outputFile } of targets) {
      const page = await browser.newPage();

      try {
        const prerenderUrl = new URL(`http://localhost:${port}${renderPath}`);
        prerenderUrl.searchParams.set("prerender", "1");

        await page.goto(prerenderUrl.toString(), {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        await waitForAppContent(page, renderPath);

        const html = await page.content();
        const outputPath = path.join(staticDir, outputFile);
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, html, "utf8");
        await removeLegacyDirectoryIndex(outputFile);

        console.log(`[prerender] Wrote ${renderPath} -> ${outputFile}`);
      } catch (error) {
        throw new Error(`[prerender] Failed route ${renderPath}`, { cause: error });
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
};

run().catch((error: unknown) => {
  console.error("[prerender] Failed to prerender routes.");
  console.error(error);
  process.exit(1);
});
