-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 179 — EL ACUERDO DE BASE LLEVA SOLO EL AHORRO QUE FALTA (26-sep-2026, decisión del dueño)
--
-- 🔴 EL PROBLEMA. Cuando el cliente entrega menos que su primer período, el wizard armaba el acuerdo
-- de base con TODO lo que faltaba (pedazo de período + $308.000 de ahorro). Pero ese pedazo de período
-- queda a medio pagar en el libro de cajas y se lo cobran sus cuotas normales: lo pagaba DOS veces.
-- JORDAN: le faltaban $353.000 y le iban a pedir $398.000 ($45.000 en su semana + $353.000 en el
-- acuerdo). El dueño, después de verlo con las sumas: "arréglalo".
--
-- LO QUE HACE:
--   · El wizard ya arma el acuerdo solo con el ahorro que falta (commit de este mismo día).
--   · Los dos acuerdos vivos con pedazo de período se bajan a $308.000:
--       JORDAN ......... $353.000 → $308.000 · 12 → 11 cuotas de $30.000 (la última de $8.000)
--                        · fecha límite 14-dic → 7-dic · su lista de qué financia, también a $308.000
--       JORGE DAVID .... $310.000 → $308.000 · siguen 8 cuotas de $40.000 (la última de $28.000)
--   A favor del cliente en los dos. Los acuerdos firmados dicen la cifra vieja: hay que reimprimirlos.
--   (FRAIRON y MELISSA también tenían pedazo, pero ya no están activos: sus liquidaciones van aparte.)
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   Volver a poner los valores de antes en los dos convenios (están arriba). Bajar un acuerdo no
--   dispara `trg_convenio_ampliado` (solo actúa cuando el total SUBE).
-- ═══════════════════════════════════════════════════════════════════════════════════════════

select public.tomar_foto_plata('antes-179') as contratos_fotografiados;

begin;

do $fix$
declare n int;
begin
  update public.convenios
     set deuda_total = 308000, monto_deudas = 308000, numero_cuotas = 11, fecha_limite = '2026-12-07',
         partitura = '[{"etiqueta": "Monto pactado sin deuda registrada (ver motivo del acuerdo)", "monto": 308000, "tipo": "ajuste"}]'::jsonb
   where id = '5114bd26-66ee-482a-9186-15883f1a8869'
     and concepto = 'Base inicial incompleta al crear el contrato' and estado = 'activo'
     and deuda_total = 353000 and numero_cuotas = 12 and cuota_por_periodo = 30000 and fecha_limite = '2026-12-14';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'El acuerdo de JORDAN no está como se midió'; end if;

  update public.convenios
     set deuda_total = 308000
   where id = '96d19e6a-acbc-4b95-9db6-a84ba7f82a72'
     and concepto = 'Base inicial incompleta al crear el contrato' and estado = 'activo'
     and deuda_total = 310000 and numero_cuotas = 8 and cuota_por_periodo = 40000;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'El acuerdo de JORGE DAVID no está como se midió'; end if;
end
$fix$;

select public.registrar_migracion(179, '179_acuerdo_de_base_solo_ahorro.sql',
  'El acuerdo de base lleva solo el ahorro: JORDAN $353.000 → $308.000, JORGE DAVID $310.000 → $308.000');

commit;

select public.tomar_foto_plata('despues-179');

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
select que_cambio, count(*) as contratos, sum(diferencia) as total
  from public.comparar_fotos('antes-179', 'despues-179')
 group by que_cambio;
-- Esperado: una sola fila → 'total del acuerdo' · 2 · -47000
