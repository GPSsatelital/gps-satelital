-- ===== 051: motivo_suspension — distinguir moto guardada por MORA vs TEMPORAL =====
-- Para que Inmovilizaciones → Retenidas separe al moroso (recolección) de quien solo
-- guardó la moto un tiempo (incapacidad/entrega voluntaria) y no lo trate como moroso.
-- "mora" = recolección por incumplimiento · "temporal" = entrega voluntaria/incapacidad.
-- null = sin marcar → cae en el grupo "por mora/retención" por defecto.
alter table public.contratos
  add column if not exists motivo_suspension text;
