import { describe, it, expect } from "vitest";
import { cuotaConvenioDelPeriodo, primeraCuotaConvenio, ultimaCuotaConvenio, type ContratoCiclo } from "./cicloPago";

// LA PRIMERA CUOTA DEL ACUERDO SE GUARDA AL FIRMAR (decisión del dueño, 27-oct-2026): "cuando se
// firma el acuerdo, ¿no se dice ahí mismo cuándo le toca cancelar? Debe ser igual a eso". Lo que se
// le dice al cliente, lo que queda guardado y lo que se cobra son la MISMA fecha.

const d = (iso: string) => new Date(iso + "T12:00:00");

// Paga los lunes, sin prorrateo (migrado).
const LUNES: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
  motor_v2: true, es_migrado: true, prorrateo_total: 0, fecha_inicio_cajas: "2026-07-27",
};

describe("con la primera cuota guardada, se cobra desde esa fecha y nada más", () => {
  const cv = { cuota_por_periodo: 30000, created_at: "2026-08-10T15:00:00Z", fecha_primera_cuota: "2026-08-17" };

  it("la semana de la firma no cobra cuota; desde la primera cuota, sí", () => {
    expect(cuotaConvenioDelPeriodo(cv, LUNES, d("2026-08-10"))).toBe(0);
    expect(cuotaConvenioDelPeriodo(cv, LUNES, d("2026-08-17"))).toBe(30000);
    expect(cuotaConvenioDelPeriodo(cv, LUNES, d("2026-08-24"))).toBe(30000);
  });

  it("si el funcionario la corrió a otra fecha acordada, manda la guardada", () => {
    const corrida = { ...cv, fecha_primera_cuota: "2026-08-31" };
    expect(cuotaConvenioDelPeriodo(corrida, LUNES, d("2026-08-24"))).toBe(0);
    expect(cuotaConvenioDelPeriodo(corrida, LUNES, d("2026-08-31"))).toBe(30000);
  });
});

describe("sin fecha guardada (acuerdos viejos): la firma en día de pago cobra desde el siguiente", () => {
  it("firmado el mismo lunes de pago: ese lunes NO cobra cuota, el siguiente sí (lo que dice la pantalla)", () => {
    const cv = { cuota_por_periodo: 30000, created_at: "2026-08-10T15:00:00Z" };
    expect(cuotaConvenioDelPeriodo(cv, LUNES, d("2026-08-10"))).toBe(0);
    expect(cuotaConvenioDelPeriodo(cv, LUNES, d("2026-08-17"))).toBe(30000);
  });

  it("firmado un jueves: cobra desde el lunes siguiente, como siempre", () => {
    const cv = { cuota_por_periodo: 30000, created_at: "2026-08-13T15:00:00Z" };
    expect(cuotaConvenioDelPeriodo(cv, LUNES, d("2026-08-10"))).toBe(0);
    expect(cuotaConvenioDelPeriodo(cv, LUNES, d("2026-08-17"))).toBe(30000);
  });
});

describe("la fecha que la ventana del acuerdo PROPONE", () => {
  it("firmado en día de pago: el día de pago siguiente", () => {
    expect(primeraCuotaConvenio(LUNES, d("2026-08-10"), null)).toBe("2026-08-17");
  });

  it("firmado un jueves: el lunes siguiente", () => {
    expect(primeraCuotaConvenio(LUNES, d("2026-08-13"), null)).toBe("2026-08-17");
  });

  it("caso DQL76I: firmado el día de la entrega, salta la semana del prorrateo", () => {
    // Entrega jueves 24-sep, primer día de pago (prorrateo) lunes 28-sep: el acuerdo arranca el 5-oct.
    const EVER: ContratoCiclo = {
      forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000, motor_v2: true, es_migrado: false,
      prorrateo_total: 109000, fecha_entrega: "2026-09-24", fecha_inicio_cajas: "2026-09-28",
    };
    expect(primeraCuotaConvenio(EVER, d("2026-09-24"), null)).toBe("2026-10-05");
  });

  it("si el acuerdo cubre semanas, la primera cuota es el primer día no cubierto", () => {
    expect(primeraCuotaConvenio(LUNES, d("2026-08-13"), "2026-08-24")).toBe("2026-08-24");
  });
});

describe("la última cuota (fecha límite) se cuenta desde la primera", () => {
  it("11 cuotas desde el 5-oct terminan el 14-dic (DQL76I, hoy guardado 7-dic)", () => {
    const EVER: ContratoCiclo = { forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000 };
    expect(ultimaCuotaConvenio(EVER, "2026-10-05", 11)).toBe("2026-12-14");
  });

  it("una sola cuota: la última es la primera", () => {
    expect(ultimaCuotaConvenio(LUNES, "2026-08-17", 1)).toBe("2026-08-17");
  });
});
