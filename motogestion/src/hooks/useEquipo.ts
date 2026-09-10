import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// LA GENTE DEL EQUIPO — para el panel de supervisión (fase 3 de docs/FLUJO-DIARIO.md).
//
// Va a `profiles` directo y no por `nombres_subadmins()` (mig 065) porque esa función devuelve
// SOLO los SUBADMIN, y supervisar es ver a todos: también a la secretaria y al otro admin.
// Solo lo llaman ADMIN y ADMIN_PRINCIPAL, que son los únicos que la RLS de profiles deja leer
// perfiles ajenos. Para cualquier otro rol devuelve vacío y el panel no se dibuja.
//
// 🔴 Trae también a quien NO tiene nada asignado, a propósito: alguien con cero pendientes es
// tan importante de ver como el que tiene setenta. Hoy Johan David Rojas es subadmin y no tiene
// una sola moto a cargo — eso no se ve en ninguna pantalla del sistema.

export type Companero = { id: string; nombre: string; role: string };

export function useEquipo(activo: boolean) {
  const [equipo, setEquipo] = useState<Companero[]>([]);
  const [loading, setLoading] = useState(activo);

  useEffect(() => {
    if (!activo) { setEquipo([]); setLoading(false); return; }
    let vivo = true;
    (async () => {
      const { data } = await supabase.from("profiles").select("id, nombre, role").order("nombre");
      if (!vivo) return;
      setEquipo((data ?? []) as Companero[]);
      setLoading(false);
    })();
    return () => { vivo = false; };
  }, [activo]);

  return { equipo, loading };
}
