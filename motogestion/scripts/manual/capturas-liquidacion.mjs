// Capturas REALES del flujo de liquidación, para el manual de `docs/manual-liquidacion/`.
//
// Hermano de `capturas.mjs`: misma máquina (Chrome sin ventana, 390x844, modo claro, la sesión
// que dejó `recibe-sesion.mjs`), pero el guion recorre las etapas de una liquidación en vez de
// las pantallas generales.
//
// 🔴 LA REGLA DE `capturas.mjs`, que acá vale IGUAL: esto corre contra la base de PRODUCCIÓN.
//    Solo se ABREN pantallas para retratarlas. NO se toca ningún botón que guarde, firme, calcule
//    o cierre nada. Un clic de más acá es una liquidación real movida.
//
// Uso:
//   node scripts/manual/recibe-sesion.mjs        (en otra consola)
//   ...la app entrega su sesión...
//   node scripts/manual/capturas-liquidacion.mjs

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const APP = "http://localhost:5173";
const PUERTO_CDP = 9334;              // distinto al de capturas.mjs, para poder correr los dos
const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, "..", "..", "..", "docs", "manual-liquidacion", "img");
const SESION = join(tmpdir(), "mg-sesion-manual.json");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

if (!existsSync(SESION)) {
  console.error("Falta la sesión. Corre primero recibe-sesion.mjs y entrégale la sesión desde la app.");
  process.exit(1);
}
mkdirSync(SALIDA, { recursive: true });

const perfil = join(tmpdir(), "mg-chrome-manual-liq");
spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PUERTO_CDP}`,
  `--user-data-dir=${perfil}`,
  "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars",
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

// ── Cómo se llega a cada pantalla ─────────────────────────────────────────────
const clic = texto => `
  (() => {
    const t = ${JSON.stringify(texto)};
    const els = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim() === t);
    const e = els[els.length - 1];
    if (!e) return 'NO:' + t;
    (e.closest('button') || e.parentElement).click();
    return 'ok';
  })()`;

/** Escribe en el buscador de Liquidaciones. React ignora `.value = x` a secas: hay que usar el
 *  setter nativo y disparar el evento, si no la lista no se entera y no filtra. */
const buscar = texto => `
  (() => {
    const i = [...document.querySelectorAll('input')].find(x => (x.placeholder||'').toLowerCase().includes('buscar'));
    if (!i) return 'NO:buscador';
    const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    set.call(i, ${JSON.stringify(texto)});
    i.dispatchEvent(new Event('input', { bubbles: true }));
    return 'ok';
  })()`;

/** Abre la tarjeta de una liquidación por su número (LIQ-0054). */
const abrirLiq = numero => `
  (() => {
    const t = ${JSON.stringify(numero)};
    const e = [...document.querySelectorAll('span')].find(x => x.textContent.trim() === t);
    if (!e) return 'NO:' + t;
    const card = e.closest('div[style*="cursor"]') || e.parentElement.parentElement;
    card.click();
    return 'ok';
  })()`;

/** Lleva a la vista el trozo que se quiere retratar (los paneles largos no caben en una pantalla). */
const verA = texto => `
  (() => {
    const t = ${JSON.stringify(texto)};
    const e = [...document.querySelectorAll('*')].filter(x => x.children.length === 0 && x.textContent.includes(t)).pop();
    if (!e) return 'NO:' + t;
    e.scrollIntoView({ block: 'center' });
    return 'ok';
  })()`;

const cerrarPanel = () => clic("← Volver a la lista");

// ── El guion ──────────────────────────────────────────────────────────────────
// Las liquidaciones se eligieron por su ETAPA, medida el 24-sep-2026. Si alguna ya avanzó,
// el script avisa "no encontré" y sigue: se cambia el número por otra de la misma etapa.
const IR_A_LIQUIDACIONES = [clic("Más"), clic("Liquidaciones")];

const PANTALLAS = [
  { archivo: "01-lista", titulo: "La lista de liquidaciones",
    abrir: IR_A_LIQUIDACIONES, espera: 4500 },

  { archivo: "02-falta-firma", titulo: "El chip «Falta firma» en la lista",
    abrir: [buscar("LIQ-0054")], espera: 1800 },

  // ⚠️ Cada pantalla usa una liquidación que ESTÉ en esa etapa. Las liquidaciones avanzan: si una
  // ya pasó de etapa, la foto sale de otro paso y el manual queda mintiendo. Pasó la primera vez
  // con LIQ-0073, que avanzó de "en taller" a "firmada" entre el guion y la corrida. Si el script
  // avisa "no encontré", cambia el número por otra de la misma etapa antes de armar el PDF.
  { archivo: "03-taller", titulo: "Etapa: revisión del taller (en taller)",
    abrir: [buscar("LIQ-0074"), abrirLiq("LIQ-0074"), verA("Revisión de taller")], espera: 3000 },

  { archivo: "04-calcular", titulo: "El botón de calcular",
    abrir: [verA("Registrar revisión y calcular")], espera: 1200 },

  { archivo: "12-cerrar", titulo: "Confirmar cierre y «Sigue con la empresa»",
    abrir: [cerrarPanel(), buscar("LIQ-0073"), abrirLiq("LIQ-0073"), verA("Sigue con la empresa")], espera: 3000 },

  { archivo: "05-cuenta", titulo: "La cuenta ya calculada",
    abrir: [cerrarPanel(), buscar("LIQ-0050"), abrirLiq("LIQ-0050")], espera: 3000 },

  { archivo: "06-generar-doc", titulo: "Generar el documento",
    abrir: [verA("Generar documento de liquidación")], espera: 1200 },

  { archivo: "07-firma", titulo: "La firma del cliente",
    abrir: [cerrarPanel(), buscar("LIQ-0011"), abrirLiq("LIQ-0011")], espera: 3000 },

  { archivo: "08-firma-opciones", titulo: "Si no puede firmar en pantalla",
    abrir: [verA("Descargar para enviar")], espera: 1200 },

  { archivo: "09-cerrar-sin-firma", titulo: "Cerrar sin firma",
    abrir: [verA("no va a venir")], espera: 1200 },

  // 🔴 LA PANTALLA MÁS IMPORTANTE DEL MANUAL: la cerrada sin firma, con el botón nuevo.
  { archivo: "10-cerrada-sin-firma", titulo: "Cerrada SIN firma — y cómo se firma después",
    abrir: [cerrarPanel(), buscar("LIQ-0054"), abrirLiq("LIQ-0054"), verA("SIN FIRMA del cliente")], espera: 3000 },

  { archivo: "11-cerrada-ok", titulo: "Una cerrada que sí quedó firmada",
    abrir: [cerrarPanel(), buscar("LIQ-0012"), abrirLiq("LIQ-0012")], espera: 3000 },
];

const wsUrl = await esperarChrome();
const nav = await Cdp.abrir(wsUrl);
const { targetId } = await nav.enviar("Target.createTarget", { url: "about:blank" });
const { sessionId } = await nav.enviar("Target.attachToTarget", { targetId, flatten: true });
nav.sesion = sessionId;

await nav.enviar("Page.enable");
await nav.enviar("Runtime.enable");
await nav.enviar("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
// Modo claro: el manual se imprime, y el navy sobre papel se ve sucio y gasta tinta.
await nav.enviar("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });

async function evaluar(expr) {
  const r = await nav.enviar("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  return r.result?.value;
}
async function ir(url) { await nav.enviar("Page.navigate", { url }); await dormir(1500); }
async function capturar(nombre) {
  const { data } = await nav.enviar("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(SALIDA, nombre + ".png"), Buffer.from(data, "base64"));
  console.log("  guardada: " + nombre + ".png");
}

// Sesión + modo claro. Se limpia primero: el perfil se reusa entre corridas y si no, queda
// abierta la última pantalla de la vez pasada en vez de arrancar desde el Panel.
await ir(APP);
await evaluar("localStorage.clear(); 'ok'");
const { clave, valor } = JSON.parse(readFileSync(SESION, "utf8"));
await evaluar(`
  localStorage.setItem(${JSON.stringify(clave)}, ${JSON.stringify(valor)});
  localStorage.setItem('mg_theme', 'light');
  'ok'`);
await ir(APP);
await dormir(8000);

// El aviso de "Instala MotoGestión en tu celular" tapa un cuarto de pantalla y no es parte de
// lo que se explica.
await evaluar(`
  (() => {
    const x = [...document.querySelectorAll('button')].find(b => ['✕','×'].includes(b.textContent.trim()));
    if (x) x.click();
    return 'ok';
  })()`);
await dormir(600);

for (const p of PANTALLAS) {
  console.log("→ " + p.titulo);
  for (const paso of p.abrir ?? []) {
    const r = await evaluar(paso);
    if (typeof r === "string" && r.startsWith("NO:")) console.log("  (no encontré: " + r.slice(3) + ")");
    await dormir(1300);
  }
  await dormir(p.espera ?? 2000);
  await capturar(p.archivo);
}

console.log("\nListo. Las capturas están en docs/manual-liquidacion/img/");
console.log("Acuérdate de borrar " + SESION);
process.exit(0);
