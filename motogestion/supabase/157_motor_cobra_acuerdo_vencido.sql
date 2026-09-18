-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 157 — EL MOTOR TAMBIÉN LE COBRA AL ACUERDO VENCIDO (17-sep-2026)
--
-- EL DEFECTO: `aplicar_pago_confirmado` se contradecía a sí misma.
--   · La mitad que REPARTE LA PLATA buscaba el acuerdo con `and estado = 'activo' limit 1`.
--     Si estaba 'incumplido' no lo encontraba, no le aplicaba nada, y la plata seguía de largo
--     hasta el saldo a favor.
--   · La mitad que ACTUALIZA EL ACUERDO, en cambio, sí incluye a los incumplidos
--     (`estado in ('activo','cumplido','incumplido')`) y los revive poniéndoles
--     `fecha_limite = current_date + cuotas_faltantes × días_del_período`.
--   O sea: lo resucitaba SIN DARLE UN PESO. A los pocos días volvía a vencer, y el cliente
--   quedaba girando en eso para siempre.
--
-- CASO REAL — BRAYAN (RLZ79H): acuerdo de UNA cuota de $65.000 con fecha límite el lunes 14-sep.
-- No pagó ese lunes; el martes quedó 'incumplido'. El 17 pagó $270.000 —debía $195.000 de semana
-- + $65.000 del acuerdo, LE SOBRABA— y el motor le cobró la semana, saltó el acuerdo y mandó
-- $75.000 a saldo a favor. Su acuerdo seguía diciendo 0 de 1.
-- Medido en la flota ese día: 7 acuerdos muertos, invisibles e incobrables, por $874.000.
--
-- 🔴 UN ACUERDO VENCIDO ES UNA DEUDA VENCIDA, NO UNA DEUDA PERDONADA.
-- La liquidación ya lo hacía bien (`cuentaLiquidacion.ts` cobra 'activo' e 'incumplido'). Esto no
-- inventa una regla: pone de acuerdo al motor con la parte del sistema que ya estaba bien.
--
-- ⚠️ EL ORDEN NO ES CAPRICHO. Un contrato PUEDE tener un incumplido viejo y un activo nuevo a la
-- vez: el candado de la mig 050 solo impide dos ACTIVOS. Sin `order by`, el `limit 1` podría
-- agarrar el muerto y la plata del cliente pagaría el acuerdo equivocado. Por eso: primero el
-- activo; si no hay, el incumplido MÁS VIEJO (FIFO, igual que las cajas y las deudas).
--
-- 🔑 SE PARCHA LA FUNCIÓN VIVA, NO SE REESCRIBE. Se lee con `pg_get_functiondef` y se reemplaza
-- solo el ancla. Es la lección de la mig 124: reescribirla copiando de un archivo viejo borró lo
-- que migraciones posteriores le habían agregado. Acá, todo lo que la 119/128/130/149 le pusieron
-- sigue intacto porque nunca se toca.
--
-- ESPEJO EN LA APP: `src/utils/convenioPorCobrar.ts` (`elegirConvenioPorCobrar`) hace la MISMA
-- elección, con el mismo orden, y tiene sus pruebas. Si se toca una, se toca la otra.
-- `repartoPago.ts` NO cambia: recibe el acuerdo ya elegido, no lo busca.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

do $mig$
declare
  v_src   text;
  v_ancla text := 'where contrato_id = v_row.contrato_id and estado = ''activo'' limit 1;';
  v_nuevo text := 'where contrato_id = v_row.contrato_id and estado in (''activo'', ''incumplido'')'
                  || ' order by case when estado = ''activo'' then 0 else 1 end, created_at limit 1;';
  v_n     int;
begin
  v_src := pg_get_functiondef('public.aplicar_pago_confirmado'::regproc);

  -- Ya aplicada: no hacer nada (se puede correr dos veces sin daño).
  if position(v_nuevo in v_src) > 0 then
    raise notice '157: ya estaba aplicada. No se tocó nada.';
    return;
  end if;

  -- El ancla tiene que aparecer EXACTAMENTE 2 veces: el reparto y su reverso (anular/borrar pago).
  -- Si no son 2, la función cambió desde que se escribió esto y hay que mirarla antes de tocarla.
  v_n := (length(v_src) - length(replace(v_src, v_ancla, ''))) / length(v_ancla);
  if v_n <> 2 then
    raise exception '157 ABORTADA: el ancla aparece % veces y se esperaban 2. NO se tocó nada.', v_n;
  end if;

  execute replace(v_src, v_ancla, v_nuevo);
  raise notice '157: motor parchado en las 2 puertas del reparto.';
end
$mig$;

-- ─── VERIFICACIÓN — debe dar: parchado = 1 · quedan_viejas = 0 ───────────────────────────────
select
  (select count(*) from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'aplicar_pago_confirmado'
      and p.prosrc like '%estado in (''activo'', ''incumplido'') order by%')      as parchado,
  (select count(*) from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'aplicar_pago_confirmado'
      and p.prosrc like '%and estado = ''activo'' limit 1%')                       as quedan_viejas;
