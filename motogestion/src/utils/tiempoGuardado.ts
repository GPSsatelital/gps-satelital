// EL TIEMPO GUARDADO QUE NADIE RESOLVIÓ — regla del dueño (24-ago-2026):
//
//   "No que cada subadmin tenga la potestad de hacerlo, pero que el sistema tenga claro qué
//    fue lo que pasó, para poder saberlo en los informes o reportes."
//
// El caso que lo parió: un SUBADMIN entrega una moto que estuvo guardada; el modal de
// cobrar/rodar no le sale (la decisión es del admin — correcto) y el caso se evaporaba: el
// admin solo se enteraba si alguien le contaba (pasó con WILLINGTON y JUAN CARLOS el mismo
// fin de semana).
//
// La detección es DERIVADA de los hechos, no de banderas: una recepción de GUARDADO (la moto
// entró a bodega/oficina/taller) seguida de una ENTREGA (salió con el cliente) SIN un acuerdo
// de tiempo posterior al guardado = pendiente. Por ser derivada, también encuentra sola los
// casos viejos — nadie tiene que acordarse de marcarlos.

// AMPLIACIÓN 3-sep-2026 — el caso IEW64I (ARMANDO JIMENEZ PEÑA):
//
// La moto estuvo guardada 7 días (27-ago → 3-sep) y NADA lo mostró como pendiente. El dueño lo
// reportó como "no me deja rodarle el tiempo de la garantía". Al revisar: sí había registro, pero
// no era una garantía sino un **préstamo de reemplazo** — se guardó su moto y se le prestó otra.
//
// Por qué se perdió: un préstamo NO escribe en `recepciones_vehiculo`, y esta red solo miraba
// recepciones. La única ventana de cobrar/rodar es la que se abre al devolver el préstamo; si se
// cierra sin resolver, el caso se evapora. Exactamente el patrón WILLINGTON/JUAN CARLOS que esta
// red venía a cerrar — cubría las motos guardadas pero no los préstamos ni las retenciones.
//
// El arreglo NO inventa recepciones falsas: le enseña a la red a leer los rastros que YA existen
// (`prestamos_reemplazo.fecha_inicio/fecha_fin` y `motos.retencion_fecha`). Por seguir siendo
// derivada de los hechos, encuentra sola los casos viejos.
//
// ⚠️ LO QUE SIGUE SIN CUBRIRSE: una retención (garantía/fiscalía/tránsito) ya LIBERADA. Al
// liberarla, `liberarRetencion` pone `retencion_fecha = null` y no queda rastro de cuándo entró.
// Las abiertas sí se ven; las cerradas en el pasado, no. Se cierra el día que registrar una
// retención deje también su recepción.

type RecepcionMin = {
  contrato_id: string | null;
  moto_id: string;
  ubicacion_destino: string;
  created_at: string;
};

type AcuerdoMin = {
  contrato_id: string;
  created_at: string;
};

/** Un rato en que la moto NO estuvo con el cliente. `hasta` null = todavía está guardada. */
export type TramoGuardado = { desde: string; hasta: string | null };

type PrestamoMin = {
  contrato_id: string;
  fecha_inicio: string;
  fecha_fin: string | null;
};

/**
 * Los tramos que deja un préstamo de reemplazo: mientras el cliente rueda en la prestada, SU moto
 * está guardada. `fecha_fin` null = el préstamo sigue abierto.
 */
export function tramosDePrestamos(prestamos: PrestamoMin[], contratoId: string): TramoGuardado[] {
  return prestamos
    .filter(p => p.contrato_id === contratoId && p.fecha_inicio)
    .map(p => ({ desde: p.fecha_inicio.slice(0, 10), hasta: p.fecha_fin ? p.fecha_fin.slice(0, 10) : null }));
}

/** El tramo de una retención ABIERTA (garantía/fiscalía/tránsito). Al liberarla la fecha se borra. */
export function tramoDeRetencion(moto: { retencion_fecha?: string | null } | null | undefined): TramoGuardado[] {
  const f = moto?.retencion_fecha;
  return f ? [{ desde: f.slice(0, 10), hasta: null }] : [];
}

/** De todos los tramos, el que empezó más tarde. Con empate gana el que sigue abierto. */
function tramoMasReciente(tramos: TramoGuardado[]): TramoGuardado | null {
  let mejor: TramoGuardado | null = null;
  for (const t of tramos) {
    if (!t.desde) continue;
    if (!mejor) { mejor = t; continue; }
    if (t.desde > mejor.desde) { mejor = t; continue; }
    if (t.desde === mejor.desde && t.hasta === null) mejor = t;
  }
  return mejor;
}

/** El tramo que dejan las recepciones: un guardado seguido (o no) de una entrega al cliente. */
function tramoDeRecepciones(recepciones: RecepcionMin[], contratoId: string, motoId: string | null): TramoGuardado | null {
  const propias = recepciones
    .filter(r => r.contrato_id === contratoId || (r.contrato_id == null && motoId != null && r.moto_id === motoId))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  let guardado: RecepcionMin | null = null;
  let entrega: RecepcionMin | null = null;
  for (const r of propias) {
    if (r.ubicacion_destino === "con_cliente") { if (guardado) entrega = r; }
    else { guardado = r; entrega = null; }
  }
  if (!guardado) return null;
  return { desde: guardado.created_at.slice(0, 10), hasta: entrega ? entrega.created_at.slice(0, 10) : null };
}

/** ¿Alguien ya decidió qué pasaba con ese tramo? Un acuerdo del mismo día o posterior lo cubre. */
function yaResuelto(acuerdos: AcuerdoMin[], contratoId: string, desde: string): boolean {
  return acuerdos.some(a => a.contrato_id === contratoId && a.created_at >= desde);
}

export type TiempoPendiente = { desde: string; hasta: string; dias: number };
export type TiempoPendienteFull = TiempoPendiente & {
  /** true = la moto TODAVÍA está guardada (el tramo se cuenta hasta hoy). */
  sigueGuardada: boolean;
};

/**
 * Tiempo guardado SIN resolver, cubriendo los DOS casos (25-ago):
 *   · la moto ya se entregó y nadie decidió qué pasaba con esos días, y
 *   · la moto SIGUE guardada — el caso del convenio para recuperarla, que es cuando más
 *     importa: si no se rueda ANTES, el convenio nace cobrando semanas de bodega.
 *
 * null = no hay nada pendiente: nunca se guardó, o ya tiene su acuerdo de tiempo.
 */
export function tiempoGuardadoPendiente(
  recepciones: RecepcionMin[],
  acuerdos: AcuerdoMin[],
  contratoId: string,
  motoId: string | null,
  hoyISO: string,
  /** Tramos de otras fuentes: préstamos de reemplazo y retenciones abiertas (3-sep). */
  extras: TramoGuardado[] = [],
): TiempoPendienteFull | null {
  const deRecepciones = tramoDeRecepciones(recepciones, contratoId, motoId);
  const tramo = tramoMasReciente([...(deRecepciones ? [deRecepciones] : []), ...extras]);
  if (!tramo) return null;
  if (yaResuelto(acuerdos, contratoId, tramo.desde)) return null;

  const desde = tramo.desde;
  const hasta = tramo.hasta ?? hoyISO;
  if (hasta < desde) return null;
  return {
    desde, hasta,
    dias: Math.max(0, Math.round((Date.parse(hasta + "T12:00:00") - Date.parse(desde + "T12:00:00")) / 86400000)),
    sigueGuardada: tramo.hasta === null,
  };
}

/**
 * El último tramo guardado→entregado de un contrato que quedó SIN resolver (ni cobrar ni
 * rodar). null = no hay nada pendiente: o nunca se guardó, o sigue guardada (se resuelve al
 * entregar), o ya tiene su acuerdo de tiempo.
 */
export function tiempoGuardadoSinResolver(
  recepciones: RecepcionMin[],
  acuerdos: AcuerdoMin[],
  contratoId: string,
  motoId: string | null,
  /** Tramos de otras fuentes: préstamos de reemplazo y retenciones abiertas (3-sep). */
  extras: TramoGuardado[] = [],
): TiempoPendiente | null {
  const deRecepciones = tramoDeRecepciones(recepciones, contratoId, motoId);
  const tramo = tramoMasReciente([...(deRecepciones ? [deRecepciones] : []), ...extras]);
  // Un guardado nuevo abre un tramo nuevo y descarta el anterior: el operativo resuelve siempre
  // el más reciente. Si sigue guardada, esto no aplica — se resuelve al entregarla.
  if (!tramo || tramo.hasta === null) return null;
  if (yaResuelto(acuerdos, contratoId, tramo.desde)) return null;

  const { desde, hasta } = { desde: tramo.desde, hasta: tramo.hasta };
  if (hasta < desde) return null;
  const dias = Math.max(0, Math.round(
    (Date.parse(hasta + "T12:00:00") - Date.parse(desde + "T12:00:00")) / 86400000,
  ));
  return { desde, hasta, dias };
}
