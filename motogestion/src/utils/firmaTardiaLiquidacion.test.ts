import { describe, it, expect } from "vitest";
import { cambiosDeFirma } from "../hooks/useLiquidaciones";

// 🔴 LO QUE ESTA PRUEBA PROTEGE (24-sep-2026)
//
// Una liquidación CERRADA no puede retroceder de estado. El cierre ya movió plata, contrato y moto:
// si al firmar tardío se pusiera 'firmada', la pantalla diría una cosa y la base otra.
//
// Nació de una petición del dueño: los clientes que no pudieron venir el día del cierre aparecen
// después a firmar. Medido ese día: 24 de 44 liquidaciones cerradas SIN ninguna firma, $11.276.500
// en juego — entre ellas KELVIN SALAZAR (−$2.607.000) y ELIO QUIROGA (−$2.164.500).

const base = {
  docUrl: "https://x/firmado.pdf",
  firmaUrl: "https://x/firma.png",
  huellaUrl: "https://x/huella.png",
  fechaISO: "2026-09-24T21:00:00.000Z",
};

describe("cambiosDeFirma — firmar una liquidación", () => {
  it("antes del cierre: la firma la deja en 'firmada', como siempre", () => {
    const c = cambiosDeFirma({ ...base, yaCerrada: false });
    expect(c.estado).toBe("firmada");
  });

  it("🔴 YA CERRADA: NO se toca el estado", () => {
    const c = cambiosDeFirma({ ...base, yaCerrada: true });
    expect("estado" in c).toBe(false);
  });

  it("en los dos casos guarda la MISMA evidencia: firma, huella, fecha y el PDF", () => {
    for (const yaCerrada of [false, true]) {
      const c = cambiosDeFirma({ ...base, yaCerrada });
      expect(c.firma_cliente_url).toBe(base.firmaUrl);
      expect(c.huella_cliente_url).toBe(base.huellaUrl);
      expect(c.fecha_firma).toBe(base.fechaISO);
      expect(c.documento_firmado_url).toBe(base.docUrl);
    }
  });

  it("sin huella (el lector falló) guarda null, no se cae ni la inventa", () => {
    const c = cambiosDeFirma({ ...base, huellaUrl: null, yaCerrada: true });
    expect(c.huella_cliente_url).toBeNull();
    expect("estado" in c).toBe(false);
  });

  it("NUNCA escribe una cifra de la cuenta", () => {
    // La firma es evidencia, no plata. Si algún día alguien mete un monto acá, esto lo caza.
    const prohibidos = [
      "saldo_final", "total_deudas", "ahorro_acumulado", "costo_danos", "saldo_favor",
      "base_trasladada", "saldo_para_nueva", "detalle_deudas", "detalle_danos", "detalle_favor",
    ];
    for (const yaCerrada of [false, true]) {
      const c = cambiosDeFirma({ ...base, yaCerrada });
      for (const campo of prohibidos) expect(campo in c).toBe(false);
    }
  });
});
