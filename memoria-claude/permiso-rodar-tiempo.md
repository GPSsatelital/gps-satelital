---
name: permiso-rodar-tiempo
description: "El permiso `rodar_tiempo` (cobrar vs rodar el tiempo guardado) se prende y apaga por persona desde Usuarios. Lo tienen AP, ADMIN, SECRETARIA y SUBADMIN. Las 6 puertas por donde se abre el modal, y por qué 3 cierran la entrada y 3 no."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-15T17:28:37.778Z
---

# El permiso "rodar el tiempo de un contrato" (15-sep-2026, commit `450748c`)

Pedido del dueño: *"coloquemos un permiso… que se pueda activar y desactivar para rodar los
tiempos en los contratos"*. Eligió el default: **dejar como está hoy — ADMIN, AP, subadmin y
secretaria**. O sea: nadie gana ni pierde nada el día uno; lo que cambia es que ahora se puede
quitar a una persona sin tocar código.

**Mig 152 corrida y verificada el 15-sep** — parche anclado sobre la función viva, sin reescribirla.
Las dos capas (pantalla y base) dicen lo mismo.

## Quién lo tiene

`ADMIN_PRINCIPAL` · `ADMIN` · `SECRETARIA` · `SUBADMIN`. No lo tienen VISITADOR, MECANICO ni SOCIO.

El **subadmin sí decide**, y no es un descuido: es la regla que el dueño aclaró el 24-ago y que
vive escrita en el propio código — *"quien opere el flujo; el subadmin también, es parte de su
trabajo. Lo sagrado es EL RASTRO"*. El rastro no se tocó: sigue exigiendo el documento firmado.

## Las 6 puertas — y por qué no todas se cierran igual

El grep integral encontró **seis** lugares que abren `ModalResolverTiempoFueraServicio`:

| Dónde | Qué hace el permiso |
|---|---|
| `TallerView` (al finalizar la orden) | **cierra la entrada**: sin permiso el modal no se abre |
| `MotosView` (`abrirResolverTiempoSiAplica`) | **cierra la entrada** |
| `ContratosView` (botón manual de re-abrir) | **cierra la entrada** |
| `InmovilizacionesView` ×2 (entregar retenida · devolver préstamo) | el modal **se abre igual** |
| `CobrosView` (antes de armar el convenio) | el modal **se abre igual** |

En esas tres últimas, quien no tiene el permiso ve el aviso *"no tienes permiso para decidir
esto"* y solo el botón **"Resolver después"**. Es a propósito: ahí el modal está en medio de un
flujo que la persona sí puede hacer (entregar la moto, cobrar), y cerrarle la puerta dejaría el
pendiente **evaporado** — que es justo lo que pasó con WILLINGTON DQW26I y JUAN CARLOS YAL68H, dos
casos que hubo que arreglar por SQL.

## Hallazgo de paso: las dos capas ya venían desalineadas (medido el 15-sep)

`DEFAULT_ACCIONES` (pantalla, 24 acciones) vs `_acciones_default()` (SQL, 19). Diferencias reales:

| Rol | Solo en la pantalla | Solo en la base |
|---|---|---|
| ADMIN_PRINCIPAL | devolver_base, editar_cliente, enviar_mensaje, enviar_masivo, exportar_datos | — |
| ADMIN | devolver_base, editar_cliente, exportar_datos | **aplicar_saldo_favor** |
| SECRETARIA | devolver_base, editar_cliente | — |
| SUBADMIN | (idénticas) | — |

**Solo UNA importa.** Se listaron los 16 `puede_accion('…')` que existen en todas las migraciones:
de las 6 acciones desalineadas, la base únicamente pregunta por `aplicar_saldo_favor`
(mig 067, línea 34). Las otras 5 la base nunca las consulta → son cosméticas, nadie queda bloqueado.
Y las 5 de ADMIN_PRINCIPAL son doblemente irrelevantes: `puede_accion()` le da bypass total
(mig 048: `if v_role = 'ADMIN_PRINCIPAL' then return true`).

**Resuelto el 15-sep** (`63b90c2`): el dueño decidió que **SERGIO sí puede** aplicar saldo a favor.
Como la base ya se lo daba, se repuso solo en `DEFAULT_ACCIONES.ADMIN` — sin migración. Sergio ve
desde hoy el botón "Aplicar saldo a favor" en Cartera, que antes no le salía (puerta única:
`CobrosView:2346/2367` → `usePagos.aplicarSaldoFavor`).

Las otras 5 diferencias se dejan a propósito: la base nunca pregunta por ellas.

Relacionado: [[permisos-dos-capas-rls]] · [[regla-esencia-y-rastro]] · [[regresion-mig124-convenios]]
