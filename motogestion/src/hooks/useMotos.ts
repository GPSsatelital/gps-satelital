import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type MotoStatus = "Disponible" | "Reservada" | "Asignada" | "Mantenimiento" | "Recuperada";
export type GrupoMoto = "CLUB" | "PRADERA" | "COSTA";

export type Moto = {
  id: string;
  placa: string;
  grupo: GrupoMoto;
  marca: string;
  modelo: string;
  numero_motor: string | null;
  numero_chasis: string | null;
  lugar_matricula: string | null;
  cilindraje: string | null;
  fecha_seguro: string | null;
  fecha_tecnomecanica: string | null;
  propietario: string | null;
  numero_serie: string | null;
  estado: MotoStatus;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
};

export function useMotos() {
  const [motos, setMotos] = useState<Moto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarMotos() {
    const { data, error } = await supabase.from("motos").select("*").order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setMotos(data as Moto[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    cargarMotos();

    const channel = supabase
      .channel("motos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "motos" }, () => {
        cargarMotos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function crearMoto(nuevo: Omit<Moto, "id" | "created_at" | "updated_at">) {
    const { error } = await supabase.from("motos").insert(nuevo);
    return { error: error?.message ?? null };
  }

  async function cambiarEstadoMoto(id: string, estado: MotoStatus) {
    const { error } = await supabase.from("motos").update({ estado }).eq("id", id);
    return { error: error?.message ?? null };
  }

  return { motos, loading, error, crearMoto, cambiarEstadoMoto };
}
