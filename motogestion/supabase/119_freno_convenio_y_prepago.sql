-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 119 — EL FRENO DEL CONVENIO + LA VENTANA DE PREPAGO (29-ago-2026)
--
-- EL CASO (DANIEL JOSÉ MILLÁN, RLT87H — el mismo que parió la regla del 24-ago):
-- paga los LUNES y pagó el SÁBADO sus $230.000 de siempre (semana $195.000 + cuota $35.000).
-- El motor lo repartió así:  tarifa $0  ·  convenio $230.000.
-- Siete cuotas de convenio de un golpe, y el lunes 31 aparecía debiendo su semana habiendo
-- pagado dos días antes. Su convenio quedó en 10 de 16 cuotas cuando le tocaban 3.
--
-- LA CAUSA — dos huecos que se suman:
--   1) El paso 2 (cajas) tiene freno: `cajas_pagadas < cajas_exigidas`, el excedente NO llena
--      cajas futuras. El paso 4 (convenio) NO tiene ninguno: recibe hasta TODO su saldo
--      pendiente. Así que el dinero que las cajas rechazan cae al único balde sin tope.
--   2) `cajas_exigidas` se pregunta con la fecha exacta del pago. El sábado, la caja del lunes
--      todavía no está exigida — aunque el cliente esté pagando justamente esa.
--
-- LA REGLA DEL DUEÑO (24-ago, textual): "el sistema no debe adelantarse un convenio así; todo
-- debe ser pagado por parejo, semana + convenio". El convenio solo recibe lo EXIGIDO; ponerse
-- al día NO es adelanto (si trae cuotas atrasadas acumuladas las cubre todas).
--
-- LO QUE NO SE TOCA (29-ago, decisión suya tras ver el choque de reglas):
--   · "el excedente no llena cajas futuras" — sigue igual.
--   · "el saldo a favor se MUESTRA, nunca se resta solo" (12-ago) — lo que sobre sigue yendo a
--     saldo a favor, para aplicarse a mano. Se descartó adelantar paquetes automáticamente.
--
-- ESPEJO: `src/utils/repartoPago.ts` (`repartirPagoV2`, `cuotasConvenioExigidas`,
-- `fechaConGraciaPrepago`) con 22 pruebas. 🔴 Si se toca uno hay que tocar el otro.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

-- ─── 1) Cuántas cuotas del convenio están EXIGIDAS a una fecha ──────────────────────────────
-- Esta cuenta SOLO existía en la pantalla (`periodosConvenioExigidos`, cicloPago.ts). El motor
-- no la tenía, y por eso no podía frenar nada.
--
-- Se ancla a `fecha_inicio_cajas` + múltiplos del período: EL MISMO RELOJ que `cajas_exigidas`.
-- A propósito — si el convenio contara sus períodos por su lado podría exigir 3 cuotas mientras
-- las cajas exigen 2 semanas, y el paquete dejaría de ir parejo.
create or replace function public.cuotas_convenio_exigidas(
  c public.contratos,
  cv public.convenios,
  p_hoy date
) returns numeric language plpgsql stable as $$
declare
  v_dias int;
  v_desde date;
  v_primero date;
  v_actual date;
  v_n int;
begin
  if cv.id is null or coalesce(cv.cuota_por_periodo, 0) <= 0 then return 0; end if;
  if c.fecha_inicio_cajas is null or p_hoy < c.fecha_inicio_cajas then return 0; end if;

  v_dias := case c.forma_pago when 'Quincenal' then 15 when 'Mensual' then 30 else 7 end;

  -- Desde cuándo corre: el primer período que sí paga cuota.
  v_desde := cv.created_at::date;
  --   · las semanas que el convenio ya financia por dentro no pagan cuota aparte
  if cv.cubre_periodo_hasta is not null and cv.cubre_periodo_hasta > v_desde then
    v_desde := cv.cubre_periodo_hasta;
  end if;
  --   · durante el prorrateo el convenio no corre (regla del dueño, 12-ago): arranca el
  --     período siguiente, cuando ya paga su semana completa
  if coalesce(c.prorrateo_total, 0) > 0 and (c.fecha_inicio_cajas + v_dias) > v_desde then
    v_desde := c.fecha_inicio_cajas + v_dias;
  end if;
  if v_desde < c.fecha_inicio_cajas then v_desde := c.fecha_inicio_cajas; end if;

  -- Redondear al primer inicio de período que sea >= v_desde.
  v_primero := c.fecha_inicio_cajas + (floor((v_desde - c.fecha_inicio_cajas)::numeric / v_dias) * v_dias)::int;
  if v_primero < v_desde then v_primero := v_primero + v_dias; end if;

  v_actual := c.fecha_inicio_cajas + (floor((p_hoy - c.fecha_inicio_cajas)::numeric / v_dias) * v_dias)::int;
  if v_actual < v_primero then return 0; end if;

  v_n := floor((v_actual - v_primero)::numeric / v_dias)::int + 1;
  -- RODAR EL PAQUETE (mig 118): las cuotas de las semanas que la moto estuvo guardada se corren
  -- al final. Se restan ANTES del tope de deuda_total: la curva se corre y el total igual se paga.
  v_n := greatest(v_n - coalesce(cv.periodos_exonerados, 0), 0);

  return least(v_n * cv.cuota_por_periodo, coalesce(cv.deuda_total, 0));
end;
$$;

comment on function public.cuotas_convenio_exigidas(public.contratos, public.convenios, date) is
  'Cuanto tiene EXIGIDO el convenio a una fecha (acumulado, con arrastre). Espejo de '
  'cuotasConvenioExigidas en src/utils/repartoPago.ts. Anclada al mismo reloj que cajas_exigidas.';

-- ─── 2) El motor, con el freno y la ventana ────────────────────────────────────────────────
-- Se recrea la función COMPLETA (leida viva con pg_get_functiondef el 29-ago) con dos cambios,
-- marcados abajo con "-- ★". Todo lo demás queda idéntico, línea por línea.
create or replace function public.aplicar_pago_confirmado()
 returns trigger
 language plpgsql
 security definer
as $function$
declare
  v_contrato public.contratos;
  v_ratio numeric;
  v_ahorro_pago numeric := 0;
  v_nuevo_ahorro numeric;
  v_convenio record;
  v_abonado_total numeric;
  v_cuotas_completas int;
  v_row record;
  v_pasa_a_confirmado boolean;
  v_sale_de_confirmado boolean;
  v_resto numeric;
  v_delta numeric;
  v_d record;
  v_monto numeric;
  v_ap_pror numeric := 0;
  v_ap_tarifa numeric := 0;
  v_ap_deuda numeric := 0;
  v_ap_conv numeric := 0;
  v_ap_saldo numeric := 0;
  v_falta numeric;
  v_caja_val numeric;
  v_caja_ah numeric;
  v_exigidas int;
  v_antes numeric;
  v_despues numeric;
  v_pend_conv numeric;
  v_sin_reparto boolean; v_multa_antes numeric;
  v_conv_exigido numeric; v_conv_abonado numeric; v_puede_conv numeric;  -- ★ freno del convenio
begin
  if tg_op = 'DELETE' then
    v_row := old;
    v_pasa_a_confirmado := false;
    v_sale_de_confirmado := (old.estado = 'Confirmado');
  elsif tg_op = 'INSERT' then
    v_row := new;
    v_pasa_a_confirmado := (new.estado = 'Confirmado');
    v_sale_de_confirmado := false;
  else
    v_row := new;
    v_pasa_a_confirmado := (new.estado = 'Confirmado' and old.estado is distinct from 'Confirmado');
    v_sale_de_confirmado := (old.estado = 'Confirmado' and new.estado is distinct from 'Confirmado');
  end if;

  if not v_pasa_a_confirmado and not v_sale_de_confirmado then
    if v_pasa_a_confirmado then update public.pagos set aplicado_multa = least(coalesce(aplicado_deuda, 0), coalesce(v_multa_antes, 0)) where id = v_row.id; end if; if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  select * into v_contrato from public.contratos where id = v_row.contrato_id; select coalesce(sum(monto_pendiente), 0) into v_multa_antes from public.deudas where contrato_id = v_row.contrato_id and estado = 'pendiente' and concepto = 'multa_recoleccion';
  if v_contrato.id is null then
    if v_pasa_a_confirmado then update public.pagos set aplicado_multa = least(coalesce(aplicado_deuda, 0), coalesce(v_multa_antes, 0)) where id = v_row.id; end if; if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  -- ════════ MOTOR V2 (libro de cajas) ════════
  if v_contrato.motor_v2 and v_contrato.forma_pago <> 'Diario' then
    if v_pasa_a_confirmado then
      v_sin_reparto := coalesce(v_row.aplicado_tarifa, 0) = 0 and coalesce(v_row.aplicado_deuda, 0) = 0
                   and coalesce(v_row.aplicado_convenio, 0) = 0 and coalesce(v_row.aplicado_saldo_favor, 0) = 0
                   and coalesce(v_row.aplicado_prorrateo, 0) = 0;
      v_monto := v_row.valor;
      v_caja_val := public.caja_valor(v_contrato);
      v_caja_ah := public.caja_ahorro(v_contrato);

      if v_sin_reparto and v_monto > 0 then if v_contrato.estado = 'Suspendido' then for v_d in select id, monto_pendiente from public.deudas where contrato_id = v_row.contrato_id and estado = 'pendiente' and concepto = 'multa_recoleccion' and monto_pendiente > 0 order by created_at loop exit when v_monto <= 0; v_delta := least(v_monto, v_d.monto_pendiente); update public.deudas set monto_pendiente = monto_pendiente - v_delta, estado = case when monto_pendiente - v_delta <= 0 then 'pagada' else estado end where id = v_d.id; v_ap_deuda := v_ap_deuda + v_delta; v_monto := v_monto - v_delta; end loop; end if;
        -- 1) Caja 0: prorrateo (el adelanto_base NO paga prorrateo: va directo a Caja 1)
        v_falta := case when v_row.tipo_registro = 'adelanto_base' then 0
                        else greatest(v_contrato.prorrateo_total - v_contrato.prorrateo_pagado, 0) end;
        if v_falta > 0 then
          v_delta := least(v_monto, v_falta);
          v_antes := least(greatest(v_contrato.prorrateo_pagado - (v_contrato.prorrateo_total - v_contrato.prorrateo_ahorro), 0), v_contrato.prorrateo_ahorro);
          v_despues := least(greatest(v_contrato.prorrateo_pagado + v_delta - (v_contrato.prorrateo_total - v_contrato.prorrateo_ahorro), 0), v_contrato.prorrateo_ahorro);
          v_ahorro_pago := v_ahorro_pago + (v_despues - v_antes);
          v_contrato.prorrateo_pagado := v_contrato.prorrateo_pagado + v_delta;
          v_ap_pror := v_delta;
          v_monto := v_monto - v_delta;
        end if;

        -- 2) Cajas FIFO (solo hasta las exigidas; adelanto_base puede llenar la suya)
        -- ★ CAMBIO 1 — VENTANA DE PREPAGO: se pregunta por las exigidas 3 días ADELANTE de la
        --   fecha del pago. Pagar el sábado la semana que arranca el lunes es pagar a tiempo,
        --   no adelantarse; sin esto ese dinero no encontraba caja y se iba entero al convenio.
        --   NO rompe "el excedente no llena cajas futuras": esa caja ya está dentro de la
        --   ventana de cobro. Lo que sobre DESPUÉS sigue yendo a saldo a favor.
        v_exigidas := public.cajas_exigidas(v_contrato, coalesce(v_row.fecha, current_date) + 3);
        if v_row.tipo_registro = 'adelanto_base' then
          v_exigidas := greatest(v_exigidas, v_contrato.cajas_pagadas + 1);
        end if;
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

        -- 3) Deudas (más antigua primero)
        if v_monto > 0 then
          v_resto := v_monto;
          for v_d in
            select id, monto_pendiente from public.deudas
            where contrato_id = v_row.contrato_id and estado = 'pendiente' and monto_pendiente > 0
            order by (concepto = 'multa_recoleccion') desc, created_at
          loop
            exit when v_resto <= 0;
            v_delta := least(v_resto, v_d.monto_pendiente);
            update public.deudas set
              monto_pendiente = monto_pendiente - v_delta,
              estado = case when monto_pendiente - v_delta <= 0 then 'pagada' else estado end
            where id = v_d.id;
            v_resto := v_resto - v_delta;
          end loop;
          v_ap_deuda := v_ap_deuda + (v_monto - v_resto);
          v_monto := v_resto;
        end if;

        -- 4) Convenio activo
        -- ★ CAMBIO 2 — EL FRENO: antes tomaba hasta TODO su saldo pendiente. Ahora solo hasta lo
        --   EXIGIDO menos lo ya abonado. Ponerse al día NO es adelanto: si trae cuotas atrasadas
        --   acumuladas las cubre todas de una, porque `cuotas_convenio_exigidas` es acumulada.
        if v_monto > 0 then
          select * into v_convenio from public.convenios
            where contrato_id = v_row.contrato_id and estado = 'activo' limit 1;
          if v_convenio.id is not null then
            select coalesce(sum(aplicado_convenio), 0) into v_abonado_total
              from public.pagos
              where contrato_id = v_row.contrato_id and estado = 'Confirmado'
                and created_at >= v_convenio.created_at and id <> v_row.id;
            v_pend_conv := greatest(coalesce(v_convenio.deuda_total, 0) - v_abonado_total, 0);
            v_conv_exigido := public.cuotas_convenio_exigidas(
              v_contrato, v_convenio, coalesce(v_row.fecha, current_date) + 3);
            v_puede_conv := greatest(least(v_conv_exigido - v_abonado_total, v_pend_conv), 0);
            v_ap_conv := least(v_monto, v_puede_conv);
            v_monto := v_monto - v_ap_conv;
          end if;
        end if;

        -- 5) Lo que sobre → saldo a favor (se aplica a mano — regla del dueño, 12-ago)
        v_ap_saldo := v_monto;

        update public.pagos set
          aplicado_prorrateo = v_ap_pror,
          aplicado_tarifa = v_ap_tarifa,
          aplicado_deuda = v_ap_deuda,
          aplicado_convenio = v_ap_conv,
          aplicado_saldo_favor = v_ap_saldo,
          aplicado_ahorro = v_ahorro_pago
        where id = v_row.id;

        update public.contratos set
          prorrateo_pagado = v_contrato.prorrateo_pagado,
          cajas_pagadas = v_contrato.cajas_pagadas,
          caja_actual_pagado = v_contrato.caja_actual_pagado,
          ahorro_acumulado = coalesce(ahorro_acumulado, 0) + v_ahorro_pago
        where id = v_contrato.id;
      else
        -- Pago que YA trae reparto (correcciones por SQL): aplicar tal cual.
        update public.contratos set
          prorrateo_pagado = prorrateo_pagado + coalesce(v_row.aplicado_prorrateo, 0),
          caja_actual_pagado = caja_actual_pagado + coalesce(v_row.aplicado_tarifa, 0),
          ahorro_acumulado = coalesce(ahorro_acumulado, 0) + coalesce(v_row.aplicado_ahorro, 0)
        where id = v_contrato.id;
        update public.contratos c2 set
          cajas_pagadas = c2.cajas_pagadas + floor(c2.caja_actual_pagado / nullif(public.caja_valor(c2), 0))::int,
          caja_actual_pagado = c2.caja_actual_pagado - floor(c2.caja_actual_pagado / nullif(public.caja_valor(c2), 0))::int * public.caja_valor(c2)
        where c2.id = v_contrato.id and public.caja_valor(c2) > 0;
        if coalesce(v_row.aplicado_deuda, 0) > 0 then
          v_resto := v_row.aplicado_deuda;
          for v_d in
            select id, monto_pendiente from public.deudas
            where contrato_id = v_row.contrato_id and estado = 'pendiente' and monto_pendiente > 0
            order by (concepto = 'multa_recoleccion') desc, created_at
          loop
            exit when v_resto <= 0;
            v_delta := least(v_resto, v_d.monto_pendiente);
            update public.deudas set
              monto_pendiente = monto_pendiente - v_delta,
              estado = case when monto_pendiente - v_delta <= 0 then 'pagada' else estado end
            where id = v_d.id;
            v_resto := v_resto - v_delta;
          end loop;
        end if;
      end if;

    elsif v_sale_de_confirmado then
      -- REVERSA v2: des-llenar con los aplicados guardados
      v_caja_val := public.caja_valor(v_contrato);
      v_resto := coalesce(v_row.aplicado_tarifa, 0);
      if v_resto > 0 and v_caja_val > 0 then
        v_delta := v_contrato.caja_actual_pagado;
        if v_resto <= v_delta then
          v_contrato.caja_actual_pagado := v_delta - v_resto;
          v_resto := 0;
        else
          v_resto := v_resto - v_delta;
          v_contrato.caja_actual_pagado := 0;
          while v_resto > 0 and v_contrato.cajas_pagadas > 0 loop
            v_contrato.cajas_pagadas := v_contrato.cajas_pagadas - 1;
            if v_resto >= v_caja_val then
              v_resto := v_resto - v_caja_val;
            else
              v_contrato.caja_actual_pagado := v_caja_val - v_resto;
              v_resto := 0;
            end if;
          end loop;
        end if;
      end if;
      update public.contratos set
        prorrateo_pagado = greatest(prorrateo_pagado - coalesce(v_row.aplicado_prorrateo, 0), 0),
        cajas_pagadas = v_contrato.cajas_pagadas,
        caja_actual_pagado = v_contrato.caja_actual_pagado,
        ahorro_acumulado = greatest(coalesce(ahorro_acumulado, 0) - coalesce(v_row.aplicado_ahorro, 0), 0)
      where id = v_contrato.id;
      if coalesce(v_row.aplicado_deuda, 0) > 0 then
        v_resto := v_row.aplicado_deuda;
        for v_d in
          select id, monto, monto_pendiente from public.deudas
          where contrato_id = v_row.contrato_id and monto_pendiente < monto
          order by (concepto = 'multa_recoleccion') asc, created_at desc
        loop
          exit when v_resto <= 0;
          v_delta := least(v_resto, v_d.monto - v_d.monto_pendiente);
          update public.deudas set
            monto_pendiente = monto_pendiente + v_delta,
            estado = case when estado = 'pagada' and monto_pendiente + v_delta > 0 then 'pendiente' else estado end
          where id = v_d.id;
          v_resto := v_resto - v_delta;
        end loop;
      end if;
    end if;

    -- Convenio: recontar cuotas
    select * into v_convenio from public.convenios
      where contrato_id = v_row.contrato_id and estado in ('activo', 'cumplido', 'incumplido')
      limit 1;
    if v_convenio.id is not null and coalesce(v_convenio.cuota_por_periodo, 0) > 0 then
      select coalesce(sum(aplicado_convenio), 0) into v_abonado_total
        from public.pagos
        where contrato_id = v_row.contrato_id and estado = 'Confirmado'
          and created_at >= v_convenio.created_at;
      if v_abonado_total >= coalesce(v_convenio.deuda_total, 0) then v_cuotas_completas := v_convenio.numero_cuotas; else v_cuotas_completas := least(floor(v_abonado_total / v_convenio.cuota_por_periodo)::int, v_convenio.numero_cuotas); end if;
      update public.convenios set
        cuotas_pagadas = v_cuotas_completas, fecha_limite = case when estado = 'incumplido' and v_cuotas_completas < numero_cuotas then current_date + ((numero_cuotas - v_cuotas_completas) * (select case c.forma_pago when 'Quincenal' then 15 when 'Mensual' then 30 else 7 end from public.contratos c where c.id = v_row.contrato_id))::int else fecha_limite end,
        estado = case
          when v_cuotas_completas >= numero_cuotas then 'cumplido'
          when estado = 'cumplido' and v_cuotas_completas < numero_cuotas then 'activo' when estado = 'incumplido' then 'activo'
          else estado
        end
      where id = v_convenio.id;
    end if;

    if v_pasa_a_confirmado then update public.pagos set aplicado_multa = least(coalesce(aplicado_deuda, 0), coalesce(v_multa_antes, 0)) where id = v_row.id; end if; if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  -- ════════ MOTOR V1 (idéntico a mig 044 — contratos actuales) ════════
  if v_pasa_a_confirmado and coalesce(v_row.aplicado_deuda, 0) > 0 then
    v_resto := v_row.aplicado_deuda;
    for v_d in
      select id, monto_pendiente from public.deudas
      where contrato_id = v_row.contrato_id and estado = 'pendiente' and monto_pendiente > 0
      order by (concepto = 'multa_recoleccion') desc, created_at
    loop
      exit when v_resto <= 0;
      v_delta := least(v_resto, v_d.monto_pendiente);
      update public.deudas set
        monto_pendiente = monto_pendiente - v_delta,
        estado = case when monto_pendiente - v_delta <= 0 then 'pagada' else estado end
      where id = v_d.id;
      v_resto := v_resto - v_delta;
    end loop;
  elsif v_sale_de_confirmado and coalesce(v_row.aplicado_deuda, 0) > 0 then
    v_resto := v_row.aplicado_deuda;
    for v_d in
      select id, monto, monto_pendiente from public.deudas
      where contrato_id = v_row.contrato_id and monto_pendiente < monto
      order by (concepto = 'multa_recoleccion') asc, created_at desc
    loop
      exit when v_resto <= 0;
      v_delta := least(v_resto, v_d.monto - v_d.monto_pendiente);
      update public.deudas set
        monto_pendiente = monto_pendiente + v_delta,
        estado = case when estado = 'pagada' and monto_pendiente + v_delta > 0 then 'pendiente' else estado end
      where id = v_d.id;
      v_resto := v_resto - v_delta;
    end loop;
  end if;

  if v_pasa_a_confirmado then
    if v_row.aplicado_ahorro is not null then
      v_ahorro_pago := v_row.aplicado_ahorro;
    elsif coalesce(v_row.aplicado_tarifa, 0) > 0 then
      if v_contrato.forma_pago = 'Diario' then
        v_ratio := coalesce(v_contrato.ahorro_diario, 4000)::numeric
                   / nullif(coalesce(v_contrato.tarifa_diaria, 27000) + coalesce(v_contrato.ahorro_diario, 4000), 0);
      else
        v_ratio := (6 * coalesce(v_contrato.ahorro_diario, 4000) + coalesce(v_contrato.ahorro_domingo, 2000))::numeric
                   / nullif(coalesce(v_contrato.valor_semanal, 0), 0);
      end if;
      if v_ratio is not null and v_ratio > 0 then
        v_ahorro_pago := round(v_row.aplicado_tarifa * v_ratio);
        update public.pagos set aplicado_ahorro = v_ahorro_pago where id = v_row.id;
      else
        v_ahorro_pago := 0;
      end if;
    else
      v_ahorro_pago := 0;
    end if;

    if v_ahorro_pago > 0 then
      v_nuevo_ahorro := coalesce(v_contrato.ahorro_acumulado, 0) + v_ahorro_pago;
      update public.contratos set
        ahorro_acumulado = v_nuevo_ahorro,
        base_completada = (v_nuevo_ahorro >= 510000)
      where id = v_contrato.id;
    end if;
  elsif v_sale_de_confirmado then
    v_ahorro_pago := coalesce(v_row.aplicado_ahorro, 0);
    if v_ahorro_pago > 0 then
      v_nuevo_ahorro := greatest(coalesce(v_contrato.ahorro_acumulado, 0) - v_ahorro_pago, 0);
      update public.contratos set
        ahorro_acumulado = v_nuevo_ahorro,
        base_completada = (v_nuevo_ahorro >= 510000)
      where id = v_contrato.id;
    end if;
  end if;

  select * into v_convenio from public.convenios
    where contrato_id = v_row.contrato_id and estado in ('activo', 'cumplido', 'incumplido')
    limit 1;
  if v_convenio.id is not null and coalesce(v_convenio.cuota_por_periodo, 0) > 0 then
    select coalesce(sum(aplicado_convenio), 0) into v_abonado_total
      from public.pagos
      where contrato_id = v_row.contrato_id
        and estado = 'Confirmado'
        and created_at >= v_convenio.created_at;
    if v_abonado_total >= coalesce(v_convenio.deuda_total, 0) then v_cuotas_completas := v_convenio.numero_cuotas; else v_cuotas_completas := least(floor(v_abonado_total / v_convenio.cuota_por_periodo)::int, v_convenio.numero_cuotas); end if;
    update public.convenios set
      cuotas_pagadas = v_cuotas_completas, fecha_limite = case when estado = 'incumplido' and v_cuotas_completas < numero_cuotas then current_date + ((numero_cuotas - v_cuotas_completas) * (select case c.forma_pago when 'Quincenal' then 15 when 'Mensual' then 30 else 7 end from public.contratos c where c.id = v_row.contrato_id))::int else fecha_limite end,
      estado = case
        when v_cuotas_completas >= numero_cuotas then 'cumplido'
        when estado = 'cumplido' and v_cuotas_completas < numero_cuotas then 'activo' when estado = 'incumplido' then 'activo'
        else estado
      end
    where id = v_convenio.id;
  end if;

  if v_pasa_a_confirmado then update public.pagos set aplicado_multa = least(coalesce(aplicado_deuda, 0), coalesce(v_multa_antes, 0)) where id = v_row.id; end if; if tg_op = 'DELETE' then return old; else return new; end if;
end;
$function$;

-- ─── VERIFICACIÓN (no cambia nada; solo mira) ───────────────────────────────────────────────
-- Debe mostrar, para cada contrato con convenio activo: cuanto tiene EXIGIDO hoy y cuanto lleva
-- abonado. Donde `abonado > exigido`, el cliente venia adelantado por el defecto viejo.
select m.placa, cl.nombre,
       cv.deuda_total, cv.cuota_por_periodo, cv.cuotas_pagadas || '/' || cv.numero_cuotas as cuotas,
       public.cuotas_convenio_exigidas(c, cv, current_date) as exigido_hoy,
       (select coalesce(sum(p.aplicado_convenio), 0) from public.pagos p
         where p.contrato_id = c.id and p.estado = 'Confirmado'
           and p.created_at >= cv.created_at) as abonado,
       (select coalesce(sum(p.aplicado_convenio), 0) from public.pagos p
         where p.contrato_id = c.id and p.estado = 'Confirmado'
           and p.created_at >= cv.created_at)
         - public.cuotas_convenio_exigidas(c, cv, current_date) as adelantado
from public.contratos c
join public.convenios cv on cv.contrato_id = c.id and cv.estado = 'activo'
join public.clientes cl on cl.id = c.cliente_id
left join public.motos m on m.id = c.moto_id
where c.motor_v2 = true
order by adelantado desc nulls last
limit 30;
