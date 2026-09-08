-- 134 — LA VITRINA LISTA PARA QUE ZALA ARME LA TANDA SOLA
--
-- Hasta aquí la vitrina le daba a ZALA la CIFRA (debe_hoy) pero no le decía a quién escribir ni con
-- qué mensaje: eso lo seguía decidiendo ZALA por su cuenta (contra columnas que no existen, como
-- `contratos.en_lista_negra`). Regla del dueño: la decisión la toma MotoGestión y ZALA la obedece.
--
-- QUÉ AGREGA (todo AL FINAL de las vistas; `create or replace` falla si la vista viva no fuera la
-- esperada, en vez de pisarla):
--   zala.cliente
--     · zala_puede_escribir + no_escribir_porque — lista negra = no (clientes.lista_negra) · sin número
--       de WhatsApp válido = no · moto retenida = SÍ (decisión del dueño 8-sep: "para hacerle gestión")
--     · cobro_automatico — entra en la tanda automática: puede escribir ∧ contrato Activo ∧ cuenta en
--       motor (cifra verificada) ∧ sin plazo extra vigente ∧ sin promesa de pago para hoy o después.
--       Las dos últimas son la lectura prudente: si se le dio plazo o prometió pagar el jueves, un
--       cobro automático el martes contradice lo que un funcionario ya acordó. Ajustable en una línea.
--     · plantilla_hoy — la CLAVE del mensaje que le toca hoy (dia_pago · gabela · mora · recoleccion ·
--       moto_retenida · null). Es la clave, no el nombre de Meta: la traducción vive en zala.plantillas.
--     · debe_hoy_texto — la cifra ya escrita como la lee el cliente ("$202.000").
--   zala.plantillas — clave → plantilla_meta, variables en orden, texto y si está activa (mig 133).
--   zala.pagos.registrado_por — quién digitó el pago (pedido del contrato ZALA §5.4).
--
-- CÓMO ARMA ZALA LA TANDA con esto (cero cuentas de su lado):
--   select * from zala.cliente where cobro_automatico  →  por cada fila, plantilla_hoy  →
--   zala.plantillas (plantilla_meta + variables)  →  variables desde la misma fila:
--   nombre = cliente · placa · valor = debe_hoy_texto · dias = dias_mora  →  enviar.

-- ── 0) Un número de WhatsApp que sirve: 10 dígitos que empiezan por 3, o 12 que empiezan por 57 ─
create or replace function zala.whatsapp_valido(p text) returns boolean language sql immutable as $$
  select case
    when p is null then false
    when length(regexp_replace(p, '\D', '', 'g')) = 10 and left(regexp_replace(p, '\D', '', 'g'), 1) = '3' then true
    when length(regexp_replace(p, '\D', '', 'g')) = 12 and left(regexp_replace(p, '\D', '', 'g'), 2) = '57' then true
    else false end
$$;

-- ── 1) zala.plantillas — la clave y su plantilla vigente en Meta ──────────────────────────────
create or replace view zala.plantillas as
select
  clave,
  plantilla_meta,
  variables,
  activa,
  texto,
  updated_at::date as texto_editado_el
from public.mensajes_whatsapp;

grant select on zala.plantillas to zala_lector;

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
  su.subadmin_id                                  as encargado_id,
  enc.whatsapp                                    as encargado_whatsapp,
  -- ★ 134: la decisión de a quién se le escribe la toma MotoGestión; ZALA la obedece.
  (zala.whatsapp_valido(coalesce(nullif(cl.whatsapp, ''), cl.telefono)) and not coalesce(cl.lista_negra, false)) as zala_puede_escribir,
  case when coalesce(cl.lista_negra, false) then 'lista negra'
       when not zala.whatsapp_valido(coalesce(nullif(cl.whatsapp, ''), cl.telefono)) then 'sin número de WhatsApp válido'
       else null end                             as no_escribir_porque,
  -- ★ 134: entra en la tanda automática. Retenidas NO (se les escribe, pero a mano: es gestión).
  (zala.whatsapp_valido(coalesce(nullif(cl.whatsapp, ''), cl.telefono)) and not coalesce(cl.lista_negra, false)
     and c.estado = 'Activo'
     and q.r_cuota_falta is not null
     and not (plazo.hasta is not null and plazo.hasta >= h.d)
     and not (promesa.fecha is not null and promesa.fecha >= h.d)) as cobro_automatico,
  -- ★ 134: la CLAVE del mensaje de hoy. La plantilla de Meta se busca en zala.plantillas.
  case
    when c.estado = 'Suspendido' then 'moto_retenida'
    when q.r_estado_cartera is null then null
    when q.r_estado_cartera = 'mora' and dsp.dias > 3 and dsp.dias < 999 and not (plazo.hasta is not null and plazo.hasta >= h.d) then 'recoleccion'
    when q.r_estado_cartera = 'mora' then 'mora'
    when q.r_estado_cartera = 'gabela' then 'gabela'
    when zala.es_dia_de_pago(c, h.d) then 'dia_pago'
    else null end                                as plantilla_hoy,
  case when q.r_cuota_falta is null then null
       else zala.pesos(q.r_cuota_falta + coalesce(q.r_acuerdo_falta, 0) + coalesce(de.pend_falta, 0)) end as debe_hoy_texto
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
  select case
    when pg.ultimo_confirmado is not null then greatest(h.d - pg.ultimo_confirmado, 0)
    when c.fecha_entrega is not null then greatest(h.d - greatest(c.fecha_entrega, zala._corte_migracion(c, usa.grupo)), 0)
    else 999 end as dias
) dsp on true
left join lateral zala.cuenta_contrato(c, cv, ab.abonado, h.d) q on true
where c.estado in ('Activo', 'Suspendido');

-- ── 3) zala.pagos — quién lo registró ────────────────────────────────────────────────────────
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
  p.created_at    as registrado_el,
  pr.nombre       as registrado_por
from public.pagos p
join public.contratos c on c.id = p.contrato_id
join public.clientes cl on cl.id = c.cliente_id
left join public.motos m on m.id = c.moto_id
left join public.profiles pr on pr.id = p.registrado_por
where p.fecha >= zala.hoy() - 120;

grant select on zala.cliente, zala.pagos to zala_lector;

-- ── 4) Diccionario ───────────────────────────────────────────────────────────────────────────
insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno) values
('cliente', 'zala_puede_escribir', 'Si ZALA puede escribirle a este cliente. La decisión la toma MotoGestión: no si está en lista negra o no tiene número válido. A la moto retenida SÍ se le escribe (decisión del dueño 8-sep).', 'true · false', 'no', true),
('cliente', 'no_escribir_porque', 'Por qué no se le puede escribir. Vacío cuando sí se puede.', 'lista negra · sin número de WhatsApp válido', 'no', true),
('cliente', 'cobro_automatico', 'Si entra en la tanda automática de cobro: puede escribir ∧ contrato Activo ∧ cuenta en motor (cifra verificada) ∧ sin plazo extra vigente ∧ sin promesa de pago para hoy o después. La retenida NO entra: se le escribe a mano, como gestión.', 'true · false', 'no', true),
('cliente', 'plantilla_hoy', 'La CLAVE del mensaje que le toca hoy según su estado. La plantilla de Meta se busca en zala.plantillas por esta clave. Vacío = hoy no le toca ningún mensaje automático.', 'dia_pago · gabela · mora · recoleccion · moto_retenida', 'no', true),
('cliente', 'debe_hoy_texto', 'debe_hoy ya escrito como lo lee el cliente ("$202.000"). Es la variable {valor} de las plantillas. Vacío en Diario/sin motor.', null, 'sí', true),
('pagos', 'registrado_por', 'Nombre del funcionario que digitó el pago en MotoGestión (contrato ZALA §5.4).', null, 'no', true),
('plantillas', 'clave', 'La clave estable de cada mensaje. Es lo que trae zala.cliente.plantilla_hoy.', 'dia_pago · gabela · mora · recoleccion · moto_retenida · acuse_comprobante · recibo · recibo_campo · cuentas_pago · contacto_general', 'no', true),
('plantillas', 'plantilla_meta', 'Nombre de la plantilla aprobada en Meta que hoy está vigente para la clave. Cambiarla en MotoGestión = ZALA la usa al instante. Vacío = aún no registrada: solo texto dentro de la ventana de 24 h.', null, 'no', true),
('plantillas', 'variables', 'Orden de los comodines para {{1}}, {{2}}… de Meta. Los valores salen de zala.cliente: nombre = cliente · placa · valor = debe_hoy_texto · dias = dias_mora.', null, 'no', true),
('plantillas', 'texto', 'El mismo mensaje con comodines {nombre} {placa} {valor} {dias}, para mandarlo como texto cuando la ventana de 24 h está abierta. Lo edita el dueño en Configuración.', null, 'no', true),
('plantillas', 'activa', 'false = no se manda por ningún canal.', 'true · false', 'no', true)
on conflict (vista, columna) do update set
  significado = excluded.significado, valores = excluded.valores, zala_lo_dice = excluded.zala_lo_dice, actualizado = now();

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- a) 72 columnas (67 + 5) y 10 plantillas.
select (select count(*) from information_schema.columns where table_schema = 'zala' and table_name = 'cliente') as columnas_cliente,
       (select count(*) from zala.plantillas) as plantillas;

-- b) La tanda de HOY tal como la vería ZALA: cuántos por mensaje.
select coalesce(plantilla_hoy, '(ninguno)') as plantilla_hoy,
       count(*) filter (where cobro_automatico) as en_tanda_automatica,
       count(*) filter (where not cobro_automatico) as fuera_de_la_tanda
  from zala.cliente group by plantilla_hoy order by en_tanda_automatica desc;

-- c) A quién NO se le puede escribir y por qué.
select coalesce(no_escribir_porque, '(sí se puede)') as motivo, count(*) from zala.cliente group by 1 order by 2 desc;

-- d) Una fila de muestra de la tanda, con todo lo que ZALA necesita para mandar.
select cliente, placa, whatsapp, encargado, plantilla_hoy, debe_hoy_texto, dias_mora
  from zala.cliente where cobro_automatico order by dias_mora desc limit 3;
