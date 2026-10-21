-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 199 — DQG94I: LA SEMANA ADELANTADA DE LA BASE QUEDÓ DOS VECES (21-oct-2026, dueño: «1 sí»)
--
-- QUÉ PASÓ: el 29-sep (antes de la mig 193, que hizo la entrega de un solo golpe) la entrega de
-- VIVIANA PATRICIA GOMEZ GUTIERREZ (COSTA) se guardó dos veces: dos pagos internos 'adelanto_base'
-- de $202.000, a las 21:29:13 y 21:30:59 UTC. Ella pagó la base una sola vez: $202.000 de base + el
-- acuerdo de base incompleta por $308.000 = $510.000. La copia llenó la semana 2 sin plata, y su
-- pago real del 12-oct ($232.000) encontró la semana 2 ya llena: $30.000 al acuerdo y $202.000 a
-- saldo a favor. Medido el 21-oct: es el único de 175 contratos con dos semanas adelantadas, y
-- desde la mig 193 repetir la entrega ya no duplica.
--
-- QUÉ HACE (deja todo como si la copia nunca hubiera existido):
--   1. Borra la copia SIN que el motor devuelva semanas. La devolución (trg_pago_confirmado_del) se
--      apaga solo dentro de esta transacción y se vuelve a prender antes de terminar. Prendida,
--      quitaría $202.000 de las semanas 3 y 2, que hoy están BIEN.
--   2. Al pago del 12-oct le pone el reparto que le tocaba: semana $202.000 (con sus $26.000 de
--      ahorro adentro), acuerdo $30.000 (igual que antes), saldo a favor $0. Es lo que da
--      repartirPagoV2 con una sola semana adelantada (medido el 21-oct).
--   3. La anotación de la semana 2 (cajas_llenadas, la que lee la nómina) pasa del 29-sep al día en
--      que se registró el pago real (13-oct).
--   4. Deja el rastro en el historial del contrato, a nombre del dueño.
-- NO SE MUEVE: semanas pagadas (2), lo de la semana 3 ($200.000), ahorro ($98.000), el acuerdo y lo
-- que debe hoy. Ya estaban bien: la copia tapó la semana 2 y la plata real quedó a un lado.
-- SÍ CAMBIA: su saldo a favor ($202.000 → $0) y en su libro la semana 2 sale pagada el 12-oct.
--
-- Las otras revisiones que se disparan, leídas de la base viva el 21-oct: pagos_en_fila (solo pone
-- el contrato en fila), sumar_pago_de_base y convenio_amortiza_deudas (solo actúan si cambia lo del
-- acuerdo: aquí no cambia), enforce_eliminar_pago (pide permiso: se corre a nombre del dueño) y
-- exigir_saldo_favor_no_negativo (el saldo queda en $0, no negativo).
--
-- Si algo no está como se midió el 21-oct (p. ej. alguien ya le aplicó el saldo a favor), no cambia
-- nada y lo dice.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

set local lock_timeout = '5s';   -- si la base está ocupada, se cancela sola en vez de hacer fila

do $correccion$
declare
  v_dueno constant uuid := 'a68f065b-3a59-4c67-bd2e-45c6abc30fdb';
  v_c     constant uuid := '791d3f20-9687-4220-aaa7-defffe9a5bd3';   -- contrato de DQG94I
  v_copia constant uuid := '5665dae8-44ae-494d-a0bb-56363a176d49';   -- la semana adelantada repetida
  v_orig  constant uuid := '78dedbc0-723a-469c-992e-cc55bc4fd699';   -- la semana adelantada que vale
  v_p12   constant uuid := '94e85d93-c79d-4dab-a829-393e1e45b56c';   -- el pago del 12-oct
  v_anot  constant uuid := '874c4212-7c36-4b52-9c70-f1011b563089';   -- la anotación de la semana 2
  k  public.contratos;  k2 public.contratos;
  p  public.pagos;      p12 public.pagos;
  a  public.cajas_llenadas;
  v_saldo numeric; v_usos int; v_adel int; v_tarifa numeric; v_ahorro numeric;
begin
  -- Se corre a nombre del dueño: el permiso de borrar pagos y el rastro lo necesitan.
  perform set_config('request.jwt.claim.sub', v_dueno::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_dueno, 'role', 'authenticated')::text, true);

  -- ── Foto del antes: tiene que estar exactamente como se midió el 21-oct ──
  select * into k   from public.contratos      where id = v_c;
  select * into p   from public.pagos          where id = v_copia;
  select * into p12 from public.pagos          where id = v_p12;
  select * into a   from public.cajas_llenadas where id = v_anot;
  select count(*) into v_usos from public.pagos where contrato_id = v_c and tipo_registro = 'saldo_favor';
  v_saldo := public.saldo_favor_actual(v_c);
  raise notice 'DQG94I antes: semanas % + $% · ahorro $% · saldo a favor $% · saldo usado % veces',
    k.cajas_pagadas, k.caja_actual_pagado, k.ahorro_acumulado, v_saldo, v_usos;

  if k.cajas_pagadas is distinct from 2 or k.caja_actual_pagado is distinct from 200000
     or k.ahorro_acumulado is distinct from 98000
     or p.id is null or p.tipo_registro is distinct from 'adelanto_base' or p.valor is distinct from 202000
     or p.estado is distinct from 'Confirmado' or p.aplicado_tarifa is distinct from 202000
     or p.aplicado_ahorro is distinct from 26000 or coalesce(p.aplicado_convenio, 0) <> 0
     or not exists (select 1 from public.pagos where id = v_orig and tipo_registro = 'adelanto_base' and estado = 'Confirmado')
     or p12.aplicado_saldo_favor is distinct from 202000 or coalesce(p12.aplicado_tarifa, 0) <> 0
     or coalesce(p12.aplicado_ahorro, 0) <> 0 or p12.aplicado_convenio is distinct from 30000
     or v_usos <> 0 or v_saldo is distinct from 202000
     or a.id is null or a.caja_numero is distinct from 2 or a.fecha is distinct from date '2026-09-29' then
    raise exception 'DQG94I ya no está como se midió el 21-oct (semanas %, semana actual $%, ahorro $%, saldo a favor $%, saldo usado % veces). No se cambió nada: hay que volver a medir.',
      k.cajas_pagadas, k.caja_actual_pagado, k.ahorro_acumulado, v_saldo, v_usos;
  end if;

  -- 1) Borrar la copia sin devolución de semanas. Las revisiones diferidas corren al momento
  --    (si quedaran pendientes, Postgres no deja volver a prender el disparador).
  set constraints all immediate;
  alter table public.pagos disable trigger trg_pago_confirmado_del;
  delete from public.pagos where id = v_copia;
  alter table public.pagos enable trigger trg_pago_confirmado_del;

  -- 2) El pago del 12-oct con el reparto que le tocaba (estas columnas no disparan el motor)
  update public.pagos
     set aplicado_tarifa = 202000, aplicado_ahorro = 26000, aplicado_saldo_favor = 0
   where id = v_p12;

  -- 3) La semana 2 se llenó el día que se registró el pago real
  update public.cajas_llenadas
     set fecha = (p12.created_at at time zone 'America/Bogota')::date, created_at = p12.created_at
   where id = v_anot;

  -- 4) El rastro (sin empezar por «exoneradas N»: ese formato lo lee la nómina)
  insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por) values
    (v_c, 'Corrección: semana adelantada repetida',
     'Dos semanas adelantadas de la base de $202.000 (29-sep, 21:29 y 21:30 UTC). El pago del 12-oct quedó $202.000 a saldo a favor y $30.000 al acuerdo.',
     'Se borró la copia (mig 199). El pago del 12-oct paga la semana 2 ($202.000, con $26.000 de ahorro) y $30.000 al acuerdo; saldo a favor $0. Semanas, ahorro y lo que debe no cambian.',
     v_dueno);

  -- ── Foto del después ──
  select * into k2 from public.contratos where id = v_c;
  select count(*) into v_adel from public.pagos
   where contrato_id = v_c and tipo_registro = 'adelanto_base' and estado = 'Confirmado';
  select coalesce(sum(aplicado_tarifa), 0), coalesce(sum(aplicado_ahorro), 0) into v_tarifa, v_ahorro
    from public.pagos where contrato_id = v_c and estado = 'Confirmado';
  v_saldo := public.saldo_favor_actual(v_c);
  raise notice 'DQG94I después: semanas % + $% · ahorro $% · saldo a favor $% · semanas adelantadas % · plata en semanas $% · ahorro de los pagos $%',
    k2.cajas_pagadas, k2.caja_actual_pagado, k2.ahorro_acumulado, v_saldo, v_adel, v_tarifa, v_ahorro;

  if k2.cajas_pagadas is distinct from 2 or k2.caja_actual_pagado is distinct from 200000
     or k2.ahorro_acumulado is distinct from 98000 or v_saldo is distinct from 0 or v_adel <> 1
     or v_tarifa <> k2.cajas_pagadas * 202000 + k2.caja_actual_pagado
     or v_ahorro <> k2.ahorro_acumulado
     or not exists (select 1 from pg_trigger where tgname = 'trg_pago_confirmado_del'
                     and tgrelid = 'public.pagos'::regclass and tgenabled = 'O') then
    raise exception 'La corrección no dio lo esperado (semanas %, semana actual $%, ahorro $%, saldo a favor $%, semanas adelantadas %). No se cambió nada.',
      k2.cajas_pagadas, k2.caja_actual_pagado, k2.ahorro_acumulado, v_saldo, v_adel;
  end if;
end
$correccion$;

select public.registrar_migracion(199, '199_dqg94i_semana_adelantada_repetida.sql',
  'DQG94I: se borró la semana adelantada de la base repetida y el pago del 12-oct pasó de saldo a favor a la semana 2');

commit;

-- ─── VERIFICACIÓN — debe dar una fila con: 2 · 200000 · 98000 · 0 · 1 · 202000 · 2026-10-13 · O ──
select c.cajas_pagadas, c.caja_actual_pagado, c.ahorro_acumulado,
       public.saldo_favor_actual(c.id) as saldo_a_favor,
       (select count(*) from public.pagos where contrato_id = c.id and tipo_registro = 'adelanto_base') as semanas_adelantadas,
       (select aplicado_tarifa from public.pagos where id = '94e85d93-c79d-4dab-a829-393e1e45b56c') as pago_12oct_a_semana,
       (select fecha from public.cajas_llenadas where id = '874c4212-7c36-4b52-9c70-f1011b563089') as semana2_llenada,
       (select tgenabled from pg_trigger where tgname = 'trg_pago_confirmado_del' and tgrelid = 'public.pagos'::regclass) as devolucion_prendida
  from public.contratos c
 where c.id = '791d3f20-9687-4220-aaa7-defffe9a5bd3';
