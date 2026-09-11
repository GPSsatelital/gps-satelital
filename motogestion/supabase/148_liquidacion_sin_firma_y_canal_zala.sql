-- 148 — DOS PENDIENTES MÁS: la firma que falta, y abrir el canal con ZALA
--
-- Desde el 11-sep-2026 se puede cerrar una liquidación aunque el cliente no haya podido venir:
-- la moto se libera, la plata se salda, y el papel firmado entra después. Es lo correcto — antes
-- la moto se quedaba amarrada semanas esperando una firma.
--
-- 🔴 PERO UNA PUERTA DE SALIDA SIN VIGILANCIA ES POR DONDE SE ESCAPAN LOS DOCUMENTOS. Si nadie
-- persigue esas liquidaciones, "cerrar sin firma" deja de ser la excepción y se vuelve la
-- costumbre, y a los seis meses la empresa tiene veinte cierres sin respaldo legal y nadie sabe
-- cuáles. Por eso cada una queda como un pendiente DIARIO, con su dueño, hasta que el papel entre.
--
-- Es del puesto de SECRETARIA: ella es quien recibe los documentos cuando el cliente los trae.
--
-- ── Y EL SEGUNDO: ABRIR EL CANAL CON ZALA (pedido del dueño, 11-sep-2026) ────────────────────
-- WhatsApp solo deja mandar texto libre durante 24 horas después de que el otro te escribe.
-- Mientras nadie le escriba a ZALA, ella no le puede reenviar a cada quien los comprobantes que
-- van llegando: solo podría mandar plantillas aprobadas, que no sirven para eso.
--
-- Palabras del dueño: *"que en los pendientes lo primero sea escribirle a ZALA para poder activar
-- la ventana de 24 h, y que el botón despliegue automáticamente WhatsApp con el mensaje
-- preescrito para que solo sea darle enviar"*. Por eso va con `orden` 0 — antes que el cobro.
--
-- Es un pendiente que NO se deduce de ningún dato: no hay forma de saber desde acá si la persona
-- ya le escribió. Por eso sale todos los días para todo el que trabaja con ZALA, y se apaga
-- cuando ella misma lo marca (`pendientes_atendidos` es por DÍA: mañana vuelve). Es justo el
-- reparto que la mig 142 dejó montado: lo que se deduce se calcula, lo que no, se marca.
--
-- Lo demás de la vista queda IGUAL que en la mig 145 (una vista se redefine entera). Sus reglas
-- están explicadas allá y en la 144.

-- ── 1) DÓNDE VIVE EL NÚMERO DE ZALA ──────────────────────────────────────────────────────────
-- Una tabla de dos columnas para los datos sueltos de configuración. Nace con el número de ZALA
-- y el texto del mensaje, porque el dueño avisó que el número es "el de ahorita": si mañana
-- cambia, se edita acá y no hay que tocar código ni volver a desplegar.
create table if not exists public.ajustes (
  clave text primary key,
  valor text not null,
  descripcion text,
  updated_at timestamptz not null default now()
);

alter table public.ajustes enable row level security;

drop policy if exists "Ajustes: los lee cualquiera con sesión" on public.ajustes;
create policy "Ajustes: los lee cualquiera con sesión"
  on public.ajustes for select to authenticated using (true);

-- Solo el jefe los cambia: el número de ZALA decide a dónde sale un mensaje.
drop policy if exists "Ajustes: los cambia el jefe" on public.ajustes;
create policy "Ajustes: los cambia el jefe"
  on public.ajustes for all to authenticated
  using (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL'))
  with check (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL'));

insert into public.ajustes (clave, valor, descripcion) values
  ('zala_whatsapp', '573019058986',
   'Número de WhatsApp de ZALA. Sin el «+» ni espacios. A este número le escriben los admin cada mañana para abrir la ventana de 24 horas.'),
  ('zala_saludo', 'Hola ZALA, soy {nombre}. Abro el canal de hoy para recibir los comprobantes.',
   'El mensaje que sale preescrito al tocar el botón. {nombre} se reemplaza por el nombre de quien escribe.')
on conflict (clave) do nothing;

comment on table public.ajustes is
  'Datos sueltos de configuración (clave/valor). Los lee cualquiera con sesión; los cambia ADMIN o ADMIN_PRINCIPAL.';

-- ── 2) La lista de pendientes ────────────────────────────────────────────────────────────────
drop view if exists public.pendientes;

create view public.pendientes with (security_invoker = true) as
with h as (select zala.hoy() as d),
cartera as (
  select
    c.id as contrato_id, c.cliente_id, c.moto_id, m.subadmin_id, m.placa,
    cl.nombre as cliente, q.r_estado_cartera as estado, coalesce(q.r_dias_mora, 0) as dias_mora,
    coalesce(q.r_cuota_falta, 0) + coalesce(q.r_acuerdo_falta, 0) as falta,
    plazo.hasta as plazo_hasta, promesa.fecha as promesa_fecha
  from public.contratos c
  join public.clientes cl on cl.id = c.cliente_id
  left join public.motos m on m.id = c.moto_id
  cross join h
  left join public.convenios cv on cv.contrato_id = c.id and cv.estado = 'activo'
  left join lateral (
    select coalesce(sum(p.aplicado_convenio), 0) as abonado
    from public.pagos p
    where cv.id is not null and p.contrato_id = c.id and p.estado = 'Confirmado' and p.created_at >= cv.created_at
  ) ab on true
  left join lateral (select max(plazo_extra_fecha_limite) as hasta from public.gestiones_cobro g
                      where g.contrato_id = c.id and g.tipo = 'plazo_extra') plazo on true
  left join lateral (select max(fecha_compromiso) as fecha from public.gestiones_cobro g
                      where g.contrato_id = c.id and g.fecha_compromiso is not null) promesa on true
  left join lateral zala.cuenta_contrato(c, cv, ab.abonado, h.d) q on true
  where c.estado = 'Activo'
),
act as (
  select c.*, cl.nombre as cliente, m.placa, m.subadmin_id
  from public.contratos c
  join public.clientes cl on cl.id = c.cliente_id
  left join public.motos m on m.id = c.moto_id
  where c.estado = 'Activo'
)

-- 🔴 LO PRIMERO DEL DÍA (orden 0): abrir el canal con ZALA.
-- Uno por persona y por día. No se puede deducir si ya le escribió, así que sale siempre y se
-- apaga cuando ella lo marca. Solo para quien trabaja con los comprobantes.
select
  'canal_zala:' || p.id || ':' || (select d from h) as clave,
  'abrir_canal_zala'                                as tipo,
  'Escríbele a ZALA para abrir el canal de hoy'     as titulo,
  'Mientras nadie le escriba, ZALA no te puede reenviar los comprobantes que lleguen hoy. Es un toque: se abre WhatsApp con el mensaje listo y solo le das enviar.' as detalle,
  'alerta'                                          as nivel,
  p.id                                              as dueno_id,
  null::text                                        as dueno_rol,
  -- Con nombre, las cuatro. Es la PRIMERA rama del union y es la que bautiza las columnas de la
  -- vista: sin alias, Postgres las llama a todas por su tipo («uuid») y se cae con
  -- «column "uuid" specified more than once». No es adorno, es lo que la hace existir.
  null::uuid                                        as contrato_id,
  null::uuid                                        as moto_id,
  null::uuid                                        as cliente_id,
  null::text                                        as placa,
  null::int                                         as dias,
  0                                                 as orden,
  null::numeric                                     as monto
from public.profiles p
where p.role in ('ADMIN', 'ADMIN_PRINCIPAL', 'SUBADMIN', 'SECRETARIA')

union all
select
  'recoleccion:' || contrato_id,
  'recoleccion',
  'Recolección — ' || cliente,
  'Lleva ' || dias_mora || ' días con la cuota vencida. Se agotaron los plazos.',
  'critico',
  subadmin_id,
  case when subadmin_id is null then 'ADMIN' end,
  contrato_id, moto_id, cliente_id, placa,
  dias_mora::int,
  1,
  falta
from cartera
where estado = 'mora' and dias_mora > 3 and not (plazo_hasta is not null and plazo_hasta >= (select d from h))

union all
select 'mora:' || contrato_id, 'mora', 'En mora — ' || cliente,
  'Su cuota lleva ' || dias_mora || ' día' || case when dias_mora = 1 then '' else 's' end || ' de vencida.',
  'alerta', subadmin_id, case when subadmin_id is null then 'ADMIN' end,
  contrato_id, moto_id, cliente_id, placa, dias_mora::int, 2, falta
from cartera
where estado = 'mora' and not (dias_mora > 3 and not (plazo_hasta is not null and plazo_hasta >= (select d from h)))

union all
select 'gabela:' || contrato_id, 'gabela', 'Día de gracia — ' || cliente,
  'Su pago venció ayer. Hoy es el último día antes de entrar en mora.',
  'info', subadmin_id, case when subadmin_id is null then 'ADMIN' end,
  contrato_id, moto_id, cliente_id, placa, 0, 3, falta
from cartera where estado = 'gabela'

union all
select 'plazo_vencido:' || contrato_id, 'plazo_vencido', 'Plazo vencido — ' || cliente,
  'El plazo que le dieron venció el ' || to_char(plazo_hasta, 'DD/MM') || '. Verificar si pagó.',
  'alerta', subadmin_id, case when subadmin_id is null then 'ADMIN' end,
  contrato_id, moto_id, cliente_id, placa,
  ((select d from h) - plazo_hasta)::int, 2, falta
from cartera
where plazo_hasta is not null and plazo_hasta < (select d from h)
  and plazo_hasta >= (select d from h) - 15 and estado <> 'al-dia'

union all
select 'promesa_vencida:' || contrato_id, 'promesa_vencida', 'Promesa incumplida — ' || cliente,
  'Prometió pagar el ' || to_char(promesa_fecha, 'DD/MM') || ' y no lo hizo.',
  'alerta', subadmin_id, case when subadmin_id is null then 'ADMIN' end,
  contrato_id, moto_id, cliente_id, placa,
  ((select d from h) - promesa_fecha)::int, 2, falta
from cartera
where promesa_fecha is not null and promesa_fecha < (select d from h)
  and promesa_fecha >= (select d from h) - 15 and estado <> 'al-dia'

union all
select 'transferencia:' || p.id, 'transferencia_pendiente',
  'Pago por confirmar — ' || cl.nombre,
  'Hay un pago de ' || zala.pesos(p.valor) || ' esperando confirmación desde el ' || to_char(p.fecha, 'DD/MM') || '.',
  case when (select d from h) - p.fecha >= 2 then 'alerta' else 'info' end,
  null, 'SECRETARIA', p.contrato_id, c.moto_id, c.cliente_id, m.placa,
  ((select d from h) - p.fecha)::int, 2, p.valor
from public.pagos p
join public.contratos c on c.id = p.contrato_id
join public.clientes cl on cl.id = c.cliente_id
left join public.motos m on m.id = c.moto_id
where p.estado = 'Pendiente'

union all
select 'dinero_ni:' || i.id, 'dinero_sin_identificar',
  'Dinero sin identificar hace ' || ((select d from h) - i.fecha_banco) || ' días',
  zala.pesos(i.monto) || ' entró el ' || to_char(i.fecha_banco, 'DD/MM') || ' (ref. ' || coalesce(i.referencia, 's/ref') || ') y nadie lo ha reclamado.',
  case when (select d from h) - i.fecha_banco >= 8 then 'critico' else 'alerta' end,
  null, 'SECRETARIA', null, null, null, null,
  ((select d from h) - i.fecha_banco)::int, 2, i.monto
from public.ingresos_no_identificados i
where i.estado = 'pendiente' and (select d from h) - i.fecha_banco >= 3

-- 🔴 NUEVO (mig 148): se cerró sin el papel firmado y sigue sin llegar.
--
-- La fecha sale de `updated_at` y no de una `fecha_cierre`, porque esa columna NO existe. Es una
-- aproximación buena: después de cerrada, lo único que vuelve a tocar la fila es justamente subir
-- el documento — y en ese momento el aviso desaparece, así que da igual que la fecha se mueva.
-- Se prefirió esto antes que meterle una columna nueva a `cerrar_liquidacion()`, que es la
-- función que mueve la plata del cierre: no se toca por una fecha (lección de la mig 124).
union all
select 'liq_sin_firma:' || l.id, 'liquidacion_sin_firma',
  'Falta la firma — ' || coalesce(cl.nombre, l.numero),
  'La liquidación ' || l.numero || ' se cerró el ' || to_char(l.updated_at at time zone 'America/Bogota', 'DD/MM')
    || ' sin la firma del cliente. Cuando traiga el papel, súbelo desde Liquidaciones.',
  case when (select d from h) - (l.updated_at at time zone 'America/Bogota')::date >= 15 then 'critico' else 'alerta' end,
  null, 'SECRETARIA',
  l.contrato_id, l.moto_id, l.cliente_id, m.placa,
  ((select d from h) - (l.updated_at at time zone 'America/Bogota')::date)::int, 2, null
from public.liquidaciones l
left join public.clientes cl on cl.id = l.cliente_id
left join public.motos m on m.id = l.moto_id
where l.estado = 'cerrada'
  and l.documento_firmado_url is null

union all
select 'soat:' || m.id, 'soat_vence',
  'SOAT ' || case when m.fecha_seguro < (select d from h) then 'VENCIDO' else 'por vencer' end || ' — ' || m.placa,
  case when m.fecha_seguro < (select d from h) then 'Está VENCIDO desde el ' || to_char(m.fecha_seguro, 'DD/MM')
       else 'Vence el ' || to_char(m.fecha_seguro, 'DD/MM') end,
  case when m.fecha_seguro <= (select d from h) + 5  then 'critico'
       when m.fecha_seguro <= (select d from h) + 15 then 'alerta'
       else 'info' end,
  m.subadmin_id, case when m.subadmin_id is null then 'ADMIN' end,
  null, m.id, null, m.placa,
  (m.fecha_seguro - (select d from h))::int, 4, null
from public.motos m
where m.fecha_seguro is not null and m.fecha_seguro <= (select d from h) + 30

union all
select 'tecno:' || m.id, 'tecno_vence',
  'Tecnomecánica ' || case when m.fecha_tecnomecanica < (select d from h) then 'VENCIDA' else 'por vencer' end || ' — ' || m.placa,
  case when m.fecha_tecnomecanica < (select d from h) then 'Está VENCIDA desde el ' || to_char(m.fecha_tecnomecanica, 'DD/MM')
       else 'Vence el ' || to_char(m.fecha_tecnomecanica, 'DD/MM') end,
  case when m.fecha_tecnomecanica <= (select d from h) + 5  then 'critico'
       when m.fecha_tecnomecanica <= (select d from h) + 15 then 'alerta'
       else 'info' end,
  m.subadmin_id, case when m.subadmin_id is null then 'ADMIN' end,
  null, m.id, null, m.placa,
  (m.fecha_tecnomecanica - (select d from h))::int, 4, null
from public.motos m
where m.fecha_tecnomecanica is not null and m.fecha_tecnomecanica <= (select d from h) + 30

union all
select 'retenida:' || m.id, 'moto_retenida',
  'Moto retenida — ' || m.placa,
  'Está en ' || m.estado || coalesce(' · ' || a.cliente, '') || '. Mientras esté ahí no produce.',
  'critico',
  m.subadmin_id, case when m.subadmin_id is null then 'ADMIN' end,
  a.id, m.id, a.cliente_id, m.placa,
  null::int, 4, null
from public.motos m
left join act a on a.moto_id = m.id
where m.estado in ('Fiscalia', 'Transito', 'Garantia')

union all
select 'taller:' || t.moto_id, 'taller_demorado',
  'Lleva días en el taller — ' || m.placa,
  'Entró el ' || to_char(t.fecha_ingreso, 'DD/MM') || '. ' || coalesce(t.detalle, 'Sin detalle.'),
  case when (select d from h) - t.fecha_ingreso >= 15 then 'alerta' else 'info' end,
  m.subadmin_id, case when m.subadmin_id is null then 'ADMIN' end,
  null, t.moto_id, null, m.placa,
  ((select d from h) - t.fecha_ingreso)::int, 5, null
from (select distinct on (moto_id) moto_id, fecha_ingreso, detalle from public.taller
       where estado_tecnico <> 'Finalizado' order by moto_id, created_at desc) t
join public.motos m on m.id = t.moto_id
where t.fecha_ingreso is not null and t.fecha_ingreso < (select d from h) - 7

union all
select 'prestamo_doc:' || pr.id, 'prestamo_doc_vence',
  'Debe devolver ' || case when pr.tipo = 'tarjeta' then 'la tarjeta de propiedad' else 'la copia de la llave' end || ' — ' || coalesce(m.placa, ''),
  pr.prestado_a || ' debía devolverla el ' || to_char(pr.fecha_devolucion_esperada, 'DD/MM') || '. Pedírsela.',
  'alerta',
  m.subadmin_id, case when m.subadmin_id is null then 'ADMIN' end,
  null, pr.moto_id, null, m.placa,
  ((select d from h) - pr.fecha_devolucion_esperada)::int, 5, null
from public.prestamos_llave_tarjeta pr
join public.motos m on m.id = pr.moto_id
where pr.estado = 'prestado' and pr.fecha_devolucion_esperada is not null
  and pr.fecha_devolucion_esperada <= (select d from h)

union all
select 'validar_ubicacion:' || q.contrato_id, 'validar_ubicacion_moto',
  'Validar dónde duerme la moto — ' || q.cliente,
  coalesce(q.placa, 'La moto') || ' se entregó el ' || to_char(q.fecha_entrega, 'DD/MM')
    || '. Revisa en el GPS dónde amanece y márcalo.'
    || case when q.en_cola > 5 then ' Quedan ' || q.en_cola || ' motos por revisar.' else '' end,
  case when q.dias >= 3 then 'alerta' else 'info' end,
  q.subadmin_id, case when q.subadmin_id is null then 'ADMIN' end,
  q.contrato_id, q.moto_id, q.cliente_id, q.placa,
  q.dias::int, 5, null
from (select c.*, count(*) over (partition by c.subadmin_id) as en_cola
        from public.validar_ubicacion_cola c) q
where q.turno <= 5

union all
select 'convenio3:' || a.id, 'convenio_incumplido_3',
  'Liquidación obligatoria — ' || a.cliente,
  'Ya van ' || v.incumplidos || ' acuerdos de pago incumplidos. Por regla, este contrato se liquida.',
  'critico', null, 'ADMIN_PRINCIPAL',
  a.id, a.moto_id, a.cliente_id, a.placa, v.incumplidos::int, 1, null
from act a
join lateral (
  select count(*) as total,
         count(*) filter (where cv.estado = 'incumplido') as incumplidos,
         (array_agg(cv.estado order by cv.numero_convenio desc))[1] as ultimo
    from public.convenios cv where cv.contrato_id = a.id
) v on true
where v.incumplidos >= 3 or (v.total >= 3 and v.incumplidos >= 1 and v.ultimo = 'incumplido')

union all
select 'convenio_vence:' || cv.id, 'convenio_por_vencer',
  'Acuerdo vence ' || case when cv.fecha_limite = (select d from h) then 'HOY' else 'en ' || (cv.fecha_limite - (select d from h)) || ' días' end || ' — ' || a.cliente,
  'Acuerdo #' || cv.numero_convenio || ' · ' || zala.pesos(cv.cuota_por_periodo) || ' por período · límite ' || to_char(cv.fecha_limite, 'DD/MM') || '.',
  case when cv.fecha_limite = (select d from h) then 'critico' else 'alerta' end,
  a.subadmin_id, case when a.subadmin_id is null then 'ADMIN' end,
  a.id, a.moto_id, a.cliente_id, a.placa,
  (cv.fecha_limite - (select d from h))::int, 2, cv.cuota_por_periodo
from public.convenios cv
join act a on a.id = cv.contrato_id
where cv.estado = 'activo' and cv.fecha_limite is not null
  and cv.fecha_limite >= (select d from h) and cv.fecha_limite <= (select d from h) + 3

union all
select 'sin_activar:' || c.id, 'contrato_sin_activar',
  'Contrato sin activar — ' || cl.nombre,
  'Lleva ' || ((select d from h) - (c.created_at at time zone 'America/Bogota')::date) || ' días armado sin activarse. Verificar firma y moto.',
  case when (select d from h) - (c.created_at at time zone 'America/Bogota')::date >= 7 then 'alerta' else 'info' end,
  null, 'ADMIN', c.id, c.moto_id, c.cliente_id, m.placa,
  ((select d from h) - (c.created_at at time zone 'America/Bogota')::date)::int, 6, null
from public.contratos c
join public.clientes cl on cl.id = c.cliente_id
left join public.motos m on m.id = c.moto_id
where c.estado = 'En proceso'
  and (select d from h) - (c.created_at at time zone 'America/Bogota')::date >= 3

union all
select 'cesion_pendiente:' || cl.id, 'cesion_pendiente',
  'Entró por cesión y sigue sin contrato — ' || cl.nombre,
  'Hace ' || ((select d from h) - (cl.created_at at time zone 'America/Bogota')::date) || ' días se registró sin pagar base porque iba a recibir un contrato cedido, y la cesión no se ha hecho.',
  case when (select d from h) - (cl.created_at at time zone 'America/Bogota')::date >= 7 then 'alerta' else 'info' end,
  null, 'ADMIN', null, null, cl.id, null,
  ((select d from h) - (cl.created_at at time zone 'America/Bogota')::date)::int, 6, null
from public.clientes cl
where cl.ingreso_por_cesion = true
  and not exists (select 1 from public.cesiones_contrato ce where ce.cesionario_id = cl.id)
  and (select d from h) - (cl.created_at at time zone 'America/Bogota')::date >= 3

union all
select 'base_completada:' || a.id, 'base_completada',
  'Base completada — ' || a.cliente,
  'Ya ahorró ' || zala.pesos(coalesce(a.ahorro_acumulado, 0) + coalesce(a.ahorro_apertura, 0)) || '. Gestionar el cambio de contrato.',
  'info', null, 'ADMIN',
  a.id, a.moto_id, a.cliente_id, a.placa, null::int, 6,
  coalesce(a.ahorro_acumulado, 0) + coalesce(a.ahorro_apertura, 0)
from act a
where (a.tipo_ruta = 'diario' or a.forma_pago = 'Diario')
  and coalesce(a.base_completada, false) = false
  and coalesce(a.ahorro_acumulado, 0) + coalesce(a.ahorro_apertura, 0) >= coalesce(a.base_inicial, 510000)

union all
select 'traspaso:' || a.id, 'traspaso_proximo',
  'Traspaso próximo — ' || a.cliente,
  'El contrato termina el ' || to_char(f.venc, 'DD/MM/YYYY') || ' (en ' || (f.venc - (select d from h)) || ' días). Iniciar el proceso.',
  case when f.venc - (select d from h) <= 15 then 'alerta' else 'info' end,
  null, 'ADMIN_PRINCIPAL',
  a.id, a.moto_id, a.cliente_id, a.placa,
  (f.venc - (select d from h))::int, 6, null
from act a
join lateral (
  select coalesce(a.fecha_fin_contrato, a.fecha_entrega + (a.meses * 30)) as venc
) f on true
where f.venc is not null
  and f.venc >= (select d from h) and f.venc <= (select d from h) + 60;

grant select on public.pendientes to authenticated;
revoke all on public.pendientes from anon;

comment on view public.pendientes is
  'Todo lo que hay que hacer hoy, calculado en el servidor: los 21 avisos con su dueño. NO guarda alertas, las deduce de los datos. `monto` en los avisos de cobro es la CUOTA Y EL ACUERDO vencidos, no la deuda total. Ver docs/FLUJO-DIARIO.md.';

-- ═══ VERIFICACIÓN ═══
-- 0) El número de ZALA quedó guardado y editable.
select clave, valor from public.ajustes where clave like 'zala%' order by clave;

-- a) Cuántas liquidaciones cerradas están sin el papel firmado (las viejas también salen: si
--    alguna ya no hace falta perseguirla, se le sube el documento o se revisa caso por caso).
select count(*) as liquidaciones_sin_firma from public.pendientes where tipo = 'liquidacion_sin_firma';

-- b) El resto no se movió. Comparar con lo que daba antes.
select tipo, count(*) as cuantos from public.pendientes group by tipo order by cuantos desc;

-- c) Sigue sin haber pendientes huérfanos. Debe dar 0.
select count(*) as sin_dueno from public.pendientes where dueno_id is null and dueno_rol is null;
