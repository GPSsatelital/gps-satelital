---
name: pendientes-16-sep
description: "Los 6 pendientes que pidió el dueño el 16-sep-2026: fiscalía fuera de retenidas, visitas por orden cronológico, base y nombre en pendientes-de-entregar, wizard (placa visible + confirmación final + no perder el progreso), buscador y placa en liquidaciones, y usar el EXCEDENTE de la base inicial."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-16T17:08:02.709Z
---

# Los 6 pendientes del 16-sep-2026

## ✅ 5 HECHOS (`6f0cfdb` y `7933539`). Queda solo el 6: el excedente de la base.

**El wizard (4):** la causa del "se devuelve del paso 4 al 2" era que `wizardStep` solo reconocía
TRES posiciones (2, 3 y 6). El avance **siempre estuvo guardado** —cada paso deja su huella en la
fila del contrato (moto · PDF contrato · PDF pagaré · foto certificado)— solo faltaba leerlo: sin
columna nueva. Más la placa en la cabecera y la **casilla** de revisión final (casilla y no
`confirm()`: el popup se cierra de memoria).
🔲 Los pasos 3 a 6 no se pudieron ver en pantalla — exigen crear un contrato real. Los prueba el
dueño en la próxima entrega.

**Fiscalía (1):** categoría `patios`, fuera del montón pero con chip propio — **no** se sacó de los
datos porque de esa lista sale el préstamo de reemplazo. **Tránsito va con ella** (dueño: "también
se retienen allá, pero no duran más de una semana"). De paso: el conteo estaba en tres lados y
quedó en uno (`retenidasDelMonton`).

**Cola de entrega (2 y 3):** ordena por la PRIMERA visita aprobada; sin visita, al final. Base y
nombre completo con `tituloCompleto` — opcional, las demás listas siguen densas. En las DOS listas.

**Liquidaciones (5):** buscador por nombre/cédula/N°/placa + placa en cada renglón.


Dictados por el dueño de corrido. Orden de riesgo, no de cómo los dijo.

## 4. 🔴 EL WIZARD — es el de más riesgo (errores humanos reales)
Textual: *"que el número de placa del vehículo a entregar aparezca visible en TODOS los pasos"* ·
*"al final salga a confirmar los datos como nombre y placa bien claros y llamativos, para que se
tenga que leer sí o sí, porque a veces hay errores humanos"* · *"que guarde los procesos de cada
paso: que si se corta por algún motivo no se devuelva del paso 4 al 2 otra vez"*.
Tres cosas distintas: (a) la placa siempre a la vista, (b) una confirmación final imposible de
saltarse, (c) **persistir el avance** — hoy si se corta el internet se pierde y hay que rehacer.

## 6. 🔴 EL EXCEDENTE DE LA BASE INICIAL
*"terminar el tema de los que se les van a usar el excedente de las bases iniciales como tarifa o
pagos normales"*.
⚠️ **OJO — esto ya se construyó una vez y se revirtió.** La regla que él cerró después:
*"ni la base ni el ahorro se pueden usar para nada según lo ya establecido; lo único que se puede
usar son los saldos a favor que el cliente dé de más, y en los casos que dan más de lo que debían
haber dado en la base inicial y les queda ahí"*.
O sea: **NO se toca la base ni el ahorro. Sí se puede usar el EXCEDENTE** — lo que entregó por
encima de lo exigido. Casos reales: **XZN82H (INGRID URBINA)** e **IEW90I (PEDRO FLOREZ)**.
Ver [[base-inicial-circuito-completo]] y [[base-inicial-vs-ahorro-acumulado]] antes de tocar nada.

## 1. Fiscalía fuera del listado de retenidas
*"aunque están retenidas no aparezcan en la lista: esas motos están en los patios, no hay que
hacerles gestión, no están en la empresa y solo hay que esperar a que las liberen — no depende de
nosotros"*. Es una lista de trabajo; lo que no se puede trabajar no va ahí.

## 2. Visitas en orden cronológico
*"el primero al que se le haga la visita, el primero que salga en el listado para entregar la
moto"*. Hoy no respeta ese orden.

## 3. Clientes → pendientes para entregar
Tras la visita, mostrar **el valor de base entregada** y el **nombre completo**: hoy se "mocha en
los laterales" y no se alcanza a leer.

## 5. Liquidaciones: buscador + placa
Filtro de búsqueda, y que salga **la placa que tuvo asignada en ese contrato** — para identificar
rápido a alguien.

Relacionado: [[liquidaciones-auditoria-y-huecos]] · [[regla-no-romper-lo-que-funciona]]
