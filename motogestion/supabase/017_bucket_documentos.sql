-- Bucket de Storage para documentos de clientes y acompañantes
-- (cédula, recibos, antecedentes, hoja de vida, carta).
-- Se guarda la URL pública en documentos_cliente / documentos_acompanante (jsonb).

insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', true)
on conflict (id) do nothing;

-- Cualquier usuario autenticado puede subir documentos
drop policy if exists "documentos_insert_auth" on storage.objects;
create policy "documentos_insert_auth"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'documentos');

-- Lectura pública (el bucket es público para poder abrir el enlace)
drop policy if exists "documentos_select_public" on storage.objects;
create policy "documentos_select_public"
  on storage.objects for select
  to public
  using (bucket_id = 'documentos');

-- Permitir reemplazar (upsert) a usuarios autenticados
drop policy if exists "documentos_update_auth" on storage.objects;
create policy "documentos_update_auth"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'documentos');
