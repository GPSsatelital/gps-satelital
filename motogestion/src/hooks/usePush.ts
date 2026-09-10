import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// AVISOS AL CELULAR (10-sep-2026) — fase 5 de docs/FLUJO-DIARIO.md.
//
// Hasta ahora, si nadie abría la app, nadie se enteraba de nada. Con los pendientes ya en el
// servidor (migs 142-145) por fin hay QUÉ avisar; esto es POR DÓNDE.
//
// 🔴 LA LLAVE PÚBLICA VA EN EL CÓDIGO A PROPÓSITO. Es la mitad pública del par: viaja en el
// paquete de la app y cualquiera que abra el navegador la puede leer — así está diseñado. La que
// firma los envíos es la privada, que vive SOLO en los secretos de Supabase. Se pone acá quemada
// y no en una variable de entorno para no repetir el clásico "funciona en mi máquina y en
// producción no", que con una variable que hay que acordarse de copiar a Vercel pasa siempre.
const LLAVE_PUBLICA = "BNZY3ggEMTzCAnQSUpShsQObz_PU2Qn38m0IjsQ4ZrIlswqdgo476VXB55OsON-bJpIjKbkVapYW_ogRnv7HVxA";

export type EstadoPush =
  | "cargando"
  | "no-soportado"   // el navegador no sabe de esto (pasa en iPhone dentro del navegador)
  | "apagado"        // se puede prender
  | "bloqueado"      // la persona le dio "Bloquear" y hay que ir a los ajustes
  | "prendido";

function aBytes(base64url: string): Uint8Array {
  const b64 = (base64url + "=".repeat((4 - base64url.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

function aTexto(buf: ArrayBuffer | null): string {
  if (!buf) return "";
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Un nombre entendible del aparato, para que en la lista se sepa cuál apagar. */
function nombreDelAparato(): string {
  const ua = navigator.userAgent;
  const sistema = /Android/i.test(ua) ? "Android"
    : /iPhone|iPad/i.test(ua) ? "iPhone"
    : /Windows/i.test(ua) ? "Windows"
    : /Mac/i.test(ua) ? "Mac" : "Otro";
  const navegador = /Edg\//.test(ua) ? "Edge"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Safari\//.test(ua) ? "Safari" : "";
  return navegador ? `${sistema} · ${navegador}` : sistema;
}

const SOPORTADO = typeof navigator !== "undefined"
  && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export function usePush() {
  const [estado, setEstado] = useState<EstadoPush>("cargando");
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revisar = useCallback(async () => {
    if (!SOPORTADO) { setEstado("no-soportado"); return; }
    if (Notification.permission === "denied") { setEstado("bloqueado"); return; }
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sus = reg ? await reg.pushManager.getSubscription() : null;
      setEstado(sus ? "prendido" : "apagado");
    } catch {
      setEstado("apagado");
    }
  }, []);

  useEffect(() => { void revisar(); }, [revisar]);

  /** Prender los avisos EN ESTE aparato. Pide permiso, se suscribe y lo guarda. */
  async function activar() {
    if (trabajando || !SOPORTADO) return;
    setTrabajando(true);
    setError(null);
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        setEstado(permiso === "denied" ? "bloqueado" : "apagado");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Si ya había una suscripción vieja de este aparato se reusa; suscribirse dos veces crea
      // dos direcciones distintas y la persona recibiría el mismo aviso repetido.
      const sus = await reg.pushManager.getSubscription()
        ?? await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: aBytes(LLAVE_PUBLICA) as BufferSource,
        });

      const { data: sesion } = await supabase.auth.getUser();
      const uid = sesion.user?.id;
      if (!uid) { setError("No hay sesión abierta."); return; }

      // Por `endpoint`: si la persona vuelve a prenderlo en el mismo aparato, se actualiza la
      // fila que ya existe en vez de dejar dos apuntando al mismo teléfono.
      const { error: err } = await supabase.from("push_dispositivos").upsert({
        usuario_id: uid,
        endpoint: sus.endpoint,
        p256dh: aTexto(sus.getKey("p256dh")),
        auth: aTexto(sus.getKey("auth")),
        aparato: nombreDelAparato(),
        fallos: 0,
      }, { onConflict: "endpoint" });

      if (err) { setError(err.message); return; }
      setEstado("prendido");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo activar.");
    } finally {
      setTrabajando(false);
    }
  }

  /** Apagar los avisos en este aparato (los demás siguen igual). */
  async function desactivar() {
    if (trabajando || !SOPORTADO) return;
    setTrabajando(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sus = reg ? await reg.pushManager.getSubscription() : null;
      if (sus) {
        await supabase.from("push_dispositivos").delete().eq("endpoint", sus.endpoint);
        await sus.unsubscribe();
      }
      setEstado("apagado");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo apagar.");
    } finally {
      setTrabajando(false);
    }
  }

  /** Pedirle al servidor que mande un aviso de prueba a ESTE aparato. */
  async function probar(): Promise<string> {
    const reg = await navigator.serviceWorker.getRegistration();
    const sus = reg ? await reg.pushManager.getSubscription() : null;
    if (!sus) return "Primero hay que activar los avisos en este celular.";
    const { data, error: err } = await supabase.functions.invoke("avisar", {
      body: { prueba: true, endpoint: sus.endpoint },
    });
    if (err) return "No se pudo mandar: " + err.message;
    return (data as { mensaje?: string })?.mensaje ?? "Enviado. Revisa la barra de avisos.";
  }

  return { estado, trabajando, error, activar, desactivar, probar, recargar: revisar };
}
