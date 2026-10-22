---
name: regla-reusar-flujo-existente
description: "REGLA (feedback 22-jul): al conectar una acción que YA existe en otra vista, reutilizar su flujo exacto — nunca crear un atajo paralelo que se comporte distinto"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-07-22T17:06:04.084Z
---

El usuario quedó molesto (22-jul) por un **error de inconsistencia**: al hacer que el botón "+" funcionara en el DETALLE de Cartera, le puse un atajo que iba directo a "pago en oficina" para los admins, **saltándose el menú oficina/campo que el FAB YA tenía** en la vista de lista. Resultado: el mismo botón "+" se comportaba distinto en dos lugares.

**Why:** genera comportamiento inconsistente y reglas de negocio a medias (aquí: la distinción obligatoria "oficina por secretaria" vs "campo por admins" se perdía en el detalle). El usuario dijo textual: *"no quiero más este tipo de errores de inconsistencia"*.

**How to apply — antes de conectar CUALQUIER acción a un botón/UI nuevo:**
1. Preguntarse: ¿esta acción YA existe en otra vista? (registrar pago, cobrar, recolectar, etc.) → `grep` de la función/handler.
2. Si existe, **reutilizar el mismo flujo/componente exacto** (mismo menú, mismas opciones, mismas reglas), solo cambiando el contexto (ej. precargar el contrato). NUNCA escribir un camino paralelo simplificado "porque es más rápido".
3. Es la REGLA DE MAPEO INTEGRAL del CLAUDE.md aplicada a comportamiento, no solo a datos: un cambio debe quedar coherente en TODOS los puntos donde vive esa acción.

Relacionado: [[regla-revisar-antes-de-recap]] (revisar el estado real antes de actuar).
