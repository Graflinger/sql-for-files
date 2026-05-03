import path from "node:path";
import fs from "node:fs/promises";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";

import puppeteer from "puppeteer";
import type { Page } from "puppeteer";

import { publicRoutes } from "../src/data/publicRoutes";

const routes = publicRoutes.map((route) => route.path);
const staticDir = path.resolve(process.cwd(), "dist");
const port = 4173;

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
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const resolveFilePath = (pathname: string) => {
  const normalized = path.normalize(pathname).replace(/^\.{2,}/, "");
  const safePath = normalized.replace(/^\/+/, "");
  const hasExtension = path.extname(safePath) !== "";

  if (!safePath || safePath === ".") {
    return path.join(staticDir, "index.html");
  }

  if (!hasExtension) {
    return path.join(staticDir, safePath, "index.html");
  }

  return path.join(staticDir, safePath);
};

const handleRequest = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);
    let filePath = resolveFilePath(url.pathname);

    let data;
    try {
      data = await fs.readFile(filePath);
    } catch {
      filePath = path.join(staticDir, "index.html");
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

const outputPathForRoute = (route: string) => {
  if (route === "/") {
    return path.join(staticDir, "index.html");
  }

  return path.join(staticDir, route, "index.html");
};

const waitForAppContent = async (page: Page, route: string) => {
  try {
    await page.waitForSelector("#root > *", { timeout: 10000 });
    await page.waitForFunction(() => Boolean(document.querySelector("h1")), {
      timeout: 10000,
    });
  } catch (error) {
    throw new Error(`Route ${route} did not render expected app content`, {
      cause: error,
    });
  }
};

const run = async () => {
  const server = await startServer();
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const route of routes) {
      const page = await browser.newPage();

      try {
        const prerenderUrl = new URL(`http://localhost:${port}${route}`);
        prerenderUrl.searchParams.set("prerender", "1");

        await page.goto(prerenderUrl.toString(), {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        await waitForAppContent(page, route);

        const html = await page.content();
        const outputPath = outputPathForRoute(route);
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, html, "utf8");

        console.log(`[prerender] Wrote ${route}`);
      } catch (error) {
        throw new Error(`[prerender] Failed route ${route}`, { cause: error });
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
