-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 118 — RODAR EL PAQUETE: las cuotas del convenio también se corren (24-ago-2026)
--
-- El caso que la parió (JUAN CARLOS LEAL, YAL68H — y WILLINGTON, DQW26I, el día anterior):
-- moto guardada por retención de mora, al devolverla se ruedan las semanas COMPLETAS de
-- bodega... pero el cliente tiene convenio, y la cuota del convenio de esas semanas se le
-- seguía exigiendo. Regla del dueño, textual: "la exoneración del convenio solo es en esa
-- semana pero después se le cobra en la siguiente — no es que se le perdona, es que se le
-- rueda al final también".
--
-- `periodos_exonerados` es el espejo EXACTO de `contratos.cajas_exoneradas` (mig 078): la
-- cuenta de cuotas exigidas (periodosConvenioExigidos, en cicloPago.ts) lo resta ANTES del
-- tope de deuda_total — la curva de exigencia se corre N semanas y el total del convenio se
-- paga completo, más tarde. Ni un peso se perdona.
--
-- Quién lo escribe: el modal de "tiempo fuera de servicio" al rodar (con documento FIRMADO
-- obligatorio), que también corre fecha_limite los mismos días — sin eso, el vencimiento
-- marcaría incumplido un convenio que va al día con su calendario corrido. Todo queda en
-- contratos_auditoria enlazado al acuerdo (regla de la esencia y el rastro).
-- ═══════════════════════════════════════════════════════════════════════════════════════════

alter table public.convenios
  add column if not exists periodos_exonerados integer not null default 0;

comment on column public.convenios.periodos_exonerados is
  'Cuotas del convenio corridas al final porque la moto estuvo guardada esas semanas '
  '(espejo de contratos.cajas_exoneradas). No se perdonan: se exigen mas tarde. '
  'Las escribe el modal de tiempo fuera de servicio con documento firmado.';

-- Verificación
select count(*) as columna_periodos_exonerados
from information_schema.columns
where table_name = 'convenios' and column_name = 'periodos_exonerados';
-- Debe dar: 1
