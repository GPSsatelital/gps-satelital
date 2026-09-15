// CUÁNTO ENTRÓ A CADA CUENTA DEL BANCO EN UN DÍA (15-sep-2026)
//
// 🔴 QUÉ PREGUNTA RESPONDE — y por qué NO es el "Recaudo por grupo" que ya existe:
//   · "Recaudo por grupo"  → cuánto PRODUJO cada portafolio.
//   · esto                 → cuánto tiene que decir CADA EXTRACTO del banco.
// No son el mismo número a propósito. El selector de cuenta deja registrar la verdad incómoda:
// un cliente de COSTA puede transferirle por error al Nequi de PRADERA. Esa plata es de COSTA
// (va en su recaudo) pero está en la cuenta de PRADERA (va en el extracto de PRADERA). Mezclar
// las dos cuentas es exactamente el defecto que la regla del dinero prohíbe: una cifra, una
// pregunta.
//
// POR QUÉ ENTRAN LAS TRES FUENTES (decisión del dueño, 15-sep): el extracto no distingue de qué
// se trata cada entrada — ahí aparece todo junto. Si el panel dejara algo por fuera, la
// secretaria tendría que sumarlo a mano y volveríamos al problema que esto vino a resolver.
//   1. Transferencias de clientes confirmadas
//   2. Bases iniciales pagadas por transferencia (y las devoluciones, que restan)
//   3. Plata que llegó al banco y nadie ha reclamado
//
// EL EFECTIVO NO ENTRA: llega a la mano, no a una cuenta.

export type TotalDeCuenta = {
  /** null = el movimiento quedó sin cuenta marcada (pagos viejos, o nadie la eligió). */
  cuentaId: string | null;
  total: number;
  movimientos: number;
};

type PagoBanco = { metodo: string; estado: string; valor: number; cuenta_id?: string | null };
type BaseBanco = { tipo: string; monto: number; metodo: string; fecha: string; cuenta_id?: string | null };
type SinDuenioBanco = { monto: number; fecha_banco: string; cuenta_id?: string | null };

export function totalesPorCuenta(opts: {
  /**
   * Pagos YA filtrados al día de caja por quien llama (en CajaView, `pagosDia`). La regla de qué
   * día le toca a un pago vive en `fechaDeCaja` y no se duplica acá: una segunda copia de esa
   * regla es la forma conocida de que dos pantallas digan cifras distintas del mismo día.
   */
  pagos: PagoBanco[];
  /** Todos los movimientos de base — se filtran acá, con la misma regla que `basesDelDia`. */
  bases: BaseBanco[];
  /** Partidas del banco sin dueño — se filtran por `fecha_banco`, que es la del extracto. */
  sinDuenio: SinDuenioBanco[];
  fecha: string;
}): TotalDeCuenta[] {
  const acc = new Map<string, { total: number; movimientos: number }>();
  const SIN = "__sin_cuenta__";

  const sumar = (cuentaId: string | null | undefined, monto: number) => {
    const k = cuentaId ?? SIN;
    const prev = acc.get(k) ?? { total: 0, movimientos: 0 };
    acc.set(k, { total: prev.total + monto, movimientos: prev.movimientos + 1 });
  };

  for (const p of opts.pagos) {
    if (p.metodo !== "Transferencia" || p.estado !== "Confirmado") continue;
    sumar(p.cuenta_id, p.valor);
  }

  for (const b of opts.bases) {
    // La retención no es plata que se mueva: es lo que la empresa se queda de lo ya entregado.
    if (b.tipo === "retencion") continue;
    if (b.metodo !== "Transferencia" || b.fecha !== opts.fecha) continue;
    sumar(b.cuenta_id, (b.tipo === "abono" ? 1 : -1) * b.monto);
  }

  for (const i of opts.sinDuenio) {
    if (i.fecha_banco !== opts.fecha) continue;
    sumar(i.cuenta_id, i.monto);
  }

  // La cuenta sin marcar va SIEMPRE de última: es el aviso, no un renglón más.
  return [...acc.entries()]
    .map(([k, v]) => ({ cuentaId: k === SIN ? null : k, total: v.total, movimientos: v.movimientos }))
    .sort((a, b) => {
      if (a.cuentaId === null) return 1;
      if (b.cuentaId === null) return -1;
      return b.total - a.total;
    });
}

/**
 * ¿Falta elegir a cuál cuenta entró? (solo bloquea donde de verdad hay que decidir)
 *
 * Con UNA sola cuenta el selector la elige solo, así que nunca falta. Con VARIAS —hoy COSTA—
 * nadie estaba obligado a marcarla y el pago se guardaba con la cuenta vacía: ese dato no se
 * recupera después, porque el extracto no dice de quién era cada entrada.
 */
export function faltaElegirCuenta(
  cuentasDelGrupo: unknown[],
  metodo: string,
  cuentaId: string | null,
): boolean {
  if (metodo !== "Transferencia") return false;
  return cuentasDelGrupo.length > 1 && !cuentaId;
}
