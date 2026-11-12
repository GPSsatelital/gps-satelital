-- ===== 222: ninguna moto se entrega si la liquidación del cliente anterior no está cerrada (D-086; en la base quedó anotada como D-077) =====
-- Pedido del dueño (11-nov-2026): «que no deje entregar una moto sin haber liquidado el contrato que
-- tenía antes». Cerrada con firma o sin ella (el cierre sin firma existe desde la mig 148), y sin
-- excepciones: nadie se salta el candado.
--
-- Medido el 11-nov: de 64 entregas desde el 11-sep de motos que ya habían tenido otro cliente, solo 22
-- se hicieron con la liquidación anterior cerrada. Lo que demora es la cuenta en la oficina, no la
-- firma. Y cuando se liquidaba el contrato viejo de una moto que ya tenía otro cliente, la moto salía
-- «en el taller» andando en la calle (YAL65H).
--
-- Lo que hace (no reescribe ninguna función que ya exista):
--   1. public.motivo_moto_sin_liquidar(moto): la única revisión en la base de si una moto se puede
--      entregar. Devuelve la razón en palabras, o null si está libre. Cuentan como cliente anterior:
--        a) una liquidación de esa moto que no esté cerrada ni anulada;
--        b) un contrato Suspendido sin liquidación cerrada (cliente con la moto retenida, sin liquidar);
--        c) un contrato Cancelado o Finalizado con pagos y sin liquidación cerrada.
--      No cuentan los contratos que nunca recibieron un pago y no tienen liquidación.
--   2. public.motos_sin_liquidar: las motos Disponibles que hoy no se pueden entregar, con su razón.
--      La lee el paso 2 del contrato nuevo para mostrar el 🔒. Es security_invoker: cada quien ve solo
--      las motos que ya puede ver.
--   3. El candado trg_entregar_solo_liquidada, BEFORE UPDATE en motos: frena el paso a 'Reservada'.
--      Solo el paso 2 del contrato deja una moto Reservada, y la entrega del paso 6 (mig 193) exige
--      que esté Reservada: por eso no hace falta tocar la entrega. NO frena 'Asignada' a propósito:
--      eso lo hacen la devolución de la prestada y «Entregar moto al cliente», que son del mismo
--      cliente, y una moto que ya rueda con otro no debe trabarse por la cuenta vieja de otro.
--   4. trg_liquidacion_cierra_su_revision, AFTER UPDATE en liquidaciones: cuando una liquidación pasa
--      a cerrada, cierra la orden «Revisión por liquidación» que ella abrió (taller_id), si sigue
--      abierta. No toca la moto: de eso se encarga cerrar_liquidacion, como siempre. Así no vuelven
--      las 21 órdenes que se cerraron a mano el 11-nov.
--
-- Al correrla: hoy frena 2 de las 45 Disponibles (RLZ98H, LIQ-0039 en taller; YAL58H, LIQ-0103
-- calculada). Las motos que ya ruedan con un cliente no cambian en nada.

begin;

-- ── 1) LA REVISIÓN ───────────────────────────────────────────────────────────────────────────
-- security definer: tiene que ver TODAS las liquidaciones y contratos de la moto. Si corriera con los
-- permisos de quien reserva, una regla de RLS que le escondiera la liquidación lo dejaría pasar.
create or replace function public.motivo_moto_sin_liquidar(p_moto_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    -- a) Liquidación abierta. Se busca por la moto de la liquidación y por la del contrato: durante un
    --    préstamo el contrato apunta a la prestada, y la liquidación guarda la propia.
    (select case when l.motivo = 'cumplimiento'
                 then 'La liquidación ' || coalesce(l.numero, 'sin número')
                      || ' es por cumplimiento: esta moto va a quedar del cliente anterior.'
                 else 'La liquidación ' || coalesce(l.numero, 'sin número')
                      || ' del cliente anterior no está cerrada.'
            end
       from public.liquidaciones l
       left join public.contratos c on c.id = l.contrato_id
      where (l.moto_id = p_moto_id or c.moto_id = p_moto_id)
        and l.estado not in ('cerrada', 'anulada')
      order by l.created_at
      limit 1),
    -- b) Cliente con la moto retenida y sin liquidar.
    (select 'El contrato del cliente anterior está suspendido y no se ha liquidado.'
       from public.contratos c
      where c.moto_id = p_moto_id
        and c.estado = 'Suspendido'
        and not exists (select 1 from public.liquidaciones l
                         where l.contrato_id = c.id and l.estado = 'cerrada')
      limit 1),
    -- c) Contrato terminado que tuvo plata y nunca se liquidó.
    (select 'El contrato del cliente anterior recibió pagos y nunca se liquidó.'
       from public.contratos c
      where c.moto_id = p_moto_id
        and c.estado in ('Cancelado', 'Finalizado')
        and exists (select 1 from public.pagos p
                     where p.contrato_id = c.id and p.estado is distinct from 'Rechazado')
        and not exists (select 1 from public.liquidaciones l
                         where l.contrato_id = c.id and l.estado = 'cerrada')
      limit 1)
  );
$$;

revoke execute on function public.motivo_moto_sin_liquidar(uuid) from public, anon;
grant execute on function public.motivo_moto_sin_liquidar(uuid) to authenticated;

-- ── 2) LO QUE LEE LA PANTALLA ────────────────────────────────────────────────────────────────
create or replace view public.motos_sin_liquidar
with (security_invoker = true) as
select m.id as moto_id, x.motivo
  from public.motos m
  cross join lateral (select public.motivo_moto_sin_liquidar(m.id) as motivo) x
 where m.estado = 'Disponible'
   and x.motivo is not null;

revoke all on public.motos_sin_liquidar from anon;
grant select on public.motos_sin_liquidar to authenticated;

-- ── 3) EL CANDADO DE LA RESERVA ──────────────────────────────────────────────────────────────
create or replace function public.entregar_solo_liquidada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_motivo text;
begin
  v_motivo := public.motivo_moto_sin_liquidar(new.id);
  if v_motivo is not null then
    raise exception 'No se puede entregar la moto %: % Primero hay que cerrar esa liquidación (se puede cerrar sin firma). No se guardó nada.',
      coalesce(new.placa, 'sin placa'), v_motivo;
  end if;
  return new;
end;
$$;

revoke execute on function public.entregar_solo_liquidada() from public, anon, authenticated;

drop trigger if exists trg_entregar_solo_liquidada on public.motos;
create trigger trg_entregar_solo_liquidada
  before update of estado on public.motos
  for each row
  when (new.estado = 'Reservada' and old.estado is distinct from 'Reservada')
  execute function public.entregar_solo_liquidada();

-- ── 4) CERRAR LA LIQUIDACIÓN CIERRA SU REVISIÓN ──────────────────────────────────────────────
create or replace function public.liquidacion_cierra_su_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hoy date := (now() at time zone 'America/Bogota')::date;
  v_nota text;
begin
  if new.taller_id is null then return null; end if;
  v_nota := '[' || to_char(v_hoy, 'DD/MM/YYYY') || '] Cerrada sola: se cerró la liquidación '
            || coalesce(new.numero, 'sin número') || '.';
  update public.taller t
     set estado_tecnico = 'Finalizado',
         fecha_salida = greatest(coalesce(t.fecha_ingreso, v_hoy), v_hoy),
         trabajo_realizado = case when coalesce(btrim(t.trabajo_realizado), '') = '' then v_nota
                                  else t.trabajo_realizado || E'\n' || v_nota end
   where t.id = new.taller_id
     and t.estado_tecnico is distinct from 'Finalizado';
  return null;
end;
$$;

revoke execute on function public.liquidacion_cierra_su_revision() from public, anon, authenticated;

drop trigger if exists trg_liquidacion_cierra_su_revision on public.liquidaciones;
create trigger trg_liquidacion_cierra_su_revision
  after update of estado on public.liquidaciones
  for each row
  when (new.estado = 'cerrada' and old.estado is distinct from 'cerrada')
  execute function public.liquidacion_cierra_su_revision();

-- ── 5) PRUEBA ANTES DE GUARDAR ───────────────────────────────────────────────────────────────
-- Cada prueba deshace lo que hizo (lanza un aviso propio y lo atrapa). Si algo no da lo esperado,
-- la migración entera se cancela y no queda nada.
do $prueba$
declare
  v_frenada uuid; v_libre uuid; v_liq_id uuid; v_taller_id uuid; v_estado text;
begin
  select moto_id into v_frenada from public.motos_sin_liquidar limit 1;
  select m.id into v_libre from public.motos m
   where m.estado = 'Disponible' and public.motivo_moto_sin_liquidar(m.id) is null limit 1;

  -- a) Una moto con la cuenta vieja abierta NO se puede reservar.
  if v_frenada is not null then
    begin
      update public.motos set estado = 'Reservada' where id = v_frenada;
      raise exception 'PRUEBA_NO_FRENO';
    exception when others then
      if sqlerrm = 'PRUEBA_NO_FRENO' then
        raise exception 'El candado NO frenó una moto con la liquidación anterior abierta. No se guardó nada.';
      elsif sqlerrm not like 'No se puede entregar la moto%' then
        raise exception 'La prueba del candado falló por otra razón: %. No se guardó nada.', sqlerrm;
      end if;
    end;
  end if;

  -- b) Una moto libre SÍ se puede reservar (y se deshace).
  if v_libre is not null then
    begin
      update public.motos set estado = 'Reservada' where id = v_libre;
      raise exception 'PRUEBA_PASO';
    exception when others then
      if sqlerrm <> 'PRUEBA_PASO' then
        raise exception 'El candado frenó una moto libre: %. No se guardó nada.', sqlerrm;
      end if;
    end;
  end if;

  -- c) Cerrar una liquidación cierra su orden de revisión (y se deshace). Solo si hay con qué probar.
  select l.id, l.taller_id into v_liq_id, v_taller_id
    from public.liquidaciones l join public.taller t on t.id = l.taller_id
   where l.estado not in ('cerrada', 'anulada') and l.motivo is distinct from 'cumplimiento'
     and t.estado_tecnico is distinct from 'Finalizado'
   limit 1;
  if v_liq_id is not null then
    begin
      update public.liquidaciones set estado = 'cerrada' where id = v_liq_id;
      select estado_tecnico into v_estado from public.taller where id = v_taller_id;
      raise exception 'PRUEBA_ORDEN:%', v_estado;
    exception when others then
      if sqlerrm like 'PRUEBA_ORDEN:%' and sqlerrm <> 'PRUEBA_ORDEN:Finalizado' then
        raise exception 'Cerrar la liquidación no cerró su orden de taller (%). No se guardó nada.', sqlerrm;
      end if;
      -- Si otro candado impidió cerrarla en la prueba, no se puede probar acá: se prueba con el primer cierre real.
    end;
  end if;
end
$prueba$;

select public.registrar_migracion(222, '222_entregar_solo_con_liquidacion_cerrada.sql',
  'Ninguna moto se entrega si la liquidación del cliente anterior no está cerrada, y cerrar una liquidación cierra su orden de revisión del taller (D-077)');

commit;

-- Debe dar: candado 1 · cierre_revision 1 · frenadas 2 · placas RLZ98H, YAL58H (medido el 11-nov;
-- cambia si la oficina cierra alguna de esas dos liquidaciones antes de correrla)
select
  (select count(*) from pg_trigger
    where tgrelid = 'public.motos'::regclass and tgname = 'trg_entregar_solo_liquidada') as candado,
  (select count(*) from pg_trigger
    where tgrelid = 'public.liquidaciones'::regclass and tgname = 'trg_liquidacion_cierra_su_revision') as cierre_revision,
  (select count(*) from public.motos_sin_liquidar) as frenadas,
  (select string_agg(m.placa || ' — ' || s.motivo, ' · ' order by m.placa)
     from public.motos_sin_liquidar s join public.motos m on m.id = s.moto_id) as placas;
