import React, { useMemo, useState, useEffect } from "react";
import ImgPrivada from "../components/ImgPrivada";
import type { ViewKey } from "../App";
import {
  usePagos,
  calcularAplicacion,
  calcularCuotaDia,
  generarFolio,
  esPagoDeCaja,
  fechaDeCaja,
  saldoAFavorDe,
  APLICADO_LO_REPARTE_LA_BD,
  type MetodoPago,
  type PagoEstado,
  type AplicadoPago,
  type Aplicado,
} from "../hooks/usePagos";
import { useContratos, diasDesdeUltimoPago, corteMigracionGrupo, empalmePendiente, infoFinContrato } from "../hooks/useContratos";
import PanelEmpalme from "../components/PanelEmpalme";
import PanelGuardadoMoto from "../components/PanelGuardadoMoto";
import { useClientes } from "../hooks/useClientes";
import { useMotos, type GrupoMoto } from "../hooks/useMotos";
import { useDeudas, type ConceptoDeuda, type Deuda } from "../hooks/useDeudas";
import { useConvenios } from "../hooks/useConvenios";
import { useIngresosNoIdentificados, normalizarRef } from "../hooks/useIngresosNoIdentificados";
import { useCuentasBancarias, cuentasDelGrupo, textoCuentas } from "../hooks/useCuentasBancarias";
import { useSubadmins } from "../hooks/useSubadmins";
import { useGestiones, type TipoGestion } from "../hooks/useGestiones";
import { useAuth } from "../contexts/AuthContext";
import { useScope } from "../contexts/SubadminScopeContext";
import { useBackGuard } from "../contexts/BackNav";
import MoneyInput from "../components/MoneyInput";
import ModalConvenio from "../components/ModalConvenio";
import { generarHTMLEstadoCuenta, armarTextoEstadoCuenta, generarHTMLEstadoCuentaDetallado, type DatosEstadoCuenta, type DatosDetallado } from "../hooks/useDocumentos";
import ModalRecoleccion from "../components/ModalRecoleccion";
import ModalConfirmarPago from "../components/ModalConfirmarPago";
import SelectorCuentaBanco from "../components/SelectorCuentaBanco";
import ModalAmpliarConvenio from "../components/ModalAmpliarConvenio";
import Placa from "../components/Placa";
import TicketTermico, { type TicketData } from "../components/TicketTermico";
import { useMensajesWhatsapp } from "../hooks/useMensajesWhatsapp";
import {
  calcularEstadoCartera as calcularEstadoCarteraCiclo,
  cuotaConvenioDelPeriodo,
  proximaCuotaConvenio,
  loQueDebe,
  type LoQueDebe,
  calcularProrrateoInicial,
  calcularAhorroAplicado,
  tarifaPagadaPeriodoActual,
  ahorroPeriodoExacto,
  huecoCuotasHoy,
  desgloseExigible,
  cajasExigidasHasta,
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
import { hoyISO, hoyDate, hoyMasDias, fechaISO, fmtFechaLarga } from "../utils/fecha";
import { Chip, Badge, Btn, type BadgeTone } from "../components/atomos";
import { ItemLista } from "../components/ListaEstandar";
import MontoOculto, { GrupoMontoOculto } from "../components/MontoOculto";

// ─── Styles ───────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid var(--line2)",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  marginBottom: 6,
  fontSize: 14,
  fontWeight: 600,
  color: "var(--muted2)",
};
const card: React.CSSProperties = {
  background: "var(--card)",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
  boxSizing: "border-box",
};
const primaryBtn: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--accent) 0%, var(--ok2) 100%)",
  color: "#0f172a",
  border: "none",
  borderRadius: 8,
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 13,
};
const secondaryBtn: React.CSSProperties = {
  background: "var(--soft)",
  color: "var(--muted2)",
  border: "none",
  borderRadius: 8,
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 13,
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
  const tone: Record<PagoEstado, BadgeTone> = {
    Confirmado: "ok",
    Pendiente: "warn",
    Rechazado: "bad",
  };
  return <Badge tone={tone[estado]}>{estado}</Badge>;
}

type EstadoCartera = "al-dia" | "gabela" | "mora";

// Estilo/etiqueta por estado de cartera — fuente ÚNICA para el badge y la franja del detalle
// (antes la franja usaba otra función que no contaba el convenio → decía "Gabela" mientras
// el badge decía "Al día").
const ESTADO_CARTERA_STYLE: Record<EstadoCartera, { bg: string; color: string; label: string }> = {
  "al-dia": { bg: "var(--ok-soft)", color: "var(--ok-ink)", label: "● Al día" },
  gabela: { bg: "var(--warn-soft)", color: "var(--warn-ink)", label: "▲ Gabela" },
  mora: { bg: "var(--bad-soft)", color: "var(--bad-ink)", label: "✕ Mora" },
};

const ESTADO_CARTERA_TONE: Record<EstadoCartera, BadgeTone> = {
  "al-dia": "ok",
  gabela: "warn",
  mora: "bad",
};

function EstadoBadge({ estado }: { estado: EstadoCartera }) {
  return <Badge tone={ESTADO_CARTERA_TONE[estado]}>{ESTADO_CARTERA_STYLE[estado].label}</Badge>;
}

function InfoBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        background: highlight ? "var(--accent-soft2)" : "var(--soft2)",
        borderRadius: 12,
        padding: "10px 14px",
        border: highlight ? "1px solid var(--accent-line)" : "1px solid var(--line)",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 15, fontWeight: 700, color: highlight ? "var(--accent-ink)" : "var(--text)" }}>{value}</div>
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
      return { formaPago, diaPago: "Diario", ultimoPago: null, pagadoHasta: null, proximoPago: hoyStr, diasEstado: 0, etiqueta: "Al día", colorEtiqueta: "var(--ok-ink)", bgEtiqueta: "var(--ok-soft)" };
    }
    const ultimo = new Date(ultimoPago + "T00:00:00");
    const diasDesde = Math.floor((hoy.getTime() - ultimo.getTime()) / 86400000);
    const pagadoHasta = ultimoPago;
    const manana = new Date(hoy); manana.setDate(manana.getDate() + 1);
    const proximoPago = manana.toISOString().slice(0, 10);
    if (diasDesde === 0) return { formaPago, diaPago: "Diario", ultimoPago, pagadoHasta, proximoPago, diasEstado: 0, etiqueta: "Al día", colorEtiqueta: "var(--ok-ink)", bgEtiqueta: "var(--ok-soft)" };
    if (diasDesde === 1) return { formaPago, diaPago: "Diario", ultimoPago, pagadoHasta, proximoPago, diasEstado: 1, etiqueta: "Gabela", colorEtiqueta: "var(--warn-ink)", bgEtiqueta: "var(--warn-soft)" };
    return { formaPago, diaPago: "Diario", ultimoPago, pagadoHasta, proximoPago: hoyStr, diasEstado: diasDesde, etiqueta: "Mora", colorEtiqueta: "var(--bad-ink)", bgEtiqueta: "var(--bad-soft)" };
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
      etiqueta: "Al día", colorEtiqueta: "var(--ok-ink)", bgEtiqueta: "var(--ok-soft)",
    };
  }

  // Si el contrato fue entregado después del inicio del período → aún no vence el primer cobro
  if (fechaEntrega && fechaEntrega >= inicioPeriodo) {
    return {
      formaPago, diaPago: formatDiaPago(contrato), ultimoPago: null, pagadoHasta: null,
      proximoPago, diasEstado: 0,
      etiqueta: "Al día", colorEtiqueta: "var(--ok-ink)", bgEtiqueta: "var(--ok-soft)",
    };
  }

  const diasDesde = Math.floor((hoy.getTime() - d.getTime()) / 86400000);
  const etiqueta = diasDesde === 0 ? "Al día" : diasDesde === 1 ? "Gabela" : "Mora";
  const colorEtiqueta = diasDesde <= 1 ? "var(--warn-ink)" : "var(--bad-ink)";
  const bgEtiqueta = diasDesde <= 1 ? "var(--warn-soft)" : "var(--bad-soft)";
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
        style={{ width: "100%", maxWidth: 480, background: "var(--card)", borderRadius: "20px 20px 0 0", padding: 24, maxHeight: "85dvh", overflowY: "auto" }}
      >
        {/* Encabezado (no se imprime) */}
        <div className="recibo-no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>🧾 Recibo de pago</div>
          <button onClick={onCerrar} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--faint)" }}>✕</button>
        </div>

        {/* Ticket — esto es lo único que se imprime (ver #recibo-ticket / @media print más abajo) */}
        <div id="recibo-ticket">
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", letterSpacing: 0.5 }}>CLUB MOTEROS CARTAGENA</div>
            {datos.grupo && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{datos.grupo}</div>}
            <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 4 }}>Comprobante de pago</div>
            {/* Misma jerarquía que el ticket impreso: la placa manda. */}
            {datos.placa && (
              <div style={{ marginTop: 8 }}>
                <Placa placa={datos.placa} grupo={datos.grupo} size="lg" />
              </div>
            )}
          </div>

          <div style={{ background: "var(--soft2)", borderRadius: 14, padding: "14px 16px", marginBottom: 16, display: "grid", gap: 8 }}>
            {[
              ["Folio",    datos.folio],
              ["Fecha",    new Date(datos.fecha + "T00:00:00").toLocaleDateString("es-CO")],
              ["Cliente",  datos.clienteNombre],
              ["Monto",    `$${Math.round(datos.valor).toLocaleString("es-CO")}`],
              ["Método",   datos.metodo],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: 6 }}>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", textTransform: l === "Cliente" ? "uppercase" : "none" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 2 }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Estado</span>
              <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                background: datos.estado === "Confirmado" ? "var(--ok-soft)" : "var(--warn-soft)",
                color: datos.estado === "Confirmado" ? "var(--ok-ink)" : "var(--warn-ink)" }}>
                {datos.estado === "Confirmado" ? "✅ Confirmado" : "⏳ Pendiente validación"}
              </span>
            </div>
          </div>

          <div style={{ background: "var(--soft2)", borderRadius: 14, padding: "14px 16px", marginBottom: 16, display: "grid", gap: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", marginBottom: 2 }}>Detalle de su cuenta</div>
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
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{l}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{v}</span>
                </div>
              );
            })}
            {datos.convenioAbonado != null && (
              <>
                <div style={{ borderTop: "1px solid var(--line)", marginTop: 4, paddingTop: 6, fontSize: 12, fontWeight: 700, color: "var(--muted2)" }}>Convenio</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Abonó hoy al convenio</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>${Math.round(datos.convenioAbonado).toLocaleString("es-CO")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Le falta del convenio</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>${Math.round(datos.convenioRestante ?? 0).toLocaleString("es-CO")}</span>
                </div>
              </>
            )}
          </div>

          <div style={{ textAlign: "center", fontSize: 11, color: "var(--faint)" }}>¡Gracias por su pago!</div>
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
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted2)", marginBottom: 2 }}>¿A qué número enviar?</div>

            {telRegistrado && (
              <button
                onClick={() => abrirWA(telRegistrado)}
                style={{ ...secondaryBtn, textAlign: "left", padding: "12px 16px" }}
              >
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Número registrado</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginTop: 2 }}>📱 {telRegistrado}</div>
              </button>
            )}

            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Otro número</div>
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
type FiltroContratos = "todos" | "mora" | "gabela" | "al-dia" | "pagan-hoy" | "convenio" | "retenidos";

type ProtocoloStep = { paso: number; label: string; color: string; bg: string; accionRecomendada: string };
function calcProtocoloStep(dias: number): ProtocoloStep {
  if (dias <= 0) return { paso: 1, label: "Recordatorio", color: "var(--accent)", bg: "var(--accent-soft)", accionRecomendada: "mensaje_recordatorio" };
  if (dias === 1) return { paso: 2, label: "Llamada + Sirena", color: "var(--warn-ink)", bg: "var(--warn-soft)", accionRecomendada: "llamada" };
  if (dias <= 3) return { paso: 3, label: "Apagado Remoto", color: "var(--bad-ink)", bg: "var(--bad-soft)", accionRecomendada: "otro" };
  return { paso: 4, label: "RECOLECCION FISICA", color: "var(--card)", bg: "var(--bad-ink2)", accionRecomendada: "recoleccion" };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CobrosView({ initialOpenForm = false, onNavigate, puedeHistorial = true }: { initialOpenForm?: boolean; onNavigate?: (view: ViewKey, filter?: string) => void; puedeHistorial?: boolean }) {
  const { profile, puede } = useAuth();
  const { filtrarContratos } = useScope();
  const { nombreSubadmin } = useSubadmins();

  const { pagos, loading: loadingPagos, error: errorPagos, registrarPago, aplicarSaldoFavor, subirComprobante, registrarCobroCampo, marcarEntregadoCaja, confirmarPago, rechazarPago, eliminarPago, pagosDelContrato } =
    usePagos();
  const { contratos: todosContratos, loading: loadingContratos, cerrarEmpalme } = useContratos();
  const contratos = filtrarContratos(todosContratos);
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { deudas, registrarDeuda, editarDeuda, eliminarDeuda } = useDeudas();
  const { buscarPorReferencia, consumirPorPago } = useIngresosNoIdentificados();
  const { cuentas: cuentasBancarias } = useCuentasBancarias();
  const { convenios, convenioActivoDelContrato, totalConveniosDelContrato } = useConvenios();
  const { gestiones, registrarGestion } = useGestiones();
  const { render: renderMsg } = useMensajesWhatsapp();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // El cobrador (SUBADMIN) arranca en "Para hacer hoy" (sus tareas del día); el resto en la
  // lista de contratos. Antes todos abrían en "Todos" y un cobrador podía no descubrir su panel.
  const [activeTab, setActiveTab] = useState<TabKey>(profile?.role === "SUBADMIN" ? "hoy" : "contratos");
  const [filtroContratos, setFiltroContratos] = useState<FiltroContratos>("todos");
  const [filtroGrupoContratos, setFiltroGrupoContratos] = useState<"todos" | GrupoMoto>("todos");
  const [modalCampoAbierto, setModalCampoAbierto] = useState(false);
  const [contratoSeleccionadoId, setContratoSeleccionadoId] = useState<string | null>(null);
  // Atrás cierra el detalle del contrato en vez de saltar de módulo.
  useBackGuard(contratoSeleccionadoId !== null, () => setContratoSeleccionadoId(null));
  const [busqueda, setBusqueda] = useState("");

  // Modal de registro rápido de pago (desde acción rápida del dashboard) — estado propio e independiente
  const [modalPago, setModalPago] = useState(initialOpenForm);
  const [modalBusqueda, setModalBusqueda] = useState("");
  const [modalContratoId, setModalContratoId] = useState<string | null>(null);
  const [modalListaAbierta, setModalListaAbierta] = useState(false);
  const [modalValor, setModalValor] = useState("");
  const [modalMetodo, setModalMetodo] = useState<MetodoPago>("Efectivo");
  // Fecha REAL en que pagó el cliente (mig 064). Por defecto hoy; se puede mover hacia atrás
  // cuando reporta tarde (transfirió el domingo y avisó el lunes). Nunca al futuro.
  const [modalFechaPago, setModalFechaPago] = useState(hoyISO());
  // N° de referencia de la transferencia (obligatorio): es lo que permite comprobar que el
  // dinero sí entró, cruzándolo contra las partidas que nadie reclamó.
  const [modalReferencia, setModalReferencia] = useState("");
  // Fecha que vino COMPROBADA del banco (por el cruce), para poder devolverla a hoy si la
  // referencia deja de cruzar — sin pisar una fecha que el funcionario haya puesto a mano.
  const [modalFechaDelBanco, setModalFechaDelBanco] = useState<string | null>(null);
  // El funcionario verificó en el extracto que esa referencia cubre a dos clientes distintos.
  const [modalRefRepetidaOk, setModalRefRepetidaOk] = useState(false);
  // El funcionario validó con la foto del comprobante un valor distinto al que muestra el banco.
  const [modalDescuadreOk, setModalDescuadreOk] = useState(false);
  // A cuál cuenta de la empresa cayó (mig 087). Sin esto la caja da un solo total por grupo y
  // COSTA, que recibe en dos cuentas, no se puede cuadrar contra cada extracto por separado.
  const [modalCuentaId, setModalCuentaId] = useState<string | null>(null);
  // Convenio activo al que se le va a agregar una deuda nueva (sin rehacerlo ni perder abonos).
  const [ampliandoConvenio, setAmpliandoConvenio] = useState<import("../hooks/useConvenios").Convenio | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalExito, setModalExito] = useState(false);
  const [modalComprobante, setModalComprobante] = useState<File | null>(null);
  const [modalSubiendo, setModalSubiendo] = useState(false);

  // Recibo panel
  const [reciboData, setReciboData] = useState<DatosRecibo | null>(null);

  // (El registro de pago inline del detalle se eliminó — el pago va por el modal
  //  flotante. `procesando` se conserva: lo usan muchos botones de la vista.)
  const [procesando, setProcesando] = useState(false);
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

  const [mostrarFormDeuda, setMostrarFormDeuda] = useState(false);
  // Abre la ventana COMPARTIDA de convenio (ModalConvenio), la misma que usan Inmovilizaciones,
  // Cobro Diario y el wizard. Antes acá vivía un formulario propio, con otro aspecto y sin el
  // tope de cuotas.
  const [mostrarFormConvenio, setMostrarFormConvenio] = useState(false);

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

  // El borrado queda registrado en el historial del contrato (mig 101, trigger en la BD: se
  // escribe venga de donde venga el borrado). Se le dice al funcionario para que no lo use como
  // atajo — y porque si lo que quiere es dejarla en cero, editarla conserva mejor la historia.
  async function handleEliminarDeuda(id: string, d?: { concepto: string; descripcion: string; monto_pendiente: number }) {
    if (guardandoEditDeuda) return;
    const cual = d ? `\n\n${d.descripcion || d.concepto} — $${fmt(d.monto_pendiente)} pendiente` : "";
    if (!confirm(
      `¿Eliminar esta deuda?${cual}\n\n`
      + "La deuda desaparece de la cartera del cliente y no se puede deshacer.\n\n"
      + "Queda registrado en el historial del contrato: qué deuda era, de cuánto, quién la borró y cuándo."
    )) return;
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
    if (!confirm(`¿Eliminar este pago de $${fmt(p.valor)} (${p.metodo}, ${fmtFechaLarga(p.fecha)})? Esta acción no se puede deshacer.`)) return;
    setEliminandoPagoId(p.id);
    try {
      await eliminarPago(p, profile.id);
    } finally {
      setEliminandoPagoId(null);
    }
  }

  // Historial filter
  const [filtroPagos, setFiltroPagos] = useState<"todos" | "Pendiente" | "Confirmado" | "Rechazado">("todos");
  const [busquedaHistorial, setBusquedaHistorial] = useState("");
  // El estado de cuenta impreso/compartido NO muestra el ahorro por defecto (decisión del cliente);
  // este toggle permite incluirlo puntualmente. En pantalla el ahorro siempre se ve.
  const [incluirAhorroDoc, setIncluirAhorroDoc] = useState(false);

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

  // Cartera trabaja con los Activos Y con los Suspendidos (moto retenida). Antes solo miraba los
  // Activos, así que al inmovilizar una moto el contrato DESAPARECÍA de Cartera: no se le podía
  // registrar un pago, ni una deuda, ni un convenio — justo cuando más hay que ajustarle las
  // cuentas, porque de eso depende que recupere la moto. Los suspendidos quedan marcados y NO
  // entran a las listas de trabajo del día (ver `operativos`): a quien ya le quitaron la moto no
  // se le sale a cobrar.
  const contratosActivos = contratos.filter(c => c.estado === "Activo" || c.estado === "Suspendido");

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
      // Antes esto exigía además `deudaContrato > 0`, y por eso el cliente que recibe la moto
      // y NUNCA paga una sola cuota (sin deuda registrada) quedaba en 999 para siempre: la
      // lista de Contratos le ponía "P4: Recolección física" pero jamás entraba al grupo de
      // Recolección, así que el botón no aparecía nunca. No hace falta esa condición para
      // proteger a los contratos nuevos: quien filtra es `estadoCartera === "mora"`, que ya
      // devuelve "al-dia" mientras el contrato esté en prorrateo o al corriente.
      const diasSinPago = ultimoPagoFecha
        ? Math.floor((Date.now() - new Date(ultimoPagoFecha + "T00:00:00").getTime()) / 86400000)
        : contrato.fecha_entrega
          ? (diasDesdeUltimoPago(null, contrato.fecha_entrega, corteMigracionGrupo(grupoMoto)) ?? 999)
          : 999;
      const ultimaGestion = gestiones.filter(g => g.contrato_id === contrato.id)[0] ?? null;

      const pagadoEstaSemana = confirmados
        .filter(p => new Date(p.fecha + "T00:00:00") >= inicioSemana)
        .reduce((acc, p) => acc + p.valor, 0);

      const recaudadoHoy = confirmados
        .filter(p => fechaDeCaja(p) === hoyISO() && esPagoDeCaja(p))
        .reduce((acc, p) => acc + p.valor, 0);

      // La cuota del convenio es obligatoria junto al pago normal — cuenta para la mora,
      // pero solo desde el período en que se creó (no en una semana ya vencida antes).
      const convenioActivo = convenioActivoDelContrato(contrato.id);
      const cuotaConvenio = cuotaConvenioDelPeriodo(convenioActivo, contrato, hoy);
      // Si el convenio absorbió la cuota de este período (alivio), ese período va "al día".
      const periodoCubierto = !!(convenioActivo?.cubre_periodo_hasta && convenioActivo.cubre_periodo_hasta >= hoyISO());

      // Se le pasa el convenio COMPLETO para que el estado cuente el acuerdo con el mismo
      // arrastre que el monto. Sin esto miraba solo los pagos de esta semana: quien había
      // abonado su cuota en semanas anteriores salía EN MORA con $0 de deuda, y entraba a la
      // cola de recolección. (DANIEL MILLAN, RLT87H: $61.000 abonados contra $33.500 de cuota.)
      const estadoCartera = calcularEstadoCarteraCiclo(contrato, confirmados, hoy, cuotaConvenio, periodoCubierto, convenioActivo);
      const pagadoEnPeriodoActual = totalPagadoPeriodoActual(contrato, confirmados, hoy);

      // Una sola función para todo el sistema (usePagos): la liquidación necesita esta misma
      // cuenta, y dos copias de la misma cuenta se separan solas — la lección de loQueDebe().
      const saldoAFavor = saldoAFavorDe(contrato, confirmados);
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
        // Moto retenida: se le pueden seguir ajustando las cuentas, pero no entra a la gestión
        // del día ni a los contadores de estado (ver `operativos`).
        suspendido: contrato.estado === "Suspendido",
      };
    });
  }, [contratosActivos, pagos, deudas, convenios]);

  // ── Helpers para el detalle del recibo ──────────────────────────────────────
  // Fuente ÚNICA de "cuánto debe AHORA" (lista, Panel Hoy, cobro en campo, recibos). Para
  // motor de cajas usa el ledger real y respeta lo que el convenio ya financió
  // (cubre_periodo_hasta) — la fórmula vieja por ventana marcaba "Debe $X" a clientes al día.
  // Todo lo que un contrato debe HOY, desglosado. Pasa por `loQueDebe` (cicloPago) — la fuente
  // ÚNICA — para que la lista, el detalle, el recibo y Cobro Diario no puedan discrepar. Antes
  // esta cuenta estaba escrita acá y en otros nueve sitios que se fueron separando.
  function desgloseDebe(c: typeof resumenContratos[number]): LoQueDebe {
    return loQueDebe(
      c,
      pagosDelContrato(c.id).filter(p => p.estado === "Confirmado"),
      deudas.filter(d => d.contrato_id === c.id && d.estado === "pendiente"),
      c.convenioActivo,
      hoyDate(),
      {
        sinPagosNunca: c.sinPagosNunca ?? true,
        // El Diario cobra la tarifa del día contra lo recaudado HOY (ver loQueDebe).
        diario: c.forma_pago === "Diario"
          ? {
              toca: calcularCuotaDia(c.tarifa_diaria ?? 27000, new Date().getDay() === 0, c.tarifa_domingo),
              pagado: c.recaudadoHoy ?? 0,
            }
          : undefined,
      },
    );
  }

  function calcularPendienteContrato(c: typeof resumenContratos[number]): number {
    return desgloseDebe(c).totalFalta;
  }

  function sumaAbonadoConvenio(convenioId: string): number {
    return pagos
      .filter(p => p.convenio_id === convenioId && p.estado === "Confirmado")
      .reduce((acc, p) => acc + (p.aplicado_convenio ?? 0), 0);
  }

  // Los que están en la calle: sobre estos se hace la gestión diaria y se cuentan los estados.
  // Un contrato suspendido no puede estar "en mora" ni "paga hoy" — ya no tiene la moto.
  const operativos = useMemo(() => resumenContratos.filter(r => !r.suspendido), [resumenContratos]);
  const retenidos = useMemo(() => resumenContratos.filter(r => r.suspendido), [resumenContratos]);

  const enMora = operativos.filter(r => r.estadoCartera === "mora");
  const enGabela = operativos.filter(r => r.estadoCartera === "gabela");
  const alDia = operativos.filter(r => r.estadoCartera === "al-dia");
  const conConvenio = operativos.filter(r => r.convenioActivo);
  // La plata SÍ cuenta aunque la moto esté retenida: si el cliente abonó para recuperarla, eso
  // entró a la caja igual y el recaudo del día tiene que reflejarlo.
  const recaudadoHoyTotal = resumenContratos.reduce((acc, r) => acc + r.recaudadoHoy, 0);
  const recaudadoSemanaTotal = resumenContratos.reduce((acc, r) => acc + r.pagadoEstaSemana, 0);
  // ── Pagan Hoy ─────────────────────────────────────────────────────────────
  const paganHoyDiario = useMemo(() =>
    operativos.filter(c => c.forma_pago === "Diario"),
    [operativos]);

  const paganHoyPeriodico = useMemo(() =>
    operativos.filter(c => {
      if (c.forma_pago === "Diario") return false;
      return esDiaDePago(c, new Date());
    }), [operativos]);

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
    // Por fecha de CAJA: es la plata que este funcionario tiene que entregar hoy.
    const mios = pagos.filter(p => p.tipo_registro === "campo" && fechaDeCaja(p) === hoyISOPanel && p.registrado_por === profile.id);
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
    // `operativos`, no `resumenContratos`: al que ya le retuvieron la moto no se le sale a cobrar
    // ni se le manda a recolectar de nuevo. Su cuenta se ajusta desde la pestaña Contratos.
    operativos.forEach(c => {
      // Recolección: solo mora real con >3 días (estadoCartera ya descarta contratos nuevos/prorrateo)
      // Si tiene un plazo extra vigente, se queda en Mora — no se puede recolectar durante ese margen.
      if (c.estadoCartera === "mora" && c.diasSinPago > 3 && c.diasSinPago < 999 && !contratosConPlazoVigente.has(c.id)) recoleccion.push(c);
      else if (c.estadoCartera === "mora") mora.push(c);
      else if (c.estadoCartera === "gabela") gabela.push(c);
      else if (idsPaganHoy.has(c.id)) paganHoy.push(c);
    });
    return { recoleccion, mora, gabela, paganHoy };
  }, [operativos, paganHoyDiario, paganHoyPeriodico, contratosConPlazoVigente]);

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
    else if (filtroContratos === "retenidos") base = retenidos;
    else base = resumenContratos;  // "Todos" SÍ los incluye: no se pueden esconder, hay que poder ajustarles la cuenta

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
  }, [filtroContratos, filtroGrupoContratos, resumenContratos, enMora, enGabela, alDia, conConvenio, retenidos, paganHoyDiario, paganHoyPeriodico, busqueda, clientes, motos]);

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
        const a = calcularAplicacion(modalMonto, modalCuotaPendiente, 0, modalContrato.deudaContrato, desgloseDebe(modalContrato).acuerdo?.falta ?? 0);
        a.ahorro = calcularAhorroAplicado(modalContrato, a.tarifa, modalEnProrrateo,
          tarifaPagadaPeriodoActual(modalContrato, pagos.filter(p => p.contrato_id === modalContrato.id), hoyDate()));
        return a;
      })()
    : { tarifa: 0, baseInicial: 0, deuda: 0, convenio: 0, ahorro: 0, saldo: 0 };

  function cerrarModalPago() {
    setModalPago(false); setModalBusqueda(""); setModalContratoId(null); setModalListaAbierta(false);
    setModalValor(""); setModalMetodo("Efectivo"); setModalError(null); setModalExito(false);
    setModalComprobante(null); setModalSubiendo(false); setModalFechaPago(hoyISO()); setModalReferencia("");
    setModalFechaDelBanco(null); setModalRefRepetidaOk(false); setModalDescuadreOk(false);
    setModalCuentaId(null);
  }

  /** La referencia y la fecha del banco pertenecen a UN cliente: cambiar de cliente las invalida. */
  function limpiarDatosTransferencia() {
    setModalReferencia(""); setModalFechaPago(hoyISO()); setModalFechaDelBanco(null);
    setModalRefRepetidaOk(false); setModalDescuadreOk(false);
    // La cuenta también: el cliente nuevo puede ser de otro grupo, y dejarla pegada marcaría
    // su plata en una cuenta que ni siquiera es de su portafolio.
    setModalCuentaId(null);
  }

  /** Otro pago (no rechazado) ya usó esta misma referencia: el mismo dinero respaldando dos cobros. */
  function pagoConMismaReferencia(ref: string) {
    const r = normalizarRef(ref);
    if (r.length < 3) return null;
    return pagos.find(p => p.estado !== "Rechazado" && p.referencia && normalizarRef(p.referencia) === r) ?? null;
  }

  // Cruce vigente del modal. REGLA DEL NEGOCIO: una referencia va casada a UN solo valor —
  // un movimiento del banco es uno solo, por un monto exacto. Si el valor que se registra no
  // es idéntico al del extracto, ahí hay algo raro y el funcionario tiene que validarlo con
  // la foto del comprobante antes de pasar (no es un "abono parcial" de esa transferencia).
  const modalCruce = modalMetodo === "Transferencia" ? buscarPorReferencia(modalReferencia) : null;
  const modalCruceCalza = !!modalCruce && Math.round(modalMonto) === Math.round(modalCruce.monto);
  // La fecha del banco solo se adopta si el valor calza, o si el funcionario ya validó el
  // descuadre con el comprobante (ahí igual está comprobado que ESE dinero entró ese día).
  const modalCruceCubre = !!modalCruce && (modalCruceCalza || modalDescuadreOk);
  const modalFechaEfectiva = modalMetodo === "Transferencia"
    ? (modalCruceCubre ? modalCruce!.fecha_banco : modalFechaPago)
    : hoyISO();

  /** Validaciones de la transferencia comunes a los dos botones (pedir confirmación y registrar). */
  function errorTransferencia(): string | null {
    // Defensa en profundidad: aunque la UI fuerce Transferencia, el handler lo revalida.
    if (modalMetodo === "Efectivo" && !puedePagoNormal)
      return "No tienes permiso para registrar efectivo — el efectivo lo registra la secretaria.";
    if (modalMetodo !== "Transferencia") return null;
    if (!modalComprobante) return "Sube la foto del comprobante de la transferencia.";
    if (!modalReferencia.trim()) return "Escribe el N° de referencia de la transferencia.";
    if (modalCruce && !modalCruceCalza && !modalDescuadreOk)
      return `El banco recibió $ ${fmt(modalCruce.monto)} con la referencia ${modalCruce.referencia}, y estás registrando $ ${fmt(modalMonto)}. `
        + "Una referencia va casada a un solo valor: revisa la foto del comprobante y marca la casilla solo si de verdad corresponde.";
    const repetida = pagoConMismaReferencia(modalReferencia);
    if (repetida && !modalRefRepetidaOk)
      return "Esa referencia ya se usó en otro pago. Verifica en el extracto y marca la casilla si de verdad cubre a dos clientes.";
    if (modalFechaEfectiva > hoyISO() || modalFechaEfectiva < hoyMasDias(-60))
      return `La fecha del pago (${formatDate(modalFechaEfectiva)}) está fuera de rango: no puede ser futura ni de hace más de 60 días.`;
    return null;
  }

  // Sin permiso de efectivo, el modal nunca puede quedar parado en "Efectivo" — cubre
  // TODAS las puertas de entrada (botón de la tarjeta, "+", reset del cierre).
  useEffect(() => {
    if (modalPago && !puedePagoNormal && modalMetodo === "Efectivo") setModalMetodo("Transferencia");
  }, [modalPago, puedePagoNormal, modalMetodo]);

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
    const errT = errorTransferencia();
    if (errT) { setModalError(errT); return; }
    setModalError(null);
    setConfirmarModalOpen(true);
  }

  async function handleRegistrarPagoModal() {
    if (modalSubiendo) return;
    if (!modalContratoId) { setModalError("Selecciona un contrato."); return; }
    if (!modalValor || modalMonto <= 0) { setModalError("Ingresa un valor válido."); return; }
    // Se revalida todo aquí a propósito: este handler también se dispara desde la ventana
    // de confirmación, sin volver a pasar por pedirConfirmacionModal.
    const errT = errorTransferencia();
    if (errT) { setModalError(errT); setConfirmarModalOpen(false); return; }
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
    // Si la referencia cruza con una partida sin dueño Y el dinero alcanza, se resuelve ANTES
    // de registrar: el pago se guarda con la fecha comprobada del banco y la partida queda
    // ligada a él (completa o dejando el remanente en la bolsa).
    const cruce = modalCruceCubre ? modalCruce : null;
    const fechaPago = modalFechaEfectiva;
    const { error, id: pagoId } = await registrarPago(
      // Motor v2: el reparto lo hace la BD al confirmar; el desglose local es solo preview.
      modalContratoId, modalMonto, modalMetodo,
      modalContrato?.motor_v2 && modalContrato.forma_pago !== "Diario" ? APLICADO_LO_REPARTE_LA_BD : modalDesglose,
      {
        folio,
        comprobanteUrl,
        // QUIÉN lo registró. Esta puerta era la única que no lo guardaba — y como por acá entra
        // casi todo, las 343 transferencias de agosto quedaron sin dueño. Para plata que llega
        // por el banco y que después alguien tiene que cuadrar contra el extracto, un pago mal
        // metido sin nadie a quien preguntarle es un hueco de control. Cobro Diario, Clientes e
        // Inmovilizaciones sí lo guardaban: acá fue un olvido, no una decisión.
        registradoPor: profile?.id,
        // Fecha REAL en que pagó. Solo la transferencia puede llevar una fecha anterior;
        // el efectivo se recibe en la mano en el momento, así que siempre es hoy.
        // Si cruzó con el banco, manda la fecha del extracto (está comprobada).
        fecha: fechaPago,
        // Y si está COMPROBADA contra el extracto, esa plata también entra a la caja de ESE día:
        // el arqueo de cada día se compara contra el extracto de ese día. Contarla hoy dejaría
        // hoy sobrando y aquel día corto para siempre. Sin cruce no se pasa nada y la caja sigue
        // siendo la de hoy, porque ahí la fecha es solo lo que dice el cliente.
        ...(cruce ? { fechaCaja: cruce.fecha_banco } : {}),
        ...(modalMetodo === "Transferencia" ? { referencia: modalReferencia.trim(), cuentaId: modalCuentaId } : {}),
        ...(modalContrato?.convenioActivo?.id ? { convenioId: modalContrato.convenioActivo.id } : {}),
      },
    );
    if (error) { setModalError(error); return; }
    // La partida deja de estar "sin dueño": ya se sabe de quién era. Si el pago no la cubre
    // entera, el remanente queda en la bolsa. Si esto falla, el pago YA quedó registrado —
    // hay que decirlo así para que nadie lo vuelva a registrar creyendo que se perdió.
    if (cruce && pagoId) {
      const { error: errAsig } = await consumirPorPago(cruce, pagoId, modalMonto);
      if (errAsig) {
        setConfirmarModalOpen(false);
        setModalError(
          `El pago SÍ quedó registrado — NO lo vuelvas a registrar. Lo que falló fue marcar la transferencia `
          + `del banco (ref. ${cruce.referencia}) como ya reclamada: sigue en Caja → "Dinero sin identificar". `
          + `Avísale a la secretaria. Detalle: ${errAsig}`,
        );
        return;
      }
    }
    setConfirmarModalOpen(false);

    const contrato = contratos.find(c => c.id === modalContratoId);
    const cliente = contrato ? clientes.find(cl => cl.id === contrato.cliente_id) : null;
    const moto = contrato ? motos.find(m => m.id === contrato.moto_id) : null;

    // El modal queda abierto tras una transferencia: si no se limpian, la referencia y la
    // fecha del banco del cliente anterior viajan al siguiente pago.
    setModalValor(""); setModalComprobante(null); limpiarDatosTransferencia();

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
        debiaTotal: modalContrato ? desgloseDebe(modalContrato).totalFalta : modalCuotaPendiente,
        aplicadoTarifa: modalDesglose.tarifa,
        aplicadoDeuda: modalDesglose.deuda,
        aplicadoConvenio: modalDesglose.convenio,
        aplicadoSaldoFavor: modalDesglose.saldo,
        pendienteDespues: Math.max((modalContrato ? desgloseDebe(modalContrato).totalFalta : modalCuotaPendiente) - modalMonto, 0),
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
  // (El registro de pago inline del detalle se eliminó — ahora se cobra con el
  //  botón flotante "+". El flujo de pago vive en el modal `modalPago`.)

  async function handleAplicarSaldo() {
    if (procesando) return;
    if (!contratoSeleccionadoId || !contratoDetalle) return;
    const saldo = contratoDetalle.saldoAFavor ?? 0;
    if (saldo <= 0) return;
    if (!confirm(`¿Aplicar el saldo a favor de $${fmt(saldo)} a este contrato?`)) return;
    setProcesando(true);
    try {
      // Movimiento interno que consume el saldo y avanza la cuota (NO efectivo nuevo, NO caja diaria).
      const { error } = await aplicarSaldoFavor(
        contratoSeleccionadoId, saldo,
        contratoDetalle.convenioActivo?.id ? { convenioId: contratoDetalle.convenioActivo.id } : undefined,
      );
      if (error) { alert(error); return; }
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
      "🧾 *CLUB MOTEROS CARTAGENA — Recibo provisional (cobro en campo)*",
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
    const aplicado = calcularAplicacion(monto, cuotaPend, 0, r.deudaContrato, desgloseDebe(r).acuerdo?.falta ?? 0);
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

  // Atrás cierra el overlay/modal abierto más reciente (LIFO) antes de cambiar de módulo.
  useBackGuard(fotoAmpliada !== null, () => setFotoAmpliada(null));
  useBackGuard(reciboData !== null, () => setReciboData(null));
  useBackGuard(recoleccionModal !== null, () => setRecoleccionModal(null));
  useBackGuard(confirmarModalOpen, () => setConfirmarModalOpen(false));
  useBackGuard(confirmarCampoOpen, () => setConfirmarCampoOpen(false));
  useBackGuard(modalListaAbierta, () => setModalListaAbierta(false));
  useBackGuard(modalCampoAbierto, () => setModalCampoAbierto(false));
  useBackGuard(modalPago, cerrarModalPago);
  useBackGuard(fabOpen, () => setFabOpen(false));

  // ── Historial filtrado ────────────────────────────────────────────────────
  const pagosFiltrados = useMemo(() => {
    const q = busquedaHistorial.toLowerCase().trim();
    const base = (filtroPagos === "todos" ? pagos : pagos.filter(p => p.estado === filtroPagos))
      .filter(p => {
        if (!q) return true;
        const c = contratos.find(ct => ct.id === p.contrato_id);
        const cl = c ? clientes.find(cl => cl.id === c.cliente_id) : null;
        const m = c?.moto_id ? motos.find(mo => mo.id === c.moto_id) : null;
        return (cl?.nombre ?? "").toLowerCase().includes(q)
          || (cl?.cedula ?? "").includes(q)
          || (m?.placa ?? "").toLowerCase().includes(q);
      });
    return [...base].sort((a, b) => {
      if (a.estado === "Pendiente" && b.estado !== "Pendiente") return -1;
      if (b.estado === "Pendiente" && a.estado !== "Pendiente") return 1;
      return 0;
    });
  }, [pagos, filtroPagos, busquedaHistorial, contratos, clientes, motos]);

  if (loadingPagos || loadingContratos) {
    return (
      <div style={{ padding: "16px 12px", maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {[68, 92, 80, 76].map((w, i) => <div key={i} style={{ width: w, height: 30, borderRadius: 999, background: "var(--line)", animation: "mgPulsa 1.5s ease-in-out infinite" }} />)}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ height: 74, borderRadius: 14, background: "var(--line)", animation: "mgPulsa 1.5s ease-in-out infinite" }} />)}
        </div>
      </div>
    );
  }

  // ── Panel de detalle del contrato ─────────────────────────────────────────
  function PanelDetalle() {
    if (!contratoDetalle) {
      return (
        <div style={{ ...card, color: "var(--muted)", textAlign: "center", padding: 40 }}>
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
    // (El total de esta pantalla sale de `debe.totalFalta`, más abajo — la fuente única.)
    const proximoPagoConv = valorPeriodoReal(contratoDetalle) + cuotaConvActiva; // cuota + convenio próxima fecha
    // Si el convenio cubrió la cuota de esta semana, ese período ya no se cobra → el próximo
    // pago es cubre_periodo_hasta, que se guardó justamente como el día de pago SIGUIENTE
    // al período cubierto (ej. convenio del mié 8 → cubre_periodo_hasta = mié 15).
    const cubreHasta = cvActiva?.cubre_periodo_hasta ?? null;
    const proximoPagoFecha = cubreHasta && cubreHasta >= hoyISO() ? cubreHasta : (desg?.proximaFecha ?? ec.proximoPago);

    // "Debe pagar ahora" respetando la cobertura del convenio: si el convenio cubre hasta una
    // fecha >= hoy, las cajas de ese período ya están financiadas y NO se exigen ahora. El total
    // del bloque es SIEMPRE la suma exacta de las líneas que muestra (cajas exigibles + deuda
    // pendiente + cuota de convenio ya vigente).
    const convCubreAhora = !!(cubreHasta && cubreHasta >= hoyISO());
    const periodosDebe = desg ? (convCubreAhora ? desg.periodos.filter(p => p.fecha >= cubreHasta!) : desg.periodos) : [];
    const prorrateoDebe = desg ? (convCubreAhora ? 0 : desg.prorrateoPendiente) : 0;
    // ── LA CUENTA, de UNA sola fuente (cicloPago.loQueDebe) ──
    // Antes esta pantalla sumaba `cuotaConvExigida`, que es la cuota COMPLETA del acuerdo, sin
    // descontar lo que el cliente ya había abonado ese período: LIBINTO pagó su semana y su
    // cuota y la pantalla le seguía cobrando los mismos $100.000, mientras el estado decía
    // "al día". Ahora las tres partes (cuota, acuerdo, deudas) descuentan lo pagado igual.
    const debe = loQueDebe(
      contratoDetalle,
      pagosDelContrato(contratoDetalle.id).filter(p => p.estado === "Confirmado"),
      deudas.filter(d => d.contrato_id === contratoDetalle.id && d.estado === "pendiente"),
      cvActiva,
      hoyDate(),
      { sinPagosNunca: contratoDetalle.sinPagosNunca ?? true },
    );
    const totalDebeAhora = debe.totalFalta;

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

    // La hoja carta detallada. Reusa el MISMO `debe` que pinta la pantalla y el mismo desglose
    // que ya se muestra bajo cada pago del historial: el papel no puede decir otra cosa.
    function armarDatosDetallado(): DatosDetallado {
      const c = contratoDetalle!;
      const confirmados = pagosContrato.filter(p => p.estado === "Confirmado");
      const partesDe = (p: typeof confirmados[number]): string[] => {
        const out: string[] = [];
        const add = (l: string, v: number | null | undefined) => { if ((v ?? 0) > 0) out.push(`${l} $ ${fmt(v!)}`); };
        add("Días rodados", p.aplicado_prorrateo);
        add("Cuota", p.aplicado_tarifa);
        if ((p.aplicado_deuda ?? 0) > 0) out.push((p.aplicado_multa ?? 0) > 0
          ? `Deuda $ ${fmt(p.aplicado_deuda!)} (multa $ ${fmt(p.aplicado_multa!)})`
          : `Deuda $ ${fmt(p.aplicado_deuda!)}`);
        add("Convenio", p.aplicado_convenio);
        add("Base inicial", p.aplicado_base_inicial);
        add("Saldo a favor", p.aplicado_saldo_favor);
        return out;
      };
      const desglose = [
        { concepto: "Cuota del período", ...debe.cuota },
        ...(debe.acuerdo ? [{ concepto: "Cuota del acuerdo", toca: debe.acuerdo.toca, pagado: debe.acuerdo.pagado, falta: debe.acuerdo.falta }] : []),
        ...(debe.deudas.toca > 0 ? [{ concepto: "Deudas registradas", ...debe.deudas }] : []),
      ];
      // Preliquidación: su ahorro, menos lo que quedaría debiendo. NO incluye daños — los valora
      // el taller y sin revisión física cualquier cifra ahí sería inventada.
      const ahorro = (c.ahorro_acumulado ?? 0) + (c.ahorro_apertura ?? 0);
      const convPend = cvActiva ? Math.max(cvActiva.deuda_total - sumaAbonadoConvenio(cvActiva.id), 0) : 0;
      const lineas = [
        { label: "Se le devuelve su ahorro", monto: ahorro },
        ...(convPend > 0 ? [{ label: "Menos lo que queda del acuerdo", monto: -convPend }] : []),
        ...(debe.cuota.falta > 0 ? [{ label: "Menos la cuota corriente sin pagar", monto: -debe.cuota.falta }] : []),
        ...(debe.deudas.falta > 0 ? [{ label: "Menos sus deudas pendientes", monto: -debe.deudas.falta }] : []),
      ];
      return {
        ...armarDatosEstadoCuenta(),
        desglose,
        historial: confirmados.map(p => ({
          fecha: p.fecha, valor: p.valor, metodo: p.metodo, referencia: p.referencia,
          partes: partesDe(p), ahorro: p.aplicado_ahorro ?? 0,
        })),
        totalPagado: confirmados.reduce((s, p) => s + p.valor, 0),
        preliquidacion: { lineas, resultado: lineas.reduce((s, x) => s + x.monto, 0) },
      };
    }

    function imprimirDetallado() {
      if (!clienteDetalle) return;
      const html = generarHTMLEstadoCuentaDetallado(clienteDetalle, motoDetalle ?? null, armarDatosDetallado());
      const w = window.open("", "_blank", "width=760,height=900");
      if (!w) return;
      w.document.write(`<!DOCTYPE html><html><head><title>Estado de cuenta detallado</title><style>*{print-color-adjust:exact;-webkit-print-color-adjust:exact}@media print{body{margin:0}}</style></head><body>${html}</body></html>`);
      w.document.close();
      w.focus();
      w.print();
    }

    function imprimirEstadoCuenta() {
      if (!clienteDetalle) return;
      const html = generarHTMLEstadoCuenta(clienteDetalle, motoDetalle ?? null, armarDatosEstadoCuenta(), incluirAhorroDoc);
      const w = window.open("", "_blank", "width=420,height=640");
      if (!w) return;
      w.document.write(`<!DOCTYPE html><html><head><title>Estado de cuenta</title><style>*{print-color-adjust:exact;-webkit-print-color-adjust:exact}@media print{body{margin:0}}</style></head><body>${html}</body></html>`);
      w.document.close();
      w.focus();
      w.print();
    }

    function abrirWhatsApp(texto: string) {
      if (!clienteDetalle) return;
      const num = (clienteDetalle.whatsapp || clienteDetalle.telefono || "").replace(/\D/g, "");
      const full = num.length === 10 ? `57${num}` : num;
      if (full.length >= 11) window.open(`https://wa.me/${full}?text=${encodeURIComponent(texto)}`, "_blank");
      else alert("El cliente no tiene un número de WhatsApp válido registrado.");
    }

    function enviarEstadoCuentaWhatsApp() {
      if (!clienteDetalle) return;
      abrirWhatsApp(armarTextoEstadoCuenta(clienteDetalle, motoDetalle ?? null, armarDatosEstadoCuenta(), incluirAhorroDoc));
    }

    // Las cuentas de pago SIEMPRE salen del grupo de SU moto: mandarle las de otro portafolio
    // haría que su plata cayera en el bolsillo equivocado y nadie sabría de quién es.
    const cuentasDelCliente = cuentasDelGrupo(cuentasBancarias, motoDetalle?.grupo);
    function enviarCuentasWhatsApp() {
      if (!clienteDetalle) return;
      if (cuentasDelCliente.length === 0) {
        alert(motoDetalle?.grupo
          ? `No hay cuentas registradas para el grupo ${motoDetalle.grupo}. Agrégalas en Configuración → Cuentas bancarias.`
          : "Este contrato no tiene moto asignada, así que no se sabe a qué grupo pertenece.");
        return;
      }
      abrirWhatsApp(renderMsg("cuentas_pago", {
        nombre: clienteDetalle.nombre,
        placa: motoDetalle?.placa ?? "",
        cuentas: textoCuentas(cuentasDelCliente),
      }));
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 9 : 12 }}>
        {isMobile && (
          <button onClick={() => setContratoSeleccionadoId(null)} style={{ ...secondaryBtn, fontSize: 13, padding: "6px 12px", alignSelf: "flex-start" }}>
            ← Volver
          </button>
        )}

        {/* Header */}
        <div style={{ ...card, padding: isMobile ? "12px 14px" : 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: isMobile ? 17 : 20, textTransform: "uppercase", color: "var(--text)", lineHeight: 1.15 }}>
                {clienteDetalle?.nombre || "Sin cliente"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 10, marginTop: 6, fontSize: 13 }}>
                {motoDetalle && (
                  /* El grupo lo pinta el propio componente Placa (misma línea en toda la app).
                     Acá había además una etiqueta de color aparte y salía repetido. */
                  <button onClick={() => onNavigate?.("ficha_moto", motoDetalle.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }} title="Ver ficha de la moto">
                    <Placa placa={motoDetalle.placa} grupo={motoDetalle.grupo} size="lg" />
                  </button>
                )}
                {/* Tocar el número marca desde el celular: es la pantalla donde se persigue el pago. */}
                {clienteDetalle?.telefono && (
                  <a href={`tel:${clienteDetalle.telefono}`} style={{ color: "var(--accent-ink)", fontWeight: 700, textDecoration: "none", borderBottom: "1px solid var(--accent-ink)" }} title="Llamar">
                    📞 {clienteDetalle.telefono}
                  </a>
                )}
                {clienteDetalle?.cedula && <span style={{ color: "var(--muted)" }}>CC {clienteDetalle.cedula}</span>}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                Contrato {contratoDetalle.forma_pago ?? "semanal"} · Paga {formatDiaPago(contratoDetalle)}
                {clienteDetalle?.direccion && ` · ${clienteDetalle.direccion}`}
              </div>
              {/* Quién responde por esta moto. El grupo ya va bajo la placa. */}
              {motoDetalle && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999, textTransform: "uppercase",
                    background: motoDetalle.subadmin_id ? "var(--indigo-soft)" : "var(--soft)",
                    color: motoDetalle.subadmin_id ? "var(--indigo-ink)" : "var(--faint)",
                  }}>
                    👤 {motoDetalle.subadmin_id ? (nombreSubadmin(motoDetalle.subadmin_id) ?? "Asignada") : "Sin asignar"}
                  </span>
                </div>
              )}
              {/* Solo en los que nacieron en el sistema. En un MIGRADO el contador arranca en el
                  día del corte, no en el primer día del contrato: decir "va 2 de 104" cuando el
                  cliente lleva año y medio pagando es mentira, y confunde más de lo que informa.
                  Decisión del dueño, 5-ago. */}
              {contratoDetalle.motor_v2 && !contratoDetalle.es_migrado && (contratoDetalle.total_cajas ?? 0) > 0 && (
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-ink)", marginTop: 2 }}>
                  📦 Va {contratoDetalle.cajas_pagadas ?? 0} de {contratoDetalle.total_cajas} cuotas pagadas
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
              <EstadoBadge estado={contratoDetalle.estadoCartera} />
              {onNavigate && clienteDetalle && (
                <button onClick={() => onNavigate("ficha_cliente", clienteDetalle.id)} style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 700, fontSize: 12, cursor: "pointer", padding: 0 }}>
                  Ver ficha →
                </button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <button onClick={imprimirEstadoCuenta} style={{ ...secondaryBtn, fontSize: 12, padding: "7px 12px" }}>📄 Estado de cuenta</button>
            {/* El detallado es hoja carta: trae el historial COMPLETO con a qué se aplicó cada
                peso y la preliquidación. El de al lado sigue siendo el tiquete de 80mm para la
                térmica — son dos usos distintos, no se reemplazan. */}
            <button onClick={imprimirDetallado} style={{ ...secondaryBtn, fontSize: 12, padding: "7px 12px" }}>📋 Detallado</button>
            <button onClick={enviarEstadoCuentaWhatsApp} style={{ ...secondaryBtn, fontSize: 12, padding: "7px 12px", color: "var(--ok-ink)" }}>📱 Enviar por WhatsApp</button>
            <button onClick={enviarCuentasWhatsApp}
              title={cuentasDelCliente.length > 0
                ? `Le manda las ${cuentasDelCliente.length} cuenta(s) de ${motoDetalle?.grupo}`
                : "No hay cuentas registradas para el grupo de esta moto"}
              style={{ ...secondaryBtn, fontSize: 12, padding: "7px 12px", color: "var(--accent-ink)" }}>
              🏦 Cuentas para pagar
            </button>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted2)", cursor: "pointer" }} title="Si lo marcas, el ahorro sale en el impreso/compartido. Por defecto no se le muestra al cliente.">
              <input type="checkbox" checked={incluirAhorroDoc} onChange={e => setIncluirAhorroDoc(e.target.checked)} style={{ cursor: "pointer" }} />
              Incluir ahorro
            </label>
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

        {/* Validar dónde se guarda la moto (post-entrega) — solo ADMIN/AP (mig 060) */}
        <PanelGuardadoMoto
          contrato={contratoDetalle}
          clienteNombre={clienteDetalle?.nombre ?? ""}
          placa={motoDetalle?.placa ?? ""}
        />

        {/* Estado de cuenta — la etiqueta/color usan estadoCartera (misma fuente que el badge),
            no la función vieja, para que no diga "Gabela" mientras el badge dice "Al día". */}
        <div style={{ ...card, padding: isMobile ? "12px 14px" : 16, background: ESTADO_CARTERA_STYLE[contratoDetalle.estadoCartera].bg, border: `1px solid ${ESTADO_CARTERA_STYLE[contratoDetalle.estadoCartera].color}44` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 13, color: "var(--muted2)", alignItems: "center" }}>
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
            <div style={{ background: "var(--soft2)", borderRadius: 10, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>
                {contratoDetalle.forma_pago === "Diario" ? "Cuota hoy" : "Cuota período"}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>$ {fmt(cuotaPactada)}</div>
            </div>
            <div style={{ background: "var(--soft2)", borderRadius: 10, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>
                {contratoDetalle.forma_pago === "Diario" ? "Pagado hoy" : "Pagado período"}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>$ {fmt(pagadoEnPeriodo)}</div>
            </div>
            {/* "Al día" solo si de verdad no debe nada — incluye deuda pendiente y convenio,
                no solo la cuota de esta semana (mismo criterio que Panel Hoy y Cobro en campo). */}
            <div style={{ background: enProrrateo ? "var(--accent-soft2)" : totalDebeAhora > 0 ? "var(--bad-line)" : "var(--ok-line)", borderRadius: 10, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>
                {enProrrateo ? "Próx. pago" : "Pendiente"}
              </div>
              <div style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.1, fontVariantNumeric: "tabular-nums", color: enProrrateo ? "var(--accent)" : totalDebeAhora > 0 ? "var(--bad-ink)" : "var(--ok-ink)" }}>
                {enProrrateo ? `$ ${fmt(cuotaPactada)}` : totalDebeAhora > 0 ? `$ ${fmt(totalDebeAhora)}` : "✓ Al día"}
              </div>
            </div>
          </div>

          {/* ── De dónde sale esa cifra ──
              El número de arriba solo dice CUÁNTO. El funcionario también necesita saber POR QUÉ:
              si el cliente pagó o si el sistema se equivocó. Sin esto, un "$0" se lee como una
              falla y un "$100.000" se le vuelve a cobrar a quien ya pagó (caso LIBINTO).
              Sale del MISMO objeto que el número, así que no pueden contradecirse. */}
          {!enProrrateo && (
            <div style={{ marginTop: 12, background: "var(--soft2)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4, marginBottom: 8 }}>
                De dónde sale
              </div>
              {[
                { k: "Cuota del período", p: debe.cuota },
                ...(debe.acuerdo ? [{ k: "Cuota del acuerdo", p: debe.acuerdo }] : []),
                ...(debe.deudas.toca > 0 ? [{ k: "Deudas", p: debe.deudas }] : []),
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, padding: "3px 0", fontSize: 13 }}>
                  <span style={{ color: "var(--muted2)", minWidth: 0 }}>{f.k}</span>
                  <span style={{ display: "flex", gap: 10, alignItems: "baseline", whiteSpace: "nowrap" }}>
                    <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>$ {fmt(f.p.toca)}</span>
                    <strong style={{ fontSize: 12, color: f.p.falta === 0 ? "var(--ok-ink)" : f.p.pagado > 0 ? "var(--warn-ink)" : "var(--bad-ink)" }}>
                      {f.p.toca === 0 ? "—" : f.p.falta === 0 ? "pagada" : f.p.pagado > 0 ? `abonó $ ${fmt(f.p.pagado)}` : "pendiente"}
                    </strong>
                  </span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, borderTop: "1px solid var(--line)", marginTop: 8, paddingTop: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text)" }}>Le falta por pagar</span>
                <strong style={{ fontSize: 18, fontVariantNumeric: "tabular-nums", color: totalDebeAhora > 0 ? "var(--bad-ink)" : "var(--ok-ink)" }}>
                  $ {fmt(totalDebeAhora)}
                </strong>
              </div>
              {/* El saldo a favor se MUESTRA pero NO se resta (regla del dueño): se aplica a mano. */}
              {debe.saldoAFavor > 0 && (
                <div style={{ marginTop: 6, fontSize: 12, color: "var(--ok-ink)" }}>
                  Además tiene <strong>$ {fmt(debe.saldoAFavor)}</strong> a favor, sin usar.
                </div>
              )}
            </div>
          )}

          {/* Ahorro del cliente — SIEMPRE visible en pantalla (en el impreso/compartido es opcional).
              De inicio = ahorro de apertura; Por pagos = ahorro ganado pagando. */}
          <div style={{ marginTop: 12, background: "var(--soft2)", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Ahorro</div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13, flexWrap: "wrap" }}>
              <span style={{ color: "var(--muted2)" }}>De inicio <strong style={{ color: "var(--text)" }}>$ {fmt(contratoDetalle.ahorro_apertura ?? 0)}</strong></span>
              <span style={{ color: "var(--muted2)" }}>Por pagos <strong style={{ color: "var(--text)" }}>$ {fmt(contratoDetalle.ahorro_acumulado ?? 0)}</strong></span>
              <span style={{ color: "var(--muted2)" }}>Total <strong style={{ color: "var(--ok-ink)" }}>$ {fmt((contratoDetalle.ahorro_apertura ?? 0) + (contratoDetalle.ahorro_acumulado ?? 0))}</strong></span>
            </div>
          </div>

          {/* Desglose por fecha (motor de cajas): qué períodos debe y de qué fecha — para que el
              funcionario sepa de un vistazo qué cobrar. Respeta lo que el convenio ya cubre y el
              TOTAL es SIEMPRE la suma exacta de las líneas mostradas. */}
          {desg && totalDebeAhora > 0 && (
            <div style={{ marginTop: 12, background: "var(--card)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--bad-line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--bad-ink)", textTransform: "uppercase" }}>Debe pagar ahora</span>
                {periodosDebe.length >= 2 && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--bad-ink)", background: "var(--bad-soft)", borderRadius: 999, padding: "2px 8px" }}>🔴 {periodosDebe.length} cuotas vencidas</span>
                )}
              </div>
              <div style={{ display: "grid", gap: 3 }}>
                {prorrateoDebe > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted2)" }}>
                    <span>Prorrateo inicial</span><strong>$ {fmt(prorrateoDebe)}</strong>
                  </div>
                )}
                {/* RANGO, no una fecha suelta. Decía "Cuota Lun 3 ago": el funcionario leía
                    "3 de agosto", el cliente respondía "yo pagué el 3 de agosto" y los dos tenían
                    razón — ese pago tapó la semana ANTERIOR. La fecha sola confunde; el rango
                    deja claro que es el período que arranca ese día, no el día del pago. */}
                {periodosDebe.map((p, i) => {
                  const fin = proximoDiaPago(contratoDetalle, new Date(p.fecha + "T00:00:00"));
                  fin.setDate(fin.getDate() - 1);
                  return (
                    <div key={p.fecha} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted2)", fontWeight: i === 0 ? 700 : 400 }}>
                      <span style={{ minWidth: 0 }}>
                        {contratoDetalle.forma_pago === "Diario"
                          ? `Cuota ${fmtFecha(p.fecha)}`
                          : `Del ${fmtFecha(p.fecha)} al ${fmtFecha(fechaISO(fin))}`}
                        {p.parcial ? " (parcial)" : ""}
                        <span style={{ color: p.diasVencida > 0 ? "var(--bad-ink)" : "var(--orange)", fontWeight: 700 }}> · {p.diasVencida > 0 ? `${p.diasVencida}d vencida` : "vence hoy"}</span>
                      </span>
                      <strong style={{ flexShrink: 0 }}>$ {fmt(p.monto)}</strong>
                    </div>
                  );
                })}
                {contratoDetalle.deudaContrato > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted2)" }}>
                    <span>Multa / deuda</span><strong>$ {fmt(contratoDetalle.deudaContrato)}</strong>
                  </div>
                )}
                {cuotaConvExigida > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted2)" }}>
                    <span>Cuota del convenio</span><strong>$ {fmt(cuotaConvExigida)}</strong>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>TOTAL A COBRAR</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "var(--bad-ink)" }}>$ {fmt(totalDebeAhora)}</span>
              </div>
              {/* Usa `proximoPagoFecha`, NO `desg.proximaFecha` cruda: cuando el convenio se tragó
                  semanas (`cubre_periodo_hasta`), esas cajas dejan de exigirse y el próximo pago se
                  corre. Los otros 3 sitios ya lo hacían bien y este se quedó con la fecha pelada:
                  MARTHA (RLT68H) mostraba "Próximo: Lun 17" arriba y "próximo pago: Lun 10" abajo,
                  en la misma pantalla. La correcta es la del convenio. */}
              {proximoPagoFecha && (
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                  Después de esto, próximo pago: <strong>{fmtFecha(proximoPagoFecha)}</strong> · $ {fmt(desg.proximoMonto + cuotaConvActiva)}
                  {cuotaConvActiva > 0 && <span> (cuota $ {fmt(desg.proximoMonto)} + convenio $ {fmt(cuotaConvActiva)})</span>}
                </div>
              )}
              {/* La pregunta que el funcionario hace todos los días: "pero si el cliente ha estado
                  pagando, ¿por qué debe?". Casi siempre la respuesta es que va corrido desde el
                  arranque: cada pago tapa el hueco anterior y nunca el del día. Dicho acá, se
                  contesta sola. Solo en los que nacieron en el sistema: en un migrado el contador
                  arranca en el corte y la cuenta no significa lo mismo. */}
              {(() => {
                if (!contratoDetalle.motor_v2 || contratoDetalle.es_migrado) return null;
                const exigidas = cajasExigidasHasta(contratoDetalle, hoyDate());
                const pagadas = contratoDetalle.cajas_pagadas ?? 0;
                const atras = exigidas - pagadas;
                if (atras < 1 || pagadas < 1) return null;
                return (
                  <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 9, background: "var(--soft2)", border: "1px solid var(--line)", fontSize: 11.5, color: "var(--muted2)", lineHeight: 1.5 }}>
                    📌 Lleva <strong>{pagadas}</strong> de <strong>{exigidas}</strong> cuotas corridas desde que arrancó:
                    va <strong>{atras}</strong> {atras === 1 ? "atrás" : "atrasos"}. Cada pago que hace tapa el hueco
                    anterior, así que puede estar pagando completo y aun así aparecer debiendo.
                  </div>
                );
              })()}
            </div>
          )}

          {/* Al día (nada exigible ahora): solo el próximo pago y su fecha */}
          {desg && totalDebeAhora === 0 && (desg.proximaFecha || (cubreHasta && cubreHasta >= hoyISO())) && (
            <div style={{ marginTop: 12, background: "var(--ok-soft)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--ok-line)", fontSize: 13, color: "var(--ok-ink)" }}>
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
                <div style={{ background: "var(--accent-soft2)", border: "1px solid var(--accent-line)", borderRadius: 10, padding: "8px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-ink)", textTransform: "uppercase" }}>
                    Próximo pago{contratoDetalle.forma_pago !== "Diario" ? ` — ${fmtFecha(proximoPagoFecha)}` : ""}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-ink)", marginTop: 2 }}>$ {fmt(proximoPagoConv)}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>cuota $ {fmt(valorPeriodoReal(contratoDetalle))} + convenio $ {fmt(cuotaConvActiva)}</div>
                </div>
              )}
              <span style={{ background: "var(--warn-soft)", color: "var(--warn-ink)", borderRadius: 8, padding: "4px 10px", fontWeight: 700, alignSelf: "flex-start" }}>
                🤝 Convenio #{cvActiva.numero_convenio} · saldo $ {fmt(saldoConvenio)} · creado {fmtFecha(cvActiva.created_at.slice(0, 10))}
              </span>
            </div>
          ) : contratoDetalle.deudaContrato > 0 ? (
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", fontSize: 13 }}>
              <span style={{ background: "var(--bad-soft)", color: "var(--bad-ink)", borderRadius: 8, padding: "4px 10px", fontWeight: 700 }}>
                + Deuda: $ {fmt(contratoDetalle.deudaContrato)}
              </span>
              {totalDebeAhora > cuotaPendiente && (
                <span style={{ background: "rgba(255,255,255,0.8)", borderRadius: 8, padding: "4px 10px", fontWeight: 700, fontSize: 14, color: "var(--bad-ink)", marginLeft: "auto" }}>
                  Total: $ {fmt(totalDebeAhora)}
                </span>
              )}
            </div>
          ) : null}

          {(contratoDetalle.saldoAFavor ?? 0) > 0 && (
            // Recuadro explicado: en época de adaptación el funcionario tiene que entender qué es
            // esta plata y qué pasa al tocar "Aplicar" — sin eso, la salida natural es registrar
            // un pago nuevo "para cuadrar", que infla la caja con dinero ya contado.
            <div style={{ marginTop: 10, background: "var(--accent-soft2)", border: "1px solid var(--accent-line)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>Saldo a favor</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>$ {fmt(contratoDetalle.saldoAFavor ?? 0)}</div>
                </div>
                {puedeAplicarSaldo && (
                  <button onClick={handleAplicarSaldo} style={{ background: "var(--accent)", color: "#0f172a", border: "none", borderRadius: 10, padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    Aplicar a lo que debe
                  </button>
                )}
              </div>
              <div style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.5, color: "var(--accent-ink)" }}>
                Plata que el cliente <b>ya pagó</b> y quedó guardada a su favor (esa plata <b>ya está contada
                en la caja</b> del día en que la entregó).
                {puedeAplicarSaldo
                  ? <> Al tocar <b>«Aplicar a lo que debe»</b> se descuenta de su cuota o su deuda. <b>No cobres otra vez
                      ni registres un pago nuevo</b> — ese dinero ya entró.</>
                  : <> Para usarla hay que tocar «Aplicar». <b>No registres un pago nuevo</b> con este monto: ese dinero
                      ya entró y se contaría dos veces. Si no ves el botón, pídeselo a quien tenga el permiso.</>}
              </div>
              {/* De dónde viene. Importa distinguirlo: el de apertura NO pasó por ninguna caja del
                  sistema (es de las cuentas viejas), así que la frase de arriba no aplica a esa parte. */}
              {(contratoDetalle.saldo_favor_apertura ?? 0) > 0 && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed var(--accent-line)", fontSize: 11.5, lineHeight: 1.5, color: "var(--accent-ink)" }}>
                  De ese total, <b>$ {fmt(contratoDetalle.saldo_favor_apertura ?? 0)}</b> los traía <b>de las cuentas
                  viejas</b>, de antes de entrar al sistema. Esa parte nunca pasó por una caja de acá.
                </div>
              )}
            </div>
          )}
          {saldoExito && (
            <div style={{ marginTop: 6, padding: "8px 10px", background: "var(--ok-soft)", borderRadius: 8, color: "var(--ok-ink)", fontWeight: 700, fontSize: 12, lineHeight: 1.45 }}>
              ✅ Listo. Se usó el saldo del cliente para cubrir lo que debía. No entró dinero nuevo, así que la caja de hoy no cambia.
            </div>
          )}

          {/* El día de corte de la cartera del grupo (pedido del dueño, 22-ago): saber qué día se
              hizo el corte. Un solo renglón a propósito — así lo pidió. */}
          {motoDetalle?.grupo && (
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px dashed var(--line)", fontSize: 11.5, color: "var(--muted)", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              📅 Corte de la cartera <strong>{motoDetalle.grupo}</strong>: <strong>{fmtFecha(corteMigracionGrupo(motoDetalle.grupo))}</strong>
            </div>
          )}
        </div>

        {/* Sección "Registrar pago" del detalle eliminada (decisión del usuario):
            el pago ahora se hace con el botón flotante "+" (abre la ventana Cobrar
            ya cargada con este contrato). */}

        {/* Tabs secundarias */}
        <div style={card}>
          <div style={{ display: "flex", gap: 4, marginBottom: 14, borderBottom: "2px solid var(--soft)", paddingBottom: 10, flexWrap: "wrap" }}>
            {(["gestiones", "deudas", "convenios", "historial"] as const).map(t => (
              <button
                key={t}
                onClick={() => setDetailTab(t)}
                style={{
                  background: detailTab === t ? "var(--text)" : "transparent",
                  color: detailTab === t ? "var(--card)" : "var(--muted)",
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
              {gestionError && <div style={{ color: "var(--bad-ink)", fontSize: 13, fontWeight: 600 }}>{gestionError}</div>}
              {gestionExito && <div style={{ color: "var(--ok-ink)", background: "var(--ok-soft)", padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>Gestión registrada.</div>}
              <button onClick={handleRegistrarGestion} disabled={procesando} style={{ ...secondaryBtn, opacity: procesando ? 0.6 : 1 }}>{procesando ? "Registrando..." : "Registrar gestión"}</button>
              {gestionesContrato.length > 0 && (
                <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
                  {gestionesContrato.map(g => (
                    <div key={g.id} style={{ padding: "8px 12px", background: "var(--soft2)", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13 }}>
                      <span style={{ fontWeight: 700 }}>{g.tipo}</span>
                      {g.resultado && <span style={{ color: "var(--muted)" }}> — {g.resultado}</span>}
                      <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>{formatDate(g.fecha)}</div>
                    </div>
                  ))}
                </div>
              )}
              {gestionesContrato.length === 0 && <div style={{ color: "var(--muted)", fontSize: 14 }}>Sin gestiones registradas.</div>}
            </div>
          )}

          {/* Tab Deudas */}
          {detailTab === "deudas" && (
            <div style={{ display: "grid", gap: 10 }}>
              {deudasContrato.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 14 }}>Sin deudas pendientes.</div>
              ) : deudasContrato.map(d => (
                deudaEditandoId === d.id ? (
                  <div key={d.id} style={{ padding: 14, borderRadius: 12, background: "var(--soft2)", border: "1px solid var(--line)", display: "grid", gap: 10 }}>
                    <div>
                      <div style={labelStyle}>Concepto</div>
                      <select style={inputStyle} value={editConcepto} onChange={e => setEditConcepto(e.target.value as ConceptoDeuda)}>
                        <option value="daño_vehiculo">Daño al vehículo</option>
                        <option value="tarifa_atrasada">Tarifa atrasada</option>
                        <option value="prestamo_repuesto">Préstamo repuestos</option>
                        <option value="prestamo_eventualidad">Préstamo eventualidad</option>
                        <option value="fotomulta">Fotomulta</option>
                        <option value="multa_recoleccion">Multa recolección</option>
                        <option value="lavada">Lavada del vehículo</option>
                        <option value="migracion">Deuda de migración (sistema viejo)</option>
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
                    <div style={{ fontSize: 12, color: "var(--faint)" }}>Si el pendiente llega a $0, la deuda queda marcada como pagada automáticamente.</div>
                    {editDeudaError && <div style={{ color: "var(--bad-ink)", fontSize: 13, fontWeight: 600 }}>{editDeudaError}</div>}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setDeudaEditandoId(null)} style={{ ...miniBtn("var(--soft)", "var(--muted2)"), flex: 1 }}>Cancelar</button>
                      <button onClick={() => handleEliminarDeuda(d.id, d)} disabled={guardandoEditDeuda} style={{ ...miniBtn("var(--bad-soft)", "var(--bad-ink)"), flex: 1, opacity: guardandoEditDeuda ? 0.6 : 1 }}>🗑️ Eliminar</button>
                      <button onClick={() => guardarEdicionDeuda(d)} disabled={guardandoEditDeuda} style={{ ...primaryBtn, flex: 1, opacity: guardandoEditDeuda ? 0.6 : 1 }}>
                        {guardandoEditDeuda ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={d.id} style={{ padding: "10px 12px", borderRadius: 12, background: "#fff7f7", border: "1px solid var(--bad-line)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{d.concepto.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{d.descripcion}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--bad-ink)", whiteSpace: "nowrap" }}>$ {fmt(d.monto_pendiente)}</div>
                      {puedeEditarDeuda && (
                        <button onClick={() => abrirEdicionDeuda(d)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15 }}>✏️</button>
                      )}
                    </div>
                  </div>
                )
              ))}
              {puedeEditarDeuda && (
                <div>
                  <button onClick={() => setMostrarFormDeuda(v => !v)} style={miniBtn("var(--soft)", "var(--muted2)")}>
                    {mostrarFormDeuda ? "Cancelar" : "+ Registrar deuda"}
                  </button>
                  {mostrarFormDeuda && (
                    <div style={{ background: "var(--soft2)", borderRadius: 12, padding: 14, marginTop: 10, display: "grid", gap: 10 }}>
                      <div>
                        <div style={labelStyle}>Concepto</div>
                        <select style={inputStyle} value={deudaConcepto} onChange={e => setDeudaConcepto(e.target.value as ConceptoDeuda)}>
                          <option value="daño_vehiculo">Daño al vehículo</option>
                          <option value="tarifa_atrasada">Tarifa atrasada</option>
                          <option value="prestamo_repuesto">Préstamo repuestos</option>
                          <option value="prestamo_eventualidad">Préstamo eventualidad</option>
                          <option value="fotomulta">Fotomulta</option>
                          {/* Faltaba acá aunque sí existía en el formulario de EDITAR: quien
                              necesitaba cargar a mano la multa de una recolección tenía que
                              disfrazarla de "Otro". */}
                          <option value="multa_recoleccion">Multa por recolección / inmovilización</option>
                          <option value="lavada">Lavada del vehículo</option>
                          <option value="migracion">Deuda de migración (sistema viejo)</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                      <div>
                        <div style={labelStyle}>Descripción</div>
                        <input style={inputStyle} value={deudaDescripcion} onChange={e => setDeudaDescripcion(e.target.value)} placeholder="Detalle del origen de la deuda..." />
                      </div>
                      <MoneyInput label="Monto" value={deudaMonto} onChange={setDeudaMonto} />
                      {deudaError && <div style={{ color: "var(--bad-ink)", fontSize: 13, fontWeight: 600 }}>{deudaError}</div>}
                      {deudaExito && <div style={{ color: "var(--ok-ink)", background: "var(--ok-soft)", padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>Deuda registrada.</div>}
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
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{totalConvenios}/3 convenios usados.</div>
              {/* La puerta es el permiso por persona (crear_convenio), no el rol: cubre ADMIN/AP
                  por default, SECRETARIA por default, y overrides tipo LUMAR (SUBADMIN). */}
              {!puedeCrearConvenio ? (
                <div style={{ color: "var(--muted)", fontSize: 14 }}>No tienes permiso para gestionar convenios — pídele al encargado.</div>
              ) : convenioActual ? (
                <div style={{ background: "var(--warn-soft2)", borderRadius: 12, padding: 14, border: "1px solid var(--warn-line)" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--warn-ink)" }}>Convenio #{convenioActual.numero_convenio} — Activo</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{convenioActual.concepto}</div>
                  <div style={{ fontSize: 12, color: "var(--warn-ink)", marginTop: 2, fontWeight: 600 }}>📅 Creado el {fmtFecha(convenioActual.created_at.slice(0, 10))}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                    <InfoBox label="Deuda total" value={`$ ${fmt(convenioActual.deuda_total)}`} />
                    <InfoBox label="Cuota por período" value={`$ ${fmt(convenioActual.cuota_por_periodo)}`} highlight />
                    <InfoBox label="Cuotas" value={`${convenioActual.cuotas_pagadas} / ${convenioActual.numero_cuotas}`} />
                    <InfoBox label="Fecha límite" value={formatDate(convenioActual.fecha_limite)} />
                    {/* La fecha límite es la de la ÚLTIMA cuota — no le sirve al funcionario para
                        decirle al cliente cuándo vuelve a pagar. Esta sale de la misma función que
                        decide el cobro, así que no puede anunciar una fecha y cobrar en otra. */}
                    <InfoBox
                      label="Próxima cuota"
                      value={(() => {
                        const f = proximaCuotaConvenio(convenioActual, contratoDetalle, hoyDate());
                        return f ? fmtFechaLarga(f) : "—";
                      })()}
                      highlight
                    />
                  </div>
                  {/* Antes, un cliente con convenio activo al que le llegaba una deuda nueva (una
                      multa de recolección, que se crea sola) no tenía dónde ponerla: no se puede
                      crear un segundo convenio, y borrar este para rehacerlo pierde sus abonos.
                      Ampliar respeta lo ya pagado y su cuota — solo extiende el plazo. */}
                  <button
                    onClick={() => setAmpliandoConvenio(convenioActual)}
                    style={{ ...primaryBtn, width: "100%", marginTop: 12 }}
                  >
                    ➕ Agregar deuda a este convenio
                  </button>
                </div>
              ) : totalConvenios >= 3 ? (
                <div style={{ color: "var(--bad-ink)", fontSize: 14, fontWeight: 600, background: "var(--bad-soft)", border: "1px solid var(--bad-line)", borderRadius: 12, padding: "12px 14px", lineHeight: 1.5 }}>
                  Máximo de 3 convenios alcanzado. Si no puede pagar, la salida es la <strong>liquidación</strong> —
                  se inicia desde Contratos o desde Inmovilizaciones.
                </div>
              ) : deudasContrato.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 14 }}>No hay deudas pendientes para crear un convenio.</div>
              ) : (
                <div>
                  <button
                    onClick={() => setMostrarFormConvenio(true)}
                    style={miniBtn("var(--accent-soft2)", "var(--accent-ink)")}
                  >
                    + Crear convenio
                  </button>
                  {/* Cartera tenía su PROPIO formulario de convenio escrito acá adentro: se veía y se
                      comportaba distinto del de las otras tres puertas (Inmovilizaciones, Cobro Diario y
                      el wizard), y además se saltaba el tope de cuotas. Ahora las cuatro usan el mismo
                      componente. Decisión del dueño, 31-jul: "un convenio es un convenio". */}
                  {mostrarFormConvenio && contratoDetalle && (
                    <ModalConvenio
                      contratoId={contratoDetalle.id}
                      clienteNombre={clienteDetalle?.nombre ?? ""}
                      onClose={() => setMostrarFormConvenio(false)}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab Historial */}
          {detailTab === "historial" && (
            <div style={{ display: "grid", gap: 8 }}>
              {pagosContrato.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 14 }}>Sin pagos registrados.</div>
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
                const prorrAp = p.aplicado_prorrateo ?? 0;
                const baseAp = p.aplicado_base_inicial ?? 0;
                // La MULTA no es un renglón aparte: es el pedazo de `aplicado_deuda` que fue a
                // multas (el motor la guarda como least(aplicado_deuda, multas_pendientes)).
                // Mostrarla suelta contaría la misma plata dos veces — por eso acompaña a la deuda.
                const multaAp = p.aplicado_multa ?? 0;
                // El orden es el MISMO en que el motor reparte cada peso: días rodados → cuota →
                // deuda → convenio → base → saldo a favor. Así el funcionario ve la regla, no solo
                // el resultado. Faltaban prorrateo, multa y base inicial: un pago que iba entero a
                // los días rodados salía diciendo "sin desglose (pago antiguo)" — falso, y dejaba
                // invisible el ahorro que llevaba adentro.
                const partes: string[] = [];
                if (prorrAp > 0) partes.push(`Días rodados $${fmt(prorrAp)}`);
                if (cuota > 0) partes.push(`Cuota $${fmt(cuota)}`);
                if (deudaAp > 0) partes.push(multaAp > 0
                  ? `Deuda $${fmt(deudaAp)} · de eso multa $${fmt(multaAp)}`
                  : `Deuda $${fmt(deudaAp)}`);
                if (convAp > 0) partes.push(`Convenio $${fmt(convAp)}`);
                if (baseAp > 0) partes.push(`Base inicial $${fmt(baseAp)}`);
                if (saldoAp > 0) partes.push(`Saldo a favor $${fmt(saldoAp)}`);
                return (
                <div key={p.id} style={{ padding: "10px 12px", borderRadius: 12, background: "var(--soft2)", border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>$ {fmt(p.valor)}</div>
                      {/* Los movimientos INTERNOS no son plata que entró: mostrar "Efectivo" ahí
                          hacía que aplicar un saldo se viera idéntico a un pago nuevo (caso RMB51H,
                          31-jul: el dueño creyó que se había contado dos veces). No entran a la caja. */}
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {fmtFechaLarga(p.fecha)} · {esPagoDeCaja(p) ? p.metodo : "No entró dinero"}
                      </div>
                      {/* Avisos en palabras simples (época de adaptación): el funcionario debe entender
                          de un vistazo por qué ve dos renglones del mismo monto y cuál de los dos es
                          plata de verdad. Antes decía "Efectivo" en ambos y parecía cobro doble. */}
                      {p.tipo_registro === "adelanto_base" && (
                        <div style={{ marginTop: 5, fontSize: 11, lineHeight: 1.45, color: "var(--accent-ink)", background: "var(--accent-soft2)", border: "1px solid var(--accent-line)", borderRadius: 10, padding: "6px 9px" }}>
                          <b>🎫 Primera semana adelantada.</b> No es plata de hoy: se pagó con la base inicial
                          cuando se le entregó la moto. Por eso no aparece en la caja.
                        </div>
                      )}
                      {p.tipo_registro === "saldo_favor" && (
                        <div style={{ marginTop: 5, fontSize: 11, lineHeight: 1.45, color: "var(--accent-ink)", background: "var(--accent-soft2)", border: "1px solid var(--accent-line)", borderRadius: 10, padding: "6px 9px" }}>
                          <b>🔄 No es un pago nuevo.</b> Aquí se usó la plata que el cliente <b>ya había abonado antes</b>{" "}
                          (su saldo a favor) para cubrir esta cuota. <b>No entró dinero hoy</b>, por eso no suma en la caja del día.
                        </div>
                      )}
                      {/* La plata que se quedó guardada: explica POR QUÉ no bajó la deuda. */}
                      {esPagoDeCaja(p) && p.estado === "Confirmado" && saldoAp > 0 && saldoAp >= p.valor && (
                        <div style={{ marginTop: 5, fontSize: 11, lineHeight: 1.45, color: "var(--warn-ink)", background: "var(--warn-soft)", border: "1px solid var(--warn-line)", borderRadius: 10, padding: "6px 9px" }}>
                          <b>💡 Esta plata quedó guardada como saldo a favor.</b> El cliente sí pagó y el dinero está
                          contado en la caja, pero en esa fecha no había cuota que cobrarle todavía.
                          Queda a su favor hasta que alguien toque <b>«Aplicar»</b> en el recuadro de saldo a favor.
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <PagoBadge estado={p.estado} />
                      {p.estado === "Pendiente" && puedeConfirmarPago && (
                        <>
                          <button onClick={() => confirmarPago(p.id)} style={miniBtn("var(--ok-soft)", "var(--ok-ink)")}>Confirmar</button>
                          <button onClick={() => rechazarPago(p.id)} style={miniBtn("var(--bad-soft)", "var(--bad-ink)")}>Rechazar</button>
                        </>
                      )}
                    </div>
                  </div>
                  {p.estado !== "Rechazado" && (partes.length > 0 || ahorroAp > 0) && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed var(--line2)", fontSize: 11, color: "var(--accent-ink)", fontWeight: 600, display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                      <span style={{ color: "var(--faint)" }}>Se aplicó a:</span>
                      {partes.length > 0 ? partes.map((t, i) => <span key={i} style={{ background: "var(--accent-soft)", borderRadius: 999, padding: "2px 8px" }}>→ {t}</span>) : <span style={{ color: "var(--faint)" }}>sin desglose (pago antiguo)</span>}
                      {/* El ahorro NO es una parte más: sale de adentro de la cuota o de los días
                          rodados (los dos únicos baldes que lo generan). Decía "de la cuota", que
                          era falso cuando venía del prorrateo. */}
                      {ahorroAp > 0 && <span style={{ color: "var(--faint)", fontWeight: 400 }}>(de eso, ${fmt(ahorroAp)} es ahorro suyo)</span>}
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
      return <div style={{ color: "var(--muted)", fontSize: 14, padding: "12px 0" }}>Sin contratos en esta categoría.</div>;
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {lista.map(c => {
          const cliente = clientes.find(cl => cl.id === c.cliente_id);
          const moto = motos.find(m => m.id === c.moto_id);
          const seleccionado = c.id === contratoSeleccionadoId;
          const paso = c.estadoCartera === "mora" ? calcProtocoloStep(c.diasSinPago) : null;

          const enProrrateoLista = estaEnProrrateo(c, c.sinPagosNunca ?? true);
          // Fuente única (ledger + convenio + deuda) — misma cifra que el detalle y Panel Hoy.
          const pendiente = calcularPendienteContrato(c);
          const faltaConvenio = !empalmePendiente(c) && c.es_migrado && c.deudaContrato > 0 && !c.convenioActivo;

          // Monto = héroe: color por estado (prorrateo=próximo pago en cyan, deuda en rojo, al día en verde)
          const montoColor = pendiente > 0 ? (enProrrateoLista ? "var(--accent)" : "var(--bad-ink)") : "var(--ok-ink)";
          // El retenido se ve distinto a simple vista: su riel es gris y lleva 🔒. No está en mora
          // ni al día — está fuera de la calle, y su badge de cartera no significa nada útil.
          const rielColor = c.suspendido ? "var(--muted3)"
            : c.estadoCartera === "mora" ? "var(--bad)" : c.estadoCartera === "gabela" ? "var(--warn2)" : "var(--ok2)";

          return (
            <ItemLista
              key={c.id}
              placa={moto?.placa}
              grupo={moto?.grupo}
              titulo={cliente?.nombre || "Sin cliente"}
              subtitulo={<>
                {c.suspendido && <span style={{ color: "var(--muted2)", fontWeight: 700 }}>🔒 Moto retenida · </span>}
                {c.forma_pago === "Diario" ? "Diario" : `Paga ${formatDiaPago(c)}`}
                {!c.suspendido && c.diasSinPago > 0 && c.diasSinPago < 999 && c.estadoCartera !== "al-dia" && (
                  <span style={{ color: "var(--bad-ink)", fontWeight: 600 }}> · {c.diasSinPago}d sin pagar</span>
                )}
              </>}
              right={<>
                <div style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: montoColor, whiteSpace: "nowrap", lineHeight: 1.1 }}>
                  {pendiente > 0 ? `$${fmt(pendiente)}` : "✓ Al día"}
                </div>
                {c.suspendido
                  ? <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted2)", background: "var(--soft)", borderRadius: 999, padding: "2px 8px" }}>🔒 Retenida</span>
                  : <EstadoBadge estado={c.estadoCartera} />}
              </>}
              rielColor={rielColor}
              seleccionado={seleccionado}
              onClick={() => setContratoSeleccionadoId(c.id)}
              extra={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    {enProrrateoLista && pendiente > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-ink)" }}>Próximo pago</span>
                    )}
                    {paso && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: paso.color, background: paso.bg, borderRadius: 8, padding: "2px 8px" }}>
                        P{paso.paso}: {paso.label}
                      </span>
                    )}
                    {c.pendientesCount > 0 && (
                      <span style={{ fontSize: 11, color: "var(--warn-ink)" }}>{c.pendientesCount} pend.</span>
                    )}
                    {empalmePendiente(c) && <Badge tone="warn">⚠️ Empalme</Badge>}
                    {faltaConvenio && <Badge tone="accent">📝 Falta convenio</Badge>}
                  </div>
                  <Btn
                    variant="primary"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      setModalContratoId(c.id);
                      setModalBusqueda(etiquetaContrato(c));
                      setModalListaAbierta(false);
                      setModalPago(true);
                    }}
                    style={{ flexShrink: 0 }}
                  >
                    💰 Pagar
                  </Btn>
                </div>
              }
            />
          );
        })}
      </div>
    );
  }

  // ── KPI cards ─────────────────────────────────────────────────────────────
  // Cada KPI lleva a Contratos con el filtro puesto (o a Historial)
  function irAContratos(filtro: FiltroContratos) { setActiveTab("contratos"); setFiltroContratos(filtro); setContratoSeleccionadoId(null); }
  // El recaudo va TAPADO: el cliente ve la pantalla del funcionario y la plata del día no es
  // asunto suyo. Un toque lo muestra y a los 5 segundos se tapa solo (ver MontoOculto).
  const kpis: { label: string; value: React.ReactNode; sub?: React.ReactNode; color: string; bg: string; onClick: () => void }[] = [
    { label: "Pagan hoy", value: totalPaganHoy, color: "var(--accent)", bg: "var(--accent-soft2)", onClick: () => irAContratos("pagan-hoy") },
    {
      label: "Recaudado hoy",
      value: <MontoOculto valor={recaudadoHoyTotal} />,
      sub: <>Semana: <MontoOculto valor={recaudadoSemanaTotal} /></>,
      color: "var(--ok-ink)", bg: "var(--ok-soft)",
      onClick: () => { if (puedeHistorial) { setActiveTab("historial"); setContratoSeleccionadoId(null); } },
    },
    { label: "En gabela", value: enGabela.length, color: "var(--warn-ink)", bg: "var(--warn-soft)", onClick: () => irAContratos("gabela") },
    { label: "En mora", value: enMora.length, color: "var(--bad-ink)", bg: "var(--bad-soft)", onClick: () => irAContratos("mora") },
  ];

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "contratos", label: "🌎 Todos", count: resumenContratos.length },
    { key: "hoy", label: "📋 Para hacer hoy", count: totalTareasHoy },
    { key: "dinero", label: isMobile ? "⏳ Confirmar" : "⏳ Por confirmar", count: pagosPendientes.length },
    ...(puedeHistorial ? [{ key: "historial" as TabKey, label: "🧾 Historial" }] : []),
  ];

  const FILTROS_CONTRATOS: { key: FiltroContratos; label: string; count: number }[] = [
    { key: "todos", label: "Todos", count: resumenContratos.length },
    { key: "mora", label: "🔴 Mora", count: enMora.length },
    { key: "gabela", label: "🟡 Gabela", count: enGabela.length },
    { key: "al-dia", label: "🟢 Al día", count: alDia.length },
    { key: "pagan-hoy", label: "🔵 Pagan hoy", count: totalPaganHoy },
    { key: "convenio", label: "🤝 Convenio", count: conConvenio.length },
    { key: "retenidos", label: "🔒 Retenidos", count: retenidos.length },
  ];

  return (
    <div style={isMobile && contratoSeleccionadoId ? { padding: "0 0 80px" } : undefined}>
      {/* En móvil con un contrato abierto → solo el detalle. El FAB "+" y los modales
          (más abajo) quedan SIEMPRE montados para poder cobrar desde el detalle. */}
      {isMobile && contratoSeleccionadoId ? PanelDetalle() : (
      <>
      {/* Header — oculto en móvil (el header de la app ya dice "Cartera & Cobros") */}
      {!isMobile && (
        <>
          <h2 style={{ fontSize: 24, margin: 0, fontWeight: 700 }}>Cartera</h2>
          <p style={{ marginTop: 6, color: "var(--muted)", margin: "6px 0 0" }}>
            Control de cobros, deudas, convenios y gestiones de mora.
          </p>
        </>
      )}

      {errorPagos && (
        <div style={{ marginTop: 12, color: "var(--bad-ink)", background: "var(--bad-soft)", padding: "10px 14px", borderRadius: 12 }}>
          Error: {errorPagos}
        </div>
      )}

      {/* KPI cards — 2x2 grid compacto: etiqueta + número en la misma línea, riel de color */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: isMobile ? 2 : 16 }}>
        {kpis.map(k => (
          <button
            key={k.label}
            onClick={k.onClick}
            style={{
              background: "var(--card)",
              border: "none",
              borderLeft: `4px solid ${k.color}`,
              borderRadius: 12,
              padding: "7px 11px",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(15,23,42,0.06)",
              textAlign: "left",
            }}
          >
            {/* El grupo hace que el monto y su "Semana" se muestren y se tapen con UN solo toque,
                en vez de ser dos botones sueltos. En los KPI sin montos tapados no hace nada. */}
            <GrupoMontoOculto>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.label}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: k.color, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{k.value}</span>
              </div>
              {k.sub && (
                <div style={{ fontSize: 10, color: k.color, opacity: 0.8, marginTop: 1, textAlign: "right" }}>{k.sub}</div>
              )}
            </GrupoMontoOculto>
          </button>
        ))}
      </div>

      {/* Tab bar — mismo Chip que los filtros (todo del mismo tamaño) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: isMobile ? 6 : 20, paddingBottom: 2 }}>
        {tabs.map(t => (
          <Chip
            key={t.key}
            activo={activeTab === t.key}
            count={t.count}
            onClick={() => { setActiveTab(t.key); setContratoSeleccionadoId(null); }}
          >
            {t.label}
          </Chip>
        ))}
      </div>

      {/* Panel HOY — mismo diseño que Contratos */}
      {activeTab === "hoy" && (() => {
        type TareasDef = readonly { tipo: TipoGestion; label: string; action: (c: typeof resumenContratos[number]) => void; bg: string; color: string }[];
        const GRUPOS_HOY: { key: FiltroHoy; emoji: string; titulo: string; color: string; bg: string; lista: typeof resumenContratos; tareas: TareasDef }[] = [
          { key: "recoleccion", emoji: "🚚", titulo: "Recolección", color: "var(--bad-ink2)", bg: "var(--bad-soft)", lista: panelHoy.recoleccion,
            tareas: [
              { tipo: "mensaje_recordatorio" as TipoGestion, label: "Mensaje", action: tareaMensaje, bg: "var(--accent-soft3)", color: "var(--accent-ink)" },
              { tipo: "llamada" as TipoGestion, label: "Llamar", action: tareaLlamar, bg: "var(--accent-soft)", color: "var(--accent)" },
              { tipo: "sirena" as TipoGestion, label: "Sirena", action: tareaSirena, bg: "var(--warn-soft)", color: "var(--warn-ink)" },
              // Recolectar la moto = acción sensible (permiso por persona, default ADMIN+SUBADMIN)
              ...(puedeRecolectar ? [{ tipo: "recoleccion" as TipoGestion, label: "Recolección", action: tareaRecoleccion, bg: "var(--bad-soft)", color: "var(--bad-ink)" }] : []),
            ] },
          { key: "mora", emoji: "🔴", titulo: "Mora", color: "var(--bad-ink)", bg: "var(--bad-soft)", lista: panelHoy.mora,
            tareas: [
              { tipo: "mensaje_recordatorio" as TipoGestion, label: "Mensaje", action: tareaMensaje, bg: "var(--accent-soft3)", color: "var(--accent-ink)" },
              { tipo: "llamada" as TipoGestion, label: "Llamar", action: tareaLlamar, bg: "var(--accent-soft)", color: "var(--accent)" },
              { tipo: "sirena" as TipoGestion, label: "Sirena", action: tareaSirena, bg: "var(--warn-soft)", color: "var(--warn-ink)" },
            ] },
          { key: "gabela", emoji: "🟡", titulo: "Gabela", color: "var(--warn-ink)", bg: "var(--warn-soft)", lista: panelHoy.gabela,
            tareas: [
              { tipo: "mensaje_recordatorio" as TipoGestion, label: "Mensaje", action: tareaMensaje, bg: "var(--accent-soft3)", color: "var(--accent-ink)" },
              { tipo: "llamada" as TipoGestion, label: "Llamar", action: tareaLlamar, bg: "var(--accent-soft)", color: "var(--accent)" },
              { tipo: "sirena" as TipoGestion, label: "Sirena", action: tareaSirena, bg: "var(--warn-soft)", color: "var(--warn-ink)" },
            ] },
          { key: "pagan-hoy", emoji: "🔵", titulo: "Pagan hoy", color: "var(--accent)", bg: "var(--accent-soft2)", lista: panelHoy.paganHoy,
            tareas: [
              { tipo: "mensaje_recordatorio" as TipoGestion, label: "Mensaje", action: tareaMensaje, bg: "var(--accent-soft3)", color: "var(--accent-ink)" },
              { tipo: "llamada" as TipoGestion, label: "Llamar", action: tareaLlamar, bg: "var(--accent-soft)", color: "var(--accent)" },
            ] },
        ];

        // Lista activa según filtro + búsqueda
        const grupoActivo = filtroHoy === "todos"
          ? { tareas: GRUPOS_HOY[1].tareas as TareasDef, lista: [...panelHoy.recoleccion, ...panelHoy.mora, ...panelHoy.gabela, ...panelHoy.paganHoy], color: "var(--text)", bg: "var(--soft)" }
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

        // Visitas domiciliarias pendientes (prospectos "Listo para visita"). Para el SUBADMIN,
        // solo las asignadas a él. Antes solo se veían en Clientes → fácil de olvidar para el cobrador.
        const visitasPendientes = clientes.filter(c => c.estado === "Listo para visita" && (!esSubadmin || c.visita_asignada_a === profile?.id));

        return (
          <div style={{ marginTop: isMobile ? 8 : 20 }}>
            {/* Chips de filtro — igual que Contratos */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CHIPS_HOY.map(ch => (
                <Chip key={ch.key} activo={filtroHoy === ch.key} count={ch.count} onClick={() => setFiltroHoy(ch.key)}>
                  {ch.label}
                </Chip>
              ))}
            </div>

            {/* Resumen campo */}
            {puedeCobroCampo && misCobrosCampoHoy.count > 0 && (
              <div style={{ marginTop: 12, background: "var(--ok-soft)", border: "1px solid var(--ok-line)", borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ fontSize: 13, color: "var(--ok-ink)", fontWeight: 700 }}>💵 Recogiste hoy: ${fmt(misCobrosCampoHoy.total)} en {misCobrosCampoHoy.count} cobro(s)</div>
                {misCobrosCampoHoy.pendienteEntregar > 0 && (
                  <div style={{ fontSize: 12, color: "var(--warn-ink)", marginTop: 2 }}>Pendiente entregar a caja: <strong>${fmt(misCobrosCampoHoy.pendienteEntregar)}</strong></div>
                )}
              </div>
            )}

            {/* Visitas domiciliarias pendientes — antes solo se veían en Clientes */}
            {visitasPendientes.length > 0 && (
              <div onClick={() => onNavigate?.("clientes", "Listo para visita")}
                style={{ marginTop: 12, background: "var(--accent-soft)", border: "1px solid var(--accent-line)", borderRadius: 12, padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, color: "var(--accent-ink)", fontWeight: 700 }}>📋 Tienes {visitasPendientes.length} visita{visitasPendientes.length !== 1 ? "s" : ""} domiciliaria{visitasPendientes.length !== 1 ? "s" : ""} pendiente{visitasPendientes.length !== 1 ? "s" : ""}</div>
                <span style={{ fontSize: 12, color: "var(--accent-ink)", fontWeight: 700 }}>Ir a visitas →</span>
              </div>
            )}

            {/* Buscador — igual que Contratos */}
            <div style={{ marginTop: isMobile ? 8 : 12 }}>
              <input
                value={busquedaHoy}
                onChange={e => setBusquedaHoy(e.target.value)}
                placeholder="Buscar cliente o placa..."
                style={{ ...inputStyle, background: "var(--card)" }}
              />
            </div>

            {/* Lista en recuadro con scroll — igual que Contratos */}
            {totalTareasHoy === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--faint)" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
                <div style={{ fontWeight: 700, color: "var(--ok-ink)" }}>No tienes tareas pendientes hoy</div>
              </div>
            ) : (
              <div style={{ marginTop: 12, background: "var(--card)", borderRadius: 16, padding: 10, boxShadow: "0 4px 16px rgba(15,23,42,0.06)", maxHeight: isMobile ? "58vh" : "64vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                {listaOrdenada.length === 0 ? (
                  <div style={{ color: "var(--muted)", fontSize: 14, padding: "12px 0" }}>Sin resultados.</div>
                ) : listaOrdenada.map(c => {
                  const cliente = clientes.find(cl => cl.id === c.cliente_id);
                  const moto = motos.find(m => m.id === c.moto_id);
                  const grupoC = GRUPOS_HOY.find(g => g.lista.some(x => x.id === c.id));
                  const tareasDe = grupoC ? grupoC.tareas : [];
                  const todasHechas = tareasDe.length > 0 && tareasDe.every(t => gestionHechaHoy(c.id, t.tipo));
                  const borderColor = grupoC ? grupoC.color : "var(--line)";

                  // Monto que debe pagar — fuente ÚNICA. Antes esta tarjeta rearmaba la cuenta a
                  // mano y sumaba la cuota del acuerdo COMPLETA, por eso podía decir "$100.000" y
                  // "Al día" en el mismo renglón (caso LIBINTO).
                  const dd = desgloseDebe(c);
                  const debePagar = dd.totalFalta;

                  return (
                    <div
                      key={c.id}
                      style={{
                        padding: "9px 12px",
                        borderRadius: 14,
                        border: todasHechas ? "1px solid var(--line)" : `1px solid ${borderColor}44`,
                        borderLeft: `4px solid ${todasHechas ? "var(--line2)" : borderColor}`,
                        background: todasHechas ? "var(--soft2)" : "var(--card)",
                        opacity: todasHechas ? 0.6 : 1,
                        display: "flex", flexDirection: "column", gap: 7,
                        animation: "mgEntra .3s var(--ease) both",
                      }}
                    >
                      {/* Fila superior: nombre + badge — clic va al detalle */}
                      <div
                        onClick={() => setContratoSeleccionadoId(c.id)}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, cursor: "pointer" }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", color: "var(--text)" }}>
                            {cliente?.nombre ?? "Sin cliente"}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                            {moto && <><Placa placa={moto.placa} grupo={moto.grupo} size="sm" /><span> · </span></>}
                            {c.diasSinPago > 0 && c.diasSinPago < 999 && c.estadoCartera !== "al-dia"
                              ? <span style={{ color: "var(--bad-ink)", fontWeight: 700 }}>{c.diasSinPago}d sin pagar</span>
                              : <span>{c.forma_pago === "Diario" ? "Diario" : `Paga ${formatDiaPago(c)}`}</span>
                            }
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                          <EstadoBadge estado={c.estadoCartera} />
                          {empalmePendiente(c) && (
                            <span style={{ background: "var(--warn-soft)", color: "var(--warn-ink)", borderRadius: 999, padding: "3px 8px", fontSize: 10, fontWeight: 700 }}>⚠️ Empalme</span>
                          )}
                        </div>
                      </div>

                      {/* Fila inferior: monto + botones de tarea */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ minWidth: 0 }}>
                          {todasHechas ? (
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ok-ink)", background: "var(--ok-soft)", borderRadius: 8, padding: "2px 8px" }}>✓ Listo</span>
                          ) : debePagar > 0 ? (
                            <>
                              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "var(--muted)" }}>Debe pagar</div>
                              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4, fontVariantNumeric: "tabular-nums", color: "var(--bad)", lineHeight: 1.15 }}>$ {fmt(debePagar)}</div>
                              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                                cuota ${fmt(dd.cuota.falta)}{(dd.acuerdo?.falta ?? 0) > 0 ? ` + conv. $${fmt(dd.acuerdo!.falta)}` : ""}{dd.deudas.falta > 0 ? ` + deuda $${fmt(dd.deudas.falta)}` : ""}
                              </div>
                            </>
                          ) : (
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ok-ink)", background: "var(--ok-soft)", borderRadius: 8, padding: "2px 8px" }}>{c.convenioActivo ? "● Al día · convenio" : "● Al día"}</span>
                          )}
                        </div>
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
                                style={{ ...(hecha ? miniBtn("var(--ok-soft)", "var(--ok-ink)") : miniBtn(t.bg, t.color)), opacity: bloqueado ? 0.5 : 1 }}
                              >
                                {recolectando ? "Recolectando..." : bloqueadoProtocolo ? "🔒 Recolección" : hecha ? `✓ ${t.label}` : t.label}
                              </button>
                            );
                          })}
                          {puedeCobroCampo && (
                            <button onClick={() => abrirCobroCampo(c.id)} style={miniBtn("var(--ok-soft)", "var(--ok-ink)")}>💵 Cobrar</button>
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
            <div key={p.id} style={{ border: "1px solid var(--warn-line)", background: "var(--warn-soft2)", borderRadius: 14, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 15 }}>{cliente?.nombre || "Sin cliente"}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                    {moto && <Placa placa={moto.placa} grupo={moto.grupo} size="sm" />}
                    <span>{fmtFechaLarga(p.fecha)}{p.folio ? ` · ${p.folio}` : ""}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    <span style={{ padding: "3px 10px", borderRadius: 999, background: "var(--accent-soft3)", color: "var(--accent-ink)", fontSize: 11, fontWeight: 700 }}>
                      {esCampo ? "💵 Cobro en campo" : "🏦 Transferencia"}
                    </span>
                    <span style={{ padding: "3px 10px", borderRadius: 999, background: "var(--soft)", color: "var(--text)", fontSize: 11, fontWeight: 700 }}>
                      $ {fmt(p.valor)}
                    </span>
                    {/* La referencia es lo que se cruza contra el extracto: quien confirma
                        tiene que verla, y saber si otro pago ya la usó. */}
                    {p.referencia && (() => {
                      const dup = pagos.some(o => o.id !== p.id && o.estado !== "Rechazado" && o.referencia
                        && normalizarRef(o.referencia) === normalizarRef(p.referencia!));
                      return (
                        <span style={{
                          padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: dup ? "var(--bad-soft)" : "var(--soft)", color: dup ? "var(--bad-ink)" : "var(--text)",
                        }}>
                          {dup ? "⚠️ Ref. YA USADA: " : "Ref. "}{p.referencia}
                        </span>
                      );
                    })()}
                    {esCampo && (
                      <span style={{ padding: "3px 10px", borderRadius: 999, background: p.entregado_caja ? "var(--ok-soft)" : "var(--warn-soft)", color: p.entregado_caja ? "var(--ok-ink)" : "var(--warn-ink)", fontSize: 11, fontWeight: 700 }}>
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
                    style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 10, cursor: "pointer", border: "1px solid var(--line)" }}
                  />
                )}
              </div>

              {/* Acciones */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                {esCampo && !p.entregado_caja && puedeCobroCampo && (
                  <button onClick={() => marcarEntregadoCaja(p.id)} style={miniBtn("var(--accent-soft3)", "var(--accent-ink)")}>📤 Entregué a secretaria</button>
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
                    style={miniBtn("var(--ok)", "var(--card)")}
                  >
                    ✓ Confirmar recibido
                  </button>
                )}
                {puedeConfirmarPago && (
                  <button onClick={() => rechazarPago(p.id)} style={miniBtn("var(--bad-soft)", "var(--bad-ink)")}>✕ Rechazar</button>
                )}
              </div>
            </div>
          );
        }

        return (
          <div style={{ marginTop: 12, display: "flex", flexDirection: isMobile ? "column" : "row", gap: 16, alignItems: "flex-start" }}>
            {/* Transferencias — según el permiso "confirmar transferencia" (rol = techo),
                no por rol quemado: así el override por persona también aplica aquí. */}
            {puedeConfirmarPago && (
              <div style={{ ...card, flex: 1, minWidth: 0, width: isMobile ? "100%" : undefined }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>🏦 Transferencias por confirmar</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>Comprobantes de transferencia esperando verificación.</div>
                <input
                  style={{ ...inputStyle, marginBottom: 10, fontSize: 13 }}
                  placeholder="Buscar cliente o placa..."
                  value={busquedaTransferencias}
                  onChange={e => setBusquedaTransferencias(e.target.value)}
                />
                {transferencias.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 16px", color: "var(--faint)" }}>
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
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>💵 Efectivo de campo por confirmar</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>Cobros recuperados en campo por ADMIN/SUBADMIN, esperando entrega y confirmación.</div>
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
                  <Chip key={f.key} activo={filtroCampoConfirmar === f.key} onClick={() => setFiltroCampoConfirmar(f.key)}>
                    {f.label}
                  </Chip>
                ))}
              </div>
              {efectivoCampo.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 16px", color: "var(--faint)" }}>
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
          <ImgPrivada src={fotoAmpliada} style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12 }} />
        </div>
      )}

      {/* Historial tab — full width */}
      {activeTab === "historial" && puedeHistorial && (
        <div style={{ ...card, marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Historial general de pagos</h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(["todos", "Pendiente", "Confirmado", "Rechazado"] as const).map(f => (
                <Chip key={f} activo={filtroPagos === f} onClick={() => setFiltroPagos(f)}>
                  {f === "todos" ? "Todos" : f}
                </Chip>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <input
              value={busquedaHistorial}
              onChange={e => setBusquedaHistorial(e.target.value)}
              placeholder="Buscar cliente, cédula o placa..."
              style={{ ...inputStyle, background: "var(--card)" }}
            />
          </div>
          <div style={{ display: "grid", gap: 10, maxHeight: isMobile ? "58vh" : "64vh", overflowY: "auto", paddingRight: 2 }}>
            {pagosFiltrados.length === 0 && <div style={{ color: "var(--muted)", fontSize: 14 }}>Sin pagos registrados.</div>}
            {pagosFiltrados.map(p => {
              const contrato = contratos.find(c => c.id === p.contrato_id);
              const cliente = contrato ? clientes.find(cl => cl.id === contrato.cliente_id) : null;
              const moto = contrato ? motos.find(m => m.id === contrato.moto_id) : null;
              return (
                <div key={p.id} style={{ padding: "12px 14px", borderRadius: 14, background: p.estado === "Pendiente" ? "var(--warn-soft2)" : "var(--soft2)", border: p.estado === "Pendiente" ? "1px solid var(--warn-line)" : "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexWrap: "wrap" }}>
                      {moto && <Placa placa={moto.placa} grupo={moto.grupo} size="sm" />}
                      <span style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>{cliente?.nombre || "Sin cliente"}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                      {fmtFechaLarga(p.fecha)} · {p.metodo} · $ {fmt(p.valor)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 2 }}>
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
                        <button onClick={() => confirmarPago(p.id)} style={miniBtn("var(--ok-soft)", "var(--ok-ink)")}>Confirmar</button>
                        <button onClick={() => rechazarPago(p.id)} style={miniBtn("var(--bad-soft)", "var(--bad-ink)")}>Rechazar</button>
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
                        style={miniBtn("var(--ok-soft)", "var(--ok-ink)")}
                      >
                        🧾 Recibo
                      </button>
                    )}
                    {puedeEliminarPago && (
                      <button
                        onClick={() => handleEliminarPago(p)}
                        disabled={eliminandoPagoId === p.id}
                        style={{ ...miniBtn("var(--bad-soft)", "var(--bad-ink)"), opacity: eliminandoPagoId === p.id ? 0.6 : 1 }}
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
          <div style={{ background: "var(--card)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 460, maxHeight: "calc(100dvh - 120px)", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text)" }}>💵 Cobro en campo</h3>
              <button onClick={cerrarModalCampo} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--faint)" }}>✕</button>
            </div>

            <div style={{ ...card, marginBottom: 14, background: "var(--warn-soft2)", border: "1px solid var(--warn-line)", padding: "10px 14px" }}>
              <div style={{ fontSize: 13, color: "var(--warn-ink)", fontWeight: 600 }}>
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
                <div style={{ marginBottom: 10, fontSize: 13, color: "var(--muted)" }}>Selecciona el contrato. Los de <strong>mora/gabela</strong> aparecen primero.</div>
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
                    if (lista.length === 0) return <div style={{ color: "var(--muted)", fontSize: 14, textAlign: "center", padding: "16px 0" }}>No tienes contratos asignados disponibles para cobrar.</div>;
                    return lista.map(r => {
                      const cliente = clientes.find(cl => cl.id === r.cliente_id);
                      const moto = motos.find(m => m.id === r.moto_id);
                      return (
                        <div
                          key={r.id}
                          onClick={() => abrirCobroCampo(r.id)}
                          style={{ padding: "10px 12px", borderRadius: 12, cursor: "pointer", border: "1px solid var(--line)", background: "var(--soft2)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>{cliente?.nombre || "Sin cliente"}</div>
                            {moto && <div style={{ marginTop: 3 }}><Placa placa={moto.placa} grupo={moto.grupo} size="sm" /></div>}
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
                  const debeTotal = r ? desgloseDebe(r).totalFalta : 0;
                  return (
                    <div style={{ display: "grid", gap: 12 }}>
                      <div style={{ padding: "10px 14px", background: "var(--soft2)", borderRadius: 12, border: "1px solid var(--line)" }}>
                        <div style={{ fontWeight: 700, textTransform: "uppercase" }}>{cliente?.nombre || "Sin cliente"}</div>
                        {moto && <div style={{ marginTop: 3 }}><Placa placa={moto.placa} grupo={moto.grupo} size="sm" /></div>}
                      </div>

                      {/* Referencia: cuánto debe pagar */}
                      <div style={{ background: "var(--accent-soft2)", border: "1px solid var(--accent-line)", borderRadius: 10, padding: "10px 14px" }}>
                        <div style={{ fontSize: 11, color: "var(--accent-ink)", textTransform: "uppercase", fontWeight: 700 }}>Debe pagar (referencia)</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>$ {fmt(debeTotal)}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                          Cuota período: ${fmt(cuotaPend)}{(r?.deudaContrato ?? 0) > 0 ? ` · Deuda: $${fmt(r!.deudaContrato)}` : ""}{r && (desgloseDebe(r).acuerdo?.falta ?? 0) > 0 ? ` · Convenio: $${fmt(desgloseDebe(r).acuerdo!.falta)}` : ""}
                        </div>
                      </div>

                      <MoneyInput label="Monto recuperado" value={campoMonto} onChange={setCampoMonto} />

                      {/* GPS */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, color: "var(--muted2)", fontWeight: 600 }}>📍 Ubicación:</span>
                        {campoGpsEstado === "capturando" && <span style={{ fontSize: 13, color: "var(--warn-ink)" }}>Capturando…</span>}
                        {campoGpsEstado === "ok" && campoUbicacion && <span style={{ fontSize: 13, color: "var(--ok-ink)", fontWeight: 700 }}>✓ Capturada</span>}
                        {campoGpsEstado === "error" && <span style={{ fontSize: 13, color: "var(--bad-ink)" }}>No disponible</span>}
                        {campoGpsEstado === "idle" && <span style={{ fontSize: 13, color: "var(--muted)" }}>Sin capturar</span>}
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
                          {campoFoto && <span style={{ fontSize: 12, color: "var(--ok-ink)", fontWeight: 700, alignSelf: "center" }}>✓ {campoFoto.name.slice(0, 20)}</span>}
                        </div>
                      </div>

                      <div>
                        <div style={labelStyle}>Nota (opcional)</div>
                        <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={campoNota} onChange={e => setCampoNota(e.target.value)} placeholder="Observaciones del cobro en campo..." />
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>Cobrado por: <strong>{profile?.nombre ?? "—"}</strong></div>
                      <div style={{ background: "var(--warn-soft2)", border: "1px solid var(--warn-line)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "var(--warn-ink)" }}>
                        Al registrar: se manda <strong>recibo provisional</strong> al cliente por WhatsApp y queda <strong>pendiente</strong> hasta que entregues el efectivo a la secretaria y ella lo confirme en Caja.
                      </div>
                      {campoError && <div style={{ color: "var(--bad-ink)", fontSize: 13, fontWeight: 600 }}>{campoError}</div>}
                      {campoExito && (
                        <div style={{ color: "var(--ok-ink)", background: "var(--ok-soft)", padding: "8px 12px", borderRadius: 10, fontWeight: 700, fontSize: 13 }}>
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
        <div style={{ marginTop: isMobile ? 6 : 18, display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 8 : 20, alignItems: isMobile ? "stretch" : "start" }}>
          {/* Lista */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Chips de filtro */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: isMobile ? 5 : 12, paddingBottom: 0 }}>
              {FILTROS_CONTRATOS.map(f => (
                <Chip key={f.key} activo={filtroContratos === f.key} count={f.count} onClick={() => { setFiltroContratos(f.key); setContratoSeleccionadoId(null); }}>
                  {f.label}
                </Chip>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: isMobile ? 6 : 12 }}>
              {(["todos", "COSTA", "PRADERA", "RASTREADOR", "USADAS"] as ("todos" | GrupoMoto)[]).map(g => (
                <Chip key={g} activo={filtroGrupoContratos === g} onClick={() => setFiltroGrupoContratos(g)}>
                  {g === "todos" ? "Todos" : g}
                </Chip>
              ))}
            </div>
            <div style={{ ...card, padding: isMobile ? 10 : 16 }}>
              <input
                style={{ ...inputStyle, marginBottom: isMobile ? 8 : 12 }}
                placeholder="Buscar cliente o placa..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              {/* Lista dentro de recuadro con scroll propio */}
              <div style={{ maxHeight: isMobile ? "58vh" : "64vh", overflowY: "auto", paddingRight: 2 }}>
                {listaFiltrada.length === 0
                  ? <div style={{ textAlign: "center", padding: "28px 12px", color: "var(--faint)", fontSize: 14 }}>No hay contratos en este filtro.</div>
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
      </>
      )}

      {/* Botón flotante "+" — acciones rápidas según rol */}
      {(puedePagoNormal || puedeCobroCampo) && (
        <div style={{ position: "fixed", right: 20, bottom: isMobile ? 88 : 28, zIndex: 50, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          {fabOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {puedePagoNormal && (
                <button
                  onClick={() => { setFabOpen(false); setModalContratoId(contratoSeleccionadoId); setModalBusqueda(""); setModalListaAbierta(false); setModalPago(true); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--card)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 999, padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 6px 20px rgba(15,23,42,0.16)" }}
                >
                  💰 Pago en oficina
                </button>
              )}
              {puedeCobroCampo && (
                <button
                  onClick={() => { setFabOpen(false); if (contratoSeleccionadoId) abrirCobroCampo(contratoSeleccionadoId); else abrirModalCampoBusqueda(); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--card)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 999, padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 6px 20px rgba(15,23,42,0.16)" }}
                >
                  💵 Cobro en campo
                </button>
              )}
            </div>
          )}
          <button
            onClick={() => {
              // Mismo comportamiento en lista y en detalle: si en el detalle hay un contrato
              // abierto (contratoSeleccionadoId), las acciones lo cobran YA cargado; si no, buscan.
              // Si puede ambas (oficina/campo) → menú para elegir. Si solo una → esa directa.
              const soloPago = puedePagoNormal && !puedeCobroCampo;
              const soloCampo = puedeCobroCampo && !puedePagoNormal;
              if (soloPago) { setModalContratoId(contratoSeleccionadoId); setModalBusqueda(""); setModalListaAbierta(false); setModalPago(true); return; }
              if (soloCampo) { if (contratoSeleccionadoId) abrirCobroCampo(contratoSeleccionadoId); else abrirModalCampoBusqueda(); return; }
              setFabOpen(v => !v);
            }}
            aria-label="Acciones rápidas"
            style={{ width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(90deg, var(--accent) 0%, var(--ok2) 100%)", color: "var(--card)", border: "none", fontSize: 30, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(2,132,199,0.4)", display: "flex", alignItems: "center", justifyContent: "center", transform: fabOpen ? "rotate(45deg)" : "none", transition: "transform 0.15s" }}
          >
            +
          </button>
        </div>
      )}

      {/* Modal de registro rápido de pago */}
      {ampliandoConvenio && (
        <ModalAmpliarConvenio
          convenio={ampliandoConvenio}
          clienteNombre={clientes.find(cl => cl.id === contratos.find(c => c.id === ampliandoConvenio.contrato_id)?.cliente_id)?.nombre ?? ""}
          onClose={() => setAmpliandoConvenio(null)}
          onDone={(msg) => alert(msg)}
        />
      )}

      {modalPago && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 60 }}
          onClick={cerrarModalPago}
        >
          <div style={{ background: "var(--card)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 460, maxHeight: "calc(100dvh - 160px)", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Registrar pago</h3>
              <button onClick={cerrarModalPago} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--faint)" }}>✕</button>
            </div>

            {/* Buscador-selector unificado (combobox) */}
            <div style={{ marginBottom: 14, position: "relative" }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", display: "block", marginBottom: 6 }}>Cliente / contrato</label>
              <div style={{ position: "relative" }}>
                <input
                  style={{ ...inputStyle, paddingRight: modalContratoId ? 34 : 12 }}
                  placeholder="Buscar y seleccionar cliente o placa..."
                  value={modalBusqueda}
                  autoFocus
                  onFocus={() => setModalListaAbierta(true)}
                  onChange={e => { setModalBusqueda(e.target.value); setModalListaAbierta(true); setModalContratoId(null); setModalError(null); setModalExito(false); limpiarDatosTransferencia(); }}
                />
                {modalContratoId && (
                  <button
                    onClick={() => { setModalContratoId(null); setModalBusqueda(""); setModalListaAbierta(true); limpiarDatosTransferencia(); }}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--faint)" }}
                    title="Limpiar selección"
                  >✕</button>
                )}
              </div>

              {/* Lista de resultados */}
              {modalListaAbierta && !modalContratoId && (
                <div style={{ position: "absolute", left: 0, right: 0, top: "100%", marginTop: 4, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "0 12px 32px rgba(15,23,42,0.16)", maxHeight: 240, overflowY: "auto", zIndex: 10 }}>
                  {modalResultados.length === 0 ? (
                    <div style={{ padding: "12px 14px", fontSize: 13, color: "var(--faint)" }}>Sin coincidencias.</div>
                  ) : (
                    modalResultados.slice(0, 30).map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setModalContratoId(c.id); setModalBusqueda(etiquetaContrato(c)); setModalListaAbierta(false); setModalError(null); setModalExito(false); limpiarDatosTransferencia(); }}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left", padding: "10px 14px", border: "none", borderBottom: "1px solid var(--soft)", background: "var(--card)", cursor: "pointer", fontSize: 13, color: "var(--text)" }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--soft2)"}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--card)"}
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
              <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", textTransform: "uppercase" }}>
                    {modalCliente?.nombre || "Sin cliente"}
                  </div>
                  <EstadoBadge estado={modalContrato.estadoCartera as EstadoCartera} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                  {modalMoto && <Placa placa={modalMoto.placa} grupo={modalMoto.grupo} size="sm" />}
                  <span>
                    {modalContrato.forma_pago === "Diario" ? "Contrato diario" : "Pago semanal"}
                    {modalContrato.diasSinPago < 999 ? ` · ${modalContrato.diasSinPago} días sin pago` : ""}
                  </span>
                </div>

                {/* Cuotas */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <div style={{ flex: 1, background: "var(--soft2)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Cuota período</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>$ {fmt(modalCuotaPactada)}</div>
                  </div>
                  <div style={{ flex: 1, background: "var(--soft2)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Pagado</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ok-ink)" }}>$ {fmt(modalPagadoPeriodo)}</div>
                  </div>
                  <div style={{ flex: 1, background: modalCuotaPendiente > 0 ? "var(--bad-soft)" : "var(--soft2)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Pendiente</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: modalCuotaPendiente > 0 ? "var(--bad-ink)" : "var(--text)" }}>$ {fmt(modalCuotaPendiente)}</div>
                  </div>
                </div>

                {/* Deuda / convenio */}
                {(modalContrato.deudaContrato > 0 || modalContrato.cuotaConvenio > 0) && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, fontSize: 12 }}>
                    {modalContrato.deudaContrato > 0 && (
                      <div style={{ flex: 1, background: "var(--orange-soft)", borderRadius: 8, padding: "6px 10px", color: "var(--orange)", fontWeight: 700 }}>Deuda: $ {fmt(modalContrato.deudaContrato)}</div>
                    )}
                    {modalContrato.cuotaConvenio > 0 && (() => {
                      // Este chip dice cuánto VALE su cuota (por eso "/período"), no cuánto debe.
                      // Si ya la pagó esta semana se marca, o el funcionario lo lee como deuda viva.
                      const faltaConv = desgloseDebe(modalContrato).acuerdo?.falta ?? 0;
                      return (
                        <div style={{ flex: 1, background: "var(--accent-soft2)", borderRadius: 8, padding: "6px 10px", color: "var(--accent-ink)", fontWeight: 700 }}>
                          Convenio: $ {fmt(modalContrato.cuotaConvenio)}/período{faltaConv === 0 ? " · ya pagada" : ""}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Historial */}
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", marginBottom: 6 }}>Últimos pagos</div>
                {modalPagos.length === 0 ? (
                  <div style={{ fontSize: 12, color: "var(--faint)" }}>Sin pagos registrados.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 130, overflowY: "auto" }}>
                    {modalPagos.map(p => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--soft2)", borderRadius: 8, padding: "6px 10px" }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>$ {fmt(p.valor)}</span>
                          <span style={{ fontSize: 11, color: "var(--muted)" }}> · {formatDate(p.fecha)} · {p.metodo}</span>
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
              {/* Cambiar el valor invalida el visto bueno del descuadre: se dio para OTRO monto. */}
              <MoneyInput label="Valor recibido" value={modalValor} onChange={v => { setModalValor(v); setModalDescuadreOk(false); }} />
            </div>

            {/* Desglose de aplicación */}
            {modalContrato && modalMonto > 0 && (
              <div style={{ background: "var(--accent-soft4)", borderRadius: 10, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: "var(--accent-ink)" }}>
                Se aplicará:
                {modalDesglose.tarifa > 0 && <> tarifa $ {fmt(modalDesglose.tarifa)}</>}
                {modalDesglose.deuda > 0 && <> · deuda $ {fmt(modalDesglose.deuda)}</>}
                {modalDesglose.convenio > 0 && <> · convenio $ {fmt(modalDesglose.convenio)}</>}
                {modalDesglose.ahorro > 0 && <> · ahorro $ {fmt(modalDesglose.ahorro)}</>}
                {modalDesglose.saldo > 0 && <> · saldo a favor $ {fmt(modalDesglose.saldo)}</>}
              </div>
            )}

            {/* Método — el efectivo solo para quien tiene el permiso registrar_efectivo
                (el botón "Pagar" de cada tarjeta abre este modal para CUALQUIER rol,
                porque reportar transferencias sí es de todos; el efectivo no). */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", display: "block", marginBottom: 6 }}>Método de pago</label>
              <select
                style={inputStyle}
                value={modalMetodo}
                onChange={e => {
                  const m = e.target.value as MetodoPago;
                  if (m === "Efectivo" && !puedePagoNormal) return;
                  setModalMetodo(m);
                  // Volver a hoy al pasar a Efectivo: si no, una fecha vieja elegida para una
                  // transferencia quedaría pegada en un pago en efectivo (el campo ya no se ve).
                  if (m === "Efectivo") { setModalFechaPago(hoyISO()); setModalFechaDelBanco(null); }
                }}
              >
                <option value="Efectivo" disabled={!puedePagoNormal}>Efectivo (confirma automático)</option>
                <option value="Transferencia">Transferencia (queda pendiente)</option>
              </select>
              {!puedePagoNormal && (
                <div style={{ fontSize: 11, color: "var(--warn-ink)", marginTop: 5 }}>Solo la secretaria registra efectivo</div>
              )}
            </div>

            {/* Fecha real del pago — SOLO en transferencia. El efectivo se recibe en la mano
                aquí y ahora: registrarlo con otra fecha no tiene sentido y abriría un hueco
                de control (nadie puede "recordar" que le entregaron billetes hace 5 días). */}
            {/* N° de referencia — obligatorio: es la prueba de que el dinero entró. Al
                escribirlo se cruza contra las transferencias que nadie reclamó. */}
            {modalMetodo === "Transferencia" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", display: "block", marginBottom: 6 }}>
                  N° de referencia de la transferencia *
                </label>
                <input
                  style={inputStyle}
                  value={modalReferencia}
                  onChange={e => {
                    const v = e.target.value;
                    setModalReferencia(v);
                    setModalRefRepetidaOk(false); setModalDescuadreOk(false);
                    // Si esa referencia está en la bolsa de dinero sin dueño Y la plata alcanza, se
                    // adopta su fecha del banco: pasa de ser la fecha que trae el comprobante del
                    // cliente a estar verificada contra el extracto de nuestra propia cuenta.
                    const cruce = buscarPorReferencia(v);
                    if (cruce && Math.round(modalMonto) <= Math.round(cruce.monto)) {
                      setModalFechaPago(cruce.fecha_banco);
                      setModalFechaDelBanco(cruce.fecha_banco);
                    } else if (modalFechaDelBanco) {
                      // El cruce dejó de aplicar: esa fecha ya no está respaldada por el banco.
                      // Solo se revierte lo que puso el cruce, nunca una fecha escrita a mano.
                      setModalFechaPago(hoyISO());
                      setModalFechaDelBanco(null);
                    }
                  }}
                  placeholder="El número que aparece en el comprobante"
                />
                {(() => {
                  const repetida = pagoConMismaReferencia(modalReferencia);
                  const cliRep = repetida
                    ? clientes.find(cl => cl.id === contratos.find(c => c.id === repetida.contrato_id)?.cliente_id)
                    : null;
                  return (
                    <>
                      {modalCruce && modalCruceCalza && (
                        <div style={{ marginTop: 6, fontSize: 12, color: "var(--ok-ink)", background: "var(--ok-soft)", borderRadius: 8, padding: "7px 10px" }}>
                          ✅ <strong>Esta transferencia sí entró</strong> el {formatDate(modalCruce.fecha_banco)} por $ {fmt(modalCruce.monto)}.
                          Estaba sin identificar y se le asignará a este cliente.
                        </div>
                      )}
                      {modalCruce && !modalCruceCalza && (
                        <div style={{ marginTop: 6, fontSize: 12, color: "var(--bad-ink)", background: "var(--bad-soft)", borderRadius: 8, padding: "7px 10px" }}>
                          ⛔ <strong>El valor no cuadra.</strong> El banco recibió <strong>$ {fmt(modalCruce.monto)}</strong> con esa
                          referencia y estás registrando <strong>$ {fmt(modalMonto)}</strong>. Una referencia va casada a un solo valor:
                          si fueron dos transferencias, cada una tiene su propia referencia y se registran por separado.
                          <label style={{ display: "flex", gap: 6, alignItems: "flex-start", marginTop: 6, cursor: "pointer", fontWeight: 600 }}>
                            <input type="checkbox" checked={modalDescuadreOk} onChange={e => setModalDescuadreOk(e.target.checked)} />
                            <span>Revisé la foto del comprobante y el extracto: este valor sí corresponde a esta referencia.</span>
                          </label>
                          {modalDescuadreOk && Math.round(modalMonto) < Math.round(modalCruce.monto) && (
                            <div style={{ marginTop: 6 }}>
                              Quedarán <strong>$ {fmt(modalCruce.monto - modalMonto)}</strong> sin identificar: ese resto sigue en la
                              bolsa hasta que aparezca su dueño.
                            </div>
                          )}
                        </div>
                      )}
                      {/* Que no esté en la bolsa es lo NORMAL (la mayoría de clientes reportan
                          su pago el mismo día). El aviso informa, no alarma.
                          OJO CON LA REDACCIÓN: antes empezaba con "Esta referencia NO está en el
                          dinero sin identificar" y el operador de afán leía "no está" = "no se
                          puede" y no registraba el pago. Pasó de verdad (ref. M18871421, 28-jul).
                          Ahora arranca diciendo que SÍ puede continuar. */}
                      {!modalCruce && normalizarRef(modalReferencia).length >= 3 && (
                        <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)", background: "var(--soft)", borderRadius: 8, padding: "7px 10px" }}>
                          ✓ Puedes registrar el pago normal. Esta referencia todavía no aparece en el dinero sin
                          identificar, que es lo normal cuando el cliente reporta su pago el mismo día —
                          la secretaria la verificará contra el extracto al confirmar.
                        </div>
                      )}
                      {repetida && (
                        <div style={{ marginTop: 6, fontSize: 12, color: "var(--bad-ink)", background: "var(--bad-soft)", borderRadius: 8, padding: "7px 10px" }}>
                          ⛔ <strong>Esa referencia ya se usó</strong> en un pago de $ {fmt(repetida.valor)} del {formatDate(repetida.fecha)}
                          {cliRep ? <> ({cliRep.nombre.toUpperCase()})</> : null}. La misma transferencia no puede respaldar dos cobros.
                          <label style={{ display: "flex", gap: 6, alignItems: "flex-start", marginTop: 6, cursor: "pointer", fontWeight: 600 }}>
                            <input type="checkbox" checked={modalRefRepetidaOk} onChange={e => setModalRefRepetidaOk(e.target.checked)} />
                            <span>Verifiqué en el extracto: esa transferencia sí cubre a los dos clientes.</span>
                          </label>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Esta casilla decide a QUÉ CAJA entra la plata: desde el 4-ago `fechaDeCaja()`
                manda la transferencia a la caja de esta fecha, no a la del día en que se digita.
                Antes decía "¿Cuándo hizo la transferencia?" y avisaba "la plata entra a la caja
                de hoy" — cierto con la regla vieja, falso desde ese cambio. Un funcionario dejó
                la fecha en hoy (como siempre) y $262.000 que el banco recibió el 4 quedaron en la
                caja del 5. Redactada igual que CobroDiarioView, que ya preguntaba por el banco. */}
            {modalMetodo === "Transferencia" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", display: "block", marginBottom: 6 }}>
                  ¿Qué día entró la plata al banco? *
                </label>
                <input
                  type="date"
                  style={{ ...inputStyle, opacity: modalCruceCubre ? 0.6 : 1 }}
                  value={modalFechaEfectiva}
                  disabled={modalCruceCubre}
                  max={hoyISO()}
                  min={hoyMasDias(-60)}
                  onChange={e => { setModalFechaPago(e.target.value); setModalFechaDelBanco(null); }}
                />
                {modalCruceCubre ? (
                  <div style={{ marginTop: 6, fontSize: 12, color: "var(--ok-ink)", background: "var(--ok-soft)", borderRadius: 8, padding: "7px 10px" }}>
                    Fecha tomada del extracto del banco ({formatDate(modalFechaEfectiva)}): está comprobada, por eso no se puede cambiar.
                    La plata entra a la caja del <strong>{formatDate(modalFechaEfectiva)}</strong>, que es el día en que el banco la recibió.
                  </div>
                ) : modalFechaPago === hoyISO() ? (
                  <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)", background: "var(--soft)", borderRadius: 8, padding: "7px 10px" }}>
                    Es la fecha que aparece en el comprobante. <strong>Si el banco la recibió otro día, cámbiala:</strong> esta
                    plata entra a la caja de ese día, no a la de hoy.
                  </div>
                ) : (
                  <div style={{ marginTop: 6, fontSize: 12, color: "var(--warn-ink)", background: "var(--warn-soft)", borderRadius: 8, padding: "7px 10px" }}>
                    Esta plata entra a la caja del <strong>{formatDate(modalFechaPago)}</strong> —el día en que el banco la
                    recibió—, no a la de hoy. El cliente tampoco aparece en mora por esos días y el recibo muestra la fecha correcta.
                  </div>
                )}
              </div>
            )}

            {/* ¿A cuál cuenta de la empresa cayó? Solo pregunta cuando de verdad hay más de una
                posible; con una sola la elige y se queda callado. Ver SelectorCuentaBanco. */}
            {modalMetodo === "Transferencia" && (
              <div style={{ marginBottom: 14 }}>
                <SelectorCuentaBanco grupo={modalMoto?.grupo ?? null} value={modalCuentaId} onChange={setModalCuentaId} />
              </div>
            )}

            {/* Foto del comprobante — obligatoria en transferencia */}
            {modalMetodo === "Transferencia" && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", display: "block", marginBottom: 6 }}>Foto del comprobante *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "var(--accent)", color: "var(--card)", fontWeight: 700, fontSize: 13 }}>
                    📷 Cámara
                    <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => setModalComprobante(e.target.files?.[0] ?? null)} />
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 13 }}>
                    🖼 Galería
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setModalComprobante(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
                {modalComprobante && <div style={{ fontSize: 12, color: "var(--ok-ink)", marginTop: 4 }}>✓ {modalComprobante.name}</div>}
                <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 4 }}>La transferencia quedará pendiente hasta que la secretaria confirme que entró a la cuenta.</div>
              </div>
            )}

            {modalError && <div style={{ color: "var(--bad-ink)", fontSize: 13, marginBottom: 12 }}>{modalError}</div>}
            {modalExito && (
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--warn-ink)" }}>⏳ Transferencia registrada</div>
                <div style={{ fontSize: 12, color: "var(--warn-ink)", marginTop: 4 }}>El recibo se generará cuando la secretaria confirme que el dinero entró a la cuenta.</div>
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
