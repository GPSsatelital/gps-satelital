import React, { useMemo, useState, useEffect } from "react";
import ImgPrivada from "../components/ImgPrivada";
import { primaryBtn } from "../styles/shared";
import type { ViewKey } from "../App";
import { usePagos, esPagoDeCaja, fechaDeCaja, calcularCuotaDia } from "../hooks/usePagos";
import { useContratos, ahorroTotal } from "../hooks/useContratos";
import { useGestiones } from "../hooks/useGestiones";
import { estadoHoy, cumplimientoDelPeriodo, contratosConPlazoVigente, pctCumplimiento, type Cumplimiento } from "../utils/reportesCifras";
import { useClientes } from "../hooks/useClientes";
import { usePrestamos, motoDelPortafolio } from "../hooks/usePrestamos";
import { useCesiones, titularEnFecha } from "../hooks/useCesiones";
import { useSubadmins } from "../hooks/useSubadmins";
import { useMotos } from "../hooks/useMotos";
import { useDeudas } from "../hooks/useDeudas";
import { hoyISO, hoyDate, fechaISO } from "../utils/fecha";
import { useAuth } from "../contexts/AuthContext";
import { useBackGuard } from "../contexts/BackNav";
import { necesitaRegenerar, regenerarDocsContrato } from "../utils/regenerarDocs";
import { generarHTMLResumenEntrega } from "../hooks/useDocumentos";
import { abrirDocumento, firmarImagenesHtml } from "../lib/storagePrivado";
import { formatDiaPago, valorPeriodoReal, type EstadoCartera } from "../utils/cicloPago";
import {
  exportarCSV, descargarExcel, GRUPO_HEX,
  type CeldaX, type ColX, type SeccionX, type SeccionesOpts,
} from "../utils/exportar";
import ModalDescargar, { type ColumnaDescarga, type HojaExtra } from "../components/ModalDescargar";
import Placa from "../components/Placa";
import { useVisitas } from "../hooks/useVisitas";
import { useNominaCierres } from "../hooks/useNominaCierres";
import ModalCerrarNomina from "../components/ModalCerrarNomina";
import { useConvenios } from "../hooks/useConvenios";
import { useUbicaciones } from "../hooks/useUbicaciones";
import { nominaSemanaDetallada, rodadasDesdeRegistros, TEXTO_SIN_GESTION, lunesDe, resumirRenglones, totalesPorGrupo, vigiaCubre, VALOR_CICLO, VALOR_ATRASADO, VALOR_RETENCION, PCT_ATRASADO, VALOR_VISITA, type TipoGestion, type GestionNomina } from "../utils/nominaCobradores";
import { generarDesprendibleNomina } from "../utils/generarDesprendibleNomina";
import { useCajasLlenadas } from "../hooks/useCajasLlenadas";
import { useRodadas } from "../hooks/useRodadas";
import { motosGuardadas } from "../utils/motosGuardadas";
import { reporteConvenios, totalesConvenios } from "../utils/reporteConvenios";
import { MOTIVO_RECEPCION_LABEL, UBICACION_LABEL } from "../hooks/useUbicaciones";
import BarraFiltros from "../components/reportes/BarraFiltros";
import PortafoliosReportes, { type DatosPortafolio } from "../components/reportes/PortafoliosReportes";
import MenuReportes, { type TabReportes } from "../components/reportes/MenuReportes";
import { FlotaMotos, FlotaGuardadas } from "../components/reportes/FlotaReportes";
import ResumenReportes, { type FilaEstado } from "../components/reportes/ResumenReportes";
import HojaDetalle, { type ContenidoDetalle, type FilaDetalle } from "../components/reportes/HojaDetalle";
import { sitioFisico, dondeEstaCadaMoto, LUGARES, type LugarMoto } from "../utils/reportesFlota";
import { desgloseRecaudo, baseDeAcuerdosDeBase, pagosSinRepartir, tramosMora, serieRecaudo, estadoAlCierre, verificarCifras, plataSinProducir } from "../utils/reportesResumen";
import { AlertTriangle, PiggyBank, FileWarning, ChevronRight, Wallet, Download, Printer, CalendarDays, Gauge, ExternalLink, Check, X } from "lucide-react";

interface Props {
  onNavigate?: (view: ViewKey, filter?: string) => void;
}

const card: React.CSSProperties = { background: "var(--card)", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(15,23,42,0.08)" };
function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }
function pct(a: number, b: number) { return b === 0 ? "0%" : `${Math.round((a / b) * 100)}%`; }

type Rango = "hoy" | "semana" | "semana_pasada" | "ult7" | "mes" | "mes_anterior" | "ult30" | "anio" | "personalizado";
type Tab   = TabReportes;

const RANGOS: { key: Rango; label: string }[] = [
  { key: "hoy",           label: "Hoy" },
  { key: "semana",        label: "Esta semana" },
  { key: "semana_pasada", label: "Semana pasada" },
  { key: "ult7",          label: "Últimos 7 días" },
  { key: "mes",           label: "Este mes" },
  { key: "mes_anterior",  label: "Mes anterior" },
  { key: "ult30",         label: "Últimos 30 días" },
  { key: "anio",          label: "Este año" },
  { key: "personalizado", label: "Personalizado" },
];


// Pestañas que NO usan el rango de fechas, con lo que se muestra en su lugar.
const TABS_SIN_FECHA: Partial<Record<Tab, string>> = {
  cartera:   "Esta pestaña muestra cómo está la cartera HOY: no depende de un rango de fechas.",
  convenios: "Esta pestaña muestra los convenios a HOY, desde que se firmó cada uno.",
  nomina:    "La nómina se liquida por semana: usa su propio selector de semana, más abajo.",
  flota:     "Esta pestaña muestra la flota HOY: no depende de un rango de fechas.",
  guardadas: "Esta pestaña muestra las motos guardadas HOY y desde cuándo.",
};

const ANG_LABEL: Record<string, string> = {
  delantera: "Delantera", lateral_izquierdo: "Lateral izq.", arriba: "Arriba",
  lateral_derecho: "Lateral der.", trasera: "Trasera", persona: "Persona + moto",
};
const GRUPOS = ["RASTREADOR", "COSTA", "PRADERA", "USADAS"] as const;
const GRUPO_COLORS: Record<string, string> = {
  RASTREADOR: "var(--accent)", COSTA: "var(--ok2)", PRADERA: "var(--warn2)", USADAS: "var(--orange)",
};

function getRango(r: Rango): { desde: string; hasta: string } {
  const hoy = hoyDate();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const lunesEstaSemana = () => { const l = new Date(hoy); l.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7)); return l; };
  if (r === "hoy")    { const s = iso(hoy); return { desde: s, hasta: s }; }
  if (r === "semana") return { desde: iso(lunesEstaSemana()), hasta: iso(hoy) };
  if (r === "semana_pasada") {
    const l = lunesEstaSemana();
    const f = new Date(l); f.setDate(l.getDate() - 1);   // domingo pasado
    const i = new Date(l); i.setDate(l.getDate() - 7);   // lunes pasado
    return { desde: iso(i), hasta: iso(f) };
  }
  if (r === "ult7")  { const i = new Date(hoy); i.setDate(hoy.getDate() - 6);  return { desde: iso(i), hasta: iso(hoy) }; }
  if (r === "ult30") { const i = new Date(hoy); i.setDate(hoy.getDate() - 29); return { desde: iso(i), hasta: iso(hoy) }; }
  if (r === "mes")    return { desde: iso(hoy).slice(0, 7) + "-01", hasta: iso(hoy) };
  if (r === "mes_anterior") {
    const i = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const f = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    return { desde: iso(i), hasta: iso(f) };
  }
  return { desde: `${hoy.getFullYear()}-01-01`, hasta: iso(hoy) };
}

// "1 al 30 de septiembre de 2026": cómo se dice el período en pantalla (rediseño, 2-oct-2026).
const MESES_LARGO = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MESES_CORTO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function textoRango(d: string, h: string): string {
  const [ya, ma, da] = d.split("-").map(Number);
  const [yb, mb, db] = h.split("-").map(Number);
  if (d === h) return `${da} de ${MESES_LARGO[ma - 1]} de ${ya}`;
  if (ya === yb && ma === mb) return `${da} al ${db} de ${MESES_LARGO[mb - 1]} de ${yb}`;
  if (ya === yb) return `${da} de ${MESES_LARGO[ma - 1]} al ${db} de ${MESES_LARGO[mb - 1]} de ${yb}`;
  return `${da} de ${MESES_LARGO[ma - 1]} de ${ya} al ${db} de ${MESES_LARGO[mb - 1]} de ${yb}`;
}

// Ventana de igual longitud inmediatamente ANTES de [desde, hasta] (para el ▲/▼ de rangos por días).
function rangoAnteriorDe(desde: string, hasta: string): { desde: string; hasta: string } {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const d1 = new Date(desde + "T00:00:00"), d2 = new Date(hasta + "T00:00:00");
  const dias = Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1;
  const antHasta = new Date(d1); antHasta.setDate(d1.getDate() - 1);
  const antDesde = new Date(antHasta); antDesde.setDate(antHasta.getDate() - (dias - 1));
  return { desde: iso(antDesde), hasta: iso(antHasta) };
}

// Período inmediatamente anterior de la misma "longitud", para comparar recaudo (▲/▼).
function getRangoAnterior(r: Rango): { desde: string; hasta: string } {
  const { desde, hasta } = getRango(r);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const dDesde = new Date(desde + "T00:00:00");
  const dHasta = new Date(hasta + "T00:00:00");
  if (r === "hoy") { const a = new Date(dHasta); a.setDate(a.getDate() - 1); return { desde: iso(a), hasta: iso(a) }; }
  if (r === "semana" || r === "semana_pasada" || r === "ult7" || r === "ult30") return rangoAnteriorDe(desde, hasta);
  if (r === "mes") {
    const i = new Date(dDesde.getFullYear(), dDesde.getMonth() - 1, 1);
    const ultimoMesAnt = new Date(dDesde.getFullYear(), dDesde.getMonth(), 0).getDate();
    const f = new Date(dDesde.getFullYear(), dDesde.getMonth() - 1, Math.min(dHasta.getDate(), ultimoMesAnt));
    return { desde: iso(i), hasta: iso(f) };
  }
  if (r === "mes_anterior") {
    const i = new Date(dDesde.getFullYear(), dDesde.getMonth() - 1, 1);
    const f = new Date(dDesde.getFullYear(), dDesde.getMonth(), 0);
    return { desde: iso(i), hasta: iso(f) };
  }
  const i = new Date(dDesde.getFullYear() - 1, 0, 1);
  const f = new Date(dHasta.getFullYear() - 1, dHasta.getMonth(), dHasta.getDate());
  return { desde: iso(i), hasta: iso(f) };
}
// Delta formateado para el ▲/▼ vs período anterior.
function deltaRecaudo(actual: number, anterior: number): { txt: string; up: boolean | null } {
  if (anterior <= 0) return { txt: anterior === 0 && actual > 0 ? "nuevo" : "—", up: null };
  const d = actual - anterior;
  const pct = Math.round((d / anterior) * 100);
  return { txt: `${d >= 0 ? "▲" : "▼"} ${Math.abs(pct)}%`, up: d >= 0 };
}

function BarraN({ label, valor, total, color }: { label: string; valor: number; total: number; color: string }) {
  const p = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
        <span style={{ fontWeight: 600, color: "var(--muted2)" }}>{label}</span>
        <span style={{ color: "var(--muted)" }}>{valor} <span style={{ color: "var(--faint)" }}>({p}%)</span></span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "var(--soft)", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 999, width: `${p}%`, background: color, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

function KPI({ label, value, sub, color, bg }: { label: string; value: string; sub?: string; color?: string; bg?: string }) {
  const icon = KPI_ICONS[label];
  return (
    <div style={{ ...card, background: bg ?? "var(--card)", padding: "14px 16px" }}>
      <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>
        {icon && <span style={{ marginRight: 4 }}>{icon}</span>}{label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color ?? "var(--text)", marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// El motor de descargas (Excel estilizado + CSV) vive en src/utils/exportar.ts — fuente unica
// para que toda pantalla con boton de descargar saque el mismo formato. Ver los imports arriba.

// ── Gráficos del PDF (SVG inline con hex — html2canvas los rasteriza bien) ──
function donutSVG(al: number, par: number, no: number, total: number): string {
  const C = 326.726; // circunferencia r=52
  const seg = (v: number) => (total > 0 ? (v / total) * C : 0);
  const a = seg(al), p = seg(par), nn = seg(no);
  const pctAl = total > 0 ? Math.round((al / total) * 100) : 0;
  return `<svg viewBox="0 0 140 140" width="150" height="150" xmlns="http://www.w3.org/2000/svg">`
    + `<circle cx="70" cy="70" r="52" fill="none" stroke="#eef2f7" stroke-width="22"></circle>`
    + `<g transform="rotate(-90 70 70)" fill="none" stroke-width="22">`
    + `<circle cx="70" cy="70" r="52" stroke="#159a6d" stroke-dasharray="${a} ${C - a}"></circle>`
    + `<circle cx="70" cy="70" r="52" stroke="#e0982a" stroke-dasharray="${p} ${C - p}" stroke-dashoffset="${-a}"></circle>`
    + `<circle cx="70" cy="70" r="52" stroke="#d64545" stroke-dasharray="${nn} ${C - nn}" stroke-dashoffset="${-(a + p)}"></circle>`
    + `</g>`
    + `<text x="70" y="66" text-anchor="middle" font-size="26" font-weight="bold" fill="#0f172a">${pctAl}%</text>`
    + `<text x="70" y="86" text-anchor="middle" font-size="11" fill="#64748b">al día</text></svg>`;
}
function barrasHTML(rows: { label: string; value: number; max: number; color: string; right: string }[]): string {
  return rows.map(r => {
    const w = r.max > 0 ? Math.max(2, Math.round((r.value / r.max) * 100)) : 0;
    return `<div style="margin-bottom:9px">`
      + `<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#475569">${r.label}</span><span style="font-weight:bold;color:#0f172a">${r.right}</span></div>`
      + `<div style="height:12px;background:#eef2f7;border-radius:6px;overflow:hidden"><div style="height:100%;width:${w}%;background:${r.color};border-radius:6px"></div></div></div>`;
  }).join("");
}
function sparklineSVG(vals: number[]): string {
  if (vals.length < 2) return "";
  const w = 240, h = 40, max = Math.max(1, ...vals), den = vals.length - 1;
  const pts = vals.map((v, i) => `${((i / den) * (w - 4) + 2).toFixed(1)},${(h - (v / max) * (h - 6) - 3).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><polyline points="${pts}" fill="none" stroke="#2f6db0" stroke-width="2" stroke-linejoin="round"/></svg>`;
}
function fmtFechaCorta(iso: string) {
  const s = (iso || "").slice(0, 10).split("-");
  return s.length === 3 ? `${s[2]}/${s[1]}/${s[0]}` : (iso || "—");
}

// ── Gestión: fila de moto y bloque (admin o grupo). Una sola base, dos cortes. ──
// Dos preguntas distintas, que antes estaban mezcladas (auditoría del 29-sep, docs/AUDITORIA-REPORTES.md):
//   · CÓMO ESTÁ HOY (al día / gabela / en mora): la MISMA cuenta de Cartera (`estadoHoy`), sin
//     importar el rango de fechas. Antes "Mes anterior" mostraba el estado de hoy como si fuera de agosto.
//   · CUÁNTO CUMPLIÓ EN EL PERÍODO: de lo que vencía, cuánto quedó pagado (`cumplimientoDelPeriodo`).
//     Es lo que sí cambia con la fecha, y lo que ordena el ranking (decisión del dueño, 29-sep).
// "retenida" (D-033, 2-oct): el contrato está detenido por no pagar y la moto no tiene otro cliente,
// esté donde esté (parqueadero, taller, fiscalía). No cuenta ni en el % al día ni en el cumplimiento.
// "taller" (D-034, 2-oct, pedido del 22-ago): el contrato sigue corriendo pero la moto está guardada en
// la empresa (taller, garantía, fiscalía, tránsito). Va aparte: ni al día ni en mora, y no cuenta en
// el % del cobrador — sin la moto el cliente no puede producir.
// "cerrado": contrato cancelado o finalizado que pagó algo en el período. No es una moto a cargo,
// pero su plata entró y tiene que aparecer en algún lado: si no, los grupos no suman el total.
// "reasignada": contrato suspendido cuya moto ya la tiene OTRO cliente con contrato activo — está en
// liquidación. Antes contaba como "retenida" y la moto salía dos veces (29-sep: 7 casos).
type EstadoPagoG = "aldia" | "gabela" | "mora" | "taller" | "retenida" | "cerrado" | "reasignada";
/** Contratos que ya no son una moto a cargo del cobrador: solo aportan la plata que pagaron. */
const fueraDeGestion = (e: EstadoPagoG) => e === "cerrado" || e === "reasignada";
type MotoRowG = { placa: string; cliente: string; monto: number; estado: EstadoPagoG; deudaPend: number; tieneConvenio: boolean; debeSinConvenio: boolean; grupo: string; adminId: string; adminNombre: string; formaPago: string; diaPago: string; ultimaFechaPago: string | null; telefono: string; asignadoDesde: string | null; contratoId: string;
  /** Días que lleva VENCIDA la cuota HOY — la cuenta de Cartera. 0 si no está en mora. */
  diasMora: number;
  /** Todo lo que debe HOY (cuota + acuerdo + deudas), igual que Cartera. */
  debeHoy: number;
  /** Estado de Cartera tal cual (sin la regla de moto guardada): para la pestaña Cartera y el aviso. */
  estadoCartera: EstadoCartera;
  recoleccion: boolean;
  contratoActivo: boolean;
  /** Cuánto cumplió en el período del informe. */
  cum: Cumplimiento;
  /** D-035: lo que cuenta para su cobrador — la plata y el cumplimiento desde que tiene la moto. Lo
   *  que pagó antes de que se la asignaran va en `montoAntes` (no es de nadie: no hay historial). */
  montoSuyo: number;
  montoAntes: number;
  cumSuyo: Cumplimiento;
  /** Día (Colombia) desde el que su cobrador tiene la moto; null si no hay registro (es de antes de la mig 058). */
  asignadaEl: string | null;
};
/** La fila vista desde su cobrador (D-035): su plata y su cumplimiento empiezan el día que le asignaron la moto. */
const comoCobrador = (r: MotoRowG): MotoRowG => r.montoAntes === 0 && r.cumSuyo === r.cum ? r : { ...r, monto: r.montoSuyo, cum: r.cumSuyo };
const CUM_VACIO: Cumplimiento = { debia: 0, cubrio: 0, aAcuerdo: 0, falto: 0, recupero: 0, atrasoAAcuerdo: 0, medible: false };
type BloqueG = { key: string; nombre: string; color?: string; motos: MotoRowG[]; total: number; alDia: number; gabela: number; mora: number; taller: number; retenidas: number; cerrados: number; reasignadas: number; debenSinConvenio: number; recaudado: number; pctv: number; debia: number; cubrio: number; aAcuerdo: number; recupero: number; pctCum: number | null };
/** Las filas que cuentan para el cumplimiento de un cobrador: ni retenidas, ni con la moto en el taller, ni cerradas, y medibles. */
const cuentaParaCumplimiento = (m: MotoRowG) => m.estado !== "retenida" && m.estado !== "taller" && !fueraDeGestion(m.estado) && m.cum.medible;
/** La cola de trabajo: los que DEBEN primero (los ordenan los días de mora), después la gabela,
 *  las guardadas —que no pueden pagar—, las al día y al final los contratos ya cerrados. */
const RANK_COLA: Record<EstadoPagoG, number> = { mora: 0, gabela: 1, taller: 2, retenida: 3, aldia: 4, reasignada: 5, cerrado: 6 };
function agruparBloques(rows: MotoRowG[], modo: "admin" | "grupo"): BloqueG[] {
  const map = new Map<string, MotoRowG[]>();
  rows.forEach(r => {
    const k = modo === "admin" ? r.adminId : r.grupo;
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(r);
  });
  const bloques: BloqueG[] = [...map.entries()].map(([key, motos]) => {
    const alDia = motos.filter(m => m.estado === "aldia").length;
    const gabela = motos.filter(m => m.estado === "gabela").length;
    const mora = motos.filter(m => m.estado === "mora").length;
    const taller = motos.filter(m => m.estado === "taller").length;
    const retenidas = motos.filter(m => m.estado === "retenida").length;
    const cerrados = motos.filter(m => m.estado === "cerrado").length;
    const reasignadas = motos.filter(m => m.estado === "reasignada").length;
    // El % del cobrador se mide sobre las motos que PODÍAN pagar: una guardada en la empresa
    // no puede producir y no debe castigar (ni inflar) su cumplimiento.
    const evaluables = motos.length - retenidas - taller - cerrados - reasignadas;
    const medibles = motos.filter(cuentaParaCumplimiento);
    return {
      key,
      nombre: modo === "admin" ? motos[0].adminNombre : key,
      color: modo === "grupo" ? (GRUPO_COLORS[key] ?? "var(--muted)") : undefined,
      // EL MÁS ATRASADO PRIMERO (pedido del dueño, 25-ago): "el primero es el que está en mora
      // hace más días que los demás". Desde el 29-sep los días son los de Cartera (cuota vencida).
      motos: motos.slice().sort((x, y) =>
        (RANK_COLA[x.estado] - RANK_COLA[y.estado])
        || (y.diasMora - x.diasMora)
        || x.cliente.localeCompare(y.cliente)),
      total: motos.length - cerrados - reasignadas, alDia, gabela, mora, taller, retenidas, cerrados, reasignadas,
      debenSinConvenio: motos.filter(m => m.debeSinConvenio).length,
      recaudado: motos.reduce((s, m) => s + m.monto, 0),
      pctv: evaluables > 0 ? Math.round((alDia / evaluables) * 100) : 0,
      debia: medibles.reduce((s, m) => s + m.cum.debia, 0),
      cubrio: medibles.reduce((s, m) => s + m.cum.cubrio, 0),
      aAcuerdo: medibles.reduce((s, m) => s + m.cum.aAcuerdo, 0),
      recupero: motos.filter(m => !fueraDeGestion(m.estado)).reduce((s, m) => s + m.cum.recupero, 0),
      pctCum: pctCumplimiento(medibles.map(m => m.cum)),
    };
  });
  if (modo === "grupo") {
    const ord = (g: string) => { const i = (GRUPOS as readonly string[]).indexOf(g); return i === -1 ? 99 : i; };
    return bloques.sort((a, b) => ord(a.key) - ord(b.key));
  }
  return bloques.sort((a, b) => (a.key === "__none__" ? 1 : 0) - (b.key === "__none__" ? 1 : 0) || b.recaudado - a.recaudado);
}

type FiltrosG = { grupo: string[]; cobrador: string[]; modalidad: string[]; estado: string[] };
const MODALIDADES = ["Diario", "Semanal", "Quincenal", "Mensual"];
// Los estados son los de HOY (la misma cuenta de Cartera): el rango de fechas no los cambia.
const ESTADOS_FILTRO = [{ v: "aldia", l: "Al día hoy" }, { v: "gabela", l: "Gabela hoy" }, { v: "mora", l: "En mora hoy" }, { v: "taller", l: "Moto en el taller" }, { v: "retenida", l: "🔒 Retenida" }, { v: "sinconvenio", l: "Sin convenio" }];
const FILTROS_VACIOS: FiltrosG = { grupo: [], cobrador: [], modalidad: [], estado: [] };
function FiltrosGestion({ filtros, setFiltros, subadmins, resumen }: { filtros: FiltrosG; setFiltros: React.Dispatch<React.SetStateAction<FiltrosG>>; subadmins: { id: string; nombre: string }[]; resumen: string }) {
  const activos = resumen.length > 0;
  const toggle = (dim: keyof FiltrosG, val: string) => setFiltros(f => ({ ...f, [dim]: f[dim].includes(val) ? f[dim].filter(x => x !== val) : [...f[dim], val] }));
  const chip = (dim: keyof FiltrosG, val: string, label: string) => {
    const on = filtros[dim].includes(val);
    return <button key={dim + val} onClick={() => toggle(dim, val)} style={{ fontSize: 12, fontWeight: 700, padding: "5px 11px", borderRadius: 999, border: `1px solid ${on ? "var(--accent)" : "var(--line2)"}`, background: on ? "var(--accent-soft)" : "var(--card)", color: on ? "var(--accent-ink)" : "var(--muted2)", cursor: "pointer", textTransform: dim === "cobrador" ? "uppercase" : "none", whiteSpace: "nowrap" }}>{on ? "✓ " : ""}{label}</button>;
  };
  const fila = (titulo: string, chips: React.ReactNode) => (
    <div style={{ display: "grid", gap: 5 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>{titulo}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{chips}</div>
    </div>
  );
  return (
    <div style={{ ...card, display: "grid", gap: 11, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>🔎 Filtros <span style={{ fontWeight: 400, fontSize: 11, color: "var(--faint)" }}>· toca varios para combinar</span></div>
        {activos && <button onClick={() => setFiltros(FILTROS_VACIOS)} style={{ fontSize: 12, fontWeight: 700, padding: "4px 9px", borderRadius: 8, border: "1px solid var(--line2)", background: "var(--soft)", color: "var(--muted2)", cursor: "pointer" }}>limpiar</button>}
      </div>
      {fila("Grupo", (GRUPOS as readonly string[]).map(g => chip("grupo", g, g)))}
      {fila("Cobrador", [...subadmins.map(s => chip("cobrador", s.id, s.nombre)), chip("cobrador", "__none__", "Sin asignar")])}
      {fila("Modalidad", MODALIDADES.map(m => chip("modalidad", m, m)))}
      {fila("Estado", ESTADOS_FILTRO.map(x => chip("estado", x.v, x.l)))}
      {activos && <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Mostrando: <b style={{ color: "var(--accent-ink)" }}>{resumen}</b></div>}
    </div>
  );
}

const KPI_ICONS: Record<string, string> = {
  "Total recaudado": "💰",
  "Efectivo": "💵",
  "Transferencias": "📲",
  "Cobro en campo": "🏍️",
};

export default function ReportesView({ onNavigate }: Props) {
  const [rango, setRango] = useState<Rango>("mes");
  const [rangoCustom, setRangoCustom] = useState<{ desde: string; hasta: string }>(() => getRango("ult7")); // rango personalizado de-fecha-a-fecha
  const [tab, setTab]     = useState<Tab>("resumen");
  const [fotosVer, setFotosVer] = useState<{ placa: string; cliente: string; fotos: [string, string][] } | null>(null); // lightbox de fotos de entrega
  useBackGuard(fotosVer !== null, () => setFotosVer(null)); // atrás cierra el lightbox
  // Regeneración de documentos en blanco (bug histórico del PDF)
  const [regen, setRegen] = useState<{ estado: "idle" | "buscando" | "regenerando" | "hecho"; total: number; hechos: number; msg: string }>({ estado: "idle", total: 0, hechos: 0, msg: "" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  // Informes de gestión: lista de sub-admins + fila expandida (drill-down)
  const { subadmins } = useSubadmins();
  const { prestamos } = usePrestamos();
  const { recepciones } = useUbicaciones();   // retenciones de la semana → nómina de cobradores
  // Nómina: por defecto la última semana COMPLETA (lunes a domingo) — la nómina se liquida
  // cuando la semana ya cerró. Las flechas mueven de a una semana.
  const [lunesNomina, setLunesNomina] = useState<string>(() => {
    const d = new Date(lunesDe(hoyISO()) + "T12:00:00");
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [nominaExp, setNominaExp] = useState<string | null>(null);   // drill-down abierto
  const { cesiones } = useCesiones();
  // Filtros combinables (AND) que afinan TODOS los informes de gestión + PDF + Excel.
  const [filtros, setFiltros] = useState<FiltrosG>(FILTROS_VACIOS);
  const [generandoPdf, setGenerandoPdf] = useState(false); // botón del Informe Gerencial (PDF)
  const [expandidoVisita, setExpandidoVisita] = useState<string | null>(null);
  // Armador de impresión: qué secciones incluir + nivel de detalle (por defecto todo detallado)
  const [detalleImpr, setDetalleImpr] = useState(true);
  const [secImpr, setSecImpr] = useState<Record<string, boolean>>({
    kpis: true, recaudoGrupo: true, porAdmin: true, porGrupo: true, visitas: true, mora: true, flota: false, entregas: false,
  });

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const { profile, puede } = useAuth();
  // Un archivo descargado se sale del control de la app (queda en el celular, se reenvía por
  // WhatsApp, sobrevive a que la persona se vaya). Por eso descargar es una acción aparte de ver.
  const puedeExportar = puede("exportar_datos");
  const [descarga, setDescarga] = useState<"admin" | "grupo" | null>(null);
  // La hoja que se abre al tocar un número del Resumen (rediseño, 2-oct-2026).
  const [detalle, setDetalle] = useState<ContenidoDetalle | null>(null);
  const esAdmin       = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";
  const { pagos, loading: cargandoPagos, error: errorPagos } = usePagos();
  const { contratos, loading: cargandoContratos, error: errorContratos } = useContratos();
  const { clientes, loading: cargandoClientes, error: errorClientes }  = useClientes();
  const { motos, loading: cargandoMotos, error: errorMotos }     = useMotos();
  const { deudas }    = useDeudas();
  const { visitas }   = useVisitas();
  const { convenios, convenioPorCobrarDelContrato, loading: cargandoConvenios, error: errorConvenios } = useConvenios();
  // Mientras llegan los datos de la primera carga las cuentas dan cero, y un $0 con el sello verde
  // se lee como "no entró nada y todo cuadra". Se dice "cargando" (o "no se pudo") en vez de eso.
  const cargandoDatos = cargandoPagos || cargandoContratos || cargandoClientes || cargandoMotos || cargandoConvenios;
  const errorDatos = [errorPagos, errorContratos, errorClientes, errorMotos, errorConvenios].find(Boolean) ?? null;
  const sinDatos = (pagos.length === 0 || contratos.length === 0) && (cargandoDatos || !!errorDatos);

  // ── NÓMINA DE COBRADORES (regla del dueño, 22-ago — memoria regla-nomina-cobradores) ──
  const domingoNomina = useMemo(() => {
    const d = new Date(lunesNomina + "T12:00:00");
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  }, [lunesNomina]);
  // Las anotaciones del vigía (mig 112). null = semana sin anotaciones (anterior a la migración)
  // → la nómina cae al método viejo y la pantalla lo avisa.
  // Se piden 12 semanas hacia atrás: con la regla del paquete (23-ago), una caja llena de una
  // semana vieja se vuelve renglón ESTA semana si la cuota de convenio que le faltaba recién
  // entró — la nómina filtra por la fecha del paquete completo, no por la del evento.
  const desdeEventosNomina = useMemo(() => {
    const d = new Date(lunesNomina + "T12:00:00");
    d.setDate(d.getDate() - 84);
    return d.toISOString().slice(0, 10);
  }, [lunesNomina]);
  const [intentoNomina, setIntentoNomina] = useState(0);
  const { eventos: eventosNomina, cargando: cargandoCajas, error: errorCajas } = useCajasLlenadas(desdeEventosNomina, domingoNomina, tab === "nomina", intentoNomina);
  // Las rodadas con su fecha: cada semana se paga según cómo estaba el día en que se cobró (30-sep).
  const { registros: registrosRodadas, cargando: cargandoRodadas, error: errorRodadas } = useRodadas(tab === "nomina" || tab === "resumen", intentoNomina);
  const rodadasNomina = useMemo(() => {
    if (!registrosRodadas) return null;
    const formaPago = new Map(contratos.map(c => [c.id, c.forma_pago]));
    return rodadasDesdeRegistros(registrosRodadas.acuerdos, registrosRodadas.auditoria, id => formaPago.get(id), ts => fechaISO(new Date(ts)));
  }, [registrosRodadas, contratos]);
  // Semanas ya pagadas (mig 120): cifras congeladas + firma + foto del desprendible.
  const { cerrarSemana, cierreDe, cargando: cargandoCierres, error: errorCierres, recargar: recargarCierres } = useNominaCierres(lunesNomina, tab === "nomina");
  // Un cierre congela la cifra para siempre: no se deja pagar ni imprimir mientras falte algo de la
  // semana (las cajas, las rodadas, los cierres o los pagos). Si algo falló, se dice y no se paga.
  const nominaCargando = cargandoCajas || cargandoRodadas || cargandoCierres || sinDatos;
  const nominaError = errorCajas || errorRodadas || errorCierres || (!!errorDatos && sinDatos);
  const nominaLista = !nominaCargando && !nominaError;
  const reintentarNomina = () => { setIntentoNomina(i => i + 1); void recargarCierres(); };
  const [cerrando, setCerrando] = useState<string | null>(null);   // subadminId en curso
  const nominaDetalle = useMemo(() => {
    if (tab !== "nomina") return { nominas: [], sinGestion: [] };
    return nominaSemanaDetallada({
      desde: lunesNomina,
      hasta: domingoNomina,
      contratos,
      pagos,
      motos: motos.map(m => ({ id: m.id, placa: m.placa, subadmin_id: m.subadmin_id ?? null, grupo: m.grupo ?? null })),
      recepciones,
      clientesPorId: new Map(clientes.map(c => [c.id, c.nombre])),
      eventos: eventosNomina,
      convenios: convenios.map(cv => ({ contrato_id: cv.contrato_id, cuota_por_periodo: cv.cuota_por_periodo, numero_cuotas: cv.numero_cuotas, periodos_exonerados: cv.periodos_exonerados, created_at: cv.created_at })),
      visitas: visitas.map(v => ({ id: v.id, cliente_id: v.cliente_id, realizada_por: v.realizada_por ?? null, fecha: v.fecha, estado: v.estado })),
      // Quién trajo a cada cliente (mig 153): $30.000 a esa persona en la semana de la entrega.
      referidos: clientes
        .filter(c => c.referido_por_funcionario)
        .map(c => ({ cliente_id: c.id, funcionario_id: c.referido_por_funcionario! })),
      rodadas: rodadasNomina,
    });
  }, [tab, lunesNomina, domingoNomina, contratos, pagos, motos, recepciones, clientes, eventosNomina, convenios, visitas, rodadasNomina]);
  const nominas = nominaDetalle.nominas;
  // EL REVERSO (15-sep): las motos asignadas que NO generaron gestión, agrupadas por cobrador.
  // Sin esto, una moto sin pago desaparecía de la pantalla y no había cómo distinguir "no trabajó"
  // de "el sistema no lo contó" — que es justo lo que el dueño preguntó.
  const sinGestionPorCobrador = useMemo(() => {
    const m = new Map<string, typeof nominaDetalle.sinGestion>();
    for (const x of nominaDetalle.sinGestion) {
      if (!m.has(x.cobradorId)) m.set(x.cobradorId, []);
      m.get(x.cobradorId)!.push(x);
    }
    return m;
  }, [nominaDetalle]);
  /**
   * LO QUE SE MUESTRA. Si una semana ya se cerró, mandan las cifras CONGELADAS de ese día — no las
   * que daría el cálculo de hoy. Sin esto el sello decía "✓ Pagado" al lado de un total que seguía
   * moviéndose con cada pago que entrara después, que es justo lo que el cierre vino a evitar.
   * Se cambia la nómina entera (no solo el total) para que el recuadro de visitas, el de
   * portafolios y el detalle salgan todos del MISMO dato y no puedan contradecirse.
   */
  const nominasVista = useMemo(() => nominas.map(n => {
    const ci = n.subadminId ? cierreDe(n.subadminId) : null;
    if (!ci) return n;
    return { ...resumirRenglones(n.subadminId, (ci.renglones ?? []) as GestionNomina[]), total: Number(ci.total) };
  }), [nominas, cierreDe]);

  /** Cobradores cuya semana cerrada YA NO coincide con lo que daría el cálculo de hoy. */
  const derivaNomina = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of nominas) {
      const ci = n.subadminId ? cierreDe(n.subadminId) : null;
      if (ci && Math.round(Number(ci.total)) !== Math.round(n.total)) m.set(n.subadminId!, n.total);
    }
    return m;
  }, [nominas, cierreDe]);

  const moverSemanaNomina = (dir: -1 | 1) => {
    const d = new Date(lunesNomina + "T12:00:00");
    d.setDate(d.getDate() + dir * 7);
    setLunesNomina(d.toISOString().slice(0, 10));
  };

  // Busca contratos entregados con firmas guardadas pero PDF en blanco, y los regenera con sus
  // firmas/huellas reales (nadie re-firma). On-demand — no corre solo al abrir la pestaña.
  async function regenerarDocumentosEnBlanco() {
    if (regen.estado === "buscando" || regen.estado === "regenerando") return;
    setRegen({ estado: "buscando", total: 0, hechos: 0, msg: "Buscando documentos en blanco…" });
    const entregados = contratos.filter(c => c.fecha_entrega);
    const pendientes: typeof contratos = [];
    for (const c of entregados) {
      if (await necesitaRegenerar(c.id)) pendientes.push(c);
    }
    if (pendientes.length === 0) {
      setRegen({ estado: "hecho", total: 0, hechos: 0, msg: "✅ No hay documentos en blanco para regenerar." });
      return;
    }
    setRegen({ estado: "regenerando", total: pendientes.length, hechos: 0, msg: "" });
    let ok = 0;
    for (let i = 0; i < pendientes.length; i++) {
      const c = pendientes[i];
      const cliente = clientes.find(cl => cl.id === c.cliente_id);
      const moto = c.moto_id ? motos.find(m => m.id === c.moto_id) ?? null : null;
      if (cliente) { try { if (await regenerarDocsContrato(c, cliente, moto)) ok++; } catch { /* sigue con el resto */ } }
      setRegen(r => ({ ...r, hechos: i + 1 }));
    }
    setRegen({ estado: "hecho", total: pendientes.length, hechos: pendientes.length, msg: `✅ ${ok} de ${pendientes.length} documentos regenerados.` });
  }

  const hoyStr = hoyISO();
  const { desde, hasta } = rango === "personalizado" ? rangoCustom : getRango(rango);

  // ── Recaudado hoy ──────────────────────────────────────────────────────────
  const recaudadoHoy = useMemo(() =>
    pagos.filter(p => p.estado === "Confirmado" && fechaDeCaja(p) === hoyStr && esPagoDeCaja(p)).reduce((a, p) => a + p.valor, 0),
    [pagos, hoyStr]);

  // ── Pagos en rango ─────────────────────────────────────────────────────────
  const pagosRango = useMemo(() =>
    pagos.filter(p => p.estado === "Confirmado" && fechaDeCaja(p) >= desde && fechaDeCaja(p) <= hasta && esPagoDeCaja(p)),
    [pagos, desde, hasta]);

  // ── INFORMES DE GESTIÓN ─────────────────────────────────────────────────────
  // Base única: cada moto con su grupo, su cobrador (motos.subadmin_id) y lo que recaudó en el
  // rango. De aquí salen los cortes por cobrador y por grupo, el Resumen, la pestaña Cartera, el
  // Excel, el PDF y la impresión — todos del MISMO dato (auditoría del 29-sep).
  // Grupo y cobrador salen de la moto del PORTAFOLIO: si el cliente anda en una prestada, su
  // recaudo sigue siendo del socio dueño de su moto real, no del socio que prestó.
  const atribucion = useMemo(() => {
    const nombreAdmin = (id: string | null | undefined) =>
      id ? (subadmins.find(s => s.id === id)?.nombre ?? "—") : "Sin asignar";
    const m = new Map<string, { grupo: string; adminId: string; adminNombre: string; formaPago: string; asignadoDesde: string | null }>();
    contratos.forEach(c => {
      const moto = c.moto_id ? motos.find(x => x.id === c.moto_id) : undefined;
      const port = moto ? (motos.find(x => x.id === motoDelPortafolio(c.id, c.moto_id, prestamos)) ?? moto) : undefined;
      m.set(c.id, {
        grupo: port?.grupo ?? "SIN GRUPO",
        adminId: port?.subadmin_id ?? "__none__",
        adminNombre: nombreAdmin(port?.subadmin_id),
        formaPago: c.forma_pago ?? "—",
        asignadoDesde: port?.subadmin_asignado_desde ?? null,
      });
    });
    return m;
  }, [contratos, motos, prestamos, subadmins]);
  // D-035: desde qué día responde el cobrador de hoy por cada moto; lo pagado antes no es suyo.
  const asignadaElDe = (contratoId: string) => { const a = atribucion.get(contratoId)?.asignadoDesde; return a ? fechaISO(new Date(a)) : null; };
  const pagoAntesDeAsignar = (pg: (typeof pagosRango)[number]) => { const a = asignadaElDe(pg.contrato_id); return !!a && fechaDeCaja(pg) < a; };
  const { gestiones, cargarHistorialCompleto: cargarGestionesViejas } = useGestiones();
  // De arranque se bajan solo las gestiones de los últimos 120 días. Si en Por admin se mira un
  // período más viejo, se trae el resto: si no, "lo que hizo" saldría en cero sin avisar.
  useEffect(() => {
    if (tab !== "admins") return;
    const limite = new Date(); limite.setDate(limite.getDate() - 115);
    if (desde < fechaISO(limite)) void cargarGestionesViejas();
  }, [tab, desde]); // eslint-disable-line react-hooks/exhaustive-deps
  const plazosVigentes = useMemo(() => contratosConPlazoVigente(gestiones, hoyStr), [gestiones, hoyStr]);

  const baseGestion = useMemo<MotoRowG[]>(() => {
    const hoy = hoyDate();
    const recaudoPorContrato = new Map<string, number>();
    const pagosRangoPor = new Map<string, typeof pagosRango>();
    pagosRango.forEach(p => {
      recaudoPorContrato.set(p.contrato_id, (recaudoPorContrato.get(p.contrato_id) ?? 0) + p.valor);
      if (!pagosRangoPor.has(p.contrato_id)) pagosRangoPor.set(p.contrato_id, []);
      pagosRangoPor.get(p.contrato_id)!.push(p);
    });
    // pagos confirmados por contrato (la mora y el cumplimiento necesitan el historial completo)
    const confPorContrato = new Map<string, typeof pagos>();
    pagos.filter(p => p.estado === "Confirmado").forEach(p => {
      if (!confPorContrato.has(p.contrato_id)) confPorContrato.set(p.contrato_id, []);
      confPorContrato.get(p.contrato_id)!.push(p);
    });
    // Solo las deudas 'pendiente': las que ya quedaron dentro de un convenio se cobran en su cuota.
    const deudasPendPorContrato = new Map<string, typeof deudas>();
    deudas.filter(d => d.estado === "pendiente").forEach(d => {
      if (!deudasPendPorContrato.has(d.contrato_id)) deudasPendPorContrato.set(d.contrato_id, []);
      deudasPendPorContrato.get(d.contrato_id)!.push(d);
    });
    // Estados de moto que significan "guardada en la empresa": el cliente NO la tiene y no puede
    // producir — su fila sale como 🔒 Retenida, no como mora (pedido del dueño, 22-ago).
    const MOTO_GUARDADA = new Set(["Recuperada", "Mantenimiento", "Fiscalia", "Transito", "Garantia"]);
    const rows: MotoRowG[] = [];
    // Los Suspendidos también entran: son justamente las retenidas, y el dueño necesita verlas
    // contadas, no invisibles. Los cancelados y finalizados entran SOLO si pagaron algo en el
    // período, para que esa plata aparezca en su grupo y su cobrador (29-sep: eran $1.035.200).
    // Motos que ya tienen un contrato ACTIVO: si además figuran en un contrato suspendido, ese otro
    // cliente está en liquidación y la moto no es suya (29-sep: 7 casos contados dos veces).
    const motosConContratoActivo = new Set(contratos.filter(c => c.estado === "Activo" && c.moto_id).map(c => c.moto_id));
    contratos.forEach(c => {
      const vigente = c.estado === "Activo" || c.estado === "Suspendido";
      const cerrado = (c.estado === "Cancelado" || c.estado === "Finalizado") && (recaudoPorContrato.get(c.id) ?? 0) > 0;
      if (!vigente && !cerrado) return;
      if (vigente && !c.moto_id) return;
      const moto = c.moto_id ? motos.find(m => m.id === c.moto_id) : undefined;
      if (vigente && !moto) return;
      const at = atribucion.get(c.id)!;
      // D-033: retenida = contrato detenido por no pagar, esté donde esté la moto (o la moto ya
      // recogida aunque el contrato siga activo). D-034: contrato andando con la moto en el taller,
      // garantía, fiscalía o tránsito → aparte.
      const detenida = c.estado === "Suspendido" || moto?.estado === "Recuperada";
      const enTaller = !detenida && MOTO_GUARDADA.has(moto?.estado ?? "");
      const monto = recaudoPorContrato.get(c.id) ?? 0;
      const confirmados = confPorContrato.get(c.id) ?? [];
      const deudasPend = deudasPendPorContrato.get(c.id) ?? [];
      // La MISMA cuenta de Cartera (acuerdo activo o incumplido, plazo extra, deudas pendientes).
      const convenioACobrar = convenioPorCobrarDelContrato(c.id);
      const recaudadoHoyC = confirmados.filter(p => fechaDeCaja(p) === hoyStr && esPagoDeCaja(p)).reduce((s, p) => s + p.valor, 0);
      const e = estadoHoy(c as never, confirmados as never, deudasPend as never, convenioACobrar as never, hoy, hoyStr, plazosVigentes,
        c.forma_pago === "Diario"
          ? { toca: calcularCuotaDia(c.tarifa_diaria ?? 27000, new Date().getDay() === 0, c.tarifa_domingo), pagado: recaudadoHoyC }
          : undefined,
        { estado: moto?.estado, conPrestada: prestamos.some(p => p.contrato_id === c.id && p.estado === "activo") });
      const cum = cumplimientoDelPeriodo(c as never, confirmados as never,
        convenios.filter(cv => cv.contrato_id === c.id) as never, desde, hasta, fechaDeCaja as never);
      const deudaP = deudasPend.reduce((s, d) => s + d.monto_pendiente, 0);
      const tieneConvenio = !!convenioACobrar;
      const reasignada = c.estado === "Suspendido" && motosConContratoActivo.has(c.moto_id);
      const estado: EstadoPagoG = cerrado ? "cerrado" : reasignada ? "reasignada" : detenida ? "retenida" : enTaller ? "taller"
        : e.estado === "mora" ? "mora" : e.estado === "gabela" ? "gabela" : "aldia";
      const cli = clientes.find(cl => cl.id === c.cliente_id);
      const ultimaFechaPago = confirmados.reduce<string | null>((mx, p) => (!mx || p.fecha > mx ? p.fecha : mx), null);
      rows.push({
        placa: moto?.placa ?? "—",
        cliente: cli?.nombre ?? "Sin cliente",
        monto, estado, deudaPend: deudaP, tieneConvenio,
        debeSinConvenio: !cerrado && !reasignada && deudaP > 0 && !tieneConvenio,
        grupo: at.grupo,
        adminId: at.adminId,
        adminNombre: at.adminNombre,
        formaPago: at.formaPago,
        diaPago: formatDiaPago(c as never),
        ultimaFechaPago,
        telefono: cli?.telefono ?? "",
        asignadoDesde: at.asignadoDesde,
        contratoId: c.id,
        diasMora: e.estado === "mora" ? e.diasMora : 0,
        debeHoy: cerrado ? 0 : e.debeHoy,
        estadoCartera: e.estado,
        recoleccion: c.estado === "Activo" && e.recoleccion,
        contratoActivo: c.estado === "Activo",
        cum,
        ...(() => {
          // D-035: desde qué día responde su cobrador por esta moto.
          const asignadaEl = at.asignadoDesde ? fechaISO(new Date(at.asignadoDesde)) : null;
          if (!asignadaEl || asignadaEl <= desde) return { montoSuyo: monto, montoAntes: 0, cumSuyo: cum, asignadaEl };
          const montoAntes = (pagosRangoPor.get(c.id) ?? []).filter(p => fechaDeCaja(p) < asignadaEl).reduce((s, p) => s + p.valor, 0);
          const cumSuyo = asignadaEl > hasta ? CUM_VACIO : cumplimientoDelPeriodo(c as never, confirmados as never,
            convenios.filter(cv => cv.contrato_id === c.id) as never, asignadaEl, hasta, fechaDeCaja as never);
          return { montoSuyo: monto - montoAntes, montoAntes, cumSuyo, asignadaEl };
        })(),
      });
    });
    return rows;
  }, [contratos, motos, clientes, pagos, pagosRango, deudas, convenios, atribucion, plazosVigentes, convenioPorCobrarDelContrato, prestamos, hoyStr, desde, hasta]);

  // ── MOTOS GUARDADAS: las que no están produciendo (pedido del dueño, 25-ago) ──
  // Todo derivado: el estado dice que está guardada, la última recepción dice desde cuándo y
  // por qué. Sin recepción → se marca, no se inventa. La lógica y sus pruebas viven en
  // `motosGuardadas.ts` para que esta pantalla solo pinte.
  const guardadas = useMemo(() => motosGuardadas(
    motos, recepciones, contratos,
    new Map(clientes.map(c => [c.id, c.nombre])),
    new Map(subadmins.map(s => [s.id, s.nombre])),
    hoyISO(),
    m => MOTIVO_RECEPCION_LABEL[m as keyof typeof MOTIVO_RECEPCION_LABEL] ?? m,
    u => UBICACION_LABEL[u as keyof typeof UBICACION_LABEL] ?? u,
  ), [motos, recepciones, contratos, clientes, subadmins]);

  // ── CONVENIOS: cómo se han pagado desde que se firmaron (pedido del dueño, 25-ago) ──
  // Lo exigido lo calcula `faltaDelAcuerdo` (la misma función del cobro), así que este informe
  // no puede decir una cifra distinta de la que ve el funcionario en Cartera.
  const [conveniosTodos, setConveniosTodos] = useState(false);
  const conveniosRep = useMemo(() => reporteConvenios(
    convenios as never, pagos as never, contratos as never,
    new Map(motos.map(m => [m.id, { placa: m.placa, grupo: m.grupo, subadmin_id: m.subadmin_id }])),
    new Map(clientes.map(c => [c.id, c.nombre])),
    new Map(subadmins.map(s => [s.id, s.nombre])),
    hoyISO(), !conveniosTodos,
  ), [convenios, pagos, contratos, motos, clientes, subadmins, conveniosTodos]);
  const totConv = useMemo(() => totalesConvenios(conveniosRep), [conveniosRep]);

  // ── FILTROS COMBINABLES (multi-selección) — baseFiltrada es la fuente de TODO ──
  // Array vacío en una dimensión = "todos"; con valores = OR dentro, AND entre dimensiones.
  const baseFiltrada = useMemo(() => baseGestion.filter(r =>
    (filtros.grupo.length === 0 || filtros.grupo.includes(r.grupo)) &&
    (filtros.cobrador.length === 0 || filtros.cobrador.includes(r.adminId)) &&
    (filtros.modalidad.length === 0 || filtros.modalidad.includes(r.formaPago)) &&
    (filtros.estado.length === 0 || filtros.estado.some(e => e === "sinconvenio" ? r.debeSinConvenio : r.estado === e))
  ), [baseGestion, filtros]);
  const nombreCobradorFiltro = (id: string) => id === "__none__" ? "Sin asignar" : (subadmins.find(s => s.id === id)?.nombre ?? "cobrador");
  const ESTADO_LBL: Record<string, string> = { aldia: "al día hoy", gabela: "gabela hoy", mora: "en mora hoy", taller: "moto en el taller", retenida: "retenida", sinconvenio: "sin convenio" };
  const filtrosResumen = [
    ...filtros.grupo,
    ...filtros.cobrador.map(nombreCobradorFiltro),
    ...filtros.modalidad,
    ...filtros.estado.map(e => ESTADO_LBL[e] ?? e),
  ].join(" · ");
  const filtrosActivos = filtrosResumen.length > 0;
  const filtrosSlug = [
    ...filtros.grupo,
    ...filtros.cobrador.map(id => nombreCobradorFiltro(id).replace(/\s+/g, "_")),
    ...filtros.modalidad,
    ...filtros.estado,
  ].join("_").slice(0, 60);

  const porAdminData = useMemo(() => agruparBloques(baseFiltrada, "admin"), [baseFiltrada]);
  const porGrupoData = useMemo(() => agruparBloques(baseFiltrada, "grupo"), [baseFiltrada]);
  // "Motos" = las que están a cargo (sin los contratos ya cerrados, que solo aportan su plata).
  const motosFiltradas = baseFiltrada.filter(r => !fueraDeGestion(r.estado));
  const gTotMotos = motosFiltradas.length;
  const gAlDia    = motosFiltradas.filter(r => r.estado === "aldia").length;
  const gGabela   = motosFiltradas.filter(r => r.estado === "gabela").length;
  const gMora     = motosFiltradas.filter(r => r.estado === "mora").length;
  const gRetenidas = motosFiltradas.filter(r => r.estado === "retenida").length;
  const gTaller = motosFiltradas.filter(r => r.estado === "taller").length;
  const gDebenSinConv = baseFiltrada.filter(r => r.debeSinConvenio).length;
  const gTotRec   = baseFiltrada.reduce((s, r) => s + r.monto, 0);
  // El % al día UNO SOLO (pantalla, Excel, PDF, impresión): sobre las que podían pagar, sin retenidas.
  const gPctAlDia = gTotMotos - gRetenidas - gTaller > 0 ? Math.round((gAlDia / (gTotMotos - gRetenidas - gTaller)) * 100) : 0;
  // Cumplimiento del período: de lo que vencía, cuánto quedó pagado (decisión del dueño, 29-sep).
  const gMedibles = baseFiltrada.filter(cuentaParaCumplimiento);
  const gDebia = gMedibles.reduce((s, r) => s + r.cum.debia, 0);
  const gCubrio = gMedibles.reduce((s, r) => s + r.cum.cubrio, 0);
  const gPctCum = pctCumplimiento(gMedibles.map(r => r.cum));

  // C1 — comparación vs período anterior. UNA sola regla para todas las pestañas: la ventana del
  // mismo largo inmediatamente antes, y cada pago atribuido a su grupo y cobrador igual que el de
  // ahora. Antes el Resumen comparaba contra el mes anterior completo y "Por cobrador" contra los
  // mismos días pero solo con los contratos vigentes hoy: dos porcentajes distintos para lo mismo.
  const setContratosFiltrados = useMemo(() => new Set(baseFiltrada.map(r => r.contratoId)), [baseFiltrada]);
  const { desde: desdeAnt, hasta: hastaAnt } = useMemo(() => rango === "personalizado" ? rangoAnteriorDe(rangoCustom.desde, rangoCustom.hasta) : getRangoAnterior(rango), [rango, rangoCustom]);
  const recaudoAnteriorCon = (f: FiltrosG) => pagos.filter(p => {
    if (p.estado !== "Confirmado" || !esPagoDeCaja(p)) return false;
    const fc = fechaDeCaja(p);
    if (fc < desdeAnt || fc > hastaAnt) return false;
    const at = atribucion.get(p.contrato_id);
    if (!at) return f.grupo.length === 0 && f.cobrador.length === 0 && f.modalidad.length === 0 && f.estado.length === 0;
    return (f.grupo.length === 0 || f.grupo.includes(at.grupo))
      && (f.cobrador.length === 0 || f.cobrador.includes(at.adminId))
      && (f.modalidad.length === 0 || f.modalidad.includes(at.formaPago))
      // El estado es de hoy: para el período anterior se toman los contratos que hoy cumplen el filtro.
      && (f.estado.length === 0 || setContratosFiltrados.has(p.contrato_id));
  }).reduce((a, p) => a + p.valor, 0);
  const recaudoAnterior = useMemo(() => recaudoAnteriorCon(filtros), [pagos, desdeAnt, hastaAnt, atribucion, filtros, setContratosFiltrados]); // eslint-disable-line react-hooks/exhaustive-deps
  const deltaRec = deltaRecaudo(gTotRec, recaudoAnterior);

  // C3 — ranking de cobradores por CUMPLIMIENTO DEL PERÍODO (excluye "sin asignar"). Antes se
  // ordenaba por % al día de HOY, así que cambiar el mes no lo movía.
  const rankingCobradores = useMemo(() => porAdminData.filter(b => b.key !== "__none__").slice().sort((a, b) => (b.pctCum ?? -1) - (a.pctCum ?? -1) || b.recaudado - a.recaudado), [porAdminData]);

  // C2 — "por convenir": motos con deuda sin convenio por cobrador.
  const porConvenir = useMemo(() => porAdminData.map(b => ({ nombre: b.nombre, motos: b.motos.filter(m => m.debeSinConvenio).slice().sort((x, y) => y.deudaPend - x.deudaPend) })).filter(b => b.motos.length > 0), [porAdminData]);

  // E1 — antigüedad de la mora (aging): tramos por días, con conteo y $ de deuda.
  const aging = useMemo(() => {
    const tr = [{ k: "1–3 días", lo: 1, hi: 3, n: 0, d: 0 }, { k: "4–7 días", lo: 4, hi: 7, n: 0, d: 0 }, { k: "8–15 días", lo: 8, hi: 15, n: 0, d: 0 }, { k: "+15 días", lo: 16, hi: 1e9, n: 0, d: 0 }];
    // Días de la cuenta de Cartera (cuota vencida) y lo que debe HOY — no "días desde el último pago".
    baseFiltrada.filter(r => r.estado === "mora" && r.diasMora > 0).forEach(r => { const b = tr.find(t => r.diasMora >= t.lo && r.diasMora <= t.hi); if (b) { b.n++; b.d += r.debeHoy; } });
    return tr;
  }, [baseFiltrada]);

  // E4 — recaudo por método (efectivo vs transferencia) por cobrador, solo contratos filtrados.
  const metodoPorAdmin = useMemo(() => {
    const adminDe = new Map(baseFiltrada.map(r => [r.contratoId, r.adminNombre]));
    const map = new Map<string, { efectivo: number; transf: number }>();
    pagosRango.forEach(p => {
      if (!setContratosFiltrados.has(p.contrato_id)) return;
      const nom = adminDe.get(p.contrato_id) ?? "—";
      if (!map.has(nom)) map.set(nom, { efectivo: 0, transf: 0 });
      const m = map.get(nom)!;
      if (p.metodo === "Efectivo") m.efectivo += p.valor; else m.transf += p.valor;
    });
    return [...map.entries()].map(([nom, v]) => ({ nom, ...v, total: v.efectivo + v.transf })).sort((a, b) => b.total - a.total);
  }, [pagosRango, baseFiltrada, setContratosFiltrados]);

  // E4 — matriz cobrador × grupo (motos + recaudado por celda).
  const matriz = useMemo(() => {
    const admins = [...new Set(baseFiltrada.map(r => r.adminNombre))];
    // Los 4 grupos y, si hubiera plata en otro (sin grupo), también — si no, la matriz no suma el total.
    const grupos = [...(GRUPOS as readonly string[]).filter(g => baseFiltrada.some(r => r.grupo === g)),
      ...[...new Set(baseFiltrada.map(r => r.grupo))].filter(g => !(GRUPOS as readonly string[]).includes(g))];
    const cell = (nom: string, g: string) => { const rs = baseFiltrada.filter(r => r.adminNombre === nom && r.grupo === g); return { motos: rs.length, rec: rs.reduce((s, r) => s + r.monto, 0) }; };
    return { admins, grupos, cell };
  }, [baseFiltrada]);

  // ── INFORME "Visitas por administrador" ────────────────────────────────────
  const visitasData = useMemo(() => {
    const nombreAdmin = (id: string | null | undefined) =>
      id ? (subadmins.find(s => s.id === id)?.nombre ?? "—") : "Sin asignar / Oficina";
    type VisRow = { cliente: string; fecha: string; estado: string; resultado: string | null; gps: boolean; foto: boolean; estimado: boolean };
    type VisAgg = { key: string; nombre: string; visitas: VisRow[]; aprobadas: number; rechazadas: number; repetir: number; pendientes: number; sinResultado: number; estimadas: number };
    const map = new Map<string, VisAgg>();
    visitas.filter(v => (v.fecha || "").slice(0, 10) >= desde && (v.fecha || "").slice(0, 10) <= hasta).forEach(v => {
      // Se agrupa por QUIÉN LA HIZO, no por a quién se le encargó. Este informe es la base para
      // pagar las visitas: si uno cubre a otro, el pago tiene que ir a quien fue. `realizada_por`
      // se empezó a escribir después, así que las visitas viejas caen a `asignada_a` y se marcan
      // como estimadas — mejor decirlo que dar por exacto un dato que no lo es.
      const quien = v.realizada_por ?? v.asignada_a;
      const estimado = !v.realizada_por;
      const key = quien ?? "__none__";
      if (!map.has(key)) map.set(key, { key, nombre: nombreAdmin(quien), visitas: [], aprobadas: 0, rechazadas: 0, repetir: 0, pendientes: 0, sinResultado: 0, estimadas: 0 });
      const agg = map.get(key)!;
      if (estimado) agg.estimadas++;
      agg.visitas.push({
        cliente: clientes.find(cl => cl.id === v.cliente_id)?.nombre ?? "Sin cliente",
        fecha: (v.fecha || "").slice(0, 10), estado: v.estado, resultado: v.resultado,
        gps: !!v.ubicacion, foto: !!(v.fotos?.clienteFuncionario || v.fotos?.fachada), estimado,
      });
      if (v.estado === "Pendiente") agg.pendientes++;
      else if (v.resultado === "Aprobado") agg.aprobadas++;
      else if (v.resultado === "Rechazado") agg.rechazadas++;
      else if (v.resultado === "Repetir") agg.repetir++;
      // Completada pero sin resultado anotado: antes no caía en ninguna columna y las columnas no
      // sumaban el total (29-sep: 64 visitas en septiembre, 59 en las columnas).
      else agg.sinResultado++;
    });
    return [...map.values()]
      .map(a => ({ ...a, total: a.visitas.length, visitas: a.visitas.slice().sort((x, y) => y.fecha.localeCompare(x.fecha)) }))
      .sort((a, b) => (a.key === "__none__" ? 1 : 0) - (b.key === "__none__" ? 1 : 0) || b.total - a.total);
  }, [visitas, clientes, subadmins, desde, hasta]);

  const rangoLabel = RANGOS.find(r => r.key === rango)?.label ?? "";
  const periodoTxt = `Período: ${rangoLabel} (${desde} → ${hasta}) · Club Moteros Cartagena`;

  // Celdas del Excel (SIN emojis: palabra + relleno de color suave; los montos son NÚMERO real).
  const xEstado = (m: MotoRowG): CeldaX => m.estado === "aldia"
    ? { v: "Al día", color: "#166534", fill: "#dcfce7", align: "center" }
    : m.estado === "gabela"
      ? { v: "Gabela", color: "#92400e", fill: "#fef3c7", align: "center" }
      : m.estado === "taller"
        ? { v: "Moto en el taller", color: "#92400e", fill: "#fef3c7", align: "center" }
      : m.estado === "retenida"
        ? { v: "Retenida", color: "#3730a3", fill: "#e0e7ff", align: "center" }
        : m.estado === "cerrado"
          ? { v: "Contrato cerrado", color: "#475569", fill: "#f1f5f9", align: "center" }
          : m.estado === "reasignada"
            ? { v: "En liquidación (moto reasignada)", color: "#475569", fill: "#f1f5f9", align: "center" }
          : { v: "En mora", color: "#991b1b", fill: "#fee2e2", align: "center" };
  const xPagado = (m: MotoRowG): CeldaX => m.monto > 0 ? { num: m.monto } : { v: "—", align: "center" };
  // Lo del PERÍODO: lo que vencía, lo que quedó cubierto y lo que faltó (decisión del dueño, 29-sep).
  const xDebia = (m: MotoRowG): CeldaX => m.cum.debia > 0 ? { num: m.cum.debia } : { v: "—", align: "center" };
  const xCubrio = (m: MotoRowG): CeldaX => m.cum.debia > 0 ? { num: m.cum.cubrio } : { v: "—", align: "center" };
  const xFaltoPeriodo = (m: MotoRowG): CeldaX => m.cum.falto > 0 ? { num: m.cum.falto, color: "#991b1b" } : { v: "—", align: "center" };
  const xRecupero = (m: MotoRowG): CeldaX => m.cum.recupero > 0 ? { num: m.cum.recupero } : { v: "—", align: "center" };
  const xDebeHoy = (m: MotoRowG): CeldaX => m.debeHoy > 0 ? { num: m.debeHoy, color: "#991b1b" } : { v: "—", align: "center" };
  const xConvenio = (m: MotoRowG): CeldaX => m.tieneConvenio
    ? { v: "Sí", align: "center" }
    : m.debeSinConvenio ? { v: "Falta", color: "#92400e", fill: "#fef3c7", align: "center" } : { v: "—", align: "center" };
  const xModalidad = (m: MotoRowG): CeldaX => ({ v: m.formaPago, align: "center" });
  const xDiaPago = (m: MotoRowG): CeldaX => ({ v: m.diaPago || "—", align: "center" });
  const xUltPago = (m: MotoRowG): CeldaX => ({ v: m.ultimaFechaPago ? fmtFechaCorta(m.ultimaFechaPago) : "sin pagos", align: "center", color: m.ultimaFechaPago ? undefined : "#94a3b8" });
  const xTelefono = (m: MotoRowG): CeldaX => ({ v: m.telefono || "—", align: "center" });
  const xDiasMora = (m: MotoRowG): CeldaX => m.diasMora > 0 ? { v: String(m.diasMora), align: "center", color: m.diasMora > 15 ? "#991b1b" : m.diasMora > 7 ? "#b45309" : "#92400e" } : { v: "—", align: "center" };
  const xLeyenda = "Estado HOY (la misma cuenta de Cartera, no depende del período): Al día · Gabela = venció ayer · En mora = días con la cuota vencida · Retenida = la moto está guardada en la empresa (no cuenta en el % al día ni en el cumplimiento). Del PERÍODO: Vencía = semanas y cuotas de acuerdo que vencían en el período · Cubrió = de eso, lo que quedó pagado al cierre · Recuperó = lo que pagó de atrasos viejos y deudas. Los montos están en pesos.";

  // 12 columnas (col 0 = etiqueta cruzada). Mismas para Por admin (Grupo) y Por grupo (Administrador).
  const colsGestion = (cross: string): ColX[] => [
    { label: cross, ancho: cross === "Administrador" ? 150 : 95 }, { label: "Placa", ancho: 75 }, { label: "Cliente", ancho: 190 },
    { label: "Modalidad", align: "center", ancho: 90 }, { label: "Día de pago", align: "center", ancho: 95 },
    { label: "Estado hoy", align: "center", ancho: 90 },
    { label: "Vencía en el período ($)", align: "right", ancho: 130 },
    { label: "Cubrió ($)", align: "right", ancho: 105 },
    { label: "Faltó ($)", align: "right", ancho: 100 },
    { label: "Pagó en el período ($)", align: "right", ancho: 125 },
    { label: "Recuperó atrasos ($)", align: "right", ancho: 125 },
    { label: "Debe hoy ($)", align: "right", ancho: 105 }, { label: "Días mora hoy", align: "center", ancho: 85 }, { label: "Últ. pago", align: "center", ancho: 90 },
    { label: "Teléfono", align: "center", ancho: 105 }, { label: "Convenio", align: "center", ancho: 75 },
  ];

  // Hoja "Resumen": ranking de cobradores + por grupo + comparación de recaudo.
  function hojaResumen(): SeccionesOpts {
    const cols: ColX[] = [
      { label: "#", align: "center", ancho: 40 }, { label: "Cobrador / Grupo", ancho: 170 },
      { label: "Cumplió período", align: "center", ancho: 90 }, { label: "Vencía ($)", align: "right", ancho: 110 },
      { label: "Cubrió ($)", align: "right", ancho: 110 }, { label: "Recaudado ($)", align: "right", ancho: 110 },
      { label: "Motos", align: "center", ancho: 60 }, { label: "Al día hoy", align: "center", ancho: 70 },
      { label: "Gabela hoy", align: "center", ancho: 70 }, { label: "En mora hoy", align: "center", ancho: 75 },
      { label: "% al día hoy", align: "center", ancho: 80 },
    ];
    const filaBloque = (pos: string, b: BloqueG): CeldaX[] => [
      { v: pos, align: "center" }, b.nombre === b.key ? b.key : b.nombre.toUpperCase(),
      { v: b.pctCum === null ? "—" : `${b.pctCum}%`, align: "center", bold: true }, { num: b.debia }, { num: b.cubrio }, { num: b.recaudado },
      { num: b.total, align: "center" }, { v: String(b.alDia), align: "center", color: "#166534" },
      { v: String(b.gabela), align: "center", color: "#92400e" }, { v: String(b.mora), align: "center", color: "#991b1b" },
      { v: `${b.pctv}%`, align: "center" },
    ];
    return {
      titulo: `Resumen gerencial${filtrosActivos ? " — " + filtrosResumen : ""}`, periodo: periodoTxt,
      leyenda: `Recaudo $ ${fmt(gTotRec)} · anterior $ ${fmt(recaudoAnterior)} (${deltaRec.txt}) · cumplimiento del período ${gPctCum === null ? "—" : gPctCum + "%"} (cubrió $ ${fmt(gCubrio)} de $ ${fmt(gDebia)} que vencía) · ${gDebenSinConv} deben sin convenio. Al día / gabela / mora son de HOY.`,
      columnas: cols,
      secciones: [
        { titulo: "Ranking de cobradores (por cumplimiento del período)", color: "#0f2740", filas: rankingCobradores.map((b, i) => filaBloque(String(i + 1), b)) },
        { titulo: "Por grupo", color: "#334155", filas: porGrupoData.map(b => filaBloque("", b)) },
      ],
      totalGeneral: ["", { v: "TOTAL", bold: true }, { v: gPctCum === null ? "—" : `${gPctCum}%`, align: "center", bold: true }, { num: gDebia, bold: true }, { num: gCubrio, bold: true }, { num: gTotRec, bold: true }, { num: gTotMotos, align: "center", bold: true }, { v: String(gAlDia), align: "center", bold: true }, { v: String(gGabela), align: "center", bold: true }, { v: String(gMora), align: "center", bold: true }, { v: `${gPctAlDia}%`, align: "center", bold: true }],
    };
  }
  // Hoja "Por convenir": deudores sin convenio por cobrador (tarea de la semana).
  function hojaConvenir(): SeccionesOpts {
    const cols: ColX[] = [
      { label: "Cliente", ancho: 200 }, { label: "Placa", ancho: 80 }, { label: "Teléfono", align: "center", ancho: 120 },
      { label: "Modalidad", align: "center", ancho: 95 }, { label: "Debe ($)", align: "right", ancho: 100 },
    ];
    const secciones: SeccionX[] = porConvenir.map(b => ({
      titulo: `${b.nombre.toUpperCase()}   —   ${b.motos.length} por convenir · debe $ ${fmt(b.motos.reduce((s, m) => s + m.deudaPend, 0))}`,
      color: "#92400e",
      filas: b.motos.map(m => [m.cliente.toUpperCase(), m.placa, { v: m.telefono || "—", align: "center" as const }, { v: m.formaPago, align: "center" as const }, { num: m.deudaPend, color: "#991b1b" }]),
    }));
    return {
      titulo: "Por convenir — tarea de la semana", periodo: periodoTxt,
      leyenda: "Motos con deuda vieja y SIN convenio. La gestión del cobrador es ponerles convenio.",
      columnas: cols,
      secciones: secciones.length ? secciones : [{ titulo: "Sin pendientes por convenir", color: "#166534", filas: [] }],
    };
  }
  // Hoja "Aging": antigüedad de la mora por tramos.
  function hojaAging(): SeccionesOpts {
    const cols: ColX[] = [{ label: "Antigüedad", ancho: 130 }, { label: "Motos", align: "center", ancho: 90 }, { label: "Deuda ($)", align: "right", ancho: 130 }];
    const colorTramo = ["#92400e", "#b45309", "#c2410c", "#991b1b"];
    const filas: CeldaX[][] = aging.map((t, i) => [{ v: t.k, color: colorTramo[i], bold: true }, { num: t.n, align: "center" as const }, { num: t.d }]);
    const totN = aging.reduce((s, t) => s + t.n, 0), totD = aging.reduce((s, t) => s + t.d, 0);
    return {
      titulo: "Antigüedad de la mora (aging)", periodo: periodoTxt,
      leyenda: "Motos en mora HOY agrupadas por días con la cuota vencida (la cuenta de Cartera). La deuda es todo lo que deben hoy.",
      columnas: cols, secciones: [{ titulo: "Tramos de mora", color: "#0f2740", filas }],
      totalGeneral: [{ v: "TOTAL EN MORA", bold: true }, { num: totN, align: "center", bold: true }, { num: totD, bold: true }],
    };
  }
  // Hoja "Método": recaudo efectivo vs transferencia por cobrador.
  function hojaMetodo(): SeccionesOpts {
    const cols: ColX[] = [{ label: "Cobrador", ancho: 170 }, { label: "Efectivo ($)", align: "right", ancho: 120 }, { label: "Transferencia ($)", align: "right", ancho: 130 }, { label: "Total ($)", align: "right", ancho: 120 }];
    const filas: CeldaX[][] = metodoPorAdmin.map(m => [m.nom.toUpperCase(), { num: m.efectivo }, { num: m.transf }, { num: m.total, bold: true }]);
    const tE = metodoPorAdmin.reduce((s, m) => s + m.efectivo, 0), tT = metodoPorAdmin.reduce((s, m) => s + m.transf, 0);
    return {
      titulo: "Recaudo por método", periodo: periodoTxt,
      leyenda: "Efectivo vs transferencia por cobrador (control y conciliación de caja).",
      columnas: cols, secciones: [{ titulo: "Por cobrador", color: "#0f2740", filas: filas.length ? filas : [] }],
      totalGeneral: [{ v: "TOTAL", bold: true }, { num: tE, bold: true }, { num: tT, bold: true }, { num: tE + tT, bold: true }],
    };
  }
  // Hoja "Matriz": cobrador × grupo (recaudado por celda).
  function hojaMatriz(): SeccionesOpts {
    const cols: ColX[] = [{ label: "Cobrador", ancho: 160 }, ...matriz.grupos.map(g => ({ label: g, align: "right" as const, ancho: 110 })), { label: "Total ($)", align: "right" as const, ancho: 120 }];
    const filas: CeldaX[][] = matriz.admins.map(nom => {
      let tot = 0;
      const celdas: CeldaX[] = [nom.toUpperCase(), ...matriz.grupos.map(g => { const c = matriz.cell(nom, g); tot += c.rec; return c.motos > 0 ? { num: c.rec, align: "right" as const } : { v: "—", align: "right" as const }; })];
      celdas.push({ num: tot, bold: true });
      return celdas;
    });
    const totalGeneral: CeldaX[] = [{ v: "TOTAL", bold: true }, ...matriz.grupos.map(g => ({ num: matriz.admins.reduce((s, nom) => s + matriz.cell(nom, g).rec, 0), bold: true, align: "right" as const })), { num: gTotRec, bold: true }];
    return { titulo: "Matriz cobrador × grupo (recaudado)", periodo: periodoTxt, leyenda: "Cuánto recaudó cada cobrador en cada grupo. Celda = $ recaudado.", columnas: cols, secciones: [{ titulo: "Recaudado por celda", color: "#0f2740", filas }], totalGeneral };
  }


  // Las 5 hojas de análisis. Antes se anexaban SIEMPRE (la queja del "coloca casi todo");
  // ahora son casillas dentro de la ventana de descarga y arrancan desmarcadas.
  const hojasOpcionales: HojaExtra[] = [
    { nombre: "Resumen", etiqueta: "ranking de cobradores y recaudo por grupo", construir: hojaResumen },
    { nombre: "Aging mora", etiqueta: "la deuda repartida por antigüedad", construir: hojaAging },
    { nombre: "Matriz", etiqueta: "cruce de cobradores contra grupos", construir: hojaMatriz },
    { nombre: "Metodo", etiqueta: "cuánto entró en efectivo y cuánto por transferencia", construir: hojaMetodo },
    { nombre: "Por convenir", etiqueta: "los que deben y no tienen convenio", construir: hojaConvenir },
  ];

  // Las 12 columnas de gestión, ahora como casillas. Cada una saca su celda RICA (con color) de
  // la fila que ya se calculaba: el estado sigue saliendo verde/ámbar/rojo dentro del Excel.
  const columnasGestion = (cross: "grupo" | "admin"): ColumnaDescarga<MotoRowG>[] => {
    const cols = colsGestion(cross === "grupo" ? "Grupo" : "Administrador");
    const campos: ((m: MotoRowG) => CeldaX)[] = [
      m => cross === "grupo" ? m.grupo : m.adminNombre.toUpperCase(),
      m => m.placa, m => m.cliente.toUpperCase(),
      xModalidad, xDiaPago, xEstado, xDebia, xCubrio, xFaltoPeriodo, xPagado, xRecupero, xDebeHoy, xDiasMora, xUltPago, xTelefono, xConvenio,
    ];
    return cols.map((c, i) => ({
      key: `c${i}`, rotulo: c.label, align: c.align, ancho: c.ancho,
      porDefecto: i <= 8,   // hasta "Faltó ($)": lo que se necesita para cobrar
      valor: campos[i],
    }));
  };

  function exportarVisitas() {
    const cols: ColX[] = [
      { label: "Cliente", ancho: 210 }, { label: "Fecha", align: "center", ancho: 90 },
      { label: "Estado", align: "center", ancho: 90 }, { label: "Resultado", align: "center", ancho: 110 },
      { label: "GPS", align: "center", ancho: 55 }, { label: "Foto", align: "center", ancho: 55 },
    ];
    const resTxt = (est: string, res: string | null) => est === "Pendiente" ? "—" : res === "Aprobado" ? "✓ Aprobado" : res === "Rechazado" ? "✗ Rechazado" : res === "Repetir" ? "↻ Repetir" : "—";
    const secciones: SeccionX[] = visitasData.map(a => ({
      titulo: `👤 ${a.nombre.toUpperCase()}   —   ${a.total} visitas · ${a.aprobadas} aprobadas · ${a.rechazadas} rechazadas · ${a.repetir} repetir · ${a.pendientes} pendientes${a.sinResultado ? ` · ${a.sinResultado} sin resultado` : ""}`,
      color: "#334155",
      filas: a.visitas.map(v => [
        v.cliente.toUpperCase(), { v: fmtFechaCorta(v.fecha), align: "center" as const },
        { v: v.estado, align: "center" as const },
        v.estado === "Pendiente" ? { v: "—", align: "center" as const } : { v: resTxt(v.estado, v.resultado), color: v.resultado === "Aprobado" ? "#166534" : v.resultado === "Rechazado" ? "#991b1b" : "#92400e", align: "center" as const },
        { v: v.gps ? "✓" : "—", align: "center" as const }, { v: v.foto ? "✓" : "—", align: "center" as const },
      ]),
    }));
    const tv = visitasData.reduce((s, a) => s + a.total, 0);
    descargarExcel({
      archivo: `visitas_${desde}_a_${hasta}`, titulo: "Visitas por administrador", periodo: periodoTxt, columnas: cols, secciones,
      totalGeneral: [{ v: `TOTAL: ${tv} visitas`, bold: true }, "", "", "", "", ""],
    });
  }

  // ── INFORME GERENCIAL EN PDF (portada + gráficos + estadísticas) — html2canvas→jsPDF ──
  function informeGerencialHTML(): string {
    const esc = (s: string) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // El MISMO % de la pantalla: sobre las motos que podían pagar (sin retenidas). Antes el PDF
    // dividía por todas y decía 64% donde la pantalla decía 77%.
    const pctAld = gPctAlDia;
    const sem = pctAld >= 85 ? "#159a6d" : pctAld >= 70 ? "#e0982a" : "#d64545";
    const th = (t: string, al = "left") => `<th style="background:#0f2740;color:#fff;padding:6px 8px;text-align:${al};font-size:11px">${t}</th>`;
    const td = (t: string, al = "left", color = "#0f172a", bold = false) => `<td style="padding:5px 8px;border-bottom:1px solid #e2e8f0;text-align:${al};font-size:11px;color:${color};${bold ? "font-weight:bold" : ""}">${t}</td>`;
    // PORTADA — KPIs grandes (+Δ, cumplimiento $) + tendencia
    const kpi = (label: string, value: string, color: string, extra = "") => `<div style="flex:1;min-width:104px;background:#f6f8fb;border-radius:10px;padding:10px 12px"><div style="font-size:10.5px;color:#64748b">${label}</div><div style="font-size:20px;font-weight:bold;color:${color}">${value}</div>${extra}</div>`;
    const deltaHtml = recaudoAnterior > 0 ? `<div style="font-size:10px;margin-top:2px;color:${deltaRec.up ? "#0f7a52" : "#a3202d"}">${deltaRec.txt} vs anterior</div>` : "";
    const portada = `<div style="display:flex;gap:9px;flex-wrap:wrap;margin:12px 0 6px">`
      + kpi("Recaudado", "$ " + fmt(gTotRec), "#0f172a", deltaHtml)
      + kpi("Al día hoy", pctAld + "%", sem)
      + kpi("Cumplimiento del período", gPctCum === null ? "—" : gPctCum + "%", "#0f172a", `<div style="font-size:9.5px;margin-top:2px;color:#64748b">cubrió $ ${fmt(gCubrio)} de $ ${fmt(gDebia)}</div>`)
      + kpi("Motos activas", String(gTotMotos), "#0f172a")
      + kpi("Sin convenio", String(gDebenSinConv), "#a35a12")
      + `</div>`;
    const spark = `<div style="margin:2px 0 6px"><div style="font-size:11px;color:#64748b;margin-bottom:2px">Recaudo diario (últimos 14 días, toda la operación)</div>${sparklineSVG(recaudoDiario.map(d => d.total))}</div>`;
    // Dona + barras
    const dona = `<div style="text-align:center"><div style="font-size:13px;font-weight:bold;color:#0f172a;text-align:left;margin-bottom:6px">Estado de la cartera hoy</div>${donutSVG(gAlDia, gGabela, gMora, gTotMotos - gRetenidas - gTaller)}<div style="font-size:11px;color:#334155;margin-top:4px"><span style="color:#159a6d">■</span> Al día ${gAlDia} &nbsp; <span style="color:#e0982a">■</span> Gabela ${gGabela} &nbsp; <span style="color:#d64545">■</span> En mora ${gMora}</div></div>`;
    const maxGrupo = Math.max(1, ...porGrupoData.map(b => b.recaudado));
    const barsGrupo = barrasHTML(porGrupoData.map(b => ({ label: b.key, value: b.recaudado, max: maxGrupo, color: "#2f6db0", right: "$ " + fmt(b.recaudado) })));
    const barsCobr = barrasHTML(rankingCobradores.map(b => ({ label: b.nombre.toUpperCase(), value: b.pctCum ?? 0, max: 100, color: (b.pctCum ?? 0) >= 85 ? "#159a6d" : (b.pctCum ?? 0) >= 70 ? "#e0982a" : "#d64545", right: b.pctCum === null ? "—" : b.pctCum + "%" })));
    const graficos = `<div style="display:flex;gap:22px;align-items:flex-start;margin:6px 0 12px"><div style="flex:0 0 170px">${dona}</div><div style="flex:1"><div style="font-size:13px;font-weight:bold;color:#0f172a;margin-bottom:8px">Recaudo por grupo</div>${barsGrupo}<div style="font-size:13px;font-weight:bold;color:#0f172a;margin:14px 0 8px">Cumplimiento por cobrador</div>${barsCobr}</div></div>`;
    // E1 — aging
    const agN = aging.reduce((s, t) => s + t.n, 0), agColors = ["#f0b32e", "#e0982a", "#d3691a", "#d64545"];
    const agBar = agN > 0 ? `<div style="display:flex;height:14px;border-radius:6px;overflow:hidden;margin:4px 0 5px">${aging.map((t, i) => t.n > 0 ? `<div style="width:${(t.n / agN) * 100}%;background:${agColors[i]}"></div>` : "").join("")}</div>` : "";
    const agingHtml = agN === 0 ? "" : `<div style="font-size:13px;font-weight:bold;color:#0f172a;margin:12px 0 5px">Antigüedad de la mora</div>${agBar}<table style="width:100%;border-collapse:collapse"><tr>${th("Tramo")}${th("Motos", "center")}${th("Deuda", "right")}</tr>${aging.map((t, i) => `<tr>${td(t.k, "left", agColors[i], true)}${td(String(t.n), "center")}${td("$ " + fmt(t.d), "right")}</tr>`).join("")}</table>`;
    // Ranking
    const tablaRanking = rankingCobradores.length < 2 ? "" : `<div style="font-size:13px;font-weight:bold;color:#0f172a;margin:14px 0 5px">Ranking por cobrador</div><table style="width:100%;border-collapse:collapse"><tr>${th("#", "center")}${th("Cobrador")}${th("Cumplió", "center")}${th("Vencía", "right")}${th("Cubrió", "right")}${th("Motos", "center")}${th("Al día hoy", "center")}${th("En mora hoy", "center")}${th("Recaudado", "right")}</tr>${rankingCobradores.map((b, i) => `<tr>${td(String(i + 1), "center")}${td(esc(b.nombre.toUpperCase()))}${td(b.pctCum === null ? "—" : b.pctCum + "%", "center", "#0f172a", true)}${td("$ " + fmt(b.debia), "right")}${td("$ " + fmt(b.cubrio), "right")}${td(String(b.total), "center")}${td(String(b.alDia), "center", "#166534")}${td(String(b.mora), "center", "#991b1b")}${td("$ " + fmt(b.recaudado), "right")}</tr>`).join("")}</table>`;
    // E4 — matriz + método
    const matrizHtml = (matriz.admins.length < 2 && matriz.grupos.length < 2) ? "" : `<div style="font-size:13px;font-weight:bold;color:#0f172a;margin:14px 0 5px">Matriz cobrador × grupo (recaudado)</div><table style="width:100%;border-collapse:collapse"><tr>${th("Cobrador")}${matriz.grupos.map(g => th(g, "right")).join("")}${th("Total", "right")}</tr>${matriz.admins.map(nom => { let tot = 0; const cs = matriz.grupos.map(g => { const c = matriz.cell(nom, g); tot += c.rec; return td(c.motos > 0 ? "$ " + fmt(c.rec) : "—", "right"); }).join(""); return `<tr>${td(esc(nom.toUpperCase()))}${cs}${td("$ " + fmt(tot), "right", "#0f172a", true)}</tr>`; }).join("")}</table>`;
    const metodoHtml = metodoPorAdmin.length === 0 ? "" : `<div style="font-size:13px;font-weight:bold;color:#0f172a;margin:14px 0 5px">Recaudo por método</div><table style="width:100%;border-collapse:collapse"><tr>${th("Cobrador")}${th("Efectivo", "right")}${th("Transferencia", "right")}${th("Total", "right")}</tr>${metodoPorAdmin.map(m => `<tr>${td(esc(m.nom.toUpperCase()))}${td("$ " + fmt(m.efectivo), "right")}${td("$ " + fmt(m.transf), "right")}${td("$ " + fmt(m.total), "right", "#0f172a", true)}</tr>`).join("")}</table>`;
    const convenirHtml = porConvenir.length === 0 ? "" : `<div style="font-size:13px;font-weight:bold;color:#0f172a;margin:16px 0 6px">Por convenir — tarea de la semana</div>${porConvenir.map(b => `<div style="margin-bottom:8px"><div style="background:#fff7ed;color:#92400e;font-weight:bold;font-size:12px;padding:4px 8px;border-radius:5px">${esc(b.nombre.toUpperCase())} — ${b.motos.length} por convenir · debe $ ${fmt(b.motos.reduce((s, m) => s + m.deudaPend, 0))}</div><table style="width:100%;border-collapse:collapse">${b.motos.map(m => `<tr>${td(esc(m.cliente.toUpperCase()))}${td(m.placa, "center")}${td(m.telefono || "—", "center", "#185fa5")}${td(m.formaPago, "center")}${td("debe $ " + fmt(m.deudaPend), "right", "#991b1b", true)}</tr>`).join("")}</table></div>`).join("")}`;
    const titulo = filtrosActivos ? `Informe gerencial — ${esc(filtrosResumen)}` : "Informe gerencial de cartera";
    return `<div style="font-family:Arial,sans-serif;color:#0f172a;width:794px">`
      + `<div style="background:#0f2740;color:#fff;padding:14px 18px;display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:19px;font-weight:bold">${titulo}</div><div style="font-size:12px;color:#7fb2e6;margin-top:2px">Recaudo y gestión por cobrador</div></div><div style="background:#FFD100;color:#111;font-size:12px;font-weight:bold;padding:5px 10px;border-radius:6px;border:2px solid #111">CLUB MOTEROS CARTAGENA</div></div>`
      + `<div style="padding:6px 18px;background:#f1f5f9;font-size:11px;color:#475569">del ${fmtFechaCorta(desde)} al ${fmtFechaCorta(hasta)} &nbsp;·&nbsp; generado ${fmtFechaCorta(hoyISO())}${filtrosActivos ? ` &nbsp;·&nbsp; filtros: ${esc(filtrosResumen)}` : ""}</div>`
      + `<div style="padding:8px 18px 18px">${portada}${spark}${graficos}${agingHtml}${tablaRanking}${matrizHtml}${metodoHtml}${convenirHtml}<div style="margin-top:18px;border-top:1px solid #e2e8f0;padding-top:8px;font-size:10px;color:#94a3b8;text-align:center">Cumplimiento del período = de lo que vencía en el período (semanas y cuotas de acuerdo), cuánto quedó pagado. Al día / gabela / en mora = estado de HOY, la misma cuenta de Cartera. Las motos retenidas no cuentan en ninguno de los dos. El recaudo se atribuye al cobrador que tiene la moto actualmente.<br>Club Moteros Cartagena · Fredy Mora Avendaño C.C. 1.047.393.901</div></div></div>`;
  }

  async function descargarInformePdf() {
    if (generandoPdf) return;
    setGenerandoPdf(true);
    try {
      const html = informeGerencialHTML();
      const { htmlAPdfBlob } = await import("../utils/pdf");
      const blob = await htmlAPdfBlob(html);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `informe_gerencial${filtrosSlug ? "_" + filtrosSlug : ""}_${desde}_a_${hasta}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {
      alert("No se pudo generar el PDF: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setGenerandoPdf(false);
    }
  }

  const totalRecaudado    = pagosRango.reduce((a, p) => a + p.valor, 0);
  const totalEfectivo     = pagosRango.filter(p => p.metodo === "Efectivo").reduce((a, p) => a + p.valor, 0);
  const totalTransferencia= pagosRango.filter(p => p.metodo !== "Efectivo").reduce((a, p) => a + p.valor, 0);

  // ── Recaudo diario últimos 14d ─────────────────────────────────────────────
  const recaudoDiario = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = hoyDate(); d.setDate(d.getDate() - (13 - i));
      const fecha = d.toISOString().slice(0, 10);
      const total = pagos.filter(p => p.estado === "Confirmado" && fechaDeCaja(p) === fecha && esPagoDeCaja(p)).reduce((a, p) => a + p.valor, 0);
      const label = `${["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][d.getDay()]} ${d.getDate()}`;
      return { fecha, total, label };
    });
  }, [pagos]);

  // ── Contratos ──────────────────────────────────────────────────────────────
  const contratosActivos = contratos.filter(c => c.estado === "Activo");
  const contratosPorForma = useMemo(() => {
    const map: Record<string, number> = {};
    contratosActivos.forEach(c => { const k = c.forma_pago ?? "Sin definir"; map[k] = (map[k] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [contratosActivos]);

  // ── Cartera HOY: la MISMA cuenta de Cartera y del Panel (auditoría del 29-sep) ──────────────
  // Antes esta pestaña contaba "en mora" a quien llevara más de 2 días sin pagar: 187 contra los 65
  // reales. Ahora sale de `estadoHoy`, contrato por contrato, con la clasificación de Cartera:
  // se trabaja con los contratos Activos, y las motos retenidas (Suspendidos) van aparte.
  const carteraHoy = useMemo(() => {
    const activos = baseGestion.filter(r => r.contratoActivo);
    const alDia = activos.filter(r => r.estadoCartera === "al-dia").length;
    const gabela = activos.filter(r => r.estadoCartera === "gabela").length;
    const enMora = activos.filter(r => r.estadoCartera === "mora");
    const recoleccion = enMora.filter(r => r.recoleccion).length;
    const retenidas = baseGestion.filter(r => r.estado !== "cerrado" && !r.contratoActivo).length;
    // De esas, las que en realidad están en liquidación: su moto ya la tiene otro cliente.
    const reasignadas = baseGestion.filter(r => r.estado === "reasignada").length;
    // Todo lo que se debe hoy (cuota + acuerdo + deudas), activos y retenidas: la cifra de Cartera.
    const debeHoy = baseGestion.filter(r => r.estado !== "cerrado").reduce((s, r) => s + r.debeHoy, 0);
    const detalle = enMora.slice().sort((a, b) => b.diasMora - a.diasMora || b.debeHoy - a.debeHoy);
    return { activos: activos.length, alDia, gabela, mora: enMora.length, recoleccion, retenidas, reasignadas, debeHoy, detalle };
  }, [baseGestion]);
  const clienteIdDeContrato = useMemo(() => new Map(contratos.map(c => [c.id, c.cliente_id])), [contratos]);
  const motoIdDeContrato = useMemo(() => new Map(contratos.map(c => [c.id, c.moto_id ?? null])), [contratos]);

  // ── Recaudo por grupo (Resumen e impresión): del MISMO dato que "Por grupo", sin filtros ──
  // Antes solo sumaba los contratos Activos por la moto de hoy: a los grupos les faltaban $13.297.200
  // en septiembre (sobre todo lo que pagaron clientes con la moto retenida para recuperarla).
  const reporteGrupos = useMemo(() => {
    const extras = [...new Set(baseGestion.map(r => r.grupo))].filter(g => !(GRUPOS as readonly string[]).includes(g));
    return [...GRUPOS, ...extras].map(grupo => {
      const filas = baseGestion.filter(r => r.grupo === grupo);
      const motosGrupo = motos.filter(m => m.grupo === grupo);
      return {
        grupo,
        motosAsignadas: motosGrupo.filter(m => m.estado === "Asignada").length,
        recaudo: filas.reduce((s, r) => s + r.monto, 0),
        contratosActivos: filas.filter(r => r.contratoActivo).length,
        // En mora HOY con la cuenta de Cartera (contratos activos), la misma del número de arriba y del
        // Panel. En "Por grupo" la moto guardada en taller cuenta como retenida (regla del 22-ago).
        enMora: filas.filter(r => r.contratoActivo && r.estadoCartera === "mora").length,
        pctCum: pctCumplimiento(filas.filter(cuentaParaCumplimiento).map(r => r.cum)),
      };
    }).filter(g => (GRUPOS as readonly string[]).includes(g.grupo) || g.recaudo > 0);
  }, [baseGestion, motos]);
  // Resumen sin filtros: el cumplimiento de toda la operación en el período.
  const cumTotal = useMemo(() => {
    const med = baseGestion.filter(cuentaParaCumplimiento);
    return { debia: med.reduce((s, r) => s + r.cum.debia, 0), cubrio: med.reduce((s, r) => s + r.cum.cubrio, 0), pct: pctCumplimiento(med.map(r => r.cum)) };
  }, [baseGestion]);

  // ── Clientes ───────────────────────────────────────────────────────────────
  // "Clientes con contrato": los que tienen un contrato vigente (activo o con la moto retenida). Antes
  // contaba el estado "Activo" de la ficha: 337 contra 330 reales (29-sep) — 7 figuraban activos sin
  // ningún contrato. Esos se listan aparte para que la oficina los corrija.
  const clientesConContratoIds = new Set(contratos.filter(c => c.estado === "Activo" || c.estado === "Suspendido").map(c => c.cliente_id));
  const clientesActivosSinContrato = clientes.filter(c => c.estado === "Activo" && !clientesConContratoIds.has(c.id));
  const clientesEnProceso   = clientes.filter(c => c.estado === "En proceso" || c.estado === "Aprobado").length;
  const inicioMes           = hoyStr.slice(0, 7) + "-01";
  const clientesNuevosMes   = clientes.filter(c => c.created_at >= inicioMes).length;

  // ── Motos por estado ───────────────────────────────────────────────────────
  const motosPorEstado = useMemo(() => {
    const map: Record<string, number> = {};
    motos.forEach(m => { map[m.estado] = (map[m.estado] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [motos]);

  // ── Alertas vencimiento ────────────────────────────────────────────────────
  const alertasVencimiento = useMemo(() => {
    const hoyMs = hoyDate().getTime();
    const en30 = hoyDate(); en30.setDate(en30.getDate() + 30);
    const iso30 = en30.toISOString().slice(0, 10);
    const dias = (f: string) => Math.round((new Date(f + "T00:00:00").getTime() - hoyMs) / 86400000);
    return motos.filter(m => (m.fecha_seguro && m.fecha_seguro <= iso30) || (m.fecha_tecnomecanica && m.fecha_tecnomecanica <= iso30))
      .map(m => {
        const diasSeguro = m.fecha_seguro ? dias(m.fecha_seguro) : null;
        const diasTecno = m.fecha_tecnomecanica ? dias(m.fecha_tecnomecanica) : null;
        return {
          id: m.id, placa: m.placa,
          seguro: m.fecha_seguro ?? null,
          tecno: m.fecha_tecnomecanica ?? null,
          diasSeguro, diasTecno,
          // Ya vencido (SOAT o tecno) — distinto de "por vencer": el aviso los mezclaba (29-sep).
          vencida: (diasSeguro !== null && diasSeguro < 0) || (diasTecno !== null && diasTecno < 0),
        };
      })
      .sort((a, b) => {
        const ma = Math.min(a.diasSeguro ?? 999, a.diasTecno ?? 999);
        const mb = Math.min(b.diasSeguro ?? 999, b.diasTecno ?? 999);
        return ma - mb;
      });
  }, [motos]);

  // Motos SIN fecha de SOAT: no aparecían en ningún aviso (29-sep: 9 motos, 2 andando en la calle).
  const motosSinSoat = useMemo(() => motos.filter(m => !m.fecha_seguro), [motos]);
  const docsVencidos = alertasVencimiento.filter(a => a.vencida).length;
  const docsPorVencer = alertasVencimiento.length - docsVencidos;

  const diasBase = useMemo(() =>
    contratos.filter(c => c.estado === "Activo" && c.tipo_ruta === "diario" && !c.base_completada && ahorroTotal(c) >= 450000),
    [contratos]);

  // ── Entregas de motos en el rango ──────────────────────────────────────────
  // Reporte para socios: qué motos se entregaron, con qué documentos y evidencia.
  const entregas = useMemo(() => {
    return contratos
      .filter(c => c.fecha_entrega && c.fecha_entrega >= desde && c.fecha_entrega <= hasta)
      .map(c => {
        const cliente = clientes.find(cl => cl.id === c.cliente_id);
        const moto = c.moto_id ? motos.find(m => m.id === c.moto_id) : undefined;
        const fotos = Object.entries(moto?.fotos_entrega ?? {}).filter(([, url]) => !!url) as [string, string][];
        const docs = {
          contrato: !!c.contrato_pdf_url,
          pagare: !!c.pagare_pdf_url,
          certificado: !!c.certificado_pdf_url,
          firma: !!c.firma_cliente,
        };
        const docsOk = docs.contrato && docs.pagare && docs.certificado && docs.firma;
        return {
          id: c.id, clienteId: c.cliente_id, motoId: c.moto_id ?? null,
          fecha: c.fecha_entrega as string,
          cliente: cliente?.nombre ?? "—", cedula: cliente?.cedula ?? "—",
          placa: moto?.placa ?? "—", grupo: (moto?.grupo ?? "—") as string, subadminId: moto?.subadmin_id ?? null,
          km: moto?.kilometraje_inicial ?? null,
          fotos, nFotos: fotos.length,
          docs, docsOk,
          urls: { contrato: c.contrato_pdf_url ?? null, pagare: c.pagare_pdf_url ?? null, certificado: c.certificado_pdf_url ?? null },
          estado: c.estado,
          // Resumen de lo pactado (para el reporte general y el resumen por contrato)
          formaPago: c.forma_pago ?? "—",
          diaPago: formatDiaPago(c as never),
          cuota: valorPeriodoReal(c as never),
          meses: c.meses ?? null,
        };
      })
      .filter(e => (filtros.grupo.length === 0 || filtros.grupo.includes(e.grupo)) && (filtros.cobrador.length === 0 || filtros.cobrador.includes(e.subadminId ?? "__none__")))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [contratos, clientes, motos, desde, hasta, filtros]);
  const grupoEnt = filtros.grupo.length === 1 ? filtros.grupo[0] : "Todos";

  const entregasCompletas   = entregas.filter(e => e.docsOk).length;
  const entregasIncompletas = entregas.length - entregasCompletas;
  const entregasConFotos    = entregas.filter(e => e.nFotos > 0).length;

  // ── Resumen de UNA entrega (por contrato): lo pactado + fotos, en una página ──
  async function verResumenEntrega(e: typeof entregas[number]) {
    const c = contratos.find(ct => ct.id === e.id);
    const cliente = clientes.find(cl => cl.id === e.clienteId);
    const moto = e.motoId ? motos.find(m => m.id === e.motoId) ?? null : null;
    if (!c || !cliente) return;
    const fotos = e.fotos.map(([ang, url]) => ({ label: ANG_LABEL[ang] ?? ang, url }));
    // El navegador usa el <title> como nombre por defecto al "Guardar como PDF".
    const nombreDoc = `Rep_entrega (${e.placa})(${e.cliente})`;
    // La ventana se abre ANTES de firmar las fotos, o el navegador la bloquea por emergente.
    const win = window.open("", "_blank", "width=840,height=920");
    if (!win) return;
    const cuerpo = await firmarImagenesHtml(generarHTMLResumenEntrega(c, cliente, moto, fotos));
    win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${nombreDoc}</title>
      <style>@media print{.no-print{display:none}} body{margin:0;background:var(--soft)}</style></head><body>
      <div class="no-print" style="position:sticky;top:0;background:white;padding:10px 16px;border-bottom:1px solid var(--line);display:flex;justify-content:flex-end">
        <button onclick="window.print()" style="padding:9px 18px;border:none;border-radius:8px;background:var(--accent);color:white;font-weight:700;cursor:pointer">🖨️ Descargar / Imprimir</button>
      </div>${cuerpo}</body></html>`);
    win.document.close();
  }

  // ── Imprimir reporte de entregas (para enviar a los socios) ─────────────────
  function imprimirEntregas() {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    const fechaHoy = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
    const rangoLabel = RANGOS.find(r => r.key === rango)?.label ?? rango;
    const si = "<span style='color:var(--ok-ink);font-weight:700;'>✓</span>";
    const no = "<span style='color:var(--bad-ink);font-weight:700;'>✗</span>";
    const filas = entregas.map(e => `<tr>
      <td style="padding:7px 8px;">${new Date(e.fecha + "T00:00:00").toLocaleDateString("es-CO")}</td>
      <td style="padding:7px 8px;font-weight:700;">${e.placa}</td>
      <td style="padding:7px 8px;">${e.grupo}</td>
      <td style="padding:7px 8px;text-transform:uppercase;">${e.cliente}</td>
      <td style="padding:7px 8px;">${e.cedula}</td>
      <td style="padding:7px 8px;">${e.formaPago}</td>
      <td style="padding:7px 8px;text-align:right;">$ ${fmt(e.cuota)}</td>
      <td style="padding:7px 8px;">${e.diaPago}</td>
      <td style="padding:7px 8px;text-align:center;">${e.meses ? e.meses + "m" : "—"}</td>
      <td style="padding:7px 8px;text-align:center;">${e.docs.contrato && e.docs.pagare && e.docs.certificado && e.docs.firma ? si : no}</td>
      <td style="padding:7px 8px;text-align:center;">${e.nFotos}</td>
    </tr>`).join("");
    win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte de entregas</title><style>body{font-family:Arial,sans-serif;color:var(--text);padding:32px;font-size:13px;}h1{font-size:22px;margin-bottom:4px;}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px;}th{background:var(--soft);padding:8px 10px;text-align:left;font-weight:700;color:var(--muted3);}tr:nth-child(even){background:var(--soft2);}.kpis{display:flex;gap:14px;margin-top:14px;flex-wrap:wrap;}.kpi{border:1px solid var(--line);border-radius:10px;padding:12px 18px;}.kpi-val{font-size:20px;font-weight:800;}footer{margin-top:28px;font-size:11px;color:var(--faint);text-align:center;}</style></head><body>
      <h1>Reporte de entregas de motos</h1>
      <p style="color:var(--muted);margin:0;">Período: <strong>${rangoLabel}</strong> (${desde} → ${hasta}) · Grupo: <strong>${grupoEnt}</strong> · Generado el ${fechaHoy}</p>
      <div class="kpis">
        <div class="kpi"><div class="kpi-val">${entregas.length}</div><div>Motos entregadas</div></div>
        <div class="kpi"><div class="kpi-val" style="color:var(--ok-ink);">${entregasCompletas}</div><div>Documentación completa</div></div>
        <div class="kpi"><div class="kpi-val" style="color:var(--bad-ink);">${entregasIncompletas}</div><div>Documentación incompleta</div></div>
        <div class="kpi"><div class="kpi-val" style="color:var(--accent);">${entregasConFotos}</div><div>Con fotos de entrega</div></div>
      </div>
      ${entregas.length === 0 ? "<p style='color:var(--muted);margin-top:20px;'>No hay entregas en este período.</p>" : `<table><thead><tr><th>Fecha</th><th>Placa</th><th>Grupo</th><th>Cliente</th><th>Cédula</th><th>Modalidad</th><th>Cuota</th><th>Día pago</th><th>Plazo</th><th>Docs</th><th>Fotos</th></tr></thead><tbody>${filas}</tbody></table>`}
      <footer>Club Moteros Cartagena · Fredy Mora Avendaño C.C. 1.047.393.901</footer>
      </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  // ── Armador de impresión: genera UN documento solo con las secciones marcadas ─
  //    Respeta el período elegido arriba. `detalleImpr` decide detalle vs resumen.
  function imprimirSeleccion() {
    if (!Object.values(secImpr).some(Boolean)) return;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    const fechaHoy = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
    const rangoLbl = RANGOS.find(r => r.key === rango)?.label ?? rango;
    const S = secImpr, det = detalleImpr;
    const parts: string[] = [];

    if (S.kpis) parts.push(`<h2>KPIs de recaudo</h2><div class="kpis">
      <div class="kpi"><div class="kpi-val">$ ${fmt(totalRecaudado)}</div><div class="kpi-lbl">Total recaudado</div></div>
      <div class="kpi"><div class="kpi-val">$ ${fmt(totalEfectivo)}</div><div class="kpi-lbl">Efectivo</div></div>
      <div class="kpi"><div class="kpi-val">$ ${fmt(totalTransferencia)}</div><div class="kpi-lbl">Transferencias</div></div>
      <div class="kpi"><div class="kpi-val">${cumTotal.pct === null ? "—" : cumTotal.pct + "%"}</div><div class="kpi-lbl">Cumplimiento del período</div></div>
      <div class="kpi"><div class="kpi-val">${carteraHoy.activos}</div><div class="kpi-lbl">Contratos activos</div></div>
      <div class="kpi"><div class="kpi-val">${carteraHoy.mora}</div><div class="kpi-lbl">En mora hoy</div></div></div>`);

    if (S.recaudoGrupo) {
      const filas = reporteGrupos.map(g => `<tr><td><b>${g.grupo}</b></td><td class="c">${g.motosAsignadas}</td><td class="r">$ ${fmt(g.recaudo)}</td><td class="c">${g.contratosActivos}</td><td class="c" style="color:${g.enMora > 0 ? "#991b1b" : "#166534"};font-weight:700">${g.enMora}</td><td class="c">${g.pctCum === null ? "—" : g.pctCum + "%"}</td></tr>`).join("");
      parts.push(`<h2>Recaudo por grupo</h2><table><thead><tr><th>Grupo</th><th class="c">Motos asignadas</th><th class="r">Recaudo período</th><th class="c">Contratos activos</th><th class="c">En mora hoy</th><th class="c">Cumplió período</th></tr></thead><tbody>${filas}</tbody><tfoot><tr><td><b>TOTAL</b></td><td></td><td class="r"><b>$ ${fmt(reporteGrupos.reduce((s, g) => s + g.recaudo, 0))}</b></td><td></td><td></td><td></td></tr></tfoot></table>`);
    }

    const gDetalle = (bloques: BloqueG[], modo: "admin" | "grupo", cross: string) => {
      const filas = bloques.map(b => {
        const cab = `<tr class="sec"><td colspan="12">${b.nombre.toUpperCase()} — cumplió ${b.pctCum === null ? "—" : b.pctCum + "%"} del período (cubrió $ ${fmt(b.cubrio)} de $ ${fmt(b.debia)}) · recaudado $ ${fmt(b.recaudado)} · HOY: ${b.total} motos, ${b.alDia} al día, ${b.gabela} gabela, ${b.mora} en mora${b.retenidas > 0 ? `, ${b.retenidas} retenida${b.retenidas === 1 ? "" : "s"}` : ""}${b.debenSinConvenio > 0 ? ` · ${b.debenSinConvenio} sin convenio` : ""}</td></tr>`;
        const motos = b.motos.map(m => {
          const e = m.estado === "aldia" ? { t: "Al día", c: "#166534" } : m.estado === "gabela" ? { t: "Gabela", c: "#92400e" } : m.estado === "taller" ? { t: "Moto en el taller", c: "#92400e" } : m.estado === "retenida" ? { t: "Retenida", c: "#3730a3" } : m.estado === "cerrado" ? { t: "Cerrado", c: "#475569" } : m.estado === "reasignada" ? { t: "En liquidación", c: "#475569" } : { t: `En mora ${m.diasMora}d`, c: "#991b1b" };
          const conv = m.tieneConvenio ? "Sí" : (m.debeSinConvenio ? "Falta" : "—");
          const ult = m.ultimaFechaPago ? fmtFechaCorta(m.ultimaFechaPago) : "sin pagos";
          return `<tr><td>${m.placa}</td><td class="up">${m.cliente}</td><td>${modo === "admin" ? m.grupo : m.adminNombre}</td><td class="c">${m.formaPago}</td><td class="c">${m.diaPago || "—"}</td><td class="c" style="color:${e.c};font-weight:700">${e.t}</td><td class="r">${m.monto > 0 ? "$ " + fmt(m.monto) : "—"}</td><td class="r">${m.cum.debia > 0 ? "$ " + fmt(m.cum.cubrio) + " de $ " + fmt(m.cum.debia) : "—"}</td><td class="r" style="${m.debeHoy > 0 ? "color:#991b1b;font-weight:700" : ""}">${m.debeHoy > 0 ? "$ " + fmt(m.debeHoy) : "—"}</td><td class="c">${ult}</td><td class="c">${m.telefono || "—"}</td><td class="c">${conv}</td></tr>`;
        }).join("");
        return cab + motos;
      }).join("");
      return `<table><thead><tr><th>Placa</th><th>Cliente</th><th>${cross}</th><th class="c">Modalidad</th><th class="c">Día pago</th><th class="c">Estado hoy</th><th class="r">Pagó período</th><th class="r">Cubrió del período</th><th class="r">Debe hoy</th><th class="c">Últ. pago</th><th class="c">Teléfono</th><th class="c">Convenio</th></tr></thead><tbody>${filas}</tbody></table>`;
    };
    const gResumen = (bloques: BloqueG[], modo: "admin" | "grupo") => {
      const filas = bloques.map(b => `<tr><td class="up"><b>${modo === "admin" ? "👤 " : ""}${b.nombre}</b></td><td class="c"><b>${b.pctCum === null ? "—" : b.pctCum + "%"}</b></td><td class="c">${b.total}</td><td class="c" style="color:#166534;font-weight:700">${b.alDia}</td><td class="c" style="color:#92400e;font-weight:700">${b.gabela}</td><td class="c" style="color:#991b1b;font-weight:700">${b.mora}</td><td class="c" style="color:#92400e">${b.debenSinConvenio || "—"}</td><td class="r">$ ${fmt(b.recaudado)}</td></tr>`).join("");
      return `<table><thead><tr><th>${modo === "admin" ? "Administrador" : "Grupo"}</th><th class="c">Cumplió período</th><th class="c">Motos</th><th class="c">Al día hoy</th><th class="c">Gabela hoy</th><th class="c">En mora hoy</th><th class="c">Sin conv.</th><th class="r">Recaudado</th></tr></thead><tbody>${filas}</tbody></table>`;
    };

    if (S.porAdmin) parts.push(`<h2>Gestión por administrador${filtrosActivos ? ` — ${filtrosResumen}` : ""}${det ? " — detalle" : " — resumen"}</h2>${det ? gDetalle(porAdminData, "admin", "Grupo") : gResumen(porAdminData, "admin")}`);
    if (S.porGrupo) parts.push(`<h2>Gestión por grupo${det ? " — detalle" : " — resumen"}</h2>${det ? gDetalle(porGrupoData, "grupo", "Administrador") : gResumen(porGrupoData, "grupo")}`);

    if (S.visitas) {
      let tabla: string;
      if (det) {
        const filas = visitasData.map(a => {
          const cab = `<tr class="sec"><td colspan="5">👤 ${a.nombre.toUpperCase()} — ${a.total} visitas · ${a.aprobadas} aprob · ${a.rechazadas} rech · ${a.repetir} repetir · ${a.pendientes} pend${a.sinResultado ? ` · ${a.sinResultado} sin resultado` : ""}</td></tr>`;
          const vs = a.visitas.map(v => `<tr><td class="up">${v.cliente}</td><td class="c">${fmtFechaCorta(v.fecha)}</td><td class="c">${v.estado}</td><td class="c">${v.estado === "Pendiente" ? "—" : (v.resultado ?? "—")}</td><td class="c">${((v.gps ? "📍" : "") + (v.foto ? " 📷" : "")) || "—"}</td></tr>`).join("");
          return cab + vs;
        }).join("");
        tabla = `<table><thead><tr><th>Cliente</th><th class="c">Fecha</th><th class="c">Estado</th><th class="c">Resultado</th><th class="c">GPS/Foto</th></tr></thead><tbody>${filas}</tbody></table>`;
      } else {
        const filas = visitasData.map(a => `<tr><td class="up"><b>👤 ${a.nombre}</b></td><td class="c">${a.total}</td><td class="c">${a.aprobadas}</td><td class="c">${a.rechazadas}</td><td class="c">${a.repetir}</td><td class="c">${a.pendientes}</td><td class="c">${a.sinResultado}</td></tr>`).join("");
        tabla = `<table><thead><tr><th>Administrador</th><th class="c">Visitas</th><th class="c">Aprob.</th><th class="c">Rech.</th><th class="c">Repetir</th><th class="c">Pend.</th><th class="c">Sin resultado</th></tr></thead><tbody>${filas}</tbody></table>`;
      }
      parts.push(`<h2>Visitas por administrador</h2>${tabla}`);
    }

    if (S.mora) {
      // Los días son los de Cartera (cuota vencida) y la deuda es todo lo que debe HOY.
      const filas = carteraHoy.detalle.map(m => `<tr><td class="up">${m.cliente}</td><td>${m.placa}</td><td class="c" style="color:#991b1b;font-weight:700">${m.diasMora}${m.recoleccion ? " · recolección" : ""}</td><td class="r">$ ${fmt(m.debeHoy)}</td><td>${m.ultimaFechaPago ? new Date(m.ultimaFechaPago + "T00:00:00").toLocaleDateString("es-CO") : "—"}</td></tr>`).join("");
      parts.push(`<h2>Mora y cartera vencida (${carteraHoy.detalle.length})</h2>${carteraHoy.detalle.length === 0 ? "<p class='ok'>Sin contratos en mora.</p>" : `<table><thead><tr><th>Cliente</th><th>Placa</th><th class="c">Días en mora</th><th class="r">Debe hoy</th><th>Último pago</th></tr></thead><tbody>${filas}</tbody></table>`}`);
    }

    if (S.flota) {
      const filas = motosPorEstado.map(([est, n]) => `<tr><td>${est}</td><td class="c">${n}</td><td class="c">${pct(n, motos.length)}</td></tr>`).join("");
      parts.push(`<h2>Flota por estado (${motos.length} motos)</h2><table><thead><tr><th>Estado</th><th class="c">Cantidad</th><th class="c">%</th></tr></thead><tbody>${filas}</tbody></table>`);
    }

    if (S.entregas) {
      const filas = entregas.map(e => `<tr><td class="c">${fmtFechaCorta(e.fecha)}</td><td class="up">${e.cliente}</td><td>${e.placa}</td><td>${e.grupo}</td><td>${e.formaPago}</td><td class="r">$ ${fmt(e.cuota)}</td><td class="c">${e.docsOk ? "✓" : "⚠"}</td></tr>`).join("");
      parts.push(`<h2>Entregas del período (${entregas.length})</h2>${entregas.length === 0 ? "<p>Sin entregas en el período.</p>" : `<table><thead><tr><th class="c">Fecha</th><th>Cliente</th><th>Placa</th><th>Grupo</th><th>Forma</th><th class="r">Cuota</th><th class="c">Docs</th></tr></thead><tbody>${filas}</tbody></table>`}`);
    }

    win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte MotoGestión</title><style>
      body{font-family:Arial,sans-serif;color:#0f172a;padding:32px;font-size:13px;}
      h1{font-size:22px;margin-bottom:4px;} h2{font-size:15px;margin:22px 0 8px;border-bottom:2px solid #cbd5e1;padding-bottom:6px;}
      .sub{color:#64748b;margin:0 0 4px;}
      .kpis{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px;}
      .kpi{border:1px solid #e2e8f0;border-radius:10px;padding:12px 18px;min-width:120px;}
      .kpi-val{font-size:18px;font-weight:800;color:#0891b2;} .kpi-lbl{font-size:10px;color:#64748b;text-transform:uppercase;margin-top:2px;}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:4px;}
      th{background:#f1f5f9;padding:6px 9px;text-align:left;font-weight:700;color:#334155;border:1px solid #e2e8f0;}
      td{padding:5px 9px;border:1px solid #e2e8f0;}
      tr:nth-child(even) td{background:#f8fafc;} tr.sec td{background:#334155;color:#fff;font-weight:700;}
      .c{text-align:center;} .r{text-align:right;} .up{text-transform:uppercase;} .ok{color:#166534;}
      footer{margin-top:28px;font-size:11px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:10px;}
      @media print{h2{page-break-after:avoid;} tr{page-break-inside:avoid;}}
    </style></head><body>
      <h1>Reporte MotoGestión — Club Moteros Cartagena</h1>
      <p class="sub">Período: <strong>${rangoLbl}</strong> (${desde} → ${hasta}) · Generado el ${fechaHoy} · ${det ? "con detalle" : "resumen"}</p>
      ${parts.join("\n")}
      <footer>Club Moteros Cartagena · Fredy Mora Avendaño C.C. 1.047.393.901</footer>
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  // ── RESUMEN (rediseño del 2-oct-2026, docs/REDISENO-REPORTES.md) ─────────────────────────────
  // Todo respeta la barra de filtros (período, grupo, cobrador). Cada número guarda sus filas: al
  // tocarlo se ve exactamente lo que se contó, y desde ahí se llega a Cartera ya filtrada.
  const contratoPorId = useMemo(() => new Map(contratos.map(c => [c.id, c])), [contratos]);
  const clientePorId = useMemo(() => new Map(clientes.map(c => [c.id, c])), [clientes]);
  // Dónde está cada moto (D-033/034): la misma respuesta en el Resumen, Por grupo y Flota.
  const lugarDeMoto = useMemo(() => dondeEstaCadaMoto(motos, contratos), [motos, contratos]);
  // Las motos guardadas en la empresa, con la regla de D-033/034: retenidas por no pagar (estén donde
  // estén) y en el taller con o sin cliente. Los días, el sitio y el encargado salen de `motosGuardadas`
  // (la última recepción); si una de estas no figura ahí, va sin fecha en vez de inventarla. Antes
  // Guardadas contaba por el estado de la moto (47) y Flota por el contrato (49).
  const quietas = useMemo(() => {
    const info = new Map(guardadas.map(g => [g.motoId, g]));
    const nombreSub = new Map(subadmins.map(sa => [sa.id, sa.nombre]));
    const LUGAR_MOTIVO: Partial<Record<LugarMoto, string>> = { retenida: "Retenida por no pagar", tallerConCliente: "En el taller, el contrato sigue", tallerSinCliente: "En el taller, sin cliente" };
    return motos.flatMap(m => {
      const lm = lugarDeMoto.get(m.id);
      if (!lm || !["retenida", "tallerConCliente", "tallerSinCliente"].includes(lm.lugar)) return [];
      const c = lm.contratoId ? contratoPorId.get(lm.contratoId) : undefined;
      // Una recepción que no es la de esta retención no dice desde cuándo está guardada: la de ANTES de
      // entregarle la moto al cliente, o el alta de la moto en el sistema ("nuevo registro", p. ej. en
      // la migración de julio). Se descarta y la moto va sin fecha, en vez de con días de más.
      const g0 = info.get(m.id);
      const noSirve = !!g0 && (g0.motivo === MOTIVO_RECEPCION_LABEL.nuevo_registro
        || (!!c?.fecha_entrega && !!g0.desde && g0.desde.slice(0, 10) < c.fecha_entrega));
      const g = noSirve ? undefined : g0;
      return [{
        motoId: m.id, placa: m.placa, grupo: m.grupo ?? "SIN GRUPO", estado: m.estado as string, lugar: lm.lugar,
        donde: sitioFisico(m.estado), motivo: g?.motivo ?? LUGAR_MOTIVO[lm.lugar] ?? "",
        clienteNombre: c ? (clientePorId.get(c.cliente_id)?.nombre ?? "—") : (g?.clienteNombre || "Sin cliente"),
        contratoId: lm.contratoId ?? g?.contratoId ?? null,
        subadminId: m.subadmin_id ?? null, subadminNombre: m.subadmin_id ? (nombreSub.get(m.subadmin_id) ?? "Cobrador") : "Sin cobrador",
        desde: g?.desde ?? null, dias: g?.dias ?? null, sinRegistro: g ? g.sinRegistro : true,
      }];
    });
  }, [motos, lugarDeMoto, guardadas, contratoPorId, clientePorId, subadmins]);
  const plata = (n: number) => `$ ${fmt(n)}`;
  const placaDe = (contratoId: string) => { const c = contratoPorId.get(contratoId); return c?.moto_id ? motos.find(m => m.id === c.moto_id)?.placa : undefined; };
  const grupoDe = (contratoId: string) => atribucion.get(contratoId)?.grupo;
  const nombreCliente = (contratoId: string) => clientePorId.get(contratoPorId.get(contratoId)?.cliente_id ?? "")?.nombre ?? "—";
  const irFicha = (contratoId: string) => { const id = contratoPorId.get(contratoId)?.cliente_id; if (id) { setDetalle(null); onNavigate?.("ficha_cliente", id); } };
  const pasaFiltroGC = (grupo: string | null | undefined, adminId: string | null | undefined) =>
    (filtros.grupo.length === 0 || filtros.grupo.includes(grupo ?? "")) && (filtros.cobrador.length === 0 || filtros.cobrador.includes(adminId ?? "__none__"));
  // El Resumen obedece SOLO a lo que muestra su barra: período, grupo y cobrador. La modalidad y el
  // estado que se marquen en Por admin, Por grupo o Exportar no lo tocan (2-oct: sin esto, tocar "En
  // mora hoy" en otra pestaña dejaba el recaudado del Resumen recortado sin que la barra lo dijera).
  // Con un cobrador filtrado, cada moto cuenta desde que es suya (D-035): lo de antes va aparte.
  const cobradorFiltrado = filtros.cobrador.length > 0;
  const baseResumen = useMemo(() => baseGestion.filter(r => pasaFiltroGC(r.grupo, r.adminId)).map(r => cobradorFiltrado ? comoCobrador(r) : r), [baseGestion, filtros]); // eslint-disable-line react-hooks/exhaustive-deps
  // Los pagos del período, uno por uno, con su grupo y cobrador. Sale por otro camino que las filas
  // de cada contrato: por eso el sello puede comparar el total contra la suma de los grupos.
  const pagosDelFiltro = useMemo(() => pagosRango.filter(p => pasaFiltroGC(atribucion.get(p.contrato_id)?.grupo, atribucion.get(p.contrato_id)?.adminId)), [pagosRango, atribucion, filtros]); // eslint-disable-line react-hooks/exhaustive-deps
  const pagosFiltrados = useMemo(() => cobradorFiltrado ? pagosDelFiltro.filter(p => !pagoAntesDeAsignar(p)) : pagosDelFiltro, [pagosDelFiltro, cobradorFiltrado]); // eslint-disable-line react-hooks/exhaustive-deps
  const antesR = cobradorFiltrado ? pagosDelFiltro.filter(pagoAntesDeAsignar).reduce((sm, p) => sm + p.valor, 0) : 0;
  // Lo que cada pago le aportó a la base por un acuerdo de base: es del cliente, no de la empresa.
  const baseAcuerdoR = useMemo(() => {
    const vs = new Map(contratos.map(c => [c.id, c.valor_semanal]));
    return baseDeAcuerdosDeBase(pagos as never, convenios as never, id => vs.get(id));
  }, [pagos, convenios, contratos]);
  const recaudoR = useMemo(() => desgloseRecaudo(pagosFiltrados as never, baseAcuerdoR), [pagosFiltrados, baseAcuerdoR]);
  const serieR = useMemo(() => serieRecaudo(pagosFiltrados, desde, hasta, fechaDeCaja as never), [pagosFiltrados, desde, hasta]);
  const medibleR = baseResumen.filter(cuentaParaCumplimiento);
  const cumplimientoR = {
    pct: pctCumplimiento(medibleR.map(r => r.cum)),
    debia: medibleR.reduce((s, r) => s + r.cum.debia, 0),
    cubrio: medibleR.reduce((s, r) => s + r.cum.cubrio, 0),
    aAcuerdo: medibleR.reduce((s, r) => s + r.cum.aAcuerdo, 0),
  };
  const anteriorR = useMemo(() => cobradorFiltrado
    ? pagos.filter(p => p.estado === "Confirmado" && esPagoDeCaja(p) && fechaDeCaja(p) >= desdeAnt && fechaDeCaja(p) <= hastaAnt
        && pasaFiltroGC(atribucion.get(p.contrato_id)?.grupo, atribucion.get(p.contrato_id)?.adminId) && !pagoAntesDeAsignar(p)).reduce((sm, p) => sm + p.valor, 0)
    : recaudoAnteriorCon({ ...filtros, modalidad: [], estado: [] }), [pagos, desdeAnt, hastaAnt, atribucion, filtros]); // eslint-disable-line react-hooks/exhaustive-deps
  // Los estados de hoy salen de las MISMAS filas que Por admin y Por grupo (D-033 y D-034): así "en
  // mora" dice lo mismo en todas las pestañas. Cartera sigue cobrándole a quien tiene la moto en el
  // taller (debe su semana); aquí va aparte, como pidió el dueño el 22-ago.
  const alDiaF = baseResumen.filter(r => r.estado === "aldia");
  const gabelaF = baseResumen.filter(r => r.estado === "gabela");
  const enMoraF = baseResumen.filter(r => r.estado === "mora").sort((a, b) => b.diasMora - a.diasMora || b.debeHoy - a.debeHoy);
  const tallerF = baseResumen.filter(r => r.estado === "taller");
  const retenidasF = baseResumen.filter(r => r.estado === "retenida");
  const liquidacionF = baseResumen.filter(r => r.estado === "reasignada");
  const motoPorId = useMemo(() => new Map(motos.map(m => [m.id, m])), [motos]);
  const sitioDe = (r: MotoRowG) => sitioFisico(motoPorId.get(contratoPorId.get(r.contratoId)?.moto_id ?? "")?.estado);
  const tramosR = tramosMora(enMoraF);
  // Cómo estaban AL CIERRE del período (si ya terminó): reconstruido con la fecha de cada pago.
  const cierreR = useMemo(() => {
    if (tab !== "resumen" || hasta >= hoyStr) return null;
    const pagosPor = new Map<string, typeof pagos>();
    pagos.filter(p => p.estado === "Confirmado").forEach(p => { if (!pagosPor.has(p.contrato_id)) pagosPor.set(p.contrato_id, []); pagosPor.get(p.contrato_id)!.push(p); });
    const convPor = new Map<string, typeof convenios>();
    convenios.forEach(cv => { if (!convPor.has(cv.contrato_id)) convPor.set(cv.contrato_id, []); convPor.get(cv.contrato_id)!.push(cv); });
    const filas: { r: MotoRowG; estado: "aldia" | "gabela" | "mora" | "retenida"; diasMora: number; recoleccion: boolean }[] = [];
    for (const r of baseResumen) {
      // Igual que la columna de hoy: las retenidas en liquidación (moto ya reasignada) sí cuentan.
      if (r.estado === "cerrado") continue;
      const c = contratoPorId.get(r.contratoId);
      if (!c?.fecha_entrega || c.fecha_entrega > hasta) continue;
      // ¿Ya estaba retenida en esa fecha? Si está suspendida hoy, se busca CUÁNDO llegó la moto a la
      // empresa: la última recepción (por el contrato, o por la moto si no quedó ligada al contrato) o la
      // gestión de recolección. Si la evidencia es de después del cierre, en esa fecha andaba en la calle.
      // Sin ninguna evidencia se cuenta retenida: son retenciones viejas, de antes de que existieran esos
      // registros (2-oct: 11 de 14 suspendidas sin el registro ligado al contrato, como YAV66H con 90 días).
      if (c.estado === "Suspendido") {
        const evidencias = [
          ...recepciones.filter(x => x.contrato_id === c.id || (!x.contrato_id && x.moto_id === c.moto_id && (x.created_at ?? "").slice(0, 10) >= c.fecha_entrega!)).map(x => (x.created_at ?? "").slice(0, 10)),
          ...gestiones.filter(g => g.contrato_id === c.id && g.tipo === "recoleccion").map(g => (g.created_at ?? "").slice(0, 10)),
        ].filter(Boolean).sort();
        const ultima = evidencias[evidencias.length - 1];
        if (!ultima || ultima <= hasta) {
          filas.push({ r, estado: "retenida", diasMora: 0, recoleccion: false });
          continue;
        }
      }
      const e = estadoAlCierre(c as never, (pagosPor.get(c.id) ?? []) as never, (convPor.get(c.id) ?? []) as never, hasta, fechaDeCaja as never, rodadasNomina);
      if (!e) continue;
      const plazo = gestiones.some(g => g.contrato_id === c.id && g.tipo === "plazo_extra" && (g.created_at ?? "").slice(0, 10) <= hasta && (g.plazo_extra_fecha_limite ?? "") >= hasta);
      filas.push({ r, estado: e.estado === "al-dia" ? "aldia" : e.estado, diasMora: e.diasMora, recoleccion: e.estado === "mora" && e.diasMora > 3 && !plazo });
    }
    return filas;
  }, [tab, hasta, hoyStr, pagos, convenios, baseResumen, contratoPorId, recepciones, gestiones, rodadasNomina]);
  const cierreTexto = cierreR ? `${Number(hasta.slice(8, 10))}-${MESES_CORTO[Number(hasta.slice(5, 7)) - 1]}` : null;
  const cuentaCierre = (f: (x: NonNullable<typeof cierreR>[number]) => boolean) => cierreR ? cierreR.filter(f).length : null;
  const estadosR: FilaEstado[] = ([
    { clave: "aldia", etiqueta: "Al día", hoy: alDiaF.length, cierre: cuentaCierre(x => x.estado === "aldia") },
    { clave: "gabela", etiqueta: "Gabela (día de gracia)", hoy: gabelaF.length, cierre: cuentaCierre(x => x.estado === "gabela") },
    { clave: "mora", etiqueta: "En mora", hoy: enMoraF.length, cierre: cuentaCierre(x => x.estado === "mora") },
    { clave: "recoleccion", etiqueta: "En recolección", hoy: enMoraF.filter(r => r.recoleccion).length, cierre: cuentaCierre(x => x.recoleccion) },
    { clave: "taller", etiqueta: "Con la moto en el taller", hoy: tallerF.length, cierre: null },
    { clave: "retenidas", etiqueta: "Retenidas por no pagar", hoy: retenidasF.length, cierre: cuentaCierre(x => x.estado === "retenida") },
    { clave: "liquidacion", etiqueta: "En liquidación", hoy: liquidacionF.length, cierre: null },
  ] as FilaEstado[]).filter(e => (e.clave !== "taller" && e.clave !== "liquidacion") || e.hoy > 0);
  // El sello: tres comprobaciones que SÍ pueden fallar, cada una entre dos cuentas hechas por caminos
  // distintos (ver `verificarCifras`).
  const vigentesF = contratos.filter(c => (c.estado === "Activo" || c.estado === "Suspendido") && pasaFiltroGC(atribucion.get(c.id)?.grupo, atribucion.get(c.id)?.adminId)).length;
  const verificacionesR = verificarCifras({
    totalRecaudado: recaudoR.total,
    sumaGrupos: baseResumen.reduce((s, r) => s + r.monto, 0),
    sinRepartir: pagosSinRepartir(pagosFiltrados as never),
    sumaEstados: alDiaF.length + gabelaF.length + enMoraF.length + tallerF.length + retenidasF.length + liquidacionF.length,
    totalContratos: vigentesF,
  });
  // Por grupo: todos los grupos a la vista (para poder cambiar), con el filtro de cobrador puesto.
  const gruposR = useMemo(() => {
    const base = baseGestion.filter(r => filtros.cobrador.length === 0 || filtros.cobrador.includes(r.adminId));
    const extras = [...new Set(base.map(r => r.grupo))].filter(g => !(GRUPOS as readonly string[]).includes(g));
    return [...GRUPOS, ...extras].map(g => {
      const f = base.filter(r => r.grupo === g);
      return {
        grupo: g, color: GRUPO_COLORS[g] ?? "var(--muted)",
        recaudo: f.reduce((s, r) => s + r.monto, 0),
        pctCum: pctCumplimiento(f.filter(cuentaParaCumplimiento).map(r => r.cum)),
        enMora: f.filter(r => r.estado === "mora").length,
        motosAsignadas: motos.filter(m => m.grupo === g && lugarDeMoto.get(m.id)?.lugar === "trabajando" && (filtros.cobrador.length === 0 || filtros.cobrador.includes(m.subadmin_id ?? "__none__"))).length,
        contratosActivos: f.filter(r => r.contratoActivo).length,
        activo: filtros.grupo.length === 1 && filtros.grupo[0] === g,
      };
    }).filter(x => (GRUPOS as readonly string[]).includes(x.grupo) || x.recaudo > 0);
  }, [baseGestion, filtros, motos, lugarDeMoto]);
  // ── POR GRUPO y POR COBRADOR (rediseño 2-oct · D-032/033/034/035) ──
  // Las mismas filas del Resumen, por portafolio. Obedecen a los filtros de la barra; el grupo (o el
  // cobrador) elegido solo decide qué detalle se ve abajo — la lista de arriba los muestra todos. En
  // la mirada del cobrador, o con un cobrador filtrado, cada moto cuenta desde que es suya (D-035):
  // lo que pagó antes va aparte, porque el sistema no guarda quién la tenía.
  const GESTIONES_COBRADOR: Array<[string, string]> = [
    ["mensaje_recordatorio", "mensajes"], ["llamada", "llamadas"], ["whatsapp", "WhatsApp"], ["recoleccion", "recolecciones"],
    ["sirena", "sirenas"], ["plazo_extra", "plazos extra"], ["cobro_campo", "cobros en la calle"], ["visita", "visitas"],
  ];
  const portafolio = useMemo(() => {
    if (tab !== "grupos" && tab !== "admins") return null;
    const modo: "grupo" | "cobrador" = tab === "admins" ? "cobrador" : "grupo";
    const pasaGrupo = (g: string | null | undefined) => filtros.grupo.length === 0 || filtros.grupo.includes(g ?? "SIN GRUPO");
    const pasaCob = (id: string | null | undefined) => filtros.cobrador.length === 0 || filtros.cobrador.includes(id ?? "__none__");
    const pasaMod = (fp: string | null | undefined) => filtros.modalidad.length === 0 || filtros.modalidad.includes(fp ?? "");
    const desdeAsignacion = modo === "cobrador" || filtros.cobrador.length > 0;
    const pasaOtro = (grupo: string | null | undefined, adminId: string | null | undefined) => modo === "grupo" ? pasaCob(adminId) : pasaGrupo(grupo);
    const grupoMoto = (m: { grupo?: string | null }) => m.grupo ?? "SIN GRUPO";
    const contratoDeMoto = (m: { id: string }) => contratoPorId.get(lugarDeMoto.get(m.id)?.contratoId ?? "");
    const filas = baseGestion.filter(r => pasaMod(r.formaPago) && pasaOtro(r.grupo, r.adminId)).map(r => desdeAsignacion ? comoCobrador(r) : r);
    const motosF = motos.filter(m => pasaOtro(grupoMoto(m), m.subadmin_id ?? "__none__") && (filtros.modalidad.length === 0 || pasaMod(contratoDeMoto(m)?.forma_pago)));
    const pasaPago = (pg: (typeof pagosRango)[number]) => { const at = atribucion.get(pg.contrato_id); return !!at && pasaMod(at.formaPago) && pasaOtro(at.grupo, at.adminId); };
    const pagosBase = pagosRango.filter(pasaPago);
    const pagosF = desdeAsignacion ? pagosBase.filter(pg => !pagoAntesDeAsignar(pg)) : pagosBase;
    const pagosAntes = desdeAsignacion ? pagosBase.filter(pagoAntesDeAsignar) : [];
    const pagosAnt = pagos.filter(pg => pg.estado === "Confirmado" && esPagoDeCaja(pg) && fechaDeCaja(pg) >= desdeAnt && fechaDeCaja(pg) <= hastaAnt && pasaPago(pg) && (!desdeAsignacion || !pagoAntesDeAsignar(pg)));
    const gestF = modo === "cobrador" ? gestiones.filter(g => { const f = (g.fecha ?? g.created_at ?? "").slice(0, 10); return f >= desde && f <= hasta; }) : [];
    const claveFila = (r: MotoRowG) => modo === "grupo" ? r.grupo : r.adminId;
    const claveMoto = (m: (typeof motos)[number]) => modo === "grupo" ? grupoMoto(m) : (m.subadmin_id ?? "__none__");
    const clavePago = (pg: (typeof pagosRango)[number]) => modo === "grupo" ? atribucion.get(pg.contrato_id)?.grupo : atribucion.get(pg.contrato_id)?.adminId;
    const nombreDe = (k: string) => modo === "grupo" ? k : k === "__none__" ? "Sin cobrador"
      : (subadmins.find(sa => sa.id === k)?.nombre ?? baseGestion.find(r => r.adminId === k)?.adminNombre ?? "Cobrador");
    const calcular = (k: string | null): DatosPortafolio => {
      const fr = k === null ? filas : filas.filter(r => claveFila(r) === k);
      const mr = k === null ? motosF : motosF.filter(m => claveMoto(m) === k);
      const pr = k === null ? pagosF : pagosF.filter(pg => clavePago(pg) === k);
      const recaudo = desgloseRecaudo(pr as never, baseAcuerdoR);
      const anteriorTotal = (k === null ? pagosAnt : pagosAnt.filter(pg => clavePago(pg) === k)).reduce((sm, pg) => sm + pg.valor, 0);
      const med = fr.filter(cuentaParaCumplimiento);
      const enGestion = fr.filter(r => !fueraDeGestion(r.estado));
      const lugares: Record<LugarMoto, number> = { trabajando: 0, tallerConCliente: 0, retenida: 0, tallerSinCliente: 0, disponible: 0 };
      mr.forEach(m => { const l = lugarDeMoto.get(m.id)?.lugar; if (l) lugares[l]++; });
      const cuenta = (f: (r: MotoRowG) => boolean) => fr.filter(f).length;
      const gs = k === null ? gestF : gestF.filter(g => g.registrado_por === k);
      return {
        clave: k,
        nombre: k === null ? (modo === "grupo" ? "Todos los grupos" : "Todos los cobradores") : nombreDe(k),
        color: modo === "grupo" ? (k ? (GRUPO_COLORS[k] ?? "var(--muted)") : undefined) : undefined,
        recaudo, anterior: { total: anteriorTotal, delta: deltaRecaudo(recaudo.total, anteriorTotal) },
        antes: (k === null ? pagosAntes : pagosAntes.filter(pg => clavePago(pg) === k)).reduce((sm, pg) => sm + pg.valor, 0),
        cum: {
          pct: pctCumplimiento(med.map(r => r.cum)),
          debia: med.reduce((sm, r) => sm + r.cum.debia, 0), cubrio: med.reduce((sm, r) => sm + r.cum.cubrio, 0), aAcuerdo: med.reduce((sm, r) => sm + r.cum.aAcuerdo, 0),
          recupero: enGestion.reduce((sm, r) => sm + r.cum.recupero, 0), atrasoAAcuerdo: enGestion.reduce((sm, r) => sm + r.cum.atrasoAAcuerdo, 0),
        },
        totalMotos: mr.length, lugares,
        clientes: {
          aldia: cuenta(r => r.estado === "aldia"), gabela: cuenta(r => r.estado === "gabela"), mora: cuenta(r => r.estado === "mora"),
          recoleccion: cuenta(r => r.estado === "mora" && r.recoleccion), liquidacion: cuenta(r => r.estado === "reasignada"),
          sinAcuerdo: cuenta(r => r.debeSinConvenio), cerrados: cuenta(r => r.estado === "cerrado"),
        },
        porMoto: lugares.trabajando > 0 ? Math.round(recaudo.empresa / lugares.trabajando) : null,
        gestiones: modo === "cobrador" ? GESTIONES_COBRADOR.map(([t, et]) => ({ clave: t, etiqueta: et, n: gs.filter(g => g.tipo === t).length })) : undefined,
      };
    };
    const claves = modo === "grupo"
      ? [...(GRUPOS as readonly string[]), ...new Set([...motosF.map(grupoMoto), ...filas.map(r => r.grupo)].filter(g => !(GRUPOS as readonly string[]).includes(g)))]
      : [...new Set([...motosF.map(m => m.subadmin_id ?? "__none__"), ...filas.map(r => r.adminId)])];
    let lista = claves.map(calcular).filter(g => g.totalMotos > 0 || g.recaudo.total > 0);
    // Los cobradores, del que más cumplió al que menos (decisión del 29-sep); las motos sin cobrador al final.
    if (modo === "cobrador") lista = lista.sort((a, b) => (a.clave === "__none__" ? 1 : 0) - (b.clave === "__none__" ? 1 : 0) || (b.cum.pct ?? -1) - (a.cum.pct ?? -1) || b.recaudo.total - a.recaudo.total);
    const elegido = modo === "grupo" ? filtros.grupo : filtros.cobrador;
    const sel = elegido.length === 1 ? elegido[0] : null;
    const enSel = <T,>(xs: T[], k: (x: T) => string | undefined) => sel ? xs.filter(x => k(x) === sel) : xs;
    const antesTotal = pagosAntes.reduce((sm, pg) => sm + pg.valor, 0);
    return {
      modo, lista, sel,
      detalle: sel ? (lista.find(g => g.clave === sel) ?? calcular(sel)) : calcular(null),
      pie: antesTotal > 0 ? { etiqueta: "De antes de que se asignaran las motos", total: antesTotal, clave: "antes" } : undefined,
      filas: enSel(filas, claveFila), motos: enSel(motosF, claveMoto), pagos: enSel(pagosF, clavePago), pagosAntes: enSel(pagosAntes, clavePago),
      gestiones: modo === "cobrador" ? (sel ? gestF.filter(g => g.registrado_por === sel) : gestF) : [],
    };
  }, [tab, baseGestion, motos, contratoPorId, lugarDeMoto, pagosRango, pagos, atribucion, baseAcuerdoR, filtros, desde, hasta, desdeAnt, hastaAnt, gestiones, subadmins]); // eslint-disable-line react-hooks/exhaustive-deps

  function abrirDetallePortafolio(clave: string) {
    const pf = portafolio;
    if (!pf) return;
    const per = textoRango(desde, hasta);
    const quien = pf.detalle.nombre;
    const arch = (x: string) => `${x}_${(pf.sel ? pf.detalle.nombre : "todos").toLowerCase().replace(/\s+/g, "_")}_${desde}_${hasta}`;
    const f = pf.filas;
    const carteraCon = (filtro: string) => ({
      texto: "Abrir en Cartera",
      onClick: () => { setDetalle(null); onNavigate?.("cobros", pf.sel ? `${filtro};${pf.modo === "grupo" ? "grupo" : "cobrador"}:${pf.sel}` : filtro); },
    });
    // En la mirada del grupo, cada fila dice su cobrador; en la del cobrador, su grupo.
    const quienLleva = (r: MotoRowG, txt: string) => `${txt} · ${pf.modo === "grupo" ? r.adminNombre : r.grupo}`;
    if (clave === "recaudo") { setDetalle(detallePagos(pf.pagos, `Pagos de ${quien} · ${per}`, arch("pagos"))); return; }
    if (clave === "antes") {
      const det = detallePagos(pf.pagosAntes, `Antes de que se asignaran las motos · ${per}`, arch("antes_de_asignar"));
      setDetalle({ ...det, subtitulo: "Pagos de motos que cambiaron de cobrador en el período, hechos antes del cambio. No se le cuentan a nadie: el sistema no guarda quién tenía la moto antes." });
      return;
    }
    if (clave === "cumplimiento") { setDetalle(detalleCumplimiento(f.filter(cuentaParaCumplimiento), `${quien} · ${per}`)); return; }
    if (clave.startsWith("lugar:")) {
      const lugar = clave.slice(6) as LugarMoto;
      const info = LUGARES.find(l => l.clave === lugar)!;
      const lista = pf.motos.filter(m => lugarDeMoto.get(m.id)?.lugar === lugar);
      const sitios = [...new Set(lista.map(m => sitioFisico(m.estado)))];
      setDetalle({
        titulo: `${info.etiqueta} · ${lista.length}`,
        subtitulo: `${quien}. ${info.explica}`,
        filas: lista.map(m => {
          const cId = lugarDeMoto.get(m.id)?.contratoId ?? null;
          const c = cId ? contratoPorId.get(cId) : undefined;
          const cliente = c ? clientePorId.get(c.cliente_id)?.nombre ?? "—" : "Sin cliente";
          const fila = cId ? f.find(r => r.contratoId === cId) : undefined;
          const lleva = pf.modo === "grupo" ? (fila?.adminNombre ?? (m.subadmin_id ? subadmins.find(sa => sa.id === m.subadmin_id)?.nombre : "Sin cobrador")) : (m.grupo ?? "Sin grupo");
          return {
            id: m.id, placa: m.placa, grupo: m.grupo ?? undefined, titulo: cliente,
            subtitulo: `Moto ${sitioFisico(m.estado)}${fila && fila.debeHoy > 0 && lugar !== "trabajando" ? ` · debe ${plata(fila.debeHoy)}` : ""}${lleva ? ` · ${lleva}` : ""}`,
            monto: null, filtro: sitioFisico(m.estado),
            onClick: c ? () => irFicha(c.id) : undefined,
            csv: { Placa: m.placa, Grupo: m.grupo ?? "", Cliente: cliente, Donde: sitioFisico(m.estado), Cobrador: fila?.adminNombre ?? "" },
          };
        }),
        chips: sitios.length > 1 ? sitios.map(x => ({ clave: x, etiqueta: x.charAt(0).toUpperCase() + x.slice(1) })) : undefined,
        archivo: arch(lugar),
      });
      return;
    }
    if (clave.startsWith("gestion:")) {
      const tipo = clave.slice(8);
      const et = GESTIONES_COBRADOR.find(([t]) => t === tipo)?.[1] ?? tipo;
      const lista = pf.gestiones.filter(g => g.tipo === tipo).slice().sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
      setDetalle({
        titulo: `${et.charAt(0).toUpperCase() + et.slice(1)} · ${quien} · ${lista.length}`,
        subtitulo: `${per}. Lo que registró en la app, del más reciente al más viejo.`,
        filas: lista.map(g => ({
          id: g.id, placa: placaDe(g.contrato_id), grupo: grupoDe(g.contrato_id), titulo: nombreCliente(g.contrato_id),
          subtitulo: `${fmtFechaCorta((g.fecha ?? g.created_at ?? "").slice(0, 10))}${g.resultado ? ` · ${g.resultado}` : ""}`,
          monto: null, onClick: () => irFicha(g.contrato_id),
          csv: { Fecha: (g.fecha ?? g.created_at ?? "").slice(0, 10), Placa: placaDe(g.contrato_id) ?? "", Cliente: nombreCliente(g.contrato_id), Resultado: g.resultado ?? "" },
        })),
        archivo: arch(tipo),
      });
      return;
    }
    if (clave === "hoy:aldia" || clave === "hoy:gabela") {
      const k = clave.slice(4);
      const lista = f.filter(r => r.estado === k);
      setDetalle({ titulo: `${k === "aldia" ? "Al día" : "Gabela"} · ${quien} · ${lista.length}`, subtitulo: k === "aldia" ? "Hoy no deben nada vencido." : "Les venció ayer: hoy es su día de gracia.",
        filas: lista.map(r => filaMoto(r, quienLleva(r, k === "aldia" ? `Paga ${r.diaPago || r.formaPago}` : "Día de gracia"), k === "aldia" ? null : r.debeHoy, "var(--warn-ink)")),
        accion: carteraCon(k === "aldia" ? "contratos:al-dia" : "contratos:gabela"), archivo: arch(k) });
      return;
    }
    if (clave === "hoy:mora" || clave === "hoy:recoleccion") {
      const lista = f.filter(r => r.estado === "mora" && (clave === "hoy:mora" || r.recoleccion)).sort((a, b) => b.diasMora - a.diasMora || b.debeHoy - a.debeHoy);
      setDetalle({
        titulo: `${clave === "hoy:mora" ? "En mora" : "Para recoger la moto"} · ${quien} · ${lista.length}`,
        subtitulo: `Deben ${plata(lista.reduce((sm, r) => sm + r.debeHoy, 0))} entre todos. Primero los de más días.`,
        filas: lista.map(r => filaMoto(r, quienLleva(r, `${r.diasMora} ${r.diasMora === 1 ? "día" : "días"} en mora`), r.debeHoy, "var(--bad-ink)")),
        accion: carteraCon(clave === "hoy:mora" ? "contratos:mora" : "hoy:recoleccion"), archivo: arch(clave.slice(4)),
      });
      return;
    }
    if (clave === "hoy:liquidacion" || clave === "sinacuerdo" || clave === "cerrados") {
      const lista = clave === "hoy:liquidacion" ? f.filter(r => r.estado === "reasignada") : clave === "sinacuerdo" ? f.filter(r => r.debeSinConvenio) : f.filter(r => r.estado === "cerrado");
      const t = clave === "hoy:liquidacion" ? "En liquidación" : clave === "sinacuerdo" ? "Deben y no tienen acuerdo" : "Contratos cerrados que pagaron";
      const sub = clave === "hoy:liquidacion" ? "Se les detuvo el contrato y la moto ya la tiene otro cliente: falta cerrarles la cuenta."
        : clave === "sinacuerdo" ? "Tienen deudas registradas (multas, semanas atrasadas) y no han firmado acuerdo para pagarlas."
        : "Ya no tienen contrato, pero pagaron algo en el período: su plata cuenta aquí.";
      setDetalle({ titulo: `${t} · ${quien} · ${lista.length}`, subtitulo: sub,
        filas: lista.map(r => filaMoto(r, quienLleva(r, clave === "cerrados" ? `Pagó ${plata(r.monto)}` : `Debe ${plata(r.debeHoy)}`), clave === "cerrados" ? r.monto : r.debeHoy, clave === "cerrados" ? "var(--ok-ink)" : "var(--bad-ink)")),
        archivo: arch(clave.replace(":", "_")) });
      return;
    }
    if (clave === "motos") {
      const orden = (r: MotoRowG) => RANK_COLA[r.estado];
      const lista = f.slice().sort((a, b) => orden(a) - orden(b) || b.diasMora - a.diasMora || a.cliente.localeCompare(b.cliente));
      const ESTADO_TXT: Record<EstadoPagoG, string> = { aldia: "Al día", gabela: "Gabela", mora: "En mora", taller: "Moto en el taller", retenida: "Retenida", reasignada: "En liquidación", cerrado: "Contrato cerrado" };
      setDetalle({
        titulo: `Contratos de ${quien} · ${lista.length}`,
        subtitulo: `${per}. Cada uno con su estado de hoy, ${pf.modo === "grupo" ? "su cobrador" : "su grupo"} y lo que pagó en el período.`,
        filas: lista.map(r => filaMoto(r, quienLleva(r, `${ESTADO_TXT[r.estado]}${r.estado === "mora" ? ` ${r.diasMora}d` : ""}`) + (r.monto > 0 ? ` · pagó ${plata(r.monto)}` : ""), r.debeHoy > 0 && r.estado !== "cerrado" ? r.debeHoy : null, "var(--bad-ink)", ESTADO_TXT[r.estado])),
        chips: [...new Set(lista.map(r => ESTADO_TXT[r.estado]))].map(x => ({ clave: x, etiqueta: x })),
        archivo: arch("contratos"),
      });
    }
  }

  const guardadasF = useMemo(() => quietas.filter(g => pasaFiltroGC(g.grupo, g.subadminId ?? "__none__")), [quietas, filtros]); // eslint-disable-line react-hooks/exhaustive-deps
  const tarifaDiaDe = (g: { contratoId: string | null }) => contratoPorId.get(g.contratoId ?? "")?.tarifa_diaria ?? 27000;

  // ── FLOTA (rediseño 2-oct): foto de hoy, con los filtros de grupo y cobrador ──
  const flotaF = useMemo(() => motos.filter(m => pasaFiltroGC(m.grupo ?? "SIN GRUPO", m.subadmin_id ?? "__none__")), [motos, filtros]); // eslint-disable-line react-hooks/exhaustive-deps
  const lugaresFlota = useMemo(() => {
    const r: Record<LugarMoto, number> = { trabajando: 0, tallerConCliente: 0, retenida: 0, tallerSinCliente: 0, disponible: 0 };
    flotaF.forEach(m => { const l = lugarDeMoto.get(m.id)?.lugar; if (l) r[l]++; });
    return r;
  }, [flotaF, lugarDeMoto]);
  const gruposFlota = useMemo(() => {
    const base = motos.filter(m => filtros.cobrador.length === 0 || filtros.cobrador.includes(m.subadmin_id ?? "__none__"));
    const extras = [...new Set(base.map(m => m.grupo ?? "SIN GRUPO"))].filter(g => !(GRUPOS as readonly string[]).includes(g));
    return [...(GRUPOS as readonly string[]), ...extras].map(g => {
      const f = base.filter(m => (m.grupo ?? "SIN GRUPO") === g);
      return { grupo: g, color: GRUPO_COLORS[g] ?? "var(--muted)", total: f.length, trabajando: f.filter(m => lugarDeMoto.get(m.id)?.lugar === "trabajando").length };
    }).filter(g => g.total > 0);
  }, [motos, filtros, lugarDeMoto]);
  const motoPasaGC = (motoId: string) => { const m = motoPorId.get(motoId); return !!m && pasaFiltroGC(m.grupo ?? "SIN GRUPO", m.subadmin_id ?? "__none__"); };
  const alertasF = alertasVencimiento.filter(a => motoPasaGC(a.id));
  const sinSoatFlota = motosSinSoat.filter(m => motoPasaGC(m.id));
  const contratosFlota = contratos.filter(c => (c.estado === "Activo" || c.estado === "Suspendido") && c.moto_id && motoPasaGC(c.moto_id));
  const hayFiltroGC = filtros.grupo.length > 0 || filtros.cobrador.length > 0;
  const clientesConContratoF = new Set(contratosFlota.map(c => c.cliente_id));
  const estadosFlota = useMemo(() => {
    const m: Record<string, number> = {};
    flotaF.forEach(x => { m[x.estado] = (m[x.estado] ?? 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [flotaF]);

  function abrirDetalleFlota(clave: string) {
    const listaMotos = (lista: typeof motos, titulo: string, subtitulo: string, archivo: string): ContenidoDetalle => ({
      titulo, subtitulo,
      filas: lista.map(m => {
        const lm = lugarDeMoto.get(m.id);
        const c = lm?.contratoId ? contratoPorId.get(lm.contratoId) : undefined;
        const cliente = c ? clientePorId.get(c.cliente_id)?.nombre ?? "—" : "Sin cliente";
        const lugar = LUGARES.find(l => l.clave === lm?.lugar)?.etiqueta ?? "";
        const cob = m.subadmin_id ? (subadmins.find(sa => sa.id === m.subadmin_id)?.nombre ?? "Cobrador") : "Sin cobrador";
        return {
          id: m.id, placa: m.placa, grupo: m.grupo ?? undefined, titulo: cliente,
          subtitulo: `${lugar} · moto ${sitioFisico(m.estado)} · ${cob}`, monto: null, filtro: lugar,
          onClick: () => { setDetalle(null); if (c) onNavigate?.("ficha_cliente", c.cliente_id); else onNavigate?.("ficha_moto", m.id); },
          csv: { Placa: m.placa, Grupo: m.grupo ?? "", Cliente: cliente, Donde: lugar, Cobrador: cob },
        };
      }),
      chips: [...new Set(lista.map(m => LUGARES.find(l => l.clave === lugarDeMoto.get(m.id)?.lugar)?.etiqueta ?? ""))].filter(Boolean).map(x => ({ clave: x, etiqueta: x })),
      archivo,
    });
    if (clave.startsWith("lugar:")) {
      const lugar = clave.slice(6) as LugarMoto;
      const info = LUGARES.find(l => l.clave === lugar)!;
      setDetalle({ ...listaMotos(flotaF.filter(m => lugarDeMoto.get(m.id)?.lugar === lugar), `${info.etiqueta} · ${flotaF.filter(m => lugarDeMoto.get(m.id)?.lugar === lugar).length}`, info.explica, `flota_${lugar}`), chips: undefined });
      return;
    }
    if (clave.startsWith("grupo:")) {
      const g = clave.slice(6);
      const lista = motos.filter(m => (m.grupo ?? "SIN GRUPO") === g && (filtros.cobrador.length === 0 || filtros.cobrador.includes(m.subadmin_id ?? "__none__")));
      setDetalle(listaMotos(lista, `Motos de ${g} · ${lista.length}`, "Cada una con dónde está y quién la tiene a cargo.", `flota_${g.toLowerCase()}`));
      return;
    }
    if (clave.startsWith("clientes:")) {
      const k = clave.slice(9);
      const lista = k === "con" ? clientes.filter(cl => (hayFiltroGC ? clientesConContratoF : clientesConContratoIds).has(cl.id))
        : k === "tramite" ? clientes.filter(cl => cl.estado === "En proceso" || cl.estado === "Aprobado")
        : clientes.filter(cl => cl.created_at >= inicioMes);
      const titulo = k === "con" ? "Clientes con contrato" : k === "tramite" ? "Clientes en trámite" : "Clientes nuevos en el mes";
      setDetalle({
        titulo: `${titulo} · ${lista.length}`,
        subtitulo: k === "con" ? "Tienen un contrato activo o con la moto retenida." : k === "tramite" ? "Registrados o aprobados que todavía no tienen moto." : "Registrados desde el día 1 de este mes.",
        filas: lista.map(cl => ({ id: cl.id, titulo: cl.nombre, subtitulo: `${cl.estado}${cl.created_at ? ` · registrado el ${fmtFechaCorta(cl.created_at.slice(0, 10))}` : ""}`, monto: null,
          onClick: () => { setDetalle(null); onNavigate?.("ficha_cliente", cl.id); }, csv: { Cliente: cl.nombre, Estado: cl.estado, Registro: (cl.created_at ?? "").slice(0, 10) } })),
        archivo: `clientes_${k}`,
      });
      return;
    }
    if (clave.startsWith("papeles:")) {
      const k = clave.slice(8);
      if (k === "sinsoat") {
        setDetalle({ ...listaMotos(sinSoatFlota as typeof motos, `Sin fecha de SOAT · ${sinSoatFlota.length}`, "No tienen la fecha del SOAT anotada: no se sabe si está al día.", "motos_sin_soat"), chips: undefined });
        return;
      }
      const lista = alertasF.filter(a => k === "vencidos" ? a.vencida : !a.vencida);
      const txt = (d: number | null, n: string) => d === null ? null : d < 0 ? `${n} vencido hace ${Math.abs(d)} días` : `${n} vence en ${d} días`;
      setDetalle({
        titulo: `${k === "vencidos" ? "Papeles vencidos" : "Papeles por vencer"} · ${lista.length}`,
        subtitulo: k === "vencidos" ? "SOAT o tecnomecánica ya vencidos: la moto no debería circular." : "SOAT o tecnomecánica que vencen en los próximos 30 días.",
        filas: lista.map(a => {
          const m = motoPorId.get(a.id);
          return { id: a.id, placa: a.placa, grupo: m?.grupo ?? undefined, titulo: a.placa,
            subtitulo: [txt(a.diasSeguro, "SOAT"), txt(a.diasTecno, "Tecno")].filter(Boolean).join(" · "), monto: null,
            onClick: () => { setDetalle(null); onNavigate?.("ficha_moto", a.id); },
            csv: { Placa: a.placa, SOAT: a.seguro ?? "", Tecnomecanica: a.tecno ?? "" } };
        }),
        archivo: `papeles_${k}`,
      });
      return;
    }
    if (clave === "activos-sin-contrato") {
      setDetalle({
        titulo: `Clientes "activos" sin contrato · ${clientesActivosSinContrato.length}`,
        subtitulo: "Figuran como activos pero no tienen ningún contrato vigente: hay que corregirles el estado.",
        filas: clientesActivosSinContrato.map(cl => ({ id: cl.id, titulo: cl.nombre, subtitulo: "Activo sin contrato", monto: null,
          onClick: () => { setDetalle(null); onNavigate?.("ficha_cliente", cl.id); }, csv: { Cliente: cl.nombre } })),
        archivo: "activos_sin_contrato",
      });
    }
  }

  function excelQuietas() {
    const cols: ColX[] = [
      { label: "Placa", ancho: 80 }, { label: "Cliente", ancho: 200 },
      { label: "Motivo", ancho: 190 }, { label: "Dónde está", ancho: 120 },
      { label: "Guardada desde", align: "center", ancho: 100 },
      { label: "Días", align: "center", ancho: 55 },
      { label: "Encargado", ancho: 150 },
    ];
    const grupos = [...new Set(guardadasF.map(g => g.grupo))];
    const secciones: SeccionX[] = grupos.map(gr => {
      const filas = guardadasF.filter(g => g.grupo === gr).slice().sort((a, b) => (b.dias ?? -1) - (a.dias ?? -1));
      return {
        titulo: `${gr}   —   ${filas.length} moto${filas.length === 1 ? "" : "s"} · ${filas.reduce((sm, f) => sm + (f.dias ?? 0), 0)} días acumulados sin trabajar`,
        color: GRUPO_HEX[gr] ?? "#334155",
        filas: filas.map(f => [
          f.placa, f.clienteNombre.toUpperCase(), f.motivo, f.donde,
          { v: f.desde ? fmtFechaCorta(f.desde) : "sin registro", align: "center" as const, color: f.sinRegistro ? "#991b1b" : undefined },
          { v: f.dias == null ? "—" : String(f.dias), align: "center" as const, bold: (f.dias ?? 0) > 30, color: (f.dias ?? 0) > 30 ? "#991b1b" : undefined },
          f.subadminNombre.toUpperCase(),
        ]),
      };
    });
    descargarExcel({
      archivo: `motos_guardadas_${hoyISO()}`,
      titulo: "Motos guardadas en la empresa — no están trabajando",
      periodo: `Al ${new Date(hoyISO() + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}`,
      leyenda: "Retenidas por no pagar (estén donde estén) y en el taller con o sin cliente. 'Sin registro' = no hay recepción que diga desde cuándo.",
      columnas: cols, secciones,
      totalGeneral: [{ v: `TOTAL: ${guardadasF.length} motos guardadas`, bold: true }, "", "", "", "", { v: String(guardadasF.reduce((sm, f) => sm + (f.dias ?? 0), 0)), align: "center" as const, bold: true }, ""],
    });
  }
  const sinProducirR = plataSinProducir(guardadasF.map(g => ({ dias: g.dias, tarifaDia: tarifaDiaDe(g) })));
  const mejoresR = useMemo(() => {
    const map: Record<string, number> = {};
    pagosFiltrados.forEach(p => { const quien = titularEnFecha(p.contrato_id, p.fecha, contratos, cesiones); if (quien) map[quien] = (map[quien] ?? 0) + p.valor; });
    return Object.entries(map).map(([clienteId, total]) => ({ clienteId, nombre: clientePorId.get(clienteId)?.nombre ?? "—", total }))
      .sort((a, b) => b.total - a.total).slice(0, 8);
  }, [pagosFiltrados, contratos, cesiones, clientePorId]);
  const grupoUnico = filtros.grupo.length === 1 ? filtros.grupo[0] : null;
  const aCartera = (filtro: string) => ({
    texto: "Abrir en Cartera",
    onClick: () => { setDetalle(null); onNavigate?.("cobros", grupoUnico && filtro.startsWith("contratos:") ? `${filtro};grupo:${grupoUnico}` : filtro); },
  });
  const filaMoto = (r: MotoRowG, sub: string, monto: number | null, color?: string, filtro?: string): FilaDetalle => ({
    id: r.contratoId, placa: r.placa, grupo: r.grupo, titulo: r.cliente, subtitulo: sub, monto, montoColor: color, filtro,
    onClick: () => irFicha(r.contratoId),
    csv: { Placa: r.placa, Cliente: r.cliente, Grupo: r.grupo, Cobrador: r.adminNombre, Detalle: sub, Monto: monto ?? "" },
  });
  const tramoDe = (d: number) => tramosR.find(t => d >= t.desde && d <= t.hasta)?.clave;
  const chipsTramos = tramosR.map(t => ({ clave: t.clave, etiqueta: t.etiqueta }));
  // Avisos de arriba del Resumen, con los mismos filtros: tocar uno muestra a quiénes se refiere.
  const diasBaseF = diasBase.filter(c => pasaFiltroGC(atribucion.get(c.id)?.grupo, atribucion.get(c.id)?.adminId));
  const docsF = alertasVencimiento.filter(a => { const m = motos.find(x => x.id === a.id); return pasaFiltroGC(m?.grupo, m?.subadmin_id); });
  const sinSoatF = motosSinSoat.filter(m => pasaFiltroGC(m.grupo, m.subadmin_id));

  const detallePagos = (lista: typeof pagosRango, titulo: string, archivo: string): ContenidoDetalle => ({
        titulo,
        subtitulo: "Las transferencias por la fecha del banco y el efectivo por el día en que se recibió. Toca uno para ver la ficha.",
        filas: lista.slice().sort((x, y) => fechaDeCaja(y).localeCompare(fechaDeCaja(x)) || y.valor - x.valor).map(pg => ({
          id: pg.id, placa: placaDe(pg.contrato_id), grupo: grupoDe(pg.contrato_id), titulo: nombreCliente(pg.contrato_id),
          subtitulo: `${fmtFechaCorta(fechaDeCaja(pg))} · ${pg.metodo}${pg.tipo_registro === "campo" ? " · cobrado en la calle" : ""}`,
          monto: pg.valor, montoColor: "var(--ok-ink)", filtro: pg.metodo === "Efectivo" ? "Efectivo" : "Transferencia",
          onClick: () => irFicha(pg.contrato_id),
          csv: { Fecha: fechaDeCaja(pg), Placa: placaDe(pg.contrato_id) ?? "", Cliente: nombreCliente(pg.contrato_id), Metodo: pg.metodo, Valor: pg.valor },
        })),
        chips: [{ clave: "Efectivo", etiqueta: "Efectivo" }, { clave: "Transferencia", etiqueta: "Transferencias" }],
        archivo,
  });
  const detalleCumplimiento = (filasMed: MotoRowG[], per: string): ContenidoDetalle => {
    const filas = filasMed.filter(r => r.cum.falto > 0 || r.cum.aAcuerdo > 0).sort((a, b) => b.cum.falto - a.cum.falto);
    return {
      titulo: `No completaron lo del período · ${filas.length}`,
      subtitulo: `${per}. El monto es lo que les faltó (sin pagar y sin acuerdo) de lo que se les vencía en el período.`,
      filas: filas.map(r => filaMoto(r, `Se le vencía ${plata(r.cum.debia)} · pagó ${plata(r.cum.cubrio)}${r.cum.aAcuerdo > 0 ? ` · pasó a acuerdo ${plata(r.cum.aAcuerdo)}` : ""}`, r.cum.falto, "var(--bad-ink)")),
      archivo: `cumplimiento_${desde}_${hasta}`,
    };
  };

  function abrirDetalle(clave: string) {
    const per = textoRango(desde, hasta);
    if (clave === "recaudo" || clave.startsWith("serie:")) {
      const [, a, b] = clave.split(":");
      const lista = clave === "recaudo" ? pagosFiltrados : pagosFiltrados.filter(p => fechaDeCaja(p) >= a && fechaDeCaja(p) <= b);
      setDetalle(detallePagos(lista, `Pagos · ${clave === "recaudo" ? per : textoRango(a, b)}`, `pagos_${desde}_${hasta}`));
      return;
    }
    if (clave === "cumplimiento") {
      setDetalle(detalleCumplimiento(medibleR, per));
      return;
    }
    if (clave.startsWith("hoy:") || clave === "aviso:recoleccion" || clave.startsWith("tramo:")) {
      const k = clave === "aviso:recoleccion" ? "recoleccion" : clave.startsWith("tramo:") ? "mora" : clave.slice(4);
      const tramo = clave.startsWith("tramo:") ? clave.slice(6) : null;
      if (k === "aldia") {
        setDetalle({ titulo: `Al día · ${alDiaF.length}`, subtitulo: "Hoy no deben nada vencido.", filas: alDiaF.map(r => filaMoto(r, `Paga ${r.diaPago || r.formaPago}`, null)), accion: aCartera("contratos:al-dia"), archivo: "al_dia" });
      } else if (k === "gabela") {
        setDetalle({ titulo: `Gabela · ${gabelaF.length}`, subtitulo: "Les venció ayer: hoy es su día de gracia.", filas: gabelaF.map(r => filaMoto(r, "Día de gracia", r.debeHoy, "var(--warn-ink)")), accion: aCartera("contratos:gabela"), archivo: "gabela" });
      } else if (k === "taller") {
        setDetalle({
          titulo: `Con la moto en el taller · ${tallerF.length}`,
          subtitulo: "Su contrato sigue corriendo y deben su semana, pero no tienen la moto para trabajar. No cuentan como mora ni en el porcentaje del cobrador.",
          filas: tallerF.map(r => filaMoto(r, `Moto ${sitioDe(r)}`, r.debeHoy, r.debeHoy > 0 ? "var(--bad-ink)" : undefined)), archivo: "moto_en_taller",
        });
      } else if (k === "liquidacion") {
        setDetalle({
          titulo: `En liquidación · ${liquidacionF.length}`,
          subtitulo: "Se les detuvo el contrato y la moto ya la tiene otro cliente: falta cerrarles la cuenta.",
          filas: liquidacionF.map(r => filaMoto(r, "La moto ya la tiene otro cliente", r.debeHoy, r.debeHoy > 0 ? "var(--bad-ink)" : undefined)), archivo: "en_liquidacion",
        });
      } else if (k === "mora") {
        const f = tramo ? enMoraF.filter(r => tramoDe(r.diasMora) === tramo) : enMoraF;
        const et = tramo ? tramosR.find(t => t.clave === tramo)?.etiqueta : null;
        setDetalle({
          titulo: et ? `En mora · ${et} · ${f.length}` : `En mora · ${f.length}`,
          subtitulo: `Deben ${plata(f.reduce((s, r) => s + r.debeHoy, 0))} entre todos. Primero los de más días.${!tramo && tallerF.length > 0 ? ` En Cartera también salen los ${tallerF.length} con la moto en el taller, porque deben su semana.` : ""}`,
          filas: f.map(r => filaMoto(r, `${r.diasMora} ${r.diasMora === 1 ? "día" : "días"} en mora${r.recoleccion ? " · en recolección" : ""}`, r.debeHoy, "var(--bad-ink)", tramoDe(r.diasMora))),
          chips: tramo ? undefined : chipsTramos, accion: aCartera("contratos:mora"), archivo: "en_mora",
        });
      } else if (k === "recoleccion") {
        const f = enMoraF.filter(r => r.recoleccion);
        setDetalle({ titulo: `En recolección · ${f.length}`, subtitulo: "Más de 3 días en mora, sin plazo extra y con la moto en la calle.", filas: f.map(r => filaMoto(r, `${r.diasMora} días en mora`, r.debeHoy, "var(--bad-ink)")), accion: aCartera("hoy:recoleccion"), archivo: "recoleccion" });
      } else if (k === "retenidas") {
        const sitios = [...new Set(retenidasF.map(sitioDe))];
        setDetalle({
          titulo: `Retenidas por no pagar · ${retenidasF.length}`,
          subtitulo: "Contratos detenidos por falta de pago cuya moto no tiene otro cliente. Al lado de cada uno, dónde está la moto.",
          filas: retenidasF.map(r => filaMoto(r, `Moto ${sitioDe(r)}`, r.debeHoy, "var(--bad-ink)", sitioDe(r))),
          chips: sitios.length > 1 ? sitios.map(x => ({ clave: x, etiqueta: x.charAt(0).toUpperCase() + x.slice(1) })) : undefined,
          accion: aCartera("contratos:retenidos"), archivo: "retenidas",
        });
      }
      return;
    }
    if (clave.startsWith("cierre:") && cierreR) {
      const k = clave.slice(7);
      const f = cierreR.filter(x => k === "recoleccion" ? x.recoleccion : k === "retenidas" ? x.estado === "retenida" : x.estado === k).sort((a, b) => b.diasMora - a.diasMora);
      const nombre = ({ aldia: "Al día", gabela: "Gabela", mora: "En mora", recoleccion: "En recolección", retenidas: "Retenidas por no pagar" } as Record<string, string>)[k] ?? k;
      setDetalle({
        titulo: `${nombre} al ${cierreTexto} · ${f.length}`,
        subtitulo: "Reconstruido con la fecha de cada pago. Toca uno para ver cómo está hoy.",
        filas: f.map(x => filaMoto(x.r, x.estado === "mora" ? `Al ${cierreTexto}: ${x.diasMora} días en mora` : x.estado === "retenida" ? `Al ${cierreTexto}: moto retenida` : `Al ${cierreTexto}: ${nombre.toLowerCase()}`, null)),
        archivo: `${k}_al_${hasta}`,
      });
      return;
    }
    if (clave === "sinproducir") {
      const f = guardadasF.slice().sort((a, b) => (b.dias ?? -1) - (a.dias ?? -1));
      setDetalle({
        titulo: `Motos guardadas · ${f.length}`,
        subtitulo: "Días quietas por la tarifa diaria: lo que aproximadamente dejaron de facturar.",
        filas: f.map(g => ({
          id: g.motoId, placa: g.placa, grupo: g.grupo, titulo: g.clienteNombre || "Sin cliente",
          subtitulo: `${g.motivo} · ${g.donde} · ${g.dias == null ? "sin fecha de entrada" : `${g.dias} días`}`,
          monto: g.dias == null ? null : g.dias * tarifaDiaDe(g), montoColor: "var(--orange-ink)",
          onClick: () => { setDetalle(null); onNavigate?.("ficha_moto", g.motoId); },
          csv: { Placa: g.placa, Cliente: g.clienteNombre || "", Grupo: g.grupo, Motivo: g.motivo, Donde: g.donde, Dias: g.dias ?? "", Estimado: g.dias == null ? "" : g.dias * tarifaDiaDe(g) },
        })),
        accion: { texto: "Ver en Guardadas", onClick: () => { setDetalle(null); setTab("guardadas"); } },
        archivo: "motos_guardadas",
      });
      return;
    }
    if (clave === "aviso:base") {
      setDetalle({
        titulo: `Cerca de completar la base · ${diasBaseF.length}`,
        subtitulo: "Clientes diarios con más de $450.000 ahorrados: hay que preparar el cambio de contrato al llegar a $510.000.",
        filas: diasBaseF.map(c => ({ id: c.id, placa: placaDe(c.id), grupo: grupoDe(c.id), titulo: nombreCliente(c.id), subtitulo: "Lleva ahorrado", monto: ahorroTotal(c), montoColor: "var(--ok-ink)", onClick: () => irFicha(c.id), csv: { Placa: placaDe(c.id) ?? "", Cliente: nombreCliente(c.id), Ahorro: ahorroTotal(c) } })),
        archivo: "cerca_de_la_base",
      });
      return;
    }
    if (clave === "aviso:documentos") {
      const filas: FilaDetalle[] = [
        ...docsF.map(a => {
          const m = motos.find(x => x.id === a.id);
          const partes = [a.seguro && `SOAT ${fmtFechaCorta(a.seguro)}`, a.tecno && `tecno ${fmtFechaCorta(a.tecno)}`].filter(Boolean).join(" · ");
          return { id: a.id, placa: a.placa, grupo: m?.grupo, titulo: m ? `${m.marca} ${m.modelo}` : a.placa, subtitulo: partes, badge: a.vencida ? { texto: "Vencido", tono: "bad" as const } : { texto: "Por vencer", tono: "warn" as const }, filtro: a.vencida ? "vencido" : "porvencer", onClick: () => { setDetalle(null); onNavigate?.("ficha_moto", a.id); }, csv: { Placa: a.placa, SOAT: a.seguro ?? "", Tecno: a.tecno ?? "", Estado: a.vencida ? "Vencido" : "Por vencer" } };
        }),
        ...sinSoatF.map(m => ({ id: m.id, placa: m.placa, grupo: m.grupo, titulo: `${m.marca} ${m.modelo}`, subtitulo: `Sin fecha de SOAT · ${m.estado}`, badge: { texto: "Sin fecha", tono: "neutral" as const }, filtro: "sinfecha", onClick: () => { setDetalle(null); onNavigate?.("ficha_moto", m.id); }, csv: { Placa: m.placa, SOAT: "", Tecno: m.fecha_tecnomecanica ?? "", Estado: "Sin fecha de SOAT" } })),
      ];
      setDetalle({
        titulo: "Documentos de las motos",
        subtitulo: "SOAT y tecnomecánica vencidos o que vencen en los próximos 30 días, y motos sin fecha de SOAT.",
        filas, chips: [{ clave: "vencido", etiqueta: "Vencidos" }, { clave: "porvencer", etiqueta: "Por vencer" }, { clave: "sinfecha", etiqueta: "Sin fecha" }],
        archivo: "documentos_motos",
      });
    }
  }

  return (
    <div>
      {/* Encabezado: legible de día y de noche. Antes: letra blanca sobre fondo claro, 1,1 a 1 (2-oct). */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        {!isMobile && (
          <div>
            <h2 style={{ fontSize: 22, margin: 0, fontWeight: 600, color: "var(--text)" }}>Reportes</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted2)" }}>Cómo va la empresa, con cifras que se revisan solas.</p>
          </div>
        )}
        <div style={{ textAlign: isMobile ? "left" : "right" }}>
          <div style={{ fontSize: 12, color: "var(--muted2)" }}>Recaudado hoy</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{sinDatos ? "…" : `$ ${fmt(recaudadoHoy)}`}</div>
        </div>
        {/* Descargar (antes la pestaña "Exportar"): PDF gerencial, Excel e impresión. Solo con el permiso. */}
        {puedeExportar && (
          <button onClick={() => setTab("exportar")} aria-pressed={tab === "exportar"}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 40, padding: "0 14px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500,
              border: "1px solid " + (tab === "exportar" ? "var(--accent-line)" : "var(--line2)"), background: tab === "exportar" ? "var(--accent-soft)" : "var(--card)", color: tab === "exportar" ? "var(--accent-ink)" : "var(--text)" }}>
            <Download size={16} aria-hidden="true" /> Descargar
          </button>
        )}
      </div>

      {/* El menú: 5 secciones por la pregunta que responden, y sus partes (rediseño 2-oct). */}
      <MenuReportes tab={tab} onTab={setTab} />

      {/* La barra de filtros: período, grupo y cobrador mandan sobre todo lo de abajo. En las pestañas
          que son "foto de hoy" (o tienen su propio selector, como Nómina) se dice en vez de mostrarla. */}
      {TABS_SIN_FECHA[tab] && tab !== "flota" && tab !== "guardadas" ? (
        <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 10, background: "var(--soft2)", border: "1px solid var(--line)", fontSize: 12, color: "var(--muted2)" }}>
          {TABS_SIN_FECHA[tab]}
        </div>
      ) : (
        <BarraFiltros
          isMobile={isMobile}
          periodo={rango}
          opcionesPeriodo={RANGOS.map(r => ({ valor: r.key, etiqueta: r.label }))}
          onPeriodo={v => setRango(v as Rango)}
          textoPeriodo={textoRango(desde, hasta)}
          grupo={filtros.grupo.length === 1 ? filtros.grupo[0] : filtros.grupo.length > 1 ? "__varios__" : ""}
          opcionesGrupo={[{ valor: "", etiqueta: "Todos los grupos" }, ...GRUPOS.map(g => ({ valor: g, etiqueta: g })), ...(filtros.grupo.length > 1 ? [{ valor: "__varios__", etiqueta: `${filtros.grupo.length} grupos` }] : [])]}
          onGrupo={v => { if (v !== "__varios__") setFiltros(f => ({ ...f, grupo: v ? [v] : [] })); }}
          cobrador={filtros.cobrador.length === 1 ? filtros.cobrador[0] : filtros.cobrador.length > 1 ? "__varios__" : ""}
          opcionesCobrador={[{ valor: "", etiqueta: "Todos los cobradores" }, ...subadmins.map(sa => ({ valor: sa.id, etiqueta: sa.nombre })), { valor: "__none__", etiqueta: "Sin asignar" }, ...(filtros.cobrador.length > 1 ? [{ valor: "__varios__", etiqueta: `${filtros.cobrador.length} cobradores` }] : [])]}
          onCobrador={v => { if (v !== "__varios__") setFiltros(f => ({ ...f, cobrador: v ? [v] : [] })); }}
          mostrarGrupoCobrador={tab === "resumen" || tab === "admins" || tab === "grupos" || tab === "exportar" || tab === "flota" || tab === "guardadas" || tab === "entregas"}
          soloHoy={tab === "flota" || tab === "guardadas"}
          {...(tab === "grupos" || tab === "admins" ? {
            modalidad: filtros.modalidad.length === 1 ? filtros.modalidad[0] : "",
            opcionesModalidad: [{ valor: "", etiqueta: "Todas las modalidades" }, ...MODALIDADES.map(m => ({ valor: m, etiqueta: m }))],
            onModalidad: (v: string) => setFiltros(f => ({ ...f, modalidad: v ? [v] : [] })),
          } : {})}
          personalizado={rango === "personalizado" ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 8, fontSize: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted2)" }}>Desde
                <input type="date" value={rangoCustom.desde} max={rangoCustom.hasta} onChange={e => setRangoCustom(c => ({ ...c, desde: e.target.value }))}
                  style={{ fontSize: 13, height: 40, padding: "0 8px", borderRadius: 10, border: "1px solid var(--line2)", background: "var(--soft2)", color: "var(--text)" }} />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted2)" }}>hasta
                <input type="date" value={rangoCustom.hasta} min={rangoCustom.desde} max={hoyStr} onChange={e => setRangoCustom(c => ({ ...c, hasta: e.target.value }))}
                  style={{ fontSize: 13, height: 40, padding: "0 8px", borderRadius: 10, border: "1px solid var(--line2)", background: "var(--soft2)", color: "var(--text)" }} />
              </label>
            </div>
          ) : undefined}
        />
      )}

      {/* ── TAB RESUMEN (rediseño, 2-oct-2026) ── */}
      {tab === "resumen" && sinDatos && (
        <div role="status" style={{ ...card, display: "grid", gap: 8, justifyItems: "start", textAlign: "left" }}>
          {errorDatos ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, color: "var(--bad-ink)" }}>
                <AlertTriangle size={18} aria-hidden="true" /> No se pudieron traer los datos
              </div>
              <div style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.5 }}>
                Sin ellos las cifras saldrían en cero. Revisa la conexión a internet y vuelve a intentar.
              </div>
              <button onClick={() => window.location.reload()} style={{ ...primaryBtn, minHeight: 44 }}>Volver a intentar</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Cargando las cifras…</div>
              <div style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.5 }}>
                Se están trayendo los pagos y los contratos. En un momento aparecen.
              </div>
            </>
          )}
        </div>
      )}

      {tab === "resumen" && !sinDatos && (
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr)" }}>
          {/* Avisos: tocar uno muestra a quiénes se refiere. */}
          {(() => {
            const avisos = [
              estadosR[3].hoy > 0 && { clave: "aviso:recoleccion", tono: "bad", icono: <AlertTriangle size={18} aria-hidden="true" />, texto: `${estadosR[3].hoy} en la cola de recolección`, sub: "Más de 3 días en mora, con la moto en la calle" },
              diasBaseF.length > 0 && { clave: "aviso:base", tono: "warn", icono: <PiggyBank size={18} aria-hidden="true" />, texto: `${diasBaseF.length} ${diasBaseF.length === 1 ? "cliente cerca" : "clientes cerca"} de completar la base`, sub: "Preparar el cambio de contrato al llegar a $510.000" },
              (docsF.length > 0 || sinSoatF.length > 0) && { clave: "aviso:documentos", tono: "warn", icono: <FileWarning size={18} aria-hidden="true" />, texto: `Documentos: ${docsF.filter(a => a.vencida).length} vencidos · ${docsF.filter(a => !a.vencida).length} por vencer`, sub: sinSoatF.length > 0 ? `${sinSoatF.length} motos sin fecha de SOAT` : "SOAT y tecnomecánica en los próximos 30 días" },
            ].filter(Boolean) as { clave: string; tono: "bad" | "warn"; icono: React.ReactNode; texto: string; sub: string }[];
            if (avisos.length === 0) return null;
            return (
              <div style={{ display: "grid", gap: 8 }}>
                {avisos.map(a => (
                  <button key={a.clave} onClick={() => abrirDetalle(a.clave)}
                    style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 52, padding: "8px 12px", textAlign: "left", cursor: "pointer", font: "inherit", borderRadius: 12,
                      border: `1px solid var(--${a.tono}-line)`, background: `var(--${a.tono}-soft)`, color: `var(--${a.tono}-ink)` }}>
                    {a.icono}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{a.texto}</span>
                      <span style={{ display: "block", fontSize: 12, opacity: 1, color: `var(--${a.tono}-ink)` }}>{a.sub}</span>
                    </span>
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                ))}
              </div>
            );
          })()}
          <ResumenReportes
            isMobile={isMobile}
            textoPeriodo={textoRango(desde, hasta)}
            verificaciones={verificacionesR}
            recaudo={recaudoR}
            antes={antesR}
            anterior={cobradorFiltrado ? null : { total: anteriorR, texto: textoRango(desdeAnt, hastaAnt), delta: deltaRecaudo(recaudoR.total, anteriorR) }}
            cumplimiento={cumplimientoR}
            estados={estadosR}
            cierreTexto={cierreTexto}
            tramos={tramosR.map(t => ({ clave: t.clave, etiqueta: t.etiqueta, n: t.filas.length, debe: t.debe }))}
            serie={serieR}
            grupos={gruposR}
            sinProducir={sinProducirR}
            mejores={mejoresR}
            onAbrir={abrirDetalle}
            onGrupo={g => setFiltros(f => ({ ...f, grupo: f.grupo.length === 1 && f.grupo[0] === g ? [] : [g] }))}
            onFicha={id => onNavigate?.("ficha_cliente", id)}
          />
        </div>
      )}

      {/* ── POR ADMIN: la misma pieza de Por grupo, en la mirada del cobrador (arriba, junto a Por grupo). ── */}

      {/* ── TAB NÓMINA de cobradores (regla del dueño, 22-ago) ── */}
      {tab === "nomina" && (() => {
        const fmtDia = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
        const nombreDe = (id: string | null) => id === null ? null : (subadmins.find(s => s.id === id)?.nombre ?? "COBRADOR");
        const TIPO_TXT: Record<TipoGestion, string> = {
          ciclo: "Ciclo a tiempo", ciclo_atrasado: `Ciclo atrasado (${PCT_ATRASADO}%)`,
          prorrateo: "Prorrateo", retencion: "Retención",
          cuota_convenio: `Convenio de retenida (${PCT_ATRASADO}%)`,
          visita: "Visita domiciliaria",
          referido: "Referido propio (lo trajo)",
        };
        const conCobrador = nominasVista.filter(n => n.subadminId !== null);
        const sinCobrador = nominasVista.find(n => n.subadminId === null);
        const totalSemana = conCobrador.reduce((s, n) => s + n.total, 0);
        return (
          <div style={{ display: "grid", gap: 16 }}>
            {/* Selector de semana (lunes a domingo) */}
            <div style={{ ...card, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => moverSemanaNomina(-1)} style={{ border: "1px solid var(--line)", background: "var(--soft2)", color: "var(--text)", borderRadius: 10, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>◀ Semana anterior</button>
              <div style={{ textAlign: "center", minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Semana del {fmtDia(lunesNomina)} al {fmtDia(domingoNomina)}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Total nómina: <b style={{ color: "var(--text)" }}>$ {fmt(totalSemana)}</b></div>
              </div>
              <button onClick={() => moverSemanaNomina(1)} disabled={domingoNomina >= hoyISO()}
                style={{ border: "1px solid var(--line)", background: "var(--soft2)", color: "var(--text)", borderRadius: 10, padding: "8px 14px", fontWeight: 700, cursor: domingoNomina >= hoyISO() ? "not-allowed" : "pointer", opacity: domingoNomina >= hoyISO() ? 0.4 : 1 }}>Siguiente ▶</button>
            </div>

            {/* La regla, visible siempre: el texto se explica solo */}
            <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--accent-soft2)", border: "1px solid var(--accent-line)", fontSize: 12.5, color: "var(--accent-ink)", lineHeight: 1.5 }}>
              Se paga por <b>moto gestionada</b>: ciclo cobrado a tiempo <b>$ {fmt(VALOR_CICLO)}</b> (una vez por ciclo del cliente) ·
              ciclo atrasado que entra después <b>$ {fmt(VALOR_ATRASADO)}</b> ({PCT_ATRASADO}%) ·
              retención <b>$ {fmt(VALOR_RETENCION)}</b> (una sola vez, la semana en que se retiene) ·
              en mora sin pagar y sin retener <b>$ 0</b>. Los contratos <b>Diarios no entran</b>.
              <br />
              El cliente con <b>convenio</b> paga su semana y su cuota como <b>un solo paquete</b>: el
              ciclo se paga cuando el paquete queda completo — nunca por cuota suelta. Única excepción:
              la moto <b>retenida</b>, que paga <b>$ {fmt(VALOR_ATRASADO)}</b> por semana en que abone a su convenio.
              <br />
              La <b>visita domiciliaria</b> vale <b>$ {fmt(VALOR_VISITA)}</b> y la cobra <b>quien la hizo</b>,
              en la semana en que se <b>entrega la moto</b>. Si después la validación dice que la moto
              no duerme donde el cliente declaró, esa visita <b>no se paga</b>.
            </div>

            {/* Semana anterior al vigía (mig 112, 22-ago): sus anotaciones estarían incompletas, así
                que la nómina calcula desde los PAGOS. Antes este aviso dependía de "¿llegaron
                eventos?" — y con 5 eventos sueltos de una semana de 137 pagos no salía, mientras
                la pantalla mostraba un total en el que no se podía confiar. */}
            {!nominaLista && (
              <div role="status" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "12px 14px", borderRadius: 12, textAlign: "left",
                background: nominaError ? "var(--bad-soft)" : "var(--accent-soft2)", border: "1px solid " + (nominaError ? "var(--bad-ink)" : "var(--accent-line)"),
                fontSize: 13, color: nominaError ? "var(--bad-ink)" : "var(--accent-ink)", lineHeight: 1.5 }}>
                <span style={{ flex: "1 1 220px", minWidth: 0 }}>
                  {nominaError
                    ? <>No se pudo traer toda la información de esta semana. <b>No pagues ni imprimas con estas cifras.</b></>
                    : <>Cargando la nómina completa de esta semana. Espera a que termine antes de pagar o imprimir.</>}
                </span>
                {nominaError && (
                  <button onClick={reintentarNomina} style={{ ...primaryBtn, minHeight: 44, flexShrink: 0 }}>Volver a intentar</button>
                )}
              </div>
            )}

            {!vigiaCubre(lunesNomina) && (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-ink)", fontSize: 12.5, color: "var(--warn-ink)", lineHeight: 1.5 }}>
                ⚠️ <b>Semana anterior al registro exacto de ciclos</b> (existe desde el 22 de agosto).
                Estas cifras se calculan releyendo los pagos, y son confiables para los contratos con
                motor sin convenios ni ajustes hechos a mano. <b>Revisa el desprendible antes de pagar.</b>
              </div>
            )}

            {/* LAS VISITAS, APARTE (pedido del dueño, 1-sep: "separa las visitas aparte para ver
                solo el total de las visitas"). Es plata de otra naturaleza: no es cobrar una
                semana, es haber ido a la casa. Y la cobra quien la hizo, no el dueño de la moto. */}
            {(() => {
              const visitas = conCobrador.flatMap(n =>
                n.renglones.filter(r => r.tipo === "visita").map(r => ({ ...r, quien: nombreDe(n.subadminId) ?? "SIN COBRADOR" })));
              if (visitas.length === 0) return null;
              const total = visitas.reduce((a, r) => a + r.valor, 0);
              const porQuien = new Map<string, number>();
              const porGrupo = new Map<string, number>();
              for (const v of visitas) {
                porQuien.set(v.quien, (porQuien.get(v.quien) ?? 0) + v.valor);
                porGrupo.set(v.grupo, (porGrupo.get(v.grupo) ?? 0) + v.valor);
              }
              return (
                <div style={{ ...card, display: "grid", gap: 10, background: "var(--accent-soft2)", border: "1px solid var(--accent-line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "var(--accent-ink)" }}>🏠 Visitas domiciliarias</div>
                      <div style={{ fontSize: 12, color: "var(--accent-ink)", marginTop: 2 }}>
                        {visitas.length} visita{visitas.length === 1 ? "" : "s"} × $ {fmt(VALOR_VISITA)} — se pagan al entregarse la moto
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 22, fontVariantNumeric: "tabular-nums", color: "var(--accent-ink)", flexShrink: 0 }}>$ {fmt(total)}</div>
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--accent-ink)" }}>Quién las hizo</div>
                    {[...porQuien.entries()].sort((a, b) => b[1] - a[1]).map(([q, v]) => (
                      <div key={q} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12.5, color: "var(--accent-ink)" }}>
                        <span style={{ minWidth: 0, textTransform: "uppercase" }}>{q}</span>
                        <b style={{ flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>$ {fmt(v)}</b>
                      </div>
                    ))}
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--accent-ink)", marginTop: 4 }}>Qué portafolio las paga</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[...porGrupo.entries()].sort((a, b) => b[1] - a[1]).map(([g, v]) => (
                        <span key={g} style={{ fontSize: 11, fontWeight: 700, background: "var(--card)", border: "1px solid var(--accent-line)", borderRadius: 999, padding: "3px 9px", color: "var(--accent-ink)" }}>
                          {g} $ {fmt(v)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <details>
                    <summary style={{ cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--accent-ink)" }}>Ver las {visitas.length} visitas</summary>
                    <div style={{ display: "grid", gap: 4, marginTop: 8 }}>
                      {visitas.sort((a, b) => a.fecha.localeCompare(b.fecha)).map((v, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 0, fontSize: 12, color: "var(--accent-ink)", borderTop: "1px solid var(--accent-line)", paddingTop: 4 }}>
                          <span style={{ fontWeight: 700, flexShrink: 0 }}>{v.placa}</span>
                          <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "uppercase" }}>{v.cliente}</span>
                          <span style={{ flexShrink: 0, opacity: 0.8 }}>{fmtDia(v.fecha)}</span>
                          <b style={{ flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>$ {fmt(v.valor)}</b>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              );
            })()}

            {/* LO QUE PAGA CADA PORTAFOLIO (pedido del dueño, 1-sep): cada grupo paga la gestión de
                SUS motos. Los chips de cada cobrador dicen de dónde sale su plata; este bloque lo
                muestra al revés — cuánto pone cada portafolio en total y entre quiénes se reparte. */}
            {conCobrador.length > 0 && (() => {
              const porGrupo = new Map<string, { total: number; porCobrador: Map<string, number> }>();
              for (const n of conCobrador) {
                for (const r of n.renglones) {
                  if (!porGrupo.has(r.grupo)) porGrupo.set(r.grupo, { total: 0, porCobrador: new Map() });
                  const g = porGrupo.get(r.grupo)!;
                  g.total += r.valor;
                  const quien = nombreDe(n.subadminId) ?? "SIN COBRADOR";
                  g.porCobrador.set(quien, (g.porCobrador.get(quien) ?? 0) + r.valor);
                }
              }
              const filas = [...porGrupo.entries()].sort((a, b) => b[1].total - a[1].total);
              return (
                <div style={{ ...card, display: "grid", gap: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>Lo que pone cada portafolio</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: -4 }}>
                    Cada grupo paga la gestión de sus propias motos. Las visitas las paga el portafolio
                    de la moto que se entregó.
                  </div>
                  {filas.map(([grupo, g]) => (
                    <div key={grupo} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "8px 10px", borderRadius: 12, background: "var(--soft2)", border: "1px solid var(--line)" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 13.5 }}>{grupo}</div>
                        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                          {[...g.porCobrador.entries()].sort((a, b) => b[1] - a[1])
                            .map(([q, v]) => `${q}: $ ${fmt(v)}`).join(" · ")}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 17, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>$ {fmt(g.total)}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {conCobrador.length === 0 && (
              <div style={{ ...card, textAlign: "center", color: "var(--muted)" }}>Sin gestiones pagables en esta semana.</div>
            )}

            {conCobrador.map(n => {
              const abierto = nominaExp === (n.subadminId ?? "");
              return (
                <div key={n.subadminId} style={card}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase" }}>{nombreDe(n.subadminId)}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                        {n.ciclosATiempo > 0 && <span>{n.ciclosATiempo} a tiempo · </span>}
                        {n.prorrateos > 0 && <span>{n.prorrateos} prorrateo{n.prorrateos === 1 ? "" : "s"} · </span>}
                        {n.ciclosAtrasados > 0 && <span>{n.ciclosAtrasados} atrasado{n.ciclosAtrasados === 1 ? "" : "s"} · </span>}
                        {n.cuotasConvenio > 0 && <span>{n.cuotasConvenio} cuota{n.cuotasConvenio === 1 ? "" : "s"} de convenio · </span>}
                        {n.retenciones > 0 && <span>{n.retenciones} retención{n.retenciones === 1 ? "" : "es"} · </span>}
                        {n.visitas > 0 && <span>{n.visitas} visita{n.visitas === 1 ? "" : "s"} · </span>}
                        {n.referidos > 0 && <span>{n.referidos} referido{n.referidos === 1 ? "" : "s"} · </span>}
                        {n.renglones.length} gestiones
                      </div>
                      {/* CUÁNTAS TIENE vs CUÁNTAS PAGARON (15-sep). Antes solo se veía lo que se
                          paga: un cobrador con 99 motos veía 30 renglones y no sabía qué pasó con
                          las otras 69. */}
                      {(() => {
                        // 🔴 SOLO MIENTRAS LA SEMANA SIGA ABIERTA. El reverso se calcula EN VIVO y una
                        // semana cerrada muestra las cifras CONGELADAS: si un pago se rechaza después
                        // del cierre, la misma tarjeta diría "se le pagó por esta moto" arriba y "no
                        // pagó" abajo. Dos cuentas del mismo hecho no pueden convivir (regla del dinero).
                        if (n.subadminId && cierreDe(n.subadminId)) return null;
                        const asignadas = motos.filter(m => m.subadmin_id === n.subadminId).length;
                        const noPagaron = sinGestionPorCobrador.get(n.subadminId ?? "")?.length ?? 0;
                        if (asignadas === 0) return null;
                        return (
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                            <b style={{ color: "var(--text)" }}>{asignadas}</b> motos asignadas ·{" "}
                            <b style={{ color: "var(--ok-ink)" }}>{asignadas - noPagaron}</b> con gestión ·{" "}
                            <b style={{ color: noPagaron > 0 ? "var(--warn-ink)" : "var(--muted)" }}>{noPagaron}</b> sin gestión
                          </div>
                        );
                      })()}
                      {/* De qué portafolio sale la plata de esta nómina (pedido del dueño):
                          la gestión de cada moto la paga el grupo dueño de esa moto. */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                        {totalesPorGrupo(n.renglones).map(g => (
                          <span key={g.grupo} style={{ fontSize: 11, fontWeight: 700, background: "var(--soft)", border: "1px solid var(--line)", borderRadius: 999, padding: "2px 8px", color: "var(--muted2)" }}>
                            {g.grupo} paga $ {fmt(g.total)}
                          </span>
                        ))}
                      </div>
                    </div>
                    {(() => {
                      // El total del cobrador, partido: lo de COBRAR y lo de VISITAR son trabajos
                      // distintos y el dueño los quiere ver por separado.
                      const enVisitas = n.renglones.filter(r => r.tipo === "visita").reduce((a, r) => a + r.valor, 0);
                      return (
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 20, fontVariantNumeric: "tabular-nums" }}>$ {fmt(n.total)}</div>
                          {enVisitas > 0 && (
                            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1, whiteSpace: "nowrap" }}>
                              cobros $ {fmt(n.total - enVisitas)} · visitas $ {fmt(enVisitas)}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    <button onClick={() => setNominaExp(abierto ? null : (n.subadminId ?? ""))}
                      style={{ border: "1px solid var(--line)", background: "var(--soft2)", color: "var(--text)", borderRadius: 10, padding: "8px 12px", fontWeight: 700, cursor: "pointer", fontSize: 12.5 }}>
                      {abierto ? "Ocultar detalle" : "Ver detalle"}
                    </button>
                    {/* CERRAR Y PAGAR (mig 120): congela las cifras, guarda firma y foto. Si ya
                        está cerrada, en vez del botón va el sello de pagado. */}
                    {n.subadminId && (cierreDe(n.subadminId)
                      ? (() => {
                          const ci = cierreDe(n.subadminId)!;
                          return (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--ok-soft)", border: "1px solid var(--ok-line)", color: "var(--ok-ink)", borderRadius: 10, padding: "8px 12px", fontWeight: 700, fontSize: 12.5, flexShrink: 0 }}>
                              ✓ Pagado {new Date(ci.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                              {ci.firma_url ? " · firmado" : " · SIN FIRMA"}
                            </span>
                          );
                        })()
                      : (
                        <button onClick={() => setCerrando(n.subadminId)} disabled={!nominaLista}
                          style={{ border: "none", background: "var(--ok-ink)", color: "var(--on-ink)", borderRadius: 10, padding: "8px 12px", fontWeight: 700, cursor: nominaLista ? "pointer" : "not-allowed", fontSize: 12.5, flexShrink: 0, opacity: nominaLista ? 1 : 0.5 }}>
                          {nominaLista ? "✓ Cerrar y pagar" : nominaError ? "No se puede pagar" : "Cargando…"}
                        </button>
                      ))}
                    <button disabled={!nominaLista} onClick={() => generarDesprendibleNomina(n, nombreDe(n.subadminId) ?? "", lunesNomina, domingoNomina, profile?.nombre ?? "", {
                      // Una semana cerrada se imprime tal como se pagó: sin el reverso vivo, que
                      // hoy podría decir otra cosa que las cifras congeladas de ese día.
                      sinGestion: n.subadminId && cierreDe(n.subadminId) ? [] : (sinGestionPorCobrador.get(n.subadminId ?? "") ?? []),
                      motosAsignadas: n.subadminId && cierreDe(n.subadminId) ? 0 : motos.filter(m => m.subadmin_id === n.subadminId).length,
                    })}
                      style={{ border: "none", background: "var(--accent)", color: "#0f172a", borderRadius: 10, padding: "8px 12px", fontWeight: 700, cursor: nominaLista ? "pointer" : "not-allowed", fontSize: 12.5, opacity: nominaLista ? 1 : 0.5 }}>
                      🖨️ Desprendible
                    </button>
                  </div>
                  {n.subadminId && derivaNomina.has(n.subadminId) && (
                    <div style={{ marginTop: 8, padding: "7px 10px", borderRadius: 10, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", fontSize: 12, color: "var(--warn-ink)", lineHeight: 1.45 }}>
                      Entró plata de esta semana <b>después</b> de pagarla. Se le pagó $ {fmt(n.total)};
                      con lo de hoy daría $ {fmt(derivaNomina.get(n.subadminId)!)} —
                      la diferencia de $ {fmt(Math.abs(derivaNomina.get(n.subadminId)! - n.total))} va en la próxima.
                    </div>
                  )}
                  {abierto && (
                    <div style={{ marginTop: 12, borderTop: "1px solid var(--line)", paddingTop: 8, maxHeight: "48vh", overflowY: "auto" }}>
                      {n.renglones.map((r, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--line)", fontSize: 12.5, minWidth: 0 }}>
                          <span style={{ fontWeight: 800, letterSpacing: 0.5, flexShrink: 0 }}>{r.placa}</span>
                          <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 700, color: "var(--faint)" }}>{r.grupo}</span>
                          <span style={{ flex: 1, minWidth: 0, textTransform: "uppercase", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.cliente}</span>
                          <span style={{ flexShrink: 0, fontSize: 11.5, color: r.tipo === "retencion" ? "var(--warn-ink)" : r.tipo === "ciclo_atrasado" ? "var(--bad-ink)" : "var(--ok-ink)" }}>{TIPO_TXT[r.tipo]}</span>
                          <span style={{ flexShrink: 0, color: "var(--faint)", fontSize: 11.5 }}>{fmtDia(r.fecha)}</span>
                          <span style={{ flexShrink: 0, fontWeight: 800, fontVariantNumeric: "tabular-nums", width: 72, textAlign: "right" }}>$ {fmt(r.valor)}</span>
                        </div>
                      ))}
                      {/* EL REVERSO: lo que NO se pagó, con el motivo de cada moto. Pedido del
                          dueño (15-sep): "quiero que salgan ahí también los que no pagaron".
                          Va con placa y cliente para que el cobrador pueda reclamar con el papel
                          en la mano — mismo criterio que el desprendible. */}
                      {(() => {
                        // Misma razón que el contador: en una semana ya pagada manda lo congelado.
                        if (n.subadminId && cierreDe(n.subadminId)) return null;
                        const faltantes = sinGestionPorCobrador.get(n.subadminId ?? "") ?? [];
                        if (faltantes.length === 0) return null;
                        const porMotivo = [...new Set(faltantes.map(f => f.motivo))]
                          .map(mv => ({ mv, lista: faltantes.filter(f => f.motivo === mv) }))
                          // Primero lo que es gestión pendiente de verdad; al final lo que no tiene cliente.
                          .sort((a, b) => a.lista.length - b.lista.length)
                          .sort((a, b) => Number(a.mv === "sin_contrato") - Number(b.mv === "sin_contrato"));
                        return (
                          <div style={{ marginTop: 14, paddingTop: 10, borderTop: "2px dashed var(--line2)" }}>
                            <div style={{ fontWeight: 800, fontSize: 12.5, color: "var(--warn-ink)", marginBottom: 6 }}>
                              NO SE PAGÓ — {faltantes.length} moto{faltantes.length === 1 ? "" : "s"}
                            </div>
                            {porMotivo.map(({ mv, lista }) => (
                              <div key={mv} style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted2)", marginBottom: 2 }}>
                                  {lista.length} · {TEXTO_SIN_GESTION[mv]}
                                </div>
                                {lista.map(f => (
                                  <div key={f.motoId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 12, minWidth: 0, opacity: mv === "sin_contrato" || mv === "diario" ? 0.6 : 1 }}>
                                    <span style={{ fontWeight: 800, letterSpacing: 0.5, flexShrink: 0 }}>{f.placa}</span>
                                    <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 700, color: "var(--faint)" }}>{f.grupo}</span>
                                    <span style={{ flex: 1, minWidth: 0, textTransform: "uppercase", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.cliente}</span>
                                    <span style={{ flexShrink: 0, fontWeight: 800, color: "var(--faint)", fontVariantNumeric: "tabular-nums", width: 72, textAlign: "right" }}>$ 0</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Gestiones de motos SIN cobrador: esa plata no se le paga a nadie — para que el dueño asigne */}
            {sinCobrador && (
              <div style={{ ...card, background: "var(--warn-soft)", border: "1px solid var(--warn-ink)" }}>
                <div style={{ fontWeight: 800, color: "var(--warn-ink)" }}>⚠️ {sinCobrador.renglones.length} gestiones de motos SIN cobrador asignado (valdrían $ {fmt(sinCobrador.total)})</div>
                <div style={{ fontSize: 12.5, color: "var(--warn-ink)", marginTop: 4 }}>
                  No se le pagan a nadie. Asigna el cobrador en Motos → editar → sub-admin a cargo: {[...new Set(sinCobrador.renglones.map(r => r.placa))].join(" · ")}
                </div>
              </div>
            )}

            {/* CERRAR Y PAGAR la semana de un cobrador (mig 120) */}
            {cerrando && (() => {
              const n = nominas.find(x => x.subadminId === cerrando);   // se cierra con el cálculo VIVO
              if (!n) return null;
              const nombre = nombreDe(n.subadminId) ?? "COBRADOR";
              return (
                <ModalCerrarNomina
                  nomina={n}
                  cobradorNombre={nombre}
                  lunes={lunesNomina}
                  domingo={domingoNomina}
                  onClose={() => setCerrando(null)}
                  onCerrar={({ firmaDataUrl, fotoDataUrl, observacion }) => cerrarSemana({
                    semanaLunes: lunesNomina,
                    subadminId: n.subadminId,
                    cobradorNombre: nombre,
                    total: n.total,
                    renglones: n.renglones,
                    totalesGrupo: totalesPorGrupo(n.renglones),
                    firmaDataUrl, fotoDataUrl, observacion,
                    cerradoPor: profile?.id ?? "",
                  })}
                />
              );
            })()}
          </div>
        );
      })()}

      {/* ── TAB POR GRUPO (cada moto muestra QUIÉN la tiene asignada) ── */}
      {tab === "grupos" && sinDatos && <div role="status" style={{ ...card, textAlign: "left", fontSize: 13, color: "var(--muted2)" }}>{errorDatos ? "No se pudieron traer los datos. Revisa la conexión y vuelve a intentar." : "Cargando las cifras…"}</div>}
      {(tab === "grupos" || tab === "admins") && sinDatos && <div role="status" style={{ ...card, textAlign: "left", fontSize: 13, color: "var(--muted2)" }}>{errorDatos ? "No se pudieron traer los datos. Revisa la conexión y vuelve a intentar." : "Cargando las cifras…"}</div>}
      {(tab === "grupos" || tab === "admins") && !sinDatos && portafolio && (
        <PortafoliosReportes
          modo={portafolio.modo}
          textoAnterior={textoRango(desdeAnt, hastaAnt)}
          lista={portafolio.lista}
          pieLista={portafolio.pie}
          detalle={portafolio.detalle}
          seleccionado={portafolio.sel}
          onElegir={k => setFiltros(f => portafolio.modo === "grupo"
            ? ({ ...f, grupo: f.grupo.length === 1 && f.grupo[0] === k ? [] : [k] })
            : ({ ...f, cobrador: f.cobrador.length === 1 && f.cobrador[0] === k ? [] : [k] }))}
          onAbrir={abrirDetallePortafolio}
          onCartera={() => onNavigate?.("cobros", portafolio.sel ? `contratos:todos;${portafolio.modo === "grupo" ? "grupo" : "cobrador"}:${portafolio.sel}` : "contratos:todos")}
          onDescargar={puedeExportar ? () => setDescarga(portafolio.modo === "grupo" ? "grupo" : "admin") : undefined}
          extraBotones={portafolio.modo === "cobrador" ? (
            <button onClick={() => setTab("nomina")} style={{ display: "inline-flex", flex: "1 1 140px", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44, borderRadius: 10, border: "1px solid var(--line2)", background: "transparent", color: "var(--text)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              <Wallet size={16} aria-hidden="true" /> Ver {portafolio.sel ? "su" : "la"} nómina
            </button>
          ) : undefined}
        />
      )}

      {/* ── TAB VISITAS por administrador ── */}
      {tab === "visitas" && (() => {
        const tVis = visitasData.reduce((s, a) => s + a.total, 0);
        const tAprob = visitasData.reduce((s, a) => s + a.aprobadas, 0);
        const tRech = visitasData.reduce((s, a) => s + a.rechazadas, 0);
        const tPend = visitasData.reduce((s, a) => s + a.pendientes, 0);
        const tSinRes = visitasData.reduce((s, a) => s + a.sinResultado, 0);
        const tRep = visitasData.reduce((s, a) => s + a.repetir, 0);
        const resLabel = (est: string, res: string | null) => est === "Pendiente" ? "⏳ Pendiente" : res === "Aprobado" ? "✓ Aprobado" : res === "Rechazado" ? "✗ Rechazado" : res === "Repetir" ? "↻ Repetir" : "—";
        const resColor = (est: string, res: string | null) => est === "Pendiente" ? "var(--warn-ink)" : res === "Aprobado" ? "var(--ok-ink)" : res === "Rechazado" ? "var(--bad-ink)" : "var(--muted)";
        const badge = (n: number, txt: string, color: string, bg: string) => n > 0 ? <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 8, padding: "2px 7px", whiteSpace: "nowrap" }}>{n} {txt}</span> : null;
        return (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
              <KPI label="Visitas" value={`${tVis}`} />
              <KPI label="Aprobadas" value={`${tAprob}`} color="var(--ok-ink)" bg="var(--ok-soft)" />
              <KPI label="Rechazadas" value={`${tRech}`} color="var(--bad-ink)" bg="var(--bad-soft)" />
              {/* Las cajitas suman el total de visitas (antes faltaban "Repetir" y "Sin resultado"). */}
              <KPI label="Repetir" value={`${tRep}`} color="var(--muted2)" />
              <KPI label="Pendientes" value={`${tPend}`} color="var(--warn-ink)" bg="var(--warn-soft)" />
              {tSinRes > 0 && <KPI label="Sin resultado" value={`${tSinRes}`} color="var(--muted2)" sub="completadas sin anotar el resultado" />}
            </div>
            <div style={{ ...card, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Período: <b style={{ color: "var(--text)" }}>{rangoLabel}</b>
                <span style={{ color: "var(--faint)" }}> ({desde} → {hasta})</span> · visitas por administrador
              </div>
              {puedeExportar && (
                <button onClick={exportarVisitas} style={{ background: "var(--soft)", border: "1px solid var(--line2)", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "var(--ok-ink)", whiteSpace: "nowrap" }}>⬇️ Exportar Excel</button>
              )}
            </div>
            {visitasData.length === 0 && <div style={{ ...card, textAlign: "center", color: "var(--muted)" }}>No hay visitas registradas en este período.</div>}
            {visitasData.map(a => {
              const k = "vis|" + a.key;
              const open = expandidoVisita === k;
              return (
                <div key={a.key} style={{ ...card, padding: 0, overflow: "hidden" }}>
                  <div onClick={() => setExpandidoVisita(open ? null : k)} style={{ display: "grid", gridTemplateColumns: "16px 1fr auto", alignItems: "center", gap: 10, padding: "13px 16px", cursor: "pointer", background: open ? "var(--soft2)" : "var(--card)" }}>
                    <span style={{ color: "var(--faint)", transition: "transform .15s", transform: open ? "rotate(90deg)" : "none" }}>›</span>
                    <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15, flexShrink: 0 }}>👤</span>
                      <span style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.nombre}</span>
                      <span style={{ fontSize: 12, color: "var(--faint)", flexShrink: 0 }}>{a.total} visitas</span>
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {badge(a.aprobadas, "✓", "var(--ok-ink)", "var(--ok-soft)")}
                      {badge(a.rechazadas, "✗", "var(--bad-ink)", "var(--bad-soft)")}
                      {badge(a.repetir, "↻", "var(--muted)", "var(--soft)")}
                      {badge(a.pendientes, "⏳", "var(--warn-ink)", "var(--warn-soft)")}
                      {badge(a.sinResultado, "sin resultado", "var(--muted2)", "var(--soft)")}
                    </div>
                  </div>
                  {open && (
                    <div style={{ background: "var(--soft2)", padding: "2px 16px 14px" }}>
                      {a.visitas.map((v, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid var(--line)" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.cliente}</div>
                            <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 1 }}>{fmtFechaCorta(v.fecha)}{v.gps && " · 📍 GPS"}{v.foto && " · 📷 Foto"}</div>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: resColor(v.estado, v.resultado), whiteSpace: "nowrap" }}>{resLabel(v.estado, v.resultado)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ── TAB CARTERA ── */}
      {/* La MISMA cuenta de Cartera y del Panel (auditoría del 29-sep): antes decía 187 en mora contando
          "más de 2 días sin pagar"; ahora sale de estadoHoy, contrato por contrato. Es la foto de HOY. */}
      {tab === "cartera" && (
        // minmax(0, 1fr): sin esto la columna se estiraba al contenido más ancho y en el celular toda
        // la pestaña quedaba de 448 px en una pantalla de 375 (medido el 30-sep).
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1fr)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
            <KPI label="Al día"      value={String(carteraHoy.alDia)}       color="var(--ok-ink)"   bg="var(--ok-soft)" />
            <KPI label="Gabela"      value={String(carteraHoy.gabela)}      color="var(--warn-ink)" bg="var(--warn-soft)" />
            <KPI label="En mora"     value={String(carteraHoy.mora)}        color="var(--bad-ink)"  bg="var(--bad-soft)" sub={`${carteraHoy.recoleccion} en recolección`} />
            <KPI label="🔒 Retenidas" value={String(carteraHoy.retenidas)}  color="var(--indigo-ink)" bg="var(--indigo-soft)" sub={carteraHoy.reasignadas > 0 ? `${carteraHoy.reasignadas} en liquidación, moto ya reasignada` : undefined} />
            <KPI label="Deben hoy"   value={`$ ${fmt(carteraHoy.debeHoy)}`} color="var(--bad-ink)" sub="cuotas + acuerdos + deudas" />
          </div>

          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Estado de la cartera hoy ({carteraHoy.activos} contratos activos)</div>
            {/* Son CANTIDADES de contratos: BarraN (la de plata les ponía "$" delante). */}
            <BarraN label="Al día"  valor={carteraHoy.alDia}  total={carteraHoy.activos} color="var(--ok)" />
            <BarraN label="Gabela"  valor={carteraHoy.gabela} total={carteraHoy.activos} color="var(--warn2)" />
            <BarraN label={`En mora (${carteraHoy.recoleccion} en recolección)`} valor={carteraHoy.mora} total={carteraHoy.activos} color="var(--bad)" />
          </div>

          {/* Contratos por modalidad */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Contratos por modalidad</div>
            {contratosPorForma.map(([forma, count]) => (
              <BarraN key={forma} label={forma} valor={count} total={contratosActivos.length} color="var(--accent)" />
            ))}
          </div>

          {/* En mora hoy — cards en móvil, tabla en desktop. Días = cuota vencida (la cuenta que manda). */}
          {carteraHoy.detalle.length > 0 && (
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "var(--bad-ink)" }}>
                🔴 En mora hoy — {carteraHoy.detalle.length} contrato{carteraHoy.detalle.length > 1 ? "s" : ""}
              </div>
              {(() => {
                const irCliente = (contratoId: string) => { const id = clienteIdDeContrato.get(contratoId); if (id) onNavigate?.("ficha_cliente", id); };
                const irMoto = (contratoId: string) => { const id = motoIdDeContrato.get(contratoId); if (id) onNavigate?.("ficha_moto", id); };
                const chipDias = (m: MotoRowG) => (
                  <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontWeight: 700, fontSize: 12, background: m.recoleccion ? "var(--bad-soft)" : "var(--warn-soft)", color: m.recoleccion ? "var(--bad-ink)" : "var(--warn-ink)", whiteSpace: "nowrap" }}>
                    {m.diasMora}d en mora{m.recoleccion ? " · recolección" : ""}
                  </span>
                );
                const ultimo = (m: MotoRowG) => m.ultimaFechaPago ? new Date(m.ultimaFechaPago + "T00:00:00").toLocaleDateString("es-CO") : <span style={{ color: "var(--faint)" }}>Sin pagos</span>;
                return isMobile ? (
                  <div style={{ display: "grid", gap: 10, gridTemplateColumns: "minmax(0, 1fr)" }}>
                    {carteraHoy.detalle.map(m => (
                      <div key={m.contratoId} onClick={() => irCliente(m.contratoId)}
                        style={{ padding: "12px 14px", borderRadius: 14, background: m.recoleccion ? "var(--bad-soft)" : "var(--warn-soft2)", border: `1px solid ${m.recoleccion ? "var(--bad-line)" : "var(--warn-line)"}`, cursor: "pointer" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 }}>
                          <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 13, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.cliente}</span>
                          <Placa placa={m.placa} grupo={m.grupo} size="sm" />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8, flexWrap: "wrap" }}>
                          {chipDias(m)}
                          <span style={{ fontWeight: 700, color: "var(--bad-ink)", fontSize: 14 }}>debe $ {fmt(m.debeHoy)}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Último pago: {ultimo(m)}</div>
                        {onNavigate && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={e => { e.stopPropagation(); irCliente(m.contratoId); }} style={{ padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--accent-soft2)", color: "var(--accent)" }}>👤 Ver cliente</button>
                            <button onClick={e => { e.stopPropagation(); irMoto(m.contratoId); }} style={{ padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--ok-soft)", color: "var(--ok-ink)" }}>🏍️ Ver moto</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid var(--line)" }}>
                          {["Cliente", "Placa", "Días en mora", "Debe hoy", "Último pago", ""].map(h => (
                            <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: "var(--muted)", fontWeight: 700 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {carteraHoy.detalle.map(m => (
                          <tr key={m.contratoId} onClick={() => irCliente(m.contratoId)} style={{ borderBottom: "1px solid var(--soft)", cursor: "pointer" }}>
                            <td style={{ padding: "8px 10px", fontWeight: 700, textTransform: "uppercase" }}>{m.cliente}</td>
                            <td style={{ padding: "8px 10px" }}><Placa placa={m.placa} grupo={m.grupo} size="sm" /></td>
                            <td style={{ padding: "8px 10px" }}>{chipDias(m)}</td>
                            <td style={{ padding: "8px 10px", fontWeight: 700, color: "var(--bad-ink)" }}>$ {fmt(m.debeHoy)}</td>
                            <td style={{ padding: "8px 10px", color: "var(--muted)" }}>{ultimo(m)}</td>
                            <td style={{ padding: "8px 6px" }}>
                              {onNavigate && (
                                <div style={{ display: "flex", gap: 4 }}>
                                  <button onClick={e => { e.stopPropagation(); irCliente(m.contratoId); }} style={{ padding: "3px 7px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--accent-soft2)", color: "var(--accent)" }}>👤</button>
                                  <button onClick={e => { e.stopPropagation(); irMoto(m.contratoId); }} style={{ padding: "3px 7px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--ok-soft)", color: "var(--ok-ink)" }}>🏍️</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Base casi completada */}
          {diasBase.length > 0 && (
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "var(--warn-ink)" }}>⚠️ Base casi completada — gestionar cambio de contrato</div>
              <div style={{ display: "grid", gap: 8 }}>
                {diasBase.map(c => {
                  const cliente = clientes.find(cl => cl.id === c.cliente_id);
                  const ahorro = ahorroTotal(c);
                  const p = Math.min(100, Math.round((ahorro / 510000) * 100));
                  return (
                    <div key={c.id} style={{ padding: "10px 14px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid #fcd34d" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ fontWeight: 700, textTransform: "uppercase" }}>{cliente?.nombre ?? "—"}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 13 }}>$ {fmt(ahorro)} / $510.000 ({p}%)</span>
                          {onNavigate && <button onClick={() => onNavigate("ficha_cliente", c.cliente_id)} style={{ padding: "3px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--accent-soft2)", color: "var(--accent)" }}>Ver ficha</button>}
                        </div>
                      </div>
                      <div style={{ marginTop: 6, height: 6, borderRadius: 999, background: "rgba(0,0,0,0.1)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 999, width: `${p}%`, background: "var(--warn2)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB FLOTA ── */}
      {tab === "flota" && (
        <FlotaMotos
          total={flotaF.length}
          lugares={lugaresFlota}
          grupos={gruposFlota}
          clientes={{ conContrato: hayFiltroGC ? clientesConContratoF.size : clientesConContratoIds.size, enTramite: clientesEnProceso, nuevosMes: clientesNuevosMes }}
          papeles={{ vencidos: alertasF.filter(a => a.vencida).length, porVencer: alertasF.filter(a => !a.vencida).length, sinSoat: sinSoatFlota.length }}
          activosSinContrato={clientesActivosSinContrato.length}
          estadosSistema={estadosFlota}
          onAbrir={abrirDetalleFlota}
        />
      )}

      {/* ── TAB ENTREGAS ── */}
      {/* ── CONVENIOS: cómo se ha pagado cada uno desde que se firmó ──────────────────────── */}
      {tab === "convenios" && (() => {
        function excelConvenios() {
          const cols: ColX[] = [
            { label: "Fecha del abono", align: "center", ancho: 105 },
            { label: "Método", align: "center", ancho: 95 },
            { label: "Abonó", align: "right", ancho: 95 },
            { label: "Lleva abonado", align: "right", ancho: 105 },
            { label: "Cuotas que cerró", align: "center", ancho: 105 },
          ];
          const secciones: SeccionX[] = conveniosRep.map(c => ({
            titulo: `${c.placa}  ·  ${c.cliente.toUpperCase()}  —  Convenio #${c.numero} del ${fmtFechaCorta(c.firmado)} · `
              + `$${fmt(c.total)} en ${c.numeroCuotas} cuotas de $${fmt(c.cuota)} · `
              + `abonado $${fmt(c.abonado)} · saldo $${fmt(c.saldo)} · `
              + (c.atrasado > 0 ? `ATRASADO $${fmt(c.atrasado)}` : "al día")
              + ` · ${c.grupo} · ${c.encargado.toUpperCase()}`,
            color: GRUPO_HEX[c.grupo] ?? "#334155",
            filas: c.abonos.length === 0
              ? [[{ v: `SIN UN SOLO ABONO desde que se firmó (hace ${c.diasDesdeFirma} días)`, color: "#991b1b", bold: true }, "", "", "", ""]]
              : c.abonos.map(a => [
                  { v: fmtFechaCorta(a.fecha), align: "center" as const },
                  { v: a.metodo, align: "center" as const },
                  { num: a.monto, align: "right" as const },
                  { num: a.acumulado, align: "right" as const },
                  { v: a.cuotasCompletadas > 0 ? String(a.cuotasCompletadas) : "—", align: "center" as const },
                ]),
          }));
          descargarExcel({
            archivo: `convenios_${hoyISO()}`,
            titulo: "Convenios — cómo se han pagado desde que se firmaron",
            periodo: `Al ${new Date(hoyISO() + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}`,
            leyenda: "Cada bloque es un convenio y sus abonos reales, en orden. 'Atrasado' = lo que se le ha exigido menos lo que abonó (con arrastre); es la MISMA cuenta que ve el funcionario en Cartera.",
            columnas: cols, secciones,
            totalGeneral: [
              { v: `${totConv.cantidad} convenios · pactado $${fmt(totConv.pactado)}`, bold: true }, "",
              { num: totConv.abonado, align: "right" as const, bold: true },
              { num: totConv.saldo, align: "right" as const, bold: true },
              { v: totConv.atrasado > 0 ? `atraso $${fmt(totConv.atrasado)}` : "al día", align: "center" as const, bold: true },
            ],
          });
        }

        return (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
              <KPI label="Convenios"        value={String(totConv.cantidad)}      color="var(--warn-ink)" />
              <KPI label="Pactado"          value={`$ ${fmt(totConv.pactado)}`}   color="var(--muted2)" />
              <KPI label="Abonado"          value={`$ ${fmt(totConv.abonado)}`}   color="var(--ok-ink)" bg="var(--ok-soft)" />
              <KPI label="Saldo"            value={`$ ${fmt(totConv.saldo)}`}     color="var(--accent)" />
              <KPI label="Atrasado"         value={`$ ${fmt(totConv.atrasado)}`}  color="var(--bad-ink)" bg={totConv.atrasado > 0 ? "var(--bad-soft)" : undefined} />
              <KPI label="Sin ningún abono" value={String(totConv.sinUnSoloAbono)} color={totConv.sinUnSoloAbono > 0 ? "var(--bad-ink)" : "var(--muted2)"} />
            </div>

            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Convenios y sus pagos</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    {totConv.alDia} al día · {totConv.cantidad - totConv.alDia} atrasados
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => setConveniosTodos(v => !v)}
                    style={{ padding: "8px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12.5, background: conveniosTodos ? "var(--text)" : "var(--soft2)", color: conveniosTodos ? "var(--card)" : "var(--muted2)" }}>
                    {conveniosTodos ? "Todos" : "Solo activos"}
                  </button>
                  <button onClick={excelConvenios} disabled={conveniosRep.length === 0}
                    style={{ padding: "8px 14px", borderRadius: 10, border: "none", cursor: conveniosRep.length ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 13, background: "var(--ok-soft)", color: "var(--ok-ink)", opacity: conveniosRep.length ? 1 : 0.5 }}>
                    ⬇️ Excel
                  </button>
                </div>
              </div>

              {conveniosRep.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 14 }}>No hay convenios para mostrar.</div>
              ) : (
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr)" }}>
                  {conveniosRep.map(c => (
                    <div key={c.convenioId} style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${c.atrasado > 0 ? "var(--bad-line)" : "var(--line)"}`, background: "var(--card)", display: "grid", gap: 8, minWidth: 0, gridTemplateColumns: "minmax(0, 1fr)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                          <Placa placa={c.placa} grupo={c.grupo} size="sm" />
                          <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.cliente}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap",
                          background: c.atrasado > 0 ? "var(--bad-soft)" : "var(--ok-soft)", color: c.atrasado > 0 ? "var(--bad-ink)" : "var(--ok-ink)" }}>
                          {c.atrasado > 0 ? `atrasado $ ${fmt(c.atrasado)}` : "✓ al día"}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.5 }}>
                        Convenio #{c.numero} del {fmtFechaCorta(c.firmado)} · <strong>$ {fmt(c.total)}</strong> en {c.numeroCuotas} cuotas de $ {fmt(c.cuota)}
                        {" · "}👤 {c.encargado}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 6, fontSize: 12 }}>
                        {[["Abonado", `$ ${fmt(c.abonado)}`, "var(--ok-ink)"], ["Saldo", `$ ${fmt(c.saldo)}`, "var(--muted2)"],
                          ["Cuotas", `${c.cuotasCompletas} / ${c.numeroCuotas}`, "var(--muted2)"],
                          ["Último abono", c.ultimoAbono ? `${c.diasSinAbonar}d` : "nunca", c.ultimoAbono ? "var(--muted2)" : "var(--bad-ink)"]].map(([l, v, col]) => (
                          <div key={l} style={{ padding: "6px 8px", borderRadius: 8, background: "var(--soft2)", textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>{l}</div>
                            <div style={{ fontWeight: 700, color: col as string }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {c.abonos.length === 0 ? (
                        <div style={{ fontSize: 11.5, color: "var(--bad-ink)", fontWeight: 700 }}>
                          Sin un solo abono desde que se firmó, hace {c.diasDesdeFirma} días.
                        </div>
                      ) : (
                        <div style={{ display: "grid", gap: 3, fontSize: 11.5, color: "var(--muted)" }}>
                          {c.abonos.slice(-4).map((a, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                              <span>{fmtFechaCorta(a.fecha)} · {a.metodo}{a.cuotasCompletadas > 0 ? ` · cerró ${a.cuotasCompletadas} cuota${a.cuotasCompletadas === 1 ? "" : "s"}` : " · abono parcial"}</span>
                              <strong style={{ whiteSpace: "nowrap" }}>$ {fmt(a.monto)}</strong>
                            </div>
                          ))}
                          {c.abonos.length > 4 && <div style={{ fontSize: 11, color: "var(--faint)" }}>+ {c.abonos.length - 4} abonos más — están todos en el Excel</div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── GUARDADAS: las motos en la empresa sin trabajar (D-033/034) ── */}
      {tab === "guardadas" && (
        <FlotaGuardadas
          isMobile={isMobile}
          lista={guardadasF}
          onFicha={m => { const c = m.contratoId ? contratoPorId.get(m.contratoId) : undefined; if (c) onNavigate?.("ficha_cliente", c.cliente_id); else onNavigate?.("ficha_moto", m.motoId); }}
          onInmovilizaciones={onNavigate ? () => onNavigate("inmovilizaciones") : undefined}
          onDescargar={puedeExportar ? excelQuietas : undefined}
        />
      )}

      {tab === "entregas" && (
        <div style={{ display: "grid", gap: 16 }}>
          {/* KPIs de entregas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <KPI label="Motos entregadas"   value={String(entregas.length)}       color="var(--text)" />
            <KPI label="Documentación completa"   value={String(entregasCompletas)}   color="var(--ok-ink)" />
            <KPI label="Documentación incompleta" value={String(entregasIncompletas)} color="var(--bad-ink)" bg={entregasIncompletas > 0 ? "var(--bad-soft)" : "var(--card)"} />
            <KPI label="Con fotos de entrega"     value={String(entregasConFotos)}    color="var(--accent)" />
          </div>

          {/* Botón imprimir/enviar */}
          <button onClick={imprimirEntregas} disabled={entregas.length === 0} style={{ padding: "12px 18px", borderRadius: 14, border: "none", cursor: entregas.length === 0 ? "default" : "pointer", fontWeight: 700, fontSize: 14, background: entregas.length === 0 ? "var(--line)" : "var(--accent)", color: entregas.length === 0 ? "var(--muted2)" : "var(--on-accent)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Printer size={18} aria-hidden="true" /> Imprimir reporte para los socios
          </button>

          {/* Regenerar documentos en blanco (solo ADMIN/AP) — bug histórico del PDF */}
          {esAdmin && (
            <div style={{ ...card, padding: "14px 16px", border: "1px solid var(--warn-line)", background: "var(--warn-soft2)" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--warn-ink)", marginBottom: 4 }}>Regenerar documentos en blanco</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                Vuelve a armar el contrato y pagaré de las entregas cuyo PDF salió en blanco, usando las firmas y huellas ya guardadas. Nadie tiene que volver a firmar. Úsalo una vez; los que no tengan firma guardada se omiten.
              </div>
              <button
                onClick={regenerarDocumentosEnBlanco}
                disabled={regen.estado === "buscando" || regen.estado === "regenerando"}
                style={{ padding: "10px 16px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 13, background: "var(--warn)", color: "var(--on-accent)", cursor: regen.estado === "buscando" || regen.estado === "regenerando" ? "default" : "pointer", opacity: regen.estado === "buscando" || regen.estado === "regenerando" ? 0.6 : 1 }}
              >
                {regen.estado === "buscando" ? "Buscando…"
                  : regen.estado === "regenerando" ? `Regenerando ${regen.hechos} de ${regen.total}…`
                  : "Buscar y regenerar"}
              </button>
              {regen.estado === "hecho" && regen.msg && (
                <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: "var(--ok-ink)" }}>{regen.msg}</div>
              )}
            </div>
          )}

          {/* Lista de entregas */}
          {entregas.length === 0 ? (
            <div style={{ ...card, textAlign: "center", color: "var(--muted)", padding: "32px 20px" }}>
              No hay entregas de motos en este período{grupoEnt !== "Todos" ? ` para ${grupoEnt}` : ""}.
              <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 6 }}>Cambia el rango de fechas arriba para ver otras.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
              {entregas.map(e => (
                <div key={e.id} style={{ ...card, padding: 16, borderTop: `4px solid ${GRUPO_COLORS[e.grupo] ?? "var(--faint)"}` }}>
                  {/* Encabezado */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <button onClick={() => onNavigate?.("ficha_cliente", e.clienteId)} aria-label={`Ver la ficha de ${e.cliente}`}
                      style={{ minWidth: 0, background: "transparent", border: "none", padding: 0, textAlign: "left", color: "inherit", font: "inherit", cursor: onNavigate ? "pointer" : "default" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <Placa placa={e.placa} grupo={e.grupo} size="sm" />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", color: "var(--text)", marginTop: 6 }}>{e.cliente}</div>
                      <div style={{ fontSize: 12, color: "var(--muted2)" }}>C.C. {e.cedula}</div>
                    </button>
                    <span style={{ flexShrink: 0, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: e.docsOk ? "var(--ok-soft)" : "var(--bad-soft)", color: e.docsOk ? "var(--ok-ink)" : "var(--bad-ink)" }}>
                      {e.docsOk ? "Completo" : "Incompleto"}
                    </span>
                  </div>

                  {/* Fecha + km */}
                  <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--muted2)", marginBottom: 10 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><CalendarDays size={14} aria-hidden="true" /> Entregada el {new Date(e.fecha + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    {e.km != null && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Gauge size={14} aria-hidden="true" /> {fmt(e.km)} km</span>}
                  </div>

                  {/* Documentos */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: e.nFotos > 0 ? 12 : 0 }}>
                    {[
                      { key: "contrato", label: "Contrato", ok: e.docs.contrato, url: e.urls.contrato },
                      { key: "pagare", label: "Pagaré", ok: e.docs.pagare, url: e.urls.pagare },
                      { key: "certificado", label: "Certificado", ok: e.docs.certificado, url: e.urls.certificado },
                      { key: "firma", label: "Firma", ok: e.docs.firma, url: null },
                    ].map(d => (
                      <button
                        key={d.key}
                        onClick={() => d.url && abrirDocumento(d.url)}
                        disabled={!d.url}
                        title={d.ok ? (d.url ? "Abrir documento" : "Firmado") : "Falta"}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, padding: "7px 10px", borderRadius: 10, border: "1px solid " + (d.ok ? "var(--ok-line)" : "var(--bad-line)"), background: d.ok ? "var(--ok-soft)" : "var(--bad-soft)", color: d.ok ? "var(--ok-ink)" : "var(--bad-ink)", fontSize: 12, fontWeight: 700, cursor: d.url ? "pointer" : "default", minWidth: 0 }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
                        <span style={{ flexShrink: 0, display: "inline-flex" }} aria-label={d.ok ? (d.url ? "abrir" : "listo") : "falta"}>{d.ok ? (d.url ? <ExternalLink size={14} aria-hidden="true" /> : <Check size={14} aria-hidden="true" />) : <X size={14} aria-hidden="true" />}</span>
                      </button>
                    ))}
                  </div>

                  {/* Fotos de entrega (miniaturas → lightbox) */}
                  {e.nFotos > 0 && (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                      {/* `ImgPrivada` en vez de `<img>` suelto: enlace firmado (estas fotos viven
                          en un bucket público y el enlace directo las deja abiertas a cualquiera)
                          y carga diferida, que es lo que arregla el scroll. */}
                      {e.fotos.slice(0, 6).map(([ang, url]) => (
                        <ImgPrivada
                          key={ang}
                          src={url}
                          alt={ANG_LABEL[ang] ?? ang}
                          title={ANG_LABEL[ang] ?? ang}
                          onClick={() => setFotosVer({ placa: e.placa, cliente: e.cliente, fotos: e.fotos })}
                          style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)", cursor: "pointer" }}
                        />
                      ))}
                      <button onClick={() => setFotosVer({ placa: e.placa, cliente: e.cliente, fotos: e.fotos })} style={{ width: 48, height: 48, borderRadius: 8, border: "1px dashed var(--line2)", background: "var(--soft2)", color: "var(--muted)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                        Ver<br />{e.nFotos}
                      </button>
                    </div>
                  )}

                  {/* Acciones */}
                  <div style={{ display: "flex", gap: 6, borderTop: "1px solid var(--soft)", paddingTop: 10 }}>
                    <button onClick={() => verResumenEntrega(e)} style={{ flex: 1, padding: "6px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--soft2)", color: "var(--text)" }}>Resumen</button>
                    {onNavigate && <button onClick={() => onNavigate("ficha_cliente", e.clienteId)} style={{ flex: 1, padding: "6px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--accent-soft2)", color: "var(--accent-ink)" }}>Cliente</button>}
                    {onNavigate && e.motoId && <button onClick={() => onNavigate("ficha_moto", e.motoId!)} style={{ flex: 1, padding: "6px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--ok-soft)", color: "var(--ok-ink)" }}>Moto</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox de fotos de entrega */}
      {fotosVer && (
        <div onClick={() => setFotosVer(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.9)", zIndex: 1000, display: "flex", flexDirection: "column", padding: isMobile ? 12 : 32, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, color: "var(--card)" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{fotosVer.placa}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>{fotosVer.cliente}</div>
            </div>
            <button onClick={() => setFotosVer(null)} style={{ padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, background: "var(--card)", color: "var(--text)" }}>Cerrar ✕</button>
          </div>
          <div onClick={e => e.stopPropagation()} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {fotosVer.fotos.map(([ang, url]) => (
              <div key={ang} style={{ background: "var(--card)", borderRadius: 12, overflow: "hidden" }}>
                <ImgPrivada src={url} alt={ANG_LABEL[ang] ?? ang} style={{ width: "100%", display: "block", maxHeight: 400, objectFit: "contain", background: "#000" }} />
                <div style={{ padding: "8px 12px", fontWeight: 700, fontSize: 13, color: "var(--muted2)", textAlign: "center" }}>{ANG_LABEL[ang] ?? ang}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB EXPORTAR ── */}
      {/* El `puedeExportar` va también acá y no solo en la pestaña: si alguien ya estaba parado en
          Exportar cuando le quitan el permiso, el contenido tiene que desaparecer igual. */}
      {tab === "exportar" && puedeExportar && (() => {
        const SECCIONES: { key: string; label: string; desc: string }[] = [
          { key: "kpis",        label: "KPIs de recaudo",           desc: "Total, efectivo, transferencias, activos, mora" },
          { key: "recaudoGrupo",label: "Recaudo por grupo",         desc: "Tabla por COSTA/PRADERA/RASTREADOR/USADAS" },
          { key: "porAdmin",    label: "Gestión por administrador", desc: "Motos que pagaron/no por admin (base de nómina)" },
          { key: "porGrupo",    label: "Gestión por grupo",         desc: "Motos que pagaron/no por grupo" },
          { key: "visitas",     label: "Visitas por administrador", desc: "Visitas hechas y su resultado por admin" },
          { key: "mora",        label: "Mora y cartera vencida",    desc: "Clientes en mora con deuda y días" },
          { key: "flota",       label: "Flota por estado",          desc: "Motos por estado (asignadas, taller, etc.)" },
          { key: "entregas",    label: "Entregas del período",      desc: "Contratos entregados en el rango" },
        ];
        const nSel = Object.values(secImpr).filter(Boolean).length;
        const toggle = (k: string) => setSecImpr(s => ({ ...s, [k]: !s[k] }));
        const setTodas = (v: boolean) => setSecImpr(Object.fromEntries(SECCIONES.map(s => [s.key, v])));
        return (
        <div style={{ display: "grid", gap: 16 }}>
          {/* Informe Gerencial en PDF (gráficos + estadísticas) */}
          <div style={{ ...card, display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>📊 Informe Gerencial (PDF)</div>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
              Documento profesional con <b>gráficos y estadísticas</b>: portada + tendencia, dona de estado, recaudo por grupo, ranking, antigüedad de mora, matriz cobrador×grupo, método y “por convenir”.
              Respeta el período <b style={{ color: "var(--text)" }}>{rangoLabel}</b>{filtrosActivos ? <> · filtros <b style={{ color: "var(--text)" }}>{filtrosResumen}</b></> : null}.
            </p>
            <FiltrosGestion filtros={filtros} setFiltros={setFiltros} subadmins={subadmins} resumen={filtrosResumen} />
            <button onClick={descargarInformePdf} disabled={generandoPdf}
              style={{ padding: "13px 18px", borderRadius: 14, border: "none", cursor: generandoPdf ? "default" : "pointer", fontWeight: 700, fontSize: 14, background: "var(--accent)", color: "var(--card)", opacity: generandoPdf ? 0.7 : 1 }}>
              {generandoPdf ? "Generando PDF…" : "📊 Descargar Informe Gerencial (PDF)"}
            </button>
          </div>
          {/* Armador de impresión */}
          <div style={{ ...card, display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>🖨️ Armar impresión</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setTodas(true)} style={{ fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--line2)", background: "var(--soft)", color: "var(--muted2)", cursor: "pointer" }}>Todas</button>
                <button onClick={() => setTodas(false)} style={{ fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--line2)", background: "var(--soft)", color: "var(--muted2)", cursor: "pointer" }}>Ninguna</button>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Marca qué secciones incluir. Se imprime <b>solo lo marcado</b>, con el período <b>{RANGOS.find(r => r.key === rango)?.label}</b> ({desde} → {hasta}).</p>
            <div style={{ display: "grid", gap: 8 }}>
              {SECCIONES.map(s => {
                const on = !!secImpr[s.key];
                return (
                  <label key={s.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, border: `1px solid ${on ? "var(--accent)" : "var(--line)"}`, background: on ? "var(--accent-soft)" : "var(--card)", cursor: "pointer" }}>
                    <input type="checkbox" checked={on} onChange={() => toggle(s.key)} style={{ width: 18, height: 18, accentColor: "var(--accent)", flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text)" }}>{s.label}</div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 1 }}>{s.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: "var(--soft2)", cursor: "pointer" }}>
              <input type="checkbox" checked={detalleImpr} onChange={() => setDetalleImpr(v => !v)} style={{ width: 18, height: 18, accentColor: "var(--accent)", flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text)" }}>Incluir detalle completo</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 1 }}>{detalleImpr ? "Cada moto/visita una por una (placa, cliente, monto…)" : "Solo el resumen por admin/grupo (sin la lista de motos)"}</div>
              </div>
            </label>
            <button onClick={imprimirSeleccion} disabled={nSel === 0}
              style={{ padding: "13px 18px", borderRadius: 14, border: "none", cursor: nSel === 0 ? "default" : "pointer", fontWeight: 700, fontSize: 14, background: nSel === 0 ? "var(--line)" : "var(--accent)", color: nSel === 0 ? "var(--faint)" : "var(--card)", opacity: nSel === 0 ? 0.7 : 1 }}>
              🖨️ Imprimir selección{nSel > 0 ? ` (${nSel})` : ""}
            </button>
          </div>

          <div style={{ ...card, display: "grid", gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Exportar datos (CSV)</div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>Período seleccionado: <strong>{RANGOS.find(r => r.key === rango)?.label}</strong> ({desde} → {hasta})</p>
            {[
              {
                label: "⬇️ CSV — Pagos del período",
                desc: `${pagosRango.length} registros · Fecha, Cliente, Placa, Método, Tipo, Valor`,
                onClick: () => {
                  const filas = pagosRango.map(p => {
                    const c  = contratos.find(ct => ct.id === p.contrato_id);
                    const cl = c ? clientes.find(cl => cl.id === c.cliente_id) : null;
                    const m  = c?.moto_id ? motos.find(mo => mo.id === c.moto_id) : null;
                    return [p.fecha, cl?.nombre ?? "—", m?.placa ?? "—", p.metodo, p.tipo_registro ?? "", String(p.valor)];
                  });
                  exportarCSV(filas, ["Fecha","Cliente","Placa","Metodo","Tipo","Valor"], `pagos-${desde}-${hasta}.csv`);
                },
              },
              {
                label: "⬇️ CSV — Mora actual",
                desc: `${carteraHoy.detalle.length} contratos en mora hoy · Cliente, Placa, Días en mora, Debe hoy, Último pago`,
                onClick: () => {
                  const filas = carteraHoy.detalle.map(m => [m.cliente, m.placa, String(m.diasMora), String(m.debeHoy), m.ultimaFechaPago ?? "Sin pagos"]);
                  exportarCSV(filas, ["Cliente","Placa","Dias en mora","Debe hoy","Ultimo pago"], `mora-${hoyStr}.csv`);
                },
              },
              ...(alertasVencimiento.length > 0 ? [{
                label: "⬇️ CSV — Vencimientos SOAT y Tecno",
                desc: `${docsVencidos} vencidas · ${docsPorVencer} por vencer en 30 días`,
                onClick: () => {
                  const filas = alertasVencimiento.map(a => [a.placa, a.seguro ?? "—", a.tecno ?? "—", String(a.diasSeguro ?? ""), String(a.diasTecno ?? "")]);
                  exportarCSV(filas, ["Placa","SOAT vence","Tecno vence","Dias SOAT","Dias Tecno"], `vencimientos-${hoyStr}.csv`);
                },
              }] : []),
            ].map((btn, i) => (
              <button key={i} onClick={btn.onClick} style={{ padding: "14px 18px", borderRadius: 14, border: "1px solid var(--line)", background: "var(--card)", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{btn.label}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{btn.desc}</div>
                </div>
                <span style={{ fontSize: 20, color: "var(--line2)" }}>›</span>
              </button>
            ))}
          </div>
        </div>
        );
      })()}

      {descarga && (() => {
        const porAdmin = descarga === "admin";
        // Se aplana a filas de moto: el modal agrupa solo, con el mismo criterio que la pantalla
        // (por cobrador en "Por admin", por portafolio en "Por grupo").
        // Por cobrador, cada moto con lo suyo desde que la tiene (D-035), igual que la pantalla.
        const filas = porAdmin ? porAdminData.flatMap(b => b.motos).map(comoCobrador) : porGrupoData.flatMap(b => b.motos);
        return (
          <ModalDescargar<MotoRowG>
            titulo={porAdmin ? "Descargar gestión por admin" : "Descargar recaudo por grupo"}
            nombreArchivo={porAdmin ? "por_admin" : "por_grupo"}
            tituloDocumento={porAdmin
              ? (filtrosActivos ? `Gestión por administrador — ${filtrosResumen}` : "Gestión por administrador")
              : (filtrosActivos ? `Recaudo por grupo — ${filtrosResumen}` : "Recaudo por grupo")}
            periodo={periodoTxt}
            resumenFiltro={filtrosActivos ? filtrosResumen : `${desde} al ${hasta}`}
            nota={xLeyenda}
            columnas={columnasGestion(porAdmin ? "grupo" : "admin")}
            filas={filas}
            filtros={[
              { titulo: "Grupos", de: m => m.grupo },
              { titulo: "Cobrador", de: m => m.adminNombre.toUpperCase() },
              { titulo: "Estado hoy", de: m => m.estado === "aldia" ? "Al día" : m.estado === "gabela" ? "Gabela" : m.estado === "mora" ? "En mora" : m.estado === "taller" ? "Moto en el taller" : m.estado === "retenida" ? "Retenida" : m.estado === "reasignada" ? "En liquidación (moto reasignada)" : "Contrato cerrado" },
              { titulo: "Modalidad", de: m => m.formaPago },
            ]}
            agrupar={m => porAdmin ? m.adminNombre.toUpperCase() : m.grupo}
            colorSeccion={n => porAdmin ? "#334155" : (GRUPO_HEX[n] ?? "#334155")}
            hojasExtra={hojasOpcionales}
            onCerrar={() => setDescarga(null)}
          />
        );
      })()}

      <HojaDetalle contenido={detalle} onCerrar={() => setDetalle(null)} isMobile={isMobile} puedeDescargar={puedeExportar} />
    </div>
  );
}
