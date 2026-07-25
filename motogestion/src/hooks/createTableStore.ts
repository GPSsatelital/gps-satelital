import { useSyncExternalStore } from "react";
import { supabase } from "../lib/supabase";

// Store compartido por tabla: UNA sola carga inicial + UN solo canal realtime para toda
// la app, con caché que sobrevive a la navegación. Antes cada hook (useMotos, useContratos,
// …) fetcheaba la tabla completa en CADA montaje y abría su propio canal `-${Math.random()}`,
// así que cambiar de pantalla recargaba todo y un pago disparaba N refetches. Ahora el dato
// vive en memoria a nivel de módulo: al volver a una pantalla se usa la caché (instantáneo) y
// el realtime la mantiene fresca. La firma pública de cada hook queda idéntica → cero cambios
// en las vistas.

type Snapshot<T> = { data: T[]; loading: boolean; error: string | null };

export function createTableStore<T>(
  table: string,
  opts?: { orderBy?: string; ascending?: boolean; onStart?: () => void },
) {
  const orderBy = opts?.orderBy ?? "created_at";
  const ascending = opts?.ascending ?? false;

  let snapshot: Snapshot<T> = { data: [], loading: true, error: null };
  let started = false;
  const listeners = new Set<() => void>();

  function emit() {
    for (const l of listeners) l();
  }

  async function fetchAll() {
    const { data, error } = await supabase.from(table).select("*").order(orderBy, { ascending });
    snapshot = error
      ? { data: snapshot.data, loading: false, error: error.message }
      : { data: (data ?? []) as T[], loading: false, error: null };
    emit();
  }

  function ensureStarted() {
    if (started) return;
    started = true;
    opts?.onStart?.(); // efecto de arranque una sola vez (ej. marcar_convenios_vencidos)
    // Canal ÚNICO por tabla (nombre estable, no Math.random) — como el store es un singleton,
    // solo hay un suscriptor, así que el nombre fijo no colisiona. Se deja vivo toda la sesión:
    // mantiene la caché fresca y hace que los remontajes sean instantáneos.
    supabase
      .channel(`${table}-store`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => { fetchAll(); })
      .subscribe();
    fetchAll();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    ensureStarted();
    return () => { listeners.delete(listener); };
  }
  function getSnapshot() { return snapshot; }

  return {
    /** Hook para consumir el dato compartido: { data, loading, error }. */
    useStore(): Snapshot<T> {
      return useSyncExternalStore(subscribe, getSnapshot);
    },
    /** Forzar recarga (las mutaciones ya se refrescan solas por realtime; esto es un respaldo). */
    refetch: fetchAll,
  };
}
