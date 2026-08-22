import { ajusteSalidaLedger, valorPeriodoReal, type ContratoCiclo } from "./cicloPago";

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
  /**
   * Migrado con el campo "Ahorro inicial" en cero: su base está SIN CONFIRMAR (empalme
   * pendiente). La cuenta no inventa base — hay que llenarla a mano antes de liquidar.
   */
  baseSinConfirmar: boolean;
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

export type ContratoConPlata = ContratoCiclo & {
  ahorro_acumulado?: number | null;
  ahorro_apertura?: number | null;
  /**
   * El dato de la SIEMBRA (arqueo/SQL). ⚠️ NO es la fuente de la base — regla del dueño
   * (22-ago, tarde): «los migrados con datos del SQL eran PROYECCIONES; lo real es lo que
   * permaneció o lo que se cambió» en el campo manual. Se conserva solo como referencia.
   */
  base_inicial?: number | null;
  /**
   * LA FUENTE de la base del migrado — el campo "Ahorro inicial" de Editar contrato, el que el
   * dueño corrige A MANO (regla del 22-ago). Si nadie lo tocó, el valor de proyección quedó
   * confirmado; si se corrigió (JAVIER 510→403), manda la corrección. Si está en CERO, la base
   * está SIN CONFIRMAR (empalme pendiente) — la cuenta lo avisa y no inventa nada.
   */
  ahorro_inicial?: number | null;
};

/**
 * LA PLATA QUE ES DEL CLIENTE, en renglones con nombre. Una sola función para las DOS puertas:
 * la proyección ("¿cuánto sale si lo liquido hoy?") y la liquidación de verdad. Antes la
 * liquidación real hacía su propia suma aparte — el mismo defecto que ya costó caro con las
 * deudas: el total decía una cosa y el desglose otra.
 *
 * LA BASE Y EL AHORRO SON DOS COSAS DISTINTAS, y solo se unen acá (regla del dueño, 21-ago):
 * «la base la pone él al entrar; el ahorro lo construye pagando». Van en renglones SEPARADOS
 * para que el cliente vea de dónde sale cada peso.
 *
 * ⚠️ SE TRATAN DISTINTO SEGÚN CÓMO ENTRÓ EL CLIENTE:
 *
 *  · MIGRADO: el arqueo trajo en `ahorro_apertura` SOLO lo ganado pagando. Su base va aparte y
 *    hay que SUMARLA — si no, se le devuelve menos de lo que es suyo.
 *
 *    LA FUENTE es el campo manual "Ahorro inicial" (`ahorro_inicial`) — regla del dueño, 22-ago:
 *    lo del SQL eran proyecciones; lo real es lo que permaneció o lo que él corrigió a mano.
 *
 *    Y SE RESTA LA SEMANA COMPLETA («se le resta la semana completa, pero se le devuelve lo que
 *    le haya sobrado» — dueño, 22-ago): en el esquema viejo la base incluía la semana adelantada,
 *    que es alquiler, no ahorro. Lo que "sobre" de esa semana NO se calcula acá: lo devuelve el
 *    ajuste de salida por días (consumidos se cobran, no consumidos se devuelven), que es donde
 *    también reaparece lo que dejó de pagar. La resta usa el período de CADA contrato, así que
 *    las cuentas viejas de $195.000 salen bien sin caso especial.
 *
 *  · DEL WIZARD: la base YA se repartió al entrar — una parte pagó su primera semana (entró al
 *    ledger como Caja 1) y el resto quedó en `ahorro_apertura`. Sumarla acá la contaría DOS
 *    VECES. Por eso solo se etiqueta de dónde viene cada parte.
 */
export function plataQueEsDelCliente(contrato: ContratoConPlata): RenglonCuenta[] {
  const renglones: RenglonCuenta[] = [];
  const ahorroPagando = contrato.ahorro_acumulado ?? 0;
  const ahorroApertura = contrato.ahorro_apertura ?? 0;
  const baseEntregada = contrato.ahorro_inicial ?? 0;

  if (contrato.es_migrado) {
    if (baseEntregada > 0) {
      renglones.push({ concepto: "Base inicial que entregó", monto: baseEntregada });
      // Nunca se resta más de lo que entregó — dejarlo en negativo le inventaría una deuda.
      const semana = Math.min(valorPeriodoReal(contrato), baseEntregada);
      if (semana > 0) renglones.push({ concepto: "Menos la semana adelantada de esa base", monto: -semana });
    }
    const ahorro = ahorroPagando + ahorroApertura;
    if (ahorro > 0) renglones.push({ concepto: "Ahorro que ganó pagando", monto: ahorro });
  } else {
    // La apertura de un contrato del wizard ES el remanente de su base, no ahorro ganado.
    if (ahorroApertura > 0) renglones.push({ concepto: "Ahorro que viene de su base inicial", monto: ahorroApertura });
    if (ahorroPagando > 0) renglones.push({ concepto: "Ahorro que ganó pagando", monto: ahorroPagando });
  }
  return renglones;
}

/**
 * Arma la cuenta de una liquidación.
 *
 * @param fechaCorte  el día en que se guardó la moto. TODO se cuenta hasta ahí — regla del dueño:
 *                    «se liquida hasta el día en que se guardó o se retuvo el vehículo». Los días
 *                    que la moto lleva en la bodega de la empresa no se le cobran al cliente.
 */
export function cuentaLiquidacion(opts: {
  contrato: ContratoConPlata;
  fechaCorte: string;
  saldoFavor: number;
  deudas: DeudaCuenta[];
  convenios: ConvenioCuenta[];
  danos?: RenglonCuenta[];
}): CuentaLiquidacion {
  const { contrato, fechaCorte, saldoFavor, deudas, convenios, danos = [] } = opts;
  const ajuste = ajusteSalidaLedger(contrato, new Date(fechaCorte + "T12:00:00"));

  const aFavor: RenglonCuenta[] = [...plataQueEsDelCliente(contrato)];
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
    baseSinConfirmar: !!contrato.es_migrado && (contrato.ahorro_inicial ?? 0) <= 0,
  };
}
