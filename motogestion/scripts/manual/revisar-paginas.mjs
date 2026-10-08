// Revisa un manual página por página ANTES de entregarlo (8-oct-2026): mide cada <section class="pag">
// al ancho de una hoja A4 y avisa cuál se pasa de una hoja (se partiría en dos), y le toma una foto a
// cada una para mirarlas. Las fotos quedan en %TEMP%\mg-paginas\ (llevan datos de clientes: no se suben).
//
// Uso:  node scripts/manual/revisar-paginas.mjs docs/manual-reportes/manual-reportes.html
//
// A4 con los márgenes de los manuales (14 mm a los lados, 14 arriba y 16 abajo): 182 × 267 mm, que a
// 96 puntos por pulgada son 688 × 1009 px.

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

const ARCHIVO = resolve(process.argv[2] ?? "");
const ANCHO = 688, ALTO = 1009, PUERTO = 9336;
const SALIDA = join(tmpdir(), "mg-paginas");
rmSync(SALIDA, { recursive: true, force: true });
mkdirSync(SALIDA, { recursive: true });

const perfil = join(tmpdir(), "mg-chrome-paginas");
const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${perfil}`, "--no-first-run", "--hide-scrollbars", "about:blank",
], { stdio: "ignore" });
const dormir = ms => new Promise(r => setTimeout(r, ms));

let wsUrl = null;
for (let i = 0; i < 40 && !wsUrl; i++) {
  try { const r = await fetch(`http://127.0.0.1:${PUERTO}/json/version`); if (r.ok) wsUrl = (await r.json()).webSocketDebuggerUrl; } catch { /* aún no */ }
  if (!wsUrl) await dormir(300);
}
const ws = new WebSocket(wsUrl);
await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
let id = 0, sesion = null;
const pend = new Map();
ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const enviar = (method, params = {}) => new Promise((ok, mal) => {
  const n = ++id; pend.set(n, m => m.error ? mal(new Error(m.error.message)) : ok(m.result));
  ws.send(JSON.stringify({ id: n, method, params, ...(sesion ? { sessionId: sesion } : {}) }));
});

const { targetId } = await enviar("Target.createTarget", { url: "about:blank" });
sesion = (await enviar("Target.attachToTarget", { targetId, flatten: true })).sessionId;
await enviar("Page.enable");
await enviar("Emulation.setDeviceMetricsOverride", { width: ANCHO, height: ALTO, deviceScaleFactor: 1.5, mobile: false });
await enviar("Emulation.setEmulatedMedia", { media: "print" });
await enviar("Page.navigate", { url: pathToFileURL(ARCHIVO).href });
await dormir(3000);

const { result } = await enviar("Runtime.evaluate", {
  returnByValue: true,
  expression: `[...document.querySelectorAll("section.pag")].map((s, i) => { const r = s.getBoundingClientRect();
    return { pagina: i + 1, titulo: (s.querySelector("h2, h1")?.innerText || "").replace(/\\s+/g, " ").slice(0, 70), y: Math.round(r.top + scrollY), alto: Math.round(r.height) }; })`,
});
const largas = [];
for (const p of result.value) {
  if (p.alto > ALTO) largas.push(p);
  const { data } = await enviar("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: p.y, width: ANCHO, height: Math.min(p.alto, ALTO + 120), scale: 1 } });
  writeFileSync(join(SALIDA, `p${String(p.pagina).padStart(2, "0")}.png`), Buffer.from(data, "base64"));
}
console.log(`${result.value.length} páginas · fotos en ${SALIDA}`);
console.log(largas.length ? "SE PASAN DE UNA HOJA:\n" + largas.map(p => `  página ${p.pagina}: ${p.alto} px de ${ALTO} (sobran ${p.alto - ALTO}) · ${p.titulo}`).join("\n") : "Ninguna se pasa de una hoja.");
chrome.kill();
process.exit(0);
