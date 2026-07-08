import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type CajaDiaria = {
  id: string;
  fecha: string;
  grupo: string;
  efectivo_total: number;
  transferencias_total: number;
  total: number;
  detalle: unknown[];
  cerrado_por: string | null;
  notas: string | null;
  created_at: string;
};

export function useCaja() {
  const [cajas, setCajas] = useState<CajaDiaria[]>([]);
  const [loading, setLoading] = useState(true);

  async function cargarCajas() {
    const { data } = await supabase
      .from("caja_diaria")
      .select("*")
      .order("fecha", { ascending: false })
      .limit(60);
    if (data) setCajas(data as CajaDiaria[]);
    setLoading(false);
  }

  useEffect(() => {
    cargarCajas();
    const channel = supabase
      .channel(`caja-realtime-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "caja_diaria" }, cargarCajas)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function cerrarCaja(params: {
    fecha: string;
    grupo: string;
    efectivo: number;
    transferencias: number;
    total: number;
    detalle: { placa: string; nombre: string; valor: number; metodo: string; grupo?: string }[];
    cerradoPor: string | null;
    notas?: string;
  }) {
    const { error } = await supabase.from("caja_diaria").upsert(
      {
        fecha: params.fecha,
        grupo: params.grupo,
        efectivo_total: params.efectivo,
        transferencias_total: params.transferencias,
        total: params.total,
        detalle: params.detalle,
        cerrado_por: params.cerradoPor,
        notas: params.notas ?? null,
      },
      { onConflict: "fecha,grupo" }
    );
    if (!error) cargarCajas();
    return { error: error?.message ?? null };
  }

  // Caja de un grupo específico en una fecha (cada portafolio se cierra por aparte).
  function cajaDia(fecha: string, grupo: string): CajaDiaria | null {
    return cajas.find(c => c.fecha === fecha && c.grupo === grupo) ?? null;
  }

  return { cajas, loading, cerrarCaja, cajaDia };
}
