-- 138 — LA CIFRA SOLO A QUIEN TIENE LA CUENTA CONFIABLE + los 3 cambios de texto del dueño
--
-- DECISIÓN DEL DUEÑO (9-sep-2026), dicha al proyecto ZALA: los montos siguen apagados SALVO para
-- dos grupos, y solo esos dos:
--   1. Los que NACIERON en MotoGestión (no migrados): toda su historia la construyó el sistema.
--   2. Los que tienen un ACUERDO DE PAGO FIRMADO: esa cifra el cliente ya la vio y la aceptó.
-- El migrado sin acuerdo arrastra un saldo de apertura que nadie ha revisado con él; a ese se le
-- sigue escribiendo, pero SIN número, hasta que le cierren su empalme o firme un acuerdo.
--
-- ZALA lo pidió como una sola columna que resuelva las dos cosas, para no tener que razonar nada:
-- "cuenta_confiable". Va AL FINAL de la vista ("create or replace" solo deja agregar al final).
-- La vista es idéntica a la de la mig 136 salvo esa columna — se generó a partir de ese archivo.
--
-- Y los 3 cambios de redacción que el dueño pidió sobre los textos ya aprobados.

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
    when q.r_estado_cartera = 'mora' and coalesce(q.r_dias_mora, 0) > 3 and not (plazo.hasta is not null and plazo.hasta >= h.d) then 'recoleccion'
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
     and not (promesa.fecha is not null and promesa.fecha >= h.d)
     -- En mora sin NINGÚN pago registrado no hay tanda: el mensaje nombra "su último pago
     -- registrado" y ese cliente no tiene ninguno. Ese caso se gestiona por llamada.
     and not (q.r_estado_cartera = 'mora' and pg.ultimo_confirmado is null)) as cobro_automatico,
  -- ★ 134: la CLAVE del mensaje de hoy. La plantilla de Meta se busca en zala.plantillas.
  case
    when c.estado = 'Suspendido' then 'moto_retenida'
    when q.r_estado_cartera is null then null
    -- Sin pago registrado no hay plantilla de mora: las dos nombran su último pago. Sale null
    -- para que ZALA no mande nada y el caso quede para llamada.
    when q.r_estado_cartera = 'mora' and pg.ultimo_confirmado is null then null
    when q.r_estado_cartera = 'mora' and coalesce(q.r_dias_mora, 0) > 3 and not (plazo.hasta is not null and plazo.hasta >= h.d) then 'recoleccion'
    when q.r_estado_cartera = 'mora' then 'mora'
    when q.r_estado_cartera = 'gabela' then 'gabela'
    when zala.es_dia_de_pago(c, h.d) then 'dia_pago'
    else null end                                as plantilla_hoy,
  case when q.r_cuota_falta is null then null
       else zala.pesos(q.r_cuota_falta + coalesce(q.r_acuerdo_falta, 0) + coalesce(de.pend_falta, 0)) end as debe_hoy_texto,
  -- ★ 134: el nombre con que se le habla ("Jose Alberto"). Es la variable {nombre} de las plantillas.
  zala.nombre_corto(cl.nombre)                    as cliente_corto,
  -- ★ 134: su día de pago dentro de la frase ("los lunes"). Es la variable {dia_pago}.
  zala.dia_pago_frase(c)                          as dia_pago_frase,
  -- ★ 134: las DOS cifras de días ya escritas con su palabra, que es como viajan a Meta (una
  -- variable no puede dejar la palabra afuera sin que quede "1 días"). Van las dos porque miden
  -- cosas distintas: `dias_texto` es desde su último pago (un abono parcial la reinicia) y
  -- `vencida_texto` es lo que lleva vencida la cuota (esa no la mueve un abono). dias_texto es
  -- NULL si nunca registró un pago: no se puede nombrar un último pago que no existe.
  -- Van AL FINAL a propósito: `create or replace view` solo deja agregar columnas al final
  -- (meter una en la mitad falla con "cannot change name of view column" — lección de la mig 131).
  case when pg.ultimo_confirmado is not null and dsp.dias < 999
       then dsp.dias || ' día' || case when dsp.dias = 1 then '' else 's' end end as dias_texto,
  coalesce(q.r_dias_mora, 0) || ' día' || case when coalesce(q.r_dias_mora, 0) = 1 then '' else 's' end as vencida_texto,
  -- 138: LA CUENTA ES CONFIABLE PARA DECIRLE LA CIFRA AL CLIENTE (decision del dueno, 9-sep-2026).
  -- Dos casos, y solo dos: nacio en MotoGestion (toda su historia la construyo el sistema) o tiene
  -- un acuerdo de pago FIRMADO (esa cifra el cliente ya la vio y la acepto). El migrado sin acuerdo
  -- todavia arrastra un saldo de apertura que nadie ha revisado con el: a ese no se le manda cifra.
  (not coalesce(c.es_migrado, false) or cv.id is not null) as cuenta_confiable
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

grant select on zala.cliente to zala_lector;

-- ── El diccionario: si no está aquí, no existe para ZALA ────────────────────────────────────
insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno) values
('cliente', 'cuenta_confiable', 'Si a este cliente se le puede decir la CIFRA exacta que debe. true = nació en MotoGestión (su historia completa la construyó el sistema) o tiene un acuerdo de pago firmado (esa cifra ya la vio y la aceptó). false = migrado sin acuerdo: su saldo de apertura todavía no se ha revisado con él, así que se le escribe SIN número. Decisión del dueño, 9-sep-2026.', 'true · false', 'no', true)
on conflict (vista, columna) do update set
  significado = excluded.significado, valores = excluded.valores,
  zala_lo_dice = excluded.zala_lo_dice, actualizado = now();

-- ── Los 3 cambios de redacción pedidos por el dueño (9-sep) ─────────────────────────────────
-- Solo esas frases; el resto de cada texto queda igual. Los `replace` son idempotentes.
update public.mensajes_whatsapp
   set texto = replace(texto, 'Hoy es su día de pago de la moto', 'Le recordamos que hoy es su día de pago de la moto'),
       updated_at = now()
 where clave = 'dia_pago'
   and texto like '%Hoy es su día de pago de la moto%'
   and texto not like '%Le recordamos que hoy es su día de pago%';

update public.mensajes_whatsapp
   set texto = replace(texto, 'Su pago de la moto', 'Su plazo de la moto'), updated_at = now()
 where clave = 'gabela' and texto like '%Su pago de la moto%';

update public.mensajes_whatsapp
   set texto = replace(texto, 'Póngase al día lo más pronto posible', 'Le recomendamos colocarse al día lo más pronto posible'),
       updated_at = now()
 where clave = 'mora' and texto like '%Póngase al día lo más pronto posible%';

-- ═══ VERIFICACIÓN ═══
-- a) A cuántos se les puede decir la cifra, y a cuántos no.
select cuenta_confiable, count(*) as contratos,
       count(*) filter (where cobro_automatico) as en_la_tanda_de_hoy
  from zala.cliente group by 1 order by 1 desc;

-- b) Los 3 textos, ya con los cambios.
select clave, left(texto, 140) as empieza_asi from public.mensajes_whatsapp
 where clave in ('dia_pago', 'gabela', 'mora') order by clave;
