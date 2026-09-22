-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 166 — EL SALDO A FAVOR NO PUEDE SER NEGATIVO (22-sep-2026)
--
-- La pregunta del dueño, textual: *"¿por qué siquiera debería existir la posibilidad de que haya
-- saldo a favor negativo si se supone que saldo a favor es porque es A FAVOR?"*. Tiene razón:
-- es un contrasentido, y hasta hoy el sistema lo permitía y además lo ESCONDÍA.
--
-- ── CÓMO SE DESTAPÓ ─────────────────────────────────────────────────────────────────────────
-- KEVIN ALEXIS LUNA CARDOZO (RLY45H). El 29-ago a las 16:29 se le aplicó el saldo TRES veces
-- seguidas: $195.000 (legítimo, lo dejó en 0), $120.000 y $75.000. Los dos últimos gastaron
-- $195.000 que ya no existían y su saldo quedó en **−$195.000** durante tres semanas, hasta que
-- un sobrante del 16-sep lo devolvió a 0 sin que nadie se enterara.
-- El dueño lo encontró mirando una pantalla, no porque el sistema avisara.
--
-- ── POR QUÉ NADIE LO VIO ────────────────────────────────────────────────────────────────────
-- El saldo NO es un dato guardado: es una suma que se recalcula al abrir la pantalla
-- (`cicloPago.ts`), y termina en `Math.max(suma, 0)`. Ese cero convertía −$195.000 en "$0".
-- El sistema estaba escrito para no mostrarlo nunca.
--
-- ── POR QUÉ EL CANDADO DE LA MIG 160 NO ALCANZABA ───────────────────────────────────────────
-- Es `before insert ... when (tipo_registro = 'saldo_favor')`: tapa UNA puerta de cuatro.
--   ✅ aplicar saldo que no hay        (160)
--   ❌ RECHAZAR un pago que había generado saldo ya gastado   → es un UPDATE
--   ❌ BORRAR ese pago                                        → es un DELETE
--   ❌ el motor re-reparte y el saldo baja
-- Las tres últimas nunca ocurrieron (verificado: en 2.938 pagos el único negativo fue KEVIN, por
-- la puerta 1), pero están abiertas.
--
-- ── EL CANDADO DE VERDAD ────────────────────────────────────────────────────────────────────
-- Un CONSTRAINT TRIGGER **DIFERIDO**: corre al CERRAR la operación completa, cuando el motor ya
-- terminó de repartir. Por eso no se confunde con un estado a medias — si a mitad de camino el
-- saldo pasa por negativo no importa; lo que se exige es el estado FINAL.
-- Si al final quedó en rojo, se deshace toda la operación.
--
-- 🔴 LO QUE VA A BLOQUEAR, Y ES A PROPÓSITO: rechazar o borrar un pago cuyo sobrante el cliente
-- ya gastó. Hoy eso pasa sin chistar y deja el hueco escondido. Desde ahora sale un mensaje que
-- dice qué hacer. No se puede des-recibir una plata que ya se gastó.
--
-- ⚠️ PARA UNA MIGRACIÓN MASIVA DE PAGOS: este disparador corre una vez por fila tocada. Si algún
-- día hay que mover miles, `alter table public.pagos disable trigger trg_saldo_favor_no_negativo`
-- antes y habilitarlo después — verificando al final que no quedó ningún contrato en rojo.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

-- ── 0) GUARDA: si hoy ya hay alguien en rojo, el candado lo dejaría trabado ──────────────────
-- Se verifica ANTES de ponerlo. Si existiera, primero hay que arreglarle la cuenta a esa persona.
do $$
declare v_malos int; v_quien text;
begin
  select count(*), string_agg(x.placa || ' (' || x.nombre || '): ' || x.saldo, ', ')
    into v_malos, v_quien
  from (
    select coalesce(m.placa, '—') as placa, cl.nombre,
           (coalesce(c.saldo_favor_apertura, 0)
            + coalesce((select sum(p.aplicado_saldo_favor) from public.pagos p
                         where p.contrato_id = c.id and p.estado = 'Confirmado'), 0)) as saldo
      from public.contratos c
      join public.clientes cl on cl.id = c.cliente_id
      left join public.motos m on m.id = c.moto_id
  ) x
  where x.saldo < -1;

  if v_malos > 0 then
    raise exception 'ABORTA: hay % contrato(s) con saldo a favor en rojo HOY. Hay que arreglarles la cuenta antes de poner el candado, o quedan trabados. Son: %', v_malos, v_quien;
  end if;
end $$;

-- ── 1) La cuenta del saldo, en UNA sola función ─────────────────────────────────────────────
-- Misma fórmula que `cicloPago.ts` (apertura + suma de movimientos), pero SIN el `Math.max(0)`:
-- acá justamente interesa ver el negativo. Si algún día se toca una, hay que tocar la otra.
create or replace function public.saldo_favor_actual(p_contrato uuid)
returns numeric language sql stable as $$
  select coalesce(c.saldo_favor_apertura, 0)
       + coalesce((select sum(p.aplicado_saldo_favor) from public.pagos p
                    where p.contrato_id = p_contrato and p.estado = 'Confirmado'), 0)
    from public.contratos c where c.id = p_contrato;
$$;

comment on function public.saldo_favor_actual(uuid) is
  'El saldo a favor REAL de un contrato: apertura + todos los movimientos confirmados. Sin piso en cero — a diferencia de la pantalla, acá el negativo se ve, que es de lo que se trata.';

-- ── 2) El candado ───────────────────────────────────────────────────────────────────────────
create or replace function public.exigir_saldo_favor_no_negativo()
returns trigger language plpgsql as $$
declare
  v_contrato uuid;
  v_saldo    numeric;
  v_quien    text;
begin
  v_contrato := coalesce(new.contrato_id, old.contrato_id);
  if v_contrato is null then return null; end if;

  v_saldo := public.saldo_favor_actual(v_contrato);

  -- Tolerancia de $1: los montos son pesos enteros, así que un rojo de verdad son miles.
  if v_saldo < -1 then
    select coalesce(m.placa, 'sin placa') || ' · ' || cl.nombre into v_quien
      from public.contratos c
      join public.clientes cl on cl.id = c.cliente_id
      left join public.motos m on m.id = c.moto_id
     where c.id = v_contrato;

    raise exception
      'SALDO A FAVOR EN ROJO (%). Esta operación dejaría su saldo en $%, y un saldo A FAVOR no puede ser negativo. Pasa cuando se rechaza o se borra un pago cuyo sobrante el cliente YA GASTÓ. Qué hacer: primero deshacer lo que se hizo con ese sobrante (el movimiento de "aplicar saldo a favor"), y recién ahí rechazar o borrar el pago.',
      v_quien, to_char(v_saldo, 'FM999,999,999');
  end if;
  return null;
end $$;

drop trigger if exists trg_saldo_favor_no_negativo on public.pagos;
create constraint trigger trg_saldo_favor_no_negativo
  after insert or update or delete on public.pagos
  deferrable initially deferred
  for each row
  execute function public.exigir_saldo_favor_no_negativo();

-- El de la mig 160 se DEJA: avisa antes, en el momento de aplicar, con un mensaje más preciso
-- ("no tiene saldo suficiente"). Este otro es la red que atrapa lo que aquel no ve.

-- ── 3) El aviso de coherencia, arreglado ────────────────────────────────────────────────────
-- La mig 165 lo dejó mirando `c.saldo_favor_apertura`, que en KEVIN vale 0: el rojo vivía en la
-- SUMA de los movimientos, no en ese campo. O sea que el aviso que construí para cazar esto
-- justamente no lo cazaba.
--
-- Se reemplaza SOLO dentro de esa rama (se recorta por su clave `'saldo_neg:'` y se vuelve a
-- pegar), para no tocar ninguna de las otras 22. Un solo `replace` arregla las tres menciones:
-- la condición, el texto y el monto.
do $mig$
declare
  v_def  text;
  v_pre  text;
  v_rama text;
  v_expr text;
  v_i    int;
  v_ini  int;
  v_fin  int;
  v_end  int;
begin
  v_def := pg_get_viewdef('public.pendientes'::regclass);

  if position('saldo_favor_actual' in v_def) > 0 then
    raise notice '166: el aviso ya estaba arreglado. No se tocó.';
    return;
  end if;

  v_i := position('''saldo_neg:''' in v_def);
  if v_i = 0 then
    raise exception '166 ABORTADA: no se encontró la rama `saldo_neg:` en la vista. ¿Se corrió la mig 165?';
  end if;

  -- Inicio de la rama: el UNION ALL que la precede (se busca hacia atrás).
  v_pre := left(v_def, v_i - 1);
  v_ini := length(v_pre) - position(reverse('UNION ALL') in reverse(v_pre)) - length('UNION ALL') + 2;
  if v_ini < 1 then
    raise exception '166 ABORTADA: no se encontró el UNION ALL que abre la rama.';
  end if;

  -- Fin de la rama: el siguiente UNION ALL (o el final de la vista).
  v_fin := position('UNION ALL' in substr(v_def, v_i));
  v_end := case when v_fin = 0 then length(v_def) + 1 else v_i + v_fin - 1 end;

  v_rama := substr(v_def, v_ini, v_end - v_ini);
  if position('saldo_favor_apertura' in v_rama) = 0 then
    raise exception '166 ABORTADA: la rama recortada no menciona saldo_favor_apertura. Recorte mal hecho, no se tocó nada. La rama dice: %', left(v_rama, 400);
  end if;

  v_expr := '(public.saldo_favor_actual(c.id))';
  v_rama := replace(v_rama, 'c.saldo_favor_apertura', v_expr);

  v_def := left(v_def, v_ini - 1) || v_rama || substr(v_def, v_end);
  v_def := rtrim(v_def);
  if right(v_def, 1) = ';' then v_def := left(v_def, length(v_def) - 1); end if;

  execute 'create or replace view public.pendientes with (security_invoker = true) as ' || v_def;
  raise notice '166: el aviso de saldo en rojo ahora mira la SUMA, no el campo suelto.';
end
$mig$;

commit;

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
select
  -- La función, contra el caso conocido
  (select public.saldo_favor_actual(c.id) from public.contratos c
     join public.motos m on m.id = c.moto_id where m.placa = 'RLY45H'
    order by c.created_at desc limit 1)                                   as kevin_saldo_hoy,
  -- El candado tiene que estar, y diferido
  (select count(*) from pg_trigger
    where tgname = 'trg_saldo_favor_no_negativo' and tgdeferrable)        as candado_puesto,
  -- El aviso tiene que mirar la suma
  (select case when position('saldo_favor_actual' in
            pg_get_viewdef('public.pendientes'::regclass)) > 0
          then 1 else 0 end)                                              as aviso_arreglado,
  -- Y la vista tiene que seguir sana
  (select count(*) from public.pendientes)                                as total_avisos,
  (select count(*) from (select clave from public.pendientes
                          group by clave having count(*) > 1) d)          as claves_duplicadas,
  (select count(*) from public.pendientes where tipo = 'saldo_negativo')  as en_rojo_hoy;
-- Esperado: kevin_saldo_hoy = 0 · candado_puesto = 1 · aviso_arreglado = 1 ·
--           claves_duplicadas = 0 · en_rojo_hoy = 0 · total_avisos ≈ 404
