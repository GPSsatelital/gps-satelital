import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

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
const primaryBtn: React.CSSProperties = {
  background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)",
  color: "white", border: "none", borderRadius: 12, padding: "10px 20px",
  fontWeight: 700, cursor: "pointer", fontSize: 14,
};

function Badge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    green:  { bg: "#dcfce7", text: "#166534" },
    blue:   { bg: "#dbeafe", text: "#1d4ed8" },
    orange: { bg: "#fef3c7", text: "#92400e" },
    gray:   { bg: "#f1f5f9", text: "#64748b" },
  };
  const c = colors[color] ?? colors.gray;
  return (
    <span style={{ padding: "3px 10px", borderRadius: 999, background: c.bg, color: c.text, fontSize: 11, fontWeight: 700 }}>
      {label}
    </span>
  );
}

function RoadmapItem({ icon, label, desc, status }: { icon: string; label: string; desc: string; status: "activo" | "proximo" | "planificado" }) {
  const statusMap = {
    activo:     { label: "Activo",       color: "green" },
    proximo:    { label: "Próximamente", color: "orange" },
    planificado:{ label: "Planificado",  color: "gray" },
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

import type { ViewKey } from "../App";

export default function ConfiguracionView({ onNavigate }: { onNavigate?: (v: ViewKey) => void }) {
  const { profile } = useAuth();
  const esAdmin = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";

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

  async function handleCambiarPassword() {
    if (!passNueva || passNueva.length < 8) { setMsgPass({ ok: false, text: "La contraseña debe tener al menos 8 caracteres." }); return; }
    if (passNueva !== passConfirm) { setMsgPass({ ok: false, text: "Las contraseñas no coinciden." }); return; }
    setGuardandoPass(true);
    const { error } = await supabase.auth.updateUser({ password: passNueva });
    setGuardandoPass(false);
    if (error) { setMsgPass({ ok: false, text: "Error al cambiar contraseña: " + error.message }); return; }
    setMsgPass({ ok: true, text: "Contraseña actualizada correctamente." });
    setPassNueva(""); setPassConfirm("");
    setTimeout(() => { setCambiarPass(false); setMsgPass(null); }, 3000);
  }

  async function handleGuardarNombre() {
    if (!nuevoNombre.trim() || !profile) return;
    setGuardandoNombre(true);
    const { error } = await supabase
      .from("profiles")
      .update({ nombre: nuevoNombre.trim().toUpperCase() })
      .eq("id", profile.id);
    setGuardandoNombre(false);
    if (error) { setMsgNombre("Error al guardar. Intenta de nuevo."); return; }
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
              <button onClick={() => { setEditandoNombre(true); setNuevoNombre(profile?.nombre ?? ""); }} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155" }}>
                ✏️ Editar
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <input
                style={inputStyle}
                value={nuevoNombre}
                onChange={e => setNuevoNombre(e.target.value.toUpperCase())}
                placeholder="Tu nombre"
              />
              {msgNombre && <div style={{ fontSize: 13, color: "#16a34a" }}>{msgNombre}</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleGuardarNombre} disabled={guardandoNombre} style={{ ...primaryBtn, flex: 1 }}>
                  {guardandoNombre ? "Guardando..." : "Guardar nombre"}
                </button>
                <button onClick={() => { setEditandoNombre(false); setMsgNombre(null); }} style={{ background: "#f1f5f9", border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cambiar contraseña */}
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14, marginTop: 4 }}>
          {!cambiarPass ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={labelCol}>Contraseña</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>••••••••</div>
              </div>
              <button onClick={() => { setCambiarPass(true); setMsgPass(null); }} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155" }}>
                🔑 Cambiar
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Nueva contraseña</div>
              <input type="password" style={inputStyle} value={passNueva} onChange={e => setPassNueva(e.target.value)} placeholder="Mínimo 8 caracteres" />
              <input type="password" style={inputStyle} value={passConfirm} onChange={e => setPassConfirm(e.target.value)} placeholder="Confirmar nueva contraseña" />
              {msgPass && (
                <div style={{ fontSize: 13, fontWeight: 600, color: msgPass.ok ? "#16a34a" : "#dc2626", padding: "8px 12px", borderRadius: 10, background: msgPass.ok ? "#f0fdf4" : "#fef2f2" }}>
                  {msgPass.text}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleCambiarPassword} disabled={guardandoPass} style={{ ...primaryBtn, flex: 1 }}>
                  {guardandoPass ? "Guardando..." : "Actualizar contraseña"}
                </button>
                <button onClick={() => { setCambiarPass(false); setMsgPass(null); setPassNueva(""); setPassConfirm(""); }} style={{ background: "#f1f5f9", border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Empresa ── */}
      <div style={card}>
        <div style={sectionTitle}>🏢 Empresa</div>
        {[
          { label: "Razón social",    value: "GPS Satelital Cartagena" },
          { label: "Ciudad",          value: "Cartagena de Indias" },
          { label: "Plataforma",      value: "MotoGestión v1.0" },
          { label: "Base de datos",   value: "Supabase · jvfkprkjysjffhzjitgl" },
          { label: "Despliegue",      value: "Vercel · rama main" },
        ].map(r => (
          <div key={r.label} style={rowStyle}>
            <span style={labelCol}>{r.label}</span>
            <span style={valueCol}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* ── Tarifas vigentes ── */}
      <div style={card}>
        <div style={sectionTitle}>💰 Tarifas y parámetros del negocio</div>
        <div style={{ padding: "10px 14px", borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a", marginBottom: 14, fontSize: 12, color: "#92400e" }}>
          Estos valores se aplican automáticamente en cobros y liquidaciones. Contacta al desarrollador para modificarlos.
        </div>
        {[
          { label: "Tarifa diaria (lunes a sábado)",  value: "$ 27.000" },
          { label: "Tarifa domingo",                   value: "Mitad de la tarifa L-S (~$ 13.500)" },
          { label: "Días por período — Diario",        value: "1 día · contrato indefinido" },
          { label: "Días por período — Semanal",       value: "7 días" },
          { label: "Días por período — Quincenal",     value: "15 días" },
          { label: "Días por período — Mensual",       value: "30 días" },
          { label: "Valor mínimo cuota por período",   value: "$ 50.000" },
          { label: "Valor máximo cuota por período",   value: "$ 150.000" },
        ].map(r => (
          <div key={r.label} style={rowStyle}>
            <span style={labelCol}>{r.label}</span>
            <span style={{ ...valueCol, fontWeight: 700, color: "#0f172a" }}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* ── Control de accesos ── */}
      {esAdmin && (
        <div style={card}>
          <div style={sectionTitle}>🔐 Control de accesos y roles</div>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { role: "ADMIN_PRINCIPAL", desc: "Acceso total. Puede crear admins y ver todo.", color: "#1d4ed8", bg: "#dbeafe" },
              { role: "ADMIN",           desc: "Gestión operativa completa. No puede crear admins.", color: "#166534", bg: "#dcfce7" },
              { role: "SECRETARIA",      desc: "Clientes, cobros, motos y contratos. Sin liquidar.", color: "#92400e", bg: "#fef3c7" },
              { role: "MECANICO",        desc: "Solo acceso al módulo de taller.", color: "#6d28d9", bg: "#ede9fe" },
            ].map(r => (
              <div key={r.role} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: r.bg }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: r.color, minWidth: 120 }}>{r.role}</span>
                <span style={{ fontSize: 12, color: "#374151" }}>{r.desc}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => onNavigate?.("usuarios" as ViewKey)}
              style={{ ...primaryBtn, flex: "1 1 140px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              👤 Ver equipo
            </button>
            <button
              onClick={() => onNavigate?.("usuarios" as ViewKey)}
              style={{ flex: "1 1 140px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 12, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
            >
              ➕ Crear usuario
            </button>
          </div>
        </div>
      )}

      {/* ── Estado del sistema ── */}
      <div style={card}>
        <div style={sectionTitle}>📡 Estado del sistema</div>
        {[
          { label: "Conexión en tiempo real",  value: "Activa", ok: true },
          { label: "Sincronización de datos",  value: "Automática", ok: true },
          { label: "Modo offline",             value: "No disponible", ok: false },
          { label: "PWA instalable",           value: "Sí — toca 'Instalar' en el banner", ok: true },
          { label: "Autenticación",            value: "Supabase Auth JWT", ok: true },
        ].map(r => (
          <div key={r.label} style={rowStyle}>
            <span style={labelCol}>{r.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: r.ok ? "#16a34a" : "#dc2626" }}>
              {r.ok ? "✅" : "❌"} {r.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Hoja de ruta / sugerencias ── */}
      <div style={card}>
        <button
          onClick={() => setExpandSugerencias(p => !p)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <div style={sectionTitle}>🚀 Hoja de ruta — módulos y mejoras</div>
          <span style={{ fontSize: 18, color: "#94a3b8", marginBottom: 14 }}>{expandSugerencias ? "▾" : "▸"}</span>
        </button>

        {expandSugerencias && (
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14, padding: "10px 14px", borderRadius: 12, background: "#f8fafc" }}>
              Estas son las funciones planeadas para el sistema. Las marcadas "Próximamente" están en desarrollo.
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", marginBottom: 8, marginTop: 4 }}>YA ACTIVO</div>
            {[
              { icon: "👥", label: "Gestión de clientes",       desc: "Registro, aprobación, visita domiciliaria, documentos", status: "activo" as const },
              { icon: "📄", label: "Contratos D/S/Q/M",         desc: "Diario, semanal, quincenal y mensual con equivalencias", status: "activo" as const },
              { icon: "💳", label: "Cartera y cobros",          desc: "Registro de pagos, deudas, convenios, gestiones", status: "activo" as const },
              { icon: "🏍️", label: "Flota de motos",            desc: "Inventario, estados, retenciones, ubicaciones", status: "activo" as const },
              { icon: "🔧", label: "Taller",                    desc: "Órdenes de mantenimiento y seguimiento técnico", status: "activo" as const },
              { icon: "📊", label: "Liquidaciones",             desc: "Cierre de contratos con prorrateo", status: "activo" as const },
            ].map(i => <RoadmapItem key={i.label} {...i} />)}

            <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.08em", marginBottom: 8, marginTop: 18 }}>PRÓXIMAMENTE</div>
            {[
              { icon: "📅", label: "Calendario de cobros",      desc: "Vista semanal: quién paga cada día de la semana", status: "proximo" as const },
              { icon: "📊", label: "Reportes exportables",       desc: "PDF/Excel de cobros, cartera, contratos por período", status: "proximo" as const },
              { icon: "🧾", label: "Estado de cuenta cliente",  desc: "Carta formal imprimible con historial de pagos", status: "proximo" as const },
              { icon: "📝", label: "Contrato en PDF",           desc: "Generación automática del documento de contrato", status: "proximo" as const },
              { icon: "💰", label: "Caja diaria",               desc: "Resumen de entradas y salidas del día en tiempo real", status: "proximo" as const },
              { icon: "🔔", label: "Alertas automáticas",       desc: "Notificaciones push de mora, vencimientos de seguro/TM", status: "proximo" as const },
              { icon: "💬", label: "Mensajes WhatsApp",         desc: "Recordatorios de pago automáticos al cliente", status: "proximo" as const },
              { icon: "🗺️", label: "Mapa de clientes",          desc: "Ver en mapa las coordenadas GPS de visitas domiciliarias", status: "proximo" as const },
            ].map(i => <RoadmapItem key={i.label} {...i} />)}

            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", marginBottom: 8, marginTop: 18 }}>PLANIFICADO</div>
            {[
              { icon: "🔧", label: "Costos de taller",          desc: "Registro de gastos por reparación y mantenimiento", status: "planificado" as const },
              { icon: "📜", label: "Auditoría y log",            desc: "Historial de quién cambió qué y cuándo", status: "planificado" as const },
              { icon: "📍", label: "Rutas de cobro",             desc: "Agrupación geográfica de clientes por sector", status: "planificado" as const },
              { icon: "📈", label: "Estadísticas avanzadas",     desc: "Gráficas de recaudo, mora, rendimiento por grupo", status: "planificado" as const },
              { icon: "🌐", label: "Portal del cliente",         desc: "App para que el cliente vea su estado de cuenta", status: "planificado" as const },
              { icon: "🔌", label: "Integración GPS",            desc: "Rastreo en tiempo real de motos en campo", status: "planificado" as const },
            ].map(i => <RoadmapItem key={i.label} {...i} />)}
          </div>
        )}
        {!expandSugerencias && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge label="6 módulos activos" color="green" />
            <Badge label="8 próximamente" color="orange" />
            <Badge label="6 planificados" color="gray" />
          </div>
        )}
      </div>

      {/* ── Acerca de ── */}
      <div style={{ ...card, marginBottom: 0 }}>
        <div style={sectionTitle}>ℹ️ Acerca del sistema</div>
        {[
          { label: "Aplicación",  value: "MotoGestión" },
          { label: "Versión",     value: "1.0.0" },
          { label: "Stack",       value: "React 19 · TypeScript · Vite · Supabase" },
          { label: "Soporte",     value: "gpssatelitalcartagena@gmail.com" },
        ].map(r => (
          <div key={r.label} style={rowStyle}>
            <span style={labelCol}>{r.label}</span>
            <span style={valueCol}>{r.value}</span>
          </div>
        ))}
        <div style={{ marginTop: 14, textAlign: "center", fontSize: 12, color: "#cbd5e1" }}>
          © 2026 GPS Satelital Cartagena · Todos los derechos reservados
        </div>
      </div>
    </div>
  );
}
