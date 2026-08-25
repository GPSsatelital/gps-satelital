import { describe, it, expect } from "vitest";
import { motosGuardadas, agruparGuardadas, type MotoIn, type RecepcionIn, type ContratoIn } from "./motosGuardadas";

// El reporte de las motos que no están produciendo (25-ago-2026). Casos reales del sistema:
// YAL54H (retenida por mora, en bodega) y una en taller.

const MOTOS: MotoIn[] = [
  { id: "m1", placa: "YAL54H", grupo: "PRADERA", estado: "Recuperada", subadmin_id: "s1" },
  { id: "m2", placa: "RMZ58H", grupo: "COSTA", estado: "Mantenimiento", subadmin_id: "s1" },
  { id: "m3", placa: "XZI10H", grupo: "COSTA", estado: "Asignada", subadmin_id: "s2" },   // NO guardada
  { id: "m4", placa: "DQW26I", grupo: "COSTA", estado: "Fiscalia", subadmin_id: null },
];
const RECEPCIONES: RecepcionIn[] = [
  { moto_id: "m1", motivo: "retencion_mora", ubicacion_destino: "bodega", created_at: "2026-08-21T10:00:00Z" },
  { moto_id: "m1", motivo: "otro", ubicacion_destino: "con_cliente", created_at: "2026-07-02T10:00:00Z" },  // la SACA, no cuenta
  { moto_id: "m2", motivo: "otro", ubicacion_destino: "taller", created_at: "2026-08-01T10:00:00Z" },
];
const CONTRATOS: ContratoIn[] = [
  { id: "c1", moto_id: "m1", cliente_id: "cl1", estado: "Suspendido" },
  { id: "c2", moto_id: "m2", cliente_id: "cl2", estado: "Activo" },
  { id: "c9", moto_id: "m4", cliente_id: "cl9", estado: "Finalizado" },   // ya cerrado: no cuenta
];
const CLIENTES = new Map([["cl1", "YAIR DIAZ PEREZ"], ["cl2", "NELSON ESTUPIÑAN"], ["cl9", "VIEJO"]]);
const SUBS = new Map([["s1", "BRANDON ROJAS"]]);

const run = (hoy = "2026-08-25") => motosGuardadas(MOTOS, RECEPCIONES, CONTRATOS, CLIENTES, SUBS, hoy);

describe("qué motos entran al reporte", () => {
  it("solo las guardadas: la Asignada no aparece", () => {
    const r = run();
    expect(r.map(x => x.placa).sort()).toEqual(["DQW26I", "RMZ58H", "YAL54H"]);
  });

  it("las más viejas van primero — son las que más duelen", () => {
    expect(run()[0].placa).toBe("RMZ58H");   // 24 días
  });
});

describe("desde cuándo, dónde y por qué — derivado de los hechos", () => {
  it("toma la última recepción que la GUARDÓ, no la que la sacó", () => {
    const y = run().find(x => x.placa === "YAL54H")!;
    expect(y).toMatchObject({ desde: "2026-08-21", dias: 4, donde: "bodega", motivo: "retencion_mora", sinRegistro: false });
  });

  it("cuenta los días hasta hoy", () => {
    expect(run("2026-09-01").find(x => x.placa === "YAL54H")!.dias).toBe(11);
  });

  it("sin recepción registrada lo DICE (no inventa fecha) y deriva dónde está del estado", () => {
    const d = run().find(x => x.placa === "DQW26I")!;
    expect(d).toMatchObject({ sinRegistro: true, desde: null, dias: null, donde: "Fiscalía" });
    expect(d.motivo).toContain("Fiscalía");
  });

  it("las etiquetas legibles se pueden traducir desde afuera", () => {
    const r = motosGuardadas(MOTOS, RECEPCIONES, CONTRATOS, CLIENTES, SUBS, "2026-08-25",
      m => m === "retencion_mora" ? "Retención por mora" : m,
      u => u === "bodega" ? "Bodega" : u);
    const y = r.find(x => x.placa === "YAL54H")!;
    expect(y.motivo).toBe("Retención por mora");
    expect(y.donde).toBe("Bodega");
  });
});

describe("de quién es cada moto guardada", () => {
  it("trae grupo, encargado y el cliente que la tenía", () => {
    const y = run().find(x => x.placa === "YAL54H")!;
    expect(y).toMatchObject({ grupo: "PRADERA", subadminNombre: "BRANDON ROJAS", clienteNombre: "YAIR DIAZ PEREZ" });
  });

  it("sin encargado asignado lo dice", () => {
    expect(run().find(x => x.placa === "DQW26I")!.subadminNombre).toBe("Sin asignar");
  });

  it("un contrato ya cerrado no cuenta como cliente actual", () => {
    expect(run().find(x => x.placa === "DQW26I")!.clienteNombre).toBe("— sin contrato");
  });
});

describe("agrupar para el informe", () => {
  it("por grupo, con los días acumulados de cada uno", () => {
    const g = agruparGuardadas(run(), f => f.grupo);
    expect(g[0].clave).toBe("COSTA");
    expect(g[0].filas.length).toBe(2);
    expect(g.find(x => x.clave === "PRADERA")!.dias).toBe(4);
  });

  it("por encargado", () => {
    const g = agruparGuardadas(run(), f => f.subadminNombre);
    expect(g.map(x => x.clave).sort()).toEqual(["BRANDON ROJAS", "Sin asignar"]);
  });
});
