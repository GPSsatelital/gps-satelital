-- ===== 046: cajas_previas — soporte de migrados en el LIBRO DE CAJAS =====
-- Los contratos migrados ya llevaban N cuotas pagadas ANTES de su fecha de corte
-- (ese pasado vive en apertura/deudas, no en pagos del sistema). cajas_previas las
-- representa: cuentan como pagadas para el contador "va X de N" y para la exigencia
-- (las cajas del ledger arrancan después de ellas). También absorbe las cajas
-- FINANCIADAS por un convenio (cubre_periodo_hasta): cubiertas, no exigibles.
-- Los contratos nuevos del wizard nacen con 0.

alter table public.contratos
  add column if not exists cajas_previas integer not null default 0;

-- cajas_exigidas ahora suma las previas (pagadas y exigidas quedan en la misma escala:
-- ambas INCLUYEN las previas; el hueco = exigidas − pagadas sigue siendo el atraso real).
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
    return least(coalesce(c.cajas_previas, 0), coalesce(c.total_cajas, coalesce(c.cajas_previas, 0)));
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
    return 0;
  end if;

  v_n := v_n + coalesce(c.cajas_previas, 0);
  if c.total_cajas is not null then
    v_n := least(v_n, c.total_cajas);
  end if;
  return greatest(v_n, 0);
end;
$$;
