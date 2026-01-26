import path from "node:path";
import fs from "node:fs/promises";
import { createServer } from "node:http";
import puppeteer from "puppeteer";

const routes = ["/", "/docs", "/privacy", "/legal"];
const staticDir = path.resolve(process.cwd(), "dist");
const port = 4173;

const contentTypes = {
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

const resolveFilePath = (pathname) => {
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

const startServer = () =>
  new Promise((resolve) => {
    const server = createServer(async (req, res) => {
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
      } catch (error) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Prerender server error");
      }
    });

    server.listen(port, () => resolve(server));
  });

const outputPathForRoute = (route) => {
  if (route === "/") {
    return path.join(staticDir, "index.html");
  }

  return path.join(staticDir, route, "index.html");
};

const run = async () => {
  const server = await startServer();
  const browser = await puppeteer.launch();

  try {
    for (const route of routes) {
      const page = await browser.newPage();
      await page.goto(`http://localhost:${port}${route}`, {
        waitUntil: "networkidle0",
      });
      await new Promise((resolve) => setTimeout(resolve, 500));

      const html = await page.content();
      const outputPath = outputPathForRoute(route);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, html, "utf8");

      await page.close();
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
};

run().catch((error) => {
  console.error("[prerender] Failed to prerender routes.");
  console.error(error);
  process.exit(1);
});
