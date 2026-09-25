import { supabase } from "../lib/supabase";
import { hoyISO } from "../utils/fecha";
import { createTableStore } from "./createTableStore";

// Movimientos de la BASE INICIAL (mig 091): lo que el cliente entrega para arrancar el proceso
// y lo que se le devuelve si se retira antes de recibir moto.
//
// Vive aparte de `pagos` porque `pagos.contrato_id` es obligatorio y la base se entrega ANTES de
// que exista contrato. Entradas y salidas comparten tabla (`tipo`) para que ninguna pantalla pueda
// contar la una sin la otra.
// abono = el cliente entrega · devolucion = sale de la caja a sus manos ·
// retencion = se queda la empresa (mig 092). Son tres hechos distintos y la caja los ve distinto:
// la devolución es plata que SALE, la retención solo cambia de bolsillo dentro de la empresa.
export type TipoAbonoBase = "abono" | "devolucion" | "retencion" | "traslado_saldo";

/**
 * Lo que la empresa retiene de la base cuando el cliente se retira: es lo que ya le pagó al
 * visitador que fue a su casa. Regla del dueño (6-ago-2026): monto FIJO, una sola vez aunque se
 * le hayan hecho varias visitas, y NO se descuenta si el cliente se retira antes de la visita —
 * si nadie fue, la empresa no gastó nada.
 *
 * Vive en una constante y no escrito a mano en la pantalla por la lección de la multa: el día que
 * subió de $20.000 a $30.000 el cálculo cambió pero un letrero siguió diciendo el valor viejo.
 * Pasa a Configuración en la fase 6 del plan, junto con la multa y los montos de la base.
 */
export const COSTO_VISITA_DOMICILIARIA = 40000;

export type AbonoBase = {
  id: string;
  cliente_id: string;
  contrato_id: string | null;
  tipo: TipoAbonoBase;
  monto: number;              // siempre positivo — el signo lo da `tipo`
  metodo: "Efectivo" | "Transferencia";
  cuenta_id: string | null;
  grupo: string | null;       // null hasta que se le asigne moto
  fecha: string;
  fecha_registro: string;
  registrado_por: string | null;
  firma_url: string | null;   // la prueba de que el cliente recibió su plata
  huella_url: string | null;
  nota: string | null;
  created_at: string;
};

const store = createTableStore<AbonoBase>("abonos_base");

/**
 * Lo que un cliente tiene entregado HOY de base: sus abonos menos lo que salió (devoluciones) y
 * menos lo que la empresa retuvo. Nunca se lee solo la suma de abonos — quien se retiró y ya
 * cobró figuraría con su plata todavía dentro. Y sin restar la retención quedaría figurando
 * dueño de los $40.000 del visitador, que ya no son suyos.
 */
export function saldoBaseDeCliente(movs: AbonoBase[], clienteId: string): number {
  return movs
    .filter(m => m.cliente_id === clienteId)
    .reduce((s, m) => s + (m.tipo === "abono" ? m.monto : -m.monto), 0);
}

/**
 * La plata de BASES que se movió en la caja de un día, separada como la caja la necesita.
 *
 * Qué cuenta y qué no:
 *  · `abono`      SUMA  — el cliente entregó, la plata entró
 *  · `devolucion` RESTA — salió de la caja a manos del cliente
 *  · `retencion`  NADA  — no es un movimiento de caja: esa plata ya estaba adentro y ahí se
 *                         queda (solo cambia de bolsillo dentro de la empresa). Si restara,
 *                         la caja diría que salió plata que sigue en la gaveta.
 *
 * La fecha se decide igual que en los pagos (`fechaDeCaja`): el efectivo cuenta el día en que se
 * digitó —llega a la mano— y la transferencia el día en que el banco la recibió.
 *
 * `grupo`: una base nace SIN grupo (el cliente todavía no tiene moto, no se sabe de qué
 * portafolio será). Sin grupo no se le suma a ningún socio — solo entra al total del día.
 * Protegida por `useAbonosBase.test.ts`.
 */
export function basesDelDia(
  movs: Array<Pick<AbonoBase, "tipo" | "monto" | "metodo" | "fecha" | "fecha_registro" | "grupo">>,
  fecha: string,
  grupo?: string | null,
): { efectivo: number; transfer: number; total: number } {
  let efectivo = 0, transfer = 0;
  for (const m of movs) {
    // Ni la retención ni el traslado del excedente mueven la gaveta: la plata ya estaba
    // adentro y solo cambió de bolsillo. Si sumaran, la caja diría que entró plata que no llegó.
    if (m.tipo === "retencion" || m.tipo === "traslado_saldo") continue;
    const dia = m.metodo === "Transferencia" ? m.fecha : (m.fecha_registro || m.fecha);
    if (dia !== fecha) continue;
    if (grupo != null && m.grupo !== grupo) continue;
    const signo = m.tipo === "abono" ? 1 : -1;
    if (m.metodo === "Transferencia") transfer += signo * m.monto;
    else efectivo += signo * m.monto;
  }
  return { efectivo, transfer, total: efectivo + transfer };
}

export function useAbonosBase() {
  const { data: abonos, loading } = store.useStore();

  function movimientosDeCliente(clienteId: string): AbonoBase[] {
    return abonos
      .filter(a => a.cliente_id === clienteId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  /**
   * PASA EL EXCEDENTE DE LA BASE A SALDO A FAVOR (mig 156).
   *
   * Solo se mueve lo que el cliente dio POR ENCIMA de lo exigido: la base ($308.000, $305.000 en
   * los de tarifa vieja) y el ahorro NO se tocan — regla del dueño, cerrada después de un intento
   * que hubo que revertir. Quién decide cuánto es movible vive en `desglosarBase()`, no acá.
   *
   * 🔴 LA CAJA NO SE MUEVE: no entró ni salió un peso, la plata ya estaba adentro y solo cambió de
   * bolsillo. Por eso `basesDelDia()` deja fuera este tipo, igual que la retención.
   *
   * EL RASTRO, como lo pidió el dueño ("que el sistema siempre sepa de dónde sale todo"): la fila
   * en `abonos_base` con su nota, MÁS el renglón en `contratos_auditoria` con el antes y el después
   * del saldo. Si el segundo falla, el traslado YA pasó: se avisa en vez de fingir que no.
   */
  async function trasladarExcedenteASaldo(datos: {
    clienteId: string;
    contratoId: string;
    monto: number;
    saldoFavorActual: number;
    quien: string | null;
    nota?: string;
  }): Promise<{ error: string | null }> {
    const monto = Math.round(datos.monto);
    if (monto <= 0) return { error: "El monto a pasar tiene que ser mayor que cero." };

    // Primero el saldo: es lo que el cliente puede gastar. Si esto falla, no queda un movimiento
    // diciendo que se movió una plata que en realidad no se movió.
    const nuevoSaldo = Math.round(datos.saldoFavorActual) + monto;
    const { error: errSaldo } = await supabase.from("contratos")
      .update({ saldo_favor_apertura: nuevoSaldo }).eq("id", datos.contratoId);
    if (errSaldo) return { error: errSaldo.message };

    const hoy = hoyISO();
    const { error: errMov } = await registrar({
      cliente_id: datos.clienteId,
      contrato_id: datos.contratoId,
      tipo: "traslado_saldo",
      monto,
      grupo: null,
      fecha: hoy,
      fecha_registro: hoy,
      registrado_por: datos.quien,
      nota: datos.nota?.trim()
        || "Excedente de la base inicial pasado a saldo a favor (lo que entregó de más).",
    });
    if (errMov) {
      return { error: "El saldo a favor ya quedó actualizado, pero NO se pudo guardar el movimiento: " + errMov };
    }

    await supabase.from("contratos_auditoria").insert({
      contrato_id: datos.contratoId,
      campo: "saldo_favor_apertura",
      valor_anterior: `$${Math.round(datos.saldoFavorActual).toLocaleString("es-CO")}`,
      valor_nuevo: `$${nuevoSaldo.toLocaleString("es-CO")} — entraron $${monto.toLocaleString("es-CO")} del excedente de la base`,
      editado_por: datos.quien,
    });
    return { error: null };
  }

  async function registrar(datos: {
    cliente_id: string;
    contrato_id?: string | null;
    tipo: TipoAbonoBase;
    monto: number;
    metodo?: "Efectivo" | "Transferencia";
    cuenta_id?: string | null;
    grupo?: string | null;
    fecha: string;
    fecha_registro: string;
    registrado_por?: string | null;
    firma_url?: string | null;
    huella_url?: string | null;
    nota?: string | null;
  }) {
    const { data, error } = await supabase.from("abonos_base").insert({
      cliente_id: datos.cliente_id,
      contrato_id: datos.contrato_id ?? null,
      tipo: datos.tipo,
      monto: Math.round(datos.monto),
      metodo: datos.metodo ?? "Efectivo",
      cuenta_id: datos.cuenta_id ?? null,
      grupo: datos.grupo ?? null,
      fecha: datos.fecha,
      fecha_registro: datos.fecha_registro,
      registrado_por: datos.registrado_por ?? null,
      firma_url: datos.firma_url ?? null,
      huella_url: datos.huella_url ?? null,
      nota: datos.nota ?? null,
    }).select("id").single();
    return { error: error?.message ?? null, id: data?.id ?? null };
  }

  /**
   * La devolución entera en UNA transacción de la base (mig 172): la plata que sale, el descuento
   * de la visita y el cliente Retirado con base $0. O queda todo o no queda nada. La base además
   * exige que devolver + retención sea EXACTAMENTE la base del cliente, así que una segunda
   * devolución es imposible aunque se toque dos veces.
   */
  async function devolverBase(datos: {
    clienteId: string;
    devolver: number;
    retencion: number;
    firmaUrl: string;
    huellaUrl: string | null;
    nota: string;
  }): Promise<{ error: string | null }> {
    const { error } = await supabase.rpc("devolver_base", {
      p_cliente_id: datos.clienteId,
      p_devolver: Math.round(datos.devolver),
      p_retencion: Math.round(datos.retencion),
      p_firma_url: datos.firmaUrl,
      p_huella_url: datos.huellaUrl,
      p_nota: datos.nota,
    });
    return { error: error?.message ?? null };
  }

  /**
   * Sube la firma/huella de una devolución al bucket que ya usa el resto del sistema.
   * Si falla, quien llama DEBE abortar: sin la firma no hay prueba de que el cliente
   * recibió su plata, que es justamente el motivo de todo este flujo.
   */
  async function subirEvidencia(dataUrl: string, cedula: string, nombre: string) {
    const blob = await (await fetch(dataUrl)).blob();
    const path = `devoluciones/${cedula || "sin-cedula"}/${nombre}_${Date.now()}.png`;
    const { error } = await supabase.storage.from("documentos").upload(path, blob, {
      contentType: "image/png", upsert: true,
    });
    if (error) return { url: null as string | null, error: error.message };
    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
    return { url: data.publicUrl, error: null as string | null };
  }

  return { abonos, loading, movimientosDeCliente, registrar, trasladarExcedenteASaldo, devolverBase, subirEvidencia };
}
