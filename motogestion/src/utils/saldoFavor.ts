/**
 * EL RASTRO DEL SALDO A FAVOR — de dónde salió cada peso y en qué se gastó.
 *
 * 🔴 EL CASO (dueño, 23-sep-2026). En el historial de LUIS (IEW57I) la tarjeta del 23-sep decía
 * "$59.000 · No entró dinero" y abajo "Se aplicó a: Convenio $50.000". Tres huecos de una sola
 * vez: el número grande no era lo que se usó, **los $9.000 restantes no aparecían en ninguna
 * parte**, y nada decía de qué pago venía esa plata. Palabras suyas: *"sale que no se usó dinero
 * real pero no dice de cuándo vino ni qué cantidad era la del pago inicial y de dónde sigue ese
 * mismo saldo a favor"*.
 *
 * Es la REGLA DE LA ESENCIA Y EL RASTRO: un movimiento sin su porqué es un movimiento en el aire.
 *
 * ── CÓMO SE REPARTE ─────────────────────────────────────────────────────────────────────────
 * FIFO, igual que las cajas: el saldo se guarda en la bolsa con el pago que lo generó, y cuando
 * se gasta se gasta **el más viejo primero**. Así cada peso usado puede nombrar de qué pago salió.
 *
 * ── UNA SOLA FUENTE ─────────────────────────────────────────────────────────────────────────
 * Esta cuenta la usan las TRES pantallas que muestran un saldo a favor (el historial de Cartera,
 * la línea de tiempo y el Historial de pagos). Es la lección de `loQueDebe()`: la misma cuenta
 * escrita en dos sitios se separa sola, y nadie se entera hasta que un cliente reclama.
 *
 * ⚠️ El total que sale de acá tiene que dar igual que `saldoAFavorDe()` en `usePagos.ts`
 * (apertura + suma de los `aplicado_saldo_favor`). Hay una prueba que lo compara.
 */

/** Un pago, con lo único que esta cuenta necesita mirar. */
export type PagoSaldo = {
  id: string;
  created_at: string;
  fecha: string;
  valor: number;
  tipo_registro?: string | null;
  metodo?: string | null;
  aplicado_saldo_favor?: number | null;
  aplicado_tarifa?: number | null;
  aplicado_prorrateo?: number | null;
  aplicado_deuda?: number | null;
  aplicado_convenio?: number | null;
  aplicado_base_inicial?: number | null;
};

/** De dónde salió un pedazo del saldo que se usó. */
export type Origen = {
  /** Fecha del pago que lo generó. `null` = venía de antes del sistema (apertura del empalme). */
  fecha: string | null;
  /** Cuánto fue ese pago completo (para poder decir "de su pago de $260.000"). */
  valorPago: number;
  /** Cuánto de ESTE movimiento salió de ese pago. */
  monto: number;
};

/** Un movimiento que GASTÓ saldo a favor. */
export type UsoDeSaldo = {
  /** Lo que se mandó a aplicar (el `valor` del movimiento). */
  seMando: number;
  /** Lo que de verdad cubrió algo. Puede ser menos: el motor solo llena lo exigido. */
  seUso: number;
  /** Lo que volvió a quedar guardado por no tener dónde ir. */
  volvioAGuardarse: number;
  /** De qué pagos salió lo que se usó, del más viejo al más nuevo. */
  vieneDe: Origen[];
  /** Cuánto saldo a favor le quedó al cliente DESPUÉS de este movimiento. */
  quedaDespues: number;
};

/** Un pago que DEJÓ plata guardada como saldo a favor. */
export type GeneroSaldo = {
  /** Cuánto de este pago quedó guardado. */
  guardo: number;
  /** En qué fechas se fue usando ese saldo. */
  usos: Array<{ fecha: string; monto: number }>;
  /** Cuánto de este pago sigue sin usarse. */
  sigueGuardado: number;
};

export type RastroSaldo = {
  /** Por id de pago: los movimientos que gastaron saldo. */
  usos: Record<string, UsoDeSaldo>;
  /** Por id de pago: los pagos que dejaron saldo guardado. */
  generadores: Record<string, GeneroSaldo>;
  /** El saldo a favor disponible hoy. Debe coincidir con `saldoAFavorDe()`. */
  saldoHoy: number;
};

/**
 * Arma la película completa del saldo a favor de un contrato.
 *
 * `pagos` deben ser los CONFIRMADOS. Se ordenan por `created_at` —no por `fecha`— porque ese es
 * el orden en que el motor los repartió: un pago digitado tarde con fecha vieja consumió el saldo
 * el día que se digitó, no el día que el cliente pagó.
 */
export function rastroSaldoFavor(
  contrato: { saldo_favor_apertura?: number | null },
  pagos: PagoSaldo[],
): RastroSaldo {
  const usos: Record<string, UsoDeSaldo> = {};
  const generadores: Record<string, GeneroSaldo> = {};

  // La bolsa: cada entrada es plata guardada, con el pago del que salió. Se gasta la más vieja.
  const bolsa: Array<{ pagoId: string | null; fecha: string | null; valorPago: number; queda: number }> = [];

  const apertura = contrato.saldo_favor_apertura ?? 0;
  if (apertura > 0) {
    // El saldo que el cliente traía de sus cuentas viejas (empalme, mig 079). No tiene un pago
    // detrás en el sistema, así que se nombra aparte en vez de inventarle uno.
    bolsa.push({ pagoId: null, fecha: null, valorPago: apertura, queda: apertura });
  }

  const enOrden = [...pagos].sort((a, b) => a.created_at.localeCompare(b.created_at));

  for (const p of enOrden) {
    const sf = p.aplicado_saldo_favor ?? 0;

    if (sf > 0) {
      // Este pago dejó plata guardada.
      bolsa.push({ pagoId: p.id, fecha: p.fecha, valorPago: p.valor, queda: sf });
      generadores[p.id] = { guardo: sf, usos: [], sigueGuardado: sf };
      continue;
    }

    if (sf >= 0) continue;   // ni guardó ni gastó

    // Este movimiento gastó saldo. Se cobra de la bolsa, del más viejo al más nuevo.
    let falta = -sf;
    const vieneDe: Origen[] = [];
    for (const b of bolsa) {
      if (falta <= 0) break;
      if (b.queda <= 0) continue;
      const toma = Math.min(b.queda, falta);
      b.queda -= toma;
      falta -= toma;
      vieneDe.push({ fecha: b.fecha, valorPago: b.valorPago, monto: toma });
      // Y el pago que lo generó se entera de que su plata se usó.
      if (b.pagoId && generadores[b.pagoId]) {
        generadores[b.pagoId].usos.push({ fecha: p.fecha, monto: toma });
        generadores[b.pagoId].sigueGuardado = b.queda;
      }
    }

    usos[p.id] = {
      seMando: p.valor,
      seUso: -sf,
      // Lo que el motor no pudo colocar y devolvió a la bolsa. Nunca negativo: si un movimiento
      // viejo gastó MÁS que su propio valor (no debería), no se inventa un sobrante al revés.
      volvioAGuardarse: Math.max(p.valor + sf, 0),
      vieneDe,
      quedaDespues: bolsa.reduce((s, b) => s + b.queda, 0),
    };
  }

  return { usos, generadores, saldoHoy: bolsa.reduce((s, b) => s + b.queda, 0) };
}

/** En qué se gastó un movimiento de saldo, en el mismo orden en que reparte el motor. */
export function destinosDelUso(p: PagoSaldo): Array<{ k: string; v: number }> {
  const d: Array<{ k: string; v: number }> = [];
  if ((p.aplicado_prorrateo ?? 0) > 0) d.push({ k: "Días rodados", v: p.aplicado_prorrateo! });
  if ((p.aplicado_tarifa ?? 0) > 0) d.push({ k: "Cuota", v: p.aplicado_tarifa! });
  if ((p.aplicado_deuda ?? 0) > 0) d.push({ k: "Deuda", v: p.aplicado_deuda! });
  if ((p.aplicado_convenio ?? 0) > 0) d.push({ k: "Convenio", v: p.aplicado_convenio! });
  if ((p.aplicado_base_inicial ?? 0) > 0) d.push({ k: "Base inicial", v: p.aplicado_base_inicial! });
  return d;
}
