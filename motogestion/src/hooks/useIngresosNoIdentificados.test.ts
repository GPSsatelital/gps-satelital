import { describe, it, expect } from "vitest";
import { normalizarRef, pagoQueYaLaReclama } from "./useIngresosNoIdentificados";

// La bolsa de "dinero sin identificar" es plata que entró al banco y nadie reclamó. El cruce
// automático solo mira hacia adelante: al registrar un pago y al confirmarlo. Si el pago se
// registró ANTES de que alguien anotara la partida, nadie las junta nunca y la partida se queda
// ahí figurando como sin dueño — disparando alertas y ensuciando el arqueo contra el banco.
//
// Esto es lo que alimenta el aviso "esta partida ya tiene un pago registrado" en Caja Diaria.

type PagoTest = { id: string; referencia?: string | null; estado?: string };

const PAGOS: PagoTest[] = [
  { id: "p1", referencia: "M16512027", estado: "Confirmado" },
  { id: "p2", referencia: "M21343984", estado: "Pendiente" },
  { id: "p3", referencia: "M99999999", estado: "Rechazado" },
  { id: "p4", referencia: null, estado: "Confirmado" },
  { id: "p5", referencia: "  m-21.608.192 ", estado: "Confirmado" },
];

describe("pagoQueYaLaReclama — cuándo SÍ avisa", () => {
  it("la referencia de la partida ya está en un pago confirmado", () => {
    expect(pagoQueYaLaReclama({ referencia: "M16512027" }, PAGOS)?.id).toBe("p1");
  });

  it("también si el pago está Pendiente de confirmar (la plata igual está anotada)", () => {
    expect(pagoQueYaLaReclama({ referencia: "M21343984" }, PAGOS)?.id).toBe("p2");
  });

  it("no se deja engañar por espacios, guiones, puntos ni minúsculas", () => {
    // Así se digita en la vida real: cada quien copia la referencia distinto.
    expect(pagoQueYaLaReclama({ referencia: "M21608192" }, PAGOS)?.id).toBe("p5");
  });
});

describe("pagoQueYaLaReclama — cuándo NO debe avisar", () => {
  it("un pago Rechazado no cuenta: ese dinero nunca entró", () => {
    expect(pagoQueYaLaReclama({ referencia: "M99999999" }, PAGOS)).toBeNull();
  });

  it("una referencia que no está en ningún pago", () => {
    expect(pagoQueYaLaReclama({ referencia: "M00000001" }, PAGOS)).toBeNull();
  });

  it("referencia demasiado corta → no se arriesga a emparejar por casualidad", () => {
    expect(pagoQueYaLaReclama({ referencia: "12" }, PAGOS)).toBeNull();
  });

  it("referencia vacía", () => {
    expect(pagoQueYaLaReclama({ referencia: "" }, PAGOS)).toBeNull();
  });

  it("nunca empareja contra un pago sin referencia", () => {
    expect(pagoQueYaLaReclama({ referencia: "M12345678" }, [{ id: "x", referencia: null }])).toBeNull();
  });
});

describe("normalizarRef", () => {
  it("quita espacios, guiones y puntos, y sube a mayúsculas", () => {
    expect(normalizarRef(" m-16.512 027 ")).toBe("M16512027");
  });
  it("NO quita otros caracteres: dos referencias distintas siguen siendo distintas", () => {
    // M063066617 trae un dígito más que las demás; si se "limpiara" de más, se confundiría
    // con otra y el sistema emparejaría plata de dos clientes.
    expect(normalizarRef("M063066617")).not.toBe(normalizarRef("M06306661"));
  });
});
