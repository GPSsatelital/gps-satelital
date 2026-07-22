import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Role } from "../contexts/AuthContext";
import type { ViewKey } from "../App";
import { MODULOS_ASIGNABLES, ACCESOS_SUGERIDOS } from "../lib/modulos";
import { ACCIONES, calcularPuede, type AccionesUsuario, type EstadoAccion } from "../lib/acciones";

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line2)", outline: "none", fontSize: 14, boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { marginBottom: 6, fontSize: 14, fontWeight: 600, color: "var(--muted2)" };
const card: React.CSSProperties = { background: "var(--card)", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const primaryBtn: React.CSSProperties = { background: "linear-gradient(90deg, var(--accent) 0%, var(--ok2) 100%)", color: "var(--card)", border: "none", borderRadius: 14, padding: "10px 16px", fontWeight: 700, cursor: "pointer" };

type GrupoSocio = "COSTA" | "PRADERA" | "RASTREADOR" | "USADAS";
type PerfilUsuario = { id: string; nombre: string; role: Role; grupo: GrupoSocio | null; permisos: string[] | null; email: string | null };

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
    ADMIN: { bg: "var(--accent-soft3)", color: "var(--accent-ink)" },
    ADMIN_PRINCIPAL: { bg: "var(--indigo-soft)", color: "var(--violet)" },
    SECRETARIA: { bg: "var(--warn-soft)", color: "var(--warn-ink)" },
    MECANICO: { bg: "var(--ok-soft)", color: "var(--ok-ink)" },
    SUBADMIN: { bg: "var(--accent-soft)", color: "var(--accent-ink)" },
    SOCIO: { bg: "var(--soft)", color: "var(--muted2)" },
  };
  return map[role] ?? { bg: "var(--line)", color: "var(--muted2)" };
}

// Llama a la Edge Function manage-users con el token del admin actual
async function invocar(payload: Record<string, unknown>): Promise<{ error: string | null; data?: Record<string, unknown> }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  const { data, error } = await supabase.functions.invoke("manage-users", {
    body: payload,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (error) return { error: error.message || "Error de conexión" };
  if (data?.error) return { error: data.error };
  return { error: null, data };
}

// Selector de accesos a módulos, agrupado
function SelectorAccesos({ accesos, onToggle }: { accesos: ViewKey[]; onToggle: (k: ViewKey) => void }) {
  const grupos = Array.from(new Set(MODULOS_ASIGNABLES.map(m => m.grupo)));
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {grupos.map(g => (
        <div key={g}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--faint)", letterSpacing: "0.06em", marginBottom: 6, textTransform: "uppercase" }}>{g}</div>
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
                    border: on ? "1px solid var(--accent)" : "1px solid var(--line)",
                    background: on ? "var(--accent-soft)" : "var(--soft2)",
                    color: on ? "var(--accent-ink)" : "var(--muted)",
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
    const { error, data } = await invocar({ action: "list" });
    if (error) setListError(error);
    else {
      const lista = (data?.usuarios as PerfilUsuario[]) ?? [];
      const sorted = lista.sort((a, b) =>
        ROLE_ORDER.indexOf(a.role as Role) - ROLE_ORDER.indexOf(b.role as Role)
      );
      setUsuarios(sorted);
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
      <p style={{ marginTop: 6, color: "var(--muted)" }}>Crea cuentas, asígnales rol y marca a qué módulos tiene acceso cada quien. Solo un ADMIN entra aquí.</p>

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
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>El socio solo verá el dashboard de este grupo.</div>
              </div>
            ) : (
              <div>
                <div style={labelStyle}>Accesos a módulos</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                  Precargados según el rol. Ajusta lo que este usuario podrá ver. (El panel general siempre está disponible.)
                </div>
                <SelectorAccesos accesos={accesos} onToggle={toggleAcceso} />
              </div>
            )}

            {formError && <div style={{ color: "var(--bad-ink)", fontWeight: 600 }}>{formError}</div>}
            {info && <div style={{ color: "var(--ok-ink)", fontWeight: 600 }}>{info}</div>}

            <button onClick={handleCrear} disabled={creando} style={{ ...primaryBtn, opacity: creando ? 0.7 : 1 }}>
              {creando ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </div>

        {/* ── Equipo ── */}
        <div style={{ ...card, flex: "1 1 340px", minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 20 }}>Equipo actual</h3>
          {listError && <div style={{ marginTop: 12, color: "var(--bad-ink)" }}>Error: {listError}</div>}

          {loading ? (
            <div style={{ marginTop: 16, color: "var(--muted)" }}>Cargando usuarios...</div>
          ) : (
            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {usuarios.length === 0 && <div style={{ color: "var(--muted)" }}>No hay usuarios todavía.</div>}
              {usuarios.map(u => {
                const nAccesos = Array.isArray(u.permisos) ? u.permisos.length : null;
                const badge = roleBadge(u.role);
                return (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: "var(--soft2)", border: "1px solid var(--line)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>{u.nombre}</div>
                      <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>
                        {u.role === "SOCIO" ? u.grupo : nAccesos === null ? "Accesos por defecto" : `${nAccesos} módulos`}
                      </div>
                    </div>
                    <span style={{ padding: "4px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color, whiteSpace: "nowrap" }}>{roleLabel(u.role)}</span>
                    <button onClick={() => setEditando(u)} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--line2)", background: "var(--card)", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--muted2)", whiteSpace: "nowrap" }}>✏️</button>
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

// Árbol unificado de permisos: cada MÓDULO es una casilla (ver la pantalla) y debajo,
// anidadas, sus ACCIONES sensibles como casillas simples (puede / no puede). Las acciones
// arrancan según el rol; una excepción por persona se marca "editado". Módulos sin acciones
// van compactos abajo como chips. Responsive (mobile-first).
function SelectorPermisos({ role, accesos, onToggleModulo, overrides, onSetAccion, onReset }: {
  role: Role;
  accesos: ViewKey[];
  onToggleModulo: (k: ViewKey) => void;
  overrides: AccionesUsuario;
  onSetAccion: (key: string, activo: boolean) => void;
  onReset: () => void;
}) {
  const esAP = role === "ADMIN_PRINCIPAL";
  const nPersonalizados = Object.keys(overrides).length;
  const modConAcciones = MODULOS_ASIGNABLES.filter(m => ACCIONES.some(a => a.modulo === m.key));
  const modSinAcciones = MODULOS_ASIGNABLES.filter(m => !ACCIONES.some(a => a.modulo === m.key));
  const orphan = ACCIONES.filter(a => !MODULOS_ASIGNABLES.some(m => m.key === a.modulo));
  const chk: React.CSSProperties = { width: 18, height: 18, accentColor: "var(--accent)", cursor: "pointer", flexShrink: 0 };

  function filaAccion(a: typeof ACCIONES[number], moduloOn: boolean) {
    const activo = calcularPuede(role, overrides, a.key);
    const editado = overrides[a.key] !== undefined;
    const usable = !esAP && moduloOn;
    return (
      <label key={a.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", cursor: usable ? "pointer" : "default", opacity: moduloOn ? 1 : 0.4, minWidth: 0 }}>
        <input type="checkbox" checked={activo} disabled={!usable} onChange={() => onSetAccion(a.key, !activo)} style={chk} />
        <span style={{ fontSize: 13, color: "var(--muted2)", minWidth: 0 }}>
          {a.label}
          {a.dbEnforced && <span title="Reforzado en la base de datos" style={{ marginLeft: 5, fontSize: 10, color: "var(--accent-ink)" }}>🔒</span>}
          {editado && <span title="Distinto a lo normal de su rol" style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: "var(--warn-strong)", background: "var(--warn-soft)", borderRadius: 6, padding: "1px 5px" }}>editado</span>}
        </span>
      </label>
    );
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>
          {esAP ? "Puede todo (Administrador Principal)"
            : nPersonalizados > 0 ? `${nPersonalizados} permiso${nPersonalizados !== 1 ? "s" : ""} personalizado${nPersonalizados !== 1 ? "s" : ""}`
            : "Todo según su rol"}
        </div>
        {!esAP && nPersonalizados > 0 && (
          <button type="button" onClick={onReset} style={{ fontSize: 12, fontWeight: 700, border: "1px solid var(--line)", background: "var(--card)", borderRadius: 8, padding: "4px 10px", cursor: "pointer", color: "var(--muted2)" }}>
            ↺ Volver a lo normal del rol
          </button>
        )}
      </div>

      {modConAcciones.map(m => {
        const on = accesos.includes(m.key);
        return (
          <div key={m.key} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "8px 10px", background: on ? "var(--card)" : "var(--soft2)", boxSizing: "border-box" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={on} onChange={() => onToggleModulo(m.key)} style={chk} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{m.icon} {m.label}</span>
            </label>
            <div style={{ marginLeft: 12, marginTop: 4, borderLeft: "2px solid var(--soft)", paddingLeft: 12 }}>
              {ACCIONES.filter(a => a.modulo === m.key).map(a => filaAccion(a, on))}
            </div>
          </div>
        );
      })}

      {orphan.length > 0 && (
        <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "8px 10px", boxSizing: "border-box" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>⚙️ Configuración</div>
          <div style={{ marginLeft: 12, marginTop: 4, borderLeft: "2px solid var(--soft)", paddingLeft: 12 }}>
            {orphan.map(a => filaAccion(a, true))}
          </div>
        </div>
      )}

      {modSinAcciones.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", margin: "4px 0 6px" }}>Otros accesos (solo ver la pantalla)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {modSinAcciones.map(m => {
              const on = accesos.includes(m.key);
              return (
                <button key={m.key} type="button" onClick={() => onToggleModulo(m.key)} style={{
                  display: "flex", alignItems: "center", gap: 6, border: `1px solid ${on ? "var(--ok-line)" : "var(--line)"}`,
                  background: on ? "var(--ok-soft)" : "var(--soft2)", color: on ? "var(--ok-ink)" : "var(--faint)", borderRadius: 999,
                  padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}>
                  <span>{on ? "☑" : "☐"}</span>{m.icon} {m.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modal: editar usuario + resetear contraseña ──────────────────────────────
function ModalEditar({ usuario, onClose, onGuardado }: { usuario: PerfilUsuario; onClose: () => void; onGuardado: () => void }) {
  const [nombre, setNombre] = useState(usuario.nombre);
  const [email, setEmail] = useState(usuario.email ?? "");
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
  // Overrides de acciones por persona (mig 048/049). Se cargan directo de profiles
  // (policy de ADMIN_PRINCIPAL) y se guardan directo, aparte de la Edge Function.
  const [accionesOv, setAccionesOv] = useState<AccionesUsuario>({});
  useEffect(() => {
    let vivo = true;
    supabase.from("profiles").select("acciones").eq("id", usuario.id).single()
      .then(({ data }) => { if (vivo && data?.acciones) setAccionesOv(data.acciones as AccionesUsuario); });
    return () => { vivo = false; };
  }, [usuario.id]);
  function cambiarAccion(key: string, estado: EstadoAccion | null) {
    setAccionesOv(prev => {
      const n = { ...prev };
      if (estado === null) delete n[key]; else n[key] = estado;
      return n;
    });
  }
  // Casilla simple: si el nuevo valor coincide con el default del rol → sin override
  // (borra la clave, sigue al rol); si difiere → guarda la excepción permitir/bloquear.
  function setAccionActivo(key: string, activo: boolean) {
    const def = calcularPuede(role, {}, key);
    cambiarAccion(key, activo === def ? null : (activo ? "permitir" : "bloquear"));
  }

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
    if (!email.trim()) { setError("El correo no puede quedar vacío."); return; }
    setGuardando(true);
    const { error } = await invocar({
      action: "update",
      id: usuario.id, nombre: nombre.trim(), email: email.trim(), role,
      ...(isSocio ? { grupo } : {}),
      permisos: isSocio ? [] : accesos,
    });
    if (error) { setGuardando(false); setError(error); return; }
    // Guardar los overrides de acciones directo (SOCIO no usa acciones).
    if (!isSocio) {
      const { error: errAcc } = await supabase.from("profiles").update({ acciones: accionesOv }).eq("id", usuario.id);
      if (errAcc) { setGuardando(false); setError("Usuario guardado, pero falló guardar los permisos de acciones: " + errAcc.message); return; }
    }
    setGuardando(false);
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
        background: "var(--card)", borderRadius: 18, padding: 20, boxShadow: "0 30px 80px rgba(15,23,42,0.3)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 19 }}>Editar usuario</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--faint)" }}>×</button>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={labelStyle}>Nombre completo</div>
            <input style={inputStyle} value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
          <div>
            <div style={labelStyle}>Correo electrónico</div>
            <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@empresa.com" />
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
              <div style={labelStyle}>Permisos</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
                Marca qué pantallas ve y, debajo de cada una, qué acciones puede hacer. Las acciones arrancan según su rol; cámbialas solo para esta persona. Las de 🔒 se refuerzan en la base de datos.
              </div>
              <SelectorPermisos
                role={role}
                accesos={accesos}
                onToggleModulo={toggleAcceso}
                overrides={accionesOv}
                onSetAccion={setAccionActivo}
                onReset={() => setAccionesOv({})}
              />
            </div>
          )}

          <button onClick={guardar} disabled={guardando} style={{ ...primaryBtn, opacity: guardando ? 0.7 : 1 }}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>

          <div style={{ borderTop: "1px solid var(--soft)", paddingTop: 14, marginTop: 4 }}>
            <div style={labelStyle}>Resetear contraseña</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Asigna una contraseña temporal nueva y compártela con el usuario.</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input type="text" style={{ ...inputStyle, flex: "1 1 180px" }} value={nuevaPass} onChange={e => setNuevaPass(e.target.value)} placeholder="Nueva contraseña (mín. 6)" />
              <button onClick={resetear} disabled={reseteando} style={{ padding: "10px 16px", borderRadius: 14, border: "none", background: "var(--ink)", color: "var(--on-ink)", fontWeight: 700, cursor: "pointer", opacity: reseteando ? 0.7 : 1 }}>
                {reseteando ? "..." : "Resetear"}
              </button>
            </div>
          </div>

          {error && <div style={{ color: "var(--bad-ink)", fontWeight: 600 }}>{error}</div>}
          {ok && <div style={{ color: "var(--ok-ink)", fontWeight: 600 }}>{ok}</div>}
        </div>
      </div>
    </>
  );
}
