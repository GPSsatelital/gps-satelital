-- 073 — Declarar en el repo dos columnas de `convenios` que solo existían en la BD viva.
--
-- POR QUÉ: `cubre_periodo_hasta` y `firma_url` se agregaron a mano contra Supabase y nunca
-- quedaron en ninguna migración. El código y los triggers dependen de ellas:
--   · cubre_periodo_hasta → useAlertas.ts:94, ModalConvenio.tsx:144, useConvenios.ts:58,
--     y los triggers de las migraciones 047 / 054 / 067 (marcan las cajas financiadas
--     por el convenio como cubiertas, para que no se exijan como mora).
--   · firma_url → la firma del acuerdo de pago que se imprime (useDocumentos.ts:530).
-- Sin esta migración, reconstruir la base desde el repo produce una tabla `convenios`
-- sin esas columnas: los convenios dejarían de cubrir el período (falsa mora en todos
-- los clientes con convenio) y el acuerdo de pago saldría sin firma. Es el mismo tipo de
-- desincronización repo↔BD que ya nos costó la cascada de errores de las migs 035-038.
--
-- En la base de PRODUCCIÓN esta migración NO cambia nada (las columnas ya existen):
-- `if not exists` la vuelve una confirmación, no una alteración.

alter table public.convenios
  add column if not exists cubre_periodo_hasta date,
  add column if not exists firma_url text;

comment on column public.convenios.cubre_periodo_hasta is
  'Hasta qué fecha el convenio absorbió la cuota del período al crearse. Mientras sea >= hoy, esas cajas no se exigen como mora.';
comment on column public.convenios.firma_url is
  'Firma del cliente en el acuerdo de pago (bucket documentos). Opcional: los convenios viejos no la tienen.';
