import { describe, it, expect, vi, afterEach } from "vitest";
import { corteMigracionGrupo, corteMigracionContrato, diasDesdeUltimoPago } from "./useContratos";
import { moverAlDiaDeLaSemana, diaPagoPorConfirmar, puedeMoverArranqueCajas } from "../utils/cicloPago";

// El defecto que estas pruebas cazan (29-ago-2026, caso VICTOR / ZHO35G):
// el corte de migración se guardaba POR GRUPO, pero un grupo puede tener VARIAS tandas migradas
// en fechas distintas. RASTREADOR tiene dos: 28 el 6-jul y 7 el 29-ago. A VICTOR, sembrado ese
// día y sin pagos aún, el sistema le contaba desde el 6-jul → "54 días sin pagar" → Paso 4
// Recolección física, cuando apenas le tocaba pagar HOY. Es el mismo defecto que sufrió COSTA.

const hoy = new Date("2026-08-29T12:00:00");
afterEach(() => vi.useRealTimers());
const congelarHoy = () => { vi.useFakeTimers(); vi.setSystemTime(hoy); };

describe("corteMigracionContrato — el corte es del CONTRATO, no del grupo", () => {
  it("un migrado usa SU arranque de cajas, no el de su grupo", () => {
    // VICTOR: sembrado el 29-ago dentro de RASTREADOR (cuyo corte de grupo es el 6-jul).
    const victor = { es_migrado: true, fecha_inicio_cajas: "2026-08-29" };
    expect(corteMigracionContrato(victor, "RASTREADOR")).toBe("2026-08-29");
    expect(corteMigracionGrupo("RASTREADOR")).toBe("2026-07-06"); // el del grupo NO se movió
  });

  it("los 28 RASTREADOR viejos no cambian: su arranque salió del corte de su grupo", () => {
    const viejo = { es_migrado: true, fecha_inicio_cajas: "2026-07-06" };
    expect(corteMigracionContrato(viejo, "RASTREADOR")).toBe(corteMigracionGrupo("RASTREADOR"));
  });

  it("un contrato NO migrado (del wizard) sigue con el corte de su grupo", () => {
    const nuevo = { es_migrado: false, fecha_inicio_cajas: "2026-09-02" };
    expect(corteMigracionContrato(nuevo, "PRADERA")).toBe("2026-07-01");
  });

  it("un migrado sin arranque de cajas cae al corte de su grupo", () => {
    const sinMotor = { es_migrado: true, fecha_inicio_cajas: null };
    expect(corteMigracionContrato(sinMotor, "COSTA")).toBe("2026-07-27");
  });

  it("sin grupo conocido usa el corte por defecto", () => {
    expect(corteMigracionContrato({ es_migrado: false, fecha_inicio_cajas: null }, null)).toBe("2026-07-01");
  });
});

describe("diasDesdeUltimoPago — el defecto de VICTOR, con cifras reales", () => {
  it("VICTOR: con el corte del GRUPO decía 54 días (Recolección); con el suyo, 0", () => {
    congelarHoy();
    const entrega = "2025-03-22";
    // Como era antes: heredaba el 6-jul de los 28 viejos.
    expect(diasDesdeUltimoPago(null, entrega, corteMigracionGrupo("RASTREADOR"))).toBe(54);
    // Como quedó: su propio arranque es HOY, así que apenas le toca pagar.
    const victor = { es_migrado: true, fecha_inicio_cajas: "2026-08-29" };
    expect(diasDesdeUltimoPago(null, entrega, corteMigracionContrato(victor, "RASTREADOR"))).toBe(0);
  });

  it("nunca devuelve negativo: los 6 migrados el 29-ago arrancan la semana siguiente", () => {
    congelarHoy();
    // JAIRO y RAMON arrancan el 5-sep: su corte cae en el FUTURO.
    const jairo = { es_migrado: true, fecha_inicio_cajas: "2026-09-05" };
    const d = diasDesdeUltimoPago(null, "2025-07-12", corteMigracionContrato(jairo, "RASTREADOR"));
    expect(d).toBe(0);           // no "-7d sin pagar"
    expect(d).toBeGreaterThanOrEqual(0);
  });

  it("un pago real siempre manda sobre el corte", () => {
    congelarHoy();
    const victor = { es_migrado: true, fecha_inicio_cajas: "2026-08-29" };
    expect(diasDesdeUltimoPago("2026-08-25", "2025-03-22", corteMigracionContrato(victor, "RASTREADOR"))).toBe(4);
  });

  it("una entrega POSTERIOR al corte manda sobre el corte (contrato nuevo)", () => {
    congelarHoy();
    expect(diasDesdeUltimoPago(null, "2026-08-27", corteMigracionGrupo("PRADERA"))).toBe(2);
  });

  it("sin pagos y sin entrega no se puede saber", () => {
    expect(diasDesdeUltimoPago(null, null, "2026-07-01")).toBeNull();
  });
});

// ── Cambiar el día de pago DEBE mover el arranque de cajas ──────────────────────────────────
// El motor cuenta cada 7 días desde `fecha_inicio_cajas` y no mira el texto `dia_pago`. Cambiar
// el día sin mover el arranque dejaba la ficha diciendo "paga lunes" y el motor exigiendo sábados.
describe("moverAlDiaDeLaSemana — corregir el día no puede descuadrar el motor", () => {
  it("VICTOR: sábado 29-ago pasado a lunes cae en el 24-ago, su MISMA semana", () => {
    expect(moverAlDiaDeLaSemana("2026-08-29", "Lunes")).toBe("2026-08-24");
  });

  it("no se corre de semana: jueves 3-sep a lunes da el 31-ago, no el 7-sep", () => {
    expect(moverAlDiaDeLaSemana("2026-09-03", "Lunes")).toBe("2026-08-31");
  });

  it("hacia adelante dentro de la semana: lunes 24-ago a sábado da el 29-ago", () => {
    expect(moverAlDiaDeLaSemana("2026-08-24", "Sábado")).toBe("2026-08-29");
  });

  it("el domingo cierra la semana, no la abre: lunes 24-ago a domingo da el 30-ago", () => {
    expect(moverAlDiaDeLaSemana("2026-08-24", "Domingo")).toBe("2026-08-30");
  });

  it("acepta el día escrito sin tilde", () => {
    expect(moverAlDiaDeLaSemana("2026-08-24", "Sabado")).toBe("2026-08-29");
    expect(moverAlDiaDeLaSemana("2026-08-29", "Miercoles")).toBe("2026-08-26");
  });

  it("mismo día = no se mueve", () => {
    expect(moverAlDiaDeLaSemana("2026-08-24", "Lunes")).toBe("2026-08-24");
  });

  it("un día que no existe deja la fecha intacta (nunca inventa un arranque)", () => {
    expect(moverAlDiaDeLaSemana("2026-08-24", "Quincenal")).toBe("2026-08-24");
  });
});

describe("diaPagoPorConfirmar — a cuáles hay que validarles el día", () => {
  const base = { forma_pago: "Semanal" as const, valor_semanal: 195000, dias_pago_mes: null };
  it("lunes y miércoles son los normales: no avisa", () => {
    expect(diaPagoPorConfirmar({ ...base, dia_pago: "Lunes" })).toBe(false);
    expect(diaPagoPorConfirmar({ ...base, dia_pago: "Miércoles" })).toBe(false);
    expect(diaPagoPorConfirmar({ ...base, dia_pago: "Miercoles" })).toBe(false);
  });
  it("sábado, jueves y viernes hay que confirmarlos", () => {
    expect(diaPagoPorConfirmar({ ...base, dia_pago: "Sábado" })).toBe(true);
    expect(diaPagoPorConfirmar({ ...base, dia_pago: "Jueves" })).toBe(true);
    expect(diaPagoPorConfirmar({ ...base, dia_pago: "Viernes" })).toBe(true);
  });
  it("los diarios y los de fecha del mes no aplican", () => {
    expect(diaPagoPorConfirmar({ ...base, forma_pago: "Diario", dia_pago: "Diario" })).toBe(false);
    expect(diaPagoPorConfirmar({ ...base, forma_pago: "Quincenal", dia_pago: "Quincenal", dias_pago_mes: [5, 20] })).toBe(false);
  });
});

// ── 🔴 EL CANDADO: a los que ya están cobrando NO se les mueve el arranque ──────────────────
// Pedido del dueño (29-ago): "no vaya a ser que por algún motivo cambien el día de pago —cosa que
// no debería pasar, pero por si pasa— y se vaya a rodar también el cuándo inició la caja. Esto
// solo aplicaría para estos 7". Mover el arranque de un contrato que lleva meses le correría
// TODAS sus cajas futuras. La ventana permitida: semana en curso o la siguiente.
describe("puedeMoverArranqueCajas — protege a los ~370 que ya vienen cobrando", () => {
  const hoy = new Date("2026-08-29T12:00:00"); // sábado, semana del 24-ago

  it("los 7 recién migrados SÍ se pueden corregir", () => {
    expect(puedeMoverArranqueCajas("2026-08-29", hoy)).toBe(true); // VICTOR, esta semana
    expect(puedeMoverArranqueCajas("2026-08-24", hoy)).toBe(true); // lunes de esta semana
    expect(puedeMoverArranqueCajas("2026-08-31", hoy)).toBe(true); // JHON y CESAR
    expect(puedeMoverArranqueCajas("2026-09-03", hoy)).toBe(true); // JORGE
    expect(puedeMoverArranqueCajas("2026-09-05", hoy)).toBe(true); // JAIRO y RAMON
  });

  it("los que YA venían cobrando quedan sellados", () => {
    expect(puedeMoverArranqueCajas("2026-07-06", hoy)).toBe(false); // 28 RASTREADOR viejos
    expect(puedeMoverArranqueCajas("2026-07-27", hoy)).toBe(false); // los 180 de COSTA
    expect(puedeMoverArranqueCajas("2026-07-01", hoy)).toBe(false); // PRADERA
    expect(puedeMoverArranqueCajas("2026-08-23", hoy)).toBe(false); // el domingo ANTERIOR: fuera
  });

  it("tampoco se puede mover algo que arranca más allá de la semana que entra", () => {
    expect(puedeMoverArranqueCajas("2026-09-06", hoy)).toBe(true);  // domingo de la siguiente: último día
    expect(puedeMoverArranqueCajas("2026-09-07", hoy)).toBe(false); // ya es la subsiguiente
    expect(puedeMoverArranqueCajas("2026-12-01", hoy)).toBe(false);
  });

  it("sin arranque de cajas no hay nada que mover", () => {
    expect(puedeMoverArranqueCajas(null, hoy)).toBe(false);
    expect(puedeMoverArranqueCajas(undefined, hoy)).toBe(false);
  });

  it("la ventana se mueve con el calendario: pasado el plazo, los 7 también quedan sellados", () => {
    const dosSemanasDespues = new Date("2026-09-12T12:00:00"); // sábado, semana del 7-sep
    expect(puedeMoverArranqueCajas("2026-08-29", dosSemanasDespues)).toBe(false); // VICTOR, ya sellado
    expect(puedeMoverArranqueCajas("2026-09-05", dosSemanasDespues)).toBe(false); // JAIRO y RAMON, sellados
    // Lo único abierto para entonces sería algo que arranque en esas dos semanas.
    expect(puedeMoverArranqueCajas("2026-09-14", dosSemanasDespues)).toBe(true);
  });

  it("un lunes también cuenta su propia semana como la actual", () => {
    const lunes = new Date("2026-08-31T09:00:00");
    expect(puedeMoverArranqueCajas("2026-08-31", lunes)).toBe(true);
    expect(puedeMoverArranqueCajas("2026-08-30", lunes)).toBe(false); // domingo anterior: fuera
  });
});
