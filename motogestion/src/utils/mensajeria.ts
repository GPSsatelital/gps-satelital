// Piezas PURAS de la tubería de mensajes (sin React ni Supabase, para poder probarlas):
// normalizar el número, ordenar las variables para Meta, y decidir por qué canal sale un mensaje.
// La parte que habla con la base y con ZALA vive en hooks/useEnvioMensaje.ts.

import type { ClaveMensaje } from "../hooks/useMensajesWhatsapp";

/** Los baldes del panel Hoy (los chips). Cada uno tiene su mensaje — el mismo mapa que la vitrina
 *  usa para `plantilla_hoy` (mig 134): si se cambia aquí, se cambia allá. */
export type BaldeHoy = "recoleccion" | "mora" | "gabela" | "pagan-hoy";

export function claveParaBalde(balde: BaldeHoy): ClaveMensaje {
  switch (balde) {
    case "recoleccion": return "recoleccion";
    case "mora": return "mora";
    case "gabela": return "gabela";
    case "pagan-hoy": return "dia_pago";
  }
}

/** Estado real de un mensaje. Los cinco primeros los devuelve ZALA (acuses de Meta); el resto
 *  son de esta app. `abierto_whatsapp` = se abrió WhatsApp en el equipo con el texto listo, pero
 *  nadie sabe si la persona presionó enviar — es el respaldo mientras ZALA no está conectada, y
 *  reemplaza al "Mensaje enviado" que antes se anotaba sin saberlo. */
export type MensajeEstado =
  | "en_cola" | "enviado" | "entregado" | "leido" | "fallo"
  | "abierto_whatsapp"
  | "sin_numero" | "sin_permiso" | "sin_plantilla" | "sin_conexion";

export type CanalEnvio = "zala" | "whatsapp_web" | "ninguno";

export type ResultadoEnvio = {
  canal: CanalEnvio;
  estado: MensajeEstado;
  /** Explicación para la persona, cuando el mensaje no salió o salió a medias. */
  motivo?: string;
  mensajeId?: string | null;
  /** Qué plantilla se usó (o la clave, en el respaldo). Es lo que se congela en la gestión. */
  plantilla?: string | null;
};

/**
 * Deja el número como lo quiere WhatsApp: solo dígitos, con el 57 delante. Devuelve null si no
 * sirve, para que el que llama avise en vez de abrir un enlace roto. Unifica los tres criterios
 * distintos que tenían los 8 botones (`>= 9`, `=== 10`, `startsWith("57")`).
 */
export function normalizarWhatsapp(tel: string | null | undefined): string | null {
  const d = (tel ?? "").replace(/\D/g, "");
  if (d.length === 10) return "57" + d;                 // celular colombiano tal cual lo escriben
  if (d.length === 12 && d.startsWith("57")) return d;  // ya viene con indicativo
  if (d.length >= 11 && d.length <= 15) return d;       // otro país, se respeta
  return null;
}

export function urlWaMe(numero: string, texto: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

const PARTICULAS = new Set(["de", "del", "la", "las", "los", "y", "da", "do", "dos", "das", "van", "von", "san", "santa"]);

/**
 * Cómo se le habla al cliente: por las DOS primeras palabras de su nombre registrado, con mayúscula
 * inicial — "Jose Alberto" o "Kevin Ortega", no "JOSE ALBERTO DORIA RODRIGUEZ" (regla del dueño,
 * 8-sep: "el nombre que salga con el primer apellido o segundo nombre"). Las partículas ("de",
 * "del", "la"…) no cuentan como palabra: "MARIA DE LOS ANGELES PEREZ" → "Maria de los Angeles".
 * Mismo criterio que `zala.nombre_corto()` en la vitrina (mig 134): si se toca uno, se toca el otro.
 */
export function nombreCorto(nombre: string | null | undefined): string {
  const t = (nombre ?? "").trim().split(/\s+/).filter(Boolean);
  if (t.length === 0) return "";
  const out: string[] = [t[0]];
  let i = 1;
  while (i < t.length && (out.length < 2 || PARTICULAS.has(t[i - 1].toLowerCase()))) {
    out.push(t[i]);
    i++;
    if (out.length >= 2 && !PARTICULAS.has(t[i - 1].toLowerCase())) break;
  }
  return out
    .map((w, k) => {
      const l = w.toLowerCase();
      return k > 0 && PARTICULAS.has(l) ? l : l.charAt(0).toUpperCase() + l.slice(1);
    })
    .join(" ");
}

/** "$202.000" — el formato en que el cliente lee la plata en todos los mensajes. */
export function fmtPesos(n: number): string {
  return `$${Math.round(n).toLocaleString("es-CO")}`;
}

/** "1 día" / "3 días". Meta no deja poner la palabra fuera de la variable sin que quede
 *  "lleva 1 días", así que la palabra viaja dentro del valor. */
export function diasTexto(n: number): string {
  const d = Math.max(0, Math.round(n));
  return `${d} ${d === 1 ? "día" : "días"}`;
}

/** Los comodines, dichos como los entiende quien cobra — para que un mensaje bloqueado explique
 *  QUÉ dato falta, no un nombre de variable. */
const PALABRA_VAR: Record<string, string> = {
  nombre: "el nombre del cliente",
  placa: "la placa",
  valor: "el valor a pagar",
  dias: "los días desde su último pago registrado",
  vencida: "los días que lleva vencida la cuota",
  folio: "el número de recibo",
  fecha: "la fecha del pago",
  pendiente: "lo que le queda pendiente",
  cuentas: "las cuentas del grupo de su moto",
};

export function faltanEnPalabras(faltan: string[]): string {
  return faltan.map(v => PALABRA_VAR[v] ?? v).join(", ");
}

/**
 * De los comodines con nombre ({nombre}, {valor}…) a la lista posicional de Meta ({{1}}, {{2}}…),
 * en el orden que dice `mensajes_whatsapp.variables` para esa clave. Un comodín que la plantilla
 * pide y no vino llega vacío: Meta rechaza variables vacías, así que el que llama debe mandar
 * todas — por eso se devuelve también cuáles faltaron.
 */
export function ordenarVariables(
  vars: Record<string, string | number | null | undefined>,
  orden: string[],
): { valores: string[]; faltan: string[] } {
  const valores: string[] = [];
  const faltan: string[] = [];
  for (const k of orden) {
    const v = vars[k];
    if (v === undefined || v === null || String(v).trim() === "") { faltan.push(k); valores.push(""); }
    else valores.push(String(v));
  }
  return { valores, faltan };
}

/**
 * Por qué canal sale (o no sale) un mensaje. Es la decisión de negocio del dueño (8-sep-2026):
 *   · Mientras ZALA no está conectada: se abre WhatsApp como siempre, para todo el mundo.
 *   · Con ZALA conectada: solo quien tenga el permiso `enviar_mensaje` (al principio, el
 *     administrador principal; después se reparte por persona). Sin permiso NO hay respaldo por
 *     wa.me — ese es justamente el camino que bloqueó el número.
 *   · Una clave desactivada no sale por ningún lado.
 */
/** Resumen de una tanda masiva, para decirle a quien la mandó qué pasó con cada grupo. */
export function resumirTanda(resultados: ResultadoEnvio[]): { salieron: number; enCola: number; fallaron: number; noSalieron: number } {
  let salieron = 0, enCola = 0, fallaron = 0, noSalieron = 0;
  for (const r of resultados) {
    if (r.estado === "enviado" || r.estado === "entregado" || r.estado === "leido") salieron++;
    else if (r.estado === "en_cola") enCola++;
    else if (r.estado === "fallo" || r.estado === "sin_conexion") fallaron++;
    else noSalieron++;   // sin_numero · sin_permiso · sin_plantilla · abierto_whatsapp (no debería pasar en masivo)
  }
  return { salieron, enCola, fallaron, noSalieron };
}

export function decidirCanal(x: {
  zalaActivo: boolean;
  tienePermiso: boolean;
  plantillaActiva: boolean;
  numero: string | null;
}): { canal: CanalEnvio; estado?: MensajeEstado; motivo?: string } {
  if (!x.numero) return { canal: "ninguno", estado: "sin_numero", motivo: "El cliente no tiene un número de WhatsApp válido registrado." };
  if (!x.plantillaActiva) return { canal: "ninguno", estado: "sin_plantilla", motivo: "Este mensaje está desactivado en Configuración." };
  if (!x.zalaActivo) return { canal: "whatsapp_web" };
  if (!x.tienePermiso) return { canal: "ninguno", estado: "sin_permiso", motivo: "No tienes permiso para enviar mensajes por el canal oficial. Pídeselo al administrador principal." };
  return { canal: "zala" };
}
