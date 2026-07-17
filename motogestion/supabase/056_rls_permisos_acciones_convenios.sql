-- ===== 056: las políticas RLS respetan los permisos por persona (caso LUMAR) =====
-- Problema: el sistema de permisos por acción (mig 048, profiles.acciones) se construyó
-- DESPUÉS de las políticas RLS de 026, que tienen listas de roles fijas. Resultado: darle
-- "crear_convenio" a un SUBADMIN muestra el botón en pantalla, pero la BD rechaza el
-- INSERT ("Convenios: creacion por staff de oficina" solo admite ADMIN/AP/SECRETARIA).
--
-- Enfoque ADITIVO (sin riesgo): no se tocan las políticas existentes — se AGREGAN
-- políticas permisivas nuevas basadas en public.puede_accion() (mig 048, misma lógica
-- que la pantalla: AP bypass + override permitir/bloquear + default del rol). Las
-- políticas permisivas se combinan con OR, así que nadie pierde lo que ya tenía.
-- El alineamiento estricto (que un "bloquear" también frene en BD) queda para la
-- auditoría completa de permisos vs RLS (pendiente acordada).
--
-- Guardia de scope: un SUBADMIN solo sobre SUS contratos (mis_contratos_subadmin).

-- 1) Crear convenio con permiso por persona
drop policy if exists "Convenios: creacion por permiso de accion" on public.convenios;
create policy "Convenios: creacion por permiso de accion"
  on public.convenios for insert to authenticated
  with check (
    public.puede_accion('crear_convenio')
    and (public.mi_rol() <> 'SUBADMIN'
         or contrato_id in (select public.mis_contratos_subadmin()))
  );

-- 2) Actualizar convenio (firma, estado) con el mismo permiso — quien puede crearlo
--    puede completarlo. Los avances automáticos (abonos al confirmar pagos) van por
--    trigger security definer y no dependen de esto.
drop policy if exists "Convenios: actualizacion por permiso de accion" on public.convenios;
create policy "Convenios: actualizacion por permiso de accion"
  on public.convenios for update to authenticated
  using (
    public.puede_accion('crear_convenio')
    and (public.mi_rol() <> 'SUBADMIN'
         or contrato_id in (select public.mis_contratos_subadmin()))
  );

-- 3) Editar deudas con permiso por persona (LUMAR también tiene editar_deuda)
drop policy if exists "Deudas: actualizacion por permiso de accion" on public.deudas;
create policy "Deudas: actualizacion por permiso de accion"
  on public.deudas for update to authenticated
  using (
    public.puede_accion('editar_deuda')
    and (public.mi_rol() <> 'SUBADMIN'
         or contrato_id in (select public.mis_contratos_subadmin()))
  );
