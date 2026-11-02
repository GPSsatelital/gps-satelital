import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { TramoAsignacion } from "../utils/nominaCobradores";

// EL LIBRO DE ASIGNACIONES (mig 211, D-061): qué supervisor tuvo cada moto y desde cuándo. La nómina
// lo lee para pagarle a cada uno lo de los días en que tenía la moto. La cuenta vive en
// `libroDeAsignaciones` (nominaCobradores), que es pura y tiene sus pruebas.
//
// `cargando` y `error` existen por lo mismo que en las cajas y las rodadas: la nómina no se cierra ni
// se imprime con el libro a medias, porque el cierre congela la cifra para siempre. `intento` sube
// para volver a pedir después de un error.

export function useAsignacionesMotos(activo: boolean, intento = 0) {
  const [traido, setTraido] = useState<{ intento: number; tramos: TramoAsignacion[] | null; error: boolean } | null>(null);

  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    // Por páginas: Supabase devuelve máximo 1.000 filas sin avisar, y el libro ya tiene una por moto.
    (async (): Promise<TramoAsignacion[] | "error"> => {
      const filas: TramoAsignacion[] = [];
      for (let desdeFila = 0; ; desdeFila += 1000) {
        const { data, error } = await supabase
          .from("motos_asignaciones")
          .select("moto_id, subadmin_id, desde, hasta")
          .order("id")
          .range(desdeFila, desdeFila + 999);
        if (error) return "error";
        filas.push(...((data ?? []) as TramoAsignacion[]));
        if ((data ?? []).length < 1000) return filas;
      }
    })().then(r => {
      if (!vivo) return;
      setTraido({ intento, tramos: r === "error" ? null : r, error: r === "error" });
    });
    return () => { vivo = false; };
  }, [activo, intento]);

  const vigente = traido?.intento === intento ? traido : null;
  return { tramos: vigente?.tramos ?? null, cargando: activo && !vigente, error: !!vigente?.error };
}
