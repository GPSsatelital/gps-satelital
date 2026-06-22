import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type UbicacionFisica = "con_cliente" | "bodega" | "oficina" | "taller" | "patios_transito" | "fiscalia" | "otro";
export type MotivoRecepcion = "retencion_mora" | "entrega_voluntaria" | "liquidacion" | "nuevo_registro" | "otro";
export type CondicionVehiculo = "buena" | "regular" | "mala";
export type DecisionTiempo = "cobrar_ahora" | "rodar_al_final";

export const UBICACION_LABEL: Record<UbicacionFisica, string> = {
  con_cliente: "Con el cliente",
  bodega: "Bodega",
  oficina: "Oficina",
  taller: "Taller",
  patios_transito: "Patios de tránsito",
  fiscalia: "Fiscalía",
  otro: "Otro",
};

export const MOTIVO_RECEPCION_LABEL: Record<MotivoRecepcion, string> = {
  retencion_mora: "Retención por mora",
  entrega_voluntaria: "Entrega voluntaria del cliente",
  liquidacion: "Liquidación de contrato",
  nuevo_registro: "Nuevo registro de moto",
  otro: "Otro motivo",
};

export type HistorialUbicacion = {
  id: string;
  moto_id: string;
  ubicacion_anterior: string | null;
  ubicacion_nueva: string;
  detalle: string | null;
  motivo: string | null;
  registrado_por: string | null;
  created_at: string;
};

export type RecepcionVehiculo = {
  id: string;
  moto_id: string;
  contrato_id: string | null;
  cliente_id: string | null;
  motivo: MotivoRecepcion;
  condicion_general: CondicionVehiculo;
  descripcion_danos: string | null;
  kilometros: number | null;
  ubicacion_destino: string;
  quien_recibe: string | null;
  nombre_entrega: string | null;
  fotos: string[];
  observaciones: string | null;
  created_at: string;
};

export type AcuerdoTiempoRodado = {
  id: string;
  contrato_id: string;
  cliente_id: string;
  moto_id: string;
  recepcion_id: string | null;
  dias_en_empresa: number;
  valor_por_dia: number;
  total_a_cobrar: number;
  decision: DecisionTiempo;
  fecha_entrada: string;
  fecha_salida: string | null;
  nueva_fecha_fin_contrato: string | null;
  observaciones: string | null;
  documento_firmado_url: string | null;
  creado_por: string | null;
  created_at: string;
};

export function useUbicaciones() {
  const [historial, setHistorial] = useState<HistorialUbicacion[]>([]);
  const [recepciones, setRecepciones] = useState<RecepcionVehiculo[]>([]);
  const [acuerdos, setAcuerdos] = useState<AcuerdoTiempoRodado[]>([]);

  const fetchAll = useCallback(async () => {
    const [h, r, a] = await Promise.all([
      supabase.from("historial_ubicaciones").select("*").order("created_at", { ascending: false }),
      supabase.from("recepciones_vehiculo").select("*").order("created_at", { ascending: false }),
      supabase.from("acuerdos_tiempo_rodado").select("*").order("created_at", { ascending: false }),
    ]);
    setHistorial((h.data ?? []) as HistorialUbicacion[]);
    setRecepciones((r.data ?? []) as RecepcionVehiculo[]);
    setAcuerdos((a.data ?? []) as AcuerdoTiempoRodado[]);
  }, []);

  useEffect(() => {
    fetchAll();
    const ch = supabase.channel(`ubicaciones-realtime-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "historial_ubicaciones" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "recepciones_vehiculo" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "acuerdos_tiempo_rodado" }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchAll]);

  async function cambiarUbicacion(
    motoId: string,
    ubicacionAnterior: string | null,
    ubicacionNueva: UbicacionFisica,
    detalle: string,
    motivo: string,
    registradoPor: string
  ) {
    const { error: errMoto } = await supabase.from("motos").update({
      ubicacion_fisica: ubicacionNueva,
      detalle_ubicacion: detalle,
    }).eq("id", motoId);
    if (errMoto) return { error: errMoto.message };

    const { error } = await supabase.from("historial_ubicaciones").insert({
      moto_id: motoId,
      ubicacion_anterior: ubicacionAnterior,
      ubicacion_nueva: ubicacionNueva,
      detalle,
      motivo,
      registrado_por: registradoPor,
    });
    return { error: error?.message ?? null };
  }

  async function registrarRecepcion(data: {
    moto_id: string;
    contrato_id?: string;
    cliente_id?: string;
    motivo: MotivoRecepcion;
    condicion_general: CondicionVehiculo;
    descripcion_danos?: string;
    kilometros?: number;
    ubicacion_destino: UbicacionFisica;
    quien_recibe: string;
    nombre_entrega?: string;
    fotos?: string[];
    observaciones?: string;
    ubicacion_anterior?: string;
  }) {
    const { error: errRec } = await supabase.from("recepciones_vehiculo").insert({
      moto_id: data.moto_id,
      contrato_id: data.contrato_id ?? null,
      cliente_id: data.cliente_id ?? null,
      motivo: data.motivo,
      condicion_general: data.condicion_general,
      descripcion_danos: data.descripcion_danos ?? null,
      kilometros: data.kilometros ?? null,
      ubicacion_destino: data.ubicacion_destino,
      quien_recibe: data.quien_recibe,
      nombre_entrega: data.nombre_entrega ?? null,
      fotos: data.fotos ?? [],
      observaciones: data.observaciones ?? null,
    });
    if (errRec) return { error: errRec.message };

    await supabase.from("motos").update({
      ubicacion_fisica: data.ubicacion_destino,
    }).eq("id", data.moto_id);

    await supabase.from("historial_ubicaciones").insert({
      moto_id: data.moto_id,
      ubicacion_anterior: data.ubicacion_anterior ?? null,
      ubicacion_nueva: data.ubicacion_destino,
      motivo: MOTIVO_RECEPCION_LABEL[data.motivo],
      registrado_por: data.quien_recibe,
    });

    return { error: null };
  }

  async function crearAcuerdoTiempo(data: {
    contrato_id: string;
    cliente_id: string;
    moto_id: string;
    recepcion_id?: string;
    dias_en_empresa: number;
    valor_por_dia: number;
    decision: DecisionTiempo;
    fecha_entrada: string;
    fecha_salida?: string;
    nueva_fecha_fin_contrato?: string;
    observaciones?: string;
    creado_por: string;
  }) {
    const total = data.dias_en_empresa * data.valor_por_dia;
    const { error } = await supabase.from("acuerdos_tiempo_rodado").insert({
      ...data,
      total_a_cobrar: total,
      recepcion_id: data.recepcion_id ?? null,
      fecha_salida: data.fecha_salida ?? null,
      nueva_fecha_fin_contrato: data.nueva_fecha_fin_contrato ?? null,
      observaciones: data.observaciones ?? null,
    });
    return { error: error?.message ?? null };
  }

  async function subirDocumentoAcuerdo(acuerdoId: string, file: File) {
    const ext = file.name.split(".").pop();
    const path = `acuerdos/${acuerdoId}/firmado.${ext}`;
    const { error: up } = await supabase.storage.from("liquidaciones").upload(path, file, { upsert: true });
    if (up) return { error: up.message };
    const { data } = supabase.storage.from("liquidaciones").getPublicUrl(path);
    const { error } = await supabase.from("acuerdos_tiempo_rodado").update({ documento_firmado_url: data.publicUrl }).eq("id", acuerdoId);
    return { error: error?.message ?? null };
  }

  async function subirFotoRecepcion(recepcionId: string, file: File, indice: number) {
    const ext = file.name.split(".").pop();
    const path = `recepciones/${recepcionId}/foto_${indice}.${ext}`;
    const { error: up } = await supabase.storage.from("liquidaciones").upload(path, file, { upsert: true });
    if (up) return { error: up.message, url: null };
    const { data } = supabase.storage.from("liquidaciones").getPublicUrl(path);
    return { error: null, url: data.publicUrl };
  }

  function historialDeMoto(motoId: string) {
    return historial.filter((h) => h.moto_id === motoId);
  }

  function recepcionesDeMoto(motoId: string) {
    return recepciones.filter((r) => r.moto_id === motoId);
  }

  function acuerdosDeContrato(contratoId: string) {
    return acuerdos.filter((a) => a.contrato_id === contratoId);
  }

  return {
    historial,
    recepciones,
    acuerdos,
    cambiarUbicacion,
    registrarRecepcion,
    crearAcuerdoTiempo,
    subirDocumentoAcuerdo,
    subirFotoRecepcion,
    historialDeMoto,
    recepcionesDeMoto,
    acuerdosDeContrato,
  };
}
