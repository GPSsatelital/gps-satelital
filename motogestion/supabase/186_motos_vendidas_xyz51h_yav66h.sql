-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 186 — XYZ51H Y YAV66H SE VENDIERON: DADAS DE BAJA (2-oct-2026, dueño: "Darlas de baja",
--       "Se vendieron", "cerrarlo y darlo de baja enseguida", "Sí, hazlo así")
--
-- LO QUE SE ENCONTRÓ (medido hoy). Las dos son de PRADERA y la empresa las vendió.
--   · XYZ51H: figura "Disponible". Su contrato (BLEIMER CASTELLANO) está Finalizado, con 3 pagos y la
--     liquidación LIQ-0053 cerrada. Tiene una entrada al taller abierta desde el 14-sep ("Revisión por
--     liquidación LIQ-0053").
--   · YAV66H: figura "Recuperada". El contrato de JESUS DAVID SABALLET sigue Suspendido, sin pagos,
--     con una deuda de migración de $260.500 pendiente; el cliente figura "Activo".
--
-- LO QUE HACE:
--   1. Las motos aceptan un estado nuevo: "Vendida" (la regla de la base se lee VIVA y se aborta si no
--      es la que se midió, lección de la mig 124).
--   2. XYZ51H y YAV66H pasan a "Vendida", sin cobrador y sin fechas de SOAT ni tecno (para que no
--      avisen de vencimientos de una moto que ya no es de la empresa), con la nota de la baja y esas fechas.
--   3. Se cierra la entrada al taller de XYZ51H (fecha de salida hoy).
--   4. El contrato de JESUS DAVID pasa a Finalizado y él a "Retirado". Sus $260.500 se quedan anotados
--      en el contrato cerrado, como los de los otros clientes que salieron debiendo: no se cobran ni
--      salen en Cartera, Reportes ni ZALA.
--   5. Rastro en la auditoría del contrato.
--   No toca la plata de nadie: ni pagos, ni deudas, ni la liquidación de BLEIMER.
--   Se detiene sin tocar nada si algo no está como se midió.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   update motos set estado = 'Disponible', subadmin_id = '0871aca4-06da-49b2-ba40-4f50a13a51a8', observaciones = '', fecha_seguro = '2026-12-04', fecha_tecnomecanica = '2027-12-04' where id = '53e8aca0-7bd7-4a47-9369-0b0301de9301';
--   update motos set estado = 'Recuperada', subadmin_id = '0871aca4-06da-49b2-ba40-4f50a13a51a8', observaciones = '', fecha_seguro = '2027-02-27', fecha_tecnomecanica = '2028-02-27' where id = 'cbcbfd3a-c270-45c2-a371-bd36fb8dab7d';
--   update taller set fecha_salida = null where id = '42378693-8c59-464f-a19a-17899e6db20f';
--   update contratos set estado = 'Suspendido' where id = '3598b945-2e51-400c-adc1-2b56ba3f24cc';
--   update clientes set estado = 'Activo' where id = '2c1193c6-f8ff-45d9-a5ac-7fa8e63b6e12';
--   (las fechas de asignación del cobrador se pierden: eran del 7 al 13-sep)
-- ═══════════════════════════════════════════════════════════════════════════════════════════

select public.tomar_foto_plata('antes-186') as contratos_fotografiados;

begin;

do $fix$
declare
  v_xyz      constant uuid := '53e8aca0-7bd7-4a47-9369-0b0301de9301';
  v_yav      constant uuid := 'cbcbfd3a-c270-45c2-a371-bd36fb8dab7d';
  v_taller   constant uuid := '42378693-8c59-464f-a19a-17899e6db20f';
  v_contrato constant uuid := '3598b945-2e51-400c-adc1-2b56ba3f24cc';
  v_cliente  constant uuid := '2c1193c6-f8ff-45d9-a5ac-7fa8e63b6e12';
  v_dueno    constant uuid := 'a68f065b-3a59-4c67-bd2e-45c6abc30fdb';
  v_nota     constant text := 'Vendida — dada de baja el 2-oct-2026 (mig 186)';
  v_def text;
  n int;
begin
  -- 1. El estado nuevo, sobre la regla VIVA.
  select pg_get_constraintdef(oid) into v_def from pg_constraint
   where conrelid = 'public.motos'::regclass and conname = 'motos_estado_check';
  if v_def is null or v_def not like '%''En traspaso''%' or v_def like '%Vendida%' then
    raise exception '186 ABORTADA: la regla de estados de motos no es la que se midió (%). NO se tocó nada.', v_def;
  end if;
  alter table public.motos drop constraint motos_estado_check;
  alter table public.motos add constraint motos_estado_check
    check (estado in ('Disponible','Reservada','Asignada','Mantenimiento','Recuperada','Fiscalia','Transito','Garantia','En traspaso','Vendida'));

  -- 4. El contrato de JESUS DAVID, primero (así ningún paso ve la moto vendida con un contrato abierto).
  update public.contratos set estado = 'Finalizado'
   where id = v_contrato and moto_id = v_yav and cliente_id = v_cliente and estado = 'Suspendido';
  get diagnostics n = row_count;
  if n <> 1 then raise exception '186 ABORTADA: el contrato de JESUS DAVID no está Suspendido sobre YAV66H. NO se tocó nada.'; end if;

  select count(*) into n from public.deudas
   where contrato_id = v_contrato and concepto = 'migracion' and monto = 260500 and monto_pendiente = 260500 and estado = 'pendiente';
  if n <> 1 then raise exception '186 ABORTADA: la deuda de JESUS DAVID no está como se midió ($260.500 pendiente). NO se tocó nada.'; end if;

  update public.clientes set estado = 'Retirado'
   where id = v_cliente and estado = 'Activo';
  get diagnostics n = row_count;
  if n <> 1 then raise exception '186 ABORTADA: JESUS DAVID no figura Activo. NO se tocó nada.'; end if;

  -- Que ninguna de las dos motos tenga otro contrato abierto.
  select count(*) into n from public.contratos
   where moto_id in (v_xyz, v_yav) and estado in ('Activo', 'Suspendido', 'En proceso');
  if n <> 0 then raise exception '186 ABORTADA: hay % contrato(s) abiertos sobre estas motos. NO se tocó nada.', n; end if;

  -- 2. Las dos motos, vendidas y sin cobrador.
  -- Sin fechas de SOAT ni tecno: los avisos del servidor no miran el estado y en noviembre avisarían
  -- "SOAT por vencer" de una moto vendida. Las fechas quedan escritas en la nota.
  update public.motos
     set estado = 'Vendida', subadmin_id = null, subadmin_asignado_desde = null,
         fecha_seguro = null, fecha_tecnomecanica = null,
         observaciones = case when coalesce(observaciones, '') = '' then '' else observaciones || ' · ' end
                         || v_nota || ' · SOAT vencía el ' || coalesce(to_char(fecha_seguro, 'DD/MM/YYYY'), 'sin fecha')
                         || ', tecno el ' || coalesce(to_char(fecha_tecnomecanica, 'DD/MM/YYYY'), 'sin fecha')
   where (id = v_xyz and placa = 'XYZ51H' and estado = 'Disponible')
      or (id = v_yav and placa = 'YAV66H' and estado = 'Recuperada');
  get diagnostics n = row_count;
  if n <> 2 then raise exception '186 ABORTADA: las motos no están como se midieron (% de 2). NO se tocó nada.', n; end if;

  -- 3. La entrada al taller abierta de XYZ51H.
  update public.taller
     set fecha_salida = '2026-10-02',
         detalle = coalesce(detalle, '') || ' — Cerrada: la moto se vendió (mig 186)'
   where id = v_taller and moto_id = v_xyz and fecha_salida is null;
  get diagnostics n = row_count;
  if n <> 1 then raise exception '186 ABORTADA: la entrada al taller de XYZ51H no está abierta como se midió. NO se tocó nada.'; end if;

  -- 5. El rastro.
  insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por) values
    (v_contrato, 'Estado', 'Suspendido', 'Finalizado — la moto YAV66H se vendió; su deuda de $260.500 queda anotada (mig 186)', v_dueno);

  raise notice 'LISTO: XYZ51H y YAV66H vendidas; contrato de JESUS DAVID cerrado y él Retirado; taller de XYZ51H cerrado.';
end
$fix$;

select public.registrar_migracion(186, '186_motos_vendidas_xyz51h_yav66h.sql',
  'XYZ51H y YAV66H vendidas: estado "Vendida", sin cobrador; contrato de JESUS DAVID SABALLET cerrado');

commit;
