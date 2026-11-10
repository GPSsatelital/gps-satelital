import { describe, it, expect } from "vitest";
import { faltaFirmaHuella, exigeFirmaHuella } from "./firmaHuellaEfectivo";

// La misma regla que `public.falta_firma_huella()` (mig 215). Si una cambia y la otra no, la
// pantalla deja pasar un pago que la base frena, o frena uno que la base deja pasar.
const URL_FIRMA = "https://ejemplo/documentos/123/autorizacion_datos-1.png";
const URL_HUELLA = "https://ejemplo/documentos/123/autorizacion_datos_huella-1.png";
const URL_FOTO = "https://ejemplo/documentos/123/foto_perfil-1.jpg";

const completo = { autorizacion_datos_firma_url: URL_FIRMA, autorizacion_datos_huella_url: URL_HUELLA, foto_perfil_url: URL_FOTO };

describe("faltaFirmaHuella: qué le falta al cliente", () => {
  it("con la firma, la huella y la foto no le falta nada", () => {
    expect(faltaFirmaHuella(completo))
      .toEqual({ firma: false, huella: false, foto: false, cuantas: 0, texto: null });
  });

  it("sin ninguna de las tres, le faltan las tres", () => {
    expect(faltaFirmaHuella({ autorizacion_datos_firma_url: null, autorizacion_datos_huella_url: null, foto_perfil_url: null }))
      .toEqual({ firma: true, huella: true, foto: true, cuantas: 3, texto: "la firma, la huella y la foto" });
  });

  it("con la foto y sin firma ni huella, le faltan las dos", () => {
    expect(faltaFirmaHuella({ ...completo, autorizacion_datos_firma_url: null, autorizacion_datos_huella_url: null }))
      .toEqual({ firma: true, huella: true, foto: false, cuantas: 2, texto: "la firma y la huella" });
  });

  it("solo le falta la firma", () => {
    expect(faltaFirmaHuella({ ...completo, autorizacion_datos_firma_url: null }))
      .toEqual({ firma: true, huella: false, foto: false, cuantas: 1, texto: "la firma" });
  });

  it("solo le falta la huella", () => {
    expect(faltaFirmaHuella({ ...completo, autorizacion_datos_huella_url: "" }))
      .toEqual({ firma: false, huella: true, foto: false, cuantas: 1, texto: "la huella" });
  });

  it("solo le falta la foto (el caso más común: 113 clientes el 10-nov)", () => {
    expect(faltaFirmaHuella({ ...completo, foto_perfil_url: null }))
      .toEqual({ firma: false, huella: false, foto: true, cuantas: 1, texto: "la foto" });
  });

  it("le faltan la huella y la foto", () => {
    expect(faltaFirmaHuella({ ...completo, autorizacion_datos_huella_url: null, foto_perfil_url: null }).texto)
      .toBe("la huella y la foto");
  });

  it("un texto vacío o con solo espacios cuenta como que no está (igual que en la base)", () => {
    expect(faltaFirmaHuella({ ...completo, autorizacion_datos_firma_url: "   " }).texto).toBe("la firma");
    expect(faltaFirmaHuella({ ...completo, foto_perfil_url: "  " }).texto).toBe("la foto");
    expect(faltaFirmaHuella({}).texto).toBe("la firma, la huella y la foto");
  });

  it("sin cliente no frena en la pantalla: decide la base", () => {
    expect(faltaFirmaHuella(null).texto).toBeNull();
    expect(faltaFirmaHuella(undefined).texto).toBeNull();
  });
});

describe("exigeFirmaHuella: qué pagos la piden", () => {
  it("el efectivo de la oficina sí", () => {
    expect(exigeFirmaHuella("Efectivo")).toBe(true);
    expect(exigeFirmaHuella("Efectivo", "normal")).toBe(true);
  });

  it("el alquiler en efectivo de la moto prestada sí", () => {
    expect(exigeFirmaHuella("Efectivo", "alquiler_reemplazo")).toBe(true);
  });

  it("el cobro en campo no: el cliente no está en la oficina", () => {
    expect(exigeFirmaHuella("Efectivo", "campo")).toBe(false);
  });

  it("la transferencia no", () => {
    expect(exigeFirmaHuella("Transferencia")).toBe(false);
    expect(exigeFirmaHuella("Transferencia", "transferencia")).toBe(false);
  });

  it("los movimientos internos no: no entra plata nueva", () => {
    expect(exigeFirmaHuella("Efectivo", "saldo_favor")).toBe(false);
    expect(exigeFirmaHuella("Efectivo", "adelanto_base")).toBe(false);
  });
});
