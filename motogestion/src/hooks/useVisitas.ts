import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type VisitaEstado = "Pendiente" | "Realizada";
export type VisitaResultado = "Aprobado" | "Rechazado" | null;

export type Visita = {
  id: string;
  cliente_id: string;
  estado: VisitaEstado;
  resultado: VisitaResultado;
  entrevista: {
    viveAlli: string;
    tiempoResidencia: string;
    tipoVivienda: string;
    composicionFamiliar: string;
    estabilidadLaboral: string;
    dudasCliente: string;
    observaciones: string;
    recomendacion: string;
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

  async function resolverVisita(id: string, resultado: "Aprobado" | "Rechazado") {
    const { error } = await supabase.from("visitas").update({ resultado }).eq("id", id);
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

  return { visitas, loading, error, crearVisita, resolverVisita, subirFotoVisita };
}
