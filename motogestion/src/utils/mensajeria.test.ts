import { describe, it, expect } from "vitest";
import { normalizarWhatsapp, ordenarVariables, decidirCanal, diasTexto, fmtPesos, urlWaMe } from "./mensajeria";

describe("normalizarWhatsapp — un solo criterio para los 8 botones", () => {
  it("celular colombiano de 10 dígitos → le pone el 57", () => {
    expect(normalizarWhatsapp("3045342428")).toBe("573045342428");
    expect(normalizarWhatsapp("304 534 2428")).toBe("573045342428");
    expect(normalizarWhatsapp("+57 304-534-2428")).toBe("573045342428");
  });
  it("si ya trae el 57, lo respeta", () => {
    expect(normalizarWhatsapp("573045342428")).toBe("573045342428");
  });
  it("vacío o muy corto → null, para avisar en vez de abrir un enlace roto", () => {
    expect(normalizarWhatsapp("")).toBeNull();
    expect(normalizarWhatsapp(null)).toBeNull();
    expect(normalizarWhatsapp("12345")).toBeNull();
  });
});

describe("ordenarVariables — de comodines con nombre a {{1}} {{2}} de Meta", () => {
  it("respeta el orden que dice la fila de la plantilla, no el del objeto", () => {
    const r = ordenarVariables({ valor: "$202.000", nombre: "KEVIN", placa: "RLY45H" }, ["nombre", "placa", "valor"]);
    expect(r.valores).toEqual(["KEVIN", "RLY45H", "$202.000"]);
    expect(r.faltan).toEqual([]);
  });
  it("avisa cuál falta (Meta rechaza variables vacías)", () => {
    const r = ordenarVariables({ nombre: "KEVIN" }, ["nombre", "placa", "valor"]);
    expect(r.faltan).toEqual(["placa", "valor"]);
  });
});

describe("decidirCanal — la regla del dueño (8-sep-2026)", () => {
  const num = "573045342428";
  it("sin ZALA conectada: WhatsApp para todo el mundo, tenga o no permiso", () => {
    expect(decidirCanal({ zalaActivo: false, tienePermiso: false, plantillaActiva: true, numero: num }).canal).toBe("whatsapp_web");
  });
  it("con ZALA conectada y permiso: sale por ZALA", () => {
    expect(decidirCanal({ zalaActivo: true, tienePermiso: true, plantillaActiva: true, numero: num }).canal).toBe("zala");
  });
  it("con ZALA conectada y SIN permiso: no sale, y NO hay respaldo por wa.me", () => {
    const r = decidirCanal({ zalaActivo: true, tienePermiso: false, plantillaActiva: true, numero: num });
    expect(r.canal).toBe("ninguno");
    expect(r.estado).toBe("sin_permiso");
  });
  it("sin número válido no sale por ningún canal", () => {
    expect(decidirCanal({ zalaActivo: false, tienePermiso: true, plantillaActiva: true, numero: null }).estado).toBe("sin_numero");
  });
  it("una clave desactivada no sale ni por respaldo", () => {
    expect(decidirCanal({ zalaActivo: false, tienePermiso: true, plantillaActiva: false, numero: num }).estado).toBe("sin_plantilla");
  });
});

describe("formatos que lee el cliente", () => {
  it("días con la palabra adentro (Meta no deja ponerla afuera sin que quede '1 días')", () => {
    expect(diasTexto(1)).toBe("1 día");
    expect(diasTexto(3)).toBe("3 días");
    expect(diasTexto(0)).toBe("0 días");
  });
  it("plata con puntos de mil", () => {
    expect(fmtPesos(202000)).toBe("$202.000");
  });
  it("el enlace de respaldo codifica el texto", () => {
    expect(urlWaMe("573045342428", "hola mundo")).toBe("https://wa.me/573045342428?text=hola%20mundo");
  });
});
