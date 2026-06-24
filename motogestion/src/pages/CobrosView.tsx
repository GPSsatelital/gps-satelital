import React, { useMemo, useState, useEffect } from "react";
import type { ViewKey } from "../App";
import {
  usePagos,
  calcularAplicacion,
  calcularCuotaDia,
  type MetodoPago,
  type PagoEstado,
  type AplicadoPago,
} from "../hooks/usePagos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { useDeudas, type ConceptoDeuda } from "../hooks/useDeudas";
import { useConvenios } from "../hooks/useConvenios";
import { useGestiones, type TipoGestion } from "../hooks/useGestiones";
import { useAuth } from "../contexts/AuthContext";

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
    "al-dia": { bg: "#dcfce7", color: "#166534", label: "Al día" },
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
  formaPago: string,
  diaPago: string,
  pagosConfirmados: Array<{ fecha: string }>,
): EstadoCuenta {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hoyISO = hoy.toISOString().slice(0, 10);

  const sorted = [...pagosConfirmados].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const ultimoPago = sorted[0]?.fecha ?? null;

  const esDiario = formaPago === "Diario";
  const diasPeriodo = formaPago === "Quincenal" ? 15 : formaPago === "Mensual" ? 30 : 7;

  if (esDiario) {
    if (!ultimoPago) {
      return { formaPago, diaPago: "Diario", ultimoPago: null, pagadoHasta: null, proximoPago: hoyISO, diasEstado: 999, etiqueta: "Mora", colorEtiqueta: "#991b1b", bgEtiqueta: "#fee2e2" };
    }
    const ultimo = new Date(ultimoPago + "T00:00:00");
    const diasDesde = Math.floor((hoy.getTime() - ultimo.getTime()) / 86400000);
    const pagadoHasta = ultimoPago;
    const manana = new Date(hoy); manana.setDate(manana.getDate() + 1);
    const proximoPago = manana.toISOString().slice(0, 10);
    if (diasDesde === 0) return { formaPago, diaPago: "Diario", ultimoPago, pagadoHasta, proximoPago, diasEstado: 0, etiqueta: "Al día", colorEtiqueta: "#166534", bgEtiqueta: "#dcfce7" };
    if (diasDesde === 1) return { formaPago, diaPago: "Diario", ultimoPago, pagadoHasta, proximoPago, diasEstado: 1, etiqueta: "Gabela", colorEtiqueta: "#92400e", bgEtiqueta: "#fef3c7" };
    return { formaPago, diaPago: "Diario", ultimoPago, pagadoHasta, proximoPago: hoyISO, diasEstado: diasDesde, etiqueta: "Mora", colorEtiqueta: "#991b1b", bgEtiqueta: "#fee2e2" };
  }

  const targetDay = DIAS[diaPago] ?? 1;
  const d = new Date(hoy);
  while (d.getDay() !== targetDay) d.setDate(d.getDate() - 1);
  const inicioPeriodo = d.toISOString().slice(0, 10);

  const prox = new Date(d);
  prox.setDate(prox.getDate() + diasPeriodo);
  const proximoPago = prox.toISOString().slice(0, 10);

  const pagoPeriodo = sorted.find(p => p.fecha >= inicioPeriodo);
  if (pagoPeriodo) {
    const pagadoHasta = new Date(d);
    pagadoHasta.setDate(pagadoHasta.getDate() + diasPeriodo - 1);
    return {
      formaPago, diaPago, ultimoPago: pagoPeriodo.fecha,
      pagadoHasta: pagadoHasta.toISOString().slice(0, 10),
      proximoPago, diasEstado: 0,
      etiqueta: "Al día", colorEtiqueta: "#166534", bgEtiqueta: "#dcfce7",
    };
  }

  const diasDesde = Math.floor((hoy.getTime() - d.getTime()) / 86400000);
  const etiqueta = diasDesde === 0 ? "Al día" : diasDesde === 1 ? "Gabela" : "Mora";
  const colorEtiqueta = diasDesde <= 1 ? "#92400e" : "#991b1b";
  const bgEtiqueta = diasDesde <= 1 ? "#fef3c7" : "#fee2e2";
  return {
    formaPago, diaPago, ultimoPago,
    pagadoHasta: ultimoPago ? (() => {
      const u = new Date(ultimoPago + "T00:00:00");
      u.setDate(u.getDate() + diasPeriodo - 1);
      return u.toISOString().slice(0, 10);
    })() : null,
    proximoPago: inicioPeriodo,
    diasEstado: diasDesde,
    etiqueta: etiqueta as EstadoCuenta["etiqueta"],
    colorEtiqueta, bgEtiqueta,
  };
}

function calcularEstadoCartera(
  diaPago: string,
  totalPagadoEstaSemana: number,
  valorSemanal: number,
): EstadoCartera {
  const hoyJS = new Date().getDay();
  const diaPagoNum = DIAS[diaPago] ?? 1;

  if (totalPagadoEstaSemana >= valorSemanal) return "al-dia";

  let diasDesde = (hoyJS - diaPagoNum + 7) % 7;
  if (diasDesde === 0) return "al-dia";
  if (diasDesde === 1) return "gabela";
  return "mora";
}

type TabKey = "pagan-hoy" | "gabela" | "mora" | "al-dia" | "todos" | "protocolo" | "campo" | "recoleccion" | "historial";

type ProtocoloStep = { paso: number; label: string; color: string; bg: string; accionRecomendada: string };
function calcProtocoloStep(dias: number): ProtocoloStep {
  if (dias <= 0) return { paso: 1, label: "Recordatorio", color: "#0284c7", bg: "#e0f2fe", accionRecomendada: "mensaje_recordatorio" };
  if (dias === 1) return { paso: 2, label: "Llamada + Sirena", color: "#92400e", bg: "#fef3c7", accionRecomendada: "llamada" };
  if (dias <= 3) return { paso: 3, label: "Apagado Remoto", color: "#991b1b", bg: "#fee2e2", accionRecomendada: "otro" };
  return { paso: 4, label: "RECOLECCION FISICA", color: "#ffffff", bg: "#7f1d1d", accionRecomendada: "recoleccion" };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CobrosView({ initialOpenForm = false, onNavigate }: { initialOpenForm?: boolean; onNavigate?: (view: ViewKey, filter?: string) => void }) {
  const { profile } = useAuth();

  const { pagos, loading: loadingPagos, error: errorPagos, registrarPago, confirmarPago, rechazarPago, pagosDelContrato } =
    usePagos();
  const { contratos, loading: loadingContratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { deudas, registrarDeuda } = useDeudas();
  const { convenios, convenioActivoDelContrato, totalConveniosDelContrato, crearConvenio } = useConvenios();
  const { gestiones, registrarGestion } = useGestiones();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const [activeTab, setActiveTab] = useState<TabKey>("pagan-hoy");
  const [contratoSeleccionadoId, setContratoSeleccionadoId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  // Modal de registro rápido de pago (desde acción rápida del dashboard)
  const [modalPago, setModalPago] = useState(initialOpenForm);
  const [modalBusqueda, setModalBusqueda] = useState("");

  // Payment form state
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState<MetodoPago>("Efectivo");
  const [formError, setFormError] = useState<string | null>(null);
  const [formExito, setFormExito] = useState(false);

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
  const [mostrarFormDeuda, setMostrarFormDeuda] = useState(false);

  // Historial filter
  const [filtroPagos, setFiltroPagos] = useState<"todos" | "Pendiente" | "Confirmado" | "Rechazado">("todos");

  // Detail panel tabs
  const [detailTab, setDetailTab] = useState<"gestiones" | "deudas" | "convenios" | "historial">("gestiones");

  // Protocolo / Campo / Recolección state
  const [accionExitoId, setAccionExitoId] = useState<string | null>(null);
  const [campoContratoId, setCampoContratoId] = useState<string | null>(null);
  const [campoMonto, setCampoMonto] = useState("");
  const [campoPorId, setCampoPorId] = useState("");
  const [campoNota, setCampoNota] = useState("");
  const [campoError, setCampoError] = useState("");
  const [campoExito, setCampoExito] = useState(false);
  const [recoleccionOrdenada, setRecoleccionOrdenada] = useState<Set<string>>(new Set());

  const contratosActivos = contratos.filter(c => c.estado === "Activo");

  // ── Resumen por contrato ──────────────────────────────────────────────────
  const resumenContratos = useMemo(() => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    const dayOfWeek = hoy.getDay();
    const daysFromMon = (dayOfWeek + 6) % 7;
    inicioSemana.setDate(hoy.getDate() - daysFromMon);
    inicioSemana.setHours(0, 0, 0, 0);

    return contratosActivos.map(contrato => {
      const todosPagos = pagos.filter(p => p.contrato_id === contrato.id);
      const confirmados = todosPagos.filter(p => p.estado === "Confirmado");
      const pendientes = todosPagos.filter(p => p.estado === "Pendiente");

      const ultimoPagoFecha = [...confirmados].sort((a,b) => b.fecha.localeCompare(a.fecha))[0]?.fecha ?? null;
      const diasSinPago = ultimoPagoFecha
        ? Math.floor((Date.now() - new Date(ultimoPagoFecha + "T00:00:00").getTime()) / 86400000)
        : 999;
      const ultimaGestion = gestiones.filter(g => g.contrato_id === contrato.id)[0] ?? null;

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

      const saldoAFavor = confirmados.reduce((acc, p) => acc + (p.aplicado_saldo_favor ?? 0), 0);

      return {
        ...contrato,
        pagadoEstaSemana,
        recaudadoHoy,
        estadoCartera,
        deudaContrato,
        convenioActivo,
        cuotaConvenio,
        pendientesCount: pendientes.length,
        diasSinPago,
        ultimaGestion,
        saldoAFavor,
      };
    });
  }, [contratosActivos, pagos, deudas, convenios]);

  const enMora = resumenContratos.filter(r => r.estadoCartera === "mora");
  const enGabela = resumenContratos.filter(r => r.estadoCartera === "gabela");
  const alDia = resumenContratos.filter(r => r.estadoCartera === "al-dia");
  const enMoraCritica = resumenContratos.filter(r => r.diasSinPago > 3).length;
  const recaudadoHoyTotal = resumenContratos.reduce((acc, r) => acc + r.recaudadoHoy, 0);
  // ── Pagan Hoy ─────────────────────────────────────────────────────────────
  const hoyDia = new Date().getDay(); // 0=Sun, 1=Mon...

  const paganHoyDiario = useMemo(() =>
    resumenContratos.filter(c => c.forma_pago === "Diario"),
    [resumenContratos]);

  const paganHoyPeriodico = useMemo(() =>
    resumenContratos.filter(c => {
      if (c.forma_pago === "Diario") return false;
      return hoyDia === (DIAS[c.dia_pago] ?? 1);
    }), [resumenContratos, hoyDia]);

  const totalPaganHoy = paganHoyDiario.length + paganHoyPeriodico.length;

  // ── Filtrar lista ─────────────────────────────────────────────────────────
  const listaFiltrada = useMemo(() => {
    let base: typeof resumenContratos;
    if (activeTab === "gabela") base = enGabela;
    else if (activeTab === "mora") base = enMora;
    else if (activeTab === "al-dia") base = alDia;
    else if (activeTab === "pagan-hoy") base = [...paganHoyDiario, ...paganHoyPeriodico];
    else base = [...enMora, ...enGabela, ...alDia];

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
  }, [activeTab, enMora, enGabela, alDia, paganHoyDiario, paganHoyPeriodico, busqueda, clientes, motos]);

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
  const esSecretaria = profile?.role === "SECRETARIA" || profile?.role === "ADMIN_PRINCIPAL";
  const [saldoExito, setSaldoExito] = useState(false);
  const convenioActual = contratoSeleccionadoId ? convenioActivoDelContrato(contratoSeleccionadoId) : null;

  const gestionesContrato = contratoSeleccionadoId
    ? gestiones.filter(g => g.contrato_id === contratoSeleccionadoId).slice(0, 5)
    : [];

  // ── Desglose en tiempo real ───────────────────────────────────────────────
  const montoIngresado = Number(valor) || 0;
  const esDomingo = new Date().getDay() === 0;

  const cuotaPactada = contratoDetalle
    ? (contratoDetalle.forma_pago === "Diario"
        ? calcularCuotaDia(contratoDetalle.tarifa_diaria ?? 27000, esDomingo)
        : contratoDetalle.valor_semanal)
    : 27000;

  const pagadoEnPeriodo = contratoDetalle?.forma_pago === "Diario"
    ? (contratoDetalle?.recaudadoHoy ?? 0)
    : (contratoDetalle?.pagadoEstaSemana ?? 0);
  const cuotaPendiente = Math.max(cuotaPactada - pagadoEnPeriodo, 0);

  const desglose: AplicadoPago = contratoDetalle
    ? calcularAplicacion(
        montoIngresado,
        cuotaPendiente,
        0,
        contratoDetalle.deudaContrato,
        contratoDetalle.cuotaConvenio,
      )
    : { tarifa: 0, baseInicial: 0, deuda: 0, convenio: 0, ahorro: 0, saldo: 0 };

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleRegistrarPago() {
    if (!contratoSeleccionadoId) { setFormError("Selecciona un contrato."); return; }
    if (!valor || montoIngresado <= 0) { setFormError("Ingresa un valor valido."); return; }
    setFormError(null);
    setFormExito(false);

    const { error } = await registrarPago(
      contratoSeleccionadoId,
      montoIngresado,
      metodo,
      desglose,
      contratoDetalle?.convenioActivo?.id ? { convenioId: contratoDetalle.convenioActivo.id } : undefined,
    );
    if (error) { setFormError(error); return; }
    setValor("");
    setFormExito(true);
    setTimeout(() => setFormExito(false), 3000);
  }

  async function handleAplicarSaldo() {
    if (!contratoSeleccionadoId || !contratoDetalle) return;
    const saldo = contratoDetalle.saldoAFavor ?? 0;
    if (saldo <= 0) return;
    const aplicado = calcularAplicacion(saldo, cuotaPendiente, 0, contratoDetalle.deudaContrato, contratoDetalle.cuotaConvenio);
    const { error } = await registrarPago(
      contratoSeleccionadoId, saldo, "Efectivo", aplicado,
      contratoDetalle.convenioActivo?.id ? { convenioId: contratoDetalle.convenioActivo.id } : undefined,
    );
    if (error) { setFormError(error); return; }
    setSaldoExito(true);
    setTimeout(() => setSaldoExito(false), 3000);
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
    setGestionError(null);
    const { error } = await registrarGestion(contratoSeleccionadoId, tipoGestion, resultadoGestion, profile.id);
    if (error) { setGestionError(error); return; }
    setResultadoGestion("");
    setGestionExito(true);
    setTimeout(() => setGestionExito(false), 3000);
  }

  async function handleAccionRapida(contratoId: string, tipo: string) {
    if (!profile) return;
    await registrarGestion(contratoId, tipo as TipoGestion, "Realizado", profile.id);
    setAccionExitoId(contratoId);
    setTimeout(() => setAccionExitoId(null), 2000);
  }

  async function handleCampoSubmit() {
    if (!campoContratoId || !campoMonto || !campoPorId) { setCampoError("Completa todos los campos"); return; }
    await registrarGestion(campoContratoId, "cobro_campo", `Efectivo recuperado: $${campoMonto}. Nota: ${campoNota}`, campoPorId);
    setCampoExito(true);
    setTimeout(() => { setCampoExito(false); setCampoContratoId(null); setCampoMonto(""); setCampoPorId(""); setCampoNota(""); setCampoError(""); }, 2000);
  }

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
      contratoDetalle.forma_pago ?? "semanal",
      contratoDetalle.dia_pago ?? "Lunes",
      pagosDelContrato(contratoDetalle.id).filter(p => p.estado === "Confirmado"),
    );
    const protocolo = calcProtocoloStep(contratoDetalle.diasSinPago);
    const totalPendiente = cuotaPendiente + contratoDetalle.deudaContrato + (contratoDetalle.convenioActivo?.cuota_por_periodo ?? 0);

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
                Contrato {contratoDetalle.forma_pago ?? "semanal"} · Paga {contratoDetalle.dia_pago}
                {clienteDetalle?.direccion && ` · ${clienteDetalle.direccion}`}
              </div>
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
        </div>

        {/* Estado de cuenta */}
        <div style={{ ...card, background: ec.bgEtiqueta, border: `1px solid ${ec.colorEtiqueta}44` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 13, color: "#334155", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: ec.colorEtiqueta }}>{ec.etiqueta}</span>
              {ec.ultimoPago && <span>Último: <strong>{fmtFecha(ec.ultimoPago)}</strong></span>}
              <span>Próximo: <strong>{fmtFecha(ec.proximoPago)}</strong></span>
            </div>
            {contratoDetalle.diasSinPago > 0 && (
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
            <div style={{ background: cuotaPendiente > 0 ? "#fecaca" : "#bbf7d0", borderRadius: 10, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Pendiente</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: cuotaPendiente > 0 ? "#991b1b" : "#166534" }}>
                {cuotaPendiente > 0 ? `$ ${fmt(cuotaPendiente)}` : "✓ Al día"}
              </div>
            </div>
          </div>

          {(contratoDetalle.deudaContrato > 0 || contratoDetalle.convenioActivo) && (
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", fontSize: 13 }}>
              {contratoDetalle.deudaContrato > 0 && (
                <span style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "4px 10px", fontWeight: 700 }}>
                  + Deuda: $ {fmt(contratoDetalle.deudaContrato)}
                </span>
              )}
              {contratoDetalle.convenioActivo && (
                <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 8, padding: "4px 10px", fontWeight: 700 }}>
                  + Conv. #{contratoDetalle.convenioActivo.numero_convenio}: $ {fmt(contratoDetalle.convenioActivo.cuota_por_periodo)}
                </span>
              )}
              {totalPendiente > cuotaPendiente && (
                <span style={{ background: "rgba(255,255,255,0.8)", borderRadius: 8, padding: "4px 10px", fontWeight: 900, fontSize: 14, color: "#991b1b", marginLeft: "auto" }}>
                  Total: $ {fmt(totalPendiente)}
                </span>
              )}
            </div>
          )}

          {(contratoDetalle.saldoAFavor ?? 0) > 0 && (
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#eff6ff", borderRadius: 10, padding: "8px 12px" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0284c7", textTransform: "uppercase" }}>Saldo a favor</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#0284c7" }}>$ {fmt(contratoDetalle.saldoAFavor ?? 0)}</div>
              </div>
              {esSecretaria && (
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
              <div style={labelStyle}>Valor recibido</div>
              <input
                type="number"
                style={inputStyle}
                value={valor}
                onChange={e => { setValor(e.target.value); setFormExito(false); }}
                placeholder="Ej. 27000"
              />
            </div>
            <div style={{ flex: "3 1 160px" }}>
              <div style={labelStyle}>Método</div>
              <select style={inputStyle} value={metodo} onChange={e => setMetodo(e.target.value as MetodoPago)}>
                <option value="Efectivo">Efectivo (confirma automático)</option>
                <option value="Nequi">Nequi (queda pendiente)</option>
              </select>
            </div>
          </div>

          {montoIngresado > 0 && (
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
          <button onClick={handleRegistrarPago} style={{ ...primaryBtn, width: "100%", marginTop: 10, padding: "12px 16px" }}>
            Registrar pago
          </button>
        </div>

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
              <button onClick={handleRegistrarGestion} style={secondaryBtn}>Registrar gestión</button>
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
                <div key={d.id} style={{ padding: "10px 12px", borderRadius: 12, background: "#fff7f7", border: "1px solid #fecaca", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{d.concepto.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{d.descripcion}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#991b1b", whiteSpace: "nowrap" }}>$ {fmt(d.monto_pendiente)}</div>
                </div>
              ))}
              {esAdmin && (
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
                      <div>
                        <div style={labelStyle}>Monto ($)</div>
                        <input type="number" style={inputStyle} value={deudaMonto} onChange={e => setDeudaMonto(e.target.value)} placeholder="Ej. 150000" />
                      </div>
                      {deudaError && <div style={{ color: "#991b1b", fontSize: 13, fontWeight: 600 }}>{deudaError}</div>}
                      {deudaExito && <div style={{ color: "#166534", background: "#dcfce7", padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>Deuda registrada.</div>}
                      <button onClick={handleRegistrarDeuda} style={primaryBtn}>Registrar deuda</button>
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
              ) : (
                <div>
                  <button onClick={() => setMostrarFormConvenio(v => !v)} style={miniBtn("#eff6ff", "#1e40af")}>
                    {mostrarFormConvenio ? "Cancelar" : "+ Crear convenio"}
                  </button>
                  {mostrarFormConvenio && (
                    <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14, marginTop: 10, display: "grid", gap: 10 }}>
                      <div style={{ fontSize: 13, color: "#64748b" }}>
                        Deuda pendiente: <strong style={{ color: "#991b1b" }}>$ {fmt(deudasContrato.reduce((a, d) => a + d.monto_pendiente, 0))}</strong>
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
                      {convExito && <div style={{ color: "#166534", background: "#dcfce7", padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>Convenio creado.</div>}
                      <button onClick={handleCrearConvenio} style={primaryBtn}>Crear convenio</button>
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
              ) : pagosContrato.map(p => (
                <div key={p.id} style={{ padding: "10px 12px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>$ {fmt(p.valor)}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{formatDate(p.fecha)} · {p.metodo}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <PagoBadge estado={p.estado} />
                    {p.estado === "Pendiente" && (
                      <>
                        <button onClick={() => confirmarPago(p.id)} style={miniBtn("#dcfce7", "#166534")}>Confirmar</button>
                        <button onClick={() => rechazarPago(p.id)} style={miniBtn("#fee2e2", "#991b1b")}>Rechazar</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
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
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>
                  {cliente?.nombre || "Sin cliente"}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {moto ? `🏍️ ${moto.placa} · ` : ""}
                  {c.forma_pago === "Diario"
                    ? "Diario"
                    : `Paga ${c.dia_pago} · $${fmt(c.valor_semanal)}`}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <EstadoBadge estado={c.estadoCartera} />
                {c.pendientesCount > 0 && (
                  <span style={{ fontSize: 11, color: "#92400e" }}>{c.pendientesCount} pend.</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── KPI cards ─────────────────────────────────────────────────────────────
  const kpis = [
    { label: "Pagan hoy", value: totalPaganHoy, color: "#0284c7", bg: "#eff6ff", tab: "pagan-hoy" as TabKey },
    { label: "Recaudado hoy", value: `$${fmt(recaudadoHoyTotal)}`, color: "#166534", bg: "#dcfce7", tab: "al-dia" as TabKey },
    { label: "En gabela", value: enGabela.length, color: "#92400e", bg: "#fef3c7", tab: "gabela" as TabKey },
    { label: "En mora", value: enMora.length, color: "#991b1b", bg: "#fee2e2", tab: "mora" as TabKey },
  ];

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "pagan-hoy", label: "Pagan Hoy", count: totalPaganHoy },
    { key: "gabela", label: "Gabela", count: enGabela.length },
    { key: "mora", label: "Mora", count: enMora.length },
    { key: "al-dia", label: "Al día", count: alDia.length },
    { key: "todos", label: "Todos", count: resumenContratos.length },
    { key: "protocolo", label: "Protocolo" },
    { key: "campo", label: "Campo" },
    { key: "recoleccion", label: "Recolección", count: enMoraCritica },
    { key: "historial", label: "Historial" },
  ];

  // On mobile with a selected contract → show only detail
  if (isMobile && contratoSeleccionadoId) {
    return (
      <div style={{ padding: "0 0 80px" }}>
        <PanelDetalle />
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

      {/* KPI cards — clickable */}
      <div style={{ display: "flex", gap: 12, marginTop: 20, overflowX: "auto", paddingBottom: 4 }}>
        {kpis.map(k => (
          <button
            key={k.tab}
            onClick={() => { setActiveTab(k.tab); setContratoSeleccionadoId(null); }}
            style={{
              background: activeTab === k.tab ? k.bg : "white",
              border: activeTab === k.tab ? `2px solid ${k.color}` : "2px solid transparent",
              borderRadius: 16,
              padding: "14px 20px",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
              flex: "0 0 auto",
              minWidth: 130,
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
          </button>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 8, marginTop: 20, overflowX: "auto", paddingBottom: 4 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setContratoSeleccionadoId(null); }}
            style={{
              background: activeTab === t.key ? "#0284c7" : "#f1f5f9",
              color: activeTab === t.key ? "white" : "#334155",
              border: "none",
              borderRadius: 999,
              padding: "8px 16px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {t.label}
            {t.count !== undefined && (
              <span style={{
                marginLeft: 6,
                background: activeTab === t.key ? "rgba(255,255,255,0.3)" : "#e2e8f0",
                color: activeTab === t.key ? "white" : "#64748b",
                borderRadius: 999,
                padding: "1px 7px",
                fontSize: 11,
                fontWeight: 700,
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

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
          <div style={{ display: "grid", gap: 10 }}>
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
                    {p.estado === "Pendiente" && (
                      <>
                        <button onClick={() => confirmarPago(p.id)} style={miniBtn("#dcfce7", "#166534")}>Confirmar</button>
                        <button onClick={() => rechazarPago(p.id)} style={miniBtn("#fee2e2", "#991b1b")}>Rechazar</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagan hoy tab — two sections */}
      {activeTab === "pagan-hoy" && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: isMobile ? "column" : "row", gap: 20, alignItems: "start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Diario section */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>📅</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Pago diario</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Pagan cada día hábil · {paganHoyDiario.length} contratos</div>
                </div>
              </div>
              <input
                style={{ ...inputStyle, marginBottom: 12 }}
                placeholder="Buscar cliente o placa..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              <ListaContratos lista={paganHoyDiario.filter(c => {
                const q = busqueda.toLowerCase();
                if (!q) return true;
                const cliente = clientes.find(cl => cl.id === c.cliente_id);
                const moto = motos.find(m => m.id === c.moto_id);
                return (cliente?.nombre ?? "").toLowerCase().includes(q) || (moto?.placa ?? "").toLowerCase().includes(q);
              })} />
            </div>

            {/* Periódico section */}
            <div style={{ ...card, marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>📆</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Semanal / Quincenal / Mensual</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {paganHoyPeriodico.length > 0
                      ? `${paganHoyPeriodico.length} contratos con vencimiento hoy`
                      : `Ningún contrato periódico vence hoy (${DIAS_LABEL[hoyDia]})`}
                  </div>
                </div>
              </div>
              <ListaContratos lista={paganHoyPeriodico.filter(c => {
                const q = busqueda.toLowerCase();
                if (!q) return true;
                const cliente = clientes.find(cl => cl.id === c.cliente_id);
                const moto = motos.find(m => m.id === c.moto_id);
                return (cliente?.nombre ?? "").toLowerCase().includes(q) || (moto?.placa ?? "").toLowerCase().includes(q);
              })} />
            </div>
          </div>

          {/* Detail panel — desktop only (mobile uses full screen) */}
          {!isMobile && (
            <div style={{ flex: "0 0 380px", maxWidth: 380 }}>
              <PanelDetalle />
            </div>
          )}
        </div>
      )}

      {/* Tab Protocolo */}
      {activeTab === "protocolo" && (
        <div style={{ marginTop: 20 }}>
          <div style={{ marginBottom: 12, fontSize: 14, color: "#64748b" }}>
            Sigue el protocolo de mora en orden estricto.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...resumenContratos]
              .filter(r => r.diasSinPago >= 0)
              .sort((a, b) => b.diasSinPago - a.diasSinPago)
              .map(r => {
                const cliente = clientes.find(cl => cl.id === r.cliente_id);
                const moto = motos.find(m => m.id === r.moto_id);
                const paso = calcProtocoloStep(r.diasSinPago);
                return (
                  <div key={r.id} style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 4px 16px rgba(15,23,42,0.08)", border: `1px solid ${paso.bg}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase", color: "#0f172a" }}>
                          {cliente?.nombre || "Sin cliente"}
                        </div>
                        {moto && <div style={{ fontSize: 13, color: "#0284c7", fontWeight: 700 }}>🏍️ {moto.placa}</div>}
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                          {r.diasSinPago === 999 ? "Sin pagos registrados" : `${r.diasSinPago} día(s) sin pago`}
                        </div>
                      </div>
                      <span style={{ padding: "4px 12px", borderRadius: 999, fontWeight: 700, fontSize: 12, background: paso.bg, color: paso.color, border: `1px solid ${paso.color}33` }}>
                        Paso {paso.paso}: {paso.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      <button onClick={() => handleAccionRapida(r.id, "llamada")} style={miniBtn("#e0f2fe", "#0284c7")}>
                        📞 Registrar llamada
                      </button>
                      <button onClick={() => handleAccionRapida(r.id, "sirena")} style={miniBtn("#fef3c7", "#92400e")}>
                        📣 Registrar sirena
                      </button>
                      <button onClick={() => handleAccionRapida(r.id, "visita")} style={miniBtn("#f1f5f9", "#334155")}>
                        🏠 Anotar visita
                      </button>
                    </div>
                    {accionExitoId === r.id && (
                      <div style={{ marginTop: 8, color: "#166534", fontWeight: 700, fontSize: 13 }}>✓ Registrado</div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab Campo */}
      {activeTab === "campo" && (
        <div style={{ marginTop: 20 }}>
          <div style={{ ...card, marginBottom: 16, background: "#fffbeb", border: "1px solid #fde68a" }}>
            <div style={{ fontSize: 14, color: "#92400e", fontWeight: 600 }}>
              Admin recupera efectivo en campo → secretaria confirma
            </div>
          </div>
          {campoContratoId === null ? (
            <div>
              <div style={{ marginBottom: 10, fontSize: 14, color: "#64748b" }}>Selecciona el contrato del cobro en campo:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[...enMora, ...enGabela].map(r => {
                  const cliente = clientes.find(cl => cl.id === r.cliente_id);
                  const moto = motos.find(m => m.id === r.moto_id);
                  return (
                    <div
                      key={r.id}
                      onClick={() => setCampoContratoId(r.id)}
                      style={{ ...card, cursor: "pointer", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>{cliente?.nombre || "Sin cliente"}</div>
                        {moto && <div style={{ fontSize: 12, color: "#0284c7" }}>🏍️ {moto.placa}</div>}
                      </div>
                      <EstadoBadge estado={r.estadoCartera} />
                    </div>
                  );
                })}
                {enMora.length === 0 && enGabela.length === 0 && (
                  <div style={{ color: "#64748b", fontSize: 14 }}>No hay contratos en mora o gabela.</div>
                )}
              </div>
            </div>
          ) : (
            <div style={card}>
              {(() => {
                const r = resumenContratos.find(x => x.id === campoContratoId);
                const cliente = r ? clientes.find(cl => cl.id === r.cliente_id) : null;
                const moto = r ? motos.find(m => m.id === r.moto_id) : null;
                return (
                  <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                      <div style={{ fontWeight: 800, textTransform: "uppercase" }}>{cliente?.nombre || "Sin cliente"}</div>
                      {moto && <div style={{ fontSize: 13, color: "#0284c7" }}>🏍️ {moto.placa}</div>}
                    </div>
                    <div>
                      <div style={labelStyle}>Monto recuperado ($)</div>
                      <input type="number" style={inputStyle} value={campoMonto} onChange={e => setCampoMonto(e.target.value)} placeholder="Ej. 27000" />
                    </div>
                    <div>
                      <div style={labelStyle}>Cobrado por (ID del admin)</div>
                      <input style={inputStyle} value={campoPorId} onChange={e => setCampoPorId(e.target.value)} placeholder="ID del admin que cobró" />
                    </div>
                    <div>
                      <div style={labelStyle}>Nota (opcional)</div>
                      <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={campoNota} onChange={e => setCampoNota(e.target.value)} placeholder="Observaciones del cobro en campo..." />
                    </div>
                    {campoError && <div style={{ color: "#991b1b", fontSize: 13, fontWeight: 600 }}>{campoError}</div>}
                    {campoExito && (
                      <div style={{ color: "#166534", background: "#dcfce7", padding: "8px 12px", borderRadius: 10, fontWeight: 700, fontSize: 13 }}>
                        ✓ Registrado
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={handleCampoSubmit} style={primaryBtn}>Registrar cobro en campo</button>
                      <button onClick={() => setCampoContratoId(null)} style={secondaryBtn}>Cancelar</button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Tab Recolección */}
      {activeTab === "recoleccion" && (
        <div style={{ marginTop: 20 }}>
          <div style={{ ...card, marginBottom: 16, background: "#fff1f2", border: "1px solid #fecdd3" }}>
            <div style={{ fontSize: 14, color: "#991b1b", fontWeight: 700 }}>
              ⚠️ Llama al GPS y a la policía antes de acercarte al vehículo
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...resumenContratos]
              .filter(r => r.diasSinPago > 3)
              .sort((a, b) => b.diasSinPago - a.diasSinPago)
              .map(r => {
                const cliente = clientes.find(cl => cl.id === r.cliente_id);
                const moto = motos.find(m => m.id === r.moto_id);
                const ordenada = recoleccionOrdenada.has(r.id);
                return (
                  <div key={r.id} style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 4px 16px rgba(15,23,42,0.08)", border: ordenada ? "2px solid #166534" : "1px solid #fecaca" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase", color: "#0f172a" }}>
                          {cliente?.nombre || "Sin cliente"}
                        </div>
                        {moto && <div style={{ fontSize: 13, color: "#0284c7", fontWeight: 700 }}>🏍️ {moto.placa}</div>}
                      </div>
                      <span style={{ padding: "4px 12px", borderRadius: 999, fontWeight: 800, fontSize: 13, background: "#fee2e2", color: "#991b1b" }}>
                        {r.diasSinPago === 999 ? "Sin pagos" : `${r.diasSinPago} días`}
                      </span>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <button
                        onClick={() => {
                          setRecoleccionOrdenada(prev => {
                            const next = new Set(prev);
                            if (next.has(r.id)) next.delete(r.id); else next.add(r.id);
                            return next;
                          });
                        }}
                        style={ordenada ? miniBtn("#dcfce7", "#166534") : miniBtn("#fee2e2", "#991b1b")}
                      >
                        {ordenada ? "✓ Orden enviada" : "Ordenar recolección"}
                      </button>
                    </div>
                  </div>
                );
              })}
            {resumenContratos.filter(r => r.diasSinPago > 3).length === 0 && (
              <div style={{ color: "#64748b", fontSize: 14 }}>No hay contratos con más de 3 días sin pago.</div>
            )}
          </div>
        </div>
      )}

      {/* Other tabs (gabela, mora, al-dia, todos) */}
      {activeTab !== "pagan-hoy" && activeTab !== "historial" && activeTab !== "protocolo" && activeTab !== "campo" && activeTab !== "recoleccion" && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: isMobile ? "column" : "row", gap: 20, alignItems: "start" }}>
          {/* Lista */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={card}>
              <input
                style={{ ...inputStyle, marginBottom: 12 }}
                placeholder="Buscar cliente o placa..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              <ListaContratos lista={listaFiltrada} />
            </div>
          </div>

          {/* Detail panel — desktop only */}
          {!isMobile && (
            <div style={{ flex: "0 0 380px", maxWidth: 380 }}>
              <PanelDetalle />
            </div>
          )}
        </div>
      )}

      {/* Modal de registro rápido de pago */}
      {modalPago && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 60 }}
          onClick={() => { setModalPago(false); setModalBusqueda(""); }}
        >
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Registrar pago</h3>
              <button onClick={() => { setModalPago(false); setModalBusqueda(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }}>✕</button>
            </div>

            {/* Selector de cliente */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>Cliente / contrato</label>
              <input
                style={{ ...inputStyle, marginBottom: 8 }}
                placeholder="Buscar cliente o placa..."
                value={modalBusqueda}
                onChange={e => setModalBusqueda(e.target.value)}
                autoFocus
              />
              <select
                style={inputStyle}
                value={contratoSeleccionadoId ?? ""}
                onChange={e => setContratoSeleccionadoId(e.target.value || null)}
              >
                <option value="">— Selecciona un contrato —</option>
                {resumenContratos
                  .filter(c => {
                    const q = modalBusqueda.trim().toLowerCase();
                    if (!q) return true;
                    const cliente = clientes.find(cl => cl.id === c.cliente_id);
                    const moto = motos.find(m => m.id === c.moto_id);
                    return (cliente?.nombre ?? "").toLowerCase().includes(q) || (moto?.placa ?? "").toLowerCase().includes(q);
                  })
                  .map(c => {
                    const cliente = clientes.find(cl => cl.id === c.cliente_id);
                    const moto = motos.find(m => m.id === c.moto_id);
                    return (
                      <option key={c.id} value={c.id}>
                        {moto ? `${moto.placa} · ` : ""}{cliente?.nombre || "Sin cliente"}
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Cuota pendiente del contrato seleccionado */}
            {contratoDetalle && (
              <div style={{ background: "#f0f9ff", borderRadius: 10, padding: "10px 12px", marginBottom: 14, fontSize: 13, color: "#0369a1" }}>
                Cuota del período: <strong>${cuotaPactada.toLocaleString("es-CO")}</strong> · Pendiente: <strong>${cuotaPendiente.toLocaleString("es-CO")}</strong>
              </div>
            )}

            {/* Valor */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>Valor recibido</label>
              <input type="number" style={inputStyle} value={valor} onChange={e => setValor(e.target.value)} placeholder="Ej. 202000" />
            </div>

            {/* Método */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>Método de pago</label>
              <select style={inputStyle} value={metodo} onChange={e => setMetodo(e.target.value as MetodoPago)}>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>

            {formError && <div style={{ color: "#991b1b", fontSize: 13, marginBottom: 12 }}>{formError}</div>}
            {formExito && <div style={{ color: "#166534", fontSize: 13, marginBottom: 12, fontWeight: 700 }}>✓ Pago registrado correctamente</div>}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={async () => { await handleRegistrarPago(); }}
                style={{ ...primaryBtn, flex: 1 }}
              >
                Registrar pago
              </button>
              <button onClick={() => { setModalPago(false); setModalBusqueda(""); }} style={secondaryBtn}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
