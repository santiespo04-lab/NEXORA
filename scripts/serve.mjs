#!/usr/bin/env node
/*
  Servidor local sin dependencias para probar NEXORA.
  Soporta pedidos parciales (Range), necesarios para adelantar el video en Safari y iPhone.

  npm run dev      → sirve el proyecto tal cual en http://localhost:3000
  npm run preview  → genera dist/ y lo sirve en http://localhost:4000 (igual que en Vercel)
*/
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

export function createServer(dir) {
  const root = path.resolve(dir);
  return http.createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    let file = path.join(root, pathname);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");

    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("404 · No encontrado");
        return;
      }
      const head = {
        "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-store",
      };
      const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
      if (m && (m[1] !== "" || m[2] !== "")) {
        const start = m[1] === "" ? Math.max(0, st.size - Number(m[2])) : Number(m[1]);
        const end = m[1] !== "" && m[2] !== "" ? Math.min(Number(m[2]), st.size - 1) : st.size - 1;
        if (start > end || start >= st.size) {
          res.writeHead(416, { "Content-Range": `bytes */${st.size}` }).end();
          return;
        }
        res.writeHead(206, { ...head, "Content-Range": `bytes ${start}-${end}/${st.size}`, "Content-Length": end - start + 1 });
        if (req.method === "HEAD") return res.end();
        fs.createReadStream(file, { start, end }).pipe(res);
        return;
      }
      res.writeHead(200, { ...head, "Content-Length": st.size });
      if (req.method === "HEAD") return res.end();
      fs.createReadStream(file).pipe(res);
    });
  });
}

const runDirectly = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (runDirectly) {
  const [dir = ".", port = process.env.PORT || 3000] = process.argv.slice(2);
  const root = path.resolve(dir);
  if (!fs.existsSync(path.join(root, "index.html"))) {
    console.error(`No hay index.html en ${root}. Si querés probar la versión de producción, corré "npm run build" primero.`);
    process.exit(1);
  }
  createServer(root).listen(Number(port), () => {
    console.log(`\n  NEXORA → http://localhost:${port}   (${path.relative(process.cwd(), root) || "proyecto"})\n  Ctrl + C para cortar.\n`);
  });
}
