import { describe, it, expect } from "vitest";
import {
  contratosDeCliente, tramosDeTitular, esDeSuTramo, titularEnFecha,
  cesionPendienteDeCliente, type CesionScope,
} from "./useCesiones";

// Estas pruebas protegen la única cosa que la cesión puede romper: A QUIÉN LE PERTENECE CADA HECHO.
//
// El contrato cambia de titular, pero los pagos, deudas y convenios siguen colgando del contrato.
// Sin este reparto por fechas, al que cede se le vacía la ficha y al que recibe le aparecen pagos
// que nunca hizo — y eso, además de falso, es indefendible en una revisión.

const ctr = (id: string, clienteId: string) => ({ id, cliente_id: clienteId });

const ces = (contratoId: string, de: string, a: string, fecha: string): CesionScope =>
  ({ contrato_id: contratoId, cedente_id: de, cesionario_id: a, fecha });

describe("sin ninguna cesión — todo se comporta como siempre", () => {
  // La no-regresión más importante: hoy en producción NO hay ninguna cesión, así que este es
  // el caso de los 300 clientes reales.
  const contratos = [ctr("c1", "juan"), ctr("c2", "ana")];

  it("cada quien ve solo sus contratos", () => {
    expect(contratosDeCliente("juan", contratos, []).map(c => c.id)).toEqual(["c1"]);
    expect(contratosDeCliente("ana", contratos, []).map(c => c.id)).toEqual(["c2"]);
  });

  it("el titular tiene UN tramo abierto: todo el contrato es suyo", () => {
    expect(tramosDeTitular("juan", ctr("c1", "juan"), [])).toEqual([{ desde: "0000-01-01", hasta: "9999-12-31" }]);
  });

  it("cualquier hecho del contrato le pertenece, sin importar la fecha", () => {
    expect(esDeSuTramo("juan", "c1", "2020-01-01", contratos, [])).toBe(true);
    expect(esDeSuTramo("juan", "c1", "2099-12-31", contratos, [])).toBe(true);
  });

  it("quien no es titular no hereda nada", () => {
    expect(tramosDeTitular("ana", ctr("c1", "juan"), [])).toEqual([]);
    expect(esDeSuTramo("ana", "c1", "2026-05-05", contratos, [])).toBe(false);
  });
});

describe("una cesión: A le entrega a B", () => {
  const contratos = [ctr("c1", "beto")];          // beto es el titular de HOY
  const cesiones = [ces("c1", "ana", "beto", "2026-06-10")];

  it("el que cedió CONSERVA el contrato en su ficha", () => {
    expect(contratosDeCliente("ana", contratos, cesiones).map(c => c.id)).toEqual(["c1"]);
  });

  it("a cada uno le toca su tramo", () => {
    expect(tramosDeTitular("ana", contratos[0], cesiones)).toEqual([{ desde: "0000-01-01", hasta: "2026-06-10" }]);
    expect(tramosDeTitular("beto", contratos[0], cesiones)).toEqual([{ desde: "2026-06-10", hasta: "9999-12-31" }]);
  });

  it("los pagos viejos son del que cedió, no del que recibió", () => {
    expect(esDeSuTramo("ana", "c1", "2026-03-01", contratos, cesiones)).toBe(true);
    expect(esDeSuTramo("beto", "c1", "2026-03-01", contratos, cesiones)).toBe(false);
  });

  it("los pagos nuevos son del que recibió", () => {
    expect(esDeSuTramo("beto", "c1", "2026-08-01", contratos, cesiones)).toBe(true);
    expect(esDeSuTramo("ana", "c1", "2026-08-01", contratos, cesiones)).toBe(false);
  });

  // Decisión congelada: el borde es semiabierto. Si contara para los dos, la plata de ese día
  // se vería dos veces.
  it("un pago del MISMO día de la cesión cuenta para el que recibe", () => {
    expect(esDeSuTramo("beto", "c1", "2026-06-10", contratos, cesiones)).toBe(true);
    expect(esDeSuTramo("ana", "c1", "2026-06-10", contratos, cesiones)).toBe(false);
  });
});

describe("cadena de tres: A → B → C", () => {
  const contratos = [ctr("c1", "carlos")];
  const cesiones = [
    ces("c1", "ana", "beto", "2026-04-01"),
    ces("c1", "beto", "carlos", "2026-09-15"),
  ];

  // Si el titular original se dedujera de `contrato.cliente_id` (que ya es carlos), ana
  // desaparecería por completo del sistema.
  it("el primero de la cadena sigue existiendo aunque ya no aparezca en el contrato", () => {
    expect(tramosDeTitular("ana", contratos[0], cesiones)).toEqual([{ desde: "0000-01-01", hasta: "2026-04-01" }]);
    expect(contratosDeCliente("ana", contratos, cesiones).map(c => c.id)).toEqual(["c1"]);
  });

  it("el del medio tiene su tramo acotado por los dos lados", () => {
    expect(tramosDeTitular("beto", contratos[0], cesiones)).toEqual([{ desde: "2026-04-01", hasta: "2026-09-15" }]);
  });

  it("el último queda abierto hasta hoy", () => {
    expect(tramosDeTitular("carlos", contratos[0], cesiones)).toEqual([{ desde: "2026-09-15", hasta: "9999-12-31" }]);
  });

  it("las cesiones desordenadas dan el mismo resultado", () => {
    const alReves = [cesiones[1], cesiones[0]];
    expect(tramosDeTitular("beto", contratos[0], alReves)).toEqual([{ desde: "2026-04-01", hasta: "2026-09-15" }]);
  });
});

describe("el contrato vuelve a quien ya lo tuvo: A → B → A", () => {
  const contratos = [ctr("c1", "ana")];
  const cesiones = [
    ces("c1", "ana", "beto", "2026-04-01"),
    ces("c1", "beto", "ana", "2026-10-20"),
  ];

  // Por esto la función devuelve un ARRAY y no un par único.
  it("ana tiene DOS tramos separados", () => {
    expect(tramosDeTitular("ana", contratos[0], cesiones)).toEqual([
      { desde: "0000-01-01", hasta: "2026-04-01" },
      { desde: "2026-10-20", hasta: "9999-12-31" },
    ]);
  });

  it("lo que pasó mientras la tuvo beto NO es de ana", () => {
    expect(esDeSuTramo("ana", "c1", "2026-06-15", contratos, cesiones)).toBe(false);
    expect(esDeSuTramo("beto", "c1", "2026-06-15", contratos, cesiones)).toBe(true);
  });

  it("las dos etapas de ana sí son suyas", () => {
    expect(esDeSuTramo("ana", "c1", "2026-02-01", contratos, cesiones)).toBe(true);
    expect(esDeSuTramo("ana", "c1", "2026-11-01", contratos, cesiones)).toBe(true);
  });
});

describe("titularEnFecha — el nombre correcto en cada pago", () => {
  const contratos = [ctr("c1", "carlos")];
  const cesiones = [
    ces("c1", "ana", "beto", "2026-04-01"),
    ces("c1", "beto", "carlos", "2026-09-15"),
  ];

  it("devuelve quién lo tenía ese día, no quién lo tiene hoy", () => {
    expect(titularEnFecha("c1", "2026-01-10", contratos, cesiones)).toBe("ana");
    expect(titularEnFecha("c1", "2026-06-01", contratos, cesiones)).toBe("beto");
    expect(titularEnFecha("c1", "2026-12-01", contratos, cesiones)).toBe("carlos");
  });

  it("el día de la cesión ya es del que recibe", () => {
    expect(titularEnFecha("c1", "2026-04-01", contratos, cesiones)).toBe("beto");
  });

  it("sin cesiones devuelve el titular del contrato", () => {
    expect(titularEnFecha("c1", "2026-06-01", [ctr("c1", "juan")], [])).toBe("juan");
  });

  it("un contrato que no existe devuelve null en vez de reventar", () => {
    expect(titularEnFecha("noexiste", "2026-06-01", contratos, cesiones)).toBeNull();
  });
});

describe("marca de 'registrado por cesión' — se apaga sola", () => {
  const cli = { id: "beto", ingreso_por_cesion: true };

  it("mientras no exista la cesión, queda pendiente", () => {
    expect(cesionPendienteDeCliente(cli, [])).toBe(true);
  });

  it("apenas se hace la cesión, la marca desaparece sin que nadie la apague", () => {
    expect(cesionPendienteDeCliente(cli, [ces("c1", "ana", "beto", "2026-06-10")])).toBe(false);
  });

  it("un cliente normal nunca queda marcado", () => {
    expect(cesionPendienteDeCliente({ id: "juan", ingreso_por_cesion: false }, [])).toBe(false);
    expect(cesionPendienteDeCliente({ id: "juan" }, [])).toBe(false);
  });

  it("la cesión de OTRA persona no le apaga la marca", () => {
    expect(cesionPendienteDeCliente(cli, [ces("c1", "ana", "otro", "2026-06-10")])).toBe(true);
  });
});
