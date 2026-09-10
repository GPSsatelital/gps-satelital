-- 140 — TAREAS ASIGNADAS: el trabajo puntual que alguien le monta a otro
--
-- Pedido del dueño (10-sep-2026): *"¿podemos agregar algo donde se le monten tareas específicas
-- diferentes a las del día a día, y que las marquen como cumplidas y si es caso dejar evidencias
-- dependiendo de cuál sea la tarea?"* — ver `docs/FLUJO-DIARIO.md`.
--
-- Son las que el sistema NO genera solo: recoger una tarjeta de propiedad, ir a buscar una moto que
-- no cumplió la cita, verificar una dirección, llevar algo al taller. Hoy no existe dónde ponerlas,
-- así que se piden por WhatsApp y no queda rastro de si se hicieron.
--
-- CAPA NUEVA, NO TOCA NADA: ninguna tabla existente se modifica. Si algo saliera mal, se borra esta
-- tabla y el sistema queda exactamente como estaba.
--
-- Las tres reglas que el dueño cerró:
--   1. Asignan ADMIN_PRINCIPAL y ADMIN. La secretaria más adelante — por eso el permiso es una
--      ACCIÓN (`asignar_tarea`), no un rol quemado: dárselo a Ángela será marcar una casilla.
--   2. Evidencias: foto · ubicación · comentario · firma, y dijo "abierto a más posibilidades" —
--      por eso van como DATOS en un arreglo, no clavadas en el código ni en un CHECK cerrado.
--   3. "No se pudo" es un estado APARTE de "cumplida", con motivo obligatorio (lo exige un CHECK,
--      no solo la pantalla): para que nadie marque cumplido lo que no hizo.

create table if not exists public.tareas (
  id uuid primary key default gen_random_uuid(),

  titulo text not null,
  detalle text,

  -- A quién le toca y quién se la mandó.
  asignada_a  uuid not null references public.profiles(id),
  asignada_por uuid not null references public.profiles(id),

  -- Sobre qué es. Los tres son OPCIONALES: "llevar los documentos al contador" es una tarea válida
  -- y no tiene placa. Cuando sí van, sirven para abrir la ficha desde la tarea.
  contrato_id uuid references public.contratos(id) on delete set null,
  moto_id     uuid references public.motos(id)     on delete set null,
  cliente_id  uuid references public.clientes(id)  on delete set null,

  -- Para cuándo. Opcional; la pantalla propone hoy. Vencida sin resolver = roja para quien la mandó.
  fecha_limite date,

  -- Qué evidencia exige ESTA tarea. Arreglo abierto a propósito (regla 2).
  evidencias_requeridas text[] not null default '{}',

  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'cumplida', 'no_se_pudo', 'cancelada')),

  -- El resultado, con su evidencia. Se llena al resolverla.
  resultado_comentario text,
  resultado_fotos      text[] not null default '{}',
  resultado_ubicacion  jsonb,
  resultado_firma_url  text,
  motivo_no_se_pudo    text,
  resuelta_el          timestamptz,
  resuelta_por         uuid references public.profiles(id),

  created_at timestamptz not null default now(),

  -- El candado de la regla 3: no se puede cerrar como "no se pudo" sin decir por qué.
  constraint tareas_no_se_pudo_con_motivo
    check (estado <> 'no_se_pudo' or coalesce(btrim(motivo_no_se_pudo), '') <> '')
);

create index if not exists tareas_asignada_a_idx on public.tareas (asignada_a, estado);
create index if not exists tareas_asignada_por_idx on public.tareas (asignada_por, estado);
create index if not exists tareas_contrato_idx on public.tareas (contrato_id);

-- ── El permiso ───────────────────────────────────────────────────────────────────────────────
-- `_acciones_default()` (mig 048) da el techo por rol. Se vuelve a escribir COMPLETA desde la
-- definición VIVA de la base para no perder nada de lo que otras migraciones le agregaron — la
-- lección de la mig 124, que reescribió dos triggers copiándolos de un archivo viejo y borró lo
-- que la 116 les había puesto. Acá solo se AÑADE 'asignar_tarea' a ADMIN y ADMIN_PRINCIPAL.
do $$
declare def text; nueva text;
begin
  select pg_get_functiondef(p.oid) into def
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = '_acciones_default';

  if def is null then
    raise exception 'No existe public._acciones_default — revisar la mig 048 antes de seguir.';
  end if;

  if def like '%asignar_tarea%' then
    raise notice 'asignar_tarea ya estaba: no se toca.';
    return;
  end if;

  -- Se engancha al final de los arreglos de ADMIN_PRINCIPAL y ADMIN, que hoy cierran con
  -- 'editar_configuracion'. Todo lo demás de la función queda intacto porque se parte de su
  -- definición VIVA, no de una copia.
  nueva := replace(def, '''editar_configuracion'']', '''editar_configuracion'',''asignar_tarea'']');

  -- Si el ancla ya no existe (otra migración cambió el final de esos arreglos), FALLA en vez de
  -- dejar el permiso a medias en silencio: sin esto, Sergio no podría asignar y nadie sabría por qué.
  if nueva = def then
    raise exception 'No se encontró dónde enganchar asignar_tarea en _acciones_default. Revisar su definición actual y hacerlo a mano.';
  end if;

  execute nueva;
  raise notice 'asignar_tarea agregado a ADMIN_PRINCIPAL y ADMIN.';
end $$;

-- ── RLS ──────────────────────────────────────────────────────────────────────────────────────
-- Sin esto cualquiera con sesión abierta leería y escribiría tareas de otros desde el navegador.
alter table public.tareas enable row level security;

drop policy if exists "Tareas: ver las mias y las que mande" on public.tareas;
create policy "Tareas: ver las mias y las que mande"
  on public.tareas for select to authenticated
  using (
    public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL')
    or asignada_a = auth.uid()
    or asignada_por = auth.uid()
  );

-- Crear: SOLO quien tenga el permiso, y siempre firmando con su propio nombre (`asignada_por`
-- tiene que ser él): así nadie puede montar una tarea a nombre de otro.
drop policy if exists "Tareas: crear solo con permiso" on public.tareas;
create policy "Tareas: crear solo con permiso"
  on public.tareas for insert to authenticated
  with check (public.puede_accion('asignar_tarea') and asignada_por = auth.uid());

-- Actualizar: el asignado resuelve las SUYAS; quien la mandó (o un admin) puede corregirla o
-- cancelarla. El `with check` repite la condición para que nadie se la pase a otro al editar.
drop policy if exists "Tareas: resolver las mias, editar las que mande" on public.tareas;
create policy "Tareas: resolver las mias, editar las que mande"
  on public.tareas for update to authenticated
  using (
    public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL')
    or asignada_a = auth.uid()
    or asignada_por = auth.uid()
  )
  with check (
    public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL')
    or asignada_a = auth.uid()
    or asignada_por = auth.uid()
  );

-- Borrar no: una tarea no se borra, se CANCELA. Así queda el rastro de que se pidió.

-- ═══ VERIFICACIÓN ═══
-- a) La tabla y sus candados.
select column_name, data_type, is_nullable
  from information_schema.columns
 where table_schema = 'public' and table_name = 'tareas'
 order by ordinal_position;

-- b) Las tres políticas.
select policyname, cmd from pg_policies
 where schemaname = 'public' and tablename = 'tareas' order by policyname;

-- c) El permiso quedó en los dos roles (debe salir true en ambos).
select 'ADMIN_PRINCIPAL' as rol, 'asignar_tarea' = any(public._acciones_default('ADMIN_PRINCIPAL')) as puede
union all
select 'ADMIN', 'asignar_tarea' = any(public._acciones_default('ADMIN'))
union all
select 'SECRETARIA (debe dar false por ahora)', 'asignar_tarea' = any(public._acciones_default('SECRETARIA'));

-- d) El candado del motivo: esta consulta DEBE fallar con "tareas_no_se_pudo_con_motivo".
--    Descoméntala solo si quieres comprobarlo; da error a propósito.
-- insert into public.tareas (titulo, asignada_a, asignada_por, estado)
-- values ('prueba', auth.uid(), auth.uid(), 'no_se_pudo');
