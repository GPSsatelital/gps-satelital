import { useState, useRef, useEffect } from "react";
import { useMotos } from "../hooks/useMotos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { usePagos } from "../hooks/usePagos";
import { useConvenios } from "../hooks/useConvenios";
import { useAlertas, type Alerta } from "../hooks/useAlertas";
import { useScope } from "../contexts/SubadminScopeContext";
import type { ViewKey } from "../App";

const NIVEL_STYLE: Record<Alerta["nivel"], { bg: string; color: string; border: string; dot: string }> = {
  critico: { bg: "var(--bad-soft)", color: "var(--bad-ink)", border: "var(--bad-line)", dot: "var(--bad)" },
  alerta:  { bg: "var(--warn-soft2)", color: "var(--warn-ink)", border: "var(--warn-line)", dot: "var(--warn2)" },
  info:    { bg: "var(--accent-soft4)", color: "var(--accent-ink)", border: "var(--accent-line)", dot: "var(--accent)" },
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

function viewParaAlerta(tipo: Alerta["tipo"]): ViewKey {
  if (tipo === "mora_critica" || tipo === "gabela" || tipo === "transferencia_pendiente" || tipo === "convenio_por_vencer") return "cobros";
  if (tipo === "base_completada" || tipo === "traspaso_proximo" || tipo === "contrato_sin_activar" || tipo === "plazo_extra_vence") return "contratos";
  if (tipo === "soat_vence" || tipo === "tecno_vence" || tipo === "moto_retenida") return "motos";
  if (tipo === "moto_taller_demorada") return "taller";
  if (tipo === "convenio_incumplido_3") return "liquidaciones";
  return "alertas";
}

export default function CampanaAlertas({ onNavegar }: { onNavegar?: (v: ViewKey) => void }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { filtrarMotos, filtrarContratos, filtrarPorCliente, filtrarPorContrato } = useScope();
  const { motos: todasMotos } = useMotos();
  const { contratos: todosContratos } = useContratos();
  const { clientes: todosClientes } = useClientes();
  const { pagos: todosPagos } = usePagos();
  const { convenios: todosConvenios } = useConvenios();

  const motos = filtrarMotos(todasMotos);
  const contratos = filtrarContratos(todosContratos);
  const clientes = filtrarPorCliente(todosClientes);
  const pagos = filtrarPorContrato(todosPagos);
  const convenios = filtrarPorContrato(todosConvenios);

  const alertas = useAlertas({ contratos, clientes, motos, pagos, convenios });
  const criticos = alertas.filter(a => a.nivel === "critico").length;
  const total = alertas.length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setAbierto(o => !o)}
        style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: 10, fontSize: 20, lineHeight: 1, color: total > 0 ? "var(--text)" : "var(--faint)" }}
        title="Alertas del sistema"
      >
        🔔
        {total > 0 && (
          <span style={{ position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 999, background: criticos > 0 ? "var(--bad)" : "var(--warn2)", color: "var(--card)", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {abierto && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 340, maxHeight: "80vh", overflowY: "auto", background: "var(--card)", borderRadius: 16, boxShadow: "0 20px 60px rgba(15,23,42,0.18)", border: "1px solid var(--line)", zIndex: 200 }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--soft)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Alertas del sistema</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{total} activa{total !== 1 ? "s" : ""}</div>
          </div>

          {alertas.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
              Sin alertas pendientes
            </div>
          ) : (
            <div style={{ padding: "8px 0" }}>
              {alertas.slice(0, 8).map(a => {
                const s = NIVEL_STYLE[a.nivel];
                return (
                  <div
                    key={a.id}
                    onClick={() => { if (onNavegar) { onNavegar(viewParaAlerta(a.tipo)); setAbierto(false); } }}
                    style={{ margin: "4px 10px", padding: "10px 12px", borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, cursor: onNavegar ? "pointer" : "default" }}
                  >
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{TIPO_ICON[a.tipo]}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: s.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.titulo}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, lineHeight: 1.4 }}>{a.detalle}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {onNavegar && alertas.length > 0 && (
            <div style={{ padding: "8px 12px 12px", borderTop: "1px solid var(--soft)" }}>
              <button onClick={() => { onNavegar("alertas"); setAbierto(false); }} style={{ width: "100%", padding: "8px", borderRadius: 10, border: "none", background: "var(--soft)", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>
                Ver todas las alertas ({total}) →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
