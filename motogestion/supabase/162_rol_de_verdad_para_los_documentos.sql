-- 162 — Para tocar los documentos hay que tener un rol DE VERDAD (21-sep-2026)
--
-- EL DEFECTO, en una palabra: los 3 permisos sobre el bucket `documentos` dicen
-- `mi_rol() IS DISTINCT FROM 'VISITADOR'`. Y `mi_rol()` es
-- `select role from profiles where id = auth.uid()` — devuelve **NULL** si la persona no tiene
-- fila en `profiles`. En SQL, `NULL IS DISTINCT FROM 'VISITADOR'` es **TRUE**.
--
-- O sea: quien NO tiene perfil pasa el filtro. Y el registro de usuarios de Supabase estaba
-- ABIERTO (verificado el 21-sep), así que cualquier persona en internet podía:
--   1. crearse una cuenta sola — la llave anónima viaja dentro del bundle de la app,
--   2. quedar sin perfil (nadie se lo crea),
--   3. LISTAR y DESCARGAR las cédulas, recibos, hojas de vida, antecedentes, firmas, huellas y
--      fotos de los 269 clientes; y además SOBREESCRIBIRLOS.
-- Ley 1581 de 2012, agravado porque cada cliente firmó una autorización donde la empresa se
-- compromete a custodiarlos.
--
-- LA RAÍZ se cerró apagando el registro en el panel de Supabase. Esto es el cinturón de
-- seguridad: si algún día alguien reactiva el registro sin acordarse de esta conversación, la
-- puerta ya no se abre sola.
--
-- ALCANCE, verificado contra `pg_policies` (21-sep): NO hay política de INSERT sobre `profiles`,
-- así que una cuenta sin perfil **no puede crearse uno ni ponerse rol** — no hay escalada. Y los
-- permisos de `clientes`/`contratos`/`pagos`/`deudas`/`convenios` sí exigen rol, así que esa
-- cuenta nunca pudo ver datos de cartera. La exposición era **solo los archivos**.
--
-- QUÉ NO CAMBIA: los 7 roles reales tienen fila en `profiles`, así que para todos ellos el
-- resultado es idéntico al de hoy. El VISITADOR sigue pudiendo SUBIR a `visitas/` y `guardados/`
-- y sigue sin poder leer (mig 161). El SOCIO sigue viendo la foto de entrega de sus motos.

begin;

-- ── GUARDA: si alguna política ya no es la que este archivo cree, aborta sin tocar nada ──────
do $$
declare v_sel text; v_upd text; v_ins text;
begin
  select qual       into v_sel from pg_policies where schemaname='storage' and tablename='objects' and policyname='storage_select_auth_todos';
  select qual       into v_upd from pg_policies where schemaname='storage' and tablename='objects' and policyname='documentos_update_auth';
  select with_check into v_ins from pg_policies where schemaname='storage' and tablename='objects' and policyname='documentos_insert_auth';

  if v_sel is null then raise exception 'ABORTA: no existe storage_select_auth_todos.'; end if;
  if v_upd is null then raise exception 'ABORTA: no existe documentos_update_auth.'; end if;
  if v_ins is null then raise exception 'ABORTA: no existe documentos_insert_auth.'; end if;

  -- Las tres tienen que traer HOY el defecto que se viene a arreglar. Si alguna ya no lo trae,
  -- alguien la cambió después de escribir esto y hay que volver a mirarla a mano.
  if v_sel not like '%IS DISTINCT FROM%' then raise exception 'ABORTA: storage_select_auth_todos ya no usa IS DISTINCT FROM. Su condición es: %', v_sel; end if;
  if v_upd not like '%IS DISTINCT FROM%' then raise exception 'ABORTA: documentos_update_auth ya no usa IS DISTINCT FROM. Su condición es: %', v_upd; end if;
  if v_ins not like '%IS DISTINCT FROM%' then raise exception 'ABORTA: documentos_insert_auth ya no usa IS DISTINCT FROM. Su condición es: %', v_ins; end if;

  -- El INSERT tiene que seguir dejando al VISITADOR subir sus fotos de visita. Si esas dos
  -- carpetas ya no están en la condición, este archivo se la borraría sin darse cuenta.
  if v_ins not like '%visitas/%' or v_ins not like '%guardados/%' then
    raise exception 'ABORTA: documentos_insert_auth ya no menciona visitas/ y guardados/ — reescribirla le quitaría al VISITADOR el permiso de subir. Su condición es: %', v_ins;
  end if;
end $$;

-- ── LEER ─────────────────────────────────────────────────────────────────────────────────────
-- Se conservan los 3 nombres de bucket que no existen (`firmas`, `certificados`,
-- `liquidaciones`): son inofensivos y quitarlos no aporta nada, pero si algún día se crea uno
-- con ese nombre el comportamiento sigue siendo el esperado.
drop policy if exists "storage_select_auth_todos" on storage.objects;
create policy "storage_select_auth_todos" on storage.objects for select to authenticated
using (
  bucket_id = any (array['documentos', 'comprobantes', 'firmas', 'certificados', 'liquidaciones'])
  and public.mi_rol() is not null
  and public.mi_rol() <> 'VISITADOR'
);

-- ── SOBREESCRIBIR ────────────────────────────────────────────────────────────────────────────
-- Sin `with check`: en un UPDATE, Postgres aplica el `using` también como comprobación de lo
-- que se escribe. Se deja igual que estaba para no cambiar nada más que la palabra.
drop policy if exists "documentos_update_auth" on storage.objects;
create policy "documentos_update_auth" on storage.objects for update to authenticated
using (
  bucket_id = 'documentos'
  and public.mi_rol() is not null
  and public.mi_rol() <> 'VISITADOR'
);

-- ── SUBIR ────────────────────────────────────────────────────────────────────────────────────
-- Se conserva EXACTO el permiso del VISITADOR de subir a `visitas/` y `guardados/` (es como hace
-- su trabajo); lo único que se agrega es que tenga un rol de verdad.
drop policy if exists "documentos_insert_auth" on storage.objects;
create policy "documentos_insert_auth" on storage.objects for insert to authenticated
with check (
  bucket_id = 'documentos'
  and public.mi_rol() is not null
  and (
    public.mi_rol() <> 'VISITADOR'
    or name like 'visitas/%'
    or name like 'guardados/%'
  )
);

-- ── COMPROBACIÓN: ninguna de las tres puede quedar con el defecto ────────────────────────────
do $$
declare v_malas int;
begin
  select count(*) into v_malas
    from pg_policies
   where schemaname = 'storage' and tablename = 'objects'
     and policyname in ('storage_select_auth_todos', 'documentos_update_auth', 'documentos_insert_auth')
     and (coalesce(qual, '') || ' ' || coalesce(with_check, '')) like '%IS DISTINCT FROM%';
  if v_malas <> 0 then
    raise exception 'ABORTA: quedaron % políticas con IS DISTINCT FROM.', v_malas;
  end if;

  select count(*) into v_malas
    from pg_policies
   where schemaname = 'storage' and tablename = 'objects'
     and policyname in ('storage_select_auth_todos', 'documentos_update_auth', 'documentos_insert_auth')
     and (coalesce(qual, '') || ' ' || coalesce(with_check, '')) like '%mi_rol() IS NOT NULL%';
  if v_malas <> 3 then
    raise exception 'ABORTA: solo % de 3 políticas exigen un rol de verdad.', v_malas;
  end if;
end $$;

commit;
