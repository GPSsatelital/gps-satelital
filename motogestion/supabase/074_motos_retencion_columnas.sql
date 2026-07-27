-- 074 — Crear las columnas de retención de `motos` y declarar dos que solo vivían en la base.
--
-- BUG QUE ARREGLA: registrar una retención por Fiscalía / Tránsito / Garantía NO FUNCIONA hoy.
-- `registrarRetencion()` (useMotos.ts:80) hace un solo UPDATE con el estado Y estos tres campos:
--     update motos set estado='Fiscalia', retencion_fecha=…, retencion_numero_caso=…, retencion_detalle=…
-- Como las tres columnas no existen, Postgres rechaza la instrucción COMPLETA — o sea que ni
-- siquiera el estado se guardaba. El funcionario le daba a "marcar como Fiscalía", veía un error
-- técnico y la moto se quedaba igual.
--
-- Consecuencia en cadena: `retencion_fecha` es la fecha con la que se calcula cuánto tiempo estuvo
-- la moto fuera de servicio, que es lo que decide si ese tiempo SE LE COBRA al cliente o SE LE RUEDA
-- (ModalResolverTiempoFueraServicio). Sin esa fecha, ese cálculo arranca sin punto de partida.
--
-- OJO — esta migración va acompañada de un cambio de código OBLIGATORIO en el mismo despliegue:
-- al liberar una retención, `liberarRetencion()` volvía a escribir el estado y PISABA el "En taller"
-- que el flujo de Fiscalía acababa de poner. Hoy eso no se nota porque la escritura falla; en el
-- momento en que estas columnas existan, empezaría a funcionar y la moto saldría de Fiscalía
-- directo a la calle sin pasar por revisión. Por eso NO correr esta migración sola.
--
-- Además se declaran aquí `color` y `kilometraje_inicial`: existen en la base real y el código las
-- escribe (MotosView al crear la moto, WizardContrato al entregarla), pero ninguna migración del
-- repo las creaba. Mismo desfase repo↔base de la migración 073. En producción no cambian nada.

alter table public.motos
  add column if not exists retencion_fecha date,
  add column if not exists retencion_numero_caso text,
  add column if not exists retencion_detalle text,
  add column if not exists color text,
  add column if not exists kilometraje_inicial integer;

comment on column public.motos.retencion_fecha is
  'Fecha en que la moto entró a Fiscalía/Tránsito/Garantía. Es el punto de partida para calcular el tiempo fuera de servicio que se cobra o se rueda. Null = no está retenida.';
comment on column public.motos.retencion_numero_caso is
  'N° de caso / radicado de la autoridad que retuvo la moto.';
comment on column public.motos.retencion_detalle is
  'Descripción libre del motivo de la retención.';
