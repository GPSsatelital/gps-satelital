// Guía rápida de 1 página por rol — para imprimir y pegar en el puesto de trabajo.
// Hoja carta vertical. Se alimenta del mismo contenido-capacitacion.json.
//
//   node gen-guias-rol.js ../Guias-rapidas-por-rol.pptx
const pptxgen = require("pptxgenjs");
const V = require("./_visual-lib");
const C = V.C, F = C.F;
const CONT = require("./contenido-capacitacion.json");

const OUT = process.argv[2] || "Guias-rapidas-por-rol.pptx";
const p = new pptxgen();
p.defineLayout({ name: "CARTA", width: 8.5, height: 11 });
p.layout = "CARTA";
p.title = "MotoGestión — Guías rápidas por rol";

function recorta(txt, max) {
  const t = String(txt || "").trim();
  if (t.length <= max) return t;
  const c = t.slice(0, max), e = c.lastIndexOf(" ");
  return (e > 0 ? c.slice(0, e) : c) + "…";
}
// En la chuleta va SOLO la acción: se quita la explicación entre paréntesis (que suele ser
// la ruta larga) y se corta en la primera oración. Textos largos desbordan la fila.
function esencia(txt) {
  const t = String(txt || "").replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  const m = t.match(/^[^.]{8,110}\./);
  return recorta(m ? m[0] : t, 108);
}

const ROLES = [
  { rol: "secretaria", nombre: "SECRETARIA", quien: "Recibe la plata, confirma y cierra la caja", color: C.OK },
  { rol: "cobrador", nombre: "COBRADOR", quien: "Cobra en la calle y persigue la mora", color: C.CYAN_D },
  { rol: "admin", nombre: "ADMINISTRADOR", quien: "Autoriza, entrega motos y vigila el negocio", color: C.NAVY2 },
];

const REGLAS = {
  secretaria: [
    "Nunca confirmes una transferencia sin ver el banco.",
    "Si sale el aviso de pago repetido, revisa el Historial antes.",
    "Registra en el momento, nunca en papel para después.",
  ],
  cobrador: [
    "Todo lo que recojas, regístralo al momento y con foto.",
    "Entrega el efectivo el mismo día a la secretaria.",
    "Antes de recoger una moto, deja registrada la gestión.",
  ],
  admin: [
    "La moto nunca debe dejar de producir.",
    "Todo plazo o convenio se registra, nunca de palabra.",
    "Revisa la campana de alertas dos veces al día.",
  ],
};

for (const R of ROLES) {
  const sec = CONT.find(x => x.rol === R.rol);
  if (!sec) continue;
  const s = p.addSlide();
  s.background = { color: C.WHITE };

  // Encabezado
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 8.5, h: 1.15, fill: { color: C.NAVY }, line: { type: "none" } });
  s.addShape(p.ShapeType.rect, { x: 0, y: 1.15, w: 8.5, h: 0.08, fill: { color: C.YELLOW }, line: { type: "none" } });
  s.addText("GUÍA RÁPIDA", { x: 0.45, y: 0.2, w: 5, h: 0.26, fontFace: F, fontSize: 10, bold: true, color: C.CYAN, charSpacing: 2, margin: 0 });
  s.addText(R.nombre, { x: 0.45, y: 0.44, w: 5.5, h: 0.48, fontFace: F, fontSize: 26, bold: true, color: C.WHITE, margin: 0 });
  s.addText(R.quien, { x: 0.45, y: 0.9, w: 6.5, h: 0.22, fontFace: F, fontSize: 10, color: "94A3B8", margin: 0 });
  s.addText("MotoGestión", { x: 6.2, y: 0.5, w: 1.85, h: 0.3, fontFace: F, fontSize: 12, bold: true, color: C.YELLOW, align: "right", margin: 0 });

  // Momentos del día (columna única, compacta)
  s.addText("TU DÍA, PASO A PASO", { x: 0.45, y: 1.42, w: 7.6, h: 0.26, fontFace: F, fontSize: 10, bold: true, color: C.CYAN_D, charSpacing: 1.5, margin: 0 });
  let y = 1.74;
  sec.bloques.slice(0, 7).forEach((b, i) => {
    const alto = 1.02;
    s.addShape(p.ShapeType.roundRect, { x: 0.45, y, w: 7.6, h: alto, fill: { color: i % 2 ? C.SOFT : C.WHITE }, line: { color: C.LINE, width: 0.75 }, rectRadius: 0.06 });
    s.addShape(p.ShapeType.ellipse, { x: 0.6, y: y + 0.12, w: 0.32, h: 0.32, fill: { color: C.NAVY }, line: { type: "none" } });
    s.addText(String(i + 1), { x: 0.6, y: y + 0.12, w: 0.32, h: 0.32, fontFace: F, fontSize: 11, bold: true, color: C.YELLOW, align: "center", valign: "middle", margin: 0 });
    s.addText(recorta(b.momento.replace(/^"|"$/g, ""), 72), { x: 1.02, y: y + 0.08, w: 6.9, h: 0.28, fontFace: F, fontSize: 11.5, bold: true, color: C.INK, margin: 0 });
    const dos = (b.pasos || []).slice(0, 2).map((t, k) => `${k + 1}. ${esencia(t)}`).join("\n");
    s.addText(dos, { x: 1.02, y: y + 0.36, w: 6.9, h: 0.6, fontFace: F, fontSize: 9, color: C.MUTED, margin: 0, lineSpacingMultiple: 1.0 });
    y += alto + 0.08;
  });

  // Reglas de oro del rol
  const ry = y + 0.05;
  s.addShape(p.ShapeType.roundRect, { x: 0.45, y: ry, w: 7.6, h: 1.05, fill: { color: C.WARNS }, line: { color: "F59E0B", width: 1 }, rectRadius: 0.06 });
  s.addText("⚠ NUNCA OLVIDES", { x: 0.65, y: ry + 0.08, w: 7.2, h: 0.24, fontFace: F, fontSize: 9.5, bold: true, color: C.WARN, charSpacing: 1.2, margin: 0 });
  s.addText((REGLAS[R.rol] || []).map(t => "· " + t).join("\n"), {
    x: 0.65, y: ry + 0.32, w: 7.2, h: 0.66, fontFace: F, fontSize: 9.5, color: C.WARN, margin: 0, lineSpacingMultiple: 1.05,
  });

  s.addText("Si algo sale mal: no lo arregles por fuera del sistema — avísale al administrador el mismo día.",
    { x: 0.45, y: 10.5, w: 7.6, h: 0.3, fontFace: F, fontSize: 9, italic: true, color: C.MUTED, align: "center", margin: 0 });
}

// ── Hoja extra: los casos más frecuentes (para el mostrador) ──
{
  const casos = CONT.find(x => x.rol === "casos");
  const s = p.addSlide();
  s.background = { color: C.WHITE };
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 8.5, h: 1.15, fill: { color: C.NAVY }, line: { type: "none" } });
  s.addShape(p.ShapeType.rect, { x: 0, y: 1.15, w: 8.5, h: 0.08, fill: { color: C.YELLOW }, line: { type: "none" } });
  s.addText("CONSULTA RÁPIDA", { x: 0.45, y: 0.2, w: 5, h: 0.26, fontFace: F, fontSize: 10, bold: true, color: C.CYAN, charSpacing: 2, margin: 0 });
  s.addText("¿QUÉ HAGO SI…?", { x: 0.45, y: 0.44, w: 6, h: 0.48, fontFace: F, fontSize: 26, bold: true, color: C.WHITE, margin: 0 });
  s.addText("Los casos que más se presentan", { x: 0.45, y: 0.9, w: 6.5, h: 0.22, fontFace: F, fontSize: 10, color: "94A3B8", margin: 0 });

  let y = 1.5;
  casos.bloques.slice(0, 12).forEach((b, i) => {
    const alto = 0.72;
    s.addShape(p.ShapeType.roundRect, { x: 0.45, y, w: 7.6, h: alto, fill: { color: i % 2 ? C.SOFT : C.WHITE }, line: { color: C.LINE, width: 0.75 }, rectRadius: 0.05 });
    s.addText(recorta(b.momento.replace(/^"|"$/g, ""), 62), { x: 0.62, y: y + 0.06, w: 7.3, h: 0.26, fontFace: F, fontSize: 10.5, bold: true, color: C.INK, margin: 0 });
    s.addText("→ " + esencia((b.pasos || [])[0]), { x: 0.62, y: y + 0.32, w: 7.3, h: 0.34, fontFace: F, fontSize: 9, color: C.CYAN_D, margin: 0, lineSpacingMultiple: 1.0 });
    y += alto + 0.05;
  });
  s.addText("El detalle completo de cada caso está en la presentación de capacitación.",
    { x: 0.45, y: 10.5, w: 7.6, h: 0.3, fontFace: F, fontSize: 9, italic: true, color: C.MUTED, align: "center", margin: 0 });
}

p.writeFile({ fileName: OUT }).then(f => console.log("Guías generadas:", f));
