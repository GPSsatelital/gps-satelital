import { useMemo, useState } from "react";
import { useAlertas, type Alerta } from "../hooks/useAlertas";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { usePagos } from "../hooks/usePagos";
import type { ViewKey } from "../App";

interface Props {
  onNavegar: (view: ViewKey, filter?: string) => void;
}

const NIVEL: Record<Alerta["nivel"], { bg: string; color: string; border: string; label: string; icon: string }> = {
  critico: { bg: "#fff5f5", color: "#991b1b", border: "#fecaca", label: "Crítico", icon: "🔴" },
  alerta:  { bg: "#fefce8", color: "#92400e", border: "#fde68a", label: "Alerta",  icon: "🟠" },
  info:    { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd", label: "Info",    icon: "🔵" },
};

const TIPO_ICON: Record<Alerta["tipo"], string> = {
  mora_critica:      "🚨",
  gabela:            "⏰",
  base_completada:   "✅",
  soat_vence:        "📋",
  tecno_vence:       "🔧",
  plazo_extra_vence: "⏳",
};

const TIPO_LABEL: Record<Alerta["tipo"], string> = {
  mora_critica:      "Mora",
  gabela:            "Gabela",
  base_completada:   "Base lista",
  soat_vence:        "SOAT",
  tecno_vence:       "Tecnomecánica",
  plazo_extra_vence: "Plazo extra",
};

type FiltroNivel = "todos" | Alerta["nivel"];
type FiltroTipo  = "todos" | Alerta["tipo"];

function diasHasta(iso: string): number {
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  return Math.ceil((new Date(iso + "T00:00:00").getTime() - hoy.getTime()) / 86400000);
}

export default function AlertasView({ onNavegar }: Props) {
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { pagos } = usePagos();
  const alertas = useAlertas({ contratos, clientes, motos, pagos });

  const [filtroNivel, setFiltroNivel] = useState<FiltroNivel>("todos");
  const [filtroTipo, setFiltroTipo]   = useState<FiltroTipo>("todos");
  const [busqueda, setBusqueda]       = useState("");

  const resumen = useMemo(() => ({
    critico: alertas.filter(a => a.nivel === "critico").length,
    alerta:  alertas.filter(a => a.nivel === "alerta").length,
    info:    alertas.filter(a => a.nivel === "info").length,
    mora:    alertas.filter(a => a.tipo === "mora_critica").length,
    gabela:  alertas.filter(a => a.tipo === "gabela").length,
    soat:    alertas.filter(a => a.tipo === "soat_vence").length,
    tecno:   alertas.filter(a => a.tipo === "tecno_vence").length,
    base:    alertas.filter(a => a.tipo === "base_completada").length,
  }), [alertas]);

  const filtradas = useMemo(() => {
    let lista = alertas;
    if (filtroNivel !== "todos") lista = lista.filter(a => a.nivel === filtroNivel);
    if (filtroTipo  !== "todos") lista = lista.filter(a => a.tipo  === filtroTipo);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(a => a.titulo.toLowerCase().includes(q) || a.detalle.toLowerCase().includes(q));
    }
    return lista;
  }, [alertas, filtroNivel, filtroTipo, busqueda]);

  // Grupos por nivel para la vista agrupada
  const grupos: { nivel: Alerta["nivel"]; items: Alerta[] }[] = useMemo(() => {
    const criticos = filtradas.filter(a => a.nivel === "critico");
    const alertas_ = filtradas.filter(a => a.nivel === "alerta");
    const infos    = filtradas.filter(a => a.nivel === "info");
    return [
      ...(criticos.length ? [{ nivel: "critico" as const, items: criticos }] : []),
      ...(alertas_.length ? [{ nivel: "alerta"  as const, items: alertas_ }] : []),
      ...(infos.length    ? [{ nivel: "info"     as const, items: infos    }] : []),
    ];
  }, [filtradas]);

  function getCliente(clienteId?: string) {
    return clienteId ? clientes.find(cl => cl.id === clienteId) : null;
  }
  function getMoto(motoId?: string) {
    return motoId ? motos.find(m => m.id === motoId) : null;
  }
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

  // Extraer días sin pago de la alerta para mora
  function diasMora(a: Alerta): number | null {
    const m = a.detalle.match(/^(\d+) días sin pago/);
    return m ? parseInt(m[1]) : null;
  }

  // Días hasta vencimiento para SOAT/tecno
  function diasVencimiento(a: Alerta): number | null {
    const moto = getMoto(a.motoId);
    if (!moto) return null;
    if (a.tipo === "soat_vence" && moto.fecha_seguro) return diasHasta(moto.fecha_seguro);
    if (a.tipo === "tecno_vence" && moto.fecha_tecnomecanica) return diasHasta(moto.fecha_tecnomecanica);
    return null;
  }

  function CardAlerta({ a }: { a: Alerta }) {
    const s = NIVEL[a.nivel];
    const tel = getTel(a.clienteId);
    const cliente = getCliente(a.clienteId);
    const moto = getMoto(a.motoId);
    const dias = diasMora(a);
    const dVenc = diasVencimiento(a);

    return (
      <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          {/* Contenido */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 26, flexShrink: 0 }}>{TIPO_ICON[a.tipo]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Título con nombre en mayúsculas */}
              <div style={{ fontSize: 14, fontWeight: 800, color: s.color, textTransform: "uppercase" }}>
                {a.titulo}
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: s.border, color: s.color }}>{s.icon} {s.label}</span>
                <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "rgba(0,0,0,0.05)", color: "#64748b" }}>{TIPO_LABEL[a.tipo]}</span>
                {moto && <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "#eff6ff", color: "#0284c7" }}>🏍️ {moto.placa}</span>}
              </div>

              <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>{a.detalle}</div>

              {/* Métricas visuales según tipo */}
              {(dias !== null || dVenc !== null) && (
                <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                  {dias !== null && (
                    <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{dias === 999 ? "∞" : dias}</div>
                      <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>días sin pago</div>
                    </div>
                  )}
                  {dVenc !== null && (
                    <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: dVenc < 0 ? "#991b1b" : s.color, lineHeight: 1 }}>
                        {dVenc < 0 ? `+${Math.abs(dVenc)}` : dVenc}
                      </div>
                      <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                        {dVenc < 0 ? "días vencida" : "días restantes"}
                      </div>
                    </div>
                  )}
                  {cliente?.telefono && (
                    <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 10, padding: "6px 12px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{cliente.whatsapp ?? cliente.telefono}</div>
                      <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>contacto</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0, minWidth: 100 }}>
            {tel && (
              <>
                <button onClick={() => llamar(a.clienteId)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#dbeafe", color: "#1d4ed8" }}>
                  📞 Llamar
                </button>
                <button onClick={() => abrirWA(a.clienteId, a.titulo, a.detalle)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>
                  💬 WhatsApp
                </button>
              </>
            )}
            {a.clienteId && (
              <button onClick={() => onNavegar("ficha_cliente", a.clienteId)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#0284c7" }}>
                👤 Ver cliente
              </button>
            )}
            {a.motoId && (
              <button onClick={() => onNavegar("ficha_moto", a.motoId)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#f0fdf4", color: "#166534" }}>
                🏍️ Ver moto
              </button>
            )}
            {(a.tipo === "mora_critica" || a.tipo === "gabela") && (
              <button onClick={() => onNavegar("cobros")} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>
                💳 Ir a Cartera
              </button>
            )}
            {a.tipo === "base_completada" && (
              <button onClick={() => onNavegar("contratos")} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>
                📄 Contratos
              </button>
            )}
            {(a.tipo === "soat_vence" || a.tipo === "tecno_vence") && (
              <button onClick={() => onNavegar("motos")} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>
                🏍️ Ir a Motos
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, margin: 0, fontWeight: 800 }}>Alertas del sistema</h2>
        <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>Situaciones que requieren atención inmediata o seguimiento.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { label: "🔴 Críticas",    value: resumen.critico, color: "#991b1b", bg: "#fff5f5" },
          { label: "🟠 Alertas",     value: resumen.alerta,  color: "#92400e", bg: "#fefce8" },
          { label: "🔵 Info",        value: resumen.info,    color: "#0369a1", bg: "#f0f9ff" },
          { label: "🚨 En mora",     value: resumen.mora,    color: "#991b1b", bg: "#fee2e2" },
          { label: "⏰ Gabela",      value: resumen.gabela,  color: "#854d0e", bg: "#fef9c3" },
          { label: "📋 SOAT",        value: resumen.soat,    color: "#0369a1", bg: "#e0f2fe" },
          { label: "🔧 Tecno",       value: resumen.tecno,   color: "#0369a1", bg: "#e0f2fe" },
          { label: "✅ Base lista",  value: resumen.base,    color: "#166534", bg: "#dcfce7" },
        ].map(k => (
          <div key={k.label} style={{ flex: 1, minWidth: 80, background: k.bg, borderRadius: 14, padding: "10px 12px", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
            <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color, marginTop: 2 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filtros nivel */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {(["todos","critico","alerta","info"] as FiltroNivel[]).map(n => (
          <button
            key={n}
            onClick={() => setFiltroNivel(n)}
            style={{
              padding: "5px 14px", borderRadius: 999, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 700,
              background: filtroNivel === n ? "#0284c7" : "#f1f5f9",
              color: filtroNivel === n ? "white" : "#64748b",
            }}
          >
            {n === "todos"   ? `Todos (${alertas.length})` :
             n === "critico" ? `🔴 Crítico (${resumen.critico})` :
             n === "alerta"  ? `🟠 Alerta (${resumen.alerta})` :
                               `🔵 Info (${resumen.info})`}
          </button>
        ))}
      </div>

      {/* Filtro tipo + búsqueda */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <select
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value as FiltroTipo)}
          style={{ padding: "6px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12, background: "white", cursor: "pointer" }}
        >
          <option value="todos">Todos los tipos</option>
          {(Object.keys(TIPO_LABEL) as Alerta["tipo"][]).map(t => (
            <option key={t} value={t}>{TIPO_ICON[t]} {TIPO_LABEL[t]}</option>
          ))}
        </select>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar cliente, placa..."
          style={{ flex: 1, minWidth: 180, padding: "6px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
      </div>

      {/* Empty */}
      {filtradas.length === 0 && (
        <div style={{ background: "white", borderRadius: 16, padding: "48px 24px", textAlign: "center", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>Sin alertas activas</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>Todo está bajo control</div>
        </div>
      )}

      {/* Agrupadas por nivel */}
      <div style={{ display: "grid", gap: 20 }}>
        {grupos.map(g => {
          const s = NIVEL[g.nivel];
          return (
            <div key={g.nivel}>
              {/* Encabezado de grupo */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ height: 2, flex: 1, background: s.border, borderRadius: 999 }} />
                <div style={{ padding: "4px 16px", borderRadius: 999, background: s.bg, border: `1px solid ${s.border}`, fontSize: 12, fontWeight: 800, color: s.color }}>
                  {s.icon} {s.label.toUpperCase()} — {g.items.length}
                </div>
                <div style={{ height: 2, flex: 1, background: s.border, borderRadius: 999 }} />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {g.items.map(a => <CardAlerta key={a.id} a={a} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
