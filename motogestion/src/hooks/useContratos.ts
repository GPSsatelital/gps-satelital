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
  ahorro_domingo?: number;
  base_inicial?: number;
  base_completada?: boolean;
  ahorro_acumulado?: number;
  contrato_pdf_url?: string | null;
  pagare_pdf_url?: string | null;
  certificado_pdf_url?: string | null;
  created_at: string;
};

export type TipoDocumentoContrato = "contrato_pdf_url" | "pagare_pdf_url" | "certificado_pdf_url";

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

// Fecha del corte de cuentas de la migración: los saldos anteriores viven como
// deuda de apertura, así que ningún reloj de "días sin pago" puede arrancar antes.
export const FECHA_CORTE_MIGRACION = "2026-07-01";

// Días sin pago registrado. Sin pagos en el sistema: cuenta desde la entrega,
// pero nunca antes del corte de migración.
export function diasDesdeUltimoPago(ultimoPagoFecha: string | null, fechaEntrega: string | null): number | null {
  const base = ultimoPagoFecha
    ?? (fechaEntrega ? (fechaEntrega > FECHA_CORTE_MIGRACION ? fechaEntrega : FECHA_CORTE_MIGRACION) : null);
  if (!base) return null;
  return Math.floor((Date.now() - new Date(base + "T00:00:00").getTime()) / 86400000);
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
  ahorro_domingo?: number;
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

  async function reactivarContrato(id: string, motoId: string | null) {
    const { error: errContrato } = await supabase.from("contratos").update({ estado: "Activo" }).eq("id", id);
    if (errContrato) return { error: errContrato.message };

    if (motoId) {
      const { error: errMoto } = await supabase.from("motos").update({ estado: "Asignada" }).eq("id", motoId);
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

  const CAMPOS_EDITABLES_LABEL: Record<string, string> = {
    forma_pago: "Modalidad",
    dia_pago: "Día de pago",
    valor_semanal: "Valor por período",
    tarifa_diaria: "Tarifa L-S",
    tarifa_domingo: "Tarifa domingo",
    ahorro_diario: "Ahorro L-S",
    ahorro_domingo: "Ahorro domingo",
    meses: "Meses",
    ahorro_inicial: "Ahorro inicial",
    fecha_entrega: "Fecha entrega",
    ahorro_acumulado: "Ahorro acumulado",
  };

  async function editarContrato(
    contratoActual: Contrato,
    cambios: Partial<Pick<Contrato, "forma_pago" | "dia_pago" | "valor_semanal" | "tarifa_diaria" | "tarifa_domingo" | "ahorro_diario" | "ahorro_domingo" | "meses" | "ahorro_inicial" | "fecha_entrega" | "ahorro_acumulado">>,
    editadoPor: string,
  ) {
    const camposModificados = (Object.keys(cambios) as (keyof typeof cambios)[]).filter(
      campo => cambios[campo] !== undefined && cambios[campo] !== (contratoActual as any)[campo]
    );
    if (camposModificados.length === 0) return { error: null };

    const { error } = await supabase.from("contratos").update(cambios).eq("id", contratoActual.id);
    if (error) return { error: error.message };

    const filasAuditoria = camposModificados.map(campo => ({
      contrato_id: contratoActual.id,
      campo: CAMPOS_EDITABLES_LABEL[campo] ?? campo,
      valor_anterior: String((contratoActual as any)[campo] ?? ""),
      valor_nuevo: String((cambios as any)[campo] ?? ""),
      editado_por: editadoPor,
    }));
    await supabase.from("contratos_auditoria").insert(filasAuditoria);

    return { error: null };
  }

  const DOCUMENTO_LABEL: Record<TipoDocumentoContrato, string> = {
    contrato_pdf_url: "Documento: contrato firmado",
    pagare_pdf_url: "Documento: pagaré firmado",
    certificado_pdf_url: "Documento: certificado",
  };

  // Adjunta o reemplaza el escaneo/foto de un documento firmado en un contrato ya creado
  // (el wizard solo los captura al momento de crear el contrato — esto cubre los contratos
  // migrados o cualquier corrección posterior).
  async function adjuntarDocumentoContrato(
    contrato: Contrato,
    tipo: TipoDocumentoContrato,
    file: File,
    editadoPor: string,
  ): Promise<{ url: string | null; error: string | null }> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `contratos-docs/${contrato.id}/${tipo}-${Date.now()}.${ext}`;
    const { error: up } = await supabase.storage.from("documentos").upload(path, file, { upsert: true });
    if (up) return { url: null, error: up.message };
    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
    const url = data.publicUrl;

    const { error } = await supabase.from("contratos").update({ [tipo]: url }).eq("id", contrato.id);
    if (error) return { url: null, error: error.message };

    await supabase.from("contratos_auditoria").insert({
      contrato_id: contrato.id,
      campo: DOCUMENTO_LABEL[tipo],
      valor_anterior: contrato[tipo] ? "Archivo anterior" : "Sin archivo",
      valor_nuevo: "Archivo subido",
      editado_por: editadoPor,
    });

    return { url, error: null };
  }

  async function obtenerAuditoria(contratoId: string) {
    const { data, error } = await supabase
      .from("contratos_auditoria")
      .select("*, profiles(nombre)")
      .eq("contrato_id", contratoId)
      .order("created_at", { ascending: false });
    return { data: data ?? [], error: error?.message ?? null };
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
    reactivarContrato,
    finalizarContrato,
    actualizarAhorro,
    editarContrato,
    adjuntarDocumentoContrato,
    obtenerAuditoria,
    calcularEquivalenciasDiarias,
    calcularProrrateo,
  };
}
