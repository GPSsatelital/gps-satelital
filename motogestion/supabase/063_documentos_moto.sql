-- ===== 063: documentos escaneados de la moto (tarjeta de propiedad + SOAT) =====
-- Al conductor se le entrega una COPIA ESCANEADA de la tarjeta (la física se queda en la
-- empresa / a cargo del funcionario) — por eso hay que escanearla y guardarla. La tarjeta se
-- escanea por sus dos caras (frente + reverso) para poder imprimir ambas en una sola hoja; el
-- SOAT suele ser una sola página. Guardado como URLs en jsonb: {tarjeta_frente, tarjeta_reverso, soat}.

alter table public.motos
  add column if not exists documentos_moto jsonb not null default '{}'::jsonb;
