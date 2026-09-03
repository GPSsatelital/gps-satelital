-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 121 — CANDADO POR MOTO en las dos tablas de préstamos (2-sep-2026)
--
-- POR QUÉ: auditoría del rol SUBADMIN antes de dar de alta dos cobradores más. De las 26 tablas,
-- estas dos eran las únicas que le daban `ALL` (que incluye DELETE) SIN filtrar por sus motos:
--
--   · prestamos_llave_tarjeta — `tarjetas_llaves` ES un módulo del SUBADMIN
--   · prestamos_reemplazo     — se lee desde Inmovilizaciones, Alertas, Cobro Diario, Dashboard
--                               y las dos fichas, todas visibles para él
--
-- La pantalla filtra con useScope, pero abajo no había red: con la sesión abierta se podían leer,
-- editar y BORRAR préstamos de motos ajenas. No es fuga de datos de clientes (eso ya estaba
-- cerrado) — es poder borrar rastro ajeno, que en un sistema de control cuesta igual.
--
-- Con una sola persona en el rol casi no se notaba. Con tres, sí.
--
-- QUÉ CAMBIA para el SUBADMIN: solo ve y toca los préstamos de SUS motos. Y BORRAR pasa a ser
-- exclusivo de ADMIN/ADMIN_PRINCIPAL — un registro de préstamo es rastro, no un borrador.
-- Para los demás roles NO cambia nada.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

-- ── prestamos_llave_tarjeta ─────────────────────────────────────────────────────────────────
do $$ declare r record; begin
  for r in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'prestamos_llave_tarjeta'
  loop execute format('drop policy if exists %I on public.prestamos_llave_tarjeta', r.policyname); end loop;
end $$;

create policy prestamos_llave_select on public.prestamos_llave_tarjeta for select
  using (
    public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA', 'ANALISTA')
    or (public.mi_rol() = 'SUBADMIN' and moto_id in (select public.mis_moto_ids_subadmin()))
  );

create policy prestamos_llave_insert on public.prestamos_llave_tarjeta for insert
  with check (
    public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and moto_id in (select public.mis_moto_ids_subadmin()))
  );

create policy prestamos_llave_update on public.prestamos_llave_tarjeta for update
  using (
    public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and moto_id in (select public.mis_moto_ids_subadmin()))
  );

-- Borrar un préstamo es borrar rastro: solo la cabeza.
create policy prestamos_llave_delete on public.prestamos_llave_tarjeta for delete
  using (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL'));

-- ── prestamos_reemplazo ─────────────────────────────────────────────────────────────────────
-- OJO: acá el scope mira TRES columnas, no una. La moto prestada sale del pool y puede ser de
-- otro cobrador, así que filtrar solo por contrato dejaría al subadmin sin ver que SU moto está
-- prestada — o sin ver el préstamo que él mismo hizo.
do $$ declare r record; begin
  for r in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'prestamos_reemplazo'
  loop execute format('drop policy if exists %I on public.prestamos_reemplazo', r.policyname); end loop;
end $$;

create policy prestamos_reemplazo_select on public.prestamos_reemplazo for select
  using (
    public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA', 'ANALISTA')
    or (public.mi_rol() = 'SUBADMIN' and (
          contrato_id       in (select public.mis_contratos_subadmin())
       or moto_prestada_id  in (select public.mis_moto_ids_subadmin())
       or moto_original_id  in (select public.mis_moto_ids_subadmin())
    ))
  );

create policy prestamos_reemplazo_insert on public.prestamos_reemplazo for insert
  with check (
    public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and (
          contrato_id       in (select public.mis_contratos_subadmin())
       or moto_original_id  in (select public.mis_moto_ids_subadmin())
    ))
  );

create policy prestamos_reemplazo_update on public.prestamos_reemplazo for update
  using (
    public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and (
          contrato_id       in (select public.mis_contratos_subadmin())
       or moto_prestada_id  in (select public.mis_moto_ids_subadmin())
       or moto_original_id  in (select public.mis_moto_ids_subadmin())
    ))
  );

create policy prestamos_reemplazo_delete on public.prestamos_reemplazo for delete
  using (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL'));

-- ─── Verificación ───────────────────────────────────────────────────────────────────────────
select
  tablename                                                              as tabla,
  count(*)                                                               as politicas,
  count(*) filter (where cmd = 'DELETE')                                 as tiene_delete_propio,
  count(*) filter (where coalesce(qual::text, with_check::text) like '%subadmin%') as con_scope
from pg_policies
where schemaname = 'public'
  and tablename in ('prestamos_llave_tarjeta', 'prestamos_reemplazo')
group by tablename
order by tablename;
-- Debe dar, para cada tabla: politicas=4 · tiene_delete_propio=1 · con_scope=3
