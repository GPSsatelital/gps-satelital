// Una sola captura: la franja de "Activa los avisos en este celular", para el volante de una
// página que se le manda al equipo.
//
// 🔴 Se recorta SOLO la parte de arriba. La pantalla completa de Mi Día trae nombres de clientes
// y cifras de plata, y este papel va por WhatsApp a varias personas y se puede reenviar. Lo que
// tienen que ver es el botón, nada más.
//
// Requiere: el servidor de desarrollo corriendo y la sesión entregada por recibe-sesion.mjs.

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const APP = "http://localhost:5173";
const PUERTO_CDP = 9334;
const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, "..", "..", "..", "docs", "manual", "img");
const SESION = join(tmpdir(), "mg-sesion-manual.json");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

if (!existsSync(SESION)) { console.error("Falta la sesión: corre primero recibe-sesion.mjs."); process.exit(1); }
mkdirSync(SALIDA, { recursive: true });

const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PUERTO_CDP}`,
  `--user-data-dir=${join(tmpdir(), "mg-chrome-avisos")}`,
  "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars",
  "about:blank",
], { stdio: "ignore" });

const dormir = ms => new Promise(r => setTimeout(r, ms));

let wsUrl = null;
for (let i = 0; i < 40 && !wsUrl; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PUERTO_CDP}/json/version`);
    if (r.ok) wsUrl = (await r.json()).webSocketDebuggerUrl;
  } catch { /* todavía no */ }
  if (!wsUrl) await dormir(300);
}

const ws = new WebSocket(wsUrl);
await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
let id = 0; const pend = new Map();
ws.addEventListener("message", e => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
});
let sesion = null;
const cmd = (method, params = {}) => {
  const n = ++id;
  ws.send(JSON.stringify(sesion ? { id: n, method, params, sessionId: sesion } : { id: n, method, params }));
  return new Promise((ok, err) => pend.set(n, m => m.error ? err(new Error(m.error.message)) : ok(m.result)));
};

const { targetId } = await cmd("Target.createTarget", { url: "about:blank" });
sesion = (await cmd("Target.attachToTarget", { targetId, flatten: true })).sessionId;
await cmd("Page.enable"); await cmd("Runtime.enable");
await cmd("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await cmd("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });

const evaluar = async expr =>
  (await cmd("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.value;

const { clave, valor } = JSON.parse(readFileSync(SESION, "utf8"));
await cmd("Page.navigate", { url: APP }); await dormir(2500);
await evaluar(`localStorage.clear();
  localStorage.setItem(${JSON.stringify(clave)}, ${JSON.stringify(valor)});
  localStorage.setItem('mg_theme','light'); 'ok'`);
await cmd("Page.navigate", { url: APP }); await dormir(9000);

// Cerrar el aviso de "Instalar" y entrar a Mi Día.
await evaluar(`(() => { const x=[...document.querySelectorAll('button')].find(b=>['✕','×'].includes(b.textContent.trim())); if(x)x.click(); return 'ok'; })()`);
await dormir(600);
for (const texto of ["Más", "Mi Día"]) {
  await evaluar(`(() => {
    const els=[...document.querySelectorAll('*')].filter(e=>e.children.length===0 && e.textContent.trim()===${JSON.stringify(texto)});
    const e=els[els.length-1]; if(!e) return 'NO'; (e.closest('button')||e.parentElement).click(); return 'ok';
  })()`);
  await dormir(1500);
}
await dormir(5000);
await evaluar("window.scrollTo(0,0); 'ok'");
await dormir(400);

// Recorte: solo el encabezado y la franja. Se mide la franja en vivo en vez de clavar un número,
// para que no se corte si algún día crece el texto.
const alto = await evaluar(`(() => {
  const f=[...document.querySelectorAll('div')].find(d=>d.textContent.trim().startsWith('Activa los avisos'));
  return f ? Math.ceil(f.getBoundingClientRect().bottom) + 10 : 0;
})()`);
if (!alto) { console.error("No encontré la franja — ¿ya están activados los avisos en este perfil?"); chrome.kill(); process.exit(1); }

const { data } = await cmd("Page.captureScreenshot", {
  format: "png", clip: { x: 0, y: 0, width: 390, height: alto, scale: 2 },
});
writeFileSync(join(SALIDA, "avisos-franja.png"), Buffer.from(data, "base64"));
console.log("guardada: avisos-franja.png (" + alto + "px de alto)");
chrome.kill();
process.exit(0);
