import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// LAS RODADAS CON SU FECHA, para la nómina (opción A del dueño, 30-sep-2026): cada semana se le paga
// al cobrador según cómo estaba el contrato el día en que se cobró. La conversión a períodos vive en
// `rodadasDesdeRegistros` (nominaCobradores), que es pura y tiene sus pruebas.
//
// `null` mientras carga o si alguna de las dos consultas falla: la nómina se queda entonces con la
// cuenta de antes, en vez de pagar con una historia a medias.

export type RegistrosRodadas = {
  acuerdos: Array<{ contrato_id: string; decision: string; dias_en_empresa: number | null; created_at: string }>;
  auditoria: Array<{ contrato_id: string; campo: string; valor_anterior: string | null; valor_nuevo: string | null; created_at: string }>;
};

export function useRodadas(activo: boolean) {
  const [registros, setRegistros] = useState<RegistrosRodadas | null>(null);

  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    Promise.all([
      supabase.from("acuerdos_tiempo_rodado")
        .select("contrato_id, decision, dias_en_empresa, created_at")
        .eq("decision", "rodar_al_final"),
      supabase.from("contratos_auditoria")
        .select("contrato_id, campo, valor_anterior, valor_nuevo, created_at")
        .like("valor_nuevo", "exoneradas %"),
    ]).then(([a, b]) => {
      if (!vivo) return;
      setRegistros(a.error || b.error ? null : { acuerdos: a.data ?? [], auditoria: b.data ?? [] });
    });
    return () => { vivo = false; };
  }, [activo]);

  return registros;
}
