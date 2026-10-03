-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 185 — BORRAR LAS 3 MOTOS DE PRUEBA DE USADAS (2-oct-2026, dueño: "Sí, bórralas")
--
-- LO QUE SE ENCONTRÓ. En el grupo USADAS hay 3 motos creadas el 26 y 27 de julio para probar la app:
-- ZZB01T, ZZC01T y ZZC02T, con marca, modelo y color "PRUEBA" y la nota "MOTO DE PRUEBA - BORRAR".
-- Ninguna tiene contrato, pago, entrada al taller ni recepción. ZZC02T tiene 2 movimientos de prueba
-- en historial_ubicaciones (27-jul, "salida de Fiscalía" a bodega).
--
-- LO QUE HACE: borra esos 2 movimientos y las 3 motos. Se detiene sin tocar nada si no están las 3 exactamente así, o si
-- cualquier tabla de la base tiene algo que apunte a ellas (se revisa cada llave hacia motos).
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   No hace falta: eran de prueba y no tenían nada. Si se necesitaran, se crean otra vez en Motos.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

do $fix$
declare
  v_ids uuid[];
  r record;
  n int;
begin
  select array_agg(id) into v_ids
    from public.motos
   where placa in ('ZZB01T', 'ZZC01T', 'ZZC02T')
     and grupo = 'USADAS' and marca = 'PRUEBA' and observaciones like 'MOTO DE PRUEBA%';
  if coalesce(array_length(v_ids, 1), 0) <> 3 then
    raise exception '185 ABORTADA: no están las 3 motos de prueba como se midieron. NO se tocó nada.';
  end if;

  -- Los 2 movimientos de prueba de ZZC02T (27-jul: "salida de Fiscalía" a bodega). La primera vez que
  -- se corrió, el seguro de abajo los encontró y se detuvo sin tocar nada.
  delete from public.historial_ubicaciones
   where moto_id = any (v_ids)
     and id in ('cdbfcac4-6b40-4d16-a02c-3cb808ef73b4', 'ba9d12b5-e523-4b2e-bade-c465193d1eb7');
  get diagnostics n = row_count;
  if n <> 2 then raise exception '185 ABORTADA: los movimientos de prueba no están como se midieron (%). NO se tocó nada.', n; end if;

  -- Nada más puede apuntar a ellas: cada tabla con una llave hacia motos, una por una.
  for r in
    select c.conrelid::regclass as tabla, a.attname as columna
      from pg_constraint c
      join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
     where c.contype = 'f' and c.confrelid = 'public.motos'::regclass
  loop
    execute format('select count(*) from %s where %I = any ($1)', r.tabla, r.columna) into n using v_ids;
    if n > 0 then
      raise exception '185 ABORTADA: % tiene % fila(s) de estas motos (columna %). NO se tocó nada.', r.tabla, n, r.columna;
    end if;
  end loop;
  select count(*) into n from public.recepciones_vehiculo where moto_id = any (v_ids);
  if n > 0 then raise exception '185 ABORTADA: hay % recepción(es) de estas motos. NO se tocó nada.', n; end if;

  delete from public.motos where id = any (v_ids);
  get diagnostics n = row_count;
  if n <> 3 then raise exception '185 ABORTADA: se iban a borrar % motos en vez de 3. NO se tocó nada.', n; end if;

  raise notice 'LISTO: borradas las 3 motos de prueba (ZZB01T, ZZC01T, ZZC02T) y sus 2 movimientos de prueba.';
end
$fix$;

select public.registrar_migracion(185, '185_borrar_motos_de_prueba.sql',
  'Borrar las 3 motos de prueba de USADAS (ZZB01T, ZZC01T, ZZC02T) y sus 2 movimientos de prueba');

commit;
