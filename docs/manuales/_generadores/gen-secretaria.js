const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  TableOfContents, PageBreak, LevelFormat, Numbering,
} = require("docx");
const fs = require("fs");

const NAVY = "0F172A", CYAN = "0284C7", GREEN = "166534", RED = "991B1B", AMBER = "92400E", GREY = "64748B";
const SOFT_CYAN = "E0F2FE", SOFT_AMBER = "FEF3C7", SOFT_GREEN = "DCFCE7", SOFT_RED = "FEE2E2", SOFT_GREY = "F1F5F9";

function H1(text) { return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 140 }, children: [new TextRun({ text, bold: true, color: NAVY, size: 30 })] }); }
function H2(text) { return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 220, after: 100 }, children: [new TextRun({ text, bold: true, color: CYAN, size: 24 })] }); }
function P(text, opts = {}) { return new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text, size: 22, ...opts })] }); }
function runs(children, opts = {}) { return new Paragraph({ spacing: { after: 100 }, children, ...opts }); }
function step(n, text, bold) { return new Paragraph({ spacing: { after: 80 }, indent: { left: 360, hanging: 260 }, children: [new TextRun({ text: n + ". ", bold: true, color: CYAN, size: 22 }), new TextRun({ text, size: 22, bold: !!bold })] }); }
function bullet(text) { return new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text, size: 22 })] }); }

function callout(title, lines, bg, fg) {
  const kids = [new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: title, bold: true, color: fg, size: 22 })] })];
  lines.forEach(l => kids.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: l, size: 21, color: "1E293B" })] })));
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
    borders: { top: { style: BorderStyle.SINGLE, size: 2, color: fg }, bottom: { style: BorderStyle.SINGLE, size: 2, color: fg }, left: { style: BorderStyle.SINGLE, size: 12, color: fg }, right: { style: BorderStyle.SINGLE, size: 2, color: fg }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
    rows: [new TableRow({ children: [new TableCell({ width: { size: 9360, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: bg }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, children: kids })] })],
  });
}

const doc = new Document({
  creator: "Club de Moteros — GPS Satelital",
  title: "Manual del funcionario — SECRETARIA",
  numbering: { config: [{ reference: "b", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 200 } } } }] }] },
  styles: { default: { document: { run: { font: "Calibri" } } } },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1200, right: 1200 } } },
    children: [
      // Portada
      new Paragraph({ spacing: { before: 1800, after: 60 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MANUAL DEL FUNCIONARIO", bold: true, color: CYAN, size: 28 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "SECRETARIA", bold: true, color: NAVY, size: 56 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "Sistema MotoGestión — Club de Moteros", size: 26, color: GREY })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1400 }, children: [new TextRun({ text: "GPS Satelital Cartagena", size: 22, color: GREY })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cómo usar el programa en tu día a día — paso a paso.", italics: true, size: 22, color: "334155" })] }),
      new Paragraph({ children: [new PageBreak()] }),

      // Índice
      new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 120 }, children: [new TextRun({ text: "Contenido", bold: true, color: NAVY, size: 30 })] }),
      new TableOfContents("Contenido", { hyperlink: true, headingStyleRange: "1-2" }),
      new Paragraph({ children: [new PageBreak()] }),

      // 1. Bienvenida
      H1("1. Bienvenida"),
      P("Este manual te explica, paso a paso, cómo usar el sistema en tu trabajo diario. No necesitas saber de computadoras: si sabes usar un celular, puedes usar el programa."),
      P("La secretaria es el corazón del control del dinero en la oficina. Tu trabajo en el sistema es:"),
      bullet("Registrar los clientes nuevos y sus documentos."),
      bullet("Registrar los pagos en efectivo que se reciben en la oficina."),
      bullet("Confirmar las transferencias y los cobros que hacen los cobradores en la calle."),
      bullet("Cerrar la caja del día."),
      callout("Regla de oro", [
        "Todo pago que registras queda guardado con tu nombre y la hora. Registra siempre en el momento, no lo dejes para después.",
        "Antes de confirmar un pago, revisa que el monto y el cliente sean correctos: una vez confirmado, ese dinero cuenta como recibido.",
      ], SOFT_AMBER, AMBER),

      H2("Cómo entrar al sistema"),
      step(1, "Abre el programa en el navegador (Chrome) desde el ícono de la pantalla."),
      step(2, "Escribe tu correo y tu contraseña, y toca «Entrar»."),
      step(3, "Si te dice que hay una versión nueva, toca «Actualizar». Si algo se ve raro tras un cambio, presiona Ctrl + Shift + R para refrescar."),
      callout("Si no puedes entrar o no ves un módulo", [
        "No es tu culpa ni un daño: los accesos los controla el administrador. Avísale a FREDY (Administrador principal) para que revise tus permisos.",
      ], SOFT_CYAN, CYAN),

      // 2. Registrar cliente
      H1("2. Registrar un cliente nuevo"),
      P("Cuando llega una persona interesada en arrendar una moto, la registras así:"),
      step(1, "Entra al módulo «Clientes» (barra de abajo)."),
      step(2, "Toca el botón «+» (abajo a la derecha) para abrir el formulario de nuevo cliente."),
      step(3, "Llena los datos: nombre completo, cédula, teléfono y WhatsApp, dirección."),
      step(4, "Elige la ruta de contrato: «Diario» (va ahorrando la base) o «Tiempo definido» (semanal/quincenal/mensual)."),
      step(5, "Escribe el «Ingreso inicial»: lo que la persona paga al registrarse (mínimo $100.000)."),
      step(6, "Si viene con acompañante (mujer), llena sus datos. Si vive en la misma dirección, marca «Sí» y no hace falta repetir el recibo."),
      step(7, "Baja hasta «Autorización de tratamiento de datos»: pídele que firme en la pantalla (y la huella si el lector está conectado). La firma es obligatoria para guardar.", true),
      step(8, "Toca «Guardar». El sistema imprime automáticamente el recibo de la base inicial si pagó algo."),
      callout("Importante", [
        "Si la persona aparece en «lista negra», el sistema te avisará. No la registres sin autorización del administrador principal.",
      ], SOFT_RED, RED),

      // 3. Documentos
      H1("3. Subir los documentos"),
      P("Cada cliente necesita sus documentos para poder avanzar a la visita y al contrato."),
      P("Documentos del cliente: hoja de vida, cédula, recibo público, antecedentes, y licencia (opcional)."),
      P("Documentos del acompañante (si aplica): cédula y recibo público (si vive en la misma casa, solo cédula)."),
      step(1, "Abre la ficha del cliente («Ver ficha completa»)."),
      step(2, "Ve a la pestaña «Documentos»."),
      step(3, "Por cada documento, usa «📷 Cámara» para tomar la foto o «🖼 Galería» para subir una que ya tengas."),
      step(4, "Si te equivocas, toca «🗑️ Quitar / volver a intentar» y vuelve a subirla."),
      P("Cuando estén completos, el estado del cliente avanza solo a «Listo para visita»."),

      // 4. Pago efectivo
      H1("4. Registrar un pago en efectivo"),
      P("Es lo que más vas a hacer. Cuando un cliente paga en la oficina:"),
      step(1, "Entra a «Cartera» y busca al cliente por nombre o placa."),
      step(2, "Abre su contrato. Verás cuánto «Debe hoy»."),
      step(3, "Toca «Registrar pago» (o el botón «+» → «Pago en oficina»). El método queda fijo en Efectivo."),
      step(4, "Escribe el monto que te entregó."),
      step(5, "Sale una ventana de confirmación con el nombre, la placa y el monto. Revísala.", true),
      step(6, "Si aparece un aviso amarillo de «pago duplicado» (mismo cliente y monto hoy), verifica que no lo estés registrando dos veces. El aviso no bloquea, solo advierte."),
      step(7, "Toca «Confirmar». El pago queda registrado y puedes imprimir el recibo."),
      callout("El sistema reparte el pago solo", [
        "Tú solo escribes cuánto pagó. El sistema decide cómo se aplica (cuota de la semana, deuda, convenio, ahorro). No tienes que calcular nada.",
      ], SOFT_GREEN, GREEN),

      // 5. Confirmar transferencia
      H1("5. Confirmar una transferencia"),
      P("Cuando un cliente paga por transferencia, el cobrador reporta el comprobante. Tú confirmas que el dinero llegó:"),
      step(1, "Entra a «Cartera» → pestaña «Por confirmar» → bloque «Transferencias por confirmar»."),
      step(2, "Abre el pago y revisa la foto del comprobante contra la cuenta del banco."),
      step(3, "Si el dinero llegó, toca «Confirmar». Si no llegó o está mal, toca «Rechazar»."),
      callout("Solo tú confirmas", [
        "Confirmar o rechazar un pago es exclusivo de la secretaria (y el administrador). Los cobradores (SUBADMIN) no pueden confirmar — solo reportan.",
      ], SOFT_CYAN, CYAN),

      // 6. Confirmar cobro de campo
      H1("6. Confirmar un cobro de campo"),
      P("Los administradores y cobradores recogen efectivo en la calle. Ese dinero pasa por dos controles: ellos lo registran y marcan «entregué a secretaria», y tú lo confirmas."),
      step(1, "Entra a «Cartera» → «Por confirmar» → bloque «Efectivo de campo por confirmar»."),
      step(2, "Verás quién lo cobró, a qué cliente, el monto y (si tomó) la foto y la ubicación GPS."),
      step(3, "Cuando el cobrador te entregue el efectivo, toca «Confirmar». Recién ahí ese dinero cuenta como recibido en caja."),

      // 7. Recibos
      H1("7. Imprimir o reenviar el recibo"),
      step(1, "Después de registrar o confirmar un pago, se abre el panel del recibo."),
      step(2, "Para imprimir en la impresora térmica, toca «🖨️ Imprimir recibo»."),
      step(3, "Para enviarlo por WhatsApp al cliente, toca el botón de WhatsApp."),
      P("El recibo muestra el club, el grupo de la moto, el detalle de a qué se aplicó el pago y cuánto queda."),

      // 8. Caja
      H1("8. Cerrar la caja diaria"),
      P("Al final del día se cuadra el dinero recibido, separado por grupo (COSTA, PRADERA, RASTREADOR, USADAS), porque cada grupo es un negocio aparte."),
      step(1, "Entra a «Caja Diaria» (menú «Más»)."),
      step(2, "Revisa el recaudo del día por grupo y por funcionario (total, pendiente de entregar, sin confirmar)."),
      step(3, "Confirma que el efectivo físico coincide con lo que muestra el sistema."),
      step(4, "Cierra la caja."),
      callout("Antes de cerrar", [
        "Asegúrate de haber confirmado todas las transferencias y cobros de campo del día. Lo que quede «sin confirmar» no entra en el cierre.",
      ], SOFT_AMBER, AMBER),

      // 9. Empalme (COSTA / migrados)
      H1("9. Completar la migración de un cliente (empalme)"),
      P("Algunos clientes (los que ya venían de antes, y los de COSTA que se van cargando poco a poco) entran al sistema con una marca «⚠️ Empalme». Eso significa que faltan sus cifras (cuánto ahorro trae y cuánto debe). Se completan CON EL CLIENTE PRESENTE, la primera vez que viene a pagar."),
      step(1, "Abre el contrato en «Cartera». Verás el recuadro «Panel de empalme»."),
      step(2, "Con el cliente, revisen juntos: la deuda que trae, el ahorro que trae, y verifica su teléfono y cédula."),
      step(3, "Marca cada punto del checklist a medida que lo revisan."),
      step(4, "Pídele la firma y la huella de autorización."),
      step(5, "Toca «Confirmar migración». La marca ⚠️ desaparece y el cliente queda normal."),
      callout("Regla de oro del empalme", [
        "Nunca confirmes una migración sin el cliente presente ni con la lista incompleta. Las cifras se acuerdan cara a cara para que no queden mal.",
      ], SOFT_RED, RED),

      // 10. Qué no puede hacer
      H1("10. Qué NO hace la secretaria (y a quién acudir)"),
      P("Estas acciones son de otros roles. Si necesitas una, pídesela a quien corresponde:"),
      bullet("Crear contratos, elegir/asignar motos → Administrador (ADMIN) o Administrador principal."),
      bullet("Recolectar una moto por mora → el cobrador a cargo (SUBADMIN) o el Administrador."),
      bullet("Iniciar una liquidación o cerrar un contrato → Administrador / Administrador principal."),
      bullet("Cambiar accesos o crear usuarios → Administrador principal (FREDY)."),

      // 11. Problemas comunes
      H1("11. Solución a problemas comunes"),
      P("«La pantalla se ve rara o un botón no responde tras un cambio»: presiona Ctrl + Shift + R para refrescar."),
      P("«No me deja registrar un pago / no aparece un botón»: puede ser un tema de permisos; avísale al Administrador principal."),
      P("«El recibo no imprime bien»: revisa que la impresora esté encendida y con papel; también puedes reenviar el recibo por WhatsApp."),
      P("«Registré un pago equivocado»: no lo borres tú. Avísale al Administrador principal, que es el único que puede eliminar un pago (queda registro de quién y por qué)."),
      new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ante cualquier duda: primero pregunta, nunca adivines con el dinero.", italics: true, color: GREY, size: 22 })] }),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  const out = "C:/Users/USER/Documents/GitHub/gps-satelital/docs/manuales/Manual-SECRETARIA.docx";
  fs.writeFileSync(out, buf);
  console.log("OK ->", out);
});
