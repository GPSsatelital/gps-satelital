// Capturas REALES del proceso «rodar todo» (D-050/D-052, mig 201), para `docs/manual-rodado/`.
//
// Misma máquina que `capturas-liquidacion.mjs`: Chrome sin ventana, 390x844, modo claro, la sesión
// que dejó `recibe-sesion.mjs`.
//
// 🔴 LA REGLA DE SIEMPRE: esto corre contra la base de PRODUCCIÓN. Solo se ABREN pantallas para
//    retratarlas. NUNCA se toca «Confirmar entrega» ni «Rodar y guardar».
//
// ⚠️ Lo único que se finge, y solo en la pantalla de este Chrome: el contrato de OMAR (RMM66H) sigue
//    suspendido hasta que se le devuelva la moto, y así la ventana del rodado no deja pasar del paso 1.
//    Para retratar cómo se verá DESPUÉS de devolverla, la respuesta de la vista previa (que no guarda
//    nada) se recibe con «puede: sí» y sin la razón de «no está activo». Las cifras son las reales.
//
// Uso:
//   node scripts/manual/recibe-sesion.mjs        (en otra consola)
//   ...la app entrega su sesión...
//   node scripts/manual/capturas-rodado.mjs

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const APP = "http://localhost:5173";
const PUERTO_CDP = 9338;
const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, "..", "..", "..", "docs", "manual-rodado", "img");
const SESION = join(tmpdir(), "mg-sesion-manual.json");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PLACA = "RMM66H";
const CONTRATO = "81ad0c37-10d6-4de6-a84c-5a82047d9caa";

if (!existsSync(SESION)) {
  console.error("Falta la sesión. Corre primero recibe-sesion.mjs y entrégale la sesión desde la app.");
  process.exit(1);
}
mkdirSync(SALIDA, { recursive: true });

const perfil = join(tmpdir(), "mg-chrome-manual-rodado");
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
  constructor(ws) { this.ws = ws; this.id = 0; this.pend = new Map(); this.sesion = null;
    ws.addEventListener("message", e => {
      const m = JSON.parse(e.data);
      if (m.id && this.pend.has(m.id)) { this.pend.get(m.id)(m); this.pend.delete(m.id); }
      // «No rodar» pide «¿Confirmar que se cobra normal?». Sin contestar, la página se queda parada
      // y el guion se cuelga. Se acepta: el candado de escrituras no deja que nada llegue a la base.
      if (m.method === "Page.javascriptDialogOpening") {
        console.log("  (ventanita de la app aceptada: " + String(m.params?.message ?? "").split("\n")[0] + ")");
        this.enviar("Page.handleJavaScriptDialog", { accept: true }, m.sessionId);
      }
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
await nav.enviar("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await nav.enviar("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });

// 🔴 CANDADO: en este Chrome NADA se escribe en la base. Toda escritura (insert, update, delete, y los
// rpc que no son de solo leer) se contesta aquí mismo con un "listo" de mentira y nunca sale a
// Supabase. Así se puede tocar «No rodar» para que se abra el formulario de entrega, sin guardar nada.
// Se instala antes de que cargue la app, en cada página.
await nav.enviar("Page.addScriptToEvaluateOnNewDocument", { source: `
  (() => {
    const real = window.fetch.bind(window);
    const RPC_DE_LECTURA = ['calcular_rodado_por_deuda', 'rodado_pendiente_liquidacion'];
    window.__bloqueadas = [];
    window.fetch = async (u, o = {}) => {
      const url = String(u instanceof Request ? u.url : u);
      const metodo = String(o.method || (u instanceof Request ? u.method : 'GET')).toUpperCase();
      const escribe = metodo !== 'GET' && metodo !== 'HEAD';
      const rpc = (url.match(/rest\\/v1\\/rpc\\/([a-z_0-9]+)/) || [])[1];
      // Pedir el enlace firmado para LEER un archivo privado (la huella) es un POST, pero no escribe nada.
      const firmaLectura = url.includes('/storage/v1/object/sign/');
      if (escribe && !firmaLectura && (url.includes('/storage/v1/') || (url.includes('/rest/v1/') && !RPC_DE_LECTURA.includes(rpc)))) {
        window.__bloqueadas.push(metodo + ' ' + url.split('/v1/')[1].split('?')[0]);
        const uno = /object\\+json/.test(new Headers(o.headers || {}).get('Accept') || '');
        return new Response(uno ? '{"id":"00000000-0000-0000-0000-000000000000"}' : '[]',
          { status: 201, headers: { 'Content-Type': 'application/json' } });
      }
      return real(u, o);
    };
  })();` });

async function evaluar(expr) {
  const r = await nav.enviar("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) console.log("  ⚠️ " + (r.exceptionDetails.exception?.description ?? r.exceptionDetails.text).split("\n")[0]);
  return r.result?.value;
}
async function ir(url) { await nav.enviar("Page.navigate", { url }); await dormir(1500); }
// El aviso de "Instala MotoGestión" vuelve en cada carga y tapa la parte de arriba.
const cerrarAvisoInstalar = `(() => { const x = [...document.querySelectorAll('button')].find(b => ['✕','×'].includes(b.textContent.trim()) && b.closest('div')?.textContent.includes('Instala')); if (x) x.click(); return 'ok'; })()`;
async function abrirApp() { await ir(APP); await dormir(7000); await evaluar(cerrarAvisoInstalar); await dormir(600); }
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
const escribir = (pista, texto) => `
  (() => {
    const i = [...document.querySelectorAll('input')].find(x => (x.placeholder||'').toLowerCase().includes(${JSON.stringify(pista)}));
    if (!i) return 'NO:buscador ' + ${JSON.stringify(pista)};
    const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    set.call(i, ${JSON.stringify(texto)});
    i.dispatchEvent(new Event('input', { bubbles: true }));
    return 'ok';
  })()`;
const verA = (texto, bloque = "center") => `
  (() => {
    const t = ${JSON.stringify(texto)};
    const e = [...document.querySelectorAll('*')].filter(x => x.children.length === 0 && x.textContent.includes(t)).pop();
    if (!e) return 'NO:' + t;
    e.scrollIntoView({ block: ${JSON.stringify(bloque)} });
    return 'ok';
  })()`;

// ── Sesión + modo claro ─────────────────────────────────────────────────────────
await ir(APP);
await evaluar("localStorage.clear(); 'ok'");
const { clave, valor } = JSON.parse(readFileSync(SESION, "utf8"));
await evaluar(`localStorage.setItem(${JSON.stringify(clave)}, ${JSON.stringify(valor)}); localStorage.setItem('mg_theme', 'light'); 'ok'`);
await abrirApp();
await dormir(600);

// ── 1 y 2. Inmovilizaciones: la tarjeta de OMAR y el formulario de entrega (SIN confirmar) ──
console.log("→ Inmovilizaciones");
await paso("Más", clic("Más"));
await paso("Inmovilizaciones", clic("Inmovilizaciones"), 4000);
await paso("buscar", escribir("buscar", PLACA), 1800);
await paso("tarjeta", verA("Entregar moto", "center"), 1000);
await capturar("01-retenida");
await paso("abrir entrega", `
  (() => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Entregar moto') && !x.disabled);
    if (!b) return 'NO:Entregar moto (habilitado)';
    b.click(); return 'ok';
  })()`, 2500);
await capturar("02-tiempo-guardado");
// «No rodar»: el candado de arriba la contesta sin que salga a la base, y se abre el formulario.
await paso("no rodar", clicBoton("No rodar"), 3000);
console.log("  escrituras bloqueadas: " + JSON.stringify(await evaluar("window.__bloqueadas")));
await capturar("03-entregar");
await paso("fotos", verA("Fotos del estado de la moto", "start"), 1000);
await capturar("04-entregar-fotos");
await paso("botón confirmar", verA("Confirmar entrega", "center"), 1000);
await capturar("05-entregar-confirmar");

// ── 3. Contratos: dónde está el botón (en un contrato ACTIVO; el de OMAR aún no lo es) ──
console.log("→ Contratos: el botón «Rodar por deuda»");
await abrirApp();
// Una placa con UN solo contrato (activo), para que el buscador no abra uno viejo de la misma moto.
const placaActiva = await evaluar(`
  (async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const { data: c } = await supabase.from('contratos').select('id, moto_id, estado, forma_pago, motor_v2').not('moto_id', 'is', null).range(0, 999);
    const { data: r } = await supabase.from('rodados_por_deuda').select('contrato_id');
    const porMoto = {}; for (const x of c || []) (porMoto[x.moto_id] ??= []).push(x);
    const ok = Object.values(porMoto).find(l => l.length === 1 && l[0].estado === 'Activo' && l[0].forma_pago === 'Semanal' && l[0].motor_v2 && !(r || []).some(y => y.contrato_id === l[0].id));
    const { data: m } = await supabase.from('motos').select('placa').eq('id', ok[0].moto_id);
    return m[0].placa;
  })()`);
console.log("  contrato activo de ejemplo: " + placaActiva);
await paso("Contratos", clic("Contratos"), 4000);
await paso("buscar contrato", escribir("buscar", placaActiva), 1800);
await paso("abrir contrato", `
  (() => {
    const e = [...document.querySelectorAll('*')].filter(x => x.children.length === 0 && x.textContent.trim() === ${JSON.stringify(placaActiva)}).pop();
    if (!e) return 'NO:placa';
    (e.closest('button') || e.closest('[role=button]') || e.closest('div[style*="cursor"]') || e.parentElement).click();
    return 'ok';
  })()`, 3500);
await paso("ver botón", `(() => { const b = [...document.querySelectorAll("button")].find(x => x.textContent.includes("Rodar por deuda")); if (!b) return "NO:Rodar por deuda"; b.scrollIntoView({ block: "center" }); return "ok"; })()`, 1200);
await capturar("06-boton-rodar");

// ── 4. La ventana del rodado con OMAR, como se verá cuando ya esté activo ──
console.log("→ La ventana del rodado (OMAR)");
await abrirApp();
const montado = await evaluar(`
  (async () => {
    // Solo la vista previa (no guarda nada): se recibe como "ya activo". Las cifras no se tocan.
    const real = window.fetch;
    window.fetch = async (u, o) => {
      const r = await real(u, o);
      if (!String(u).includes('rpc/calcular_rodado_por_deuda')) return r;
      const j = await r.json();
      if (j && typeof j === 'object') {
        j.razones = (j.razones || []).filter(x => !x.includes('no está activo'));
        j.puede = j.razones.length === 0;
      }
      return new Response(JSON.stringify(j), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
    const urls = performance.getEntriesByType('resource').map(r => r.name);
    const Rm = await import(urls.find(n => /deps\\/react\\.js/.test(n))); const React = Rm.default ?? Rm;
    const RDm = await import(urls.find(n => /deps\\/react-dom_client\\.js/.test(n))); const RD = RDm.createRoot ? RDm : RDm.default;
    const M = (await import('/src/components/ModalRodadoPorDeuda.tsx')).default;
    const { supabase } = await import('/src/lib/supabase.ts');
    const { data: cl } = await supabase.from('clientes').select('acompanante_nombre, autorizacion_datos_huella_url, acompanante_huella_url').eq('id', '1e791b7e-4edb-4a08-867c-80eddf3f8956');
    const div = document.createElement('div'); document.body.appendChild(div);
    RD.createRoot(div).render(React.createElement(M, {
      contratoId: ${JSON.stringify(CONTRATO)}, acompanante: cl[0].acompanante_nombre,
      huellaClienteUrl: cl[0].autorizacion_datos_huella_url, huellaAcompananteUrl: cl[0].acompanante_huella_url,
      onCerrar: () => {},
    }));
    return 'ok';
  })()`);
console.log("  montada: " + montado);
await dormir(3500);
await capturar("07-ventana-modos");
await paso("rodar todo", clicBoton("Rodar todo"), 3500);
await capturar("08-rodar-todo");
await paso("ver semanas", verA("Se rueda al final del contrato", "start"), 1000);
await capturar("09-semanas");
await paso("ver desde hoy", verA("Desde hoy", "start"), 1000);
await capturar("10-desde-hoy");

// Paso 2: el documento y la firma
await paso("siguiente: documento", clicBoton("Siguiente: el documento"), 3000);
await capturar("11-documento");

// La firma de muestra: se dibuja una raya en la ventana de firmar SOLO para pasar al paso del video.
await paso("leído", `(() => { const c = document.querySelector('input[type=checkbox]'); if (!c) return 'NO:casilla'; c.click(); return 'ok'; })()`, 600);
await paso("abrir firma", `
  (() => {
        const z = [...document.querySelectorAll('*')].filter(x => x.children.length === 0 && x.textContent.trim() === 'Toque aquí para firmar')[0];
    if (!z) return 'NO:abrir firma';
    (z.closest('button') || z.parentElement).click(); return 'ok';
  })()`, 1500);
const lienzo = await evaluar(`
  (() => {
    const cs = [...document.querySelectorAll('canvas')];
    const c = cs[cs.length - 1]; if (!c) return null;
    const b = c.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height };
  })()`);
if (lienzo) {
  const pts = Array.from({ length: 24 }, (_, i) => ({ x: lienzo.x + lienzo.w * (0.2 + i * 0.025), y: lienzo.y + lienzo.h * (0.5 + 0.18 * Math.sin(i / 2)) }));
  await nav.enviar("Input.dispatchMouseEvent", { type: "mousePressed", x: pts[0].x, y: pts[0].y, button: "left", clickCount: 1 });
  for (const p of pts) await nav.enviar("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y, button: "left", buttons: 1 });
  await nav.enviar("Input.dispatchMouseEvent", { type: "mouseReleased", x: pts.at(-1).x, y: pts.at(-1).y, button: "left", clickCount: 1 });
  await dormir(600);
  await paso("aceptar firma", clicBoton("Aceptar"), 1200);
} else console.log("  (no encontré el lienzo de la firma)");
await paso("ver firma", verA("Firma del cliente", "start"), 1000);
await capturar("12-firma");
await paso("siguiente: video", clicBoton("Siguiente: el video"), 2500);
await capturar("13-video");

// ── 5. El documento que firma, entero, con su huella ──
console.log("→ El documento completo");
const html = await evaluar(`
  (async () => {
    const { calcularRodado } = await import('/src/hooks/useRodadosPorDeuda.ts');
    const { htmlRodadoPorDeuda } = await import('/src/utils/rodadoPorDeuda.ts');
    const { urlADataUrl } = await import('/src/utils/pdf.ts');
    const { supabase } = await import('/src/lib/supabase.ts');
    const { data: cl } = await supabase.from('clientes').select('autorizacion_datos_huella_url').eq('id', '1e791b7e-4edb-4a08-867c-80eddf3f8956');
    const huella = await urlADataUrl(cl[0].autorizacion_datos_huella_url).catch(() => null);
    const r = await calcularRodado(${JSON.stringify(CONTRATO)}, true);
    return htmlRodadoPorDeuda(r.calculo, { borrador: true, huellaCliente: huella });
  })()`);
if (html) {
  await nav.enviar("Emulation.setDeviceMetricsOverride", { width: 794, height: 1123, deviceScaleFactor: 1.5, mobile: false });
  const { frameTree } = await nav.enviar("Page.getFrameTree");
  await nav.enviar("Page.setDocumentContent", { frameId: frameTree.frame.id, html });
  await dormir(1500);
  const { contentSize } = await nav.enviar("Page.getLayoutMetrics");
  const { data } = await nav.enviar("Page.captureScreenshot", { format: "png", captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: 794, height: Math.ceil(contentSize.height), scale: 1 } });
  writeFileSync(join(SALIDA, "14-documento-completo.png"), Buffer.from(data, "base64"));
  console.log("  guardada: 14-documento-completo.png");
}

console.log("\nListo. Las capturas están en docs/manual-rodado/img/");
console.log("Acuérdate de borrar " + SESION);
// Cerrar el Chrome sin ventana: si se queda vivo, la próxima corrida se cuelga en el mismo puerto.
await nav.enviar("Browser.close", {}, null).catch(() => {});
process.exit(0);
