-- ===== 070: devolver a los clientes el sobrante que se aplicó a una deuda ya financiada =====
--
-- CORRECCIÓN DE DATOS, no de código (el código se arregla en la mig 069).
--
-- Qué pasó: cuando un cliente con convenio pagaba de más, el reparto de la BD mandaba el
-- sobrante a su deuda de apertura — que está en estado 'en_convenio', es decir, YA financiada
-- dentro del convenio. La deuda bajaba pero el saldo del convenio no, así que al terminar las
-- cuotas del convenio el cliente habría pagado esa plata DOS VECES.
--
-- Es un error del sistema, no del cliente, y hay convenios FIRMADOS con un saldo escrito:
-- cobrar por encima de eso es indefendible. Esta migración deja a cada cliente como habría
-- quedado si el reparto hubiera funcionado bien desde el principio.
--
-- Qué hace, por cada pago mal repartido (posterior a la firma del convenio):
--   1) mueve el monto de `aplicado_deuda` a `aplicado_convenio` (tope: el saldo del convenio),
--   2) devuelve ese monto a `deudas.monto_pendiente` (y si había quedado 'pagada' la regresa
--      a 'en_convenio': nunca estuvo pagada de verdad, estaba financiada),
--   3) recalcula `convenios.cuotas_pagadas`,
--   4) deja constancia en `contratos_auditoria` (respaldo legal de la corrección).
--
-- NO toca a quien tenga una deuda 'pendiente' creada DESPUÉS del convenio (ej. una multa
-- nueva): ahí el abono directo pudo ser legítimo y se revisa caso por caso.
-- Es idempotente: al no quedar `aplicado_deuda` posterior al convenio, una segunda corrida
-- no encuentra nada que mover.

do $$
declare
  v_cv        record;
  v_pg        record;
  v_d         record;
  v_abonado   numeric;
  v_margen    numeric;
  v_mueve     numeric;
  v_resto     numeric;
  v_total_cv  numeric;
  v_contratos int := 0;
  v_plata     numeric := 0;
begin
  for v_cv in
    select c.* from public.convenios c
     where c.estado = 'activo'
       -- se excluye a quien tenga deuda EXIGIBLE creada después del convenio (abono legítimo)
       and not exists (
         select 1 from public.deudas d
          where d.contrato_id = c.contrato_id
            and d.estado = 'pendiente'
            and d.created_at >= c.created_at
       )
  loop
    -- Saldo del convenio hoy = total pactado − lo ya abonado al convenio
    select coalesce(sum(aplicado_convenio), 0) into v_abonado
      from public.pagos
     where contrato_id = v_cv.contrato_id and estado = 'Confirmado'
       and created_at >= v_cv.created_at;
    v_margen := greatest(coalesce(v_cv.deuda_total, 0) - v_abonado, 0);
    v_total_cv := 0;

    for v_pg in
      select id, valor, fecha, aplicado_deuda
        from public.pagos
       where contrato_id = v_cv.contrato_id and estado = 'Confirmado'
         and created_at >= v_cv.created_at
         and coalesce(aplicado_deuda, 0) > 0
       order by created_at
    loop
      exit when v_margen <= 0;
      v_mueve := least(v_pg.aplicado_deuda, v_margen);

      update public.pagos
         set aplicado_deuda   = aplicado_deuda - v_mueve,
             aplicado_convenio = coalesce(aplicado_convenio, 0) + v_mueve
       where id = v_pg.id;

      -- Devolver el monto a la(s) deuda(s) del contrato, de la más reciente a la más antigua
      -- (inverso a como se aplicó), sin pasar del monto original de cada una.
      v_resto := v_mueve;
      for v_d in
        select id, monto, monto_pendiente, estado
          from public.deudas
         where contrato_id = v_cv.contrato_id and monto_pendiente < monto
         order by created_at desc
      loop
        exit when v_resto <= 0;
        update public.deudas
           set monto_pendiente = monto_pendiente + least(v_resto, monto - monto_pendiente),
               -- si había quedado 'pagada' por este abono, vuelve a estar financiada
               estado = case when estado = 'pagada' then 'en_convenio' else estado end
         where id = v_d.id;
        v_resto := v_resto - least(v_resto, v_d.monto - v_d.monto_pendiente);
      end loop;

      v_margen   := v_margen - v_mueve;
      v_total_cv := v_total_cv + v_mueve;
    end loop;

    if v_total_cv > 0 then
      -- Recalcular cuántas cuotas del convenio quedan cubiertas con lo abonado
      select coalesce(sum(aplicado_convenio), 0) into v_abonado
        from public.pagos
       where contrato_id = v_cv.contrato_id and estado = 'Confirmado'
         and created_at >= v_cv.created_at;

      update public.convenios
         set cuotas_pagadas = least(
               floor(v_abonado / nullif(v_cv.cuota_por_periodo, 0))::int,
               v_cv.numero_cuotas)
       where id = v_cv.id;

      -- Rastro legal de la corrección
      insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por)
      values (
        v_cv.contrato_id,
        'correccion_sobrante_convenio (mig 070)',
        'saldo convenio $' || to_char(greatest(coalesce(v_cv.deuda_total,0) - (v_abonado - v_total_cv), 0), 'FM999G999G999'),
        'saldo convenio $' || to_char(greatest(coalesce(v_cv.deuda_total,0) - v_abonado, 0), 'FM999G999G999')
          || ' — se acreditaron $' || to_char(v_total_cv, 'FM999G999G999')
          || ' que el sistema había aplicado por error a la deuda ya financiada en este convenio',
        null
      );

      v_contratos := v_contratos + 1;
      v_plata := v_plata + v_total_cv;
    end if;
  end loop;

  raise notice '070: % contratos corregidos, $% acreditados al convenio.', v_contratos, v_plata;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CHEQUEO PERIÓDICO (correr cuando se quiera; no cambia nada)
-- Detecta si a algún cliente con convenio activo se le volvió a abonar el sobrante a una
-- deuda ya financiada. Debe devolver CERO filas. Si devuelve algo, el reparto se rompió otra
-- vez y hay clientes pagando dos veces lo mismo.
--
-- select m.placa, cl.nombre, sum(p.aplicado_deuda) as plata_mal_aplicada
--   from public.pagos p
--   join public.convenios cv on cv.contrato_id = p.contrato_id and cv.estado = 'activo'
--   join public.contratos ct on ct.id = p.contrato_id
--   left join public.motos m on m.id = ct.moto_id
--   left join public.clientes cl on cl.id = ct.cliente_id
--  where p.estado = 'Confirmado'
--    and p.created_at >= cv.created_at
--    and coalesce(p.aplicado_deuda, 0) > 0
--    and not exists (select 1 from public.deudas d
--                     where d.contrato_id = p.contrato_id
--                       and d.estado = 'pendiente' and d.created_at >= cv.created_at)
--  group by m.placa, cl.nombre
--  order by 3 desc;
