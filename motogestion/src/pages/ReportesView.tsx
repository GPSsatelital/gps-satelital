import React, { useMemo, useState, useEffect } from "react";
import type { ViewKey } from "../App";
import { usePagos, esPagoDeCaja } from "../hooks/usePagos";
import { useContratos, diasDesdeUltimoPago, corteMigracionGrupo, ahorroTotal } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { useDeudas } from "../hooks/useDeudas";
import { hoyISO, hoyDate } from "../utils/fecha";
import { useAuth } from "../contexts/AuthContext";
import { Chip } from "../components/atomos";
import { necesitaRegenerar, regenerarDocsContrato } from "../utils/regenerarDocs";
import { generarHTMLResumenEntrega } from "../hooks/useDocumentos";
import { formatDiaPago, valorPeriodoReal } from "../utils/cicloPago";
import Placa from "../components/Placa";
import { useVisitas } from "../hooks/useVisitas";

interface Props {
  onNavigate?: (view: ViewKey, filter?: string) => void;
}

const card: React.CSSProperties = { background: "var(--card)", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(15,23,42,0.08)" };
function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }
function pct(a: number, b: number) { return b === 0 ? "0%" : `${Math.round((a / b) * 100)}%`; }

type Rango = "hoy" | "semana" | "mes" | "mes_anterior" | "anio";
type Tab   = "resumen" | "admins" | "grupos" | "visitas" | "cartera" | "flota" | "entregas" | "exportar";

const RANGOS: { key: Rango; label: string }[] = [
  { key: "hoy",          label: "Hoy" },
  { key: "semana",       label: "Esta semana" },
  { key: "mes",          label: "Este mes" },
  { key: "mes_anterior", label: "Mes anterior" },
  { key: "anio",         label: "Este año" },
];

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "resumen",  label: "Resumen",   icon: "📊" },
  { key: "admins",   label: "Por admin", icon: "👤" },
  { key: "grupos",   label: "Por grupo", icon: "📁" },
  { key: "visitas",  label: "Visitas",   icon: "🏠" },
  { key: "cartera",  label: "Cartera",   icon: "💳" },
  { key: "flota",    label: "Flota",     icon: "🏍️" },
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
  if (r === "hoy")    { const s = iso(hoy); return { desde: s, hasta: s }; }
  if (r === "semana") {
    const l = new Date(hoy); l.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    return { desde: iso(l), hasta: iso(hoy) };
  }
  if (r === "mes")    return { desde: iso(hoy).slice(0, 7) + "-01", hasta: iso(hoy) };
  if (r === "mes_anterior") {
    const i = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const f = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    return { desde: iso(i), hasta: iso(f) };
  }
  return { desde: `${hoy.getFullYear()}-01-01`, hasta: iso(hoy) };
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

function exportarCSV(filas: string[][], encabezado: string[], nombreArchivo: string) {
  const contenido = [encabezado, ...filas].map(row => row.join(",")).join("\n");
  const blob = new Blob(["﻿" + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nombreArchivo; a.click();
  URL.revokeObjectURL(url);
}

// ── Excel "bonito": tabla HTML con estilo que Excel abre con colores, encabezados
//    y filas cebra. Evita el problema del CSV (todo en una columna en Excel es-CO). ──
type CeldaX = string | { v: string; color?: string; bold?: boolean; align?: "left" | "center" | "right" };
type ColX = { label: string; align?: "left" | "center" | "right"; ancho?: number };
type SeccionX = { titulo: string; color?: string; filas: CeldaX[][] };
const GRUPO_HEX: Record<string, string> = {
  RASTREADOR: "#0891b2", COSTA: "#0e7490", PRADERA: "#b45309", USADAS: "#c2410c", OTRO: "#475569",
};
function descargarExcel(opts: { archivo: string; titulo: string; periodo: string; columnas: ColX[]; secciones: SeccionX[]; totalGeneral?: CeldaX[] }) {
  const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const NAVY = "#0f172a", CYAN_BG = "#0891b2", CYAN_LN = "#0e7490";
  const n = opts.columnas.length;
  const cell = (c: CeldaX, col: ColX, bg: string) => {
    const o = (c !== null && typeof c === "object") ? c : { v: c } as { v: string; color?: string; bold?: boolean; align?: "left" | "center" | "right" };
    const align = o.align ?? col.align ?? "left";
    const style = `background:${bg};text-align:${align};border:1px solid #e2e8f0;padding:5px 9px;mso-number-format:'\\@';`
      + (o.color ? `color:${o.color};` : "") + (o.bold ? "font-weight:bold;" : "");
    return `<td style="${style}">${esc(o.v)}</td>`;
  };
  let h = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"><style>td,th{font-family:Calibri,Arial,sans-serif;font-size:11pt;}</style></head><body>`;
  h += `<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;">`;
  h += `<tr>${opts.columnas.map(c => `<td width="${c.ancho ?? 120}"></td>`).join("")}</tr>`;
  h += `<tr><td colspan="${n}" style="background:${NAVY};color:#ffffff;font-size:15pt;font-weight:bold;padding:10px 12px;">${esc(opts.titulo)}</td></tr>`;
  h += `<tr><td colspan="${n}" style="background:${NAVY};color:#7dd3fc;font-size:9.5pt;padding:2px 12px 8px;">${esc(opts.periodo)}</td></tr>`;
  h += `<tr>${opts.columnas.map(c => `<th style="background:${CYAN_BG};color:#ffffff;font-weight:bold;text-align:${c.align ?? "left"};border:1px solid ${CYAN_LN};padding:7px 9px;white-space:nowrap;">${esc(c.label)}</th>`).join("")}</tr>`;
  opts.secciones.forEach(sec => {
    h += `<tr><td colspan="${n}" style="background:${sec.color ?? "#334155"};color:#ffffff;font-weight:bold;padding:6px 10px;border:1px solid ${sec.color ?? "#334155"};">${esc(sec.titulo)}</td></tr>`;
    sec.filas.forEach((fila, i) => {
      const bg = i % 2 === 0 ? "#ffffff" : "#f1f5f9";
      h += `<tr>${fila.map((c, ci) => cell(c, opts.columnas[ci], bg)).join("")}</tr>`;
    });
  });
  if (opts.totalGeneral) {
    h += `<tr>${opts.totalGeneral.map((c, ci) => {
      const col = opts.columnas[ci];
      const o = (c !== null && typeof c === "object") ? c : { v: c } as { v: string; align?: "left" | "center" | "right" };
      const align = o.align ?? col.align ?? "left";
      return `<td style="background:${NAVY};color:#ffffff;font-weight:bold;text-align:${align};border:1px solid ${NAVY};padding:7px 9px;mso-number-format:'\\@';">${esc(o.v)}</td>`;
    }).join("")}</tr>`;
  }
  h += `</table></body></html>`;
  const blob = new Blob(["﻿" + h], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = opts.archivo.endsWith(".xls") ? opts.archivo : opts.archivo + ".xls";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function fmtFechaCorta(iso: string) {
  const s = (iso || "").slice(0, 10).split("-");
  return s.length === 3 ? `${s[2]}/${s[1]}/${s[0]}` : (iso || "—");
}

// ── Gestión: fila de moto y bloque (admin o grupo). Una sola base, dos cortes. ──
type MotoRowG = { placa: string; cliente: string; monto: number; pago: boolean; grupo: string; adminId: string; adminNombre: string };
type BloqueG = { key: string; nombre: string; color?: string; motos: MotoRowG[]; total: number; pagaron: number; noPagaron: number; recaudado: number; pctv: number };
function agruparBloques(rows: MotoRowG[], modo: "admin" | "grupo"): BloqueG[] {
  const map = new Map<string, MotoRowG[]>();
  rows.forEach(r => {
    const k = modo === "admin" ? r.adminId : r.grupo;
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(r);
  });
  const bloques: BloqueG[] = [...map.entries()].map(([key, motos]) => {
    const pagaron = motos.filter(m => m.pago).length;
    const recaudado = motos.reduce((s, m) => s + m.monto, 0);
    return {
      key,
      nombre: modo === "admin" ? motos[0].adminNombre : key,
      color: modo === "grupo" ? (GRUPO_COLORS[key] ?? "var(--muted)") : undefined,
      motos: motos.slice().sort((x, y) => (x.pago === y.pago ? x.cliente.localeCompare(y.cliente) : x.pago ? 1 : -1)),
      total: motos.length, pagaron, noPagaron: motos.length - pagaron, recaudado,
      pctv: motos.length > 0 ? Math.round((pagaron / motos.length) * 100) : 0,
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
                  <div style={{ width: 56, height: 5, background: "var(--soft)", borderRadius: 999, overflow: "hidden", marginTop: 3 }}>
                    <div style={{ width: `${b.pctv}%`, height: "100%", background: pctFillG(b.pctv) }} />
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, fontVariantNumeric: "tabular-nums", minWidth: 66, textAlign: "right" }}>$ {fmt(b.recaudado)}</div>
              </div>
            </div>
            <div style={{ padding: "0 16px 8px 42px", fontSize: 11 }}>
              <span style={{ color: "var(--ok-ink)", fontWeight: 700 }}>{b.pagaron} pagaron</span>
              <span style={{ color: "var(--faint)" }}> · </span>
              <span style={{ color: "var(--bad-ink)", fontWeight: 700 }}>{b.noPagaron} no pagaron</span>
            </div>
            {open && (
              <div style={{ background: "var(--soft2)", padding: "2px 16px 14px" }}>
                {b.motos.map((m, i) => (
                  <div key={m.placa + i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid var(--line)" }}>
                    <Placa placa={m.placa} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.cliente}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
                        {modo === "admin"
                          ? <><span style={{ width: 7, height: 7, borderRadius: 2, background: GRUPO_COLORS[m.grupo] ?? "var(--muted)" }} /><span style={{ color: "var(--muted)" }}>{m.grupo}</span></>
                          : <span style={{ color: "var(--muted)", textTransform: "uppercase" }}>👤 {m.adminNombre}</span>}
                      </div>
                    </div>
                    {m.pago
                      ? <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ok-ink)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>✓ $ {fmt(m.monto)}</span>
                      : <span style={{ fontSize: 12, fontWeight: 700, color: "var(--bad-ink)", background: "var(--bad-soft)", borderRadius: 8, padding: "2px 8px", whiteSpace: "nowrap" }}>✕ No pagó</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CabeceraGestion({ totMotos, totPag, totRec, rangoLabel, desde, hasta, nota, onExport }: { totMotos: number; totPag: number; totRec: number; rangoLabel: string; desde: string; hasta: string; nota: string; onExport: () => void }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <KPI label="Motos activas" value={`${totMotos}`} />
        <KPI label="Pagaron" value={`${totPag}`} color="var(--ok-ink)" bg="var(--ok-soft)" sub={pct(totPag, totMotos)} />
        <KPI label="No pagaron" value={`${totMotos - totPag}`} color="var(--bad-ink)" bg="var(--bad-soft)" />
        <KPI label="Recaudado" value={`$ ${fmt(totRec)}`} color="var(--accent)" />
      </div>
      <div style={{ ...card, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          Período: <b style={{ color: "var(--text)" }}>{rangoLabel}</b>
          <span style={{ color: "var(--faint)" }}> ({desde} → {hasta})</span> · {nota}
        </div>
        <button onClick={onExport} style={{ background: "var(--soft)", border: "1px solid var(--line2)", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "var(--ok-ink)", whiteSpace: "nowrap" }}>⬇️ Exportar Excel</button>
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
  const [tab, setTab]     = useState<Tab>("resumen");
  const [grupoEnt, setGrupoEnt] = useState<string>("Todos");     // filtro de grupo en la pestaña Entregas
  const [fotosVer, setFotosVer] = useState<{ placa: string; cliente: string; fotos: [string, string][] } | null>(null); // lightbox de fotos de entrega
  // Regeneración de documentos en blanco (bug histórico del PDF)
  const [regen, setRegen] = useState<{ estado: "idle" | "buscando" | "regenerando" | "hecho"; total: number; hechos: number; msg: string }>({ estado: "idle", total: 0, hechos: 0, msg: "" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  // Informes de gestión: lista de sub-admins + fila expandida (drill-down)
  const [subadmins, setSubadmins] = useState<{ id: string; nombre: string }[]>([]);
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

  useEffect(() => {
    import("../lib/supabase").then(({ supabase }) => {
      supabase.from("profiles").select("id, nombre").eq("role", "SUBADMIN").then(({ data }) => {
        setSubadmins((data ?? []) as { id: string; nombre: string }[]);
      });
    });
  }, []);

  const { profile }   = useAuth();
  const esAdmin       = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";
  const { pagos }     = usePagos();
  const { contratos } = useContratos();
  const { clientes }  = useClientes();
  const { motos }     = useMotos();
  const { deudas }    = useDeudas();
  const { visitas }   = useVisitas();

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
  const { desde, hasta } = getRango(rango);

  // ── Recaudado hoy ──────────────────────────────────────────────────────────
  const recaudadoHoy = useMemo(() =>
    pagos.filter(p => p.estado === "Confirmado" && p.fecha === hoyStr && esPagoDeCaja(p)).reduce((a, p) => a + p.valor, 0),
    [pagos, hoyStr]);

  // ── Pagos en rango ─────────────────────────────────────────────────────────
  const pagosRango = useMemo(() =>
    pagos.filter(p => p.estado === "Confirmado" && p.fecha >= desde && p.fecha <= hasta && esPagoDeCaja(p)),
    [pagos, desde, hasta]);

  // ── INFORMES DE GESTIÓN ─────────────────────────────────────────────────────
  // Base única: cada moto activa con su grupo, su admin asignado (motos.subadmin_id)
  // y lo que recaudó en el rango. De aquí salen los DOS cortes (por admin / por grupo),
  // cada uno mostrando el otro como etiqueta cruzada. Base para la nómina.
  const baseGestion = useMemo<MotoRowG[]>(() => {
    const nombreAdmin = (id: string | null | undefined) =>
      id ? (subadmins.find(s => s.id === id)?.nombre ?? "—") : "Sin asignar";
    const recaudoPorContrato = new Map<string, number>();
    pagosRango.forEach(p => recaudoPorContrato.set(p.contrato_id, (recaudoPorContrato.get(p.contrato_id) ?? 0) + p.valor));
    const rows: MotoRowG[] = [];
    contratos.filter(c => c.estado === "Activo" && c.moto_id).forEach(c => {
      const moto = motos.find(m => m.id === c.moto_id);
      if (!moto) return;
      const monto = recaudoPorContrato.get(c.id) ?? 0;
      rows.push({
        placa: moto.placa,
        cliente: clientes.find(cl => cl.id === c.cliente_id)?.nombre ?? "Sin cliente",
        monto, pago: monto > 0,
        grupo: moto.grupo ?? "OTRO",
        adminId: moto.subadmin_id ?? "__none__",
        adminNombre: nombreAdmin(moto.subadmin_id),
      });
    });
    return rows;
  }, [contratos, motos, clientes, pagosRango, subadmins]);

  const porAdminData = useMemo(() => agruparBloques(baseGestion, "admin"), [baseGestion]);
  const porGrupoData = useMemo(() => agruparBloques(baseGestion, "grupo"), [baseGestion]);
  const gTotMotos = baseGestion.length;
  const gTotPag   = baseGestion.filter(r => r.pago).length;
  const gTotRec   = baseGestion.reduce((s, r) => s + r.monto, 0);

  // ── INFORME "Visitas por administrador" ────────────────────────────────────
  const visitasData = useMemo(() => {
    const nombreAdmin = (id: string | null | undefined) =>
      id ? (subadmins.find(s => s.id === id)?.nombre ?? "—") : "Sin asignar / Oficina";
    type VisRow = { cliente: string; fecha: string; estado: string; resultado: string | null; gps: boolean; foto: boolean };
    type VisAgg = { key: string; nombre: string; visitas: VisRow[]; aprobadas: number; rechazadas: number; repetir: number; pendientes: number };
    const map = new Map<string, VisAgg>();
    visitas.filter(v => (v.fecha || "").slice(0, 10) >= desde && (v.fecha || "").slice(0, 10) <= hasta).forEach(v => {
      const key = v.asignada_a ?? "__none__";
      if (!map.has(key)) map.set(key, { key, nombre: nombreAdmin(v.asignada_a), visitas: [], aprobadas: 0, rechazadas: 0, repetir: 0, pendientes: 0 });
      const agg = map.get(key)!;
      agg.visitas.push({
        cliente: clientes.find(cl => cl.id === v.cliente_id)?.nombre ?? "Sin cliente",
        fecha: (v.fecha || "").slice(0, 10), estado: v.estado, resultado: v.resultado,
        gps: !!v.ubicacion, foto: !!(v.fotos?.clienteFuncionario || v.fotos?.fachada),
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
  const periodoTxt = `Período: ${rangoLabel} (${desde} → ${hasta}) · Club de Moteros`;

  function exportarPorAdmin() {
    const cols: ColX[] = [
      { label: "Grupo", ancho: 95 }, { label: "Placa", ancho: 80 }, { label: "Cliente", ancho: 210 },
      { label: "¿Pagó?", align: "center", ancho: 90 }, { label: "Monto", align: "right", ancho: 100 },
    ];
    const secciones: SeccionX[] = porAdminData.map(b => ({
      titulo: `👤 ${b.nombre.toUpperCase()}   —   ${b.total} motos · ${b.pagaron} pagaron · ${b.noPagaron} no pagaron · $ ${fmt(b.recaudado)}`,
      color: "#334155",
      filas: b.motos.map(m => [
        m.grupo, m.placa, m.cliente.toUpperCase(),
        m.pago ? { v: "✓ Pagó", color: "#166534", align: "center" as const } : { v: "✗ No pagó", color: "#991b1b", align: "center" as const },
        { v: m.pago ? "$ " + fmt(m.monto) : "—", align: "right" as const },
      ]),
    }));
    descargarExcel({
      archivo: `por_admin_${desde}_a_${hasta}`, titulo: "Gestión por administrador", periodo: periodoTxt, columnas: cols, secciones,
      totalGeneral: [{ v: "TOTAL GENERAL", bold: true }, "", { v: `${gTotPag} de ${gTotMotos} pagaron`, bold: true }, "", { v: "$ " + fmt(gTotRec), align: "right", bold: true }],
    });
  }

  function exportarPorGrupo() {
    const cols: ColX[] = [
      { label: "Administrador", ancho: 150 }, { label: "Placa", ancho: 80 }, { label: "Cliente", ancho: 210 },
      { label: "¿Pagó?", align: "center", ancho: 90 }, { label: "Monto", align: "right", ancho: 100 },
    ];
    const secciones: SeccionX[] = porGrupoData.map(b => ({
      titulo: `${b.key}   —   ${b.total} motos · ${b.pagaron} pagaron · ${b.noPagaron} no pagaron · $ ${fmt(b.recaudado)}`,
      color: GRUPO_HEX[b.key] ?? "#334155",
      filas: b.motos.map(m => [
        m.adminNombre.toUpperCase(), m.placa, m.cliente.toUpperCase(),
        m.pago ? { v: "✓ Pagó", color: "#166534", align: "center" as const } : { v: "✗ No pagó", color: "#991b1b", align: "center" as const },
        { v: m.pago ? "$ " + fmt(m.monto) : "—", align: "right" as const },
      ]),
    }));
    descargarExcel({
      archivo: `por_grupo_${desde}_a_${hasta}`, titulo: "Recaudo por grupo", periodo: periodoTxt, columnas: cols, secciones,
      totalGeneral: [{ v: "TOTAL GENERAL", bold: true }, "", { v: `${gTotPag} de ${gTotMotos} pagaron`, bold: true }, "", { v: "$ " + fmt(gTotRec), align: "right", bold: true }],
    });
  }

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

  const totalRecaudado    = pagosRango.reduce((a, p) => a + p.valor, 0);
  const totalEfectivo     = pagosRango.filter(p => p.metodo === "Efectivo").reduce((a, p) => a + p.valor, 0);
  const totalTransferencia= pagosRango.filter(p => p.metodo !== "Efectivo").reduce((a, p) => a + p.valor, 0);
  const totalCampo        = pagosRango.filter(p => p.tipo_registro === "campo").reduce((a, p) => a + p.valor, 0);

  // ── Recaudo diario últimos 14d ─────────────────────────────────────────────
  const recaudoDiario = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = hoyDate(); d.setDate(d.getDate() - (13 - i));
      const fecha = d.toISOString().slice(0, 10);
      const total = pagos.filter(p => p.estado === "Confirmado" && p.fecha === fecha && esPagoDeCaja(p)).reduce((a, p) => a + p.valor, 0);
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
      const total = pagos.filter(p => p.estado === "Confirmado" && p.fecha >= desde_ && p.fecha <= hasta_ && esPagoDeCaja(p)).reduce((a, p) => a + p.valor, 0);
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
  const enMora = useMemo(() => contratosActivos.map(c => {
    const pagosC = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado");
    const ultimo = pagosC.sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    const grupoMoto = motos.find(m => m.id === c.moto_id)?.grupo ?? null;
    const dias = diasDesdeUltimoPago(ultimo?.fecha ?? null, c.fecha_entrega ?? c.created_at.slice(0, 10), corteMigracionGrupo(grupoMoto)) ?? 0;
    return { contrato: c, diasSinPago: dias, ultimoPago: ultimo?.fecha ?? null };
  }).filter(e => e.diasSinPago > 2), [contratosActivos, pagos, motos]);

  // Deuda real por contrato (tabla deudas) — no estimada por días
  const deudaDelContrato = useMemo(() => {
    const map = new Map<string, number>();
    deudas.filter(d => d.estado !== "pagada").forEach(d => {
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
      const c = contratos.find(ct => ct.id === p.contrato_id);
      if (!c) return;
      map[c.cliente_id] = (map[c.cliente_id] ?? 0) + p.valor;
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
    const totalAnt = pagos.filter(p => p.estado === "Confirmado" && p.fecha >= i && p.fecha <= f && esPagoDeCaja(p)).reduce((a, p) => a + p.valor, 0);
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
      <footer>GPS Satelital Cartagena · Fredy Mora Avendaño C.C. 1.047.393.901</footer>
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
        const cab = `<tr class="sec"><td colspan="5">${modo === "admin" ? "👤 " : ""}${b.nombre.toUpperCase()} — ${b.total} motos · ${b.pagaron} pagaron · ${b.noPagaron} no pagaron · $ ${fmt(b.recaudado)} · ${b.pctv}%</td></tr>`;
        const motos = b.motos.map(m => `<tr><td>${m.placa}</td><td class="up">${m.cliente}</td><td>${modo === "admin" ? m.grupo : ("👤 " + m.adminNombre)}</td><td class="c" style="color:${m.pago ? "#166534" : "#991b1b"};font-weight:700">${m.pago ? "✓ Pagó" : "✗ No pagó"}</td><td class="r">${m.pago ? "$ " + fmt(m.monto) : "—"}</td></tr>`).join("");
        return cab + motos;
      }).join("");
      return `<table><thead><tr><th>Placa</th><th>Cliente</th><th>${cross}</th><th class="c">¿Pagó?</th><th class="r">Monto</th></tr></thead><tbody>${filas}</tbody></table>`;
    };
    const gResumen = (bloques: BloqueG[], modo: "admin" | "grupo") => {
      const filas = bloques.map(b => `<tr><td class="up"><b>${modo === "admin" ? "👤 " : ""}${b.nombre}</b></td><td class="c">${b.total}</td><td class="c" style="color:#166534;font-weight:700">${b.pagaron}</td><td class="c" style="color:#991b1b;font-weight:700">${b.noPagaron}</td><td class="c">${b.pctv}%</td><td class="r">$ ${fmt(b.recaudado)}</td></tr>`).join("");
      return `<table><thead><tr><th>${modo === "admin" ? "Administrador" : "Grupo"}</th><th class="c">Motos</th><th class="c">Pagaron</th><th class="c">No pagaron</th><th class="c">%</th><th class="r">Recaudado</th></tr></thead><tbody>${filas}</tbody></table>`;
    };

    if (S.porAdmin) parts.push(`<h2>Gestión por administrador${det ? " — detalle" : " — resumen"}</h2>${det ? gDetalle(porAdminData, "admin", "Grupo") : gResumen(porAdminData, "admin")}`);
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
      <h1>Reporte MotoGestión — GPS Satelital Cartagena</h1>
      <p class="sub">Período: <strong>${rangoLbl}</strong> (${desde} → ${hasta}) · Generado el ${fechaHoy} · ${det ? "con detalle" : "resumen"}</p>
      ${parts.join("\n")}
      <footer>GPS Satelital Cartagena · Fredy Mora Avendaño C.C. 1.047.393.901</footer>
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

      {/* Rangos */}
      <div style={{ overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {RANGOS.map(r => (
            <Chip key={r.key} activo={rango === r.key} onClick={() => setRango(r.key)} style={{ flexShrink: 0 }}>
              {r.label}
            </Chip>
          ))}
        </div>
      </div>

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
      <div style={{ overflowX: "auto", paddingBottom: 4, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 4, background: "var(--card)", borderRadius: 14, padding: 4, boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: tab === t.key ? "var(--text)" : "transparent", color: tab === t.key ? "var(--card)" : "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexShrink: 0 }}>
              <span>{t.icon}</span><span>{t.label}</span>
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
          <CabeceraGestion totMotos={gTotMotos} totPag={gTotPag} totRec={gTotRec} rangoLabel={rangoLabel} desde={desde} hasta={hasta}
            nota="toca un admin para ver sus motos · cada moto muestra su grupo" onExport={exportarPorAdmin} />
          <GestionBloques bloques={porAdminData} modo="admin" expandido={expandidoGestion} onToggle={(k) => setExpandidoGestion(expandidoGestion === k ? null : k)} />
        </div>
      )}

      {/* ── TAB POR GRUPO (cada moto muestra QUIÉN la tiene asignada) ── */}
      {tab === "grupos" && (
        <div style={{ display: "grid", gap: 16 }}>
          <CabeceraGestion totMotos={gTotMotos} totPag={gTotPag} totRec={gTotRec} rangoLabel={rangoLabel} desde={desde} hasta={hasta}
            nota="toca un grupo para ver sus motos · cada moto muestra quién la tiene asignada" onExport={exportarPorGrupo} />
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
              <button onClick={exportarVisitas} style={{ background: "var(--soft)", border: "1px solid var(--line2)", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "var(--ok-ink)", whiteSpace: "nowrap" }}>⬇️ Exportar Excel</button>
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
                <img src={url} alt={ANG_LABEL[ang] ?? ang} style={{ width: "100%", display: "block", maxHeight: 400, objectFit: "contain", background: "#000" }} />
                <div style={{ padding: "8px 12px", fontWeight: 700, fontSize: 13, color: "var(--muted2)", textAlign: "center" }}>{ANG_LABEL[ang] ?? ang}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB EXPORTAR ── */}
      {tab === "exportar" && (() => {
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
                    return [p.fecha, (cl?.nombre ?? "—").replace(/,/g," "), m?.placa ?? "—", p.metodo, p.tipo_registro ?? "", String(p.valor)];
                  });
                  exportarCSV(filas, ["Fecha","Cliente","Placa","Metodo","Tipo","Valor"], `pagos-${desde}-${hasta}.csv`);
                },
              },
              {
                label: "⬇️ CSV — Mora actual",
                desc: `${moraDetallada.length} contratos en mora · Cliente, Placa, Días, Deuda pendiente, Último pago`,
                onClick: () => {
                  const filas = moraDetallada.map(m => [m.cliente.replace(/,/g," "), m.placa, String(m.diasSinPago), String(m.deudaPendiente), m.ultimoPago ?? "Sin pagos"]);
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
    </div>
  );
}
