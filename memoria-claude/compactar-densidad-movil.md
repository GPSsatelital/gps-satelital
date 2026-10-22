---
name: compactar-densidad-movil
description: "Iniciativa (22-jul): compactar densidad en TODO el sistema en móvil — menos aire, menos scroll, mismo diseño"
metadata:
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-07-22T20:23:34.539Z
---

**Pedido del usuario (22-jul, con capturas de cel real):** "mucho espacio desperdiciado / mucho scroll para ver la info". Quiere el MISMO diseño (mismos colores/chips/tarjetas) pero **más apretado**, en **TODO el sistema**. Regla reforzada: **muéstrame SIEMPRE antes de implementar** (mockups con la herramienta visualize antes de tocar código).

**Receta de compactación (aplicar en cada pantalla, solo en `isMobile`):**
1. Ocultar título+subtítulo de la vista en móvil (el header de la app ya dice el nombre) → `{!isMobile && <h2/p>}`.
2. Tarjetas KPI: etiqueta + número en la MISMA línea (flex space-between) → mitad de alto; número tabular; padding ~9px; riel de color a la izquierda (`borderLeft 4px`).
3. Bajar tamaños de número grandes en móvil (ej. 36→26) y márgenes (marginTop 6→2).
4. Reducir márgenes entre secciones (28→16, 20→12) y gaps (12→8) en móvil.
5. NO cambiar lógica ni el diseño de día — solo densidad/presentación.

**Hecho ✅ (desplegado 22-jul):**
- **Cartera (CobrosView)**: header oculto en móvil, KPI 2×2 con etiqueta+número en línea + riel; detalle del cliente más apretado (padding 12, nombre 17px, gap 9, botón Volver chico).
- **Inmovilizaciones**: subtítulo oculto en móvil, KPI números 36→26, padding 14→9, márgenes 28→16 / 20→12.

## 🔨 SESIÓN 22-jul (parte 2) — UNIFORMIDAD ENTRE MÓDULOS (pedido nuevo del usuario)
El usuario pidió: **"que cualquier parte parezca cualquier parte — que la diferencia sea el contenido, no el formato"** (mismo margen sup., misma estética de listas/bordes/tamaños/secuencia en Panel/Clientes/Cartera/Motos/Contratos).
- ✅ **HECHO Y DESPLEGADO a main:** margen uniforme centralizado en App.tsx (contenedor móvil ahora da `padding: "14px 12px 72px"` a TODAS las vistas; antes solo paddingBottom y cada vista ponía el suyo → Clientes quedaba pegado arriba). DashboardView: quitado su padding propio (lo da el contenedor; se dejó solo maxWidth+margin auto en las 2 raíces). Verificado en preview: Clientes ya arranca con el mismo margen.
- ⚠️ **OJO al retomar:** el padding central puede DUPLICARSE en vistas que aún ponen el suyo (CobrosView skeleton/detalle usa "16px 12px", Inmovilizaciones, Reportes, etc.) — barrer y quitar paddings raíz de cada vista, dejando solo el del contenedor. Revisar también DESKTOP (main ya daba "16px 20px" — el Dashboard perdió su padding extra de desktop "24px": evaluar si se nota).
- 🔲 **PENDIENTE detectado (no tocado):** lista de **Motos móvil va suelta en la página** (scrollea toda la página) — debe ir dentro de recuadro `card` + `listaConScroll(isMobile)` de `src/styles/shared.ts` como Cartera/Clientes. MotosView NO importa shared (tiene `card`/`inputStyle` locales, línea ~71 y ~1192) — al arreglar, importar de shared o reusar el local. Misma auditoría de "recuadro con scroll" en las demás listas.
- 🔲 Panel KPI compacto en móvil quedó bien (grilla 2×2); seguir emparejando: mismos radios (16), misma sombra de card, chips mismo tamaño en los 5 módulos.

## 🎨 SESIÓN 22-jul (parte 3) — ESTÁNDAR PROFESIONAL (usando frontend-design + theme-factory)
El usuario pidió profesionalizar el diseño usando los plugins. Diagnóstico honesto: no eran los plugins lo que faltaba sino RIGOR (edité listas equivocadas, tamaños de recuadro distintos). Lo hecho:
- ✅ **Componentes estándar `src/components/ListaEstandar.tsx`** (`ListBox` + `ItemLista`) — formato ÚNICO de lista para TODO el sistema. `ItemLista` props: placa, titulo, subtitulo, right (badges/monto), extra (barra/chips), rielColor (color del estado), seleccionado, onClick. `ListBox` = recuadro con scroll (usa `listaConScroll` de shared, 58vh/64vh) + scrollRef opcional. **Regla nueva: cualquier lista nueva DEBE usar estos componentes, no dibujar su propia fila.**
- ✅ Aplicado a **Motos** (móvil+desktop), **Clientes** (móvil+desktop, tenían listas separadas — OJO siempre revisar si hay 2), **Contratos**. Riel de color por estado en los 3 (helper `rielCliente()` en ClientesView; `ESTADO_COLORS[estado].color` en ContratosView).
- ✅ **Tamaño de recuadro unificado a 58vh/64vh** (Cartera usaba 56/62/66 a mano → corregido).
- ✅ **Tipografía Inter** (era Arial, el default genérico) — `--font-ui` en index.css + link en index.html + `font-variant-numeric: tabular-nums` global (plata aliñada). Documentos impresos (useDocumentos/TallerView/liquidación) SIGUEN en Arial a propósito (PDF).
- 🔲 **FALTA (lo grande que rompe la uniformidad): Cartera NO usa `ItemLista`** — sus filas tienen formato propio (monto, botones de cobro, badges de protocolo). Convertirla es el siguiente paso para cerrar "cualquier parte parece cualquier parte". Es la más compleja (montos/acciones por fila).
- 🔲 Recomendación profesional pendiente (dada al usuario, sin ejecutar): #2 tokens de átomos (un solo Badge/Chip/Botón + grilla de espaciado 4px), #3 jerarquía "la plata primero" (monto protagonista por fila), #4 restraint (menos acentos compitiendo). El #1 (tipografía) ya está.

**Falta (barrer con la misma receta):** Panel/Dashboard (hero ya ok, apretar quick-stats + acciones rápidas + KPI strip), Clientes, Contratos, Motos, Taller, Liquidaciones, Caja, Historial de pagos, Reportes, Usuarios, Configuración, fichas (FichaCliente/FichaMoto), Wizard. Verificar cada una a 375px + `npm run build` + `npm test` antes de push.

**Contexto:** esto salió en medio del rediseño visual F3 ([[rediseno-visual-f1]]). Antes de la compactación se cerró el modo oscuro: tintes de estado más vivos + destellos de luz de fondo (halos fijos cian/violeta/verde-agua, intensidad intermedia, solo noche, en `body` con `--bg` transparent) + cajas KPI navy + riel a la izquierda. Todo en producción.
