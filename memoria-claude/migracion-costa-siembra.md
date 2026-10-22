---
name: migracion-costa-siembra
description: "Estado de la siembra de COSTA desde el PDF MIGRACION_GPS_SATELITAL_v2 — 161 clientes, 153 limpios a sembrar + 8 enredados"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-25T22:17:56.577Z
---

# Migración COSTA — siembra desde MIGRACION_GPS_SATELITAL_v2.pdf (24-jul-2026)

El usuario pasó el PDF con los clientes ACTIVOS de COSTA para dejar el sistema operativo. Se analizó con PyMuPDF (`find_tables`). Fuente y scripts en el scratchpad de la sesión (`costa_rows.json`, `gen_costa_sql.py`, `costa_siembra.sql`).

## Datos del PDF
- **161 clientes** (N° 1-200, 39 huecos = inactivos no incluidos). find_tables solo capturó 159; se rescataron a mano las filas **94 (YAL66H CARLOS HERRERA, ced 1048439273)** y **181 (IEW85I LUIS DAVID PEÑA, ced 1007970959)**.
- Forma: ~158 semanal, 2 quincenal, 1 mensual. Día: casi todos lunes (3 con "(MIERCOLES)" en el nombre). Tarifa: $195.000/sem (26000) o $202.000/sem (27000). Plazo casi todo 24m. Condición: 148 nueva, 13 usada. Falta: WhatsApp, dirección, barrio, acompañante (todos vacíos) y **ahorro/deuda acumulado** (NO viene en el PDF).

## Modelo de siembra (decidido)
Migrado con **empalme abierto** (igual que PRADERA/RASTREADOR): se crea cliente+moto+contrato con `es_migrado=true, empalme_cerrado=false, ahorro_apertura=0, motor_v2=false, estado='Activo'`. El **corte de cajas = lunes 2026-07-27** (go-live; verificado que es lunes). El ahorro/deuda de apertura se completan **con cada cliente en su primer cobro** (empalme) — COSTA arranca en $0 porque el PDF no trae balances. Las cajas las inicializa `preview_init_cajas` (mig 047) — hay que AGREGARLE el corte COSTA + filtro `motor_v2=false`. **OJO:** la versión de 047 en producción difiere del archivo (usa variable tipada para `caja_valor`); al recrearla, inlinear caja_valor con `r.valor_semanal` para evitar el error "cannot cast record to contratos".

**Dato clave:** el motor cobra la caja con `valor_semanal` (no con `tarifa_diaria`). Por eso 7 filas con "tarifa 27000 pero valor $195.000" NO son problema de dinero: se guarda valor_semanal=195000 y se deriva tarifa=26000 para que el ahorro cuadre.

## Reconciliación con lo que YA existe en producción (CRÍTICO)
COSTA no está vacío: hay **20 motos COSTA** (105 motos, 113 clientes en total).
- **~18 clientes COSTA ya operando** (contratos wizard `motor_v2=true, es_migrado=false`, marca BAJAJ, placas IGC*) — NO están en el PDF, son OTROS. No tocar.
- **6 personas del PDF ya están registradas** (serie IEW): CHIRINO (#194, ya con contrato migrado "En proceso" en IEW50I, ced allá 2872135 vs PDF 28721354), y FERNEYS(#195)/EDUARDO(#197)/GABRIEL(#198)/ELKIN(#199)/CRISTIAN(#200) como clientes "Aprobado sin contrato".

## Los 8 EXCLUIDOS de la siembra (se arreglan aparte "mañana" = 25-jul)
- **#121 JHONATAN FERNANDEZ (DPU50I)** y **#122 MARLON MUÑOZ (DPU56I)**: misma cédula 1002249686 (una mal digitada) → falta la correcta de cada uno.
- **#194 CHIRINO (IEW50I)**: ya en sistema, cédula a confirmar (2872135 vs 28721354).
- **#195 FERNEYS / #197 EDUARDO / #198 GABRIEL / #199 ELKIN**: ya registrados → solo crear contrato+moto enganchado al cliente existente (no duplicar persona). GABRIEL tiene el tel mal (le quedó la cédula en el campo tel).
- **#200 CRISTIAN (IEW38I)**: ya registrado + su placa IEW38I ya la tiene FABIS MILENA → falta la placa real de CRISTIAN.

Falsos positivos del cruce por nombre (SÍ van en los 153, personas distintas): #79 ELKIN DAVID JIMENEZ≠LUIS DAVID JIMENEZ, #83 JESUS ALBERTO BLANCO≠JESUS BAYONA (BLANCO ced dada 1047451679), #105 RAFAEL ARNEDO≠CLAUDIO ARNEDO.

## Los 3 casos especiales (datos dados por el usuario)
- **YEINER PEREZ (RLZ77H, quincenal)**: días 15 y 30, valor_semanal base 195000, base 420000, 24m.
- **FERNEYS (IEW93I, quincenal)** [EXCLUIDO por conflicto]: días 5 y 20, valor_semanal base 202000 (su $435.000 era el total quincenal).
- **JOSE GOMEZ (RLY56H, mensual)**: paga $900.000/mes, ahorra $172.000, base 800000, 15m, día 25. Interno: valor_semanal 209000, tarifa 26000, ahorro 6000/día, dom 13000/4000 → caja mensual 4×209000+2×32000=900000, ahorro 172000.
- **YESID BARRAZA (RLT72H, semanal)**: valor 235000, ahorra 10000/día, 15m. Interno: tarifa 26000, ahorro 10000, dom 13000/6000 → 6×36000+19000=235000.

## ✅✅ COSTA COMPLETO (25-jul) — 180 motos / 180 contratos activos / 180 con motor / 0 sin motor
Los 8 enredados resueltos con el Excel devuelto por el usuario (`migracion_datos/costa_8_restantes.sql`):
- **CRUCE DE PLACAS resuelto:** el contrato de FABIS MILENA estaba colgado de **IEW38I**, que en realidad es de **CRISTIAN MARRIAGA**; la de FABIS es **IGC38I** (estaba "Reservada" y sin contrato, huérfana — esa fue la prueba). Se movió SOLO `contratos.moto_id` de FABIS → IGC38I, con rastro en `contratos_auditoria`. **Sus 2 pagos ($252.000), cajas 1/104, fecha de entrega y valores quedaron intactos** (van pegados al contrato, no a la moto). Verificado post-cambio.
- **Datos confirmados:** MARLON cédula **73203618** · CHIRINO **2872135** (la del sistema) · JHONATAN 1002249686 · FERNEYS quincenal días **5 y 20** · tel de EDUARDO (3014478293) y GABRIEL (3023717430) ya estaban corregidos en el sistema.
- Se crearon 2 clientes (JHONATAN, MARLON), 6 motos (DPU50I, DPU56I, IEW93I, IEW89I, IEW91I, IEW87I) y 7 contratos; el de CHIRINO ya existía "En proceso" → activado.
- Motor encendido con el mismo `preview_init_cajas` (solo toma `motor_v2=false`): JHONATAN/MARLON 18/104, FERNEYS 2/48 (inicia 5-ago), resto 2-3/104, corte 2026-07-27.
- **Los 180 quedan con empalme ABIERTO** (correcto): el ahorro/deuda de apertura se completa con cada cliente en su primer cobro, desde el Panel de Empalme.

## ✅ AVANCE 25-jul (parte 2): historial de pagos — permisos + buscador (commit 9153bf6, en prod)
- **Permiso `historial_pagos` ahora controla LOS DOS historiales**: el módulo aparte (menú) Y la pestaña 🧾 Historial dentro de Cartera (CobrosView, prop `puedeHistorial`). ⚠️ **CONSECUENCIA**: SECRETARIA y SUBADMIN (que hoy tienen `cobros` pero NO `historial_pagos` por defecto en ACCESOS_SUGERIDOS) **ya no ven la pestaña Historial en Cartera** hasta que un admin les active "Historial de Pagos" en UsuariosView. Avisar al usuario que active el permiso a quien deba verlo (o pedir dejarlo default para SECRETARIA).
- **Fix bug**: el render del módulo Historial de Pagos usaba `esAdmin` en vez de `puedeVer` (App.tsx:572) → un permiso a medida no lo activaba. Corregido.
- **Buscador** (nombre/cédula/placa) agregado a la pestaña Historial de Cartera (el módulo aparte ya tenía). Falta probar en navegador con login (tsc+build OK).
- 🔲 Enviado al usuario **Excel editable `COSTA_8_por_confirmar.xlsx`** con los 8 enredados (columnas amarillas para llenar). Espera devolución con datos reales para migrarlos.

## ✅ AVANCE 25-jul: Bloques 1, 2 y 3 CORRIDOS EN PRODUCCIÓN
- **Bloque 1 (siembra 153):** corrido OK tras 1 fix — `tipo_contrato` (columna legada, CHECK solo 'diario'/'semanal') rebotaba con 'mensual'; se cambió `lower(v.forma_pago)` → `'semanal'` fijo. Verificación dio 153/153/153.
- **Bloque 2 (preview_init_cajas con corte COSTA 2026-07-27 + filtro motor_v2=false + caja_valor inline):** corrido. Resumen: COSTA Semanal 151 + Quincenal 1 + Mensual 1 = 153, TODAS al día.
- **Bloque 3 (PASO B, enciende motor_v2):** corrido. Muestra verificada: van/de_n proporcional a antigüedad (104 cajas/24m, 65 para YESID/15m), miércoles con fecha_inicio_cajas=2026-07-29, lunes con 2026-07-27. Falta confirmar el conteo final = 153 (pendiente el número del usuario).
- Archivos: `costa_siembra.sql` (corregido), `costa_bloque2_preview.sql`, `costa_bloque3_pasob.sql` en `motogestion/migracion_datos/`.
- **SIGUIENTE:** los 8 enredados (#121,122,194,195,197,198,199,200) con los 4 datos del usuario (2 cédulas JHONATAN/MARLON, cédula CHIRINO, placa CRISTIAN). Para los 5 ya-registrados: crear SOLO contrato+moto enganchado al cliente existente.

## Estado (24-jul noche) — HANDOFF a nueva sesión (tokens agotándose)
- SQL de los **153 limpios** GENERADO, auto-verificado (153/153/153, sin colisiones ni duplicados, dinero consistente) y **verificado adversarialmente** (workflow: esquema ✅ y dinero ✅ sin hallazgos; completitud ya confirmada en Python). Enlaza cliente por cédula y moto por placa. BEGIN...COMMIT. marca/modelo='POR DEFINIR', dirección='POR DEFINIR'.
- **ARCHIVOS PERSISTENTES (gitignored, sobreviven a la sesión) en `motogestion/migracion_datos/`:**
  - `costa_siembra.sql` ← **Bloque 1 listo para pegar en Supabase** (el scratchpad de la sesión vieja se pierde; usar ESTE).
  - `costa_rows.json` (161 filas del PDF), `costa_existentes_prod.json` (placas/cédulas ya en prod), `gen_costa_sql.py` (generador, por si hay que regenerar).
- **Miércoles ya resuelto:** los 3 de día miércoles (RML48H, RML55H, YAL64H) NO necesitan corte aparte — `preview_init_cajas` calcula su `fecha_inicio_cajas` = primer miércoles tras el corte (29-jul) por su `dia_pago='Miércoles'`. Un solo corte (lunes 27) sirve para lunes y miércoles.

### PASOS EXACTOS al retomar (en orden):
1. **Entregar Bloque 1**: pegar el contenido de `motogestion/migracion_datos/costa_siembra.sql` en el chat (regla SQL: pegar, no archivo) para que el usuario lo corra en Supabase SQL Editor. Verificación tras correr: `select count(*) from motos where grupo='COSTA' and marca='POR DEFINIR'` = 153.
2. **Construir Bloque 2** = `create or replace function public.preview_init_cajas()` basado en `motogestion/supabase/047_init_cajas_migrados.sql` PERO con 3 cambios: (a) corte: `v_corte := case when r.m_grupo='COSTA' then date '2026-07-27' when r.m_grupo='RASTREADOR' then date '2026-07-06' else date '2026-07-01' end;` (b) WHERE: agregar `and c.motor_v2 = false` (así SOLO toca los COSTA nuevos, no PRADERA/RASTREADOR ya vivos ni CHIRINO que es 'En proceso'); (c) reemplazar `v_val := public.caja_valor(r);` por el cálculo INLINE con `r.valor_semanal` (Semanal→valor_semanal; Quincenal→2*vs+tar+ah; Mensual→4*vs+2*(tar+ah)) para evitar el error "cannot cast record to contratos" que ya pasó el 11-jul. Incluir también `_payday_siguiente` y `_paydays_entre` (create or replace, inofensivo). Correr + `select * from preview_init_cajas()` para revisar la tabla (debe dar ~153 filas, estado AL DIA la mayoría).
3. **Bloque 3 (PASO B)**: el UPDATE comentado al final de 047 (motor_v2=true, fecha_inicio_cajas, cajas_previas=previas+financiadas, total_cajas, cajas_pagadas=pagadas_init, caja_actual_pagado, prorrateo_*=0) `from preview_init_cajas() p where p.contrato_id=c.id and p.total_cajas is not null`. Necesario ANTES del lunes para que no salgan en falsa mora.
4. **Los 8 enredados** (25-jul, con datos del usuario): pedir las 2 cédulas de JHONATAN/MARLON, la cédula buena de CHIRINO, la placa real de CRISTIAN. Para FERNEYS/EDUARDO/GABRIEL/ELKIN/CRISTIAN (ya clientes "Aprobado sin contrato") = crear SOLO contrato+moto enganchado al cliente existente (buscar su id por cédula, no insertar cliente). FERNEYS es quincenal días 5,20 valor_semanal 202000.

### Acceso a producción (para la nueva sesión, vía browser preview logueado localhost:5173):
Token en localStorage key `sb-jvfkprkjysjffhzjitgl-auth-token` (.access_token); anon `sb_publishable_Bqk7SNOBfrZWZ7665_WOCg_Bc2y3ga2`; base `https://jvfkprkjysjffhzjitgl.supabase.co/rest/v1/`. Logueado como FREDY/ADMIN_PRINCIPAL.

### También pendiente (menor, ya desplegado lo demás):
- 3 bugs de la revisión adversarial anterior YA arreglados y en prod (commit `2cf4e14`: gabela dashboard, alerta plazo/promesa por ventana 15d, sort promesa por created_at).

Ver [[empalme-migracion-construido]], [[libro-de-cajas-motor-v2]], [[entrega-golive-lunes27]], [[migracion-grupos-datos-reales]].
