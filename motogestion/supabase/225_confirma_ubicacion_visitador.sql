-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 225 — DÓNDE DUERME LA MOTO LO CONFIRMA QUIEN HIZO LA VISITA (D-094, regla del dueño, 19-nov-2026)
--
-- De la hoja a mano del dueño (19-nov): «Módulo de confirmar visitas (si no, no se paga)».
-- Decidido con él pregunta por pregunta ese día:
--   · La confirmación es mirar en el GPS dónde durmió la moto y marcar ✓ (duerme donde se declaró)
--     o ✗. Con ✗, quien visitó va al sitio real y lo documenta (GPS, foto, encargado del sitio:
--     la ventana de la mig 077, que ya existe).
--   · La hace QUIEN HIZO LA VISITA, en su módulo «📍 Confirmar ubicación», sin importar quién
--     gestiona la moto para el cobro. El ADMIN_PRINCIPAL y el ADMIN ven las de todos.
--   · Los $40.000 de la visita se pagan en la semana en que confirma, con la fecha real de la visita
--     en el detalle. Con ✗, cuando documenta el sitio real («sí se los gana»).
--   · Aplica a las motos entregadas DESDE EL 19-NOV-2026. Las de antes siguen con el supervisor de
--     la moto, 5 por día (mig 145), y se pagan como siempre.
--   · Al supervisor de la moto no le sale la tarea ni los botones; ve el dato del sitio cuando ya
--     quedó confirmado (le sirve si tiene que recogerla). Eso lo hace la pantalla.
--
-- LO QUE HACE
--   0) Antes de cambiar nada revisa que la base esté como se midió el 19-nov y anota cuántas motos
--      hay en la cola del supervisor y cuántos avisos de «validar dónde duerme».
--   1) `contratos.ubicacion_confirmada_en`: el instante en que quedó confirmado dónde duerme la
--      moto. Solo la escribe un disparador, UNA vez, y solo en las entregas desde el 19-nov. No se
--      mueve aunque después se actualice el sitio ni se puede escribir a mano: de ahí sale la semana
--      de pago de la visita, y si se moviera, una visita ya pagada podría volver a pagarse.
--   2) `visita_de_entrega(contrato)`: qué visita paga esa entrega. Espejo de la nómina
--      (`nominaCobradores.ts`, sección 2b): la última visita que no fue rechazada y tiene quién la
--      hizo, de la que esta entrega es la PRIMERA posterior. Si se toca una, hay que tocar la otra.
--   3) `confirma_el_visitador(contrato)`: sí/no, ¿esta moto la confirma quien visitó?
--   4) La cola del supervisor (mig 145) deja de recibir esas motos. El resto de la vista, igual.
--   5) `confirmaciones_ubicacion()`: la lista del módulo. Cada quien ve las suyas; ADMIN y
--      ADMIN_PRINCIPAL, todas.
--   6) `confirmar_ubicacion_visitador(contrato, resultado)`: el botón ✓/✗. Solo para quien hizo la
--      visita, y una sola vez.
--   7) Prueba lo nuevo con un contrato real y lo deshace. 8) Compara el antes y el después.
--   Si algo no da lo esperado, se cancela TODA y no queda nada.
--
-- LO QUE NO TOCA: las validaciones de las motos entregadas antes del 19-nov, la función que
-- registra el sitio real (`registrar_guardado_visitador`, mig 077), el valor de la visita, la
-- lista general de avisos (`pendientes`, que lee la cola y por eso deja de mostrarle las nuevas al
-- supervisor sin tener que reescribirla). No hay tablas nuevas.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   Volver a crear `validar_ubicacion_cola` sin la última condición (la de la mig 145), y:
--   drop trigger if exists trg_marcar_ubicacion_confirmada on public.contratos;
--   drop function if exists public.confirmar_ubicacion_visitador(uuid, text);
--   drop function if exists public.confirmaciones_ubicacion();
--   drop function if exists public.confirma_el_visitador(uuid);
--   drop function if exists public.visita_de_entrega(uuid);
--   drop function if exists public.marcar_ubicacion_confirmada();
--   (la columna `ubicacion_confirmada_en` se puede dejar: nada más la lee)
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

-- ── 0) QUE LA BASE ESTÉ COMO SE MIDIÓ, Y LA FOTO DE ANTES ───────────────────────────────────
do $antes$
declare
  v_cols  text;
  v_def   text;
  v_falta text;
  v_ands  int;
  v_cola  int;
  v_avisos int;
begin
  if exists (select 1 from public.migraciones_aplicadas where numero = 225) then
    raise exception 'La 225 ya se había corrido. No se cambió nada.';
  end if;

  if exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'contratos'
                and column_name = 'ubicacion_confirmada_en') then
    raise exception 'La columna ubicacion_confirmada_en ya existe: alguien corrió parte de esto antes. No se cambió nada.';
  end if;

  -- Las columnas que se leen y se escriben, con el tipo que se espera.
  select string_agg(e.t || '.' || e.c, ', ') into v_falta
    from (values
      ('contratos', 'fecha_entrega',                 'date'),
      ('contratos', 'estado',                        'text'),
      ('contratos', 'ubicacion_moto_validada',       'boolean'),
      ('contratos', 'ubicacion_moto_resultado',      'text'),
      ('contratos', 'ubicacion_moto_validada_por',   'uuid'),
      ('contratos', 'ubicacion_moto_validada_fecha', 'timestamp with time zone'),
      ('contratos', 'guardado_lugar',                'jsonb'),
      ('visitas',   'fecha',                         'date'),
      ('visitas',   'estado',                        'text'),
      ('visitas',   'realizada_por',                 'uuid'),
      ('visitas',   'created_at',                    'timestamp with time zone'),
      ('visitas',   'entrevista',                    'jsonb'),
      ('visitas',   'ubicacion',                     'jsonb')
    ) as e(t, c, tipo)
   where not exists (select 1 from information_schema.columns ic
                      where ic.table_schema = 'public' and ic.table_name = e.t
                        and ic.column_name = e.c and ic.data_type = e.tipo);
  if v_falta is not null then
    raise exception 'Estas columnas no están o tienen otro tipo: %. No se cambió nada.', v_falta;
  end if;

  -- La cola del supervisor, tal como se midió en la base el 19-nov (la de la mig 145).
  select string_agg(column_name, ',' order by ordinal_position) into v_cols
    from information_schema.columns
   where table_schema = 'public' and table_name = 'validar_ubicacion_cola';
  if v_cols is distinct from 'contrato_id,cliente_id,moto_id,cliente,placa,subadmin_id,fecha_entrega,dias,turno' then
    raise exception 'La cola del supervisor no es la que se midió el 19-nov (columnas: %). No se cambió nada.',
      coalesce(v_cols, 'no existe');
  end if;
  v_def := pg_get_viewdef('public.validar_ubicacion_cola'::regclass, true);
  select count(*) into v_ands from regexp_matches(v_def, '\mAND\M', 'gi');
  if v_def not ilike '%ubicacion_moto_validada = false%'
     or v_def not ilike '%''Activo''%'
     or v_def not ilike '%partition by m.subadmin_id%'
     or v_def not ilike '%<= 7%'
     or v_def ilike '%confirma_el_visitador%'
     or v_ands <> 3 then
    raise exception 'La cola del supervisor cambió desde que se midió el 19-nov. No se cambió nada.';
  end if;

  select count(*) into v_cola from public.validar_ubicacion_cola;
  select count(*) into v_avisos from public.pendientes where tipo = 'validar_ubicacion_moto';
  perform set_config('mig225.cola_antes', v_cola::text, true);
  perform set_config('mig225.avisos_antes', v_avisos::text, true);
  raise notice 'Antes: % motos en la cola del supervisor y % avisos de validar dónde duerme.', v_cola, v_avisos;
end
$antes$;

-- Desde cuándo rige. Mismo valor que DESDE_CONFIRMA_VISITADOR en nominaCobradores.ts.
create or replace function public.desde_confirma_visitador()
returns date language sql immutable as $$ select date '2026-11-19' $$;

-- ── 1) CUÁNDO QUEDÓ CONFIRMADO ─────────────────────────────────────────────────────────────────
alter table public.contratos
  add column if not exists ubicacion_confirmada_en timestamptz;

comment on column public.contratos.ubicacion_confirmada_en is
  'Cuándo quedó confirmado dónde duerme la moto (solo entregas desde el 19-nov-2026): al marcar ✓, o al documentar el sitio real después de un ✗. Solo lo escribe un disparador, una vez, y no se mueve (mig 225). De aquí sale la semana de pago de la visita (D-094).';

create or replace function public.marcar_ubicacion_confirmada()
returns trigger language plpgsql as $$
begin
  -- Ya quedó: no se mueve ni se borra (si se moviera de semana, la visita se pagaría dos veces).
  if old.ubicacion_confirmada_en is not null then
    new.ubicacion_confirmada_en := old.ubicacion_confirmada_en;
    return new;
  end if;
  -- Nadie la escribe a mano.
  new.ubicacion_confirmada_en := null;
  if new.fecha_entrega >= public.desde_confirma_visitador() and (
       -- ✓ recién marcado
       (new.ubicacion_moto_resultado = 'coincide'
        and old.ubicacion_moto_resultado is distinct from 'coincide')
       -- ✗ y el sitio real documentado en ESTE cambio. Si el sitio ya estaba guardado de antes y
       -- después salió ✗, ese sitio es justo el que no coincide: falta ir al de verdad.
    or (new.ubicacion_moto_resultado = 'no_coincide'
        and new.guardado_lugar is not null
        and new.guardado_lugar is distinct from old.guardado_lugar)
  ) then
    new.ubicacion_confirmada_en := now();
  end if;
  return new;
end $$;
revoke execute on function public.marcar_ubicacion_confirmada() from public, anon, authenticated;

drop trigger if exists trg_marcar_ubicacion_confirmada on public.contratos;
create trigger trg_marcar_ubicacion_confirmada
  before update of ubicacion_moto_resultado, guardado_lugar, ubicacion_confirmada_en on public.contratos
  for each row execute function public.marcar_ubicacion_confirmada();

-- ── 2) QUÉ VISITA PAGA ESTA ENTREGA (espejo de la nómina) ──────────────────────────────────────
-- SECURITY DEFINER y sin permiso para nadie: el supervisor no ve por RLS las visitas que hizo otro,
-- y sin esto la cola le seguiría mostrando la moto. Solo la usan las funciones de abajo.
create or replace function public.visita_de_entrega(p_contrato uuid)
returns table (visita_id uuid, realizada_por uuid, visita_fecha date)
language sql stable security definer
set search_path = public
as $$
  select v.id, v.realizada_por, v.fecha
  from public.contratos c
  join public.visitas v
    on v.cliente_id = c.cliente_id
   and v.fecha <= c.fecha_entrega
   and v.estado <> 'Rechazada'
   and v.realizada_por is not null
  where c.id = p_contrato
    and c.fecha_entrega is not null
    and c.estado <> 'Cancelado'
    and c.moto_id is not null
    -- esta entrega es la PRIMERA del cliente posterior a la visita
    and not exists (
      select 1 from public.contratos c2
      where c2.cliente_id = c.cliente_id
        and c2.estado <> 'Cancelado'
        and c2.fecha_entrega is not null
        and c2.fecha_entrega >= v.fecha
        and (c2.fecha_entrega < c.fecha_entrega or (c2.fecha_entrega = c.fecha_entrega and c2.id < c.id))
    )
  order by v.fecha desc, v.created_at desc nulls last
  limit 1;
$$;
revoke all on function public.visita_de_entrega(uuid) from public, anon, authenticated;

-- ── 3) ¿ESTA MOTO LA CONFIRMA QUIEN VISITÓ? ───────────────────────────────────────────────────
-- Solo devuelve sí o no. La pantalla del supervisor la usa para saber si le muestra la tarea.
create or replace function public.confirma_el_visitador(p_contrato uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.contratos c
    cross join lateral public.visita_de_entrega(c.id) ve
    where c.id = p_contrato
      and c.fecha_entrega >= public.desde_confirma_visitador()
  );
$$;
revoke all on function public.confirma_el_visitador(uuid) from public, anon;
grant execute on function public.confirma_el_visitador(uuid) to authenticated;

-- ── 4) LA COLA DEL SUPERVISOR, SIN LAS QUE CONFIRMA QUIEN VISITÓ ──────────────────────────────
-- ⚠️ COPIADA DE LA BASE VIVA (pg_get_viewdef, 19-nov), no del archivo de la 145; el paso 0 revisa
-- que siga igual. Mismas columnas y mismo orden: `pendientes` la lee y una vista no se puede
-- reemplazar cambiándole las columnas. Lo único nuevo es la última condición. El `case` hace que a
-- las motos entregadas antes del 19-nov (casi todas) ni se les pregunte por la visita.
create or replace view public.validar_ubicacion_cola with (security_invoker = true) as
select
  c.id as contrato_id, c.cliente_id, c.moto_id, cl.nombre as cliente, m.placa, m.subadmin_id,
  c.fecha_entrega,
  (zala.hoy() - c.fecha_entrega)::int as dias,
  row_number() over (
    partition by m.subadmin_id
    order by case when zala.hoy() - c.fecha_entrega <= 7 then 0 else 1 end,
             c.fecha_entrega asc, c.id
  )::int as turno
from public.contratos c
join public.clientes cl on cl.id = c.cliente_id
left join public.motos m on m.id = c.moto_id
where c.estado = 'Activo'
  and c.ubicacion_moto_validada = false
  and c.fecha_entrega is not null
  and c.fecha_entrega <= zala.hoy()
  and case when c.fecha_entrega < public.desde_confirma_visitador() then true
           else not public.confirma_el_visitador(c.id) end;

-- ── 5) LA LISTA DEL MÓDULO «📍 Confirmar ubicación» ───────────────────────────────────────────
-- Devuelve lo justo para mirar el GPS y, si no coincide, ir al sitio: lo que el cliente declaró
-- en la visita y la ubicación de la casa. Nada de cédula, documentos ni plata.
create or replace function public.confirmaciones_ubicacion()
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
  casa jsonb
)
language sql stable security definer
set search_path = public
as $$
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
$$;
revoke all on function public.confirmaciones_ubicacion() from public, anon;
grant execute on function public.confirmaciones_ubicacion() to authenticated;

-- ── 6) EL BOTÓN ✓ / ✗ ─────────────────────────────────────────────────────────────────────────
-- Va por función porque el SUBADMIN solo puede cambiar los contratos de SUS motos (mig 035), y la
-- moto que visitó puede ser de otro supervisor. Escribe lo mismo que el botón de siempre
-- (`validarUbicacionMoto` en useContratos.ts) y nada más.
create or replace function public.confirmar_ubicacion_visitador(p_contrato_id uuid, p_resultado text)
returns void
language plpgsql security definer
set search_path = public
as $$
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
end $$;
revoke all on function public.confirmar_ubicacion_visitador(uuid, text) from public, anon;
grant execute on function public.confirmar_ubicacion_visitador(uuid, text) to authenticated;

-- ── 7) PRUEBA ANTES DE GUARDAR ───────────────────────────────────────────────────────────────
-- Con un contrato real entregado antes del 19-nov. Cada prueba deshace lo que hizo (lanza un aviso
-- propio y lo atrapa): el contrato queda como estaba.
do $prueba$
declare
  v_c uuid;
  v_t timestamptz;
begin
  select id into v_c from public.contratos
   where estado = 'Activo' and fecha_entrega < public.desde_confirma_visitador()
     and ubicacion_moto_resultado is distinct from 'coincide'
   limit 1;
  if v_c is null then
    raise exception 'No hay un contrato con qué probar. No se guardó nada.';
  end if;

  -- a) Una entrega VIEJA no se marca aunque le pongan ✓ (esa la sigue pagando la regla de antes).
  begin
    update public.contratos set ubicacion_moto_resultado = 'coincide' where id = v_c;
    select ubicacion_confirmada_en into v_t from public.contratos where id = v_c;
    raise exception 'PRUEBA_A:%', coalesce(v_t::text, 'vacia');
  exception when others then
    if sqlerrm = 'PRUEBA_A:vacia' then null;
    elsif sqlerrm like 'PRUEBA_A:%' then
      raise exception 'Una entrega de antes del 19-nov quedó marcada como confirmada. No se guardó nada.';
    else
      raise exception 'La prueba a) falló por otra razón: %. No se guardó nada.', sqlerrm;
    end if;
  end;

  -- b) Una entrega NUEVA con ✓ queda marcada.
  begin
    update public.contratos
       set fecha_entrega = public.desde_confirma_visitador(), ubicacion_moto_resultado = 'coincide'
     where id = v_c;
    select ubicacion_confirmada_en into v_t from public.contratos where id = v_c;
    raise exception 'PRUEBA_B:%', coalesce(v_t::text, 'vacia');
  exception when others then
    if sqlerrm = 'PRUEBA_B:vacia' then
      raise exception 'Una entrega nueva con ✓ no quedó marcada. No se guardó nada.';
    elsif sqlerrm not like 'PRUEBA_B:%' then
      raise exception 'La prueba b) falló por otra razón: %. No se guardó nada.', sqlerrm;
    end if;
  end;

  -- c) Una entrega NUEVA con ✗ y sin el sitio real NO queda marcada todavía.
  begin
    update public.contratos
       set fecha_entrega = public.desde_confirma_visitador(), ubicacion_moto_resultado = 'no_coincide',
           guardado_lugar = null
     where id = v_c;
    select ubicacion_confirmada_en into v_t from public.contratos where id = v_c;
    raise exception 'PRUEBA_C:%', coalesce(v_t::text, 'vacia');
  exception when others then
    if sqlerrm = 'PRUEBA_C:vacia' then null;
    elsif sqlerrm like 'PRUEBA_C:%' then
      raise exception 'Una entrega con ✗ quedó confirmada sin documentar el sitio real. No se guardó nada.';
    else
      raise exception 'La prueba c) falló por otra razón: %. No se guardó nada.', sqlerrm;
    end if;
  end;

  -- d) Con ✗ y el sitio real documentado, SÍ queda marcada; y después no se puede borrar a mano.
  begin
    update public.contratos
       set fecha_entrega = public.desde_confirma_visitador(), ubicacion_moto_resultado = 'no_coincide',
           guardado_lugar = jsonb_build_object('direccion', 'prueba de la migración 225')
     where id = v_c;
    update public.contratos set ubicacion_confirmada_en = null where id = v_c;
    select ubicacion_confirmada_en into v_t from public.contratos where id = v_c;
    raise exception 'PRUEBA_D:%', coalesce(v_t::text, 'vacia');
  exception when others then
    if sqlerrm = 'PRUEBA_D:vacia' then
      raise exception 'Con ✗ y el sitio documentado no quedó marcada, o se pudo borrar a mano. No se guardó nada.';
    elsif sqlerrm not like 'PRUEBA_D:%' then
      raise exception 'La prueba d) falló por otra razón: %. No se guardó nada.', sqlerrm;
    end if;
  end;

  -- e) El botón ✓/✗ no deja confirmar una entrega de antes del 19-nov.
  begin
    perform public.confirmar_ubicacion_visitador(v_c, 'coincide');
    raise exception 'PRUEBA_E:paso';
  exception when others then
    if sqlerrm = 'PRUEBA_E:paso' then
      raise exception 'El botón dejó confirmar una entrega de antes del 19-nov. No se guardó nada.';
    elsif sqlerrm not like 'Esta moto la valida su supervisor%' then
      raise exception 'La prueba e) falló por otra razón: %. No se guardó nada.', sqlerrm;
    end if;
  end;

  -- f) La lista del módulo se puede leer.
  perform count(*) from public.confirmaciones_ubicacion();
end
$prueba$;

-- ── 8) EL DESPUÉS, CONTRA EL ANTES ───────────────────────────────────────────────────────────
-- La cola debe quedar igual, menos las motos nuevas que ahora confirma quien visitó. Si no hay
-- ninguna (hoy no se ha entregado nada desde el 19-nov), los avisos tampoco cambian.
do $despues$
declare
  v_cola_antes   int := current_setting('mig225.cola_antes')::int;
  v_avisos_antes int := current_setting('mig225.avisos_antes')::int;
  v_nuevas int;
  v_cola   int;
  v_avisos int;
begin
  select count(*) into v_nuevas
    from public.contratos c
   where c.estado = 'Activo' and c.ubicacion_moto_validada = false
     and c.fecha_entrega is not null and c.fecha_entrega <= zala.hoy()
     and c.fecha_entrega >= public.desde_confirma_visitador()
     and public.confirma_el_visitador(c.id);
  select count(*) into v_cola from public.validar_ubicacion_cola;
  select count(*) into v_avisos from public.pendientes where tipo = 'validar_ubicacion_moto';

  if v_cola <> v_cola_antes - v_nuevas then
    raise exception 'La cola del supervisor quedó con % motos y debía quedar con % (% antes, % pasan a quien visitó). No se guardó nada.',
      v_cola, v_cola_antes - v_nuevas, v_cola_antes, v_nuevas;
  end if;
  if v_nuevas = 0 and v_avisos <> v_avisos_antes then
    raise exception 'Los avisos de validar dónde duerme cambiaron de % a % sin motos nuevas. No se guardó nada.',
      v_avisos_antes, v_avisos;
  end if;
  raise notice 'Después: % motos en la cola (antes %), % pasan a quien visitó, % avisos (antes %).',
    v_cola, v_cola_antes, v_nuevas, v_avisos, v_avisos_antes;
end
$despues$;

select public.registrar_migracion(225, '225_confirma_ubicacion_visitador.sql',
  'Dónde duerme la moto lo confirma quien hizo la visita en las entregas desde el 19-nov: módulo «Confirmar ubicación», la fecha de confirmación que decide la semana de pago, y la cola del supervisor sin esas motos (D-094)');

commit;

-- Lo que debe salir abajo: la 225 registrada, la cola con las mismas motos de antes (unas 234 el
-- 19-nov, si nadie validó ni entregó nada mientras tanto) y la lista del módulo vacía.
select
  (select count(*) from public.migraciones_aplicadas where numero = 225) as registrada,
  (select count(*) from public.validar_ubicacion_cola)                    as motos_en_la_cola,
  (select count(*) from public.pendientes where tipo = 'validar_ubicacion_moto') as avisos_validar,
  (select count(*) from public.contratos where ubicacion_confirmada_en is not null) as confirmadas;
