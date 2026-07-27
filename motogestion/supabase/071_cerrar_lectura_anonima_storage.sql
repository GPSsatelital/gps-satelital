-- ===== 071: cerrar la lectura anónima de Storage (fuga de datos personales) =====
--
-- Comprobado el 26-jul: con la clave anónima —que viaja DENTRO del bundle de la app, visible
-- en las herramientas del navegador— y SIN iniciar sesión se podía:
--   1) listar el bucket 'documentos' → las carpetas son las CÉDULAS de los 269 clientes
--   2) listar dentro de una → los nombres exactos de archivo
--   3) descargarlos: cédulas, recibos, hojas de vida, antecedentes, huellas, firmas y las
--      fotos con la CARA de cada cliente.
--
-- Causa: la mig 017 creó la política de SELECT `to public`, y el rol `public` incluye a `anon`.
-- El bucket 'comprobantes' tenía otra equivalente con distinto nombre (por eso se buscan en
-- pg_policies en vez de por nombre).
--
-- Ley 1581 de 2012 (habeas data), agravado porque hay autorizaciones de tratamiento FIRMADAS.

do $$
declare v_pol record; v_n int := 0;
begin
  for v_pol in
    select policyname
      from pg_policies
     where schemaname = 'storage' and tablename = 'objects' and cmd = 'SELECT'
       and (roles @> array['public']::name[] or roles @> array['anon']::name[])
  loop
    execute format('drop policy %I on storage.objects', v_pol.policyname);
    raise notice 'Cerrada política de lectura anónima: %', v_pol.policyname;
    v_n := v_n + 1;
  end loop;
  raise notice '071: % políticas anónimas eliminadas.', v_n;
end $$;

drop policy if exists "storage_select_auth_todos" on storage.objects;
create policy "storage_select_auth_todos"
  on storage.objects for select
  to authenticated
  using (bucket_id in ('documentos','comprobantes','firmas','certificados','liquidaciones'));

-- VERIFICADO tras correrla: listar sin sesión = 0 filas en los 5 buckets · listar con sesión
-- = OK · firma, huella, comprobante y foto de recepción siguen cargando (200) en la app.
--
-- ⚠️ PENDIENTE (no lo cierra esta migración): los buckets siguen siendo PÚBLICOS, así que un
-- link suelto sigue abriéndose sin sesión. El cierre completo exige pasar a createSignedUrl,
-- lo que toca ~16 archivos que muestran documentos (un <img> no puede enviar credenciales).
