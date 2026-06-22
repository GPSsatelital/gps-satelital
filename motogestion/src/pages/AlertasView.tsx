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

const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };

const NIVEL_STYLE: Record<Alerta["nivel"], { bg: string; color: string; border: string; label: string }> = {
  critico: { bg: "#fff5f5", color: "#991b1b", border: "#fecaca", label: "Crítico" },
  alerta:  { bg: "#fefce8", color: "#92400e", border: "#fde68a", label: "Alerta" },
  info:    { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd", label: "Info" },
};

const TIPO_ICON: Record<Alerta["tipo"], string> = {
  mora_critica:    "🚨",
  gabela:          "⏰",
  base_completada: "✅",
  soat_vence:      "📋",
  tecno_vence:     "🔧",
  plazo_extra_vence: "⏳",
};

const TIPO_LABEL: Record<Alerta["tipo"], string> = {
  mora_critica:    "Mora",
  gabela:          "Gabela",
  base_completada: "Base completada",
  soat_vence:      "SOAT",
  tecno_vence:     "Tecnomecánica",
  plazo_extra_vence: "Plazo extra",
};

type FiltroNivel = "todos" | "critico" | "alerta" | "info";
type FiltroTipo = "todos" | Alerta["tipo"];

export default function AlertasView({ onNavegar }: Props) {
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { pagos } = usePagos();
  const alertas = useAlertas({ contratos, clientes, motos, pagos });

  const [filtroNivel, setFiltroNivel] = useState<FiltroNivel>("todos");
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");

  const resumen = useMemo(() => ({
    critico: alertas.filter(a => a.nivel === "critico").length,
    alerta: alertas.filter(a => a.nivel === "alerta").length,
    info: alertas.filter(a => a.nivel === "info").length,
    mora: alertas.filter(a => a.tipo === "mora_critica").length,
    gabela: alertas.filter(a => a.tipo === "gabela").length,
    soat: alertas.filter(a => a.tipo === "soat_vence").length,
    tecno: alertas.filter(a => a.tipo === "tecno_vence").length,
    base: alertas.filter(a => a.tipo === "base_completada").length,
  }), [alertas]);

  const filtradas = useMemo(() => {
    let lista = alertas;
    if (filtroNivel !== "todos") lista = lista.filter(a => a.nivel === filtroNivel);
    if (filtroTipo !== "todos") lista = lista.filter(a => a.tipo === filtroTipo);
    return lista;
  }, [alertas, filtroNivel, filtroTipo]);

  function getClienteTel(clienteId?: string) {
    if (!clienteId) return "";
    const c = clientes.find(cl => cl.id === clienteId);
    return c?.whatsapp ?? c?.telefono ?? "";
  }

  function abrirWA(clienteId: string | undefined, titulo: string, detalle: string) {
    const tel = getClienteTel(clienteId);
    if (!tel) return;
    const nombre = titulo.split("—")[1]?.trim() ?? "";
    const msg = `Hola ${nombre}, le contactamos del equipo GPS Satelital. ${detalle}. Por favor comuníquese con nosotros.`;
    const num = tel.replace(/\D/g, "");
    const full = num.startsWith("57") ? num : `57${num}`;
    window.open(`https://wa.me/${full}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function llamar(clienteId?: string) {
    const tel = getClienteTel(clienteId);
    if (!tel) return;
    const num = tel.replace(/\D/g, "");
    window.open(`tel:+57${num}`);
  }

  function navAlerta(a: Alerta) {
    if (a.tipo === "mora_critica" || a.tipo === "gabela" || a.tipo === "base_completada") {
      onNavegar("cobro_diario");
    } else if (a.tipo === "soat_vence" || a.tipo === "tecno_vence") {
      onNavegar("motos");
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, margin: 0 }}>Alertas del sistema</h2>
        <p style={{ marginTop: 6, color: "#64748b" }}>Situaciones que requieren atención inmediata o seguimiento.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Críticas", value: resumen.critico, color: "#991b1b", bg: "#fff5f5" },
          { label: "Alertas", value: resumen.alerta, color: "#92400e", bg: "#fefce8" },
          { label: "En mora", value: resumen.mora, color: "#991b1b", bg: "#fee2e2" },
          { label: "Gabela", value: resumen.gabela, color: "#854d0e", bg: "#fef9c3" },
          { label: "SOAT vence", value: resumen.soat, color: "#0369a1", bg: "#e0f2fe" },
          { label: "Tecno vence", value: resumen.tecno, color: "#0369a1", bg: "#e0f2fe" },
          { label: "Base lista", value: resumen.base, color: "#166534", bg: "#dcfce7" },
        ].map(k => (
          <div key={k.label} style={{ ...card, background: k.bg, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color, marginTop: 4 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {(["todos", "critico", "alerta", "info"] as FiltroNivel[]).map(n => (
          <button key={n} onClick={() => setFiltroNivel(n)} style={{ padding: "5px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: filtroNivel === n ? 700 : 500, background: filtroNivel === n ? "#0284c7" : "#f1f5f9", color: filtroNivel === n ? "white" : "#64748b" }}>
            {n === "todos" ? `Todos (${alertas.length})` : n === "critico" ? `Crítico (${resumen.critico})` : n === "alerta" ? `Alerta (${resumen.alerta})` : `Info (${resumen.info})`}
          </button>
        ))}
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as FiltroTipo)} style={{ padding: "5px 12px", borderRadius: 999, border: "1px solid #e2e8f0", fontSize: 12, background: "white", cursor: "pointer" }}>
          <option value="todos">Todos los tipos</option>
          {(Object.keys(TIPO_LABEL) as Alerta["tipo"][]).map(t => (
            <option key={t} value={t}>{TIPO_ICON[t]} {TIPO_LABEL[t]}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      {filtradas.length === 0 && (
        <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Sin alertas activas</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>Todo está bajo control</div>
        </div>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        {filtradas.map(a => {
          const s = NIVEL_STYLE[a.nivel];
          const tel = getClienteTel(a.clienteId);
          const tieneTel = !!tel;

          return (
            <div key={a.id} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{TIPO_ICON[a.tipo]}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{a.titulo}</div>
                    <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: s.border, color: s.color }}>{s.label}</span>
                    <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "rgba(0,0,0,0.06)", color: "#64748b" }}>{TIPO_LABEL[a.tipo]}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{a.detalle}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                {tieneTel && (
                  <>
                    <button onClick={() => llamar(a.clienteId)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#dbeafe", color: "#1d4ed8" }}>
                      📞 Llamar
                    </button>
                    <button onClick={() => abrirWA(a.clienteId, a.titulo, a.detalle)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>
                      💬 WA
                    </button>
                  </>
                )}
                <button onClick={() => navAlerta(a)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "rgba(0,0,0,0.06)", color: "#334155" }}>
                  Ver →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
