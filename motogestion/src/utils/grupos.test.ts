/// <reference types="node" />
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  COLORES_GRUPO, HEX_DIA, LARGO_MAX_GRUPO, esColorGrupo, normalizarNombreGrupo,
  ordenarPorCodigo, problemaNombreGrupo, tonoDeColor,
} from "./grupos";

// La regla del nombre es espejo de `grupo_normalizar` y `grupo_validar_nombre` (mig 217): si la
// pantalla deja pasar un nombre que la base rechaza, el dueño se entera tarde y con un error feo.

describe("normalizarNombreGrupo", () => {
  it("pone mayúsculas, quita las puntas y deja un solo espacio", () => {
    expect(normalizarNombreGrupo("  capital   motos ")).toBe("CAPITAL MOTOS");
    expect(normalizarNombreGrupo("costa\tnorte")).toBe("COSTA NORTE");
    expect(normalizarNombreGrupo("peña")).toBe("PEÑA");
  });
  it("junta las tildes escritas en dos partes", () => {
    expect(normalizarNombreGrupo("bogotá")).toBe("BOGOTÁ");
  });
});

describe("problemaNombreGrupo (mismos mensajes que la base)", () => {
  it("acepta los nombres de hoy y CAPITAL MOTOS", () => {
    for (const n of ["COSTA", "PRADERA", "RASTREADOR", "USADAS", "OTRO", "CAPITAL MOTOS", "GRUPO 2", "MARÍA ÑÚÑEZ"]) {
      expect(problemaNombreGrupo(n)).toBeNull();
    }
  });
  it("pide el nombre si viene vacío", () => {
    expect(problemaNombreGrupo("")).toBe("Escriba el nombre del grupo.");
  });
  it("hasta 14 caracteres", () => {
    expect(problemaNombreGrupo("A".repeat(LARGO_MAX_GRUPO))).toBeNull();
    expect(problemaNombreGrupo("CAPITAL MOTOSS1")).toBe("El nombre lleva hasta 14 caracteres; «CAPITAL MOTOSS1» tiene 15.");
  });
  it("rechaza ; y : (el filtro de Reportes → Cartera los usa de separador) y otros signos", () => {
    for (const n of ["COSTA;NORTE", "COSTA:NORTE", "COSTA-NORTE", "COSTA.", "costa"]) {
      expect(problemaNombreGrupo(n)).toMatch(/solo lleva letras, números y un espacio/);
    }
  });
  it("rechaza dos espacios seguidos o espacio en la punta (por eso se normaliza antes)", () => {
    expect(problemaNombreGrupo("COSTA  NORTE")).not.toBeNull();
    expect(problemaNombreGrupo(" COSTA")).not.toBeNull();
  });
});

// El CSS se lee del disco: vitest no deja importar un .css como texto.
const css = readFileSync(new URL("../index.css", import.meta.url), "utf-8");

describe("colores", () => {
  it("son las mismas 8 claves que acepta la base", () => {
    expect([...COLORES_GRUPO]).toEqual(["azul", "verde", "ambar", "naranja", "violeta", "aguamarina", "magenta", "gris"]);
    expect(esColorGrupo("violeta")).toBe(true);
    expect(esColorGrupo("rojo")).toBe(false);
  });
  it("un color que no se conoce sale gris, nunca invisible", () => {
    expect(tonoDeColor("rojo")).toEqual({ solido: "var(--g-gris)", suave: "var(--g-gris-soft)", letra: "var(--g-gris-ink)" });
    expect(tonoDeColor(null).solido).toBe("var(--g-gris)");
    expect(tonoDeColor("violeta").letra).toBe("var(--g-violeta-ink)");
  });
  it("los hex del Excel son los mismos de día que index.css", () => {
    const dia = css.slice(css.indexOf(':root, :root[data-theme="light"]'), css.indexOf(':root[data-theme="dark"] {'));
    for (const c of COLORES_GRUPO) {
      expect(dia).toContain(`--g-${c}: ${HEX_DIA[c].solido};`);
      expect(dia).toContain(`--g-${c}-soft: ${HEX_DIA[c].suave};`);
      expect(dia).toContain(`--g-${c}-ink: ${HEX_DIA[c].letra};`);
    }
  });
  it("cada color existe de noche y al imprimir", () => {
    const noche = css.slice(css.indexOf(':root[data-theme="dark"] {'));
    const imprimir = css.slice(css.indexOf("@media print"));
    for (const c of COLORES_GRUPO) {
      expect(noche).toContain(`--g-${c}-ink:`);
      expect(imprimir).toContain(`--g-${c}: ${HEX_DIA[c].solido};`);
    }
  });
});

describe("ordenarPorCodigo", () => {
  it("alfabético, como la base", () => {
    const lista = ["USADAS", "COSTA", "RASTREADOR", "PRADERA", "CAPITAL MOTOS"].map(codigo => ({ codigo }));
    expect(ordenarPorCodigo(lista).map(g => g.codigo)).toEqual(["CAPITAL MOTOS", "COSTA", "PRADERA", "RASTREADOR", "USADAS"]);
  });
});
