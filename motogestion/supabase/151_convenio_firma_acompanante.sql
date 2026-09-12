-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 151 — LA ACOMPAÑANTE TAMBIÉN FIRMA EL ACUERDO DE PAGO (12-sep-2026)
--
-- Pedido del dueño: "al iniciar un convenio salga una opción para que la acompañante también
-- pueda firmar un convenio igual que como si fuera el titular". Firma en calidad de
-- **CODEUDORA SOLIDARIA** (decisión suya, 12-sep): responde por la deuda en las mismas
-- condiciones que el titular, no como testigo.
--
-- Hasta hoy el acuerdo guardaba UNA sola firma (`firma_url`, la del titular). La acompañante ya
-- existe desde el registro del cliente (nombre, cédula, teléfono, huella y documentos), pero no
-- tenía dónde firmar nada.
--
-- TRES COLUMNAS. No toca el cálculo del convenio, ni las cuotas, ni el motor de reparto.
--
--   firma_acompanante_url  — su firma, en el mismo bucket `documentos` que la del titular
--   acompanante_nombre     — CONGELADOS al firmar, a propósito: el papel que firmó hace seis
--   acompanante_cedula       meses tiene que seguir diciendo quién firmó, aunque después le
--                            editen los datos al cliente.
--
-- La firma es OPCIONAL: si el cliente no tiene acompañante registrada, la casilla ni aparece;
-- si la tiene pero no firma, el convenio se crea igual (como hasta hoy).
-- ═══════════════════════════════════════════════════════════════════════════════════════════

alter table public.convenios
  add column if not exists firma_acompanante_url text,
  add column if not exists acompanante_nombre    text,
  add column if not exists acompanante_cedula    text;

comment on column public.convenios.firma_acompanante_url is
  'Firma de la acompañante como CODEUDORA SOLIDARIA del acuerdo. null = no firmó (mig 151).';
comment on column public.convenios.acompanante_nombre is
  'Nombre de la acompañante tal como estaba al firmar. Congelado a propósito (mig 151).';
comment on column public.convenios.acompanante_cedula is
  'Cédula de la acompañante tal como estaba al firmar. Congelada a propósito (mig 151).';

-- VERIFICACIÓN — pegar después, esperar 3:
--   select count(*) from information_schema.columns
--   where table_schema = 'public' and table_name = 'convenios'
--     and column_name in ('firma_acompanante_url', 'acompanante_nombre', 'acompanante_cedula');
