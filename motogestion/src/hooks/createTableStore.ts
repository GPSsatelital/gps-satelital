import { useSyncExternalStore } from "react";
import { supabase } from "../lib/supabase";
import { hoyMasDias } from "../utils/fecha";

// Store compartido por tabla: UNA sola carga inicial + UN solo canal realtime para toda
// la app, con caché que sobrevive a la navegación. Antes cada hook (useMotos, useContratos,
// …) fetcheaba la tabla completa en CADA montaje y abría su propio canal `-${Math.random()}`,
// así que cambiar de pantalla recargaba todo y un pago disparaba N refetches. Ahora el dato
// vive en memoria a nivel de módulo: al volver a una pantalla se usa la caché (instantáneo) y
// el realtime la mantiene fresca. La firma pública de cada hook queda idéntica → cero cambios
// en las vistas.
//
// ── 31-jul-2026: los tres arreglos de FLUIDEZ ────────────────────────────────────────────────
// La queja del dueño: "no se actualiza sola o demora cuando queda mucho tiempo abierta; no hay
// fluidez entre lo que se hace y lo que se refleja". Eran tres cosas distintas:
//
// 1. CADA aviso del servidor re-descargaba la TABLA COMPLETA. Medido: confirmar cinco pagos
//    seguidos bajaba 5 × 359 KB para ver cinco renglones. Ahora el cambio se aplica en memoria
//    con lo que ya viene en el aviso (insert/update/delete) — cero viajes.
// 2. NADA refrescaba al volver a la app. Verificado: cero `visibilitychange`/`focus` en todo
//    `src/`. Si el celular se bloqueaba o el PC se suspendía, el canal se moría y la caché
//    quedaba vieja PARA SIEMPRE hasta recargar a mano.
// 3. supabase-js RECONECTA el canal pero NO reproduce lo que se perdió mientras estuvo caído.
//    Así que al reconectar hay que re-sincronizar sí o sí, o faltan cambios en silencio.
//
// Red de seguridad: ante cualquier duda (aviso raro, fila sin id, error) se cae al refetch
// completo. Preferir quedar lento antes que quedar mostrando datos falsos — es plata.

type Snapshot<T> = { data: T[]; loading: boolean; error: string | null };
export type FilaConId = { id?: string | number };

/**
 * Aplica UN cambio del realtime sobre la lista que ya está en memoria, sin volver a pedir la
 * tabla. Devuelve la lista nueva, o `null` cuando no se puede aplicar con certeza — en ese caso
 * el llamador pide la tabla completa. Ante la duda se prefiere quedar lento antes que mostrar
 * datos falsos: acá se ven pagos y contratos, es plata.
 *
 * Pura y exportada a propósito: es la parte que puede mostrar un dato equivocado en pantalla, y
 * así queda cubierta por `npm test` sin tener que tocar la base de producción para probarla.
 */
export function aplicarCambioALista<T extends FilaConId>(
  filas: T[],
  evento: string,
  nueva: FilaConId | null,
  vieja: FilaConId | null,
  ordenar: (f: T[]) => T[],
): T[] | null {
  if (evento === "INSERT") {
    if (!nueva?.id) return null;
    if (filas.some(f => f.id === nueva.id)) return filas;   // doble aviso: ya estaba
    return ordenar([...filas, nueva as T]);
  }
  if (evento === "UPDATE") {
    if (!nueva?.id) return null;
    const i = filas.findIndex(f => f.id === nueva.id);
    // No la teníamos: puede ser una fila que recién entra en lo que este usuario puede VER (RLS).
    // Se pide la tabla en vez de inventarla.
    if (i === -1) return null;
    const copia = [...filas];
    copia[i] = nueva as T;
    return ordenar(copia);
  }
  if (evento === "DELETE") {
    // En un DELETE Postgres solo manda la clave primaria (sin REPLICA IDENTITY FULL).
    if (!vieja?.id) return null;
    return filas.filter(f => f.id !== vieja.id);
  }
  return null;
}

// Cuánto tiempo tiene que llevar la caché sin refrescarse para que valga la pena re-sincronizar
// al volver a la app. Sin este tope, cada vez que el usuario cambia de app y vuelve se bajarían
// las 10 tablas (1,7 MB) — carísimo con datos móviles, que es como trabajan los cobradores.
const CACHE_VIEJA_MS = 60_000;
const AGRUPAR_REFETCH_MS = 300;

export function createTableStore<T>(
  table: string,
  opts?: {
    orderBy?: string;
    ascending?: boolean;
    onStart?: () => void;
    // VENTANA DE FECHAS (31-jul-2026). Tablas que crecen sin techo: `gestiones_cobro` va a ~36.000
    // filas al año con 1.000 motos. La app las usa casi siempre para "¿qué pasó estos días?", así
    // que de arranque se bajan solo las recientes. Las pantallas que SÍ necesitan la historia
    // completa (ficha del cliente, ficha de la moto, línea de tiempo) llaman `cargarTodo()` al
    // montarse y reciben el resto.
    //
    // ⚠️ NO poner ventana en una tabla cuyos totales se sumen sobre todo el historial sin pedir
    // el resto: el número saldría corto y NADIE se daría cuenta. Es la razón por la que `pagos`
    // se dejó completa — de ahí salen el ahorro acumulado, el estado de cuenta y los reportes.
    ventanaDias?: number;
    campoFecha?: string;
  },
) {
  const orderBy = opts?.orderBy ?? "created_at";
  const ascending = opts?.ascending ?? false;
  const campoFecha = opts?.campoFecha ?? "created_at";

  let snapshot: Snapshot<T> = { data: [], loading: true, error: null };
  let completo = !opts?.ventanaDias;   // sin ventana, siempre está todo
  let fetchEnCurso = false;
  let secuencia = 0;
  let started = false;
  let ultimoFetch = 0;
  let timerRefetch: ReturnType<typeof setTimeout> | null = null;
  let estuvoCaido = false;
  const listeners = new Set<() => void>();

  function emit() {
    for (const l of listeners) l();
  }

  function ordenar(filas: T[]): T[] {
    return [...filas].sort((a, b) => {
      const va = (a as Record<string, unknown>)[orderBy];
      const vb = (b as Record<string, unknown>)[orderBy];
      if (va == null && vb == null) return 0;
      if (va == null) return ascending ? -1 : 1;
      if (vb == null) return ascending ? 1 : -1;
      const cmp = typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va).localeCompare(String(vb));
      return ascending ? cmp : -cmp;
    });
  }

  async function fetchAll(forzar = false) {
    // Sin este candado, al volver a la app se pedía CADA TABLA DOS VECES: `focus` y
    // `visibilitychange` disparan los dos y ninguno sabía del otro, y como `ultimoFetch` recién
    // se actualiza cuando la respuesta llega, el segundo pasaba el chequeo de "caché vieja".
    // Medido en el navegador: 20 consultas en vez de 10.
    // `forzar` es para `cargarTodo()`: pedir la historia completa NO se puede saltar aunque
    // justo haya una consulta en curso, o la ficha se quedaría sin su historial.
    if (fetchEnCurso && !forzar) return;
    const miTurno = ++secuencia;
    fetchEnCurso = true;
    // EN TANDAS DE 1.000 (24-ago-2026): Supabase entrega MÁXIMO 1.000 filas por consulta y no
    // avisa. `pagos` fue la primera tabla en cruzarlas: el historial del mes salía cortado en
    // pantalla, a XYZ54H le "faltaban" 4 pagos viejos, y los cálculos que suman pagos quedaban
    // cortos EN SILENCIO — exactamente el riesgo que advierte el comentario de la ventana.
    // Se pagina hasta traerlo todo, tanda a tanda.
    const TANDA = 1000;
    const filas: T[] = [];
    let errorMsg: string | null = null;
    for (let desde = 0; ; desde += TANDA) {
      let q = supabase.from(table).select("*").order(orderBy, { ascending }).range(desde, desde + TANDA - 1);
      // Una vez que alguien pidió la historia completa, TODOS los refetches siguen trayéndola:
      // si no, el siguiente refresco le borraría de la pantalla lo que la ficha acaba de mostrar.
      if (!completo && opts?.ventanaDias) {
        q = q.gte(campoFecha, hoyMasDias(-opts.ventanaDias));
      }
      const { data, error } = await q;
      // Si mientras esperábamos salió otra consulta (típico: la ventana de 120 días seguía en
      // vuelo y la ficha pidió la historia completa), esta respuesta ya está vieja. Descartarla,
      // o pisaría los datos buenos con los recortados.
      if (miTurno !== secuencia) return;
      if (error) { errorMsg = error.message; break; }
      filas.push(...((data ?? []) as T[]));
      if (!data || data.length < TANDA) break;   // última tanda: ya está todo
    }
    fetchEnCurso = false;
    ultimoFetch = Date.now();
    snapshot = errorMsg
      ? { data: snapshot.data, loading: false, error: errorMsg }
      : { data: filas, loading: false, error: null };
    emit();
  }

  /** Traer la historia completa (para fichas e informes). Idempotente. */
  async function cargarTodo() {
    if (completo) return;
    completo = true;
    await fetchAll(true);
  }

  // Varios cambios seguidos (confirmar 5 pagos, un insert que dispara triggers) se agrupan en
  // UN solo refetch en vez de uno por evento.
  function refetchAgrupado() {
    if (timerRefetch) clearTimeout(timerRefetch);
    timerRefetch = setTimeout(() => { timerRefetch = null; fetchAll(); }, AGRUPAR_REFETCH_MS);
  }

  function aplicarCambio(evento: string, nueva: FilaConId | null, vieja: FilaConId | null): boolean {
    const lista = aplicarCambioALista<T & FilaConId>(
      snapshot.data as (T & FilaConId)[],
      evento, nueva, vieja,
      ordenar as (f: (T & FilaConId)[]) => (T & FilaConId)[],
    );
    if (lista === null) return false;
    snapshot = { ...snapshot, data: lista as T[] };
    return true;
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
      .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
        const ok = aplicarCambio(
          payload.eventType,
          (payload.new ?? null) as FilaConId | null,
          (payload.old ?? null) as FilaConId | null,
        );
        if (ok) { ultimoFetch = Date.now(); emit(); }
        else refetchAgrupado();   // no se pudo aplicar con certeza → pedir la tabla
      })
      .subscribe((status) => {
        // supabase-js reconecta solo, pero NO reproduce lo que pasó mientras estuvo caído: al
        // volver a quedar suscrito hay que re-sincronizar o faltan cambios sin que nadie se entere.
        if (status === "SUBSCRIBED") {
          if (estuvoCaido) { estuvoCaido = false; fetchAll(); }
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          estuvoCaido = true;
        }
      });
    fetchAll();

    // Al volver a la app (desbloquear el celular, volver a la pestaña) se re-sincroniza SOLO si
    // la caché ya está vieja. Sin el tope, cada cambio de app bajaría las 10 tablas.
    if (typeof document !== "undefined") {
      const alVolver = () => {
        if (document.visibilityState !== "visible") return;
        if (Date.now() - ultimoFetch < CACHE_VIEJA_MS) return;
        fetchAll();
      };
      document.addEventListener("visibilitychange", alVolver);
      window.addEventListener("focus", alVolver);
    }
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
    /**
     * Traer la historia completa de una tabla con ventana. Lo llaman las pantallas que muestran
     * historial viejo (fichas, línea de tiempo). En tablas sin ventana no hace nada.
     */
    cargarTodo,
  };
}
