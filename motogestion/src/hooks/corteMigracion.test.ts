import { describe, it, expect, vi, afterEach } from "vitest";
import { corteMigracionGrupo, corteMigracionContrato, diasDesdeUltimoPago } from "./useContratos";

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
