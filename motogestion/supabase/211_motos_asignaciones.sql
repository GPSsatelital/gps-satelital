-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 211 — EL LIBRO DE ASIGNACIONES: QUIÉN TUVO CADA MOTO Y DESDE CUÁNDO (2-nov-2026, D-061)
--        (aprobado por el dueño el 2-nov: «Libro de asignaciones» · «Del que la recibe» ·
--         «dale a la que recomiendas»)
--
-- EL PROBLEMA: `motos.subadmin_id` guarda solo el supervisor de HOY. Al pasar una moto a otro, el
-- nombre viejo se borra, y la nómina le pagaba todo lo de esa moto al de hoy: lo de una semana que
-- trabajó el anterior y que todavía no estaba cerrada se le iba al nuevo. El 2-nov entró WILINTON
-- MORA y se le empezaron a pasar motos con la semana del 26-oct sin cerrar (se cierra el 4-nov).
--
-- LO QUE HACE:
--   1. Tabla `motos_asignaciones`: un tramo por cada supervisor que tuvo cada moto (desde → hasta).
--      `desde` null = la tenía desde antes de que existiera el libro · `hasta` null = la tiene hoy ·
--      `subadmin_id` null = sin supervisor.
--   2. Carga inicial: el tramo de hoy de cada moto. Las que cambiaron de supervisor DESPUÉS de la
--      foto del 2-nov a la 1:33 p. m. llevan además su tramo anterior, con el supervisor de la foto
--      (en `motos` ya no está). La foto completa, con fechas: docs/informes-nomina (carpeta privada).
--   3. Disparador: cada vez que cambia `motos.subadmin_id` (o nace una moto) cierra el tramo
--      abierto y abre uno nuevo, con la hora y quién lo hizo. Nadie lo escribe a mano.
--
-- LO QUE NO TOCA: ninguna tabla que ya existe; pasar motos en la pantalla de Motos sigue igual; lo
-- que ve cada supervisor (sus motos de hoy); la plata de los clientes. La nómina lo empieza a leer
-- con el cambio de `nominaCobradores.ts` (el día del cambio cuenta para el que RECIBE la moto).
--
-- Sin llaves hacia `profiles` a propósito: es un registro histórico y no debe impedir nada (ni
-- frenar una asignación porque quien la hizo no tenga perfil).
--
-- CORRERLO cuando nadie esté pasando motos: bloquea `motos` unos segundos mientras carga.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

lock table public.motos in share row exclusive mode;

create table if not exists public.motos_asignaciones (
  id           uuid primary key default gen_random_uuid(),
  moto_id      uuid not null references public.motos(id) on delete cascade,
  subadmin_id  uuid,
  desde        timestamptz,
  hasta        timestamptz,
  cambiado_por uuid,
  created_at   timestamptz not null default now(),
  constraint motos_asignaciones_orden check (desde is null or hasta is null or hasta >= desde)
);

comment on table public.motos_asignaciones is
  'El libro de asignaciones (mig 211): que supervisor tuvo cada moto y desde/hasta cuando. Lo '
  'escribe solo el disparador de motos.subadmin_id. La nomina le paga a quien tenia la moto ese dia.';

-- Una moto tiene un solo tramo abierto (el de hoy).
create unique index if not exists motos_asignaciones_un_abierto
  on public.motos_asignaciones (moto_id) where hasta is null;
create index if not exists motos_asignaciones_moto_desde
  on public.motos_asignaciones (moto_id, desde);

alter table public.motos_asignaciones enable row level security;

-- LEER: quien ve la nómina (mismos roles que `nomina_cierres`) y cada supervisor sus propios tramos.
drop policy if exists motos_asignaciones_select on public.motos_asignaciones;
create policy motos_asignaciones_select on public.motos_asignaciones for select
  using (
    public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA', 'ANALISTA')
    or subadmin_id = auth.uid()
  );
-- Sin INSERT/UPDATE/DELETE a propósito: solo escribe el disparador.

-- ─── CARGA INICIAL (con la foto del 2-nov, 2026-11-02T18:33:52.556Z) ───────────────────────────
do $libro$
begin
  if exists (select 1 from public.motos_asignaciones) then
    raise exception 'El libro ya tiene datos: esta migración ya se corrió. No se cambió nada.';
  end if;

  with foto(placa, subadmin_id) as (
    select unnest(v.placas), v.sub
      from (values
        -- BRANDON ROJAS (94)
        ('4977a753-caae-402c-a41f-2d56b9956d75'::uuid, array['DPU38I', 'DPU39I', 'DPU42I', 'DPU44I', 'DPU45I', 'DPU47I', 'DPU48I', 'DPU49I', 'DPU54I', 'DPU56I',
                 'DPU57I', 'DPU59I', 'DPU60I', 'DPW61L', 'DPW62I', 'DQF55I', 'DQF56I', 'DQF57I', 'DQF58I', 'DQF59I',
                 'DQG87I', 'DQG94I', 'DQL67I', 'DQL74I', 'DQL77I', 'DQL81I', 'DQL82I', 'IEW38I', 'IEW58I', 'IEW61I',
                 'IEW62I', 'IEW63I', 'IEW82I', 'IEW83I', 'IEW87I', 'IEW90I', 'IEW91I', 'IEW92I', 'IEW96I', 'IEW97I',
                 'IEW98I', 'IEW99I', 'IGC37I', 'IGC40I', 'IGC43I', 'IGC45I', 'IGC46I', 'IGC47I', 'IGC49I', 'IGC61I',
                 'IGC62I', 'KEX70H', 'RLT66H', 'RLT70H', 'RLT72H', 'RLT87H', 'RLY54H', 'RLY56H', 'RLZ79H', 'RLZ81H',
                 'RLZ83H', 'RLZ87H', 'RLZ89H', 'RLZ90H', 'RLZ91H', 'RLZ92H', 'RLZ95H', 'RLZ97H', 'RLZ98H', 'RML41H',
                 'RML44H', 'RML45H', 'RML46H', 'RML49H', 'RML54H', 'RML56H', 'RML59H', 'RMM66H', 'RMM70H', 'RMU62H',
                 'RMY17H', 'RMY52H', 'RMY55H', 'RMY88H', 'RMY93H', 'RNK54H', 'XYZ44H', 'XZN81H', 'XZN82H', 'XZN84H',
                 'XZO72H', 'XZT89H', 'XZZ77H', 'YAL59H']),
        -- LUMAR AVENDAÑO PINEDA (78)
        ('0871aca4-06da-49b2-ba40-4f50a13a51a8'::uuid, array['DPU53I', 'DPU55I', 'DQF53I', 'DQF54I', 'DQG96I', 'DQG99I', 'DQL73I', 'DQL80I', 'DQL86I', 'DRO37I',
                 'DRO38I', 'IEW47I', 'IEW48I', 'IEW50I', 'IEW56I', 'IEW64I', 'IEW86I', 'IGA80I', 'IGA82I', 'IGC36I',
                 'IGC41I', 'IGC56I', 'IGC57I', 'IGC59I', 'NHT62I', 'QBF39I', 'QBF40I', 'RLY50H', 'RLZ88H', 'RLZ93H',
                 'RMB51H', 'RML43H', 'RML52H', 'RMY48H', 'RMZ46H', 'RMZ47H', 'RMZ48H', 'RMZ58H', 'RMZ59H', 'RMZ60H',
                 'RMZ61H', 'RMZ62H', 'RMZ63H', 'RMZ64H', 'RMZ65H', 'RMZ66H', 'RMZ67H', 'RMZ68H', 'RMZ69H', 'RNG53H',
                 'RNG54H', 'RNG55H', 'RNG56H', 'RNG57H', 'XYZ46H', 'XYZ47H', 'XYZ48H', 'XYZ49H', 'XYZ50H', 'XYZ53H',
                 'XYZ54H', 'XZN22H', 'XZN23H', 'XZN24H', 'XZN26H', 'XZN27H', 'XZO26H', 'YAL54H', 'YAL55H', 'YAL56H',
                 'YAL57H', 'YAL58H', 'YAV67H', 'YAV68H', 'YAV69H', 'YAV71H', 'YAW70H', 'YAW72H']),
        -- CARLOS ARIZA (100)
        ('bfbe193a-14a9-4b4a-a725-8486024ffcc2'::uuid, array['DPU30I', 'DPU40I', 'DPU43I', 'DPU46I', 'DPU50I', 'DPU51I', 'DPU52I', 'DPU58I', 'DPW33I', 'DPW47I',
                 'DPW63I', 'DPW65I', 'DQF52I', 'DQF60I', 'DQG97I', 'DQL71I', 'DQL76I', 'DQL78I', 'DQL79I', 'DQL84I',
                 'IEW51I', 'IEW52I', 'IEW53I', 'IEW54I', 'IEW55I', 'IEW57I', 'IEW59I', 'IEW60I', 'IEW66I', 'IEW67I',
                 'IEW81I', 'IEW84I', 'IEW88I', 'IEW89I', 'IEW93I', 'IEW94I', 'IEW95I', 'IGC33I', 'IGC34I', 'IGC35I',
                 'IGC38I', 'IGC39I', 'IGC42I', 'IGC44I', 'IGC48I', 'IGC50I', 'IGC51I', 'IGC53I', 'IGC54I', 'IGC55I',
                 'IGC58I', 'IGC60I', 'NHT08I', 'NHT09I', 'NHT24I', 'NHT59I', 'NHT77I', 'NHT99I', 'NIB05I', 'RLT68H',
                 'RLT75H', 'RLT84H', 'RLT86H', 'RLY45H', 'RLY52H', 'RLZ85H', 'RLZ94H', 'RLZ96H', 'RML40H', 'RML42H',
                 'RML48H', 'RML50H', 'RML51H', 'RML53H', 'RML57H', 'RML58H', 'RMM69H', 'RMM71H', 'RMM72H', 'RMU58H',
                 'RMW28H', 'RMY50H', 'RMY53H', 'RNB18H', 'RNK57H', 'RNN29H', 'RNN72H', 'XYZ43H', 'XZN28H', 'XZO09H',
                 'XZT91H', 'XZZ84H', 'YAL60H', 'YAL61H', 'YAL62H', 'YAL63H', 'YAL64H', 'YAL65H', 'YAL66H', 'YAT46H']),
        -- CARLOS ALVAREZ (101)
        ('e7e42979-5d1d-4dfd-85c5-96fa40de30d2'::uuid, array['DQW23I', 'DQW24I', 'DQW25I', 'DQW26I', 'DQW27I', 'EXT59H', 'EXT61H', 'EYQ88H', 'IEW49I', 'IEW80I',
                 'IEW85I', 'IGC30I', 'IGC31I', 'IGC32I', 'IGC52I', 'IGJ71I', 'IGJ72I', 'IGJ73I', 'IGJ74I', 'IGJ75I',
                 'IGJ76I', 'IGJ77I', 'IGJ78I', 'IGJ79I', 'IGJ80I', 'IGJ81I', 'IGJ82I', 'IGJ83I', 'IGJ84I', 'IGJ85I',
                 'IGJ86I', 'IGJ87I', 'IGJ88I', 'IGJ89I', 'IGJ90I', 'IGN01I', 'IGV81I', 'IGV82I', 'IGV84I', 'IGV87I',
                 'MLH39H', 'MLQ75H', 'MMC21H', 'NGY20I', 'NGY21I', 'NGY23I', 'NGY24I', 'NGY26I', 'NGY28I', 'NGY29I',
                 'NGY36I', 'NGY37I', 'NGY38I', 'NGY94I', 'NGY95I', 'NGY97I', 'NGY98I', 'NGY99I', 'NHB34I', 'NHE37I',
                 'NII56I', 'RLI14H', 'RLI25H', 'RLT88H', 'RLZ77H', 'RLZ86H', 'RML47H', 'RML55H', 'RMM68H', 'RMM73H',
                 'RMY46H', 'XZI01H', 'XZI02H', 'XZI03H', 'XZI04H', 'XZI05H', 'XZI06H', 'XZI07H', 'XZI08H', 'XZI09H',
                 'XZI10H', 'XZI11H', 'XZI12H', 'XZI13H', 'XZI14H', 'XZI15H', 'XZI17H', 'XZI19H', 'XZN20H', 'XZN21H',
                 'XZN83H', 'XZP35H', 'XZZ68H', 'XZZ69H', 'XZZ70H', 'YAC80H', 'YAL67H', 'YAL68H', 'ZHO34G', 'ZHO35G',
                 'ZIB64G']),
        -- WILINTON MORA (2)
        ('c4b021b0-5132-4f1c-a8e3-a61065b1c393'::uuid, array['NHT27I', 'NHT95I'])
      ) as v(sub, placas)
  ),
  m as (
    select mo.id,
           mo.subadmin_id                                              as hoy,
           mo.subadmin_asignado_desde                                  as desde_hoy,
           mo.updated_at,
           mo.created_at <= timestamptz '2026-11-02T18:33:52.556Z'  as estaba_en_la_foto,
           f.subadmin_id                                               as en_la_foto
      from public.motos mo
      left join foto f on f.placa = mo.placa
  ),
  cambio as (     -- cambiaron de supervisor entre la foto y esta migración
    select id, en_la_foto, coalesce(desde_hoy, updated_at) as cuando
      from m
     where estaba_en_la_foto and hoy is distinct from en_la_foto
  )
  insert into public.motos_asignaciones (moto_id, subadmin_id, desde, hasta)
  select id, en_la_foto, null, cuando from cambio                       -- el tramo de antes (la foto)
  union all
  select m.id, m.hoy, coalesce(c.cuando, m.desde_hoy), null             -- el tramo de hoy
    from m left join cambio c on c.id = m.id;
end
$libro$;

-- ─── EL DISPARADOR: anota cada cambio de supervisor ─────────────────────────────────────────
create or replace function public.anotar_asignacion_moto()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.subadmin_id is not distinct from new.subadmin_id then
    return new;
  end if;
  update public.motos_asignaciones
     set hasta = now()
   where moto_id = new.id and hasta is null;
  insert into public.motos_asignaciones (moto_id, subadmin_id, desde, cambiado_por)
  values (new.id, new.subadmin_id, now(), auth.uid());
  return new;
end;
$$;

drop trigger if exists trg_anotar_asignacion_moto on public.motos;
create trigger trg_anotar_asignacion_moto
  after insert or update of subadmin_id on public.motos
  for each row execute function public.anotar_asignacion_moto();

select public.registrar_migracion(211, '211_motos_asignaciones.sql',
  'El libro de asignaciones: quién tuvo cada moto y desde cuándo');

commit;

-- ── VERIFICACIÓN (correr después) ──────────────────────────────────────────────────────────────
-- Debe dar: motos = tramos_abiertos · no_coinciden 0 · disparador 1. «cambiadas» lista las motos
-- que se pasaron de supervisor después de la foto de la 1:33 p. m. (vacío si no hubo ninguna).
select
  (select count(*) from public.motos)                                         as motos,
  (select count(*) from public.motos_asignaciones where hasta is null)         as tramos_abiertos,
  (select count(*) from public.motos_asignaciones where hasta is not null)     as tramos_anteriores,
  (select count(*) from public.motos mo
     left join public.motos_asignaciones a on a.moto_id = mo.id and a.hasta is null
    where a.id is null or a.subadmin_id is distinct from mo.subadmin_id)       as no_coinciden,
  (select count(*) from pg_trigger where tgname = 'trg_anotar_asignacion_moto') as disparador,
  (select string_agg(mo.placa || ': ' || coalesce(pa.nombre, 'sin supervisor') || ' a '
                     || coalesce(ph.nombre, 'sin supervisor'), ' · ' order by mo.placa)
     from public.motos_asignaciones a
     join public.motos mo on mo.id = a.moto_id
     left join public.profiles pa on pa.id = a.subadmin_id
     left join public.motos_asignaciones b on b.moto_id = a.moto_id and b.hasta is null
     left join public.profiles ph on ph.id = b.subadmin_id
    where a.hasta is not null)                                                 as cambiadas;
