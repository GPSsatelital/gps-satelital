# Capacitación del 7 de octubre de 2026

Todo sale de **`contenido.js`**: las diapositivas (con su «Cómo llegar»: el camino de botones de cada
pantalla), el guion de quien presenta, la voz de los videos y el nombre de cada archivo MP4.
Si se cambia un texto, se cambia ahí y sale igual en todos.

## Qué hay

| Archivo | Para qué |
|---|---|
| `powerpoint/` | **Lo que se comparte.** Las 5 presentaciones en PowerPoint, una por tema, con los videos adentro, la letra incrustada (se ve igual en un celular o en otro PC) y el guion en las notas. No se suben: se regeneran. |
| `videos/` | Los 4 videos en MP4 normal (abren en PowerPoint, Windows, iPhone, Android y WhatsApp). No se suben. |
| `GUION-CAPACITACION.pdf` | El guion completo, listo para imprimir (no se sube: se regenera) |
| `presentacion.html` · `tema-N-….html` | Las mismas diapositivas para abrir en Chrome (todas juntas, o una por tema). Necesitan `img/` y `audio/` al lado: no sirven para compartir sueltas. |
| `guion.html` · `guion-tema-N-….html` | Lo que se dice en cada diapositiva (se imprime con Ctrl+P) |

**Para presentar desde Chrome:** doble clic al archivo · **F** pantalla completa · flechas para avanzar ·
**N** muestra lo que se dice · los videos tienen su botón «Reproducir».

## Los videos: voz, timbres y ayudas visuales

Cada video lleva la voz de Windows («Microsoft Laura»), un timbre suave antes de cada paso y uno más
grave antes de un «Ojo» (`sonidos.js`, sin archivos de sonido), la foto que se acerca a lo que se explica,
el recuadro amarillo que late, el subtítulo y los puntos de avance.

Chrome entrega el MP4 "en pedazos" (fragmentado) y por dentro dice que dura 0 segundos: PowerPoint,
Windows y muchos celulares no lo abren. Por eso `hacer-videos.mjs` lo **rearma** con `rearmar-mp4.mjs`
(sin volver a comprimir) y después lo **comprueba** con `comprobar-video.html`: que diga su duración, que
se pueda saltar a tres puntos, y que cada frase suene cuando aparece su escena.

## No se suben al repositorio (llevan datos de clientes reales)

`img/` (fotos de la app) · `audio/` · `videos/` · `powerpoint/` · `*.pdf`. Se regeneran así, en este orden:

1. Fotos: `node motogestion/scripts/manual/recibe-sesion.mjs` y la app le entrega la sesión; después
   `node motogestion/scripts/manual/capturas-capacitacion.mjs`. Solo abre pantallas: no guarda nada.
   Las de liquidación se copian de `docs/manual-liquidacion/img/` con el prefijo `liq-`.
   Al terminar, borrar `%TEMP%\mg-sesion-manual.json` y la carpeta `%TEMP%\mg-chrome-capacitacion`.
2. Voz: `node docs/capacitacion/hacer-audio.mjs` (voz de Windows "Microsoft Laura", con `voz.ps1`).
3. Una presentación y un guion por tema: `node docs/capacitacion/hacer-temas.mjs`.
4. El servidor de esta carpeta, que necesitan los pasos 5 a 8: `node docs/capacitacion/servidor-grabacion.mjs`
   (solo escucha en este computador, puerto 8766).
5. Videos MP4: `node docs/capacitacion/hacer-videos.mjs` (graba, rearma y comprueba cada uno; unos 2 minutos por video).
6. Iconos en PNG para el PowerPoint: `node docs/capacitacion/hacer-iconos.mjs` (un PowerPoint viejo o el
   visor de un celular no muestran SVG).
7. PowerPoint: `node docs/presentaciones/_generadores/gen-capacitacion-7oct.js`, y después incrustar la letra
   con el propio PowerPoint (abrir cada archivo y guardarlo con «Incrustar fuentes», o `SaveAs(ruta, 24, -1)` por COM).
8. Revisión: `http://127.0.0.1:8766/revisar-diapositivas.html` mide si algo se sale del cuadro en alguna de las
   55 diapositivas (deja `videos/barrido.json`); el guion en PDF se imprime desde Chrome con `--print-to-pdf`.
