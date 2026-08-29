import { describe, it, expect } from "vitest";
import { veredictoCuotas, TOPE_DURO_CUOTAS, CUOTAS_NORMALES } from "../components/ModalConvenio";

// DOS TOPES en vez de uno (decisión del dueño, 29-ago-2026). Antes un solo número (24) hacía dos
// trabajos que se estorbaban: atajar el error de dedo Y marcar la norma del negocio. Subirlo
// (12 → 24 → …) debilitaba la norma sin mejorar la red — contra un 60.000 dan igual 24 que 30.
describe("veredictoCuotas — el tope duro ataja errores, la norma solo avisa", () => {
  it("lo normal pasa sin ruido", () => {
    expect(veredictoCuotas(1)).toBe("ok");
    expect(veredictoCuotas(12)).toBe("ok");
    expect(veredictoCuotas(24)).toBe("ok");   // el límite exacto sigue siendo normal
  });

  it("pasar de 24 avisa pero NO bloquea — un convenio largo es mejor que uno impagable", () => {
    expect(veredictoCuotas(25)).toBe("excede-lo-normal");
    // JORGE (ZIB64G) debe $2.203.000: en 24 cuotas le tocaban $91.800 SOBRE su semana de
    // $195.000. En 44 baja a $50.100 y el acuerdo se vuelve pagable.
    expect(veredictoCuotas(44)).toBe("excede-lo-normal");
    expect(veredictoCuotas(60)).toBe("excede-lo-normal"); // el tope duro todavía no se pasa
  });

  it("el error de dedo real de XZN20H queda atajado igual que antes", () => {
    // Escribieron 60.000 en la casilla del NÚMERO de cuotas creyendo que era el valor:
    // cuotas de $9 durante 60.000 semanas, con fecha límite en el año 3176.
    expect(veredictoCuotas(60_000)).toBe("error-de-dedo");
    expect(veredictoCuotas(61)).toBe("error-de-dedo");
    expect(veredictoCuotas(505_000)).toBe("error-de-dedo");
  });

  it("los dos umbrales quedan escritos: si alguien los mueve, esto lo caza", () => {
    expect(CUOTAS_NORMALES).toBe(24);
    expect(TOPE_DURO_CUOTAS).toBe(60);
    expect(TOPE_DURO_CUOTAS).toBeGreaterThan(CUOTAS_NORMALES);
    // El anti-cuelgue de `periodosConvenioExigidos` (cicloPago) itera 200 veces: tiene que
    // cubrir el tope duro o un convenio válido quedaría contado a medias.
    expect(TOPE_DURO_CUOTAS).toBeLessThan(200);
  });
});
