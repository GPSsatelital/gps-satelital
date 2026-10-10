---
name: libro-semanas-arreglo-pendiente
description: "Tres defectos de pantalla del libro de semanas (9-oct) que esperan el «1» del dueño, con los casos reales y lo que hay que corregir en la capacitación"
metadata:
  node_type: memory
  type: project
  originSessionId: ecbda5fc-4619-4e95-b4dc-d59ba138caf2
  modified: 2026-10-10T00:27:05.109Z
---

El libro de semanas (ficha → Pagos, `utils/libroSemanas.ts`, en producción desde 1c670d6) tiene tres defectos
de pantalla, no de plata. El arreglo se le propuso al dueño con dibujo el 9-oct noche y **espera su «1»**.

1. **«esta» en la semana equivocada** cuando hoy cae dentro del tiempo rodado: `vaEn = indiceHoy + previas − exo`
   supone que todas las rodadas quedaron atrás. Casos: JOSE LUIS LOPEZ PONCE (RMZ68H, guardada 13-ago → 9-oct,
   8 rodadas, «esta» en la semana 43 de agosto) y ERICK RODRIGUEZ (DQG87I).
2. **La fila rodada dice «Moto guardada · 19 ago al 13 oct»**: son las semanas del calendario de pagos que no se
   cobran, no las fechas reales (13-ago → 9-oct). 22 filas así.
3. **Días:** el libro dice «venció el 5 oct (4 días)» (desde que venció); Cartera «3d en mora» (quita la gabela).

**Por qué importa:** el dueño lo cazó solo («¿por qué las rodadas están después de la actual?») y la diapositiva
de los colores del tema 6 afirma que los días son los mismos de Cartera — falso. La mig 194 repite esa frase y
**no se ha corrido**.

**How to apply:** al arreglar, cambiar el texto de la diapositiva, recapturar los pantallazos t6 y el video 5
(`docs/capacitacion/`: `capturas-capacitacion.mjs` con sesión vía `recibe-sesion.mjs`, `hacer-videos.mjs v5`,
generador `gen-capacitacion-7oct.js 6` + `pptx-com.ps1` para incrustar letra), corregir la mig 194 y agregar
pruebas con RMZ68H y DQG87I. Ver [[feedback-preguntar-hasta-que-quede-claro]] y `docs/DERRAPES.md` (9-oct).
