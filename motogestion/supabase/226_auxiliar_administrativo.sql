-- ===== 226: el auxiliar administrativo (D-095) y el candado de los permisos =====
-- Pedido del dueño (23 y 24-nov-2026): un tipo de usuario nuevo, «auxiliar administrativo», que en
-- esta primera fase SOLO MIRA tres listas (motos, contratos, taller), sin plata, sin totales y sin
-- botones, y hace las visitas que le asignen. Todo lo demás se le habilita después, moto por moto,
-- cuando un supervisor se lo pida (fases 2 y 3).
--
-- Por qué un rol nuevo y no un SUBADMIN recortado: lo que se le quita a un SUBADMIN en
-- `profiles.permisos` solo se le quita en la PANTALLA. La base le seguiría dejando leer como
-- SUBADMIN (por eso mismo nació el VISITADOR, mig 076).
--
-- Cómo se cierra: con políticas RESTRICTIVAS. Las políticas normales (permisivas) se suman con «o»;
-- las restrictivas se exigen con «y» encima de todas. Una restrictiva `auxiliar_fuera` en cada tabla
-- dice «si eres AUXILIAR, aquí no». Así no hay que tocar ni una sola de las políticas que ya existen,
-- y si mañana alguien escribe una política nueva del estilo «todos menos el VISITADOR», el auxiliar
-- igual queda afuera. Para todos los demás roles la condición da verdadero y no cambia nada (la
-- migración lo comprueba contando, rol por rol, lo que cada uno ve antes y después).
--
-- De paso, aprobado por el dueño el 24-nov: el candado del perfil (`enforce_profile_role_change`)
-- vigilaba el rol, los módulos y el grupo, pero NO los permisos de acción (`profiles.acciones`). Y
-- cada usuario puede editar su propio perfil. O sea: cualquiera, desde las herramientas del
-- navegador, podía marcarse «registrar efectivo» o «eliminar pagos», y `puede_accion()` le creía.
-- Medido en la base viva el 24-nov (has_column_privilege = true). Desde ahora solo el administrador
-- principal cambia permisos, igual que el rol.
--
-- Lo que hace:
--   1. La regla de roles acepta 'AUXILIAR'.
--   2. puede_accion(): el AUXILIAR no tiene NINGUNA acción, aunque alguien se la marque en Usuarios.
--   3. El candado del perfil también vigila `acciones`.
--   4. `auxiliar_fuera` en cada tabla de public. Excepciones: su propio perfil, las visitas que le
--      asignaron (verlas y registrarlas) y `grupos` (solo leer: código y color, para pintar la placa).
--   5. Visitas: dos políticas nuevas para él, copia de las del VISITADOR. Las de hoy no se tocan.
--   6. Archivos: solo sube fotos a visitas/ y guardados/ (lo mismo que el VISITADOR), y solo abre y
--      cambia las que él mismo subió ahí: la pantalla sube con «subir o reemplazar» (upsert), y
--      eso exige permiso de abrir y de cambiar además del de subir (documentación de Supabase,
--      Storage → Access control). No borra ninguno.
--   7. nombres_subadmins() lo incluye: hoy Johan es SUBADMIN y sale en esas listas (asignar visita,
--      referido del equipo, encargado de la moto); al cambiarlo de rol sigue saliendo igual.
--   8. Sus tres listas, por funciones que devuelven SOLO las columnas aprobadas en el dibujo del 24-nov:
--      aux_motos(), aux_contratos(), aux_taller(). Las pueden leer el auxiliar y la administración.
--   9. Dónde duerme la moto, en las visitas del auxiliar (D-095 punto 5, ratificado por el dueño el
--      24-nov: «no puede hacerlo él mismo, siempre debe tener la ayuda de alguien que tenga acceso a
--      verificar el GPS de esa moto»): la confirma el SUPERVISOR DE ESA MOTO, desde su módulo
--      «📍 Confirmar ubicación» y aparte de sus propias visitas; si la moto no tiene supervisor, la
--      administración. El auxiliar no puede marcar ✓/✗. Si sale ✗, el auxiliar va y documenta el
--      sitio real (eso ya lo permite la mig 077). La visita se le paga al auxiliar en la semana en que
--      quede confirmada: la nómina ya lo hace así (mig 225), no se toca. Se cambian dos funciones de
--      la 225 (la lista del módulo y el botón ✓/✗); la lista vieja del supervisor (5 por día) y el
--      disparador que fija la semana de pago no se tocan.
--
-- Lo que NO hace: no cambia el rol de nadie (eso lo hace el dueño en Usuarios), no toca ninguna
-- política que ya exista, no toca pantallas.

begin;

-- ── 0) GUARDA: si la base no es la que este archivo cree, aborta sin tocar nada ─────────────────
do $guarda$
declare v text;
begin
  if exists (select 1 from public.migraciones_aplicadas where numero = 226) then
    raise exception 'ABORTA: la 226 ya está corrida (migraciones_aplicadas). No se cambió nada.';
  end if;

  select pg_get_constraintdef(oid) into v from pg_constraint
   where conrelid = 'public.profiles'::regclass and conname = 'profiles_role_check';
  if v is null then raise exception 'ABORTA: no existe profiles_role_check.'; end if;
  if v like '%AUXILIAR%' then raise exception 'ABORTA: profiles_role_check ya tiene AUXILIAR: %', v; end if;
  if v not like '%VISITADOR%' or v not like '%ANALISTA%' then
    raise exception 'ABORTA: profiles_role_check no es la esperada: %', v;
  end if;

  v := pg_get_functiondef('public.enforce_profile_role_change()'::regprocedure);
  if v like '%acciones%' then raise exception 'ABORTA: el candado del perfil ya menciona acciones. Mirarlo a mano: %', v; end if;
  if v not like '%new.grupo is distinct from old.grupo%'
     or v not like '%Solo el administrador principal puede cambiar roles o accesos%' then
    raise exception 'ABORTA: el candado del perfil no es el esperado: %', v;
  end if;
  if not exists (select 1 from pg_trigger
                  where tgrelid = 'public.profiles'::regclass and tgname = 'trg_profiles_role_guard'
                    and tgfoid = 'public.enforce_profile_role_change()'::regprocedure) then
    raise exception 'ABORTA: el disparador trg_profiles_role_guard no llama al candado del perfil.';
  end if;

  v := pg_get_functiondef('public.puede_accion(text)'::regprocedure);
  if v like '%AUXILIAR%' then raise exception 'ABORTA: puede_accion ya menciona AUXILIAR: %', v; end if;
  if v not like '%if v_role = ''ADMIN_PRINCIPAL'' then return true; end if;%'
     or v not like '%if v_ov = ''permitir'' then return true; end if;%'
     or v not like '%return p_accion = any(public._acciones_default(v_role));%' then
    raise exception 'ABORTA: puede_accion no es la esperada: %', v;
  end if;

  v := pg_get_functiondef('public.nombres_subadmins()'::regprocedure);
  if v not like '%p.role in (''SUBADMIN'', ''VISITADOR'')%' then
    raise exception 'ABORTA: nombres_subadmins no es la esperada: %', v;
  end if;

  if not exists (select 1 from pg_proc where oid = 'public.mis_clientes_visitador()'::regprocedure) then
    raise exception 'ABORTA: no existe mis_clientes_visitador().';
  end if;

  -- Una vista que no respete los candados dejaría leer por la puerta de atrás.
  select string_agg(c.relname, ', ') into v
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind in ('v', 'm')
     and (c.relkind = 'm' or coalesce(c.reloptions::text, '') not like '%security_invoker=true%');
  if v is not null then raise exception 'ABORTA: estas vistas se saltan los candados: %', v; end if;

  -- Sus fotos se reconocen por quién las subió (owner_id). Si la columna no está o los archivos
  -- recientes no la traen llena, la regla de archivos de abajo no serviría.
  if not exists (select 1 from information_schema.columns
                  where table_schema = 'storage' and table_name = 'objects' and column_name = 'owner_id') then
    raise exception 'ABORTA: storage.objects no tiene owner_id.';
  end if;
  if exists (select 1 from storage.objects where created_at > now() - interval '30 days')
     and not exists (select 1 from storage.objects where created_at > now() - interval '30 days' and owner_id is not null) then
    raise exception 'ABORTA: los archivos de los últimos 30 días no dicen quién los subió (owner_id vacío).';
  end if;

  -- Tablas sin candado: la restrictiva no les haría nada.
  select string_agg(c.relname, ', ') into v
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
  if v is not null then raise exception 'ABORTA: estas tablas no tienen RLS: %', v; end if;

  -- Punto 9: las dos funciones de la 225 que se cambian tienen que estar tal cual las dejó la 225
  -- (se compara el texto entero, sin contar espacios). Si alguien las tocó a mano después, se para:
  -- hay que pegar su pg_get_functiondef y rehacer esta parte sobre lo que hay de verdad.
  select prosrc into v from pg_proc where oid = 'public.confirmaciones_ubicacion()'::regprocedure;
  if btrim(regexp_replace(v, '\s+', ' ', 'g')) is distinct from btrim(regexp_replace($cu$
  select
    c.id, cl.nombre::text, m.placa::text, m.grupo::text,
    ve.realizada_por, p.nombre::text, ve.visita_fecha, c.fecha_entrega,
    c.ubicacion_moto_resultado, c.ubicacion_moto_validada_fecha, c.ubicacion_confirmada_en,
    c.guardado_lugar,
    v.entrevista->>'guardaMotoAqui', v.entrevista->>'dondeGuardaMoto', v.ubicacion
  from public.contratos c
  cross join lateral public.visita_de_entrega(c.id) ve
  join public.visitas v on v.id = ve.visita_id
  join public.clientes cl on cl.id = c.cliente_id
  left join public.motos m on m.id = c.moto_id
  left join public.profiles p on p.id = ve.realizada_por
  where c.fecha_entrega >= public.desde_confirma_visitador()
    and c.estado <> 'Cancelado'
    and (coalesce(public.mi_rol(), '') in ('ADMIN', 'ADMIN_PRINCIPAL') or ve.realizada_por = auth.uid())
  order by (c.ubicacion_confirmada_en is not null), c.fecha_entrega, m.placa;
$cu$, '\s+', ' ', 'g')) then
    raise exception 'ABORTA: confirmaciones_ubicacion() no es la que dejó la 225. No se cambió nada.';
  end if;
  if exists (select 1 from pg_depend
              where refobjid = 'public.confirmaciones_ubicacion()'::regprocedure and deptype = 'n') then
    raise exception 'ABORTA: algo depende de confirmaciones_ubicacion() y no se puede rehacer. No se cambió nada.';
  end if;

  select prosrc into v from pg_proc where oid = 'public.confirmar_ubicacion_visitador(uuid, text)'::regprocedure;
  if btrim(regexp_replace(v, '\s+', ' ', 'g')) is distinct from btrim(regexp_replace($cv$
declare
  v_quien uuid;
  v_entrega date;
  v_validada boolean;
begin
  if p_resultado is null or p_resultado not in ('coincide', 'no_coincide') then
    raise exception 'Resultado no válido: %', p_resultado;
  end if;

  select fecha_entrega, ubicacion_moto_validada into v_entrega, v_validada
  from public.contratos where id = p_contrato_id
  for update;
  if not found then
    raise exception 'Ese contrato no existe';
  end if;
  if v_entrega is null or v_entrega < public.desde_confirma_visitador() then
    raise exception 'Esta moto la valida su supervisor: se entregó antes del 19-nov';
  end if;

  select realizada_por into v_quien from public.visita_de_entrega(p_contrato_id);
  if v_quien is null or auth.uid() is null or v_quien <> auth.uid() then
    raise exception 'Solo la confirma quien hizo la visita';
  end if;
  if v_validada then
    raise exception 'Ya está confirmada';
  end if;

  update public.contratos
     set ubicacion_moto_validada = true,
         ubicacion_moto_resultado = p_resultado,
         ubicacion_moto_validada_por = auth.uid(),
         ubicacion_moto_validada_fecha = now()
   where id = p_contrato_id;
end $cv$, '\s+', ' ', 'g')) then
    raise exception 'ABORTA: confirmar_ubicacion_visitador() no es la que dejó la 225. No se cambió nada.';
  end if;

  -- La prueba del punto 9 usa estas dos tal como están: que el auxiliar documente el sitio de un
  -- cliente que él visitó, y la regla de qué visita paga cada entrega.
  v := pg_get_functiondef('public.registrar_guardado_visitador(uuid, jsonb)'::regprocedure);
  if v not like '%coalesce(v.realizada_por, v.asignada_a) = auth.uid()%' or v not like '%''por'',%auth.uid()%' then
    raise exception 'ABORTA: registrar_guardado_visitador no es la esperada: %', v;
  end if;
  if not exists (select 1 from pg_proc where oid = 'public.visita_de_entrega(uuid)'::regprocedure) then
    raise exception 'ABORTA: no existe visita_de_entrega().';
  end if;
end
$guarda$;

-- ── 1) LA FOTO DE ANTES: cuántas filas ve cada rol de hoy, tabla por tabla ─────────────────────
-- Se entra como una persona real de cada rol (sin cambiarle nada) y se cuenta. Cada entrada se
-- deshace sola (lanza un aviso propio y lo atrapa), así que la sesión vuelve a ser la del editor.
-- La foto se guarda en un ajuste de la transacción, no en una tabla.
do $antes$
declare r record; t record; v_n bigint; v_rol jsonb; v_foto jsonb := '{}'::jsonb;
begin
  for r in select distinct on (role) id, role from public.profiles where role is not null order by role, created_at loop
    v_rol := '{}'::jsonb;
    begin
      perform set_config('request.jwt.claims', json_build_object('sub', r.id, 'role', 'authenticated')::text, true);
      perform set_config('role', 'authenticated', true);
      for t in select tablename from pg_tables where schemaname = 'public' order by tablename loop
        begin
          execute format('select count(*) from public.%I', t.tablename) into v_n;
        exception when insufficient_privilege then v_n := -1;
        end;
        v_rol := v_rol || jsonb_build_object(t.tablename, v_n);
      end loop;
      select count(*) into v_n from storage.objects;
      v_rol := v_rol || jsonb_build_object('storage.objects', v_n);
      raise exception 'MIG226_FIN';
    exception when others then
      if sqlerrm <> 'MIG226_FIN' then raise; end if;
    end;
    v_foto := v_foto || jsonb_build_object(r.role, v_rol);
  end loop;
  perform set_config('mig226.antes', v_foto::text, true);
end
$antes$;

-- ── 2) EL ROL NUEVO ──────────────────────────────────────────────────────────────────────────
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('ADMIN_PRINCIPAL','ADMIN','SUBADMIN','SECRETARIA','MECANICO','SOCIO','VISITADOR','ANALISTA','AUXILIAR'));

-- ── 3) EL AUXILIAR NO TIENE ACCIONES ─────────────────────────────────────────────────────────
-- Copiada de la base viva el 24-nov; lo único nuevo es la línea del AUXILIAR.
create or replace function public.puede_accion(p_accion text)
 returns boolean
 language plpgsql
 stable security definer
 set search_path to 'public'
as $function$
declare v_role text; v_acc jsonb; v_ov text;
begin
  select role, coalesce(acciones, '{}'::jsonb) into v_role, v_acc
    from public.profiles where id = auth.uid();
  if v_role is null then return false; end if;
  if v_role = 'ADMIN_PRINCIPAL' then return true; end if;
  -- D-095: lo que haga el auxiliar se lo habilita un supervisor moto por moto, nunca una acción
  -- general. Va antes de los ajustes por persona para que uno viejo (era SUBADMIN) no le sirva.
  if v_role = 'AUXILIAR' then return false; end if;
  v_ov := v_acc ->> p_accion;
  if v_ov = 'permitir' then return true; end if;
  if v_ov = 'bloquear' then return false; end if;
  return p_accion = any(public._acciones_default(v_role));
end; $function$;

-- ── 4) SOLO EL ADMINISTRADOR PRINCIPAL CAMBIA PERMISOS ───────────────────────────────────────
-- Copiada de la base viva el 24-nov; lo único nuevo es `acciones`. La función de usuarios
-- (manage-users) entra con la llave de servicio: ahí mi_rol() da null y pasa, como hoy.
create or replace function public.enforce_profile_role_change()
 returns trigger
 language plpgsql
 security definer
as $function$
begin
  if (new.role is distinct from old.role
      or new.permisos is distinct from old.permisos
      or new.grupo is distinct from old.grupo
      or new.acciones is distinct from old.acciones)
     and public.mi_rol() <> 'ADMIN_PRINCIPAL' then
    raise exception 'Solo el administrador principal puede cambiar roles o accesos';
  end if;
  return new;
end;
$function$;

-- ── 5) EL AUXILIAR FUERA DE CADA TABLA ───────────────────────────────────────────────────────
-- `(select ...)`: Postgres la calcula una vez por consulta, no una vez por fila.
do $cerrar$
declare t record; v_using text; v_check text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' and tablename <> 'grupos' order by tablename loop
    v_using := case t.tablename
      when 'profiles' then '(select public.mi_rol()) is distinct from ''AUXILIAR'' or id = (select auth.uid())'
      when 'visitas'  then '(select public.mi_rol()) is distinct from ''AUXILIAR'' or asignada_a = (select auth.uid())'
      else                 '(select public.mi_rol()) is distinct from ''AUXILIAR'''
    end;
    v_check := case t.tablename
      when 'visitas' then '(select public.mi_rol()) is distinct from ''AUXILIAR'' or cliente_id in (select public.mis_clientes_visitador())'
      else v_using
    end;
    execute format('drop policy if exists auxiliar_fuera on public.%I', t.tablename);
    execute format('create policy auxiliar_fuera on public.%I as restrictive for all to authenticated using (%s) with check (%s)',
                   t.tablename, v_using, v_check);
    execute format('comment on policy auxiliar_fuera on public.%I is %L', t.tablename,
                   'D-095 (mig 226): el auxiliar administrativo no toca esta tabla. Toda tabla nueva de public lleva esta política.');
  end loop;
end
$cerrar$;

-- grupos: puede leer (código y color), no puede escribir.
drop policy if exists auxiliar_no_crea_grupos on public.grupos;
create policy auxiliar_no_crea_grupos on public.grupos as restrictive for insert to authenticated
  with check ((select public.mi_rol()) is distinct from 'AUXILIAR');
drop policy if exists auxiliar_no_cambia_grupos on public.grupos;
create policy auxiliar_no_cambia_grupos on public.grupos as restrictive for update to authenticated
  using ((select public.mi_rol()) is distinct from 'AUXILIAR')
  with check ((select public.mi_rol()) is distinct from 'AUXILIAR');
drop policy if exists auxiliar_no_borra_grupos on public.grupos;
create policy auxiliar_no_borra_grupos on public.grupos as restrictive for delete to authenticated
  using ((select public.mi_rol()) is distinct from 'AUXILIAR');

-- ── 6) SUS VISITAS (copia de lo que tiene el VISITADOR; las políticas de hoy no se tocan) ────
drop policy if exists "Visitas: el auxiliar lee las suyas" on public.visitas;
create policy "Visitas: el auxiliar lee las suyas" on public.visitas for select to authenticated
  using ((select public.mi_rol()) = 'AUXILIAR' and asignada_a = (select auth.uid()));

drop policy if exists "Visitas: el auxiliar registra las suyas" on public.visitas;
create policy "Visitas: el auxiliar registra las suyas" on public.visitas for insert to authenticated
  with check ((select public.mi_rol()) = 'AUXILIAR' and cliente_id in (select public.mis_clientes_visitador()));

-- ── 7) ARCHIVOS: sube fotos de visitas y de guardado; abre y cambia solo las suyas; no borra ──
-- Abrir y cambiar «las suyas» existe solo para que «subir o reemplazar» (upsert) le funcione:
-- Supabase lo exige. Son únicamente los archivos que él subió en esas dos carpetas.
drop policy if exists auxiliar_no_abre_archivos on storage.objects;
create policy auxiliar_no_abre_archivos on storage.objects as restrictive for select to authenticated
  using (
    (select public.mi_rol()) is distinct from 'AUXILIAR'
    or (bucket_id = 'documentos' and (name like 'visitas/%' or name like 'guardados/%')
        and owner_id = (select auth.uid())::text)
  );
drop policy if exists auxiliar_no_cambia_archivos on storage.objects;
create policy auxiliar_no_cambia_archivos on storage.objects as restrictive for update to authenticated
  using (
    (select public.mi_rol()) is distinct from 'AUXILIAR'
    or (bucket_id = 'documentos' and (name like 'visitas/%' or name like 'guardados/%')
        and owner_id = (select auth.uid())::text)
  );
drop policy if exists auxiliar_no_borra_archivos on storage.objects;
create policy auxiliar_no_borra_archivos on storage.objects as restrictive for delete to authenticated
  using ((select public.mi_rol()) is distinct from 'AUXILIAR');
drop policy if exists auxiliar_sube_solo_visitas on storage.objects;
create policy auxiliar_sube_solo_visitas on storage.objects as restrictive for insert to authenticated
  with check (
    (select public.mi_rol()) is distinct from 'AUXILIAR'
    or (bucket_id = 'documentos' and (name like 'visitas/%' or name like 'guardados/%'))
  );

-- ── 8) SALE EN LAS LISTAS DE NOMBRES, COMO HOY ───────────────────────────────────────────────
-- Copiada de la base viva; lo único nuevo es 'AUXILIAR'. Sigue devolviendo solo id y nombre.
create or replace function public.nombres_subadmins()
returns table (id uuid, nombre text)
language sql security definer
set search_path = public
stable as $$
  select p.id, p.nombre
  from public.profiles p
  where p.role in ('SUBADMIN', 'VISITADOR', 'AUXILIAR')
$$;

-- ── 9) SUS TRES LISTAS: solo las columnas del dibujo aprobado (24-nov) ───────────────────────
-- security definer porque él no puede leer las tablas. Por eso mismo cada una revisa el rol
-- adentro: sin eso, cualquier sesión podría usarlas.
create or replace function public.aux_motos()
returns table (placa text, marca text, modelo text, color text, grupo text, estado text, ubicacion text)
language plpgsql stable security definer set search_path = public as $$
begin
  if coalesce(public.mi_rol(), '') not in ('AUXILIAR', 'ADMIN', 'ADMIN_PRINCIPAL') then
    raise exception 'Esta lista es solo para el auxiliar administrativo y la administración.';
  end if;
  return query
    select m.placa::text, m.marca::text, m.modelo::text, m.color::text, m.grupo::text,
           m.estado::text, m.ubicacion_fisica::text
      from public.motos m
     where m.estado is distinct from 'Vendida'
     order by m.placa;
end; $$;

-- Activos y suspendidos: los suspendidos son las motos retenidas (fase 3: «retenida que ya pagó»).
create or replace function public.aux_contratos()
returns table (placa text, cliente text, inicio date, fin date)
language plpgsql stable security definer set search_path = public as $$
begin
  if coalesce(public.mi_rol(), '') not in ('AUXILIAR', 'ADMIN', 'ADMIN_PRINCIPAL') then
    raise exception 'Esta lista es solo para el auxiliar administrativo y la administración.';
  end if;
  return query
    select m.placa::text, cl.nombre::text, c.fecha_entrega, c.fecha_fin_contrato
      from public.contratos c
      join public.clientes cl on cl.id = c.cliente_id
      left join public.motos m on m.id = c.moto_id
     where c.estado in ('Activo', 'Suspendido')
     order by m.placa nulls last, cl.nombre;
end; $$;

-- Las órdenes abiertas, igual que la pantalla de Taller (todo lo que no está Finalizado).
-- «Por liquidación» = la orden la abrió una liquidación que todavía no se cierra (mig 222).
create or replace function public.aux_taller()
returns table (placa text, grupo text, estado_tecnico text, fecha_ingreso date, por_liquidacion boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if coalesce(public.mi_rol(), '') not in ('AUXILIAR', 'ADMIN', 'ADMIN_PRINCIPAL') then
    raise exception 'Esta lista es solo para el auxiliar administrativo y la administración.';
  end if;
  return query
    select m.placa::text, m.grupo::text, t.estado_tecnico::text, t.fecha_ingreso,
           exists (select 1 from public.liquidaciones l
                    where l.taller_id = t.id and l.estado not in ('cerrada', 'anulada'))
      from public.taller t
      join public.motos m on m.id = t.moto_id
     where t.estado_tecnico is distinct from 'Finalizado'
     order by t.fecha_ingreso, m.placa;
end; $$;

revoke all on function public.aux_motos() from public, anon;
revoke all on function public.aux_contratos() from public, anon;
revoke all on function public.aux_taller() from public, anon;
grant execute on function public.aux_motos() to authenticated;
grant execute on function public.aux_contratos() to authenticated;
grant execute on function public.aux_taller() to authenticated;

-- ── 10) LA VISITA DEL AUXILIAR LA CONFIRMA EL SUPERVISOR DE LA MOTO (punto 9) ────────────────
-- Las dos funciones son las de la 225 (la guarda del paso 0 comprobó que siguen iguales); lo nuevo
-- está marcado con D-095. `confirma_el_visitador` no cambia: estas motos siguen fuera de la lista
-- vieja del supervisor (5 por día) y le salen en «📍 Confirmar ubicación», en su recuadro aparte.
--
-- a) La lista del módulo. Cinco columnas nuevas AL FINAL, para que cada fila diga de dónde viene:
--    lo_confirma_supervisor (la visita es de un auxiliar), confirma_id y confirma (quién la tiene
--    que confirmar; vacío = la administración, porque la moto no tiene supervisor),
--    confirma_whatsapp (solo en las del auxiliar: para su botón «Pedírsela») y marco (quién marcó
--    ✓/✗). La ve además el supervisor de la moto, cuando la visita es de un auxiliar. Cambiar las
--    columnas obliga a borrarla y crearla de nuevo (la guarda comprobó que nada depende de ella);
--    la pantalla de hoy sigue funcionando: las columnas que no conoce, no las mira.
drop function public.confirmaciones_ubicacion();
create function public.confirmaciones_ubicacion()
returns table (
  contrato_id uuid,
  cliente text,
  placa text,
  grupo text,
  visitador_id uuid,
  visitador text,
  visita_fecha date,
  fecha_entrega date,
  resultado text,
  validada_fecha timestamptz,
  confirmada_en timestamptz,
  sitio jsonb,
  declaro_casa text,
  donde_declarado text,
  casa jsonb,
  lo_confirma_supervisor boolean,
  confirma_id uuid,
  confirma text,
  confirma_whatsapp text,
  marco text
)
language sql stable security definer
set search_path = public
as $$
  select
    c.id, cl.nombre::text, m.placa::text, m.grupo::text,
    ve.realizada_por, p.nombre::text, ve.visita_fecha, c.fecha_entrega,
    c.ubicacion_moto_resultado, c.ubicacion_moto_validada_fecha, c.ubicacion_confirmada_en,
    c.guardado_lugar,
    v.entrevista->>'guardaMotoAqui', v.entrevista->>'dondeGuardaMoto', v.ubicacion,
    -- D-095
    coalesce(p.role = 'AUXILIAR', false),
    q.quien,
    s.nombre::text,
    case when p.role = 'AUXILIAR' then s.whatsapp::text end,
    mk.nombre::text
  from public.contratos c
  cross join lateral public.visita_de_entrega(c.id) ve
  join public.visitas v on v.id = ve.visita_id
  join public.clientes cl on cl.id = c.cliente_id
  left join public.motos m on m.id = c.moto_id
  left join public.profiles p on p.id = ve.realizada_por
  -- D-095: quién la confirma. La del auxiliar, el supervisor de la moto (si la moto fuera del mismo
  -- auxiliar, o no tuviera supervisor, queda vacío: la administración).
  cross join lateral (select case
      when p.role is distinct from 'AUXILIAR' then ve.realizada_por
      when m.subadmin_id is distinct from ve.realizada_por then m.subadmin_id
    end as quien) q
  left join public.profiles s on s.id = q.quien
  left join public.profiles mk on mk.id = c.ubicacion_moto_validada_por
  where c.fecha_entrega >= public.desde_confirma_visitador()
    and c.estado <> 'Cancelado'
    and (coalesce(public.mi_rol(), '') in ('ADMIN', 'ADMIN_PRINCIPAL') or ve.realizada_por = auth.uid()
         -- D-095: el supervisor ve las visitas de auxiliares que le toca confirmar.
         or (p.role = 'AUXILIAR' and q.quien = auth.uid()))
  order by (c.ubicacion_confirmada_en is not null), c.fecha_entrega, m.placa;
$$;
revoke all on function public.confirmaciones_ubicacion() from public, anon;
grant execute on function public.confirmaciones_ubicacion() to authenticated;

-- b) El botón ✓/✗. Para las visitas de los demás, igual que hoy: solo quien la hizo.
create or replace function public.confirmar_ubicacion_visitador(p_contrato_id uuid, p_resultado text)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_quien uuid;
  v_entrega date;
  v_validada boolean;
  v_rol_visitador text;
  v_supervisor uuid;
begin
  if p_resultado is null or p_resultado not in ('coincide', 'no_coincide') then
    raise exception 'Resultado no válido: %', p_resultado;
  end if;

  select fecha_entrega, ubicacion_moto_validada into v_entrega, v_validada
  from public.contratos where id = p_contrato_id
  for update;
  if not found then
    raise exception 'Ese contrato no existe';
  end if;
  if v_entrega is null or v_entrega < public.desde_confirma_visitador() then
    raise exception 'Esta moto la valida su supervisor: se entregó antes del 19-nov';
  end if;

  select realizada_por into v_quien from public.visita_de_entrega(p_contrato_id);
  if v_quien is null or auth.uid() is null then
    raise exception 'Solo la confirma quien hizo la visita';
  end if;
  select role into v_rol_visitador from public.profiles where id = v_quien;
  if v_rol_visitador = 'AUXILIAR' then
    -- D-095: el auxiliar no la confirma solo; la confirma quien puede mirar el GPS de esa moto.
    select m.subadmin_id into v_supervisor
      from public.contratos c join public.motos m on m.id = c.moto_id
     where c.id = p_contrato_id;
    if v_supervisor is not null and v_supervisor <> v_quien then
      if v_supervisor <> auth.uid() then
        raise exception 'Esta visita la confirma el supervisor de la moto';
      end if;
    elsif coalesce(public.mi_rol(), '') not in ('ADMIN', 'ADMIN_PRINCIPAL') then
      raise exception 'Esta moto no tiene supervisor: la confirma la administración';
    end if;
  elsif v_quien <> auth.uid() then
    raise exception 'Solo la confirma quien hizo la visita';
  end if;
  if v_validada then
    raise exception 'Ya está confirmada';
  end if;

  update public.contratos
     set ubicacion_moto_validada = true,
         ubicacion_moto_resultado = p_resultado,
         ubicacion_moto_validada_por = auth.uid(),
         ubicacion_moto_validada_fecha = now()
   where id = p_contrato_id;
end $$;
revoke all on function public.confirmar_ubicacion_visitador(uuid, text) from public, anon;
grant execute on function public.confirmar_ubicacion_visitador(uuid, text) to authenticated;

-- ── 11) PRUEBA ANTES DE GUARDAR ──────────────────────────────────────────────────────────────
-- Si algo no da lo esperado, la migración entera se cancela y no queda nada.
do $prueba$
declare
  v_antes jsonb := current_setting('mig226.antes')::jsonb;
  v_despues jsonb := '{}'::jsonb;
  r record; t record; x record; y record;
  v_n bigint; v_rol jsonb; v_malas text := '';
  v_aux uuid; v_sec uuid; v_ap uuid;
  v_esp_visitas bigint; v_esp_grupos bigint; v_esp_motos bigint; v_esp_contratos bigint; v_esp_taller bigint;
  v_esp_archivos bigint;
  v_c uuid; v_vis uuid; v_sup uuid; v_c2 uuid; v_vis2 uuid;
  v_fila record; v_res text; v_por uuid; v_conf timestamptz;
begin
  -- '{}' y no '': la foto de antes, al deshacerse, deja estas claims en '' y lo que las lee como
  -- json falla (`migraciones_aplicadas.aplicada_por`). Misma trampa que resolvieron las 212, 215,
  -- 217, 220 y 227. Cada prueba de abajo, al deshacerse, vuelve a este '{}'.
  perform set_config('request.jwt.claims', '{}', true);

  -- a) Cada rol de hoy ve EXACTAMENTE lo mismo que antes, tabla por tabla.
  for r in select distinct on (role) id, role from public.profiles where role is not null order by role, created_at loop
    v_rol := '{}'::jsonb;
    begin
      perform set_config('request.jwt.claims', json_build_object('sub', r.id, 'role', 'authenticated')::text, true);
      perform set_config('role', 'authenticated', true);
      for t in select tablename from pg_tables where schemaname = 'public' order by tablename loop
        begin
          execute format('select count(*) from public.%I', t.tablename) into v_n;
        exception when insufficient_privilege then v_n := -1;
        end;
        v_rol := v_rol || jsonb_build_object(t.tablename, v_n);
      end loop;
      select count(*) into v_n from storage.objects;
      v_rol := v_rol || jsonb_build_object('storage.objects', v_n);
      raise exception 'MIG226_FIN';
    exception when others then
      if sqlerrm <> 'MIG226_FIN' then raise; end if;
    end;
    v_despues := v_despues || jsonb_build_object(r.role, v_rol);
  end loop;

  for x in select key as rol from jsonb_each(v_antes) loop
    for y in select key as tabla, value as n from jsonb_each(v_antes -> x.rol) loop
      if (v_despues -> x.rol -> y.tabla) is distinct from y.n then
        v_malas := v_malas || x.rol || '/' || y.tabla || ': ' || y.n::text || ' -> '
                   || coalesce(v_despues -> x.rol ->> y.tabla, 'nada') || ' · ';
      end if;
    end loop;
  end loop;
  if v_malas <> '' then
    raise exception 'ABORTA: un rol de hoy dejó de ver lo mismo que antes: %. No se guardó nada.', v_malas;
  end if;

  -- b) El auxiliar: se toma prestada una persona (no administradora), se le pone AUXILIAR con dos
  --    permisos marcados a mano, y se mira qué alcanza. Todo se deshace al final.
  select id into v_aux from public.profiles
   where role in ('SUBADMIN', 'VISITADOR', 'MECANICO', 'SECRETARIA') order by created_at limit 1;
  if v_aux is null then raise exception 'ABORTA: no hay con quién probar el rol AUXILIAR.'; end if;

  select count(*) into v_esp_visitas from public.visitas where asignada_a = v_aux;
  select count(*) into v_esp_grupos from public.grupos;
  select count(*) into v_esp_motos from public.motos where estado is distinct from 'Vendida';
  select count(*) into v_esp_contratos from public.contratos c join public.clientes cl on cl.id = c.cliente_id
   where c.estado in ('Activo', 'Suspendido');
  -- `tl` y no `t`: en este bloque `t` es la variable de los ciclos, y Postgres la tomaba a ella
  -- («record "t" has no field "moto_id"», 1.ª corrida del 24-nov).
  select count(*) into v_esp_taller from public.taller tl join public.motos m on m.id = tl.moto_id
   where tl.estado_tecnico is distinct from 'Finalizado';
  select count(*) into v_esp_archivos from storage.objects
   where bucket_id = 'documentos' and (name like 'visitas/%' or name like 'guardados/%')
     and owner_id = v_aux::text;

  begin
    update public.profiles
       set role = 'AUXILIAR', acciones = '{"registrar_efectivo":"permitir","eliminar_pago":"permitir"}'::jsonb
     where id = v_aux;
    perform set_config('request.jwt.claims', json_build_object('sub', v_aux, 'role', 'authenticated')::text, true);
    perform set_config('role', 'authenticated', true);

    if public.mi_rol() is distinct from 'AUXILIAR' then
      raise exception 'PRUEBA: la sesión de prueba no quedó como AUXILIAR (%).', public.mi_rol();
    end if;

    v_malas := '';
    for t in select tablename from pg_tables where schemaname = 'public'
              and tablename not in ('profiles', 'visitas', 'grupos') order by tablename loop
      begin
        execute format('select count(*) from public.%I', t.tablename) into v_n;
      exception when insufficient_privilege then v_n := 0;
      end;
      if v_n > 0 then v_malas := v_malas || t.tablename || ' (' || v_n || ') '; end if;
    end loop;
    if v_malas <> '' then raise exception 'PRUEBA: el auxiliar alcanza a ver filas de: %', v_malas; end if;

    select count(*) into v_n from public.profiles;
    if v_n <> 1 then raise exception 'PRUEBA: el auxiliar ve % perfiles; debe ver solo el suyo.', v_n; end if;
    select count(*) into v_n from public.visitas;
    if v_n <> v_esp_visitas then raise exception 'PRUEBA: el auxiliar ve % visitas; deben ser las % suyas.', v_n, v_esp_visitas; end if;
    select count(*) into v_n from public.grupos;
    if v_n <> v_esp_grupos then raise exception 'PRUEBA: el auxiliar ve % grupos de %.', v_n, v_esp_grupos; end if;
    select count(*) into v_n from storage.objects;
    if v_n <> v_esp_archivos then
      raise exception 'PRUEBA: el auxiliar alcanza a ver % archivos; deben ser solo los % que él subió a visitas/ y guardados/.', v_n, v_esp_archivos;
    end if;

    if public.puede_accion('registrar_efectivo') or public.puede_accion('eliminar_pago') then
      raise exception 'PRUEBA: el auxiliar tiene acciones aunque no debe tener ninguna.';
    end if;

    select count(*) into v_n from public.aux_motos();
    if v_n <> v_esp_motos then raise exception 'PRUEBA: aux_motos da % y deben ser %.', v_n, v_esp_motos; end if;
    select count(*) into v_n from public.aux_contratos();
    if v_n <> v_esp_contratos then raise exception 'PRUEBA: aux_contratos da % y deben ser %.', v_n, v_esp_contratos; end if;
    select count(*) into v_n from public.aux_taller();
    if v_n <> v_esp_taller then raise exception 'PRUEBA: aux_taller da % y deben ser %.', v_n, v_esp_taller; end if;

    -- Se quiere dar un permiso a sí mismo.
    begin
      update public.profiles set acciones = acciones || '{"prueba_226":"permitir"}'::jsonb where id = v_aux;
      get diagnostics v_n = row_count;
      if v_n = 0 then raise exception 'PRUEBA_BLOQUEADO'; end if;
      raise exception 'PRUEBA_SE_DIO_PERMISO';
    exception when others then
      if sqlerrm = 'PRUEBA_SE_DIO_PERMISO' then raise exception 'PRUEBA: el auxiliar pudo darse un permiso a sí mismo.'; end if;
      if sqlerrm <> 'PRUEBA_BLOQUEADO' and sqlerrm not like 'Solo el administrador principal%' then
        raise exception 'PRUEBA: darse un permiso falló por otra razón: %', sqlerrm;
      end if;
    end;

    raise exception 'MIG226_FIN';
  exception when others then
    if sqlerrm <> 'MIG226_FIN' then raise; end if;
  end;

  -- c) La secretaria (o quien haya) ya no puede darse permisos, ni leer las listas del auxiliar.
  select id into v_sec from public.profiles where role = 'SECRETARIA' order by created_at limit 1;
  if v_sec is null then
    select id into v_sec from public.profiles where role in ('SUBADMIN', 'ADMIN') order by created_at limit 1;
  end if;
  if v_sec is not null then
    begin
      perform set_config('request.jwt.claims', json_build_object('sub', v_sec, 'role', 'authenticated')::text, true);
      perform set_config('role', 'authenticated', true);
      begin
        update public.profiles set acciones = coalesce(acciones, '{}'::jsonb) || '{"prueba_226":"permitir"}'::jsonb where id = v_sec;
        get diagnostics v_n = row_count;
        if v_n = 0 then raise exception 'PRUEBA_BLOQUEADO'; end if;
        raise exception 'PRUEBA_SE_DIO_PERMISO';
      exception when others then
        if sqlerrm = 'PRUEBA_SE_DIO_PERMISO' then
          raise exception 'PRUEBA: un usuario pudo darse un permiso a sí mismo: el candado del perfil no quedó.';
        end if;
        if sqlerrm <> 'PRUEBA_BLOQUEADO' and sqlerrm not like 'Solo el administrador principal%' then
          raise exception 'PRUEBA: darse un permiso falló por otra razón: %', sqlerrm;
        end if;
      end;
      if public.mi_rol() not in ('ADMIN', 'ADMIN_PRINCIPAL') then
        begin
          perform count(*) from public.aux_motos();
          raise exception 'PRUEBA_LEYO';
        exception when others then
          if sqlerrm = 'PRUEBA_LEYO' then raise exception 'PRUEBA: un rol que no es auxiliar pudo leer su lista.'; end if;
          if sqlerrm not like 'Esta lista es solo%' then raise exception 'PRUEBA: la lista falló por otra razón: %', sqlerrm; end if;
        end;
      end if;
      raise exception 'MIG226_FIN';
    exception when others then
      if sqlerrm <> 'MIG226_FIN' then raise; end if;
    end;
  end if;

  -- d) El administrador principal SÍ sigue cambiando permisos (la pantalla de Usuarios).
  select id into v_ap from public.profiles where role = 'ADMIN_PRINCIPAL' order by created_at limit 1;
  if v_ap is not null and v_sec is not null then
    begin
      perform set_config('request.jwt.claims', json_build_object('sub', v_ap, 'role', 'authenticated')::text, true);
      perform set_config('role', 'authenticated', true);
      update public.profiles set acciones = coalesce(acciones, '{}'::jsonb) || '{"prueba_226":"bloquear"}'::jsonb where id = v_sec;
      get diagnostics v_n = row_count;
      if v_n <> 1 then raise exception 'PRUEBA: el administrador principal no pudo cambiar un permiso (% filas).', v_n; end if;
      raise exception 'MIG226_FIN';
    exception when others then
      if sqlerrm <> 'MIG226_FIN' then raise; end if;
    end;
  end if;

  -- e) Punto 9, con una entrega REAL desde el 19-nov que todavía nadie confirma y cuya moto tiene un
  --    supervisor distinto de quien visitó. Se hace de cuenta que quien visitó es auxiliar y se
  --    recorre el camino completo: él no puede marcar; el supervisor la ve y marca ✗; él documenta
  --    el sitio real y ahí queda confirmada a su nombre. Todo se deshace al final.
  select c.id, ve.realizada_por, m.subadmin_id into v_c, v_vis, v_sup
    from public.contratos c
    cross join lateral public.visita_de_entrega(c.id) ve
    join public.motos m on m.id = c.moto_id
   where c.fecha_entrega >= public.desde_confirma_visitador()
     and c.estado = 'Activo' and c.ubicacion_moto_validada = false
     and m.subadmin_id is not null and m.subadmin_id <> ve.realizada_por
   order by c.fecha_entrega, c.id
   limit 1;
  if v_c is null then
    raise exception 'ABORTA: no hay una entrega desde el 19-nov sin confirmar con qué probar el punto 9. No se guardó nada.';
  end if;
  if v_ap is null then raise exception 'ABORTA: no hay administrador principal con quién probar el punto 9.'; end if;
  -- Otra entrega pendiente de otro visitador: a ese le tiene que seguir funcionando como hoy.
  select c.id, ve.realizada_por into v_c2, v_vis2
    from public.contratos c
    cross join lateral public.visita_de_entrega(c.id) ve
   where c.fecha_entrega >= public.desde_confirma_visitador()
     and c.estado = 'Activo' and c.ubicacion_moto_validada = false
     and ve.realizada_por <> v_vis
   order by c.fecha_entrega, c.id
   limit 1;

  begin
    perform set_config('request.jwt.claims', json_build_object('sub', v_ap, 'role', 'authenticated')::text, true);
    perform set_config('role', 'authenticated', true);
    update public.profiles set role = 'AUXILIAR' where id = v_vis;
    get diagnostics v_n = row_count;
    if v_n <> 1 then raise exception 'PRUEBA: no se pudo poner al visitador como auxiliar de prueba.'; end if;

    -- El auxiliar: ve la suya, la fila dice que la confirma el supervisor, y no puede marcarla.
    perform set_config('request.jwt.claims', json_build_object('sub', v_vis, 'role', 'authenticated')::text, true);
    select * into v_fila from public.confirmaciones_ubicacion() where contrato_id = v_c;
    if not found then raise exception 'PRUEBA: el auxiliar no ve la entrega de su visita.'; end if;
    if v_fila.lo_confirma_supervisor is not true or v_fila.confirma_id is distinct from v_sup
       or v_fila.confirma is null then
      raise exception 'PRUEBA: la fila no dice que la confirma el supervisor (%, %, %).',
        v_fila.lo_confirma_supervisor, v_fila.confirma_id, v_fila.confirma;
    end if;
    begin
      perform public.confirmar_ubicacion_visitador(v_c, 'coincide');
      raise exception 'PRUEBA_CONFIRMO';
    exception when others then
      if sqlerrm = 'PRUEBA_CONFIRMO' then raise exception 'PRUEBA: el auxiliar pudo confirmar su propia visita.'; end if;
      if sqlerrm <> 'Esta visita la confirma el supervisor de la moto' then
        raise exception 'PRUEBA: que el auxiliar confirme falló por otra razón: %', sqlerrm;
      end if;
    end;

    -- El supervisor de la moto: la ve, marca ✗, y todavía no queda confirmada (falta el sitio).
    perform set_config('request.jwt.claims', json_build_object('sub', v_sup, 'role', 'authenticated')::text, true);
    if not exists (select 1 from public.confirmaciones_ubicacion() where contrato_id = v_c) then
      raise exception 'PRUEBA: el supervisor no ve la visita del auxiliar que le toca confirmar.';
    end if;
    perform public.confirmar_ubicacion_visitador(v_c, 'no_coincide');
    select resultado, confirmada_en, marco into v_fila
      from public.confirmaciones_ubicacion() where contrato_id = v_c;
    select ubicacion_moto_validada_por into v_por from public.contratos where id = v_c;
    if v_fila.resultado is distinct from 'no_coincide' or v_fila.confirmada_en is not null
       or v_por is distinct from v_sup or v_fila.marco is null then
      raise exception 'PRUEBA: el ✗ del supervisor no quedó como debía (%, %, %, %).',
        v_fila.resultado, v_fila.confirmada_en, v_por, v_fila.marco;
    end if;

    -- El auxiliar documenta el sitio real: ahí queda confirmada, y el sitio dice que lo hizo él.
    perform set_config('request.jwt.claims', json_build_object('sub', v_vis, 'role', 'authenticated')::text, true);
    perform public.registrar_guardado_visitador(v_c,
      jsonb_build_object('direccion', 'PRUEBA 226', 'condiciones', '', 'lat', 10.4, 'lng', -75.5));
    select confirmada_en, sitio ->> 'por' into v_conf, v_res
      from public.confirmaciones_ubicacion() where contrato_id = v_c;
    if v_conf is null or v_res is distinct from v_vis::text then
      raise exception 'PRUEBA: al documentar el sitio no quedó confirmada a nombre del auxiliar (%, %).', v_conf, v_res;
    end if;

    -- A otro visitador (no auxiliar) le sigue funcionando como hoy.
    if v_c2 is not null then
      perform set_config('request.jwt.claims', json_build_object('sub', v_vis2, 'role', 'authenticated')::text, true);
      perform public.confirmar_ubicacion_visitador(v_c2, 'coincide');
      select confirmada_en, lo_confirma_supervisor::text into v_conf, v_res
        from public.confirmaciones_ubicacion() where contrato_id = v_c2;
      if v_conf is null or v_res is distinct from 'false' then
        raise exception 'PRUEBA: a un visitador normal ya no le funciona confirmar (%, %).', v_conf, v_res;
      end if;
    else
      raise notice 'Punto 9: no hubo una segunda entrega pendiente para probar al visitador normal.';
    end if;

    raise exception 'MIG226_FIN';
  exception when others then
    if sqlerrm <> 'MIG226_FIN' then raise; end if;
  end;

  -- Antes de anotar la migración (ver el comentario del principio de este bloque).
  perform set_config('request.jwt.claims', '{}', true);
end
$prueba$;

select public.registrar_migracion(226, '226_auxiliar_administrativo.sql',
  'Rol AUXILIAR (D-095): fuera de todas las tablas salvo su perfil, sus visitas y los colores de grupo; sin acciones; tres listas de solo mirar; sus visitas las confirma el supervisor de la moto. Y solo el administrador principal cambia permisos de acción');

commit;

-- Debe dar: rol_nuevo true · tablas_cerradas = tablas_esperadas (41 el 24-nov) · grupos 3 ·
-- archivos 4 · visitas 2 · listas 3 · candado_permisos true · lista_dice_quien_confirma true ·
-- confirma_el_supervisor true. `permisos_marcados_hoy` es para que el dueño revise: cada permiso
-- marcado a mano por persona; «⚠ fuera de su rol» = no lo trae su rol.
select
  (select pg_get_constraintdef(oid) like '%AUXILIAR%' from pg_constraint
    where conrelid = 'public.profiles'::regclass and conname = 'profiles_role_check') as rol_nuevo,
  (select count(*) from pg_policies where schemaname = 'public' and policyname = 'auxiliar_fuera') as tablas_cerradas,
  (select count(*) - 1 from pg_tables where schemaname = 'public') as tablas_esperadas,
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'grupos' and policyname like 'auxiliar_%') as grupos,
  (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'auxiliar_%') as archivos,
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'visitas' and policyname like 'Visitas: el auxiliar%') as visitas,
  (select count(*) from pg_proc where pronamespace = 'public'::regnamespace and proname in ('aux_motos', 'aux_contratos', 'aux_taller')) as listas,
  (pg_get_functiondef('public.enforce_profile_role_change()'::regprocedure) like '%new.acciones is distinct from old.acciones%') as candado_permisos,
  (pg_get_function_result('public.confirmaciones_ubicacion()'::regprocedure) like '%lo_confirma_supervisor%') as lista_dice_quien_confirma,
  (pg_get_functiondef('public.confirmar_ubicacion_visitador(uuid, text)'::regprocedure) like '%Esta visita la confirma el supervisor de la moto%') as confirma_el_supervisor,
  (select string_agg(p.nombre || ' (' || p.role || '): ' || x.key
                     || case when x.key = any(public._acciones_default(p.role)) then '' else ' ⚠ fuera de su rol' end,
                     ' · ' order by p.nombre, x.key)
     from public.profiles p
     cross join lateral jsonb_each_text(coalesce(p.acciones, '{}'::jsonb)) x
    where x.value = 'permitir') as permisos_marcados_hoy;
