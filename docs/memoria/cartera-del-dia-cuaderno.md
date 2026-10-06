---
name: cartera-del-dia-cuaderno
description: "Reportes: ver la cartera de un día pasado (D-043, 6-oct-2026) — el cuaderno de cada noche (mig 190) ya corre; la pantalla quedó a medias en la rama wip/cartera-del-dia; falta el paso 2 (cuenta hacia atrás) y la #7"
metadata:
  node_type: memory
  type: project
  originSessionId: ecbda5fc-4619-4e95-b4dc-d59ba138caf2
  modified: 2026-10-06T23:20:52.794Z
---

El 6-oct el dueño pidió ver **la cartera como estaba un día pasado** ("¿cuánto se debía el 30 de
septiembre?"). No entendió la primera explicación (opciones A/B abstractas); entendió con el **dibujo
de la pantalla con el cuadrito "Día"** y la comparación con **el cuaderno de la caja** ("si cada noche
se anota, después se busca cualquier día; si nunca se anotó, toca sacar la cuenta hacia atrás").
Eligió "Las dos" y "empieza por el paso 1". Decisión **D-043**.

**Estado al cerrar el 6-oct (noche):**
- ✅ **Mig 190 corrida y verificada**: tabla `cartera_del_dia` (una fila por contrato y día), función
  `anotar_cartera_del_dia()` que copia `zala.cliente` (la misma cuenta de `loQueDebe`), `cartera_fechas()`
  para el selector, reloj pg_cron `cartera-cada-noche` a `55 4 * * *` UTC (11:55 p.m. Colombia).
  Primera anotación: 338 contratos, $135.322.100 = cuenta en vivo.
- 🔨 **La pantalla está en la rama local `wip/cartera-del-dia`, NO en main** (el dueño paró la sesión a
  mitad de las ediciones; así como está, el PDF diría "Lo que se debe hoy" con cifras de otro día).
  Lo que falta, en orden, está en `docs/PENDIENTES.md` → P1 (primer punto). El único error de `tsc` es
  el import de `CalendarDays` en `CobranzaReportes.tsx`.
- ⏳ Paso 2 (31-ago y 30-sep hacia atrás) y #7 (proyección) sin empezar.

**Lo que se midió y sirve para seguir:**
- Reportes y `zala.cliente` dan **la misma plata peso por peso**, salvo el único Diario (ADOLFO GAMEZ,
  RLT70H, $27.000): la base no le lleva la cuenta (`estado_cartera` null) → queda `sin-cuenta`.
- La clasificación de la mig 190 reproduce exacto los estados de Reportes (gabela, mora, taller 2,
  retenidas 35, en liquidación 11, para recoger 76); "al día" sale 1 menos por ADOLFO.
- Medir pantalla y base **en el mismo momento**: la oficina registra cosas mientras uno mide y las
  cifras se mueven (pasó: $135.120.100 → $135.322.100 en minutos).
- Cuenta hacia atrás: con `cajas_llenadas` (desde el 22-ago, 2.372 filas) las semanas pagadas al 25-sep
  dieron igual a la foto de la plata `despues-172` en **354 de 365** contratos.

**Cómo aplicar:** al retomar, decir primero de dónde viene (pedido del 6-oct, D-043); hacer
`git checkout wip/cartera-del-dia`, terminar la lista de PENDIENTES, probar con el 6-oct ya anotado,
y pedir su sí antes de unir a main y subir. Relacionado: [[rediseno-toda-la-app-metodo-reportes]] ·
[[zala-vitrina-lectura]] · [[feedback-explicaciones-simples]] · [[consultar-base-desde-el-navegador]].
