---
name: manual-operacion-pdf
description: "El manual de operación en PDF (10-sep-2026): 13 páginas A4 con capturas REALES de la app, generado con Chrome sin ventana; cómo rehacerlo, por qué el PDF no se versiona, y los dos defectos que salieron al hacerlo (el Panel decía 0 en mora cuando Cartera decía 123, y la pantalla de entrar rota en modo claro)."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-10T20:00:57.029Z
---

# Manual de operación en PDF — 10-sep-2026 · `5b13db8`

Pedido del dueño: *"el manual de operación en un archivo pdf lo más ilustrado y con las imágenes
reales de cómo se ve la app ahorita, y que todo esté bien explicado como si fuera para un niño que
apenas sabe leer"*.

**Dónde está:** `docs/manual/MANUAL-DE-OPERACION.pdf` (solo en el disco del dueño, ver abajo).
El texto y la maqueta sí están en el repo: `docs/manual/manual-operacion.html` + `README.md`.

## Cómo se hizo (y cómo rehacerlo)

`motogestion/scripts/manual/` — el paso a paso está en `docs/manual/README.md`.

- 🔴 **El problema a resolver:** un Chrome nuevo no está logueado, y la sesión vive en el
  `localStorage` del navegador abierto. Se resolvió con **`recibe-sesion.mjs`**: un servidor local
  que escucha una sola vez; la app le entrega su sesión por `localhost` y queda en un archivo
  **temporal fuera del repo**, que se borra al terminar. Así la llave de una cuenta real **no pasa
  por el chat, ni por un archivo del repo, ni por ningún lado**.
- **`capturas.mjs`** maneja ese Chrome por el protocolo de depuración (CDP por WebSocket, sin
  puppeteer — Node 24 ya trae `WebSocket`). Tamaño celular 390×844 a 2x.
- 🔴 **Solo ABRE ventanas para retratarlas. Nunca toca un botón que guarde algo** — corre contra
  PRODUCCIÓN y un clic de más sería un pago inventado.
- **Modo claro forzado** (`mg_theme=light` + `Emulation.setEmulatedMedia` con
  `prefers-color-scheme: light`): el manual se imprime y el fondo navy se ve sucio y gasta tinta.
  Sin lo segundo, Chrome pintaba las cajas de texto en gris oscuro igual.
- Tropiezos: el Chrome de prueba **reusa la carpeta de perfil** entre corridas, así que la sesión
  vieja seguía viva y en vez del login salía la última pantalla → se limpia antes. Y el aviso de
  "Instala MotoGestión" tapaba un cuarto de cada captura → se cierra antes de capturar.

## 🔴 Por qué el PDF NO se versiona

Las capturas llevan **nombres, cédulas, teléfonos y saldos de clientes reales**. Misma regla que
los archivos de migración: `docs/manual/img/` y `docs/manual/*.pdf` están en `.gitignore`.
La portada lo dice: documento interno, no se comparte fuera de la empresa.

## Los dos defectos que destapó hacerlo

1. 🔴 **El Panel decía "En mora: 0" mientras Cartera decía 123.** Contaba por `clientes.estado`,
   un campo que **nadie mantiene**, y al tocar la tarjeta abría una lista vacía. Es el MISMO
   defecto que ya se había corregido una vez en la tarjeta "En gabela" (una cifra bien etiquetada
   pero sacada del lugar equivocado). Ahora sale de la cartera, del mismo recorrido que gabela
   para que no puedan discrepar, y lleva a Cartera.
   - **Sub-hallazgo:** el recorte `{fecha, valor}` botaba `aplicado_convenio`, que
     `calcularEstadoCartera` sí mira → daba **139** donde Cartera decía **123**. Se pasa el pago
     COMPLETO. Verificado en pantalla: 123 = 123.
2. **La pantalla de entrar** tenía su propia copia de `inputStyle` **sin fondo ni color** — justo
   el bug que el estilo compartido documenta. En modo claro las cajas salían oscuras y el título
   "Iniciar sesión" no se leía. Ahora usa el compartido.

**Why:** el manual no era solo un documento — obligó a mirar la app pantalla por pantalla en modo
claro, y ahí aparecieron dos cifras/pantallas rotas que nadie había visto.
**How to apply:** al regenerarlo, si una pantalla se ve mal **se corrige la app, no el texto**.
Ver [[flujo-diario-de-cada-persona]] y [[cartera-cuanto-debe-una-sola-funcion]].
