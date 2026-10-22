---
name: capacitacion-7oct
description: "Capacitación del equipo del 7-oct-2026 (7 a 8 a.m.): 5 PowerPoint por tema (lo que se comparte), guion y 4 videos MP4 con voz y timbres, todo desde docs/capacitacion/contenido.js. Cómo se regenera, qué no se sube, y por qué los MP4 de Chrome no abrían en PowerPoint."
metadata:
  node_type: memory
  type: project
  originSessionId: ecbda5fc-4619-4e95-b4dc-d59ba138caf2
  modified: 2026-10-07T07:15:11.294Z
---

Pedido del dueño la noche del 6-oct: diapositivas "entendibles, dinámicas y atractivas que hasta un niño
que apenas sepa leer lo entienda", su guion ("lo que tengo que decir y cómo presentar"), y videos tutoriales
con voz e imágenes para lo difícil. Temas: (1) el día del administrador, (2) liquidaciones para la
secretaria, (3) taller/garantía/préstamo/rodar, (4) el módulo nuevo de rodar por deuda, (5) ceder un
contrato. Después pidió, en este orden: *"dámelas separadas por temas"* · *"¿por qué no en PowerPoint? así
no las puedo compartir"* · *"no dice dónde o qué tiene que presionar paso a paso"* · *"borra eso de Sergio"*
· *"los videos no se reproducen"* · *"eso va a salir del PC y funcionará en cualquier dispositivo"*.
La voz más natural (Salomé de Microsoft) la descarté con él: *"si se complica mucho déjalo así"*.

**Dónde:** `docs/capacitacion/` — **`powerpoint/` es lo que se comparte** (5 PPTX con video adentro, letra
Segoe UI incrustada, iconos PNG, guion en las notas); `videos/*.mp4` para WhatsApp; `tema-1…5-*.html` y
`presentacion.html` solo sirven con `img/` y `audio/` al lado. Todo sale de **`contenido.js`** (cada pantalla
lleva `ruta: [...]` = «Cómo llegar», el camino de botones). README de la carpeta = los 8 pasos para regenerar.

**Lo que aprendí haciéndolo (reusable):**
- Chrome (MediaRecorder `video/mp4`) entrega un **MP4 fragmentado** con duración 0 en el índice: PowerPoint lo
  rechaza (*"no puede insertar un vídeo"*) y Windows/celulares tampoco. `rearmar-mp4.mjs` lo rearma en un MP4
  normal (índice al principio, sin recomprimir); PowerPoint entonces lee la duración exacta. Verificado por COM
  (`Shape.MediaFormat.Length`) y en Chrome (saltar a 3 puntos y mirar el cuadro).
- **El servidor de prueba tiene que contestar `Range`**: sin eso Chrome "no podía saltar" en un archivo que
  estaba perfecto, y la revisión mentía. Medir con un servidor como el de verdad.
- pptxgenjs mete los SVG con una imagen de reserva genérica (100x119): en un visor sin SVG todos los iconos
  salen iguales. Solución: iconos en PNG (`hacer-iconos.mjs`, Chrome dibuja cada `<symbol>` en canvas).
- Letra: `SaveAs(ruta, 24, -1)` por COM incrusta Segoe UI (+0,8 MB por archivo); pptxgenjs no puede.
- Voz: Windows trae "Microsoft Laura" (OneCore, es-ES) por WinRT (`voz.ps1`). Timbres con WebAudio en
  `sonidos.js` (pico de la voz 0,52 → timbre 0,10), compartido por los MP4 y el reproductor HTML.
- Fotos reales con `motogestion/scripts/manual/capturas-capacitacion.mjs` (solo abre pantallas; pestañas con
  contador con `clicPestana`, nunca un botón de acción). Revisión de las 55 diapositivas:
  `revisar-diapositivas.html` (nada se sale del cuadro) + fotos con `chrome --headless --screenshot`.

**Sin probar:** los PPTX y los MP4 en un celular real (se verificó en PowerPoint de Windows y en Chrome).
**No se suben** (datos de clientes): `img/`, `audio/`, `videos/`, `powerpoint/`, `*.pdf`.
Ver [[rodar-por-deuda-d044]] · [[manual-operacion-pdf]] · [[capacitacion-material-v2]] · [[feedback-preguntas-sin-ventana]].
