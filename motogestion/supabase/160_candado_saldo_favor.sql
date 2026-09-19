-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 160 — EL SALDO A FAVOR NO SE PUEDE APLICAR DOS VECES (19-sep-2026)
--
-- EL CASO — YERLIS ELENA QUINTERO (XZN23H). El 18-sep, a las 22:06:15 y a las 22:06:20 —cinco
-- segundos de diferencia— se aplicó DOS VECES el mismo saldo a favor de $202.000. Solo había uno
-- (entró el 18-jul), así que su saldo quedó en **−$202.000** y una semana entera se dio por pagada
-- con plata que no existe. Su contrato está Suspendido y la moto Recuperada: esa semana de regalo
-- la hacía ver más cerca de recuperarla de lo que estaba.
--
-- POR QUÉ NO LO ATAJÓ EL CANDADO QUE YA HABÍA. El botón tiene guarda anti-doble-clic, pero vive
-- DENTRO de la pantalla de cada persona: impide que vos le des dos veces, no sabe nada del otro
-- celular. Palabras del dueño: *"dos personas le dieron en aplicar casi al mismo tiempo… eso es de
-- lo que hablábamos, que no se actualizaban las cosas enseguida"*. Las dos pantallas mostraban
-- $202.000 disponibles porque ninguna alcanzó a enterarse de la otra. Cada guarda hizo bien su
-- trabajo y aun así pasó.
--
-- Es el mismo caso de los convenios repetidos de XZN22H (mig 050), y la solución es la misma:
-- 🔴 EL CANDADO DE VERDAD VA EN LA BASE, donde los dos clics pasan por la misma puerta.
--
-- 🔑 POR QUÉ EN EL INSERT Y NO DESPUÉS. `aplicarSaldoFavor` trabaja en dos tiempos: crea el
-- movimiento (el motor lo reparte y AHÍ ya llenó la semana) y después le descuenta el saldo. Un
-- candado en el segundo tiempo llegaría TARDE: la semana ya estaría regalada y solo fallaría el
-- descuento — quedaría peor que sin candado. Por eso se valida al CREAR, antes de que el motor
-- toque nada.
--
-- 🔑 POR QUÉ SE CUENTAN LOS MOVIMIENTOS "EN VUELO". Entre que el movimiento se crea y que se le
-- cierra su cuenta pasan unos segundos en los que su `aplicado_saldo_favor` todavía es 0 (o el
-- excedente que devolvió el motor, positivo). Esos segundos son EXACTAMENTE donde se coló el de
-- YERLIS. Así que un movimiento de saldo sin cerrar se cuenta por su `valor`, no por su aplicado.
--
-- LO QUE NO SE TOCA: el reparto, el orden de aplicación y el cálculo del saldo quedan idénticos.
-- Esto solo agrega una puerta antes de entrar. El flujo legítimo pasa con margen cero: la segunda
-- mitad de una aplicación pide exactamente lo que le quedó disponible de la primera.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

create or replace function public.enforce_saldo_favor_disponible()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_disponible numeric;
begin
  if new.tipo_registro is distinct from 'saldo_favor' then return new; end if;
  if new.contrato_id is null or coalesce(new.valor, 0) <= 0 then return new; end if;
  if new.estado is distinct from 'Confirmado' then return new; end if;

  -- TRABA el contrato: dos clics simultáneos pasan uno detrás del otro, nunca a la vez.
  perform 1 from public.contratos where id = new.contrato_id for update;

  select coalesce(c.saldo_favor_apertura, 0)
       -- Lo que los pagos dejaron a favor (y lo que ya se consumió, que viene en negativo).
       -- Se excluyen los movimientos de saldo SIN CERRAR: esos se cuentan abajo por su valor.
       + coalesce((
           select sum(p.aplicado_saldo_favor) from public.pagos p
            where p.contrato_id = new.contrato_id and p.estado = 'Confirmado'
              and not (p.tipo_registro = 'saldo_favor'
                       and coalesce(p.aplicado_saldo_favor, 0) >= 0)
         ), 0)
       -- Los "en vuelo": creados hace segundos, todavía sin su cuenta cerrada. Consumen su valor.
       - coalesce((
           select sum(p.valor) from public.pagos p
            where p.contrato_id = new.contrato_id and p.estado = 'Confirmado'
              and p.tipo_registro = 'saldo_favor'
              and coalesce(p.aplicado_saldo_favor, 0) >= 0
         ), 0)
    into v_disponible
  from public.contratos c
  where c.id = new.contrato_id;

  if coalesce(v_disponible, 0) < new.valor then
    raise exception
      'Ese saldo a favor ya se aplicó: solo quedan $% disponibles y se intentó aplicar $%. '
      'Refresca la pantalla para ver el saldo real.',
      replace(to_char(greatest(coalesce(v_disponible, 0), 0), 'FM999,999,999'), ',', '.'),
      replace(to_char(new.valor, 'FM999,999,999'), ',', '.');
  end if;

  return new;
end;
$$;

drop trigger if exists trg_saldo_favor_disponible on public.pagos;
create trigger trg_saldo_favor_disponible
  before insert on public.pagos
  for each row
  when (new.tipo_registro = 'saldo_favor')
  execute function public.enforce_saldo_favor_disponible();

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
-- 1) El candado existe.
select count(*) as candado_puesto
from pg_trigger
where tgrelid = 'public.pagos'::regclass and tgname = 'trg_saldo_favor_disponible';

-- 2) Quién tiene HOY el saldo a favor en negativo (el daño ya hecho, que se corrige aparte).
select m.placa, cl.nombre,
       coalesce(c.saldo_favor_apertura, 0)
     + coalesce((select sum(p.aplicado_saldo_favor) from public.pagos p
                  where p.contrato_id = c.id and p.estado = 'Confirmado'), 0) as saldo_hoy
from public.contratos c
join public.clientes cl on cl.id = c.cliente_id
left join public.motos m on m.id = c.moto_id
where coalesce(c.saldo_favor_apertura, 0)
    + coalesce((select sum(p.aplicado_saldo_favor) from public.pagos p
                 where p.contrato_id = c.id and p.estado = 'Confirmado'), 0) < 0;
