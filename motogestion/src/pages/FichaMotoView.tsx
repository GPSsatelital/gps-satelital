import { useEffect, useMemo, useState } from "react";
import type { ViewKey } from "../App";
import { useMotos } from "../hooks/useMotos";
import { useContratos, ahorroTotal } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useTaller } from "../hooks/useTaller";
import { usePagos } from "../hooks/usePagos";
import { usePrestamos } from "../hooks/usePrestamos";
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
  RASTREADOR: { bg: "var(--accent-soft3)", color: "var(--accent-ink)", border: "#3b82f6" },
  COSTA:      { bg: "var(--ok-soft)", color: "var(--ok-ink)", border: "var(--ok)" },
  PRADERA:    { bg: "var(--warn-soft)", color: "var(--warn-ink)", border: "var(--warn2)" },
  OTRO:       { bg: "var(--soft)", color: "var(--muted2)", border: "var(--faint)" },
};

const ESTADO_MOTO_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Disponible:  { bg: "var(--ok-soft)", color: "var(--ok-ink)", border: "var(--ok)" },
  Reservada:   { bg: "var(--accent-soft)", color: "var(--accent-ink)", border: "#0ea5e9" },
  Asignada:    { bg: "var(--accent-soft3)", color: "var(--accent-ink)", border: "#3b82f6" },
  Mantenimiento:{ bg: "var(--warn-soft)", color: "var(--warn-ink)", border: "var(--warn2)" },
  Recuperada:  { bg: "var(--accent-soft)", color: "var(--accent-ink)", border: "#0ea5e9" },
  Fiscalia:    { bg: "var(--bad-soft)", color: "var(--bad-ink)", border: "var(--bad)" },
  Transito:    { bg: "var(--bad-soft)", color: "var(--bad)", border: "#f43f5e" },
  Garantia:    { bg: "var(--soft)", color: "var(--muted2)", border: "var(--faint)" },
  // legacy display names
  "En taller": { bg: "var(--warn-soft)", color: "var(--warn-ink)", border: "var(--warn2)" },
  Suspendida:  { bg: "var(--indigo-soft)", color: "var(--violet)", border: "var(--violet)" },
  Fiscalía:    { bg: "var(--bad-soft)", color: "var(--bad-ink)", border: "var(--bad)" },
  Tránsito:    { bg: "var(--bad-soft)", color: "var(--bad)", border: "#f43f5e" },
  Garantía:    { bg: "var(--soft)", color: "var(--muted2)", border: "var(--faint)" },
};

const ESTADO_C: Record<string, { bg: string; color: string }> = {
  Activo:       { bg: "var(--ok-soft)", color: "var(--ok-ink)" },
  "En proceso": { bg: "var(--accent-soft3)", color: "var(--accent-ink)" },
  Finalizado:   { bg: "var(--line)", color: "var(--muted2)" },
  Cancelado:    { bg: "var(--bad-soft)", color: "var(--bad-ink)" },
  Suspendido:   { bg: "var(--warn-soft)", color: "var(--warn-ink)" },
};

const TALLER_COLORS: Record<string, { bg: string; color: string }> = {
  Pendiente:          { bg: "var(--warn-soft)", color: "var(--warn-ink)" },
  "En diagnóstico":   { bg: "var(--accent-soft3)", color: "var(--accent-ink)" },
  "En reparación":    { bg: "var(--bad-soft)", color: "var(--bad-ink)" },
  "Listo para salida":{ bg: "var(--ok-soft)", color: "var(--ok-ink)" },
  Finalizado:         { bg: "var(--line)", color: "var(--muted2)" },
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
    <div style={{ display: "flex", gap: 12, fontSize: 13, padding: "7px 0", borderBottom: "1px solid var(--soft)", alignItems: "center" }}>
      <span style={{ color: "var(--muted)", minWidth: 160, flexShrink: 0 }}>{label}</span>
      {highlight ? (
        <span style={{ fontWeight: 700, color: highlight.color, background: highlight.bg, padding: "2px 10px", borderRadius: 999, fontSize: 12 }}>{value}</span>
      ) : (
        <span style={{ fontWeight: 600, color: "var(--text)", fontFamily: mono ? "monospace" : undefined }}>{value ?? "—"}</span>
      )}
    </div>
  );
}

function Card({ children, borderColor }: { children: React.ReactNode; borderColor?: string }) {
  return (
    <div style={{
      background: "var(--card)", borderRadius: 16, padding: "18px 20px",
      boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
      borderLeft: borderColor ? `4px solid ${borderColor}` : undefined,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 12 }}>
      {children}
    </div>
  );
}

function docColorFn(dias: number | null): { bg: string; color: string } {
  if (dias === null) return { bg: "var(--soft)", color: "var(--faint)" };
  if (dias < 0)  return { bg: "var(--bad-soft)", color: "var(--bad-ink)" };
  if (dias < 15) return { bg: "var(--bad-soft)", color: "var(--bad-ink)" };
  if (dias < 30) return { bg: "var(--warn-soft)", color: "var(--warn-ink)" };
  return { bg: "var(--ok-soft)", color: "var(--ok-ink)" };
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
  const { prestamos } = usePrestamos();

  // Préstamos donde esta moto participó (prestada a alguien, o reemplazada por otra).
  const prestamosMoto = useMemo(() =>
    prestamos.filter(p => p.moto_prestada_id === motoId || p.moto_original_id === motoId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [prestamos, motoId]
  );

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
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>?</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text)" }}>Moto no encontrada</div>
        <button onClick={() => onNavigate("motos", "")} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: "var(--accent)", color: "var(--card)", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          Volver a motos
        </button>
      </div>
    );
  }

  const ec = ESTADO_MOTO_COLORS[moto.estado] ?? { bg: "var(--line)", color: "var(--muted2)", border: "var(--faint)" };
  const gColor = GRUPO_COLORS[moto.grupo] ?? { bg: "var(--line)", color: "var(--muted2)", border: "var(--faint)" };
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
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "6px 0" }}
      >
        ← Volver a motos
      </button>

      {/* Hero card */}
      <div style={{ background: "var(--card)", borderRadius: 20, marginBottom: 20, boxShadow: "0 4px 24px rgba(15,23,42,0.10)", overflow: "hidden" }}>
        <div style={{ height: 5, background: `linear-gradient(90deg, ${ec.border}, ${gColor.border})` }} />
        <div style={{ padding: isMobile ? "18px 16px 20px" : "24px 28px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Placa */}
              <div style={{ fontSize: isMobile ? 28 : 38, fontWeight: 700, color: "var(--text)", letterSpacing: 2, lineHeight: 1, marginBottom: 4, fontFamily: "monospace" }}>
                {moto.placa}
              </div>
              <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 600, color: "var(--muted2)", marginBottom: 10 }}>
                {moto.marca} {moto.modelo}
                {(moto as { color?: string }).color ? ` · ${(moto as { color?: string }).color}` : ""}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge bg={ec.bg} color={ec.color}>{moto.estado}</Badge>
                <Badge bg={gColor.bg} color={gColor.color}>{moto.grupo}</Badge>
                <Badge bg={moto.condicion_ingreso === "nueva" ? "var(--ok-soft)" : "var(--soft)"} color={moto.condicion_ingreso === "nueva" ? "var(--ok-ink)" : "var(--muted)"}>
                  {moto.condicion_ingreso === "nueva" ? "Nueva" : "Usada"}
                </Badge>
              </div>
              {moto.propietario && (
                <div style={{ marginTop: 8, fontSize: 13, color: "var(--muted)" }}>
                  Propietario: <strong style={{ color: "var(--text)" }}>{moto.propietario}</strong>
                </div>
              )}
            </div>
            {/* Doc expiry + taller */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flexShrink: 0 }}>
              {diasSoat !== null && (
                <div style={{ textAlign: "center", padding: "12px 14px", borderRadius: 14, background: docColorFn(diasSoat).bg, minWidth: 64 }}>
                  <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 700, color: docColorFn(diasSoat).color }}>
                    {diasSoat < 0 ? "VENC." : `${diasSoat}d`}
                  </div>
                  <div style={{ fontSize: 10, color: docColorFn(diasSoat).color, fontWeight: 700, marginTop: 2, textTransform: "uppercase" }}>SOAT</div>
                </div>
              )}
              {diasTecno !== null && (
                <div style={{ textAlign: "center", padding: "12px 14px", borderRadius: 14, background: docColorFn(diasTecno).bg, minWidth: 64 }}>
                  <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 700, color: docColorFn(diasTecno).color }}>
                    {diasTecno < 0 ? "VENC." : `${diasTecno}d`}
                  </div>
                  <div style={{ fontSize: 10, color: docColorFn(diasTecno).color, fontWeight: 700, marginTop: 2, textTransform: "uppercase" }}>Tecno.</div>
                </div>
              )}
              {costoTotalTaller > 0 && (
                <div style={{ textAlign: "center", padding: "12px 14px", borderRadius: 14, background: "var(--warn-soft)", minWidth: 64 }}>
                  <div style={{ fontSize: isMobile ? 13 : 16, fontWeight: 700, color: "var(--warn-ink)" }}>${fmt(costoTotalTaller)}</div>
                  <div style={{ fontSize: 10, color: "var(--warn-ink)", fontWeight: 700, marginTop: 2, textTransform: "uppercase" }}>Taller</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--line)", marginBottom: 20, overflowX: "auto", scrollbarWidth: "none" }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: isMobile ? "9px 12px" : "10px 18px",
              border: "none", background: "none", cursor: "pointer",
              fontSize: isMobile ? 12 : 13, fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? "var(--accent)" : "var(--muted)",
              borderBottom: tab === t.key ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: -2, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5,
              transition: "color 0.15s",
            }}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span style={{
                background: tab === t.key ? "var(--accent)" : "var(--line)",
                color: tab === t.key ? "var(--card)" : "var(--muted)",
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
                  <div key={doc.label} style={{ display: "flex", gap: 12, alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--soft)" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{doc.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{fmtFecha(doc.fecha)}</div>
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
                  <InfoRow label="Fecha retención" value={fmtFecha(moto.retencion_fecha)} highlight={{ bg: "var(--bad-soft)", color: "var(--bad-ink)" }} />
                )}
                {moto.retencion_numero_caso && (
                  <InfoRow label="N° caso retención" value={moto.retencion_numero_caso} mono />
                )}
                {moto.retencion_detalle && (
                  <InfoRow label="Detalle retención" value={moto.retencion_detalle} />
                )}
                {moto.observaciones && (
                  <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: "var(--soft2)", fontSize: 13, color: "var(--muted2)" }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: "var(--faint)", textTransform: "uppercase", marginBottom: 4 }}>Observaciones</div>
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
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Sin contrato activo</div>
                <div style={{ fontSize: 13 }}>Esta moto no tiene un contrato vigente en este momento.</div>
              </div>
            </Card>
          ) : (
            <>
              {clienteActivo && (
                <Card borderColor="var(--accent)">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--faint)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Cliente</div>
                      <button
                        onClick={() => onNavigate("ficha_cliente", clienteActivo.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
                      >
                        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {clienteActivo.nombre}
                        </div>
                      </button>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>CC {clienteActivo.cedula} · {clienteActivo.telefono}</div>
                      <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <Badge bg="var(--ok-soft)" color="var(--ok-ink)">{contratoActivo.estado}</Badge>
                        <Badge bg="var(--accent-soft3)" color="var(--accent-ink)">{contratoActivo.forma_pago}</Badge>
                        {contratoActivo.dia_pago && <Badge bg="var(--soft)" color="var(--muted)">Pago: {formatDiaPago(contratoActivo)}</Badge>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {(() => {
                        const totalPagado = pagos.filter(p => p.contrato_id === contratoActivo.id && p.estado === "Confirmado").reduce((s, p) => s + p.valor, 0);
                        return (
                          <>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ok-ink)" }}>${fmt(totalPagado)}</div>
                            <div style={{ fontSize: 11, color: "var(--faint)" }}>total pagado</div>
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
                    <div key={item.label} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--soft2)" }}>
                      <div style={{ fontSize: 10, color: "var(--faint)", textTransform: "uppercase", fontWeight: 700 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginTop: 2 }}>{item.val}</div>
                    </div>
                  ))}
                </div>

                {contratoActivo.tipo_ruta === "diario" && (contratoActivo.ahorro_acumulado !== undefined) && (
                  <div style={{ marginTop: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--muted)", marginBottom: 5 }}>
                      <span>Progreso ahorro base inicial</span>
                      <strong style={{ color: ahorroTotal(contratoActivo) >= 510000 ? "var(--ok-ink)" : "var(--text)" }}>
                        ${fmt(ahorroTotal(contratoActivo))} / $510.000
                      </strong>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 999,
                        width: `${Math.min(100, (ahorroTotal(contratoActivo) / 510000) * 100)}%`,
                        background: ahorroTotal(contratoActivo) >= 510000 ? "var(--ok)" : "var(--accent)",
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
          {prestamosMoto.length > 0 && (
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>🔄 Préstamos de reemplazo</div>
              <div style={{ display: "grid", gap: 6 }}>
                {prestamosMoto.map(p => {
                  const comoPrestada = p.moto_prestada_id === motoId;
                  const otra = comoPrestada ? p.moto_original_id : p.moto_prestada_id;
                  const otraMoto = motos.find(m => m.id === otra);
                  const cont = contratos.find(c => c.id === p.contrato_id);
                  const cli = cont ? clientes.find(cl => cl.id === cont.cliente_id) : null;
                  return (
                    <div key={p.id} style={{ fontSize: 12, color: "var(--muted2)", borderLeft: "3px solid #c4b5fd", paddingLeft: 8 }}>
                      {comoPrestada
                        ? <>Prestada a <strong style={{ textTransform: "uppercase" }}>{cli?.nombre ?? "?"}</strong> (su moto {otraMoto?.placa ?? "?"} en taller)</>
                        : <>Reemplazada por <strong>{otraMoto?.placa ?? "?"}</strong> mientras estuvo en taller</>}
                      {" · "}{p.fecha_inicio}{p.fecha_fin ? ` → ${p.fecha_fin}` : " (activo)"} · alquiler ${p.tarifa_dia.toLocaleString("es-CO")}/día
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
          {historialContratos.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)" }}>Sin historial de contratos.</div></Card>
          ) : historialContratos.map(c => {
            const cliente = clientes.find(cl => cl.id === c.cliente_id);
            const cEc = ESTADO_C[c.estado] ?? { bg: "var(--line)", color: "var(--muted2)" };
            const pagosContrato = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado").reduce((s, p) => s + p.valor, 0);
            return (
              <Card key={c.id} borderColor={cEc.color}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    {cliente ? (
                      <button
                        onClick={() => onNavigate("ficha_cliente", cliente.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 700, fontSize: 15, padding: 0, textTransform: "uppercase", textAlign: "left" }}
                      >
                        {cliente.nombre}
                      </button>
                    ) : (
                      <div style={{ fontWeight: 700, color: "var(--muted)", fontSize: 14 }}>Cliente desconocido</div>
                    )}
                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      <Badge bg={cEc.bg} color={cEc.color}>{c.estado}</Badge>
                      <Badge bg="var(--soft)" color="var(--muted2)">{c.forma_pago}</Badge>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
                      {c.fecha_entrega && `Entrega: ${fmtFecha(c.fecha_entrega)}`}
                      {c.valor_semanal > 0 && ` · $${fmt(c.valor_semanal)}`}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ok-ink)" }}>${fmt(pagosContrato)}</div>
                    <div style={{ fontSize: 11, color: "var(--faint)" }}>total pagado</div>
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
            <div style={{ padding: "12px 16px", borderRadius: 12, background: "var(--warn-soft)", fontSize: 13, fontWeight: 700, color: "var(--warn-ink)", display: "flex", justifyContent: "space-between" }}>
              <span>{ordenesTodo.length} orden{ordenesTodo.length !== 1 ? "es" : ""} de taller</span>
              <span>Costo total: ${fmt(costoTotalTaller)}</span>
            </div>
          )}
          {ordenesTodo.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)" }}>Sin órdenes de taller registradas.</div></Card>
          ) : ordenesTodo.map(t => {
            const tc = TALLER_COLORS[t.estado_tecnico] ?? { bg: "var(--line)", color: "var(--muted2)" };
            const entrada = t.fecha_ingreso ? new Date(t.fecha_ingreso + "T00:00:00") : null;
            const salida = t.fecha_salida ? new Date(t.fecha_salida + "T00:00:00") : new Date();
            const dias = entrada ? Math.floor((salida.getTime() - entrada.getTime()) / 86400000) : 0;
            return (
              <Card key={t.id} borderColor={tc.color}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      <Badge bg={tc.bg} color={tc.color}>{t.estado_tecnico}</Badge>
                      <span style={{ fontSize: 12, color: "var(--faint)", alignSelf: "center" }}>
                        {fmtFecha(t.fecha_ingreso)} → {t.fecha_salida ? fmtFecha(t.fecha_salida) : "En curso"} ({dias}d)
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{t.detalle}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>${fmt(t.costo ?? 0)}</div>
                    <div style={{ fontSize: 11, color: "var(--faint)" }}>costo</div>
                  </div>
                </div>
                {t.repuestos && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {t.repuestos.split(",").map((r, i) => (
                      <span key={i} style={{ padding: "3px 10px", borderRadius: 999, background: "var(--soft)", border: "1px solid var(--line)", fontSize: 12, color: "var(--muted2)" }}>
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
