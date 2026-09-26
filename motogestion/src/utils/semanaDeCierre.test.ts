import { describe, it, expect } from "vitest";
import { semanaDeCierre, loQueDebe, calcularEstadoCartera, diasEnMora, type ContratoCiclo } from "./cicloPago";

// D-026 (regla del dueño, 25-sep-2026): quien llena su última semana y todavía debe, sigue pagando
// su semana normal hasta quedar en $0, y esas semanas se cobran como cualquier otra.
//
// YESID BARRAZA (RLT72H), producción del 25-sep: semana $235.000, 65 semanas (51 previas, ledger
// desde el lunes 27-jul). Acuerdo "tarifas atrasadas" firmado el 19-ago: $556.000, lleva $300.000.
// Su semana 66 del calendario —la primera de más— sería el lunes 2 de noviembre.
const YESID: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 235000,
  motor_v2: true, es_migrado: true,
  total_cajas: 65, cajas_pagadas: 65, cajas_previas: 51, caja_actual_pagado: 0,
  prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-27",
  tarifa_diaria: 26000, tarifa_domingo: 13000, ahorro_diario: 10000, ahorro_domingo: 6000,
};
const ACUERDO = { deuda_total: 556000, created_at: "2026-08-19T15:00:00Z" };
const ABONOS_ACUERDO = [{ fecha: "2026-09-08", aplicado_convenio: 300000, created_at: "2026-09-08T15:00:00Z" }];
const dia = (iso: string) => new Date(iso + "T12:00:00");

describe("¿está en semanas de más?", () => {
  it("con semanas por pagar, no: el cobro normal sigue igual", () => {
    expect(semanaDeCierre({ ...YESID, cajas_pagadas: 60 }, ABONOS_ACUERDO, [], ACUERDO, dia("2026-11-10"))).toBeNull();
  });

  it("si terminó y no debe nada, no: queda listo para liquidar por cumplimiento", () => {
    const pagado = [{ fecha: "2026-10-26", aplicado_convenio: 556000, created_at: "2026-10-26T15:00:00Z" }];
    expect(semanaDeCierre(YESID, pagado, [], ACUERDO, dia("2026-11-10"))).toBeNull();
  });

  it("un contrato sin motor de cajas o Diario, nunca", () => {
    expect(semanaDeCierre({ ...YESID, motor_v2: false }, ABONOS_ACUERDO, [], ACUERDO, dia("2026-11-10"))).toBeNull();
    expect(semanaDeCierre({ ...YESID, forma_pago: "Diario" }, ABONOS_ACUERDO, [], ACUERDO, dia("2026-11-10"))).toBeNull();
  });
});

describe("YESID: termina debiendo $256.000 de su acuerdo → 2 semanas de más a $235.000", () => {
  it("antes del 2-nov todavía no arranca: nada vencido, y dice cuándo empieza", () => {
    const c = semanaDeCierre(YESID, ABONOS_ACUERDO, [], ACUERDO, dia("2026-10-30"))!;
    expect(c.debeTotal).toBe(256000);
    expect(c.semana).toBe(0);
    expect(c.semanas).toBe(2);
    expect(c.falta).toBe(0);
    expect(c.proximaFecha).toBe("2026-11-02");
  });

  it("el 2-nov le toca su semana normal: $235.000, vence hoy (0 días)", () => {
    const c = semanaDeCierre(YESID, ABONOS_ACUERDO, [], ACUERDO, dia("2026-11-02"))!;
    expect(c.semana).toBe(1);
    expect(c.falta).toBe(235000);
    expect(c.fechaVencida).toBe("2026-11-02");
    expect(c.diasVencida).toBe(0);
  });

  it("si no paga, los días corren igual que en una semana normal: gabela el 3, mora después", () => {
    expect(semanaDeCierre(YESID, ABONOS_ACUERDO, [], ACUERDO, dia("2026-11-03"))!.diasVencida).toBe(1);
    expect(semanaDeCierre(YESID, ABONOS_ACUERDO, [], ACUERDO, dia("2026-11-06"))!.diasVencida).toBe(4);
  });

  it("paga sus $235.000 el 2-nov → al día; la segunda semana solo le pide lo que falta, $21.000", () => {
    const pagos = [...ABONOS_ACUERDO, { fecha: "2026-11-02", aplicado_convenio: 235000, created_at: "2026-11-02T15:00:00Z" }];
    const alDia = semanaDeCierre(YESID, pagos, [], ACUERDO, dia("2026-11-04"))!;
    expect(alDia.falta).toBe(0);
    expect(alDia.debeTotal).toBe(21000);
    expect(alDia.proximaFecha).toBe("2026-11-09");
    const segunda = semanaDeCierre(YESID, pagos, [], ACUERDO, dia("2026-11-09"))!;
    expect(segunda.semana).toBe(2);
    expect(segunda.semanas).toBe(2);
    expect(segunda.falta).toBe(21000);
    expect(segunda.fechaVencida).toBe("2026-11-09");
  });

  it("nunca se le pide más de lo que debe, aunque pasen muchas semanas sin pagar", () => {
    const c = semanaDeCierre(YESID, ABONOS_ACUERDO, [], ACUERDO, dia("2026-12-28"))!;
    expect(c.falta).toBe(256000);
    expect(c.fechaVencida).toBe("2026-11-02");   // la más vieja sin cubrir: la primera
  });
});

describe("LUIS FERNANDO SOLANO: termina debiendo $1.455.200 en deudas sueltas → 8 semanas a $195.000", () => {
  // Contrato de 104 semanas a $195.000; las deudas son de antes de terminar.
  const LUIS: ContratoCiclo = { ...YESID, valor_semanal: 195000, total_cajas: 104, cajas_pagadas: 104, cajas_previas: 0, fecha_inicio_cajas: "2024-11-04" };
  const DEUDAS = [{ monto_pendiente: 1455200, created_at: "2026-07-20T15:00:00Z" }];

  it("son 8 semanas, y la primera le pide su semana normal", () => {
    const inicio = "2026-11-02";   // 2024-11-04 + 104 semanas
    const c = semanaDeCierre(LUIS, [], DEUDAS, null, dia(inicio))!;
    expect(c.semanas).toBe(8);
    expect(c.falta).toBe(195000);
    expect(c.debeDeudas).toBe(1455200);
    expect(c.debeAcuerdo).toBe(0);
  });
});

describe("la deuda que aparece DESPUÉS de terminar limpio", () => {
  it("las semanas de más arrancan desde esa deuda, no desde que terminó: no amanece con meses de mora", () => {
    const pagado = [{ fecha: "2026-10-26", aplicado_convenio: 556000, created_at: "2026-10-26T15:00:00Z" }];
    // Terminó en $0 y el jueves 10-dic le cae una multa de $30.000.
    const multa = [{ monto_pendiente: 30000, created_at: "2026-12-10T15:00:00Z" }];
    const c = semanaDeCierre(YESID, pagado, multa, ACUERDO, dia("2026-12-16"))!;
    expect(c.semana).toBe(1);
    expect(c.fechaVencida).toBe("2026-12-14");  // el primer lunes desde la multa
    expect(c.diasVencida).toBe(2);
    expect(c.falta).toBe(30000);
  });
});

describe("si la moto ya es de otro, las semanas de más tampoco siguen corriendo", () => {
  it("se congelan en la fecha de fin del cobro", () => {
    const c = semanaDeCierre({ ...YESID, fecha_fin_cobro: "2026-11-04" }, ABONOS_ACUERDO, [], ACUERDO, dia("2026-12-28"))!;
    expect(c.semana).toBe(1);
    expect(c.diasVencida).toBe(2);
  });
});

describe("conectado: lo que ve el cobrador, el estado y los días de mora", () => {
  const pagos = ABONOS_ACUERDO.map(p => ({ ...p, valor: p.aplicado_convenio }));

  it("el número grande es la semana de más ($235.000) y el total va aparte: no se cuenta dos veces", () => {
    const d = loQueDebe(YESID, pagos, [], { ...ACUERDO, cuota_por_periodo: 60000 }, dia("2026-11-02"));
    expect(d.totalFalta).toBe(235000);
    expect(d.cuota.falta).toBe(235000);
    expect(d.acuerdo).toBeNull();
    expect(d.deudas.falta).toBe(0);
    expect(d.cierre?.debeTotal).toBe(256000);
    expect(d.cierre?.semanas).toBe(2);
  });

  it("vence hoy = al día · al otro día = gabela · después = mora, como cualquier semana", () => {
    const conv = { ...ACUERDO, cuota_por_periodo: 60000 };
    expect(calcularEstadoCartera(YESID, pagos, dia("2026-11-02"), 60000, false, conv, [])).toBe("al-dia");
    expect(calcularEstadoCartera(YESID, pagos, dia("2026-11-03"), 60000, false, conv, [])).toBe("gabela");
    expect(calcularEstadoCartera(YESID, pagos, dia("2026-11-06"), 60000, false, conv, [])).toBe("mora");
  });

  it("los días de mora cuentan desde la semana de más sin cubrir, menos la gabela (recolección a los +3)", () => {
    const conv = { ...ACUERDO, cuota_por_periodo: 60000 };
    expect(diasEnMora(YESID, pagos, dia("2026-11-06"), 60000, false, conv, [])).toBe(3);
    expect(diasEnMora(YESID, pagos, dia("2026-11-07"), 60000, false, conv, [])).toBe(4);
  });

  it("LUIS (solo deudas sueltas): la mora corre solo si le pasan las deudas — por eso todos los puntos las pasan", () => {
    const LUIS: ContratoCiclo = { ...YESID, valor_semanal: 195000, total_cajas: 104, cajas_pagadas: 104, cajas_previas: 0, fecha_inicio_cajas: "2024-11-04" };
    const deudas = [{ monto_pendiente: 1455200, created_at: "2026-07-20T15:00:00Z" }];
    expect(calcularEstadoCartera(LUIS, [], dia("2026-11-06"), 0, false, null, deudas)).toBe("mora");
    expect(diasEnMora(LUIS, [], dia("2026-11-06"), 0, false, null, deudas)).toBe(3);
  });

  it("a quien todavía tiene semanas por pagar no le cambia nada", () => {
    const antes = { ...YESID, cajas_pagadas: 60 };
    const d = loQueDebe(antes, pagos, [], { ...ACUERDO, cuota_por_periodo: 60000 }, dia("2026-09-28"));
    expect(d.cierre).toBeNull();
  });
});

describe("CESAR y RAMON: migrados con MÁS semanas previas que su total (en pausa por el dueño, 21-sep)", () => {
  it("no entran a semanas de más: primero hay que rodarles el tiempo, y no se sabe desde cuándo contar", () => {
    const RAMON: ContratoCiclo = { ...YESID, valor_semanal: 195000, total_cajas: 104, cajas_pagadas: 112, cajas_previas: 112, fecha_inicio_cajas: "2026-09-05" };
    const deuda = [{ monto_pendiente: 1509000, created_at: "2026-08-29T18:10:36Z" }];
    expect(semanaDeCierre(RAMON, [], deuda, null, dia("2026-09-26"))).toBeNull();
  });
});
