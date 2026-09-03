-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 124 — CADA DEUDA RECUERDA A CUÁL CONVENIO ENTRÓ (3-sep-2026)
--
-- PEDIDO DEL DUEÑO: "que las deudas registradas por fuera de un convenio también se puedan
-- ingresar en el convenio y que queden incluidas y como siempre sin perder el rastro para los
-- reportes e integraciones con la información con la que iniciaron y quede marcado para siempre".
--
-- QUÉ YA FUNCIONABA (verificado leyendo el código, no hay que rehacerlo):
--   · Meter una deuda a un convenio ya existe: `ModalAmpliarConvenio` + `ampliarConvenio`.
--   · Marcarlas también: la mig 098 (13-ago) puso el disparador `trg_convenio_ampliado`, y la
--     099 mantiene `convenio_marca_contemplado()` para el convenio nuevo. El cobro doble que eso
--     corrigió NO está vivo.
--
-- LO QUE FALTABA — y es exactamente "el rastro": la deuda queda marcada `en_convenio`, pero
-- **no dice en CUÁL convenio**. Con 3 convenios posibles por contrato, ningún informe puede
-- responder "¿qué financió el convenio #2?" ni "¿esta multa entró al acuerdo que firmó en julio?".
--
-- ESTO ES SOLO RASTRO: no mueve un peso, no cambia a quién se le cobra ni cuánto. Las mismas
-- deudas que hoy quedan marcadas quedan marcadas igual; ahora además guardan de quién son.
-- La información con la que nacieron (concepto, descripción, monto, monto_pendiente, created_at)
-- NO se toca nunca.
--
-- ⚠️ LO QUE **NO** HACE ESTA MIGRACIÓN (a propósito, ver el informe al dueño):
-- devolver las deudas a 'pendiente' cuando el convenio se incumple. Suena inofensivo y NO lo es:
-- los abonos del convenio viven en `pagos.aplicado_convenio`, no bajan `deudas.monto_pendiente`.
-- Devolver la deuda entera a exigible mientras el convenio conserva su propio saldo cobraría la
-- misma plata dos veces — el defecto que este proyecto ya pagó caro. Necesita decidir antes qué
-- pasa con el saldo del convenio incumplido. Queda anotado, sin construir.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

-- ─── 1) La columna del rastro ───────────────────────────────────────────────────────────────
alter table public.deudas
  add column if not exists convenio_id uuid references public.convenios(id) on delete set null;

comment on column public.deudas.convenio_id is
  'A cual convenio entro esta deuda (mig 124). Se conserva aunque el convenio termine: es el rastro, no el estado. NULL = nunca entro a ninguno.';

create index if not exists idx_deudas_convenio on public.deudas(convenio_id) where convenio_id is not null;

-- ─── 2) Backfill de lo que ya está marcado ──────────────────────────────────────────────────
-- Las que hoy dicen `en_convenio` se enlazan al convenio del contrato: el activo si lo hay, si no
-- el más reciente que no fue renovado. Es la mejor lectura posible del pasado; de aquí en
-- adelante el enlace lo escriben los disparadores en el momento exacto.
update public.deudas d
   set convenio_id = (
     select c.id from public.convenios c
      where c.contrato_id = d.contrato_id
      order by (c.estado = 'activo') desc, c.created_at desc
      limit 1
   )
 where d.estado = 'en_convenio'
   and d.convenio_id is null;

-- ─── 3) Convenio NUEVO: marcar y enlazar ────────────────────────────────────────────────────
-- Copia exacta de la función viva (mig 099) con UN cambio: el `update` de deudas también escribe
-- `convenio_id`. Todo lo demás —el ledger de cajas, el retrato reversible— queda idéntico.
create or replace function public.convenio_marca_contemplado()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_c public.contratos;
  v_cubrir int;
begin
  if new.estado <> 'activo' then return new; end if;

  update public.deudas
     set estado = 'en_convenio',
         convenio_id = new.id          -- ★ 124: el rastro
   where contrato_id = new.contrato_id
     and estado = 'pendiente'
     and created_at <= new.created_at;

  select * into v_c from public.contratos where id = new.contrato_id;
  if v_c.id is null or not coalesce(v_c.motor_v2, false) or v_c.forma_pago = 'Diario' then
    return new;
  end if;

  if new.cubre_periodo_hasta is not null and new.cubre_periodo_hasta > current_date then
    v_cubrir := public.cajas_exigidas(v_c, new.cubre_periodo_hasta - 1);
  elsif new.cubre_periodo_hasta = current_date then
    v_cubrir := greatest(public.cajas_exigidas(v_c, current_date) - 1, 0);
  else
    v_cubrir := greatest(public.cajas_exigidas(v_c, current_date) - 1, 0);
  end if;

  if v_cubrir > coalesce(v_c.cajas_pagadas, 0) then
    update public.convenios
       set cajas_pagadas_previas     = coalesce(v_c.cajas_pagadas, 0),
           caja_actual_pagado_previo = coalesce(v_c.caja_actual_pagado, 0),
           cajas_pagadas_marcadas    = v_cubrir
     where id = new.id;
    update public.contratos
       set cajas_pagadas = v_cubrir,
           caja_actual_pagado = 0
     where id = new.contrato_id;
  end if;

  return new;
end; $$;

-- ─── 4) Convenio AMPLIADO: marcar y enlazar ─────────────────────────────────────────────────
-- Copia exacta de la mig 098 con el mismo único cambio. Se conserva la regla del dueño: entran
-- de la MÁS VIEJA a la más nueva, solo las que caben completas en lo que se agregó.
create or replace function public.convenio_ampliado_marca_deudas()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_extra numeric;
  v_d record;
begin
  if new.estado <> 'activo' then return new; end if;

  v_extra := coalesce(new.deuda_total, 0) - coalesce(old.deuda_total, 0);
  if v_extra <= 0 then return new; end if;

  for v_d in
    select id, monto_pendiente from public.deudas
     where contrato_id = new.contrato_id
       and estado = 'pendiente'
       and monto_pendiente > 0
     order by created_at
  loop
    exit when v_extra <= 0;
    if v_d.monto_pendiente <= v_extra then
      update public.deudas
         set estado = 'en_convenio',
             convenio_id = new.id      -- ★ 124: el rastro
       where id = v_d.id;
      v_extra := v_extra - v_d.monto_pendiente;
    end if;
  end loop;

  return new;
end; $$;

-- ─── Verificación (no cambia nada; solo mira) ───────────────────────────────────────────────
-- 1) La columna existe.
select column_name, data_type, is_nullable
  from information_schema.columns
 where table_schema = 'public' and table_name = 'deudas' and column_name = 'convenio_id';
-- Debe dar 1 fila: convenio_id uuid YES

-- 2) Cuántas deudas quedaron enlazadas y cuántas 'en_convenio' quedaron huérfanas.
select count(*) filter (where estado = 'en_convenio')                        as en_convenio,
       count(*) filter (where estado = 'en_convenio' and convenio_id is not null) as enlazadas,
       count(*) filter (where estado = 'en_convenio' and convenio_id is null)     as sin_enlazar
  from public.deudas;
-- `sin_enlazar` debe ser 0. Si no lo es, son deudas marcadas de un contrato sin ningún convenio:
-- reportarlas antes de seguir (nombre + placa) — es un descuadre viejo, no algo que creó la 124.

-- 3) Qué financia cada convenio, con nombre y placa. Este es el informe que antes no se podía hacer.
select cl.nombre, m.placa, cv.numero_convenio, cv.estado,
       count(d.id) as deudas_adentro,
       coalesce(sum(d.monto), 0) as monto_original_de_esas_deudas,
       cv.deuda_total as total_del_convenio
  from public.convenios cv
  join public.contratos c on c.id = cv.contrato_id
  join public.clientes cl on cl.id = c.cliente_id
  left join public.motos m on m.id = c.moto_id
  left join public.deudas d on d.convenio_id = cv.id
 group by cl.nombre, m.placa, cv.numero_convenio, cv.estado, cv.deuda_total, cv.created_at
 order by cv.created_at desc
 limit 40;
