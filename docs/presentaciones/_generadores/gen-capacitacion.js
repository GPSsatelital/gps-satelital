// Deck de capacitación operativa de MotoGestión. Construido con pptxgenjs.
// Paleta de marca: navy + cyan + placa amarilla. Fuente Calibri (segura).
const pptxgen = require("pptxgenjs");
const OUT = process.argv[2] || "03-Capacitacion-operativa.pptx";

const NAVY = "0F172A", NAVY2 = "1E293B", CYAN = "38BDF8", CYAN_D = "0284C7",
      YELLOW = "FFD100", WHITE = "FFFFFF", INK = "0F172A", MUTED = "64748B",
      LIGHT = "F1F5F9", SOFT = "F8FAFC", LINE = "E2E8F0", OK = "16A34A",
      OKS = "DCFCE7", BAD = "B91C1C", BADS = "FEE2E2", WARNS = "FEF3C7", WARN = "92400E";
const F = "Calibri";

const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.333 x 7.5

// ---------- helpers ----------
function footer(s, n) {
  s.addText("MotoGestión · Capacitación operativa", { x: 0.5, y: 7.04, w: 7, h: 0.3, fontFace: F, fontSize: 9, color: MUTED, align: "left", margin: 0 });
  s.addText(String(n), { x: 12.4, y: 7.04, w: 0.45, h: 0.3, fontFace: F, fontSize: 9, color: MUTED, align: "right", margin: 0 });
}
function placa(s, x, y, w, h, text, fs) {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, fill: { color: YELLOW }, line: { color: NAVY, width: 1.75 }, rectRadius: 0.09 });
  s.addText(text, { x, y, w, h, align: "center", valign: "middle", fontFace: F, fontSize: fs, bold: true, color: NAVY, margin: 0, charSpacing: 1 });
}
function pill(s, x, y, w, text, bg, fg) {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h: 0.34, fill: { color: bg }, line: { type: "none" }, rectRadius: 0.17 });
  s.addText(text, { x, y, w, h: 0.34, align: "center", valign: "middle", fontFace: F, fontSize: 11, bold: true, color: fg, margin: 0 });
}
function heading(s, title, kicker) {
  if (kicker) s.addText(kicker.toUpperCase(), { x: 0.6, y: 0.42, w: 12, h: 0.3, fontFace: F, fontSize: 12, bold: true, color: CYAN_D, charSpacing: 2, margin: 0 });
  s.addText(title, { x: 0.6, y: kicker ? 0.72 : 0.5, w: 12.1, h: 0.8, fontFace: F, fontSize: 30, bold: true, color: INK, margin: 0 });
}
// numbered step rows inside a given area
function steps(s, items, x, y, w, rowH) {
  items.forEach((it, i) => {
    const ry = y + i * rowH;
    s.addShape(p.ShapeType.ellipse, { x, y: ry + 0.06, w: 0.5, h: 0.5, fill: { color: NAVY } });
    s.addText(String(i + 1), { x, y: ry + 0.06, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: F, fontSize: 18, bold: true, color: YELLOW, margin: 0 });
    s.addText(
      [
        { text: it.t + (it.d ? "\n" : ""), options: { fontSize: 15, bold: true, color: INK, breakLine: !!it.d } },
        ...(it.d ? [{ text: it.d, options: { fontSize: 12.5, color: MUTED } }] : []),
      ],
      { x: x + 0.72, y: ry, w: w - 0.9, h: rowH, valign: "middle", fontFace: F, align: "left", margin: 0, lineSpacingMultiple: 1.02 }
    );
  });
}
// card with title + lines
function card(s, x, y, w, h, opts) {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, fill: { color: opts.bg || SOFT }, line: { color: opts.line || LINE, width: 1 }, rectRadius: 0.08,
    shadow: { type: "outer", color: "94A3B8", blur: 6, offset: 2, angle: 90, opacity: 0.28 } });
}

// ============================================================ SLIDE 1 — PORTADA
(() => {
  const s = p.addSlide(); s.background = { color: NAVY };
  s.addShape(p.ShapeType.ellipse, { x: 10.2, y: -1.8, w: 5.2, h: 5.2, fill: { color: NAVY2 } });
  s.addShape(p.ShapeType.ellipse, { x: -1.6, y: 5.2, w: 4.2, h: 4.2, fill: { color: NAVY2 } });
  placa(s, 0.9, 1.5, 2.5, 1.0, "MOTOGESTIÓN", 20);
  s.addText("Capacitación: cómo operar el sistema", { x: 0.9, y: 2.9, w: 11.5, h: 1.2, fontFace: F, fontSize: 40, bold: true, color: WHITE, margin: 0 });
  s.addText("Guía práctica para el equipo — registrar, cobrar y controlar la flota, paso a paso.", { x: 0.92, y: 4.15, w: 10.5, h: 0.6, fontFace: F, fontSize: 16, color: "CBD5E1", margin: 0 });
  s.addText([
    { text: "GPS Satelital Cartagena", options: { fontSize: 13, color: CYAN, bold: true, breakLine: true } },
    { text: "Club de moteros · COSTA · PRADERA · RASTREADOR · USADAS", options: { fontSize: 11, color: "94A3B8" } },
  ], { x: 0.92, y: 5.9, w: 11, h: 0.7, fontFace: F, margin: 0, lineSpacingMultiple: 1.1 });
})();

// ============================================================ SLIDE 2 — POR QUÉ
(() => {
  const s = p.addSlide(); s.background = { color: WHITE };
  heading(s, "El sistema trabaja para ti", "Por qué usamos MotoGestión");
  const rows = [
    ["Ordena el día", "Te dice a quién cobrar, quién está en mora y qué falta — sin cuadernos ni memoria."],
    ["Cuida el dinero", "Reparte cada pago solo (cuota, deuda, convenio, ahorro) y todo queda con tu nombre."],
    ["Deja evidencia", "Fotos, firma, huella y GPS de cada visita y entrega — respaldo legal de todo."],
    ["Menos errores", "Avisa duplicados, calcula las cuentas y no deja saltarse pasos importantes."],
  ];
  const x = 0.6, w = 12.1, y0 = 1.95, rh = 1.14;
  rows.forEach((r, i) => {
    const y = y0 + i * rh;
    s.addShape(p.ShapeType.ellipse, { x, y: y + 0.05, w: 0.62, h: 0.62, fill: { color: i % 2 ? CYAN_D : NAVY } });
    s.addText(["1", "2", "3", "4"][i], { x, y: y + 0.05, w: 0.62, h: 0.62, align: "center", valign: "middle", fontFace: F, fontSize: 22, bold: true, color: YELLOW, margin: 0 });
    s.addText([
      { text: r[0] + "\n", options: { fontSize: 17, bold: true, color: INK, breakLine: true } },
      { text: r[1], options: { fontSize: 13, color: MUTED } },
    ], { x: x + 0.85, y, w: w - 1.1, h: rh - 0.1, valign: "middle", fontFace: F, margin: 0, lineSpacingMultiple: 1.03 });
  });
  footer(s, 2);
})();

// ============================================================ SLIDE 3 — LO BÁSICO
(() => {
  const s = p.addSlide(); s.background = { color: WHITE };
  heading(s, "Lo básico para arrancar", "Antes de operar");
  const cards = [
    ["1 · Entrar", ["Abre la app y escribe tu correo y contraseña.", "Cada quien entra con SU usuario — no compartas la sesión.", "Si no ves un módulo, pídele acceso al administrador."]],
    ["2 · Moverte", ["En el celular: barra de abajo (Panel, Clientes, Cartera, Motos, Contratos, Más).", "En el computador: menú lateral izquierdo.", "La campana 🔔 muestra tus alertas y tareas."]],
    ["3 · Actualizar", ["Si sale “Hay una versión nueva”, toca Actualizar.", "Si algo se ve raro tras un cambio: Ctrl + Shift + R.", "Trabaja siempre con internet (el sistema guarda en la nube)."]],
  ];
  const cw = 3.95, gap = 0.23, x0 = 0.6, y = 1.95, h = 4.55;
  cards.forEach((c, i) => {
    const x = x0 + i * (cw + gap);
    card(s, x, y, cw, h, { bg: SOFT });
    s.addShape(p.ShapeType.roundRect, { x: x + 0.28, y: y + 0.3, w: cw - 0.56, h: 0.62, fill: { color: NAVY }, rectRadius: 0.08 });
    s.addText(c[0], { x: x + 0.28, y: y + 0.3, w: cw - 0.56, h: 0.62, align: "center", valign: "middle", fontFace: F, fontSize: 16, bold: true, color: WHITE, margin: 0 });
    s.addText(c[1].map((t, j) => ({ text: t, options: { fontSize: 12.5, color: INK, bullet: { code: "2022", indent: 14 }, breakLine: true, paraSpaceAfter: 8 } })),
      { x: x + 0.32, y: y + 1.12, w: cw - 0.6, h: h - 1.35, valign: "top", fontFace: F, margin: 0 });
  });
  footer(s, 3);
})();

// ============================================================ SLIDE 4 — ROLES
(() => {
  const s = p.addSlide(); s.background = { color: WHITE };
  heading(s, "Quién hace qué", "Los roles del equipo");
  const roles = [
    ["SECRETARIA", "Registra clientes y pagos en efectivo, confirma transferencias y cobros de campo, cierra la caja.", CYAN_D],
    ["ADMIN", "Encargado de toda la operación: crea contratos, aprueba, gestiona cartera y liquidaciones. No registra efectivo.", NAVY],
    ["ADMIN JR (SUBADMIN)", "Cobrador de calle. Ve SOLO sus motos: hace visitas, cobra en campo, persigue mora y recolecta.", CYAN_D],
    ["MECÁNICO", "Solo el módulo de Taller: recibe motos, registra diagnóstico, repuestos y cierra la orden.", NAVY],
    ["SOCIO", "Dueño de un grupo. Solo mira el tablero de SU portafolio (lectura) — no opera.", CYAN_D],
  ];
  const x = 0.6, w = 12.1, y0 = 1.9, rh = 0.95;
  roles.forEach((r, i) => {
    const y = y0 + i * rh;
    s.addShape(p.ShapeType.roundRect, { x, y: y + 0.08, w: 3.05, h: 0.6, fill: { color: r[2] }, rectRadius: 0.09 });
    s.addText(r[0], { x, y: y + 0.08, w: 3.05, h: 0.6, align: "center", valign: "middle", fontFace: F, fontSize: 12.5, bold: true, color: WHITE, margin: 0 });
    s.addText(r[1], { x: x + 3.35, y, w: w - 3.35, h: rh - 0.06, valign: "middle", fontFace: F, fontSize: 13, color: INK, margin: 0 });
    if (i < roles.length - 1) s.addShape(p.ShapeType.line, { x, y: y + rh - 0.04, w, h: 0, line: { color: LINE, width: 1 } });
  });
  footer(s, 4);
})();

// ============================================================ SLIDE 5 — DIVIDER 1
(() => {
  const s = p.addSlide(); s.background = { color: NAVY };
  s.addShape(p.ShapeType.ellipse, { x: 9.6, y: 3.6, w: 6, h: 6, fill: { color: NAVY2 } });
  placa(s, 0.9, 1.9, 1.7, 0.75, "PARTE 1", 13);
  s.addText("Los procesos, paso a paso", { x: 0.9, y: 2.85, w: 11, h: 1.1, fontFace: F, fontSize: 38, bold: true, color: WHITE, margin: 0 });
  s.addText("Cómo se hace cada tarea del día en la app.", { x: 0.92, y: 4.0, w: 10, h: 0.5, fontFace: F, fontSize: 16, color: "CBD5E1", margin: 0 });
})();

// ---------- generic process slide ----------
function proceso(n, kicker, title, role, roleBg, stepItems, note) {
  const s = p.addSlide(); s.background = { color: WHITE };
  heading(s, title, kicker);
  pill(s, 10.05, 0.62, 2.75, role, roleBg, WHITE);
  const areaY = note ? 1.95 : 2.05;
  const rowH = Math.min(1.0, (note ? 4.25 : 4.75) / stepItems.length);
  steps(s, stepItems, 0.65, areaY, 12.0, rowH);
  if (note) {
    s.addShape(p.ShapeType.roundRect, { x: 0.65, y: 6.35, w: 12.05, h: 0.55, fill: { color: WARNS }, rectRadius: 0.08 });
    s.addText([{ text: "Ojo:  ", options: { bold: true, color: WARN } }, { text: note, options: { color: WARN } }],
      { x: 0.9, y: 6.35, w: 11.6, h: 0.55, valign: "middle", fontFace: F, fontSize: 12, margin: 0 });
  }
  footer(s, n);
}

// SLIDE 6 — Registrar cliente
proceso(6, "Proceso · SECRETARIA / ADMIN", "Registrar un cliente nuevo", "SECRETARIA", CYAN_D, [
  { t: "Datos y ruta", d: "Nombre, cédula, teléfono/WhatsApp, dirección y si es contrato diario o de tiempo definido." },
  { t: "Ingreso inicial", d: "Registra lo que pagó al entrar — se usa después como base del contrato." },
  { t: "Autorización de datos", d: "Firma y (si el lector está) huella. La firma es obligatoria para guardar." },
  { t: "Documentos", d: "Cédula, recibo, hoja de vida, antecedentes del cliente + cédula/recibo del acompañante." },
], "El cliente queda 'Listo para visita' cuando los documentos están completos.");

// SLIDE 7 — Visita
proceso(7, "Proceso · SUBADMIN / SECRETARIA", "Visita domiciliaria", "SUBADMIN", NAVY, [
  { t: "Ir a la casa y abrir la visita", d: "El GPS se captura solo al abrir — NO se puede guardar la visita sin ubicación." },
  { t: "Llenar la entrevista", d: "Vive allí, tiempo, tipo de vivienda, estabilidad, observaciones y recomendación." },
  { t: "Tomar las fotos", d: "Cliente + funcionario y fachada — respaldo de que la visita fue real." },
  { t: "Guardado de la moto", d: "Al final: ¿va a guardar la moto en esta casa? Si no, ¿dónde? (queda para validar luego)." },
], "El administrador aprueba o repite la visita. Sin visita aprobada no hay contrato.");

// SLIDE 8 — Contrato
proceso(8, "Proceso · ADMIN", "Crear el contrato (asistente de 6 pasos)", "ADMIN", NAVY, [
  { t: "Datos y tarifa", d: "Cliente aprobado, modalidad, tarifa L-S y domingo, día de pago, base inicial." },
  { t: "Asignar la moto", d: "Elige una Disponible — confirma placa y modelo antes de asignar." },
  { t: "Firmas", d: "Contrato + pagaré: documento leído, firma y huella del cliente." },
  { t: "Certificado y entrega", d: "Foto del documento + km inicial + 6 fotos guiadas (una con la persona) + checklist." },
], "Al terminar: el contrato queda Activo, la moto Asignada y el cliente Activo.");

// SLIDE 9 — Cobrar
proceso(9, "Proceso · SECRETARIA / SUBADMIN", "Cobrar un pago", "SECRETARIA", CYAN_D, [
  { t: "En oficina (efectivo)", d: "Solo SECRETARIA. Abre el contrato → Pagar → confirma monto en la ventana." },
  { t: "En la calle (cobro de campo)", d: "ADMIN/SUBADMIN recupera efectivo con GPS + foto → la SECRETARIA lo confirma (doble control)." },
  { t: "Transferencia", d: "Se reporta con foto del comprobante → la SECRETARIA la confirma." },
  { t: "El recibo", d: "Se imprime o se manda por WhatsApp. El sistema reparte el pago solo (no lo repartas tú)." },
], "Antes de confirmar revisa cliente y monto — si sale aviso de duplicado, verifica.");

// SLIDE 10 — Mora
proceso(10, "Proceso · SUBADMIN / ADMIN", "Mora y recolección", "SUBADMIN", NAVY, [
  { t: "Día de pago y gabela", d: "Mensaje de WhatsApp por la mañana. Un día de gracia (gabela)." },
  { t: "Mora — gestionar", d: "Mensaje → Llamada → Sirena/Apagado. Puedes pasar los 3 el mismo día si no responde." },
  { t: "Plazo extra (opcional)", d: "ADMIN/SUBADMIN da 1-2 días con motivo escrito; mientras tanto no se recolecta." },
  { t: "Recolección física", d: "Se registra con 6 fotos → contrato Suspendido, moto Recuperada y multa de $20.000." },
], "Para devolver la moto: paga la multa + lo atrasado (o deja convenio). Se gestiona en Inmovilizaciones.");

// SLIDE 11 — Guardado de la moto
proceso(11, "Proceso · ADMIN", "Validar dónde se guarda la moto", "ADMIN", NAVY, [
  { t: "El cliente lo declara en la visita", d: "Si la guarda en su casa o en otro lugar (con su dirección)." },
  { t: "Tras entregar la moto", d: "Aparece la tarea 'Validar dónde se guarda la moto' — no se quita hasta hacerla." },
  { t: "Revisar en el GPS", d: "Esa noche/día, en tu plataforma de rastreo, mira dónde duerme la moto." },
  { t: "Marcar en la app", d: "Sí coincide ✅  o  No coincide ❌ → registra el lugar real con GPS y condiciones." },
], "Es antifraude: confirma que la moto queda donde el cliente dijo.");

// SLIDE 12 — Caja
proceso(12, "Proceso · SECRETARIA", "Cierre de caja diaria", "SECRETARIA", CYAN_D, [
  { t: "Revisar lo recaudado", d: "El sistema suma el efectivo del día, separado por grupo (COSTA/PRADERA/…)." },
  { t: "Confirmar lo pendiente", d: "Transferencias por confirmar y efectivo de campo entregado por los cobradores." },
  { t: "Cuadrar por funcionario", d: "Cuánto recogió cada uno, qué falta entregar y qué falta confirmar." },
  { t: "Cerrar la caja", d: "Deja el registro del día — cada grupo es un portafolio independiente." },
], null);

// ============================================================ SLIDE 13 — DIVIDER 2
(() => {
  const s = p.addSlide(); s.background = { color: NAVY };
  s.addShape(p.ShapeType.ellipse, { x: -1.8, y: -1.8, w: 5.5, h: 5.5, fill: { color: NAVY2 } });
  placa(s, 0.9, 1.9, 1.7, 0.75, "PARTE 2", 13);
  s.addText("Reglas de oro y contingencia", { x: 0.9, y: 2.85, w: 11.5, h: 1.1, fontFace: F, fontSize: 38, bold: true, color: WHITE, margin: 0 });
  s.addText("Cómo trabajar seguro y qué hacer si algo falla.", { x: 0.92, y: 4.0, w: 10, h: 0.5, fontFace: F, fontSize: 16, color: "CBD5E1", margin: 0 });
})();

// ============================================================ SLIDE 14 — REGLAS DE ORO
(() => {
  const s = p.addSlide(); s.background = { color: WHITE };
  heading(s, "5 reglas de oro", "Trabajar bien");
  const reglas = [
    ["Registra en el momento", "Cada pago, gestión y visita se registra cuando pasa — no “después”."],
    ["Revisa antes de confirmar", "Cliente, monto y método. Confirmar mueve dinero real."],
    ["El GPS y la firma son la prueba", "Sin ubicación no hay visita; sin firma no hay autorización."],
    ["Doble control del dinero", "Quien cobra en calle entrega; la secretaria confirma. Nadie hace las dos."],
    ["Ante la duda, pregunta", "Mejor una pregunta que un dato mal metido — corregir cuesta más."],
  ];
  const x = 0.6, w = 12.1, y0 = 1.95, rh = 0.92;
  reglas.forEach((r, i) => {
    const y = y0 + i * rh;
    s.addShape(p.ShapeType.roundRect, { x, y: y + 0.04, w: 0.55, h: 0.55, fill: { color: YELLOW }, rectRadius: 0.09 });
    s.addText(String(i + 1), { x, y: y + 0.04, w: 0.55, h: 0.55, align: "center", valign: "middle", fontFace: F, fontSize: 20, bold: true, color: NAVY, margin: 0 });
    s.addText([
      { text: r[0] + "\n", options: { fontSize: 16, bold: true, color: INK, breakLine: true } },
      { text: r[1], options: { fontSize: 13, color: MUTED } },
    ], { x: x + 0.8, y, w: w - 1, h: rh - 0.05, valign: "middle", fontFace: F, margin: 0, lineSpacingMultiple: 1.02 });
  });
  footer(s, 14);
})();

// ============================================================ SLIDE 15 — SI ALGO FALLA
(() => {
  const s = p.addSlide(); s.background = { color: WHITE };
  heading(s, "Si algo falla el lunes", "Plan B — la operación no se detiene");
  const cards = [
    ["Un paso falla", "Anótalo en papel y sigue cobrando. Avisas y se arregla en caliente — no frenes el día.", WARNS, WARN],
    ["Una cifra sale mal", "No la fuerces. El ADMIN la corrige desde 'Editar contrato' (queda auditado quién y cuándo).", WARNS, WARN],
    ["La app se ve rara", "Ctrl + Shift + R para recargar. Si sigue, avisa — casi siempre es una versión vieja en caché.", LIGHT, NAVY],
    ["Alguien sin acceso", "El ADMIN PRINCIPAL le ajusta los permisos por persona en Usuarios & Roles.", LIGHT, NAVY],
    ["Impresora o huella fallan", "Son opcionales: manda el recibo por WhatsApp y sigue. La firma sí es obligatoria.", LIGHT, NAVY],
    ["No sabes qué hacer", "Pregúntale a tu encargado antes de inventar. La cadena: Cobrador → Secretaria → Admin → Fredy.", OKS, OK],
  ];
  const cw = 3.95, ch = 2.15, gapx = 0.23, gapy = 0.25, x0 = 0.6, y0 = 1.9;
  cards.forEach((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = x0 + col * (cw + gapx), y = y0 + row * (ch + gapy);
    s.addShape(p.ShapeType.roundRect, { x, y, w: cw, h: ch, fill: { color: c[2] }, line: { color: LINE, width: 1 }, rectRadius: 0.08 });
    s.addText(c[0], { x: x + 0.25, y: y + 0.2, w: cw - 0.5, h: 0.45, fontFace: F, fontSize: 15, bold: true, color: c[3], margin: 0 });
    s.addText(c[1], { x: x + 0.25, y: y + 0.72, w: cw - 0.5, h: ch - 0.9, fontFace: F, fontSize: 12, color: INK, valign: "top", margin: 0, lineSpacingMultiple: 1.03 });
  });
  footer(s, 15);
})();

// ============================================================ SLIDE 16 — ENSAYO
(() => {
  const s = p.addSlide(); s.background = { color: WHITE };
  heading(s, "El ensayo del domingo", "Cada quien hace un caso real");
  // table header
  const x = 0.6, w = 12.1, cx = [0.6, 3.2, 8.9], cw = [2.6, 5.7, 3.8];
  const hy = 1.95;
  s.addShape(p.ShapeType.rect, { x, y: hy, w, h: 0.5, fill: { color: NAVY } });
  ["ROL", "QUÉ PRACTICA", "QUEDÓ BIEN SI…"].forEach((t, i) => {
    s.addText(t, { x: cx[i] + 0.15, y: hy, w: cw[i] - 0.2, h: 0.5, valign: "middle", fontFace: F, fontSize: 12, bold: true, color: YELLOW, margin: 0 });
  });
  const rows = [
    ["SECRETARIA", "Registrar un cliente y cobrarle un pago en efectivo.", "El recibo sale bien y la caja cuadra."],
    ["ADMIN JR", "Hacer una visita (con GPS) y un cobro en la calle.", "La visita queda con ubicación y el cobro llega a confirmar."],
    ["ADMIN", "Crear un contrato completo y aprobar un cliente.", "El contrato queda Activo y la moto Asignada."],
    ["MECÁNICO", "Recibir una moto y cerrar una orden de taller.", "La orden queda registrada con su costo."],
    ["SECRETARIA", "Confirmar una transferencia y cerrar la caja.", "El dinero del día queda confirmado y cuadrado."],
  ];
  let ry = hy + 0.5;
  const rh = 0.82;
  rows.forEach((r, i) => {
    if (i % 2 === 1) s.addShape(p.ShapeType.rect, { x, y: ry, w, h: rh, fill: { color: SOFT } });
    s.addText(r[0], { x: cx[0] + 0.15, y: ry, w: cw[0] - 0.2, h: rh, valign: "middle", fontFace: F, fontSize: 12, bold: true, color: CYAN_D, margin: 0 });
    s.addText(r[1], { x: cx[1] + 0.15, y: ry, w: cw[1] - 0.25, h: rh, valign: "middle", fontFace: F, fontSize: 12.5, color: INK, margin: 0 });
    s.addText(r[2], { x: cx[2] + 0.15, y: ry, w: cw[2] - 0.25, h: rh, valign: "middle", fontFace: F, fontSize: 12, color: MUTED, italic: true, margin: 0 });
    ry += rh;
  });
  s.addShape(p.ShapeType.line, { x, y: ry, w, h: 0, line: { color: LINE, width: 1 } });
  footer(s, 16);
})();

// ============================================================ SLIDE 17 — CIERRE
(() => {
  const s = p.addSlide(); s.background = { color: NAVY };
  s.addShape(p.ShapeType.ellipse, { x: 9.4, y: 3.4, w: 6.5, h: 6.5, fill: { color: NAVY2 } });
  placa(s, 0.9, 1.7, 2.5, 1.0, "MOTOGESTIÓN", 20);
  s.addText("Listos para arrancar el lunes.", { x: 0.9, y: 3.05, w: 11.5, h: 1.0, fontFace: F, fontSize: 36, bold: true, color: WHITE, margin: 0 });
  s.addText("Si registras en el momento, revisas antes de confirmar y preguntas cuando dudes,\nel sistema hace el resto.", { x: 0.92, y: 4.15, w: 11, h: 1.0, fontFace: F, fontSize: 16, color: "CBD5E1", margin: 0, lineSpacingMultiple: 1.15 });
  s.addText("Guarda tu manual a la mano — y cualquier duda, pregunta.", { x: 0.92, y: 5.9, w: 11, h: 0.5, fontFace: F, fontSize: 13, color: CYAN, bold: true, margin: 0 });
})();

p.writeFile({ fileName: OUT }).then(f => console.log("Escrito:", f)).catch(e => { console.error("ERROR:", e); process.exit(1); });
