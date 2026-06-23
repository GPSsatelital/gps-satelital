import { useMemo, useState } from "react";
import type { ViewKey } from "../App";
import { useClientes, type ClienteEstado } from "../hooks/useClientes";
import { useContratos } from "../hooks/useContratos";
import { usePagos } from "../hooks/usePagos";
import { useDeudas } from "../hooks/useDeudas";
import { useConvenios } from "../hooks/useConvenios";
import { useVisitas } from "../hooks/useVisitas";
import { useGestiones } from "../hooks/useGestiones";
import { useMotos } from "../hooks/useMotos";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }
function fmtFecha(s: string | null) {
  if (!s) return "—";
  return new Date(s + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

const ESTADO_COLORS: Record<ClienteEstado, { bg: string; color: string }> = {
  "En proceso": { bg: "#e2e8f0", color: "#334155" },
  "Listo para visita": { bg: "#dbeafe", color: "#1d4ed8" },
  "Pendiente evaluación": { bg: "#fef3c7", color: "#92400e" },
  Aprobado: { bg: "#dcfce7", color: "#166534" },
  Rechazado: { bg: "#fee2e2", color: "#991b1b" },
  Activo: { bg: "#dcfce7", color: "#166534" },
  "En seguimiento": { bg: "#e0f2fe", color: "#0369a1" },
  "En riesgo": { bg: "#fef3c7", color: "#92400e" },
  "En mora": { bg: "#fee2e2", color: "#991b1b" },
  Retirado: { bg: "#ede9fe", color: "#6d28d9" },
  "Lista negra": { bg: "#1f2937", color: "#f9fafb" },
  "Inmovilización documentación incompleta": { bg: "#fee2e2", color: "#7f1d1d" },
};

type Tab = "resumen" | "contratos" | "pagos" | "deudas" | "convenios" | "visitas" | "gestiones";

const TIPO_GESTION_LABEL: Record<string, string> = {
  mensaje_recordatorio: "💬 Recordatorio",
  llamada: "📞 Llamada",
  whatsapp: "💬 WhatsApp",
  sirena: "🚨 Sirena",
  visita: "🏠 Visita",
  plazo_extra: "⏰ Plazo extra",
  recoleccion: "🔴 Recolección",
  cobro_campo: "💵 Cobro campo",
  otro: "📋 Otro",
};

export default function FichaClienteView({ clienteId, onNavigate }: {
  clienteId: string;
  onNavigate: (view: ViewKey, filter?: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("resumen");

  const { clientes } = useClientes();
  const { contratos } = useContratos();
  const { pagos } = usePagos();
  const { deudas } = useDeudas();
  const { convenios } = useConvenios();
  const { visitas } = useVisitas();
  const { gestiones } = useGestiones();
  const { motos } = useMotos();

  const cliente = clientes.find(c => c.id === clienteId);

  const contratosCliente = useMemo(() =>
    contratos.filter(c => c.cliente_id === clienteId).sort((a, b) => (b.fecha_entrega ?? "").localeCompare(a.fecha_entrega ?? "")),
    [contratos, clienteId]
  );
  const contratoIds = useMemo(() => new Set(contratosCliente.map(c => c.id)), [contratosCliente]);

  const pagosCliente = useMemo(() =>
    pagos.filter(p => contratoIds.has(p.contrato_id)).sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [pagos, contratoIds]
  );

  const deudasCliente = useMemo(() =>
    deudas.filter(d => contratoIds.has(d.contrato_id)),
    [deudas, contratoIds]
  );

  const conveniosCliente = useMemo(() =>
    convenios.filter(c => contratoIds.has(c.contrato_id)).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [convenios, contratoIds]
  );

  const visitasCliente = useMemo(() =>
    visitas.filter(v => v.cliente_id === clienteId).sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [visitas, clienteId]
  );

  const gestionesCliente = useMemo(() =>
    gestiones.filter(g => contratoIds.has(g.contrato_id)).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [gestiones, contratoIds]
  );

  const totalPagado = useMemo(() =>
    pagosCliente.filter(p => p.estado === "Confirmado").reduce((s, p) => s + p.valor, 0),
    [pagosCliente]
  );
  const deudaActiva = useMemo(() =>
    deudasCliente.filter(d => d.estado !== "pagada").reduce((s, d) => s + d.monto_pendiente, 0),
    [deudasCliente]
  );

  if (!cliente) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <div style={{ fontWeight: 700 }}>Cliente no encontrado</div>
        <button onClick={() => onNavigate("clientes")} style={{ marginTop: 16, padding: "8px 18px", borderRadius: 10, border: "none", background: "#0284c7", color: "white", fontWeight: 700, cursor: "pointer" }}>← Volver</button>
      </div>
    );
  }

  const estadoColors = ESTADO_COLORS[cliente.estado as ClienteEstado] ?? { bg: "#e2e8f0", color: "#334155" };

  const TABS: Array<{ key: Tab; label: string; count?: number }> = [
    { key: "resumen", label: "Resumen" },
    { key: "contratos", label: "Contratos", count: contratosCliente.length },
    { key: "pagos", label: "Pagos", count: pagosCliente.length },
    { key: "deudas", label: "Deudas", count: deudasCliente.filter(d => d.estado !== "pagada").length },
    { key: "convenios", label: "Convenios", count: conveniosCliente.length },
    { key: "visitas", label: "Visitas", count: visitasCliente.length },
    { key: "gestiones", label: "Gestiones", count: gestionesCliente.length },
  ];

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Back button */}
      <button
        onClick={() => onNavigate("clientes")}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#0284c7", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: 0 }}
      >
        ← Volver a clientes
      </button>

      {/* Header card */}
      <div style={{ background: "white", borderRadius: 20, padding: "20px 24px", marginBottom: 20, boxShadow: "0 4px 20px rgba(15,23,42,0.08)", borderLeft: `5px solid ${estadoColors.color}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.5 }}>{cliente.nombre}</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8, fontSize: 14, color: "#64748b" }}>
              <span>🪪 {cliente.cedula}</span>
              {cliente.telefono && <span>📱 {cliente.telefono}</span>}
              {cliente.whatsapp && !cliente.mismo_whatsapp && <span>💬 {cliente.whatsapp}</span>}
              {cliente.direccion && <span>📍 {cliente.direccion}</span>}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: estadoColors.bg, color: estadoColors.color }}>{cliente.estado}</span>
              <span style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: cliente.ruta_contrato === "diario" ? "#dbeafe" : "#dcfce7", color: cliente.ruta_contrato === "diario" ? "#1d4ed8" : "#166534" }}>
                {cliente.ruta_contrato === "diario" ? "Ruta diaria" : "Tiempo definido"}
              </span>
              {cliente.lista_negra && <span style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: "#1f2937", color: "#f9fafb" }}>🚫 Lista negra</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
            <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 14, background: "#dcfce7" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#166534" }}>${fmt(totalPagado)}</div>
              <div style={{ fontSize: 11, color: "#166534", fontWeight: 700, marginTop: 2 }}>Total pagado</div>
            </div>
            {deudaActiva > 0 && (
              <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 14, background: "#fee2e2" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#991b1b" }}>${fmt(deudaActiva)}</div>
                <div style={{ fontSize: 11, color: "#991b1b", fontWeight: 700, marginTop: 2 }}>Deuda activa</div>
              </div>
            )}
            {(cliente.referidos_confirmados ?? 0) > 0 && (
              <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 14, background: "#fef3c7" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#92400e" }}>{cliente.referidos_confirmados}</div>
                <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700, marginTop: 2 }}>Referidos</div>
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
              padding: "9px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? "#0284c7" : "#64748b",
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

      {/* Tab: Resumen */}
      {tab === "resumen" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14, color: "#0f172a" }}>Datos personales</div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                ["Nombre", cliente.nombre.toUpperCase()],
                ["Cédula", cliente.cedula],
                ["Teléfono", cliente.telefono || "—"],
                ["WhatsApp", cliente.mismo_whatsapp ? cliente.telefono : (cliente.whatsapp || "—")],
                ["Dirección", cliente.direccion || "—"],
                ["Fuente de llegada", cliente.fuente_llegada || "—"],
                ["Registrado", fmtFecha(cliente.created_at?.slice(0, 10))],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                  <span style={{ color: "#64748b", minWidth: 130, flexShrink: 0 }}>{k}</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {(cliente.acompanante_nombre) && (
            <div style={{ background: "white", borderRadius: 16, padding: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14, color: "#0f172a" }}>Acompañante</div>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  ["Nombre", (cliente.acompanante_nombre ?? "").toUpperCase()],
                  ["Cédula", cliente.acompanante_cedula || "—"],
                  ["Teléfono", cliente.acompanante_telefono || "—"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                    <span style={{ color: "#64748b", minWidth: 130, flexShrink: 0 }}>{k}</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(cliente.referido_por_nombre || cliente.referido_por_cedula) && (
            <div style={{ background: "white", borderRadius: 16, padding: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14, color: "#0f172a" }}>Referido por</div>
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
                  <span style={{ color: "#64748b", minWidth: 130 }}>Nombre</span>
                  <span style={{ fontWeight: 600, textTransform: "uppercase" }}>{cliente.referido_por_nombre || "—"}</span>
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
                  <span style={{ color: "#64748b", minWidth: 130 }}>Cédula</span>
                  <span style={{ fontWeight: 600 }}>{cliente.referido_por_cedula || "—"}</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ background: "white", borderRadius: 16, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14, color: "#0f172a" }}>Documentos cliente</div>
            {(() => {
              const docs = (cliente.documentos_cliente ?? {}) as Record<string, { ok: boolean }>;
              const labels: Array<[string, string]> = [
                ["cedula", "Cédula"], ["licencia", "Licencia"], ["recibo1", "Recibo 1"],
                ["recibo2", "Recibo 2"], ["carta", "Carta"], ["antecedentes", "Antecedentes"], ["hojaVida", "Hoja de vida"],
              ];
              return (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {labels.map(([key, label]) => {
                    const ok = docs[key]?.ok === true;
                    return (
                      <span key={key} style={{ padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: ok ? "#dcfce7" : "#f1f5f9", color: ok ? "#166534" : "#94a3b8" }}>
                        {ok ? "✓" : "○"} {label}
                      </span>
                    );
                  })}
                </div>
              );
            })()}
            {cliente.excepcion_documental && (
              <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 10, background: "#fef3c7", fontSize: 12, color: "#92400e", fontWeight: 600 }}>
                ⚠️ Excepción documental: {cliente.excepcion_motivo}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Contratos */}
      {tab === "contratos" && (
        <div style={{ display: "grid", gap: 12 }}>
          {contratosCliente.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, background: "white", borderRadius: 16, color: "#64748b" }}>Sin contratos registrados.</div>
          ) : contratosCliente.map(c => {
            const moto = c.moto_id ? motos.find(m => m.id === c.moto_id) : null;
            const ESTADO_C: Record<string, { bg: string; color: string }> = {
              Activo: { bg: "#dcfce7", color: "#166534" }, "En proceso": { bg: "#dbeafe", color: "#1d4ed8" },
              Finalizado: { bg: "#e2e8f0", color: "#334155" }, Cancelado: { bg: "#fee2e2", color: "#991b1b" },
              Suspendido: { bg: "#fef3c7", color: "#92400e" },
            };
            const ec = ESTADO_C[c.estado] ?? { bg: "#e2e8f0", color: "#334155" };
            const pagosC = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado").reduce((s, p) => s + p.valor, 0);
            const ahorro = (c as Record<string, unknown>).ahorro_acumulado as number | undefined;
            return (
              <div key={c.id} style={{ background: "white", borderRadius: 16, padding: 20, borderLeft: `4px solid ${ec.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    {moto ? (
                      <button
                        onClick={() => onNavigate("ficha_moto", moto.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#0284c7", fontWeight: 800, fontSize: 16, padding: 0 }}
                      >
                        🏍️ {moto.placa} — {moto.marca} {moto.modelo}
                      </button>
                    ) : (
                      <div style={{ fontWeight: 700, color: "#64748b", fontSize: 15 }}>Sin moto asignada</div>
                    )}
                    <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                      <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: ec.bg, color: ec.color }}>{c.estado}</span>
                      <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "#f1f5f9", color: "#64748b" }}>{c.forma_pago}</span>
                      {c.dia_pago && <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, color: "#64748b" }}>Día de pago: {c.dia_pago}</span>}
                    </div>
                    <div style={{ display: "grid", gap: 4, marginTop: 10, fontSize: 13, color: "#64748b" }}>
                      {c.fecha_entrega && <span>Entregada: {fmtFecha(c.fecha_entrega)}</span>}
                      {c.valor_semanal && <span>Valor semanal: <strong style={{ color: "#0f172a" }}>${fmt(c.valor_semanal)}</strong></span>}
                    </div>
                    {c.tipo_ruta === "diario" && ahorro !== undefined && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Ahorro acumulado: ${fmt(ahorro)} / $510.000 ({Math.min(100, Math.round((ahorro / 510000) * 100))}%)</div>
                        <div style={{ height: 6, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 999, width: `${Math.min(100, (ahorro / 510000) * 100)}%`, background: "#0284c7" }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#166534" }}>${fmt(pagosC)}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>total pagado</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Pagos */}
      {tab === "pagos" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Confirmados", val: pagosCliente.filter(p => p.estado === "Confirmado").reduce((s, p) => s + p.valor, 0), color: "#166534", bg: "#dcfce7" },
              { label: "Efectivo", val: pagosCliente.filter(p => p.estado === "Confirmado" && p.metodo === "Efectivo").reduce((s, p) => s + p.valor, 0), color: "#166534", bg: "#f0fdf4" },
              { label: "Transferencia", val: pagosCliente.filter(p => p.estado === "Confirmado" && p.metodo === "Transferencia").reduce((s, p) => s + p.valor, 0), color: "#1d4ed8", bg: "#dbeafe" },
              { label: "Pendientes", val: pagosCliente.filter(p => p.estado === "Pendiente").reduce((s, p) => s + p.valor, 0), color: "#92400e", bg: "#fef3c7" },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: kpi.bg, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: kpi.color, textTransform: "uppercase" }}>{kpi.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: kpi.color, marginTop: 4 }}>${fmt(kpi.val)}</div>
              </div>
            ))}
          </div>
          {pagosCliente.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, background: "white", borderRadius: 16, color: "#64748b" }}>Sin pagos registrados.</div>
          ) : (
            <div style={{ background: "white", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Fecha", "Moto", "Método", "Tipo", "Estado", "Valor"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagosCliente.map(p => {
                      const c = contratos.find(ct => ct.id === p.contrato_id);
                      const moto = c?.moto_id ? motos.find(m => m.id === c.moto_id) : null;
                      const estadoP = p.estado === "Confirmado" ? { bg: "#dcfce7", color: "#166534" } : p.estado === "Pendiente" ? { bg: "#fef3c7", color: "#92400e" } : { bg: "#f1f5f9", color: "#64748b" };
                      return (
                        <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "10px 14px", color: "#64748b", whiteSpace: "nowrap" }}>{fmtFecha(p.fecha)}</td>
                          <td style={{ padding: "10px 14px", fontWeight: 700 }}>
                            {moto ? (
                              <button onClick={() => onNavigate("ficha_moto", moto.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0284c7", fontWeight: 700, padding: 0 }}>
                                {moto.placa}
                              </button>
                            ) : "—"}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: p.metodo === "Efectivo" ? "#dcfce7" : "#dbeafe", color: p.metodo === "Efectivo" ? "#166534" : "#1d4ed8" }}>
                              {p.metodo}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", color: "#64748b", fontSize: 12 }}>{p.tipo_registro}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: estadoP.bg, color: estadoP.color }}>{p.estado}</span>
                          </td>
                          <td style={{ padding: "10px 14px", fontWeight: 800, color: "#0f172a", textAlign: "right" }}>${fmt(p.valor)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Deudas */}
      {tab === "deudas" && (
        <div style={{ display: "grid", gap: 12 }}>
          {deudasCliente.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, background: "white", borderRadius: 16, color: "#64748b" }}>Sin deudas registradas.</div>
          ) : deudasCliente.map(d => {
            const ec = d.estado === "pendiente" ? { bg: "#fee2e2", color: "#991b1b" } : d.estado === "en_convenio" ? { bg: "#fef3c7", color: "#92400e" } : { bg: "#dcfce7", color: "#166534" };
            return (
              <div key={d.id} style={{ background: "white", borderRadius: 14, padding: "16px 20px", borderLeft: `4px solid ${ec.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{d.descripcion}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{d.concepto.replace(/_/g, " ")}</div>
                    <span style={{ display: "inline-block", marginTop: 8, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: ec.bg, color: ec.color }}>{d.estado}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: ec.color }}>${fmt(d.monto_pendiente)}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>de ${fmt(d.monto)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Convenios */}
      {tab === "convenios" && (
        <div style={{ display: "grid", gap: 12 }}>
          {conveniosCliente.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, background: "white", borderRadius: 16, color: "#64748b" }}>Sin convenios registrados.</div>
          ) : conveniosCliente.map(cv => {
            const ec = cv.estado === "activo" ? { bg: "#dbeafe", color: "#1d4ed8" } : cv.estado === "cumplido" ? { bg: "#dcfce7", color: "#166534" } : cv.estado === "incumplido" ? { bg: "#fee2e2", color: "#991b1b" } : { bg: "#f1f5f9", color: "#334155" };
            const pct = cv.numero_cuotas > 0 ? Math.round((cv.cuotas_pagadas / cv.numero_cuotas) * 100) : 0;
            return (
              <div key={cv.id} style={{ background: "white", borderRadius: 14, padding: "16px 20px", borderLeft: `4px solid ${ec.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, fontSize: 14 }}>Convenio #{cv.numero_convenio}</span>
                      <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: ec.bg, color: ec.color }}>{cv.estado}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>{cv.concepto}</div>
                    <div style={{ fontSize: 13, marginTop: 4, color: "#334155" }}>
                      Cuota: <strong>${fmt(cv.cuota_por_periodo)}</strong> · {cv.cuotas_pagadas}/{cv.numero_cuotas} cuotas · Vence: {fmtFecha(cv.fecha_limite)}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 6, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: ec.color }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{pct}% pagado</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>${fmt(cv.deuda_total)}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>deuda total</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Visitas */}
      {tab === "visitas" && (
        <div style={{ display: "grid", gap: 12 }}>
          {visitasCliente.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, background: "white", borderRadius: 16, color: "#64748b" }}>Sin visitas registradas.</div>
          ) : visitasCliente.map(v => {
            const rColor = v.resultado === "Aprobado" ? "#166534" : v.resultado === "Rechazado" ? "#991b1b" : "#92400e";
            const rBg = v.resultado === "Aprobado" ? "#dcfce7" : v.resultado === "Rechazado" ? "#fee2e2" : "#fef3c7";
            return (
              <div key={v.id} style={{ background: "white", borderRadius: 14, padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Visita — {fmtFecha(v.fecha)}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: v.estado === "Realizada" ? "#dcfce7" : "#fef3c7", color: v.estado === "Realizada" ? "#166534" : "#92400e" }}>{v.estado}</span>
                      {v.resultado && <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: rBg, color: rColor }}>{v.resultado}</span>}
                    </div>
                  </div>
                  {v.ubicacion && <div style={{ fontSize: 12, color: "#64748b" }}>📍 {v.ubicacion.lat.toFixed(4)}, {v.ubicacion.lng.toFixed(4)}</div>}
                </div>
                {v.entrevista && (
                  <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
                    {[
                      ["¿Vive allí?", v.entrevista.viveAlli],
                      ["Tiempo residencia", v.entrevista.tiempoResidencia],
                      ["Tipo vivienda", v.entrevista.tipoVivienda],
                      ["Composición familiar", v.entrevista.composicionFamiliar],
                      ["Estabilidad laboral", v.entrevista.estabilidadLaboral],
                      ["Observaciones", v.entrevista.observaciones],
                      ["Recomendación", v.entrevista.recomendacion],
                    ].filter(([, val]) => val).map(([k, val]) => (
                      <div key={k} style={{ display: "flex", gap: 10 }}>
                        <span style={{ color: "#64748b", minWidth: 150, flexShrink: 0 }}>{k}</span>
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Gestiones */}
      {tab === "gestiones" && (
        <div style={{ display: "grid", gap: 10 }}>
          {gestionesCliente.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, background: "white", borderRadius: 16, color: "#64748b" }}>Sin gestiones de cobro registradas.</div>
          ) : gestionesCliente.map(g => (
            <div key={g.id} style={{ background: "white", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {(TIPO_GESTION_LABEL[g.tipo] ?? "📋 ").split(" ")[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{TIPO_GESTION_LABEL[g.tipo] ?? g.tipo}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{fmtFecha(g.fecha)}</span>
                </div>
                {g.resultado && <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{g.resultado}</div>}
                {g.plazo_extra_dias && (
                  <div style={{ fontSize: 12, color: "#92400e", marginTop: 4 }}>
                    ⏰ Plazo extra: {g.plazo_extra_dias} días — {g.plazo_extra_motivo}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
