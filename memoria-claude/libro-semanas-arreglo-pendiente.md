---
name: libro-semanas-arreglo-pendiente
description: El libro de semanas se arregló el 10-oct (e160c9c); queda pendiente rehacer la capacitación del tema 6 con la pantalla nueva
metadata:
  node_type: memory
  type: project
  originSessionId: ecbda5fc-4619-4e95-b4dc-d59ba138caf2
  modified: 2026-10-10T19:00:42.617Z
---

**Arreglado el 10-oct-2026 (e160c9c + mig 194 corrida).** El libro de semanas (ficha → Pagos) tenía tres
defectos de pantalla que el dueño cazó con JOSE LUIS LOPEZ PONCE (RMZ68H): «esta» en una semana vieja cuando hoy
cae en tiempo rodado, la fila de moto guardada con las fechas del calendario en vez de las reales, y días que no
eran los de Cartera. Ahora: un solo número de días, arriba, calculado con `moraDelLibro` → `diasEnMora` (168/168
iguales a Cartera), dicho de dónde sale (con acuerdo, semana + cuota juntas, D-030).

**Por qué el dueño lo quiso así:** *«porque enredarse con algo que se puede decir explícitamente»* — prefirió
un número explicado con palabras a dos números distintos. Y preguntó «¿por qué estamos haciendo esto?»: hubo que
recordarle que el libro nació de su pedido «no saben identificar las cuentas».

**How to apply:** queda pendiente (P1) rehacer la capacitación del tema 6: diapositiva 7, pantallazos `t6-*`
(`capturas-capacitacion.mjs` con sesión vía `recibe-sesion.mjs`), video 5 (`hacer-videos.mjs v5`) y el PowerPoint
(`gen-capacitacion-7oct.js 6` + `pptx-com.ps1`); volver a medir los círculos de las diapositivas 6, 9 y 13 porque
el resumen ahora tiene el bloque rojo de días. El dueño dijo «la diapositiva la arreglas después». Ver
[[feedback-explicaciones-simples]] y [[feedback-decir-de-donde-sale]].
