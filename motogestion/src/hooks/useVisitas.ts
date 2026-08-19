import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// "Completada" es lo que escribe `ModalVisita`, que es la ÚNICA puerta por la que se registran
// visitas de verdad. "Realizada" venía del tipo original y de `registrarVisita()`, que resultó ser
// código muerto (nadie la llama) — se deja aceptado por si alguna fila vieja lo trae.
export type VisitaEstado = "Pendiente" | "Completada" | "Realizada";

/**
 * ¿Alguien fue de verdad a la casa del cliente?
 *
 * NO confundir con "aprobada": una visita puede estar hecha y todavía figurar "Pendiente de
 * revisar" — eso significa que falta que un admin decida si aprueba o rechaza, no que falte ir.
 *
 * Existe como función y no como comparación suelta porque ya mordió: la devolución de la base
 * preguntaba `estado === "Realizada"` y nunca descontaba la visita, porque el sistema las guarda
 * como "Completada". Dos puertas escribiendo valores distintos para el mismo hecho.
 */
export function visitaFueHecha(v: { estado: VisitaEstado }): boolean {
  return v.estado !== "Pendiente";
}
export type VisitaResultado = "Aprobado" | "Rechazado" | "Repetir" | null;

export type Visita = {
  id: string;
  cliente_id: string;
  estado: VisitaEstado;
  resultado: VisitaResultado;
  // A quién se le ENCARGÓ la visita.
  asignada_a: string | null;
  // Quién la HIZO de verdad. Existe en la BD desde la mig 010 pero faltaba en el tipo, así que
  // el informe que paga las visitas no la podía usar y agrupaba por `asignada_a`: cuando uno
  // cubría a otro, el pago se le acreditaba al equivocado. Null en visitas viejas (se empezó a
  // escribir después) — quien la lea debe caer a `asignada_a` y marcar el dato como estimado.
  realizada_por: string | null;
  entrevista: {
    viveAlli: string;
    tiempoResidencia: string;
    tipoVivienda: string;
    composicionFamiliar: string;
    estabilidadLaboral: string;
    dudasCliente: string;
    observaciones: string;
    recomendacion: string;
    // Guardado de la moto (opcionales — visitas viejas no los traen). Se pregunta al final,
    // NO bloquea el guardado de la visita. Si guardaMotoAqui === "No", el cliente indica dónde.
    guardaMotoAqui?: string;
    dondeGuardaMoto?: string;
    condicionesGuardado?: string;
  };
  fotos: {
    clienteFuncionario?: string | null;
    fachada?: string | null;
  };
  ubicacion: { lat: number; lng: number } | null;
  fecha: string;
  created_at: string;
};

export type NuevaVisita = {
  cliente_id: string;
  entrevista: Visita["entrevista"];
  fotos: Visita["fotos"];
  ubicacion: Visita["ubicacion"];
};

export function useVisitas() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisitas = useCallback(async () => {
    const { data, error } = await supabase
      .from("visitas")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setVisitas((data ?? []) as Visita[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVisitas();

    const channel = supabase
      .channel(`visitas-realtime-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "visitas" }, () => {
        fetchVisitas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVisitas]);

  async function crearVisita(nueva: NuevaVisita) {
    const { error } = await supabase.from("visitas").insert({
      ...nueva,
      estado: "Realizada",
      resultado: null,
    });
    return { error: error?.message ?? null };
  }

  async function resolverVisita(id: string, resultado: "Aprobado" | "Rechazado" | "Repetir") {
    const { error } = await supabase.from("visitas").update({ resultado }).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function asignarVisita(id: string, subadminId: string | null) {
    const { error } = await supabase.from("visitas").update({ asignada_a: subadminId }).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function subirFotoVisita(file: File, clienteId: string, tipo: string): Promise<{ url: string | null; error: string | null }> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `visitas/${clienteId}/${tipo}-${Date.now()}.${ext}`;
    const { error: up } = await supabase.storage.from("documentos").upload(path, file, { upsert: true });
    if (up) return { url: null, error: up.message };
    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  }

  return { visitas, loading, error, crearVisita, resolverVisita, subirFotoVisita, asignarVisita };
}
