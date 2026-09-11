-- 147 — EL DESPERTADOR: los dos resúmenes del día al celular
--
-- Fase 5, paso 3 de docs/FLUJO-DIARIO.md. Decisión del dueño (10-sep-2026): **dos veces al día**.
--   · 7:00 a.m. — la lista completa del día.
--   · 2:00 p.m. — SOLO lo que sigue sin hacerse.
--
-- La cuenta es la misma en los dos momentos (siempre se descuenta lo ya marcado como atendido);
-- a las 7 eso está vacío y a las 2 ya no. Lo único distinto es cómo se dice, porque el mismo
-- mensaje dos veces al día se vuelve ruido.
--
-- 🔴 EL RELOJ DE POSTGRES ANDA EN UTC. Colombia es UTC−5, así que las horas van corridas 5:
--     7:00 a.m. Colombia = 12:00 UTC  →  '0 12 * * *'
--     2:00 p.m. Colombia = 19:00 UTC  →  '0 19 * * *'
--   Si algún día se quiere cambiar la hora, se cambia ESE número, no el de Colombia. Poner la
--   hora local acá es el error clásico: los avisos saldrían a las 2 de la mañana.
--
-- 🔴 LAS DOS LLAVES QUE VAN ACÁ NO SON LA MISMA COSA:
--   · La `apikey` de abajo es la llave PÚBLICA del proyecto (rol `anon`). Es la misma que viaja
--     en el paquete de la app y que cualquiera puede leer abriendo el navegador. Va quemada a
--     propósito. **NUNCA poner acá la llave `service_role`**: esa sí es secreta y quedaría
--     guardada en una tabla de la base.
--   · `x-cron-llave` es el secreto de verdad: es lo que separa al despertador de cualquier
--     desconocido que le pegue a la función. Se pega abajo donde dice PEGA_AQUI_LA_LLAVE.

-- ── 1) Las dos piezas que Postgres necesita ─────────────────────────────────────────────────
-- pg_cron = el reloj. pg_net = poder llamar a una dirección de internet desde la base.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ── 2) Los dos despertadores ────────────────────────────────────────────────────────────────
-- Se borran primero por si ya existían: correr esto dos veces no debe dejar cuatro alarmas
-- sonando (y mandándole a la gente el aviso repetido).
select cron.unschedule('avisos-manana') where exists (select 1 from cron.job where jobname = 'avisos-manana');
select cron.unschedule('avisos-tarde')  where exists (select 1 from cron.job where jobname = 'avisos-tarde');

select cron.schedule('avisos-manana', '0 12 * * *', $$
  select net.http_post(
    url     := 'https://jvfkprkjysjffhzjitgl.supabase.co/functions/v1/avisar',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'apikey',        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZmtwcmtqeXNqZmZoemppdGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzgyNzEsImV4cCI6MjA5NzIxNDI3MX0.8HUTOc4ZEcyCgatuuRn58oycwruWA6DjadCQu0qlQ00',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZmtwcmtqeXNqZmZoemppdGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzgyNzEsImV4cCI6MjA5NzIxNDI3MX0.8HUTOc4ZEcyCgatuuRn58oycwruWA6DjadCQu0qlQ00',
      'x-cron-llave',  'PEGA_AQUI_LA_LLAVE'
    ),
    body    := jsonb_build_object('resumen', true, 'momento', 'manana')
  );
$$);

select cron.schedule('avisos-tarde', '0 19 * * *', $$
  select net.http_post(
    url     := 'https://jvfkprkjysjffhzjitgl.supabase.co/functions/v1/avisar',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'apikey',        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZmtwcmtqeXNqZmZoemppdGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzgyNzEsImV4cCI6MjA5NzIxNDI3MX0.8HUTOc4ZEcyCgatuuRn58oycwruWA6DjadCQu0qlQ00',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZmtwcmtqeXNqZmZoemppdGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzgyNzEsImV4cCI6MjA5NzIxNDI3MX0.8HUTOc4ZEcyCgatuuRn58oycwruWA6DjadCQu0qlQ00',
      'x-cron-llave',  'PEGA_AQUI_LA_LLAVE'
    ),
    body    := jsonb_build_object('resumen', true, 'momento', 'tarde')
  );
$$);

-- ═══ VERIFICACIÓN ═══
-- a) Deben quedar exactamente DOS alarmas, activas.
select jobname, schedule, active from cron.job where jobname like 'avisos-%' order by jobname;

-- b) Las últimas veces que sonaron (al principio va a estar vacío: todavía no ha dado la hora).
select jobname, status, return_message, start_time
  from cron.job_run_details d
  join cron.job j using (jobid)
 where j.jobname like 'avisos-%'
 order by start_time desc limit 10;

-- ── PARA PROBARLO YA, SIN ESPERAR A LAS 7 ───────────────────────────────────────────────────
-- Pega la llave igual que arriba y corre SOLO este bloque. Debe llegarte el aviso al celular
-- (si ya activaste los avisos ahí y tienes pendientes). Si no tienes ninguno, no llega nada —
-- eso también es correcto.
--
-- select net.http_post(
--   url     := 'https://jvfkprkjysjffhzjitgl.supabase.co/functions/v1/avisar',
--   headers := jsonb_build_object(
--     'Content-Type',  'application/json',
--     'apikey',        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZmtwcmtqeXNqZmZoemppdGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzgyNzEsImV4cCI6MjA5NzIxNDI3MX0.8HUTOc4ZEcyCgatuuRn58oycwruWA6DjadCQu0qlQ00',
--     'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZmtwcmtqeXNqZmZoemppdGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzgyNzEsImV4cCI6MjA5NzIxNDI3MX0.8HUTOc4ZEcyCgatuuRn58oycwruWA6DjadCQu0qlQ00',
--     'x-cron-llave',  'PEGA_AQUI_LA_LLAVE'
--   ),
--   body    := jsonb_build_object('resumen', true, 'momento', 'manana')
-- );
--
-- ── SI SE QUIERE CAMBIAR ────────────────────────────────────────────────────────────────────
-- Otra hora: cambiar el número de la hora en UTC (recordar: hora de Colombia + 5).
-- Solo lunes a sábado: '0 12 * * 1-6'  (el 0 es domingo).
-- Apagar uno sin borrarlo: select cron.unschedule('avisos-tarde');
