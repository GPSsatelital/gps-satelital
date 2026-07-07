import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import type { Role } from "../contexts/AuthContext";
import type { ViewKey } from "../App";
import { MODULOS_ASIGNABLES, ACCESOS_SUGERIDOS } from "../lib/modulos";
import { useMensajesWhatsapp, MENSAJES_META, type ClaveMensaje } from "../hooks/useMensajesWhatsapp";

// ── Estilos compartidos ────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "white", borderRadius: 16, padding: 20,
  boxShadow: "0 2px 12px rgba(15,23,42,0.06)", marginBottom: 16,
};
const sectionTitle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#94a3b8",
  letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14,
};
const rowStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "13px 0", borderBottom: "1px solid #f1f5f9",
};
const labelCol: React.CSSProperties = { fontSize: 14, color: "#334155", fontWeight: 500 };
const valueCol: React.CSSProperties = { fontSize: 14, color: "#64748b", fontWeight: 400, textAlign: "right" };
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 12,
  border: "1px solid #cbd5e1", outline: "none", fontSize: 14, boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = { marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#334155" };
const primaryBtn: React.CSSProperties = {
  background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)",
  color: "white", border: "none", borderRadius: 12, padding: "10px 20px",
  fontWeight: 700, cursor: "pointer", fontSize: 14,
};

// ── Tipos usuarios ─────────────────────────────────────────────────────────────
type GrupoSocio = "COSTA" | "PRADERA" | "RASTREADOR" | "USADAS";
type PerfilUsuario = { id: string; nombre: string; role: Role; grupo: GrupoSocio | null; permisos: string[] | null };

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "SECRETARIA",     label: "Secretaria" },
  { value: "MECANICO",       label: "Mecánico / Encargado de Taller" },
  { value: "SUBADMIN",       label: "Subadministrador" },
  { value: "ADMIN",          label: "Administrador" },
  { value: "ADMIN_PRINCIPAL",label: "Administrador Principal" },
  { value: "SOCIO",          label: "Socio (solo lectura)" },
];

function roleLabel(role: Role) {
  return ROLE_OPTIONS.find(r => r.value === role)?.label ?? role;
}

function roleBadge(role: Role) {
  const map: Record<Role, { bg: string; color: string }> = {
    ADMIN:           { bg: "#dbeafe", color: "#1d4ed8" },
    ADMIN_PRINCIPAL: { bg: "#ede9fe", color: "#6d28d9" },
    SECRETARIA:      { bg: "#fef3c7", color: "#92400e" },
    MECANICO:        { bg: "#dcfce7", color: "#166534" },
    SUBADMIN:        { bg: "#e0f2fe", color: "#0369a1" },
    SOCIO:           { bg: "#f1f5f9", color: "#334155" },
  };
  return map[role] ?? { bg: "#e2e8f0", color: "#334155" };
}

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

function SelectorAccesos({ accesos, onToggle }: { accesos: ViewKey[]; onToggle: (k: ViewKey) => void }) {
  const grupos = Array.from(new Set(MODULOS_ASIGNABLES.map(m => m.grupo)));
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {grupos.map(g => (
        <div key={g}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", marginBottom: 6, textTransform: "uppercase" }}>{g}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {MODULOS_ASIGNABLES.filter(m => m.grupo === g).map(m => {
              const on = accesos.includes(m.key);
              return (
                <button key={m.key} type="button" onClick={() => onToggle(m.key)} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 10px", borderRadius: 999, cursor: "pointer",
                  border: on ? "1px solid #0284c7" : "1px solid #e2e8f0",
                  background: on ? "#e0f2fe" : "#f8fafc",
                  color: on ? "#0369a1" : "#64748b",
                  fontSize: 12, fontWeight: on ? 700 : 500,
                }}>
                  <span>{m.icon}</span>{m.label}
                  <span style={{ fontSize: 11 }}>{on ? "✓" : "+"}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

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
    if (r !== "SOCIO" && !Array.isArray(usuario.permisos)) setAccesos(ACCESOS_SUGERIDOS[r] ?? []);
  }
  function toggleAcceso(k: ViewKey) {
    setAccesos(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  }
  async function guardar() {
    setError(null); setOk(null);
    if (!nombre.trim()) { setError("El nombre no puede quedar vacío."); return; }
    setGuardando(true);
    const { error } = await invocar({ action: "update", id: usuario.id, nombre: nombre.trim(), role, ...(isSocio ? { grupo } : {}), permisos: isSocio ? [] : accesos });
    setGuardando(false);
    if (error) { setError(error); return; }
    onGuardado();
  }
  async function resetear() {
    setError(null); setOk(null);
    if (nuevaPass.length < 6) { setError("Mínimo 6 caracteres."); return; }
    setReseteando(true);
    const { error } = await invocar({ action: "reset_password", id: usuario.id, password: nuevaPass });
    setReseteando(false);
    if (error) { setError(error); return; }
    setNuevaPass(""); setOk("Contraseña actualizada.");
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 80 }} />
      <div style={{ position: "fixed", zIndex: 81, top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(560px, calc(100vw - 24px))", maxHeight: "calc(100dvh - 80px)", overflowY: "auto", background: "white", borderRadius: 18, padding: 20, boxShadow: "0 30px 80px rgba(15,23,42,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 19 }}>Editar usuario</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>×</button>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <div><div style={labelStyle}>Nombre completo</div><input style={inputStyle} value={nombre} onChange={e => setNombre(e.target.value)} /></div>
          <div><div style={labelStyle}>Rol</div>
            <select style={inputStyle} value={role} onChange={e => cambiarRole(e.target.value as Role)}>
              {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          {isSocio ? (
            <div><div style={labelStyle}>Grupo / portafolio</div>
              <select style={inputStyle} value={grupo} onChange={e => setGrupo(e.target.value as GrupoSocio)}>
                <option value="RASTREADOR">Rastreador</option>
                <option value="COSTA">Costa</option>
                <option value="PRADERA">Pradera</option>
                <option value="USADAS">Usadas Club</option>
              </select>
            </div>
          ) : (
            <div><div style={labelStyle}>Accesos a módulos</div><SelectorAccesos accesos={accesos} onToggle={toggleAcceso} /></div>
          )}
          <button onClick={guardar} disabled={guardando} style={{ ...primaryBtn, opacity: guardando ? 0.7 : 1 }}>{guardando ? "Guardando..." : "Guardar cambios"}</button>
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14, marginTop: 4 }}>
            <div style={labelStyle}>Resetear contraseña</div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Asigna una contraseña temporal y compártela con el usuario.</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input type="text" style={{ ...inputStyle, flex: "1 1 180px" }} value={nuevaPass} onChange={e => setNuevaPass(e.target.value)} placeholder="Nueva contraseña (mín. 6)" />
              <button onClick={resetear} disabled={reseteando} style={{ padding: "10px 16px", borderRadius: 14, border: "none", background: "#0f172a", color: "white", fontWeight: 700, cursor: "pointer", opacity: reseteando ? 0.7 : 1 }}>{reseteando ? "..." : "Resetear"}</button>
            </div>
          </div>
          {error && <div style={{ color: "#991b1b", fontWeight: 600 }}>{error}</div>}
          {ok && <div style={{ color: "#166534", fontWeight: 600 }}>{ok}</div>}
        </div>
      </div>
    </>
  );
}

// ── Badges ─────────────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    green:  { bg: "#dcfce7", text: "#166534" },
    blue:   { bg: "#dbeafe", text: "#1d4ed8" },
    orange: { bg: "#fef3c7", text: "#92400e" },
    gray:   { bg: "#f1f5f9", text: "#64748b" },
  };
  const c = colors[color] ?? colors.gray;
  return <span style={{ padding: "3px 10px", borderRadius: 999, background: c.bg, color: c.text, fontSize: 11, fontWeight: 700 }}>{label}</span>;
}

function RoadmapItem({ icon, label, desc, status }: { icon: string; label: string; desc: string; status: "activo" | "proximo" | "planificado" }) {
  const statusMap = {
    activo:      { label: "Activo",        color: "green" },
    proximo:     { label: "Próximamente",  color: "orange" },
    planificado: { label: "Planificado",   color: "gray" },
  };
  const s = statusMap[status];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid #f1f5f9", opacity: status === "planificado" ? 0.6 : 1 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{label}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{desc}</div>
      </div>
      <Badge label={s.label} color={s.color} />
    </div>
  );
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN_PRINCIPAL: "Administrador principal",
  ADMIN: "Administrador",
  SECRETARIA: "Secretaria",
  MECANICO: "Mecánico",
};

// ── Vista principal ────────────────────────────────────────────────────────────
export default function ConfiguracionView() {
  const { profile } = useAuth();
  const esAdmin = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";

  // Mi cuenta
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState(profile?.nombre ?? "");
  const [guardandoNombre, setGuardandoNombre] = useState(false);
  const [msgNombre, setMsgNombre] = useState<string | null>(null);
  const [cambiarPass, setCambiarPass] = useState(false);
  const [passNueva, setPassNueva] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [msgPass, setMsgPass] = useState<{ ok: boolean; text: string } | null>(null);
  const [expandSugerencias, setExpandSugerencias] = useState(false);

  // Usuarios
  const [usuarios, setUsuarios] = useState<PerfilUsuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [editando, setEditando] = useState<PerfilUsuario | null>(null);
  const [mostrarFormCrear, setMostrarFormCrear] = useState(false);

  // Formulario crear
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("SECRETARIA");
  const [grupo, setGrupo] = useState<GrupoSocio>("RASTREADOR");
  const [accesos, setAccesos] = useState<ViewKey[]>(ACCESOS_SUGERIDOS.SECRETARIA);
  const [formError, setFormError] = useState<string | null>(null);
  const [formOk, setFormOk] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  async function cargarUsuarios() {
    setLoadingUsuarios(true);
    const { data, error } = await supabase.from("profiles").select("id, nombre, role, grupo, permisos").order("nombre");
    if (error) setListError(error.message);
    else { setUsuarios((data ?? []) as PerfilUsuario[]); setListError(null); }
    setLoadingUsuarios(false);
  }

  useEffect(() => { if (esAdmin) cargarUsuarios(); }, [esAdmin]);

  function cambiarRole(r: Role) { setRole(r); setAccesos(ACCESOS_SUGERIDOS[r] ?? []); }
  function toggleAcceso(k: ViewKey) { setAccesos(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]); }

  async function handleCrear() {
    setFormError(null); setFormOk(null);
    if (!nombre.trim() || !email.trim() || !password) { setFormError("Completa nombre, correo y contraseña."); return; }
    if (password.length < 6) { setFormError("La contraseña debe tener al menos 6 caracteres."); return; }
    setCreando(true);
    const { error } = await invocar({ action: "create", nombre: nombre.trim(), email: email.trim(), password, role, ...(role === "SOCIO" ? { grupo } : {}), permisos: role === "SOCIO" ? [] : accesos });
    setCreando(false);
    if (error) { setFormError(error); return; }
    setFormOk(`Usuario "${nombre.trim()}" creado.`);
    setNombre(""); setEmail(""); setPassword(""); cambiarRole("SECRETARIA"); setGrupo("RASTREADOR");
    setMostrarFormCrear(false);
    cargarUsuarios();
  }

  async function handleCambiarPassword() {
    if (!passNueva || passNueva.length < 8) { setMsgPass({ ok: false, text: "Mínimo 8 caracteres." }); return; }
    if (passNueva !== passConfirm) { setMsgPass({ ok: false, text: "Las contraseñas no coinciden." }); return; }
    setGuardandoPass(true);
    const { error } = await supabase.auth.updateUser({ password: passNueva });
    setGuardandoPass(false);
    if (error) { setMsgPass({ ok: false, text: "Error: " + error.message }); return; }
    setMsgPass({ ok: true, text: "Contraseña actualizada correctamente." });
    setPassNueva(""); setPassConfirm("");
    setTimeout(() => { setCambiarPass(false); setMsgPass(null); }, 3000);
  }

  async function handleGuardarNombre() {
    if (!nuevoNombre.trim() || !profile) return;
    setGuardandoNombre(true);
    const { error } = await supabase.from("profiles").update({ nombre: nuevoNombre.trim().toUpperCase() }).eq("id", profile.id);
    setGuardandoNombre(false);
    if (error) { setMsgNombre("Error al guardar."); return; }
    setMsgNombre("Nombre actualizado. Recarga para ver el cambio.");
    setEditandoNombre(false);
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "16px 16px 48px" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Configuración</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>Ajustes del sistema y tu cuenta</div>
      </div>

      {/* ── Mi cuenta ── */}
      <div style={card}>
        <div style={sectionTitle}>👤 Mi cuenta</div>
        <div style={{ ...rowStyle, borderBottom: "none" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{profile?.nombre ?? "—"}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{ROLE_LABEL[profile?.role ?? ""] ?? profile?.role}</div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 999, background: "linear-gradient(135deg,#0284c7,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "white", fontWeight: 800 }}>
            {(profile?.nombre ?? "U")[0].toUpperCase()}
          </div>
        </div>

        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14, marginTop: 4 }}>
          {!editandoNombre ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={labelCol}>Nombre de usuario</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{profile?.nombre}</div>
              </div>
              <button onClick={() => { setEditandoNombre(true); setNuevoNombre(profile?.nombre ?? ""); }} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155" }}>✏️ Editar</button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <input style={inputStyle} value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value.toUpperCase())} placeholder="Tu nombre" />
              {msgNombre && <div style={{ fontSize: 13, color: "#16a34a" }}>{msgNombre}</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleGuardarNombre} disabled={guardandoNombre} style={{ ...primaryBtn, flex: 1 }}>{guardandoNombre ? "Guardando..." : "Guardar nombre"}</button>
                <button onClick={() => { setEditandoNombre(false); setMsgNombre(null); }} style={{ background: "#f1f5f9", border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Cancelar</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14, marginTop: 4 }}>
          {!cambiarPass ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={labelCol}>Contraseña</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>••••••••</div>
              </div>
              <button onClick={() => { setCambiarPass(true); setMsgPass(null); }} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155" }}>🔑 Cambiar</button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Nueva contraseña</div>
              <input type="password" style={inputStyle} value={passNueva} onChange={e => setPassNueva(e.target.value)} placeholder="Mínimo 8 caracteres" />
              <input type="password" style={inputStyle} value={passConfirm} onChange={e => setPassConfirm(e.target.value)} placeholder="Confirmar nueva contraseña" />
              {msgPass && <div style={{ fontSize: 13, fontWeight: 600, color: msgPass.ok ? "#16a34a" : "#dc2626", padding: "8px 12px", borderRadius: 10, background: msgPass.ok ? "#f0fdf4" : "#fef2f2" }}>{msgPass.text}</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleCambiarPassword} disabled={guardandoPass} style={{ ...primaryBtn, flex: 1 }}>{guardandoPass ? "Guardando..." : "Actualizar contraseña"}</button>
                <button onClick={() => { setCambiarPass(false); setMsgPass(null); setPassNueva(""); setPassConfirm(""); }} style={{ background: "#f1f5f9", border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Equipo & Usuarios (solo admins) ── */}
      {esAdmin && (
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={sectionTitle}>👥 Equipo & Usuarios</div>
            <button
              onClick={() => { setMostrarFormCrear(p => !p); setFormError(null); setFormOk(null); }}
              style={{ background: mostrarFormCrear ? "#f1f5f9" : "linear-gradient(90deg,#0284c7,#10b981)", color: mostrarFormCrear ? "#334155" : "white", border: "none", borderRadius: 10, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
            >
              {mostrarFormCrear ? "✕ Cancelar" : "➕ Crear usuario"}
            </button>
          </div>

          {/* Formulario crear (colapsable) */}
          {mostrarFormCrear && (
            <div style={{ background: "#f8fafc", borderRadius: 14, padding: 16, marginBottom: 16, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>Nuevo usuario</div>
              <div style={{ display: "grid", gap: 12 }}>
                <div><div style={labelStyle}>Nombre completo</div><input style={inputStyle} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. María Pérez" /></div>
                <div><div style={labelStyle}>Correo electrónico</div><input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@empresa.com" /></div>
                <div><div style={labelStyle}>Contraseña temporal</div><input type="password" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" /></div>
                <div><div style={labelStyle}>Rol</div>
                  <select style={inputStyle} value={role} onChange={e => cambiarRole(e.target.value as Role)}>
                    {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                {role === "SOCIO" ? (
                  <div><div style={labelStyle}>Grupo / portafolio</div>
                    <select style={inputStyle} value={grupo} onChange={e => setGrupo(e.target.value as GrupoSocio)}>
                      <option value="RASTREADOR">Rastreador</option>
                      <option value="COSTA">Costa</option>
                      <option value="PRADERA">Pradera</option>
                      <option value="USADAS">Usadas Club</option>
                    </select>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>El socio solo verá el dashboard de su grupo.</div>
                  </div>
                ) : (
                  <div>
                    <div style={labelStyle}>Accesos a módulos</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>Precargados según el rol. Ajusta lo que este usuario podrá ver.</div>
                    <SelectorAccesos accesos={accesos} onToggle={toggleAcceso} />
                  </div>
                )}
                {formError && <div style={{ color: "#991b1b", fontWeight: 600 }}>{formError}</div>}
                {formOk   && <div style={{ color: "#166534", fontWeight: 600 }}>{formOk}</div>}
                <button onClick={handleCrear} disabled={creando} style={{ ...primaryBtn, opacity: creando ? 0.7 : 1 }}>{creando ? "Creando..." : "Crear usuario"}</button>
              </div>
            </div>
          )}

          {/* Lista del equipo */}
          {listError && <div style={{ color: "#991b1b", marginBottom: 10 }}>Error: {listError}</div>}
          {loadingUsuarios ? (
            <div style={{ color: "#64748b", padding: "12px 0" }}>Cargando equipo...</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {usuarios.length === 0 && <div style={{ color: "#64748b" }}>No hay usuarios todavía.</div>}
              {usuarios.map(u => {
                const nAccesos = Array.isArray(u.permisos) ? u.permisos.length : null;
                return (
                  <div key={u.id} style={{ padding: 14, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 14 }}>{u.nombre}</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        {u.role === "SOCIO" && u.grupo && <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "#e0f2fe", color: "#0369a1" }}>{u.grupo}</span>}
                        <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: roleBadge(u.role).bg, color: roleBadge(u.role).color }}>{roleLabel(u.role)}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, flexWrap: "wrap", gap: 8 }}>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>
                        {u.role === "SOCIO" ? "Dashboard de su grupo" : nAccesos === null ? "Accesos por defecto del rol" : `${nAccesos} módulo${nAccesos !== 1 ? "s" : ""} asignado${nAccesos !== 1 ? "s" : ""}`}
                      </div>
                      <button onClick={() => setEditando(u)} style={{ padding: "6px 12px", borderRadius: 10, border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#334155" }}>✏️ Editar</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Empresa ── */}
      <div style={card}>
        <div style={sectionTitle}>🏢 Empresa</div>
        {[
          { label: "Razón social",  value: "GPS Satelital Cartagena" },
          { label: "Ciudad",        value: "Cartagena de Indias" },
          { label: "Plataforma",    value: "MotoGestión v1.0" },
          { label: "Base de datos", value: "Supabase · jvfkprkjysjffhzjitgl" },
          { label: "Despliegue",    value: "Vercel · rama main" },
        ].map(r => (
          <div key={r.label} style={rowStyle}><span style={labelCol}>{r.label}</span><span style={valueCol}>{r.value}</span></div>
        ))}
      </div>

      {/* ── Tarifas vigentes ── */}
      <div style={card}>
        <div style={sectionTitle}>💰 Tarifas y parámetros del negocio</div>
        <div style={{ padding: "10px 14px", borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a", marginBottom: 14, fontSize: 12, color: "#92400e" }}>
          Estos valores se aplican automáticamente en cobros y liquidaciones. Contacta al desarrollador para modificarlos.
        </div>
        {[
          { label: "Tarifa diaria (lunes a sábado)", value: "$ 27.000" },
          { label: "Tarifa domingo",                  value: "Mitad de la tarifa L-S (~$ 13.500)" },
          { label: "Período — Diario",                value: "1 día · contrato indefinido" },
          { label: "Período — Semanal",               value: "7 días" },
          { label: "Período — Quincenal",             value: "15 días" },
          { label: "Período — Mensual",               value: "30 días" },
        ].map(r => (
          <div key={r.label} style={rowStyle}><span style={labelCol}>{r.label}</span><span style={{ ...valueCol, fontWeight: 700, color: "#0f172a" }}>{r.value}</span></div>
        ))}
      </div>

      {/* ── Estado del sistema ── */}
      <div style={card}>
        <div style={sectionTitle}>📡 Estado del sistema</div>
        {[
          { label: "Conexión en tiempo real", value: "Activa",                              ok: true },
          { label: "Sincronización de datos", value: "Automática",                          ok: true },
          { label: "Modo offline",            value: "No disponible",                       ok: false },
          { label: "PWA instalable",          value: "Sí — toca 'Instalar' en el banner",  ok: true },
          { label: "Autenticación",           value: "Supabase Auth JWT",                   ok: true },
        ].map(r => (
          <div key={r.label} style={rowStyle}>
            <span style={labelCol}>{r.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: r.ok ? "#16a34a" : "#dc2626" }}>{r.ok ? "✅" : "❌"} {r.value}</span>
          </div>
        ))}
      </div>

      {/* ── Hoja de ruta ── */}
      <div style={card}>
        <button onClick={() => setExpandSugerencias(p => !p)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <div style={sectionTitle}>🚀 Hoja de ruta — módulos y mejoras</div>
          <span style={{ fontSize: 18, color: "#94a3b8", marginBottom: 14 }}>{expandSugerencias ? "▾" : "▸"}</span>
        </button>
        {expandSugerencias ? (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", marginBottom: 8, marginTop: 4 }}>YA ACTIVO</div>
            {[
              { icon: "👥", label: "Gestión de clientes",  desc: "Registro, aprobación, visita domiciliaria, documentos",   status: "activo" as const },
              { icon: "📄", label: "Contratos D/S/Q/M",    desc: "Diario, semanal, quincenal y mensual con equivalencias",  status: "activo" as const },
              { icon: "💳", label: "Cartera y cobros",     desc: "Registro de pagos, deudas, convenios, gestiones",         status: "activo" as const },
              { icon: "🏍️", label: "Flota de motos",       desc: "Inventario, estados, retenciones, ubicaciones",           status: "activo" as const },
              { icon: "🔧", label: "Taller",               desc: "Órdenes de mantenimiento y seguimiento técnico",          status: "activo" as const },
              { icon: "📊", label: "Liquidaciones",        desc: "Cierre de contratos con prorrateo",                       status: "activo" as const },
            ].map(i => <RoadmapItem key={i.label} {...i} />)}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.08em", marginBottom: 8, marginTop: 18 }}>PRÓXIMAMENTE</div>
            {[
              { icon: "📅", label: "Calendario de cobros",   desc: "Vista semanal: quién paga cada día",                    status: "proximo" as const },
              { icon: "📊", label: "Reportes exportables",   desc: "PDF/Excel de cobros, cartera, contratos por período",   status: "proximo" as const },
              { icon: "📝", label: "Contrato en PDF",        desc: "Generación automática del documento de contrato",       status: "proximo" as const },
              { icon: "💰", label: "Caja diaria",            desc: "Resumen de entradas y salidas del día en tiempo real",  status: "proximo" as const },
              { icon: "💬", label: "Mensajes WhatsApp",      desc: "Recordatorios de pago automáticos al cliente",          status: "proximo" as const },
            ].map(i => <RoadmapItem key={i.label} {...i} />)}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", marginBottom: 8, marginTop: 18 }}>PLANIFICADO</div>
            {[
              { icon: "📍", label: "Rutas de cobro",        desc: "Agrupación geográfica de clientes por sector",          status: "planificado" as const },
              { icon: "📈", label: "Estadísticas avanzadas",desc: "Gráficas de recaudo, mora, rendimiento por grupo",      status: "planificado" as const },
              { icon: "🔌", label: "Integración GPS",       desc: "Rastreo en tiempo real de motos en campo",              status: "planificado" as const },
            ].map(i => <RoadmapItem key={i.label} {...i} />)}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge label="6 módulos activos" color="green" />
            <Badge label="5 próximamente" color="orange" />
            <Badge label="3 planificados" color="gray" />
          </div>
        )}
      </div>

      {/* ── Mensajes de WhatsApp (solo admins) ── */}
      {esAdmin && <SeccionMensajesWhatsapp />}

      {/* ── Acerca de ── */}
      <div style={{ ...card, marginBottom: 0 }}>
        <div style={sectionTitle}>ℹ️ Acerca del sistema</div>
        {[
          { label: "Aplicación", value: "MotoGestión" },
          { label: "Versión",    value: "1.0.0" },
          { label: "Stack",      value: "React 19 · TypeScript · Vite · Supabase" },
          { label: "Soporte",    value: "gpssatelitalcartagena@gmail.com" },
        ].map(r => (
          <div key={r.label} style={rowStyle}><span style={labelCol}>{r.label}</span><span style={valueCol}>{r.value}</span></div>
        ))}
        <div style={{ marginTop: 14, textAlign: "center", fontSize: 12, color: "#cbd5e1" }}>© 2026 GPS Satelital Cartagena · Todos los derechos reservados</div>
      </div>

      {editando && (
        <ModalEditar usuario={editando} onClose={() => setEditando(null)} onGuardado={() => { setEditando(null); cargarUsuarios(); }} />
      )}
    </div>
  );
}

// ── Sección: mensajes de WhatsApp editables ────────────────────────────────────
function SeccionMensajesWhatsapp() {
  const { plantilla, guardar } = useMensajesWhatsapp();
  const [borradores, setBorradores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState<ClaveMensaje | null>(null);
  const [guardado, setGuardado] = useState<ClaveMensaje | null>(null);

  // El valor mostrado: el borrador si se editó, si no la plantilla actual.
  function valor(clave: ClaveMensaje) {
    return borradores[clave] ?? plantilla(clave);
  }

  async function handleGuardar(clave: ClaveMensaje) {
    setGuardando(clave); setGuardado(null);
    const { error } = await guardar(clave, valor(clave));
    setGuardando(null);
    if (!error) { setGuardado(clave); setTimeout(() => setGuardado(null), 2500); }
    else alert("No se pudo guardar: " + error);
  }

  return (
    <div style={card}>
      <div style={sectionTitle}>💬 Mensajes de WhatsApp</div>
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
        Personaliza los textos que se envían por WhatsApp. Usa los comodines entre llaves — se reemplazan solos con los datos reales de cada cliente al enviar.
      </div>
      <div style={{ display: "grid", gap: 18 }}>
        {MENSAJES_META.map(m => (
          <div key={m.clave} style={{ background: "#f8fafc", borderRadius: 14, padding: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{m.label}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, marginBottom: 8 }}>{m.descripcion}</div>
            <textarea
              value={valor(m.clave)}
              onChange={e => setBorradores(prev => ({ ...prev, [m.clave]: e.target.value }))}
              rows={m.clave === "recibo" ? 3 : 4}
              style={{ ...inputStyle, width: "100%", resize: "vertical", fontFamily: "inherit", lineHeight: 1.5, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>Comodines:</span>
              {m.comodines.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBorradores(prev => ({ ...prev, [m.clave]: valor(m.clave) + " " + c }))}
                  style={{ background: "#e0f2fe", color: "#0369a1", border: "none", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}
                  title="Insertar comodín"
                >
                  {c}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
              <button
                onClick={() => handleGuardar(m.clave)}
                disabled={guardando === m.clave}
                style={{ background: "linear-gradient(90deg,#0284c7,#10b981)", color: "white", border: "none", borderRadius: 10, padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 700, opacity: guardando === m.clave ? 0.6 : 1 }}
              >
                {guardando === m.clave ? "Guardando..." : "Guardar"}
              </button>
              {guardado === m.clave && <span style={{ fontSize: 13, color: "#166534", fontWeight: 700 }}>✅ Guardado</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
