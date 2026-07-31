import { describe, it, expect } from "vitest";
import { aplicarCambioALista, type FilaConId } from "./createTableStore";

// Esta es la parte del refresco que puede MOSTRAR UN DATO EQUIVOCADO en pantalla: aplica el
// cambio que avisa el servidor sobre la lista que ya está en memoria, sin volver a pedir la
// tabla. Si se equivoca, el cobrador ve un pago que no existe o deja de ver uno que sí.
//
// La regla de diseño que estas pruebas protegen: ante CUALQUIER duda devuelve null, y el store
// pide la tabla completa. Preferimos quedar lentos antes que mostrar plata que no es.

type Fila = FilaConId & { id: string; created_at: string; valor?: number };

const ordenar = (f: Fila[]) => [...f].sort((a, b) => b.created_at.localeCompare(a.created_at));

const A: Fila = { id: "a", created_at: "2026-07-31T10:00:00Z", valor: 100 };
const B: Fila = { id: "b", created_at: "2026-07-31T12:00:00Z", valor: 200 };
const LISTA: Fila[] = [B, A]; // ya ordenada descendente

describe("aplicarCambioALista — INSERT", () => {
  it("agrega la fila y la deja en su lugar según el orden", () => {
    const nueva: Fila = { id: "c", created_at: "2026-07-31T11:00:00Z" };
    const r = aplicarCambioALista(LISTA, "INSERT", nueva, null, ordenar);
    expect(r?.map(f => f.id)).toEqual(["b", "c", "a"]);
  });
  it("un aviso repetido NO duplica la fila", () => {
    const r = aplicarCambioALista(LISTA, "INSERT", B, null, ordenar);
    expect(r?.map(f => f.id)).toEqual(["b", "a"]);
  });
  it("sin id → null (pide la tabla en vez de inventar)", () => {
    expect(aplicarCambioALista(LISTA, "INSERT", { } as FilaConId, null, ordenar)).toBeNull();
  });
});

describe("aplicarCambioALista — UPDATE", () => {
  it("reemplaza la fila por la versión nueva", () => {
    const cambiada: Fila = { ...A, valor: 999 };
    const r = aplicarCambioALista(LISTA, "UPDATE", cambiada, null, ordenar);
    expect(r?.find(f => f.id === "a")?.valor).toBe(999);
    expect(r).toHaveLength(2);
  });
  it("si la fila NO estaba en memoria → null (puede ser una que recién se hace visible por RLS)", () => {
    const ajena: Fila = { id: "z", created_at: "2026-07-31T13:00:00Z" };
    expect(aplicarCambioALista(LISTA, "UPDATE", ajena, null, ordenar)).toBeNull();
  });
});

describe("aplicarCambioALista — DELETE", () => {
  it("quita la fila por id", () => {
    const r = aplicarCambioALista(LISTA, "DELETE", null, { id: "b" }, ordenar);
    expect(r?.map(f => f.id)).toEqual(["a"]);
  });
  it("sin id (Postgres no mandó la clave) → null", () => {
    expect(aplicarCambioALista(LISTA, "DELETE", null, {}, ordenar)).toBeNull();
  });
});

describe("aplicarCambioALista — lo que no entiende, no lo inventa", () => {
  it("un evento desconocido → null", () => {
    expect(aplicarCambioALista(LISTA, "TRUNCATE", null, null, ordenar)).toBeNull();
  });
  it("nunca modifica la lista original (React necesita una referencia nueva para repintar)", () => {
    const nueva: Fila = { id: "c", created_at: "2026-07-31T11:00:00Z" };
    const r = aplicarCambioALista(LISTA, "INSERT", nueva, null, ordenar);
    expect(LISTA).toHaveLength(2);
    expect(r).not.toBe(LISTA);
  });
});
