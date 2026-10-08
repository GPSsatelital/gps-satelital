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
import { useMotos, enLaEmpresa } from "../hooks/useMotos";
import { useDeudas } from "../hooks/useDeudas";
import { hoyISO, hoyDate, fechaISO } from "../utils/fecha";
import { useAuth } from "../contexts/AuthContext";
import { useBackGuard } from "../contexts/BackNav";
import { necesitaRegenerar, regenerarDocsContrato } from "../utils/regenerarDocs";
import { generarHTMLResumenEntrega } from "../hooks/useDocumentos";
import { abrirDocumento, firmarImagenesHtml } from "../lib/storagePrivado";
import { esDiaDePago, formatDiaPago, valorPeriodoReal, type EstadoCartera } from "../utils/cicloPago";
import {
  descargarExcel, GRUPO_HEX,
  type CeldaX, type ColX, type SeccionX, type SeccionesOpts,
} from "../utils/exportar";
import ModalDescargar, { type ColumnaDescarga, type HojaExtra } from "../components/ModalDescargar";
import Placa from "../components/Placa";
import { useVisitas } from "../hooks/useVisitas";
import { useNominaCierres, useCierresDeSemanas } from "../hooks/useNominaCierres";
import ModalCerrarNomina from "../components/ModalCerrarNomina";
import { useConvenios } from "../hooks/useConvenios";
import { useUbicaciones } from "../hooks/useUbicaciones";
import { nominaSemanaDetallada, rodadasDesdeRegistros, TEXTO_SIN_GESTION, lunesDe, resumirRenglones, totalesPorGrupo, vigiaCubre, VALOR_CICLO, VALOR_ATRASADO, VALOR_RETENCION, PCT_ATRASADO, VALOR_VISITA, VALOR_REFERIDO, type TipoGestion, type GestionNomina } from "../utils/nominaCobradores";
import { generarDesprendibleNomina } from "../utils/generarDesprendibleNomina";
import { useCajasLlenadas } from "../hooks/useCajasLlenadas";
import { useRodadas } from "../hooks/useRodadas";
import { motosGuardadas } from "../utils/motosGuardadas";
import { reporteConvenios, totalesConvenios, type ConvenioReporte } from "../utils/reporteConvenios";
import { MOTIVO_RECEPCION_LABEL, UBICACION_LABEL } from "../hooks/useUbicaciones";
import BarraFiltros from "../components/reportes/BarraFiltros";
import PortafoliosReportes, { type DatosPortafolio } from "../components/reportes/PortafoliosReportes";
import MenuReportes, { type TabReportes } from "../components/reportes/MenuReportes";
import { FlotaMotos, FlotaGuardadas } from "../components/reportes/FlotaReportes";
import { CobranzaCartera, CobranzaAcuerdos, type FilaReparto } from "../components/reportes/CobranzaReportes";
import { EquipoNomina, EquipoVisitas, type CeldaSemana, type DatosNomina, type DatosVisitas } from "../components/reportes/EquipoReportes";
import DescargarSeccion, { type SepararPor } from "../components/reportes/DescargarSeccion";
import { informeSociosHTML, type DatosInforme, type SeccionInforme } from "../utils/informeSocios";
import ResumenReportes, { type FilaEstado, plata as plataT } from "../components/reportes/ResumenReportes";
import CuadroCruzado from "../components/reportes/CuadroCruzado";
import { cuadroCruzado, verificarCuadro, explicaVista, VISTAS_CRUZADO, SIN_COBRADOR, ANTES_DE_ASIGNAR, type VistaCruzado, type CuadroCruzado as TipoCuadro, type CeldaCruzado, type FilaCruzado, type MotoCruzado, type PagoCruzado } from "../utils/reportesCruzado";
import HojaDetalle, { type ContenidoDetalle, type FilaDetalle } from "../components/reportes/HojaDetalle";
import { sitioFisico, dondeEstaCadaMoto, LUGARES, type LugarMoto } from "../utils/reportesFlota";
import { desgloseRecaudo, baseDeAcuerdosDeBase, pagosSinRepartir, tramosMora, serieRecaudo, estadoAlCierre, verificarCifras, plataSinProducir } from "../utils/reportesResumen";
import { AlertTriangle, PiggyBank, FileWarning, ChevronRight, Wallet, Printer, CalendarDays, Gauge, ExternalLink, Check, X } from "lucide-react";

interface Props {
  onNavigate?: (view: ViewKey, filter?: string) => void;
}

const card: React.CSSProperties = { background: "var(--card)", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(15,23,42,0.08)" };
function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

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

type ResultadoVisita = "aprobadas" | "esperando" | "repetir" | "rechazadas" | "sinResultado" | "pendientes";
const ETIQUETA_RESULTADO: Record<ResultadoVisita, string> = {
  aprobadas: "Aprobada", esperando: "Esperando decisión", repetir: "Para repetir", rechazadas: "Rechazada",
  sinResultado: "Sin anotar el resultado", pendientes: "Pendiente por hacer",
};
/** Estados del cliente que solo se alcanzan después de aprobarlo. */
const CLIENTE_YA_APROBADO = ["Aprobado", "Activo", "En riesgo", "En mora", "En seguimiento"];
/**
 * El resultado de una visita. Si la visita no quedó marcada pero el cliente ya se aprobó, cuenta como
 * aprobada (`porCliente`): "Aprobar cliente" en la decisión final no marcaba la visita (2-oct: 7 visitas
 * así, todas con la moto entregada). Si el cliente sigue esperando la decisión, "esperando".
 */
function resultadoDeVisita(v: { estado: string; resultado: string | null }, estadoCliente: string | undefined, recibioMoto: boolean): { res: ResultadoVisita; porCliente: boolean } {
  if (v.estado === "Pendiente") return { res: "pendientes", porCliente: false };
  if (v.resultado === "Aprobado") return { res: "aprobadas", porCliente: false };
  if (v.resultado === "Rechazado") return { res: "rechazadas", porCliente: false };
  if (v.resultado === "Repetir") return { res: "repetir", porCliente: false };
  if (recibioMoto || CLIENTE_YA_APROBADO.includes(estadoCliente ?? "")) return { res: "aprobadas", porCliente: true };
  if (estadoCliente === "Pendiente evaluación") return { res: "esperando", porCliente: false };
  return { res: "sinResultado", porCliente: false };
}

/** A qué parte del informe para los socios corresponde cada pestaña (llega marcada en el PDF). */
const SECCION_DE_TAB: Record<Tab, SeccionInforme> = {
  resumen: "resumen", cartera: "cobranza", convenios: "cobranza", grupos: "portafolios", admins: "portafolios", cruzado: "portafolios",
  nomina: "equipo", visitas: "equipo", flota: "flota", guardadas: "flota", entregas: "flota",
};

/** Desde cuándo se muestran las semanas de cada cobrador (ver `semanasTendencia`). */
const DESDE_TENDENCIA = "2026-09-14";
const masDias = (iso: string, n: number) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const mesCorto = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("es-CO", { month: "short" }).replace(".", "");
/** "Semana del 21 al 27 de sept" · "Semana del 31 de ago al 6 de sept" */
function textoSemana(lunes: string, domingo: string) {
  const d1 = Number(lunes.slice(8, 10)), d2 = Number(domingo.slice(8, 10));
  return lunes.slice(0, 7) === domingo.slice(0, 7) ? `Semana del ${d1} al ${d2} de ${mesCorto(lunes)}` : `Semana del ${d1} de ${mesCorto(lunes)} al ${d2} de ${mesCorto(domingo)}`;
}
/** "21-27 sept" para las columnas de las semanas de cada cobrador. */
function textoSemanaCorto(lunes: string) {
  const dom = masDias(lunes, 6);
  return lunes.slice(0, 7) === dom.slice(0, 7) ? `${Number(lunes.slice(8, 10))}-${Number(dom.slice(8, 10))} ${mesCorto(lunes)}` : `${Number(lunes.slice(8, 10))} ${mesCorto(lunes)}-${Number(dom.slice(8, 10))} ${mesCorto(dom)}`;
}
/** Los pagos de nómina por COBRAR (no la visita ni el referido): los que dicen que una moto "le generó pago". */
const TIPOS_COBRO = new Set<TipoGestion>(["ciclo", "ciclo_atrasado", "prorrateo", "retencion", "cuota_convenio"]);
const TIPO_NOMINA: Record<TipoGestion, string> = {
  ciclo: "Semana cobrada a tiempo", ciclo_atrasado: "Semana atrasada", prorrateo: "Primer pago (prorrateo)",
  retencion: "Retención", cuota_convenio: "Cuota de acuerdo de una retenida", visita: "Visita domiciliaria", referido: "Referido: trajo al cliente",
};
const TIPO_NOMINA_CORTO: Record<TipoGestion, string> = {
  ciclo: "A tiempo", ciclo_atrasado: "Atrasadas", prorrateo: "Prorrateo", retencion: "Retenciones",
  cuota_convenio: "Acuerdo de retenida", visita: "Visitas", referido: "Referidos",
};

/** Dónde quedó Reportes la última vez en esta pestaña del navegador (ver `vista` en ReportesView). */
const CLAVE_VISTA = "reportes:vista:v1";
type VistaReportes = { tab: Tab; rango: Rango; rangoCustom: { desde: string; hasta: string }; filtros: FiltrosG; lunesNomina: string };
function leerVistaReportes(): Partial<VistaReportes> | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(CLAVE_VISTA) ?? "null") as Partial<VistaReportes> | null;
    if (!v || typeof v !== "object") return null;
    const f = v.filtros;
    const filtrosOk = f && Array.isArray(f.grupo) && Array.isArray(f.cobrador) && Array.isArray(f.modalidad) && Array.isArray(f.estado);
    return {
      tab: typeof v.tab === "string" && Object.prototype.hasOwnProperty.call(SECCION_DE_TAB, v.tab) ? v.tab : undefined,
      rango: RANGOS.some(r => r.key === v.rango) ? v.rango : undefined,
      rangoCustom: v.rangoCustom && typeof v.rangoCustom.desde === "string" && typeof v.rangoCustom.hasta === "string" ? v.rangoCustom : undefined,
      filtros: filtrosOk ? f : undefined,
      lunesNomina: typeof v.lunesNomina === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.lunesNomina) ? v.lunesNomina : undefined,
    };
  } catch { return null; }
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
  /** Lo mismo partido (semanas · acuerdo · deudas) y su saldo a favor (estadoHoy). */
  debe: { semanas: number; acuerdo: number; deudas: number };
  saldoAFavor: number;
  /** Estado de Cartera tal cual (sin la regla de moto guardada): para la pestaña Cartera y el aviso. */
  estadoCartera: EstadoCartera;
  recoleccion: boolean;
  /** Hoy es su día de pago (la misma pregunta que Cartera: `esDiaDePago`; el diario paga todos los días). */
  pagaHoy: boolean;
  /** Tiene un plazo extra vigente: por eso, aunque lleve días en mora, no va a recolección. */
  conPlazo: boolean;
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
const FILTROS_VACIOS: FiltrosG = { grupo: [], cobrador: [], modalidad: [], estado: [] };

const KPI_ICONS: Record<string, string> = {
  "Total recaudado": "💰",
  "Efectivo": "💵",
  "Transferencias": "📲",
  "Cobro en campo": "🏍️",
};

export default function ReportesView({ onNavigate }: Props) {
  // Al volver de Cartera (o de una ficha), Reportes queda donde estaba: misma pestaña, período,
  // filtros y semana de nómina (pedido del dueño, 5-oct). Dura lo que dure la pestaña del navegador.
  const vista = useMemo(leerVistaReportes, []);
  const [rango, setRango] = useState<Rango>(vista?.rango ?? "mes");
  const [rangoCustom, setRangoCustom] = useState<{ desde: string; hasta: string }>(() => vista?.rangoCustom ?? getRango("ult7")); // rango personalizado de-fecha-a-fecha
  const [tab, setTab]     = useState<Tab>(vista?.tab ?? "resumen");
  // El cuadro cruzado (8-oct): qué vista se ve en Portafolios › Cruzado y cuál en Flota › Motos.
  const [vistaCruzado, setVistaCruzado] = useState<VistaCruzado>("motos");
  const [vistaFlota, setVistaFlota] = useState<VistaCruzado>("motos");
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
    if (vista?.lunesNomina) return vista.lunesNomina;
    const d = new Date(lunesDe(hoyISO()) + "T12:00:00");
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const { cesiones } = useCesiones();
  // Filtros combinables (AND) que afinan TODOS los informes de gestión + PDF + Excel.
  const [filtros, setFiltros] = useState<FiltrosG>(vista?.filtros ?? FILTROS_VACIOS);
  const [generandoPdf, setGenerandoPdf] = useState(false); // botón del informe para los socios (PDF)
  useEffect(() => {
    try { sessionStorage.setItem(CLAVE_VISTA, JSON.stringify({ tab, rango, rangoCustom, filtros, lunesNomina })); } catch { /* sin almacenamiento: solo no se recuerda */ }
  }, [tab, rango, rangoCustom, filtros, lunesNomina]);
  // El PDF puede traer la nómina desde cualquier sección: al abrirlo se carga (si no, solo en Equipo).
  const [pdfPideNomina, setPdfPideNomina] = useState(false);

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
  // La flota de verdad, sin las vendidas (mig 186). `motos` sigue completa para buscar la placa de un contrato viejo.
  const flotaMotos = useMemo(() => motos.filter(enLaEmpresa), [motos]);
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
  const { eventos: eventosNomina, cargando: cargandoCajas, error: errorCajas } = useCajasLlenadas(desdeEventosNomina, domingoNomina, tab === "nomina" || pdfPideNomina, intentoNomina);
  // Las rodadas con su fecha: cada semana se paga según cómo estaba el día en que se cobró (30-sep).
  const { registros: registrosRodadas, cargando: cargandoRodadas, error: errorRodadas } = useRodadas(tab === "nomina" || tab === "resumen" || pdfPideNomina, intentoNomina);
  const rodadasNomina = useMemo(() => {
    if (!registrosRodadas) return null;
    const formaPago = new Map(contratos.map(c => [c.id, c.forma_pago]));
    return rodadasDesdeRegistros(registrosRodadas.acuerdos, registrosRodadas.auditoria, id => formaPago.get(id), ts => fechaISO(new Date(ts)));
  }, [registrosRodadas, contratos]);
  // Semanas ya pagadas (mig 120): cifras congeladas + firma + foto del desprendible.
  const { cerrarSemana, cierreDe, cargando: cargandoCierres, error: errorCierres, recargar: recargarCierres } = useNominaCierres(lunesNomina, tab === "nomina" || pdfPideNomina);
  // Un cierre congela la cifra para siempre: no se deja pagar ni imprimir mientras falte algo de la
  // semana (las cajas, las rodadas, los cierres o los pagos). Si algo falló, se dice y no se paga.
  const nominaCargando = cargandoCajas || cargandoRodadas || cargandoCierres || sinDatos;
  const nominaError = errorCajas || errorRodadas || errorCierres || (!!errorDatos && sinDatos);
  const nominaLista = !nominaCargando && !nominaError;
  const reintentarNomina = () => { setIntentoNomina(i => i + 1); void recargarCierres(); };
  const textoSemanaNomina = textoSemana(lunesNomina, domingoNomina);

  const [cerrando, setCerrando] = useState<string | null>(null);   // subadminId en curso
  const entradasNomina = useMemo(() => ({
      contratos,
      pagos,
      motos: motos.map(m => ({ id: m.id, placa: m.placa, subadmin_id: m.subadmin_id ?? null, grupo: m.grupo ?? null })),
      recepciones,
      clientesPorId: new Map(clientes.map(c => [c.id, c.nombre])),
      convenios: convenios.map(cv => ({ contrato_id: cv.contrato_id, cuota_por_periodo: cv.cuota_por_periodo, numero_cuotas: cv.numero_cuotas, periodos_exonerados: cv.periodos_exonerados, created_at: cv.created_at })),
      visitas: visitas.map(v => ({ id: v.id, cliente_id: v.cliente_id, realizada_por: v.realizada_por ?? null, fecha: v.fecha, estado: v.estado })),
      // Quién trajo a cada cliente (mig 153): $30.000 a esa persona en la semana de la entrega.
      referidos: clientes
        .filter(c => c.referido_por_funcionario)
        .map(c => ({ cliente_id: c.id, funcionario_id: c.referido_por_funcionario! })),
      rodadas: rodadasNomina,
  }), [contratos, pagos, motos, recepciones, clientes, convenios, visitas, rodadasNomina]);
  const nominaDetalle = useMemo(() => {
    if (tab !== "nomina" && !pdfPideNomina) return { nominas: [], sinGestion: [] };
    return nominaSemanaDetallada({ ...entradasNomina, desde: lunesNomina, hasta: domingoNomina, eventos: eventosNomina });
  }, [tab, pdfPideNomina, lunesNomina, domingoNomina, entradasNomina, eventosNomina]);
  const nominas = nominaDetalle.nominas;
  // LAS SEMANAS DE CADA COBRADOR (2-oct): desde el 14-sep. Entre el 7 y el 13 se les puso fecha nueva
  // a 176 motos y no se sabe si cambiaron de cobrador o se guardaron otra vez con el mismo; desde el
  // 14 ya el 93% tenía su cobrador de hoy. Cada semana se calcula como la nómina de esa semana (sus
  // cajas desde 84 días antes, igual que arriba), y se muestran las últimas 6.
  const lunesDeHoy = lunesDe(hoyISO());
  const semanasTendencia = useMemo(() => {
    const fin = lunesDeHoy;
    const out: string[] = [];
    for (let l = DESDE_TENDENCIA; l <= fin; l = masDias(l, 7)) out.push(l);
    return out.slice(-6);
  }, [lunesDeHoy]);
  const { eventos: eventosTendencia, cargando: cargandoEventosTend } = useCajasLlenadas(masDias(semanasTendencia[0], -84), masDias(semanasTendencia[semanasTendencia.length - 1], 6), tab === "nomina", intentoNomina);
  const { cierres: cierresTendencia, cargando: cargandoCierresTend } = useCierresDeSemanas(semanasTendencia, tab === "nomina", intentoNomina);
  const tendenciaNomina = useMemo(() => {
    if (tab !== "nomina" || !eventosTendencia) return [];
    return semanasTendencia.map(l => {
      const desdeEv = masDias(l, -84);
      const hastaSem = masDias(l, 6);
      const ev = eventosTendencia.filter(e => e.fecha >= desdeEv && e.fecha <= hastaSem);
      return nominaSemanaDetallada({ ...entradasNomina, desde: l, hasta: hastaSem, eventos: ev.length ? ev : null }).nominas;
    });
  }, [tab, eventosTendencia, semanasTendencia, entradasNomina]);
  const cargandoTendencia = cargandoEventosTend || cargandoCierresTend || nominaCargando;
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
        debe: cerrado ? { semanas: 0, acuerdo: 0, deudas: 0 } : e.debe,
        saldoAFavor: cerrado ? 0 : e.saldoAFavor,
        estadoCartera: e.estado,
        recoleccion: c.estado === "Activo" && e.recoleccion,
        pagaHoy: c.forma_pago === "Diario" || esDiaDePago(c as never, hoy),
        conPlazo: plazosVigentes.has(c.id),
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
    hoyISO(), false,
  ), [convenios, pagos, contratos, motos, clientes, subadmins]);

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
  /** Qué se está viendo, para escribirlo en el archivo: "COSTA · LUMAR AVENDAÑO PINEDA" o "todos los
   *  grupos · todos los cobradores". Visitas no se filtran por grupo (`conGrupo` = false). */
  const textoFiltrosGC = (conGrupo = true) => [
    ...(conGrupo ? [filtros.grupo.length ? filtros.grupo.join(", ") : "todos los grupos"] : []),
    filtros.cobrador.length ? filtros.cobrador.map(id => nombreCobradorFiltro(id).toUpperCase()).join(", ") : "todos los cobradores",
  ].join(" · ");
  /** Los Excel de cada sección dicen, debajo del título, con qué filtro se bajaron (5-oct: uno de
   *  LUMAR suelto parecía de toda la empresa). */
  const descargarExcelR = (o: Parameters<typeof descargarExcel>[0], conGrupo = true) => {
    const conFiltro = (periodo: string) => `${periodo} · ${textoFiltrosGC(conGrupo)}`;
    descargarExcel({ ...o, periodo: conFiltro(o.periodo), hojasExtra: o.hojasExtra?.map(h => ({ ...h, periodo: conFiltro(h.periodo) })) });
  };
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

  /** Las visitas del período con el filtro de cobrador (antes bajaba las de todos), por quién las hizo. */
  function exportarVisitas() {
    const personas = [...new Set(visitasP.map(quienVisita))];
    descargarExcelR({
      archivo: `visitas_${desde}_a_${hasta}`, titulo: "Visitas domiciliarias", periodo: textoRango(desde, hasta),
      leyenda: "Por quién la hizo. 'Aprobada (se aprobó el cliente)' = la visita no quedó marcada, pero el cliente se aprobó (D-038).",
      columnas: [{ label: "Cliente", ancho: 220 }, { label: "Fecha", align: "center", ancho: 90 }, { label: "Resultado", ancho: 200 },
        { label: "GPS", align: "center", ancho: 55 }, { label: "Fotos", align: "center", ancho: 55 }, { label: "Moto entregada", align: "center", ancho: 110 }],
      secciones: personas.map(id => {
        const vs = visitasP.filter(v => quienVisita(v) === id).sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""));
        return {
          titulo: `${nombreQuienVisita(id).toUpperCase()}   —   ${vs.length} visitas · ${vs.filter(v => resultadoVisita(v) === "aprobadas").length} aprobadas`, color: "#334155",
          filas: vs.map(v => {
            const { res, porCliente } = clasificarVisita(v);
            const e = entregaDeVisita(v);
            return [(clientePorId.get(v.cliente_id)?.nombre ?? "Sin cliente").toUpperCase(), { v: fmtFechaCorta((v.fecha || "").slice(0, 10)), align: "center" as const },
              porCliente ? "Aprobada (se aprobó el cliente)" : ETIQUETA_RESULTADO[res], { v: v.ubicacion ? "Sí" : "No", align: "center" as const },
              { v: tieneFoto(v) ? "Sí" : "No", align: "center" as const }, { v: e ? fmtFechaCorta(e) : "—", align: "center" as const }];
          }),
        };
      }),
      totalGeneral: [{ v: `TOTAL: ${visitasP.length} visitas`, bold: true }, "", "", "", "", ""],
    }, false);
  }



  // ── Clientes ───────────────────────────────────────────────────────────────
  // "Clientes con contrato": los que tienen un contrato vigente (activo o con la moto retenida). Antes
  // contaba el estado "Activo" de la ficha: 337 contra 330 reales (29-sep) — 7 figuraban activos sin
  // ningún contrato. Esos se listan aparte para que la oficina los corrija.
  const clientesConContratoIds = new Set(contratos.filter(c => c.estado === "Activo" || c.estado === "Suspendido").map(c => c.cliente_id));
  const clientesActivosSinContrato = clientes.filter(c => c.estado === "Activo" && !clientesConContratoIds.has(c.id));
  const clientesEnProceso   = clientes.filter(c => c.estado === "En proceso" || c.estado === "Aprobado").length;
  const inicioMes           = hoyStr.slice(0, 7) + "-01";
  const clientesNuevosMes   = clientes.filter(c => c.created_at >= inicioMes).length;


  // ── Alertas vencimiento ────────────────────────────────────────────────────
  const alertasVencimiento = useMemo(() => {
    const hoyMs = hoyDate().getTime();
    const en30 = hoyDate(); en30.setDate(en30.getDate() + 30);
    const iso30 = en30.toISOString().slice(0, 10);
    const dias = (f: string) => Math.round((new Date(f + "T00:00:00").getTime() - hoyMs) / 86400000);
    return flotaMotos.filter(m => (m.fecha_seguro && m.fecha_seguro <= iso30) || (m.fecha_tecnomecanica && m.fecha_tecnomecanica <= iso30))
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
  }, [flotaMotos]);

  // Motos SIN fecha de SOAT: no aparecían en ningún aviso (29-sep: 9 motos, 2 andando en la calle).
  const motosSinSoat = useMemo(() => flotaMotos.filter(m => !m.fecha_seguro), [flotaMotos]);

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
    // Es una ventana aparte, sin el CSS de la app: los colores van fijos, nunca var(--…) (6-oct: el
    // botón «Descargar / Imprimir» quedaba blanco sobre blanco, invisible).
    const win = window.open("", "_blank", "width=840,height=920");
    if (!win) return;
    const cuerpo = await firmarImagenesHtml(generarHTMLResumenEntrega(c, cliente, moto, fotos));
    win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${nombreDoc}</title>
      <style>@media print{.no-print{display:none}} body{margin:0;background:#f1f5f9}</style></head><body>
      <div class="no-print" style="position:sticky;top:0;background:white;padding:10px 16px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:flex-end">
        <button onclick="window.print()" style="display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border:none;border-radius:8px;background:#0284c7;color:#0a1020;font-weight:700;cursor:pointer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>Descargar / Imprimir</button>
      </div>${cuerpo}</body></html>`);
    win.document.close();
  }

  // ── Imprimir reporte de entregas (para enviar a los socios) ─────────────────
  function imprimirEntregas() {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    const fechaHoy = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
    const rangoLabel = RANGOS.find(r => r.key === rango)?.label ?? rango;
    const si = "<span style='color:#166534;font-weight:700;'>Completos</span>";
    const no = "<span style='color:#991b1b;font-weight:700;'>Faltan</span>";
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
    win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte de entregas</title><style>body{font-family:Arial,sans-serif;color:#0f172a;padding:32px;font-size:13px;}h1{font-size:22px;margin-bottom:4px;}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px;}th{background:#f1f5f9;padding:8px 10px;text-align:left;font-weight:700;color:#475569;}tr:nth-child(even){background:#f8fafc;}.kpis{display:flex;gap:14px;margin-top:14px;flex-wrap:wrap;}.kpi{border:1px solid #e2e8f0;border-radius:10px;padding:12px 18px;}.kpi-val{font-size:20px;font-weight:800;}footer{margin-top:28px;font-size:11px;color:#94a3b8;text-align:center;}</style></head><body>
      <h1>Reporte de entregas de motos</h1>
      <p style="color:#64748b;margin:0;">Período: <strong>${rangoLabel}</strong> (${desde} → ${hasta}) · Grupo: <strong>${grupoEnt}</strong> · Generado el ${fechaHoy}</p>
      <div class="kpis">
        <div class="kpi"><div class="kpi-val">${entregas.length}</div><div>Motos entregadas</div></div>
        <div class="kpi"><div class="kpi-val" style="color:#166534;">${entregasCompletas}</div><div>Documentación completa</div></div>
        <div class="kpi"><div class="kpi-val" style="color:#991b1b;">${entregasIncompletas}</div><div>Documentación incompleta</div></div>
        <div class="kpi"><div class="kpi-val" style="color:#0284c7;">${entregasConFotos}</div><div>Con fotos de entrega</div></div>
      </div>
      ${entregas.length === 0 ? "<p style='color:#64748b;margin-top:20px;'>No hay entregas en este período.</p>" : `<table><thead><tr><th>Fecha</th><th>Placa</th><th>Grupo</th><th>Cliente</th><th>Cédula</th><th>Modalidad</th><th>Cuota</th><th>Día pago</th><th>Plazo</th><th>Docs</th><th>Fotos</th></tr></thead><tbody>${filas}</tbody></table>`}
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
    const motosF = flotaMotos.filter(m => pasaOtro(grupoMoto(m), m.subadmin_id ?? "__none__") && (filtros.modalidad.length === 0 || pasaMod(contratoDeMoto(m)?.forma_pago)));
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
  const flotaF = useMemo(() => flotaMotos.filter(m => pasaFiltroGC(m.grupo ?? "SIN GRUPO", m.subadmin_id ?? "__none__")), [flotaMotos, filtros]); // eslint-disable-line react-hooks/exhaustive-deps
  const lugaresFlota = useMemo(() => {
    const r: Record<LugarMoto, number> = { trabajando: 0, tallerConCliente: 0, retenida: 0, tallerSinCliente: 0, disponible: 0 };
    flotaF.forEach(m => { const l = lugarDeMoto.get(m.id)?.lugar; if (l) r[l]++; });
    return r;
  }, [flotaF, lugarDeMoto]);
  const gruposFlota = useMemo(() => {
    const base = flotaMotos.filter(m => filtros.cobrador.length === 0 || filtros.cobrador.includes(m.subadmin_id ?? "__none__"));
    const extras = [...new Set(base.map(m => m.grupo ?? "SIN GRUPO"))].filter(g => !(GRUPOS as readonly string[]).includes(g));
    return [...(GRUPOS as readonly string[]), ...extras].map(g => {
      const f = base.filter(m => (m.grupo ?? "SIN GRUPO") === g);
      return { grupo: g, color: GRUPO_COLORS[g] ?? "var(--muted)", total: f.length, trabajando: f.filter(m => lugarDeMoto.get(m.id)?.lugar === "trabajando").length };
    }).filter(g => g.total > 0);
  }, [flotaMotos, filtros, lugarDeMoto]);
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

  // La lista de motos de Flota (dónde está cada una y quién la tiene). La usan Flota y el cuadro cruzado.
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
  function abrirDetalleFlota(clave: string) {
    if (clave.startsWith("lugar:")) {
      const lugar = clave.slice(6) as LugarMoto;
      const info = LUGARES.find(l => l.clave === lugar)!;
      setDetalle({ ...listaMotos(flotaF.filter(m => lugarDeMoto.get(m.id)?.lugar === lugar), `${info.etiqueta} · ${flotaF.filter(m => lugarDeMoto.get(m.id)?.lugar === lugar).length}`, info.explica, `flota_${lugar}`), chips: undefined });
      return;
    }
    if (clave.startsWith("grupo:")) {
      const g = clave.slice(6);
      const lista = flotaMotos.filter(m => (m.grupo ?? "SIN GRUPO") === g && (filtros.cobrador.length === 0 || filtros.cobrador.includes(m.subadmin_id ?? "__none__")));
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

  function excelQuietas(separar: SepararPor = "grupo") {
    const cols: ColX[] = [
      { label: "Placa", ancho: 80 }, { label: "Cliente", ancho: 200 },
      { label: "Motivo", ancho: 190 }, { label: "Dónde está", ancho: 120 },
      { label: "Guardada desde", align: "center", ancho: 100 },
      { label: "Días", align: "center", ancho: 55 },
      { label: separar === "grupo" ? "Encargado" : "Grupo", ancho: 150 },
    ];
    const secciones: SeccionX[] = bloquesPor(guardadasF, g => g.grupo, g => g.subadminNombre || "Sin asignar", separar).map(b => {
      const filas = b.items.slice().sort((a, c) => (c.dias ?? -1) - (a.dias ?? -1));
      return {
        titulo: `${b.nombre}   —   ${filas.length} moto${filas.length === 1 ? "" : "s"} · ${filas.reduce((sm, f) => sm + (f.dias ?? 0), 0)} días acumulados sin trabajar`,
        color: b.color,
        filas: filas.map(f => [
          f.placa, f.clienteNombre.toUpperCase(), f.motivo, f.donde,
          { v: f.desde ? fmtFechaCorta(f.desde) : "sin registro", align: "center" as const, color: f.sinRegistro ? "#991b1b" : undefined },
          { v: f.dias == null ? "—" : String(f.dias), align: "center" as const, bold: (f.dias ?? 0) > 30, color: (f.dias ?? 0) > 30 ? "#991b1b" : undefined },
          separar === "grupo" ? f.subadminNombre.toUpperCase() : f.grupo,
        ]),
      };
    });
    descargarExcelR({
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

  // ── COBRANZA (rediseño 2-oct): Cartera y Acuerdos, con las MISMAS filas del Resumen ──
  // Obedecen al grupo y al cobrador de la barra; los estados son los del Resumen (D-033/D-034: la
  // moto en el taller y la liquidación van aparte). Lo que se debe sale de `estadoHoy` → `loQueDebe`,
  // la misma cuenta de Cartera, partida en semanas · acuerdo · deudas (las deudas que están dentro
  // de un acuerdo no se cuentan dos veces: van en la cuota del acuerdo).
  const vigentesC = baseResumen.filter(r => r.estado !== "cerrado");
  const debenC = vigentesC.filter(r => r.debeHoy > 0).sort((a, b) => b.debeHoy - a.debeHoy);
  const sumaDebe = (f: MotoRowG[], k?: "semanas" | "acuerdo" | "deudas") => f.reduce((s, r) => s + (k ? r.debe[k] : r.debeHoy), 0);
  const siguenConContrato = (r: MotoRowG) => r.estado === "aldia" || r.estado === "gabela" || r.estado === "mora" || r.estado === "taller";
  // 5-oct: "al día" al lado de $202.000 confundía — es que hoy le toca pagar (las mismas palabras de ZALA).
  const comoVa = (r: MotoRowG) => r.estado === "mora" ? `${r.diasMora} ${r.diasMora === 1 ? "día" : "días"} en mora${r.recoleccion ? " · para recoger la moto" : r.conPlazo ? " · con plazo extra" : ""}`
    : r.estado === "gabela" ? "en gabela" : r.estado === "taller" ? "moto en el taller" : r.estado === "retenida" ? `moto retenida, ${sitioDe(r)}`
    : r.estado === "reasignada" ? "en liquidación · la moto ya la tiene otro cliente"
    : r.pagaHoy && r.debe.semanas + r.debe.acuerdo > 0 ? "al día, le toca pagar hoy" : "al día";
  const ETIQUETA_ESTADO_C: Record<string, string> = { aldia: "Al día", gabela: "Gabela", mora: "En mora", taller: "Moto en el taller", retenida: "Retenida", reasignada: "En liquidación" };
  const chipsEstadoC = (f: MotoRowG[]) => {
    const presentes = [...new Set(f.map(r => r.estado))];
    return presentes.length > 1 ? presentes.map(e => ({ clave: e, etiqueta: ETIQUETA_ESTADO_C[e] ?? e })) : undefined;
  };
  const cobradorUnico = filtros.cobrador.length === 1 && filtros.cobrador[0] !== "__none__" ? filtros.cobrador[0] : null;
  const filtroCarteraC = (base: string, grupo = grupoUnico, cobrador = cobradorUnico) =>
    `${base}${grupo ? `;grupo:${grupo}` : ""}${cobrador ? `;cobrador:${cobrador}` : ""}`;
  const aCarteraC = (base: string, grupo = grupoUnico, cobrador = cobradorUnico) => ({
    texto: "Abrir en Cartera",
    onClick: () => { setDetalle(null); onNavigate?.("cobros", filtroCarteraC(base, grupo, cobrador)); },
  });
  const repartoC = (clave: (r: MotoRowG) => string, nombre: (r: MotoRowG) => string, color?: (k: string) => string): FilaReparto[] => {
    const m = new Map<string, FilaReparto>();
    vigentesC.forEach(r => {
      const k = clave(r);
      const f = m.get(k) ?? { clave: k, nombre: nombre(r), color: color?.(k), debe: 0, clientes: 0 };
      f.debe += r.debeHoy;
      if (r.debeHoy > 0) f.clientes++;
      m.set(k, f);
    });
    return [...m.values()].sort((a, b) => b.debe - a.debe);
  };
  const modalidadesC = (() => {
    const m = new Map<string, number>();
    vigentesC.filter(r => r.contratoActivo).forEach(r => m.set(r.formaPago || "Sin definir", (m.get(r.formaPago || "Sin definir") ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  })();
  const cobranzaC = {
    debe: { total: sumaDebe(debenC), semanas: sumaDebe(vigentesC, "semanas"), acuerdo: sumaDebe(vigentesC, "acuerdo"), deudas: sumaDebe(vigentesC, "deudas"), clientes: debenC.length },
    cobrable: { conMoto: sumaDebe(vigentesC.filter(siguenConContrato)), retenidas: sumaDebe(vigentesC.filter(r => !siguenConContrato(r))) },
    estados: { aldia: alDiaF.length, gabela: gabelaF.length, mora: enMoraF.length, recoleccion: enMoraF.filter(r => r.recoleccion).length, taller: tallerF.length, retenidas: retenidasF.length, liquidacion: liquidacionF.length },
    porGrupo: repartoC(r => r.grupo, r => r.grupo, k => GRUPO_COLORS[k] ?? "var(--muted)"),
    porCobrador: repartoC(r => r.adminId, r => r.adminNombre),
    mayores: debenC.slice(0, 5).map(r => ({ contratoId: r.contratoId, placa: r.placa, grupo: r.grupo, cliente: r.cliente, detalle: comoVa(r), debe: r.debeHoy })),
    saldoFavor: { total: vigentesC.reduce((s, r) => s + r.saldoAFavor, 0), clientes: vigentesC.filter(r => r.saldoAFavor > 0).length },
    modalidades: modalidadesC,
  };
  const filaDeuda = (r: MotoRowG, monto: number) => filaMoto(r, comoVa(r), monto, "var(--bad-ink)", r.estado);
  function abrirDetalleCobranza(clave: string) {
    const i = clave.indexOf(":");
    const tipo = i < 0 ? clave : clave.slice(0, i);
    const valor = i < 0 ? "" : clave.slice(i + 1);
    if (tipo === "hoy") { abrirDetalle(clave); return; }
    if (tipo === "contrato") { irFicha(valor); return; }
    if (tipo === "debe") {
      const k = valor as "semanas" | "acuerdo" | "deudas";
      const f = vigentesC.filter(r => r.debe[k] > 0).sort((a, b) => b.debe[k] - a.debe[k]);
      const titulo = { semanas: "Cuotas del contrato", acuerdo: "Cuotas de acuerdos", deudas: "Deudas" }[k];
      const explica = {
        semanas: "Las semanas (o quincenas) de su contrato que ya les tocaba pagar y no han pagado, contando la que vence hoy.",
        acuerdo: "Lo que ya les toca pagar de sus acuerdos, con lo que traen atrasado.",
        deudas: "Multas, lavadas, daños y otras deudas registradas sin pagar. Las que están dentro de un acuerdo no salen aquí: se cobran en la cuota del acuerdo.",
      }[k];
      setDetalle({
        titulo: `${titulo} · ${f.length}`, subtitulo: `${explica} Suman ${plataT(sumaDebe(f, k))}.`,
        filas: f.map(r => filaDeuda(r, r.debe[k])), chips: chipsEstadoC(f),
        accion: aCarteraC(k === "acuerdo" ? "contratos:convenio" : "contratos:todos"), archivo: `deben_${k}`,
      });
      return;
    }
    if (tipo === "cobrable") {
      const conContrato = valor === "conmoto";
      const f = debenC.filter(r => siguenConContrato(r) === conContrato);
      setDetalle({
        titulo: `${conContrato ? "Siguen con su contrato" : "Retenidas o en liquidación"} · ${f.length}`,
        subtitulo: `${conContrato ? "Lo que deben hoy los clientes que siguen trabajando con su contrato." : "Contratos detenidos: la moto está retenida o ya la tiene otro cliente."} Suman ${plataT(sumaDebe(f))}.`,
        filas: f.map(r => filaDeuda(r, r.debeHoy)), chips: chipsEstadoC(f),
        accion: aCarteraC(conContrato ? "contratos:todos" : "contratos:retenidos"), archivo: conContrato ? "deuda_con_contrato" : "deuda_retenidas",
      });
      return;
    }
    if (tipo === "grupo" || tipo === "cobrador") {
      const f = debenC.filter(r => tipo === "grupo" ? r.grupo === valor : r.adminId === valor);
      const nombre = tipo === "grupo" ? valor : (cobranzaC.porCobrador.find(x => x.clave === valor)?.nombre ?? "");
      setDetalle({
        titulo: `Lo que deben · ${nombre} · ${f.length}`, subtitulo: `Suman ${plataT(sumaDebe(f))}. Primero los que más deben.`,
        filas: f.map(r => filaDeuda(r, r.debeHoy)), chips: chipsEstadoC(f),
        accion: tipo === "grupo" ? aCarteraC("contratos:todos", valor, cobradorUnico) : valor === "__none__" ? undefined : aCarteraC("contratos:todos", grupoUnico, valor),
        archivo: `deuda_${nombre.replace(/\s+/g, "_").toLowerCase()}`,
      });
      return;
    }
    if (tipo === "mayores") {
      setDetalle({
        titulo: `Los que deben · ${debenC.length}`, subtitulo: `Deben ${plataT(sumaDebe(debenC))} entre todos. Primero los que más deben.`,
        filas: debenC.map(r => filaDeuda(r, r.debeHoy)), chips: chipsEstadoC(debenC), accion: aCarteraC("contratos:todos"), archivo: "los_que_deben",
      });
      return;
    }
    if (tipo === "favor") {
      const f = vigentesC.filter(r => r.saldoAFavor > 0).sort((a, b) => b.saldoAFavor - a.saldoAFavor);
      setDetalle({
        titulo: `Plata a favor de los clientes · ${f.length}`,
        subtitulo: `Suman ${plataT(f.reduce((s, r) => s + r.saldoAFavor, 0))}. Es lo que pagaron de más y quedó guardado a su nombre; se aplica a mano, cuando el cliente lo decide.`,
        filas: f.map(r => filaMoto(r, comoVa(r), r.saldoAFavor, "var(--ok-ink)", r.estado)), chips: chipsEstadoC(f), archivo: "saldos_a_favor",
      });
      return;
    }
    if (tipo === "modalidad") {
      const f = vigentesC.filter(r => r.contratoActivo && (r.formaPago || "Sin definir") === valor).sort((a, b) => b.debeHoy - a.debeHoy);
      setDetalle({
        titulo: `${valor} · ${f.length}`, subtitulo: "Los contratos andando con esta forma de pago. Al lado, lo que debe hoy cada uno.",
        filas: f.map(r => filaMoto(r, comoVa(r), r.debeHoy > 0 ? r.debeHoy : null, "var(--bad-ink)", r.estado)), chips: chipsEstadoC(f), archivo: `contratos_${valor.toLowerCase()}`,
      });
    }
  }
  // Acuerdos: con el grupo y el cobrador de la barra. La lista y el Excel muestran los que se están
  // cobrando (vigentes y vencidos sin terminar); "ver también los ya pagados" suma los demás.
  const conveniosF = conveniosRep.filter(c => pasaFiltroGC(atribucion.get(c.contratoId)?.grupo ?? c.grupo, atribucion.get(c.contratoId)?.adminId));
  const conveniosVista = conveniosTodos ? conveniosF : conveniosF.filter(c => c.estado === "activo" || c.estado === "incumplido");
  const totConv = totalesConvenios(conveniosVista);
  function abrirAbonos(c: ConvenioReporte) {
    setDetalle({
      titulo: `${c.cliente.toUpperCase()} · acuerdo #${c.numero}`,
      subtitulo: `${plataT(c.total)} en ${c.numeroCuotas} ${c.numeroCuotas === 1 ? "cuota" : "cuotas"} de ${plataT(c.cuota)}. Se firmó el ${fmtFechaCorta(c.firmado)} y ${c.estado === "incumplido" ? "venció" : "vence"} el ${fmtFechaCorta(c.fechaLimite)}. Lleva ${plataT(c.abonado)}${c.atrasado > 0 ? ` y tiene atrasado ${plataT(c.atrasado)}` : ""}. Sus pagos, del más reciente al más viejo:`,
      filas: c.abonos.slice().reverse().map((a, i) => ({
        id: `${c.convenioId}-${i}`, titulo: `${fmtFechaCorta(a.fecha)} · ${a.metodo}`,
        subtitulo: `${a.cuotasCompletadas > 0 ? `Cerró ${a.cuotasCompletadas} ${a.cuotasCompletadas === 1 ? "cuota" : "cuotas"}` : "Abono parcial"} · con este, sumaba ${plataT(a.acumulado)}`,
        monto: a.monto, montoColor: "var(--ok-ink)",
        csv: { Fecha: a.fecha, Metodo: a.metodo, Abono: a.monto, Acumulado: a.acumulado, CuotasQueCerro: a.cuotasCompletadas },
      })),
      vacio: `No ha pagado ni un peso desde que firmó, hace ${c.diasDesdeFirma} días.`,
      accion: { texto: "Ver la ficha del cliente", onClick: () => irFicha(c.contratoId) },
      archivo: `acuerdo_${c.placa}_${c.numero}`,
    });
  }
  function excelConvenios() {
    const cols: ColX[] = [
      { label: "Fecha del abono", align: "center", ancho: 105 },
      { label: "Método", align: "center", ancho: 95 },
      { label: "Abonó", align: "right", ancho: 95 },
      { label: "Lleva abonado", align: "right", ancho: 105 },
      { label: "Cuotas que cerró", align: "center", ancho: 105 },
    ];
    const secciones: SeccionX[] = conveniosVista.map(c => ({
      titulo: `${c.placa}  ·  ${c.cliente.toUpperCase()}  —  Acuerdo #${c.numero} del ${fmtFechaCorta(c.firmado)} · `
        + `$${fmt(c.total)} en ${c.numeroCuotas} cuotas de $${fmt(c.cuota)} · `
        + `abonado $${fmt(c.abonado)} · saldo $${fmt(c.saldo)} · `
        + (c.estado === "cumplido" ? "PAGADO" : c.estado === "incumplido" ? `VENCIDO el ${fmtFechaCorta(c.fechaLimite)}` : c.atrasado > 0 ? `ATRASADO $${fmt(c.atrasado)}` : "al día")
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
    descargarExcelR({
      archivo: `acuerdos_${hoyISO()}`,
      titulo: conveniosTodos ? "Acuerdos de pago — todos, incluidos los ya pagados" : "Acuerdos de pago que se están cobrando — cómo se han pagado desde que se firmaron",
      periodo: `Al ${new Date(hoyISO() + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}`,
      leyenda: "Cada bloque es un acuerdo y sus abonos reales, en orden. 'Atrasado' = lo que se le ha cobrado menos lo que abonó (con arrastre); es la MISMA cuenta que ve el funcionario en Cartera. Un acuerdo vencido se sigue cobrando.",
      columnas: cols, secciones,
      totalGeneral: [
        { v: `${totConv.cantidad} acuerdos · pactado $${fmt(totConv.pactado)} · falta $${fmt(totConv.saldo)}`, bold: true }, "",
        { num: totConv.abonado, align: "right" as const, bold: true },
        { num: totConv.abonado, align: "right" as const, bold: true },
        { v: totConv.atrasado > 0 ? `atraso $${fmt(totConv.atrasado)}` : "al día", align: "center" as const, bold: true },
      ],
    });
  }

  // ── EQUIPO · NÓMINA (rediseño 2-oct) ──────────────────────────────────────────────────────────
  // La plata sale de `nominaSemanaDetallada`, igual que siempre (nominasVista: lo congelado si la
  // semana ya se pagó). Lo nuevo: grupo y cobrador de la barra, los referidos aparte de los cobros,
  // si quedó pagada en la app, y las motos de cada cobrador contadas SOLO si ya las tenía al empezar
  // la semana (la fecha de asignación, mig 058) — antes se contaban las de hoy en cualquier semana.
  const grupoNomina = filtros.grupo.length > 0 ? filtros.grupo : null;
  const pasaGrupoN = (g: string) => !grupoNomina || grupoNomina.includes(g);
  const pasaCobradorN = (id: string | null) => filtros.cobrador.length === 0 || filtros.cobrador.includes(id ?? "__none__");
  const asignadaElMoto = (m: (typeof motos)[number]) => m.subadmin_asignado_desde ? fechaISO(new Date(m.subadmin_asignado_desde)) : null;
  /** ¿El cobrador de hoy ya tenía esta moto al empezar la semana? Sin fecha = de antes de la mig 058. */
  const teniaAlEmpezar = (m: (typeof motos)[number], lunes: string) => { const a = asignadaElMoto(m); return !a || a <= lunes; };
  const motosQueTenia = (id: string, lunes: string) => motos.filter(m => m.subadmin_id === id && teniaAlEmpezar(m, lunes) && pasaGrupoN(m.grupo ?? "—"));
  const celdaCobrador = (id: string, lunes: string, renglones: GestionNomina[]): CeldaSemana => {
    const suyas = motosQueTenia(id, lunes);
    if (suyas.length === 0) return null;
    const conPago = new Set(renglones.filter(r => TIPOS_COBRO.has(r.tipo)).map(r => r.motoId));
    return { tenia: suyas.length, generaron: suyas.filter(m => conPago.has(m.id)).length };
  };
  const partesDe = (rs: GestionNomina[]) => {
    const visitasR = rs.filter(r => r.tipo === "visita");
    const referidosR = rs.filter(r => r.tipo === "referido");
    const suma = (x: GestionNomina[]) => x.reduce((a, r) => a + r.valor, 0);
    return { cobros: suma(rs.filter(r => r.tipo !== "visita" && r.tipo !== "referido")), visitas: suma(visitasR), nVisitas: visitasR.length, referidos: suma(referidosR), nReferidos: referidosR.length };
  };
  const nombreCobradorN = (id: string | null) => id === null ? "Sin cobrador" : (subadmins.find(sa => sa.id === id)?.nombre ?? "Cobrador");
  const fechaCortaN = (iso: string) => new Date(iso.slice(0, 10) + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  const cobradoresN = nominasVista.filter(n => n.subadminId !== null && pasaCobradorN(n.subadminId))
    .map(n => ({ n, renglones: grupoNomina ? n.renglones.filter(r => pasaGrupoN(r.grupo)) : n.renglones }))
    .filter(x => !grupoNomina || x.renglones.length > 0);
  const sinCobradorN = filtros.cobrador.length === 0 ? nominasVista.find(n => n.subadminId === null) : undefined;
  const renglonesN = cobradoresN.flatMap(x => x.renglones.map(r => ({ r, quien: x.n.subadminId })));
  // Las motos con gestión que hoy son de un cobrador que no las tenía cuando empezó la semana.
  const motosDeOtroN = new Set(renglonesN.filter(({ r }) => TIPOS_COBRO.has(r.tipo)).map(({ r }) => r.motoId)
    .filter(id => { const m = motoPorId.get(id); return !!m && !teniaAlEmpezar(m, lunesNomina); })).size;
  const datosNomina: DatosNomina = {
    textoSemana: textoSemanaNomina,
    puedeSiguiente: domingoNomina < hoyISO(),
    cargando: nominaCargando, error: !!nominaError,
    vigia: vigiaCubre(lunesNomina),
    motosDeOtro: motosDeOtroN,
    sinCobrador: sinCobradorN && sinCobradorN.renglones.some(r => pasaGrupoN(r.grupo)) ? (() => {
      const rs = sinCobradorN.renglones.filter(r => pasaGrupoN(r.grupo));
      return { n: rs.length, total: rs.reduce((a, r) => a + r.valor, 0), placas: [...new Set(rs.map(r => r.placa))] };
    })() : null,
    grupoFiltrado: grupoNomina ? grupoNomina.join(", ") : null,
    total: grupoNomina ? renglonesN.reduce((a, { r }) => a + r.valor, 0) : cobradoresN.reduce((a, x) => a + x.n.total, 0),
    partes: partesDe(renglonesN.map(x => x.r)),
    cobradores: cobradoresN.map(({ n, renglones }) => {
      const p = partesDe(renglones);
      const ci = cierreDe(n.subadminId!);
      return {
        id: n.subadminId!, nombre: nombreCobradorN(n.subadminId),
        total: grupoNomina ? renglones.reduce((a, r) => a + r.valor, 0) : n.total,
        partes: { cobros: p.cobros, visitas: p.visitas, referidos: p.referidos },
        // En una semana ya pagada mandan las cifras congeladas: el reverso vivo podría contradecirlas.
        motos: ci ? null : celdaCobrador(n.subadminId!, lunesNomina, n.renglones),
        pagada: ci ? fechaCortaN(ci.created_at) : null,
      };
    }),
    portafolios: (() => {
      const m = new Map<string, number>();
      renglonesN.forEach(({ r }) => m.set(r.grupo, (m.get(r.grupo) ?? 0) + r.valor));
      return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([grupo, total]) => ({ grupo, total, color: GRUPO_COLORS[grupo] ?? "var(--muted)" }));
    })(),
    tendencia: {
      semanas: semanasTendencia.map((l, i) => ({
        lunes: l, texto: textoSemanaCorto(l), enCurso: masDias(l, 6) >= hoyISO(),
        pagadas: new Set(cierresTendencia.filter(c => c.semana_lunes === l && c.subadmin_id).map(c => c.subadmin_id)).size,
        cobradores: (tendenciaNomina[i] ?? []).filter(n => n.subadminId !== null).length,
      })),
      filas: [...new Set(motos.map(m => m.subadmin_id).filter((x): x is string => !!x))]
        .filter(id => pasaCobradorN(id))
        .map(id => ({ id, nombre: nombreCobradorN(id), celdas: semanasTendencia.map((l, i) => celdaCobrador(id, l, (tendenciaNomina[i] ?? []).find(n => n.subadminId === id)?.renglones ?? [])) }))
        .filter(f => f.celdas.some(c => c && c.tenia > 0))
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
      cargando: cargandoTendencia,
    },
    valores: { ciclo: VALOR_CICLO, atrasado: VALOR_ATRASADO, retencion: VALOR_RETENCION, visita: VALOR_VISITA, referido: VALOR_REFERIDO, pctAtrasado: PCT_ATRASADO },
  };
  const contratoDeMotoN = (motoId: string) => contratos.filter(c => c.moto_id === motoId)
    .sort((a, b) => Number(b.estado === "Activo" || b.estado === "Suspendido") - Number(a.estado === "Activo" || a.estado === "Suspendido") || (b.fecha_entrega ?? "").localeCompare(a.fecha_entrega ?? ""))[0];
  const irDesdeMoto = (motoId: string) => { const c = contratoDeMotoN(motoId); setDetalle(null); if (c) onNavigate?.("ficha_cliente", c.cliente_id); else onNavigate?.("ficha_moto", motoId); };
  const filaRenglon = (r: GestionNomina, i: number, quien?: string | null): FilaDetalle => ({
    id: `${r.motoId}|${r.tipo}|${r.fecha}|${i}`, placa: r.placa, grupo: r.grupo, titulo: r.cliente,
    subtitulo: `${TIPO_NOMINA[r.tipo]} · ${fechaCortaN(r.fecha)}${quien !== undefined ? ` · ${nombreCobradorN(quien)}` : ""}`,
    monto: r.valor, montoColor: "var(--ok-ink)", filtro: r.tipo, onClick: () => irDesdeMoto(r.motoId),
    csv: { Placa: r.placa, Cliente: r.cliente, Grupo: r.grupo, Pago: TIPO_NOMINA[r.tipo], Fecha: r.fecha, Valor: r.valor, ...(quien !== undefined ? { Cobrador: nombreCobradorN(quien) } : {}) },
  });
  const chipsTipos = (rs: GestionNomina[], extra: { clave: string; etiqueta: string }[] = []) => {
    const tipos = (Object.keys(TIPO_NOMINA) as TipoGestion[]).filter(t => rs.some(r => r.tipo === t));
    const chips = [...tipos.map(t => ({ clave: t as string, etiqueta: TIPO_NOMINA_CORTO[t] })), ...extra];
    return chips.length > 1 ? chips : undefined;
  };
  const nombreArchivo = (x: string) => x.toLowerCase().replace(/\s+/g, "_");
  function abrirDetalleNomina(clave: string) {
    // "Ver sus motos por grupo" (8-oct): la nómina no repite el cuadro, lleva a Portafolios › Cruzado.
    if (clave === "ir:cruzado") { setVistaCruzado("motos"); setTab("cruzado"); return; }
    const i = clave.indexOf(":");
    const tipo = clave.slice(0, i);
    const valor = clave.slice(i + 1);
    const semana = textoSemanaNomina;
    if (tipo === "parte") {
      const deLaParte = renglonesN.filter(({ r }) => valor === "visitas" ? r.tipo === "visita" : valor === "referidos" ? r.tipo === "referido" : r.tipo !== "visita" && r.tipo !== "referido");
      const titulo = { cobros: "Cobro de cuotas", visitas: "Visitas domiciliarias", referidos: "Referidos" }[valor] ?? valor;
      const explica = {
        cobros: "Lo que se paga por cobrar: semanas a tiempo, atrasadas, retenciones y cuotas de acuerdo de motos retenidas.",
        visitas: "Las visitas se pagan a quien las hizo, en la semana en que se entrega la moto.",
        referidos: "Cada referido se le paga a quien trajo al cliente, en la semana en que se entrega la moto.",
      }[valor] ?? "";
      setDetalle({
        titulo: `${titulo} · ${deLaParte.length}`, subtitulo: `${semana}. ${explica}`,
        filas: deLaParte.map(({ r, quien }, k) => filaRenglon(r, k, quien)),
        chips: valor === "cobros" ? chipsTipos(deLaParte.map(x => x.r)) : undefined,
        archivo: `nomina_${valor}_${lunesNomina}`,
      });
      return;
    }
    if (tipo === "grupo") {
      const delGrupo = renglonesN.filter(({ r }) => r.grupo === valor);
      setDetalle({
        titulo: `Lo que pone ${valor} · ${delGrupo.length}`, subtitulo: `${semana}. La gestión de las motos de ${valor}, cobrador por cobrador.`,
        filas: delGrupo.map(({ r, quien }, k) => filaRenglon(r, k, quien)), chips: chipsTipos(delGrupo.map(x => x.r)),
        archivo: `nomina_${nombreArchivo(valor)}_${lunesNomina}`,
      });
      return;
    }
    if (tipo === "cobrador") {
      const x = cobradoresN.find(c => c.n.subadminId === valor);
      if (!x) return;
      const nombre = nombreCobradorN(valor);
      const ci = cierreDe(valor);
      const p = partesDe(x.renglones);
      const total = grupoNomina ? x.renglones.reduce((a, r) => a + r.valor, 0) : x.n.total;
      // Las motos que ya tenía al empezar la semana y no le generaron pago, con su motivo. En una
      // semana pagada no se muestran: mandan las cifras congeladas de ese día.
      const motivoDe = new Map((sinGestionPorCobrador.get(valor) ?? []).map(sg => [sg.motoId, sg.motivo]));
      const conPago = new Set(x.n.renglones.filter(r => TIPOS_COBRO.has(r.tipo)).map(r => r.motoId));
      const sinPago = ci ? [] : motosQueTenia(valor, lunesNomina).filter(m => !conPago.has(m.id));
      const filasSinPago: FilaDetalle[] = sinPago.map(m => {
        const mv = motivoDe.get(m.id);
        const c = contratoDeMotoN(m.id);
        return {
          id: "sinpago|" + m.id, placa: m.placa, grupo: m.grupo ?? "—",
          titulo: c ? (clientePorId.get(c.cliente_id)?.nombre ?? "—") : "Sin cliente",
          subtitulo: mv ? TEXTO_SIN_GESTION[mv] : "Solo tuvo una visita o un referido esta semana",
          monto: 0, montoColor: "var(--muted2)", filtro: "sinpago", onClick: () => irDesdeMoto(m.id),
          csv: { Placa: m.placa, Cliente: c ? (clientePorId.get(c.cliente_id)?.nombre ?? "") : "", Grupo: m.grupo ?? "", Pago: "No generó pago", Motivo: mv ? TEXTO_SIN_GESTION[mv] : "Solo visita o referido", Valor: 0 },
        };
      });
      const puedeCerrar = nominaLista && !grupoNomina;
      const porQueNo = grupoNomina ? "Quita el filtro de grupo para pagar o imprimir." : nominaError ? "No se pudo traer toda la semana." : "Cargando la semana…";
      const deriva = derivaNomina.get(valor);
      const botonPie: React.CSSProperties = { flex: "1 1 140px", height: 44, borderRadius: 12, cursor: puedeCerrar ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: puedeCerrar ? 1 : 0.5, fontFamily: "inherit" };
      setDetalle({
        titulo: nombre.toUpperCase(),
        subtitulo: `${semana} · ${ci ? `pagada en la app el ${fechaCortaN(ci.created_at)}${ci.firma_url ? ", firmada" : ", sin firma"}` : "pago no registrado en la app"}`,
        encabezado: (
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{plataT(total)}</div>
            {([["Cobro de cuotas", p.cobros], [`${p.nVisitas} ${p.nVisitas === 1 ? "visita" : "visitas"}`, p.visitas], [`${p.nReferidos} ${p.nReferidos === 1 ? "referido" : "referidos"}`, p.referidos]] as const)
              .filter(([, v], k) => k === 0 || v > 0).map(([t, v]) => (
                <div key={t} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>{t}</span><span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{plataT(v)}</span></div>
              ))}
            {!ci && <div style={{ fontSize: 12, color: "var(--muted2)" }}>De las {motosQueTenia(valor, lunesNomina).length} motos que ya tenía al empezar la semana, {motosQueTenia(valor, lunesNomina).length - sinPago.length} le generaron pago.</div>}
            {deriva !== undefined && (
              <div style={{ fontSize: 12, color: "var(--warn-ink)", background: "var(--warn-soft)", border: "1px solid var(--warn-line)", borderRadius: 10, padding: "6px 10px", lineHeight: 1.45 }}>
                Entró plata de esta semana después de pagarla. Se le pagó {plataT(x.n.total)}; con lo de hoy daría {plataT(deriva)}. La diferencia de {plataT(Math.abs(deriva - x.n.total))} va en la próxima.
              </div>
            )}
            {!puedeCerrar && <div style={{ fontSize: 12, color: "var(--muted2)" }}>{porQueNo}</div>}
          </div>
        ),
        filas: [...x.renglones.map((r, k) => filaRenglon(r, k)), ...filasSinPago],
        chips: chipsTipos(x.renglones, filasSinPago.length > 0 ? [{ clave: "sinpago", etiqueta: "No generaron pago" }] : []),
        archivo: `nomina_${nombreArchivo(nombre)}_${lunesNomina}`,
        acciones: (
          <>
            <button disabled={!puedeCerrar} onClick={() => {
              const tenia = motosQueTenia(valor, lunesNomina);
              const idsTenia = new Set(tenia.map(m => m.id));
              generarDesprendibleNomina(x.n, nombre, lunesNomina, domingoNomina, profile?.nombre ?? "", {
                // Una semana cerrada se imprime tal como se pagó: sin el reverso vivo, que hoy podría
                // decir otra cosa que las cifras congeladas de ese día. Si no, las motos que ya tenía
                // al empezar la semana, igual que en la pantalla.
                sinGestion: ci ? [] : (sinGestionPorCobrador.get(valor) ?? []).filter(sg => idsTenia.has(sg.motoId)),
                motosAsignadas: ci ? 0 : tenia.length,
              });
            }} style={{ ...botonPie, border: "1px solid var(--line2)", background: "transparent", color: "var(--text)" }}>
              <Printer size={16} aria-hidden="true" /> Desprendible
            </button>
            {ci ? (
              <span style={{ ...botonPie, cursor: "default", opacity: 1, border: "1px solid var(--ok-line)", background: "var(--ok-soft)", color: "var(--ok-ink)" }}>
                <Check size={16} aria-hidden="true" /> Pagada el {fechaCortaN(ci.created_at)}
              </span>
            ) : (
              <button disabled={!puedeCerrar} onClick={() => { setDetalle(null); setCerrando(valor); }}
                style={{ ...botonPie, border: "none", background: "var(--accent)", color: "var(--on-accent)" }}>
                <Check size={16} aria-hidden="true" /> Cerrar y pagar
              </button>
            )}
          </>
        ),
      });
    }
  }

  // ── EQUIPO · VISITAS (rediseño 2-oct): período y cobrador (quién la hizo); el grupo no aplica ──
  const quienVisita = (v: (typeof visitas)[number]) => v.realizada_por ?? v.asignada_a ?? "__none__";
  const clasificarVisita = (v: (typeof visitas)[number]) => resultadoDeVisita(v, clientePorId.get(v.cliente_id)?.estado, entregaDeVisita(v) !== null);
  const resultadoVisita = (v: (typeof visitas)[number]) => clasificarVisita(v).res;
  const nombreQuienVisita = (id: string) => id === "__none__" ? "Sin asignar" : (subadmins.find(sa => sa.id === id)?.nombre ?? "—");
  const visitasP = visitas.filter(v => { const f = (v.fecha || "").slice(0, 10); return f >= desde && f <= hasta && (filtros.cobrador.length === 0 || filtros.cobrador.includes(quienVisita(v))); });
  /** La primera entrega de moto a ese cliente desde el día de la visita (sus contratos anteriores no cuentan). */
  const entregaDeVisita = (v: (typeof visitas)[number]) => contratos
    .filter(c => c.cliente_id === v.cliente_id && c.fecha_entrega && c.fecha_entrega >= (v.fecha || "").slice(0, 10))
    .map(c => c.fecha_entrega!).sort()[0] ?? null;
  const diasEntre = (a: string, b: string) => Math.round((new Date(b + "T12:00:00").getTime() - new Date(a + "T12:00:00").getTime()) / 86_400_000);
  const aprobadasV = visitasP.filter(v => resultadoVisita(v) === "aprobadas");
  const conMotoV = aprobadasV.filter(v => entregaDeVisita(v) !== null);
  const diasV = conMotoV.map(v => diasEntre((v.fecha || "").slice(0, 10), entregaDeVisita(v)!)).sort((a, b) => a - b);
  const hechasV = visitasP.filter(v => v.estado !== "Pendiente");
  const tieneFoto = (v: (typeof visitas)[number]) => !!(v.fotos?.clienteFuncionario || v.fotos?.fachada);
  const datosVisitas: DatosVisitas = {
    total: visitasP.length,
    resultados: {
      aprobadas: aprobadasV.length,
      esperando: visitasP.filter(v => resultadoVisita(v) === "esperando").length,
      repetir: visitasP.filter(v => resultadoVisita(v) === "repetir").length,
      rechazadas: visitasP.filter(v => resultadoVisita(v) === "rechazadas").length,
      sinResultado: visitasP.filter(v => resultadoVisita(v) === "sinResultado").length,
      pendientes: visitasP.filter(v => resultadoVisita(v) === "pendientes").length,
    },
    entregas: {
      conMoto: conMotoV.length, esperando: aprobadasV.length - conMotoV.length,
      mediana: diasV.length ? diasV[Math.floor((diasV.length - 1) / 2)] : null,
      maximo: diasV.length ? diasV[diasV.length - 1] : null,
    },
    evidencia: { hechas: hechasV.length, conGps: hechasV.filter(v => !!v.ubicacion).length, conFoto: hechasV.filter(tieneFoto).length },
    estimadas: visitasP.filter(v => !v.realizada_por).length,
    aprobadasPorCliente: aprobadasV.filter(v => clasificarVisita(v).porCliente).length,
    personas: [...new Set(visitasP.map(quienVisita))].map(id => {
      const suyas = visitasP.filter(v => quienVisita(v) === id);
      return { id, nombre: nombreQuienVisita(id), total: suyas.length, aprobadas: suyas.filter(v => resultadoVisita(v) === "aprobadas").length };
    }).sort((a, b) => Number(a.id === "__none__") - Number(b.id === "__none__") || b.total - a.total),
  };
  const filaVisita = (v: (typeof visitas)[number], extra?: string): FilaDetalle => {
    const cliente = clientePorId.get(v.cliente_id)?.nombre ?? "Sin cliente";
    const { res, porCliente } = clasificarVisita(v);
    return {
      id: v.id, titulo: cliente,
      subtitulo: `${fechaCortaN((v.fecha || "").slice(0, 10))} · ${nombreQuienVisita(quienVisita(v))} · ${porCliente ? "Aprobada (se aprobó el cliente, no la visita)" : ETIQUETA_RESULTADO[res]}${extra ? ` · ${extra}` : ""}`,
      filtro: res, rielColor: res === "aprobadas" ? "var(--ok)" : res === "rechazadas" ? "var(--bad)" : res === "repetir" ? "var(--warn)" : undefined,
      onClick: () => { setDetalle(null); onNavigate?.("ficha_cliente", v.cliente_id); },
      csv: { Fecha: (v.fecha || "").slice(0, 10), Cliente: cliente, Hizo: nombreQuienVisita(quienVisita(v)), Resultado: porCliente ? "Aprobada (se aprobó el cliente)" : ETIQUETA_RESULTADO[res], GPS: v.ubicacion ? "si" : "no", Fotos: tieneFoto(v) ? "si" : "no" },
    };
  };
  const chipsResultado = (lista: (typeof visitas)) => {
    const presentes = (["aprobadas", "esperando", "repetir", "rechazadas", "sinResultado", "pendientes"] as const).filter(k => lista.some(v => resultadoVisita(v) === k));
    return presentes.length > 1 ? presentes.map(k => ({ clave: k as string, etiqueta: ETIQUETA_RESULTADO[k] })) : undefined;
  };
  function abrirDetalleVisitas(clave: string) {
    const per = textoRango(desde, hasta);
    const i = clave.indexOf(":");
    const tipo = i < 0 ? clave : clave.slice(0, i);
    const valor = i < 0 ? "" : clave.slice(i + 1);
    if (tipo === "res") {
      const lista = visitasP.filter(v => resultadoVisita(v) === valor);
      setDetalle({ titulo: `${ETIQUETA_RESULTADO[valor as ResultadoVisita]} · ${lista.length}`, subtitulo: `${per}. Toca una para ver la ficha del cliente.`, filas: lista.map(v => filaVisita(v)), archivo: `visitas_${valor}_${desde}_${hasta}` });
    } else if (tipo === "entregas") {
      setDetalle({
        titulo: `Ya recibieron su moto · ${conMotoV.length}`, subtitulo: `${per}. Al lado de cada uno, los días entre la visita y la entrega.`,
        filas: conMotoV.map(v => { const e = entregaDeVisita(v)!; const n = diasEntre((v.fecha || "").slice(0, 10), e); return filaVisita(v, `moto entregada el ${fechaCortaN(e)} (${n === 0 ? "el mismo día" : n === 1 ? "1 día después" : `${n} días después`})`); }),
        archivo: `visitas_entregas_${desde}_${hasta}`,
      });
    } else if (tipo === "esperando") {
      const lista = aprobadasV.filter(v => entregaDeVisita(v) === null);
      setDetalle({ titulo: `Aprobados sin moto todavía · ${lista.length}`, subtitulo: `${per}. Tienen la visita aprobada pero aún no se les ha entregado la moto.`, filas: lista.map(v => filaVisita(v)), archivo: `visitas_sin_moto_${desde}_${hasta}` });
    } else if (tipo === "singps" || tipo === "sinfoto") {
      const lista = hechasV.filter(v => tipo === "singps" ? !v.ubicacion : !tieneFoto(v));
      setDetalle({ titulo: `${tipo === "singps" ? "Sin la ubicación del GPS" : "Sin fotos"} · ${lista.length}`, subtitulo: `${per}. Visitas hechas que quedaron sin esa evidencia.`, filas: lista.map(v => filaVisita(v)), chips: chipsResultado(lista), archivo: `visitas_${tipo}_${desde}_${hasta}` });
    } else if (tipo === "persona") {
      const lista = visitasP.filter(v => quienVisita(v) === valor);
      setDetalle({ titulo: `${nombreQuienVisita(valor).toUpperCase()} · ${lista.length}`, subtitulo: `${per}. Sus visitas, de la más reciente a la más vieja.`, filas: lista.slice().sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "")).map(v => filaVisita(v)), chips: chipsResultado(lista), archivo: `visitas_${nombreArchivo(nombreQuienVisita(valor))}_${desde}_${hasta}` });
    }
  }

  // ── DESCARGAR (rediseño 2-oct): el informe para los socios con las MISMAS cifras de cada pantalla ──
  function armarInforme(): DatosInforme {
    const per = textoRango(desde, hasta);
    const filtrosTxt = textoFiltrosGC();
    // Por cobrador, cada moto desde que la tiene (D-035), igual que Portafolios.
    const filasGC = baseGestion.filter(r => pasaFiltroGC(r.grupo, r.adminId)).map(comoCobrador);
    const antesGC = baseGestion.filter(r => pasaFiltroGC(r.grupo, r.adminId)).reduce((a, r) => a + r.montoAntes, 0);
    const porCob = new Map<string, MotoRowG[]>();
    filasGC.forEach(r => { const k = r.adminNombre || "Sin asignar"; porCob.set(k, [...(porCob.get(k) ?? []), r]); });
    const gruposMatriz = [...new Set(filasGC.filter(r => r.monto > 0).map(r => r.grupo))].sort();
    const porCobrarA = conveniosF.filter(c => c.estado === "activo" || c.estado === "incumplido");
    const en14 = masDias(hoyISO(), 14);
    const prontoA = porCobrarA.filter(c => c.estado === "activo" && c.fechaLimite >= hoyISO() && c.fechaLimite <= en14 && c.saldo > 0);
    const metodo = new Map<string, { efectivo: number; transferencia: number }>();
    pagosDelFiltro.forEach(pg => {
      const k = pagoAntesDeAsignar(pg) ? "Antes de asignar" : (atribucion.get(pg.contrato_id)?.adminNombre || "Sin asignar");
      const m = metodo.get(k) ?? { efectivo: 0, transferencia: 0 };
      if (pg.metodo === "Efectivo") m.efectivo += pg.valor; else m.transferencia += pg.valor;
      metodo.set(k, m);
    });
    const sinAc = new Map<string, MotoRowG[]>();
    baseResumen.filter(r => r.debeSinConvenio && r.estado !== "cerrado").forEach(r => { const k = r.adminNombre || "Sin asignar"; sinAc.set(k, [...(sinAc.get(k) ?? []), r]); });
    const nom = datosNomina;
    return {
      periodo: per,
      filtros: filtrosTxt,
      generado: textoRango(hoyISO(), hoyISO()),
      resumen: {
        recaudo: { total: recaudoR.total, empresa: recaudoR.empresa, ahorro: recaudoR.ahorro, baseYSaldo: recaudoR.baseYSaldo, anterior: cobradorFiltrado ? null : anteriorR, textoAnterior: textoRango(desdeAnt, hastaAnt), antes: antesR },
        cumplimiento: cumplimientoR,
        estados: estadosR.map(e => ({ etiqueta: e.etiqueta, hoy: e.hoy, cierre: e.cierre })),
        cierreTexto,
        tramos: tramosR.map(t => ({ etiqueta: t.etiqueta, n: t.filas.length, debe: t.debe })),
        sinProducir: { motos: sinProducirR.motos, dias: sinProducirR.dias, estimado: sinProducirR.estimado },
      },
      cobranza: {
        debe: cobranzaC.debe,
        cobrable: cobranzaC.cobrable,
        estados: [
          { etiqueta: "Al día", n: cobranzaC.estados.aldia }, { etiqueta: "Gabela (día de gracia)", n: cobranzaC.estados.gabela },
          { etiqueta: "En mora", n: cobranzaC.estados.mora }, { etiqueta: "De los que están en mora, para recoger la moto", n: cobranzaC.estados.recoleccion },
          { etiqueta: "Con la moto en el taller", n: cobranzaC.estados.taller }, { etiqueta: "Retenidas por no pagar", n: cobranzaC.estados.retenidas },
          { etiqueta: "En liquidación", n: cobranzaC.estados.liquidacion },
        ],
        porGrupo: cobranzaC.porGrupo.map(g => ({ nombre: g.nombre, debe: g.debe, clientes: g.clientes })),
        porCobrador: cobranzaC.porCobrador.map(g => ({ nombre: g.nombre, debe: g.debe, clientes: g.clientes })),
        mayores: debenC.slice(0, 10).map(r => ({ cliente: r.cliente, placa: r.placa, grupo: r.grupo, detalle: comoVa(r), debe: r.debeHoy })),
        saldoFavor: cobranzaC.saldoFavor,
        acuerdos: {
          n: porCobrarA.length, pactado: porCobrarA.reduce((a, c) => a + c.total, 0), pagado: porCobrarA.reduce((a, c) => a + c.abonado, 0),
          falta: porCobrarA.reduce((a, c) => a + c.saldo, 0), atrasado: porCobrarA.reduce((a, c) => a + c.atrasado, 0),
          aldia: porCobrarA.filter(c => c.estado === "activo" && c.alDia).length, atrasados: porCobrarA.filter(c => c.estado === "activo" && !c.alDia).length,
          vencidos: porCobrarA.filter(c => c.estado === "incumplido").length, sinAbono: porCobrarA.filter(c => c.abonos.length === 0).length,
          vencenPronto: prontoA.length, faltaPronto: prontoA.reduce((a, c) => a + c.saldo, 0),
        },
      },
      portafolios: {
        grupos: gruposR.filter(g => (filtros.grupo.length === 0 || filtros.grupo.includes(g.grupo)) && (g.recaudo > 0 || g.contratosActivos > 0 || g.motosAsignadas > 0))
          .map(g => ({ grupo: g.grupo, recaudo: g.recaudo, pctCum: g.pctCum, enMora: g.enMora, trabajando: g.motosAsignadas, contratos: g.contratosActivos })),
        cobradores: [...porCob.entries()].map(([nombre, rs]) => ({
          nombre, recaudo: rs.reduce((a, r) => a + r.monto, 0), pctCum: pctCumplimiento(rs.filter(cuentaParaCumplimiento).map(r => r.cum)),
          enMora: rs.filter(r => r.estado === "mora").length, motos: rs.filter(r => !fueraDeGestion(r.estado)).length,
        })).filter(c => c.recaudo > 0 || c.motos > 0).sort((a, b) => b.recaudo - a.recaudo),
        antesDeAsignar: antesGC,
      },
      equipo: {
        nomina: nom.cargando || nom.error ? null : {
          semana: nom.textoSemana, total: nom.total, cobros: nom.partes.cobros, visitas: nom.partes.visitas, nVisitas: nom.partes.nVisitas,
          referidos: nom.partes.referidos, nReferidos: nom.partes.nReferidos, pagadas: nom.cobradores.filter(c => c.pagada).length,
          cobradores: nom.cobradores.map(c => ({ nombre: c.nombre, total: c.total, cobros: c.partes.cobros, visitas: c.partes.visitas, referidos: c.partes.referidos,
            motos: c.motos ? `${c.motos.generaron} de ${c.motos.tenia}` : "—", pagada: c.pagada })),
        },
        visitas: {
          total: datosVisitas.total, ...datosVisitas.resultados,
          conMoto: datosVisitas.entregas.conMoto, mediana: datosVisitas.entregas.mediana, maximo: datosVisitas.entregas.maximo,
          hechas: datosVisitas.evidencia.hechas, conGps: datosVisitas.evidencia.conGps, conFoto: datosVisitas.evidencia.conFoto,
          personas: datosVisitas.personas.map(x => ({ nombre: x.nombre, total: x.total, aprobadas: x.aprobadas })),
        },
      },
      flota: {
        total: flotaF.length,
        lugares: LUGARES.map(l => ({ etiqueta: l.etiqueta, n: lugaresFlota[l.clave] })),
        grupos: gruposFlota.map(g => ({ grupo: g.grupo, total: g.total, trabajando: g.trabajando })),
        papeles: { vencidos: alertasF.filter(a => a.vencida).length, porVencer: alertasF.filter(a => !a.vencida).length, sinSoat: sinSoatFlota.length },
        guardadas: { motos: guardadasF.length, dias: guardadasF.reduce((a, g) => a + (g.dias ?? 0), 0) },
      },
      anexos: {
        matriz: {
          grupos: gruposMatriz,
          filas: [...porCob.entries()].map(([nombre, rs]) => {
            const celdas = gruposMatriz.map(g => rs.filter(r => r.grupo === g).reduce((a, r) => a + r.monto, 0));
            return { nombre, celdas, total: celdas.reduce((a, c) => a + c, 0) };
          }).filter(f => f.total > 0).sort((a, b) => b.total - a.total),
          antes: antesGC,
        },
        metodo: [...metodo.entries()].map(([nombre, m]) => ({ nombre, ...m }))
          .sort((a, b) => Number(a.nombre === "Antes de asignar") - Number(b.nombre === "Antes de asignar") || (b.efectivo + b.transferencia) - (a.efectivo + a.transferencia)),
        sinAcuerdo: [...sinAc.entries()].map(([cobrador, rs]) => ({ cobrador, clientes: rs.slice().sort((a, b) => b.deudaPend - a.deudaPend).map(r => ({ cliente: r.cliente, placa: r.placa, telefono: r.telefono, debe: r.deudaPend })) }))
          .sort((a, b) => b.clientes.length - a.clientes.length),
      },
      detalle: {
        enMora: enMoraF.map(r => ({ cliente: r.cliente, placa: r.placa, grupo: r.grupo, dias: r.diasMora, debe: r.debeHoy })),
        retenidas: [...retenidasF.map(r => ({ r, donde: `Moto ${sitioDe(r)}` })), ...liquidacionF.map(r => ({ r, donde: "En liquidación: la moto ya la tiene otro cliente" }))]
          .map(({ r, donde }) => ({ cliente: r.cliente, placa: r.placa, grupo: r.grupo, donde, debe: r.debeHoy })),
        acuerdos: porCobrarA.filter(c => c.estado === "incumplido" || c.atrasado > 0)
          .map(c => ({ cliente: c.cliente, placa: c.placa, total: c.total, pagado: c.abonado, atrasado: c.estado === "incumplido" ? c.saldo : c.atrasado, vence: fmtFechaCorta(c.fechaLimite), estado: c.estado })),
        guardadas: guardadasF.slice().sort((a, b) => (b.dias ?? -1) - (a.dias ?? -1)).map(g => ({ placa: g.placa, cliente: g.clienteNombre, motivo: g.motivo, dias: g.dias })),
      },
    };
  }
  const nombreInforme = () => `informe_socios${filtrosSlug ? "_" + filtrosSlug : ""}_${desde}_a_${hasta}`;
  async function descargarInformeSocios(secciones: SeccionInforme[], detalle: boolean, anexos: boolean) {
    if (generandoPdf) return;
    setGenerandoPdf(true);
    try {
      const { htmlAPdfBlob } = await import("../utils/pdf");
      const blob = await htmlAPdfBlob(informeSociosHTML(armarInforme(), { secciones, detalle, anexos }), { cortesSeguros: true });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombreInforme() + ".pdf";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {
      alert("No se pudo generar el PDF: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setGenerandoPdf(false);
    }
  }
  function imprimirInformeSocios(secciones: SeccionInforme[], detalle: boolean, anexos: boolean) {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${nombreInforme()}</title><style>@page{size:A4;margin:10mm}body{margin:0}</style></head><body>${informeSociosHTML(armarInforme(), { secciones, detalle, anexos })}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }
  function excelPagosPeriodo(separar: SepararPor = "grupo") {
    const filas = pagosFiltrados.slice().sort((a, b) => fechaDeCaja(a).localeCompare(fechaDeCaja(b)));
    const grupoDePago = (pg: (typeof filas)[number]) => atribucion.get(pg.contrato_id)?.grupo ?? "SIN GRUPO";
    const cobradorDePago = (pg: (typeof filas)[number]) => pagoAntesDeAsignar(pg) ? "Antes de asignar" : (atribucion.get(pg.contrato_id)?.adminNombre || "Sin asignar");
    descargarExcelR({
      archivo: `pagos_${desde}_a_${hasta}`, titulo: "Pagos del período", periodo: textoRango(desde, hasta),
      leyenda: "Confirmados. Las transferencias por la fecha del banco y el efectivo por el día en que se recibió. A cada cobrador, lo de sus motos desde que las tiene (D-035).",
      columnas: [{ label: "Fecha", align: "center", ancho: 90 }, { label: "Cliente", ancho: 220 }, { label: "Placa", align: "center", ancho: 80 }, { label: separar === "grupo" ? "Cobrador" : "Grupo", ancho: 170 }, { label: "Método", align: "center", ancho: 105 }, { label: "Valor", align: "right", ancho: 100 }],
      secciones: bloquesPor(filas, grupoDePago, cobradorDePago, separar).map(b => ({
        titulo: `${b.nombre}   —   ${b.items.length} pagos · $${fmt(b.items.reduce((a, pg) => a + pg.valor, 0))}`, color: b.color,
        filas: b.items.map(pg => [{ v: fmtFechaCorta(fechaDeCaja(pg)), align: "center" as const }, nombreCliente(pg.contrato_id).toUpperCase(), { v: placaDe(pg.contrato_id) ?? "—", align: "center" as const },
          (separar === "grupo" ? cobradorDePago(pg) : grupoDePago(pg)).toUpperCase(), { v: pg.metodo, align: "center" as const }, { num: pg.valor, align: "right" as const }]),
      })),
      totalGeneral: [{ v: `TOTAL: ${filas.length} pagos`, bold: true }, "", "", "", "", { num: filas.reduce((a, pg) => a + pg.valor, 0), align: "right" as const, bold: true }],
    });
  }
  function excelLoQueSeDebe(separar: SepararPor = "grupo") {
    descargarExcelR({
      archivo: `lo_que_se_debe_${hoyISO()}`, titulo: "Lo que se debe hoy", periodo: `Al ${textoRango(hoyISO(), hoyISO())}`,
      leyenda: "La misma cuenta de Cartera, cliente por cliente. Las deudas que están dentro de un acuerdo van en la cuota del acuerdo.",
      columnas: [{ label: "Cliente", ancho: 220 }, { label: "Placa", align: "center", ancho: 80 }, { label: separar === "grupo" ? "Cobrador" : "Grupo", ancho: 160 }, { label: "Cómo va", ancho: 200 },
        { label: "Cuotas del contrato", align: "right", ancho: 110 }, { label: "Cuotas de acuerdos", align: "right", ancho: 110 }, { label: "Deudas", align: "right", ancho: 100 }, { label: "Total", align: "right", ancho: 110 }],
      secciones: bloquesPor(debenC, r => r.grupo, r => r.adminNombre || "Sin asignar", separar).map(b => ({
        titulo: `${b.nombre}   —   ${b.items.length} clientes · $${fmt(b.items.reduce((a, r) => a + r.debeHoy, 0))}`, color: b.color,
        filas: b.items.map(r => [r.cliente.toUpperCase(), { v: r.placa, align: "center" as const }, (separar === "grupo" ? r.adminNombre : r.grupo).toUpperCase(), comoVa(r),
          { num: r.debe.semanas, align: "right" as const }, { num: r.debe.acuerdo, align: "right" as const }, { num: r.debe.deudas, align: "right" as const }, { num: r.debeHoy, align: "right" as const, bold: true }]),
      })),
      totalGeneral: [{ v: `TOTAL: ${debenC.length} clientes`, bold: true }, "", "", "",
        { num: sumaDebe(debenC, "semanas"), align: "right" as const, bold: true }, { num: sumaDebe(debenC, "acuerdo"), align: "right" as const, bold: true },
        { num: sumaDebe(debenC, "deudas"), align: "right" as const, bold: true }, { num: sumaDebe(debenC), align: "right" as const, bold: true }],
    });
  }
  /** La nómina de la semana que se ve en Equipo, pago por pago, con los mismos filtros. */
  function excelNomina(separar: SepararPor = "cobrador") {
    const filas = renglonesN;
    descargarExcelR({
      archivo: `nomina_${lunesNomina}`, titulo: `Nómina de cobradores · ${textoSemanaNomina}`, periodo: textoSemanaNomina,
      leyenda: "Cada pago de la semana. Las visitas y los referidos los cobra quien los hizo, en la semana en que se entregó la moto.",
      columnas: [{ label: "Placa", align: "center", ancho: 80 }, { label: "Cliente", ancho: 220 }, { label: separar === "cobrador" ? "Grupo" : "Cobrador", ancho: 170 }, { label: "Pago", ancho: 190 }, { label: "Fecha", align: "center", ancho: 90 }, { label: "Valor", align: "right", ancho: 100 }],
      secciones: bloquesPor(filas, x => x.r.grupo, x => nombreCobradorN(x.quien), separar).map(b => ({
        titulo: `${b.nombre}   —   ${b.items.length} pagos · $${fmt(b.items.reduce((a, x) => a + x.r.valor, 0))}`, color: b.color,
        filas: b.items.map(x => [{ v: x.r.placa, align: "center" as const }, x.r.cliente.toUpperCase(), (separar === "cobrador" ? x.r.grupo : nombreCobradorN(x.quien)).toUpperCase(),
          TIPO_NOMINA[x.r.tipo], { v: fmtFechaCorta(x.r.fecha), align: "center" as const }, { num: x.r.valor, align: "right" as const }]),
      })),
      totalGeneral: [{ v: `TOTAL: ${filas.length} pagos`, bold: true }, "", "", "", "", { num: filas.reduce((a, x) => a + x.r.valor, 0), align: "right" as const, bold: true }],
    });
  }
  /** Cada moto de la flota (sin las vendidas) y dónde está hoy. */
  function excelFlotaMotos(separar: SepararPor = "grupo") {
    const etiquetaLugar = (id: string) => LUGARES.find(l => l.clave === lugarDeMoto.get(id)?.lugar)?.etiqueta ?? "—";
    const clienteDeMoto = (id: string) => { const c = contratoPorId.get(lugarDeMoto.get(id)?.contratoId ?? ""); return c ? (clientePorId.get(c.cliente_id)?.nombre ?? "—") : "—"; };
    // 8-oct: cuánto debe hoy y cuántos días lleva en mora, con la misma cuenta de Cobranza. En blanco si
    // la moto no tiene contrato.
    const filaDeContrato = new Map(baseGestion.map(r => [r.contratoId, r]));
    const deudaDeMoto = (id: string) => { const r = filaDeContrato.get(lugarDeMoto.get(id)?.contratoId ?? ""); return r && r.estado !== "cerrado" ? r : null; };
    descargarExcelR({
      archivo: `flota_${hoyISO()}`, titulo: "La flota hoy: dónde está cada moto", periodo: `Al ${textoRango(hoyISO(), hoyISO())}`,
      // 8-oct: el total de esta columna NO es el de Cobranza (medido: le faltan $14.271.500 de 11 clientes
      // en liquidación cuya moto ya tiene otro cliente). Lo dice el archivo para que no se lean dos totales.
      leyenda: "Debe hoy: lo que debe hoy el cliente que tiene cada moto (la misma cuenta de Cobranza). No incluye a los clientes en liquidación cuya moto ya tiene otro cliente: el total de todo lo que se debe está en el Excel de Cobranza.",
      columnas: [{ label: "Placa", align: "center", ancho: 80 }, { label: "Dónde está", ancho: 200 }, { label: "Cliente", ancho: 220 }, { label: separar === "grupo" ? "Cobrador" : "Grupo", ancho: 160 }, { label: "Estado de la moto", ancho: 120 },
        { label: "Debe hoy ($)", align: "right", ancho: 110 }, { label: "Días en mora", align: "right", ancho: 90 }],
      secciones: bloquesPor(flotaF, m => m.grupo ?? "SIN GRUPO", m => (m.subadmin_id ? nombreCobradorN(m.subadmin_id) : "Sin asignar"), separar).map(b => ({
        titulo: `${b.nombre}   —   ${b.items.length} motos · ${b.items.filter(m => lugarDeMoto.get(m.id)?.lugar === "trabajando").length} trabajando`, color: b.color,
        filas: b.items.slice().sort((a, c) => a.placa.localeCompare(c.placa)).map(m => [{ v: m.placa, align: "center" as const }, etiquetaLugar(m.id), clienteDeMoto(m.id).toUpperCase(),
          (separar === "grupo" ? (m.subadmin_id ? nombreCobradorN(m.subadmin_id) : "Sin asignar") : (m.grupo ?? "—")).toUpperCase(), m.estado,
          ...((r => r ? [{ num: r.debeHoy, align: "right" as const }, { num: r.diasMora, align: "right" as const }] : ["", ""])(deudaDeMoto(m.id)))]),
      })),
      totalGeneral: [{ v: `TOTAL: ${flotaF.length} motos`, bold: true }, "", "", "", "",
        { num: flotaF.reduce((sm, m) => sm + (deudaDeMoto(m.id)?.debeHoy ?? 0), 0), bold: true }, ""],
      hoja: "Dónde está cada moto",
      hojasExtra: [hojaPapeles()],
    });
  }
  /** Las motos entregadas en el período, con sus papeles. */
  function excelEntregas(separar: SepararPor = "grupo") {
    const cobradorDe = (e: (typeof entregas)[number]) => (e.subadminId ? nombreCobradorN(e.subadminId) : "Sin asignar");
    descargarExcelR({
      archivo: `entregas_${desde}_a_${hasta}`, titulo: "Motos entregadas", periodo: textoRango(desde, hasta),
      columnas: [{ label: "Fecha", align: "center", ancho: 90 }, { label: "Placa", align: "center", ancho: 80 }, { label: "Cliente", ancho: 220 }, { label: "Cédula", align: "center", ancho: 110 },
        { label: separar === "grupo" ? "Cobrador" : "Grupo", ancho: 160 }, { label: "Forma de pago", align: "center", ancho: 110 }, { label: "Papeles", align: "center", ancho: 100 }],
      secciones: bloquesPor(entregas, e => e.grupo, cobradorDe, separar).map(b => ({
        titulo: `${b.nombre}   —   ${b.items.length} entregas`, color: b.color,
        filas: b.items.map(e => [{ v: fmtFechaCorta(e.fecha), align: "center" as const }, { v: e.placa, align: "center" as const }, e.cliente.toUpperCase(), { v: e.cedula, align: "center" as const },
          (separar === "grupo" ? cobradorDe(e) : e.grupo).toUpperCase(), { v: e.formaPago, align: "center" as const },
          { v: e.docsOk ? "Completos" : "Incompletos", align: "center" as const, color: e.docsOk ? "#166534" : "#991b1b" }]),
      })),
      totalGeneral: [{ v: `TOTAL: ${entregas.length} entregas`, bold: true }, "", "", "", "", "", ""],
    });
  }
  /**
   * Parte una lista en bloques para el Excel: por grupo (en el orden de siempre) o por cobrador
   * (alfabético, "Sin asignar" y "Antes de asignar" al final). Pedido del dueño (5-oct): si se escoge
   * un cobrador sale partido por grupo, y si se escoge un grupo, partido por cobrador.
   */
  function bloquesPor<T>(items: T[], grupoDe: (t: T) => string, cobradorDe: (t: T) => string, separar: SepararPor): Array<{ nombre: string; color: string; items: T[] }> {
    const clave = separar === "grupo" ? grupoDe : cobradorDe;
    const nombres = [...new Set(items.map(clave))];
    const orden = (n: string) => separar === "grupo" ? ((GRUPOS as readonly string[]).indexOf(n) + 1 || 99) : (n === "Sin asignar" || n === "Antes de asignar" ? 99 : 0);
    nombres.sort((a, b) => orden(a) - orden(b) || a.localeCompare(b));
    return nombres.map(n => ({ nombre: separar === "grupo" ? n : n.toUpperCase(), color: separar === "grupo" ? (GRUPO_HEX[n] ?? "#334155") : "#334155", items: items.filter(t => clave(t) === n) }));
  }
  /** SOAT y tecno: va como segunda hoja del Excel de Flota (antes era una descarga aparte). */
  function hojaPapeles(): SeccionesOpts & { nombre: string } {
    const fila = (m: (typeof motos)[number] | undefined, placa: string, soat: string | null, dSoat: number | null, tecno: string | null, dTecno: number | null, estado: string): CeldaX[] => [
      { v: placa, align: "center" as const }, m?.grupo ?? "—", (m?.subadmin_id ? nombreCobradorN(m.subadmin_id) : "Sin asignar").toUpperCase(),
      { v: soat ? fmtFechaCorta(soat) : "sin fecha", align: "center" as const }, { v: dSoat === null ? "—" : String(dSoat), align: "center" as const },
      { v: tecno ? fmtFechaCorta(tecno) : "sin fecha", align: "center" as const }, { v: dTecno === null ? "—" : String(dTecno), align: "center" as const },
      { v: estado, color: estado === "Vencido" ? "#991b1b" : estado === "Por vencer" ? "#92400e" : "#334155", align: "center" as const },
    ];
    return {
      nombre: "SOAT y tecno", titulo: "SOAT y tecnomecánica", periodo: `Al ${textoRango(hoyISO(), hoyISO())}`,
      leyenda: "Vencidos, por vencer en 30 días y motos sin la fecha del SOAT anotada. Días = los que faltan (negativo = ya venció).",
      columnas: [{ label: "Placa", align: "center", ancho: 80 }, { label: "Grupo", ancho: 100 }, { label: "Cobrador", ancho: 160 }, { label: "SOAT vence", align: "center", ancho: 95 }, { label: "Días", align: "center", ancho: 55 },
        { label: "Tecno vence", align: "center", ancho: 95 }, { label: "Días", align: "center", ancho: 55 }, { label: "Estado", align: "center", ancho: 95 }],
      secciones: [
        { titulo: `Vencidos o por vencer   —   ${alertasF.length}`, color: "#92400e",
          filas: alertasF.map(a => fila(motoPorId.get(a.id), a.placa, a.seguro, a.diasSeguro, a.tecno, a.diasTecno, a.vencida ? "Vencido" : "Por vencer")) },
        { titulo: `Sin la fecha del SOAT   —   ${sinSoatFlota.length}`, color: "#334155",
          filas: sinSoatFlota.map(m => fila(m, m.placa, null, null, m.fecha_tecnomecanica ?? null, null, "Sin fecha")) },
      ],
    };
  }

  // ── EL CUADRO CRUZADO (pedido del dueño, 8-oct-2026): cada cobrador en cada grupo ──
  // No hace cuentas nuevas: reparte las mismas filas de Flota (motos), Cobranza (lo que se debe) y
  // Portafolios (pagos y cumplimiento, con D-035). El de Portafolios › Cruzado obedece grupo, cobrador y
  // modalidad, como Por grupo y Por cobrador; el de Flota, solo grupo y cobrador, como el resto de Flota.
  const pasaModC = (fp: string | null | undefined) => filtros.modalidad.length === 0 || filtros.modalidad.includes(fp ?? "");
  const conModalidadC = filtros.modalidad.length > 0;
  const aMotoC = (m: (typeof motos)[number]): MotoCruzado => ({ grupo: m.grupo ?? "SIN GRUPO", cobrador: m.subadmin_id ?? SIN_COBRADOR, trabajando: lugarDeMoto.get(m.id)?.lugar === "trabajando" });
  const aFilaC = (r: MotoRowG): FilaCruzado => ({ grupo: r.grupo, cobrador: r.adminId, cerrado: r.estado === "cerrado", debeHoy: r.debeHoy, cum: r.cum, cumSuyo: r.cumSuyo,
    evaluable: r.estado !== "retenida" && r.estado !== "taller" && !fueraDeGestion(r.estado) });
  const aPagoC = (pg: (typeof pagosRango)[number]): PagoCruzado => { const at = atribucion.get(pg.contrato_id)!; return { grupo: at.grupo, cobrador: at.adminId, valor: pg.valor, antesDeAsignar: pagoAntesDeAsignar(pg) }; };
  const columnasC = (gs: string[]) => [...(GRUPOS as readonly string[]).filter(g => gs.includes(g)), ...[...new Set(gs)].filter(g => !(GRUPOS as readonly string[]).includes(g)).sort()];
  const motosC = useMemo(() => flotaF.filter(m => !conModalidadC || pasaModC(contratoPorId.get(lugarDeMoto.get(m.id)?.contratoId ?? "")?.forma_pago)), [flotaF, filtros, contratoPorId, lugarDeMoto]); // eslint-disable-line react-hooks/exhaustive-deps
  const filasC = useMemo(() => baseGestion.filter(r => pasaFiltroGC(r.grupo, r.adminId) && pasaModC(r.formaPago)), [baseGestion, filtros]); // eslint-disable-line react-hooks/exhaustive-deps
  const pagosC = useMemo(() => pagosRango.filter(pg => { const at = atribucion.get(pg.contrato_id); return !!at && pasaFiltroGC(at.grupo, at.adminId) && pasaModC(at.formaPago); }), [pagosRango, atribucion, filtros]); // eslint-disable-line react-hooks/exhaustive-deps
  const ordenCobradoresC = useMemo(() => subadmins.slice().sort((a, b) => a.nombre.localeCompare(b.nombre)).map(sa => sa.id), [subadmins]);
  const datosCruzado = useMemo(() => ({ motos: motosC.map(aMotoC), filas: filasC.map(aFilaC), pagos: pagosC.map(aPagoC) }), [motosC, filasC, pagosC]); // eslint-disable-line react-hooks/exhaustive-deps
  const gruposC = useMemo(() => columnasC([...datosCruzado.motos.map(m => m.grupo), ...datosCruzado.filas.map(f => f.grupo), ...datosCruzado.pagos.map(x => x.grupo)]), [datosCruzado]); // eslint-disable-line react-hooks/exhaustive-deps
  const cuadroC = useMemo(() => cuadroCruzado(vistaCruzado, datosCruzado, gruposC, ordenCobradoresC), [vistaCruzado, datosCruzado, gruposC, ordenCobradoresC]);
  const datosFlotaC = useMemo(() => ({ motos: flotaF.map(aMotoC), filas: [] as FilaCruzado[], pagos: [] as PagoCruzado[] }), [flotaF, lugarDeMoto]); // eslint-disable-line react-hooks/exhaustive-deps
  const cuadroFlota = useMemo(() => cuadroCruzado(vistaFlota, datosFlotaC, columnasC(datosFlotaC.motos.map(m => m.grupo)), ordenCobradoresC), [vistaFlota, datosFlotaC, ordenCobradoresC]); // eslint-disable-line react-hooks/exhaustive-deps
  const nombreFilaC = (k: string) => k === SIN_COBRADOR ? "Sin cobrador" : k === ANTES_DE_ASIGNAR ? "Antes de asignar" : nombreCobradorN(k);
  // Que cuadre con las otras pantallas (lo prometido el 8-oct): motos y paradas contra "Por grupo" de
  // Flota, y lo que se debe contra "Quién tiene la deuda" de Cobranza (otro código, mismas filas). Con
  // una modalidad marcada no se compara: esas pantallas no tienen ese filtro.
  function diferenciasC(c: TipoCuadro, deFlota: boolean): string[] {
    if (c.vista === "motos" || c.vista === "paradas") {
      if (conModalidadC && !deFlota) return [];
      return verificarCuadro(c, { porGrupo: Object.fromEntries(gruposFlota.map(g => [g.grupo, c.vista === "paradas" ? g.total - g.trabajando : g.total])) }, nombreFilaC)
        .map(d => d.replace(`"Por grupo"`, `"Por grupo" de Flota`));
    }
    if (c.vista === "debe" && !conModalidadC) {
      return verificarCuadro(c, {
        porGrupo: Object.fromEntries(cobranzaC.porGrupo.map(f => [f.clave, f.debe])),
        porCobrador: Object.fromEntries(cobranzaC.porCobrador.map(f => [f.clave, f.debe])),
      }, nombreFilaC).map(d => d.replace(/"Por (grupo|cobrador)"/, "Cobranza"));
    }
    return [];
  }
  // Tocar un número del cuadro: la lista de lo que contó, con los mismos filtros.
  function abrirCeldaCruzado(c: TipoCuadro, cobrador: string | null, grupo: string | null, deFlota: boolean) {
    const quien = cobrador === null ? "Todos los cobradores" : nombreFilaC(cobrador);
    const donde = grupo ? ` en ${grupo}` : "";
    const enCelda = (g: string, k: string) => (grupo === null || g === grupo) && (cobrador === null || k === cobrador);
    const arch = `cruzado_${c.vista}_${(grupo ?? "todos").toLowerCase()}_${quien.toLowerCase().replace(/\s+/g, "_")}`;
    const per = `del ${textoRango(desde, hasta)}`;
    if (c.vista === "motos" || c.vista === "paradas") {
      const lista = (deFlota ? flotaF : motosC).filter(m => enCelda(m.grupo ?? "SIN GRUPO", m.subadmin_id ?? SIN_COBRADOR) && (c.vista === "motos" || lugarDeMoto.get(m.id)?.lugar !== "trabajando"));
      setDetalle(listaMotos(lista, `${quien}${donde} · ${lista.length} ${c.vista === "paradas" ? "paradas" : "motos"}`, explicaVista(c.vista, per), arch));
      return;
    }
    if (c.vista === "debe") {
      const f = filasC.filter(r => enCelda(r.grupo, r.adminId) && r.estado !== "cerrado" && r.debeHoy > 0).sort((a, b) => b.debeHoy - a.debeHoy);
      setDetalle({
        titulo: `${quien}${donde} · ${f.length} ${f.length === 1 ? "debe" : "deben"}`,
        subtitulo: `${explicaVista("debe", per)} Suman ${plataT(f.reduce((sm, r) => sm + r.debeHoy, 0))}.`,
        filas: f.map(r => filaDeuda(r, r.debeHoy)), chips: chipsEstadoC(f),
        accion: aCarteraC("contratos:todos", grupo, cobrador && cobrador !== SIN_COBRADOR && cobrador !== ANTES_DE_ASIGNAR ? cobrador : null),
        archivo: arch,
      });
      return;
    }
    if (c.vista === "recaudado") {
      const lista = pagosC.filter(pg => {
        const x = aPagoC(pg);
        return (grupo === null || x.grupo === grupo) && (cobrador === null || (cobrador === ANTES_DE_ASIGNAR ? x.antesDeAsignar : !x.antesDeAsignar && x.cobrador === cobrador));
      });
      const det = detallePagos(lista, `${quien}${donde} · ${per}`, arch);
      setDetalle(cobrador === ANTES_DE_ASIGNAR ? { ...det, subtitulo: "Pagos de motos que cambiaron de cobrador en el período, hechos antes del cambio. No se le cuentan a nadie: el sistema no guarda quién tenía la moto antes." } : det);
      return;
    }
    // Cumplimiento: la casilla de un cobrador se mide desde que la moto es suya; la de un grupo, todo el período.
    const delCobrador = cobrador !== null;
    const f = filasC.filter(r => enCelda(r.grupo, r.adminId) && r.estado !== "retenida" && r.estado !== "taller" && !fueraDeGestion(r.estado)
      && (delCobrador ? r.cumSuyo.medible : r.cum.medible)).map(r => delCobrador ? comoCobrador(r) : r);
    setDetalle(detalleCumplimiento(f, `${quien}${donde} · ${per}`));
  }
  // El Excel del cuadro: una hoja por cada vista, con lo que se ve en pantalla (mismos filtros).
  function hojaCruzado(c: TipoCuadro): SeccionesOpts & { nombre: string } {
    const v = VISTAS_CRUZADO.find(x => x.clave === c.vista)!;
    const esPct = c.vista === "cumplimiento";
    const unidad = c.vista === "debe" || c.vista === "recaudado" ? " ($)" : esPct ? " (%)" : "";
    // El cumplimiento lleva el mismo color que en pantalla (la leyenda de la hoja lo explica).
    const tono = (v: number) => v >= 85 ? { color: "#166534", fill: "#dcfce7" } : v >= 70 ? { color: "#92400e", fill: "#fef3c7" } : { color: "#991b1b", fill: "#fee2e2" };
    const celda = (x: CeldaCruzado, bold = false): CeldaX => esPct && x.valor === null ? { v: "—", align: "right", bold }
      : { num: x.valor ?? 0, align: "right", bold, ...(esPct ? tono(x.valor ?? 0) : {}) };
    return {
      nombre: v.etiqueta,
      titulo: `Cada cobrador en cada grupo — ${v.etiqueta}`,
      periodo: v.delPeriodo ? periodoTxt : `Al ${textoRango(hoyISO(), hoyISO())}`,
      leyenda: explicaVista(c.vista, textoRango(desde, hasta)),
      columnas: [{ label: "Cobrador", ancho: 200 }, ...c.grupos.map(g => ({ label: g + unidad, align: "right" as const, ancho: 120 })), { label: "Total" + unidad, align: "right" as const, ancho: 130 }],
      secciones: [{ titulo: v.etiqueta, color: "#0f2740", filas: c.filas.map(f => [nombreFilaC(f.clave).toUpperCase(), ...c.grupos.map(g => celda(f.celdas[g])), celda(f.total, true)]) }],
      totalGeneral: [{ v: "TOTAL", bold: true }, ...c.grupos.map(g => celda(c.totalGrupo[g], true)), celda(c.total, true)],
    };
  }
  function excelCruzado() {
    const [primera, ...resto] = VISTAS_CRUZADO.map(v => hojaCruzado(cuadroCruzado(v.clave, datosCruzado, gruposC, ordenCobradoresC)));
    descargarExcelR({ archivo: `cobrador_x_grupo_${hoyISO()}`, ...primera, hoja: primera.nombre, hojasExtra: resto });
  }

  const EXCEL_DE_TAB: Partial<Record<Tab, { etiqueta: string; separable: boolean; onDescargar: (s: SepararPor) => void }>> = {
    resumen: { etiqueta: "Los pagos del período, uno por uno", separable: true, onDescargar: excelPagosPeriodo },
    cartera: { etiqueta: "Lo que debe cada cliente: semanas, acuerdo y deudas", separable: true, onDescargar: excelLoQueSeDebe },
    convenios: { etiqueta: "Cada acuerdo con sus pagos", separable: false, onDescargar: () => excelConvenios() },
    grupos: { etiqueta: "Cada moto con su estado, lo que pagó y su cumplimiento", separable: true, onDescargar: sp => setDescarga(sp === "grupo" ? "grupo" : "admin") },
    admins: { etiqueta: "Cada moto con su estado, lo que pagó y su cumplimiento", separable: true, onDescargar: sp => setDescarga(sp === "grupo" ? "grupo" : "admin") },
    cruzado: { etiqueta: "El cuadro de cobradores y grupos, una hoja por cada vista", separable: false, onDescargar: () => excelCruzado() },
    nomina: { etiqueta: "Lo que se le paga a cada cobrador, pago por pago", separable: true, onDescargar: excelNomina },
    visitas: { etiqueta: "Las visitas del período, por quién las hizo", separable: false, onDescargar: () => exportarVisitas() },
    flota: { etiqueta: "Cada moto y dónde está, y en otra hoja el SOAT y la tecno", separable: true, onDescargar: excelFlotaMotos },
    guardadas: { etiqueta: "Las motos guardadas y desde cuándo", separable: true, onDescargar: excelQuietas },
    entregas: { etiqueta: "Las motos entregadas en el período", separable: true, onDescargar: excelEntregas },
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
      </div>

      {/* El menú: 5 secciones por la pregunta que responden, y sus partes (rediseño 2-oct). */}
      <MenuReportes tab={tab} onTab={setTab} />

      {/* La barra de filtros: período, grupo y cobrador mandan sobre todo lo de abajo. En las pestañas
          que son "foto de hoy" (o tienen su propio selector, como Nómina) se dice en vez de mostrarla. */}
      {(
        <BarraFiltros
          isMobile={isMobile}
          periodo={rango}
          opcionesPeriodo={RANGOS.map(r => ({ valor: r.key, etiqueta: r.label }))}
          onPeriodo={v => setRango(v as Rango)}
          textoPeriodo={textoRango(desde, hasta)}
          grupos={filtros.grupo}
          opcionesGrupo={GRUPOS.map(g => ({ valor: g, etiqueta: g }))}
          onGrupos={v => setFiltros(f => ({ ...f, grupo: v }))}
          cobradores={filtros.cobrador}
          opcionesCobrador={[...subadmins.map(sa => ({ valor: sa.id, etiqueta: sa.nombre })), { valor: "__none__", etiqueta: "Sin asignar" }]}
          onCobradores={v => setFiltros(f => ({ ...f, cobrador: v }))}
          mostrarGrupoCobrador
          accion={(puedeExportar || tab === "convenios") && EXCEL_DE_TAB[tab] ? (
            <DescargarSeccion
              key={tab}
              seccion={SECCION_DE_TAB[tab]}
              sinPdf={!puedeExportar}
              excel={{ ...EXCEL_DE_TAB[tab]!, separarInicial: filtros.cobrador.length > 0 && filtros.grupo.length === 0 ? "grupo" : "cobrador" }}
              generando={generandoPdf}
              noListo={piezas => sinDatos ? (errorDatos ? "No se pudieron traer los datos. Revisa la conexión." : "Cargando las cifras…")
                : piezas.includes("equipo") && !datosNomina.error && datosNomina.cargando ? "Preparando la nómina de la semana…" : null}
              onAbrirPdf={() => setPdfPideNomina(true)}
              onPdf={descargarInformeSocios}
              onImprimir={imprimirInformeSocios}
            />
          ) : undefined}
          soloHoy={tab === "flota" || tab === "guardadas" || tab === "cartera" || tab === "convenios"}
          textoFijo={tab === "nomina" ? textoSemanaNomina : undefined}
          sinGrupo={tab === "visitas"}
          {...(tab === "grupos" || tab === "admins" || tab === "cruzado" ? {
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

      {/* ── EQUIPO · NÓMINA (rediseño 2-oct; regla de nómina del dueño, 22-ago) ── */}
      {tab === "nomina" && (
        <EquipoNomina d={datosNomina} onMover={moverSemanaNomina} onReintentar={reintentarNomina} onAbrir={abrirDetalleNomina} />
      )}
      {/* CERRAR Y PAGAR la semana de un cobrador (mig 120): se cierra con el cálculo VIVO y completo. */}
      {tab === "nomina" && cerrando && (() => {
        const n = nominas.find(x => x.subadminId === cerrando);
        if (!n) return null;
        const nombre = nombreCobradorN(n.subadminId);
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
          extraBotones={portafolio.modo === "cobrador" ? (
            <button onClick={() => setTab("nomina")} style={{ display: "inline-flex", flex: "1 1 140px", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44, borderRadius: 10, border: "1px solid var(--line2)", background: "transparent", color: "var(--text)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              <Wallet size={16} aria-hidden="true" /> Ver {portafolio.sel ? "su" : "la"} nómina
            </button>
          ) : undefined}
        />
      )}

      {/* ── PORTAFOLIOS · CRUZADO (8-oct): cada cobrador en cada grupo, con sus 5 vistas ── */}
      {tab === "cruzado" && sinDatos && <div role="status" style={{ ...card, textAlign: "left", fontSize: 13, color: "var(--muted2)" }}>{errorDatos ? "No se pudieron traer los datos. Revisa la conexión y vuelve a intentar." : "Cargando las cifras…"}</div>}
      {tab === "cruzado" && !sinDatos && (
        <CuadroCruzado
          cuadro={cuadroC}
          vistas={VISTAS_CRUZADO.map(v => v.clave)}
          onVista={setVistaCruzado}
          nombre={nombreFilaC}
          colorGrupo={g => GRUPO_COLORS[g] ?? "var(--muted)"}
          textoPeriodo={textoRango(desde, hasta)}
          onCelda={(cob, g) => abrirCeldaCruzado(cuadroC, cob, g, false)}
          diferencias={diferenciasC(cuadroC, false)}
          compacto={isMobile}
        />
      )}

      {/* ── EQUIPO · VISITAS (rediseño 2-oct): cuántas, resultado, quién, entregas y evidencia ── */}
      {tab === "visitas" && (
        <EquipoVisitas d={datosVisitas} onAbrir={abrirDetalleVisitas} />
      )}

      {/* ── COBRANZA · CARTERA (rediseño 2-oct): cuánto se debe hoy, qué tan cobrable es y quién lo tiene ── */}
      {tab === "cartera" && (
        <CobranzaCartera {...cobranzaC} onAbrir={abrirDetalleCobranza} onCartera={() => onNavigate?.("cobros", filtroCarteraC("contratos:todos"))} />
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
          cuadro={
            <CuadroCruzado
              cuadro={cuadroFlota}
              vistas={["motos", "paradas"]}
              onVista={setVistaFlota}
              nombre={nombreFilaC}
              colorGrupo={g => GRUPO_COLORS[g] ?? "var(--muted)"}
              textoPeriodo={textoRango(desde, hasta)}
              onCelda={(cob, g) => abrirCeldaCruzado(cuadroFlota, cob, g, true)}
              diferencias={diferenciasC(cuadroFlota, true)}
              compacto={isMobile}
              enlace={{ texto: "Ver lo que deben, lo recaudado y el cumplimiento", onClick: () => { setVistaCruzado("debe"); setTab("cruzado"); } }}
            />
          }
        />
      )}

      {/* ── TAB ENTREGAS ── */}
      {/* ── COBRANZA · ACUERDOS (rediseño 2-oct): si se están pagando, cuáles vencen pronto y quién los lleva ── */}
      {tab === "convenios" && (
        <CobranzaAcuerdos isMobile={isMobile} lista={conveniosF} hoyISO={hoyISO()} incluirCerrados={conveniosTodos}
          onIncluirCerrados={() => setConveniosTodos(v => !v)} onAbonos={abrirAbonos}
          />
      )}

      {/* ── GUARDADAS: las motos en la empresa sin trabajar (D-033/034) ── */}
      {tab === "guardadas" && (
        <FlotaGuardadas
          isMobile={isMobile}
          lista={guardadasF}
          onFicha={m => { const c = m.contratoId ? contratoPorId.get(m.contratoId) : undefined; if (c) onNavigate?.("ficha_cliente", c.cliente_id); else onNavigate?.("ficha_moto", m.motoId); }}
          onInmovilizaciones={onNavigate ? () => onNavigate("inmovilizaciones") : undefined}
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
