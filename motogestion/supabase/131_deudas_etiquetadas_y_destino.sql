-- 131 — CADA DEUDA CON SU ETIQUETA Y SU DESTINO: a dónde vuelve la plata cuando se paga
--
-- PEDIDO DEL DUEÑO (7-sep-2026, textual): "las deudas nacen por donde se crean las deudas y ya
-- nacen con sus asignaciones o el porqué se generaron; hay que definir más las posibles deudas
-- para que sean devueltas a donde van cuando se paguen y queden debidamente etiquetadas o
-- vigiladas."
--
-- LA EVIDENCIA (medida hoy): de 287 deudas, 12 estaban marcadas 'otro' — y no son una cosa, son
-- SIETE: 5 dicen "EXCEL VIEJO" (migración), 2 son alquiler de moto prestada, 1 saldo de
-- liquidación, 1 lavada, 1 préstamo, 1 base inicial y 1 multa por comprobante falso. Cuando la
-- gente no puede marcar lo que es, escribe a mano — el mismo patrón que ya obligó a crear el
-- concepto 'migracion' (mig 090).
--
-- QUÉ HACE:
--   1) 4 conceptos nuevos: `alquiler_reemplazo`, `saldo_liquidacion`, `base_inicial`, `multa`.
--   2) `zala.conceptos_deuda`: el catálogo — qué es cada concepto en palabras, a dónde va la plata
--      cuando se paga y quién puso el dinero. **Concepto nuevo = una fila acá, no desarrollo.**
--   3) Reclasifica las 12 'otro' a su concepto real. NINGUNA cifra cambia: solo la etiqueta.
--   4) `zala.deudas` gana `destino` y `destino_texto` para el informe y para ZALA.
--
-- LOS 4 DESTINOS (decisión del dueño, 7-sep: "depende del tipo de deuda"):
--   · socio            → es plata del arriendo: va al portafolio de la moto del contrato.
--   · socio_prestada   → el alquiler de la moto PRESTADA: va al portafolio de ESA moto, no la del
--                        contrato (regla del 30-jul: "nunca se mezclan las cuentas").
--   · empresa_reembolso→ la empresa adelantó el gasto (lavada, repuesto, grúa, fotomulta) y lo
--                        recupera: cierra el círculo con el egreso que lo originó.
--   · empresa_ingreso  → penalización: ingreso propio de la empresa, no del socio.

-- ── 1) Los conceptos que faltaban ─────────────────────────────────────────────────────────────
alter table public.deudas drop constraint if exists deudas_concepto_check;
alter table public.deudas add constraint deudas_concepto_check
  CHECK (concepto IN (
    'tarifa_atrasada',
    'daño_vehiculo',
    'prestamo_repuesto',
    'prestamo_eventualidad',
    'fotomulta',
    'multa_recoleccion',
    'migracion',
    'lavada',
    'alquiler_reemplazo',   -- ★ 131: la moto prestada mientras la suya está guardada
    'saldo_liquidacion',    -- ★ 131: lo que quedó debiendo al cerrar su liquidación
    'base_inicial',         -- ★ 131: lo que le faltó de la base al entrar
    'multa',                -- ★ 131: cualquier otra multa (comprobante falso, etc.)
    'otro'
  ));

-- ── 2) El catálogo: qué es y a dónde va ──────────────────────────────────────────────────────
create table if not exists zala.conceptos_deuda (
  concepto   text primary key,
  etiqueta   text not null,   -- cómo se llama en pantalla
  que_es     text not null,   -- en palabras, para ZALA y para el cliente
  destino    text not null check (destino in ('socio', 'socio_prestada', 'empresa_reembolso', 'empresa_ingreso')),
  destino_texto text not null,
  /** Quién puso la plata que se está recuperando. NULL = no salió de nadie (es arriendo o multa). */
  lo_puso    text,
  orden      int not null default 100
);

insert into zala.conceptos_deuda (concepto, etiqueta, que_es, destino, destino_texto, lo_puso, orden) values
('tarifa_atrasada',       'Arriendo atrasado',           'Semanas de arriendo que quedaron sin pagar y se registraron como deuda.', 'socio', 'Al portafolio del socio dueño de la moto', null, 10),
('migracion',             'Saldo del sistema anterior',  'Lo que el cliente ya debía cuando entró al sistema nuevo.',               'socio', 'Al portafolio del socio dueño de la moto', null, 20),
('base_inicial',          'Base inicial pendiente',      'Lo que le faltó de la base de $510.000 al recibir la moto.',              'socio', 'Al portafolio del socio dueño de la moto', null, 30),
('saldo_liquidacion',     'Saldo de la liquidación',     'Lo que quedó debiendo cuando se le cerró el contrato.',                   'socio', 'Al portafolio del socio dueño de la moto', null, 40),
('alquiler_reemplazo',    'Alquiler de moto prestada',   'Los días que anduvo en una moto prestada mientras la suya estaba guardada.', 'socio_prestada', 'Al portafolio de la moto PRESTADA (es la que se desgastó)', null, 50),
('lavada',                'Lavada de la moto',           'La empresa pagó el lavado de la moto y el cliente lo devuelve.',          'empresa_reembolso', 'Vuelve a la empresa: repone lo que adelantó', 'la empresa', 60),
('prestamo_repuesto',     'Repuesto prestado',           'Un repuesto que la empresa compró y le fió al cliente.',                  'empresa_reembolso', 'Vuelve a la empresa: repone lo que adelantó', 'la empresa', 70),
('prestamo_eventualidad', 'Préstamo por eventualidad',   'Plata que la empresa le adelantó (grúa, patios, un apuro).',              'empresa_reembolso', 'Vuelve a la empresa: repone lo que adelantó', 'la empresa', 80),
('daño_vehiculo',         'Daño al vehículo',            'Un arreglo que la empresa pagó porque el daño fue del cliente.',          'empresa_reembolso', 'Vuelve a la empresa: repone lo que adelantó', 'la empresa (taller)', 90),
('fotomulta',             'Fotomulta',                   'Una multa de tránsito de él que llegó a nombre de la empresa.',           'empresa_reembolso', 'Vuelve a la empresa: repone lo que adelantó', 'la empresa', 100),
('multa_recoleccion',     'Multa por retención',         'El costo de ir a buscarle la moto cuando no pagó.',                       'empresa_ingreso', 'Es de la empresa: cubre el trabajo de ir por la moto', null, 110),
('multa',                 'Multa',                       'Otra multa que se le puso (por ejemplo, un comprobante falso).',          'empresa_ingreso', 'Es de la empresa', null, 120),
('otro',                  'Otra deuda',                  'Algo que no cabe en los anteriores. Si se repite, merece concepto propio.', 'socio', 'Al portafolio del socio dueño de la moto', null, 999)
on conflict (concepto) do update set
  etiqueta = excluded.etiqueta, que_es = excluded.que_es, destino = excluded.destino,
  destino_texto = excluded.destino_texto, lo_puso = excluded.lo_puso, orden = excluded.orden;

grant select on zala.conceptos_deuda to zala_lector;

-- ── 3) Reclasificar las 12 'otro' — ninguna cifra cambia, solo la etiqueta ────────────────────
update public.deudas set concepto = 'alquiler_reemplazo'
 where concepto = 'otro' and descripcion ilike 'Alquiler moto de reemplazo%';

update public.deudas set concepto = 'saldo_liquidacion'
 where concepto = 'otro' and descripcion ilike 'Saldo pendiente de la liquidación%';

update public.deudas set concepto = 'migracion'
 where concepto = 'otro' and upper(coalesce(descripcion, '')) like '%EXCEL VIEJO%';

update public.deudas set concepto = 'lavada'
 where concepto = 'otro' and upper(coalesce(descripcion, '')) like '%LAVADA%';

update public.deudas set concepto = 'prestamo_eventualidad'
 where concepto = 'otro' and upper(coalesce(descripcion, '')) like '%PRESTAMO%';

update public.deudas set concepto = 'base_inicial'
 where concepto = 'otro' and lower(coalesce(descripcion, '')) like '%base inicial%';

update public.deudas set concepto = 'multa'
 where concepto = 'otro' and upper(coalesce(descripcion, '')) like '%MULTA%';

-- ── 4) La vitrina: cada deuda dice a dónde va su plata ───────────────────────────────────────
create or replace function zala.concepto_deuda_texto(p text) returns text language sql stable as $$
  select coalesce((select que_es from zala.conceptos_deuda where concepto = p), coalesce(p, 'otro'))
$$;

-- `drop` y no `create or replace`: la vista ya existía y Postgres no deja cambiar el nombre ni el
-- orden de una columna existente ("cannot change name of view column"). Al recrearla se pierden
-- los permisos, por eso el `grant` va justo debajo.
drop view if exists zala.deudas;

create view zala.deudas as
select
  d.id             as deuda_id,
  d.contrato_id,
  cl.nombre        as cliente,
  m.placa,
  d.concepto,
  coalesce(k.etiqueta, d.concepto)     as etiqueta,
  zala.concepto_deuda_texto(d.concepto) as que_es,
  d.descripcion,
  d.monto          as monto_original,
  d.monto_pendiente as falta,
  d.estado,
  case d.estado when 'pendiente' then 'se cobra aparte de la cuota'
                when 'en_convenio' then 'entró a un acuerdo de pago: se cobra por la cuota del acuerdo, no aparte'
                when 'pagada' then 'saldada' else d.estado end as estado_texto,
  k.destino,
  k.destino_texto,
  k.lo_puso,
  d.convenio_id,
  (d.created_at at time zone 'America/Bogota')::date as registrada_el
from public.deudas d
join public.contratos c on c.id = d.contrato_id
join public.clientes cl on cl.id = c.cliente_id
left join public.motos m on m.id = c.moto_id
left join zala.conceptos_deuda k on k.concepto = d.concepto
where d.estado in ('pendiente', 'en_convenio');

grant select on zala.deudas to zala_lector;

insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno) values
('deudas', 'etiqueta', 'Cómo se llama el concepto en pantalla.', null, 'sí', true),
('deudas', 'destino', 'A dónde va la plata cuando el cliente paga esta deuda (mig 131).', 'socio · socio_prestada · empresa_reembolso · empresa_ingreso', 'no', true),
('deudas', 'destino_texto', 'El destino en palabras, para el informe.', null, 'no', true),
('deudas', 'lo_puso', 'Quién adelantó la plata que se está recuperando. Vacío = no salió de nadie (es arriendo o multa).', null, 'no', true),
('conceptos_deuda', 'catalogo', 'El catálogo de tipos de deuda: qué es cada uno y a dónde vuelve su plata. Un tipo nuevo es una fila acá, no desarrollo.', null, 'no', true)
on conflict (vista, columna) do update set
  significado = excluded.significado, valores = excluded.valores, actualizado = now();

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- a) Ya no debe quedar ninguna 'otro' de las que sí tenían nombre (las que queden son legítimas).
select concepto, count(*) as cuantas, sum(monto) as creado, sum(monto_pendiente) filter (where estado <> 'pagada') as pendiente
  from public.deudas group by concepto order by cuantas desc;

-- b) La plata pendiente, agrupada por A DÓNDE VA. Este es el informe que antes no se podía hacer.
select k.destino_texto,
       count(*) as deudas,
       sum(d.monto_pendiente) as pendiente,
       sum(d.monto - d.monto_pendiente) as ya_recuperado
  from public.deudas d
  join zala.conceptos_deuda k on k.concepto = d.concepto
 where d.estado <> 'pagada'
 group by k.destino, k.destino_texto
 order by pendiente desc;

-- c) Lo que la empresa ha adelantado y todavía no recupera.
select k.etiqueta, count(*) as casos,
       sum(d.monto) as adelantado, sum(d.monto - d.monto_pendiente) as recuperado,
       sum(d.monto_pendiente) filter (where d.estado <> 'pagada') as falta
  from public.deudas d
  join zala.conceptos_deuda k on k.concepto = d.concepto
 where k.destino = 'empresa_reembolso'
 group by k.etiqueta order by falta desc nulls last;
