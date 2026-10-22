---
name: guardado-moto-validacion
description: "Control de dónde se guarda la moto: pregunta en la visita + validación post-entrega del admin por GPS (Fases 1-3, en producción 24-jul)."
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-24T23:58:48.326Z
---

**Feature nueva (24-jul-2026, EN PRODUCCIÓN).** Control antifraude de dónde duerme/parquea la moto. La app **NO tiene el GPS del vehículo** (está en la plataforma externa; "GPS real" es backlog) → validación **manual asistida**: la app arma la tarea y muestra la referencia, el admin compara en su plataforma y marca el resultado.

**Fase 1 — pregunta en la visita** (commit `4727abf`, sin migración): `ModalVisita` tiene una última sección "Guardado de la moto" — selector Sí/No "¿Va a guardar la moto aquí, en esta casa?"; si No → "¿dónde?" + condiciones. **NO bloquea** el guardado de la visita (va de último, no frena el proceso de la casa). Se guarda en el jsonb libre `entrevista` (`guardaMotoAqui`, `dondeGuardaMoto`, `condicionesGuardado`) — tipo en `useVisitas.ts`. Se muestra en las 3 vistas de detalle (ficha cliente, panel aprobación en rojo si "No", historial).

**Fase 2 — validación post-entrega** (commit `806d69d`, **mig 060** ✅ corrida): columnas `contratos.ubicacion_moto_validada` + `_por/_fecha/_resultado` (coincide/no_coincide) + `guardado_lugar jsonb`. **Backfill: los contratos existentes → validada=true (sin fecha)** para no inundar de alertas; solo entregas NUEVAS nacen false.
- Alerta `validar_ubicacion_moto` (`useAlertas.ts`): aparece desde el día de la entrega, **persiste hasta marcarse**. Guarda **`!== false`** (no solo falsy) para no dispararse antes de la migración. Íconos/labels/nav en `AlertasView` + `CampanaAlertas` (→ cobros).
- `PanelGuardadoMoto.tsx` (nuevo, en el detalle del contrato de CobrosView, tras PanelEmpalme): solo ADMIN/AP. Muestra lo declarado en la visita (casa+mapa / otro lugar) + botones ✅ coincide / ❌ no coincide. **Guardado doble**: no aparece si `ubicacion_moto_validada == null` (pre-migración) ni si `true` sin `_fecha` (backfill de existentes). `validarUbicacionMoto()` en useContratos.

**Fase 3 — registro del lugar con su GPS** (mismo commit): `ModalRegistrarGuardado.tsx` — GPS obligatorio (auto al abrir) + dirección + condiciones + foto → `contratos.guardado_lugar` (jsonb). Se abre al marcar "no coincide" o desde el panel. **NO usa la tabla `visitas`** a propósito (su trigger 042 movería el estado del cliente). `registrarGuardadoMoto()` en useContratos.

**Verificado en vivo end-to-end** (cliente+moto+visita+contrato de prueba, ya borrados): panel muestra lo declarado → ❌ no coincide marca validada=true/no_coincide + abre el modal → GPS auto + guarda `guardado_lugar` → panel pasa a "✅ validado" con el lugar registrado.

Relacionado: [[visita-gps-obligatorio]] (la ubicación de la visita, obligatoria). El plan grande de go-live (COSTA + capacitación) sigue pausado — ver [[entrega-golive-lunes27]].
