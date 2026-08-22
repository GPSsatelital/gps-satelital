-- ===== 112: cada caja que se llena queda ANOTADA con fecha — la nómina deja de adivinar =====
--
-- EL PROBLEMA (auditoría del 22-ago, con el SQL del dueño: 63 contratos descuadrados): la nómina
-- de cobradores intentaba reconstruir CUÁNDO se llenó cada caja releyendo los pagos. Imposible de
-- hacer bien, porque las cajas se llenan por TRES caminos:
--   1. Pagos (y con dos formatos históricos de reparto: antes y después del motor).
--   2. Convenios: al firmarse, las semanas financiadas se marcan pagadas SIN plata (mig 054/082/099).
--   3. Ajustes a mano por SQL (caso IEW47I/JHEINER: prorrateo $109.000 con cero pagos).
--
-- LA SOLUCIÓN: una tabla de ANOTACIONES escrita por un vigía sobre `contratos`. Cada vez que
-- `cajas_pagadas` sube, se anota qué cajas se llenaron y cuándo; cada vez que baja (reversa de un
-- pago, borrado de convenio con retrato), las anotaciones sobrantes se borran. El vigía mira el
-- CONTADOR, no el camino — así captura los tres caminos sin tocar ni una línea del motor de
-- reparto (aplicar_pago_confirmado queda EXACTAMENTE igual).
--
-- La fuente 'convenio' se marca con una señal transaccional puesta por convenio_marca_contemplado
-- (misma técnica de la mig 111). Todo lo demás queda 'pago'. La nómina paga:
--   · fuente 'pago' → ciclo a tiempo/atrasado ($7.500 / 30%) según la semana en que se exigía.
--   · fuente 'convenio' → NADA por la anotación: esas semanas se le pagan al cobrador cuando
--     ENTRA cada cuota del convenio (decisión del dueño, 22-ago: "plata que entra, gestión que
--     se paga"), y eso se lee de los pagos (aplicado_convenio), no de acá.
--
-- SIN RELLENO HISTÓRICO a propósito: inventar fechas para lo ya llenado sería adivinar. Las
-- anotaciones existen desde que corre esta migración → la primera semana de nómina 100% exacta
-- es la primera semana completa DESPUÉS de correrla. Las anteriores se calculan con el método
-- viejo y la pantalla lo avisa.

create table if not exists public.cajas_llenadas (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  -- 0 = el prorrateo (caja 0); 1..N = las cajas del libro (numeración absoluta del contrato).
  caja_numero integer not null,
  fecha date not null default current_date,
  fuente text not null default 'pago' check (fuente in ('pago', 'convenio')),
  created_at timestamptz not null default now(),
  unique (contrato_id, caja_numero)
);

comment on table public.cajas_llenadas is
  'Anotación de cada caja del libro que se llenó: cuándo y por qué camino. La escribe el vigía de contratos (mig 112); la lee la nómina de cobradores. La reversa borra su anotación.';

alter table public.cajas_llenadas enable row level security;
create policy "cajas_llenadas: lee staff de oficina"
  on public.cajas_llenadas for select to authenticated
  using (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA'));
-- Sin política de escritura: solo escriben los triggers (security definer).

-- ── El vigía ─────────────────────────────────────────────────────────────────
create or replace function public.registrar_caja_llenada()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Cajas que se llenaron (el contador subió): una anotación por cada una.
  if coalesce(new.cajas_pagadas, 0) > coalesce(old.cajas_pagadas, 0) then
    insert into public.cajas_llenadas (contrato_id, caja_numero, fecha, fuente)
    select new.id, n, current_date,
           coalesce(nullif(current_setting('app.fuente_caja', true), ''), 'pago')
    from generate_series(coalesce(old.cajas_pagadas, 0) + 1, coalesce(new.cajas_pagadas, 0)) n
    on conflict (contrato_id, caja_numero) do nothing;
  -- Reversa (el contador bajó): las anotaciones de las cajas des-llenadas se borran.
  elsif coalesce(new.cajas_pagadas, 0) < coalesce(old.cajas_pagadas, 0) then
    delete from public.cajas_llenadas
     where contrato_id = new.id and caja_numero > coalesce(new.cajas_pagadas, 0);
  end if;

  -- El prorrateo (caja 0): se anota al completarse; si una reversa lo des-completa, se borra.
  if coalesce(new.prorrateo_total, 0) > 0 then
    if coalesce(new.prorrateo_pagado, 0) >= new.prorrateo_total
       and coalesce(old.prorrateo_pagado, 0) < coalesce(old.prorrateo_total, new.prorrateo_total) then
      insert into public.cajas_llenadas (contrato_id, caja_numero, fecha, fuente)
      values (new.id, 0, current_date, 'pago')
      on conflict (contrato_id, caja_numero) do nothing;
    elsif coalesce(new.prorrateo_pagado, 0) < new.prorrateo_total then
      delete from public.cajas_llenadas where contrato_id = new.id and caja_numero = 0;
    end if;
  end if;

  return new;
end; $$;

drop trigger if exists trg_registrar_caja_llenada on public.contratos;
create trigger trg_registrar_caja_llenada
  after update of cajas_pagadas, prorrateo_pagado on public.contratos
  for each row
  when (old.cajas_pagadas is distinct from new.cajas_pagadas
     or old.prorrateo_pagado is distinct from new.prorrateo_pagado)
  execute function public.registrar_caja_llenada();

-- ── convenio_marca_contemplado: la función VIVA de la 099 + la señal de fuente ────────────────
-- Cuerpo idéntico al de la mig 099 (retrato incluido). ÚNICO cambio: la señal 'convenio' antes
-- de mover el contador, para que el vigía anote esas cajas con su fuente real.
create or replace function public.convenio_marca_contemplado()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_c public.contratos;
  v_cubrir int;
begin
  if new.estado <> 'activo' then return new; end if;

  update public.deudas
     set estado = 'en_convenio'
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

    -- ⬇️ LO NUEVO (mig 112): estas cajas las marca el CONVENIO, no un pago. El vigía las anota
    -- con fuente 'convenio' y la nómina NO las paga por la anotación — se pagan cuando entra
    -- cada cuota del convenio. La señal es de esta transacción y se apaga al salir.
    perform set_config('app.fuente_caja', 'convenio', true);
    update public.contratos
       set cajas_pagadas = v_cubrir,
           caja_actual_pagado = 0
     where id = new.contrato_id;
    perform set_config('app.fuente_caja', '', true);
  end if;

  return new;
end; $$;
