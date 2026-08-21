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
  contrato: ContratoCiclo & {
    ahorro_acumulado?: number | null;
    ahorro_apertura?: number | null;
    /** La BASE que entregó al entrar. No es ahorro — solo se suma en migrados (ver abajo). */
    ahorro_inicial?: number | null;
  };
  fechaCorte: string;
  saldoFavor: number;
  deudas: DeudaCuenta[];
  convenios: ConvenioCuenta[];
  danos?: RenglonCuenta[];
}): CuentaLiquidacion {
  const { contrato, fechaCorte, saldoFavor, deudas, convenios, danos = [] } = opts;
  const ajuste = ajusteSalidaLedger(contrato, new Date(fechaCorte + "T12:00:00"));

  const aFavor: RenglonCuenta[] = [];

  // LA BASE Y EL AHORRO SON DOS COSAS DISTINTAS, y solo se unen acá, en la liquidación
  // (regla del dueño, 21-ago): «la base la pone él al entrar; el ahorro lo construye pagando».
  // Se muestran en renglones SEPARADOS para que el cliente vea de dónde sale cada peso.
  //
  // ⚠️ SE GUARDAN DISTINTO SEGÚN CÓMO ENTRÓ EL CLIENTE — no se puede tratar igual a los dos:
  //
  //  · MIGRADO: el arqueo del sistema viejo trajo en `ahorro_apertura` SOLO lo ganado pagando.
  //    Su base quedó aparte, en `ahorro_inicial`, y hay que SUMARLA — si no, se le devuelve menos
  //    de lo que es suyo. Caso ANTONIO MONTERROZA: $148.000 del arqueo + $300.000 de base.
  //
  //  · DEL WIZARD: la base YA se repartió al entrar — una parte pagó su primera semana (entró al
  //    ledger como Caja 1) y el resto quedó en `ahorro_apertura`. Sumar `ahorro_inicial` acá la
  //    contaría DOS VECES. Por eso solo se etiqueta de dónde viene cada parte.
  const ahorroPagando = contrato.ahorro_acumulado ?? 0;
  const ahorroApertura = contrato.ahorro_apertura ?? 0;
  const baseEntregada = contrato.ahorro_inicial ?? 0;

  if (contrato.es_migrado) {
    if (baseEntregada > 0) aFavor.push({ concepto: "Base inicial que entregó", monto: baseEntregada });
    const ahorro = ahorroPagando + ahorroApertura;
    if (ahorro > 0) aFavor.push({ concepto: "Ahorro que ganó pagando", monto: ahorro });
  } else {
    // La apertura de un contrato del wizard ES el remanente de su base, no ahorro ganado.
    if (ahorroApertura > 0) aFavor.push({ concepto: "Ahorro que viene de su base inicial", monto: ahorroApertura });
    if (ahorroPagando > 0) aFavor.push({ concepto: "Ahorro que ganó pagando", monto: ahorroPagando });
  }
  if (saldoFavor > 0) aFavor.push({ concepto: "Saldo a favor", monto: saldoFavor });
  // Lo que pagó por adelantado y no alcanzó a usar: se le devuelve (regla 9 del libro de cajas).
  if (ajuste.aFavor > 0) aFavor.push({ concepto: "Pagó adelantado y no alcanzó a usar", monto: ajuste.aFavor });
  // De cada día que se le cobra, una parte es AHORRO SUYO ($4.000 de los $31.000 diarios). Se le
  // cobran los días completos abajo, así que su parte se le devuelve acá — si no, la empresa se
  // quedaría con plata que no es suya y él perdería ahorro, que es lo que la spec prohíbe.
  // Decisión del dueño (21-ago): «si cobras los 31, sabes que tienes que colocar aparte los 4 mil
  // de ahorro que le corresponde de ese cobro». Se muestra en dos renglones y no restando por
  // dentro, para que el cliente vea de dónde sale cada peso.
  if (ajuste.ahorroPorCobrar > 0) {
    aFavor.push({ concepto: "Ahorro que le corresponde de esos días", monto: ajuste.ahorroPorCobrar });
  }

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
