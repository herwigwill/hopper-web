// Serves the production build like Vercel does: static files from dist/ with clean URLs, plus /api/waitlist.
// Used by the Playwright tests and for checking a build locally: `npm run build && npm run serve`.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { gzipSync } from "node:zlib";
import { handleWaitlist } from "../api/_lib/waitlist.ts";
import { toWebRequest, sendWebResponse } from "./node-request.mjs";

const root = new URL("../dist/", import.meta.url).pathname;
// The same security headers Vercel sends (vercel.json), so the CSP is enforced in local tests too.
const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
const globalHeaders = vercel.headers.find((h) => h.source === "/(.*)").headers.filter((h) => h.key !== "Strict-Transport-Security");
const port = Number(process.env.PORT ?? 4322);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
  ".webp": "image/webp", ".png": "image/png", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain",
};

async function file(path) {
  const clean = normalize(path).replace(/^(\.\.[/\\])+/, "");
  for (const candidate of [clean, `${clean}.html`, join(clean, "index.html")]) {
    try {
      const full = join(root, candidate);
      if ((await stat(full)).isFile()) return full;
    } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  for (const { key, value } of globalHeaders) res.setHeader(key, value.replace("; upgrade-insecure-requests", ""));
  if (url.pathname === "/api/waitlist") {
    const request = await toWebRequest(req, `http://${req.headers.host}`);
    return sendWebResponse(res, await handleWaitlist(request, process.env, req.socket.remoteAddress ?? "local"));
  }
  const found = await file(decodeURIComponent(url.pathname));
  const path = found ?? join(root, "404.html");
  res.statusCode = found ? 200 : 404;
  res.setHeader("Content-Type", types[extname(path)] ?? "application/octet-stream");
  // Compress text like Vercel does, so local performance numbers are comparable.
  const body = await readFile(path);
  if (/gzip/.test(req.headers["accept-encoding"] ?? "") && /\.(html|js|css|svg|xml|txt)$/.test(path)) {
    res.setHeader("Content-Encoding", "gzip");
    return res.end(gzipSync(body));
  }
  res.end(body);
}).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));
