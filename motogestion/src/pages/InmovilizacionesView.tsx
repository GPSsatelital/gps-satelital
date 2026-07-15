import { useMemo, useState, useEffect } from "react";
import type { ViewKey } from "../App";
import { useContratos } from "../hooks/useContratos";
import { useMensajesWhatsapp } from "../hooks/useMensajesWhatsapp";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { usePagos, calcularCuotaDia, APLICADO_LO_REPARTE_LA_BD } from "../hooks/usePagos";
import MoneyInput from "../components/MoneyInput";
import { useGestiones } from "../hooks/useGestiones";
import { useDeudas } from "../hooks/useDeudas";
import { useConvenios } from "../hooks/useConvenios";
import { useAuth } from "../contexts/AuthContext";
import {
  calcularEstadoCartera,
  cuotaConvenioDelPeriodo,
  diasEnMora,
  valorPeriodoReal,
  totalPagadoPeriodoActual,
  estaEnProrrateo,
  calcularProrrateoInicial,
  huecoCuotasHoy,
  calcularAhorroAplicado,
} from "../utils/cicloPago";
import { hoyISO, hoyDate as hoyDateFn } from "../utils/fecha";
import ModalGestion from "../components/ModalGestion";
import ModalIniciarLiquidacion from "../components/ModalIniciarLiquidacion";
import ModalConvenio from "../components/ModalConvenio";
import ModalEntregaDevolucion from "../components/ModalEntregaDevolucion";
import ModalResolverTiempoFueraServicio from "../components/ModalResolverTiempoFueraServicio";
import ModalPrestarReemplazo from "../components/ModalPrestarReemplazo";
import { useUbicaciones } from "../hooks/useUbicaciones";
import { usePrestamos } from "../hooks/usePrestamos";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

const DIAS_LABEL  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES_LABEL = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function fmtFecha(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${DIAS_LABEL[d.getDay()]} ${d.getDate()} ${MESES_LABEL[d.getMonth()]}`;
}

type Prioridad = "critica" | "alta" | "media";

type Fila = {
  contratoId: string;
  clienteId: string;
  clienteNombre: string;
  clienteTel: string;
  motoId: string | null;
  placa: string;
  marca: string;
  modelo: string;
  diasMora: number;
  deudaReal: number;
  tarifa: number;
  ultimoPago: string | null;
  prioridad: Prioridad;
  ultimaGestion: string | null;
  tipoUltimaGestion: string | null;
  recoleccionOrdenada: boolean;
  pasosPrevios: { mensaje: boolean; llamada: boolean; sirena: boolean };
};

const PRIO: Record<Prioridad, { bg: string; color: string; border: string; label: string; icon: string }> = {
  critica: { bg: "#fff5f5", color: "#991b1b", border: "#fecaca", label: "Crítica",  icon: "🔴" },
  alta:    { bg: "#fefce8", color: "#92400e", border: "#fde68a", label: "Alta",     icon: "🟠" },
  media:   { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", label: "Media",    icon: "🟡" },
};

type FiltroP = "todos" | "criticos" | "en_proceso" | Prioridad;

// Protocolo actual: mensaje → llamada → apagado/recolección, disponibles el mismo día en
// que el contrato entra en mora (el funcionario escala según si hay respuesta o no).
// Los pasos ya no dependen de un número fijo de días — se gestionan desde el Panel Hoy de Cartera.

export default function InmovilizacionesView({ onNavigate }: { onNavigate?: (view: ViewKey, filter?: string) => void }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const { contratos } = useContratos();
  const { clientes }  = useClientes();
  const { motos }     = useMotos();
  const { pagos, registrarPago } = usePagos();
  const { gestiones } = useGestiones();
  const { deudas }    = useDeudas();
  const { convenios } = useConvenios();
  const { recepciones } = useUbicaciones();
  const { prestamos, devolverReemplazo } = usePrestamos();
  const { profile, puede } = useAuth();
  const { render: renderMsg } = useMensajesWhatsapp();
  const esAdmin = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";
  // Liquidar a los 7 días sigue siendo decisión del ADMIN (regla local), pero además se le
  // puede recortar por persona. El convenio de recuperación exige el permiso crear_convenio.
  const puedeLiquidar = puede("iniciar_liquidacion");
  const puedeCrearConvenio = puede("crear_convenio");

  const [gestionId, setGestionId]     = useState<string | null>(null);
  const [gestionNombre, setGestionNombre] = useState("");
  const [gestionPasosPrevios, setGestionPasosPrevios] = useState<{ mensaje: boolean; llamada: boolean; sirena: boolean } | undefined>(undefined);
  const [busqueda, setBusqueda]       = useState("");
  const [filtro, setFiltro]           = useState<FiltroP>("todos");
  const [expandido, setExpandido]     = useState<string | null>(null);
  // El procesamiento real vive en cada modal (cobro/entrega); aquí solo se lee para deshabilitar.
  const [procesandoId] = useState<string | null>(null);
  // Retenidas primero: es el endpoint que a la práctica más se consulta (de ahí salen las
  // inmovilizadas). "En mora" es la persecución previa a la recolección.
  const [tab, setTab]                 = useState<"retenidas" | "en_mora">("retenidas");
  const [filtroRet, setFiltroRet]     = useState<"todas" | "mora" | "temporal" | "taller">("todas");

  const hoy = hoyISO();
  const inicioSemana = (() => {
    const d = hoyDateFn(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().slice(0, 10);
  })();

  const filas: Fila[] = useMemo(() => {
    const hoyDate = hoyDateFn();
    const hoyISOStr = hoyISO();
    return contratos
      .filter(c => c.estado === "Activo")
      .flatMap(c => {
        const pagosC = pagos
          .filter(p => p.contrato_id === c.id && p.estado === "Confirmado")
          .sort((a, b) => b.fecha.localeCompare(a.fecha));

        // Mismo criterio de mora real que usa Cartera — solo entran los que de verdad
        // están en mora, sin importar la modalidad (evita el falso positivo de contar
        // "días sin pago" en bruto para semanal/quincenal/mensual). La cuota del
        // convenio activo cuenta como parte de lo exigido del período.
        const convenioAct = convenios.find(cv => cv.contrato_id === c.id && cv.estado === "activo") ?? null;
        const cuotaConvenio = cuotaConvenioDelPeriodo(convenioAct, c, hoyDate);
        const periodoCubierto = !!(convenioAct?.cubre_periodo_hasta && convenioAct.cubre_periodo_hasta >= hoyISOStr);
        if (calcularEstadoCartera(c, pagosC, hoyDate, cuotaConvenio, periodoCubierto) !== "mora") return [];
        const dias = diasEnMora(c, pagosC, hoyDate, cuotaConvenio, periodoCubierto);

        const cliente = clientes.find(cl => cl.id === c.cliente_id);
        const moto    = motos.find(m => m.id === c.moto_id);
        const tarifa  = c.tarifa_diaria ?? 27000;
        const ultimo = pagosC[0];

        // Deuda REAL, sin estimaciones: deuda ya registrada + lo que falta de la cuota del
        // período actual (número exacto), igual que Cartera. No se multiplica días×tarifa.
        // Solo deuda EXIGIBLE (pendiente) — las 'en_convenio' se cobran vía la cuota del convenio.
        const deudaRegistrada = deudas
          .filter(d => d.contrato_id === c.id && d.estado === "pendiente")
          .reduce((acc, d) => acc + d.monto_pendiente, 0);
        const enProrrateo = estaEnProrrateo(c, pagosC.length === 0);
        const cuotaPactada = c.forma_pago === "Diario"
          ? calcularCuotaDia(c.tarifa_diaria ?? 27000, hoyDate.getDay() === 0, c.tarifa_domingo)
          : enProrrateo ? calcularProrrateoInicial(c) : valorPeriodoReal(c);
        const pagadoPeriodo = c.forma_pago === "Diario"
          ? pagosC.filter(p => p.fecha === hoyISOStr).reduce((acc, p) => acc + p.valor, 0)
          : totalPagadoPeriodoActual(c, pagosC, hoyDate);
        const cuotaPendiente = Math.max(cuotaPactada - pagadoPeriodo, 0);
        const deudaReal = deudaRegistrada + cuotaPendiente;

        const gestionesC = gestiones
          .filter(g => g.contrato_id === c.id)
          .sort((a, b) => b.fecha.localeCompare(a.fecha));
        const ultimaG = gestionesC[0] ?? null;
        const tieneRecoleccion = gestionesC.some(g => g.tipo === "recoleccion");

        // Gestiones de ESTA mora (desde el último pago, o desde siempre si nunca pagó) —
        // para no contar mensaje/llamada/sirena de un ciclo de mora anterior ya resuelto.
        const desde = ultimo?.fecha ?? "0000-00-00";
        const gestionesEstaModa = gestionesC.filter(g => g.fecha >= desde);
        const pasosPrevios = {
          mensaje: gestionesEstaModa.some(g => g.tipo === "whatsapp" || g.tipo === "mensaje_recordatorio"),
          llamada: gestionesEstaModa.some(g => g.tipo === "llamada"),
          sirena: gestionesEstaModa.some(g => g.tipo === "sirena"),
        };

        return [{
          contratoId: c.id,
          clienteId: c.cliente_id,
          clienteNombre: cliente?.nombre ?? "Sin nombre",
          clienteTel: cliente?.whatsapp ?? cliente?.telefono ?? "",
          motoId: c.moto_id ?? null,
          placa: moto?.placa ?? "Sin placa",
          marca: moto?.marca ?? "",
          modelo: moto?.modelo ?? "",
          diasMora: dias,
          deudaReal,
          tarifa,
          ultimoPago: ultimo?.fecha ?? null,
          prioridad: (dias >= 10 ? "critica" : dias >= 5 ? "alta" : "media") as Prioridad,
          ultimaGestion: ultimaG?.fecha ?? null,
          tipoUltimaGestion: ultimaG?.tipo ?? null,
          recoleccionOrdenada: tieneRecoleccion,
          pasosPrevios,
        }];
      })
      .sort((a, b) => b.diasMora - a.diasMora);
  }, [contratos, clientes, motos, pagos, gestiones, convenios, deudas, hoy]);

  // Recovery count this week
  const recuperadasSemana = useMemo(() => {
    return gestiones.filter(
      g => g.tipo === "recoleccion" && g.fecha >= inicioSemana
    ).length;
  }, [gestiones, inicioSemana]);

  const resumen = useMemo(() => ({
    total:       filas.length,
    critica:     filas.filter(f => f.prioridad === "critica").length,
    alta:        filas.filter(f => f.prioridad === "alta").length,
    media:       filas.filter(f => f.prioridad === "media").length,
    deudaTotal:  filas.reduce((a, f) => a + f.deudaReal, 0),
    recoleccion: filas.filter(f => f.recoleccionOrdenada).length,
  }), [filas]);

  const filtradas = useMemo(() => {
    let lista = filas;
    if (filtro === "criticos")   lista = lista.filter(f => f.prioridad === "critica");
    if (filtro === "critica")    lista = lista.filter(f => f.prioridad === "critica");
    if (filtro === "alta")       lista = lista.filter(f => f.prioridad === "alta");
    if (filtro === "media")      lista = lista.filter(f => f.prioridad === "media");
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(f => f.clienteNombre.toLowerCase().includes(q) || f.placa.toLowerCase().includes(q));
    }
    return lista;
  }, [filas, busqueda, filtro]);

  // ── Motos retenidas — datos reales de BD (contrato Suspendido + moto Recuperada) ──
  type MotoRetenida = {
    contratoId: string;
    clienteId: string;
    clienteNombre: string;
    clienteTel: string;
    motoId: string | null;
    placa: string;
    marca: string;
    modelo: string;
    deudasPendientes: { id: string; concepto: string; descripcion: string; monto_pendiente: number }[];
    totalPendiente: number;      // solo deudas registradas (multa, etc.)
    cuotasAtrasadas: number;     // cuotas del período sin pagar (ledger FIFO)
    totalRecuperar: number;      // deudas + cuotas atrasadas → lo que debe para recuperar la moto
    motorV2: boolean;
    convenioId: string | null;
    diasRetenida: number;
    listaParaLiquidar: boolean;
    ahorroAcumulado: number;
    esTemporal: boolean; // guardada por incapacidad/entrega voluntaria (NO moroso)
    enTaller: boolean;   // físicamente en taller (moto Mantenimiento)
    categoria: "mora" | "temporal" | "taller";
    soloInfoTaller: boolean; // varada con contrato Activo → solo info, sin acciones de recuperación
    formaPago: string;   // Diario / Semanal / Quincenal / Mensual — define préstamo vs liquidar+reasignar
  };

  const motosRetenidas: MotoRetenida[] = useMemo(() => {
    const hoyMs = Date.now();
    return contratos
      // Fuera de servicio: contratos Suspendidos (mora/temporal) + Activos cuya moto está
      // en taller (varada). Así el panel es el "pool" de todo lo que no está produciendo.
      .filter(c => {
        if (c.estado === "Suspendido") return true;
        if (c.estado === "Activo") return motos.find(m => m.id === c.moto_id)?.estado === "Mantenimiento";
        return false;
      })
      .map(c => {
        const cliente = clientes.find(cl => cl.id === c.cliente_id);
        const moto = motos.find(m => m.id === c.moto_id);
        const enTaller = moto?.estado === "Mantenimiento";
        // Solo deuda EXIGIBLE (pendiente): la multa sí bloquea la entrega; lo 'en_convenio'
        // ya quedó financiado y se paga con la cuota del convenio (no se exige doble).
        const deudasC = deudas.filter(d => d.contrato_id === c.id && d.estado === "pendiente");
        // Días retenida: desde la última gestión de recolección registrada.
        // A los 7 días sin pago se habilita liquidar (decisión del ADMIN, no automática).
        const recoleccionG = gestiones
          .filter(g => g.contrato_id === c.id && g.tipo === "recoleccion")
          .sort((a, b) => b.fecha.localeCompare(a.fecha))[0] ?? null;
        const diasRetenida = recoleccionG
          ? Math.floor((hoyMs - new Date(recoleccionG.fecha + "T00:00:00").getTime()) / 86400000)
          : 0;
        const totalDeudas = deudasC.reduce((acc, d) => acc + d.monto_pendiente, 0);
        // Cuotas atrasadas: para recuperar la moto debe ponerse al día con las cuotas (el
        // tiempo retenido se cobra igual) + la multa. Motor v2 → hueco del ledger FIFO;
        // los pocos sin motor → cuota del período menos lo pagado.
        const motorV2 = !!c.motor_v2 && c.forma_pago !== "Diario";
        let cuotasAtrasadas = 0;
        if (motorV2) {
          cuotasAtrasadas = huecoCuotasHoy(c, hoyDateFn());
        } else if (c.forma_pago !== "Diario") {
          const confirmados = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado");
          cuotasAtrasadas = Math.max(valorPeriodoReal(c) - totalPagadoPeriodoActual(c, confirmados, hoyDateFn()), 0);
        }
        const convenioAct = convenios.find(cv => cv.contrato_id === c.id && cv.estado === "activo") ?? null;
        return {
          contratoId: c.id,
          clienteId: c.cliente_id,
          clienteNombre: cliente?.nombre ?? "Sin nombre",
          clienteTel: cliente?.whatsapp ?? cliente?.telefono ?? "",
          motoId: c.moto_id ?? null,
          placa: moto?.placa ?? "Sin placa",
          marca: moto?.marca ?? "",
          modelo: moto?.modelo ?? "",
          deudasPendientes: deudasC.map(d => ({ id: d.id, concepto: d.concepto, descripcion: d.descripcion, monto_pendiente: d.monto_pendiente })),
          totalPendiente: totalDeudas,
          cuotasAtrasadas,
          totalRecuperar: totalDeudas + cuotasAtrasadas,
          motorV2,
          convenioId: convenioAct?.id ?? null,
          diasRetenida,
          listaParaLiquidar: diasRetenida >= 7,
          ahorroAcumulado: c.ahorro_acumulado ?? 0,
          esTemporal: c.motivo_suspension === "temporal",
          enTaller,
          categoria: (enTaller ? "taller" : (c.motivo_suspension === "temporal" ? "temporal" : "mora")) as "mora" | "temporal" | "taller",
          soloInfoTaller: enTaller && c.estado === "Activo",
          formaPago: c.forma_pago ?? "",
        };
      })
      // Agrupa visualmente por categoría: mora → temporal → taller.
      .sort((a, b) => ["mora", "temporal", "taller"].indexOf(a.categoria) - ["mora", "temporal", "taller"].indexOf(b.categoria));
  }, [contratos, clientes, motos, deudas, gestiones, pagos, convenios]);

  // Cobro para recuperar: registra el pago sobre el contrato suspendido (la BD reparte con
  // FIFO: primero cuotas atrasadas, luego la multa). Al quedar la deuda de recuperación en
  // $0, el botón "Devolver moto" se habilita solo.
  const [cobroRec, setCobroRec] = useState<MotoRetenida | null>(null);
  const [cobroMonto, setCobroMonto] = useState("");
  const [cobroProc, setCobroProc] = useState(false);
  const [cobroErr, setCobroErr] = useState<string | null>(null);
  const [convenioRec, setConvenioRec] = useState<MotoRetenida | null>(null);
  const [entregaRec, setEntregaRec] = useState<MotoRetenida | null>(null);
  // Resolver tiempo (cobrar/rodar): reusado por TEMA A (reactivar temporal) y TEMA B (devolver préstamo).
  const [resolverRec, setResolverRec] = useState<{ contratoId: string; placa: string; clienteNombre: string; fechaEntrada: string } | null>(null);
  // Prestar reemplazo a un cliente cuya moto está varada (soloInfoTaller).
  const [prestarRec, setPrestarRec] = useState<MotoRetenida | null>(null);
  const [prestamoProc, setPrestamoProc] = useState<string | null>(null);

  async function cobrarAlquiler(prestamoId: string, contratoId: string, monto: number) {
    if (prestamoProc || !profile) return;
    if (!confirm(`¿Cobrar el alquiler de reemplazo de $${fmt(monto)} (efectivo)?`)) return;
    setPrestamoProc(prestamoId);
    try {
      // El trigger IGNORA alquiler_reemplazo (mig 053): no toca el ledger, solo entra a caja.
      await registrarPago(contratoId, monto, "Efectivo", APLICADO_LO_REPARTE_LA_BD, { tipoRegistro: "alquiler_reemplazo", registradoPor: profile.id });
    } finally { setPrestamoProc(null); }
  }

  async function handleDevolverPrestamo(prestamoId: string) {
    if (prestamoProc) return;
    if (!confirm("¿La moto propia ya salió del taller? Se devuelve la prestada al pool y el contrato vuelve a su placa original.")) return;
    setPrestamoProc(prestamoId);
    try {
      const p = prestamos.find(x => x.id === prestamoId);
      const { error } = await devolverReemplazo(prestamoId);
      if (error) { alert("Error al devolver el préstamo: " + error); return; }
      // F4: resolver el tiempo que su moto estuvo en taller (cobrar / rodar con doc firmado).
      // Como pagó alquiler mientras trabajaba en la prestada, lo normal es rodar; decide el admin.
      if (esAdmin && p) {
        const cont = contratos.find(c => c.id === p.contrato_id);
        const cli = cont ? clientes.find(cl => cl.id === cont.cliente_id) : null;
        const motoO = p.moto_original_id ? motos.find(m => m.id === p.moto_original_id) : null;
        if (cont) setResolverRec({ contratoId: p.contrato_id, placa: motoO?.placa ?? "", clienteNombre: cli?.nombre ?? "", fechaEntrada: p.fecha_inicio });
      }
    } finally { setPrestamoProc(null); }
  }

  // Fecha en que se guardó la moto (última recepción del contrato) — para calcular los
  // días guardados al resolver el tiempo de una temporal.
  const fechaGuardado = (contratoId: string) => {
    const rec = recepciones
      .filter(r => r.contrato_id === contratoId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    return rec ? rec.created_at.slice(0, 10) : hoyISO();
  };

  // Puede entregarse la moto cuando: la MULTA (y deudas registradas) está paga Y las
  // cuotas atrasadas están pagas O financiadas por un convenio activo. La multa es el
  // mínimo obligatorio; lo atrasado puede quedar en convenio. Las TEMPORAL no son morosas:
  // se pueden reactivar siempre (el tiempo guardado se resuelve aparte con cobrar/rodar).
  const puedeEntregar = (m: MotoRetenida) =>
    m.esTemporal || (m.totalPendiente <= 0 && (m.cuotasAtrasadas <= 0 || m.convenioId != null));

  async function handleCobrarRecuperar() {
    if (!cobroRec || cobroProc || !profile) return;
    const monto = Number(cobroMonto) || 0;
    if (monto <= 0) { setCobroErr("Ingresa un valor válido."); return; }
    if (!confirm(`¿Registrar pago en efectivo de $${fmt(monto)} de ${cobroRec.clienteNombre} para recuperar la moto ${cobroRec.placa}?`)) return;
    setCobroProc(true); setCobroErr(null);
    try {
      // Regla de recuperación: la MULTA (y deudas registradas) se cubren PRIMERO — es el
      // mínimo para llevarse la moto — luego las cuotas atrasadas; el excedente queda como
      // saldo a favor. La BD respeta este reparto explícito (no vuelve a repartir con FIFO),
      // así que funciona igual para motor v2 y v1. El ahorro se calcula tarifa-primero.
      const c = contratos.find(x => x.id === cobroRec.contratoId);
      let resto = monto;
      const aDeuda = Math.min(resto, cobroRec.totalPendiente); resto -= aDeuda;
      const aTarifa = Math.min(resto, cobroRec.cuotasAtrasadas); resto -= aTarifa;
      const aSaldo = resto;
      const aAhorro = c ? calcularAhorroAplicado(c, aTarifa, false, c.caja_actual_pagado ?? 0) : 0;
      const aplicado = { tarifa: aTarifa, baseInicial: 0, deuda: aDeuda, convenio: 0, ahorro: aAhorro, saldo: aSaldo };
      const { error } = await registrarPago(
        cobroRec.contratoId, monto, "Efectivo", aplicado,
        { registradoPor: profile.id },
      );
      if (error) { setCobroErr(error); return; }
      setCobroRec(null); setCobroMonto("");
    } finally {
      setCobroProc(false);
    }
  }

  // Al entregar la moto se abre el formulario de entrega (fotos + km + persona que recibe);
  // ese formulario reactiva el contrato al guardar. Aquí solo validamos el mínimo.
  function handleAbrirEntrega(m: MotoRetenida) {
    if (procesandoId) return;
    if (!puedeEntregar(m)) {
      alert(`Para entregar la moto ${m.placa}: primero se debe pagar la multa/deudas ($${fmt(m.totalPendiente)}) y las cuotas atrasadas o dejarlas en un convenio. Usa "💵 Cobrar" o "📝 Convenio".`);
      return;
    }
    setEntregaRec(m);
  }

  // Reasignar la moto ahora pasa por Liquidación (motivo incumplimiento): calcula el
  // saldo real, trae deudas automáticas, revisión de taller obligatoria, documento
  // firmado — ya no un simple finalizarContrato() sin dejar rastro de la cuenta.
  const [liquidacionModal, setLiquidacionModal] = useState<MotoRetenida | null>(null);

  function abrirWA(tel: string, nombre: string, dias: number, placa: string, valor: number) {
    if (!tel) return;
    // Inmovilizaciones = último aviso antes de recoger la moto. Plantilla editable en Config.
    const texto = renderMsg("recoleccion", {
      nombre,
      placa,
      dias,
      valor: `$${Math.round(valor).toLocaleString("es-CO")}`,
    });
    const num = tel.replace(/\D/g, "");
    window.open(`https://wa.me/${num.startsWith("57") ? num : `57${num}`}?text=${encodeURIComponent(texto)}`, "_blank");
  }

  const filtroBtns: { key: FiltroP; label: string; count: number }[] = [
    { key: "todos",      label: "Todos",       count: filas.length },
    { key: "criticos",   label: "Críticos",    count: resumen.critica },
    { key: "en_proceso", label: "En proceso",  count: resumen.recoleccion },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 22, margin: 0, fontWeight: 900, color: "#0f172a" }}>Inmovilizaciones</h2>
        <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 14 }}>
          Motos retenidas y contratos en mora real — gestión de recuperación
        </p>
      </div>

      {/* KPI header cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <div onClick={() => setTab("en_mora")} style={{ background: "#fee2e2", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", cursor: "pointer" }}>
          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>Mora crítica (+3d)</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#991b1b", lineHeight: 1.1, marginTop: 6 }}>{resumen.total}</div>
          <div style={{ fontSize: 11, color: "#991b1b", fontWeight: 700, marginTop: 2 }}>{resumen.critica} críticos (+10d)</div>
        </div>
        <div onClick={() => setTab("en_mora")} style={{ background: "#fef3c7", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", cursor: "pointer" }}>
          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>En proceso recolección</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#92400e", lineHeight: 1.1, marginTop: 6 }}>{resumen.recoleccion}</div>
          <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700, marginTop: 2 }}>orden activa</div>
        </div>
        <div onClick={() => setTab("retenidas")} style={{ background: "#dcfce7", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", cursor: "pointer" }}>
          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>Recuperadas esta semana</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#166534", lineHeight: 1.1, marginTop: 6 }}>{recuperadasSemana}</div>
          <div style={{ fontSize: 11, color: "#166534", fontWeight: 700, marginTop: 2 }}>motos recuperadas</div>
        </div>
        <div style={{ background: "#fff5f5", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>Deuda real total</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#991b1b", lineHeight: 1.1, marginTop: 6 }}>${fmt(resumen.deudaTotal)}</div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginTop: 2 }}>{filas.length} contratos</div>
        </div>
      </div>

      {/* Tab bar — Retenidas primero (endpoint más consultado) */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {([
          { key: "retenidas", label: "🔒 Retenidas", count: motosRetenidas.length },
          { key: "en_mora",   label: "🔴 En mora",   count: filas.length },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 800,
              background: tab === t.key ? "#0f172a" : "#f1f5f9",
              color: tab === t.key ? "white" : "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {t.label}
            <span style={{
              background: tab === t.key ? "rgba(255,255,255,0.2)" : "#e2e8f0",
              borderRadius: 999, fontSize: 12, fontWeight: 900, padding: "1px 8px",
              color: tab === t.key ? "white" : "#64748b",
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "en_mora" && (<>
      {/* GPS notice */}
      <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 12, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 12, color: "#92400e", display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ fontSize: 16 }}>📡</span>
        <span>
          <strong>GPS no integrado.</strong> Sirena (máx. 10s) y apagado remoto (máx. 1h) disponibles al integrar la plataforma GPS.{" "}
          <strong>Solo con vehículo detenido.</strong>
        </span>
      </div>

      {/* Filters + search */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {filtroBtns.map(btn => (
            <button
              key={btn.key}
              onClick={() => setFiltro(btn.key)}
              style={{
                padding: "6px 14px", borderRadius: 999, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 700,
                background: filtro === btn.key ? "#0f172a" : "#f1f5f9",
                color: filtro === btn.key ? "white" : "#64748b",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              {btn.label}
              <span style={{
                background: filtro === btn.key ? "rgba(255,255,255,0.2)" : "#e2e8f0",
                borderRadius: 999, fontSize: 10, fontWeight: 900,
                padding: "1px 6px",
                color: filtro === btn.key ? "white" : "#64748b",
              }}>{btn.count}</span>
            </button>
          ))}
        </div>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar cliente o placa..."
          style={{ flex: 1, minWidth: 180, padding: "7px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}
        />
      </div>

      {/* Empty state */}
      {filas.length === 0 && (
        <div style={{ background: "white", borderRadius: 16, padding: "52px 24px", textAlign: "center", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>✅</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Sin motos en mora</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>Todos los contratos están al día</div>
        </div>
      )}

      {/* Main list */}
      <div style={{ display: "grid", gap: 10, marginBottom: 28 }}>
        {filtradas.map(f => {
          const s = PRIO[f.prioridad];
          const abierto = expandido === f.contratoId;

          return (
            <div key={f.contratoId} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: isMobile ? "wrap" : "nowrap" }}>
                  {/* Info column */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      {onNavigate && f.motoId
                        ? <button onClick={() => onNavigate("ficha_moto", f.motoId!)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 900, fontSize: 16, color: "#0284c7", textDecoration: "underline" }}>{f.placa}</button>
                        : <span style={{ fontWeight: 900, fontSize: 16, color: "#0f172a" }}>{f.placa}</span>
                      }
                      <span style={{ color: "#cbd5e1" }}>·</span>
                      {onNavigate
                        ? <button onClick={() => onNavigate("ficha_cliente", f.clienteId)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 800, fontSize: 15, color: "#0f172a", textTransform: "uppercase" }}>{f.clienteNombre}</button>
                        : <span style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase" }}>{f.clienteNombre}</span>
                      }
                      <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: s.border, color: s.color }}>
                        {s.icon} {s.label}
                      </span>
                      {f.recoleccionOrdenada && (
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: "#fee2e2", color: "#991b1b" }}>
                          🚔 Recolección
                        </span>
                      )}
                    </div>

                    {(f.marca || f.modelo) && (
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{f.marca} {f.modelo}</div>
                    )}
                    {f.clienteTel && (
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>📞 {f.clienteTel}</div>
                    )}

                    {/* Metrics row */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
                      <div>
                        <div style={{ fontSize: 34, fontWeight: 900, color: s.color, lineHeight: 1 }}>
                          {f.diasMora}
                        </div>
                        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>días de mora</div>
                      </div>
                      <div style={{ borderLeft: `2px solid ${s.border}`, paddingLeft: 14 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>${fmt(f.deudaReal)}</div>
                        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>deuda real</div>
                      </div>
                      <div style={{ borderLeft: `2px solid ${s.border}`, paddingLeft: 14 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>${fmt(f.tarifa)}/día</div>
                        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>tarifa</div>
                      </div>
                      {f.ultimoPago && (
                        <div style={{ borderLeft: `2px solid ${s.border}`, paddingLeft: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{fmtFecha(f.ultimoPago)}</div>
                          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>último pago</div>
                        </div>
                      )}
                      {f.ultimaGestion ? (
                        <div style={{ borderLeft: `2px solid ${s.border}`, paddingLeft: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{fmtFecha(f.ultimaGestion)}</div>
                          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>última gestión · {f.tipoUltimaGestion}</div>
                        </div>
                      ) : (
                        <div style={{ borderLeft: `2px solid ${s.border}`, paddingLeft: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#991b1b" }}>Sin gestiones</div>
                          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>requiere acción</div>
                        </div>
                      )}
                    </div>

                    {/* Urgency bar */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ height: 5, borderRadius: 999, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 999,
                          width: `${Math.min(100, (f.diasMora / 14) * 100)}%`,
                          background: f.prioridad === "critica" ? "#ef4444" : f.prioridad === "alta" ? "#f59e0b" : "#f97316",
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, textAlign: "right" }}>
                        {`${f.diasMora} / 14 días en mora`}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: 5, flexShrink: isMobile ? 1 : 0, flexWrap: "wrap", minWidth: 0 }}>
                    {f.clienteTel && (
                      <>
                        <button
                          onClick={() => window.open(`tel:+57${f.clienteTel.replace(/\D/g, "")}`)}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dbeafe", color: "#1d4ed8" }}
                        >
                          📞 Llamar
                        </button>
                        <button
                          onClick={() => abrirWA(f.clienteTel, f.clienteNombre, f.diasMora, f.placa, f.deudaReal)}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dcfce7", color: "#166534" }}
                        >
                          💬 WA
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => { setGestionId(f.contratoId); setGestionNombre(f.clienteNombre); setGestionPasosPrevios(f.pasosPrevios); }}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}
                    >
                      📋 Gestión
                    </button>
                    {onNavigate && (
                      <>
                        <button
                          onClick={() => onNavigate("ficha_cliente", f.clienteId)}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#eff6ff", color: "#0284c7" }}
                        >
                          👤 Ficha
                        </button>
                        {f.motoId && (
                          <button
                            onClick={() => onNavigate("ficha_moto", f.motoId!)}
                            style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#f0fdf4", color: "#166534" }}
                          >
                            🏍️ Moto
                          </button>
                        )}
                      </>
                    )}
                    <button
                      disabled
                      title="Requiere GPS — solo con vehículo detenido, máx. 10s"
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "not-allowed", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#94a3b8", opacity: 0.5 }}
                    >
                      📡 Sirena
                    </button>
                    <button
                      disabled
                      title="Requiere GPS — solo con vehículo detenido, máx. 1h"
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "not-allowed", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#94a3b8", opacity: 0.5 }}
                    >
                      🔴 Apagar
                    </button>
                    <button
                      onClick={() => setExpandido(abierto ? null : f.contratoId)}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#334155" }}
                    >
                      {abierto ? "▲ Cerrar" : "▼ Protocolo"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Protocol panel */}
              {abierto && (
                <div style={{ borderTop: `1px solid ${s.border}`, padding: "14px 16px", background: "rgba(255,255,255,0.7)" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    Protocolo de mora
                  </div>
                  <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                    Mensaje → Llamada → Apagado/Recolección — disponibles desde el primer día de mora. El funcionario escala
                    según si logra contacto o hay pago, pudiendo pasar los 3 pasos el mismo día. La recolección física se
                    ejecuta desde el Panel Hoy de Cartera.
                  </div>
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "white", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12, color: "#64748b" }}>
                    <strong style={{ color: "#0f172a" }}>Regla GPS:</strong> Sirena máx. 10 seg · Apagado máx. 1 hora · Solo vehículo{" "}
                    <strong>detenido</strong> · Recolección siempre con acompañamiento policial.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      </>)}

      {tab === "retenidas" && (<>
      {/* Motos retenidas — datos reales (contrato Suspendido + moto Recuperada) */}
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ fontSize: 18, margin: "0 0 4px", fontWeight: 900, color: "#0f172a" }}>🔒 Motos retenidas</h3>
        <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
          Motos fuera de servicio, en poder de la empresa — por mora, entregadas temporal, o en taller.
        </p>
      </div>

      {/* Filtros: mora / temporal / taller / todas */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {([
          { key: "todas",    label: "Todas",         count: motosRetenidas.length },
          { key: "mora",     label: "🔴 Mora",       count: motosRetenidas.filter(m => m.categoria === "mora").length },
          { key: "temporal", label: "🅿️ Temporal",   count: motosRetenidas.filter(m => m.categoria === "temporal").length },
          { key: "taller",   label: "🔧 Taller",     count: motosRetenidas.filter(m => m.categoria === "taller").length },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setFiltroRet(f.key)} style={{
            padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
            background: filtroRet === f.key ? "#0f172a" : "#f1f5f9", color: filtroRet === f.key ? "white" : "#64748b",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            {f.label}
            <span style={{ background: filtroRet === f.key ? "rgba(255,255,255,0.2)" : "#e2e8f0", borderRadius: 999, fontSize: 10, fontWeight: 900, padding: "1px 6px", color: filtroRet === f.key ? "white" : "#64748b" }}>{f.count}</span>
          </button>
        ))}
      </div>

      {(filtroRet === "todas" ? motosRetenidas : motosRetenidas.filter(m => m.categoria === filtroRet)).length === 0 ? (
        <div style={{ background: "white", borderRadius: 16, padding: "32px 24px", textAlign: "center", boxShadow: "0 2px 8px rgba(15,23,42,0.06)", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔓</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>No hay motos retenidas</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10, marginBottom: 28 }}>
          {(filtroRet === "todas" ? motosRetenidas : motosRetenidas.filter(m => m.categoria === filtroRet)).map(m => {
            const entregable = puedeEntregar(m);
            const faltaMulta = m.totalPendiente > 0;
            const puedeHacerConvenio = !m.soloInfoTaller && !m.esTemporal && m.cuotasAtrasadas > 0 && m.convenioId == null;
            const procesandoEsta = procesandoId === m.contratoId;
            return (
              <div key={m.contratoId} style={{ background: m.esTemporal ? "#f0f9ff" : "#fff5f5", border: `2px solid ${m.esTemporal ? "#bae6fd" : "#fecaca"}`, borderRadius: 16, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 900, fontSize: 15, textTransform: "uppercase", color: "#0f172a" }}>
                      {m.placa} · {m.clienteNombre}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{m.marca} {m.modelo}</div>
                    <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
                      {m.deudasPendientes.length === 0 ? (
                        <span style={{ fontSize: 12, color: "#166534", fontWeight: 700 }}>✓ Sin deudas pendientes</span>
                      ) : m.deudasPendientes.map(d => (
                        <div key={d.id} style={{ fontSize: 12, color: "#991b1b" }}>
                          {d.concepto === "multa_recoleccion" ? "Multa por recolección/inmovilización" : d.descripcion}: <strong>${fmt(d.monto_pendiente)}</strong>
                        </div>
                      ))}
                      {!m.soloInfoTaller && m.cuotasAtrasadas > 0 && (
                        <div style={{ fontSize: 12, color: m.convenioId != null ? "#0369a1" : "#991b1b" }}>
                          Cuotas atrasadas: <strong>${fmt(m.cuotasAtrasadas)}</strong>
                          {m.convenioId != null && <span style={{ fontSize: 11, fontWeight: 700 }}> · 📝 en convenio</span>}
                        </div>
                      )}
                      <div style={{ fontSize: 13, fontWeight: 800, color: m.soloInfoTaller ? "#7c3aed" : m.esTemporal ? "#0369a1" : entregable ? "#166534" : "#991b1b", marginTop: 2 }}>
                        {m.soloInfoTaller
                          ? "🔧 En taller (varada) — se resuelve el tiempo al salir"
                          : m.esTemporal
                            ? "🅿️ Guardada temporal — resolver el tiempo al reactivar"
                            : entregable
                              ? "✓ Listo para entregar"
                              : faltaMulta
                                ? `Mínimo para recuperar (multa/deudas): $${fmt(m.totalPendiente)}`
                                : `Faltan cuotas atrasadas: $${fmt(m.cuotasAtrasadas)} — págalas o deja un convenio`}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                        {m.categoria === "taller"
                          ? <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: "#ede9fe", color: "#7c3aed" }}>🔧 En taller</span>
                          : m.categoria === "temporal"
                            ? <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: "#e0f2fe", color: "#0369a1" }}>🅿️ Guardada temporal (incapacidad)</span>
                            : <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: "#fee2e2", color: "#991b1b" }}>🔴 Por mora / recolección</span>}
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: "#f1f5f9", color: "#334155" }}>
                          ⏳ {m.diasRetenida} día{m.diasRetenida !== 1 ? "s" : ""} retenida
                        </span>
                        {m.listaParaLiquidar && (
                          <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: "#fee2e2", color: "#991b1b" }}>
                            📄 Lista para liquidar (7+ días)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                    {m.clienteTel && (
                      <button
                        onClick={() => window.open(`tel:+57${m.clienteTel.replace(/\D/g, "")}`)}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dbeafe", color: "#1d4ed8" }}
                      >
                        📞 Llamar
                      </button>
                    )}
                    {m.soloInfoTaller && (m.formaPago === "Diario"
                      ? <button
                          onClick={() => setLiquidacionModal(m)}
                          title="Diario varado: liquida este contrato y crea uno nuevo en otra moto trasladando el ahorro"
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 800, background: "#c2410c", color: "white" }}
                        >
                          🔁 Liquidar y reasignar
                        </button>
                      : <button
                          onClick={() => setPrestarRec(m)}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 800, background: "#7c3aed", color: "white" }}
                        >
                          🔄 Prestar reemplazo
                        </button>
                    )}
                    {!m.soloInfoTaller && !entregable && (
                      <button
                        onClick={() => { setCobroRec(m); setCobroMonto(String(faltaMulta ? m.totalPendiente : m.totalRecuperar)); setCobroErr(null); }}
                        disabled={procesandoEsta}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 800, background: "#166534", color: "white" }}
                      >
                        💵 Cobrar
                      </button>
                    )}
                    {puedeHacerConvenio && puedeCrearConvenio && (
                      <button
                        onClick={() => setConvenioRec(m)}
                        disabled={procesandoEsta}
                        title="Financiar las cuotas atrasadas en un convenio (pide lo máximo que pueda dar; el mínimo para llevarse la moto es la multa)"
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 800, background: "#0369a1", color: "white" }}
                      >
                        📝 Convenio
                      </button>
                    )}
                    {!m.soloInfoTaller && (
                      <button
                        onClick={() => handleAbrirEntrega(m)}
                        disabled={!entregable || procesandoEsta}
                        title={!entregable ? `Falta el mínimo (multa) o dejar lo atrasado en convenio para poder entregar` : "Abre el formulario de entrega con fotos"}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: (!entregable || procesandoEsta) ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, background: entregable ? "#dcfce7" : "#f1f5f9", color: entregable ? "#166534" : "#94a3b8", opacity: procesandoEsta ? 0.6 : 1 }}
                      >
                        {procesandoEsta ? "Procesando..." : m.esTemporal ? "✓ Reactivar / entregar" : "✓ Entregar moto"}
                      </button>
                    )}
                    {esAdmin && puedeLiquidar && (
                      <button
                        onClick={() => setLiquidacionModal(m)}
                        disabled={procesandoEsta || !m.listaParaLiquidar}
                        title={!m.listaParaLiquidar ? `Se habilita a los 7 días retenida (lleva ${m.diasRetenida})` : ""}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: (procesandoEsta || !m.listaParaLiquidar) ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, background: m.listaParaLiquidar ? "#fef3c7" : "#f1f5f9", color: m.listaParaLiquidar ? "#92400e" : "#94a3b8", opacity: procesandoEsta ? 0.6 : 1 }}
                      >
                        {m.listaParaLiquidar ? "📄 Iniciar liquidación" : "🔒 Liquidar (a los 7d)"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Préstamos activos: cobrar el alquiler diario y devolver cuando la moto salga de taller */}
      {prestamos.filter(p => p.estado === "activo").length > 0 && (
        <div style={{ marginTop: 8, marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, margin: "0 0 8px", fontWeight: 900, color: "#0f172a" }}>🔄 Préstamos activos</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {prestamos.filter(p => p.estado === "activo").map(p => {
              const cont = contratos.find(c => c.id === p.contrato_id);
              const cli = cont ? clientes.find(cl => cl.id === cont.cliente_id) : null;
              const motoP = motos.find(m => m.id === p.moto_prestada_id);
              const motoO = p.moto_original_id ? motos.find(m => m.id === p.moto_original_id) : null;
              const proc = prestamoProc === p.id;
              return (
                <div key={p.id} style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 14, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", textTransform: "uppercase" }}>{cli?.nombre ?? "—"}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      Anda en <strong>{motoP?.placa ?? "?"}</strong> (prestada) · su moto <strong>{motoO?.placa ?? "?"}</strong> en taller · desde {p.fecha_inicio}
                    </div>
                    <div style={{ fontSize: 12, color: "#7c3aed", fontWeight: 700, marginTop: 2 }}>Alquiler: ${fmt(p.tarifa_dia)}/día</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                    <button onClick={() => cobrarAlquiler(p.id, p.contrato_id, p.tarifa_dia)} disabled={proc}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 800, background: "#166534", color: "white", opacity: proc ? 0.6 : 1 }}>
                      💵 Cobrar alquiler
                    </button>
                    <button onClick={() => handleDevolverPrestamo(p.id)} disabled={proc}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dcfce7", color: "#166534", opacity: proc ? 0.6 : 1 }}>
                      ✓ Devolver (salió de taller)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </>)}

      {gestionId && (
        <ModalGestion
          contratoId={gestionId}
          clienteNombre={gestionNombre}
          pasosPrevios={gestionPasosPrevios}
          onClose={() => { setGestionId(null); setGestionPasosPrevios(undefined); }}
        />
      )}

      {liquidacionModal && (
        <ModalIniciarLiquidacion
          contratoId={liquidacionModal.contratoId}
          clienteId={liquidacionModal.clienteId}
          clienteNombre={liquidacionModal.clienteNombre}
          motoId={liquidacionModal.motoId}
          placa={liquidacionModal.placa}
          ahorroAcumulado={liquidacionModal.ahorroAcumulado}
          motivoInicial="incumplimiento"
          onClose={() => setLiquidacionModal(null)}
        />
      )}

      {/* Cobro para recuperar la moto retenida */}
      {cobroRec && (
        <>
          <div onClick={() => !cobroProc && setCobroRec(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 400 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(420px,94vw)", background: "white", borderRadius: 18, padding: 22, zIndex: 401, boxShadow: "0 20px 60px rgba(15,23,42,0.28)", boxSizing: "border-box" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>💵 Cobrar para recuperar</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14, textTransform: "uppercase" }}>{cobroRec.placa} · {cobroRec.clienteNombre}</div>

            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "10px 12px", marginBottom: 14, fontSize: 13, color: "#991b1b", fontWeight: 700 }}>
              Debe para recuperar: <strong>${fmt(cobroRec.totalRecuperar)}</strong>
              <div style={{ fontSize: 12, fontWeight: 400, marginTop: 2 }}>
                {cobroRec.cuotasAtrasadas > 0 && `Cuotas atrasadas $${fmt(cobroRec.cuotasAtrasadas)}`}
                {cobroRec.cuotasAtrasadas > 0 && cobroRec.totalPendiente > 0 && " · "}
                {cobroRec.totalPendiente > 0 && `Multa/deuda $${fmt(cobroRec.totalPendiente)}`}
              </div>
            </div>

            <MoneyInput label="Valor recibido (efectivo)" value={cobroMonto} onChange={setCobroMonto} />
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>El pago cubre primero la <strong>multa/deudas</strong> (mínimo para llevarse la moto) y luego las cuotas atrasadas. Pídele lo máximo que pueda dar; lo que quede de atrasado se puede dejar en un convenio (botón 📝 Convenio).</div>

            {cobroErr && <div style={{ color: "#991b1b", fontWeight: 600, fontSize: 13, marginTop: 8 }}>{cobroErr}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setCobroRec(null)} disabled={cobroProc} style={{ flex: 1, padding: 11, borderRadius: 12, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#334155" }}>Cancelar</button>
              <button onClick={handleCobrarRecuperar} disabled={cobroProc} style={{ flex: 2, padding: 11, borderRadius: 12, border: "none", background: "#166534", color: "white", cursor: "pointer", fontWeight: 800, fontSize: 14, opacity: cobroProc ? 0.6 : 1 }}>
                {cobroProc ? "Registrando..." : "Registrar pago"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Convenio para financiar las cuotas atrasadas de una moto retenida */}
      {convenioRec && (
        <ModalConvenio
          contratoId={convenioRec.contratoId}
          clienteNombre={convenioRec.clienteNombre}
          metaFija={convenioRec.cuotasAtrasadas}
          motivoInicial="Convenio para recuperar moto retenida"
          onClose={() => setConvenioRec(null)}
        />
      )}

      {/* Formulario de entrega al devolver la moto retenida ya paga */}
      {entregaRec && (
        <ModalEntregaDevolucion
          contratoId={entregaRec.contratoId}
          clienteId={entregaRec.clienteId}
          clienteNombre={entregaRec.clienteNombre}
          motoId={entregaRec.motoId}
          placa={entregaRec.placa}
          onClose={() => setEntregaRec(null)}
          onDone={() => { if (entregaRec.esTemporal && esAdmin) setResolverRec({ contratoId: entregaRec.contratoId, placa: entregaRec.placa, clienteNombre: entregaRec.clienteNombre, fechaEntrada: fechaGuardado(entregaRec.contratoId) }); }}
        />
      )}

      {/* Prestar reemplazo a un cliente con moto varada */}
      {prestarRec && (
        <ModalPrestarReemplazo
          contratoId={prestarRec.contratoId}
          motoOriginalId={prestarRec.motoId}
          clienteNombre={prestarRec.clienteNombre}
          placaOriginal={prestarRec.placa}
          onClose={() => setPrestarRec(null)}
        />
      )}

      {/* Al reactivar una TEMPORAL: resolver el tiempo guardado (cobrar / rodar con doc firmado) */}
      {resolverRec && (() => {
        const c = contratos.find(x => x.id === resolverRec.contratoId);
        if (!c) return null;
        return (
          <ModalResolverTiempoFueraServicio
            contrato={c}
            clienteNombre={resolverRec.clienteNombre}
            motoPlaca={resolverRec.placa}
            motivo="Entrega temporal / incapacidad"
            fechaEntrada={resolverRec.fechaEntrada}
            fechaSalida={hoyISO()}
            onClose={() => setResolverRec(null)}
          />
        );
      })()}
    </div>
  );
}
