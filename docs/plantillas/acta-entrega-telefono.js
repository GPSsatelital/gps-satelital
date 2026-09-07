// Genera docs/plantillas/ACTA-ENTREGA-TELEFONO.docx: formato EN BLANCO para entregar un celular
// corporativo (equipo + SIM + cuentas) a un colaborador, con firma y huella.
// Correr:  NODE_PATH=<carpeta con node_modules/docx> node acta-entrega-telefono.js
const path = require("path");
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType,
  BorderStyle, ShadingType, LevelFormat, VerticalAlign, HeightRule, Footer, PageNumber, TableLayoutType,
} = require("docx");

const GRIS = "EDEDED";
const LINEA = { style: BorderStyle.SINGLE, size: 4, color: "7F7F7F" };
const BORDES = { top: LINEA, bottom: LINEA, left: LINEA, right: LINEA, insideHorizontal: LINEA, insideVertical: LINEA };

const run = (text, o = {}) => new TextRun({ text, font: "Arial", size: o.size ?? 19, bold: o.bold, italics: o.italics, color: o.color });
const P = (text, o = {}) => new Paragraph({
  alignment: o.align ?? AlignmentType.LEFT,
  spacing: { before: o.before ?? 0, after: o.after ?? 60, line: o.line ?? 252 },
  numbering: o.numbering,
  children: Array.isArray(text) ? text : [run(text, o)],
});
const vacio = () => new Paragraph({ spacing: { after: 0 }, children: [run("")] });
const titulo = (t) => P(t, { bold: true, size: 20, before: 200, after: 80 });

function celda(children, width, o = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    columnSpan: o.span,
    verticalAlign: o.valign ?? VerticalAlign.CENTER,
    shading: o.gris ? { type: ShadingType.CLEAR, fill: GRIS, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: Array.isArray(children) ? children : [P(children, { size: o.size ?? 17, bold: o.bold, after: 0 })],
  });
}
const etiqueta = (t, w, o = {}) => celda(t, w, { gris: true, bold: true, size: 16, ...o });
const blanco = (w, o = {}) => celda([vacio()], w, o);

function tabla(cols, filas, o = {}) {
  return new Table({
    width: { size: cols.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: cols,
    layout: TableLayoutType.FIXED,
    borders: BORDES,
    rows: filas.map((celdas, i) => new TableRow({
      cantSplit: true,
      height: o.alto && o.alto[i] ? { value: o.alto[i], rule: HeightRule.EXACT } : undefined,
      children: celdas,
    })),
  });
}

// Fila de casillas para escribir un número dígito por dígito (IMEI = 15, ICCID = 20).
function filaDigitos(etq, n, anchoDigito, anchoEtq) {
  return [etiqueta(etq, anchoEtq), ...Array.from({ length: n }, () => celda([vacio()], anchoDigito))];
}

const casilla = (t) => "[    ] " + t;
const sep = "    ";

// Encabezado
const encabezado = [
  P("CLUB DE MOTEROS", { bold: true, size: 28, align: AlignmentType.CENTER, after: 0 }),
  P("NIT ______________________   ·   Cartagena de Indias, Colombia", { size: 17, align: AlignmentType.CENTER, after: 160 }),
  P("ACTA DE ENTREGA DE EQUIPO CELULAR, LÍNEA Y CUENTAS CORPORATIVAS", { bold: true, size: 22, align: AlignmentType.CENTER, after: 40 }),
  P("Herramienta de trabajo de propiedad de la empresa", { italics: true, size: 17, align: AlignmentType.CENTER, after: 160 }),
  tabla([2200, 3886, 3886], [[
    celda([P([run("Acta N° ", { bold: true, size: 17 }), run("____________", { size: 17 })], { after: 0 })], 2200),
    celda([P([run("Fecha: ", { bold: true, size: 17 }), run("_____ de _______________ de 20____", { size: 17 })], { after: 0 })], 3886),
    celda([P([run("Lugar: ", { bold: true, size: 17 }), run("________________________________", { size: 17 })], { after: 0 })], 3886),
  ]]),
];

// 1. Partes
const partes = [
  titulo("1. PARTES"),
  P("ENTREGA (LA EMPRESA): CLUB DE MOTEROS, representada en este acto por:", { size: 17, after: 40 }),
  tabla([2000, 3486, 1000, 3486], [
    [etiqueta("Nombre", 2000), blanco(3486), etiqueta("C.C. N°", 1000), blanco(3486)],
    [etiqueta("Cargo", 2000), blanco(3486), etiqueta("Teléfono", 1000), blanco(3486)],
  ]),
  P("RECIBE (EL COLABORADOR):", { size: 17, before: 120, after: 40 }),
  tabla([2000, 3486, 1000, 3486], [
    [etiqueta("Nombre completo", 2000), blanco(3486), etiqueta("C.C. N°", 1000), blanco(3486)],
    [etiqueta("Cargo / labor", 2000), blanco(3486), etiqueta("Teléfono", 1000), blanco(3486)],
    [etiqueta("Correo personal", 2000), blanco(3486), etiqueta("Dirección", 1000), blanco(3486)],
  ]),
];

// 2. Equipo
const equipo = [
  titulo("2. EQUIPO ENTREGADO"),
  tabla([1992, 1330, 1330, 1330, 1330, 1330, 1330], [
    [etiqueta("Marca", 1992), blanco(2660, { span: 2 }), etiqueta("Modelo", 1330), blanco(3990, { span: 3 })],
    [etiqueta("Color", 1992), blanco(2660, { span: 2 }), etiqueta("Serial", 1330), blanco(3990, { span: 3 })],
    [etiqueta("Valor comercial", 1992), celda([P([run("$ ", { size: 17 })], { after: 0 })], 2660, { span: 2 }), etiqueta("Estado", 1330),
      celda(casilla("Nuevo") + sep + casilla("Usado"), 3990, { span: 3 })],
  ]),
  tabla([1992, ...Array(15).fill(532)], [
    filaDigitos("IMEI 1", 15, 532, 1992),
    filaDigitos("IMEI 2", 15, 532, 1992),
  ], { alto: [420, 420] }),
  P("Los dos IMEI aparecen marcando *#06# en el teléfono o en la caja del equipo. Anotar los 15 dígitos de cada uno, uno por casilla.", { size: 15, italics: true, color: "555555", before: 40, after: 80 }),
  tabla([1992, 7980], [
    [etiqueta("Accesorios", 1992), celda(casilla("Cargador") + sep + casilla("Cable") + sep + casilla("Forro") + sep + casilla("Vidrio templado") + sep + casilla("Caja") + sep + casilla("Otro: ______________"), 7980)],
    [etiqueta("Estado físico al entregar (pantalla, rayones, batería, botones)", 1992, { valign: VerticalAlign.TOP }), blanco(7980)],
  ], { alto: [null, 820] }),
];

// 3. SIM
const sim = [
  titulo("3. LÍNEA TELEFÓNICA (SIM)"),
  tabla([1992, 2660, 1330, 3990], [
    [etiqueta("Operador", 1992), blanco(2660), etiqueta("N° de línea", 1330), blanco(3990)],
    [etiqueta("Plan", 1992), celda(casilla("Prepago") + sep + casilla("Pospago"), 2660), etiqueta("Titular", 1330), celda("CLUB DE MOTEROS (la línea es de la empresa)", 3990)],
  ]),
  tabla([1992, ...Array(20).fill(399)], [filaDigitos("ICCID (serial SIM)", 20, 399, 1992)], { alto: [420] }),
  P("El ICCID es el número de 19 o 20 dígitos impreso en la tarjeta SIM. Anotarlo antes de insertarla.", { size: 15, italics: true, color: "555555", before: 40, after: 80 }),
];

// 4. Cuentas
const filaCuenta = (nombre) => [celda(nombre, 3000, { size: 17 }), blanco(3300), blanco(3672)];
const cuentas = [
  titulo("4. CUENTAS Y ACCESOS ENTREGADOS"),
  P("Las contraseñas se entregan por separado y en sobre cerrado. El colaborador debe cambiar la contraseña temporal en su primer ingreso. Los datos de recuperación (correo y teléfono de recuperación) quedan a nombre de LA EMPRESA y no pueden modificarse.", { size: 15, italics: true, color: "555555", before: 0, after: 60 }),
  tabla([3000, 3300, 3672], [
    [etiqueta("Cuenta o servicio", 3000), etiqueta("Usuario / correo / número", 3300), etiqueta("Observaciones", 3672)],
    filaCuenta("Correo corporativo (@clubmoteros.com)"),
    filaCuenta("Cuenta Google del equipo"),
    filaCuenta("WhatsApp / WhatsApp Business"),
    filaCuenta("Usuario de MotoGestión (rol)"),
    filaCuenta("Aplicación GPS / rastreo u otra: ______________"),
  ]),
];

// 5. Condiciones
const clausula = (t) => P(t, { size: 17, align: AlignmentType.JUSTIFIED, after: 70, line: 240, numbering: { reference: "clausulas", level: 0 } });
const condiciones = [
  titulo("5. CONDICIONES DE LA ENTREGA"),
  clausula("PROPIEDAD. El equipo celular, sus accesorios, la línea telefónica (SIM) y las cuentas descritas en esta acta son de propiedad exclusiva de LA EMPRESA y se entregan al COLABORADOR a título de tenencia, como herramienta de trabajo para el desempeño de sus labores. Esta entrega no transfiere la propiedad, no constituye salario ni pago en especie y no genera derecho alguno sobre los bienes entregados."),
  clausula("USO. El COLABORADOR se obliga a usar el equipo, la línea y las cuentas únicamente para las labores asignadas por LA EMPRESA. No podrá cederlos ni prestarlos a terceros, retirar la SIM del equipo, instalar aplicaciones ajenas a la labor, ni utilizarlos para fines personales o contrarios a la ley."),
  clausula("CUENTAS Y BLOQUEOS. El COLABORADOR no podrá cambiar las contraseñas, los correos o teléfonos de recuperación de las cuentas corporativas sin autorización escrita de LA EMPRESA, ni vincular al equipo cuentas personales (Google, Apple u otras) que activen bloqueos de activación o impidan a LA EMPRESA recuperar el control del equipo. Toda la información generada en las cuentas corporativas pertenece a LA EMPRESA."),
  clausula("CUSTODIA Y CUIDADO. El COLABORADOR responde por la guarda y el buen estado del equipo. En caso de daño, pérdida o hurto deberá informar a LA EMPRESA de inmediato y, a más tardar, dentro de las veinticuatro (24) horas siguientes; en caso de hurto deberá además presentar la denuncia ante la autoridad competente y entregar copia. El deterioro normal por el uso adecuado no genera cobro."),
  clausula("REPOSICIÓN. Si el daño, la pérdida o el hurto ocurren por culpa, descuido o negligencia del COLABORADOR, este se obliga a reponer un equipo de iguales características o a pagar el valor comercial indicado en esta acta. Para ello AUTORIZA de manera expresa, voluntaria y por escrito a LA EMPRESA para descontar dicho valor de sus salarios, honorarios, prestaciones, liquidación o cualquier suma a su favor, en los términos y con los límites que establece la ley laboral colombiana."),
  clausula("DEVOLUCIÓN. Al terminar el vínculo con LA EMPRESA, o cuando esta lo solicite, el COLABORADOR devolverá el equipo con sus accesorios, la SIM y los accesos, en el mismo estado en que los recibió salvo el deterioro normal, con las cuentas corporativas activas, sin contraseñas de bloqueo personales y sin bloqueo de activación. De la devolución se dejará constancia en el registro de la página siguiente."),
  clausula("INFORMACIÓN Y DATOS. El COLABORADOR reconoce que LA EMPRESA administra las cuentas corporativas y puede acceder a ellas, respaldarlas o suspenderlas en cualquier momento, por lo que se le recomienda no almacenar en ellas ni en el equipo información personal. Con su firma autoriza a LA EMPRESA el tratamiento de sus datos personales aquí consignados, con la finalidad exclusiva de administrar esta entrega, conforme a la Ley 1581 de 2012 y sus normas reglamentarias."),
  clausula("DECLARACIÓN. El COLABORADOR declara que recibe el equipo, la línea y las cuentas descritas, que los probó y funcionan correctamente, que su estado corresponde al anotado en esta acta, y que leyó, entendió y acepta las condiciones anteriores. Se firma en dos ejemplares del mismo tenor, uno para cada parte."),
];

// 6. Firmas
const bloqueFirma = (rotulo, w) => celda([
  P(rotulo, { bold: true, size: 16, after: 0 }),
  vacio(), vacio(), vacio(), vacio(),
  P("_______________________________", { size: 17, after: 0 }),
  P("Firma", { size: 15, color: "555555", after: 60 }),
  P("Nombre: ________________________", { size: 17, after: 40 }),
  P("C.C. N°: _______________________", { size: 17, after: 40 }),
  P("Cargo: _________________________", { size: 17, after: 0 }),
], w, { valign: VerticalAlign.TOP });

const cajaHuella = () => celda([
  P("HUELLA", { bold: true, size: 16, align: AlignmentType.CENTER, after: 0 }),
  P("índice derecho del colaborador", { size: 14, color: "555555", align: AlignmentType.CENTER, after: 0 }),
], 2772, { valign: VerticalAlign.TOP });

const firmas = [
  titulo("6. FIRMAS"),
  tabla([3600, 3600, 2772], [[
    bloqueFirma("ENTREGA (por LA EMPRESA)", 3600),
    bloqueFirma("RECIBE (EL COLABORADOR)", 3600),
    cajaHuella(),
  ]], { alto: [3000] }),
];

// Página 2: devolución
const devolucion = [
  new Paragraph({ pageBreakBefore: true, spacing: { after: 0 }, children: [run("REGISTRO DE DEVOLUCIÓN DEL EQUIPO", { bold: true, size: 22 })] }),
  P("Se diligencia únicamente cuando el COLABORADOR devuelve el equipo. Hace parte del acta de entrega N° ____________.", { size: 17, italics: true, after: 120 }),
  tabla([1992, 2660, 2200, 3120], [
    [etiqueta("Fecha de devolución", 1992), blanco(2660), etiqueta("Recibe por LA EMPRESA", 2200), blanco(3120)],
    [etiqueta("Estado del equipo", 1992), celda(casilla("Igual al entregado") + sep + casilla("Con daños (describir abajo)"), 7980, { span: 3 })],
    [etiqueta("Accesorios devueltos", 1992), celda(casilla("Cargador") + sep + casilla("Cable") + sep + casilla("Forro") + sep + casilla("Vidrio") + sep + casilla("Caja"), 7980, { span: 3 })],
    [etiqueta("SIM devuelta", 1992), celda(casilla("Sí") + sep + casilla("No"), 2660), etiqueta("Cuentas activas y sin bloqueo de activación", 2200), celda(casilla("Sí") + sep + casilla("No"), 3120)],
    [etiqueta("Daños u observaciones", 1992, { valign: VerticalAlign.TOP }), blanco(7980, { span: 3 })],
    [etiqueta("Valor a cargo del colaborador (si aplica)", 1992), celda([P([run("$ ", { size: 17 })], { after: 0 })], 7980, { span: 3 })],
  ], { alto: [null, null, null, null, 1400, null] }),
  vacio(),
  tabla([3600, 3600, 2772], [[
    bloqueFirma("ENTREGA (EL COLABORADOR)", 3600),
    bloqueFirma("RECIBE (por LA EMPRESA)", 3600),
    cajaHuella(),
  ]], { alto: [3000] }),
];

const pie = new Footer({ children: [new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [
    new TextRun({ text: "Club de Moteros · Formato de entrega de equipo celular · v1 (sep-2026)   ·   Página ", font: "Arial", size: 14, color: "777777" }),
    new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 14, color: "777777" }),
    new TextRun({ text: " de ", font: "Arial", size: 14, color: "777777" }),
    new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Arial", size: 14, color: "777777" }),
  ],
})] });

const doc = new Document({
  creator: "Club de Moteros",
  title: "Acta de entrega de equipo celular, línea y cuentas corporativas",
  styles: { default: { document: { run: { font: "Arial", size: 19 } } } },
  numbering: {
    config: [{
      reference: "clausulas",
      levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 400, hanging: 400 } } } }],
    }],
  },
  sections: [{
    properties: {
      page: { size: { width: 12240, height: 15840 }, margin: { top: 900, bottom: 900, left: 1134, right: 1134 } },
    },
    footers: { default: pie },
    children: [...encabezado, ...partes, ...equipo, ...sim, ...cuentas, ...condiciones, ...firmas, ...devolucion],
  }],
});

const salida = path.join(__dirname, "ACTA-ENTREGA-TELEFONO.docx");
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(salida, buf); console.log("OK", salida, buf.length, "bytes"); });
