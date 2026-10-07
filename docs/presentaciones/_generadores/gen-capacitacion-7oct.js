// LA CAPACITACIÓN DEL 7-OCT EN POWERPOINT — una presentación por tema, para compartir (pedido del dueño:
// "¿por qué mejor no los hiciste en PowerPoint? así no los puedo compartir").
// Sale del MISMO docs/capacitacion/contenido.js que las páginas web: mismos textos, mismas fotos con sus
// números, los videos MP4 metidos adentro, y el guion en las NOTAS de cada diapositiva.
//
// Uso:  cd docs/presentaciones/_generadores && node gen-capacitacion-7oct.js
// Salida: docs/capacitacion/powerpoint/*.pptx (no se suben: llevan fotos con datos de clientes).

const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const CAP_DIR = path.join(__dirname, "..", "..", "capacitacion");
const SALIDA = path.join(CAP_DIR, "powerpoint");
fs.mkdirSync(SALIDA, { recursive: true });
const window = {};
new Function("window", fs.readFileSync(path.join(CAP_DIR, "contenido.js"), "utf8"))(window);
const C = window.CAP;

// Los íconos (lucide), sacados de la presentación web para que sean los mismos.
const htmlWeb = fs.readFileSync(path.join(CAP_DIR, "presentacion.html"), "utf8");
const ICONOS = {};
for (const m of htmlWeb.matchAll(/<symbol id="i-([a-z]+)" viewBox="0 0 24 24">([\s\S]*?)<\/symbol>/g)) ICONOS[m[1]] = m[2];
const icono = (nombre, color) => "data:image/svg+xml;base64," + Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="192" height="192" fill="none" stroke="#${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONOS[nombre] ?? ICONOS.check}</svg>`).toString("base64");

// Colores y letra (los de la app)
const K = { fondo: "0B1A36", tarjeta: "12264D", linea: "24406F", texto: "F1F5F9", suave: "B6C3D8", cian: "38BDF8",
  amarillo: "FFD100", bien: "4ADE80", mal: "F87171", alerta: "FBBF24", oscuro: "04111F", tenue: "6F86AB" };
const F = "Segoe UI";
const NOMBRES = { 1: "El día del administrador", 2: "Liquidaciones", 3: "Taller, préstamo y rodar el tiempo", 4: "Nuevo: rodar por deuda", 5: "Ceder un contrato" };
const ARCHIVOS = { 1: "Tema 1 - El dia del administrador", 2: "Tema 2 - Liquidaciones", 3: "Tema 3 - Taller, prestamo y rodar el tiempo", 4: "Tema 4 - Rodar por deuda", 5: "Tema 5 - Ceder un contrato" };
const VIDEOS = { v1: "Video 1 - Cerrar una liquidacion sin firma y firmar despues.mp4", v2: "Video 2 - Moto al taller con prestamo.mp4", v3: "Video 3 - Rodar por deuda.mp4", v4: "Video 4 - Ceder un contrato.mp4" };
const temaDe = s => s.tema ?? s.n ?? null;
const W = 13.333, H = 7.5, MX = 0.75;

function base(pres, s, n, total) {
  const sl = pres.addSlide();
  sl.background = { color: K.fondo };
  // Un brillo azul arriba a la derecha, como en la app
  sl.addShape(pres.ShapeType.ellipse, { x: 8.5, y: -3.2, w: 8, h: 6, fill: { color: "163469", transparency: 72 }, line: { type: "none" } });
  const t = temaDe(s);
  sl.addText(t ? `Tema ${t} · ${NOMBRES[t]}` : "MotoGestión", { x: MX, y: 7.05, w: 7, h: 0.3, fontFace: F, fontSize: 11, color: K.tenue, margin: 0 });
  sl.addText(`${n} / ${total}`, { x: W - MX - 2, y: 7.05, w: 2, h: 0.3, fontFace: F, fontSize: 11, color: K.tenue, align: "right", margin: 0 });
  sl.addShape(pres.ShapeType.rect, { x: 0, y: H - 0.07, w: W, h: 0.07, fill: { color: "16243F" }, line: { type: "none" } });
  sl.addShape(pres.ShapeType.rect, { x: 0, y: H - 0.07, w: W * n / total, h: 0.07, fill: { color: K.cian }, line: { type: "none" } });
  if (s.notas) sl.addNotes(`(unos ${s.min ?? 1} min${s.opcional ? " · se puede saltar si va corto de tiempo" : ""})\n\n${s.notas}`);
  return sl;
}
const chip = (sl, s, y = 0.55) => { const t = temaDe(s); if (t) sl.addText(`TEMA ${t} · ${NOMBRES[t].toUpperCase()}`, { x: MX, y, w: 9, h: 0.35, fontFace: F, fontSize: 13, bold: true, color: K.cian, charSpacing: 2, margin: 0 }); };
const titulo = (sl, txt, y = 0.95, x = MX, w = W - 2 * MX, size = 30) => sl.addText(txt, { x, y, w, h: 0.75, fontFace: F, fontSize: size, bold: true, color: K.texto, margin: 0, valign: "top" });
const caja = (pres, sl, x, y, w, h, extra = {}) => sl.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.12, fill: { color: K.tarjeta }, line: { color: K.linea, width: 0.75 }, ...extra });
const bola = (pres, sl, x, y, d, n, fondo = K.cian) => {
  sl.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fondo }, line: { type: "none" } });
  sl.addText(String(n), { x, y, w: d, h: d, fontFace: F, fontSize: Math.round(d * 34), bold: true, color: K.oscuro, align: "center", valign: "middle", margin: 0 });
};
const pie = (pres, sl, txt, y) => {
  sl.addImage({ data: icono("alerta", K.alerta), x: MX, y: y + 0.02, w: 0.32, h: 0.32 });
  sl.addText(txt, { x: MX + 0.45, y, w: W - 2 * MX - 0.45, h: 0.75, fontFace: F, fontSize: 15, color: K.suave, margin: 0, valign: "top" });
};

const TIPOS = {
  portada(pres, sl, s) {
    const tp = s.temaPortada;
    sl.addShape(pres.ShapeType.roundRect, { x: MX, y: 2.05, w: 2.0, h: 0.42, rectRadius: 0.06, fill: { color: K.amarillo }, line: { color: "111111", width: 2 } });
    sl.addText("MOTOGESTIÓN", { x: MX, y: 2.05, w: 2.0, h: 0.42, fontFace: F, fontSize: 13, bold: true, color: "111111", align: "center", valign: "middle", charSpacing: 3, margin: 0 });
    if (tp) sl.addText(`TEMA ${tp} DE 5`, { x: MX, y: 2.7, w: 8, h: 0.45, fontFace: F, fontSize: 18, bold: true, color: K.cian, charSpacing: 2, margin: 0 });
    sl.addText(tp ? NOMBRES[tp] : C.titulo, { x: MX, y: tp ? 3.2 : 2.8, w: 11.5, h: 1.2, fontFace: F, fontSize: 50, bold: true, color: K.texto, margin: 0 });
    sl.addText(`Capacitación del equipo · ${C.fecha}`, { x: MX, y: 4.55, w: 11, h: 0.5, fontFace: F, fontSize: 20, color: K.suave, margin: 0 });
    sl.addText("Club Moteros Cartagena", { x: MX, y: 5.1, w: 11, h: 0.4, fontFace: F, fontSize: 16, color: K.suave, margin: 0 });
  },
  agenda(pres, sl, s) {
    titulo(sl, s.titulo, 0.55);
    s.items.forEach((it, i) => {
      const y = 1.45 + i * 1.08;
      caja(pres, sl, MX, y, W - 2 * MX, 0.92);
      sl.addText(String(it.n), { x: MX + 0.15, y, w: 0.6, h: 0.92, fontFace: F, fontSize: 28, bold: true, color: K.cian, align: "center", valign: "middle", margin: 0 });
      sl.addImage({ data: icono(it.icono, K.amarillo), x: MX + 0.95, y: y + 0.21, w: 0.5, h: 0.5 });
      sl.addText([{ text: it.t, options: { fontSize: 21, bold: true, color: K.texto, breakLine: true } }, { text: it.d, options: { fontSize: 14, color: K.suave } }],
        { x: MX + 1.75, y, w: 9.5, h: 0.92, fontFace: F, valign: "middle", margin: 0 });
    });
  },
  reglas(pres, sl, s) {
    titulo(sl, s.titulo, 0.55);
    const seis = s.items.length > 3;
    s.items.forEach((it, i) => {
      const col = seis ? i % 2 : 0, fila = seis ? Math.floor(i / 2) : i;
      const w = seis ? (W - 2 * MX - 0.3) / 2 : W - 2 * MX, x = MX + col * (w + 0.3), y = 1.5 + fila * (seis ? 1.6 : 1.7), h = seis ? 1.35 : 1.45;
      caja(pres, sl, x, y, w, h);
      sl.addImage({ data: icono(it.icono, K.cian), x: x + 0.3, y: y + h / 2 - 0.3, w: 0.6, h: 0.6 });
      sl.addText(it.d ? [{ text: it.t, options: { fontSize: seis ? 19 : 23, bold: true, color: K.texto, breakLine: true } }, { text: it.d, options: { fontSize: 15, color: K.suave } }]
        : [{ text: it.t, options: { fontSize: 19, bold: true, color: K.texto } }], { x: x + 1.15, y, w: w - 1.35, h, fontFace: F, valign: "middle", margin: 0 });
    });
  },
  seccion(pres, sl, s) {
    sl.addText(String(s.n), { x: MX, y: 1.6, w: 3.2, h: 4, fontFace: F, fontSize: 200, bold: true, color: K.cian, transparency: 20, align: "center", valign: "middle", margin: 0 });
    sl.addText(`TEMA ${s.n} DE 5`, { x: 4.3, y: 2.5, w: 8, h: 0.4, fontFace: F, fontSize: 15, bold: true, color: K.cian, charSpacing: 2, margin: 0 });
    sl.addText(s.titulo, { x: 4.3, y: 2.95, w: 8.3, h: 1.4, fontFace: F, fontSize: 44, bold: true, color: K.texto, margin: 0, valign: "top" });
    sl.addText(s.sub, { x: 4.3, y: 4.45, w: 8.3, h: 1.2, fontFace: F, fontSize: 20, color: K.suave, margin: 0, valign: "top" });
  },
  frase(pres, sl, s) {
    chip(sl, s, 1.1);
    sl.addImage({ data: icono(s.icono, K.amarillo), x: MX, y: 1.65, w: 0.95, h: 0.95 });
    if (s.cita) {
      sl.addShape(pres.ShapeType.rect, { x: MX, y: 2.9, w: 0.1, h: 2.6, fill: { color: K.amarillo }, line: { type: "none" } });
      sl.addText(s.frase, { x: MX + 0.35, y: 2.85, w: 11.3, h: 2.7, fontFace: F, fontSize: 23, color: K.texto, margin: 0, valign: "top" });
      if (s.sub) sl.addText(s.sub, { x: MX, y: 5.75, w: 11.5, h: 0.6, fontFace: F, fontSize: 18, color: K.suave, margin: 0 });
    } else {
      sl.addText(s.frase, { x: MX, y: 2.85, w: 11.6, h: 2.3, fontFace: F, fontSize: 36, bold: true, color: K.texto, margin: 0, valign: "top" });
      if (s.sub) sl.addText(s.sub, { x: MX, y: 5.25, w: 11.6, h: 1.2, fontFace: F, fontSize: 19, color: K.suave, margin: 0, valign: "top" });
    }
  },
  pasos(pres, sl, s) {
    chip(sl, s); titulo(sl, s.titulo);
    const n = s.pasos.length, gap = 0.18, w = (W - 2 * MX - gap * (n - 1)) / n, y = 2.0, h = n > 5 ? 3.9 : 3.5;
    s.pasos.forEach((p, i) => {
      const x = MX + i * (w + gap);
      caja(pres, sl, x, y, w, h);
      bola(pres, sl, x + 0.2, y + 0.22, 0.5, i + 1);
      sl.addImage({ data: icono(p.icono, K.amarillo), x: x + 0.2, y: y + 0.95, w: 0.55, h: 0.55 });
      sl.addText([{ text: p.t, options: { fontSize: n > 5 ? 14 : 18, bold: true, color: K.texto, breakLine: true } }, { text: p.d, options: { fontSize: n > 5 ? 11 : 14, color: K.suave } }],
        { x: x + 0.2, y: y + 1.65, w: w - 0.35, h: h - 1.8, fontFace: F, valign: "top", margin: 0, paraSpaceAfter: 4 });
    });
  },
  tabla(pres, sl, s) {
    chip(sl, s); titulo(sl, s.titulo);
    const centro = s.columnas.length > 4;
    const largo = s.filas.length > 5 || s.filas.some(f => f.join(" ").length > 140);
    const fs = centro ? 22 : largo ? 14 : s.filas.length <= 3 ? 18 : 16;
    const cab = s.columnas.map(c => ({ text: c.toUpperCase(), options: { bold: true, color: K.cian, fill: { color: "1A3566" }, fontSize: centro ? 15 : 13 } }));
    const filas = s.filas.map(f => f.map((c, j) => ({ text: c, options: { bold: j === 0, color: K.texto, fill: { color: K.tarjeta }, fontSize: centro && j > 0 ? fs : (centro ? 15 : fs) } })));
    const ancho = W - 2 * MX;
    let colW;
    if (centro) { const resto = (ancho - 2.4) / (s.columnas.length - 1); colW = [2.4, ...Array(s.columnas.length - 1).fill(resto)]; }
    else if (s.columnas.length === 2) colW = [ancho * 0.32, ancho * 0.68];
    else colW = [ancho * 0.22, ancho * 0.36, ancho * 0.42];
    sl.addTable([cab, ...filas], { x: MX, y: 1.95, w: ancho, colW, fontFace: F, border: { type: "solid", color: K.linea, pt: 0.75 },
      margin: 0.09, valign: centro ? "middle" : "top", align: centro ? "center" : "left", autoPage: false });
    if (s.pie) pie(pres, sl, s.pie, 6.05);
  },
  comparar(pres, sl, s) {
    chip(sl, s); titulo(sl, s.titulo);
    const w = (W - 2 * MX - 0.3) / 2, y = 2.0, h = s.pie ? 3.7 : 4.4;
    [s.izq, s.der].forEach((c, i) => {
      const x = MX + i * (w + 0.3), color = c.tono === "bien" ? K.bien : c.tono === "mal" ? K.mal : K.cian;
      caja(pres, sl, x, y, w, h);
      sl.addShape(pres.ShapeType.rect, { x: x + 0.12, y, w: w - 0.24, h: 0.09, fill: { color }, line: { type: "none" } });
      sl.addImage({ data: icono(c.tono === "mal" ? "x" : "check", color), x: x + 0.3, y: y + 0.32, w: 0.42, h: 0.42 });
      sl.addText(c.titulo, { x: x + 0.85, y: y + 0.27, w: w - 1.1, h: 0.5, fontFace: F, fontSize: 21, bold: true, color, margin: 0, valign: "middle" });
      sl.addText(c.items.map(t => ({ text: t, options: { bullet: { code: "25CF" }, breakLine: true } })),
        { x: x + 0.3, y: y + 0.95, w: w - 0.55, h: h - 1.1, fontFace: F, fontSize: 17, color: K.texto, valign: "top", margin: 0, paraSpaceAfter: 8 });
    });
    if (s.pie) pie(pres, sl, s.pie, 5.95);
  },
  lista(pres, sl, s) {
    chip(sl, s); titulo(sl, s.titulo);
    const color = { mal: K.mal, bien: K.bien, alerta: K.alerta, info: K.cian }[s.tono] ?? K.cian;
    const ic = { mal: "x", bien: "check", alerta: "alerta", info: "check" }[s.tono] ?? "check";
    const dos = s.items.length > 6, cols = dos ? 2 : 1, filas = Math.ceil(s.items.length / cols);
    const w = (W - 2 * MX - (cols - 1) * 0.25) / cols, alto = Math.min(0.92, (4.55 - (s.pie ? 0.5 : 0)) / filas - 0.12);
    s.items.forEach((t, i) => {
      const col = dos ? i % 2 : 0, fila = dos ? Math.floor(i / 2) : i;
      const x = MX + col * (w + 0.25), y = 1.95 + fila * (alto + 0.12);
      caja(pres, sl, x, y, w, alto);
      sl.addShape(pres.ShapeType.rect, { x, y, w: 0.09, h: alto, fill: { color }, line: { type: "none" } });
      sl.addImage({ data: icono(ic, color), x: x + 0.28, y: y + alto / 2 - 0.19, w: 0.38, h: 0.38 });
      sl.addText(t, { x: x + 0.85, y, w: w - 1.05, h: alto, fontFace: F, fontSize: dos ? 15 : s.items.length > 4 ? 17 : 19, color: K.texto, valign: "middle", margin: 0 });
    });
    if (s.pie) pie(pres, sl, s.pie, 6.2);
  },
  pantalla(pres, sl, s) {
    const ancha = !!s.ancho;
    const ih = ancha ? 6.15 : 6.33, iw = ancha ? ih * 1680 / 2200 : ih * 780 / 1688, ix = MX, iy = (H - ih) / 2 - 0.05;
    sl.addShape(pres.ShapeType.roundRect, { x: ix - 0.09, y: iy - 0.09, w: iw + 0.18, h: ih + 0.18, rectRadius: ancha ? 0.08 : 0.25, fill: { color: "020617" }, line: { type: "none" } });
    sl.addImage({ path: path.join(CAP_DIR, "img", s.img), x: ix, y: iy, w: iw, h: ih });
    s.marcas.forEach((m, i) => {
      const [x, y, w, h] = m.r;
      sl.addShape(pres.ShapeType.roundRect, { x: ix + iw * x / 100, y: iy + ih * y / 100, w: iw * w / 100, h: ih * h / 100, rectRadius: 0.06, fill: { type: "none" }, line: { color: K.cian, width: 2.5 } });
      bola(pres, sl, ix + iw * (x + w) / 100 - 0.15, iy + ih * y / 100 - 0.17, 0.33, i + 1);
    });
    const tx = ix + iw + 0.6, tw = W - tx - MX;
    const t = temaDe(s);
    if (t) sl.addText(`TEMA ${t} · ${NOMBRES[t].toUpperCase()}`, { x: tx, y: 1.0, w: tw, h: 0.35, fontFace: F, fontSize: 13, bold: true, color: K.cian, charSpacing: 2, margin: 0 });
    titulo(sl, s.titulo, 1.4, tx, tw, 27);
    const n = s.marcas.length, paso = n > 4 ? 0.72 : 0.85;
    s.marcas.forEach((m, i) => {
      const y = 2.35 + i * paso;
      bola(pres, sl, tx, y + 0.02, 0.38, i + 1);
      sl.addText(m.t, { x: tx + 0.55, y, w: tw - 0.55, h: paso - 0.06, fontFace: F, fontSize: n > 4 ? 15 : 16.5, color: K.texto, valign: "top", margin: 0 });
    });
    if (s.ojo) {
      const y = 2.35 + n * paso + 0.15;
      sl.addShape(pres.ShapeType.roundRect, { x: tx, y, w: tw, h: 0.95, rectRadius: 0.1, fill: { color: K.alerta, transparency: 86 }, line: { color: K.alerta, width: 1.5 } });
      sl.addImage({ data: icono("alerta", K.alerta), x: tx + 0.2, y: y + 0.27, w: 0.4, h: 0.4 });
      sl.addText(s.ojo, { x: tx + 0.75, y, w: tw - 0.95, h: 0.95, fontFace: F, fontSize: 14.5, color: "FDE68A", valign: "middle", margin: 0 });
    }
  },
  video(pres, sl, s) {
    const v = C.videos[s.video];
    const vw = 7.6, vh = vw * 720 / 1280, vx = MX, vy = (H - vh) / 2;
    sl.addShape(pres.ShapeType.roundRect, { x: vx - 0.08, y: vy - 0.08, w: vw + 0.16, h: vh + 0.16, rectRadius: 0.08, fill: { color: "020617" }, line: { color: K.amarillo, width: 2 } });
    const mp4 = path.join(CAP_DIR, "videos", VIDEOS[s.video]);
    const poster = path.join(CAP_DIR, "powerpoint", `_portada-${s.video}.png`);
    sl.addMedia({ type: "video", path: mp4, x: vx, y: vy, w: vw, h: vh, cover: fs.existsSync(poster) ? "data:image/png;base64," + fs.readFileSync(poster).toString("base64") : undefined });
    const tx = vx + vw + 0.5, tw = W - tx - MX;
    const t = temaDe(s);
    if (t) sl.addText(`TEMA ${t} · ${NOMBRES[t].toUpperCase()}`, { x: tx, y: 1.6, w: tw, h: 0.35, fontFace: F, fontSize: 12, bold: true, color: K.cian, charSpacing: 2, margin: 0 });
    sl.addImage({ data: icono("video", K.amarillo), x: tx, y: 2.05, w: 0.55, h: 0.55 });
    sl.addText(v.titulo, { x: tx, y: 2.75, w: tw, h: 1.3, fontFace: F, fontSize: 24, bold: true, color: K.texto, margin: 0, valign: "top" });
    sl.addText(`Video corto con voz, de ${v.escenas.length} pasos. Haga clic sobre el video para reproducirlo.`, { x: tx, y: 4.15, w: tw, h: 1.1, fontFace: F, fontSize: 15, color: K.suave, margin: 0, valign: "top" });
  },
  cierre(pres, sl, s) {
    sl.addImage({ data: icono("pregunta", K.amarillo), x: W / 2 - 0.75, y: 1.5, w: 1.5, h: 1.5 });
    sl.addText("¿Preguntas?", { x: 0, y: 3.2, w: W, h: 1.2, fontFace: F, fontSize: 60, bold: true, color: K.texto, align: "center", margin: 0 });
    sl.addText("Gracias. Los videos y esta presentación quedan para repasar.", { x: 0, y: 4.5, w: W, h: 0.6, fontFace: F, fontSize: 20, color: K.suave, align: "center", margin: 0 });
  },
};

async function armar(tema) {
  const lista = tema ? [
    { tipo: "portada", temaPortada: tema, min: 0.5, notas: `Arrancamos con el tema ${tema}: ${NOMBRES[tema]}.` },
    ...C.slides.filter(s => temaDe(s) === tema),
    { tipo: "cierre", min: 2, notas: "¿Preguntas sobre este tema? Es mejor preguntar hoy que equivocarse mañana con la plata de un cliente." },
  ] : C.slides;
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "MotoGestión";
  pres.company = "Club Moteros Cartagena";
  pres.title = tema ? `Capacitación · Tema ${tema}: ${NOMBRES[tema]}` : `Capacitación · ${C.fecha}`;
  lista.forEach((s, i) => {
    const sl = base(pres, s, i + 1, lista.length);
    TIPOS[s.tipo](pres, sl, s);
  });
  const nombre = path.join(SALIDA, `Capacitacion 7-oct - ${tema ? ARCHIVOS[tema] : "Completa"}.pptx`);
  await pres.writeFile({ fileName: nombre });
  console.log(`${path.basename(nombre)}: ${lista.length} diapositivas, ${(fs.statSync(nombre).size / 1048576).toFixed(1)} MB`);
}

(async () => {
  const pedidos = process.argv.slice(2).map(Number).filter(Boolean);
  for (const t of pedidos.length ? pedidos : [1, 2, 3, 4, 5]) await armar(t);
})();
