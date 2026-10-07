// Hace los iconos en PNG para el PowerPoint (ver iconos-png.html). Necesita: node servidor-grabacion.mjs
import { spawn } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
const AQUI = dirname(fileURLToPath(import.meta.url));
const listo = join(AQUI, "powerpoint", "_iconos", "listo.json");
if (existsSync(listo)) rmSync(listo);
const ch = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", `--user-data-dir=${join(tmpdir(), "mg-iconos")}`, "--no-first-run", "http://127.0.0.1:8766/iconos-png.html"], { stdio: "ignore" });
const t0 = Date.now();
while (!existsSync(listo) && Date.now() - t0 < 60000) await new Promise(r => setTimeout(r, 500));
ch.kill();
console.log(existsSync(listo) ? "iconos en PNG: " + JSON.parse(readFileSync(listo, "utf8")).iconos : "NO terminó");
