import { supabase } from "../lib/supabase";
import { createTableStore } from "./createTableStore";
import { fechaISO } from "../utils/fecha";

// ── CESIÓN DE CONTRATO (mig 094) ─────────────────────────────────────────────
//
// Un cliente ya no puede seguir y le entrega a otro su contrato completo: los ahorros, las semanas
// ya pagadas y también lo que debe. Legalmente es una CESIÓN DE POSICIÓN CONTRACTUAL, no una
// novación: el contrato NO termina ni se recrea, solo cambia quién responde por él.
//
// Por eso acá se cambia UNA sola cosa: `contratos.cliente_id`. Todo el motor de cajas vive en
// columnas de `contratos`, y pagos/deudas/convenios/gestiones cuelgan solo de `contrato_id` — se
// mueven solos, sin tocar un peso. Recrear el contrato obligaría a re-teclear a mano cada cifra.
//
// 🔴 EL PRECIO DE ESE DISEÑO, Y CÓMO SE PAGA: si solo se cambiara el titular, toda la historia del
// contrato (que cuelga de `contrato_id`) pasaría a verse como del cliente nuevo — al anterior se le
// vaciaría la ficha y al nuevo le aparecerían pagos que nunca hizo. Las funciones puras de este
// archivo son las que reparten cada hecho a quien de verdad le pertenece, según la fecha.
//
// Viven acá y no dentro de `lineaTiempo.ts` porque las consumen cuatro pantallas distintas
// (línea de tiempo, ficha del cliente, historial de pagos y reportes). Mismo criterio que
// `motoDelPortafolio`/`grupoDePago` en usePrestamos.ts: una sola fuente, o una pantalla termina
// contando distinto que otra.

export type Cesion = {
  id: string;
  contrato_id: string;
  cedente_id: string;
  cesionario_id: string;
  fecha: string;                 // YYYY-MM-DD — el borde que parte la historia
  ahorro_acumulado: number;
  ahorro_apertura: number;
  saldo_favor: number;
  deuda_total: number;
  deuda_detalle: { concepto: string; pendiente: number }[] | null;
  convenio_saldo: number | null;
  convenio_cuota: number | null;
  convenio_cuotas_restantes: number | null;
  cajas_pagadas: number | null;
  total_cajas: number | null;
  caja_actual_pagado: number | null;
  valor_periodo: number | null;
  forma_pago: string | null;
  dia_pago_label: string | null;
  moto_placa: string | null;
  firma_cedente_url: string | null;
  huella_cedente_url: string | null;
  firma_cesionario_url: string | null;
  huella_cesionario_url: string | null;
  huella_acompanante_url: string | null;
  documento_firmado_url: string | null;
  pagare_url: string | null;
  certificado_url: string | null;
  motivo: string | null;
  registrado_por: string | null;
  created_at: string;
};

/** Lo mínimo que estas funciones necesitan de una cesión. Así las puede usar quien tenga solo
 *  las columnas del alcance, sin cargar el retrato completo. */
export type CesionScope = Pick<Cesion, "contrato_id" | "cedente_id" | "cesionario_id" | "fecha">;

const FIN = "9999-12-31";      // "sigue siendo suyo hasta hoy"
const INICIO = "0000-01-01";   // antes de que existiera cualquier registro

/** Día del evento en hora de Colombia. Los `timestamptz` llegan en UTC: cortarlos a secas mandaría
 *  al día siguiente todo lo registrado después de las 7 pm — y justo en el borde de una cesión eso
 *  le pasaría un pago de una persona a la otra. Las columnas `date` ya vienen locales.
 *  La normalización vive ACÁ y no en cada pantalla: así ninguna puede olvidarla. */
const soloDia = (s: string) => {
  if (!s) return "";
  if (!s.includes("T")) return s.slice(0, 10);
  const d = new Date(s);
  return isNaN(d.getTime()) ? s.slice(0, 10) : fechaISO(d);
};

/**
 * Los contratos que este cliente tiene HOY más los que tuvo y cedió.
 *
 * Sin la segunda mitad, el día que alguien cede su contrato se queda con la ficha en blanco: toda
 * su historia (pagos, deudas, convenios, gestiones) cuelga del contrato, y el contrato ya no
 * figura como suyo. Habría trabajado meses y el sistema diría que nunca fue cliente.
 */
export function contratosDeCliente<T extends { id: string; cliente_id: string }>(
  clienteId: string, contratos: T[], cesiones: CesionScope[],
): T[] {
  const cedidos = new Set(
    cesiones.filter(c => c.cedente_id === clienteId).map(c => c.contrato_id),
  );
  return contratos.filter(c => c.cliente_id === clienteId || cedidos.has(c.id));
}

/**
 * Los tramos `[desde, hasta)` en que este cliente fue el titular de ESE contrato.
 *
 * Devuelve un array y no un par único porque un contrato puede volver a manos de alguien que ya
 * lo tuvo (A→B→A). Con un solo par, la segunda etapa de A se perdería.
 *
 * El borde es SEMIABIERTO: `desde <= fecha < hasta`. O sea, **el día de la cesión ya cuenta para
 * quien recibe**. Es el mismo criterio que usa `enVentana` en lineaTiempo.ts para las motos, y
 * tiene que ser uno solo: si un pago del día de la cesión cayera en los dos lados, la plata se
 * vería dos veces.
 *
 * El titular original NO sale de `contrato.cliente_id` — ese ya es el de HOY. Sale del cedente de
 * la primera cesión. Con dos cesiones encadenadas, `cliente_id` no sabe nada del primero.
 */
export function tramosDeTitular(
  clienteId: string,
  contrato: { id: string; cliente_id: string },
  cesiones: CesionScope[],
): { desde: string; hasta: string }[] {
  const delContrato = cesiones
    .filter(c => c.contrato_id === contrato.id)
    .map(c => ({ f: soloDia(c.fecha), de: c.cedente_id, a: c.cesionario_id }))
    .sort((x, y) => x.f.localeCompare(y.f));

  let titular = delContrato.length ? delContrato[0].de : contrato.cliente_id;
  let desde = INICIO;
  const tramos: { desde: string; hasta: string }[] = [];
  for (const c of delContrato) {
    if (titular === clienteId) tramos.push({ desde, hasta: c.f });
    titular = c.a;
    desde = c.f;
  }
  if (titular === clienteId) tramos.push({ desde, hasta: FIN });
  return tramos;
}

/** ¿Este hecho (contrato + fecha) le pertenece a este cliente? */
export function esDeSuTramo(
  clienteId: string, contratoId: string, fecha: string,
  contratos: { id: string; cliente_id: string }[], cesiones: CesionScope[],
): boolean {
  if (!fecha) return false;
  const c = contratos.find(x => x.id === contratoId);
  if (!c) return false;
  const d = soloDia(fecha);
  return tramosDeTitular(clienteId, c, cesiones).some(t => d >= t.desde && d < t.hasta);
}

/**
 * Quién era el titular del contrato en esa fecha.
 *
 * La usan la ficha de la MOTO (donde conviven varios clientes y cada evento dice de quién es) y el
 * historial de pagos. Sin ella, un pago de hace seis meses saldría a nombre de quien tiene el
 * contrato hoy — le atribuiría a una persona la plata que puso otra.
 */
export function titularEnFecha(
  contratoId: string, fecha: string,
  contratos: { id: string; cliente_id: string }[], cesiones: CesionScope[],
): string | null {
  const c = contratos.find(x => x.id === contratoId);
  if (!c) return null;
  const delContrato = cesiones
    .filter(x => x.contrato_id === contratoId)
    .map(x => ({ f: soloDia(x.fecha), de: x.cedente_id, a: x.cesionario_id }))
    .sort((x, y) => x.f.localeCompare(y.f));
  if (delContrato.length === 0) return c.cliente_id;

  const d = soloDia(fecha);
  let titular = delContrato[0].de;
  for (const x of delContrato) {
    if (d < x.f) return titular;   // todavía no había pasado esta cesión
    titular = x.a;
  }
  return titular;
}

/**
 * Se registró como "recibe un contrato por cesión" (no pagó base) pero la cesión todavía no ocurre.
 *
 * Es una marca DERIVADA, no una bandera guardada: desaparece sola cuando aparece su fila de cesión.
 * Las banderas que hay que apagar a mano siempre terminan quedándose prendidas.
 */
export function cesionPendienteDeCliente(
  cliente: { id: string; ingreso_por_cesion?: boolean | null }, cesiones: CesionScope[],
): boolean {
  if (!cliente.ingreso_por_cesion) return false;
  return !cesiones.some(c => c.cesionario_id === cliente.id);
}

const store = createTableStore<Cesion>("cesiones_contrato");

/** El retrato del estado de cuenta que se congela al ceder. Lo calcula la pantalla (una sola vez)
 *  y se usa el MISMO objeto para el acta impresa, para que el papel nunca diga una cifra distinta
 *  a la que vieron las dos personas. */
export type SnapshotCesion = {
  ahorro_acumulado: number;
  ahorro_apertura: number;
  saldo_favor: number;
  deuda_total: number;
  deuda_detalle: { concepto: string; pendiente: number }[];
  convenio_saldo: number | null;
  convenio_cuota: number | null;
  convenio_cuotas_restantes: number | null;
  cajas_pagadas: number | null;
  total_cajas: number | null;
  caja_actual_pagado: number | null;
  valor_periodo: number | null;
  forma_pago: string | null;
  dia_pago_label: string | null;
  moto_placa: string | null;
};

export function useCesiones() {
  const { data: cesiones, loading } = store.useStore();

  const cesionesDeContrato = (contratoId: string) =>
    cesiones.filter(c => c.contrato_id === contratoId)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

  /**
   * Pasa el contrato del cedente al cesionario.
   *
   * El ORDEN de los pasos está copiado de `prestarReemplazo` y no es cosmético:
   *  1. la evidencia primero (si no sube la firma, no se registra nada),
   *  2. el registro antes del cambio — esa fila es la ÚNICA que dice quién era el titular
   *     anterior; si el cambio fuera primero y el registro fallara, el contrato quedaría a
   *     nombre del nuevo sin nada que dijera de dónde vino,
   *  3. y si el cambio falla, se borra el registro para no dejar una cesión fantasma.
   *
   * Los estados de los dos clientes van AL FINAL a propósito: el trigger de la mig 019 solo deja
   * cambiarlos a ADMIN para arriba. Si fallan, la cesión ya quedó hecha y solo faltan dos estados
   * que se corrigen a mano — nunca al revés.
   */
  async function cederContrato(params: {
    contratoId: string;
    cedenteId: string;
    cesionarioId: string;
    fecha: string;
    snapshot: SnapshotCesion;
    evidencia: {
      firmaCedente?: string | null; huellaCedente?: string | null;
      firmaCesionario?: string | null; huellaCesionario?: string | null;
      huellaAcompanante?: string | null;
      documentoFirmado?: string | null; pagare?: string | null; certificado?: string | null;
    };
    motivo?: string | null;
    registradoPor: string | null;
  }): Promise<{ error: string | null; cesionId?: string }> {
    const { contratoId, cedenteId, cesionarioId, fecha, snapshot, evidencia } = params;

    // 0. Relectura fresca: entre que se mostró el retrato y ahora, otro cajero pudo registrar un
    //    pago. Guardar el retrato viejo sería congelar en el acta una cifra que ya no es cierta.
    const { data: ctrFresco, error: errLee } = await supabase
      .from("contratos")
      .select("cliente_id, estado, cajas_pagadas, caja_actual_pagado, ahorro_acumulado, ahorro_apertura")
      .eq("id", contratoId).single();
    if (errLee) return { error: errLee.message };
    if (!ctrFresco) return { error: "No se encontró el contrato." };
    if (ctrFresco.cliente_id !== cedenteId) {
      return { error: "El contrato ya no está a nombre de quien iba a ceder. Vuelve a abrir la cesión." };
    }
    const cambio =
      Number(ctrFresco.cajas_pagadas ?? 0) !== Number(snapshot.cajas_pagadas ?? 0) ||
      Number(ctrFresco.caja_actual_pagado ?? 0) !== Number(snapshot.caja_actual_pagado ?? 0) ||
      Number(ctrFresco.ahorro_acumulado ?? 0) !== Number(snapshot.ahorro_acumulado ?? 0) ||
      Number(ctrFresco.ahorro_apertura ?? 0) !== Number(snapshot.ahorro_apertura ?? 0);
    if (cambio) {
      return { error: "Los números cambiaron mientras revisabas (alguien registró un pago). Vuelve a abrir la cesión para que el acta salga con las cifras correctas." };
    }

    // 1. REGISTRO (la evidencia ya viene subida por la pantalla: si algo falló allá, no se llama acá).
    const { data: ces, error: errIns } = await supabase.from("cesiones_contrato").insert({
      contrato_id: contratoId,
      cedente_id: cedenteId,
      cesionario_id: cesionarioId,
      fecha,
      ahorro_acumulado: snapshot.ahorro_acumulado,
      ahorro_apertura: snapshot.ahorro_apertura,
      saldo_favor: snapshot.saldo_favor,
      deuda_total: snapshot.deuda_total,
      deuda_detalle: snapshot.deuda_detalle,
      convenio_saldo: snapshot.convenio_saldo,
      convenio_cuota: snapshot.convenio_cuota,
      convenio_cuotas_restantes: snapshot.convenio_cuotas_restantes,
      cajas_pagadas: snapshot.cajas_pagadas,
      total_cajas: snapshot.total_cajas,
      caja_actual_pagado: snapshot.caja_actual_pagado,
      valor_periodo: snapshot.valor_periodo,
      forma_pago: snapshot.forma_pago,
      dia_pago_label: snapshot.dia_pago_label,
      moto_placa: snapshot.moto_placa,
      firma_cedente_url: evidencia.firmaCedente ?? null,
      huella_cedente_url: evidencia.huellaCedente ?? null,
      firma_cesionario_url: evidencia.firmaCesionario ?? null,
      huella_cesionario_url: evidencia.huellaCesionario ?? null,
      huella_acompanante_url: evidencia.huellaAcompanante ?? null,
      documento_firmado_url: evidencia.documentoFirmado ?? null,
      pagare_url: evidencia.pagare ?? null,
      certificado_url: evidencia.certificado ?? null,
      motivo: params.motivo ?? null,
      registrado_por: params.registradoPor,
    }).select("id").single();
    if (errIns) {
      // El candado (contrato_id, fecha) de la mig 094 traducido a algo que se entienda.
      if (errIns.code === "23505") return { error: "Ya se registró una cesión de este contrato hoy." };
      return { error: errIns.message };
    }

    // 2. EL CAMBIO DE TITULAR. Es lo único que se toca del contrato: ni su estado, ni la moto,
    //    ni las deudas, ni los convenios. Un contrato Suspendido sigue Suspendido — la moto sale
    //    después por Inmovilizaciones, con sus propias reglas.
    const { error: errSwap } = await supabase.from("contratos")
      .update({ cliente_id: cesionarioId }).eq("id", contratoId);
    if (errSwap) {
      await supabase.from("cesiones_contrato").delete().eq("id", ces.id);
      return { error: errSwap.message };
    }

    // 3. Rastro legible. A diferencia del préstamo de reemplazo, acá SÍ se revisa el error: una
    //    cesión sin auditoría es un defecto, no un detalle.
    const { data: personas } = await supabase.from("clientes")
      .select("id, nombre, cedula").in("id", [cedenteId, cesionarioId]);
    const rotulo = (id: string) => {
      const p = personas?.find(x => x.id === id);
      return p ? `${p.nombre} · CC ${p.cedula}` : id;
    };
    const { error: errAud } = await supabase.from("contratos_auditoria").insert({
      contrato_id: contratoId,
      campo: "cliente_id (cesión de contrato)",
      valor_anterior: rotulo(cedenteId),
      valor_nuevo: rotulo(cesionarioId),
      editado_por: params.registradoPor,
    });
    if (errAud) {
      return { error: `La cesión YA quedó registrada — NO la repitas. Falló el rastro de auditoría: ${errAud.message}`, cesionId: ces.id };
    }

    // 4. El que cede queda Retirado, SALVO que tenga otro contrato vivo (mismo criterio que la
    //    liquidación: no se retira a alguien que sigue rodando en otra moto).
    const { data: otros } = await supabase.from("contratos")
      .select("id").eq("cliente_id", cedenteId).in("estado", ["Activo", "En proceso", "Suspendido"]);
    if (!otros || otros.length === 0) {
      const { error: errCed } = await supabase.from("clientes")
        .update({ estado: "Retirado" }).eq("id", cedenteId);
      if (errCed) {
        return { error: `La cesión YA quedó registrada — NO la repitas. No se pudo marcar como Retirado a quien cedió; cámbialo a mano desde su ficha. (${errCed.message})`, cesionId: ces.id };
      }
    }

    // 5. El que recibe pasa a ser cliente activo del sistema.
    const { error: errCes } = await supabase.from("clientes")
      .update({ estado: "Activo" }).eq("id", cesionarioId);
    if (errCes) {
      return { error: `La cesión YA quedó registrada — NO la repitas. No se pudo poner en Activo a quien recibe; cámbialo a mano desde su ficha. (${errCes.message})`, cesionId: ces.id };
    }

    return { error: null, cesionId: ces.id };
  }

  return { cesiones, loading, cesionesDeContrato, cederContrato };
}
