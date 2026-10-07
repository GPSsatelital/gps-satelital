// Sirve esta carpeta en http://127.0.0.1:8766 para grabar y revisar los videos con Chrome sin ventana.
// POST /guardar?nombre=x guarda el archivo en videos/ (o en ?carpeta=...). Solo escucha en este computador.
// Uso: node docs/capacitacion/servidor-grabacion.mjs
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, extname, resolve, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const RAIZ = dirname(fileURLToPath(import.meta.url));
const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png", ".wav": "audio/wav", ".mp4": "video/mp4", ".json": "application/json" };
createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "POST" && url.pathname === "/guardar") {
    const partes = []; for await (const c of req) partes.push(c);
    const carpeta = resolve(RAIZ, url.searchParams.get("carpeta") || "videos");
    if (!carpeta.startsWith(RAIZ)) { res.writeHead(403); res.end("no"); return; }
    await mkdir(carpeta, { recursive: true });
    const nombre = basename(url.searchParams.get("nombre") || "video.bin");
    await writeFile(join(carpeta, nombre), Buffer.concat(partes));
    console.log("guardado " + nombre);
    res.writeHead(200); res.end("ok"); return;
  }
  const ruta = resolve(RAIZ, "." + decodeURIComponent(url.pathname));
  if (!ruta.startsWith(RAIZ)) { res.writeHead(403); res.end("no"); return; }
  try {
    const b = await readFile(ruta);
    const tipo = TIPOS[extname(ruta)] || "application/octet-stream";
    // Los reproductores piden el video por pedazos (Range) para poder saltar: hay que contestarles como un servidor de verdad
    const rango = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
    if (rango && (rango[1] || rango[2])) {
      const desde = rango[1] ? Number(rango[1]) : Math.max(0, b.length - Number(rango[2]));
      const hasta = rango[1] && rango[2] ? Math.min(Number(rango[2]), b.length - 1) : b.length - 1;
      res.writeHead(206, { "Content-Type": tipo, "Accept-Ranges": "bytes", "Content-Range": `bytes ${desde}-${hasta}/${b.length}`, "Content-Length": hasta - desde + 1 });
      res.end(b.subarray(desde, hasta + 1)); return;
    }
    res.writeHead(200, { "Content-Type": tipo, "Accept-Ranges": "bytes", "Content-Length": b.length }); res.end(b);
  } catch { res.writeHead(404); res.end("no"); }
}).listen(8766, "127.0.0.1", () => console.log("grabación en http://127.0.0.1:8766"));
