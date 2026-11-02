// Genera docs/plantillas/DIAGNOSTICO-OPERACION-SUPERVISOR.docx: formato EN BLANCO para que cada supervisor
// haga el diagnóstico de la operación con sus motos (pedido del dueño, 2-nov-2026: un documento para llenar
// hoy, no un proceso). En cada punto: los casos, y qué va bien, qué está fallando y cómo lo resolvería.
// Correr:  NODE_PATH=<carpeta con node_modules/docx> node diagnostico-operacion-supervisor.js
const path = require("path");
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType,
  BorderStyle, ShadingType, VerticalAlign, HeightRule, Header, Footer, PageNumber, TableLayoutType,
} = require("docx");

const ANCHO = 9972;                       // carta (12240) − márgenes 1134 × 2
const GRIS = "EDEDED";
const NEGRO = "1F1F1F";
const LINEA = { style: BorderStyle.SINGLE, size: 4, color: "7F7F7F" };
const BORDES = { top: LINEA, bottom: LINEA, left: LINEA, right: LINEA, insideHorizontal: LINEA, insideVertical: LINEA };

const run = (text, o = {}) => new TextRun({ text, font: "Arial", size: o.size ?? 19, bold: o.bold, italics: o.italics, color: o.color });
const P = (text, o = {}) => new Paragraph({
  alignment: o.align ?? AlignmentType.LEFT,
  keepNext: o.keepNext,
  spacing: { before: o.before ?? 0, after: o.after ?? 60, line: o.line ?? 252 },
  children: Array.isArray(text) ? text : [run(text, o)],
});
// keepNext en cada fila menos la última: Word mantiene el punto entero en una hoja (si no cabe, lo pasa completo).
const vacio = (juntar = false) => new Paragraph({ keepNext: juntar, spacing: { after: 0 }, children: [run("")] });

function celda(children, width, o = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    columnSpan: o.span,
    verticalAlign: o.valign ?? VerticalAlign.CENTER,
    shading: o.fondo ? { type: ShadingType.CLEAR, fill: o.fondo, color: "auto" } : undefined,
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    children: Array.isArray(children) ? children : [P(children, { size: o.size ?? 17, bold: o.bold, color: o.color, after: 0, keepNext: o.keepNext })],
  });
}

function tabla(cols, filas, alto) {
  return new Table({
    width: { size: cols.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: cols,
    layout: TableLayoutType.FIXED,
    borders: BORDES,
    rows: filas.map((celdas, i) => new TableRow({
      cantSplit: true,
      height: alto && alto[i] ? { value: alto[i], rule: HeightRule.ATLEAST } : undefined,
      children: celdas,
    })),
  });
}

// Un punto del diagnóstico: título, ayuda, tabla de casos y el recuadro de análisis.
function punto(numero, titulo, ayuda, columnas, nFilas, conAnalisis = true) {
  const anchos = columnas.map(c => c[1]);
  const encabezado = columnas.map(([t, w]) => celda(t, w, { fondo: GRIS, bold: true, size: 16, keepNext: true }));
  const filas = Array.from({ length: nFilas }, (_, i) => anchos.map(w => celda([vacio(conAnalisis || i < nFilas - 1)], w)));
  const bloque = [
    tabla([ANCHO], [[celda(`${numero}. ${titulo}`, ANCHO, { fondo: NEGRO, color: "FFFFFF", bold: true, size: 20, keepNext: true })]]),
    P(ayuda, { italics: true, size: 16, before: 60, after: 80, keepNext: true }),
    tabla(anchos, [encabezado, ...filas], [0, ...filas.map(() => 420)]),
  ];
  if (conAnalisis) {
    bloque.push(P("", { after: 40, keepNext: true }));
    const etq = (t, juntar) => celda(t, 2300, { fondo: GRIS, bold: true, size: 17, keepNext: juntar });
    bloque.push(tabla([2300, ANCHO - 2300], [
      [etq("Va bien", true), celda([vacio(true)], ANCHO - 2300)],
      [etq("Está fallando", true), celda([vacio(true)], ANCHO - 2300)],
      [etq("Cómo lo resolvería", false), celda([vacio(false)], ANCHO - 2300)],
    ], [580, 580, 580]));
  }
  bloque.push(P("", { after: 200 }));
  return bloque;
}

// Cada punto empieza en una hoja nueva (pedido del dueño: «cada rubro en una sola hoja»).
const nuevaHoja = () => new Paragraph({ pageBreakBefore: true, spacing: { before: 0, after: 0, line: 120 }, children: [run("", { size: 4 })] });

const portada = [
  P("CLUB MOTEROS CARTAGENA", { bold: true, size: 30, align: AlignmentType.CENTER, before: 200, after: 0 }),
  P("DIAGNÓSTICO DE LA OPERACIÓN", { bold: true, size: 26, align: AlignmentType.CENTER, after: 20 }),
  P("Corte: 2 de noviembre de 2026  ·  Lo llena cada supervisor con sus motos", { italics: true, size: 18, align: AlignmentType.CENTER, after: 240 }),
  tabla([4400, 2700, 2872], [[
    celda([P([run("Supervisor: ", { bold: true, size: 18 }), run("_____________________________", { size: 18 })], { after: 0 })], 4400),
    celda([P([run("Fecha: ", { bold: true, size: 18 }), run("____ / ____ / ______", { size: 18 })], { after: 0 })], 2700),
    celda([P([run("Motos a cargo: ", { bold: true, size: 18 }), run("________", { size: 18 })], { after: 0 })], 2872),
  ]], [520]),
  P("", { after: 160 }),
  tabla([ANCHO], [[celda([
    P("CÓMO SE LLENA", { bold: true, size: 18, after: 60 }),
    P("1.  Escriba su nombre arriba, en TODAS las hojas.", { size: 18, after: 30 }),
    P("2.  Cada punto tiene su propia hoja. Escriba una fila por cada caso: la placa, qué pasa y desde cuándo.", { size: 18, after: 30 }),
    P("3.  Si en un punto no tiene ningún caso, escriba NINGUNO.", { size: 18, after: 30 }),
    P("4.  Al final de cada hoja diga qué va bien, qué está fallando y cómo lo resolvería.", { size: 18, after: 30 }),
    P("5.  Si no le alcanzan las filas, siga en una hoja aparte con su nombre y el número del punto.", { size: 18, after: 30 }),
    P("6.  Cuando termine todo, llene en esta hoja lo más urgente y firme.", { size: 18, after: 0 }),
  ], ANCHO, { fondo: "F6F6F6" })]]),
  P("", { after: 160 }),
  tabla([ANCHO], [[celda([
    P("LOS PUNTOS DE ESTE DIAGNÓSTICO", { bold: true, size: 18, after: 60 }),
    P("Hoja 2:  GPS, revisiones o novedades", { size: 18, after: 20 }),
    P("Hoja 3:  Clientes con dificultades", { size: 18, after: 20 }),
    P("Hoja 4:  Clientes con tiempo por rodar", { size: 18, after: 20 }),
    P("Hoja 5:  Clientes pendientes por ajustes del sistema", { size: 18, after: 20 }),
    P("Hoja 6:  Atrasados graves", { size: 18, after: 20 }),
    P("Hoja 7:  Placas repetidas sin liquidación", { size: 18, after: 20 }),
    P("Hoja 8:  Cosas a tener en cuenta", { size: 18, after: 0 }),
  ], ANCHO)]]),
  P("", { after: 200 }),
  ...punto(8, "LO MÁS URGENTE",
    "Las cosas que hay que resolver primero, en orden. Se llena al final, cuando ya revisó todas las hojas.",
    [["N.°", 700], ["Qué hay que resolver", 6272], ["Quién debe hacerlo", 3000]], 5, false),
  tabla([3324, 3324, 3324], [[
    celda([vacio(), vacio(), P("Firma del supervisor", { size: 17, bold: true, align: AlignmentType.CENTER, after: 0 })], 3324, { valign: VerticalAlign.BOTTOM }),
    celda([vacio(), vacio(), P("Recibió", { size: 17, bold: true, align: AlignmentType.CENTER, after: 0 })], 3324, { valign: VerticalAlign.BOTTOM }),
    celda([vacio(), vacio(), P("Fecha de entrega", { size: 17, bold: true, align: AlignmentType.CENTER, after: 0 })], 3324, { valign: VerticalAlign.BOTTOM }),
  ]], [1100]),
];

const FILAS = 17;   // las que caben en una hoja con su recuadro de análisis (medido: con 20 se parte)
const contenido = [
  nuevaHoja(),
  ...punto(1, "GPS: REVISIONES O NOVEDADES",
    "Qué pasa: no reporta · sin batería · desconectado o manipulado · fuera de la ciudad · quieta 2 días o más · otro.",
    [["Placa", 1300], ["Qué pasa", 3100], ["Desde cuándo", 1500], ["Qué se ha hecho", 4072]], FILAS),
  nuevaHoja(),
  ...punto(2, "CLIENTES CON DIFICULTADES",
    "Ejemplos: poco trabajo · salud · accidente · moto en taller · problema familiar · no contesta · se fue de la ciudad.",
    [["Placa", 1300], ["Cliente", 2400], ["Cuál es la dificultad", 3136], ["Qué se ha hecho o acordado", 3136]], FILAS),
  nuevaHoja(),
  ...punto(3, "CLIENTES CON TIEMPO POR RODAR",
    "Motos que estuvieron paradas (taller, garantía, fiscalía, tránsito) y falta decidir si ese tiempo se cobra o se rueda.",
    [["Placa", 1300], ["Cliente", 2300], ["Por qué estuvo parada", 2900], ["Cuánto tiempo", 1400], ["¿Ya se decidió cobrar o rodar?", 2072]], FILAS),
  nuevaHoja(),
  ...punto(4, "CLIENTES PENDIENTES POR AJUSTES DEL SISTEMA",
    "Ejemplos: pago mal aplicado · saldo a favor sin usar · acuerdo mal calculado · dato del cliente errado · fecha errada.",
    [["Placa", 1300], ["Cliente", 2300], ["Qué ajuste necesita", 3472], ["Desde cuándo", 1400], ["A quién se le pidió", 1500]], FILAS),
  nuevaHoja(),
  ...punto(5, "ATRASADOS GRAVES",
    "Clientes con más de una semana en mora.",
    [["Placa", 1300], ["Cliente", 2200], ["Días en mora", 1100], ["Cuánto debe", 1400], ["Qué se ha hecho", 1986], ["Qué propone", 1986]], FILAS),
  nuevaHoja(),
  ...punto(6, "PLACAS REPETIDAS SIN LIQUIDACIÓN",
    "Motos que ya tienen otro cliente, pero al cliente anterior todavía no se le ha hecho la liquidación.",
    [["Placa", 1300], ["Cliente anterior", 2500], ["Cliente actual", 2500], ["Qué falta para liquidar", 3672]], FILAS),
  nuevaHoja(),
  ...punto(7, "COSAS A TENER EN CUENTA",
    "Riesgos, clientes que quieren referir o cambiar de moto, lo que usted necesita para trabajar mejor.",
    [["Escriba aquí", ANCHO]], 22, false),
];

// Arriba de TODAS las hojas: de quién es (pedido del dueño: «que salga el nombre en cada hoja»).
const SIN = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const cabecera = new Header({ children: [
  new Table({
    width: { size: ANCHO, type: WidthType.DXA },
    columnWidths: [4300, ANCHO - 4300],
    layout: TableLayoutType.FIXED,
    borders: { top: SIN, left: SIN, right: SIN, insideVertical: SIN, insideHorizontal: SIN, bottom: { style: BorderStyle.SINGLE, size: 8, color: "1F1F1F" } },
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 4300, type: WidthType.DXA }, margins: { top: 40, bottom: 60, left: 0, right: 60 },
        children: [P([run("DIAGNÓSTICO DE LA OPERACIÓN", { bold: true, size: 16 }), run("  ·  Corte: 2-nov-2026", { size: 16, color: "555555" })], { after: 0 })] }),
      new TableCell({ width: { size: ANCHO - 4300, type: WidthType.DXA }, margins: { top: 40, bottom: 60, left: 60, right: 0 },
        children: [P([run("Supervisor: ", { bold: true, size: 18 }), run("____________________________________", { size: 18 })], { align: AlignmentType.RIGHT, after: 0 })] }),
    ] })],
  }),
  new Paragraph({ spacing: { after: 0 }, children: [run("", { size: 8 })] }),
] });

const doc = new Document({
  creator: "Club Moteros Cartagena",
  title: "Diagnóstico de la operación — formato del supervisor",
  styles: { default: { document: { run: { font: "Arial", size: 19 } } } },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1000, bottom: 900, left: 1134, right: 1134, header: 500, footer: 450 } } },
    headers: { default: cabecera },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          run("Diagnóstico de la operación · Club Moteros Cartagena · Página ", { size: 15, color: "666666" }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 15, color: "666666" }),
          run(" de ", { size: 15, color: "666666" }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Arial", size: 15, color: "666666" }),
        ],
      })] }),
    },
    children: [...portada, ...contenido],
  }],
});

const salida = path.join(__dirname, "DIAGNOSTICO-OPERACION-SUPERVISOR.docx");
Packer.toBuffer(doc).then(buf => { fs.writeFileSync(salida, buf); console.log("ok", salida); });
