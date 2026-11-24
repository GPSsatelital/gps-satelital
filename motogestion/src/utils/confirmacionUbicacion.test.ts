import { describe, it, expect } from "vitest";
import { pasoDe, tareaDe, cuentaDelMenu, diasEsperando, textoPedirConfirmacion, type ConfirmacionUbicacion } from "./confirmacionUbicacion";

// D-094 y D-095: quién hace qué en «📍 Confirmar ubicación».
const SUPERVISOR = "sup-1";
const AUXILIAR = "aux-1";
const JEFE = "jefe-1";

const fila = (over: Partial<ConfirmacionUbicacion> = {}): ConfirmacionUbicacion => ({
  contrato_id: "c1", cliente: "Cliente Prueba", placa: "ABC12D", grupo: "COSTA",
  visitador_id: SUPERVISOR, visitador: "Supervisor Prueba",
  visita_fecha: "2026-11-17", fecha_entrega: "2026-11-20",
  resultado: null, validada_fecha: null, confirmada_en: null, sitio: null,
  declaro_casa: "Sí", donde_declarado: null, casa: null,
  ...over,
});

// La visita del auxiliar en una moto del supervisor.
const delAuxiliar = (over: Partial<ConfirmacionUbicacion> = {}) => fila({
  visitador_id: AUXILIAR, visitador: "Auxiliar Prueba",
  lo_confirma_supervisor: true, confirma_id: SUPERVISOR, confirma: "Supervisor Prueba", ...over,
});

describe("lo de siempre (D-094) no cambia: el que visitó confirma la suya", () => {
  it("su visita sin confirmar: le toca confirmar", () => {
    expect(tareaDe(fila(), SUPERVISOR, false)).toBe("confirmar");
  });
  it("marcó ✗: le toca ir al sitio", () => {
    expect(tareaDe(fila({ resultado: "no_coincide" }), SUPERVISOR, false)).toBe("documentar");
  });
  it("ya confirmada: nada", () => {
    expect(tareaDe(fila({ resultado: "coincide", confirmada_en: "2026-11-21T10:00:00Z" }), SUPERVISOR, false)).toBeNull();
  });
  it("el jefe mira sin botones", () => {
    expect(tareaDe(fila(), JEFE, true)).toBeNull();
  });
  it("sin sesión: nada", () => {
    expect(tareaDe(fila(), null, false)).toBeNull();
  });
  it("filas sin los datos de la mig 226 (la base vieja) se leen como antes", () => {
    const vieja = fila();
    delete vieja.lo_confirma_supervisor;
    delete vieja.confirma_id;
    expect(tareaDe(vieja, SUPERVISOR, false)).toBe("confirmar");
    expect(pasoDe(vieja)).toBe("por_confirmar");
  });
});

describe("la del auxiliar (D-095): la confirma el supervisor de la moto", () => {
  it("al supervisor le toca confirmarla", () => {
    expect(tareaDe(delAuxiliar(), SUPERVISOR, false)).toBe("confirmar");
  });
  it("el auxiliar espera: no tiene ✓/✗", () => {
    expect(tareaDe(delAuxiliar(), AUXILIAR, false)).toBe("esperar");
  });
  it("el supervisor marcó ✗: al auxiliar le toca ir al sitio, al supervisor ya nada", () => {
    const f = delAuxiliar({ resultado: "no_coincide" });
    expect(tareaDe(f, AUXILIAR, false)).toBe("documentar");
    expect(tareaDe(f, SUPERVISOR, false)).toBeNull();
  });
  it("otro supervisor (no es su moto) no ve tarea", () => {
    expect(tareaDe(delAuxiliar(), "sup-2", false)).toBeNull();
  });
  it("el jefe no la confirma si la moto tiene supervisor", () => {
    expect(tareaDe(delAuxiliar(), JEFE, true)).toBeNull();
  });
  it("moto sin supervisor: la confirma el jefe", () => {
    const f = delAuxiliar({ confirma_id: null, confirma: null });
    expect(tareaDe(f, JEFE, true)).toBe("confirmar");
    expect(tareaDe(f, AUXILIAR, false)).toBe("esperar");
  });
});

describe("el número rojo del menú cuenta solo lo que uno mismo puede hacer", () => {
  it("al auxiliar no le cuenta lo que espera al supervisor, sí lo que tiene que ir a documentar", () => {
    const filas = [delAuxiliar(), delAuxiliar({ contrato_id: "c2", resultado: "no_coincide" })];
    expect(cuentaDelMenu(filas, AUXILIAR, false)).toBe(1);
  });
  it("al supervisor le cuenta las suyas y las del auxiliar que le toca confirmar", () => {
    const filas = [fila(), delAuxiliar({ contrato_id: "c2" }), delAuxiliar({ contrato_id: "c3", resultado: "no_coincide" })];
    expect(cuentaDelMenu(filas, SUPERVISOR, false)).toBe(2);
  });
});

describe("días esperando", () => {
  it("cuenta días enteros desde la entrega", () => {
    expect(diasEsperando("2026-11-20", "2026-11-24")).toBe(4);
    expect(diasEsperando("2026-11-24", "2026-11-24")).toBe(0);
  });
  it("nunca da negativo ni se rompe con una fecha mala", () => {
    expect(diasEsperando("2026-11-25", "2026-11-24")).toBe(0);
    expect(diasEsperando("", "2026-11-24")).toBe(0);
  });
});

describe("el WhatsApp para pedírsela al supervisor", () => {
  it("dice qué moto, de quién, y dónde la encuentra", () => {
    expect(textoPedirConfirmacion(delAuxiliar(), "Brandon")).toBe(
      "Hola Brandon, ¿me confirmas en el GPS dónde duerme la ABC12D de CLIENTE PRUEBA? "
      + "Yo le hice la visita el 17 de noviembre y la moto se entregó el 20 de noviembre. "
      + "Está en tu «📍 Confirmar ubicación». Gracias.");
  });
});
