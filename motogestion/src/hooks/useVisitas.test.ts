import { describe, it, expect } from "vitest";
import { visitaFueHecha, type VisitaEstado } from "./useVisitas";

// De esta respuesta dependen $40.000: al devolverle la base a un cliente que se retira, se le
// descuenta lo que la empresa ya le pagó al visitador — pero SOLO si alguien fue de verdad.
//
// Ya falló una vez en producción: la condición preguntaba `estado === "Realizada"` y el sistema
// guarda las visitas como "Completada", así que nunca descontaba nada. Dos puertas escribiendo
// valores distintos para el mismo hecho.
describe("visitaFueHecha — ¿alguien fue de verdad a la casa?", () => {
  it("reconoce 'Completada', que es lo que escribe ModalVisita (la puerta real)", () => {
    expect(visitaFueHecha({ estado: "Completada" })).toBe(true);
  });

  it("reconoce también 'Realizada', por si alguna fila vieja lo trae", () => {
    expect(visitaFueHecha({ estado: "Realizada" })).toBe(true);
  });

  it("una visita todavía Pendiente NO cuenta: nadie ha ido, no hay a quién pagarle", () => {
    expect(visitaFueHecha({ estado: "Pendiente" })).toBe(false);
  });

  // "Hecha" y "aprobada" son cosas distintas: una visita puede estar hecha y figurar
  // "Pendiente de revisar" (le falta la decisión del admin). Al visitador ya se le pagó igual,
  // así que el descuento aplica. Si esto se confundiera, se le devolvería de más al cliente.
  it("no depende de que esté aprobada — el estado es lo único que importa", () => {
    const estados: VisitaEstado[] = ["Completada", "Realizada"];
    for (const estado of estados) expect(visitaFueHecha({ estado })).toBe(true);
  });
});
