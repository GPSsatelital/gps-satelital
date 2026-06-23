import { useMemo, useState } from "react";
import type { ViewKey } from "../App";
import { useMotos } from "../hooks/useMotos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useTaller } from "../hooks/useTaller";
import { usePagos } from "../hooks/usePagos";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }
function fmtFecha(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}
function diasRestantes(fecha: string | null | undefined): number | null {
  if (!fecha) return null;
  const diff = new Date(fecha + "T00:00:00").getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

const GRUPO_COLORS: Record<string, { bg: string; color: string }> = {
  RASTREADOR: { bg: "#dbeafe", color: "#1d4ed8" },
  COSTA: { bg: "#dcfce7", color: "#166534" },
  PRADERA: { bg: "#fef3c7", color: "#92400e" },
};
const ESTADO_MOTO_COLORS: Record<string, { bg: string; color: string }> = {
  Disponible: { bg: "#dcfce7", color: "#166534" },
  Asignada: { bg: "#dbeafe", color: "#1d4ed8" },
  "En taller": { bg: "#fef3c7", color: "#92400e" },
  Recuperada: { bg: "#e0f2fe", color: "#0369a1" },
  Suspendida: { bg: "#ede9fe", color: "#6d28d9" },
  Fiscalía: { bg: "#fee2e2", color: "#991b1b" },
  Tránsito: { bg: "#fee2e2", color: "#be123c" },
  Garantía: { bg: "#f1f5f9", color: "#334155" },
};

const ESTADO_C: Record<string, { bg: string; color: string }> = {
  Activo: { bg: "#dcfce7", color: "#166534" },
  "En proceso": { bg: "#dbeafe", color: "#1d4ed8" },
  Finalizado: { bg: "#e2e8f0", color: "#334155" },
  Cancelado: { bg: "#fee2e2", color: "#991b1b" },
  Suspendido: { bg: "#fef3c7", color: "#92400e" },
};

const TALLER_COLORS: Record<string, { bg: string; color: string }> = {
  Pendiente: { bg: "#fef3c7", color: "#92400e" },
  "En diagnóstico": { bg: "#dbeafe", color: "#1d4ed8" },
  "En reparación": { bg: "#fee2e2", color: "#991b1b" },
  "Listo para salida": { bg: "#dcfce7", color: "#166534" },
  Finalizado: { bg: "#e2e8f0", color: "#334155" },
};

type Tab = "info" | "contratos" | "taller" | "documentos";

export default function FichaMotoView({ motoId, onNavigate }: {
  motoId: string;
  onNavigate: (view: ViewKey, filter?: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("info");
  const { motos } = useMotos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { taller } = useTaller();
  const { pagos } = usePagos();

  const moto = motos.find(m => m.id === motoId);
  const contratosMoto = useMemo(() =>
    contratos.filter(c => c.moto_id === motoId).sort((a, b) => (b.fecha_entrega ?? "").localeCompare(a.fecha_entrega ?? "")),
    [contratos, motoId]
  );
  const ordenesTodo = useMemo(() =>
    taller.filter(t => t.moto_id === motoId).sort((a, b) => (b.fecha_ingreso ?? "").localeCompare(a.fecha_ingreso ?? "")),
    [taller, motoId]
  );

  if (!moto) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <div style={{ fontWeight: 700 }}>Moto no encontrada</div>
        <button onClick={() => onNavigate("motos")} style={{ marginTop: 16, padding: "8px 18px", borderRadius: 10, border: "none", background: "#0284c7", color: "white", fontWeight: 700, cursor: "pointer" }}>← Volver</button>
      </div>
    );
  }

  const ec = ESTADO_MOTO_COLORS[moto.estado] ?? { bg: "#e2e8f0", color: "#334155" };
  const gColor = GRUPO_COLORS[moto.grupo] ?? { bg: "#e2e8f0", color: "#334155" };
  const diasSoat = diasRestantes(moto.fecha_seguro);
  const diasTecno = diasRestantes(moto.fecha_tecnomecanica);
  const costoTotalTaller = ordenesTodo.reduce((s, t) => s + (t.costo ?? 0), 0);

  const TABS: Array<{ key: Tab; label: string; count?: number }> = [
    { key: "info", label: "Información" },
    { key: "contratos", label: "Contratos", count: contratosMoto.length },
    { key: "taller", label: "Taller", count: ordenesTodo.length },
    { key: "documentos", label: "Documentos" },
  ];

  function docColor(dias: number | null) {
    if (dias === null) return { bg: "#f1f5f9", color: "#94a3b8" };
    if (dias < 0) return { bg: "#fee2e2", color: "#991b1b" };
    if (dias < 15) return { bg: "#fee2e2", color: "#991b1b" };
    if (dias < 30) return { bg: "#fef3c7", color: "#92400e" };
    return { bg: "#dcfce7", color: "#166534" };
  }

  return (
    <div style={{ paddingBottom: 32 }}>
      <button
        onClick={() => onNavigate("motos")}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#0284c7", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: 0 }}
      >
        ← Volver a motos
      </button>

      {/* Header */}
      <div style={{ background: "white", borderRadius: 20, padding: "20px 24px", marginBottom: 20, boxShadow: "0 4px 20px rgba(15,23,42,0.08)", borderLeft: `5px solid ${ec.color}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", letterSpacing: 1 }}>{moto.placa}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#334155", marginTop: 4 }}>{moto.marca} {moto.modelo}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <span style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: ec.bg, color: ec.color }}>{moto.estado}</span>
              <span style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: gColor.bg, color: gColor.color }}>{moto.grupo}</span>
              <span style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "#f1f5f9", color: "#64748b" }}>
                {moto.condicion_ingreso === "nueva" ? "🆕 Nueva" : "🔄 Usada"}
              </span>
            </div>
            {moto.propietario && (
              <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>Propietario: <strong style={{ color: "#0f172a" }}>{moto.propietario}</strong></div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flexShrink: 0 }}>
            {diasSoat !== null && (
              <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 14, background: docColor(diasSoat).bg }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: docColor(diasSoat).color }}>{diasSoat < 0 ? "VENCIDO" : `${diasSoat}d`}</div>
                <div style={{ fontSize: 11, color: docColor(diasSoat).color, fontWeight: 700, marginTop: 2 }}>SOAT</div>
              </div>
            )}
            {diasTecno !== null && (
              <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 14, background: docColor(diasTecno).bg }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: docColor(diasTecno).color }}>{diasTecno < 0 ? "VENCIDO" : `${diasTecno}d`}</div>
                <div style={{ fontSize: 11, color: docColor(diasTecno).color, fontWeight: 700, marginTop: 2 }}>Tecno.</div>
              </div>
            )}
            {costoTotalTaller > 0 && (
              <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 14, background: "#fef3c7" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#92400e" }}>${fmt(costoTotalTaller)}</div>
                <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700, marginTop: 2 }}>Total taller</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e2e8f0", marginBottom: 20, overflowX: "auto" }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "9px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 13,
              fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? "#0284c7" : "#64748b",
              borderBottom: tab === t.key ? "2px solid #0284c7" : "2px solid transparent",
              marginBottom: -2, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span style={{ background: tab === t.key ? "#0284c7" : "#e2e8f0", color: tab === t.key ? "white" : "#64748b", borderRadius: 999, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === "info" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Datos técnicos</div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                ["Placa", moto.placa],
                ["Marca", moto.marca],
                ["Modelo", moto.modelo],
                ["Cilindraje", moto.cilindraje ? `${moto.cilindraje} cc` : "—"],
                ["N° Motor", moto.numero_motor || "—"],
                ["N° Chasis", moto.numero_chasis || "—"],
                ["Condición ingreso", moto.condicion_ingreso ?? "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                  <span style={{ color: "#64748b", minWidth: 130, flexShrink: 0 }}>{k}</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "white", borderRadius: 16, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Ubicación y estado</div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                ["Estado actual", moto.estado],
                ["Grupo", moto.grupo],
                ["Propietario", moto.propietario || "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                  <span style={{ color: "#64748b", minWidth: 130, flexShrink: 0 }}>{k}</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{v}</span>
                </div>
              ))}
            </div>
            {moto.observaciones && (
              <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "#f8fafc", fontSize: 13, color: "#334155" }}>
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 12, color: "#64748b" }}>OBSERVACIONES</div>
                {moto.observaciones}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Contratos */}
      {tab === "contratos" && (
        <div style={{ display: "grid", gap: 12 }}>
          {contratosMoto.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, background: "white", borderRadius: 16, color: "#64748b" }}>Sin contratos asignados.</div>
          ) : contratosMoto.map(c => {
            const cliente = clientes.find(cl => cl.id === c.cliente_id);
            const cEc = ESTADO_C[c.estado] ?? { bg: "#e2e8f0", color: "#334155" };
            const pagosC = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado").reduce((s, p) => s + p.valor, 0);
            return (
              <div key={c.id} style={{ background: "white", borderRadius: 14, padding: "16px 20px", borderLeft: `4px solid ${cEc.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <button
                      onClick={() => cliente && onNavigate("ficha_cliente", cliente.id)}
                      style={{ background: "none", border: "none", cursor: cliente ? "pointer" : "default", color: cliente ? "#0284c7" : "#64748b", fontWeight: 800, fontSize: 15, padding: 0, textTransform: "uppercase" }}
                    >
                      👤 {cliente?.nombre ?? "Cliente desconocido"}
                    </button>
                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: cEc.bg, color: cEc.color }}>{c.estado}</span>
                      <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "#f1f5f9", color: "#64748b" }}>{c.forma_pago}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
                      {c.fecha_entrega && <span>Entrega: {fmtFecha(c.fecha_entrega)} · </span>}
                      {c.valor_semanal && <span>Valor: <strong style={{ color: "#0f172a" }}>${fmt(c.valor_semanal)}</strong></span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#166534" }}>${fmt(pagosC)}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>total pagado</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Taller */}
      {tab === "taller" && (
        <div>
          {ordenesTodo.length > 0 && (
            <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fef3c7", marginBottom: 16, fontSize: 13, fontWeight: 600, color: "#92400e" }}>
              🔧 {ordenesTodo.length} orden{ordenesTodo.length > 1 ? "es" : ""} — Costo total: ${fmt(costoTotalTaller)}
            </div>
          )}
          {ordenesTodo.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, background: "white", borderRadius: 16, color: "#64748b" }}>Sin órdenes de taller.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {ordenesTodo.map(t => {
                const tc = TALLER_COLORS[t.estado_tecnico] ?? { bg: "#e2e8f0", color: "#334155" };
                const dias = t.fecha_ingreso
                  ? Math.floor((new Date(t.fecha_salida ?? new Date().toISOString()).getTime() - new Date(t.fecha_ingreso + "T00:00:00").getTime()) / 86400000)
                  : 0;
                return (
                  <div key={t.id} style={{ background: "white", borderRadius: 14, padding: "16px 20px", borderLeft: `4px solid ${tc.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: tc.bg, color: tc.color }}>{t.estado_tecnico}</span>
                          <span style={{ fontSize: 12, color: "#64748b" }}>{fmtFecha(t.fecha_ingreso)} → {t.fecha_salida ? fmtFecha(t.fecha_salida) : "En curso"} ({dias}d)</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginTop: 8 }}>{t.detalle}</div>
                        {t.repuestos && (
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                            Repuestos: {t.repuestos.split(",").map((r, i) => (
                              <span key={i} style={{ display: "inline-block", margin: "2px 4px 0 0", padding: "2px 8px", borderRadius: 999, background: "#f1f5f9", border: "1px solid #e2e8f0" }}>{r.trim()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#0284c7" }}>${fmt(t.costo)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Documentos */}
      {tab === "documentos" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            { label: "SOAT", fecha: moto.fecha_seguro, dias: diasSoat },
            { label: "Tecnomecánica", fecha: moto.fecha_tecnomecanica, dias: diasTecno },
          ].map(doc => {
            const dc = docColor(doc.dias);
            return (
              <div key={doc.label} style={{ background: "white", borderRadius: 16, padding: 24, borderLeft: `5px solid ${dc.color}` }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 8 }}>{doc.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: dc.color }}>
                  {doc.fecha ? fmtFecha(doc.fecha) : "No registrado"}
                </div>
                {doc.dias !== null && (
                  <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: dc.color }}>
                    {doc.dias < 0 ? `Vencido hace ${Math.abs(doc.dias)} días` : doc.dias === 0 ? "Vence hoy" : `Vence en ${doc.dias} días`}
                  </div>
                )}
                {doc.dias !== null && doc.dias < 30 && doc.dias >= 0 && (
                  <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 8, background: dc.bg, fontSize: 12, fontWeight: 600, color: dc.color }}>
                    ⚠️ Renovar pronto
                  </div>
                )}
                {doc.dias !== null && doc.dias < 0 && (
                  <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 8, background: "#fee2e2", fontSize: 12, fontWeight: 700, color: "#991b1b" }}>
                    🚫 Vencido — no puede circular
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
