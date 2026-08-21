import { useMemo, useState, useEffect } from "react";
import type { ViewKey } from "../App";
import { useContratos, ahorroTotal } from "../hooks/useContratos";
import { useMensajesWhatsapp } from "../hooks/useMensajesWhatsapp";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { usePagos, calcularCuotaDia, APLICADO_LO_REPARTE_LA_BD } from "../hooks/usePagos";
import MoneyInput from "../components/MoneyInput";
import { useGestiones } from "../hooks/useGestiones";
import { useDeudas } from "../hooks/useDeudas";
import { useConvenios } from "../hooks/useConvenios";
import { useAuth } from "../contexts/AuthContext";
import { razonParaInmovilizar, RAZON_INMOVILIZAR_LABEL } from "../utils/inmovilizacion";
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
import { Chip } from "../components/atomos";

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
  /** Por qué se puede inmovilizar: mora, gabela o deuda pendiente. */
  razonInmov: import("../utils/inmovilizacion").RazonInmovilizar;
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
  critica: { bg: "var(--bad-soft)", color: "var(--bad-ink)", border: "var(--bad-line)", label: "Crítica",  icon: "🔴" },
  alta:    { bg: "var(--warn-soft2)", color: "var(--warn-ink)", border: "var(--warn-line)", label: "Alta",     icon: "🟠" },
  media:   { bg: "var(--orange-soft)", color: "var(--orange)", border: "var(--orange-soft)", label: "Media",    icon: "🟡" },
};

// "mora" / "gabela" / "deuda" filtran por la RAZÓN por la que se puede inmovilizar. Existen desde
// que gabela y deuda también habilitan: sin ellos, la lista de persecución pasaba de ~35 a ~195 de
// un día para otro y el KPI "mora crítica +3d" quedaba contando gente con 0 días de atraso.
type FiltroP = "todos" | "criticos" | "en_proceso" | "mora" | "gabela" | "deuda" | Prioridad;

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
  const { deudas, registrarDeuda } = useDeudas();
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
  // Arranca en "mora" y NO en "todos": esta pantalla es la lista de a quién perseguir, y así la
  // vista por defecto sigue siendo exactamente la de siempre. Los de gabela y los que solo deben
  // están a un toque, pero no inflan la lista de trabajo del día sin que nadie lo decida.
  const [filtro, setFiltro]           = useState<FiltroP>("mora");
  const [expandido, setExpandido]     = useState<string | null>(null);
  // El procesamiento real vive en cada modal (cobro/entrega); aquí solo se lee para deshabilitar.
  const [procesandoId] = useState<string | null>(null);
  // Retenidas primero: es el endpoint que a la práctica más se consulta (de ahí salen las
  // inmovilizadas). "En mora" es la persecución previa a la recolección.
  const [tab, setTab]                 = useState<"retenidas" | "en_mora">("retenidas");
  const [filtroRet, setFiltroRet]     = useState<"todas" | "mora" | "temporal" | "taller">("todas");
  const [busquedaRet, setBusquedaRet] = useState("");

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

        // Entran los que se pueden inmovilizar: en mora, en gabela, o con deuda pendiente.
        // Antes solo entraban los de mora, y por eso un cliente al que ya le habían retenido la
        // moto no aparecía acá para poder registrarlo (caso ISMAEL / RLZ94H, 28-jul).
        // La cuota del convenio activo cuenta como parte de lo exigido del período.
        const convenioAct = convenios.find(cv => cv.contrato_id === c.id && cv.estado === "activo") ?? null;
        const cuotaConvenio = cuotaConvenioDelPeriodo(convenioAct, c, hoyDate);
        const periodoCubierto = !!(convenioAct?.cubre_periodo_hasta && convenioAct.cubre_periodo_hasta >= hoyISOStr);
        const estadoCart = calcularEstadoCartera(c, pagosC, hoyDate, cuotaConvenio, periodoCubierto, convenioAct);
        const deudaPendCalc = deudas
          .filter(d => d.contrato_id === c.id && d.estado === "pendiente")
          .reduce((acc, d) => acc + d.monto_pendiente, 0);
        const razonInmov = razonParaInmovilizar(estadoCart, deudaPendCalc);
        if (!razonInmov) return [];
        // Los días de mora solo tienen sentido si de verdad está en mora; si entró por gabela o
        // por deuda, el contador va en 0 y la tarjeta lo dice por la razón, no por los días.
        const dias = estadoCart === "mora" ? diasEnMora(c, pagosC, hoyDate, cuotaConvenio, periodoCubierto, convenioAct) : 0;

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
          razonInmov,
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

  // Los KPI de arriba hablan de MORA, así que cuentan solo mora real. Si contaran también gabela
  // y deuda, "mora crítica (+3d)" incluiría gente con 0 días de atraso y el número dejaría de
  // significar lo que dice.
  const soloMora = useMemo(() => filas.filter(f => f.razonInmov === "mora"), [filas]);
  const resumen = useMemo(() => ({
    total:       soloMora.length,
    critica:     soloMora.filter(f => f.prioridad === "critica").length,
    alta:        soloMora.filter(f => f.prioridad === "alta").length,
    media:       soloMora.filter(f => f.prioridad === "media").length,
    deudaTotal:  soloMora.reduce((a, f) => a + f.deudaReal, 0),
    recoleccion: soloMora.filter(f => f.recoleccionOrdenada).length,
  }), [soloMora]);

  const filtradas = useMemo(() => {
    let lista = filas;
    if (filtro === "mora")       lista = lista.filter(f => f.razonInmov === "mora");
    if (filtro === "gabela")     lista = lista.filter(f => f.razonInmov === "gabela");
    if (filtro === "deuda")      lista = lista.filter(f => f.razonInmov === "deuda");
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
    grupo: string;
    marca: string;
    modelo: string;
    deudasPendientes: { id: string; concepto: string; descripcion: string; monto_pendiente: number }[];
    totalPendiente: number;      // TODAS las deudas registradas (multa + las demás)
    // La multa por ir a buscar la moto es lo ÚNICO obligatorio en efectivo para llevársela
    // (regla del dueño). Todo lo demás —deudas viejas y cuotas atrasadas— se puede conveniar.
    multaPendiente: number;
    otrasDeudas: number;         // deudas registradas que NO son la multa → van al convenio
    cuotasAtrasadas: number;     // cuotas del período sin pagar (ledger FIFO)
    totalRecuperar: number;      // deudas + cuotas atrasadas → lo que debe para recuperar la moto
    conveniable: number;         // otras deudas + cuotas atrasadas → la meta del convenio
    motorV2: boolean;
    convenioId: string | null;
    diasRetenida: number;
    fechaRetencion: string | null; // día en que se guardó/registró (de la recolección o la recepción)
    listaParaLiquidar: boolean;
    ahorroAcumulado: number;
    esTemporal: boolean; // guardada por incapacidad/entrega voluntaria (NO moroso)
    enTaller: boolean;   // varada por causa ajena al pago: taller, fiscalía, tránsito o garantía
    motivoVarada: string; // "en taller" | "en Fiscalía" | "en Tránsito" | "en Garantía"
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
        // Las 4 causas de "moto parada con contrato vivo" valen igual: el reglamento trata
        // fiscalía, tránsito y garantía como el taller (el tiempo fuera de servicio se cobra
        // o se rueda). Antes solo entraba 'Mantenimiento', así que a un cliente con la moto
        // en Fiscalía no se le podía prestar reemplazo — ni siquiera aparecía en esta lista.
        if (c.estado === "Activo") {
          const e = motos.find(m => m.id === c.moto_id)?.estado;
          return e === "Mantenimiento" || e === "Fiscalia" || e === "Transito" || e === "Garantia";
        }
        return false;
      })
      .map(c => {
        const cliente = clientes.find(cl => cl.id === c.cliente_id);
        const moto = motos.find(m => m.id === c.moto_id);
        // "Varada" = parada por causa ajena al pago: taller, fiscalía, tránsito o garantía.
        const varada = moto?.estado === "Mantenimiento" || moto?.estado === "Fiscalia"
          || moto?.estado === "Transito" || moto?.estado === "Garantia";
        const motivoVarada = moto?.estado === "Fiscalia" ? "en Fiscalía"
          : moto?.estado === "Transito" ? "en Tránsito"
          : moto?.estado === "Garantia" ? "en Garantía"
          : "en taller";
        // Solo deuda EXIGIBLE (pendiente): la multa sí bloquea la entrega; lo 'en_convenio'
        // ya quedó financiado y se paga con la cuota del convenio (no se exige doble).
        const deudasC = deudas.filter(d => d.contrato_id === c.id && d.estado === "pendiente");
        // Días retenida: desde que la moto está guardada. A los 7 días se habilita liquidar
        // (decisión del ADMIN, no automática).
        //
        // Antes contaba SOLO desde la gestión de "recolección", y esa gestión la crea únicamente
        // el flujo de Registrar recolección. Las motos que entraron por otro camino —recepción
        // desde Motos, entrega voluntaria— no tenían gestión y el reloj se quedaba en 0 para
        // siempre: 12 de 28 contratos suspendidos (5-ago-2026), o sea que no se podían liquidar
        // por mucho que llevaran guardadas. Mismo patrón de siempre: el resultado dependía de por
        // cuál puerta entró el funcionario.
        // Ahora, si no hay gestión, se usa la última RECEPCIÓN del vehículo — ese registro sí lo
        // crean todos los caminos, con sus fotos y su fecha.
        const recoleccionG = gestiones
          .filter(g => g.contrato_id === c.id && g.tipo === "recoleccion")
          .sort((a, b) => b.fecha.localeCompare(a.fecha))[0] ?? null;
        const recepcionFecha = recoleccionG ? null : (recepciones
          .filter(r => r.contrato_id === c.id)
          .sort((a, b) => b.created_at.localeCompare(a.created_at))[0]?.created_at.slice(0, 10) ?? null);
        const desdeISO = recoleccionG?.fecha ?? recepcionFecha;
        const diasRetenida = desdeISO
          ? Math.floor((hoyMs - new Date(desdeISO + "T00:00:00").getTime()) / 86400000)
          : 0;
        const totalDeudas = deudasC.reduce((acc, d) => acc + d.monto_pendiente, 0);
        // La multa aparte: es lo único que se exige en EFECTIVO para llevarse la moto. El resto
        // de deudas se financia en el convenio, igual que las cuotas atrasadas.
        const multaDeuda = deudasC
          .filter(d => d.concepto === "multa_recoleccion")
          .reduce((acc, d) => acc + d.monto_pendiente, 0);
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
          grupo: moto?.grupo ?? "",
          marca: moto?.marca ?? "",
          modelo: moto?.modelo ?? "",
          deudasPendientes: deudasC.map(d => ({ id: d.id, concepto: d.concepto, descripcion: d.descripcion, monto_pendiente: d.monto_pendiente })),
          totalPendiente: totalDeudas,
          multaPendiente: multaDeuda,
          otrasDeudas: totalDeudas - multaDeuda,
          cuotasAtrasadas,
          totalRecuperar: totalDeudas + cuotasAtrasadas,
          conveniable: (totalDeudas - multaDeuda) + cuotasAtrasadas,
          motorV2,
          convenioId: convenioAct?.id ?? null,
          diasRetenida,
          fechaRetencion: desdeISO,
          listaParaLiquidar: diasRetenida >= 7,
          ahorroAcumulado: ahorroTotal(c),
          esTemporal: c.motivo_suspension === "temporal",
          enTaller: varada,
          motivoVarada,
          categoria: (varada ? "taller" : (c.motivo_suspension === "temporal" ? "temporal" : "mora")) as "mora" | "temporal" | "taller",
          soloInfoTaller: varada && c.estado === "Activo",
          formaPago: c.forma_pago ?? "",
        };
      })
      // Agrupa visualmente por categoría: mora → temporal → taller.
      .sort((a, b) => ["mora", "temporal", "taller"].indexOf(a.categoria) - ["mora", "temporal", "taller"].indexOf(b.categoria));
  }, [contratos, clientes, motos, deudas, gestiones, pagos, convenios]);

  // Lo que se ve en la pestaña Retenidas: categoría + búsqueda, en UN solo lugar. Antes esta
  // expresión estaba escrita tres veces (contador, estado vacío y lista) — con tres copias,
  // cualquier filtro nuevo se olvidaba en alguna y la pantalla se contradecía sola.
  const retenidasVisibles = useMemo(() => {
    let l = filtroRet === "todas" ? motosRetenidas : motosRetenidas.filter(m => m.categoria === filtroRet);
    const q = busquedaRet.trim().toLowerCase();
    if (q) {
      l = l.filter(m =>
        m.clienteNombre.toLowerCase().includes(q) ||
        m.placa.toLowerCase().includes(q) ||
        `${m.marca} ${m.modelo}`.toLowerCase().includes(q) ||
        (m.clienteTel ?? "").includes(q));
    }
    return l;
  }, [motosRetenidas, filtroRet, busquedaRet]);

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

  // Cuenta del alquiler de una prestada: lo generado hasta hoy menos lo que ya pagó.
  // El panel solo mostraba "$X/día" como texto fijo — nadie llevaba el saldo, así que al devolver
  // la moto el alquiler no cobrado desaparecía sin quedar como deuda de nadie.
  function cuentaAlquiler(p: { contrato_id: string; fecha_inicio: string; fecha_fin: string | null; tarifa_dia: number }) {
    const hasta = p.fecha_fin ?? hoyISO();
    const dias = Math.max(1, Math.round(
      (new Date(hasta + "T00:00:00").getTime() - new Date(p.fecha_inicio + "T00:00:00").getTime()) / 86400000,
    ));
    const generado = dias * p.tarifa_dia;
    const pagado = pagos
      .filter(x => x.contrato_id === p.contrato_id && x.tipo_registro === "alquiler_reemplazo"
        && x.estado !== "Rechazado" && x.fecha >= p.fecha_inicio)
      .reduce((s, x) => s + x.valor, 0);
    return { dias, generado, pagado, saldo: Math.max(generado - pagado, 0) };
  }

  async function handleDevolverPrestamo(prestamoId: string) {
    if (prestamoProc) return;
    if (!confirm("¿La moto propia ya salió del taller? Se devuelve la prestada al pool y el contrato vuelve a su placa original.")) return;
    setPrestamoProc(prestamoId);
    try {
      const p = prestamos.find(x => x.id === prestamoId);
      // Se calcula ANTES de cerrar el préstamo, con los datos que todavía están en memoria.
      const cuenta = p ? cuentaAlquiler(p) : null;
      const { error } = await devolverReemplazo(prestamoId);
      if (error) { alert("Error al devolver el préstamo: " + error); return; }

      // El alquiler que quede sin pagar NO se pierde: queda como deuda para que el funcionario le
      // haga el convenio (regla del dueño). La moto propia se le entrega igual — esa es la de su
      // contrato y la sigue pagando. Se usa el concepto 'otro' porque `deudas_concepto_check` no
      // tiene uno de alquiler; la descripción deja claro de qué placa y cuántos días es.
      if (p && cuenta && cuenta.saldo > 0 && profile) {
        const placaPrest = motos.find(m => m.id === p.moto_prestada_id)?.placa ?? "";
        await registrarDeuda(
          p.contrato_id, "otro",
          `Alquiler moto de reemplazo ${placaPrest} — ${cuenta.dias} día(s) × $${fmt(p.tarifa_dia)} (ya pagó $${fmt(cuenta.pagado)})`,
          cuenta.saldo, profile.id,
        );
        alert(`Quedó una deuda de $${fmt(cuenta.saldo)} por el alquiler de ${placaPrest}.\n\nCóbrasela o hacele un convenio.`);
      }
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

  // Puede entregarse la moto cuando: la MULTA está paga en efectivo Y lo demás (deudas viejas
  // + cuotas atrasadas) está pago O financiado por un convenio activo.
  // Antes se exigían TODAS las deudas en efectivo, y eso dejaba sin salida a un cliente con una
  // deuda vieja grande: nadie va a pagar $880.000 de contado para llevarse la moto, y el botón
  // de convenio tampoco aparecía. La regla del dueño siempre fue: la multa es el mínimo
  // obligatorio, el resto se convenía. Las TEMPORAL no son morosas: se reactivan siempre.
  const puedeEntregar = (m: MotoRetenida) =>
    m.esTemporal || (m.multaPendiente <= 0 && (m.conveniable <= 0 || m.convenioId != null));

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
    // La guardada temporal se entrega siempre (el cliente no incumplió), pero si debe plata hay
    // que decirlo en la cara antes de soltar la moto — no bloquea, avisa: quien entrega decide.
    const debeTemporal = m.esTemporal ? m.totalPendiente + m.cuotasAtrasadas : 0;
    if (debeTemporal > 0) {
      const conv = m.convenioId != null ? "\n\nYa tiene un convenio activo." : "\n\nLo normal es cobrarle o dejarle un convenio antes de entregársela.";
      if (!confirm(`${m.clienteNombre.toUpperCase()} debe $${fmt(debeTemporal)}.${conv}\n\n¿Entregarle igual la moto ${m.placa}?`)) return;
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
    { key: "mora",       label: "🔴 En mora",  count: filas.filter(f => f.razonInmov === "mora").length },
    { key: "gabela",     label: "🟡 Gabela",   count: filas.filter(f => f.razonInmov === "gabela").length },
    { key: "deuda",      label: "💰 Deben",    count: filas.filter(f => f.razonInmov === "deuda").length },
    { key: "criticos",   label: "Críticos",    count: resumen.critica },
    { key: "en_proceso", label: "En proceso",  count: resumen.recoleccion },
    { key: "todos",      label: "Todos",       count: filas.length },
  ];

  return (
    <div>
      {/* Header — subtítulo solo en desktop para ahorrar alto en móvil */}
      <div style={{ marginBottom: isMobile ? 10 : 22 }}>
        <h2 style={{ fontSize: isMobile ? 19 : 22, margin: 0, fontWeight: 700, color: "var(--text)" }}>Inmovilizaciones</h2>
        {!isMobile && (
          <p style={{ margin: "5px 0 0", color: "var(--muted)", fontSize: 14 }}>
            Motos retenidas y contratos en mora real — gestión de recuperación
          </p>
        )}
      </div>

      {/* KPI header cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 8 : 12, marginBottom: isMobile ? 12 : 20 }}>
        <div onClick={() => setTab("en_mora")} style={{ background: "var(--bad-soft)", borderRadius: 14, padding: isMobile ? "9px 12px" : "14px 16px", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", cursor: "pointer" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>Mora crítica (+3d)</div>
          <div style={{ fontSize: isMobile ? 26 : 36, fontWeight: 700, color: "var(--bad-ink)", lineHeight: 1.1, marginTop: isMobile ? 2 : 6 }}>{resumen.total}</div>
          <div style={{ fontSize: 11, color: "var(--bad-ink)", fontWeight: 700, marginTop: 2 }}>{resumen.critica} críticos (+10d)</div>
        </div>
        <div onClick={() => setTab("en_mora")} style={{ background: "var(--warn-soft)", borderRadius: 14, padding: isMobile ? "9px 12px" : "14px 16px", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", cursor: "pointer" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>En proceso recolección</div>
          <div style={{ fontSize: isMobile ? 26 : 36, fontWeight: 700, color: "var(--warn-ink)", lineHeight: 1.1, marginTop: isMobile ? 2 : 6 }}>{resumen.recoleccion}</div>
          <div style={{ fontSize: 11, color: "var(--warn-ink)", fontWeight: 700, marginTop: 2 }}>orden activa</div>
        </div>
        <div onClick={() => setTab("retenidas")} style={{ background: "var(--ok-soft)", borderRadius: 14, padding: isMobile ? "9px 12px" : "14px 16px", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", cursor: "pointer" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>Recuperadas esta semana</div>
          <div style={{ fontSize: isMobile ? 26 : 36, fontWeight: 700, color: "var(--ok-ink)", lineHeight: 1.1, marginTop: isMobile ? 2 : 6 }}>{recuperadasSemana}</div>
          <div style={{ fontSize: 11, color: "var(--ok-ink)", fontWeight: 700, marginTop: 2 }}>motos recuperadas</div>
        </div>
        <div style={{ background: "var(--bad-soft)", borderRadius: 14, padding: isMobile ? "9px 12px" : "14px 16px", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>Deuda real total</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--bad-ink)", lineHeight: 1.1, marginTop: isMobile ? 2 : 6 }}>${fmt(resumen.deudaTotal)}</div>
          {/* Va con soloMora: el monto de arriba (resumen.deudaTotal) también, así el número de
              contratos y la plata que muestra corresponden al mismo conjunto. */}
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, marginTop: 2 }}>{soloMora.length} contratos en mora</div>
        </div>
      </div>

      {/* Tab bar — Retenidas primero (endpoint más consultado) */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {([
          { key: "retenidas", label: "🔒 Retenidas", count: motosRetenidas.length },
          // Ya no son solo los de mora: agrupa a todo el que se puede inmovilizar (mora, gabela o
          // deuda). El contador muestra el total; los chips de adentro lo separan por razón, con
          // "En mora" preseleccionado para que la vista por defecto siga siendo la de siempre.
          { key: "en_mora",   label: "⚠️ Por cobrar", count: filas.length },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 700,
              background: tab === t.key ? "var(--text)" : "var(--soft)",
              color: tab === t.key ? "var(--card)" : "var(--muted)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {t.label}
            <span style={{
              background: tab === t.key ? "rgba(255,255,255,0.2)" : "var(--line)",
              borderRadius: 999, fontSize: 12, fontWeight: 700, padding: "1px 8px",
              color: tab === t.key ? "var(--card)" : "var(--muted)",
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "en_mora" && (<>
      {/* GPS notice */}
      <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", fontSize: 12, color: "var(--warn-ink)", display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ fontSize: 16 }}>📡</span>
        <span>
          <strong>GPS no integrado.</strong> Sirena (máx. 10s) y apagado remoto (máx. 1h) disponibles al integrar la plataforma GPS.{" "}
          <strong>Solo con vehículo detenido.</strong>
        </span>
      </div>

      {/* Filters + search */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {filtroBtns.map(btn => (
            <Chip key={btn.key} activo={filtro === btn.key} count={btn.count} onClick={() => setFiltro(btn.key)}>
              {btn.label}
            </Chip>
          ))}
        </div>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar cliente o placa..."
          style={{ flex: 1, minWidth: 180, padding: "7px 14px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13 }}
        />
      </div>

      {/* Empty state */}
      {filas.length === 0 && (
        <div style={{ background: "var(--card)", borderRadius: 16, padding: "52px 24px", textAlign: "center", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>✅</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>Sin motos en mora</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Todos los contratos están al día</div>
        </div>
      )}

      {/* Main list */}
      <div style={{ display: "grid", gap: 10, marginBottom: isMobile ? 16 : 28 }}>
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
                        ? <button onClick={() => onNavigate("ficha_moto", f.motoId!)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 700, fontSize: 16, color: "var(--accent)", textDecoration: "underline" }}>{f.placa}</button>
                        : <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{f.placa}</span>
                      }
                      <span style={{ color: "var(--line2)" }}>·</span>
                      {onNavigate
                        ? <button onClick={() => onNavigate("ficha_cliente", f.clienteId)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 700, fontSize: 15, color: "var(--text)", textTransform: "uppercase" }}>{f.clienteNombre}</button>
                        : <span style={{ fontWeight: 700, fontSize: 15, textTransform: "uppercase" }}>{f.clienteNombre}</span>
                      }
                      <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: s.border, color: s.color }}>
                        {s.icon} {s.label}
                      </span>
                      {f.recoleccionOrdenada && (
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "var(--bad-soft)", color: "var(--bad-ink)" }}>
                          🚔 Recolección
                        </span>
                      )}
                    </div>

                    {(f.marca || f.modelo) && (
                      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>{f.marca} {f.modelo}</div>
                    )}
                    {/* Aquí es donde más se llama (persecución de mora): el número marca al tocarlo. */}
                    {f.clienteTel && (
                      <div style={{ fontSize: 12, marginBottom: 6 }}>
                        <a href={`tel:${f.clienteTel}`} onClick={e => e.stopPropagation()} style={{ color: "var(--accent-ink)", fontWeight: 700, textDecoration: "none", borderBottom: "1px solid var(--accent-ink)" }} title="Llamar">
                          📞 {f.clienteTel}
                        </a>
                      </div>
                    )}

                    {/* Metrics row */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
                      {/* Los días solo se muestran si de verdad está en mora. Si entró por gabela
                          o por deuda, el contador sería 0 y "0 días de mora" haría creer que la
                          tarjeta está mal — mejor decir la razón real por la que aparece. */}
                      {f.razonInmov === "mora" ? (
                        <div>
                          <div style={{ fontSize: 34, fontWeight: 700, color: s.color, lineHeight: 1 }}>
                            {f.diasMora}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>días de mora</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: s.color, lineHeight: 1.2, textTransform: "uppercase" }}>
                            {f.razonInmov === "gabela" ? "Gabela" : "Debe"}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
                            {RAZON_INMOVILIZAR_LABEL[f.razonInmov]}
                          </div>
                        </div>
                      )}
                      <div style={{ borderLeft: `2px solid ${s.border}`, paddingLeft: 14 }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>${fmt(f.deudaReal)}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>deuda real</div>
                      </div>
                      <div style={{ borderLeft: `2px solid ${s.border}`, paddingLeft: 14 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--muted2)" }}>${fmt(f.tarifa)}/día</div>
                        <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>tarifa</div>
                      </div>
                      {f.ultimoPago && (
                        <div style={{ borderLeft: `2px solid ${s.border}`, paddingLeft: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted2)" }}>{fmtFecha(f.ultimoPago)}</div>
                          <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>último pago</div>
                        </div>
                      )}
                      {f.ultimaGestion ? (
                        <div style={{ borderLeft: `2px solid ${s.border}`, paddingLeft: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted2)" }}>{fmtFecha(f.ultimaGestion)}</div>
                          <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>última gestión · {f.tipoUltimaGestion}</div>
                        </div>
                      ) : (
                        <div style={{ borderLeft: `2px solid ${s.border}`, paddingLeft: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--bad-ink)" }}>Sin gestiones</div>
                          <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>requiere acción</div>
                        </div>
                      )}
                    </div>

                    {/* Urgency bar — solo para mora real: en gabela o deuda diría "0 / 14 días en
                        mora", que hace dudar de la tarjeta entera. */}
                    {f.razonInmov === "mora" && <div style={{ marginTop: 10 }}>
                      <div style={{ height: 5, borderRadius: 999, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 999,
                          width: `${Math.min(100, (f.diasMora / 14) * 100)}%`,
                          background: f.prioridad === "critica" ? "var(--bad)" : f.prioridad === "alta" ? "var(--warn2)" : "var(--orange)",
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: "var(--faint)", marginTop: 2, textAlign: "right" }}>
                        {`${f.diasMora} / 14 días en mora`}
                      </div>
                    </div>}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: 5, flexShrink: isMobile ? 1 : 0, flexWrap: "wrap", minWidth: 0 }}>
                    {f.clienteTel && (
                      <>
                        <button
                          onClick={() => window.open(`tel:+57${f.clienteTel.replace(/\D/g, "")}`)}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--accent-soft3)", color: "var(--accent-ink)" }}
                        >
                          📞 Llamar
                        </button>
                        <button
                          onClick={() => abrirWA(f.clienteTel, f.clienteNombre, f.diasMora, f.placa, f.deudaReal)}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--ok-soft)", color: "var(--ok-ink)" }}
                        >
                          💬 WA
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => { setGestionId(f.contratoId); setGestionNombre(f.clienteNombre); setGestionPasosPrevios(f.pasosPrevios); }}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--warn-soft)", color: "var(--warn-ink)" }}
                    >
                      📋 Gestión
                    </button>
                    {onNavigate && (
                      <>
                        <button
                          onClick={() => onNavigate("ficha_cliente", f.clienteId)}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--accent-soft2)", color: "var(--accent)" }}
                        >
                          👤 Ficha
                        </button>
                        {f.motoId && (
                          <button
                            onClick={() => onNavigate("ficha_moto", f.motoId!)}
                            style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--ok-soft)", color: "var(--ok-ink)" }}
                          >
                            🏍️ Moto
                          </button>
                        )}
                      </>
                    )}
                    <button
                      disabled
                      title="Requiere GPS — solo con vehículo detenido, máx. 10s"
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "not-allowed", fontSize: 12, fontWeight: 700, background: "var(--soft)", color: "var(--faint)", opacity: 0.5 }}
                    >
                      📡 Sirena
                    </button>
                    <button
                      disabled
                      title="Requiere GPS — solo con vehículo detenido, máx. 1h"
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "not-allowed", fontSize: 12, fontWeight: 700, background: "var(--soft)", color: "var(--faint)", opacity: 0.5 }}
                    >
                      🔴 Apagar
                    </button>
                    <button
                      onClick={() => setExpandido(abierto ? null : f.contratoId)}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--soft)", color: "var(--muted2)" }}
                    >
                      {abierto ? "▲ Cerrar" : "▼ Protocolo"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Protocol panel */}
              {abierto && (
                <div style={{ borderTop: `1px solid ${s.border}`, padding: "14px 16px", background: "rgba(255,255,255,0.7)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    Protocolo de mora
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.6 }}>
                    Mensaje → Llamada → Apagado/Recolección — disponibles desde el primer día de mora. El funcionario escala
                    según si logra contacto o hay pago, pudiendo pasar los 3 pasos el mismo día. La recolección física se
                    ejecuta desde el Panel Hoy de Cartera.
                  </div>
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--card)", borderRadius: 10, border: "1px solid var(--line)", fontSize: 12, color: "var(--muted)" }}>
                    <strong style={{ color: "var(--text)" }}>Regla GPS:</strong> Sirena máx. 10 seg · Apagado máx. 1 hora · Solo vehículo{" "}
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
        <h3 style={{ fontSize: 18, margin: "0 0 4px", fontWeight: 700, color: "var(--text)" }}>🔒 Motos retenidas</h3>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
          Motos fuera de servicio, en poder de la empresa — por mora, entregadas temporal, o en taller.
        </p>
      </div>

      {/* Filtros: mora / temporal / varadas (taller, fiscalía, tránsito, garantía) / todas */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {([
          { key: "todas",    label: "Todas",         count: motosRetenidas.length },
          { key: "mora",     label: "🔴 Mora",       count: motosRetenidas.filter(m => m.categoria === "mora").length },
          { key: "temporal", label: "🅿️ Temporal",   count: motosRetenidas.filter(m => m.categoria === "temporal").length },
          { key: "taller",   label: "🔧 Varadas",    count: motosRetenidas.filter(m => m.categoria === "taller").length },
        ] as const).map(f => (
          <Chip key={f.key} activo={filtroRet === f.key} count={f.count} onClick={() => setFiltroRet(f.key)}>
            {f.label}
          </Chip>
        ))}
        <input
          value={busquedaRet}
          onChange={e => setBusquedaRet(e.target.value)}
          placeholder="Buscar cliente, placa o teléfono..."
          style={{ flex: 1, minWidth: 180, padding: "7px 14px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13, boxSizing: "border-box" }}
        />
      </div>

      {retenidasVisibles.length === 0 ? (
        <div style={{ background: "var(--card)", borderRadius: 16, padding: "32px 24px", textAlign: "center", boxShadow: "0 2px 8px rgba(15,23,42,0.06)", marginBottom: isMobile ? 16 : 28 }}>
          {/* Buscar algo que no existe NO es lo mismo que no tener motos retenidas: con un
              solo mensaje, el funcionario cree que la lista está vacía y no que su búsqueda
              no encontró nada. */}
          <div style={{ fontSize: 36, marginBottom: 10 }}>{busquedaRet.trim() ? "🔍" : "🔓"}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
            {busquedaRet.trim()
              ? `Ninguna moto retenida coincide con "${busquedaRet.trim()}"`
              : motosRetenidas.length > 0
              ? "Ninguna en este filtro"
              : "No hay motos retenidas"}
          </div>
          {busquedaRet.trim() && (
            <button
              onClick={() => setBusquedaRet("")}
              style={{ marginTop: 12, background: "var(--soft)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 10, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10, marginBottom: isMobile ? 16 : 28 }}>
          {retenidasVisibles.map(m => {
            const entregable = puedeEntregar(m);
            // Solo la MULTA se exige en efectivo — es lo que cuesta haber ido a buscar la moto.
            // Se cobra ANTES de conveniar: si se conveniara con la multa pendiente, el trigger
            // 054 la marcaría 'en_convenio' pero no está dentro de la meta → se perdería.
            // Las demás deudas SÍ entran al convenio (van en `conveniable`), que es lo que
            // permite entregarle la moto a alguien que arrastra una deuda vieja grande.
            const faltaMulta = m.multaPendiente > 0;
            const puedeHacerConvenio = !m.soloInfoTaller && !m.esTemporal && m.conveniable > 0 && m.convenioId == null && !faltaMulta;
            const procesandoEsta = procesandoId === m.contratoId;
            return (
              <div key={m.contratoId} style={{ background: m.esTemporal ? "var(--accent-soft4)" : "var(--bad-soft)", border: `2px solid ${m.esTemporal ? "var(--accent-line)" : "var(--bad-line)"}`, borderRadius: 16, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    {/* La placa abre la ficha de la moto, donde vive todo el detalle: las FOTOS de
                        la recepción, el kilometraje, la condición y los daños. Antes esas fotos se
                        exigían (6, obligatorias) y no había ninguna pantalla que las mostrara. */}
                    <div style={{ fontWeight: 700, fontSize: 15, textTransform: "uppercase", color: "var(--text)" }}>
                      {onNavigate && m.motoId
                        ? <button onClick={() => onNavigate("ficha_moto", m.motoId!)}
                            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit", color: "var(--accent)", textDecoration: "underline" }}>
                            {m.placa}
                          </button>
                        : m.placa}
                      {" · "}{m.clienteNombre}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      {m.grupo && (
                        <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "var(--soft)", color: "var(--muted2)" }}>{m.grupo}</span>
                      )}
                      <span>{m.marca} {m.modelo}</span>
                    </div>
                    {onNavigate && m.motoId && (
                      <button onClick={() => onNavigate("ficha_moto", m.motoId!)}
                        style={{ marginTop: 6, padding: "5px 12px", borderRadius: 999, border: "1px solid var(--line2)", background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--text)" }}>
                        📷 Ver fotos y detalle
                      </button>
                    )}
                    <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
                      {m.deudasPendientes.length === 0 ? (
                        <span style={{ fontSize: 12, color: "var(--ok-ink)", fontWeight: 700 }}>✓ Sin deudas pendientes</span>
                      ) : m.deudasPendientes.map(d => (
                        <div key={d.id} style={{ fontSize: 12, color: "var(--bad-ink)" }}>
                          {d.concepto === "multa_recoleccion" ? "Multa por recolección/inmovilización" : d.descripcion}: <strong>${fmt(d.monto_pendiente)}</strong>
                        </div>
                      ))}
                      {!m.soloInfoTaller && m.cuotasAtrasadas > 0 && (
                        <div style={{ fontSize: 12, color: m.convenioId != null ? "var(--accent-ink)" : "var(--bad-ink)" }}>
                          Cuotas atrasadas: <strong>${fmt(m.cuotasAtrasadas)}</strong>
                          {m.convenioId != null && <span style={{ fontSize: 11, fontWeight: 700 }}> · 📝 en convenio</span>}
                        </div>
                      )}
                      <div style={{ fontSize: 13, fontWeight: 700, color: m.soloInfoTaller ? "var(--violet)" : m.esTemporal ? "var(--accent-ink)" : entregable ? "var(--ok-ink)" : "var(--bad-ink)", marginTop: 2 }}>
                        {m.soloInfoTaller
                          ? `🔧 ${m.motivoVarada.charAt(0).toUpperCase() + m.motivoVarada.slice(1)} (varada) — se resuelve el tiempo al salir`
                          : m.esTemporal
                            ? "🅿️ Guardada temporal — resolver el tiempo al reactivar"
                            : entregable
                              ? "✓ Listo para entregar"
                              : faltaMulta
                                ? `Primero la multa, en efectivo: $${fmt(m.multaPendiente)}`
                                : `Falta $${fmt(m.conveniable)} — págalo o déjalo en un convenio`}
                      </div>
                      {/* Una moto guardada temporal se puede entregar SIEMPRE (el cliente no
                          incumplió: la dejó él mismo). Pero si además debe plata, esa deuda no
                          puede quedar escondida detrás del botón verde: se avisa con el monto y
                          quien entrega decide si le cobra, le deja convenio, o se la entrega igual.
                          Decisión del dueño, 28-jul-2026: avisar, no bloquear. */}
                      {m.esTemporal && (m.totalPendiente > 0 || m.cuotasAtrasadas > 0) && (
                        <div style={{ marginTop: 6, padding: "8px 10px", borderRadius: 10, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", fontSize: 12, color: "var(--warn-ink)", fontWeight: 600 }}>
                          ⚠️ Este cliente debe <strong>${fmt(m.totalPendiente + m.cuotasAtrasadas)}</strong>
                          {m.totalPendiente > 0 && m.cuotasAtrasadas > 0
                            ? ` (deudas $${fmt(m.totalPendiente)} + cuotas atrasadas $${fmt(m.cuotasAtrasadas)})`
                            : m.totalPendiente > 0 ? " en deudas registradas" : " en cuotas atrasadas"}.
                          {m.convenioId == null
                            ? " Cóbrale o déjale un convenio antes de entregarle la moto."
                            : " Ya tiene un convenio activo."}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                        {m.categoria === "taller"
                          ? <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "var(--indigo-soft)", color: "var(--violet)" }}>🔧 {m.motivoVarada.charAt(0).toUpperCase() + m.motivoVarada.slice(1)}</span>
                          : m.categoria === "temporal"
                            ? <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "var(--accent-soft)", color: "var(--accent-ink)" }}>🅿️ Guardada temporal (incapacidad)</span>
                            : <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "var(--bad-soft)", color: "var(--bad-ink)" }}>🔴 Por mora / recolección</span>}
                        {/* Desde cuándo está guardada: la fecha del día en que se le hizo el proceso
                            (la recolección, o la recepción si entró por otra puerta). Antes solo se
                            veía el contador de días y no se sabía DESDE cuándo. */}
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "var(--soft)", color: "var(--muted2)" }}>
                          ⏳ {m.fechaRetencion
                            ? <>Guardada el {new Date(m.fechaRetencion + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })} · {m.diasRetenida} día{m.diasRetenida !== 1 ? "s" : ""}</>
                            : <>{m.diasRetenida} día{m.diasRetenida !== 1 ? "s" : ""} retenida · <span style={{ color: "var(--warn-ink)" }}>sin fecha registrada</span></>}
                        </span>
                        {m.listaParaLiquidar && (
                          <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "var(--bad-soft)", color: "var(--bad-ink)" }}>
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
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--accent-soft3)", color: "var(--accent-ink)" }}
                      >
                        📞 Llamar
                      </button>
                    )}
                    {m.soloInfoTaller && (m.formaPago === "Diario"
                      ? <button
                          onClick={() => setLiquidacionModal(m)}
                          title="Diario varado: liquida este contrato y crea uno nuevo en otra moto trasladando el ahorro"
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--orange)", color: "var(--card)" }}
                        >
                          🔁 Liquidar y reasignar
                        </button>
                      : <button
                          onClick={() => setPrestarRec(m)}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--violet)", color: "var(--card)" }}
                        >
                          🔄 Prestar reemplazo
                        </button>
                    )}
                    {!m.soloInfoTaller && !entregable && (
                      <button
                        /* Si falta la multa, propone SOLO la multa: es el mínimo para llevarse la
                           moto y lo demás puede ir al convenio. Si ya está paga, propone todo lo
                           que debe, por si el cliente quiere ponerse al día de una. */
                        onClick={() => { setCobroRec(m); setCobroMonto(String(faltaMulta ? m.multaPendiente : m.totalRecuperar)); setCobroErr(null); }}
                        disabled={procesandoEsta}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--ok-ink)", color: "var(--card)" }}
                      >
                        💵 Cobrar
                      </button>
                    )}
                    {puedeHacerConvenio && puedeCrearConvenio && (
                      <button
                        onClick={() => setConvenioRec(m)}
                        disabled={procesandoEsta}
                        title="Financiar las cuotas atrasadas en un convenio (pide lo máximo que pueda dar; el mínimo para llevarse la moto es la multa)"
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--accent-ink)", color: "var(--card)" }}
                      >
                        📝 Convenio
                      </button>
                    )}
                    {!m.soloInfoTaller && (
                      <button
                        onClick={() => handleAbrirEntrega(m)}
                        disabled={!entregable || procesandoEsta}
                        title={!entregable ? `Falta el mínimo (multa) o dejar lo atrasado en convenio para poder entregar` : "Abre el formulario de entrega con fotos"}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: (!entregable || procesandoEsta) ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, background: entregable ? "var(--ok-soft)" : "var(--soft)", color: entregable ? "var(--ok-ink)" : "var(--faint)", opacity: procesandoEsta ? 0.6 : 1 }}
                      >
                        {procesandoEsta ? "Procesando..." : m.esTemporal ? "✓ Reactivar / entregar" : "✓ Entregar moto"}
                      </button>
                    )}
                    {/* Solo el permiso manda (antes exigía además rol ADMIN, así que darle
                        "iniciar liquidación" a un SUBADMIN no servía aquí — sí en Motos). */}
                    {/* Los 7 días son AVISO, no ley — ya se había decidido así el 11-jul y quedó
                        aplicado en Motos, pero esta pantalla se quedó con el candado viejo.
                        Peor todavía: el reloj arranca con la fecha de retención, y 20 de las 44
                        retenidas no la tienen registrada. Para esas, `diasRetenida` es 0 y el
                        candado NO SE ABRÍA NUNCA — así llevaran meses guardadas.
                        Caso real: ANTONIO MONTERROZA (IEW65I), imposible de liquidar.
                        Ahora avisa cuántos días lleva y deja pasar; la decisión es del ADMIN. */}
                    {puedeLiquidar && (
                      <button
                        onClick={() => setLiquidacionModal(m)}
                        disabled={procesandoEsta}
                        title={m.fechaRetencion == null
                          ? "No hay fecha de cuándo se guardó. Al liquidar hay que escribirla."
                          : !m.listaParaLiquidar ? `Lleva ${m.diasRetenida} día${m.diasRetenida !== 1 ? "s" : ""} guardada — lo normal es esperar 7` : ""}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: procesandoEsta ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, background: "var(--warn-soft)", color: "var(--warn-ink)", opacity: procesandoEsta ? 0.6 : 1 }}
                      >
                        📄 Iniciar liquidación
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
        <div style={{ marginTop: 8, marginBottom: isMobile ? 16 : 28 }}>
          <h3 style={{ fontSize: 16, margin: "0 0 8px", fontWeight: 700, color: "var(--text)" }}>🔄 Préstamos activos</h3>
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
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", textTransform: "uppercase" }}>{cli?.nombre ?? "—"}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                      Anda en <strong>{motoP?.placa ?? "?"}</strong> (prestada) · su moto <strong>{motoO?.placa ?? "?"}</strong> en taller · desde {p.fecha_inicio}
                    </div>
                    {(() => {
                      const cta = cuentaAlquiler(p);
                      return (
                        <div style={{ marginTop: 4 }}>
                          <div style={{ fontSize: 12, color: "var(--violet)", fontWeight: 700 }}>
                            Alquiler: ${fmt(p.tarifa_dia)}/día · {cta.dias} día{cta.dias !== 1 ? "s" : ""} = ${fmt(cta.generado)}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2, color: cta.saldo > 0 ? "var(--bad-ink)" : "var(--ok-ink)" }}>
                            {cta.saldo > 0
                              ? `Debe $${fmt(cta.saldo)} de alquiler (pagó $${fmt(cta.pagado)})`
                              : `✓ Alquiler al día (pagó $${fmt(cta.pagado)})`}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                    <button onClick={() => cobrarAlquiler(p.id, p.contrato_id, p.tarifa_dia)} disabled={proc}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--ok-ink)", color: "var(--card)", opacity: proc ? 0.6 : 1 }}>
                      💵 Cobrar alquiler
                    </button>
                    <button onClick={() => handleDevolverPrestamo(p.id)} disabled={proc}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--ok-soft)", color: "var(--ok-ink)", opacity: proc ? 0.6 : 1 }}>
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
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(420px,94vw)", background: "var(--card)", borderRadius: 18, padding: 22, zIndex: 401, boxShadow: "0 20px 60px rgba(15,23,42,0.28)", boxSizing: "border-box" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>💵 Cobrar para recuperar</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14, textTransform: "uppercase" }}>{cobroRec.placa} · {cobroRec.clienteNombre}</div>

            <div style={{ background: "var(--bad-soft)", border: "1px solid var(--bad-line)", borderRadius: 12, padding: "10px 12px", marginBottom: 14, fontSize: 13, color: "var(--bad-ink)", fontWeight: 700 }}>
              Debe para recuperar: <strong>${fmt(cobroRec.totalRecuperar)}</strong>
              <div style={{ fontSize: 12, fontWeight: 400, marginTop: 2 }}>
                {cobroRec.cuotasAtrasadas > 0 && `Cuotas atrasadas $${fmt(cobroRec.cuotasAtrasadas)}`}
                {cobroRec.cuotasAtrasadas > 0 && cobroRec.totalPendiente > 0 && " · "}
                {cobroRec.totalPendiente > 0 && `Multa/deuda $${fmt(cobroRec.totalPendiente)}`}
              </div>
            </div>

            <MoneyInput label="Valor recibido (efectivo)" value={cobroMonto} onChange={setCobroMonto} />
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>El pago cubre primero la <strong>multa/deudas</strong> (mínimo para llevarse la moto) y luego las cuotas atrasadas. Pídele lo máximo que pueda dar; lo que quede de atrasado se puede dejar en un convenio (botón 📝 Convenio).</div>

            {cobroErr && <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13, marginTop: 8 }}>{cobroErr}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setCobroRec(null)} disabled={cobroProc} style={{ flex: 1, padding: 11, borderRadius: 12, border: "1px solid var(--line)", background: "var(--card)", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "var(--muted2)" }}>Cancelar</button>
              <button onClick={handleCobrarRecuperar} disabled={cobroProc} style={{ flex: 2, padding: 11, borderRadius: 12, border: "none", background: "var(--ok-ink)", color: "var(--card)", cursor: "pointer", fontWeight: 700, fontSize: 14, opacity: cobroProc ? 0.6 : 1 }}>
                {cobroProc ? "Registrando..." : "Registrar pago"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Convenio para recuperar una moto retenida.
          `conveniable` = cuotas atrasadas + deudas viejas. La MULTA no entra: esa se paga en
          efectivo antes y sin ella no aparece este botón. Antes la meta traía solo las cuotas
          atrasadas, así que una deuda vieja quedaba FUERA del monto pero el trigger 054 la
          marcaba 'en_convenio' igual — y esa plata se perdía. */}
      {convenioRec && (
        <ModalConvenio
          contratoId={convenioRec.contratoId}
          clienteNombre={convenioRec.clienteNombre}
          metaFija={convenioRec.conveniable}
          // Acá SÍ se ajusta a propósito: la regla del dueño es que el mínimo obligatorio es la
          // multa y el resto se financia pidiéndole lo máximo que pueda dar.
          metaNota="lo que tiene atrasado más sus deudas"
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
          motivoVarada={prestarRec.motivoVarada}
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
