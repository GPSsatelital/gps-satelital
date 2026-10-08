import { describe, it, expect } from "vitest";
import { cuadroCruzado, verificarCuadro, SIN_COBRADOR, ANTES_DE_ASIGNAR, type FilaCruzado, type MotoCruzado, type PagoCruzado } from "./reportesCruzado";
import type { Cumplimiento } from "./reportesCifras";

// El cuadro cruzado de Reportes (8-oct-2026): cada cobrador en cada grupo. La regla que protege esta
// batería: el cuadro NO inventa cuentas, solo reparte. Cada columna suma lo mismo que su grupo y cada
// fila lo mismo que su cobrador — si no, el dueño ve dos cifras distintas para la misma pregunta.

const GRUPOS = ["RASTREADOR", "COSTA", "PRADERA"];
const cum = (debia: number, cubrio: number, medible = true): Cumplimiento =>
  ({ debia, cubrio, aAcuerdo: 0, falto: debia - cubrio, recupero: 0, atrasoAAcuerdo: 0, medible });
const fila = (grupo: string, cobrador: string, o: Partial<FilaCruzado> = {}): FilaCruzado => ({
  grupo, cobrador, cerrado: false, debeHoy: 0, cum: cum(0, 0), cumSuyo: cum(0, 0), evaluable: true, ...o,
});

const motos: MotoCruzado[] = [
  { grupo: "COSTA", cobrador: "lumar", trabajando: true },
  { grupo: "COSTA", cobrador: "lumar", trabajando: false },
  { grupo: "PRADERA", cobrador: "lumar", trabajando: true },
  { grupo: "COSTA", cobrador: "brandon", trabajando: true },
  { grupo: "RASTREADOR", cobrador: SIN_COBRADOR, trabajando: false },
];
const filas: FilaCruzado[] = [
  fila("COSTA", "lumar", { debeHoy: 348000, cum: cum(404000, 152000), cumSuyo: cum(404000, 152000) }),
  fila("PRADERA", "lumar", { debeHoy: 0, cum: cum(202000, 202000), cumSuyo: cum(202000, 202000) }),
  // Moto que Brandon recibió a mitad del período: desde el grupo vencían $404.000, desde él $202.000.
  fila("COSTA", "brandon", { debeHoy: 202000, cum: cum(404000, 202000), cumSuyo: cum(202000, 202000) }),
  // Retenida: debe, pero no cuenta para el cumplimiento de nadie.
  fila("COSTA", "brandon", { debeHoy: 500000, evaluable: false, cum: cum(202000, 0), cumSuyo: cum(202000, 0) }),
  // Contrato cerrado que solo pagó: no debe nada aunque traiga un número.
  fila("PRADERA", "lumar", { cerrado: true, debeHoy: 99999, evaluable: false }),
];
const pagos: PagoCruzado[] = [
  { grupo: "COSTA", cobrador: "lumar", valor: 200000, antesDeAsignar: false },
  { grupo: "PRADERA", cobrador: "lumar", valor: 202000, antesDeAsignar: false },
  { grupo: "COSTA", cobrador: "brandon", valor: 202000, antesDeAsignar: false },
  // Pagado antes de que la moto fuera de Brandon (D-035): no es de él.
  { grupo: "COSTA", cobrador: "brandon", valor: 202000, antesDeAsignar: true },
];
const datos = { motos, filas, pagos };
const orden = ["brandon", "lumar"];

describe("cuadro cruzado — motos y paradas", () => {
  it("cuenta las motos de cada cobrador en cada grupo, y los totales cuadran", () => {
    const c = cuadroCruzado("motos", datos, GRUPOS, orden);
    expect(c.filas.map(f => f.clave)).toEqual(["brandon", "lumar", SIN_COBRADOR]);
    const lumar = c.filas.find(f => f.clave === "lumar")!;
    expect(lumar.celdas.COSTA.valor).toBe(2);
    expect(lumar.celdas.PRADERA.valor).toBe(1);
    expect(lumar.total.valor).toBe(3);
    expect(c.totalGrupo.COSTA.valor).toBe(3);
    expect(c.totalGrupo.RASTREADOR.valor).toBe(1);
    expect(c.total.valor).toBe(5);
  });

  it("paradas: solo las que no están trabajando, con los mismos renglones", () => {
    const c = cuadroCruzado("paradas", datos, GRUPOS, orden);
    expect(c.filas.map(f => f.clave)).toEqual(["brandon", "lumar", SIN_COBRADOR]);
    expect(c.filas.find(f => f.clave === "lumar")!.celdas.COSTA.valor).toBe(1);
    expect(c.filas.find(f => f.clave === "brandon")!.total.valor).toBe(0);
    expect(c.total.valor).toBe(2);
  });
});

describe("cuadro cruzado — lo que se debe hoy", () => {
  it("suma lo que debe cada contrato y deja fuera los cerrados", () => {
    const c = cuadroCruzado("debe", datos, GRUPOS, orden);
    expect(c.filas.find(f => f.clave === "brandon")!.celdas.COSTA.valor).toBe(702000);
    expect(c.filas.find(f => f.clave === "lumar")!.celdas.PRADERA.valor).toBe(0);
    expect(c.totalGrupo.COSTA.valor).toBe(1050000);
    expect(c.total.valor).toBe(1050000);
  });
});

describe("cuadro cruzado — lo recaudado (D-035)", () => {
  const c = cuadroCruzado("recaudado", datos, GRUPOS, orden);
  it("lo pagado antes de asignar la moto va en su propio renglón, al final", () => {
    expect(c.filas.map(f => f.clave)).toEqual(["brandon", "lumar", SIN_COBRADOR, ANTES_DE_ASIGNAR]);
    expect(c.filas.find(f => f.clave === ANTES_DE_ASIGNAR)!.celdas.COSTA.valor).toBe(202000);
  });
  it("al cobrador solo se le cuenta lo suyo (como en «Por cobrador»)", () => {
    expect(c.filas.find(f => f.clave === "brandon")!.total.valor).toBe(202000);
  });
  it("la columna del grupo suma TODO lo que entró (como en «Por grupo»)", () => {
    expect(c.totalGrupo.COSTA.valor).toBe(604000);
    expect(c.total.valor).toBe(806000);
  });
  it("el renglón «Antes de asignar» no aparece en las otras vistas", () => {
    expect(cuadroCruzado("motos", datos, GRUPOS, orden).filas.some(f => f.clave === ANTES_DE_ASIGNAR)).toBe(false);
  });
});

describe("cuadro cruzado — cumplimiento", () => {
  const c = cuadroCruzado("cumplimiento", datos, GRUPOS, orden);
  it("cada casilla y cada cobrador se miden desde que la moto es suya", () => {
    expect(c.filas.find(f => f.clave === "brandon")!.celdas.COSTA.valor).toBe(100);
    expect(c.filas.find(f => f.clave === "lumar")!.celdas.COSTA.valor).toBe(38); // 152.000 de 404.000
    expect(c.filas.find(f => f.clave === "lumar")!.total.valor).toBe(58); // 354.000 de 606.000 = 58,4 %
  });
  it("cada grupo se mide sobre todo el período, y sin las retenidas", () => {
    // COSTA: 152.000 + 202.000 de 404.000 + 404.000 (la retenida no cuenta)
    expect(c.totalGrupo.COSTA.valor).toBe(44);
  });
  it("sin nada que vencía, no hay porcentaje (no es 0%)", () => {
    expect(c.filas.find(f => f.clave === SIN_COBRADOR)!.total.valor).toBeNull();
    expect(c.totalGrupo.RASTREADOR.valor).toBeNull();
  });
});

describe("verificarCuadro — que cuadre con las otras pantallas", () => {
  const c = cuadroCruzado("motos", datos, GRUPOS, orden);
  it("cuando las cifras son iguales, no hay nada que decir", () => {
    expect(verificarCuadro(c, { porGrupo: { COSTA: 3, PRADERA: 1, RASTREADOR: 1 }, porCobrador: { lumar: 3, brandon: 1 } })).toEqual([]);
  });
  it("cuando una no cuadra, dice cuál y con qué cifras", () => {
    const dif = verificarCuadro(c, { porGrupo: { COSTA: 4 } });
    expect(dif).toHaveLength(1);
    expect(dif[0]).toContain("COSTA");
  });
  it("un porcentaje vacío y uno vacío cuadran", () => {
    const k = cuadroCruzado("cumplimiento", datos, GRUPOS, orden);
    expect(verificarCuadro(k, { porGrupo: { RASTREADOR: null } })).toEqual([]);
  });
});
