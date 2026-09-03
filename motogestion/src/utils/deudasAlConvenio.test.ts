import { describe, it, expect } from "vitest";
import { ordenarComoElMotor, alternarHasta, sumaPrefijo, loQueMarcariaElMotor } from "./deudasAlConvenio";

// La pantalla de "agregar deuda al convenio" tiene que mostrar EXACTAMENTE lo que el motor va a
// marcar. Estas pruebas fijan esa correspondencia: si alguien cambia el orden del disparador
// (mig 098/124) sin cambiar esto, aquí se rompe.

const d = (id: string, monto: number, dia: string) => ({ id, monto_pendiente: monto, created_at: `2026-08-${dia}T10:00:00Z` });

// Caso tipo: una deuda vieja del arqueo, una multa de recolección y una lavada.
const vieja = d("vieja", 152_000, "01");
const multa = d("multa", 30_000, "15");
const lavada = d("lavada", 15_000, "28");
const sueltas = [lavada, vieja, multa];   // llegan desordenadas, como de la base

describe("el orden es el del motor: de la más vieja a la más nueva", () => {
  it("ordena por fecha, no por monto ni por como vinieron", () => {
    expect(ordenarComoElMotor(sueltas).map(x => x.id)).toEqual(["vieja", "multa", "lavada"]);
  });

  it("con fechas iguales el desempate es estable", () => {
    const a = d("a", 10, "05"), b = d("b", 10, "05");
    expect(ordenarComoElMotor([b, a]).map(x => x.id)).toEqual(["a", "b"]);
  });
});

describe("las casillas seleccionan un prefijo — nunca deudas sueltas", () => {
  it("marcar la 3ª incluye las dos anteriores", () => {
    expect(alternarHasta(0, 2)).toBe(3);
  });

  it("desmarcar la 2ª deja solo la 1ª y saca las de después", () => {
    expect(alternarHasta(3, 1)).toBe(1);
  });

  it("desmarcar la 1ª deja el convenio sin deudas", () => {
    expect(alternarHasta(2, 0)).toBe(0);
  });

  it("volver a marcar la última las incluye todas", () => {
    expect(alternarHasta(1, 2)).toBe(3);
  });
});

describe("el total que se le agrega al convenio", () => {
  const orden = ordenarComoElMotor(sueltas);

  it("ninguna seleccionada suma cero", () => {
    expect(sumaPrefijo(orden, 0)).toBe(0);
  });

  it("solo la vieja", () => {
    expect(sumaPrefijo(orden, 1)).toBe(152_000);
  });

  it("todas", () => {
    expect(sumaPrefijo(orden, 3)).toBe(197_000);
  });

  it("pedir más de las que hay no revienta", () => {
    expect(sumaPrefijo(orden, 99)).toBe(197_000);
  });
});

describe("lo que el motor marcaría con un monto escrito a mano", () => {
  it("con el total exacto se lleva todas", () => {
    expect(loQueMarcariaElMotor(sueltas, 197_000).map(x => x.id)).toEqual(["vieja", "multa", "lavada"]);
  });

  it("🔴 el caso que motivó las casillas: escribe $30.000 pensando en la multa y el motor NO la toca", () => {
    // La más vieja ($152.000) no cabe, así que se salta; la multa sí cabe. Aquí coincide de
    // milagro. El de abajo es el que duele.
    expect(loQueMarcariaElMotor(sueltas, 30_000).map(x => x.id)).toEqual(["multa"]);
  });

  it("🔴 escribe $15.000 por la lavada y el motor se lleva la lavada, no otra cosa", () => {
    expect(loQueMarcariaElMotor(sueltas, 15_000).map(x => x.id)).toEqual(["lavada"]);
  });

  it("🔴 escribe $45.000 (multa + lavada) y se lleva las dos, saltándose la vieja que no cabe", () => {
    expect(loQueMarcariaElMotor(sueltas, 45_000).map(x => x.id)).toEqual(["multa", "lavada"]);
  });

  it("un monto que no calza con ninguna no marca nada — la plata entra al convenio y ninguna deuda se tacha", () => {
    expect(loQueMarcariaElMotor(sueltas, 5_000)).toEqual([]);
  });

  it("un monto mayor al total no inventa deudas", () => {
    expect(loQueMarcariaElMotor(sueltas, 999_000).map(x => x.id)).toEqual(["vieja", "multa", "lavada"]);
  });

  it("una deuda ya saldada no entra", () => {
    expect(loQueMarcariaElMotor([d("cero", 0, "02"), multa], 30_000).map(x => x.id)).toEqual(["multa"]);
  });
});

describe("la pantalla y el motor dicen lo mismo", () => {
  it("el prefijo elegido es exactamente lo que el motor marca con ese total", () => {
    const orden = ordenarComoElMotor(sueltas);
    for (let n = 0; n <= orden.length; n++) {
      const total = sumaPrefijo(orden, n);
      const delMotor = loQueMarcariaElMotor(sueltas, total).map(x => x.id);
      expect(delMotor).toEqual(orden.slice(0, n).map(x => x.id));
    }
  });
});
