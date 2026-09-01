-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 120 — CERRAR LA SEMANA DE NÓMINA, con firma y foto (1-sep-2026)
--
-- EL PROBLEMA (pedido del dueño): "¿dónde está el botón para dejar cerrada la semana?" — no
-- existía. La nómina se RECALCULA cada vez que se abre la pantalla, así que:
--   · un pago que entre mañana puede mover una semana que ya se pagó;
--   · no queda constancia de qué se le pagó a quién, ni cuándo, ni quién lo autorizó;
--   · el cobrador firma un papel que después nadie puede confrontar con el sistema.
--
-- LO QUE GUARDA: el cierre CONGELA las cifras. `total`, `renglones` y `totales_grupo` quedan
-- escritos tal como estaban el día del pago — no se vuelven a calcular nunca. Es el equivalente
-- digital del desprendible firmado.
--
-- CIERRE POR COBRADOR (decisión del dueño): cada uno con SU firma y SU foto. Si uno no aparece
-- hoy, los demás ya quedan pagados; cada quien responde por lo suyo.
--
-- NO SE BORRA NI SE EDITA: es un registro de pago. Sin política de UPDATE ni DELETE — si algo
-- salió mal se cierra de nuevo tras anularlo a mano con rastro, no se reescribe la historia.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

create table if not exists public.nomina_cierres (
  id uuid primary key default gen_random_uuid(),
  /** El lunes de la semana cerrada (la semana de nómina va de lunes a domingo). */
  semana_lunes date not null,
  /** A quién se le pagó. */
  subadmin_id uuid references public.profiles(id),
  /** El nombre tal como estaba el día del pago: si mañana cambia, el recibo no miente. */
  cobrador_nombre text not null,
  /** CONGELADOS el día del cierre — no se recalculan nunca. */
  total numeric not null,
  renglones jsonb not null default '[]'::jsonb,
  totales_grupo jsonb not null default '[]'::jsonb,
  /** Firma del cobrador en pantalla ("recibí conforme") y foto del desprendible en papel. */
  firma_url text,
  foto_url text,
  observacion text,
  /** Quién autorizó el pago. */
  cerrado_por uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  /** Una semana se cierra UNA vez por cobrador. */
  unique (semana_lunes, subadmin_id)
);

comment on table public.nomina_cierres is
  'Semanas de nomina ya pagadas, con las cifras CONGELADAS + firma del cobrador y foto del '
  'desprendible. La nomina se recalcula cada vez que se abre la pantalla; esto deja constancia '
  'de que se pago y de cuanto, para que un pago posterior no mueva lo ya pagado.';

create index if not exists idx_nomina_cierres_semana on public.nomina_cierres (semana_lunes desc);

alter table public.nomina_cierres enable row level security;

-- LEER: quien pueda ver la nomina. El propio cobrador puede ver SUS cierres (su recibo).
drop policy if exists nomina_cierres_select on public.nomina_cierres;
create policy nomina_cierres_select on public.nomina_cierres for select
  using (
    public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA', 'ANALISTA')
    or subadmin_id = auth.uid()
  );

-- CERRAR: solo quien paga.
drop policy if exists nomina_cierres_insert on public.nomina_cierres;
create policy nomina_cierres_insert on public.nomina_cierres for insert
  with check (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL'));

-- Sin UPDATE ni DELETE a proposito: un pago hecho no se reescribe.

-- ─── Verificación ───────────────────────────────────────────────────────────────────────────
select
  (select count(*) from information_schema.tables
    where table_schema='public' and table_name='nomina_cierres')                as tabla,
  (select count(*) from pg_policies where tablename='nomina_cierres')           as politicas;
-- Debe dar: tabla=1 · politicas=2
