---
name: regla-no-romper-lo-que-funciona
description: "Regla del dueño (5-ago-2026): explicar simple y confirmar que entendió ANTES de tocar; nunca cambiar ni suponer sobre lo ya hecho; declarar en cada arreglo qué se tocó de lo existente. Incluye: un cambio de regla también rompe las PANTALLAS que la explican con palabras, no solo las que la calculan."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-06T00:27:33.494Z
---

# La regla que salió de perder días rehaciendo lo ya definido

**Está escrita en el CLAUDE.md del repo** como *REGLA DE NO ROMPER LO QUE YA FUNCIONA*, arriba de
todo, para que se lea al empezar cada sesión. Acá queda el porqué.

## Cómo la pidió él

> *"Coloca como regla: antes de hacerlo o solicitar hacer algo, asegúrate de que yo haya entendido
> y que tú me hayas explicado con palabras sencillas. Y también que nunca cambies o supongas algo
> que ya está hecho — como quien dice, que en cada arreglo notifiques si tiene o si cambió algo.
> No quiero que vuelvan a pasar cosas como estas."*

Lo dijo después de dos golpes seguidos: le rompí la regla de la última cuota de los convenios al
unificar la ventana, y ese mismo día pasamos horas re-analizando el mecanismo de semanas
financiadas — que **ya estaba definido y bien diseñado desde el 14 de julio**.

Su frase, que resume el costo: *"llevamos mucho tiempo de retraso haciendo lo mismo que ya
habíamos definido"*.

## Los cuatro puntos

1. **Explicar simple y confirmar que entendió, antes de tocar nada.** Si dice "no entendí", la
   explicación estuvo mal, no él. Se explica otra vez con un **ejemplo concreto o un dibujo de la
   pantalla**. Los menús de opciones abstractas no le sirven — lo dijo dos veces el mismo día.
   Lo que sí funcionó: dibujar el formulario con la línea nueva, y "son 4 alcancías y hoy el
   sistema adivina en cuál va la plata".
2. **Lo que ya funciona no se cambia ni se supone.** No reemplazar lo bueno por el molde de lo
   malo; no "mejorar" de paso; no suponer cómo funciona algo ya construido — abrirlo y verificar.
   Hay reglas de negocio que viven SOLO dentro del código.
3. **En cada arreglo, declarar qué se tocó de lo existente**, qué NO se tocó aunque estuviera
   cerca, y qué puede verse distinto. Si no toca nada, decirlo también.
4. **Antes de culpar a un cambio propio, verificar con datos.** Vale en los dos sentidos.

## 🔴 Un cambio de regla también rompe las pantallas que la EXPLICAN (5-ago, noche)

Caso que lo probó: el 4-ago cambié `fechaDeCaja()` para que la transferencia contara en el día del
banco. El cálculo quedó bien y protegido con pruebas. Pero la ventana **"💰 Pagar" de Cartera**
siguió con la casilla llamada *"¿Cuándo hizo la transferencia?"*, puesta en hoy, y avisando
*"la plata entra a la caja de **hoy**"* — verdad con la regla vieja, **mentira desde ese día**.

Resultado: una funcionaria dejó la fecha como venía —haciendo exactamente lo que la pantalla le
decía— y **$262.000 que el banco recibió el 4 quedaron en la caja del 5**. El dueño preguntó
*"¿el error fue de la funcionaria o del sistema?"*. Fue del sistema. Mío.

**La regla que sale de ahí:** al cambiar una regla de negocio, hay que buscar **TODAS las pantallas
que la explican con palabras**, no solo las que la calculan. `tsc` y las pruebas no ven un texto
que quedó mintiendo — y un texto que miente es peor que no tener texto, porque dirige a la persona
al error con confianza. Mecánica: `grep` de las frases que describen la regla vieja (acá bastaba
buscar *"caja de hoy"*), no solo de la función que cambió.

Es hermano del patrón de [[regla-inmovilizar-y-convenios]] (*"¿todas las puertas hacen lo mismo?"*).
Ahora son dos preguntas obligatorias al tocar cualquier regla:
**¿todas las puertas hacen lo mismo?** y **¿todas las pantallas dicen lo mismo?**

## Lo que la disparó, para no repetirlo

- **El build en verde no prueba nada sobre el comportamiento.** Ver
  [[regresion-convenio-y-reglas-de-seguridad]].
- **Deducir en vez de medir.** Dos veces el mismo día afirmé algo (JORGE, FRAIRON) y los datos me
  desmintieron. Ver [[cartera-doble-cobro-deuda-vs-caja]].
- **Re-analizar lo ya diseñado** cuesta tanto como romperlo: el mecanismo `cubre_periodo_hasta` +
  el disparador de la mig 054 estaban bien pensados; solo les faltaba un pedazo.
