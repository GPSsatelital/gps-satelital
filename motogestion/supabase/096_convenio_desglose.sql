-- ===== 096: el convenio guarda QUÉ tiene adentro, no solo cuánto suma =====
--
-- EL PROBLEMA (encontrado el 13-ago-2026 revisando las cuentas de NESTOR MORENO y ALBERT DEL
-- CRISTO): un convenio mete adentro dos cosas que se comportan DISTINTO:
--
--   · deuda vieja  → es plata que el cliente le debe a la empresa. NO genera ahorro.
--   · semanas de arriendo → cada una lleva su ahorro del cliente ($26.000 de los $202.000).
--
-- Pero `convenios.deuda_total` guarda UNA SOLA CIFRA con las dos revueltas. El de ALBERT dice
-- $639.000 y nadie puede saber que $437.000 eran deuda y $202.000 una semana. Sin ese dato es
-- IMPOSIBLE acreditarle el ahorro que le corresponde: no hay con qué separarlo.
--
-- Lo más absurdo: `ModalConvenio` YA calculaba el desglose y hasta se lo mostraba al funcionario
-- en pantalla ("Deuda $437.000 + 1 semana $202.000"). Al guardar escribía solo la suma. El dato
-- se moría en la memoria del navegador.
--
-- POR QUÉ CONGELADO Y NO CALCULADO: `caja_valor()` usa los valores VIGENTES del contrato. Si
-- mañana sube la tarifa, recalcular el desglose de un convenio viejo reescribiría la historia —
-- justo lo que prohíbe la regla 10 de la spec del libro de cajas ("los cambios de tarifa solo
-- afectan cajas futuras; las selladas no se tocan").
--
-- LO QUE NO CAMBIA: nada del motor de pagos, ni el reparto, ni la marca de semanas al firmar, ni
-- los convenios que ya existen. Estas columnas nacen vacías y solo las llenan los convenios
-- NUEVOS. Los 53 que ya están firmados se completan aparte, revisados uno por uno contra su
-- acuerdo — no a ciegas.

alter table public.convenios
  add column if not exists monto_deudas      numeric,
  add column if not exists monto_semanas     numeric,
  add column if not exists ahorro_semanas    numeric,
  add column if not exists cajas_financiadas integer;

comment on column public.convenios.monto_deudas is
  'Parte del convenio que era DEUDA ya registrada. No genera ahorro. NULL = convenio anterior a la mig 096.';
comment on column public.convenios.monto_semanas is
  'Parte del convenio que eran SEMANAS de arriendo financiadas. Lleva ahorro adentro.';
comment on column public.convenios.ahorro_semanas is
  'Ahorro del CLIENTE contenido en esas semanas, congelado al firmar (los valores del contrato pueden cambiar después).';
comment on column public.convenios.cajas_financiadas is
  'Cuántas semanas se metieron adentro. La primera puede ir parcial si el cliente ya le había abonado.';
