import React, { useMemo, useState } from "react";
import { usePagos } from "../hooks/usePagos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";

const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 20, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }
function pct(a: number, b: number) { return b === 0 ? "0%" : `${Math.round((a / b) * 100)}%`; }

type Rango = "hoy" | "semana" | "mes" | "mes_anterior" | "anio";

const RANGOS: { key: Rango; label: string }[] = [
  { key: "hoy", label: "Hoy" },
  { key: "semana", label: "Esta semana" },
  { key: "mes", label: "Este mes" },
  { key: "mes_anterior", label: "Mes anterior" },
  { key: "anio", label: "Este año" },
];

function getRango(rango: Rango): { desde: string; hasta: string } {
  const hoy = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  if (rango === "hoy") {
    const s = iso(hoy);
    return { desde: s, hasta: s };
  }
  if (rango === "semana") {
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    return { desde: iso(lunes), hasta: iso(hoy) };
  }
  if (rango === "mes") {
    return { desde: iso(hoy).slice(0, 7) + "-01", hasta: iso(hoy) };
  }
  if (rango === "mes_anterior") {
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    return { desde: iso(inicio), hasta: iso(fin) };
  }
  // anio
  return { desde: `${hoy.getFullYear()}-01-01`, hasta: iso(hoy) };
}

function KPI({ label, value, sub, color, bg }: { label: string; value: string; sub?: string; color?: string; bg?: string }) {
  return (
    <div style={{ ...card, background: bg ?? "white" }}>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color ?? "#0f172a", marginTop: 8 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function BarraHorizontal({ label, valor, total, color }: { label: string; valor: number; total: number; color: string }) {
  const p = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: "#64748b" }}>$ {fmt(valor)} <span style={{ color: "#94a3b8" }}>({p}%)</span></span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 999, width: `${p}%`, background: color, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

const GRUPOS = ["RASTREADOR", "COSTA", "PRADERA"] as const;
const GRUPO_COLORS: Record<string, string> = {
  RASTREADOR: "#0284c7",
  COSTA: "#10b981",
  PRADERA: "#f59e0b",
};

function exportarCSV(filas: string[][], encabezado: string[], nombreArchivo: string) {
  const contenido = [encabezado, ...filas].map(row => row.join(",")).join("\n");
  const blob = new Blob(["﻿" + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nombreArchivo; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportesView() {
  const [rango, setRango] = useState<Rango>("mes");
  const { pagos } = usePagos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();

  const { desde, hasta } = getRango(rango);

  // ── PAGOS EN RANGO ──
  const pagosRango = useMemo(() =>
    pagos.filter(p => p.estado === "Confirmado" && p.fecha >= desde && p.fecha <= hasta),
    [pagos, desde, hasta]
  );

  const totalRecaudado = pagosRango.reduce((a, p) => a + p.valor, 0);
  const totalEfectivo = pagosRango.filter(p => p.metodo === "Efectivo").reduce((a, p) => a + p.valor, 0);
  const totalTransferencia = pagosRango.filter(p => p.metodo === "Transferencia").reduce((a, p) => a + p.valor, 0);
  const totalCampo = pagosRango.filter(p => p.tipo_registro === "campo").reduce((a, p) => a + p.valor, 0);

  // ── RECAUDO POR GRUPO ──
  const recaudoPorGrupo = useMemo(() => {
    return GRUPOS.map(grupo => {
      const motosGrupo = new Set(motos.filter(m => m.grupo === grupo).map(m => m.id));
      const contratosGrupo = new Set(contratos.filter(c => c.moto_id && motosGrupo.has(c.moto_id)).map(c => c.id));
      const total = pagosRango.filter(p => contratosGrupo.has(p.contrato_id)).reduce((a, p) => a + p.valor, 0);
      return { grupo, total };
    });
  }, [pagosRango, contratos, motos]);

  // ── RECAUDO DIARIO (últimos 14 días) ──
  const recaudoDiario = useMemo(() => {
    const dias: { fecha: string; total: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const fecha = d.toISOString().slice(0, 10);
      const total = pagos.filter(p => p.estado === "Confirmado" && p.fecha === fecha).reduce((a, p) => a + p.valor, 0);
      dias.push({ fecha, total });
    }
    return dias;
  }, [pagos]);

  const maxDiario = Math.max(...recaudoDiario.map(d => d.total), 1);

  // ── CONTRATOS ──
  const contratosActivos = contratos.filter(c => c.estado === "Activo");
  const contratosPorForma = useMemo(() => {
    const map: Record<string, number> = {};
    contratosActivos.forEach(c => {
      const k = c.forma_pago ?? "Sin definir";
      map[k] = (map[k] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [contratosActivos]);

  // ── MORA ──
  const hoyStr = new Date().toISOString().slice(0, 10);
  const enMora = useMemo(() => {
    return contratosActivos.map(c => {
      const pagosC = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado");
      const ultimo = pagosC.sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
      const dias = ultimo
        ? Math.floor((new Date().getTime() - new Date(ultimo.fecha + "T00:00:00").getTime()) / 86400000)
        : 999;
      return { contrato: c, diasSinPago: dias };
    }).filter(e => e.diasSinPago > 2);
  }, [contratosActivos, pagos]);

  const enMoraCritica = enMora.filter(e => e.diasSinPago > 7).length;
  const enMoraNormal = enMora.filter(e => e.diasSinPago <= 7).length;

  // ── MOTOS POR ESTADO ──
  const motosPorEstado = useMemo(() => {
    const map: Record<string, number> = {};
    motos.forEach(m => { map[m.estado] = (map[m.estado] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [motos]);

  const ESTADO_MOTO_COLOR: Record<string, string> = {
    Asignada: "#166534", Disponible: "#1e40af", "En taller": "#92400e",
    Recuperada: "#0369a1", Suspendida: "#6d28d9", Fiscalia: "#991b1b",
    Transito: "#be123c", Garantia: "#6b7280",
  };

  // ── CLIENTES ──
  const clientesActivos = clientes.filter(c => c.estado === "Activo").length;
  const clientesEnProceso = clientes.filter(c => c.estado === "En proceso" || c.estado === "Aprobado").length;
  const inicioMes = hoyStr.slice(0, 7) + "-01";
  const clientesNuevosMes = clientes.filter(c => c.created_at >= inicioMes).length;

  // ── PROYECCIÓN ──
  const tarifaPromedio = contratosActivos.length > 0
    ? contratosActivos.reduce((a, c) => a + (c.tarifa_diaria ?? 27000), 0) / contratosActivos.length
    : 27000;
  const proyeccionMensual = tarifaPromedio * contratosActivos.length * 26;

  // ── ALERTAS ──
  const alertasVencimiento = useMemo(() => {
    const hoy = new Date();
    const en30 = new Date(); en30.setDate(hoy.getDate() + 30);
    const iso30 = en30.toISOString().slice(0, 10);
    return motos.filter(m =>
      (m.fecha_seguro && m.fecha_seguro <= iso30) ||
      (m.fecha_tecnomecanica && m.fecha_tecnomecanica <= iso30)
    ).map(m => ({
      placa: m.placa,
      seguro: m.fecha_seguro,
      tecno: m.fecha_tecnomecanica,
    }));
  }, [motos]);

  const diasBase = useMemo(() =>
    contratos.filter(c => c.estado === "Activo" && c.tipo_ruta === "diario" && !c.base_completada && (c.ahorro_acumulado ?? 0) >= 450000),
    [contratos]
  );

  // ── REPORTE POR GRUPO (detallado) ──
  const reporteGrupos = useMemo(() => {
    return GRUPOS.map(grupo => {
      const motosGrupo = motos.filter(m => m.grupo === grupo);
      const motosGrupoIds = new Set(motosGrupo.map(m => m.id));
      const contratosGrupo = contratos.filter(c => c.moto_id && motosGrupoIds.has(c.moto_id));
      const contratosActivosGrupo = contratosGrupo.filter(c => c.estado === "Activo");
      const contratosActivosGrupoIds = new Set(contratosActivosGrupo.map(c => c.id));
      const recaudo = pagosRango.filter(p => contratosActivosGrupoIds.has(p.contrato_id)).reduce((a, p) => a + p.valor, 0);
      const moraGrupo = enMora.filter(e => contratosActivosGrupoIds.has(e.contrato.id)).length;
      return {
        grupo,
        motosAsignadas: motosGrupo.filter(m => m.estado === "Asignada").length,
        recaudo,
        contratosActivos: contratosActivosGrupo.length,
        enMora: moraGrupo,
      };
    });
  }, [motos, contratos, pagosRango, enMora]);

  // ── MORA DETALLADA (tabla) ──
  const moraDetallada = useMemo(() => {
    return enMora.map(({ contrato: c, diasSinPago }) => {
      const cliente = clientes.find(cl => cl.id === c.cliente_id);
      const moto = c.moto_id ? motos.find(m => m.id === c.moto_id) : undefined;
      const pagosC = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado");
      const ultimo = pagosC.sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
      const deudaEstimada = diasSinPago * (c.tarifa_diaria ?? 27000);
      return {
        id: c.id,
        cliente: cliente?.nombre ?? "—",
        placa: moto?.placa ?? "—",
        diasSinPago,
        deudaEstimada,
        ultimoPago: ultimo?.fecha ?? null,
      };
    }).sort((a, b) => b.diasSinPago - a.diasSinPago);
  }, [enMora, clientes, motos, pagos]);

  // ── COMPARATIVA MES ANTERIOR ──
  const comparativaMes = useMemo(() => {
    if (rango !== "mes") return null;
    const hoy = new Date();
    const inicioMesAnt = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().slice(0, 10);
    const finMesAnt = new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().slice(0, 10);
    const pagosAnt = pagos.filter(p => p.estado === "Confirmado" && p.fecha >= inicioMesAnt && p.fecha <= finMesAnt);
    const totalAnt = pagosAnt.reduce((a, p) => a + p.valor, 0);
    const delta = totalAnt > 0 ? ((totalRecaudado - totalAnt) / totalAnt) * 100 : null;
    return { totalAnt, delta };
  }, [rango, pagos, totalRecaudado]);

  // ── IMPRIMIR REPORTE PDF ──
  function imprimirReporte() {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    const fechaHoy = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
    const rangoLabel = RANGOS.find(r => r.key === rango)?.label ?? rango;

    const gruposHTML = reporteGrupos.map(g => `
      <tr>
        <td style="padding:8px 12px;font-weight:700;">${g.grupo}</td>
        <td style="padding:8px 12px;text-align:center;">${g.motosAsignadas}</td>
        <td style="padding:8px 12px;text-align:center;">$ ${fmt(g.recaudo)}</td>
        <td style="padding:8px 12px;text-align:center;">${g.contratosActivos}</td>
        <td style="padding:8px 12px;text-align:center;color:${g.enMora > 0 ? "#991b1b" : "#166534"};">${g.enMora}</td>
      </tr>
    `).join("");

    const moraHTML = moraDetallada.slice(0, 30).map(m => `
      <tr>
        <td style="padding:8px 12px;text-transform:uppercase;font-weight:600;">${m.cliente}</td>
        <td style="padding:8px 12px;">${m.placa}</td>
        <td style="padding:8px 12px;text-align:center;color:#991b1b;font-weight:700;">${m.diasSinPago}</td>
        <td style="padding:8px 12px;text-align:right;">$ ${fmt(m.deudaEstimada)}</td>
        <td style="padding:8px 12px;">${m.ultimoPago ? new Date(m.ultimoPago + "T00:00:00").toLocaleDateString("es-CO") : "—"}</td>
      </tr>
    `).join("");

    win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
      <title>Reporte MotoGestión — ${rangoLabel}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #0f172a; padding: 32px; font-size: 14px; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        h2 { font-size: 16px; margin: 24px 0 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
        .kpis { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
        .kpi { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 20px; min-width: 130px; }
        .kpi-val { font-size: 20px; font-weight: 800; color: #0284c7; }
        .kpi-lbl { font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-weight: 700; color: #64748b; }
        tr:nth-child(even) { background: #f8fafc; }
        footer { margin-top: 32px; font-size: 11px; color: #94a3b8; text-align: center; }
      </style></head><body>
      <h1>Reporte MotoGestión — GPS Satelital Cartagena</h1>
      <p style="color:#64748b;margin:0;">Período: <strong>${rangoLabel}</strong> (${desde} → ${hasta}) · Generado el ${fechaHoy}</p>

      <h2>KPIs de Recaudo</h2>
      <div class="kpis">
        <div class="kpi"><div class="kpi-val">$ ${fmt(totalRecaudado)}</div><div class="kpi-lbl">Total recaudado</div></div>
        <div class="kpi"><div class="kpi-val">$ ${fmt(totalEfectivo)}</div><div class="kpi-lbl">Efectivo</div></div>
        <div class="kpi"><div class="kpi-val">$ ${fmt(totalTransferencia)}</div><div class="kpi-lbl">Transferencias</div></div>
        <div class="kpi"><div class="kpi-val">$ ${fmt(totalCampo)}</div><div class="kpi-lbl">Cobro en campo</div></div>
        <div class="kpi"><div class="kpi-val">${contratosActivos.length}</div><div class="kpi-lbl">Contratos activos</div></div>
        <div class="kpi"><div class="kpi-val">${enMora.length}</div><div class="kpi-lbl">En mora</div></div>
      </div>

      <h2>Recaudo por Grupo</h2>
      <table>
        <thead><tr><th>Grupo</th><th>Motos asignadas</th><th>Recaudo período</th><th>Contratos activos</th><th>En mora</th></tr></thead>
        <tbody>${gruposHTML}</tbody>
      </table>

      <h2>Mora y Cartera Vencida (${moraDetallada.length} contratos)</h2>
      ${moraDetallada.length === 0 ? "<p style='color:#166534;'>Sin contratos en mora.</p>" : `
      <table>
        <thead><tr><th>Cliente</th><th>Placa</th><th>Días sin pago</th><th>Deuda estimada</th><th>Último pago</th></tr></thead>
        <tbody>${moraHTML}</tbody>
      </table>`}

      <footer>GPS Satelital Cartagena · Fredy Mora Avendaño C.C. 1.047.393.901</footer>
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, margin: 0 }}>Reportes</h2>
          <p style={{ marginTop: 6, color: "#64748b" }}>Resumen operativo y financiero en tiempo real.</p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {RANGOS.map(r => (
            <button key={r.key} onClick={() => setRango(r.key)} style={{ padding: "6px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: rango === r.key ? 700 : 500, background: rango === r.key ? "#0284c7" : "#f1f5f9", color: rango === r.key ? "white" : "#64748b" }}>
              {r.label}
            </button>
          ))}
          <button
            onClick={() => {
              const filas = pagosRango.map(p => {
                const contrato = contratos.find(c => c.id === p.contrato_id);
                const cliente = contrato ? clientes.find(cl => cl.id === contrato.cliente_id) : undefined;
                const moto = contrato?.moto_id ? motos.find(m => m.id === contrato.moto_id) : undefined;
                return [
                  p.fecha,
                  (cliente?.nombre ?? "—").replace(/,/g, " "),
                  moto?.placa ?? "—",
                  p.metodo,
                  p.tipo_registro,
                  String(p.valor),
                ];
              });
              exportarCSV(filas, ["Fecha", "Cliente", "Placa", "Metodo", "Tipo", "Valor"], `pagos-${desde}-${hasta}.csv`);
            }}
            style={{ padding: "6px 14px", borderRadius: 999, border: "1px solid #cbd5e1", cursor: "pointer", fontSize: 12, fontWeight: 600, background: "white", color: "#334155", display: "flex", alignItems: "center", gap: 6 }}
          >
            ⬇️ CSV Pagos
          </button>
          <button
            onClick={() => {
              const filas = moraDetallada.map(m => [
                m.cliente.replace(/,/g, " "),
                m.placa,
                String(m.diasSinPago),
                String(m.deudaEstimada),
                m.ultimoPago ?? "Sin pagos",
              ]);
              exportarCSV(filas, ["Cliente", "Placa", "Dias sin pago", "Deuda estimada", "Ultimo pago"], `mora-${hoyStr}.csv`);
            }}
            style={{ padding: "6px 14px", borderRadius: 999, border: "1px solid #cbd5e1", cursor: "pointer", fontSize: 12, fontWeight: 600, background: "white", color: "#334155", display: "flex", alignItems: "center", gap: 6 }}
          >
            ⬇️ CSV Mora
          </button>
          {alertasVencimiento.length > 0 && (
            <button
              onClick={() => {
                const filas = alertasVencimiento.map(a => [
                  a.placa,
                  a.seguro ?? "—",
                  a.tecno ?? "—",
                ]);
                exportarCSV(filas, ["Placa", "SOAT vence", "Tecnomecanica vence"], `vencimientos-${hoyStr}.csv`);
              }}
              style={{ padding: "6px 14px", borderRadius: 999, border: "1px solid #cbd5e1", cursor: "pointer", fontSize: 12, fontWeight: 600, background: "white", color: "#334155", display: "flex", alignItems: "center", gap: 6 }}
            >
              ⬇️ CSV Vencimientos
            </button>
          )}
          <button
            onClick={imprimirReporte}
            style={{ padding: "6px 14px", borderRadius: 999, border: "1px solid #cbd5e1", cursor: "pointer", fontSize: 12, fontWeight: 600, background: "white", color: "#334155", display: "flex", alignItems: "center", gap: 6 }}
          >
            🖨️ Imprimir reporte
          </button>
        </div>
      </div>

      {/* Alertas */}
      {(alertasVencimiento.length > 0 || diasBase.length > 0 || enMoraCritica > 0) && (
        <div style={{ marginTop: 20, display: "grid", gap: 8 }}>
          {enMoraCritica > 0 && (
            <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fee2e2", borderLeft: "4px solid #ef4444", fontSize: 13, fontWeight: 600, color: "#991b1b" }}>
              🚨 {enMoraCritica} contrato{enMoraCritica > 1 ? "s" : ""} en mora crítica (+7 días sin pago) — requieren recolección
            </div>
          )}
          {diasBase.length > 0 && (
            <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fef3c7", borderLeft: "4px solid #f59e0b", fontSize: 13, fontWeight: 600, color: "#92400e" }}>
              ⚠️ {diasBase.length} cliente{diasBase.length > 1 ? "s" : ""} cerca de completar la base ($510.000) — gestionar cambio de contrato
            </div>
          )}
          {alertasVencimiento.length > 0 && (
            <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fef3c7", borderLeft: "4px solid #f59e0b", fontSize: 13, fontWeight: 600, color: "#92400e" }}>
              ⚠️ {alertasVencimiento.length} moto{alertasVencimiento.length > 1 ? "s" : ""} con SOAT o tecnomecánica venciendo en los próximos 30 días
              <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {alertasVencimiento.slice(0, 6).map(a => (
                  <span key={a.placa} style={{ padding: "2px 8px", borderRadius: 999, background: "white", fontSize: 12 }}>{a.placa}</span>
                ))}
                {alertasVencimiento.length > 6 && <span style={{ fontSize: 12, color: "#92400e" }}>+{alertasVencimiento.length - 6} más</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPIs recaudo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginTop: 20 }}>
        <KPI label="Total recaudado" value={`$ ${fmt(totalRecaudado)}`} color="#166534" />
        <KPI label="Efectivo" value={`$ ${fmt(totalEfectivo)}`} sub={pct(totalEfectivo, totalRecaudado)} color="#0284c7" />
        <KPI label="Transferencias" value={`$ ${fmt(totalTransferencia)}`} sub={pct(totalTransferencia, totalRecaudado)} color="#6d28d9" />
        <KPI label="Cobro en campo" value={`$ ${fmt(totalCampo)}`} sub={pct(totalCampo, totalRecaudado)} color="#0369a1" />
        <KPI label="Proyección mensual" value={`$ ${fmt(proyeccionMensual)}`} sub="~26 días L-S" />
      </div>

      {/* Comparativa mes anterior */}
      {comparativaMes && (
        <div style={{ ...card, marginTop: 14, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Comparativa vs mes anterior:</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13 }}>Mes anterior: <strong>$ {fmt(comparativaMes.totalAnt)}</strong></span>
            {comparativaMes.delta !== null && (
              <span style={{
                padding: "3px 10px", borderRadius: 999, fontSize: 13, fontWeight: 700,
                background: comparativaMes.delta >= 0 ? "#dcfce7" : "#fee2e2",
                color: comparativaMes.delta >= 0 ? "#166534" : "#991b1b"
              }}>
                {comparativaMes.delta >= 0 ? "▲" : "▼"} {Math.abs(Math.round(comparativaMes.delta))}%
              </span>
            )}
            {comparativaMes.delta === null && <span style={{ fontSize: 12, color: "#94a3b8" }}>sin datos del mes anterior</span>}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 16 }}>

        {/* Recaudo por grupo */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Recaudo por grupo</div>
          {recaudoPorGrupo.map(({ grupo, total }) => (
            <BarraHorizontal key={grupo} label={grupo} valor={total} total={totalRecaudado} color={GRUPO_COLORS[grupo] ?? "#94a3b8"} />
          ))}
          {totalRecaudado === 0 && <div style={{ color: "#94a3b8", fontSize: 13 }}>Sin pagos en el período.</div>}
        </div>

        {/* Recaudo diario — últimos 14 días */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Recaudo diario — últimos 14 días</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
            {recaudoDiario.map(({ fecha, total }) => {
              const h = total === 0 ? 2 : Math.max(4, Math.round((total / maxDiario) * 80));
              const isHoy = fecha === hoyStr;
              return (
                <div key={fecha} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div title={`$ ${fmt(total)}`} style={{ width: "100%", height: h, borderRadius: 4, background: isHoy ? "#0284c7" : total === 0 ? "#e2e8f0" : "#93c5fd", transition: "height 0.3s" }} />
                  <div style={{ fontSize: 9, color: isHoy ? "#0284c7" : "#94a3b8", fontWeight: isHoy ? 700 : 400 }}>
                    {new Date(fecha + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" }).split(" ")[0]}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8", textAlign: "center" }}>Pasa el cursor sobre cada barra para ver el valor</div>
        </div>
      </div>

      {/* Reporte detallado por grupo */}
      <div style={{ ...card, marginTop: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Reporte por grupo de inversión</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {reporteGrupos.map(g => (
            <div key={g.grupo} style={{ flex: 1, minWidth: 180, borderRadius: 14, border: `2px solid ${GRUPO_COLORS[g.grupo]}`, padding: "16px 18px" }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: GRUPO_COLORS[g.grupo], marginBottom: 12, letterSpacing: 0.5 }}>{g.grupo}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ padding: "8px 10px", borderRadius: 10, background: "#f8fafc", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{g.motosAsignadas}</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, marginTop: 2 }}>Motos asignadas</div>
                </div>
                <div style={{ padding: "8px 10px", borderRadius: 10, background: "#f0f9ff", textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0284c7" }}>$ {fmt(g.recaudo)}</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, marginTop: 2 }}>Recaudo período</div>
                </div>
                <div style={{ padding: "8px 10px", borderRadius: 10, background: "#dcfce7", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#166534" }}>{g.contratosActivos}</div>
                  <div style={{ fontSize: 10, color: "#166534", fontWeight: 700, marginTop: 2 }}>Contratos activos</div>
                </div>
                <div style={{ padding: "8px 10px", borderRadius: 10, background: g.enMora > 0 ? "#fee2e2" : "#dcfce7", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: g.enMora > 0 ? "#991b1b" : "#166534" }}>{g.enMora}</div>
                  <div style={{ fontSize: 10, color: g.enMora > 0 ? "#991b1b" : "#166534", fontWeight: 700, marginTop: 2 }}>Mora activa</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 16 }}>

        {/* Cartera / Mora */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Cartera y mora</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, textAlign: "center" }}>
            <div style={{ padding: 12, borderRadius: 12, background: "#dcfce7" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#166534" }}>{contratosActivos.length - enMora.length}</div>
              <div style={{ fontSize: 11, color: "#166534", fontWeight: 700, marginTop: 4 }}>Al día</div>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: "#fef3c7" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#92400e" }}>{enMoraNormal}</div>
              <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700, marginTop: 4 }}>En mora</div>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: "#fee2e2" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#991b1b" }}>{enMoraCritica}</div>
              <div style={{ fontSize: 11, color: "#991b1b", fontWeight: 700, marginTop: 4 }}>Crítico +7d</div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <BarraHorizontal label="Al día" valor={contratosActivos.length - enMora.length} total={contratosActivos.length} color="#10b981" />
            <BarraHorizontal label="En mora" valor={enMora.length} total={contratosActivos.length} color="#ef4444" />
          </div>
        </div>

        {/* Contratos por modalidad */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Contratos activos por modalidad</div>
          {contratosPorForma.map(([forma, count]) => (
            <BarraHorizontal key={forma} label={forma} valor={count} total={contratosActivos.length} color="#0284c7" />
          ))}
          {contratosActivos.length === 0 && <div style={{ color: "#94a3b8", fontSize: 13 }}>Sin contratos activos.</div>}
          <div style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
            Total activos: <strong>{contratosActivos.length}</strong> · En proceso: <strong>{contratos.filter(c => c.estado === "En proceso").length}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 16 }}>

        {/* Flota por estado */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Flota — {motos.length} motos en total</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8 }}>
            {motosPorEstado.map(([estado, count]) => {
              const color = ESTADO_MOTO_COLOR[estado] ?? "#334155";
              return (
                <div key={estado} style={{ padding: "10px 12px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color }}>{count}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 2 }}>{estado}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{pct(count, motos.length)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clientes */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Clientes</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ padding: 14, borderRadius: 12, background: "#dcfce7", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#166534" }}>{clientesActivos}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#166534", marginTop: 4 }}>Activos</div>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "#fef3c7", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#92400e" }}>{clientesEnProceso}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginTop: 4 }}>En proceso</div>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "#f0f9ff", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0284c7" }}>{clientesNuevosMes}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0284c7", marginTop: 4 }}>Nuevos este mes</div>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#334155" }}>{clientes.length}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginTop: 4 }}>Total registrados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mora detallada — tabla */}
      {moraDetallada.length > 0 && (
        <div style={{ ...card, marginTop: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#991b1b" }}>
            🔴 Mora y cartera vencida — {moraDetallada.length} contrato{moraDetallada.length > 1 ? "s" : ""}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", padding: "8px 10px", color: "#64748b", fontWeight: 700 }}>Cliente</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", color: "#64748b", fontWeight: 700 }}>Placa</th>
                  <th style={{ textAlign: "center", padding: "8px 10px", color: "#64748b", fontWeight: 700 }}>Días sin pago</th>
                  <th style={{ textAlign: "right", padding: "8px 10px", color: "#64748b", fontWeight: 700 }}>Deuda estimada</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", color: "#64748b", fontWeight: 700 }}>Último pago</th>
                </tr>
              </thead>
              <tbody>
                {moraDetallada.map(m => (
                  <tr key={m.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px 10px", fontWeight: 700, textTransform: "uppercase" }}>{m.cliente}</td>
                    <td style={{ padding: "8px 10px" }}>{m.placa}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center" }}>
                      <span style={{
                        display: "inline-block", padding: "2px 10px", borderRadius: 999, fontWeight: 700, fontSize: 12,
                        background: m.diasSinPago > 7 ? "#fee2e2" : "#fef3c7",
                        color: m.diasSinPago > 7 ? "#991b1b" : "#92400e"
                      }}>{m.diasSinPago}d</span>
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#991b1b" }}>$ {fmt(m.deudaEstimada)}</td>
                    <td style={{ padding: "8px 10px", color: "#64748b" }}>
                      {m.ultimoPago ? new Date(m.ultimoPago + "T00:00:00").toLocaleDateString("es-CO") : <span style={{ color: "#94a3b8" }}>Sin pagos</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contratos diarios cerca de completar base */}
      {diasBase.length > 0 && (
        <div style={{ ...card, marginTop: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#92400e" }}>
            ⚠️ Contratos diarios — base casi completada
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {diasBase.map(c => {
              const cliente = clientes.find(cl => cl.id === c.cliente_id);
              const ahorro = c.ahorro_acumulado ?? 0;
              const pctAhorro = Math.min(100, Math.round((ahorro / 510000) * 100));
              return (
                <div key={c.id} style={{ padding: "10px 14px", borderRadius: 12, background: "#fef3c7", border: "1px solid #fcd34d", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 700, textTransform: "uppercase" }}>{cliente?.nombre ?? "—"}</div>
                  <div style={{ fontSize: 13 }}>Ahorro: <strong>$ {fmt(ahorro)}</strong> ({pctAhorro}% de $510.000)</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vencimientos próximos detalle */}
      {alertasVencimiento.length > 0 && (
        <div style={{ ...card, marginTop: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#92400e" }}>
            📋 Documentos por vencer — próximos 30 días
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", padding: "8px 10px", color: "#64748b", fontWeight: 700 }}>Placa</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", color: "#64748b", fontWeight: 700 }}>SOAT vence</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", color: "#64748b", fontWeight: 700 }}>Tecnomecánica vence</th>
                </tr>
              </thead>
              <tbody>
                {alertasVencimiento.map(a => (
                  <tr key={a.placa} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px 10px", fontWeight: 700 }}>{a.placa}</td>
                    <td style={{ padding: "8px 10px", color: a.seguro ? "#991b1b" : "#94a3b8" }}>
                      {a.seguro ? new Date(a.seguro + "T00:00:00").toLocaleDateString("es-CO") : "—"}
                    </td>
                    <td style={{ padding: "8px 10px", color: a.tecno ? "#991b1b" : "#94a3b8" }}>
                      {a.tecno ? new Date(a.tecno + "T00:00:00").toLocaleDateString("es-CO") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
