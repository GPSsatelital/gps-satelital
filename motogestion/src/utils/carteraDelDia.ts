// EL CUADERNO DE LA CARTERA (mig 190, 6-oct-2026): cada noche a las 11:55 p.m. la base anota cuánto
// debía cada contrato ese día, copiado de la misma cuenta de la pantalla (zala.cliente = loQueDebe).
// Reportes → Cobranza → Cartera deja escoger un día pasado y lo muestra con las mismas tarjetas.
// Aquí solo van los textos y el selector; las cifras salen de la tabla `cartera_del_dia`.

export type ComoSeAnoto = "anotada" | "calculada_despues";

/** Un día que tiene cuaderno (función `cartera_fechas`). */
export type FechaAnotada = { fecha: string; como: ComoSeAnoto; contratos: number; anotada_el: string };

/** Un contrato en el cuaderno de un día. */
export type FilaCarteraDia = {
  fecha: string;
  contrato_id: string;
  cliente_id: string | null;
  cliente: string | null;
  placa: string | null;
  grupo: string | null;
  cobrador_id: string | null;
  cobrador: string | null;
  forma_pago: string | null;
  contrato_estado: string | null;
  moto_estado: string | null;
  /** Igual que Reportes, más 'sin-cuenta' (contratos Diario: la base no les lleva la cuenta). */
  estado: "aldia" | "gabela" | "mora" | "taller" | "retenida" | "reasignada" | "sin-cuenta";
  debe_cuotas: number | null;
  debe_acuerdo: number | null;
  debe_deudas: number | null;
  debe_total: number | null;
  saldo_a_favor: number | null;
  dias_mora: number;
  para_recoger: boolean;
  con_plazo: boolean;
  paga_ese_dia: boolean;
  como: ComoSeAnoto;
  anotada_el: string;
};

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/** "30 de septiembre" (con el año solo si no es el de `hoy`). */
export function textoDia(fecha: string, hoy: string): string {
  const [a, m, d] = fecha.split("-").map(Number);
  return `${d} de ${MESES[m - 1]}${String(a) !== hoy.slice(0, 4) ? ` de ${a}` : ""}`;
}

/** El último día del mes: el que más se va a buscar ("¿cómo cerró septiembre?"). */
export function esCierreDeMes(fecha: string): boolean {
  const d = new Date(fecha + "T12:00:00");
  d.setDate(d.getDate() + 1);
  return d.getDate() === 1;
}

/**
 * Las opciones del selector "Día": primero Hoy (la cuenta en vivo), después los días pasados con
 * cuaderno, del más reciente al más viejo. El de hoy no se ofrece: lo anotado hoy es una copia de lo
 * que ya se ve en vivo, y a medianoche se vuelve a anotar.
 */
export function opcionesDia(fechas: FechaAnotada[], hoy: string): Array<{ valor: string; etiqueta: string; deshabilitada?: boolean }> {
  const pasadas = fechas.filter(f => f.fecha < hoy).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const ops: Array<{ valor: string; etiqueta: string; deshabilitada?: boolean }> = [{ valor: "", etiqueta: "Día: hoy" }];
  pasadas.forEach(f => {
    const dia = DIAS[new Date(f.fecha + "T12:00:00").getDay()];
    const marcas = [esCierreDeMes(f.fecha) ? "cierre de mes" : null, f.como === "calculada_despues" ? "calculado después" : null].filter(Boolean);
    ops.push({ valor: f.fecha, etiqueta: `Día: ${dia} ${textoDia(f.fecha, hoy)}${marcas.length ? ` · ${marcas.join(" · ")}` : ""}` });
  });
  if (pasadas.length === 0) ops.push({ valor: "__nada__", etiqueta: "Los días pasados se ven desde mañana", deshabilitada: true });
  return ops;
}

/** Lo que dice el aviso de arriba cuando se mira un día pasado. */
export function avisoDelDia(como: ComoSeAnoto, fecha: string, hoy: string, sinCuenta: number): string {
  const base = como === "calculada_despues"
    ? `Calculado después, hacia atrás, con los pagos y las semanas que la app tenía guardados. Es aproximado: la app no sabe exactamente qué días estuvo guardada cada moto.`
    : `Anotado la noche del ${textoDia(fecha, hoy)}. Muestra lo que la app sabía esa noche: si un pago de ese día se confirmó después, aquí sale como no pagado.`;
  return sinCuenta > 0
    ? `${base} No incluye ${sinCuenta === 1 ? "1 contrato diario" : `${sinCuenta} contratos diarios`}: su cuenta se lleva en la oficina.`
    : base;
}
