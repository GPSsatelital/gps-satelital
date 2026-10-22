---
name: liquidaciones-definicion-cerrada
description: "19-ago-2026: las 6 decisiones del dueño sobre liquidaciones quedaron CERRADAS (no re-preguntar) + los defectos verificados con datos reales + el plan en 4 pasos"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-08-21T17:03:29.448Z
---

# Liquidaciones — definición cerrada con el dueño (19-ago-2026)

Complementa [[liquidaciones-auditoria-y-huecos]] (los 83 hallazgos). **Esto es lo que el dueño
decidió: NO re-preguntar.**

## Las 6 decisiones

1. **Si queda debiendo** → la deuda **sigue viva**: se le puede cobrar o conveniar si vuelve. No
   se da por perdida (solo lista negra no basta).
2. **Si nunca vuelve a firmar** → se cierra igual, marcada **"sin firma del cliente"**. La moto no
   se queda bloqueada esperándolo.
3. **"Cumplimiento" con semanas pendientes** → **bloqueado del todo**, ni aparece la opción. Es el
   motivo que le regala la moto al cliente y hoy viene preseleccionado.
4. **Saldo a favor** → es plata del cliente: **entra en la liquidación igual que el ahorro**.
5. **Fecha de corte** → la **escribe el ADMIN**, precargada si hay recepción registrada. **Sin
   fecha el sistema no deja calcular.** (20 de 44 retenidas no tienen esa fecha en ninguna parte.)
6. 🔴 **Se cobra hasta el día en que se guardó o se retuvo el vehículo.** Ni un día más. Es la
   regla 9 del libro de cajas, y el dueño la reconfirmó textualmente.

## Excepción del candado de entrega

El candado "no entregar una moto con contrato abierto" bloquea **crear un contrato nuevo**.
**NO bloquea el préstamo de reemplazo** — ese es temporal y no le quita la moto a nadie.

## Qué es un convenio (aclaración del dueño, corrige una lectura mía)

> *"El convenio agrupa lo que el cliente deba para que no salga en mora por todo junto, y le da un
> valor diferido más fácil de pagar. Pero cuando entra la plata, cada peso tiene que irse a donde
> de verdad iba."*

O sea: **sí es correcto que marque semanas** — para eso existe. Yo lo había leído como que violaba
"el convenio va encima del pago normal"; no es así. Lo que **sí** hay que revisar es que un
convenio **por la BASE INICIAL** absorba semanas de cuota, porque la base no es una semana.

## Los defectos, verificados con datos reales (no por lectura)

**Dentro de la liquidación:**
1. Cuenta los días **hasta HOY**, no hasta la entrega (`LiquidacionesView.tsx:152`).
2. El **convenio incumplido no se ve** (`useLiquidaciones.ts:110` filtra `estado='activo'`) → liquida
   con $0 de deuda y devuelve todo el ahorro. Es el caso que MÁS se liquida.
3. El **saldo a favor no se suma**. SERAFIN (IGC39I) perdería $3.000.
4. **Cerrar no salda nada**: deudas y convenio quedan vivos en la BD.
5. **"Cumplimiento" preseleccionado** (`ContratosView.tsx:420`). Riesgo VIVO en IGC39I: la moto ya
   es de GERMAN.
6. **Cero pruebas** automáticas sobre estas cuentas (216 en el sistema, ninguna aquí).

**Alrededor — y es lo que hace que la liquidación salga FALSA:**

7. 🔴 **El contador de semanas no para nunca.** `cajasExigidasHasta()` no mira el estado del
   contrato. Ver [[bug-contador-sigue-corriendo-moto-reasignada]].
8. 🔴 **No hay candado al entregar** una moto con otro contrato abierto: el wizard filtra solo por
   `estado === "Disponible"` (`WizardContrato.tsx:157`), y `estadoMotoTrasLiberar()` solo busca
   contratos **Activo** — un **Suspendido** no lo ve.
9. **Empalme abierto** en 2 de las 3 motos a liquidar: sus cifras viejas nunca se revisaron con el
   cliente, y la liquidación se FIRMA.

## Estado de las 3 motos que el dueño quiere liquidar (20-ago)

Las tres tienen **`motor_v2: true`** → el ajuste de salida SÍ les funciona. Ninguna tiene convenio
de base marcando cajas.

| Moto | Cliente | Sin pagar hoy | Nota |
|---|---|---|---|
| IEW65I | ANTONIO MONTERROZA | 4 cajas = $808.000 | migrado, 0 pagos desde el corte |
| IGC39I | SERAFIN RODRIGUEZ | 2 cajas = $404.000 | prorrateo $47.000 sí pagado · +$3.000 a favor |
| RML59H | JOSUE GRAU | 1 caja parcial $81.000 | + deuda apertura $210.800 |

## El plan en 4 pasos

1. **Que se pueda liquidar bien** — corte al día que se guardó · saldo a favor · convenio
   incumplido · bloqueo de "Cumplimiento" · aviso de empalme abierto.
2. **Que no siga creciendo ni vuelva a pasar** — parar el contador · candado al entregar.
   *Necesita decidir cómo distingue el sistema "no la va a recuperar" de "sí la va a recuperar".*
3. **Que cerrar cierre de verdad** — saldar deudas y convenio en una sola operación atómica.
4. **Pruebas** con las 3 motos reales.
