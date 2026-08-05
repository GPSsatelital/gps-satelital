-- ===== 080: cuentas bancarias de la empresa =====
--
-- Hasta hoy las cuentas a las que los clientes transfieren NO existían en el sistema: vivían
-- en la cabeza de la gente. Eso tenía tres costos:
--   1. Al anotar una transferencia sin identificar, el grupo (portafolio) se heredaba del
--      filtro que la pantalla tuviera puesto — un accidente, no un dato.
--   2. Al cerrar caja, la secretaria tiene que separar el extracto a mano, grupo por grupo.
--   3. No hay forma de decirle a un cliente "págale a esta cuenta" desde la app.
--
-- MODELO: una cuenta puede recibir de VARIOS grupos (`grupos text[]`). No es "una cuenta = un
-- grupo": el Nequi de RASTREADOR y USADAS es el mismo. Y un grupo puede tener varias cuentas
-- (COSTA usa Bancolombia y Nequi). Por eso el arreglo y no una FK simple.
--
-- Cuando una cuenta tiene UN solo grupo, saber la cuenta equivale a saber el portafolio.
-- Cuando tiene dos o más, no se puede deducir — y ahí "todavía no se sabe" es la respuesta
-- honesta, hasta que el cliente reclame la plata y su contrato lo diga.

create table if not exists public.cuentas_bancarias (
  id uuid primary key default gen_random_uuid(),
  banco text not null,                    -- 'Bancolombia', 'Nequi', ...
  tipo text,                              -- 'Ahorros', 'Corriente', 'Nequi'
  numero text not null,                   -- el número que se le da al cliente
  titular text,                           -- a nombre de quién está
  grupos text[] not null default '{}',    -- qué portafolios reciben en esta cuenta
  activa boolean not null default true,   -- se desactiva, no se borra: el histórico la nombra
  orden int not null default 0,           -- para mandar primero la principal al cliente
  created_at timestamptz not null default now()
);

-- Los grupos deben ser portafolios reales; un typo aquí manda plata a un bolsillo que no existe.
alter table public.cuentas_bancarias drop constraint if exists cuentas_grupos_validos;
alter table public.cuentas_bancarias add constraint cuentas_grupos_validos
  check (grupos <@ array['COSTA','PRADERA','RASTREADOR','USADAS','OTRO']::text[]);

create index if not exists idx_cuentas_activa on public.cuentas_bancarias(activa);

alter table public.cuentas_bancarias enable row level security;

-- LECTURA: todo el personal. Quien cobra necesita saber a qué cuenta mandar al cliente.
drop policy if exists "cuentas_lectura_staff" on public.cuentas_bancarias;
create policy "cuentas_lectura_staff" on public.cuentas_bancarias for select to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA','SUBADMIN','VISITADOR'));

-- ESCRITURA: solo la cabeza. Aquí se define a dónde llega la plata de la empresa; si alguien
-- pudiera cambiar un número de cuenta, podría desviar los pagos de los clientes.
drop policy if exists "cuentas_escritura_admin" on public.cuentas_bancarias;
create policy "cuentas_escritura_admin" on public.cuentas_bancarias for all to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL'))
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL'));

alter publication supabase_realtime add table public.cuentas_bancarias;
