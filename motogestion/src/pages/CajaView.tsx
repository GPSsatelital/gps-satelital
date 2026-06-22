import React, { useMemo, useState } from "react";
import { usePagos } from "../hooks/usePagos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const card: React.CSSProperties = {
  background: "white", borderRadius: 16, padding: 16,
  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 14,
  border: "1px solid #cbd5e1", outline: "none", fontSize: 14, boxSizing: "border-box",
};
const primaryBtn: React.CSSProperties = {
  background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)",
  color: "white", border: "none", borderRadius: 14, padding: "12px 20px",
  fontWeight: 700, cursor: "pointer", fontSize: 14,
};

function fmt(n: number) {
  return Math.round(n).toLocaleString("es-CO");
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("es-CO");
}

function miniBtn(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, border: "none", borderRadius: 999, padding: "6px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" };
}

export default function CajaView() {
  const { profile } = useAuth();
  const { pagos, confirmarPago, rechazarPago } = usePagos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();

  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => new Date().toISOString().slice(0, 10));
  const [observaciones, setObservaciones] = useState("");
  const [cerrando, setCerrando] = useState(false);
  const [mensajeCierre, setMensajeCierre] = useState<string | null>(null);

  const puedeRegistrar = profile?.role === "SECRETARIA" || profile?.role === "ADMIN_PRINCIPAL";

  const pagosDelDia = useMemo(() => {
    return pagos.filter(p => p.fecha === fechaSeleccionada);
  }, [pagos, fechaSeleccionada]);

  const efectivoConfirmado = pagosDelDia
    .filter(p => p.metodo === "Efectivo" && p.estado === "Confirmado" && p.tipo_registro !== "campo")
    .reduce((a, p) => a + p.valor, 0);

  const transferenciaConfirmada = pagosDelDia
    .filter(p => p.metodo === "Transferencia" && p.estado === "Confirmado")
    .reduce((a, p) => a + p.valor, 0);

  const campoConfirmado = pagosDelDia
    .filter(p => p.tipo_registro === "campo" && p.estado === "Confirmado")
    .reduce((a, p) => a + p.valor, 0);

  const totalConfirmado = efectivoConfirmado + transferenciaConfirmada + campoConfirmado;

  const pendientes = pagosDelDia.filter(p => p.estado === "Pendiente");
  const pendienteTotal = pendientes.reduce((a, p) => a + p.valor, 0);

  function infoCliente(contratoId: string) {
    const contrato = contratos.find(c => c.id === contratoId);
    const cliente = contrato ? clientes.find(cl => cl.id === contrato.cliente_id) : null;
    const moto = contrato ? motos.find(m => m.id === contrato.moto_id) : null;
    return { cliente, moto };
  }

  async function handleCerrarCaja() {
    if (!profile) return;
    setCerrando(true);
    setMensajeCierre(null);

    const detalle = pagosDelDia
      .filter(p => p.estado === "Confirmado")
      .map(p => {
        const { cliente, moto } = infoCliente(p.contrato_id);
        return {
          pago_id: p.id,
          cliente: cliente?.nombre ?? "Sin nombre",
          moto: moto?.placa ?? "Sin placa",
          valor: p.valor,
          metodo: p.metodo,
          tipo_registro: p.tipo_registro,
        };
      });

    const { error } = await supabase.from("caja_diaria").insert({
      fecha: fechaSeleccionada,
      total_efectivo: efectivoConfirmado + campoConfirmado,
      total_transferencias: transferenciaConfirmada,
      total_confirmado: totalConfirmado,
      detalle,
      cerrada_por: profile.id,
      observaciones: observaciones.trim() || null,
    });

    setCerrando(false);
    if (error) {
      setMensajeCierre("Error: " + error.message);
    } else {
      setMensajeCierre("✔ Caja del " + formatDate(fechaSeleccionada) + " cerrada correctamente.");
      setObservaciones("");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 22, margin: 0 }}>Caja diaria</h2>
          <p style={{ marginTop: 6, color: "#64748b", margin: "6px 0 0" }}>Resumen de recaudo, confirmación de transferencias y cierre de caja.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="date"
            value={fechaSeleccionada}
            onChange={e => setFechaSeleccionada(e.target.value)}
            style={{ ...inputStyle, width: "auto" }}
          />
          <button
            onClick={() => {
              const pagosConfirmados = pagosDelDia.filter(p => p.estado === "Confirmado");
              const win = window.open("", "_blank", "width=800,height=600");
              if (!win) return;
              const filas = pagosConfirmados.map(p => {
                const { cliente, moto } = infoCliente(p.contrato_id);
                return `<tr>
                  <td>${cliente?.nombre ?? "Sin cliente"}</td>
                  <td>${moto?.placa ?? "—"}</td>
                  <td>${p.metodo}${p.tipo_registro === "campo" ? " · Campo" : ""}</td>
                  <td style="text-align:right">$ ${fmt(p.valor)}</td>
                </tr>`;
              }).join("");
              const doc = win.document;
              doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
                <title>Caja Diaria ${formatDate(fechaSeleccionada)}</title>
                <style>
                  body{font-family:sans-serif;padding:24px;color:#0f172a}
                  h1{font-size:20px;margin:0 0 4px}
                  .sub{color:#64748b;font-size:13px;margin-bottom:20px}
                  .kpis{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px}
                  .kpi{border:1px solid #e2e8f0;border-radius:10px;padding:12px 18px;min-width:130px}
                  .kpi-label{font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700}
                  .kpi-val{font-size:20px;font-weight:800;margin-top:4px}
                  table{width:100%;border-collapse:collapse;font-size:13px}
                  th{text-align:left;padding:8px 10px;background:#f1f5f9;border-bottom:2px solid #e2e8f0;font-size:11px;text-transform:uppercase;color:#64748b}
                  td{padding:8px 10px;border-bottom:1px solid #f1f5f9}
                  .total-row{font-weight:800;font-size:15px;background:#f0fdf4}
                  .footer{margin-top:24px;font-size:12px;color:#94a3b8;text-align:center}
                  @media print{body{padding:0}}
                </style></head><body>
                <h1>GPS Satelital · Caja Diaria</h1>
                <div class="sub">${formatDate(fechaSeleccionada)}</div>
                <div class="kpis">
                  <div class="kpi"><div class="kpi-label">💵 Efectivo</div><div class="kpi-val">$ ${fmt(efectivoConfirmado)}</div></div>
                  <div class="kpi"><div class="kpi-label">📲 Transferencias</div><div class="kpi-val">$ ${fmt(transferenciaConfirmada)}</div></div>
                  <div class="kpi"><div class="kpi-label">🛵 Campo</div><div class="kpi-val">$ ${fmt(campoConfirmado)}</div></div>
                  <div class="kpi" style="background:#0f172a;color:white"><div class="kpi-label" style="color:#94a3b8">TOTAL</div><div class="kpi-val" style="color:#38bdf8">$ ${fmt(totalConfirmado)}</div></div>
                </div>
                <table>
                  <thead><tr><th>Cliente</th><th>Placa</th><th>Método</th><th style="text-align:right">Valor</th></tr></thead>
                  <tbody>${filas}</tbody>
                  <tfoot><tr class="total-row"><td colspan="3">TOTAL CONFIRMADO</td><td style="text-align:right">$ ${fmt(totalConfirmado)}</td></tr></tfoot>
                </table>
                ${observaciones ? `<div style="margin-top:18px;padding:12px 14px;border-radius:8px;background:#fef3c7;font-size:13px"><strong>Observaciones:</strong> ${observaciones}</div>` : ""}
                <div class="footer">Generado por MotoGestión · ${new Date().toLocaleString("es-CO")}</div>
                </body></html>`);
              doc.close();
              win.print();
            }}
            style={{ ...primaryBtn, padding: "12px 16px", fontSize: 13, whiteSpace: "nowrap" }}
          >
            🖨️ Imprimir resumen
          </button>
        </div>
      </div>

      {/* ── Resumen por método (prominente) ── */}
      <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
        <div style={{ ...card, flex: "1 1 220px", borderTop: "4px solid #166534" }}>
          <div style={{ fontSize: 11, color: "#166534", textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>💵 Efectivo total</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#166534", marginTop: 8, lineHeight: 1 }}>$ {fmt(efectivoConfirmado + campoConfirmado)}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
            Oficina: <strong>$ {fmt(efectivoConfirmado)}</strong> · Campo: <strong>$ {fmt(campoConfirmado)}</strong>
          </div>
        </div>
        <div style={{ ...card, flex: "1 1 220px", borderTop: "4px solid #1e40af" }}>
          <div style={{ fontSize: 11, color: "#1e40af", textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>📲 Transferencias total</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#1e40af", marginTop: 8, lineHeight: 1 }}>$ {fmt(transferenciaConfirmada)}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
            {pagosDelDia.filter(p => p.metodo === "Transferencia" && p.estado === "Confirmado").length} transferencias confirmadas
          </div>
        </div>
        <div style={{ ...card, flex: "1 1 220px", background: "#0f172a", borderTop: "4px solid #38bdf8" }}>
          <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>TOTAL DEL DÍA</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#38bdf8", marginTop: 8, lineHeight: 1 }}>$ {fmt(totalConfirmado)}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
            {pagosDelDia.filter(p => p.estado === "Confirmado").length} pagos confirmados
          </div>
        </div>
      </div>

      {/* ── Timeline del día ── */}
      <div style={{ ...card, marginTop: 20 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 17, color: "#0f172a" }}>
          Cronología del día — {formatDate(fechaSeleccionada)}
        </h3>
        {pagosDelDia.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: 14 }}>Sin pagos registrados para esta fecha.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {[...pagosDelDia]
              .sort((a, b) => {
                const ta = (a as unknown as { created_at?: string }).created_at ?? a.fecha;
                const tb = (b as unknown as { created_at?: string }).created_at ?? b.fecha;
                return ta.localeCompare(tb);
              })
              .map(p => {
                const { cliente, moto } = infoCliente(p.contrato_id);
                const rawDate = (p as unknown as { created_at?: string }).created_at;
                const hora = rawDate ? new Date(rawDate).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : null;
                const metodoBg = p.metodo === "Efectivo" ? "#dcfce7" : "#dbeafe";
                const metodoColor = p.metodo === "Efectivo" ? "#166534" : "#1e40af";
                return (
                  <div key={p.id} style={{
                    display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                    padding: "10px 14px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0",
                  }}>
                    {hora && (
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", minWidth: 44 }}>{hora}</div>
                    )}
                    <span style={{ padding: "4px 10px", borderRadius: 999, background: metodoBg, color: metodoColor, fontSize: 12, fontWeight: 700 }}>
                      {p.metodo}{p.tipo_registro === "campo" ? " · Campo" : ""}
                    </span>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", color: "#0f172a" }}>
                        {cliente?.nombre ?? "Sin cliente"}{moto?.placa ? ` · ${moto.placa}` : ""}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: p.estado === "Confirmado" ? "#166534" : p.estado === "Rechazado" ? "#991b1b" : "#92400e" }}>
                      $ {fmt(p.valor)}
                    </div>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{p.estado}</span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── Pendientes por confirmar ── */}
      {pendientes.length > 0 && (
        <div style={{ ...card, marginTop: 20, borderLeft: "4px solid #f59e0b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#92400e" }}>Pagos pendientes de confirmar</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Total pendiente: <strong>$ {fmt(pendienteTotal)}</strong></div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {pendientes.map(p => {
              const { cliente, moto } = infoCliente(p.contrato_id);
              return (
                <div key={p.id} style={{
                  padding: "12px 14px", borderRadius: 14,
                  background: p.tipo_registro === "campo" ? "#fffbeb" : "#eff6ff",
                  border: `1px solid ${p.tipo_registro === "campo" ? "#fde68a" : "#bfdbfe"}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>
                      {moto?.placa ? `${moto.placa} · ` : ""}{cliente?.nombre ?? "Sin cliente"}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {p.tipo_registro === "campo" ? "🛵 Cobro en campo" : "📲 Transferencia"} · {p.metodo}
                      {p.comprobante_url && <span style={{ color: "#166534" }}> · 📎 Con comprobante</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: 16 }}>$ {fmt(p.valor)}</span>
                    {puedeRegistrar && (
                      <>
                        <button onClick={() => confirmarPago(p.id)} style={miniBtn("#dcfce7", "#166534")}>✔ Confirmar</button>
                        <button onClick={() => rechazarPago(p.id)} style={miniBtn("#fee2e2", "#991b1b")}>✕ Rechazar</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* ── Cierre de caja ── */}
      {puedeRegistrar && (
        <div style={{ ...card, marginTop: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 17 }}>Cerrar caja</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Observaciones (opcional)</div>
              <textarea
                style={{ ...inputStyle, minHeight: 70 }}
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                placeholder="Novedades del día, inconsistencias, notas para el equipo..."
              />
            </div>
            {mensajeCierre && (
              <div style={{
                padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 14,
                background: mensajeCierre.startsWith("Error") ? "#fee2e2" : "#dcfce7",
                color: mensajeCierre.startsWith("Error") ? "#991b1b" : "#166534",
              }}>
                {mensajeCierre}
              </div>
            )}
            <button onClick={handleCerrarCaja} disabled={cerrando || totalConfirmado === 0} style={{ ...primaryBtn, opacity: totalConfirmado === 0 ? 0.5 : 1 }}>
              {cerrando ? "Cerrando..." : `Cerrar caja · $ ${fmt(totalConfirmado)}`}
            </button>
            {totalConfirmado === 0 && (
              <div style={{ fontSize: 13, color: "#64748b" }}>No hay pagos confirmados para cerrar la caja de esta fecha.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
