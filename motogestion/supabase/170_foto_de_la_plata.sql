-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 170 — LA FOTO DE LA PLATA: que ninguna migración vuelva a mover un peso en silencio (24-sep-2026)
--
-- 🔴 EL CASO QUE LA JUSTIFICA. La **mig 124** reescribió dos disparadores de convenios copiándolos
-- del archivo de una migración vieja, y borró sin querer lo que la 116 les había agregado:
-- 12 convenios nacieron sin partitura y 11 cajas quedaron mal rotuladas. **Se descubrió TRES DÍAS
-- después**, mirando un caso real a mano. Ninguna prueba lo vio: las de `npm test` corren en Node
-- contra TypeScript, y el motor del dinero vive acá, en la base.
--
-- CÓMO SE USA (dos líneas, antes y después):
--     select public.tomar_foto_plata('antes-170');
--     ...  aquí va la migración que toca plata  ...
--     select public.tomar_foto_plata('despues-170');
--     select * from public.comparar_fotos('antes-170', 'despues-170');
--
-- Si no se movió nada que no pidiéramos, devuelve **cero filas**. Si se movió algo, sale con
-- **placa, nombre, qué cambió, cuánto antes, cuánto después y la diferencia**.
--
-- 🔑 POR QUÉ VIVE EN LA BASE Y NO EN UN SCRIPT. Un script de Node necesitaría la llave de servicio
-- para leer todo (la llave pública choca con RLS). Meter esa llave en un archivo sería repetir el
-- problema que hoy está en P0: una llave de producción circulando fuera de su lugar. Acá no hace
-- falta ninguna: el dueño ya corre SQL en el editor de Supabase.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--     drop function if exists public.comparar_fotos(text, text);
--     drop function if exists public.tomar_foto_plata(text);
--     drop table if exists public.foto_plata;
--   No toca un solo dato del negocio: solo guarda copias de cifras para compararlas.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

create table if not exists public.foto_plata (
  etiqueta     text        not null,
  tomada_en    timestamptz not null default now(),
  contrato_id  uuid        not null,
  -- El libro de cajas
  total_cajas        int,
  cajas_pagadas      int,
  cajas_previas      int,
  cajas_exoneradas   int,
  caja_actual_pagado numeric,
  prorrateo_pagado   numeric,
  -- El ahorro del cliente
  ahorro_acumulado   numeric,
  ahorro_apertura    numeric,
  -- Su plata guardada
  saldo_favor        numeric,
  -- Lo que debe aparte
  deuda_pendiente    numeric,
  -- Su acuerdo
  acuerdo_total      numeric,
  acuerdo_cuotas_pagadas int,
  -- A dónde fue cada peso de sus pagos (si el motor re-reparte, esto se mueve)
  pagos_confirmados  int,
  aplicado_tarifa    numeric,
  aplicado_prorrateo numeric,
  aplicado_deuda     numeric,
  aplicado_convenio  numeric,
  aplicado_ahorro    numeric,
  primary key (etiqueta, contrato_id)
);

comment on table public.foto_plata is
  'Copias de las cifras de plata de TODOS los contratos, para comparar antes/después de una migración. Ver 170_foto_de_la_plata.sql. La mig 124 movió plata durante 3 días sin que nadie lo viera: esto existe para que no vuelva a pasar.';

alter table public.foto_plata enable row level security;
drop policy if exists foto_plata_lee_el_jefe on public.foto_plata;
create policy foto_plata_lee_el_jefe on public.foto_plata
  for select to authenticated using (public.mi_rol() = 'ADMIN_PRINCIPAL');

-- ── Tomar la foto ───────────────────────────────────────────────────────────────────────────
create or replace function public.tomar_foto_plata(p_etiqueta text)
returns int language plpgsql security definer set search_path = public as $$
declare v_n int;
begin
  delete from public.foto_plata where etiqueta = p_etiqueta;   -- repetible: vuelve a tomarla

  insert into public.foto_plata (
    etiqueta, contrato_id, total_cajas, cajas_pagadas, cajas_previas, cajas_exoneradas,
    caja_actual_pagado, prorrateo_pagado, ahorro_acumulado, ahorro_apertura, saldo_favor,
    deuda_pendiente, acuerdo_total, acuerdo_cuotas_pagadas, pagos_confirmados,
    aplicado_tarifa, aplicado_prorrateo, aplicado_deuda, aplicado_convenio, aplicado_ahorro)
  select
    p_etiqueta, c.id, c.total_cajas, c.cajas_pagadas, c.cajas_previas, c.cajas_exoneradas,
    c.caja_actual_pagado, c.prorrateo_pagado, c.ahorro_acumulado, c.ahorro_apertura,
    public.saldo_favor_actual(c.id),
    coalesce((select sum(d.monto_pendiente) from public.deudas d
               where d.contrato_id = c.id and d.estado = 'pendiente'), 0),
    coalesce((select sum(cv.deuda_total) from public.convenios cv
               where cv.contrato_id = c.id and cv.estado = 'activo'), 0),
    coalesce((select sum(cv.cuotas_pagadas) from public.convenios cv
               where cv.contrato_id = c.id and cv.estado = 'activo'), 0),
    coalesce(pa.n, 0), coalesce(pa.tar, 0), coalesce(pa.pro, 0),
    coalesce(pa.deu, 0), coalesce(pa.con, 0), coalesce(pa.aho, 0)
  from public.contratos c
  left join lateral (
    select count(*) as n,
           sum(p.aplicado_tarifa) as tar, sum(p.aplicado_prorrateo) as pro,
           sum(p.aplicado_deuda) as deu, sum(p.aplicado_convenio) as con,
           sum(p.aplicado_ahorro) as aho
      from public.pagos p
     where p.contrato_id = c.id and p.estado = 'Confirmado'
  ) pa on true;

  get diagnostics v_n = row_count;
  return v_n;
end $$;

comment on function public.tomar_foto_plata(text) is
  'Guarda las cifras de plata de todos los contratos con una etiqueta. Se corre ANTES y DESPUÉS de cualquier migración que toque dinero.';

-- ── Comparar dos fotos ──────────────────────────────────────────────────────────────────────
-- Devuelve una fila POR CIFRA que se movió, con nombre y placa. Cero filas = nada se movió.
create or replace function public.comparar_fotos(p_antes text, p_despues text)
returns table (placa text, cliente text, que_cambio text, antes numeric, despues numeric, diferencia numeric)
language sql stable security definer set search_path = public as $$
  with pares as (
    select a.contrato_id, x.que_cambio, x.antes, x.despues
      from public.foto_plata a
      join public.foto_plata d on d.contrato_id = a.contrato_id and d.etiqueta = p_despues
      cross join lateral (values
        ('semanas pagadas',        a.cajas_pagadas::numeric,      d.cajas_pagadas::numeric),
        ('semanas previas',        a.cajas_previas::numeric,      d.cajas_previas::numeric),
        ('semanas exoneradas',     a.cajas_exoneradas::numeric,   d.cajas_exoneradas::numeric),
        ('total de semanas',       a.total_cajas::numeric,        d.total_cajas::numeric),
        ('abonado a la semana en curso', a.caja_actual_pagado,    d.caja_actual_pagado),
        ('prorrateo pagado',       a.prorrateo_pagado,            d.prorrateo_pagado),
        ('ahorro acumulado',       a.ahorro_acumulado,            d.ahorro_acumulado),
        ('ahorro de apertura',     a.ahorro_apertura,             d.ahorro_apertura),
        ('saldo a favor',          a.saldo_favor,                 d.saldo_favor),
        ('deuda pendiente',        a.deuda_pendiente,             d.deuda_pendiente),
        ('total del acuerdo',      a.acuerdo_total,               d.acuerdo_total),
        ('cuotas del acuerdo pagadas', a.acuerdo_cuotas_pagadas::numeric, d.acuerdo_cuotas_pagadas::numeric),
        ('cantidad de pagos',      a.pagos_confirmados::numeric,  d.pagos_confirmados::numeric),
        ('lo aplicado a la semana',a.aplicado_tarifa,             d.aplicado_tarifa),
        ('lo aplicado al prorrateo',a.aplicado_prorrateo,         d.aplicado_prorrateo),
        ('lo aplicado a la deuda', a.aplicado_deuda,              d.aplicado_deuda),
        ('lo aplicado al acuerdo', a.aplicado_convenio,           d.aplicado_convenio),
        ('lo aplicado al ahorro',  a.aplicado_ahorro,             d.aplicado_ahorro)
      ) as x(que_cambio, antes, despues)
     where a.etiqueta = p_antes
  )
  select coalesce(m.placa, 'sin placa'), cl.nombre, pr.que_cambio,
         pr.antes, pr.despues, pr.despues - pr.antes
    from pares pr
    join public.contratos c on c.id = pr.contrato_id
    join public.clientes cl on cl.id = c.cliente_id
    left join public.motos m on m.id = c.moto_id
   where coalesce(pr.antes, 0) is distinct from coalesce(pr.despues, 0)
   order by abs(coalesce(pr.despues,0) - coalesce(pr.antes,0)) desc;
$$;

comment on function public.comparar_fotos(text, text) is
  'Qué se movió entre dos fotos, con placa y nombre. CERO FILAS = nada se movió, que es lo que se espera de una migración que no debía tocar plata.';

select public.registrar_migracion(170, '170_foto_de_la_plata.sql',
  'Foto antes/después de las cifras de plata, para que ninguna migración mueva un peso en silencio');

commit;

-- ─── VERIFICACIÓN: tomar dos fotos seguidas sin tocar nada debe dar CERO diferencias ─────────
select public.tomar_foto_plata('prueba-a') as contratos_en_la_foto;
select public.tomar_foto_plata('prueba-b');
select count(*) as diferencias_esperadas_cero from public.comparar_fotos('prueba-a', 'prueba-b');
delete from public.foto_plata where etiqueta in ('prueba-a', 'prueba-b');
-- Esperado: contratos_en_la_foto ≈ 362 · diferencias_esperadas_cero = 0
