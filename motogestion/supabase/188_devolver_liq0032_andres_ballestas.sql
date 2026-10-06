-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 188 — DEVOLVER LA LIQUIDACIÓN LIQ-0032 DE ANDRÉS BALLESTAS (RLZ85H) AL PASO DE LA REVISIÓN
--       (6-oct-2026, dueño: "devolver una liquidación que la hicieron mal", "los ahorros ni las
--        deudas se le validaron bien", "Sí, devuélvela ya")
--
-- LO QUE SE ENCONTRÓ (medido hoy):
--   · LIQ-0032, motivo incumplimiento, cerrada el 14-sep y firmada en pantalla hoy. Dice: daños $35.000
--     (retrovisores), ahorro $0, deudas $0 → debe $35.000. Por eso quedó Retirado y en lista negra.
--   · Está mal hecha por dos lados:
--       - La BASE no se contó: entró con COSTA el 25-jul con el empalme abierto y su "ahorro inicial"
--         en $0 (base sin confirmar). La base de la ficha es $500.000.
--       - Las SEMANAS no se cobraron: no pagó nada desde el 27-jul y la cuenta no cobró ni un día.
--     Con la cuenta de hoy, base $500.000 y la moto recogida el 1-sep, debería $627.000, no $35.000.
--   · La moto RLZ85H ya es de SILFREDO PEDROZA ARDILA desde el 29-sep (contrato activo). NO se toca.
--
-- QUÉ HIZO EL CIERRE (cerrar_liquidacion, mig 115) Y QUÉ SE DESHACE — línea por línea:
--   1. liquidación → 'cerrada'                         → vuelve a 'en_taller' (paso de la revisión)
--   2. contrato → 'Cancelado'                           → vuelve a 'Suspendido' (mora), como los otros
--                                                         10 clientes que están en liquidación
--   3. deudas pendientes → pagadas                      → no aplicó (no tenía ninguna)
--   4. convenios → cumplidos                            → no aplicó (no tenía)
--   5. ahorro_acumulado y ahorro_apertura → 0           → no aplicó (ya estaban en 0)
--   6. deuda del faltante ($35.000)                      → se borra (el borrado deja su rastro solo, mig 101)
--   7. moto → 'Disponible'                              → NO se toca: ya la tiene SILFREDO
--   8. cliente → 'Retirado'                              → vuelve a 'Activo', como los otros en liquidación
--   9. lista negra                                       → se quita
--   Además:
--   · La firma de hoy se descarta (firmó cifras malas). Los archivos quedan en el almacenamiento y
--     sus direcciones quedan escritas en el historial del contrato.
--   · Se para el contador de semanas el 29-sep, el día que la moto pasó a SILFREDO (la regla de la
--     mig 129, que no le aplicó porque el contrato estaba cerrado ese día). Sin esto, Cartera y
--     Reportes le seguirían sumando semanas hasta hoy. La liquidación se cobra con su propia fecha
--     (el día en que se recogió la moto), que es anterior.
--   No toca: pagos (no tiene), la moto, el contrato de SILFREDO, ni la orden de taller (sigue abierta,
--   que es lo que pide el paso de la revisión).
--
-- DESPUÉS, EN LA APP (oficina): cargar su base, su ahorro y sus deudas reales; en Liquidaciones →
--   LIQ-0032 registrar la revisión con el DÍA EN QUE SE RECOGIÓ LA MOTO, calcular, generar el
--   documento, firmar y cerrar.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   (volver a dejarla cerrada como estaba; las direcciones de la firma están en contratos_auditoria)
--   select set_config('app.cierre_liquidacion','1',true);
--   update liquidaciones set estado='cerrada', cerrada_por='b704a193-e2f8-4cdb-b6de-460e9c3d0a70',
--     fecha_firma='2026-10-06 15:28:56.797+00' where id='7298301e-f2f9-45f4-9aef-d221b29dc7d3';
--   update contratos set estado='Cancelado', motivo_suspension=null, fecha_fin_cobro=null,
--     motivo_fin_cobro=null where id='ab4ecdec-9e43-457e-bc98-6629c47898d8';
--   insert into deudas (contrato_id, concepto, descripcion, monto, monto_pendiente, estado)
--     values ('ab4ecdec-9e43-457e-bc98-6629c47898d8','otro','Saldo pendiente de la liquidación LIQ-0032',35000,35000,'pendiente');
--   update clientes set estado='Retirado', lista_negra=true,
--     motivo_lista_negra='Liquidación LIQ-0032: saldo pendiente $35.000' where id='670812e0-b641-4d54-9e99-4f83fcc52d68';
-- ═══════════════════════════════════════════════════════════════════════════════════════════

select public.tomar_foto_plata('antes-188') as contratos_fotografiados;

begin;

do $fix$
declare
  v_liq      constant uuid := '7298301e-f2f9-45f4-9aef-d221b29dc7d3';
  v_contrato constant uuid := 'ab4ecdec-9e43-457e-bc98-6629c47898d8';
  v_cliente  constant uuid := '670812e0-b641-4d54-9e99-4f83fcc52d68';
  v_moto     constant uuid := 'f937892d-7fd6-4573-b7a9-591a268734d4';
  v_deuda    constant uuid := 'c88ac904-6e10-4db6-8bf6-703d9027ef7a';
  v_silfredo constant uuid := '12b7a8cc-9619-4b2e-be41-753f9baedc13';
  v_dueno    constant uuid := 'a68f065b-3a59-4c67-bd2e-45c6abc30fdb';
  v_l        public.liquidaciones;
  n int;
begin
  -- El guardián de estados del cliente deja pasar con la misma señal que usa el cierre (mig 111).
  perform set_config('app.cierre_liquidacion', '1', true);

  -- ── Que todo esté como se midió. Si no, PARAR sin tocar nada. ──────────────────────────────
  select * into v_l from public.liquidaciones where id = v_liq for update;
  if v_l.id is null or v_l.numero <> 'LIQ-0032' or v_l.estado <> 'cerrada' or v_l.contrato_id <> v_contrato
     or v_l.saldo_final <> -35000 or v_l.motivo <> 'incumplimiento' then
    raise exception '188 ABORTADA: LIQ-0032 no está como se midió (estado %, saldo %). NO se tocó nada.', v_l.estado, v_l.saldo_final;
  end if;

  select count(*) into n from public.contratos
   where id = v_contrato and cliente_id = v_cliente and moto_id = v_moto and estado = 'Cancelado' and fecha_fin_cobro is null;
  if n <> 1 then raise exception '188 ABORTADA: el contrato de ANDRÉS no está Cancelado sobre RLZ85H. NO se tocó nada.'; end if;

  select count(*) into n from public.deudas where contrato_id = v_contrato;
  if n <> 1 then raise exception '188 ABORTADA: el contrato tiene % deudas (se esperaba solo la del cierre). NO se tocó nada.', n; end if;
  select count(*) into n from public.deudas
   where id = v_deuda and monto = 35000 and monto_pendiente = 35000 and estado = 'pendiente'
     and descripcion = 'Saldo pendiente de la liquidación LIQ-0032';
  if n <> 1 then raise exception '188 ABORTADA: la deuda del cierre no está como se midió. NO se tocó nada.'; end if;

  select count(*) into n from public.convenios where contrato_id = v_contrato;
  if n <> 0 then raise exception '188 ABORTADA: el contrato tiene convenios. NO se tocó nada.'; end if;

  select count(*) into n from public.pagos where contrato_id = v_contrato;
  if n <> 0 then raise exception '188 ABORTADA: el contrato tiene % pagos (se esperaban 0). NO se tocó nada.', n; end if;

  select count(*) into n from public.clientes where id = v_cliente and estado = 'Retirado' and lista_negra = true;
  if n <> 1 then raise exception '188 ABORTADA: ANDRÉS no está Retirado y en lista negra. NO se tocó nada.'; end if;

  select count(*) into n from public.contratos
   where moto_id = v_moto and estado = 'Activo' and id = v_silfredo and fecha_entrega = '2026-09-29';
  if n <> 1 then raise exception '188 ABORTADA: RLZ85H no está con el contrato activo de SILFREDO desde el 29-sep. NO se tocó nada.'; end if;

  -- ── 1. La liquidación vuelve al paso de la revisión, sin la firma de cifras malas ───────────
  update public.liquidaciones
     set estado = 'en_taller', cerrada_por = null, fecha_firma = null,
         firma_cliente_url = null, huella_cliente_url = null, documento_firmado_url = null
   where id = v_liq;

  -- ── 2. El contrato, en liquidación como los demás; el contador para el día que la moto pasó a otro
  update public.contratos
     set estado = 'Suspendido', motivo_suspension = 'mora',
         fecha_fin_cobro = '2026-09-29',
         motivo_fin_cobro = 'La moto RLZ85H se le entregó a otro cliente el 29/09/2026'
   where id = v_contrato;

  -- ── 6. La deuda que creó el cierre (el trigger de la mig 101 deja el renglón en el historial) ─
  delete from public.deudas where id = v_deuda;

  -- ── 8 y 9. El cliente, como los otros que están en liquidación ──────────────────────────────
  update public.clientes
     set estado = 'Activo', lista_negra = false, motivo_lista_negra = null
   where id = v_cliente;

  -- ── El rastro ───────────────────────────────────────────────────────────────────────────────
  insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por) values
    (v_contrato, 'liquidación LIQ-0032',
     'cerrada el 14/09/2026 · debe $35.000 · firmada el 06/10/2026 · documento: ' || coalesce(v_l.documento_firmado_url, '(sin documento)')
       || ' · firma: ' || coalesce(v_l.firma_cliente_url, '-') || ' · huella: ' || coalesce(v_l.huella_cliente_url, '-'),
     'DEVUELTA al paso de la revisión (mig 188): se hizo sin validar el ahorro ni las deudas. Autorizó el dueño el 06/10/2026.',
     v_dueno),
    (v_contrato, 'Estado', 'Cancelado', 'Suspendido (en liquidación) — LIQ-0032 devuelta (mig 188)', v_dueno),
    (v_contrato, 'Cliente', 'Retirado · en lista negra por $35.000', 'Activo · sin lista negra mientras se rehace la liquidación (mig 188)', v_dueno);

  raise notice 'LISTO: LIQ-0032 devuelta al paso de la revisión; contrato Suspendido; deuda de $35.000 y lista negra quitadas; la moto de SILFREDO no se tocó.';
end
$fix$;

select public.registrar_migracion(188, '188_devolver_liq0032_andres_ballestas.sql',
  'LIQ-0032 (ANDRES BALLESTAS, RLZ85H) devuelta al paso de la revisión: se cerró sin validar ahorro ni deudas');

commit;

-- ─── VERIFICACIÓN — debe dar: en_taller · Suspendido · 2026-09-29 · 0 deudas · Activo · false · Asignada ──
select
  (select estado from public.liquidaciones where id = '7298301e-f2f9-45f4-9aef-d221b29dc7d3')   as liquidacion,
  (select estado from public.contratos where id = 'ab4ecdec-9e43-457e-bc98-6629c47898d8')       as contrato,
  (select fecha_fin_cobro from public.contratos where id = 'ab4ecdec-9e43-457e-bc98-6629c47898d8') as contador_para,
  (select count(*) from public.deudas where contrato_id = 'ab4ecdec-9e43-457e-bc98-6629c47898d8') as deudas,
  (select estado from public.clientes where id = '670812e0-b641-4d54-9e99-4f83fcc52d68')        as cliente,
  (select lista_negra from public.clientes where id = '670812e0-b641-4d54-9e99-4f83fcc52d68')   as lista_negra,
  (select estado from public.motos where id = 'f937892d-7fd6-4573-b7a9-591a268734d4')           as moto_de_silfredo;
