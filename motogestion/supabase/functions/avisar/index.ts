// AVISAR — manda notificaciones al celular (fase 5 de docs/FLUJO-DIARIO.md).
//
// Hace dos cosas, según cómo se la llame:
//
//   1. { prueba: true, endpoint }  → manda UN aviso de prueba a ese aparato. Es el botón "Probar"
//      de Mi Día, para que la persona confirme con el celular en la mano que sí le suena.
//
//   2. { resumen: true, momento }  → el resumen. Va DOS VECES AL DÍA (decisión del dueño, 10-sep):
//      en la mañana la lista completa, y a media tarde **solo lo que sigue sin hacerse**. La
//      llama el despertador (cron), no una persona.
//
//      La cuenta es la MISMA en los dos momentos: siempre se descuenta lo que la persona ya marcó
//      como atendido hoy. A las 7am eso está vacío (sale la lista completa) y a las 2pm ya no.
//      No hay dos lógicas: hay una, mirada a dos horas distintas. Lo único que cambia es cómo se
//      dice, porque un mensaje idéntico dos veces al día se vuelve ruido y se deja de mirar.
//
// 🔴 A QUIEN NO TIENE NADA NO SE LE MANDA NADA. Un aviso que dice "no tienes pendientes" enseña
// a ignorar los avisos, y el día que llegue uno de verdad nadie lo va a mirar.
//
// 🔴 LA LLAVE PRIVADA (VAPID_PRIVADA) vive SOLO en los secretos de Supabase. Nunca en el repo,
// nunca en el paquete de la app. La pública sí va en el código de la app: así está diseñado.
//
// Se usa `npm:web-push` porque el envío no es "mandar un texto": hay que firmar con la llave y
// cifrar el contenido con las llaves del aparato. Escribir eso a mano son ~150 líneas de
// criptografía donde un error se ve como "no llega y no se sabe por qué".

import webpush from "npm:web-push@3.6.7";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-llave",
};

const VAPID_PUBLICA = "BNZY3ggEMTzCAnQSUpShsQObz_PU2Qn38m0IjsQ4ZrIlswqdgo476VXB55OsON-bJpIjKbkVapYW_ogRnv7HVxA";

type Aparato = { id: string; usuario_id: string; endpoint: string; p256dh: string; auth: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const privada = Deno.env.get("VAPID_PRIVADA");
  if (!privada) {
    return json({ ok: false, mensaje: "Falta el secreto VAPID_PRIVADA en Supabase." }, 500);
  }
  webpush.setVapidDetails("mailto:gpssatelitalcartagena@gmail.com", VAPID_PUBLICA, privada);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  let cuerpo: Record<string, unknown> = {};
  try { cuerpo = await req.json(); } catch { /* sin cuerpo */ }

  // ── El despertador ────────────────────────────────────────────────────────
  if (cuerpo.resumen === true) {
    // Solo lo llama el cron. Se protege con un secreto propio y no con la sesión de un usuario,
    // porque el cron no es una persona: no tiene sesión que presentar.
    const esperado = Deno.env.get("CRON_LLAVE");
    if (!esperado || req.headers.get("x-cron-llave") !== esperado) {
      return json({ ok: false, mensaje: "No autorizado." }, 401);
    }
    const momento = cuerpo.momento === "tarde" ? "tarde" : "manana";
    return await resumenDelDia(admin, momento as "manana" | "tarde");
  }

  // ── La prueba ─────────────────────────────────────────────────────────────
  if (cuerpo.prueba === true && typeof cuerpo.endpoint === "string") {
    const { data } = await admin.from("push_dispositivos").select("*").eq("endpoint", cuerpo.endpoint).limit(1);
    const ap = (data ?? [])[0] as Aparato | undefined;
    if (!ap) return json({ ok: false, mensaje: "Ese celular no está registrado. Vuelve a activarlo." });

    const r = await mandar(admin, ap, {
      titulo: "MotoGestión",
      cuerpo: "Listo: así se van a ver tus avisos.",
      url: "/",
      tag: "prueba",
    });
    return json(r.ok
      ? { ok: true, mensaje: "Enviado. Debe sonarte en unos segundos." }
      : { ok: false, mensaje: "No se pudo entregar: " + r.detalle });
  }

  return json({ ok: false, mensaje: "No entendí qué hay que mandar." }, 400);
});

// ── El resumen (mañana y tarde) ─────────────────────────────────────────────────
async function resumenDelDia(admin: ReturnType<typeof createClient>, momento: "manana" | "tarde") {
  const hoy = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }))
    .toISOString().slice(0, 10);

  const [{ data: pend }, { data: atend }, { data: aparatos }, { data: perfiles }] = await Promise.all([
    admin.from("pendientes").select("clave, nivel, dueno_id, dueno_rol"),
    admin.from("pendientes_atendidos").select("clave").eq("fecha", hoy),
    admin.from("push_dispositivos").select("*"),
    admin.from("profiles").select("id, nombre, role"),
  ]);

  const hechos = new Set((atend ?? []).map((a: { clave: string }) => a.clave));
  const gente = (perfiles ?? []) as { id: string; nombre: string; role: string }[];

  let enviados = 0, saltados = 0, fallidos = 0;

  for (const persona of gente) {
    const suyos = (pend ?? []).filter((p: { dueno_id: string | null; dueno_rol: string | null; clave: string }) =>
      (p.dueno_id === persona.id || (p.dueno_rol && p.dueno_rol === persona.role)) && !hechos.has(p.clave));

    if (suyos.length === 0) { saltados++; continue; }   // sin nada que decir, no se molesta

    const urgentes = suyos.filter((p: { nivel: string }) => p.nivel === "critico").length;
    const nombre = (persona.nombre ?? "").split(" ")[0];
    const cola = urgentes > 0 ? `, ${urgentes} urgente${urgentes === 1 ? "" : "s"}.` : ".";

    const titulo = momento === "manana"
      ? (nombre ? `Buenos días ${nombre}` : "Buenos días")
      : (nombre ? `${nombre}, te falta cerrar el día` : "Te falta cerrar el día");

    const texto = momento === "manana"
      ? `Hoy tienes ${suyos.length} pendiente${suyos.length === 1 ? "" : "s"}${cola}`
      : `Te quedan ${suyos.length} sin hacer${cola}`;

    const sus = (aparatos ?? []).filter((a: Aparato) => a.usuario_id === persona.id) as Aparato[];
    if (sus.length === 0) { saltados++; continue; }

    for (const ap of sus) {
      const r = await mandar(admin, ap, {
        titulo,
        cuerpo: texto,
        url: "/",
        // Con urgentes, el celular vibra distinto. El patrón lo decide el ayudante (sw.js);
        // acá solo se dice SI hay algo urgente, que es lo que el servidor sabe y él no.
        urgente: urgentes > 0,
        // Mismo `tag` en los dos: el de la tarde REEMPLAZA al de la mañana, y el de mañana al de
        // hoy. Nunca se apilan tres resúmenes viejos en la barra de avisos; el que está siempre
        // es el más reciente, que es el único que sirve.
        tag: "resumen",
      });
      r.ok ? enviados++ : fallidos++;
    }
  }

  return json({ ok: true, momento, enviados, saltados, fallidos });
}

// ── El envío en sí ──────────────────────────────────────────────────────────
async function mandar(
  admin: ReturnType<typeof createClient>,
  ap: Aparato,
  carga: { titulo: string; cuerpo: string; url: string; tag: string; urgente?: boolean },
): Promise<{ ok: boolean; detalle?: string }> {
  try {
    await webpush.sendNotification(
      { endpoint: ap.endpoint, keys: { p256dh: ap.p256dh, auth: ap.auth } },
      JSON.stringify(carga),
    );
    await admin.from("push_dispositivos").update({ ultimo_ok: new Date().toISOString(), fallos: 0 }).eq("id", ap.id);
    return { ok: true };
  } catch (e) {
    const codigo = (e as { statusCode?: number }).statusCode;
    // 404 y 410 = ese aparato ya no existe (desinstalaron la app, borraron los datos del
    // navegador). Se borra la fila: guardar direcciones muertas hace que el resumen se demore
    // más cada día esperando respuestas que nunca van a llegar.
    if (codigo === 404 || codigo === 410) {
      await admin.from("push_dispositivos").delete().eq("id", ap.id);
      return { ok: false, detalle: "ese aparato ya no existe (se quitó de la lista)" };
    }
    await admin.from("push_dispositivos").update({ fallos: (ap as unknown as { fallos: number }).fallos + 1 }).eq("id", ap.id);
    return { ok: false, detalle: (e as Error).message ?? String(e) };
  }
}

function json(v: unknown, status = 200) {
  return new Response(JSON.stringify(v), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
