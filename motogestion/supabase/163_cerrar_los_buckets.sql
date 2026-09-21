-- 163 — Cerrar la bodega: los 2 buckets pasan a PRIVADOS (21-sep-2026)
--
-- QUÉ CIERRA: hasta hoy, un enlace suelto de un archivo —reenviado por WhatsApp, guardado en el
-- historial del navegador, copiado en la caché de alguien— **abría el documento sin sesión, para
-- siempre**. Son las cédulas, recibos, hojas de vida, antecedentes, firmas, huellas y fotos con la
-- cara de 269 clientes, cada uno con una autorización firmada donde la empresa se compromete a
-- custodiarlos (Ley 1581 de 2012).
--
-- LA ENUMERACIÓN ya se había cerrado en la mig 071 (sin sesión no se puede LISTAR). Lo que queda
-- es el enlace directo. Esto lo cierra.
--
-- POR QUÉ SE PUEDE HACER HOY Y NO ANTES: todo el código ya pide un **enlace firmado** que caduca
-- en 60 minutos, en los tres caminos:
--   · los 19 `<a href>` → `abrirDocumento` / `descargarDocumento`
--   · las imágenes de pantalla → `ImgPrivada`
--   · las imágenes DENTRO de los documentos impresos y los PDF → `urlADataUrl` (11 puntos),
--     `htmlAPdfBlob` (todos los PDF) y `firmarImagenesHtml` (las 6 ventanas de impresión)
-- Firmar funciona igual con el bucket público, por eso el código se pudo migrar sin romper nada
-- y este paso va AL FINAL. Al revés se rompen imágenes en producción, en vivo y sin aviso.
--
-- VERIFICADO ANTES DE CORRER (21-sep): no queda ningún `fetch` de una URL pública en el front
-- (los que hay convierten fotos locales antes de subirlas), y las 3 funciones del servidor
-- (`avisar`, `enviar-mensaje`, `manage-users`) no tocan Storage.
--
-- 🔄 SE DESHACE EN 5 SEGUNDOS — no hay pérdida de datos, solo cambia una bandera:
--      update storage.buckets set public = true where id in ('documentos', 'comprobantes');

begin;

-- ── GUARDA: si ya están privados, no hay nada que hacer y conviene saberlo ───────────────────
do $$
declare v_publicos int;
begin
  select count(*) into v_publicos
    from storage.buckets where id in ('documentos', 'comprobantes') and public;
  if v_publicos = 0 then
    raise exception 'ABORTA: los 2 buckets ya están privados. Esto ya se corrió.';
  end if;
end $$;

update storage.buckets set public = false where id in ('documentos', 'comprobantes');

-- ── COMPROBACIÓN: no puede quedar ningún bucket público ──────────────────────────────────────
do $$
declare v_n int;
begin
  select count(*) into v_n from storage.buckets where public;
  if v_n <> 0 then
    raise exception 'ABORTA: quedaron % bucket(s) públicos.', v_n;
  end if;
end $$;

commit;

-- Para ver cómo quedó:
--   select id, public from storage.buckets order by id;
