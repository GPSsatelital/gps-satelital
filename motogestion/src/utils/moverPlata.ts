// MOVER LA PLATA DEL CLIENTE ENTRE SUS DOS BOLSAS.
//
// El cliente tiene dos bolsas y NO son lo mismo:
//   · AHORRO         — es suyo, se le entrega al final (o se le abona a la moto al graduarse).
//   · SALDO A FAVOR  — lo puede gastar ya: tapa una semana, una deuda o una cuota del acuerdo.
//
// El caso que lo pidió (12-sep-2026): dos clientes entregaron MÁS de la base y quieren usar ese
// excedente para completar una tarifa. Hoy el wizard manda todo el excedente al ahorro, y el
// ahorro no se puede gastar. El dueño pidió "un punto más neutro donde todos los casos puedan ser
// posibles": una ventana que mueva plata de una bolsa a la otra, en las dos direcciones y en
// cualquier momento, con motivo y rastro.
//
// 🔴 EL PISO DEL AHORRO (regla del dueño, 12-sep-2026): "nunca pueden quedar en la base inicial
// menos de 308, y menos de 305 para los más viejos". El ahorro es la garantía de la empresa: de
// ahí para abajo no se toca. Solo se puede pasar a saldo a favor lo que esté POR ENCIMA del piso.

export const PISO_AHORRO_NUEVO = 308_000;   // contratos con semana de $202.000
export const PISO_AHORRO_VIEJO = 305_000;   // los viejos, con semana de $195.000

export type ContratoPlata = {
  forma_pago: string;
  valor_semanal: number | null;
  ahorro_apertura: number | null;
  ahorro_acumulado: number | null;
  saldo_favor_apertura: number | null;
};

export type Direccion = "ahorro_a_saldo" | "saldo_a_ahorro";

/**
 * El mínimo de ahorro que ese contrato tiene que conservar.
 *
 * `null` = no aplica y no se puede mover: en el DIARIO el ahorro no es un excedente, es la base
 * que el cliente está juntando para graduarse ($510.000). Sacarle de ahí lo aleja de su meta.
 */
export function pisoAhorro(c: Pick<ContratoPlata, "forma_pago" | "valor_semanal">): number | null {
  if (c.forma_pago === "Diario") return null;
  return (c.valor_semanal ?? 0) <= 195_000 ? PISO_AHORRO_VIEJO : PISO_AHORRO_NUEVO;
}

export function ahorroDelContrato(c: Pick<ContratoPlata, "ahorro_apertura" | "ahorro_acumulado">): number {
  return (c.ahorro_apertura ?? 0) + (c.ahorro_acumulado ?? 0);
}

/** Cuánto del ahorro se puede pasar a saldo a favor sin bajar del piso. */
export function movibleDelAhorro(c: ContratoPlata): number {
  const piso = pisoAhorro(c);
  if (piso === null) return 0;
  return Math.max(ahorroDelContrato(c) - piso, 0);
}

export type ResultadoMovimiento =
  | { ok: false; error: string }
  | { ok: true; ahorro_apertura: number; ahorro_acumulado: number; saldo_favor_apertura: number; resumen: string };

/**
 * Calcula cómo quedan las tres columnas después de mover `monto`.
 *
 * Al SACAR del ahorro se descuenta primero de "por pagos" (`ahorro_acumulado`) y solo después de
 * "de inicio" (`ahorro_apertura`): lo de inicio es lo que el cliente entregó en la mano y es lo
 * último que se toca. Al DEVOLVER al ahorro entra por "de inicio", que es la bolsa de los ajustes
 * hechos a mano — así "por pagos" sigue siendo, de verdad, lo que ganó pagando.
 *
 * `saldoDisponible` es la bolsa real de saldo a favor (apertura + lo que dejaron los pagos). Al
 * mover saldo → ahorro se descuenta de `saldo_favor_apertura`, que puede quedar en negativo: es
 * correcto, la bolsa se calcula sumando esa columna con lo de los pagos.
 */
export function calcularMovimiento(
  c: ContratoPlata,
  monto: number,
  direccion: Direccion,
  saldoDisponible: number,
): ResultadoMovimiento {
  const apertura = c.ahorro_apertura ?? 0;
  const acumulado = c.ahorro_acumulado ?? 0;
  const saldoApertura = c.saldo_favor_apertura ?? 0;

  if (!Number.isFinite(monto) || monto <= 0) return { ok: false, error: "Escribe cuánto se va a mover." };

  if (direccion === "ahorro_a_saldo") {
    const piso = pisoAhorro(c);
    if (piso === null) {
      return { ok: false, error: "En un contrato diario el ahorro es la base que el cliente está juntando: no se puede pasar a saldo a favor." };
    }
    const movible = movibleDelAhorro(c);
    if (movible <= 0) {
      return { ok: false, error: `Su ahorro es de $${miles(ahorroDelContrato(c))} y el mínimo que debe conservar es $${miles(piso)}. No hay nada que se pueda mover.` };
    }
    if (monto > movible) {
      return { ok: false, error: `Solo se pueden mover $${miles(movible)}: por debajo de $${miles(piso)} de ahorro no puede quedar.` };
    }
    const deAcumulado = Math.min(monto, acumulado);
    const deApertura = monto - deAcumulado;
    return {
      ok: true,
      ahorro_acumulado: acumulado - deAcumulado,
      ahorro_apertura: apertura - deApertura,
      saldo_favor_apertura: saldoApertura + monto,
      resumen: `$${miles(monto)} del ahorro a saldo a favor`,
    };
  }

  if (monto > saldoDisponible) {
    return { ok: false, error: `Solo tiene $${miles(saldoDisponible)} de saldo a favor.` };
  }
  return {
    ok: true,
    ahorro_acumulado: acumulado,
    ahorro_apertura: apertura + monto,
    saldo_favor_apertura: saldoApertura - monto,
    resumen: `$${miles(monto)} del saldo a favor al ahorro`,
  };
}

function miles(n: number): string {
  return Math.round(n).toLocaleString("es-CO");
}
