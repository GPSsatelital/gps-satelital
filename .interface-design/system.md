# Sistema de diseño — MotoGestión (GPS Satelital Cartagena)

Fuente de verdad del diseño. Las decisiones están tomadas: sostenerlas. Cualquier
cambio visual se mide contra este archivo. (Definido 22-jul-2026 con interface-design.)

## Producto e intent
- **Qué es:** SaaS operativo de arriendo de flota de motos. Denso, mobile-first (375px), día + noche. Es app de **dinero** (cartera, pagos, caja).
- **Quién lo usa:** el cobrador en la calle a las 8am en el celular, y la secretaria/admin en oficina. No técnicos.
- **Tarea:** saber **quién debe cuánto HOY** y **cobrar**. Escanear por placa como en la calle.
- **Feel:** *"hoja de ruta del cobrador"* — operativo, denso, confiable (plata), escaneable. Navy serio con un único punto cálido.

## Firma (no se toca)
La **placa amarilla colombiana** (`#FFD100`, letras negras, `src/components/Placa.tsx`). Es el ancla de escaneo — la lista se lee "por placa". Toda placa usa `<Placa>` (listas `sm`, detalle `lg`). NUNCA placa como texto plano. Es el único amarillo/punto cálido del sistema.

## Color — un hue (navy), la temperatura la da el estado
Tokens en `src/index.css` (`:root[data-theme=light|dark]`). Un solo hue de superficie; solo cambia la luz entre niveles. El color COMUNICA (estado/acción), el gris ESTRUCTURA (~60/30/10). Nunca color decorativo, nunca 2 acentos compitiendo.
- **Superficies (noche):** fondo `#0a1020` · card `#1b2a45` · fila/inset `#20304e`. Cada salto es leve (elevación "susurrada"). Día = paleta clara actual.
- **Texto:** 4 niveles — `--text` (primario) · `--muted2` (secundario) · `--muted` (terciario) · `--faint` (metadata). Sobre `--ink` usar `--on-ink` (nunca `--card`).
- **Semántico (estado de cartera):** al día = `--ok` (verde ●) · gabela = `--warn` (ámbar ▲) · mora = `--bad` (rojo ✕). Acción = `--accent` (cyan).
- **Bordes:** hairline de baja opacidad (`--line`), no sólidos duros. Deben desaparecer al no buscarlos.

## Tipografía — Inter
- Fuente UI = **Inter** (`--font-ui`). Documentos IMPRESOS (PDF) siguen en Arial a propósito.
- `font-variant-numeric: tabular-nums` global (la plata aliña columna a columna).
- **Escala FIJA (ratio ~1.25):** `caption 11 · body 13 · sub 12 · h4 15 · h3 18 · h2 22 · display 28+`. Nada de 13.5/14/16/17 sueltos.
- **Pesos: 400/500/600/700.** Prohibido 800/900 (se ven "gritones"). Jerarquía por peso+color, no solo tamaño: `valor 600/primario · label 500/secundario · meta 400/muted`.
- Tracking: negativo leve en display (>22px); line-height ~1.5 en cuerpo.

## Espaciado — grilla de 4px
Solo múltiplos de 4 (4/8/12/16/24). Nada de 5/6/7/9/11. Padding simétrico. Densidad "workbench": filas 9–10px vertical, cards 12–16px. Agrupar lo relacionado, aire real entre grupos (no monótono).

## Profundidad — UNA estrategia: bordes + tintes
Tool densa → **bordes hairline + tinte de superficie** para estructura (limpio, técnico). **Sombras SOLO** para lo que "levanta" del plano: modales, dropdowns, hojas, FAB. No mezclar estrategias. En noche las sombras no leen → apoyarse en bordes.

## Radio — escala
Inputs/botones `6–8` · filas de lista `10` · cards `12–16` · modales/hojas `16–20`. Concéntrico: hijo redondeado dentro de padre = `radio_hijo = radio_padre − padding`.

## Jerarquía — "la plata primero"
Un foco por vista. En cartera/pagos el **monto es el héroe**: tabular, alineado a la derecha, color del estado, el elemento más fuerte de la fila. El nombre/placa son identidad; el monto es lo que se acciona. KPIs: el dato que importa lidera — no el patrón genérico "número gigante + label + %Δ".

## Componentes — única fuente (no dibujar a mano)
- **`ListBox` + `ItemLista`** (`src/components/ListaEstandar.tsx`): recuadro con scroll **58vh/64vh** + fila estándar (placa izq · título uppercase 13/600 · subtítulo 12/muted · `right`=monto+badge · `extra`=abajo · `rielColor`=estado). Motos/Clientes/Contratos ya lo usan; falta Cartera (money-first en `right`).
- **A construir (F2):** `Badge` (11px/600, radio 6, un solo padding), `Chip` (filtros), `Btn` (variantes: primario/secundario/ghost — hoy hay 3 estilos sueltos). Bindear a tokens, nunca hex crudo.
- Reutilizar SIEMPRE lo que existe; nunca atajo paralelo. OJO: varias vistas tienen lista móvil Y desktop separadas — arreglar las dos.

## Estados y accesibilidad
- Targets táctiles **44px** (mín 40) — extender con pseudo-elemento si el control visible es menor.
- Todo interactivo: default/hover/active/focus/disabled + **focus ring** visible (teclado). Datos: loading (skeleton)/empty/error.
- Contraste verificado (`a11y-audit`). Press feedback `scale(0.97)`.

## Movimiento — framer-motion, con restraint
Se siente, no se mira. `< 300ms`, ease-out `cubic-bezier(0.23,1,0.32,1)`, solo `transform`/`opacity`. Entrada de listas escalonada 30–80ms; hojas/modales spring 200–300ms; popovers desde su origen. **Sin animación** en acciones de 100+/día. Respetar `prefers-reduced-motion`.

## Reglas de consistencia (sostener)
Tamaños en la escala · espaciado en la grilla de 4 · una sola estrategia de profundidad · colores de la paleta · patrones documentados reusados, no reinventados · la placa amarilla como única firma cálida.
