-- ===== 067: dos correcciones encontradas probando los flujos en sandbox (26-jul) =====

-- ─────────────────────────────────────────────────────────────────────────────
-- A) BORRAR UN CONVENIO DEJABA CUOTAS PAGADAS FANTASMA
--
-- Medido en el sandbox: al crear un convenio, el trigger 054 subió cajas_pagadas de 1 a 5
-- (las 4 semanas atrasadas quedan "cubiertas" por el convenio — eso es correcto). Pero al
-- BORRAR el convenio, cajas_pagadas se quedó en 5: el cliente queda marcado como si hubiera
-- pagado 4 semanas ($808.000) que nunca pagó, y sus cuotas atrasadas bajan solas.
--
-- Causa: 054 hace `set cajas_pagadas = v_cubrir` (asigna) sin guardar el valor anterior en
-- ningún lado, y no existe trigger de DELETE. Es real: ya hubo que borrar convenios duplicados
-- (caso XZN22H), y cada borrado dejaba este daño invisible.
--
-- Solución: el propio convenio guarda qué había antes, y al borrarlo se restaura.

alter table public.convenios
  add column if not exists cajas_pagadas_previas integer,
  add column if not exists caja_actual_pagado_previo numeric,
  -- Hasta dónde dejó el ledger ESTE convenio. Es lo que permite saber, al borrarlo, si el
  -- valor actual sigue siendo el suyo (se deshace) o si alguien pagó de verdad después
  -- (no se toca). Sin esto no hay forma de distinguir los dos casos.
  add column if not exists cajas_pagadas_marcadas integer;

comment on column public.convenios.cajas_pagadas_previas is
  'Valor de contratos.cajas_pagadas justo antes de que este convenio marcara las semanas '
  'atrasadas como cubiertas. Permite deshacer la marca si el convenio se borra.';

create or replace function public.convenio_marca_contemplado()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_c public.contratos;
  v_exigidas int;
  v_cubrir int;
begin
  if new.estado <> 'activo' then return new; end if;

  -- 1) Deudas registradas ANTES de la firma → en_convenio (se pagan vía cuota del convenio).
  --    Las creadas después (ej. multa nueva) quedan intactas y se cobran directo.
  update public.deudas
     set estado = 'en_convenio'
   where contrato_id = new.contrato_id
     and estado = 'pendiente'
     and created_at <= new.created_at;

  -- 2) Ledger (motor de cajas): las semanas exigibles ANTERIORES al período actual quedan
  --    cubiertas por el convenio. Si cubre_periodo_hasta llega a hoy o más allá, la semana
  --    actual también quedó financiada.
  select * into v_c from public.contratos where id = new.contrato_id;
  if v_c.id is null or not coalesce(v_c.motor_v2, false) or v_c.forma_pago = 'Diario' then
    return new;
  end if;

  v_exigidas := public.cajas_exigidas(v_c, current_date);
  if new.cubre_periodo_hasta is not null and new.cubre_periodo_hasta >= current_date then
    v_cubrir := v_exigidas;
  else
    v_cubrir := greatest(v_exigidas - 1, 0);
  end if;

  if v_cubrir > coalesce(v_c.cajas_pagadas, 0) then
    -- Guardar el estado previo EN EL CONVENIO antes de pisarlo: es lo único que permite
    -- deshacer la marca si el convenio se borra o se rehace.
    update public.convenios
       set cajas_pagadas_previas = coalesce(v_c.cajas_pagadas, 0),
           caja_actual_pagado_previo = coalesce(v_c.caja_actual_pagado, 0),
           cajas_pagadas_marcadas = v_cubrir
     where id = new.id;

    update public.contratos
       set cajas_pagadas = v_cubrir,
           caja_actual_pagado = 0
     where id = new.contrato_id;
  end if;

  return new;
end; $$;

-- Al borrar el convenio, se deshace lo que marcó: las cuotas vuelven a estar exigidas y las
-- deudas que quedaron 'en_convenio' vuelven a 'pendiente'. Solo se restaura si el ledger no
-- avanzó por otra vía después (si el cliente pagó de verdad, ese avance NO se toca).
create or replace function public.convenio_deshace_contemplado()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.cajas_pagadas_previas is not null then
    -- Se deshace SOLO si el ledger sigue exactamente donde lo dejó este convenio. Si cambió
    -- (el cliente pagó de verdad después), ese avance es legítimo y no se toca.
    update public.contratos
       set cajas_pagadas = old.cajas_pagadas_previas,
           caja_actual_pagado = coalesce(old.caja_actual_pagado_previo, 0)
     where id = old.contrato_id
       and cajas_pagadas = old.cajas_pagadas_marcadas;
  end if;

  update public.deudas
     set estado = 'pendiente'
   where contrato_id = old.contrato_id
     and estado = 'en_convenio';

  return old;
end; $$;

drop trigger if exists trg_convenio_deshace_contemplado on public.convenios;
create trigger trg_convenio_deshace_contemplado
  after delete on public.convenios
  for each row execute function public.convenio_deshace_contemplado();

-- ─────────────────────────────────────────────────────────────────────────────
-- B) LA LIQUIDACIÓN "FELIZ" FALLABA EN SILENCIO
--
-- Cuando un cliente TERMINA bien su contrato y se lleva la moto, confirmarCierre() pone
-- clientes.estado = 'Egresado' (useLiquidaciones.ts:237) — pero ese estado nunca se agregó
-- al CHECK (mig 010). El update falla, el código no revisa el error, y la pantalla dice
-- "Liquidación cerrada" mientras el cliente se queda 'Activo' para siempre.

alter table public.clientes drop constraint if exists clientes_estado_check;

alter table public.clientes
  add constraint clientes_estado_check
  check (estado in (
    'En proceso',
    'Listo para visita',
    'Pendiente evaluación',
    'Aprobado',
    'Activo',
    'En seguimiento',
    'En riesgo',
    'En mora',
    'Rechazado',
    'Retirado',
    'Egresado',
    'Lista negra',
    'Inmovilización documentación incompleta'
  ));
