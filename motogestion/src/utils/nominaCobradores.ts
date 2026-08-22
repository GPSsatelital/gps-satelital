import { proximoDiaPago, valorPeriodoReal, type ContratoCiclo } from "./cicloPago";

// LA NÓMINA DE LOS COBRADORES — la regla del dueño, cerrada el 22-ago pregunta por pregunta
// (ver memoria regla-nomina-cobradores). Se paga por MOTO GESTIONADA, por ciclo del cliente:
//
//   · Ciclo cobrado A TIEMPO ............ $7.500   (semanal cada semana, quincenal cada 15 días,
//                                                   mensual al mes — "una vez por ciclo")
//   · PRORRATEO cobrado ................. $7.500   (el primer cobro real de la moto, completo)
//   · Ciclo ATRASADO que entra después .. 30% = $2.250  (la gestión llegó tarde; el trabajo duro
//                                                   de la retención ya se premió con los $10.000)
//   · RETENCIÓN ......................... $17.500  (una sola vez: la semana en que se retiene)
//   · En mora, ni pagó ni se retuvo ..... $0       (no hubo gestión)
//   · La semana ADELANTADA del wizard ... $0       (nace paga con la base — nadie la cobró)
//
// Solo SUBADMIN con motos asignadas. Los DIARIOS quedan por fuera (decisión del dueño: "la idea
// ahorita es que todos los diarios paguen solo a semanal").
//
// CÓMO SE DETECTA UN CICLO: cada caja del libro que se LLENA es un ciclo cumplido. Se recorre la
// plata de cuota de los pagos confirmados en el orden en que entraron (el mismo orden FIFO del
// motor de reparto) y cada vez que la suma cruza el valor de una caja, esa caja se llenó — con la
// fecha del pago que la cruzó. A tiempo o atrasada se decide contra el día en que esa caja se
// EXIGÍA: si su semana ya había pasado cuando se llenó, entró tarde.
//
// El resultado es un DESPRENDIBLE verificable: pedido textual del dueño — "un documento detallado
// para que cada cobrador o subadmin pueda verificar bien qué le están pagando". Por eso cada
// renglón trae placa, cliente, qué gestión, fecha y valor — nada sale de un total mudo.

export const VALOR_CICLO = 7500;
export const FRACCION_ATRASADO = 0.3;             // → $2.250
export const EXTRA_RETENCION = 10000;             // → $17.500 la retención
export const VALOR_ATRASADO = VALOR_CICLO * FRACCION_ATRASADO;
export const VALOR_RETENCION = VALOR_CICLO + EXTRA_RETENCION;

export type TipoGestion = "ciclo" | "ciclo_atrasado" | "prorrateo" | "retencion" | "cuota_convenio";

/** Anotación del vigía (mig 112): una caja que se llenó, con fecha y por cuál camino. */
export type EventoCaja = {
  contrato_id: string;
  caja_numero: number;   // 0 = prorrateo
  fecha: string;
  fuente: "pago" | "convenio";
};

export type ConvenioNomina = {
  contrato_id: string;
  cuota_por_periodo: number;
  numero_cuotas: number;
  created_at: string;
};

export type GestionNomina = {
  motoId: string;
  placa: string;
  /** El portafolio dueño de la moto: de ahí sale la plata de esta gestión (pedido del dueño, 22-ago). */
  grupo: string;
  cliente: string;
  tipo: TipoGestion;
  /** El día en que entró la plata (o en que se retuvo). */
  fecha: string;
  valor: number;
};

export type NominaCobrador = {
  /** null = motos gestionables SIN cobrador asignado — se muestran aparte, no se pagan a nadie. */
  subadminId: string | null;
  renglones: GestionNomina[];
  ciclosATiempo: number;
  ciclosAtrasados: number;
  prorrateos: number;
  retenciones: number;
  cuotasConvenio: number;
  total: number;
};

export type ContratoNomina = ContratoCiclo & {
  id: string;
  cliente_id: string;
  moto_id: string | null;
  estado: string;
};

export type PagoNomina = {
  contrato_id: string;
  /** Cuándo PAGÓ el cliente (la nómina agrupa por esta fecha). */
  fecha: string;
  /** El orden del reparto FIFO del motor — por esto se recorre, no por `fecha`. */
  created_at: string;
  estado: string;
  tipo_registro?: string | null;
  /**
   * ⚠️ SEMÁNTICA DEL MOTOR (mig 045), verificada contra su código el 22-ago:
   *  · `aplicado_tarifa` = TODA la plata que este pago metió a cajas — CON el ahorro adentro
   *    (el bucle FIFO suma el delta completo, línea 203 de la 045).
   *  · `aplicado_ahorro` = cuánto de ESA MISMA plata fue ahorro. Es informativo: sumarlo encima
   *    de aplicado_tarifa cuenta el ahorro DOS VECES — primer defecto que descuadró la nómina.
   *  · `aplicado_prorrateo` = la plata del prorrateo, en SU columna — no vive dentro de tarifa
   *    (segundo defecto: buscarla ahí robaba plata de las cajas en contratos del wizard).
   */
  aplicado_tarifa?: number | null;
  aplicado_ahorro?: number | null;
  aplicado_prorrateo?: number | null;
  aplicado_convenio?: number | null;
};

export type MotoNomina = { id: string; placa: string; subadmin_id: string | null; grupo?: string | null };

/** Cuánto sale de cada portafolio en una nómina (la plata la paga el grupo dueño de cada moto). */
export function totalesPorGrupo(renglones: GestionNomina[]): Array<{ grupo: string; total: number }> {
  const m = new Map<string, number>();
  for (const r of renglones) m.set(r.grupo, (m.get(r.grupo) ?? 0) + r.valor);
  return [...m.entries()].map(([grupo, total]) => ({ grupo, total })).sort((a, b) => b.total - a.total);
}
export type RecepcionNomina = { moto_id: string; motivo: string; created_at: string };

const dia = (iso: string) => iso.slice(0, 10);

/** El lunes de la semana de una fecha (la semana de nómina va de lunes a domingo). */
export function lunesDe(iso: string): string {
  const d = new Date(dia(iso) + "T12:00:00");
  const retro = (d.getDay() + 6) % 7;             // lunes=0 ... domingo=6
  d.setDate(d.getDate() - retro);
  return d.toISOString().slice(0, 10);
}

/**
 * Calcula la nómina de una semana [desde, hasta] (lunes a domingo, ISO).
 *
 * @param clientesPorId  nombre del cliente por id — solo para que el desprendible sea legible.
 */
export function nominaSemana(opts: {
  desde: string;
  hasta: string;
  contratos: ContratoNomina[];
  pagos: PagoNomina[];
  motos: MotoNomina[];
  recepciones: RecepcionNomina[];
  clientesPorId: Map<string, string>;
  /**
   * Las anotaciones del vigía (mig 112) para esta semana. Si vienen, los ciclos salen de acá —
   * exacto por construcción, cubre los tres caminos de llenado. Si vienen null (semana anterior
   * a la migración), se cae al método viejo de releer pagos, que solo es confiable para
   * contratos post-motor sin convenios ni ajustes — la pantalla lo avisa.
   */
  eventos?: EventoCaja[] | null;
  /** Los convenios del sistema — para pagar el 30% cuando ENTRA cada cuota (decisión del dueño). */
  convenios?: ConvenioNomina[];
}): NominaCobrador[] {
  const { desde, hasta, contratos, pagos, motos, recepciones, clientesPorId, eventos = null, convenios = [] } = opts;
  const motoDe = new Map(motos.map(m => [m.id, m]));
  const renglones: GestionNomina[] = [];
  const eventosPorContrato = new Map<string, EventoCaja[]>();
  if (eventos) for (const e of eventos) {
    if (!eventosPorContrato.has(e.contrato_id)) eventosPorContrato.set(e.contrato_id, []);
    eventosPorContrato.get(e.contrato_id)!.push(e);
  }

  // ── 1) CICLOS: cada caja del libro que se llenó dentro de la semana ─────────
  for (const c of contratos) {
    // Diarios por fuera (decisión del dueño) y sin motor no hay libro que leer. Los contratos
    // Cancelados tampoco: sus cajas viejas no son gestión de esta semana.
    if (!c.motor_v2 || c.forma_pago === "Diario" || !c.fecha_inicio_cajas || c.estado === "Cancelado") continue;
    if (!c.moto_id) continue;
    const moto = motoDe.get(c.moto_id);
    if (!moto) continue;

    const valor = valorPeriodoReal(c);
    if (valor <= 0) continue;
    const previas = c.cajas_previas ?? 0;
    const prorrateoTotal = c.es_migrado ? 0 : (c.prorrateo_total ?? 0);
    const cliente = clientesPorId.get(c.cliente_id) ?? "—";

    // Las fechas en que se EXIGE cada caja: la caja (previas+1) se exige el día en que arranca
    // el libro; cada siguiente, un período después. Se calculan las necesarias, no todas.
    const exigencias: string[] = [dia(c.fecha_inicio_cajas)];
    const exigenciaDe = (cajaRel: number): string => {   // cajaRel = 1 para la caja previas+1
      while (exigencias.length < cajaRel) {
        const ult = new Date(exigencias[exigencias.length - 1] + "T12:00:00");
        exigencias.push(proximoDiaPago(c, ult).toISOString().slice(0, 10));
      }
      return exigencias[cajaRel - 1];
    };

    // ── MODO EXACTO (mig 112): las anotaciones del vigía dicen qué caja se llenó y cuándo ──
    if (eventos) {
      for (const ev of eventosPorContrato.get(c.id) ?? []) {
        if (ev.fecha < desde || ev.fecha > hasta) continue;
        // Las cajas marcadas por un CONVENIO no se pagan por la anotación: se pagan cuando
        // entra cada cuota del convenio (sección 1b) — decisión del dueño, 22-ago.
        if (ev.fuente === "convenio") continue;
        if (ev.caja_numero === 0) {
          renglones.push({ motoId: moto.id, placa: moto.placa, grupo: moto.grupo ?? "—", cliente, tipo: "prorrateo", fecha: ev.fecha, valor: VALOR_CICLO });
          continue;
        }
        // La semana ADELANTADA del wizard (su primera caja, pagada con la base): nadie la cobró.
        if (!c.es_migrado && ev.caja_numero === 1) continue;
        if (c.total_cajas != null && ev.caja_numero > c.total_cajas) continue;
        const rel = ev.caja_numero - previas;
        if (rel < 1) continue;   // cajas del corte de migración: no son gestión de nadie acá
        const atrasada = lunesDe(exigenciaDe(rel)) < lunesDe(ev.fecha);
        renglones.push({
          motoId: moto.id, placa: moto.placa, grupo: moto.grupo ?? "—", cliente,
          tipo: atrasada ? "ciclo_atrasado" : "ciclo",
          fecha: ev.fecha,
          valor: atrasada ? VALOR_ATRASADO : VALOR_CICLO,
        });
      }
      continue;   // con anotaciones no se relee ningún pago: una sola fuente de verdad
    }

    const pagosC = pagos
      .filter(p => p.contrato_id === c.id && p.estado === "Confirmado")
      .sort((a, b) => a.created_at.localeCompare(b.created_at));

    // MÉTODO VIEJO (solo semanas anteriores a la mig 112).
    // Se replica EXACTAMENTE lo que el motor ya repartió (mig 045): la plata de cajas viene en
    // `aplicado_tarifa` (con el ahorro adentro — NO se le suma aplicado_ahorro, sería contarlo
    // dos veces) y la del prorrateo en `aplicado_prorrateo`. La nómina no reparte nada: solo lee
    // el reparto del motor y le pone fecha a cada caja que se llenó.
    let prorrAcum = 0;
    let cajaAcum = 0;
    for (const p of pagosC) {
      const esAdelanto = p.tipo_registro === "adelanto_base";
      const f = dia(p.fecha);

      // Prorrateo (caja 0): su plata vive en SU columna. Se paga al completarse.
      const pror = p.aplicado_prorrateo ?? 0;
      if (pror > 0 && prorrateoTotal > 0 && prorrAcum < prorrateoTotal) {
        prorrAcum += pror;
        if (prorrAcum >= prorrateoTotal && f >= desde && f <= hasta) {
          renglones.push({ motoId: moto.id, placa: moto.placa, grupo: moto.grupo ?? "—", cliente, tipo: "prorrateo", fecha: f, valor: VALOR_CICLO });
        }
      }

      const cuota = p.aplicado_tarifa ?? 0;
      if (cuota <= 0) continue;

      // ¿Qué cajas cruzó este pago? (cajaRel = 1, 2, ... relativa al arranque del libro)
      const antes = cajaAcum;
      cajaAcum += cuota;
      const relAntes = Math.floor(antes / valor);
      const relDespues = Math.floor(cajaAcum / valor);
      for (let rel = relAntes + 1; rel <= relDespues; rel++) {
        const cajaAbs = previas + rel;
        // Más allá del total pactado no hay ciclo que pagar (prepagó de más → saldo a favor).
        if (c.total_cajas != null && cajaAbs > c.total_cajas) break;
        // La semana ADELANTADA del wizard nace paga con la base: nadie la cobró, no se paga.
        if (esAdelanto) continue;
        const f = dia(p.fecha);
        if (f < desde || f > hasta) continue;
        // A tiempo si la semana en que se exigía aún no había pasado cuando se llenó
        // (llenarla antes de tiempo —prepago— también es a tiempo). Tarde = 30%.
        const atrasada = lunesDe(exigenciaDe(rel)) < lunesDe(f);
        renglones.push({
          motoId: moto.id, placa: moto.placa, grupo: moto.grupo ?? "—", cliente,
          tipo: atrasada ? "ciclo_atrasado" : "ciclo",
          fecha: f,
          valor: atrasada ? VALOR_ATRASADO : VALOR_CICLO,
        });
      }
    }
  }

  // ── 1b) CUOTAS DE CONVENIO: el 30% cuando ENTRA cada cuota (decisión del dueño, 22-ago:
  //        "plata que entra, gestión que se paga" — ni al firmarse el convenio, ni nunca antes).
  //        Cada cuota COMPLETA que se cobra dentro de la semana genera $2.250.
  for (const cv of convenios) {
    if (cv.cuota_por_periodo <= 0) continue;
    const c = contratos.find(x => x.id === cv.contrato_id);
    if (!c || !c.moto_id || c.forma_pago === "Diario" || c.estado === "Cancelado") continue;
    const moto = motoDe.get(c.moto_id);
    if (!moto) continue;
    const cliente = clientesPorId.get(c.cliente_id) ?? "—";
    // El mismo conteo del motor (mig 045, líneas 349-354): acumulado de aplicado_convenio desde
    // que el convenio existe; cada múltiplo de la cuota es una cuota completa.
    const pagosConv = pagos
      .filter(p => p.contrato_id === cv.contrato_id && p.estado === "Confirmado" && (p.aplicado_convenio ?? 0) > 0 && p.created_at >= cv.created_at)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    let acum = 0;
    for (const p of pagosConv) {
      const antes = Math.floor(acum / cv.cuota_por_periodo);
      acum += p.aplicado_convenio ?? 0;
      const despues = Math.min(Math.floor(acum / cv.cuota_por_periodo), cv.numero_cuotas);
      const f = dia(p.fecha);
      if (f < desde || f > hasta) continue;
      for (let k = Math.max(antes, 0); k < despues; k++) {
        renglones.push({ motoId: moto.id, placa: moto.placa, grupo: moto.grupo ?? "—", cliente, tipo: "cuota_convenio", fecha: f, valor: VALOR_ATRASADO });
      }
    }
  }

  // ── 2) RETENCIONES: una sola vez, la semana en que se retiene ───────────────
  const yaRetenida = new Set<string>();
  for (const r of recepciones) {
    if (r.motivo !== "retencion_mora") continue;
    const f = dia(r.created_at);
    if (f < desde || f > hasta) continue;
    if (yaRetenida.has(r.moto_id)) continue;      // dos registros de la misma moto = una retención
    yaRetenida.add(r.moto_id);
    const moto = motoDe.get(r.moto_id);
    if (!moto) continue;
    const contrato = contratos.find(x => x.moto_id === r.moto_id && x.estado !== "Cancelado");
    if (contrato?.forma_pago === "Diario") continue;   // los diarios están por fuera de la nómina
    const cliente = contrato ? (clientesPorId.get(contrato.cliente_id) ?? "—") : "—";
    renglones.push({ motoId: moto.id, placa: moto.placa, grupo: moto.grupo ?? "—", cliente, tipo: "retencion", fecha: f, valor: VALOR_RETENCION });
  }

  // ── 3) Agrupar por cobrador (null = sin asignar, se muestra aparte) ─────────
  const porCobrador = new Map<string | null, GestionNomina[]>();
  for (const r of renglones) {
    const sub = motoDe.get(r.motoId)?.subadmin_id ?? null;
    if (!porCobrador.has(sub)) porCobrador.set(sub, []);
    porCobrador.get(sub)!.push(r);
  }

  return [...porCobrador.entries()].map(([subadminId, rs]) => {
    rs.sort((a, b) => a.placa.localeCompare(b.placa) || a.fecha.localeCompare(b.fecha));
    return {
      subadminId,
      renglones: rs,
      ciclosATiempo: rs.filter(r => r.tipo === "ciclo").length,
      ciclosAtrasados: rs.filter(r => r.tipo === "ciclo_atrasado").length,
      prorrateos: rs.filter(r => r.tipo === "prorrateo").length,
      retenciones: rs.filter(r => r.tipo === "retencion").length,
      cuotasConvenio: rs.filter(r => r.tipo === "cuota_convenio").length,
      total: rs.reduce((s, r) => s + r.valor, 0),
    };
  }).sort((a, b) => b.total - a.total);
}
