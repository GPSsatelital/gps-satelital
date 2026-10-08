import { describe, it, expect } from "vitest";
import { resumenFlota, entregasRecientes, vencimientosProximos, recaudoPorMes, paginar, ultimaEntregaDeCadaMoto, fotosDeLaEntrega } from "./portalSocio";

// El portal del socio muestra plata de un inversionista. Estas pruebas fijan lo que ve.

describe("cuántas motos producen y cuántas están quietas", () => {
  const flota = [
    { estado: "Asignada" }, { estado: "Asignada" }, { estado: "Asignada" },
    { estado: "Mantenimiento" }, { estado: "Mantenimiento" },
    { estado: "Disponible" },
    { estado: "Garantia" },
  ];

  it("produce la que está con un cliente; el resto es plata quieta", () => {
    const r = resumenFlota(flota);
    expect(r).toMatchObject({ total: 7, produciendo: 3, paradas: 4 });
  });

  it("dice POR QUÉ están quietas, de la razón más común a la menos", () => {
    expect(resumenFlota(flota).motivos).toEqual([
      { motivo: "en taller", cuantas: 2 },
      { motivo: "en garantía", cuantas: 1 },
      { motivo: "sin cliente", cuantas: 1 },
    ]);
  });

  it("lo dice en palabras del dueño de la plata, no en jerga del sistema", () => {
    expect(resumenFlota([{ estado: "Recuperada" }]).motivos[0].motivo).toBe("guardada");
    expect(resumenFlota([{ estado: "Fiscalia" }]).motivos[0].motivo).toBe("en fiscalía");
  });

  it("un grupo sin motos no revienta", () => {
    expect(resumenFlota([])).toEqual({ total: 0, produciendo: 0, paradas: 0, motivos: [] });
  });

  it("un estado que nadie previó no se pierde: sale como 'sin definir'", () => {
    expect(resumenFlota([{ estado: "InventadoMañana" }]).motivos).toEqual([{ motivo: "sin definir", cuantas: 1 }]);
  });
});

describe("las entregas recientes — la carta de presentación", () => {
  const c = (id: string, fecha: string | null, estado = "Activo", moto: string | null = "m") =>
    ({ id, cliente_id: "cl", moto_id: moto, fecha_entrega: fecha, estado });

  it("de la más nueva a la más vieja", () => {
    const r = entregasRecientes([c("a", "2026-06-01"), c("b", "2026-08-28"), c("c", "2026-07-15")]);
    expect(r.map(x => x.id)).toEqual(["b", "c", "a"]);
  });

  it("un contrato que nunca se entregó no es una entrega", () => {
    expect(entregasRecientes([c("sinfecha", null), c("enproceso", "2026-08-01", "En proceso")])).toEqual([]);
  });

  it("sin moto tampoco: no hay qué mostrar", () => {
    expect(entregasRecientes([c("x", "2026-08-01", "Activo", null)])).toEqual([]);
  });

  it("una entrega vieja ya liquidada SIGUE contando: pasó de verdad", () => {
    expect(entregasRecientes([c("liq", "2026-05-02", "Finalizado")]).map(x => x.id)).toEqual(["liq"]);
  });

  it("un contrato cancelado no: esa moto nunca se entregó", () => {
    expect(entregasRecientes([c("can", "2026-05-02", "Cancelado")])).toEqual([]);
  });

  it("respeta el límite", () => {
    const muchos = Array.from({ length: 30 }, (_, i) => c(`e${i}`, `2026-08-${String(i % 28 + 1).padStart(2, "0")}`));
    expect(entregasRecientes(muchos, 5)).toHaveLength(5);
  });
});

describe("las páginas de entregas — que no bajen todas las fotos a la vez", () => {
  const lista = Array.from({ length: 58 }, (_, i) => i + 1);

  it("PRADERA hoy: 58 entregas de a 6 son 10 páginas, la última con 4", () => {
    const p1 = paginar(lista, 1, 6);
    expect(p1.items).toEqual([1, 2, 3, 4, 5, 6]);
    expect(p1.totalPaginas).toBe(10);
    expect([p1.desde, p1.hasta, p1.total]).toEqual([1, 6, 58]);
    const ultima = paginar(lista, 10, 6);
    expect(ultima.items).toEqual([55, 56, 57, 58]);
    expect([ultima.desde, ultima.hasta]).toEqual([55, 58]);
  });

  it("una página que ya no existe se lleva a la más cercana, nunca a una vacía", () => {
    expect(paginar(lista, 99, 6).pagina).toBe(10);
    expect(paginar(lista, 0, 6).pagina).toBe(1);
    expect(paginar(lista, -3, 6).items).toHaveLength(6);
  });

  it("sin entregas: una sola página, vacía, que dice 0 de 0", () => {
    const r = paginar([], 1, 6);
    expect([r.pagina, r.totalPaginas, r.desde, r.hasta, r.total]).toEqual([1, 1, 0, 0, 0]);
  });
});

describe("las fotos de cada entrega — la portada es la persona con la moto", () => {
  const C1 = "9fb4219b-bcf4-453e-a7eb-25a87094fb4c";   // la entrega vieja de la moto (junio)
  const C2 = "83f2d711-d2cf-4be0-a5ed-3959f81af1f2";   // la entrega nueva (26-sep)
  const url = (contrato: string, foto: string) =>
    `https://x.supabase.co/storage/v1/object/public/documentos/entregas/${contrato}/${foto}.jpg`;
  const fotosDeLaNueva = Object.fromEntries(
    ["delantera", "lateral_izquierdo", "arriba", "lateral_derecho", "trasera", "persona"].map(f => [f, url(C2, f)]),
  );

  it("la de la persona va primero; las otras, en el orden en que se toman", () => {
    const r = fotosDeLaEntrega(C2, fotosDeLaNueva, true);
    expect(r[0]).toBe(url(C2, "persona"));
    expect(r.slice(1)).toEqual(["delantera", "lateral_izquierdo", "arriba", "lateral_derecho", "trasera"].map(f => url(C2, f)));
  });

  it("sin foto de la persona, la portada es la de adelante, como antes", () => {
    const { persona: _quitada, ...sinPersona } = fotosDeLaNueva;
    expect(fotosDeLaEntrega(C2, sinPersona, true)[0]).toBe(url(C2, "delantera"));
  });

  it("IEW47I: la tarjeta de la entrega vieja NO muestra las fotos (ni la cara) de la entrega nueva", () => {
    expect(fotosDeLaEntrega(C1, fotosDeLaNueva, false)).toEqual([]);
    // Aunque por error se la marcara como la última: el camino del archivo dice otro contrato.
    expect(fotosDeLaEntrega(C1, fotosDeLaNueva, true)).toEqual([]);
  });

  it("una foto sin el contrato en su camino solo se muestra en la última entrega de la moto", () => {
    const vieja = { delantera: "https://x.supabase.co/storage/v1/object/public/documentos/motos/IEW47I/frente.jpg" };
    expect(fotosDeLaEntrega(C2, vieja, true)).toHaveLength(1);
    expect(fotosDeLaEntrega(C1, vieja, false)).toEqual([]);
  });

  it("sin fotos o con huecos vacíos, no inventa nada", () => {
    expect(fotosDeLaEntrega(C2, null, true)).toEqual([]);
    expect(fotosDeLaEntrega(C2, { persona: "" }, true)).toEqual([]);
  });

  it("la última entrega de cada moto es la más nueva", () => {
    const entregas = [
      { id: "nueva", cliente_id: "b", moto_id: "m1", fecha_entrega: "2026-09-26", estado: "Activo" },
      { id: "otra", cliente_id: "c", moto_id: "m2", fecha_entrega: "2026-09-17", estado: "Activo" },
      { id: "vieja", cliente_id: "a", moto_id: "m1", fecha_entrega: "2026-06-20", estado: "Finalizado" },
    ];
    const u = ultimaEntregaDeCadaMoto(entregas);
    expect(u.get("m1")).toBe("nueva");
    expect(u.get("m2")).toBe("otra");
  });
});

describe("seguros y tecnomecánicas por vencer", () => {
  const HOY = "2026-09-04";

  it("lo ya vencido va de primero, con días en negativo", () => {
    const r = vencimientosProximos([
      { placa: "AAA11A", fecha_seguro: "2026-09-20", fecha_tecnomecanica: null },
      { placa: "BBB22B", fecha_seguro: "2026-08-30", fecha_tecnomecanica: null },
    ], HOY);
    expect(r[0]).toMatchObject({ placa: "BBB22B", que: "SOAT", dias: -5 });
    expect(r[1]).toMatchObject({ placa: "AAA11A", dias: 16 });
  });

  it("lo que vence lejos no molesta al socio", () => {
    expect(vencimientosProximos([{ placa: "X", fecha_seguro: "2027-01-01", fecha_tecnomecanica: null }], HOY)).toEqual([]);
  });

  it("una moto puede tener las dos cosas por vencer", () => {
    const r = vencimientosProximos([{ placa: "X", fecha_seguro: "2026-09-10", fecha_tecnomecanica: "2026-09-05" }], HOY);
    expect(r.map(x => x.que)).toEqual(["Tecnomecánica", "SOAT"]);
  });

  it("sin fechas cargadas no inventa alertas", () => {
    expect(vencimientosProximos([{ placa: "X", fecha_seguro: null, fecha_tecnomecanica: null }], HOY)).toEqual([]);
  });
});

describe("la tendencia del recaudo", () => {
  it("devuelve los meses del más viejo al más nuevo, con ceros donde no entró nada", () => {
    const r = recaudoPorMes([{ fecha: "2026-09-02", valor: 100 }, { fecha: "2026-07-15", valor: 50 }], "2026-09-04", 3);
    expect(r).toEqual([
      { mes: "2026-07", total: 50 },
      { mes: "2026-08", total: 0 },
      { mes: "2026-09", total: 100 },
    ]);
  });

  it("suma varios pagos del mismo mes", () => {
    const r = recaudoPorMes([{ fecha: "2026-09-01", valor: 10 }, { fecha: "2026-09-30", valor: 5 }], "2026-09-04", 1);
    expect(r).toEqual([{ mes: "2026-09", total: 15 }]);
  });

  it("un pago fuera de la ventana no se cuela", () => {
    expect(recaudoPorMes([{ fecha: "2025-01-01", valor: 999 }], "2026-09-04", 2).every(x => x.total === 0)).toBe(true);
  });

  it("cruza bien el cambio de año", () => {
    expect(recaudoPorMes([], "2026-01-15", 3).map(x => x.mes)).toEqual(["2025-11", "2025-12", "2026-01"]);
  });
});
