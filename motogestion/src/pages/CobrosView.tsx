import React, { useMemo, useState } from "react";
import {
  usePagos,
  calcularAplicacion,
  calcularCuotaDia,
  type MetodoPago,
  type PagoEstado,
  type AplicadoPago,
  type TipoRegistroPago,
} from "../hooks/usePagos";
import { useContratos, calcularEquivalenciasDiarias } from "../hooks/useContratos";
import { useClientes, type Cliente } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { useDeudas, type ConceptoDeuda } from "../hooks/useDeudas";
import { useConvenios } from "../hooks/useConvenios";
import { useGestiones, type TipoGestion } from "../hooks/useGestiones";
import { useAuth } from "../contexts/AuthContext";
import ModalGestion from "../components/ModalGestion";

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

function EstadoBadge({ estado }: { estado: EstadoCartera }) {
  const map: Record<EstadoCartera, { bg: string; color: string; label: string }> = {
    "al-dia": { bg: "#dcfce7", color: "#166534", label: "Al dia" },
    gabela: { bg: "#fef3c7", color: "#92400e", label: "Gabela" },
    mora: { bg: "#fee2e2", color: "#991b1b", label: "Mora" },
  };
  const s = map[estado];
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
const DIAS: Record<string, number> = {
  Lunes: 1,
  Martes: 2,
  Miercoles: 3,
  Miércoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sabado: 6,
  Sábado: 6,
  Domingo: 0,
};

/**
 * Returns the ISO day number (0=Sun, 1=Mon ... 6=Sat) for today.
 * Derives cartera status based on dia_pago of the contract.
 */
function calcularEstadoCartera(
  diaPago: string,
  totalPagadoEstaSemana: number,
  valorSemanal: number,
): EstadoCartera {
  const hoyJS = new Date().getDay(); // 0=Sun..6=Sat
  const diaPagoNum = DIAS[diaPago] ?? 1;

  // Did client complete payment for this period?
  if (totalPagadoEstaSemana >= valorSemanal) return "al-dia";

  // How many days since the payment day?
  let diasDesde = (hoyJS - diaPagoNum + 7) % 7;
  // If 0 it's the actual payment day → al-dia if paid, otherwise start checking
  if (diasDesde === 0) {
    // They haven't paid yet today but it's the payment day → show as "pay today" (al-dia display)
    return "al-dia";
  }
  if (diasDesde === 1) return "gabela";
  return "mora";
}

// ─── WhatsApp helpers ─────────────────────────────────────────────────────────
const TIPO_ICON_GESTION: Record<string, string> = {
  mensaje_recordatorio: "📩", llamada: "📞", whatsapp: "💬", sirena: "🔊",
  visita: "🏠", plazo_extra: "⏳", cobro_campo: "🛵", recoleccion: "🔒", otro: "💬",
};

function abrirWhatsApp(telefono: string, mensaje: string) {
  const num = telefono.replace(/\D/g, "");
  const full = num.startsWith("57") ? num : `57${num}`;
  window.open(`https://wa.me/${full}?text=${encodeURIComponent(mensaje)}`, "_blank");
}

function BotonesWhatsApp({ cliente, contrato, estadoCartera }: {
  cliente: Cliente;
  contrato: { dia_pago: string; valor_semanal: number; forma_pago?: string; diasSinPago?: number };
  estadoCartera: string;
}) {
  const tel = cliente.whatsapp || cliente.telefono || "";
  if (!tel) return null;

  const nombre = cliente.nombre.split(" ")[0];
  const valor = `$ ${Math.round(contrato.valor_semanal).toLocaleString("es-CO")}`;
  const dia = contrato.dia_pago;

  const mensajes = {
    recordatorio: `Hola ${nombre}, le recordamos que su pago de ${valor} vence el día de hoy (${dia}). Por favor acérquese o realice su transferencia. Gracias 🙏`,
    gabela: `Hola ${nombre}, su pago de ${valor} ya venció. Hoy es su día de gabela, por favor realice el pago lo antes posible para evitar inconvenientes con su moto. GPS Satelital 🏍️`,
    mora: `Hola ${nombre}, su moto lleva ${contrato.diasSinPago ?? "varios"} días sin pago. Es necesario que se comunique con nosotros urgentemente o realice el pago de ${valor} de inmediato. GPS Satelital ⚠️`,
  };

  const btns: { label: string; msg: string; color: string; bg: string }[] = [];
  if (estadoCartera === "al-dia") btns.push({ label: "Recordatorio", msg: mensajes.recordatorio, color: "#166534", bg: "#dcfce7" });
  if (estadoCartera === "gabela") btns.push({ label: "Gabela", msg: mensajes.gabela, color: "#92400e", bg: "#fef3c7" });
  if (estadoCartera === "mora") btns.push({ label: "Mora", msg: mensajes.mora, color: "#991b1b", bg: "#fee2e2" });
  // Siempre mostrar recordatorio como opción adicional
  if (estadoCartera !== "al-dia") btns.push({ label: "Recordatorio", msg: mensajes.recordatorio, color: "#0369a1", bg: "#e0f2fe" });

  return (
    <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
      {btns.map(b => (
        <button key={b.label} onClick={() => abrirWhatsApp(tel, b.msg)}
          style={{ padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: b.bg, color: b.color, display: "flex", alignItems: "center", gap: 5 }}>
          💬 WA {b.label}
        </button>
      ))}
      <a href={`tel:${tel}`} style={{ padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#334155", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
        📞 Llamar
      </a>
    </div>
  );
}

// ─── Historial gestiones ──────────────────────────────────────────────────────
function HistorialGestiones({ gestiones, formatDate }: {
  gestiones: Array<{ id: string; tipo: string; resultado?: string | null; fecha: string; plazo_extra_motivo?: string | null; plazo_extra_fecha_limite?: string | null }>;
  formatDate: (d: string) => string;
}) {
  const [verTodo, setVerTodo] = useState(false);
  if (gestiones.length === 0) return null;
  const visibles = verTodo ? gestiones : gestiones.slice(0, 5);

  return (
    <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>Historial de gestiones ({gestiones.length})</div>
        {gestiones.length > 5 && (
          <button onClick={() => setVerTodo(v => !v)} style={{ background: "none", border: "none", fontSize: 12, color: "#0284c7", cursor: "pointer", fontWeight: 600 }}>
            {verTodo ? "Ver menos" : `Ver todas (${gestiones.length})`}
          </button>
        )}
      </div>
      {visibles.map(g => (
        <div key={g.id} style={{
          padding: "8px 12px", borderRadius: 10, fontSize: 13,
          background: g.tipo === "recoleccion" ? "#fee2e2" : g.tipo === "plazo_extra" ? "#fef3c7" : "#f8fafc",
          border: `1px solid ${g.tipo === "recoleccion" ? "#fecaca" : g.tipo === "plazo_extra" ? "#fde68a" : "#e2e8f0"}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700 }}>{TIPO_ICON_GESTION[g.tipo] ?? "💬"} {g.tipo.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{formatDate(g.fecha)}</span>
          </div>
          {g.resultado && <div style={{ color: "#64748b", marginTop: 2 }}>{g.resultado}</div>}
          {g.plazo_extra_motivo && (
            <div style={{ fontSize: 12, color: "#92400e", marginTop: 4 }}>
              Motivo: {g.plazo_extra_motivo} · Límite: {g.plazo_extra_fecha_limite ? formatDate(g.plazo_extra_fecha_limite) : "—"}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CobrosView() {
  const { profile } = useAuth();

  const { pagos, loading: loadingPagos, error: errorPagos, registrarPago, confirmarPago, rechazarPago, pagosDelContrato } =
    usePagos();
  const { contratos, loading: loadingContratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { deudas, registrarDeuda } = useDeudas();
  const { convenios, convenioActivoDelContrato, totalConveniosDelContrato, crearConvenio } = useConvenios();
  const { gestiones, registrarGestion } = useGestiones();

  // Panel state
  const [contratoSeleccionadoId, setContratoSeleccionadoId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  // Payment form state
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState<MetodoPago>("Efectivo");
  const [tipoRegistro, setTipoRegistro] = useState<TipoRegistroPago>("normal");
  const [comprobanteNombre, setComprobanteNombre] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formExito, setFormExito] = useState(false);

  // Gestion form state
  const [tipoGestion, setTipoGestion] = useState<TipoGestion>("llamada");
  const [resultadoGestion, setResultadoGestion] = useState("");
  const [plazoExtraDias, setPlazoExtraDias] = useState("");
  const [plazoExtraMotivo, setPlazoExtraMotivo] = useState("");
  const [plazoExtraFecha, setPlazoExtraFecha] = useState("");
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
  const [mostrarFormDeuda, setMostrarFormDeuda] = useState(false);

  // Historial filter
  const [filtroPagos, setFiltroPagos] = useState<"todos" | "Pendiente" | "Confirmado" | "Rechazado">("todos");

  const [modalGestionOpen, setModalGestionOpen] = useState(false);

  const contratosActivos = contratos.filter(c => c.estado === "Activo");

  // ── Resumen por contrato ──────────────────────────────────────────────────
  const resumenContratos = useMemo(() => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    // Set to Monday of current week
    const dayOfWeek = hoy.getDay(); // 0=Sun
    const daysFromMon = (dayOfWeek + 6) % 7;
    inicioSemana.setDate(hoy.getDate() - daysFromMon);
    inicioSemana.setHours(0, 0, 0, 0);

    return contratosActivos.map(contrato => {
      const todosPagos = pagos.filter(p => p.contrato_id === contrato.id);
      const confirmados = todosPagos.filter(p => p.estado === "Confirmado");
      const pendientes = todosPagos.filter(p => p.estado === "Pendiente");

      const pagadoEstaSemana = confirmados
        .filter(p => new Date(p.fecha + "T00:00:00") >= inicioSemana)
        .reduce((acc, p) => acc + p.valor, 0);

      const recaudadoHoy = confirmados
        .filter(p => p.fecha === hoy.toISOString().slice(0, 10))
        .reduce((acc, p) => acc + p.valor, 0);

      const estadoCartera = calcularEstadoCartera(contrato.dia_pago, pagadoEstaSemana, contrato.valor_semanal);

      const deudaContrato = deudas
        .filter(d => d.contrato_id === contrato.id && d.estado !== "pagada")
        .reduce((acc, d) => acc + d.monto_pendiente, 0);

      const convenioActivo = convenioActivoDelContrato(contrato.id);
      const cuotaConvenio = convenioActivo?.cuota_por_periodo ?? 0;

      return {
        ...contrato,
        pagadoEstaSemana,
        recaudadoHoy,
        estadoCartera,
        deudaContrato,
        convenioActivo,
        cuotaConvenio,
        pendientesCount: pendientes.length,
      };
    });
  }, [contratosActivos, pagos, deudas, convenios]);

  const enMora = resumenContratos.filter(r => r.estadoCartera === "mora");
  const enGabela = resumenContratos.filter(r => r.estadoCartera === "gabela");
  const alDia = resumenContratos.filter(r => r.estadoCartera === "al-dia");
  const recaudadoHoyTotal = resumenContratos.reduce((acc, r) => acc + r.recaudadoHoy, 0);
  const pagaronHoy = resumenContratos.filter(r => r.recaudadoHoy > 0).length;

  // ── Filtrar lista ─────────────────────────────────────────────────────────
  const listaFiltrada = useMemo(() => {
    const q = busqueda.toLowerCase();
    // Show mora + gabela + al-dia, sorted by status priority
    const ordenado = [
      ...enMora,
      ...enGabela,
      ...alDia,
    ];
    if (!q) return ordenado;
    return ordenado.filter(c => {
      const cliente = clientes.find(cl => cl.id === c.cliente_id);
      const moto = motos.find(m => m.id === c.moto_id);
      return (
        (cliente?.nombre ?? "").toLowerCase().includes(q) ||
        (moto?.placa ?? "").toLowerCase().includes(q)
      );
    });
  }, [enMora, enGabela, alDia, busqueda, clientes, motos]);

  // ── Contrato seleccionado ─────────────────────────────────────────────────
  const contratoDetalle = contratoSeleccionadoId
    ? resumenContratos.find(c => c.id === contratoSeleccionadoId) ?? null
    : null;

  const clienteDetalle = contratoDetalle ? clientes.find(cl => cl.id === contratoDetalle.cliente_id) : null;
  const motoDetalle = contratoDetalle ? motos.find(m => m.id === contratoDetalle.moto_id) : null;

  const pagosContrato = contratoSeleccionadoId
    ? pagosDelContrato(contratoSeleccionadoId).slice(0, 10)
    : [];

  const deudasContrato = contratoSeleccionadoId
    ? deudas.filter(d => d.contrato_id === contratoSeleccionadoId && d.estado !== "pagada")
    : [];

  const totalConvenios = contratoSeleccionadoId ? totalConveniosDelContrato(contratoSeleccionadoId) : 0;
  const esAdmin = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";
  const esSecretaria = profile?.role === "SECRETARIA";
  const puedeRegistrarEfectivo = esSecretaria || profile?.role === "ADMIN_PRINCIPAL";
  const convenioActual = contratoSeleccionadoId ? convenioActivoDelContrato(contratoSeleccionadoId) : null;



  // ── Desglose en tiempo real ───────────────────────────────────────────────
  const montoIngresado = Number(valor) || 0;
  const esDomingo = new Date().getDay() === 0;

  // Cuota pactada: para contratos diarios usa tarifa del día, para periódicos usa valor_semanal
  const cuotaPactada = contratoDetalle
    ? (contratoDetalle.forma_pago === "Diario"
        ? calcularCuotaDia(contratoDetalle.tarifa_diaria ?? 27000, esDomingo)
        : contratoDetalle.valor_semanal)
    : 27000;

  // Cuánto falta pagar de la cuota del período actual
  const cuotaPendiente = Math.max(cuotaPactada - (contratoDetalle?.pagadoEstaSemana ?? 0), 0);

  const desglose: AplicadoPago = contratoDetalle
    ? calcularAplicacion(
        montoIngresado,
        cuotaPendiente,
        contratoDetalle.deudaContrato,
        contratoDetalle.cuotaConvenio,
      )
    : { tarifa: 0, deuda: 0, convenio: 0, ahorro: 0, saldo: 0 };

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleRegistrarPago() {
    if (!contratoSeleccionadoId) { setFormError("Selecciona un contrato."); return; }
    if (!valor || montoIngresado <= 0) { setFormError("Ingresa un valor válido."); return; }
    if (metodo === "Efectivo" && !puedeRegistrarEfectivo) {
      setFormError("Solo la secretaria puede registrar pagos en efectivo.");
      return;
    }
    setFormError(null);
    setFormExito(false);

    const { error } = await registrarPago(
      contratoSeleccionadoId,
      montoIngresado,
      metodo,
      desglose,
      {
        convenioId: contratoDetalle?.convenioActivo?.id,
        tipoRegistro,
        registradoPor: profile?.id,
        comprobanteUrl: comprobanteNombre ?? undefined,
      },
    );
    if (error) { setFormError(error); return; }
    setValor("");
    setComprobanteNombre(null);
    setFormExito(true);
    setTimeout(() => setFormExito(false), 3000);
  }

  async function handleRegistrarDeuda() {
    if (!contratoSeleccionadoId || !profile) return;
    if (!deudaMonto || Number(deudaMonto) <= 0) { setDeudaError("Ingresa un monto válido."); return; }
    if (!deudaDescripcion.trim()) { setDeudaError("Ingresa una descripción."); return; }
    setDeudaError(null);
    const { error } = await registrarDeuda(contratoSeleccionadoId, deudaConcepto, deudaDescripcion, Number(deudaMonto), profile.id);
    if (error) { setDeudaError(error); return; }
    setDeudaMonto(""); setDeudaDescripcion("");
    setDeudaExito(true); setMostrarFormDeuda(false);
    setTimeout(() => setDeudaExito(false), 3000);
  }

  async function handleCrearConvenio() {
    if (!contratoSeleccionadoId || !profile) return;
    if (!convDeudaTotal || !convCuota || !convCuotas || !convFechaLimite || !convConcepto.trim()) {
      setConvError("Completa todos los campos."); return;
    }
    setConvError(null);
    const { error } = await crearConvenio(
      contratoSeleccionadoId, Number(convDeudaTotal), Number(convCuota),
      Number(convCuotas), convFechaLimite, convConcepto, profile.id
    );
    if (error) { setConvError(error); return; }
    setConvDeudaTotal(""); setConvCuota(""); setConvCuotas(""); setConvFechaLimite(""); setConvConcepto("");
    setConvExito(true); setMostrarFormConvenio(false);
    setTimeout(() => setConvExito(false), 3000);
  }

  async function handleRegistrarGestion() {
    if (!contratoSeleccionadoId || !profile) return;
    if (tipoGestion === "plazo_extra") {
      if (!plazoExtraDias || Number(plazoExtraDias) < 1 || Number(plazoExtraDias) > 2) {
        setGestionError("El plazo extra es máximo 2 días. Ingresa 1 o 2.");
        return;
      }
      if (!plazoExtraMotivo.trim()) {
        setGestionError("Debes escribir el motivo del plazo extra.");
        return;
      }
      if (!plazoExtraFecha) {
        setGestionError("Define la fecha límite del plazo extra.");
        return;
      }
    }
    setGestionError(null);
    const { error } = await registrarGestion(
      contratoSeleccionadoId,
      tipoGestion,
      resultadoGestion,
      profile.id,
      tipoGestion === "plazo_extra"
        ? { plazo_extra_dias: Number(plazoExtraDias), plazo_extra_motivo: plazoExtraMotivo.trim(), plazo_extra_fecha_limite: plazoExtraFecha }
        : undefined,
    );
    if (error) { setGestionError(error); return; }
    setResultadoGestion("");
    setPlazoExtraDias(""); setPlazoExtraMotivo(""); setPlazoExtraFecha("");
    setGestionExito(true);
    setTimeout(() => setGestionExito(false), 3000);
  }

  // ── Historial filtrado ────────────────────────────────────────────────────
  const pagosFiltrados = useMemo(() => {
    const base = filtroPagos === "todos" ? pagos : pagos.filter(p => p.estado === filtroPagos);
    // Pendientes first
    return [...base].sort((a, b) => {
      if (a.estado === "Pendiente" && b.estado !== "Pendiente") return -1;
      if (b.estado === "Pendiente" && a.estado !== "Pendiente") return 1;
      return 0;
    });
  }, [pagos, filtroPagos]);

  if (loadingPagos || loadingContratos) {
    return <div style={{ padding: 24, color: "#64748b" }}>Cargando cartera...</div>;
  }

  return (
    <div>
      {/* ── Header ── */}
      <h2 style={{ fontSize: 24, margin: 0, fontWeight: 800 }}>Cartera</h2>
      <p style={{ marginTop: 6, color: "#64748b", margin: "6px 0 0" }}>
        Control de cobros, deudas, convenios y gestiones de mora.
      </p>

      {errorPagos && (
        <div style={{ marginTop: 12, color: "#991b1b", background: "#fee2e2", padding: "10px 14px", borderRadius: 12 }}>
          Error: {errorPagos}
        </div>
      )}

      {/* ── Resumen del dia ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginTop: 20,
        }}
      >
        <div style={card}>
          <div style={{ fontSize: 13, color: "#64748b" }}>Recaudado hoy</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#166534" }}>$ {fmt(recaudadoHoyTotal)}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 13, color: "#64748b" }}>Pagaron hoy</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{pagaronHoy}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 13, color: "#64748b" }}>En gabela</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#92400e" }}>{enGabela.length}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 13, color: "#64748b" }}>En mora</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#991b1b" }}>{enMora.length}</div>
        </div>
      </div>

      {/* ── Layout principal ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 20, alignItems: "flex-start" }}>
        {/* ── Lista de cobros ── */}
        <div style={{ ...card, flex: "0 0 300px", maxHeight: "80vh", overflowY: "auto" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 18 }}>Cobros del dia</h3>
          <input
            style={{ ...inputStyle, marginBottom: 12 }}
            placeholder="Buscar placa o cliente..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <div style={{ display: "grid", gap: 8 }}>
            {listaFiltrada.length === 0 && (
              <div style={{ color: "#64748b", fontSize: 14 }}>No hay contratos activos.</div>
            )}
            {listaFiltrada.map(c => {
              const cliente = clientes.find(cl => cl.id === c.cliente_id);
              const moto = motos.find(m => m.id === c.moto_id);
              const seleccionado = c.id === contratoSeleccionadoId;
              return (
                <div
                  key={c.id}
                  onClick={() => setContratoSeleccionadoId(c.id)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: seleccionado ? "2px solid #0284c7" : "1px solid #e2e8f0",
                    background: seleccionado ? "#eff6ff" : "#f8fafc",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>
                      {moto ? `${moto.placa} · ` : ""}
                      {cliente?.nombre || "Sin cliente"}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      Paga {c.dia_pago} · $ {fmt(c.valor_semanal)}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <EstadoBadge estado={c.estadoCartera} />
                    {c.pendientesCount > 0 && (
                      <span style={{ fontSize: 11, color: "#92400e" }}>{c.pendientesCount} pend.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Panel de detalle ── */}
        <div style={{ display: "grid", gap: 16, flex: "1 1 320px", minWidth: 0 }}>
          {!contratoDetalle ? (
            <div style={{ ...card, color: "#64748b", textAlign: "center", padding: 40 }}>
              Selecciona un contrato de la lista para ver el detalle y registrar pagos.
            </div>
          ) : (
            <>
              {/* Info cliente */}
              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, textTransform: "uppercase" }}>
                      {motoDetalle ? `${motoDetalle.placa} · ` : ""}
                      {clienteDetalle?.nombre || "Sin cliente"}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                      Contrato {contratoDetalle.forma_pago ?? "Semanal"} · Paga {contratoDetalle.dia_pago}
                    </div>
                  </div>
                  <EstadoBadge estado={contratoDetalle.estadoCartera} />
                </div>

                {/* Botones WhatsApp rápidos */}
                {clienteDetalle && (clienteDetalle.whatsapp || clienteDetalle.telefono) && (
                  <BotonesWhatsApp
                    cliente={clienteDetalle}
                    contrato={contratoDetalle}
                    estadoCartera={contratoDetalle.estadoCartera}
                  />
                )}

                {/* Botón registrar gestión */}
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() => setModalGestionOpen(true)}
                    style={{
                      background: "#f1f5f9", color: "#334155", border: "none",
                      borderRadius: 14, padding: "8px 16px", fontWeight: 600,
                      fontSize: 13, cursor: "pointer",
                    }}
                  >
                    📋 Registrar gestión
                  </button>
                </div>

                {/* Alerta base completada */}
                {(contratoDetalle.tipo_ruta === "diario" || contratoDetalle.forma_pago === "Diario") &&
                  !contratoDetalle.base_completada &&
                  (contratoDetalle.ahorro_acumulado ?? 0) >= 510000 && (
                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 12, background: "#dcfce7", border: "1px solid #86efac", fontSize: 13, fontWeight: 700, color: "#166534" }}>
                    ✅ Base completada — $ {Math.round(contratoDetalle.ahorro_acumulado ?? 0).toLocaleString("es-CO")} ahorrados. Gestionar cambio de contrato.
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                  <InfoBox
                    label={`Cuota pactada (${contratoDetalle.forma_pago ?? "Semanal"}${esDomingo ? " · Domingo" : ""})`}
                    value={`$ ${fmt(cuotaPactada)}`}
                  />
                  <InfoBox
                    label="Pagado este período"
                    value={`$ ${fmt(contratoDetalle.pagadoEstaSemana)}`}
                    highlight={contratoDetalle.pagadoEstaSemana >= cuotaPactada}
                  />
                  <InfoBox
                    label="Pendiente cuota"
                    value={cuotaPendiente > 0 ? `$ ${fmt(cuotaPendiente)}` : "✓ Al día"}
                    highlight={cuotaPendiente === 0}
                  />
                  <InfoBox
                    label="Deuda adicional"
                    value={contratoDetalle.deudaContrato > 0 ? `$ ${fmt(contratoDetalle.deudaContrato)}` : "Sin deudas"}
                    highlight={contratoDetalle.deudaContrato > 0}
                  />
                  {contratoDetalle.convenioActivo && (
                    <InfoBox
                      label={`Cuota convenio #${contratoDetalle.convenioActivo.numero_convenio}`}
                      value={`$ ${fmt(contratoDetalle.convenioActivo.cuota_por_periodo)}`}
                      highlight
                    />
                  )}
                </div>

                {contratoDetalle.convenioActivo && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "8px 12px",
                      background: "#fffbeb",
                      borderRadius: 10,
                      border: "1px solid #fde68a",
                      fontSize: 13,
                      color: "#92400e",
                    }}
                  >
                    Convenio #{contratoDetalle.convenioActivo.numero_convenio}: {contratoDetalle.convenioActivo.cuotas_pagadas}/{contratoDetalle.convenioActivo.numero_cuotas} cuotas · Limite {formatDate(contratoDetalle.convenioActivo.fecha_limite)}
                  </div>
                )}

                {/* Equivalencias diarias — solo para contratos con período definido */}
                {contratoDetalle.forma_pago !== "Diario" && (() => {
                  const eq = calcularEquivalenciasDiarias(contratoDetalle);
                  return (
                    <div style={{ marginTop: 10, padding: "10px 14px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}>
                      <div style={{ fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                        Equivalencia diaria ({eq.diasPeriodo} días por período)
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>Cuota/día</div>
                          <div style={{ fontWeight: 700 }}>$ {fmt(eq.cuotaDiaria)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>Tarifa/día</div>
                          <div style={{ fontWeight: 700 }}>$ {fmt(eq.tarifaDiaria)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>Ahorro/día</div>
                          <div style={{ fontWeight: 700, color: "#0284c7" }}>$ {fmt(eq.ahorroDiario)}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>
                        En liquidación: solo se cobra tarifa/día (sin ahorro)
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Formulario de pago */}
              <div style={card}>
                <h3 style={{ margin: "0 0 14px", fontSize: 17 }}>Registrar pago</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <div style={labelStyle}>Valor recibido</div>
                    <input
                      type="number"
                      style={inputStyle}
                      value={valor}
                      onChange={e => { setValor(e.target.value); setFormExito(false); }}
                      placeholder="Ej. 27000"
                    />
                  </div>
                  <div>
                    <div style={labelStyle}>Tipo de registro</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {puedeRegistrarEfectivo && (
                        <button
                          type="button"
                          onClick={() => { setTipoRegistro("normal"); setMetodo("Efectivo"); }}
                          style={{
                            flex: "1 1 120px", padding: "10px 12px", borderRadius: 14, cursor: "pointer", border: "none",
                            background: tipoRegistro === "normal" ? "#dcfce7" : "#f1f5f9",
                            fontWeight: tipoRegistro === "normal" ? 800 : 500,
                            color: tipoRegistro === "normal" ? "#166534" : "#334155",
                          }}
                        >💵 Efectivo</button>
                      )}
                      <button
                        type="button"
                        onClick={() => { setTipoRegistro("transferencia"); setMetodo("Transferencia"); }}
                        style={{
                          flex: "1 1 120px", padding: "10px 12px", borderRadius: 14, cursor: "pointer", border: "none",
                          background: tipoRegistro === "transferencia" ? "#dbeafe" : "#f1f5f9",
                          fontWeight: tipoRegistro === "transferencia" ? 800 : 500,
                          color: tipoRegistro === "transferencia" ? "#1e40af" : "#334155",
                        }}
                      >📲 Transferencia</button>
                      {esAdmin && (
                        <button
                          type="button"
                          onClick={() => { setTipoRegistro("campo"); setMetodo("Efectivo"); }}
                          style={{
                            flex: "1 1 120px", padding: "10px 12px", borderRadius: 14, cursor: "pointer", border: "none",
                            background: tipoRegistro === "campo" ? "#fef3c7" : "#f1f5f9",
                            fontWeight: tipoRegistro === "campo" ? 800 : 500,
                            color: tipoRegistro === "campo" ? "#92400e" : "#334155",
                          }}
                        >🛵 Cobro en campo</button>
                      )}
                    </div>
                    {tipoRegistro === "normal" && <div style={{ fontSize: 12, color: "#166534", marginTop: 6 }}>Efectivo recibido en oficina — se confirma automáticamente.</div>}
                    {tipoRegistro === "transferencia" && <div style={{ fontSize: 12, color: "#1e40af", marginTop: 6 }}>Queda pendiente hasta que la secretaria confirme que entró el dinero.</div>}
                    {tipoRegistro === "campo" && <div style={{ fontSize: 12, color: "#92400e", marginTop: 6 }}>Efectivo recuperado en calle por admin — la secretaria debe confirmar.</div>}
                  </div>
                  {tipoRegistro === "transferencia" && (
                    <div>
                      <div style={labelStyle}>Foto del comprobante</div>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={e => setComprobanteNombre(e.target.files?.[0]?.name ?? null)}
                      />
                      {comprobanteNombre && <div style={{ fontSize: 12, color: "#166534", marginTop: 4 }}>✔ {comprobanteNombre}</div>}
                    </div>
                  )}

                  {/* Desglose en tiempo real */}
                  {montoIngresado > 0 && (
                    <div
                      style={{
                        background: "#f0fdf4",
                        borderRadius: 12,
                        padding: 12,
                        border: "1px solid #bbf7d0",
                        display: "grid",
                        gap: 6,
                        fontSize: 13,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: "#166534", marginBottom: 4 }}>
                        Como se aplicara el pago:
                      </div>
                      {desglose.tarifa > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Cuota pactada</span>
                          <span style={{ fontWeight: 700 }}>$ {fmt(desglose.tarifa)}</span>
                        </div>
                      )}
                      {desglose.deuda > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Abono a deuda</span>
                          <span style={{ fontWeight: 700 }}>$ {fmt(desglose.deuda)}</span>
                        </div>
                      )}
                      {desglose.convenio > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Cuota convenio</span>
                          <span style={{ fontWeight: 700 }}>$ {fmt(desglose.convenio)}</span>
                        </div>
                      )}
                      {desglose.saldo > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#0284c7", fontWeight: 700 }}>
                          <span>Saldo a favor (queda guardado)</span>
                          <span>$ {fmt(desglose.saldo)}</span>
                        </div>
                      )}
                      <div style={{ borderTop: "1px solid #bbf7d0", marginTop: 4, paddingTop: 6, display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
                        <span>Total recibido</span>
                        <span>$ {fmt(montoIngresado)}</span>
                      </div>
                    </div>
                  )}

                  {formError && (
                    <div style={{ color: "#991b1b", fontWeight: 600, fontSize: 13 }}>{formError}</div>
                  )}
                  {formExito && (
                    <div
                      style={{
                        color: "#166534",
                        background: "#dcfce7",
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      Pago registrado correctamente.
                    </div>
                  )}
                  <button onClick={handleRegistrarPago} style={primaryBtn}>
                    Registrar pago
                  </button>
                </div>
              </div>

              {/* Historial del contrato */}
              <div style={card}>
                <h3 style={{ margin: "0 0 12px", fontSize: 17 }}>Ultimos pagos del contrato</h3>
                {pagosContrato.length === 0 ? (
                  <div style={{ color: "#64748b", fontSize: 14 }}>Sin pagos registrados.</div>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {pagosContrato.map(p => (
                      <div
                        key={p.id}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 12,
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>$ {fmt(p.valor)}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {formatDate(p.fecha)} · {p.metodo}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <PagoBadge estado={p.estado} />
                          {p.estado === "Pendiente" && (
                            <>
                              <button
                                onClick={() => confirmarPago(p.id)}
                                style={miniBtn("#dcfce7", "#166534")}
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => rechazarPago(p.id)}
                                style={miniBtn("#fee2e2", "#991b1b")}
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Panel Deudas ── */}
              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 17 }}>
                    Deudas {deudasContrato.length > 0 && (
                      <span style={{ fontSize: 13, background: "#fee2e2", color: "#991b1b", borderRadius: 999, padding: "2px 8px", marginLeft: 8 }}>
                        $ {fmt(deudasContrato.reduce((a, d) => a + d.monto_pendiente, 0))}
                      </span>
                    )}
                  </h3>
                  {esAdmin && (
                    <button onClick={() => setMostrarFormDeuda(v => !v)} style={miniBtn("#f1f5f9", "#334155")}>
                      {mostrarFormDeuda ? "Cancelar" : "+ Registrar deuda"}
                    </button>
                  )}
                </div>

                {deudaExito && (
                  <div style={{ color: "#166534", background: "#dcfce7", padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                    Deuda registrada correctamente.
                  </div>
                )}

                {mostrarFormDeuda && esAdmin && (
                  <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14, marginBottom: 12, display: "grid", gap: 10 }}>
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
                    <div>
                      <div style={labelStyle}>Monto ($)</div>
                      <input type="number" style={inputStyle} value={deudaMonto} onChange={e => setDeudaMonto(e.target.value)} placeholder="Ej. 150000" />
                    </div>
                    {deudaError && <div style={{ color: "#991b1b", fontSize: 13, fontWeight: 600 }}>{deudaError}</div>}
                    <button onClick={handleRegistrarDeuda} style={primaryBtn}>Registrar deuda</button>
                  </div>
                )}

                {deudasContrato.length === 0 ? (
                  <div style={{ color: "#64748b", fontSize: 14 }}>Sin deudas pendientes.</div>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {deudasContrato.map(d => (
                      <div key={d.id} style={{ padding: "10px 12px", borderRadius: 12, background: "#fff7f7", border: "1px solid #fecaca", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{d.concepto.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{d.descripcion}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                            Estado: {d.estado}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 800, fontSize: 15, color: "#991b1b" }}>$ {fmt(d.monto_pendiente)}</div>
                          {d.monto !== d.monto_pendiente && (
                            <div style={{ fontSize: 11, color: "#64748b" }}>de $ {fmt(d.monto)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Panel Convenios ── */}
              {esAdmin && (
                <div style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 17 }}>
                      Convenio de pago
                      <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>({totalConvenios}/3 usados)</span>
                    </h3>
                    {!convenioActual && totalConvenios < 3 && deudasContrato.length > 0 && (
                      <button onClick={() => setMostrarFormConvenio(v => !v)} style={miniBtn("#eff6ff", "#1e40af")}>
                        {mostrarFormConvenio ? "Cancelar" : "+ Crear convenio"}
                      </button>
                    )}
                  </div>

                  {convExito && (
                    <div style={{ color: "#166534", background: "#dcfce7", padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                      Convenio creado correctamente.
                    </div>
                  )}

                  {convenioActual && (
                    <div style={{ background: "#fffbeb", borderRadius: 12, padding: 14, border: "1px solid #fde68a", marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#92400e" }}>
                        Convenio #{convenioActual.numero_convenio} — Activo
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{convenioActual.concepto}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                        <InfoBox label="Deuda total" value={`$ ${fmt(convenioActual.deuda_total)}`} />
                        <InfoBox label="Cuota por período" value={`$ ${fmt(convenioActual.cuota_por_periodo)}`} highlight />
                        <InfoBox label="Cuotas" value={`${convenioActual.cuotas_pagadas} / ${convenioActual.numero_cuotas}`} />
                        <InfoBox label="Fecha límite" value={formatDate(convenioActual.fecha_limite)} />
                      </div>
                    </div>
                  )}

                  {!convenioActual && totalConvenios >= 3 && (
                    <div style={{ color: "#991b1b", fontSize: 14, fontWeight: 600 }}>
                      Este contrato ya alcanzó el máximo de 3 convenios. Si vuelve a incumplir, procede la terminación del contrato.
                    </div>
                  )}

                  {!convenioActual && totalConvenios < 3 && deudasContrato.length === 0 && (
                    <div style={{ color: "#64748b", fontSize: 14 }}>No hay deudas pendientes para crear un convenio.</div>
                  )}

                  {mostrarFormConvenio && !convenioActual && esAdmin && (
                    <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14, display: "grid", gap: 10 }}>
                      <div style={{ fontSize: 13, color: "#64748b" }}>
                        Deuda pendiente total: <strong style={{ color: "#991b1b" }}>$ {fmt(deudasContrato.reduce((a, d) => a + d.monto_pendiente, 0))}</strong>
                      </div>
                      <div>
                        <div style={labelStyle}>Monto total a diferir ($)</div>
                        <input type="number" style={inputStyle} value={convDeudaTotal} onChange={e => setConvDeudaTotal(e.target.value)} placeholder="Ej. 300000" />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div>
                          <div style={labelStyle}>Cuota por período ($)</div>
                          <input type="number" style={inputStyle} value={convCuota} onChange={e => setConvCuota(e.target.value)} placeholder="Ej. 10000" />
                        </div>
                        <div>
                          <div style={labelStyle}>Número de cuotas</div>
                          <input type="number" style={inputStyle} value={convCuotas} onChange={e => setConvCuotas(e.target.value)} placeholder="Ej. 30" />
                        </div>
                      </div>
                      <div>
                        <div style={labelStyle}>Fecha límite</div>
                        <input type="date" style={inputStyle} value={convFechaLimite} onChange={e => setConvFechaLimite(e.target.value)} />
                      </div>
                      <div>
                        <div style={labelStyle}>Concepto / Motivo</div>
                        <input style={inputStyle} value={convConcepto} onChange={e => setConvConcepto(e.target.value)} placeholder="Descripción del convenio..." />
                      </div>
                      {convError && <div style={{ color: "#991b1b", fontSize: 13, fontWeight: 600 }}>{convError}</div>}
                      <button onClick={handleCrearConvenio} style={primaryBtn}>Crear convenio</button>
                    </div>
                  )}
                </div>
              )}

              {/* Gestiones de cobro — siempre visible si está seleccionado un contrato */}
              <div style={card}>
                <h3 style={{ margin: "0 0 12px", fontSize: 17 }}>Gestiones de cobro</h3>
                {contratoDetalle.estadoCartera === "al-dia" && (
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>Cliente al día — puedes registrar gestiones preventivas.</div>
                )}
                <div style={{ display: "grid", gap: 10 }}>
                  <div>
                    <div style={labelStyle}>Tipo de gestión</div>
                    <select
                      style={inputStyle}
                      value={tipoGestion}
                      onChange={e => { setTipoGestion(e.target.value as TipoGestion); setGestionError(null); }}
                    >
                      <option value="mensaje_recordatorio">📩 Mensaje recordatorio</option>
                      <option value="llamada">📞 Llamada</option>
                      <option value="whatsapp">💬 WhatsApp</option>
                      <option value="sirena">🔊 Sirena remota</option>
                      <option value="visita">🏠 Visita de cobro</option>
                      <option value="plazo_extra">⏳ Plazo extra (máx. 2 días)</option>
                      <option value="cobro_campo">🛵 Cobro en campo</option>
                      <option value="recoleccion">🔒 Orden de recolección</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  {tipoGestion === "plazo_extra" && (
                    <div style={{ background: "#fef3c7", borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>Plazo extra — máximo 2 días adicionales</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div>
                          <div style={labelStyle}>Días extra (1 o 2)</div>
                          <input type="number" min={1} max={2} style={inputStyle} value={plazoExtraDias} onChange={e => setPlazoExtraDias(e.target.value)} placeholder="1 o 2" />
                        </div>
                        <div>
                          <div style={labelStyle}>Fecha límite</div>
                          <input type="date" style={inputStyle} value={plazoExtraFecha} onChange={e => setPlazoExtraFecha(e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <div style={labelStyle}>Motivo del plazo (obligatorio)</div>
                        <input style={inputStyle} value={plazoExtraMotivo} onChange={e => setPlazoExtraMotivo(e.target.value)} placeholder="Razón por la que se otorga el plazo extra..." />
                      </div>
                    </div>
                  )}

                  <div>
                    <div style={labelStyle}>Resultado / Nota</div>
                    <input
                      style={inputStyle}
                      value={resultadoGestion}
                      onChange={e => setResultadoGestion(e.target.value)}
                      placeholder="Descripción breve del resultado o la acción tomada..."
                    />
                  </div>
                  {gestionError && (
                    <div style={{ color: "#991b1b", fontSize: 13, fontWeight: 600 }}>{gestionError}</div>
                  )}
                  {gestionExito && (
                    <div style={{ color: "#166534", background: "#dcfce7", padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                      Gestión registrada.
                    </div>
                  )}
                  <button onClick={handleRegistrarGestion} style={secondaryBtn}>
                    Registrar gestión
                  </button>

                  <HistorialGestiones gestiones={gestiones.filter(g => g.contrato_id === contratoSeleccionadoId)} formatDate={formatDate} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Modal gestión ── */}
      {modalGestionOpen && contratoDetalle && clienteDetalle && (
        <ModalGestion
          contratoId={contratoDetalle.id}
          clienteNombre={clienteDetalle.nombre}
          onClose={() => setModalGestionOpen(false)}
        />
      )}

      {/* ── Historial general de pagos ── */}
      <div style={{ ...card, marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Historial general de pagos</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["todos", "Pendiente", "Confirmado", "Rechazado"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltroPagos(f)}
                style={{
                  ...miniBtn(
                    filtroPagos === f ? "#0284c7" : "#f1f5f9",
                    filtroPagos === f ? "white" : "#334155",
                  ),
                  padding: "7px 14px",
                }}
              >
                {f === "todos" ? "Todos" : f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {pagosFiltrados.length === 0 && (
            <div style={{ color: "#64748b", fontSize: 14 }}>Sin pagos registrados.</div>
          )}
          {pagosFiltrados.map(p => {
            const contrato = contratos.find(c => c.id === p.contrato_id);
            const cliente = contrato ? clientes.find(cl => cl.id === contrato.cliente_id) : null;
            const moto = contrato ? motos.find(m => m.id === contrato.moto_id) : null;
            return (
              <div
                key={p.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: p.estado === "Pendiente" ? "#fffbeb" : "#f8fafc",
                  border: p.estado === "Pendiente" ? "1px solid #fde68a" : "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>
                    {moto ? `${moto.placa} · ` : ""}
                    {cliente?.nombre || "Sin cliente"}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                    {formatDate(p.fecha)} · {p.metodo}
                    {p.tipo_registro === "campo" && " · 🛵 Campo"}
                    {p.tipo_registro === "transferencia" && " · 📲 Transferencia"}
                    {" · "}$ {fmt(p.valor)}
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
                  {p.estado === "Pendiente" && (
                    <>
                      <button onClick={() => confirmarPago(p.id)} style={miniBtn("#dcfce7", "#166534")}>
                        Confirmar
                      </button>
                      <button onClick={() => rechazarPago(p.id)} style={miniBtn("#fee2e2", "#991b1b")}>
                        Rechazar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
