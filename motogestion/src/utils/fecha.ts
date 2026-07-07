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
