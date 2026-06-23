import { useMemo, useState, useEffect } from "react";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { usePagos } from "../hooks/usePagos";
import { useAuth } from "../contexts/AuthContext";
import type { Pago } from "../hooks/usePagos";

type GrupoMoto = "COSTA" | "PRADERA" | "RASTREADOR";

const GRUPO_NAMES: Record<GrupoMoto, string> = {
  RASTREADOR: "Rastreador",
  COSTA: "Costa",
  PRADERA: "Pradera",
};

const GRUPO_COLOR: Record<GrupoMoto, string> = {
  RASTREADOR: "#0284c7",
  COSTA: "#0d9488",
  PRADERA: "#7c3aed",
};

function fmt(n: number) {
  return Math.round(n).toLocaleString("es-CO");
}

const DIAS_ABREV = ["D", "L", "M", "X", "J", "V", "S"];

function BarChart({ pagosGrupo, dias }: { pagosGrupo: Pago[]; dias: number }) {
  const hoy = new Date();
  const barras = Array.from({ length: dias }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - (dias - 1 - i));
    const fecha = d.toISOString().slice(0, 10);
    const total = pagosGrupo
      .filter(p => p.fecha === fecha && p.estado === "Confirmado")
      .reduce((a, p) => a + p.valor, 0);
    return { fecha, dow: d.getDay(), total, esHoy: i === dias - 1, label: d.getDate().toString() };
  });

  const maximo = Math.max(...barras.map(b => b.total), 1);

  return (
    <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 120 }}>
      {barras.map((b) => {
        const pct = (b.total / maximo) * 100;
        const isWeekend = b.dow === 0 || b.dow === 6;
        return (
          <div key={b.fecha} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            {b.total > 0 && (
              <div style={{ fontSize: 9, fontWeight: 700, color: b.esHoy ? "#0284c7" : "#64748b", textAlign: "center", lineHeight: 1.2 }}>
                ${fmt(b.total / 1000)}k
              </div>
            )}
            <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
              <div style={{
                width: "100%",
                height: `${Math.max(pct, b.total > 0 ? 6 : 2)}%`,
                borderRadius: "3px 3px 0 0",
                background: b.esHoy
                  ? "#0284c7"
                  : isWeekend
                  ? "#cbd5e1"
                  : b.total > 0
                  ? "#bfdbfe"
                  : "#e2e8f0",
                minHeight: 2,
              }} />
            </div>
            <div style={{ fontSize: 9, fontWeight: b.esHoy ? 800 : 500, color: b.esHoy ? "#0284c7" : "#94a3b8" }}>
              {DIAS_ABREV[b.dow]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SocioDashboard() {
  const { profile, signOut } = useAuth();
  const grupo = (profile?.grupo ?? "RASTREADOR") as GrupoMoto;
  const grupoColor = GRUPO_COLOR[grupo];

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const { motos } = useMotos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { pagos } = usePagos();

  const motosGrupo = useMemo(() => motos.filter(m => m.grupo === grupo), [motos, grupo]);

  const contratosActivos = useMemo(() => {
    const idsMotosGrupo = new Set(motosGrupo.map(m => m.id));
    return contratos.filter(c => c.estado === "Activo" && c.moto_id && idsMotosGrupo.has(c.moto_id));
  }, [contratos, motosGrupo]);

  const hoy = new Date().toISOString().slice(0, 10);
  const inicioSemana = (() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().slice(0, 10);
  })();
  const inicioMes = hoy.slice(0, 7) + "-01";

  const idsContratos = useMemo(() => new Set(contratosActivos.map(c => c.id)), [contratosActivos]);
  const pagosGrupo = useMemo(() => pagos.filter(p => idsContratos.has(p.contrato_id)), [pagos, idsContratos]);

  const recaudadoSemana = pagosGrupo
    .filter(p => p.fecha >= inicioSemana && p.estado === "Confirmado")
    .reduce((a, p) => a + p.valor, 0);

  const recaudadoMes = pagosGrupo
    .filter(p => p.fecha >= inicioMes && p.estado === "Confirmado")
    .reduce((a, p) => a + p.valor, 0);

  const estadosPorContrato = useMemo(() => {
    return contratosActivos.map(c => {
      const pagosC = pagosGrupo.filter(p => p.contrato_id === c.id && p.estado === "Confirmado");
      const ultimoPago = pagosC.sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
      const diasSinPago = ultimoPago
        ? Math.floor((new Date().getTime() - new Date(ultimoPago.fecha + "T00:00:00").getTime()) / 86400000)
        : 999;
      const cliente = clientes.find(cl => cl.id === c.cliente_id);
      const moto = motos.find(m => m.id === c.moto_id);
      return { contrato: c, cliente, moto, diasSinPago, ultimoPago };
    });
  }, [contratosActivos, pagosGrupo, clientes, motos]);

  const enMora = estadosPorContrato.filter(e => e.diasSinPago > 2);
  const alDia = estadosPorContrato.filter(e => e.diasSinPago <= 1);

  const tarifaPromedio = contratosActivos.length > 0
    ? contratosActivos.reduce((a, c) => a + (c.tarifa_diaria ?? 27000), 0) / contratosActivos.length
    : 0;
  const proyeccionMensual = tarifaPromedio * contratosActivos.length * 26;

  const cardBase: React.CSSProperties = {
    background: "white",
    borderRadius: 16,
    padding: "18px 20px",
    boxShadow: "0 2px 12px rgba(15,23,42,0.07)",
  };

  const kpis = [
    {
      label: "Motos activas",
      value: motosGrupo.filter(m => m.estado === "Asignada").length,
      total: motosGrupo.length,
      sub: `de ${motosGrupo.length} en el grupo`,
      color: grupoColor,
      icon: "🏍️",
    },
    {
      label: "Contratos activos",
      value: contratosActivos.length,
      sub: "generando ingreso",
      color: "#166534",
      icon: "📄",
    },
    {
      label: "Clientes en mora",
      value: enMora.length,
      sub: enMora.length > 0 ? "requieren atención" : "todo al día",
      color: enMora.length > 0 ? "#991b1b" : "#166534",
      icon: enMora.length > 0 ? "⚠️" : "✅",
    },
    {
      label: "Clientes al día",
      value: alDia.length,
      sub: `de ${contratosActivos.length} contratos`,
      color: "#166534",
      icon: "✓",
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 20px" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 28, gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: `linear-gradient(135deg, ${grupoColor}, ${grupoColor}aa)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, boxShadow: `0 4px 14px ${grupoColor}44`,
          }}>
            🏍️
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 900, color: "#0f172a" }}>
              Dashboard — Grupo {GRUPO_NAMES[grupo]}
            </h2>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 3, display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ textTransform: "uppercase", fontWeight: 700 }}>{profile?.nombre}</span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
              <span>Solo lectura</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          style={{
            padding: "8px 18px", borderRadius: 10, border: "1.5px solid #e2e8f0",
            background: "white", cursor: "pointer", fontSize: 13, fontWeight: 700,
            color: "#64748b", display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <span>⎋</span> Cerrar sesión
        </button>
      </div>

      {/* Hero — recaudo semana */}
      <div style={{
        ...cardBase,
        background: `linear-gradient(135deg, ${grupoColor} 0%, ${grupoColor}cc 100%)`,
        color: "white", marginBottom: 20,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", opacity: 0.8, letterSpacing: 0.5 }}>
            Recaudo esta semana
          </div>
          <div style={{ fontSize: isMobile ? 34 : 42, fontWeight: 900, lineHeight: 1.1, marginTop: 6 }}>
            ${fmt(recaudadoSemana)}
          </div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
            ${fmt(recaudadoMes)} acumulado en el mes
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", opacity: 0.8, letterSpacing: 0.5, marginBottom: 4 }}>
            Proyección mensual
          </div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>${fmt(proyeccionMensual)}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>~26 días L–S</div>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: 12, marginBottom: 20,
      }}>
        {kpis.map(k => (
          <div key={k.label} style={{ ...cardBase, borderTop: `3px solid ${k.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {k.label}
              </div>
              <span style={{ fontSize: 18 }}>{k.icon}</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: k.color, lineHeight: 1.1, marginTop: 8 }}>
              {k.value}
            </div>
            {k.sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Recaudo 14 días */}
      <div style={{ ...cardBase, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Recaudo — últimos 14 días</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Total: <strong style={{ color: "#0284c7" }}>${fmt(recaudadoMes)}</strong> este mes
          </div>
        </div>
        <BarChart pagosGrupo={pagosGrupo} dias={14} />
        <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: "#94a3b8" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: "#0284c7", display: "inline-block" }} /> Hoy
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: "#bfdbfe", display: "inline-block" }} /> Día hábil
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: "#cbd5e1", display: "inline-block" }} /> Fin de semana
          </span>
        </div>
      </div>

      {/* Estado de la flota */}
      <div style={{ ...cardBase, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 14 }}>Estado de la flota</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(["Disponible", "Asignada", "En taller", "Recuperada", "Suspendida", "Fiscalía", "Tránsito", "Garantía"] as const).map(estado => {
            const count = motosGrupo.filter(m => m.estado === estado).length;
            if (count === 0) return null;
            const colores: Record<string, { bg: string; color: string }> = {
              "Asignada":    { bg: "#dcfce7", color: "#166534" },
              "Disponible":  { bg: "#dbeafe", color: "#1e40af" },
              "En taller":   { bg: "#fef3c7", color: "#92400e" },
              "Recuperada":  { bg: "#e0f2fe", color: "#0369a1" },
              "Suspendida":  { bg: "#ede9fe", color: "#6d28d9" },
              "Fiscalía":    { bg: "#fee2e2", color: "#991b1b" },
              "Tránsito":    { bg: "#fee2e2", color: "#991b1b" },
              "Garantía":    { bg: "#f3f4f6", color: "#6b7280" },
            };
            const c = colores[estado] ?? { bg: "#f1f5f9", color: "#334155" };
            return (
              <div key={estado} style={{
                background: c.bg, borderRadius: 12, padding: "10px 16px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: c.color }}>{count}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{estado}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clientes en mora */}
      {enMora.length > 0 && (
        <div style={{ ...cardBase, marginBottom: 20, borderLeft: "4px solid #ef4444" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#991b1b" }}>
              Clientes en mora — {enMora.length}
            </h3>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {enMora.sort((a, b) => b.diasSinPago - a.diasSinPago).map(({ contrato, cliente, moto, diasSinPago }) => {
              const esCritico = diasSinPago > 7;
              const deuda = Math.min(diasSinPago, 30) * (contrato.tarifa_diaria ?? 27000);
              return (
                <div key={contrato.id} style={{
                  padding: "12px 14px", borderRadius: 12,
                  background: esCritico ? "#fff5f5" : "#fefce8",
                  border: `1px solid ${esCritico ? "#fecaca" : "#fde68a"}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, textTransform: "uppercase", color: "#0f172a" }}>
                      {cliente?.nombre ?? "Sin cliente"}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {moto?.placa ? `Placa: ${moto.placa} · ` : ""}
                      {moto?.marca} {moto?.modelo}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: esCritico ? "#991b1b" : "#92400e", lineHeight: 1 }}>
                        {diasSinPago === 999 ? "∞" : diasSinPago}
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>días sin pago</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#991b1b" }}>${fmt(deuda)}</div>
                      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>adeudado</div>
                    </div>
                    <span style={{
                      padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                      background: esCritico ? "#fee2e2" : "#fef3c7",
                      color: esCritico ? "#991b1b" : "#92400e",
                    }}>
                      {esCritico ? "Crítico" : "Mora"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabla contratos activos */}
      <div style={{ ...cardBase }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Contratos activos</h3>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            <span style={{ color: "#166534", fontWeight: 700 }}>{alDia.length} al día</span>
            {enMora.length > 0 && <> · <span style={{ color: "#991b1b", fontWeight: 700 }}>{enMora.length} en mora</span></>}
          </div>
        </div>
        <div style={{ display: "grid", gap: 6, maxHeight: 420, overflowY: "auto" }}>
          {estadosPorContrato.sort((a, b) => b.diasSinPago - a.diasSinPago).map(({ contrato, cliente, moto, diasSinPago, ultimoPago }) => {
            const enM = diasSinPago > 2;
            return (
              <div key={contrato.id} style={{
                padding: "10px 14px", borderRadius: 10,
                background: enM ? "#fff5f5" : "#f8fafc",
                border: `1px solid ${enM ? "#fecaca" : "#e2e8f0"}`,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>
                    {moto?.placa ? `${moto.placa} · ` : ""}{cliente?.nombre ?? "Sin cliente"}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
                    {contrato.tipo_ruta ?? contrato.forma_pago ?? "Contrato"}
                    {ultimoPago ? ` · Último pago: ${new Date(ultimoPago.fecha + "T00:00:00").toLocaleDateString("es-CO")}` : " · Sin pagos"}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0284c7" }}>${fmt(contrato.tarifa_diaria ?? 27000)}/día</div>
                  {enM && <div style={{ fontSize: 11, color: "#991b1b", fontWeight: 700 }}>{diasSinPago === 999 ? "Sin pagos" : `${diasSinPago}d sin pago`}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
