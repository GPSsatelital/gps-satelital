---
name: zala-vitrina-lectura
description: "LA VITRINA para ZALA — esquema `zala` de solo lectura, espejo de cicloPago.ts (mig 126, 7-sep; espejo 319/0). Mig 132 (8-sep): abonado del acuerdo desde su firma + encargado_id/whatsapp, espejo 322/0. Mig 134 (8/9-sep, CORRIDA): la vitrina ya decide a quién escribir y con qué mensaje — zala_puede_escribir, cobro_automatico, plantilla_hoy, cliente_corto, dia_pago_frase, dias_texto, vencida_texto + vista zala.plantillas. Pendientes: contraseña del rol, el criterio de recolección, formato de la plata, 4 confirmaciones del dueño."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-09T13:12:56.654Z
---

# La vitrina para ZALA — construida 7-sep-2026

## Qué es (decisión del dueño 4-sep, "termina lo de la vitrina" 7-sep)
ZALA (bot de cobranza por WhatsApp, Python, entraba con `service_role` y SOLO LEE) descuadraba
clientes porque la calculadora estaba partida (motor en SQL, `loQueDebe` solo en TS) y no había ni
una vista. Ahora existe el esquema **`zala`**: lo único que ZALA debe ver.

| Pieza | Estado |
|---|---|
| `zala.cliente` (una fila por contrato Activo/Suspendido: `debe_hoy` = cuota_falta + acuerdo_falta + deudas_falta, `debe_hoy_detalle`, `estado_cartera`/`estado_texto`, `dias_mora`, `balde_hoy`, plazo, próximo/último pago, su moto vs la que usa, `encargado`, `va_cajas` de `total_cajas`) | ✅ mig 126 corrida |
| `zala.moto` · `zala.pagos` (120 días) · `zala.convenios` · `zala.deudas` | ✅ |
| `zala.diccionario` (100 filas: vista, columna, significado, valores, **`zala_lo_dice`**, `confirmado_por_dueno`) | ✅ |
| Rol `zala_lector` (USAGE zala + SELECT vistas, NOLOGIN) | ✅ creado — 🔲 **el dueño le pone la contraseña** (`alter role zala_lector with login password '…'`) y conecta ZALA por el pooler (`zala_lector.<ref>`) — con "use context7" |
| `public.zala_vitrina(p_vista)` (JSON, solo ADMIN/AP/ANALISTA) para la prueba espejo e informes | ✅ |
| **Prueba espejo** `motogestion/scripts/vitrina-espejo.browser.js` (import dinámico de cicloPago.ts en el dev server + RPC) | ✅ **7-sep: 319 comparados, 0 diferencias** en debe_hoy, cuota_toca/falta, acuerdo_toca/falta, acuerdo_cuota_este_periodo, deudas_falta, saldo_a_favor, estado_cartera, dias_mora |
| Regla en CLAUDE.md ("REGLA DE LA VITRINA") + Parte 5 del `docs/DICCIONARIO-ESTADOS.md` | ✅ |

Distribución el 7-sep (lunes): 141 paga-hoy · 21 al día · 14 mora · 83 recolección · 60 retenidas · 1 Diario sin motor.

## 8-sep — mig 132: el abonado al acuerdo se cuenta DESDE SU FIRMA (✅ corrida y desplegada, `e8c6ecd`)

**El hallazgo, al rehacerle el convenio a BRADER GUZMAN (YAL65H), primer contrato con dos
acuerdos:** el MOTOR (mig 119) y la NÓMINA cuentan lo abonado a un convenio solo con pagos
`created_at >= convenio.created_at`; **Cartera (`faltaDelAcuerdo`) y la vitrina sumaban TODOS los
pagos del contrato**. Iguales entre sí → la prueba espejo no podía verlo. Al #2 de Brader le
acreditaba los $148.000 del #1 (borrado): el lunes 14 ZALA le habría dicho "no debe nada del
acuerdo" con una cuota vencida.
- ✅ `cicloPago.ts` corregido (filtro `desdeLaFirma`: `created_at` exacto; solo `fecha` → por día,
  inclusivo) + 3 pruebas BRADER en `loQueDebe.test.ts` (519 en total). La primera FALLABA con el
  código viejo (pagado 100.000 en vez de 0).
- ✅ **`132_vitrina_abonado_desde_la_firma.sql` corrida el 8-sep**: `zala.cliente` (lateral `ab` con
  el corte; `pg` ya no trae abonado) y `zala.convenios` (abonado por acuerdo) con `create or replace`
  — si la vista viva no fuera la de la 126, el replace falla en vez de pisarla. De paso (una sola
  tocada a la vista): `profiles.whatsapp` + `zala.cliente.encargado_id` / `encargado_whatsapp`
  (contrato ZALA §5.1 y pedido del dueño: el número sale del usuario, no de un archivo).
  **Verificado en la base:** 67 columnas · 123 acuerdos vigentes, **0 diferencias** motor vs vitrina ·
  YAL65H `convenio_abonado = 0` · **espejo 322 contratos, 0 diferencias** (el script ahora pide
  `created_at` en los pagos para ejercitar el mismo camino que la pantalla). 0 motos sin encargado;
  **323 filas / 4 personas sin WhatsApp** (Lumar es el encargado de Brader). Desplegado en `e8c6ecd`.
- **Lección:** la prueba espejo prueba que dos copias coinciden, no que coincidan con el motor.
  Cuando una regla vive en tres sitios (motor, TS, vitrina), la prueba debe incluir al motor.
- **Brader al cierre del 8-sep:** acta amarrada · abonos aplicados (multa pagada, migración
  $791.500) · convenio #1 borrado con retrato repuesto (25/198000/26) · decisión "cobrar" errada
  borrada · rodó 1 semana · convenio #2 firmado · empalme por cerrar. Ahorro suyo $708.000.

## 8/9-sep — mig 134: la vitrina decide a quién escribir y con qué mensaje (✅ CORRIDA)

MotoGestión decide, ZALA obedece. `zala.cliente` ganó (todas **al final** de la vista):
`zala_puede_escribir` + `no_escribir_porque` (lista negra · sin número válido) · `cobro_automatico`
(puede escribir ∧ Activo ∧ cuenta en motor ∧ sin plazo vigente ∧ sin promesa ≥ hoy ∧ no está en mora
sin ningún pago registrado) · `plantilla_hoy` (la CLAVE del mensaje de hoy) · `debe_hoy_texto` ·
`cliente_corto` · `dia_pago_frase` · `dias_texto` · `vencida_texto`. Más la vista `zala.plantillas`
(clave → plantilla_meta + variables + texto + activa) y `zala.pagos.registrado_por`.

Funciones nuevas espejo del TS: `zala.whatsapp_valido`, `zala.nombre_corto` (= `nombreCorto()`),
`zala.dia_pago_frase` (= `diaPagoFrase()` en cicloPago.ts). **Se tocan de a dos o ninguno.**

🔴 **`create or replace view` SOLO deja agregar columnas AL FINAL.** Había puesto `dias_texto` junto
a `dias_sin_pago` (en la mitad) y eso falla con *"cannot change name of view column"* — la misma
lección de la mig 131. Se corrigió antes de correrla (`5727725`).

**La tanda del día que verificó el dueño (mar 8-sep, día de gabela de los de lunes):** 111 gabela ·
52 recolección · 16 mora · 83 sin mensaje (al día) · 59 retenidas fuera de la tanda · 2 sin número o
en lista negra. Total 321 contratos. Muestra verificada: nombres cortos correctos, un cliente con
17 días desde su último pago y 12 vencida, otro 14 y 7, y el que está al día con 0 vencida y sin
plantilla. 🔴 **Ese 52 vs 16 destapó [[bucket-recoleccion-cuenta-dias-equivocados]]** — decidir
antes de prender el envío.

**Detalle chico sin resolver:** `zala.pesos()` escribe **"$ 685.000"** (con espacio) y la app
**"$685.000"**. El mismo cliente lee dos formatos según de dónde salga el mensaje. Es una línea;
el dueño no ha dicho si alinearlo.

## Cómo está hecha (para no romperla)
- Funciones `zala.*` = espejo de `cicloPago.ts`: `es_dia_de_pago`, `inicio_periodo_actual`,
  `proximo_dia_pago`, `cuota_convenio_del_periodo`, `periodos_convenio_exigidos`, `acuerdo`
  (faltaDelAcuerdo), `proxima_cuota_convenio`, `fecha_caja`, `prorrateo_exigible_hoy`,
  `dias_en_mora_v2`, `cuenta_contrato` (loQueDebe + calcularEstadoCartera + próximo pago).
  **La exigencia de cajas NO se duplicó**: usa `public.cajas_exigidas` y `public.caja_valor` (motor).
- `balde_hoy` copia la regla del panel Hoy: recolección = mora ∧ `dias_sin_pago > 3` ∧ < 999 ∧ sin
  plazo vigente; `dias_sin_pago` = desde el último confirmado o desde la entrega topada al corte
  (`_corte_migracion`: propio arranque si migrado; PRADERA 1-jul, RASTREADOR 6-jul, COSTA 27-jul).
- `created_at` del convenio se lee en UTC (`at time zone 'UTC'`) porque la pantalla hace `.slice(0,10)`.
- Diario / sin motor → `cuenta_contrato` devuelve 0 filas → `debe_hoy` null, `balde_hoy = 'sin-motor'`.
- Vistas con privilegios del dueño (postgres): leen las tablas base sin RLS; el lector solo ve la vista.
- **Si se toca cicloPago.ts hay que tocar `zala.*` y volver a correr el espejo** (regla en CLAUDE.md).

## ✅ 9-sep — el acceso de ZALA quedó configurado y verificado
El dueño corrió `alter role zala_lector with login password '…'` + `connection limit 5`. **La
contraseña la maneja solo él; nunca pasa por el chat ni por el repo.** (Trampa en la que caímos: le
di un ejemplo que parecía real y lo usó tal cual — la cambió por una propia.)
- **Conexión:** pooler de Supabase en modo **Session (puerto 5432)**, usuario
  `zala_lector.jvfkprkjysjffhzjitgl`, base `postgres`. Session y no Transaction: más simple para un
  bot de Python, sin líos de sentencias preparadas.
- **Candado verificado con `has_table_privilege`** (no con un `select`: el editor SQL de Supabase
  corre como `postgres`, así que probar ahí no dice nada del invitado — nos pasó): ve_pagos,
  ve_clientes, ve_contratos, ve_usuarios = **false**; ve_la_vitrina = **true**. No es superusuario,
  no tiene BYPASSRLS, no pertenece a ningún grupo. Los grants directos son 8 vistas de `zala`, todas
  SELECT. `set role zala_lector` falla desde el panel — correcto, ni el dueño puede suplantarlo.

## Pendientes
1. 🔲 Que ZALA **borre la llave `service_role`** de su configuración y use solo esta conexión.
   Mientras la tenga, todo esto no sirve: sigue entrando por la puerta grande.
2. 🔲 **4 confirmaciones del dueño** (marcadas `por confirmar` en el diccionario): ZALA menciona
   saldo a favor · nombre del encargado · plazo extra · promesa de pago. Recomendación cargada:
   sí informativo; plazo/promesa solo si ya existen, nunca como oferta. Q3 (deuda en convenio):
   la vitrina expone `debe_hoy` (solo lo de hoy) y `deudas_dentro_del_convenio` como "solo si pregunta".
3. 🔲 `debe_hoy_detalle` sale `''` cuando no debe nada → cambiar a "no debe nada hoy" (create or replace view).
4. 🔲 RLS en `zala.diccionario` con política para `zala_lector` (Supabase avisó; se corrió SIN RLS
   porque el esquema no está expuesto ni tiene usage para anon/authenticated).
5. 🔲 `zala.hoy` / `zala.moto` no muestran tiempo guardado sin resolver ni las 19 alertas (motor de
   pendientes en diseño). Agregar cuando existan.

**Why:** el dueño quiere que ZALA deje de equivocarse en plata y sepa qué existe; la raíz era la
verdad en TS + llave maestra sobre tablas crudas.
**How to apply:** nada nuevo que muestre una cifra o estado se cierra sin su fila en el diccionario,
su columna en `zala` y su caso en el espejo. Ver [[taller-trabajo-y-cobro]] para el caso DQF56I que
sirvió de prueba (JOSE sale al día tras convenio de $932.000 que financió 2 semanas + taller +
alquiler + migración).
