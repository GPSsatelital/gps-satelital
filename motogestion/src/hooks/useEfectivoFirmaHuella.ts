import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useClientes, type Cliente, type NuevoCliente } from "./useClientes";
import { hoyISO } from "../utils/fecha";
import { faltaFirmaHuella, type FaltaFirmaHuella } from "../utils/firmaHuellaEfectivo";

// El efectivo de la oficina exige la firma, la huella y la foto del cliente (D-065, mig 215).
// Este hook lo usan las cuatro ventanas que reciben efectivo en la oficina: dice si el pago tiene
// que esperar, guarda lo que falta igual que Clientes → Editar, y deja que el dueño autorice solo
// ese día. El candado de verdad está en la base: esto evita llegar hasta él.

const TABLA = "efectivo_sin_huella_autorizado";

type Urls = {
  autorizacion_datos_firma_url: string | null;
  autorizacion_datos_huella_url: string | null;
  foto_perfil_url: string | null;
};

export type EstadoFirmaHuella = {
  /** Lo que le falta al cliente, contando lo que se acaba de guardar en esta ventana. */
  falta: FaltaFirmaHuella;
  /** El dueño autorizó recibirle efectivo hoy sin lo que le falta. */
  autorizadoHoy: boolean;
  /** El pago en efectivo tiene que esperar: le falta algo y no hay autorización de hoy. */
  bloquea: boolean;
  /** Por qué el botón de registrar está apagado (null si no lo está). */
  razon: string | null;
  /** Se está revisando en la base (al abrir la ventana o con «revisar de nuevo»). */
  revisando: boolean;
  /** Solo el ADMIN_PRINCIPAL puede autorizar. */
  esDueno: boolean;
  clienteNombre: string;
  revisar: () => Promise<{ autorizado: boolean }>;
  guardar: (firma: string | null, firmadaEn: string | null, huella: string | null, foto: string | null) => Promise<string | null>;
  autorizarHoy: (motivo: string) => Promise<string | null>;
};

function tablaNoExiste(e: { code?: string; message?: string } | null): boolean {
  if (!e) return false;
  return e.code === "PGRST205" || e.code === "42P01" || /could not find the table|does not exist/i.test(e.message ?? "");
}

async function dataUrlAArchivo(dataUrl: string, nombre: string, tipo: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], nombre, { type: tipo });
}

export function useEfectivoFirmaHuella(cliente: Cliente | null | undefined, exige: boolean): EstadoFirmaHuella {
  const { profile } = useAuth();
  const { subirDocumento, actualizarCliente } = useClientes();
  const clienteId = cliente?.id ?? null;

  // Lo que dice la base al abrir (el dato en memoria puede estar viejo) y lo que se guardó acá.
  const [frescas, setFrescas] = useState<{ id: string; urls: Urls } | null>(null);
  const [autorizadoPara, setAutorizadoPara] = useState<string | null>(null);
  const [revisando, setRevisando] = useState(false);

  const urls: Urls | null = !cliente
    ? null
    : frescas && frescas.id === cliente.id
      ? frescas.urls
      : {
          autorizacion_datos_firma_url: cliente.autorizacion_datos_firma_url ?? null,
          autorizacion_datos_huella_url: cliente.autorizacion_datos_huella_url ?? null,
          foto_perfil_url: cliente.foto_perfil_url ?? null,
        };
  const falta = faltaFirmaHuella(urls);
  const autorizadoHoy = !!clienteId && autorizadoPara !== null && autorizadoPara === `${clienteId}|${hoyISO()}`;
  const bloquea = exige && !!clienteId && falta.texto !== null && !autorizadoHoy;
  const razon = bloquea
    ? `Se activa cuando ${falta.texto} ${falta.cuantas > 1 ? "queden guardadas" : "quede guardada"}, o con la autorización del dueño de hoy.`
    : null;

  const revisar = useCallback(async (): Promise<{ autorizado: boolean }> => {
    if (!clienteId) return { autorizado: false };
    const hoy = hoyISO();
    setRevisando(true);
    try {
      const [cli, aut] = await Promise.all([
        supabase
          .from("clientes")
          .select("autorizacion_datos_firma_url, autorizacion_datos_huella_url, foto_perfil_url")
          .eq("id", clienteId)
          .maybeSingle(),
        supabase.from(TABLA).select("id").eq("cliente_id", clienteId).eq("fecha", hoy).limit(1),
      ]);
      if (!cli.error && cli.data) setFrescas({ id: clienteId, urls: cli.data as Urls });
      // Si la tabla todavía no existe (falta la migración 215), no hay autorizaciones: no es un error para quien cobra.
      const autorizado = !aut.error && (aut.data?.length ?? 0) > 0;
      if (autorizado) setAutorizadoPara(`${clienteId}|${hoy}`);
      return { autorizado };
    } finally {
      setRevisando(false);
    }
  }, [clienteId]);

  // Al escoger efectivo para un cliente al que le falta algo, se pregunta a la base.
  const faltaEnMemoria = faltaFirmaHuella(cliente).texto !== null;
  useEffect(() => {
    if (exige && clienteId && faltaEnMemoria) void revisar();
  }, [exige, clienteId, faltaEnMemoria, revisar]);

  async function guardar(firma: string | null, firmadaEn: string | null, huella: string | null, foto: string | null): Promise<string | null> {
    if (!cliente) return "No se encontró el cliente.";
    if (falta.firma && !firma) return "Falta la firma del cliente.";
    if (falta.huella && !huella) return "Falta la huella del cliente.";
    if (falta.foto && !foto) return "Falta la foto del cliente.";
    const carpeta = cliente.cedula?.trim() || "sin-cedula";
    const cambios: Partial<NuevoCliente> = {};
    // Igual que Clientes → Editar: la misma carpeta, los mismos nombres y los mismos campos.
    if (falta.firma && firma) {
      const { url, error } = await subirDocumento(await dataUrlAArchivo(firma, "firma_autorizacion.png", "image/png"), carpeta, "autorizacion_datos");
      if (error || !url) return error || "No se pudo subir la firma.";
      cambios.autorizacion_datos_firma_url = url;
      cambios.autorizacion_datos_fecha = firmadaEn ?? new Date().toISOString();
    }
    if (falta.huella && huella) {
      const { url, error } = await subirDocumento(await dataUrlAArchivo(huella, "huella_autorizacion.png", "image/png"), carpeta, "autorizacion_datos_huella");
      if (error || !url) return error || "No se pudo subir la huella.";
      cambios.autorizacion_datos_huella_url = url;
    }
    if (falta.foto && foto) {
      const { url, error } = await subirDocumento(await dataUrlAArchivo(foto, "foto_perfil.jpg", "image/jpeg"), carpeta, "foto_perfil");
      if (error || !url) return error || "No se pudo subir la foto.";
      cambios.foto_perfil_url = url;
    }
    const { error } = await actualizarCliente(cliente.id, cambios);
    if (error) return error;
    const antes: Urls = urls ?? { autorizacion_datos_firma_url: null, autorizacion_datos_huella_url: null, foto_perfil_url: null };
    setFrescas({
      id: cliente.id,
      urls: {
        autorizacion_datos_firma_url: cambios.autorizacion_datos_firma_url ?? antes.autorizacion_datos_firma_url,
        autorizacion_datos_huella_url: cambios.autorizacion_datos_huella_url ?? antes.autorizacion_datos_huella_url,
        foto_perfil_url: cambios.foto_perfil_url ?? antes.foto_perfil_url,
      },
    });
    return null;
  }

  async function autorizarHoy(motivo: string): Promise<string | null> {
    if (!clienteId) return "No se encontró el cliente.";
    const limpio = motivo.trim();
    if (limpio.length < 5) return "Escriba el motivo (por ejemplo: el lector no lee).";
    const { error } = await supabase.from(TABLA).insert({ cliente_id: clienteId, motivo: limpio });
    // Ya estaba autorizado hoy (otro clic u otro aparato): para quien cobra es lo mismo.
    if (error && error.code !== "23505") {
      if (tablaNoExiste(error)) return "La base todavía no tiene las autorizaciones: falta correr la migración 215.";
      if (error.code === "42501") return "Solo el dueño puede autorizar.";
      return error.message;
    }
    setAutorizadoPara(`${clienteId}|${hoyISO()}`);
    return null;
  }

  return {
    falta,
    autorizadoHoy,
    bloquea,
    razon,
    revisando,
    esDueno: profile?.role === "ADMIN_PRINCIPAL",
    clienteNombre: cliente?.nombre ?? "",
    revisar,
    guardar,
    autorizarHoy,
  };
}
