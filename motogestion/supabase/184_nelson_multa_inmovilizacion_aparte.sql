-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 184 — NELSON ESTUPIÑAN (RMZ58H): LOS $30.000 DE LA INMOVILIZACIÓN, APARTE (2-oct-2026, dueño: "separarlos")
--
-- LO QUE SE ENCONTRÓ. Su deuda del Excel viejo era $840.000. El 9-jul a las 4:09 pm alguien la subió a
-- mano a $870.000 (+$30.000, sin anotar por qué) y 11 minutos después se firmó el acuerdo por
-- $840.000. El 4 y el 7 de julio su moto fue inmovilizada a distancia, y la multa de inmovilización es
-- $30.000: esos $30.000 son la multa, metida dentro de la deuda del Excel en vez de anotarse aparte.
-- Quedaba por fuera del acuerdo y, desde la mig 183, nadie la cobraba.
--
-- LO QUE HACE:
--   1. La deuda del Excel vuelve a $840.000 (lo que financió el acuerdo firmado). Sigue en el acuerdo.
--   2. Se anota la multa de inmovilización de julio: $30.000, pendiente, con fecha 9-jul.
--   3. Queda el rastro en la auditoría del contrato.
--   Se detiene si la deuda no está exactamente como se midió.
--
-- ⚠️ DESPUÉS: su liquidación LIQ-0050 está "calculada" con el cobro doble (deuda del Excel $870.000 +
-- saldo del acuerdo $840.000, la misma plata). Hay que volver a calcularla en Liquidaciones.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   update deudas set monto = 870000, monto_pendiente = 870000 where id = '9a4b2d1a-bb87-4a98-8004-6326a4910e78';
--   delete from deudas where contrato_id = 'be7894ba-507f-4f95-99a6-5d8d93d013a2' and descripcion like 'Multa por inmovilización (4 y 7 de julio%';
-- ═══════════════════════════════════════════════════════════════════════════════════════════

select public.tomar_foto_plata('antes-184') as contratos_fotografiados;

begin;

do $fix$
declare
  v_contrato constant uuid := 'be7894ba-507f-4f95-99a6-5d8d93d013a2';
  v_deuda    constant uuid := '9a4b2d1a-bb87-4a98-8004-6326a4910e78';
  v_dueno    constant uuid := 'a68f065b-3a59-4c67-bd2e-45c6abc30fdb';
  n int;
begin
  update public.deudas
     set monto = 840000, monto_pendiente = 840000
   where id = v_deuda and contrato_id = v_contrato
     and concepto = 'migracion' and monto = 870000 and monto_pendiente = 870000 and estado = 'en_convenio';
  get diagnostics n = row_count;
  if n <> 1 then raise exception '184 ABORTADA: la deuda del Excel de NELSON no está como se midió (870.000, en el acuerdo). NO se tocó nada.'; end if;

  insert into public.deudas (contrato_id, concepto, descripcion, monto, monto_pendiente, estado, fecha, registrado_por)
  values (v_contrato, 'multa_recoleccion',
          'Multa por inmovilización (4 y 7 de julio de 2026) — se había sumado a la deuda del Excel viejo el 9-jul',
          30000, 30000, 'pendiente', '2026-07-09', v_dueno);

  insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por) values
    (v_contrato, 'Deuda: monto original', '870000', '840000 — los $30.000 de más eran la multa de inmovilización de julio (mig 184)', v_dueno),
    (v_contrato, 'Deuda nueva', '—', 'Multa por inmovilización de julio $30.000, separada de la deuda del Excel (mig 184)', v_dueno);

  raise notice 'LISTO: deuda del Excel en $840.000 y multa de inmovilización de $30.000 aparte.';
end
$fix$;

select public.registrar_migracion(184, '184_nelson_multa_inmovilizacion_aparte.sql',
  'NELSON ESTUPIÑAN (RMZ58H): los $30.000 de la inmovilización de julio, aparte de la deuda del Excel');

commit;
