import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// LA CÉDULA DE LA GENTE DEL EQUIPO (mig 212, D-062): la guarda el dueño en Usuarios y sale sola en la
// tarjeta «Referido por» cuando alguien del equipo trae un cliente. Solo la leen el ADMIN_PRINCIPAL,
// el ADMIN y la SECRETARIA: a los demás la base les devuelve la lista vacía y la tarjeta se escribe a
// mano, como antes. Lo mismo si la mig 212 todavía no está corrida.

export function useCedulasEquipo(): ReadonlyMap<string, string> {
  const [cedulas, setCedulas] = useState<ReadonlyMap<string, string>>(new Map());

  useEffect(() => {
    let vivo = true;
    supabase.from("equipo_cedulas").select("profile_id, cedula").then(({ data, error }) => {
      if (!vivo || error) return;
      setCedulas(new Map((data ?? []).map((f: { profile_id: string; cedula: string }) => [f.profile_id, f.cedula])));
    });
    return () => { vivo = false; };
  }, []);

  return cedulas;
}
