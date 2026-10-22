---
name: plan-sistema-diseno
description: "PLAN determinado (22-jul) del sistema de diseño MotoGestión — fases A→E, qué está hecho y qué sigue. Fuente única del roadmap visual."
metadata:
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-07-22T23:37:49.570Z
---

**Plan cerrado con el usuario (22-jul) para profesionalizar el diseño SIN perder coherencia.** Reglas y sistema de diseño LOCKED están en CLAUDE.md § "SISTEMA DE DISEÑO". Cada fase: invocar frontend-design + theme-factory → mockup (visualize) → implementar → verificar a 375px + build + test → `/deploy`.

## Base montada ✅
- Componentes `ListBox`/`ItemLista` (`src/components/ListaEstandar.tsx`) = formato único de lista.
- Tipografía Inter + tabular-nums (global).
- Tokens día/noche + `--on-ink` + colores de noche con vida.
- Recuadros unificados 58vh/64vh.
- Comando **`/deploy`** (`.claude/commands/deploy.md`) — tsc+build+test+commit+push+merge a main.
- Sección "SISTEMA DE DISEÑO" en CLAUDE.md (siempre en contexto).
- framer-motion instalado.
- Aplicado el estándar a: **Motos, Clientes, Contratos** (listas móvil+desktop, riel por estado).

## Plan REESTRUCTURADO (22-jul, liderado por interface-design) — reemplaza el A→E viejo
Se replanteó con el arquitecto: cimientos → pantallas. Dirección: **"hoja de ruta del cobrador"** (navy denso, placa amarilla = único calor, plata protagonista, estados color+forma).
- ✅ **F1 — Sistema formal:** `.interface-design/system.md` escrito (la ley; tokens, escala 22/18/15/13/12/11, pesos 400-700, grilla 4px, depth=bordes+tintes, money-first, firma placa). Audit `design-review` hecho: global ≈6.5/10; brechas top = consistencia (5.0) y a11y (6.0). Mapa de brechas priorizado en el historial.
- ✅ **F2 base:** `src/components/atomos.tsx` (Btn 4 variantes/2 tamaños · Badge tono+forma radio 6 · Chip pill interactivo) + **focus ring global** en index.css. DESPLEGADO.
- ✅ **F2 aplicación (parcial):** Chip/Badge conectados en Contratos/Clientes/Motos/Cartera (badges de estado + chips de filtro de grupo + Panel Hoy + pestaña Contratos). Pesos 800/900→700 en ContratosView. DESPLEGADO (commit `d378ddd`). **Falta del F2:** barrer `<Btn>` a los botones sueltos del resto de vistas + pesos 800/900 en las demás pantallas + tamaños a la escala fija.
- ✅ **F3 — Cartera money-first DESPLEGADO** (commit `fe6a0f2`): la lista de la pestaña Contratos usa `ItemLista` — **monto = héroe** (tabular, `$` grande a la derecha, color por estado: rojo=deuda, cyan=próximo pago prorrateo, verde=al día), badge estado debajo, riel por estado, botón Pagar = `<Btn primary>`. Verificado en navegador a 375px con datos reales (mora en rojo $47.000/$109.000 se ve claro). Preserva toda la funcionalidad (Pagar, protocolo P1-4, marcas Empalme/Falta convenio, prorrateo).
- 🔨 **F4 — Pantallas (EN CURSO):**
  - ✅ **Lote 1** (commit `257c8c8`): barrido de pesos 800/900→700 en TODAS las vistas (excepto `Placa.tsx` = firma, y `TicketTermico.tsx` = impreso) + `TallerBadge` e `HistorialPagos` badges al átomo. Verificado en navegador (Clientes/Cartera se ven bien).
  - ✅ **Lote 2** (commit `b25314f`): chips de filtro de Inmovilizaciones (prioridad + retenidas) al `Chip` (activo=accent). Verificado en navegador.
  - ✅ **Lote 3** (commit `ef1ea8e`): badges de Dashboard (conteo de alertas crítica/alerta/info + top mora) y Cobro Diario (pagado/pendiente/mora) al `Badge`. Verificado en navegador (Panel se ve bien).
  - ✅ **F4 sustancialmente COMPLETO.** Excepciones DELIBERADAS (no convertir — la identidad/dato manda sobre el genérico): selector de grupo del **hero** de Dashboard (estilos claros sobre navy a propósito), chips de grupo de **CajaView** (cada portafolio tiene su color = información), segmented control de **Reportes**, `<select>` de grupo en **Usuarios/Config**, botones de acción de **Alertas** (color por tipo de alerta). Núcleo operativo + pantallas principales ya comparten badges/chips/pesos del sistema.
  - ✅ **Barrido de botones/inputs** (commit `9f69588`): `shared.ts` + los 7 constantes de botón locales (Clientes/Contratos/Motos/Usuarios/Cobros/Config/Taller) unificados al sistema: radio 8 (inputs 10), peso primario 700→600, **texto oscuro `#0f172a` sobre el gradiente** (antes `var(--card)` = navy sobre cyan en noche = ilegible; ahora contraste correcto día/noche, igual que el átomo `<Btn>`), fuentes de input/label a la escala (15/13). ⚠️ Cambio VISIBLE: los botones primarios pasaron de texto blanco a texto oscuro sobre el gradiente cyan→verde. Si al usuario no le gusta, es trivial revertir (color en shared.ts + 6 defs).
  - **F4 COMPLETO.** Sin sed ciego de tamaños de fuente (riesgoso — 14/16 a veces son correctos por contexto). Fichas (Cliente/Moto) usan tabs propios (no tocados).
- ✅ **FIX aparte esta sesión (commit `927e589`):** PDF de contrato reventaba con `unsupported color function var` — `pdf.ts` pasaba `var(--card)` a html2canvas (no resuelve var()) y además salía navy en noche → ahora papel blanco `#fff`. **Usuario CONFIRMÓ que el PDF sale bien.**
- ✅ **Texto oscuro en botones primarios CONFIRMADO por el usuario** ("así está bien") — el gradiente cyan→verde lleva texto `#0f172a` (contraste correcto día/noche). No revertir.
- ✅ **F5 — framer-motion con restraint DESPLEGADO** (commit `583d059`): 2 micro-interacciones CENTRALIZADAS (no stagger en listas — la app es de búsqueda constante, animar en cada tecla = lo que hay que evitar): (1) press feedback `scale(0.97)` en el átomo `Btn`, (2) transición de vista (fade + slide leve al cambiar de módulo, `key={ctx.view}` en App.tsx — solo entrada, no re-anima al filtrar). Ambas respetan `prefers-reduced-motion` vía `useReducedMotion()`. Solo transform/opacity, <200ms. Verificado en navegador.
- ✅ **Chips 100% uniformes (commits `90a6449`,`591a7cb`):** átomo `Chip` a altura 28/fuente 11, y TODAS las filas de chips de filtro convertidas al átomo (Cartera pestañas+estado+grupo, Clientes estados móvil+desktop, Motos grupo, Contratos, Inmovilizaciones, Cobros por-confirmar+historial, Reportes rango). Regla: cualquier chip de filtro nuevo usa `<Chip>`. Excepciones deliberadas: chips de grupo de **CajaView** (color por portafolio = dato), presets de fecha de **HistorialPagos** (rectangulares radio 10, otro control), selector de hoja de **Importación**. También arreglado: `Placa` con ancho mínimo por tamaño → columna de placas pareja en todas las listas (commit `298390b`).
- **REDISEÑO POR FASES F1→F5 COMPLETO.** El sistema de diseño está uniforme de punta a punta: firma (placa), Inter, tokens día/noche, ListBox/ItemLista, money-first en Cartera, átomos Btn/Badge/Chip desde una sola fuente, movimiento con restraint.
- *Posible pulido futuro (opcional, no urgente):* más motion (hojas/modales con spring), tamaños de fuente a la escala fija donde aún haya 14/16/17 sueltos, `<Btn>` en más botones one-off. `design-review`/`a11y-audit` formales antes de un pulido grande.

## Fases pendientes viejas (A→E) — SUPERSEDED por el plan reestructurado de arriba
- **A — Cartera → `ItemLista`** 🔲 SIGUIENTE. Es el único de los 5 módulos que aún tiene formato de fila propio (monto, botones de cobro por fila, badges de protocolo). El más complejo → hacer con cuidado, verificar pantalla por pantalla. Cierra "cualquier parte parece cualquier parte".
- **B — Tokens de átomos** 🔲 crear `Badge`/`Chip`/`Btn` únicos + barrer la app a grilla de espaciado 4px (hoy hay 5/6/7/9/11 sueltos).
- **C — "La plata primero"** 🔲 monto protagonista por fila/tarjeta (alineado der, tabular, el dato más fuerte). Es app de dinero.
- **D — framer-motion** 🔲 reemplazar las animaciones CSS (mgEntra/mgSheetUp) por micro-interacciones finas con restraint (entrada de listas escalonada, hojas/modales spring, transición de vista).
- **E — resto de pantallas** 🔲 aplicar estándar + compactación a Taller, Alertas, Usuarios, Configuración, Referidos, fichas (FichaCliente/FichaMoto), Historial, Reportes, Caja. Cazar solapamientos.

## Recordatorios de rigor (por errores ya cometidos)
- Revisar si una vista tiene lista móvil Y desktop separadas (pasó en Clientes — edité solo una).
- El riel de color va en TODAS las filas (por estado) para que el formato sea idéntico.
- Verificar en navegador logueado a 375px, no confiar solo en build.
- No improvisar colores/tamaños: usar los skills de diseño y mostrar mockup antes.

Relacionado: [[regla-usar-design-skills]] · [[regla-reusar-flujo-existente]] · [[compactar-densidad-movil]] · [[rediseno-visual-f1]].
