-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 204 — CANDADOS EN LA BASE (2ª tanda, D-054): RECEPCIÓN, ABONO A LA BASE, LIQUIDACIÓN Y DEUDA (23-oct-2026)
--
-- Sigue a la 203 (tiempo guardado y referencia). Mismo principio: el botón frena el toque rápido; la base
-- frena la segunda vez, la otra persona a la vez y el «no sé si se guardó, lo hago otra vez».
--
-- LO QUE SE MIDIÓ ANTES (23-oct, base viva), para que ningún candado frene algo legítimo:
--   · Recepción: mismas moto y motivo repetidos a los 1, 1, 6, 13 y 26 minutos (todas copias; la de RLT88H
--     cayó en el mismo minuto que su tiempo rodado dos veces). La siguiente legítima: 6 días después.
--     → se rechaza la misma moto con el mismo motivo dentro de 30 minutos.
--   · Abono a la base: nunca hubo dos iguales del mismo cliente. → mismo cliente, tipo y valor en 10 min.
--   · Liquidación: ningún contrato tiene hoy dos abiertas (la pantalla ya lo pregunta, pero dos personas a
--     la vez pasaban). → no se abre una segunda mientras haya otra que no esté cerrada ni anulada.
--   · Deuda: las dos deudas iguales (contrato, concepto, valor) más cercanas que existen están a 4 h 26 min
--     (dos multas de recolección del mismo día). → mismo contrato, concepto y valor dentro de 10 minutos.
--
-- LO QUE NO FRENA: lo que una misma operación crea junta (una función que en un solo paso guarda dos filas
-- iguales). Solo se compara contra lo guardado en OTRA operación. Tampoco toca nada ya guardado.
-- ⚠️ La liquidación crea su orden de taller ANTES de guardarse: si alguien la intentara dos veces a la vez,
-- la segunda queda rechazada pero su orden de taller sí queda (se ve y se cierra en Taller). El molde del
-- botón (siguiente paso) evita que se llegue ahí.
--
-- LA PRUEBA VA ADENTRO: para cada candado se guarda una fila «de hace 1 minuto» y otra igual enseguida; la
-- segunda tiene que ser rechazada. Todo lo que la prueba guarda se deshace. Si un candado dejara pasar la
-- segunda, la migración entera se deshace sola.
--
-- CÓMO DESHACERLA:
--   drop trigger if exists trg_a0_recepcion_una_vez on public.recepciones_vehiculo;
--   drop trigger if exists trg_a0_abono_una_vez on public.abonos_base;
--   drop trigger if exists trg_a0_liquidacion_una_abierta on public.liquidaciones;
--   drop trigger if exists trg_a0_deuda_una_vez on public.deudas;
--   drop function if exists public.recepcion_una_vez(), public.abono_base_una_vez(),
--     public.liquidacion_una_abierta(), public.deuda_una_vez();
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

-- 1. RECEPCIÓN: la misma moto, el mismo motivo, una vez cada 30 minutos ─────────────────────
create or replace function public.recepcion_una_vez()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_ya record;
begin
  perform pg_advisory_xact_lock(hashtext('recepcion:' || new.moto_id::text));
  select r.created_at, coalesce(p.nombre, 'otra persona') as quien
    into v_ya
    from public.recepciones_vehiculo r
    left join public.profiles p on p.id = r.quien_recibe
   where r.moto_id = new.moto_id
     and r.motivo is not distinct from new.motivo
     and r.created_at > now() - interval '30 minutes'
     and r.created_at is distinct from now()      -- lo de esta misma operación no cuenta
   order by r.created_at desc
   limit 1;
  if found then
    raise exception 'Esa moto ya se recibió por el mismo motivo hace % minutos (%, a las %). No se guardó otra vez.',
      greatest(1, round(extract(epoch from (now() - v_ya.created_at)) / 60)),
      upper(v_ya.quien),
      to_char(v_ya.created_at at time zone 'America/Bogota', 'HH12:MI am');
  end if;
  return new;
end $$;

drop trigger if exists trg_a0_recepcion_una_vez on public.recepciones_vehiculo;
create trigger trg_a0_recepcion_una_vez
  before insert on public.recepciones_vehiculo
  for each row execute function public.recepcion_una_vez();

-- 2. ABONO A LA BASE: mismo cliente, tipo y valor, una vez cada 10 minutos ──────────────────
create or replace function public.abono_base_una_vez()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_ya record;
begin
  perform pg_advisory_xact_lock(hashtext('abono_base:' || new.cliente_id::text));
  select a.created_at, coalesce(p.nombre, 'otra persona') as quien
    into v_ya
    from public.abonos_base a
    left join public.profiles p on p.id = a.registrado_por
   where a.cliente_id = new.cliente_id
     and a.tipo is not distinct from new.tipo
     and a.monto = new.monto
     and a.created_at > now() - interval '10 minutes'
     and a.created_at is distinct from now()
   order by a.created_at desc
   limit 1;
  if found then
    raise exception 'Ese abono de $% ya se registró hace % minutos (%). No se guardó otra vez. Si de verdad son dos, espere unos minutos y vuelva a registrarlo.',
      replace(to_char(new.monto, 'FM999,999,999'), ',', '.'),
      greatest(1, round(extract(epoch from (now() - v_ya.created_at)) / 60)),
      upper(v_ya.quien);
  end if;
  return new;
end $$;

drop trigger if exists trg_a0_abono_una_vez on public.abonos_base;
create trigger trg_a0_abono_una_vez
  before insert on public.abonos_base
  for each row execute function public.abono_base_una_vez();

-- 3. LIQUIDACIÓN: una sola abierta por contrato ────────────────────────────────────────────
create or replace function public.liquidacion_una_abierta()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_ya record;
begin
  if new.estado in ('cerrada', 'anulada') then return new; end if;
  perform 1 from public.contratos where id = new.contrato_id for update;
  select l.numero, l.estado
    into v_ya
    from public.liquidaciones l
   where l.contrato_id = new.contrato_id
     and l.estado not in ('cerrada', 'anulada')
     and l.created_at is distinct from now()
   order by l.created_at
   limit 1;
  if found then
    raise exception 'Ya existe una liquidación en curso para este contrato (% — %). No se abrió otra: continúela en el módulo de Liquidaciones.',
      coalesce(v_ya.numero, 'sin número'), v_ya.estado;
  end if;
  return new;
end $$;

drop trigger if exists trg_a0_liquidacion_una_abierta on public.liquidaciones;
create trigger trg_a0_liquidacion_una_abierta
  before insert on public.liquidaciones
  for each row execute function public.liquidacion_una_abierta();

-- 4. DEUDA: mismo contrato, concepto y valor, una vez cada 10 minutos ───────────────────────
create or replace function public.deuda_una_vez()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_ya record;
begin
  if new.contrato_id is null then return new; end if;
  perform 1 from public.contratos where id = new.contrato_id for update;
  select d.created_at, coalesce(p.nombre, 'otra persona') as quien
    into v_ya
    from public.deudas d
    left join public.profiles p on p.id = d.registrado_por
   where d.contrato_id = new.contrato_id
     and d.concepto is not distinct from new.concepto
     and d.monto = new.monto
     and d.created_at > now() - interval '10 minutes'
     and d.created_at is distinct from now()
   order by d.created_at desc
   limit 1;
  if found then
    raise exception 'Esa deuda ($% de %) ya se registró hace % minutos (%). No se guardó otra vez. Si de verdad son dos, espere unos minutos y vuelva a registrarla.',
      replace(to_char(new.monto, 'FM999,999,999'), ',', '.'), replace(new.concepto::text, '_', ' '),
      greatest(1, round(extract(epoch from (now() - v_ya.created_at)) / 60)),
      upper(v_ya.quien);
  end if;
  return new;
end $$;

drop trigger if exists trg_a0_deuda_una_vez on public.deudas;
create trigger trg_a0_deuda_una_vez
  before insert on public.deudas
  for each row execute function public.deuda_una_vez();

-- 5. LA PRUEBA (todo lo que guarda se deshace) ─────────────────────────────────────────────
do $$
declare
  v_msg text;
  v_liq uuid;
begin
  -- a) Recepción: la última que existe, copiada «hace 1 minuto» y otra vez ahora.
  begin
    insert into public.recepciones_vehiculo
      (moto_id, contrato_id, cliente_id, motivo, condicion_general, ubicacion_destino, quien_recibe, created_at)
    select moto_id, contrato_id, cliente_id, motivo, condicion_general, ubicacion_destino, quien_recibe, now() - interval '1 minute'
      from public.recepciones_vehiculo order by created_at desc limit 1;
    insert into public.recepciones_vehiculo
      (moto_id, contrato_id, cliente_id, motivo, condicion_general, ubicacion_destino, quien_recibe)
    select moto_id, contrato_id, cliente_id, motivo, condicion_general, ubicacion_destino, quien_recibe
      from public.recepciones_vehiculo order by created_at desc limit 1;
    raise exception 'FALLO-PRUEBA: dejó guardar dos veces la recepción';
  exception when others then
    v_msg := sqlerrm;
    if v_msg like 'FALLO-PRUEBA%' then raise; end if;
    if v_msg not like 'Esa moto ya se recibió%' then raise exception 'FALLO-PRUEBA (recepción): otro error: %', v_msg; end if;
    raise notice 'OK recepción: %', v_msg;
  end;

  -- b) Abono a la base.
  begin
    insert into public.abonos_base (cliente_id, contrato_id, tipo, monto, metodo, cuenta_id, grupo, fecha, fecha_registro, registrado_por, nota, created_at)
    select cliente_id, contrato_id, tipo, monto, metodo, cuenta_id, grupo, fecha, fecha_registro, registrado_por, 'PRUEBA 204', now() - interval '1 minute'
      from public.abonos_base where tipo = 'abono' order by created_at desc limit 1;
    insert into public.abonos_base (cliente_id, contrato_id, tipo, monto, metodo, cuenta_id, grupo, fecha, fecha_registro, registrado_por, nota)
    select cliente_id, contrato_id, tipo, monto, metodo, cuenta_id, grupo, fecha, fecha_registro, registrado_por, 'PRUEBA 204'
      from public.abonos_base where nota = 'PRUEBA 204' limit 1;
    raise exception 'FALLO-PRUEBA: dejó guardar dos veces el abono';
  exception when others then
    v_msg := sqlerrm;
    if v_msg like 'FALLO-PRUEBA%' then raise; end if;
    if v_msg not like 'Ese abono de%' then raise exception 'FALLO-PRUEBA (abono): otro error: %', v_msg; end if;
    raise notice 'OK abono: %', v_msg;
  end;

  -- c) Liquidación: una segunda sobre un contrato que ya tiene una abierta.
  begin
    select id into v_liq from public.liquidaciones where estado not in ('cerrada', 'anulada') order by created_at limit 1;
    if v_liq is null then raise exception 'FALLO-PRUEBA (liquidación): no hay ninguna abierta para probar'; end if;
    insert into public.liquidaciones (numero, contrato_id, cliente_id, moto_id, motivo, estado)
    select 'LIQ-PRUEBA-204', contrato_id, cliente_id, moto_id, motivo, estado from public.liquidaciones where id = v_liq;
    raise exception 'FALLO-PRUEBA: dejó abrir dos liquidaciones';
  exception when others then
    v_msg := sqlerrm;
    if v_msg like 'FALLO-PRUEBA%' then raise; end if;
    if v_msg not like 'Ya existe una liquidación en curso%' then raise exception 'FALLO-PRUEBA (liquidación): otro error: %', v_msg; end if;
    raise notice 'OK liquidación: %', v_msg;
  end;

  -- d) Deuda: «otro» de $1 a un contrato activo, «hace 1 minuto» y otra vez ahora.
  begin
    insert into public.deudas (contrato_id, concepto, descripcion, monto, monto_pendiente, estado, fecha, created_at)
    select id, 'otro', 'PRUEBA 204', 1, 1, 'pendiente', current_date, now() - interval '1 minute'
      from public.contratos where estado = 'Activo' order by created_at limit 1;
    insert into public.deudas (contrato_id, concepto, descripcion, monto, monto_pendiente, estado, fecha)
    select contrato_id, 'otro', 'PRUEBA 204', 1, 1, 'pendiente', current_date
      from public.deudas where descripcion = 'PRUEBA 204' limit 1;
    raise exception 'FALLO-PRUEBA: dejó guardar dos veces la deuda';
  exception when others then
    v_msg := sqlerrm;
    if v_msg like 'FALLO-PRUEBA%' then raise; end if;
    if v_msg not like 'Esa deuda%' then raise exception 'FALLO-PRUEBA (deuda): otro error: %', v_msg; end if;
    raise notice 'OK deuda: %', v_msg;
  end;
end $$;

select public.registrar_migracion(204, '204_candados_recepcion_abono_liquidacion_deuda.sql',
  'Candados en la base (2ª tanda): recepción (30 min), abono a la base (10 min), una liquidación abierta por contrato, deuda (10 min)');

commit;

-- VERIFICACIÓN: debe salir «PRUEBA OK» con los cuatro candados puestos y sin restos de la prueba.
select case when (select count(*) from pg_trigger
                   where tgname in ('trg_a0_recepcion_una_vez', 'trg_a0_abono_una_vez',
                                    'trg_a0_liquidacion_una_abierta', 'trg_a0_deuda_una_vez')
                     and not tgisinternal) = 4
             and not exists (select 1 from public.deudas where descripcion = 'PRUEBA 204')
             and not exists (select 1 from public.abonos_base where nota = 'PRUEBA 204')
             and not exists (select 1 from public.liquidaciones where numero = 'LIQ-PRUEBA-204')
            then 'PRUEBA OK — los cuatro candados están puestos'
            else 'FALTA ALGO' end as resultado;
