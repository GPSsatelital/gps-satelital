import { describe, it, expect } from "vitest";

// LAS DOS PUERTAS DEL MISMO CONVENIO DEBEN DAR LO MISMO (25-ago-2026, caso IGC46I).
//
// El dueño lo cazó en producción: "las cuentas que hace por el lado de Inmovilizaciones a veces
// no coinciden con el que sale por Cartera... en Inmovilizaciones cobraba como dos veces la
// misma semana y aparecía en la casilla 0 y el otro de Cartera en la casilla en 2".
//
// La causa: Inmovilizaciones metía las cuotas atrasadas DENTRO de la meta y el selector de
// semanas arrancaba en 0; Cartera mandaba solo las deudas y el selector se auto-marcaba en las
// vencidas. Mismo total si nadie tocaba nada — pero el 0 era una trampa: subirlo cobraba las
// semanas dos veces. Estas pruebas fijan el contrato de las dos puertas.

/** Lo que cada puerta le entrega al modal. Espejo de lo que hacen las pantallas. */
type Entrada = { metaFija?: number; metaTraeSemanas?: boolean };

/** La regla del modal: ¿el selector arranca marcado en las semanas vencidas? */
function autoMarcaSemanas(e: Entrada): boolean {
  const metaTrae = e.metaTraeSemanas ?? (e.metaFija != null);
  return !metaTrae;
}
/** El total que sale del convenio: la meta más lo que sume el selector. */
function totalConvenio(e: Entrada, deudasBD: number, semanas: number, valorSemana: number): number {
  const meta = e.metaFija ?? deudasBD;
  const n = autoMarcaSemanas(e) ? semanas : 0;
  return meta + n * valorSemana;
}

// El caso real: 2 semanas atrasadas de $202.000 y $104.000 de deudas viejas (sin la multa).
const DEUDAS = 104000, SEMANAS = 2, VALOR = 202000;
const ESPERADO = DEUDAS + SEMANAS * VALOR;   // $508.000

const CARTERA: Entrada = {};                                        // sin metaFija
const INMOVILIZACIONES: Entrada = { metaFija: DEUDAS, metaTraeSemanas: false };

describe("las dos puertas se ven y suman IGUAL", () => {
  it("las dos auto-marcan las semanas vencidas (ninguna muestra 0 con las semanas escondidas)", () => {
    expect(autoMarcaSemanas(CARTERA)).toBe(true);
    expect(autoMarcaSemanas(INMOVILIZACIONES)).toBe(true);
  });

  it("las dos dan el mismo total", () => {
    expect(totalConvenio(CARTERA, DEUDAS, SEMANAS, VALOR)).toBe(ESPERADO);
    expect(totalConvenio(INMOVILIZACIONES, DEUDAS, SEMANAS, VALOR)).toBe(ESPERADO);
  });

  it("🔴 EL DEFECTO: con la meta trayendo las semanas adentro, subir el selector las cobra DOS veces", () => {
    const viejo: Entrada = { metaFija: DEUDAS + SEMANAS * VALOR };   // como estaba antes
    expect(autoMarcaSemanas(viejo)).toBe(false);                     // el selector mostraba 0
    // Si el funcionario lo sube a 2 creyendo que faltaban:
    expect(viejo.metaFija! + SEMANAS * VALOR).toBe(ESPERADO + SEMANAS * VALOR);   // $910.000
  });
});

describe("el wizard (base inicial) conserva su comportamiento", () => {
  // Su meta es la base que falta, no cuotas atrasadas; el contrato nace sin semanas vencidas.
  const WIZARD: Entrada = { metaFija: 308000 };
  it("sin decir nada, sigue con el criterio viejo: no auto-marca", () => {
    expect(autoMarcaSemanas(WIZARD)).toBe(false);
    expect(totalConvenio(WIZARD, 0, 0, VALOR)).toBe(308000);
  });
});
