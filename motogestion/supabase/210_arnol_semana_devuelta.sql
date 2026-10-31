-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 210 — ARNOL ESPRIELLA (IEW93I): LA SEMANA QUE LE QUITÓ EL BORRADO DEL 8-OCT (31-oct-2026, D-060)
--        (aprobado por el dueño el 31-oct: «Sí, los 4», al revisar la nómina de CARLOS ARIZA)
--
-- LO QUE PASÓ: el 7-oct se registraron una transferencia de ARNOL ($248.000, del 2-oct) y un
-- efectivo ($248.000, del 7-oct). El efectivo quedó repetido por un doble toque y la copia se borró
-- el 8-oct. El motor había procesado las dos copias a la vez (antes del candado de la mig 192): el
-- contador de semanas subió una sola vez y, al borrar la copia, bajó una. ARNOL quedó con una semana
-- menos de las que pagó. Estaba en P0 esperando a que la oficina dijera si pagó una vez o dos.
--
-- LA PRUEBA de que pagó las dos: el comprobante de la transferencia es real (No. 0000032600, 2-oct
-- 1:00 p.m., $248.000 a Club Moteros de la Costa) y él paga una vez por semana, siempre (16-sep,
-- 22-sep, 2-oct, 7-oct, 15-oct, 22-oct, 29-oct). Lo que pagó para semanas suma $1.622.000 y su ahorro
-- trae 8 semanas ($214.000), pero el contador decía 7 semanas y $7.000 ($1.421.000): faltaban
-- $201.000, una semana.
--
-- QUÉ HACE (todo o nada, con guardas: si algo no está como se midió el 31-oct, no toca nada):
--   1. Corre un número las anotaciones de las semanas 5, 6 y 7 (pasan a 6, 7 y 8 con su fecha y su
--      pago) y anota la semana 5 como llenada el 7-oct con el efectivo de ese día.
--   2. Pone el contador en 8 semanas y $6.000 en la semana en curso (la 9, que se exige el 2-nov).
--      El vigía no anota nada nuevo: la semana 8 ya tiene su anotación.
--   3. Deja el rastro en la auditoría del contrato.
-- LO QUE NO CAMBIA: los pagos, el ahorro ($214.000), el acuerdo (cumplido), el saldo a favor ($0).
-- EFECTO: ARNOL deja de aparecer debiendo una semana. Nómina de CARLOS ARIZA: su moto pasa de $3.750
-- a $7.500 en las semanas del 12, 19 y 26-oct, y suma $7.500 en la del 5-oct (+$18.750).
--
-- CÓMO DESHACERLA: no se deshace; es la cuenta verdadera del cliente (igual que BRYAN y YERLIS, mig 192).
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

do $arnol$
declare
  v_c        constant uuid := '2e767664-95e2-4688-9105-e9df11a59c98';
  v_efectivo constant uuid := '8b22cd09-aee1-4d91-9dd8-9153143d3716';  -- CMP-261007-1559, $248.000, 7-oct
  n int;
begin
  if not exists (select 1 from public.contratos c
                   join public.motos m on m.id = c.moto_id
                   join public.clientes cl on cl.id = c.cliente_id
                  where c.id = v_c and m.placa = 'IEW93I' and cl.nombre ilike 'ARNOL ESPRIELLA%') then
    raise exception 'ARNOL: el contrato no es de IEW93I. No se toca nada.';
  end if;
  if not exists (select 1 from public.pagos
                  where id = v_efectivo and contrato_id = v_c and folio = 'CMP-261007-1559'
                    and valor = 248000 and estado = 'Confirmado') then
    raise exception 'ARNOL: no está el efectivo del 7-oct. No se toca nada.';
  end if;
  if not exists (select 1 from public.contratos where id = v_c and cajas_pagadas = 7 and caja_actual_pagado = 7000) then
    raise exception 'ARNOL: el contador ya no está en 7 semanas y $7.000 (¿ya se corrió?). No se toca nada.';
  end if;
  if (select count(*) from public.cajas_llenadas where contrato_id = v_c and caja_numero between 5 and 7) <> 3
     or exists (select 1 from public.cajas_llenadas where contrato_id = v_c and caja_numero >= 8) then
    raise exception 'ARNOL: las anotaciones de las semanas 5 a 8 no están como se midieron. No se toca nada.';
  end if;

  -- 1. Las anotaciones, de la última a la primera (hay una sola por semana: no pueden chocar).
  update public.cajas_llenadas set caja_numero = 8 where contrato_id = v_c and caja_numero = 7;
  update public.cajas_llenadas set caja_numero = 7 where contrato_id = v_c and caja_numero = 6;
  update public.cajas_llenadas set caja_numero = 6 where contrato_id = v_c and caja_numero = 5;
  insert into public.cajas_llenadas (contrato_id, caja_numero, fecha, fuente, pago_id, pago_deducido, created_at)
  values (v_c, 5, date '2026-10-07', 'pago', v_efectivo, true, timestamptz '2026-10-07 21:00:00.259675+00');

  -- 2. El contador.
  update public.contratos set cajas_pagadas = 8, caja_actual_pagado = 6000
   where id = v_c and cajas_pagadas = 7 and caja_actual_pagado = 7000;
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'ARNOL: no se pudo corregir el contador. No se toca nada.';
  end if;

  -- 3. El rastro.
  insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por)
  values (v_c, 'Semana devuelta',
          '7 semanas pagadas y $7.000 en curso',
          concat_ws(E'\n',
            '8 semanas pagadas y $6.000 en curso',
            'Motivo: el 8-oct se borró la copia repetida del efectivo del 7-oct (doble toque) y el borrado le restó una semana que sí pagó.',
            'Pagó dos veces: transferencia del 2-oct (comprobante 0000032600) y efectivo del 7-oct. Mig 210, 31-oct-2026.'),
          'a68f065b-3a59-4c67-bd2e-45c6abc30fdb'::uuid);
end
$arnol$;

select public.registrar_migracion(210, '210_arnol_semana_devuelta.sql',
  'ARNOL ESPRIELLA (IEW93I): la semana que le quitó el borrado del 8-oct');

commit;

-- ── VERIFICACIÓN (correr después) ──────────────────────────────────────────────────────────────
-- Debe dar: 8 · 6000 · ahorro 214000 · semanas 4 → 2026-10-07 · 5 → 2026-10-07 · 6 → 2026-10-15 ·
-- 7 → 2026-10-22 · 8 → 2026-10-29
select c.cajas_pagadas, c.caja_actual_pagado, c.ahorro_acumulado,
       (select string_agg(e.caja_numero || ' → ' || e.fecha, ' · ' order by e.caja_numero)
          from public.cajas_llenadas e
         where e.contrato_id = c.id and e.caja_numero >= 4) as semanas
  from public.contratos c
 where c.id = '2e767664-95e2-4688-9105-e9df11a59c98';
