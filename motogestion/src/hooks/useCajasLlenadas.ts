import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Las ANOTACIONES de cajas llenadas (mig 112): el vigía de contratos escribe una por cada caja
// que se llena, con fecha y fuente. La nómina de cobradores las lee en vez de adivinar releyendo
// pagos. Solo existen desde que la migración corrió — para semanas anteriores no hay filas y la
// nómina cae al método viejo (y lo avisa).

export type CajaLlenada = {
  contrato_id: string;
  /** 0 = prorrateo; 1..N = cajas del libro (numeración absoluta del contrato). */
  caja_numero: number;
  fecha: string;
  fuente: "pago" | "convenio";
};

/**
 * `cargando` y `error` existen para que la nómina NO se pueda cerrar ni imprimir con datos a medias
 * (2-oct): un cierre congela la cifra para siempre. Lo traído se marca con la ventana que se pidió;
 * al cambiar de semana, lo de la anterior deja de valer en ese mismo instante, en vez de quedarse
 * en pantalla mientras llega lo nuevo. `intento` sube para volver a pedir después de un error.
 */
export function useCajasLlenadas(desde: string, hasta: string, activo: boolean, intento = 0) {
  const clave = `${desde}|${hasta}|${intento}`;
  const [traido, setTraido] = useState<{ clave: string; eventos: CajaLlenada[] | null; error: boolean } | null>(null);

  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    // 🔴 POR PÁGINAS (30-sep-2026): Supabase devuelve máximo 1.000 filas SIN AVISAR. Las 12 semanas
    // que pide la nómina ya eran ~2.000 y llegaban solo las más viejas: la semana del 21-sep veía 0
    // de sus 238 cajas llenadas, y a los cobradores no les salía casi ningún ciclo cobrado.
    (async (): Promise<CajaLlenada[] | "error"> => {
      const filas: CajaLlenada[] = [];
      for (let desdeFila = 0; ; desdeFila += 1000) {
        const { data, error } = await supabase
          .from("cajas_llenadas")
          .select("contrato_id, caja_numero, fecha, fuente")
          .gte("fecha", desde)
          .lte("fecha", hasta)
          .order("fecha").order("id")
          .range(desdeFila, desdeFila + 999);
        if (error) return "error";
        filas.push(...((data ?? []) as CajaLlenada[]));
        if ((data ?? []).length < 1000) return filas;
      }
    })().then(r => {
      if (!vivo) return;
      // Sin filas (semana anterior a la migración): null → la nómina usa el método viejo y lo avisa.
      setTraido({ clave, eventos: r === "error" || r.length === 0 ? null : r, error: r === "error" });
    });
    return () => { vivo = false; };
  }, [clave, desde, hasta, activo]);

  const vigente = traido?.clave === clave ? traido : null;
  return { eventos: vigente?.eventos ?? null, cargando: activo && !vigente, error: !!vigente?.error };
}
