# Capacitación del 7 de octubre de 2026

Todo sale de **`contenido.js`**: las diapositivas, el guion de quien presenta y la voz de los videos.
Si se cambia un texto, se cambia ahí y sale igual en los tres.

## Qué hay

| Archivo | Para qué |
|---|---|
| `presentacion.html` | Las 55 diapositivas juntas |
| `tema-1-…html` a `tema-5-…html` | Una presentación por tema (pedido del dueño) |
| `guion.html` · `guion-tema-N-…html` | Lo que se dice en cada diapositiva (se imprime con Ctrl+P) |
| `GUION-CAPACITACION.pdf` | El guion completo, listo para imprimir (no se sube: se regenera) |
| `videos/` | Los 4 videos en MP4, para mandar por WhatsApp (no se suben) |
| `powerpoint/` | Las 5 presentaciones en PowerPoint, con los videos adentro y el guion en las notas (no se suben). Se hacen con `docs/presentaciones/_generadores/gen-capacitacion-7oct.js` |

**Para presentar:** doble clic al archivo (se abre en Chrome) · **F** pantalla completa · flechas para
avanzar · **N** muestra lo que se dice · los videos tienen su botón «Reproducir».

## No se suben al repositorio (llevan datos de clientes reales)

`img/` (fotos de la app) · `audio/` · `videos/` · `*.pdf`. Se regeneran así:

1. Fotos: `node motogestion/scripts/manual/recibe-sesion.mjs` y la app le entrega la sesión; después
   `node motogestion/scripts/manual/capturas-capacitacion.mjs`. Solo abre pantallas: no guarda nada.
   Las de liquidación se copian de `docs/manual-liquidacion/img/` con el prefijo `liq-`.
   Al terminar, borrar `%TEMP%\mg-sesion-manual.json` y la carpeta `%TEMP%\mg-chrome-capacitacion`.
2. Voz: `node docs/capacitacion/hacer-audio.mjs` (voz de Windows "Microsoft Laura", con `voz.ps1`).
3. Una presentación y un guion por tema: `node docs/capacitacion/hacer-temas.mjs`.
4. Videos MP4: servir esta carpeta con un servidor que acepte `POST /guardar` en el puerto 8766 y
   correr `node docs/capacitacion/hacer-videos.mjs` (usa `grabar-video.html` en un Chrome sin ventana).
