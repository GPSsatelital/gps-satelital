import { faltaDelAcuerdo, type ContratoCiclo } from "./cicloPago";

// CÓMO SE HAN PAGADO LOS CONVENIOS — el seguimiento que pidió el dueño (25-ago):
// "las motos que tienen convenios y cómo se han pagado o gestionado esos convenios desde que
// se crearon, según sus pagos".
//
// Por cada convenio: qué se pactó, cuánto se le ha EXIGIDO a hoy (con el arrastre y los
// períodos rodados), cuánto ha ENTRADO de verdad, y la lista de cada abono desde la firma.
// La cuenta de lo exigido NO se reimplementa acá: se le pregunta a `faltaDelAcuerdo`, la misma
// función que usan Cartera y el cobro — así el reporte no puede decir una cosa y la pantalla
// del funcionario otra (la lección de LIBINTO y DANIEL).

export type ConvenioIn = {
  id: string;
  contrato_id: string;
  numero_convenio: number;
  deuda_total: number;
  cuota_por_periodo: number;
  numero_cuotas: number;
  cuotas_pagadas: number;
  estado: string;
  concepto: string;
  fecha_limite: string;
  created_at: string;
  periodos_exonerados?: number | null;
  cubre_periodo_hasta?: string | null;
};

export type PagoConvIn = {
  contrato_id: string;
  fecha: string;
  created_at: string;
  estado: string;
  valor: number;
  metodo?: string | null;
  aplicado_convenio?: number | null;
};

export type AbonoConvenio = {
  fecha: string;
  monto: number;
  metodo: string;
  /** Cuánto llevaba abonado al convenio DESPUÉS de este pago. */
  acumulado: number;
  /** Cuántas cuotas completas quedaron cubiertas con este abono (0 si solo fue parcial). */
  cuotasCompletadas: number;
};

export type ConvenioReporte = {
  convenioId: string;
  contratoId: string;
  placa: string;
  grupo: string;
  cliente: string;
  encargado: string;
  numero: number;
  concepto: string;
  estado: string;
  firmado: string;
  fechaLimite: string;
  diasDesdeFirma: number;
  total: number;
  cuota: number;
  numeroCuotas: number;
  /** Plata REAL que ha entrado al convenio desde que se firmó. */
  abonado: number;
  /** Lo que falta para terminarlo (total − abonado). */
  saldo: number;
  /** Cuánto se le ha exigido a hoy (cuotas corridas, con el arrastre y los períodos rodados). */
  exigido: number;
  /** Lo que debería haber pagado y no pagó: exigido − abonado. 0 = al día. */
  atrasado: number;
  cuotasCompletas: number;
  alDia: boolean;
  /** Fecha del último abono. null = NUNCA ha abonado desde que se firmó. */
  ultimoAbono: string | null;
  diasSinAbonar: number | null;
  abonos: AbonoConvenio[];
};

const dia = (iso: string) => iso.slice(0, 10);
const diasEntre = (a: string, b: string) =>
  Math.max(0, Math.round((Date.parse(b + "T12:00:00") - Date.parse(a + "T12:00:00")) / 86400000));

export function reporteConvenios(
  convenios: ConvenioIn[],
  pagos: PagoConvIn[],
  contratos: Array<ContratoCiclo & { id: string; cliente_id: string; moto_id: string | null }>,
  motosPorId: Map<string, { placa: string; grupo?: string | null; subadmin_id?: string | null }>,
  clientesPorId: Map<string, string>,
  subadminsPorId: Map<string, string>,
  hoyISO: string,
  soloActivos = true,
): ConvenioReporte[] {
  const hoy = new Date(hoyISO + "T12:00:00");
  return convenios
    .filter(cv => (soloActivos ? cv.estado === "activo" : true) && cv.cuota_por_periodo > 0)
    .map(cv => {
      const ct = contratos.find(c => c.id === cv.contrato_id);
      const moto = ct?.moto_id ? motosPorId.get(ct.moto_id) : undefined;

      // Los abonos REALES al convenio, en el orden en que entraron (el mismo del motor).
      const propios = pagos
        .filter(p => p.contrato_id === cv.contrato_id && p.estado === "Confirmado"
          && (p.aplicado_convenio ?? 0) > 0 && p.created_at >= cv.created_at)
        .sort((a, b) => a.created_at.localeCompare(b.created_at));

      let acum = 0;
      const abonos: AbonoConvenio[] = propios.map(p => {
        const antes = Math.floor(acum / cv.cuota_por_periodo);
        acum += p.aplicado_convenio ?? 0;
        const despues = Math.min(Math.floor(acum / cv.cuota_por_periodo), cv.numero_cuotas);
        return {
          fecha: dia(p.fecha),
          monto: p.aplicado_convenio ?? 0,
          metodo: p.metodo ?? "—",
          acumulado: acum,
          cuotasCompletadas: Math.max(despues - antes, 0),
        };
      });

      const abonado = acum;
      // Lo EXIGIDO sale de la fuente única (respeta arrastre, prorrateo, semanas financiadas y
      // los períodos rodados de la mig 118). Sin contrato no se puede calcular: queda en 0.
      const acuerdo = ct ? faltaDelAcuerdo(cv, ct, propios, hoy) : null;
      const exigido = acuerdo?.toca ?? 0;
      const ultimoAbono = abonos.length ? abonos[abonos.length - 1].fecha : null;

      return {
        convenioId: cv.id,
        contratoId: cv.contrato_id,
        placa: moto?.placa ?? "—",
        grupo: moto?.grupo || "SIN GRUPO",
        cliente: ct ? (clientesPorId.get(ct.cliente_id) ?? "—") : "—",
        encargado: moto?.subadmin_id ? (subadminsPorId.get(moto.subadmin_id) ?? "—") : "Sin asignar",
        numero: cv.numero_convenio,
        concepto: cv.concepto,
        estado: cv.estado,
        firmado: dia(cv.created_at),
        fechaLimite: cv.fecha_limite,
        diasDesdeFirma: diasEntre(dia(cv.created_at), hoyISO),
        total: cv.deuda_total,
        cuota: cv.cuota_por_periodo,
        numeroCuotas: cv.numero_cuotas,
        abonado,
        saldo: Math.max(cv.deuda_total - abonado, 0),
        exigido,
        atrasado: Math.max(exigido - abonado, 0),
        cuotasCompletas: Math.min(Math.floor(abonado / cv.cuota_por_periodo), cv.numero_cuotas),
        alDia: exigido - abonado <= 0,
        ultimoAbono,
        diasSinAbonar: ultimoAbono ? diasEntre(ultimoAbono, hoyISO) : null,
        abonos,
      };
    })
    // Primero los que peor van: más atrasados, y entre iguales los que llevan más sin abonar.
    .sort((a, b) => (b.atrasado - a.atrasado) || ((b.diasSinAbonar ?? 9999) - (a.diasSinAbonar ?? 9999)));
}

/** Totales para el encabezado del informe. */
export function totalesConvenios(filas: ConvenioReporte[]) {
  return {
    cantidad: filas.length,
    pactado: filas.reduce((s, f) => s + f.total, 0),
    abonado: filas.reduce((s, f) => s + f.abonado, 0),
    saldo: filas.reduce((s, f) => s + f.saldo, 0),
    atrasado: filas.reduce((s, f) => s + f.atrasado, 0),
    alDia: filas.filter(f => f.alDia).length,
    sinUnSoloAbono: filas.filter(f => f.abonos.length === 0).length,
  };
}
