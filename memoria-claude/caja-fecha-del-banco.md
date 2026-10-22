---
name: caja-fecha-del-banco
description: "4-ago ✅ EN PRODUCCIÓN: la transferencia cuenta en la caja del día del banco, el cierre se puede recalcular, y la plata sin dueño ya se ve. Verificado en la app."
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-27T21:18:20.043Z
---

# ✅ La caja arreglada de raíz (4-ago-2026) — `main` = `b3b546c`

Todo desplegado y **verificado en la app con sesión real**. 94 pruebas en verde.

## El problema que lo destapó todo

El dueño: *"al parecer los pagos se están contando doble o se están contando a la caja del día que
se digitan"*. Lo segundo era cierto y era **casi todo**: la secretaria digita en la mañana lo del
día anterior, así que la plata que el banco recibió el lunes caía en la caja del martes.

Medido con sus datos: **la caja del martes 4 tenía $6.193.000 en transferencias, de los cuales
solo $210.000 habían entrado ese día.** El 97% era del lunes. Con eso el arqueo comparaba la plata
tecleada hoy contra el extracto de hoy —dos conjuntos distintos— y **ningún día podía cuadrar**.
Doble conteo NO había: cada peso aparecía una sola vez.

## La regla nueva (una función, 7 pantallas la heredan)

```
Efectivo      → el día en que se DIGITÓ (llega a la mano, se cuenta ese día)
Transferencia → el día en que EL BANCO la recibió
```
`fechaDeCaja()` en `usePagos.ts`. **El efectivo no se tocó.** El sistema ya hacía esto para las que
cruzaban con el extracto; esto lo extendió a todas. Protegido por `fechaDeCaja.test.ts`.

**Decisión del dueño (opción A de tres):** día del banco + cierre recalculable. Sabía y aceptó que
los cierres firmados dejan de ser definitivos.

## Lo que se construyó encima, en orden

1. **Aviso de "⚠️ El cierre cambió"** + botón *Actualizar cierre*, en los DOS lugares donde se ve un
   grupo cerrado. `cierreDesactualizado()` en `useCaja.ts` + 8 pruebas. Avisa aunque el total no
   cambie pero sí el reparto efectivo/transferencia. Al actualizar **se precarga el arqueo
   anterior** (el guardado es un upsert: dejarlo vacío pisaba con null el conteo ya hecho) y queda
   escrito en las notas de cuánto a cuánto se movió.
   *Verificado en vivo: COSTA del 30-jul se cerró en $2.641.000 y el día tiene $4.053.000.*
2. **Cobro Diario ya pregunta qué día entró la transferencia** — antes grababa siempre hoy.
3. **Panel del SOCIO**: le faltaba `esPagoDeCaja` a sus 3 cifras → mostraba los movimientos
   internos como ingreso. Y sus barras usaban `toISOString()` (UTC) → se corrían un día después de
   las 7pm. Ambas corregidas. **NO se tocó `estadosPorContrato`**: ahí un adelanto de base SÍ es un
   pago del cliente.
4. **La plata sin dueño ya se ve** (pedido del dueño: *"esa plata sí debería verse porque si entró
   en la cuenta"*). Renglón propio, **nunca sumada al recaudo** — al reclamarla se registra como
   pago y entra al recaudo de ESE MISMO día; si estuviera dentro quedaría doble. Vale la identidad:
   *lo que el banco recibió = transferencias registradas + lo que sigue sin dueño*.
   **El arqueo ahora la suma a lo esperado**: antes la reportaba como sobrante todos los días
   aunque estuviera anotada, y una alarma que suena siempre deja de leerse.
   Una partida **sin grupo no se le suma a ningún portafolio** — sería meterle al bolsillo de un
   socio plata que quizá es de otro.
5. **Aviso de partida que ya tiene pago** — el cruce solo mira hacia adelante, así que si el pago se
   registró ANTES de anotar la partida nadie las junta nunca. Se compara **solo por referencia**,
   nunca por monto (un lunes hay once transferencias de $202.000).
6. **"Total general" → "Cobrado a clientes"** en los 3 rótulos: desde que la plata sin dueño va
   aparte, esa cifra ya no es el total de nada.

## Cuentas bancarias (migs 080 + 081) — ✅ corridas

Antes las cuentas de la empresa no existían en el sistema. Ahora `cuentas_bancarias` con
`grupos text[]`: **una cuenta puede recibir de varios grupos y un grupo tener varias cuentas.**
Mapa del dueño: COSTA → Bancolombia + Nequi · PRADERA → Nequi · RASTREADOR y USADAS comparten Nequi.

- **Configuración → 🏦 Cuentas bancarias** (solo ADMIN/AP). Se desactivan, no se borran.
- **La bolsa pregunta "¿a cuál cuenta entró?"** —el hecho que se lee del extracto— y deduce el grupo
  solo si esa cuenta es de uno solo; si es compartida lo dice y la deja sin grupo. Antes heredaba
  el grupo **del filtro de la pantalla**: mirando COSTA se marcaba COSTA plata de PRADERA.
- **Botón "🏦 Cuentas para pagar"** en Cartera: manda por WhatsApp las cuentas del grupo de SU moto.
  Texto editable en Configuración → Mensajes de WhatsApp, comodines `{nombre} {placa} {cuentas}`.

🔲 **FALTA que el dueño escriba las 4 cuentas.** Sin eso el desplegable sale vacío y toda la plata
sin dueño sigue en "no se sabe de cuál grupo es".

## ✅ VERIFICADO EN LA APP con sesión real (5-ago, tarde)

- **"Cobrado a clientes"** en los 3 rótulos · **plata sin dueño en la caja de SU día**: hoy $40.000,
  25-jul $102.000, con el total sumando exacto ($2.810.000 + $102.000 = $2.912.000).
- **🔒 Retenidos: 29** contratos operables. Los contadores cuadran solos: 269 total − 29 retenidos
  = 240 = 133 en mora + 107 al día. Confirma que los suspendidos quedan fuera de la gestión diaria.
- **Placa con su grupo debajo** en toda la lista · **Club Moteros Cartagena** en menú y documentos.
- **Cero errores de consola.**
- 🔴 **LA PRUEBA QUE IMPORTABA**: las **23** partidas ya reclamadas cayeron en la caja del día EXACTO
  en que el banco recibió la plata. Ninguna descuadrada. El circuito dinero-sin-dueño → pago →
  caja del día del banco funciona de punta a punta.

⚠️ **Trampa al verificar**: leer la pantalla apenas carga da TODO EN CERO (contratos y motos aún
descargando) y parece que la app está rota. Recargar y volver a leer antes de sacar conclusiones.

## ✅ mig 085 — los ingresos por multa se ven aparte

`pagos.aplicado_multa`. Se calcula **sin tocar los ciclos de reparto**: como desde la 083 la multa
se cobra de primera, la parte que fue a multa es `min(aplicado_deuda, multa pendiente ANTES de
repartir)`. Una foto al entrar, un dato al salir. En Caja Diaria sale bajo "Cobrado a clientes":
*"🔒 De eso, multas de recolección: $X"* — DENTRO del total, no aparte.
⚠️ Solo cuenta de la 085 en adelante; los pagos de multa viejos quedan en cero.

## ✅ Privacidad de los montos + "Llegó al banco" arriba (5-ago, noche)

- **`MontoOculto`** (`src/components/MontoOculto.tsx`): el recaudo va TAPADO (`••••••`). Un toque
  lo muestra, otro lo tapa, **y a los 5 segundos se tapa solo**. Motivo del dueño: *"los clientes
  mirones que de pronto ven la pantalla"*.
  - Se probó primero con "mantener presionado" y **no le gustó**; quedó al clic.
  - El temporizador es lo que de verdad protege: cambiar de pantalla ya lo tapa gratis (el
    componente se destruye), pero el caso peligroso es quedarse en la MISMA pantalla mostrándole
    algo al cliente.
  - Se descartó un botón fijo de mostrar/ocultar: alguien lo deja prendido y se olvida.
  - **`GrupoMontoOculto`** envuelve varios montos para que un solo toque los muestre todos — el
    del día y el de "Semana" eran dos botones sueltos y quedaba raro uno destapado al lado del otro.
  - Detalles que sin ellos no servía: `stopPropagation` (viven dentro de tarjetas que navegan al
    tocarlas) y bloquear selección/menú de copiar de Android (tapaba el número justo al verlo).
  - Está en Cartera (Recaudado hoy + Semana) y el Panel (Recaudo del día + Semana).
- **Cuarta tarjeta "LLEGÓ AL BANCO"** en la cabecera de Caja Diaria, con el total incluyendo la
  plata sin dueño. Antes solo estaba abajo en el Resumen del día y había que bajar la pantalla.
  Solo aparece cuando ese día hubo plata sin dueño.

## 🔴 5-ago: el cambio dejó UNA pantalla diciendo lo contrario (commit `407beb0`)

Caso real: **$262.000 que el banco recibió el 4 quedaron en la caja del 5.**

1. La transferencia se le registró **por error a DENILSON IGLESIAS (RLY54H)** — eso sí fue humano,
   el sistema no puede adivinar de quién es una transferencia.
2. FREDY la borró ✔️ y se volvió a registrar al dueño real, **YONAIKER MONTAÑO (YAL60H, COSTA)** ✔️
3. …pero **con fecha de hoy**. La casilla venía en hoy, se llamaba *"¿Cuándo hizo la
   transferencia?"* y avisaba *"la plata entra a la caja de **hoy**"* — cierto con la regla vieja,
   **falso desde el 4-ago**.

**La funcionaria hizo lo que la pantalla le decía.** El defecto fue mío: arreglé ese texto en
`CobroDiarioView` y **olvidé la ventana "💰 Pagar" de Cartera**, que es la puerta más usada.
Inmovilizaciones no aplica (solo registra efectivo).

Arreglado: etiqueta → **"¿Qué día entró la plata al banco?"** + explica a qué caja va en los DOS
casos (fecha de hoy y fecha anterior). Verificado a 375px, 99 pruebas en verde.

⚠️ **Otras mal fechadas NO se pueden detectar desde el sistema**: una transferencia que de verdad
entró hoy y una mal fechada se ven idénticas. Solo se ven contra el extracto — y la ventana
afectada son solo el **4 y el 5 de agosto**.

🔴 **EL MISMO PATRÓN DE SIEMPRE, en otra forma**: al cambiar una regla hay que buscar TODAS las
pantallas que la **explican con palabras**, no solo las que la calculan. `tsc` y las pruebas no ven
un texto que quedó mintiendo. Antes fue "¿todas las puertas hacen lo mismo?"; ahora es
**"¿todas las pantallas dicen lo mismo?"**.

💡 **Receta de diagnóstico que funcionó**: el aviso *"⚠️ El cierre cambió"* fue el que lo destapó.
El rastro del borrado vive en `contratos_auditoria` con `campo = 'Pago eliminado'` — **pero NO
guarda la referencia bancaria ni la foto del comprobante**, que en una transferencia son la prueba
de que la plata entró. Si el dueño no se acuerda de quién era, se pierde.

**✅ CORREGIDO Y VERIFICADO EN LA APP (5-ago, noche):** el UPDATE devolvió el pago de YONAIKER
(YAL60H, $262.000) a `fecha = 2026-08-04`. Caja COSTA del 4: $7.039.000 → **$7.301.000 y "✓
Cerrada"** — el aviso amarillo **se apagó solo, sin recerrar nada**, porque el cierre firmado
siempre estuvo bien; lo malo era la fecha del pago. Caja del 5: $3.772.000 → $3.510.000. Un solo
pago se movió, nada más. Los **$260.000 de DENILSON sí entraron el 5** → estaban bien donde estaban.

💡 **Receta para corregir la fecha de un pago** (SQL idempotente que se revisa solo): un CTE
`objetivo` que lo localiza + un CTE `cambio` que hace el update **solo si la fecha difiere**, y un
select final que devuelve `pagos_encontrados / pagos_corregidos / fecha_que_tenia_antes`. Correrlo
dos veces no hace daño y siempre dice qué pasó. Evitó una discusión de "creo que ya lo corrí".
⚠️ **Verificar contra la app SIEMPRE recargando**: `createTableStore` cachea 60 s en memoria (no en
localStorage), así que un reload completo basta — pero sin reload se lee dato viejo.

**🔲 Quedó pendiente de este caso:**
- **8 partidas sin dueño sin grupo** (4/8 $202.000 · 3/8 $202.000/$95.000/$80.000/$60.000 ·
  31/7 $80.000 · 27/7 $50.000 · 25/7 $102.000): son de antes de que existieran las cuentas
  bancarias. Se corrigen borrando y volviendo a registrar con la cuenta marcada.
- **Dos arreglos propuestos y NO aprobados** (el dueño eligió solo el de la casilla): el aviso de
  *"salieron $X"* explica el caso contrario cuando la plata SALE, y guardar referencia+comprobante
  al borrar un pago.

## ✅ Las 4 cuentas bancarias ya están cargadas (5-ago)

Bancolombia 78400006116 → COSTA · Nequi 3128317132 (Yeiner) → COSTA · Nequi 3009569084 (Wilder)
→ PRADERA · Nequi 3044192404 (Yeny) → RASTREADOR. Verificado en el desplegable.
**Cada cuenta es de UN solo grupo** → el sistema siempre puede deducir el portafolio; el caso de
"cuenta compartida" no existe en la operación real. ⚠️ **USADAS quedó sin cuenta**, y el dueño
había dicho que *"rastreador y usadas comparten el mismo nequi"* — sin confirmar si es olvido.

## 🔲 Pendiente aquí

- **El arqueo comparado contra la cuenta de cada grupo** — le quitaría a la secretaria el trabajo
  manual de separar el extracto grupo por grupo. Es lo más valioso que queda; se dejó para cuando
  lo demás esté rodando.
- Al entrar van a aparecer **muchos cierres viejos en amarillo de golpe**: es correcto, toda la
  plata vieja se acomodó en su día.

## ✅ La plata contada dos veces al confirmar un cobro de campo (25-ago, `0f5d49d`)

Caso YERMIN RODRIGUEZ (XZN83H, $400.000): la secretaria confirmó el pago desde **Caja Diaria**
ANTES de que el funcionario tocara "entregué a secretaria" → el mismo dinero salía en los dos
bloques del día: *"pendiente entregar $400.000"* Y *"efectivo recibido $400.000"*.
**Causa:** Cartera tenía el candado (solo muestra Confirmar si `entregado_caja`), Caja Diaria no.
**Arreglo — en el embudo, no otro candado:** `confirmarPago()` marca `entregado_caja = true`
cuando el pago es de campo (confirmar = la plata ya está en la mano). Cierra la puerta por TODAS
las pantallas, incluidas las que se construyan después. El tipo del pago se lee de la BD, no del
store (que puede no tener la fila por la ventana de días). Datos corregidos por SQL + barrida
general de casos viejos: 0 descuadrados.
🔑 **Patrón para repetir:** cuando dos pantallas hacen lo mismo y solo una tiene el candado, el
arreglo va en la función común — no en la pantalla que se olvidó.

## ✅ El saldo a favor que PARECÍA entrar dos veces (27-ago, dentro de `f98d190`)

Caso **ALEJANDRO NIETO (RMZ60H)**, traído por el dueño con una captura: *"creo que se están contando
dos veces — el día en que ingresó el dinero y el momento en que se aplica"*.

```
24-ago  $80.000  plata de verdad → no había cuota que cobrarle, quedó a su favor
26-ago  $80.000  la MISMA de arriba, aplicada ese día  ← el renglón que asustó
26-ago  $50.000  plata de verdad
```
Entraron **$130.000**, no $210.000.

**La caja diaria nunca estuvo mal:** `esPagoDeCaja()` ya excluía `saldo_favor` y `adelanto_base`.
**El error real estaba en los "total pagado"**, que sí los sumaban como plata nueva — en 4 pantallas:
ficha del cliente (y sus 3 KPIs Confirmados/Efectivo/Transferencia), ficha de la moto, Contratos y
el estado de cuenta de Cartera. Arreglado con el mismo filtro. **Ningún dato ni deuda cambió**: era
cómo se *sumaba*, no lo que se debía.

**Por qué se veía como plata doble:** los movimientos internos se insertan con `metodo = "Efectivo"`,
así que en la lista salían idénticos a un pago real. Las etiquetas que lo desmienten
(*"No entró dinero"* + *"No es un pago nuevo: se usó la plata que ya había abonado antes"*) ya
existían desde `67d18f1` (31-jul, caso RMB51H) — y **en Historial de Pagos los internos se suman
aparte**, para que la cuenta cierre y nadie se pregunte dónde quedaron.

🔑 **Confirma el patrón de este archivo:** el dueño desconfió mirando la LISTA, no el total. Una
cifra correcta con una etiqueta ambigua se lee como un cobro doble — y hace perder una tarde en
verificar plata que siempre estuvo bien.

Ver [[saldo-favor-y-caja-descuadre]] · [[cartera-doble-cobro-deuda-vs-caja]] · [[bug-aplicar-saldo-favor]].
