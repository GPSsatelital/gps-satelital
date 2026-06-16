import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import MotosView from "./pages/MotosView";

function Shell() {
  const { session, profile, loading, signOut } = useAuth();

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Cargando...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "Arial, sans-serif", color: "#0f172a" }}>
      <header style={{ position: "sticky", top: 0, background: "rgba(255,255,255,0.92)", borderBottom: "1px solid #e2e8f0", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>MotoGestión</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {profile?.nombre ?? "Usuario"} · Rol: {profile?.role ?? "..."}
          </div>
        </div>
        <button onClick={signOut} style={{ background: "white", border: "1px solid #cbd5e1", borderRadius: 14, padding: "10px 16px", fontWeight: 600, cursor: "pointer" }}>
          Cerrar sesión
        </button>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: 16 }}>
        <MotosView />
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
