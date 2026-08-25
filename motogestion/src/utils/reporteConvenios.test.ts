import { describe, it, expect } from "vitest";
import { reporteConvenios, totalesConvenios, type ConvenioIn, type PagoConvIn } from "./reporteConvenios";
import type { ContratoCiclo } from "./cicloPago";

// Seguimiento de convenios (25-ago-2026): cómo se ha pagado cada uno DESDE QUE SE FIRMÓ.
// Las cifras son las de DANIEL MILLÁN (RLT87H) después de su corrección: convenio del 1-ago
// por $542.000 en cuotas de $35.000, con 3 abonos reales.

const CONTRATO: ContratoCiclo & { id: string; cliente_id: string; moto_id: string | null } = {
  id: "ct1", cliente_id: "cl1", moto_id: "m1",
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 195000,
  es_migrado: true, motor_v2: true,
  total_cajas: 104, cajas_pagadas: 56, caja_actual_pagado: 0, cajas_previas: 51,
  prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-27",
};
const CONVENIO: ConvenioIn = {
  id: "cv1", contrato_id: "ct1", numero_convenio: 1,
  deuda_total: 542000, cuota_por_periodo: 35000, numero_cuotas: 16, cuotas_pagadas: 3,
  estado: "activo", concepto: "Excel viejo", fecha_limite: "2026-11-23",
  created_at: "2026-08-01T10:00:00Z",
  // Su convenio absorbió la semana del 3-ago: hasta el 10 no se le exige cuota (dato REAL de
  // su fila). Sin esto la cuenta daría una cuota de más — y es justo lo que hace que este
  // reporte no pueda divergir de la pantalla: ambos le preguntan a la misma función.
  cubre_periodo_hasta: "2026-08-10",
};
const PAGOS: PagoConvIn[] = [
  { contrato_id: "ct1", fecha: "2026-07-25", created_at: "2026-07-25T10:00:00Z", estado: "Confirmado", valor: 195000, aplicado_convenio: 0 },
  { contrato_id: "ct1", fecha: "2026-08-01", created_at: "2026-08-01T12:00:00Z", estado: "Confirmado", valor: 26000, metodo: "Efectivo", aplicado_convenio: 26000 },
  { contrato_id: "ct1", fecha: "2026-08-08", created_at: "2026-08-08T10:00:00Z", estado: "Confirmado", valor: 230000, metodo: "Efectivo", aplicado_convenio: 35000 },
  { contrato_id: "ct1", fecha: "2026-08-15", created_at: "2026-08-15T10:00:00Z", estado: "Confirmado", valor: 230000, metodo: "Transferencia", aplicado_convenio: 35000 },
  { contrato_id: "ct1", fecha: "2026-08-16", created_at: "2026-08-16T10:00:00Z", estado: "Pendiente", valor: 50000, aplicado_convenio: 50000 },   // sin confirmar: NO cuenta
];
const MOTOS = new Map([["m1", { placa: "RLT87H", grupo: "COSTA", subadmin_id: "s1" }]]);
const CLIENTES = new Map([["cl1", "DANIEL JOSE MILLAN GUERRA"]]);
const SUBS = new Map([["s1", "BRANDON ROJAS"]]);

const run = (hoy = "2026-08-24") =>
  reporteConvenios([CONVENIO], PAGOS, [CONTRATO], MOTOS, CLIENTES, SUBS, hoy);

describe("la película del convenio: cada abono desde que se firmó", () => {
  it("lista solo los abonos REALES posteriores a la firma (los pendientes no cuentan)", () => {
    const r = run()[0];
    expect(r.abonos.map(a => a.monto)).toEqual([26000, 35000, 35000]);
    expect(r.abonado).toBe(96000);
  });

  it("cada abono dice cuánto llevaba acumulado y cuántas cuotas cerró", () => {
    const [a1, a2, a3] = run()[0].abonos;
    expect(a1).toMatchObject({ fecha: "2026-08-01", acumulado: 26000, cuotasCompletadas: 0 });   // parcial
    expect(a2).toMatchObject({ fecha: "2026-08-08", acumulado: 61000, cuotasCompletadas: 1 });
    expect(a3).toMatchObject({ acumulado: 96000, cuotasCompletadas: 1, metodo: "Transferencia" });
  });

  it("el saldo es lo que falta para terminarlo", () => {
    expect(run()[0]).toMatchObject({ total: 542000, saldo: 446000, cuotasCompletas: 2 });
  });
});

describe("cómo va: al día o atrasado", () => {
  it("lo exigido sale de la MISMA función que usa el cobro (no se reimplementa)", () => {
    const r = run()[0];
    expect(r.exigido).toBe(105000);       // 3 cuotas corridas al 24-ago
    expect(r.atrasado).toBe(9000);        // 105.000 exigidos − 96.000 abonados (el arrastre real)
    expect(r.alDia).toBe(false);
  });

  it("un convenio con todo abonado sale al día", () => {
    const r = reporteConvenios([CONVENIO],
      [...PAGOS, { contrato_id: "ct1", fecha: "2026-08-24", created_at: "2026-08-24T10:00:00Z", estado: "Confirmado", valor: 9000, aplicado_convenio: 9000 }],
      [CONTRATO], MOTOS, CLIENTES, SUBS, "2026-08-24")[0];
    expect(r).toMatchObject({ abonado: 105000, atrasado: 0, alDia: true });
  });

  it("dice cuántos días lleva sin abonar — la señal de que nadie lo está gestionando", () => {
    expect(run("2026-09-10")[0]).toMatchObject({ ultimoAbono: "2026-08-15", diasSinAbonar: 26 });
  });

  it("un convenio SIN un solo abono se marca (nunca se gestionó)", () => {
    const r = reporteConvenios([CONVENIO], [PAGOS[0]], [CONTRATO], MOTOS, CLIENTES, SUBS, "2026-08-24")[0];
    expect(r.abonos).toHaveLength(0);
    expect(r.ultimoAbono).toBeNull();
    expect(r.diasSinAbonar).toBeNull();
  });
});

describe("de quién es cada convenio", () => {
  it("trae placa, grupo, cliente y encargado", () => {
    expect(run()[0]).toMatchObject({
      placa: "RLT87H", grupo: "COSTA", cliente: "DANIEL JOSE MILLAN GUERRA", encargado: "BRANDON ROJAS",
    });
  });

  it("solo los activos, salvo que se pidan todos", () => {
    const cumplido = { ...CONVENIO, id: "cv2", estado: "cumplido" };
    expect(reporteConvenios([CONVENIO, cumplido], PAGOS, [CONTRATO], MOTOS, CLIENTES, SUBS, "2026-08-24")).toHaveLength(1);
    expect(reporteConvenios([CONVENIO, cumplido], PAGOS, [CONTRATO], MOTOS, CLIENTES, SUBS, "2026-08-24", false)).toHaveLength(2);
  });
});

describe("totales del informe", () => {
  it("suma lo pactado, lo abonado, el saldo y cuántos van al día", () => {
    expect(totalesConvenios(run())).toMatchObject({
      cantidad: 1, pactado: 542000, abonado: 96000, saldo: 446000, atrasado: 9000, alDia: 0, sinUnSoloAbono: 0,
    });
  });
});
