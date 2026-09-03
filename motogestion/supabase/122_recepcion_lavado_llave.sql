-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 122 — LAVADA y LLAVE en la recepción de la moto (pedido del dueño, 2-sep-2026)
--
-- Dos preguntas nuevas en los tres formularios de novedad (recolección por mora, recepción /
-- entrega voluntaria desde Motos, e iniciar liquidación):
--
--   · lavado          — "¿hay que mandarla a lavar?" → la app crea sola la deuda `lavada`
--                       (concepto que ya existe desde la mig 095) por $15.000.
--   · llave_entregada — true  = el cliente entregó SU llave (lo normal)
--                       false = no la entregó y el funcionario tuvo que ir con la copia de la
--                               empresa → el cliente se quedó con una llave: hay que PEDÍRSELA al
--                               devolverle la moto (y cobrársela si liquida — valor sin definir,
--                               cobro pendiente por decisión del dueño).
--
-- NULL en las dos = la recepción es anterior a hoy y no se preguntó. A lo viejo no se le
-- inventa un dato: la tarjeta de propiedad NUNCA se entrega y la llave casi siempre sí, así
-- que un "no sé" honesto vale más que un "sí" supuesto.
--
-- Solo columnas. Sin RLS nueva (las políticas de la tabla ya cubren filas enteras) y sin tocar
-- el motor de pagos: que la lavada se cobre detrás de la multa y salga aparte en la caja va en
-- una migración propia, con pruebas, al inicio de una sesión fresca (decisión del 2-sep).
-- ═══════════════════════════════════════════════════════════════════════════════════════════

alter table public.recepciones_vehiculo
  add column if not exists lavado boolean,
  add column if not exists llave_entregada boolean;

comment on column public.recepciones_vehiculo.lavado is
  'Se marco "hay que mandarla a lavar" al recibirla; la app creo la deuda lavada ($15.000). NULL = no se pregunto (recepcion anterior a la mig 122).';
comment on column public.recepciones_vehiculo.llave_entregada is
  'true = el cliente entrego su llave; false = hubo que ir con la copia de la empresa (pedirsela al devolver la moto). NULL = no se pregunto.';

-- ─── Verificación ───────────────────────────────────────────────────────────────────────────
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'recepciones_vehiculo'
  and column_name in ('lavado', 'llave_entregada')
order by column_name;
-- Debe dar 2 filas: lavado boolean YES · llave_entregada boolean YES
