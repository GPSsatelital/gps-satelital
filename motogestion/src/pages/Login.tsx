import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (modo === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      if (!nombre.trim()) {
        setError("Escribe tu nombre.");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, nombre.trim());
      if (error) {
        setError(error);
      } else {
        setInfo("Cuenta creada. Revisa tu correo para confirmar el registro y luego inicia sesión.");
        setModo("login");
      }
    }

    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "white", borderRadius: 16, padding: 28, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" }}>
        <div style={{ display: "inline-block", borderRadius: 999, background: "#e0f2fe", color: "#0369a1", padding: "6px 14px", fontWeight: 700, fontSize: 14 }}>
          MotoGestión
        </div>

        <h1 style={{ fontSize: 24, margin: "16px 0 4px" }}>
          {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {modo === "registro" && (
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={inputStyle}
            />
          )}

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
          {info && <div style={{ color: "#166534", fontSize: 13, fontWeight: 600 }}>{info}</div>}

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
            {loading ? "Cargando..." : modo === "login" ? "Entrar" : "Registrarme"}
          </button>
        </form>

        <button
          onClick={() => {
            setModo(modo === "login" ? "registro" : "login");
            setError(null);
            setInfo(null);
          }}
          style={{ marginTop: 14, background: "none", border: "none", color: "#0284c7", fontWeight: 600, cursor: "pointer" }}
        >
          {modo === "login" ? "¿No tienes cuenta? Crear una nueva" : "Ya tengo cuenta, iniciar sesión"}
        </button>
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
