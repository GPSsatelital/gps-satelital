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
  // {dia_pago} = el día de ESE cliente dicho dentro de la frase ("los lunes", "los días 15 y 30 de
  // cada mes"). El día de pago es uno solo y la gabela es solo para terminar de completar: por eso
  // el texto ya no dice "los pagos son los lunes", que era falso para media cartera.
  { clave: "gabela",      label: "Gabela",       descripcion: "El día de gracia (1 día después del pago sin pagar). Le OFRECE el día de hoy y le recuerda cuál es SU día de pago.", comodines: ["{nombre}", "{placa}", "{valor}", "{dia_pago}"] },
  // {dias} y {vencida} son cosas distintas y por eso van las dos (regla del dueño, 8-sep): {dias} =
  // desde su último pago registrado (el cliente lo reconoce), {vencida} = lo que lleva vencida la
  // cuota (la que manda para recoger). Con una sola, un abono parcial de ayer haría ver "1 día"
  // a quien debe tres semanas.
  { clave: "mora",        label: "Mora",         descripcion: "Cuando ya está en mora. NO ofrece más plazo: le informa su estado, le recuerda su día de pago y le advierte que desde hoy el apagado y la recolección pueden pasar en cualquier momento.", comodines: ["{nombre}", "{placa}", "{dias}", "{vencida}", "{valor}", "{dia_pago}"] },
  { clave: "recoleccion", label: "Recolección",  descripcion: "Último aviso antes de recoger la moto.", comodines: ["{nombre}", "{placa}", "{dias}", "{vencida}", "{valor}"] },
  { clave: "moto_retenida", label: "Moto retenida", descripcion: "Al cliente cuya moto está en la empresa: lo invita a volver a rodar y le pregunta cómo desea proceder — sin imponerle la cifra (decisión del dueño, 8-sep).", comodines: ["{nombre}", "{placa}"] },
  { clave: "acuse_comprobante", label: "Comprobante recibido", descripcion: "Cuando llega la foto de una transferencia: 'lo recibimos, lo estamos verificando'. NO dice que el pago quedó acreditado.", comodines: ["{nombre}", "{valor}", "{placa}"] },
  { clave: "recibo",      label: "Recibo de pago", descripcion: "Comprobante que se envía cuando el pago queda CONFIRMADO. {detalle} inserta el desglose automático (solo sale como texto, dentro de la ventana de 24 h).", comodines: ["{nombre}", "{valor}", "{folio}", "{fecha}", "{placa}", "{pendiente}", "{detalle}"] },
  { clave: "recibo_campo", label: "Recibo de cobro en campo", descripcion: "Recibo provisional cuando un funcionario recibe efectivo en la calle: pendiente de validación en caja.", comodines: ["{nombre}", "{placa}", "{valor}", "{folio}", "{fecha}"] },
  { clave: "cuentas_pago", label: "Cuentas para pagar", descripcion: "Le dice al cliente a qué cuentas puede transferir. {cuentas} las inserta solas, según el grupo de SU moto — nunca las de otro portafolio.", comodines: ["{nombre}", "{placa}", "{cuentas}"] },
  { clave: "contacto_general", label: "Contacto general", descripcion: "Desde la campana de alertas: 'le escribimos por un tema de su moto, comuníquese'. Sin detalle variable a propósito — Meta no aprueba un cuerpo que sea una variable.", comodines: ["{nombre}", "{placa}"] },
];

// Texto por defecto — respaldo si la tabla aún no tiene el mensaje. Los que valen son los de la
// base (editables en Configuración); estos solo evitan mandar un mensaje vacío.
export const MENSAJES_DEFAULT: Record<ClaveMensaje, string> = {
  dia_pago:    "Hola, {nombre}. Bendiciones 🏍️\nHoy es su día de pago de la moto {placa}. Su cuota del día de hoy es {valor}.\nPuede realizar el pago en la oficina o por transferencia; si transfiere, envíenos la foto del comprobante con la placa y su nombre.\nSi ya realizó el pago, ¡gracias por su puntualidad! Quedamos atentos.",
  gabela:      "Hola, {nombre}. Bendiciones.\nSu pago de la moto {placa} venció ayer y hoy es su día de gracia: le podemos dar el día de hoy para ponerse al día con {valor} y no entrar en mora.\nRecuerde que su pago se realiza {dia_pago}: el día de gracia es solo para terminar de completarlo, no para dejarlo para después.\nSi ya realizó el pago, envíenos el comprobante con la placa y su nombre para actualizarlo de inmediato. Quedamos atentos.",
  mora:        "Hola, {nombre}. Bendiciones.\nSu último pago registrado de la moto {placa} fue hace {dias} y su cuota lleva {vencida} de vencida; hoy debe {valor}. Su pago se realiza {dia_pago} y ese mismo día debe quedar cubierto; mientras el pago no se complete, su cuenta sigue en mora.\nLe recordamos que, estando en mora, el sistema puede realizar el apagado del vehículo en cualquier momento y proceder con su recolección.\nPóngase al día lo más pronto posible para seguir rodando tranquilo. Escríbanos para reportar su pago o para acordar cómo se pone al día. Quedamos atentos.",
  recoleccion: "Hola, {nombre}. Bendiciones.\nSu último pago registrado de la moto {placa} fue hace {dias} y su cuota lleva {vencida} de vencida; debe {valor}. Se agotaron los plazos y su caso pasó a recolección, lo que genera un costo adicional de inmovilización.\nAún está a tiempo de evitarlo si se pone al día de inmediato: envíenos el comprobante o escríbanos ahora mismo para acordar el pago. Quedamos atentos.",
  moto_retenida: "Hola, {nombre}. Bendiciones.\nSu moto {placa} está guardada en nuestras instalaciones y queremos verlo rodando nuevamente con ella. Cuéntenos cómo desea proceder: en la oficina revisamos con usted las opciones para devolverle su vehículo lo antes posible.\nComuníquese con nosotros por este medio. Quedamos atentos.",
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
