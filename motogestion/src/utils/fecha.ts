// Fecha local de Colombia (America/Bogota, UTC−5) — fuente única de verdad para "hoy".
//
// El bug que esto corrige: `new Date().toISOString().slice(0, 10)` convierte el
// instante actual a UTC antes de tomar la fecha. Como Colombia está 5 horas atrás
// de UTC, cualquier acción hecha después de las 7:00 pm hora de Cartagena caía
// en el día siguiente ("mañana"), guardando pagos/gestiones con una fecha que en
// la realidad aún no había llegado. Forzar timeZone "America/Bogota" siempre
// devuelve la fecha real de Cartagena, sin importar la hora ni el dispositivo.
//
// "en-CA" produce el formato YYYY-MM-DD (mismo que se usa en toda la BD).

const TZ = "America/Bogota";

// Fecha de hoy en Colombia como "YYYY-MM-DD".
export function hoyISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

// Convierte cualquier Date al "YYYY-MM-DD" que le corresponde en hora de Colombia.
export function fechaISO(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

// "Hoy" como objeto Date anclado a medianoche local de Colombia — útil para hacer
// aritmética de días sin arrastrar el desfase de zona horaria.
export function hoyDate(): Date {
  return new Date(hoyISO() + "T00:00:00");
}

// Fecha de hace `n` días (o dentro de `n` días si es negativo) en Colombia, "YYYY-MM-DD".
export function hoyMasDias(n: number): string {
  const d = hoyDate();
  d.setDate(d.getDate() + n);
  return fechaISO(d);
}

// "Martes 4 de agosto de 2026" — para las fechas de PAGO en pantalla.
//
// El día de la semana no es adorno: los días de pago son lunes o miércoles, así que
// verlo dice de una si el cliente pagó cuando le tocaba o se corrió. Con "4/8/2026"
// había que sacar la cuenta a mano.
//
// Vive acá y no en cada pantalla porque la fecha del pago sale en cinco sitios, y ya
// pasó una vez que cambiar una regla dejara pantallas diciendo cosas distintas.
//
// NO se usa en la descarga a Excel (ahí manda "2026-08-04", que es lo que Excel sabe
// ordenar y filtrar como fecha) ni en el recibo impreso de 80mm (se partiría en dos
// líneas). Decisión del dueño, 6-ago-2026.
export function fmtFechaLarga(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  if (isNaN(d.getTime())) return "—";
  const s = d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  // es-CO devuelve "martes, 4 de agosto de 2026": va con mayúscula inicial y sin esa coma.
  return (s.charAt(0).toUpperCase() + s.slice(1)).replace(",", "");
}
