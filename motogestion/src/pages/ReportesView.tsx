import React, { useMemo, useState, useEffect } from "react";
import ImgPrivada from "../components/ImgPrivada";
import type { ViewKey } from "../App";
import { usePagos, esPagoDeCaja, fechaDeCaja } from "../hooks/usePagos";
import { useContratos, diasDesdeUltimoPago, corteMigracionGrupo, ahorroTotal } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { usePrestamos, motoDelPortafolio } from "../hooks/usePrestamos";
import { useCesiones, titularEnFecha } from "../hooks/useCesiones";
import { useSubadmins } from "../hooks/useSubadmins";
import { useMotos } from "../hooks/useMotos";
import { useDeudas } from "../hooks/useDeudas";
import { hoyISO, hoyDate } from "../utils/fecha";
import { useAuth } from "../contexts/AuthContext";
import { useBackGuard } from "../contexts/BackNav";
import { Chip } from "../components/atomos";
import { necesitaRegenerar, regenerarDocsContrato } from "../utils/regenerarDocs";
import { generarHTMLResumenEntrega } from "../hooks/useDocumentos";
import { formatDiaPago, valorPeriodoReal, calcularEstadoCartera, cuotaConvenioDelPeriodo } from "../utils/cicloPago";
import {
  exportarCSV, descargarExcel, GRUPO_HEX,
  type CeldaX, type ColX, type SeccionX, type SeccionesOpts,
} from "../utils/exportar";
import ModalDescargar, { type ColumnaDescarga, type HojaExtra } from "../components/ModalDescargar";
import Placa from "../components/Placa";
import { useVisitas } from "../hooks/useVisitas";
import { useConvenios } from "../hooks/useConvenios";
import { useUbicaciones } from "../hooks/useUbicaciones";
import { nominaSemana, lunesDe, totalesPorGrupo, VALOR_CICLO, VALOR_ATRASADO, VALOR_RETENCION, type TipoGestion } from "../utils/nominaCobradores";
import { generarDesprendibleNomina } from "../utils/generarDesprendibleNomina";
import { useCajasLlenadas } from "../hooks/useCajasLlenadas";
import { motosGuardadas, agruparGuardadas, type MotoGuardada } from "../utils/motosGuardadas";
import { reporteConvenios, totalesConvenios } from "../utils/reporteConvenios";
import { MOTIVO_RECEPCION_LABEL, UBICACION_LABEL } from "../hooks/useUbicaciones";

interface Props {
  onNavigate?: (view: ViewKey, filter?: string) => void;
}

const card: React.CSSProperties = { background: "var(--card)", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(15,23,42,0.08)" };
function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }
function pct(a: number, b: number) { return b === 0 ? "0%" : `${Math.round((a / b) * 100)}%`; }

type Rango = "hoy" | "semana" | "semana_pasada" | "ult7" | "mes" | "mes_anterior" | "ult30" | "anio" | "personalizado";
type Tab   = "resumen" | "admins" | "nomina" | "grupos" | "visitas" | "cartera" | "convenios" | "flota" | "guardadas" | "entregas" | "exportar";

const RANGOS: { key: Rango; label: string }[] = [
  { key: "hoy",           label: "Hoy" },
  { key: "semana",        label: "Esta semana" },
  { key: "semana_pasada", label: "Semana pasada" },
  { key: "ult7",          label: "Últimos 7 días" },
  { key: "mes",           label: "Este mes" },
  { key: "mes_anterior",  label: "Mes anterior" },
  { key: "ult30",         label: "Últimos 30 días" },
  { key: "anio",          label: "Este año" },
  { key: "personalizado", label: "📅 Personalizado" },
];

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "resumen",  label: "Resumen",   icon: "📊" },
  { key: "admins",   label: "Por admin", icon: "👤" },
  { key: "nomina",   label: "Nómina",    icon: "💰" },
  { key: "grupos",   label: "Por grupo", icon: "📁" },
  { key: "visitas",  label: "Visitas",   icon: "🏠" },
  { key: "cartera",  label: "Cartera",   icon: "💳" },
  { key: "convenios",label: "Convenios", icon: "🤝" },
  { key: "flota",    label: "Flota",     icon: "🏍️" },
  { key: "guardadas",label: "Guardadas", icon: "🔒" },
  { key: "entregas", label: "Entregas",  icon: "🛵" },
  { key: "exportar", label: "Exportar",  icon: "⬇️" },
];

const ANG_LABEL: Record<string, string> = {
  delantera: "Delantera", lateral_izquierdo: "Lateral izq.", arriba: "Arriba",
  lateral_derecho: "Lateral der.", trasera: "Trasera", persona: "Persona + moto",
};
const GRUPOS = ["RASTREADOR", "COSTA", "PRADERA", "USADAS"] as const;
const GRUPO_COLORS: Record<string, string> = {
  RASTREADOR: "var(--accent)", COSTA: "var(--ok2)", PRADERA: "var(--warn2)", USADAS: "var(--orange)",
};
const ESTADO_MOTO_COLOR: Record<string, string> = {
  Asignada: "var(--ok-ink)", Disponible: "var(--accent-ink)", "En taller": "var(--warn-ink)",
  Recuperada: "var(--accent-ink)", Suspendida: "var(--violet)", Fiscalia: "var(--bad-ink)",
  Transito: "var(--bad)", Garantia: "#6b7280",
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

function Barra({ label, valor, total, color, sub }: { label: string; valor: number; total: number; color: string; sub?: string }) {
  const p = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
        <span style={{ fontWeight: 600, color: "var(--muted2)" }}>{label}{sub && <span style={{ fontSize: 11, color: "var(--faint)", marginLeft: 6 }}>{sub}</span>}</span>
        <span style={{ color: "var(--muted)" }}>$ {fmt(valor)} <span style={{ color: "var(--faint)" }}>({p}%)</span></span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "var(--soft)", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 999, width: `${p}%`, background: color, transition: "width 0.4s" }} />
      </div>
    </div>
  );
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
// estado: al día / parcial (abonó pero debe) / no pagó — MISMA verdad de mora que Cartera,
// con convenio: si tiene convenio activo y lo cumple, va "al día" (la deuda queda programada).
// "retenida" (pedido del dueño, 22-ago): la moto está guardada/inmovilizada en la empresa — el
// cliente NO puede producir, así que mostrarla como "no pagó" con días de mora era injusto y
// ensuciaba el % del cobrador. Va aparte: ni al día ni en mora.
type EstadoPagoG = "aldia" | "parcial" | "nopago" | "retenida";
type MotoRowG = { placa: string; cliente: string; monto: number; estado: EstadoPagoG; deudaPend: number; tieneConvenio: boolean; debeSinConvenio: boolean; grupo: string; adminId: string; adminNombre: string; formaPago: string; diaPago: string; ultimaFechaPago: string | null; telefono: string; asignadoDesde: string | null; contratoId: string; diasMora: number; cuotaCiclo: number };
type BloqueG = { key: string; nombre: string; color?: string; motos: MotoRowG[]; total: number; alDia: number; parcial: number; noPago: number; retenidas: number; debenSinConvenio: number; recaudado: number; pctv: number };
const ESTADO_RANK: Record<EstadoPagoG, number> = { nopago: 0, parcial: 1, retenida: 2, aldia: 3 };
function agruparBloques(rows: MotoRowG[], modo: "admin" | "grupo"): BloqueG[] {
  const map = new Map<string, MotoRowG[]>();
  rows.forEach(r => {
    const k = modo === "admin" ? r.adminId : r.grupo;
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(r);
  });
  const bloques: BloqueG[] = [...map.entries()].map(([key, motos]) => {
    const alDia = motos.filter(m => m.estado === "aldia").length;
    const parcial = motos.filter(m => m.estado === "parcial").length;
    const noPago = motos.filter(m => m.estado === "nopago").length;
    const retenidas = motos.filter(m => m.estado === "retenida").length;
    // El % del cobrador se mide sobre las motos que PODÍAN pagar: una guardada en la empresa
    // no puede producir y no debe castigar (ni inflar) su cumplimiento.
    const evaluables = motos.length - retenidas;
    return {
      key,
      nombre: modo === "admin" ? motos[0].adminNombre : key,
      color: modo === "grupo" ? (GRUPO_COLORS[key] ?? "var(--muted)") : undefined,
      motos: motos.slice().sort((x, y) => (ESTADO_RANK[x.estado] - ESTADO_RANK[y.estado]) || x.cliente.localeCompare(y.cliente)),
      total: motos.length, alDia, parcial, noPago, retenidas,
      debenSinConvenio: motos.filter(m => m.debeSinConvenio).length,
      recaudado: motos.reduce((s, m) => s + m.monto, 0),
      pctv: evaluables > 0 ? Math.round((alDia / evaluables) * 100) : 0,
    };
  });
  if (modo === "grupo") {
    const ord = (g: string) => { const i = (GRUPOS as readonly string[]).indexOf(g); return i === -1 ? 99 : i; };
    return bloques.sort((a, b) => ord(a.key) - ord(b.key));
  }
  return bloques.sort((a, b) => (a.key === "__none__" ? 1 : 0) - (b.key === "__none__" ? 1 : 0) || b.recaudado - a.recaudado);
}
const pctColorG = (p: number) => (p >= 85 ? "var(--ok-ink)" : p >= 70 ? "var(--warn-ink)" : "var(--bad-ink)");
const pctFillG  = (p: number) => (p >= 85 ? "var(--ok2)" : p >= 70 ? "var(--warn2)" : "var(--bad)");
const EST_META: Record<EstadoPagoG, { punto: string; ink: string; soft: string }> = {
  aldia:    { punto: "🟢", ink: "var(--ok-ink)",     soft: "var(--ok-soft)" },
  parcial:  { punto: "🟡", ink: "var(--warn-ink)",   soft: "var(--warn-soft)" },
  nopago:   { punto: "🔴", ink: "var(--bad-ink)",    soft: "var(--bad-soft)" },
  retenida: { punto: "🔒", ink: "var(--indigo-ink)", soft: "var(--indigo-soft)" },
};

function GestionBloques({ bloques, modo, expandido, onToggle }: { bloques: BloqueG[]; modo: "admin" | "grupo"; expandido: string | null; onToggle: (k: string) => void }) {
  if (bloques.length === 0) return <div style={{ ...card, textAlign: "center", color: "var(--muted)" }}>No hay motos activas asignadas en este período.</div>;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {bloques.map(b => {
        const k = modo + "|" + b.key;
        const open = expandido === k;
        return (
          <div key={b.key} style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div onClick={() => onToggle(k)} style={{ display: "grid", gridTemplateColumns: "16px 1fr auto", alignItems: "center", gap: 10, padding: "13px 16px", cursor: "pointer", background: open ? "var(--soft2)" : "var(--card)" }}>
              <span style={{ color: "var(--faint)", transition: "transform .15s", transform: open ? "rotate(90deg)" : "none" }}>›</span>
              <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
                {modo === "grupo"
                  ? <span style={{ width: 11, height: 11, borderRadius: 3, background: b.color, flexShrink: 0 }} />
                  : <span style={{ fontSize: 15, flexShrink: 0 }}>👤</span>}
                <span style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.nombre}</span>
                <span style={{ fontSize: 12, color: "var(--faint)", flexShrink: 0 }}>{b.total} motos</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "right", minWidth: 44 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: pctColorG(b.pctv) }}>{b.pctv}%</div>
                  <div style={{ fontSize: 9, color: "var(--faint)", marginTop: 1 }}>al día</div>
                  <div style={{ width: 56, height: 5, background: "var(--soft)", borderRadius: 999, overflow: "hidden", marginTop: 3 }}>
                    <div style={{ width: `${b.pctv}%`, height: "100%", background: pctFillG(b.pctv) }} />
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, fontVariantNumeric: "tabular-nums", minWidth: 66, textAlign: "right" }}>$ {fmt(b.recaudado)}</div>
              </div>
            </div>
            <div style={{ padding: "0 16px 8px 42px", fontSize: 11, display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
              <span style={{ color: "var(--ok-ink)", fontWeight: 700 }}>🟢 {b.alDia} al día</span>
              <span style={{ color: "var(--faint)" }}>·</span>
              <span style={{ color: "var(--warn-ink)", fontWeight: 700 }}>🟡 {b.parcial} parcial</span>
              <span style={{ color: "var(--faint)" }}>·</span>
              <span style={{ color: "var(--bad-ink)", fontWeight: 700 }}>🔴 {b.noPago} no pagó</span>
              {b.retenidas > 0 && <><span style={{ color: "var(--faint)" }}>·</span><span style={{ color: "var(--indigo-ink)", fontWeight: 700 }}>🔒 {b.retenidas} retenida{b.retenidas === 1 ? "" : "s"}</span></>}
              {b.debenSinConvenio > 0 && <span style={{ color: "var(--warn-ink)", fontWeight: 700, background: "var(--warn-soft)", borderRadius: 6, padding: "1px 6px" }}>⚠️ {b.debenSinConvenio} sin convenio</span>}
            </div>
            {open && (
              <div style={{ background: "var(--soft2)", padding: "2px 16px 14px" }}>
                {b.motos.map((m, i) => {
                  const em = EST_META[m.estado];
                  return (
                    <div key={m.placa + i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid var(--line)" }}>
                      <Placa placa={m.placa} grupo={m.grupo} size="sm" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.cliente}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, marginTop: 1, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                          {modo === "admin"
                            ? <><span style={{ width: 7, height: 7, borderRadius: 2, background: GRUPO_COLORS[m.grupo] ?? "var(--muted)" }} /><span style={{ color: "var(--muted)" }}>{m.grupo}</span></>
                            : <span style={{ color: "var(--muted)", textTransform: "uppercase" }}>👤 {m.adminNombre}</span>}
                          <span style={{ color: "var(--muted)" }}>· {m.formaPago}</span>
                          {m.diaPago && <span style={{ color: "var(--faint)" }}>· {m.diaPago}</span>}
                          {m.tieneConvenio && <span style={{ color: "var(--accent-ink)" }}>· 📋 convenio</span>}
                          {m.debeSinConvenio && <span style={{ color: "var(--warn-ink)" }}>· ⚠️ sin convenio</span>}
                        </div>
                        <div style={{ fontSize: 10, marginTop: 2, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", color: "var(--faint)" }}>
                          <span>Últ. pago: {m.ultimaFechaPago ? fmtFechaCorta(m.ultimaFechaPago) : "sin pagos"}</span>
                          {m.telefono && <a href={`tel:${m.telefono}`} onClick={e => e.stopPropagation()} style={{ color: "var(--accent-ink)", textDecoration: "none", fontWeight: 700 }}>📞 {m.telefono}</a>}
                          {m.asignadoDesde && <span>· asignada desde {fmtFechaCorta(m.asignadoDesde)}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: em.ink, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                          {m.estado === "aldia" ? (m.monto > 0 ? `🟢 ✓ $ ${fmt(m.monto)}` : "🟢 Al día")
                            : m.estado === "parcial" ? `🟡 $ ${fmt(m.monto)}`
                            : m.estado === "retenida" ? `🔒 Retenida${m.monto > 0 ? ` · $ ${fmt(m.monto)}` : ""}`
                            : "🔴 No pagó"}
                        </div>
                        {m.estado !== "aldia" && m.deudaPend > 0 && <div style={{ fontSize: 10, fontWeight: 700, color: "var(--bad-ink)", marginTop: 1, whiteSpace: "nowrap" }}>falta $ {fmt(m.deudaPend)}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

type FiltrosG = { grupo: string[]; cobrador: string[]; modalidad: string[]; estado: string[] };
const MODALIDADES = ["Diario", "Semanal", "Quincenal", "Mensual"];
const ESTADOS_FILTRO = [{ v: "aldia", l: "Al día" }, { v: "parcial", l: "Parcial" }, { v: "nopago", l: "No pagó" }, { v: "retenida", l: "🔒 Retenida" }, { v: "sinconvenio", l: "Sin convenio" }];
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

function CabeceraGestion({ totMotos, alDia, parcial, noPago, retenidas = 0, debenSinConvenio, totRec, rangoLabel, desde, hasta, nota, onExport }: { totMotos: number; alDia: number; parcial: number; noPago: number; retenidas?: number; debenSinConvenio: number; totRec: number; rangoLabel: string; desde: string; hasta: string; nota: string; onExport?: () => void }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
        <KPI label="Motos" value={`${totMotos}`} />
        {/* El % de al día se mide sobre las que PODÍAN pagar (sin las retenidas). */}
        <KPI label="Al día" value={`${alDia}`} color="var(--ok-ink)" bg="var(--ok-soft)" sub={pct(alDia, totMotos - retenidas)} />
        <KPI label="Parcial" value={`${parcial}`} color="var(--warn-ink)" bg="var(--warn-soft)" />
        <KPI label="No pagó" value={`${noPago}`} color="var(--bad-ink)" bg="var(--bad-soft)" />
        {retenidas > 0 && <KPI label="🔒 Retenidas" value={`${retenidas}`} color="var(--indigo-ink)" bg="var(--indigo-soft)" />}
        <KPI label="Recaudado" value={`$ ${fmt(totRec)}`} color="var(--accent)" />
      </div>
      <div style={{ ...card, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          Período: <b style={{ color: "var(--text)" }}>{rangoLabel}</b>
          <span style={{ color: "var(--faint)" }}> ({desde} → {hasta})</span> · {nota}
          {debenSinConvenio > 0 && <span style={{ color: "var(--warn-ink)", fontWeight: 700 }}> · ⚠️ {debenSinConvenio} deben sin convenio</span>}
        </div>
        {/* Sin permiso de descarga el botón no se dibuja: el informe se puede MIRAR, pero no
            llevárselo en un archivo (ver acción exportar_datos en src/lib/acciones.ts). */}
        {onExport && (
          <button onClick={onExport} style={{ background: "var(--soft)", border: "1px solid var(--line2)", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "var(--ok-ink)", whiteSpace: "nowrap" }}>⬇️ Exportar Excel</button>
        )}
      </div>
    </>
  );
}

const KPI_ICONS: Record<string, string> = {
  "Total recaudado": "💰",
  "Efectivo": "💵",
  "Transferencias": "📲",
  "Cobro en campo": "🏍️",
  "Proyección mensual": "📈",
};

export default function ReportesView({ onNavigate }: Props) {
  const [rango, setRango] = useState<Rango>("mes");
  const [rangoCustom, setRangoCustom] = useState<{ desde: string; hasta: string }>(() => getRango("ult7")); // rango personalizado de-fecha-a-fecha
  const [tab, setTab]     = useState<Tab>("resumen");
  const [grupoEnt, setGrupoEnt] = useState<string>("Todos");     // filtro de grupo en la pestaña Entregas
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
  const [expandidoGestion, setExpandidoGestion] = useState<string | null>(null);
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
  const esAdmin       = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";
  const { pagos }     = usePagos();
  const { contratos } = useContratos();
  const { clientes }  = useClientes();
  const { motos }     = useMotos();
  const { deudas }    = useDeudas();
  const { visitas }   = useVisitas();
  const { convenios, convenioActivoDelContrato } = useConvenios();

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
  const { eventos: eventosNomina } = useCajasLlenadas(desdeEventosNomina, domingoNomina, tab === "nomina");
  const nominas = useMemo(() => {
    if (tab !== "nomina") return [];
    return nominaSemana({
      desde: lunesNomina,
      hasta: domingoNomina,
      contratos,
      pagos,
      motos: motos.map(m => ({ id: m.id, placa: m.placa, subadmin_id: m.subadmin_id ?? null, grupo: m.grupo ?? null })),
      recepciones,
      clientesPorId: new Map(clientes.map(c => [c.id, c.nombre])),
      eventos: eventosNomina,
      convenios: convenios.map(cv => ({ contrato_id: cv.contrato_id, cuota_por_periodo: cv.cuota_por_periodo, numero_cuotas: cv.numero_cuotas, periodos_exonerados: cv.periodos_exonerados, created_at: cv.created_at })),
    });
  }, [tab, lunesNomina, domingoNomina, contratos, pagos, motos, recepciones, clientes, eventosNomina, convenios]);
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
  // Base única: cada moto activa con su grupo, su admin asignado (motos.subadmin_id)
  // y lo que recaudó en el rango. De aquí salen los DOS cortes (por admin / por grupo),
  // cada uno mostrando el otro como etiqueta cruzada. Base para la nómina.
  const baseGestion = useMemo<MotoRowG[]>(() => {
    const nombreAdmin = (id: string | null | undefined) =>
      id ? (subadmins.find(s => s.id === id)?.nombre ?? "—") : "Sin asignar";
    const hoy = hoyDate();
    // recaudo del período (para el monto que muestra cada moto)
    const recaudoPorContrato = new Map<string, number>();
    pagosRango.forEach(p => recaudoPorContrato.set(p.contrato_id, (recaudoPorContrato.get(p.contrato_id) ?? 0) + p.valor));
    // pagos confirmados por contrato (el motor de mora necesita el historial completo)
    const confPorContrato = new Map<string, typeof pagos>();
    pagos.filter(p => p.estado === "Confirmado").forEach(p => {
      if (!confPorContrato.has(p.contrato_id)) confPorContrato.set(p.contrato_id, []);
      confPorContrato.get(p.contrato_id)!.push(p);
    });
    // deuda pendiente REAL (no la que ya quedó dentro de un convenio ni la pagada)
    const deudaPendMap = new Map<string, number>();
    deudas.filter(d => d.estado === "pendiente").forEach(d => deudaPendMap.set(d.contrato_id, (deudaPendMap.get(d.contrato_id) ?? 0) + d.monto_pendiente));
    // Estados de moto que significan "guardada en la empresa": el cliente NO la tiene y no puede
    // producir — su fila sale como 🔒 Retenida, no como mora (pedido del dueño, 22-ago).
    const MOTO_GUARDADA = new Set(["Recuperada", "Mantenimiento", "Fiscalia", "Transito", "Garantia"]);
    const rows: MotoRowG[] = [];
    // Los Suspendidos también entran (antes desaparecían del informe): son justamente las
    // retenidas/guardadas, y el dueño necesita verlas contadas, no invisibles.
    contratos.filter(c => (c.estado === "Activo" || c.estado === "Suspendido") && c.moto_id).forEach(c => {
      const moto = motos.find(m => m.id === c.moto_id);
      if (!moto) return;
      const guardada = c.estado === "Suspendido" || MOTO_GUARDADA.has(moto.estado ?? "");
      // Grupo y admin salen de la moto del PORTAFOLIO: si el cliente anda en una prestada,
      // su recaudo sigue siendo del socio dueño de su moto real, no del socio que prestó.
      // La placa sí es la que anda rodando (es la que está en la calle).
      const motoPortafolio = motos.find(m => m.id === motoDelPortafolio(c.id, c.moto_id, prestamos)) ?? moto;
      const monto = recaudoPorContrato.get(c.id) ?? 0;
      const confirmados = confPorContrato.get(c.id) ?? [];
      // Mismo cálculo que Cartera: convenio activo cuenta para la mora (deuda programada).
      const convenioActivo = convenioActivoDelContrato(c.id);
      const cuotaConvenio = cuotaConvenioDelPeriodo(convenioActivo, c as never, hoy);
      const periodoCubierto = !!(convenioActivo?.cubre_periodo_hasta && convenioActivo.cubre_periodo_hasta >= hoyISO());
      const enMora = !guardada && calcularEstadoCartera(c as never, confirmados as never, hoy, cuotaConvenio, periodoCubierto, convenioActivo as never) === "mora";
      const deudaP = deudaPendMap.get(c.id) ?? 0;
      const tieneConvenio = !!convenioActivo;
      const estado: EstadoPagoG = guardada ? "retenida" : !enMora ? "aldia" : (monto > 0 ? "parcial" : "nopago");
      const cli = clientes.find(cl => cl.id === c.cliente_id);
      // Última fecha en que este contrato pagó (el pago confirmado más reciente).
      const ultimaFechaPago = confirmados.reduce<string | null>((mx, p) => (!mx || p.fecha > mx ? p.fecha : mx), null);
      // Días de mora (aging) — solo si está en mora; mismo criterio que la lista de mora de esta vista.
      const diasMora = enMora ? (diasDesdeUltimoPago(ultimaFechaPago, c.fecha_entrega ?? c.created_at.slice(0, 10), corteMigracionGrupo(moto.grupo ?? null)) ?? 0) : 0;
      rows.push({
        placa: moto.placa,
        cliente: cli?.nombre ?? "Sin cliente",
        monto, estado, deudaPend: deudaP, tieneConvenio,
        debeSinConvenio: deudaP > 0 && !tieneConvenio,
        grupo: motoPortafolio.grupo ?? "OTRO",
        adminId: motoPortafolio.subadmin_id ?? "__none__",
        adminNombre: nombreAdmin(motoPortafolio.subadmin_id),
        formaPago: c.forma_pago ?? "—",
        diaPago: formatDiaPago(c as never),
        ultimaFechaPago,
        telefono: cli?.telefono ?? "",
        asignadoDesde: motoPortafolio.subadmin_asignado_desde ?? null,
        contratoId: c.id,
        diasMora,
        cuotaCiclo: valorPeriodoReal(c as never),
      });
    });
    return rows;
  }, [contratos, motos, clientes, pagos, pagosRango, deudas, subadmins, prestamos, convenioActivoDelContrato]);

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
  const [guardadasPor, setGuardadasPor] = useState<"grupo" | "encargado" | "donde">("grupo");

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
  const guardadasAgrupadas = useMemo(() => agruparGuardadas(
    guardadas,
    guardadasPor === "grupo" ? (f: MotoGuardada) => f.grupo
      : guardadasPor === "encargado" ? (f: MotoGuardada) => f.subadminNombre
      : (f: MotoGuardada) => f.donde,
  ), [guardadas, guardadasPor]);

  // ── FILTROS COMBINABLES (multi-selección) — baseFiltrada es la fuente de TODO ──
  // Array vacío en una dimensión = "todos"; con valores = OR dentro, AND entre dimensiones.
  const baseFiltrada = useMemo(() => baseGestion.filter(r =>
    (filtros.grupo.length === 0 || filtros.grupo.includes(r.grupo)) &&
    (filtros.cobrador.length === 0 || filtros.cobrador.includes(r.adminId)) &&
    (filtros.modalidad.length === 0 || filtros.modalidad.includes(r.formaPago)) &&
    (filtros.estado.length === 0 || filtros.estado.some(e => e === "sinconvenio" ? r.debeSinConvenio : r.estado === e))
  ), [baseGestion, filtros]);
  const nombreCobradorFiltro = (id: string) => id === "__none__" ? "Sin asignar" : (subadmins.find(s => s.id === id)?.nombre ?? "cobrador");
  const ESTADO_LBL: Record<string, string> = { aldia: "al día", parcial: "parcial", nopago: "no pagó", retenida: "retenida", sinconvenio: "sin convenio" };
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
  const gTotMotos = baseFiltrada.length;
  const gAlDia    = baseFiltrada.filter(r => r.estado === "aldia").length;
  const gParcial  = baseFiltrada.filter(r => r.estado === "parcial").length;
  const gNoPago   = baseFiltrada.filter(r => r.estado === "nopago").length;
  const gRetenidas = baseFiltrada.filter(r => r.estado === "retenida").length;
  const gDebenSinConv = baseFiltrada.filter(r => r.debeSinConvenio).length;
  const gTotRec   = baseFiltrada.reduce((s, r) => s + r.monto, 0);
  // E2 — esperado por ciclo vs recaudado (% cumplimiento en $).
  const esperadoCiclo = baseFiltrada.reduce((s, r) => s + r.cuotaCiclo, 0);
  const pctCumplimiento = esperadoCiclo > 0 ? Math.round((gTotRec / esperadoCiclo) * 100) : 0;

  // C1 — comparación vs período anterior (mismo set de motos filtradas; solo recaudo).
  const setContratosFiltrados = useMemo(() => new Set(baseFiltrada.map(r => r.contratoId)), [baseFiltrada]);
  const { desde: desdeAnt, hasta: hastaAnt } = useMemo(() => rango === "personalizado" ? rangoAnteriorDe(rangoCustom.desde, rangoCustom.hasta) : getRangoAnterior(rango), [rango, rangoCustom]);
  const recaudoAnterior = useMemo(() => pagos.filter(p => p.estado === "Confirmado" && fechaDeCaja(p) >= desdeAnt && fechaDeCaja(p) <= hastaAnt && esPagoDeCaja(p) && setContratosFiltrados.has(p.contrato_id)).reduce((a, p) => a + p.valor, 0), [pagos, desdeAnt, hastaAnt, setContratosFiltrados]);
  const deltaRec = deltaRecaudo(gTotRec, recaudoAnterior);

  // C3 — ranking de cobradores por % al día (excluye "sin asignar").
  const rankingCobradores = useMemo(() => porAdminData.filter(b => b.key !== "__none__").slice().sort((a, b) => b.pctv - a.pctv || b.recaudado - a.recaudado), [porAdminData]);

  // C2 — "por convenir": motos con deuda sin convenio por cobrador.
  const porConvenir = useMemo(() => porAdminData.map(b => ({ nombre: b.nombre, motos: b.motos.filter(m => m.debeSinConvenio).slice().sort((x, y) => y.deudaPend - x.deudaPend) })).filter(b => b.motos.length > 0), [porAdminData]);

  // E1 — antigüedad de la mora (aging): tramos por días, con conteo y $ de deuda.
  const aging = useMemo(() => {
    const tr = [{ k: "1–3 días", lo: 1, hi: 3, n: 0, d: 0 }, { k: "4–7 días", lo: 4, hi: 7, n: 0, d: 0 }, { k: "8–15 días", lo: 8, hi: 15, n: 0, d: 0 }, { k: "+15 días", lo: 16, hi: 1e9, n: 0, d: 0 }];
    baseFiltrada.filter(r => r.estado !== "aldia" && r.diasMora > 0).forEach(r => { const b = tr.find(t => r.diasMora >= t.lo && r.diasMora <= t.hi); if (b) { b.n++; b.d += r.deudaPend; } });
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
    const grupos = (GRUPOS as readonly string[]).filter(g => baseFiltrada.some(r => r.grupo === g));
    const cell = (nom: string, g: string) => { const rs = baseFiltrada.filter(r => r.adminNombre === nom && r.grupo === g); return { motos: rs.length, rec: rs.reduce((s, r) => s + r.monto, 0) }; };
    return { admins, grupos, cell };
  }, [baseFiltrada]);

  // ── INFORME "Visitas por administrador" ────────────────────────────────────
  const visitasData = useMemo(() => {
    const nombreAdmin = (id: string | null | undefined) =>
      id ? (subadmins.find(s => s.id === id)?.nombre ?? "—") : "Sin asignar / Oficina";
    type VisRow = { cliente: string; fecha: string; estado: string; resultado: string | null; gps: boolean; foto: boolean; estimado: boolean };
    type VisAgg = { key: string; nombre: string; visitas: VisRow[]; aprobadas: number; rechazadas: number; repetir: number; pendientes: number; estimadas: number };
    const map = new Map<string, VisAgg>();
    visitas.filter(v => (v.fecha || "").slice(0, 10) >= desde && (v.fecha || "").slice(0, 10) <= hasta).forEach(v => {
      // Se agrupa por QUIÉN LA HIZO, no por a quién se le encargó. Este informe es la base para
      // pagar las visitas: si uno cubre a otro, el pago tiene que ir a quien fue. `realizada_por`
      // se empezó a escribir después, así que las visitas viejas caen a `asignada_a` y se marcan
      // como estimadas — mejor decirlo que dar por exacto un dato que no lo es.
      const quien = v.realizada_por ?? v.asignada_a;
      const estimado = !v.realizada_por;
      const key = quien ?? "__none__";
      if (!map.has(key)) map.set(key, { key, nombre: nombreAdmin(quien), visitas: [], aprobadas: 0, rechazadas: 0, repetir: 0, pendientes: 0, estimadas: 0 });
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
    : m.estado === "parcial"
      ? { v: "Parcial", color: "#92400e", fill: "#fef3c7", align: "center" }
      : m.estado === "retenida"
        ? { v: "Retenida", color: "#3730a3", fill: "#e0e7ff", align: "center" }
        : { v: "No pagó", color: "#991b1b", fill: "#fee2e2", align: "center" };
  const xPagado = (m: MotoRowG): CeldaX => m.monto > 0 ? { num: m.monto } : { v: "—", align: "center" };
  const xFalta = (m: MotoRowG): CeldaX => m.deudaPend > 0 ? { num: m.deudaPend, color: "#991b1b" } : { v: "—", align: "center" };
  const xConvenio = (m: MotoRowG): CeldaX => m.tieneConvenio
    ? { v: "Sí", align: "center" }
    : m.debeSinConvenio ? { v: "Falta", color: "#92400e", fill: "#fef3c7", align: "center" } : { v: "—", align: "center" };
  const xModalidad = (m: MotoRowG): CeldaX => ({ v: m.formaPago, align: "center" });
  const xDiaPago = (m: MotoRowG): CeldaX => ({ v: m.diaPago || "—", align: "center" });
  const xUltPago = (m: MotoRowG): CeldaX => ({ v: m.ultimaFechaPago ? fmtFechaCorta(m.ultimaFechaPago) : "sin pagos", align: "center", color: m.ultimaFechaPago ? undefined : "#94a3b8" });
  const xTelefono = (m: MotoRowG): CeldaX => ({ v: m.telefono || "—", align: "center" });
  const xDiasMora = (m: MotoRowG): CeldaX => m.diasMora > 0 ? { v: String(m.diasMora), align: "center", color: m.diasMora > 15 ? "#991b1b" : m.diasMora > 7 ? "#b45309" : "#92400e" } : { v: "—", align: "center" };
  const xLeyenda = "Estados: Al día = pagó lo que debía o su convenio está al día · Parcial = abonó pero aún debe · No pagó = en mora sin abonar · Retenida = la moto está guardada en la empresa (no puede producir; no cuenta como mora ni entra al % de al día). 'Días mora' = antigüedad de la mora. Los montos están en pesos.";

  // 12 columnas (col 0 = etiqueta cruzada). Mismas para Por admin (Grupo) y Por grupo (Administrador).
  const colsGestion = (cross: string): ColX[] => [
    { label: cross, ancho: cross === "Administrador" ? 150 : 95 }, { label: "Placa", ancho: 75 }, { label: "Cliente", ancho: 190 },
    { label: "Modalidad", align: "center", ancho: 90 }, { label: "Día de pago", align: "center", ancho: 95 },
    { label: "Estado", align: "center", ancho: 80 }, { label: "Pagó período ($)", align: "right", ancho: 105 },
    { label: "Le falta ($)", align: "right", ancho: 95 }, { label: "Días mora", align: "center", ancho: 75 }, { label: "Últ. pago", align: "center", ancho: 90 },
    { label: "Teléfono", align: "center", ancho: 105 }, { label: "Convenio", align: "center", ancho: 75 },
  ];

  // Hoja "Resumen": ranking de cobradores + por grupo + comparación de recaudo.
  function hojaResumen(): SeccionesOpts {
    const cols: ColX[] = [
      { label: "#", align: "center", ancho: 40 }, { label: "Cobrador / Grupo", ancho: 170 },
      { label: "Motos", align: "center", ancho: 65 }, { label: "Al día", align: "center", ancho: 65 },
      { label: "Parcial", align: "center", ancho: 65 }, { label: "No pagó", align: "center", ancho: 70 },
      { label: "% al día", align: "center", ancho: 70 }, { label: "Recaudado ($)", align: "right", ancho: 110 },
    ];
    const filaBloque = (pos: string, b: BloqueG): CeldaX[] => [
      { v: pos, align: "center" }, b.nombre === b.key ? b.key : b.nombre.toUpperCase(),
      { num: b.total, align: "center" }, { v: String(b.alDia), align: "center", color: "#166534" },
      { v: String(b.parcial), align: "center", color: "#92400e" }, { v: String(b.noPago), align: "center", color: "#991b1b" },
      { v: `${b.pctv}%`, align: "center", bold: true }, { num: b.recaudado },
    ];
    return {
      titulo: `Resumen gerencial${filtrosActivos ? " — " + filtrosResumen : ""}`, periodo: periodoTxt,
      leyenda: `Recaudo $ ${fmt(gTotRec)} · anterior $ ${fmt(recaudoAnterior)} (${deltaRec.txt}) · esperado por ciclo $ ${fmt(esperadoCiclo)} (${pctCumplimiento}% cumplimiento) · ${gDebenSinConv} deben sin convenio`,
      columnas: cols,
      secciones: [
        { titulo: "Ranking de cobradores (por % al día)", color: "#0f2740", filas: rankingCobradores.map((b, i) => filaBloque(String(i + 1), b)) },
        { titulo: "Por grupo", color: "#334155", filas: porGrupoData.map(b => filaBloque("", b)) },
      ],
      totalGeneral: ["", { v: "TOTAL", bold: true }, { num: gTotMotos, align: "center", bold: true }, { v: String(gAlDia), align: "center", bold: true }, { v: String(gParcial), align: "center", bold: true }, { v: String(gNoPago), align: "center", bold: true }, { v: pct(gAlDia, gTotMotos), align: "center", bold: true }, { num: gTotRec, bold: true }],
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
      leyenda: "Motos en mora agrupadas por días de atraso. Más días = más riesgo de pérdida.",
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
      xModalidad, xDiaPago, xEstado, xPagado, xFalta, xDiasMora, xUltPago, xTelefono, xConvenio,
    ];
    return cols.map((c, i) => ({
      key: `c${i}`, rotulo: c.label, align: c.align, ancho: c.ancho,
      porDefecto: i <= 7,   // hasta "Le falta ($)": lo que se necesita para cobrar
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
      titulo: `👤 ${a.nombre.toUpperCase()}   —   ${a.total} visitas · ${a.aprobadas} aprobadas · ${a.rechazadas} rechazadas · ${a.repetir} repetir · ${a.pendientes} pendientes`,
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
    const pctAld = gTotMotos > 0 ? Math.round((gAlDia / gTotMotos) * 100) : 0;
    const sem = pctAld >= 85 ? "#159a6d" : pctAld >= 70 ? "#e0982a" : "#d64545";
    const th = (t: string, al = "left") => `<th style="background:#0f2740;color:#fff;padding:6px 8px;text-align:${al};font-size:11px">${t}</th>`;
    const td = (t: string, al = "left", color = "#0f172a", bold = false) => `<td style="padding:5px 8px;border-bottom:1px solid #e2e8f0;text-align:${al};font-size:11px;color:${color};${bold ? "font-weight:bold" : ""}">${t}</td>`;
    // PORTADA — KPIs grandes (+Δ, cumplimiento $) + tendencia
    const kpi = (label: string, value: string, color: string, extra = "") => `<div style="flex:1;min-width:104px;background:#f6f8fb;border-radius:10px;padding:10px 12px"><div style="font-size:10.5px;color:#64748b">${label}</div><div style="font-size:20px;font-weight:bold;color:${color}">${value}</div>${extra}</div>`;
    const deltaHtml = recaudoAnterior > 0 ? `<div style="font-size:10px;margin-top:2px;color:${deltaRec.up ? "#0f7a52" : "#a3202d"}">${deltaRec.txt} vs anterior</div>` : "";
    const portada = `<div style="display:flex;gap:9px;flex-wrap:wrap;margin:12px 0 6px">`
      + kpi("Recaudado", "$ " + fmt(gTotRec), "#0f172a", deltaHtml)
      + kpi("Al día", pctAld + "%", sem)
      + kpi("Cumplimiento $", pctCumplimiento + "%", "#0f172a", `<div style="font-size:9.5px;margin-top:2px;color:#64748b">de $ ${fmt(esperadoCiclo)} esperado</div>`)
      + kpi("Motos activas", String(gTotMotos), "#0f172a")
      + kpi("Sin convenio", String(gDebenSinConv), "#a35a12")
      + `</div>`;
    const spark = `<div style="margin:2px 0 6px"><div style="font-size:11px;color:#64748b;margin-bottom:2px">Recaudo diario (últimos 14 días, toda la operación)</div>${sparklineSVG(recaudoDiario.map(d => d.total))}</div>`;
    // Dona + barras
    const dona = `<div style="text-align:center"><div style="font-size:13px;font-weight:bold;color:#0f172a;text-align:left;margin-bottom:6px">Estado de la cartera</div>${donutSVG(gAlDia, gParcial, gNoPago, gTotMotos)}<div style="font-size:11px;color:#334155;margin-top:4px"><span style="color:#159a6d">■</span> Al día ${gAlDia} &nbsp; <span style="color:#e0982a">■</span> Parcial ${gParcial} &nbsp; <span style="color:#d64545">■</span> No pagó ${gNoPago}</div></div>`;
    const maxGrupo = Math.max(1, ...porGrupoData.map(b => b.recaudado));
    const barsGrupo = barrasHTML(porGrupoData.map(b => ({ label: b.key, value: b.recaudado, max: maxGrupo, color: "#2f6db0", right: "$ " + fmt(b.recaudado) })));
    const barsCobr = barrasHTML(rankingCobradores.map(b => ({ label: b.nombre.toUpperCase(), value: b.pctv, max: 100, color: b.pctv >= 85 ? "#159a6d" : b.pctv >= 70 ? "#e0982a" : "#d64545", right: b.pctv + "%" })));
    const graficos = `<div style="display:flex;gap:22px;align-items:flex-start;margin:6px 0 12px"><div style="flex:0 0 170px">${dona}</div><div style="flex:1"><div style="font-size:13px;font-weight:bold;color:#0f172a;margin-bottom:8px">Recaudo por grupo</div>${barsGrupo}<div style="font-size:13px;font-weight:bold;color:#0f172a;margin:14px 0 8px">Cumplimiento por cobrador</div>${barsCobr}</div></div>`;
    // E1 — aging
    const agN = aging.reduce((s, t) => s + t.n, 0), agColors = ["#f0b32e", "#e0982a", "#d3691a", "#d64545"];
    const agBar = agN > 0 ? `<div style="display:flex;height:14px;border-radius:6px;overflow:hidden;margin:4px 0 5px">${aging.map((t, i) => t.n > 0 ? `<div style="width:${(t.n / agN) * 100}%;background:${agColors[i]}"></div>` : "").join("")}</div>` : "";
    const agingHtml = agN === 0 ? "" : `<div style="font-size:13px;font-weight:bold;color:#0f172a;margin:12px 0 5px">Antigüedad de la mora</div>${agBar}<table style="width:100%;border-collapse:collapse"><tr>${th("Tramo")}${th("Motos", "center")}${th("Deuda", "right")}</tr>${aging.map((t, i) => `<tr>${td(t.k, "left", agColors[i], true)}${td(String(t.n), "center")}${td("$ " + fmt(t.d), "right")}</tr>`).join("")}</table>`;
    // Ranking
    const tablaRanking = rankingCobradores.length < 2 ? "" : `<div style="font-size:13px;font-weight:bold;color:#0f172a;margin:14px 0 5px">Ranking por cobrador</div><table style="width:100%;border-collapse:collapse"><tr>${th("#", "center")}${th("Cobrador")}${th("Motos", "center")}${th("Al día", "center")}${th("Parcial", "center")}${th("No pagó", "center")}${th("% al día", "center")}${th("Recaudado", "right")}</tr>${rankingCobradores.map((b, i) => `<tr>${td(String(i + 1), "center")}${td(esc(b.nombre.toUpperCase()))}${td(String(b.total), "center")}${td(String(b.alDia), "center", "#166534")}${td(String(b.parcial), "center", "#92400e")}${td(String(b.noPago), "center", "#991b1b")}${td(b.pctv + "%", "center", "#0f172a", true)}${td("$ " + fmt(b.recaudado), "right")}</tr>`).join("")}</table>`;
    // E4 — matriz + método
    const matrizHtml = (matriz.admins.length < 2 && matriz.grupos.length < 2) ? "" : `<div style="font-size:13px;font-weight:bold;color:#0f172a;margin:14px 0 5px">Matriz cobrador × grupo (recaudado)</div><table style="width:100%;border-collapse:collapse"><tr>${th("Cobrador")}${matriz.grupos.map(g => th(g, "right")).join("")}${th("Total", "right")}</tr>${matriz.admins.map(nom => { let tot = 0; const cs = matriz.grupos.map(g => { const c = matriz.cell(nom, g); tot += c.rec; return td(c.motos > 0 ? "$ " + fmt(c.rec) : "—", "right"); }).join(""); return `<tr>${td(esc(nom.toUpperCase()))}${cs}${td("$ " + fmt(tot), "right", "#0f172a", true)}</tr>`; }).join("")}</table>`;
    const metodoHtml = metodoPorAdmin.length === 0 ? "" : `<div style="font-size:13px;font-weight:bold;color:#0f172a;margin:14px 0 5px">Recaudo por método</div><table style="width:100%;border-collapse:collapse"><tr>${th("Cobrador")}${th("Efectivo", "right")}${th("Transferencia", "right")}${th("Total", "right")}</tr>${metodoPorAdmin.map(m => `<tr>${td(esc(m.nom.toUpperCase()))}${td("$ " + fmt(m.efectivo), "right")}${td("$ " + fmt(m.transf), "right")}${td("$ " + fmt(m.total), "right", "#0f172a", true)}</tr>`).join("")}</table>`;
    const convenirHtml = porConvenir.length === 0 ? "" : `<div style="font-size:13px;font-weight:bold;color:#0f172a;margin:16px 0 6px">Por convenir — tarea de la semana</div>${porConvenir.map(b => `<div style="margin-bottom:8px"><div style="background:#fff7ed;color:#92400e;font-weight:bold;font-size:12px;padding:4px 8px;border-radius:5px">${esc(b.nombre.toUpperCase())} — ${b.motos.length} por convenir · debe $ ${fmt(b.motos.reduce((s, m) => s + m.deudaPend, 0))}</div><table style="width:100%;border-collapse:collapse">${b.motos.map(m => `<tr>${td(esc(m.cliente.toUpperCase()))}${td(m.placa, "center")}${td(m.telefono || "—", "center", "#185fa5")}${td(m.formaPago, "center")}${td("debe $ " + fmt(m.deudaPend), "right", "#991b1b", true)}</tr>`).join("")}</table></div>`).join("")}`;
    const titulo = filtrosActivos ? `Informe gerencial — ${esc(filtrosResumen)}` : "Informe gerencial de cartera";
    return `<div style="font-family:Arial,sans-serif;color:#0f172a;width:794px">`
      + `<div style="background:#0f2740;color:#fff;padding:14px 18px;display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:19px;font-weight:bold">${titulo}</div><div style="font-size:12px;color:#7fb2e6;margin-top:2px">Recaudo y gestión por cobrador</div></div><div style="background:#FFD100;color:#111;font-size:12px;font-weight:bold;padding:5px 10px;border-radius:6px;border:2px solid #111">CLUB MOTEROS CARTAGENA</div></div>`
      + `<div style="padding:6px 18px;background:#f1f5f9;font-size:11px;color:#475569">del ${fmtFechaCorta(desde)} al ${fmtFechaCorta(hasta)} &nbsp;·&nbsp; generado ${fmtFechaCorta(hoyISO())}${filtrosActivos ? ` &nbsp;·&nbsp; filtros: ${esc(filtrosResumen)}` : ""}</div>`
      + `<div style="padding:8px 18px 18px">${portada}${spark}${graficos}${agingHtml}${tablaRanking}${matrizHtml}${metodoHtml}${convenirHtml}<div style="margin-top:18px;border-top:1px solid #e2e8f0;padding-top:8px;font-size:10px;color:#94a3b8;text-align:center">Al día = cubrió su período o convenio al día · Parcial = abonó pero aún debe · No pagó = en mora sin abonar · Cumplimiento $ = recaudado / cuota por ciclo. El recaudo se atribuye al cobrador que tiene la moto actualmente.<br>Club Moteros Cartagena · Fredy Mora Avendaño C.C. 1.047.393.901</div></div></div>`;
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
  const totalCampo        = pagosRango.filter(p => p.tipo_registro === "campo").reduce((a, p) => a + p.valor, 0);

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
  const maxDiario = Math.max(...recaudoDiario.map(d => d.total), 1);

  // ── Recaudo últimas 4 semanas ──────────────────────────────────────────────
  const recaudoSemanal = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const fin = hoyDate(); fin.setDate(fin.getDate() - i * 7);
      const ini = new Date(fin); ini.setDate(ini.getDate() - 6);
      const desde_ = ini.toISOString().slice(0, 10);
      const hasta_ = fin.toISOString().slice(0, 10);
      const total = pagos.filter(p => p.estado === "Confirmado" && fechaDeCaja(p) >= desde_ && fechaDeCaja(p) <= hasta_ && esPagoDeCaja(p)).reduce((a, p) => a + p.valor, 0);
      return { label: i === 0 ? "Esta sem" : `Sem -${i}`, total };
    }).reverse();
  }, [pagos]);
  const maxSemanal = Math.max(...recaudoSemanal.map(s => s.total), 1);

  // ── Contratos ──────────────────────────────────────────────────────────────
  const contratosActivos = contratos.filter(c => c.estado === "Activo");
  const contratosPorForma = useMemo(() => {
    const map: Record<string, number> = {};
    contratosActivos.forEach(c => { const k = c.forma_pago ?? "Sin definir"; map[k] = (map[k] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [contratosActivos]);

  // ── Mora ───────────────────────────────────────────────────────────────────
  // Las motos GUARDADAS en la empresa no entran a esta lista (pedido del dueño, 22-ago): el
  // cliente no puede producir, así que sus "días sin pagar" no son mora — están retenidas y se
  // ven como 🔒 en los informes de gestión y en Inmovilizaciones.
  const enMora = useMemo(() => {
    const GUARDADA = new Set(["Recuperada", "Mantenimiento", "Fiscalia", "Transito", "Garantia"]);
    return contratosActivos.filter(c => !GUARDADA.has(motos.find(m => m.id === c.moto_id)?.estado ?? "")).map(c => {
      const pagosC = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado");
      const ultimo = pagosC.sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
      const grupoMoto = motos.find(m => m.id === c.moto_id)?.grupo ?? null;
      const dias = diasDesdeUltimoPago(ultimo?.fecha ?? null, c.fecha_entrega ?? c.created_at.slice(0, 10), corteMigracionGrupo(grupoMoto)) ?? 0;
      return { contrato: c, diasSinPago: dias, ultimoPago: ultimo?.fecha ?? null };
    }).filter(e => e.diasSinPago > 2);
  }, [contratosActivos, pagos, motos]);

  // Deuda real por contrato (tabla deudas) — no estimada por días
  // Mismo criterio que la línea 589 de este archivo (`=== "pendiente"`): antes había DOS
  // verdades contradictorias en el mismo informe — esta inflaba la deuda con lo que ya está
  // financiado dentro de un convenio.
  const deudaDelContrato = useMemo(() => {
    const map = new Map<string, number>();
    deudas.filter(d => d.estado === "pendiente").forEach(d => {
      map.set(d.contrato_id, (map.get(d.contrato_id) ?? 0) + d.monto_pendiente);
    });
    return map;
  }, [deudas]);

  const deudaTotalCartera = useMemo(() => {
    const activosIds = new Set(contratosActivos.map(c => c.id));
    let total = 0;
    deudaDelContrato.forEach((v, contratoId) => { if (activosIds.has(contratoId)) total += v; });
    return total;
  }, [deudaDelContrato, contratosActivos]);

  const moraDetallada = useMemo(() => enMora.map(({ contrato: c, diasSinPago, ultimoPago }) => {
    const cliente = clientes.find(cl => cl.id === c.cliente_id);
    const moto    = c.moto_id ? motos.find(m => m.id === c.moto_id) : undefined;
    return {
      id: c.id, clienteId: c.cliente_id, motoId: c.moto_id ?? null,
      cliente: cliente?.nombre ?? "—", placa: moto?.placa ?? "—",
      diasSinPago, deudaPendiente: deudaDelContrato.get(c.id) ?? 0, ultimoPago,
    };
  }).sort((a, b) => b.diasSinPago - a.diasSinPago), [enMora, clientes, motos, deudaDelContrato]);

  const enMoraCritica = enMora.filter(e => e.diasSinPago > 7).length;

  // ── Reporte por grupo ──────────────────────────────────────────────────────
  const reporteGrupos = useMemo(() => GRUPOS.map(grupo => {
    const motosGrupo = motos.filter(m => m.grupo === grupo);
    const mIds = new Set(motosGrupo.map(m => m.id));
    const cActivos = contratos.filter(c => c.moto_id && mIds.has(c.moto_id) && c.estado === "Activo");
    const cIds = new Set(cActivos.map(c => c.id));
    const recaudo = pagosRango.filter(p => cIds.has(p.contrato_id)).reduce((a, p) => a + p.valor, 0);
    const moraGrupo = enMora.filter(e => cIds.has(e.contrato.id)).length;
    return {
      grupo,
      motosAsignadas: motosGrupo.filter(m => m.estado === "Asignada").length,
      motasTotal: motosGrupo.length,
      recaudo, contratosActivos: cActivos.length, enMora: moraGrupo,
    };
  }), [motos, contratos, pagosRango, enMora]);

  // ── Top pagadores en rango ─────────────────────────────────────────────────
  const topPagadores = useMemo(() => {
    const map: Record<string, number> = {};
    pagosRango.forEach(p => {
      // Se acredita a quien tenía el contrato EN ESA FECHA. Con el titular de hoy, tras una
      // cesión el ranking le sumaría al nuevo la plata que puso el anterior.
      const quien = titularEnFecha(p.contrato_id, p.fecha, contratos, cesiones);
      if (!quien) return;
      map[quien] = (map[quien] ?? 0) + p.valor;
    });
    return Object.entries(map)
      .map(([clienteId, total]) => ({
        clienteId,
        nombre: clientes.find(cl => cl.id === clienteId)?.nombre ?? "—",
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [pagosRango, contratos, clientes]);

  // ── Clientes ───────────────────────────────────────────────────────────────
  const clientesActivos     = clientes.filter(c => c.estado === "Activo").length;
  const clientesEnProceso   = clientes.filter(c => c.estado === "En proceso" || c.estado === "Aprobado").length;
  const inicioMes           = hoyStr.slice(0, 7) + "-01";
  const clientesNuevosMes   = clientes.filter(c => c.created_at >= inicioMes).length;

  // ── Motos por estado ───────────────────────────────────────────────────────
  const motosPorEstado = useMemo(() => {
    const map: Record<string, number> = {};
    motos.forEach(m => { map[m.estado] = (map[m.estado] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [motos]);

  // ── Proyección ─────────────────────────────────────────────────────────────
  const tarifaPromedio    = contratosActivos.length > 0 ? contratosActivos.reduce((a, c) => a + (c.tarifa_diaria ?? 27000), 0) / contratosActivos.length : 27000;
  const proyeccionMensual = tarifaPromedio * contratosActivos.length * 26;

  // ── Alertas vencimiento ────────────────────────────────────────────────────
  const alertasVencimiento = useMemo(() => {
    const en30 = hoyDate(); en30.setDate(en30.getDate() + 30);
    const iso30 = en30.toISOString().slice(0, 10);
    return motos.filter(m => (m.fecha_seguro && m.fecha_seguro <= iso30) || (m.fecha_tecnomecanica && m.fecha_tecnomecanica <= iso30))
      .map(m => ({
        id: m.id, placa: m.placa,
        seguro: m.fecha_seguro ?? null,
        tecno: m.fecha_tecnomecanica ?? null,
        diasSeguro: m.fecha_seguro ? Math.ceil((new Date(m.fecha_seguro + "T00:00:00").getTime() - Date.now()) / 86400000) : null,
        diasTecno:  m.fecha_tecnomecanica ? Math.ceil((new Date(m.fecha_tecnomecanica + "T00:00:00").getTime() - Date.now()) / 86400000) : null,
      }))
      .sort((a, b) => {
        const ma = Math.min(a.diasSeguro ?? 999, a.diasTecno ?? 999);
        const mb = Math.min(b.diasSeguro ?? 999, b.diasTecno ?? 999);
        return ma - mb;
      });
  }, [motos]);

  const diasBase = useMemo(() =>
    contratos.filter(c => c.estado === "Activo" && c.tipo_ruta === "diario" && !c.base_completada && ahorroTotal(c) >= 450000),
    [contratos]);

  // ── Comparativa mes anterior ───────────────────────────────────────────────
  const comparativaMes = useMemo(() => {
    if (rango !== "mes") return null;
    const hoy = hoyDate();
    const i = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().slice(0, 10);
    const f = new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().slice(0, 10);
    const totalAnt = pagos.filter(p => p.estado === "Confirmado" && fechaDeCaja(p) >= i && fechaDeCaja(p) <= f && esPagoDeCaja(p)).reduce((a, p) => a + p.valor, 0);
    const delta = totalAnt > 0 ? ((totalRecaudado - totalAnt) / totalAnt) * 100 : null;
    return { totalAnt, delta };
  }, [rango, pagos, totalRecaudado]);

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
          placa: moto?.placa ?? "—", grupo: (moto?.grupo ?? "—") as string,
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
      .filter(e => grupoEnt === "Todos" || e.grupo === grupoEnt)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [contratos, clientes, motos, desde, hasta, grupoEnt]);

  const entregasCompletas   = entregas.filter(e => e.docsOk).length;
  const entregasIncompletas = entregas.length - entregasCompletas;
  const entregasConFotos    = entregas.filter(e => e.nFotos > 0).length;

  // ── Resumen de UNA entrega (por contrato): lo pactado + fotos, en una página ──
  function verResumenEntrega(e: typeof entregas[number]) {
    const c = contratos.find(ct => ct.id === e.id);
    const cliente = clientes.find(cl => cl.id === e.clienteId);
    const moto = e.motoId ? motos.find(m => m.id === e.motoId) ?? null : null;
    if (!c || !cliente) return;
    const fotos = e.fotos.map(([ang, url]) => ({ label: ANG_LABEL[ang] ?? ang, url }));
    const cuerpo = generarHTMLResumenEntrega(c, cliente, moto, fotos);
    // El navegador usa el <title> como nombre por defecto al "Guardar como PDF".
    const nombreDoc = `Rep_entrega (${e.placa})(${e.cliente})`;
    const win = window.open("", "_blank", "width=840,height=920");
    if (!win) return;
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
      <div class="kpi"><div class="kpi-val">${contratosActivos.length}</div><div class="kpi-lbl">Contratos activos</div></div>
      <div class="kpi"><div class="kpi-val">${enMora.length}</div><div class="kpi-lbl">En mora</div></div></div>`);

    if (S.recaudoGrupo) {
      const filas = reporteGrupos.map(g => `<tr><td><b>${g.grupo}</b></td><td class="c">${g.motosAsignadas}</td><td class="r">$ ${fmt(g.recaudo)}</td><td class="c">${g.contratosActivos}</td><td class="c" style="color:${g.enMora > 0 ? "#991b1b" : "#166534"};font-weight:700">${g.enMora}</td></tr>`).join("");
      parts.push(`<h2>Recaudo por grupo</h2><table><thead><tr><th>Grupo</th><th class="c">Motos asignadas</th><th class="r">Recaudo período</th><th class="c">Contratos activos</th><th class="c">En mora</th></tr></thead><tbody>${filas}</tbody></table>`);
    }

    const gDetalle = (bloques: BloqueG[], modo: "admin" | "grupo", cross: string) => {
      const filas = bloques.map(b => {
        const cab = `<tr class="sec"><td colspan="11">${b.nombre.toUpperCase()} — ${b.total} motos · ${b.alDia} al día · ${b.parcial} parcial · ${b.noPago} no pagó${b.retenidas > 0 ? ` · ${b.retenidas} retenida${b.retenidas === 1 ? "" : "s"}` : ""}${b.debenSinConvenio > 0 ? ` · ${b.debenSinConvenio} sin convenio` : ""} · recaudado $ ${fmt(b.recaudado)}</td></tr>`;
        const motos = b.motos.map(m => {
          const e = m.estado === "aldia" ? { t: "Al día", c: "#166534" } : m.estado === "parcial" ? { t: "Parcial", c: "#92400e" } : m.estado === "retenida" ? { t: "Retenida", c: "#3730a3" } : { t: "No pagó", c: "#991b1b" };
          const conv = m.tieneConvenio ? "Sí" : (m.debeSinConvenio ? "Falta" : "—");
          const ult = m.ultimaFechaPago ? fmtFechaCorta(m.ultimaFechaPago) : "sin pagos";
          return `<tr><td>${m.placa}</td><td class="up">${m.cliente}</td><td>${modo === "admin" ? m.grupo : m.adminNombre}</td><td class="c">${m.formaPago}</td><td class="c">${m.diaPago || "—"}</td><td class="c" style="color:${e.c};font-weight:700">${e.t}</td><td class="r">${m.monto > 0 ? "$ " + fmt(m.monto) : "—"}</td><td class="r" style="${m.deudaPend > 0 ? "color:#991b1b;font-weight:700" : ""}">${m.deudaPend > 0 ? "$ " + fmt(m.deudaPend) : "—"}</td><td class="c">${ult}</td><td class="c">${m.telefono || "—"}</td><td class="c">${conv}</td></tr>`;
        }).join("");
        return cab + motos;
      }).join("");
      return `<table><thead><tr><th>Placa</th><th>Cliente</th><th>${cross}</th><th class="c">Modalidad</th><th class="c">Día pago</th><th class="c">Estado</th><th class="r">Pagó período</th><th class="r">Le falta</th><th class="c">Últ. pago</th><th class="c">Teléfono</th><th class="c">Convenio</th></tr></thead><tbody>${filas}</tbody></table>`;
    };
    const gResumen = (bloques: BloqueG[], modo: "admin" | "grupo") => {
      const filas = bloques.map(b => `<tr><td class="up"><b>${modo === "admin" ? "👤 " : ""}${b.nombre}</b></td><td class="c">${b.total}</td><td class="c" style="color:#166534;font-weight:700">${b.alDia}</td><td class="c" style="color:#92400e;font-weight:700">${b.parcial}</td><td class="c" style="color:#991b1b;font-weight:700">${b.noPago}</td><td class="c" style="color:#92400e">${b.debenSinConvenio || "—"}</td><td class="r">$ ${fmt(b.recaudado)}</td></tr>`).join("");
      return `<table><thead><tr><th>${modo === "admin" ? "Administrador" : "Grupo"}</th><th class="c">Motos</th><th class="c">Al día</th><th class="c">Parcial</th><th class="c">No pagó</th><th class="c">Sin conv.</th><th class="r">Recaudado</th></tr></thead><tbody>${filas}</tbody></table>`;
    };

    if (S.porAdmin) parts.push(`<h2>Gestión por administrador${filtrosActivos ? ` — ${filtrosResumen}` : ""}${det ? " — detalle" : " — resumen"}</h2>${det ? gDetalle(porAdminData, "admin", "Grupo") : gResumen(porAdminData, "admin")}`);
    if (S.porGrupo) parts.push(`<h2>Gestión por grupo${det ? " — detalle" : " — resumen"}</h2>${det ? gDetalle(porGrupoData, "grupo", "Administrador") : gResumen(porGrupoData, "grupo")}`);

    if (S.visitas) {
      let tabla: string;
      if (det) {
        const filas = visitasData.map(a => {
          const cab = `<tr class="sec"><td colspan="5">👤 ${a.nombre.toUpperCase()} — ${a.total} visitas · ${a.aprobadas} aprob · ${a.rechazadas} rech · ${a.repetir} repetir · ${a.pendientes} pend</td></tr>`;
          const vs = a.visitas.map(v => `<tr><td class="up">${v.cliente}</td><td class="c">${fmtFechaCorta(v.fecha)}</td><td class="c">${v.estado}</td><td class="c">${v.estado === "Pendiente" ? "—" : (v.resultado ?? "—")}</td><td class="c">${((v.gps ? "📍" : "") + (v.foto ? " 📷" : "")) || "—"}</td></tr>`).join("");
          return cab + vs;
        }).join("");
        tabla = `<table><thead><tr><th>Cliente</th><th class="c">Fecha</th><th class="c">Estado</th><th class="c">Resultado</th><th class="c">GPS/Foto</th></tr></thead><tbody>${filas}</tbody></table>`;
      } else {
        const filas = visitasData.map(a => `<tr><td class="up"><b>👤 ${a.nombre}</b></td><td class="c">${a.total}</td><td class="c">${a.aprobadas}</td><td class="c">${a.rechazadas}</td><td class="c">${a.repetir}</td><td class="c">${a.pendientes}</td></tr>`).join("");
        tabla = `<table><thead><tr><th>Administrador</th><th class="c">Visitas</th><th class="c">Aprob.</th><th class="c">Rech.</th><th class="c">Repetir</th><th class="c">Pend.</th></tr></thead><tbody>${filas}</tbody></table>`;
      }
      parts.push(`<h2>Visitas por administrador</h2>${tabla}`);
    }

    if (S.mora) {
      const filas = moraDetallada.map(m => `<tr><td class="up">${m.cliente}</td><td>${m.placa}</td><td class="c" style="color:#991b1b;font-weight:700">${m.diasSinPago}</td><td class="r">$ ${fmt(m.deudaPendiente)}</td><td>${m.ultimoPago ? new Date(m.ultimoPago + "T00:00:00").toLocaleDateString("es-CO") : "—"}</td></tr>`).join("");
      parts.push(`<h2>Mora y cartera vencida (${moraDetallada.length})</h2>${moraDetallada.length === 0 ? "<p class='ok'>Sin contratos en mora.</p>" : `<table><thead><tr><th>Cliente</th><th>Placa</th><th class="c">Días</th><th class="r">Deuda pendiente</th><th>Último pago</th></tr></thead><tbody>${filas}</tbody></table>`}`);
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

  // ── Avisos rápidos ─────────────────────────────────────────────────────────
  const avisos = [
    enMoraCritica > 0 && { color: "var(--bad-ink)", bg: "var(--bad-soft)", border: "var(--bad)", text: `🚨 ${enMoraCritica} contrato${enMoraCritica > 1 ? "s" : ""} en mora crítica (+7 días) — requieren recolección` },
    diasBase.length > 0 && { color: "var(--warn-ink)", bg: "var(--warn-soft)", border: "var(--warn2)", text: `⚠️ ${diasBase.length} cliente${diasBase.length > 1 ? "s" : ""} cerca de completar la base ($510.000) — gestionar cambio de contrato` },
    alertasVencimiento.length > 0 && { color: "var(--warn-ink)", bg: "var(--warn-soft)", border: "var(--warn2)", text: `📋 ${alertasVencimiento.length} moto${alertasVencimiento.length > 1 ? "s" : ""} con SOAT o tecno venciendo en 30 días` },
  ].filter(Boolean) as { color: string; bg: string; border: string; text: string }[];

  return (
    <div>
      {/* Hero header */}
      <div style={{ background: "linear-gradient(135deg, var(--text) 0%, var(--accent-ink2) 100%)", borderRadius: 20, padding: isMobile ? "20px 16px" : "28px 32px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: isMobile ? 20 : 26, margin: 0, fontWeight: 700, color: "var(--card)" }}>Reportes</h2>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Resumen operativo y financiero en tiempo real.</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, color: "var(--accent-hi)", lineHeight: 1 }}>$ {fmt(recaudadoHoy)}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4, fontWeight: 600 }}>Recaudado hoy</div>
        </div>
      </div>

      {/* Rangos (grid 3 columnas — sin scroll lateral) */}
      <div style={{ marginBottom: rango === "personalizado" ? 8 : 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {RANGOS.map(r => (
            <Chip key={r.key} activo={rango === r.key} onClick={() => setRango(r.key)} style={{ width: "100%", justifyContent: "center" }}>
              {r.label}
            </Chip>
          ))}
        </div>
      </div>
      {rango === "personalizado" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12, fontSize: 13 }}>
          <span style={{ color: "var(--muted)", fontWeight: 600 }}>Desde</span>
          <input type="date" value={rangoCustom.desde} max={rangoCustom.hasta} onChange={e => setRangoCustom(c => ({ ...c, desde: e.target.value }))}
            style={{ fontSize: 13, padding: "7px 9px", borderRadius: 9, border: "1px solid var(--line2)", background: "var(--card)", color: "var(--text)" }} />
          <span style={{ color: "var(--muted)", fontWeight: 600 }}>hasta</span>
          <input type="date" value={rangoCustom.hasta} min={rangoCustom.desde} max={hoyStr} onChange={e => setRangoCustom(c => ({ ...c, hasta: e.target.value }))}
            style={{ fontSize: 13, padding: "7px 9px", borderRadius: 9, border: "1px solid var(--line2)", background: "var(--card)", color: "var(--text)" }} />
        </div>
      )}

      {/* Avisos */}
      {avisos.length > 0 && (
        <div style={{ display: "grid", gap: 6, marginBottom: 16 }}>
          {avisos.map((a, i) => (
            <div key={i} style={{ padding: "10px 14px", borderRadius: 12, background: a.bg, borderLeft: `4px solid ${a.border}`, fontSize: 13, fontWeight: 600, color: a.color }}>
              {a.text}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, background: "var(--card)", borderRadius: 14, padding: 4, boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
          {TABS.filter(t => t.key !== "exportar" || puedeExportar).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "7px 3px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, background: tab === t.key ? "var(--text)" : "transparent", color: tab === t.key ? "var(--card)" : "var(--muted)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, minWidth: 0, lineHeight: 1.1 }}>
              <span style={{ fontSize: 15 }}>{t.icon}</span><span style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB RESUMEN ── */}
      {tab === "resumen" && (
        <div style={{ display: "grid", gap: 16 }}>
          {/* KPIs principales */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <KPI label="Total recaudado"    value={`$ ${fmt(totalRecaudado)}`}    color="var(--ok-ink)" bg="var(--ok-soft)" />
            <KPI label="Efectivo"           value={`$ ${fmt(totalEfectivo)}`}     color="var(--accent)" sub={pct(totalEfectivo, totalRecaudado)} />
            <KPI label="Transferencias"     value={`$ ${fmt(totalTransferencia)}`}color="var(--violet)" sub={pct(totalTransferencia, totalRecaudado)} />
            <KPI label="Cobro en campo"     value={`$ ${fmt(totalCampo)}`}        color="var(--accent-ink)" sub={pct(totalCampo, totalRecaudado)} />
            <KPI label="Proyección mensual" value={`$ ${fmt(proyeccionMensual)}`} color="var(--muted2)" sub="~26 días L-S" />
          </div>

          {/* Comparativa mes anterior */}
          {comparativaMes && (
            <div style={{ ...card, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", padding: "14px 20px" }}>
              <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>vs mes anterior:</span>
              <span style={{ fontSize: 14 }}>$ {fmt(comparativaMes.totalAnt)}</span>
              {comparativaMes.delta !== null && (
                <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: comparativaMes.delta >= 0 ? "var(--ok-soft)" : "var(--bad-soft)", color: comparativaMes.delta >= 0 ? "var(--ok-ink)" : "var(--bad-ink)" }}>
                  {comparativaMes.delta >= 0 ? "▲" : "▼"} {Math.abs(Math.round(comparativaMes.delta))}%
                </span>
              )}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {/* Gráfico diario */}
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Recaudo diario — últimos 14 días</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 110 }}>
                {recaudoDiario.map(({ fecha, total, label }) => {
                  const h = total === 0 ? 2 : Math.max(5, Math.round((total / maxDiario) * 110));
                  const isHoy = fecha === hoyStr;
                  return (
                    <div key={fecha} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }} title={`$ ${fmt(total)}`}>
                      {total > 0 && <div style={{ fontSize: 8, color: isHoy ? "var(--accent)" : "var(--faint)", fontWeight: 700 }}>${fmt(total / 1000)}k</div>}
                      <div style={{ width: "100%", height: h, borderRadius: "4px 4px 0 0", background: isHoy ? "var(--accent)" : total === 0 ? "var(--line)" : "var(--accent-line)" }} />
                      <div style={{ fontSize: 8, color: isHoy ? "var(--accent)" : "var(--faint)", fontWeight: isHoy ? 700 : 400, textAlign: "center" }}>{label.split(" ")[0]}<br />{label.split(" ")[1]}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gráfico semanal */}
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Recaudo últimas 4 semanas</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 110 }}>
                {recaudoSemanal.map(({ label, total }, i) => {
                  const h = total === 0 ? 2 : Math.max(5, Math.round((total / maxSemanal) * 110));
                  const isLast = i === recaudoSemanal.length - 1;
                  return (
                    <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <div style={{ fontSize: 10, color: isLast ? "var(--accent)" : "var(--faint)", fontWeight: 700 }}>${fmt(total / 1000)}k</div>
                      <div style={{ width: "100%", height: h, borderRadius: "6px 6px 0 0", background: isLast ? "var(--accent)" : "var(--accent-line)" }} />
                      <div style={{ fontSize: 11, color: isLast ? "var(--accent)" : "var(--muted)", fontWeight: isLast ? 700 : 400, textAlign: "center" }}>{label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recaudo por grupo */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Recaudo por grupo de inversión</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {reporteGrupos.map(g => (
                <div key={g.grupo} onClick={() => onNavigate?.("motos", "grupo:" + g.grupo)} style={{ flex: 1, minWidth: 160, borderRadius: 14, border: `2px solid ${GRUPO_COLORS[g.grupo]}`, padding: "14px 16px", cursor: "pointer" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: GRUPO_COLORS[g.grupo], marginBottom: 10 }}>{g.grupo}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                    {[
                      { label: "Motos asignadas", value: g.motosAsignadas, color: "var(--text)" },
                      { label: "Recaudo período", value: `$${fmt(g.recaudo)}`, color: GRUPO_COLORS[g.grupo] },
                      { label: "Contratos activos", value: g.contratosActivos, color: "var(--ok-ink)" },
                      { label: "En mora", value: g.enMora, color: g.enMora > 0 ? "var(--bad-ink)" : "var(--ok-ink)" },
                    ].map(k => (
                      <div key={k.label} style={{ padding: "8px 10px", borderRadius: 10, background: "var(--soft2)", textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: k.color }}>{k.value}</div>
                        <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, marginTop: 2, textTransform: "uppercase" }}>{k.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top pagadores */}
          {topPagadores.length > 0 && (
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Top pagadores — {RANGOS.find(r => r.key === rango)?.label}</div>
              <div style={{ display: "grid", gap: 8 }}>
                {topPagadores.map((p, i) => (
                  <div key={p.clienteId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 10, background: i === 0 ? "var(--ok-soft)" : "var(--soft2)" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 999, background: i === 0 ? "var(--ok)" : i === 1 ? "var(--muted)" : i === 2 ? "var(--warn2)" : "var(--line)", color: i < 3 ? "var(--card)" : "var(--faint)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, fontWeight: 700, textTransform: "uppercase", fontSize: 13 }}>{p.nombre}</div>
                    <div style={{ fontWeight: 700, color: "var(--ok-ink)" }}>$ {fmt(p.total)}</div>
                    {onNavigate && (
                      <button onClick={() => onNavigate("ficha_cliente", p.clienteId)} style={{ padding: "3px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--accent-soft2)", color: "var(--accent)" }}>
                        Ver ficha
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB GESTIÓN POR ADMINISTRADOR (nómina) ── */}
      {/* ── TAB POR ADMIN (cada moto muestra su GRUPO) ── */}
      {tab === "admins" && (
        <div style={{ display: "grid", gap: 16 }}>
          {/* Nota: el recaudo se cuenta por el cobrador que tiene la moto HOY (el sistema no guarda la fecha de asignación) */}
          <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--accent-soft2)", border: "1px solid var(--accent-line)", fontSize: 12.5, color: "var(--accent-ink)", lineHeight: 1.45 }}>
            ℹ️ El recaudo se atribuye al cobrador que tiene la moto <b>actualmente</b>. Si una moto cambió de cobrador dentro del período, todo su recaudo aparece en el cobrador de ahora.
          </div>
          {/* Filtros combinables (grupo · cobrador · modalidad · estado) */}
          <FiltrosGestion filtros={filtros} setFiltros={setFiltros} subadmins={subadmins} resumen={filtrosResumen} />
          <CabeceraGestion totMotos={gTotMotos} alDia={gAlDia} parcial={gParcial} noPago={gNoPago} retenidas={gRetenidas} debenSinConvenio={gDebenSinConv} totRec={gTotRec} rangoLabel={rangoLabel} desde={desde} hasta={hasta}
            nota={filtrosActivos ? `filtrado: ${filtrosResumen}` : "toca un cobrador para ver sus motos · cada moto muestra su grupo"} onExport={puedeExportar ? () => setDescarga("admin") : undefined} />
          {/* C1 — comparación de recaudo vs período anterior */}
          <div style={{ ...card, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 12.5 }}>
            <span style={{ color: "var(--muted)" }}>Recaudo del período: <b style={{ color: "var(--text)" }}>$ {fmt(gTotRec)}</b> <span style={{ color: "var(--faint)" }}>· anterior $ {fmt(recaudoAnterior)}</span></span>
            {deltaRec.up !== null && <span style={{ fontWeight: 800, color: deltaRec.up ? "var(--ok-ink)" : "var(--bad-ink)", background: deltaRec.up ? "var(--ok-soft)" : "var(--bad-soft)", borderRadius: 8, padding: "2px 9px" }}>{deltaRec.txt} vs anterior</span>}
          </div>
          {/* C3 — ranking de cobradores */}
          {rankingCobradores.length > 1 && (
            <div style={{ ...card, display: "grid", gap: 9 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>🏆 Ranking por cumplimiento</div>
              {rankingCobradores.map((b, i) => (
                <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, minWidth: 0 }}>
                  <span style={{ width: 16, textAlign: "center", fontWeight: 800, color: "var(--faint)", flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ flex: 1, minWidth: 0, fontWeight: 700, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.nombre}</span>
                  <div style={{ width: 56, height: 6, background: "var(--soft)", borderRadius: 999, overflow: "hidden", flexShrink: 0 }}>
                    <div style={{ width: `${b.pctv}%`, height: "100%", background: pctFillG(b.pctv) }} />
                  </div>
                  <span style={{ width: 36, textAlign: "right", fontWeight: 800, color: pctColorG(b.pctv), flexShrink: 0 }}>{b.pctv}%</span>
                  <span style={{ width: 74, textAlign: "right", fontSize: 12, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>$ {fmt(b.recaudado)}</span>
                </div>
              ))}
            </div>
          )}
          <GestionBloques bloques={porAdminData} modo="admin" expandido={expandidoGestion} onToggle={(k) => setExpandidoGestion(expandidoGestion === k ? null : k)} />
        </div>
      )}

      {/* ── TAB NÓMINA de cobradores (regla del dueño, 22-ago) ── */}
      {tab === "nomina" && (() => {
        const fmtDia = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
        const nombreDe = (id: string | null) => id === null ? null : (subadmins.find(s => s.id === id)?.nombre ?? "COBRADOR");
        const TIPO_TXT: Record<TipoGestion, string> = {
          ciclo: "Ciclo a tiempo", ciclo_atrasado: "Ciclo atrasado (30%)",
          prorrateo: "Prorrateo", retencion: "Retención",
          cuota_convenio: "Convenio de retenida (30%)",
        };
        const conCobrador = nominas.filter(n => n.subadminId !== null);
        const sinCobrador = nominas.find(n => n.subadminId === null);
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
              ciclo atrasado que entra después <b>$ {fmt(VALOR_ATRASADO)}</b> (30%) · cuota de convenio cobrada <b>$ {fmt(VALOR_ATRASADO)}</b> (30%, cuando entra) ·
              retención <b>$ {fmt(VALOR_RETENCION)}</b> (una sola vez, la semana en que se retiene) ·
              en mora sin pagar y sin retener <b>$ 0</b>. Los contratos <b>Diarios no entran</b>.
            </div>

            {/* Semana anterior al registro exacto (mig 112): las cifras salen del método viejo. */}
            {!eventosNomina && (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-ink)", fontSize: 12.5, color: "var(--warn-ink)", lineHeight: 1.5 }}>
                ⚠️ Esta semana no tiene el registro exacto de ciclos (existe desde la migración 112).
                Las cifras salen del método antiguo: <b>revísalas contra el desprendible antes de pagar</b>.
                Desde la primera semana completa después de la migración, la nómina es exacta.
              </div>
            )}

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
                        {n.renglones.length} gestiones
                      </div>
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
                    <div style={{ fontWeight: 800, fontSize: 20, fontVariantNumeric: "tabular-nums" }}>$ {fmt(n.total)}</div>
                    <button onClick={() => setNominaExp(abierto ? null : (n.subadminId ?? ""))}
                      style={{ border: "1px solid var(--line)", background: "var(--soft2)", color: "var(--text)", borderRadius: 10, padding: "8px 12px", fontWeight: 700, cursor: "pointer", fontSize: 12.5 }}>
                      {abierto ? "Ocultar detalle" : "Ver detalle"}
                    </button>
                    <button onClick={() => generarDesprendibleNomina(n, nombreDe(n.subadminId) ?? "", lunesNomina, domingoNomina, profile?.nombre ?? "")}
                      style={{ border: "none", background: "var(--accent)", color: "#0f172a", borderRadius: 10, padding: "8px 12px", fontWeight: 700, cursor: "pointer", fontSize: 12.5 }}>
                      🖨️ Desprendible
                    </button>
                  </div>
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
          </div>
        );
      })()}

      {/* ── TAB POR GRUPO (cada moto muestra QUIÉN la tiene asignada) ── */}
      {tab === "grupos" && (
        <div style={{ display: "grid", gap: 16 }}>
          <FiltrosGestion filtros={filtros} setFiltros={setFiltros} subadmins={subadmins} resumen={filtrosResumen} />
          <CabeceraGestion totMotos={gTotMotos} alDia={gAlDia} parcial={gParcial} noPago={gNoPago} retenidas={gRetenidas} debenSinConvenio={gDebenSinConv} totRec={gTotRec} rangoLabel={rangoLabel} desde={desde} hasta={hasta}
            nota={filtrosActivos ? `filtrado: ${filtrosResumen}` : "toca un grupo para ver sus motos · cada moto muestra quién la tiene asignada"} onExport={puedeExportar ? () => setDescarga("grupo") : undefined} />
          <GestionBloques bloques={porGrupoData} modo="grupo" expandido={expandidoGestion} onToggle={(k) => setExpandidoGestion(expandidoGestion === k ? null : k)} />
        </div>
      )}

      {/* ── TAB VISITAS por administrador ── */}
      {tab === "visitas" && (() => {
        const tVis = visitasData.reduce((s, a) => s + a.total, 0);
        const tAprob = visitasData.reduce((s, a) => s + a.aprobadas, 0);
        const tRech = visitasData.reduce((s, a) => s + a.rechazadas, 0);
        const tPend = visitasData.reduce((s, a) => s + a.pendientes, 0);
        const resLabel = (est: string, res: string | null) => est === "Pendiente" ? "⏳ Pendiente" : res === "Aprobado" ? "✓ Aprobado" : res === "Rechazado" ? "✗ Rechazado" : res === "Repetir" ? "↻ Repetir" : "—";
        const resColor = (est: string, res: string | null) => est === "Pendiente" ? "var(--warn-ink)" : res === "Aprobado" ? "var(--ok-ink)" : res === "Rechazado" ? "var(--bad-ink)" : "var(--muted)";
        const badge = (n: number, txt: string, color: string, bg: string) => n > 0 ? <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 8, padding: "2px 7px", whiteSpace: "nowrap" }}>{n} {txt}</span> : null;
        return (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
              <KPI label="Visitas" value={`${tVis}`} />
              <KPI label="Aprobadas" value={`${tAprob}`} color="var(--ok-ink)" bg="var(--ok-soft)" />
              <KPI label="Rechazadas" value={`${tRech}`} color="var(--bad-ink)" bg="var(--bad-soft)" />
              <KPI label="Pendientes" value={`${tPend}`} color="var(--warn-ink)" bg="var(--warn-soft)" />
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
      {tab === "cartera" && (
        <div style={{ display: "grid", gap: 16 }}>
          {/* KPI cartera */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
            <KPI label="Al día"       value={String(contratosActivos.length - enMora.length)} color="var(--ok-ink)" bg="var(--ok-soft)" />
            <KPI label="En mora"      value={String(enMora.length - enMoraCritica)}           color="var(--warn-ink)" bg="var(--warn-soft2)" />
            <KPI label="Mora crítica" value={String(enMoraCritica)}                            color="var(--bad-ink)" bg="var(--bad-soft)" />
            <KPI label="Deuda total"  value={`$ ${fmt(deudaTotalCartera)}`} color="var(--bad-ink)" />
          </div>

          {/* Barras cartera */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Estado cartera ({contratosActivos.length} contratos)</div>
            <Barra label="Al día"       valor={contratosActivos.length - enMora.length} total={contratosActivos.length} color="var(--ok)" />
            <Barra label="En mora"      valor={enMora.length - enMoraCritica}           total={contratosActivos.length} color="var(--warn2)" />
            <Barra label="Mora crítica" valor={enMoraCritica}                            total={contratosActivos.length} color="var(--bad)" />
          </div>

          {/* Contratos por modalidad */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Contratos por modalidad</div>
            {contratosPorForma.map(([forma, count]) => (
              <BarraN key={forma} label={forma} valor={count} total={contratosActivos.length} color="var(--accent)" />
            ))}
          </div>

          {/* Mora detallada — cards en móvil, tabla en desktop */}
          {moraDetallada.length > 0 && (
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "var(--bad-ink)" }}>
                🔴 Mora detallada — {moraDetallada.length} contrato{moraDetallada.length > 1 ? "s" : ""}
              </div>

              {isMobile ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {moraDetallada.map(m => (
                    <div
                      key={m.id}
                      onClick={() => onNavigate?.("ficha_cliente", m.clienteId)}
                      style={{ padding: "12px 14px", borderRadius: 14, background: m.diasSinPago > 7 ? "var(--bad-soft)" : "var(--warn-soft2)", border: `1px solid ${m.diasSinPago > 7 ? "var(--bad-line)" : "var(--warn-line)"}`, cursor: "pointer" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 13 }}>{m.cliente}</span>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--muted2)" }}>{m.placa}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontWeight: 700, fontSize: 12, background: m.diasSinPago > 7 ? "var(--bad-soft)" : "var(--warn-soft)", color: m.diasSinPago > 7 ? "var(--bad-ink)" : "var(--warn-ink)" }}>{m.diasSinPago}d sin pago</span>
                        <span style={{ fontWeight: 700, color: "var(--bad-ink)", fontSize: 14 }}>$ {fmt(m.deudaPendiente)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
                        Último pago: {m.ultimoPago ? new Date(m.ultimoPago + "T00:00:00").toLocaleDateString("es-CO") : <span style={{ color: "var(--faint)" }}>Sin pagos</span>}
                      </div>
                      {onNavigate && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={e => { e.stopPropagation(); onNavigate("ficha_cliente", m.clienteId); }}
                            style={{ padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--accent-soft2)", color: "var(--accent)" }}
                          >👤 Ver cliente</button>
                          {m.motoId && (
                            <button
                              onClick={e => { e.stopPropagation(); onNavigate("ficha_moto", m.motoId!); }}
                              style={{ padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--ok-soft)", color: "var(--ok-ink)" }}
                            >🏍️ Ver moto</button>
                          )}
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
                        {["Cliente","Placa","Días sin pago","Deuda pendiente","Último pago",""].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: "var(--muted)", fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {moraDetallada.map(m => (
                        <tr key={m.id} onClick={() => onNavigate?.("ficha_cliente", m.clienteId)} style={{ borderBottom: "1px solid var(--soft)", cursor: "pointer" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 700, textTransform: "uppercase" }}>{m.cliente}</td>
                          <td style={{ padding: "8px 10px" }}>{m.placa}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontWeight: 700, fontSize: 12, background: m.diasSinPago > 7 ? "var(--bad-soft)" : "var(--warn-soft)", color: m.diasSinPago > 7 ? "var(--bad-ink)" : "var(--warn-ink)" }}>{m.diasSinPago}d</span>
                          </td>
                          <td style={{ padding: "8px 10px", fontWeight: 700, color: "var(--bad-ink)" }}>$ {fmt(m.deudaPendiente)}</td>
                          <td style={{ padding: "8px 10px", color: "var(--muted)" }}>{m.ultimoPago ? new Date(m.ultimoPago + "T00:00:00").toLocaleDateString("es-CO") : <span style={{ color: "var(--faint)" }}>Sin pagos</span>}</td>
                          <td style={{ padding: "8px 6px" }}>
                            {onNavigate && (
                              <div style={{ display: "flex", gap: 4 }}>
                                <button onClick={e => { e.stopPropagation(); onNavigate("ficha_cliente", m.clienteId); }} style={{ padding: "3px 7px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--accent-soft2)", color: "var(--accent)" }}>👤</button>
                                {m.motoId && <button onClick={e => { e.stopPropagation(); onNavigate("ficha_moto", m.motoId!); }} style={{ padding: "3px 7px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--ok-soft)", color: "var(--ok-ink)" }}>🏍️</button>}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
        <div style={{ display: "grid", gap: 16 }}>
          {/* KPI flota */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
            <KPI label="Total motos"      value={String(motos.length)}                                                        color="var(--muted2)" />
            <KPI label="Asignadas"        value={String(motos.filter(m => m.estado === "Asignada").length)}                   color="var(--ok-ink)" bg="var(--ok-soft)" />
            <KPI label="Disponibles"      value={String(motos.filter(m => m.estado === "Disponible").length)}                 color="var(--accent)" />
            <KPI label="En taller"        value={String(motos.filter(m => m.estado === "Mantenimiento").length)}                  color="var(--warn-ink)" />
            <KPI label="Retenciones"      value={String(motos.filter(m => ["Fiscalia","Transito","Garantia"].includes(m.estado as string)).length)} color="var(--bad-ink)" bg="var(--bad-soft)" />
            <KPI label="Clientes activos" value={String(clientesActivos)}                                                     color="var(--ok-ink)" />
            <KPI label="En proceso"       value={String(clientesEnProceso)}                                                   color="var(--warn-ink)" />
            <KPI label="Nuevos este mes"  value={String(clientesNuevosMes)}                                                   color="var(--accent)" />
          </div>

          {/* Flota por estado */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Flota por estado ({motos.length} motos)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8 }}>
              {motosPorEstado.map(([estado, count]) => {
                const color = ESTADO_MOTO_COLOR[estado] ?? "var(--muted2)";
                return (
                  <div key={estado} style={{ padding: "10px 12px", borderRadius: 12, background: "var(--soft2)", border: "1px solid var(--line)", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color }}>{count}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 2 }}>{estado}</div>
                    <div style={{ fontSize: 10, color: "var(--faint)" }}>{pct(count, motos.length)}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 14 }}>
              {motosPorEstado.map(([estado, count]) => (
                <BarraN key={estado} label={estado} valor={count} total={motos.length} color={ESTADO_MOTO_COLOR[estado] ?? "var(--faint)"} />
              ))}
            </div>
          </div>

          {/* Vencimientos */}
          {alertasVencimiento.length > 0 && (
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "var(--warn-ink)" }}>📋 Documentos venciendo — próximos 30 días</div>

              {isMobile ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {alertasVencimiento.map(a => (
                    <div key={a.id} style={{ padding: "12px 14px", borderRadius: 14, background: "var(--warn-soft2)", border: "1px solid var(--warn-line)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{a.placa}</span>
                        {onNavigate && (
                          <button onClick={() => onNavigate("ficha_moto", a.id)} style={{ padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--ok-soft)", color: "var(--ok-ink)" }}>🏍️ Ver moto</button>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                        <div>
                          <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>SOAT vence</div>
                          <div style={{ color: (a.diasSeguro ?? 999) < 0 ? "var(--bad-ink)" : "var(--muted2)" }}>{a.seguro ? new Date(a.seguro + "T00:00:00").toLocaleDateString("es-CO") : "—"}</div>
                          {a.diasSeguro !== null && (
                            <span style={{ display: "inline-block", marginTop: 4, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: a.diasSeguro < 0 ? "var(--bad-soft)" : a.diasSeguro < 10 ? "var(--warn-soft)" : "var(--ok-soft)", color: a.diasSeguro < 0 ? "var(--bad-ink)" : a.diasSeguro < 10 ? "var(--warn-ink)" : "var(--ok-ink)" }}>
                              {a.diasSeguro < 0 ? `${Math.abs(a.diasSeguro)}d vencida` : `${a.diasSeguro}d`}
                            </span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Tecno vence</div>
                          <div style={{ color: (a.diasTecno ?? 999) < 0 ? "var(--bad-ink)" : "var(--muted2)" }}>{a.tecno ? new Date(a.tecno + "T00:00:00").toLocaleDateString("es-CO") : "—"}</div>
                          {a.diasTecno !== null && (
                            <span style={{ display: "inline-block", marginTop: 4, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: a.diasTecno < 0 ? "var(--bad-soft)" : a.diasTecno < 10 ? "var(--warn-soft)" : "var(--ok-soft)", color: a.diasTecno < 0 ? "var(--bad-ink)" : a.diasTecno < 10 ? "var(--warn-ink)" : "var(--ok-ink)" }}>
                              {a.diasTecno < 0 ? `${Math.abs(a.diasTecno)}d vencida` : `${a.diasTecno}d`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--line)" }}>
                        {["Placa","SOAT vence","Días","Tecno vence","Días",""].map((h, i) => (
                          <th key={i} style={{ textAlign: "left", padding: "8px 10px", color: "var(--muted)", fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {alertasVencimiento.map(a => (
                        <tr key={a.id} style={{ borderBottom: "1px solid var(--soft)" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 700 }}>{a.placa}</td>
                          <td style={{ padding: "8px 10px", color: (a.diasSeguro ?? 999) < 0 ? "var(--bad-ink)" : "var(--muted2)" }}>
                            {a.seguro ? new Date(a.seguro + "T00:00:00").toLocaleDateString("es-CO") : "—"}
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            {a.diasSeguro !== null && (
                              <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: a.diasSeguro < 0 ? "var(--bad-soft)" : a.diasSeguro < 10 ? "var(--warn-soft)" : "var(--ok-soft)", color: a.diasSeguro < 0 ? "var(--bad-ink)" : a.diasSeguro < 10 ? "var(--warn-ink)" : "var(--ok-ink)" }}>
                                {a.diasSeguro < 0 ? `${Math.abs(a.diasSeguro)}d vencida` : `${a.diasSeguro}d`}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "8px 10px", color: (a.diasTecno ?? 999) < 0 ? "var(--bad-ink)" : "var(--muted2)" }}>
                            {a.tecno ? new Date(a.tecno + "T00:00:00").toLocaleDateString("es-CO") : "—"}
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            {a.diasTecno !== null && (
                              <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: a.diasTecno < 0 ? "var(--bad-soft)" : a.diasTecno < 10 ? "var(--warn-soft)" : "var(--ok-soft)", color: a.diasTecno < 0 ? "var(--bad-ink)" : a.diasTecno < 10 ? "var(--warn-ink)" : "var(--ok-ink)" }}>
                                {a.diasTecno < 0 ? `${Math.abs(a.diasTecno)}d vencida` : `${a.diasTecno}d`}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "8px 6px" }}>
                            {onNavigate && (
                              <button onClick={() => onNavigate("ficha_moto", a.id)} style={{ padding: "3px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--ok-soft)", color: "var(--ok-ink)" }}>🏍️ Ficha</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
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
                <div style={{ display: "grid", gap: 12 }}>
                  {conveniosRep.map(c => (
                    <div key={c.convenioId} style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${c.atrasado > 0 ? "var(--bad-line)" : "var(--line)"}`, background: "var(--card)", display: "grid", gap: 8, minWidth: 0 }}>
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

      {/* ── GUARDADAS: las motos que no están produciendo ─────────────────────────────────── */}
      {tab === "guardadas" && (() => {
        const enBodega = guardadas.filter(g => /bodega/i.test(g.donde)).length;
        const enTaller = guardadas.filter(g => /taller/i.test(g.donde)).length;
        const legal = guardadas.filter(g => /fiscal|tránsito|transito|patios/i.test(g.donde)).length;
        const sinReg = guardadas.filter(g => g.sinRegistro).length;
        const masDe30 = guardadas.filter(g => (g.dias ?? 0) > 30).length;
        const diasTotal = guardadas.reduce((s, g) => s + (g.dias ?? 0), 0);

        function excelGuardadas() {
          const cols: ColX[] = [
            { label: "Placa", ancho: 80 }, { label: "Cliente", ancho: 200 },
            { label: "Motivo", ancho: 190 }, { label: "Dónde está", ancho: 110 },
            { label: "Guardada desde", align: "center", ancho: 100 },
            { label: "Días", align: "center", ancho: 55 },
            { label: "Encargado", ancho: 150 },
          ];
          const secciones: SeccionX[] = guardadasAgrupadas.map(g => ({
            titulo: `${g.clave.toUpperCase()}   —   ${g.filas.length} moto${g.filas.length === 1 ? "" : "s"} · ${g.dias} días acumulados sin producir`,
            color: guardadasPor === "grupo" ? (GRUPO_HEX[g.clave] ?? "#334155") : "#334155",
            filas: g.filas.map(f => [
              f.placa, f.clienteNombre.toUpperCase(), f.motivo, f.donde,
              { v: f.desde ? fmtFechaCorta(f.desde) : "sin registro", align: "center" as const, color: f.sinRegistro ? "#991b1b" : undefined },
              { v: f.dias == null ? "—" : String(f.dias), align: "center" as const, bold: (f.dias ?? 0) > 30, color: (f.dias ?? 0) > 30 ? "#991b1b" : undefined },
              f.subadminNombre.toUpperCase(),
            ]),
          }));
          descargarExcel({
            archivo: `motos_guardadas_${hoyISO()}`,
            titulo: "Motos guardadas — no están produciendo",
            periodo: `Al ${new Date(hoyISO() + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}`,
            leyenda: "Una moto guardada no genera arriendo. 'Sin registro' = figura guardada pero no tiene recepción que lo respalde.",
            columnas: cols, secciones,
            totalGeneral: [{ v: `TOTAL: ${guardadas.length} motos guardadas`, bold: true }, "", "", "", "", { v: String(diasTotal), align: "center" as const, bold: true }, ""],
          });
        }

        return (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
              <KPI label="Guardadas"        value={String(guardadas.length)} color="var(--bad-ink)" bg="var(--bad-soft)" />
              <KPI label="En bodega"        value={String(enBodega)}         color="var(--warn-ink)" />
              <KPI label="En taller"        value={String(enTaller)}         color="var(--accent)" />
              <KPI label="Retención legal"  value={String(legal)}            color="var(--violet)" />
              <KPI label="Más de 30 días"   value={String(masDe30)}          color="var(--bad-ink)" bg={masDe30 > 0 ? "var(--bad-soft)" : undefined} />
              <KPI label="Sin registro"     value={String(sinReg)}           color={sinReg > 0 ? "var(--bad-ink)" : "var(--muted2)"} />
            </div>

            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Motos que no están produciendo</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    {guardadas.length} guardadas · {diasTotal} días acumulados sin generar arriendo
                  </div>
                </div>
                <button onClick={excelGuardadas} disabled={guardadas.length === 0}
                  style={{ padding: "8px 14px", borderRadius: 10, border: "none", cursor: guardadas.length ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 13, background: "var(--ok-soft)", color: "var(--ok-ink)", opacity: guardadas.length ? 1 : 0.5 }}>
                  ⬇️ Excel
                </button>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: "var(--muted)", alignSelf: "center", fontWeight: 700 }}>Agrupar por:</span>
                {([["grupo", "📁 Portafolio"], ["encargado", "👤 Encargado"], ["donde", "📍 Dónde está"]] as const).map(([k, l]) => (
                  <button key={k} onClick={() => setGuardadasPor(k)}
                    style={{ padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
                      background: guardadasPor === k ? "var(--text)" : "var(--soft2)", color: guardadasPor === k ? "var(--card)" : "var(--muted2)" }}>
                    {l}
                  </button>
                ))}
              </div>

              {guardadas.length === 0 ? (
                <div style={{ color: "var(--ok-ink)", fontSize: 14, fontWeight: 700, background: "var(--ok-soft)", borderRadius: 12, padding: "14px 16px" }}>
                  ✓ Ninguna moto guardada — toda la flota está produciendo.
                </div>
              ) : guardadasAgrupadas.map(g => (
                <div key={g.clave} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "var(--soft2)", marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.clave}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {g.filas.length} moto{g.filas.length === 1 ? "" : "s"} · {g.dias}d
                    </span>
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {g.filas.map(f => (
                      <div key={f.motoId} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--card)", display: "grid", gap: 6, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                            <Placa placa={f.placa} grupo={f.grupo} size="sm" />
                            <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.clienteNombre}</span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap",
                            background: f.dias == null ? "var(--bad-soft)" : (f.dias > 30 ? "var(--bad-soft)" : f.dias > 7 ? "var(--warn-soft)" : "var(--soft2)"),
                            color: f.dias == null ? "var(--bad-ink)" : (f.dias > 30 ? "var(--bad-ink)" : f.dias > 7 ? "var(--warn-ink)" : "var(--muted2)") }}>
                            {f.dias == null ? "⚠️ sin registro" : `${f.dias} día${f.dias === 1 ? "" : "s"} guardada`}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.5 }}>
                          <strong>{f.motivo}</strong> · 📍 {f.donde}
                          {f.desde && <> · desde el {fmtFechaCorta(f.desde)}</>}
                          {guardadasPor !== "encargado" && <> · 👤 {f.subadminNombre}</>}
                          {guardadasPor !== "grupo" && <> · 📁 {f.grupo}</>}
                        </div>
                        {f.sinRegistro && (
                          <div style={{ fontSize: 11.5, color: "var(--bad-ink)", fontWeight: 700 }}>
                            Figura guardada pero no tiene recepción registrada — no se sabe desde cuándo ni quién la recibió.
                          </div>
                        )}
                        {onNavigate && (
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button onClick={() => onNavigate("ficha_moto", f.motoId)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 700, background: "var(--accent-soft2)", color: "var(--accent-ink)" }}>🏍️ Ver moto</button>
                            <button onClick={() => onNavigate("inmovilizaciones")} style={{ padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 700, background: "var(--soft2)", color: "var(--muted2)" }}>🔒 Inmovilizaciones</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {tab === "entregas" && (
        <div style={{ display: "grid", gap: 16 }}>
          {/* Filtro por grupo */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Todos", ...GRUPOS].map(g => {
              const activo = grupoEnt === g;
              const color = g === "Todos" ? "var(--text)" : GRUPO_COLORS[g];
              return (
                <button key={g} onClick={() => setGrupoEnt(g)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, border: `1.5px solid ${activo ? color : "var(--line)"}`, cursor: "pointer", fontSize: 12, fontWeight: 700, background: activo ? color : "var(--card)", color: activo ? "var(--card)" : "var(--muted)" }}>
                  {g !== "Todos" && <span style={{ width: 8, height: 8, borderRadius: 999, background: activo ? "var(--card)" : color }} />}
                  {g}
                </button>
              );
            })}
          </div>

          {/* KPIs de entregas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <KPI label="Motos entregadas"   value={String(entregas.length)}       color="var(--text)" />
            <KPI label="Documentación completa"   value={String(entregasCompletas)}   color="var(--ok-ink)" bg="var(--ok-soft)" />
            <KPI label="Documentación incompleta" value={String(entregasIncompletas)} color="var(--bad-ink)" bg={entregasIncompletas > 0 ? "var(--bad-soft)" : "var(--card)"} />
            <KPI label="Con fotos de entrega"     value={String(entregasConFotos)}    color="var(--accent)" />
          </div>

          {/* Botón imprimir/enviar */}
          <button onClick={imprimirEntregas} disabled={entregas.length === 0} style={{ padding: "12px 18px", borderRadius: 14, border: "none", cursor: entregas.length === 0 ? "default" : "pointer", fontWeight: 700, fontSize: 14, background: entregas.length === 0 ? "var(--line)" : "var(--accent)", color: entregas.length === 0 ? "var(--faint)" : "var(--card)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            🖨️ Imprimir reporte para los socios
          </button>

          {/* Regenerar documentos en blanco (solo ADMIN/AP) — bug histórico del PDF */}
          {esAdmin && (
            <div style={{ ...card, padding: "14px 16px", border: "1px solid var(--warn-line)", background: "var(--warn-soft2)" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--warn-ink)", marginBottom: 4 }}>🔄 Regenerar documentos en blanco</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                Vuelve a armar el contrato y pagaré de las entregas cuyo PDF salió en blanco, usando las firmas y huellas ya guardadas. Nadie tiene que volver a firmar. Úsalo una vez; los que no tengan firma guardada se omiten.
              </div>
              <button
                onClick={regenerarDocumentosEnBlanco}
                disabled={regen.estado === "buscando" || regen.estado === "regenerando"}
                style={{ padding: "10px 16px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 13, background: "var(--warn)", color: "var(--card)", cursor: regen.estado === "buscando" || regen.estado === "regenerando" ? "default" : "pointer", opacity: regen.estado === "buscando" || regen.estado === "regenerando" ? 0.6 : 1 }}
              >
                {regen.estado === "buscando" ? "Buscando…"
                  : regen.estado === "regenerando" ? `Regenerando ${regen.hechos} de ${regen.total}…`
                  : "🔄 Buscar y regenerar"}
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
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 18 }}>{e.placa}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: GRUPO_COLORS[e.grupo] ?? "var(--muted)", background: "var(--soft2)", border: `1px solid ${GRUPO_COLORS[e.grupo] ?? "var(--line)"}`, borderRadius: 999, padding: "1px 8px" }}>{e.grupo}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", color: "var(--muted2)", marginTop: 4 }}>{e.cliente}</div>
                      <div style={{ fontSize: 12, color: "var(--faint)" }}>C.C. {e.cedula}</div>
                    </div>
                    <span style={{ flexShrink: 0, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: e.docsOk ? "var(--ok-soft)" : "var(--bad-soft)", color: e.docsOk ? "var(--ok-ink)" : "var(--bad-ink)" }}>
                      {e.docsOk ? "✓ Completo" : "⚠ Incompleto"}
                    </span>
                  </div>

                  {/* Fecha + km */}
                  <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                    <span>📅 {new Date(e.fecha + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    {e.km != null && <span>⏱️ {fmt(e.km)} km</span>}
                  </div>

                  {/* Documentos */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: e.nFotos > 0 ? 12 : 0 }}>
                    {[
                      { key: "contrato", label: "📄 Contrato", ok: e.docs.contrato, url: e.urls.contrato },
                      { key: "pagare", label: "📝 Pagaré", ok: e.docs.pagare, url: e.urls.pagare },
                      { key: "certificado", label: "🪪 Certificado", ok: e.docs.certificado, url: e.urls.certificado },
                      { key: "firma", label: "✍️ Firma", ok: e.docs.firma, url: null },
                    ].map(d => (
                      <button
                        key={d.key}
                        onClick={() => d.url && window.open(d.url, "_blank")}
                        disabled={!d.url}
                        title={d.ok ? (d.url ? "Abrir documento" : "Firmado") : "Falta"}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, padding: "7px 10px", borderRadius: 10, border: "1px solid " + (d.ok ? "var(--ok-line)" : "var(--bad-line)"), background: d.ok ? "var(--ok-soft)" : "var(--bad-soft)", color: d.ok ? "var(--ok-ink)" : "var(--bad-ink)", fontSize: 12, fontWeight: 700, cursor: d.url ? "pointer" : "default", minWidth: 0 }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
                        <span style={{ flexShrink: 0 }}>{d.ok ? (d.url ? "↗" : "✓") : "✗"}</span>
                      </button>
                    ))}
                  </div>

                  {/* Fotos de entrega (miniaturas → lightbox) */}
                  {e.nFotos > 0 && (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                      {e.fotos.slice(0, 6).map(([ang, url]) => (
                        <img
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
                    <button onClick={() => verResumenEntrega(e)} style={{ flex: 1, padding: "6px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#f5f3ff", color: "var(--violet)" }}>📄 Resumen</button>
                    {onNavigate && <button onClick={() => onNavigate("ficha_cliente", e.clienteId)} style={{ flex: 1, padding: "6px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--accent-soft2)", color: "var(--accent)" }}>👤 Cliente</button>}
                    {onNavigate && e.motoId && <button onClick={() => onNavigate("ficha_moto", e.motoId!)} style={{ flex: 1, padding: "6px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--ok-soft)", color: "var(--ok-ink)" }}>🏍️ Moto</button>}
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
                desc: `${moraDetallada.length} contratos en mora · Cliente, Placa, Días, Deuda pendiente, Último pago`,
                onClick: () => {
                  const filas = moraDetallada.map(m => [m.cliente, m.placa, String(m.diasSinPago), String(m.deudaPendiente), m.ultimoPago ?? "Sin pagos"]);
                  exportarCSV(filas, ["Cliente","Placa","Dias sin pago","Deuda pendiente","Ultimo pago"], `mora-${hoyStr}.csv`);
                },
              },
              ...(alertasVencimiento.length > 0 ? [{
                label: "⬇️ CSV — Vencimientos SOAT y Tecno",
                desc: `${alertasVencimiento.length} motos con vencimiento en 30 días`,
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
        const filas = (porAdmin ? porAdminData : porGrupoData).flatMap(b => b.motos);
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
              { titulo: "Estado de pago", de: m => m.estado === "aldia" ? "Al día" : m.estado === "parcial" ? "Parcial" : "No pagó" },
              { titulo: "Modalidad", de: m => m.formaPago },
            ]}
            agrupar={m => porAdmin ? m.adminNombre.toUpperCase() : m.grupo}
            colorSeccion={n => porAdmin ? "#334155" : (GRUPO_HEX[n] ?? "#334155")}
            hojasExtra={hojasOpcionales}
            onCerrar={() => setDescarga(null)}
          />
        );
      })()}
    </div>
  );
}
