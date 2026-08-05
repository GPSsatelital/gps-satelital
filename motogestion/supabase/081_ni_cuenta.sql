-- ===== 081: a qué cuenta entró el dinero sin identificar =====
--
-- Antes, al anotar una transferencia sin dueño, el GRUPO se heredaba del filtro que la pantalla
-- tuviera puesto: un accidente, no un dato. Y el grupo es una deducción, no un hecho.
--
-- El hecho que la secretaria SÍ está viendo en el extracto es a qué cuenta cayó la plata. Con
-- eso guardado, el grupo se deduce solo cuando la cuenta es de un único portafolio (mig 080),
-- y cuando la cuenta es compartida el sistema lo admite en vez de inventar.
--
-- Guardar la cuenta también deja preparado el arqueo por cuenta: hoy la secretaria tiene que
-- separar el extracto a mano grupo por grupo al cerrar caja.

alter table public.ingresos_no_identificados
  add column if not exists cuenta_id uuid references public.cuentas_bancarias(id);

comment on column public.ingresos_no_identificados.cuenta_id is
  'A qué cuenta de la empresa entró. El grupo se deduce de aquí cuando la cuenta es de un solo portafolio.';
