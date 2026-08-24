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

export type TiempoPendiente = { desde: string; hasta: string; dias: number };

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
): TiempoPendiente | null {
  const propias = recepciones
    .filter(r => r.contrato_id === contratoId || (r.contrato_id == null && motoId != null && r.moto_id === motoId))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  if (propias.length === 0) return null;

  // El último par guardado → entrega posterior.
  let guardado: RecepcionMin | null = null;
  let entrega: RecepcionMin | null = null;
  for (const r of propias) {
    if (r.ubicacion_destino === "con_cliente") {
      if (guardado) { entrega = r; }
    } else {
      // Un guardado nuevo abre un tramo nuevo (y descarta el par anterior: ya es historia
      // de un ciclo previo — el operativo resuelve siempre el más reciente).
      guardado = r;
      entrega = null;
    }
  }
  if (!guardado || !entrega) return null;   // nunca se guardó, o sigue guardada

  // ¿Alguien ya lo resolvió? Un acuerdo de tiempo creado DESPUÉS del guardado lo cubre
  // (sin importar la decisión: cobrar y rodar son ambas resoluciones válidas).
  const resuelto = acuerdos.some(a => a.contrato_id === contratoId && a.created_at >= guardado!.created_at);
  if (resuelto) return null;

  const desde = guardado.created_at.slice(0, 10);
  const hasta = entrega.created_at.slice(0, 10);
  const dias = Math.max(0, Math.round(
    (Date.parse(hasta + "T12:00:00") - Date.parse(desde + "T12:00:00")) / 86400000,
  ));
  return { desde, hasta, dias };
}
