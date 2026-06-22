import React, { useMemo } from "react";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { usePagos } from "../hooks/usePagos";
import { useAuth } from "../contexts/AuthContext";

type GrupoMoto = "COSTA" | "PRADERA" | "RASTREADOR";

const card: React.CSSProperties = {
  background: "white", borderRadius: 16, padding: 20,
  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
};

function fmt(n: number) {
  return Math.round(n).toLocaleString("es-CO");
}

function KPICard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color ?? "#0f172a", marginTop: 8 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

const GRUPO_NAMES: Record<GrupoMoto, string> = {
  RASTREADOR: "Rastreador",
  COSTA: "Costa",
  PRADERA: "Pradera",
};

export default function SocioDashboard() {
  const { profile } = useAuth();
  const grupo = (profile?.grupo ?? "RASTREADOR") as GrupoMoto;

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
  const inicioMes = hoy.slice(0, 7) + "-01";

  const idsContratos = useMemo(() => new Set(contratosActivos.map(c => c.id)), [contratosActivos]);

  const pagosGrupo = useMemo(() => pagos.filter(p => idsContratos.has(p.contrato_id)), [pagos, idsContratos]);

  const recaudadoHoy = pagosGrupo
    .filter(p => p.fecha === hoy && p.estado === "Confirmado")
    .reduce((a, p) => a + p.valor, 0);

  const recaudadoMes = pagosGrupo
    .filter(p => p.fecha >= inicioMes && p.estado === "Confirmado")
    .reduce((a, p) => a + p.valor, 0);

  // Estado de mora: contar cuántos contratos tienen algún pago pendiente de hace más de 2 días
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

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #0284c7, #10b981)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, color: "white",
          }}>🏍️</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>Grupo {GRUPO_NAMES[grupo]}</h2>
            <div style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}>Vista de solo lectura · {profile?.nombre}</div>
          </div>
        </div>
      </div>

      {/* KPIs principales */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
        <KPICard label="Motos en el grupo" value={`${motosGrupo.length}`} sub={`${motosGrupo.filter(m => m.estado === "Disponible").length} disponibles`} />
        <KPICard label="Contratos activos" value={`${contratosActivos.length}`} sub="Motos generando" color="#0284c7" />
        <KPICard label="Recaudado hoy" value={`$ ${fmt(recaudadoHoy)}`} color="#166534" />
        <KPICard label="Recaudado en el mes" value={`$ ${fmt(recaudadoMes)}`} sub={new Date().toLocaleString("es-CO", { month: "long" })} color="#0284c7" />
        <KPICard label="En mora (&gt;2 días)" value={`${enMora.length}`} color={enMora.length > 0 ? "#991b1b" : "#166534"} />
        <KPICard label="Proyección mensual" value={`$ ${fmt(proyeccionMensual)}`} sub="~26 días L-S" color="#334155" />
      </div>

      {/* Estado de la flota */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 20 }}>
        {(["Disponible", "Asignada", "En taller", "Recuperada", "Suspendida", "Fiscalía", "Tránsito", "Garantía"] as const).map(estado => {
          const count = motosGrupo.filter(m => m.estado === estado).length;
          if (count === 0) return null;
          const colores: Record<string, { bg: string; color: string }> = {
            "Asignada": { bg: "#dcfce7", color: "#166534" },
            "Disponible": { bg: "#dbeafe", color: "#1e40af" },
            "En taller": { bg: "#fef3c7", color: "#92400e" },
            "Recuperada": { bg: "#e0f2fe", color: "#0369a1" },
            "Suspendida": { bg: "#ede9fe", color: "#6d28d9" },
            "Fiscalía": { bg: "#fee2e2", color: "#991b1b" },
            "Tránsito": { bg: "#fee2e2", color: "#991b1b" },
            "Garantía": { bg: "#f3f4f6", color: "#6b7280" },
          };
          const c = colores[estado] ?? { bg: "#f1f5f9", color: "#334155" };
          return (
            <div key={estado} style={{ ...card, background: c.bg, padding: "14px 16px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{count}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.color, marginTop: 4 }}>{estado}</div>
            </div>
          );
        })}
      </div>

      {/* Clientes en mora */}
      {enMora.length > 0 && (
        <div style={{ ...card, marginTop: 20, borderLeft: "4px solid #ef4444" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#991b1b" }}>En mora — {enMora.length} contratos</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {enMora.sort((a, b) => b.diasSinPago - a.diasSinPago).map(({ contrato, cliente, moto, diasSinPago }) => (
              <div key={contrato.id} style={{ padding: "10px 14px", borderRadius: 12, background: "#fff5f5", border: "1px solid #fecaca", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>
                    {moto?.placa ? `${moto.placa} · ` : ""}{cliente?.nombre ?? "Sin cliente"}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{diasSinPago === 999 ? "Sin pagos" : `${diasSinPago} días sin pago`}</div>
                </div>
                <span style={{ padding: "4px 10px", borderRadius: 999, background: "#fee2e2", color: "#991b1b", fontSize: 12, fontWeight: 700 }}>
                  {diasSinPago > 7 ? "Crítico" : diasSinPago > 2 ? "Mora" : "Gabela"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contratos al día */}
      <div style={{ ...card, marginTop: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>Contratos activos — {alDia.length} al día / {enMora.length} en mora</h3>
        <div style={{ display: "grid", gap: 8, maxHeight: 400, overflowY: "auto" }}>
          {estadosPorContrato.sort((a, b) => b.diasSinPago - a.diasSinPago).map(({ contrato, cliente, moto, diasSinPago, ultimoPago }) => (
            <div key={contrato.id} style={{
              padding: "10px 14px", borderRadius: 12,
              background: diasSinPago > 2 ? "#fff5f5" : "#f8fafc",
              border: `1px solid ${diasSinPago > 2 ? "#fecaca" : "#e2e8f0"}`,
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap",
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>
                  {moto?.placa ? `${moto.placa} · ` : ""}{cliente?.nombre ?? "Sin cliente"}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {contrato.tipo_ruta ?? contrato.forma_pago ?? "Contrato"}
                  {ultimoPago ? ` · Último pago: ${new Date(ultimoPago.fecha + "T00:00:00").toLocaleDateString("es-CO")}` : " · Sin pagos"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0284c7" }}>$ {fmt(contrato.tarifa_diaria ?? 27000)}/día</div>
                {diasSinPago > 2 && <div style={{ fontSize: 11, color: "#991b1b", fontWeight: 700 }}>{diasSinPago}d sin pago</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
