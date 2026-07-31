-- ===== 078: cajas_exoneradas — que RODAR el tiempo funcione de verdad =====
--
-- EL PROBLEMA: "rodar el tiempo al final" existía como botón desde hace semanas, pero NO HACÍA
-- NADA. Solo movía `contratos.fecha_fin_contrato`, que con el libro de cajas es un dato
-- INFORMATIVO: el contrato termina al llenar la caja N, no por fecha (spec, punto 2). O sea que
-- las cajas de esos días se le seguían exigiendo igual y el cliente seguía apareciendo en mora.
-- El admin creía tener una herramienta que no existía.
--
-- LO QUE PIDE EL SPEC (punto 7): "el rango queda exonerado de EXIGENCIA pero las cajas NO se
-- perdonan — se corren y se pagan al final (contrato por pagos, no por tiempo)".
--
-- LA REGLA DEL DUEÑO (30-jul-2026): se rueda SOLO POR PERÍODOS COMPLETOS. "Rodar 3 días de una
-- semana descuadra muchas lógicas y cuentas". Por eso el contador es de CAJAS enteras, no de días.
--
-- CÓMO FUNCIONA: un acumulador incremental que se RESTA de las cajas exigidas. Se resta ANTES del
-- tope de `total_cajas`, y eso es lo importante:
--   · si se restara DESPUÉS del tope, las exigidas nunca pasarían de (total − exoneradas) y el
--     contrato NUNCA podría terminar: las últimas N cajas jamás se exigirían.
--   · restando antes, la curva de exigencia simplemente se CORRE N períodos a la derecha y con el
--     tiempo vuelve a alcanzar total_cajas. El cliente paga las mismas N cajas, N períodos después.
-- Es un acumulador, no una fórmula que reescribe historia (spec, punto 10).
--
-- OJO: esta función es la ÚNICA fuente de la exigencia. La usa el motor de reparto (mig 045) para
-- decidir hasta dónde llena FIFO, y su espejo en TypeScript (`cajasExigidasHasta` en cicloPago.ts)
-- para la mora, el "debe hoy" y el desglose por período. Cambiando acá cambian todas las vistas.

alter table public.contratos
  add column if not exists cajas_exoneradas integer not null default 0;

comment on column public.contratos.cajas_exoneradas is
  'Cajas (períodos COMPLETOS) exoneradas de exigencia por tiempo fuera de servicio: se corren al final del contrato, no se perdonan. Acumulador incremental.';

create or replace function public.cajas_exigidas(c public.contratos, p_hoy date)
returns integer language plpgsql stable as $$
declare
  v_n int := 0;
  v_dias int[];
  v_mes date;
  v_dia int;
  v_fecha date;
begin
  if c.fecha_inicio_cajas is null or p_hoy < c.fecha_inicio_cajas then
    v_n := least(coalesce(c.cajas_previas, 0), coalesce(c.total_cajas, coalesce(c.cajas_previas, 0)));
    return greatest(v_n - coalesce(c.cajas_exoneradas, 0), 0);
  end if;

  if c.forma_pago = 'Semanal' then
    v_n := floor((p_hoy - c.fecha_inicio_cajas) / 7.0)::int + 1;
  elsif c.forma_pago in ('Quincenal', 'Mensual') then
    v_dias := coalesce(c.dias_pago_mes, case when c.forma_pago = 'Quincenal' then array[5,20] else array[5] end);
    v_mes := date_trunc('month', c.fecha_inicio_cajas)::date;
    while v_mes <= p_hoy loop
      foreach v_dia in array v_dias loop
        v_fecha := least(v_mes + (v_dia - 1), (v_mes + interval '1 month' - interval '1 day')::date);
        if v_fecha >= c.fecha_inicio_cajas and v_fecha <= p_hoy then
          v_n := v_n + 1;
        end if;
      end loop;
      v_mes := (v_mes + interval '1 month')::date;
    end loop;
  else
    return 0; -- Diario: fuera del libro
  end if;

  v_n := v_n + coalesce(c.cajas_previas, 0);
  -- La resta va ANTES del tope (ver arriba: si va después, el contrato nunca termina).
  v_n := v_n - coalesce(c.cajas_exoneradas, 0);
  if c.total_cajas is not null then
    v_n := least(v_n, c.total_cajas);
  end if;
  return greatest(v_n, 0);
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CÓMO COMPROBARLO (no cambia nada hasta que alguien ruede algo: la columna nace en 0
-- y `v_n - 0` es el mismo resultado de siempre para los 260+ contratos vivos).
--
--   select count(*) as contratos, sum(cajas_exoneradas) as exoneradas_totales
--     from public.contratos;                                   -- exoneradas_totales debe dar 0
--
-- Y sobre un contrato Semanal cualquiera, que el resultado NO cambie:
--   select id, public.cajas_exigidas(c, (now() at time zone 'America/Bogota')::date) as exigidas
--     from public.contratos c where forma_pago = 'Semanal' limit 5;
-- ─────────────────────────────────────────────────────────────────────────────
