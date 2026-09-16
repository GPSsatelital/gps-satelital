-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 156 — EL EXCEDENTE DE LA BASE PASA A SALDO A FAVOR (16-sep-2026)
--
-- Regla del dueño, cerrada después de un intento fallido:
--   *"ni la base ni el ahorro se pueden usar para nada según lo ya establecido; lo único que se
--    puede usar son los saldos a favor que el cliente dé de más, y en los casos que dan más de lo
--    que debían haber dado en la base inicial y les queda ahí"*.
--
-- O sea: la base ($308.000, $305.000 en los viejos) y el ahorro NO se tocan. Lo único movible es
-- el EXCEDENTE = lo que entregó POR ENCIMA de lo exigido ($308.000 + el período adelantado).
-- Casos reales: INGRID URBINA (XZN82H) dio $900.000 → excedente $390.000 · PEDRO FLOREZ (IEW90I)
-- dio $560.000 → excedente $50.000.
--
-- 🔴 EL EXCEDENTE SE CALCULA DESDE LO QUE ENTREGÓ (`ahorro_inicial`), NUNCA DESDE `ahorro_apertura`.
-- En los migrados la apertura trae la mezcla del arqueo y no reconcilia: a PEDRO le figuran $66.000
-- de apertura —menos que los $308.000 sagrados— aunque entregó $560.000. Calcularlo desde ahí le
-- daría negativo a él y una cifra equivocada a INGRID. Es el mismo error que ya se cometió una vez
-- y que el dueño atajó con *"¿no estás confundiendo ahorros normales con ahorros de base inicial?"*.
--
-- ADÓNDE VA: a `contratos.saldo_favor_apertura`, que es de donde `saldoAFavorDe()` ya lee. Así se
-- aplica con las reglas de saldo a favor que YA existen y están probadas — no se le inventa a la
-- plata un camino nuevo.
--
-- EL RASTRO (pedido textual: *"todo debe quedar rastreado y debidamente especificado y separado
-- para que el sistema siempre sepa de dónde sale todo"*): cada traslado deja su fila en
-- `abonos_base` con tipo propio, más su renglón en `contratos_auditoria`.
--
-- 🔴 LA CAJA NO LO CUENTA. No entró ni salió un peso de la gaveta: la plata ya estaba adentro y
-- solo cambió de bolsillo. Mismo trato que `retencion` (mig 092) — si sumara, la caja del día
-- diría que entró plata que nunca llegó.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

alter table public.abonos_base drop constraint if exists abonos_base_tipo_check;
alter table public.abonos_base add constraint abonos_base_tipo_check
  check (tipo in ('abono', 'devolucion', 'retencion', 'traslado_saldo'));

comment on column public.abonos_base.tipo is
  'abono = entro plata · devolucion = salio al cliente · retencion = se queda la empresa '
  '(el pago del visitador) · traslado_saldo = el EXCEDENTE de la base pasa a saldo a favor del '
  'mismo cliente (mig 156). Los dos ultimos NO mueven la caja: la plata ya estaba adentro.';

-- ─── EL PERMISO ──────────────────────────────────────────────────────────────────────────────
-- Espejo SQL de `mover_excedente_base`. Parche ANCLADO sobre la función VIVA, nunca copiando de un
-- archivo viejo (lección de la mig 124). Default: SECRETARIA + ADMIN + ADMIN_PRINCIPAL — la misma
-- gente que recibe la base y que ya aplica el saldo a favor.
do $mig$
declare
  v_def text; v_veces int;
  c_admins     constant text := '''ceder_contrato'',''entregar_premio'',''asignar_tarea'',''rodar_tiempo'']';
  c_secretaria constant text := '''entregar_premio'',''iniciar_liquidacion'',''rodar_tiempo'']';
begin
  select pg_get_functiondef(p.oid) into v_def
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = '_acciones_default';
  if v_def is null then raise exception 'No existe public._acciones_default().'; end if;
  if position('mover_excedente_base' in v_def) > 0 then
    raise notice 'NADA QUE HACER: ya tiene mover_excedente_base.'; return;
  end if;

  v_veces := (length(v_def) - length(replace(v_def, c_admins, ''))) / length(c_admins);
  if v_veces <> 2 then raise exception 'Ancla ADMIN/AP encontrada % veces, se esperaban 2.', v_veces; end if;
  v_def := replace(v_def, c_admins, '''ceder_contrato'',''entregar_premio'',''asignar_tarea'',''rodar_tiempo'',''mover_excedente_base'']');

  v_veces := (length(v_def) - length(replace(v_def, c_secretaria, ''))) / length(c_secretaria);
  if v_veces <> 1 then raise exception 'Ancla SECRETARIA encontrada % veces, se esperaba 1.', v_veces; end if;
  v_def := replace(v_def, c_secretaria, '''entregar_premio'',''iniciar_liquidacion'',''rodar_tiempo'',''mover_excedente_base'']');

  execute v_def;
  raise notice 'LISTO: mover_excedente_base en AP, ADMIN y SECRETARIA.';
end
$mig$;

-- ─── VERIFICACIÓN — debe dar 1 ───────────────────────────────────────────────────────────────
select
  (select count(*) from pg_constraint
    where conname = 'abonos_base_tipo_check'
      and pg_get_constraintdef(oid) like '%traslado_saldo%')            as check_acepta_traslado,
  'mover_excedente_base' = any(public._acciones_default('SECRETARIA'))  as secretaria_puede,
  'mover_excedente_base' = any(public._acciones_default('SUBADMIN'))    as subadmin_no_debe;
-- check_acepta_traslado = 1 · secretaria_puede = true · subadmin_no_debe = false
