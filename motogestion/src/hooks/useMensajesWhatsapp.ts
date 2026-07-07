import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Plantillas editables de los mensajes de WhatsApp (día de pago, gabela, mora,
// recolección, recibo). Se editan en Configuración (solo ADMIN/AP) y se guardan
// en la tabla mensajes_whatsapp. Comodines: {nombre} {placa} {dias} {valor}
// (y {folio} {fecha} {detalle} en el recibo).

export type ClaveMensaje = "dia_pago" | "gabela" | "mora" | "recoleccion" | "recibo";

export const MENSAJES_META: { clave: ClaveMensaje; label: string; descripcion: string; comodines: string[] }[] = [
  { clave: "dia_pago",    label: "Día de pago",  descripcion: "Recordatorio el día que le toca pagar.", comodines: ["{nombre}", "{placa}", "{valor}"] },
  { clave: "gabela",      label: "Gabela",       descripcion: "El día de gracia (1 día después del pago sin pagar).", comodines: ["{nombre}", "{placa}", "{dias}", "{valor}"] },
  { clave: "mora",        label: "Mora",         descripcion: "Cuando ya está en mora (después de la gabela).", comodines: ["{nombre}", "{placa}", "{dias}", "{valor}"] },
  { clave: "recoleccion", label: "Recolección",  descripcion: "Último aviso antes de recoger la moto.", comodines: ["{nombre}", "{placa}", "{dias}", "{valor}"] },
  { clave: "recibo",      label: "Recibo de pago", descripcion: "Comprobante que se envía tras registrar un pago. {detalle} inserta el desglose automático.", comodines: ["{nombre}", "{valor}", "{folio}", "{fecha}", "{detalle}"] },
];

// Texto por defecto — respaldo si la tabla aún no tiene el mensaje (o antes de correr la mig 039).
export const MENSAJES_DEFAULT: Record<ClaveMensaje, string> = {
  dia_pago:    "Hola {nombre}, le recordamos su pago de hoy en GPS Satelital. Cualquier duda estamos atentos. ¡Gracias! 🏍️",
  gabela:      "Hola {nombre}, su pago venció y está en día de gracia. Por favor póngase al día hoy para evitar la mora. GPS Satelital 🏍️",
  mora:        "Hola {nombre}, lleva {dias} días de mora. Por favor comuníquese urgente con nosotros para regularizar su pago. GPS Satelital ⚠️",
  recoleccion: "Hola {nombre}, su moto de placa {placa} presenta {dias} días de mora. Le informamos que se procederá con la RECOLECCIÓN del vehículo. Para evitarlo, comuníquese HOY y realice su pago. GPS Satelital ⚠️",
  recibo:      "🧾 *GPS SATELITAL — Comprobante de pago*{detalle}",
};

// Reemplaza los comodines {x} por sus valores reales.
export function aplicarComodines(texto: string, vars: Record<string, string | number>): string {
  return texto.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export function useMensajesWhatsapp() {
  const [mensajes, setMensajes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchMensajes = useCallback(async () => {
    const { data } = await supabase.from("mensajes_whatsapp").select("clave, texto");
    const map: Record<string, string> = {};
    (data ?? []).forEach((r: { clave: string; texto: string }) => { map[r.clave] = r.texto; });
    setMensajes(map);
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
    const t = mensajes[clave];
    return t && t.trim() ? t : MENSAJES_DEFAULT[clave];
  }, [mensajes]);

  // Mensaje final listo para enviar (comodines reemplazados).
  const render = useCallback((clave: ClaveMensaje, vars: Record<string, string | number>): string => {
    return aplicarComodines(plantilla(clave), vars);
  }, [plantilla]);

  async function guardar(clave: ClaveMensaje, texto: string) {
    const { error } = await supabase.from("mensajes_whatsapp")
      .upsert({ clave, texto, updated_at: new Date().toISOString() });
    return { error: error?.message ?? null };
  }

  return { mensajes, loading, plantilla, render, guardar };
}
