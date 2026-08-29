import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import MoneyInput from "./MoneyInput";
import CanvasFirma from "./CanvasFirma";
import { useBloquearScrollFondo } from "../hooks/useBloquearScrollFondo";
import { useAuth } from "../contexts/AuthContext";
import { useClientes } from "../hooks/useClientes";
import { useContratos, infoFinContrato } from "../hooks/useContratos";
import { useMotos } from "../hooks/useMotos";
import { useDeudas } from "../hooks/useDeudas";
import { generarHTMLAcuerdoPago } from "../hooks/useDocumentos";
import { valorPeriodoReal, proximoDiaPago, huecoCuotasHoy, fechaCubrePeriodo, financiarSemanas } from "../utils/cicloPago";
import { hoyDate, fechaISO, fmtFechaLarga } from "../utils/fecha";

interface Props {
  contratoId: string;
  clienteNombre: string;
  onClose: () => void;
  // Monto fijo que el convenio debe cubrir (ej. base inicial incompleta al crear el
  // contrato) — si no viene, la meta se precarga con la deuda pendiente del contrato.
  metaFija?: number;
  /**
   * La meta que llega YA trae las cuotas atrasadas adentro. Con `true` el selector de semanas
   * arranca en 0 (si no, se cobrarían dos veces); con `false` se auto-marca en las vencidas.
   *
   * 🔴 POR QUÉ ES EXPLÍCITO (25-ago-2026, caso IGC46I): antes se deducía de "¿vino metaFija?",
   * y por eso las dos puertas del MISMO convenio se veían distintas — Inmovilizaciones mostraba
   * el selector en 0 (con las semanas escondidas dentro del monto) y Cartera en 2. El
   * funcionario veía el 0, creía que faltaban las semanas, subía el selector… y el convenio
   * salía cobrando la misma semana dos veces.
   */
  metaTraeSemanas?: boolean;
  /** Oculta la opción de financiar semanas del arriendo. Se usa en el convenio de la BASE
   *  INICIAL del wizard: ahí la primera semana ya viene pagada dentro de la base, así que
   *  financiarla sería cobrarla dos veces (ver el comentario de `puedeFinanciar`). */
  sinFinanciarSemanas?: boolean;
  motivoInicial?: string;
  // Qué ES el monto sugerido, en palabras del funcionario. No es lo mismo "lo que tiene atrasado"
  // (moto retenida) que "lo que le falta de la base inicial" (cliente nuevo del wizard): decirle
  // "atrasado" a un cliente que apenas está entrando es falso.
  metaNota?: string;
  // El monto NO se puede editar. Se usa cuando la cifra la calcula el sistema y no es negociable
  // (la base inicial faltante del wizard). Al unificar la ventana quedó editable por descuido y
  // así se podía bajar la base que el cliente realmente debe.
  metaBloqueada?: boolean;
  // Oculta cerrar/cancelar — obliga a guardar el convenio antes de continuar.
  obligatorio?: boolean;
  // Cuota del período actual (para poder ofrecer meterla dentro del convenio como alivio).
  cuotaPeriodo?: number;
  // Fecha hasta la que quedaría cubierto el período si se incluye la cuota de esta semana.
  finPeriodoISO?: string;
}

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

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

// DOS TOPES, no uno (decisión del dueño, 29-ago-2026). Antes había un solo número (24) haciendo
// dos trabajos distintos, y por eso ninguno quedaba bien:
//
//   1) Atajar el ERROR DE DEDO de escribir el VALOR de la cuota en la casilla del NÚMERO de
//      cuotas. Pasó de verdad: XZN20H, 60.000 en el número de cuotas → cuotas de $9 durante
//      60.000 semanas, con fecha límite en el año 3176.
//   2) La NORMA del negocio: un convenio que no se paga en ~24 cuotas ya es otra conversación.
//
// Con un solo número, subirlo (12 → 24 → …) debilitaba (2) sin mejorar (1) — contra un 60.000
// dan igual 24 que 30. Y apretaba de verdad: JORGE (ZIB64G) debe $2.203.000, así que en 24
// cuotas le tocaban $91.800 SOBRE su semana de $195.000 = $286.800 semanales. El propio código
// ya advertía que el tope "termina empujando a partir la deuda en varios convenios, que es peor".
//
// Ahora: el tope DURO solo ataja el error de dedo (nadie hace 60 cuotas a propósito) y la NORMA
// avisa sin bloquear, pidiendo confirmar a propósito y dejando rastro en el motivo.
export const TOPE_DURO_CUOTAS = 60;
export const CUOTAS_NORMALES = 24;

/** Veredicto del número de cuotas. Función pura para poder protegerla con pruebas. */
export type VeredictoCuotas = "ok" | "excede-lo-normal" | "error-de-dedo";
export function veredictoCuotas(cuotas: number): VeredictoCuotas {
  if (cuotas > TOPE_DURO_CUOTAS) return "error-de-dedo";
  if (cuotas > CUOTAS_NORMALES) return "excede-lo-normal";
  return "ok";
}

/**
 * Cómo se reparte un convenio en cuotas. **REGLA DEL DUEÑO, y es la que manda:**
 *
 *   "El cliente debía 345.000 y se le coloca que pague de a 55.000 en cada pago.
 *    6 cuotas × 55k dan 330 y ya en la última solo tiene que pagar el restante."
 *
 * O sea: **la cuota que escribe el funcionario se respeta TAL CUAL**, y la ÚLTIMA absorbe el
 * resto. Nunca un promedio.
 *
 * 🔴 ESTO SE ROMPIÓ UNA VEZ (1-ago-2026) y no puede volver a pasar. Al unificar el convenio de
 * Cartera con el compartido, el compartido recalculaba la cuota dividiendo (345.000 ÷ 7 = 49.286)
 * y salían montos ponderados por todos lados. La causa de fondo: se comparó lo que se VEÍA de los
 * dos formularios (financiar semanas, fecha límite, previsualización) y NO los cálculos; después
 * el compilador dio verde porque avisa de referencias rotas, no de comportamiento perdido.
 * Por eso esta lógica vive acá, suelta y con pruebas: para que un cambio futuro la rompa en
 * `npm test` y no en la cara del funcionario.
 */
export function repartirConvenio(
  meta: number,
  modo: "cuotas" | "cuota",
  valor: number,
): { cuotas: number; cuota: number; ultima: number; total: number } {
  const vacio = { cuotas: 0, cuota: 0, ultima: 0, total: 0 };
  if (meta <= 0 || valor <= 0) return vacio;
  const cuotas = modo === "cuota" ? Math.ceil(meta / valor) : Math.floor(valor);
  if (cuotas <= 0) return vacio;
  // Con una sola cuota no hay "resto": paga todo de una.
  if (cuotas === 1) return { cuotas: 1, cuota: meta, ultima: meta, total: meta };
  // Fijando la CUOTA se respeta el valor tecleado; fijando el NÚMERO se reparte parejo.
  const cuota = modo === "cuota" ? valor : cuotaRedonda(meta, cuotas);
  const ultima = Math.max(meta - cuota * (cuotas - 1), 0);
  return { cuotas, cuota, ultima, total: cuota * (cuotas - 1) + ultima };
}

/**
 * Al fijar el NÚMERO de cuotas, la división cruda saca cifras que nadie cobra en la calle:
 * 433.000 ÷ 8 = $54.125, 1.525.000 ÷ 16 = $95.313. El dueño lo reportó como "lo de los
 * decimales". Cuando la división deja pesos sueltos, la cuota sube al millar y la ÚLTIMA absorbe
 * el resto — el mismo principio del otro modo.
 *
 * Solo se toca cuando hace falta: si la división ya da una cifra de a $500 ($33.500, $42.500,
 * $48.000) se deja igual, para no cambiar convenios que estaban bien.
 * Y si redondear dejara la última cuota en cero o negativa, se vuelve a la división exacta:
 * antes una cuota fea que un convenio cuyas cuotas no suman la deuda.
 */
function cuotaRedonda(meta: number, cuotas: number): number {
  const exacta = Math.ceil(meta / cuotas);
  if (exacta % 500 === 0) return exacta;
  const redonda = Math.ceil(exacta / 1000) * 1000;
  return redonda * (cuotas - 1) < meta ? redonda : exacta;
}

export default function ModalConvenio({ contratoId, clienteNombre, onClose, metaFija, metaTraeSemanas, sinFinanciarSemanas, motivoInicial, metaNota, metaBloqueada, obligatorio, cuotaPeriodo, finPeriodoISO }: Props) {
  useBloquearScrollFondo();
  const [motivo, setMotivo] = useState(motivoInicial ?? "");
  // Cuántas cuotas del arriendo se le financian DENTRO del convenio (0, 1 o 2). Antes acá era un
  // sí/no y en Cartera un selector de 0/1/2: el mismo convenio se comportaba distinto según la
  // puerta por la que entraras. Unificado — decisión del dueño, 31-jul: "un convenio es un
  // convenio, no veo por qué habría alguna diferencia".
  const [financiarN, setFinanciarN] = useState(0);
  // Deuda que NO entra acá por estar ya dentro de otro convenio activo. Se muestra para que el
  // funcionario entienda por qué el monto precargado es menor que el "debe" de Cartera.
  const [deudaEnOtroConvenio, setDeudaEnOtroConvenio] = useState(0);
  const [metaManual, setMetaManual] = useState("");
  const [metaCargada, setMetaCargada] = useState(false);
  const [modoFijar, setModoFijar] = useState<"cuotas" | "cuota">("cuotas");
  // Pasar de las 24 normales no se bloquea, pero hay que marcarlo a propósito (ver los DOS TOPES).
  const [excepcionConfirmada, setExcepcionConfirmada] = useState(false);
  const [cuotasInput, setCuotasInput] = useState("");
  const [cuotaInput, setCuotaInput] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [firma, setFirma] = useState<string | null>(null);
  const [verAcuerdo, setVerAcuerdo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [totalConvenios, setTotalConvenios] = useState<number | null>(null);

  // Un convenio es un compromiso de pago: sin firma y sin huella no sirve como respaldo si el
  // cliente después dice que nunca lo aceptó. La huella se captura al registrar el cliente
  // (ClientesView), donde es OPCIONAL — por eso hay clientes sin ella y hay que exigirla acá.
  // Decisión del dueño, 28-jul-2026: las dos, en las cinco puertas que crean convenios.
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { deudas } = useDeudas();
  const { profile } = useAuth();
  const clienteDelContrato = (() => {
    const c = contratos.find(x => x.id === contratoId);
    return c ? clientes.find(cl => cl.id === c.cliente_id) ?? null : null;
  })();
  const tieneHuella = !!clienteDelContrato?.autorizacion_datos_huella_url;
  // Mientras los hooks cargan no se sabe: no se bloquea por un dato que aún no llegó.
  const huellaResuelta = !!clienteDelContrato;
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    async function verificar() {
      const { data } = await supabase
        .from("convenios")
        .select("id")
        .eq("contrato_id", contratoId)
        .neq("estado", "renovado");
      setTotalConvenios((data ?? []).length);
      setVerificando(false);
    }
    verificar();
  }, [contratoId]);

  // Si no hay meta fija (caso general, no el de base inicial), se precarga con la
  // deuda pendiente ya registrada del contrato — el funcionario puede ajustarla.
  useEffect(() => {
    // `metaFija` (recuperar moto retenida, base inicial del wizard) ya NO bloquea el monto: viene
    // PRECARGADO y editable, igual que en Cartera. Antes lo dejaba de solo lectura y además
    // escondía la opción de financiar semanas — el mismo convenio se comportaba distinto según
    // por dónde entraras. Decisión del dueño, 31-jul: "un convenio es un convenio".
    if (metaFija != null) { setMetaManual(String(Math.round(metaFija))); setMetaCargada(true); return; }
    async function cargarDeuda() {
      // Solo deuda EXIGIBLE. Con `neq('pagada')` entraban también las 'en_convenio': un
      // convenio NUEVO nacía cubriendo plata que un convenio ANTERIOR ya financiaba, y el
      // cliente terminaba pagándola dos veces. Es el mismo error que corrigió la mig 070,
      // por otra puerta.
      const { data } = await supabase
        .from("deudas")
        .select("monto_pendiente, estado")
        .eq("contrato_id", contratoId)
        .in("estado", ["pendiente", "en_convenio"]);
      const filas = data ?? [];
      const total = filas.filter(d => d.estado === "pendiente").reduce((acc, d) => acc + (d.monto_pendiente ?? 0), 0);
      // Cuánta deuda queda AFUERA por estar ya dentro de otro convenio. Sin decirlo, la ventana
      // precargaba $0 en silencio y el funcionario creía que el sistema se equivocaba: Cartera le
      // mostraba $530.000 y acá salía cero (caso WILLINGTON, DQW26I). Es correcto no volver a
      // meterla —se cobraría dos veces— pero hay que decir POR QUÉ.
      setDeudaEnOtroConvenio(filas.filter(d => d.estado === "en_convenio").reduce((acc, d) => acc + (d.monto_pendiente ?? 0), 0));
      setMetaManual(String(total));
      setMetaCargada(true);
    }
    cargarDeuda();
  }, [contratoId, metaFija]);

  // ── Financiar cuotas del arriendo dentro del convenio (alivio único) ──────────────────────
  // Todo se calcula ACÁ, desde el contrato. Antes dependía de que cada pantalla pasara
  // `cuotaPeriodo` y `finPeriodoISO`: la que se olvidaba (Inmovilizaciones) simplemente no
  // mostraba la opción, y nadie se enteraba. Calculándolo adentro, las cuatro puertas ofrecen
  // lo mismo sin que haya que acordarse de nada. Los props quedan como override.
  const contratoActual = contratos.find(x => x.id === contratoId) ?? null;
  const esPeriodico = !!contratoActual && contratoActual.forma_pago !== "Diario";
  const cuotaDelPeriodo = cuotaPeriodo ?? (contratoActual ? valorPeriodoReal(contratoActual) : 0);
  // Si YA debe el período en curso, la primera semana financiada es lo que le falta de ese
  // período (parcial), no una cuota entera — si no, se le financiaría plata que ya abonó.
  const huecoHoy = contratoActual ? huecoCuotasHoy(contratoActual, hoyDate()) : 0;
  // 🔴 La semana MÁS VIEJA sin pagar puede traer un abono a medias, y financiarla COMPLETA le
  // cobra otra vez lo que ya abonó. `Math.min(hueco, cuota)` solo lo descontaba cuando el cliente
  // debía MENOS de una semana; con dos o más atrasadas se quedaba con la semana entera y el abono
  // se volvía invisible — y de paso el aviso "le quedan $X sin cubrir" salía corrido por ese mismo
  // monto. Caso real (NESTOR, YAL67H, 12-ago-2026): debía 2 semanas y llevaba $14.000 abonados a
  // la más vieja; el convenio se firmó por $202.000 cuando faltaban $188.000.

  // 🔴 EN EL CONVENIO DE LA BASE INICIAL NO SE FINANCIAN SEMANAS (25-ago-2026). Un contrato que
  // acaba de nacer tiene su primera semana PAGADA por definición: viene dentro de la base
  // ($510.000 = $308.000 de ahorro + la semana adelantada), y el wizard la registra como pago
  // `adelanto_base`. Financiarla otra vez dentro del convenio cobra la MISMA semana dos veces.
  // Barrido del 25-ago: 7 convenios inflados en $1.616.000 (OSVALDO YAL57H con 2 semanas de más;
  // MARLON RNG53H, RUBEN DQL81I, GERMÁN IGC39I y 3 más con una). La firma del defecto es exacta:
  // los 7 tenían `cubre_periodo_hasta` con fecha, los 8 sanos lo tenían vacío.
  const puedeFinanciar = esPeriodico && cuotaDelPeriodo > 0 && !sinFinanciarSemanas;
  const nFinanciadas = puedeFinanciar ? financiarN : 0;

  // Cuántas semanas trae vencidas. Antes el selector ofrecía SIEMPRE 0/1/2 sin importar cuántas
  // debiera: quien traía 3 atrasadas no tenía cómo cubrirlas, y quien traía 2 escogía 1 creyendo
  // que lo dejaba al día. Por eso las opciones llegan hasta lo que de verdad debe.
  const semanasVencidas = cuotaDelPeriodo > 0 ? Math.ceil(huecoHoy / cuotaDelPeriodo) : 0;
  // 🔴 ...pero aquel arreglo TOPÓ las opciones justo en las vencidas, y de paso quitó el poder ir
  // hacia adelante. Quedó absurdo: con el cliente al día se podían financiar 2 semanas futuras,
  // y apenas debía algo esa posibilidad desaparecía.
  // ALVARO CASTRO CHIQUILLO (XZN21H, 14-ago-2026): debía 5 semanas, el selector solo llegaba a 5,
  // y no hubo forma de meterle además la del 17 — que era justo lo que se quería para liberarle
  // la moto inmovilizada. Ahora siempre sobran 2 opciones por encima de lo vencido.
  const opcionesFinanciar = Array.from({ length: Math.min(semanasVencidas + 2, 8) + 1 }, (_, i) => i);

  // 🔴 EL SELECTOR ARRANCA EN LO QUE EL CLIENTE DEBE, no en cero.
  //
  // Nacía en 0: si el funcionario no lo tocaba, el convenio salía SIN las semanas atrasadas y el
  // cliente se iba creyendo que quedaba cubierto. Pasó CUATRO veces en dos días (ALBERT, NESTOR
  // ×2, ANDRES, JORGE BELLO) y cada arreglo costó SQL, un papel firmado inservible y una firma
  // pendiente. Con el valor de partida al derecho, olvidarse deja de costar plata: para NO meter
  // las semanas hay que bajarlo a propósito.
  //
  // Se hace una sola vez, cuando el contrato termina de cargar — después manda lo que escoja el
  // funcionario. Y solo en el caso general: cuando viene `metaFija` (base inicial del wizard,
  // recuperar una moto retenida) el monto ya trae lo atrasado adentro, y sumarle semanas encima
  // lo cobraría dos veces.
  const [nInicializado, setNInicializado] = useState(false);
  useEffect(() => {
    if (nInicializado || !puedeFinanciar) return;
    // `metaTraeSemanas` manda; si nadie lo dice, se cae al criterio viejo (vino metaFija = las
    // trae). Explícito porque de esa deducción salió el doble cobro del caso IGC46I.
    const metaTrae = metaTraeSemanas ?? (metaFija != null);
    if (!metaTrae && semanasVencidas > 0) setFinanciarN(Math.min(semanasVencidas, 8));
    setNInicializado(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puedeFinanciar, semanasVencidas]);
  // Todo el cálculo (semana parcial + ahorro que viaja adentro) vive en cicloPago.ts, probado.
  const fin = contratoActual ? financiarSemanas(contratoActual, hoyDate(), nFinanciadas) : { primera: 0, total: 0, ahorro: 0 };
  const primeraFinanciada = fin.primera;
  const cuotaSemana = fin.total;
  const ahorroFinanciado = fin.ahorro;

  // Lo que queda de arriendo SIN cubrir con lo escogido. Si es > 0, decir "paga $0 de arriendo"
  // es falso: el cliente sigue debiendo cuotas aunque el convenio quede firmado.
  const arriendoSinCubrir = Math.max(huecoHoy - cuotaSemana, 0);

  // Hasta qué día queda cubierto. Es lo que se guarda en `cubre_periodo_hasta`, y de ahí sale
  // algo MUY sensible: `CobrosView` deja de exigir TODAS las cajas anteriores a esa fecha.
  //
  // 🔴 EL DEFECTO QUE ESTO CORRIGE (8-ago-2026, lo cachó el dueño con JHEFERSON XYZ50H):
  // antes se avanzaban N días de pago desde HOY. Pero las semanas que se financian son las
  // VENCIDAS (hacia atrás), no las que vienen. Con 2 semanas vencidas y financiando 2, entraban
  // $404.000 al convenio y la fecha quedaba en 19-ago — que perdonaba TRES períodos ($606.000).
  // Le regalaba una semana entera, y por cada semana de atraso regalaba otra.
  //
  // La cuenta correcta: las N semanas tapan desde la vencida MÁS VIEJA hacia adelante, así que
  // la fecha sale del período actual corrido (N − vencidas + 1) días de pago.
  //   vencidas=2, N=2 → +1 → el período que sigue al último cubierto ✅
  //   vencidas=2, N=1 → +0 → solo tapa la más vieja, la actual la sigue debiendo ✅
  //   vencidas=0, N=1 → +2 → cubre el período que viene, como siempre ✅
  const cubreHasta = (finPeriodoISO && nFinanciadas >= 1)
    ? finPeriodoISO
    : (contratoActual ? fechaCubrePeriodo(contratoActual, hoyDate(), nFinanciadas, semanasVencidas) : null);

  const metaBase = Number(metaManual) || 0;
  const meta = metaBase + cuotaSemana;
  const { cuotas: cuotasCalc, cuota: cuotaCalc, ultima: ultimaCuota, total: totalCalculado } =
    repartirConvenio(meta, modoFijar, modoFijar === "cuotas" ? Number(cuotasInput) || 0 : Number(cuotaInput) || 0);

  // La fecha límite se calcula sola: el día de pago de la ÚLTIMA cuota pactada, avanzando tantos
  // días de pago como cuotas tenga el convenio. Antes había que escribirla a mano acá (y el campo
  // decía "primer pago", que es otra cosa). De ese dato depende que `marcar_convenios_vencidos()`
  // decida si un convenio se venció: con la fecha del PRIMER pago, un convenio de 6 cuotas nacía
  // vencido a la semana. Queda editable por si acordaron otra fecha.
  useEffect(() => {
    if (!contratoActual || cuotasCalc <= 0) return;
    // 🔴 Si se financiaron semanas, la PRIMERA cuota no cae en el período de hoy: cae en el
    // primero NO cubierto (`cubreHasta`), porque durante las semanas financiadas el cliente no
    // paga nada. Contando desde hoy, la fecha queda corta por esas mismas semanas — y entonces
    // `marcar_convenios_vencidos()` lo marca INCUMPLIDO antes de que termine de pagar, con
    // 3 incumplidos = liquidación obligatoria. (ALBERT, YAL59H: límite 14-sep y su última cuota
    // cae el 21.) Se arranca un día antes de `cubreHasta` para que la primera cuota SEA ese día.
    let d = hoyDate();
    if (cubreHasta) {
      const inicio = new Date(cubreHasta + "T00:00:00");
      if (inicio > d) d = new Date(inicio.getTime() - 86400000);
    }
    for (let i = 0; i < cuotasCalc; i++) d = proximoDiaPago(contratoActual, d);
    setFechaLimite(fechaISO(d));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuotasCalc, contratoId, cubreHasta]);

  // Cuándo cae la PRIMERA cuota. Es solo informativo — no se guarda —, pero el funcionario lo
  // necesita para decírselo al cliente en el momento de firmar. Antes este dato SÍ estaba a la
  // vista, porque el campo de fecha pedía "el primer pago" y se escribía a mano; al pasarlo a
  // "fecha límite" (que es lo que de verdad usa `marcar_convenios_vencidos()`) se perdió de
  // pantalla sin querer, y el dueño lo reportó. Se repone como renglón de lectura.
  const fechaPrimerPago = contratoActual ? fechaISO(proximoDiaPago(contratoActual, hoyDate())) : null;

  async function handleGuardar() {
    if (guardando) return;
    if (!motivo.trim()) { setError("Escribe el motivo del convenio."); return; }
    if (meta <= 0) { setError("La meta a pagar debe ser mayor a cero."); return; }
    if (cuotasCalc <= 0) { setError(modoFijar === "cuotas" ? "Ingresa el número de cuotas." : "Ingresa una cuota válida."); return; }
    // TOPE DURO: esto no es un convenio largo, es un error de dedo (ver los DOS TOPES arriba).
    if (cuotasCalc > TOPE_DURO_CUOTAS) {
      setError(
        modoFijar === "cuotas"
          ? `${fmt(cuotasCalc)} cuotas no es un plazo, es un error: el máximo es ${TOPE_DURO_CUOTAS}. ¿Escribiste ahí el VALOR de la cuota? Para eso usa el botón "Fijar por valor de cuota".`
          : `Con una cuota de $${fmt(Number(cuotaInput))} saldrían ${fmt(cuotasCalc)} cuotas, y el máximo es ${TOPE_DURO_CUOTAS}. Sube el valor de la cuota.`,
      );
      return;
    }
    // NORMA: pasar de 24 se permite, pero a propósito y con rastro.
    if (cuotasCalc > CUOTAS_NORMALES && !excepcionConfirmada) {
      setError(`Son ${cuotasCalc} cuotas y lo normal son ${CUOTAS_NORMALES}. Si es a propósito, marca la casilla de abajo para dejarlo por escrito.`);
      return;
    }
    if (!fechaLimite) { setError("Selecciona la fecha límite (la de la última cuota)."); return; }
    if (huellaResuelta && !tieneHuella) {
      setError(`${clienteNombre.toUpperCase()} no tiene la huella registrada. Regístrasela primero en su ficha (Clientes → el cliente → Editar) y vuelve a intentar.`);
      return;
    }
    if (!firma) { setError("Falta la firma del acuerdo. El cliente debe firmar antes de crear el convenio."); return; }
    if (totalConvenios !== null && totalConvenios >= 3) { setError("Este contrato ya tiene 3 convenios (máximo permitido)."); return; }

    setError(null);
    setGuardando(true);

    // ¿Ya hay un convenio activo? Sin .single() — reventaba con >1 fila (dejaba pasar el 3º).
    const { data: activos } = await supabase
      .from("convenios")
      .select("id")
      .eq("contrato_id", contratoId)
      .eq("estado", "activo")
      .limit(1);

    if (activos && activos.length > 0) {
      setError("Ya existe un convenio activo para este contrato.");
      setGuardando(false);
      return;
    }

    const { data: countData } = await supabase
      .from("convenios")
      .select("id")
      .eq("contrato_id", contratoId)
      .neq("estado", "renovado");

    const count = (countData ?? []).length;

    // La firma va a Storage antes del insert: si falla la subida, el convenio no se crea —
    // preferible a dejar un convenio sin su respaldo. Mismo bucket y ruta que usa Cartera.
    const path = `convenios/${contratoId}/acuerdo_${Date.now()}.png`;
    const blob = await (await fetch(firma)).blob();
    const { error: errSub } = await supabase.storage.from("documentos").upload(path, blob, { contentType: "image/png", upsert: true });
    if (errSub) { setError("No se pudo subir la firma: " + errSub.message); setGuardando(false); return; }
    const firmaUrl = supabase.storage.from("documentos").getPublicUrl(path).data.publicUrl;

    const { error: err } = await supabase.from("convenios").insert({
      contrato_id: contratoId,
      numero_convenio: count + 1,
      deuda_total: meta,
      // EL DESGLOSE, congelado. `deuda_total` es una sola cifra y adentro hay dos cosas que se
      // comportan distinto: la deuda vieja NO genera ahorro, la semana de arriendo SÍ. Sin
      // guardarlo, después es imposible saber cuánto del convenio era semana — y no se puede
      // acreditar el ahorro que le corresponde al cliente. La pantalla ya lo sabía y lo mostraba;
      // solo se guardaba la suma.
      monto_deudas: metaBase,
      monto_semanas: cuotaSemana,
      ahorro_semanas: ahorroFinanciado,
      cajas_financiadas: nFinanciadas,
      cuota_por_periodo: cuotaCalc,
      numero_cuotas: cuotasCalc,
      cuotas_pagadas: 0,
      fecha_limite: fechaLimite,
      estado: "activo",
      // Rastro de la excepción: queda DENTRO del motivo, que es lo que se imprime en el acuerdo
      // y se ve en la ficha. Así nadie tiene que ir a buscar por qué este convenio salió largo.
      concepto: cuotasCalc > CUOTAS_NORMALES
        ? `${motivo.trim()} [Excepción: ${cuotasCalc} cuotas, más de las ${CUOTAS_NORMALES} normales]`
        : motivo.trim(),
      // QUIÉN LO HIZO (no quién lo autorizó — aclaración del dueño): el funcionario que se sentó
      // con el cliente y armó el acuerdo. La columna se llama `aprobado_por` por historia, pero
      // lo que guarda es el autor. La ventana insertaba `null` porque no pasaba por el hook
      // `crearConvenio`, que sí lo guardaba, y se perdía el rastro de quién lo hizo.
      aprobado_por: profile?.id ?? null,
      cubre_periodo_hasta: cuotaSemana > 0 ? cubreHasta : null,
      firma_url: firmaUrl,
    });

    setGuardando(false);

    if (err) {
      // 23505 = el candado único de la BD rechazó un 2º convenio activo (doble-clic/carrera).
      setError(err.code === "23505" ? "Ya existe un convenio activo para este contrato." : err.message);
      return;
    }

    setExito(true);
    setTimeout(() => onClose(), 1500);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 300 }}
      onClick={obligatorio ? undefined : onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 500, background: "var(--card)", borderRadius: 20, padding: 24, display: "grid", gap: 16,
          // La ventana debe scrollear POR DENTRO. Sin esto se salía de la pantalla y el gesto se
          // lo llevaba la página de atrás: la ventana quedaba quieta y el fondo corría por debajo.
          maxHeight: "calc(100dvh - 32px)", overflowY: "auto", boxSizing: "border-box" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>🤝 {obligatorio ? "Convenio obligatorio" : "Nuevo convenio"}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2, textTransform: "uppercase" }}>{clienteNombre}</div>
          </div>
          {!obligatorio && (
            <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, padding: "6px 12px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✕</button>
          )}
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", fontSize: 13, color: "var(--warn-ink)", fontWeight: 600 }}>
          {obligatorio
            ? "⚠️ Falta base inicial. Debes registrar el convenio para poder continuar."
            : "⚠️ El convenio se paga ENCIMA del pago normal. No reemplaza la cuota."}
        </div>

        {verificando || (metaFija == null && !metaCargada) ? (
          <div style={{ color: "var(--muted)", fontSize: 14 }}>Cargando datos del contrato...</div>
        ) : totalConvenios !== null && totalConvenios >= 3 ? (
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--bad-soft)", border: "1px solid var(--bad-line)", fontSize: 14, color: "var(--bad-ink)", fontWeight: 700 }}>
            Este contrato ya tiene 3 convenios (máximo permitido). No se pueden crear más.
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              Convenios usados: <strong>{totalConvenios} / 3</strong>
            </div>

            <div>
              <div style={labelStyle}>Motivo del convenio</div>
              <textarea
                style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                placeholder="Describe el motivo del convenio..."
              />
            </div>

            <div>
              {/* Decía "Meta a pagar (total del convenio)" y NO era el total: las semanas
                  financiadas se suman aparte y el funcionario tenía que hacer la cuenta de
                  cabeza. El total real se muestra ahora abajo, apenas se escogen las semanas. */}
              <div style={labelStyle}>Deuda a financiar</div>
              {/* Sin esto la ventana mostraba $0 en silencio y parecía un error del sistema:
                  Cartera decía "debe $530.000" y acá salía cero (caso WILLINGTON, DQW26I). */}
              {deudaEnOtroConvenio > 0 && (
                <div style={{ fontSize: 12, color: "var(--warn-ink)", background: "var(--warn-soft)", border: "1px solid var(--warn-line)", borderRadius: 10, padding: "9px 11px", marginBottom: 8, lineHeight: 1.5 }}>
                  ⚠️ Este cliente ya tiene <strong>$ {fmt(deudaEnOtroConvenio)}</strong> de deuda dentro de otro convenio activo.
                  Esa plata <strong>no se vuelve a incluir acá</strong> para no cobrársela dos veces — por eso el monto sale
                  más bajo que el "debe" de Cartera.
                  <span style={{ display: "block", marginTop: 4 }}>
                    Si lo que quieres es reacomodarle TODA la deuda, primero elimina el convenio viejo desde su ficha
                    (sus deudas vuelven solas a quedar disponibles) y vuelve a entrar acá.
                  </span>
                </div>
              )}
              {metaFija != null && (
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  {metaBloqueada
                    ? <>Son <strong>$ {fmt(metaFija)}</strong> — {metaNota ?? "lo que tiene pendiente"}. Lo calcula el sistema y no se puede cambiar.</>
                    : <>Sugerido: <strong>$ {fmt(metaFija)}</strong> — {metaNota ?? "lo que tiene pendiente"}. Puedes ajustarlo.</>}
                </div>
              )}
              {metaBloqueada ? (
                <div style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line)", background: "var(--soft2)", fontSize: 17, fontWeight: 700, color: "var(--text)" }}>
                  $ {fmt(metaBase)}
                </div>
              ) : (
                <MoneyInput label="" value={metaManual} onChange={setMetaManual} placeholder="$ 0" />
              )}
            </div>

            {puedeFinanciar && (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--soft2)", border: "1px solid var(--line)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted2)", marginBottom: 8 }}>
                  ¿Cuántas semanas de cuota le financias ahora?
                  <span style={{ display: "block", fontWeight: 400, color: "var(--muted)", marginTop: 2 }}>
                    Se las metes al convenio: no las paga aparte y no cuentan mora.
                  </span>
                </div>
                {/* Cuántas semanas trae VENCIDAS. Sin esto el funcionario no tenía cómo saber que
                    escogiendo 1 dejaba otra sin cubrir (caso JHEFERSON, XYZ50H: 2 vencidas y la
                    ventana decía "paga $0 de arriendo" financiando una sola). */}
                {semanasVencidas > 0 && (
                  <div style={{ fontSize: 12, color: "var(--warn-ink)", background: "var(--warn-soft)", borderRadius: 8, padding: "7px 10px", marginBottom: 8, lineHeight: 1.45 }}>
                    Trae <strong>{semanasVencidas} semana{semanasVencidas > 1 ? "s" : ""} vencida{semanasVencidas > 1 ? "s" : ""}</strong> ($ {fmt(huecoHoy)}),
                    y {semanasVencidas > 1 ? "ya vienen escogidas" : "ya viene escogida"} para que
                    quede al día. Si no {semanasVencidas > 1 ? "las quieres" : "la quieres"} meter
                    al acuerdo, bájalo a 0 — pero entonces {semanasVencidas > 1 ? "las sigue" : "la sigue"} debiendo aparte.
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  {opcionesFinanciar.map(n => (
                    <button key={n} type="button" onClick={() => setFinanciarN(n)}
                      style={{ flex: 1, padding: "8px 10px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14,
                        border: `2px solid ${financiarN === n ? "var(--accent)" : "var(--line)"}`,
                        background: financiarN === n ? "var(--accent-soft2)" : "var(--card)",
                        color: financiarN === n ? "var(--accent)" : "var(--muted)" }}>
                      {n}
                    </button>
                  ))}
                </div>
                {nFinanciadas >= 1 && (
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, lineHeight: 1.5 }}>
                    Se financian <strong>{nFinanciadas}</strong> semana{nFinanciadas > 1 ? "s" : ""} = <strong>$ {fmt(cuotaSemana)}</strong> al convenio.
                    {arriendoSinCubrir > 0
                      ? <> Pero le quedan <strong style={{ color: "var(--bad-ink)" }}>$ {fmt(arriendoSinCubrir)}</strong> de arriendo
                          SIN cubrir: con esto <strong>no queda al día</strong>. Sube a {semanasVencidas} para taparlo todo.</>
                      : <> El cliente paga <strong>$0 de arriendo</strong> hasta el <strong>{cubreHasta ?? "—"}</strong>.</>}
                    {huecoHoy > 0 && huecoHoy < cuotaDelPeriodo && (
                      <span style={{ display: "block", marginTop: 2 }}>
                        La primera va por <strong>$ {fmt(primeraFinanciada)}</strong>, que es lo que le falta del período en curso — el resto ya lo abonó.
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* EL TOTAL, con la cuenta a la vista. Antes solo aparecía después de escribir el
                número de cuotas — o sea, después de decidir. Y el campo de arriba decía "total"
                sin serlo, así que el funcionario sumaba de cabeza deuda + semanas. */}
            {meta > 0 && (
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--accent-soft4)", border: "1px solid var(--accent-line)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-ink)", textTransform: "uppercase" }}>Total del convenio</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--accent-ink)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>$ {fmt(meta)}</div>
                {cuotaSemana > 0 && (
                  <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4 }}>
                    Deuda $ {fmt(metaBase)} + {nFinanciadas} semana{nFinanciadas > 1 ? "s" : ""} $ {fmt(cuotaSemana)}
                  </div>
                )}
              </div>
            )}

            {/* 🔴 EL AVISO QUE FALTABA. Esta confusión se repitió TRES veces en un solo día
                (ALBERT, y NESTOR dos veces): el funcionario firma el convenio creyendo que le
                tapó la semana en curso, y a los tres días al cliente le llega un cobro. El
                formulario ya avisaba "trae N vencidas", pero en abstracto y arriba de todo.
                Acá va con FECHA y MONTO concretos, y justo antes del botón de guardar — que es
                donde de verdad se lee. Arreglar uno de esos casos costó SQL, un papel firmado
                que quedó inservible y una firma pendiente. */}
            {meta > 0 && puedeFinanciar && (
              <div style={{
                padding: "10px 12px", borderRadius: 12, fontSize: 13, lineHeight: 1.5,
                background: arriendoSinCubrir > 0 ? "var(--bad-line)" : "var(--ok-line)",
                color: arriendoSinCubrir > 0 ? "var(--bad-ink)" : "var(--ok-ink)",
              }}>
                {arriendoSinCubrir > 0 ? (
                  <>Con esto <strong>NO queda al día</strong>. Le siguen quedando{" "}
                  <strong>$ {fmt(arriendoSinCubrir)}</strong> de arriendo que debe pagar aparte del
                  acuerdo. Sube a {semanasVencidas} semana{semanasVencidas > 1 ? "s" : ""} para taparlo todo.</>
                ) : (
                  <>Queda en <strong>$0</strong> hasta el{" "}
                  <strong>{cubreHasta ? fmtFechaLarga(cubreHasta) : "—"}</strong>. Ese día paga{" "}
                  <strong>$ {fmt(cuotaDelPeriodo + cuotaCalc)}</strong> — su cuota de $ {fmt(cuotaDelPeriodo)}{" "}
                  más $ {fmt(cuotaCalc)} del acuerdo.</>
                )}
              </div>
            )}

            <div>
              <div style={labelStyle}>Fijar por</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setModoFijar("cuotas")} style={{
                  flex: 1, padding: "8px 12px", borderRadius: 10, border: `2px solid ${modoFijar === "cuotas" ? "var(--accent)" : "var(--line)"}`,
                  background: modoFijar === "cuotas" ? "var(--accent-soft2)" : "var(--card)", color: modoFijar === "cuotas" ? "var(--accent)" : "var(--muted)",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}>
                  Número de cuotas
                </button>
                <button onClick={() => setModoFijar("cuota")} style={{
                  flex: 1, padding: "8px 12px", borderRadius: 10, border: `2px solid ${modoFijar === "cuota" ? "var(--accent)" : "var(--line)"}`,
                  background: modoFijar === "cuota" ? "var(--accent-soft2)" : "var(--card)", color: modoFijar === "cuota" ? "var(--accent)" : "var(--muted)",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}>
                  Valor de la cuota
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {modoFijar === "cuotas" ? (
                <div>
                  <div style={labelStyle}>Número de cuotas</div>
                  <input type="number" min="1" style={inputStyle} value={cuotasInput} onChange={e => setCuotasInput(e.target.value)} placeholder="Ej. 4" />
                </div>
              ) : (
                <MoneyInput label="Valor de la cuota" value={cuotaInput} onChange={setCuotaInput} placeholder="$ 100.000" />
              )}
              <div>
                <div style={labelStyle}>{modoFijar === "cuotas" ? "Cuota (calculada)" : "N° de cuotas (calculado)"}</div>
                <div style={{ ...inputStyle, background: "var(--soft)", color: "var(--muted)", fontWeight: 700 }}>
                  {modoFijar === "cuotas" ? (cuotaCalc > 0 ? `$ ${fmt(cuotaCalc)}` : "—") : (cuotasCalc > 0 ? cuotasCalc : "—")}
                </div>
              </div>
            </div>

            {totalCalculado > 0 && (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--accent-soft3)", border: "1px solid var(--accent-line)", fontSize: 14, fontWeight: 700, color: "var(--accent-ink)" }}>
                Total del convenio: $ {fmt(totalCalculado)}
                {/* La frase en cristiano es la que de verdad ataja el error: leer "$9 cada semana
                    durante 60.000 semanas" salta a la vista mucho antes que ver un 60000 en una
                    casilla. Va debajo del total, que es donde el ojo ya está mirando.
                    Y dice la ÚLTIMA aparte, porque esa es la regla del dueño: la cuota se respeta
                    tal cual y la última se lleva el resto. */}
                <div style={{ fontWeight: 400, fontSize: 13, marginTop: 4, color: "var(--accent-ink)" }}>
                  {ultimaCuota !== cuotaCalc && cuotasCalc > 1 ? (
                    <>
                      El cliente paga <strong>$ {fmt(cuotaCalc)}</strong> cada período, <strong>{cuotasCalc - 1}</strong> {cuotasCalc - 1 === 1 ? "vez" : "veces"},
                      y la <strong>última de $ {fmt(ultimaCuota)}</strong>.
                    </>
                  ) : (
                    <>El cliente paga <strong>$ {fmt(cuotaCalc)}</strong> cada período, <strong>{cuotasCalc}</strong> {cuotasCalc === 1 ? "vez" : "veces"}.</>
                  )}
                </div>
              </div>
            )}

            {/* Aviso ANTES de intentar guardar: el error de handleGuardar solo aparece al tocar el
                botón, y para entonces ya se escribió todo. */}
            {cuotasCalc > TOPE_DURO_CUOTAS ? (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--bad-soft)", border: "1px solid var(--bad-line)", fontSize: 13, fontWeight: 600, color: "var(--bad-ink)" }}>
                ⛔ Son <strong>{fmt(cuotasCalc)} cuotas</strong>. Eso no es un plazo, es un error de dedo.
                {modoFijar === "cuotas"
                  ? <> ¿Querías escribir el <strong>valor</strong> de la cuota? Usa el botón “Fijar por valor de cuota”.</>
                  : <> Sube el valor de la cuota.</>}
              </div>
            ) : cuotasCalc > CUOTAS_NORMALES && (
              /* NO bloquea: solo pide marcarlo a propósito. Un convenio con la cuota impagable es
                 peor que uno largo — de 78 activos, 25 no tienen un solo abono. */
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", color: "var(--warn-ink)" }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  Este acuerdo es más largo de lo normal: {fmt(cuotasCalc)} cuotas.
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>
                  Lo usual son hasta {CUOTAS_NORMALES}. Se puede hacer, pero conviene revisar si al
                  cliente le sirve mejor una cuota más alta en menos tiempo. Si es a propósito,
                  márcalo aquí y queda escrito en el acuerdo.
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 9, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={excepcionConfirmada}
                    onChange={e => setExcepcionConfirmada(e.target.checked)}
                    style={{ width: 18, height: 18, flexShrink: 0, cursor: "pointer" }}
                  />
                  Sí, este cliente necesita el plazo largo
                </label>
              </div>
            )}

            {fechaPrimerPago && (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--soft2)", border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: "var(--muted2)", minWidth: 0 }}>Primera cuota</span>
                  <strong style={{ fontSize: 13.5, color: "var(--text)" }}>{fmtFechaLarga(fechaPrimerPago)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
                  <span style={{ fontSize: 13, color: "var(--muted2)", minWidth: 0 }}>Última cuota</span>
                  <strong style={{ fontSize: 13.5, color: "var(--text)" }}>{cuotasCalc > 0 && fechaLimite ? fmtFechaLarga(fechaLimite) : "— falta definir las cuotas"}</strong>
                </div>
              </div>
            )}

            <div>
              <div style={labelStyle}>Fecha límite (última cuota)</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                Se calcula sola avanzando {cuotasCalc > 0 ? cuotasCalc : "N"} día{cuotasCalc === 1 ? "" : "s"} de pago
                desde hoy. Puedes cambiarla si acordaron otra.
              </div>
              <input
                type="date"
                style={inputStyle}
                value={fechaLimite}
                onChange={e => setFechaLimite(e.target.value)}
              />
            </div>

            {/* La huella no se puede capturar desde acá (necesita el lector conectado y el
                formulario del cliente): se avisa temprano y se dice a dónde ir, en vez de dejar
                que llene todo el formulario y descubra el bloqueo al final. */}
            {huellaResuelta && !tieneHuella && (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--bad-soft)", border: "1px solid var(--bad-line)", fontSize: 13, fontWeight: 600, color: "var(--bad-ink)" }}>
                ⛔ <strong>{clienteNombre.toUpperCase()} no tiene la huella registrada.</strong> Sin huella no se puede
                crear el convenio. Regístrasela en Clientes → el cliente → Editar, y vuelve acá.
              </div>
            )}

            {/* El cliente tiene que poder LEER lo que está firmando. Esto solo existía en Cartera;
                al unificar habría desaparecido de las otras tres puertas. */}
            <div style={{ borderTop: "1px dashed var(--line2)", paddingTop: 12, display: "grid", gap: 10 }}>
              <button type="button" onClick={() => setVerAcuerdo(v => !v)}
                style={{ background: "var(--soft)", color: "var(--muted2)", border: "none", borderRadius: 12, padding: "9px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {verAcuerdo ? "Ocultar acuerdo" : "👁 Ver acuerdo de pago (para que el cliente lo lea)"}
              </button>
              {verAcuerdo && clienteDelContrato && contratoActual && (
                <div style={{ border: "1px solid var(--line)", borderRadius: 12, maxHeight: 340, overflowY: "auto", background: "var(--card)" }}
                  dangerouslySetInnerHTML={{ __html: generarHTMLAcuerdoPago(
                    clienteDelContrato,
                    (contratoActual.moto_id ? motos.find(m => m.id === contratoActual.moto_id) : null) ?? null,
                    deudas.filter(d => d.contrato_id === contratoId && d.estado !== "pagada"),
                    { deuda_total: meta, cuota_por_periodo: cuotaCalc, numero_cuotas: cuotasCalc, firma_url: firma },
                    infoFinContrato(contratoActual),
                  ) }} />
              )}
            </div>

            <div>
              <div style={labelStyle}>Firma del cliente</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                El cliente firma aceptando el acuerdo de pago. Sin firma no se crea el convenio.
              </div>
              <CanvasFirma key="firma-convenio" label="Firma del cliente" modal opcional={false} onChange={setFirma} />
            </div>

            {error && (
              <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13 }}>{error}</div>
            )}

            {exito && (
              <div style={{ color: "var(--ok-ink)", background: "var(--ok-soft)", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
                Convenio creado correctamente.
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              {!obligatorio && (
                <button onClick={onClose} style={{ background: "var(--soft)", color: "var(--muted2)", border: "none", borderRadius: 14, padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                  Cancelar
                </button>
              )}
              <button
                onClick={handleGuardar}
                disabled={guardando || exito || !firma || (huellaResuelta && !tieneHuella)}
                style={{ background: "var(--accent-soft3)", color: "var(--accent-ink)", border: "none", borderRadius: 14, padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: (guardando || !firma || (huellaResuelta && !tieneHuella)) ? 0.6 : 1 }}
              >
                {guardando ? "Guardando..." : "Crear convenio"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
