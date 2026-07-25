// Prueba de los componentes visuales antes de armar el deck completo.
const pptxgen = require("pptxgenjs");
const V = require("./_visual-lib");
const C = V.C, F = C.F;

const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
const s = p.addSlide();
s.background = { color: C.WHITE };

s.addText("CÓMO COBRARLE A UN CLIENTE", { x: 0.6, y: 0.4, w: 12, h: 0.3, fontFace: F, fontSize: 12, bold: true, color: C.CYAN_D, charSpacing: 2, margin: 0 });
s.addText("El cobrador en la calle", { x: 0.6, y: 0.68, w: 12, h: 0.6, fontFace: F, fontSize: 28, bold: true, color: C.INK, margin: 0 });

// pantalla ilustrada
V.pantallaMovil(p, s, 0.7, 1.5, 4.2, {
  titulo: "Cartera & Cobros",
  tabActivo: 2,
  filas: [
    { txt: "YESID CONTRERAS", sub: "DQW25I · 11 días sin pagar", badge: "Mora", badgeColor: C.BAD },
    { txt: "Debe pagar", sub: "$461.500", badge: "", badgeColor: C.BAD },
    { txt: "Mensaje · Llamar · Sirena", sub: "gestiones de cobro" },
    { txt: "💵 Cobrar", sub: "registra el pago aquí" },
    { txt: "ALVARO CASTRO", sub: "XZN23H · 19 días sin pagar", badge: "Mora", badgeColor: C.BAD },
  ],
  resaltar: { fila: 3 },
});
V.señala(p, s, 0.7, 5.85, 2.5, "Aquí registras el pago");

// pasos
const pasos = ["Abre Cartera → Para hacer hoy", "Busca al cliente por nombre o placa", "Toca 💵 Cobrar", "Escribe el monto que te dio", "Toma la foto del recibo", "Confirma — se guarda con tu nombre y GPS"];
pasos.forEach((t, i) => {
  const y = 1.62 + i * 0.52;
  s.addShape(p.ShapeType.ellipse, { x: 5.4, y, w: 0.34, h: 0.34, fill: { color: C.NAVY } });
  s.addText(String(i + 1), { x: 5.4, y, w: 0.34, h: 0.34, fontFace: F, fontSize: 12, bold: true, color: C.YELLOW, align: "center", valign: "middle", margin: 0 });
  s.addText(t, { x: 5.85, y, w: 3.3, h: 0.34, fontFace: F, fontSize: 12.5, color: C.INK, valign: "middle", margin: 0 });
});

V.bloqueEjemplo(p, s, 9.3, 1.5, 3.4, 1.7, "YESID debe $461.500 y te da $200.000.\nEscribes 200.000 → el sistema los reparte solo y le queda debiendo $261.500.");
V.bloqueOjo(p, s, 9.3, 3.35, 3.4, 1.5, "No anotes en papel para registrar después: si no lo registras al momento, el cliente puede reclamar que ya pagó.");
V.fichaCaso(p, s, 9.3, 5.0, 3.4, 1.85, {
  pregunta: "¿Y si da menos de la cuota?",
  pasos: ["Regístralo igual", "El sistema lo abona", "Sigue en mora hasta completar"],
});

p.writeFile({ fileName: process.argv[2] || "_test-visual.pptx" }).then(f => console.log("OK:", f));
