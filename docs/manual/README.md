# Manual de operación

El manual se genera desde este repo, pero **el PDF y las capturas no se versionan**: llevan
nombres, cédulas, teléfonos y saldos de clientes reales. Misma regla que los archivos de
migración. Están en `.gitignore`.

Lo que sí vive acá:

- `manual-operacion.html` — el texto y la maqueta del manual.
- `../../motogestion/scripts/manual/` — lo que toma las capturas.

## Cómo volver a generarlo

Hay que hacerlo cuando la app cambie de aspecto, para que las fotos no queden viejas.

1. Con el servidor de desarrollo corriendo (`npm run dev`) y **la sesión abierta en el navegador**,
   levantar el recibidor de sesión:

   ```
   node motogestion/scripts/manual/recibe-sesion.mjs
   ```

2. En la consola del navegador donde está la app abierta, entregarle la sesión:

   ```js
   const k = Object.keys(localStorage).find(x => x.includes('auth-token'));
   await fetch('http://localhost:9977', { method: 'POST',
     body: JSON.stringify({ clave: k, valor: localStorage.getItem(k) }) });
   ```

   La sesión queda en un archivo temporal **fuera del repo** y se borra al terminar. Nunca se
   escribe en el repo ni se comparte: es la llave de una cuenta real.

3. Tomar las capturas (abre un Chrome sin ventana, tamaño celular, modo claro):

   ```
   node motogestion/scripts/manual/capturas.mjs
   ```

4. Armar el PDF:

   ```
   chrome --headless=new --no-pdf-header-footer \
     --print-to-pdf="docs/manual/MANUAL-DE-OPERACION.pdf" \
     "file:///.../docs/manual/manual-operacion.html"
   ```

5. Borrar el archivo temporal de la sesión (`%TEMP%\mg-sesion-manual.json`).

## Reglas al editar el texto

- **Lenguaje simple.** Frases cortas, una idea por renglón. Lo pidió el dueño así:
  *"como si fuera para un niño que apenas sabe leer"*.
- **Nada inventado.** Si una pantalla no se ve así, se corrige la pantalla o se corrige el texto,
  pero el manual nunca describe algo que no existe.
- Al generar el manual del 10-sep-2026 apareció un defecto real: el Panel decía "En mora: 0"
  cuando Cartera decía 123. Se arregló la app, no el manual. Ese es el orden correcto.
