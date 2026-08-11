import { describe, it, expect } from "vitest";
import { construirLineaTiempo, desglosarPago, type FuentesLT } from "./lineaTiempo";
import type { Contrato } from "../hooks/useContratos";
import type { Pago } from "../hooks/usePagos";
import type { Cliente } from "../hooks/useClientes";
import type { Moto } from "../hooks/useMotos";

// Estas pruebas congelan el comportamiento ACTUAL de la línea de tiempo, ANTES de agregarle
// la cesión de contrato (regla del repo: el build en verde no prueba que la regla se conservó).
//
// Lo que protegen es una sola idea: a quién le pertenece cada hecho. Hoy eso se resuelve por
// `contrato.cliente_id` — el titular de HOY. Cuando exista la cesión, un contrato podrá haber
// tenido varios titulares y estas mismas pruebas deben seguir pasando para los contratos que
// nunca se cedieron, que son todos los que hay en producción.

// Los tipos reales tienen decenas de columnas; acá solo importan las que la función lee.
const contrato = (p: Partial<Contrato>): Contrato => ({
  id: "ctr1", cliente_id: "cli1", moto_id: "mot1", forma_pago: "Semanal",
  valor_semanal: 202000, meses: 12, fecha_entrega: "2026-01-07",
  created_at: "2026-01-05T15:00:00Z", estado: "Activo", ...p,
} as unknown as Contrato);

const pago = (p: Partial<Pago>): Pago => ({
  id: "pag1", contrato_id: "ctr1", valor: 202000, fecha: "2026-02-04",
  created_at: "2026-02-04T15:00:00Z", estado: "Confirmado", metodo: "Efectivo",
  tipo_registro: "normal", ...p,
} as unknown as Pago);

const cliente = (p: Partial<Cliente>): Cliente => ({
  id: "cli1", nombre: "JUAN PEREZ", cedula: "123", created_at: "2026-01-02T15:00:00Z", ...p,
} as unknown as Cliente);

const moto = (p: Partial<Moto>): Moto => ({ id: "mot1", placa: "ABC12D", ...p } as unknown as Moto);

const vacias: FuentesLT = {
  contratos: [], pagos: [], gestiones: [], deudas: [], convenios: [],
  visitas: [], taller: [], prestamosDoc: [], clientes: [], motos: [], cesiones: [],
};
const fuentes = (p: Partial<FuentesLT>): FuentesLT => ({ ...vacias, ...p });

const ids = (evs: { id: string }[]) => evs.map(e => e.id);

describe("alcance — de quién es cada hecho", () => {
  it("la línea del cliente solo trae los contratos de ESE cliente", () => {
    const f = fuentes({
      contratos: [contrato({}), contrato({ id: "ctr2", cliente_id: "cli2", moto_id: "mot2" })],
      pagos: [pago({}), pago({ id: "pag2", contrato_id: "ctr2" })],
      clientes: [cliente({}), cliente({ id: "cli2", nombre: "ANA GOMEZ" })],
      motos: [moto({}), moto({ id: "mot2", placa: "XYZ99Z" })],
    });
    const ev = construirLineaTiempo({ clienteId: "cli1" }, f);
    expect(ids(ev)).toContain("pag-pag1");
    expect(ids(ev)).not.toContain("pag-pag2");
    expect(ids(ev)).not.toContain("ctr-ctr2");
  });

  // Es la lógica que la cesión va a extender: la moto conserva la historia de todos sus dueños.
  it("la línea de la MOTO trae los contratos de todos los que la tuvieron", () => {
    const f = fuentes({
      contratos: [
        contrato({ fecha_entrega: "2026-01-07" }),
        contrato({ id: "ctr2", cliente_id: "cli2", fecha_entrega: "2026-06-10", created_at: "2026-06-09T15:00:00Z" }),
      ],
      pagos: [pago({}), pago({ id: "pag2", contrato_id: "ctr2", fecha: "2026-07-01", created_at: "2026-07-01T15:00:00Z" })],
      clientes: [cliente({}), cliente({ id: "cli2", nombre: "ANA GOMEZ" })],
      motos: [moto({})],
    });
    const ev = construirLineaTiempo({ motoId: "mot1" }, f);
    expect(ids(ev)).toEqual(expect.arrayContaining(["pag-pag1", "pag-pag2", "ctr-ctr1", "ctr-ctr2"]));
  });

  it("en la línea de la moto cada pago dice de qué cliente es; en la del cliente no", () => {
    const f = fuentes({
      contratos: [contrato({})], pagos: [pago({})],
      clientes: [cliente({})], motos: [moto({})],
    });
    const enMoto = construirLineaTiempo({ motoId: "mot1" }, f).find(e => e.id === "pag-pag1");
    const enCliente = construirLineaTiempo({ clienteId: "cli1" }, f).find(e => e.id === "pag-pag1");
    expect(enMoto?.detalle).toContain("JUAN PEREZ");
    expect(enCliente?.detalle ?? "").not.toContain("JUAN PEREZ");
  });

  it("el registro del cliente y sus visitas solo salen en la línea del cliente", () => {
    const f = fuentes({
      contratos: [contrato({})],
      visitas: [{ id: "v1", cliente_id: "cli1", fecha: "2026-01-03", resultado: "Aprobada" }] as unknown as FuentesLT["visitas"],
      clientes: [cliente({})], motos: [moto({})],
    });
    expect(ids(construirLineaTiempo({ clienteId: "cli1" }, f))).toEqual(expect.arrayContaining(["cli-cli1", "vis-v1"]));
    expect(ids(construirLineaTiempo({ motoId: "mot1" }, f))).not.toContain("vis-v1");
  });
});

describe("ventanas — la moto tuvo varios dueños en el tiempo", () => {
  // Sin esto, el taller de la etapa del dueño siguiente le aparecía al anterior.
  const f = fuentes({
    contratos: [
      contrato({ fecha_entrega: "2026-01-07" }),
      contrato({ id: "ctr2", cliente_id: "cli2", fecha_entrega: "2026-06-10", created_at: "2026-06-09T15:00:00Z" }),
    ],
    taller: [
      { id: "t1", moto_id: "mot1", fecha_ingreso: "2026-03-02", fecha_salida: null },
      { id: "t2", moto_id: "mot1", fecha_ingreso: "2026-08-15", fecha_salida: null },
    ],
    clientes: [cliente({}), cliente({ id: "cli2", nombre: "ANA GOMEZ" })],
    motos: [moto({})],
  });

  it("al primer dueño solo le sale el taller de SU etapa", () => {
    const ev = ids(construirLineaTiempo({ clienteId: "cli1" }, f));
    expect(ev).toContain("tal-in-t1");
    expect(ev).not.toContain("tal-in-t2");
  });

  it("al segundo dueño solo le sale el taller posterior a su entrega", () => {
    const ev = ids(construirLineaTiempo({ clienteId: "cli2" }, f));
    expect(ev).toContain("tal-in-t2");
    expect(ev).not.toContain("tal-in-t1");
  });

  it("la línea de la MOTO los muestra los dos", () => {
    const ev = ids(construirLineaTiempo({ motoId: "mot1" }, f));
    expect(ev).toEqual(expect.arrayContaining(["tal-in-t1", "tal-in-t2"]));
  });
});

describe("reglas de contenido que no se pueden perder", () => {
  it("el cobro en campo no se duplica: se ve el pago, no la gestión", () => {
    const f = fuentes({
      contratos: [contrato({})],
      pagos: [pago({ tipo_registro: "campo" })],
      gestiones: [
        { id: "g1", contrato_id: "ctr1", tipo: "cobro_campo", fecha: "2026-02-04" },
        { id: "g2", contrato_id: "ctr1", tipo: "llamada", fecha: "2026-02-05" },
      ] as unknown as FuentesLT["gestiones"],
      clientes: [cliente({})], motos: [moto({})],
    });
    const ev = ids(construirLineaTiempo({ clienteId: "cli1" }, f));
    expect(ev).toContain("pag-pag1");
    expect(ev).not.toContain("ges-g1");
    expect(ev).toContain("ges-g2");
  });

  it("las gestiones de cobro son internas: no se imprimen", () => {
    const f = fuentes({
      contratos: [contrato({})],
      gestiones: [{ id: "g2", contrato_id: "ctr1", tipo: "llamada", fecha: "2026-02-05" }] as unknown as FuentesLT["gestiones"],
      clientes: [cliente({})], motos: [moto({})],
    });
    expect(construirLineaTiempo({ clienteId: "cli1" }, f).find(e => e.id === "ges-g2")?.interno).toBe(true);
  });

  it("un pago sin confirmar no muestra desglose (todavía no se repartió)", () => {
    const f = fuentes({
      contratos: [contrato({})],
      pagos: [pago({ estado: "Pendiente", aplicado_tarifa: 202000 } as Partial<Pago>)],
      clientes: [cliente({})], motos: [moto({})],
    });
    expect(construirLineaTiempo({ clienteId: "cli1" }, f).find(e => e.id === "pag-pag1")?.desglose).toBeUndefined();
  });

  it("ordena del más nuevo al más viejo", () => {
    const f = fuentes({
      contratos: [contrato({})],
      pagos: [
        pago({ id: "viejo", fecha: "2026-02-04", created_at: "2026-02-04T15:00:00Z" }),
        pago({ id: "nuevo", fecha: "2026-03-11", created_at: "2026-03-11T15:00:00Z" }),
      ],
      clientes: [cliente({})], motos: [moto({})],
    });
    const ev = ids(construirLineaTiempo({ clienteId: "cli1" }, f));
    expect(ev.indexOf("pag-nuevo")).toBeLessThan(ev.indexOf("pag-viejo"));
  });

  it("sin nada que mostrar devuelve una lista vacía, no revienta", () => {
    expect(construirLineaTiempo({ clienteId: "cli1" }, vacias)).toEqual([]);
  });
});

describe("con una cesión: la historia se reparte, no se reescribe", () => {
  // ana le cede a beto el 10-jun. El contrato es el MISMO (mismo id): solo cambia el titular.
  const contratos = [contrato({ cliente_id: "beto" })];
  const cesiones = [{ id: "ces1", contrato_id: "ctr1", cedente_id: "ana", cesionario_id: "beto", fecha: "2026-06-10" }];
  const f = fuentes({
    contratos, cesiones,
    pagos: [
      pago({ id: "antes", fecha: "2026-03-04", created_at: "2026-03-04T15:00:00Z" }),
      pago({ id: "despues", fecha: "2026-08-05", created_at: "2026-08-05T15:00:00Z" }),
    ],
    clientes: [cliente({ id: "ana", nombre: "ANA GOMEZ" }), cliente({ id: "beto", nombre: "BETO RUIZ" })],
    motos: [moto({})],
  });

  it("al que cedió NO se le vacía la ficha: conserva su contrato y sus pagos", () => {
    const ev = ids(construirLineaTiempo({ clienteId: "ana" }, f));
    expect(ev).toContain("pag-antes");
    expect(ev).toContain("ctr-ctr1");
  });

  it("al que recibió NO le aparecen pagos que nunca hizo", () => {
    const ev = ids(construirLineaTiempo({ clienteId: "beto" }, f));
    expect(ev).toContain("pag-despues");
    expect(ev).not.toContain("pag-antes");
  });

  it("el que recibió tampoco ve 'Contrato creado' ni la entrega: no fue suya", () => {
    const ev = ids(construirLineaTiempo({ clienteId: "beto" }, f));
    expect(ev).not.toContain("ctr-ctr1");
    expect(ev).not.toContain("ent-ctr1");
  });

  it("los dos ven el traspaso, cada uno redactado desde su lado", () => {
    const enAna = construirLineaTiempo({ clienteId: "ana" }, f).find(e => e.id === "ces-ces1");
    const enBeto = construirLineaTiempo({ clienteId: "beto" }, f).find(e => e.id === "ces-ces1");
    expect(enAna?.titulo).toContain("Le cedió el contrato a BETO RUIZ");
    expect(enBeto?.titulo).toContain("Recibió el contrato de ANA GOMEZ");
  });

  it("la línea de la MOTO conserva la historia completa y nombra al titular de cada fecha", () => {
    const ev = construirLineaTiempo({ motoId: "mot1" }, f);
    expect(ids(ev)).toEqual(expect.arrayContaining(["pag-antes", "pag-despues", "ces-ces1"]));
    expect(ev.find(e => e.id === "pag-antes")?.detalle).toContain("ANA GOMEZ");
    expect(ev.find(e => e.id === "pag-despues")?.detalle).toContain("BETO RUIZ");
  });

  // `ventanas` (moto) × `tramos` (contrato): sin cruzarlas, al que cedió le seguirían saliendo
  // los eventos de taller de la etapa del que recibió.
  it("el taller posterior a la cesión no le aparece al que cedió", () => {
    const conTaller = fuentes({
      ...f,
      taller: [
        { id: "t1", moto_id: "mot1", fecha_ingreso: "2026-02-20", fecha_salida: null },
        { id: "t2", moto_id: "mot1", fecha_ingreso: "2026-09-01", fecha_salida: null },
      ],
    });
    expect(ids(construirLineaTiempo({ clienteId: "ana" }, conTaller))).toContain("tal-in-t1");
    expect(ids(construirLineaTiempo({ clienteId: "ana" }, conTaller))).not.toContain("tal-in-t2");
    expect(ids(construirLineaTiempo({ clienteId: "beto" }, conTaller))).toContain("tal-in-t2");
    expect(ids(construirLineaTiempo({ clienteId: "beto" }, conTaller))).not.toContain("tal-in-t1");
  });
});

describe("desglosarPago — a qué se fue la plata", () => {
  it("el ahorro se ve en pantalla pero queda marcado como interno (no se imprime)", () => {
    const d = desglosarPago(pago({ aplicado_tarifa: 202000, aplicado_ahorro: 26000 } as Partial<Pago>));
    expect(d.find(x => x.k.includes("ahorro"))?.interno).toBe(true);
  });

  it("el alquiler de la moto prestada no se reparte: no toca el contrato", () => {
    expect(desglosarPago(pago({ tipo_registro: "alquiler_reemplazo", aplicado_tarifa: 27000 } as Partial<Pago>))).toEqual([]);
  });

  it("un saldo a favor negativo se lee como que USÓ su crédito, no que lo generó", () => {
    const d = desglosarPago(pago({ aplicado_tarifa: 100000, aplicado_saldo_favor: -50000 } as Partial<Pago>));
    expect(d.some(x => x.k.includes("Se usó de su saldo"))).toBe(true);
  });
});
