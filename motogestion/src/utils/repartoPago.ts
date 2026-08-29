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
};

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
  const r: ResultadoReparto = {
    prorrateo: 0, tarifa: 0, deuda: 0, convenio: 0, saldo: 0, ahorro: 0,
    cajasPagadas: e.cajasPagadas,
    cajaActualPagado: e.cajaActualPagado ?? 0,
  };
  let monto = e.monto;
  if (monto <= 0) return r;

  const cajaValor = e.cajaValor;
  const cajaAhorro = e.cajaAhorro ?? 0;
  const totalCajas = e.totalCajas ?? Number.MAX_SAFE_INTEGER;
  const deudas = (e.deudas ?? []).map(d => ({ ...d }));

  // 0) Contrato SUSPENDIDO: la multa de recolección se cobra antes que nada (recuperar la moto).
  if (e.contratoSuspendido) {
    for (const d of deudas) {
      if (monto <= 0) break;
      if (!d.esMulta || d.montoPendiente <= 0) continue;
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

  // 3) Deudas — la multa de recolección primero, después las más antiguas.
  for (const d of deudas) {
    if (monto <= 0) break;
    if (d.montoPendiente <= 0) continue;
    const delta = Math.min(monto, d.montoPendiente);
    d.montoPendiente -= delta;
    r.deuda += delta;
    monto -= delta;
  }

  // 4) Convenio activo.
  // 🔴 HOY NO TIENE TOPE: recibe hasta TODO su saldo pendiente, no solo las cuotas exigidas.
  // Las cajas sí tienen freno (arriba), el convenio no — por eso a un cliente que paga su
  // paquete ANTES de su día de pago se le va todo al convenio y su semana queda descubierta.
  // Caso real DANIEL MILLÁN (RLT87H, 29-ago-2026): paga los lunes, pagó el sábado $230.000,
  // y el motor mandó los $230.000 completos al convenio (7 cuotas de golpe) dejándole la
  // semana del lunes sin cubrir. Está fijado en las pruebas para que el cambio se vea.
  if (monto > 0) {
    const pendConv = Math.max(e.convenioPendiente ?? 0, 0);
    r.convenio = Math.min(monto, pendConv);
    monto -= r.convenio;
  }

  // 5) Lo que sobre queda a favor del cliente (se aplica a mano).
  r.saldo = monto;
  return r;
}
