---
name: estado-usuarios-seguridad-julio2026
description: "Gestión de usuarios exclusiva de ADMIN_PRINCIPAL, correo real editable, y 2 huecos de seguridad reales cerrados en la tabla profiles — sesión 5 jul 2026"
metadata:
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

Trabajo del 5 jul 2026, commit `63c7aa8` en `main`.

## Pedido del usuario
Confirmar usuarios reales, darle a cada quien su correo real, poder crear contraseñas, y que **solo ADMIN_PRINCIPAL** (FREDY) tenga control total sobre las demás cuentas — ADMIN (SERGIO) pierde acceso al módulo Usuarios.

## Lo construido
- **`manage-users` (Edge Function)**: restringida a `ADMIN_PRINCIPAL` únicamente (antes aceptaba también `ADMIN`).
- **Nueva acción `list`**: como `profiles` no guarda el correo (vive en `auth.users`), esta acción usa `adminClient.auth.admin.listUsers()` y lo cruza con los perfiles — antes el frontend no tenía forma de mostrar/editar el correo de nadie.
- **Acción `update` ampliada**: ahora también cambia el correo (`adminClient.auth.admin.updateUserById(id, {email})`).
- **`create-user` (Edge Function) eliminada** — código muerto, nadie la llamaba desde el frontend, y seguía con la restricción vieja (permitía ADMIN).
- **`App.tsx`**: `puedeVer("usuarios")` ahora exige `ADMIN_PRINCIPAL` de forma dura, sin importar los "accesos a medida" (`profile.permisos`) — nadie puede ser autorizado a ese módulo por otra vía.
- **`UsuariosView.tsx`**: campo "Correo electrónico" visible y editable en el modal de editar usuario.

## 2 huecos de seguridad reales encontrados y cerrados (no pedidos explícitamente, encontrados al auditar)
El trigger `enforce_profile_role_change()` (de la migración `004_roles_seguridad.sql`, de cuando solo existían los roles ADMIN/SECRETARIA) nunca se actualizó cuando se creó el rol `ADMIN_PRINCIPAL`:
1. Solo exigía `current_role() = 'ADMIN'` — un ADMIN (SERGIO) podía subirse su propio rol a `ADMIN_PRINCIPAL` haciendo un `update` directo contra Supabase desde la consola del navegador, sin pasar por la Edge Function ni por la UI.
2. Solo protegía la columna `role` — nunca protegió `permisos`. Cualquier usuario autenticado (hasta MECANICO) podía auto-otorgarse acceso a cualquier módulo del sistema editando su propia fila de `profiles` directo.

**Migración 031** (`031_profiles_admin_principal_guard.sql`) corrige ambos: ahora `role`, `permisos` y `grupo` solo los puede cambiar quien ya es `ADMIN_PRINCIPAL`, verificado a nivel de base de datos (no solo en la app).

**Lección para el futuro:** cuando se agrega un rol nuevo a la jerarquía (como pasó con ADMIN_PRINCIPAL), hay que auditar TODOS los triggers y políticas RLS que comparan contra el rol viejo — no alcanza con actualizar el frontend. Ver [[regla-jsx-funciones-anidadas]] para otro patrón de "se actualizó una parte del sistema y se olvidó otra".

## Despliegue (usuario confirmó haberlo hecho, sin verificar resultado aún)
1. ✅ Redesplegado `manage-users` pegando el código nuevo en el Dashboard de Supabase (Edge Functions → Code → pegar → Deploy).
2. ✅ Corrida la migración SQL de la función `enforce_profile_role_change()` en el SQL Editor.
3. ⚠️ Sin confirmar: si `create-user` seguía apareciendo desplegada en el Dashboard y si se borró.

## Pendiente al iniciar la próxima sesión
Correr el checklist de verificación (6 puntos, están en CLAUDE.md sección "PARA RETOMAR"):
1. SERGIO ya no ve "Usuarios" en el menú.
2. FREDY sigue viéndolo.
3. Al editar un usuario, el correo aparece pre-cargado (confirma que `list` funciona).
4. Cambiar correo y guardar no da error.
5. Resetear contraseña sigue funcionando.
6. Sin errores nuevos en los Logs de la función en Supabase.
