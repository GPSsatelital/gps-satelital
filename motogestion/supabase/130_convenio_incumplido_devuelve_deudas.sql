-- 130 — CUANDO UN ACUERDO SE INCUMPLE, SUS DEUDAS VUELVEN A COBRARSE
--
-- EL HUECO (medido el 7-sep-2026): al vencerse un acuerdo sin pagar, `marcar_convenios_vencidos()`
-- lo pone en 'incumplido' — y ahí se acaba todo. Sus deudas siguen marcadas 'en_convenio', y
-- `loQueDebe()` solo suma las 'pendiente'. Resultado: la plata queda invisible. Nadie la cobra y
-- no sale en ninguna pantalla.
--
-- Caso real y único de hoy: SIMON CORREA CANTILLO (RMZ62H). Acuerdo de $440.000, abonó $130.000,
-- venció el 2-sep. Su deuda de migración quedó en $245.000 y **no aparece en su cuenta**: la
-- pantalla dice que debe $1.200.000 (cuota + multa) y esos $245.000 no están por ningún lado.
--
-- POR QUÉ AHORA SÍ SE PUEDE (y en agosto no): antes los abonos al acuerdo vivían solo en
-- `pagos.aplicado_convenio` y nunca bajaban `deudas.monto_pendiente`, así que devolver la deuda
-- la habría cobrado COMPLETA otra vez. Desde la mig 116/117 la partitura y `amortizar_convenio`
-- van tachando cada deuda con lo que entra: la de SIMON ya bajó de $390.000 a $245.000. Devolver
-- ese saldo es exacto, no cobra de más.
--
-- QUÉ HACE: al pasar a 'incumplido', las deudas del acuerdo que aún tienen saldo vuelven a
-- 'pendiente' (conservando `convenio_id`, el rastro de dónde estuvieron). Si el acuerdo vuelve a
-- 'activo', regresan a 'en_convenio'. Idempotente en los dos sentidos.
--
-- LO QUE NO HACE, A PROPÓSITO: las SEMANAS que el acuerdo marcó como pagadas en el libro de cajas
-- NO se des-marcan. Devolverlas volvería a exigir semanas que el cliente ya creía cerradas y es
-- una decisión de negocio, no técnica. La consulta (c) de abajo lista los casos para que el dueño
-- los mire uno por uno. Hoy no hay ninguno: el único incumplido no financió semanas.

create or replace function public.convenio_incumplido_devuelve_deudas()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_n int;
begin
  -- Se incumplió: lo que quedó sin pagar vuelve a la cuenta del cliente.
  if new.estado = 'incumplido' and coalesce(old.estado, '') <> 'incumplido' then
    with vueltas as (
      update public.deudas
         set estado = 'pendiente'
       where convenio_id = new.id
         and estado = 'en_convenio'
         and monto_pendiente > 0
      returning 1
    ) select count(*) into v_n from vueltas;
    if v_n > 0 then
      raise notice 'Acuerdo incumplido: % deuda(s) vuelven a cobrarse aparte.', v_n;
    end if;

  -- Volvió a estar vigente (se rehizo o se corrigió): sus deudas vuelven adentro.
  elsif new.estado = 'activo' and coalesce(old.estado, '') = 'incumplido' then
    update public.deudas
       set estado = 'en_convenio'
     where convenio_id = new.id
       and estado = 'pendiente'
       and monto_pendiente > 0;
  end if;

  return new;
end; $$;

drop trigger if exists trg_convenio_incumplido_devuelve on public.convenios;
create trigger trg_convenio_incumplido_devuelve
  after update of estado on public.convenios
  for each row
  when (new.estado is distinct from old.estado)
  execute function public.convenio_incumplido_devuelve_deudas();

-- ── Backfill: los que ya están incumplidos con plata adentro ─────────────────────────────────
update public.deudas d
   set estado = 'pendiente'
  from public.convenios cv
 where cv.id = d.convenio_id
   and cv.estado = 'incumplido'
   and d.estado = 'en_convenio'
   and d.monto_pendiente > 0;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- a) Ninguna deuda con saldo debe quedar dentro de un acuerdo incumplido (debe dar 0).
select count(*) as deudas_atrapadas_en_incumplidos
  from public.deudas d join public.convenios cv on cv.id = d.convenio_id
 where cv.estado = 'incumplido' and d.estado = 'en_convenio' and d.monto_pendiente > 0;

-- b) A quién se le devolvió qué (SIMON debería aparecer con sus $245.000).
select cl.nombre, m.placa, d.concepto, d.monto as original, d.monto_pendiente as vuelve_a_cobrarse,
       cv.deuda_total as acuerdo_pactado, cv.fecha_limite as vencio
  from public.deudas d
  join public.convenios cv on cv.id = d.convenio_id
  join public.contratos c on c.id = d.contrato_id
  join public.clientes cl on cl.id = c.cliente_id
  left join public.motos m on m.id = c.moto_id
 where cv.estado = 'incumplido' and d.monto_pendiente > 0
 order by cl.nombre;

-- c) PARA EL DUEÑO: acuerdos incumplidos que además habían marcado semanas como pagadas.
--    Esas semanas NO se devolvieron (decisión suya, caso por caso). Hoy debe dar 0 filas.
select cl.nombre, m.placa, cv.deuda_total, cv.fecha_limite,
       (select sum((r->>'monto')::numeric) from jsonb_array_elements(cv.partitura) r where r->>'tipo' = 'semana') as semanas_que_marco
  from public.convenios cv
  join public.contratos c on c.id = cv.contrato_id
  join public.clientes cl on cl.id = c.cliente_id
  left join public.motos m on m.id = c.moto_id
 where cv.estado = 'incumplido'
   and coalesce((select sum((r->>'monto')::numeric) from jsonb_array_elements(cv.partitura) r where r->>'tipo' = 'semana'), 0) > 0;
