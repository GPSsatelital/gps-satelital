-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 171 — LA SEMANA Y SU CUOTA DEL ACUERDO SE COBRAN COMO UN CONJUNTO (D-022 · 24-sep-2026)
--
-- 🔴 EL PROBLEMA, MEDIDO. El motor llenaba TODAS las semanas vencidas primero y el acuerdo
-- recibía al final. Con una sola semana atrasada, el acuerdo no volvía a recibir un peso nunca.
-- El 24-sep: **31 clientes pagando y sus acuerdos en cero**. YAL68H pagó $1.664.000 en 10 pagos
-- desde julio; JOSE ENRIQUE (IEW50I) $1.116.000 en 8. Los primeros vencían el 12 y el 19 de
-- octubre, y al tercer acuerdo incumplido va liquidación obligatoria: se estaba castigando
-- justo al que sí paga.
--
-- LA DECISIÓN DEL DUEÑO, TEXTUAL: *"tomarlo como un conjunto para los que tienen convenio, ya que
-- es como si su tarifa cambiara… primero la semana y después el convenio, y si queda faltando algo
-- que se complete con el siguiente pago"*.
--
-- ── QUÉ CAMBIA, EN UNA LÍNEA ────────────────────────────────────────────────────────────────
-- La cuota del acuerdo se entrega DENTRO del recorrido de las semanas, justo detrás de cada
-- semana que queda completa — en vez de esperar al final de la fila.
--
--   Antes:  $250.000 → semana $250.000 · acuerdo $0     (y $48.000 adelantados a la otra semana)
--   Ahora:  $250.000 → semana $202.000 · acuerdo $48.000
--
-- 🔑 LO QUE **NO** CAMBIA — y esto es la mitad del trabajo:
--   · El FRENO de la mig 119: el acuerdo nunca recibe más de lo EXIGIDO a la fecha del pago.
--     Cambia CUÁNDO lo recibe, no cuánto.
--   · La VENTANA DE PREPAGO de la mig 149 (pasos 2b y 4b): intacta, ni una línea.
--   · El orden de las deudas (multa → lavada → antiguas): intacto.
--   · El prorrateo, el ahorro tarifa-primero, las reversas al rechazar o borrar: intactos.
--   · Sin acuerdo activo, un contrato reparte EXACTAMENTE igual que ayer.
--
-- 🔑 SE PARCHA LA FUNCIÓN **VIVA** con `pg_get_functiondef`, por anclas, y cada ancla se verifica
-- que aparezca **exactamente una vez**: si no, aborta sin tocar nada. Es la lección de la mig 124,
-- donde copié del archivo de una migración vieja y borré lo que otra le había agregado.
--
-- ── ESPEJO ──────────────────────────────────────────────────────────────────────────────────
-- El gemelo en TypeScript es `repartirPagoV2` (`src/utils/repartoPago.ts`), ya cambiado, con 47
-- pruebas. **Si se toca uno hay que tocar el otro**, o la pantalla dirá una cosa y el motor
-- cobrará otra.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
-- Volver a poner la función como estaba: correr el bloque de abajo AL REVÉS (cambiar cada
-- `v_nuevo` por `v_viejo`). Como el parche es por anclas y son reversibles, alcanza con invertir
-- los cuatro `replace`. No toca ningún dato: solo cambia cómo se reparten los pagos FUTUROS.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

-- ── FOTO ANTES (mig 170) ────────────────────────────────────────────────────────────────────
select public.tomar_foto_plata('antes-171') as contratos_fotografiados;

begin;

do $mig$
declare
  v_def text;
  v_n   int;

  -- (1) Una variable nueva para la cuota del acuerdo de UN período.
  a1 text := 'v_conv_exigido numeric; v_conv_abonado numeric; v_puede_conv numeric;';
  b1 text := 'v_conv_exigido numeric; v_conv_abonado numeric; v_puede_conv numeric;' || E'\r\n' ||
             '  v_cuota_conv numeric := 0;   -- D-022: la cuota del acuerdo de UN período';

  -- (2) Antes de recorrer las semanas, averiguar cuánto puede recibir el acuerdo y su cuota.
  -- Ancla de código puro (sin acentos ni símbolos): la línea que pide las semanas exigidas a la
  -- fecha REAL. La del paso 2b lleva `+ 3`, así que esta es única.
  a2 text := '        v_exigidas := public.cajas_exigidas(v_contrato, coalesce(v_row.fecha, current_date));';
  b2 text := '        -- ★ D-022 (24-sep-2026): ANTES de recorrer las semanas se averigua cuánto puede' || E'\r\n' ||
             '        --   recibir el acuerdo y cuánto vale UNA de sus cuotas, para poder entregarla' || E'\r\n' ||
             '        --   detrás de cada semana. El tope sigue siendo lo EXIGIDO (freno mig 119).' || E'\r\n' ||
             '        v_cuota_conv := 0; v_puede_conv := 0;' || E'\r\n' ||
             '        select * into v_convenio from public.convenios' || E'\r\n' ||
             '          where contrato_id = v_row.contrato_id and estado in (''activo'', ''incumplido'')' || E'\r\n' ||
             '          order by case when estado = ''activo'' then 0 else 1 end, created_at limit 1;' || E'\r\n' ||
             '        if v_convenio.id is not null then' || E'\r\n' ||
             '          select coalesce(sum(aplicado_convenio), 0) into v_abonado_total' || E'\r\n' ||
             '            from public.pagos' || E'\r\n' ||
             '            where contrato_id = v_row.contrato_id and estado = ''Confirmado''' || E'\r\n' ||
             '              and created_at >= v_convenio.created_at and id <> v_row.id;' || E'\r\n' ||
             '          v_pend_conv := greatest(coalesce(v_convenio.deuda_total, 0) - v_abonado_total, 0);' || E'\r\n' ||
             '          select * into v_conv_tipado from public.convenios where id = v_convenio.id;' || E'\r\n' ||
             '          v_conv_exigido := public.cuotas_convenio_exigidas(' || E'\r\n' ||
             '            v_contrato, v_conv_tipado, coalesce(v_row.fecha, current_date));' || E'\r\n' ||
             '          v_puede_conv := greatest(least(v_conv_exigido - v_abonado_total, v_pend_conv), 0);' || E'\r\n' ||
             '          v_cuota_conv := greatest(coalesce(v_convenio.cuota_por_periodo, 0), 0);' || E'\r\n' ||
             '        end if;' || E'\r\n' || E'\r\n' ||
             a2;

  -- (3) Dentro del recorrido: detrás de cada semana COMPLETA, su cuota del acuerdo.
  a3 text := '        end loop;' || E'\r\n' || E'\r\n' ||
             '        if v_monto > 0 then' || E'\r\n' ||
             '          v_resto := v_monto;';
  b3 text := '          -- ★ D-022: la cuota del acuerdo de ESE período, justo detrás de su semana.' || E'\r\n' ||
             '          --   Solo cuando la semana quedó COMPLETA (caja_actual_pagado vuelve a 0):' || E'\r\n' ||
             '          --   primero la semana, después el acuerdo. Si el pago no alcanzó, se arrastra.' || E'\r\n' ||
             '          if v_cuota_conv > 0 and v_monto > 0 and v_contrato.caja_actual_pagado = 0' || E'\r\n' ||
             '             and v_puede_conv - v_ap_conv > 0 then' || E'\r\n' ||
             '            v_delta := least(v_monto, v_cuota_conv, v_puede_conv - v_ap_conv);' || E'\r\n' ||
             '            v_ap_conv := v_ap_conv + v_delta;' || E'\r\n' ||
             '            v_monto := v_monto - v_delta;' || E'\r\n' ||
             '          end if;' || E'\r\n' ||
             a3;

  -- (4) El paso del acuerdo al final ya no arranca de cero: descuenta lo entregado arriba.
  a4 text := '            v_puede_conv := greatest(least(v_conv_exigido - v_abonado_total, v_pend_conv), 0);' || E'\r\n' ||
             '            v_ap_conv := least(v_monto, v_puede_conv);' || E'\r\n' ||
             '            v_monto := v_monto - v_ap_conv;';
  b4 text := '            v_puede_conv := greatest(least(v_conv_exigido - v_abonado_total, v_pend_conv), 0);' || E'\r\n' ||
             '            -- ★ D-022: descontar lo que ya se entregó período por período arriba,' || E'\r\n' ||
             '            --   para no contarlo dos veces. Acá se terminan de cubrir las cuotas' || E'\r\n' ||
             '            --   atrasadas acumuladas que el conjunto no alcanzó a tapar.' || E'\r\n' ||
             '            v_delta := least(v_monto, greatest(v_puede_conv - v_ap_conv, 0));' || E'\r\n' ||
             '            v_ap_conv := v_ap_conv + v_delta;' || E'\r\n' ||
             '            v_monto := v_monto - v_delta;';

begin
  v_def := pg_get_functiondef('public.aplicar_pago_confirmado()'::regprocedure);

  if position('D-022' in v_def) > 0 then
    raise notice '171: el motor ya estaba parchado. No se tocó.';
    return;
  end if;

  -- Cada ancla tiene que aparecer EXACTAMENTE una vez. Si alguna no, se aborta sin tocar nada:
  -- significa que la función viva no es la que creemos y el parche caería en el lugar equivocado.
  v_n := (length(v_def) - length(replace(v_def, a1, ''))) / length(a1);
  if v_n <> 1 then raise exception '171 ABORTADA: el ancla 1 (las variables) aparece % veces, debe ser 1. El motor NO se tocó.', v_n; end if;

  v_n := (length(v_def) - length(replace(v_def, a2, ''))) / length(a2);
  if v_n <> 1 then raise exception '171 ABORTADA: el ancla 2 (antes del recorrido de semanas) aparece % veces, debe ser 1. El motor NO se tocó.', v_n; end if;

  v_n := (length(v_def) - length(replace(v_def, a3, ''))) / length(a3);
  if v_n <> 1 then raise exception '171 ABORTADA: el ancla 3 (el final del recorrido) aparece % veces, debe ser 1. El motor NO se tocó.', v_n; end if;

  v_n := (length(v_def) - length(replace(v_def, a4, ''))) / length(a4);
  if v_n <> 1 then raise exception '171 ABORTADA: el ancla 4 (el freno del acuerdo) aparece % veces, debe ser 1. El motor NO se tocó.', v_n; end if;

  v_def := replace(v_def, a1, b1);
  v_def := replace(v_def, a2, b2);
  v_def := replace(v_def, a3, b3);
  v_def := replace(v_def, a4, b4);

  execute v_def;
  raise notice '171: el motor ya cobra la semana y su cuota del acuerdo como un conjunto.';
end
$mig$;

do $reg$ begin
  perform public.registrar_migracion(171, '171_conjunto_semana_y_acuerdo.sql',
    'La semana y la cuota del acuerdo se cobran como un conjunto (D-022)');
exception when undefined_function then
  raise notice 'Sin registro de migraciones (falta la 168).';
end $reg$;

commit;

-- ─── VERIFICACIÓN 1: la foto — que el parche no haya movido un peso de nadie ─────────────────
select public.tomar_foto_plata('despues-171');
select count(*) as pesos_movidos_esperado_cero from public.comparar_fotos('antes-171', 'despues-171');

-- ─── VERIFICACIÓN 2: un pago de verdad, y SE DESHACE ────────────────────────────────────────
-- Se registra un pago real de $250.000 a JOSE ENRIQUE (IEW50I), se mira cómo lo repartió el
-- motor, y se DESHACE con rollback: no queda ni rastro. Es la única forma de probar el motor
-- de verdad sin tocarle la plata a nadie.
begin;
  insert into public.pagos (contrato_id, valor, metodo, estado, tipo_registro, fecha, fecha_registro)
  values ('6768da1e-42f6-4eca-adfd-ef9869e1bda2', 250000, 'Efectivo', 'Confirmado', 'normal',
          current_date, current_date);

  select valor            as se_pago,
         aplicado_tarifa  as a_la_semana,
         aplicado_convenio as al_acuerdo,
         aplicado_deuda   as a_deudas,
         aplicado_saldo_favor as quedo_a_favor
    from public.pagos
   where contrato_id = '6768da1e-42f6-4eca-adfd-ef9869e1bda2'
   order by created_at desc limit 1;
rollback;
-- Esperado: pesos_movidos_esperado_cero = 0
--           y el pago de prueba: a_la_semana = 202000 · al_acuerdo = 48000
--           (antes del parche daba: a_la_semana = 250000 · al_acuerdo = 0)

-- Limpieza de las fotos de esta migración (ya cumplieron su papel):
-- delete from public.foto_plata where etiqueta in ('antes-171','despues-171');
