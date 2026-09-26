---
name: devolucion-base-doble-registro
description: 25-sep-2026 — devolver la base se registraba 2-4 veces porque el guardián de estados frenaba a la secretaria en el último paso; mig 172 lo hace en una transacción con candado.
metadata:
  node_type: memory
  type: project
  originSessionId: ecbda5fc-4619-4e95-b4dc-d59ba138caf2
  modified: 2026-09-25T22:00:51.883Z
---

**El defecto (vivo desde la mig 091, 6-ago):** `devolver_base` era un permiso SOLO de pantalla
(no estaba en `_acciones_default()`). ModalDevolucionBase hacía 3 pasos sueltos; el último
(cliente → Retirado + base $0) lo rechazaba `enforce_cliente_estado_change()` porque solo ADMIN
pasa a Retirado. La plata quedaba registrada, la base seguía, el botón "Entregar" seguía ahí y
ANGELA lo volvía a tocar: OMAR YANCES 4 veces (6-ago), FELIPE SEMBERGMAN 2 (5-sep), JOSE LUIS
VASQUEZ 2 (25-sep) = **$2.082.000 de más**. Nadie lo notó en 7 semanas porque no hay cajas
cerradas desde el 13-ago.

**Corrección de datos (25-sep, la corrió el dueño en el SQL Editor):** se borraron las copias
(dejando una devolución y una visita por cliente) y la base de los 3 quedó en $0. El dueño confirmó
que la plata se entregó UNA sola vez. A JOSE LUIS se le dejó la devolución con motivo "PERSONALES".

**Arreglo (mig 172, commit 6ebc3dd):** `devolver_base()` hace todo en una transacción; exige
devolver + visita = base exacta del cliente, con `for update` → segunda devolución imposible.
Probado en producción: rechaza a JOSE LUIS sin registrar nada.

**Why:** un permiso que solo existe en la pantalla choca con los guardianes de la base, y un flujo
de plata en pasos sueltos deja estados a medias que invitan a repetir.
**How to apply:** al dar a un rol no-ADMIN una acción que cambia el estado del cliente, revisar el
guardián; toda salida de plata va en una función de la base con candado, no en inserts sueltos.
Ojo: INGRID URBINA (−$390.000) y PEDRO FLOREZ (−$30.000) salen con saldo de base negativo, pero es
porque su base es anterior a `abonos_base` (solo tienen el traslado a saldo). No es este defecto.

Ver [[candado-saldo-favor-dos-clics]] · [[base-inicial-circuito-completo]] · [[permisos-dos-capas-rls]].
