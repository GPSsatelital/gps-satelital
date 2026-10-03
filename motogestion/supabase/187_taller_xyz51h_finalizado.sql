-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 187 — LA ENTRADA AL TALLER DE XYZ51H, CERRADA DE VERDAD (2-oct-2026)
--
-- La mig 186 le puso fecha de salida a la entrada abierta de XYZ51H (moto vendida), pero una entrada
-- al taller está cerrada cuando su estado técnico es 'Finalizado' — así la leen el aviso "Lleva días
-- en el taller" (vista `pendientes`) y la pantalla de Taller. Seguía saliendo el aviso.
--
-- LO QUE HACE: esa sola entrada pasa a 'Finalizado'. Se detiene si no está como la dejó la 186.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   update taller set estado_tecnico = 'Pendiente' where id = '42378693-8c59-464f-a19a-17899e6db20f';
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

do $fix$
declare n int;
begin
  update public.taller set estado_tecnico = 'Finalizado'
   where id = '42378693-8c59-464f-a19a-17899e6db20f'
     and moto_id = '53e8aca0-7bd7-4a47-9369-0b0301de9301'
     and estado_tecnico = 'Pendiente' and fecha_salida = '2026-10-02';
  get diagnostics n = row_count;
  if n <> 1 then raise exception '187 ABORTADA: la entrada al taller de XYZ51H no está como la dejó la 186. NO se tocó nada.'; end if;
  raise notice 'LISTO: la entrada al taller de XYZ51H quedó Finalizada.';
end
$fix$;

select public.registrar_migracion(187, '187_taller_xyz51h_finalizado.sql',
  'La entrada al taller de XYZ51H (vendida), Finalizada de verdad');

commit;
