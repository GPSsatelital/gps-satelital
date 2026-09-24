---
name: cartera-telefono-grupo-admin
description: "Cartera con teléfono clickeable, grupo bajo la placa y admin asignado + placa grande en recibos — TODO en producción; mig 065 corrida y verificada"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-26T20:45:07.244Z
---

Sesión 25-jul-2026 (tras el control de transferencias). Commits `d396ab0` + `3937866`,
todo en producción y verificado en navegador a 375px.

## Qué quedó
- **Detalle del contrato (CobrosView):** teléfono = enlace `tel:` (mismo patrón de
  ReportesView) · **grupo centrado justo debajo de la placa** (pedido explícito del usuario:
  "más visible", ya no como chip en la fila) · chip **👤 admin asignado** (o "Sin asignar")
  visible para TODOS los roles (decisión del usuario). También teléfono clickeable en
  InmovilizacionesView (donde más se llama).
- **Recibos de pago:** la placa sale **grande (30px), negrita, enmarcada como la placa física
  y centrada** justo debajo de "CLUB DE MOTEROS" + título — tanto en `TicketTermico` (impreso
  80mm) como en la vista de pantalla del recibo (`#recibo-ticket`). Se quitó la fila "Placa"
  duplicada de la lista de datos. El recibo de base inicial no muestra placa (no hay moto aún).
- **Refactors de mapeo integral:** `useSubadmins()` (hook nuevo, con caché módulo-level)
  reemplazó las 3 copias de la consulta de sub-admins en MotosView/ClientesView/ReportesView.
  `COLOR_GRUPO` se movió de CajaView a `styles/shared.ts` (fuente única de colores por grupo).

## Migración 065 ✅ CORRIDA y verificada
`nombres_subadmins()` — función security definer que devuelve SOLO id+nombre de los SUBADMIN.
Necesaria porque la RLS de `profiles` (migs 005/049) solo deja leer perfiles ajenos a
ADMIN/ADMIN_PRINCIPAL → sin ella, SECRETARIA/SUBADMIN veían el chip sin nombre. Verificada en
prod: devuelve Brandon Rojas y Lumar Avendaño Pineda. `useSubadmins` intenta el RPC y cae a la
consulta directa de profiles como respaldo.

## Pendiente de probar físico
- El tamaño de la placa en el ticket (30px) está pensado para el papel de 80mm de la GA-E2001 —
  **probar con la impresora real** antes de darlo por cerrado.
