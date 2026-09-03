/**
 * ESPEJO EN TS DEL MOTOR DE REPARTO v2 (`aplicar_pago_confirmado`, mig 045).
 *
 * Por qué existe: el reparto de cada peso vive en un trigger de plpgsql que no se puede correr
 * con `npm test`. Sin un espejo, cualquier cambio en esa función —la pieza más delicada del
 * sistema— se prueba directamente sobre la plata de los clientes. Esta función reproduce el orden
 * exacto del trigger para poder fijarlo con pruebas ANTES de tocarlo, y para que la pantalla
 * pueda anticipar a dónde irá un pago sin adivinar.
 *
 * 🔴 REGLA: esto y el trigger son ESPEJOS. Si se toca uno hay que tocar el otro, o la pantalla
 * dirá una cosa y el motor cobrará otra. Es la misma regla que ya rige entre `cajas_exigidas`
 * (SQL) y `cajasExigidasHasta` (TS).
 *
 * NO confundir con `calcularAplicacion` (usePagos): ese es el espejo del carril VIEJO (v1 y
 * diarios), que reparte contra la cuota del período. Este es el del libro de cajas.
 */

export type DeudaReparto = {
  montoPendiente: number;
  /** Las multas de recolección se cobran antes que el resto (order by en el trigger). */
  esMulta?: boolean;
  /** La lavada del vehículo va justo detrás de la multa (mig 123, pedido del dueño 2-sep). */
  esLavada?: boolean;
};

/**
 * El orden en que el motor recorre las deudas: multa → lavada → las demás, de la más antigua a
 * la más nueva (la lista llega ya en orden de `created_at` y ese orden se respeta dentro de cada
 * grupo). Espejo del `order by (concepto = 'multa_recoleccion') desc, (concepto = 'lavada') desc,
 * created_at` del trigger.
 *
 * Por qué la lavada va segunda y no "por antigüedad": nace el día en que se recibe la moto, así
 * que siempre sería la más nueva y esperaría detrás de cualquier deuda vieja del Excel. El dueño
 * la quiere cobrada de primera junto con la multa.
 */
export function ordenarDeudasReparto<T extends DeudaReparto>(deudas: T[]): T[] {
  const peso = (d: DeudaReparto) => (d.esMulta ? 0 : d.esLavada ? 1 : 2);
  return deudas
    .map((d, i) => ({ d, i }))
    .sort((a, b) => peso(a.d) - peso(b.d) || a.i - b.i)
    .map(x => x.d);
}

/**
 * De lo que un pago aplicó a deudas, cuánto fue a la multa y cuánto a la lavada. Es lo que el
 * motor anota en `pagos.aplicado_multa` (mig 085) y `pagos.aplicado_lavada` (mig 123) para que la
 * caja diaria las muestre aparte.
 *
 * Funciona SOLO porque el motor las cobra en ese orden: la multa es lo primero que recibe el
 * dinero de deudas, y la lavada lo segundo. Si algún día cambia el orden, esta cuenta miente.
 */
export function separarMultaYLavada(aplicadoDeuda: number, multaAntes: number, lavadaAntes: number): { multa: number; lavada: number } {
  const deuda = Math.max(aplicadoDeuda, 0);
  const multa = Math.min(deuda, Math.max(multaAntes, 0));
  const lavada = Math.min(Math.max(deuda - multa, 0), Math.max(lavadaAntes, 0));
  return { multa, lavada };
}

/**
 * Cuántas cuotas del convenio están EXIGIDAS a una fecha — el freno que le faltaba al motor.
 *
 * Se ancla a `fecha_inicio_cajas` + múltiplos del período, EL MISMO RELOJ que usa
 * `cajas_exigidas`. Es a propósito: si el convenio contara sus períodos por su lado, podría
 * decir "te exijo 3 cuotas" mientras las cajas dicen "te exijo 2 semanas", y el paquete dejaría
 * de ir parejo — que es justo lo que la regla del dueño prohíbe.
 *
 * Qué NO cuenta (mismas reglas que `cuotaConvenioDelPeriodo` en cicloPago):
 *   · los períodos anteriores a la firma del convenio;
 *   · los que el convenio ya cubre por dentro (`cubre_periodo_hasta`: semanas financiadas);
 *   · el período del prorrateo — regla del dueño 12-ago: el convenio arranca el siguiente
 *     período completo, no el día en que solo se cobran los días que rodó;
 *   · los rodados por moto guardada (`periodos_exonerados`, mig 118): no se perdonan, se
 *     corren al final, así que se restan ANTES del tope de `deuda_total`.
 */
export function cuotasConvenioExigidas(
  convenio: {
    cuotaPorPeriodo: number;
    deudaTotal: number;
    creadoISO: string;
    cubrePeriodoHastaISO?: string | null;
    periodosExonerados?: number | null;
  },
  contrato: {
    fechaInicioCajasISO: string;
    diasDelPeriodo: number;      // 7 semanal · 15 quincenal · 30 mensual
    prorrateoTotal?: number;
  },
  hoyISO: string,
): { periodos: number; exigido: number } {
  const vacio = { periodos: 0, exigido: 0 };
  if (convenio.cuotaPorPeriodo <= 0 || !contrato.fechaInicioCajasISO) return vacio;
  const dias = contrato.diasDelPeriodo > 0 ? contrato.diasDelPeriodo : 7;
  const DIA = 86_400_000;
  const inicioCajas = Date.parse(contrato.fechaInicioCajasISO + "T00:00:00Z");
  const hoy = Date.parse(hoyISO + "T00:00:00Z");
  if (Number.isNaN(inicioCajas) || Number.isNaN(hoy) || hoy < inicioCajas) return vacio;

  /** Inicio del período que contiene esa fecha, sobre el reloj de las cajas. */
  const inicioDe = (t: number) =>
    inicioCajas + Math.floor((t - inicioCajas) / DIA / dias) * dias * DIA;

  // Desde cuándo empieza a correr: el primer período que sí paga cuota.
  let desde = Date.parse(convenio.creadoISO.slice(0, 10) + "T00:00:00Z");
  if (convenio.cubrePeriodoHastaISO) {
    const cubre = Date.parse(convenio.cubrePeriodoHastaISO.slice(0, 10) + "T00:00:00Z");
    if (!Number.isNaN(cubre) && cubre > desde) desde = cubre;
  }
  // Durante el prorrateo el convenio no corre: arranca el período siguiente.
  if ((contrato.prorrateoTotal ?? 0) > 0) {
    const trasProrrateo = inicioCajas + dias * DIA;
    if (trasProrrateo > desde) desde = trasProrrateo;
  }
  if (desde < inicioCajas) desde = inicioCajas;
  // Redondear al primer inicio de período que sea >= `desde`.
  let primero = inicioDe(desde);
  if (primero < desde) primero += dias * DIA;

  const actual = inicioDe(hoy);
  let periodos = actual < primero ? 0 : Math.floor((actual - primero) / DIA / dias) + 1;
  periodos = Math.max(periodos - (convenio.periodosExonerados ?? 0), 0);
  return { periodos, exigido: Math.min(periodos * convenio.cuotaPorPeriodo, convenio.deudaTotal) };
}

/**
 * Días de gracia para el PREPAGO: cuántos días antes de su día de pago se acepta que el cliente
 * pague el período que arranca.
 *
 * Por qué existe (decisión del dueño, 29-ago-2026 — caso DANIEL MILLÁN, RLT87H): él paga los
 * lunes y pagó el SÁBADO sus $230.000 de siempre. Para el motor, ese sábado no había ninguna
 * semana exigida (la del lunes anterior ya estaba paga), así que el dinero cayó al convenio y el
 * lunes DANIEL aparecía debiendo su semana, habiendo pagado dos días antes.
 *
 * No es un adelanto: es pagar a tiempo, un poco antes. Con la ventana, su pago del sábado llena
 * la caja del lunes y el paquete se reparte parejo solo.
 *
 * NO rompe la regla de "el excedente no llena cajas futuras": esa caja ya no es futura, está
 * dentro de la ventana de cobro. Lo que sobre DESPUÉS sigue yendo a saldo a favor, para aplicarse
 * a mano — como manda la regla del 12-ago.
 */
export const DIAS_GRACIA_PREPAGO = 3;

/** La fecha con la que hay que preguntarle a `cajas_exigidas` por un pago de esta fecha. */
export function fechaConGraciaPrepago(fechaPagoISO: string): string {
  const d = new Date(fechaPagoISO + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return fechaPagoISO;
  d.setUTCDate(d.getUTCDate() + DIAS_GRACIA_PREPAGO);
  return d.toISOString().slice(0, 10);
}

export type EntradaReparto = {
  monto: number;
  /** 'adelanto_base' no paga prorrateo y puede llenar su caja aunque no esté exigida. */
  tipoRegistro?: string | null;
  /** Con el contrato suspendido, la multa de recolección se cobra ANTES que todo. */
  contratoSuspendido?: boolean;
  prorrateoTotal?: number;
  prorrateoPagado?: number;
  prorrateoAhorro?: number;
  /** Valor de una caja (el período completo) y cuánto de ella es ahorro. */
  cajaValor: number;
  cajaAhorro?: number;
  cajasPagadas: number;
  cajaActualPagado?: number;
  totalCajas?: number | null;
  /** Lo que devuelve `cajas_exigidas(contrato, fecha_del_pago)`. */
  cajasExigidas: number;
  deudas?: DeudaReparto[];
  /** Saldo que le falta al convenio: `deuda_total − abonado_total`. */
  convenioPendiente?: number;
  /** Lo que el convenio tiene EXIGIDO a la fecha del pago (de `cuotasConvenioExigidas`). */
  convenioExigido?: number;
  /** Lo que ya se le abonó al convenio ANTES de este pago. */
  convenioAbonado?: number;
};

export type ResultadoReparto = {
  prorrateo: number;
  tarifa: number;
  deuda: number;
  convenio: number;
  saldo: number;
  ahorro: number;
  /** Cómo queda el contrato después del pago. */
  cajasPagadas: number;
  cajaActualPagado: number;
  /** Las deudas después del pago, en el ORDEN en que el motor las recorrió (multa → lavada →
   *  demás). Sirve para probar a cuál le llegó cada peso, no solo el total. */
  deudasRestantes: DeudaReparto[];
};

/** Ahorro que entra al llenar una caja de `pagado` a `pagado + delta`, con tarifa-primero:
 *  los ÚLTIMOS `ahorroCaja` pesos de la caja son los del ahorro, no una proporción. */
function ahorroDelTramo(pagado: number, delta: number, valor: number, ahorroCaja: number): number {
  const umbral = valor - ahorroCaja;
  const antes = Math.min(Math.max(pagado - umbral, 0), ahorroCaja);
  const despues = Math.min(Math.max(pagado + delta - umbral, 0), ahorroCaja);
  return despues - antes;
}

export function repartirPagoV2(e: EntradaReparto): ResultadoReparto {
  // Copia ORDENADA como la recorre el motor (multa → lavada → demás por antigüedad).
  const deudas = ordenarDeudasReparto((e.deudas ?? []).map(d => ({ ...d })));
  const r: ResultadoReparto = {
    prorrateo: 0, tarifa: 0, deuda: 0, convenio: 0, saldo: 0, ahorro: 0,
    cajasPagadas: e.cajasPagadas,
    cajaActualPagado: e.cajaActualPagado ?? 0,
    deudasRestantes: deudas,
  };
  let monto = e.monto;
  if (monto <= 0) return r;

  const cajaValor = e.cajaValor;
  const cajaAhorro = e.cajaAhorro ?? 0;
  const totalCajas = e.totalCajas ?? Number.MAX_SAFE_INTEGER;

  // 0) Contrato SUSPENDIDO (moto retenida): la multa de recolección y la lavada se cobran antes
  //    que nada — son el costo de haber ido a buscar la moto, y el cliente la recupera más rápido
  //    (lavada en este grupo: decisión del dueño, 3-sep-2026, mig 123).
  if (e.contratoSuspendido) {
    for (const d of deudas) {
      if (monto <= 0) break;
      if (!(d.esMulta || d.esLavada) || d.montoPendiente <= 0) continue;
      const delta = Math.min(monto, d.montoPendiente);
      d.montoPendiente -= delta;
      r.deuda += delta;
      monto -= delta;
    }
  }

  // 1) Caja 0: el prorrateo. El adelanto de la base no lo paga: va directo a la Caja 1.
  const prorrTotal = e.prorrateoTotal ?? 0;
  const prorrPagado = e.prorrateoPagado ?? 0;
  const prorrAhorro = e.prorrateoAhorro ?? 0;
  const faltaProrr = e.tipoRegistro === "adelanto_base" ? 0 : Math.max(prorrTotal - prorrPagado, 0);
  if (faltaProrr > 0) {
    const delta = Math.min(monto, faltaProrr);
    r.ahorro += ahorroDelTramo(prorrPagado, delta, prorrTotal, prorrAhorro);
    r.prorrateo = delta;
    monto -= delta;
  }

  // 2) Cajas FIFO — SOLO hasta las exigidas hoy. El excedente NO llena cajas futuras.
  let exigidas = e.cajasExigidas;
  if (e.tipoRegistro === "adelanto_base") exigidas = Math.max(exigidas, r.cajasPagadas + 1);
  while (monto > 0 && r.cajasPagadas < totalCajas && r.cajasPagadas < exigidas && cajaValor > 0) {
    const delta = Math.min(monto, cajaValor - r.cajaActualPagado);
    r.ahorro += ahorroDelTramo(r.cajaActualPagado, delta, cajaValor, cajaAhorro);
    r.cajaActualPagado += delta;
    r.tarifa += delta;
    monto -= delta;
    if (r.cajaActualPagado >= cajaValor) { r.cajasPagadas += 1; r.cajaActualPagado = 0; }
  }

  // 3) Deudas — multa de recolección primero, la lavada segunda, después las más antiguas
  //    (`deudas` ya viene en ese orden, ver ordenarDeudasReparto).
  for (const d of deudas) {
    if (monto <= 0) break;
    if (d.montoPendiente <= 0) continue;
    const delta = Math.min(monto, d.montoPendiente);
    d.montoPendiente -= delta;
    r.deuda += delta;
    monto -= delta;
  }

  // 4) Convenio activo — TOPADO A LO EXIGIDO (el freno que faltaba).
  //
  // Antes recibía hasta TODO su saldo pendiente. Las cajas tenían freno y el convenio no, así
  // que a quien pagaba su paquete ANTES de su día de pago se le iba todo al convenio y la
  // semana quedaba descubierta. Caso real DANIEL MILLÁN (RLT87H, 29-ago-2026): paga los lunes,
  // pagó el sábado $230.000 y el motor los mandó completos al convenio — 7 cuotas de golpe —
  // dejándolo apareciendo en mora el lunes, habiendo pagado dos días antes.
  //
  // Ponerse al día NO es adelanto: si trae cuotas atrasadas acumuladas, las cubre todas. El
  // tope es `exigido − ya abonado`, no "una cuota".
  const pendConv = Math.max(e.convenioPendiente ?? 0, 0);
  if (monto > 0 && pendConv > 0) {
    const puedeRecibir = Math.max(
      Math.min((e.convenioExigido ?? 0) - (e.convenioAbonado ?? 0), pendConv),
      0,
    );
    r.convenio = Math.min(monto, puedeRecibir);
    monto -= r.convenio;
  }

  // 5) Lo que sobre queda a favor del cliente (se aplica a mano — regla del dueño, 12-ago).
  r.saldo = monto;
  return r;
}
