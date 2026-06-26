import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type ContratoEstado = "En proceso" | "Activo" | "Finalizado" | "Cancelado" | "Suspendido";
export type FormaPago = "Diario" | "Semanal" | "Quincenal" | "Mensual";

const DIAS_POR_PERIODO: Record<FormaPago, number> = {
  Diario: 1,
  Semanal: 7,
  Quincenal: 15,
  Mensual: 30,
};

export type Contrato = {
  id: string;
  cliente_id: string;
  moto_id: string | null;
  dia_pago: string;
  forma_pago: FormaPago;
  valor_semanal: number;
  meses: number | null;
  ahorro_inicial: number;
  fecha_entrega: string | null;
  firma_cliente: boolean;
  firma_responsable: boolean;
  estado: ContratoEstado;
  tipo_ruta?: string;
  tarifa_diaria?: number;
  tarifa_domingo?: number;
  ahorro_diario?: number;
  base_inicial?: number;
  base_completada?: boolean;
  ahorro_acumulado?: number;
  created_at: string;
};

export function calcularEquivalenciasDiarias(contrato: Contrato): {
  cuotaDiaria: number;
  tarifaDiaria: number;
  ahorroDiario: number;
  diasPeriodo: number;
} {
  const forma = contrato.forma_pago ?? "Semanal";
  const dias = DIAS_POR_PERIODO[forma];
  const cuotaDiaria = Math.round(contrato.valor_semanal / dias);
  const tarifaDiaria = contrato.tarifa_diaria ?? 27000;
  const ahorroDiario = Math.max(cuotaDiaria - tarifaDiaria, 0);
  return { cuotaDiaria, tarifaDiaria, ahorroDiario, diasPeriodo: dias };
}

export function calcularProrrateo(contrato: Contrato, dias: number, esLiquidacion = false): number {
  const { cuotaDiaria, tarifaDiaria } = calcularEquivalenciasDiarias(contrato);
  const valorDia = esLiquidacion ? tarifaDiaria : cuotaDiaria;
  return valorDia * dias;
}

// Calcula los días hasta el próximo lunes o miércoles
export function diasHastaProximoDiaPago(fechaBase: string): { diasHasta: number; proximaFecha: string; diaSemana: string } {
  const base = new Date(fechaBase + "T00:00:00");
  const dow = base.getDay(); // 0=dom,1=lun,2=mar,3=mie,4=jue,5=vie,6=sab
  // Próximo lunes (1) o miércoles (3)
  let diasLunes = (1 - dow + 7) % 7 || 7;
  let diasMiercoles = (3 - dow + 7) % 7 || 7;
  let diasHasta: number;
  let diaSemana: string;
  if (diasLunes <= diasMiercoles) {
    diasHasta = diasLunes;
    diaSemana = "Lunes";
  } else {
    diasHasta = diasMiercoles;
    diaSemana = "Miércoles";
  }
  const proxima = new Date(base);
  proxima.setDate(proxima.getDate() + diasHasta);
  return { diasHasta, proximaFecha: proxima.toISOString().slice(0, 10), diaSemana };
}

export type NuevoContrato = {
  cliente_id: string;
  dia_pago: string;
  forma_pago: FormaPago;
  valor_semanal: number;
  meses: number | null;
  ahorro_inicial: number;
  fecha_entrega: string;
  tipo_ruta?: string;
  tarifa_diaria?: number;
  tarifa_domingo?: number;
  ahorro_diario?: number;
  base_inicial?: number;
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
      .channel(`contratos-realtime-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "contratos" }, () => {
        fetchContratos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchContratos]);

  async function crearContrato(nuevo: NuevoContrato): Promise<{ id: string | null; error: string | null }> {
    const { data, error } = await supabase.from("contratos").insert({
      ...nuevo,
      estado: "En proceso",
      meses: nuevo.forma_pago === "Diario" ? null : nuevo.meses,
      ahorro_acumulado: nuevo.ahorro_inicial ?? 0,
      base_completada: false,
    }).select("id").single();
    return { id: data?.id ?? null, error: error?.message ?? null };
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

  async function suspenderContrato(id: string, motoId: string | null) {
    const { error: errContrato } = await supabase.from("contratos").update({ estado: "Suspendido" }).eq("id", id);
    if (errContrato) return { error: errContrato.message };

    if (motoId) {
      const { error: errMoto } = await supabase.from("motos").update({ estado: "Recuperada" }).eq("id", motoId);
      if (errMoto) return { error: errMoto.message };
    }

    return { error: null };
  }

  async function finalizarContrato(id: string, motoId: string | null) {
    const { error: errContrato } = await supabase.from("contratos").update({ estado: "Finalizado" }).eq("id", id);
    if (errContrato) return { error: errContrato.message };

    if (motoId) {
      const { error: errMoto } = await supabase.from("motos").update({ estado: "Disponible" }).eq("id", motoId);
      if (errMoto) return { error: errMoto.message };
    }

    return { error: null };
  }

  async function actualizarAhorro(id: string, nuevoAhorro: number) {
    const completada = nuevoAhorro >= 510000;
    const { error } = await supabase
      .from("contratos")
      .update({ ahorro_acumulado: nuevoAhorro, base_completada: completada })
      .eq("id", id);
    return { error: error?.message ?? null, baseCompletada: completada };
  }

  return {
    contratos,
    loading,
    error,
    crearContrato,
    firmarCliente,
    asignarMoto,
    activarContrato,
    cancelarContrato,
    suspenderContrato,
    finalizarContrato,
    actualizarAhorro,
    calcularEquivalenciasDiarias,
    calcularProrrateo,
  };
}
