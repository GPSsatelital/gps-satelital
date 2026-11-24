import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { ConfirmacionUbicacion } from "../utils/confirmacionUbicacion";

// LAS CONFIRMACIONES DE DÓNDE DUERME LA MOTO (D-094, mig 225). Desde las entregas del 19-nov-2026 la
// confirma quien hizo la visita, y de eso depende que le paguen los $40.000. La lista sale de una
// función de la base porque el SUBADMIN no ve por RLS los contratos de las motos de otro supervisor,
// y la moto que visitó puede ser de otro. Las del auxiliar las confirma el supervisor de la moto
// (D-095, mig 226): las reglas viven en `utils/confirmacionUbicacion.ts`.
export { pasoDe, tareaDe, cuentaDelMenu } from "../utils/confirmacionUbicacion";
export type { ConfirmacionUbicacion, PasoConfirmacion, TareaConfirmacion } from "../utils/confirmacionUbicacion";

// El número del menú y la lista del módulo se avisan por acá cuando alguien confirma.
const EVENTO = "mg:confirmaciones-ubicacion";

export function useConfirmacionesUbicacion(activo = true) {
  const [filas, setFilas] = useState<ConfirmacionUbicacion[]>([]);
  const [cargando, setCargando] = useState(activo);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!activo) return;
    const { data, error: e } = await supabase.rpc("confirmaciones_ubicacion");
    if (e) setError(e.message);
    else { setError(null); setFilas((data ?? []) as ConfirmacionUbicacion[]); }
    setCargando(false);
  }, [activo]);

  useEffect(() => {
    void cargar();
    const f = () => { void cargar(); };
    window.addEventListener(EVENTO, f);
    return () => window.removeEventListener(EVENTO, f);
  }, [cargar]);

  async function confirmar(contratoId: string, resultado: "coincide" | "no_coincide") {
    const { error: e } = await supabase.rpc("confirmar_ubicacion_visitador", {
      p_contrato_id: contratoId, p_resultado: resultado,
    });
    if (!e) avisarCambio();
    return { error: e?.message ?? null };
  }

  return { filas, cargando, error, recargar: cargar, confirmar };
}

export function avisarCambio() {
  window.dispatchEvent(new Event(EVENTO));
}
