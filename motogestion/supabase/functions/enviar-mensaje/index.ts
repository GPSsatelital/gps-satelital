// Edge Function: enviar-mensaje
// La única puerta de MotoGestión hacia ZALA (canal oficial de WhatsApp por Meta). Existe por dos
// razones: la llave de ZALA no puede vivir en el navegador (la vería cualquiera abriendo las
// herramientas del navegador y podría mandar mensajes a nombre de la empresa), y el permiso
// `enviar_mensaje` se verifica AQUÍ con `puede_accion()` en la base — no solo escondiendo el botón.
//
// Contrato con ZALA (docs/PLANTILLAS-WHATSAPP.md y su CONTRATO-CON-MOTOGESTION.md, §6.1):
//   POST {ZALA_URL}/api/enviar   cabecera X-Llave
//   cuerpo: { contrato_id, telefono, plantilla, variables, texto, quien_pide }
//     - `plantilla` + `variables`: la plantilla aprobada por Meta y sus {{1}}…{{n}} en orden.
//     - `texto`: el mismo mensaje ya armado, para que ZALA lo mande como texto si la ventana de
//       24 h está abierta (sin gastar plantilla). Si no hay `plantilla` y la ventana está cerrada,
//       ZALA responde rechazado con el motivo.
//   respuesta: { id, estado: "en_cola" | "enviado" | "rechazado", motivo }
//
// Secretos (Supabase → Edge Functions → Secrets): ZALA_URL, ZALA_LLAVE. Sin ellos responde 503 y la
// app sigue con el respaldo (abre WhatsApp). Nunca pegar la llave en el código ni en el repo.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No autorizado" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });

    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData.user) return json({ error: "No autorizado" }, 401);

    // El permiso se decide en la base con la misma función que usa todo el sistema (mig 048):
    // rol como techo + excepción por persona + bypass del administrador principal.
    const { data: permitido, error: errPermiso } = await callerClient.rpc("puede_accion", { p_accion: "enviar_mensaje" });
    if (errPermiso) return json({ error: "No se pudo verificar el permiso: " + errPermiso.message }, 500);
    if (!permitido) return json({ error: "No tienes permiso para enviar mensajes por el canal oficial. Pídeselo al administrador principal." }, 403);

    const zalaUrl = Deno.env.get("ZALA_URL");
    const zalaLlave = Deno.env.get("ZALA_LLAVE");
    if (!zalaUrl || !zalaLlave) {
      return json({ error: "ZALA no está conectada todavía (faltan ZALA_URL y ZALA_LLAVE en los secretos de la función)." }, 503);
    }

    const body = await req.json();
    const telefono = String(body.telefono ?? "").replace(/\D/g, "");
    const plantilla = body.plantilla ? String(body.plantilla) : null;
    const texto = body.texto ? String(body.texto) : null;
    const variables = Array.isArray(body.variables) ? body.variables.map((v: unknown) => String(v ?? "")) : [];
    if (!telefono || telefono.length < 11) return json({ error: "Número de WhatsApp inválido" }, 400);
    if (!plantilla && !texto) return json({ error: "Falta la plantilla o el texto" }, 400);
    if (plantilla && variables.some((v: string) => v.trim() === "")) return json({ error: "Meta no acepta variables vacías" }, 400);

    const r = await fetch(`${zalaUrl.replace(/\/$/, "")}/api/enviar`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Llave": zalaLlave },
      body: JSON.stringify({
        contrato_id: body.contrato_id ?? null,
        telefono,
        plantilla,
        variables,
        texto,
        clave: body.clave ?? null,
        quien_pide: userData.user.email ?? userData.user.id,
      }),
    });
    const out = await r.json().catch(() => ({})) as { id?: string; estado?: string; motivo?: string; error?: string };
    if (!r.ok) return json({ error: out.error ?? out.motivo ?? `ZALA respondió ${r.status}` }, 502);

    return json({ ok: true, id: out.id ?? null, estado: out.estado ?? "en_cola", motivo: out.motivo ?? null });
  } catch (err) {
    return json({ error: (err as Error).message ?? "Error inesperado" }, 500);
  }
});
