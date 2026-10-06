---
name: andres-ballestas-liq0032-devuelta
description: "6-oct-2026: LIQ-0032 de ANDRÉS BALLESTAS (RLZ85H) se devolvió al paso de la revisión (mig 188) porque se cerró sin validar ahorro ni deudas; faltan 4 datos para rehacerla. Método reusable para devolver una liquidación cerrada cuando la moto ya es de otro."
metadata:
  type: project
---

**CERRADA el 6-oct en $0** (decisión del dueño: deuda vieja $1.339.000 perdonada y cruzada con su ahorro $910.000 y base $300.000; retrovisores fuera; cerrada SIN firma; Aprobado a mano porque «Cerrar sin firma» no trae la casilla "Sigue con la empresa"; $150.000 de base para la moto nueva en `clientes.ingreso_inicial`; transferencia de $35.000 sin registrar a propósito). Lo de abajo es la historia.

**Estado (6-oct, antes del cierre):** LIQ-0032 en `en_taller`, contrato Suspendido (mora) con `fecha_fin_cobro` 29-sep
(la moto RLZ85H es de SILFREDO PEDROZA desde ese día), cliente Activo sin lista negra, deuda de $35.000
del cierre borrada. Verificado después de correr la mig 188. El pendiente vive en `docs/PENDIENTES.md` (P0).

**Por qué estaba mal:** cerrada el 14-sep, antes de los arreglos de D-023. Migrado COSTA con empalme
abierto: `ahorro_inicial` en 0 (base sin confirmar, la ficha dice $500.000) y 0 pagos desde el 27-jul que
la cuenta no cobró. Con base $500.000 y corte 1-sep: debe $627.000 (no $35.000).

**Faltan del dueño:** el día en que se recogió la moto (no quedó registrado: entre el 3-ago y el 1-sep;
buscar en la plataforma del GPS), la base real, el ahorro y las deudas que traía al 27-jul.

**Lo reusable (sobre [[elkin-revertir-liquidacion-cerrada]]):**
- Si la moto ya es de otro cliente, NO se empieza una liquidación nueva: `iniciarLiquidacion` pone la
  moto en "Mantenimiento" y le crea orden de taller — le dañaría la moto al cliente nuevo. Se devuelve la
  MISMA liquidación a `en_taller`: recalcular, firmar y cerrar no tocan la moto, y el cierre no libera una
  moto con otro contrato activo.
- Al reabrir el contrato hay que ponerle `fecha_fin_cobro` (regla de la mig 129): el trigger no se lo
  puso porque estaba Cancelado cuando entregaron la moto al otro.
- 🔴 La protección de la mig 101 ("Deuda ELIMINADA" en el historial) NO está viva en producción: el
  rastro del borrado hubo que escribirlo a mano. No prometer rastros automáticos sin verlos en la base.
