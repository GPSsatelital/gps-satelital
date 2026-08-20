import { supabase } from "../lib/supabase";
import { createTableStore } from "./createTableStore";
import { hoyISO } from "../utils/fecha";

// Un renglón del reparto: lo que le toca pagar a UN portafolio. Tiene exactamente la forma que
// pide la futura tabla `egresos` (grupo + monto + de dónde salió), a propósito: cuando ese módulo
// exista se migran de una y la caja empieza a descontarlos, sin rediseñar ni redigitar nada.
export type RepartoPremio = {
  grupo: string;
  referidos: string[];
  monto: number;
};

export type PremioReferido = {
  id: string;
  cedula_referidor: string;
  nombre_referidor: string;
  hito: number;
  premio: string;
  forma: "fisico" | "dinero";
  costo_total: number;
  monto_por_referido: number | null;
  reparto: RepartoPremio[];
  foto_url: string;
  nota: string | null;
  entregado_por: string | null;
  fecha: string;
  created_at: string;
};

const premiosStore = createTableStore<PremioReferido>("premios_referidos");

export function usePremiosReferidos() {
  const { data: premios, loading, error } = premiosStore.useStore();

  async function subirFotoPremio(file: File, cedula: string): Promise<{ url: string | null; error: string | null }> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `premios-referidos/${cedula}/${Date.now()}.${ext}`;
    const { error: up } = await supabase.storage.from("documentos").upload(path, file, { upsert: true });
    if (up) return { url: null, error: up.message };
    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  }

  async function entregarPremio(p: {
    cedulaReferidor: string;
    nombreReferidor: string;
    hito: number;
    premio: string;
    forma: "fisico" | "dinero";
    costoTotal: number;
    montoPorReferido: number | null;
    reparto: RepartoPremio[];
    fotoUrl: string;
    nota: string | null;
    entregadoPor: string;
  }) {
    const { error } = await supabase.from("premios_referidos").insert({
      cedula_referidor: p.cedulaReferidor,
      nombre_referidor: p.nombreReferidor,
      hito: p.hito,
      premio: p.premio,
      forma: p.forma,
      costo_total: p.costoTotal,
      monto_por_referido: p.montoPorReferido,
      reparto: p.reparto,
      foto_url: p.fotoUrl,
      nota: p.nota,
      entregado_por: p.entregadoPor,
      fecha: hoyISO(),
    });
    if (error) {
      // El índice único evita entregar dos veces el mismo hito a la misma persona (doble clic,
      // dos funcionarios a la vez). Se traduce a algo que el funcionario entienda.
      if (error.code === "23505") {
        return { error: "Ese premio ya se le entregó a esta persona. Revisa el historial de entregas." };
      }
      return { error: error.message };
    }
    premiosStore.refetch();
    return { error: null };
  }

  // Cuántos hitos ya se le entregaron a una cédula (para no volver a ofrecerlos).
  function hitosEntregados(cedula: string): number[] {
    return premios.filter(p => p.cedula_referidor === cedula).map(p => p.hito);
  }

  return { premios, loading, error, subirFotoPremio, entregarPremio, hitosEntregados };
}

/**
 * Reparte lo que costó el premio entre los portafolios de los referidos que lo generaron.
 *
 * Regla del dueño (19-ago): "cada uno lo paga su referido". El premio se gana con varios
 * referidos y cada uno cayó en un portafolio distinto (caso real: JOHAN ROJAS ganó los guantes
 * con MARLON en PRADERA y JORGE LUIS en COSTA), así que el costo se divide según cuántas motos
 * puso cada portafolio.
 *
 * - forma 'dinero': se pacta un monto POR REFERIDO → cada portafolio paga los suyos, exacto.
 * - forma 'fisico': se conoce el costo del artículo → se divide entre los referidos.
 *
 * Los pesos que sobran del redondeo (ej. $100.000 entre 3) se le suman al portafolio que más
 * referidos puso, para que la suma del reparto SIEMPRE dé el costo total. Si no, el recibo de un
 * socio y el total de la empresa dirían cifras distintas por unos pesos, y eso destruye la
 * confianza en el número mucho más de lo que valen esos pesos.
 */
export function repartirPremio(
  referidosConGrupo: { nombre: string; grupo: string }[],
  forma: "fisico" | "dinero",
  valor: number,
): { reparto: RepartoPremio[]; costoTotal: number } {
  const n = referidosConGrupo.length;
  if (n === 0 || valor <= 0) return { reparto: [], costoTotal: 0 };

  const costoTotal = forma === "dinero" ? valor * n : valor;
  const porReferido = costoTotal / n;

  const porGrupo = new Map<string, string[]>();
  referidosConGrupo.forEach(r => {
    const g = r.grupo || "SIN GRUPO";
    porGrupo.set(g, [...(porGrupo.get(g) ?? []), r.nombre]);
  });

  const filas = [...porGrupo.entries()]
    .map(([grupo, referidos]) => ({ grupo, referidos, monto: Math.floor(porReferido * referidos.length) }))
    .sort((a, b) => b.referidos.length - a.referidos.length || a.grupo.localeCompare(b.grupo));

  const sobrante = costoTotal - filas.reduce((a, f) => a + f.monto, 0);
  if (sobrante !== 0 && filas.length > 0) filas[0].monto += sobrante;

  return { reparto: filas, costoTotal };
}
