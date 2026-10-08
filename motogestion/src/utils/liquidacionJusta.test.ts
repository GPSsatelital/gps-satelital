import { describe, it, expect } from "vitest";
import { ajusteSalidaLedger, abonadoDesdeLaFirma } from "./cicloPago";
import {
  cuentaLiquidacion, deudasYAcuerdos, conAbonado, diasGuardadosRodados,
  ahorroPendienteDelConvenio, ahorroDeLosAcuerdos, acuerdosEnLaLiquidacion,
} from "./cuentaLiquidacion";

// D-046 (8-oct-2026, regla del dueño): «todo lo que en realidad sea justo de él hay que dárselo,
// pero todo debe quedar bien explicado». Y: «descontémosle también los días que no la usó aunque
// no complete la semana».
//
// Caso real: BRADER GUZMAN WATSON (YAL65H), LIQ-0078, con las cifras de producción del 8-oct-2026.
// La liquidación le cobraba de más en tres cosas:
//   1. el acuerdo entero ($1.008.500) sin restar los $8.000 que abonó el 19-sep;
//   2. la semana del 1 al 8 de sep, en que la moto estuvo GUARDADA y se decidió rodar ($202.000);
//   3. el ahorro de la semana 30, que entró al acuerdo: se le cobraba el acuerdo entero y no se le
//      devolvía su parte de ahorro ($26.000).
// Antes: saldo −$447.500. Lo justo: −$237.500.

const D = (iso: string) => new Date(iso + "T12:00:00");

const BRADER = {
  forma_pago: "Semanal" as const, dia_pago: "Lunes", valor_semanal: 202000,
  tarifa_diaria: 27000, tarifa_domingo: 14000, ahorro_diario: 4000, ahorro_domingo: 2000,
  es_migrado: true, motor_v2: true,
  total_cajas: 104, cajas_pagadas: 31, cajas_previas: 24, caja_actual_pagado: 0, cajas_exoneradas: 1,
  prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-27",
  ahorro_acumulado: 152000, ahorro_apertura: 582000, ahorro_inicial: 510000, base_inicial: 510000,
};

// El acuerdo nuevo, firmado el 8-sep: deuda del Excel $791.500 + semana 30 $202.000 + lavada $15.000.
const ACUERDO_BRADER = {
  estado: "activo", deuda_total: 1008500, cuota_por_periodo: 50000, cuotas_pagadas: 0,
  concepto: "Tarifas atrasadas", created_at: "2026-09-08T22:00:40.390688+00:00",
  monto_deudas: 806500, monto_semanas: 202000, ahorro_semanas: 26000,
};

// Sus pagos confirmados. Los de agosto abonaron al acuerdo VIEJO (el que se rehízo el 8-sep):
// no cuentan para el nuevo.
const PAGOS_BRADER = [
  { aplicado_convenio: 0, created_at: "2026-07-30T19:51:22Z", fecha: "2026-07-30" },
  { aplicado_convenio: 50000, created_at: "2026-08-12T13:48:03Z", fecha: "2026-08-12" },
  { aplicado_convenio: 50000, created_at: "2026-08-21T16:11:13Z", fecha: "2026-08-19" },
  { aplicado_convenio: 48000, created_at: "2026-08-26T16:07:02Z", fecha: "2026-08-25" },
  { aplicado_convenio: 0, created_at: "2026-09-17T15:01:11Z", fecha: "2026-09-15" },
  { aplicado_convenio: 8000, created_at: "2026-09-19T17:33:06Z", fecha: "2026-09-19" },
];

const MOTO_GUARDADA = [{ decision: "rodar_al_final", fecha_entrada: "2026-09-01", fecha_salida: "2026-09-08" }];

describe("lo abonado al acuerdo cuenta desde su firma, peso por peso", () => {
  it("BRADER: al acuerdo del 8-sep abonó $8.000 (los $148.000 de agosto eran del acuerdo viejo)", () => {
    expect(abonadoDesdeLaFirma(ACUERDO_BRADER, PAGOS_BRADER)).toBe(8000);
  });

  it("antes se contaban solo cuotas COMPLETAS: sin cuota completa, el abono no restaba nada", () => {
    expect(deudasYAcuerdos([], [ACUERDO_BRADER])[0].monto).toBe(1008500);
    expect(deudasYAcuerdos([], conAbonado([ACUERDO_BRADER], PAGOS_BRADER))[0].monto).toBe(1000500);
  });
});

describe("los días en que la moto estuvo guardada y se rodó no se cobran como usados", () => {
  it("del día en que entró al día antes de salir: 1 al 7 de sep, 7 días", () => {
    const dias = diasGuardadosRodados(MOTO_GUARDADA);
    expect(dias).toEqual(["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-06", "2026-09-07"]);
  });

  it("los registros repetidos no cuentan dos veces", () => {
    expect(diasGuardadosRodados([...MOTO_GUARDADA, ...MOTO_GUARDADA])).toHaveLength(7);
  });

  it("lo que se decidió COBRAR no se descuenta: esos días el dueño decidió que sí se pagan", () => {
    expect(diasGuardadosRodados([{ decision: "cobrar_ahora", fecha_entrada: "2026-09-01", fecha_salida: "2026-09-08" }])).toEqual([]);
  });

  it("BRADER hoy (corte 26-sep) sin descontar: $388.000 = 6 días sin pagar + la semana guardada", () => {
    const r = ajusteSalidaLedger(BRADER, D("2026-09-26"));
    expect(r.porCobrar).toBe(388000);
    expect(r.ahorroPorCobrar).toBe(50000);
  });

  it("BRADER descontando la semana guardada: $186.000, solo los 6 días del 21 al 26 de sep", () => {
    const r = ajusteSalidaLedger(BRADER, D("2026-09-26"), diasGuardadosRodados(MOTO_GUARDADA));
    expect(r.porCobrar).toBe(186000);
    expect(r.ahorroPorCobrar).toBe(24000);
  });

  it("también los días SUELTOS: 3 días guardados descuentan 3 días, aunque no completen la semana", () => {
    const sinNada = ajusteSalidaLedger(BRADER, D("2026-09-26"), diasGuardadosRodados(MOTO_GUARDADA));
    const conTres = ajusteSalidaLedger(BRADER, D("2026-09-26"), [
      ...diasGuardadosRodados(MOTO_GUARDADA), "2026-09-22", "2026-09-23", "2026-09-24",
    ]);
    expect(sinNada.porCobrar - conTres.porCobrar).toBe(3 * 31000);
  });

  it("el domingo descuenta lo de un domingo ($16.000), no lo de un día de semana", () => {
    const base = ajusteSalidaLedger(BRADER, D("2026-09-26"), diasGuardadosRodados(MOTO_GUARDADA));
    const conDomingo = ajusteSalidaLedger(BRADER, D("2026-09-26"), [...diasGuardadosRodados(MOTO_GUARDADA), "2026-09-20"]);
    expect(base.porCobrar - conDomingo.porCobrar).toBe(16000);
  });

  it("un día fuera del rango (después del corte) no cambia nada", () => {
    const base = ajusteSalidaLedger(BRADER, D("2026-09-26"));
    const fuera = ajusteSalidaLedger(BRADER, D("2026-09-26"), ["2026-10-01", "2026-10-02"]);
    expect(fuera).toEqual(base);
  });

  it("el día del corte se cobra siempre, aunque la moto haya entrado a la bodega ese día (regla 9)", () => {
    const base = ajusteSalidaLedger(BRADER, D("2026-09-26"), diasGuardadosRodados(MOTO_GUARDADA));
    const conCorte = ajusteSalidaLedger(BRADER, D("2026-09-26"), [...diasGuardadosRodados(MOTO_GUARDADA), "2026-09-26"]);
    expect(conCorte).toEqual(base);
  });

  it("sin días guardados la cuenta queda IGUAL que antes", () => {
    expect(ajusteSalidaLedger(BRADER, D("2026-09-26"), [])).toEqual(ajusteSalidaLedger(BRADER, D("2026-09-26")));
  });
});

describe("si se cobra el acuerdo entero, el ahorro de sus semanas es del cliente", () => {
  it("BRADER: la semana 30 entró al acuerdo con $26.000 de ahorro; con $8.000 abonados no se ganó nada", () => {
    expect(ahorroPendienteDelConvenio(ACUERDO_BRADER, 8000)).toBe(26000);
  });

  it("el ahorro es lo último que se llena: con el acuerdo pagado casi entero ya se ganó una parte", () => {
    // tarifa del acuerdo = deudas $806.500 + semana sin ahorro $176.000 = $982.500
    expect(ahorroPendienteDelConvenio(ACUERDO_BRADER, 990000)).toBe(26000 - 7500);
    expect(ahorroPendienteDelConvenio(ACUERDO_BRADER, 1008500)).toBe(0);
  });

  it("al que termina su contrato no se le devuelve: ahí el ahorro paga la moto (D-023)", () => {
    const conAbono = conAbonado([ACUERDO_BRADER], PAGOS_BRADER);
    expect(ahorroDeLosAcuerdos(conAbono, { seVaAntes: true })).toEqual([{ concepto: "Ahorro de las semanas que entraron al acuerdo", monto: 26000 }]);
    expect(ahorroDeLosAcuerdos(conAbono, { seVaAntes: false })).toEqual([]);
  });

  it("un acuerdo viejo sin desglose (sin ahorro_semanas) no devuelve nada: no se inventa", () => {
    const viejo = { ...ACUERDO_BRADER, monto_deudas: null, monto_semanas: null, ahorro_semanas: null };
    expect(ahorroDeLosAcuerdos(conAbonado([viejo], PAGOS_BRADER), { seVaAntes: true })).toEqual([]);
  });
});

describe("el renglón del acuerdo ya escrito en la liquidación se pone al día", () => {
  const ESCRITOS = [
    { monto: 30000, concepto: "Multa por recolección/inmovilización" },
    { monto: 15000, concepto: "Lavada del vehículo al recibirlo" },
    { monto: 1008500, concepto: "Saldo pendiente de convenio" },
    { monto: 98000, concepto: "Guarda barro delantero y pintura " },
  ];

  it("LIQ-0078: $1.008.500 pasa a $1.000.500 y lo demás queda igual", () => {
    const r = acuerdosEnLaLiquidacion(ESCRITOS, conAbonado([ACUERDO_BRADER], PAGOS_BRADER), { seVaAntes: true });
    expect(r.renglones.map(x => x.monto)).toEqual([30000, 15000, 1000500, 98000]);
    expect(r.cobrados).toHaveLength(1);
  });

  it("si alguien lo cambió a mano, se respeta y no devuelve ahorro de un acuerdo que no se cobra entero", () => {
    const aMano = ESCRITOS.map(x => x.concepto === "Saldo pendiente de convenio" ? { ...x, monto: 500000 } : x);
    const r = acuerdosEnLaLiquidacion(aMano, conAbonado([ACUERDO_BRADER], PAGOS_BRADER), { seVaAntes: true });
    expect(r.renglones.find(x => x.concepto === "Saldo pendiente de convenio")!.monto).toBe(500000);
    expect(r.cobrados).toEqual([]);
  });

  it("calcular dos veces da lo mismo: la cifra ya corregida se reconoce", () => {
    const una = acuerdosEnLaLiquidacion(ESCRITOS, conAbonado([ACUERDO_BRADER], PAGOS_BRADER), { seVaAntes: true });
    const dos = acuerdosEnLaLiquidacion(una.renglones, conAbonado([ACUERDO_BRADER], PAGOS_BRADER), { seVaAntes: true });
    expect(dos.renglones).toEqual(una.renglones);
    expect(dos.cobrados).toHaveLength(1);
  });
});

describe("BRADER GUZMAN completo: la cuenta justa da −$237.500", () => {
  const cuenta = cuentaLiquidacion({
    contrato: BRADER,
    fechaCorte: "2026-09-26",
    saldoFavor: 0,
    deudas: [
      { estado: "pendiente", monto_pendiente: 30000, concepto: "multa_recoleccion", descripcion: "Multa por recolección/inmovilización" },
      { estado: "pendiente", monto_pendiente: 15000, concepto: "lavada", descripcion: "Lavada del vehículo al recibirlo" },
    ],
    convenios: [ACUERDO_BRADER],
    danos: [{ concepto: "Guardabarro y pintura", monto: 98000 }],
    motivo: "incumplimiento",
    pagos: PAGOS_BRADER,
    diasNoUsados: diasGuardadosRodados(MOTO_GUARDADA),
  });

  it("a su favor $1.092.000: base 308.000 + ahorro Excel 582.000 + ganado 152.000 + semana del acuerdo 26.000 + de los días 24.000", () => {
    expect(cuenta.aFavor.total).toBe(1092000);
  });

  it("debe $1.329.500: días 186.000 + acuerdo 1.000.500 + multa 30.000 + lavada 15.000 + daño 98.000", () => {
    expect(cuenta.enContra.total).toBe(1329500);
  });

  it("saldo final −$237.500 (antes −$447.500: $210.000 cobrados de más)", () => {
    expect(cuenta.saldoFinal).toBe(-237500);
  });
});
