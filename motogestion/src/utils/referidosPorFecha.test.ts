import { describe, expect, it } from "vitest";
import {
  esDelEquipo, filasReferidos, rangoDelPeriodo, filtrarReferidos, resumenReferidos, equipoPorPersona,
  type ClienteReferido, type ContratoReferido,
} from "./referidosPorFecha";

const cli = (id: string, x: Partial<ClienteReferido>): ClienteReferido => ({
  id, nombre: id.toUpperCase(), created_at: "2026-10-01T15:00:00Z",
  referido_por_cedula: null, referido_por_nombre: null, referido_por_funcionario: null, ...x,
});
const EQUIPO: Record<string, string> = { brandon: "Brandon Rojas", johan: "Johan David Rojas" };
const nombre = (id: string) => EQUIPO[id] ?? null;
const local = (ts: string) => ts.slice(0, 10);

// Casos como los reales del 9-oct: WILSON lo trajo BRANDON (y quedó anotado también con la cédula de
// BRANDON), DANILO lo refirió un cliente, PEDRO se registró y todavía no recibe moto.
const clientes: ClienteReferido[] = [
  cli("wilson", { created_at: "2026-10-07T20:00:00Z", referido_por_cedula: "1002246201", referido_por_nombre: "BRANDON ROJAS", referido_por_funcionario: "brandon" }),
  cli("danilo", { created_at: "2026-10-08T14:00:00Z", referido_por_cedula: "73100200", referido_por_nombre: "JAIDER FERRER MUÑOZ" }),
  cli("pedro", { created_at: "2026-10-05T14:00:00Z", referido_por_cedula: "73100200", referido_por_nombre: "JAIDER FERRER MUÑOZ" }),
  cli("yorneis", { created_at: "2026-09-28T14:00:00Z", referido_por_funcionario: "johan" }),
  cli("sincedula", { referido_por_nombre: "ALGUIEN" }),
  cli("nadie", {}),
];
const contratos: ContratoReferido[] = [
  { cliente_id: "wilson", estado: "Activo", fecha_entrega: "2026-10-08" },
  { cliente_id: "danilo", estado: "Activo", fecha_entrega: "2026-10-09" },
  { cliente_id: "pedro", estado: "En proceso", fecha_entrega: null },
  { cliente_id: "yorneis", estado: "Finalizado", fecha_entrega: "2026-09-30" },
  { cliente_id: "yorneis", estado: "Activo", fecha_entrega: "2026-10-08" },
];
const filas = filasReferidos(clientes, contratos, nombre, local);

describe("referidos por fecha", () => {
  it("el del equipo es el que tiene a alguien del equipo anotado, tenga o no la cédula", () => {
    expect(esDelEquipo(clientes[0])).toBe(true);
    expect(esDelEquipo(clientes[1])).toBe(false);
  });

  it("entra quien tiene la cédula de quien lo refirió o alguien del equipo; el que solo tiene nombre, no", () => {
    expect(filas.map(f => f.clienteId).sort()).toEqual(["danilo", "pedro", "wilson", "yorneis"]);
  });

  it("del equipo dice el nombre de la persona del equipo; de cliente, el nombre escrito", () => {
    const w = filas.find(f => f.clienteId === "wilson")!;
    expect(w.origen).toBe("equipo");
    expect(w.quien).toBe("Brandon Rojas");
    expect(filas.find(f => f.clienteId === "danilo")!.quien).toBe("JAIDER FERRER MUÑOZ");
  });

  it("recibió la moto = la primera entrega; un contrato en proceso no cuenta", () => {
    expect(filas.find(f => f.clienteId === "yorneis")!.recibioMoto).toBe("2026-09-30");
    const p = filas.find(f => f.clienteId === "pedro")!;
    expect(p.conMoto).toBe(false);
    expect(p.recibioMoto).toBeNull();
  });

  it("contando por la moto, el que no la ha recibido no entra; por registro, sí", () => {
    const oct = { desde: "2026-10-01", hasta: "2026-10-31", quien: "todos" };
    expect(filtrarReferidos(filas, { ...oct, contarPor: "moto" }).map(f => f.clienteId)).toEqual(["danilo", "wilson"]);
    expect(filtrarReferidos(filas, { ...oct, contarPor: "registro" }).map(f => f.clienteId)).toEqual(["danilo", "wilson", "pedro"]);
  });

  it("filtra por clientes, por equipo y por una persona del equipo", () => {
    const base = { contarPor: "registro" as const, desde: "2026-09-01", hasta: "2026-10-31" };
    expect(filtrarReferidos(filas, { ...base, quien: "clientes" }).map(f => f.clienteId)).toEqual(["danilo", "pedro"]);
    expect(filtrarReferidos(filas, { ...base, quien: "equipo" }).map(f => f.clienteId)).toEqual(["wilson", "yorneis"]);
    expect(filtrarReferidos(filas, { ...base, quien: "johan" }).map(f => f.clienteId)).toEqual(["yorneis"]);
  });

  it("el resumen cuenta equipo y clientes por separado", () => {
    expect(resumenReferidos(filas)).toEqual({ total: 4, equipo: 2, clientes: 2 });
  });

  it("cada persona del equipo con cuántos trajo y cuántos ya tienen moto", () => {
    expect(equipoPorPersona(filas)).toEqual([
      { id: "brandon", nombre: "Brandon Rojas", traidos: 1, conMoto: 1 },
      { id: "johan", nombre: "Johan David Rojas", traidos: 1, conMoto: 1 },
    ]);
  });

  it("los períodos", () => {
    expect(rangoDelPeriodo("mes", "2026-10-09")).toEqual({ desde: "2026-10-01", hasta: "2026-10-09" });
    expect(rangoDelPeriodo("mes_anterior", "2026-10-09")).toEqual({ desde: "2026-09-01", hasta: "2026-09-30" });
    expect(rangoDelPeriodo("mes_anterior", "2026-01-15")).toEqual({ desde: "2025-12-01", hasta: "2025-12-31" });
    expect(rangoDelPeriodo("ult30", "2026-10-09")).toEqual({ desde: "2026-09-10", hasta: "2026-10-09" });
    expect(rangoDelPeriodo("anio", "2026-10-09")).toEqual({ desde: "2026-01-01", hasta: "2026-10-09" });
    // Fechas escogidas al revés: se voltean en vez de dar una lista vacía.
    expect(rangoDelPeriodo("personalizado", "2026-10-09", { desde: "2026-10-05", hasta: "2026-10-01" })).toEqual({ desde: "2026-10-01", hasta: "2026-10-05" });
  });
});
