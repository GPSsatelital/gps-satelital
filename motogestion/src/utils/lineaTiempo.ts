import type { Pago } from "../hooks/usePagos";
import type { Contrato } from "../hooks/useContratos";
import type { Gestion } from "../hooks/useGestiones";
import type { Deuda } from "../hooks/useDeudas";
import type { Convenio } from "../hooks/useConvenios";
import type { Visita } from "../hooks/useVisitas";
import type { Moto } from "../hooks/useMotos";
import type { Cliente } from "../hooks/useClientes";
import type { PrestamoDoc } from "../hooks/usePrestamosDoc";
import { contratosDeCliente, tramosDeTitular, titularEnFecha, type CesionScope } from "../hooks/useCesiones";
import { fechaISO } from "./fecha";

// ── Línea de tiempo: todo lo que ha pasado con un cliente o una moto, en orden y
// explicado en español simple para que el funcionario no se equivoque con el cliente.
// Cada fuente aporta sus eventos; aquí se unifican, se ordenan y se redactan.

export type CategoriaEvento = "pago" | "cobranza" | "moto" | "contrato" | "cliente";

// `interno`: se ve en pantalla (el funcionario lo necesita) pero NO se imprime, porque el
// impreso se le entrega al cliente. Cubre el ahorro (decisión de negocio: no mostrárselo) y
// las notas de cobranza (sirena, recolección, plazos, GPS).
export type LineaDetalle = { k: string; v: string; tono?: "ok" | "bad" | "warn" | "muted"; interno?: boolean };

export type EventoLT = {
  id: string;
  fecha: string;            // YYYY-MM-DD para ordenar y agrupar
  orden: string;            // desempate fino (created_at) para el mismo día
  categoria: CategoriaEvento;
  icono: string;
  titulo: string;
  detalle?: string;
  desglose?: LineaDetalle[];
  tono?: "ok" | "bad" | "warn" | "accent" | "neutral";
  interno?: boolean;   // no se imprime (documento que recibe el cliente)
};

const fmt = (n: number) => `$ ${Math.round(n).toLocaleString("es-CO")}`;

/** Fecha del evento en hora de Colombia. Los timestamptz llegan en UTC: cortarlos con
 *  slice(0,10) mandaba al día siguiente todo lo registrado después de las 7 pm. Las
 *  columnas `date` (YYYY-MM-DD) ya vienen en fecha local y se dejan como están. */
const soloFecha = (s?: string | null) => {
  if (!s) return "";
  if (!s.includes("T")) return s.slice(0, 10);
  const d = new Date(s);
  return isNaN(d.getTime()) ? s.slice(0, 10) : fechaISO(d);
};

/** Cuánto de un pago fue a cada cosa. Lee las columnas nuevas y cae al jsonb viejo como
 *  respaldo (pagos antiguos). El ahorro NO usa `||`: $0 es un valor real con la regla
 *  tarifa-primero, y el `||` mostraría la cifra proporcional vieja ya corregida. */
export function desglosarPago(p: Pago): LineaDetalle[] {
  // El alquiler de la moto prestada NO se reparte a propósito (el motor lo excluye, mig 053):
  // no es un "pago antiguo" sin datos, simplemente no toca el contrato.
  if (p.tipo_registro === "alquiler_reemplazo") return [];
  const leg = (p.aplicado ?? {}) as Partial<Record<string, number>>;
  const cuota = (p.aplicado_tarifa ?? 0) || (leg.semana ?? 0);
  const deuda = (p.aplicado_deuda ?? 0) || (leg.deuda ?? 0);
  const conv = (p.aplicado_convenio ?? 0) || (leg.convenio ?? 0);
  const saldo = (p.aplicado_saldo_favor ?? 0) || (leg.saldo ?? 0);
  const prorr = p.aplicado_prorrateo ?? 0;
  const base = p.aplicado_base_inicial ?? 0;
  const ahorro = p.aplicado_ahorro ?? leg.ahorro ?? 0;

  const d: LineaDetalle[] = [];
  if (cuota > 0) d.push({ k: "Cubrió cuota del período", v: fmt(cuota) });
  if (prorr > 0) d.push({ k: "Cubrió los días iniciales", v: fmt(prorr) });
  if (base > 0) d.push({ k: "Abonó a la base inicial", v: fmt(base) });
  if (deuda > 0) d.push({ k: "Abonó a la deuda", v: fmt(deuda), tono: "warn" });
  if (conv > 0) d.push({ k: "Abonó al acuerdo de pago", v: fmt(conv), tono: "warn" });
  if (saldo > 0) d.push({ k: "Quedó como saldo a favor", v: fmt(saldo), tono: "ok" });
  if (saldo < 0) d.push({ k: "Se usó de su saldo a favor", v: fmt(Math.abs(saldo)), tono: "muted" });
  if (d.length === 0) return [];
  // El ahorro se ve en pantalla pero NO se imprime: misma decisión que el estado de cuenta.
  if (ahorro > 0) d.push({ k: "De la cuota, ahorro del cliente", v: fmt(ahorro), tono: "ok", interno: true });
  return d;
}

function tituloPago(p: Pago): { icono: string; titulo: string; detalle: string; tono: EventoLT["tono"] } {
  const v = fmt(p.valor);
  if (p.estado === "Rechazado") return { icono: "🚫", titulo: `Pago rechazado de ${v}`, detalle: "No cuenta para su cuenta.", tono: "bad" };
  const pend = p.estado === "Pendiente";
  switch (p.tipo_registro) {
    case "transferencia":
      return { icono: "🏦", titulo: `Transferencia de ${v}`, detalle: pend ? "Reportada con comprobante — falta que la secretaria la confirme." : "Confirmada por la secretaria.", tono: pend ? "warn" : "ok" };
    case "campo":
      return { icono: "🛵", titulo: `Cobro en campo de ${v}`, detalle: pend ? "Recogido en la calle — pendiente de confirmar en caja." : "Confirmado en caja.", tono: pend ? "warn" : "ok" };
    case "adelanto_base":
      return { icono: "🎫", titulo: `Semana adelantada de ${v}`, detalle: "Ya venía pagada dentro de la base inicial (no entró plata ese día).", tono: "accent" };
    case "saldo_favor": {
      // `valor` es el crédito COMPLETO que se mandó a aplicar; el motor solo llena las cajas
      // exigidas hoy y devuelve el resto al saldo. El consumo REAL queda en
      // aplicado_saldo_favor (negativo): usar ese, o le diríamos al cliente que gastó un
      // crédito que todavía tiene disponible.
      const ap = p.aplicado_saldo_favor;
      const usado = ap === null || ap === undefined ? p.valor : Math.abs(ap);
      const sobro = Math.max(p.valor - usado, 0);
      return {
        icono: "♻️",
        titulo: `Se usó saldo a favor: ${fmt(usado)}`,
        detalle: `Crédito que ya tenía guardado — no entró plata nueva.${sobro > 0 ? ` Sobraron ${fmt(sobro)} y siguen como saldo a favor.` : ""}`,
        tono: "accent",
      };
    }
    case "alquiler_reemplazo":
      return { icono: "🔄", titulo: `Alquiler de moto prestada: ${v}`, detalle: "Por usar una moto de reemplazo. No es cuota del contrato.", tono: "accent" };
    default:
      return { icono: "💵", titulo: `Pagó ${v} en efectivo`, detalle: pend ? "Pendiente de confirmar." : "", tono: pend ? "warn" : "ok" };
  }
}

const GESTION_INFO: Record<string, { icono: string; titulo: string; cat: CategoriaEvento; tono: EventoLT["tono"] }> = {
  mensaje_recordatorio: { icono: "💬", titulo: "Mensaje de cobro enviado", cat: "cobranza", tono: "neutral" },
  whatsapp:             { icono: "💬", titulo: "Mensaje de WhatsApp enviado", cat: "cobranza", tono: "neutral" },
  llamada:              { icono: "📞", titulo: "Llamada de cobro", cat: "cobranza", tono: "neutral" },
  sirena:               { icono: "📢", titulo: "Se activó la sirena de la moto", cat: "cobranza", tono: "warn" },
  visita:               { icono: "🚪", titulo: "Visita de cobro", cat: "cobranza", tono: "neutral" },
  plazo_extra:          { icono: "🕒", titulo: "Se le dio plazo extra", cat: "cobranza", tono: "warn" },
  recoleccion:          { icono: "🚚", titulo: "Orden de recoger la moto", cat: "moto", tono: "bad" },
  cobro_campo:          { icono: "🛵", titulo: "Cobro en campo", cat: "cobranza", tono: "neutral" },
  otro:                 { icono: "📝", titulo: "Gestión registrada", cat: "cobranza", tono: "neutral" },
};

export type FuentesLT = {
  contratos: Contrato[];
  pagos: Pago[];
  gestiones: Gestion[];
  deudas: Deuda[];
  convenios: Convenio[];
  visitas: Visita[];
  taller: { id: string; moto_id: string | null; estado_tecnico?: string | null; detalle?: string | null; costo?: number | null; fecha_ingreso?: string | null; fecha_salida?: string | null }[];
  prestamosDoc: PrestamoDoc[];
  clientes: Cliente[];
  motos: Moto[];
  // Obligatoria a propósito (no `cesiones?`): así el compilador señala cualquier pantalla que la
  // olvide. Si una la omitiera, ese cliente vería la historia de otro sin que nadie se entere.
  cesiones: (CesionScope & { id: string; created_at?: string })[];
};

/** Arma la línea de tiempo de un cliente (todos sus contratos/motos) o de una moto. */
export function construirLineaTiempo(
  objetivo: { clienteId?: string; motoId?: string },
  f: FuentesLT,
): EventoLT[] {
  const ev: EventoLT[] = [];
  const push = (e: EventoLT) => { if (e.fecha) ev.push(e); };

  // Alcance: qué contratos y motos entran según se pida por cliente o por moto.
  // Para un cliente son los que tiene HOY **más los que cedió**: toda su historia cuelga del
  // contrato, así que sin los cedidos su ficha quedaría en blanco el día que traspasa.
  const contratos = objetivo.clienteId
    ? contratosDeCliente(objetivo.clienteId, f.contratos, f.cesiones)
    : f.contratos.filter(c => c.moto_id === objetivo.motoId);
  const contratoIds = new Set(contratos.map(c => c.id));
  const motoIds = new Set(
    objetivo.motoId ? [objetivo.motoId] : contratos.map(c => c.moto_id).filter(Boolean) as string[],
  );
  const clienteIds = new Set(
    objetivo.clienteId ? [objetivo.clienteId] : contratos.map(c => c.cliente_id),
  );
  const placaDe = (id?: string | null) => f.motos.find(m => m.id === id)?.placa ?? "";
  const nombreDe = (id?: string | null) => f.clientes.find(c => c.id === id)?.nombre ?? "";
  // En la línea de una MOTO conviven varios clientes: cada evento dice de quién es.
  const deQuien = (clienteId?: string | null) =>
    objetivo.motoId && clienteId ? nombreDe(clienteId) : "";
  const conCliente = (txt: string | undefined, clienteId?: string | null) => {
    const n = deQuien(clienteId);
    return [txt, n ? `Cliente: ${n}` : ""].filter(Boolean).join(" · ") || undefined;
  };
  // Quién tenía el contrato EN ESA FECHA, no quién lo tiene hoy. Sin la fecha, tras una cesión
  // los pagos viejos saldrían a nombre del titular nuevo — le atribuiría a una persona la plata
  // que puso otra.
  const clienteDeContrato = (contratoId: string, fecha: string) =>
    titularEnFecha(contratoId, fecha, f.contratos, f.cesiones);

  // Ventana en que ESTE cliente tuvo cada moto: desde que se le entregó hasta que la recibió
  // otra persona. Sin esto, el taller o la tarjeta prestada de un dueño anterior/posterior se
  // le atribuían a este cliente.
  // Tramo del CONTRATO que le pertenece a este cliente. Es el hermano de `ventanas`: aquella
  // resuelve "esta MOTO tuvo varios dueños", esta resuelve "este CONTRATO tuvo varios
  // arrendatarios". Sin ella, al ceder, el que recibe hereda en pantalla todos los pagos que
  // nunca hizo y el que cedió los pierde.
  const tramos = new Map<string, { desde: string; hasta: string }[]>();
  if (objetivo.clienteId) {
    for (const c of contratos) tramos.set(c.id, tramosDeTitular(objetivo.clienteId, c, f.cesiones));
  }
  const enTramo = (contratoId: string, fecha: string) => {
    if (!objetivo.clienteId) return true;   // línea de la MOTO: la historia completa aplica
    if (!fecha) return false;
    const arr = tramos.get(contratoId);
    if (!arr || arr.length === 0) return false;
    return arr.some(t => fecha >= t.desde && fecha < t.hasta);
  };

  const ventanas = new Map<string, { desde: string; hasta: string }[]>();
  if (objetivo.clienteId) {
    for (const c of contratos) {
      if (!c.moto_id || !c.fecha_entrega) continue;
      const desde = soloFecha(c.fecha_entrega);
      const siguiente = f.contratos
        .filter(o => o.moto_id === c.moto_id && o.id !== c.id && o.fecha_entrega && soloFecha(o.fecha_entrega) > desde)
        .map(o => soloFecha(o.fecha_entrega))
        .sort()[0];
      const tope = siguiente ?? "9999-12-31";
      const arr = ventanas.get(c.moto_id) ?? [];
      // Se INTERSECTA con los tramos de titularidad: tras una cesión el cliente dejó de tener la
      // moto sin que apareciera un contrato nuevo sobre ella (es el mismo contrato). Sin cruzar
      // las dos cosas, al que cedió le seguirían saliendo el taller y la tarjeta prestada de la
      // etapa del que recibió.
      for (const t of tramos.get(c.id) ?? [{ desde: "0000-01-01", hasta: "9999-12-31" }]) {
        const d = t.desde > desde ? t.desde : desde;   // no antes de la entrega
        const h = t.hasta < tope ? t.hasta : tope;     // no después de que la moto cambie de manos
        if (d < h) arr.push({ desde: d, hasta: h });
      }
      ventanas.set(c.moto_id, arr);
    }
  }
  const enVentana = (motoId: string | null | undefined, fecha: string) => {
    if (!objetivo.clienteId) return true;         // línea de la moto: todo aplica
    if (!motoId || !fecha) return false;
    const arr = ventanas.get(motoId);
    if (!arr || arr.length === 0) return false;
    return arr.some(v => fecha >= v.desde && fecha < v.hasta);
  };

  // ── Cliente ───────────────────────────────────────────────────────────────
  // Solo en la línea de tiempo DEL CLIENTE: en la de una moto, el registro y las visitas de
  // cada persona que la tuvo son ruido (la ficha de la moto habla de la moto).
  const esDeCliente = !!objetivo.clienteId;
  for (const cl of esDeCliente ? f.clientes.filter(c => clienteIds.has(c.id)) : []) {
    push({
      id: `cli-${cl.id}`, fecha: soloFecha(cl.created_at), orden: cl.created_at ?? "",
      categoria: "cliente", icono: "👤", titulo: "Cliente registrado",
      detalle: cl.ingreso_inicial ? `Entregó ${fmt(cl.ingreso_inicial)} al registrarse.` : undefined,
      tono: "accent",
    });
  }

  // ── Visitas domiciliarias ─────────────────────────────────────────────────
  for (const v of esDeCliente ? f.visitas.filter(v => clienteIds.has(v.cliente_id)) : []) {
    const ok = (v.resultado ?? "").toLowerCase().includes("aprob");
    push({
      id: `vis-${v.id}`, fecha: soloFecha(v.fecha), orden: v.created_at ?? v.fecha,
      categoria: "cliente", icono: "🏠", titulo: `Visita domiciliaria${v.resultado ? ` — ${v.resultado}` : ""}`,
      detalle: v.ubicacion ? "Se registró la ubicación de la casa." : undefined,
      tono: ok ? "ok" : "neutral",
    });
  }

  // ── Contrato ──────────────────────────────────────────────────────────────
  for (const c of contratos) {
    const placa = placaDe(c.moto_id);
    // "Contrato creado" y "Se entregó la moto" son del titular ORIGINAL. A quien lo recibe por
    // cesión no le corresponden: él tiene su propio evento de recepción, más abajo.
    if (enTramo(c.id, soloFecha(c.created_at))) {
      push({
        id: `ctr-${c.id}`, fecha: soloFecha(c.created_at), orden: c.created_at ?? "",
        categoria: "contrato", icono: "📄", titulo: "Contrato creado",
        detalle: `${c.forma_pago} de ${fmt(c.valor_semanal ?? 0)}${c.meses ? ` · ${c.meses} meses` : ""}${objetivo.motoId ? ` · ${nombreDe(titularEnFecha(c.id, soloFecha(c.created_at), f.contratos, f.cesiones))}` : ""}`,
        tono: "accent",
      });
    }
    if (c.fecha_entrega && enTramo(c.id, soloFecha(c.fecha_entrega))) {
      push({
        id: `ent-${c.id}`, fecha: soloFecha(c.fecha_entrega), orden: c.fecha_entrega,
        categoria: "moto", icono: "🏍️", titulo: `Se entregó la moto${placa ? ` ${placa}` : ""}`,
        detalle: objetivo.motoId ? `A ${nombreDe(titularEnFecha(c.id, soloFecha(c.fecha_entrega), f.contratos, f.cesiones))}` : undefined,
        tono: "ok",
      });
    }
    if (c.empalme_cerrado && (c as { empalme_cerrado_fecha?: string }).empalme_cerrado_fecha
        && enTramo(c.id, soloFecha((c as { empalme_cerrado_fecha?: string }).empalme_cerrado_fecha))) {
      push({
        id: `emp-${c.id}`, fecha: soloFecha((c as { empalme_cerrado_fecha?: string }).empalme_cerrado_fecha),
        orden: (c as { empalme_cerrado_fecha?: string }).empalme_cerrado_fecha ?? "",
        categoria: "contrato", icono: "✅", titulo: "Se confirmaron sus saldos (empalme)",
        detalle: "Se revisaron con el cliente el ahorro y la deuda que traía.", tono: "ok",
      });
    }
    if ((c as { ubicacion_moto_validada_fecha?: string }).ubicacion_moto_validada_fecha
        && enTramo(c.id, soloFecha((c as { ubicacion_moto_validada_fecha?: string }).ubicacion_moto_validada_fecha))) {
      const res = (c as { ubicacion_moto_resultado?: string }).ubicacion_moto_resultado;
      push({
        id: `ubi-${c.id}`, fecha: soloFecha((c as { ubicacion_moto_validada_fecha?: string }).ubicacion_moto_validada_fecha),
        orden: (c as { ubicacion_moto_validada_fecha?: string }).ubicacion_moto_validada_fecha ?? "",
        categoria: "moto", icono: res === "coincide" ? "📍" : "⚠️",
        titulo: res === "coincide" ? "Se verificó dónde guarda la moto — coincide" : "Se verificó dónde guarda la moto — NO coincide",
        tono: res === "coincide" ? "ok" : "bad",
      });
    }
  }

  // ── Cesión del contrato ───────────────────────────────────────────────────
  // Filtrado SOLO por contrato, sin pasar por `enTramo`: la fecha de la cesión es justo el borde
  // (el final de uno y el comienzo del otro), así que ningún tramo la contiene entera. Los dos
  // deben verla — es el hecho que explica por qué su historia empieza o termina ahí.
  for (const x of f.cesiones.filter(x => contratoIds.has(x.contrato_id))) {
    const cede = x.cedente_id === objetivo.clienteId;
    const recibe = x.cesionario_id === objetivo.clienteId;
    push({
      id: `ces-${x.id}`, fecha: soloFecha(x.fecha), orden: x.created_at ?? x.fecha,
      categoria: "contrato",
      icono: cede ? "📤" : recibe ? "📥" : "🔁",
      titulo: cede ? `Le cedió el contrato a ${nombreDe(x.cesionario_id)}`
            : recibe ? `Recibió el contrato de ${nombreDe(x.cedente_id)}`
            : `Cambió de responsable: ${nombreDe(x.cedente_id)} → ${nombreDe(x.cesionario_id)}`,
      detalle: "El contrato siguió igual — solo cambió quién responde por él.",
      tono: "accent",
    });
  }

  // ── Pagos ─────────────────────────────────────────────────────────────────
  for (const p of f.pagos.filter(p => contratoIds.has(p.contrato_id) && enTramo(p.contrato_id, soloFecha(p.fecha)))) {
    const t = tituloPago(p);
    push({
      id: `pag-${p.id}`, fecha: soloFecha(p.fecha), orden: p.created_at ?? p.fecha,
      categoria: "pago", icono: t.icono, titulo: t.titulo,
      detalle: conCliente([t.detalle, p.folio ? `Recibo ${p.folio}` : ""].filter(Boolean).join(" · ") || undefined, clienteDeContrato(p.contrato_id, soloFecha(p.fecha))),
      desglose: p.estado === "Confirmado" ? desglosarPago(p) : undefined,
      tono: t.tono,
    });
  }

  // ── Deudas ────────────────────────────────────────────────────────────────
  for (const d of f.deudas.filter(d => contratoIds.has(d.contrato_id) && enTramo(d.contrato_id, soloFecha(d.created_at)))) {
    push({
      id: `deu-${d.id}`, fecha: soloFecha(d.created_at), orden: d.created_at,
      categoria: "pago", icono: "📌", titulo: `Se le cargó una deuda de ${fmt(d.monto)}`,
      detalle: conCliente(d.descripcion || d.concepto.replace(/_/g, " "), clienteDeContrato(d.contrato_id, soloFecha(d.created_at))),
      desglose: [
        { k: "Concepto", v: d.concepto.replace(/_/g, " ") },
        { k: "Le queda pendiente", v: fmt(d.monto_pendiente), tono: d.monto_pendiente > 0 ? "bad" : "ok" },
      ],
      tono: "warn",
    });
  }

  // ── Convenios ─────────────────────────────────────────────────────────────
  for (const cv of f.convenios.filter(c => contratoIds.has(c.contrato_id) && enTramo(c.contrato_id, soloFecha(c.created_at)))) {
    const anyv = cv as unknown as Record<string, unknown>;
    push({
      id: `cnv-${cv.id}`, fecha: soloFecha(cv.created_at), orden: cv.created_at,
      categoria: "pago", icono: "🤝", titulo: "Acuerdo de pago firmado",
      detalle: conCliente((anyv.concepto as string) || undefined, clienteDeContrato(cv.contrato_id, soloFecha(cv.created_at))),
      desglose: [
        { k: "Debía", v: fmt(Number(anyv.deuda_total ?? 0)) },
        { k: "Cuota pactada", v: fmt(Number(anyv.cuota_por_periodo ?? 0)) },
        { k: "Estado", v: String(anyv.estado ?? ""), tono: anyv.estado === "incumplido" ? "bad" : "muted" },
      ],
      tono: "warn",
    });
  }

  // ── Gestiones de cobro ────────────────────────────────────────────────────
  // 'cobro_campo' se omite: al cobrar en campo se registra el pago Y una gestión que repite
  // el mismo folio y monto — se veían dos eventos con la misma plata. El pago ya lo cuenta.
  for (const g of f.gestiones.filter(g => contratoIds.has(g.contrato_id) && g.tipo !== "cobro_campo" && enTramo(g.contrato_id, soloFecha(g.fecha)))) {
    const info = GESTION_INFO[g.tipo] ?? GESTION_INFO.otro;
    const extra: string[] = [];
    if (g.resultado) extra.push(g.resultado);
    if (g.fecha_compromiso) extra.push(`prometió pagar el ${g.fecha_compromiso}`);
    if (g.plazo_extra_fecha_limite) extra.push(`plazo hasta el ${g.plazo_extra_fecha_limite}`);
    push({
      id: `ges-${g.id}`, fecha: soloFecha(g.fecha), orden: g.created_at ?? g.fecha,
      categoria: info.cat, icono: info.icono, titulo: info.titulo,
      detalle: conCliente(extra.join(" · ") || undefined, clienteDeContrato(g.contrato_id, soloFecha(g.fecha))), tono: info.tono,
      interno: true, // gestión interna de cobranza: no va en el papel que recibe el cliente
    });
  }

  // ── Taller ────────────────────────────────────────────────────────────────
  for (const t of f.taller.filter(t => t.moto_id && motoIds.has(t.moto_id))) {
    if (t.fecha_ingreso && enVentana(t.moto_id, soloFecha(t.fecha_ingreso))) {
      push({
        id: `tal-in-${t.id}`, fecha: soloFecha(t.fecha_ingreso), orden: t.fecha_ingreso,
        categoria: "moto", icono: "🔧", titulo: "La moto entró al taller",
        detalle: t.detalle || undefined, tono: "warn",
      });
    }
    if (t.fecha_salida && enVentana(t.moto_id, soloFecha(t.fecha_salida))) {
      push({
        id: `tal-out-${t.id}`, fecha: soloFecha(t.fecha_salida), orden: t.fecha_salida,
        categoria: "moto", icono: "🔧", titulo: "La moto salió del taller",
        detalle: t.costo ? `Costó ${fmt(t.costo)}` : undefined, tono: "ok",
      });
    }
  }

  // ── Préstamo de tarjeta / llave ───────────────────────────────────────────
  for (const p of f.prestamosDoc.filter(p => motoIds.has(p.moto_id) && enVentana(p.moto_id, soloFecha(p.fecha_prestamo)))) {
    const que = p.tipo === "tarjeta" ? "la tarjeta de propiedad" : "una copia de la llave";
    push({
      id: `pdoc-${p.id}`, fecha: soloFecha(p.fecha_prestamo), orden: p.created_at ?? p.fecha_prestamo,
      categoria: "moto", icono: p.tipo === "tarjeta" ? "🪪" : "🔑",
      titulo: `Se le prestó ${que}`,
      detalle: [p.motivo, p.fecha_devolucion_esperada ? `debe devolverla el ${p.fecha_devolucion_esperada}` : ""].filter(Boolean).join(" · ") || undefined,
      tono: "warn",
    });
    if (p.fecha_devolucion) {
      push({
        id: `pdocd-${p.id}`, fecha: soloFecha(p.fecha_devolucion), orden: p.fecha_devolucion,
        categoria: "moto", icono: "✅", titulo: `Devolvió ${que}`, tono: "ok",
      });
    }
  }

  // Más nuevo primero; a igual día, desempata el registro más reciente.
  return ev.sort((a, b) => (b.fecha.localeCompare(a.fecha)) || (b.orden || "").localeCompare(a.orden || ""));
}

/** Agrupa por mes para que una historia larga se pueda leer. */
export function agruparPorMes(eventos: EventoLT[]): { mes: string; label: string; eventos: EventoLT[] }[] {
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const map = new Map<string, EventoLT[]>();
  for (const e of eventos) {
    const mes = e.fecha.slice(0, 7);
    if (!map.has(mes)) map.set(mes, []);
    map.get(mes)!.push(e);
  }
  return [...map.entries()].map(([mes, evs]) => {
    const [y, m] = mes.split("-");
    return { mes, label: `${MESES[Number(m) - 1] ?? ""} ${y}`, eventos: evs };
  });
}
