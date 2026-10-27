import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { subir } from "./useNominaCierres";

/**
 * EL PAGO DE NÓMINA DEL 15 Y EL 30 (mig 208, D-057 parte 4).
 *
 * El cierre del miércoles deja cada semana revisada y firmada; la plata se entrega aparte, el 15 o
 * el 30, con todas las semanas cerradas que todavía no se le han pagado al supervisor. Una semana
 * cerrada se paga UNA sola vez: el candado está en la base (`nomina_pago_semanas.cierre_id` único y
 * `registrar_pago_nomina`), no solo en la pantalla.
 */
export type NominaPago = {
  id: string;
  subadmin_id: string;
  cobrador_nombre: string;
  total: number;
  semanas: Array<{ cierre_id: string; semana_lunes: string; total: number }>;
  firma_url: string;
  foto_url: string | null;
  observacion: string | null;
  pagado_por: string | null;
  fecha: string;
  created_at: string;
};

export function useNominaPagos(activo: boolean, intento = 0) {
  const [traido, setTraido] = useState<{ clave: string; pagos: NominaPago[]; error: boolean } | null>(null);
  const [propio, setPropio] = useState(0);
  const clave = `${intento}|${propio}`;

  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    void supabase.from("nomina_pagos").select("*").order("created_at", { ascending: false })
      .then(({ data, error }) => { if (vivo) setTraido({ clave, pagos: (data ?? []) as NominaPago[], error: !!error }); });
    return () => { vivo = false; };
  }, [clave, activo]);

  const vigente = traido?.clave === clave ? traido : null;
  const pagos = vigente?.pagos ?? [];
  /** Las semanas cerradas (id del cierre) que ya se pagaron. */
  const cierresPagados = new Set(pagos.flatMap(p => p.semanas.map(s => s.cierre_id)));
  /** El pago en que entró cada semana cerrada. */
  const pagoDeCierre = new Map(pagos.flatMap(p => p.semanas.map(s => [s.cierre_id, p] as const)));

  /**
   * Registra el pago: primero la firma (y la foto), después el pago en la base, todo o nada. Si la
   * firma no sube, NO se registra nada — un pago sin constancia de recibido no se puede corregir.
   */
  const registrarPago = useCallback(async (opts: {
    subadminId: string;
    cierreIds: string[];
    firmaDataUrl: string;
    fotoDataUrl?: string | null;
    observacion?: string;
  }): Promise<{ error: string | null; pagoId?: string }> => {
    const base = `nomina/pagos/${opts.subadminId}/${Date.now()}`;
    const f = await subir(opts.firmaDataUrl, `${base}/firma.png`);
    if (f.error || !f.url) return { error: `No se pudo guardar la firma (${f.error}). No se registró el pago — vuelve a intentar.` };
    let foto: string | null = null;
    if (opts.fotoDataUrl) {
      const r = await subir(opts.fotoDataUrl, `${base}/comprobante.jpg`);
      if (r.error) return { error: `No se pudo guardar la foto del comprobante (${r.error}). No se registró el pago — vuelve a intentar.` };
      foto = r.url;
    }
    const { data, error } = await supabase.rpc("registrar_pago_nomina", {
      p_subadmin: opts.subadminId,
      p_cierres: opts.cierreIds,
      p_firma_url: f.url,
      p_foto_url: foto,
      p_observacion: opts.observacion?.trim() || null,
    });
    if (error) return { error: error.message };
    setPropio(n => n + 1);
    return { error: null, pagoId: data as string };
  }, []);

  return { pagos, cierresPagados, pagoDeCierre, cargando: activo && !vigente, error: !!vigente?.error, registrarPago };
}
