-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 189 — BORRAR UNA DEUDA VUELVE A DEJAR RASTRO (6-oct-2026, dueño: "arregla lo del borrar una deuda")
--
-- LO QUE SE ENCONTRÓ: la mig 101 (rastro "Deuda ELIMINADA" en el historial del contrato al borrar una
-- deuda) no está viva en producción. No hay ni un renglón "Deuda ELIMINADA" en toda la base, y al
-- borrar la deuda de LIQ-0032 (mig 188) no se creó. La app tiene UN solo botón que borra deudas
-- (Cartera → la deuda → eliminar, `eliminarDeuda` en useDeudas.ts) y es un DELETE pelado: contaba con
-- que la base dejara el rastro.
--
-- QUÉ HACE:
--   1. Si la función `auditar_deuda_borrada` ya existe en la base, NO la reescribe (lección de la mig
--      124: lo vivo manda sobre el archivo). Si no existe, la crea igual que en la mig 101.
--   2. Engancha el disparador a la tabla de deudas (si ya estaba, lo vuelve a poner igual).
--   3. LA PRUEBA: crea una deuda de mentira, la borra, comprueba que quedó el renglón en el historial
--      y DESHACE la prueba (ni la deuda ni el renglón quedan). Si no dejó rastro, se detiene y no
--      guarda nada.
--   No toca ninguna deuda, ningún pago ni ninguna cifra.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   drop trigger if exists trg_auditar_deuda_borrada on public.deudas;
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

do $fix$
declare
  v_contrato_prueba constant uuid := 'ab4ecdec-9e43-457e-bc98-6629c47898d8';  -- ANDRÉS (la prueba se deshace)
  v_id    uuid;
  v_dejo  boolean := false;
  v_existia boolean;
begin
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                  where n.nspname = 'public' and p.proname = 'auditar_deuda_borrada') into v_existia;

  if not v_existia then
    execute $q$
      create function public.auditar_deuda_borrada()
      returns trigger
      language plpgsql
      security definer
      set search_path = public
      as $body$
      begin
        -- auth.uid() queda en null si el borrado NO vino de la app (SQL Editor, llave de servicio).
        insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por)
        values (
          old.contrato_id,
          'Deuda ELIMINADA',
          old.concepto
            || ' — ' || coalesce(nullif(btrim(old.descripcion), ''), '(sin descripción)')
            || ' · pendiente $' || replace(to_char(old.monto_pendiente, 'FM999,999,999,999'), ',', '.')
            || ' de $'          || replace(to_char(old.monto,           'FM999,999,999,999'), ',', '.')
            || ' · estaba ' || old.estado
            || ' · creada el ' || to_char(old.created_at at time zone 'America/Bogota', 'DD/MM/YYYY'),
          '(eliminada)',
          auth.uid()
        );
        return old;
      end;
      $body$
    $q$;
  end if;

  drop trigger if exists trg_auditar_deuda_borrada on public.deudas;
  create trigger trg_auditar_deuda_borrada
    before delete on public.deudas
    for each row execute function public.auditar_deuda_borrada();

  -- ── La prueba, que se deshace sola ────────────────────────────────────────────────────────
  begin
    insert into public.deudas (contrato_id, concepto, descripcion, monto, monto_pendiente, estado, registrado_por)
    values (v_contrato_prueba, 'otro', 'PRUEBA mig 189 — se borra sola', 1, 1, 'pendiente', 'a68f065b-3a59-4c67-bd2e-45c6abc30fdb')
    returning id into v_id;
    delete from public.deudas where id = v_id;
    select exists (select 1 from public.contratos_auditoria
                    where contrato_id = v_contrato_prueba and campo = 'Deuda ELIMINADA'
                      and valor_anterior like '%PRUEBA mig 189%') into v_dejo;
    raise exception 'deshacer la prueba';
  exception when others then
    if sqlerrm <> 'deshacer la prueba' then raise; end if;
  end;

  if not v_dejo then
    raise exception '189 ABORTADA: el disparador quedó puesto pero la prueba NO dejó rastro. NO se guardó nada.';
  end if;

  raise notice 'LISTO: % función; disparador puesto; la prueba dejó rastro y se deshizo.',
    case when v_existia then 'se conservó la' else 'se creó la' end;
end
$fix$;

select public.registrar_migracion(189, '189_rastro_al_borrar_deuda.sql',
  'Borrar una deuda vuelve a dejar el renglón "Deuda ELIMINADA" en el historial (la mig 101 no estaba viva)');

commit;

-- ─── VERIFICACIÓN — debe salir trg_auditar_deuda_borrada, activa = O, y 0 deudas de prueba ───
select tgname as proteccion, tgenabled as activa,
       (select count(*) from public.deudas where descripcion like 'PRUEBA mig 189%') as deudas_de_prueba
  from pg_trigger
 where tgrelid = 'public.deudas'::regclass and not tgisinternal
 order by tgname;
