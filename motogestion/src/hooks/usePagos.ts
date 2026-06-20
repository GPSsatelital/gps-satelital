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
  cuotaPactadaPendiente: number;
  deudaPendiente: number;
  convenioPendiente: number;
  totalEsperado: number;
};

// Domingo siempre es la mitad de la tarifa L–S
export function calcularCuotaDia(tarifaBase: number, esDomingo: boolean): number {
  return esDomingo ? Math.round(tarifaBase / 2) : tarifaBase;
}

// Orden estricto: cuota pactada → deuda → convenio → saldo a favor (no se aplica solo)
export function calcularAplicacion(
  monto: number,
  cuotaPactada: number,
  deudaPendiente: number,
  cuotaConvenio: number,
): AplicadoPago {
  let resto = monto;

  const tarifa = Math.min(resto, cuotaPactada);
  resto -= tarifa;

  const deuda = Math.min(resto, deudaPendiente);
  resto -= deuda;

  const convenio = Math.min(resto, cuotaConvenio);
  resto -= convenio;

  return { tarifa, deuda, convenio, ahorro: 0, saldo: resto };
}

export function calcularResumenCobro(
  cuotaPactada: number,
  deudaPendiente: number,
  cuotaConvenio: number,
  pagosConfirmadosPeriodo: number,
): ResumenCobro {
  const cuotaPactadaPendiente = Math.max(cuotaPactada - pagosConfirmadosPeriodo, 0);
  return {
    cuotaPactadaPendiente,
    deudaPendiente,
    convenioPendiente: cuotaConvenio,
    totalEsperado: cuotaPactadaPendiente + deudaPendiente + cuotaConvenio,
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
