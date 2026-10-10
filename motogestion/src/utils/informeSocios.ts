// EL INFORME PARA LOS SOCIOS (Descargar, rediseño aprobado por el dueño el 2-oct-2026).
//
// Lo mismo que se ve en Reportes —Resumen, Cobranza, Portafolios, Equipo y Flota— con las MISMAS
// cifras (las arma ReportesView con las cuentas de cada pantalla), más tres anexos que solo vivían en
// el PDF viejo. Acá solo se pinta: HTML con estilos en línea y Arial (los documentos impresos van en
// Arial a propósito), que sirve igual para el PDF (html2canvas, 794 px) y para imprimir.

export type SeccionInforme = "resumen" | "cobranza" | "portafolios" | "equipo" | "flota";
export const SECCIONES_INFORME: Array<{ clave: SeccionInforme; etiqueta: string }> = [
  { clave: "resumen", etiqueta: "Resumen" },
  { clave: "cobranza", etiqueta: "Cobranza" },
  { clave: "portafolios", etiqueta: "Portafolios" },
  { clave: "equipo", etiqueta: "Equipo" },
  { clave: "flota", etiqueta: "Flota" },
];

export type DatosInforme = {
  periodo: string;
  filtros: string;
  generado: string;
  resumen: {
    recaudo: { total: number; empresa: number; ahorro: number; baseYSaldo: number; anterior: number | null; textoAnterior: string; antes: number };
    cumplimiento: { pct: number | null; debia: number; cubrio: number; aAcuerdo: number };
    estados: Array<{ etiqueta: string; hoy: number; cierre: number | null }>;
    cierreTexto: string | null;
    tramos: Array<{ etiqueta: string; n: number; debe: number }>;
    sinProducir: { motos: number; dias: number; estimado: number };
  };
  cobranza: {
    /** Un día pasado del cuaderno (mig 190), p. ej. "30 de septiembre". Sin él, la cobranza es de hoy. */
    dia?: string | null;
    debe: { total: number; semanas: number; acuerdo: number; deudas: number; clientes: number };
    cobrable: { conMoto: number; retenidas: number };
    estados: Array<{ etiqueta: string; n: number }>;
    porGrupo: Array<{ nombre: string; debe: number; clientes: number }>;
    porCobrador: Array<{ nombre: string; debe: number; clientes: number }>;
    mayores: Array<{ cliente: string; placa: string; grupo: string; detalle: string; debe: number }>;
    saldoFavor: { total: number; clientes: number };
    acuerdos: { n: number; pactado: number; pagado: number; falta: number; atrasado: number; aldia: number; atrasados: number; vencidos: number; sinAbono: number; vencenPronto: number; faltaPronto: number };
  };
  portafolios: {
    grupos: Array<{ grupo: string; recaudo: number; pctCum: number | null; enMora: number; trabajando: number; contratos: number }>;
    cobradores: Array<{ nombre: string; recaudo: number; pctCum: number | null; enMora: number; motos: number }>;
    antesDeAsignar: number;
  };
  equipo: {
    nomina: null | { semana: string; total: number; cobros: number; visitas: number; nVisitas: number; referidos: number; nReferidos: number; pagadas: number;
      cobradores: Array<{ nombre: string; total: number; cobros: number; visitas: number; referidos: number; motos: string; pagada: string | null }> };
    visitas: { total: number; aprobadas: number; esperando: number; repetir: number; rechazadas: number; sinResultado: number; pendientes: number;
      conMoto: number; mediana: number | null; maximo: number | null; hechas: number; conGps: number; conFoto: number;
      personas: Array<{ nombre: string; total: number; aprobadas: number }> };
  };
  flota: {
    total: number;
    lugares: Array<{ etiqueta: string; n: number }>;
    grupos: Array<{ grupo: string; total: number; trabajando: number }>;
    papeles: { vencidos: number; porVencer: number; sinSoat: number };
    guardadas: { motos: number; dias: number };
  };
  anexos: {
    matriz: { grupos: string[]; filas: Array<{ nombre: string; celdas: number[]; total: number }>; antes: number };
    metodo: Array<{ nombre: string; efectivo: number; transferencia: number }>;
    sinAcuerdo: Array<{ cobrador: string; clientes: Array<{ cliente: string; placa: string; telefono: string; debe: number }> }>;
  };
  detalle: {
    /** `pagoPeriodo`: plata suya que entró en el período (0 = no pagó nada). */
    enMora: Array<{ cliente: string; placa: string; grupo: string; dias: number; debe: number; pagoPeriodo: number }>;
    retenidas: Array<{ cliente: string; placa: string; grupo: string; donde: string; debe: number }>;
    acuerdos: Array<{ cliente: string; placa: string; total: number; pagado: number; atrasado: number; vence: string; estado: string }>;
    guardadas: Array<{ placa: string; cliente: string; motivo: string; dias: number | null }>;
  };
};

const esc = (s: string) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const plata = (n: number) => "$" + Math.round(n).toLocaleString("es-CO");
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
/** "1 rechazada" · "4 rechazadas" */
const cuantos = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
const C = { tinta: "#0f172a", suave: "#475569", linea: "#e2e8f0", fondo: "#f6f8fb", navy: "#0f2740", ok: "#166534", mal: "#991b1b", alerta: "#92400e" };

type Col = { t: string; al?: "left" | "center" | "right" };
function tabla(cols: Col[], filas: string[][], total?: string[]): string {
  if (filas.length === 0) return `<p style="font-size:11px;color:${C.suave};margin:4px 0 10px">No hay nada que mostrar.</p>`;
  const th = cols.map(c => `<th style="background:${C.navy};color:#fff;padding:5px 7px;text-align:${c.al ?? "left"};font-size:10.5px;font-weight:bold">${esc(c.t)}</th>`).join("");
  const td = (v: string, i: number, bold = false) => `<td style="padding:4px 7px;border-bottom:1px solid ${C.linea};text-align:${cols[i]?.al ?? "left"};font-size:10.5px;color:${C.tinta};${bold ? "font-weight:bold;" : ""}">${v}</td>`;
  const cuerpo = filas.map(f => `<tr>${f.map((v, i) => td(v, i)).join("")}</tr>`).join("");
  const pie = total ? `<tr style="background:${C.fondo}">${total.map((v, i) => td(v, i, true)).join("")}</tr>` : "";
  return `<table style="width:100%;border-collapse:collapse;margin:4px 0 12px;page-break-inside:avoid">${`<tr>${th}</tr>`}${cuerpo}${pie}</table>`;
}
function kpis(lista: Array<{ l: string; v: string; s?: string; color?: string }>): string {
  return `<div data-no-cortar style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 10px;page-break-inside:avoid">${lista.map(k =>
    `<div style="flex:1;min-width:120px;background:${C.fondo};border-radius:8px;padding:8px 10px"><div style="font-size:10px;color:${C.suave}">${esc(k.l)}</div><div style="font-size:17px;font-weight:bold;color:${k.color ?? C.tinta}">${esc(k.v)}</div>${k.s ? `<div style="font-size:9.5px;color:${C.suave};margin-top:2px">${esc(k.s)}</div>` : ""}</div>`).join("")}</div>`;
}
const titulo = (t: string, nuevaPagina: boolean) =>
  `<div data-con-siguiente style="${nuevaPagina ? "page-break-before:always;" : ""}margin:18px 0 6px;padding-bottom:4px;border-bottom:2px solid ${C.navy};font-size:15px;font-weight:bold;color:${C.navy}">${esc(t)}</div>`;
const sub = (t: string) => `<div data-con-siguiente style="font-size:12px;font-weight:bold;color:${C.tinta};margin:10px 0 2px">${esc(t)}</div>`;
const nota = (t: string) => `<p style="font-size:10px;color:${C.suave};margin:2px 0 8px;line-height:1.45">${esc(t)}</p>`;

export function informeSociosHTML(d: DatosInforme, opciones: { secciones: SeccionInforme[]; detalle: boolean; anexos?: boolean }): string {
  const incluye = new Set(opciones.secciones);
  const partes: string[] = [];
  let primera = true;
  const abrir = (t: string) => { partes.push(titulo(t, !primera)); primera = false; };

  if (incluye.has("resumen")) {
    const r = d.resumen;
    abrir("Resumen");
    const delta = r.recaudo.anterior && r.recaudo.anterior > 0 ? `${r.recaudo.total >= r.recaudo.anterior ? "+" : ""}${Math.round(((r.recaudo.total - r.recaudo.anterior) / r.recaudo.anterior) * 100)}% frente a ${r.recaudo.textoAnterior}` : undefined;
    partes.push(kpis([
      { l: "Recaudado en el período", v: plata(r.recaudo.total), s: delta },
      { l: "Para la empresa", v: plata(r.recaudo.empresa) },
      { l: "Ahorro de los clientes", v: plata(r.recaudo.ahorro) },
      { l: "Base y saldos a favor", v: plata(r.recaudo.baseYSaldo) },
    ]));
    if (r.recaudo.antes > 0) partes.push(nota(`Además entraron ${plata(r.recaudo.antes)} de motos antes de que fueran de su cobrador de hoy: no se le cuentan a nadie.`));
    partes.push(sub("Cumplimiento del período"));
    partes.push(nota(r.cumplimiento.pct === null
      ? "No hubo nada que se venciera en el período."
      : `De lo que se les vencía en el período (${plata(r.cumplimiento.debia)}), quedó pagado ${plata(r.cumplimiento.cubrio)}: el ${r.cumplimiento.pct}%.${r.cumplimiento.aAcuerdo > 0 ? ` Pasó a acuerdo ${plata(r.cumplimiento.aAcuerdo)}.` : ""}`));
    partes.push(sub("Cómo están los clientes"));
    partes.push(tabla(r.cierreTexto ? [{ t: "Estado" }, { t: "Hoy", al: "center" }, { t: `Al ${r.cierreTexto}`, al: "center" }] : [{ t: "Estado" }, { t: "Hoy", al: "center" }],
      r.estados.map(e => r.cierreTexto ? [esc(e.etiqueta), String(e.hoy), e.cierre === null ? "—" : String(e.cierre)] : [esc(e.etiqueta), String(e.hoy)])));
    if (r.tramos.some(t => t.n > 0)) {
      partes.push(sub("Cuánto tiempo llevan en mora"));
      partes.push(tabla([{ t: "Tramo" }, { t: "Clientes", al: "center" }, { t: "Deben", al: "right" }], r.tramos.map(t => [esc(t.etiqueta), String(t.n), plata(t.debe)])));
    }
    partes.push(sub("Plata sin producir"));
    partes.push(nota(`${r.sinProducir.motos} motos guardadas sin trabajar, ${r.sinProducir.dias} días entre todas: unos ${plata(r.sinProducir.estimado)} que no se facturaron (por la tarifa diaria de cada una).`));
  }

  if (incluye.has("cobranza")) {
    const c = d.cobranza;
    // Un día pasado: todo en pasado, y sin los acuerdos (esos son de hoy, no de ese día).
    const pasado = !!c.dia;
    abrir(pasado ? `Cobranza — cómo estaba el ${c.dia}` : "Cobranza");
    partes.push(kpis([
      { l: pasado ? `Lo que se debía el ${c.dia}` : "Lo que se debe hoy", v: plata(c.debe.total), s: `${c.debe.clientes} clientes ${pasado ? "debían" : "deben"} algo`, color: C.mal },
      { l: "Cuotas del contrato", v: plata(c.debe.semanas) },
      { l: "Cuotas de acuerdos", v: plata(c.debe.acuerdo) },
      { l: "Deudas (multas, daños y otras)", v: plata(c.debe.deudas) },
    ]));
    const tc = c.cobrable.conMoto + c.cobrable.retenidas;
    partes.push(nota(pasado
      ? `Qué tan cobrable era: ${plata(c.cobrable.conMoto)} (${pct(c.cobrable.conMoto, tc)}%) lo debían clientes que seguían con su contrato; ${plata(c.cobrable.retenidas)} (${pct(c.cobrable.retenidas, tc)}%) lo debían motos retenidas o en liquidación.`
      : `Qué tan cobrable es: ${plata(c.cobrable.conMoto)} (${pct(c.cobrable.conMoto, tc)}%) lo deben clientes que siguen con su contrato; ${plata(c.cobrable.retenidas)} (${pct(c.cobrable.retenidas, tc)}%) lo deben motos retenidas o en liquidación, que casi siempre se termina cobrando en la liquidación.`));
    partes.push(sub(pasado ? "Cómo iban pagando ese día" : "Cómo van pagando hoy"));
    partes.push(tabla([{ t: "Estado" }, { t: "Clientes", al: "center" }], c.estados.map(e => [esc(e.etiqueta), String(e.n)])));
    partes.push(sub("Quién tiene la deuda, por grupo"));
    partes.push(tabla([{ t: "Grupo" }, { t: "Debe", al: "right" }, { t: "Clientes", al: "center" }], c.porGrupo.map(g => [esc(g.nombre), plata(g.debe), String(g.clientes)])));
    partes.push(sub("Quién tiene la deuda, por cobrador"));
    partes.push(tabla([{ t: "Cobrador" }, { t: "Debe", al: "right" }, { t: "Clientes", al: "center" }], c.porCobrador.map(g => [esc(g.nombre.toUpperCase()), plata(g.debe), String(g.clientes)])));
    partes.push(sub(`Los ${c.mayores.length} que más ${pasado ? "debían" : "deben"}`));
    partes.push(tabla([{ t: "Cliente" }, { t: "Placa", al: "center" }, { t: "Grupo", al: "center" }, { t: "Cómo va" }, { t: "Debe", al: "right" }],
      c.mayores.map(m => [esc(m.cliente.toUpperCase()), esc(m.placa), esc(m.grupo), esc(m.detalle), plata(m.debe)])));
    partes.push(nota(pasado
      ? `Plata a favor de los clientes: ${c.saldoFavor.clientes} clientes tenían ${plata(c.saldoFavor.total)} a su favor ese día.`
      : `Plata a favor de los clientes: ${c.saldoFavor.clientes} clientes tienen ${plata(c.saldoFavor.total)} a su favor. Se les aplica a mano, cuando el cliente lo decide.`));
  }
  if (incluye.has("cobranza") && !d.cobranza.dia) {
    const c = d.cobranza;
    const a = c.acuerdos;
    partes.push(sub("Acuerdos de pago"));
    partes.push(kpis([
      { l: "Acuerdos que se están cobrando", v: String(a.n), s: `al día ${a.aldia} · atrasados ${a.atrasados} · vencidos ${a.vencidos}` },
      { l: "Se pactaron", v: plata(a.pactado), s: `se han pagado ${plata(a.pagado)} (${pct(a.pagado, a.pactado)}%)` },
      { l: "Faltan", v: plata(a.falta) },
      { l: "Atrasado", v: plata(a.atrasado), color: C.mal },
    ]));
    partes.push(nota(`${a.sinAbono} no han pagado ni un peso desde que firmaron.${a.vencenPronto > 0 ? ` ${a.vencenPronto} vencen en los próximos 14 días y todavía les faltan ${plata(a.faltaPronto)}.` : ""}`));
  }

  if (incluye.has("portafolios")) {
    const p = d.portafolios;
    abrir("Portafolios");
    partes.push(sub("Por grupo"));
    partes.push(tabla([{ t: "Grupo" }, { t: "Recaudado", al: "right" }, { t: "Cumplió", al: "center" }, { t: "En mora hoy", al: "center" }, { t: "Motos trabajando", al: "center" }, { t: "Contratos", al: "center" }],
      p.grupos.map(g => [esc(g.grupo), plata(g.recaudo), g.pctCum === null ? "—" : g.pctCum + "%", String(g.enMora), String(g.trabajando), String(g.contratos)]),
      ["Total", plata(p.grupos.reduce((s, g) => s + g.recaudo, 0)), "", String(p.grupos.reduce((s, g) => s + g.enMora, 0)), String(p.grupos.reduce((s, g) => s + g.trabajando, 0)), String(p.grupos.reduce((s, g) => s + g.contratos, 0))]));
    partes.push(sub("Por cobrador"));
    partes.push(tabla([{ t: "Cobrador" }, { t: "Recaudado", al: "right" }, { t: "Cumplió", al: "center" }, { t: "En mora hoy", al: "center" }, { t: "Motos", al: "center" }],
      p.cobradores.map(g => [esc(g.nombre.toUpperCase()), plata(g.recaudo), g.pctCum === null ? "—" : g.pctCum + "%", String(g.enMora), String(g.motos)])));
    partes.push(nota(`A cada cobrador se le cuenta lo de sus motos desde el día en que se las asignaron.${p.antesDeAsignar > 0 ? ` Lo que pagaron esas motos antes (${plata(p.antesDeAsignar)}) no se le cuenta a nadie: el sistema no guarda quién las tenía.` : ""}`));
  }

  if (incluye.has("equipo")) {
    const e = d.equipo;
    abrir("Equipo");
    if (e.nomina) {
      const n = e.nomina;
      partes.push(sub(`Nómina · ${n.semana} (la semana escogida en Equipo; la nómina va por semana, no por el período)`));
      partes.push(kpis([
        { l: "Se paga", v: plata(n.total), s: `pago registrado en la app: ${n.pagadas === 0 ? "ninguno" : `${n.pagadas} de ${n.cobradores.length}`}` },
        { l: "Cobro de cuotas", v: plata(n.cobros) },
        { l: `${n.nVisitas} visitas`, v: plata(n.visitas) },
        { l: `${n.nReferidos} referidos`, v: plata(n.referidos) },
      ]));
      partes.push(tabla([{ t: "Cobrador" }, { t: "Total", al: "right" }, { t: "Cobros", al: "right" }, { t: "Visitas", al: "right" }, { t: "Referidos", al: "right" }, { t: "Motos que le generaron pago", al: "center" }, { t: "Pago en la app", al: "center" }],
        n.cobradores.map(c => [esc(c.nombre.toUpperCase()), plata(c.total), plata(c.cobros), plata(c.visitas), plata(c.referidos), esc(c.motos), c.pagada ?? "no registrado"])));
    } else {
      partes.push(nota("La nómina no se pudo incluir: ábrela en Equipo para verla."));
    }
    const v = e.visitas;
    partes.push(sub("Visitas domiciliarias del período"));
    partes.push(nota(`${cuantos(v.total, "visita", "visitas")}: ${cuantos(v.aprobadas, "aprobada", "aprobadas")}${v.esperando ? `, ${v.esperando} esperando decisión` : ""}, ${v.repetir} para repetir, ${cuantos(v.rechazadas, "rechazada", "rechazadas")}${v.sinResultado ? `, ${v.sinResultado} sin anotar el resultado` : ""}${v.pendientes ? `, ${cuantos(v.pendientes, "pendiente", "pendientes")} por hacer` : ""}. De las aprobadas, ${v.conMoto} ya recibieron su moto${v.mediana !== null && v.maximo !== null ? `; la mitad en ${v.mediana} ${v.mediana === 1 ? "día" : "días"} o menos y la que más tardó, ${v.maximo}` : ""}. Con GPS ${v.conGps} de ${v.hechas}; con fotos ${v.conFoto} de ${v.hechas}.`));
    partes.push(tabla([{ t: "Quién las hizo" }, { t: "Visitas", al: "center" }, { t: "Aprobadas", al: "center" }], v.personas.map(p => [esc(p.nombre.toUpperCase()), String(p.total), String(p.aprobadas)])));
  }

  if (incluye.has("flota")) {
    const f = d.flota;
    abrir("Flota");
    partes.push(sub(`Dónde están las ${f.total} motos hoy`));
    partes.push(tabla([{ t: "Dónde" }, { t: "Motos", al: "center" }, { t: "%", al: "center" }], f.lugares.map(l => [esc(l.etiqueta), String(l.n), pct(l.n, f.total) + "%"])));
    partes.push(tabla([{ t: "Grupo" }, { t: "Motos", al: "center" }, { t: "Trabajando", al: "center" }], f.grupos.map(g => [esc(g.grupo), String(g.total), String(g.trabajando)])));
    partes.push(nota(`Papeles: ${f.papeles.vencidos} con SOAT o tecnomecánica vencidos, ${f.papeles.porVencer} por vencer en 30 días y ${f.papeles.sinSoat} sin la fecha del SOAT anotada. Guardadas sin trabajar: ${f.guardadas.motos} motos, ${f.guardadas.dias} días entre todas.`));
  }

  // ── ANEXOS ──
  const a = d.anexos;
  if (opciones.anexos !== false) {
  abrir("Anexos");
  partes.push(sub("A. Recaudado por cobrador y grupo"));
  partes.push(tabla([{ t: "Cobrador" }, ...a.matriz.grupos.map(g => ({ t: g, al: "right" as const })), { t: "Total", al: "right" }],
    a.matriz.filas.map(f => [esc(f.nombre.toUpperCase()), ...f.celdas.map(c => c > 0 ? plata(c) : "—"), plata(f.total)]),
    ["Total", ...a.matriz.grupos.map((_, i) => plata(a.matriz.filas.reduce((s, f) => s + (f.celdas[i] ?? 0), 0))), plata(a.matriz.filas.reduce((s, f) => s + f.total, 0))]));
  partes.push(nota(`Cada cobrador desde que tiene la moto.${a.matriz.antes > 0 ? ` Antes de asignar: ${plata(a.matriz.antes)}.` : ""}`));
  partes.push(sub("B. Efectivo y transferencias por cobrador"));
  partes.push(tabla([{ t: "Cobrador" }, { t: "Efectivo", al: "right" }, { t: "Transferencias", al: "right" }, { t: "Total", al: "right" }],
    a.metodo.map(m => [esc(m.nombre.toUpperCase()), plata(m.efectivo), plata(m.transferencia), plata(m.efectivo + m.transferencia)]),
    ["Total", plata(a.metodo.reduce((s, m) => s + m.efectivo, 0)), plata(a.metodo.reduce((s, m) => s + m.transferencia, 0)), plata(a.metodo.reduce((s, m) => s + m.efectivo + m.transferencia, 0))]));
  partes.push(sub("C. Clientes que deben y no tienen acuerdo"));
  if (a.sinAcuerdo.length === 0) partes.push(nota("Ninguno."));
  for (const b of a.sinAcuerdo) {
    partes.push(`<div data-con-siguiente style="font-size:11px;font-weight:bold;color:${C.alerta};margin:6px 0 2px">${esc(b.cobrador.toUpperCase())} — ${b.clientes.length} ${b.clientes.length === 1 ? "cliente" : "clientes"} · deben ${plata(b.clientes.reduce((s, x) => s + x.debe, 0))}</div>`);
    partes.push(tabla([{ t: "Cliente" }, { t: "Placa", al: "center" }, { t: "Teléfono", al: "center" }, { t: "Debe", al: "right" }],
      b.clientes.map(x => [esc(x.cliente.toUpperCase()), esc(x.placa), esc(x.telefono || "—"), plata(x.debe)])));
  }
  }

  if (opciones.detalle) {
    const t = d.detalle;
    abrir("Listas completas");
    partes.push(sub(`En mora (${t.enMora.length})`));
    partes.push(tabla([{ t: "Cliente" }, { t: "Placa", al: "center" }, { t: "Grupo", al: "center" }, { t: "Días en mora", al: "center" }, { t: "En el período", al: "center" }, { t: "Debe", al: "right" }],
      t.enMora.map(x => [esc(x.cliente.toUpperCase()), esc(x.placa), esc(x.grupo), String(x.dias), x.pagoPeriodo > 0 ? `Pagó ${plata(x.pagoPeriodo)}` : "No pagó", plata(x.debe)])));
    partes.push(sub(`Retenidas y en liquidación (${t.retenidas.length})`));
    partes.push(tabla([{ t: "Cliente" }, { t: "Placa", al: "center" }, { t: "Grupo", al: "center" }, { t: "Dónde" }, { t: "Debe", al: "right" }],
      t.retenidas.map(x => [esc(x.cliente.toUpperCase()), esc(x.placa), esc(x.grupo), esc(x.donde), plata(x.debe)])));
    partes.push(sub(`Acuerdos atrasados o vencidos (${t.acuerdos.length})`));
    partes.push(tabla([{ t: "Cliente" }, { t: "Placa", al: "center" }, { t: "Acuerdo", al: "right" }, { t: "Pagado", al: "right" }, { t: "Atrasado", al: "right" }, { t: "Vence", al: "center" }],
      t.acuerdos.map(x => [esc(x.cliente.toUpperCase()), esc(x.placa), plata(x.total), plata(x.pagado), plata(x.atrasado), `${esc(x.vence)}${x.estado === "incumplido" ? " (vencido)" : ""}`])));
    partes.push(sub(`Motos guardadas (${t.guardadas.length})`));
    partes.push(tabla([{ t: "Placa", al: "center" }, { t: "Cliente" }, { t: "Por qué" }, { t: "Días", al: "center" }],
      t.guardadas.map(x => [esc(x.placa), esc((x.cliente || "Sin cliente").toUpperCase()), esc(x.motivo), x.dias === null ? "—" : String(x.dias)])));
  }

  return `<div style="font-family:Arial,sans-serif;color:${C.tinta};width:794px;background:#fff">`
    + `<div style="background:${C.navy};color:#fff;padding:14px 18px;display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:19px;font-weight:bold">Informe para los socios</div><div style="font-size:12px;color:#c7dcf2;margin-top:2px">${esc(d.periodo)}</div></div><div style="background:#FFD100;color:#111;font-size:12px;font-weight:bold;padding:5px 10px;border-radius:6px;border:2px solid #111">CLUB MOTEROS CARTAGENA</div></div>`
    + `<div style="padding:6px 18px;background:#f1f5f9;font-size:11px;color:${C.suave}">${esc(d.filtros)} · generado el ${esc(d.generado)}</div>`
    + `<div style="padding:4px 18px 18px">${partes.join("")}`
    + `<div data-no-cortar style="margin-top:18px;border-top:1px solid ${C.linea};padding-top:8px;font-size:9.5px;color:#64748b;text-align:center;line-height:1.5">Las cifras son las mismas que se ven en Reportes, con los mismos filtros. Al día, gabela y en mora son el estado de HOY, la misma cuenta de Cartera; la moto en el taller y la liquidación van aparte.<br>Club Moteros Cartagena · Fredy Mora Avendaño C.C. 1.047.393.901</div>`
    + `</div></div>`;
}

