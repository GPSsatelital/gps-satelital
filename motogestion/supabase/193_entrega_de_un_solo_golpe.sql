-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 193 — LA ENTREGA DE LA MOTO SE GUARDA DE UN SOLO GOLPE (8-oct-2026, dueño: "1" al plan)
--
-- EL PROBLEMA: al entregar una moto (WizardContrato, paso 6) la app guardaba cinco cosas en cinco
-- llamadas sueltas — la moto (kilometraje y fotos), el contrato "Activo", la moto "Asignada", el
-- cliente "Activo" y la semana adelantada de la base — y NO miraba si alguna fallaba. Si el internet
-- (o la base, como en el reinicio del 8-oct a las 4:41 p.m.) se caía en la mitad, quedaba la entrega
-- a medias sin ningún aviso. Medido el 8-oct: de 130 contratos hechos en la app, ninguno quedó así
-- todavía.
--
-- QUÉ HACE: una sola función, `activar_entrega`, que hace las cinco cosas EN EL MISMO ORDEN de antes
-- y dentro de una sola transacción: o quedan las cinco o no queda ninguna.
--   · SECURITY INVOKER: corre con los permisos de quien entrega, igual que las cinco llamadas de antes
--     (mismas políticas, mismos candados — el del cliente exige ADMIN para pasarlo a "Activo").
--   · Cada guardado tiene que tocar UNA fila; si no (un permiso que no deja), frena todo con un
--     mensaje claro en vez de seguir de largo.
--   · Repetirla no duplica: si el contrato ya está "Activo" y la semana adelantada ya existe,
--     contesta "ya_estaba" sin tocar nada. Si quedó activo pero sin la semana adelantada, la completa.
-- No toca el motor, ni las cuentas de la semana adelantada (el valor lo sigue mandando la pantalla).
--
-- LA PRUEBA: toma un contrato real "En proceso" (moto "Reservada", cliente "Aprobado"), lo entrega con
-- datos de prueba, comprueba las cinco cosas, lo entrega OTRA VEZ (no debe duplicar) y DESHACE todo.
-- Si algo no cuadra, se detiene y no guarda nada (ni la función). Si no hay ningún contrato en proceso,
-- lo dice y no prueba.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   drop function if exists public.activar_entrega(uuid, uuid, uuid, numeric, jsonb, numeric, date);
--   (y volver a subir la versión anterior de WizardContrato.tsx)
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

create or replace function public.activar_entrega(
  p_contrato_id uuid,
  p_moto_id     uuid,
  p_cliente_id  uuid,
  p_km          numeric,
  p_fotos       jsonb,
  p_adelanto    numeric,
  p_fecha       date
) returns jsonb
language plpgsql security invoker set search_path = public as $$
declare
  v_c   record;
  v_ya  boolean;
  n     int;
begin
  -- Agarrar el contrato: dos toques seguidos esperan en fila y el segundo ve el primero ya hecho.
  select id, estado, moto_id, cliente_id into v_c
    from public.contratos where id = p_contrato_id for update;
  if v_c.id is null then
    raise exception 'No se encontró el contrato. No se guardó nada de la entrega.';
  end if;
  if v_c.moto_id is distinct from p_moto_id or v_c.cliente_id is distinct from p_cliente_id then
    raise exception 'El contrato no es de esa moto o de ese cliente. No se guardó nada de la entrega.';
  end if;

  select exists (select 1 from public.pagos
                  where contrato_id = p_contrato_id and tipo_registro = 'adelanto_base') into v_ya;

  -- Ya entregada (doble toque, o repetir después de un corte): no se toca nada.
  if v_c.estado = 'Activo' and (coalesce(p_adelanto, 0) <= 0 or v_ya) then
    return jsonb_build_object('ok', true, 'ya_estaba', true);
  end if;
  if v_c.estado not in ('En proceso', 'Activo') then
    raise exception 'El contrato está "%": no se puede entregar. No se guardó nada.', v_c.estado;
  end if;
  if p_km is null or p_fotos is null or jsonb_typeof(p_fotos) <> 'object' then
    raise exception 'Faltan el kilometraje o las fotos. No se guardó nada de la entrega.';
  end if;

  -- Las cinco cosas, en el mismo orden de antes.
  update public.motos set kilometraje_inicial = p_km, fotos_entrega = p_fotos where id = p_moto_id;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'No se pudo guardar el kilometraje y las fotos de la moto. No se guardó nada.'; end if;

  update public.contratos set estado = 'Activo', firma_responsable = true where id = p_contrato_id;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'No se pudo activar el contrato. No se guardó nada.'; end if;

  update public.motos set estado = 'Asignada' where id = p_moto_id;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'No se pudo asignar la moto. No se guardó nada.'; end if;

  update public.clientes set estado = 'Activo' where id = p_cliente_id;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'No se pudo activar al cliente. No se guardó nada.'; end if;

  -- La semana adelantada de la base (pago interno, fuera de la caja del día). El motor la aplica a la Caja 1.
  if coalesce(p_adelanto, 0) > 0 and not v_ya then
    insert into public.pagos (contrato_id, valor, metodo, estado, tipo_registro, fecha)
    values (p_contrato_id, p_adelanto, 'Efectivo', 'Confirmado', 'adelanto_base', p_fecha);
  end if;

  return jsonb_build_object('ok', true, 'ya_estaba', false, 'adelanto', coalesce(p_adelanto, 0) > 0 and not v_ya);
end; $$;

comment on function public.activar_entrega(uuid, uuid, uuid, numeric, jsonb, numeric, date) is
  'Mig 193: la entrega de la moto (paso 6 del contrato) de un solo golpe — moto, contrato, asignación, cliente y semana adelantada, o nada. Repetirla no duplica.';

grant execute on function public.activar_entrega(uuid, uuid, uuid, numeric, jsonb, numeric, date) to authenticated;

-- ── LA PRUEBA (se deshace sola) ──────────────────────────────────────────────────────────────
-- A nombre del dueño (ADMIN_PRINCIPAL), para pasar los mismos candados que pasa en la app. Va AQUÍ,
-- fuera de la prueba: puesto DENTRO, la prueba lo deshacía y lo dejaba vacío, y `registrar_migracion`
-- (que lee quién corre la migración) fallaba con "invalid input syntax for type json" (1er intento).
select set_config('request.jwt.claim.sub', 'a68f065b-3a59-4c67-bd2e-45c6abc30fdb', true);
select set_config('request.jwt.claims', '{"sub":"a68f065b-3a59-4c67-bd2e-45c6abc30fdb","role":"authenticated"}', true);

do $prueba$
declare
  v   record;
  r1  jsonb;
  r2  jsonb;
  n_ad int;
  v_c text; v_m text; v_cl text; v_km numeric;
begin
  select c.id as contrato_id, c.moto_id, c.cliente_id, c.forma_pago, m.placa
    into v
    from public.contratos c
    join public.motos m on m.id = c.moto_id
    join public.clientes cl on cl.id = c.cliente_id
   where c.estado = 'En proceso' and m.estado = 'Reservada' and cl.estado = 'Aprobado'
   order by c.created_at desc
   limit 1;
  if v.contrato_id is null then
    raise notice 'PRUEBA: no hay ningún contrato en proceso para probar. La función quedó creada sin probar.';
    return;
  end if;

  begin
    r1 := public.activar_entrega(v.contrato_id, v.moto_id, v.cliente_id, 12345,
                                 '{"prueba":"https://x/entregas/prueba.jpg"}'::jsonb,
                                 case when v.forma_pago = 'Diario' then 0 else 202000 end, current_date);
    select c.estado, m.estado, cl.estado, m.kilometraje_inicial into v_c, v_m, v_cl, v_km
      from public.contratos c join public.motos m on m.id = c.moto_id join public.clientes cl on cl.id = c.cliente_id
     where c.id = v.contrato_id;
    if v_c <> 'Activo' or v_m <> 'Asignada' or v_cl <> 'Activo' or v_km <> 12345 then
      raise exception 'PRUEBA FALLÓ (%): contrato %, moto %, cliente %, km %', v.placa, v_c, v_m, v_cl, v_km;
    end if;

    r2 := public.activar_entrega(v.contrato_id, v.moto_id, v.cliente_id, 12345,
                                 '{"prueba":"https://x/entregas/prueba.jpg"}'::jsonb,
                                 case when v.forma_pago = 'Diario' then 0 else 202000 end, current_date);
    select count(*) into n_ad from public.pagos where contrato_id = v.contrato_id and tipo_registro = 'adelanto_base';
    if not (r2->>'ya_estaba')::boolean or n_ad > 1 then
      raise exception 'PRUEBA FALLÓ (%): la segunda vez % y hay % semanas adelantadas', v.placa, r2, n_ad;
    end if;

    raise exception 'PRUEBA_OK';
  exception when others then
    if sqlerrm <> 'PRUEBA_OK' then raise; end if;
    raise notice 'PRUEBA OK con % (deshecha): entregó las cinco cosas y la segunda vez no duplicó.', v.placa;
  end;
end
$prueba$;

select public.registrar_migracion(193, '193_entrega_de_un_solo_golpe.sql',
  'La entrega de la moto de un solo golpe (activar_entrega): moto, contrato, asignación, cliente y semana adelantada, o nada');

commit;

-- ─── VERIFICACIÓN — la función existe y el contrato de prueba quedó como estaba ─────────────
select 'Función activar_entrega' as que, (count(*) = 1)::text as tiene, 'true' as debe_tener
  from pg_proc where proname = 'activar_entrega' and pronamespace = 'public'::regnamespace
union all
select 'Contratos en proceso con moto reservada (la prueba no los tocó)', count(*)::text, 'los mismos de antes'
  from public.contratos c join public.motos m on m.id = c.moto_id
 where c.estado = 'En proceso' and m.estado = 'Reservada';
