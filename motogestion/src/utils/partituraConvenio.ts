// LA PARTITURA DEL CONVENIO — la regla del dueño (23-ago-2026, ver docs/MAPA-FINANCIERO.md):
//
//   "El convenio es una agrupación de diferentes tipos de deudas que las agrupa para ser
//    diferida y que al cliente le quede facilidad de pago — pero a la final cada cosa que
//    quedó ahí contemplada debería volver o ser contado en donde verdaderamente tuvo que
//    haber estado."
//
// La partitura es la lista, EN PESOS Y EN ORDEN, de qué financia un convenio. Se escribe UNA
// sola vez al firmar (o a mano para los viejos) y nunca cambia sola — lo que cambia es cuánta
// plata real ha entrado. El tachado NO se guarda en la base: se deriva acá, siempre, del mismo
// número (la plata entrada al convenio), así ninguna pantalla puede contradecir a otra —
// el mismo principio de loQueDebe().
//
// El orden de la lista es el orden sagrado del sistema: semanas viejas primero, deudas por
// antigüedad después, y el ajuste de redondeo de cuotas al final.

export type RenglonPartitura = {
  tipo: "semana" | "deuda" | "ajuste";
  /** semana → número de caja (absoluto en el libro); deuda → uuid de la fila en `deudas`. */
  ref?: string | number;
  /** Texto legible fijado al escribirla: "Semana del lun 10 de agosto", "Deuda de migración"… */
  etiqueta: string;
  monto: number;
};

export type RenglonTachado = RenglonPartitura & {
  /** Cuánto de este renglón ya quedó pagado con plata REAL (no con el papel de la firma). */
  pagado: number;
  falta: number;
  cubierto: boolean;
};

/** Suma lo que de verdad ha entrado al convenio: el mismo conteo del motor (mig 045) y de la
 *  nómina — pagos Confirmados con plata en `aplicado_convenio`, desde que el convenio existe. */
export function plataAlConvenio(
  pagos: Array<{ estado: string; created_at: string; aplicado_convenio?: number | null }>,
  convenioCreatedAt: string,
): number {
  return pagos.reduce((s, p) =>
    p.estado === "Confirmado" && p.created_at >= convenioCreatedAt ? s + (p.aplicado_convenio ?? 0) : s, 0);
}

/**
 * Tacha la partitura en orden con la plata entrada. Cada peso cae en un solo renglón; el
 * sobrante por encima del total queda como `sobrante` (no debería existir: el motor topa el
 * convenio en su deuda_total, pero si un dato viene torcido acá se VE en vez de esconderse).
 */
export function amortizarPartitura(
  partitura: RenglonPartitura[],
  plataEntrada: number,
): { renglones: RenglonTachado[]; entrada: number; sobrante: number } {
  let resto = Math.max(plataEntrada, 0);
  const renglones = partitura.map(r => {
    const pagado = Math.min(resto, r.monto);
    resto -= pagado;
    return { ...r, pagado, falta: r.monto - pagado, cubierto: pagado >= r.monto };
  });
  return { renglones, entrada: Math.max(plataEntrada, 0), sobrante: resto };
}

/** La suma de la partitura debe cuadrar con el total pactado del convenio — la validación del
 *  editor manual de los viejos. Devuelve la diferencia (0 = cuadra). */
export function descuadrePartitura(partitura: RenglonPartitura[], deudaTotal: number): number {
  return deudaTotal - partitura.reduce((s, r) => s + r.monto, 0);
}
