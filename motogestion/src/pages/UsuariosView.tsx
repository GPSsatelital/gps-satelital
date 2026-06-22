import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Role } from "../contexts/AuthContext";

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid #cbd5e1", outline: "none", fontSize: 14, boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#334155" };
const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const primaryBtn: React.CSSProperties = { background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)", color: "white", border: "none", borderRadius: 14, padding: "10px 16px", fontWeight: 700, cursor: "pointer" };

type PerfilUsuario = { id: string; nombre: string; role: Role };

function roleLabel(role: Role) {
  const map: Record<Role, string> = {
    ADMIN: "Administrador",
    ADMIN_PRINCIPAL: "Admin Principal",
    SECRETARIA: "Secretaria",
    MECANICO: "Mecánico / Taller",
    SUBADMIN: "Subadministrador",
    SOCIO: "Socio (solo lectura)",
  };
  return map[role] ?? role;
}

function roleBadge(role: Role) {
  const map: Record<Role, { bg: string; color: string }> = {
    ADMIN: { bg: "#dbeafe", color: "#1d4ed8" },
    ADMIN_PRINCIPAL: { bg: "#ede9fe", color: "#6d28d9" },
    SECRETARIA: { bg: "#fef3c7", color: "#92400e" },
    MECANICO: { bg: "#dcfce7", color: "#166534" },
    SUBADMIN: { bg: "#e0f2fe", color: "#0369a1" },
    SOCIO: { bg: "#f1f5f9", color: "#334155" },
  };
  return map[role] ?? { bg: "#e2e8f0", color: "#334155" };
}

export default function UsuariosView() {
  const [usuarios, setUsuarios] = useState<PerfilUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("SECRETARIA");
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  async function cargarUsuarios() {
    const { data, error } = await supabase.from("profiles").select("id, nombre, role").order("nombre");
    if (error) {
      setListError(error.message);
    } else {
      setUsuarios((data ?? []) as PerfilUsuario[]);
      setListError(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function handleCrear() {
    setFormError(null);
    setInfo(null);

    if (!nombre.trim() || !email.trim() || !password) {
      setFormError("Completa nombre, correo y contraseña.");
      return;
    }

    if (password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCreando(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const { data, error } = await supabase.functions.invoke("create-user", {
      body: { nombre: nombre.trim(), email: email.trim(), password, role },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    setCreando(false);

    if (error) {
      setFormError(error.message || "No se pudo crear el usuario.");
      return;
    }

    if (data?.error) {
      setFormError(data.error);
      return;
    }

    setInfo(`Usuario "${nombre.trim()}" creado correctamente con rol ${role}.`);
    setNombre("");
    setEmail("");
    setPassword("");
    setRole("SECRETARIA");
    cargarUsuarios();
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, margin: 0 }}>Usuarios</h2>
      <p style={{ marginTop: 6, color: "#64748b" }}>Crea las cuentas del equipo y asígnales su rol. Solo un ADMIN puede entrar aquí.</p>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 0.9fr) minmax(280px, 1.1fr)", gap: 20, marginTop: 20 }}>
        <div style={card}>
          <h3 style={{ margin: 0, fontSize: 20 }}>Crear nuevo usuario</h3>

          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <div>
              <div style={labelStyle}>Nombre completo</div>
              <input style={inputStyle} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. María Pérez" />
            </div>

            <div>
              <div style={labelStyle}>Correo electrónico</div>
              <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@empresa.com" />
            </div>

            <div>
              <div style={labelStyle}>Contraseña temporal</div>
              <input type="password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>

            <div>
              <div style={labelStyle}>Rol</div>
              <select style={inputStyle} value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="SECRETARIA">Secretaria</option>
                <option value="MECANICO">Mecánico / Encargado de Taller</option>
                <option value="SUBADMIN">Subadministrador</option>
                <option value="ADMIN">Administrador</option>
                <option value="ADMIN_PRINCIPAL">Administrador Principal</option>
              </select>
            </div>

            {formError && <div style={{ color: "#991b1b", fontWeight: 600 }}>{formError}</div>}
            {info && <div style={{ color: "#166534", fontWeight: 600 }}>{info}</div>}

            <button onClick={handleCrear} disabled={creando} style={{ ...primaryBtn, opacity: creando ? 0.7 : 1 }}>
              {creando ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </div>

        <div style={card}>
          <h3 style={{ margin: 0, fontSize: 20 }}>Equipo actual</h3>

          {listError && <div style={{ marginTop: 12, color: "#991b1b" }}>Error: {listError}</div>}

          {loading ? (
            <div style={{ marginTop: 16, color: "#64748b" }}>Cargando usuarios...</div>
          ) : (
            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {usuarios.length === 0 && <div style={{ color: "#64748b" }}>No hay usuarios todavía.</div>}

              {usuarios.map((u) => (
                <div key={u.id} style={{ padding: 12, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700 }}>{u.nombre}</div>
                  <span style={{ padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: roleBadge(u.role).bg, color: roleBadge(u.role).color }}>
                    {roleLabel(u.role)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
