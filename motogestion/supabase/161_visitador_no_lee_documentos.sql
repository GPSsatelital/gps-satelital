-- 161 — El VISITADOR ya no puede leer los documentos de los clientes (21-sep-2026)
--
-- EL DEFECTO: sobre `storage.objects` había 5 políticas de SELECT, TODAS `PERMISSIVE`.
-- En Postgres, varias políticas permisivas se combinan con OR: basta que UNA diga sí.
--   · `storage_select_auth_todos`  → los 2 buckets reales, EXCLUYENDO al VISITADOR  ← la intención
--   · `documentos_select_auth`     → bucket `documentos`, a cualquiera con sesión    ← la anulaba
--   · `comprobantes_select_auth`   → bucket `comprobantes`, a cualquiera con sesión  ← la anulaba
--   · `certificados_select_auth`   → bucket `certificados`, que NO EXISTE            ← fantasma
--   · `firmas_select_auth`         → bucket `firmas`, que NO EXISTE                  ← fantasma
--
-- Resultado: la exclusión del VISITADOR no servía para nada. Con su usuario, abriendo las
-- herramientas del navegador, podía LISTAR y DESCARGAR las cédulas, recibos, hojas de vida,
-- antecedentes, firmas, huellas y fotos de los 269 clientes. Ley 1581 de 2012, agravado porque
-- cada cliente firmó una autorización donde la empresa se compromete a custodiarlos.
--
-- ES OTRA PUERTA, DISTINTA DE LOS BUCKETS PÚBLICOS: cerrar los buckets tapa al de AFUERA que
-- tiene un enlace viejo. Esto es alguien CON usuario del sistema. Las dos se arreglan aparte.
--
-- POR QUÉ NO LE ROMPE NADA AL VISITADOR (verificado en el código, no supuesto):
--   · Solo ve UNA pantalla, `mis_visitas` (`App.tsx`: si el rol es VISITADOR, view === "mis_visitas").
--   · Esa pantalla no pinta ni una imagen: no hay `<img>` ni `ImgPrivada` en `MisVisitasView.tsx`.
--   · Subir las fotos de la visita es INSERT (sigue abierto) + `getPublicUrl`, que no necesita
--     SELECT. La vista previa es la foto de su propio celular, un dataURL local.
--   · `ModalVisita.tsx` guarda las URL pero nunca vuelve a mostrar una foto ya subida.
--
-- Ningún otro rol se toca: `storage_select_auth_todos` los cubre a todos menos al VISITADOR.

begin;

-- ── GUARDA: sin la política que queda, NADIE podría leer los documentos ──────────────────
-- Se verifica ANTES de borrar. Si no está, o si dejó de cubrir los 2 buckets reales, aborta
-- y no se borra nada.
do $$
declare v_qual text;
begin
  select qual into v_qual
    from pg_policies
   where schemaname = 'storage' and tablename = 'objects'
     and policyname = 'storage_select_auth_todos' and cmd = 'SELECT';

  if v_qual is null then
    raise exception 'ABORTA: no existe la política storage_select_auth_todos. Si se borran las otras, NADIE podría leer los documentos.';
  end if;
  if v_qual not like '%documentos%' or v_qual not like '%comprobantes%' then
    raise exception 'ABORTA: storage_select_auth_todos ya no cubre los 2 buckets reales. Su condición es: %', v_qual;
  end if;
  if v_qual not like '%VISITADOR%' then
    raise exception 'ABORTA: storage_select_auth_todos ya no excluye al VISITADOR — borrar las otras no arreglaría nada. Su condición es: %', v_qual;
  end if;
end $$;

-- ── Las dos que abrían la puerta sin condición ───────────────────────────────────────────
drop policy if exists "documentos_select_auth"   on storage.objects;
drop policy if exists "comprobantes_select_auth" on storage.objects;

-- ── Las dos fantasma (apuntan a buckets que no existen) ──────────────────────────────────
drop policy if exists "certificados_select_auth" on storage.objects;
drop policy if exists "firmas_select_auth"       on storage.objects;

-- ── COMPROBACIÓN: debe quedar UNA sola política de lectura, la que excluye al VISITADOR ──
do $$
declare v_n int;
begin
  select count(*) into v_n
    from pg_policies
   where schemaname = 'storage' and tablename = 'objects' and cmd = 'SELECT';
  if v_n <> 1 then
    raise exception 'ABORTA: quedaron % políticas de lectura, se esperaba 1.', v_n;
  end if;
end $$;

commit;

-- Para ver el resultado:
--   select policyname, permissive, cmd, roles, qual
--     from pg_policies
--    where schemaname = 'storage' and tablename = 'objects'
--    order by cmd, policyname;
