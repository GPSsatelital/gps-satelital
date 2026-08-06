import { supabase } from "../lib/supabase";
import { createTableStore } from "./createTableStore";

// Movimientos de la BASE INICIAL (mig 091): lo que el cliente entrega para arrancar el proceso
// y lo que se le devuelve si se retira antes de recibir moto.
//
// Vive aparte de `pagos` porque `pagos.contrato_id` es obligatorio y la base se entrega ANTES de
// que exista contrato. Entradas y salidas comparten tabla (`tipo`) para que ninguna pantalla pueda
// contar la una sin la otra.
export type TipoAbonoBase = "abono" | "devolucion";

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
 * Lo que un cliente tiene entregado HOY de base: sus abonos menos sus devoluciones.
 * Nunca se lee solo la suma de abonos — quien se retiró y ya cobró figuraría debiendo cero
 * y con su plata todavía dentro.
 */
export function saldoBaseDeCliente(movs: AbonoBase[], clienteId: string): number {
  return movs
    .filter(m => m.cliente_id === clienteId)
    .reduce((s, m) => s + (m.tipo === "abono" ? m.monto : -m.monto), 0);
}

export function useAbonosBase() {
  const { data: abonos, loading } = store.useStore();

  function movimientosDeCliente(clienteId: string): AbonoBase[] {
    return abonos
      .filter(a => a.cliente_id === clienteId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
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

  return { abonos, loading, movimientosDeCliente, registrar, subirEvidencia };
}
