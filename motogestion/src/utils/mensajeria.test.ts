import { describe, it, expect } from "vitest";
import { textoCuentas } from "../hooks/useCuentasBancarias";
import { normalizarWhatsapp, ordenarVariables, decidirCanal, diasTexto, fmtPesos, urlWaMe, claveParaBalde, resumirTanda, nombreCorto, faltanEnPalabras, varsEstadoCuenta, lineaLegible, motivoEstadoCuenta } from "./mensajeria";
import { MENSAJES_DEFAULT, aplicarComodines } from "../hooks/useMensajesWhatsapp";

describe("nombreCorto — cómo se le habla al cliente (regla del dueño, 8-sep)", () => {
  it("dos primeras palabras, con mayúscula inicial", () => {
    expect(nombreCorto("JOSE ALBERTO DORIA RODRIGUEZ")).toBe("Jose Alberto");
    expect(nombreCorto("KEVIN ORTEGA")).toBe("Kevin Ortega");
    expect(nombreCorto("brader guzman watson")).toBe("Brader Guzman");
  });
  it("las partículas no cuentan como palabra y van en minúscula", () => {
    expect(nombreCorto("MARIA DE LOS ANGELES PEREZ")).toBe("Maria de los Angeles");
    expect(nombreCorto("JUAN DE LA CRUZ MORA")).toBe("Juan de la Cruz");
  });
  it("un solo nombre, vacío o con espacios de más", () => {
    expect(nombreCorto("BRADER")).toBe("Brader");
    expect(nombreCorto("  ANA   MARIA  ")).toBe("Ana Maria");
    expect(nombreCorto("")).toBe("");
    expect(nombreCorto(null)).toBe("");
  });
});

describe("envío masivo — el balde del panel Hoy decide el mensaje (mismo mapa que zala.cliente.plantilla_hoy)", () => {
  it("cada chip manda su plantilla", () => {
    expect(claveParaBalde("pagan-hoy")).toBe("dia_pago");
    expect(claveParaBalde("gabela")).toBe("gabela");
    expect(claveParaBalde("mora")).toBe("mora");
    expect(claveParaBalde("recoleccion")).toBe("recoleccion");
  });
  it("el resumen cuenta bien lo que salió, lo que quedó en cola y lo que falló", () => {
    const r = resumirTanda([
      { canal: "zala", estado: "enviado" }, { canal: "zala", estado: "leido" },
      { canal: "zala", estado: "en_cola" },
      { canal: "zala", estado: "fallo", motivo: "número sin WhatsApp" }, { canal: "zala", estado: "sin_conexion" },
      { canal: "ninguno", estado: "sin_numero" },
    ]);
    expect(r).toEqual({ salieron: 2, enCola: 1, fallaron: 2, noSalieron: 1 });
  });
});

describe("normalizarWhatsapp — un solo criterio para los 8 botones", () => {
  it("celular colombiano de 10 dígitos → le pone el 57", () => {
    expect(normalizarWhatsapp("3045342428")).toBe("573045342428");
    expect(normalizarWhatsapp("304 534 2428")).toBe("573045342428");
    expect(normalizarWhatsapp("+57 304-534-2428")).toBe("573045342428");
  });
  it("si ya trae el 57, lo respeta", () => {
    expect(normalizarWhatsapp("573045342428")).toBe("573045342428");
  });
  it("vacío o muy corto → null, para avisar en vez de abrir un enlace roto", () => {
    expect(normalizarWhatsapp("")).toBeNull();
    expect(normalizarWhatsapp(null)).toBeNull();
    expect(normalizarWhatsapp("12345")).toBeNull();
  });
});

describe("ordenarVariables — de comodines con nombre a {{1}} {{2}} de Meta", () => {
  it("respeta el orden que dice la fila de la plantilla, no el del objeto", () => {
    const r = ordenarVariables({ valor: "$202.000", nombre: "KEVIN", placa: "RLY45H" }, ["nombre", "placa", "valor"]);
    expect(r.valores).toEqual(["KEVIN", "RLY45H", "$202.000"]);
    expect(r.faltan).toEqual([]);
  });
  it("avisa cuál falta (Meta rechaza variables vacías)", () => {
    const r = ordenarVariables({ nombre: "KEVIN" }, ["nombre", "placa", "valor"]);
    expect(r.faltan).toEqual(["placa", "valor"]);
  });
  it("el que nunca registró un pago no puede armar el mensaje de mora", () => {
    // `dias` vacío = no hay último pago que nombrar. El mensaje se bloquea y se explica con palabras.
    const r = ordenarVariables({ nombre: "Jose Alberto", placa: "RLY45H", dias: "", vencida: "3 días", valor: "$202.000" },
                               ["nombre", "placa", "dias", "vencida", "valor"]);
    expect(r.faltan).toEqual(["dias"]);
    expect(faltanEnPalabras(r.faltan)).toBe("los días desde su último pago registrado");
  });
});

describe("decidirCanal — la regla del dueño (8-sep-2026)", () => {
  const num = "573045342428";
  it("sin ZALA conectada: WhatsApp para todo el mundo, tenga o no permiso", () => {
    expect(decidirCanal({ zalaActivo: false, tienePermiso: false, plantillaActiva: true, numero: num }).canal).toBe("whatsapp_web");
  });
  it("con ZALA conectada y permiso: sale por ZALA", () => {
    expect(decidirCanal({ zalaActivo: true, tienePermiso: true, plantillaActiva: true, numero: num }).canal).toBe("zala");
  });
  it("con ZALA conectada y SIN permiso: no sale, y NO hay respaldo por wa.me", () => {
    const r = decidirCanal({ zalaActivo: true, tienePermiso: false, plantillaActiva: true, numero: num });
    expect(r.canal).toBe("ninguno");
    expect(r.estado).toBe("sin_permiso");
  });
  it("sin número válido no sale por ningún canal", () => {
    expect(decidirCanal({ zalaActivo: false, tienePermiso: true, plantillaActiva: true, numero: null }).estado).toBe("sin_numero");
  });
  it("una clave desactivada no sale ni por respaldo", () => {
    expect(decidirCanal({ zalaActivo: false, tienePermiso: true, plantillaActiva: false, numero: num }).estado).toBe("sin_plantilla");
  });
});

describe("formatos que lee el cliente", () => {
  it("días con la palabra adentro (Meta no deja ponerla afuera sin que quede '1 días')", () => {
    expect(diasTexto(1)).toBe("1 día");
    expect(diasTexto(3)).toBe("3 días");
    expect(diasTexto(0)).toBe("0 días");
  });
  it("plata con puntos de mil", () => {
    expect(fmtPesos(202000)).toBe("$202.000");
  });
  it("el enlace de respaldo codifica el texto", () => {
    expect(urlWaMe("573045342428", "hola mundo")).toBe("https://wa.me/573045342428?text=hola%20mundo");
  });
});

// ── Las cuentas van en UN renglón (11-sep-2026) ──────────────────────────────
// Meta rechaza una variable de plantilla con salto de línea, y COSTA es el único grupo con dos
// cuentas: por eso era el único cuyo mensaje se caía o llegaba con una sola. La prueba amarra
// eso para que nadie vuelva a poner un "\n" ahí sin darse cuenta.
describe("textoCuentas", () => {
  const cuenta = (banco: string, numero: string, titular: string) => ({
    id: banco, banco, tipo: "Ahorros", numero, titular,
    grupos: ["COSTA"], activa: true, orden: 0, created_at: "",
  });

  it("nunca mete un salto de línea, ni con varias cuentas", () => {
    const t = textoCuentas([
      cuenta("Bancolombia", "78400006116", "Club moteros de la costa"),
      cuenta("Nequi", "3128317132", "Yeiner acosta"),
    ]);
    expect(t).not.toContain("\n");
    expect(t).toContain("78400006116");
    expect(t).toContain("3128317132");
  });

  it("las une con «y» para que se lean dentro de la frase", () => {
    const t = textoCuentas([
      cuenta("Bancolombia", "111", "Club"),
      cuenta("Nequi", "222", "Yeiner"),
    ]);
    expect(t).toBe("Bancolombia ahorros 111 (Club) y Nequi ahorros 222 (Yeiner)");
  });

  it("con una sola cuenta no inventa conectores", () => {
    expect(textoCuentas([cuenta("Nequi", "333", "Yeny")])).toBe("Nequi ahorros 333 (Yeny)");
  });

  it("sin cuentas devuelve vacío en vez de reventar", () => {
    expect(textoCuentas([])).toBe("");
  });
});

describe("estado de cuenta por WhatsApp — su propio mensaje (D-090, 17-nov)", () => {
  it("los cuatro datos: el valor es el «Debe hoy» que recibe, la fecha como en el impreso", () => {
    const v = varsEstadoCuenta({ nombre: "WILMER YARI RIOS BOSSIO", placa: "IGC41I", debeHoy: 250000, hoyISO: "2026-11-17" });
    expect(v).toEqual({ nombre: "WILMER YARI RIOS BOSSIO", placa: "IGC41I", fecha: "17 de noviembre de 2026", valor: "$250.000" });
    // Al día: dice $0, nunca una cuota ya pagada (regla de las cifras).
    expect(varsEstadoCuenta({ nombre: "X", placa: "ABC12D", debeHoy: 0, hoyISO: "2026-11-17" }).valor).toBe("$0");
  });

  it("sin placa no se arma: la tubería avisa «falta la placa» en vez de mandarlo a medias", () => {
    const v = varsEstadoCuenta({ nombre: "X", placa: null, debeHoy: 1000, hoyISO: "2026-11-17" });
    expect(ordenarVariables(v, ["nombre", "placa", "fecha", "valor"]).faltan).toEqual(["placa"]);
  });

  it("el texto de respaldo es el aprobado por el dueño, palabra por palabra", () => {
    const v = varsEstadoCuenta({ nombre: "Wilmer Yari", placa: "IGC41I", debeHoy: 250000, hoyISO: "2026-11-17" });
    expect(aplicarComodines(MENSAJES_DEFAULT.estado_cuenta, v)).toBe(
      "📋 Hola, Wilmer Yari. Bendiciones.\nLe compartimos el estado de cuenta de su moto IGC41I con corte al 17 de noviembre de 2026: hoy le falta por pagar $250.000.\nSi desea ver el detalle completo, toque el botón de abajo.\nQuedamos atentos.");
  });

  it("la línea oficial como la lee la gente", () => {
    expect(lineaLegible("573019058986")).toBe("301 905 8986");
    expect(lineaLegible("3019058986")).toBe("301 905 8986");
    expect(lineaLegible("")).toBeNull();
    expect(lineaLegible(null)).toBeNull();
  });

  it("si ZALA lo rechaza porque el cliente no ha escrito, el aviso dice qué hacer", () => {
    const r = motivoEstadoCuenta({ canal: "zala", estado: "fallo", motivo: "falta la plantilla" }, "301 905 8986");
    expect(r.motivo).toBe("No le ha escrito a la línea 301 905 8986 en las últimas 24 horas, y el estado de cuenta solo sale cuando él lo pide. Pídale que le escriba a esa línea y vuelva a tocar el botón.");
    expect(motivoEstadoCuenta({ canal: "zala", estado: "fallo", motivo: "falta la plantilla" }, null).motivo).toContain("la línea oficial");
  });

  it("cualquier otro resultado se muestra tal cual", () => {
    const enviado = { canal: "zala" as const, estado: "enviado" as const };
    expect(motivoEstadoCuenta(enviado, "301 905 8986")).toBe(enviado);
    const horario = { canal: "zala" as const, estado: "fallo" as const, motivo: "fuera del horario legal de cobro" };
    expect(motivoEstadoCuenta(horario, "301 905 8986")).toBe(horario);
  });
});
