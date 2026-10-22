---
name: liquidacion-justa-d046
description: "D-046 (8-oct-2026): la liquidación resta el abono real al acuerdo, no cobra días guardados rodados y devuelve el ahorro de las semanas del acuerdo. Caso BRADER (LIQ-0078). Cómo se recalculó sin romper y la trampa de la deriva del 30-sep."
metadata:
  node_type: memory
  type: project
  originSessionId: ecbda5fc-4619-4e95-b4dc-d59ba138caf2
  modified: 2026-10-08T18:01:05.113Z
---

BRADER GUZMAN WATSON (YAL65H, LIQ-0078) dijo que sus cuentas no le cuadraban. Tenía razón: −$447.500 cuando
lo justo era −$237.500. El dueño: «todo lo que en realidad sea justo de él hay que dárselo, pero bien
explicado» y «descontémosle los días que no la usó aunque no complete la semana». En producción 237eed8.

**Qué cambió (solo la cuenta de liquidación; Cartera, mora y motor no se tocaron):**
- El renglón del acuerdo resta lo abonado desde la firma (`abonadoDesdeLaFirma`, la misma cuenta de Cartera),
  no cuotas completas. En un renglón ya escrito, `acuerdosEnLaLiquidacion` solo cambia la cifra si es la que
  puso el sistema (vieja o nueva); si alguien la cambió a mano, se respeta.
- `ajusteSalidaLedger(contrato, corte, diasNoUsados)`: los días de `acuerdos_tiempo_rodado` con
  `rodar_al_final` (de la entrada al día antes de la salida) salen de lo usado, día por día. Nunca el día del
  corte: ese se cobra siempre (regla 9).
- `ahorroDeLosAcuerdos`: si se cobra un acuerdo entero, se devuelve el ahorro de sus semanas que la mig 097
  no alcanzó a acreditar (el ahorro es lo último que se llena). No aplica por cumplimiento (D-023).

**Trampa al recalcular (8-oct):** de las 5 calculadas, 3 (0025, 0050, 0076) salían con el cliente debiendo
MÁS. No era D-046: era la deriva del arreglo del 30-sep («ahorro caja por caja»), que estaba aprobado y decía
que cambiarían al recalcular. Se separó midiendo tres cifras por liquidación: guardado, hoy sin el arreglo,
hoy con el arreglo. La fecha de corte no se guarda: se reconstruye buscando el día cuyo `ajusteSalidaLedger`
da los mismos renglones automáticos (en las 5 dio un solo día, igual a la recepción). Se recalculó desde la
pantalla (no a mano en la base), con `window.confirm` puesto en true solo durante el clic.

**Trampa del navegador:** `await import('/src/utils/x.ts')` puede devolver la copia VIEJA del módulo
después de editar (Vite actualiza con `?t=`). Recargar la página antes de medir: la primera medición dio
"efecto 0" por eso. Ver [[consultar-base-desde-el-navegador]].

El PDF del cliente (dos hojas, "para un niño", con la alcancía de $26.000 y la historia de los dos acuerdos)
está en `docs/estados-de-cuenta/` (no se sube). Ver [[liquidaciones-definicion-cerrada]] ·
[[ahorro-de-quien-es-regla-d023]].
