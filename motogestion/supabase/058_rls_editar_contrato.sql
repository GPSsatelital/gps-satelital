-- ===== 058: EDITAR CONTRATO por permiso de acción (cierra el hueco del SUBADMIN) =====
-- Problema real reportado por el usuario (23-jul): activó la acción "editar_contrato" a un
-- SUBADMIN y aun así no podía editar. Eran TRES candados encadenados:
--   1) Frontend: el botón "Editar contrato" vivía dentro de un bloque gateado por
--      puedeCrear/puedeDocumentos → ni siquiera se mostraba. (Arreglado en ContratosView.tsx.)
--   2) RLS de contratos: el SUBADMIN sí puede hacer UPDATE, pero SOLO de sus motos
--      (mig 035) — eso está bien y se conserva.
--   3) contratos_auditoria: el INSERT solo aceptaba ADMIN/ADMIN_PRINCIPAL (mig 027) →
--      el UPDATE pasaba pero la fila de auditoría fallaba. ESTA migración arregla eso.
--
-- Decisión del usuario: "sí, que pueda, solo en SUS motos" — con todo auditado.
--
-- Patrón: políticas ADITIVAS (permisivas → se combinan con OR). Nadie pierde lo que tenía;
-- solo se suma quien tenga la acción `editar_contrato` habilitada (rol o permiso por persona).
-- Mismo molde que la mig 057.

-- A1. Auditoría de contratos: INSERT por permiso de acción, con scope del SUBADMIN.
--     Sin esto, editar un contrato falla al escribir el rastro (y el rastro es obligatorio:
--     toda edición debe quedar registrada con quién y cuándo).
drop policy if exists "Auditoria contratos: insert por permiso de accion" on public.contratos_auditoria;
create policy "Auditoria contratos: insert por permiso de accion"
  on public.contratos_auditoria for insert to authenticated
  with check (
    public.puede_accion('editar_contrato')
    and (public.mi_rol() <> 'SUBADMIN'
         or contrato_id in (select public.mis_contratos_subadmin()))
  );

-- A2. Lectura de la auditoría: quien puede editar debe poder ver el historial de lo que
--     edita (el modal lo muestra). El SUBADMIN solo el de sus contratos.
drop policy if exists "Auditoria contratos: lectura por permiso de accion" on public.contratos_auditoria;
create policy "Auditoria contratos: lectura por permiso de accion"
  on public.contratos_auditoria for select to authenticated
  using (
    public.puede_accion('editar_contrato')
    and (public.mi_rol() <> 'SUBADMIN'
         or contrato_id in (select public.mis_contratos_subadmin()))
  );

-- A3. UPDATE de contratos por permiso de acción (además del de staff de mig 004 y del
--     scope de recolección de mig 035). Refuerza que quien edite tenga la acción, y
--     mantiene al SUBADMIN acotado a sus motos.
drop policy if exists "Contratos: update por permiso de editar_contrato" on public.contratos;
create policy "Contratos: update por permiso de editar_contrato"
  on public.contratos for update to authenticated
  using (
    public.puede_accion('editar_contrato')
    and (public.mi_rol() <> 'SUBADMIN'
         or id in (select public.mis_contratos_subadmin()))
  )
  with check (
    public.puede_accion('editar_contrato')
    and (public.mi_rol() <> 'SUBADMIN'
         or id in (select public.mis_contratos_subadmin()))
  );

-- Verificación sugerida tras correrla (debe listar las 3 políticas nuevas):
-- select tablename, policyname, cmd from pg_policies
--  where policyname ilike '%permiso de accion%' or policyname ilike '%permiso de editar_contrato%'
--  order by tablename, policyname;
