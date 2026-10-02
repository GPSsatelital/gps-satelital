import { describe, it, expect } from "vitest";
import { dondeEstaCadaMoto, LUGARES, sitioFisico } from "./reportesFlota";

describe("dónde está cada moto (D-033 y D-034)", () => {
  const motos = [
    { id: "m1", estado: "Asignada" },        // trabajando
    { id: "m2", estado: "Mantenimiento" },   // contrato activo, moto en el taller
    { id: "m3", estado: "Recuperada" },      // retenida en el parqueadero
    { id: "m4", estado: "Mantenimiento" },   // retenida, la mandaron al taller
    { id: "m5", estado: "Asignada" },        // la retuvieron y ya la tiene otro cliente
    { id: "m6", estado: "Garantia" },        // sin contrato, en garantía
    { id: "m7", estado: "Disponible" },      // lista para entregar
    { id: "m8", estado: "Reservada" },
  ];
  const contratos = [
    { id: "c1", moto_id: "m1", estado: "Activo" },
    { id: "c2", moto_id: "m2", estado: "Activo" },
    { id: "c3", moto_id: "m3", estado: "Suspendido" },
    { id: "c4", moto_id: "m4", estado: "Suspendido" },
    { id: "c5viejo", moto_id: "m5", estado: "Suspendido" },
    { id: "c5nuevo", moto_id: "m5", estado: "Activo" },
    { id: "c6", moto_id: "m6", estado: "Finalizado" },
  ];
  const r = dondeEstaCadaMoto(motos, contratos);

  it("cada moto cae en un solo lugar", () => {
    expect(Object.fromEntries([...r].map(([id, x]) => [id, x.lugar]))).toEqual({
      m1: "trabajando", m2: "tallerConCliente", m3: "retenida", m4: "retenida",
      m5: "trabajando", m6: "tallerSinCliente", m7: "disponible", m8: "disponible",
    });
  });

  it("la retenida que ya tiene otro cliente cuenta con el contrato nuevo", () => {
    expect(r.get("m5")?.contratoId).toBe("c5nuevo");
    expect(r.get("m4")?.contratoId).toBe("c4");
  });

  it("los lugares tienen etiqueta y explicación, y el sitio se dice en palabras", () => {
    expect(LUGARES.map(l => l.clave)).toEqual(["trabajando", "tallerConCliente", "retenida", "tallerSinCliente", "disponible"]);
    expect(sitioFisico("Recuperada")).toBe("en el parqueadero");
    expect(sitioFisico("Mantenimiento")).toBe("en el taller");
  });
});
