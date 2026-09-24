---
name: prestamo-liquidacion-verificados
description: "Ciclo taller→préstamo→devolución→liquidación probado en sandbox (26-jul) — 3 defectos arreglados, incluido un BLOQUEO total del préstamo"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-31T18:44:20.431Z
---

El usuario insistió (con razón) en que préstamo y liquidación no podían quedar sin probar antes
del go-live. Probado el ciclo completo en sandbox. Commit `87f52da`.

## 🔴 El hallazgo grande: el préstamo estaba BLOQUEADO de raíz
La lista de "Nueva orden de taller" (`TallerView.tsx:551`) solo ofrecía motos
`Disponible/Mantenimiento/Recuperada/Garantia` — **las 248 en estado `Asignada` (las que están
con clientes) no aparecían**. Y como el préstamo exige que la moto esté en taller, el escenario
más común (*se le daña la moto a un cliente al día y pide una prestada*) era **imposible de
ejecutar**. El único camino era cambiar el estado a mano en Motos, sin dejar orden ni
diagnóstico ni costo.
**Fix:** incluir `"Asignada"` en la lista. El regreso ya estaba resuelto
(`estadoMotoTrasLiberar` la devuelve a Asignada al cerrar la orden).

## 🔴 El préstamo movía plata entre portafolios de socios
El grupo se deriva `contrato → moto → grupo` y el préstamo cambia `contratos.moto_id`. **Medido:**
un pago del 13-jul de un cliente de COSTA pasó a contar para PRADERA al prestarle una moto de ese
grupo — y afectaba **todo el historial**, no solo esos días. Con 4 portafolios que rinden cuentas
por separado, descuadra a los socios.
**Fix:** helper `motoDelPortafolio()` en `usePrestamos.ts` — con préstamo activo el grupo se
resuelve por la moto **original**. Aplicado en `CajaView` (cierre por grupo), `CobroDiarioView` y
**`ReportesView`** (commit `3b18776` — ahí también salían mal `grupo`, `adminId` y `asignadoDesde`,
y es el informe que se le muestra a los socios; la placa se deja como está porque es la que rueda).
`DashboardView:245` usa el grupo solo para `corteMigracionGrupo` (cálculo de mora), no para plata.

## 🟡 El pool recomendaba prestar motos retenidas por mora
Decía *"presta primero las disponibles **o de mora**"* y las ordenaba primero — pero esas tienen
dueño con 7 días para pagar y recuperarlas. Ahora solo las Disponibles van primero y el aviso
explica el riesgo de quedar comprometido con dos personas.

## ✅ Verificado funcionando (ciclo completo en sandbox)
orden de taller → moto a Mantenimiento → préstamo (swap ok, plata sigue en COSTA) → alquiler
$27.000 **sin tocar el motor de cajas** (trigger 053 correcto) → devolución (swap de vuelta,
prestada a Disponible, préstamo cerrado) → `ModalResolverTiempoFueraServicio` se abre solo y
"Resolver después" no escribe nada → liquidación por cumplimiento (LIQ-0001, orden de taller
vinculada, 6 etapas) → **cliente Egresado · contrato Finalizado · moto En traspaso**.
Ese último paso **confirma que el bug del `Egresado` (mig 067) quedó realmente arreglado**.

## ✅ Folio de liquidación arreglado (commit `115ab51`, **mig 068 ✅ corrida**)
`generarNumero()` hacía `COUNT(*)+1`: dos personas liquidando a la vez sacaban el mismo folio, y
borrar una liquidación hacía retroceder el contador y reusar un número ya impreso. Ahora sale de
la secuencia `liquidaciones_numero_seq` vía `siguiente_numero_liquidacion()` (atómica, nunca
retrocede), con respaldo al camino viejo si la migración no está corrida.
⚠️ **Dos errores míos al aplicarlo, ya corregidos:** (1) el `setval` inicial leía `last_value` sin
mirar `is_called` — una secuencia nueva lo reporta en 1 aunque no se haya usado — así que el
primer folio salía LIQ-0002; (2) verifiqué llamando la RPC 4 veces y **cada llamada quema un
folio**, dejando el contador en 5. Reseteado a `setval(seq, 1, false)`. Lección: no probar una
secuencia consumiéndola.

## 📌 30-jul: reglas del dueño + 4 huecos que destapó (commits `2236100`, `e74dfe2`, `5a4b491`)

Disparado por un caso real: **IGC60I entró por garantía** y había que prestarle otra.

**LAS REGLAS (canónicas, ya en CLAUDE.md):**
- **Dos motos = dos cobros.** El contrato original **NO se pausa**, sigue contando normal. Y la
  prestada se cobra **aparte** a $27.000/día — *"porque es otra moto que está usando y
  desgastando"*. Nada más: no hay un tercer cobro por los días parados.
- El alquiler **se cobra enseguida, todos los días**. Si se atrasa queda como deuda y el
  funcionario **le hace un convenio**. No bloquea la devolución de su moto propia.
- **Las cuentas de las dos motos NUNCA se mezclan.**
- Al recuperar la propia: se cobra lo que debía **de antes** de guardarla (eso no se rueda), y lo
  único rodable es el tiempo guardado — **solo por PERÍODOS COMPLETOS**: *"rodar 3 días de una
  semana descuadra muchas lógicas y cuentas"*.
- El contrato es **por pagos completados, no por tiempo**: que pague ahora o después no cambia el
  total, pero la meta es que pague de una y extender lo menos posible.

**LOS 4 HUECOS (todos verificados en el código, no supuestos):**
1. ✅ **Prestar borraba el número de caso de la garantía.** `prestarReemplazo` pisaba el estado de
   la moto original con `"Mantenimiento"` sin mirar qué tenía; eso disparaba el candado de la mig
   075 y borraba `retencion_fecha/numero_caso/detalle`. Ahora respeta Fiscalía/Tránsito/Garantía.
2. ✅ **El alquiler se evaporaba.** El panel mostraba "$27.000/día" como **texto fijo**: nadie
   sumaba días ni restaba pagos, y al devolver se cerraba el préstamo sin dejar deuda. 10 días sin
   pagar = $270.000 que desaparecían. Ahora hay cuenta corriente y el saldo queda como deuda
   (concepto `otro` — `deudas_concepto_check` no tiene uno de alquiler; **se evitó a propósito
   crear otra migración pendiente**).
3. ✅ **El alquiler entraba al portafolio equivocado.** `motoDelPortafolio` mandaba TODOS los pagos
   del contrato al portafolio de la moto original, incluido el alquiler. Un socio prestaba su moto,
   se le desgastaba, y el ingreso se lo llevaba otro. El comentario del propio código lo reconocía
   ("el alquiler del reemplazo sí es ingreso aparte") **pero la función no lo hacía** — estaba
   escrito como intención, no como código.
4. 🔨 **`ModalResolverTiempoFueraServicio` tenía las DOS opciones rotas.** "Cobrar" creaba deuda de
   días × tarifa encima de las cajas ya exigidas (**doble cobro**), y **"rodar" no hace nada real**:
   solo mueve `fecha_fin_contrato`, que es informativa. Se dejó **informativa** para motor v2
   (explica ambas cosas en pantalla) y se agregó el candado de períodos completos para v1.

**✅ BLOQUE C CONSTRUIDO (31-jul, commit `2a33a8b`) — ⚠️ mig 078 PENDIENTE DE CORRER.**
`contratos.cajas_exoneradas`: un acumulador que se **resta de `cajas_exigidas()`**.

🔑 **La decisión de diseño que hay que entender antes de tocar esto:** la resta va **ANTES del tope
de `total_cajas`**. Si fuera después, las exigidas nunca pasarían de (total − exoneradas) y **el
contrato JAMÁS podría terminar** — las últimas N cajas no se exigirían nunca. Restando antes, la
curva de exigencia se corre N períodos y con el tiempo vuelve a alcanzar `total_cajas`: paga las
mismas cajas, N períodos más tarde. **Hay una prueba que protege justo eso** (con 2 rodadas, a 2
años vista llega igual a sus 104 cajas): si alguien mueve la resta, esa prueba se cae. 41 tests.

Se tocaron **las dos** funciones espejo: `public.cajas_exigidas()` (SQL) y `cajasExigidasHasta()`
(cicloPago.ts). Son la única fuente de la exigencia — de ahí cuelgan el motor de reparto, la mora,
el "debe hoy" y el desglose. **Si algún día se toca una, hay que tocar la otra.**

La columna nace en 0 → **no cambia nada para los 260+ contratos vivos**. Si la mig no se corrió,
rodar falla con un mensaje que lo dice, no en silencio.

⚠️ **Nada de lo del 30-jul se probó en la app** (el dev server apunta a producción). Falta el ciclo
completo: marcar garantía → prestar → cobrar alquiler → devolver debiendo → ver la deuda creada.

## 🔲 Pendientes conocidos
- **La liquidación deja una orden de taller abierta** — es por diseño (revisión obligatoria para
  calcular daños), pero **el mecánico debe saber que esas órdenes son suyas y hay que cerrarlas**,
  o la moto queda marcada "en taller" y se cuela en Inmovilizaciones como varada. Va al manual.
- Al limpiar: las órdenes de taller y las motos **no se pueden borrar desde la app** (RLS) —
  hay que hacerlo por SQL, y borrando `taller` por `moto_id` (la liquidación crea su propia orden
  con otro texto, así que filtrar por el texto de la prueba no basta).
