-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 168 — QUE "¿ESTA MIGRACIÓN SE CORRIÓ?" DEJE DE SER MEMORIA (24-sep-2026)
--
-- EL PROBLEMA. Hasta hoy, saber si una migración se aplicó dependía de que alguien lo recordara y
-- lo anotara. Y fallaba: `CLAUDE.md` decía que la **026 estaba pendiente de aplicar** cuando ya
-- llevaba meses corrida, y que íbamos por la 029 cuando vamos por la 167. Toda sesión nueva leía
-- eso y arrancaba creyendo un estado falso. La regla escrita ("toda migración al repo Y a
-- Supabase") existía desde julio y aun así se desincronizó.
--
-- LA SOLUCIÓN. Una tabla donde **cada migración se anota a sí misma** al final. Deja de ser un
-- recuerdo y pasa a ser una consulta:
--     select * from public.migraciones_aplicadas order by numero;
--
-- 🔑 DE ACÁ EN ADELANTE, TODA MIGRACIÓN TERMINA CON ESTA LÍNEA (antes del commit):
--     select public.registrar_migracion(169, '169_lo_que_sea.sql', 'una línea de qué hizo');
--
-- ⚠️ LAS ANTERIORES A LA 168 NO QUEDAN REGISTRADAS. No se inventan: registrar la 026 como
-- "aplicada el 24-sep" sería mentir sobre la fecha, y este archivo existe justamente para dejar de
-- mentir. Lo que se sabe de ellas vive en el repo (`motogestion/supabase/`) y en `docs/HISTORIAL.md`.
-- Si algún día hace falta, se verifica una por una mirando si sus objetos existen — no de memoria.
--
-- ── CÓMO DESHACER ESTA MIGRACIÓN (regla nueva del 23-sep: ninguna puerta de un solo sentido) ──
--     drop function if exists public.registrar_migracion(int, text, text);
--     drop table if exists public.migraciones_aplicadas;
--   No tiene efectos sobre ningún dato del negocio: solo se pierde el registro de qué se aplicó.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

create table if not exists public.migraciones_aplicadas (
  numero      int primary key,
  archivo     text not null,
  que_hizo    text,
  aplicada_en timestamptz not null default now(),
  aplicada_por text default coalesce(current_setting('request.jwt.claims', true)::json ->> 'email', current_user)
);

comment on table public.migraciones_aplicadas is
  'Qué migración se corrió y cuándo. Cada migración se anota a sí misma al final. Las anteriores a la 168 NO están: se sabían de memoria, que es justamente el problema que esto resuelve.';

-- Solo ADMIN_PRINCIPAL la lee desde la app; el SQL Editor entra como superusuario y no pasa por RLS.
alter table public.migraciones_aplicadas enable row level security;
drop policy if exists migraciones_lee_el_jefe on public.migraciones_aplicadas;
create policy migraciones_lee_el_jefe on public.migraciones_aplicadas
  for select to authenticated using (public.mi_rol() = 'ADMIN_PRINCIPAL');

-- La función que cada migración llama al final. `on conflict` para que correr dos veces la misma
-- migración no reviente: se queda con la primera fecha, que es la verdadera.
create or replace function public.registrar_migracion(p_numero int, p_archivo text, p_que_hizo text default null)
returns void language sql security definer set search_path = public as $$
  insert into public.migraciones_aplicadas (numero, archivo, que_hizo)
  values (p_numero, p_archivo, p_que_hizo)
  on conflict (numero) do nothing;
$$;

comment on function public.registrar_migracion(int, text, text) is
  'Se llama al final de CADA migración. Ver 168_registro_de_migraciones.sql.';

-- Esta migración se anota a sí misma: es la primera de la serie.
select public.registrar_migracion(168, '168_registro_de_migraciones.sql',
  'Crea el registro de migraciones aplicadas, para que dejen de saberse de memoria');

commit;

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
select numero, archivo, que_hizo, aplicada_en
  from public.migraciones_aplicadas
 order by numero;
-- Esperado: una fila, la 168.
