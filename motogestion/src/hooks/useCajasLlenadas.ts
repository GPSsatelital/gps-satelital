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
    supabase
      .from("cajas_llenadas")
      .select("contrato_id, caja_numero, fecha, fuente")
      .gte("fecha", desde)
      .lte("fecha", hasta)
      .then(({ data, error }) => {
        if (!vivo) return;
        // Sin filas (o tabla aún sin migrar): null → la nómina usa el método viejo y lo avisa.
        setEventos(error ? null : ((data ?? []).length > 0 ? (data as CajaLlenada[]) : null));
        setCargando(false);
      });
    return () => { vivo = false; };
  }, [desde, hasta, activo]);

  return { eventos, cargando };
}
