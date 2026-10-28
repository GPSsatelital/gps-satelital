// Capturas REALES de la nómina nueva (D-057: precorte, corte del miércoles y pago del 15 y el 30),
// para `docs/manual-nomina/`.
//
// Misma máquina que `capturas-rodado.mjs`: Chrome sin ventana, 390x844, modo claro, la sesión que dejó
// `recibe-sesion.mjs`.
//
// 🔴 LA REGLA DE SIEMPRE: esto corre contra la base de PRODUCCIÓN. Solo se ABREN pantallas para
//    retratarlas. Un candado contesta aquí mismo toda escritura (insert, update, delete, rpc, subidas)
//    sin que salga a Supabase. NUNCA se toca «Cerrar la semana» ni «Registrar pago» para confirmar.
//
// ⚠️ Lo que se finge, y solo en la pantalla de este Chrome:
//    1. EL DÍA DE HOY. La nómina nueva arrancó el 26-oct y hoy (27-oct) esa semana va corriendo: el
//       precorte, el corte y el pago todavía no se pueden ver de verdad. La app cree que hoy es la
//       fecha de cada etapa (`hoyISO()` lee `__hoy_manual`). El reloj de la sesión NO se toca: si se
//       corriera, la sesión se daría por vencida y se renovaría, y eso le cierra la sesión al dueño.
//    2. EL PAGO DEL 15. Todavía no hay ninguna semana cerrada. Para retratar la tarjeta del pago, la
//       lista de semanas cerradas que lee la app trae la semana del 26-oct de cada supervisor, con lo
//       que esa semana lleva HOY (cifras reales, todavía en curso).
//
// Uso:
//   node scripts/manual/recibe-sesion.mjs        (en otra consola)
//   ...la app entrega su sesión...
//   node scripts/manual/capturas-nomina.mjs

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const APP = "http://localhost:5173";
const PUERTO_CDP = 9339;
const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, "..", "..", "..", "docs", "manual-nomina", "img");
const SESION = join(tmpdir(), "mg-sesion-manual.json");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

if (!existsSync(SESION)) {
  console.error("Falta la sesión. Corre primero recibe-sesion.mjs y entrégale la sesión desde la app.");
  process.exit(1);
}
mkdirSync(SALIDA, { recursive: true });

const perfil = join(tmpdir(), "mg-chrome-manual-nomina");
rmSync(perfil, { recursive: true, force: true });
spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PUERTO_CDP}`, `--user-data-dir=${perfil}`,
  "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars", "about:blank",
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
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pend = new Map(); this.sesion = null; this.oyentes = [];
    ws.addEventListener("message", e => {
      const m = JSON.parse(e.data);
      if (m.id && this.pend.has(m.id)) { this.pend.get(m.id)(m); this.pend.delete(m.id); }
      for (const f of this.oyentes) f(m);
    });
  }
  static async abrir(url) {
    const ws = new WebSocket(url);
    await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
    return new Cdp(ws);
  }
  enviar(method, params = {}, sesion = this.sesion) {
    const id = ++this.id;
    const msg = { id, method, params };
    if (sesion) msg.sessionId = sesion;
    this.ws.send(JSON.stringify(msg));
    return new Promise((ok, err) => this.pend.set(id, m => m.error ? err(new Error(m.error.message)) : ok(m.result)));
  }
}

const wsUrl = await esperarChrome();
const nav = await Cdp.abrir(wsUrl);
const { targetId } = await nav.enviar("Target.createTarget", { url: "about:blank" });
const { sessionId } = await nav.enviar("Target.attachToTarget", { targetId, flatten: true });
nav.sesion = sessionId;
await nav.enviar("Page.enable");
await nav.enviar("Runtime.enable");
await nav.enviar("Network.enable");
await nav.enviar("Network.setCacheDisabled", { cacheDisabled: true });
nav.oyentes.push(m => { if (process.env.MG_DEBUG && m.method === 'Network.requestWillBeSent' && m.params.request.url.includes('nomina_cierres')) console.log('  [consulta] ' + decodeURIComponent(m.params.request.url.split('/rest/v1/')[1])); });
await nav.enviar("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await nav.enviar("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });

// EL DÍA DE HOY FINGIDO: al módulo de fechas de la app se le agrega, al principio de `hoyISO()`, que
// lea `__hoy_manual` si existe. Solo en este Chrome; el código de la app no cambia.
await nav.enviar("Fetch.enable", { patterns: [{ urlPattern: "*/src/utils/fecha.ts*", requestStage: "Response" }] });
nav.oyentes.push(async m => {
  if (m.method !== "Fetch.requestPaused" || m.sessionId !== nav.sesion) return;
  const { requestId } = m.params;
  try {
    const r = await nav.enviar("Fetch.getResponseBody", { requestId });
    let codigo = r.base64Encoded ? Buffer.from(r.body, "base64").toString("utf8") : r.body;
    const antes = codigo;
    codigo = codigo.replace(/function hoyISO\(\)\s*\{/, "function hoyISO() { const __f = localStorage.getItem('__hoy_manual'); if (__f) return __f;");
    if (codigo === antes) console.log("  (no pude fingir el día: no encontré hoyISO)");
    await nav.enviar("Fetch.fulfillRequest", { requestId, responseCode: 200,
      responseHeaders: [{ name: "Content-Type", value: "text/javascript" }], body: Buffer.from(codigo).toString("base64") });
  } catch (e) { console.log("  (error fingiendo el día: " + e.message + ")"); await nav.enviar("Fetch.continueRequest", { requestId }).catch(() => {}); }
});

// 🔴 CANDADO: en este Chrome NADA se escribe en la base. Y la lista corta de semanas cerradas (la que
// usa la tarjeta del pago) se contesta con `__cierres_manual` si existe (ver arriba, punto 2).
await nav.enviar("Page.addScriptToEvaluateOnNewDocument", { source: `
  (() => {
    const real = window.fetch.bind(window);
    window.__bloqueadas = [];
    window.fetch = async (u, o = {}) => {
      const url = String(u instanceof Request ? u.url : u);
      const metodo = String(o.method || (u instanceof Request ? u.method : 'GET')).toUpperCase();
      const escribe = metodo !== 'GET' && metodo !== 'HEAD';
      const firmaLectura = url.includes('/storage/v1/object/sign/');
      // Los rpc que SOLO LEEN pasan: sin los nombres de los supervisores la pantalla dice «Cobrador».
      const rpc = (url.match(/rest\\/v1\\/rpc\\/([a-z_0-9]+)/) || [])[1];
      const rpcDeLectura = ['nombres_subadmins'].includes(rpc);
      if (escribe && !firmaLectura && !rpcDeLectura && (url.includes('/storage/v1/') || url.includes('/rest/v1/'))) {
        window.__bloqueadas.push(metodo + ' ' + url.split('/v1/')[1].split('?')[0]);
        return new Response('[]', { status: 201, headers: { 'Content-Type': 'application/json' } });
      }
      const fingidos = localStorage.getItem('__cierres_manual');
      if (fingidos && !escribe && url.includes('/rest/v1/nomina_cierres') && url.includes('semana_lunes=in.')) {
        return new Response(fingidos, { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return real(u, o);
    };
  })();` });

async function evaluar(expr) {
  const r = await nav.enviar("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true, userGesture: true });
  if (r.exceptionDetails) console.log("  ⚠️ " + (r.exceptionDetails.exception?.description ?? r.exceptionDetails.text).split("\n")[0]);
  return r.result?.value;
}
async function ir(url) { await nav.enviar("Page.navigate", { url }); await dormir(1500); }
const cerrarAvisoInstalar = `(() => { const x = [...document.querySelectorAll('button')].find(b => ['✕','×'].includes(b.textContent.trim()) && b.closest('div')?.textContent.includes('Instala')); if (x) x.click(); return 'ok'; })()`;
async function capturar(nombre) {
  const { data } = await nav.enviar("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(SALIDA, nombre + ".png"), Buffer.from(data, "base64"));
  console.log("  guardada: " + nombre + ".png");
}
async function paso(titulo, expr, espera = 1300) {
  const r = await evaluar(expr);
  if (typeof r === "string" && r.startsWith("NO:")) console.log(`  (no encontré: ${r.slice(3)}) — ${titulo}`);
  await dormir(espera);
  return r;
}
const clic = texto => `
  (() => {
    const t = ${JSON.stringify(texto)};
    const els = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim() === t);
    const e = els[els.length - 1];
    if (!e) return 'NO:' + t;
    (e.closest('button') || e.parentElement).click();
    return 'ok';
  })()`;
const clicBoton = parte => `
  (() => {
    const b = [...document.querySelectorAll('button')].filter(x => x.textContent.includes(${JSON.stringify(parte)})).pop();
    if (!b) return 'NO:' + ${JSON.stringify(parte)};
    b.click(); return 'ok';
  })()`;
const clicAria = prefijo => `
  (() => {
    const b = [...document.querySelectorAll('button[aria-label]')].find(x => x.getAttribute('aria-label').startsWith(${JSON.stringify(prefijo)}));
    if (!b) return 'NO:' + ${JSON.stringify(prefijo)};
    b.click(); return 'ok';
  })()`;
const verA = (texto, bloque = "center") => `
  (() => {
    const t = ${JSON.stringify(texto)};
    const e = [...document.querySelectorAll('*')].filter(x => x.children.length === 0 && x.textContent.includes(t)).pop();
    if (!e) return 'NO:' + t;
    e.scrollIntoView({ block: ${JSON.stringify(bloque)} });
    return 'ok';
  })()`;
const arriba = `(() => { window.scrollTo(0, 0); document.querySelectorAll('*').forEach(e => { if (e.scrollTop) e.scrollTop = 0; }); return 'ok'; })()`;

/** Abre la app con «hoy» = `dia` y llega a Reportes › Equipo › Nómina. */
async function nominaConHoy(dia, extra = "") {
  await evaluar(`localStorage.setItem('__hoy_manual', ${JSON.stringify(dia)}); sessionStorage.clear(); ${extra} 'ok'`);
  await ir(APP);
  await dormir(7000);
  await exigirCandado();
  await evaluar(cerrarAvisoInstalar);
  await paso("Más", clic("Más"), 1200);
  await paso("Reportes", clic("Reportes"), 4000);
  await paso("Equipo", clic("Equipo"), 1500);
  await paso("Nómina", clic("Nómina"), 12000);
  await evaluar(arriba);
  await dormir(800);
}

async function exigirCandado() {
  const ok = await evaluar("typeof window.__bloqueadas !== 'undefined'");
  if (!ok) { console.error('EL CANDADO NO ESTÁ PUESTO: me detengo sin tocar nada.'); await nav.enviar('Browser.close', {}, null).catch(() => {}); process.exit(1); }
}
// ── Entrar con la sesión ──
await ir(APP);
await evaluar("localStorage.clear(); 'ok'");
const { clave, valor } = JSON.parse(readFileSync(SESION, "utf8"));
await evaluar(`localStorage.setItem(${JSON.stringify(clave)}, ${JSON.stringify(valor)}); localStorage.setItem('mg_theme', 'light'); 'ok'`);

const LLEVA = `
  (async () => {
    const filas = [...document.querySelectorAll('button[aria-label$="Ver su semana"]')].map(b => {
      const m = b.getAttribute('aria-label').match(/^(.*): \\$\\s?([\\d.]+)\\./);
      return m ? { nombre: m[1], total: Number(m[2].replace(/\\./g, '')) } : null;
    }).filter(Boolean);
    const { supabase } = await import('/src/lib/supabase.ts');
    const { data } = await supabase.from('profiles').select('id, nombre').eq('role', 'SUBADMIN');
    return filas.map(f => ({ ...f, id: (data || []).find(p => p.nombre === f.nombre)?.id })).filter(f => f.id);
  })()`;
const SOLO_PAGO = process.argv[2] === 'pago';
if (!SOLO_PAGO) {
// ── 1. Semana en curso (martes 27-oct, hoy de verdad) ──
console.log("→ Semana en curso");
await nominaConHoy("2026-10-27");
await paso("ir a la semana del 26", clicAria("Semana siguiente"), 6000);
await evaluar(arriba);
await capturar("01-semana-en-curso");

// ── 2. Precorte (lunes 2-nov) ──
console.log("→ Precorte");
await nominaConHoy("2026-11-02");
await capturar("02-precorte");
await paso("por cobrador", verA("Por cobrador", "start"), 1000);
await capturar("03-por-confirmar");
// El supervisor con más pagos por confirmar, o el primero.
await paso("abrir un supervisor", `
  (() => {
    const filas = [...document.querySelectorAll('button[aria-label$="Ver su semana"]')];
    const conPendientes = filas.find(b => b.textContent.includes('por confirmar'));
    const b = conPendientes || filas[0];
    if (!b) return 'NO:fila de supervisor';
    b.click(); return 'ok';
  })()`, 2500);
await paso("ver el pie", verA("Desprendible", "end"), 1000);
await capturar("04-detalle-precorte");

// ── 3. Corte (miércoles 4-nov) ──
console.log("→ Corte");
await nominaConHoy("2026-11-04");
await capturar("05-corte");
// Lo que lleva cada supervisor en la semana del 26 (cifras reales de hoy): sirve para el punto 4.

globalThis.__lleva = await evaluar(LLEVA);
const lleva0 = globalThis.__lleva;
await paso("abrir un supervisor", clicAria(lleva0?.[0]?.nombre ?? "—"), 2500);
await paso("ver el pie", verA("Desprendible", "end"), 1000);
await capturar("06-detalle-corte");
await paso("cerrar la semana (solo abrir)", clicBoton("Cerrar la semana"), 2500);
await capturar("07-ventana-cerrar");
await paso("ver la firma", verA("revisé y estoy de acuerdo", "center"), 1000);
await capturar("08-ventana-cerrar-firma");

}
let lleva = globalThis.__lleva;
if (SOLO_PAGO) lleva = await (async () => { await nominaConHoy('2026-11-04'); return evaluar(LLEVA); })();
// ── 4. El pago del 15 (sábado 14-nov) ──
console.log("→ Pago del 15");
const fingidos = (lleva ?? []).map((f, i) => ({
  id: `00000000-0000-4000-8000-00000000000${i + 1}`, semana_lunes: "2026-10-26", subadmin_id: f.id, total: f.total,
  created_at: "2026-11-04T15:00:00+00:00",
}));
await nominaConHoy("2026-11-14", `localStorage.setItem('__cierres_manual', ${JSON.stringify(JSON.stringify(fingidos))});`);
if (process.env.MG_DEBUG) console.log('  [debug] ' + await evaluar(`(async () => {
  const f = localStorage.getItem('__cierres_manual');
  const { supabase } = await import('/src/lib/supabase.ts');
  const r = await supabase.from('nomina_cierres').select('id, semana_lunes, subadmin_id, total, created_at').in('semana_lunes', ['2026-10-26']);
  return JSON.stringify({ guardado: f && f.slice(0, 120), respuesta: r.data && r.data.length, error: r.error && r.error.message, hoy: localStorage.getItem('__hoy_manual') });
})()`));
await paso("tarjeta del pago", verA("Pago del 15 y el 30", "start"), 1200);
await capturar("09-pago-tarjeta");
await paso("registrar pago (solo abrir)", clicBoton("Registrar pago"), 2500);
await capturar("10-ventana-pago");
await paso("ver la firma", verA("recibí conforme", "center"), 1000);
await capturar("11-ventana-pago-firma");

// ── 5. El comprobante del pago, como sale en papel ──
console.log("→ Comprobante");
const primero = fingidos[0] && lleva[0];
const html = primero ? await evaluar(`
  (async () => {
    const { htmlComprobantePagoNomina } = await import('/src/utils/generarDesprendibleNomina.ts');
    return htmlComprobantePagoNomina({ cobradorNombre: ${JSON.stringify(lleva[0].nombre)}, fecha: '2026-11-15', total: ${lleva[0].total},
      semanas: [{ semana_lunes: '2026-10-26', total: ${lleva[0].total} }] }, 'Fredy Mora');
  })()`) : null;
if (html) {
  await nav.enviar("Emulation.setDeviceMetricsOverride", { width: 794, height: 1123, deviceScaleFactor: 1.5, mobile: false });
  const { frameTree } = await nav.enviar("Page.getFrameTree");
  await nav.enviar("Page.setDocumentContent", { frameId: frameTree.frame.id, html });
  await dormir(1200);
  const { data } = await nav.enviar("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 794, height: 700, scale: 1 } });
  writeFileSync(join(SALIDA, "12-comprobante.png"), Buffer.from(data, "base64"));
  console.log("  guardada: 12-comprobante.png");
}

const bloqueadas = await evaluar("JSON.stringify(window.__bloqueadas || [])");
console.log("\nEscrituras que el candado frenó en la última página: " + bloqueadas);
console.log("Listo. Las capturas están en docs/manual-nomina/img/");
console.log("Acuérdate de borrar " + SESION);
await nav.enviar("Browser.close", {}, null).catch(() => {});
process.exit(0);
