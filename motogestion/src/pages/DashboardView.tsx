import React from "react";
import { useMotos } from "../hooks/useMotos";
import { useClientes } from "../hooks/useClientes";
import { useContratos } from "../hooks/useContratos";
import { usePagos } from "../hooks/usePagos";
import { useTaller } from "../hooks/useTaller";

const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const sectionTitle: React.CSSProperties = { margin: "0 0 12px", fontSize: 18, fontWeight: 800, color: "#0f172a" };

type ViewKey = "clientes" | "motos" | "contratos" | "cobros" | "taller";

const listItem: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: 8 };


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
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, margin: 0 }}>Panel general</h2>
      <p style={{ marginTop: 4, color: "#64748b", fontSize: 13 }}>Resumen en tiempo real de toda la operación.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 20 }}>

        {/* Motos */}
        <div style={card}>
          <h3 style={{ ...sectionTitle, fontSize: 15, marginBottom: 10 }}>Motos</h3>
          <div style={{ ...listItem, cursor: "pointer" }} onClick={() => onNavigate("motos")}>
            <span style={{ fontSize: 13, color: "#334155" }}>Disponibles</span>
            <span style={{ fontWeight: 800, color: "#166534" }}>{motosDisponibles}</span>
          </div>
          <div style={{ ...listItem, cursor: "pointer" }} onClick={() => onNavigate("motos")}>
            <span style={{ fontSize: 13, color: "#334155" }}>Asignadas</span>
            <span style={{ fontWeight: 800, color: "#1d4ed8" }}>{motosAsignadas}</span>
          </div>
          <div style={{ ...listItem, cursor: "pointer" }} onClick={() => onNavigate("taller")}>
            <span style={{ fontSize: 13, color: "#334155" }}>En mantenimiento</span>
            <span style={{ fontWeight: 800, color: "#92400e" }}>{motosMantenimiento}</span>
          </div>
          <div style={{ ...listItem, cursor: "pointer" }} onClick={() => onNavigate("motos")}>
            <span style={{ fontSize: 13, color: "#334155" }}>Total flota</span>
            <span style={{ fontWeight: 800, color: "#0f172a" }}>{motos.length}</span>
          </div>
        </div>

        {/* Clientes */}
        <div style={card}>
          <h3 style={{ ...sectionTitle, fontSize: 15, marginBottom: 10 }}>Clientes</h3>
          <div style={{ ...listItem, cursor: "pointer" }} onClick={() => onNavigate("clientes")}>
            <span style={{ fontSize: 13, color: "#334155" }}>En proceso de aprobación</span>
            <span style={{ fontWeight: 800, color: "#92400e" }}>{clientesEnProceso}</span>
          </div>
          <div style={{ ...listItem, cursor: "pointer" }} onClick={() => onNavigate("clientes")}>
            <span style={{ fontSize: 13, color: "#334155" }}>Activos</span>
            <span style={{ fontWeight: 800, color: "#166534" }}>{clientesActivos}</span>
          </div>
          <div style={{ ...listItem, cursor: "pointer" }} onClick={() => onNavigate("clientes")}>
            <span style={{ fontSize: 13, color: "#334155" }}>En riesgo / mora</span>
            <span style={{ fontWeight: 800, color: "#991b1b" }}>{clientesEnRiesgo}</span>
          </div>
          <div style={{ ...listItem, cursor: "pointer" }} onClick={() => onNavigate("clientes")}>
            <span style={{ fontSize: 13, color: "#334155" }}>Total registrados</span>
            <span style={{ fontWeight: 800, color: "#0f172a" }}>{clientes.length}</span>
          </div>
        </div>

        {/* Contratos */}
        <div style={card}>
          <h3 style={{ ...sectionTitle, fontSize: 15, marginBottom: 10 }}>Contratos</h3>
          <div style={{ ...listItem, cursor: "pointer" }} onClick={() => onNavigate("contratos")}>
            <span style={{ fontSize: 13, color: "#334155" }}>Activos</span>
            <span style={{ fontWeight: 800, color: "#166534" }}>{contratosActivos}</span>
          </div>
          <div style={{ ...listItem, cursor: "pointer" }} onClick={() => onNavigate("contratos")}>
            <span style={{ fontSize: 13, color: "#334155" }}>En proceso</span>
            <span style={{ fontWeight: 800, color: "#92400e" }}>{contratosEnProceso}</span>
          </div>
          <div style={{ ...listItem, cursor: "pointer" }} onClick={() => onNavigate("contratos")}>
            <span style={{ fontSize: 13, color: "#334155" }}>Total</span>
            <span style={{ fontWeight: 800, color: "#0f172a" }}>{contratos.length}</span>
          </div>
        </div>

        {/* Cartera */}
        <div style={card}>
          <h3 style={{ ...sectionTitle, fontSize: 15, marginBottom: 10 }}>Cartera</h3>
          <div style={{ ...listItem, cursor: "pointer" }} onClick={() => onNavigate("cobros")}>
            <span style={{ fontSize: 13, color: "#334155" }}>Transferencias pendientes</span>
            <span style={{ fontWeight: 800, color: "#92400e" }}>{pagosPendientes}</span>
          </div>
          <div style={{ ...listItem, cursor: "pointer" }} onClick={() => onNavigate("cobros")}>
            <span style={{ fontSize: 13, color: "#334155" }}>Recaudado semana ($)</span>
            <span style={{ fontWeight: 800, color: "#166534" }}>{totalConfirmadoSemana.toLocaleString("es-CO")}</span>
          </div>
          <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 10, background: "#eff6ff", cursor: "pointer", fontSize: 13, color: "#1d4ed8", fontWeight: 700, textAlign: "center" }} onClick={() => onNavigate("cobros")}>
            Ver clientes con pagos pendientes →
          </div>
        </div>

        {/* Taller */}
        <div style={card}>
          <h3 style={{ ...sectionTitle, fontSize: 15, marginBottom: 10 }}>Taller</h3>
          <div style={{ ...listItem, cursor: "pointer" }} onClick={() => onNavigate("taller")}>
            <span style={{ fontSize: 13, color: "#334155" }}>Motos en proceso</span>
            <span style={{ fontWeight: 800, color: "#1d4ed8" }}>{tallerEnProceso}</span>
          </div>
          <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 10, background: "#f0fdf4", cursor: "pointer", fontSize: 13, color: "#166534", fontWeight: 700, textAlign: "center" }} onClick={() => onNavigate("taller")}>
            Ir al módulo de taller →
          </div>
        </div>

      </div>
    </div>
  );
}
