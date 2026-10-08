-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 192 — LOS PAGOS DE UN MISMO CONTRATO SE PROCESAN EN FILA + LAS SEMANAS QUE SE PERDIERON
--        (8-oct-2026, dueño: "y porque dice que debe 202 si ha pagado todas sus tarifas normal?")
--        CORRIDA por el dueño el 8-oct-2026 a las 4:08 p.m. (registrar_migracion 192).
--
-- LO QUE PASÓ: la ventana de registrar pago de Cartera no se bloqueaba mientras guardaba un pago en
-- efectivo, así que un doble toque creaba DOS pagos iguales en el mismo segundo. El motor los
-- procesaba A LA VEZ: los dos leían el contrato antes de que el otro escribiera, el contador de
-- semanas subía una sola vez y el ahorro dos. Al borrar la copia, el motor restaba su semana → el
-- cliente perdía una semana que SÍ pagó.
--   · BRYAN BARBOZA (IGJ80I): pago del 6-oct → contador en 3, debía ser 4.
--   · YERLIS QUINTERO (XZN23H): pago de $450.000 del 5-oct → 32 con $170.000 en curso; debía ser
--     35 con $14.000 ($450.000 = $32.000 + 2 × $202.000 + $14.000).
--   · JONATAN PINEDA (IGA80I): doble toque el 8-oct; la copia quedó como saldo a favor de $202.000.
--   ARNOL ESPRIELLA (IEW93I), ANDRES PEREZ RUIZ, SAMIR LLAMAS y LUIS ANGEL BERMUDEZ quedan fuera a
--   propósito: la oficina dice si pagaron una vez o dos.
-- El candado de la pantalla (el otro lado del arreglo) está en el commit 97ba56d.
--
-- VERIFICADO después de correrla (8-oct): BRYAN 4 semanas y "Al día"; YERLIS 35 / $14.000 y debe
-- $592.000 (antes $1.042.000), 14 días en mora (antes 35); JONATAN 1 pago con ese folio, "Al día",
-- saldo a favor $0 y el rastro "Pago eliminado" en su historial.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   El candado: drop trigger if exists trg_a_pagos_en_fila on public.pagos;
--   Las correcciones de datos no se deshacen: son la cuenta verdadera de cada cliente.
-- ═══════════════════════════════════════════════════════════════════════════════════════════
begin;

-- 1. EL CANDADO: antes de guardar, cambiar o borrar un pago, la base "agarra" su contrato;
--    si llegan dos del mismo contrato a la vez, el segundo espera al primero. No toca el motor.
create or replace function public.pagos_en_fila()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_nuevo uuid;
  v_viejo uuid;
begin
  if tg_op = 'INSERT' then
    v_nuevo := new.contrato_id;
  elsif tg_op = 'UPDATE' then
    v_nuevo := new.contrato_id;
    v_viejo := old.contrato_id;
  else
    v_viejo := old.contrato_id;
  end if;
  perform 1 from public.contratos where id in (v_nuevo, v_viejo) order by id for update;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end; $$;

drop trigger if exists trg_a_pagos_en_fila on public.pagos;
create trigger trg_a_pagos_en_fila
  before insert or update or delete on public.pagos
  for each row execute function public.pagos_en_fila();

-- 2 y 3. LAS SEMANAS QUE SE PERDIERON (con guardas: si ya está corregido, no hace nada)
do $semanas$
declare
  v_bryan  constant uuid := '5a401d2e-e82a-4e3a-a9a2-27d7c3de42fa';
  v_yerlis constant uuid := '4c608eb2-7b20-45d9-87c2-a6f0bffd11e7';
  n int;
begin
  if not exists (select 1 from contratos c join motos m on m.id = c.moto_id join clientes cl on cl.id = c.cliente_id
                  where c.id = v_bryan and m.placa = 'IGJ80I' and cl.nombre ilike 'BRYAN MANUEL BARBOZA%') then
    raise exception 'BRYAN: el contrato no es de IGJ80I. No se toca nada.';
  end if;
  if not exists (select 1 from contratos c join motos m on m.id = c.moto_id join clientes cl on cl.id = c.cliente_id
                  where c.id = v_yerlis and m.placa = 'XZN23H' and cl.nombre ilike 'YERLIS ELENA QUINTERO%') then
    raise exception 'YERLIS: el contrato no es de XZN23H. No se toca nada.';
  end if;

  update public.contratos set cajas_pagadas = 4
   where id = v_bryan and cajas_pagadas = 3 and caja_actual_pagado = 0;
  get diagnostics n = row_count;
  if n = 1 then
    update public.cajas_llenadas set fecha = date '2026-10-06' where contrato_id = v_bryan and caja_numero = 4;
  end if;

  update public.contratos set cajas_pagadas = 35, caja_actual_pagado = 14000
   where id = v_yerlis and cajas_pagadas = 32 and caja_actual_pagado = 170000;
  get diagnostics n = row_count;
  if n = 1 then
    update public.cajas_llenadas set fecha = date '2026-10-05' where contrato_id = v_yerlis and caja_numero in (33, 34, 35);
  end if;
end
$semanas$;

-- 4. LA COPIA DE JONATAN, a nombre del dueño (el candado de borrar pagos, mig 048, exige quién borra)
select set_config('request.jwt.claim.sub', 'a68f065b-3a59-4c67-bd2e-45c6abc30fdb', true);
select set_config('request.jwt.claims', '{"sub":"a68f065b-3a59-4c67-bd2e-45c6abc30fdb","role":"authenticated"}', true);

insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por)
select p.contrato_id, 'Pago eliminado',
       concat_ws(E'\n', '$202.000 · ' || p.metodo || ' · ' || p.estado || ' · pagó ' || p.fecha,
                 'folio ' || p.folio, 'se había aplicado a: saldo a favor $202.000',
                 'Motivo: copia del mismo cobro (doble toque). Mig 192, 8-oct-2026.'),
       '(borrado)', 'a68f065b-3a59-4c67-bd2e-45c6abc30fdb'::uuid
  from public.pagos p
 where p.id = '3b87bf7a-1613-43e4-af71-f98cb9624ab2' and p.contrato_id = '759ab6e5-ea30-4fa7-8fd9-0551a0f65084'
   and p.folio = 'CMP-261008-1416' and p.aplicado_tarifa = 0 and p.aplicado_saldo_favor = 202000;

delete from public.pagos
 where id = '3b87bf7a-1613-43e4-af71-f98cb9624ab2' and contrato_id = '759ab6e5-ea30-4fa7-8fd9-0551a0f65084'
   and folio = 'CMP-261008-1416' and aplicado_tarifa = 0 and aplicado_saldo_favor = 202000;

select public.registrar_migracion(192, '192_pagos_en_fila_y_semanas_perdidas.sql',
  'Pagos del mismo contrato en fila (doble toque) + semanas perdidas de BRYAN y YERLIS + copia de JONATAN');

commit;

-- VERIFICACIÓN: en cada fila, "tiene" debe ser igual a "debe_tener"
select 'BRYAN (IGJ80I) · semanas' as que, cajas_pagadas::text as tiene, '4' as debe_tener
  from public.contratos where id = '5a401d2e-e82a-4e3a-a9a2-27d7c3de42fa'
union all
select 'YERLIS (XZN23H) · semanas / en curso', cajas_pagadas || ' / ' || caja_actual_pagado, '35 / 14000'
  from public.contratos where id = '4c608eb2-7b20-45d9-87c2-a6f0bffd11e7'
union all
select 'JONATAN (IGA80I) · pagos con ese folio', count(*)::text, '1'
  from public.pagos where contrato_id = '759ab6e5-ea30-4fa7-8fd9-0551a0f65084' and folio = 'CMP-261008-1416'
union all
select 'Candado puesto', (count(*) = 1)::text, 'true'
  from pg_trigger where tgrelid = 'public.pagos'::regclass and tgname = 'trg_a_pagos_en_fila';
