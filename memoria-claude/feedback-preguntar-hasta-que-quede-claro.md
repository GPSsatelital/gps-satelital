---
name: feedback-preguntar-hasta-que-quede-claro
description: "Regla del dueño (19-sep-2026): preguntar hasta que lo que se habla quede TOTALMENTE entendido, claro y bien definido. No avanzar con una parte a medias."
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-19T20:10:05.671Z
---

# Preguntar hasta que quede TOTALMENTE claro (19-sep-2026)

Pedido textual del dueño:

> *"coloquemos una regla y es la de que preguntes hasta que ya estemos completamente seguro de que
> lo que se hable quede totalmente entendido y totalmente claro y bien definido"*

**Why:** en la misma sesión, tres veces una suposición razonable resultó falsa y habría hecho daño:
- Asumí que JORGE TOVAR tenía el libro roto; era mi fórmula, que no contemplaba semanas rodadas.
- Asumí que su caso pedía tocar el motor; él solo quería **corregir un día mal digitado**.
- Asumí que "IEW65" era IEW65I **y que el cliente era el activo** — esa placa tenía DOS contratos.

Y al revés: cuando por fin pregunté *"¿por qué hay que pasarlo a los lunes?"*, la respuesta
—*"él en realidad es de los lunes, al migrarlo se equivocaron"*— **cambió el trabajo completo**:
dejó de ser una excepción a una regla del dueño y pasó a ser una corrección de un error, que es
otra cosa y se hace distinto.

**How to apply:**
- Antes de escribir SQL o código, **repetirle el plan con SUS números** y esperar el sí.
  ("Hoy paga los jueves, querés pasarlo a los lunes, quedan 4 días sueltos de $105.000 — ¿es eso?")
- Cuando haya dos lecturas posibles, **poner las dos con sus cifras** y que él elija. Nunca la
  primera que parezca razonable.
- **Preguntar el POR QUÉ, no solo el qué.** El "para qué" suele revelar que el trabajo es otro.
- Si dice *"no entendí"*, el problema es de la explicación: contarlo como una historia con fechas y
  nombres, no repetir la versión abstracta (ver [[feedback-explicaciones-simples]]).
- Un dato que solo él sabe (si salió la plata, de quién era la transferencia, cuándo estuvo
  enfermo) **no se deduce de la base**: se pregunta, aunque cueste un turno más.

Relacionado: [[feedback-explicaciones-simples]] · [[feedback-resumen-final-para-nino]] ·
[[regla-no-romper-lo-que-funciona]] · [[regla-esencia-y-rastro]]

---

# 🔴 REFORZADA EL 22-SEP — "pregunta todo lo que necesites hasta que te asegures de que tú y yo entendimos lo mismo"

Pedido textual del dueño, **para siempre**. No es "pregunta si tienes dudas": es **seguir preguntando
hasta que los dos entiendan lo mismo**, y recién ahí implementar.

## La evidencia del día: tres preguntas suyas cambiaron la solución tres veces

1. Yo iba a construir un **detector** de saldo negativo.
   Él: *"¿por qué siquiera debería existir la posibilidad de que haya saldo a favor negativo si se
   supone que saldo a favor es porque es A FAVOR?"*
   → Se construyó un **candado** que lo hace imposible (mig 166). Detectar ≠ impedir.

2. Yo daba por cerrado el caso de KEVIN diciendo *"las cuentas cuadran, nadie perdió plata"*.
   Él: *"a él se le dijo que debía 600 y pagó 795 para que no se le molestara hasta la semana del 27"*.
   → 🔑 **Que la contabilidad cuadre NO significa que nadie salió perjudicado.** El cliente decidió
   con un número que le dio la empresa. Costó $195.000 asumidos.

3. Yo iba a poner un **aviso** de que mover la fecha de fin no cambia el cobro.
   Él: *"¿cómo puede ser que se le muestre algo y se le cobre otra cosa?"*
   → **Avisar de una contradicción es aceptarla.** La fecha tiene que SALIR de las semanas: una
   sola verdad, no dos que se avisan entre sí.

## Cómo se aplica

- **Antes de construir**, repetirle el plan **con SUS números** y esperar el sí.
- Preguntar el **POR QUÉ**, no solo el qué. Sus "¿por qué?" son los que encuentran la raíz.
- Si él pregunta algo que parece obvio, **es señal de que la solución propuesta es un parche.**
- Una pregunta **a la vez** (regla vieja, sigue vigente), pero **cuantas haga falta**.
- Si responde *"no entendí"*, **el problema es de la explicación**: explicar otra vez, más simple,
  con un ejemplo o un dibujo. Y **no inventar metáforas nuevas**: el 22-sep usé "alcancía" para
  explicar el saldo a favor y lo confundí, porque en este proyecto esa palabra ya significa las
  4 cajas donde se reparte la plata. **Usar las palabras que ya salen en su pantalla.**

---

# 🔴 2-OCT — "¿en qué quedó mi regla de que no hicieras nada sin autorización?"

Con un *"continua"* arranqué a construir las 3 decisiones del 29-sep y en el camino **decidí solo 7
cosas** (extender los días del acuerdo a quien también debe la semana, inventar un mínimo "o todo lo
que le queda", cómo medir lo de NORMA, cambiar el letrero del protocolo, arreglar las 1.000 filas de
la nómina…) y se las conté **después**. Nada se había subido, pero igual rompí su regla.

Y sus preguntas cambiaron el trabajo DOS veces: *"¿eso no tiene que ver con el conjunto?"* (los días
del acuerdo se cuentan sobre semana + cuota, no por separado: JAIDER 58 → 9 días) y *"si le faltaron
$2.000 no pagó completo; tienen que guardarla o que cancele"* (sin mínimo de plata, no el mínimo que
yo había propuesto).

**How to apply:**
- **Una aprobación del plan NO aprueba las interpretaciones que salen al construir.** Cada decisión
  nueva (aunque parezca obvia o "consecuencia") se pregunta ANTES de escribir el código.
- Un "continua" o "termina" no es un sí a lo que él no ha visto: si quedan decisiones mías, listarlas
  y pedir sí/no a cada una.
- Las ventanitas de preguntas sin contexto lo confunden (*"¿de qué me hablas?"*): primero decir de
  dónde sale el tema y el ejemplo en texto, después la pregunta corta.
- Cuando él se pierde, **la finalidad** ("¿qué es la finalidad de todo?") ordena la conversación:
  decir para qué sirve cada cambio en una línea.
