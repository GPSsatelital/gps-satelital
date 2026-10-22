---
name: avisos-al-celular-push
description: "Fase 5 (10-sep-2026): notificaciones push al celular. La app NO tenía service worker — se agregó uno solo-avisos, sin caché, para no romper la autoactualización. Tabla push_dispositivos (una fila por APARATO), Edge Function avisar (prueba + resumen de la mañana), llave pública quemada en el código a propósito y privada en secretos. Falta el cron y probar en un celular real."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-11T05:29:19.933Z
---

# Avisos al celular (push) — 10-sep-2026 · `fd21d99`

El dueño eligió **notificación al teléfono** entre las tres opciones (WhatsApp / push / correo).
**Todo el equipo usa Android**, así que no aplica la trampa de iPhone (allá solo llegan si la app
está agregada a la pantalla de inicio).

## Lo que faltaba y por qué

Los pendientes ya viven en el servidor (migs 142-145): por fin hay **qué** avisar. Faltaba el
**por dónde**. Y la app **no tenía service worker** — sin él no hay notificación, punto.

🔴 **El service worker es SOLO de avisos: no tiene manejador de `fetch`, no cachea nada.** Un SW
que guarda copias es la forma más típica de dejar a la gente pegada en una versión vieja, y este
proyecto ya tiene resuelta la autoactualización (`AvisoActualizacion` + `vite:preloadError`).
Si algún día se quiere que funcione sin internet, eso es otra decisión aparte.

## Las piezas

- `public/sw.js` — despierta con el aviso. `tag` para que el resumen de hoy **reemplace** al de
  ayer en vez de apilarse; al tocarlo trae al frente la pestaña abierta en vez de abrir otra.
- `usePush.ts` + `AvisosCelular.tsx` — franja **arriba de Mi Día** (la pantalla que todos abren;
  Configuración no la ve todo el mundo). Cuatro estados: apagado · prendido (con "Probar" y
  "Apagar") · **bloqueado** (con el paso a paso para desbloquear en los ajustes) · no soportado.
  Desaparece sola cuando ya están prendidos.
- **Mig 146** `push_dispositivos` — una fila por **APARATO**, no por persona: la llave única es el
  `endpoint`. RLS: cada quien solo ve/borra los suyos (ni el admin necesita ver los ajenos — es la
  configuración del teléfono de cada uno).
- **Edge Function `avisar`** (desplegada) — dos modos: `{prueba, endpoint}` y `{resumen:true}`
  (protegido con el header `x-cron-llave`, porque el cron no es una persona y no tiene sesión).
  🔴 **A quien no tiene nada NO se le manda nada** — un aviso que dice "no tienes pendientes"
  enseña a ignorar los avisos. Los aparatos muertos (404/410) se borran solos.

## Las llaves

- **Pública quemada en el código** (`usePush.ts` y la función). Es pública por diseño: viaja en el
  paquete de la app. Se hizo así y no con variable de entorno para no tener que acordarse de
  copiarla a Vercel — el clásico "funciona local y en producción no".
- **Privada (`VAPID_PRIVADA`) y `CRON_LLAVE`**: en los secretos de Supabase. Generadas localmente,
  puestas con `supabase secrets set --env-file`, y el archivo temporal **borrado**. Nunca pasaron
  por el chat ni por el repo. La `CRON_LLAVE` quedó en `%TEMP%\mg-cron-llave.txt` para armar el
  cron; ese archivo hay que borrarlo después.

## 🔲 Lo que falta — POR AQUÍ SE RETOMA

1. **Correr la mig 146** (`146_avisos_al_celular.sql`). El SQL ya se le pasó en el chat.
2. **Probar en un celular Android real**: Más → Mi Día → franja azul "Activar" → permitir →
   "Probar" → debe sonar. En el navegador de Claude **no se puede**: ahí
   `Notification.permission` está en `denied` de fábrica y la franja muestra (correctamente) el
   estado "bloqueado". Eso sí quedó verificado; lo demás necesita teléfono.
3. **El despertador (paso 3), SIN construir.** La pregunta quedó abierta: *¿a qué hora llega el
   resumen?* (se le ofreció 6am / 7am / 8am / dos veces al día y pidió cerrar la sesión antes de
   responder). Cuando conteste:
   - `pg_cron` + `pg_net` en Supabase llamando a la función `avisar` con `{"resumen": true}` y el
     header `x-cron-llave`.
   - 🔴 **El cron corre en UTC.** Colombia es UTC−5: las 7am son `0 12 * * *`.
   - La `CRON_LLAVE` está en **`%TEMP%\mg-cron-llave.txt`** (no en el repo, no en el chat). Hay
     que pasarle el SQL con un hueco tipo `PEGA_AQUI_LA_LLAVE` y decirle que la copie de ese
     archivo — así el secreto no pasa por el chat. **Borrar ese archivo después.**
     Si el temporal ya se limpió, se genera una llave nueva y se vuelve a poner con
     `supabase secrets set`.
4. **Paso 4 (opcional, ni diseñado):** avisos al instante para lo urgente — por ejemplo a la
   secretaria cuando entra una transferencia por confirmar.

**Why:** sin push, un pendiente que nadie mira no se entera nadie; era el último eslabón del motor
de pendientes. **How to apply:** ver [[flujo-diario-de-cada-persona]] fase 5.
