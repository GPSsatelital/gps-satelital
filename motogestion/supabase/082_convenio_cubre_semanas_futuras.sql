-- ===== 082: el convenio también cubre las semanas financiadas que TODAVÍA NO HAN LLEGADO =====
--
-- QUÉ ESTABA MAL (encontrado el 5-ago-2026 con el caso de ANDRY BREA, RLZ93H):
-- Al firmar un convenio se pueden meter adentro 1 o 2 semanas de arriendo. El disparador de la
-- mig 054 marca esas semanas como cubiertas en el motor de cajas para que no se cobren aparte...
-- pero solo podía marcar las que YA estaban vencidas el día de la firma. La semana que aún no
-- llegaba se quedaba sin marcar; cuando llegaba, el motor la exigía como cualquier otra y el
-- siguiente pago se la tragaba. Resultado: esa semana se pagaba DOS VECES — una dentro del total
-- del convenio y otra en efectivo.
--
-- ANDRY, con números: convenio del sáb 1-ago por $1.525.000 = $1.305.000 de deudas viejas
-- + $25.000 (lo que faltaba de la semana del 27-jul) + $195.000 (la semana COMPLETA del 3-ago).
-- El sábado 1 la semana del 3 no existía, así que no se marcó. El martes 4 pagó $200.000 y el
-- motor mandó $195.000 a esa semana y solo $5.000 al convenio.
--
-- Nota: el defecto es de la mig 054 (14-jul), no de un cambio reciente — 9 de los 12 convenios
-- afectados se firmaron antes del 1-ago.
--
-- EL ARREGLO: en vez de contar las cajas exigidas HOY, se cuentan las exigidas hasta el día
-- anterior a `cubre_periodo_hasta`. Esa fecha es justamente el día de pago SIGUIENTE al último
-- período financiado, así que un día antes cae dentro del último período cubierto.
--   ANDRY: cubre_periodo_hasta = 10-ago  →  cajas_exigidas(contrato, 9-ago) incluye la semana
--   del 3-ago. Queda marcada y el motor deja de pedirla.
--
-- Se reutiliza `cajas_exigidas()`, la misma función del motor, en vez de recalcular fechas por
-- aparte: si algún día cambia cómo se cuentan los períodos, esto la sigue sin tocar nada.
--
-- LO QUE NO CAMBIA: el reparto de pagos, el motor de cajas, la ventana de convenios, el paso de
-- deudas a 'en_convenio', ni la caja diaria. Y los convenios YA firmados no se corrigen solos:
-- este disparador solo actúa al crear uno nuevo.

create or replace function public.convenio_marca_contemplado()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_c public.contratos;
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

  -- 2) Ledger (motor de cajas): marcar las semanas que el convenio se llevó adentro.
  select * into v_c from public.contratos where id = new.contrato_id;
  if v_c.id is null or not coalesce(v_c.motor_v2, false) or v_c.forma_pago = 'Diario' then
    return new;
  end if;

  if new.cubre_periodo_hasta is not null and new.cubre_periodo_hasta > current_date then
    -- Se financiaron semanas: cubrir hasta el último período incluido, HAYA LLEGADO O NO.
    v_cubrir := public.cajas_exigidas(v_c, new.cubre_periodo_hasta - 1);
  elsif new.cubre_periodo_hasta = current_date then
    -- Cubre justo hasta hoy: el período que arranca hoy NO está financiado.
    v_cubrir := greatest(public.cajas_exigidas(v_c, current_date) - 1, 0);
  else
    -- Sin semanas financiadas: solo las anteriores; la actual se paga en efectivo.
    v_cubrir := greatest(public.cajas_exigidas(v_c, current_date) - 1, 0);
  end if;

  if v_cubrir > coalesce(v_c.cajas_pagadas, 0) then
    update public.contratos
       set cajas_pagadas = v_cubrir,
           caja_actual_pagado = 0
     where id = new.contrato_id;
  end if;

  return new;
end; $$;

-- El disparador sigue siendo el mismo (after insert on convenios); solo cambió la función.
