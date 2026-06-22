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
        <div>
          <input
            type="date"
            value={fechaSeleccionada}
            onChange={e => setFechaSeleccionada(e.target.value)}
            style={{ ...inputStyle, width: "auto" }}
          />
        </div>
      </div>

      {/* ── Resumen del día ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginTop: 20 }}>
        <div style={card}>
          <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>💵 Efectivo</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#166534", marginTop: 6 }}>$ {fmt(efectivoConfirmado)}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Recibido en oficina</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>📲 Transferencias</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#1e40af", marginTop: 6 }}>$ {fmt(transferenciaConfirmada)}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Confirmadas</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>🛵 Campo</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#92400e", marginTop: 6 }}>$ {fmt(campoConfirmado)}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Cobros en campo</div>
        </div>
        <div style={{ ...card, background: "#0f172a" }}>
          <div style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>TOTAL CONFIRMADO</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#38bdf8", marginTop: 6 }}>$ {fmt(totalConfirmado)}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{pagosDelDia.filter(p => p.estado === "Confirmado").length} pagos</div>
        </div>
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

      {/* ── Detalle de pagos confirmados ── */}
      <div style={{ ...card, marginTop: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 17 }}>Detalle de pagos confirmados — {formatDate(fechaSeleccionada)}</h3>
        {pagosDelDia.filter(p => p.estado === "Confirmado").length === 0 ? (
          <div style={{ color: "#64748b", fontSize: 14 }}>Sin pagos confirmados para esta fecha.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {pagosDelDia.filter(p => p.estado === "Confirmado").map(p => {
              const { cliente, moto } = infoCliente(p.contrato_id);
              return (
                <div key={p.id} style={{
                  padding: "10px 14px", borderRadius: 12, background: "#f8fafc",
                  border: "1px solid #e2e8f0", display: "flex",
                  justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>
                      {moto?.placa ? `${moto.placa} · ` : ""}{cliente?.nombre ?? "Sin cliente"}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {p.metodo}
                      {p.tipo_registro === "campo" && " · 🛵 Campo"}
                      {p.tipo_registro === "transferencia" && " · 📲 Transferencia"}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#166534" }}>$ {fmt(p.valor)}</div>
                </div>
              );
            })}
            {/* Subtotales */}
            <div style={{ marginTop: 8, padding: "12px 14px", borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", display: "grid", gap: 6 }}>
              {efectivoConfirmado > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span>💵 Efectivo en oficina</span><span style={{ fontWeight: 700 }}>$ {fmt(efectivoConfirmado)}</span>
                </div>
              )}
              {campoConfirmado > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span>🛵 Campo</span><span style={{ fontWeight: 700 }}>$ {fmt(campoConfirmado)}</span>
                </div>
              )}
              {transferenciaConfirmada > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span>📲 Transferencias</span><span style={{ fontWeight: 700 }}>$ {fmt(transferenciaConfirmada)}</span>
                </div>
              )}
              <div style={{ borderTop: "1px solid #bbf7d0", paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 15 }}>
                <span>TOTAL</span><span>$ {fmt(totalConfirmado)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

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
