# Cómo usar Reportes — manual

**Versión 3 (8-oct-2026): por PREGUNTAS.** Pedido del dueño: *"según qué quiero saber, dónde y cómo puedo
buscar"*. **31 páginas A4**: el índice «¿Qué quiere saber?» (23 preguntas en 5 grupos, con su página) y una
página por pregunta con **Cómo llegar** (el camino de botones, en fichas numeradas), la foto real y la
explicación. El índice se arma solo al imprimir, con las preguntas y su número de página.

A la izquierda la foto real de la pantalla, a la derecha qué es cada cosa.
Cada cosa que se explica lleva un **número al borde de la foto con una línea fina** hasta ella, y el
mismo número en el texto; el botón que hay que tocar lleva un **anillo azul** (versión 2, 6-oct: el
dueño pidió señales "más gráficas" y luego "más profesional y no tan empachado").
Mismo formato que `docs/manual-liquidacion/`, porque es el que funcionó.

**El PDF y las capturas NO se versionan**: llevan nombres, placas y saldos de clientes reales.
Están en `.gitignore`, igual que los de los otros manuales.

Lo que sí vive acá:

- `manual-reportes.html` — el texto y la maqueta.
- `../../motogestion/scripts/manual/capturas-reportes.mjs` — lo que toma las capturas y **mide**
  dónde está cada cosa que lleva número (la lista `SENALES`); deja `img/<foto>.marcas.json`.
- `../../motogestion/scripts/manual/poner-senales.mjs` — pinta los números y el anillo sobre cada
  foto del manual con esas medidas.

## Cómo volver a generarlo

Hay que hacerlo **cuando Reportes cambie de aspecto**, para que las fotos no queden viejas.

1. Con `npm run dev` corriendo y **la sesión abierta en el navegador**, levantar el recibidor:

   ```
   node motogestion/scripts/manual/recibe-sesion.mjs
   ```

2. En la consola del navegador donde está la app abierta:

   ```js
   const k = Object.keys(localStorage).find(x => x.includes('auth-token'));
   await fetch('http://localhost:9977', { method: 'POST',
     body: JSON.stringify({ clave: k, valor: localStorage.getItem(k) }) });
   ```

3. Tomar las capturas (25 fotos y sus medidas en `img/`):

   ```
   node motogestion/scripts/manual/capturas-reportes.mjs
   ```

   Si dice **"señales que no encontré"**, un texto de la pantalla cambió: corregirlo en `SENALES`.

4. Poner los números sobre las fotos:

   ```
   node motogestion/scripts/manual/poner-senales.mjs
   ```

5. Revisar que ninguna página se pase de una hoja, y mirar cada una (deja las fotos en `%TEMP%mg-paginas`):

   ```
   node motogestion/scripts/manual/revisar-paginas.mjs docs/manual-reportes/manual-reportes.html
   ```

6. Armar el PDF (y comprobar que tenga tantas páginas como secciones):

   ```
   chrome --headless=new --no-pdf-header-footer ^
     --print-to-pdf="docs/manual-reportes/COMO-USAR-REPORTES.pdf" ^
     "file:///.../docs/manual-reportes/manual-reportes.html"
   ```

7. Borrar lo que deja la sesión: `%TEMP%\mg-sesion-manual.json` y la carpeta del Chrome de las
   capturas, `%TEMP%\mg-chrome-manual-rep` (guarda la sesión abierta).

## Lo que hay que revisar cada vez

- **El script avisa "no encontré"** cuando un botón cambió de nombre o una pantalla ya no está
  donde estaba. Haga caso al aviso: la foto salió de otra cosa.
- **Las cifras de las fotos son las de ese día.** El texto no repite cifras de las fotos a
  propósito, para que no quede mintiendo cuando cambien.
- **Mire el PDF página por página** antes de entregarlo: que ninguna página se pase a la
  siguiente y que cada foto muestre lo que dice el texto.

## El candado automático

`motogestion/pruebas/manualesAlDia.test.ts` saca **todos los nombres de botón** que nombra este
manual —los que van en `<span class="boton">`— y comprueba que **sigan existiendo en el código**.
Si alguien le cambia el nombre a un botón, `npm test` falla y dice cuál manual quedó viejo.

Un nombre que el código arma por partes (como «Ver los contratos», que puede decir «Ver sus
contratos») no se marca como botón: va en negrita, porque el candado no lo encontraría.

## Reglas al editar el texto

- **Lenguaje simple.** Frases cortas, una idea por renglón: *"como si fuera para un niño que
  apenas sabe leer"*.
- **Nada inventado.** Si una pantalla no se ve así, se corrige la pantalla o el texto.
- **Los nombres de los botones, iguales a la pantalla.**
- **Sin emoji.** Las casillas de la última hoja son un cuadro dibujado con CSS.
