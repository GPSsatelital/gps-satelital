-- 132 — LA VITRINA CUENTA LOS ABONOS DEL ACUERDO DESDE SU FIRMA (no los de acuerdos anteriores)
--       + el encargado con id y WhatsApp (pedido del contrato ZALA §5.1 y del dueño, 8-sep)
--
-- EL DEFECTO (encontrado el 8-sep-2026 al rehacerle el convenio a BRADER GUZMAN, YAL65H):
-- tres piezas contaban "cuánto lleva abonado al acuerdo" y NO decían lo mismo:
--   · el MOTOR (mig 119, el que decide si un acuerdo se cumplió): solo pagos con
--     `created_at >= convenio.created_at` — desde la firma de ESE acuerdo.
--   · la NÓMINA (nominaCobradores.ts): igual, "desde la firma".
--   · CARTERA (`loQueDebe` → `faltaDelAcuerdo`) y ESTA VITRINA: TODOS los pagos del contrato.
-- La prueba espejo nunca lo vio porque Cartera y la vitrina estaban mal DE LA MISMA FORMA.
-- Hoy ningún contrato tenía dos acuerdos; Brader es el primero: su convenio #2 nacía con los
-- $148.000 del #1 (borrado) acreditados, y el lunes 14 ZALA le habría dicho "no debe nada del
-- acuerdo" teniendo una cuota vencida. Cartera ya quedó corregida (cicloPago.ts, con prueba).
--
-- QUÉ HACE:
--   1) `profiles.whatsapp` — el número de cada funcionario vive en su usuario (decisión del
--      dueño, 8-sep): reemplaza el archivo a mano que ZALA mantenía y que ya falló por una tilde.
--   2) `zala.cliente`: el abonado al acuerdo se cuenta desde la firma del acuerdo VIGENTE.
--      Y gana dos columnas AL FINAL: `encargado_id` y `encargado_whatsapp`.
--   3) `zala.convenios`: mismo corte, por acuerdo.
--   4) Diccionario: las 2 columnas nuevas y el significado corregido de `convenio_abonado`.
--
-- POR QUÉ `create or replace` y no `drop`: solo se AGREGAN columnas al final y se cambia la
-- consulta por dentro — eso Postgres lo permite. Y es un seguro: si la vista viva no fuera la de
-- la mig 126 (columnas distintas), el `replace` FALLA en vez de pisarla a ciegas.

-- ── 1) El WhatsApp de cada funcionario, en su usuario ────────────────────────────────────────
alter table public.profiles add column if not exists whatsapp text;
comment on column public.profiles.whatsapp is
  'WhatsApp del funcionario (solo dígitos, con 57). Lo lee ZALA por zala.cliente.encargado_whatsapp para reenviarle los comprobantes de sus motos. Se captura en Usuarios → editar.';

-- ── 2) zala.cliente ──────────────────────────────────────────────────────────────────────────
create or replace view zala.cliente as
with h as (select zala.hoy() as d),
pg as (
  select p.contrato_id,
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
  ab.abonado                                      as convenio_abonado,
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
  now()                                           as calculado_el,
  -- ★ 132: el encargado por id (el reparto de ZALA deja de depender de que dos nombres
  --   coincidan letra por letra) y su WhatsApp, tomado de su usuario en MotoGestión.
  su.subadmin_id                                  as encargado_id,
  enc.whatsapp                                    as encargado_whatsapp
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
-- ★ 132: lo abonado al acuerdo VIGENTE, solo con pagos desde su firma — el corte del motor (119).
left join lateral (
  select coalesce(sum(p.aplicado_convenio), 0) as abonado
  from public.pagos p
  where cv.id is not null and p.contrato_id = c.id and p.estado = 'Confirmado' and p.created_at >= cv.created_at
) ab on true
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
left join lateral zala.cuenta_contrato(c, cv, ab.abonado, h.d) q on true
where c.estado in ('Activo', 'Suspendido');

-- ── 3) zala.convenios — mismo corte, por acuerdo ─────────────────────────────────────────────
create or replace view zala.convenios as
with h as (select zala.hoy() as d),
-- ★ 132: abonado POR ACUERDO, con pagos desde su firma (antes: por contrato, todos los pagos).
ab as (
  select cv.id as convenio_id, coalesce(sum(p.aplicado_convenio), 0) as abonado
  from public.convenios cv
  left join public.pagos p on p.contrato_id = cv.contrato_id and p.estado = 'Confirmado' and p.created_at >= cv.created_at
  group by cv.id
),
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
left join ab on ab.convenio_id = cv.id
left join dc on dc.convenio_id = cv.id
cross join h
left join lateral zala.acuerdo(cv, c, coalesce(ab.abonado, 0), h.d) a on true
where cv.estado in ('activo', 'incumplido');

-- `create or replace` conserva los permisos; esto es solo un seguro (lección de la 131).
grant select on zala.cliente, zala.convenios to zala_lector;

-- ── 4) Diccionario ───────────────────────────────────────────────────────────────────────────
insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno) values
('cliente', 'convenio_abonado', 'Lo abonado al acuerdo VIGENTE, contando solo pagos hechos desde que se firmó ESE acuerdo (mig 132). Los abonos de un acuerdo anterior del mismo contrato no cuentan: ya se aplicaron a sus deudas cuando se rehizo.', null, 'sí', true),
('cliente', 'encargado_id', 'El id del encargado (profiles.id): el SUBADMIN de la moto — de la moto ORIGINAL si el cliente anda en una prestada. Nunca visitador ni admin. Para repartir por id y no por nombre.', null, 'no', true),
('cliente', 'encargado_whatsapp', 'WhatsApp del encargado, tomado de su usuario en MotoGestión (Usuarios → editar). Vacío = falta registrarlo: un comprobante de esta moto no tendría a dónde reenviarse.', null, 'no', true)
on conflict (vista, columna) do update set
  significado = excluded.significado, valores = excluded.valores, zala_lo_dice = excluded.zala_lo_dice, actualizado = now();

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- a) La vista quedó con 67 columnas (65 de la 126 + 2 nuevas). Si el replace hubiera fallado, no llega aquí.
select count(*) as columnas_zala_cliente
  from information_schema.columns where table_schema = 'zala' and table_name = 'cliente';

-- b) Para CADA acuerdo vigente, la vitrina y el motor dicen lo mismo. `diferencias` debe ser 0.
select count(*) as acuerdos_vigentes,
       count(*) filter (where v.convenio_abonado <> m.motor) as diferencias
  from zala.cliente v
  join public.convenios cv on cv.id = v.convenio_id
  cross join lateral (
    select coalesce(sum(p.aplicado_convenio), 0) as motor from public.pagos p
     where p.contrato_id = v.contrato_id and p.estado = 'Confirmado' and p.created_at >= cv.created_at
  ) m;

-- c) BRADER: su convenio #2 debe salir con abonado 0 (no los $148.000 del #1).
select cliente, placa, convenio_total, convenio_abonado, acuerdo_toca, acuerdo_falta, debe_hoy,
       encargado, encargado_id, encargado_whatsapp
  from zala.cliente where placa = 'YAL65H';

-- d) Cuántas motos con contrato vivo tienen encargado sin WhatsApp registrado (lo que falta llenar en Usuarios).
select count(*) filter (where encargado_id is null) as motos_sin_encargado,
       count(*) filter (where encargado_id is not null and encargado_whatsapp is null) as encargados_sin_whatsapp,
       count(distinct encargado_id) filter (where encargado_whatsapp is null and encargado_id is not null) as personas_a_las_que_falta
  from zala.cliente;
