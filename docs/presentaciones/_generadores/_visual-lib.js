// Componentes visuales para el deck de capacitación: ilustraciones de pantalla,
// bloques de ejemplo y fichas de caso. Se dibujan con formas nativas de PowerPoint
// (no imágenes) para que se vean nítidas y no expongan datos reales de clientes.

const NAVY = "0F172A", NAVY2 = "1E293B", CYAN = "38BDF8", CYAN_D = "0284C7",
      YELLOW = "FFD100", WHITE = "FFFFFF", INK = "0F172A", MUTED = "64748B",
      LIGHT = "F1F5F9", SOFT = "F8FAFC", LINE = "E2E8F0", OK = "16A34A",
      OKS = "DCFCE7", BAD = "B91C1C", BADS = "FEE2E2", WARNS = "FEF3C7",
      WARN = "92400E", ACC_S = "E0F2FE";
const F = "Calibri";

/**
 * Dibuja un celular esquemático con la pantalla de la app.
 * opts: { titulo, filas:[{txt, sub, badge, badgeColor}], tabs:[..], resaltar:{fila, texto} }
 */
function pantallaMovil(p, s, x, y, h, opts = {}) {
  const w = 2.5;
  // marco del celular
  s.addShape(p.ShapeType.roundRect, {
    x, y, w, h, fill: { color: WHITE }, line: { color: NAVY, width: 2 }, rectRadius: 0.14,
    shadow: { type: "outer", color: "94A3B8", blur: 8, offset: 3, angle: 90, opacity: 0.3 },
  });
  // barra superior
  s.addShape(p.ShapeType.rect, { x: x + 0.06, y: y + 0.06, w: w - 0.12, h: 0.36, fill: { color: NAVY }, line: { type: "none" } });
  s.addText(opts.titulo || "MotoGestión", {
    x: x + 0.14, y: y + 0.06, w: w - 0.28, h: 0.36, fontFace: F, fontSize: 9, bold: true,
    color: WHITE, valign: "middle", margin: 0,
  });

  // filas de contenido
  const filas = opts.filas || [];
  let fy = y + 0.52;
  const filaH = 0.44;
  filas.forEach((f, i) => {
    const destacada = opts.resaltar && opts.resaltar.fila === i;
    s.addShape(p.ShapeType.roundRect, {
      x: x + 0.11, y: fy, w: w - 0.22, h: filaH - 0.06,
      fill: { color: destacada ? ACC_S : LIGHT },
      line: destacada ? { color: CYAN_D, width: 1.5 } : { color: LINE, width: 0.75 },
      rectRadius: 0.05,
    });
    s.addText(
      [
        { text: f.txt, options: { fontSize: 8, bold: true, color: INK, breakLine: !!f.sub } },
        ...(f.sub ? [{ text: f.sub, options: { fontSize: 6.5, color: MUTED } }] : []),
      ],
      { x: x + 0.19, y: fy, w: w - 0.75, h: filaH - 0.06, fontFace: F, valign: "middle", align: "left", margin: 0, lineSpacingMultiple: 0.9 }
    );
    if (f.badge) {
      s.addShape(p.ShapeType.roundRect, {
        x: x + w - 0.78, y: fy + 0.07, w: 0.62, h: 0.2,
        fill: { color: f.badgeColor || CYAN_D }, line: { type: "none" }, rectRadius: 0.1,
      });
      s.addText(f.badge, { x: x + w - 0.78, y: fy + 0.07, w: 0.62, h: 0.2, fontFace: F, fontSize: 6.5, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    }
    fy += filaH;
  });

  // barra inferior de navegación
  const tabs = opts.tabs || ["Panel", "Clientes", "Cartera", "Motos", "Más"];
  const by = y + h - 0.42;
  s.addShape(p.ShapeType.rect, { x: x + 0.06, y: by, w: w - 0.12, h: 0.36, fill: { color: SOFT }, line: { color: LINE, width: 0.75 } });
  const tw = (w - 0.12) / tabs.length;
  tabs.forEach((t, i) => {
    const act = i === (opts.tabActivo ?? 2);
    s.addText(t, {
      x: x + 0.06 + i * tw, y: by, w: tw, h: 0.36, fontFace: F, fontSize: 6,
      bold: act, color: act ? CYAN_D : MUTED, align: "center", valign: "middle", margin: 0,
    });
  });
  return { x, y, w, h };
}

/** Globo que señala un elemento de la pantalla (el "aquí es donde tocas"). */
function señala(p, s, x, y, w, texto) {
  s.addShape(p.ShapeType.roundRect, {
    x, y, w, h: 0.42, fill: { color: YELLOW }, line: { color: NAVY, width: 1 }, rectRadius: 0.1,
  });
  s.addText(texto, {
    x: x + 0.08, y, w: w - 0.16, h: 0.42, fontFace: F, fontSize: 9.5, bold: true,
    color: NAVY, valign: "middle", align: "center", margin: 0,
  });
}

/** Caja de ejemplo concreto (con nombre, placa y cifras). */
function bloqueEjemplo(p, s, x, y, w, h, texto) {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, fill: { color: OKS }, line: { color: OK, width: 1 }, rectRadius: 0.08 });
  s.addText("EJEMPLO REAL", { x: x + 0.16, y: y + 0.08, w: w - 0.32, h: 0.24, fontFace: F, fontSize: 9, bold: true, color: OK, charSpacing: 1.5, margin: 0 });
  s.addText(texto, { x: x + 0.16, y: y + 0.32, w: w - 0.32, h: h - 0.42, fontFace: F, fontSize: 11.5, color: INK, valign: "top", margin: 0, lineSpacingMultiple: 1.05 });
}

/** Caja de advertencia ("ojo con esto"). */
function bloqueOjo(p, s, x, y, w, h, texto) {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, fill: { color: WARNS }, line: { color: "F59E0B", width: 1 }, rectRadius: 0.08 });
  s.addText("⚠ OJO", { x: x + 0.16, y: y + 0.08, w: w - 0.32, h: 0.24, fontFace: F, fontSize: 9, bold: true, color: WARN, charSpacing: 1.5, margin: 0 });
  s.addText(texto, { x: x + 0.16, y: y + 0.32, w: w - 0.32, h: h - 0.42, fontFace: F, fontSize: 11, color: WARN, valign: "top", margin: 0, lineSpacingMultiple: 1.05 });
}

/** Ficha de caso para el catálogo "¿Qué hago si…?" */
function fichaCaso(p, s, x, y, w, h, caso) {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, fill: { color: WHITE }, line: { color: LINE, width: 1 }, rectRadius: 0.1,
    shadow: { type: "outer", color: "94A3B8", blur: 5, offset: 2, angle: 90, opacity: 0.22 } });
  // franja de pregunta
  s.addShape(p.ShapeType.roundRect, { x, y, w, h: 0.52, fill: { color: NAVY }, line: { type: "none" }, rectRadius: 0.1 });
  s.addShape(p.ShapeType.rect, { x, y: y + 0.32, w, h: 0.2, fill: { color: NAVY }, line: { type: "none" } });
  s.addText(caso.pregunta, { x: x + 0.16, y, w: w - 0.32, h: 0.52, fontFace: F, fontSize: 11.5, bold: true, color: WHITE, valign: "middle", margin: 0 });
  // pasos — la altura de cada uno depende de su largo, para que un texto de dos
  // líneas no se solape con el siguiente.
  const items = (caso.pasos || []).map((t, i) => ({ n: i + 1, t: String(t) }));
  const anchoTxt = w - 0.68;
  const porLinea = Math.max(Math.floor(anchoTxt * 21), 20); // ~21 caracteres por pulgada a 10pt
  let py = y + 0.62;
  items.forEach(it => {
    const lineas = Math.max(1, Math.ceil(it.t.length / porLinea));
    const alto = 0.2 + lineas * 0.16;
    s.addShape(p.ShapeType.ellipse, { x: x + 0.18, y: py + 0.04, w: 0.24, h: 0.24, fill: { color: CYAN_D }, line: { type: "none" } });
    s.addText(String(it.n), { x: x + 0.18, y: py + 0.04, w: 0.24, h: 0.24, fontFace: F, fontSize: 8, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(it.t, { x: x + 0.5, y: py, w: anchoTxt, h: alto, fontFace: F, fontSize: 10, color: INK, valign: "top", margin: 0, lineSpacingMultiple: 0.94 });
    py += alto + 0.04;
  });
  if (caso.ojo) {
    s.addText("⚠ " + caso.ojo, { x: x + 0.18, y: y + h - 0.42, w: w - 0.36, h: 0.34, fontFace: F, fontSize: 9.5, italic: true, color: WARN, valign: "middle", margin: 0 });
  }
}

module.exports = { pantallaMovil, señala, bloqueEjemplo, bloqueOjo, fichaCaso,
  C: { NAVY, NAVY2, CYAN, CYAN_D, YELLOW, WHITE, INK, MUTED, LIGHT, SOFT, LINE, OK, OKS, BAD, BADS, WARNS, WARN, ACC_S, F } };
