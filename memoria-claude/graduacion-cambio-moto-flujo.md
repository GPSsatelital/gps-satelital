---
name: graduacion-cambio-moto-flujo
description: "El circuito completo del CAMBIO DE MOTO (construido 22-ago, migs 105-115) — liquidar, \"sigue con la empresa\", 3 destinos de la plata, wizard reclama el saldo con origen, re-visita. Proximos usos JOSUE y ADOLFO. Falta verlo en navegador."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-08-22T20:21:57.836Z
---

# Cambio de moto: el circuito completo (construido 22-ago-2026, EN PRODUCCIÓN, sin probar en navegador)

Antes el cambio de moto se hacía a mano y tenía 3 trampas (regalar la moto por motivo
"Cumplimiento", contar el ahorro dos veces, y el orden que dejaba al cliente Retirado —
detalladas en [[bug-diario-ahorro-no-acumula]]). **Este flujo las cierra las tres por diseño.**

## El paso a paso (quien lo opere lo sigue en este orden)

1. **Recibir la moto vieja** → iniciar liquidación (motivo: retiro voluntario — la moto vuelve
   a Disponible, NUNCA "Cumplimiento" que la regala) → revisión de taller → calcular.
2. **Documento + firma en pantalla** (huella del registro) → el saldo final queda cuadrado.
3. **Cerrar** marcando ☑ **"Sigue con la empresa — hará cambio a otra moto"** (el cliente NO
   queda Retirado; el guardián de estado se salta con la señal transaccional de la mig 111,
   por eso ANGELA también puede). La pantalla reparte el saldo en **3 destinos**:
   - **Base para la moto nueva** (default `min(saldo, 510.000)`) → cae en
     `clientes.ingreso_inicial` y `liquidaciones.base_trasladada` (mig 114);
   - **A favor para el contrato nuevo** (default el resto) → `liquidaciones.saldo_para_nueva`
     (mig 115);
   - **Efectivo** (lo que se le entrega en mano) — la suma debe cuadrar con el saldo.
4. **Wizard del contrato nuevo**: la base llega sola por `ingreso_inicial`; y al crear el
   contrato el wizard **reclama el saldo a favor con su origen** — busca liquidaciones cerradas
   del cliente con `saldo_para_nueva > 0` y `contrato_destino_id` null, lo pone en
   `contratos.saldo_favor_apertura`, marca `contrato_destino_id` (no se puede reclamar dos
   veces) y deja en `contratos_auditoria`: *"$X — viene de la liquidación LIQ-XXXX"*.
5. **Si la entrega no es el mismo día**: la re-visita se programa por el sistema — la mig 113
   amplió `mis_visitas_asignadas` a clientes con contrato (Aprobado/Activo/En mora/etc.) y esa
   visita NO mueve el estado del cliente (flag fuera del embudo).
6. Recibo de egreso y documento muestran el desglose de los 3 destinos (↳ base / ↳ a favor /
   ↳ efectivo).

## La plata nunca se copia — VIAJA

El ahorro sale del contrato viejo por la liquidación y entra al nuevo por ingreso_inicial +
saldo_favor_apertura. Nada queda en dos lados a la vez, y cada peso tiene su rastro en la
auditoría. Si la base que llega es < $510.000, el wizard marca lo que falta y se cubre con pago
del día o convenio, como cualquier cliente.

## Próximos usos (en este orden)

- **JOSUE (RML59H)**: proyección $690.200 al corte del 12-ago. Liquidar al recibir la moto;
  al cerrar: $510.000 base + el resto a favor (defaults de la pantalla). Su contrato tiene el
  desparejo base/semana ya explicado por la REGLA MADRE ([[liquidacion-firma-digital-y-desglose]]).
- **ADOLFO (RLT70H)**: PRIMERO su SQL de reclasificación ([[bug-diario-ahorro-no-acumula]] tiene
  la tabla), después el remate de los pagos nuevos, y recién ahí liquidar y graduarlo a Semanal.
  Llega con ~$480.000 → el wizard le marcará lo que falte para los $510.000.
- **BASANTA (RMY55H, LIQ-0003)**: caso especial — diario sin motor: los días rodados sin pagar
  se cargan A MANO como deuda en la revisión, con la fecha REAL en que entregó (hace mucho).

**Why:** es el circuito que convierte "liquidar" en "cambiar de moto sin perder un peso" — la
petición del dueño fue explícita: que la plata quede marcada de dónde viene y a dónde va.

**How to apply:** cualquier cambio de moto usa ESTE flujo, nunca el camino a mano. ⚠️ Nada de
esto está verificado en navegador todavía (el clasificador bloqueó el browser el 22-ago): probar
el cierre con 3 destinos, el claim del wizard y la re-visita antes del primer uso real.
Relacionado: [[liquidaciones-definicion-cerrada]] · [[base-inicial-circuito-completo]].
