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

export function useCajasLlenadas(desde: string, hasta: string, activo: boolean) {
  const [eventos, setEventos] = useState<CajaLlenada[] | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    setCargando(true);
    // 🔴 POR PÁGINAS (30-sep-2026): Supabase devuelve máximo 1.000 filas SIN AVISAR. Las 12 semanas
    // que pide la nómina ya eran ~2.000 y llegaban solo las más viejas: la semana del 21-sep veía 0
    // de sus 238 cajas llenadas, y a los cobradores no les salía casi ningún ciclo cobrado.
    (async () => {
      const filas: CajaLlenada[] = [];
      for (let desdeFila = 0; ; desdeFila += 1000) {
        const { data, error } = await supabase
          .from("cajas_llenadas")
          .select("contrato_id, caja_numero, fecha, fuente")
          .gte("fecha", desde)
          .lte("fecha", hasta)
          .order("fecha").order("id")
          .range(desdeFila, desdeFila + 999);
        if (error) return null;
        filas.push(...((data ?? []) as CajaLlenada[]));
        if ((data ?? []).length < 1000) return filas;
      }
    })().then(filas => {
      if (!vivo) return;
      // Sin filas (o tabla aún sin migrar): null → la nómina usa el método viejo y lo avisa.
      setEventos(filas && filas.length > 0 ? filas : null);
      setCargando(false);
    });
    return () => { vivo = false; };
  }, [desde, hasta, activo]);

  return { eventos, cargando };
}
