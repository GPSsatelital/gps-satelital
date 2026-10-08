import { ajusteSalidaLedger, abonadoDesdeLaFirma, valorPeriodoReal, type ContratoCiclo } from "./cicloPago";
import type { MotivoLiquidacion } from "../hooks/useLiquidaciones";

/** Así nace el convenio que financia la base que el cliente no completó (WizardContrato). */
export const CONCEPTO_CONVENIO_BASE = "Base inicial incompleta al crear el contrato";

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
export type ConvenioCuenta = {
  deuda_total: number; cuota_por_periodo: number; cuotas_pagadas: number; estado: string; concepto?: string | null;
  /** Lo abonado de verdad desde la firma. Si viene, manda sobre cuotas × valor (que redondea a cuotas enteras). */
  abonado?: number;
  /** La firma: desde ahí cuentan los abonos (`abonadoDesdeLaFirma`). */
  created_at?: string | null;
  /** El desglose congelado al firmar (mig 096): deudas viejas, semanas financiadas y el ahorro de esas semanas. */
  monto_deudas?: number | null;
  monto_semanas?: number | null;
  ahorro_semanas?: number | null;
};

/** Lo que se le cobra del acuerdo en la liquidación: 'activo' e 'incumplido' (los demás ya se pagaron o se reemplazaron). */
const seCobraEnLaLiquidacion = (cv: ConvenioCuenta) => cv.estado === "activo" || cv.estado === "incumplido";

/**
 * D-046 (8-oct-2026, regla del dueño): «todo lo que en realidad sea justo de él hay que dárselo».
 * Los días en que la moto estuvo GUARDADA en la empresa y se decidió RODAR no los usó: no se le
 * cobran como usados, sean semanas completas o días sueltos. Salen de `acuerdos_tiempo_rodado`
 * (`decision = 'rodar_al_final'`): del día en que entró al día antes de salir — el mismo conteo
 * de `dias_en_empresa`. Los registros repetidos no cuentan dos veces (hay filas duplicadas).
 * Lo que se decidió COBRAR no entra: esos días el dueño decidió que sí se pagan.
 */
export function diasGuardadosRodados(
  registros: Array<{ decision: string; fecha_entrada?: string | null; fecha_salida?: string | null }>,
): string[] {
  const dias = new Set<string>();
  for (const r of registros) {
    if (r.decision !== "rodar_al_final" || !r.fecha_entrada || !r.fecha_salida) continue;
    const d = new Date(r.fecha_entrada.slice(0, 10) + "T12:00:00");
    const fin = new Date(r.fecha_salida.slice(0, 10) + "T12:00:00");
    for (let i = 0; i < 400 && d < fin; i++) {
      dias.add(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
  }
  return [...dias].sort();
}

/**
 * D-046: el ahorro de las semanas metidas en un acuerdo que todavía NO se le acreditó. El motor lo
 * acredita a medida que se abona el acuerdo, y es lo ÚLTIMO que se llena: primero las deudas viejas,
 * después la tarifa de las semanas, al final su ahorro (mig 097, `convenio_acredita_ahorro`). Si la
 * liquidación le cobra el acuerdo entero, con su plata se está pagando ese ahorro: se le devuelve.
 * Caso que lo destapó: BRADER GUZMAN (LIQ-0078), semana 30 dentro del acuerdo: $26.000.
 */
export function ahorroPendienteDelConvenio(cv: ConvenioCuenta, abonado: number): number {
  const ahorro = Number(cv.ahorro_semanas ?? 0);
  if (ahorro <= 0) return 0;
  const tarifa = Number(cv.monto_deudas ?? 0) + Math.max(Number(cv.monto_semanas ?? 0) - ahorro, 0);
  const ganado = Math.min(Math.max(abonado - tarifa, 0), ahorro);
  return ahorro - ganado;
}

/** Lo abonado a cada acuerdo, desde su firma (la misma cuenta de Cartera). Si ya viene, se respeta. */
export function conAbonado(
  convenios: ConvenioCuenta[],
  pagosConfirmados: Array<{ aplicado_convenio?: number | null; created_at?: string | null; fecha?: string | null }>,
): ConvenioCuenta[] {
  return convenios.map(cv => cv.abonado != null || !cv.created_at ? cv : { ...cv, abonado: abonadoDesdeLaFirma(cv, pagosConfirmados) });
}

/**
 * D-046: el ahorro de las semanas de los acuerdos que la liquidación cobra enteros. Como el cobro del
 * acuerdo (`deudasYAcuerdos`): el acuerdo de base no se cobra a quien se va antes, así que tampoco
 * se devuelve su ahorro. Por cumplimiento no aplica: ahí todo su ahorro paga la moto (D-023).
 */
export function ahorroDeLosAcuerdos(convenios: ConvenioCuenta[], opciones: { seVaAntes?: boolean } = {}): RenglonCuenta[] {
  const r: RenglonCuenta[] = [];
  if (!opciones.seVaAntes) return r;
  for (const cv of convenios.filter(seCobraEnLaLiquidacion)) {
    if (cv.concepto === CONCEPTO_CONVENIO_BASE) continue;
    const abonado = cv.abonado ?? cv.cuotas_pagadas * cv.cuota_por_periodo;
    if (Math.max(cv.deuda_total - abonado, 0) <= 0) continue;
    const pendiente = ahorroPendienteDelConvenio(cv, abonado);
    if (pendiente > 0) r.push({ concepto: "Ahorro de las semanas que entraron al acuerdo", monto: pendiente });
  }
  return r;
}

/**
 * D-046: el renglón del acuerdo que ya está escrito en una liquidación (lo pone `iniciarLiquidacion`
 * y el funcionario lo puede editar) se pone al día con lo abonado de verdad. Antes se armaba con las
 * cuotas COMPLETAS: a BRADER GUZMAN (LIQ-0078) le ignoró los $8.000 que abonó. Solo se toca el
 * renglón que trae la cifra que puso el sistema (la vieja o la nueva); si alguien lo cambió a mano,
 * se respeta. Devuelve también los acuerdos cobrados por ese renglón: son los que devuelven el ahorro
 * de sus semanas (`ahorroDeLosAcuerdos`).
 */
export function acuerdosEnLaLiquidacion<T extends RenglonCuenta>(
  renglones: T[],
  convenios: ConvenioCuenta[],
  opciones: { seVaAntes?: boolean } = {},
): { renglones: T[]; cobrados: ConvenioCuenta[] } {
  const esDelAcuerdo = (c: string) => c === "Saldo pendiente de convenio" || c === "Saldo de convenio incumplido";
  const porCuotas = (cv: ConvenioCuenta) => Math.max(cv.deuda_total - cv.cuotas_pagadas * cv.cuota_por_periodo, 0);
  const deVerdad = (cv: ConvenioCuenta) => Math.max(cv.deuda_total - (cv.abonado ?? cv.cuotas_pagadas * cv.cuota_por_periodo), 0);
  const libres = convenios
    .filter(seCobraEnLaLiquidacion)
    .filter(cv => !(opciones.seVaAntes && cv.concepto === CONCEPTO_CONVENIO_BASE));
  const cobrados: ConvenioCuenta[] = [];
  const out: T[] = [];
  for (const r of renglones) {
    if (!esDelAcuerdo(r.concepto)) { out.push(r); continue; }
    const i = libres.findIndex(cv => Number(r.monto) === porCuotas(cv) || Number(r.monto) === deVerdad(cv));
    if (i < 0) { out.push(r); continue; }
    const [cv] = libres.splice(i, 1);
    cobrados.push(cv);
    if (deVerdad(cv) > 0) out.push({ ...r, monto: deVerdad(cv) });
  }
  return { renglones: out, cobrados };
}

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
export function plataQueEsDelCliente(contrato: ContratoConPlata, motivo?: MotivoLiquidacion | null): RenglonCuenta[] {
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

  // D-023 (regla del dueño, 24-sep): el ahorro es la alcancía con la que el cliente COMPRA la moto.
  // Si termina bien, esa alcancía ya se gastó comprándola: es de la empresa y NO se le entrega.
  // Se sigue mostrando renglón por renglón y se cierra con uno que dice a dónde fue, para que el
  // papel que firma explique el cero en vez de hacer desaparecer la plata. Con los otros motivos
  // se va antes de terminar, no compró nada, y se le devuelve todo como siempre.
  if (motivo === "cumplimiento") {
    const ahorro = renglones.reduce((s, r) => s + r.monto, 0);
    if (ahorro > 0) renglones.push({ concepto: CONCEPTO_PAGO_MOTO, monto: -ahorro });
  }
  return renglones;
}

export const CONCEPTO_PAGO_MOTO = "Con este ahorro terminó de pagar la moto";

/**
 * Lo que el cliente debe FUERA de sus semanas: deudas sueltas y lo que falta de sus acuerdos.
 * La liquidación y el candado del cumplimiento lo leen de aquí, para que nunca digan cifras distintas.
 */
export function deudasYAcuerdos(
  deudas: DeudaCuenta[],
  convenios: ConvenioCuenta[],
  // D-023 (segunda cara): a quien se va ANTES de terminar no se le cobra NADA de su convenio de base.
  // La parte de ahorro es suya (cobrársela sería cobrarle algo que en el mismo acto habría que
  // devolverle), y si el convenio traía un pedazo de su primera semana, ese pedazo YA lo cobra la
  // liquidación por los días que usó la moto (ajuste de salida del libro de cajas) — cobrarlo aquí
  // sería cobrarlo dos veces (FRAIRON, LIQ-0070: $102.000 repetidos, corregido el 26-sep).
  // Sin esta opción (el candado del cumplimiento, D-026) se cuenta todo: la base es parte del precio.
  opciones: { seVaAntes?: boolean } = {},
): RenglonCuenta[] {
  const r: RenglonCuenta[] = [];
  // Solo las 'pendiente': las 'en_convenio' entran abajo dentro del convenio, y contarlas por los
  // dos lados sería cobrarlas dos veces.
  for (const d of deudas.filter(x => x.estado === "pendiente")) {
    r.push({
      concepto: d.descripcion?.trim() || CONCEPTO_LEGIBLE[d.concepto] || d.concepto,
      monto: d.monto_pendiente,
    });
  }
  // 'activo' e 'incumplido'. El incumplido es el que MÁS se liquida (3er incumplido → liquidación
  // obligatoria) y antes desaparecía de la cuenta, así que se devolvía todo el ahorro.
  for (const cv of convenios.filter(seCobraEnLaLiquidacion)) {
    const restante = Math.max(cv.deuda_total - (cv.abonado ?? cv.cuotas_pagadas * cv.cuota_por_periodo), 0);
    if (opciones.seVaAntes && cv.concepto === CONCEPTO_CONVENIO_BASE) continue;
    if (restante > 0) {
      r.push({
        concepto: cv.estado === "incumplido" ? "Saldo de convenio incumplido" : "Saldo pendiente de convenio",
        monto: restante,
      });
    }
  }
  return r;
}

/**
 * D-026 (regla del dueño, 25-sep): nadie termina debiendo. Si llenó sus semanas pero debe más de lo
 * que tiene a favor, NO se liquida por cumplimiento: sigue pagando su semana normal hasta quedar en
 * $0. `falta` > 0 = todavía no. Los daños del taller no entran (se saben después); si los hay y dejan
 * el saldo en negativo, la base no deja cerrar (mig 173).
 */
export function faltaParaCumplimiento(deudas: DeudaCuenta[], convenios: ConvenioCuenta[], saldoFavor: number) {
  const debe = deudasYAcuerdos(deudas, convenios).reduce((s, r) => s + r.monto, 0);
  const aFavor = Math.max(saldoFavor, 0);
  return { debe, aFavor, falta: Math.max(debe - aFavor, 0) };
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
  /** Solo "cumplimiento" cambia la cuenta: el ahorro pagó la moto (D-023). */
  motivo?: MotivoLiquidacion | null;
  /** Los pagos confirmados del contrato: de ahí sale lo abonado a cada acuerdo desde su firma (D-046). */
  pagos?: Array<{ aplicado_convenio?: number | null; created_at?: string | null; fecha?: string | null }>;
  /** Días en que la moto estuvo guardada y se rodó: no se cobran como usados (`diasGuardadosRodados`, D-046). */
  diasNoUsados?: string[];
}): CuentaLiquidacion {
  const { contrato, fechaCorte, saldoFavor, deudas, danos = [], motivo, diasNoUsados = [] } = opts;
  const convenios = opts.pagos ? conAbonado(opts.convenios, opts.pagos) : opts.convenios;
  const ajuste = ajusteSalidaLedger(contrato, new Date(fechaCorte + "T12:00:00"), diasNoUsados);

  const aFavor: RenglonCuenta[] = [...plataQueEsDelCliente(contrato, motivo)];
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

  // D-046: si se le cobra un acuerdo entero, el ahorro de sus semanas se le devuelve.
  aFavor.push(...ahorroDeLosAcuerdos(convenios, { seVaAntes: motivo !== "cumplimiento" }));

  const enContra: RenglonCuenta[] = [];
  if (ajuste.porCobrar > 0) enContra.push({ concepto: "Días que rodó y no pagó", monto: ajuste.porCobrar });
  enContra.push(...deudasYAcuerdos(deudas, convenios, { seVaAntes: motivo !== "cumplimiento" }));
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
