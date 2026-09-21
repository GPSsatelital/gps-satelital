import { describe, it, expect } from "vitest";
import { urlsDeStorageEnHtml } from "./urlsEnHtml";

// Protege el RECORTE de las direcciones dentro de un HTML de documento (21-sep-2026).
// Si el patrón se pasa de largo y se lleva la comilla de cierre, la imagen queda con una
// dirección inválida y el contrato/liquidación sale IMPRESO SIN FIRMA, sin avisar.
const BASE = "https://jvfkprkjysjffhzjitgl.supabase.co/storage/v1/object/public";

describe("urlsDeStorageEnHtml", () => {
  it("saca la URL de un <img> sin llevarse la comilla", () => {
    const html = `<img src="${BASE}/documentos/firmas/abc/contrato.png" style="width:100%" />`;
    expect(urlsDeStorageEnHtml(html)).toEqual([`${BASE}/documentos/firmas/abc/contrato.png`]);
  });

  it("no repite la misma dirección aunque salga varias veces", () => {
    const u = `${BASE}/documentos/1/huella.png`;
    const html = `<img src="${u}"/><div>algo</div><img src="${u}"/>`;
    expect(urlsDeStorageEnHtml(html)).toEqual([u]);
  });

  it("saca varias distintas en un documento con firma y huella", () => {
    const html = `
      <div class="firma">${`<img src="${BASE}/documentos/1/firma.png"/>`}</div>
      <div class="huella">${`<img src="${BASE}/documentos/1/huella.png"/>`}</div>`;
    expect(urlsDeStorageEnHtml(html)).toEqual([
      `${BASE}/documentos/1/firma.png`,
      `${BASE}/documentos/1/huella.png`,
    ]);
  });

  it("devuelve vacío cuando el documento no trae ninguna imagen de la bodega", () => {
    // El estado de cuenta y el Paz y Salvo son así: puro texto y tablas.
    expect(urlsDeStorageEnHtml("<h2>Paz y Salvo</h2><table><tr><td>$ 202.000</td></tr></table>")).toEqual([]);
    expect(urlsDeStorageEnHtml("")).toEqual([]);
  });

  it("no confunde una foto externa ni un dataURL recién capturado", () => {
    const html = `<img src="data:image/png;base64,AAAA"/><img src="https://otrositio.com/foto.jpg"/>`;
    expect(urlsDeStorageEnHtml(html)).toEqual([]);
  });

  it("respeta comilla simple y url() de CSS", () => {
    const u = `${BASE}/documentos/1/fachada.jpg`;
    expect(urlsDeStorageEnHtml(`<img src='${u}'/>`)).toEqual([u]);
    expect(urlsDeStorageEnHtml(`<div style="background-image:url(${u})"></div>`)).toEqual([u]);
  });

  it("conserva el ?download que llevan los enlaces de descarga", () => {
    // Importa que no se corte ahí: `urlFirmada` le quita la parte de después del `?` para
    // calcular el camino del archivo, pero el reemplazo tiene que encontrar el texto COMPLETO
    // tal como está en el HTML, o no reemplaza nada.
    const html = `<a href="${BASE}/documentos/1/cedula.png?download">bajar</a>`;
    expect(urlsDeStorageEnHtml(html)).toEqual([`${BASE}/documentos/1/cedula.png?download`]);
  });

  it("aguanta nombres de archivo con acentos codificados y espacios en %20", () => {
    const u = `${BASE}/documentos/1/c%C3%A9dula%20frente.png`;
    expect(urlsDeStorageEnHtml(`<img src="${u}"/>`)).toEqual([u]);
  });

  it("ignora una URL de Storage que ya viene firmada", () => {
    // Las firmadas van por /object/sign/, no por /object/public/ — firmarlas otra vez las rompería.
    const firmada = "https://jvfkprkjysjffhzjitgl.supabase.co/storage/v1/object/sign/documentos/1/a.png?token=xyz";
    expect(urlsDeStorageEnHtml(`<img src="${firmada}"/>`)).toEqual([]);
  });
});
