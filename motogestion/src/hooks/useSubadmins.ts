import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type Subadmin = { id: string; nombre: string };

// Fuente única de la lista de sub-admin. Antes esta misma consulta estaba copiada en
// MotosView, ClientesView y ReportesView — tres copias que había que recordar mantener.
//
// Va por la función `nombres_subadmins()` (mig 065) y no por `profiles` directo: la RLS de
// profiles solo deja leer perfiles ajenos a ADMIN/ADMIN_PRINCIPAL, así que la SECRETARIA y el
// SUBADMIN veían la lista vacía. La función devuelve solo id y nombre, sin exponer
// role/permisos/acciones.
let cache: Subadmin[] | null = null;

export function useSubadmins() {
  const [subadmins, setSubadmins] = useState<Subadmin[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data, error } = await supabase.rpc("nombres_subadmins");
      let lista = (data ?? []) as Subadmin[];
      // Respaldo mientras la mig 065 no esté corrida: con ADMIN/AP la consulta directa sí pasa.
      if (error) {
        const { data: d2 } = await supabase.from("profiles").select("id, nombre").eq("role", "SUBADMIN");
        lista = (d2 ?? []) as Subadmin[];
      }
      if (!vivo) return;
      cache = lista;
      setSubadmins(lista);
      setLoading(false);
    })();
    return () => { vivo = false; };
  }, []);

  /** Nombre del sub-admin a cargo, o null si no está asignada / aún no cargó la lista. */
  function nombreSubadmin(id: string | null | undefined): string | null {
    if (!id) return null;
    return subadmins.find(s => s.id === id)?.nombre ?? null;
  }

  return { subadmins, loading, nombreSubadmin };
}
