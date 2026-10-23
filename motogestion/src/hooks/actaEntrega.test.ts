import { describe, it, expect } from "vitest";
import { condicionesActaEntrega, generarHTMLActaEntrega } from "./useDocumentos";
import type { Contrato } from "./useContratos";
import type { Cliente } from "./useClientes";
import type { Moto } from "./useMotos";

// El ACTA DE ENTREGA (mig 202, 23-oct-2026): la lista de condiciones la aprobó el dueño. Estas pruebas
// cuidan que no se pierda ninguna y que el punto del ahorro diga lo de D-023, no lo contrario.

const contrato = {
  id: "c1", forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000, tarifa_diaria: 27000,
  tarifa_domingo: 14000, ahorro_diario: 4000, ahorro_domingo: 2000, meses: 24, total_cajas: 104,
  fecha_entrega: "2026-10-23",
} as unknown as Contrato;
const cliente = {
  id: "k1", nombre: "Juan Perez", cedula: "123", telefono: "3001112233", direccion: "Barrio Olaya Cl 5", acompanante_nombre: "Maria Lopez", acompanante_cedula: "456", acompanante_telefono: "3004445566", mismo_domicilio_acompanante: true,
} as unknown as Cliente;
const moto = { id: "m1", placa: "XYZ12H", marca: "Bajaj", modelo: "2026", color: "Negra", grupo: "COSTA" } as unknown as Moto;

describe("acta de entrega — las condiciones", () => {
  const c = condicionesActaEntrega(contrato).join(" ");
  it("son las 10 que aprobó el dueño", () => {
    expect(condicionesActaEntrega(contrato)).toHaveLength(10);
  });
  it("dicen el día de pago, la gabela, la multa y la lavada", () => {
    expect(c).toContain("Lunes");
    expect(c).toContain("1 día de gabela");
    expect(c).toContain("$ 30.000");
    expect(c).toContain("$ 15.000");
  });
  it("el contrato termina por pagos, con su total de semanas", () => {
    expect(c).toContain("termina cuando completa todos sus pagos");
    expect(c).toContain("104 semanas");
  });
  it("el ahorro compra la moto (D-023): no se le devuelve al terminar", () => {
    expect(c).toContain("para <b>comprar la moto</b>");
    expect(c).toContain("la moto pasa a su nombre");
    expect(c).toContain("descontando lo que deba");
    expect(c).not.toMatch(/se le entrega al final/i);
  });
  it("Cartagena, GPS, SOAT y daños", () => {
    expect(c).toContain("Prohibido salir de Cartagena");
    expect(c).toContain("GPS");
    expect(c).toContain("SOAT y tecnomecánica");
    expect(c).toContain("comparendos");
  });
});

describe("acta de entrega — el documento", () => {
  const html = generarHTMLActaEntrega(contrato, cliente, moto, {
    km: 1250, fotos: [{ label: "Delantera", url: "data:image/jpeg;base64,FOTO" }],
    checklist: [{ item: "Frenos funcionando correctamente", ok: true }, { item: "Espejos completos", ok: false }],
  }, { firmaCliente: "data:image/png;base64,FIRMA", huellaCliente: "data:image/png;base64,HUELLA", selloFecha: "Firmado digitalmente hoy" });

  it("dice quién recibe, qué moto y con cuántos km", () => {
    expect(html).toContain("ACTA DE ENTREGA DE MOTOCICLETA");
    expect(html).toContain("Juan Perez");
    expect(html).toContain("XYZ12H");
    expect(html).toContain("1.250 km");
    expect(html).toContain("Checklist 1 de 2");
  });
  it("lleva la foto, la firma, la huella y a la acompañante", () => {
    expect(html).toContain("data:image/jpeg;base64,FOTO");
    expect(html).toContain("data:image/png;base64,FIRMA");
    expect(html).toContain("data:image/png;base64,HUELLA");
    expect(html).toContain("MARIA LOPEZ");
    expect(html).toContain("Firmado digitalmente hoy");
  });
  it("trae los datos del cliente y del acompañante", () => {
    expect(html).toContain("Tel. 3001112233");
    expect(html).toContain("Barrio Olaya Cl 5");
    expect(html).toContain("Acompañante (codeudor)");
    expect(html).toContain("C.C. 456");
    expect(html).toContain("Tel. 3004445566");
    expect(html).toContain("mismo domicilio");
  });
  it("sin acompañante no pone su firma", () => {
    const solo = generarHTMLActaEntrega(contrato, { ...cliente, acompanante_nombre: null } as unknown as Cliente, moto,
      { km: null, fotos: [], checklist: [] });
    expect(solo).not.toContain("Acompañante (codeudor)");
  });
});
