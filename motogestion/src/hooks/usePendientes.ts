import { useCallback, useSyncExternalStore } from "react";
import { supabase } from "../lib/supabase";
import { hoyISO } from "../utils/fecha";

// LOS PENDIENTES DEL DÍA, CALCULADOS EN EL SERVIDOR (migs 142 y 144).
//
// No es un store con tiempo real como los demás hooks: `public.pendientes` es una VISTA, y una
// vista no emite avisos de cambio — lo que cambia son las tablas de abajo. Se pide cuando se abre
// la pantalla y cuando se vuelve a ella, que para una lista de trabajo del día es suficiente.
//
// La vista ya filtra por permisos sola (`security_invoker`): el SUBADMIN solo recibe lo suyo
// porque se aplican las mismas políticas RLS de contratos y motos que rigen el resto del sistema.
// Acá NO se vuelve a filtrar por seguridad —eso sería un segundo sitio que mantener—, solo se
// separa lo que le toca a cada quien para mostrarlo ordenado.

export type Pendiente = {
  clave: string;
  tipo: string;
  titulo: string;
  detalle: string;
  nivel: "critico" | "alerta" | "info";
  dueno_id: string | null;
  dueno_rol: string | null;
  contrato_id: string | null;
  moto_id: string | null;
  cliente_id: string | null;
  placa: string | null;
  dias: number | null;
  orden: number;
  /** 🔴 En los avisos de COBRO es la cuota y el acuerdo VENCIDOS, no la deuda total del cliente
   *  (esa incluiría las deudas registradas y es otra cifra). Nombrarla siempre por lo que es. */
  monto: number | null;
};

export type Atendido = { clave: string; fecha: string; atendido_por: string; nota: string | null };

/** Los cuatro frentes del día. El orden de la lista lo manda `orden` (que viene del servidor);
 *  esto solo agrupa para que 19 tipos distintos no se lean como una sola pila revuelta. */
export type Bloque = "inicio" | "cobro" | "plata" | "motos" | "contratos" | "revision";

export const BLOQUE_DE: Record<string, Bloque> = {
  abrir_canal_zala: "inicio",
  recoleccion: "cobro", mora: "cobro", gabela: "cobro",
  plazo_vencido: "cobro", promesa_vencida: "cobro",
  convenio_por_vencer: "cobro", convenio_incumplido_3: "cobro",
  // El cliente paga y su acuerdo no recibe (mig 169). Va en Cobro porque es una tarea del
  // cobrador: pedirle la cuota del acuerdo APARTE de la semana, antes de que el acuerdo venza.
  acuerdo_sin_recibir: "cobro",
  transferencia_pendiente: "plata", dinero_sin_identificar: "plata",
  soat_vence: "motos", tecno_vence: "motos", moto_retenida: "motos",
  taller_demorado: "motos", prestamo_doc_vence: "motos", validar_ubicacion_moto: "motos",
  contrato_sin_activar: "contratos", cesion_pendiente: "contratos",
  liquidacion_sin_firma: "contratos",
  base_completada: "contratos", traspaso_proximo: "contratos",
  // La revisión de coherencia (mig 165): no son tareas de cobro, es plata mal contada. Van en su
  // propio bloque para que no se mezclen con el trabajo del día — y porque solo ADMIN las ve.
  reparto_descuadrado: "revision", acuerdo_lista_no_cuadra: "revision",
  cajas_imposibles: "revision", saldo_negativo: "revision",
  moto_con_dos_contratos: "revision",
};

export const BLOQUE_LABEL: Record<Bloque, string> = {
  inicio: "Para empezar",
  cobro: "Cobro",
  plata: "Plata por resolver",
  motos: "Motos y papeles",
  contratos: "Contratos",
  revision: "Revisión del sistema",
};

export function bloqueDe(tipo: string): Bloque {
  return BLOQUE_DE[tipo] ?? "contratos";
}

// UNA SOLA CONSULTA PARA TODA LA APP (23-oct-2026). Antes cada pantalla que mostraba avisos
// (la campana del encabezado, el panel, Mi Día, Alertas) los pedía por su lado. Medido al abrir
// la app: la vista se calculaba DOS veces, y cada cálculo tarda 1 a 2 s en el servidor. Ahora
// todas comparten la misma lista, y al volver a la app solo se recalcula si ya pasó un minuto
// (igual que las tablas de `createTableStore`).
const CACHE_VIEJA_MS = 60_000;

type EstadoPendientes = { pendientes: Pendiente[]; atendidos: Atendido[]; loading: boolean; error: string | null };
let estado: EstadoPendientes = { pendientes: [], atendidos: [], loading: true, error: null };
let enCurso: Promise<void> | null = null;
let ultimaCarga = 0;
let escuchandoVuelta = false;
const suscriptores = new Set<() => void>();

async function pedirPendientes() {
  const [p, a] = await Promise.all([
    // `pendientes_activos` = lo mismo que `pendientes` pero SIN lo pospuesto a una fecha
    // futura (mig 165). La vista cruda se deja quieta: se le agregan avisos leyéndola con
    // pg_get_viewdef, y envolverla rompería el próximo parche en silencio.
    supabase.from("pendientes_activos").select("*").order("orden").order("dias", { ascending: false }),
    supabase.from("pendientes_atendidos").select("clave, fecha, atendido_por, nota").eq("fecha", hoyISO()),
  ]);
  estado = {
    pendientes: p.error ? estado.pendientes : (p.data ?? []) as Pendiente[],
    atendidos: (a.data ?? []) as Atendido[],
    loading: false,
    error: p.error ? p.error.message : null,
  };
  ultimaCarga = Date.now();
  for (const s of suscriptores) s();
}

/**
 * `forzar`: después de marcar o posponer, la lista TIENE que salir con el cambio. Si había una
 * consulta en vuelo, empezó antes del cambio: se espera y se pide otra.
 */
async function cargarPendientes(forzar = false): Promise<void> {
  if (enCurso) {
    if (!forzar) return enCurso;
    await enCurso.catch(() => {});
  }
  const esta = pedirPendientes().finally(() => { if (enCurso === esta) enCurso = null; });
  enCurso = esta;
  return esta;
}

function suscribir(s: () => void) {
  suscriptores.add(s);
  if (ultimaCarga === 0 || Date.now() - ultimaCarga >= CACHE_VIEJA_MS) void cargarPendientes();
  if (!escuchandoVuelta && typeof document !== "undefined") {
    escuchandoVuelta = true;
    // Al volver a la app (el celular estuvo bloqueado, el PC suspendido) la lista puede estar
    // vieja. Misma red de seguridad que el store compartido, con el mismo tope de un minuto.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible" || suscriptores.size === 0) return;
      if (Date.now() - ultimaCarga >= CACHE_VIEJA_MS) void cargarPendientes();
    });
  }
  return () => { suscriptores.delete(s); };
}

export function usePendientes() {
  const { pendientes, atendidos, loading, error } = useSyncExternalStore(suscribir, () => estado);
  const cargar = useCallback(() => cargarPendientes(true), []);

  /** Marcar que ya lo gestioné hoy. Mañana vuelve a aparecer si sigue vigente. */
  async function marcarAtendido(clave: string, quien: string, nota?: string) {
    const { error: err } = await supabase.from("pendientes_atendidos")
      .upsert({ clave, fecha: hoyISO(), atendido_por: quien, nota: nota ?? null }, { onConflict: "clave,fecha" });
    if (!err) await cargar();
    return { error: err?.message ?? null };
  }

  /**
   * Dormir un aviso hasta una fecha, con el motivo escrito (mig 165).
   *
   * POR QUÉ EXISTE: "atendido" dura un día. Para lo que ya se sabe y no depende de nosotros —un
   * cliente al que hay que citar para reconstruirle la cuenta— eso significa verlo todos los días
   * hasta que venga. Y el ruido es lo que hizo que 431 avisos taparan 20 SOAT vencidos.
   *
   * El motivo es obligatorio: un aviso silenciado sin explicación es un aviso perdido.
   */
  async function posponer(clave: string, quien: string, hasta: string, motivo: string) {
    if (!motivo.trim()) return { error: "Escribe por qué se pospone." };
    const { error: err } = await supabase.from("pendientes_atendidos")
      .upsert({ clave, fecha: hoyISO(), atendido_por: quien, nota: motivo,
                posponer_hasta: hasta, posponer_motivo: motivo }, { onConflict: "clave,fecha" });
    if (!err) await cargar();
    return { error: err?.message ?? null };
  }

  const estaAtendido = (clave: string) => atendidos.some(a => a.clave === clave);

  /**
   * Los que le tocan a esta persona: los suyos por nombre, más los de su puesto.
   *
   * 22-sep-2026 — EL JEFE VE TAMBIÉN LO DEL ADMIN. El filtro comparaba el rol exacto, así que
   * todo lo que cae en 'ADMIN' (lo que no tiene subadmin asignado: SOAT por vencer, contratos
   * sin activar, la revisión de coherencia) **no le llegaba al ADMIN_PRINCIPAL**. Eran 8 avisos
   * que él no veía, incluidos 3 SOAT y una tecnomecánica por vencer.
   * Contradecía la regla escrita del proyecto: "ADMIN_PRINCIPAL — todo sin restricción, ve TODO".
   * No al revés: el ADMIN no hereda lo del jefe.
   */
  function mios(uid: string, rol: string | null | undefined): Pendiente[] {
    return pendientes.filter(p =>
      p.dueno_id === uid
      || (p.dueno_rol && (p.dueno_rol === rol || (rol === "ADMIN_PRINCIPAL" && p.dueno_rol === "ADMIN"))));
  }

  return { pendientes, atendidos, loading, error, recargar: cargar, marcarAtendido, posponer, estaAtendido, mios };
}
