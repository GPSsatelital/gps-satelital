---
name: regla-usar-design-skills
description: "REGLA (feedback 22-jul): SIEMPRE invocar frontend-design + theme-factory al tocar diseño/visual; animaciones con framer-motion"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-07-22T20:29:32.363Z
---

**REGLA pedida por el usuario (22-jul):** cada vez que se toque **diseño o parte visual** (colores, tipografía, layout, componentes, animaciones), **invocar los skills** `frontend-design:frontend-design` y `theme-factory:theme-factory` para fundamentar las decisiones con criterio profesional — no improvisar a ojo.

**Why:** el usuario notó que estaba armando el estándar visual a mano y "dejando pasar detalles". Quiere que el resultado se vea profesional y consistente, apoyado en la metodología de esos plugins (que ya están en CLAUDE.md como herramientas de diseño disponibles).

**How to apply:**
1. Antes de un cambio visual no trivial: `Skill(frontend-design)` para dirección estética + `Skill(theme-factory)` para paleta/tipografía.
2. Mostrar mockup/preview (herramienta visualize) ANTES de implementar (regla ya vigente [[regla-reusar-flujo-existente]]).
3. **Animaciones con `framer-motion`** (instalado 22-jul en motogestion) — usarlo con RESTRAINT (el propio frontend-design advierte que el exceso de animación hace que se vea "generado por IA"). Reservarlo para momentos clave: entrada de listas, hojas/modales, transiciones de vista, micro-interacciones de estado.
4. Identidad NO se toca: navy + cyan + **placa amarilla colombiana** = la firma. Se refina, no se reemplaza.

Relacionado: estándar de listas `ListBox`/`ItemLista` en [[compactar-densidad-movil]], tokens día/noche en [[rediseno-visual-f1]].
