import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type ContratoEstado = "En proceso" | "Activo" | "Finalizado" | "Cancelado";
export type FormaPago = "Diario" | "Semanal" | "Quincenal" | "Mensual";

// Días por período según modalidad
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
  valor_semanal: number;   // cuota pactada por período (nombre legacy, aplica a todos los períodos)
  meses: number | null;    // null para contratos diarios (indefinidos)
  ahorro_inicial: number;
  fecha_entrega: string | null;
  firma_cliente: boolean;
  firma_responsable: boolean;
  estado: ContratoEstado;
  tarifa_diaria?: number;
  tarifa_domingo?: number;
  base_inicial?: number;
  base_completada?: boolean;
  ahorro_acumulado?: number;
  created_at: string;
};

// Equivalencias diarias para prorrateos y liquidaciones
export function calcularEquivalenciasDiarias(contrato: Contrato): {
  cuotaDiaria: number;       // cuota pactada / días del período (incluye ahorro)
  tarifaDiaria: number;      // solo lo que le corresponde a la empresa
  ahorroDiario: number;      // porción de ahorro dentro de la cuota diaria
  diasPeriodo: number;
} {
  const forma = contrato.forma_pago ?? "Semanal";
  const dias = DIAS_POR_PERIODO[forma];
  const cuotaDiaria = Math.round(contrato.valor_semanal / dias);
  const tarifaDiaria = contrato.tarifa_diaria ?? 27000;
  const ahorroDiario = Math.max(cuotaDiaria - tarifaDiaria, 0);
  return { cuotaDiaria, tarifaDiaria, ahorroDiario, diasPeriodo: dias };
}

// Calcula el valor de un prorrateo
// En liquidación solo se cobra tarifa (sin ahorro)
export function calcularProrrateo(contrato: Contrato, dias: number, esLiquidacion = false): number {
  const { cuotaDiaria, tarifaDiaria, ahorroDiario } = calcularEquivalenciasDiarias(contrato);
  const valorDia = esLiquidacion ? tarifaDiaria : cuotaDiaria;
  // Domingo descuenta el ahorro y aplica mitad de tarifa
  return valorDia * dias;
}

export type NuevoContrato = {
  cliente_id: string;
  dia_pago: string;
  forma_pago: FormaPago;
  valor_semanal: number;
  meses: number | null;
  ahorro_inicial: number;
  fecha_entrega: string;
  tarifa_diaria?: number;
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
    const { error } = await supabase.from("contratos").insert({
      ...nuevo,
      estado: "En proceso",
      // Contratos diarios no tienen duración definida
      meses: nuevo.forma_pago === "Diario" ? null : nuevo.meses,
    });
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

  return { contratos, loading, error, crearContrato, firmarCliente, asignarMoto, activarContrato, cancelarContrato, calcularEquivalenciasDiarias, calcularProrrateo };
}
