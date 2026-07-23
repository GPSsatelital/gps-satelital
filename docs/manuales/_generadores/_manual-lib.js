// Librería compartida de los manuales — mismo formato para todos los roles.
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  TableOfContents, PageBreak, LevelFormat,
} = require("docx");
const fs = require("fs");

const C = {
  NAVY: "0F172A", CYAN: "0284C7", GREEN: "166534", RED: "991B1B", AMBER: "92400E", GREY: "64748B",
  SOFT_CYAN: "E0F2FE", SOFT_AMBER: "FEF3C7", SOFT_GREEN: "DCFCE7", SOFT_RED: "FEE2E2",
};

const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 140 }, children: [new TextRun({ text: t, bold: true, color: C.NAVY, size: 30 })] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 220, after: 100 }, children: [new TextRun({ text: t, bold: true, color: C.CYAN, size: 24 })] });
const P = (t, opts = {}) => new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: t, size: 22, ...opts })] });
const step = (n, t, bold) => new Paragraph({ spacing: { after: 80 }, indent: { left: 360, hanging: 260 }, children: [new TextRun({ text: n + ". ", bold: true, color: C.CYAN, size: 22 }), new TextRun({ text: t, size: 22, bold: !!bold })] });
const bullet = (t) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: t, size: 22 })] });

function callout(title, lines, bg, fg) {
  const kids = [new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: title, bold: true, color: fg, size: 22 })] })];
  lines.forEach(l => kids.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: l, size: 21, color: "1E293B" })] })));
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
    borders: { top: { style: BorderStyle.SINGLE, size: 2, color: fg }, bottom: { style: BorderStyle.SINGLE, size: 2, color: fg }, left: { style: BorderStyle.SINGLE, size: 12, color: fg }, right: { style: BorderStyle.SINGLE, size: 2, color: fg }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
    rows: [new TableRow({ children: [new TableCell({ width: { size: 9360, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: bg }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, children: kids })] })],
  });
}
const info = (t, l) => callout(t, l, C.SOFT_CYAN, C.CYAN);
const warn = (t, l) => callout(t, l, C.SOFT_AMBER, C.AMBER);
const danger = (t, l) => callout(t, l, C.SOFT_RED, C.RED);
const ok = (t, l) => callout(t, l, C.SOFT_GREEN, C.GREEN);

function build(role, tagline, body, outPath) {
  const doc = new Document({
    creator: "Club de Moteros — GPS Satelital",
    title: "Manual del funcionario — " + role,
    numbering: { config: [{ reference: "b", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 200 } } } }] }] },
    styles: { default: { document: { run: { font: "Calibri" } } } },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1200, right: 1200 } } },
      children: [
        new Paragraph({ spacing: { before: 1800, after: 60 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MANUAL DEL FUNCIONARIO", bold: true, color: C.CYAN, size: 28 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: role, bold: true, color: C.NAVY, size: 52 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "Sistema MotoGestión — Club de Moteros", size: 26, color: C.GREY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1400 }, children: [new TextRun({ text: "GPS Satelital Cartagena", size: 22, color: C.GREY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: tagline, italics: true, size: 22, color: "334155" })] }),
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 120 }, children: [new TextRun({ text: "Contenido", bold: true, color: C.NAVY, size: 30 })] }),
        new TableOfContents("Contenido", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({ children: [new PageBreak()] }),
        ...body,
      ],
    }],
  });
  return Packer.toBuffer(doc).then(buf => { fs.writeFileSync(outPath, buf); console.log("OK ->", outPath); });
}

module.exports = { C, H1, H2, P, step, bullet, callout, info, warn, danger, ok, build };
