import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type MotoStatus = "Disponible" | "Reservada" | "Asignada" | "Mantenimiento" | "Recuperada" | "Fiscalia" | "Transito" | "Garantia";
export type GrupoMoto = "COSTA" | "PRADERA" | "RASTREADOR" | "USADAS" | "OTRO";
export type CondicionIngreso = "nueva" | "usada";

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
  condicion_ingreso: CondicionIngreso | null;
  color: string | null;
  observaciones: string | null;
  subadmin_id?: string | null;
  // campos de retención
  retencion_fecha?: string | null;
  retencion_numero_caso?: string | null;
  retencion_detalle?: string | null;
  created_at: string;
  updated_at: string;
};

export type RetencionData = {
  fecha: string;
  numero_caso?: string;
  detalle?: string;
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
      .channel(`motos-realtime-${Math.random()}`)
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

  async function registrarRetencion(id: string, tipo: "Fiscalia" | "Transito" | "Garantia", datos: RetencionData) {
    const { error } = await supabase.from("motos").update({
      estado: tipo,
      retencion_fecha: datos.fecha,
      retencion_numero_caso: datos.numero_caso ?? null,
      retencion_detalle: datos.detalle ?? null,
    }).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function liberarRetencion(id: string) {
    const { error } = await supabase.from("motos").update({
      estado: "Disponible",
      retencion_fecha: null,
      retencion_numero_caso: null,
      retencion_detalle: null,
    }).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function actualizarMoto(id: string, cambios: Partial<Omit<Moto, "id" | "created_at" | "updated_at">>) {
    const { error } = await supabase.from("motos").update({ ...cambios, updated_at: new Date().toISOString() }).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function asignarSubadmin(motoId: string, subadminId: string | null) {
    const { error } = await supabase.from("motos").update({ subadmin_id: subadminId, updated_at: new Date().toISOString() }).eq("id", motoId);
    return { error: error?.message ?? null };
  }

  return { motos, loading, error, crearMoto, actualizarMoto, cambiarEstadoMoto, registrarRetencion, liberarRetencion, asignarSubadmin };
}
