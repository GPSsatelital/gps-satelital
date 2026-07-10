-- 043: EMPALME de clientes migrados — ahorro de apertura separado + estado de cierre
-- ─────────────────────────────────────────────────────────────────────────────────
-- Modelo aprobado (10-jul-2026): todo contrato migrado queda "empalme pendiente" hasta
-- que un funcionario revisa sus cifras CON el cliente presente y confirma la migración.
-- Mientras el empalme está abierto:
--   · ahorro_apertura  = ahorro que traía de ANTES del sistema (editable)
--   · ahorro_acumulado = SOLO lo nuevo generado por pagos dentro del sistema
--   · el total mostrado en la app = apertura + acumulado
-- Al confirmar (desde el panel de empalme en Cartera): apertura se consolida en
-- acumulado (apertura→0, rastro en contratos_auditoria), las deudas de apertura se
-- bloquean y el badge desaparece. Aplica retroactivo a PRADERA/RASTREADOR.

-- 1) Campos nuevos
alter table public.contratos
  add column if not exists ahorro_apertura numeric not null default 0,
  add column if not exists empalme_cerrado boolean not null default false,
  add column if not exists empalme_cerrado_por uuid references public.profiles(id),
  add column if not exists empalme_cerrado_fecha timestamptz;

-- 2) Backfill de los migrados existentes (PRADERA + RASTREADOR):
-- separar el ahorro viejo del nuevo. Cada pago del sistema guarda su ahorro exacto en
-- aplicado_ahorro, así que:
--   apertura  = acumulado actual − Σ aplicado_ahorro de sus pagos Confirmados
--   acumulado = solo esa Σ (lo generado dentro del sistema)
-- greatest(...,0) protege contra redondeos si algún dato viejo quedara descuadrado.
with ahorro_sistema as (
  select contrato_id, coalesce(sum(coalesce(aplicado_ahorro, 0)), 0) as nuevo
  from public.pagos
  where estado = 'Confirmado'
  group by contrato_id
)
update public.contratos c
set ahorro_apertura = greatest(c.ahorro_acumulado - coalesce(a.nuevo, 0), 0),
    ahorro_acumulado = least(coalesce(a.nuevo, 0), c.ahorro_acumulado)
from ahorro_sistema a
where a.contrato_id = c.id
  and c.es_migrado = true
  and c.empalme_cerrado = false;

-- Migrados sin ningún pago en el sistema: todo su ahorro es de apertura.
update public.contratos c
set ahorro_apertura = c.ahorro_acumulado,
    ahorro_acumulado = 0
where c.es_migrado = true
  and c.empalme_cerrado = false
  and c.ahorro_apertura = 0
  and c.ahorro_acumulado > 0
  and not exists (
    select 1 from public.pagos p
    where p.contrato_id = c.id and p.estado = 'Confirmado'
  );

-- 3) Índice para el badge (listas filtran por empalme pendiente)
create index if not exists idx_contratos_empalme
  on public.contratos(empalme_cerrado) where es_migrado = true;

-- 4) Función de cierre del empalme — atómica y con auditoría (security definer para
-- que SECRETARIA también pueda cerrar aunque alguna política se endurezca después).
-- Consolida apertura→acumulado, sella el contrato y deja rastro de las cifras.
create or replace function public.cerrar_empalme(p_contrato_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rol text := public.mi_rol();
  v_apertura numeric;
  v_acumulado numeric;
begin
  if v_rol not in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA') then
    raise exception 'Solo ADMIN, ADMIN_PRINCIPAL o SECRETARIA pueden confirmar la migración';
  end if;

  select ahorro_apertura, ahorro_acumulado into v_apertura, v_acumulado
  from public.contratos
  where id = p_contrato_id and es_migrado = true and empalme_cerrado = false
  for update;

  if not found then
    raise exception 'El contrato no está pendiente de empalme';
  end if;

  update public.contratos
  set ahorro_acumulado = v_acumulado + v_apertura,
      ahorro_apertura = 0,
      empalme_cerrado = true,
      empalme_cerrado_por = auth.uid(),
      empalme_cerrado_fecha = now()
  where id = p_contrato_id;

  insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por)
  values (
    p_contrato_id,
    'empalme_cerrado',
    'apertura=' || v_apertura::text || ' + acumulado=' || v_acumulado::text,
    'consolidado=' || (v_apertura + v_acumulado)::text,
    auth.uid()
  );
end;
$$;
