import { describe, it, expect } from "vitest";
import { semanasACobrar, textoDeclaracion, htmlRodadoPorDeuda, pagaDeMasPorElPedazo, type CalculoRodado } from "./rodadoPorDeuda";

describe("rodado por deuda — la regla de las semanas de más (D-044)", () => {
  it("hasta 4 semanas, una más", () => {
    expect(semanasACobrar(1)).toBe(2);
    expect(semanasACobrar(3)).toBe(4);
    expect(semanasACobrar(4)).toBe(5);
  });
  it("desde la 5ª, una más por cada 2 completas (el par incompleto no suma)", () => {
    expect(semanasACobrar(5)).toBe(6);
    expect(semanasACobrar(6)).toBe(8);
    expect(semanasACobrar(7)).toBe(9);
    expect(semanasACobrar(8)).toBe(11);
    expect(semanasACobrar(10)).toBe(14);
  });
  it("sin semanas no hay nada que cobrar", () => {
    expect(semanasACobrar(0)).toBe(0);
  });
});

const caso: CalculoRodado = {
  puede: true, razones: [], avisos: [], contrato_id: "x", cliente: "Luis Fernando Solano", cedula: "123",
  placa: "EXT59H", valor_semana: 195000, hoy: "2026-10-07",
  antes: { cuotas: 200000, acuerdo: 0, deudas: 1455200, total: 1655200, estado: "mora", dias_mora: 10 },
  tiempo_total: 1655200, semanas_rodadas: 8, semanas_extra: 3, semanas_a_cobrar: 11,
  monto_rodado: 1560000, monto_a_cobrar: 2145000, sobrante: 95200,
  despues: { cuotas: 5000, acuerdo: 0, deudas: 90200, total: 95200, estado: "gabela", dias_mora: 0 },
  fecha_fin_antes: "2027-06-01", fecha_fin_aprox: "2027-08-17", deudas_no_rodables: [],
};

describe("rodado por deuda — lo que dice el cliente y el papel", () => {
  it("el video empieza con la fecha del día y dice sus cifras", () => {
    const t = textoDeclaracion(caso, "2026-10-07");
    expect(t.startsWith("Hoy, 7 de octubre de 2026")).toBe(true);
    expect(t).toContain("LUIS FERNANDO SOLANO");
    expect(t).toContain("8 semanas");
    expect(t).toContain("11 semanas");
    expect(t).toContain("17 de agosto de 2027");
    expect(t).toContain("no cubre el SOAT ni la tecnomecánica");
  });
  it("el documento lleva la advertencia del SOAT y la tecnomecánica y las cifras", () => {
    const h = htmlRodadoPorDeuda(caso);
    expect(h).toContain("no cubre el SOAT ni la revisión tecnomecánica");
    expect(h).toContain("$1.655.200");
    expect(h).toContain("11 semanas");
    expect(h).toContain("$95.200");
  });
});

// RODAR TODO (D-050/D-052, mig 201), con las cifras de OMAR AGUSTIN (RMM66H) del 23-oct: semanas
// atrasadas $537.000 (ya tenía $48.000 abonados de una) + al acuerdo le faltan $2.527.000 = $3.064.000.
// 15 semanas completas, sobran $139.000 (≥ $100.000) → se rueda una más sin recargo: 16 → 22 al final.
const omar: CalculoRodado = {
  puede: true, todo: true, razones: [], avisos: [], contrato_id: "x", cliente: "Omar Agustin Rodriguez Busto", cedula: "456",
  placa: "RMM66H", valor_semana: 195000, hoy: "2026-10-23",
  antes: { cuotas: 537000, acuerdo: 165000, deudas: 0, total: 702000, estado: "mora", dias_mora: 17 },
  debe_todo: 3064000, cuotas_rodables: 537000, tiempo_total: 3064000,
  semanas_completas: 15, pedazo: 139000, pedazo_se_rueda: true,
  cajas_corridas: 3, adelanto_proxima_semana: 48000, proxima_semana: 147000,
  semanas_rodadas: 16, semanas_extra: 6, semanas_a_cobrar: 22, monto_rodado: 3120000, monto_a_cobrar: 4290000, sobrante: 0,
  acuerdo: { convenio_id: "cv", numero: 1, cuota: 55000, falta_antes: 2527000, periodos_corridos: 0, monto_corrido: 2527000,
    fecha_limite_antes: "2027-08-16", fecha_limite_despues: "2027-08-16", deuda_total: 2692000, abonado: 165000, queda: 0 },
  despues: { cuotas: 0, acuerdo: 0, deudas: 0, total: 0, estado: "al-dia", dias_mora: 0 },
  fecha_fin_antes: "2027-09-14", fecha_fin_aprox: "2028-02-15", deudas_no_rodables: [],
};

describe("rodar todo — el pedazo y el papel (D-052)", () => {
  it("lo que paga de más por correr completa la semana del pedazo descuenta lo que ya tenía abonado", () => {
    // 16 × 195.000 = 3.120.000; debía 3.064.000 y los 48.000 abonados pasan a su próxima semana → 8.000 de más.
    expect(pagaDeMasPorElPedazo(omar)).toBe(8000);
    expect(pagaDeMasPorElPedazo({ ...omar, pedazo_se_rueda: false })).toBe(0);
    expect(pagaDeMasPorElPedazo(caso)).toBe(0);
  });
  it("el documento dice el total, el pedazo, que el acuerdo se cierra y su próxima semana", () => {
    const h = htmlRodadoPorDeuda(omar);
    expect(h).toContain("$3.064.000");
    expect(h).toContain("$139.000");
    expect(h).toContain("una semana completa más");
    expect(h).toContain("22 semanas");
    expect(h).toContain("queda cerrado");
    expect(h).toContain("$147.000");
    expect(h).toContain("no cubre el SOAT ni la revisión tecnomecánica");
  });
  it("la huella del registro va junto a la firma", () => {
    const h = htmlRodadoPorDeuda(omar, { firmaCliente: "data:image/png;base64,FIRMA", huellaCliente: "data:image/png;base64,HUELLA" });
    expect(h).toContain('class="huella" src="data:image/png;base64,HUELLA"');
  });
  it("el video dice que el acuerdo queda cerrado", () => {
    const t = textoDeclaracion(omar, "2026-10-23");
    expect(t.startsWith("Hoy, 23 de octubre de 2026")).toBe(true);
    expect(t).toContain("22 semanas");
    expect(t).toContain("acuerdo de pago queda cerrado");
    expect(t).toContain("mi próxima semana es de $147.000");
  });
});
