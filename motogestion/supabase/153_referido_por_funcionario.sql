-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 153 — QUIÉN DEL EQUIPO TRAJO A ESTE CLIENTE (15-sep-2026)
--
-- Pedido del dueño: *"si alguno tiene un referido propio recomendado por él, que se agregue
-- adicional $30.000"* — o sea, el funcionario que consigue un cliente nuevo cobra $30.000 en su
-- nómina, aparte de lo que cobre después por gestionarlo.
--
-- EL HUECO QUE TAPA: hoy NADA liga un cliente con el funcionario que lo trajo.
--   · `clientes.referido_por_cedula` / `referido_por_nombre` → es otro CLIENTE (el programa de
--     premios: guantes, intercomunicador, casco). No sirve: ahí no hay a quién pagarle nómina.
--   · `referidos` (mig 010) → también cliente↔cliente, por el mismo programa.
--   · `clientes.fuente_llegada` → texto libre. Nadie puede pagar con base en un texto a mano.
-- Por eso hace falta una columna propia que apunte a una PERSONA del equipo.
--
-- CUÁNDO SE PAGA: en la semana en que el cliente RECIBE la moto, igual que la visita domiciliaria
-- y que el programa de referidos entre clientes ("referido confirmado = cuando el nuevo cliente
-- recibe su moto"). Antes de la entrega no hay nada que pagar: el negocio todavía no existe.
--
-- Es aditiva: un cliente sin este dato se comporta exactamente como hoy.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

alter table public.clientes
  add column if not exists referido_por_funcionario uuid references public.profiles(id);

comment on column public.clientes.referido_por_funcionario is
  'Funcionario del equipo que trajo a este cliente. Le paga $30.000 en la nomina de la semana en '
  'que el cliente recibe la moto (mig 153). NO confundir con referido_por_cedula, que es otro '
  'CLIENTE y pertenece al programa de premios.';

-- Para armar la nomina se busca por funcionario; sin indice serian 300+ filas recorridas cada vez.
create index if not exists idx_clientes_referido_funcionario
  on public.clientes(referido_por_funcionario)
  where referido_por_funcionario is not null;

-- ─── VERIFICACIÓN — pegar después, debe dar 1 ────────────────────────────────────────────────
-- select count(*) from information_schema.columns
-- where table_schema = 'public' and table_name = 'clientes'
--   and column_name = 'referido_por_funcionario';
