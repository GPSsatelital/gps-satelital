import { useEffect, useMemo, useState } from "react";
import { useClientes } from "../hooks/useClientes";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const PREMIOS = [
  { hito: 2,  premio: "Par de guantes de manejo", icon: "🧤" },
  { hito: 5,  premio: "Intercomunicador",          icon: "🎧" },
  { hito: 10, premio: "Casco",                     icon: "⛑️" },
  { hito: 17, premio: "Combo completo",            icon: "🎁" },
];

function calcularPremio(confirmados: number) {
  const entregados = PREMIOS.filter(p => confirmados >= p.hito);
  const siguiente = PREMIOS.find(p => confirmados < p.hito);
  return { entregados, siguiente };
}

function BarraProgreso({ actual, siguiente }: { actual: number; siguiente: number }) {
  const anterior = [...PREMIOS].reverse().find(p => actual >= p.hito)?.hito ?? 0;
  const pct = siguiente > anterior ? Math.min(100, Math.round(((actual - anterior) / (siguiente - anterior)) * 100)) : 100;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{actual} de {siguiente}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-hi))", transition: "width 0.4s" }} />
      </div>
      <div style={{ fontSize: 10, color: "var(--faint)", marginTop: 3 }}>Faltan {siguiente - actual} para el siguiente premio</div>
    </div>
  );
}

export default function ReferidosView() {
  const { profile } = useAuth();
  const { clientes } = useClientes();
  const esAdmin = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const [busqueda, setBusqueda] = useState("");
  const [entregando, setEntregando] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const referidores = useMemo(() => {
    return clientes
      .filter(c => (c.referidos_confirmados ?? 0) > 0 || clientes.some(o => o.referido_por_cedula === c.cedula))
      .map(c => {
        const referidos = clientes.filter(o => o.referido_por_cedula === c.cedula);
        const confirmados = c.referidos_confirmados ?? 0;
        const { entregados, siguiente } = calcularPremio(confirmados);
        const premioEntregadoHasta = c.premio_referidos_entregado ?? 0;
        const premiosPendientesEntrega = PREMIOS.filter(p => confirmados >= p.hito && p.hito > premioEntregadoHasta);
        return { cliente: c, referidos, confirmados, entregados, siguiente, premiosPendientesEntrega };
      })
      .sort((a, b) => b.confirmados - a.confirmados);
  }, [clientes]);

  const pendientesEntrega = referidores.filter(r => r.premiosPendientesEntrega.length > 0);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return referidores;
    const q = busqueda.toLowerCase();
    return referidores.filter(r => r.cliente.nombre.toLowerCase().includes(q) || r.cliente.cedula.includes(q));
  }, [referidores, busqueda]);

  const kpis = useMemo(() => ({
    totalReferidores: referidores.length,
    referidosActivos: clientes.filter(c => c.referido_por_cedula && c.estado === "Activo").length,
    premiosPendientes: pendientesEntrega.length,
    hitosAlcanzados: referidores.reduce((a, r) => a + PREMIOS.filter(p => r.confirmados >= p.hito).length, 0),
  }), [referidores, clientes, pendientesEntrega]);

  async function marcarPremioEntregado(clienteId: string, hastaHito: number) {
    setEntregando(clienteId);
    const { error } = await supabase.from("clientes").update({ premio_referidos_entregado: hastaHito }).eq("id", clienteId);
    if (!error) setMsg("Premio registrado como entregado.");
    setEntregando(null);
    setTimeout(() => setMsg(null), 4000);
  }

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: "var(--text)" }}>Programa de Referidos</h2>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>Seguimiento de referidos y premios por cliente.</div>
      </div>

      {msg && (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "var(--ok-soft)", border: "1px solid var(--ok-line)", color: "var(--ok-ink)", fontWeight: 700, fontSize: 13 }}>
          {msg}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total referidores", val: kpis.totalReferidores, bg: "var(--soft2)", color: "var(--muted2)" },
          { label: "Referidos activos", val: kpis.referidosActivos, bg: "var(--ok-soft)", color: "var(--ok-ink)" },
          { label: "Premios pendientes", val: kpis.premiosPendientes, bg: "var(--warn-soft)", color: "var(--warn-ink)" },
          { label: "Hitos alcanzados", val: kpis.hitosAlcanzados, bg: "var(--accent-soft3)", color: "var(--accent-ink)" },
        ].map(kpi => (
          <div key={kpi.label} style={{ flex: 1, minWidth: 110, background: kpi.bg, borderRadius: 14, padding: "16px 18px", border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: kpi.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: kpi.color, marginTop: 6 }}>{kpi.val}</div>
          </div>
        ))}
      </div>

      {/* Hitos / Milestones */}
      <div style={{ background: "var(--card)", borderRadius: 16, padding: "20px 24px", marginBottom: 20, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", marginBottom: 16 }}>Tabla de premios</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {PREMIOS.map(p => {
            const count = referidores.filter(r => r.confirmados >= p.hito).length;
            const entregados = referidores.filter(r => r.confirmados >= p.hito && (r.cliente.premio_referidos_entregado ?? 0) >= p.hito).length;
            const pendientes = count - entregados;
            return (
              <div key={p.hito} style={{ flex: 1, minWidth: isMobile ? 140 : 160, padding: "18px 16px", borderRadius: 14, background: "var(--soft2)", border: "1px solid var(--line)", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{p.icon}</div>
                <div style={{ fontWeight: 900, fontSize: 16, color: "var(--text)" }}>{p.hito} referidos</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{p.premio}</div>
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{count} cliente{count !== 1 ? "s" : ""} alcanzaron</div>
                  {pendientes > 0 && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--warn-ink)", background: "var(--warn-soft)", padding: "3px 8px", borderRadius: 8 }}>
                      {pendientes} pendiente{pendientes > 1 ? "s" : ""} de entrega
                    </div>
                  )}
                  {entregados > 0 && (
                    <div style={{ fontSize: 11, color: "var(--ok-ink)", fontWeight: 600 }}>{entregados} entregado{entregados > 1 ? "s" : ""}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premios pendientes de entrega */}
      {pendientesEntrega.length > 0 && (
        <div style={{ background: "var(--warn-soft2)", borderRadius: 16, padding: "20px 24px", marginBottom: 20, border: "1px solid var(--warn-line)" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--warn-ink)", marginBottom: 14 }}>
            Premios pendientes de entrega ({pendientesEntrega.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pendientesEntrega.map(({ cliente, confirmados, premiosPendientesEntrega }) => (
              <div key={cliente.id} style={{ padding: "14px 16px", borderRadius: 12, background: "var(--card)", border: "1px solid var(--warn-line)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, textTransform: "uppercase", color: "var(--text)" }}>{cliente.nombre}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{confirmados} referidos confirmados · C.C. {cliente.cedula}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {premiosPendientesEntrega.map(p => (
                      <span key={p.hito} style={{ padding: "4px 12px", borderRadius: 999, background: "var(--warn-soft)", color: "var(--warn-ink)", fontSize: 12, fontWeight: 700 }}>
                        {p.icon} {p.premio}
                      </span>
                    ))}
                  </div>
                </div>
                {esAdmin && (
                  <button
                    disabled={entregando === cliente.id}
                    onClick={() => marcarPremioEntregado(cliente.id, premiosPendientesEntrega[premiosPendientesEntrega.length - 1].hito)}
                    style={{ padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer", background: "var(--accent)", color: "var(--card)", fontWeight: 700, fontSize: 13, opacity: entregando === cliente.id ? 0.6 : 1, whiteSpace: "nowrap" }}
                  >
                    {entregando === cliente.id ? "..." : "Marcar entregado"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de referidores */}
      <div style={{ background: "var(--card)", borderRadius: 16, padding: "20px 24px", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>Todos los referidores ({referidores.length})</div>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o cédula..."
            style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13, width: isMobile ? "100%" : 240 }} />
        </div>

        {filtrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--faint)", fontSize: 13 }}>Sin resultados.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtrados.map(({ cliente, referidos, confirmados, entregados, siguiente, premiosPendientesEntrega }) => (
              <div key={cliente.id} style={{
                borderRadius: 14,
                border: premiosPendientesEntrega.length > 0 ? "1px solid var(--warn-line)" : "1px solid var(--line)",
                background: premiosPendientesEntrega.length > 0 ? "var(--warn-soft2)" : "var(--soft2)",
                overflow: "hidden",
              }}>
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 900, fontSize: 15, textTransform: "uppercase", color: "var(--text)" }}>{cliente.nombre}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>C.C. {cliente.cedula}{cliente.telefono ? ` · ${cliente.telefono}` : ""}</div>

                      {/* Badges de premios */}
                      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ padding: "4px 12px", borderRadius: 999, background: "var(--accent-soft3)", color: "var(--accent-ink)", fontSize: 12, fontWeight: 700 }}>
                          {confirmados} referido{confirmados !== 1 ? "s" : ""}
                        </span>
                        {entregados.map(p => (
                          <span key={p.hito} style={{ padding: "4px 12px", borderRadius: 999, background: "var(--ok-soft)", color: "var(--ok-ink)", fontSize: 12, fontWeight: 700 }}>
                            {p.icon} {p.premio} ✓
                          </span>
                        ))}
                        {premiosPendientesEntrega.map(p => (
                          <span key={p.hito} style={{ padding: "4px 12px", borderRadius: 999, background: "var(--warn-soft)", color: "var(--warn-ink)", fontSize: 12, fontWeight: 700 }}>
                            {p.icon} {p.premio} pendiente
                          </span>
                        ))}
                      </div>

                      {/* Progress bar */}
                      {siguiente && <BarraProgreso actual={confirmados} siguiente={siguiente.hito} />}
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "var(--accent)" }}>{referidos.length}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>referido{referidos.length !== 1 ? "s" : ""}</div>
                      <div style={{ fontSize: 11, color: "var(--ok-ink)", fontWeight: 700, marginTop: 2 }}>{referidos.filter(r => r.estado === "Activo").length} activos</div>
                    </div>
                  </div>
                </div>

                {/* Referidos del cliente */}
                {referidos.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--line)", padding: "12px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
                    {referidos.map(r => (
                      <div key={r.id} style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        background: r.estado === "Activo" ? "var(--ok-soft)" : "var(--card)",
                        border: `1px solid ${r.estado === "Activo" ? "var(--ok-line)" : "var(--line)"}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", color: "var(--text)" }}>{r.nombre}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>C.C. {r.cedula}</div>
                        </div>
                        <span style={{
                          padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: r.estado === "Activo" ? "var(--ok-soft)" : "var(--soft)",
                          color: r.estado === "Activo" ? "var(--ok-ink)" : "var(--muted)",
                        }}>
                          {r.estado === "Activo" ? "Confirmado" : r.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
