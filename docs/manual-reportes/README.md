# Cómo usar Reportes — manual

**24 páginas A4.** A la izquierda la foto real de la pantalla, a la derecha qué es cada cosa.
Mismo formato que `docs/manual-liquidacion/`, porque es el que funcionó.

**El PDF y las capturas NO se versionan**: llevan nombres, placas y saldos de clientes reales.
Están en `.gitignore`, igual que los de los otros manuales.

Lo que sí vive acá:

- `manual-reportes.html` — el texto y la maqueta.
- `../../motogestion/scripts/manual/capturas-reportes.mjs` — lo que toma las capturas.

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

3. Tomar las capturas (19 fotos en `img/`; con números, solo esas: `... 18 19`):

   ```
   node motogestion/scripts/manual/capturas-reportes.mjs
   ```

4. Armar el PDF:

   ```
   chrome --headless=new --no-pdf-header-footer ^
     --print-to-pdf="docs/manual-reportes/COMO-USAR-REPORTES.pdf" ^
     "file:///.../docs/manual-reportes/manual-reportes.html"
   ```

5. Borrar lo que deja la sesión: `%TEMP%\mg-sesion-manual.json` y la carpeta del Chrome de las
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
