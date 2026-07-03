import { useEffect, useMemo, useState } from "react";
import type { ViewKey } from "../App";
import { useMotos } from "../hooks/useMotos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useTaller } from "../hooks/useTaller";
import { usePagos } from "../hooks/usePagos";
import { formatDiaPago } from "../utils/cicloPago";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }
function fmtFecha(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s.length === 10 ? s + "T00:00:00" : s).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}
function diasRestantes(fecha: string | null | undefined): number | null {
  if (!fecha) return null;
  return Math.ceil((new Date(fecha + "T00:00:00").getTime() - Date.now()) / 86400000);
}

const GRUPO_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  RASTREADOR: { bg: "#dbeafe", color: "#1d4ed8", border: "#3b82f6" },
  COSTA:      { bg: "#dcfce7", color: "#166534", border: "#22c55e" },
  PRADERA:    { bg: "#fef3c7", color: "#92400e", border: "#f59e0b" },
  OTRO:       { bg: "#f1f5f9", color: "#334155", border: "#94a3b8" },
};

const ESTADO_MOTO_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Disponible:  { bg: "#dcfce7", color: "#166534", border: "#16a34a" },
  Reservada:   { bg: "#e0f2fe", color: "#0369a1", border: "#0ea5e9" },
  Asignada:    { bg: "#dbeafe", color: "#1d4ed8", border: "#3b82f6" },
  Mantenimiento:{ bg: "#fef3c7", color: "#92400e", border: "#f59e0b" },
  Recuperada:  { bg: "#e0f2fe", color: "#0369a1", border: "#0ea5e9" },
  Fiscalia:    { bg: "#fee2e2", color: "#991b1b", border: "#dc2626" },
  Transito:    { bg: "#fee2e2", color: "#be123c", border: "#f43f5e" },
  Garantia:    { bg: "#f1f5f9", color: "#334155", border: "#94a3b8" },
  // legacy display names
  "En taller": { bg: "#fef3c7", color: "#92400e", border: "#f59e0b" },
  Suspendida:  { bg: "#ede9fe", color: "#6d28d9", border: "#8b5cf6" },
  Fiscalía:    { bg: "#fee2e2", color: "#991b1b", border: "#dc2626" },
  Tránsito:    { bg: "#fee2e2", color: "#be123c", border: "#f43f5e" },
  Garantía:    { bg: "#f1f5f9", color: "#334155", border: "#94a3b8" },
};

const ESTADO_C: Record<string, { bg: string; color: string }> = {
  Activo:       { bg: "#dcfce7", color: "#166534" },
  "En proceso": { bg: "#dbeafe", color: "#1d4ed8" },
  Finalizado:   { bg: "#e2e8f0", color: "#334155" },
  Cancelado:    { bg: "#fee2e2", color: "#991b1b" },
  Suspendido:   { bg: "#fef3c7", color: "#92400e" },
};

const TALLER_COLORS: Record<string, { bg: string; color: string }> = {
  Pendiente:          { bg: "#fef3c7", color: "#92400e" },
  "En diagnóstico":   { bg: "#dbeafe", color: "#1d4ed8" },
  "En reparación":    { bg: "#fee2e2", color: "#991b1b" },
  "Listo para salida":{ bg: "#dcfce7", color: "#166534" },
  Finalizado:         { bg: "#e2e8f0", color: "#334155" },
};

type Tab = "info" | "contrato" | "historial" | "taller";

function Badge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: bg, color, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function InfoRow({ label, value, mono, highlight }: { label: string; value: React.ReactNode; mono?: boolean; highlight?: { bg: string; color: string } }) {
  return (
    <div style={{ display: "flex", gap: 12, fontSize: 13, padding: "7px 0", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
      <span style={{ color: "#64748b", minWidth: 160, flexShrink: 0 }}>{label}</span>
      {highlight ? (
        <span style={{ fontWeight: 700, color: highlight.color, background: highlight.bg, padding: "2px 10px", borderRadius: 999, fontSize: 12 }}>{value}</span>
      ) : (
        <span style={{ fontWeight: 600, color: "#0f172a", fontFamily: mono ? "monospace" : undefined }}>{value ?? "—"}</span>
      )}
    </div>
  );
}

function Card({ children, borderColor }: { children: React.ReactNode; borderColor?: string }) {
  return (
    <div style={{
      background: "white", borderRadius: 16, padding: "18px 20px",
      boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
      borderLeft: borderColor ? `4px solid ${borderColor}` : undefined,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", marginBottom: 12 }}>
      {children}
    </div>
  );
}

function docColorFn(dias: number | null): { bg: string; color: string } {
  if (dias === null) return { bg: "#f1f5f9", color: "#94a3b8" };
  if (dias < 0)  return { bg: "#fee2e2", color: "#991b1b" };
  if (dias < 15) return { bg: "#fee2e2", color: "#991b1b" };
  if (dias < 30) return { bg: "#fef3c7", color: "#92400e" };
  return { bg: "#dcfce7", color: "#166534" };
}

export default function FichaMotoView({ motoId, onNavigate }: {
  motoId: string;
  onNavigate: (view: ViewKey, filter?: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("info");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

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
  const contratoActivo = useMemo(() => contratosMoto.find(c => c.estado === "Activo"), [contratosMoto]);
  const historialContratos = useMemo(() => contratosMoto.filter(c => c.estado !== "Activo"), [contratosMoto]);

  const ordenesTodo = useMemo(() =>
    taller.filter(t => t.moto_id === motoId).sort((a, b) => (b.fecha_ingreso ?? "").localeCompare(a.fecha_ingreso ?? "")),
    [taller, motoId]
  );

  if (!moto) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 64, gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>?</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#0f172a" }}>Moto no encontrada</div>
        <button onClick={() => onNavigate("motos", "")} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: "#0284c7", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          Volver a motos
        </button>
      </div>
    );
  }

  const ec = ESTADO_MOTO_COLORS[moto.estado] ?? { bg: "#e2e8f0", color: "#334155", border: "#94a3b8" };
  const gColor = GRUPO_COLORS[moto.grupo] ?? { bg: "#e2e8f0", color: "#334155", border: "#94a3b8" };
  const diasSoat = diasRestantes(moto.fecha_seguro);
  const diasTecno = diasRestantes(moto.fecha_tecnomecanica);
  const costoTotalTaller = ordenesTodo.reduce((s, t) => s + (t.costo ?? 0), 0);
  const clienteActivo = contratoActivo?.cliente_id ? clientes.find(cl => cl.id === contratoActivo.cliente_id) : null;

  const TABS: Array<{ key: Tab; label: string; count?: number }> = [
    { key: "info",     label: "Información" },
    { key: "contrato", label: "Contrato activo" },
    { key: "historial",label: "Historial",  count: historialContratos.length },
    { key: "taller",   label: "Taller",     count: ordenesTodo.length },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", paddingBottom: 40 }}>
      {/* Back */}
      <button
        onClick={() => onNavigate("motos", "")}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#0284c7", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "6px 0" }}
      >
        ← Volver a motos
      </button>

      {/* Hero card */}
      <div style={{ background: "white", borderRadius: 20, marginBottom: 20, boxShadow: "0 4px 24px rgba(15,23,42,0.10)", overflow: "hidden" }}>
        <div style={{ height: 5, background: `linear-gradient(90deg, ${ec.border}, ${gColor.border})` }} />
        <div style={{ padding: isMobile ? "18px 16px 20px" : "24px 28px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Placa */}
              <div style={{ fontSize: isMobile ? 28 : 38, fontWeight: 900, color: "#0f172a", letterSpacing: 2, lineHeight: 1, marginBottom: 4, fontFamily: "monospace" }}>
                {moto.placa}
              </div>
              <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 600, color: "#334155", marginBottom: 10 }}>
                {moto.marca} {moto.modelo}
                {(moto as { color?: string }).color ? ` · ${(moto as { color?: string }).color}` : ""}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge bg={ec.bg} color={ec.color}>{moto.estado}</Badge>
                <Badge bg={gColor.bg} color={gColor.color}>{moto.grupo}</Badge>
                <Badge bg={moto.condicion_ingreso === "nueva" ? "#dcfce7" : "#f1f5f9"} color={moto.condicion_ingreso === "nueva" ? "#166534" : "#64748b"}>
                  {moto.condicion_ingreso === "nueva" ? "Nueva" : "Usada"}
                </Badge>
              </div>
              {moto.propietario && (
                <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
                  Propietario: <strong style={{ color: "#0f172a" }}>{moto.propietario}</strong>
                </div>
              )}
            </div>
            {/* Doc expiry + taller */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flexShrink: 0 }}>
              {diasSoat !== null && (
                <div style={{ textAlign: "center", padding: "12px 14px", borderRadius: 14, background: docColorFn(diasSoat).bg, minWidth: 64 }}>
                  <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 900, color: docColorFn(diasSoat).color }}>
                    {diasSoat < 0 ? "VENC." : `${diasSoat}d`}
                  </div>
                  <div style={{ fontSize: 10, color: docColorFn(diasSoat).color, fontWeight: 700, marginTop: 2, textTransform: "uppercase" }}>SOAT</div>
                </div>
              )}
              {diasTecno !== null && (
                <div style={{ textAlign: "center", padding: "12px 14px", borderRadius: 14, background: docColorFn(diasTecno).bg, minWidth: 64 }}>
                  <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 900, color: docColorFn(diasTecno).color }}>
                    {diasTecno < 0 ? "VENC." : `${diasTecno}d`}
                  </div>
                  <div style={{ fontSize: 10, color: docColorFn(diasTecno).color, fontWeight: 700, marginTop: 2, textTransform: "uppercase" }}>Tecno.</div>
                </div>
              )}
              {costoTotalTaller > 0 && (
                <div style={{ textAlign: "center", padding: "12px 14px", borderRadius: 14, background: "#fef3c7", minWidth: 64 }}>
                  <div style={{ fontSize: isMobile ? 13 : 16, fontWeight: 900, color: "#92400e" }}>${fmt(costoTotalTaller)}</div>
                  <div style={{ fontSize: 10, color: "#92400e", fontWeight: 700, marginTop: 2, textTransform: "uppercase" }}>Taller</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e2e8f0", marginBottom: 20, overflowX: "auto", scrollbarWidth: "none" }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: isMobile ? "9px 12px" : "10px 18px",
              border: "none", background: "none", cursor: "pointer",
              fontSize: isMobile ? 12 : 13, fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? "#0284c7" : "#64748b",
              borderBottom: tab === t.key ? "2px solid #0284c7" : "2px solid transparent",
              marginBottom: -2, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5,
              transition: "color 0.15s",
            }}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span style={{
                background: tab === t.key ? "#0284c7" : "#e2e8f0",
                color: tab === t.key ? "white" : "#64748b",
                borderRadius: 999, padding: "1px 7px", fontSize: 10, fontWeight: 700,
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Info ── */}
      {tab === "info" && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
          <Card>
            <SectionTitle>Datos técnicos</SectionTitle>
            <InfoRow label="Número de motor" value={moto.numero_motor || "—"} mono />
            <InfoRow label="Número de chasis" value={moto.numero_chasis || "—"} mono />
            <InfoRow label="Cilindraje" value={moto.cilindraje ? `${moto.cilindraje} cc` : "—"} />
            <InfoRow label="Condición de ingreso" value={moto.condicion_ingreso ?? "—"} />
            <InfoRow label="Km inicial" value={(moto as { kilometraje_inicial?: number | null }).kilometraje_inicial ? `${(moto as { kilometraje_inicial?: number | null }).kilometraje_inicial?.toLocaleString("es-CO")} km` : "—"} />
            <InfoRow label="Lugar de matrícula" value={moto.lugar_matricula || "—"} />
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card>
              <SectionTitle>Documentos de circulacion</SectionTitle>
              {[
                { label: "SOAT — vencimiento", fecha: moto.fecha_seguro, dias: diasSoat },
                { label: "Tecnomecánica — vencimiento", fecha: moto.fecha_tecnomecanica, dias: diasTecno },
              ].map(doc => {
                const dc = docColorFn(doc.dias);
                const label = doc.dias === null ? "No registrado" : doc.dias < 0 ? `Vencido hace ${Math.abs(doc.dias)} días` : doc.dias === 0 ? "Vence hoy" : `${doc.dias} días restantes`;
                return (
                  <div key={doc.label} style={{ display: "flex", gap: 12, alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{doc.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{fmtFecha(doc.fecha)}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: dc.bg, color: dc.color, whiteSpace: "nowrap" }}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </Card>

            {(moto.observaciones || moto.retencion_fecha) && (
              <Card>
                <SectionTitle>Estado y ubicacion</SectionTitle>
                {moto.retencion_fecha && (
                  <InfoRow label="Fecha retención" value={fmtFecha(moto.retencion_fecha)} highlight={{ bg: "#fee2e2", color: "#991b1b" }} />
                )}
                {moto.retencion_numero_caso && (
                  <InfoRow label="N° caso retención" value={moto.retencion_numero_caso} mono />
                )}
                {moto.retencion_detalle && (
                  <InfoRow label="Detalle retención" value={moto.retencion_detalle} />
                )}
                {moto.observaciones && (
                  <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: "#f8fafc", fontSize: 13, color: "#334155" }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 }}>Observaciones</div>
                    {moto.observaciones}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Contrato activo ── */}
      {tab === "contrato" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!contratoActivo ? (
            <Card>
              <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Sin contrato activo</div>
                <div style={{ fontSize: 13 }}>Esta moto no tiene un contrato vigente en este momento.</div>
              </div>
            </Card>
          ) : (
            <>
              {clienteActivo && (
                <Card borderColor="#0284c7">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Cliente</div>
                      <button
                        onClick={() => onNavigate("ficha_cliente", clienteActivo.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
                      >
                        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#0284c7", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {clienteActivo.nombre}
                        </div>
                      </button>
                      <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>CC {clienteActivo.cedula} · {clienteActivo.telefono}</div>
                      <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <Badge bg="#dcfce7" color="#166534">{contratoActivo.estado}</Badge>
                        <Badge bg="#dbeafe" color="#1d4ed8">{contratoActivo.forma_pago}</Badge>
                        {contratoActivo.dia_pago && <Badge bg="#f1f5f9" color="#64748b">Pago: {formatDiaPago(contratoActivo)}</Badge>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {(() => {
                        const totalPagado = pagos.filter(p => p.contrato_id === contratoActivo.id && p.estado === "Confirmado").reduce((s, p) => s + p.valor, 0);
                        return (
                          <>
                            <div style={{ fontSize: 20, fontWeight: 900, color: "#166534" }}>${fmt(totalPagado)}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>total pagado</div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </Card>
              )}

              <Card>
                <SectionTitle>Detalles del contrato</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 12 }}>
                  {[
                    { label: "Fecha entrega", val: fmtFecha(contratoActivo.fecha_entrega) },
                    { label: "Valor período", val: contratoActivo.valor_semanal > 0 ? `$${fmt(contratoActivo.valor_semanal)}` : "—" },
                    { label: "Tarifa diaria", val: contratoActivo.tarifa_diaria ? `$${fmt(contratoActivo.tarifa_diaria)}` : "—" },
                    { label: "Ahorro diario", val: contratoActivo.ahorro_diario ? `$${fmt(contratoActivo.ahorro_diario)}` : "—" },
                  ].map(item => (
                    <div key={item.label} style={{ padding: "10px 12px", borderRadius: 10, background: "#f8fafc" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{item.val}</div>
                    </div>
                  ))}
                </div>

                {contratoActivo.tipo_ruta === "diario" && (contratoActivo.ahorro_acumulado !== undefined) && (
                  <div style={{ marginTop: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", marginBottom: 5 }}>
                      <span>Progreso ahorro base inicial</span>
                      <strong style={{ color: (contratoActivo.ahorro_acumulado ?? 0) >= 510000 ? "#166534" : "#0f172a" }}>
                        ${fmt(contratoActivo.ahorro_acumulado ?? 0)} / $510.000
                      </strong>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 999,
                        width: `${Math.min(100, ((contratoActivo.ahorro_acumulado ?? 0) / 510000) * 100)}%`,
                        background: (contratoActivo.ahorro_acumulado ?? 0) >= 510000 ? "#16a34a" : "#0284c7",
                        transition: "width 0.5s",
                      }} />
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      )}

      {/* ── Tab: Historial ── */}
      {tab === "historial" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {historialContratos.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>Sin historial de contratos.</div></Card>
          ) : historialContratos.map(c => {
            const cliente = clientes.find(cl => cl.id === c.cliente_id);
            const cEc = ESTADO_C[c.estado] ?? { bg: "#e2e8f0", color: "#334155" };
            const pagosContrato = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado").reduce((s, p) => s + p.valor, 0);
            return (
              <Card key={c.id} borderColor={cEc.color}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    {cliente ? (
                      <button
                        onClick={() => onNavigate("ficha_cliente", cliente.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#0284c7", fontWeight: 800, fontSize: 15, padding: 0, textTransform: "uppercase", textAlign: "left" }}
                      >
                        {cliente.nombre}
                      </button>
                    ) : (
                      <div style={{ fontWeight: 700, color: "#64748b", fontSize: 14 }}>Cliente desconocido</div>
                    )}
                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      <Badge bg={cEc.bg} color={cEc.color}>{c.estado}</Badge>
                      <Badge bg="#f1f5f9" color="#334155">{c.forma_pago}</Badge>
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
                      {c.fecha_entrega && `Entrega: ${fmtFecha(c.fecha_entrega)}`}
                      {c.valor_semanal > 0 && ` · $${fmt(c.valor_semanal)}`}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#166534" }}>${fmt(pagosContrato)}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>total pagado</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Tab: Taller ── */}
      {tab === "taller" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {costoTotalTaller > 0 && (
            <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fef3c7", fontSize: 13, fontWeight: 700, color: "#92400e", display: "flex", justifyContent: "space-between" }}>
              <span>{ordenesTodo.length} orden{ordenesTodo.length !== 1 ? "es" : ""} de taller</span>
              <span>Costo total: ${fmt(costoTotalTaller)}</span>
            </div>
          )}
          {ordenesTodo.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>Sin órdenes de taller registradas.</div></Card>
          ) : ordenesTodo.map(t => {
            const tc = TALLER_COLORS[t.estado_tecnico] ?? { bg: "#e2e8f0", color: "#334155" };
            const entrada = t.fecha_ingreso ? new Date(t.fecha_ingreso + "T00:00:00") : null;
            const salida = t.fecha_salida ? new Date(t.fecha_salida + "T00:00:00") : new Date();
            const dias = entrada ? Math.floor((salida.getTime() - entrada.getTime()) / 86400000) : 0;
            return (
              <Card key={t.id} borderColor={tc.color}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      <Badge bg={tc.bg} color={tc.color}>{t.estado_tecnico}</Badge>
                      <span style={{ fontSize: 12, color: "#94a3b8", alignSelf: "center" }}>
                        {fmtFecha(t.fecha_ingreso)} → {t.fecha_salida ? fmtFecha(t.fecha_salida) : "En curso"} ({dias}d)
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{t.detalle}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#0284c7" }}>${fmt(t.costo ?? 0)}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>costo</div>
                  </div>
                </div>
                {t.repuestos && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {t.repuestos.split(",").map((r, i) => (
                      <span key={i} style={{ padding: "3px 10px", borderRadius: 999, background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: 12, color: "#334155" }}>
                        {r.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
