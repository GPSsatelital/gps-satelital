import React from "react";
import { useMotos } from "../hooks/useMotos";
import { useClientes } from "../hooks/useClientes";
import { useContratos } from "../hooks/useContratos";
import { usePagos } from "../hooks/usePagos";
import { useTaller } from "../hooks/useTaller";

const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const sectionTitle: React.CSSProperties = { margin: "0 0 12px", fontSize: 18, fontWeight: 800, color: "#0f172a" };

type ViewKey = "clientes" | "motos" | "contratos" | "cobros" | "taller";

function StatCard({ label, value, color, onClick }: { label: string; value: number | string; color: string; onClick?: () => void }) {
  return (
    <div style={{ ...card, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ fontSize: 13, color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}

export default function DashboardView({ onNavigate }: { onNavigate: (view: ViewKey) => void }) {
  const { motos, loading: loadingMotos } = useMotos();
  const { clientes, loading: loadingClientes } = useClientes();
  const { contratos, loading: loadingContratos } = useContratos();
  const { pagos, loading: loadingPagos } = usePagos();
  const { taller, loading: loadingTaller } = useTaller();

  const loading = loadingMotos || loadingClientes || loadingContratos || loadingPagos || loadingTaller;

  if (loading) return <div style={{ padding: 24, color: "#64748b" }}>Cargando panel general...</div>;

  const motosDisponibles = motos.filter((m) => m.estado === "Disponible").length;
  const motosAsignadas = motos.filter((m) => m.estado === "Asignada").length;
  const motosMantenimiento = motos.filter((m) => ["Mantenimiento", "Recuperada"].includes(m.estado)).length;

  const clientesEnProceso = clientes.filter((c) => !["Activo", "Rechazado", "Retirado", "Lista negra"].includes(c.estado)).length;
  const clientesActivos = clientes.filter((c) => c.estado === "Activo").length;
  const clientesEnRiesgo = clientes.filter((c) => ["En riesgo", "En mora"].includes(c.estado)).length;

  const contratosActivos = contratos.filter((c) => c.estado === "Activo").length;
  const contratosEnProceso = contratos.filter((c) => c.estado === "En proceso").length;

  const pagosPendientes = pagos.filter((p) => p.estado === "Pendiente").length;
  const totalConfirmadoSemana = pagos
    .filter((p) => p.estado === "Confirmado")
    .reduce((acc, p) => acc + p.aplicado.semana, 0);

  const tallerEnProceso = taller.filter((t) => t.estado_tecnico !== "Finalizado").length;

  return (
    <div>
      <h2 style={{ fontSize: 22, margin: 0 }}>Panel general</h2>
      <p style={{ marginTop: 6, color: "#64748b" }}>Resumen en tiempo real de toda la operación.</p>

      <div style={{ marginTop: 24 }}>
        <h3 style={sectionTitle}>Motos</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
          <StatCard label="Disponibles" value={motosDisponibles} color="#166534" onClick={() => onNavigate("motos")} />
          <StatCard label="Asignadas" value={motosAsignadas} color="#1d4ed8" onClick={() => onNavigate("motos")} />
          <StatCard label="En mantenimiento" value={motosMantenimiento} color="#92400e" onClick={() => onNavigate("taller")} />
          <StatCard label="Total flota" value={motos.length} color="#0f172a" onClick={() => onNavigate("motos")} />
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={sectionTitle}>Clientes</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
          <StatCard label="En proceso de aprobación" value={clientesEnProceso} color="#92400e" onClick={() => onNavigate("clientes")} />
          <StatCard label="Activos" value={clientesActivos} color="#166534" onClick={() => onNavigate("clientes")} />
          <StatCard label="En riesgo / mora" value={clientesEnRiesgo} color="#991b1b" onClick={() => onNavigate("clientes")} />
          <StatCard label="Total registrados" value={clientes.length} color="#0f172a" onClick={() => onNavigate("clientes")} />
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={sectionTitle}>Contratos</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
          <StatCard label="Activos" value={contratosActivos} color="#166534" onClick={() => onNavigate("contratos")} />
          <StatCard label="En proceso" value={contratosEnProceso} color="#92400e" onClick={() => onNavigate("contratos")} />
          <StatCard label="Total" value={contratos.length} color="#0f172a" onClick={() => onNavigate("contratos")} />
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={sectionTitle}>Cobros y Taller</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
          <StatCard label="Transferencias pendientes" value={pagosPendientes} color="#92400e" onClick={() => onNavigate("cobros")} />
          <StatCard label="Recaudado en semana ($)" value={totalConfirmadoSemana.toLocaleString("es-CO")} color="#166534" onClick={() => onNavigate("cobros")} />
          <StatCard label="Motos en taller" value={tallerEnProceso} color="#1d4ed8" onClick={() => onNavigate("taller")} />
        </div>
      </div>
    </div>
  );
}
