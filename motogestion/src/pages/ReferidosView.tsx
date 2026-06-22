import React, { useMemo, useState } from "react";
import { useClientes } from "../hooks/useClientes";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 20, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };

const PREMIOS = [
  { hito: 2,  premio: "Par de guantes de manejo",  icon: "🧤" },
  { hito: 5,  premio: "Intercomunicador",           icon: "🎧" },
  { hito: 10, premio: "Casco",                      icon: "⛑️" },
  { hito: 17, premio: "Combo completo",             icon: "🎁" },
];

function calcularPremio(confirmados: number) {
  const entregados = PREMIOS.filter(p => confirmados >= p.hito);
  const siguiente = PREMIOS.find(p => confirmados < p.hito);
  const pendiente = entregados[entregados.length - 1] ?? null;
  return { pendiente, siguiente, entregados };
}

function BarraProgreso({ actual, siguiente }: { actual: number; siguiente: number }) {
  const anterior = [...PREMIOS].reverse().find(p => actual >= p.hito)?.hito ?? 0;
  const pct = siguiente > anterior ? Math.min(100, Math.round(((actual - anterior) / (siguiente - anterior)) * 100)) : 100;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 6, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: "#0284c7", transition: "width 0.4s" }} />
      </div>
      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{actual} de {siguiente} para el siguiente premio</div>
    </div>
  );
}

export default function ReferidosView() {
  const { profile } = useAuth();
  const { clientes } = useClientes();
  const esAdmin = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";

  const [busqueda, setBusqueda] = useState("");
  const [entregando, setEntregando] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Referidores: clientes que han referido a alguien
  const referidores = useMemo(() => {
    return clientes
      .filter(c => (c.referidos_confirmados ?? 0) > 0 || clientes.some(o => o.referido_por_cedula === c.cedula))
      .map(c => {
        const referidos = clientes.filter(o => o.referido_por_cedula === c.cedula);
        const confirmados = c.referidos_confirmados ?? 0;
        const { pendiente, siguiente } = calcularPremio(confirmados);
        const premioEntregadoHasta = c.premio_referidos_entregado ?? 0;
        const premiosPendientesEntrega = PREMIOS.filter(p => confirmados >= p.hito && p.hito > premioEntregadoHasta);
        return { cliente: c, referidos, confirmados, pendiente, siguiente, premiosPendientesEntrega };
      })
      .sort((a, b) => b.confirmados - a.confirmados);
  }, [clientes]);

  const pendientesEntrega = referidores.filter(r => r.premiosPendientesEntrega.length > 0);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return referidores;
    const q = busqueda.toLowerCase();
    return referidores.filter(r => r.cliente.nombre.toLowerCase().includes(q) || r.cliente.cedula.includes(q));
  }, [referidores, busqueda]);

  async function marcarPremioEntregado(clienteId: string, hastaHito: number) {
    setEntregando(clienteId);
    const { error } = await supabase.from("clientes").update({ premio_referidos_entregado: hastaHito }).eq("id", clienteId);
    if (!error) setMsg(`🎁 Premio registrado como entregado.`);
    setEntregando(null);
    setTimeout(() => setMsg(null), 4000);
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, margin: 0 }}>Programa de referidos</h2>
      <p style={{ marginTop: 6, color: "#64748b" }}>Seguimiento de referidos y premios por cliente.</p>

      {msg && (
        <div style={{ marginTop: 12, padding: "10px 16px", borderRadius: 12, background: "#dcfce7", border: "1px solid #86efac", color: "#166534", fontWeight: 600, fontSize: 13 }}>
          {msg}
        </div>
      )}

      {/* Premios pendientes de entrega */}
      {pendientesEntrega.length > 0 && (
        <div style={{ ...card, marginTop: 20, borderLeft: "4px solid #f59e0b" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#92400e", marginBottom: 14 }}>
            🎁 Premios pendientes de entrega ({pendientesEntrega.length})
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {pendientesEntrega.map(({ cliente, confirmados, premiosPendientesEntrega }) => (
              <div key={cliente.id} style={{ padding: "12px 14px", borderRadius: 12, background: "#fefce8", border: "1px solid #fde68a", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700, textTransform: "uppercase" }}>{cliente.nombre}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{confirmados} referidos confirmados</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {premiosPendientesEntrega.map(p => (
                      <span key={p.hito} style={{ padding: "3px 10px", borderRadius: 999, background: "#fef3c7", color: "#92400e", fontSize: 12, fontWeight: 700 }}>
                        {p.icon} {p.premio}
                      </span>
                    ))}
                  </div>
                </div>
                {esAdmin && (
                  <button
                    disabled={entregando === cliente.id}
                    onClick={() => marcarPremioEntregado(cliente.id, premiosPendientesEntrega[premiosPendientesEntrega.length - 1].hito)}
                    style={{ padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", background: "#0284c7", color: "white", fontWeight: 700, fontSize: 13, opacity: entregando === cliente.id ? 0.6 : 1 }}
                  >
                    {entregando === cliente.id ? "..." : "Marcar entregado"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginTop: 20 }}>
        <div style={card}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Total referidores</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>{referidores.length}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Referidos activos</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#166534", marginTop: 6 }}>{clientes.filter(c => c.referido_por_cedula && c.estado === "Activo").length}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Premios pendientes</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#92400e", marginTop: 6 }}>{pendientesEntrega.length}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Hitos alcanzados</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0284c7", marginTop: 6 }}>{referidores.reduce((a, r) => a + PREMIOS.filter(p => r.confirmados >= p.hito).length, 0)}</div>
        </div>
      </div>

      {/* Tabla de hitos */}
      <div style={{ ...card, marginTop: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Tabla de premios</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          {PREMIOS.map(p => {
            const count = referidores.filter(r => r.confirmados >= p.hito).length;
            return (
              <div key={p.hito} style={{ padding: "14px 16px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center" }}>
                <div style={{ fontSize: 28 }}>{p.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 14, marginTop: 6 }}>{p.hito} referidos</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{p.premio}</div>
                <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: count > 0 ? "#0284c7" : "#94a3b8" }}>{count} cliente{count !== 1 ? "s" : ""} alcanzaron este hito</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de referidores */}
      <div style={{ ...card, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Todos los referidores ({referidores.length})</div>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar..." style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, width: 200 }} />
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {filtrados.length === 0 && <div style={{ color: "#94a3b8", fontSize: 13 }}>Sin resultados.</div>}
          {filtrados.map(({ cliente, referidos, confirmados, siguiente, premiosPendientesEntrega }) => {
            const { entregados } = calcularPremio(confirmados);
            return (
              <div key={cliente.id} style={{ padding: "14px 16px", borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, textTransform: "uppercase", fontSize: 14 }}>{cliente.nombre}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>C.C. {cliente.cedula} · Tel: {cliente.telefono ?? "—"}</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ padding: "4px 10px", borderRadius: 999, background: "#dbeafe", color: "#1d4ed8", fontSize: 12, fontWeight: 700 }}>
                        {confirmados} referido{confirmados !== 1 ? "s" : ""} confirmado{confirmados !== 1 ? "s" : ""}
                      </span>
                      {entregados.map(p => (
                        <span key={p.hito} style={{ padding: "4px 10px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 700 }}>
                          {p.icon} {p.premio} ✓
                        </span>
                      ))}
                      {premiosPendientesEntrega.map(p => (
                        <span key={p.hito} style={{ padding: "4px 10px", borderRadius: 999, background: "#fef3c7", color: "#92400e", fontSize: 12, fontWeight: 700 }}>
                          {p.icon} {p.premio} ⏳
                        </span>
                      ))}
                    </div>
                    {siguiente && <BarraProgreso actual={confirmados} siguiente={siguiente.hito} />}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 700 }}>{referidos.length} referido{referidos.length !== 1 ? "s" : ""} total</div>
                    <div style={{ marginTop: 2 }}>{referidos.filter(r => r.estado === "Activo").length} activos</div>
                  </div>
                </div>

                {/* Lista de referidos del cliente */}
                {referidos.length > 0 && (
                  <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
                    {referidos.map(r => (
                      <div key={r.id} style={{ padding: "8px 12px", borderRadius: 10, background: r.estado === "Activo" ? "#f0fdf4" : "#f8fafc", border: `1px solid ${r.estado === "Activo" ? "#bbf7d0" : "#e2e8f0"}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>{r.nombre}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>C.C. {r.cedula} · {r.estado}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: r.estado === "Activo" ? "#dcfce7" : "#f1f5f9", color: r.estado === "Activo" ? "#166534" : "#64748b" }}>
                            {r.estado === "Activo" ? "✓ Confirmado" : "Pendiente"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
