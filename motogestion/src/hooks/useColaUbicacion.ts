import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// LA FILA DE "VALIDAR DÓNDE DUERME LA MOTO" (mig 145).
//
// `public.pendientes` solo muestra 5 por encargado — el cupo diario, para que 192 avisos viejos no
// tapen el resto del trabajo. Pero el dueño pidió que "tampoco se dejen de hacer", y eso exige un
// marcador que baje a la vista: cuántas le quedan a cada quien.
//
// Se lee de la MISMA vista de donde sale el cupo (`validar_ubicacion_cola`), no de una consulta
// paralela: si el cupo saliera de un lado y el conteo de otro, tarde o temprano dirían cifras
// distintas. Es el defecto de las dos cuentas de la mora, que ya costó caro.
//
// Trae solo el id del encargado: no hay nombres de clientes ni placas en este viaje, y son ~200
// filas de una columna.

export function useColaUbicacion(activo = true) {
  const [porEncargado, setPorEncargado] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(activo);

  const cargar = useCallback(async () => {
    if (!activo) { setLoading(false); return; }
    const { data } = await supabase.from("validar_ubicacion_cola").select("subadmin_id");
    const filas = (data ?? []) as { subadmin_id: string | null }[];
    const m: Record<string, number> = {};
    for (const f of filas) {
      const k = f.subadmin_id ?? "sin_encargado";
      m[k] = (m[k] ?? 0) + 1;
    }
    setPorEncargado(m);
    setTotal(filas.length);
    setLoading(false);
  }, [activo]);

  useEffect(() => { void cargar(); }, [cargar]);

  /** Cuántas le quedan a esta persona (0 si no tiene ninguna). */
  const faltanDe = (uid: string | null | undefined) => (uid ? porEncargado[uid] ?? 0 : 0);

  return { total, porEncargado, faltanDe, loading, recargar: cargar };
}
