// LAS REGLAS DE «📍 CONFIRMAR UBICACIÓN» QUE NO NECESITAN PANTALLA (D-094 y D-095).
//
// Desde las entregas del 19-nov-2026, dónde duerme la moto lo confirma quien hizo la visita (D-094).
// La excepción es el auxiliar administrativo (D-095, mig 226): él no tiene el GPS de la moto, así
// que la confirma el SUPERVISOR DE ESA MOTO (o la administración, si la moto no tiene supervisor), y
// si sale ✗ se le devuelve al auxiliar para que vaya y documente el sitio real. La visita siempre se
// le paga a quien la hizo, en la semana en que queda confirmada.

export type ConfirmacionUbicacion = {
  contrato_id: string;
  cliente: string;
  placa: string | null;
  grupo: string | null;
  visitador_id: string;
  visitador: string | null;
  visita_fecha: string;
  fecha_entrega: string;
  resultado: "coincide" | "no_coincide" | null;
  validada_fecha: string | null;
  confirmada_en: string | null;
  sitio: {
    lat?: number; lng?: number; direccion?: string; condiciones?: string;
    encargado_nombre?: string; encargado_telefono?: string; fecha?: string; por?: string;
  } | null;
  declaro_casa: string | null;
  donde_declarado: string | null;
  casa: { lat: number; lng: number } | null;
  // Desde la mig 226. Opcionales: antes de correrla la base no las manda.
  /** La visita es de un auxiliar: la confirma el supervisor de la moto, no él. */
  lo_confirma_supervisor?: boolean | null;
  /** Quién la tiene que confirmar. En la de un auxiliar, vacío = la administración (moto sin supervisor). */
  confirma_id?: string | null;
  confirma?: string | null;
  /** Solo en las del auxiliar: el WhatsApp del supervisor, para su botón «Pedírsela». */
  confirma_whatsapp?: string | null;
  /** Quién marcó ✓ o ✗. */
  marco?: string | null;
};

/** En qué paso va: le falta mirar el GPS, le falta ir al sitio real, o ya quedó. */
export type PasoConfirmacion = "por_confirmar" | "falta_sitio" | "confirmada";

export function pasoDe(c: Pick<ConfirmacionUbicacion, "resultado" | "confirmada_en">): PasoConfirmacion {
  if (c.confirmada_en) return "confirmada";
  if (c.resultado === "no_coincide") return "falta_sitio";
  return "por_confirmar";
}

/**
 * Qué le toca a quien mira la fila:
 *   · «confirmar»: mirar el GPS y marcar ✓ o ✗.
 *   · «documentar»: ir al sitio real (salió ✗). Siempre es de quien hizo la visita.
 *   · «esperar»: la visita es suya, pero la confirma otro (el auxiliar esperando al supervisor).
 *   · null: nada (el jefe mirando, o ya quedó confirmada).
 */
export type TareaConfirmacion = "confirmar" | "documentar" | "esperar" | null;

export function tareaDe(
  f: Pick<ConfirmacionUbicacion, "resultado" | "confirmada_en" | "visitador_id" | "lo_confirma_supervisor" | "confirma_id">,
  yo: string | null | undefined,
  esJefe: boolean,
): TareaConfirmacion {
  if (!yo) return null;
  const paso = pasoDe(f);
  if (paso === "confirmada") return null;
  const mia = f.visitador_id === yo;
  if (paso === "falta_sitio") return mia ? "documentar" : null;
  if (f.lo_confirma_supervisor) {
    const meToca = f.confirma_id ? f.confirma_id === yo : esJefe;
    if (meToca) return "confirmar";
    return mia ? "esperar" : null;
  }
  return mia ? "confirmar" : null;
}

/** El número rojo del menú: solo lo que esa persona puede hacer ella misma. */
export function cuentaDelMenu(
  filas: Pick<ConfirmacionUbicacion, "resultado" | "confirmada_en" | "visitador_id" | "lo_confirma_supervisor" | "confirma_id">[],
  yo: string | null | undefined,
  esJefe: boolean,
): number {
  return filas.filter(f => {
    const t = tareaDe(f, yo, esJefe);
    return t === "confirmar" || t === "documentar";
  }).length;
}

/** Días enteros desde la entrega hasta hoy (los dos como «YYYY-MM-DD», hora de Colombia). */
export function diasEsperando(fechaEntrega: string, hoy: string): number {
  const a = new Date(fechaEntrega.slice(0, 10) + "T12:00:00").getTime();
  const b = new Date(hoy.slice(0, 10) + "T12:00:00").getTime();
  if (isNaN(a) || isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86400000));
}

/** «20 de noviembre» */
function diaYMes(iso: string): string {
  const d = new Date(iso.slice(0, 10) + "T12:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "long" });
}

/**
 * Lo que queda escrito en el WhatsApp cuando el auxiliar le pide al supervisor que confirme. Lo
 * manda él desde su celular a un compañero: no es un mensaje a clientes ni sale por la línea oficial.
 */
export function textoPedirConfirmacion(
  f: Pick<ConfirmacionUbicacion, "placa" | "cliente" | "visita_fecha" | "fecha_entrega">,
  aQuien: string,
): string {
  return `Hola ${aQuien}, ¿me confirmas en el GPS dónde duerme la ${f.placa ?? "moto"} de ${f.cliente.toUpperCase()}? `
    + `Yo le hice la visita el ${diaYMes(f.visita_fecha)} y la moto se entregó el ${diaYMes(f.fecha_entrega)}. `
    + `Está en tu «📍 Confirmar ubicación». Gracias.`;
}
