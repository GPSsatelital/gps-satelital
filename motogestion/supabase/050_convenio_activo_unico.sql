-- ===== 050: candado — un solo convenio ACTIVO por contrato =====
-- Causa raíz del bug XZN22H (3 convenios activos duplicados): las dos rutas que crean
-- convenios revisan "¿ya hay activo?" y luego insertan en pasos separados (carrera), y
-- ModalConvenio usaba .single() que revienta con >1 fila (dejaba pasar el 3º). La única
-- garantía real es a nivel de base de datos.
--
-- PASO 1 (una sola vez, ya corrido en producción): limpiar XZN22H — dejar el convenio
--   correcto ($901.500 / 13 cuotas, be3af621, ninguno tenía abonos) y borrar los 2 duplicados:
--   delete from public.convenios where id in
--     ('91c63223-7e4c-4f37-8353-c1be18986947','2ce7857e-745f-43d7-862d-3e9fe6aa7ea8');
--
-- PASO 2 — el candado: imposible tener 2 convenios activos en el mismo contrato, sin
-- importar doble-clic, lag, o qué ruta lo cree. El insert #2 falla con 23505 y la app
-- muestra "Ya existe un convenio activo" (frontend traduce el error).
create unique index if not exists uq_convenio_activo_por_contrato
  on public.convenios (contrato_id) where estado = 'activo';
