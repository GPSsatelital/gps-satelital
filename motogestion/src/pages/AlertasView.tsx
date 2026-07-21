import { useMemo, useState, useEffect } from "react";
import { useAlertas, type Alerta } from "../hooks/useAlertas";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { usePagos } from "../hooks/usePagos";
import { useConvenios } from "../hooks/useConvenios";
import type { ViewKey } from "../App";

interface Props {
  onNavegar: (view: ViewKey, filter?: string) => void;
}

// ── Severity mapping ──────────────────────────────────────────────────────────
const NIVEL_STYLE: Record<Alerta["nivel"], { bg: string; color: string; border: string; label: string; severidad: string }> = {
  critico: { bg: "var(--bad-soft)", color: "var(--bad-ink)", border: "var(--bad-line)", label: "Crítico",  severidad: "Crítica" },
  alerta:  { bg: "var(--warn-soft2)", color: "var(--warn-ink)", border: "var(--warn-line)", label: "Alerta",   severidad: "Alta"    },
  info:    { bg: "var(--accent-soft4)", color: "var(--accent-ink)", border: "var(--accent-line)", label: "Info",     severidad: "Baja"    },
};

const NIVEL_BADGE_BG: Record<Alerta["nivel"], string> = {
  critico: "var(--bad-soft)",
  alerta:  "var(--warn-soft)",
  info:    "var(--accent-soft3)",
};

const TIPO_ICON: Record<Alerta["tipo"], string> = {
  mora_critica:           "🚨",
  gabela:                 "⏰",
  base_completada:        "✅",
  soat_vence:             "📋",
  tecno_vence:            "🔧",
  plazo_extra_vence:      "⏳",
  transferencia_pendiente:"💳",
  contrato_sin_activar:   "📄",
  moto_retenida:          "🔒",
  traspaso_proximo:       "🔄",
  convenio_incumplido_3:  "⚖️",
  convenio_por_vencer:    "📅",
  moto_taller_demorada:   "🔧",
};

const TIPO_LABEL: Record<Alerta["tipo"], string> = {
  mora_critica:           "Mora",
  gabela:                 "Gabela",
  base_completada:        "Base lista",
  soat_vence:             "SOAT",
  tecno_vence:            "Tecnomecánica",
  plazo_extra_vence:      "Plazo extra",
  transferencia_pendiente:"Transferencia",
  contrato_sin_activar:   "Contrato",
  moto_retenida:          "Retención",
  traspaso_proximo:       "Traspaso",
  convenio_incumplido_3:  "Liquidación",
  convenio_por_vencer:    "Convenio",
  moto_taller_demorada:   "Taller",
};

// ── Category tab definitions ──────────────────────────────────────────────────
type TabKey = "todas" | "mora" | "soat_tecno" | "contratos" | "flota" | "convenios";

const TABS: { key: TabKey; label: string }[] = [
  { key: "todas",     label: "Todas"         },
  { key: "mora",      label: "Mora"          },
  { key: "contratos", label: "Contratos"     },
  { key: "flota",     label: "Flota"         },
  { key: "soat_tecno",label: "SOAT / Tecno"  },
  { key: "convenios", label: "Convenios"     },
];

function viewParaAlerta(tipo: Alerta["tipo"]): ViewKey {
  if (tipo === "mora_critica" || tipo === "gabela" || tipo === "transferencia_pendiente" || tipo === "convenio_por_vencer") return "cobros";
  if (tipo === "base_completada" || tipo === "traspaso_proximo" || tipo === "contrato_sin_activar" || tipo === "plazo_extra_vence") return "contratos";
  if (tipo === "soat_vence" || tipo === "tecno_vence" || tipo === "moto_retenida") return "motos";
  if (tipo === "moto_taller_demorada") return "taller";
  if (tipo === "convenio_incumplido_3") return "liquidaciones";
  return "alertas";
}

function alertaMatchesTab(a: Alerta, tab: TabKey): boolean {
  if (tab === "todas")     return true;
  if (tab === "mora")      return a.tipo === "mora_critica" || a.tipo === "gabela";
  if (tab === "soat_tecno")return a.tipo === "soat_vence"   || a.tipo === "tecno_vence";
  if (tab === "contratos") return a.tipo === "base_completada" || a.tipo === "plazo_extra_vence"
                               || a.tipo === "transferencia_pendiente" || a.tipo === "contrato_sin_activar"
                               || a.tipo === "traspaso_proximo";
  if (tab === "flota")     return a.tipo === "moto_retenida" || a.tipo === "moto_taller_demorada";
  if (tab === "convenios") return a.tipo === "convenio_incumplido_3" || a.tipo === "convenio_por_vencer";
  return false;
}

function diasHasta(iso: string): number {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(iso + "T00:00:00").getTime() - hoy.getTime()) / 86400000);
}

export default function AlertasView({ onNavegar }: Props) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const { contratos, loading: lCt } = useContratos();
  const { clientes,  loading: lCl } = useClientes();
  const { motos,     loading: lM  } = useMotos();
  const { pagos,     loading: lP  } = usePagos();
  const { convenios } = useConvenios();
  const cargando = lCt || lCl || lM || lP;
  const alertas = useAlertas({ contratos, clientes, motos, pagos, convenios });

  const [tab, setTab]           = useState<TabKey>("todas");
  const [vistas, setVistas]     = useState<Set<string>>(new Set());

  // Count per tab
  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = { todas: 0, mora: 0, soat_tecno: 0, contratos: 0, flota: 0, convenios: 0 };
    for (const a of alertas) {
      counts.todas++;
      if (alertaMatchesTab(a, "mora"))      counts.mora++;
      if (alertaMatchesTab(a, "soat_tecno"))counts.soat_tecno++;
      if (alertaMatchesTab(a, "contratos")) counts.contratos++;
      if (alertaMatchesTab(a, "flota"))     counts.flota++;
      if (alertaMatchesTab(a, "convenios")) counts.convenios++;
    }
    return counts;
  }, [alertas]);

  const filtradas = useMemo(() => alertas.filter(a => alertaMatchesTab(a, tab)), [alertas, tab]);

  function getCliente(id?: string) { return id ? clientes.find(c => c.id === id) : null; }
  function getMoto(id?: string)    { return id ? motos.find(m => m.id === id) : null; }
  function getTel(clienteId?: string) {
    const c = getCliente(clienteId);
    return c?.whatsapp ?? c?.telefono ?? "";
  }

  function abrirWA(clienteId: string | undefined, nombre: string, detalle: string) {
    const tel = getTel(clienteId);
    if (!tel) return;
    const n = nombre.split(" ")[0];
    const msg = `Hola ${n}, le contactamos del equipo GPS Satelital. ${detalle}. Por favor comuníquese con nosotros.`;
    const num = tel.replace(/\D/g, "");
    window.open(`https://wa.me/${num.startsWith("57") ? num : `57${num}`}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function llamar(clienteId?: string) {
    const tel = getTel(clienteId);
    if (!tel) return;
    window.open(`tel:+57${tel.replace(/\D/g, "")}`);
  }

  function diasMora(a: Alerta): number | null {
    const m = a.detalle.match(/^(\d+) días sin pago/);
    return m ? parseInt(m[1]) : null;
  }

  function diasVencimiento(a: Alerta): number | null {
    const moto = getMoto(a.motoId);
    if (!moto) return null;
    if (a.tipo === "soat_vence"   && moto.fecha_seguro)          return diasHasta(moto.fecha_seguro);
    if (a.tipo === "tecno_vence"  && moto.fecha_tecnomecanica)   return diasHasta(moto.fecha_tecnomecanica);
    return null;
  }

  function marcarVista(id: string) {
    setVistas(prev => { const next = new Set(prev); next.add(id); return next; });
  }

  function CardAlerta({ a }: { a: Alerta }) {
    const s      = NIVEL_STYLE[a.nivel];
    const tel    = getTel(a.clienteId);
    const cliente = getCliente(a.clienteId);
    const moto    = getMoto(a.motoId);
    const dias    = diasMora(a);
    const dVenc   = diasVencimiento(a);
    const vista   = vistas.has(a.id);

    const cardStyle: React.CSSProperties = {
      background:    vista ? "var(--soft2)" : s.bg,
      border:        `1px solid ${vista ? "var(--line)" : s.border}`,
      borderRadius:  14,
      padding:       "14px 16px",
      opacity:       vista ? 0.65 : 1,
      cursor:        "pointer",
      transition:    "box-shadow 0.15s",
    };

    return (
      <div style={cardStyle} onClick={() => onNavegar(viewParaAlerta(a.tipo))}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>

          {/* Left: icon + content */}
          <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1.2 }}>{TIPO_ICON[a.tipo]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Title */}
              <div style={{ fontSize: 14, fontWeight: 800, color: s.color, textTransform: "uppercase" }}>
                {a.titulo}
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 5 }}>
                {/* Severity badge */}
                <span style={{
                  padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                  background: NIVEL_BADGE_BG[a.nivel], color: s.color,
                }}>
                  {s.severidad}
                </span>
                {/* Type badge */}
                <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "rgba(0,0,0,0.05)", color: "var(--muted)" }}>
                  {TIPO_LABEL[a.tipo]}
                </span>
                {moto && (
                  <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "var(--accent-soft2)", color: "var(--accent)" }}>
                    🏍️ {moto.placa}
                  </span>
                )}
                {vista && (
                  <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "var(--soft)", color: "var(--faint)" }}>
                    Vista
                  </span>
                )}
              </div>

              {/* Detail */}
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{a.detalle}</div>

              {/* Metrics */}
              {(dias !== null || dVenc !== null) && (
                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  {dias !== null && (
                    <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>
                        {dias === 999 ? "∞" : dias}
                      </div>
                      <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>días sin pago</div>
                    </div>
                  )}
                  {dVenc !== null && (
                    <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: dVenc < 0 ? "var(--bad-ink)" : s.color, lineHeight: 1 }}>
                        {dVenc < 0 ? `+${Math.abs(dVenc)}` : dVenc}
                      </div>
                      <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
                        {dVenc < 0 ? "días vencida" : "días restantes"}
                      </div>
                    </div>
                  )}
                  {cliente?.telefono && (
                    <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 10, padding: "6px 12px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)" }}>{cliente.whatsapp ?? cliente.telefono}</div>
                      <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>contacto</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: 5, flexShrink: isMobile ? 1 : 0, flexWrap: "wrap", minWidth: 0 }}>
            {tel && (
              <>
                <button onClick={() => llamar(a.clienteId)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--accent-soft3)", color: "var(--accent-ink)" }}>
                  📞 Llamar
                </button>
                <button onClick={() => abrirWA(a.clienteId, a.titulo, a.detalle)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--ok-soft)", color: "var(--ok-ink)" }}>
                  💬 WhatsApp
                </button>
              </>
            )}
            {a.clienteId && (
              <button
                onClick={() => onNavegar("ficha_cliente", a.clienteId)}
                style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--accent-soft2)", color: "var(--accent)" }}
              >
                👤 Ver cliente
              </button>
            )}
            {a.motoId && (
              <button
                onClick={() => onNavegar("ficha_moto", a.motoId)}
                style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--ok-soft)", color: "var(--ok-ink)" }}
              >
                🏍️ Ver moto
              </button>
            )}
            {(a.tipo === "mora_critica" || a.tipo === "gabela") && (
              <button onClick={() => onNavegar("cobros")} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--warn-soft)", color: "var(--warn-ink)" }}>
                💳 Cartera
              </button>
            )}
            {(a.tipo === "base_completada" || a.tipo === "traspaso_proximo" || a.tipo === "contrato_sin_activar") && (
              <button onClick={() => onNavegar("contratos")} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--ok-soft)", color: "var(--ok-ink)" }}>
                📄 Contratos
              </button>
            )}
            {(a.tipo === "soat_vence" || a.tipo === "tecno_vence" || a.tipo === "moto_retenida" || a.tipo === "moto_taller_demorada") && (
              <button onClick={() => onNavegar("motos")} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--warn-soft)", color: "var(--warn-ink)" }}>
                🏍️ Ir a Motos
              </button>
            )}
            {a.tipo === "moto_taller_demorada" && (
              <button onClick={() => onNavegar("taller")} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--orange-soft)", color: "var(--orange)" }}>
                🔧 Taller
              </button>
            )}
            {a.tipo === "transferencia_pendiente" && (
              <button onClick={() => onNavegar("cobros")} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--accent-soft2)", color: "var(--accent)" }}>
                💳 Confirmar
              </button>
            )}
            {(a.tipo === "convenio_incumplido_3") && (
              <button onClick={() => onNavegar("liquidaciones")} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--bad-soft)", color: "var(--bad-ink)" }}>
                ⚖️ Liquidar
              </button>
            )}
            {!vista && (
              <button
                onClick={() => marcarVista(a.id)}
                style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--line)", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--card)", color: "var(--muted)" }}
              >
                ✓ Vista
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div>
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 22, margin: 0, fontWeight: 900, color: "var(--text)" }}>Alertas del sistema</h2>
          <p style={{ margin: "5px 0 0", color: "var(--faint)", fontSize: 14 }}>Cargando datos...</p>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 80, borderRadius: 14, background: "var(--line)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 22, margin: 0, fontWeight: 900, color: "var(--text)" }}>Alertas del sistema</h2>
        <p style={{ margin: "5px 0 0", color: "var(--muted)", fontSize: 14 }}>
          Situaciones que requieren atención — {alertas.length} alerta{alertas.length !== 1 ? "s" : ""} activa{alertas.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Summary KPI row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Críticas",   value: alertas.filter(a => a.nivel === "critico").length, color: "var(--bad-ink)", bg: "var(--bad-soft)" },
          { label: "Alertas",    value: alertas.filter(a => a.nivel === "alerta").length,  color: "var(--warn-ink)", bg: "var(--warn-soft)" },
          { label: "Info",       value: alertas.filter(a => a.nivel === "info").length,    color: "var(--accent-ink)", bg: "var(--accent-soft)" },
          { label: "En mora",    value: alertas.filter(a => a.tipo === "mora_critica").length,   color: "var(--bad-ink)", bg: "var(--bad-soft)" },
          { label: "Gabela",     value: alertas.filter(a => a.tipo === "gabela").length,         color: "var(--warn-ink)", bg: "var(--warn-soft)" },
          { label: "SOAT/Tecno", value: alertas.filter(a => a.tipo === "soat_vence" || a.tipo === "tecno_vence").length, color: "var(--accent-ink)", bg: "var(--accent-soft4)" },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, borderRadius: 12, padding: "10px 14px", minWidth: 72, flex: "0 0 auto", boxShadow: "0 1px 6px rgba(15,23,42,0.05)" }}>
            <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: k.color, lineHeight: 1.2 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 18, flexWrap: "wrap", borderBottom: "2px solid var(--line)", paddingBottom: 0 }}>
        {TABS.map(t => {
          const count = tabCounts[t.key];
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "8px 16px", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 700,
                background: "transparent",
                color: isActive ? "var(--accent)" : "var(--muted)",
                borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -2,
                display: "flex", alignItems: "center", gap: 6,
                borderRadius: 0,
              }}
            >
              {t.label}
              {count > 0 && (
                <span style={{
                  background: isActive ? "var(--accent)" : "var(--line)",
                  color: isActive ? "var(--card)" : "var(--muted)",
                  borderRadius: 999, fontSize: 10, fontWeight: 900,
                  padding: "1px 7px", minWidth: 18, textAlign: "center",
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtradas.length === 0 && (
        <div style={{
          background: "var(--card)", borderRadius: 16, padding: "52px 24px",
          textAlign: "center", boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
        }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>
            {tab === "mora" ? "🎉" : tab === "soat_tecno" ? "🛡️" : tab === "contratos" ? "📄" : tab === "flota" ? "🏍️" : tab === "convenios" ? "🤝" : "✅"}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>Sin alertas en esta categoría</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
            {tab === "mora"       ? "Todos los clientes están al día con sus pagos." :
             tab === "soat_tecno" ? "Todos los documentos están vigentes." :
             tab === "contratos"  ? "No hay contratos pendientes de acción." :
             tab === "flota"      ? "No hay motos retenidas ni demoradas en taller." :
             tab === "convenios"  ? "No hay convenios vencidos ni por vencer." :
             "Todas las alertas están bajo control."}
          </div>
        </div>
      )}

      {/* Grouped by severity */}
      {filtradas.length > 0 && (
        <div style={{ display: "grid", gap: 20 }}>
          {(["critico", "alerta", "info"] as Alerta["nivel"][]).map(nivel => {
            const items = filtradas.filter(a => a.nivel === nivel);
            if (items.length === 0) return null;
            const s = NIVEL_STYLE[nivel];
            return (
              <div key={nivel}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ height: 2, flex: 1, background: s.border, borderRadius: 999 }} />
                  <div style={{
                    padding: "4px 16px", borderRadius: 999,
                    background: s.bg, border: `1px solid ${s.border}`,
                    fontSize: 11, fontWeight: 900, color: s.color, textTransform: "uppercase", letterSpacing: 0.5,
                  }}>
                    {s.label} — {items.length}
                  </div>
                  <div style={{ height: 2, flex: 1, background: s.border, borderRadius: 999 }} />
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {items.map(a => <CardAlerta key={a.id} a={a} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
