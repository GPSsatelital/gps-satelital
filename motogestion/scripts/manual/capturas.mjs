// Toma las capturas REALES de la app para el manual de operación.
//
// Abre un Chrome sin ventana, le mete la sesión que dejó `recibe-sesion.mjs`, se pone del tamaño
// de un celular (390 x 844, que es el iPhone más común) y va pantalla por pantalla guardando un
// PNG de cada una. Así el manual muestra la app tal como se ve hoy, no un dibujo parecido.
//
// Uso:
//   node scripts/manual/recibe-sesion.mjs        (en otra consola)
//   ...la app entrega su sesión...
//   node scripts/manual/capturas.mjs
//
// Requiere que el servidor de desarrollo esté corriendo en http://localhost:5173.

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const APP = "http://localhost:5173";
const PUERTO_CDP = 9333;
// Relativo al propio archivo y no a desde dónde se llame: así corre igual desde cualquier consola.
const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, "..", "..", "..", "docs", "manual", "img");
const SESION = join(tmpdir(), "mg-sesion-manual.json");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

if (!existsSync(SESION)) {
  console.error("Falta la sesión. Corre primero recibe-sesion.mjs y entrégale la sesión desde la app.");
  process.exit(1);
}
mkdirSync(SALIDA, { recursive: true });

// ── Chrome sin ventana ────────────────────────────────────────────────────────
const perfil = join(tmpdir(), "mg-chrome-manual");
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PUERTO_CDP}`,
  `--user-data-dir=${perfil}`,
  "--no-first-run", "--no-default-browser-check", "--disable-gpu",
  "--hide-scrollbars",
  "about:blank",
], { stdio: "ignore" });

const dormir = ms => new Promise(r => setTimeout(r, ms));

async function esperarChrome() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PUERTO_CDP}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch { /* todavía no levanta */ }
    await dormir(300);
  }
  throw new Error("Chrome no levantó");
}

// ── Cliente mínimo del protocolo de Chrome ────────────────────────────────────
class Cdp {
  constructor(ws) { this.ws = ws; this.id = 0; this.pend = new Map(); this.sesion = null;
    ws.addEventListener("message", e => {
      const m = JSON.parse(e.data);
      if (m.id && this.pend.has(m.id)) { this.pend.get(m.id)(m); this.pend.delete(m.id); }
    });
  }
  static async abrir(url) {
    const ws = new WebSocket(url);
    await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
    return new Cdp(ws);
  }
  enviar(method, params = {}) {
    const id = ++this.id;
    const msg = { id, method, params };
    if (this.sesion) msg.sessionId = this.sesion;
    this.ws.send(JSON.stringify(msg));
    return new Promise((ok, err) => this.pend.set(id, m => m.error ? err(new Error(m.error.message)) : ok(m.result)));
  }
}

// ── Guion: qué pantalla, cómo se llega y qué se explica ────────────────────────
// `abrir` es lo que hay que tocar para llegar; se ejecuta dentro de la página.
const clic = texto => `
  (() => {
    const t = ${JSON.stringify(texto)};
    const els = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim() === t);
    const e = els[els.length - 1];
    if (!e) return 'NO:' + t;
    (e.closest('button') || e.parentElement).click();
    return 'ok';
  })()`;

// El PRIMERO que diga ese texto (para tocar la primera tarjeta de una lista, no la última).
const primero = texto => `
  (() => {
    const t = ${JSON.stringify(texto)};
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim().includes(t));
    if (!b) return 'NO:' + t;
    b.click();
    return 'ok';
  })()`;

const campana = () => `
  (() => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('🔔'));
    if (!b) return 'NO:campana';
    b.click();
    return 'ok';
  })()`;

const PANTALLAS = [
  { archivo: "01-login",      titulo: "La pantalla para entrar",        antesDeSesion: true, espera: 2000 },
  { archivo: "02-panel",      titulo: "Panel general",                  abrir: [clic("Panel")],     espera: 5000 },
  { archivo: "03-mi-dia",     titulo: "Mi día",                         abrir: [clic("Más"), clic("Mi Día")], espera: 6000 },
  { archivo: "04-cartera",    titulo: "Cartera — lo de hoy",            abrir: [clic("Cartera")],   espera: 6000 },
  { archivo: "05-clientes",   titulo: "Clientes",                       abrir: [clic("Clientes")],  espera: 5000 },
  { archivo: "06-motos",      titulo: "Motos",                          abrir: [clic("Motos")],     espera: 5000 },
  { archivo: "07-contratos",  titulo: "Contratos",                      abrir: [clic("Contratos")], espera: 5000 },
  { archivo: "08-mas",        titulo: "El menú Más",                    abrir: [clic("Más")],       espera: 2000 },
  { archivo: "09-alertas",    titulo: "Alertas",                        abrir: [clic("Alertas")],   espera: 6000 },
  { archivo: "10-caja",       titulo: "Caja diaria",                    abrir: [clic("Más"), clic("Caja Diaria")], espera: 5000 },
  { archivo: "11-taller",     titulo: "Taller",                         abrir: [clic("Más"), clic("Taller")], espera: 4000 },
  { archivo: "12-liquidacion",titulo: "Liquidaciones",                  abrir: [clic("Más"), clic("Liquidaciones")], espera: 4000 },
  // 🔴 Solo se ABREN ventanas para retratarlas. Nunca se toca un botón que guarde algo: este
  // script corre contra la base de PRODUCCIÓN y un clic de más sería un pago inventado.
  { archivo: "13-pagar",      titulo: "La ventana de cobrar",           abrir: [clic("Cartera"), primero("Pagar")], espera: 3500 },
  { archivo: "14-campana",    titulo: "La campana de avisos",           abrir: [clic("Panel"), campana()],          espera: 3000 },
];

const wsUrl = await esperarChrome();
const nav = await Cdp.abrir(wsUrl);
const { targetId } = await nav.enviar("Target.createTarget", { url: "about:blank" });
const { sessionId } = await nav.enviar("Target.attachToTarget", { targetId, flatten: true });
nav.sesion = sessionId;

await nav.enviar("Page.enable");
await nav.enviar("Runtime.enable");
await nav.enviar("Emulation.setDeviceMetricsOverride", {
  width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
});
// El Chrome de prueba hereda "modo oscuro" del sistema y pinta las cajas de texto en gris oscuro
// aunque el tema de la app sea claro. Se le dice que el sistema está en modo claro para que las
// capturas salgan como las ve alguien con el celular en modo día.
await nav.enviar("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-color-scheme", value: "light" }],
});

async function evaluar(expr) {
  const r = await nav.enviar("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  return r.result?.value;
}

async function ir(url) {
  await nav.enviar("Page.navigate", { url });
  await dormir(1500);
}

async function capturar(nombre) {
  const { data } = await nav.enviar("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(SALIDA, nombre + ".png"), Buffer.from(data, "base64"));
  console.log("  guardada: " + nombre + ".png");
}

// 1) Sin sesión: la pantalla de entrar.
//    Se limpia primero: el Chrome de prueba reusa la misma carpeta entre corridas, así que si no
//    se borra, la sesión de la vez pasada sigue viva y en vez del login sale la última pantalla
//    que quedó abierta. Pasó en el primer intento.
await ir(APP);
await evaluar("localStorage.clear(); localStorage.setItem('mg_theme','light'); 'ok'");
await ir(APP);
await dormir(3500);
await capturar("01-login");

// 2) Se inyecta la sesión y se recarga.
//    Se fuerza el MODO CLARO: el manual se imprime, y sobre papel un fondo azul oscuro se ve
//    sucio y gasta una barbaridad de tinta. Es la misma app, solo con el tema de día.
const { clave, valor } = JSON.parse(readFileSync(SESION, "utf8"));
await evaluar(`
  localStorage.setItem(${JSON.stringify(clave)}, ${JSON.stringify(valor)});
  localStorage.setItem('mg_theme', 'light');
  'ok'`);
await ir(APP);
await dormir(8000);

// Quitar el aviso de "Instala MotoGestión en tu celular": tapa la cuarta parte de la pantalla y
// no es parte de lo que se está explicando.
await evaluar(`
  (() => {
    const x = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '✕' || b.textContent.trim() === '×');
    if (x) x.click();
    return 'ok';
  })()`);
await dormir(600);

for (const p of PANTALLAS) {
  if (p.antesDeSesion) continue;
  console.log("→ " + p.titulo);
  for (const paso of p.abrir ?? []) {
    const r = await evaluar(paso);
    if (typeof r === "string" && r.startsWith("NO:")) console.log("  (no encontré: " + r.slice(3) + ")");
    await dormir(1200);
  }
  await dormir(p.espera ?? 3000);
  await evaluar("window.scrollTo(0,0); 'ok'");
  await dormir(400);
  await capturar(p.archivo);
}

console.log("\nListo. Capturas en " + SALIDA);
chrome.kill();
process.exit(0);
