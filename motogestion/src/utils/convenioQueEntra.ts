// Lo que entra a un acuerdo de pago y cuánto suma. Aparte de la pantalla para poder probarlo.
//
// REGLA (dueño, 7-sep-2026): el total del acuerdo NO se escribe a mano. Se SUMA de lo que entra:
// las semanas que la base va a asumir, las deudas que el funcionario marcó con casilla, y — solo
// cuando lo trae el sistema (la base inicial del wizard) — un monto que no es deuda registrada.
// Así la etiqueta nunca puede quedar por debajo de lo que hay adentro (caso ESTARLIS: firmado por
// $368.000 envolviendo $563.000).

/** Lo que la base responde en `convenio_que_entra(contrato, cubre_hasta)`. */
export type QueEntra = {
  semanas: Array<{ caja_numero: number; monto: number; etiqueta: string }>;
  semanas_total: number;
  cubrir: number | null;
  deudas: Array<{ id: string; concepto: string; descripcion: string | null; monto_pendiente: number; fecha: string }>;
  deudas_total: number;
  deudas_en_otro_convenio: number;
};

export type ResumenQueEntra = { base: number; deudas: number; semanas: number; total: number };

/** Suma lo que entra. `base` = monto que trae el sistema (base inicial); 0 en el caso general. */
export function sumarLoQueEntra(p: { base?: number | null; deudas: number[]; semanas: number }): ResumenQueEntra {
  const base = Math.max(Math.round(p.base ?? 0), 0);
  const deudas = p.deudas.reduce((s, d) => s + Math.max(Math.round(d), 0), 0);
  const semanas = Math.max(Math.round(p.semanas), 0);
  return { base, deudas, semanas, total: base + deudas + semanas };
}

/** Las deudas que quedaron marcadas, en el orden en que la base las cobra (la más vieja primero). */
export function deudasMarcadas<T extends { id: string }>(deudas: T[], seleccion: ReadonlySet<string> | null): T[] {
  if (!seleccion) return deudas;
  return deudas.filter(d => seleccion.has(d.id));
}

/** Cuánto le falta a un total para cubrir lo que envuelve (0 si alcanza). Es la misma regla del cinturón de la base. */
export function faltaParaCubrir(totalPactado: number, envuelto: number): number {
  return Math.max(Math.round(envuelto) - Math.round(totalPactado), 0);
}
