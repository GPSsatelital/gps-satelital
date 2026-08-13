-- ===== 098: ampliar un convenio también marca las deudas que se llevó adentro =====
--
-- EL DEFECTO (verificado el 13-ago-2026 leyendo el código, antes de que le costara plata a nadie):
-- `ampliarConvenio` (useConvenios.ts:84) hace DOS cosas — escribe el rastro y actualiza el
-- convenio (`deuda_total`, `numero_cuotas`, `fecha_limite`). **Nunca toca la tabla `deudas`.**
-- Y el disparador que marca las deudas como contempladas (`convenio_marca_contemplado`, mig 082)
-- es `after INSERT`: al ampliar no corre.
--
-- Resultado: la ventana muestra las deudas sueltas y hasta ofrece "Usar ese monto"; el funcionario
-- lo acepta, el monto entra al convenio... y la deuda se queda en `pendiente`. Entonces el motor
-- la cobra DOS VECES: primero como deuda suelta (el paso 3 va antes que el convenio) y después
-- otra vez adentro de la cuota del acuerdo. Es el mismo defecto que la mig 069 corrigió para el
-- otro camino.
--
-- Se arregla en la BD y no en la pantalla a propósito: así queda cubierto por cualquier ruta que
-- suba `deuda_total`, no solo por el botón de hoy. Mismo criterio que el disparador del insert.
--
-- ── LA REGLA (decisión del dueño, 13-ago) ────────────────────────────────────────────────────
-- Se marcan las deudas **de la más vieja a la más nueva, hasta cubrir el monto agregado**.
-- No todas: si agregó $50.000 y el cliente tenía $300.000 sueltos, marcar todo le perdonaría
-- $250.000 que nadie metió al convenio.
--
-- Una deuda no se puede marcar "a medias" (no existe media deuda dentro de un convenio), así que
-- solo entran las que CABEN completas en lo que se agregó. Si una es más grande que el saldo
-- restante se salta y se sigue con la siguiente — así se absorbe lo más posible sin pasarse.
-- En el uso normal esto no se nota: el botón "Usar ese monto" precarga justo el total de las
-- deudas sueltas, así que entran todas y no sobra nada.

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
      update public.deudas set estado = 'en_convenio' where id = v_d.id;
      v_extra := v_extra - v_d.monto_pendiente;
    end if;
  end loop;

  return new;
end; $$;

-- `when (new.deuda_total > old.deuda_total)` es lo que impide que esto se dispare con cada pago:
-- el motor actualiza `cuotas_pagadas`, `estado` y `fecha_limite` del convenio constantemente, y
-- sin esa guarda estaría marcando deudas en cada cobro.
drop trigger if exists trg_convenio_ampliado on public.convenios;
create trigger trg_convenio_ampliado
  after update of deuda_total on public.convenios
  for each row
  when (new.deuda_total is distinct from old.deuda_total and new.deuda_total > old.deuda_total)
  execute function public.convenio_ampliado_marca_deudas();
