-- 146 — AVISOS AL CELULAR: dónde se guarda a qué aparato hay que avisarle
--
-- Fase 5 de docs/FLUJO-DIARIO.md. Con los pendientes ya en el servidor (migs 142-145) por fin hay
-- QUÉ avisar; faltaba POR DÓNDE. Esto es la libreta de direcciones.
--
-- Cada fila es UN APARATO, no una persona: alguien puede tener el celular y el computador, y cada
-- uno tiene su propia dirección de entrega. Por eso la llave real es el `endpoint` — la dirección
-- que le da el navegador a ese aparato — y no el usuario.
--
-- 🔴 QUÉ SE GUARDA Y QUÉ NO. Se guardan tres cadenas que el navegador entrega: la dirección y dos
-- llaves de cifrado. Con ellas SOLO se le puede mandar un aviso a ese aparato — no se puede leer
-- nada de él, ni saber dónde está, ni abrir nada. Si alguien se llevara esta tabla, lo peor que
-- podría hacer es mandarle una notificación a alguien... si además tuviera la llave privada del
-- envío, que no vive en la base sino en los secretos.

create table if not exists public.push_dispositivos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  aparato text,
  fallos int not null default 0,
  ultimo_ok timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_push_usuario on public.push_dispositivos(usuario_id);

alter table public.push_dispositivos enable row level security;

-- Cada quien maneja SUS aparatos y nada más. Ni siquiera el admin necesita ver los ajenos: esto
-- no es información de la operación, es la configuración del teléfono de cada persona.
drop policy if exists "Push: cada quien ve sus aparatos" on public.push_dispositivos;
create policy "Push: cada quien ve sus aparatos"
  on public.push_dispositivos for select to authenticated
  using (usuario_id = auth.uid());

drop policy if exists "Push: cada quien registra su aparato" on public.push_dispositivos;
create policy "Push: cada quien registra su aparato"
  on public.push_dispositivos for insert to authenticated
  with check (usuario_id = auth.uid());

drop policy if exists "Push: cada quien actualiza su aparato" on public.push_dispositivos;
create policy "Push: cada quien actualiza su aparato"
  on public.push_dispositivos for update to authenticated
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

drop policy if exists "Push: cada quien apaga su aparato" on public.push_dispositivos;
create policy "Push: cada quien apaga su aparato"
  on public.push_dispositivos for delete to authenticated
  using (usuario_id = auth.uid());

comment on table public.push_dispositivos is
  'A qué aparatos hay que mandarles los avisos. Una fila por aparato (celular, computador), no por persona. La llave privada del envío NO vive acá: está en los secretos de Supabase. Ver docs/FLUJO-DIARIO.md fase 5.';

-- ═══ VERIFICACIÓN ═══
-- a) La tabla quedó y está protegida (debe decir true).
select relrowsecurity as protegida from pg_class where relname = 'push_dispositivos';

-- b) Las cuatro políticas.
select policyname, cmd from pg_policies
 where tablename = 'push_dispositivos' order by cmd;

-- c) Todavía sin aparatos: da 0 hasta que alguien toque "Activar" en su celular.
select count(*) as aparatos_registrados from public.push_dispositivos;
