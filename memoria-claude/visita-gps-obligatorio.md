---
name: visita-gps-obligatorio
description: La visita domiciliaria ahora captura GPS automático al abrir y NO se puede guardar sin ubicación (regla de negocio nueva 24-jul).
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-24T22:38:45.063Z
---

**Cambio 24-jul-2026 (commit `7d618e0`, EN PRODUCCIÓN).** Antes el GPS de la visita era un **botón manual y opcional** en `ModalVisita.tsx`; parte de las visitas se guardaban sin ubicación y luego "no salía el botón para ver la ubicación" — porque el link/botón de mapa YA existe en las 3 vistas de detalle (FichaClienteView tab Visitas, Historial de visitas en ClientesView, PanelAprobacion) pero está **condicionado a `v.ubicacion`**. Sin dato, no hay botón. No era bug de pantalla: era dato faltante.

**Fix (decisión del usuario):**
1. **Auto-captura al abrir** el formulario: `useEffect(() => capturarUbicacion(), [])` en `ModalVisita` (con `enableHighAccuracy` + `timeout: 15000`).
2. **Obligatoria para guardar:** guard en `handleGuardar` (`if (!ubicacion) { setError(...); return; }`) — igual que los guards de `observaciones`/`viveAlli`. **Consecuencia de negocio: una visita solo se puede registrar estando EN EL SITIO (o con GPS disponible)** — es a propósito (prueba de presencia). Si alguien reporta "no puedo registrar visita desde la oficina", ESA es la razón.
3. UI: botón "🔄 Reintentar ubicación" + aviso "⚠️ Obligatoria" cuando el GPS falla/está pendiente.
4. `ClientesView` PanelAprobacion: la ubicación pasó de link de texto chico a **botón pastilla** "📍 Ver ubicación en el mapa", consistente con las otras 2 vistas.

**Verificado en vivo** (cliente de prueba desechable + geolocation mock, ya borrado): auto-captura muestra las coords al abrir sin tocar nada; con GPS negado sale el aviso de obligatoria + error; el botón pastilla aparece junto a las fotos en el panel de aprobación. Dato real al momento del fix: 18 de 20 visitas recientes tenían ubicación, 2 no (las guardadas sin tocar el botón viejo).

Relacionado: la migración COSTA + capacitación quedó pausada para atender esto — ver [[entrega-golive-lunes27]].
