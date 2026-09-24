# Cómo hacer una liquidación — manual

**18 páginas A4.** A la izquierda la foto real de la pantalla, a la derecha los números que la
explican. Mismo formato que `docs/manual/` (el manual de operación), porque es el que funcionó.

🔴 **El PDF y las capturas NO se versionan**: llevan nombres, cédulas y saldos de clientes reales.
Están en `.gitignore`, igual que los del manual de operación y los archivos de migración.

Lo que sí vive acá:

- `manual-liquidacion.html` — el texto y la maqueta.
- `../../motogestion/scripts/manual/capturas-liquidacion.mjs` — lo que toma las capturas.

## Cómo volver a generarlo

Hay que hacerlo **cuando la app cambie de aspecto**, para que las fotos no queden viejas.

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

3. Tomar las capturas:

   ```
   node motogestion/scripts/manual/capturas-liquidacion.mjs
   ```

4. Armar el PDF:

   ```
   chrome --headless=new --no-pdf-header-footer ^
     --print-to-pdf="docs/manual-liquidacion/COMO-HACER-UNA-LIQUIDACION.pdf" ^
     "file:///.../docs/manual-liquidacion/manual-liquidacion.html"
   ```

5. Borrar el archivo temporal de la sesión (`%TEMP%\mg-sesion-manual.json`).

## ⚠️ Lo que hay que revisar cada vez

**Las liquidaciones avanzan de etapa.** El guion de capturas usa liquidaciones concretas
(LIQ-0074 en taller, LIQ-0050 calculada, LIQ-0011 con documento, LIQ-0054 cerrada sin firma).
Si alguna ya avanzó, la foto sale de otro paso **y el manual queda mintiendo**.

Pasó la primera vez: LIQ-0073 pasó de "en taller" a "firmada" entre que se escribió el guion y se
corrieron las capturas, y la página de la revisión del taller salió con la foto del cierre.

- El script avisa **"no encontré"** cuando eso pasa. **Haga caso al aviso**: cambie el número por
  otra liquidación que sí esté en esa etapa, y vuelva a correr.
- Y al final, **mire el PDF página por página**. No lo entregue sin mirarlo.

## El candado automático

`motogestion/src/utils/manualesAlDia.test.ts` saca **todos los nombres de botón** que nombra este
manual —los que van marcados con `<span class="boton">`— y comprueba que **sigan existiendo en el
código**. Si alguien le cambia el nombre a un botón, `npm test` falla y dice cuál manual quedó
diciendo el nombre viejo.

Ya cazó uno el primer día: el manual decía «Imprimir documento» y el botón se llama
**«Imprimir para firmar»**.

> **Por eso los nombres de botón van entre `<span class="boton">` y no en negrita a secas.**
> Esa marca es lo que le permite a una máquina encontrarlos. Si escribe un nombre de botón sin
> esa marca, el candado no lo protege.

## Reglas al editar el texto

- **Lenguaje simple.** Frases cortas, una idea por renglón. Lo pidió el dueño así:
  *"como si fuera para un niño que apenas sabe leer"*.
- **Nada inventado.** Si una pantalla no se ve así, se corrige la pantalla o se corrige el texto,
  pero el manual nunca describe algo que no existe.
- **Los nombres de los botones, iguales a la pantalla.** Si el botón dice «Imprimir para firmar»,
  el manual dice «Imprimir para firmar».
