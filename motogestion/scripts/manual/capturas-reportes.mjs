// Capturas REALES de Reportes, para el manual de `docs/manual-reportes/` (5-oct-2026).
//
// Hermano de `capturas-liquidacion.mjs`: misma máquina (Chrome sin ventana, 390x844, modo claro, la
// sesión que dejó `recibe-sesion.mjs`). El guion recorre las 5 secciones de Reportes, los filtros y
// las descargas.
//
// OJO, LA REGLA DE `capturas.mjs`, que acá vale IGUAL: esto corre contra la base de PRODUCCIÓN.
//    Solo se ABREN pantallas para retratarlas. Los filtros se marcan (no guardan nada). NUNCA se toca
//    "Descargar Excel", "Descargar PDF", "Imprimir" ni "Abrir en Cartera": solo se abren los paneles.
//
// Uso:
//   node scripts/manual/recibe-sesion.mjs        (en otra consola)
//   ...la app entrega su sesión...
//   node scripts/manual/capturas-reportes.mjs          (todas)
//   node scripts/manual/capturas-reportes.mjs 18 19    (solo las que empiezan así)

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const APP = "http://localhost:5173";
const PUERTO_CDP = 9335;              // distinto al de los otros guiones, para poder correr varios
const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, "..", "..", "..", "docs", "manual-reportes", "img");
const SESION = join(tmpdir(), "mg-sesion-manual.json");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

if (!existsSync(SESION)) {
  console.error("Falta la sesión. Corre primero recibe-sesion.mjs y entrégale la sesión desde la app.");
  process.exit(1);
}
mkdirSync(SALIDA, { recursive: true });

const perfil = join(tmpdir(), "mg-chrome-manual-rep");
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
const SENALES = {
  "01-entrada": [
    { n: 1, texto: "Recaudado hoy" }, { n: 2, texto: "Cobranza", exacto: true, cerca: "nav" },
    { n: 3, sel: "select", cerca: "div" }, { n: 4, texto: "Viendo:" },
    { n: 5, texto: "PDF", exacto: true, cerca: "button", lado: "der" },
    { n: 6, texto: "en la cola de recolección", tarjeta: true },
    { tipo: "anillo", texto: "Más", exacto: true, cerca: "button" },
  ],
  "02-grupo": [
    { n: 1, sel: 'button[aria-label^="Grupo:"]', lado: "der" }, { n: 2, texto: "RASTREADOR", exacto: true, tarjeta: true },
    { n: 3, texto: "Listo", exacto: true, cerca: "button", lado: "der" }, { n: 4, texto: "Todos", exacto: true, cerca: "button" },
    { n: 5, texto: "Quitar filtros", lado: "der" },
  ],
  "03-combinados": [
    { n: 1, sel: 'button[aria-label^="Grupo:"]', lado: "der" }, { n: 2, sel: 'button[aria-label^="Cobrador:"]', lado: "izq" },
    { n: 3, sel: "select", cerca: "div", lado: "izq" }, { n: 4, texto: "Viendo:" },
  ],
  "04-resumen": [
    { n: 1, texto: "Recaudado ·", tarjeta: true }, { n: 2, texto: "vs ", cerca: "div" }, { n: 3, texto: "Ahorro de los clientes", cerca: "div" },
    { n: 4, texto: "Efectivo" }, { n: 5, texto: "Cumplimiento del período", tarjeta: true }, { n: 6, texto: "Cifras verificadas", cerca: "button" },
  ],
  "05-resumen-estados": [
    { n: 1, texto: "Cómo están los clientes", tarjeta: true }, { n: 2, texto: "Antigüedad de la mora", tarjeta: true },
  ],
  "06-cartera": [
    { n: 1, texto: "Lo que se debe hoy", tarjeta: true }, { n: 2, texto: "Cuotas de acuerdos" },
    { n: 3, texto: "Qué tan cobrable es", tarjeta: true }, { n: 4, texto: "Cómo van pagando hoy", tarjeta: true },
  ],
  "07-hoja": [
    { n: 1, texto: "Cuotas del contrato ·" }, { n: 2, texto: "Retenida", cerca: "button" },
    { n: 3, texto: "registros", dy: 52 },
    { n: 4, texto: "Abrir en Cartera", cerca: "button" }, { n: 5, texto: "Descargar lista", cerca: "button", lado: "der" },
    { n: 6, sel: '[role="dialog"] [aria-label="Cerrar"]', lado: "der" },
  ],
  "08-acuerdos": [
    { n: 1, texto: "Acuerdos de pago", tarjeta: true }, { n: 2, texto: "Todavía les faltan", tarjeta: true },
    { n: 3, texto: "Cómo van", exacto: true, tarjeta: true }, { n: 4, texto: "Quién los lleva", tarjeta: true },
  ],
  "09-por-grupo": [
    { n: 1, texto: "RASTREADOR", exacto: true }, { n: 2, texto: "Cumplió", exacto: true, lado: "der" },
    { n: 3, texto: "Total", exacto: true }, { n: 4, sel: "select", cual: 1, lado: "der" },
  ],
  "10-por-cobrador": [
    { n: 1, texto: "Cobrador", exacto: true, dy: 42 }, { n: 2, texto: "Cumplió", exacto: true, lado: "der" },
    { n: 3, texto: "Sin cobrador", exacto: true, ci: true },
  ],
  "11-nomina": [
    { n: 1, texto: "Semana del", tarjeta: true, yMin: 80 }, { n: 2, texto: "Lo que se paga esta semana", tarjeta: true },
    { n: 3, texto: "Cuánto vale cada cosa", tarjeta: true }, { n: 4, texto: "Por cobrador", exacto: true, tarjeta: true },
  ],
  "12-visitas": [
    { n: 1, texto: "Visitas domiciliarias", tarjeta: true }, { n: 2, texto: "Terminaron en moto entregada", tarjeta: true },
    { n: 3, texto: "Con su evidencia", tarjeta: true }, { n: 4, texto: "Quién las hizo", tarjeta: true },
  ],
  "13-flota": [
    { n: 1, texto: "Dónde están las", tarjeta: true }, { n: 2, texto: "Por grupo", exacto: true, tarjeta: true },
  ],
  "14-guardadas": [
    { n: 1, texto: "Motos guardadas en la empresa", tarjeta: true }, { n: 2, texto: "Por no pagar" },
    { n: 3, texto: "1 a 7 días" }, { n: 4, texto: "Abrir Inmovilizaciones", cerca: "button" },
  ],
  "17-entregas": [
    { n: 1, texto: "Motos entregadas", ci: true, lado: "izq" }, { n: 2, texto: "Documentación completa", ci: true, lado: "der" },
    { n: 3, texto: "Documentación incompleta", ci: true, lado: "izq" }, { n: 4, texto: "Con fotos de entrega", ci: true, lado: "der" },
    { n: 5, texto: "Imprimir reporte para los socios", cerca: "button" }, { n: 6, texto: "Regenerar documentos en blanco" },
  ],
  "18-entrega-tarjeta": [
    { n: 1, texto: "C.C." }, { n: 2, texto: "Contrato", exacto: true, cerca: "button" },
    { n: 3, texto: "Ver", exacto: true, yMin: 300 }, { n: 4, texto: "Resumen", exacto: true, cerca: "button", cual: 1 },
  ],
  "19-entrega-resumen": [
    { n: 1, texto: "Cliente", ci: true, exacto: true }, { n: 2, texto: "Lo que se pactó", ci: true },
    { n: 3, texto: "Base pendiente" }, { n: 4, texto: "Fotos de la entrega", ci: true, dy: 70 },
    { n: 5, texto: "Descargar / Imprimir", cerca: "button", lado: "der" },
  ],
  "15-excel": [
    { n: 1, texto: "Excel", exacto: true, cerca: "button", lado: "der" }, { n: 2, texto: "Lo que debe cada cliente" },
    { n: 3, texto: "Separar por" }, { n: 4, texto: "Descargar Excel", cerca: "button" },
  ],
  "16-pdf": [
    { n: 1, texto: "PDF", exacto: true, cerca: "button", lado: "der" }, { n: 2, texto: "Qué incluir" },
    { n: 3, texto: "Todo el informe", cerca: "button", lado: "der" },
    { n: 4, texto: "Con las listas completas", cerca: "label" }, { n: 5, texto: "Descargar PDF", cerca: "button" },
  ],
};

/** Mide en la página dónde está cada señal (px de la pantalla). `alto` = el alto de la foto. */
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

const PANTALLAS = [
  { archivo: "01-entrada", titulo: "Reportes: el menú y la barra de filtros",
    abrir: [clic("Más"), clic("Reportes"), arriba], espera: 20000 },   // que carguen todas las cifras

  { archivo: "02-grupo", titulo: "Escoger grupos (se pueden marcar varios)",
    abrir: [clicAria("Grupo:"), clic("COSTA")], espera: 1200 },

  { archivo: "03-combinados", titulo: "Grupo y cobrador combinados",
    abrir: [clic("Listo"), clicAria("Cobrador:"), clic("Lumar Avendaño Pineda"), clic("Listo"), verA("Viendo:", "center")], espera: 2500 },

  { archivo: "04-resumen", titulo: "Resumen: lo que entró y el cumplimiento",
    abrir: [clic("Quitar filtros"), arriba, verA("Recaudado ·", "start")], espera: 3000 },

  { archivo: "05-resumen-estados", titulo: "Resumen: cómo están los clientes",
    abrir: [verA("Cómo están los clientes", "start")], espera: 1500 },

  { archivo: "06-cartera", titulo: "Cobranza › Cartera: lo que se debe hoy",
    abrir: [...seccion("Cobranza", "Cartera"), verA("Lo que se debe hoy", "start")], espera: 2500 },

  { archivo: "07-hoja", titulo: "Tocar un número abre la lista",
    abrir: [clicAria("Cuotas del contrato")], espera: 2000 },

  { archivo: "08-acuerdos", titulo: "Cobranza › Acuerdos",
    abrir: [cerrarHoja, ...seccion("Cobranza", "Acuerdos"), verA("Acuerdos de pago", "start")], espera: 2500 },

  { archivo: "09-por-grupo", titulo: "Portafolios › Por grupo",
    abrir: [...seccion("Portafolios", "Por grupo")], espera: 3000 },

  { archivo: "10-por-cobrador", titulo: "Portafolios › Por cobrador",
    abrir: [...seccion("Portafolios", "Por cobrador")], espera: 3000 },

  { archivo: "11-nomina", titulo: "Equipo › Nómina",
    abrir: [...seccion("Equipo", "Nómina"), verA("Lo que se paga esta semana", "start")], espera: 12000 },

  { archivo: "12-visitas", titulo: "Equipo › Visitas",
    abrir: [...seccion("Equipo", "Visitas"), verA("Visitas domiciliarias", "start")], espera: 2500 },

  { archivo: "13-flota", titulo: "Flota › Motos: dónde está cada moto",
    abrir: [...seccion("Flota", "Motos"), verA("Dónde están las", "start")], espera: 2500 },

  { archivo: "14-guardadas", titulo: "Flota › Guardadas",
    abrir: [...seccion("Flota", "Guardadas")], espera: 2500 },

  { archivo: "17-entregas", titulo: "Flota › Entregas",
    abrir: [...seccion("Flota", "Entregas")], espera: 2500 },

  { archivo: "18-entrega-tarjeta", titulo: "Flota › Entregas: la tarjeta de una entrega",
    // Entra a Reportes por su cuenta, para poder correrla sola (`... 18 19`).
    abrir: [clic("Más"), clic("Reportes"), "new Promise(r => setTimeout(() => r('ok'), 9000))",
      ...seccion("Flota", "Entregas"), verA("Entregada el", "start")], espera: 10000 },   // las miniaturas tardan

  // Abre una ventana aparte (el reporte de esa entrega): se retrata ESA ventana y se cierra.
  // Solo se abre: no se toca «Descargar / Imprimir».
  { archivo: "19-entrega-resumen", titulo: "El reporte de una entrega (botón Resumen)",
    abrir: [resumenDeEntrega], espera: 1500, ventanaNueva: true },

  // Las descargas: SOLO se abren los paneles. Nunca se toca "Descargar Excel", "Descargar PDF" ni "Imprimir".
  { archivo: "15-excel", titulo: "Descargar en Excel",
    abrir: [...seccion("Cobranza", "Cartera"), clic("Excel"), verA("Separar por", "center")], espera: 1500 },

  { archivo: "16-pdf", titulo: "Descargar en PDF",
    abrir: [clic("Excel"), clic("PDF"), verA("Informe para los socios en PDF", "center")], espera: 1500 },
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

console.log("\nListo. Las capturas están en docs/manual-reportes/img/");
console.log("Acuérdate de borrar " + SESION);
process.exit(0);
