-- 144 — LOS PENDIENTES QUE FALTABAN (cierre de la fase 2 de docs/FLUJO-DIARIO.md)
--
-- La mig 142 dejó 9 de los 19 avisos en el servidor. Los otros 10 seguían viviendo SOLO en el
-- navegador (`useAlertas`), y mientras falte uno no se puede apagar la campana vieja: se apagaría
-- dejando trabajo sin dueño y sin que nadie lo note.
--
-- Se agregan los 10 que faltaban:
--   base completada · contrato sin activar · cesión que no llega · validar dónde duerme la moto ·
--   tarjeta/llave sin devolver · dinero sin identificar · moto retenida (fiscalía/tránsito/
--   garantía) · traspaso próximo · 3er acuerdo incumplido · acuerdo por vencer.
--
-- Y se agrega la columna `monto`: sin ella el panel del dueño solo puede decir "4 pagos por
-- confirmar", nunca "$1.240.000 esperando". La plata es lo primero que él mira.
-- 🔴 Cada cifra dice QUÉ pregunta responde (regla de las cifras de plata): en los avisos de cobro
-- `monto` es **la cuota y el acuerdo vencidos**, NO "todo lo que debe" — eso incluiría las deudas
-- registradas y sería otra cifra con otra etiqueta. Las pantallas deben nombrarla así.
--
-- Se ALINEAN tres cosas que la 142 había simplificado, para poder comparar aviso por aviso con la
-- campana vieja antes de apagarla:
--   · SOAT/tecno: vuelve la escalera de 4 niveles (vencido o ≤5 días = crítico · ≤15 = alerta ·
--     resto = info). La 142 los ponía todos en alerta.
--   · Transferencias por confirmar: info el primer día, alerta a partir del segundo.
--   · Moto demorada en taller: info hasta los 15 días, alerta de ahí en adelante.
--
-- 🔴 DIFERENCIAS QUE SE DEJAN A PROPÓSITO (no son errores, son decisiones ya tomadas):
--   1. Mora: la campana vieja no conoce el plazo extra y cuenta la recolección por días desde el
--      último pago. Acá se cuenta por DÍAS VENCIDA y se respeta el plazo (regla del dueño del
--      9-sep, mig 136). Por eso la cola de recolección da 64 y no 137.
--   2. Plazo/promesa vencidos: se ignoran si el cliente hoy está al día. Perseguir a alguien que
--      ya no debe nada es ruido, y el ruido es lo que hizo que 431 avisos taparan 20 SOAT vencidos.
--   3. Moto en taller: la campana mira `motos.estado = 'Mantenimiento'`; acá se mira la ORDEN de
--      taller abierta y su fecha de ingreso, que es el dato real de cuándo entró.
--
-- 🔴 DUEÑO DE LO QUE NO TIENE ENCARGADO: si la moto no tiene subadmin asignado, el pendiente ya no
-- queda huérfano — pasa al rol ADMIN. Antes (mig 142) esos avisos no le aparecían a NADIE en su
-- lista; salían en el total y no los reclamaba nadie. Es justo lo que pasa hoy con Johan David
-- Rojas, que es subadmin y tiene 0 motos asignadas.

drop view if exists public.pendientes;

create view public.pendientes with (security_invoker = true) as
with h as (select zala.hoy() as d),

-- La cartera con su cuenta ya hecha por la calculadora de la vitrina (espejo verificado de
-- cicloPago.ts). No se reescribe la mora acá: sería una tercera versión de la misma cuenta.
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

-- Los mismos contratos activos pero con los campos crudos (fechas, base, ahorro). Aparte de
-- `cartera` porque estos avisos no necesitan la cuenta de la mora.
act as (
  select c.*, cl.nombre as cliente, m.placa, m.subadmin_id
  from public.contratos c
  join public.clientes cl on cl.id = c.cliente_id
  left join public.motos m on m.id = c.moto_id
  where c.estado = 'Activo'
)

-- ══════════════ COBRO ══════════════
select
  'recoleccion:' || contrato_id                     as clave,
  'recoleccion'                                     as tipo,
  'Recolección — ' || cliente                       as titulo,
  'Lleva ' || dias_mora || ' días con la cuota vencida. Se agotaron los plazos.' as detalle,
  'critico'                                         as nivel,
  subadmin_id                                       as dueno_id,
  (case when subadmin_id is null then 'ADMIN' end)::text as dueno_rol,
  contrato_id, moto_id, cliente_id, placa,
  dias_mora::int                                    as dias,
  1                                                 as orden,
  falta::numeric                                    as monto
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

-- Compromisos vencidos. Ventana de 15 días igual que la campana: pasado eso deja de ser un
-- recordatorio y se vuelve ruido permanente.
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

-- ══════════════ PLATA QUE ESPERA UNA DECISIÓN ══════════════
-- Es de un PUESTO, no de una persona: la confirma quien esté de secretaria.
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

-- Plata que entró al banco y nadie reclamó: o el cliente no avisó, o alguien digitó mal.
union all
select 'dinero_ni:' || i.id, 'dinero_sin_identificar',
  'Dinero sin identificar hace ' || ((select d from h) - i.fecha_banco) || ' días',
  zala.pesos(i.monto) || ' entró el ' || to_char(i.fecha_banco, 'DD/MM') || ' (ref. ' || coalesce(i.referencia, 's/ref') || ') y nadie lo ha reclamado.',
  case when (select d from h) - i.fecha_banco >= 8 then 'critico' else 'alerta' end,
  null, 'SECRETARIA', null, null, null, null,
  ((select d from h) - i.fecha_banco)::int, 2, i.monto
from public.ingresos_no_identificados i
where i.estado = 'pendiente' and (select d from h) - i.fecha_banco >= 3

-- ══════════════ PAPELES Y ESTADO DE LA MOTO ══════════════
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

-- Retenida por un tercero: la moto no está produciendo y nadie la reclama sola.
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

-- Parada en el taller: se mira la orden abierta, no el estado de la moto.
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

-- La tarjeta de propiedad o la copia de la llave que se prestó y no ha vuelto.
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

-- Dónde duerme la moto. Aparece desde el día de la entrega y NO se va hasta que alguien lo valide
-- en el GPS y lo marque — por eso no tiene ventana de días.
union all
select 'validar_ubicacion:' || a.id, 'validar_ubicacion_moto',
  'Validar dónde se guarda la moto — ' || a.cliente,
  coalesce(a.placa, 'La moto') || ' se entregó el ' || to_char(a.fecha_entrega, 'DD/MM') || '. Revisa en el GPS que duerma donde declaró y márcalo.',
  case when (select d from h) - a.fecha_entrega >= 3 then 'alerta' else 'info' end,
  a.subadmin_id, case when a.subadmin_id is null then 'ADMIN' end,
  a.id, a.moto_id, a.cliente_id, a.placa,
  ((select d from h) - a.fecha_entrega)::int, 5, null
from act a
where a.ubicacion_moto_validada = false
  and a.fecha_entrega is not null and a.fecha_entrega <= (select d from h)

-- ══════════════ ACUERDOS DE PAGO ══════════════
-- Tercer acuerdo incumplido: por regla, ese contrato se liquida. Es del dueño, no del cobrador.
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

-- ══════════════ CONTRATOS: ENTRADA Y SALIDA ══════════════
-- Contrato armado que nunca se activó: o falta una firma, o falta la moto, o se abandonó.
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

-- Se registró SIN pagar base porque iba a recibir un contrato cedido, y la cesión no llega.
-- Es la única puerta del sistema para entrar sin cobrar base: si nadie la vigila, se vuelve el
-- atajo para saltarse el cobro.
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

-- Terminó de ahorrar la base: hay que graduarlo a un contrato de tiempo definido.
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

-- Faltan 2 meses para que termine: hay que arrancar el traspaso.
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

-- El `drop` de arriba se lleva los permisos de la vista vieja. Se reponen explícitos en vez de
-- confiar en los privilegios por defecto del esquema: si algún día cambian, esta pantalla se
-- quedaría en blanco sin que nadie sepa por qué.
grant select on public.pendientes to authenticated;
revoke all on public.pendientes from anon;

comment on view public.pendientes is
  'Todo lo que hay que hacer hoy, calculado en el servidor: los 19 avisos con su dueño. NO guarda alertas, las deduce de los datos, así no se puede desincronizar. `monto` en los avisos de cobro es la CUOTA Y EL ACUERDO vencidos, no la deuda total. Lo atendido se marca en pendientes_atendidos. Ver docs/FLUJO-DIARIO.md.';

-- ═══ VERIFICACIÓN ═══
-- a) Los 19 tipos, con cuántos hay de cada uno. Comparar con la campana antes de apagarla.
select tipo, nivel, count(*) as cuantos, round(sum(coalesce(monto, 0))) as plata
  from public.pendientes group by tipo, nivel order by tipo, nivel;

-- b) Ya no debe quedar NINGUNO huérfano (sin persona y sin puesto). Debe dar 0.
select count(*) as sin_dueno from public.pendientes where dueno_id is null and dueno_rol is null;

-- c) Cuántos le tocan a cada quien.
select coalesce(p.nombre, '(le toca al puesto: ' || pe.dueno_rol || ')') as dueno,
       count(*) as pendientes
  from public.pendientes pe
  left join public.profiles p on p.id = pe.dueno_id
 group by 1 order by 2 desc;
