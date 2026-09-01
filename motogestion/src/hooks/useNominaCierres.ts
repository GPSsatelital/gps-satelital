import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { hoyISO } from "../utils/fecha";
import type { GestionNomina } from "../utils/nominaCobradores";

/**
 * Las semanas de nómina YA PAGADAS (mig 120).
 *
 * Por qué existe: la nómina se recalcula cada vez que se abre la pantalla, así que un pago que
 * entre mañana puede mover una semana que ya se pagó. El cierre CONGELA las cifras y guarda la
 * firma del cobrador y la foto del desprendible — es el respaldo de que ese pago se hizo.
 */
export type NominaCierre = {
  id: string;
  semana_lunes: string;
  subadmin_id: string | null;
  cobrador_nombre: string;
  total: number;
  renglones: GestionNomina[];
  totales_grupo: Array<{ grupo: string; total: number }>;
  firma_url: string | null;
  foto_url: string | null;
  observacion: string | null;
  cerrado_por: string | null;
  created_at: string;
};

/** Sube un dataURL (firma o foto) al bucket `documentos` y devuelve su URL pública. */
async function subir(dataUrl: string, ruta: string): Promise<string | null> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const { error } = await supabase.storage.from("documentos").upload(ruta, blob, {
    contentType: blob.type || "image/png",
    upsert: true,
  });
  if (error) return null;
  return supabase.storage.from("documentos").getPublicUrl(ruta).data.publicUrl;
}

export function useNominaCierres(semanaLunes: string, activo: boolean) {
  const [cierres, setCierres] = useState<NominaCierre[]>([]);
  const [cargando, setCargando] = useState(false);

  const recargar = useCallback(async () => {
    if (!activo) return;
    setCargando(true);
    const { data } = await supabase
      .from("nomina_cierres").select("*").eq("semana_lunes", semanaLunes);
    setCierres((data ?? []) as NominaCierre[]);
    setCargando(false);
  }, [semanaLunes, activo]);

  useEffect(() => { void recargar(); }, [recargar]);

  /**
   * Cierra la semana de UN cobrador. Congela sus cifras y guarda firma y foto.
   * Devuelve `error` con el mensaje si algo falla — nada de fallar en silencio con plata.
   */
  const cerrarSemana = useCallback(async (opts: {
    semanaLunes: string;
    subadminId: string | null;
    cobradorNombre: string;
    total: number;
    renglones: GestionNomina[];
    totalesGrupo: Array<{ grupo: string; total: number }>;
    firmaDataUrl?: string | null;
    fotoDataUrl?: string | null;
    observacion?: string;
    cerradoPor: string;
  }): Promise<{ error: string | null }> => {
    const base = `nomina/${opts.semanaLunes}/${opts.subadminId ?? "sin-cobrador"}`;
    const firma_url = opts.firmaDataUrl ? await subir(opts.firmaDataUrl, `${base}/firma.png`) : null;
    const foto_url  = opts.fotoDataUrl  ? await subir(opts.fotoDataUrl,  `${base}/desprendible.jpg`) : null;

    const { error } = await supabase.from("nomina_cierres").insert({
      semana_lunes: opts.semanaLunes,
      subadmin_id: opts.subadminId,
      cobrador_nombre: opts.cobradorNombre,
      total: opts.total,
      renglones: opts.renglones,
      totales_grupo: opts.totalesGrupo,
      firma_url, foto_url,
      observacion: opts.observacion?.trim() || null,
      cerrado_por: opts.cerradoPor,
    });
    if (error) {
      // El candado de la BD: una semana se cierra UNA vez por cobrador.
      if (error.code === "23505") return { error: "Esa semana ya está cerrada para este cobrador." };
      return { error: error.message };
    }
    await recargar();
    return { error: null };
  }, [recargar]);

  /** El cierre de un cobrador en esta semana, si ya está pagada. */
  const cierreDe = useCallback(
    (subadminId: string | null) => cierres.find(c => c.subadmin_id === subadminId) ?? null,
    [cierres],
  );

  return { cierres, cargando, cerrarSemana, cierreDe, recargar, hoy: hoyISO() };
}
