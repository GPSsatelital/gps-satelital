import React, { useMemo, useState, useEffect } from "react";
import type { ViewKey } from "../App";
import {
  usePagos,
  calcularAplicacion,
  calcularCuotaDia,
  generarFolio,
  esPagoDeCaja,
  APLICADO_LO_REPARTE_LA_BD,
  type MetodoPago,
  type PagoEstado,
  type AplicadoPago,
  type Aplicado,
} from "../hooks/usePagos";
import { useContratos, diasDesdeUltimoPago, corteMigracionGrupo, empalmePendiente, infoFinContrato } from "../hooks/useContratos";
import PanelEmpalme from "../components/PanelEmpalme";
import { useClientes } from "../hooks/useClientes";
import { useMotos, type GrupoMoto } from "../hooks/useMotos";
import { useDeudas, type ConceptoDeuda, type Deuda } from "../hooks/useDeudas";
import { useConvenios } from "../hooks/useConvenios";
import { useGestiones, type TipoGestion } from "../hooks/useGestiones";
import { useAuth } from "../contexts/AuthContext";
import { useScope } from "../contexts/SubadminScopeContext";
import MoneyInput from "../components/MoneyInput";
import CanvasFirma from "../components/CanvasFirma";
import { generarHTMLAcuerdoPago, generarHTMLEstadoCuenta, armarTextoEstadoCuenta, type DatosEstadoCuenta } from "../hooks/useDocumentos";
import { supabase } from "../lib/supabase";
import ModalRecoleccion from "../components/ModalRecoleccion";
import ModalConfirmarPago from "../components/ModalConfirmarPago";
import TicketTermico, { type TicketData } from "../components/TicketTermico";
import { useMensajesWhatsapp } from "../hooks/useMensajesWhatsapp";
import {
  calcularEstadoCartera as calcularEstadoCarteraCiclo,
  cuotaConvenioDelPeriodo,
  calcularProrrateoInicial,
  calcularAhorroAplicado,
  tarifaPagadaPeriodoActual,
  ahorroPeriodoExacto,
  huecoCuotasHoy,
  desgloseExigible,
  estaEnProrrateo,
  esDiaDePago,
  inicioPeriodoActual,
  proximoDiaPago,
  formatDiaPago,
  totalPagadoPeriodoActual,
  inicioVentanaPagosISO,
  valorPeriodoReal,
  type ContratoCiclo,
} from "../utils/cicloPago";
import { hoyISO, hoyDate, fechaISO } from "../utils/fecha";

// ─── Styles ───────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  marginBottom: 6,
  fontSize: 14,
  fontWeight: 600,
  color: "#334155",
};
const card: React.CSSProperties = {
  background: "white",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
  boxSizing: "border-box",
};
const primaryBtn: React.CSSProperties = {
  background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)",
  color: "white",
  border: "none",
  borderRadius: 14,
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};
const secondaryBtn: React.CSSProperties = {
  background: "#f1f5f9",
  color: "#334155",
  border: "none",
  borderRadius: 14,
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
};

function miniBtn(bg: string, color: string): React.CSSProperties {
  return {
    background: bg,
    color,
    border: "none",
    borderRadius: 999,
    padding: "6px 12px",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
  };
}

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("es-CO");
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("es-CO");
}

// ─── Badges ───────────────────────────────────────────────────────────────────
function PagoBadge({ estado }: { estado: PagoEstado }) {
  const map: Record<PagoEstado, { bg: string; color: string }> = {
    Confirmado: { bg: "#dcfce7", color: "#166534" },
    Pendiente: { bg: "#fef3c7", color: "#92400e" },
    Rechazado: { bg: "#fee2e2", color: "#991b1b" },
  };
  const colors = map[estado];
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: colors.bg,
        color: colors.color,
      }}
    >
      {estado}
    </span>
  );
}

type EstadoCartera = "al-dia" | "gabela" | "mora";

// Estilo/etiqueta por estado de cartera — fuente ÚNICA para el badge y la franja del detalle
// (antes la franja usaba otra función que no contaba el convenio → decía "Gabela" mientras
// el badge decía "Al día").
const ESTADO_CARTERA_STYLE: Record<EstadoCartera, { bg: string; color: string; label: string }> = {
  "al-dia": { bg: "#dcfce7", color: "#166534", label: "Al día" },
  gabela: { bg: "#fef3c7", color: "#92400e", label: "Gabela" },
  mora: { bg: "#fee2e2", color: "#991b1b", label: "Mora" },
};

function EstadoBadge({ estado }: { estado: EstadoCartera }) {
  const s = ESTADO_CARTERA_STYLE[estado];
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}

function InfoBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        background: highlight ? "#eff6ff" : "#f8fafc",
        borderRadius: 12,
        padding: "10px 14px",
        border: highlight ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
      }}
    >
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 15, fontWeight: 700, color: highlight ? "#1e40af" : "#0f172a" }}>{value}</div>
    </div>
  );
}

// ─── Day-of-week logic ────────────────────────────────────────────────────────
const DIAS_LABEL = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES_LABEL = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function fmtFecha(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${DIAS_LABEL[d.getDay()]} ${d.getDate()} ${MESES_LABEL[d.getMonth()]}`;
}

type EstadoCuenta = {
  formaPago: string;
  diaPago: string;
  ultimoPago: string | null;
  pagadoHasta: string | null;
  proximoPago: string;
  diasEstado: number;
  etiqueta: "Adelantado" | "Al día" | "Gabela" | "Mora";
  colorEtiqueta: string;
  bgEtiqueta: string;
};

function calcEstadoCuenta(
  contrato: ContratoCiclo,
  pagosConfirmados: Array<{ fecha: string; valor: number }>,
): EstadoCuenta {
  const hoy = hoyDate();
  const hoyStr = hoyISO();
  const formaPago = contrato.forma_pago;
  const fechaEntrega = contrato.fecha_entrega ?? null;

  const sorted = [...pagosConfirmados].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const ultimoPago = sorted[0]?.fecha ?? null;

  if (formaPago === "Diario") {
    if (!ultimoPago) {
      // Contrato diario nuevo sin pagos: al día hasta mañana
      return { formaPago, diaPago: "Diario", ultimoPago: null, pagadoHasta: null, proximoPago: hoyStr, diasEstado: 0, etiqueta: "Al día", colorEtiqueta: "#166534", bgEtiqueta: "#dcfce7" };
    }
    const ultimo = new Date(ultimoPago + "T00:00:00");
    const diasDesde = Math.floor((hoy.getTime() - ultimo.getTime()) / 86400000);
    const pagadoHasta = ultimoPago;
    const manana = new Date(hoy); manana.setDate(manana.getDate() + 1);
    const proximoPago = manana.toISOString().slice(0, 10);
    if (diasDesde === 0) return { formaPago, diaPago: "Diario", ultimoPago, pagadoHasta, proximoPago, diasEstado: 0, etiqueta: "Al día", colorEtiqueta: "#166534", bgEtiqueta: "#dcfce7" };
    if (diasDesde === 1) return { formaPago, diaPago: "Diario", ultimoPago, pagadoHasta, proximoPago, diasEstado: 1, etiqueta: "Gabela", colorEtiqueta: "#92400e", bgEtiqueta: "#fef3c7" };
    return { formaPago, diaPago: "Diario", ultimoPago, pagadoHasta, proximoPago: hoyStr, diasEstado: diasDesde, etiqueta: "Mora", colorEtiqueta: "#991b1b", bgEtiqueta: "#fee2e2" };
  }

  const d = inicioPeriodoActual(contrato, hoy);
  const inicioPeriodo = d.toISOString().slice(0, 10);
  const prox = proximoDiaPago(contrato, d);
  const proximoPago = prox.toISOString().slice(0, 10);

  // Mismo criterio que calcularEstadoCartera (fuente única): período real del contrato
  // + prepago de víspera, y comparando el MONTO contra la cuota — antes cualquier abono
  // parcial (o un pago del período anterior hecho esta semana) marcaba "Al día".
  const desdeISO = inicioVentanaPagosISO(contrato, hoy);
  const pagadoPeriodo = sorted.filter(p => p.fecha >= desdeISO).reduce((acc, p) => acc + p.valor, 0);
  const pagoPeriodo = sorted.find(p => p.fecha >= desdeISO);
  if (pagoPeriodo && pagadoPeriodo >= valorPeriodoReal(contrato)) {
    const pagadoHasta = new Date(prox);
    pagadoHasta.setDate(pagadoHasta.getDate() - 1);
    return {
      formaPago, diaPago: formatDiaPago(contrato), ultimoPago: pagoPeriodo.fecha,
      pagadoHasta: pagadoHasta.toISOString().slice(0, 10),
      proximoPago, diasEstado: 0,
      etiqueta: "Al día", colorEtiqueta: "#166534", bgEtiqueta: "#dcfce7",
    };
  }

  // Si el contrato fue entregado después del inicio del período → aún no vence el primer cobro
  if (fechaEntrega && fechaEntrega >= inicioPeriodo) {
    return {
      formaPago, diaPago: formatDiaPago(contrato), ultimoPago: null, pagadoHasta: null,
      proximoPago, diasEstado: 0,
      etiqueta: "Al día", colorEtiqueta: "#166534", bgEtiqueta: "#dcfce7",
    };
  }

  const diasDesde = Math.floor((hoy.getTime() - d.getTime()) / 86400000);
  const etiqueta = diasDesde === 0 ? "Al día" : diasDesde === 1 ? "Gabela" : "Mora";
  const colorEtiqueta = diasDesde <= 1 ? "#92400e" : "#991b1b";
  const bgEtiqueta = diasDesde <= 1 ? "#fef3c7" : "#fee2e2";
  return {
    formaPago, diaPago: formatDiaPago(contrato), ultimoPago,
    pagadoHasta: ultimoPago ? (() => {
      const u = new Date(ultimoPago + "T00:00:00");
      const siguienteDesdeUltimo = proximoDiaPago(contrato, u);
      siguienteDesdeUltimo.setDate(siguienteDesdeUltimo.getDate() - 1);
      return siguienteDesdeUltimo.toISOString().slice(0, 10);
    })() : null,
    proximoPago: inicioPeriodo,
    diasEstado: diasDesde,
    etiqueta: etiqueta as EstadoCuenta["etiqueta"],
    colorEtiqueta, bgEtiqueta,
  };
}

// ─── Panel de recibo ─────────────────────────────────────────────────────────
type DatosRecibo = {
  folio: string;
  fecha: string;
  clienteNombre: string;
  clienteTel: string;
  clienteWhatsapp: string;
  placa: string;
  grupo: string;
  valor: number;
  metodo: string;
  estado: "Confirmado" | "Pendiente";
  // Detalle de cuenta — para que el cliente sepa exactamente cuánto le falta.
  debiaTotal: number;
  aplicadoTarifa: number;
  aplicadoDeuda: number;
  aplicadoConvenio: number;
  aplicadoSaldoFavor: number;
  pendienteDespues: number;
  convenioAbonado: number | null;
  convenioRestante: number | null;
};

// Traduce el recibo de pago (diseño de pantalla) al ticket térmico compacto para imprimir.
function ticketPagoData(datos: DatosRecibo): TicketData {
  const m = (n: number) => `$ ${Math.round(n).toLocaleString("es-CO")}`;
  const lineas: TicketData["lineas"] = [{ label: "Debía en total", valor: m(datos.debiaTotal) }];
  if (datos.aplicadoTarifa > 0) lineas.push({ label: "A la cuota", valor: m(datos.aplicadoTarifa) });
  if (datos.aplicadoDeuda > 0) lineas.push({ label: "A deuda", valor: m(datos.aplicadoDeuda) });
  if (datos.aplicadoConvenio > 0) lineas.push({ label: "A convenio", valor: m(datos.aplicadoConvenio) });
  if (datos.aplicadoSaldoFavor > 0) lineas.push({ label: "Saldo a favor", valor: m(datos.aplicadoSaldoFavor) });
  lineas.push({ label: "Le queda pendiente", valor: m(datos.pendienteDespues), fuerte: true });
  if (datos.convenioAbonado != null) {
    lineas.push({ label: "Abonó al convenio", valor: m(datos.convenioAbonado) });
    lineas.push({ label: "Falta del convenio", valor: m(datos.convenioRestante ?? 0) });
  }
  return {
    titulo: "COMPROBANTE DE PAGO",
    grupo: datos.grupo,
    folio: datos.folio,
    fecha: datos.fecha,
    cliente: datos.clienteNombre,
    placa: datos.placa || undefined,
    montoLabel: `MONTO PAGADO (${datos.metodo})`,
    monto: datos.valor,
    lineas,
    nota: datos.estado === "Confirmado" ? "PAGO CONFIRMADO" : "Pendiente de validacion en caja",
  };
}

function ReciboPanel({ datos, onCerrar }: { datos: DatosRecibo; onCerrar: () => void }) {
  const [fase, setFase] = useState<"ver" | "whatsapp">("ver");
  const [otroNum, setOtroNum] = useState("");
  const { render } = useMensajesWhatsapp();

  function buildMsg() {
    // El desglose financiero es automático (comodín {detalle}); el envoltorio/saludo
    // del recibo lo controla la plantilla editable en Configuración.
    const detalle = "\n" + [
      `Folio: ${datos.folio}`,
      `Fecha: ${new Date(datos.fecha + "T00:00:00").toLocaleDateString("es-CO")}`,
      `Cliente: ${datos.clienteNombre}`,
      datos.placa ? `Placa: ${datos.placa}` : "",
      `Monto: $${Math.round(datos.valor).toLocaleString("es-CO")}`,
      `Método: ${datos.metodo}`,
      "",
      "*Detalle de su cuenta:*",
      `Debía en total: $${Math.round(datos.debiaTotal).toLocaleString("es-CO")}`,
      datos.aplicadoTarifa > 0 ? `→ A la cuota: $${Math.round(datos.aplicadoTarifa).toLocaleString("es-CO")}` : "",
      datos.aplicadoDeuda > 0 ? `→ A deuda: $${Math.round(datos.aplicadoDeuda).toLocaleString("es-CO")}` : "",
      datos.aplicadoConvenio > 0 ? `→ A convenio: $${Math.round(datos.aplicadoConvenio).toLocaleString("es-CO")}` : "",
      datos.aplicadoSaldoFavor > 0 ? `→ Saldo a favor: $${Math.round(datos.aplicadoSaldoFavor).toLocaleString("es-CO")}` : "",
      `Le queda pendiente: $${Math.round(datos.pendienteDespues).toLocaleString("es-CO")}`,
      datos.convenioAbonado != null ? `Abonó hoy al convenio: $${Math.round(datos.convenioAbonado).toLocaleString("es-CO")}` : "",
      datos.convenioAbonado != null ? `Le falta del convenio: $${Math.round(datos.convenioRestante ?? 0).toLocaleString("es-CO")}` : "",
      "",
      datos.estado === "Confirmado"
        ? "✅ PAGO CONFIRMADO. ¡Gracias por su pago!"
        : "⏳ Pago recibido, pendiente de validación en caja.",
    ].filter(Boolean).join("\n");
    const texto = render("recibo", {
      nombre: datos.clienteNombre.toUpperCase(),
      valor: `$${Math.round(datos.valor).toLocaleString("es-CO")}`,
      folio: datos.folio,
      fecha: new Date(datos.fecha + "T00:00:00").toLocaleDateString("es-CO"),
      detalle,
    });
    return encodeURIComponent(texto);
  }

  function limpiarNum(n: string) {
    const d = n.replace(/\D/g, "");
    return d.startsWith("57") ? d : `57${d}`;
  }

  function abrirWA(numero: string) {
    const n = limpiarNum(numero);
    if (n.replace(/\D/g, "").length < 7) return;
    window.open(`https://wa.me/${n}?text=${buildMsg()}`, "_blank");
  }

  const telRegistrado = datos.clienteWhatsapp || datos.clienteTel;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 90, padding: "0 0 0 0" }}
      onClick={onCerrar}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 480, background: "white", borderRadius: "20px 20px 0 0", padding: 24, maxHeight: "85dvh", overflowY: "auto" }}
      >
        {/* Encabezado (no se imprime) */}
        <div className="recibo-no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>🧾 Recibo de pago</div>
          <button onClick={onCerrar} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>

        {/* Ticket — esto es lo único que se imprime (ver #recibo-ticket / @media print más abajo) */}
        <div id="recibo-ticket">
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", letterSpacing: 0.5 }}>CLUB DE MOTEROS</div>
            {datos.grupo && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{datos.grupo}</div>}
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Comprobante de pago</div>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "14px 16px", marginBottom: 16, display: "grid", gap: 8 }}>
            {[
              ["Folio",    datos.folio],
              ["Fecha",    new Date(datos.fecha + "T00:00:00").toLocaleDateString("es-CO")],
              ["Cliente",  datos.clienteNombre],
              ["Placa",    datos.placa || "—"],
              ["Monto",    `$${Math.round(datos.valor).toLocaleString("es-CO")}`],
              ["Método",   datos.metodo],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", textTransform: l === "Cliente" ? "uppercase" : "none" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 2 }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>Estado</span>
              <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                background: datos.estado === "Confirmado" ? "#dcfce7" : "#fef3c7",
                color: datos.estado === "Confirmado" ? "#166534" : "#92400e" }}>
                {datos.estado === "Confirmado" ? "✅ Confirmado" : "⏳ Pendiente validación"}
              </span>
            </div>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "14px 16px", marginBottom: 16, display: "grid", gap: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 2 }}>Detalle de su cuenta</div>
            {[
              ["Debía en total",       `$${Math.round(datos.debiaTotal).toLocaleString("es-CO")}`],
              datos.aplicadoTarifa > 0 ? ["→ A la cuota", `$${Math.round(datos.aplicadoTarifa).toLocaleString("es-CO")}`] : null,
              datos.aplicadoDeuda > 0 ? ["→ A deuda", `$${Math.round(datos.aplicadoDeuda).toLocaleString("es-CO")}`] : null,
              datos.aplicadoConvenio > 0 ? ["→ A convenio", `$${Math.round(datos.aplicadoConvenio).toLocaleString("es-CO")}`] : null,
              datos.aplicadoSaldoFavor > 0 ? ["→ Saldo a favor", `$${Math.round(datos.aplicadoSaldoFavor).toLocaleString("es-CO")}`] : null,
              ["Le queda pendiente",  `$${Math.round(datos.pendienteDespues).toLocaleString("es-CO")}`],
            ].filter(Boolean).map((fila) => {
              const [l, v] = fila as [string, string];
              return (
                <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{l}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{v}</span>
                </div>
              );
            })}
            {datos.convenioAbonado != null && (
              <>
                <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 4, paddingTop: 6, fontSize: 12, fontWeight: 800, color: "#334155" }}>Convenio</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>Abonó hoy al convenio</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>${Math.round(datos.convenioAbonado).toLocaleString("es-CO")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>Le falta del convenio</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>${Math.round(datos.convenioRestante ?? 0).toLocaleString("es-CO")}</span>
                </div>
              </>
            )}
          </div>

          <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8" }}>¡Gracias por su pago!</div>
        </div>

        {/* Ticket térmico — oculto en pantalla, es lo único que se imprime (80mm, negro) */}
        <TicketTermico modo="print" datos={ticketPagoData(datos)} />

        {fase === "ver" && (
          <div className="recibo-no-print" style={{ display: "grid", gap: 10 }}>
            <button
              onClick={() => setFase("whatsapp")}
              style={{ ...primaryBtn, width: "100%", padding: "13px 16px", fontSize: 15 }}
            >
              💬 Enviar por WhatsApp
            </button>
            <button
              onClick={() => window.print()}
              style={{ ...secondaryBtn, width: "100%", padding: "13px 16px", fontSize: 15 }}
            >
              🖨️ Imprimir recibo
            </button>
          </div>
        )}

        {fase === "whatsapp" && (
          <div className="recibo-no-print" style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 2 }}>¿A qué número enviar?</div>

            {telRegistrado && (
              <button
                onClick={() => abrirWA(telRegistrado)}
                style={{ ...secondaryBtn, textAlign: "left", padding: "12px 16px" }}
              >
                <div style={{ fontSize: 12, color: "#64748b" }}>Número registrado</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>📱 {telRegistrado}</div>
              </button>
            )}

            <div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Otro número</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={otroNum}
                  onChange={e => setOtroNum(e.target.value)}
                  placeholder="Ej: 3001234567"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={() => abrirWA(otroNum)}
                  disabled={!otroNum.trim()}
                  style={{ ...primaryBtn, opacity: !otroNum.trim() ? 0.5 : 1, whiteSpace: "nowrap" }}
                >
                  Enviar
                </button>
              </div>
            </div>

            {telRegistrado && otroNum.trim() && (
              <button
                onClick={() => { abrirWA(telRegistrado); setTimeout(() => abrirWA(otroNum), 600); }}
                style={{ ...primaryBtn, width: "100%", padding: "12px 16px" }}
              >
                Enviar a los dos números
              </button>
            )}

            <button onClick={() => setFase("ver")} style={{ ...secondaryBtn, width: "100%", fontSize: 13 }}>← Volver</button>
          </div>
        )}
      </div>
    </div>
  );
}

type TabKey = "hoy" | "contratos" | "dinero" | "historial";
type FiltroContratos = "todos" | "mora" | "gabela" | "al-dia" | "pagan-hoy" | "convenio";

type ProtocoloStep = { paso: number; label: string; color: string; bg: string; accionRecomendada: string };
function calcProtocoloStep(dias: number): ProtocoloStep {
  if (dias <= 0) return { paso: 1, label: "Recordatorio", color: "#0284c7", bg: "#e0f2fe", accionRecomendada: "mensaje_recordatorio" };
  if (dias === 1) return { paso: 2, label: "Llamada + Sirena", color: "#92400e", bg: "#fef3c7", accionRecomendada: "llamada" };
  if (dias <= 3) return { paso: 3, label: "Apagado Remoto", color: "#991b1b", bg: "#fee2e2", accionRecomendada: "otro" };
  return { paso: 4, label: "RECOLECCION FISICA", color: "#ffffff", bg: "#7f1d1d", accionRecomendada: "recoleccion" };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CobrosView({ initialOpenForm = false, onNavigate }: { initialOpenForm?: boolean; onNavigate?: (view: ViewKey, filter?: string) => void }) {
  const { profile, puede } = useAuth();
  const { filtrarContratos } = useScope();

  const { pagos, loading: loadingPagos, error: errorPagos, registrarPago, subirComprobante, registrarCobroCampo, marcarEntregadoCaja, confirmarPago, rechazarPago, eliminarPago, pagosDelContrato } =
    usePagos();
  const { contratos: todosContratos, loading: loadingContratos, cerrarEmpalme } = useContratos();
  const contratos = filtrarContratos(todosContratos);
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { deudas, registrarDeuda, editarDeuda, eliminarDeuda } = useDeudas();
  const { convenios, convenioActivoDelContrato, totalConveniosDelContrato, crearConvenio } = useConvenios();
  const { gestiones, registrarGestion } = useGestiones();
  const { render: renderMsg } = useMensajesWhatsapp();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const [activeTab, setActiveTab] = useState<TabKey>("hoy");
  const [filtroContratos, setFiltroContratos] = useState<FiltroContratos>("todos");
  const [filtroGrupoContratos, setFiltroGrupoContratos] = useState<"todos" | GrupoMoto>("todos");
  const [modalCampoAbierto, setModalCampoAbierto] = useState(false);
  const [contratoSeleccionadoId, setContratoSeleccionadoId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  // Modal de registro rápido de pago (desde acción rápida del dashboard) — estado propio e independiente
  const [modalPago, setModalPago] = useState(initialOpenForm);
  const [modalBusqueda, setModalBusqueda] = useState("");
  const [modalContratoId, setModalContratoId] = useState<string | null>(null);
  const [modalListaAbierta, setModalListaAbierta] = useState(false);
  const [modalValor, setModalValor] = useState("");
  const [modalMetodo, setModalMetodo] = useState<MetodoPago>("Efectivo");
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalExito, setModalExito] = useState(false);
  const [modalComprobante, setModalComprobante] = useState<File | null>(null);
  const [modalSubiendo, setModalSubiendo] = useState(false);

  // Recibo panel
  const [reciboData, setReciboData] = useState<DatosRecibo | null>(null);

  // Payment form state
  const [valor, setValor] = useState("");
  // Punto 1 (registro dentro del contrato) = SOLO efectivo. Las transferencias se registran
  // por la ventana flotante "Cobrar", que sí exige la foto del comprobante.
  const [metodo] = useState<MetodoPago>("Efectivo");
  const [formError, setFormError] = useState<string | null>(null);
  const [formExito, setFormExito] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [confirmarPagoOpen, setConfirmarPagoOpen] = useState(false);
  const [confirmarModalOpen, setConfirmarModalOpen] = useState(false);
  const [confirmarCampoOpen, setConfirmarCampoOpen] = useState(false);
  const [recolectandoId] = useState<string | null>(null);
  const [recoleccionModal, setRecoleccionModal] = useState<{
    contratoId: string; clienteId: string; clienteNombre: string; motoId: string | null; placa: string;
  } | null>(null);

  // Gestion form state
  const [tipoGestion, setTipoGestion] = useState<TipoGestion>("llamada");
  const [resultadoGestion, setResultadoGestion] = useState("");
  const [gestionError, setGestionError] = useState<string | null>(null);
  const [gestionExito, setGestionExito] = useState(false);

  // Deuda form state
  const [deudaConcepto, setDeudaConcepto] = useState<ConceptoDeuda>("daño_vehiculo");
  const [deudaDescripcion, setDeudaDescripcion] = useState("");
  const [deudaMonto, setDeudaMonto] = useState("");
  const [deudaError, setDeudaError] = useState<string | null>(null);
  const [deudaExito, setDeudaExito] = useState(false);

  // Convenio form state
  const [convDeudaTotal, setConvDeudaTotal] = useState("");
  const [convCuota, setConvCuota] = useState("");
  const [convCuotas, setConvCuotas] = useState("");
  const [convFechaLimite, setConvFechaLimite] = useState("");
  const [convConcepto, setConvConcepto] = useState("");
  const [convError, setConvError] = useState<string | null>(null);
  const [convExito, setConvExito] = useState(false);
  const [mostrarFormConvenio, setMostrarFormConvenio] = useState(false);
  const [convFinanciarN, setConvFinanciarN] = useState(0); // cuántas cuotas de arriendo se financian al crear el convenio (0/1/2)
  // Se fija UNO (cuota o número de cuotas) y el otro se calcula solo.
  const [convModoFijar, setConvModoFijar] = useState<"cuotas" | "cuota">("cuotas");
  const [convFirma, setConvFirma] = useState<string | null>(null); // firma del acuerdo (obligatoria)
  const [verPreviewAcuerdo, setVerPreviewAcuerdo] = useState(false);
  const [mostrarFormDeuda, setMostrarFormDeuda] = useState(false);

  // Edición inline de deuda existente
  const [deudaEditandoId, setDeudaEditandoId] = useState<string | null>(null);
  const [editConcepto, setEditConcepto] = useState<ConceptoDeuda>("daño_vehiculo");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editMonto, setEditMonto] = useState("");
  const [editMontoPendiente, setEditMontoPendiente] = useState("");
  const [editDeudaError, setEditDeudaError] = useState<string | null>(null);
  const [guardandoEditDeuda, setGuardandoEditDeuda] = useState(false);

  function abrirEdicionDeuda(d: Deuda) {
    setDeudaEditandoId(d.id);
    setEditConcepto(d.concepto);
    setEditDescripcion(d.descripcion);
    setEditMonto(String(d.monto));
    setEditMontoPendiente(String(d.monto_pendiente));
    setEditDeudaError(null);
  }

  async function guardarEdicionDeuda(d: Deuda) {
    if (guardandoEditDeuda || !profile) return;
    const nuevoMontoOriginal = Number(editMonto);
    const nuevoPendiente = Number(editMontoPendiente);
    if (!editMonto || nuevoMontoOriginal < 0 || !editMontoPendiente || nuevoPendiente < 0) {
      setEditDeudaError("Ingresa montos válidos.");
      return;
    }
    if (nuevoPendiente > nuevoMontoOriginal) {
      setEditDeudaError("El pendiente no puede ser mayor al monto original.");
      return;
    }
    setGuardandoEditDeuda(true);
    try {
      const { error } = await editarDeuda(
        d,
        { concepto: editConcepto, descripcion: editDescripcion, monto: nuevoMontoOriginal, monto_pendiente: nuevoPendiente },
        profile.id,
      );
      if (error) { setEditDeudaError(error); return; }
      setDeudaEditandoId(null);
    } finally {
      setGuardandoEditDeuda(false);
    }
  }

  async function handleEliminarDeuda(id: string) {
    if (guardandoEditDeuda) return;
    if (!confirm("¿Eliminar esta deuda? Esta acción no se puede deshacer.")) return;
    setGuardandoEditDeuda(true);
    try {
      await eliminarDeuda(id);
      setDeudaEditandoId(null);
    } finally {
      setGuardandoEditDeuda(false);
    }
  }

  // Eliminar pago (exclusivo ADMIN_PRINCIPAL) — corrige un pago mal ingresado por completo.
  const [eliminandoPagoId, setEliminandoPagoId] = useState<string | null>(null);
  async function handleEliminarPago(p: typeof pagos[number]) {
    if (eliminandoPagoId) return;
    if (!profile || !puedeEliminarPago) return;
    if (!confirm(`¿Eliminar este pago de $${fmt(p.valor)} (${p.metodo}, ${formatDate(p.fecha)})? Esta acción no se puede deshacer.`)) return;
    setEliminandoPagoId(p.id);
    try {
      await eliminarPago(p, profile.id);
    } finally {
      setEliminandoPagoId(null);
    }
  }

  // Historial filter
  const [filtroPagos, setFiltroPagos] = useState<"todos" | "Pendiente" | "Confirmado" | "Rechazado">("todos");

  // Detail panel tabs
  const [detailTab, setDetailTab] = useState<"gestiones" | "deudas" | "convenios" | "historial">("gestiones");

  // Protocolo / Campo / Recolección state
  const [campoContratoId, setCampoContratoId] = useState<string | null>(null);
  const [campoMonto, setCampoMonto] = useState("");
  const [campoNota, setCampoNota] = useState("");
  const [campoError, setCampoError] = useState("");
  const [campoExito, setCampoExito] = useState(false);
  const [campoBusqueda, setCampoBusqueda] = useState("");
  const [campoUbicacion, setCampoUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const [campoGpsEstado, setCampoGpsEstado] = useState<"idle" | "capturando" | "ok" | "error">("idle");
  const [busquedaTransferencias, setBusquedaTransferencias] = useState("");
  const [busquedaCampoConfirmar, setBusquedaCampoConfirmar] = useState("");
  const [filtroCampoConfirmar, setFiltroCampoConfirmar] = useState<"todos" | "por-entregar" | "entregado">("todos");
  const [campoFoto, setCampoFoto] = useState<File | null>(null);

  const contratosActivos = contratos.filter(c => c.estado === "Activo");

  // ── Resumen por contrato ──────────────────────────────────────────────────
  const resumenContratos = useMemo(() => {
    const hoy = hoyDate();
    const inicioSemana = new Date(hoy);
    const dayOfWeek = hoy.getDay();
    const daysFromMon = (dayOfWeek + 6) % 7;
    inicioSemana.setDate(hoy.getDate() - daysFromMon);
    inicioSemana.setHours(0, 0, 0, 0);

    return contratosActivos.map(contrato => {
      const todosPagos = pagos.filter(p => p.contrato_id === contrato.id);
      const confirmados = todosPagos.filter(p => p.estado === "Confirmado");
      const pendientes = todosPagos.filter(p => p.estado === "Pendiente");

      // Solo deuda EXIGIBLE directa (pendiente). Las 'en_convenio' se pagan vía la cuota
      // del convenio — sumarlas aquí las cobraría DOBLE (deuda + convenio a la vez).
      const deudaContrato = deudas
        .filter(d => d.contrato_id === contrato.id && d.estado === "pendiente")
        .reduce((acc, d) => acc + d.monto_pendiente, 0);

      const ultimoPagoFecha = [...confirmados].sort((a,b) => b.fecha.localeCompare(a.fecha))[0]?.fecha ?? null;
      // Sin pagos nunca pero con deuda pendiente (ej. saldo de apertura migrado) → el reloj de mora
      // arranca desde la entrega (topado al corte de migración), no desde el sentinel 999 (reservado
      // para contratos genuinamente nuevos sin deuda). Evita que Recolección los ignore para siempre.
      const grupoMoto = motos.find(m => m.id === contrato.moto_id)?.grupo ?? null;
      const diasSinPago = ultimoPagoFecha
        ? Math.floor((Date.now() - new Date(ultimoPagoFecha + "T00:00:00").getTime()) / 86400000)
        : (contrato.fecha_entrega && deudaContrato > 0)
          ? (diasDesdeUltimoPago(null, contrato.fecha_entrega, corteMigracionGrupo(grupoMoto)) ?? 999)
          : 999;
      const ultimaGestion = gestiones.filter(g => g.contrato_id === contrato.id)[0] ?? null;

      const pagadoEstaSemana = confirmados
        .filter(p => new Date(p.fecha + "T00:00:00") >= inicioSemana)
        .reduce((acc, p) => acc + p.valor, 0);

      const recaudadoHoy = confirmados
        .filter(p => p.fecha === hoyISO() && esPagoDeCaja(p))
        .reduce((acc, p) => acc + p.valor, 0);

      // La cuota del convenio es obligatoria junto al pago normal — cuenta para la mora,
      // pero solo desde el período en que se creó (no en una semana ya vencida antes).
      const convenioActivo = convenioActivoDelContrato(contrato.id);
      const cuotaConvenio = cuotaConvenioDelPeriodo(convenioActivo, contrato, hoy);
      // Si el convenio absorbió la cuota de este período (alivio), ese período va "al día".
      const periodoCubierto = !!(convenioActivo?.cubre_periodo_hasta && convenioActivo.cubre_periodo_hasta >= hoyISO());

      const estadoCartera = calcularEstadoCarteraCiclo(contrato, confirmados, hoy, cuotaConvenio, periodoCubierto);
      const pagadoEnPeriodoActual = totalPagadoPeriodoActual(contrato, confirmados, hoy);

      const saldoAFavor = confirmados.reduce((acc, p) => acc + (p.aplicado_saldo_favor ?? 0), 0);
      const sinPagosNunca = confirmados.length === 0;

      return {
        ...contrato,
        pagadoEstaSemana,
        pagadoEnPeriodoActual,
        recaudadoHoy,
        estadoCartera,
        deudaContrato,
        convenioActivo,
        cuotaConvenio,
        pendientesCount: pendientes.length,
        diasSinPago,
        ultimaGestion,
        saldoAFavor,
        sinPagosNunca,
      };
    });
  }, [contratosActivos, pagos, deudas, convenios]);

  // ── Helpers para el detalle del recibo ──────────────────────────────────────
  function calcularPendienteContrato(c: typeof resumenContratos[number]): number {
    const enProrrateo = estaEnProrrateo(c, c.sinPagosNunca ?? true);
    const cuotaPact = c.forma_pago === "Diario"
      ? calcularCuotaDia(c.tarifa_diaria ?? 27000, new Date().getDay() === 0, c.tarifa_domingo)
      : enProrrateo ? calcularProrrateoInicial(c) : valorPeriodoReal(c);
    const pagadoP = c.forma_pago === "Diario" ? (c.recaudadoHoy ?? 0) : (c.pagadoEnPeriodoActual ?? 0);
    return Math.max(cuotaPact - pagadoP, 0) + c.deudaContrato + c.cuotaConvenio;
  }

  function sumaAbonadoConvenio(convenioId: string): number {
    return pagos
      .filter(p => p.convenio_id === convenioId && p.estado === "Confirmado")
      .reduce((acc, p) => acc + (p.aplicado_convenio ?? 0), 0);
  }

  const enMora = resumenContratos.filter(r => r.estadoCartera === "mora");
  const enGabela = resumenContratos.filter(r => r.estadoCartera === "gabela");
  const alDia = resumenContratos.filter(r => r.estadoCartera === "al-dia");
  const conConvenio = resumenContratos.filter(r => r.convenioActivo);
  const recaudadoHoyTotal = resumenContratos.reduce((acc, r) => acc + r.recaudadoHoy, 0);
  const recaudadoSemanaTotal = resumenContratos.reduce((acc, r) => acc + r.pagadoEstaSemana, 0);
  // ── Pagan Hoy ─────────────────────────────────────────────────────────────
  const paganHoyDiario = useMemo(() =>
    resumenContratos.filter(c => c.forma_pago === "Diario"),
    [resumenContratos]);

  const paganHoyPeriodico = useMemo(() =>
    resumenContratos.filter(c => {
      if (c.forma_pago === "Diario") return false;
      return esDiaDePago(c, new Date());
    }), [resumenContratos]);

  const totalPaganHoy = paganHoyDiario.length + paganHoyPeriodico.length;

  // ── Panel HOY: tareas del día agrupadas por urgencia (sin duplicar) ─────────
  const hoyISOPanel = hoyISO();
  function gestionHechaHoy(contratoId: string, tipo: TipoGestion): boolean {
    return gestiones.some(g => g.contrato_id === contratoId && g.tipo === tipo && g.fecha === hoyISOPanel);
  }

  // Antes de recolectar, el protocolo exige haber intentado (sin respuesta) mensaje, llamada
  // y sirena — registrados durante la racha de mora actual (desde el último pago confirmado).
  // El sistema asume "sin respuesta" porque el cliente sigue sin pagar. El apagado remoto NO
  // es requisito. Ver plan Fase 0.
  function pasosPreviosRecoleccion(contratoId: string): { completo: boolean; faltan: string[] } {
    const ultimoPago = pagos
      .filter(p => p.contrato_id === contratoId && p.estado === "Confirmado")
      .map(p => p.fecha)
      .sort((a, b) => b.localeCompare(a))[0] ?? "0000-00-00";
    const gs = gestiones.filter(g => g.contrato_id === contratoId && g.fecha >= ultimoPago);
    const tieneMensaje = gs.some(g => g.tipo === "mensaje_recordatorio" || g.tipo === "whatsapp");
    const tieneLlamada = gs.some(g => g.tipo === "llamada");
    const tieneSirena  = gs.some(g => g.tipo === "sirena");
    const faltan: string[] = [];
    if (!tieneMensaje) faltan.push("mensaje");
    if (!tieneLlamada) faltan.push("llamada");
    if (!tieneSirena)  faltan.push("sirena");
    return { completo: faltan.length === 0, faltan };
  }

  // Conciliación: cobros en campo que YO registré hoy (efectivo a entregar a caja)
  const misCobrosCampoHoy = useMemo(() => {
    if (!profile) return { total: 0, count: 0, pendienteEntregar: 0 };
    const mios = pagos.filter(p => p.tipo_registro === "campo" && p.fecha === hoyISOPanel && p.registrado_por === profile.id);
    const total = mios.reduce((acc, p) => acc + p.valor, 0);
    const pendienteEntregar = mios.filter(p => !p.entregado_caja).reduce((acc, p) => acc + p.valor, 0);
    return { total, count: mios.length, pendienteEntregar };
  }, [pagos, profile, hoyISOPanel]);

  const hoyISOPlazo = hoyISO();
  // Contratos con un "plazo extra" vigente (fecha_limite aún no vencida) — no deben ir a Recolección
  const contratosConPlazoVigente = useMemo(() => {
    const set = new Set<string>();
    const porContrato = new Map<string, string>(); // contrato_id -> fecha_limite más reciente
    gestiones
      .filter(g => g.tipo === "plazo_extra" && g.plazo_extra_fecha_limite)
      .forEach(g => {
        const actual = porContrato.get(g.contrato_id);
        if (!actual || g.plazo_extra_fecha_limite! > actual) porContrato.set(g.contrato_id, g.plazo_extra_fecha_limite!);
      });
    porContrato.forEach((fechaLimite, contratoId) => {
      if (fechaLimite >= hoyISOPlazo) set.add(contratoId);
    });
    return set;
  }, [gestiones, hoyISOPlazo]);

  const panelHoy = useMemo(() => {
    const idsPaganHoy = new Set([...paganHoyDiario, ...paganHoyPeriodico].map(c => c.id));
    const recoleccion: typeof resumenContratos = [];
    const mora: typeof resumenContratos = [];
    const gabela: typeof resumenContratos = [];
    const paganHoy: typeof resumenContratos = [];
    resumenContratos.forEach(c => {
      // Recolección: solo mora real con >3 días (estadoCartera ya descarta contratos nuevos/prorrateo)
      // Si tiene un plazo extra vigente, se queda en Mora — no se puede recolectar durante ese margen.
      if (c.estadoCartera === "mora" && c.diasSinPago > 3 && c.diasSinPago < 999 && !contratosConPlazoVigente.has(c.id)) recoleccion.push(c);
      else if (c.estadoCartera === "mora") mora.push(c);
      else if (c.estadoCartera === "gabela") gabela.push(c);
      else if (idsPaganHoy.has(c.id)) paganHoy.push(c);
    });
    return { recoleccion, mora, gabela, paganHoy };
  }, [resumenContratos, paganHoyDiario, paganHoyPeriodico, contratosConPlazoVigente]);

  const totalTareasHoy = panelHoy.recoleccion.length + panelHoy.mora.length + panelHoy.gabela.length + panelHoy.paganHoy.length;

  async function tareaMensaje(c: typeof resumenContratos[number]) {
    if (!profile) return;
    const cliente = clientes.find(cl => cl.id === c.cliente_id);
    const moto = motos.find(m => m.id === c.moto_id);
    const tel = (cliente?.whatsapp || cliente?.telefono || "").replace(/\D/g, "");
    const num = tel.startsWith("57") ? tel : `57${tel}`;
    // El mensaje cambia según el estado: al día → recordatorio del día de pago,
    // gabela → aviso de día de gracia, mora → aviso de mora. Plantilla editable en Config.
    const clave = c.estadoCartera === "mora" ? "mora" : c.estadoCartera === "gabela" ? "gabela" : "dia_pago";
    const texto = renderMsg(clave, {
      nombre: (cliente?.nombre ?? "").toUpperCase(),
      placa: moto?.placa ?? "",
      dias: c.diasSinPago >= 999 ? 0 : c.diasSinPago,
      valor: `$${Math.round(calcularPendienteContrato(c)).toLocaleString("es-CO")}`,
    });
    if (num.length >= 9) window.open(`https://wa.me/${num}?text=${encodeURIComponent(texto)}`, "_blank");
    await registrarGestion(c.id, "mensaje_recordatorio", "Mensaje de recordatorio enviado", profile.id);
  }
  async function tareaLlamar(c: typeof resumenContratos[number]) {
    if (!profile) return;
    const cliente = clientes.find(cl => cl.id === c.cliente_id);
    const tel = (cliente?.telefono || cliente?.whatsapp || "").replace(/\D/g, "");
    if (tel.length >= 7) window.open(`tel:${tel}`, "_self");
    await registrarGestion(c.id, "llamada", "Llamada realizada", profile.id);
  }
  async function tareaSirena(c: typeof resumenContratos[number]) {
    if (!profile) return;
    await registrarGestion(c.id, "sirena", "Sirena activada (3 seg, vehículo detenido)", profile.id);
  }
  // Abre el formulario combinado de recolección (recepción con fotos + suspender +
  // multa, todo en un solo guardado) — reemplaza el confirm() sin evidencia de antes.
  function tareaRecoleccion(c: typeof resumenContratos[number]) {
    if (!profile || recolectandoId) return;
    const previos = pasosPreviosRecoleccion(c.id);
    if (!previos.completo) {
      alert(`Antes de recolectar debe intentar (sin respuesta del cliente): ${previos.faltan.join(", ")}. Registre esos pasos con los botones de esta misma tarjeta.`);
      return;
    }
    const cliente = clientes.find(cl => cl.id === c.cliente_id);
    const moto = motos.find(m => m.id === c.moto_id);
    setRecoleccionModal({
      contratoId: c.id,
      clienteId: c.cliente_id,
      clienteNombre: cliente?.nombre ?? "Sin nombre",
      motoId: c.moto_id ?? null,
      placa: moto?.placa ?? "Sin placa",
    });
  }

  // ── Filtrar lista ─────────────────────────────────────────────────────────
  const listaFiltrada = useMemo(() => {
    let base: typeof resumenContratos;
    if (filtroContratos === "gabela") base = enGabela;
    else if (filtroContratos === "mora") base = enMora;
    else if (filtroContratos === "al-dia") base = alDia;
    else if (filtroContratos === "pagan-hoy") base = [...paganHoyDiario, ...paganHoyPeriodico];
    else if (filtroContratos === "convenio") base = conConvenio;
    else base = resumenContratos;

    if (filtroGrupoContratos !== "todos") {
      base = base.filter(c => motos.find(m => m.id === c.moto_id)?.grupo === filtroGrupoContratos);
    }

    const q = busqueda.toLowerCase();
    if (!q) return base;
    return base.filter(c => {
      const cliente = clientes.find(cl => cl.id === c.cliente_id);
      const moto = motos.find(m => m.id === c.moto_id);
      return (
        (cliente?.nombre ?? "").toLowerCase().includes(q) ||
        (moto?.placa ?? "").toLowerCase().includes(q)
      );
    });
  }, [filtroContratos, filtroGrupoContratos, resumenContratos, enMora, enGabela, alDia, conConvenio, paganHoyDiario, paganHoyPeriodico, busqueda, clientes, motos]);

  // ── Contrato seleccionado ─────────────────────────────────────────────────
  const contratoDetalle = contratoSeleccionadoId
    ? resumenContratos.find(c => c.id === contratoSeleccionadoId) ?? null
    : null;

  const clienteDetalle = contratoDetalle ? clientes.find(cl => cl.id === contratoDetalle.cliente_id) : null;
  const motoDetalle = contratoDetalle ? motos.find(m => m.id === contratoDetalle.moto_id) : null;

  const pagosContrato = contratoSeleccionadoId
    ? pagosDelContrato(contratoSeleccionadoId).slice(0, 10)
    : [];

  // Solo deuda EXIGIBLE (pendiente): lo 'en_convenio' se muestra en la pestaña Convenio
  // (saldo del convenio) — aquí duplicaría el cobro en tab Deudas, estado de cuenta y meta.
  const deudasContrato = contratoSeleccionadoId
    ? deudas.filter(d => d.contrato_id === contratoSeleccionadoId && d.estado === "pendiente")
    : [];

  const totalConvenios = contratoSeleccionadoId ? totalConveniosDelContrato(contratoSeleccionadoId) : 0;
  const esAdmin = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";
  const esSecretaria = profile?.role === "SECRETARIA" || profile?.role === "ADMIN_PRINCIPAL";
  const esSubadmin = profile?.role === "SUBADMIN";
  // Registrar pago normal: secretaria y admins (no subadmin). Cobro en campo: admins y subadmin (no secretaria pura).
  // Acciones de plata → permiso por persona (rol como techo). Defaults calzan con el
  // comportamiento actual: registrar=SEC+ADMIN, confirmar/cerrar caja=SEC, eliminar=AP.
  const puedePagoNormal = puede("registrar_efectivo");
  const puedeConfirmarPago = puede("confirmar_transferencia");
  const puedeEliminarPago = puede("eliminar_pago");
  const puedeEditarDeuda = puede("editar_deuda");
  const puedeAplicarSaldo = puede("aplicar_saldo_favor");
  const puedeCrearConvenio = puede("crear_convenio");
  const puedeRecolectar = puede("recolectar_moto");
  const puedeCobroCampo = esAdmin || esSubadmin;
  const [saldoExito, setSaldoExito] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  type FiltroHoy = "todos" | "recoleccion" | "mora" | "gabela" | "pagan-hoy";
  const [filtroHoy, setFiltroHoy] = useState<FiltroHoy>("todos");
  const [busquedaHoy, setBusquedaHoy] = useState("");
  const convenioActual = contratoSeleccionadoId ? convenioActivoDelContrato(contratoSeleccionadoId) : null;

  const gestionesContrato = contratoSeleccionadoId
    ? gestiones.filter(g => g.contrato_id === contratoSeleccionadoId).slice(0, 5)
    : [];

  // ── Desglose en tiempo real ───────────────────────────────────────────────
  const montoIngresado = Number(valor) || 0;
  const esDomingo = new Date().getDay() === 0;

  // Detectar si está en período de prorrateo (contrato nuevo que nunca ha recibido un pago).
  // Se mantiene en prorrateo sin importar los días de mora — el monto adeudado no
  // salta a una semana completa hasta que se salde ese primer período.
  const enProrrateo = !!contratoDetalle
    && estaEnProrrateo(contratoDetalle, contratoDetalle.sinPagosNunca ?? true);

  const cuotaPactada = contratoDetalle
    ? (contratoDetalle.forma_pago === "Diario"
        ? calcularCuotaDia(contratoDetalle.tarifa_diaria ?? 27000, esDomingo, contratoDetalle.tarifa_domingo)
        : enProrrateo
          ? calcularProrrateoInicial(contratoDetalle)
          : valorPeriodoReal(contratoDetalle))
    : 27000;

  const pagadoEnPeriodo = contratoDetalle?.forma_pago === "Diario"
    ? (contratoDetalle?.recaudadoHoy ?? 0)
    : (contratoDetalle?.pagadoEnPeriodoActual ?? 0);
  const cuotaPendiente = contratoDetalle?.motor_v2 && contratoDetalle.forma_pago !== "Diario"
    ? huecoCuotasHoy(contratoDetalle, hoyDate())
    : Math.max(cuotaPactada - pagadoEnPeriodo, 0);

  // Desglose por fecha (motor de cajas): qué períodos debe, de qué fecha, y el próximo pago.
  const desg = contratoDetalle?.motor_v2 && contratoDetalle.forma_pago !== "Diario"
    ? desgloseExigible(contratoDetalle, hoyDate()) : null;

  // "¿Qué cubre este pago?" en vivo: simula el reparto FIFO del monto que escribe el funcionario
  // (prorrateo → cajas más viejas → deuda → convenio) para que sepa qué queda cubierto y qué falta.
  const coberturaEnVivo = (() => {
    const monto = Number(valor) || 0;
    if (!desg || monto <= 0 || !contratoDetalle) return null;
    let resto = monto;
    const lineas: { txt: string; ok: boolean }[] = [];
    if (desg.prorrateoPendiente > 0 && resto > 0) {
      const a = Math.min(resto, desg.prorrateoPendiente); resto -= a;
      lineas.push({ txt: a >= desg.prorrateoPendiente ? "Prorrateo inicial" : `Prorrateo (abona $${fmt(a)})`, ok: a >= desg.prorrateoPendiente });
    }
    for (const p of desg.periodos) {
      if (resto <= 0) break;
      const a = Math.min(resto, p.monto); resto -= a;
      lineas.push({ txt: a >= p.monto ? `Cuota ${fmtFecha(p.fecha)}` : `Cuota ${fmtFecha(p.fecha)} (abona $${fmt(a)}, faltan $${fmt(p.monto - a)})`, ok: a >= p.monto });
    }
    if (resto > 0 && contratoDetalle.deudaContrato > 0) {
      const a = Math.min(resto, contratoDetalle.deudaContrato); resto -= a;
      lineas.push({ txt: a >= contratoDetalle.deudaContrato ? "Multa / deuda" : `Multa/deuda (abona $${fmt(a)})`, ok: a >= contratoDetalle.deudaContrato });
    }
    if (resto > 0 && contratoDetalle.cuotaConvenio > 0) {
      const a = Math.min(resto, contratoDetalle.cuotaConvenio); resto -= a;
      lineas.push({ txt: a >= contratoDetalle.cuotaConvenio ? "Cuota del convenio" : `Cuota convenio (abona $${fmt(a)})`, ok: a >= contratoDetalle.cuotaConvenio });
    }
    const totalDebe = cuotaPendiente + contratoDetalle.deudaContrato + contratoDetalle.cuotaConvenio;
    const quedaDebiendo = Math.max(totalDebe - monto, 0);
    return { lineas, quedaDebiendo, sobra: resto };
  })();

  // Financiar N cuotas de arriendo en el convenio: esas N semanas el cliente paga $0
  // (se las metemos al convenio) y su próximo pago normal avanza N semanas.
  // La primera cuota financiada = lo que FALTA del período actual (cuotaPendiente); las
  // demás = cuota completa (valorPeriodoReal). El día de reanudación (cubre_periodo_hasta)
  // = el día de pago siguiente al último período financiado.
  const convEsPeriodico = !!contratoDetalle && contratoDetalle.forma_pago !== "Diario";
  const valorCuotaConv = contratoDetalle ? valorPeriodoReal(contratoDetalle) : 0;
  // ¿Debe el período actual (no está al día)? → la primera cuota financiada es lo pendiente.
  const convDebeActual = contratoDetalle ? contratoDetalle.estadoCartera !== "al-dia" : false;
  const convPrimerCuotaFin = convDebeActual ? cuotaPendiente : valorCuotaConv;
  const convMontoFinanciado = convEsPeriodico && convFinanciarN >= 1
    ? convPrimerCuotaFin + (convFinanciarN - 1) * valorCuotaConv
    : 0;
  const convTotal = (Number(convDeudaTotal) || 0) + convMontoFinanciado;
  // Fecha en que reanuda pagos normales (si se financian semanas).
  const convCubreHasta = (() => {
    if (!contratoDetalle || !convEsPeriodico || convFinanciarN < 1) return null;
    const ancla = convDebeActual
      ? inicioPeriodoActual(contratoDetalle, hoyDate())
      : proximoDiaPago(contratoDetalle, hoyDate());
    let d = ancla;
    for (let i = 0; i < convFinanciarN; i++) d = proximoDiaPago(contratoDetalle, d);
    return fechaISO(d);
  })();
  const convCuotasCalc = convModoFijar === "cuotas"
    ? (Number(convCuotas) || 0)
    : (convTotal > 0 && Number(convCuota) > 0 ? Math.ceil(convTotal / Number(convCuota)) : 0);
  const convCuotaCalc = convModoFijar === "cuota"
    ? (Number(convCuota) || 0)
    : (convCuotasCalc > 0 ? Math.ceil(convTotal / convCuotasCalc) : 0);
  const convUltimaCuota = convCuotasCalc > 0 ? Math.max(convTotal - convCuotaCalc * (convCuotasCalc - 1), 0) : 0;

  // Fecha límite automática: día de pago de la última cuota pactada (avanza N períodos desde
  // hoy). Editable — se recalcula cuando cambia el número de cuotas resultante.
  useEffect(() => {
    if (!mostrarFormConvenio || convCuotasCalc <= 0) return;
    const contratoSel = contratos.find(c => c.id === contratoSeleccionadoId);
    if (!contratoSel) return;
    let d = hoyDate();
    for (let i = 0; i < convCuotasCalc; i++) d = proximoDiaPago(contratoSel, d);
    setConvFechaLimite(fechaISO(d));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convCuotasCalc, mostrarFormConvenio, contratoSeleccionadoId]);

  const desglose: AplicadoPago = contratoDetalle
    ? (() => {
        const a = calcularAplicacion(
          montoIngresado,
          cuotaPendiente,
          0,
          contratoDetalle.deudaContrato,
          contratoDetalle.cuotaConvenio,
        );
        // Ahorro con regla "tarifa primero, ahorro de último" — abonos parciales dan $0
        // hasta cubrir la parte de la empresa; al completar el período cierra exacto.
        a.ahorro = calcularAhorroAplicado(contratoDetalle, a.tarifa, enProrrateo,
          tarifaPagadaPeriodoActual(contratoDetalle, pagos.filter(p => p.contrato_id === contratoDetalle.id), hoyDate()));
        return a;
      })()
    : { tarifa: 0, baseInicial: 0, deuda: 0, convenio: 0, ahorro: 0, saldo: 0 };

  // ── Modal de pago: cálculos independientes ────────────────────────────────
  const modalContrato = modalContratoId
    ? resumenContratos.find(c => c.id === modalContratoId) ?? null
    : null;
  const modalCliente = modalContrato ? clientes.find(cl => cl.id === modalContrato.cliente_id) : null;
  const modalMoto = modalContrato ? motos.find(m => m.id === modalContrato.moto_id) : null;
  const modalPagos = modalContratoId ? pagosDelContrato(modalContratoId).slice(0, 8) : [];

  const modalEnProrrateo = !!modalContrato
    && modalContrato.forma_pago !== "Diario"
    && !!modalContrato.fecha_entrega
    && (modalContrato.sinPagosNunca ?? true);
  const modalCuotaPactada = modalContrato
    ? (modalContrato.forma_pago === "Diario"
        ? calcularCuotaDia(modalContrato.tarifa_diaria ?? 27000, esDomingo, modalContrato.tarifa_domingo)
        : modalEnProrrateo
          ? calcularProrrateoInicial(modalContrato)
          : valorPeriodoReal(modalContrato))
    : 0;
  const modalPagadoPeriodo = modalContrato?.forma_pago === "Diario"
    ? (modalContrato?.recaudadoHoy ?? 0)
    : (modalContrato?.pagadoEnPeriodoActual ?? 0);
  const modalCuotaPendiente = modalContrato
    ? (modalContrato.motor_v2 && modalContrato.forma_pago !== "Diario"
        ? huecoCuotasHoy(modalContrato, hoyDate())
        : Math.max(modalCuotaPactada - modalPagadoPeriodo, 0))
    : 0;
  const modalMonto = Number(modalValor) || 0;
  const modalDesglose: AplicadoPago = modalContrato
    ? (() => {
        const a = calcularAplicacion(modalMonto, modalCuotaPendiente, 0, modalContrato.deudaContrato, modalContrato.cuotaConvenio);
        a.ahorro = calcularAhorroAplicado(modalContrato, a.tarifa, modalEnProrrateo,
          tarifaPagadaPeriodoActual(modalContrato, pagos.filter(p => p.contrato_id === modalContrato.id), hoyDate()));
        return a;
      })()
    : { tarifa: 0, baseInicial: 0, deuda: 0, convenio: 0, ahorro: 0, saldo: 0 };

  function cerrarModalPago() {
    setModalPago(false); setModalBusqueda(""); setModalContratoId(null); setModalListaAbierta(false);
    setModalValor(""); setModalMetodo("Efectivo"); setModalError(null); setModalExito(false);
    setModalComprobante(null); setModalSubiendo(false);
  }

  const modalResultados = resumenContratos.filter(c => {
    const q = modalBusqueda.trim().toLowerCase();
    if (!q) return true;
    const cliente = clientes.find(cl => cl.id === c.cliente_id);
    const moto = motos.find(m => m.id === c.moto_id);
    return (cliente?.nombre ?? "").toLowerCase().includes(q) || (moto?.placa ?? "").toLowerCase().includes(q);
  });
  function etiquetaContrato(c: typeof resumenContratos[number]) {
    const cliente = clientes.find(cl => cl.id === c.cliente_id);
    const moto = motos.find(m => m.id === c.moto_id);
    return `${moto ? `${moto.placa} · ` : ""}${cliente?.nombre || "Sin cliente"}`;
  }

  // Valida y abre la ventana flotante de confirmación (en vez de registrar directo).
  function pedirConfirmacionModal() {
    if (!modalContratoId) { setModalError("Selecciona un contrato."); return; }
    if (!modalValor || modalMonto <= 0) { setModalError("Ingresa un valor válido."); return; }
    if (modalMetodo === "Transferencia" && !modalComprobante) { setModalError("Sube la foto del comprobante de la transferencia."); return; }
    setModalError(null);
    setConfirmarModalOpen(true);
  }

  async function handleRegistrarPagoModal() {
    if (modalSubiendo) return;
    if (!modalContratoId) { setModalError("Selecciona un contrato."); return; }
    if (!modalValor || modalMonto <= 0) { setModalError("Ingresa un valor válido."); return; }
    if (modalMetodo === "Transferencia" && !modalComprobante) { setModalError("Sube la foto del comprobante de la transferencia."); return; }
    setModalError(null); setModalExito(false);

    let comprobanteUrl: string | undefined;
    if (modalMetodo === "Transferencia" && modalComprobante) {
      setModalSubiendo(true);
      const { url, error: upErr } = await subirComprobante(modalComprobante, modalContratoId);
      setModalSubiendo(false);
      if (upErr) { setModalError("Error subiendo comprobante: " + upErr); return; }
      comprobanteUrl = url ?? undefined;
    }

    const folio = generarFolio();
    const { error } = await registrarPago(
      // Motor v2: el reparto lo hace la BD al confirmar; el desglose local es solo preview.
      modalContratoId, modalMonto, modalMetodo,
      modalContrato?.motor_v2 && modalContrato.forma_pago !== "Diario" ? APLICADO_LO_REPARTE_LA_BD : modalDesglose,
      {
        folio,
        comprobanteUrl,
        ...(modalContrato?.convenioActivo?.id ? { convenioId: modalContrato.convenioActivo.id } : {}),
      },
    );
    if (error) { setModalError(error); return; }
    setConfirmarModalOpen(false);

    const contrato = contratos.find(c => c.id === modalContratoId);
    const cliente = contrato ? clientes.find(cl => cl.id === contrato.cliente_id) : null;
    const moto = contrato ? motos.find(m => m.id === contrato.moto_id) : null;

    setModalValor(""); setModalComprobante(null);

    if (modalMetodo === "Efectivo") {
      // Efectivo = confirmado al instante → mostrar recibo
      setModalPago(false);
      setReciboData({
        folio,
        fecha: hoyISO(),
        clienteNombre: cliente?.nombre ?? "",
        clienteTel: cliente?.telefono ?? "",
        clienteWhatsapp: cliente?.whatsapp ?? "",
        placa: moto?.placa ?? "",
        grupo: moto?.grupo ?? "",
        valor: modalMonto,
        metodo: "Efectivo",
        estado: "Confirmado",
        debiaTotal: modalCuotaPendiente + (modalContrato?.deudaContrato ?? 0) + (modalContrato?.cuotaConvenio ?? 0),
        aplicadoTarifa: modalDesglose.tarifa,
        aplicadoDeuda: modalDesglose.deuda,
        aplicadoConvenio: modalDesglose.convenio,
        aplicadoSaldoFavor: modalDesglose.saldo,
        pendienteDespues: Math.max(modalCuotaPendiente + (modalContrato?.deudaContrato ?? 0) + (modalContrato?.cuotaConvenio ?? 0) - modalMonto, 0),
        convenioAbonado: modalContrato?.convenioActivo ? modalDesglose.convenio : null,
        convenioRestante: modalContrato?.convenioActivo
          ? Math.max(modalContrato.convenioActivo.deuda_total - sumaAbonadoConvenio(modalContrato.convenioActivo.id) - modalDesglose.convenio, 0)
          : null,
      });
    } else {
      // Transferencia = pendiente → solo aviso, el recibo saldrá al confirmar
      setModalExito(true);
      setTimeout(() => setModalExito(false), 4000);
    }
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  // Valida y abre la ventana flotante de confirmación (en vez de registrar directo).
  function pedirConfirmacionPago() {
    if (!contratoSeleccionadoId) { setFormError("Selecciona un contrato."); return; }
    if (!valor || montoIngresado <= 0) { setFormError("Ingresa un valor valido."); return; }
    setFormError(null);
    setConfirmarPagoOpen(true);
  }

  async function handleRegistrarPago() {
    if (procesando) return;
    if (!contratoSeleccionadoId) { setFormError("Selecciona un contrato."); return; }
    if (!valor || montoIngresado <= 0) { setFormError("Ingresa un valor valido."); return; }
    setFormError(null);
    setFormExito(false);
    setProcesando(true);
    try {
      const { error } = await registrarPago(
        contratoSeleccionadoId,
        montoIngresado,
        metodo,
        // Motor v2: la BD reparte al confirmar; el desglose local es solo preview.
        contratoDetalle?.motor_v2 && contratoDetalle.forma_pago !== "Diario" ? APLICADO_LO_REPARTE_LA_BD : desglose,
        contratoDetalle?.convenioActivo?.id ? { convenioId: contratoDetalle.convenioActivo.id } : undefined,
      );
      if (error) { setFormError(error); return; }
      setValor("");
      setConfirmarPagoOpen(false);
      setFormExito(true);
      setTimeout(() => setFormExito(false), 3000);
    } finally {
      setProcesando(false);
    }
  }

  async function handleAplicarSaldo() {
    if (procesando) return;
    if (!contratoSeleccionadoId || !contratoDetalle) return;
    const saldo = contratoDetalle.saldoAFavor ?? 0;
    if (saldo <= 0) return;
    if (!confirm(`¿Aplicar el saldo a favor de $${fmt(saldo)} a este contrato?`)) return;
    setProcesando(true);
    try {
      const aplicado = calcularAplicacion(saldo, cuotaPendiente, 0, contratoDetalle.deudaContrato, contratoDetalle.cuotaConvenio);
      aplicado.ahorro = calcularAhorroAplicado(contratoDetalle, aplicado.tarifa, enProrrateo,
        tarifaPagadaPeriodoActual(contratoDetalle, pagos.filter(p => p.contrato_id === contratoDetalle.id), hoyDate()));
      const { error } = await registrarPago(
        contratoSeleccionadoId, saldo, "Efectivo",
        contratoDetalle.motor_v2 && contratoDetalle.forma_pago !== "Diario" ? APLICADO_LO_REPARTE_LA_BD : aplicado,
        contratoDetalle.convenioActivo?.id ? { convenioId: contratoDetalle.convenioActivo.id } : undefined,
      );
      if (error) { setFormError(error); return; }
      setSaldoExito(true);
      setTimeout(() => setSaldoExito(false), 3000);
    } finally {
      setProcesando(false);
    }
  }

  async function handleRegistrarDeuda() {
    if (procesando) return;
    if (!contratoSeleccionadoId || !profile) return;
    if (!deudaMonto || Number(deudaMonto) <= 0) { setDeudaError("Ingresa un monto válido."); return; }
    if (!deudaDescripcion.trim()) { setDeudaError("Ingresa una descripción."); return; }
    if (!confirm(`¿Registrar esta deuda de $${fmt(Number(deudaMonto))} (${deudaConcepto})?`)) return;
    setDeudaError(null);
    setProcesando(true);
    try {
      const { error } = await registrarDeuda(contratoSeleccionadoId, deudaConcepto, deudaDescripcion, Number(deudaMonto), profile.id);
      if (error) { setDeudaError(error); return; }
      setDeudaMonto(""); setDeudaDescripcion("");
      setDeudaExito(true); setMostrarFormDeuda(false);
      setTimeout(() => setDeudaExito(false), 3000);
    } finally {
      setProcesando(false);
    }
  }

  async function handleCrearConvenio() {
    if (procesando) return;
    if (!contratoSeleccionadoId || !profile) return;
    if (!convDeudaTotal || convCuotaCalc <= 0 || convCuotasCalc <= 0 || !convFechaLimite || !convConcepto.trim()) {
      setConvError("Completa el monto, la cuota o número de cuotas, la fecha y el concepto."); return;
    }
    if (!convFirma) { setConvError("Falta la firma del acuerdo. El cliente debe firmar antes de crear el convenio."); return; }
    if (!confirm(`¿Crear el convenio por $${fmt(Number(convDeudaTotal))} en ${convCuotasCalc} cuota(s) de $${fmt(convCuotaCalc)}?`)) return;
    setConvError(null);
    setProcesando(true);
    try {
      // El total ya incluye las cuotas de arriendo financiadas (convTotal). convCubreHasta
      // marca hasta cuándo el cliente paga $0 (esas semanas quedan financiadas, sin mora).
      const cubrePeriodoHasta = convCubreHasta;
      // Sube la firma del acuerdo a Storage (bucket documentos).
      const path = `convenios/${contratoSeleccionadoId}/acuerdo_${Date.now()}.png`;
      const blob = await (await fetch(convFirma)).blob();
      const { error: errSub } = await supabase.storage.from("documentos").upload(path, blob, { contentType: "image/png", upsert: true });
      if (errSub) { setConvError("No se pudo subir la firma: " + errSub.message); return; }
      const firmaUrl = supabase.storage.from("documentos").getPublicUrl(path).data.publicUrl;
      const { error } = await crearConvenio(
        contratoSeleccionadoId, convTotal, convCuotaCalc,
        convCuotasCalc, convFechaLimite, convConcepto, profile.id, cubrePeriodoHasta, firmaUrl
      );
      if (error) { setConvError(error); return; }
      setConvDeudaTotal(""); setConvCuota(""); setConvCuotas(""); setConvFechaLimite(""); setConvConcepto(""); setConvFinanciarN(0); setConvModoFijar("cuotas"); setConvFirma(null); setVerPreviewAcuerdo(false);
      setConvExito(true); setMostrarFormConvenio(false);
      setTimeout(() => setConvExito(false), 3000);
    } finally {
      setProcesando(false);
    }
  }

  async function handleRegistrarGestion() {
    if (procesando) return;
    if (!contratoSeleccionadoId || !profile) return;
    setGestionError(null);
    setProcesando(true);
    try {
      const { error } = await registrarGestion(contratoSeleccionadoId, tipoGestion, resultadoGestion, profile.id);
      if (error) { setGestionError(error); return; }
      setResultadoGestion("");
      setGestionExito(true);
      setTimeout(() => setGestionExito(false), 3000);
    } finally {
      setProcesando(false);
    }
  }


  // Captura GPS del lugar del cobro
  function capturarGPSCampo() {
    if (!navigator.geolocation) { setCampoGpsEstado("error"); return; }
    setCampoGpsEstado("capturando");
    navigator.geolocation.getCurrentPosition(
      pos => { setCampoUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setCampoGpsEstado("ok"); },
      () => setCampoGpsEstado("error"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  // Abre el modal de cobro en campo para un contrato y captura GPS automáticamente
  function abrirCobroCampo(contratoId: string) {
    setContratoSeleccionadoId(null);
    setCampoContratoId(contratoId);
    setCampoMonto(""); setCampoNota(""); setCampoError(""); setCampoFoto(null);
    setCampoUbicacion(null); setCampoGpsEstado("idle");
    setModalCampoAbierto(true);
    capturarGPSCampo();
  }

  // Abre el modal de cobro en campo en modo búsqueda (sin contrato preseleccionado)
  function abrirModalCampoBusqueda() {
    setCampoContratoId(null);
    setCampoBusqueda("");
    setModalCampoAbierto(true);
  }

  function cerrarModalCampo() {
    setModalCampoAbierto(false);
    setCampoContratoId(null);
    setCampoBusqueda("");
    setCampoMonto(""); setCampoNota(""); setCampoError(""); setCampoFoto(null);
    setCampoUbicacion(null); setCampoGpsEstado("idle");
  }

  // Recibo provisional por WhatsApp al cliente
  function enviarReciboCampo(r: typeof resumenContratos[number], monto: number, folio: string) {
    const cliente = clientes.find(cl => cl.id === r.cliente_id);
    const moto = motos.find(m => m.id === r.moto_id);
    const tel = (cliente?.whatsapp || cliente?.telefono || "").replace(/\D/g, "");
    const num = tel.startsWith("57") ? tel : `57${tel}`;
    const lineas = [
      "🧾 *GPS SATELITAL — Recibo provisional (cobro en campo)*",
      `Folio: ${folio}`,
      `Fecha: ${new Date().toLocaleDateString("es-CO")}`,
      `Cliente: ${(cliente?.nombre ?? "").toUpperCase()}`,
      moto ? `Placa: ${moto.placa}` : "",
      `Monto recibido: $${fmt(monto)}`,
      "",
      "⏳ Pago recibido en campo. Pendiente de validación en caja. Conserve este comprobante.",
    ].filter(Boolean).join("\n");
    if (num.length >= 9) window.open(`https://wa.me/${num}?text=${encodeURIComponent(lineas)}`, "_blank");
  }

  // Valida y abre la ventana flotante de confirmación (en vez de registrar directo).
  function pedirConfirmacionCampo() {
    if (!campoContratoId || !campoMonto) { setCampoError("Completa el contrato y el monto"); return; }
    if (!profile) { setCampoError("Sesión no válida"); return; }
    if (Number(campoMonto) <= 0) { setCampoError("Monto inválido"); return; }
    setCampoError("");
    setConfirmarCampoOpen(true);
  }

  async function handleCampoSubmit() {
    if (procesando) return;
    if (!campoContratoId || !campoMonto) { setCampoError("Completa el contrato y el monto"); return; }
    if (!profile) { setCampoError("Sesión no válida"); return; }
    const monto = Number(campoMonto);
    if (monto <= 0) { setCampoError("Monto inválido"); return; }
    const r = resumenContratos.find(x => x.id === campoContratoId);
    if (!r) { setCampoError("Contrato no encontrado"); return; }

    const enProrrateoCampo = estaEnProrrateo(r, r.sinPagosNunca ?? true);
    const cuotaPact = r.forma_pago === "Diario"
      ? calcularCuotaDia(r.tarifa_diaria ?? 27000, esDomingo, r.tarifa_domingo)
      : enProrrateoCampo
        ? calcularProrrateoInicial(r)
        : valorPeriodoReal(r);
    const pagadoP = r.forma_pago === "Diario" ? (r.recaudadoHoy ?? 0) : (r.pagadoEnPeriodoActual ?? 0);
    const cuotaPend = r.motor_v2 && r.forma_pago !== "Diario"
      ? huecoCuotasHoy(r, hoyDate())
      : Math.max(cuotaPact - pagadoP, 0);
    const aplicado = calcularAplicacion(monto, cuotaPend, 0, r.deudaContrato, r.cuotaConvenio);
    aplicado.ahorro = calcularAhorroAplicado(r, aplicado.tarifa, enProrrateoCampo,
      tarifaPagadaPeriodoActual(r, pagos.filter(p => p.contrato_id === r.id), hoyDate()));
    const folio = generarFolio();

    setProcesando(true);
    try {
      // Foto opcional
      let comprobanteUrl: string | undefined;
      if (campoFoto) {
        const { url, error: upErr } = await subirComprobante(campoFoto, campoContratoId);
        if (upErr) { setCampoError(`Error subiendo foto: ${upErr}`); return; }
        comprobanteUrl = url ?? undefined;
      }
      const { error } = await registrarCobroCampo(
        campoContratoId, monto,
        r.motor_v2 && r.forma_pago !== "Diario" ? APLICADO_LO_REPARTE_LA_BD : aplicado,
        profile.id, folio, { ubicacion: campoUbicacion, comprobanteUrl },
      );
      if (error) { setCampoError(error); return; }
      setConfirmarCampoOpen(false);
      const nota = `Efectivo recuperado en campo (${folio}): $${fmt(monto)}.${campoNota.trim() ? ` ${campoNota}` : ""}${campoUbicacion ? ` [GPS ${campoUbicacion.lat.toFixed(5)},${campoUbicacion.lng.toFixed(5)}]` : ""}`;
      await registrarGestion(campoContratoId, "cobro_campo", nota, profile.id);
      enviarReciboCampo(r, monto, folio);
      setCampoExito(true);
      setTimeout(() => { setCampoExito(false); setCampoContratoId(null); setCampoMonto(""); setCampoNota(""); setCampoError(""); setCampoFoto(null); setCampoUbicacion(null); setCampoGpsEstado("idle"); }, 2500);
    } finally {
      setProcesando(false);
    }
  }

  // ── Pagos pendientes de confirmación (transferencias + cobros en campo) ─────
  const pagosPendientes = useMemo(
    () => pagos.filter(p => p.estado === "Pendiente"),
    [pagos],
  );
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

  // ── Historial filtrado ────────────────────────────────────────────────────
  const pagosFiltrados = useMemo(() => {
    const base = filtroPagos === "todos" ? pagos : pagos.filter(p => p.estado === filtroPagos);
    return [...base].sort((a, b) => {
      if (a.estado === "Pendiente" && b.estado !== "Pendiente") return -1;
      if (b.estado === "Pendiente" && a.estado !== "Pendiente") return 1;
      return 0;
    });
  }, [pagos, filtroPagos]);

  if (loadingPagos || loadingContratos) {
    return <div style={{ padding: 24, color: "#64748b" }}>Cargando cartera...</div>;
  }

  // ── Panel de detalle del contrato ─────────────────────────────────────────
  function PanelDetalle() {
    if (!contratoDetalle) {
      return (
        <div style={{ ...card, color: "#64748b", textAlign: "center", padding: 40 }}>
          Selecciona un contrato de la lista para ver el detalle y registrar pagos.
        </div>
      );
    }

    const ec = calcEstadoCuenta(
      contratoDetalle,
      pagosDelContrato(contratoDetalle.id).filter(p => p.estado === "Confirmado"),
    );
    // El protocolo (mensaje→llamada→apagado→recolección) SOLO aplica si el cliente está
    // de verdad en mora (mismo criterio que el Panel Hoy). Antes se mostraba con "días
    // desde el último pago" > 0, que es > 0 aunque esté al día → salía "Paso 4 Recolección"
    // a clientes al día (ej. migrados que pagaron hace unos días).
    const protocolo = contratoDetalle.estadoCartera === "mora" ? calcProtocoloStep(contratoDetalle.diasSinPago) : null;
    // Con convenio: la deuda la paga el convenio → NO se suma completa (contaría doble).
    // A pagar este período = cuota pendiente + cuota del convenio. Si está al día, 0.
    // Sin convenio: cuota pendiente + deuda (esa deuda sí se cobra).
    const cvActiva = contratoDetalle.convenioActivo;
    const cuotaConvActiva = cvActiva?.cuota_por_periodo ?? 0; // cuota completa del convenio (próximo pago)
    // Lo que se EXIGE del convenio este período (0 si el convenio se creó después de vencer la semana).
    const cuotaConvExigida = cuotaConvenioDelPeriodo(cvActiva, contratoDetalle, hoyDate());
    // Saldo del convenio = lo firmado menos lo abonado (deudaContrato ya NO lo incluye:
    // ahora solo cuenta deuda exigible 'pendiente'; lo del convenio vive en el convenio).
    const saldoConvenio = cvActiva ? Math.max(cvActiva.deuda_total - sumaAbonadoConvenio(cvActiva.id), 0) : 0;
    // deudaContrato (solo 'pendiente', ej. una multa nueva) SÍ se cobra directo, con o sin convenio.
    const totalPendiente = (cvActiva
      ? (contratoDetalle.estadoCartera === "al-dia" ? 0 : cuotaPendiente + cuotaConvExigida)
      : cuotaPendiente) + contratoDetalle.deudaContrato;
    const proximoPagoConv = valorPeriodoReal(contratoDetalle) + cuotaConvActiva; // cuota + convenio próxima fecha
    // Si el convenio cubrió la cuota de esta semana, ese período ya no se cobra → el próximo
    // pago es cubre_periodo_hasta, que se guardó justamente como el día de pago SIGUIENTE
    // al período cubierto (ej. convenio del mié 8 → cubre_periodo_hasta = mié 15).
    const cubreHasta = cvActiva?.cubre_periodo_hasta ?? null;
    const proximoPagoFecha = cubreHasta && cubreHasta >= hoyISO() ? cubreHasta : ec.proximoPago;

    // "Debe pagar ahora" respetando la cobertura del convenio: si el convenio cubre hasta una
    // fecha >= hoy, las cajas de ese período ya están financiadas y NO se exigen ahora. El total
    // del bloque es SIEMPRE la suma exacta de las líneas que muestra (cajas exigibles + deuda
    // pendiente + cuota de convenio ya vigente).
    const convCubreAhora = !!(cubreHasta && cubreHasta >= hoyISO());
    const periodosDebe = desg ? (convCubreAhora ? desg.periodos.filter(p => p.fecha >= cubreHasta!) : desg.periodos) : [];
    const prorrateoDebe = desg ? (convCubreAhora ? 0 : desg.prorrateoPendiente) : 0;
    // Con motor de cajas (desg) el total respeta la cobertura del convenio; sin desg (Diario/v1)
    // se cae al cálculo de siempre para no alterar esos contratos.
    const totalDebeAhora = desg
      ? prorrateoDebe + periodosDebe.reduce((s, p) => s + p.monto, 0) + contratoDetalle.deudaContrato + cuotaConvExigida
      : totalPendiente;

    // Estado de cuenta (imprimir/WhatsApp) — usa los MISMOS valores ya calculados arriba
    // para esta pantalla (totalPendiente, deudas, convenio), nunca un cálculo aparte.
    function armarDatosEstadoCuenta(): DatosEstadoCuenta {
      const c = contratoDetalle!;
      return {
        cuotaPeriodo: valorPeriodoReal(c),
        diaPagoLabel: formatDiaPago(c),
        estadoLabel: ESTADO_CARTERA_STYLE[c.estadoCartera].label,
        debeHoy: totalDebeAhora,
        ahorroTotal: (c.ahorro_acumulado ?? 0) + (c.ahorro_apertura ?? 0),
        apertura: empalmePendiente(c) ? { viejo: c.ahorro_apertura ?? 0, nuevo: c.ahorro_acumulado ?? 0 } : null,
        // Ciclos completos: se calcula desde los pagos confirmados (funciona igual antes
        // y después de consolidar el empalme, cuando apertura y acumulado se funden).
        ahorroCiclos: (() => {
          const monto = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado")
            .reduce((s, p) => s + (p.aplicado_ahorro ?? 0), 0);
          const porCiclo = ahorroPeriodoExacto(c, false);
          return monto > 0 && porCiclo > 0 ? { monto, ciclos: Math.floor(monto / porCiclo) } : null;
        })(),
        deudas: deudasContrato.map(d => ({ concepto: d.concepto, pendiente: d.monto_pendiente })),
        convenio: cvActiva ? { total: cvActiva.deuda_total, cuota: cvActiva.cuota_por_periodo, pagadas: cvActiva.cuotas_pagadas, numero: cvActiva.numero_cuotas, fechaLimite: cvActiva.fecha_limite } : null,
        saldoFavor: c.saldoAFavor ?? 0,
        pagosRecientes: pagosContrato.slice(0, 5).filter(p => p.estado === "Confirmado").map(p => ({ fecha: p.fecha, valor: p.valor, metodo: p.metodo })),
        inicioContrato: c.fecha_entrega,
        finContrato: infoFinContrato(c),
        cajas: c.motor_v2 && (c.total_cajas ?? 0) > 0 ? { pagadas: c.cajas_pagadas ?? 0, total: c.total_cajas! } : null,
      };
    }

    function imprimirEstadoCuenta() {
      if (!clienteDetalle) return;
      const html = generarHTMLEstadoCuenta(clienteDetalle, motoDetalle ?? null, armarDatosEstadoCuenta());
      const w = window.open("", "_blank", "width=420,height=640");
      if (!w) return;
      w.document.write(`<!DOCTYPE html><html><head><title>Estado de cuenta</title><style>*{print-color-adjust:exact;-webkit-print-color-adjust:exact}@media print{body{margin:0}}</style></head><body>${html}</body></html>`);
      w.document.close();
      w.focus();
      w.print();
    }

    function enviarEstadoCuentaWhatsApp() {
      if (!clienteDetalle) return;
      const texto = armarTextoEstadoCuenta(clienteDetalle, motoDetalle ?? null, armarDatosEstadoCuenta());
      const num = (clienteDetalle.whatsapp || clienteDetalle.telefono || "").replace(/\D/g, "");
      const full = num.length === 10 ? `57${num}` : num;
      if (full.length >= 11) window.open(`https://wa.me/${full}?text=${encodeURIComponent(texto)}`, "_blank");
      else alert("El cliente no tiene un número de WhatsApp válido registrado.");
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {isMobile && (
          <button onClick={() => setContratoSeleccionadoId(null)} style={{ ...secondaryBtn, fontSize: 13, padding: "8px 14px", alignSelf: "flex-start" }}>
            ← Volver
          </button>
        )}

        {/* Header */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 20, textTransform: "uppercase", color: "#0f172a", lineHeight: 1.2 }}>
                {clienteDetalle?.nombre || "Sin cliente"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6, fontSize: 13 }}>
                {motoDetalle && (
                  <button onClick={() => onNavigate?.("ficha_moto", motoDetalle.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#0284c7", fontWeight: 700, fontSize: 13 }}>
                    🏍️ {motoDetalle.placa}
                  </button>
                )}
                {clienteDetalle?.telefono && <span style={{ color: "#334155" }}>📞 {clienteDetalle.telefono}</span>}
                {clienteDetalle?.cedula && <span style={{ color: "#64748b" }}>CC {clienteDetalle.cedula}</span>}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                Contrato {contratoDetalle.forma_pago ?? "semanal"} · Paga {formatDiaPago(contratoDetalle)}
                {clienteDetalle?.direccion && ` · ${clienteDetalle.direccion}`}
              </div>
              {contratoDetalle.motor_v2 && (contratoDetalle.total_cajas ?? 0) > 0 && (
                <div style={{ fontSize: 12, fontWeight: 800, color: "#0369a1", marginTop: 2 }}>
                  📦 Va {contratoDetalle.cajas_pagadas ?? 0} de {contratoDetalle.total_cajas} cuotas pagadas
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
              <EstadoBadge estado={contratoDetalle.estadoCartera} />
              {onNavigate && clienteDetalle && (
                <button onClick={() => onNavigate("ficha_cliente", clienteDetalle.id)} style={{ background: "none", border: "none", color: "#0284c7", fontWeight: 700, fontSize: 12, cursor: "pointer", padding: 0 }}>
                  Ver ficha →
                </button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <button onClick={imprimirEstadoCuenta} style={{ ...secondaryBtn, fontSize: 12, padding: "7px 12px" }}>📄 Estado de cuenta</button>
            <button onClick={enviarEstadoCuentaWhatsApp} style={{ ...secondaryBtn, fontSize: 12, padding: "7px 12px", color: "#166534" }}>📱 Enviar por WhatsApp</button>
          </div>
        </div>

        {/* Empalme de migrados: revisión de cifras viejas + confirmación (mig 043) */}
        {empalmePendiente(contratoDetalle) && (
          <PanelEmpalme
            contrato={contratoDetalle}
            cliente={clienteDetalle ?? null}
            deudaApertura={contratoDetalle.deudaContrato}
            puedeCerrar={esSecretaria || esAdmin}
            onConfirmar={() => cerrarEmpalme(contratoDetalle.id)}
          />
        )}

        {/* Estado de cuenta — la etiqueta/color usan estadoCartera (misma fuente que el badge),
            no la función vieja, para que no diga "Gabela" mientras el badge dice "Al día". */}
        <div style={{ ...card, background: ESTADO_CARTERA_STYLE[contratoDetalle.estadoCartera].bg, border: `1px solid ${ESTADO_CARTERA_STYLE[contratoDetalle.estadoCartera].color}44` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 13, color: "#334155", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: ESTADO_CARTERA_STYLE[contratoDetalle.estadoCartera].color }}>{ESTADO_CARTERA_STYLE[contratoDetalle.estadoCartera].label}</span>
              {ec.ultimoPago && <span>Último: <strong>{fmtFecha(ec.ultimoPago)}</strong></span>}
              <span>Próximo: <strong>{fmtFecha(proximoPagoFecha)}</strong></span>
            </div>
            {protocolo && (
              <span style={{ fontSize: 12, fontWeight: 700, color: protocolo.color, background: protocolo.bg, borderRadius: 8, padding: "3px 10px" }}>
                Paso {protocolo.paso}: {protocolo.label}
              </span>
            )}
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div style={{ background: "rgba(255,255,255,0.75)", borderRadius: 10, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>
                {contratoDetalle.forma_pago === "Diario" ? "Cuota hoy" : "Cuota período"}
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>$ {fmt(cuotaPactada)}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.75)", borderRadius: 10, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>
                {contratoDetalle.forma_pago === "Diario" ? "Pagado hoy" : "Pagado período"}
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>$ {fmt(pagadoEnPeriodo)}</div>
            </div>
            {/* "Al día" solo si de verdad no debe nada — incluye deuda pendiente y convenio,
                no solo la cuota de esta semana (mismo criterio que Panel Hoy y Cobro en campo). */}
            <div style={{ background: enProrrateo ? "#eff6ff" : totalDebeAhora > 0 ? "#fecaca" : "#bbf7d0", borderRadius: 10, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>
                {enProrrateo ? "Próx. pago" : "Pendiente"}
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: enProrrateo ? "#0284c7" : totalDebeAhora > 0 ? "#991b1b" : "#166534" }}>
                {enProrrateo ? `$ ${fmt(cuotaPactada)}` : totalDebeAhora > 0 ? `$ ${fmt(totalDebeAhora)}` : "✓ Al día"}
              </div>
            </div>
          </div>

          {/* Desglose por fecha (motor de cajas): qué períodos debe y de qué fecha — para que el
              funcionario sepa de un vistazo qué cobrar. Respeta lo que el convenio ya cubre y el
              TOTAL es SIEMPRE la suma exacta de las líneas mostradas. */}
          {desg && totalDebeAhora > 0 && (
            <div style={{ marginTop: 12, background: "white", borderRadius: 10, padding: "10px 12px", border: "1px solid #fecaca" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#991b1b", textTransform: "uppercase" }}>Debe pagar ahora</span>
                {periodosDebe.length >= 2 && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#991b1b", background: "#fee2e2", borderRadius: 999, padding: "2px 8px" }}>🔴 {periodosDebe.length} cuotas vencidas</span>
                )}
              </div>
              <div style={{ display: "grid", gap: 3 }}>
                {prorrateoDebe > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#334155" }}>
                    <span>Prorrateo inicial</span><strong>$ {fmt(prorrateoDebe)}</strong>
                  </div>
                )}
                {periodosDebe.map((p, i) => (
                  <div key={p.fecha} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#334155", fontWeight: i === 0 ? 700 : 400 }}>
                    <span style={{ minWidth: 0 }}>
                      Cuota {fmtFecha(p.fecha)}{p.parcial ? " (parcial)" : ""}
                      <span style={{ color: p.diasVencida > 0 ? "#991b1b" : "#c2410c", fontWeight: 700 }}> · {p.diasVencida > 0 ? `${p.diasVencida}d vencida` : "vence hoy"}</span>
                    </span>
                    <strong style={{ flexShrink: 0 }}>$ {fmt(p.monto)}</strong>
                  </div>
                ))}
                {contratoDetalle.deudaContrato > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#334155" }}>
                    <span>Multa / deuda</span><strong>$ {fmt(contratoDetalle.deudaContrato)}</strong>
                  </div>
                )}
                {cuotaConvExigida > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#334155" }}>
                    <span>Cuota del convenio</span><strong>$ {fmt(cuotaConvExigida)}</strong>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>TOTAL A COBRAR</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#991b1b" }}>$ {fmt(totalDebeAhora)}</span>
              </div>
              {desg.proximaFecha && (
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                  Después de esto, próximo pago: <strong>{fmtFecha(desg.proximaFecha)}</strong> · $ {fmt(desg.proximoMonto + cuotaConvActiva)}
                  {cuotaConvActiva > 0 && <span> (cuota $ {fmt(desg.proximoMonto)} + convenio $ {fmt(cuotaConvActiva)})</span>}
                </div>
              )}
            </div>
          )}

          {/* Al día (nada exigible ahora): solo el próximo pago y su fecha */}
          {desg && totalDebeAhora === 0 && (desg.proximaFecha || (cubreHasta && cubreHasta >= hoyISO())) && (
            <div style={{ marginTop: 12, background: "#f0fdf4", borderRadius: 10, padding: "10px 12px", border: "1px solid #bbf7d0", fontSize: 13, color: "#166534" }}>
              ✓ Al día · Próximo pago: <strong>{fmtFecha(proximoPagoFecha)}</strong> · $ {fmt(desg.proximoMonto + cuotaConvActiva)}
              {cuotaConvActiva > 0 && <span style={{ fontSize: 12 }}> (cuota $ {fmt(desg.proximoMonto)} + convenio $ {fmt(cuotaConvActiva)})</span>}
            </div>
          )}

          {cvActiva ? (
            /* Contrato con convenio: se muestra "al día con convenio" + próximo pago (cuota+conv),
               y el saldo del convenio como referencia — la deuda NO se suma como si fuera aparte. */
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              {/* El "próximo pago" solo cuando está al día. Si está en gabela/mora, lo que debe
                  AHORA ya lo muestra el recuadro "Pendiente" — no se duplica con "próximo pago". */}
              {contratoDetalle.estadoCartera === "al-dia" && (
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "8px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" }}>
                    Próximo pago{contratoDetalle.forma_pago !== "Diario" ? ` — ${fmtFecha(proximoPagoFecha)}` : ""}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1d4ed8", marginTop: 2 }}>$ {fmt(proximoPagoConv)}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>cuota $ {fmt(valorPeriodoReal(contratoDetalle))} + convenio $ {fmt(cuotaConvActiva)}</div>
                </div>
              )}
              <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 8, padding: "4px 10px", fontWeight: 700, alignSelf: "flex-start" }}>
                🤝 Convenio #{cvActiva.numero_convenio} · saldo $ {fmt(saldoConvenio)}
              </span>
            </div>
          ) : contratoDetalle.deudaContrato > 0 ? (
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", fontSize: 13 }}>
              <span style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "4px 10px", fontWeight: 700 }}>
                + Deuda: $ {fmt(contratoDetalle.deudaContrato)}
              </span>
              {totalPendiente > cuotaPendiente && (
                <span style={{ background: "rgba(255,255,255,0.8)", borderRadius: 8, padding: "4px 10px", fontWeight: 900, fontSize: 14, color: "#991b1b", marginLeft: "auto" }}>
                  Total: $ {fmt(totalPendiente)}
                </span>
              )}
            </div>
          ) : null}

          {(contratoDetalle.saldoAFavor ?? 0) > 0 && (
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#eff6ff", borderRadius: 10, padding: "8px 12px" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0284c7", textTransform: "uppercase" }}>Saldo a favor</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#0284c7" }}>$ {fmt(contratoDetalle.saldoAFavor ?? 0)}</div>
              </div>
              {puedeAplicarSaldo && (
                <button onClick={handleAplicarSaldo} style={{ background: "#0284c7", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Aplicar
                </button>
              )}
            </div>
          )}
          {saldoExito && (
            <div style={{ marginTop: 6, padding: "6px 10px", background: "#dcfce7", borderRadius: 8, color: "#166534", fontWeight: 700, fontSize: 12 }}>
              ✅ Saldo aplicado.
            </div>
          )}
        </div>

        {/* Formulario de pago */}
        <div style={card}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Registrar pago</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: "2 1 130px" }}>
              <MoneyInput label="Valor recibido" value={valor} onChange={v => { setValor(v); setFormExito(false); }} />
            </div>
            <div style={{ flex: "3 1 160px" }}>
              <div style={labelStyle}>Método</div>
              <div style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", borderColor: "#bbf7d0", color: "#166534", fontWeight: 700 }}>
                💵 Efectivo (confirma automático)
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Para transferencia usa el botón "💵 Cobrar" (pide la foto del comprobante).</div>
            </div>
          </div>

          {/* Motor de cajas: "qué cubre este pago" POR FECHA (FIFO en vivo) */}
          {coberturaEnVivo && (
            <div style={{ background: "#eff6ff", borderRadius: 10, padding: "10px 12px", border: "1px solid #bfdbfe", marginTop: 10, display: "grid", gap: 4, fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: 2 }}>Este pago cubre:</div>
              {coberturaEnVivo.lineas.map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", color: l.ok ? "#166534" : "#92400e" }}>
                  <span>{l.ok ? "✓" : "•"}</span><span>{l.txt}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #bfdbfe", marginTop: 4, paddingTop: 4, fontWeight: 800, color: coberturaEnVivo.quedaDebiendo > 0 ? "#991b1b" : "#166534" }}>
                {coberturaEnVivo.quedaDebiendo > 0
                  ? `Quedaría debiendo: $ ${fmt(coberturaEnVivo.quedaDebiendo)}`
                  : coberturaEnVivo.sobra > 0
                    ? `Queda al día · sobra $ ${fmt(coberturaEnVivo.sobra)} (saldo a favor)`
                    : "Queda al día ✓"}
              </div>
            </div>
          )}

          {montoIngresado > 0 && !coberturaEnVivo && (
            <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 12px", border: "1px solid #bbf7d0", marginTop: 10, display: "grid", gap: 4, fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: "#166534", marginBottom: 2 }}>Cómo se aplica:</div>
              {desglose.tarifa > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Cuota</span><span style={{ fontWeight: 700 }}>$ {fmt(desglose.tarifa)}</span>
                </div>
              )}
              {desglose.deuda > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Deuda</span><span style={{ fontWeight: 700 }}>$ {fmt(desglose.deuda)}</span>
                </div>
              )}
              {desglose.convenio > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Convenio</span><span style={{ fontWeight: 700 }}>$ {fmt(desglose.convenio)}</span>
                </div>
              )}
              {desglose.saldo > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#0284c7", fontWeight: 700 }}>
                  <span>Saldo a favor</span><span>$ {fmt(desglose.saldo)}</span>
                </div>
              )}
              <div style={{ borderTop: "1px solid #bbf7d0", marginTop: 4, paddingTop: 4, display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
                <span>Total</span><span>$ {fmt(montoIngresado)}</span>
              </div>
            </div>
          )}

          {formError && <div style={{ color: "#991b1b", fontWeight: 600, fontSize: 13, marginTop: 8 }}>{formError}</div>}
          {formExito && (
            <div style={{ color: "#166534", background: "#dcfce7", padding: "8px 12px", borderRadius: 10, fontWeight: 700, fontSize: 13, marginTop: 8 }}>
              ✅ Pago registrado.
            </div>
          )}
          <button onClick={pedirConfirmacionPago} disabled={procesando} style={{ ...primaryBtn, width: "100%", marginTop: 10, padding: "12px 16px", opacity: procesando ? 0.6 : 1 }}>
            Registrar pago
          </button>
        </div>

        {confirmarPagoOpen && contratoDetalle && (() => {
          const cDup = contratos.find(c => c.id === contratoSeleccionadoId);
          const cliDup = cDup ? clientes.find(c => c.id === cDup.cliente_id) : null;
          const motDup = cDup ? motos.find(m => m.id === cDup.moto_id) : null;
          const dup = !!pagos.find(p => p.contrato_id === contratoSeleccionadoId && p.estado !== "Rechazado" && Math.round(p.valor) === montoIngresado && p.fecha === hoyISO());
          return (
            <ModalConfirmarPago
              monto={montoIngresado}
              metodo="Efectivo"
              clienteNombre={cliDup?.nombre ?? ""}
              placa={motDup?.placa}
              duplicado={dup}
              procesando={procesando}
              onCancelar={() => setConfirmarPagoOpen(false)}
              onConfirmar={handleRegistrarPago}
            />
          );
        })()}

        {/* Tabs secundarias */}
        <div style={card}>
          <div style={{ display: "flex", gap: 4, marginBottom: 14, borderBottom: "2px solid #f1f5f9", paddingBottom: 10, flexWrap: "wrap" }}>
            {(["gestiones", "deudas", "convenios", "historial"] as const).map(t => (
              <button
                key={t}
                onClick={() => setDetailTab(t)}
                style={{
                  background: detailTab === t ? "#0f172a" : "transparent",
                  color: detailTab === t ? "white" : "#64748b",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {t === "gestiones" ? "Gestiones" : t === "deudas" ? `Deudas${deudasContrato.length > 0 ? ` (${deudasContrato.length})` : ""}` : t === "convenios" ? "Convenio" : "Historial"}
              </button>
            ))}
          </div>

          {/* Tab Gestiones */}
          {detailTab === "gestiones" && (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <select style={{ ...inputStyle, flex: 1, minWidth: 120 }} value={tipoGestion} onChange={e => setTipoGestion(e.target.value as TipoGestion)}>
                  <option value="llamada">Llamada</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="visita">Visita</option>
                  <option value="apagado_moto">Apagado de moto</option>
                  <option value="sirena">Sirena</option>
                  <option value="recuperacion">Recuperación</option>
                  <option value="otro">Otro</option>
                </select>
                <input style={{ ...inputStyle, flex: 2, minWidth: 160 }} value={resultadoGestion} onChange={e => setResultadoGestion(e.target.value)} placeholder="Resultado / nota..." />
              </div>
              {gestionError && <div style={{ color: "#991b1b", fontSize: 13, fontWeight: 600 }}>{gestionError}</div>}
              {gestionExito && <div style={{ color: "#166534", background: "#dcfce7", padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>Gestión registrada.</div>}
              <button onClick={handleRegistrarGestion} disabled={procesando} style={{ ...secondaryBtn, opacity: procesando ? 0.6 : 1 }}>{procesando ? "Registrando..." : "Registrar gestión"}</button>
              {gestionesContrato.length > 0 && (
                <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
                  {gestionesContrato.map(g => (
                    <div key={g.id} style={{ padding: "8px 12px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}>
                      <span style={{ fontWeight: 700 }}>{g.tipo}</span>
                      {g.resultado && <span style={{ color: "#64748b" }}> — {g.resultado}</span>}
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{formatDate(g.fecha)}</div>
                    </div>
                  ))}
                </div>
              )}
              {gestionesContrato.length === 0 && <div style={{ color: "#64748b", fontSize: 14 }}>Sin gestiones registradas.</div>}
            </div>
          )}

          {/* Tab Deudas */}
          {detailTab === "deudas" && (
            <div style={{ display: "grid", gap: 10 }}>
              {deudasContrato.length === 0 ? (
                <div style={{ color: "#64748b", fontSize: 14 }}>Sin deudas pendientes.</div>
              ) : deudasContrato.map(d => (
                deudaEditandoId === d.id ? (
                  <div key={d.id} style={{ padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", display: "grid", gap: 10 }}>
                    <div>
                      <div style={labelStyle}>Concepto</div>
                      <select style={inputStyle} value={editConcepto} onChange={e => setEditConcepto(e.target.value as ConceptoDeuda)}>
                        <option value="daño_vehiculo">Daño al vehículo</option>
                        <option value="tarifa_atrasada">Tarifa atrasada</option>
                        <option value="prestamo_repuesto">Préstamo repuestos</option>
                        <option value="prestamo_eventualidad">Préstamo eventualidad</option>
                        <option value="fotomulta">Fotomulta</option>
                        <option value="multa_recoleccion">Multa recolección</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <div style={labelStyle}>Descripción</div>
                      <input style={inputStyle} value={editDescripcion} onChange={e => setEditDescripcion(e.target.value)} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <MoneyInput label="Monto original" value={editMonto} onChange={setEditMonto} />
                      <MoneyInput label="Monto pendiente" value={editMontoPendiente} onChange={setEditMontoPendiente} />
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>Si el pendiente llega a $0, la deuda queda marcada como pagada automáticamente.</div>
                    {editDeudaError && <div style={{ color: "#991b1b", fontSize: 13, fontWeight: 600 }}>{editDeudaError}</div>}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setDeudaEditandoId(null)} style={{ ...miniBtn("#f1f5f9", "#334155"), flex: 1 }}>Cancelar</button>
                      <button onClick={() => handleEliminarDeuda(d.id)} disabled={guardandoEditDeuda} style={{ ...miniBtn("#fee2e2", "#991b1b"), flex: 1, opacity: guardandoEditDeuda ? 0.6 : 1 }}>🗑️ Eliminar</button>
                      <button onClick={() => guardarEdicionDeuda(d)} disabled={guardandoEditDeuda} style={{ ...primaryBtn, flex: 1, opacity: guardandoEditDeuda ? 0.6 : 1 }}>
                        {guardandoEditDeuda ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={d.id} style={{ padding: "10px 12px", borderRadius: 12, background: "#fff7f7", border: "1px solid #fecaca", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{d.concepto.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{d.descripcion}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#991b1b", whiteSpace: "nowrap" }}>$ {fmt(d.monto_pendiente)}</div>
                      {puedeEditarDeuda && (
                        <button onClick={() => abrirEdicionDeuda(d)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15 }}>✏️</button>
                      )}
                    </div>
                  </div>
                )
              ))}
              {puedeEditarDeuda && (
                <div>
                  <button onClick={() => setMostrarFormDeuda(v => !v)} style={miniBtn("#f1f5f9", "#334155")}>
                    {mostrarFormDeuda ? "Cancelar" : "+ Registrar deuda"}
                  </button>
                  {mostrarFormDeuda && (
                    <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14, marginTop: 10, display: "grid", gap: 10 }}>
                      <div>
                        <div style={labelStyle}>Concepto</div>
                        <select style={inputStyle} value={deudaConcepto} onChange={e => setDeudaConcepto(e.target.value as ConceptoDeuda)}>
                          <option value="daño_vehiculo">Daño al vehículo</option>
                          <option value="tarifa_atrasada">Tarifa atrasada</option>
                          <option value="prestamo_repuesto">Préstamo repuestos</option>
                          <option value="prestamo_eventualidad">Préstamo eventualidad</option>
                          <option value="fotomulta">Fotomulta</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                      <div>
                        <div style={labelStyle}>Descripción</div>
                        <input style={inputStyle} value={deudaDescripcion} onChange={e => setDeudaDescripcion(e.target.value)} placeholder="Detalle del origen de la deuda..." />
                      </div>
                      <MoneyInput label="Monto" value={deudaMonto} onChange={setDeudaMonto} />
                      {deudaError && <div style={{ color: "#991b1b", fontSize: 13, fontWeight: 600 }}>{deudaError}</div>}
                      {deudaExito && <div style={{ color: "#166534", background: "#dcfce7", padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>Deuda registrada.</div>}
                      <button onClick={handleRegistrarDeuda} disabled={procesando} style={{ ...primaryBtn, opacity: procesando ? 0.6 : 1 }}>{procesando ? "Registrando..." : "Registrar deuda"}</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab Convenios */}
          {detailTab === "convenios" && (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontSize: 13, color: "#64748b" }}>{totalConvenios}/3 convenios usados.</div>
              {!esAdmin ? (
                <div style={{ color: "#64748b", fontSize: 14 }}>Solo administradores pueden gestionar convenios.</div>
              ) : convenioActual ? (
                <div style={{ background: "#fffbeb", borderRadius: 12, padding: 14, border: "1px solid #fde68a" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#92400e" }}>Convenio #{convenioActual.numero_convenio} — Activo</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{convenioActual.concepto}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                    <InfoBox label="Deuda total" value={`$ ${fmt(convenioActual.deuda_total)}`} />
                    <InfoBox label="Cuota por período" value={`$ ${fmt(convenioActual.cuota_por_periodo)}`} highlight />
                    <InfoBox label="Cuotas" value={`${convenioActual.cuotas_pagadas} / ${convenioActual.numero_cuotas}`} />
                    <InfoBox label="Fecha límite" value={formatDate(convenioActual.fecha_limite)} />
                  </div>
                </div>
              ) : totalConvenios >= 3 ? (
                <div style={{ color: "#991b1b", fontSize: 14, fontWeight: 600 }}>
                  Máximo de 3 convenios. Si vuelve a incumplir, procede liquidación.
                </div>
              ) : deudasContrato.length === 0 ? (
                <div style={{ color: "#64748b", fontSize: 14 }}>No hay deudas pendientes para crear un convenio.</div>
              ) : !puedeCrearConvenio ? (
                <div style={{ color: "#64748b", fontSize: 13 }}>No tienes permiso para crear convenios — pídele al encargado que lo cree.</div>
              ) : (
                <div>
                  <button
                    onClick={() => {
                      const abrir = !mostrarFormConvenio;
                      // Al abrir, precarga el monto con la deuda pendiente (lo normal — editable para descuentos/acuerdos parciales).
                      if (abrir) setConvDeudaTotal(String(deudasContrato.reduce((a, d) => a + d.monto_pendiente, 0)));
                      setMostrarFormConvenio(abrir);
                    }}
                    style={miniBtn("#eff6ff", "#1e40af")}
                  >
                    {mostrarFormConvenio ? "Cancelar" : "+ Crear convenio"}
                  </button>
                  {mostrarFormConvenio && (
                    <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14, marginTop: 10, display: "grid", gap: 10 }}>
                      <div style={{ fontSize: 13, color: "#64748b" }}>
                        Deuda pendiente: <strong style={{ color: "#991b1b" }}>$ {fmt(deudasContrato.reduce((a, d) => a + d.monto_pendiente, 0))}</strong>
                      </div>
                      <MoneyInput label="Monto total a diferir" value={convDeudaTotal} onChange={setConvDeudaTotal} />
                      {convEsPeriodico && (
                        <div style={{ padding: "10px 12px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                            ¿Cuántas semanas de cuota le financias ahora? (se las metes al convenio, no las paga aparte)
                          </div>
                          <div style={{ display: "flex", gap: 8, marginBottom: convFinanciarN >= 1 ? 6 : 0 }}>
                            {[0, 1, 2].map(n => (
                              <button key={n} type="button" onClick={() => setConvFinanciarN(n)}
                                style={{ flex: 1, padding: "8px 10px", borderRadius: 10, border: `2px solid ${convFinanciarN === n ? "#0284c7" : "#e2e8f0"}`, background: convFinanciarN === n ? "#eff6ff" : "white", color: convFinanciarN === n ? "#0284c7" : "#64748b", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                                {n}
                              </button>
                            ))}
                          </div>
                          {convFinanciarN >= 1 && (
                            <div style={{ fontSize: 12, color: "#64748b" }}>
                              Se financian <strong>{convFinanciarN}</strong> semana{convFinanciarN > 1 ? "s" : ""} = <strong>$ {fmt(convMontoFinanciado)}</strong> al convenio. El cliente paga $0 hasta el <strong>{convCubreHasta ? fmtFecha(convCubreHasta) : ""}</strong>. Total a diferir: <strong>$ {fmt(convTotal)}</strong>.
                            </div>
                          )}
                        </div>
                      )}
                      <div>
                        <div style={labelStyle}>Fijar por</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button type="button" onClick={() => setConvModoFijar("cuotas")} style={{ flex: 1, padding: "8px 10px", borderRadius: 10, border: `2px solid ${convModoFijar === "cuotas" ? "#0284c7" : "#e2e8f0"}`, background: convModoFijar === "cuotas" ? "#eff6ff" : "white", color: convModoFijar === "cuotas" ? "#0284c7" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>N° de cuotas</button>
                          <button type="button" onClick={() => setConvModoFijar("cuota")} style={{ flex: 1, padding: "8px 10px", borderRadius: 10, border: `2px solid ${convModoFijar === "cuota" ? "#0284c7" : "#e2e8f0"}`, background: convModoFijar === "cuota" ? "#eff6ff" : "white", color: convModoFijar === "cuota" ? "#0284c7" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Valor de la cuota</button>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {convModoFijar === "cuotas" ? (
                          <div>
                            <div style={labelStyle}>Número de cuotas</div>
                            <input type="number" min="1" style={inputStyle} value={convCuotas} onChange={e => setConvCuotas(e.target.value)} placeholder="Ej. 30" />
                          </div>
                        ) : (
                          <MoneyInput label="Valor de la cuota" value={convCuota} onChange={setConvCuota} placeholder="$ 100.000" />
                        )}
                        <div>
                          <div style={labelStyle}>{convModoFijar === "cuotas" ? "Cuota (calculada)" : "N° de cuotas (calculado)"}</div>
                          <div style={{ ...inputStyle, background: "#f1f5f9", color: "#334155", fontWeight: 700 }}>
                            {convModoFijar === "cuotas" ? (convCuotaCalc > 0 ? `$ ${fmt(convCuotaCalc)}` : "—") : (convCuotasCalc > 0 ? convCuotasCalc : "—")}
                          </div>
                        </div>
                      </div>
                      {convCuotasCalc > 0 && convCuotaCalc > 0 && (
                        <div style={{ padding: "8px 12px", borderRadius: 10, background: "#dbeafe", border: "1px solid #bfdbfe", fontSize: 12.5, fontWeight: 700, color: "#1d4ed8" }}>
                          {convCuotasCalc} cuota{convCuotasCalc > 1 ? "s" : ""} de $ {fmt(convCuotaCalc)}
                          {convUltimaCuota !== convCuotaCalc && convCuotasCalc > 1 && <> · última: $ {fmt(convUltimaCuota)}</>}
                          <span style={{ fontWeight: 400 }}> · Total: $ {fmt(convTotal)}</span>
                        </div>
                      )}
                      <div>
                        <div style={labelStyle}>Fecha límite <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: 12 }}>(automática — editable)</span></div>
                        <input type="date" style={inputStyle} value={convFechaLimite} onChange={e => setConvFechaLimite(e.target.value)} />
                      </div>
                      <div>
                        <div style={labelStyle}>Concepto / Motivo</div>
                        <input style={inputStyle} value={convConcepto} onChange={e => setConvConcepto(e.target.value)} placeholder="Descripción del convenio..." />
                      </div>

                      {/* Previsualización del acuerdo + firma obligatoria del cliente */}
                      <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                        <button type="button" onClick={() => setVerPreviewAcuerdo(v => !v)} style={miniBtn("#f1f5f9", "#334155")}>
                          {verPreviewAcuerdo ? "Ocultar acuerdo" : "👁 Ver acuerdo de pago (para que el cliente lo lea)"}
                        </button>
                        {verPreviewAcuerdo && clienteDetalle && (
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, maxHeight: 340, overflowY: "auto", background: "white" }}
                            dangerouslySetInnerHTML={{ __html: generarHTMLAcuerdoPago(clienteDetalle, motoDetalle ?? null, deudasContrato, { deuda_total: convTotal, cuota_por_periodo: convCuotaCalc, numero_cuotas: convCuotasCalc, firma_url: convFirma }, infoFinContrato(contratoDetalle)) }} />
                        )}
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>Firma del cliente (obligatoria para crear el convenio):</div>
                        <CanvasFirma key="firma-acuerdo" label="Firma del cliente" modal opcional={false} onChange={setConvFirma} />
                      </div>

                      {convError && <div style={{ color: "#991b1b", fontSize: 13, fontWeight: 600 }}>{convError}</div>}
                      {convExito && <div style={{ color: "#166534", background: "#dcfce7", padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>Convenio creado.</div>}
                      <button onClick={handleCrearConvenio} disabled={procesando || !convFirma} style={{ ...primaryBtn, opacity: procesando || !convFirma ? 0.6 : 1 }}>{procesando ? "Creando..." : "Crear convenio"}</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab Historial */}
          {detailTab === "historial" && (
            <div style={{ display: "grid", gap: 8 }}>
              {pagosContrato.length === 0 ? (
                <div style={{ color: "#64748b", fontSize: 14 }}>Sin pagos registrados.</div>
              ) : pagosContrato.map(p => {
                // Desglose de a dónde se aplicó el pago. Cuota + Deuda + Convenio + Saldo a
                // favor suman el valor total; el Ahorro es la parte de la cuota que es ahorro
                // del cliente (va DENTRO de la cuota, no se suma aparte).
                // Se leen las columnas nuevas; si están en 0 (pago viejo) se usa el jsonb
                // legacy `aplicado` ({semana, deuda, convenio, saldo, ahorro}) como respaldo.
                const leg = p.aplicado ?? ({} as Partial<Aplicado>);
                const cuota = (p.aplicado_tarifa ?? 0) || (leg.semana ?? 0);
                const deudaAp = (p.aplicado_deuda ?? 0) || (leg.deuda ?? 0);
                const convAp = (p.aplicado_convenio ?? 0) || (leg.convenio ?? 0);
                const saldoAp = (p.aplicado_saldo_favor ?? 0) || (leg.saldo ?? 0);
                // Ahorro: NO usar || — con la regla tarifa-primero, $0 es un valor real
                // (abono parcial sin ahorro), no "sin registrar"; el || caía al jsonb
                // legacy y mostraba la cifra proporcional vieja ($13.333) ya recalculada.
                const ahorroAp = p.aplicado_ahorro ?? leg.ahorro ?? 0;
                const partes: string[] = [];
                if (cuota > 0) partes.push(`Cuota $${fmt(cuota)}`);
                if (deudaAp > 0) partes.push(`Deuda $${fmt(deudaAp)}`);
                if (convAp > 0) partes.push(`Convenio $${fmt(convAp)}`);
                if (saldoAp > 0) partes.push(`Saldo a favor $${fmt(saldoAp)}`);
                return (
                <div key={p.id} style={{ padding: "10px 12px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>$ {fmt(p.valor)}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{formatDate(p.fecha)} · {p.metodo}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <PagoBadge estado={p.estado} />
                      {p.estado === "Pendiente" && puedeConfirmarPago && (
                        <>
                          <button onClick={() => confirmarPago(p.id)} style={miniBtn("#dcfce7", "#166534")}>Confirmar</button>
                          <button onClick={() => rechazarPago(p.id)} style={miniBtn("#fee2e2", "#991b1b")}>Rechazar</button>
                        </>
                      )}
                    </div>
                  </div>
                  {p.estado !== "Rechazado" && (partes.length > 0 || ahorroAp > 0) && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #cbd5e1", fontSize: 11, color: "#0369a1", fontWeight: 600, display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                      <span style={{ color: "#94a3b8" }}>Se aplicó a:</span>
                      {partes.length > 0 ? partes.map((t, i) => <span key={i} style={{ background: "#e0f2fe", borderRadius: 999, padding: "2px 8px" }}>→ {t}</span>) : <span style={{ color: "#94a3b8" }}>sin desglose (pago antiguo)</span>}
                      {ahorroAp > 0 && <span style={{ color: "#94a3b8", fontWeight: 400 }}>(de la cuota, ${fmt(ahorroAp)} fue ahorro)</span>}
                    </div>
                  )}
                </div>
              );})}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Lista de contratos para un tab ────────────────────────────────────────
  function ListaContratos({ lista }: { lista: typeof resumenContratos }) {
    if (lista.length === 0) {
      return <div style={{ color: "#64748b", fontSize: 14, padding: "12px 0" }}>Sin contratos en esta categoría.</div>;
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lista.map(c => {
          const cliente = clientes.find(cl => cl.id === c.cliente_id);
          const moto = motos.find(m => m.id === c.moto_id);
          const seleccionado = c.id === contratoSeleccionadoId;
          const paso = c.estadoCartera === "mora" ? calcProtocoloStep(c.diasSinPago) : null;

          const enProrrateoLista = estaEnProrrateo(c, c.sinPagosNunca ?? true);
          const cuotaPact = c.forma_pago === "Diario"
            ? calcularCuotaDia(c.tarifa_diaria ?? 27000, new Date().getDay() === 0, c.tarifa_domingo)
            : enProrrateoLista ? calcularProrrateoInicial(c) : valorPeriodoReal(c);
          const pagadoP = c.forma_pago === "Diario" ? (c.recaudadoHoy ?? 0) : (c.pagadoEnPeriodoActual ?? 0);
          // Incluye deuda pendiente y convenio — mismo criterio que Panel Hoy, para no mostrar
          // "Al día" a alguien que arrastra deuda de apertura u otra deuda registrada.
          const pendiente = Math.max(cuotaPact - pagadoP, 0) + c.deudaContrato + c.cuotaConvenio;

          return (
            <div
              key={c.id}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: seleccionado ? "2px solid #0284c7" : `1px solid ${c.estadoCartera === "mora" ? "#fecaca" : "#e2e8f0"}`,
                background: seleccionado ? "#eff6ff" : c.estadoCartera === "mora" ? "#fff5f5" : "#f8fafc",
                gap: 8,
              }}
            >
              {/* Fila principal — clic para ver detalle */}
              <div
                onClick={() => setContratoSeleccionadoId(c.id)}
                style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>
                    {cliente?.nombre || "Sin cliente"}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {moto ? `🏍️ ${moto.placa} · ` : ""}
                    {c.forma_pago === "Diario" ? "Diario" : `Paga ${formatDiaPago(c)}`}
                    {c.diasSinPago > 0 && c.diasSinPago < 999 && c.estadoCartera !== "al-dia" && (
                      <span style={{ color: "#991b1b", fontWeight: 700 }}> · {c.diasSinPago}d sin pagar</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <EstadoBadge estado={c.estadoCartera} />
                  {empalmePendiente(c) && (
                    <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 999, padding: "3px 8px", fontSize: 10, fontWeight: 800 }}>⚠️ Empalme</span>
                  )}
                  {/* Migrado ya confirmado que debe y no tiene acuerdo de pago → falta sentarlo a firmar convenio */}
                  {!empalmePendiente(c) && c.es_migrado && c.deudaContrato > 0 && !c.convenioActivo && (
                    <span style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 999, padding: "3px 8px", fontSize: 10, fontWeight: 800 }}>📝 Falta convenio</span>
                  )}
                </div>
              </div>

              {/* Fila inferior — monto + protocolo + botón pagar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 8 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  {pendiente > 0 ? (
                    <span style={{ fontSize: 12, fontWeight: 700, color: enProrrateoLista ? "#0284c7" : "#991b1b", background: enProrrateoLista ? "#eff6ff" : "#fee2e2", borderRadius: 8, padding: "2px 8px" }}>
                      {enProrrateoLista ? `Próx. pago $${fmt(pendiente)}` : `Debe $${fmt(pendiente)}`}
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#166534", background: "#dcfce7", borderRadius: 8, padding: "2px 8px" }}>
                      ✓ Al día
                    </span>
                  )}
                  {paso && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: paso.color, background: paso.bg, borderRadius: 8, padding: "2px 8px" }}>
                      P{paso.paso}: {paso.label}
                    </span>
                  )}
                  {c.pendientesCount > 0 && (
                    <span style={{ fontSize: 11, color: "#92400e" }}>{c.pendientesCount} pend.</span>
                  )}
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setModalContratoId(c.id);
                    setModalBusqueda(etiquetaContrato(c));
                    setModalListaAbierta(false);
                    setModalPago(true);
                  }}
                  style={{ ...miniBtn("#0284c7", "white"), padding: "5px 12px", fontSize: 12, flexShrink: 0 }}
                >
                  💰 Pagar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── KPI cards ─────────────────────────────────────────────────────────────
  // Cada KPI lleva a Contratos con el filtro puesto (o a Historial)
  function irAContratos(filtro: FiltroContratos) { setActiveTab("contratos"); setFiltroContratos(filtro); setContratoSeleccionadoId(null); }
  const kpis: { label: string; value: string | number; sub?: string; color: string; bg: string; onClick: () => void }[] = [
    { label: "Pagan hoy", value: totalPaganHoy, color: "#0284c7", bg: "#eff6ff", onClick: () => irAContratos("pagan-hoy") },
    { label: "Recaudado hoy", value: `$${fmt(recaudadoHoyTotal)}`, sub: `Semana: $${fmt(recaudadoSemanaTotal)}`, color: "#166534", bg: "#dcfce7", onClick: () => { setActiveTab("historial"); setContratoSeleccionadoId(null); } },
    { label: "En gabela", value: enGabela.length, color: "#92400e", bg: "#fef3c7", onClick: () => irAContratos("gabela") },
    { label: "En mora", value: enMora.length, color: "#991b1b", bg: "#fee2e2", onClick: () => irAContratos("mora") },
  ];

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "hoy", label: "📋 Hoy", count: totalTareasHoy },
    { key: "contratos", label: "📁 Contratos", count: resumenContratos.length },
    { key: "dinero", label: isMobile ? "⏳ Confirmar" : "⏳ Por confirmar", count: pagosPendientes.length },
    { key: "historial", label: "🧾 Historial" },
  ];

  const FILTROS_CONTRATOS: { key: FiltroContratos; label: string; count: number }[] = [
    { key: "todos", label: "Todos", count: resumenContratos.length },
    { key: "mora", label: "🔴 Mora", count: enMora.length },
    { key: "gabela", label: "🟡 Gabela", count: enGabela.length },
    { key: "al-dia", label: "🟢 Al día", count: alDia.length },
    { key: "pagan-hoy", label: "🔵 Pagan hoy", count: totalPaganHoy },
    { key: "convenio", label: "🤝 Convenio", count: conConvenio.length },
  ];

  // On mobile with a selected contract → show only detail
  if (isMobile && contratoSeleccionadoId) {
    return (
      <div style={{ padding: "0 0 80px" }}>
        {PanelDetalle()}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <h2 style={{ fontSize: 24, margin: 0, fontWeight: 800 }}>Cartera</h2>
      <p style={{ marginTop: 6, color: "#64748b", margin: "6px 0 0" }}>
        Control de cobros, deudas, convenios y gestiones de mora.
      </p>

      {errorPagos && (
        <div style={{ marginTop: 12, color: "#991b1b", background: "#fee2e2", padding: "10px 14px", borderRadius: 12 }}>
          Error: {errorPagos}
        </div>
      )}

      {/* KPI cards — 2x2 grid, clickable */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
        {kpis.map(k => (
          <button
            key={k.label}
            onClick={k.onClick}
            style={{
              background: "white",
              border: "2px solid transparent",
              borderRadius: 16,
              padding: "14px 16px",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
            {k.sub && (
              <div style={{ fontSize: 11, color: k.color, opacity: 0.75, marginTop: 2 }}>{k.sub}</div>
            )}
          </button>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: isMobile ? 3 : 8, marginTop: 20, overflowX: "auto", paddingBottom: 4 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setContratoSeleccionadoId(null); }}
            style={{
              background: activeTab === t.key ? "#0284c7" : "#f1f5f9",
              color: activeTab === t.key ? "white" : "#334155",
              border: "none",
              borderRadius: 999,
              padding: isMobile ? "5px 6px" : "8px 16px",
              fontWeight: 700,
              fontSize: isMobile ? 10.5 : 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {t.label}
            {t.count !== undefined && (
              <span style={{
                marginLeft: isMobile ? 3 : 6,
                background: activeTab === t.key ? "rgba(255,255,255,0.3)" : "#e2e8f0",
                color: activeTab === t.key ? "white" : "#64748b",
                borderRadius: 999,
                padding: isMobile ? "1px 4px" : "1px 7px",
                fontSize: isMobile ? 9.5 : 11,
                fontWeight: 700,
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panel HOY — mismo diseño que Contratos */}
      {activeTab === "hoy" && (() => {
        type TareasDef = readonly { tipo: TipoGestion; label: string; action: (c: typeof resumenContratos[number]) => void; bg: string; color: string }[];
        const GRUPOS_HOY: { key: FiltroHoy; emoji: string; titulo: string; color: string; bg: string; lista: typeof resumenContratos; tareas: TareasDef }[] = [
          { key: "recoleccion", emoji: "🚚", titulo: "Recolección", color: "#7f1d1d", bg: "#fee2e2", lista: panelHoy.recoleccion,
            tareas: [
              { tipo: "mensaje_recordatorio" as TipoGestion, label: "Mensaje", action: tareaMensaje, bg: "#dbeafe", color: "#1d4ed8" },
              { tipo: "llamada" as TipoGestion, label: "Llamar", action: tareaLlamar, bg: "#e0f2fe", color: "#0284c7" },
              { tipo: "sirena" as TipoGestion, label: "Sirena", action: tareaSirena, bg: "#fef3c7", color: "#92400e" },
              // Recolectar la moto = acción sensible (permiso por persona, default ADMIN+SUBADMIN)
              ...(puedeRecolectar ? [{ tipo: "recoleccion" as TipoGestion, label: "Recolección", action: tareaRecoleccion, bg: "#fee2e2", color: "#991b1b" }] : []),
            ] },
          { key: "mora", emoji: "🔴", titulo: "Mora", color: "#991b1b", bg: "#fee2e2", lista: panelHoy.mora,
            tareas: [
              { tipo: "mensaje_recordatorio" as TipoGestion, label: "Mensaje", action: tareaMensaje, bg: "#dbeafe", color: "#1d4ed8" },
              { tipo: "llamada" as TipoGestion, label: "Llamar", action: tareaLlamar, bg: "#e0f2fe", color: "#0284c7" },
              { tipo: "sirena" as TipoGestion, label: "Sirena", action: tareaSirena, bg: "#fef3c7", color: "#92400e" },
            ] },
          { key: "gabela", emoji: "🟡", titulo: "Gabela", color: "#92400e", bg: "#fef3c7", lista: panelHoy.gabela,
            tareas: [
              { tipo: "mensaje_recordatorio" as TipoGestion, label: "Mensaje", action: tareaMensaje, bg: "#dbeafe", color: "#1d4ed8" },
              { tipo: "llamada" as TipoGestion, label: "Llamar", action: tareaLlamar, bg: "#e0f2fe", color: "#0284c7" },
              { tipo: "sirena" as TipoGestion, label: "Sirena", action: tareaSirena, bg: "#fef3c7", color: "#92400e" },
            ] },
          { key: "pagan-hoy", emoji: "🔵", titulo: "Pagan hoy", color: "#0284c7", bg: "#eff6ff", lista: panelHoy.paganHoy,
            tareas: [
              { tipo: "mensaje_recordatorio" as TipoGestion, label: "Mensaje", action: tareaMensaje, bg: "#dbeafe", color: "#1d4ed8" },
              { tipo: "llamada" as TipoGestion, label: "Llamar", action: tareaLlamar, bg: "#e0f2fe", color: "#0284c7" },
            ] },
        ];

        // Lista activa según filtro + búsqueda
        const grupoActivo = filtroHoy === "todos"
          ? { tareas: GRUPOS_HOY[1].tareas as TareasDef, lista: [...panelHoy.recoleccion, ...panelHoy.mora, ...panelHoy.gabela, ...panelHoy.paganHoy], color: "#0f172a", bg: "#f1f5f9" }
          : GRUPOS_HOY.find(g => g.key === filtroHoy) ?? GRUPOS_HOY[1];

        const qHoy = busquedaHoy.toLowerCase();
        const listaHoy = grupoActivo.lista.filter(c => {
          if (!qHoy) return true;
          const cliente = clientes.find(cl => cl.id === c.cliente_id);
          const moto = motos.find(m => m.id === c.moto_id);
          return (cliente?.nombre ?? "").toLowerCase().includes(qHoy) || (moto?.placa ?? "").toLowerCase().includes(qHoy);
        });

        // Pendientes primero (I): los que tienen alguna tarea sin hacer van arriba
        const listaOrdenada = [...listaHoy].sort((a, b) => {
          const tareasDe = (c: typeof resumenContratos[number]) => {
            const g = GRUPOS_HOY.find(gr => gr.lista.some(x => x.id === c.id));
            return g ? g.tareas : [];
          };
          const aHecha = tareasDe(a).every(t => gestionHechaHoy(a.id, t.tipo));
          const bHecha = tareasDe(b).every(t => gestionHechaHoy(b.id, t.tipo));
          if (aHecha && !bHecha) return 1;
          if (!aHecha && bHecha) return -1;
          return 0;
        });

        const CHIPS_HOY: { key: FiltroHoy; label: string; count: number }[] = [
          { key: "todos", label: "Todos", count: totalTareasHoy },
          { key: "recoleccion", label: "🚚 Recolec.", count: panelHoy.recoleccion.length },
          { key: "mora", label: "🔴 Mora", count: panelHoy.mora.length },
          { key: "gabela", label: "🟡 Gabela", count: panelHoy.gabela.length },
          { key: "pagan-hoy", label: "🔵 Pagan hoy", count: panelHoy.paganHoy.length },
        ];

        return (
          <div style={{ marginTop: 20 }}>
            {/* Chips de filtro — igual que Contratos */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CHIPS_HOY.map(ch => (
                <button
                  key={ch.key}
                  onClick={() => setFiltroHoy(ch.key)}
                  style={{
                    background: filtroHoy === ch.key ? "#0284c7" : "#f1f5f9",
                    color: filtroHoy === ch.key ? "white" : "#334155",
                    border: "none", borderRadius: 999, padding: "5px 10px",
                    fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  {ch.label}
                  <span style={{
                    marginLeft: 4,
                    background: filtroHoy === ch.key ? "rgba(255,255,255,0.3)" : "#e2e8f0",
                    color: filtroHoy === ch.key ? "white" : "#64748b",
                    borderRadius: 999, padding: "1px 5px", fontSize: 11, fontWeight: 700,
                  }}>{ch.count}</span>
                </button>
              ))}
            </div>

            {/* Resumen campo */}
            {puedeCobroCampo && misCobrosCampoHoy.count > 0 && (
              <div style={{ marginTop: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ fontSize: 13, color: "#166534", fontWeight: 700 }}>💵 Recogiste hoy: ${fmt(misCobrosCampoHoy.total)} en {misCobrosCampoHoy.count} cobro(s)</div>
                {misCobrosCampoHoy.pendienteEntregar > 0 && (
                  <div style={{ fontSize: 12, color: "#92400e", marginTop: 2 }}>Pendiente entregar a caja: <strong>${fmt(misCobrosCampoHoy.pendienteEntregar)}</strong></div>
                )}
              </div>
            )}

            {/* Buscador — igual que Contratos */}
            <div style={{ marginTop: 12 }}>
              <input
                value={busquedaHoy}
                onChange={e => setBusquedaHoy(e.target.value)}
                placeholder="Buscar cliente o placa..."
                style={{ ...inputStyle, background: "white" }}
              />
            </div>

            {/* Lista en recuadro con scroll — igual que Contratos */}
            {totalTareasHoy === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 16px", color: "#94a3b8" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
                <div style={{ fontWeight: 700, color: "#166534" }}>No tienes tareas pendientes hoy</div>
              </div>
            ) : (
              <div style={{ marginTop: 12, background: "white", borderRadius: 16, padding: 12, boxShadow: "0 4px 16px rgba(15,23,42,0.06)", maxHeight: isMobile ? "56vh" : "62vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {listaOrdenada.length === 0 ? (
                  <div style={{ color: "#64748b", fontSize: 14, padding: "12px 0" }}>Sin resultados.</div>
                ) : listaOrdenada.map(c => {
                  const cliente = clientes.find(cl => cl.id === c.cliente_id);
                  const moto = motos.find(m => m.id === c.moto_id);
                  const grupoC = GRUPOS_HOY.find(g => g.lista.some(x => x.id === c.id));
                  const tareasDe = grupoC ? grupoC.tareas : [];
                  const todasHechas = tareasDe.length > 0 && tareasDe.every(t => gestionHechaHoy(c.id, t.tipo));
                  const borderColor = grupoC ? grupoC.color : "#e2e8f0";

                  // Monto que debe pagar
                  const enProrrateoHoy = estaEnProrrateo(c, c.sinPagosNunca ?? true);
                  const cuotaP = c.forma_pago === "Diario"
                    ? calcularCuotaDia(c.tarifa_diaria ?? 27000, new Date().getDay() === 0, c.tarifa_domingo)
                    : enProrrateoHoy ? calcularProrrateoInicial(c) : valorPeriodoReal(c);
                  const pagP = c.forma_pago === "Diario" ? (c.recaudadoHoy ?? 0) : (c.pagadoEnPeriodoActual ?? 0);
                  const cuotaPendParte = c.motor_v2 && c.forma_pago !== "Diario"
                    ? huecoCuotasHoy(c, hoyDate())
                    : Math.max(cuotaP - pagP, 0);
                  // Con convenio la deuda la paga el convenio (no se suma completa). Si está al día, no debe nada.
                  const debePagar = c.estadoCartera === "al-dia"
                    ? 0
                    : cuotaPendParte + (c.convenioActivo ? c.cuotaConvenio : c.deudaContrato);

                  return (
                    <div
                      key={c.id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: todasHechas ? "1px solid #e2e8f0" : `1px solid ${borderColor}44`,
                        borderLeft: `4px solid ${todasHechas ? "#cbd5e1" : borderColor}`,
                        background: todasHechas ? "#f8fafc" : "white",
                        opacity: todasHechas ? 0.6 : 1,
                        display: "flex", flexDirection: "column", gap: 10,
                      }}
                    >
                      {/* Fila superior: nombre + badge — clic va al detalle */}
                      <div
                        onClick={() => setContratoSeleccionadoId(c.id)}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, cursor: "pointer" }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", color: "#0f172a" }}>
                            {cliente?.nombre ?? "Sin cliente"}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                            {moto && <span style={{ color: "#0284c7", fontWeight: 600 }}>🏍️ {moto.placa} · </span>}
                            {c.diasSinPago > 0 && c.diasSinPago < 999 && c.estadoCartera !== "al-dia"
                              ? <span style={{ color: "#991b1b", fontWeight: 700 }}>{c.diasSinPago}d sin pagar</span>
                              : <span>{c.forma_pago === "Diario" ? "Diario" : `Paga ${formatDiaPago(c)}`}</span>
                            }
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                          <EstadoBadge estado={c.estadoCartera} />
                          {empalmePendiente(c) && (
                            <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 999, padding: "3px 8px", fontSize: 10, fontWeight: 800 }}>⚠️ Empalme</span>
                          )}
                        </div>
                      </div>

                      {/* Fila inferior: monto + botones de tarea */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span
                          style={{ fontSize: 12, fontWeight: 700, color: debePagar > 0 ? "#991b1b" : "#166534", background: debePagar > 0 ? "#fee2e2" : "#dcfce7", borderRadius: 8, padding: "2px 8px" }}
                        >
                          {todasHechas ? "✓ Listo" : debePagar > 0
                            ? `Debe $${fmt(debePagar)} (cuota $${fmt(cuotaPendParte)}${c.convenioActivo ? (c.cuotaConvenio > 0 ? ` + conv. $${fmt(c.cuotaConvenio)}` : "") : c.deudaContrato > 0 ? ` + deuda $${fmt(c.deudaContrato)}` : ""})`
                            : c.convenioActivo ? "Al día · convenio" : "Al día"}
                        </span>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {tareasDe.map(t => {
                            const hecha = gestionHechaHoy(c.id, t.tipo);
                            const previos = t.tipo === "recoleccion" ? pasosPreviosRecoleccion(c.id) : null;
                            const bloqueadoProtocolo = !!previos && !previos.completo;
                            const recolectando = t.tipo === "recoleccion" && recolectandoId === c.id;
                            const bloqueado = recolectando || bloqueadoProtocolo;
                            return (
                              <button
                                key={t.tipo}
                                onClick={() => t.action(c)}
                                disabled={bloqueado}
                                title={bloqueadoProtocolo ? `Falta intentar: ${previos!.faltan.join(", ")}` : undefined}
                                style={{ ...(hecha ? miniBtn("#dcfce7", "#166534") : miniBtn(t.bg, t.color)), opacity: bloqueado ? 0.5 : 1 }}
                              >
                                {recolectando ? "Recolectando..." : bloqueadoProtocolo ? "🔒 Recolección" : hecha ? `✓ ${t.label}` : t.label}
                              </button>
                            );
                          })}
                          {puedeCobroCampo && (
                            <button onClick={() => abrirCobroCampo(c.id)} style={miniBtn("#f0fdf4", "#166534")}>💵 Cobrar</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Por confirmar — separado en Transferencias y Efectivo de campo */}
      {activeTab === "dinero" && (() => {
        function coincideBusqueda(p: typeof pagosPendientes[number], q: string) {
          if (!q.trim()) return true;
          const contrato = contratos.find(c => c.id === p.contrato_id);
          const cliente = contrato ? clientes.find(cl => cl.id === contrato.cliente_id) : null;
          const moto = contrato ? motos.find(m => m.id === contrato.moto_id) : null;
          const qq = q.toLowerCase();
          return (cliente?.nombre ?? "").toLowerCase().includes(qq) || (moto?.placa ?? "").toLowerCase().includes(qq);
        }

        const transferencias = pagosPendientes
          .filter(p => p.tipo_registro !== "campo")
          .filter(p => coincideBusqueda(p, busquedaTransferencias));

        const efectivoCampo = pagosPendientes
          .filter(p => p.tipo_registro === "campo")
          .filter(p => coincideBusqueda(p, busquedaCampoConfirmar))
          .filter(p => {
            if (filtroCampoConfirmar === "por-entregar") return !p.entregado_caja;
            if (filtroCampoConfirmar === "entregado") return !!p.entregado_caja;
            return true;
          });

        function renderPagoCard(p: typeof pagosPendientes[number]) {
          const contrato = contratos.find(c => c.id === p.contrato_id);
          const cliente = contrato ? clientes.find(cl => cl.id === contrato.cliente_id) : null;
          const moto = contrato ? motos.find(m => m.id === contrato.moto_id) : null;
          const esCampo = p.tipo_registro === "campo";
          return (
            <div key={p.id} style={{ border: "1px solid #fde68a", background: "#fffbeb", borderRadius: 14, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, textTransform: "uppercase", fontSize: 15 }}>{cliente?.nombre || "Sin cliente"}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {moto ? `🏍️ ${moto.placa} · ` : ""}{formatDate(p.fecha)}{p.folio ? ` · ${p.folio}` : ""}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    <span style={{ padding: "3px 10px", borderRadius: 999, background: "#dbeafe", color: "#1d4ed8", fontSize: 11, fontWeight: 700 }}>
                      {esCampo ? "💵 Cobro en campo" : "🏦 Transferencia"}
                    </span>
                    <span style={{ padding: "3px 10px", borderRadius: 999, background: "#f1f5f9", color: "#0f172a", fontSize: 11, fontWeight: 800 }}>
                      $ {fmt(p.valor)}
                    </span>
                    {esCampo && (
                      <span style={{ padding: "3px 10px", borderRadius: 999, background: p.entregado_caja ? "#dcfce7" : "#fef3c7", color: p.entregado_caja ? "#166534" : "#92400e", fontSize: 11, fontWeight: 700 }}>
                        {p.entregado_caja ? "Entregado a secretaria" : "En poder del admin"}
                      </span>
                    )}
                  </div>
                </div>
                {/* Foto comprobante */}
                {p.comprobante_url && (
                  <img
                    src={p.comprobante_url}
                    onClick={() => setFotoAmpliada(p.comprobante_url)}
                    style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 10, cursor: "pointer", border: "1px solid #e2e8f0" }}
                  />
                )}
              </div>

              {/* Acciones */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                {esCampo && !p.entregado_caja && puedeCobroCampo && (
                  <button onClick={() => marcarEntregadoCaja(p.id)} style={miniBtn("#dbeafe", "#1d4ed8")}>📤 Entregué a secretaria</button>
                )}

                {/* Confirmar: abre recibo al confirmar — solo staff de oficina */}
                {(!esCampo || p.entregado_caja) && puedeConfirmarPago && (
                  <button
                    onClick={async () => {
                      const { error: errConf } = await confirmarPago(p.id);
                      if (!errConf) {
                        const contrato = contratos.find(c => c.id === p.contrato_id);
                        const cliente = contrato ? clientes.find(cl => cl.id === contrato.cliente_id) : null;
                        const moto = contrato ? motos.find(m => m.id === contrato.moto_id) : null;
                        const contratoResumen = resumenContratos.find(c => c.id === p.contrato_id);
                        const pendienteDespues = contratoResumen ? calcularPendienteContrato(contratoResumen) : 0;
                        const convenioActivo = contratoResumen?.convenioActivo ?? null;
                        setReciboData({
                          folio: p.folio ?? "—",
                          fecha: p.fecha,
                          clienteNombre: cliente?.nombre ?? "",
                          clienteTel: cliente?.telefono ?? "",
                          clienteWhatsapp: cliente?.whatsapp ?? "",
                          placa: moto?.placa ?? "",
                          grupo: moto?.grupo ?? "",
                          valor: p.valor,
                          metodo: p.metodo,
                          estado: "Confirmado",
                          debiaTotal: pendienteDespues + p.valor,
                          aplicadoTarifa: p.aplicado_tarifa ?? 0,
                          aplicadoDeuda: p.aplicado_deuda ?? 0,
                          aplicadoConvenio: p.aplicado_convenio ?? 0,
                          aplicadoSaldoFavor: p.aplicado_saldo_favor ?? 0,
                          pendienteDespues,
                          convenioAbonado: convenioActivo ? (p.aplicado_convenio ?? 0) : null,
                          convenioRestante: convenioActivo ? Math.max(convenioActivo.deuda_total - sumaAbonadoConvenio(convenioActivo.id), 0) : null,
                        });
                      }
                    }}
                    style={miniBtn("#16a34a", "#ffffff")}
                  >
                    ✓ Confirmar recibido
                  </button>
                )}
                {puedeConfirmarPago && (
                  <button onClick={() => rechazarPago(p.id)} style={miniBtn("#fee2e2", "#991b1b")}>✕ Rechazar</button>
                )}
              </div>
            </div>
          );
        }

        return (
          <div style={{ marginTop: 12, display: "flex", flexDirection: isMobile ? "column" : "row", gap: 16, alignItems: "flex-start" }}>
            {/* Transferencias — solo staff de oficina, SUBADMIN no confirma transferencias */}
            {(esSecretaria || esAdmin) && (
              <div style={{ ...card, flex: 1, minWidth: 0, width: isMobile ? "100%" : undefined }}>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>🏦 Transferencias por confirmar</div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>Comprobantes de transferencia esperando verificación.</div>
                <input
                  style={{ ...inputStyle, marginBottom: 10, fontSize: 13 }}
                  placeholder="Buscar cliente o placa..."
                  value={busquedaTransferencias}
                  onChange={e => setBusquedaTransferencias(e.target.value)}
                />
                {transferencias.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 16px", color: "#94a3b8" }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                    Sin transferencias pendientes.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: isMobile ? "40vh" : "60vh", overflowY: "auto", paddingRight: 2 }}>
                    {transferencias.map(renderPagoCard)}
                  </div>
                )}
              </div>
            )}

            <div style={{ ...card, flex: 1, minWidth: 0, width: isMobile ? "100%" : undefined }}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>💵 Efectivo de campo por confirmar</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>Cobros recuperados en campo por ADMIN/SUBADMIN, esperando entrega y confirmación.</div>
              <input
                style={{ ...inputStyle, marginBottom: 10, fontSize: 13 }}
                placeholder="Buscar cliente o placa..."
                value={busquedaCampoConfirmar}
                onChange={e => setBusquedaCampoConfirmar(e.target.value)}
              />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {([
                  { key: "todos" as const, label: "Todos" },
                  { key: "por-entregar" as const, label: "Por entregar" },
                  { key: "entregado" as const, label: "Entregado, falta confirmar" },
                ]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFiltroCampoConfirmar(f.key)}
                    style={{
                      background: filtroCampoConfirmar === f.key ? "#0284c7" : "#f1f5f9",
                      color: filtroCampoConfirmar === f.key ? "white" : "#334155",
                      border: "none", borderRadius: 999, padding: "5px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {efectivoCampo.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 16px", color: "#94a3b8" }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                  Sin cobros de campo pendientes.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: isMobile ? "40vh" : "60vh", overflowY: "auto", paddingRight: 2 }}>
                  {efectivoCampo.map(renderPagoCard)}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Visor de foto del comprobante */}
      {fotoAmpliada && (
        <div onClick={() => setFotoAmpliada(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <img src={fotoAmpliada} style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12 }} />
        </div>
      )}

      {/* Historial tab — full width */}
      {activeTab === "historial" && (
        <div style={{ ...card, marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Historial general de pagos</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["todos", "Pendiente", "Confirmado", "Rechazado"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFiltroPagos(f)}
                  style={{ ...miniBtn(filtroPagos === f ? "#0284c7" : "#f1f5f9", filtroPagos === f ? "white" : "#334155"), padding: "7px 14px" }}
                >
                  {f === "todos" ? "Todos" : f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gap: 10, maxHeight: isMobile ? "62vh" : "66vh", overflowY: "auto", paddingRight: 2 }}>
            {pagosFiltrados.length === 0 && <div style={{ color: "#64748b", fontSize: 14 }}>Sin pagos registrados.</div>}
            {pagosFiltrados.map(p => {
              const contrato = contratos.find(c => c.id === p.contrato_id);
              const cliente = contrato ? clientes.find(cl => cl.id === contrato.cliente_id) : null;
              const moto = contrato ? motos.find(m => m.id === contrato.moto_id) : null;
              return (
                <div key={p.id} style={{ padding: "12px 14px", borderRadius: 14, background: p.estado === "Pendiente" ? "#fffbeb" : "#f8fafc", border: p.estado === "Pendiente" ? "1px solid #fde68a" : "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>
                      {moto ? `${moto.placa} · ` : ""}{cliente?.nombre || "Sin cliente"}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                      {formatDate(p.fecha)} · {p.metodo} · $ {fmt(p.valor)}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                      Cuota ${fmt(p.aplicado_tarifa ?? 0)}
                      {(p.aplicado_deuda ?? 0) > 0 && ` · Deuda $${fmt(p.aplicado_deuda ?? 0)}`}
                      {(p.aplicado_convenio ?? 0) > 0 && ` · Convenio $${fmt(p.aplicado_convenio ?? 0)}`}
                      {(p.aplicado_saldo_favor ?? 0) > 0 && ` · Saldo a favor $${fmt(p.aplicado_saldo_favor ?? 0)}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <PagoBadge estado={p.estado} />
                    {p.estado === "Pendiente" && puedeConfirmarPago && (
                      <>
                        <button onClick={() => confirmarPago(p.id)} style={miniBtn("#dcfce7", "#166534")}>Confirmar</button>
                        <button onClick={() => rechazarPago(p.id)} style={miniBtn("#fee2e2", "#991b1b")}>Rechazar</button>
                      </>
                    )}
                    {p.estado === "Confirmado" && (
                      <button
                        onClick={() => {
                          const contratoResumen = resumenContratos.find(c => c.id === p.contrato_id);
                          const pendienteDespues = contratoResumen ? calcularPendienteContrato(contratoResumen) : 0;
                          const convenioActivo = contratoResumen?.convenioActivo ?? null;
                          setReciboData({
                            folio: p.folio ?? "—",
                            fecha: p.fecha,
                            clienteNombre: cliente?.nombre ?? "",
                            clienteTel: cliente?.telefono ?? "",
                            clienteWhatsapp: cliente?.whatsapp ?? "",
                            placa: moto?.placa ?? "",
                            grupo: moto?.grupo ?? "",
                            valor: p.valor,
                            metodo: p.metodo,
                            estado: "Confirmado",
                            debiaTotal: pendienteDespues + p.valor,
                            aplicadoTarifa: p.aplicado_tarifa ?? 0,
                            aplicadoDeuda: p.aplicado_deuda ?? 0,
                            aplicadoConvenio: p.aplicado_convenio ?? 0,
                            aplicadoSaldoFavor: p.aplicado_saldo_favor ?? 0,
                            pendienteDespues,
                            convenioAbonado: convenioActivo ? (p.aplicado_convenio ?? 0) : null,
                            convenioRestante: convenioActivo ? Math.max(convenioActivo.deuda_total - sumaAbonadoConvenio(convenioActivo.id), 0) : null,
                          });
                        }}
                        style={miniBtn("#dcfce7", "#166534")}
                      >
                        🧾 Recibo
                      </button>
                    )}
                    {puedeEliminarPago && (
                      <button
                        onClick={() => handleEliminarPago(p)}
                        disabled={eliminandoPagoId === p.id}
                        style={{ ...miniBtn("#fee2e2", "#991b1b"), opacity: eliminandoPagoId === p.id ? 0.6 : 1 }}
                      >
                        {eliminandoPagoId === p.id ? "Eliminando..." : "🗑️ Eliminar"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal flotante — Cobro en campo */}
      {modalCampoAbierto && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 60 }}
          onClick={cerrarModalCampo}
        >
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: "100%", maxWidth: 460, maxHeight: "calc(100dvh - 120px)", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>💵 Cobro en campo</h3>
              <button onClick={cerrarModalCampo} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }}>✕</button>
            </div>

            <div style={{ ...card, marginBottom: 14, background: "#fffbeb", border: "1px solid #fde68a", padding: "10px 14px" }}>
              <div style={{ fontSize: 13, color: "#92400e", fontWeight: 600 }}>
                Recuperas efectivo en campo → queda pendiente → la secretaria lo confirma.
              </div>
            </div>

            {campoContratoId === null ? (
              <div>
                <input
                  style={{ ...inputStyle, marginBottom: 12 }}
                  placeholder="Buscar cliente o placa..."
                  value={campoBusqueda}
                  autoFocus
                  onChange={e => setCampoBusqueda(e.target.value)}
                />
                <div style={{ marginBottom: 10, fontSize: 13, color: "#64748b" }}>Selecciona el contrato. Los de <strong>mora/gabela</strong> aparecen primero.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "50vh", overflowY: "auto", paddingRight: 2 }}>
                  {(() => {
                    const orden = (e: EstadoCartera) => e === "mora" ? 0 : e === "gabela" ? 1 : 2;
                    const q = campoBusqueda.toLowerCase();
                    const lista = [...resumenContratos]
                      .filter(r => {
                        if (!q) return true;
                        const cliente = clientes.find(cl => cl.id === r.cliente_id);
                        const moto = motos.find(m => m.id === r.moto_id);
                        return (cliente?.nombre ?? "").toLowerCase().includes(q) || (moto?.placa ?? "").toLowerCase().includes(q);
                      })
                      .sort((a, b) => orden(a.estadoCartera) - orden(b.estadoCartera));
                    if (lista.length === 0) return <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: "16px 0" }}>No tienes contratos asignados disponibles para cobrar.</div>;
                    return lista.map(r => {
                      const cliente = clientes.find(cl => cl.id === r.cliente_id);
                      const moto = motos.find(m => m.id === r.moto_id);
                      return (
                        <div
                          key={r.id}
                          onClick={() => abrirCobroCampo(r.id)}
                          style={{ padding: "10px 12px", borderRadius: 12, cursor: "pointer", border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>{cliente?.nombre || "Sin cliente"}</div>
                            {moto && <div style={{ fontSize: 12, color: "#0284c7" }}>🏍️ {moto.placa}</div>}
                          </div>
                          <EstadoBadge estado={r.estadoCartera} />
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            ) : (
              <div>
                {(() => {
                  const r = resumenContratos.find(x => x.id === campoContratoId);
                  const cliente = r ? clientes.find(cl => cl.id === r.cliente_id) : null;
                  const moto = r ? motos.find(m => m.id === r.moto_id) : null;
                  // Referencia: cuánto debe pagar
                  const enProrrateoRef = !!r && estaEnProrrateo(r, r.sinPagosNunca ?? true);
                  const cuotaPact = r ? (r.forma_pago === "Diario"
                    ? calcularCuotaDia(r.tarifa_diaria ?? 27000, esDomingo, r.tarifa_domingo)
                    : enProrrateoRef ? calcularProrrateoInicial(r) : valorPeriodoReal(r)) : 0;
                  const pagadoP = r ? (r.forma_pago === "Diario" ? (r.recaudadoHoy ?? 0) : (r.pagadoEnPeriodoActual ?? 0)) : 0;
                  const cuotaPend = r
                    ? (r.motor_v2 && r.forma_pago !== "Diario" ? huecoCuotasHoy(r, hoyDate()) : Math.max(cuotaPact - pagadoP, 0))
                    : 0;
                  const debeTotal = cuotaPend + (r?.deudaContrato ?? 0) + (r?.cuotaConvenio ?? 0);
                  return (
                    <div style={{ display: "grid", gap: 12 }}>
                      <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontWeight: 800, textTransform: "uppercase" }}>{cliente?.nombre || "Sin cliente"}</div>
                        {moto && <div style={{ fontSize: 13, color: "#0284c7" }}>🏍️ {moto.placa}</div>}
                      </div>

                      {/* Referencia: cuánto debe pagar */}
                      <div style={{ background: "#eff6ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "10px 14px" }}>
                        <div style={{ fontSize: 11, color: "#0369a1", textTransform: "uppercase", fontWeight: 700 }}>Debe pagar (referencia)</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#0284c7" }}>$ {fmt(debeTotal)}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                          Cuota período: ${fmt(cuotaPend)}{(r?.deudaContrato ?? 0) > 0 ? ` · Deuda: $${fmt(r!.deudaContrato)}` : ""}{(r?.cuotaConvenio ?? 0) > 0 ? ` · Convenio: $${fmt(r!.cuotaConvenio)}` : ""}
                        </div>
                      </div>

                      <MoneyInput label="Monto recuperado" value={campoMonto} onChange={setCampoMonto} />

                      {/* GPS */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>📍 Ubicación:</span>
                        {campoGpsEstado === "capturando" && <span style={{ fontSize: 13, color: "#92400e" }}>Capturando…</span>}
                        {campoGpsEstado === "ok" && campoUbicacion && <span style={{ fontSize: 13, color: "#166534", fontWeight: 700 }}>✓ Capturada</span>}
                        {campoGpsEstado === "error" && <span style={{ fontSize: 13, color: "#991b1b" }}>No disponible</span>}
                        {campoGpsEstado === "idle" && <span style={{ fontSize: 13, color: "#64748b" }}>Sin capturar</span>}
                        <button onClick={capturarGPSCampo} style={{ ...secondaryBtn, fontSize: 12, padding: "6px 10px" }}>{campoUbicacion ? "Recapturar" : "Capturar GPS"}</button>
                      </div>

                      {/* Foto opcional */}
                      <div>
                        <div style={labelStyle}>Foto (opcional)</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <label style={{ ...secondaryBtn, fontSize: 12, padding: "8px 12px", cursor: "pointer" }}>
                            📷 Cámara
                            <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => setCampoFoto(e.target.files?.[0] ?? null)} />
                          </label>
                          <label style={{ ...secondaryBtn, fontSize: 12, padding: "8px 12px", cursor: "pointer" }}>
                            🖼 Galería
                            <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setCampoFoto(e.target.files?.[0] ?? null)} />
                          </label>
                          {campoFoto && <span style={{ fontSize: 12, color: "#166534", fontWeight: 700, alignSelf: "center" }}>✓ {campoFoto.name.slice(0, 20)}</span>}
                        </div>
                      </div>

                      <div>
                        <div style={labelStyle}>Nota (opcional)</div>
                        <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={campoNota} onChange={e => setCampoNota(e.target.value)} placeholder="Observaciones del cobro en campo..." />
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Cobrado por: <strong>{profile?.nombre ?? "—"}</strong></div>
                      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#92400e" }}>
                        Al registrar: se manda <strong>recibo provisional</strong> al cliente por WhatsApp y queda <strong>pendiente</strong> hasta que entregues el efectivo a la secretaria y ella lo confirme en Caja.
                      </div>
                      {campoError && <div style={{ color: "#991b1b", fontSize: 13, fontWeight: 600 }}>{campoError}</div>}
                      {campoExito && (
                        <div style={{ color: "#166534", background: "#dcfce7", padding: "8px 12px", borderRadius: 10, fontWeight: 700, fontSize: 13 }}>
                          ✓ Cobro en campo registrado (pendiente de entrega a caja)
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={pedirConfirmacionCampo} disabled={procesando} style={{ ...primaryBtn, opacity: procesando ? 0.6 : 1 }}>{procesando ? "Registrando..." : "Registrar cobro en campo"}</button>
                        <button onClick={() => { setCampoContratoId(null); setCampoBusqueda(""); }} style={secondaryBtn}>Cancelar</button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTRATOS — lista navegable con chips de filtro */}
      {activeTab === "contratos" && (
        <div style={{ marginTop: 18, display: "flex", flexDirection: isMobile ? "column" : "row", gap: 20, alignItems: isMobile ? "stretch" : "start" }}>
          {/* Lista */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Chips de filtro */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}>
              {FILTROS_CONTRATOS.map(f => (
                <button
                  key={f.key}
                  onClick={() => { setFiltroContratos(f.key); setContratoSeleccionadoId(null); }}
                  style={{
                    background: filtroContratos === f.key ? "#0284c7" : "#f1f5f9",
                    color: filtroContratos === f.key ? "white" : "#334155",
                    border: "none", borderRadius: 999, padding: "7px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                  }}
                >
                  {f.label} <span style={{ opacity: 0.7 }}>({f.count})</span>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {(["todos", "COSTA", "PRADERA", "RASTREADOR", "USADAS"] as ("todos" | GrupoMoto)[]).map(g => (
                <button
                  key={g}
                  onClick={() => setFiltroGrupoContratos(g)}
                  style={{
                    padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 700,
                    background: filtroGrupoContratos === g ? "#0284c7" : "#f1f5f9",
                    color: filtroGrupoContratos === g ? "white" : "#334155",
                  }}
                >
                  {g === "todos" ? "Todos" : g}
                </button>
              ))}
            </div>
            <div style={card}>
              <input
                style={{ ...inputStyle, marginBottom: 12 }}
                placeholder="Buscar cliente o placa..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              {/* Lista dentro de recuadro con scroll propio */}
              <div style={{ maxHeight: isMobile ? "62vh" : "66vh", overflowY: "auto", paddingRight: 2 }}>
                {listaFiltrada.length === 0
                  ? <div style={{ textAlign: "center", padding: "28px 12px", color: "#94a3b8", fontSize: 14 }}>No hay contratos en este filtro.</div>
                  : <ListaContratos lista={listaFiltrada} />}
              </div>
            </div>
          </div>

          {/* Detail panel — desktop only */}
          {!isMobile && (
            <div style={{ flex: "0 0 380px", maxWidth: 380 }}>
              {PanelDetalle()}
            </div>
          )}
        </div>
      )}

      {/* Botón flotante "+" — acciones rápidas según rol */}
      {(puedePagoNormal || puedeCobroCampo) && (
        <div style={{ position: "fixed", right: 20, bottom: isMobile ? 88 : 28, zIndex: 50, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          {fabOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {puedePagoNormal && (
                <button
                  onClick={() => { setFabOpen(false); setModalContratoId(null); setModalBusqueda(""); setModalListaAbierta(false); setModalPago(true); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "white", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: 999, padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 6px 20px rgba(15,23,42,0.16)" }}
                >
                  💰 Registrar pago
                </button>
              )}
              {puedeCobroCampo && (
                <button
                  onClick={() => { setFabOpen(false); abrirModalCampoBusqueda(); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "white", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: 999, padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 6px 20px rgba(15,23,42,0.16)" }}
                >
                  💵 Cobro en campo
                </button>
              )}
            </div>
          )}
          <button
            onClick={() => {
              // Si solo tiene una acción disponible, dispararla directo sin menú
              const soloPago = puedePagoNormal && !puedeCobroCampo;
              const soloCampo = puedeCobroCampo && !puedePagoNormal;
              if (soloPago) { setModalContratoId(null); setModalBusqueda(""); setModalListaAbierta(false); setModalPago(true); return; }
              if (soloCampo) { abrirModalCampoBusqueda(); return; }
              setFabOpen(v => !v);
            }}
            aria-label="Acciones rápidas"
            style={{ width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)", color: "white", border: "none", fontSize: 30, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(2,132,199,0.4)", display: "flex", alignItems: "center", justifyContent: "center", transform: fabOpen ? "rotate(45deg)" : "none", transition: "transform 0.15s" }}
          >
            +
          </button>
        </div>
      )}

      {/* Modal de registro rápido de pago */}
      {modalPago && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 60 }}
          onClick={cerrarModalPago}
        >
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: "100%", maxWidth: 460, maxHeight: "calc(100dvh - 160px)", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Registrar pago</h3>
              <button onClick={cerrarModalPago} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }}>✕</button>
            </div>

            {/* Buscador-selector unificado (combobox) */}
            <div style={{ marginBottom: 14, position: "relative" }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>Cliente / contrato</label>
              <div style={{ position: "relative" }}>
                <input
                  style={{ ...inputStyle, paddingRight: modalContratoId ? 34 : 12 }}
                  placeholder="Buscar y seleccionar cliente o placa..."
                  value={modalBusqueda}
                  autoFocus
                  onFocus={() => setModalListaAbierta(true)}
                  onChange={e => { setModalBusqueda(e.target.value); setModalListaAbierta(true); setModalContratoId(null); setModalError(null); setModalExito(false); }}
                />
                {modalContratoId && (
                  <button
                    onClick={() => { setModalContratoId(null); setModalBusqueda(""); setModalListaAbierta(true); }}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8" }}
                    title="Limpiar selección"
                  >✕</button>
                )}
              </div>

              {/* Lista de resultados */}
              {modalListaAbierta && !modalContratoId && (
                <div style={{ position: "absolute", left: 0, right: 0, top: "100%", marginTop: 4, background: "white", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 12px 32px rgba(15,23,42,0.16)", maxHeight: 240, overflowY: "auto", zIndex: 10 }}>
                  {modalResultados.length === 0 ? (
                    <div style={{ padding: "12px 14px", fontSize: 13, color: "#94a3b8" }}>Sin coincidencias.</div>
                  ) : (
                    modalResultados.slice(0, 30).map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setModalContratoId(c.id); setModalBusqueda(etiquetaContrato(c)); setModalListaAbierta(false); setModalError(null); setModalExito(false); }}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left", padding: "10px 14px", border: "none", borderBottom: "1px solid #f1f5f9", background: "white", cursor: "pointer", fontSize: 13, color: "#0f172a" }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "white"}
                      >
                        <span style={{ fontWeight: 600, textTransform: "uppercase" }}>{etiquetaContrato(c)}</span>
                        <EstadoBadge estado={c.estadoCartera as EstadoCartera} />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Detalle del contrato seleccionado — dentro del modal */}
            {modalContrato && (
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", textTransform: "uppercase" }}>
                    {modalCliente?.nombre || "Sin cliente"}
                  </div>
                  <EstadoBadge estado={modalContrato.estadoCartera as EstadoCartera} />
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                  {modalMoto ? `🏍️ ${modalMoto.placa} · ` : ""}
                  {modalContrato.forma_pago === "Diario" ? "Contrato diario" : "Pago semanal"}
                  {modalContrato.diasSinPago < 999 ? ` · ${modalContrato.diasSinPago} días sin pago` : ""}
                </div>

                {/* Cuotas */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <div style={{ flex: 1, background: "#f8fafc", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Cuota período</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>$ {fmt(modalCuotaPactada)}</div>
                  </div>
                  <div style={{ flex: 1, background: "#f8fafc", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Pagado</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#166534" }}>$ {fmt(modalPagadoPeriodo)}</div>
                  </div>
                  <div style={{ flex: 1, background: modalCuotaPendiente > 0 ? "#fef2f2" : "#f8fafc", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Pendiente</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: modalCuotaPendiente > 0 ? "#991b1b" : "#0f172a" }}>$ {fmt(modalCuotaPendiente)}</div>
                  </div>
                </div>

                {/* Deuda / convenio */}
                {(modalContrato.deudaContrato > 0 || modalContrato.cuotaConvenio > 0) && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, fontSize: 12 }}>
                    {modalContrato.deudaContrato > 0 && (
                      <div style={{ flex: 1, background: "#fff7ed", borderRadius: 8, padding: "6px 10px", color: "#c2410c", fontWeight: 700 }}>Deuda: $ {fmt(modalContrato.deudaContrato)}</div>
                    )}
                    {modalContrato.cuotaConvenio > 0 && (
                      <div style={{ flex: 1, background: "#eff6ff", borderRadius: 8, padding: "6px 10px", color: "#0369a1", fontWeight: 700 }}>Convenio: $ {fmt(modalContrato.cuotaConvenio)}/período</div>
                    )}
                  </div>
                )}

                {/* Historial */}
                <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", textTransform: "uppercase", marginBottom: 6 }}>Últimos pagos</div>
                {modalPagos.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>Sin pagos registrados.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 130, overflowY: "auto" }}>
                    {modalPagos.map(p => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderRadius: 8, padding: "6px 10px" }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>$ {fmt(p.valor)}</span>
                          <span style={{ fontSize: 11, color: "#64748b" }}> · {formatDate(p.fecha)} · {p.metodo}</span>
                        </div>
                        <PagoBadge estado={p.estado} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Valor */}
            <div style={{ marginBottom: 14 }}>
              <MoneyInput label="Valor recibido" value={modalValor} onChange={setModalValor} />
            </div>

            {/* Desglose de aplicación */}
            {modalContrato && modalMonto > 0 && (
              <div style={{ background: "#f0f9ff", borderRadius: 10, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: "#0369a1" }}>
                Se aplicará:
                {modalDesglose.tarifa > 0 && <> tarifa $ {fmt(modalDesglose.tarifa)}</>}
                {modalDesglose.deuda > 0 && <> · deuda $ {fmt(modalDesglose.deuda)}</>}
                {modalDesglose.convenio > 0 && <> · convenio $ {fmt(modalDesglose.convenio)}</>}
                {modalDesglose.ahorro > 0 && <> · ahorro $ {fmt(modalDesglose.ahorro)}</>}
                {modalDesglose.saldo > 0 && <> · saldo a favor $ {fmt(modalDesglose.saldo)}</>}
              </div>
            )}

            {/* Método */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>Método de pago</label>
              <select style={inputStyle} value={modalMetodo} onChange={e => setModalMetodo(e.target.value as MetodoPago)}>
                <option value="Efectivo">Efectivo (confirma automático)</option>
                <option value="Transferencia">Transferencia (queda pendiente)</option>
              </select>
            </div>

            {/* Foto del comprobante — obligatoria en transferencia */}
            {modalMetodo === "Transferencia" && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>Foto del comprobante *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "#0284c7", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                    📷 Cámara
                    <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => setModalComprobante(e.target.files?.[0] ?? null)} />
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "#e0f2fe", color: "#0369a1", fontWeight: 700, fontSize: 13 }}>
                    🖼 Galería
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setModalComprobante(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
                {modalComprobante && <div style={{ fontSize: 12, color: "#166534", marginTop: 4 }}>✓ {modalComprobante.name}</div>}
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>La transferencia quedará pendiente hasta que la secretaria confirme que entró a la cuenta.</div>
              </div>
            )}

            {modalError && <div style={{ color: "#991b1b", fontSize: 13, marginBottom: 12 }}>{modalError}</div>}
            {modalExito && (
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "#fef3c7", border: "1px solid #fde68a", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>⏳ Transferencia registrada</div>
                <div style={{ fontSize: 12, color: "#92400e", marginTop: 4 }}>El recibo se generará cuando la secretaria confirme que el dinero entró a la cuenta.</div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={pedirConfirmacionModal} disabled={modalSubiendo} style={{ ...primaryBtn, flex: 1, opacity: modalSubiendo ? 0.6 : 1 }}>
                {modalSubiendo ? "Subiendo..." : "Registrar pago"}
              </button>
              <button onClick={cerrarModalPago} style={secondaryBtn}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {confirmarModalOpen && (() => {
        const cMod = contratos.find(c => c.id === modalContratoId);
        const cliMod = cMod ? clientes.find(c => c.id === cMod.cliente_id) : null;
        const motMod = cMod ? motos.find(m => m.id === cMod.moto_id) : null;
        const dupMod = !!pagos.find(p => p.contrato_id === modalContratoId && p.estado !== "Rechazado" && Math.round(p.valor) === modalMonto && p.fecha === hoyISO());
        return (
          <ModalConfirmarPago
            monto={modalMonto}
            metodo={modalMetodo}
            clienteNombre={cliMod?.nombre ?? ""}
            placa={motMod?.placa}
            duplicado={dupMod}
            procesando={modalSubiendo}
            onCancelar={() => setConfirmarModalOpen(false)}
            onConfirmar={handleRegistrarPagoModal}
          />
        );
      })()}

      {confirmarCampoOpen && (() => {
        const montoCampo = Number(campoMonto) || 0;
        const cCampo = contratos.find(c => c.id === campoContratoId);
        const cliCampo = cCampo ? clientes.find(c => c.id === cCampo.cliente_id) : null;
        const motCampo = cCampo ? motos.find(m => m.id === cCampo.moto_id) : null;
        const dupCampo = !!pagos.find(p => p.contrato_id === campoContratoId && p.estado !== "Rechazado" && Math.round(p.valor) === montoCampo && p.fecha === hoyISO());
        return (
          <ModalConfirmarPago
            monto={montoCampo}
            metodo="Efectivo"
            clienteNombre={cliCampo?.nombre ?? ""}
            placa={motCampo?.placa}
            duplicado={dupCampo}
            procesando={procesando}
            onCancelar={() => setConfirmarCampoOpen(false)}
            onConfirmar={handleCampoSubmit}
          />
        );
      })()}

      {/* Panel de recibo */}
      {reciboData && <ReciboPanel datos={reciboData} onCerrar={() => setReciboData(null)} />}

      {/* Formulario combinado de recolección por mora */}
      {recoleccionModal && (
        <ModalRecoleccion
          contratoId={recoleccionModal.contratoId}
          clienteId={recoleccionModal.clienteId}
          clienteNombre={recoleccionModal.clienteNombre}
          motoId={recoleccionModal.motoId}
          placa={recoleccionModal.placa}
          onClose={() => setRecoleccionModal(null)}
        />
      )}
    </div>
  );
}
