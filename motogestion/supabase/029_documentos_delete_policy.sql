-- Migración 029: permite borrar archivos del bucket "documentos"
-- Necesario para poder eliminar limpio un contrato "En proceso" cancelado por error
-- (fotos/firmas ya subidas durante el wizard) — antes solo había políticas de
-- insert/select/update, ningún borrado estaba permitido.

drop policy if exists "documentos_delete_admin" on storage.objects;
create policy "documentos_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'documentos' and public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL'));
