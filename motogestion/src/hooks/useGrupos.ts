import { useSyncExternalStore } from "react";
import { supabase } from "../lib/supabase";
import { HEX_DIA, esColorGrupo, ordenarPorCodigo, tonoDeColor, type ColorGrupo, type TonoGrupo } from "../utils/grupos";

// Los grupos (portafolios) de la empresa, de la tabla `grupos` (mig 217). Es la ÚNICA lista: ninguna
// pantalla vuelve a escribir COSTA, PRADERA, etc. a mano.
//
// No usa `createTableStore` porque ese ordena y aplica los avisos por `id`, y esta tabla no tiene
// `id`: su llave es el nombre (`codigo`). Son cinco filas, así que cualquier aviso del servidor
// vuelve a pedir la tabla entera, que pesa menos que un pago.

export type Grupo = {
  codigo: string;
  color: ColorGrupo | string;
  activo: boolean;
  created_at: string;
  creado_por: string | null;
};

/** Lo que devuelve `grupos_uso()`: solo el Administrador principal recibe filas. */
export type UsoGrupo = {
  codigo: string; color: string; activo: boolean;
  motos_empresa: number; motos_vendidas: number; socios: number; cuentas: number; abonos: number;
  fotos: number; cajas: number; ingresos: number; premios: number;
  puede_renombrar: boolean; puede_apagar: boolean;
};

type Snapshot = { data: Grupo[]; loading: boolean; error: string | null };

let snapshot: Snapshot = { data: [], loading: true, error: null };
let arranco = false;
let estuvoCaido = false;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach(o => o());

async function recargar() {
  const { data, error } = await supabase.from("grupos").select("*").order("codigo");
  snapshot = error
    ? { ...snapshot, loading: false, error: error.message }
    : { data: ordenarPorCodigo((data ?? []) as Grupo[]), loading: false, error: null };
  avisar();
}

function arrancar() {
  if (arranco) return;
  arranco = true;
  supabase
    .channel("grupos-store")
    .on("postgres_changes", { event: "*", schema: "public", table: "grupos" }, () => { recargar(); })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        if (estuvoCaido) { estuvoCaido = false; recargar(); }
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        estuvoCaido = true;
      }
    });
  recargar();
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  arrancar();
  return () => { oyentes.delete(oyente); };
}

async function llamar(fn: string, args: Record<string, unknown>): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc(fn, args);
  if (!error) await recargar();   // sin esperar al aviso del servidor: la pantalla queda al día ya
  return { error: error?.message ?? null };
}

export function useGrupos() {
  const { data: grupos, loading, error } = useSyncExternalStore(suscribir, () => snapshot);
  const prendidos = grupos.filter(g => g.activo);
  const porCodigo = new Map(grupos.map(g => [g.codigo, g]));

  /**
   * El color del grupo en hex, para lo que sale de la app (Excel: las variables CSS no sirven ahí).
   * Es el tono «letra» de día, oscuro, para que el título blanco de la sección se lea.
   */
  function hexDe(codigo: string | null | undefined): string {
    const color = codigo ? porCodigo.get(codigo)?.color : null;
    return HEX_DIA[esColorGrupo(color) ? color : "gris"].letra;
  }

  /** Los tres tonos del grupo. Un nombre que no está en la lista (dato viejo) sale gris. */
  function tonoDe(codigo: string | null | undefined): TonoGrupo {
    return tonoDeColor(codigo ? porCodigo.get(codigo)?.color : null);
  }

  /**
   * Para FILTRAR lo que ya existe: los prendidos, más los apagados que todavía aparezcan en los
   * datos que se están mirando (un grupo apagado puede tener pagos o cajas de antes).
   */
  function paraFiltrar(enUso: Iterable<string | null | undefined> = []): string[] {
    const usados = new Set<string>();
    for (const g of enUso) if (g) usados.add(g);
    const lista = grupos.filter(g => g.activo || usados.has(g.codigo)).map(g => g.codigo);
    for (const g of usados) if (!porCodigo.has(g)) lista.push(g);   // nombre que la lista no conoce
    return lista.sort((a, b) => a.localeCompare(b, "es"));
  }

  return {
    grupos,
    /** Para ESCOGER (moto nueva, socio nuevo, cuenta): solo los prendidos. */
    prendidos,
    codigosPrendidos: prendidos.map(g => g.codigo),
    loading,
    error,
    existe: (codigo: string | null | undefined) => !!codigo && porCodigo.has(codigo),
    tonoDe,
    hexDe,
    paraFiltrar,
    crear: (codigo: string, color: string) => llamar("grupo_crear", { p_codigo: codigo, p_color: color }),
    editar: (codigo: string, cambios: { color?: string; nuevoCodigo?: string }) =>
      llamar("grupo_editar", { p_codigo: codigo, p_color: cambios.color ?? null, p_nuevo_codigo: cambios.nuevoCodigo ?? null }),
    apagar: (codigo: string) => llamar("grupo_apagar", { p_codigo: codigo }),
    encender: (codigo: string) => llamar("grupo_encender", { p_codigo: codigo }),
  };
}

/** Qué usa cada grupo y si se deja renombrar o apagar. Solo para la sección Grupos. */
export async function cargarUsoGrupos(): Promise<{ data: UsoGrupo[]; error: string | null }> {
  const { data, error } = await supabase.rpc("grupos_uso");
  return { data: (data ?? []) as UsoGrupo[], error: error?.message ?? null };
}
