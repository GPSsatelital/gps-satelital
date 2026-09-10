// Recibe la sesión abierta del navegador y la deja en un archivo temporal, FUERA del repo.
//
// Para tomar las capturas reales del manual hace falta un Chrome que esté logueado en la app.
// Un Chrome nuevo arranca sin sesión, y la sesión vive en el `localStorage` del navegador que ya
// está abierto. Este recibidor es el puente: la app le entrega su sesión por localhost y nadie
// más la ve — ni queda escrita en el repo, ni pasa por el chat, ni se sube a ningún lado.
//
// Escucha UNA sola vez y se apaga. El archivo se borra al terminar las capturas.

import { createServer } from "node:http";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const DESTINO = join(tmpdir(), "mg-sesion-manual.json");
const PUERTO = 9977;

const server = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") { res.writeHead(204).end(); return; }
  if (req.method !== "POST") { res.writeHead(405).end(); return; }

  let cuerpo = "";
  req.on("data", c => { cuerpo += c; });
  req.on("end", () => {
    writeFileSync(DESTINO, cuerpo, "utf8");
    res.writeHead(200).end("ok");
    console.log("sesion recibida en " + DESTINO);
    server.close(() => process.exit(0));
  });
});

server.listen(PUERTO, "127.0.0.1", () => console.log("esperando en http://localhost:" + PUERTO));
setTimeout(() => { console.error("nadie envio la sesion"); process.exit(1); }, 120000);
