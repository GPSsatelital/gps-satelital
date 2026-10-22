---
name: auditoria-permisos-rls-julio2026
description: "Auditoría completa de políticas RLS/triggers/checks contra la BD real (7 jul 2026): huecos encontrados, migraciones 035-038, y la regla repo=BD"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

Auditoría de permisos del 7 jul 2026, disparada por la cascada de errores al probar la recolección del SUBADMIN en real. Se volcó el estado REAL de la BD (pg_policies, information_schema.triggers, pg_constraint, pg_proc) y se comparó contra el repo.

**Causa raíz identificada:** desincronización repo↔BD — arreglos aplicados directo en Supabase sin quedar en el repo, y migraciones del repo nunca corridas (ej. la 010 con 'Suspendido', la 014 con USADAS). **REGLA NUEVA acordada: toda migración queda en el repo Y se corre en Supabase, siempre las dos.**

**Hallazgos y estado:**
- `gestiones_cobro` ABIERTA a cualquier autenticado — el drop de la 026 usó el nombre `gestiones_all` pero la política real era `gestiones_cobro_all` (no coincidió, sobrevivió). Cerrada en 037. **Lección: verificar nombres reales de políticas antes de dropear.**
- `motos` INSERT/UPDATE y `taller` completo abiertos (diferidos en 026). Cerrados en 037 con matriz: motos INSERT=ADMIN/AP, UPDATE=+SECRETARIA, SUBADMIN sus motos, MECANICO (taller); taller=staff+MECANICO, SUBADMIN lee sus motos.
- `contratos` y `contratos_auditoria` SIN política DELETE — `eliminarContratoEnProceso` borraba 0 filas EN SILENCIO (RLS filtra sin error). Arreglado en 037; el DELETE de contratos solo permite estado='En proceso' (garantía en la BD misma).
- `motos_estado_check` sin 'En traspaso' y `motos_grupo_check` sin USADAS — bombas desactivadas antes de explotar (Paz y Salvo y primera moto USADAS habrían fallado). Mig 038.
- Guard de roles (`enforce_profile_role_change`): SÍ exige ADMIN_PRINCIPAL y cubre role+permisos+grupo, pero usaba `public.current_role()` — que resultó ser un DUPLICADO EXACTO de `mi_rol()` (select role from profiles where id = auth.uid()), no un hueco. Unificado a mi_rol() en 038. Nota: mi_rol() devuelve NULL para el service role → el guard no bloquea a la Edge Function (correcto, ella valida por su cuenta).
- Verificados OK: guard de clientes (usa mi_rol), trigger pagos (INSERT/UPDATE/DELETE completo), deudas_concepto_check (tiene multa_recoleccion), pagos_estado_check (tiene Rechazado).

**Cadena de la recolección (3 errores en serie, arreglados):** RLS recepciones_vehiculo → RLS update contratos (ambos mig 035, SUBADMIN limitado a sus motos vía mis_moto_ids_subadmin/mis_contratos_subadmin) → CHECK contratos sin 'Suspendido' (mig 036). Quedaron 3 recolecciones a medias (gestión tipo recoleccion pero contrato Activo) — rehacerlas desde el Panel Hoy.

**Pendiente al cierre:** confirmar Success de la 038; redesplegar Edge Function manage-users (la desplegada es vieja, sin action "list" → error non-2xx en pantalla Usuarios); probar flujos tras el endurecimiento (MECANICO taller, SECRETARIA pagos, recolección completa).

**Diferido:** desglose exacto de permisos por acción documentado en la conversación (matriz por módulo); los "permisos a medida" (profiles.permisos) son SOLO de visibilidad de menú en frontend — la RLS decide por rol, no los mira (decisión de diseño pendiente de revisar).

Ver [[migracion-grupos-datos-reales]] y [[rediseno-contratos-liquidaciones-julio2026]].
