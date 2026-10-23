-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 203 — CANDADOS EN LA BASE: EL TIEMPO GUARDADO Y LA REFERENCIA DE TRANSFERENCIA (23-oct-2026)
--        (pedido del dueño el 10-oct: «que las peticiones no se envíen dos veces»; escogió «1» el 23-oct)
--
-- LO QUE SE MIDIÓ ANTES (23-oct, base viva):
--   · `acuerdos_tiempo_rodado`: 9 contratos con la MISMA decisión (mismo contrato, mismas fechas) guardada
--     2 o 3 veces, con 1 segundo a 4 minutos de diferencia. El botón ya se bloqueaba: no fue doble toque.
--     Fue volver a hacerlo (la moto seguía saliendo «por resolver») o DOS PERSONAS a la vez (KAREN
--     BENAVIDEZ: Carlos y Sergio en el mismo minuto; BRYAN BOCANEGRA: Fredy y Brandon). En JORGE BELLO
--     (RLT88H) y JESUS QUIÑONEZ (RMU62H) se rodaron las semanas DOS VECES. Solo la base lo frena.
--   · `pagos`: de 3.158 pagos con referencia, UNA sola referencia repetida: DAVID JOSUE BRAZON (RMU58H),
--     M13671846, $195.000 dos veces el 13-oct con 70 s (posterior al arreglo del 8-oct, mig 192, que pone
--     los pagos en fila pero no impide guardar dos veces la misma consignación). Nunca hubo un uso legítimo
--     de una referencia en dos pagos → se rechaza, como el saldo a favor (mig 160).
--
-- QUÉ HACE:
--   1. Antes de guardar una decisión de tiempo guardado, la base agarra el contrato (el segundo que llegue
--      espera al primero) y, si ese contrato ya tiene una decisión con las MISMAS fechas, la rechaza
--      diciendo quién y cuándo la tomó. Cambiar una decisión ya tomada queda para un administrador.
--   2. Antes de guardar un pago con referencia (o de cambiársela, o de sacarlo de «Rechazado»), la base
--      agarra esa referencia y, si otro pago no rechazado ya la tiene, lo rechaza diciendo de quién es.
--      La comparación ignora mayúsculas y espacios. Las referencias vacías o de puros ceros no cuentan.
--
-- QUÉ NO TOCA: nada de lo que ya está guardado (las copias que existen se resuelven aparte, con la
-- oficina), ni el motor de reparto, ni el candado de la 192. El pago rechazado se puede volver a registrar.
--
-- LA PRUEBA VA ADENTRO: al final se intenta repetir una decisión real (JORGE BELLO) y la referencia real de
-- BRAZON; si la base dejara pasar cualquiera de las dos, la migración entera se deshace sola.
--
-- CÓMO DESHACERLA:
--   drop trigger if exists trg_a0_tiempo_una_vez on public.acuerdos_tiempo_rodado;
--   drop trigger if exists trg_a0_referencia_una_vez on public.pagos;
--   drop function if exists public.tiempo_guardado_una_vez(); drop function if exists public.referencia_una_vez();
--   drop index if exists public.idx_pagos_referencia_norm;
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

-- 1. EL TIEMPO GUARDADO SE RESUELVE UNA SOLA VEZ ─────────────────────────────────────────────
create or replace function public.tiempo_guardado_una_vez()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_ya record;
begin
  -- Dos personas a la vez: la segunda espera aquí hasta que la primera termine, y entonces ya la ve.
  perform 1 from public.contratos where id = new.contrato_id for update;

  select a.created_at, a.decision, coalesce(p.nombre, 'otra persona') as quien
    into v_ya
    from public.acuerdos_tiempo_rodado a
    left join public.profiles p on p.id = a.creado_por
   where a.contrato_id = new.contrato_id
     and a.fecha_entrada is not distinct from new.fecha_entrada
     and a.fecha_salida  is not distinct from new.fecha_salida
   order by a.created_at
   limit 1;

  if found then
    raise exception 'Ese tiempo guardado ya se resolvió: % lo dejó en «%» el %. No se guardó otra vez. Si hay que cambiar la decisión, pídaselo a un administrador.',
      upper(v_ya.quien),
      case v_ya.decision when 'rodar_al_final' then 'rodar al final' when 'cobrar_ahora' then 'cobrar' else v_ya.decision end,
      to_char(v_ya.created_at at time zone 'America/Bogota', 'DD/MM/YYYY "a las" HH12:MI am');
  end if;
  return new;
end $$;

drop trigger if exists trg_a0_tiempo_una_vez on public.acuerdos_tiempo_rodado;
create trigger trg_a0_tiempo_una_vez
  before insert on public.acuerdos_tiempo_rodado
  for each row execute function public.tiempo_guardado_una_vez();

-- 2. UNA REFERENCIA DE TRANSFERENCIA, UN SOLO PAGO ──────────────────────────────────────────
create index if not exists idx_pagos_referencia_norm
  on public.pagos (upper(btrim(referencia))) where referencia is not null;

create or replace function public.referencia_una_vez()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_ref text;
  v_ya  record;
begin
  if new.referencia is null or new.estado = 'Rechazado' then return new; end if;
  v_ref := upper(btrim(new.referencia));
  if v_ref = '' or v_ref ~ '^0+$' then return new; end if;
  -- En un cambio, solo se revisa si cambió la referencia o si el pago sale de «Rechazado»: confirmar,
  -- marcar «entregado a caja» o lo que escriba el motor no vuelve a preguntar.
  if tg_op = 'UPDATE' and old.referencia is not distinct from new.referencia and old.estado <> 'Rechazado' then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtext('pago_referencia:' || v_ref));

  select pg.valor, pg.fecha, pg.folio, coalesce(cl.nombre, 'otro cliente') as cliente
    into v_ya
    from public.pagos pg
    left join public.contratos ct on ct.id = pg.contrato_id
    left join public.clientes  cl on cl.id = ct.cliente_id
   where upper(btrim(pg.referencia)) = v_ref
     and pg.estado <> 'Rechazado'
     and pg.id <> new.id
   order by pg.created_at
   limit 1;

  if found then
    raise exception 'La referencia % ya está registrada: pago de $% de % del % (folio %). No se guardó otra vez. Si de verdad son dos consignaciones distintas, revise el número en el comprobante.',
      btrim(new.referencia), replace(to_char(v_ya.valor, 'FM999,999,999'), ',', '.'), upper(v_ya.cliente),
      to_char(v_ya.fecha, 'DD/MM/YYYY'), coalesce(v_ya.folio, 'sin folio');
  end if;
  return new;
end $$;

drop trigger if exists trg_a0_referencia_una_vez on public.pagos;
create trigger trg_a0_referencia_una_vez
  before insert or update of referencia, estado on public.pagos
  for each row execute function public.referencia_una_vez();

-- 3. LA PRUEBA (con datos reales; todo lo que intenta se deshace) ───────────────────────────
do $$
declare
  v_msg text;
begin
  -- a) Repetir la decisión de JORGE BELLO (RLT88H) del 2-oct.
  begin
    insert into public.acuerdos_tiempo_rodado
      (contrato_id, cliente_id, moto_id, dias_en_empresa, valor_por_dia, total_a_cobrar, decision, fecha_entrada, fecha_salida, creado_por)
    select a.contrato_id, a.cliente_id, a.moto_id, a.dias_en_empresa, a.valor_por_dia, a.total_a_cobrar, a.decision, a.fecha_entrada, a.fecha_salida, a.creado_por
      from public.acuerdos_tiempo_rodado a
      join public.motos m on m.id = a.moto_id
     where m.placa = 'RLT88H' and a.decision = 'rodar_al_final'
     limit 1;
    raise exception 'FALLO-PRUEBA: dejó guardar dos veces el tiempo de RLT88H';
  exception when others then
    v_msg := sqlerrm;
    if v_msg like 'FALLO-PRUEBA%' then raise; end if;
    if v_msg not like 'Ese tiempo guardado ya se resolvió%' then raise exception 'FALLO-PRUEBA (tiempo): otro error: %', v_msg; end if;
    raise notice 'OK tiempo: %', v_msg;
  end;

  -- b) Repetir la referencia M13671846 de BRAZON (RMU58H).
  begin
    insert into public.pagos (contrato_id, valor, metodo, estado, tipo_registro, referencia, fecha)
    select contrato_id, 1, 'Transferencia', 'Pendiente', 'transferencia', ' m13671846 ', current_date
      from public.pagos where referencia = 'M13671846' limit 1;
    raise exception 'FALLO-PRUEBA: dejó guardar dos veces la referencia M13671846';
  exception when others then
    v_msg := sqlerrm;
    if v_msg like 'FALLO-PRUEBA%' then raise; end if;
    if v_msg not like 'La referencia % ya está registrada%' then raise exception 'FALLO-PRUEBA (referencia): otro error: %', v_msg; end if;
    raise notice 'OK referencia: %', v_msg;
  end;
end $$;

select public.registrar_migracion(203, '203_candados_tiempo_y_referencia.sql',
  'Candados en la base: el tiempo guardado se resuelve una sola vez por contrato y fechas; una referencia de transferencia, un solo pago');

commit;

-- VERIFICACIÓN: debe salir «PRUEBA OK» con los dos candados puestos.
select case when count(*) = 2 then 'PRUEBA OK — los dos candados están puestos' else 'FALTA ALGO' end as resultado
  from pg_trigger
 where tgname in ('trg_a0_tiempo_una_vez', 'trg_a0_referencia_una_vez') and not tgisinternal;
