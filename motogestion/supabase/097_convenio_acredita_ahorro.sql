-- ===== 097: las semanas metidas en un convenio SÍ ganan su ahorro =====
--
-- LA REGLA (spec del libro de cajas, regla 8) estaba escrita desde julio:
--   "las semanas financiadas dentro del convenio ganan su ahorro al cumplirse el convenio"
-- ...y el código que la cumple NUNCA se construyó. Verificado el 13-ago-2026 contra la función
-- VIVA de producción (pg_get_functiondef), no contra el repo: en el motor v2 la variable
-- `v_ahorro_pago` solo suma en el paso 1 (prorrateo) y el paso 2 (cajas). El paso 4 (convenio)
-- calcula `v_ap_conv` y no toca el ahorro ni una vez.
--
-- QUÉ SIGNIFICABA EN PLATA: una semana de $202.000 son $176.000 de la empresa + $26.000 de
-- AHORRO DEL CLIENTE. Al meterla dentro de un convenio, el cliente la pagaba completa y los
-- $26.000 no se le acreditaban nunca — ni al pagar, ni al cumplirse el convenio, ni en la
-- liquidación. Lo más injusto: si pagaba esa MISMA semana atrasada en efectivo, sí los ganaba.
-- Le salía más caro el acuerdo de pago que pagar de a poquitos.
--
-- ── POR QUÉ UN DISPARADOR APARTE Y NO TOCAR `aplicar_pago_confirmado` ────────────────────────
-- Esa función son ~250 líneas de reparto de dinero, y la viva NO es igual a la del repo (lo
-- advierte la mig 083). Reescribirla completa para agregar seis líneas es la forma más cara de
-- romper algo que funciona. Este disparador corre DESPUÉS del suyo, lee lo que él ya decidió
-- (`aplicado_convenio`) y solo suma la parte de ahorro. No cambia ni un peso de su reparto.
--   Orden garantizado: Postgres dispara por orden alfabético del nombre, y
--   'trg_pago_confirmado' < 'trg_pago_convenio_ahorro'.
--
-- ── POR QUÉ NO AFECTA A NADIE TODAVÍA ────────────────────────────────────────────────────────
-- Solo actúa si el convenio tiene `ahorro_semanas` (columna de la mig 096), que hoy es NULL en
-- los 53 convenios existentes. O sea: nace sin efecto y solo aplica a los convenios NUEVOS.
-- Los viejos se completan aparte, revisados uno por uno contra su acuerdo firmado — nunca a
-- ciegas. Mientras `ahorro_semanas` sea NULL, este disparador es un no-op exacto.
--
-- ── LA REGLA DE REPARTO (decisión del dueño, 13-ago: "Opción B") ─────────────────────────────
-- El ahorro se gana A MEDIDA que paga, no de golpe al final. Motivo: es como ya funciona todo lo
-- demás, y evita que quien pagó $500.000 de $639.000 y se cayó no reciba ni un peso.
-- Dentro del convenio: primero se cubre la DEUDA vieja (no genera ahorro), después las SEMANAS;
-- y dentro de las semanas, tarifa primero — el ahorro es el tramo final. Mismo criterio exacto
-- que usan las cajas en el motor, para que no haya dos reglas distintas conviviendo.

create or replace function public.convenio_acredita_ahorro()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_cv public.convenios;
  v_antes_del_pago numeric;
  v_tarifa_semanas numeric;
  v_antes numeric;
  v_despues numeric;
  v_gana numeric;
begin
  -- Solo cuando un pago ACABA de confirmarse y llevó plata al convenio.
  if tg_op <> 'UPDATE' and tg_op <> 'INSERT' then return new; end if;
  if new.estado <> 'Confirmado' then return new; end if;
  if tg_op = 'UPDATE' and old.estado = 'Confirmado' then return new; end if;
  if coalesce(new.aplicado_convenio, 0) <= 0 then return new; end if;

  select * into v_cv from public.convenios
   where contrato_id = new.contrato_id
     and estado in ('activo', 'cumplido')
   order by created_at desc limit 1;

  -- Convenio viejo (sin desglose guardado) → no se toca nada. Es el no-op de arriba.
  if v_cv.id is null or coalesce(v_cv.ahorro_semanas, 0) <= 0 then return new; end if;

  -- Cuánto se le había abonado al convenio ANTES de este pago.
  select coalesce(sum(aplicado_convenio), 0) into v_antes_del_pago
    from public.pagos
   where contrato_id = new.contrato_id and estado = 'Confirmado'
     and created_at >= v_cv.created_at and id <> new.id;

  -- Tramo que NO es ahorro: toda la deuda vieja + la parte de empresa de las semanas.
  v_tarifa_semanas := coalesce(v_cv.monto_deudas, 0)
                    + greatest(coalesce(v_cv.monto_semanas, 0) - v_cv.ahorro_semanas, 0);

  v_antes   := least(greatest(v_antes_del_pago - v_tarifa_semanas, 0), v_cv.ahorro_semanas);
  v_despues := least(greatest(v_antes_del_pago + new.aplicado_convenio - v_tarifa_semanas, 0), v_cv.ahorro_semanas);
  v_gana    := greatest(v_despues - v_antes, 0);

  if v_gana <= 0 then return new; end if;

  -- Se suma al ahorro del contrato y se deja anotado EN EL PAGO. Anotarlo en el pago no es
  -- cosmético: la reversa (rechazar/eliminar un pago) resta `aplicado_ahorro`, así que sin esto
  -- el ahorro subiría al pagar y no bajaría al anular.
  update public.pagos
     set aplicado_ahorro = coalesce(aplicado_ahorro, 0) + v_gana
   where id = new.id;

  update public.contratos
     set ahorro_acumulado = coalesce(ahorro_acumulado, 0) + v_gana
   where id = new.contrato_id;

  return new;
end; $$;

-- El UPDATE de arriba sobre `pagos` vuelve a disparar los triggers de la tabla, pero ambos salen
-- de una: el de reparto porque el estado no cambió, y este por la guarda `old.estado` de arriba.
drop trigger if exists trg_pago_convenio_ahorro on public.pagos;
create trigger trg_pago_convenio_ahorro
  after insert or update on public.pagos
  for each row execute function public.convenio_acredita_ahorro();
