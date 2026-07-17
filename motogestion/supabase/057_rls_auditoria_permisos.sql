-- ===== 057: AUDITORÍA PERMISOS vs RLS — alinear la BD con el sistema de acciones =====
-- Cruce completo (17-jul) de las 16 acciones del catálogo (src/lib/acciones.ts) contra
-- pg_policies real. Hallazgos: varias políticas con roles quemados anteriores a mig 048
-- tapaban los permisos por persona (patrón LUMAR), incluyendo un flujo ROTO con defaults:
-- SUBADMIN tiene iniciar_liquidacion por defecto pero liquidaciones/taller eran solo staff.
--
-- FRENTE A — políticas ADITIVAS (permisivas, se combinan con OR: nadie pierde lo que ya
-- tenía) basadas en public.puede_accion() (mig 048) + scope de SUBADMIN.
-- FRENTE B — trigger que cierra el hueco inverso: la política de UPDATE de pagos deja al
-- SUBADMIN actualizar pagos de sus contratos (necesario para "entregué a secretaria"),
-- pero eso incluía poder confirmar/rechazar plata por consola. Ahora cambiar el ESTADO
-- de un pago exige puede_accion('confirmar_transferencia'), igual que la pantalla.
--
-- NO se toca enforce_cliente_estado_change (trigger de estados del cliente): el wizard y
-- otros flujos legítimos cambian estados y alinearlo requiere estudio aparte (pendiente).

-- ─── FRENTE A ────────────────────────────────────────────────────────────────

-- A1. Liquidaciones: iniciar con permiso (arregla SUBADMIN roto hoy). Avanzar/cerrar
--     sigue siendo de staff (la vista de gestión es de ADMIN — decisión de negocio).
drop policy if exists "Liquidaciones: iniciar por permiso de accion" on public.liquidaciones;
create policy "Liquidaciones: iniciar por permiso de accion"
  on public.liquidaciones for insert to authenticated
  with check (
    public.puede_accion('iniciar_liquidacion')
    and (public.mi_rol() <> 'SUBADMIN'
         or contrato_id in (select public.mis_contratos_subadmin()))
  );

drop policy if exists "Liquidaciones: lectura por permiso de accion" on public.liquidaciones;
create policy "Liquidaciones: lectura por permiso de accion"
  on public.liquidaciones for select to authenticated
  using (
    public.puede_accion('iniciar_liquidacion')
    and (public.mi_rol() <> 'SUBADMIN'
         or contrato_id in (select public.mis_contratos_subadmin()))
  );

-- A2. Taller: iniciar liquidación crea la orden de revisión en taller.
drop policy if exists "Taller: registro por permiso de accion" on public.taller;
create policy "Taller: registro por permiso de accion"
  on public.taller for insert to authenticated
  with check (
    public.puede_accion('iniciar_liquidacion')
    and (public.mi_rol() <> 'SUBADMIN'
         or moto_id in (select public.mis_moto_ids_subadmin()))
  );

-- A3. Acuerdos de tiempo rodado: el funcionario que gestiona la moto en campo
--     (recolectar_moto) resuelve el tiempo fuera de servicio al devolver/reactivar.
drop policy if exists "Acuerdos: gestion por permiso de accion" on public.acuerdos_tiempo_rodado;
create policy "Acuerdos: gestion por permiso de accion"
  on public.acuerdos_tiempo_rodado for all to authenticated
  using (
    public.puede_accion('recolectar_moto')
    and (public.mi_rol() <> 'SUBADMIN'
         or contrato_id in (select public.mis_contratos_subadmin()))
  )
  with check (
    public.puede_accion('recolectar_moto')
    and (public.mi_rol() <> 'SUBADMIN'
         or contrato_id in (select public.mis_contratos_subadmin()))
  );

-- A4. Contratos: crear con permiso. Un SUBADMIN con override solo sobre sus motos
--     (o sin moto aún — el wizard asigna la moto en el paso 2).
drop policy if exists "Contratos: creacion por permiso de accion" on public.contratos;
create policy "Contratos: creacion por permiso de accion"
  on public.contratos for insert to authenticated
  with check (
    public.puede_accion('crear_contrato')
    and (public.mi_rol() <> 'SUBADMIN'
         or moto_id is null
         or moto_id in (select public.mis_moto_ids_subadmin()))
  );

-- A5. Caja diaria: cerrar caja con permiso (la caja es global, sin scope de moto).
drop policy if exists "Caja: acceso por permiso de accion" on public.caja_diaria;
create policy "Caja: acceso por permiso de accion"
  on public.caja_diaria for all to authenticated
  using (public.puede_accion('cerrar_caja'))
  with check (public.puede_accion('cerrar_caja'));

-- A6. Visitas: resolver (aprobar/repetir) con permiso. SUBADMIN solo las asignadas a él.
drop policy if exists "Visitas: resolucion por permiso de accion" on public.visitas;
create policy "Visitas: resolucion por permiso de accion"
  on public.visitas for update to authenticated
  using (
    public.puede_accion('aprobar_visita')
    and (public.mi_rol() <> 'SUBADMIN' or asignada_a = auth.uid())
  )
  with check (
    public.puede_accion('aprobar_visita')
    and (public.mi_rol() <> 'SUBADMIN' or asignada_a = auth.uid())
  );

-- A7. Pagos: borrar con permiso (la política vieja era solo ADMIN_PRINCIPAL aunque el
--     trigger de mig 048 ya validaba puede_accion — ahora política y trigger coinciden).
drop policy if exists "Pagos: borrado por permiso de accion" on public.pagos;
create policy "Pagos: borrado por permiso de accion"
  on public.pagos for delete to authenticated
  using (
    public.puede_accion('eliminar_pago')
    and (public.mi_rol() <> 'SUBADMIN'
         or contrato_id in (select public.mis_contratos_subadmin()))
  );

-- A8. Mensajes WhatsApp: editar con permiso de configuración.
drop policy if exists "Mensajes wa: escritura por permiso de accion" on public.mensajes_whatsapp;
create policy "Mensajes wa: escritura por permiso de accion"
  on public.mensajes_whatsapp for all to authenticated
  using (public.puede_accion('editar_configuracion'))
  with check (public.puede_accion('editar_configuracion'));

-- A9. Deudas: eliminar con permiso (editar_deuda cubre el ciclo completo de la deuda).
drop policy if exists "Deudas: eliminacion por permiso de accion" on public.deudas;
create policy "Deudas: eliminacion por permiso de accion"
  on public.deudas for delete to authenticated
  using (
    public.puede_accion('editar_deuda')
    and (public.mi_rol() <> 'SUBADMIN'
         or contrato_id in (select public.mis_contratos_subadmin()))
  );

-- ─── FRENTE B — cambiar el ESTADO de un pago exige el permiso, también en la BD ──
-- La pantalla ya esconde Confirmar/Rechazar a quien no tiene confirmar_transferencia;
-- este trigger hace que la BD lo exija igual (antes un SUBADMIN podía confirmar por
-- consola). Solo aplica a UPDATE que cambia estado: registrar efectivo (INSERT ya
-- Confirmado) y marcar entregado_caja siguen igual. auth.uid() null = mantenimiento
-- por SQL Editor / procesos de sistema — no se bloquea.
create or replace function public.enforce_confirmar_pago()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if new.estado is distinct from old.estado
     and not public.puede_accion('confirmar_transferencia') then
    raise exception 'No tienes permiso para confirmar o rechazar pagos';
  end if;
  return new;
end; $$;

drop trigger if exists trg_enforce_confirmar_pago on public.pagos;
create trigger trg_enforce_confirmar_pago
  before update of estado on public.pagos
  for each row execute function public.enforce_confirmar_pago();
