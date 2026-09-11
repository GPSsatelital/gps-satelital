import { supabase } from "../lib/supabase";
import { createTableStore } from "./createTableStore";
import type { GrupoMoto } from "./useMotos";

// Las cuentas a las que los clientes transfieren (mig 080). Antes vivían solo en la cabeza de
// la gente: no había forma de saber a qué portafolio pertenecía una transferencia sin dueño,
// ni de decirle a un cliente dónde pagar desde la app.
//
// Una cuenta puede recibir de VARIOS grupos (el Nequi de RASTREADOR y USADAS es el mismo) y un
// grupo puede tener VARIAS cuentas (COSTA usa Bancolombia y Nequi). Por eso `grupos` es lista.
export type CuentaBancaria = {
  id: string;
  banco: string;
  tipo: string | null;
  numero: string;
  titular: string | null;
  grupos: string[];
  activa: boolean;
  orden: number;
  created_at: string;
};

const store = createTableStore<CuentaBancaria>("cuentas_bancarias");

/**
 * El portafolio al que pertenece la plata que cayó en esta cuenta.
 * Solo se puede afirmar cuando la cuenta recibe de UN grupo: si recibe de dos, saber la cuenta
 * no dice de quién es la plata, y devolver uno de los dos sería adivinar. `null` = no se sabe,
 * que es la respuesta honesta hasta que el cliente reclame y su contrato lo diga.
 */
export function grupoDeCuenta(cuenta: { grupos: string[] } | null | undefined): GrupoMoto | null {
  if (!cuenta || cuenta.grupos.length !== 1) return null;
  return cuenta.grupos[0] as GrupoMoto;
}

/** Las cuentas activas a las que debe pagar un cliente de este grupo, en orden. */
export function cuentasDelGrupo(cuentas: CuentaBancaria[], grupo: string | null | undefined): CuentaBancaria[] {
  if (!grupo) return [];
  return cuentas
    .filter(c => c.activa && c.grupos.includes(grupo))
    .sort((a, b) => a.orden - b.orden || a.banco.localeCompare(b.banco));
}

/**
 * Las cuentas listas para meter en un mensaje de WhatsApp, EN UN SOLO RENGLÓN.
 *
 * 🔴 SIN SALTOS DE LÍNEA, y no es un capricho de estilo: Meta **rechaza** una variable de
 * plantilla que traiga un salto de línea. Como COSTA es el único grupo con DOS cuentas, era el
 * único cuyo mensaje se caía o le llegaba al cliente con una sola — los demás tienen una sola y
 * nunca hubo salto. Verificado el 11-sep-2026 contra el historial de envíos: la app mandaba las
 * dos cuentas completas, se perdían más abajo.
 *
 * Por eso además se leen como parte de la frase ("…para pagar su moto XXX: Bancolombia … y
 * Nequi …") y no como lista con viñetas, que sin renglones queda ilegible.
 */
export function textoCuentas(cuentas: CuentaBancaria[]): string {
  const partes = cuentas.map(c =>
    `${c.banco}${c.tipo ? ` ${c.tipo.toLowerCase()}` : ""} ${c.numero}${c.titular ? ` (${c.titular})` : ""}`);
  if (partes.length <= 1) return partes[0] ?? "";
  return partes.slice(0, -1).join(", ") + " y " + partes[partes.length - 1];
}

export function useCuentasBancarias() {
  const { data: cuentas, loading } = store.useStore();
  const activas = cuentas.filter(c => c.activa).sort((a, b) => a.orden - b.orden || a.banco.localeCompare(b.banco));

  async function crear(datos: Omit<CuentaBancaria, "id" | "created_at">) {
    const { error } = await supabase.from("cuentas_bancarias").insert(datos);
    return { error: error?.message ?? null };
  }

  async function actualizar(id: string, cambios: Partial<Omit<CuentaBancaria, "id" | "created_at">>) {
    const { error } = await supabase.from("cuentas_bancarias").update(cambios).eq("id", id);
    return { error: error?.message ?? null };
  }

  // No se borra: el histórico y los recibos viejos la nombran. Se apaga y deja de ofrecerse.
  async function desactivar(id: string) {
    return actualizar(id, { activa: false });
  }

  return { cuentas, activas, loading, crear, actualizar, desactivar };
}
