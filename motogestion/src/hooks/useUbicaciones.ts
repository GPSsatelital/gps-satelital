import { supabase } from "../lib/supabase";
import { createTableStore } from "./createTableStore";

export type UbicacionFisica = "con_cliente" | "bodega" | "oficina" | "taller" | "patios_transito" | "fiscalia" | "otro";
// `prestamo_entrega` / `prestamo_devolucion` (mig 164, 22-sep-2026): prestar un reemplazo era el
// único momento en que una moto cambiaba de manos sin dejar evidencia. Van con nombre propio y no
// dentro de "otro" — el atajo de "otro" ya se pagó caro con el alquiler del reemplazo (mig 131).
export type MotivoRecepcion = "retencion_mora" | "entrega_voluntaria" | "liquidacion" | "nuevo_registro" | "otro" | "prestamo_entrega" | "prestamo_devolucion";
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
  prestamo_entrega: "Salida de moto prestada (reemplazo)",
  prestamo_devolucion: "Devolución de moto prestada (reemplazo)",
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
  /**
   * Pedido del dueño (2-sep-2026), mig 122. `null` = la recepción es anterior y no se preguntó:
   * no se le inventa un dato a lo viejo.
   *  · lavado: se marcó "hay que mandarla a lavar" → nació la deuda de VALOR_LAVADA.
   *  · llave_entregada: true = el cliente entregó su llave · false = hubo que ir con la copia de
   *    la empresa → al devolverle la moto hay que PEDÍRSELA (y cobrársela si liquida — pendiente).
   */
  lavado: boolean | null;
  llave_entregada: boolean | null;
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

// UNA SOLA LISTA PARA TODA LA APP (23-oct-2026, D-055). Antes cada una de las 14 pantallas y
// ventanas que usan este hook tenía SU PROPIA copia, y la que guardaba solo refrescaba la suya. La
// lista de Inmovilizaciones nunca se enteraba: además, la base no avisaba de cambios en estas tres
// tablas (no estaban en `supabase_realtime`, medido el 23-oct; la mig 205 las agrega). Resultado:
// resuelto el tiempo y entregada la moto, seguía saliendo «retenida · tiempo por resolver», y se
// hacía todo otra vez — 9 decisiones repetidas, 2 con las semanas rodadas dos veces (JORGE BELLO,
// JESUS QUIÑONEZ). Ahora las tres viven en el store compartido y cada escritura lo refresca enseguida.
const historialStore = createTableStore<HistorialUbicacion>("historial_ubicaciones");
const recepcionesStore = createTableStore<RecepcionVehiculo>("recepciones_vehiculo");
const acuerdosStore = createTableStore<AcuerdoTiempoRodado>("acuerdos_tiempo_rodado");

export function useUbicaciones() {
  const { data: historial } = historialStore.useStore();
  const { data: recepciones } = recepcionesStore.useStore();
  const { data: acuerdos } = acuerdosStore.useStore();

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
    if (!error) void historialStore.refetch(true);
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
    /** Ver `RecepcionVehiculo`: se guardan tal cual; sin responder = null, nunca se inventa. */
    lavado?: boolean | null;
    llave_entregada?: boolean | null;
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
      lavado: data.lavado ?? null,
      llave_entregada: data.llave_entregada ?? null,
    });
    if (errRec) return { error: errRec.message };

    // Estas dos fallaban EN SILENCIO: si el permiso no alcanzaba, la recepción quedaba guardada
    // pero la moto seguía figurando donde estaba y el historial se perdía, sin que nadie se
    // enterara. Ahora se avisan (la recepción SÍ quedó, así que no es un error que la deshaga).
    const { error: errMoto } = await supabase.from("motos").update({
      ubicacion_fisica: data.ubicacion_destino,
    }).eq("id", data.moto_id);

    const { error: errHist } = await supabase.from("historial_ubicaciones").insert({
      moto_id: data.moto_id,
      ubicacion_anterior: data.ubicacion_anterior ?? null,
      ubicacion_nueva: data.ubicacion_destino,
      motivo: MOTIVO_RECEPCION_LABEL[data.motivo],
      registrado_por: data.quien_recibe,
    });

    // Antes de devolver: quien llamó cierra su ventana y la lista ya tiene que mostrar la moto en su sitio.
    await Promise.all([recepcionesStore.refetch(true), historialStore.refetch(true)]);

    const avisos = [
      errMoto ? `no se pudo cambiar la ubicación de la moto (${errMoto.message})` : null,
      errHist ? `no quedó el registro en el historial de ubicaciones (${errHist.message})` : null,
    ].filter(Boolean);

    return { error: null, aviso: avisos.length ? `La recepción quedó guardada, pero ${avisos.join(" y ")}.` : null };
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
    const { data: inserted, error } = await supabase.from("acuerdos_tiempo_rodado").insert({
      ...data,
      total_a_cobrar: total,
      recepcion_id: data.recepcion_id ?? null,
      fecha_salida: data.fecha_salida ?? null,
      nueva_fecha_fin_contrato: data.nueva_fecha_fin_contrato ?? null,
      observaciones: data.observaciones ?? null,
    }).select("id").single();
    if (!error) await acuerdosStore.refetch(true);
    return { error: error?.message ?? null, id: inserted?.id ?? null };
  }

  async function subirDocumentoAcuerdo(acuerdoId: string, file: File) {
    const ext = file.name.split(".").pop();
    const path = `acuerdos/${acuerdoId}/firmado.${ext}`;
    // Bucket "documentos" (el mismo que usan contratos/clientes) — "liquidaciones" nunca se creó,
    // ninguna migración lo registra en storage.buckets, así que la subida fallaba en silencio.
    const { error: up } = await supabase.storage.from("documentos").upload(path, file, { upsert: true });
    if (up) return { error: up.message };
    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
    const { error } = await supabase.from("acuerdos_tiempo_rodado").update({ documento_firmado_url: data.publicUrl }).eq("id", acuerdoId);
    if (!error) void acuerdosStore.refetch(true);
    return { error: error?.message ?? null };
  }

  async function subirFotoRecepcion(recepcionId: string, file: File, indice: number) {
    const ext = file.name.split(".").pop();
    const path = `recepciones/${recepcionId}/foto_${indice}.${ext}`;
    const { error: up } = await supabase.storage.from("documentos").upload(path, file, { upsert: true });
    if (up) return { error: up.message, url: null };
    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
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
