import { fmtPesos } from "./mensajeria";

/**
 * EL AVISO AL CONFIRMAR UNA TRANSFERENCIA EN DESORDEN (31-oct-2026, D-059, aprobado por el dueño:
 * «sí, las dos partes»).
 *
 * 🔴 EL CASO: PEDRO FLOREZ (IEW90I) pagó su semana del 12-oct el 14 y el 15, y la del 19-oct el 21 y
 * el 23. La oficina confirmó primero las transferencias nuevas. El motor llena siempre la semana más
 * vieja con lo que se confirma primero, y un pago solo llena las semanas que ya se cobraban a su fecha
 * (mig 119): la plata del 14 y el 15 cayó a saldo a favor, el cliente apareció debiendo hasta que
 * alguien la aplicó a mano, y la nómina vio las dos semanas atrasadas.
 *
 * El aviso no bloquea: dice qué va a pasar y la secretaria escoge. El efectivo nunca lo muestra,
 * porque siempre es de hoy.
 */
export type PagoParaAviso = {
  id: string;
  fecha: string;
  valor: number;
  estado: string;
  metodo?: string | null;
  tipo_registro?: string | null;
  aplicado_tarifa?: number | null;
};

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const dia = (iso: string) => iso.slice(0, 10);
/** "14 de octubre" */
const diaYMes = (iso: string) => {
  const [, m, d] = dia(iso).split("-").map(Number);
  return `${d} de ${MESES[m - 1]}`;
};
const unir = (xs: string[]) => xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`;

/** El texto del aviso, o null si este pago se puede confirmar sin desordenar nada. */
export function avisoOrdenDelPago(pago: PagoParaAviso, delMismoContrato: PagoParaAviso[]): string | null {
  if (pago.metodo !== "Transferencia") return null;
  const otros = delMismoContrato.filter(q => q.id !== pago.id);

  // Caso A: otra transferencia MÁS VIEJA sin confirmar. Si esta entra primero, llena la semana que
  // le tocaba a la vieja, y la vieja ya no tendrá semana dónde entrar.
  const viejas = otros
    .filter(q => q.estado === "Pendiente" && q.metodo === "Transferencia" && dia(q.fecha) < dia(pago.fecha))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  if (viejas.length > 0) {
    const una = viejas.length === 1;
    const lista = unir(viejas.map(q => `${fmtPesos(q.valor)} del ${diaYMes(q.fecha)}`));
    return (una
      ? `Este cliente tiene otra transferencia más vieja sin confirmar: ${lista}.\n`
        + "Confirme primero la más vieja. Si confirma esta antes, la plata de la más vieja quedará como saldo a favor y las semanas pueden verse atrasadas.\n"
      : `Este cliente tiene ${viejas.length} transferencias más viejas sin confirmar: ${lista}.\n`
        + "Confirme primero las más viejas. Si confirma esta antes, la plata de las más viejas quedará como saldo a favor y las semanas pueden verse atrasadas.\n")
      + "¿Confirmar esta de todos modos?";
  }

  // Caso B: ya se confirmó un pago MÁS NUEVO que llenó semanas. Las semanas de la fecha de este pago
  // pueden estar pagadas, y entonces esta plata cae a saldo a favor (que nunca se aplica solo).
  const nuevos = otros.filter(q =>
    q.estado === "Confirmado"
    && q.tipo_registro !== "saldo_favor" && q.tipo_registro !== "adelanto_base"
    && (q.aplicado_tarifa ?? 0) > 0
    && dia(q.fecha) > dia(pago.fecha));
  if (nuevos.length > 0) {
    const masNuevo = nuevos.reduce((a, b) => (dia(b.fecha) > dia(a.fecha) ? b : a));
    return `Este pago es del ${diaYMes(pago.fecha)}, pero este cliente ya tiene confirmado uno más nuevo (del ${diaYMes(masNuevo.fecha)}).\n`
      + "Si las semanas de esa fecha ya están pagadas, esta plata quedará como saldo a favor.\n"
      + "Después de confirmarlo, aplique el saldo a favor desde el detalle del cliente, para que no aparezca debiendo.\n"
      + "¿Confirmar?";
  }
  return null;
}
