import { describe, it, expect } from "vitest";
import { normalizarRef, pagoQueYaLaReclama, sinIdentificarDelDia, sinIdentificarSinGrupoDelDia } from "./useIngresosNoIdentificados";

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

// Esa plata SÍ entró a la empresa: está en la cuenta del banco. Lo que no entró es a la cuenta
// de un cliente. Por eso se muestra aparte del recaudo y nunca sumada a él: el día que aparezca
// el dueño se registra como pago y entra al recaudo de ESE MISMO día (la transferencia cuenta
// en el día del banco). Si ya estuviera dentro, quedaría contada dos veces.
const BOLSA = [
  { fecha_banco: "2026-08-03", monto: 202000, grupo: "COSTA" },
  { fecha_banco: "2026-08-03", monto: 100000, grupo: "COSTA" },
  { fecha_banco: "2026-08-03", monto: 60000, grupo: null },
  { fecha_banco: "2026-08-03", monto: 95000, grupo: "PRADERA" },
  { fecha_banco: "2026-07-25", monto: 102000, grupo: null },
];

describe("sinIdentificarDelDia", () => {
  it("suma toda la plata sin dueño que entró ese día, sin importar el grupo", () => {
    expect(sinIdentificarDelDia(BOLSA, "2026-08-03")).toBe(457000);
  });

  it("no se lleva la de otros días", () => {
    expect(sinIdentificarDelDia(BOLSA, "2026-07-25")).toBe(102000);
  });

  it("un día sin plata en espera da cero, no undefined", () => {
    expect(sinIdentificarDelDia(BOLSA, "2026-08-04")).toBe(0);
  });

  it("por grupo suma solo la de ese portafolio", () => {
    expect(sinIdentificarDelDia(BOLSA, "2026-08-03", "COSTA")).toBe(302000);
    expect(sinIdentificarDelDia(BOLSA, "2026-08-03", "PRADERA")).toBe(95000);
  });

  it("la que no tiene grupo NO se le cuela a ningún portafolio", () => {
    // Es la clave: el cierre es por grupo. Sumarle plata de dueño desconocido a COSTA sería
    // meterle al bolsillo de un socio una plata que quizá es de otro.
    const porGrupo = ["COSTA", "PRADERA", "RASTREADOR", "USADAS"]
      .reduce((s, g) => s + sinIdentificarDelDia(BOLSA, "2026-08-03", g), 0);
    expect(porGrupo).toBe(397000);
    expect(sinIdentificarDelDia(BOLSA, "2026-08-03")).toBe(457000);
    // Los $60.000 de diferencia son justamente la que no se le puede atribuir a nadie.
    expect(sinIdentificarSinGrupoDelDia(BOLSA, "2026-08-03")).toBe(60000);
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
