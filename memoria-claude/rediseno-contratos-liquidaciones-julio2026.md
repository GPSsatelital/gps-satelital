---
name: rediseno-contratos-liquidaciones-julio2026
description: "Plan grande en curso: rediseño del ciclo de vida de contratos, motos, liquidaciones e inmovilizaciones — 9 fases, plan aprobado guardado en disco"
metadata:
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

Trabajo iniciado el 5 jul 2026. El plan completo (34+ decisiones de negocio confirmadas pregunta por pregunta, 9 fases de implementación) está guardado en `C:\Users\USER\.claude\plans\sunny-brewing-island.md` — **leer ese archivo completo al retomar**, no está resumido aquí porque es muy extenso y ya quedó aprobado por el usuario.

## Resumen de las 9 fases (detalle completo en el plan)
0. Corregir criterios de Inmovilizaciones (mora real, deuda real, exigir gestión antes de recolectar) — **en curso, código escrito, falta build+commit**.
1. Arreglar que la moto vuelva mal a "Disponible" en 3 lugares (Taller, retenciones, reactivar contrato).
2. Ahorro acumulado con trigger automático en BD + panel de reconciliación visible.
3. Conectar Taller real a Liquidación + corregir que `confirmarCierre` use el motivo (no siempre "Finalizado").
4. Conectar Liquidación a botones reales de la app (hoy existe pero nadie la puede iniciar — código muerto).
5. Paz y Salvo + transferencia de moto al cliente que cumple su contrato de tiempo definido.
6. Fotos en el formulario de recepción que ya existe (`recepciones_vehiculo`).
7. Cliente pasa a "Egresado" (no "Retirado") si cumplió y se llevó su moto; "Retirado" en los demás cierres.
8. Corregir CLAUDE.md sección Garantía (ya no dice "no genera deuda" — se corrigió a que sí puede cobrarse/rodarse igual que Fiscalía/Tránsito).

## Bugs reales encontrados en la auditoría (más allá de las decisiones de diseño)
- `iniciarLiquidacion()` y `actualizarAhorro()` — dos funciones completas construidas pero nunca conectadas a ningún botón de la UI, mismo patrón que [[estado-ficha-cliente-julio2026]] (ClienteDetalleSheet).
- `iniciarLiquidacion()` guardaba un estado de moto inválido (`"En taller"`, no existe en el enum).
- Inmovilizaciones usaba días-desde-el-último-pago en vez de días-de-mora-real — daba falsos positivos para clientes Semanal/Quincenal/Mensual que pagan puntual.

## TEMA convenios — YA DEFINIDO con el usuario (5 jul 2026), implementación pendiente
Detalle completo en el plan (`sunny-brewing-island.md`, TEMA 3). Dos bugs reales encontrados (`abonarCuotaConvenio` y `marcarIncumplido` nunca se llaman — mismo patrón de código muerto). Decisiones: cuotas avanzan solas al pagar; el convenio cuenta para la mora igual que la cuota normal; pago parcial abona pero sigue en mora; incumplido automático solo al vencerse las cuotas; para recuperar moto retenida paga cuota+convenio+multa; 3er incumplido → alerta + "requiere liquidación" (admin decide); panel Hoy muestra desglose.

## Estado del deploy — ✅ TODO EL PLAN EN PRODUCCIÓN (5 jul 2026)
- Fase 0: commit `1cbf1ef`. Resto del plan completo: commit `5aca096` (merge `c386c5c` en main), build pasó, Vercel desplegado. Incluye: Liquidación conectada a la UI (ModalIniciarLiquidacion, regla 7 días), ModalRecoleccion (recolección con evidencia en un solo submit), convenios contando para mora + desglose en Panel Hoy, Paz y Salvo + estado "En traspaso", fotos en recepción, Egresado/Retirado, y la migración `032_trigger_ahorro_convenio.sql`.
- **⚠️ PENDIENTE DEL USUARIO: correr la migración 032 en Supabase** — sin ella, iniciar liquidación o cerrar por cumplimiento FALLA (columnas taller_id/fecha_traspaso_completado no existen) y el ahorro/convenio no avanzan al pagar.
- **⚠️ PENDIENTE: probar en navegador con login real** los flujos nuevos.
- **Diferido a propósito:** bloque de reconciliación (necesita regla FECHA_CORTE para los 44 migrados — preguntar al usuario), flujo de graduación Diario→tiempo definido, alerta de campana a los 7 días.
- **Código muerto detectado (3er caso):** `MotoDetalleSheet.tsx` — nadie lo importa, eliminar en limpieza futura.
- Archivos nuevos: `ModalRecoleccion.tsx`, `ModalIniciarLiquidacion.tsx`, `032_trigger_ahorro_convenio.sql`.

## TEMA 4 — Flujo operativo de inmovilización — YA DEFINIDO (5 jul 2026), implementación pendiente
Detalle en el plan (TEMA 4). Decisiones: el mismo SUBADMIN a cargo recolecta; en terreno primero intenta cobro en campo, solo si no paga inmoviliza; el registro (fotos/estado) se hace al llegar a la bodega, NO en la calle; UN solo formulario combinado ("Registrar recepción" existente + fotos) que al guardar encadena todo: suspende contrato + moto Recuperada (o Mantenimiento si va a taller) + multa $20.000 + gestión recoleccion; selector de destino oficina/bodega/taller; SIN campo responsable (se agrega cuando haya encargado de bodega); SUBADMIN lo hace solo; al pagar dentro de 7 días la moto vuelve directo a Asignada sin taller.

## Próximo tema (no empezado aún)
Ninguno anunciado explícitamente al cierre — quedan pendientes de implementar TODAS las fases del plan (0 ya hecha; 1-8 + Convenios + Inmovilización pendientes). Preguntar al usuario si quiere seguir DEFINIENDO más temas o empezar a IMPLEMENTAR las fases ya definidas.

## Preferencia de comunicación confirmada en esta sesión
Ver [[feedback-explicaciones-simples]] — explicar todo con ejemplos concretos, no solo fórmulas/jerga.
