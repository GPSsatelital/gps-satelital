import { ajusteSalidaLedger, type ContratoCiclo } from "./cicloPago";

// LA CUENTA DE UNA LIQUIDACIÓN, EN UN SOLO SITIO.
//
// Se usa en TRES pantallas: la proyección ("¿cuánto sale si lo liquido hoy?"), la liquidación de
// verdad, y el documento que firma el cliente. Si cada una la hiciera por su lado, se separarían
// —es exactamente lo que pasó con "¿cuánto debe hoy?", que llegó a estar escrita en diez lugares
// que ya no coincidían— y aquí el número se FIRMA.
//
// Devuelve el desglose completo, no solo el total: el número grande y el recuadro que lo explica
// salen del MISMO objeto, así que no se pueden contradecir.

export type RenglonCuenta = { concepto: string; monto: number };

export type CuentaLiquidacion = {
  /** Plata del cliente que se le devuelve. */
  aFavor: { renglones: RenglonCuenta[]; total: number };
  /** Lo que se le descuenta de esa plata. */
  enContra: { renglones: RenglonCuenta[]; total: number };
  /** aFavor − enContra. Positivo = se le devuelve. Negativo = queda debiendo. */
  saldoFinal: number;
  /** Hasta qué día se contó. Todo lo demás depende de esto. */
  fechaCorte: string;
};

export type DeudaCuenta = { concepto: string; descripcion: string; monto_pendiente: number; estado: string };
export type ConvenioCuenta = { deuda_total: number; cuota_por_periodo: number; cuotas_pagadas: number; estado: string };

const CONCEPTO_LEGIBLE: Record<string, string> = {
  multa_recoleccion: "Multa por recolección",
  tarifa_atrasada: "Tarifa atrasada",
  daño_vehiculo: "Daño al vehículo",
  prestamo_repuesto: "Préstamo de repuesto",
  prestamo_eventualidad: "Préstamo por eventualidad",
  fotomulta: "Fotomulta",
  migracion: "Saldo del sistema anterior",
  lavada: "Lavada",
  otro: "Otro",
};

/**
 * Arma la cuenta de una liquidación.
 *
 * @param fechaCorte  el día en que se guardó la moto. TODO se cuenta hasta ahí — regla del dueño:
 *                    «se liquida hasta el día en que se guardó o se retuvo el vehículo». Los días
 *                    que la moto lleva en la bodega de la empresa no se le cobran al cliente.
 */
export function cuentaLiquidacion(opts: {
  contrato: ContratoCiclo & { ahorro_acumulado?: number | null; ahorro_apertura?: number | null };
  fechaCorte: string;
  saldoFavor: number;
  deudas: DeudaCuenta[];
  convenios: ConvenioCuenta[];
  danos?: RenglonCuenta[];
}): CuentaLiquidacion {
  const { contrato, fechaCorte, saldoFavor, deudas, convenios, danos = [] } = opts;
  const ajuste = ajusteSalidaLedger(contrato, new Date(fechaCorte + "T12:00:00"));

  const aFavor: RenglonCuenta[] = [];
  const ahorro = (contrato.ahorro_acumulado ?? 0) + (contrato.ahorro_apertura ?? 0);
  if (ahorro > 0) aFavor.push({ concepto: "Ahorro acumulado", monto: ahorro });
  if (saldoFavor > 0) aFavor.push({ concepto: "Saldo a favor", monto: saldoFavor });
  // Lo que pagó por adelantado y no alcanzó a usar: se le devuelve (regla 9 del libro de cajas).
  if (ajuste.aFavor > 0) aFavor.push({ concepto: "Pagó adelantado y no alcanzó a usar", monto: ajuste.aFavor });

  const enContra: RenglonCuenta[] = [];
  if (ajuste.porCobrar > 0) enContra.push({ concepto: "Días que rodó y no pagó", monto: ajuste.porCobrar });
  // Solo las 'pendiente': las 'en_convenio' entran abajo dentro del convenio, y contarlas por los
  // dos lados sería cobrarlas dos veces.
  for (const d of deudas.filter(x => x.estado === "pendiente")) {
    enContra.push({
      concepto: d.descripcion?.trim() || CONCEPTO_LEGIBLE[d.concepto] || d.concepto,
      monto: d.monto_pendiente,
    });
  }
  // 'activo' e 'incumplido'. El incumplido es el que MÁS se liquida (3er incumplido → liquidación
  // obligatoria) y antes desaparecía de la cuenta, así que se devolvía todo el ahorro.
  for (const cv of convenios.filter(x => x.estado === "activo" || x.estado === "incumplido")) {
    const restante = Math.max(cv.deuda_total - cv.cuotas_pagadas * cv.cuota_por_periodo, 0);
    if (restante > 0) {
      enContra.push({
        concepto: cv.estado === "incumplido" ? "Saldo de convenio incumplido" : "Saldo pendiente de convenio",
        monto: restante,
      });
    }
  }
  for (const d of danos) if (d.monto > 0) enContra.push({ concepto: `Daño: ${d.concepto}`, monto: d.monto });

  const totalFavor = aFavor.reduce((s, r) => s + r.monto, 0);
  const totalContra = enContra.reduce((s, r) => s + r.monto, 0);

  return {
    aFavor: { renglones: aFavor, total: totalFavor },
    enContra: { renglones: enContra, total: totalContra },
    saldoFinal: totalFavor - totalContra,
    fechaCorte,
  };
}
