import { useMemo, useState } from "react";
import type { ViewKey } from "../App";
import { usePagos } from "../hooks/usePagos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

function isoMes(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
}

function exportarCSV(rows: string[][], header: string[], nombre: string) {
  const contenido = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob(["﻿" + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nombre; a.click();
  URL.revokeObjectURL(url);
}

export default function HistorialPagosView({ onNavigate }: {
  onNavigate: (view: ViewKey, filter?: string) => void;
}) {
  const mesActual = isoMes(0);
  const [desde, setDesde] = useState(`${mesActual}-01`);
  const [hasta, setHasta] = useState(new Date().toISOString().slice(0, 10));
  const [busqueda, setBusqueda] = useState("");
  const [metodo, setMetodo] = useState<"todos" | "Efectivo" | "Transferencia">("todos");
  const [estadoFiltro, setEstadoFiltro] = useState<"todos" | "Confirmado" | "Pendiente" | "Rechazado">("todos");

  const { pagos } = usePagos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();

  // Build enriched rows
  const pagosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return pagos.filter(p => {
      if (p.fecha < desde || p.fecha > hasta) return false;
      if (metodo !== "todos" && p.metodo !== metodo) return false;
      if (estadoFiltro !== "todos" && p.estado !== estadoFiltro) return false;
      if (q) {
        const c = contratos.find(ct => ct.id === p.contrato_id);
        const cl = clientes.find(cl => cl.id === c?.cliente_id);
        const m = c?.moto_id ? motos.find(m => m.id === c.moto_id) : null;
        const match = (cl?.nombre ?? "").toLowerCase().includes(q) || (m?.placa ?? "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => {
      const dc = b.fecha.localeCompare(a.fecha);
      if (dc !== 0) return dc;
      return b.created_at.localeCompare(a.created_at);
    });
  }, [pagos, contratos, clientes, motos, desde, hasta, metodo, estadoFiltro, busqueda]);

  const totalConf = useMemo(() => pagosFiltrados.filter(p => p.estado === "Confirmado").reduce((s, p) => s + p.valor, 0), [pagosFiltrados]);
  const totalEf = useMemo(() => pagosFiltrados.filter(p => p.estado === "Confirmado" && p.metodo === "Efectivo").reduce((s, p) => s + p.valor, 0), [pagosFiltrados]);
  const totalTr = useMemo(() => pagosFiltrados.filter(p => p.estado === "Confirmado" && p.metodo === "Transferencia").reduce((s, p) => s + p.valor, 0), [pagosFiltrados]);
  const totalPend = useMemo(() => pagosFiltrados.filter(p => p.estado === "Pendiente").reduce((s, p) => s + p.valor, 0), [pagosFiltrados]);

  function getInfo(p: typeof pagos[0]) {
    const c = contratos.find(ct => ct.id === p.contrato_id);
    const cl = clientes.find(cl => cl.id === c?.cliente_id);
    const m = c?.moto_id ? motos.find(mo => mo.id === c.moto_id) : null;
    return { cliente: cl, moto: m };
  }

  function handleExportar() {
    const rows = pagosFiltrados.map(p => {
      const { cliente, moto } = getInfo(p);
      const hora = p.created_at ? new Date(p.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "";
      return [
        p.fecha, hora,
        (cliente?.nombre ?? "—").replace(/,/g, " "),
        moto?.placa ?? "—",
        p.metodo,
        p.tipo_registro,
        p.estado,
        String(p.valor),
      ];
    });
    exportarCSV(rows, ["Fecha", "Hora", "Cliente", "Placa", "Metodo", "Tipo", "Estado", "Valor"], `pagos-${desde}-${hasta}.csv`);
  }

  const isMobile = window.innerWidth < 900;

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Historial de Pagos</h2>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{pagosFiltrados.length} registro{pagosFiltrados.length !== 1 ? "s" : ""} encontrado{pagosFiltrados.length !== 1 ? "s" : ""}</div>
        </div>
        <button
          onClick={handleExportar}
          style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #cbd5e1", background: "white", color: "#334155", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          ⬇️ Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div style={{ background: "white", borderRadius: 16, padding: "16px 20px", marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 160 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Buscar</label>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Cliente o placa..."
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Método</label>
          <select value={metodo} onChange={e => setMetodo(e.target.value as typeof metodo)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}>
            <option value="todos">Todos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Estado</label>
          <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value as typeof estadoFiltro)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}>
            <option value="todos">Todos</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label: "Hoy", from: new Date().toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) },
            { label: "Esta semana", from: (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toISOString().slice(0, 10); })(), to: new Date().toISOString().slice(0, 10) },
            { label: "Este mes", from: `${mesActual}-01`, to: new Date().toISOString().slice(0, 10) },
          ].map(r => (
            <button key={r.label} onClick={() => { setDesde(r.from); setHasta(r.to); }}
              style={{ padding: "8px 12px", borderRadius: 10, border: "none", background: desde === r.from && hasta === r.to ? "#0284c7" : "#f1f5f9", color: desde === r.from && hasta === r.to ? "white" : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Total confirmado", val: totalConf, color: "#166534", bg: "#dcfce7" },
          { label: "💵 Efectivo", val: totalEf, color: "#166534", bg: "#f0fdf4" },
          { label: "🏦 Transferencia", val: totalTr, color: "#1d4ed8", bg: "#dbeafe" },
          { label: "⏳ Pendiente", val: totalPend, color: "#92400e", bg: "#fef3c7" },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: kpi.bg, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: kpi.color, textTransform: "uppercase" }}>{kpi.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: kpi.color, marginTop: 4 }}>${fmt(kpi.val)}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      {pagosFiltrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: 64, background: "white", borderRadius: 16, color: "#64748b" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 700 }}>Sin pagos en este período</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Ajusta los filtros o el rango de fechas</div>
        </div>
      ) : isMobile ? (
        /* Mobile: cards */
        <div style={{ display: "grid", gap: 8 }}>
          {pagosFiltrados.map(p => {
            const { cliente, moto } = getInfo(p);
            const hora = p.created_at ? new Date(p.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "—";
            const estadoStyle = p.estado === "Confirmado" ? { bg: "#dcfce7", color: "#166534" } : p.estado === "Pendiente" ? { bg: "#fef3c7", color: "#92400e" } : { bg: "#f1f5f9", color: "#64748b" };
            return (
              <div key={p.id} style={{ background: "white", borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid ${estadoStyle.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cliente ? (
                        <button onClick={() => onNavigate("ficha_cliente", cliente.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0f172a", fontWeight: 800, fontSize: 14, padding: 0, textTransform: "uppercase" }}>
                          {cliente.nombre}
                        </button>
                      ) : "—"}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                      {moto && (
                        <button onClick={() => onNavigate("ficha_moto", moto.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0284c7", fontWeight: 700, fontSize: 13, padding: 0 }}>
                          🏍️ {moto.placa}
                        </button>
                      )}
                      <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: p.metodo === "Efectivo" ? "#dcfce7" : "#dbeafe", color: p.metodo === "Efectivo" ? "#166534" : "#1d4ed8" }}>{p.metodo}</span>
                      <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: estadoStyle.bg, color: estadoStyle.color }}>{p.estado}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{p.fecha} · {hora} · {p.tipo_registro}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: p.estado === "Rechazado" ? "#94a3b8" : "#0f172a", flexShrink: 0, textDecoration: p.estado === "Rechazado" ? "line-through" : "none" }}>
                    ${fmt(p.valor)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop: table */
        <div style={{ background: "white", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Fecha", "Hora", "Cliente", "Placa", "Método", "Tipo", "Estado", "Valor"].map(h => (
                    <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 700, color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagosFiltrados.map(p => {
                  const { cliente, moto } = getInfo(p);
                  const hora = p.created_at ? new Date(p.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "—";
                  const estadoStyle = p.estado === "Confirmado" ? { bg: "#dcfce7", color: "#166534" } : p.estado === "Pendiente" ? { bg: "#fef3c7", color: "#92400e" } : { bg: "#f1f5f9", color: "#64748b" };
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 14px", color: "#64748b", whiteSpace: "nowrap" }}>{p.fecha}</td>
                      <td style={{ padding: "10px 14px", color: "#94a3b8", fontSize: 12 }}>{hora}</td>
                      <td style={{ padding: "10px 14px", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cliente ? (
                          <button onClick={() => onNavigate("ficha_cliente", cliente.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0f172a", fontWeight: 700, fontSize: 13, padding: 0, textTransform: "uppercase", textAlign: "left" }}>
                            {cliente.nombre}
                          </button>
                        ) : <span style={{ color: "#94a3b8" }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        {moto ? (
                          <button onClick={() => onNavigate("ficha_moto", moto.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0284c7", fontWeight: 700, padding: 0, fontSize: 13 }}>
                            {moto.placa}
                          </button>
                        ) : <span style={{ color: "#94a3b8" }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: p.metodo === "Efectivo" ? "#dcfce7" : "#dbeafe", color: p.metodo === "Efectivo" ? "#166534" : "#1d4ed8" }}>{p.metodo}</span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#64748b", fontSize: 12 }}>{p.tipo_registro}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: estadoStyle.bg, color: estadoStyle.color }}>{p.estado}</span>
                      </td>
                      <td style={{ padding: "10px 14px", fontWeight: 800, color: p.estado === "Rechazado" ? "#94a3b8" : "#0f172a", textAlign: "right", textDecoration: p.estado === "Rechazado" ? "line-through" : "none" }}>
                        ${fmt(p.valor)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
                  <td colSpan={7} style={{ padding: "12px 14px", fontWeight: 700, fontSize: 13, color: "#334155" }}>
                    {pagosFiltrados.length} registros · Confirmados: ${fmt(totalConf)}
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 900, fontSize: 15, color: "#166534", textAlign: "right" }}>
                    ${fmt(totalConf)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
