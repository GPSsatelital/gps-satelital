---
name: rediseno-visual-f1
description: Rediseño visual MotoGestión Pro — F1 (tokens día/noche) DESPLEGADA commit d86ab8c; dirección aprobada con demo; F2-F4 pendientes
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-27T21:22:31.055Z
---

**Dirección aprobada por el usuario (21-jul):** corporativo moderno, limpio, gráfico e intuitivo; animaciones SUTILES (120-190ms, una curva); modo ☀️ día / 🌙 noche con el botón en **Configuración → Apariencia** (decisión explícita: no en el header). Aprobó vía demo interactiva (`Desktop/demo_rediseno_motogestion.html` + copia excluida de git en `motogestion/public/demo-rediseno.html` vía `.git/info/exclude`).

## Sistema aprobado (la demo es el canon)
- **Noche** = extender el navy del sidebar: bg #0b1220, card #121c30, texto #e6edf7, accent #38bdf8. Elevación por capas, no sombras. **Día = paleta actual intacta.**
- **Firma:** placa como mini placa colombiana (amarillo #FFD100/#E8C400, letras negras, borde negro).
- Estados con color + FORMA (● al día ▲ gabela ✕ mora) — daltónico-safe; riel de color al borde izquierdo de tarjetas; **monto = lo más grande** de la tarjeta; números tabulares.
- **Densidad 2 niveles:** Cómoda (~150px/tarjeta, botones a la vista — Panel Hoy la conserva por decisión vieja) y Compacta (45px/renglón, ~7-8 por pantalla, tocar = expandir acordeón) para listas largas (Contratos/Motos/Clientes). Medido a 375px sin desborde.

## ✅ F1 DESPLEGADA (commit d86ab8c)
- Tokens en `src/index.css` (`:root[data-theme=light|dark]` + @media print fuerza día). ~45 tokens (--bg/--card/--soft/--text/--muted*/--line*/--accent*/--ok*/--bad*/--warn*/--ink/--indigo*/--violet/--orange*).
- Barrido mecánico ~4.000 reemplazos en 49 archivos (script en scratchpad `sweep-tokens.cjs`): hex→var(). **Excluidos** (siempre claros): `useDocumentos.ts`, `TicketTermico.tsx`, `regenerarDocs.ts`. `background:"#0f172a"`→`var(--ink)` (sidebar oscuro en ambos modos); resto #0f172a→--text; `"white"`→`var(--card)` global.
- `index.html`: script aplica data-theme ANTES de React (sin flash). `src/lib/theme.ts`: getThemeMode/setThemeMode/applyTheme (light/dark/system + listener del sistema).
- `ConfiguracionView` → `SeccionApariencia` (Día/Noche/Automático, todos los roles, localStorage `mg_theme` por dispositivo).
- `shared.ts` inputStyle: background/color explícitos → mata el bug "no salen las letras en los buscadores" (modo oscuro del celular).
- Verificado: build ✓, 21 tests ✓, 45/45 tokens definidos ✓. ⚠️ Falta verificación visual con login del usuario (día debe verse IDÉNTICO; noche coherente pantalla por pantalla — puede haber detalles a pulir en pantallas poco visitadas).

## ✅ F2/F4 parcial DESPLEGADA (commit 4b78bee, 21-jul)
- Tokens de movimiento en index.css (`--t-fast` 120ms / `--t-base` 190ms / `--ease`) + `button:active scale(.97)` GLOBAL + prefers-reduced-motion respetado.
- **`src/components/Placa.tsx`** (firma, sizes sm/md/lg, amarillo fijo #FFD100 ambos temas) — aplicada en MotosView (2 listas + detalle). PENDIENTE aplicarla en: CobrosView, BusquedaGlobal, ContratosView, fichas, Inmovilizaciones (F3).
- Keyframes listos para F3: `mgSheetUp` (hojas — ya en MasSheet + hoja asignación), `mgFadeIn` (fondos), `mgEntra` (entrada de listas), `mgPop` (✓ confirmación), `mgPulsa` (skeletons).

## Fases pendientes
- **F2 restante:** refinar sidebar/header/tabs (activos, jerarquía) — opcional/menor.
- **F3 pantallas** (orden: Panel → Cartera → Motos → Clientes → Contratos → resto): jerarquía monto-grande + riel de estado + estados con forma (✕▲●) + densidad Compacta (45px, acordeón) en listas largas + Placa en todos los renders de placa + mgEntra/skeletons. Verificar cada una a 375px.
- **F4 restante:** tipografía con dígitos tabulares auto-alojada; skeletons reemplazando "Cargando...".
- ⚠️ Usuario confirmó F1 "se ve bien hasta ahora" (día y noche). Falta su verificación de F2/F4 (placas + animaciones).

## 🔨 F3 EN CURSO — Cartera parte 1 ✅ + parte 2 ✅ DESPLEGADAS
Parte 1 (commit c539ed7): Placa en Panel Hoy + lista Contratos + Historial · monto protagonista 20px con rótulo "DEBE PAGAR" (Panel Hoy) · estados con forma ●▲✕ (ESTADO_CARTERA_STYLE) · mgEntra en tarjetas Hoy.
**Parte 2 ✅ DESPLEGADA (22-jul):** en PanelDetalle → encabezado con `<Placa size="lg">` (antes texto "🏍️ placa"), KPI "Pendiente" como monto protagonista (fontSize 20, fontWeight 900, tabular-nums) vs cuota/pagado 15px (todos tabular) · Placa (size sm) en ventana flotante "Cobrar" (búsqueda + seleccionado + encabezado del modal) y en tarjetas de "Por confirmar" (Historial pendiente) · skeleton con `mgPulsa` reemplazando "Cargando cartera..." (chips + 5 tarjetas). tsc+build+21 tests ✓. **Panel (Dashboard) ✅ DESPLEGADO (22-jul):** DashboardView — `<Placa size="sm">` en la lista "más días sin pago" (antes texto "placa · nombre"); badges de esa lista con forma (▲ Gabela · ✕ Mora · ✕ Crítico); entrada escalonada `mgEntra` (delay i×35ms); tabular-nums en el recaudo del hero; skeletons pasados de `pulse` (no-op) a `mgPulsa`. El resto del Dashboard ya venía pulido de F1 (hero 48px, KPIs con riel borderLeft). **Clientes ✅ DESPLEGADO (22-jul):** ligero — skeleton de carga (`mgPulsa`, chips+6 renglones) + entrada escalonada `mgEntra` (delay Math.min(idx,12)×25ms) en la lista. NO se tocó `ClienteBadge`: sus 13 estados son ciclo de vida (En proceso/Aprobado/Activo/Retirado…), NO los de cartera al-dia/gabela/mora — por eso NO llevan forma ●▲✕ (sería ruido). La tarjeta de cliente no muestra placa (el cliente no está atado a moto en esa vista). **Contratos ✅ DESPLEGADO (22-jul):** ContratosView — `<Placa size="sm">` en tarjetas de lista (antes "🏍️ placa · "), `<Placa size="lg">` en el encabezado del detalle (con marca/modelo al lado); entrada escalonada `mgEntra`; skeleton de carga (`mgPulsa`). `ContractBadge` (En proceso/Activo/Finalizado/Cancelado/Suspendido) NO lleva forma ●▲✕ — es ciclo de vida, no cartera (igual criterio que Clientes). **F3 pantallas OPERATIVAS núcleo (Cartera·Panel·Clientes·Contratos·Motos) ✅. Falta el "resto": Inmovilizaciones, Taller, Liquidaciones, Caja, Historial, Reportes, Usuarios, fichas, BusquedaGlobal — aplicar Placa+skeleton+mgEntra donde apliquen; preguntar al usuario si vale la pena seguir o parar acá.** ⚠️ Usuario aún no verificó parte 1 ni parte 2 en producción (Browser pane no monta la app real → verificación del usuario logueado).
- Nota: la animación `pulse` que usa DashboardView NO existe como keyframe (no-op estático); el keyframe real es `mgPulsa`. Al hacer skeletons usar `mgPulsa 1.5s ease-in-out infinite`, no `pulse`.
- **REGLA color (bug 22-jul):** `--ink` (#0f172a) es fijo dark en ambos modos (sidebar/cards oscuras). NUNCA poner texto `color: var(--card)` sobre `background: var(--ink)` — en noche `--card`=#121c30 (navy) → texto invisible sobre navy. Usar el token **`--on-ink`** (#f8fafc, siempre claro) para texto sobre `--ink`. Se arregló en 9 lugares (Caja "Total general", botones Resetear/💳/guardar, AvisoActualizacion). `var(--card)` como texto SÍ sirve sobre fondos de color saturado (--accent, COLOR_GRUPO) porque ahí flipea (blanco en día / dark legible sobre color brillante en noche) — solo rompe sobre --ink.
- **Placas uniformes (22-jul):** convención fija — listas usan `<Placa size="sm">`, encabezados de detalle `size="lg">`. MotosView móvil usaba el default `md` (más grande) → corregido a sm.
- **Tarjetas opacas en noche (22-jul) — RESUELTO:** el problema era poco escalón de elevación (--card #121c30 casi = fondo #0b1220) + tintes oscuros/desaturados → todo plano/apagado. Fix aprobado ("primera propuesta"): body #0a1020, `--card #1b2a45` (se despega), `--line #33456a` (hairline visible), tintes más vivos (--ok-soft #1c5a3c, --bad-soft #6e2f30, --accent-soft2 #1b3d5c, --warn-soft #55461b, --indigo-soft #34437f) + inks un toque más brillantes. Día NO se toca. También se arreglaron 2 cards que quedaban CLAROS en noche por color fijo: **hero del recaudo** (usaba `var(--text)` en el degradado → ahora `linear-gradient(#0f172a,#0c4a6e)` fijo, número a `--on-ink`) y **barra de alertas críticas** (`#fff1f2`→`var(--bad-soft)`).
- **Panel KPI (22-jul):** la tira de 5 KPIs tenía scroll lateral (flex nowrap) → ahora **grilla 2 columnas** en móvil (todas visibles) con tiles compactos (número+ícono en línea, etiqueta debajo; sin sub/delta en móvil). 2 KPIs usaban color fijo claro (#fff1f2/#f5f3ff) → a tokens (--bad-soft/--indigo-soft). Especificación exacta para cada pantalla F3 (el canon es la demo aprobada `Desktop/demo_rediseno_motogestion.html`):
1. **Placa**: reemplazar todo render de texto de placa por `<Placa placa={...} />` (componente ya existe, sizes sm/md/lg).
2. **Jerarquía**: el monto a cobrar es lo MÁS grande de la tarjeta (20-22px, tabular, derecha); nombre 13.5px uppercase; detalle 12px muted.
3. **Riel de estado**: borderLeft 4px del color del estado en cada tarjeta (mora=--bad, gabela=--warn, al día=--ok).
4. **Estados con forma**: ✕ mora · ▲ gabela · ● al día (color + forma, daltónico-safe) en badges.
5. **Densidad**: Panel Hoy se queda "cómoda" (botones a la vista — decisión vieja del usuario, NO tocar). Listas largas (pestaña Contratos de Cartera, Motos, Clientes, Historial) → considerar compacta 45px con acordeón (preguntar antes si hay duda).
6. **Animaciones**: mgEntra en tarjetas de listas (delay escalonado 20-40ms), mgSheetUp en modales/ventanas flotantes, mgPop en ✓ de confirmación, mgPulsa en skeletons (reemplazar "Cargando...").
7. Verificar a 375px (sin desborde horizontal) + `npm run build` + `npm test` antes de cada push.
- **Orden aprobado F3:** Cartera (CobrosView) → Panel (Dashboard) → Motos (ya tiene placas) → Clientes → Contratos → resto.
- CobrosView es GIGANTE (~3.200 líneas): ubicar tarjetas del Panel Hoy y de la pestaña Contratos con grep de "placa" / "estadoCartera" / tarjeta renders. NO tocar lógica de cálculo (cicloPago/ledger) — solo presentación.

## Estado de sesión (21-jul, PC #2)
- Trabajando directo en `main` (PC #2 no usa rama feature); Vercel deploya de main.
- Commits del rediseño: F1 `d86ab8c`, F2/F4 parcial `4b78bee`. Todo pusheado.
- Demo viva también en `motogestion/public/demo-rediseno.html` (excluida de git vía `.git/info/exclude`).
- El Browser pane no monta bien la app real (frame raro) — verificar con el usuario logueado.
- Pendientes NO-rediseño del día en sus propias memorias: JHEINER $91k ([[descuadres-deuda-fantasma-migracion]]), folleto requisitos por confirmar (2 cartas de recomendación + detalles inferidos: cédula ampliada/antecedentes tránsito/recibo reciente), verificación del usuario de los fixes de scroll/vista (commits cd482aa/f87f423) y de la asignación rápida de motos (ede2754).
- Nota entorno: el Browser pane renderiza la app en un frame raro (evals ven #root vacío aunque React monta) — verificar con el usuario logueado, no confiar solo en el pane.

## ✅ Taller: el detalle pasó a ventana flotante (27-ago, `dcc34b2`)

Pedido literal del dueño: *"que el detalle del módulo de taller no se coloque por debajo de la
página, sino que sea una ventana flotante que se sobreponga, y al darle atrás se quite para
seleccionar otra orden"*. Antes el detalle caía como columna al fondo: en móvil había que hacer
scroll largo para verlo y otro para volver a la lista — el trabajo real es **saltar de orden en
orden**, y esa forma lo estorbaba.

🔑 **El patrón para todo modal nuevo** (ya usado acá): `useBackGuard` (el botón atrás del celular
cierra la ventana en vez de salirse de la app) + `useBloquearScrollFondo` (la lista de atrás no se
mueve mientras la ventana está abierta). Si un modal nuevo no trae los dos, está incompleto.
Es el mismo criterio de las otras ventanas flotantes del sistema (Cobrar, convenio, recolección).
