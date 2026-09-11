-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 149 — LA VENTANA DE PREPAGO PASA AL FINAL DE LA FILA (11-sep-2026)
--
-- EL CASO: EDINSON MOSQUERA (IEW58I). Semana $202.000 · acuerdo de $679.000 en 12 cuotas de
-- $58.000 (25-ago) · paga LUNES. Su paquete es $260.000 = semana + cuota. Lo pagó exacto el
-- domingo 6-sep y el viernes 11-sep, y el motor guardó las dos veces "semana $260.000 · acuerdo
-- $0": el acuerdo quedó en 0 de 12 y apareciendo en mora, con $116.000 adelantados a una semana
-- que todavía no había empezado. El recibo impreso decía otra cosa (eso se arregló aparte, en la
-- app: el papel ahora imprime lo que la base guardó).
--
-- POR QUÉ PASÓ: la mig 119 metió la VENTANA DE PREPAGO ("pagar hasta 3 días antes del lunes
-- cuenta como pagar el lunes", caso DANIEL MILLÁN) dentro del paso 2, junto con las semanas
-- VENCIDAS. Entonces, cuando el pago cae viernes, sábado o domingo, la semana del lunes SIGUIENTE
-- se vuelve exigible y se pone en la fila ANTES del acuerdo; como la fila es cajas → deudas →
-- convenio, esa semana futura se traga la cuota del acuerdo. Y el paso 4 tenía la misma ventana,
-- pero ya no le llegaba plata.
--
-- LA REGLA (dueño, 24-ago): "TODO SE PAGA PAREJO — semana + convenio". Este cambio la cumple por
-- los DOS lados: primero TODO lo vencido a la fecha real del pago (semanas, deudas, cuotas del
-- acuerdo) y solo con lo que sobre, la semana que arranca dentro de la ventana y su cuota.
--   · EDINSON el domingo: $202.000 a la semana vencida + $58.000 al acuerdo. Nada adelantado.
--   · DANIEL el sábado: no tiene nada vencido, así que su paquete cae entero por la ventana:
--     $195.000 a la semana del lunes + $35.000 al acuerdo. Igual que hoy.
--   · Quien paga de más: la ventana sigue adelantando la semana del lunes; el acuerdo cobró antes.
--
-- CÓMO: parche textual sobre la función VIVA (`pg_get_functiondef`), nunca sobre el archivo de
-- una migración vieja (lección de la mig 124). Tres anclas, cada una tiene que aparecer EXACTAMENTE
-- una vez o la migración se niega a correr:
--   A) el `+ 3` del paso 2 (cajas)      → se quita
--   B) el `+ 3` del paso 4 (convenio)   → se quita
--   C) el comentario del paso 5         → antes de él entran los pasos 2b y 4b con la ventana
--
-- ESPEJO EN LA APP: `src/utils/repartoPago.ts` (`cajasExigidasVentana` / `convenioExigidoVentana`,
-- segunda pasada) con 15 pruebas nuevas en `repartoPago.test.ts`, incluido el recibo exacto de
-- EDINSON del 11-sep. Las 22 pruebas viejas no se tocaron.
--
-- ANTES DE CORRER — pegar esto y esperar  1 · 1 · 1 · 2 :
--   select
--     (length(d) - length(replace(d, 'v_exigidas := public.cajas_exigidas(v_contrato, coalesce(v_row.fecha, current_date) + 3);', ''))) / 89 as ancla_cajas,
--     (length(d) - length(replace(d, 'v_contrato, v_conv_tipado, coalesce(v_row.fecha, current_date) + 3);', ''))) / 68 as ancla_convenio,
--     (length(d) - length(replace(d, '-- 5) Lo que sobre', ''))) / 18 as ancla_paso5,
--     (length(d) - length(replace(d, 'current_date) + 3', ''))) / 17 as ventanas
--   from (select pg_get_functiondef('public.aplicar_pago_confirmado'::regproc) d) f;
-- ═══════════════════════════════════════════════════════════════════════════════════════════

do $mig149$
declare
  v_def   text;
  v_a     text := 'v_exigidas := public.cajas_exigidas(v_contrato, coalesce(v_row.fecha, current_date) + 3);';
  v_b     text := 'v_contrato, v_conv_tipado, coalesce(v_row.fecha, current_date) + 3);';
  v_c     text := '-- 5) Lo que sobre';
  v_bloque text;
  v_n_a   int;
  v_n_b   int;
  v_n_c   int;
begin
  select pg_get_functiondef('public.aplicar_pago_confirmado'::regproc) into v_def;
  if v_def is null then
    raise exception 'mig 149: no existe public.aplicar_pago_confirmado';
  end if;

  v_n_a := (length(v_def) - length(replace(v_def, v_a, ''))) / length(v_a);
  v_n_b := (length(v_def) - length(replace(v_def, v_b, ''))) / length(v_b);
  v_n_c := (length(v_def) - length(replace(v_def, v_c, ''))) / length(v_c);
  if v_n_a <> 1 or v_n_b <> 1 or v_n_c <> 1 then
    raise exception 'mig 149: la función viva no tiene el texto esperado (ancla cajas=%, ancla convenio=%, ancla paso5=%). No se tocó nada.',
      v_n_a, v_n_b, v_n_c;
  end if;

  -- A y B: los pasos 2 y 4 vuelven a preguntar por la fecha REAL del pago.
  v_def := replace(v_def, v_a, 'v_exigidas := public.cajas_exigidas(v_contrato, coalesce(v_row.fecha, current_date));');
  v_def := replace(v_def, v_b, 'v_contrato, v_conv_tipado, coalesce(v_row.fecha, current_date));');

  -- C: la ventana, al final de la fila (2b cajas, 4b convenio), antes del saldo a favor.
  v_bloque := $blq$-- 2b) LA VENTANA DE PREPAGO, AL FINAL DE LA FILA (mig 149, 11-sep-2026).
        --   Pagar hasta 3 días antes del lunes cuenta como pagar el lunes (DANIEL, mig 119), pero
        --   SOLO con lo que sobre después de todo lo vencido: semanas, deudas y cuotas del acuerdo.
        --   Antes esta ventana vivía en el paso 2 y la semana del lunes siguiente se tragaba la
        --   cuota del acuerdo (EDINSON MOSQUERA, IEW58I: dos paquetes de $260.000 registrados como
        --   "semana $260.000 · acuerdo $0"). Regla del dueño (24-ago): todo se paga parejo.
        v_exigidas := public.cajas_exigidas(v_contrato, coalesce(v_row.fecha, current_date) + 3);
        while v_monto > 0
          and v_contrato.cajas_pagadas < coalesce(v_contrato.total_cajas, 2147483647)
          and v_contrato.cajas_pagadas < v_exigidas
          and v_caja_val > 0
        loop
          v_falta := v_caja_val - v_contrato.caja_actual_pagado;
          v_delta := least(v_monto, v_falta);
          v_antes := least(greatest(v_contrato.caja_actual_pagado - (v_caja_val - v_caja_ah), 0), v_caja_ah);
          v_despues := least(greatest(v_contrato.caja_actual_pagado + v_delta - (v_caja_val - v_caja_ah), 0), v_caja_ah);
          v_ahorro_pago := v_ahorro_pago + (v_despues - v_antes);
          v_contrato.caja_actual_pagado := v_contrato.caja_actual_pagado + v_delta;
          v_ap_tarifa := v_ap_tarifa + v_delta;
          v_monto := v_monto - v_delta;
          if v_contrato.caja_actual_pagado >= v_caja_val then
            v_contrato.cajas_pagadas := v_contrato.cajas_pagadas + 1;
            v_contrato.caja_actual_pagado := 0;
          end if;
        end loop;

        -- 4b) Y la cuota del acuerdo de esa semana adelantada, si todavía sobra.
        --   Si llegó plata hasta aquí, el paso 4 ya corrió (v_monto solo baja) y v_convenio,
        --   v_conv_tipado, v_abonado_total y v_pend_conv están cargados.
        if v_monto > 0 then
          if v_convenio.id is not null then
            v_conv_exigido := public.cuotas_convenio_exigidas(
              v_contrato, v_conv_tipado, coalesce(v_row.fecha, current_date) + 3);
            v_puede_conv := greatest(least(v_conv_exigido - v_abonado_total - v_ap_conv, v_pend_conv - v_ap_conv), 0);
            v_delta := least(v_monto, v_puede_conv);
            v_ap_conv := v_ap_conv + v_delta;
            v_monto := v_monto - v_delta;
          end if;
        end if;

        $blq$;
  v_def := replace(v_def, v_c, v_bloque || v_c);

  execute v_def;
  raise notice 'mig 149 aplicada: la ventana de prepago quedó al final de la fila.';
end
$mig149$;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN — pegar después y esperar  0 · 0 · 1 · 1 · 2 :
--   select
--     (length(d) - length(replace(d, 'v_exigidas := public.cajas_exigidas(v_contrato, coalesce(v_row.fecha, current_date) + 3);', ''))) / 89 as ancla_cajas_vieja,
--     (length(d) - length(replace(d, 'v_contrato, v_conv_tipado, coalesce(v_row.fecha, current_date) + 3);', ''))) / 68 as ancla_convenio_vieja,
--     (length(d) - length(replace(d, '-- 2b) LA VENTANA', ''))) / 17 as paso_2b,
--     (length(d) - length(replace(d, '-- 4b) Y la cuota', ''))) / 17 as paso_4b,
--     (length(d) - length(replace(d, 'current_date) + 3', ''))) / 17 as ventanas
--   from (select pg_get_functiondef('public.aplicar_pago_confirmado'::regproc) d) f;
--
-- Y la prueba de verdad es re-repartir los dos pagos de EDINSON (pieza 3) y ver que el acuerdo
-- queda en 2 de 12 y la semana 12 sin adelanto.
-- ═══════════════════════════════════════════════════════════════════════════════════════════
