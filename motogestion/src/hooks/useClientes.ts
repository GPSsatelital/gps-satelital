import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type ClienteEstado =
  | "En proceso"
  | "Listo para visita"
  | "Pendiente evaluación"
  | "Aprobado"
  | "Rechazado"
  | "Activo"
  | "En seguimiento"
  | "En riesgo"
  | "En mora"
  | "Retirado"
  | "Egresado"
  | "Lista negra"
  | "Inmovilización documentación incompleta";

export type DocumentoItem = { ok: boolean; file: string | null };

export type DocumentoFlags = {
  cedula: DocumentoItem;
  licencia: DocumentoItem;
  recibo1: DocumentoItem;
  carta: DocumentoItem;
  antecedentes: DocumentoItem;
  hojaVida: DocumentoItem;
};

export function emptyDocs(): DocumentoFlags {
  return {
    cedula: { ok: false, file: null },
    licencia: { ok: false, file: null },
    recibo1: { ok: false, file: null },
    carta: { ok: false, file: null },
    antecedentes: { ok: false, file: null },
    hojaVida: { ok: false, file: null },
  };
}

export type RutaContrato = "diario" | "tiempo_definido";

export type Cliente = {
  id: string;
  nombre: string;
  cedula: string;
  direccion: string;
  fuente_llegada: string | null;
  telefono: string;
  mismo_whatsapp: boolean;
  whatsapp: string | null;
  acompanante_nombre: string | null;
  acompanante_cedula: string | null;
  acompanante_telefono: string | null;
  mismo_domicilio_acompanante: boolean;
  documentos_cliente: DocumentoFlags;
  documentos_acompanante: DocumentoFlags;
  estado: ClienteEstado;
  excepcion_documental: boolean;
  excepcion_motivo: string | null;
  excepcion_plazo: string | null;
  ruta_contrato: RutaContrato;
  ingreso_inicial: number | null;
  referido_por_cedula: string | null;
  referido_por_nombre: string | null;
  autorizacion_datos_firma_url: string | null;
  autorizacion_datos_huella_url: string | null;
  autorizacion_datos_fecha: string | null;
  foto_perfil_url: string | null;
  referidos_confirmados: number;
  premio_referidos_entregado: number;
  lista_negra: boolean;
  motivo_lista_negra: string | null;
  lista_negra_reversible: boolean;
  visita_asignada_a: string | null;
  created_at: string;
  updated_at: string;
};

export type NuevoCliente = {
  nombre: string;
  cedula: string;
  direccion: string;
  fuente_llegada: string | null;
  telefono: string;
  mismo_whatsapp: boolean;
  whatsapp: string | null;
  acompanante_nombre: string | null;
  acompanante_cedula: string | null;
  acompanante_telefono: string | null;
  mismo_domicilio_acompanante: boolean;
  documentos_cliente: DocumentoFlags;
  documentos_acompanante: DocumentoFlags;
  estado: ClienteEstado;
  ruta_contrato: RutaContrato;
  ingreso_inicial: number | null;
  referido_por_cedula: string | null;
  referido_por_nombre: string | null;
  autorizacion_datos_firma_url: string | null;
  autorizacion_datos_huella_url: string | null;
  autorizacion_datos_fecha: string | null;
  foto_perfil_url: string | null;
};

export function documentosListos(doc: DocumentoFlags) {
  return (
    doc.cedula.ok &&
    doc.recibo1.ok &&
    doc.carta.ok &&
    doc.antecedentes.ok &&
    doc.hojaVida.ok
  );
}

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = useCallback(async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setClientes((data ?? []) as Cliente[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClientes();

    const channel = supabase
      .channel(`clientes-realtime-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "clientes" }, () => {
        fetchClientes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchClientes]);

  async function crearCliente(nuevo: NuevoCliente) {
    const { error } = await supabase.from("clientes").insert(nuevo);
    return { error: error?.message ?? null };
  }

  // Sube un documento del cliente/acompañante al bucket "documentos" y devuelve la URL pública.
  // carpeta: cédula del cliente (o "sin-cedula"); docKey: cedula/recibo1/etc.
  async function subirDocumento(file: File, carpeta: string, docKey: string): Promise<{ url: string | null; error: string | null }> {
    const ext = file.name.split(".").pop() || "jpg";
    const limpia = (carpeta || "sin-cedula").replace(/[^a-zA-Z0-9_-]/g, "");
    const path = `${limpia}/${docKey}-${Date.now()}.${ext}`;
    const { error: up } = await supabase.storage.from("documentos").upload(path, file, { upsert: true });
    if (up) return { url: null, error: up.message };
    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  }

  async function actualizarCliente(id: string, cambios: Partial<NuevoCliente>) {
    const { error } = await supabase.from("clientes").update(cambios).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function cambiarEstadoCliente(id: string, estado: ClienteEstado) {
    const { error } = await supabase.from("clientes").update({ estado }).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function asignarVisitaCliente(id: string, subadminId: string | null) {
    const { error } = await supabase.from("clientes").update({ visita_asignada_a: subadminId }).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function aplicarExcepcion(id: string, motivo: string, plazo: string) {
    const { error } = await supabase
      .from("clientes")
      .update({
        estado: "Listo para visita",
        excepcion_documental: true,
        excepcion_motivo: motivo,
        excepcion_plazo: plazo,
      })
      .eq("id", id);
    return { error: error?.message ?? null };
  }

  return { clientes, loading, error, crearCliente, actualizarCliente, cambiarEstadoCliente, aplicarExcepcion, subirDocumento, asignarVisitaCliente };
}
