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

/**
 * Sube un dataURL (firma o foto) al bucket `documentos` y devuelve su URL pública.
 *
 * Devuelve el error en vez de tragárselo: un cierre NO se puede editar ni borrar después, así que
 * si la firma no sube y guardáramos igual, ese pago quedaría para siempre sin la constancia de
 * que el cobrador recibió — y sin forma de repararlo.
 */
async function subir(dataUrl: string, ruta: string): Promise<{ url: string | null; error: string | null }> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const { error } = await supabase.storage.from("documentos").upload(ruta, blob, {
      contentType: blob.type || "image/png",
      upsert: true,
    });
    if (error) return { url: null, error: error.message };
    return { url: supabase.storage.from("documentos").getPublicUrl(ruta).data.publicUrl, error: null };
  } catch (e) {
    return { url: null, error: e instanceof Error ? e.message : "no se pudo subir la imagen" };
  }
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
    cerradoPor: string | null;
  }): Promise<{ error: string | null }> => {
    const base = `nomina/${opts.semanaLunes}/${opts.subadminId ?? "sin-cobrador"}`;

    // Primero las imágenes. Si alguna falla, NO se cierra nada: mejor que el funcionario vuelva a
    // firmar hoy, a que quede un pago sin respaldo que ya no se puede corregir.
    let firma_url: string | null = null;
    let foto_url: string | null = null;
    if (opts.firmaDataUrl) {
      const r = await subir(opts.firmaDataUrl, `${base}/firma.png`);
      if (r.error) return { error: `No se pudo guardar la firma (${r.error}). No se cerró la semana — vuelve a intentar.` };
      firma_url = r.url;
    }
    if (opts.fotoDataUrl) {
      const r = await subir(opts.fotoDataUrl, `${base}/desprendible.jpg`);
      if (r.error) return { error: `No se pudo guardar la foto del desprendible (${r.error}). No se cerró la semana — vuelve a intentar.` };
      foto_url = r.url;
    }

    const { error } = await supabase.from("nomina_cierres").insert({
      semana_lunes: opts.semanaLunes,
      subadmin_id: opts.subadminId,
      cobrador_nombre: opts.cobradorNombre,
      total: opts.total,
      renglones: opts.renglones,
      totales_grupo: opts.totalesGrupo,
      firma_url, foto_url,
      observacion: opts.observacion?.trim() || null,
      cerrado_por: opts.cerradoPor || null,   // "" no es un uuid: reventaría con un error críptico
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
