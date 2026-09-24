/**
 * QUÉ CUBRIÓ CADA PAGO, Y DE QUÉ FECHA A QUÉ FECHA.
 *
 * 🔴 PEDIDO DEL DUEÑO (24-sep-2026): *"creo que también los pagos digan qué cubre y de qué fecha a
 * qué fecha"*. Hoy un pago dice *"Cuota $202.000"* y el cliente no sabe qué semana le tapó. Es la
 * REGLA DE LA ESENCIA Y EL RASTRO: un peso que no dice a qué período fue es un peso en el aire.
 *
 * ── CÓMO SE CALCULA ─────────────────────────────────────────────────────────────────────────
 * Rebobinando: se arranca en el estado inicial del contrato (las semanas que ya traía) y se pasan
 * los pagos **en el orden en que se digitaron** (`created_at`, que es el orden en que el motor los
 * repartió), llenando semanas con lo que cada uno aplicó. Igual que el FIFO del saldo a favor.
 *
 * ⚠️ LO QUE NO HACE, A PROPÓSITO. Si al terminar de rebobinar el resultado **no coincide** con lo
 * que el contrato dice hoy, devuelve `confiable: false` y **las pantallas no muestran fechas**.
 * Preferimos no decir nada a decir una semana equivocada — mostrar "cubrió del 8 al 14" cuando no
 * es cierto sería el defecto de las cifras mal etiquetadas, que es el que más caro sale.
 *
 * Esto pasa de verdad: al revisar IEW50I apareció que su libro de semanas dice $224.000 más de lo
 * que sus pagos aplicaron, porque el registro de "por qué camino se llenó cada semana" solo existe
 * desde el 22-ago. En esos contratos el rebobinado no cierra, y se calla.
 */
import { proximoDiaPago, type ContratoCiclo } from "./cicloPago";

export type SemanaCubierta = {
  /** Número global de la semana dentro del contrato (incluye las que ya traía al migrar). */
  numero: number;
  desde: string;
  hasta: string;
  /** Cuánto de ESTE pago fue a esa semana. */
  monto: number;
  /** `true` si con este pago la semana quedó completa. */
  completa: boolean;
};

export type CubrimientoPago = {
  semanas: SemanaCubierta[];
  /** Lo que fue a los días iniciales (el prorrateo), que no es una semana completa. */
  prorrateo: number;
};

export type Rastro = {
  /** Por id de pago. Vacío si no es confiable. */
  porPago: Record<string, CubrimientoPago>;
  /** `false` = el rebobinado no cerró contra el estado de hoy; no mostrar fechas. */
  confiable: boolean;
  /** Cuánto no cerró, para poder explicarlo. */
  descuadre: number;
};

type PagoCubrimiento = {
  id: string;
  created_at: string;
  estado?: string | null;
  aplicado_tarifa?: number | null;
  aplicado_prorrateo?: number | null;
};

const fechaISO = (d: Date) => d.toISOString().slice(0, 10);
const menosUnDia = (iso: string) => {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() - 1);
  return fechaISO(d);
};

/**
 * Las fechas de la semana número `n` (global). Las semanas que el contrato ya traía al migrar son
 * anteriores al arranque del libro y no tienen fecha en nuestro calendario: devuelve `null`.
 */
export function fechasDeLaSemana(
  contrato: ContratoCiclo & { fecha_inicio_cajas?: string | null; cajas_previas?: number | null },
  n: number,
): { desde: string; hasta: string } | null {
  const inicio = contrato.fecha_inicio_cajas;
  const previas = contrato.cajas_previas ?? 0;
  if (!inicio || n <= previas) return null;

  let d = new Date(inicio + "T12:00:00");
  // Tope anti-cuelgue: 260 semanas son 5 años, más del doble del contrato más largo (104).
  for (let i = 0; i < Math.min(n - previas - 1, 260); i++) d = proximoDiaPago(contrato, d);
  const desde = fechaISO(d);
  const hasta = menosUnDia(fechaISO(proximoDiaPago(contrato, d)));
  return { desde, hasta };
}

/**
 * Rebobina los pagos de un contrato para saber qué semanas cubrió cada uno.
 * `pagos` deben ser los CONFIRMADOS; se ordenan por `created_at`.
 */
export function rastroDeCubrimiento(
  contrato: ContratoCiclo & {
    fecha_inicio_cajas?: string | null;
    cajas_previas?: number | null;
    cajas_pagadas?: number | null;
    caja_actual_pagado?: number | null;
    valor_semanal?: number | null;
  },
  pagos: PagoCubrimiento[],
): Rastro {
  const valor = contrato.valor_semanal ?? 0;
  const previas = contrato.cajas_previas ?? 0;
  if (valor <= 0) return { porPago: {}, confiable: false, descuadre: 0 };

  const porPago: Record<string, CubrimientoPago> = {};
  let llenas = previas;      // cuántas semanas están completas
  let enCurso = 0;           // cuánto lleva abonado la que se está llenando

  for (const p of [...pagos].sort((a, b) => a.created_at.localeCompare(b.created_at))) {
    const cub: CubrimientoPago = { semanas: [], prorrateo: p.aplicado_prorrateo ?? 0 };
    let resto = p.aplicado_tarifa ?? 0;

    // Tope anti-cuelgue: un pago no puede tapar más de 260 semanas.
    for (let i = 0; resto > 0 && i < 260; i++) {
      const falta = valor - enCurso;
      const pone = Math.min(resto, falta);
      const numero = llenas + 1;
      const f = fechasDeLaSemana(contrato, numero);
      cub.semanas.push({
        numero,
        desde: f?.desde ?? "",
        hasta: f?.hasta ?? "",
        monto: pone,
        completa: pone === falta,
      });
      enCurso += pone;
      resto -= pone;
      if (enCurso >= valor) { llenas++; enCurso = 0; }
    }

    if (cub.semanas.length > 0 || cub.prorrateo > 0) porPago[p.id] = cub;
  }

  // ¿El rebobinado cierra contra lo que el contrato dice HOY?
  const descuadre = (llenas * valor + enCurso) - ((contrato.cajas_pagadas ?? 0) * valor + (contrato.caja_actual_pagado ?? 0));
  const confiable = Math.abs(descuadre) <= 1;
  return { porPago: confiable ? porPago : {}, confiable, descuadre };
}

/** "del 8 al 14 de septiembre" · "del 29 de septiembre al 5 de octubre" (cuando cruza de mes). */
export function fraseDeFechas(desde: string, hasta: string): string {
  if (!desde || !hasta) return "";
  const M = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const a = new Date(desde + "T12:00:00"), b = new Date(hasta + "T12:00:00");
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return "";
  return a.getMonth() === b.getMonth()
    ? `del ${a.getDate()} al ${b.getDate()} de ${M[b.getMonth()]}`
    : `del ${a.getDate()} de ${M[a.getMonth()]} al ${b.getDate()} de ${M[b.getMonth()]}`;
}
