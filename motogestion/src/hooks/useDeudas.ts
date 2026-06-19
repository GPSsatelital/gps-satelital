import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type ConceptoDeuda = "tarifa_atrasada" | "daño_vehiculo" | "prestamo_repuesto" | "prestamo_eventualidad" | "fotomulta" | "otro";
export type EstadoDeuda = "pendiente" | "en_convenio" | "pagada";

export type Deuda = {
  id: string;
  contrato_id: string;
  concepto: ConceptoDeuda;
  descripcion: string;
  monto: number;
  monto_pendiente: number;
  estado: EstadoDeuda;
  registrado_por: string | null;
  created_at: string;
};

export function useDeudas() {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDeudas() {
    const { data, error } = await supabase.from("deudas").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setDeudas((data ?? []) as Deuda[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchDeudas();
    const channel = supabase.channel("deudas-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "deudas" }, fetchDeudas)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function registrarDeuda(contratoId: string, concepto: ConceptoDeuda, descripcion: string, monto: number, registradoPor: string) {
    const { error } = await supabase.from("deudas").insert({
      contrato_id: contratoId,
      concepto,
      descripcion,
      monto,
      monto_pendiente: monto,
      estado: "pendiente",
      registrado_por: registradoPor,
    });
    return { error: error?.message ?? null };
  }

  async function marcarDeudaPagada(id: string) {
    const { error } = await supabase.from("deudas").update({ estado: "pagada", monto_pendiente: 0 }).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function actualizarMontoPendiente(id: string, montoPendiente: number) {
    const estado = montoPendiente <= 0 ? "pagada" : "en_convenio";
    const { error } = await supabase.from("deudas").update({ monto_pendiente: montoPendiente, estado }).eq("id", id);
    return { error: error?.message ?? null };
  }

  return { deudas, loading, error, registrarDeuda, marcarDeudaPagada, actualizarMontoPendiente };
}
