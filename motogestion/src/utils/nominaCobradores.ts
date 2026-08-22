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

export type TipoGestion = "ciclo" | "ciclo_atrasado" | "prorrateo" | "retencion";

export type GestionNomina = {
  motoId: string;
  placa: string;
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
  aplicado_tarifa?: number | null;
  aplicado_ahorro?: number | null;
};

export type MotoNomina = { id: string; placa: string; subadmin_id: string | null };
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
}): NominaCobrador[] {
  const { desde, hasta, contratos, pagos, motos, recepciones, clientesPorId } = opts;
  const motoDe = new Map(motos.map(m => [m.id, m]));
  const renglones: GestionNomina[] = [];

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

    const pagosC = pagos
      .filter(p => p.contrato_id === c.id && p.estado === "Confirmado")
      .sort((a, b) => a.created_at.localeCompare(b.created_at));

    // Dos carriles a propósito: la plata de la semana ADELANTADA (pago interno del wizard) va
    // DERECHO a su caja — nunca al prorrateo. Si entrara al carril común, como el pago interno
    // se registra primero, sus pesos cruzarían el prorrateo y el sistema le pagaría al cobrador
    // un prorrateo que en realidad quedó pago con la base (hay prueba que lo caza).
    let prorrAcum = 0;
    let cajaAcum = 0;
    for (const p of pagosC) {
      let cuota = (p.aplicado_tarifa ?? 0) + (p.aplicado_ahorro ?? 0);
      if (cuota <= 0) continue;
      const esAdelanto = p.tipo_registro === "adelanto_base";

      // El prorrateo (caja 0) se llena primero, solo con plata COBRADA de verdad.
      if (!esAdelanto && prorrAcum < prorrateoTotal) {
        const alProrrateo = Math.min(cuota, prorrateoTotal - prorrAcum);
        prorrAcum += alProrrateo;
        cuota -= alProrrateo;
        if (prorrAcum >= prorrateoTotal) {
          const f = dia(p.fecha);
          if (f >= desde && f <= hasta) {
            renglones.push({ motoId: moto.id, placa: moto.placa, cliente, tipo: "prorrateo", fecha: f, valor: VALOR_CICLO });
          }
        }
      }
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
          motoId: moto.id, placa: moto.placa, cliente,
          tipo: atrasada ? "ciclo_atrasado" : "ciclo",
          fecha: f,
          valor: atrasada ? VALOR_ATRASADO : VALOR_CICLO,
        });
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
    renglones.push({ motoId: moto.id, placa: moto.placa, cliente, tipo: "retencion", fecha: f, valor: VALOR_RETENCION });
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
      total: rs.reduce((s, r) => s + r.valor, 0),
    };
  }).sort((a, b) => b.total - a.total);
}
