-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 181 — ROGER VANEGAS BLANCO (RMM68H): SU BASE REAL FUE $400.000, NO $500.000 (30-sep-2026)
--
-- Al pasarlo del Excel de COSTA (empalme del 8-ago) se cargó como base entregada el valor PACTADO
-- ($500.000). El dueño confirmó el 30-sep que ROGER entregó $400.000. La liquidación LIQ-0064 (retiro
-- voluntario, todavía sin cerrar) le devolvía la base con `ahorro_inicial`, así que le daba $100.000 de
-- más. Por D-023 la base que no puso no se le cobra ni se le devuelve.
--
-- Solo cambia `contratos.ahorro_inicial` (lo que ENTREGÓ). `base_inicial` (lo pactado) queda igual.
-- Deja su rastro en `contratos_auditoria`. La liquidación se recalcula después en la app.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   update public.contratos set ahorro_inicial = 500000 where id = '436c0a7e-1ee5-4992-a7af-0494c468c0fa';
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

do $fix$
declare n int;
begin
  update public.contratos
     set ahorro_inicial = 400000
   where id = '436c0a7e-1ee5-4992-a7af-0494c468c0fa'
     and ahorro_inicial = 500000;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'El contrato de ROGER no está como se midió (ahorro_inicial debía ser 500000). No se tocó nada.'; end if;

  insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por)
  values ('436c0a7e-1ee5-4992-a7af-0494c468c0fa', 'Ahorro inicial', '500000',
          '400000 — base REAL que entregó, confirmada por el dueño el 30-sep-2026 (el Excel traía el valor pactado)',
          'a68f065b-3a59-4c67-bd2e-45c6abc30fdb');
end
$fix$;

select public.registrar_migracion(181, '181_roger_base_real.sql',
  'ROGER VANEGAS (RMM68H): base entregada $500.000 → $400.000 (confirmado por el dueño)');

commit;

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
select c.ahorro_inicial, c.base_inicial,
       (select count(*) from public.contratos_auditoria a
         where a.contrato_id = c.id and a.valor_nuevo like '400000 —%') as rastro
  from public.contratos c where c.id = '436c0a7e-1ee5-4992-a7af-0494c468c0fa';
-- Esperado: 400000 · 500000 · 1
