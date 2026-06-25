import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Role } from "../contexts/AuthContext";
import type { ViewKey } from "../App";
import { MODULOS_ASIGNABLES, ACCESOS_SUGERIDOS } from "../lib/modulos";

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid #cbd5e1", outline: "none", fontSize: 14, boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#334155" };
const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const primaryBtn: React.CSSProperties = { background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)", color: "white", border: "none", borderRadius: 14, padding: "10px 16px", fontWeight: 700, cursor: "pointer" };

type GrupoSocio = "COSTA" | "PRADERA" | "RASTREADOR" | "USADAS";
type PerfilUsuario = { id: string; nombre: string; role: Role; grupo: GrupoSocio | null; permisos: string[] | null };

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "SECRETARIA", label: "Secretaria" },
  { value: "MECANICO", label: "Mecánico / Encargado de Taller" },
  { value: "SUBADMIN", label: "Subadministrador" },
  { value: "ADMIN", label: "Administrador" },
  { value: "ADMIN_PRINCIPAL", label: "Administrador Principal" },
  { value: "SOCIO", label: "Socio (solo lectura)" },
];

function roleLabel(role: Role) {
  return ROLE_OPTIONS.find(r => r.value === role)?.label ?? role;
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

// Llama a la Edge Function manage-users con el token del admin actual
async function invocar(payload: Record<string, unknown>): Promise<{ error: string | null }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  const { data, error } = await supabase.functions.invoke("manage-users", {
    body: payload,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (error) return { error: error.message || "Error de conexión" };
  if (data?.error) return { error: data.error };
  return { error: null };
}

// Selector de accesos a módulos, agrupado
function SelectorAccesos({ accesos, onToggle }: { accesos: ViewKey[]; onToggle: (k: ViewKey) => void }) {
  const grupos = Array.from(new Set(MODULOS_ASIGNABLES.map(m => m.grupo)));
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {grupos.map(g => (
        <div key={g}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", marginBottom: 6, textTransform: "uppercase" }}>{g}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {MODULOS_ASIGNABLES.filter(m => m.grupo === g).map(m => {
              const on = accesos.includes(m.key);
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => onToggle(m.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 12px", borderRadius: 999, cursor: "pointer",
                    border: on ? "1px solid #0284c7" : "1px solid #e2e8f0",
                    background: on ? "#e0f2fe" : "#f8fafc",
                    color: on ? "#0369a1" : "#64748b",
                    fontSize: 13, fontWeight: on ? 700 : 500,
                  }}
                >
                  <span>{m.icon}</span>
                  {m.label}
                  <span style={{ fontSize: 12 }}>{on ? "✓" : "+"}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UsuariosView() {
  const [usuarios, setUsuarios] = useState<PerfilUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // ── Crear ──
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("SECRETARIA");
  const [grupo, setGrupo] = useState<GrupoSocio>("RASTREADOR");
  const [accesos, setAccesos] = useState<ViewKey[]>(ACCESOS_SUGERIDOS.SECRETARIA);
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  // ── Editar ──
  const [editando, setEditando] = useState<PerfilUsuario | null>(null);

  const ROLE_ORDER: Role[] = ["ADMIN_PRINCIPAL", "ADMIN", "SUBADMIN", "SECRETARIA", "SOCIO", "MECANICO"];

  async function cargarUsuarios() {
    const { data, error } = await supabase.from("profiles").select("id, nombre, role, grupo, permisos");
    if (error) setListError(error.message);
    else {
      const sorted = (data ?? []).sort((a, b) =>
        ROLE_ORDER.indexOf(a.role as Role) - ROLE_ORDER.indexOf(b.role as Role)
      );
      setUsuarios(sorted as PerfilUsuario[]);
      setListError(null);
    }
    setLoading(false);
  }

  useEffect(() => { cargarUsuarios(); }, []);

  // Al cambiar el rol, precarga la plantilla de accesos sugerida
  function cambiarRole(r: Role) {
    setRole(r);
    setAccesos(ACCESOS_SUGERIDOS[r] ?? []);
  }

  function toggleAcceso(k: ViewKey) {
    setAccesos(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  }

  async function handleCrear() {
    setFormError(null);
    setInfo(null);
    if (!nombre.trim() || !email.trim() || !password) { setFormError("Completa nombre, correo y contraseña."); return; }
    if (password.length < 6) { setFormError("La contraseña debe tener al menos 6 caracteres."); return; }

    setCreando(true);
    const { error } = await invocar({
      action: "create",
      nombre: nombre.trim(), email: email.trim(), password, role,
      ...(role === "SOCIO" ? { grupo } : {}),
      permisos: role === "SOCIO" ? [] : accesos,
    });
    setCreando(false);

    if (error) { setFormError(error); return; }
    setInfo(`Usuario "${nombre.trim()}" creado con rol ${roleLabel(role)}.`);
    setNombre(""); setEmail(""); setPassword("");
    cambiarRole("SECRETARIA"); setGrupo("RASTREADOR");
    cargarUsuarios();
  }

  const isSocio = role === "SOCIO";

  return (
    <div>
      <h2 style={{ fontSize: 22, margin: 0 }}>Usuarios & Roles</h2>
      <p style={{ marginTop: 6, color: "#64748b" }}>Crea cuentas, asígnales rol y marca a qué módulos tiene acceso cada quien. Solo un ADMIN entra aquí.</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 20, alignItems: "flex-start" }}>
        {/* ── Crear ── */}
        <div style={{ ...card, flex: "1 1 340px", minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 20 }}>Crear nuevo usuario</h3>

          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <div>
              <div style={labelStyle}>Nombre completo</div>
              <input style={inputStyle} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. María Pérez" />
            </div>
            <div>
              <div style={labelStyle}>Correo electrónico</div>
              <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@empresa.com" />
            </div>
            <div>
              <div style={labelStyle}>Contraseña temporal</div>
              <input type="password" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <div style={labelStyle}>Rol</div>
              <select style={inputStyle} value={role} onChange={e => cambiarRole(e.target.value as Role)}>
                {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {isSocio ? (
              <div>
                <div style={labelStyle}>Grupo / portafolio</div>
                <select style={inputStyle} value={grupo} onChange={e => setGrupo(e.target.value as GrupoSocio)}>
                  <option value="RASTREADOR">Rastreador</option>
                  <option value="COSTA">Costa</option>
                  <option value="PRADERA">Pradera</option>
                  <option value="USADAS">Usadas Club</option>
                </select>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>El socio solo verá el dashboard de este grupo.</div>
              </div>
            ) : (
              <div>
                <div style={labelStyle}>Accesos a módulos</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
                  Precargados según el rol. Ajusta lo que este usuario podrá ver. (El panel general siempre está disponible.)
                </div>
                <SelectorAccesos accesos={accesos} onToggle={toggleAcceso} />
              </div>
            )}

            {formError && <div style={{ color: "#991b1b", fontWeight: 600 }}>{formError}</div>}
            {info && <div style={{ color: "#166534", fontWeight: 600 }}>{info}</div>}

            <button onClick={handleCrear} disabled={creando} style={{ ...primaryBtn, opacity: creando ? 0.7 : 1 }}>
              {creando ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </div>

        {/* ── Equipo ── */}
        <div style={{ ...card, flex: "1 1 340px", minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 20 }}>Equipo actual</h3>
          {listError && <div style={{ marginTop: 12, color: "#991b1b" }}>Error: {listError}</div>}

          {loading ? (
            <div style={{ marginTop: 16, color: "#64748b" }}>Cargando usuarios...</div>
          ) : (
            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {usuarios.length === 0 && <div style={{ color: "#64748b" }}>No hay usuarios todavía.</div>}
              {usuarios.map(u => {
                const nAccesos = Array.isArray(u.permisos) ? u.permisos.length : null;
                const badge = roleBadge(u.role);
                return (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>{u.nombre}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        {u.role === "SOCIO" ? u.grupo : nAccesos === null ? "Accesos por defecto" : `${nAccesos} módulos`}
                      </div>
                    </div>
                    <span style={{ padding: "4px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color, whiteSpace: "nowrap" }}>{roleLabel(u.role)}</span>
                    <button onClick={() => setEditando(u)} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#334155", whiteSpace: "nowrap" }}>✏️</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editando && (
        <ModalEditar
          usuario={editando}
          onClose={() => setEditando(null)}
          onGuardado={() => { setEditando(null); cargarUsuarios(); }}
        />
      )}
    </div>
  );
}

// ── Modal: editar usuario + resetear contraseña ──────────────────────────────
function ModalEditar({ usuario, onClose, onGuardado }: { usuario: PerfilUsuario; onClose: () => void; onGuardado: () => void }) {
  const [nombre, setNombre] = useState(usuario.nombre);
  const [role, setRole] = useState<Role>(usuario.role);
  const [grupo, setGrupo] = useState<GrupoSocio>((usuario.grupo as GrupoSocio) ?? "RASTREADOR");
  const [accesos, setAccesos] = useState<ViewKey[]>(
    Array.isArray(usuario.permisos) ? (usuario.permisos as ViewKey[]) : (ACCESOS_SUGERIDOS[usuario.role] ?? [])
  );
  const [nuevaPass, setNuevaPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [reseteando, setReseteando] = useState(false);

  const isSocio = role === "SOCIO";

  function cambiarRole(r: Role) {
    setRole(r);
    if (r === "SOCIO") return;
    // Si no tenía accesos a medida, sugiere la plantilla del nuevo rol
    if (!Array.isArray(usuario.permisos)) setAccesos(ACCESOS_SUGERIDOS[r] ?? []);
  }

  function toggleAcceso(k: ViewKey) {
    setAccesos(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  }

  async function guardar() {
    setError(null); setOk(null);
    if (!nombre.trim()) { setError("El nombre no puede quedar vacío."); return; }
    setGuardando(true);
    const { error } = await invocar({
      action: "update",
      id: usuario.id, nombre: nombre.trim(), role,
      ...(isSocio ? { grupo } : {}),
      permisos: isSocio ? [] : accesos,
    });
    setGuardando(false);
    if (error) { setError(error); return; }
    onGuardado();
  }

  async function resetear() {
    setError(null); setOk(null);
    if (nuevaPass.length < 6) { setError("La nueva contraseña debe tener al menos 6 caracteres."); return; }
    setReseteando(true);
    const { error } = await invocar({ action: "reset_password", id: usuario.id, password: nuevaPass });
    setReseteando(false);
    if (error) { setError(error); return; }
    setNuevaPass("");
    setOk("Contraseña actualizada. Compártela con el usuario.");
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 80 }} />
      <div style={{
        position: "fixed", zIndex: 81, top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "min(560px, calc(100vw - 24px))", maxHeight: "calc(100dvh - 80px)", overflowY: "auto",
        background: "white", borderRadius: 18, padding: 20, boxShadow: "0 30px 80px rgba(15,23,42,0.3)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 19 }}>Editar usuario</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>×</button>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={labelStyle}>Nombre completo</div>
            <input style={inputStyle} value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
          <div>
            <div style={labelStyle}>Rol</div>
            <select style={inputStyle} value={role} onChange={e => cambiarRole(e.target.value as Role)}>
              {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {isSocio ? (
            <div>
              <div style={labelStyle}>Grupo / portafolio</div>
              <select style={inputStyle} value={grupo} onChange={e => setGrupo(e.target.value as GrupoSocio)}>
                <option value="RASTREADOR">Rastreador</option>
                <option value="COSTA">Costa</option>
                <option value="PRADERA">Pradera</option>
                <option value="USADAS">Usadas Club</option>
              </select>
            </div>
          ) : (
            <div>
              <div style={labelStyle}>Accesos a módulos</div>
              <SelectorAccesos accesos={accesos} onToggle={toggleAcceso} />
            </div>
          )}

          <button onClick={guardar} disabled={guardando} style={{ ...primaryBtn, opacity: guardando ? 0.7 : 1 }}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>

          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14, marginTop: 4 }}>
            <div style={labelStyle}>Resetear contraseña</div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Asigna una contraseña temporal nueva y compártela con el usuario.</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input type="text" style={{ ...inputStyle, flex: "1 1 180px" }} value={nuevaPass} onChange={e => setNuevaPass(e.target.value)} placeholder="Nueva contraseña (mín. 6)" />
              <button onClick={resetear} disabled={reseteando} style={{ padding: "10px 16px", borderRadius: 14, border: "none", background: "#0f172a", color: "white", fontWeight: 700, cursor: "pointer", opacity: reseteando ? 0.7 : 1 }}>
                {reseteando ? "..." : "Resetear"}
              </button>
            </div>
          </div>

          {error && <div style={{ color: "#991b1b", fontWeight: 600 }}>{error}</div>}
          {ok && <div style={{ color: "#166534", fontWeight: 600 }}>{ok}</div>}
        </div>
      </div>
    </>
  );
}
