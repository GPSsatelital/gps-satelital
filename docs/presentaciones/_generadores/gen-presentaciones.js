const pptxgen = require("pptxgenjs");
const OUT = "C:/Users/USER/Documents/GitHub/gps-satelital/docs/presentaciones/";

// Paleta identidad MotoGestión
const NAVY = "0F172A", NAVY2 = "1E293B", CYAN = "0284C7", CYAN_HI = "38BDF8",
      YEL = "FFD100", WHITE = "FFFFFF", INK = "0F172A", GREY = "64748B",
      SOFT = "F1F5F9", GREEN = "16A34A", AMBER = "D97706", RED = "DC2626";
const HFONT = "Cambria", BFONT = "Calibri";

function circleNum(s, n, x, y, fill) {
  s.addShape("ellipse", { x, y, w: 0.55, h: 0.55, fill: { color: fill || CYAN }, line: { type: "none" } });
  s.addText(String(n), { x, y, w: 0.55, h: 0.55, align: "center", valign: "middle", fontFace: HFONT, fontSize: 22, bold: true, color: WHITE, margin: 0 });
}
function card(s, x, y, w, h, fill) {
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.1, fill: { color: fill || WHITE }, line: { color: "E2E8F0", width: 1 }, shadow: { type: "outer", color: "94A3B8", opacity: 0.35, blur: 6, offset: 3, angle: 90 } });
}

function titleSlide(pres, kicker, title, sub) {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape("rect", { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: NAVY } });
  s.addText(kicker, { x: 0.9, y: 2.0, w: 11.5, h: 0.5, fontFace: BFONT, fontSize: 18, bold: true, color: CYAN_HI, charSpacing: 2 });
  s.addText(title, { x: 0.9, y: 2.5, w: 11.5, h: 1.8, fontFace: HFONT, fontSize: 46, bold: true, color: WHITE, lineSpacingMultiple: 1.0 });
  s.addText(sub, { x: 0.9, y: 4.5, w: 11.5, h: 0.8, fontFace: BFONT, fontSize: 20, color: "CBD5E1", italic: true });
  // firma placa amarilla
  s.addShape("roundRect", { x: 0.9, y: 5.7, w: 1.9, h: 0.7, rectRadius: 0.08, fill: { color: YEL }, line: { color: "111111", width: 2 } });
  s.addText("MotoGestión", { x: 0.9, y: 5.7, w: 1.9, h: 0.7, align: "center", valign: "middle", fontFace: BFONT, fontSize: 15, bold: true, color: "111111", margin: 0 });
  s.addText("Club de Moteros — GPS Satelital Cartagena", { x: 3.0, y: 5.85, w: 8, h: 0.4, fontFace: BFONT, fontSize: 14, color: "94A3B8", valign: "middle" });
  return s;
}
function sectionTitle(s, t) {
  s.background = { color: WHITE };
  s.addText(t, { x: 0.9, y: 0.55, w: 11.5, h: 0.9, fontFace: HFONT, fontSize: 34, bold: true, color: NAVY });
}

function buildSocializacion() {
  const p = new pptxgen();
  p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
  p.author = "Club de Moteros";

  titleSlide(p, "CONOCE TU NUEVO SISTEMA", "Tu trabajo, ahora más\nfácil y más seguro", "Una sola herramienta para clientes, motos, contratos y cobros.");

  // 2 — Qué es
  let s = p.addSlide(); sectionTitle(s, "¿Qué es MotoGestión?");
  s.addText("Es la app que reemplaza el papel y las cuentas a mano. Todo el negocio en un solo lugar, desde el celular o el computador.", { x: 0.9, y: 1.5, w: 11.5, h: 0.8, fontFace: BFONT, fontSize: 18, color: NAVY2 });
  const items = [["Clientes", "Registro, documentos y visitas"], ["Motos", "Estado, grupo y ubicación"], ["Contratos", "Del ingreso a la entrega"], ["Cobros", "Pagos, mora, caja y recibos"]];
  items.forEach((it, i) => {
    const x = 0.9 + (i % 2) * 6.05, y = 2.6 + Math.floor(i / 2) * 1.9;
    card(s, x, y, 5.7, 1.6);
    circleNum(s, i + 1, x + 0.3, y + 0.5, CYAN);
    s.addText(it[0], { x: x + 1.1, y: y + 0.28, w: 4.3, h: 0.5, fontFace: HFONT, fontSize: 20, bold: true, color: NAVY, margin: 0 });
    s.addText(it[1], { x: x + 1.1, y: y + 0.8, w: 4.3, h: 0.6, fontFace: BFONT, fontSize: 15, color: GREY, margin: 0 });
  });

  // 3 — Qué cambia por rol
  s = p.addSlide(); sectionTitle(s, "Qué cambia para ti");
  const roles = [["Secretaria", "Registras pagos y confirmas; el sistema reparte y calcula solo.", CYAN],
    ["Cobrador", "Ves solo tus motos; cobras en la calle con GPS y foto.", GREEN],
    ["Administrador", "Ves toda la operación; creas contratos y liquidas.", AMBER],
    ["Mecánico", "Solo tu módulo de taller: ingresas, reparas, das salida.", "7C3AED"]];
  roles.forEach((r, i) => {
    const y = 1.6 + i * 1.35;
    card(s, 0.9, y, 11.5, 1.15);
    s.addShape("ellipse", { x: 1.15, y: y + 0.32, w: 0.5, h: 0.5, fill: { color: r[2] }, line: { type: "none" } });
    s.addText(r[0], { x: 1.9, y: y + 0.18, w: 3.2, h: 0.8, fontFace: HFONT, fontSize: 19, bold: true, color: NAVY, valign: "middle", margin: 0 });
    s.addText(r[1], { x: 5.2, y: y + 0.18, w: 7.0, h: 0.8, fontFace: BFONT, fontSize: 15, color: NAVY2, valign: "middle", margin: 0 });
  });

  // 4 — Lo que hace por ti
  s = p.addSlide(); sectionTitle(s, "El sistema trabaja para ti");
  const bens = ["Reparte cada pago solo: cuota, deuda, convenio y ahorro. No calculas nada.",
    "Sabe quién está en mora y te ordena las tareas del día.",
    "Imprime el recibo o lo envía por WhatsApp.",
    "Guarda todo con tu nombre y la hora: tu trabajo queda respaldado."];
  bens.forEach((b, i) => {
    const y = 1.7 + i * 1.2;
    circleNum(s, i + 1, 0.95, y, CYAN);
    s.addText(b, { x: 1.75, y: y - 0.05, w: 10.6, h: 0.75, fontFace: BFONT, fontSize: 18, color: NAVY2, valign: "middle", margin: 0 });
  });

  // 5 — Reglas de oro (dark)
  s = p.addSlide(); s.background = { color: NAVY };
  s.addText("3 reglas de oro", { x: 0.9, y: 0.6, w: 11.5, h: 0.9, fontFace: HFONT, fontSize: 34, bold: true, color: WHITE });
  const gold = [["Registra en el momento", "No lo dejes para después."],
    ["Revisa antes de confirmar", "Monto y cliente correctos antes de confirmar un pago."],
    ["Ante la duda, pregunta", "Nunca adivines con el dinero."]];
  gold.forEach((g, i) => {
    const y = 1.9 + i * 1.5;
    s.addShape("roundRect", { x: 0.9, y, w: 11.5, h: 1.25, rectRadius: 0.1, fill: { color: NAVY2 }, line: { color: "334155", width: 1 } });
    s.addText(String(i + 1), { x: 1.15, y: y + 0.2, w: 0.9, h: 0.85, align: "center", valign: "middle", fontFace: HFONT, fontSize: 40, bold: true, color: YEL, margin: 0 });
    s.addText(g[0], { x: 2.3, y: y + 0.2, w: 9.8, h: 0.5, fontFace: HFONT, fontSize: 20, bold: true, color: WHITE, margin: 0 });
    s.addText(g[1], { x: 2.3, y: y + 0.68, w: 9.8, h: 0.5, fontFace: BFONT, fontSize: 15, color: "CBD5E1", margin: 0 });
  });

  // 6 — Cómo entrar + manual
  s = p.addSlide(); sectionTitle(s, "Cómo empezar");
  const start = ["Abre el programa en el navegador (Chrome) y entra con tu correo y contraseña.",
    "Si algo se ve raro tras un cambio, presiona Ctrl + Shift + R.",
    "Cada uno tiene su manual paso a paso: pídelo y tenlo a mano el primer día.",
    "Si no puedes entrar o no ves un módulo, avisa al Administrador (no es tu culpa: son los accesos)."];
  start.forEach((b, i) => {
    const y = 1.7 + i * 1.15;
    circleNum(s, i + 1, 0.95, y, CYAN);
    s.addText(b, { x: 1.75, y: y - 0.05, w: 10.6, h: 0.7, fontFace: BFONT, fontSize: 17, color: NAVY2, valign: "middle", margin: 0 });
  });

  // 7 — cierre
  s = p.addSlide(); s.background = { color: NAVY };
  s.addText("Empezamos el lunes 27", { x: 0.9, y: 2.6, w: 11.5, h: 1, fontFace: HFONT, fontSize: 44, bold: true, color: WHITE });
  s.addText("Estamos para ayudarte. Ningún problema frena el trabajo:\nsi algo falla, lo resolvemos juntos y seguimos.", { x: 0.9, y: 3.9, w: 11.5, h: 1.2, fontFace: BFONT, fontSize: 22, color: CYAN_HI });

  return p.writeFile({ fileName: OUT + "01-Socializacion-empleados.pptx" });
}

function buildPlan() {
  const p = new pptxgen();
  p.layout = "LAYOUT_WIDE";
  p.author = "Club de Moteros";

  titleSlide(p, "PLAN DE TRABAJO", "Entrega y puesta en marcha", "Go-live: lunes 27 de julio. Todos los grupos operando en el sistema.");

  // objetivo
  let s = p.addSlide(); sectionTitle(s, "El objetivo");
  s.addText("Que desde el lunes 27 toda la operación se lleve en el sistema, sin que ningún proceso a medias frene el negocio.", { x: 0.9, y: 1.6, w: 11.5, h: 1, fontFace: BFONT, fontSize: 20, color: NAVY2 });
  const stats = [["4", "grupos operando", CYAN], ["16", "procesos definidos", GREEN], ["0", "pausas al negocio", AMBER]];
  stats.forEach((st, i) => {
    const x = 0.9 + i * 3.95;
    card(s, x, 3.0, 3.6, 2.2);
    s.addText(st[0], { x, y: 3.3, w: 3.6, h: 1.1, align: "center", fontFace: HFONT, fontSize: 66, bold: true, color: st[2], margin: 0 });
    s.addText(st[1], { x, y: 4.5, w: 3.6, h: 0.5, align: "center", fontFace: BFONT, fontSize: 16, color: GREY, margin: 0 });
  });

  // cronograma
  s = p.addSlide(); sectionTitle(s, "El cronograma");
  const days = [["Mié-Jue", "Confirmar sistema + cerrar pendientes"], ["Viernes", "Probar el dinero con usuarios reales"],
    ["Sábado", "Atención parada · verificar datos"], ["Domingo", "Ensayo general con el equipo"], ["Lunes 27", "Arranque en vivo + soporte"]];
  days.forEach((d, i) => {
    const y = 1.6 + i * 1.05;
    const last = i === days.length - 1;
    s.addShape("roundRect", { x: 0.9, y, w: 2.6, h: 0.85, rectRadius: 0.08, fill: { color: last ? YEL : NAVY }, line: { type: "none" } });
    s.addText(d[0], { x: 0.9, y, w: 2.6, h: 0.85, align: "center", valign: "middle", fontFace: HFONT, fontSize: 18, bold: true, color: last ? "111111" : WHITE, margin: 0 });
    s.addText(d[1], { x: 3.8, y, w: 8.6, h: 0.85, valign: "middle", fontFace: BFONT, fontSize: 17, color: NAVY2, margin: 0 });
  });

  // qué necesitamos de cada uno
  s = p.addSlide(); sectionTitle(s, "Qué necesitamos de cada uno");
  const need = [["Todos", "Leer tu manual y venir al ensayo del domingo."],
    ["Secretaria", "Probar registrar y confirmar pagos; cerrar caja."],
    ["Cobradores", "Probar cobro en campo y gestión de mora con tus motos."],
    ["Administrador", "Probar crear contrato, aprobar, liquidar; confirmar permisos."],
    ["Mecánico", "Probar ingresar y finalizar una orden de taller."]];
  need.forEach((n, i) => {
    const y = 1.55 + i * 1.05;
    card(s, 0.9, y, 11.5, 0.9);
    s.addText(n[0], { x: 1.15, y: y + 0.1, w: 3.0, h: 0.7, fontFace: HFONT, fontSize: 17, bold: true, color: CYAN, valign: "middle", margin: 0 });
    s.addText(n[1], { x: 4.3, y: y + 0.1, w: 7.9, h: 0.7, fontFace: BFONT, fontSize: 15, color: NAVY2, valign: "middle", margin: 0 });
  });

  // si algo falla (dark)
  s = p.addSlide(); s.background = { color: NAVY };
  s.addText("Si algo falla el lunes", { x: 0.9, y: 0.6, w: 11.5, h: 0.9, fontFace: HFONT, fontSize: 34, bold: true, color: WHITE });
  s.addText("La regla de oro de la operación:", { x: 0.9, y: 1.6, w: 11.5, h: 0.5, fontFace: BFONT, fontSize: 18, color: CYAN_HI });
  s.addShape("roundRect", { x: 0.9, y: 2.3, w: 11.5, h: 1.4, rectRadius: 0.1, fill: { color: NAVY2 }, line: { color: YEL, width: 2 } });
  s.addText("La operación NO se detiene por un caso puntual.", { x: 1.2, y: 2.55, w: 11, h: 0.55, fontFace: HFONT, fontSize: 22, bold: true, color: YEL, margin: 0 });
  s.addText("Resolvemos ESE caso a mano, lo anotamos, y seguimos atendiendo. Lo que falló se corrige después.", { x: 1.2, y: 3.15, w: 11, h: 0.5, fontFace: BFONT, fontSize: 16, color: "E2E8F0", margin: 0 });
  const back = ["Cifra mal → se corrige en el sistema (queda registro).", "Sin internet → papel mientras vuelve, se registra al reconectar.", "No entra alguien → el Administrador ajusta el acceso."];
  back.forEach((b, i) => {
    const y = 4.25 + i * 0.85;
    s.addText("•", { x: 1.0, y, w: 0.4, h: 0.6, fontFace: BFONT, fontSize: 22, bold: true, color: CYAN_HI, valign: "middle", margin: 0 });
    s.addText(b, { x: 1.5, y, w: 10.8, h: 0.6, fontFace: BFONT, fontSize: 17, color: "E2E8F0", valign: "middle", margin: 0 });
  });

  // cierre
  s = p.addSlide(); s.background = { color: NAVY };
  s.addText("Listos para arrancar", { x: 0.9, y: 2.6, w: 11.5, h: 1, fontFace: HFONT, fontSize: 44, bold: true, color: WHITE });
  s.addText("Con el equipo preparado y el sistema probado,\nel lunes 27 empezamos con los menores contratiempos posibles.", { x: 0.9, y: 3.9, w: 11.5, h: 1.2, fontFace: BFONT, fontSize: 22, color: CYAN_HI });

  return p.writeFile({ fileName: OUT + "02-Plan-de-trabajo.pptx" });
}

buildSocializacion().then(f => console.log("OK ->", f)).then(buildPlan).then(f => console.log("OK ->", f)).then(() => console.log("Listas las 2 presentaciones."));
