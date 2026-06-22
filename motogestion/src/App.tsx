import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import BusquedaGlobal from "./components/BusquedaGlobal";
import { useClientes } from "./hooks/useClientes";
import { useMotos } from "./hooks/useMotos";
import { useContratos } from "./hooks/useContratos";
import Login from "./pages/Login";
import MotosView from "./pages/MotosView";
import ClientesView from "./pages/ClientesView";
import ContratosView from "./pages/ContratosView";
import CobrosView from "./pages/CobrosView";
import TallerView from "./pages/TallerView";
import DashboardView from "./pages/DashboardView";
import UsuariosView from "./pages/UsuariosView";
import LiquidacionesView from "./pages/LiquidacionesView";
import ConfiguracionView from "./pages/ConfiguracionView";
import CajaView from "./pages/CajaView";
import ReportesView from "./pages/ReportesView";
import SocioDashboard from "./pages/SocioDashboard";
import CampanaAlertas from "./components/CampanaAlertas";
import ReferidosView from "./pages/ReferidosView";
import CobroDiarioView from "./pages/CobroDiarioView";
import AlertasView from "./pages/AlertasView";
import InmovilizacionesView from "./pages/InmovilizacionesView";
import ImportacionView from "./pages/ImportacionView";

export type ViewKey =
  | "dashboard" | "clientes" | "motos" | "contratos"
  | "cobros" | "caja" | "reportes" | "taller" | "usuarios" | "liquidaciones" | "configuracion"
  | "referidos" | "cobro_diario" | "alertas" | "inmovilizaciones" | "importacion";

export type NavContext = { view: ViewKey; filter: string };

function useIsMobile() {
  const [v, setV] = useState(window.innerWidth < 900);
  useEffect(() => {
    const h = () => setV(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return v;
}

// ─── Bottom Tab (mobile) ─────────────────────────────────────────────────────
const BOTTOM_TABS: Array<{ key: ViewKey; icon: string; label: string }> = [
  { key: "dashboard", icon: "🏠", label: "Panel" },
  { key: "clientes",  icon: "👥", label: "Clientes" },
  { key: "cobros",    icon: "💳", label: "Cartera" },
  { key: "motos",     icon: "🏍️", label: "Motos" },
];

// ─── Sidebar groups (desktop) ────────────────────────────────────────────────
type SubItem = { label: string; filter: string };
type SideItem = { key: ViewKey; label: string; icon: string; sub?: SubItem[] };
type SideGroup = { label: string; adminOnly?: boolean; items: SideItem[] };

const SIDE_GROUPS: SideGroup[] = [
  {
    label: "OPERACIONES",
    items: [
      {
        key: "clientes", label: "Clientes", icon: "👥",
        sub: [
          { label: "Todos",                filter: "" },
          { label: "En proceso",           filter: "En proceso" },
          { label: "Listos para visita",   filter: "Listo para visita" },
          { label: "Pendiente evaluación", filter: "Pendiente evaluación" },
          { label: "Aprobados",            filter: "Aprobado" },
          { label: "Activos",              filter: "Activo" },
          { label: "En mora / riesgo",     filter: "mora" },
          { label: "Rechazados",           filter: "Rechazado" },
        ],
      },
      {
        key: "contratos", label: "Contratos", icon: "📄",
        sub: [
          { label: "Todos",      filter: "" },
          { label: "En proceso", filter: "En proceso" },
          { label: "Activos",    filter: "Activo" },
          { label: "Finalizados",filter: "Finalizado" },
          { label: "Cancelados", filter: "Cancelado" },
        ],
      },
      { key: "cobros", label: "Cartera & Cobros", icon: "💳" },
    ],
  },
  {
    label: "FLOTA",
    items: [
      {
        key: "motos", label: "Motos", icon: "🏍️",
        sub: [
          { label: "Todas",               filter: "" },
          { label: "Disponibles",         filter: "Disponible" },
          { label: "Asignadas (campo)",   filter: "Asignada" },
          { label: "En mantenimiento",    filter: "Mantenimiento" },
          { label: "Retenciones",         filter: "retencion" },
        ],
      },
      { key: "taller", label: "Taller", icon: "🔧" },
    ],
  },
  {
    label: "FINANZAS",
    adminOnly: true,
    items: [
      { key: "cobro_diario", label: "Cobro Diario", icon: "📅" },
      { key: "alertas", label: "Alertas", icon: "🔔" },
      { key: "inmovilizaciones", label: "Inmovilizaciones", icon: "🚨" },
      { key: "reportes", label: "Reportes", icon: "📈" },
      { key: "caja", label: "Caja Diaria", icon: "💰" },
      { key: "liquidaciones", label: "Liquidaciones", icon: "📊" },
      { key: "referidos", label: "Referidos", icon: "🤝" },
    ],
  },
  {
    label: "ADMINISTRACIÓN",
    adminOnly: true,
    items: [
      { key: "usuarios", label: "Usuarios & Roles", icon: "👤" },
      { key: "configuracion", label: "Configuración", icon: "⚙️" },
      { key: "importacion", label: "Importación Excel", icon: "📥" },
    ],
  },
];

const VIEW_TITLE: Record<ViewKey, string> = {
  dashboard: "Panel General", clientes: "Clientes", motos: "Motos",
  contratos: "Contratos", cobros: "Cartera & Cobros", caja: "Caja Diaria",
  reportes: "Reportes", taller: "Taller", usuarios: "Usuarios", liquidaciones: "Liquidaciones",
  configuracion: "Configuración", referidos: "Referidos", cobro_diario: "Cobro Diario", alertas: "Alertas", inmovilizaciones: "Inmovilizaciones", importacion: "Importación Excel",
};

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────
function Sidebar({
  ctx, navigate, esAdmin, collapsed, onCollapse,
}: {
  ctx: NavContext;
  navigate: (v: ViewKey, f?: string) => void;
  esAdmin: boolean;
  collapsed: boolean;
  onCollapse: () => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    SIDE_GROUPS.forEach(g => g.items.forEach(i => { if (i.sub) o[i.key] = true; }));
    return o;
  });

  const W = collapsed ? 64 : 240;

  const btn = (active: boolean): React.CSSProperties => ({
    width: "100%", display: "flex", alignItems: "center",
    justifyContent: collapsed ? "center" : "space-between",
    gap: 10, padding: collapsed ? "10px 0" : "9px 12px",
    borderRadius: 10, border: "none",
    background: active ? "rgba(56,189,248,0.15)" : "transparent",
    color: active ? "#38bdf8" : "#94a3b8",
    cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500,
    transition: "all 0.15s", marginBottom: 1,
  });

  const groups = SIDE_GROUPS.filter(g => !g.adminOnly || esAdmin);

  return (
    <div style={{
      width: W, minHeight: "100vh", background: "#0f172a",
      display: "flex", flexDirection: "column", flexShrink: 0,
      transition: "width 0.2s", position: "sticky", top: 0, alignSelf: "flex-start",
      overflow: "hidden",
    }}>
      {/* Brand */}
      <div style={{
        padding: collapsed ? "18px 0" : "18px 16px",
        display: "flex", alignItems: "center", gap: 10,
        borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0, width: collapsed ? "100%" : "auto", textAlign: "center" }}>🏍️</span>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>MotoGestión</div>
            <div style={{ fontSize: 10, color: "#475569" }}>GPS Satelital · Cartagena</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
        {/* Dashboard */}
        <button onClick={() => navigate("dashboard")} style={btn(ctx.view === "dashboard")} title={collapsed ? "Panel" : undefined}>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>🏠</span>
            {!collapsed && "Panel General"}
          </span>
        </button>

        {groups.map(g => (
          <div key={g.label} style={{ marginTop: 16 }}>
            {!collapsed
              ? <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", letterSpacing: "0.1em", padding: "0 8px 4px" }}>{g.label}</div>
              : <div style={{ margin: "6px 8px", borderTop: "1px solid rgba(255,255,255,0.06)" }} />
            }
            {g.items.map(item => (
              <div key={item.key}>
                <button
                  onClick={() => {
                    navigate(item.key, "");
                    if (item.sub && !collapsed) setOpen(p => ({ ...p, [item.key]: !p[item.key] }));
                  }}
                  style={btn(ctx.view === item.key)}
                  title={collapsed ? item.label : undefined}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    {!collapsed && item.label}
                  </span>
                  {!collapsed && item.sub && <span style={{ fontSize: 10, color: "#475569" }}>{open[item.key] ? "▾" : "▸"}</span>}
                </button>

                {!collapsed && item.sub && open[item.key] && (
                  <div style={{ paddingLeft: 30, paddingBottom: 2 }}>
                    {item.sub.map(s => {
                      const isAct = ctx.view === item.key && ctx.filter === s.filter;
                      return (
                        <button
                          key={s.label}
                          onClick={() => navigate(item.key, s.filter)}
                          style={{
                            width: "100%", textAlign: "left", display: "block",
                            padding: "6px 10px", borderRadius: 8, border: "none",
                            background: isAct ? "rgba(56,189,248,0.12)" : "transparent",
                            color: isAct ? "#38bdf8" : "#64748b",
                            cursor: "pointer", fontSize: 12,
                            fontWeight: isAct ? 700 : 400,
                          }}
                        >
                          {isAct ? "▸ " : "  "}{s.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ padding: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <button onClick={onCollapse} style={{ width: "100%", padding: 8, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.04)", color: "#475569", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 8 }}>
          <span>{collapsed ? "▶" : "◀"}</span>
          {!collapsed && "Contraer menú"}
        </button>
      </div>
    </div>
  );
}

// ─── Mobile "Más" sheet ───────────────────────────────────────────────────────
function MasSheet({
  ctx, navigate, esAdmin, onClose,
}: {
  ctx: NavContext;
  navigate: (v: ViewKey, f?: string) => void;
  esAdmin: boolean;
  onClose: () => void;
}) {
  const extras: Array<{ key: ViewKey; icon: string; label: string; desc: string; adminOnly?: boolean }> = [
    { key: "contratos",     icon: "📄", label: "Contratos",    desc: "Gestión de contratos activos" },
    { key: "cobro_diario",  icon: "📅", label: "Cobro Diario",  desc: "Estado de pago del día",               adminOnly: true },
    { key: "alertas",       icon: "🔔", label: "Alertas",       desc: "Mora, SOAT, tecno y situaciones activas", adminOnly: true },
    { key: "inmovilizaciones", icon: "🚨", label: "Inmovilizaciones", desc: "Motos a recuperar por mora",           adminOnly: true },
    { key: "reportes",      icon: "📈", label: "Reportes",      desc: "Recaudo, mora, flota y alertas",         adminOnly: true },
    { key: "referidos",     icon: "🤝", label: "Referidos",     desc: "Programa de referidos y premios",        adminOnly: true },
    { key: "caja",          icon: "💰", label: "Caja Diaria",  desc: "Cierre de caja y confirmación de pagos" },
    { key: "taller",        icon: "🔧", label: "Taller",       desc: "Órdenes de mantenimiento" },
    { key: "liquidaciones", icon: "📊", label: "Liquidaciones", desc: "Cierre y liquidación",     adminOnly: true },
    { key: "usuarios",      icon: "👤", label: "Usuarios",      desc: "Roles y accesos",           adminOnly: true },
    { key: "configuracion", icon: "⚙️", label: "Configuración", desc: "Ajustes del sistema y cuenta" },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 200 }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
        background: "white", borderRadius: "20px 20px 0 0",
        padding: "12px 0 32px",
        boxShadow: "0 -8px 40px rgba(15,23,42,0.2)",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: "#e2e8f0", margin: "0 auto 20px" }} />
        <div style={{ padding: "0 20px 12px", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em" }}>MÁS MÓDULOS</div>
        {extras.filter(e => !e.adminOnly || esAdmin).map(e => (
          <button
            key={e.key}
            onClick={() => { navigate(e.key); onClose(); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 16,
              padding: "14px 20px", border: "none", background: ctx.view === e.key ? "#eff6ff" : "transparent",
              cursor: "pointer", textAlign: "left",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{e.icon}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{e.label}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{e.desc}</div>
            </div>
            <span style={{ marginLeft: "auto", color: "#cbd5e1", fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>
    </>
  );
}

// ─── Install Banner ───────────────────────────────────────────────────────────
function InstallBanner() {
  const [prompt, setPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const h = (e: any) => { e.preventDefault(); setPrompt(e); setVisible(true); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
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

// ─── Shell ────────────────────────────────────────────────────────────────────
function Shell() {
  const { session, profile, loading, signOut } = useAuth();
  const isMobile = useIsMobile();

  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { contratos } = useContratos();
  const [ctx, setCtx] = useState<NavContext>({ view: "dashboard", filter: "" });
  const [collapsed, setCollapsed] = useState(false);
  const [masOpen, setMasOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [busquedaOpen, setBusquedaOpen] = useState(false);

  const roleActual = profile?.role ?? "SECRETARIA";
  const esAdmin = roleActual === "ADMIN" || roleActual === "ADMIN_PRINCIPAL";
  const esMecanico = roleActual === "MECANICO";

  function navigate(v: ViewKey, f = "") {
    setCtx({ view: v, filter: f });
    setMasOpen(false);
    setUserMenuOpen(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🏍️</div>
          <div style={{ color: "#64748b", fontSize: 14 }}>Cargando MotoGestión...</div>
        </div>
      </div>
    );
  }

  if (!session) return <Login />;

  // SOCIO: solo ve su dashboard de grupo, sin navegación completa
  if (roleActual === "SOCIO") return <SocioDashboard />;

  const currentTitle = VIEW_TITLE[ctx.view];

  // Determine subfilter label for breadcrumb
  let filterLabel = "";
  if (ctx.filter) {
    const FILTER_LABELS: Record<string, string> = {
      "": "", "mora": "En mora / riesgo", "retencion": "Retenciones",
      "En proceso": "En proceso", "Listo para visita": "Listos para visita",
      "Pendiente evaluación": "Pendiente evaluación", "Aprobado": "Aprobados",
      "Activo": "Activos", "Rechazado": "Rechazados",
      "Disponible": "Disponibles", "Asignada": "Asignadas",
      "Mantenimiento": "En mantenimiento",
      "Finalizado": "Finalizados", "Cancelado": "Cancelados",
    };
    filterLabel = FILTER_LABELS[ctx.filter] ?? ctx.filter;
  }

  const contentView = (
    <div style={{ flex: 1, background: "#f1f5f9", minHeight: 0 }}>
      {ctx.view === "dashboard"     && <DashboardView onNavigate={navigate} />}
      {ctx.view === "clientes"      && <ClientesView initialFilter={ctx.filter} />}
      {ctx.view === "motos"         && <MotosView initialFilter={ctx.filter} />}
      {ctx.view === "contratos"     && <ContratosView initialFilter={ctx.filter} />}
      {ctx.view === "cobros"        && <CobrosView />}
      {ctx.view === "caja"          && <CajaView />}
      {ctx.view === "reportes"      && esAdmin && <ReportesView />}
      {ctx.view === "cobro_diario"  && esAdmin && <CobroDiarioView />}
      {ctx.view === "referidos"     && esAdmin && <ReferidosView />}
      {ctx.view === "alertas"       && esAdmin && <AlertasView onNavegar={navigate} />}
      {ctx.view === "inmovilizaciones" && esAdmin && <InmovilizacionesView />}
      {ctx.view === "taller"        && <TallerView />}
      {ctx.view === "liquidaciones"  && esAdmin && <LiquidacionesView />}
      {ctx.view === "usuarios"       && esAdmin && <UsuariosView />}
      {ctx.view === "configuracion"  && <ConfiguracionView />}
      {ctx.view === "importacion"    && profile?.role === "ADMIN_PRINCIPAL" && <ImportacionView />}
    </div>
  );

  // ── MOBILE LAYOUT ──────────────────────────────────────────────────────────
  if (isMobile) {
    const bottomTabs = esMecanico
      ? [{ key: "dashboard" as ViewKey, icon: "🏠", label: "Panel" }, { key: "taller" as ViewKey, icon: "🔧", label: "Taller" }]
      : BOTTOM_TABS;

    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif", color: "#0f172a", background: "#f1f5f9" }}>
        <InstallBanner />

        {/* Mobile top header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "white", borderBottom: "1px solid #f1f5f9",
          padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
          boxShadow: "0 1px 8px rgba(15,23,42,0.06)",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>{currentTitle}</div>
            {filterLabel && <div style={{ fontSize: 11, color: "#0284c7", fontWeight: 600, marginTop: 1 }}>{filterLabel}</div>}
          </div>
          <button onClick={() => setBusquedaOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: 4, color: "#64748b" }}>🔍</button>
          <CampanaAlertas onNavegar={navigate} />
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setUserMenuOpen(p => !p)}
              style={{
                width: 36, height: 36, borderRadius: 999, border: "none",
                background: "linear-gradient(135deg, #0284c7, #10b981)",
                color: "white", fontWeight: 800, fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {(profile?.nombre ?? "U")[0].toUpperCase()}
            </button>
            {userMenuOpen && (
              <>
                <div onClick={() => setUserMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 98 }} />
                <div style={{
                  position: "absolute", top: 44, right: 0, width: 200,
                  background: "white", borderRadius: 14, zIndex: 99,
                  boxShadow: "0 8px 32px rgba(15,23,42,0.15)", overflow: "hidden",
                }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{profile?.nombre ?? "Usuario"}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Rol: {profile?.role}</div>
                  </div>
                  <button onClick={signOut} style={{ width: "100%", textAlign: "left", padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#ef4444", fontWeight: 600 }}>
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", paddingBottom: 72 }}>
          {contentView}
        </div>

        {/* Bottom tab bar */}
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          background: "white", borderTop: "1px solid #e2e8f0",
          display: "flex", alignItems: "stretch",
          boxShadow: "0 -2px 16px rgba(15,23,42,0.08)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          {bottomTabs.map(tab => {
            const active = ctx.view === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => navigate(tab.key)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", padding: "8px 4px", border: "none",
                  background: "transparent", cursor: "pointer", gap: 3,
                  color: active ? "#0284c7" : "#94a3b8",
                  borderTop: active ? "2px solid #0284c7" : "2px solid transparent",
                }}
              >
                <span style={{ fontSize: 22 }}>{tab.icon}</span>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{tab.label}</span>
              </button>
            );
          })}
          {!esMecanico && (
            <button
              onClick={() => setMasOpen(true)}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "8px 4px", border: "none",
                background: "transparent", cursor: "pointer", gap: 3,
                color: ["contratos","taller","liquidaciones","usuarios","configuracion"].includes(ctx.view) ? "#0284c7" : "#94a3b8",
                borderTop: ["contratos","taller","liquidaciones","usuarios","configuracion"].includes(ctx.view) ? "2px solid #0284c7" : "2px solid transparent",
              }}
            >
              <span style={{ fontSize: 22 }}>☰</span>
              <span style={{ fontSize: 10, fontWeight: 500 }}>Más</span>
            </button>
          )}
        </nav>

        {masOpen && <MasSheet ctx={ctx} navigate={navigate} esAdmin={esAdmin} onClose={() => setMasOpen(false)} />}
        {busquedaOpen && <BusquedaGlobal onClose={() => setBusquedaOpen(false)} onNavegar={(v, f) => { navigate(v, f); setBusquedaOpen(false); }} clientes={clientes} motos={motos} contratos={contratos} />}
      </div>
    );
  }

  // ── DESKTOP LAYOUT ─────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "Arial, sans-serif", color: "#0f172a" }}>
      <InstallBanner />
      <Sidebar ctx={ctx} navigate={navigate} esAdmin={esAdmin} collapsed={collapsed} onCollapse={() => setCollapsed(p => !p)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: "100vh" }}>
        {/* Desktop top bar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 40, background: "white",
          borderBottom: "1px solid #e2e8f0", padding: "0 24px",
          display: "flex", alignItems: "center", gap: 16, height: 56,
          boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{currentTitle}</span>
            {filterLabel && <span style={{ marginLeft: 8, fontSize: 13, color: "#0284c7", fontWeight: 600 }}>/ {filterLabel}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              {profile?.nombre ?? "Usuario"} · <span style={{ fontWeight: 700 }}>{profile?.role}</span>
            </div>
            <button onClick={() => setBusquedaOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: 4, color: "#64748b" }}>🔍</button>
            <CampanaAlertas onNavegar={navigate} />
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen(p => !p)}
                style={{
                  width: 34, height: 34, borderRadius: 999, border: "none",
                  background: "linear-gradient(135deg, #0284c7, #10b981)",
                  color: "white", fontWeight: 800, fontSize: 13, cursor: "pointer",
                }}
              >
                {(profile?.nombre ?? "U")[0].toUpperCase()}
              </button>
              {userMenuOpen && (
                <>
                  <div onClick={() => setUserMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 98 }} />
                  <div style={{
                    position: "absolute", top: 42, right: 0, width: 200,
                    background: "white", borderRadius: 14, zIndex: 99,
                    boxShadow: "0 8px 32px rgba(15,23,42,0.15)", overflow: "hidden",
                  }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{profile?.nombre ?? "Usuario"}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Rol: {profile?.role}</div>
                    </div>
                    <button onClick={signOut} style={{ width: "100%", textAlign: "left", padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#ef4444", fontWeight: 600 }}>
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: "16px 20px", maxWidth: 1300, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          {contentView}
        </main>
      </div>
      {busquedaOpen && <BusquedaGlobal onClose={() => setBusquedaOpen(false)} onNavegar={(v, f) => { navigate(v, f); setBusquedaOpen(false); }} clientes={clientes} motos={motos} contratos={contratos} />}
    </div>
  );
}

export default function App() {
  return <AuthProvider><Shell /></AuthProvider>;
}
