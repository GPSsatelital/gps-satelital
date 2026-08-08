import { supabase } from "./supabase";

// Acceso a los archivos del cliente (cédulas, recibos, firmas, huellas, comprobantes) con
// enlaces FIRMADOS que caducan, en vez de enlaces públicos eternos.
//
// EL PROBLEMA: los buckets `documentos` y `comprobantes` son públicos. Un enlace de una cédula
// —que viaja por WhatsApp, queda en el historial del navegador o en la caché de alguien— abre
// el documento a cualquiera, sin sesión, para siempre. Son datos personales de 269 clientes.
//
// POR QUÉ NO BASTA CON CAMBIAR CÓMO SE GENERAN: las URLs públicas ya están GUARDADAS en la base
// (miles de filas: `comprobante_url`, `firma_url`, `documentos_cliente`, `fotos`...). Reescribir
// esas filas sería una migración enorme y arriesgada. En vez de eso, se firma AL MOSTRAR: de la
// URL guardada se saca el camino del archivo y se pide un enlace temporal.
//
// ORDEN DE DESPLIEGUE (importante): firmar funciona igual en un bucket público, así que TODO el
// código puede migrarse sin romper nada. Los buckets se cierran DESPUÉS, cuando esté verificado
// que ninguna pantalla quedó con el enlace viejo. Al revés se rompen imágenes en producción.

const MINUTOS_VALIDEZ = 60;

/**
 * Saca bucket y camino de una URL pública de Supabase Storage.
 * Formato: https://{ref}.supabase.co/storage/v1/object/public/{bucket}/{camino}
 * Devuelve null si no es una URL de Storage (una foto externa, un dataURL, o basura).
 */
export function partesDeUrlStorage(url: string): { bucket: string; camino: string } | null {
  if (!url || typeof url !== "string") return null;
  const i = url.indexOf("/storage/v1/object/public/");
  if (i < 0) return null;
  const resto = url.slice(i + "/storage/v1/object/public/".length);
  const corte = resto.indexOf("/");
  if (corte <= 0) return null;
  return {
    bucket: resto.slice(0, corte),
    // Las rutas con espacios o acentos vienen codificadas en la URL; la API las quiere crudas.
    camino: decodeURIComponent(resto.slice(corte + 1).split("?")[0]),
  };
}

/**
 * Convierte una URL guardada en un enlace temporal. Si no es de Storage la devuelve tal cual
 * (una foto de perfil externa o un dataURL recién capturado deben seguir funcionando).
 *
 * Si la firma falla, devuelve la URL original: mientras los buckets sigan públicos eso funciona,
 * y el día que se cierren es preferible una imagen rota a una pantalla en blanco.
 */
export async function urlFirmada(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  const p = partesDeUrlStorage(url);
  if (!p) return url;
  const { data, error } = await supabase.storage
    .from(p.bucket)
    .createSignedUrl(p.camino, MINUTOS_VALIDEZ * 60);
  if (error || !data?.signedUrl) return url;
  return data.signedUrl;
}

/**
 * Abre un documento en otra pestaña con enlace firmado.
 * Se abre la pestaña ANTES de pedir la firma: si se abriera después, el navegador la trataría
 * como una ventana emergente no pedida por el usuario y la bloquearía.
 */
export async function abrirDocumento(url: string | null | undefined) {
  if (!url) return;
  const w = window.open("", "_blank");
  const firmada = await urlFirmada(url);
  if (!w) return;
  if (firmada) w.location.href = firmada;
  else w.close();
}
