// Capturas REALES para la capacitación del 7-oct-2026 (docs/capacitacion/).
//
// Hermano de capturas-reportes.mjs: misma máquina (Chrome sin ventana, 390x844, modo claro, la sesión
// que dejó recibe-sesion.mjs). Corre contra PRODUCCIÓN: SOLO se abren pantallas y ventanas para
// retratarlas. Nunca se toca guardar, registrar, cobrar, rodar, ceder, imprimir ni descargar.
//
// Uso: node scripts/manual/recibe-sesion.mjs (otra consola) → la app entrega su sesión →
//      node scripts/manual/capturas-capacitacion.mjs [prefijos]

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const APP = "http://localhost:5173";
const PUERTO_CDP = 9337;              // distinto al de los otros guiones, para poder correr varios
const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, "..", "..", "..", "docs", "capacitacion", "img");
const SESION = join(tmpdir(), "mg-sesion-manual.json");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

if (!existsSync(SESION)) {
  console.error("Falta la sesión. Corre primero recibe-sesion.mjs y entrégale la sesión desde la app.");
  process.exit(1);
}
mkdirSync(SALIDA, { recursive: true });

const perfil = join(tmpdir(), "mg-chrome-capacitacion");
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
/** Toca un botón por su texto exacto (los botones con ícono no son "hojas": se buscan como botón). */
const clic = texto => `
  (() => {
    const t = ${JSON.stringify(texto)};
    const b = [...document.querySelectorAll('button,[role=button],a')].filter(x => x.textContent.trim() === t).pop();
    if (b) { b.click(); return 'ok'; }
    const e = [...document.querySelectorAll('*')].filter(x => x.children.length === 0 && x.textContent.trim() === t).pop();
    if (!e) return 'NO:' + t;
    (e.closest('button') || e.parentElement).click();
    return 'ok';
  })()`;

/** Toca un botón por el comienzo de su descripción para lectores de pantalla ("Grupo: …"). */
const clicAria = prefijo => `
  (() => {
    const b = [...document.querySelectorAll('button')].find(x => (x.getAttribute('aria-label') || '').toLowerCase().startsWith(${JSON.stringify(prefijo.toLowerCase())}));
    if (!b) return 'NO:' + ${JSON.stringify(prefijo)};
    b.click();
    return 'ok';
  })()`;

/** Lleva a la vista el trozo que se quiere retratar (los paneles largos no caben en una pantalla). */
const verA = (texto, bloque = "start") => `
  (() => {
    const t = ${JSON.stringify(texto)};
    // El elemento más pequeño que tiene ese texto escrito (no solo las "hojas": "Viendo: <b>…</b>").
    const e = [...document.querySelectorAll('*')].filter(x => [...x.childNodes].some(n => n.nodeType === 3 && n.textContent.includes(t))).pop();
    if (!e) return 'NO:' + t;
    e.scrollIntoView({ block: ${JSON.stringify(bloque)} });
    // Arriba flota la etiqueta del período: se deja ese espacio para que no tape el título.
    if (${JSON.stringify(bloque)} === 'start') {
      let c = e.parentElement;
      while (c && !(c.scrollHeight > c.clientHeight + 4 && /(auto|scroll)/.test(getComputedStyle(c).overflowY))) c = c.parentElement;
      (c || window).scrollBy(0, -170);
    }
    return 'ok';
  })()`;

const arriba = `(() => { document.querySelectorAll('*').forEach(e => { if (e.scrollTop) e.scrollTop = 0; }); window.scrollTo(0, 0); return 'ok'; })()`;
const cerrarHoja = `(() => { const b = document.querySelector('[role="dialog"] [aria-label="Cerrar"]'); if (b) b.click(); return 'ok'; })()`;
const seccion = (nombre, parte) => parte ? [clic(nombre), clic(parte), arriba] : [clic(nombre), arriba];
/** El «Resumen» de la tarjeta de entrega que está a la vista (hay otro «Resumen»: la sección de arriba). */
const resumenDeEntrega = `
  (() => {
    const b = [...document.querySelectorAll('button')].filter(x => x.textContent.trim() === 'Resumen')
      .filter(x => { const r = x.getBoundingClientRect(); return r.top > 120 && r.bottom < innerHeight - 60; }).pop();
    if (!b) return 'NO:Resumen de una entrega';
    b.click();
    return 'ok';
  })()`;

// ── El guion ──────────────────────────────────────────────────────────────────
// ── LAS SEÑALES DEL MANUAL (6-oct) ────────────────────────────────────────────────────────────
// Para cada foto, qué cosas llevan número. Se miden EN LA PANTALLA REAL al tomar la foto y se guardan
// en img/<foto>.marcas.json; `poner-senales.mjs` las pinta sobre la foto en el manual. Así, si la
// pantalla cambia, la línea sigue cayendo donde debe.
//   texto: el texto que se busca (exacto: igual; ci: sin mayúsculas) · sel: un selector CSS en vez de texto
//   cual: si hay varios visibles, cuál (0 = el primero) · cerca: subir hasta ese selector
//   tarjeta: subir hasta el recuadro que lo contiene · dy: correr la altura de la línea
//   lado: 'izq' | 'der' (si no, el más cercano) · tipo: 'anillo' = donde hay que tocar
//   yMin: ignorar lo que esté más arriba (la etiqueta flotante de arriba repite textos)
const MEDIR = (marcas, alto) => `
  (() => {
    const marcas = ${JSON.stringify(marcas)};
    const W = innerWidth, H = ${alto ? alto : "innerHeight"};
    const visible = r => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < H;
    const norm = (t, ci) => ci ? t.toLowerCase() : t;
    const conTexto = (m, t) => [...document.querySelectorAll('*')].filter(x =>
      [...x.childNodes].some(n => n.nodeType === 3 && (m.exacto ? norm(n.textContent.trim(), m.ci) === norm(t, m.ci) : norm(n.textContent, m.ci).includes(norm(t, m.ci))))
      && visible(x.getBoundingClientRect()));
    const esTarjeta = e => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
      return parseFloat(cs.borderTopLeftRadius) >= 10 && r.width < W - 4 && (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(cs.borderTopWidth) > 0); };
    return { W, H, marcas: marcas.map(m => {
      const lista = (m.sel ? [...document.querySelectorAll(m.sel)].filter(x => visible(x.getBoundingClientRect())) : conTexto(m, m.texto))
        .filter(x => x.getBoundingClientRect().top >= (m.yMin || 0));
      const base = lista[m.cual || 0];
      if (!base) return { n: m.n ?? null, falta: m.sel || m.texto };
      let cont = base;
      if (m.cerca) cont = base.closest(m.cerca) || base;
      if (m.tarjeta) { let e = base; while (e && e !== document.body && !esTarjeta(e)) e = e.parentElement; if (e && e !== document.body) cont = e; }
      const rb = base.getBoundingClientRect(), rc = cont.getBoundingClientRect();
      const lado = m.lado || ((rc.left + rc.right) / 2 > W * 0.62 ? 'der' : 'izq');
      return { n: m.n ?? null, tipo: m.tipo || 'call', lado,
        y: Math.round((rb.top + rb.bottom) / 2 + (m.dy || 0)),
        x: Math.round(rc.left), y0: Math.round(rc.top), x2: Math.round(rc.right), y2: Math.round(rc.bottom) };
    }) };
  })()`;


const SENALES = {};
/** Toca el botón cuyo texto CONTIENE esto (los que llevan ícono adelante no son iguales exacto). */
const clicHas = texto => `
  (() => {
    const t = ${JSON.stringify(texto)};
    const b = [...document.querySelectorAll("button,[role=button],a")].filter(x => x.textContent.includes(t)).pop();
    if (!b) return "NO:" + t;
    b.scrollIntoView({ block: "center" }); b.click(); return "ok";
  })()`;
/** Escribe en una caja de texto de React (por el comienzo del texto de ayuda). */
const escribir = (ayuda, valor) => `
  (() => {
    const i = [...document.querySelectorAll("input")].find(x => (x.placeholder || "").startsWith(${JSON.stringify(ayuda)}));
    if (!i) return "NO:" + ${JSON.stringify(ayuda)};
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(i, ${JSON.stringify(valor)});
    i.dispatchEvent(new Event("input", { bubbles: true }));
    return "ok";
  })()`;
/** Baja dentro de la ventana flotante abierta. */
const bajarDialogo = px => `(() => { const d = document.querySelector("[role=dialog]"); const c = d ? [...d.querySelectorAll("*")].find(e => e.scrollHeight > e.clientHeight + 4 && /(auto|scroll)/.test(getComputedStyle(e).overflowY)) : null; if (c) c.scrollTop += ${px}; return c ? "ok" : "NO:dialogo"; })()`;
/** Toca SOLO una pestaña con contador ("Confirmar 4", "Para hacer hoy 233"): nunca un botón de acción. */
const clicPestana = nombre => `
  (() => {
    const solo = t => t.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ ]/g, "").trim();
    const b = [...document.querySelectorAll("button")].find(x => solo(x.textContent) === ${JSON.stringify(nombre)} && /[0-9]/.test(x.textContent));
    if (!b) return "NO:pestaña " + ${JSON.stringify(nombre)};
    b.click(); return "ok";
  })()`;
const esperar = ms => `new Promise(r => setTimeout(() => r("ok"), ${ms}))`;
const irA = (...pasos) => [clic("Panel"), esperar(1500), ...pasos];

const PANTALLAS = [
  // ── TEMA 1 · EL DÍA DEL ADMINISTRADOR ──
  { archivo: "t1-01-mi-dia", titulo: "Mi Día", abrir: [clic("Más"), clic("Mi Día"), arriba], espera: 4000 },
  { archivo: "t1-02-cartera-hoy", titulo: "Cartera › Hoy", abrir: [clic("Cartera"), esperar(3000), arriba], espera: 5000 },
  { archivo: "t1-03-cartera-tarea", titulo: "Una tarea del día con sus botones", abrir: [verA("Mensaje", "center")], espera: 1500 },
  { archivo: "t1-04-panel", titulo: "El Panel", abrir: [clic("Panel"), arriba], espera: 5000 },
  // ── TEMA 3 · TALLER, GARANTÍA, PRÉSTAMO Y RODAR ──
  { archivo: "t3-01-motos-novedad", titulo: "Motos › Registrar novedad",
    abrir: [clic("Motos"), esperar(3000), escribir("Buscar", "IEW64I"), esperar(1500),
      `(() => { const e = [...document.querySelectorAll("*")].filter(x => x.children.length === 0 && x.textContent.trim() === "IEW64I").pop(); if (!e) return "NO:IEW64I"; (e.closest("button,[role=button]") || e.parentElement).click(); return "ok"; })()`,
      esperar(2000), clicHas("Registrar novedad")], espera: 2500 },
  { archivo: "t3-02-taller", titulo: "Taller", abrir: ["location.reload(); \"ok\"", esperar(9000), clic("Más"), clic("Taller"), arriba], espera: 4000 },
  { archivo: "t3-03-taller-nueva", titulo: "Nueva orden de taller", abrir: [clicHas("Nueva orden de taller")], espera: 2000 },
  { archivo: "t3-04-retenidas", titulo: "Inmovilizaciones › Motos retenidas", abrir: [clic("Más"), clic("Inmovilizaciones"), esperar(3000), verA("Motos retenidas")], espera: 3000 },
  { archivo: "t3-05-prestamos", titulo: "Inmovilizaciones › Préstamos activos", abrir: [verA("Préstamos activos")], espera: 2000 },
// ── SEGUNDA TANDA ──
  { archivo: "t1-05-para-hacer-hoy", titulo: "Cartera › Para hacer hoy", abrir: [clic("Cartera"), esperar(3000), clicPestana("Para hacer hoy"), esperar(2500), arriba], espera: 3000 },
  { archivo: "t1-06-tarea-botones", titulo: "Una tarea con sus botones", abrir: [verA("Mensaje", "center")], espera: 1500 },
  { archivo: "t1-07-confirmar", titulo: "Cartera › Confirmar", abrir: [clicPestana("Confirmar"), esperar(2500), arriba], espera: 2500 },
  { archivo: "t3-06-prestar-boton", titulo: "Inmovilizaciones › Varadas: Prestar reemplazo", abrir: [clic("Más"), clic("Inmovilizaciones"), esperar(3000), clicPestana("Varadas"), esperar(1500), verA("Prestar reemplazo", "center")], espera: 2000 },
  { archivo: "t3-07-prestar-modal", titulo: "La ventana de prestar reemplazo", abrir: [clicHas("Prestar reemplazo")], espera: 2500 },
  { archivo: "t3-08-prestamos-activos", titulo: "Préstamos activos", abrir: ["location.reload(); \"ok\"", esperar(9000), clic("Más"), clic("Inmovilizaciones"), esperar(3000), verA("Préstamos activos", "start"), "window.scrollBy(0, 0); \"ok\""], espera: 2000 },
  { archivo: "t4-01-contrato", titulo: "Contrato EXT59H", abrir: [clic("Contratos"), esperar(2500), escribir("Buscar por nombre", "EXT59H"), esperar(1500), clic("LUIS FERNANDO SOLANO"), esperar(2500), verA("Rodar por deuda", "center")], espera: 2000 },
  { archivo: "t4-02-rodado-cuenta", titulo: "Rodar por deuda: la cuenta", abrir: [clicHas("Rodar por deuda (más")], espera: 4000 },
  { archivo: "t4-03-rodado-cuenta-2", titulo: "Rodar por deuda: lo que se rueda", abrir: [bajarDialogo(560)], espera: 1200 },
  { archivo: "t4-04-rodado-cuenta-3", titulo: "Rodar por deuda: lo que no se rueda", abrir: [bajarDialogo(560)], espera: 1200 },
  { archivo: "t4-05-rodado-documento", titulo: "Rodar por deuda: el documento", abrir: [clicHas("Siguiente: el documento")], espera: 2500 },
  { archivo: "t5-01-ceder", titulo: "Ceder contrato", abrir: [cerrarHoja, esperar(800), clicHas("Ceder contrato a otro cliente")], espera: 3000 },
  { archivo: "t5-02-ceder-2", titulo: "Ceder contrato (abajo)", abrir: [bajarDialogo(700)], espera: 1200 },
  { archivo: "t3-09-resolver-tiempo", titulo: "Resolver tiempo guardado", abrir: ["location.reload(); \"ok\"", esperar(9000), clic("Contratos"), esperar(2500), escribir("Buscar por nombre", "EXT59H"), esperar(1500), clic("LUIS FERNANDO SOLANO"), esperar(2500), clicHas("Resolver tiempo guardado")], espera: 2500 },
// ── TERCERA TANDA: ceder un contrato sin bloqueos (IGN01I). Solo se abre y se elige en la lista: no se cede. ──
  { archivo: "t5-03-ceder-ok", titulo: "Ceder: lo que se traspasa",
    abrir: ["location.reload(); \"ok\"", esperar(9000), clic("Contratos"), esperar(2500), escribir("Buscar por nombre", "IGN01I"), esperar(1500),
      `(() => { const e = [...document.querySelectorAll("*")].filter(x => x.children.length === 0 && x.textContent.trim() === "IGN01I").pop(); if (!e) return "NO:IGN01I"; let c = e; while (c && !c.onclick && c.tagName !== "BUTTON" && getComputedStyle(c).cursor !== "pointer") c = c.parentElement; (c || e).click(); return "ok"; })()`,
      esperar(2500), clicHas("Ceder contrato a otro cliente")], espera: 3000 },
  { archivo: "t5-04-ceder-recibe", titulo: "Ceder: quién recibe", abrir: [verA("¿Quién recibe el contrato?", "center")], espera: 1500 },
  { archivo: "t5-05-ceder-requisitos", titulo: "Ceder: los requisitos de quien recibe",
    abrir: [`(() => { const s = [...document.querySelectorAll("select")].find(x => [...x.options].some(o => o.text.includes("Elegir cliente"))); if (!s) return "NO:select"; const o = [...s.options].find(o => o.value); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(s, o.value); s.dispatchEvent(new Event("change", { bubbles: true })); return "ok"; })()`,
      esperar(1200), verA("Está Aprobado", "center")], espera: 1500 },
  { archivo: "t5-06-acta", titulo: "El acta de cesión (ventana aparte)", abrir: [clicHas("Imprimir acta")], espera: 1500, ventanaNueva: true },
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
  // userGesture: como si lo tocara una persona; sin eso, Chrome bloquea las ventanas que abre un botón.
  const r = await nav.enviar("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true, userGesture: true });
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

function guardarSenales(nombre, med) {
  writeFileSync(join(SALIDA, nombre + ".marcas.json"), JSON.stringify(med, null, 1));
  const faltan = med.marcas.filter(m => m.falta).map(m => m.falta);
  if (faltan.length) console.log("  (señales que no encontré: " + faltan.join(", ") + ")");
}

/** Lo que se le pide al navegador entero (no a la pestaña): ver y cerrar ventanas. */
async function alNavegador(fn) { const s = nav.sesion; nav.sesion = null; try { return await fn(); } finally { nav.sesion = s; } }
async function ventanasAbiertas() { return (await alNavegador(() => nav.enviar("Target.getTargets"))).targetInfos.filter(t => t.type === "page").map(t => t.targetId); }
async function capturarVentanaNueva(nombre, antes) {
  for (let i = 0; i < 30; i++) {
    const nueva = (await ventanasAbiertas()).find(id => !antes.includes(id));
    if (nueva) {
      const { sessionId: s2 } = await alNavegador(() => nav.enviar("Target.attachToTarget", { targetId: nueva, flatten: true }));
      const propia = nav.sesion;
      nav.sesion = s2;
      try {
        // Esa ventana es un documento de computador (840 px, sin ajuste para celular): retratada al
        // ancho del celular sale diminuta. Se retrata a su ancho y se recorta a lo que ocupa.
        await nav.enviar("Emulation.setDeviceMetricsOverride", { width: 840, height: 1100, deviceScaleFactor: 2, mobile: false });
        await dormir(5000);   // las fotos de la entrega llegan firmadas, un poco después
        const alto = (await nav.enviar("Runtime.evaluate", { expression: "Math.ceil(Math.max(...[...document.body.querySelectorAll('*')].map(e => e.getBoundingClientRect().bottom)) + 24)", returnByValue: true })).result.value;
        if (SENALES[nombre]) {
          const med = (await nav.enviar("Runtime.evaluate", { expression: MEDIR(SENALES[nombre], Math.min(alto, 1100)), returnByValue: true })).result.value;
          guardarSenales(nombre, med);
        }
        const { data } = await nav.enviar("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 840, height: Math.min(alto, 1100), scale: 1 } });
        writeFileSync(join(SALIDA, nombre + ".png"), Buffer.from(data, "base64"));
        console.log("  guardada: " + nombre + ".png (ventana aparte)");
      } finally { nav.sesion = propia; }
      await alNavegador(() => nav.enviar("Target.closeTarget", { targetId: nueva }));
      return;
    }
    await dormir(500);
  }
  console.log("  (no se abrió la ventana de " + nombre + ")");
}

const SOLO = process.argv.slice(2);
for (const p of PANTALLAS) {
  if (SOLO.length && !SOLO.some(x => p.archivo.startsWith(x))) continue;
  console.log("→ " + p.titulo);
  const antes = p.ventanaNueva ? await ventanasAbiertas() : [];
  for (const paso of p.abrir ?? []) {
    const r = await evaluar(paso);
    if (typeof r === "string" && r.startsWith("NO:")) console.log("  (no encontré: " + r.slice(3) + ")");
    await dormir(1300);
  }
  await dormir(p.espera ?? 2000);
  if (p.ventanaNueva) await capturarVentanaNueva(p.archivo, antes);
  else {
    if (SENALES[p.archivo]) guardarSenales(p.archivo, await evaluar(MEDIR(SENALES[p.archivo])));
    await capturar(p.archivo);
  }
}

console.log("\nListo. Las capturas están en docs/capacitacion/img/");
console.log("Acuérdate de borrar " + SESION);
process.exit(0);
