-- ===== 072: foto del comprobante en el dinero sin identificar =====
--
-- Regla del negocio ya establecida: en transferencias la foto del comprobante SIEMPRE es
-- obligatoria — es la prueba de que el dinero entró. La bolsa de "dinero sin identificar"
-- se había quedado por fuera de esa regla: se registraba fecha, monto y referencia, pero sin
-- ninguna imagen del extracto.
--
-- Importa por dos razones:
--   1) Es plata que NADIE reclamó. Si meses después aparece el dueño, la referencia sola no
--      basta para demostrar cuánto entró y qué día — la imagen del extracto sí.
--   2) Al cruzarla con un pago, esa imagen queda como respaldo de la acreditación.

alter table public.ingresos_no_identificados
  add column if not exists comprobante_url text;

comment on column public.ingresos_no_identificados.comprobante_url is
  'Foto/captura del extracto bancario donde aparece esta transferencia. Obligatoria al '
  'registrar: es la prueba de que el dinero entró, para cuando aparezca el dueño.';
