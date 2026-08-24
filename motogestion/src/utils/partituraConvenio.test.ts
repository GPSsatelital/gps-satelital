import { describe, it, expect } from "vitest";
import { amortizarPartitura, plataAlConvenio, descuadrePartitura, type RenglonPartitura } from "./partituraConvenio";

// LA PARTITURA DE GEOVANNY (DPU58I) — el caso real que destapó todo (23-ago-2026):
// convenio de $925.000 firmado el lun 10-ago = resto de la semana del 3 + semana del 10 +
// deuda de migración + ajuste de redondeo (16 cuotas de $60.000 = $960.000… total pactado 925).
const GEOVANNY: RenglonPartitura[] = [
  { tipo: "semana", ref: 21, etiqueta: "Resto de la semana del lun 3 de agosto", monto: 2000 },
  { tipo: "semana", ref: 22, etiqueta: "Semana del lun 10 de agosto", monto: 202000 },
  { tipo: "deuda", ref: "d-mig", etiqueta: "Deuda de migración", monto: 521000 },
  { tipo: "ajuste", etiqueta: "Ajuste de redondeo de cuotas", monto: 200000 },
];

describe("el tachado en orden: cada peso vuelve a ser lo que en su esencia era", () => {
  it("GEOVANNY con $200.000 entrados: semana del 3 cubierta, la del 10 casi ($4.000 faltan)", () => {
    const { renglones, sobrante } = amortizarPartitura(GEOVANNY, 200000);
    expect(renglones[0]).toMatchObject({ pagado: 2000, cubierto: true });
    expect(renglones[1]).toMatchObject({ pagado: 198000, falta: 4000, cubierto: false });
    expect(renglones[2]).toMatchObject({ pagado: 0, cubierto: false });
    expect(sobrante).toBe(0);
  });

  it("con el convenio completo, TODO queda cubierto y la deuda envuelta en cero", () => {
    const { renglones, sobrante } = amortizarPartitura(GEOVANNY, 925000);
    expect(renglones.every(r => r.cubierto)).toBe(true);
    expect(renglones[2].falta).toBe(0);
    expect(sobrante).toBe(0);
  });

  it("sin plata entrada, nada está cubierto — la marca de la firma fue papel, no plata", () => {
    const { renglones } = amortizarPartitura(GEOVANNY, 0);
    expect(renglones.every(r => r.pagado === 0 && !r.cubierto)).toBe(true);
  });

  it("la plata de más no se esconde: queda visible como sobrante", () => {
    const { sobrante } = amortizarPartitura(GEOVANNY, 1000000);
    expect(sobrante).toBe(75000);
  });

  it("una entrada negativa (dato torcido) no revienta ni tacha nada", () => {
    const { renglones, entrada } = amortizarPartitura(GEOVANNY, -5000);
    expect(entrada).toBe(0);
    expect(renglones[0].pagado).toBe(0);
  });
});

describe("la plata entrada es EL MISMO conteo del motor y de la nómina", () => {
  it("solo pagos Confirmados y posteriores a la firma", () => {
    const total = plataAlConvenio([
      { estado: "Confirmado", created_at: "2026-08-15T10:00:00Z", aplicado_convenio: 200000 },
      { estado: "Pendiente", created_at: "2026-08-16T10:00:00Z", aplicado_convenio: 50000 },
      { estado: "Confirmado", created_at: "2026-08-01T10:00:00Z", aplicado_convenio: 99000 },   // antes de la firma
      { estado: "Confirmado", created_at: "2026-08-19T10:00:00Z", aplicado_convenio: 100000 },
    ], "2026-08-10T00:00:00Z");
    expect(total).toBe(300000);
  });
});

describe("el editor de los 53 viejos: la suma debe cuadrar con el total pactado", () => {
  it("cuadra exacto → descuadre 0", () => {
    expect(descuadrePartitura(GEOVANNY, 925000)).toBe(0);
  });
  it("si falta o sobra, el descuadre lo dice con signo", () => {
    expect(descuadrePartitura(GEOVANNY, 950000)).toBe(25000);
    expect(descuadrePartitura(GEOVANNY, 900000)).toBe(-25000);
  });
});
