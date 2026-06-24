import { useMemo, useState, useEffect, Fragment } from "react";
import { useMotos } from "../hooks/useMotos";
import { useClientes } from "../hooks/useClientes";
import { useContratos } from "../hooks/useContratos";
import { usePagos } from "../hooks/usePagos";
import { useTaller } from "../hooks/useTaller";
import type { ViewKey } from "../App";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

// ─── Sub-components ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      height: 110, borderRadius: 16, background: "#e2e8f0",
      animation: "pulse 1.5s ease-in-out infinite",
    }} />
  );
}

function Section({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div style={{
      background: "white", borderRadius: 16, padding: "18px 20px",
      boxShadow: "0 2px 14px rgba(15,23,42,0.07)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", letterSpacing: "0.02em" }}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardView({ onNavigate }: {
  onNavigate: (view: ViewKey, filter?: string) => void;
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [chartDays, setChartDays] = useState<7 | 14 | 30>(14);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<"todos" | "RASTREADOR" | "COSTA" | "PRADERA">("todos");

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const { motos, loading: lM } = useMotos();
  const { clientes, loading: lC } = useClientes();
  const { contratos, loading: lCt } = useContratos();
  const { pagos, loading: lP } = usePagos();
  const { taller, loading: lT } = useTaller();

  const loading = lM || lC || lCt || lP || lT;

  // ── Computed stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (loading) return null;

    const motosAsignadas   = motos.filter(m => m.estado === "Asignada").length;
    const motosDisponibles = motos.filter(m => m.estado === "Disponible").length;
    const motosTaller      = motos.filter(m => m.estado === "Mantenimiento").length;
    const motosRetencion   = motos.filter(m => ["Fiscalia","Transito","Garantia"].includes(m.estado)).length;

    const contratosActivos   = contratos.filter(c => c.estado === "Activo").length;
    const contratosEnProceso = contratos.filter(c => c.estado === "En proceso").length;

    const clientesActivos   = clientes.filter(c => c.estado === "Activo").length;
    const clientesMora      = clientes.filter(c => ["En mora","En riesgo"].includes(c.estado)).length;
    const clientesProceso   = clientes.filter(c => c.estado === "En proceso").length;
    const clientesVisita    = clientes.filter(c => c.estado === "Listo para visita").length;
    const clientesPendEval  = clientes.filter(c => c.estado === "Pendiente evaluación").length;
    const clientesAprobados = clientes.filter(c => c.estado === "Aprobado").length;

    const pagosPendientes = pagos.filter(p => p.estado === "Pendiente").length;

    const hoyStr  = new Date().toISOString().slice(0, 10);
    const recaudoHoy = pagos
      .filter(p => p.estado === "Confirmado" && p.fecha === hoyStr)
      .reduce((acc, p) => acc + p.valor, 0);

    const hace7dias = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const recaudoSemana = pagos
      .filter(p => p.estado === "Confirmado" && p.fecha >= hace7dias)
      .reduce((acc, p) => acc + p.valor, 0);

    const hace14dias = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
    const recaudoSemanaAnterior = pagos
      .filter(p => p.estado === "Confirmado" && p.fecha >= hace14dias && p.fecha < hace7dias)
      .reduce((acc, p) => acc + p.valor, 0);

    const tallerActivo = taller.filter(t => t.estado_tecnico !== "Finalizado").length;

    const grupos = ["COSTA","PRADERA","RASTREADOR","OTRO"] as const;
    const porGrupo = grupos.map(g => ({
      g,
      asignadas:   motos.filter(m => m.grupo === g && m.estado === "Asignada").length,
      disponibles: motos.filter(m => m.grupo === g && m.estado === "Disponible").length,
      total:       motos.filter(m => m.grupo === g).length,
    }));

    const activos = contratos.filter(c => c.estado === "Activo");
    const porModalidad = {
      Diario:    activos.filter(c => c.forma_pago === "Diario").length,
      Semanal:   activos.filter(c => c.forma_pago === "Semanal").length,
      Quincenal: activos.filter(c => c.forma_pago === "Quincenal").length,
      Mensual:   activos.filter(c => c.forma_pago === "Mensual").length,
    };

    const alertasTotal = pagosPendientes + clientesMora + motosRetencion;

    const prevMotosAsignadas = motosAsignadas;
    const prevContratosActivos = contratosActivos;
    const prevClientesActivos = clientesActivos;
    const prevClientesMora = clientesMora;

    const recuperadasSemana = motos.filter(m => m.estado === "Recuperada").length;

    // Motos por inmovilizar: contratos activos con cliente en mora
    const motosInmovilizar = contratos
      .filter(c => c.estado === "Activo" && c.moto_id)
      .filter(c => {
        const cliente = clientes.find(cl => cl.id === c.cliente_id);
        return cliente?.estado === "En mora";
      }).length;

    const diaSem = new Date().getDay();
    const esLunes = diaSem === 1;
    const esMiercoles = diaSem === 3;
    const paganHoy = contratos
      .filter(c => c.estado === "Activo")
      .filter(c => {
        const esDiario = (c.forma_pago ?? "").toLowerCase() === "diario";
        if (esDiario) return true;
        const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
        const dp = norm(c.dia_pago ?? "lunes");
        return (dp === "lunes" && esLunes) || (dp === "miercoles" && esMiercoles);
      }).length;

    return {
      motosAsignadas, motosDisponibles, motosTaller, motosRetencion,
      contratosActivos, contratosEnProceso,
      clientesActivos, clientesMora, clientesProceso, clientesVisita,
      clientesPendEval, clientesAprobados,
      pagosPendientes, recaudoHoy, recaudoSemana, recaudoSemanaAnterior,
      tallerActivo, porGrupo, porModalidad, alertasTotal,
      prevMotosAsignadas, prevContratosActivos, prevClientesActivos, prevClientesMora,
      recuperadasSemana, paganHoy, motosInmovilizar,
    };
  }, [loading, motos, clientes, contratos, pagos, taller]);

  // ── Recaudo filtrado por grupo ─────────────────────────────────────────────
  const recaudoFiltrado = useMemo(() => {
    if (loading || !stats) return { hoy: 0, semana: 0, semanaAnterior: 0 };
    if (grupoSeleccionado === "todos") {
      return { hoy: stats.recaudoHoy, semana: stats.recaudoSemana, semanaAnterior: stats.recaudoSemanaAnterior };
    }
    const motoIds = new Set(motos.filter(m => m.grupo === grupoSeleccionado).map(m => m.id));
    const contratoIds = new Set(
      contratos.filter(c => c.moto_id && motoIds.has(c.moto_id)).map(c => c.id)
    );
    const hoyStr = new Date().toISOString().slice(0, 10);
    const hace7dias = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const hace14dias = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);

    const hoy = pagos
      .filter(p => p.estado === "Confirmado" && p.fecha === hoyStr && contratoIds.has(p.contrato_id))
      .reduce((acc, p) => acc + p.valor, 0);
    const semana = pagos
      .filter(p => p.estado === "Confirmado" && p.fecha >= hace7dias && contratoIds.has(p.contrato_id))
      .reduce((acc, p) => acc + p.valor, 0);
    const semanaAnterior = pagos
      .filter(p => p.estado === "Confirmado" && p.fecha >= hace14dias && p.fecha < hace7dias && contratoIds.has(p.contrato_id))
      .reduce((acc, p) => acc + p.valor, 0);

    return { hoy, semana, semanaAnterior };
  }, [grupoSeleccionado, motos, contratos, pagos, loading, stats]);

  // ── Chart data (variable days) ────────────────────────────────────────────
  const chartData = useMemo(() => {
    const result: Array<{ fecha: string; total: number; esHoy: boolean }> = [];
    const ahora = new Date();
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date(ahora);
      d.setDate(ahora.getDate() - i);
      const fechaStr = d.toISOString().slice(0, 10);
      const total = pagos
        .filter(p => p.estado === "Confirmado" && p.fecha === fechaStr)
        .reduce((acc, p) => acc + p.valor, 0);
      result.push({ fecha: fechaStr, total, esHoy: i === 0 });
    }
    return result;
  }, [pagos, chartDays]);

  const maxRecaudo = useMemo(() => Math.max(...chartData.map(d => d.total), 1), [chartData]);
  const totalRecaudoChart = useMemo(() => chartData.reduce((s, d) => s + d.total, 0), [chartData]);

  // ── Top 5 sin pago ─────────────────────────────────────────────────────────
  const top5SinPago = useMemo(() => {
    if (loading || !stats) return [];
    const todayStr = new Date().toISOString().slice(0, 10);
    return contratos
      .filter(c => c.estado === "Activo")
      .map(c => {
        const ultimoPago = pagos
          .filter(p => p.contrato_id === c.id && p.estado === "Confirmado")
          .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
        const desde = ultimoPago
          ? new Date(ultimoPago.fecha + "T00:00:00")
          : (c.fecha_entrega ? new Date(c.fecha_entrega + "T00:00:00") : new Date(c.created_at));
        const diasSinPago = Math.floor(
          (new Date(todayStr + "T00:00:00").getTime() - desde.getTime()) / 86400000
        );
        return { contrato: c, diasSinPago };
      })
      .filter(r => r.diasSinPago > 1)
      .sort((a, b) => b.diasSinPago - a.diasSinPago)
      .slice(0, 5);
  }, [contratos, pagos, loading, stats]);

  // ── Date string ────────────────────────────────────────────────────────────
  const hoy = new Date().toLocaleDateString("es-CO", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading || !stats) {
    return (
      <div style={{ padding: "20px 16px", maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ height: 110, borderRadius: 20, background: "#e2e8f0", marginBottom: 20, animation: "pulse 1.5s infinite" }} />
        <div style={{ display: "flex", gap: 12, marginBottom: 20, overflowX: "auto" }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ flex: "0 0 auto", width: 148, height: 110, borderRadius: 14, background: "#e2e8f0", animation: "pulse 1.5s infinite" }} />)}
        </div>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  // ── Alerts list ────────────────────────────────────────────────────────────
  const alerts: Array<{
    icon: string; text: string; color: string; bgColor: string; borderColor: string;
    severidad: "critica" | "alta" | "media";
    view?: ViewKey; filter?: string;
  }> = [];

  if (stats.pagosPendientes > 0)
    alerts.push({
      icon: "🔔", color: "#92400e", bgColor: "#fef3c7", borderColor: "#f59e0b",
      severidad: "alta",
      text: `${stats.pagosPendientes} transferencia${stats.pagosPendientes > 1 ? "s" : ""} pendiente${stats.pagosPendientes > 1 ? "s" : ""} de confirmar`,
      view: "cobros",
    });
  if (stats.clientesMora > 0)
    alerts.push({
      icon: "⚠️", color: "#991b1b", bgColor: "#fee2e2", borderColor: "#ef4444",
      severidad: stats.clientesMora >= 5 ? "critica" : "alta",
      text: `${stats.clientesMora} cliente${stats.clientesMora > 1 ? "s" : ""} en mora o riesgo`,
      view: "clientes", filter: "mora",
    });
  if (stats.motosRetencion > 0)
    alerts.push({
      icon: "🚨", color: "#991b1b", bgColor: "#fee2e2", borderColor: "#dc2626",
      severidad: "critica",
      text: `${stats.motosRetencion} moto${stats.motosRetencion > 1 ? "s" : ""} retenida${stats.motosRetencion > 1 ? "s" : ""} (Fiscalía / Tránsito / Garantía)`,
      view: "motos", filter: "retencion",
    });
  if (stats.motosTaller > 0)
    alerts.push({
      icon: "🔧", color: "#92400e", bgColor: "#fff7ed", borderColor: "#f97316",
      severidad: "media",
      text: `${stats.motosTaller} moto${stats.motosTaller > 1 ? "s" : ""} en mantenimiento`,
      view: "taller",
    });
  if (stats.contratosEnProceso > 0)
    alerts.push({
      icon: "📄", color: "#1e40af", bgColor: "#eff6ff", borderColor: "#3b82f6",
      severidad: "media",
      text: `${stats.contratosEnProceso} contrato${stats.contratosEnProceso > 1 ? "s" : ""} en proceso sin activar`,
      view: "contratos", filter: "En proceso",
    });

  const alertasCriticas = alerts.filter(a => a.severidad === "critica");
  const gruposVisibles = stats.porGrupo.filter(g => g.total > 0);

  // Pipeline rows
  const pipelineRows = [
    { label: "En proceso",        count: stats.clientesProceso,   color: "#94a3b8", filter: "En proceso" },
    { label: "Listos para visita",count: stats.clientesVisita,    color: "#60a5fa", filter: "Listo para visita" },
    { label: "Pendiente eval.",   count: stats.clientesPendEval,  color: "#f59e0b", filter: "Pendiente evaluación" },
    { label: "Aprobados",         count: stats.clientesAprobados, color: "#34d399", filter: "Aprobado" },
    { label: "Activos",           count: stats.clientesActivos,   color: "#10b981", filter: "Activo" },
    { label: "En mora / riesgo",  count: stats.clientesMora,      color: "#ef4444", filter: "mora" },
  ];
  const totalClientes = clientes.length || 1;

  function calcDelta(curr: number, prev: number): { pct: number; label: string; color: string } {
    if (prev === 0) return { pct: 0, label: "—", color: "#94a3b8" };
    const pct = Math.round(((curr - prev) / prev) * 100);
    if (pct === 0) return { pct: 0, label: "= sin cambio", color: "#94a3b8" };
    const up = pct > 0;
    return {
      pct,
      label: `${up ? "▲" : "▼"} ${Math.abs(pct)}% vs sem. pasada`,
      color: up ? "#166534" : "#991b1b",
    };
  }

  const recaudoDelta = calcDelta(recaudoFiltrado.semana, recaudoFiltrado.semanaAnterior);

  const quickActions = [
    { icon: "👥", label: "Nuevo cliente",  view: "clientes"  as ViewKey },
    { icon: "💳", label: "Registrar pago", view: "cobros"    as ViewKey },
    { icon: "🏍️", label: "Agregar moto",   view: "motos"     as ViewKey },
    { icon: "📄", label: "Nuevo contrato", view: "contratos" as ViewKey },
  ];

  // Grupo selector data
  const grupoOpciones: Array<{ key: "todos" | "RASTREADOR" | "COSTA" | "PRADERA"; label: string }> = [
    { key: "todos",      label: "Toda la flota" },
    { key: "RASTREADOR", label: "Rastreador" },
    { key: "COSTA",      label: "Costa" },
    { key: "PRADERA",    label: "Pradera" },
  ];

  const grupoActualStats = grupoSeleccionado === "todos"
    ? {
        total:       motos.length,
        asignadas:   stats.motosAsignadas,
        disponibles: stats.motosDisponibles,
        pct:         motos.length > 0 ? Math.round((stats.motosAsignadas / motos.length) * 100) : 0,
      }
    : (() => {
        const g = stats.porGrupo.find(x => x.g === grupoSeleccionado);
        return {
          total:       g?.total ?? 0,
          asignadas:   g?.asignadas ?? 0,
          disponibles: g?.disponibles ?? 0,
          pct:         (g?.total ?? 0) > 0 ? Math.round(((g?.asignadas ?? 0) / (g?.total ?? 1)) * 100) : 0,
        };
      })();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: isMobile ? "16px 12px 40px" : "24px 24px 48px", maxWidth: 1040, margin: "0 auto" }}>

      {/* ── BANNER CRÍTICO ── */}
      {alertasCriticas.length > 0 && (
        <div style={{
          marginBottom: 16,
          background: "#991b1b",
          borderRadius: 14,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 4px 16px rgba(153,27,27,0.3)",
        }}>
          <span style={{ fontSize: 20 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: "white", fontWeight: 800, fontSize: 13 }}>
              {alertasCriticas.length} alerta{alertasCriticas.length > 1 ? "s" : ""} crítica{alertasCriticas.length > 1 ? "s" : ""} — requieren acción inmediata
            </div>
            <div style={{ color: "#fca5a5", fontSize: 12, marginTop: 2 }}>
              {alertasCriticas.map(a => a.text).join(" · ")}
            </div>
          </div>
        </div>
      )}

      {/* ── SELECTOR DE GRUPO ── */}
      <div style={{ marginBottom: 16 }}>
        {/* Chips de grupo */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {grupoOpciones.map(op => {
            const isSelected = grupoSeleccionado === op.key;
            const gData = op.key === "todos" ? null : stats.porGrupo.find(x => x.g === op.key);
            const hasMoots = op.key === "todos" ? motos.length > 0 : (gData?.total ?? 0) > 0;
            return (
              <button
                key={op.key}
                onClick={() => setGrupoSeleccionado(op.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 14px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: isSelected ? "#0f172a" : "white",
                  color: isSelected ? "white" : "#334155",
                  fontWeight: 700, fontSize: 12,
                  boxShadow: isSelected
                    ? "0 4px 14px rgba(15,23,42,0.25)"
                    : "0 1px 6px rgba(15,23,42,0.08)",
                  transition: "all 0.15s",
                  opacity: hasMoots || op.key === "todos" ? 1 : 0.5,
                }}
              >
                <span>{op.label}</span>
                {op.key !== "todos" && gData && (
                  <span style={{
                    fontSize: 10, fontWeight: 800,
                    background: isSelected ? "rgba(255,255,255,0.15)" : "#f1f5f9",
                    color: isSelected ? "#bae6fd" : "#64748b",
                    padding: "2px 7px", borderRadius: 999,
                  }}>
                    {gData.total}
                  </span>
                )}
                {op.key === "todos" && (
                  <span style={{
                    fontSize: 10, fontWeight: 800,
                    background: isSelected ? "rgba(255,255,255,0.15)" : "#f1f5f9",
                    color: isSelected ? "#bae6fd" : "#64748b",
                    padding: "2px 7px", borderRadius: 999,
                  }}>
                    {motos.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Detalles del grupo seleccionado */}
        <div style={{
          display: "flex", gap: 10, flexWrap: "wrap",
        }}>
          {gruposVisibles.map(g => {
            const isActive = grupoSeleccionado === g.g;
            const pct = g.total > 0 ? Math.round((g.asignadas / g.total) * 100) : 0;
            return (
              <div
                key={g.g}
                onClick={() => onNavigate("motos", `grupo:${g.g}`)}
                style={{
                  flex: "1 1 110px", minWidth: 110,
                  padding: "10px 12px", borderRadius: 12,
                  background: isActive ? "#eff6ff" : "white",
                  border: `1px solid ${isActive ? "#bae6fd" : "#e2e8f0"}`,
                  cursor: "pointer", textAlign: "center",
                  transition: "all 0.15s",
                  boxShadow: isActive ? "0 2px 10px rgba(2,132,199,0.12)" : "0 1px 4px rgba(15,23,42,0.06)",
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: isActive ? "#0284c7" : "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{g.g}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: isActive ? "#0284c7" : "#0f172a", lineHeight: 1 }}>{g.total}</div>
                <div style={{ marginTop: 6, height: 4, borderRadius: 99, background: "#e2e8f0", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, background: isActive ? "#0284c7" : "#94a3b8", width: `${pct}%`, transition: "width 0.4s" }} />
                </div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 5, lineHeight: 1.6 }}>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>{g.asignadas}</span>{" campo · "}
                  <span style={{ color: "#0284c7", fontWeight: 700 }}>{g.disponibles}</span>{" disp."}
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{pct}% asignado</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── HERO: recaudo del día (filtrado por grupo) ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
        borderRadius: 20, padding: isMobile ? "22px 20px" : "28px 32px",
        marginBottom: 20, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: -40, top: -40,
          width: 180, height: 180, borderRadius: "50%",
          background: "rgba(2,132,199,0.15)", pointerEvents: "none",
        }} />
        <div style={{ fontSize: 12, color: "#94a3b8", textTransform: "capitalize", marginBottom: 6, letterSpacing: "0.04em" }}>
          {hoy}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Recaudo del día
          </div>
          {grupoSeleccionado !== "todos" && (
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase",
              background: "rgba(56,189,248,0.15)", color: "#38bdf8",
              padding: "2px 8px", borderRadius: 999,
            }}>
              {grupoSeleccionado}
            </span>
          )}
        </div>
        <div style={{ fontSize: isMobile ? 36 : 48, fontWeight: 900, color: "white", lineHeight: 1, letterSpacing: "-0.02em" }}>
          ${fmt(recaudoFiltrado.hoy)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>
            Semana:&nbsp;
            <span style={{ color: "#34d399", fontWeight: 700 }}>${fmt(recaudoFiltrado.semana)}</span>
            &nbsp;en pagos confirmados
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>
            <span style={{ color: "#7dd3fc", fontWeight: 700 }}>{grupoActualStats.asignadas}</span>
            {" en campo · "}
            <span style={{ color: "#34d399", fontWeight: 700 }}>{grupoActualStats.disponibles}</span>
            {" disponibles · "}
            <span style={{ color: "#bae6fd", fontWeight: 700 }}>{grupoActualStats.pct}%</span>
            {" asignado"}
          </div>
          {recaudoDelta.pct !== 0 && (
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: recaudoDelta.color === "#166534" ? "#34d399" : "#fca5a5",
              background: "rgba(255,255,255,0.08)",
              padding: "2px 10px", borderRadius: 999,
            }}>
              {recaudoDelta.label}
            </span>
          )}
        </div>
      </div>

      {/* ── KPI STRIP (reordenado y más compacto) ── */}
      <div style={{
        display: "flex",
        gap: 8,
        overflowX: isMobile ? "auto" : "visible",
        flexWrap: isMobile ? "nowrap" : "wrap",
        paddingBottom: isMobile ? 4 : 0,
        marginBottom: 20,
      }}>
        {[
          {
            icon: "👥", label: "Clientes activos", value: stats.clientesActivos,
            sub: "con moto asignada", color: "#166534",
            bg: "#f0fdf4", onClick: () => onNavigate("clientes", "Activo"),
            delta: calcDelta(stats.clientesActivos, stats.prevClientesActivos),
          },
          {
            icon: "🏍️", label: "Motos en campo", value: stats.motosAsignadas,
            sub: `${stats.motosDisponibles} disponibles`, color: "#0284c7",
            bg: "#eff6ff", onClick: () => onNavigate("motos", "Asignada"),
            delta: calcDelta(stats.motosAsignadas, stats.prevMotosAsignadas),
          },
          {
            icon: "🚨", label: "En mora", value: stats.clientesMora,
            sub: "requieren acción", color: "#991b1b",
            bg: "#fff1f2", onClick: () => onNavigate("clientes", "mora"),
            delta: calcDelta(stats.clientesMora, stats.prevClientesMora),
          },
          {
            icon: "📄", label: "Contratos activos", value: stats.contratosActivos,
            sub: `${stats.contratosEnProceso} en proceso`, color: "#6366f1",
            bg: "#f5f3ff", onClick: () => onNavigate("contratos", "Activo"),
            delta: calcDelta(stats.contratosActivos, stats.prevContratosActivos),
          },
          {
            icon: "🔒", label: "Por inmovilizar", value: stats.motosInmovilizar,
            sub: stats.motosInmovilizar === 0 ? "todo al día" : "recuperar ahora",
            color: stats.motosInmovilizar > 0 ? "#92400e" : "#166534",
            bg: stats.motosInmovilizar > 0 ? "#fffbeb" : "#f0fdf4",
            onClick: () => onNavigate("inmovilizaciones"),
            delta: { pct: 0, label: "", color: "#94a3b8" },
          },
        ].map(kpi => (
          <div
            key={kpi.label}
            onClick={kpi.onClick}
            style={{
              flex: isMobile ? "0 0 auto" : "1 1 130px",
              minWidth: isMobile ? 136 : 120,
              background: kpi.bg,
              borderRadius: 12,
              padding: "12px 12px",
              cursor: "pointer",
              borderLeft: `4px solid ${kpi.color}`,
              boxShadow: "0 1px 6px rgba(15,23,42,0.07)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(15,23,42,0.12)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 6px rgba(15,23,42,0.07)";
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{kpi.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", marginTop: 3 }}>{kpi.label}</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{kpi.sub}</div>
            {kpi.delta.pct !== 0 && (
              <div style={{ fontSize: 10, fontWeight: 700, color: kpi.delta.color, marginTop: 3 }}>
                {kpi.delta.label}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── ALERTS (clickeable → vista alertas) ── */}
      {alerts.length > 0 ? (
        <div
          style={{ marginBottom: 16, background: "#fff7ed", borderRadius: 16, padding: "14px 16px", border: "1px solid #fed7aa", cursor: "pointer" }}
          onClick={() => onNavigate("alertas")}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#c2410c", letterSpacing: "0.08em", marginBottom: 10, textTransform: "uppercase", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⚠️ Requieren atención — toca para ver todas</span>
            <span style={{ fontSize: 13, color: "#c2410c" }}>›</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alerts.map((a, i) => (
              <div
                key={i}
                onClick={e => { e.stopPropagation(); if (a.view) onNavigate(a.view!, a.filter); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 12,
                  background: a.bgColor,
                  borderLeft: `4px solid ${a.borderColor}`,
                  cursor: a.view ? "pointer" : "default",
                }}
              >
                <span style={{ fontSize: 16 }}>{a.icon}</span>
                <span style={{ fontSize: 12, color: a.color, flex: 1, fontWeight: 600 }}>{a.text}</span>
                {a.severidad === "critica" && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#991b1b", background: "#fecaca", padding: "2px 7px", borderRadius: 999 }}>CRÍTICO</span>
                )}
                {a.view && <span style={{ color: a.color, fontSize: 16, fontWeight: 700 }}>›</span>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{ marginBottom: 16, background: "#f0fdf4", borderRadius: 16, padding: "14px 18px", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
          onClick={() => onNavigate("alertas")}
        >
          <span style={{ fontSize: 22 }}>✅</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#166534", flex: 1 }}>Todo al día — no hay alertas pendientes</span>
          <span style={{ color: "#166534", fontSize: 16 }}>›</span>
        </div>
      )}

      {/* ── ACCIONES RÁPIDAS (entre banner y tarjetas) ── */}
      <div style={{
        background: "white", borderRadius: 16, padding: "14px 16px",
        boxShadow: "0 2px 14px rgba(15,23,42,0.07)", marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 10 }}>Acciones rápidas</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}>
          {quickActions.map(a => (
            <button
              key={a.label}
              onClick={() => onNavigate(a.view)}
              style={{
                display: "flex", flexDirection: isMobile ? "column" : "row",
                alignItems: "center", justifyContent: "center", gap: isMobile ? 4 : 8,
                padding: "10px 10px", borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                cursor: "pointer", fontSize: isMobile ? 11 : 13, fontWeight: 600, color: "#334155",
                textAlign: "center", transition: "background 0.12s, border-color 0.12s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "#eff6ff";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#bae6fd";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
              }}
            >
              <span style={{ fontSize: isMobile ? 20 : 18 }}>{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── QUICK STATS ROW (4 tarjetas) ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: 10,
        marginBottom: 20,
      }}>
        {[
          {
            label: "Pagan hoy",
            value: stats.paganHoy,
            icon: "📅",
            color: "#0284c7", bg: "#eff6ff",
            onClick: () => onNavigate("cobros"),
          },
          {
            label: "En gabela",
            value: stats.clientesMora > 0 ? stats.clientesMora : 0,
            icon: "⏳",
            color: "#92400e", bg: "#fef3c7",
            onClick: () => onNavigate("cobros"),
          },
          {
            label: "En mora",
            value: stats.clientesMora,
            icon: "🔴",
            color: "#991b1b", bg: "#fee2e2",
            onClick: () => onNavigate("clientes", "mora"),
          },
          {
            label: "Recuperadas (sem.)",
            value: stats.recuperadasSemana,
            icon: "🔄",
            color: "#166534", bg: "#dcfce7",
            onClick: () => onNavigate("motos", "Recuperada"),
          },
        ].map(s => (
          <div
            key={s.label}
            onClick={s.onClick}
            style={{
              background: s.bg,
              borderRadius: 14,
              padding: "14px 16px",
              cursor: "pointer",
              borderBottom: `3px solid ${s.color}`,
              boxShadow: "0 1px 6px rgba(15,23,42,0.06)",
              transition: "transform 0.12s, box-shadow 0.12s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 16px rgba(15,23,42,0.1)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 6px rgba(15,23,42,0.06)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginTop: 3 }}>{s.label}</div>
              </div>
              <span style={{ fontSize: 20, opacity: 0.7 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── CONTRATOS POR MODALIDAD (horizontal) ── */}
      <div style={{
        background: "white", borderRadius: 16, padding: "14px 16px",
        boxShadow: "0 2px 14px rgba(15,23,42,0.07)", marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 10 }}>Contratos activos por modalidad</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {Object.entries(stats.porModalidad).map(([mod, n]) => (
            <div
              key={mod}
              onClick={() => onNavigate("contratos", "Activo")}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "12px 10px", borderRadius: 12, textAlign: "center",
                background: n > 0 ? "#f0f9ff" : "#f8fafc",
                border: `1px solid ${n > 0 ? "#bae6fd" : "#e2e8f0"}`,
                cursor: "pointer", transition: "background 0.15s", gap: 2,
              }}
              onMouseEnter={e => n > 0 && ((e.currentTarget as HTMLDivElement).style.background = "#e0f2fe")}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = n > 0 ? "#f0f9ff" : "#f8fafc")}
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: n > 0 ? "#0284c7" : "#cbd5e1", lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginTop: 3 }}>{mod}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TWO COLUMN LAYOUT ── */}
      <div style={{
        display: isMobile ? "flex" : "grid",
        flexDirection: isMobile ? "column" : undefined,
        gridTemplateColumns: isMobile ? undefined : "minmax(0, 2fr) minmax(0, 1fr)",
        gap: 16,
        alignItems: "start",
        marginBottom: 16,
      }}>

        {/* LEFT column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Section title="Pipeline de clientes">
            {pipelineRows.map(row => {
              const pct = Math.round((row.count / totalClientes) * 100);
              return (
                <div
                  key={row.label}
                  onClick={() => onNavigate("clientes", row.filter)}
                  style={{ marginBottom: 12, cursor: "pointer" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: "#64748b", fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontWeight: 800, color: "#0f172a", fontSize: 13 }}>{row.count}</span>
                  </div>
                  <div style={{ height: 12, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 99,
                      background: row.color,
                      width: `${Math.max(pct, row.count > 0 ? 3 : 0)}%`,
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </Section>
        </div>

        {/* RIGHT column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Taller snapshot */}
          {stats.tallerActivo > 0 && (
            <div
              onClick={() => onNavigate("taller")}
              style={{
                background: "#fff7ed", borderRadius: 16, padding: "16px 18px",
                border: "1px solid #fed7aa", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 14,
                boxShadow: "0 1px 6px rgba(15,23,42,0.06)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#fef3c7"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "#fff7ed"}
            >
              <span style={{ fontSize: 28 }}>🔧</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#c2410c" }}>{stats.tallerActivo}</div>
                <div style={{ fontSize: 12, color: "#9a3412", fontWeight: 600 }}>
                  moto{stats.tallerActivo > 1 ? "s" : ""} en taller
                </div>
              </div>
              <span style={{ marginLeft: "auto", color: "#c2410c", fontSize: 20 }}>›</span>
            </div>
          )}
        </div>
      </div>

      {/* ── RECAUDO CHART ── */}
      <div style={{
        background: "white", borderRadius: 16, padding: "18px 20px",
        boxShadow: "0 2px 14px rgba(15,23,42,0.07)", marginBottom: 16,
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>Recaudo — últimos {chartDays} días</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Total: <span style={{ fontWeight: 800, color: "#0284c7" }}>${fmt(totalRecaudoChart)}</span></div>
          </div>
          <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 10, padding: 3 }}>
            {([7, 14, 30] as const).map(d => (
              <button
                key={d}
                onClick={() => setChartDays(d)}
                style={{
                  padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 700,
                  background: chartDays === d ? "#0f172a" : "transparent",
                  color: chartDays === d ? "white" : "#64748b",
                  transition: "all 0.15s",
                }}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 2 : 4, height: 100, width: "100%", minWidth: 0 }}>
          {chartData.map(d => {
            const pct = Math.round((d.total / maxRecaudo) * 100);
            const altoPx = Math.max(pct, d.total > 0 ? 6 : 2);
            const label = d.total > 0 ? `$${Math.round(d.total / 1000)}k` : "";
            const diaSemana = new Date(d.fecha + "T00:00:00").toLocaleDateString("es-CO", { weekday: "short" });
            return (
              <Fragment key={d.fecha}>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%", justifyContent: "flex-end" }}>
                  {label && (
                    <div style={{ fontSize: 8, fontWeight: 700, color: d.esHoy ? "#0284c7" : "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "clip", maxWidth: "100%", textAlign: "center" }}>
                      {label}
                    </div>
                  )}
                  <div style={{
                    width: "100%", borderRadius: "3px 3px 0 0",
                    background: d.esHoy ? "#0284c7" : "#cbd5e1",
                    height: `${altoPx}%`, minHeight: 3,
                    transition: "height 0.3s",
                    boxShadow: d.esHoy ? "0 0 8px rgba(2,132,199,0.4)" : "none",
                  }} />
                  {(chartDays <= 14 || d.esHoy) && (
                    <div style={{ fontSize: 8, color: "#94a3b8", textTransform: "capitalize", whiteSpace: "nowrap" }}>{diaSemana}</div>
                  )}
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* ── TOP MORA LIST ── */}
      {top5SinPago.length > 0 && (
        <div style={{
          background: "white", borderRadius: 16, padding: "18px 20px",
          boxShadow: "0 2px 14px rgba(15,23,42,0.07)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 14 }}>
            Contratos con más días sin pago
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {top5SinPago.map(({ contrato, diasSinPago }) => {
              const clienteItem = clientes.find(cl => cl.id === contrato.cliente_id);
              const motoItem    = motos.find(m => m.id === contrato.moto_id);
              const esCritico   = diasSinPago > 7;
              const esMora      = diasSinPago >= 3 && diasSinPago <= 7;
              const badgeBg     = esCritico ? "#fee2e2" : esMora ? "#fef3c7" : "#f1f5f9";
              const badgeColor  = esCritico ? "#991b1b" : esMora ? "#92400e" : "#64748b";
              const badgeLabel  = esCritico ? "Crítico" : esMora ? "Mora" : "Gabela";
              const borderColor = esCritico ? "#ef4444" : esMora ? "#f59e0b" : "#e2e8f0";
              return (
                <div
                  key={contrato.id}
                  onClick={() => clienteItem ? onNavigate("ficha_cliente" as ViewKey, clienteItem.id) : onNavigate("cobros")}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", borderRadius: 12,
                    borderLeft: `4px solid ${borderColor}`,
                    background: esCritico ? "#fff8f8" : esMora ? "#fffdf5" : "#f8fafc",
                    cursor: "pointer", gap: 12,
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "0.85"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {motoItem ? `${motoItem.placa} · ` : ""}{clienteItem?.nombre ?? "Sin cliente"}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {diasSinPago} día{diasSinPago !== 1 ? "s" : ""} sin pago
                    </div>
                  </div>
                  <span style={{
                    padding: "4px 12px", borderRadius: 999,
                    fontSize: 11, fontWeight: 700,
                    background: badgeBg, color: badgeColor, flexShrink: 0,
                  }}>
                    {badgeLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
