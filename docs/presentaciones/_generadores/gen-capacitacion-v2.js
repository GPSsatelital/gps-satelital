// Deck de capacitación operativa v2 — organizado por el DÍA A DÍA de cada rol y por
// CASOS reales, con ilustración de pantalla, ejemplo con cifras y advertencias.
// El contenido vive en contenido-capacitacion.json (editable sin tocar este archivo).
//
//   node gen-capacitacion-v2.js ../03-Capacitacion-operativa.pptx
const pptxgen = require("pptxgenjs");
const V = require("./_visual-lib");
const C = V.C, F = C.F;
const CONT = require("./contenido-capacitacion.json");

const OUT = process.argv[2] || "03-Capacitacion-operativa.pptx";
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
p.author = "GPS Satelital Cartagena";
p.title = "MotoGestión — Capacitación operativa";

// Recorta sin partir palabras: prefiere terminar en punto; si no, en el último espacio.
function recorta(txt, max) {
  const t = String(txt || "").trim();
  if (t.length <= max) return t;
  const corte = t.slice(0, max);
  const punto = corte.lastIndexOf(". ");
  if (punto > max * 0.55) return corte.slice(0, punto + 1);
  const esp = corte.lastIndexOf(" ");
  return (esp > 0 ? corte.slice(0, esp) : corte) + "…";
}

// Plantillas de las pantallas reales de la app. Se elige por el módulo que menciona el
// bloque y se resalta la fila que aparece en su ruta, para que la ilustración sea
// reconocible (no una lista de texto suelto).
const PANTALLAS = [
  { k: /cartera|cobros/i, titulo: "Cartera & Cobros", tab: 2, pie: "Módulo Cartera",
    filas: ["🌎 Todos", "📋 Para hacer hoy", "⏳ Por confirmar", "🧾 Historial"] },
  { k: /clientes|ficha del cliente|visita/i, titulo: "Clientes", tab: 1, pie: "Módulo Clientes",
    filas: ["+ Nuevo cliente", "🏠 Para visita", "Pendiente evaluación", "Ver ficha completa"] },
  { k: /ficha completa|🕘|línea de tiempo|historial del cliente/i, titulo: "Ficha del cliente", tab: 1, pie: "Ficha del cliente",
    filas: ["Resumen", "🕘 Historial", "Pagos", "Documentos"] },
  { k: /motos|novedad|tarjeta de propiedad|documentos de la moto/i, titulo: "Motos", tab: 3, pie: "Módulo Motos",
    filas: ["Buscar placa", "🏍️ Registrar novedad", "🪪 Documentos", "📍 Ubicación"] },
  { k: /tarjetas y llaves|prestar tarjeta|copia de llave/i, titulo: "Tarjetas y Llaves", tab: 4, pie: "Tarjetas y Llaves",
    filas: ["📤 Prestar", "📋 Prestadas ahora", "✅ Devolver", "🕘 Historial"] },
  { k: /inmoviliza|retenid|recolecc/i, titulo: "Inmovilizaciones", tab: 4, pie: "Inmovilizaciones",
    filas: ["🔒 Retenidas", "🔴 En mora", "💵 Cobrar", "✓ Entregar moto"] },
  { k: /caja diaria|cierre de caja/i, titulo: "Caja Diaria", tab: 4, pie: "Caja Diaria",
    filas: ["Recaudo del día", "Por grupo", "Por funcionario", "Cerrar caja"] },
  { k: /taller/i, titulo: "Taller", tab: 4, pie: "Módulo Taller",
    filas: ["Nueva orden", "En taller", "Finalizar orden", "Costo y repuestos"] },
  { k: /alerta|campana/i, titulo: "Alertas", tab: 0, pie: "Campana de alertas",
    filas: ["🔴 Mora", "🏦 Transferencias", "📄 Documentos", "🗓️ Promesas"] },
  { k: /contrato|wizard|entrega/i, titulo: "Contratos", tab: 4, pie: "Módulo Contratos",
    filas: ["Nuevo contrato", "Activos", "📎 Documentos", "Editar contrato"] },
  { k: /historial pagos/i, titulo: "Historial de Pagos", tab: 4, pie: "Historial de Pagos",
    filas: ["Buscar cliente", "Desde / Hasta", "Método", "Estado"] },
];

function pantallaDe(ruta) {
  const txt = String(ruta || "");
  const tpl = PANTALLAS.find(x => x.k.test(txt)) || PANTALLAS[0];
  // resalta la fila que aparezca mencionada en la ruta (si alguna)
  const limpio = t => t.replace(/[^\wáéíóúñ ]/gi, "").trim().toLowerCase();
  let idx = tpl.filas.findIndex(f => {
    const l = limpio(f);
    return l.length > 3 && limpio(txt).includes(l);
  });
  if (idx < 0) idx = 1;
  return {
    titulo: tpl.titulo, tabActivo: tpl.tab, pieDeFoto: tpl.pie,
    filas: tpl.filas.map((f, i) => ({ txt: f, sub: i === idx ? "aquí se hace" : "" })),
    resaltar: { fila: idx },
  };
}

let N = 0;
function pie(s) {
  N++;
  s.addText("MotoGestión · Capacitación operativa", { x: 0.5, y: 7.04, w: 7, h: 0.3, fontFace: F, fontSize: 9, color: C.MUTED, margin: 0 });
  s.addText(String(N), { x: 12.4, y: 7.04, w: 0.45, h: 0.3, fontFace: F, fontSize: 9, color: C.MUTED, align: "right", margin: 0 });
}
function titulo(s, kicker, texto) {
  s.addText(kicker.toUpperCase(), { x: 0.6, y: 0.38, w: 12, h: 0.28, fontFace: F, fontSize: 11.5, bold: true, color: C.CYAN_D, charSpacing: 2, margin: 0 });
  s.addText(texto, { x: 0.6, y: 0.64, w: 12.1, h: 0.62, fontFace: F, fontSize: 27, bold: true, color: C.INK, margin: 0 });
}

// ── Portada ──────────────────────────────────────────────────────────────────
{
  const s = p.addSlide(); s.background = { color: C.NAVY };
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.12, fill: { color: C.YELLOW }, line: { type: "none" } });
  s.addText("MOTOGESTIÓN", { x: 0.9, y: 2.15, w: 11, h: 0.8, fontFace: F, fontSize: 46, bold: true, color: C.WHITE, charSpacing: 1, margin: 0 });
  s.addText("Cómo se trabaja, día a día", { x: 0.9, y: 3.0, w: 11, h: 0.6, fontFace: F, fontSize: 26, color: C.CYAN, margin: 0 });
  s.addText("Lo que hace cada quien en su puesto, con ejemplos reales y qué hacer en los casos que se presentan.",
    { x: 0.9, y: 3.75, w: 9.6, h: 0.8, fontFace: F, fontSize: 14, color: "CBD5E1", margin: 0, lineSpacingMultiple: 1.1 });
  V.pantallaMovil(p, s, 10.55, 1.55, 4.3, {
    titulo: "Cartera & Cobros",
    filas: [
      { txt: "Pagan hoy", sub: "38 clientes", badge: "Hoy" },
      { txt: "YESID CONTRERAS", sub: "DQW25I · debe $461.500", badge: "Mora", badgeColor: C.BAD },
      { txt: "💵 Cobrar", sub: "registrar el pago" },
      { txt: "MARTHA ALVAREZ", sub: "RLT68H · al día", badge: "OK", badgeColor: C.OK },
    ],
    resaltar: { fila: 2 },
  });
  s.addText("GPS Satelital Cartagena · Club de moteros", { x: 0.9, y: 6.4, w: 9, h: 0.3, fontFace: F, fontSize: 12, color: C.CYAN, margin: 0 });
  N++;
}

// ── Cómo usar esta guía ──────────────────────────────────────────────────────
{
  const s = p.addSlide(); s.background = { color: C.WHITE };
  titulo(s, "Antes de empezar", "Cómo está organizada esta capacitación");
  const bloques = [
    { t: "1 · El día a día de cada puesto", d: "Qué hace la secretaria, el cobrador y el administrador, momento por momento: al llegar, durante el día y al cerrar." },
    { t: "2 · ¿Qué hago si…?", d: "Los casos que de verdad pasan en el mostrador y en la calle, con la respuesta paso a paso." },
    { t: "3 · Las reglas de oro", d: "Lo que nunca se debe hacer, y por qué. Son pocas, pero son las que cuidan la plata." },
  ];
  bloques.forEach((b, i) => {
    const y = 1.75 + i * 1.55;
    s.addShape(p.ShapeType.roundRect, { x: 0.7, y, w: 7.4, h: 1.32, fill: { color: C.SOFT }, line: { color: C.LINE, width: 1 }, rectRadius: 0.1 });
    s.addText(b.t, { x: 1.0, y: y + 0.16, w: 6.9, h: 0.36, fontFace: F, fontSize: 16, bold: true, color: C.INK, margin: 0 });
    s.addText(b.d, { x: 1.0, y: y + 0.55, w: 6.9, h: 0.66, fontFace: F, fontSize: 12.5, color: C.MUTED, margin: 0, lineSpacingMultiple: 1.05 });
  });
  V.bloqueEjemplo(p, s, 8.5, 1.75, 4.2, 2.1,
    "En cada lámina vas a ver:\n· La pantalla donde se hace\n· Los pasos exactos que hay que tocar\n· Un ejemplo con nombres y cifras reales");
  V.bloqueOjo(p, s, 8.5, 4.05, 4.2, 2.05,
    "Nadie tiene que memorizar nada. Esta guía queda impresa en cada puesto: cuando se presente un caso, se busca y se sigue el paso a paso.");
  pie(s);
}

// ── Secciones por rol y casos ────────────────────────────────────────────────
const META = {
  secretaria: { kicker: "El día a día", nombre: "La secretaria", color: C.OK },
  cobrador:   { kicker: "El día a día", nombre: "El cobrador en la calle", color: C.CYAN_D },
  admin:      { kicker: "El día a día", nombre: "El administrador", color: C.NAVY2 },
  casos:      { kicker: "Consulta rápida", nombre: "¿Qué hago si…?", color: C.WARN },
};

function separador(s, meta, sub) {
  s.background = { color: C.NAVY };
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.12, fill: { color: C.YELLOW }, line: { type: "none" } });
  s.addText(meta.kicker.toUpperCase(), { x: 1.0, y: 2.7, w: 11, h: 0.34, fontFace: F, fontSize: 13, bold: true, color: C.CYAN, charSpacing: 2.5, margin: 0 });
  s.addText(meta.nombre, { x: 1.0, y: 3.05, w: 11, h: 0.9, fontFace: F, fontSize: 40, bold: true, color: C.WHITE, margin: 0 });
  s.addText(sub, { x: 1.0, y: 4.0, w: 10.4, h: 0.9, fontFace: F, fontSize: 14.5, color: "CBD5E1", margin: 0, lineSpacingMultiple: 1.1 });
}

// Lámina de un "momento del día"
function laminaMomento(b, meta) {
  const s = p.addSlide(); s.background = { color: C.WHITE };
  titulo(s, meta.nombre, b.momento.replace(/^"|"$/g, ""));
  s.addText(b.objetivo, { x: 0.6, y: 1.3, w: 12.1, h: 0.4, fontFace: F, fontSize: 13, color: C.MUTED, italic: true, margin: 0 });

  // ── Pantalla ilustrada (izquierda): la pantalla REAL del módulo, con el
  // elemento mencionado resaltado. Así el funcionario la reconoce de inmediato.
  const pant = pantallaDe(b.pantalla);
  V.pantallaMovil(p, s, 0.7, 1.85, 3.7, pant);
  V.señala(p, s, 0.7, 5.72, 2.5, pant.pieDeFoto);

  // ── Pasos (centro): sin cortar frases a la mitad ──
  const pasos = (b.pasos || []).slice(0, 7);
  const alto = Math.min(0.68, 4.65 / Math.max(pasos.length, 1));
  const fs = pasos.length >= 7 ? 9.5 : pasos.length >= 6 ? 10 : 10.5;
  pasos.forEach((t, i) => {
    const y = 1.88 + i * alto;
    s.addShape(p.ShapeType.ellipse, { x: 4.6, y: y + 0.03, w: 0.3, h: 0.3, fill: { color: C.NAVY }, line: { type: "none" } });
    s.addText(String(i + 1), { x: 4.6, y: y + 0.03, w: 0.3, h: 0.3, fontFace: F, fontSize: 10, bold: true, color: C.YELLOW, align: "center", valign: "middle", margin: 0 });
    s.addText(recorta(t, 215), { x: 5.0, y, w: 3.6, h: alto, fontFace: F, fontSize: fs, color: C.INK, valign: "middle", margin: 0, lineSpacingMultiple: 0.92 });
  });

  // ── Ejemplo + advertencia (derecha) ──
  V.bloqueEjemplo(p, s, 8.75, 1.85, 3.95, b.ojo ? 2.55 : 4.3, recorta(b.ejemplo, b.ojo ? 380 : 640));
  if (b.ojo) V.bloqueOjo(p, s, 8.75, 4.55, 3.95, 1.85, recorta(b.ojo, 280));
  pie(s);
}

for (const sec of CONT) {
  const meta = META[sec.rol];
  if (sec.rol === "casos") continue; // los casos van al final, en formato de fichas
  { const s = p.addSlide(); separador(s, meta, sec.proposito); N++; }
  sec.bloques.forEach(b => laminaMomento(b, meta));
}

// ── Catálogo de casos: 2 fichas por lámina ───────────────────────────────────
{
  const casos = CONT.find(x => x.rol === "casos");
  { const s = p.addSlide(); separador(s, META.casos, casos.proposito); N++; }
  for (let i = 0; i < casos.bloques.length; i += 2) {
    const s = p.addSlide(); s.background = { color: C.WHITE };
    titulo(s, "Consulta rápida", "¿Qué hago si…?");
    [casos.bloques[i], casos.bloques[i + 1]].forEach((b, k) => {
      if (!b) return;
      const x = 0.7 + k * 6.3;
      V.fichaCaso(p, s, x, 1.5, 5.9, 3.95, {
        pregunta: recorta(b.momento.replace(/^"|"$/g, ""), 68),
        pasos: (b.pasos || []).slice(0, 6).map(t => recorta(t, 150)),
        ojo: b.ojo ? recorta(b.ojo, 135) : null,
      });
      V.bloqueEjemplo(p, s, x, 5.62, 5.9, 1.2, recorta(b.ejemplo, 235));
    });
    pie(s);
  }
}

// ── Reglas de oro ────────────────────────────────────────────────────────────
{
  const s = p.addSlide(); s.background = { color: C.WHITE };
  titulo(s, "Para cerrar", "Las 6 reglas de oro");
  const reglas = [
    { t: "Registra en el momento", d: "Nunca anotes en papel para pasarlo después. Lo que no está en el sistema, no existe." },
    { t: "Antes de cobrar, revisa el Historial", d: "Si el cliente dice que ya pagó, míralo ahí antes de discutir o volver a cobrar." },
    { t: "Nunca registres un pago dos veces", d: "Si sale el aviso amarillo de pago repetido, detente y revisa." },
    { t: "Confirma la transferencia solo con el banco a la vista", d: "La foto del comprobante no es prueba de que la plata entró." },
    { t: "Cada quien entra con su usuario", d: "Todo queda con el nombre de quien lo hizo. Compartir la sesión es cargar con errores ajenos." },
    { t: "La moto nunca deja de producir", d: "Si una moto está quieta, hay que resolverlo: cobrar, rodar el tiempo o reasignarla." },
  ];
  reglas.forEach((r, i) => {
    const col = i % 2, fila = Math.floor(i / 2);
    const x = 0.7 + col * 6.3, y = 1.6 + fila * 1.72;
    s.addShape(p.ShapeType.roundRect, { x, y, w: 5.9, h: 1.5, fill: { color: C.SOFT }, line: { color: C.LINE, width: 1 }, rectRadius: 0.1 });
    s.addShape(p.ShapeType.ellipse, { x: x + 0.24, y: y + 0.28, w: 0.5, h: 0.5, fill: { color: C.YELLOW }, line: { color: C.NAVY, width: 1 } });
    s.addText(String(i + 1), { x: x + 0.24, y: y + 0.28, w: 0.5, h: 0.5, fontFace: F, fontSize: 16, bold: true, color: C.NAVY, align: "center", valign: "middle", margin: 0 });
    s.addText(r.t, { x: x + 0.92, y: y + 0.2, w: 4.8, h: 0.42, fontFace: F, fontSize: 14, bold: true, color: C.INK, valign: "middle", margin: 0 });
    s.addText(r.d, { x: x + 0.92, y: y + 0.62, w: 4.8, h: 0.7, fontFace: F, fontSize: 11.5, color: C.MUTED, margin: 0, lineSpacingMultiple: 1.02 });
  });
  pie(s);
}

// ── Cierre ───────────────────────────────────────────────────────────────────
{
  const s = p.addSlide(); s.background = { color: C.NAVY };
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.12, fill: { color: C.YELLOW }, line: { type: "none" } });
  s.addText("¿Y si algo sale mal?", { x: 1.0, y: 2.3, w: 11, h: 0.8, fontFace: F, fontSize: 36, bold: true, color: C.WHITE, margin: 0 });
  const pasos = [
    "No lo dejes pasar ni lo arregles por fuera del sistema.",
    "Anota qué pasó: cliente, placa, hora y qué estabas haciendo.",
    "Avísale al administrador el mismo día.",
    "Si es de plata (un pago mal registrado), avisa de inmediato: mientras más rápido, más fácil de corregir.",
  ];
  pasos.forEach((t, i) => {
    const y = 3.35 + i * 0.6;
    s.addShape(p.ShapeType.ellipse, { x: 1.0, y, w: 0.38, h: 0.38, fill: { color: C.CYAN }, line: { type: "none" } });
    s.addText(String(i + 1), { x: 1.0, y, w: 0.38, h: 0.38, fontFace: F, fontSize: 13, bold: true, color: C.NAVY, align: "center", valign: "middle", margin: 0 });
    s.addText(t, { x: 1.55, y, w: 10.5, h: 0.38, fontFace: F, fontSize: 14, color: "E2E8F0", valign: "middle", margin: 0 });
  });
  s.addText("Equivocarse y avisar se arregla. Equivocarse y callar, no.", { x: 1.0, y: 6.1, w: 11, h: 0.4, fontFace: F, fontSize: 15, bold: true, color: C.YELLOW, margin: 0 });
  N++;
}

p.writeFile({ fileName: OUT }).then(f => console.log("Deck generado:", f, "· láminas:", N));
