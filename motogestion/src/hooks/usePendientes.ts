import { useCallback, useEffect, useState } from "react";
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
export type Bloque = "cobro" | "plata" | "motos" | "contratos";

export const BLOQUE_DE: Record<string, Bloque> = {
  recoleccion: "cobro", mora: "cobro", gabela: "cobro",
  plazo_vencido: "cobro", promesa_vencida: "cobro",
  convenio_por_vencer: "cobro", convenio_incumplido_3: "cobro",
  transferencia_pendiente: "plata", dinero_sin_identificar: "plata",
  soat_vence: "motos", tecno_vence: "motos", moto_retenida: "motos",
  taller_demorado: "motos", prestamo_doc_vence: "motos", validar_ubicacion_moto: "motos",
  contrato_sin_activar: "contratos", cesion_pendiente: "contratos",
  liquidacion_sin_firma: "contratos",
  base_completada: "contratos", traspaso_proximo: "contratos",
};

export const BLOQUE_LABEL: Record<Bloque, string> = {
  cobro: "Cobro",
  plata: "Plata por resolver",
  motos: "Motos y papeles",
  contratos: "Contratos",
};

export function bloqueDe(tipo: string): Bloque {
  return BLOQUE_DE[tipo] ?? "contratos";
}

export function usePendientes() {
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [atendidos, setAtendidos] = useState<Atendido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const [p, a] = await Promise.all([
      supabase.from("pendientes").select("*").order("orden").order("dias", { ascending: false }),
      supabase.from("pendientes_atendidos").select("clave, fecha, atendido_por, nota").eq("fecha", hoyISO()),
    ]);
    if (p.error) setError(p.error.message);
    else { setError(null); setPendientes((p.data ?? []) as Pendiente[]); }
    setAtendidos((a.data ?? []) as Atendido[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void cargar();
    // Al volver a la app (el celular estuvo bloqueado, el PC suspendido) la lista puede estar
    // vieja. Misma red de seguridad que el store compartido.
    const alVolver = () => { if (document.visibilityState === "visible") void cargar(); };
    document.addEventListener("visibilitychange", alVolver);
    return () => document.removeEventListener("visibilitychange", alVolver);
  }, [cargar]);

  /** Marcar que ya lo gestioné hoy. Mañana vuelve a aparecer si sigue vigente. */
  async function marcarAtendido(clave: string, quien: string, nota?: string) {
    const { error: err } = await supabase.from("pendientes_atendidos")
      .upsert({ clave, fecha: hoyISO(), atendido_por: quien, nota: nota ?? null }, { onConflict: "clave,fecha" });
    if (!err) await cargar();
    return { error: err?.message ?? null };
  }

  const estaAtendido = (clave: string) => atendidos.some(a => a.clave === clave);

  /** Los que le tocan a esta persona: los suyos por nombre, más los de su puesto. */
  function mios(uid: string, rol: string | null | undefined): Pendiente[] {
    return pendientes.filter(p => p.dueno_id === uid || (p.dueno_rol && p.dueno_rol === rol));
  }

  return { pendientes, atendidos, loading, error, recargar: cargar, marcarAtendido, estaAtendido, mios };
}
