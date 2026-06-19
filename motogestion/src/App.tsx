import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import MotosView from "./pages/MotosView";
import ClientesView from "./pages/ClientesView";
import ContratosView from "./pages/ContratosView";
import CobrosView from "./pages/CobrosView";
import TallerView from "./pages/TallerView";
import DashboardView from "./pages/DashboardView";
import UsuariosView from "./pages/UsuariosView";
import LiquidacionesView from "./pages/LiquidacionesView";

type ViewKey = "dashboard" | "clientes" | "motos" | "contratos" | "cobros" | "taller" | "usuarios" | "liquidaciones";

const navItems: Array<{ key: ViewKey; label: string }> = [
  { key: "dashboard", label: "Panel" },
  { key: "clientes", label: "Clientes" },
  { key: "motos", label: "Motos" },
  { key: "contratos", label: "Contratos" },
  { key: "cobros", label: "Cartera" },
  { key: "taller", label: "Taller" },
];

function InstallBanner() {
  const [prompt, setPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setPrompt(e); setVisible(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible) return null;

  return (
    <div style={{ background: "#0284c7", color: "white", padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>Instala MotoGestión en tu celular para acceso rápido</span>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => { prompt?.prompt(); setVisible(false); }} style={{ background: "white", color: "#0284c7", border: "none", borderRadius: 10, padding: "6px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Instalar</button>
        <button onClick={() => setVisible(false)} style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 10, padding: "6px 10px", cursor: "pointer", fontSize: 13 }}>✕</button>
      </div>
    </div>
  );
}

function Shell() {
  const { session, profile, loading, signOut } = useAuth();
  const [view, setView] = useState<ViewKey>("dashboard");

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Cargando...</div>;
  }

  if (!session) {
    return <Login />;
  }

  const roleActual = profile?.role ?? "SECRETARIA";
  const esAdmin = roleActual === "ADMIN" || roleActual === "ADMIN_PRINCIPAL";
  const esMecanico = roleActual === "MECANICO";

  const itemsFiltrados = esMecanico
    ? navItems.filter((i) => i.key === "dashboard" || i.key === "taller")
    : navItems;

  const items = esAdmin
    ? [...itemsFiltrados, { key: "liquidaciones" as ViewKey, label: "Liquidaciones" }, { key: "usuarios" as ViewKey, label: "Usuarios" }]
    : itemsFiltrados;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "Arial, sans-serif", color: "#0f172a" }}>
      <InstallBanner />
      <header style={{ position: "sticky", top: 0, background: "rgba(255,255,255,0.92)", borderBottom: "1px solid #e2e8f0", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>MotoGestión</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {profile?.nombre ?? "Usuario"} · Rol: {profile?.role ?? "..."}
          </div>
        </div>

        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              style={{
                border: "none",
                borderRadius: 12,
                padding: "8px 14px",
                fontWeight: 700,
                cursor: "pointer",
                background: view === item.key ? "#0284c7" : "#e2e8f0",
                color: view === item.key ? "white" : "#334155",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={signOut} style={{ background: "white", border: "1px solid #cbd5e1", borderRadius: 14, padding: "10px 16px", fontWeight: 600, cursor: "pointer" }}>
          Cerrar sesión
        </button>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: 16 }}>
        {view === "dashboard" && <DashboardView onNavigate={setView} />}
        {view === "clientes" && <ClientesView />}
        {view === "motos" && <MotosView />}
        {view === "contratos" && <ContratosView />}
        {view === "cobros" && <CobrosView />}
        {view === "taller" && <TallerView />}
        {view === "liquidaciones" && esAdmin && <LiquidacionesView />}
        {view === "usuarios" && esAdmin && <UsuariosView />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
