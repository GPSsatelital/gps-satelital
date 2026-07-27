import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { hoyISO } from "../utils/fecha";

// Préstamos de reemplazo (TEMA B): a un cliente se le vara la moto → se le presta otra del
// pool. El swap mueve el contrato del que pide a la placa prestada (GPS correcto) y se guarda
// la placa original para devolverla cuando su moto salga del taller.
export type PrestamoReemplazo = {
  id: string;
  contrato_id: string;
  moto_prestada_id: string;
  moto_original_id: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  tarifa_dia: number;
  estado: "activo" | "cerrado";
  creado_por: string | null;
  created_at: string;
  moto_prestada_estado_previo: string | null;
};

/**
 * A qué MOTO pertenece el dinero de un contrato, para efectos de portafolio (grupo).
 *
 * El grupo se deriva `contrato → moto → grupo`, y el préstamo cambia `contratos.moto_id` a la
 * placa prestada. Sin esta función, mientras dura el préstamo TODOS los pagos del contrato —
 * incluidos los de meses anteriores — se le acreditan al portafolio de la moto prestada:
 * medido en prueba, un pago del 13-jul de un cliente de COSTA pasó a contar para PRADERA.
 * Con 4 portafolios que rinden cuentas por separado, eso descuadra los informes de los socios.
 *
 * La plata siempre es del portafolio de la moto ORIGINAL: el préstamo es un favor temporal,
 * no un traspaso de inversión. (El alquiler del reemplazo sí es ingreso aparte.)
 */
export function motoDelPortafolio(
  contratoId: string,
  motoIdActual: string | null,
  prestamos: Pick<PrestamoReemplazo, "contrato_id" | "estado" | "moto_original_id">[],
): string | null {
  const activo = prestamos.find(p => p.contrato_id === contratoId && p.estado === "activo");
  return activo?.moto_original_id ?? motoIdActual;
}

/**
 * Deja constancia en `contratos_auditoria` de que la placa del contrato cambió por un préstamo.
 *
 * `contratos.moto_id` es el dato del que cuelga TODO (placa, grupo/portafolio, GPS, a qué socio
 * se le acredita el recaudo) y el préstamo lo cambia. Sin este rastro, mirando el contrato meses
 * después no hay forma de saber que anduvo en otra moto ni cuándo. Se guardan las PLACAS, no los
 * identificadores, para que se pueda leer sin consultar la base.
 */
async function auditarCambioDeMoto(
  contratoId: string, motoAntes: string | null, motoDespues: string | null,
  editadoPor: string | null, motivo: string,
) {
  const ids = [motoAntes, motoDespues].filter(Boolean) as string[];
  const { data: motos } = await supabase.from("motos").select("id, placa").in("id", ids);
  const placa = (id: string | null) => motos?.find(m => m.id === id)?.placa ?? "—";
  await supabase.from("contratos_auditoria").insert({
    contrato_id: contratoId,
    campo: `moto_id (${motivo})`,
    valor_anterior: placa(motoAntes),
    valor_nuevo: placa(motoDespues),
    editado_por: editadoPor,
  });
}

export function usePrestamos() {
  const [prestamos, setPrestamos] = useState<PrestamoReemplazo[]>([]);
  const [loading, setLoading] = useState(true);
  // Nombre de canal ÚNICO por instancia del hook: si dos componentes montados a la vez
  // (ej. InmovilizacionesView + ModalPrestarReemplazo) usan un nombre fijo, el 2º .on()
  // sobre el mismo canal ya suscrito revienta ("cannot add callbacks after subscribe()")
  // y tumba la app. El sufijo aleatorio evita la colisión.
  const [chId] = useState(() => Math.random().toString(36).slice(2));

  async function fetchAll() {
    const { data } = await supabase.from("prestamos_reemplazo").select("*").order("created_at", { ascending: false });
    setPrestamos((data ?? []) as PrestamoReemplazo[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel(`prestamos_reemplazo_ch_${chId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "prestamos_reemplazo" }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const prestamoActivoDeContrato = (contratoId: string) =>
    prestamos.find(p => p.contrato_id === contratoId && p.estado === "activo") ?? null;
  const prestamoActivoDeMoto = (motoId: string) =>
    prestamos.find(p => p.moto_prestada_id === motoId && p.estado === "activo") ?? null;

  // Prestar: el contrato del que pide (contratoId) pasa a andar en la placa prestada.
  // La moto original (la suya, en taller) queda guardada para devolverla. GPS/ubicación
  // quedan correctos porque el contrato Activo apunta a la placa que realmente usa.
  async function prestarReemplazo(
    contratoId: string, motoPrestadaId: string, motoOriginalId: string | null,
    creadoPor: string, tarifaDia = 27000,
  ) {
    // Estado previo de la prestada (Disponible o Recuperada) — se guarda para restaurarlo EXACTO
    // al devolverla; si no, una moto que salió del pool Disponible volvería mal como Recuperada.
    const { data: motoPrest } = await supabase.from("motos").select("estado").eq("id", motoPrestadaId).single();
    const estadoPrevio = motoPrest?.estado ?? "Disponible";

    // 1. REGISTRO PRIMERO — es lo único que guarda cuál era su placa. Antes el swap iba antes
    //    del insert: si el insert fallaba (red, RLS), el contrato quedaba apuntando a la placa
    //    prestada SIN ninguna fila que dijera a cuál volver, y la UI ni siquiera ofrecía
    //    "Devolver". Registrando primero, cualquier fallo posterior deja el rastro intacto.
    const { data: prest, error: errP } = await supabase.from("prestamos_reemplazo").insert({
      contrato_id: contratoId, moto_prestada_id: motoPrestadaId, moto_original_id: motoOriginalId,
      tarifa_dia: tarifaDia, creado_por: creadoPor, moto_prestada_estado_previo: estadoPrevio,
    }).select("id").single();
    if (errP) return { error: errP.message };

    // 2. Swap: el contrato apunta ahora a la placa prestada.
    const { error: errC } = await supabase.from("contratos").update({ moto_id: motoPrestadaId }).eq("id", contratoId);
    if (errC) {
      // No dejar un préstamo "activo" fantasma sobre un contrato que nunca se swapeó.
      await supabase.from("prestamos_reemplazo").delete().eq("id", prest.id);
      return { error: errC.message };
    }
    await auditarCambioDeMoto(contratoId, motoOriginalId, motoPrestadaId, creadoPor, "préstamo de reemplazo");

    // 3. La prestada queda Asignada (en uso por el que pide).
    const { error: errM } = await supabase.from("motos").update({ estado: "Asignada" }).eq("id", motoPrestadaId);
    if (errM) return { error: errM.message };
    // 4. La suya (original) va/queda en Mantenimiento (taller).
    if (motoOriginalId) {
      const { error: errO } = await supabase.from("motos").update({ estado: "Mantenimiento" }).eq("id", motoOriginalId);
      if (errO) return { error: errO.message };
    }
    return { error: null };
  }

  // Devolver: cuando la moto propia sale del taller. El contrato vuelve a su placa original,
  // la prestada regresa al pool (Recuperada) y se cierra el préstamo.
  async function devolverReemplazo(prestamoId: string) {
    const p = prestamos.find(x => x.id === prestamoId);
    if (!p) return { error: "Préstamo no encontrado." };
    if (p.moto_original_id) {
      const { error: e1 } = await supabase.from("contratos").update({ moto_id: p.moto_original_id }).eq("id", p.contrato_id);
      if (e1) return { error: e1.message };
      await auditarCambioDeMoto(p.contrato_id, p.moto_prestada_id, p.moto_original_id, p.creado_por, "devolución del reemplazo");
      const { error: e2 } = await supabase.from("motos").update({ estado: "Asignada" }).eq("id", p.moto_original_id);
      if (e2) return { error: e2.message };
    }
    // La prestada vuelve a SU estado previo: Disponible si venía del pool disponible, Recuperada si
    // estaba retenida (desde ahí se resuelve su dueño). Fallback Recuperada para préstamos viejos.
    const estadoDestino = p.moto_prestada_estado_previo ?? "Recuperada";
    const { error: e3 } = await supabase.from("motos").update({ estado: estadoDestino }).eq("id", p.moto_prestada_id);
    if (e3) return { error: e3.message };
    const { error } = await supabase.from("prestamos_reemplazo")
      .update({ estado: "cerrado", fecha_fin: hoyISO() }).eq("id", prestamoId);
    return { error: error?.message ?? null };
  }

  return { prestamos, loading, prestamoActivoDeContrato, prestamoActivoDeMoto, prestarReemplazo, devolverReemplazo };
}
