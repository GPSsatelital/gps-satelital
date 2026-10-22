---
name: nav-y-performance
description: "Rediseño de navegación (botón atrás) y performance (arranque + caché de datos) — Fases 1, 2 y caché hechas; Fase 3 pendiente"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-25T18:53:58.895Z
---

# Navegación (botón atrás) + Performance — 25-jul-2026

Disparado por 2 quejas del usuario: (1) el botón atrás no seguía la secuencia (abrir un detalle y dar atrás saltaba de módulo), (2) la app se sentía lenta. Diagnóstico con workflow de 3 arquitectos. Plan completo en `.claude/plans/nav-y-performance.md`.

## Hecho y EN PRODUCCIÓN
- **Arranque (commit b59fd52):** React.lazy por vista + `vite manualChunks` (react/framer/supabase). Bundle inicial 2.7MB→419KB; vendors cacheados entre deploys (solo el chunk `index` de ~28KB gzip cambia por deploy). Reportes/Importación/jspdf/html2canvas solo cargan al abrirlos.
- **Botón atrás (commit d15d36a):** `src/contexts/BackNav.tsx` = `BackNavContext` + hook `useBackGuard(active, onBack)`. **Modelo:** el historial del navegador es UNA trampa siempre re-armada (pushState en cada popstate); la app es la fuente de verdad con `navStackRef` (módulos) + `guardsRef` (capas LIFO). Atrás cierra primero la capa abierta (detalle/modal) y solo después cambia de módulo. `navigate()` ya NO hace pushState. **OJO:** hay 2 returns en App (móvil línea ~611 y desktop ~719) — AMBOS deben envolver `<BackNavContext.Provider>` (el bug inicial fue envolver solo desktop). Conectado en los 3 detalles (CobrosView `contratoSeleccionadoId`, ClientesView/MotosView `selectedId`) + MasSheet + búsqueda global. **Modales/lightbox también conectados (commit 9f3da97):** Cartera (pago/campo/confirmar/recolección/recibo/lista/FAB/foto), Motos (10 modales), Clientes (form/editar/visita/recibo), FichaCliente (foto ampliada+recibo), Reportes (lightbox). Verificado: FAB abre y atrás lo cierra sin salir de Cartera. **Pestañas internas SE DEJARON NO-backeables a propósito** (atrás no debe ciclar tabs — confunde; uno espera que atrás lo saque, no que lo mueva de lado). **Queda fast-follow menor:** ContratosView modales (modalEditar/Documentos/Liquidacion) + Wizard steps + FichaMoto lightbox si aparece.
- **Caché de datos (commit 68c76a6):** `src/hooks/createTableStore.ts` con `useSyncExternalStore` — 1 store + 1 canal realtime persistente por tabla, caché de módulo que sobrevive a la navegación. Los 7 hooks de datos (motos/contratos/clientes/pagos/convenios/deudas/gestiones) ahora usan el store con **firma pública idéntica** (cero cambios en vistas). Volver a una pantalla = instantáneo. useConvenios: el RPC `marcar_convenios_vencidos` va en `onStart` del store. Verificado: 246 contratos correctos, cero errores en re-render.

## Pendiente (Fase 3, post go-live, mayor riesgo)
CampanaAlertas simplificar (aunque ya comparte store); realtime incremental (payload en vez de refetch completo); paginar pagos/gestiones (⚠️ toca cálculos de plata — mapeo integral); Map-index de memos O(N×M) en resumenContratos/stats + deps faltantes (gestiones/motos) en CobrosView:782; aislar realtime del árbol de render; back-guard en modales/tabs.

## Notas técnicas
- Los "errores" de HMR en consola al editar hooks (createTableStore not defined, change in order of Hooks) son artefactos de Vite al cambiar la cantidad de hooks de un módulo en caliente — NO aparecen en carga fresca ni producción (verificado con contador de errores en 4 navegaciones = 0).
- Verificación en navegador logueado como FREDY (la sesión de Supabase se auto-restaura aunque localStorage parezca vacío).

Ver [[migracion-costa-siembra]], [[compactar-densidad-movil]].
