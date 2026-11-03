import { describe, it, expect } from "vitest";
import { dondeEstaCadaMoto, guardadasPorSupervisor, LUGARES, sitioFisico, type GuardadaPorSupervisorIn } from "./reportesFlota";

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

  it("la vendida no está en ningún lugar, aunque su contrato viejo siga suspendido (mig 186)", () => {
    const v = dondeEstaCadaMoto([{ id: "mv", estado: "Vendida" }, { id: "md", estado: "Disponible" }], [{ id: "cv", moto_id: "mv", estado: "Suspendido" }]);
    expect(v.has("mv")).toBe(false);
    expect(v.get("md")?.lugar).toBe("disponible");
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

describe("guardadas por supervisor (pedido del 3-nov)", () => {
  const m = (subadminId: string | null, subadminNombre: string, lugar: GuardadaPorSupervisorIn["lugar"], dias: number | null, enLiquidacion = false): GuardadaPorSupervisorIn =>
    ({ subadminId, subadminNombre, lugar, dias, enLiquidacion });
  const lista = [
    m("s2", "CARLOS ALVAREZ", "retenida", 42, true),
    m("s2", "CARLOS ALVAREZ", "retenida", 30),            // 30 justos: no es «más de 30»
    m("s2", "CARLOS ALVAREZ", "tallerSinCliente", null),  // sin fecha de entrada: no suma días
    m("s1", "BRANDON ROJAS", "retenida", 14),
    m(null, "Sin supervisor", "tallerConCliente", 87, true),
    m(null, "Sin supervisor", "retenida", 31, true),
    m(null, "Sin supervisor", "retenida", null),
  ];
  const r = guardadasPorSupervisor(lista);

  it("una fila por supervisor, por nombre, y las que no tienen supervisor al final", () => {
    expect(r.filas.map(f => f.nombre)).toEqual(["BRANDON ROJAS", "CARLOS ALVAREZ", "Sin supervisor"]);
    expect(r.filas.map(f => f.subadminId)).toEqual(["s1", "s2", null]);
  });

  it("cuenta cada moto en su categoría y las filas suman el total", () => {
    const carlos = r.filas[1];
    expect([carlos.motos, carlos.retenida, carlos.tallerConCliente, carlos.tallerSinCliente]).toEqual([3, 2, 0, 1]);
    expect([r.total.motos, r.total.retenida, r.total.tallerConCliente, r.total.tallerSinCliente]).toEqual([7, 5, 1, 1]);
    expect(r.filas.reduce((s, f) => s + f.motos, 0)).toBe(lista.length);
    for (const f of [...r.filas, r.total]) expect(f.retenida + f.tallerConCliente + f.tallerSinCliente).toBe(f.motos);
  });

  it("los días solo suman las motos con fecha de entrada, sin inventar las demás", () => {
    expect([r.filas[1].dias, r.filas[1].conFecha]).toEqual([72, 2]);
    expect([r.total.dias, r.total.conFecha]).toEqual([204, 5]);
    const soloSinFecha = guardadasPorSupervisor([m("s9", "WILINTON MORA", "retenida", null)]);
    expect([soloSinFecha.filas[0].dias, soloSinFecha.filas[0].conFecha, soloSinFecha.filas[0].masVieja]).toEqual([0, 0, null]);
  });

  it("más de 30 días cuenta desde 31, y la más vieja es la de más días", () => {
    expect([r.filas[1].masDe30, r.filas[1].masVieja]).toEqual([1, 42]);
    expect([r.filas[0].masDe30, r.filas[0].masVieja]).toEqual([0, 14]);
    expect([r.total.masDe30, r.total.masVieja]).toEqual([3, 87]);
  });

  it("cuenta las que están en liquidación", () => {
    expect(r.filas.map(f => f.enLiquidacion)).toEqual([0, 1, 2]);
    expect(r.total.enLiquidacion).toBe(3);
  });

  it("sin motos guardadas no hay filas", () => {
    const vacio = guardadasPorSupervisor([]);
    expect(vacio.filas).toEqual([]);
    expect(vacio.total.motos).toBe(0);
  });
});
