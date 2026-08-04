import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type CajaDiaria = {
  id: string;
  fecha: string;
  grupo: string;
  efectivo_total: number;
  transferencias_total: number;
  total: number;
  detalle: unknown[];
  cerrado_por: string | null;
  notas: string | null;
  // Arqueo del cierre (mig 064). null = ese lado no se contó.
  efectivo_contado: number | null;
  banco_reportado: number | null;
  diferencia: number | null;
  created_at: string;
};

/**
 * ¿El cierre que se firmó ya no dice lo mismo que la caja real de ese día?
 *
 * Pasa cuando entra plata con fecha de un día YA CERRADO. Es la contracara de la regla de
 * `fechaDeCaja`: una transferencia cuenta en el día en que el banco la recibió, así que una que
 * se reporta tarde aterriza en un día que quizás ya se cerró. Eso es lo correcto para el arqueo
 * —el día cuadra contra SU extracto— pero deja el cierre guardado viejo, y sin aviso nadie se
 * entera: la pantalla seguiría mostrando "✓ Cerrada" con una cifra que ya no es.
 *
 * Devuelve null si el cierre sigue al día. Si no, cuánto cambió cada lado (positivo = entró más).
 * Protegida por `useCaja.test.ts`.
 */
export function cierreDesactualizado(
  cerrada: { efectivo_total: number; transferencias_total: number; total: number } | null,
  actual: { efectivo: number; transfer: number; total: number },
): { efectivo: number; transfer: number; total: number } | null {
  if (!cerrada) return null;
  const dif = {
    efectivo: Math.round(actual.efectivo) - Math.round(cerrada.efectivo_total),
    transfer: Math.round(actual.transfer) - Math.round(cerrada.transferencias_total),
    total: Math.round(actual.total) - Math.round(cerrada.total),
  };
  return dif.efectivo === 0 && dif.transfer === 0 && dif.total === 0 ? null : dif;
}

export function useCaja() {
  const [cajas, setCajas] = useState<CajaDiaria[]>([]);
  const [loading, setLoading] = useState(true);

  async function cargarCajas() {
    const { data } = await supabase
      .from("caja_diaria")
      .select("*")
      .order("fecha", { ascending: false })
      .limit(60);
    if (data) setCajas(data as CajaDiaria[]);
    setLoading(false);
  }

  useEffect(() => {
    cargarCajas();
    const channel = supabase
      .channel(`caja-realtime-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "caja_diaria" }, cargarCajas)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function cerrarCaja(params: {
    fecha: string;
    grupo: string;
    efectivo: number;
    transferencias: number;
    total: number;
    detalle: { placa: string; nombre: string; valor: number; metodo: string; grupo?: string }[];
    cerradoPor: string | null;
    notas?: string;
    // Arqueo (mig 064): contra qué se compara lo registrado. Opcionales — si no se llenan,
    // el cierre se comporta como antes.
    bancoReportado?: number | null;
    efectivoContado?: number | null;
    diferencia?: number | null;
  }) {
    const { error } = await supabase.from("caja_diaria").upsert(
      {
        fecha: params.fecha,
        grupo: params.grupo,
        efectivo_total: params.efectivo,
        transferencias_total: params.transferencias,
        total: params.total,
        detalle: params.detalle,
        cerrado_por: params.cerradoPor,
        notas: params.notas ?? null,
        banco_reportado: params.bancoReportado ?? null,
        efectivo_contado: params.efectivoContado ?? null,
        diferencia: params.diferencia ?? null,
      },
      { onConflict: "fecha,grupo" }
    );
    if (!error) cargarCajas();
    return { error: error?.message ?? null };
  }

  // Caja de un grupo específico en una fecha (cada portafolio se cierra por aparte).
  function cajaDia(fecha: string, grupo: string): CajaDiaria | null {
    return cajas.find(c => c.fecha === fecha && c.grupo === grupo) ?? null;
  }

  return { cajas, loading, cerrarCaja, cajaDia };
}
