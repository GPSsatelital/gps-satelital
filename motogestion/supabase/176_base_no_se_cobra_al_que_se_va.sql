-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 176 — CORRECCIÓN A MANO: 6 liquidaciones que cobraban la base que el cliente no pagó (26-sep-2026)
--
-- D-023 (segunda cara): al que se va ANTES de terminar la base es ahorro suyo; no se le cobra la
-- parte que no alcanzó a pagar de su convenio "Base inicial incompleta". El código ya lo hace para
-- las nuevas (commit a20bdf7). Estas 6 ya tenían la línea guardada en `detalle_deudas`.
-- Ninguno pagó un peso de su convenio de base (medido el 26-sep).
--
--   LIQ-0049 EDER LEON .......... en taller · quitar $308.000
--   LIQ-0052 WILMAR MORENO ...... en taller · quitar $308.000
--   LIQ-0075 JORGE LUIS PERIÑAN . en taller · quitar $308.000 (convenio incumplido)
--   LIQ-0070 FRAIRON CASTILLA ... en taller · $410.000 → $102.000 (su primera semana, que sí usó)
--   LIQ-0011 JESUS MARIA DE HORTA papel impreso SIN firmar · −$390.000 → −$82.000, vuelve a "calculada"
--                                  para reimprimir el papel con la cifra correcta
--   LIQ-0063 RICARDO CRUZ ........ CERRADA sin firma · −$472.000 → −$164.000. Sigue en lista negra
--                                  (sigue debiendo), pero su deuda y el motivo pasan a $164.000
--   MELISSA BELLO (LIQ-0056) NO se toca: su cuenta no cuadra y se mira aparte.
--
-- Método (el de JORDAN): cada cambio exige encontrar EXACTAMENTE la fila con los valores de hoy;
-- si algo no coincide, aborta y no toca nada. Foto de la plata antes y después.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

select public.tomar_foto_plata('antes-176') as contratos_fotografiados;

begin;

do $fix$
declare n int;
begin
  -- Quita UNA fila de convenio de 308.000 y baja el total — solo si la liquidación está como se midió.
  update public.liquidaciones l
     set detalle_deudas = (select coalesce(jsonb_agg(e), '[]'::jsonb) from jsonb_array_elements(l.detalle_deudas) e
                            where not (e->>'concepto' in ('Saldo pendiente de convenio', 'Saldo de convenio incumplido')
                                       and (e->>'monto')::numeric = 308000)),
         total_deudas = l.total_deudas - 308000
   where (l.numero, l.estado, l.total_deudas) in (('LIQ-0049', 'en_taller', 353000),
                                                  ('LIQ-0052', 'en_taller', 338000),
                                                  ('LIQ-0075', 'en_taller', 338000));
  get diagnostics n = row_count;
  if n <> 3 then raise exception 'Se esperaban 3 liquidaciones en taller (EDER, WILMAR, JORGE LUIS) y fueron %', n; end if;

  -- FRAIRON: la fila de 410.000 pasa a ser solo su primera semana.
  update public.liquidaciones l
     set detalle_deudas = (select jsonb_agg(case when e->>'concepto' = 'Saldo pendiente de convenio' and (e->>'monto')::numeric = 410000
                                                 then jsonb_build_object('concepto', 'Primera semana de su base, sin pagar', 'monto', 102000)
                                                 else e end)
                             from jsonb_array_elements(l.detalle_deudas) e),
         total_deudas = l.total_deudas - 308000
   where l.numero = 'LIQ-0070' and l.estado = 'en_taller' and l.total_deudas = 485000;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FRAIRON (LIQ-0070) no está como se midió'; end if;

  -- JESUS MARIA: el papel impreso decía −390.000; vuelve a calculada para reimprimirlo con −82.000.
  update public.liquidaciones l
     set detalle_deudas = (select coalesce(jsonb_agg(e), '[]'::jsonb) from jsonb_array_elements(l.detalle_deudas) e
                            where not (e->>'concepto' = 'Saldo pendiente de convenio' and (e->>'monto')::numeric = 308000)),
         total_deudas = l.total_deudas - 308000,
         saldo_final = l.saldo_final + 308000,
         estado = 'calculada'
   where l.numero = 'LIQ-0011' and l.estado = 'documento_generado' and l.total_deudas = 416000 and l.saldo_final = -390000;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'JESUS MARIA (LIQ-0011) no está como se midió'; end if;

  -- RICARDO: la liquidación cerrada, su deuda y el motivo de la lista negra.
  update public.liquidaciones l
     set detalle_deudas = (select coalesce(jsonb_agg(e), '[]'::jsonb) from jsonb_array_elements(l.detalle_deudas) e
                            where not (e->>'concepto' = 'Saldo pendiente de convenio' and (e->>'monto')::numeric = 308000)),
         total_deudas = l.total_deudas - 308000,
         saldo_final = l.saldo_final + 308000
   where l.numero = 'LIQ-0063' and l.estado = 'cerrada' and l.total_deudas = 498000 and l.saldo_final = -472000;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'RICARDO (LIQ-0063) no está como se midió'; end if;

  update public.deudas
     set monto = 164000, monto_pendiente = 164000
   where descripcion = 'Saldo pendiente de la liquidación LIQ-0063' and estado = 'pendiente'
     and monto = 472000 and monto_pendiente = 472000;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'La deuda de RICARDO no está como se midió'; end if;

  update public.clientes
     set motivo_lista_negra = 'Liquidación LIQ-0063: saldo pendiente $164.000'
   where motivo_lista_negra = 'Liquidación LIQ-0063: saldo pendiente $472.000' and lista_negra = true;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'El motivo de lista negra de RICARDO no está como se midió'; end if;
end
$fix$;

select public.registrar_migracion(176, '176_base_no_se_cobra_al_que_se_va.sql',
  'D-023: 6 liquidaciones dejan de cobrar la base no pagada (EDER, WILMAR, JORGE LUIS, FRAIRON, JESUS MARIA, RICARDO)');

commit;

select public.tomar_foto_plata('despues-176');

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
select l.numero, l.estado, l.total_deudas, l.saldo_final,
       (select string_agg((e->>'concepto') || ' ' || (e->>'monto'), ' · ')
          from jsonb_array_elements(l.detalle_deudas) e where e->>'concepto' ~* 'convenio|base') as linea_base
  from public.liquidaciones l
 where l.numero in ('LIQ-0011','LIQ-0049','LIQ-0052','LIQ-0063','LIQ-0070','LIQ-0075')
 order by l.numero;
-- Esperado:
--   LIQ-0011 calculada    108000  -82000   (sin línea de base)
--   LIQ-0049 en_taller     45000       0   (sin línea de base)
--   LIQ-0052 en_taller     30000       0   (sin línea de base)
--   LIQ-0063 cerrada      190000 -164000   (sin línea de base)
--   LIQ-0070 en_taller    177000       0   Primera semana de su base, sin pagar 102000
--   LIQ-0075 en_taller     30000       0   (sin línea de base)
