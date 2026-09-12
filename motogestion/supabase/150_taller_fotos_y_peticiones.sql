-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 150 — LA ORDEN DE TALLER GUARDA SUS EVIDENCIAS Y SUS PETICIONES (12-sep-2026)
--
-- LO QUE FALTABA (pregunta del dueño, 12-sep): "las evidencias y peticiones dónde se colocan?".
-- Respuesta honesta: en ningún lado. La orden de taller solo tenía el problema con el que entró
-- (`detalle`), lo que se le hizo (`trabajo_realizado`, mig 125), repuestos y costo. Para dejar
-- una foto había que salirse a Motos → "Solo recepción / registro" y las fotos quedaban sueltas
-- en el historial de la moto, no pegadas al arreglo. Y una petición ("hay que cambiar la cadena,
-- vale $85.000") no tenía dónde escribirse ni cómo autorizarse: se hablaba por teléfono.
--
-- CUATRO CAMPOS, NADA MÁS. No toca el motor de dinero, ni las deudas, ni el flujo de devolución
-- del préstamo de reemplazo, ni el estado de la moto.
--
--   fotos_entrada  — las 6 guiadas de cómo entró    {delantera: url, lateral_izquierdo: url, ...}
--   fotos_salida   — las 6 guiadas de cómo salió    (mismo formato)
--   fotos_libres   — las del daño y los repuestos   [{url, nota, fecha, por}]
--   peticiones     — lo que se pide y quién lo autoriza
--                    [{id, texto, pedida_por, fecha, estado, resuelta_por, resuelta_fecha, nota}]
--                    estado: 'pendiente' | 'autorizada' | 'rechazada'
--
-- Las 6 guiadas son las MISMAS de la entrega, la recolección y la devolución (`ANGULOS_FOTO`):
-- delantera · lateral izq. · arriba · lateral der. · trasera (placa) · persona + moto. Decisión
-- del dueño (12-sep): las dos cosas — las guiadas al entrar y al salir, y libres para el daño.
--
-- Las fotos viven en el bucket `documentos` (`taller/{orden}/...`), igual que las demás.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

alter table public.taller
  add column if not exists fotos_entrada jsonb not null default '{}'::jsonb,
  add column if not exists fotos_salida  jsonb not null default '{}'::jsonb,
  add column if not exists fotos_libres  jsonb not null default '[]'::jsonb,
  add column if not exists peticiones    jsonb not null default '[]'::jsonb;

comment on column public.taller.fotos_entrada is
  'Las 6 fotos guiadas de cómo entró la moto, por ángulo (mig 150).';
comment on column public.taller.fotos_salida is
  'Las 6 fotos guiadas de cómo salió la moto, por ángulo (mig 150).';
comment on column public.taller.fotos_libres is
  'Fotos sueltas del arreglo (el daño, el repuesto viejo, el tablero), cada una con su nota (mig 150).';
comment on column public.taller.peticiones is
  'Lo que se pide durante el arreglo y quién lo autorizó. El mecánico pide; autoriza ADMIN, ADMIN_PRINCIPAL, SECRETARIA o SUBADMIN (mig 150).';

-- VERIFICACIÓN — pegar después, esperar 4:
--   select count(*) from information_schema.columns
--   where table_schema = 'public' and table_name = 'taller'
--     and column_name in ('fotos_entrada', 'fotos_salida', 'fotos_libres', 'peticiones');
