import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// LAS RODADAS CON SU FECHA, para la nómina (opción A del dueño, 30-sep-2026): cada semana se le paga
// al cobrador según cómo estaba el contrato el día en que se cobró. La conversión a períodos vive en
// `rodadasDesdeRegistros` (nominaCobradores), que es pura y tiene sus pruebas.
//
// `registros` es null mientras carga o si alguna de las consultas falla: la nómina se queda
// entonces con la cuenta de antes, en vez de pagar con una historia a medias. `cargando` y `error`
// lo dicen aparte (2-oct), para que la pantalla no deje cerrar la semana con esa cuenta.
//
// 13-nov-2026 (D-087): también los «Rodar todo» (mig 201), con su día. Desde ese día el acuerdo quedó
// en 'rodado' y el cliente solo paga su semana: la nómina deja de pedirle la cuota (RMM66H).

export type RegistrosRodadas = {
  acuerdos: Array<{ contrato_id: string; decision: string; dias_en_empresa: number | null; created_at: string }>;
  auditoria: Array<{ contrato_id: string; campo: string; valor_anterior: string | null; valor_nuevo: string | null; created_at: string }>;
  rodadosTodo: Array<{ contrato_id: string; convenio_id: string | null; fecha: string }>;
};

export function useRodadas(activo: boolean, intento = 0) {
  const [traido, setTraido] = useState<{ intento: number; registros: RegistrosRodadas | null; error: boolean } | null>(null);

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
      supabase.from("rodados_por_deuda")
        .select("contrato_id, convenio_id, fecha")
        .eq("todo", true)
        .neq("estado", "anulado"),
    ]).then(([a, b, r]) => {
      if (!vivo) return;
      const error = !!(a.error || b.error || r.error);
      setTraido({ intento, registros: error ? null : { acuerdos: a.data ?? [], auditoria: b.data ?? [], rodadosTodo: r.data ?? [] }, error });
    });
    return () => { vivo = false; };
  }, [activo, intento]);

  const vigente = traido?.intento === intento ? traido : null;
  return { registros: vigente?.registros ?? null, cargando: activo && !vigente, error: !!vigente?.error };
}
