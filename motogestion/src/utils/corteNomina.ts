import { INICIO_CORTES_NOMINA } from "./nominaCobradores";

// EL PRECORTE Y EL CORTE DEL MIÉRCOLES (decisión del dueño, 27-oct-2026, D-057): "se hará un
// precorte los días actuales y se hará un corte definitivo semanalmente los miércoles dando plazo a
// lunes y martes para ingresar los pagos que hagan falta, así nadie pierde nada".
//
// La semana de nómina sigue siendo de lunes a domingo. Lunes y martes siguientes = precorte: se ve
// y se revisa, no se cierra, y la oficina confirma las transferencias que falten. Desde el miércoles
// = corte: se cierra cada supervisor. Lo que se confirme después del cierre entra en la semana
// siguiente, valorado con el día en que pagó el cliente (`ubicar` en nominaCobradores).

export type EtapaCorte = "en_curso" | "precorte" | "corte" | "anterior";

function masDias(iso: string, n: number): string {
  const d = new Date(iso.slice(0, 10) + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** El miércoles en que se cierra la semana que empieza ese lunes (9 días después del lunes). */
export function diaDeCorte(lunes: string): string {
  return masDias(lunes, 9);
}

/** En qué etapa está la semana ese día. Las de antes del arranque se pagaron por fuera de la app. */
export function etapaCorte(lunes: string, hoy: string): EtapaCorte {
  if (lunes < INICIO_CORTES_NOMINA) return "anterior";
  if (hoy <= masDias(lunes, 6)) return "en_curso";
  if (hoy < diaDeCorte(lunes)) return "precorte";
  return "corte";
}

/**
 * ¿Esa semana ya está cerrada para ese supervisor? Cerrada = la cerró y firmó (`nomina_cierres`), o
 * es de antes del arranque de los cortes (se pagó por fuera). Lo que el cliente pagó en una semana
 * cerrada y se confirma después entra en la semana de la confirmación (`ubicar` en nominaCobradores).
 */
export function semanaCerradaSegun(
  cierres: Array<{ semana_lunes: string; subadmin_id: string | null }>,
): (cobradorId: string | null, lunes: string) => boolean {
  const cerradas = new Set(cierres.map(c => `${c.subadmin_id}|${c.semana_lunes.slice(0, 10)}`));
  return (cobradorId, lunes) => lunes < INICIO_CORTES_NOMINA || cerradas.has(`${cobradorId}|${lunes}`);
}

/**
 * Lo que falta por confirmar de esa semana, por supervisor: pagos pendientes que el cliente hizo
 * dentro de la semana. Es lo que la oficina tiene que confirmar lunes y martes para que entre antes
 * del cierre. El alquiler de la moto prestada no cuenta: no es gestión de nómina. `null` = motos
 * sin supervisor.
 */
export function porConfirmarPorCobrador(
  pagos: Array<{ contrato_id: string; fecha: string; estado: string; valor: number; tipo_registro?: string | null }>,
  contratos: Array<{ id: string; moto_id: string | null }>,
  motos: Array<{ id: string; subadmin_id?: string | null }>,
  desde: string,
  hasta: string,
): Map<string | null, { n: number; total: number }> {
  const motoDe = new Map(contratos.map(c => [c.id, c.moto_id]));
  const cobradorDe = new Map(motos.map(m => [m.id, m.subadmin_id]));
  const out = new Map<string | null, { n: number; total: number }>();
  for (const p of pagos) {
    if (p.estado !== "Pendiente" || p.tipo_registro === "alquiler_reemplazo") continue;
    const f = p.fecha.slice(0, 10);
    if (f < desde || f > hasta) continue;
    const moto = motoDe.get(p.contrato_id);
    const quien = moto ? (cobradorDe.get(moto) ?? null) : null;
    const a = out.get(quien) ?? { n: 0, total: 0 };
    out.set(quien, { n: a.n + 1, total: a.total + p.valor });
  }
  return out;
}
