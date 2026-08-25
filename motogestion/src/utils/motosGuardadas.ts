// LAS MOTOS QUE NO ESTÁN PRODUCIENDO — el reporte de las guardadas (pedido del dueño, 25-ago).
//
// "La moto nunca debe dejar de producir" es el principio rector del negocio, así que la lista de
// las que están quietas —dónde, desde cuándo, por qué y a cargo de quién— es la que dice dónde
// se está perdiendo plata.
//
// TODO ES DERIVADO de los hechos ya registrados (regla de la esencia y el rastro): el estado de
// la moto dice que está guardada, y la última recepción dice desde cuándo y por qué. Si una moto
// figura guardada pero NO tiene recepción que lo respalde, el reporte lo marca (`sinRegistro`)
// en vez de inventar una fecha — ese vacío es en sí mismo un hallazgo.

/** Estados en los que la moto NO está con el cliente ni lista para entregar: está guardada. */
export const ESTADOS_GUARDADA = ["Recuperada", "Mantenimiento", "Fiscalia", "Transito", "Garantia"] as const;

export type MotoIn = { id: string; placa: string; grupo?: string | null; estado: string; subadmin_id?: string | null };
export type RecepcionIn = { moto_id: string; motivo: string; ubicacion_destino: string; created_at: string };
export type ContratoIn = { id: string; moto_id: string | null; cliente_id: string; estado: string };

export type MotoGuardada = {
  motoId: string;
  placa: string;
  grupo: string;
  estado: string;
  /** Dónde está: del registro de recepción, o derivado del estado si no hay registro. */
  donde: string;
  /** Por qué entró: del registro, o derivado del estado. */
  motivo: string;
  clienteNombre: string;
  contratoId: string | null;
  subadminId: string | null;
  subadminNombre: string;
  /** Desde cuándo está guardada (ISO). null = no hay recepción que lo respalde. */
  desde: string | null;
  /** Días que lleva quieta. null si no se sabe desde cuándo. */
  dias: number | null;
  /** No hay recepción registrada: la moto figura guardada pero sin papeles. */
  sinRegistro: boolean;
};

/** Cuando no hay recepción, el estado de la moto igual dice dónde está y por qué. */
const POR_ESTADO: Record<string, { donde: string; motivo: string }> = {
  Recuperada:    { donde: "Bodega",             motivo: "Recuperada (retención / entrega)" },
  Mantenimiento: { donde: "Taller",             motivo: "En taller" },
  Fiscalia:      { donde: "Fiscalía",           motivo: "Retención legal — Fiscalía" },
  Transito:      { donde: "Patios de tránsito", motivo: "Retención legal — Tránsito" },
  Garantia:      { donde: "Garantía",           motivo: "En garantía" },
};

export function motosGuardadas(
  motos: MotoIn[],
  recepciones: RecepcionIn[],
  contratos: ContratoIn[],
  clientesPorId: Map<string, string>,
  subadminsPorId: Map<string, string>,
  hoyISO: string,
  labelMotivo: (m: string) => string = m => m,
  labelUbicacion: (u: string) => string = u => u,
): MotoGuardada[] {
  const guardadas = motos.filter(m => (ESTADOS_GUARDADA as readonly string[]).includes(m.estado));
  // Las recepciones que GUARDAN la moto (las de destino `con_cliente` la sacan, no la meten).
  const porMoto = new Map<string, RecepcionIn[]>();
  for (const r of recepciones) {
    if (r.ubicacion_destino === "con_cliente") continue;
    if (!porMoto.has(r.moto_id)) porMoto.set(r.moto_id, []);
    porMoto.get(r.moto_id)!.push(r);
  }

  return guardadas.map(m => {
    const propias = (porMoto.get(m.id) ?? []).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const ult = propias[0] ?? null;
    const desde = ult ? ult.created_at.slice(0, 10) : null;
    const dias = desde
      ? Math.max(0, Math.round((Date.parse(hoyISO + "T12:00:00") - Date.parse(desde + "T12:00:00")) / 86400000))
      : null;
    // El contrato de esa moto — el que la tenía. Un contrato Cancelado/Finalizado ya no cuenta:
    // la moto quedó libre y no hay cliente a quien perseguir.
    const ct = contratos.find(c => c.moto_id === m.id && ["Activo", "Suspendido", "En proceso"].includes(c.estado)) ?? null;
    const respaldo = POR_ESTADO[m.estado] ?? { donde: "—", motivo: m.estado };
    return {
      motoId: m.id,
      placa: m.placa,
      grupo: m.grupo || "SIN GRUPO",
      estado: m.estado,
      donde: ult ? labelUbicacion(ult.ubicacion_destino) : respaldo.donde,
      motivo: ult ? labelMotivo(ult.motivo) : respaldo.motivo,
      clienteNombre: ct ? (clientesPorId.get(ct.cliente_id) ?? "—") : "— sin contrato",
      contratoId: ct?.id ?? null,
      subadminId: m.subadmin_id ?? null,
      subadminNombre: m.subadmin_id ? (subadminsPorId.get(m.subadmin_id) ?? "—") : "Sin asignar",
      desde,
      dias,
      sinRegistro: !ult,
    };
  }).sort((a, b) => (b.dias ?? -1) - (a.dias ?? -1));   // las más viejas primero: son las que duelen
}

/** Agrupa el reporte por la llave que se quiera ver (grupo, encargado, dónde está…). */
export function agruparGuardadas(
  filas: MotoGuardada[],
  por: (f: MotoGuardada) => string,
): Array<{ clave: string; filas: MotoGuardada[]; dias: number }> {
  const m = new Map<string, MotoGuardada[]>();
  for (const f of filas) {
    if (!m.has(por(f))) m.set(por(f), []);
    m.get(por(f))!.push(f);
  }
  return [...m.entries()]
    .map(([clave, fs]) => ({ clave, filas: fs, dias: fs.reduce((s, f) => s + (f.dias ?? 0), 0) }))
    .sort((a, b) => b.filas.length - a.filas.length);
}
