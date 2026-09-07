-- 126 — LA VITRINA PARA ZALA: esquema `zala`, de SOLO LECTURA, con los resultados ya cocinados.
--
-- POR QUÉ (dueño, 4-sep-2026): ZALA (el bot de cobranza por WhatsApp) entra con la llave maestra,
-- ve 40 tablas crudas sin rótulos y reinventa las cuentas — ya descuadró a Kevin y a Andry. La
-- calculadora está partida: una mitad en SQL (motor de cajas) y otra solo en TypeScript
-- (`loQueDebe`, `calcularEstadoCartera`, `diasEnMora` en src/utils/cicloPago.ts). No había NI UNA
-- vista en todo el proyecto.
--
-- QUÉ HACE: pone en la base, en palabras del negocio, lo mismo que muestra Cartera:
--   zala.cliente     una fila por contrato vivo: cuánto debe HOY desglosado, estado, días de mora,
--                    plazo, próximo pago, último pago, su moto, su encargado.
--   zala.moto        una fila por moto: estado en palabras, con quién está, retención, taller, papeles.
--   zala.pagos       los pagos de los últimos 120 días, con quién y qué placa.
--   zala.convenios   los acuerdos vivos e incumplidos, con lo exigido, abonado y lo que falta.
--   zala.deudas      las deudas pendientes y las que entraron a un convenio.
--   zala.diccionario lo que ZALA lee PRIMERO: cada columna, qué significa y si se lo dice al cliente.
--
-- 🔴 ESPEJO. Las funciones de este esquema son el espejo SQL de cicloPago.ts (loQueDebe,
-- faltaDelAcuerdo, cuotaConvenioDelPeriodo, periodosConvenioExigidos, desgloseExigible,
-- diasEnMoraV2, estadoCarteraV2, calcularEstadoCartera) y del balde del panel Hoy de CobrosView.
-- Si se toca uno hay que tocar el otro, y la prueba espejo (scripts/vitrina-espejo.browser.js)
-- compara los dos contrato por contrato. La exigencia de cajas NO se duplica: se reusa
-- public.cajas_exigidas (el motor), igual que caja_valor.
--
-- SEGURIDAD: el rol `zala_lector` solo tiene USAGE en `zala` y SELECT en sus vistas. Nada en
-- public. Las vistas corren con los privilegios de su dueño (postgres), por eso pueden leer las
-- tablas base sin que el lector las toque. El rol nace SIN login: la contraseña la pone el dueño
-- a mano (`alter role zala_lector with login password '…'`), nunca en el repo.

create schema if not exists zala;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 0) Hoy en Colombia y utilidades
-- ═══════════════════════════════════════════════════════════════════════════════════════════
create or replace function zala.hoy() returns date language sql stable as $$
  select (now() at time zone 'America/Bogota')::date
$$;

-- '$ 302.000' — para los textos que ZALA le lee al cliente.
create or replace function zala.pesos(p numeric) returns text language sql immutable as $$
  select case when p is null then null
    else '$ ' || regexp_replace(round(p)::bigint::text, '(\d)(?=(\d{3})+$)', '\1.', 'g') end
$$;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 1) Calendario de pago — espejo de esDiaDePago / inicioPeriodoActual / proximoDiaPago
-- ═══════════════════════════════════════════════════════════════════════════════════════════
create or replace function zala._dia_semana_num(p_dia text) returns int language sql immutable as $$
  select case p_dia
    when 'Lunes' then 1 when 'Martes' then 2 when 'Miercoles' then 3 when 'Miércoles' then 3
    when 'Jueves' then 4 when 'Viernes' then 5 when 'Sabado' then 6 when 'Sábado' then 6
    when 'Domingo' then 0 else 1 end
$$;

create or replace function zala._es_calendario(c public.contratos) returns boolean language sql immutable as $$
  select c.forma_pago in ('Quincenal', 'Mensual')
$$;

-- Mismo default que cicloPago.ts (diasPagoMes → [1]) para el espejo de la pantalla.
create or replace function zala._dias_pago_mes(c public.contratos) returns int[] language sql immutable as $$
  select case when c.dias_pago_mes is not null and cardinality(c.dias_pago_mes) > 0 then c.dias_pago_mes else array[1] end
$$;

create or replace function zala.es_dia_de_pago(c public.contratos, d date) returns boolean language plpgsql immutable as $$
declare v_ult int;
begin
  if zala._es_calendario(c) then
    v_ult := extract(day from (date_trunc('month', d::timestamp) + interval '1 month' - interval '1 day'))::int;
    return exists (select 1 from unnest(zala._dias_pago_mes(c)) x where least(x, v_ult) = extract(day from d)::int);
  end if;
  return extract(dow from d)::int = zala._dia_semana_num(c.dia_pago);
end $$;

-- Último día de pago <= d (31 días hacia atrás; si no hay, d − 31, igual que la pantalla).
create or replace function zala.inicio_periodo_actual(c public.contratos, d date) returns date language plpgsql immutable as $$
declare x date := d;
begin
  for i in 0..30 loop
    if zala.es_dia_de_pago(c, x) then return x; end if;
    x := x - 1;
  end loop;
  return x;
end $$;

-- Próximo día de pago estrictamente posterior a d.
create or replace function zala.proximo_dia_pago(c public.contratos, d date) returns date language plpgsql immutable as $$
declare x date := d + 1;
begin
  for i in 0..30 loop
    if zala.es_dia_de_pago(c, x) then return x; end if;
    x := x + 1;
  end loop;
  return x;
end $$;

create or replace function zala.dia_pago_texto(c public.contratos) returns text language sql immutable as $$
  select case
    when c.forma_pago = 'Diario' then 'Diario'
    when zala._es_calendario(c) then
      case when cardinality(zala._dias_pago_mes(c)) > 1
        then 'Días ' || array_to_string(zala._dias_pago_mes(c), ' y ')
        else 'Día ' || (zala._dias_pago_mes(c))[1] end
    else c.dia_pago end
$$;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 2) El convenio — espejo de cuotaConvenioDelPeriodo / periodosConvenioExigidos /
--    faltaDelAcuerdo / proximaCuotaConvenio
-- ═══════════════════════════════════════════════════════════════════════════════════════════
create or replace function zala.cuota_convenio_del_periodo(cv public.convenios, c public.contratos, d date)
returns numeric language plpgsql stable as $$
declare v_cuota numeric; v_inicio date; v_creado date;
begin
  if cv.id is null then return 0; end if;
  v_cuota := coalesce(cv.cuota_por_periodo, 0);
  if v_cuota <= 0 then return 0; end if;
  v_inicio := zala.inicio_periodo_actual(c, d);
  -- La pantalla toma created_at.slice(0,10): la fecha UTC. Igual acá.
  v_creado := (cv.created_at at time zone 'UTC')::date;
  if v_creado is null or v_creado > v_inicio then return 0; end if;
  if cv.cubre_periodo_hasta is not null and v_inicio < cv.cubre_periodo_hasta then return 0; end if;
  if coalesce(c.prorrateo_total, 0) > 0 and c.fecha_inicio_cajas is not null and v_inicio <= c.fecha_inicio_cajas then return 0; end if;
  return v_cuota;
end $$;

create or replace function zala.periodos_convenio_exigidos(cv public.convenios, c public.contratos, p_hoy date)
returns int language plpgsql stable as $$
declare v_hoy_ini date; v_d date; v_n int := 0;
begin
  if cv.id is null or cv.created_at is null then return 0; end if;
  v_hoy_ini := zala.inicio_periodo_actual(c, p_hoy);
  v_d := zala.inicio_periodo_actual(c, (cv.created_at at time zone 'UTC')::date);
  for i in 1..200 loop
    exit when v_d > v_hoy_ini;
    if zala.cuota_convenio_del_periodo(cv, c, v_d) > 0 then v_n := v_n + 1; end if;
    v_d := zala.proximo_dia_pago(c, v_d);
  end loop;
  return greatest(v_n - coalesce(cv.periodos_exonerados, 0), 0);
end $$;

-- toca / pagado / falta del acuerdo, CON ARRASTRE (regla 2 del dueño: si abonó $40.000 de $100.000,
-- la semana siguiente le tocan $160.000; nunca más que deuda_total).
create or replace function zala.acuerdo(cv public.convenios, c public.contratos, p_abonado numeric, p_hoy date)
returns table (toca numeric, pagado numeric, falta numeric) language plpgsql stable as $$
declare v_exigido numeric; v_ab numeric := coalesce(p_abonado, 0);
begin
  if cv.id is null or coalesce(cv.cuota_por_periodo, 0) <= 0 then return; end if;
  v_exigido := zala.periodos_convenio_exigidos(cv, c, p_hoy) * cv.cuota_por_periodo;
  if cv.deuda_total is not null then v_exigido := least(v_exigido, cv.deuda_total); end if;
  toca := v_exigido; pagado := least(v_ab, v_exigido); falta := greatest(v_exigido - v_ab, 0);
  return next;
end $$;

create or replace function zala.proxima_cuota_convenio(cv public.convenios, c public.contratos, p_hoy date)
returns date language plpgsql stable as $$
declare v_d date;
begin
  if cv.id is null or coalesce(cv.cuota_por_periodo, 0) <= 0 then return null; end if;
  v_d := zala.proximo_dia_pago(c, p_hoy);
  for i in 1..8 loop
    if zala.cuota_convenio_del_periodo(cv, c, v_d) > 0 then return v_d; end if;
    v_d := zala.proximo_dia_pago(c, v_d);
  end loop;
  return null;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 3) Las cajas — espejo de fechaCaja / prorrateoExigibleHoy / diasEnMoraV2
--    (la exigencia se REUSA de public.cajas_exigidas, el motor; no se duplica)
-- ═══════════════════════════════════════════════════════════════════════════════════════════
create or replace function zala.fecha_caja(c public.contratos, p_numero int) returns date language plpgsql immutable as $$
declare
  v_previas int := coalesce(c.cajas_previas, 0);
  v_idx int; v_dias int[]; v_mes date; v_dia int; v_f date; v_count int := 0; v_ult int;
begin
  if c.fecha_inicio_cajas is null or p_numero <= v_previas then return null; end if;
  v_idx := p_numero - v_previas - 1;
  if c.forma_pago = 'Semanal' then return c.fecha_inicio_cajas + v_idx * 7; end if;
  if zala._es_calendario(c) then
    select array_agg(x order by x) into v_dias from unnest(zala._dias_pago_mes(c)) x;
    v_mes := date_trunc('month', c.fecha_inicio_cajas::timestamp)::date;
    for g in 0..399 loop
      v_ult := extract(day from (v_mes::timestamp + interval '1 month' - interval '1 day'))::int;
      foreach v_dia in array v_dias loop
        v_f := v_mes + (least(v_dia, v_ult) - 1);
        if v_f >= c.fecha_inicio_cajas then
          if v_count = v_idx then return v_f; end if;
          v_count := v_count + 1;
        end if;
      end loop;
      v_mes := (v_mes::timestamp + interval '1 month')::date;
    end loop;
  end if;
  return null;
end $$;

create or replace function zala.prorrateo_exigible_hoy(c public.contratos, p_hoy date) returns numeric language sql immutable as $$
  select case
    when greatest(coalesce(c.prorrateo_total, 0) - coalesce(c.prorrateo_pagado, 0), 0) <= 0 then 0
    when c.fecha_inicio_cajas is not null and p_hoy < c.fecha_inicio_cajas then 0
    else greatest(coalesce(c.prorrateo_total, 0) - coalesce(c.prorrateo_pagado, 0), 0) end
$$;

-- Días desde que se exigió la caja MÁS VIEJA sin llenar (0 = hoy mismo).
create or replace function zala.dias_en_mora_v2(c public.contratos, p_hoy date) returns int language plpgsql stable as $$
declare
  v_pagadas int := coalesce(c.cajas_pagadas, 0);
  v_exig int; v_pror numeric; v_k int; v_fecha date := null;
  v_dias int[]; v_mes date; v_dia int; v_f date; v_cont int := 0; v_ult int;
begin
  if c.fecha_inicio_cajas is null then return 0; end if;
  v_exig := public.cajas_exigidas(c, p_hoy);
  if v_exig <= v_pagadas then
    v_pror := greatest(coalesce(c.prorrateo_total, 0) - coalesce(c.prorrateo_pagado, 0), 0);
    if v_pror <= 0 then return 0; end if;
    return greatest(p_hoy - c.fecha_inicio_cajas, 0);
  end if;
  v_k := greatest(v_pagadas - coalesce(c.cajas_previas, 0) + 1, 1);
  if c.forma_pago = 'Semanal' then
    v_fecha := c.fecha_inicio_cajas + (v_k - 1) * 7;
  else
    select array_agg(x order by x) into v_dias from unnest(zala._dias_pago_mes(c)) x;
    v_mes := date_trunc('month', c.fecha_inicio_cajas::timestamp)::date;
    for g in 0..399 loop
      v_ult := extract(day from (v_mes::timestamp + interval '1 month' - interval '1 day'))::int;
      foreach v_dia in array v_dias loop
        v_f := v_mes + (least(v_dia, v_ult) - 1);
        if v_f >= c.fecha_inicio_cajas then
          v_cont := v_cont + 1;
          if v_cont = v_k then v_fecha := v_f; exit; end if;
        end if;
      end loop;
      exit when v_fecha is not null;
      v_mes := (v_mes::timestamp + interval '1 month')::date;
    end loop;
    if v_fecha is null then v_fecha := c.fecha_inicio_cajas; end if;
  end if;
  return greatest(p_hoy - v_fecha, 0);
end $$;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 4) LA CUENTA DE UN CONTRATO — espejo de loQueDebe (rama motor v2) + calcularEstadoCartera +
--    diasEnMora + desgloseExigible.proxima*. Devuelve CERO filas para Diario / sin motor: esa
--    cuenta vive en la oficina, la vitrina no la inventa.
-- ═══════════════════════════════════════════════════════════════════════════════════════════
create or replace function zala.cuenta_contrato(c public.contratos, cv public.convenios, p_abonado_convenio numeric, p_hoy date)
returns table (
  r_cajas_exigidas int, r_hueco_cajas numeric, r_prorrateo_pendiente numeric,
  r_cuota_toca numeric, r_cuota_pagado numeric, r_cuota_falta numeric, r_periodos_exigibles int,
  r_proximo_pago_fecha date, r_proximo_pago_monto numeric,
  r_acuerdo_toca numeric, r_acuerdo_pagado numeric, r_acuerdo_falta numeric,
  r_acuerdo_cuota_este_periodo numeric, r_acuerdo_proxima_fecha date,
  r_estado_cartera text, r_dias_mora int
) language plpgsql stable as $$
declare
  v_valor numeric; v_pagadas int; v_en_curso numeric; v_exig int;
  v_pror_pend numeric; v_pror_rest numeric; v_cubre date; v_cubierto boolean;
  v_n int := 0; v_suma numeric := 0; v_fecha date; v_monto numeric;
  v_falta numeric; v_pror_total numeric; v_toca numeric; v_prox_num int;
  v_ac record; v_cuota_conv numeric; v_estado text; v_dias int; v_hueco numeric;
begin
  if c.forma_pago = 'Diario' or not coalesce(c.motor_v2, false) then return; end if;

  v_valor := public.caja_valor(c);
  v_pagadas := coalesce(c.cajas_pagadas, 0);
  v_en_curso := coalesce(c.caja_actual_pagado, 0);
  v_exig := public.cajas_exigidas(c, p_hoy);
  v_pror_pend := zala.prorrateo_exigible_hoy(c, p_hoy);
  v_pror_rest := greatest(coalesce(c.prorrateo_total, 0) - coalesce(c.prorrateo_pagado, 0), 0);
  v_cubre := cv.cubre_periodo_hasta;
  v_cubierto := v_cubre is not null and v_cubre >= p_hoy;

  -- Cajas exigidas sin llenar, de la más vieja a la más nueva (FIFO), respetando la cobertura.
  for j in (v_pagadas + 1)..v_exig loop
    v_fecha := zala.fecha_caja(c, j);
    continue when v_fecha is null;
    v_monto := case when j = v_pagadas + 1 and v_en_curso > 0 then greatest(v_valor - v_en_curso, 0) else v_valor end;
    continue when v_monto <= 0;
    if (not v_cubierto) or v_fecha >= v_cubre then
      v_n := v_n + 1; v_suma := v_suma + v_monto;
    end if;
  end loop;

  v_falta := (case when v_cubierto then 0 else v_pror_pend end) + v_suma;
  v_pror_total := case when v_cubierto then 0
                       when v_pror_pend > 0 then greatest(coalesce(c.prorrateo_total, 0), v_pror_pend)
                       else 0 end;
  v_toca := case when v_n > 0 or v_pror_total > 0 then v_pror_total + v_n * v_valor else v_valor end;
  v_hueco := greatest((v_exig - v_pagadas) * v_valor - v_en_curso, 0);

  r_cajas_exigidas := v_exig;
  r_hueco_cajas := v_hueco;
  r_prorrateo_pendiente := v_pror_pend;
  r_cuota_toca := v_toca;
  r_cuota_falta := v_falta;
  r_cuota_pagado := greatest(v_toca - v_falta, 0);
  r_periodos_exigibles := v_n;

  -- Próximo pago (desgloseExigible): si el prorrateo aún no vence, lo próximo es el prorrateo.
  if v_pror_rest > 0 and v_pror_pend = 0 and c.fecha_inicio_cajas is not null then
    r_proximo_pago_fecha := c.fecha_inicio_cajas;
    r_proximo_pago_monto := v_pror_rest;
  else
    v_prox_num := greatest(v_exig, v_pagadas) + 1;
    r_proximo_pago_fecha := case when c.total_cajas is null or v_prox_num <= c.total_cajas then zala.fecha_caja(c, v_prox_num) else null end;
    r_proximo_pago_monto := case when v_prox_num = v_pagadas + 1 and v_en_curso > 0 then greatest(v_valor - v_en_curso, 0) else v_valor end;
  end if;

  -- El acuerdo.
  select * into v_ac from zala.acuerdo(cv, c, p_abonado_convenio, p_hoy);
  r_acuerdo_toca := v_ac.toca; r_acuerdo_pagado := v_ac.pagado; r_acuerdo_falta := v_ac.falta;
  v_cuota_conv := zala.cuota_convenio_del_periodo(cv, c, p_hoy);
  r_acuerdo_cuota_este_periodo := case when cv.id is null then null else v_cuota_conv end;
  r_acuerdo_proxima_fecha := zala.proxima_cuota_convenio(cv, c, p_hoy);

  -- Estado de cartera (calcularEstadoCartera, rama motor v2).
  if v_cubierto then
    v_estado := 'al-dia';
  else
    v_estado := 'al-dia';
    if v_pror_pend + v_hueco > 0 then
      v_dias := zala.dias_en_mora_v2(c, p_hoy);
      v_estado := case when v_dias = 0 then 'al-dia' when v_dias = 1 then 'gabela' else 'mora' end;
    end if;
    if v_estado = 'al-dia' and v_cuota_conv > 0 and coalesce(v_ac.falta, 0) > 0 then
      v_dias := p_hoy - zala.inicio_periodo_actual(c, p_hoy);
      v_estado := case when v_dias <= 0 then 'al-dia' when v_dias = 1 then 'gabela' else 'mora' end;
    end if;
  end if;
  r_estado_cartera := v_estado;
  r_dias_mora := case when v_estado = 'mora' then greatest(zala.dias_en_mora_v2(c, p_hoy) - 1, 0) else 0 end;
  return next;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 5) Palabras del negocio
-- ═══════════════════════════════════════════════════════════════════════════════════════════
create or replace function zala.moto_estado_texto(p_estado text) returns text language sql immutable as $$
  select case p_estado
    when 'Asignada' then 'con el cliente'
    when 'Disponible' then 'sin cliente, disponible'
    when 'Reservada' then 'reservada para una entrega'
    when 'Mantenimiento' then 'en taller'
    when 'Recuperada' then 'retenida en la empresa'
    when 'Fiscalia' then 'retenida por la Fiscalía'
    when 'Transito' then 'en patios de tránsito'
    when 'Garantia' then 'en garantía del concesionario'
    when 'En traspaso' then 'en traspaso al cliente (terminó de pagar)'
    else coalesce(p_estado, 'sin definir') end
$$;

create or replace function zala.concepto_deuda_texto(p text) returns text language sql immutable as $$
  select case p
    when 'multa_recoleccion' then 'multa por retención de la moto'
    when 'lavada' then 'lavada de la moto'
    when 'tarifa_atrasada' then 'arriendo atrasado'
    when 'migracion' then 'saldo que traía del sistema anterior'
    when 'daño_vehiculo' then 'daño al vehículo'
    when 'prestamo_repuesto' then 'repuesto prestado'
    when 'prestamo_eventualidad' then 'préstamo por eventualidad'
    when 'fotomulta' then 'fotomulta'
    else coalesce(p, 'otro') end
$$;

-- Corte de migración del contrato (corteMigracionContrato): su propio arranque si es migrado; si
-- no, el corte del grupo.
create or replace function zala._corte_migracion(c public.contratos, p_grupo text) returns date language sql immutable as $$
  select case
    when coalesce(c.es_migrado, false) and c.fecha_inicio_cajas is not null then c.fecha_inicio_cajas
    when p_grupo = 'PRADERA' then date '2026-07-01'
    when p_grupo = 'RASTREADOR' then date '2026-07-06'
    when p_grupo = 'COSTA' then date '2026-07-27'
    else date '2026-07-01' end
$$;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 6) zala.cliente — una fila por contrato vivo (Activo o Suspendido)
-- ═══════════════════════════════════════════════════════════════════════════════════════════
create or replace view zala.cliente as
with h as (select zala.hoy() as d),
pg as (
  select p.contrato_id,
         sum(coalesce(p.aplicado_convenio, 0))    as abonado_convenio,
         sum(coalesce(p.aplicado_saldo_favor, 0)) as saldo_favor_pagos,
         max(p.fecha)                              as ultimo_confirmado
  from public.pagos p where p.estado = 'Confirmado' group by p.contrato_id
),
pcaja as (
  select distinct on (p.contrato_id) p.contrato_id, p.fecha, p.valor, p.metodo
  from public.pagos p
  where p.estado = 'Confirmado' and coalesce(p.tipo_registro, 'normal') not in ('adelanto_base', 'saldo_favor')
  order by p.contrato_id, p.fecha desc, p.created_at desc
),
ppend as (select contrato_id, count(*) as n, sum(valor) as total from public.pagos where estado = 'Pendiente' group by contrato_id),
de as (
  select contrato_id,
         coalesce(sum(monto)           filter (where estado = 'pendiente'), 0)   as pend_original,
         coalesce(sum(monto_pendiente) filter (where estado = 'pendiente'), 0)   as pend_falta,
         coalesce(sum(monto_pendiente) filter (where estado = 'en_convenio'), 0) as en_convenio,
         jsonb_agg(jsonb_build_object('concepto', concepto, 'que_es', zala.concepto_deuda_texto(concepto),
                                      'descripcion', descripcion, 'falta', monto_pendiente, 'fecha', created_at::date)
                   order by created_at) filter (where estado = 'pendiente') as detalle
  from public.deudas group by contrato_id
),
plazo as (select contrato_id, max(plazo_extra_fecha_limite) as hasta from public.gestiones_cobro
          where tipo = 'plazo_extra' and plazo_extra_fecha_limite is not null group by contrato_id),
promesa as (select contrato_id, max(fecha_compromiso) as fecha from public.gestiones_cobro where fecha_compromiso is not null group by contrato_id),
prest as (select * from public.prestamos_reemplazo where estado = 'activo'),
tal as (select distinct on (moto_id) moto_id, fecha_ingreso, detalle from public.taller where estado_tecnico <> 'Finalizado' order by moto_id, created_at desc)
select
  c.id                                            as contrato_id,
  cl.id                                           as cliente_id,
  cl.nombre                                       as cliente,
  cl.cedula,
  cl.telefono,
  coalesce(nullif(cl.whatsapp, ''), cl.telefono)  as whatsapp,
  su.grupo,
  enc.nombre                                      as encargado,
  su.placa,
  zala.moto_estado_texto(su.estado)               as su_moto_estado,
  usa.placa                                       as placa_que_usa,
  (pr.id is not null)                             as en_prestamo,
  pr.fecha_inicio                                 as prestamo_desde,
  c.estado                                        as contrato_estado,
  (c.estado = 'Suspendido')                       as moto_retenida,
  c.motivo_suspension,
  c.forma_pago,
  zala.dia_pago_texto(c)                          as dia_pago,
  public.caja_valor(c)                            as cuota_periodo,
  c.fecha_entrega,
  c.cajas_pagadas                                 as va_cajas,
  c.total_cajas,
  (c.forma_pago <> 'Diario' and coalesce(c.motor_v2, false)) as cuenta_en_motor,
  q.r_cajas_exigidas                              as cajas_exigidas,
  q.r_prorrateo_pendiente                         as prorrateo_pendiente,
  q.r_cuota_toca                                  as cuota_toca,
  q.r_cuota_pagado                                as cuota_pagado,
  q.r_cuota_falta                                 as cuota_falta,
  cv.id                                           as convenio_id,
  cv.cuota_por_periodo                            as convenio_cuota,
  cv.deuda_total                                  as convenio_total,
  coalesce(pg.abonado_convenio, 0)                as convenio_abonado,
  q.r_acuerdo_toca                                as acuerdo_toca,
  q.r_acuerdo_pagado                              as acuerdo_pagado,
  q.r_acuerdo_falta                               as acuerdo_falta,
  q.r_acuerdo_cuota_este_periodo                  as acuerdo_cuota_este_periodo,
  q.r_acuerdo_proxima_fecha                       as acuerdo_proxima_fecha,
  cv.cubre_periodo_hasta                          as convenio_cubre_hasta,
  coalesce(de.en_convenio, 0)                     as deudas_dentro_del_convenio,
  coalesce(de.pend_original, 0)                   as deudas_toca,
  greatest(coalesce(de.pend_original, 0) - coalesce(de.pend_falta, 0), 0) as deudas_pagado,
  coalesce(de.pend_falta, 0)                      as deudas_falta,
  coalesce(de.detalle, '[]'::jsonb)               as deudas_detalle,
  case when q.r_cuota_falta is null then null
       else q.r_cuota_falta + coalesce(q.r_acuerdo_falta, 0) + coalesce(de.pend_falta, 0) end as debe_hoy,
  case when q.r_cuota_falta is null then 'Contrato diario o sin motor: la cuenta se consulta en la oficina.'
       else concat_ws(' + ',
              case when q.r_cuota_falta > 0 then zala.pesos(q.r_cuota_falta) || ' de su cuota' end,
              case when coalesce(q.r_acuerdo_falta, 0) > 0 then zala.pesos(q.r_acuerdo_falta) || ' de su acuerdo de pago' end,
              case when coalesce(de.pend_falta, 0) > 0 then zala.pesos(de.pend_falta) || ' de deudas' end)
       end                                          as debe_hoy_detalle,
  greatest(coalesce(c.saldo_favor_apertura, 0) + coalesce(pg.saldo_favor_pagos, 0), 0) as saldo_a_favor,
  q.r_estado_cartera                              as estado_cartera,
  case
    when c.estado = 'Suspendido' then 'moto retenida'
    when q.r_estado_cartera is null then 'cuenta en oficina'
    when q.r_estado_cartera = 'mora' then 'en mora' || case when q.r_dias_mora > 0 then ' hace ' || q.r_dias_mora || ' día' || case when q.r_dias_mora = 1 then '' else 's' end else '' end
    when q.r_estado_cartera = 'gabela' then 'en gabela (1 día de gracia)'
    when zala.es_dia_de_pago(c, h.d) then 'al día, le toca pagar hoy'
    else 'al día' end                              as estado_texto,
  coalesce(q.r_dias_mora, 0)                      as dias_mora,
  dsp.dias                                        as dias_sin_pago,
  plazo.hasta                                     as plazo_extra_hasta,
  (plazo.hasta is not null and plazo.hasta >= h.d) as plazo_extra_vigente,
  promesa.fecha                                   as promesa_pago_fecha,
  case
    when c.estado = 'Suspendido' then 'retenida'
    when q.r_estado_cartera is null then 'sin-motor'
    when q.r_estado_cartera = 'mora' and dsp.dias > 3 and dsp.dias < 999 and not (plazo.hasta is not null and plazo.hasta >= h.d) then 'recoleccion'
    when q.r_estado_cartera = 'mora' then 'mora'
    when q.r_estado_cartera = 'gabela' then 'gabela'
    when zala.es_dia_de_pago(c, h.d) then 'paga-hoy'
    else 'al-dia' end                             as balde_hoy,
  zala.es_dia_de_pago(c, h.d)                     as paga_hoy,
  q.r_proximo_pago_fecha                          as proximo_pago_fecha,
  q.r_proximo_pago_monto                          as proximo_pago_monto,
  pcaja.fecha                                     as ultimo_pago_fecha,
  pcaja.valor                                     as ultimo_pago_valor,
  pcaja.metodo                                    as ultimo_pago_metodo,
  coalesce(ppend.n, 0)                            as pagos_por_confirmar,
  coalesce(ppend.total, 0)                        as pagos_por_confirmar_valor,
  tal.fecha_ingreso                               as en_taller_desde,
  h.d                                             as calculado_para,
  now()                                           as calculado_el
from public.contratos c
join public.clientes cl on cl.id = c.cliente_id
cross join h
left join public.motos usa on usa.id = c.moto_id
left join prest pr on pr.contrato_id = c.id
left join public.motos orig on orig.id = pr.moto_original_id
left join lateral (select coalesce(orig.id, usa.id) as id, coalesce(orig.placa, usa.placa) as placa,
                          coalesce(orig.estado, usa.estado) as estado, coalesce(orig.grupo, usa.grupo) as grupo,
                          coalesce(orig.subadmin_id, usa.subadmin_id) as subadmin_id) su on true
left join public.profiles enc on enc.id = su.subadmin_id
left join public.convenios cv on cv.contrato_id = c.id and cv.estado = 'activo'
left join pg on pg.contrato_id = c.id
left join pcaja on pcaja.contrato_id = c.id
left join ppend on ppend.contrato_id = c.id
left join de on de.contrato_id = c.id
left join plazo on plazo.contrato_id = c.id
left join promesa on promesa.contrato_id = c.id
left join tal on tal.moto_id = su.id
left join lateral (
  -- diasSinPago de CobrosView: desde el último confirmado; sin pagos, desde la entrega topada al corte.
  select case
    when pg.ultimo_confirmado is not null then greatest(h.d - pg.ultimo_confirmado, 0)
    when c.fecha_entrega is not null then greatest(h.d - greatest(c.fecha_entrega, zala._corte_migracion(c, usa.grupo)), 0)
    else 999 end as dias
) dsp on true
left join lateral zala.cuenta_contrato(c, cv, coalesce(pg.abonado_convenio, 0), h.d) q on true
where c.estado in ('Activo', 'Suspendido');

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 7) zala.moto — una fila por moto
-- ═══════════════════════════════════════════════════════════════════════════════════════════
create or replace view zala.moto as
with h as (select zala.hoy() as d),
prest as (select * from public.prestamos_reemplazo where estado = 'activo'),
vivo as (select c.id, c.cliente_id, c.moto_id, c.estado from public.contratos c where c.estado in ('Activo', 'Suspendido')),
tal as (select distinct on (moto_id) moto_id, fecha_ingreso, detalle, estado_tecnico from public.taller where estado_tecnico <> 'Finalizado' order by moto_id, created_at desc)
select
  m.id                                  as moto_id,
  m.placa, m.marca, m.modelo, m.grupo,
  m.estado                              as estado_sistema,
  zala.moto_estado_texto(m.estado)      as estado,
  m.ubicacion_fisica,
  enc.nombre                            as encargado,
  cl.nombre                             as cliente,
  vc.estado                             as contrato_estado,
  case when po.id is not null then 'es la moto propia de un cliente que anda en una prestada'
       when pp.id is not null then 'está prestada como reemplazo'
       else null end                    as prestamo,
  m.retencion_fecha,
  m.retencion_numero_caso,
  tal.fecha_ingreso                     as en_taller_desde,
  tal.detalle                           as taller_motivo,
  tal.estado_tecnico                    as taller_estado,
  m.fecha_seguro                        as soat_vence,
  (m.fecha_seguro - h.d)                as soat_dias,
  m.fecha_tecnomecanica                 as tecnomecanica_vence,
  (m.fecha_tecnomecanica - h.d)         as tecnomecanica_dias
from public.motos m
cross join h
left join prest po on po.moto_original_id = m.id
left join prest pp on pp.moto_prestada_id = m.id
-- el contrato vivo: el que apunta a esta placa, o el del cliente cuya moto original es esta
left join vivo vc on vc.id = coalesce(po.contrato_id, (select v.id from vivo v where v.moto_id = m.id order by (v.estado = 'Activo') desc limit 1))
left join public.clientes cl on cl.id = vc.cliente_id
left join public.profiles enc on enc.id = m.subadmin_id
left join tal on tal.moto_id = m.id;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 8) zala.pagos — últimos 120 días
-- ═══════════════════════════════════════════════════════════════════════════════════════════
create or replace view zala.pagos as
select
  p.id            as pago_id,
  p.contrato_id,
  cl.nombre       as cliente,
  m.placa,
  p.fecha         as fecha_pago,
  p.fecha_registro,
  p.valor,
  p.metodo,
  p.estado,
  case p.estado when 'Confirmado' then 'confirmado, ya cuenta'
                when 'Pendiente' then 'recibido, en verificación'
                when 'Rechazado' then 'rechazado, no cuenta' else p.estado end as estado_texto,
  p.tipo_registro,
  (coalesce(p.tipo_registro, 'normal') not in ('adelanto_base', 'saldo_favor')) as es_plata_real,
  p.referencia,
  p.aplicado_tarifa, p.aplicado_convenio, p.aplicado_deuda, p.aplicado_saldo_favor, p.aplicado_ahorro,
  p.created_at    as registrado_el
from public.pagos p
join public.contratos c on c.id = p.contrato_id
join public.clientes cl on cl.id = c.cliente_id
left join public.motos m on m.id = c.moto_id
where p.fecha >= zala.hoy() - 120;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 9) zala.convenios — acuerdos vivos e incumplidos
-- ═══════════════════════════════════════════════════════════════════════════════════════════
create or replace view zala.convenios as
with h as (select zala.hoy() as d),
ab as (select contrato_id, sum(coalesce(aplicado_convenio, 0)) as abonado from public.pagos where estado = 'Confirmado' group by contrato_id),
dc as (select convenio_id, sum(monto_pendiente) as dentro, count(*) as n from public.deudas where estado = 'en_convenio' and convenio_id is not null group by convenio_id)
select
  cv.id              as convenio_id,
  cv.contrato_id,
  cl.nombre          as cliente,
  m.placa,
  cv.estado,
  case cv.estado when 'activo' then 'vigente'
                 when 'cumplido' then 'al día en sus cuotas (vuelve a vigente con cada período)'
                 when 'incumplido' then 'incumplido: se vencieron cuotas sin pagar'
                 when 'renovado' then 'reemplazado por otro acuerdo' else cv.estado end as estado_texto,
  cv.concepto,
  cv.cuota_por_periodo as cuota,
  cv.deuda_total       as total_pactado,
  coalesce(ab.abonado, 0) as abonado,
  a.toca               as exigido_a_hoy,
  a.falta              as falta_a_hoy,
  zala.cuota_convenio_del_periodo(cv, c, h.d) as cuota_este_periodo,
  zala.proxima_cuota_convenio(cv, c, h.d)     as proxima_cuota_fecha,
  cv.cubre_periodo_hasta as cubre_semanas_hasta,
  coalesce(dc.dentro, 0) as deudas_dentro,
  coalesce(dc.n, 0)      as deudas_dentro_n,
  (cv.created_at at time zone 'America/Bogota')::date as creado_el
from public.convenios cv
join public.contratos c on c.id = cv.contrato_id
join public.clientes cl on cl.id = c.cliente_id
left join public.motos m on m.id = c.moto_id
left join ab on ab.contrato_id = cv.contrato_id
left join dc on dc.convenio_id = cv.id
cross join h
left join lateral zala.acuerdo(cv, c, coalesce(ab.abonado, 0), h.d) a on true
where cv.estado in ('activo', 'incumplido');

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 10) zala.deudas — pendientes y las que entraron a un convenio
-- ═══════════════════════════════════════════════════════════════════════════════════════════
create or replace view zala.deudas as
select
  d.id             as deuda_id,
  d.contrato_id,
  cl.nombre        as cliente,
  m.placa,
  d.concepto,
  zala.concepto_deuda_texto(d.concepto) as que_es,
  d.descripcion,
  d.monto          as monto_original,
  d.monto_pendiente as falta,
  d.estado,
  case d.estado when 'pendiente' then 'se cobra aparte de la cuota'
                when 'en_convenio' then 'entró a un acuerdo de pago: se cobra por la cuota del acuerdo, no aparte'
                when 'pagada' then 'saldada' else d.estado end as estado_texto,
  d.convenio_id,
  (d.created_at at time zone 'America/Bogota')::date as registrada_el
from public.deudas d
join public.contratos c on c.id = d.contrato_id
join public.clientes cl on cl.id = c.cliente_id
left join public.motos m on m.id = c.moto_id
where d.estado in ('pendiente', 'en_convenio');

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 11) zala.diccionario — lo que ZALA lee PRIMERO. Si no está aquí, no existe para ZALA.
-- ═══════════════════════════════════════════════════════════════════════════════════════════
create table if not exists zala.diccionario (
  vista        text not null,
  columna      text not null,
  significado  text not null,
  valores      text,
  -- 'sí' · 'no' · 'solo si pregunta' · 'por confirmar' (recomendación del sistema, falta la palabra del dueño)
  zala_lo_dice text not null default 'sí',
  confirmado_por_dueno boolean not null default false,
  actualizado  timestamptz not null default now(),
  primary key (vista, columna)
);

insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno) values
-- reglas generales
('_reglas', '1_una_sola_cifra', 'La cifra que se cobra es UNA: debe_hoy. Ya resta lo pagado. Si ya pagó, dice 0. "Le falta por pagar", "total del acuerdo" y "deuda registrada" son tres cosas distintas: no se mezclan.', null, 'sí', true),
('_reglas', '2_saldo_a_favor', 'El saldo a favor se MUESTRA, nunca se resta solo de lo que debe. Se aplica a mano en la oficina.', null, 'por confirmar', false),
('_reglas', '3_la_mora_no_vive_en_clientes', 'La mora sale de estado_cartera (calculada), nunca del estado del cliente ni de la fecha del último pago.', null, 'sí', true),
('_reglas', '4_vocabulario', 'La moto recogida se llama RETENIDA. "Guardada" e "inmovilizada" se entienden como sinónimos, pero se dice retenida.', null, 'sí', true),
('_reglas', '5_zala_no_da_plazos', 'ZALA nunca promete plazos ni rebajas. Los plazos los da MotoGestión (máximo 1-2 días) y ZALA solo los informa si ya existen.', null, 'sí', true),
('_reglas', '6_diario_y_sin_motor', 'Los contratos Diario (y cualquier contrato sin motor) traen debe_hoy en null: su cuenta se consulta en la oficina. ZALA no la calcula.', null, 'sí', true),
-- cliente
('cliente', 'contrato_id', 'Identificador del contrato. Una fila por contrato vivo (Activo o Suspendido).', null, 'no', true),
('cliente', 'cliente', 'Nombre completo del cliente.', null, 'sí', true),
('cliente', 'cedula', 'Cédula.', null, 'solo si pregunta', true),
('cliente', 'telefono', 'Teléfono de contacto.', null, 'no', true),
('cliente', 'whatsapp', 'Número de WhatsApp por donde se le escribe (si no tiene aparte, el teléfono).', null, 'no', true),
('cliente', 'grupo', 'Portafolio del socio dueño de la moto.', 'COSTA · PRADERA · RASTREADOR · USADAS', 'no', true),
('cliente', 'encargado', 'Nombre del cobrador (subadmin) a cargo de su moto. Null = nadie asignado.', null, 'por confirmar', false),
('cliente', 'placa', 'La placa de SU moto (la de su contrato). Si anda en una prestada, esta es la suya, no la prestada.', null, 'sí', true),
('cliente', 'su_moto_estado', 'Dónde está su moto, en palabras.', 'con el cliente · en taller · retenida en la empresa · retenida por la Fiscalía · en patios de tránsito · en garantía del concesionario · en traspaso al cliente', 'sí', true),
('cliente', 'placa_que_usa', 'La placa que usa HOY. Distinta de placa solo cuando anda en una moto prestada.', null, 'sí', true),
('cliente', 'en_prestamo', 'Verdadero si anda en una moto prestada mientras la suya está guardada. El alquiler de la prestada se cobra aparte.', 'true · false', 'sí', true),
('cliente', 'prestamo_desde', 'Desde qué día anda en la prestada.', null, 'sí', true),
('cliente', 'contrato_estado', 'Activo = tiene la moto y se le cobra. Suspendido = la moto no está con él (retenida o la entregó), el contrato sigue vivo.', 'Activo · Suspendido', 'sí', true),
('cliente', 'moto_retenida', 'Verdadero si la moto está retenida en la empresa (contrato Suspendido). No se le sale a cobrar; debe_hoy es lo que necesita pagar para recuperarla.', 'true · false', 'sí', true),
('cliente', 'motivo_suspension', 'Por qué está suspendido: mora = se le recogió; temporal = él la entregó (incapacidad u otro motivo).', 'mora · temporal · null', 'sí', true),
('cliente', 'forma_pago', 'Cada cuánto paga.', 'Diario · Semanal · Quincenal · Mensual', 'sí', true),
('cliente', 'dia_pago', 'Qué día le toca pagar, en palabras.', 'Lunes · Miércoles · Días 15 y 30 · …', 'sí', true),
('cliente', 'cuota_periodo', 'Cuánto vale su cuota completa de un período (semana, quincena o mes).', null, 'sí', true),
('cliente', 'fecha_entrega', 'Cuándo recibió la moto.', null, 'sí', true),
('cliente', 'va_cajas', 'Cuántos períodos (cajas) lleva pagados.', null, 'sí', true),
('cliente', 'total_cajas', 'Cuántos períodos debe pagar en total para que la moto sea suya. El contrato termina por pagos hechos, no por fecha.', null, 'sí', true),
('cliente', 'cuenta_en_motor', 'Verdadero si la cuenta la lleva el motor de cajas (todo lo de tiempo definido). Falso = Diario: cuenta en oficina.', 'true · false', 'no', true),
('cliente', 'cajas_exigidas', 'Cuántos períodos se le han exigido hasta hoy.', null, 'no', true),
('cliente', 'prorrateo_pendiente', 'Lo que falta de sus primeros días sueltos (antes del primer día de pago). Ya está sumado en cuota_falta.', null, 'no', true),
('cliente', 'cuota_toca', 'Todo lo que se le exige hoy de arriendo (una cuota completa por cada período vencido, más el prorrateo). Al día = la cuota del período como referencia.', null, 'no', true),
('cliente', 'cuota_pagado', 'De cuota_toca, cuánto ya pagó.', null, 'no', true),
('cliente', 'cuota_falta', 'De arriendo, cuánto le falta HOY. Parte de debe_hoy.', null, 'sí', true),
('cliente', 'convenio_id', 'Identificador del acuerdo de pago vigente. Null = no tiene.', null, 'no', true),
('cliente', 'convenio_cuota', 'Cuánto paga de acuerdo cada período, encima de su cuota normal.', null, 'sí', true),
('cliente', 'convenio_total', 'El total pactado del acuerdo. Nunca se le exige más que esto.', null, 'solo si pregunta', false),
('cliente', 'convenio_abonado', 'Cuánto ha abonado al acuerdo en total.', null, 'solo si pregunta', false),
('cliente', 'acuerdo_toca', 'Cuánto del acuerdo se le ha exigido acumulado hasta hoy (con arrastre).', null, 'no', true),
('cliente', 'acuerdo_pagado', 'De acuerdo_toca, cuánto ya abonó.', null, 'no', true),
('cliente', 'acuerdo_falta', 'Del acuerdo, cuánto le falta HOY (se arrastra: si abonó de menos, la diferencia sigue). Parte de debe_hoy.', null, 'sí', true),
('cliente', 'acuerdo_cuota_este_periodo', 'Si este período le toca cuota de acuerdo (0 durante el prorrateo o mientras el acuerdo cubre semanas).', null, 'no', true),
('cliente', 'acuerdo_proxima_fecha', 'Cuándo cae su próxima cuota del acuerdo.', null, 'sí', true),
('cliente', 'convenio_cubre_hasta', 'Hasta esa fecha sus semanas están financiadas DENTRO del acuerdo: no paga cuota normal aparte.', null, 'solo si pregunta', false),
('cliente', 'deudas_dentro_del_convenio', 'Plata de deudas que entró al acuerdo. NO se cobra aparte: ya va en la cuota del acuerdo.', null, 'solo si pregunta', false),
('cliente', 'deudas_toca', 'Total original de sus deudas sueltas (pendientes).', null, 'no', true),
('cliente', 'deudas_pagado', 'De esas deudas, cuánto ya abonó.', null, 'no', true),
('cliente', 'deudas_falta', 'De deudas sueltas, cuánto le falta HOY. Parte de debe_hoy.', null, 'sí', true),
('cliente', 'deudas_detalle', 'Lista de sus deudas sueltas: qué es, descripción, cuánto falta, fecha.', 'json: [{concepto, que_es, descripcion, falta, fecha}]', 'sí', true),
('cliente', 'debe_hoy', 'LA CIFRA. Todo lo que debe pagar hoy: cuota_falta + acuerdo_falta + deudas_falta. Ya resta lo pagado. Null = cuenta en oficina.', null, 'sí', true),
('cliente', 'debe_hoy_detalle', 'debe_hoy explicado en palabras: "$ 202.000 de su cuota + $ 100.000 de su acuerdo de pago".', null, 'sí', true),
('cliente', 'saldo_a_favor', 'Plata que ya entregó y quedó guardada a su nombre. Se muestra, NUNCA se resta de debe_hoy.', null, 'por confirmar', false),
('cliente', 'estado_cartera', 'Cómo va pagando, la misma cuenta de Cartera y de la campana. Null = cuenta en oficina.', 'al-dia · gabela · mora', 'sí', true),
('cliente', 'estado_texto', 'estado_cartera en palabras, listo para decirlo.', 'al día · al día, le toca pagar hoy · en gabela (1 día de gracia) · en mora hace N días · moto retenida · cuenta en oficina', 'sí', true),
('cliente', 'dias_mora', 'Días que lleva en mora (desde el período vencido más viejo, sin contar el día de gracia). 0 si no está en mora.', null, 'sí', true),
('cliente', 'dias_sin_pago', 'Días desde su último pago confirmado (o desde que arrancó a pagar, si nunca ha pagado). 999 = sin referencia. Es un dato interno de gestión, no una mora.', null, 'no', true),
('cliente', 'plazo_extra_hasta', 'Si la empresa le dio un plazo, hasta qué día. Null = no tiene. ZALA nunca lo otorga.', null, 'por confirmar', false),
('cliente', 'plazo_extra_vigente', 'Verdadero si ese plazo todavía corre. Mientras corre no se le recoge la moto.', 'true · false', 'por confirmar', false),
('cliente', 'promesa_pago_fecha', 'Última fecha en que prometió pagar (registrada por el cobrador).', null, 'por confirmar', false),
('cliente', 'balde_hoy', 'En qué grupo cae hoy para la gestión del día (panel Hoy de Cartera).', 'recoleccion (mora de más de 3 días sin plazo) · mora · gabela · paga-hoy · al-dia · retenida · sin-motor', 'no', true),
('cliente', 'paga_hoy', 'Verdadero si hoy es su día de pago.', 'true · false', 'sí', true),
('cliente', 'proximo_pago_fecha', 'Cuándo es su próximo pago (la próxima caja, o el prorrateo si aún no vence).', null, 'sí', true),
('cliente', 'proximo_pago_monto', 'Cuánto es ese próximo pago.', null, 'sí', true),
('cliente', 'ultimo_pago_fecha', 'Fecha de su último pago real confirmado (no cuenta movimientos internos).', null, 'sí', true),
('cliente', 'ultimo_pago_valor', 'Valor de ese último pago.', null, 'sí', true),
('cliente', 'ultimo_pago_metodo', 'Cómo pagó la última vez.', 'Efectivo · Transferencia', 'sí', true),
('cliente', 'pagos_por_confirmar', 'Cuántos pagos suyos están recibidos pero en verificación. Todavía NO bajan lo que debe.', null, 'sí', true),
('cliente', 'pagos_por_confirmar_valor', 'Cuánto suman esos pagos en verificación.', null, 'sí', true),
('cliente', 'en_taller_desde', 'Si su moto tiene una orden de taller abierta, desde cuándo.', null, 'sí', true),
('cliente', 'calculado_para', 'La fecha (Colombia) para la que se calculó la fila. Siempre hoy.', null, 'no', true),
('cliente', 'calculado_el', 'Momento exacto del cálculo. La vista está viva: cada consulta recalcula.', null, 'no', true),
-- moto
('moto', 'placa', 'Placa.', null, 'sí', true),
('moto', 'estado', 'Dónde está la moto, en palabras.', 'con el cliente · sin cliente, disponible · reservada para una entrega · en taller · retenida en la empresa · retenida por la Fiscalía · en patios de tránsito · en garantía del concesionario · en traspaso al cliente', 'sí', true),
('moto', 'estado_sistema', 'El estado tal como está guardado (para cruzar con MotoGestión).', 'Disponible · Reservada · Asignada · Mantenimiento · Recuperada · Fiscalia · Transito · Garantia · En traspaso', 'no', true),
('moto', 'ubicacion_fisica', 'Dónde está físicamente según el último registro. OJO: puede no coincidir con el estado; para saber si está con el cliente manda estado.', 'con_cliente · bodega · oficina · taller · patios_transito · fiscalia · otro', 'no', true),
('moto', 'cliente', 'Nombre del cliente de esta moto (por contrato vivo, o por préstamo si es la original de alguien que anda en una prestada).', null, 'sí', true),
('moto', 'encargado', 'Cobrador a cargo.', null, 'por confirmar', false),
('moto', 'prestamo', 'Si participa en un préstamo de reemplazo, en qué papel.', null, 'sí', true),
('moto', 'retencion_fecha', 'Desde cuándo está retenida por Fiscalía/Tránsito/Garantía (se borra al liberarla).', null, 'sí', true),
('moto', 'en_taller_desde', 'Desde cuándo tiene una orden de taller abierta.', null, 'sí', true),
('moto', 'soat_vence', 'Vencimiento del SOAT. soat_dias negativo = ya vencido.', null, 'sí', true),
('moto', 'tecnomecanica_vence', 'Vencimiento de la tecnomecánica. tecnomecanica_dias negativo = ya vencida.', null, 'sí', true),
-- pagos
('pagos', 'estado', 'Confirmado cuenta; Pendiente está en verificación y todavía no baja la deuda; Rechazado no cuenta.', 'Confirmado · Pendiente · Rechazado', 'sí', true),
('pagos', 'tipo_registro', 'De dónde salió el pago. adelanto_base y saldo_favor son movimientos INTERNOS, no plata que entró ese día.', 'normal · campo · transferencia · adelanto_base · alquiler_reemplazo · saldo_favor', 'no', true),
('pagos', 'es_plata_real', 'Verdadero si es plata que entró de verdad (excluye adelanto_base y saldo_favor).', 'true · false', 'no', true),
('pagos', 'fecha_pago', 'Cuándo PAGÓ el cliente.', null, 'sí', true),
('pagos', 'fecha_registro', 'Cuándo se digitó en la oficina.', null, 'no', true),
('pagos', 'referencia', 'Referencia de la transferencia. Una referencia = un valor exacto.', null, 'solo si pregunta', true),
-- convenios
('convenios', 'estado', 'vigente · cumplido (vuelve a vigente con cada período: NO significa terminado) · incumplido · renovado.', 'activo · cumplido · incumplido · renovado', 'sí', true),
('convenios', 'cuota', 'Cuota del acuerdo por período, encima de la cuota normal. Se arrastra.', null, 'sí', true),
('convenios', 'total_pactado', 'Total del acuerdo. Nunca se exige más.', null, 'solo si pregunta', false),
('convenios', 'exigido_a_hoy', 'Cuánto del acuerdo se le ha exigido acumulado.', null, 'no', true),
('convenios', 'falta_a_hoy', 'Cuánto del acuerdo le falta hoy (con arrastre).', null, 'sí', true),
('convenios', 'cubre_semanas_hasta', 'Hasta esa fecha las semanas del arriendo están dentro del acuerdo: no se cobra cuota normal aparte.', null, 'solo si pregunta', false),
('convenios', 'deudas_dentro', 'Deudas que entraron al acuerdo (no se cobran aparte).', null, 'solo si pregunta', false),
-- deudas
('deudas', 'estado', 'pendiente se cobra aparte; en_convenio ya va dentro de la cuota del acuerdo.', 'pendiente · en_convenio', 'sí', true),
('deudas', 'que_es', 'El concepto en palabras.', 'multa por retención de la moto · lavada de la moto · arriendo atrasado · saldo que traía del sistema anterior · daño al vehículo · repuesto prestado · préstamo por eventualidad · fotomulta · otro', 'sí', true),
('deudas', 'falta', 'Cuánto falta de esa deuda.', null, 'sí', true)
on conflict (vista, columna) do update set
  significado = excluded.significado, valores = excluded.valores,
  zala_lo_dice = excluded.zala_lo_dice, confirmado_por_dueno = excluded.confirmado_por_dueno,
  actualizado = now();

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 12) El rol de ZALA: solo lee el esquema zala. Nace SIN login; la contraseña la pone el dueño.
-- ═══════════════════════════════════════════════════════════════════════════════════════════
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'zala_lector') then
    create role zala_lector nologin;
  end if;
end $$;
grant usage on schema zala to zala_lector;
grant select on all tables in schema zala to zala_lector;
alter default privileges in schema zala grant select on tables to zala_lector;
-- Las funciones del esquema las ejecuta la vista como su dueño; el lector no necesita más.

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 13) Puerta de verificación desde la app (para la prueba espejo y los informes del admin).
--     Devuelve la vitrina como JSON; solo para ADMIN / ADMIN_PRINCIPAL / ANALISTA.
-- ═══════════════════════════════════════════════════════════════════════════════════════════
create or replace function public.zala_vitrina(p_vista text)
returns setof jsonb language plpgsql stable security definer set search_path = public, zala as $$
begin
  if public.mi_rol() not in ('ADMIN', 'ADMIN_PRINCIPAL', 'ANALISTA') then
    raise exception 'Solo el administrador puede leer la vitrina desde la app.';
  end if;
  case p_vista
    when 'cliente'     then return query select to_jsonb(v) from zala.cliente v;
    when 'moto'        then return query select to_jsonb(v) from zala.moto v;
    when 'pagos'       then return query select to_jsonb(v) from zala.pagos v;
    when 'convenios'   then return query select to_jsonb(v) from zala.convenios v;
    when 'deudas'      then return query select to_jsonb(v) from zala.deudas v;
    when 'diccionario' then return query select to_jsonb(v) from zala.diccionario v;
    else raise exception 'Vista desconocida: %', p_vista;
  end case;
end $$;
revoke all on function public.zala_vitrina(text) from public;
grant execute on function public.zala_vitrina(text) to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ═══════════════════════════════════════════════════════════════════════════════════════════
select 'filas' as que, (select count(*) from zala.cliente) as cliente, (select count(*) from zala.moto) as moto,
       (select count(*) from zala.convenios) as convenios, (select count(*) from zala.deudas) as deudas,
       (select count(*) from zala.diccionario) as diccionario;

select estado_cartera, balde_hoy, count(*) from zala.cliente group by 1, 2 order by 1, 2;

select cliente, placa, placa_que_usa, en_prestamo, su_moto_estado, estado_texto, debe_hoy, debe_hoy_detalle,
       cuota_falta, acuerdo_falta, deudas_falta, saldo_a_favor, proximo_pago_fecha, proximo_pago_monto, encargado
from zala.cliente where placa = 'DQF56I';
