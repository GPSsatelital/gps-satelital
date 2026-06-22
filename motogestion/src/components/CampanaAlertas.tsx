import { useState, useRef, useEffect } from "react";
import { useMotos } from "../hooks/useMotos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { usePagos } from "../hooks/usePagos";
import { useAlertas, type Alerta } from "../hooks/useAlertas";
import type { ViewKey } from "../App";

const NIVEL_STYLE: Record<Alerta["nivel"], { bg: string; color: string; border: string; dot: string }> = {
  critico: { bg: "#fff5f5", color: "#991b1b", border: "#fecaca", dot: "#ef4444" },
  alerta:  { bg: "#fefce8", color: "#92400e", border: "#fde68a", dot: "#f59e0b" },
  info:    { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd", dot: "#0284c7" },
};

const TIPO_ICON: Record<Alerta["tipo"], string> = {
  mora_critica:    "🚨",
  gabela:          "⏰",
  base_completada: "✅",
  soat_vence:      "📋",
  tecno_vence:     "🔧",
  plazo_extra_vence: "⏳",
};

export default function CampanaAlertas({ onNavegar }: { onNavegar?: (v: ViewKey) => void }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { motos } = useMotos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { pagos } = usePagos();

  const alertas = useAlertas({ contratos, clientes, motos, pagos });
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
        style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: 10, fontSize: 20, lineHeight: 1, color: total > 0 ? "#0f172a" : "#94a3b8" }}
        title="Alertas del sistema"
      >
        🔔
        {total > 0 && (
          <span style={{ position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 999, background: criticos > 0 ? "#ef4444" : "#f59e0b", color: "white", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {abierto && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 340, maxHeight: "80vh", overflowY: "auto", background: "white", borderRadius: 16, boxShadow: "0 20px 60px rgba(15,23,42,0.18)", border: "1px solid #e2e8f0", zIndex: 200 }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Alertas del sistema</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{total} activa{total !== 1 ? "s" : ""}</div>
          </div>

          {alertas.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
              Sin alertas pendientes
            </div>
          ) : (
            <div style={{ padding: "8px 0" }}>
              {alertas.slice(0, 8).map(a => {
                const s = NIVEL_STYLE[a.nivel];
                return (
                  <div key={a.id} style={{ margin: "4px 10px", padding: "10px 12px", borderRadius: 10, background: s.bg, border: `1px solid ${s.border}` }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{TIPO_ICON[a.tipo]}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: s.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.titulo}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, lineHeight: 1.4 }}>{a.detalle}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {onNavegar && alertas.length > 0 && (
            <div style={{ padding: "8px 12px 12px", borderTop: "1px solid #f1f5f9" }}>
              <button onClick={() => { onNavegar("alertas"); setAbierto(false); }} style={{ width: "100%", padding: "8px", borderRadius: 10, border: "none", background: "#f1f5f9", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#0284c7" }}>
                Ver todas las alertas ({total}) →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
