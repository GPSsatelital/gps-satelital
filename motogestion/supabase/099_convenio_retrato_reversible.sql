-- ===== 099: que borrar un convenio vuelva a devolver las semanas =====
--
-- LA REGRESIÓN (encontrada el 13-ago-2026): la mig 067 hizo que el convenio guardara un "retrato"
-- de cómo estaba el contador de semanas ANTES de tocarlo (`cajas_pagadas_previas`,
-- `caja_actual_pagado_previo`, `cajas_pagadas_marcadas`). Eso es lo único que permite deshacer la
-- marca si el convenio se borra. La mig 082 (5-ago) reescribió la función COMPLETA para arreglar
-- otra cosa — las semanas financiadas que aún no habían llegado — y **se le quedó por fuera ese
-- bloque**. Desde entonces ningún convenio guarda el retrato.
--
-- QUÉ COSTABA: el disparador de borrado (067) arranca con `if old.cajas_pagadas_previas is not
-- null`. Con el retrato vacío no hace nada: las deudas vuelven a `pendiente` pero **las semanas
-- quedan marcadas como pagadas para siempre, sin que nadie las haya pagado**. Se detectó al ir a
-- rehacer el convenio de NESTOR (YAL67H): borrarlo le habría regalado $188.000. Se salvó
-- reponiéndole el retrato a mano.
--
-- ESTA MIGRACIÓN HACE DOS COSAS:
--
--   1. Devuelve el bloque del retrato a `convenio_marca_contemplado`. Es la función VIVA de la
--      082 tal cual, con las cinco líneas que faltaban. Los convenios NUEVOS vuelven a ser
--      reversibles.
--
--   2. Para los ~52 que ya existen SIN retrato: el borrado se BLOQUEA con un mensaje claro en vez
--      de dejar pasar el daño en silencio. No se puede reconstruir su retrato — lo que el contador
--      valía antes de firmar se perdió, y adivinarlo sería peor que no tenerlo. Borrar uno de esos
--      es una decisión que alguien tiene que tomar mirando el caso, como se hizo con NESTOR.
--      Solo se bloquea si de verdad cubrió semanas (`cubre_periodo_hasta` no nulo) y el contrato
--      usa el motor de cajas: un convenio que nunca marcó nada se borra sin problema.

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
    -- ⬇️ ESTO ES LO QUE LA 082 PERDIÓ. Sin estas líneas el convenio no se puede deshacer.
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

-- ── El candado para los convenios viejos, sin retrato ────────────────────────────────────────
create or replace function public.convenio_borrado_seguro()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_c public.contratos;
begin
  if old.cajas_pagadas_previas is not null then return old; end if;
  if old.cubre_periodo_hasta is null then return old; end if;

  select * into v_c from public.contratos where id = old.contrato_id;
  if v_c.id is null or not coalesce(v_c.motor_v2, false) or v_c.forma_pago = 'Diario' then
    return old;
  end if;

  raise exception 'Este convenio se firmó antes de que el sistema guardara cómo estaba el contador de semanas, así que borrarlo dejaría semanas marcadas como pagadas que nadie pagó. Antes de borrarlo hay que revisar el caso y reponerle ese dato. Avisa a quien administra el sistema.';
end; $$;

-- Va antes que el que deshace (orden alfabético: 'borrado' < 'deshace'), así el candado corta
-- la operación completa antes de que se toque nada.
drop trigger if exists trg_convenio_borrado_seguro on public.convenios;
create trigger trg_convenio_borrado_seguro
  before delete on public.convenios
  for each row execute function public.convenio_borrado_seguro();
