// Hace los 4 videos de la capacitación en MP4 (para mandarlos por WhatsApp y meterlos en PowerPoint):
//   1. graba con grabar-video.html en un Chrome sin ventana (sale "en pedazos", como lo entrega Chrome),
//   2. lo rearma como un MP4 normal con rearmar-mp4.mjs (si no, PowerPoint y los celulares no lo abren),
//   3. lo comprueba con comprobar-video.html: duración, saltar a tres puntos, y la voz a tiempo.
// Necesita el servidor andando: node servidor-grabacion.mjs. Uso: node hacer-videos.mjs [v1 v2...]
import { spawn } from "node:child_process";
import { existsSync, statSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { rearmar } from "./rearmar-mp4.mjs";
const AQUI = dirname(fileURLToPath(import.meta.url));
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const dormir = ms => new Promise(r => setTimeout(r, ms));
const CAP = {}; new Function("window", readFileSync(join(AQUI, "contenido.js"), "utf8"))(CAP);
const lista = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CAP.CAP.videos);

// Abre una página en Chrome sin ventana y espera a que aparezca el archivo que esa página guarda
async function enChrome(url, archivoEsperado, maxMs) {
  if (existsSync(archivoEsperado)) rmSync(archivoEsperado);
  const perfil = join(tmpdir(), "mg-grabar");
  const ch = spawn(CHROME, ["--headless=new", "--autoplay-policy=no-user-gesture-required", `--user-data-dir=${perfil}`, "--no-first-run", "--window-size=1280,720", url], { stdio: "ignore" });
  const inicio = Date.now();
  let listo = false;
  while (Date.now() - inicio < maxMs) {
    await dormir(1000);
    if (existsSync(archivoEsperado) && statSync(archivoEsperado).size > 0) { await dormir(1500); listo = true; break; }
  }
  ch.kill();
  return listo;
}

let fallas = 0;
for (const v of lista) {
  const crudo = join(AQUI, "videos", v + ".mp4");
  const final = join(AQUI, "videos", CAP.CAP.videos[v].archivo);
  const t = Date.now();
  if (!await enChrome(`http://127.0.0.1:8766/grabar-video.html?v=${v}`, crudo, 300000)) { console.log(`${v}: NO se grabó (se acabó el tiempo)`); fallas++; continue; }
  const { archivo, resumen } = rearmar(readFileSync(crudo));
  writeFileSync(final, archivo);
  rmSync(crudo);
  const json = join(AQUI, "videos", `comprobado-${v}.json`);
  const ok = await enChrome(`http://127.0.0.1:8766/comprobar-video.html?v=${v}&archivo=${encodeURIComponent("videos/" + CAP.CAP.videos[v].archivo)}`, json, 120000);
  const r = ok ? JSON.parse(readFileSync(json, "utf8")) : { ok: false, error: "la comprobación no terminó" };
  if (ok) rmSync(json);
  const seg = resumen.map(p => `${p.pista} ${p.segundos}s`).join(" · ");
  console.log(`${v}: ${(archivo.length / 1048576).toFixed(1)} MB · ${seg} · grabado en ${Math.round((Date.now() - t) / 1000)} s · comprobación: ${r.ok ? "BIEN" : "FALLA"}`
    + (r.ok ? ` (salta a ${r.puntos.map(p => p.segundo).join("/")} s, voz a tiempo ±${r.desfase_rango} s)` : " " + JSON.stringify(r)));
  if (!r.ok) fallas++;
}
process.exit(fallas ? 1 : 0);
