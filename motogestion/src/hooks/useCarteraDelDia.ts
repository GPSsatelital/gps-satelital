import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { FechaAnotada, FilaCarteraDia } from "../utils/carteraDelDia";

// El cuaderno de la cartera (mig 190). `fechas` = los días que tienen cuaderno; `filas` = los
// contratos del día escogido (null mientras llega, o si no se escogió ninguno). Lo que llega se marca
// con el día que se pidió: al cambiar de día, lo del anterior deja de valer en ese instante, en vez de
// quedarse en pantalla con el título del nuevo.

const n = (v: unknown) => (v === null || v === undefined ? null : Number(v));

export function useCarteraDelDia(activo: boolean, fecha: string) {
  const [fechas, setFechas] = useState<FechaAnotada[]>([]);
  const [traido, setTraido] = useState<{ fecha: string; filas: FilaCarteraDia[] | null; error: boolean } | null>(null);

  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    supabase.rpc("cartera_fechas").then(({ data, error }) => {
      // Sin la mig 190 la función no existe: el selector se queda solo con "hoy".
      if (vivo && !error) setFechas((data ?? []) as FechaAnotada[]);
    });
    return () => { vivo = false; };
  }, [activo]);

  useEffect(() => {
    if (!activo || !fecha) return;
    let vivo = true;
    (async (): Promise<FilaCarteraDia[] | "error"> => {
      // Por páginas: Supabase devuelve máximo 1.000 filas sin avisar.
      const filas: FilaCarteraDia[] = [];
      for (let desde = 0; ; desde += 1000) {
        const { data, error } = await supabase.from("cartera_del_dia").select("*")
          .eq("fecha", fecha).order("contrato_id").range(desde, desde + 999);
        if (error) return "error";
        filas.push(...((data ?? []) as FilaCarteraDia[]));
        if ((data ?? []).length < 1000) return filas;
      }
    })().then(r => {
      if (!vivo) return;
      setTraido({
        fecha,
        filas: r === "error" ? null : r.map(f => ({
          ...f,
          debe_cuotas: n(f.debe_cuotas), debe_acuerdo: n(f.debe_acuerdo), debe_deudas: n(f.debe_deudas),
          debe_total: n(f.debe_total), saldo_a_favor: n(f.saldo_a_favor), dias_mora: Number(f.dias_mora ?? 0),
        })),
        error: r === "error",
      });
    });
    return () => { vivo = false; };
  }, [activo, fecha]);

  const vigente = !!fecha && traido?.fecha === fecha;
  return {
    fechas,
    filas: vigente ? traido!.filas : null,
    cargando: !!fecha && !vigente,
    error: vigente && traido!.error,
  };
}
