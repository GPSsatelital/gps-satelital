import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type PagoEstado = "Confirmado" | "Pendiente" | "Rechazado";
export type MetodoPago = "Efectivo" | "Nequi";

export type AplicadoPago = {
  tarifa: number;
  deuda: number;
  convenio: number;
  ahorro: number;
  saldo: number;
};

// Legacy shape kept for compatibility with existing pagos stored as jsonb
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
  aplicado_tarifa: number;
  aplicado_deuda: number;
  aplicado_convenio: number;
  aplicado_ahorro: number;
  aplicado_saldo_favor: number;
  convenio_id: string | null;
  fecha: string;
  created_at: string;
};

export type ResumenCobro = {
  tarifaPendiente: number;
  deudaPendiente: number;
  convenioPendiente: number;
  ahorroPendiente: number;
  totalEsperado: number;
};

export function calcularAplicacion(
  monto: number,
  tarifaDia: number,
  deudaPendiente: number,
  cuotaConvenio: number,
  ahorroMeta: number,
): AplicadoPago {
  let resto = monto;

  const tarifa = Math.min(resto, tarifaDia);
  resto -= tarifa;

  const deuda = Math.min(resto, deudaPendiente);
  resto -= deuda;

  const convenio = Math.min(resto, cuotaConvenio);
  resto -= convenio;

  const ahorro = Math.min(resto, ahorroMeta);
  resto -= ahorro;

  return { tarifa, deuda, convenio, ahorro, saldo: resto };
}

export function calcularResumenCobro(
  tarifaDia: number,
  deudaPendiente: number,
  cuotaConvenio: number,
  pagosConfirmadosHoy: number,
): ResumenCobro {
  const tarifaPendiente = Math.max(tarifaDia - pagosConfirmadosHoy, 0);
  return {
    tarifaPendiente,
    deudaPendiente,
    convenioPendiente: cuotaConvenio,
    ahorroPendiente: 0,
    totalEsperado: tarifaPendiente + deudaPendiente + cuotaConvenio,
  };
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
    return () => { supabase.removeChannel(channel); };
  }, [fetchPagos]);

  async function registrarPago(
    contratoId: string,
    valor: number,
    metodo: MetodoPago,
    aplicado: AplicadoPago,
    convenioId?: string,
  ) {
    const estado: PagoEstado = metodo === "Efectivo" ? "Confirmado" : "Pendiente";
    // Legacy jsonb field for backwards compatibility
    const aplicadoLegacy: Aplicado = {
      deuda: aplicado.deuda,
      semana: aplicado.tarifa,
      ahorro: aplicado.ahorro,
      convenio: aplicado.convenio,
      saldo: aplicado.saldo,
    };
    const { error } = await supabase.from("pagos").insert({
      contrato_id: contratoId,
      valor,
      metodo,
      estado,
      aplicado: aplicadoLegacy,
      aplicado_tarifa: aplicado.tarifa,
      aplicado_deuda: aplicado.deuda,
      aplicado_convenio: aplicado.convenio,
      aplicado_ahorro: aplicado.ahorro,
      aplicado_saldo_favor: aplicado.saldo,
      convenio_id: convenioId ?? null,
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

  function pagosDelContrato(contratoId: string) {
    return pagos.filter(p => p.contrato_id === contratoId);
  }

  function pagosConfirmadosDelContrato(contratoId: string) {
    return pagos.filter(p => p.contrato_id === contratoId && p.estado === "Confirmado");
  }

  function totalAhorroAcumulado(contratoId: string) {
    return pagosConfirmadosDelContrato(contratoId).reduce((acc, p) => acc + (p.aplicado_ahorro ?? 0), 0);
  }

  function totalTarifaAcumulada(contratoId: string) {
    return pagosConfirmadosDelContrato(contratoId).reduce((acc, p) => acc + (p.aplicado_tarifa ?? 0), 0);
  }

  return {
    pagos,
    loading,
    error,
    registrarPago,
    confirmarPago,
    rechazarPago,
    pagosDelContrato,
    pagosConfirmadosDelContrato,
    totalAhorroAcumulado,
    totalTarifaAcumulada,
  };
}
