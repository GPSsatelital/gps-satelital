import { supabase } from "../lib/supabase";
import { hoyISO } from "../utils/fecha";
import { createTableStore } from "./createTableStore";

// LAS TAREAS QUE ALGUIEN LE MONTA A OTRO (mig 140, pedido del dueño 10-sep-2026).
//
// No son las del día a día —esas las arma el sistema solo con la cartera—: son el trabajo puntual
// que hoy se pide por WhatsApp y del que no queda rastro. Recoger una tarjeta de propiedad, ir a
// buscar una moto que no cumplió la cita, verificar una dirección.
//
// Ver `docs/FLUJO-DIARIO.md`. Las tres reglas del dueño viven en la BASE, no acá: quién puede
// asignar (permiso `asignar_tarea`), qué evidencia exige cada tarea (un arreglo, abierto a más
// tipos) y que "no se pudo" obliga a decir por qué (un CHECK, no la pantalla).

/** Lo que una tarea puede exigir al resolverse. Abierto a propósito: el dueño dijo "abierto a más
 *  posibilidades", así que agregar un tipo nuevo es agregarlo acá y en la pantalla — la base no
 *  tiene una lista cerrada que haya que migrar. */
export type TipoEvidencia = "foto" | "ubicacion" | "comentario" | "firma";

export const EVIDENCIA_LABEL: Record<TipoEvidencia, string> = {
  foto: "Foto",
  ubicacion: "Ubicación",
  comentario: "Comentario",
  firma: "Firma del cliente",
};

export type EstadoTarea = "pendiente" | "cumplida" | "no_se_pudo" | "cancelada";

export type Tarea = {
  id: string;
  titulo: string;
  detalle: string | null;
  asignada_a: string;
  asignada_por: string;
  contrato_id: string | null;
  moto_id: string | null;
  cliente_id: string | null;
  fecha_limite: string | null;
  evidencias_requeridas: TipoEvidencia[];
  estado: EstadoTarea;
  resultado_comentario: string | null;
  resultado_fotos: string[];
  resultado_ubicacion: { lat: number; lng: number } | null;
  resultado_firma_url: string | null;
  motivo_no_se_pudo: string | null;
  resuelta_el: string | null;
  resuelta_por: string | null;
  created_at: string;
};

const tareasStore = createTableStore<Tarea>("tareas");

/** Vencida = tenía fecha límite, ya pasó, y sigue sin resolverse. */
export function tareaVencida(t: Tarea): boolean {
  return t.estado === "pendiente" && !!t.fecha_limite && t.fecha_limite < hoyISO();
}

export type NuevaTarea = {
  titulo: string;
  detalle?: string;
  asignada_a: string;
  contrato_id?: string | null;
  moto_id?: string | null;
  cliente_id?: string | null;
  fecha_limite?: string | null;
  evidencias_requeridas?: TipoEvidencia[];
};

export function useTareas() {
  const { data: tareas, loading } = tareasStore.useStore();

  // Cinturón y tirantes: después de cada escritura se pide la tabla, sin esperar el aviso del
  // servidor. El realtime ya la refresca (mig 141), pero si ese canal se cae —o la tabla se sale
  // de la publicación, que fue justo lo que pasó al estrenar esto— la persona vería una pantalla
  // que no reacciona y volvería a hacer lo mismo. Ya pasó con un cobro duplicado esta semana.
  const refrescar = () => { void tareasStore.refetch(); };

  async function crearTarea(t: NuevaTarea, asignadaPor: string) {
    if (!t.titulo.trim()) return { error: "Escribe qué hay que hacer." };
    // `asignada_por` va explícito porque la política de la base exige que coincida con quien está
    // conectado: así nadie puede montar una tarea a nombre de otro.
    const { error } = await supabase.from("tareas").insert({
      titulo: t.titulo.trim(),
      detalle: t.detalle?.trim() || null,
      asignada_a: t.asignada_a,
      asignada_por: asignadaPor,
      contrato_id: t.contrato_id ?? null,
      moto_id: t.moto_id ?? null,
      cliente_id: t.cliente_id ?? null,
      fecha_limite: t.fecha_limite ?? null,
      evidencias_requeridas: t.evidencias_requeridas ?? [],
    });
    if (!error) refrescar();
    return { error: error?.message ?? null };
  }

  /**
   * La cumplió. La evidencia que se guarda es la que la tarea exigía; si falta alguna, se rechaza
   * ACÁ y no al llegar a la base, para poder decir cuál falta con nombre propio.
   */
  async function cumplirTarea(
    t: Tarea,
    quien: string,
    ev: { comentario?: string; fotos?: string[]; ubicacion?: { lat: number; lng: number } | null; firmaUrl?: string | null },
  ) {
    const faltan: string[] = [];
    if (t.evidencias_requeridas.includes("comentario") && !ev.comentario?.trim()) faltan.push("el comentario");
    if (t.evidencias_requeridas.includes("foto") && !(ev.fotos ?? []).length) faltan.push("la foto");
    if (t.evidencias_requeridas.includes("ubicacion") && !ev.ubicacion) faltan.push("la ubicación");
    if (t.evidencias_requeridas.includes("firma") && !ev.firmaUrl) faltan.push("la firma");
    if (faltan.length) return { error: `Esta tarea pide ${faltan.join(" y ")}.` };

    const { error } = await supabase.from("tareas").update({
      estado: "cumplida",
      resultado_comentario: ev.comentario?.trim() || null,
      resultado_fotos: ev.fotos ?? [],
      resultado_ubicacion: ev.ubicacion ?? null,
      resultado_firma_url: ev.firmaUrl ?? null,
      resuelta_el: new Date().toISOString(),
      resuelta_por: quien,
    }).eq("id", t.id);
    if (!error) refrescar();
    return { error: error?.message ?? null };
  }

  /**
   * No se pudo. El motivo es OBLIGATORIO — y no solo acá: la base tiene un CHECK que rechaza la
   * fila sin él. Es lo que evita que se marque cumplido lo que no se hizo, y lo que hace que quien
   * la mandó se entere el mismo día en vez de descubrirlo tarde.
   */
  async function noSePudo(tareaId: string, motivo: string, quien: string) {
    if (!motivo.trim()) return { error: "Escribe por qué no se pudo." };
    const { error } = await supabase.from("tareas").update({
      estado: "no_se_pudo",
      motivo_no_se_pudo: motivo.trim(),
      resuelta_el: new Date().toISOString(),
      resuelta_por: quien,
    }).eq("id", tareaId);
    if (!error) refrescar();
    return { error: error?.message ?? null };
  }

  /** Una tarea no se borra: se cancela, para que quede el rastro de que se pidió. */
  async function cancelarTarea(tareaId: string, quien: string) {
    const { error } = await supabase.from("tareas").update({
      estado: "cancelada", resuelta_el: new Date().toISOString(), resuelta_por: quien,
    }).eq("id", tareaId);
    if (!error) refrescar();
    return { error: error?.message ?? null };
  }

  /** Sube una foto o una firma capturada (dataURL) y devuelve su URL pública. */
  async function subirEvidencia(tareaId: string, dataUrl: string, nombre: string): Promise<string | null> {
    const blob = await (await fetch(dataUrl)).blob();
    const path = `tareas/${tareaId}/${nombre}_${Date.now()}.png`;
    const { error } = await supabase.storage.from("documentos").upload(path, blob, { contentType: "image/png", upsert: true });
    if (error) return null;
    return supabase.storage.from("documentos").getPublicUrl(path).data.publicUrl;
  }

  const misTareas = (uid: string) => tareas.filter(t => t.asignada_a === uid);
  const lasQueMande = (uid: string) => tareas.filter(t => t.asignada_por === uid);

  return { tareas, loading, crearTarea, cumplirTarea, noSePudo, cancelarTarea, subirEvidencia, misTareas, lasQueMande };
}
