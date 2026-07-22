import { useMemo, useState, useEffect, Fragment } from "react";
import { useMotos, type GrupoMoto } from "../hooks/useMotos";
import { useClientes } from "../hooks/useClientes";
import { useContratos, diasDesdeUltimoPago, corteMigracionGrupo } from "../hooks/useContratos";
import { usePagos, esPagoDeCaja } from "../hooks/usePagos";
import { useTaller } from "../hooks/useTaller";
import { useConvenios } from "../hooks/useConvenios";
import { useAlertas } from "../hooks/useAlertas";
import { useScope } from "../contexts/SubadminScopeContext";
import Placa from "../components/Placa";
import { esDiaDePago } from "../utils/cicloPago";
import { hoyISO, hoyMasDias } from "../utils/fecha";
import type { ViewKey } from "../App";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

// ─── Sub-components ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      height: 110, borderRadius: 16, background: "var(--line)",
      animation: "mgPulsa 1.5s ease-in-out infinite",
    }} />
  );
}

function Section({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div style={{
      background: "var(--card)", borderRadius: 16, padding: "18px 20px",
      boxShadow: "0 2px 14px rgba(15,23,42,0.07)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted2)", letterSpacing: "0.02em" }}>{title}</div>
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
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<"todos" | GrupoMoto>("todos");

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const { esSubadmin, misMotoIds, filtrarMotos, filtrarContratos, filtrarPorCliente, filtrarPorContrato } = useScope();
  const { motos: todasMotos, loading: lM } = useMotos();
  const { clientes: todosClientes, loading: lC } = useClientes();
  const { contratos: todosContratos, loading: lCt } = useContratos();
  const { pagos: todosPagos, loading: lP } = usePagos();
  const { taller: todoTaller, loading: lT } = useTaller();
  const { convenios: todosConvenios } = useConvenios();

  const motos = filtrarMotos(todasMotos);
  const clientes = filtrarPorCliente(todosClientes);
  const contratos = filtrarContratos(todosContratos);
  const pagos = filtrarPorContrato(todosPagos);
  const taller = esSubadmin ? todoTaller.filter(t => t.moto_id != null && misMotoIds.has(t.moto_id)) : todoTaller;
  const convenios = filtrarPorContrato(todosConvenios);

  // Misma fuente de alertas que la campana y la vista de Alertas
  const alertasSistema = useAlertas({ contratos, clientes, motos, pagos, convenios });

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

    const hoyStr  = hoyISO();
    const recaudoHoy = pagos
      .filter(p => p.estado === "Confirmado" && p.fecha === hoyStr && esPagoDeCaja(p))
      .reduce((acc, p) => acc + p.valor, 0);

    const hace7dias = hoyMasDias(-7);
    const recaudoSemana = pagos
      .filter(p => p.estado === "Confirmado" && p.fecha >= hace7dias && esPagoDeCaja(p))
      .reduce((acc, p) => acc + p.valor, 0);

    const hace14dias = hoyMasDias(-14);
    const recaudoSemanaAnterior = pagos
      .filter(p => p.estado === "Confirmado" && p.fecha >= hace14dias && p.fecha < hace7dias && esPagoDeCaja(p))
      .reduce((acc, p) => acc + p.valor, 0);

    const tallerActivo = taller.filter(t => t.estado_tecnico !== "Finalizado").length;

    const grupos = ["COSTA","PRADERA","RASTREADOR","USADAS","OTRO"] as const;
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

    const hoyDashboard = new Date();
    const paganHoy = contratos
      .filter(c => c.estado === "Activo")
      .filter(c => {
        const esDiario = (c.forma_pago ?? "").toLowerCase() === "diario";
        if (esDiario) return true;
        return esDiaDePago(c, hoyDashboard);
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
    const hoyStr = hoyISO();
    const hace7dias = hoyMasDias(-7);
    const hace14dias = hoyMasDias(-14);

    const hoy = pagos
      .filter(p => p.estado === "Confirmado" && p.fecha === hoyStr && contratoIds.has(p.contrato_id) && esPagoDeCaja(p))
      .reduce((acc, p) => acc + p.valor, 0);
    const semana = pagos
      .filter(p => p.estado === "Confirmado" && p.fecha >= hace7dias && contratoIds.has(p.contrato_id) && esPagoDeCaja(p))
      .reduce((acc, p) => acc + p.valor, 0);
    const semanaAnterior = pagos
      .filter(p => p.estado === "Confirmado" && p.fecha >= hace14dias && p.fecha < hace7dias && contratoIds.has(p.contrato_id) && esPagoDeCaja(p))
      .reduce((acc, p) => acc + p.valor, 0);

    return { hoy, semana, semanaAnterior };
  }, [grupoSeleccionado, motos, contratos, pagos, loading, stats]);

  // ── Chart data (variable days) ────────────────────────────────────────────
  const chartData = useMemo(() => {
    const result: Array<{ fecha: string; total: number; esHoy: boolean }> = [];
    for (let i = chartDays - 1; i >= 0; i--) {
      const fechaStr = hoyMasDias(-i);
      const total = pagos
        .filter(p => p.estado === "Confirmado" && p.fecha === fechaStr && esPagoDeCaja(p))
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
    return contratos
      .filter(c => c.estado === "Activo")
      .map(c => {
        const ultimoPago = pagos
          .filter(p => p.contrato_id === c.id && p.estado === "Confirmado")
          .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
        const grupoMoto = motos.find(m => m.id === c.moto_id)?.grupo ?? null;
        const diasSinPago = diasDesdeUltimoPago(
          ultimoPago?.fecha ?? null,
          c.fecha_entrega ?? c.created_at.slice(0, 10),
          corteMigracionGrupo(grupoMoto),
        ) ?? 0;
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
        <div style={{ height: 110, borderRadius: 20, background: "var(--line)", marginBottom: 20, animation: "mgPulsa 1.5s ease-in-out infinite" }} />
        <div style={{ display: "flex", gap: 12, marginBottom: 20, overflowX: "auto" }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ flex: "0 0 auto", width: 148, height: 110, borderRadius: 14, background: "var(--line)", animation: "mgPulsa 1.5s ease-in-out infinite" }} />)}
        </div>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const gruposVisibles = stats.porGrupo.filter(g => g.total > 0);

  // Pipeline rows
  const pipelineRows = [
    { label: "En proceso",        count: stats.clientesProceso,   color: "var(--faint)", filter: "En proceso" },
    { label: "Listos para visita",count: stats.clientesVisita,    color: "#60a5fa", filter: "Listo para visita" },
    { label: "Pendiente eval.",   count: stats.clientesPendEval,  color: "var(--warn2)", filter: "Pendiente evaluación" },
    { label: "Aprobados",         count: stats.clientesAprobados, color: "var(--ok2)", filter: "Aprobado" },
    { label: "Activos",           count: stats.clientesActivos,   color: "var(--ok2)", filter: "Activo" },
    { label: "En mora / riesgo",  count: stats.clientesMora,      color: "var(--bad)", filter: "mora" },
  ];
  const totalClientes = clientes.length || 1;

  function calcDelta(curr: number, prev: number): { pct: number; label: string; color: string } {
    if (prev === 0) return { pct: 0, label: "—", color: "var(--faint)" };
    const pct = Math.round(((curr - prev) / prev) * 100);
    if (pct === 0) return { pct: 0, label: "= sin cambio", color: "var(--faint)" };
    const up = pct > 0;
    return {
      pct,
      label: `${up ? "▲" : "▼"} ${Math.abs(pct)}% vs sem. pasada`,
      color: up ? "var(--ok-ink)" : "var(--bad-ink)",
    };
  }

  const recaudoDelta = calcDelta(recaudoFiltrado.semana, recaudoFiltrado.semanaAnterior);

  const quickActions = [
    { icon: "👥", label: "Nuevo cliente",  view: "clientes"  as ViewKey, filter: "new" },
    { icon: "💳", label: "Registrar pago", view: "cobros"    as ViewKey, filter: "new" },
    { icon: "🏍️", label: "Agregar moto",   view: "motos"     as ViewKey, filter: "new" },
    { icon: "📄", label: "Nuevo contrato", view: "contratos" as ViewKey, filter: "new" },
  ];

  // Grupo selector data
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

{/* ── BARRA DE ALERTAS COMPACTA ── */}
      {(() => {
        const nCrit  = alertasSistema.filter(a => a.nivel === "critico").length;
        const nAlert = alertasSistema.filter(a => a.nivel === "alerta").length;
        const nInfo  = alertasSistema.filter(a => a.nivel === "info").length;
        const total  = alertasSistema.length;
        if (total === 0) {
          return (
            <div
              onClick={() => onNavigate("alertas")}
              style={{ marginBottom: 16, background: "var(--ok-soft)", borderRadius: 14, padding: "12px 18px", border: "1px solid var(--ok-line)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            >
              <span style={{ fontSize: 18 }}>✅</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ok-ink)", flex: 1 }}>Todo al día — sin alertas pendientes</span>
              <span style={{ color: "var(--ok-ink)", fontSize: 14 }}>›</span>
            </div>
          );
        }
        return (
          <div
            onClick={() => onNavigate("alertas")}
            style={{ marginBottom: 16, background: nCrit > 0 ? "#fff1f2" : "var(--orange-soft)", borderRadius: 14, padding: "10px 16px", border: `1px solid ${nCrit > 0 ? "#fecdd3" : "var(--orange-soft)"}`, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexWrap: "wrap" }}
          >
            <span style={{ fontSize: 16 }}>{nCrit > 0 ? "🚨" : "⚠️"}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: nCrit > 0 ? "var(--bad-ink)" : "var(--orange)", flex: 1, minWidth: 120 }}>
              {total} alerta{total > 1 ? "s" : ""} activa{total > 1 ? "s" : ""}
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {nCrit  > 0 && <span style={{ fontSize: 11, fontWeight: 800, color: "var(--bad-ink)", background: "var(--bad-soft)", padding: "3px 10px", borderRadius: 999 }}>🚨 {nCrit} crítica{nCrit > 1 ? "s" : ""}</span>}
              {nAlert > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--warn-ink)", background: "var(--warn-soft)", padding: "3px 10px", borderRadius: 999 }}>⚠️ {nAlert} alerta{nAlert > 1 ? "s" : ""}</span>}
              {nInfo  > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-ink)", background: "var(--accent-soft3)", padding: "3px 10px", borderRadius: 999 }}>ℹ️ {nInfo} info</span>}
            </div>
            <span style={{ color: nCrit > 0 ? "var(--bad-ink)" : "var(--orange)", fontSize: 16, fontWeight: 700 }}>›</span>
          </div>
        );
      })()}

      {/* ── HERO: recaudo del día (filtrado por grupo) ── */}
      <div style={{
        background: "linear-gradient(135deg, var(--text) 0%, var(--accent-ink2) 100%)",
        borderRadius: 20, padding: isMobile ? "22px 20px" : "28px 32px",
        marginBottom: 20, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: -40, top: -40,
          width: 180, height: 180, borderRadius: "50%",
          background: "rgba(2,132,199,0.15)", pointerEvents: "none",
        }} />
        <div style={{ fontSize: 12, color: "var(--faint)", textTransform: "capitalize", marginBottom: 6, letterSpacing: "0.04em" }}>
          {hoy}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-hi)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Recaudo del día
          </div>
          {grupoSeleccionado !== "todos" && (
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase",
              background: "rgba(56,189,248,0.15)", color: "var(--accent-hi)",
              padding: "2px 8px", borderRadius: 999,
            }}>
              {grupoSeleccionado}
            </span>
          )}
        </div>
        <div style={{ fontSize: isMobile ? 36 : 48, fontWeight: 900, color: "var(--card)", lineHeight: 1, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
          ${fmt(recaudoFiltrado.hoy)}
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 13, color: "var(--faint)" }}>
            Semana:&nbsp;
            <span style={{ color: "var(--ok2)", fontWeight: 700 }}>${fmt(recaudoFiltrado.semana)}</span>
            &nbsp;en pagos confirmados
          </div>
          <div style={{ fontSize: 13, color: "var(--faint)", marginTop: 4 }}>
            <span style={{ color: "var(--accent-hi)", fontWeight: 700 }}>{grupoActualStats.asignadas}</span>
            {" en campo · "}
            <span style={{ color: "var(--ok2)", fontWeight: 700 }}>{grupoActualStats.disponibles}</span>
            {" disponibles · "}
            <span style={{ color: "var(--accent-line)", fontWeight: 700 }}>{grupoActualStats.pct}%</span>
            {" asignado"}
          </div>
        </div>

        {/* Selector de grupo dentro del panel */}
        <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { key: "todos" as const, label: "Toda la flota", total: motos.length },
            ...gruposVisibles.map(g => ({ key: g.g as GrupoMoto, label: g.g, total: g.total })),
          ].map(op => {
            const isSelected = grupoSeleccionado === op.key;
            return (
              <button
                key={op.key}
                onClick={() => setGrupoSeleccionado(op.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 12px", borderRadius: 99, border: "none", cursor: "pointer",
                  background: isSelected ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                  color: isSelected ? "var(--card)" : "var(--faint)",
                  fontWeight: isSelected ? 700 : 500, fontSize: 11,
                  transition: "all 0.15s",
                  outline: isSelected ? "1.5px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span>{op.label}</span>
                <span style={{
                  fontSize: 10, fontWeight: 800,
                  color: isSelected ? "var(--accent-hi)" : "var(--muted)",
                }}>{op.total}</span>
              </button>
            );
          })}
        </div>

        {/* Delta semana anterior — esquina inferior derecha */}
        {recaudoDelta.pct !== 0 && (
          <div style={{
            position: "absolute", bottom: 14, right: 18,
            fontSize: 10, fontWeight: 700,
            color: recaudoDelta.color === "var(--ok-ink)" ? "var(--ok2)" : "var(--bad-line)",
            opacity: 0.8,
          }}>
            {recaudoDelta.label}
          </div>
        )}
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
            sub: "con moto asignada", color: "var(--ok-ink)",
            bg: "var(--ok-soft)", onClick: () => onNavigate("clientes", "Activo"),
            delta: calcDelta(stats.clientesActivos, stats.prevClientesActivos),
          },
          {
            icon: "🏍️", label: "Motos en campo", value: stats.motosAsignadas,
            sub: `${stats.motosDisponibles} disponibles`, color: "var(--accent)",
            bg: "var(--accent-soft2)", onClick: () => onNavigate("motos", "Asignada"),
            delta: calcDelta(stats.motosAsignadas, stats.prevMotosAsignadas),
          },
          {
            icon: "🚨", label: "En mora", value: stats.clientesMora,
            sub: "requieren acción", color: "var(--bad-ink)",
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
            color: stats.motosInmovilizar > 0 ? "var(--warn-ink)" : "var(--ok-ink)",
            bg: stats.motosInmovilizar > 0 ? "var(--warn-soft2)" : "var(--ok-soft)",
            onClick: () => onNavigate("inmovilizaciones"),
            delta: { pct: 0, label: "", color: "var(--faint)" },
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
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted2)", marginTop: 3 }}>{kpi.label}</div>
            <div style={{ fontSize: 10, color: "var(--faint)", marginTop: 2 }}>{kpi.sub}</div>
            {kpi.delta.pct !== 0 && (
              <div style={{ fontSize: 10, fontWeight: 700, color: kpi.delta.color, marginTop: 3 }}>
                {kpi.delta.label}
              </div>
            )}
          </div>
        ))}
      </div>


      {/* ── ACCIONES RÁPIDAS (entre banner y tarjetas) ── */}
      <div style={{
        background: "var(--card)", borderRadius: 16, padding: "14px 16px",
        boxShadow: "0 2px 14px rgba(15,23,42,0.07)", marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", marginBottom: 10 }}>Acciones rápidas</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}>
          {quickActions.map(a => (
            <button
              key={a.label}
              onClick={() => onNavigate(a.view, a.filter)}
              style={{
                display: "flex", flexDirection: isMobile ? "column" : "row",
                alignItems: "center", justifyContent: "center", gap: isMobile ? 4 : 8,
                padding: "10px 10px", borderRadius: 12,
                border: "1px solid var(--line)",
                background: "var(--soft2)",
                cursor: "pointer", fontSize: isMobile ? 11 : 13, fontWeight: 600, color: "var(--muted2)",
                textAlign: "center", transition: "background 0.12s, border-color 0.12s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-soft2)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-line)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--soft2)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line)";
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
            color: "var(--accent)", bg: "var(--accent-soft2)",
            onClick: () => onNavigate("cobros"),
          },
          {
            label: "En gabela",
            value: stats.clientesMora > 0 ? stats.clientesMora : 0,
            icon: "⏳",
            color: "var(--warn-ink)", bg: "var(--warn-soft)",
            onClick: () => onNavigate("cobros"),
          },
          {
            label: "En mora",
            value: stats.clientesMora,
            icon: "🔴",
            color: "var(--bad-ink)", bg: "var(--bad-soft)",
            onClick: () => onNavigate("clientes", "mora"),
          },
          {
            label: "Recuperadas (sem.)",
            value: stats.recuperadasSemana,
            icon: "🔄",
            color: "var(--ok-ink)", bg: "var(--ok-soft)",
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
              borderLeft: `4px solid ${s.color}`,
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
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", marginTop: 3 }}>{s.label}</div>
              </div>
              <span style={{ fontSize: 20, opacity: 0.7 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── CONTRATOS POR MODALIDAD: chips compactos (móvil arriba, desktop dentro de grid) ── */}
      {isMobile ? (
        <div style={{
          background: "var(--card)", borderRadius: 14, padding: "10px 14px",
          boxShadow: "0 1px 8px rgba(15,23,42,0.07)", marginBottom: 12,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 8, letterSpacing: "0.04em" }}>Contratos por modalidad</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {Object.entries(stats.porModalidad).map(([mod, n]) => (
              <div
                key={mod}
                onClick={() => onNavigate("contratos", "Activo")}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "7px 4px", borderRadius: 9, textAlign: "center",
                  background: n > 0 ? "var(--accent-soft4)" : "var(--soft2)",
                  border: `1px solid ${n > 0 ? "var(--accent-line)" : "var(--line)"}`,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 900, color: n > 0 ? "var(--accent)" : "var(--line2)", lineHeight: 1 }}>{n}</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: n > 0 ? "var(--muted2)" : "var(--faint)", marginTop: 3 }}>{mod}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* ── PIPELINE + CONTRATOS MODALIDAD (lado a lado en desktop) ── */}
      <div style={{
        display: isMobile ? "block" : "grid",
        gridTemplateColumns: isMobile ? undefined : "minmax(0, 3fr) minmax(0, 2fr)",
        gap: 16,
        alignItems: "start",
        marginBottom: 16,
      }}>
        {/* Pipeline de clientes */}
        <div style={{
          background: "var(--card)", borderRadius: 16, padding: "14px 16px",
          boxShadow: "0 2px 14px rgba(15,23,42,0.07)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", marginBottom: 10 }}>Pipeline de clientes</div>
          {pipelineRows.map(row => {
            const pct = Math.round((row.count / totalClientes) * 100);
            return (
              <div
                key={row.label}
                onClick={() => onNavigate("clientes", row.filter)}
                style={{ marginBottom: 8, cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: "var(--muted)", fontWeight: 500 }}>{row.label}</span>
                  <span style={{ fontWeight: 800, color: "var(--text)", fontSize: 12 }}>{row.count}</span>
                </div>
                <div style={{ height: 7, borderRadius: 99, background: "var(--soft)", overflow: "hidden" }}>
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
        </div>

        {/* Contratos por modalidad — solo en desktop (en móvil ya se muestra arriba) */}
        {!isMobile && (
          <Section title="Contratos por modalidad">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(stats.porModalidad).map(([mod, n]) => (
                <div
                  key={mod}
                  onClick={() => onNavigate("contratos", "Activo")}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    padding: "16px 10px", borderRadius: 12, textAlign: "center",
                    background: n > 0 ? "var(--accent-soft4)" : "var(--soft2)",
                    border: `1px solid ${n > 0 ? "var(--accent-line)" : "var(--line)"}`,
                    cursor: "pointer", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => n > 0 && ((e.currentTarget as HTMLDivElement).style.background = "var(--accent-soft)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = n > 0 ? "var(--accent-soft4)" : "var(--soft2)")}
                >
                  <div style={{ fontSize: 24, fontWeight: 900, color: n > 0 ? "var(--accent)" : "var(--line2)", lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: n > 0 ? "var(--muted2)" : "var(--faint)", marginTop: 5 }}>{mod}</div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* ── TALLER SNAPSHOT ── */}
      {stats.tallerActivo > 0 && (
        <div
          onClick={() => onNavigate("taller")}
          style={{
            background: "var(--orange-soft)", borderRadius: 16, padding: "16px 18px",
            border: "1px solid var(--orange-soft)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 14,
            boxShadow: "0 1px 6px rgba(15,23,42,0.06)",
            transition: "background 0.15s", marginBottom: 16,
          }}
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--warn-soft)"}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "var(--orange-soft)"}
        >
          <span style={{ fontSize: 28 }}>🔧</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--orange)" }}>{stats.tallerActivo}</div>
            <div style={{ fontSize: 12, color: "var(--orange-ink)", fontWeight: 600 }}>
              moto{stats.tallerActivo > 1 ? "s" : ""} en taller
            </div>
          </div>
          <span style={{ marginLeft: "auto", color: "var(--orange)", fontSize: 20 }}>›</span>
        </div>
      )}

      {/* ── RECAUDO CHART ── */}
      <div style={{
        background: "var(--card)", borderRadius: 16, padding: "18px 20px",
        boxShadow: "0 2px 14px rgba(15,23,42,0.07)", marginBottom: 16,
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted2)" }}>Recaudo — últimos {chartDays} días</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Total: <span style={{ fontWeight: 800, color: "var(--accent)" }}>${fmt(totalRecaudoChart)}</span></div>
          </div>
          <div style={{ display: "flex", gap: 4, background: "var(--soft)", borderRadius: 10, padding: 3 }}>
            {([7, 14, 30] as const).map(d => (
              <button
                key={d}
                onClick={() => setChartDays(d)}
                style={{
                  padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 700,
                  background: chartDays === d ? "var(--text)" : "transparent",
                  color: chartDays === d ? "var(--card)" : "var(--muted)",
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
                    <div style={{ fontSize: 8, fontWeight: 700, color: d.esHoy ? "var(--accent)" : "var(--faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "clip", maxWidth: "100%", textAlign: "center" }}>
                      {label}
                    </div>
                  )}
                  <div style={{
                    width: "100%", borderRadius: "3px 3px 0 0",
                    background: d.esHoy ? "var(--accent)" : "var(--line2)",
                    height: `${altoPx}%`, minHeight: 3,
                    transition: "height 0.3s",
                    boxShadow: d.esHoy ? "0 0 8px rgba(2,132,199,0.4)" : "none",
                  }} />
                  {(chartDays <= 14 || d.esHoy) && (
                    <div style={{ fontSize: 8, color: "var(--faint)", textTransform: "capitalize", whiteSpace: "nowrap" }}>{diaSemana}</div>
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
          background: "var(--card)", borderRadius: 16, padding: "18px 20px",
          boxShadow: "0 2px 14px rgba(15,23,42,0.07)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted2)", marginBottom: 14 }}>
            Contratos con más días sin pago
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {top5SinPago.map(({ contrato, diasSinPago }, i) => {
              const clienteItem = clientes.find(cl => cl.id === contrato.cliente_id);
              const motoItem    = motos.find(m => m.id === contrato.moto_id);
              const esCritico   = diasSinPago > 7;
              const esMora      = diasSinPago >= 3 && diasSinPago <= 7;
              const badgeBg     = esCritico ? "var(--bad-soft)" : esMora ? "var(--warn-soft)" : "var(--soft)";
              const badgeColor  = esCritico ? "var(--bad-ink)" : esMora ? "var(--warn-ink)" : "var(--muted)";
              // Forma + color (daltónico-safe): ✕ mora/crítico · ▲ gabela — igual que Cartera.
              const badgeLabel  = esCritico ? "✕ Crítico" : esMora ? "✕ Mora" : "▲ Gabela";
              const borderColor = esCritico ? "var(--bad)" : esMora ? "var(--warn2)" : "var(--line)";
              return (
                <div
                  key={contrato.id}
                  onClick={() => clienteItem ? onNavigate("ficha_cliente" as ViewKey, clienteItem.id) : onNavigate("cobros")}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", borderRadius: 12,
                    borderLeft: `4px solid ${borderColor}`,
                    background: esCritico ? "#fff8f8" : esMora ? "#fffdf5" : "var(--soft2)",
                    cursor: "pointer", gap: 12,
                    transition: "background 0.12s",
                    animation: "mgEntra .28s var(--ease) both",
                    animationDelay: `${i * 35}ms`,
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "0.85"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
                >
                  <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      {motoItem && <Placa placa={motoItem.placa} size="sm" />}
                      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
                        {clienteItem?.nombre ?? "Sin cliente"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
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
