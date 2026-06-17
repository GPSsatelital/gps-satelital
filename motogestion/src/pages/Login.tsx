import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) setError(error);

    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "white", borderRadius: 16, padding: 28, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" }}>
        <div style={{ display: "inline-block", borderRadius: 999, background: "#e0f2fe", color: "#0369a1", padding: "6px 14px", fontWeight: 700, fontSize: 14 }}>
          MotoGestión
        </div>

        <h1 style={{ fontSize: 24, margin: "16px 0 4px" }}>Iniciar sesión</h1>
        <p style={{ marginTop: 0, marginBottom: 4, color: "#64748b", fontSize: 13 }}>
          Las cuentas las crea un administrador desde el panel de Usuarios.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
            minLength={6}
          />

          {error && <div style={{ color: "#991b1b", fontSize: 13, fontWeight: 600 }}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)",
              color: "white",
              border: "none",
              borderRadius: 14,
              padding: "12px 16px",
              fontWeight: 700,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Cargando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};
