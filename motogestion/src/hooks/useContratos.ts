import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type ContratoEstado = "En proceso" | "Activo" | "Finalizado" | "Cancelado";

export type Contrato = {
  id: string;
  cliente_id: string;
  moto_id: string | null;
  dia_pago: string;
  valor_semanal: number;
  meses: number;
  ahorro_inicial: number;
  fecha_entrega: string | null;
  firma_cliente: boolean;
  firma_responsable: boolean;
  estado: ContratoEstado;
  // Nuevos campos v2 — opcionales para compatibilidad con contratos existentes
  tipo_contrato?: "diario" | "semanal";
  tarifa_diaria?: number;
  tarifa_domingo?: number;
  base_inicial?: number;
  base_completada?: boolean;
  ahorro_acumulado?: number;
  created_at: string;
};

export type NuevoContrato = {
  cliente_id: string;
  dia_pago: string;
  valor_semanal: number;
  meses: number;
  ahorro_inicial: number;
  fecha_entrega: string;
};

export function useContratos() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContratos = useCallback(async () => {
    const { data, error } = await supabase
      .from("contratos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setContratos((data ?? []) as Contrato[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContratos();

    const channel = supabase
      .channel("contratos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "contratos" }, () => {
        fetchContratos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchContratos]);

  async function crearContrato(nuevo: NuevoContrato) {
    const { error } = await supabase.from("contratos").insert({ ...nuevo, estado: "En proceso" });
    return { error: error?.message ?? null };
  }

  async function firmarCliente(id: string) {
    const { error } = await supabase.from("contratos").update({ firma_cliente: true }).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function asignarMoto(id: string, motoId: string) {
    const { error: errContrato } = await supabase.from("contratos").update({ moto_id: motoId }).eq("id", id);
    if (errContrato) return { error: errContrato.message };

    const { error: errMoto } = await supabase.from("motos").update({ estado: "Reservada" }).eq("id", motoId);
    return { error: errMoto?.message ?? null };
  }

  async function activarContrato(id: string, motoId: string, clienteId: string) {
    const { error: errContrato } = await supabase
      .from("contratos")
      .update({ estado: "Activo", firma_responsable: true })
      .eq("id", id);
    if (errContrato) return { error: errContrato.message };

    const { error: errMoto } = await supabase.from("motos").update({ estado: "Asignada" }).eq("id", motoId);
    if (errMoto) return { error: errMoto.message };

    const { error: errCliente } = await supabase.from("clientes").update({ estado: "Activo" }).eq("id", clienteId);
    return { error: errCliente?.message ?? null };
  }

  async function cancelarContrato(id: string, motoId: string | null) {
    const { error: errContrato } = await supabase.from("contratos").update({ estado: "Cancelado" }).eq("id", id);
    if (errContrato) return { error: errContrato.message };

    if (motoId) {
      const { error: errMoto } = await supabase.from("motos").update({ estado: "Disponible" }).eq("id", motoId);
      if (errMoto) return { error: errMoto.message };
    }

    return { error: null };
  }

  return { contratos, loading, error, crearContrato, firmarCliente, asignarMoto, activarContrato, cancelarContrato };
}
