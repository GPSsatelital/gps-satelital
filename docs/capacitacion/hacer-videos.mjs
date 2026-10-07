// Graba los 4 videos de la capacitación como MP4 (para mandarlos por WhatsApp), con grabar-video.html en un
// Chrome sin ventana. Necesita el servidor de grabación andando (ver README). Uso: node hacer-videos.mjs [v1 v2...]
import { spawn } from "node:child_process";
import { existsSync, statSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
const AQUI = dirname(fileURLToPath(import.meta.url));
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const dormir = ms => new Promise(r => setTimeout(r, ms));
const lista = process.argv.slice(2).length ? process.argv.slice(2) : ["v1", "v2", "v3", "v4"];
for (const v of lista) {
  const archivo = join(AQUI, "videos", v + ".mp4");
  if (existsSync(archivo)) rmSync(archivo);
  const perfil = join(tmpdir(), "mg-grabar-" + v);
  const ch = spawn(CHROME, ["--headless=new", "--autoplay-policy=no-user-gesture-required", `--user-data-dir=${perfil}`,
    "--no-first-run", "--window-size=1280,720", `http://127.0.0.1:8766/grabar-video.html?v=${v}`], { stdio: "ignore" });
  const inicio = Date.now();
  let listo = false;
  while (Date.now() - inicio < 240000) {
    await dormir(2000);
    if (existsSync(archivo) && statSync(archivo).size > 0) { await dormir(1500); listo = true; break; }
  }
  ch.kill();
  console.log(listo ? `${v}: ${(statSync(archivo).size / 1048576).toFixed(1)} MB en ${Math.round((Date.now() - inicio) / 1000)} s` : `${v}: NO se grabó (se acabó el tiempo)`);
}
