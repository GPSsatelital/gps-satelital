import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { ExtraLibro } from "../utils/libroSemanas";

// Lo que el libro de semanas (utils/libroSemanas.ts) necesita además de los pagos: cuándo estuvo
// guardada la moto y se rodó, los rodados por deuda y el día en que se llenó cada semana.
// Se pide por contrato, solo cuando se abre. Lo que el rol no puede leer llega vacío y el libro lo
// dice (no inventa fechas).
export function useDatosLibro(contratoId: string | null): ExtraLibro | null {
  const [traido, setTraido] = useState<{ id: string; extra: ExtraLibro } | null>(null);

  useEffect(() => {
    if (!contratoId) return;
    let vivo = true;
    Promise.all([
      supabase.from("acuerdos_tiempo_rodado").select("fecha_entrada, fecha_salida, dias_en_empresa")
        .eq("contrato_id", contratoId).eq("decision", "rodar_al_final"),
      supabase.from("rodados_por_deuda").select("numero, created_at, cajas_corridas, estado").eq("contrato_id", contratoId),
      supabase.from("cajas_llenadas").select("caja_numero, fecha, created_at").eq("contrato_id", contratoId).range(0, 999),
    ]).then(([a, r, l]) => {
      if (!vivo) return;
      setTraido({
        id: contratoId,
        extra: {
          acuerdos: a.error ? [] : a.data ?? [],
          rodadosDeuda: r.error ? [] : r.data ?? [],
          llenadas: l.error ? null : l.data ?? [],
        },
      });
    });
    return () => { vivo = false; };
  }, [contratoId]);

  return traido?.id === contratoId ? traido.extra : null;
}
