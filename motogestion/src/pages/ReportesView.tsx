import React, { useMemo, useState, useEffect } from "react";
import type { ViewKey } from "../App";
import { usePagos } from "../hooks/usePagos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";

interface Props {
  onNavigate?: (view: ViewKey, filter?: string) => void;
}

const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(15,23,42,0.08)" };
function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }
function pct(a: number, b: number) { return b === 0 ? "0%" : `${Math.round((a / b) * 100)}%`; }

type Rango = "hoy" | "semana" | "mes" | "mes_anterior" | "anio";
type Tab   = "resumen" | "cartera" | "flota" | "exportar";

const RANGOS: { key: Rango; label: string }[] = [
  { key: "hoy",          label: "Hoy" },
  { key: "semana",       label: "Esta semana" },
  { key: "mes",          label: "Este mes" },
  { key: "mes_anterior", label: "Mes anterior" },
  { key: "anio",         label: "Este año" },
];

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "resumen",  label: "Resumen",  icon: "📊" },
  { key: "cartera",  label: "Cartera",  icon: "💳" },
  { key: "flota",    label: "Flota",    icon: "🏍️" },
  { key: "exportar", label: "Exportar", icon: "⬇️" },
];

const GRUPOS = ["RASTREADOR", "COSTA", "PRADERA", "USADAS"] as const;
const GRUPO_COLORS: Record<string, string> = {
  RASTREADOR: "#0284c7", COSTA: "#10b981", PRADERA: "#f59e0b", USADAS: "#ea580c",
};
const ESTADO_MOTO_COLOR: Record<string, string> = {
  Asignada: "#166534", Disponible: "#1e40af", "En taller": "#92400e",
  Recuperada: "#0369a1", Suspendida: "#6d28d9", Fiscalia: "#991b1b",
  Transito: "#be123c", Garantia: "#6b7280",
};

function getRango(r: Rango): { desde: string; hasta: string } {
  const hoy = new Date();
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
        <span style={{ fontWeight: 600, color: "#334155" }}>{label}{sub && <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 6 }}>{sub}</span>}</span>
        <span style={{ color: "#64748b" }}>$ {fmt(valor)} <span style={{ color: "#94a3b8" }}>({p}%)</span></span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
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
        <span style={{ fontWeight: 600, color: "#334155" }}>{label}</span>
        <span style={{ color: "#64748b" }}>{valor} <span style={{ color: "#94a3b8" }}>({p}%)</span></span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 999, width: `${p}%`, background: color, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

function KPI({ label, value, sub, color, bg }: { label: string; value: string; sub?: string; color?: string; bg?: string }) {
  const icon = KPI_ICONS[label];
  return (
    <div style={{ ...card, background: bg ?? "white", padding: "14px 16px" }}>
      <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>
        {icon && <span style={{ marginRight: 4 }}>{icon}</span>}{label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color ?? "#0f172a", marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{sub}</div>}
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const { pagos }     = usePagos();
  const { contratos } = useContratos();
  const { clientes }  = useClientes();
  const { motos }     = useMotos();

  const hoyStr = new Date().toISOString().slice(0, 10);
  const { desde, hasta } = getRango(rango);

  // ── Recaudado hoy ──────────────────────────────────────────────────────────
  const recaudadoHoy = useMemo(() =>
    pagos.filter(p => p.estado === "Confirmado" && p.fecha === hoyStr).reduce((a, p) => a + p.valor, 0),
    [pagos, hoyStr]);

  // ── Pagos en rango ─────────────────────────────────────────────────────────
  const pagosRango = useMemo(() =>
    pagos.filter(p => p.estado === "Confirmado" && p.fecha >= desde && p.fecha <= hasta),
    [pagos, desde, hasta]);

  const totalRecaudado    = pagosRango.reduce((a, p) => a + p.valor, 0);
  const totalEfectivo     = pagosRango.filter(p => p.metodo === "Efectivo").reduce((a, p) => a + p.valor, 0);
  const totalTransferencia= pagosRango.filter(p => p.metodo !== "Efectivo").reduce((a, p) => a + p.valor, 0);
  const totalCampo        = pagosRango.filter(p => p.tipo_registro === "campo").reduce((a, p) => a + p.valor, 0);

  // ── Recaudo diario últimos 14d ─────────────────────────────────────────────
  const recaudoDiario = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (13 - i));
      const fecha = d.toISOString().slice(0, 10);
      const total = pagos.filter(p => p.estado === "Confirmado" && p.fecha === fecha).reduce((a, p) => a + p.valor, 0);
      const label = `${["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][d.getDay()]} ${d.getDate()}`;
      return { fecha, total, label };
    });
  }, [pagos]);
  const maxDiario = Math.max(...recaudoDiario.map(d => d.total), 1);

  // ── Recaudo últimas 4 semanas ──────────────────────────────────────────────
  const recaudoSemanal = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const fin = new Date(); fin.setDate(fin.getDate() - i * 7);
      const ini = new Date(fin); ini.setDate(ini.getDate() - 6);
      const desde_ = ini.toISOString().slice(0, 10);
      const hasta_ = fin.toISOString().slice(0, 10);
      const total = pagos.filter(p => p.estado === "Confirmado" && p.fecha >= desde_ && p.fecha <= hasta_).reduce((a, p) => a + p.valor, 0);
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
    const dias = ultimo ? Math.floor((new Date().getTime() - new Date(ultimo.fecha + "T00:00:00").getTime()) / 86400000) : 999;
    return { contrato: c, diasSinPago: dias, ultimoPago: ultimo?.fecha ?? null };
  }).filter(e => e.diasSinPago > 2), [contratosActivos, pagos]);

  const moraDetallada = useMemo(() => enMora.map(({ contrato: c, diasSinPago, ultimoPago }) => {
    const cliente = clientes.find(cl => cl.id === c.cliente_id);
    const moto    = c.moto_id ? motos.find(m => m.id === c.moto_id) : undefined;
    return {
      id: c.id, clienteId: c.cliente_id, motoId: c.moto_id ?? null,
      cliente: cliente?.nombre ?? "—", placa: moto?.placa ?? "—",
      diasSinPago, deudaEstimada: Math.min(diasSinPago, 30) * (c.tarifa_diaria ?? 27000), ultimoPago,
    };
  }).sort((a, b) => b.diasSinPago - a.diasSinPago), [enMora, clientes, motos]);

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
    const en30 = new Date(); en30.setDate(en30.getDate() + 30);
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
    contratos.filter(c => c.estado === "Activo" && c.tipo_ruta === "diario" && !c.base_completada && (c.ahorro_acumulado ?? 0) >= 450000),
    [contratos]);

  // ── Comparativa mes anterior ───────────────────────────────────────────────
  const comparativaMes = useMemo(() => {
    if (rango !== "mes") return null;
    const hoy = new Date();
    const i = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().slice(0, 10);
    const f = new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().slice(0, 10);
    const totalAnt = pagos.filter(p => p.estado === "Confirmado" && p.fecha >= i && p.fecha <= f).reduce((a, p) => a + p.valor, 0);
    const delta = totalAnt > 0 ? ((totalRecaudado - totalAnt) / totalAnt) * 100 : null;
    return { totalAnt, delta };
  }, [rango, pagos, totalRecaudado]);

  // ── Imprimir PDF ───────────────────────────────────────────────────────────
  function imprimirReporte() {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    const fechaHoy = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
    const rangoLabel = RANGOS.find(r => r.key === rango)?.label ?? rango;
    const gruposHTML = reporteGrupos.map(g => `<tr><td style="padding:8px 12px;font-weight:700;">${g.grupo}</td><td style="padding:8px 12px;text-align:center;">${g.motosAsignadas}</td><td style="padding:8px 12px;text-align:center;">$ ${fmt(g.recaudo)}</td><td style="padding:8px 12px;text-align:center;">${g.contratosActivos}</td><td style="padding:8px 12px;text-align:center;color:${g.enMora > 0 ? "#991b1b" : "#166534"};">${g.enMora}</td></tr>`).join("");
    const moraHTML = moraDetallada.slice(0, 30).map(m => `<tr><td style="padding:8px 12px;text-transform:uppercase;font-weight:600;">${m.cliente}</td><td style="padding:8px 12px;">${m.placa}</td><td style="padding:8px 12px;text-align:center;color:#991b1b;font-weight:700;">${m.diasSinPago}</td><td style="padding:8px 12px;text-align:right;">$ ${fmt(m.deudaEstimada)}</td><td style="padding:8px 12px;">${m.ultimoPago ? new Date(m.ultimoPago + "T00:00:00").toLocaleDateString("es-CO") : "—"}</td></tr>`).join("");
    win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte MotoGestión</title><style>body{font-family:Arial,sans-serif;color:#0f172a;padding:32px;font-size:14px;}h1{font-size:22px;margin-bottom:4px;}h2{font-size:16px;margin:24px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;}.kpis{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;}.kpi{border:1px solid #e2e8f0;border-radius:10px;padding:14px 20px;min-width:130px;}.kpi-val{font-size:20px;font-weight:800;color:#0284c7;}.kpi-lbl{font-size:11px;color:#64748b;text-transform:uppercase;margin-top:2px;}table{width:100%;border-collapse:collapse;font-size:13px;}th{background:#f1f5f9;padding:8px 12px;text-align:left;font-weight:700;color:#64748b;}tr:nth-child(even){background:#f8fafc;}footer{margin-top:32px;font-size:11px;color:#94a3b8;text-align:center;}</style></head><body>
      <h1>Reporte MotoGestión — GPS Satelital Cartagena</h1>
      <p style="color:#64748b;margin:0;">Período: <strong>${rangoLabel}</strong> (${desde} → ${hasta}) · Generado el ${fechaHoy}</p>
      <h2>KPIs de Recaudo</h2>
      <div class="kpis"><div class="kpi"><div class="kpi-val">$ ${fmt(totalRecaudado)}</div><div class="kpi-lbl">Total recaudado</div></div><div class="kpi"><div class="kpi-val">$ ${fmt(totalEfectivo)}</div><div class="kpi-lbl">Efectivo</div></div><div class="kpi"><div class="kpi-val">$ ${fmt(totalTransferencia)}</div><div class="kpi-lbl">Transferencias</div></div><div class="kpi"><div class="kpi-val">${contratosActivos.length}</div><div class="kpi-lbl">Contratos activos</div></div><div class="kpi"><div class="kpi-val">${enMora.length}</div><div class="kpi-lbl">En mora</div></div></div>
      <h2>Recaudo por Grupo</h2>
      <table><thead><tr><th>Grupo</th><th>Motos asignadas</th><th>Recaudo período</th><th>Contratos activos</th><th>En mora</th></tr></thead><tbody>${gruposHTML}</tbody></table>
      <h2>Mora y Cartera Vencida (${moraDetallada.length} contratos)</h2>
      ${moraDetallada.length === 0 ? "<p style='color:#166534;'>Sin contratos en mora.</p>" : `<table><thead><tr><th>Cliente</th><th>Placa</th><th>Días sin pago</th><th>Deuda estimada</th><th>Último pago</th></tr></thead><tbody>${moraHTML}</tbody></table>`}
      <footer>GPS Satelital Cartagena · Fredy Mora Avendaño C.C. 1.047.393.901</footer>
      </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  // ── Avisos rápidos ─────────────────────────────────────────────────────────
  const avisos = [
    enMoraCritica > 0 && { color: "#991b1b", bg: "#fee2e2", border: "#ef4444", text: `🚨 ${enMoraCritica} contrato${enMoraCritica > 1 ? "s" : ""} en mora crítica (+7 días) — requieren recolección` },
    diasBase.length > 0 && { color: "#92400e", bg: "#fef3c7", border: "#f59e0b", text: `⚠️ ${diasBase.length} cliente${diasBase.length > 1 ? "s" : ""} cerca de completar la base ($510.000) — gestionar cambio de contrato` },
    alertasVencimiento.length > 0 && { color: "#92400e", bg: "#fef3c7", border: "#f59e0b", text: `📋 ${alertasVencimiento.length} moto${alertasVencimiento.length > 1 ? "s" : ""} con SOAT o tecno venciendo en 30 días` },
  ].filter(Boolean) as { color: string; bg: string; border: string; text: string }[];

  return (
    <div>
      {/* Hero header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", borderRadius: 20, padding: isMobile ? "20px 16px" : "28px 32px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: isMobile ? 20 : 26, margin: 0, fontWeight: 800, color: "white" }}>Reportes</h2>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Resumen operativo y financiero en tiempo real.</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 900, color: "#38bdf8", lineHeight: 1 }}>$ {fmt(recaudadoHoy)}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4, fontWeight: 600 }}>Recaudado hoy</div>
        </div>
      </div>

      {/* Rangos */}
      <div style={{ overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {RANGOS.map(r => (
            <button key={r.key} onClick={() => setRango(r.key)} style={{ padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: rango === r.key ? "#0284c7" : "#f1f5f9", color: rango === r.key ? "white" : "#64748b", flexShrink: 0 }}>
              {r.label}
            </button>
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
        <div style={{ display: "flex", gap: 4, background: "white", borderRadius: 14, padding: 4, boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: tab === t.key ? "#0f172a" : "transparent", color: tab === t.key ? "white" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexShrink: 0 }}>
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
            <KPI label="Total recaudado"    value={`$ ${fmt(totalRecaudado)}`}    color="#166534" bg="#f0fdf4" />
            <KPI label="Efectivo"           value={`$ ${fmt(totalEfectivo)}`}     color="#0284c7" sub={pct(totalEfectivo, totalRecaudado)} />
            <KPI label="Transferencias"     value={`$ ${fmt(totalTransferencia)}`}color="#6d28d9" sub={pct(totalTransferencia, totalRecaudado)} />
            <KPI label="Cobro en campo"     value={`$ ${fmt(totalCampo)}`}        color="#0369a1" sub={pct(totalCampo, totalRecaudado)} />
            <KPI label="Proyección mensual" value={`$ ${fmt(proyeccionMensual)}`} color="#334155" sub="~26 días L-S" />
          </div>

          {/* Comparativa mes anterior */}
          {comparativaMes && (
            <div style={{ ...card, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", padding: "14px 20px" }}>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>vs mes anterior:</span>
              <span style={{ fontSize: 14 }}>$ {fmt(comparativaMes.totalAnt)}</span>
              {comparativaMes.delta !== null && (
                <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: comparativaMes.delta >= 0 ? "#dcfce7" : "#fee2e2", color: comparativaMes.delta >= 0 ? "#166534" : "#991b1b" }}>
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
                      {total > 0 && <div style={{ fontSize: 8, color: isHoy ? "#0284c7" : "#94a3b8", fontWeight: 700 }}>${fmt(total / 1000)}k</div>}
                      <div style={{ width: "100%", height: h, borderRadius: "4px 4px 0 0", background: isHoy ? "#0284c7" : total === 0 ? "#e2e8f0" : "#93c5fd" }} />
                      <div style={{ fontSize: 8, color: isHoy ? "#0284c7" : "#94a3b8", fontWeight: isHoy ? 700 : 400, textAlign: "center" }}>{label.split(" ")[0]}<br />{label.split(" ")[1]}</div>
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
                      <div style={{ fontSize: 10, color: isLast ? "#0284c7" : "#94a3b8", fontWeight: 700 }}>${fmt(total / 1000)}k</div>
                      <div style={{ width: "100%", height: h, borderRadius: "6px 6px 0 0", background: isLast ? "#0284c7" : "#bfdbfe" }} />
                      <div style={{ fontSize: 11, color: isLast ? "#0284c7" : "#64748b", fontWeight: isLast ? 700 : 400, textAlign: "center" }}>{label}</div>
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
                  <div style={{ fontWeight: 800, fontSize: 15, color: GRUPO_COLORS[g.grupo], marginBottom: 10 }}>{g.grupo}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                    {[
                      { label: "Motos asignadas", value: g.motosAsignadas, color: "#0f172a" },
                      { label: "Recaudo período", value: `$${fmt(g.recaudo)}`, color: GRUPO_COLORS[g.grupo] },
                      { label: "Contratos activos", value: g.contratosActivos, color: "#166534" },
                      { label: "En mora", value: g.enMora, color: g.enMora > 0 ? "#991b1b" : "#166534" },
                    ].map(k => (
                      <div key={k.label} style={{ padding: "8px 10px", borderRadius: 10, background: "#f8fafc", textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: k.color }}>{k.value}</div>
                        <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, marginTop: 2, textTransform: "uppercase" }}>{k.label}</div>
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
                  <div key={p.clienteId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 10, background: i === 0 ? "#f0fdf4" : "#f8fafc" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 999, background: i === 0 ? "#22c55e" : i === 1 ? "#64748b" : i === 2 ? "#f59e0b" : "#e2e8f0", color: i < 3 ? "white" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, fontWeight: 700, textTransform: "uppercase", fontSize: 13 }}>{p.nombre}</div>
                    <div style={{ fontWeight: 800, color: "#166534" }}>$ {fmt(p.total)}</div>
                    {onNavigate && (
                      <button onClick={() => onNavigate("ficha_cliente", p.clienteId)} style={{ padding: "3px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#0284c7" }}>
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

      {/* ── TAB CARTERA ── */}
      {tab === "cartera" && (
        <div style={{ display: "grid", gap: 16 }}>
          {/* KPI cartera */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
            <KPI label="Al día"       value={String(contratosActivos.length - enMora.length)} color="#166534" bg="#f0fdf4" />
            <KPI label="En mora"      value={String(enMora.length - enMoraCritica)}           color="#92400e" bg="#fefce8" />
            <KPI label="Mora crítica" value={String(enMoraCritica)}                            color="#991b1b" bg="#fff5f5" />
            <KPI label="Deuda total"  value={`$ ${fmt(moraDetallada.reduce((a, m) => a + m.deudaEstimada, 0))}`} color="#991b1b" />
          </div>

          {/* Barras cartera */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Estado cartera ({contratosActivos.length} contratos)</div>
            <Barra label="Al día"       valor={contratosActivos.length - enMora.length} total={contratosActivos.length} color="#22c55e" />
            <Barra label="En mora"      valor={enMora.length - enMoraCritica}           total={contratosActivos.length} color="#f59e0b" />
            <Barra label="Mora crítica" valor={enMoraCritica}                            total={contratosActivos.length} color="#ef4444" />
          </div>

          {/* Contratos por modalidad */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Contratos por modalidad</div>
            {contratosPorForma.map(([forma, count]) => (
              <BarraN key={forma} label={forma} valor={count} total={contratosActivos.length} color="#0284c7" />
            ))}
          </div>

          {/* Mora detallada — cards en móvil, tabla en desktop */}
          {moraDetallada.length > 0 && (
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#991b1b" }}>
                🔴 Mora detallada — {moraDetallada.length} contrato{moraDetallada.length > 1 ? "s" : ""}
              </div>

              {isMobile ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {moraDetallada.map(m => (
                    <div
                      key={m.id}
                      onClick={() => onNavigate?.("ficha_cliente", m.clienteId)}
                      style={{ padding: "12px 14px", borderRadius: 14, background: m.diasSinPago > 7 ? "#fff5f5" : "#fffbeb", border: `1px solid ${m.diasSinPago > 7 ? "#fecaca" : "#fde68a"}`, cursor: "pointer" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 13 }}>{m.cliente}</span>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#334155" }}>{m.placa}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontWeight: 700, fontSize: 12, background: m.diasSinPago > 7 ? "#fee2e2" : "#fef3c7", color: m.diasSinPago > 7 ? "#991b1b" : "#92400e" }}>{m.diasSinPago}d sin pago</span>
                        <span style={{ fontWeight: 800, color: "#991b1b", fontSize: 14 }}>$ {fmt(m.deudaEstimada)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                        Último pago: {m.ultimoPago ? new Date(m.ultimoPago + "T00:00:00").toLocaleDateString("es-CO") : <span style={{ color: "#94a3b8" }}>Sin pagos</span>}
                      </div>
                      {onNavigate && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={e => { e.stopPropagation(); onNavigate("ficha_cliente", m.clienteId); }}
                            style={{ padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#0284c7" }}
                          >👤 Ver cliente</button>
                          {m.motoId && (
                            <button
                              onClick={e => { e.stopPropagation(); onNavigate("ficha_moto", m.motoId!); }}
                              style={{ padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#f0fdf4", color: "#166534" }}
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
                      <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                        {["Cliente","Placa","Días sin pago","Deuda estimada","Último pago",""].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: "#64748b", fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {moraDetallada.map(m => (
                        <tr key={m.id} onClick={() => onNavigate?.("ficha_cliente", m.clienteId)} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 700, textTransform: "uppercase" }}>{m.cliente}</td>
                          <td style={{ padding: "8px 10px" }}>{m.placa}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontWeight: 700, fontSize: 12, background: m.diasSinPago > 7 ? "#fee2e2" : "#fef3c7", color: m.diasSinPago > 7 ? "#991b1b" : "#92400e" }}>{m.diasSinPago}d</span>
                          </td>
                          <td style={{ padding: "8px 10px", fontWeight: 700, color: "#991b1b" }}>$ {fmt(m.deudaEstimada)}</td>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>{m.ultimoPago ? new Date(m.ultimoPago + "T00:00:00").toLocaleDateString("es-CO") : <span style={{ color: "#94a3b8" }}>Sin pagos</span>}</td>
                          <td style={{ padding: "8px 6px" }}>
                            {onNavigate && (
                              <div style={{ display: "flex", gap: 4 }}>
                                <button onClick={e => { e.stopPropagation(); onNavigate("ficha_cliente", m.clienteId); }} style={{ padding: "3px 7px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#0284c7" }}>👤</button>
                                {m.motoId && <button onClick={e => { e.stopPropagation(); onNavigate("ficha_moto", m.motoId!); }} style={{ padding: "3px 7px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#f0fdf4", color: "#166534" }}>🏍️</button>}
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
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "#92400e" }}>⚠️ Base casi completada — gestionar cambio de contrato</div>
              <div style={{ display: "grid", gap: 8 }}>
                {diasBase.map(c => {
                  const cliente = clientes.find(cl => cl.id === c.cliente_id);
                  const ahorro = c.ahorro_acumulado ?? 0;
                  const p = Math.min(100, Math.round((ahorro / 510000) * 100));
                  return (
                    <div key={c.id} style={{ padding: "10px 14px", borderRadius: 12, background: "#fef3c7", border: "1px solid #fcd34d" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ fontWeight: 700, textTransform: "uppercase" }}>{cliente?.nombre ?? "—"}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 13 }}>$ {fmt(ahorro)} / $510.000 ({p}%)</span>
                          {onNavigate && <button onClick={() => onNavigate("ficha_cliente", c.cliente_id)} style={{ padding: "3px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#0284c7" }}>Ver ficha</button>}
                        </div>
                      </div>
                      <div style={{ marginTop: 6, height: 6, borderRadius: 999, background: "rgba(0,0,0,0.1)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 999, width: `${p}%`, background: "#f59e0b" }} />
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
            <KPI label="Total motos"      value={String(motos.length)}                                                        color="#334155" />
            <KPI label="Asignadas"        value={String(motos.filter(m => m.estado === "Asignada").length)}                   color="#166534" bg="#f0fdf4" />
            <KPI label="Disponibles"      value={String(motos.filter(m => m.estado === "Disponible").length)}                 color="#0284c7" />
            <KPI label="En taller"        value={String(motos.filter(m => m.estado === "Mantenimiento").length)}                  color="#92400e" />
            <KPI label="Retenciones"      value={String(motos.filter(m => ["Fiscalia","Transito","Garantia"].includes(m.estado as string)).length)} color="#991b1b" bg="#fff5f5" />
            <KPI label="Clientes activos" value={String(clientesActivos)}                                                     color="#166534" />
            <KPI label="En proceso"       value={String(clientesEnProceso)}                                                   color="#92400e" />
            <KPI label="Nuevos este mes"  value={String(clientesNuevosMes)}                                                   color="#0284c7" />
          </div>

          {/* Flota por estado */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Flota por estado ({motos.length} motos)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8 }}>
              {motosPorEstado.map(([estado, count]) => {
                const color = ESTADO_MOTO_COLOR[estado] ?? "#334155";
                return (
                  <div key={estado} style={{ padding: "10px 12px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color }}>{count}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 2 }}>{estado}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{pct(count, motos.length)}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 14 }}>
              {motosPorEstado.map(([estado, count]) => (
                <BarraN key={estado} label={estado} valor={count} total={motos.length} color={ESTADO_MOTO_COLOR[estado] ?? "#94a3b8"} />
              ))}
            </div>
          </div>

          {/* Vencimientos */}
          {alertasVencimiento.length > 0 && (
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#92400e" }}>📋 Documentos venciendo — próximos 30 días</div>

              {isMobile ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {alertasVencimiento.map(a => (
                    <div key={a.id} style={{ padding: "12px 14px", borderRadius: 14, background: "#fffbeb", border: "1px solid #fde68a" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{a.placa}</span>
                        {onNavigate && (
                          <button onClick={() => onNavigate("ficha_moto", a.id)} style={{ padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#f0fdf4", color: "#166534" }}>🏍️ Ver moto</button>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                        <div>
                          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>SOAT vence</div>
                          <div style={{ color: (a.diasSeguro ?? 999) < 0 ? "#991b1b" : "#334155" }}>{a.seguro ? new Date(a.seguro + "T00:00:00").toLocaleDateString("es-CO") : "—"}</div>
                          {a.diasSeguro !== null && (
                            <span style={{ display: "inline-block", marginTop: 4, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: a.diasSeguro < 0 ? "#fee2e2" : a.diasSeguro < 10 ? "#fef3c7" : "#f0fdf4", color: a.diasSeguro < 0 ? "#991b1b" : a.diasSeguro < 10 ? "#92400e" : "#166534" }}>
                              {a.diasSeguro < 0 ? `${Math.abs(a.diasSeguro)}d vencida` : `${a.diasSeguro}d`}
                            </span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Tecno vence</div>
                          <div style={{ color: (a.diasTecno ?? 999) < 0 ? "#991b1b" : "#334155" }}>{a.tecno ? new Date(a.tecno + "T00:00:00").toLocaleDateString("es-CO") : "—"}</div>
                          {a.diasTecno !== null && (
                            <span style={{ display: "inline-block", marginTop: 4, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: a.diasTecno < 0 ? "#fee2e2" : a.diasTecno < 10 ? "#fef3c7" : "#f0fdf4", color: a.diasTecno < 0 ? "#991b1b" : a.diasTecno < 10 ? "#92400e" : "#166534" }}>
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
                      <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                        {["Placa","SOAT vence","Días","Tecno vence","Días",""].map((h, i) => (
                          <th key={i} style={{ textAlign: "left", padding: "8px 10px", color: "#64748b", fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {alertasVencimiento.map(a => (
                        <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 700 }}>{a.placa}</td>
                          <td style={{ padding: "8px 10px", color: (a.diasSeguro ?? 999) < 0 ? "#991b1b" : "#334155" }}>
                            {a.seguro ? new Date(a.seguro + "T00:00:00").toLocaleDateString("es-CO") : "—"}
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            {a.diasSeguro !== null && (
                              <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: a.diasSeguro < 0 ? "#fee2e2" : a.diasSeguro < 10 ? "#fef3c7" : "#f0fdf4", color: a.diasSeguro < 0 ? "#991b1b" : a.diasSeguro < 10 ? "#92400e" : "#166534" }}>
                                {a.diasSeguro < 0 ? `${Math.abs(a.diasSeguro)}d vencida` : `${a.diasSeguro}d`}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "8px 10px", color: (a.diasTecno ?? 999) < 0 ? "#991b1b" : "#334155" }}>
                            {a.tecno ? new Date(a.tecno + "T00:00:00").toLocaleDateString("es-CO") : "—"}
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            {a.diasTecno !== null && (
                              <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: a.diasTecno < 0 ? "#fee2e2" : a.diasTecno < 10 ? "#fef3c7" : "#f0fdf4", color: a.diasTecno < 0 ? "#991b1b" : a.diasTecno < 10 ? "#92400e" : "#166534" }}>
                                {a.diasTecno < 0 ? `${Math.abs(a.diasTecno)}d vencida` : `${a.diasTecno}d`}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "8px 6px" }}>
                            {onNavigate && (
                              <button onClick={() => onNavigate("ficha_moto", a.id)} style={{ padding: "3px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#f0fdf4", color: "#166534" }}>🏍️ Ficha</button>
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

      {/* ── TAB EXPORTAR ── */}
      {tab === "exportar" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ ...card, display: "grid", gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Exportar datos</div>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Período seleccionado: <strong>{RANGOS.find(r => r.key === rango)?.label}</strong> ({desde} → {hasta})</p>
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
                desc: `${moraDetallada.length} contratos en mora · Cliente, Placa, Días, Deuda, Último pago`,
                onClick: () => {
                  const filas = moraDetallada.map(m => [m.cliente.replace(/,/g," "), m.placa, String(m.diasSinPago), String(m.deudaEstimada), m.ultimoPago ?? "Sin pagos"]);
                  exportarCSV(filas, ["Cliente","Placa","Dias sin pago","Deuda estimada","Ultimo pago"], `mora-${hoyStr}.csv`);
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
              {
                label: "🖨️ Imprimir reporte PDF",
                desc: "Genera un PDF imprimible con todos los datos del período",
                onClick: imprimirReporte,
              },
            ].map((btn, i) => (
              <button key={i} onClick={btn.onClick} style={{ padding: "14px 18px", borderRadius: 14, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{btn.label}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{btn.desc}</div>
                </div>
                <span style={{ fontSize: 20, color: "#cbd5e1" }}>›</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
