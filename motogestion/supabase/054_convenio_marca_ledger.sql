-- ===== 054: al FIRMAR un convenio, el sistema marca todo solo =====
-- Regla de negocio (definida por el usuario 14-jul): "lo firmado en el convenio se respeta —
-- todo lo que el cliente debía ANTES de firmar quedó contemplado dentro del convenio".
-- Antes esto se hacía "de palabra": la deuda seguía 'pendiente' (se cobraba doble) y el
-- ledger seguía exigiendo las semanas viejas (el FIFO les robaba los pagos nuevos). Este
-- trigger deja ambas cosas marcadas automáticamente al crear el convenio, por CUALQUIER ruta.

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
  --    actual también quedó financiada. El dinero parcial que hubiera en una semana cubierta
  --    ya está neteado en el total firmado (el modal calcula la meta con el hueco actual).
  select * into v_c from public.contratos where id = new.contrato_id;
  if v_c.id is null or not coalesce(v_c.motor_v2, false) or v_c.forma_pago = 'Diario' then
    return new;
  end if;

  v_exigidas := public.cajas_exigidas(v_c, current_date);
  if new.cubre_periodo_hasta is not null and new.cubre_periodo_hasta >= current_date then
    v_cubrir := v_exigidas;               -- también la semana actual (financiada)
  else
    v_cubrir := greatest(v_exigidas - 1, 0); -- solo las anteriores; la actual se paga en efectivo
  end if;

  if v_cubrir > coalesce(v_c.cajas_pagadas, 0) then
    update public.contratos
       set cajas_pagadas = v_cubrir,
           caja_actual_pagado = 0
     where id = new.contrato_id;
  end if;

  return new;
end; $$;

drop trigger if exists trg_convenio_marca_contemplado on public.convenios;
create trigger trg_convenio_marca_contemplado
  after insert on public.convenios
  for each row execute function public.convenio_marca_contemplado();
