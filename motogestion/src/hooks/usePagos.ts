import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Contrato } from "./useContratos";

export type PagoEstado = "Confirmado" | "Pendiente" | "Rechazado";
export type MetodoPago = "Efectivo" | "Transferencia";

export type Aplicado = {
  deuda: number;
  semana: number;
  ahorro: number;
  convenio: number;
  saldo: number;
};

export type Pago = {
  id: string;
  contrato_id: string;
  valor: number;
  metodo: MetodoPago;
  estado: PagoEstado;
  aplicado: Aplicado;
  fecha: string;
  created_at: string;
};

const DEUDA_ATRASADA_BASE = 50000;
const AHORRO_META_SEMANAL_TOPE = 30000;

export function calcularEstadoCobro(contrato: Contrato, pagosConfirmados: Pago[]) {
  const totalSemanaPagado = pagosConfirmados.reduce((acc, p) => acc + p.aplicado.semana, 0);
  const totalAhorroPagado = pagosConfirmados.reduce((acc, p) => acc + p.aplicado.ahorro, 0);
  const totalDeudaPagada = pagosConfirmados.reduce((acc, p) => acc + p.aplicado.deuda, 0);

  const deudaAtrasadaPendiente = Math.max(DEUDA_ATRASADA_BASE - totalDeudaPagada, 0);
  const semanaActualPendiente = Math.max(contrato.valor_semanal - totalSemanaPagado, 0);
  const ahorroMetaSemanal = Math.min(AHORRO_META_SEMANAL_TOPE, contrato.ahorro_inicial);
  const ahorroPendiente = Math.max(ahorroMetaSemanal - totalAhorroPagado, 0);

  return { deudaAtrasadaPendiente, semanaActualPendiente, ahorroPendiente };
}

export function aplicarPagoAutomatico(monto: number, contrato: Contrato, pagosConfirmados: Pago[]): Aplicado {
  const estado = calcularEstadoCobro(contrato, pagosConfirmados);
  let restante = monto;

  const deuda = Math.min(restante, estado.deudaAtrasadaPendiente);
  restante -= deuda;

  const semana = Math.min(restante, estado.semanaActualPendiente);
  restante -= semana;

  const ahorro = Math.min(restante, estado.ahorroPendiente);
  restante -= ahorro;

  const convenio = 0;
  const saldo = restante;

  return { deuda, semana, ahorro, convenio, saldo };
}

export function usePagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPagos = useCallback(async () => {
    const { data, error } = await supabase
      .from("pagos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setPagos((data ?? []) as Pago[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPagos();

    const channel = supabase
      .channel("pagos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "pagos" }, () => {
        fetchPagos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPagos]);

  async function registrarPago(contratoId: string, valor: number, metodo: MetodoPago, aplicado: Aplicado) {
    const { error } = await supabase.from("pagos").insert({
      contrato_id: contratoId,
      valor,
      metodo,
      estado: metodo === "Transferencia" ? "Pendiente" : "Confirmado",
      aplicado,
    });
    return { error: error?.message ?? null };
  }

  async function confirmarPago(id: string) {
    const { error } = await supabase.from("pagos").update({ estado: "Confirmado" }).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function rechazarPago(id: string) {
    const { error } = await supabase.from("pagos").update({ estado: "Rechazado" }).eq("id", id);
    return { error: error?.message ?? null };
  }

  return { pagos, loading, error, registrarPago, confirmarPago, rechazarPago };
}
