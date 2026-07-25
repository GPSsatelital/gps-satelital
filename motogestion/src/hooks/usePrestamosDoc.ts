import { supabase } from "../lib/supabase";
import { hoyISO } from "../utils/fecha";
import { createTableStore } from "./createTableStore";

// Préstamo de tarjetas de propiedad y copias de llaves (mig 062). Cada préstamo se abre
// (estado='prestado') y se cierra al devolver. Sirve para saber dónde está cada tarjeta/llave
// física y que se devuelva a la empresa.
export type TipoDoc = "tarjeta" | "llave";

export type PrestamoDoc = {
  id: string;
  moto_id: string;
  tipo: TipoDoc;
  prestado_a: string;
  motivo: string | null;
  estado: "prestado" | "devuelto";
  fecha_prestamo: string;
  fecha_devolucion: string | null;
  registrado_por: string | null;
  created_at: string;
};

const store = createTableStore<PrestamoDoc>("prestamos_llave_tarjeta");

export function usePrestamosDoc() {
  const { data: prestamos, loading } = store.useStore();

  async function prestar(datos: {
    moto_id: string;
    tipo: TipoDoc;
    prestado_a: string;
    motivo?: string;
    registrado_por?: string | null;
  }) {
    const { error } = await supabase.from("prestamos_llave_tarjeta").insert({
      moto_id: datos.moto_id,
      tipo: datos.tipo,
      prestado_a: datos.prestado_a,
      motivo: datos.motivo ?? null,
      registrado_por: datos.registrado_por ?? null,
      fecha_prestamo: hoyISO(),
      estado: "prestado",
    });
    return { error: error?.message ?? null };
  }

  async function devolver(id: string) {
    const { error } = await supabase
      .from("prestamos_llave_tarjeta")
      .update({ estado: "devuelto", fecha_devolucion: hoyISO() })
      .eq("id", id);
    return { error: error?.message ?? null };
  }

  return { prestamos, loading, prestar, devolver };
}
