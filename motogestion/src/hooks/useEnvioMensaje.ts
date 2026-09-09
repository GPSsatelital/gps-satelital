import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useGestiones, type TipoGestion } from "./useGestiones";
import { useMensajesWhatsapp, type ClaveMensaje } from "./useMensajesWhatsapp";
import { decidirCanal, faltanEnPalabras, normalizarWhatsapp, nombreCorto, ordenarVariables, urlWaMe, type ResultadoEnvio, type MensajeEstado } from "../utils/mensajeria";

// LA TUBERÍA ÚNICA DE ENVÍO (Fase 1 de la integración con ZALA, 8-sep-2026).
//
// Antes había 8 botones que abrían `wa.me`, cada uno a su manera: uno anotaba "mensaje enviado"
// sin saberlo, dos no anotaban nada, y tres mandaban texto escrito en el código que Meta jamás
// aprobaría. Ahora todos llaman `enviar()`:
//   1. normaliza el número y decide el canal (ver `decidirCanal`, regla del dueño);
//   2. MotoGestión manda `{plantilla, variables}` — nunca escribe el mensaje final. ZALA decide si
//      sale como texto (ventana de 24 h abierta) o como plantilla aprobada; el cliente lee lo mismo;
//   3. deja en `gestiones_cobro` qué plantilla se usó y el estado REAL del mensaje.
//
// MIENTRAS ZALA NO ESTÉ CONECTADA (`VITE_ZALA_ENVIO` distinto de "on"): se abre WhatsApp como
// siempre, para que la operación no se frene, pero la gestión dice `abierto_whatsapp` — "se abrió
// WhatsApp con el texto; el envío no está confirmado" — en vez de mentir.
//
// LA LLAVE DE ZALA NUNCA VIVE AQUÍ: esto corre en el navegador del funcionario, y una llave aquí la
// ve cualquiera. La llamada sale por la Edge Function `enviar-mensaje`, que la guarda del lado del
// servidor y además verifica el permiso `enviar_mensaje` con `puede_accion()` en la base.

export type OpcionesEnvio = {
  /** A qué contrato se le anota la gestión. Sin él (una alerta de moto sin contrato) el mensaje
   *  sale igual pero no queda gestión — no hay a quién colgársela. */
  contratoId?: string | null;
  telefono: string | null | undefined;
  /** La clave del mensaje. La base la traduce a la plantilla vigente en Meta. */
  clave?: ClaveMensaje;
  /** Comodines con nombre: {nombre} {placa} {valor}… Se ordenan para Meta según la fila de la clave. */
  vars?: Record<string, string | number>;
  /** Texto que reemplaza al render de la clave (p.ej. el estado de cuenta completo). Sin clave, es
   *  texto libre: solo puede salir dentro de la ventana de 24 h — ZALA lo dice si no. */
  textoLibre?: string;
  /** Tipo de gestión que queda en el historial. Por defecto "whatsapp". */
  tipoGestion?: TipoGestion;
  /** Lo que lee el funcionario en el historial ("Mensaje de recordatorio", "Recibo de pago"…). */
  resultado?: string;
};

function zalaConectada(): boolean {
  return import.meta.env.VITE_ZALA_ENVIO === "on";
}

export function useEnvioMensaje() {
  const { profile, puede } = useAuth();
  const { render, meta } = useMensajesWhatsapp();
  const { registrarGestion } = useGestiones();

  async function anotar(o: OpcionesEnvio, r: { plantilla: string | null; variables: string[]; estado: MensajeEstado; motivo?: string | null; mensajeId?: string | null; aprobadoPor?: string | null }): Promise<string | null> {
    if (!o.contratoId || !profile) return null;
    const { error } = await registrarGestion(o.contratoId, o.tipoGestion ?? "whatsapp", o.resultado ?? "Mensaje de WhatsApp", profile.id, {
      plantilla_usada: r.plantilla,
      variables_usadas: r.variables,
      mensaje_id: r.mensajeId ?? null,
      mensaje_estado: r.estado,
      mensaje_motivo: r.motivo ?? null,
      aprobado_por: r.aprobadoPor ?? null,
    });
    return error;
  }

  async function enviar(o: OpcionesEnvio): Promise<ResultadoEnvio> {
    const numero = normalizarWhatsapp(o.telefono);
    const m = o.clave ? meta(o.clave) : null;
    // Al cliente se le habla por su nombre corto ("Jose Alberto"), venga como venga desde la pantalla
    // (las pantallas siguen mandando el nombre completo en mayúsculas, que es como lo guardan).
    const vars: Record<string, string | number> = { ...(o.vars ?? {}) };
    if (vars.nombre !== undefined) vars.nombre = nombreCorto(String(vars.nombre));
    const texto = o.textoLibre ?? (o.clave ? render(o.clave, vars) : "");
    const zalaActivo = zalaConectada();

    // Qué se congela en la gestión: la plantilla de Meta vigente, o la clave si aún no hay.
    const plantilla = m?.plantilla_meta ?? o.clave ?? null;
    const { valores: variables, faltan } = m ? ordenarVariables(vars, m.variables) : { valores: [], faltan: [] };

    // Un dato que falta NO sale por ningún canal. Meta rechaza variables vacías, y por wa.me
    // saldría un mensaje con un hueco ("su último pago fue hace  y su cuota…"). El caso real que
    // obliga a esto: el cliente que nunca ha registrado un pago y el mensaje de mora nombra su
    // último pago. Ese se gestiona por llamada, no con un mensaje a medias.
    if (faltan.length > 0) {
      return { canal: "ninguno", estado: "sin_plantilla", plantilla,
               motivo: `No se puede armar el mensaje: falta ${faltanEnPalabras(faltan)}. Gestione este caso a mano (llamada) o registre ese dato primero.` };
    }

    const d = decidirCanal({ zalaActivo, tienePermiso: puede("enviar_mensaje"), plantillaActiva: m ? m.activa : true, numero });
    if (d.canal === "ninguno") return { canal: "ninguno", estado: d.estado!, motivo: d.motivo };

    if (d.canal === "whatsapp_web") {
      // `window.open` ANTES de cualquier `await`: fuera del gesto del usuario el navegador lo bloquea.
      window.open(urlWaMe(numero!, texto), "_blank");
      const motivo = "Se abrió WhatsApp con el mensaje; el envío no está confirmado (ZALA aún no conectada).";
      const errAnotar = await anotar(o, { plantilla, variables, estado: "abierto_whatsapp", motivo });
      return { canal: "whatsapp_web", estado: "abierto_whatsapp", plantilla,
               motivo: errAnotar ? `Se abrió WhatsApp, pero no se pudo anotar la gestión: ${errAnotar}` : undefined };
    }

    // ── ZALA ──
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke("enviar-mensaje", {
      body: { contrato_id: o.contratoId ?? null, telefono: numero, clave: o.clave ?? null, plantilla: m?.plantilla_meta ?? null, variables, texto },
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
    });
    const respuesta = (data ?? {}) as { ok?: boolean; id?: string | null; estado?: string; motivo?: string | null; error?: string };
    if (error || respuesta.error || !respuesta.ok) {
      const motivo = respuesta.error ?? error?.message ?? "ZALA no respondió.";
      return { canal: "zala", estado: "sin_conexion", plantilla, motivo };
    }
    const estado = (["en_cola", "enviado", "entregado", "leido"].includes(respuesta.estado ?? "") ? respuesta.estado : "fallo") as MensajeEstado;
    const errAnotar = await anotar(o, { plantilla, variables, estado, motivo: respuesta.motivo ?? null, mensajeId: respuesta.id ?? null, aprobadoPor: profile?.id ?? null });
    return { canal: "zala", estado, plantilla, mensajeId: respuesta.id ?? null,
             motivo: estado === "fallo" ? (respuesta.motivo ?? "ZALA rechazó el envío.") : (errAnotar ? `Enviado, pero no se pudo anotar la gestión: ${errAnotar}` : undefined) };
  }

  return { enviar, zalaConectada: zalaConectada() };
}
