// Motor de descargas del sistema — fuente ÚNICA.
//
// Vivía enterrado dentro de ReportesView.tsx como funciones locales sin `export`, así que
// cualquier pantalla nueva que quisiera un botón de descargar tenía que copiarlo. Vive acá para
// que el formato de los archivos sea uno solo: el día que cambie el estilo o el separador, cambia
// en todas partes y no queda una pantalla sacando archivos distintos a las demás.
//
// Excel (.xlsx) con xlsx-js-style: encabezado de color, secciones con título, filas cebra, bordes,
// autofiltro y —lo importante— los montos como NÚMERO de verdad, para que se puedan sumar en la
// hoja en vez de quedar como texto.

import * as XLSX from "xlsx-js-style";

/** Una celda: texto plano, o un objeto para controlar número, color, negrita y alineación. */
export type CeldaX = string | {
  v?: string; num?: number; color?: string; bold?: boolean;
  align?: "left" | "center" | "right"; fill?: string;
};
export type ColX = { label: string; align?: "left" | "center" | "right"; ancho?: number };
/** Un bloque con título de color dentro de la hoja (ej. un portafolio, un estado, un encargado). */
export type SeccionX = { titulo: string; color?: string; filas: CeldaX[][] };
export type SeccionesOpts = {
  titulo: string; periodo: string; leyenda?: string;
  columnas: ColX[]; secciones: SeccionX[]; totalGeneral?: CeldaX[];
};

const XLC = {
  navy: "0F2740", cyan: "0891B2", sec: "334155", zebra: "F3F6FA",
  white: "FFFFFF", line: "E2E8F0", gray: "64748B", grayL: "94A3B8", ink: "1F2937",
};
const hexNo = (h?: string) => (h || "").replace("#", "");
const bordeF = { style: "thin", color: { rgb: XLC.line } };
const bordeAll = { top: bordeF, bottom: bordeF, left: bordeF, right: bordeF };

/** Color de cada portafolio dentro del Excel (hex plano: las variables CSS no sirven en un .xlsx). */
export const GRUPO_HEX: Record<string, string> = {
  RASTREADOR: "#0891b2", COSTA: "#0e7490", PRADERA: "#b45309", USADAS: "#c2410c", OTRO: "#475569",
};

/** Construye una hoja estilizada a partir de título / período / leyenda / columnas / secciones. */
export function estilarSeccionesWS(opts: SeccionesOpts): XLSX.WorkSheet {
  const n = opts.columnas.length;
  const val = (c: CeldaX): string | number => (c !== null && typeof c === "object") ? (typeof c.num === "number" ? c.num : (c.v ?? "")) : (c ?? "");
  type RK = { k: "title" | "period" | "leyenda" | "blank" | "header" | "section" | "data" | "total"; sec?: string; cells?: CeldaX[]; zebra?: boolean };
  const aoa: (string | number)[][] = [];
  const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = [];
  const kinds: RK[] = [];
  let r = 0;
  const fullRow = (txt: string, k: RK["k"], sec?: string) => { aoa.push([txt]); merges.push({ s: { r, c: 0 }, e: { r, c: n - 1 } }); kinds.push({ k, sec }); r++; };
  fullRow(opts.titulo, "title");
  fullRow(opts.periodo, "period");
  if (opts.leyenda) fullRow(opts.leyenda, "leyenda");
  aoa.push([]); kinds.push({ k: "blank" }); r++;
  aoa.push(opts.columnas.map(c => c.label)); kinds.push({ k: "header" }); r++;
  opts.secciones.forEach(sec => {
    fullRow(sec.titulo, "section", sec.color);
    let di = 0;
    sec.filas.forEach(fila => { aoa.push(opts.columnas.map((_, ci) => val(fila[ci] ?? ""))); kinds.push({ k: "data", cells: fila, zebra: di % 2 === 1 }); di++; r++; });
  });
  if (opts.totalGeneral) { const tg = opts.totalGeneral; aoa.push(opts.columnas.map((_, ci) => val(tg[ci] ?? ""))); kinds.push({ k: "total" }); r++; }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!merges"] = merges as XLSX.Range[];
  ws["!cols"] = opts.columnas.map(c => ({ wch: Math.max(9, Math.round((c.ancho ?? 120) / 6.5)) }));
  const headerRow = kinds.findIndex(k => k.k === "header");
  if (headerRow >= 0) ws["!autofilter"] = { ref: `${XLSX.utils.encode_cell({ r: headerRow, c: 0 })}:${XLSX.utils.encode_cell({ r: headerRow, c: n - 1 })}` };

  const put = (addr: string, s: object) => { if (!ws[addr]) ws[addr] = { t: "s", v: "" }; (ws[addr] as { s?: object }).s = s; };
  kinds.forEach((rk, ri) => {
    if (rk.k === "blank") return;
    for (let c = 0; c < n; c++) {
      const addr = XLSX.utils.encode_cell({ r: ri, c });
      const cell = ws[addr] as { t?: string } | undefined;
      const numeric = cell?.t === "n";
      const col = opts.columnas[c];
      if (rk.k === "title") put(addr, { fill: { fgColor: { rgb: XLC.navy } }, font: { name: "Arial", sz: 14, bold: true, color: { rgb: XLC.white } } });
      else if (rk.k === "period") put(addr, { font: { name: "Arial", sz: 10, color: { rgb: XLC.gray } } });
      else if (rk.k === "leyenda") put(addr, { font: { name: "Arial", sz: 9, italic: true, color: { rgb: XLC.grayL } } });
      else if (rk.k === "header") put(addr, { fill: { fgColor: { rgb: XLC.cyan } }, font: { name: "Arial", sz: 11, bold: true, color: { rgb: XLC.white } }, alignment: { horizontal: col.align ?? "left", vertical: "center" }, border: bordeAll });
      else if (rk.k === "section") put(addr, { fill: { fgColor: { rgb: hexNo(rk.sec) || XLC.sec } }, font: { name: "Arial", sz: 11, bold: true, color: { rgb: XLC.white } } });
      else if (rk.k === "total") put(addr, { fill: { fgColor: { rgb: XLC.navy } }, font: { name: "Arial", sz: 11, bold: true, color: { rgb: XLC.white } }, alignment: { horizontal: col.align ?? (numeric ? "right" : "left") }, border: bordeAll, ...(numeric ? { numFmt: "#,##0" } : {}) });
      else {
        const cx = rk.cells?.[c];
        const cxo = (cx !== null && typeof cx === "object") ? cx : undefined;
        put(addr, {
          fill: { fgColor: { rgb: cxo?.fill ? hexNo(cxo.fill) : (rk.zebra ? XLC.zebra : XLC.white) } },
          font: { name: "Arial", sz: 10, bold: !!cxo?.bold, color: { rgb: cxo?.color ? hexNo(cxo.color) : XLC.ink } },
          alignment: { horizontal: cxo?.align ?? col.align ?? (numeric ? "right" : "left") },
          border: bordeAll, ...(numeric ? { numFmt: "#,##0" } : {}),
        });
      }
    }
  });
  return ws;
}

export function descargarLibro(archivo: string, hojas: { nombre: string; ws: XLSX.WorkSheet }[]) {
  const wb = XLSX.utils.book_new();
  hojas.forEach(h => XLSX.utils.book_append_sheet(wb, h.ws, h.nombre.slice(0, 31)));
  XLSX.writeFile(wb, archivo.endsWith(".xlsx") ? archivo : archivo + ".xlsx");
}

export function descargarExcel(opts: SeccionesOpts & { archivo: string; hoja?: string; hojasExtra?: (SeccionesOpts & { nombre: string })[] }) {
  const hojas = [
    { nombre: opts.hoja ?? "Informe", ws: estilarSeccionesWS(opts) },
    ...(opts.hojasExtra ?? []).map(h => ({ nombre: h.nombre, ws: estilarSeccionesWS(h) })),
  ];
  descargarLibro(opts.archivo, hojas);
}

/**
 * CSV de respaldo. Se conserva porque tres botones viejos de Reportes lo usan.
 *
 * OJO — para archivos NUEVOS preferir Excel: Excel en configuración regional de Colombia usa punto
 * y coma como separador de listas, así que un CSV con comas se abre TODO pegado en la columna A.
 * Por eso acá el separador es ';'. Además cada campo va entre comillas y se duplican las comillas
 * internas: sin eso, una sola coma escrita por un funcionario en "observaciones" corre todas las
 * columnas de esa fila y el archivo queda corrupto sin avisar.
 * El BOM al inicio es lo que hace que Excel muestre bien las tildes y las eñes.
 */
export function exportarCSV(filas: string[][], encabezado: string[], nombreArchivo: string) {
  const escapa = (campo: string) => `"${String(campo ?? "").replace(/"/g, '""')}"`;
  const contenido = [encabezado, ...filas].map(row => row.map(escapa).join(";")).join("\r\n");
  const blob = new Blob(["﻿" + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nombreArchivo; a.click();
  URL.revokeObjectURL(url);
}
