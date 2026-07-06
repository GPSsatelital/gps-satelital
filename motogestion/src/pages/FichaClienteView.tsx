import { useEffect, useMemo, useState } from "react";
import type { ViewKey } from "../App";
import { useClientes, type ClienteEstado, type DocumentoFlags } from "../hooks/useClientes";
import { useContratos } from "../hooks/useContratos";
import { usePagos } from "../hooks/usePagos";
import { useDeudas } from "../hooks/useDeudas";
import { useConvenios } from "../hooks/useConvenios";
import { useVisitas } from "../hooks/useVisitas";
import { useGestiones } from "../hooks/useGestiones";
import { useMotos } from "../hooks/useMotos";
import { formatDiaPago } from "../utils/cicloPago";
import { generarHTMLAutorizacionDatos } from "../hooks/useDocumentos";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }
function fmtFecha(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s.length === 10 ? s + "T00:00:00" : s).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}
function diasDesde(s: string | null | undefined): number {
  if (!s) return 0;
  const d = new Date(s.length === 10 ? s + "T00:00:00" : s);
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

const ESTADO_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  "En proceso":       { bg: "#f1f5f9", color: "#334155", border: "#94a3b8" },
  "Listo para visita":{ bg: "#dbeafe", color: "#1d4ed8", border: "#3b82f6" },
  "Pendiente evaluación": { bg: "#fef3c7", color: "#92400e", border: "#f59e0b" },
  Aprobado:           { bg: "#dcfce7", color: "#166534", border: "#22c55e" },
  Rechazado:          { bg: "#fee2e2", color: "#991b1b", border: "#ef4444" },
  Activo:             { bg: "#dcfce7", color: "#166534", border: "#16a34a" },
  "En seguimiento":   { bg: "#e0f2fe", color: "#0369a1", border: "#0ea5e9" },
  "En riesgo":        { bg: "#fef3c7", color: "#92400e", border: "#f59e0b" },
  "En mora":          { bg: "#fee2e2", color: "#991b1b", border: "#dc2626" },
  Retirado:           { bg: "#ede9fe", color: "#6d28d9", border: "#8b5cf6" },
  Egresado:           { bg: "#dcfce7", color: "#15803d", border: "#16a34a" },
  "Lista negra":      { bg: "#1f2937", color: "#f9fafb", border: "#111827" },
  "Inmovilización documentación incompleta": { bg: "#fee2e2", color: "#7f1d1d", border: "#991b1b" },
};

const REFERIDOS_HITOS = [
  { n: 2,  premio: "Guantes de manejo" },
  { n: 5,  premio: "Intercomunicador" },
  { n: 10, premio: "Casco" },
  { n: 17, premio: "Combo completo" },
];

const TIPO_GESTION_LABEL: Record<string, string> = {
  mensaje_recordatorio: "Recordatorio",
  llamada: "Llamada",
  whatsapp: "WhatsApp",
  sirena: "Sirena",
  visita: "Visita",
  plazo_extra: "Plazo extra",
  recoleccion: "Recoleccion",
  cobro_campo: "Cobro campo",
  otro: "Otro",
};

const GESTION_COLORS: Record<string, { bg: string; color: string }> = {
  mensaje_recordatorio: { bg: "#dbeafe", color: "#1d4ed8" },
  llamada:    { bg: "#dcfce7", color: "#166534" },
  whatsapp:   { bg: "#dcfce7", color: "#166534" },
  sirena:     { bg: "#fef3c7", color: "#92400e" },
  visita:     { bg: "#e0f2fe", color: "#0369a1" },
  plazo_extra:{ bg: "#fef3c7", color: "#92400e" },
  recoleccion:{ bg: "#fee2e2", color: "#991b1b" },
  cobro_campo:{ bg: "#dcfce7", color: "#166534" },
  otro:       { bg: "#f1f5f9", color: "#64748b" },
};

type Tab = "resumen" | "contrato" | "pagos" | "visitas" | "documentos" | "deudas" | "convenios" | "gestiones";

const DOC_LABELS_ACOMPANANTE: Array<[keyof DocumentoFlags, string]> = [
  ["cedula",  "Cédula"],
  ["recibo1", "Recibo público"],
];

const DOC_LABELS: Array<[keyof DocumentoFlags, string]> = [
  ["cedula",      "Cédula"],
  ["hojaVida",    "Hoja de vida"],
  ["recibo1",     "Recibo público"],
  ["carta",       "Carta"],
  ["antecedentes","Antecedentes"],
  ["licencia",    "Licencia de conducir"],
];

function Badge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: bg, color, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 12, fontSize: 13, padding: "7px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ color: "#64748b", minWidth: 150, flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, color: "#0f172a", fontFamily: mono ? "monospace" : undefined }}>{value ?? "—"}</span>
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
    <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
      {children}
    </div>
  );
}

function imprimirAutorizacionDatos(cliente: Parameters<typeof generarHTMLAutorizacionDatos>[0]) {
  const html = generarHTMLAutorizacionDatos(cliente);
  const ventana = window.open("", "_blank");
  if (!ventana) return;
  ventana.document.write(`<!DOCTYPE html><html><head><title>Autorización de tratamiento de datos</title><style>@media print{body{margin:0}}</style></head><body>${html}</body></html>`);
  ventana.document.close();
  ventana.print();
}

export default function FichaClienteView({ clienteId, onNavigate }: {
  clienteId: string;
  onNavigate: (view: ViewKey, filter?: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("resumen");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

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
  const contratoActivo = useMemo(() => contratosCliente.find(c => c.estado === "Activo"), [contratosCliente]);

  const pagosCliente = useMemo(() =>
    pagos.filter(p => contratoIds.has(p.contrato_id)).sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [pagos, contratoIds]
  );
  const deudasCliente = useMemo(() => deudas.filter(d => contratoIds.has(d.contrato_id)), [deudas, contratoIds]);
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 64, gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>?</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#0f172a" }}>Cliente no encontrado</div>
        <button onClick={() => onNavigate("clientes")} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: "#0284c7", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          Volver a clientes
        </button>
      </div>
    );
  }

  const estadoC = ESTADO_COLORS[cliente.estado as ClienteEstado] ?? { bg: "#e2e8f0", color: "#334155", border: "#94a3b8" };
  const diasActivo = diasDesde(cliente.created_at);
  const refConfirmados = cliente.referidos_confirmados ?? 0;
  const proximoHito = REFERIDOS_HITOS.find(h => h.n > refConfirmados);
  const motoActiva = contratoActivo?.moto_id ? motos.find(m => m.id === contratoActivo.moto_id) : null;

  const TABS: Array<{ key: Tab; label: string; count?: number }> = [
    { key: "resumen",    label: "Resumen" },
    { key: "contrato",   label: "Contrato" },
    { key: "pagos",      label: "Pagos",      count: pagosCliente.length },
    { key: "visitas",    label: "Visitas",    count: visitasCliente.length },
    { key: "documentos", label: "Documentos" },
    { key: "deudas",     label: "Deudas",     count: deudasCliente.filter(d => d.estado !== "pagada").length },
    { key: "convenios",  label: "Convenios",  count: conveniosCliente.length },
    { key: "gestiones",  label: "Gestiones",  count: gestionesCliente.length },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", paddingBottom: 40 }}>
      {/* Back */}
      <button
        onClick={() => onNavigate("clientes", "")}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#0284c7", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "6px 0" }}
      >
        ← Volver a clientes
      </button>

      {/* Hero card */}
      <div style={{
        background: "white", borderRadius: 20, marginBottom: 20,
        boxShadow: "0 4px 24px rgba(15,23,42,0.10)",
        overflow: "hidden",
      }}>
        {/* Color accent bar */}
        <div style={{ height: 5, background: `linear-gradient(90deg, ${estadoC.border}, ${estadoC.border}88)` }} />
        <div style={{ padding: isMobile ? "18px 16px 20px" : "24px 28px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
              <div
                onClick={() => cliente.foto_perfil_url && setImagenAmpliada(cliente.foto_perfil_url)}
                style={{
                  width: isMobile ? 56 : 68, height: isMobile ? 56 : 68, borderRadius: "50%",
                  background: "#e0f2fe", flexShrink: 0, overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isMobile ? 22 : 26, fontWeight: 800, color: "#0284c7",
                  cursor: cliente.foto_perfil_url ? "pointer" : "default",
                }}
              >
                {cliente.foto_perfil_url ? (
                  <img src={cliente.foto_perfil_url} alt="Foto de perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  cliente.nombre.trim()[0]?.toUpperCase() ?? "?"
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.5, lineHeight: 1.1, marginBottom: 6 }}>
                {cliente.nombre}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <Badge bg={estadoC.bg} color={estadoC.color}>{cliente.estado}</Badge>
                <Badge bg={cliente.ruta_contrato === "diario" ? "#dbeafe" : "#dcfce7"} color={cliente.ruta_contrato === "diario" ? "#1d4ed8" : "#166534"}>
                  {cliente.ruta_contrato === "diario" ? "Ruta diaria" : "Tiempo definido"}
                </Badge>
                {cliente.lista_negra && <Badge bg="#1f2937" color="#f9fafb">Lista negra</Badge>}
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#64748b" }}>
                <span>CC {cliente.cedula}</span>
                {cliente.telefono && <span>{cliente.telefono}</span>}
                {cliente.whatsapp && !cliente.mismo_whatsapp && <span>WA: {cliente.whatsapp}</span>}
                {cliente.direccion && <span>{cliente.direccion}</span>}
              </div>
              </div>
            </div>
            {/* KPI mini cards */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flexShrink: 0 }}>
              <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 14, background: "#f0f9ff", minWidth: 72 }}>
                <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#0284c7" }}>{diasActivo}</div>
                <div style={{ fontSize: 10, color: "#0284c7", fontWeight: 700, marginTop: 2, textTransform: "uppercase" }}>Días activo</div>
              </div>
              <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 14, background: "#dcfce7", minWidth: 72 }}>
                <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 900, color: "#166534" }}>${fmt(totalPagado)}</div>
                <div style={{ fontSize: 10, color: "#166534", fontWeight: 700, marginTop: 2, textTransform: "uppercase" }}>Total pagado</div>
              </div>
              {deudaActiva > 0 && (
                <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 14, background: "#fee2e2", minWidth: 72 }}>
                  <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 900, color: "#991b1b" }}>${fmt(deudaActiva)}</div>
                  <div style={{ fontSize: 10, color: "#991b1b", fontWeight: 700, marginTop: 2, textTransform: "uppercase" }}>Deuda activa</div>
                </div>
              )}
              <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 14, background: "#fef3c7", minWidth: 72 }}>
                <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#92400e" }}>{refConfirmados}</div>
                <div style={{ fontSize: 10, color: "#92400e", fontWeight: 700, marginTop: 2, textTransform: "uppercase" }}>Referidos</div>
              </div>
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

      {/* ── Tab: Resumen ── */}
      {tab === "resumen" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Referidos progress */}
          {proximoHito && (
            <Card>
              <SectionTitle>Programa de referidos</SectionTitle>
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#92400e" }}>{refConfirmados}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
                    Próximo premio: <strong style={{ color: "#92400e" }}>{proximoHito.premio}</strong> ({proximoHito.n - refConfirmados} referido{proximoHito.n - refConfirmados !== 1 ? "s" : ""} más)
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: "#fef3c7", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 999, width: `${Math.min(100, (refConfirmados / proximoHito.n) * 100)}%`, background: "#f59e0b", transition: "width 0.5s" }} />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {REFERIDOS_HITOS.map(h => (
                  <div key={h.n} style={{
                    padding: "6px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                    background: refConfirmados >= h.n ? "#dcfce7" : "#f1f5f9",
                    color: refConfirmados >= h.n ? "#166534" : "#94a3b8",
                    border: refConfirmados >= h.n ? "1.5px solid #22c55e" : "1.5px solid #e2e8f0",
                  }}>
                    {h.n} → {h.premio}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
            <Card>
              <SectionTitle>Datos personales</SectionTitle>
              <InfoRow label="Nombre" value={<span style={{ textTransform: "uppercase" }}>{cliente.nombre}</span>} />
              <InfoRow label="Cédula" value={cliente.cedula} mono />
              <InfoRow label="Teléfono" value={cliente.telefono || "—"} />
              <InfoRow label="WhatsApp" value={cliente.mismo_whatsapp ? cliente.telefono : (cliente.whatsapp || "—")} />
              <InfoRow label="Dirección" value={cliente.direccion || "—"} />
              <InfoRow label="Fuente de llegada" value={cliente.fuente_llegada || "—"} />
              <InfoRow label="Registrado" value={fmtFecha(cliente.created_at)} />
            </Card>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {cliente.acompanante_nombre && (
                <Card>
                  <SectionTitle>Acompañante</SectionTitle>
                  <InfoRow label="Nombre" value={<span style={{ textTransform: "uppercase" }}>{cliente.acompanante_nombre}</span>} />
                  <InfoRow label="Cédula" value={cliente.acompanante_cedula || "—"} mono />
                  <InfoRow label="Teléfono" value={cliente.acompanante_telefono || "—"} />
                </Card>
              )}

              {(cliente.referido_por_nombre || cliente.referido_por_cedula) && (
                <Card>
                  <SectionTitle>Referido por</SectionTitle>
                  <InfoRow label="Nombre" value={<span style={{ textTransform: "uppercase" }}>{cliente.referido_por_nombre || "—"}</span>} />
                  <InfoRow label="Cédula" value={cliente.referido_por_cedula || "—"} mono />
                </Card>
              )}

              {contratoActivo && motoActiva && (
                <Card borderColor="#0284c7">
                  <SectionTitle>Moto asignada</SectionTitle>
                  <button
                    onClick={() => onNavigate("ficha_moto", motoActiva.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", width: "100%" }}
                  >
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#0284c7", letterSpacing: 1 }}>{motoActiva.placa}</div>
                    <div style={{ fontSize: 14, color: "#334155", fontWeight: 600 }}>{motoActiva.marca} {motoActiva.modelo}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{motoActiva.grupo}</div>
                  </button>
                </Card>
              )}
            </div>
          </div>

          {cliente.excepcion_documental && (
            <Card borderColor="#f59e0b">
              <div style={{ fontSize: 13, color: "#92400e", fontWeight: 600 }}>
                Excepcion documental: {cliente.excepcion_motivo}
                {cliente.excepcion_plazo && <span style={{ marginLeft: 8, fontWeight: 400 }}>Plazo: {fmtFecha(cliente.excepcion_plazo)}</span>}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Tab: Contrato ── */}
      {tab === "contrato" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {contratosCliente.length === 0 ? (
            <Card>
              <div style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
                <div style={{ fontWeight: 700 }}>Sin contrato activo</div>
              </div>
            </Card>
          ) : contratosCliente.map(c => {
            const moto = c.moto_id ? motos.find(m => m.id === c.moto_id) : null;
            const ESTADO_C: Record<string, { bg: string; color: string }> = {
              Activo: { bg: "#dcfce7", color: "#166534" },
              "En proceso": { bg: "#dbeafe", color: "#1d4ed8" },
              Finalizado: { bg: "#e2e8f0", color: "#334155" },
              Cancelado: { bg: "#fee2e2", color: "#991b1b" },
              Suspendido: { bg: "#fef3c7", color: "#92400e" },
            };
            const ec = ESTADO_C[c.estado] ?? { bg: "#e2e8f0", color: "#334155" };
            const pagosContrato = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado").reduce((s, p) => s + p.valor, 0);
            const ahorro = c.ahorro_acumulado ?? 0;
            const isActive = c.estado === "Activo";
            return (
              <Card key={c.id} borderColor={ec.color}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      <Badge bg={ec.bg} color={ec.color}>{c.estado}</Badge>
                      <Badge bg="#f1f5f9" color="#334155">{c.forma_pago}</Badge>
                      {c.dia_pago && <Badge bg="#f1f5f9" color="#64748b">Pago: {formatDiaPago(c)}</Badge>}
                    </div>
                    {moto ? (
                      <button
                        onClick={() => onNavigate("ficha_moto", moto.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#0284c7", fontWeight: 800, fontSize: 16, padding: 0, letterSpacing: 0.5 }}
                      >
                        {moto.placa} — {moto.marca} {moto.modelo}
                      </button>
                    ) : (
                      <div style={{ fontWeight: 700, color: "#64748b", fontSize: 14 }}>Sin moto asignada</div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#166534" }}>${fmt(pagosContrato)}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>total pagado</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 12 }}>
                  {c.fecha_entrega && (
                    <div style={{ padding: "10px 12px", borderRadius: 10, background: "#f8fafc" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Fecha entrega</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{fmtFecha(c.fecha_entrega)}</div>
                    </div>
                  )}
                  {c.valor_semanal > 0 && (
                    <div style={{ padding: "10px 12px", borderRadius: 10, background: "#f8fafc" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Valor período</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>${fmt(c.valor_semanal)}</div>
                    </div>
                  )}
                  {c.tarifa_diaria && (
                    <div style={{ padding: "10px 12px", borderRadius: 10, background: "#f8fafc" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Tarifa diaria</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>${fmt(c.tarifa_diaria)}</div>
                    </div>
                  )}
                </div>

                {c.tipo_ruta === "diario" && isActive && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", marginBottom: 5 }}>
                      <span>Ahorro acumulado hacia base inicial</span>
                      <strong style={{ color: ahorro >= 510000 ? "#166534" : "#0f172a" }}>${fmt(ahorro)} / $510.000 ({Math.min(100, Math.round((ahorro / 510000) * 100))}%)</strong>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 999,
                        width: `${Math.min(100, (ahorro / 510000) * 100)}%`,
                        background: ahorro >= 510000 ? "#16a34a" : "#0284c7",
                        transition: "width 0.5s",
                      }} />
                    </div>
                    {ahorro >= 510000 && (
                      <div style={{ marginTop: 8, padding: "6px 12px", borderRadius: 8, background: "#dcfce7", fontSize: 12, fontWeight: 700, color: "#166534" }}>
                        Base completada — listo para cambio de contrato
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Tab: Pagos ── */}
      {tab === "pagos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
            {[
              { label: "Confirmados", val: pagosCliente.filter(p => p.estado === "Confirmado").reduce((s, p) => s + p.valor, 0), color: "#166534", bg: "#dcfce7" },
              { label: "Efectivo", val: pagosCliente.filter(p => p.estado === "Confirmado" && p.metodo === "Efectivo").reduce((s, p) => s + p.valor, 0), color: "#166534", bg: "#f0fdf4" },
              { label: "Transferencia", val: pagosCliente.filter(p => p.estado === "Confirmado" && p.metodo === "Transferencia").reduce((s, p) => s + p.valor, 0), color: "#1d4ed8", bg: "#dbeafe" },
              { label: "Pendientes", val: pagosCliente.filter(p => p.estado === "Pendiente").reduce((s, p) => s + p.valor, 0), color: "#92400e", bg: "#fef3c7" },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: kpi.bg, borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: kpi.color, textTransform: "uppercase", marginBottom: 4 }}>{kpi.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: kpi.color }}>${fmt(kpi.val)}</div>
              </div>
            ))}
          </div>

          {pagosCliente.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>Sin pagos registrados.</div></Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pagosCliente.map(p => {
                const c = contratos.find(ct => ct.id === p.contrato_id);
                const moto = c?.moto_id ? motos.find(m => m.id === c.moto_id) : null;
                const estadoP = p.estado === "Confirmado" ? { bg: "#dcfce7", color: "#166534" } : p.estado === "Pendiente" ? { bg: "#fef3c7", color: "#92400e" } : { bg: "#fee2e2", color: "#991b1b" };
                return (
                  <div key={p.id} style={{ background: "white", borderRadius: 14, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{fmtFecha(p.fecha)}</div>
                      {moto && (
                        <button onClick={() => onNavigate("ficha_moto", moto.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0284c7", fontWeight: 600, fontSize: 12, padding: 0 }}>
                          {moto.placa}
                        </button>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Badge bg={p.metodo === "Efectivo" ? "#dcfce7" : "#dbeafe"} color={p.metodo === "Efectivo" ? "#166534" : "#1d4ed8"}>{p.metodo}</Badge>
                      <Badge bg={estadoP.bg} color={estadoP.color}>{p.estado}</Badge>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", textAlign: "right", minWidth: 90 }}>
                      ${fmt(p.valor)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Visitas ── */}
      {tab === "visitas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visitasCliente.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>Sin visitas registradas.</div></Card>
          ) : visitasCliente.map((v, idx) => {
            const rColor = v.resultado === "Aprobado" ? "#166534" : v.resultado === "Rechazado" ? "#991b1b" : "#92400e";
            const rBg = v.resultado === "Aprobado" ? "#dcfce7" : v.resultado === "Rechazado" ? "#fee2e2" : "#fef3c7";
            const borderC = v.resultado === "Aprobado" ? "#16a34a" : v.resultado === "Rechazado" ? "#dc2626" : "#f59e0b";
            return (
              <div key={v.id} style={{ display: "flex", gap: 0 }}>
                {/* Timeline line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: rBg, border: `2px solid ${borderC}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 800, fontSize: 13, color: rColor }}>
                    {idx + 1}
                  </div>
                  {idx < visitasCliente.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: "#e2e8f0", marginTop: 4, minHeight: 20 }} />
                  )}
                </div>
                <Card borderColor={borderC}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: v.entrevista ? 14 : 0 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Visita — {fmtFecha(v.fecha)}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                        <Badge bg={v.estado === "Realizada" ? "#dcfce7" : "#fef3c7"} color={v.estado === "Realizada" ? "#166534" : "#92400e"}>{v.estado}</Badge>
                        {v.resultado && <Badge bg={rBg} color={rColor}>{v.resultado}</Badge>}
                      </div>
                    </div>
                    {v.ubicacion && (
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{v.ubicacion.lat.toFixed(4)}, {v.ubicacion.lng.toFixed(4)}</div>
                    )}
                  </div>
                  {v.entrevista && (
                    <div style={{ display: "grid", gap: 0 }}>
                      {([
                        ["¿Vive allí?", v.entrevista.viveAlli],
                        ["Tiempo de residencia", v.entrevista.tiempoResidencia],
                        ["Tipo de vivienda", v.entrevista.tipoVivienda],
                        ["Composición familiar", v.entrevista.composicionFamiliar],
                        ["Estabilidad laboral", v.entrevista.estabilidadLaboral],
                        ["Observaciones", v.entrevista.observaciones],
                        ["Recomendación", v.entrevista.recomendacion],
                      ] as [string, string][]).filter(([, val]) => val).map(([k, val]) => (
                        <InfoRow key={k} label={k} value={val} />
                      ))}
                    </div>
                  )}

                  {/* Fotos de la visita */}
                  {(v.fotos?.fachada || v.fotos?.clienteFuncionario) && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                      {v.fotos.fachada && /^https?:\/\//.test(v.fotos.fachada) && (
                        <a href={v.fotos.fachada} target="_blank" rel="noreferrer" title="Fachada de la vivienda">
                          <img src={v.fotos.fachada} alt="Fachada" style={{ height: 96, borderRadius: 10, objectFit: "cover", border: "2px solid #e2e8f0" }} />
                        </a>
                      )}
                      {v.fotos.clienteFuncionario && /^https?:\/\//.test(v.fotos.clienteFuncionario) && (
                        <a href={v.fotos.clienteFuncionario} target="_blank" rel="noreferrer" title="Cliente + funcionario">
                          <img src={v.fotos.clienteFuncionario} alt="Cliente + funcionario" style={{ height: 96, borderRadius: 10, objectFit: "cover", border: "2px solid #e2e8f0" }} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Ubicación de residencia en mapa */}
                  {v.ubicacion && (
                    <div style={{ marginTop: 12 }}>
                      <a
                        href={`https://www.google.com/maps?q=${v.ubicacion.lat},${v.ubicacion.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, background: "#e0f2fe", color: "#0369a1", fontWeight: 700, fontSize: 13, textDecoration: "none" }}
                      >
                        📍 Ver dónde vive en el mapa
                      </a>
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab: Documentos ── */}
      {tab === "documentos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
          {[
            { title: "Documentos del cliente", docs: cliente.documentos_cliente, labels: DOC_LABELS },
            {
              title: "Documentos del acompañante",
              docs: cliente.documentos_acompanante,
              labels: cliente.mismo_domicilio_acompanante
                ? DOC_LABELS_ACOMPANANTE.filter(([k]) => k !== "recibo1")
                : DOC_LABELS_ACOMPANANTE,
            },
          ].map(section => {
            const total = section.labels.length;
            const ok = section.labels.filter(([k]) => section.docs[k]?.ok).length;
            return (
              <Card key={section.title}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <SectionTitle>{section.title}</SectionTitle>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ok === total ? "#166534" : "#92400e", background: ok === total ? "#dcfce7" : "#fef3c7", padding: "3px 10px", borderRadius: 999 }}>
                    {ok}/{total}
                  </span>
                </div>
                {section.title === "Documentos del acompañante" && cliente.mismo_domicilio_acompanante && (
                  <div style={{ marginBottom: 10, padding: "8px 12px", borderRadius: 10, background: "#f0f9ff", border: "1px solid #bae6fd", fontSize: 12, color: "#0369a1", fontWeight: 600 }}>
                    ℹ️ Vive con el cliente — usa el mismo recibo público.
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {section.labels.map(([key, label]) => {
                    const item = section.docs[key];
                    const isOk = item?.ok === true;
                    return (
                      <div key={key} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                        borderRadius: 10, background: isOk ? "#f0fdf4" : "#fef9f9",
                        border: `1.5px solid ${isOk ? "#bbf7d0" : "#fecaca"}`,
                      }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%",
                          background: isOk ? "#16a34a" : "#fee2e2",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 800, color: isOk ? "white" : "#991b1b",
                          flexShrink: 0,
                        }}>
                          {isOk ? "✓" : "✗"}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isOk ? "#166534" : "#991b1b", flex: 1 }}>{label}</span>
                        {item?.file && (
                          <a href={item.file} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#0284c7", fontWeight: 600 }}>Ver</a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        {(cliente.autorizacion_datos_firma_url || cliente.autorizacion_datos_huella_url) && (
          <Card>
            <SectionTitle>Autorización de datos</SectionTitle>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              {cliente.autorizacion_datos_firma_url && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Firma</div>
                  <img
                    src={cliente.autorizacion_datos_firma_url}
                    alt="Firma"
                    onClick={() => setImagenAmpliada(cliente.autorizacion_datos_firma_url)}
                    style={{ width: 100, height: 100, objectFit: "contain", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer" }}
                  />
                </div>
              )}
              {cliente.autorizacion_datos_huella_url && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Huella</div>
                  <img
                    src={cliente.autorizacion_datos_huella_url}
                    alt="Huella"
                    onClick={() => setImagenAmpliada(cliente.autorizacion_datos_huella_url)}
                    style={{ width: 100, height: 100, objectFit: "contain", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer" }}
                  />
                </div>
              )}
            </div>
            <div
              onClick={() => imprimirAutorizacionDatos(cliente)}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#0284c7" }}
            >
              🖨️ Imprimir documento
            </div>
          </Card>
        )}
        </div>
      )}

      {/* ── Tab: Deudas ── */}
      {tab === "deudas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {deudasCliente.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>Sin deudas registradas.</div></Card>
          ) : deudasCliente.map(d => {
            const ec = d.estado === "pendiente" ? { bg: "#fee2e2", color: "#991b1b" } : d.estado === "en_convenio" ? { bg: "#fef3c7", color: "#92400e" } : { bg: "#dcfce7", color: "#166534" };
            return (
              <Card key={d.id} borderColor={ec.color}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>{d.descripcion}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{d.concepto.replace(/_/g, " ")}</div>
                    <div style={{ marginTop: 8 }}><Badge bg={ec.bg} color={ec.color}>{d.estado}</Badge></div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: ec.color }}>${fmt(d.monto_pendiente)}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>de ${fmt(d.monto)}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Tab: Convenios ── */}
      {tab === "convenios" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {conveniosCliente.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>Sin convenios registrados.</div></Card>
          ) : conveniosCliente.map(cv => {
            const ec = cv.estado === "activo" ? { bg: "#dbeafe", color: "#1d4ed8" } : cv.estado === "cumplido" ? { bg: "#dcfce7", color: "#166534" } : cv.estado === "incumplido" ? { bg: "#fee2e2", color: "#991b1b" } : { bg: "#f1f5f9", color: "#334155" };
            const pct = cv.numero_cuotas > 0 ? Math.round((cv.cuotas_pagadas / cv.numero_cuotas) * 100) : 0;
            return (
              <Card key={cv.id} borderColor={ec.color}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 15 }}>Convenio #{cv.numero_convenio}</span>
                      <Badge bg={ec.bg} color={ec.color}>{cv.estado}</Badge>
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{cv.concepto}</div>
                    <div style={{ fontSize: 13, color: "#334155", marginTop: 4 }}>
                      Cuota: <strong>${fmt(cv.cuota_por_periodo)}</strong> · {cv.cuotas_pagadas}/{cv.numero_cuotas} cuotas · Vence: {fmtFecha(cv.fecha_limite)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>${fmt(cv.deuda_total)}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>deuda total</div>
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                    <span>Progreso</span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: ec.color, transition: "width 0.5s" }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Tab: Gestiones ── */}
      {tab === "gestiones" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {gestionesCliente.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>Sin gestiones de cobro registradas.</div></Card>
          ) : gestionesCliente.map(g => {
            const gc = GESTION_COLORS[g.tipo] ?? { bg: "#f1f5f9", color: "#64748b" };
            return (
              <div key={g.id} style={{ background: "white", borderRadius: 12, padding: "13px 16px", display: "flex", gap: 12, alignItems: "flex-start", boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: gc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: gc.color, textAlign: "center", lineHeight: 1.2 }}>{TIPO_GESTION_LABEL[g.tipo]?.slice(0, 4) ?? "—"}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{TIPO_GESTION_LABEL[g.tipo] ?? g.tipo}</span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{fmtFecha(g.fecha)}</span>
                  </div>
                  {g.resultado && <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>{g.resultado}</div>}
                  {g.plazo_extra_dias && (
                    <div style={{ fontSize: 12, color: "#92400e", marginTop: 3, fontWeight: 600 }}>
                      Plazo extra: {g.plazo_extra_dias} días — {g.plazo_extra_motivo}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox para ampliar foto de perfil / firma / huella */}
      {imagenAmpliada && (
        <div
          onClick={() => setImagenAmpliada(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,0.85)",
            zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          }}
        >
          <img
            src={imagenAmpliada}
            alt="Ampliada"
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 12, background: "white", objectFit: "contain" }}
          />
        </div>
      )}
    </div>
  );
}
