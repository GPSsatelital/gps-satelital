import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Plantillas editables de los mensajes de WhatsApp. Se editan en Configuración (solo ADMIN/AP) y
// se guardan en la tabla mensajes_whatsapp. Comodines: {nombre} {placa} {dias} {valor}
// (y {folio} {fecha} {detalle} {pendiente} en los recibos, {cuentas} en cuentas_pago).
//
// Desde la mig 133 cada clave conoce además su plantilla vigente en Meta (`plantilla_meta`) y el
// orden de sus variables. LA REGLA: ninguna pantalla nombra una plantilla de Meta — nombra la
// CLAVE, y la base la traduce. Cambiar de formato es editar una fila, no desplegar código.

export type ClaveMensaje =
  | "dia_pago" | "gabela" | "mora" | "recoleccion" | "recibo" | "cuentas_pago"
  // Nuevas 8-sep-2026 (docs/PLANTILLAS-WHATSAPP.md): antes se mandaban con texto escrito en el
  // código, fuera de esta tabla — Meta jamás los habría aprobado.
  | "moto_retenida" | "acuse_comprobante" | "recibo_campo" | "contacto_general";

/** Lo que la base dice de una clave, aparte del texto: qué plantilla de Meta está vigente hoy y en
 *  qué orden van sus variables. `plantilla_meta` null = aún no registrada en Meta (solo texto
 *  dentro de la ventana de 24 h). */
export type MetaPlantilla = { plantilla_meta: string | null; variables: string[]; activa: boolean };

export const MENSAJES_META: { clave: ClaveMensaje; label: string; descripcion: string; comodines: string[] }[] = [
  { clave: "dia_pago",    label: "Día de pago",  descripcion: "Recordatorio el día que le toca pagar.", comodines: ["{nombre}", "{placa}", "{valor}"] },
  { clave: "gabela",      label: "Gabela",       descripcion: "El día de gracia (1 día después del pago sin pagar).", comodines: ["{nombre}", "{placa}", "{dias}", "{valor}"] },
  { clave: "mora",        label: "Mora",         descripcion: "Cuando ya está en mora (después de la gabela).", comodines: ["{nombre}", "{placa}", "{dias}", "{valor}"] },
  { clave: "recoleccion", label: "Recolección",  descripcion: "Último aviso antes de recoger la moto.", comodines: ["{nombre}", "{placa}", "{dias}", "{valor}"] },
  { clave: "moto_retenida", label: "Moto retenida", descripcion: "Al cliente cuya moto está en la empresa: qué debe para retirarla y que se comunique. Decisión del dueño (8-sep): a estos sí se les escribe.", comodines: ["{nombre}", "{placa}", "{valor}"] },
  { clave: "acuse_comprobante", label: "Comprobante recibido", descripcion: "Cuando llega la foto de una transferencia: 'lo recibimos, lo estamos verificando'. NO dice que el pago quedó acreditado.", comodines: ["{nombre}", "{valor}", "{placa}"] },
  { clave: "recibo",      label: "Recibo de pago", descripcion: "Comprobante que se envía cuando el pago queda CONFIRMADO. {detalle} inserta el desglose automático (solo sale como texto, dentro de la ventana de 24 h).", comodines: ["{nombre}", "{valor}", "{folio}", "{fecha}", "{placa}", "{pendiente}", "{detalle}"] },
  { clave: "recibo_campo", label: "Recibo de cobro en campo", descripcion: "Recibo provisional cuando un funcionario recibe efectivo en la calle: pendiente de validación en caja.", comodines: ["{nombre}", "{placa}", "{valor}", "{folio}", "{fecha}"] },
  { clave: "cuentas_pago", label: "Cuentas para pagar", descripcion: "Le dice al cliente a qué cuentas puede transferir. {cuentas} las inserta solas, según el grupo de SU moto — nunca las de otro portafolio.", comodines: ["{nombre}", "{placa}", "{cuentas}"] },
  { clave: "contacto_general", label: "Contacto general", descripcion: "Desde la campana de alertas: 'le escribimos por un tema de su moto, comuníquese'. Sin detalle variable a propósito — Meta no aprueba un cuerpo que sea una variable.", comodines: ["{nombre}", "{placa}"] },
];

// Texto por defecto — respaldo si la tabla aún no tiene el mensaje. Los que valen son los de la
// base (editables en Configuración); estos solo evitan mandar un mensaje vacío.
export const MENSAJES_DEFAULT: Record<ClaveMensaje, string> = {
  dia_pago:    "Hola {nombre}, le recordamos su pago de hoy en Club Moteros Cartagena. Cualquier duda estamos atentos. ¡Gracias! 🏍️",
  gabela:      "Hola {nombre}, su pago venció y está en día de gracia. Por favor póngase al día hoy para evitar la mora. Club Moteros Cartagena 🏍️",
  mora:        "Hola {nombre}, lleva {dias} de mora. Por favor comuníquese urgente con nosotros para regularizar su pago. Club Moteros Cartagena ⚠️",
  recoleccion: "Hola {nombre}, su moto de placa {placa} presenta {dias} de mora. Le informamos que se procederá con la RECOLECCIÓN del vehículo. Para evitarlo, comuníquese HOY y realice su pago. Club Moteros Cartagena ⚠️",
  moto_retenida: "Hola {nombre}, su moto {placa} está en nuestras instalaciones. Para entregársela nuevamente debe ponerse al día: {valor}. Comuníquese con nosotros para acordar cómo y cuándo la retira. Club Moteros Cartagena.",
  acuse_comprobante: "Hola {nombre}, recibimos su comprobante de pago por {valor} para la moto {placa}. Lo estamos verificando y le confirmamos apenas quede registrado. Club Moteros Cartagena.",
  recibo:      "🧾 *CLUB MOTEROS CARTAGENA — Comprobante de pago*{detalle}",
  recibo_campo: "Club Moteros Cartagena — recibo provisional de cobro en campo. Recibo {folio} del {fecha}. Cliente {nombre}, moto {placa}. Valor recibido: {valor}. Pendiente de validación en caja; conserve este comprobante.",
  cuentas_pago: "Hola {nombre}, estas son las cuentas donde puede hacer el pago de su moto {placa}:\n\n{cuentas}\n\nCuando transfiera, envíenos la foto del comprobante con el número de referencia para poder acreditarle el pago. Club Moteros Cartagena 🏍️",
  contacto_general: "Hola {nombre}, le escribimos de Club Moteros Cartagena por un tema de su moto {placa}. Por favor comuníquese con nosotros. Club Moteros Cartagena.",
};

// Reemplaza los comodines {x} por sus valores reales.
export function aplicarComodines(texto: string, vars: Record<string, string | number>): string {
  return texto.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

type FilaMensaje = { clave: string; texto: string; plantilla_meta?: string | null; variables?: string[] | null; activa?: boolean | null };

export function useMensajesWhatsapp() {
  const [filas, setFilas] = useState<Record<string, FilaMensaje>>({});
  const [loading, setLoading] = useState(true);

  const fetchMensajes = useCallback(async () => {
    // `*` y no una lista de columnas: si la mig 133 aún no corrió, las columnas nuevas no existen y
    // pedirlas por nombre tumbaría TODOS los mensajes de la app. Así solo faltan los datos nuevos.
    const { data } = await supabase.from("mensajes_whatsapp").select("*");
    const map: Record<string, FilaMensaje> = {};
    (data ?? []).forEach((r: FilaMensaje) => { map[r.clave] = r; });
    setFilas(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMensajes();
    const ch = supabase.channel(`mensajes-wa-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "mensajes_whatsapp" }, fetchMensajes)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchMensajes]);

  // Plantilla cruda de una clave (la guardada, o el default de respaldo).
  const plantilla = useCallback((clave: ClaveMensaje): string => {
    const t = filas[clave]?.texto;
    return t && t.trim() ? t : MENSAJES_DEFAULT[clave];
  }, [filas]);

  // Mensaje final listo para enviar (comodines reemplazados).
  const render = useCallback((clave: ClaveMensaje, vars: Record<string, string | number>): string => {
    return aplicarComodines(plantilla(clave), vars);
  }, [plantilla]);

  // Qué plantilla de Meta está vigente para la clave y en qué orden van sus variables.
  const meta = useCallback((clave: ClaveMensaje): MetaPlantilla => {
    const f = filas[clave];
    return {
      plantilla_meta: f?.plantilla_meta ?? null,
      variables: Array.isArray(f?.variables) ? f!.variables! : [],
      activa: f?.activa ?? true,
    };
  }, [filas]);

  async function guardar(clave: ClaveMensaje, texto: string) {
    const { error } = await supabase.from("mensajes_whatsapp")
      .upsert({ clave, texto, updated_at: new Date().toISOString() });
    return { error: error?.message ?? null };
  }

  // `mensajes` (clave → texto) se conserva para quien lo usaba antes.
  const mensajes: Record<string, string> = {};
  for (const k of Object.keys(filas)) mensajes[k] = filas[k].texto;

  return { mensajes, loading, plantilla, render, meta, guardar };
}
