import { useMemo } from "react";
import { useMotos } from "../hooks/useMotos";
import { useClientes } from "../hooks/useClientes";
import { useContratos } from "../hooks/useContratos";
import { usePagos } from "../hooks/usePagos";
import { useTaller } from "../hooks/useTaller";
import type { ViewKey } from "../App";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

function KpiCard({ icon, label, value, sub, color, onClick }: {
  icon: string; label: string; value: string | number; sub?: string;
  color: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "white", borderRadius: 18, padding: "18px 20px",
        boxShadow: "0 2px 12px rgba(15,23,42,0.07)",
        cursor: onClick ? "pointer" : "default",
        borderLeft: `4px solid ${color}`,
        transition: "transform 0.15s, box-shadow 0.15s",
        display: "flex", flexDirection: "column", gap: 6,
      }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)")}
      onMouseLeave={e => onClick && ((e.currentTarget as HTMLDivElement).style.transform = "")}
    >
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</div>}
    </div>
  );
}

function AlertItem({ icon, text, onClick }: { icon: string; text: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
        borderRadius: 12, background: "white", cursor: onClick ? "pointer" : "default",
        border: "1px solid #fee2e2",
        transition: "background 0.1s",
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 13, color: "#374151", flex: 1 }}>{text}</span>
      {onClick && <span style={{ color: "#94a3b8", fontSize: 16 }}>›</span>}
    </div>
  );
}

export default function DashboardView({ onNavigate }: {
  onNavigate: (view: ViewKey, filter?: string) => void;
}) {
  const { motos, loading: lM } = useMotos();
  const { clientes, loading: lC } = useClientes();
  const { contratos, loading: lCt } = useContratos();
  const { pagos, loading: lP } = usePagos();
  const { taller, loading: lT } = useTaller();

  const loading = lM || lC || lCt || lP || lT;

  const stats = useMemo(() => {
    if (loading) return null;

    const motosAsignadas   = motos.filter(m => m.estado === "Asignada").length;
    const motosDisponibles = motos.filter(m => m.estado === "Disponible").length;
    const motosTaller      = motos.filter(m => m.estado === "Mantenimiento").length;
    const motosRetencion   = motos.filter(m => ["Fiscalia","Transito","Garantia"].includes(m.estado)).length;

    const contratosActivos    = contratos.filter(c => c.estado === "Activo").length;
    const contratosEnProceso  = contratos.filter(c => c.estado === "En proceso").length;

    const clientesActivos  = clientes.filter(c => c.estado === "Activo").length;
    const clientesMora     = clientes.filter(c => ["En mora","En riesgo"].includes(c.estado)).length;
    const clientesProceso  = clientes.filter(c => c.estado === "En proceso").length;
    const clientesVisita   = clientes.filter(c => c.estado === "Listo para visita").length;
    const clientesPendEval = clientes.filter(c => c.estado === "Pendiente evaluación").length;
    const clientesAprobados= clientes.filter(c => c.estado === "Aprobado").length;

    const pagosPendientes = pagos.filter(p => p.estado === "Pendiente").length;

    const hace7dias = new Date(Date.now() - 7 * 86400000).toISOString();
    const recaudoSemana = pagos
      .filter(p => p.estado === "Confirmado" && p.created_at > hace7dias)
      .reduce((acc, p) => acc + p.valor, 0);

    const tallerActivo = taller.filter(t => t.estado_tecnico !== "Finalizado").length;

    // por grupo
    const grupos = ["COSTA","PRADERA","RASTREADOR","OTRO"] as const;
    const porGrupo = grupos.map(g => ({
      g,
      asignadas: motos.filter(m => m.grupo === g && m.estado === "Asignada").length,
      disponibles: motos.filter(m => m.grupo === g && m.estado === "Disponible").length,
      total: motos.filter(m => m.grupo === g).length,
    }));

    // contratos por forma_pago
    const activos = contratos.filter(c => c.estado === "Activo");
    const porModalidad = {
      Diario: activos.filter(c => c.forma_pago === "Diario").length,
      Semanal: activos.filter(c => c.forma_pago === "Semanal").length,
      Quincenal: activos.filter(c => c.forma_pago === "Quincenal").length,
      Mensual: activos.filter(c => c.forma_pago === "Mensual").length,
    };

    const alertasTotal = pagosPendientes + clientesMora + motosRetencion;

    return {
      motosAsignadas, motosDisponibles, motosTaller, motosRetencion,
      contratosActivos, contratosEnProceso,
      clientesActivos, clientesMora, clientesProceso, clientesVisita,
      clientesPendEval, clientesAprobados,
      pagosPendientes, recaudoSemana, tallerActivo,
      porGrupo, porModalidad, alertasTotal,
    };
  }, [loading, motos, clientes, contratos, pagos, taller]);

  const hoy = new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  if (loading || !stats) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 120, borderRadius: 18, background: "#e2e8f0", animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
      </div>
    );
  }

  const alerts: Array<{ icon: string; text: string; view?: ViewKey; filter?: string }> = [];
  if (stats.pagosPendientes > 0)
    alerts.push({ icon: "🔔", text: `${stats.pagosPendientes} transferencia${stats.pagosPendientes > 1 ? "s" : ""} pendiente${stats.pagosPendientes > 1 ? "s" : ""} de confirmar`, view: "cobros" });
  if (stats.clientesMora > 0)
    alerts.push({ icon: "⚠️", text: `${stats.clientesMora} cliente${stats.clientesMora > 1 ? "s" : ""} en mora o riesgo`, view: "clientes", filter: "mora" });
  if (stats.motosRetencion > 0)
    alerts.push({ icon: "🚨", text: `${stats.motosRetencion} moto${stats.motosRetencion > 1 ? "s" : ""} con retención (Fiscalía / Tránsito / Garantía)`, view: "motos", filter: "retencion" });
  if (stats.motosTaller > 0)
    alerts.push({ icon: "🔧", text: `${stats.motosTaller} moto${stats.motosTaller > 1 ? "s" : ""} en mantenimiento`, view: "taller" });
  if (stats.contratosEnProceso > 0)
    alerts.push({ icon: "📄", text: `${stats.contratosEnProceso} contrato${stats.contratosEnProceso > 1 ? "s" : ""} en proceso sin activar`, view: "contratos", filter: "En proceso" });

  const gruposVisibles = stats.porGrupo.filter(g => g.total > 0);

  return (
    <div style={{ padding: "16px 16px 32px", maxWidth: 1000, margin: "0 auto" }}>
      {/* Greeting */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Panel General</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3, textTransform: "capitalize" }}>{hoy}</div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
        <KpiCard
          icon="🏍️" label="Motos en campo" value={stats.motosAsignadas}
          sub={`${stats.motosDisponibles} disponibles`} color="#0284c7"
          onClick={() => onNavigate("motos", "Asignada")}
        />
        <KpiCard
          icon="💰" label="Recaudo 7 días" value={`$${fmt(stats.recaudoSemana)}`}
          sub="pagos confirmados" color="#10b981"
          onClick={() => onNavigate("cobros")}
        />
        <KpiCard
          icon="📄" label="Contratos activos" value={stats.contratosActivos}
          sub={`${stats.contratosEnProceso} en proceso`} color="#6366f1"
          onClick={() => onNavigate("contratos", "Activo")}
        />
        <KpiCard
          icon={stats.alertasTotal > 0 ? "🔴" : "✅"}
          label="Alertas" value={stats.alertasTotal}
          sub={stats.alertasTotal === 0 ? "Todo al día" : "requieren atención"}
          color={stats.alertasTotal > 0 ? "#ef4444" : "#10b981"}
        />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 20, background: "#fff7ed", borderRadius: 16, padding: 16, border: "1px solid #fed7aa" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#c2410c", letterSpacing: "0.08em", marginBottom: 10 }}>REQUIEREN ATENCIÓN</div>
          <div style={{ display: "grid", gap: 8 }}>
            {alerts.map((a, i) => (
              <AlertItem key={i} icon={a.icon} text={a.text} onClick={a.view ? () => onNavigate(a.view!, a.filter) : undefined} />
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 16, alignItems: "start" }}>

        {/* Left column */}
        <div style={{ display: "grid", gap: 16 }}>

          {/* Pipeline clientes */}
          <div style={{ background: "white", borderRadius: 16, padding: 18, boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 14 }}>Pipeline de clientes</div>
            {[
              { label: "En proceso",       count: stats.clientesProceso,  color: "#94a3b8", filter: "En proceso" },
              { label: "Listos para visita",count: stats.clientesVisita,   color: "#60a5fa", filter: "Listo para visita" },
              { label: "Pendiente eval.",   count: stats.clientesPendEval, color: "#f59e0b", filter: "Pendiente evaluación" },
              { label: "Aprobados",         count: stats.clientesAprobados,color: "#34d399", filter: "Aprobado" },
              { label: "Activos",           count: stats.clientesActivos,  color: "#10b981", filter: "Activo" },
              { label: "En mora / riesgo",  count: stats.clientesMora,     color: "#ef4444", filter: "mora" },
            ].map(row => {
              const total = clientes.length || 1;
              const pct = Math.round((row.count / total) * 100);
              return (
                <div key={row.label} style={{ marginBottom: 10, cursor: "pointer" }} onClick={() => onNavigate("clientes", row.filter)}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                    <span>{row.label}</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{row.count}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: "#f1f5f9" }}>
                    <div style={{ height: "100%", borderRadius: 99, background: row.color, width: `${Math.max(pct, row.count > 0 ? 4 : 0)}%`, transition: "width 0.4s" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flota por grupo */}
          {gruposVisibles.length > 0 && (
            <div style={{ background: "white", borderRadius: 16, padding: 18, boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 14 }}>Flota por grupo</div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${gruposVisibles.length}, 1fr)`, gap: 10 }}>
                {gruposVisibles.map(g => (
                  <div key={g.g} style={{ textAlign: "center", padding: "14px 8px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer" }} onClick={() => onNavigate("motos")}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", marginBottom: 8 }}>{g.g}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>{g.total}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                      <span style={{ color: "#10b981" }}>{g.asignadas} campo</span>
                      {" · "}
                      <span style={{ color: "#64748b" }}>{g.disponibles} disp.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right column */}
        <div style={{ display: "grid", gap: 16 }}>

          {/* Acciones rápidas */}
          <div style={{ background: "white", borderRadius: 16, padding: 18, boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 12 }}>Acciones rápidas</div>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                { icon: "👥", label: "Nuevo cliente",      view: "clientes" as ViewKey, filter: "" },
                { icon: "💳", label: "Registrar pago",     view: "cobros" as ViewKey,   filter: "" },
                { icon: "🏍️", label: "Agregar moto",       view: "motos" as ViewKey,    filter: "" },
                { icon: "📄", label: "Nuevo contrato",     view: "contratos" as ViewKey,filter: "" },
              ].map(a => (
                <button
                  key={a.label}
                  onClick={() => onNavigate(a.view, a.filter)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0",
                    background: "#f8fafc", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contratos por modalidad */}
          <div style={{ background: "white", borderRadius: 16, padding: 18, boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 12 }}>Contratos activos por modalidad</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(stats.porModalidad).map(([mod, n]) => (
                <div
                  key={mod}
                  onClick={() => onNavigate("contratos", "Activo")}
                  style={{ padding: "12px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer", textAlign: "center" }}
                >
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#0284c7" }}>{n}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{mod}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Taller snapshot */}
          {stats.tallerActivo > 0 && (
            <div
              onClick={() => onNavigate("taller")}
              style={{ background: "#fff7ed", borderRadius: 16, padding: 16, border: "1px solid #fed7aa", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 26 }}>🔧</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#c2410c" }}>{stats.tallerActivo}</div>
                  <div style={{ fontSize: 12, color: "#9a3412" }}>moto{stats.tallerActivo > 1 ? "s" : ""} en taller</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
