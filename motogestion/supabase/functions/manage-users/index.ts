// Edge Function: manage-users
// Acciones de administración de cuentas, todas reservadas a ADMIN / ADMIN_PRINCIPAL:
//   - create:         crea la cuenta (auth + perfil) con rol, grupo y accesos
//   - update:         cambia nombre, rol, grupo y accesos de un usuario existente
//   - reset_password: asigna una contraseña temporal nueva
// Usa la "service role key", que solo vive en el servidor (nunca llega al navegador).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ROLES_VALIDOS = ["ADMIN_PRINCIPAL", "ADMIN", "SUBADMIN", "SECRETARIA", "MECANICO", "SOCIO"];
const GRUPOS_VALIDOS = ["COSTA", "PRADERA", "RASTREADOR", "USADAS"];

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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData.user) return json({ error: "No autorizado" }, 401);

    const { data: caller } = await callerClient.from("profiles").select("role").eq("id", userData.user.id).single();
    if (!caller || (caller.role !== "ADMIN" && caller.role !== "ADMIN_PRINCIPAL")) {
      return json({ error: "Solo un administrador puede gestionar usuarios" }, 403);
    }

    const body = await req.json();
    const action = body.action ?? "create";
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Normaliza la lista de accesos a un arreglo de strings (o null)
    const permisos = Array.isArray(body.permisos) ? body.permisos.filter((x: unknown) => typeof x === "string") : null;

    // ── RESET PASSWORD ─────────────────────────────────────────────────────
    if (action === "reset_password") {
      const id = body.id;
      const password = body.password ?? "";
      if (!id) return json({ error: "Falta el usuario" }, 400);
      if (password.length < 6) return json({ error: "La contraseña debe tener al menos 6 caracteres" }, 400);
      const { error } = await adminClient.auth.admin.updateUserById(id, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    // ── UPDATE ─────────────────────────────────────────────────────────────
    if (action === "update") {
      const id = body.id;
      const nombre = (body.nombre ?? "").trim();
      const role = body.role;
      const grupo = (body.grupo ?? "").trim();
      if (!id) return json({ error: "Falta el usuario" }, 400);
      if (!nombre || !role) return json({ error: "Faltan datos" }, 400);
      if (!ROLES_VALIDOS.includes(role)) return json({ error: "Rol inválido" }, 400);
      if (role === "SOCIO" && !GRUPOS_VALIDOS.includes(grupo)) return json({ error: "Un socio debe tener un grupo asignado" }, 400);

      const { error } = await adminClient.from("profiles").update({
        nombre,
        role,
        grupo: role === "SOCIO" ? grupo : null,
        permisos,
      }).eq("id", id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    // ── CREATE ─────────────────────────────────────────────────────────────
    const nombre = (body.nombre ?? "").trim();
    const email = (body.email ?? "").trim();
    const password = body.password ?? "";
    const role = body.role;
    const grupo = (body.grupo ?? "").trim();

    if (!nombre || !email || !password || !role) return json({ error: "Faltan datos" }, 400);
    if (!ROLES_VALIDOS.includes(role)) return json({ error: "Rol inválido" }, 400);
    if (role === "SOCIO" && !GRUPOS_VALIDOS.includes(grupo)) return json({ error: "Un socio debe tener un grupo asignado" }, 400);
    if (password.length < 6) return json({ error: "La contraseña debe tener al menos 6 caracteres" }, 400);

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: role === "SOCIO" ? { nombre, role, grupo } : { nombre, role },
    });
    if (createError) return json({ error: createError.message }, 400);

    // Asegura el perfil con accesos (el trigger pudo crearlo ya; upsert lo completa)
    const id = created.user?.id;
    if (id) {
      await adminClient.from("profiles").upsert({
        id,
        nombre,
        role,
        grupo: role === "SOCIO" ? grupo : null,
        permisos,
      });
    }

    return json({ ok: true, id });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
