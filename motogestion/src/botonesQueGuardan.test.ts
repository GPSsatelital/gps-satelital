import { describe, it, expect } from "vitest";

// REVISIÓN AUTOMÁTICA DE LOS BOTONES QUE GUARDAN (23-oct-2026, D-054, pedido del dueño: «todo botón
// bloqueado contra doble clic, también los que vamos creando»).
//
// Lee el código de todas las pantallas y busca cada botón cuyo onClick llama a una función que escribe
// en la base (registrar, guardar, eliminar, cobrar… o supabase directo). Cada uno de esos botones debe:
//   1. tener `disabled=` (se pone gris y no deja tocar otra vez mientras guarda), y
//   2. cambiar su texto mientras guarda («Guardando...», «Cobrando...»): un `?` en lo que muestra.
// Si alguien crea un botón nuevo sin eso, esta prueba falla y no deja subirlo.
//
// Es una revisión de texto, no entiende el programa: si da un falso aviso, el botón se arregla igual
// (cuesta dos líneas) o, si de verdad no guarda nada, se agrega a EXCEPCIONES diciendo por qué.
// El candado de verdad contra las copias está en la base (migs 203 y 204); esto es el del toque rápido.

const ARCHIVOS = import.meta.glob("./**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

const ESCRIBE = /\b(registrar|crear|guardar|insertar|confirmar|rechazar|eliminar|borrar|aplicar|asignar|cerrar|activar|devolver|rodar|editar|actualizar|marcar|entregar|anular|liquidar|aprobar|convertir|ampliar|cancelar|finalizar|suspender|reasignar|prestar|recibir|cobrar|resolver|atender|posponer|importar)\w*\(|supabase\.(from|rpc)/;

/** "archivo:función" que no hace falta revisar, con su razón. */
const EXCEPCIONES: Record<string, string> = {};

function finDeEtiqueta(s: string, desde: number): number {
  let llaves = 0;
  for (let i = desde; i < s.length; i++) {
    const c = s[i];
    if (c === "{") llaves++;
    else if (c === "}") llaves--;
    else if (c === ">" && llaves === 0) return i;
  }
  return s.length;
}

type Hallazgo = { donde: string; falta: string };

function revisar(archivo: string, s: string): Hallazgo[] {
  const funciones: string[] = [];
  for (const m of s.matchAll(/(?:async function (\w+)\s*\(|const (\w+)\s*=\s*async\s*\()/g)) {
    const nombre = m[1] ?? m[2];
    const cuerpo = s.slice(m.index! + m[0].length, m.index! + m[0].length + 3000);
    if (ESCRIBE.test(cuerpo) && !EXCEPCIONES[`${archivo}:${nombre}`]) funciones.push(nombre);
  }
  const hallazgos: Hallazgo[] = [];
  for (const m of s.matchAll(/<(button|motion\.button|Btn)\b/g)) {
    const fin = finDeEtiqueta(s, m.index! + m[0].length);
    const etiqueta = s.slice(m.index!, fin);
    const onClick = etiqueta.match(/onClick=\{([\s\S]*)/);
    if (!onClick) continue;
    const llama = funciones.filter(f => new RegExp(`\\b${f}\\b`).test(onClick[1]));
    if (llama.length === 0) continue;
    const cierre = s.indexOf(`</${m[1]}>`, fin);
    const contenido = s.slice(fin + 1, cierre);
    const linea = s.slice(0, m.index!).split("\n").length;
    const donde = `${archivo.replace("./", "src/")}:${linea} (${llama.join(", ")})`;
    if (!etiqueta.includes("disabled=")) hallazgos.push({ donde, falta: "no se bloquea (falta disabled=)" });
    else if (!contenido.includes("?")) hallazgos.push({ donde, falta: "no dice «Guardando...» mientras guarda" });
  }
  return hallazgos;
}

describe("Botones que guardan: se bloquean y dicen que están guardando", () => {
  const todos = Object.entries(ARCHIVOS).flatMap(([archivo, s]) => revisar(archivo, s));

  it("encuentra los botones (si da 0, la revisión se rompió y no está mirando nada)", () => {
    const contados = Object.entries(ARCHIVOS).reduce((n, [, s]) => n + (s.match(/onClick=/g)?.length ?? 0), 0);
    expect(Object.keys(ARCHIVOS).length).toBeGreaterThan(50);
    expect(contados).toBeGreaterThan(100);
  });

  it("ningún botón que guarda se puede tocar dos veces ni se queda callado", () => {
    expect(todos.map(h => `${h.donde} → ${h.falta}`)).toEqual([]);
  });

  it("la revisión sí caza un botón mal hecho", () => {
    const malo = `
      async function handleGuardar() { await registrarPago(1); }
      return <button onClick={handleGuardar} style={{}}>Guardar</button>;`;
    const callado = `
      async function handleGuardar() { await registrarPago(1); }
      return <button onClick={handleGuardar} disabled={g}>Guardar</button>;`;
    const bueno = `
      async function handleGuardar() { await registrarPago(1); }
      return <button onClick={handleGuardar} disabled={g}>{g ? "Guardando..." : "Guardar"}</button>;`;
    expect(revisar("./x.tsx", malo).map(h => h.falta)).toEqual(["no se bloquea (falta disabled=)"]);
    expect(revisar("./x.tsx", callado).map(h => h.falta)).toEqual(["no dice «Guardando...» mientras guarda"]);
    expect(revisar("./x.tsx", bueno)).toEqual([]);
  });
});
