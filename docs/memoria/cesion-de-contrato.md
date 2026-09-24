---
name: cesion-de-contrato
description: "11-ago-2026: un contrato ya se puede pasar a otra persona con ahorros, semanas pagadas y deudas. Mig 094 ✅. Reglas del dueño y el defecto que casi le reescribe la historia a 300 clientes."
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-11T23:24:21.439Z
---

# Cesión de contrato — cambio de titular · producción 11-ago-2026

`main` = `e4c8f81`. Migración **094 ✅ corrida y verificada contra la base**. 175 pruebas verdes.
Plan completo en `.claude/plans/humble-dazzling-phoenix.md` (última sección).

## El caso que lo disparó

El cliente de la **DPU50I** le cede su contrato a otra persona. El acta legal ya existía (la
redacté el 10-ago), pero el sistema **no contemplaba esto en absoluto**: `contratos.cliente_id`
se fijaba al crear y **ningún código lo cambiaba jamás**.

## La decisión de arquitectura

🔴 **El contrato NO se recrea. Solo cambia `contratos.cliente_id`.**

Legalmente es *cesión de posición contractual*, **no novación** — y el propio contrato de arriendo
ya lo contemplaba: su **cláusula SEGUNDA, parágrafo primero** dice que no se puede ceder *"sin la
autorización escrita del ARRENDADOR"*, y la **DÉCIMA CUARTA** habla de los gastos *"de sus
cesiones"*. El acta ES esa autorización, y por eso la firman los tres.

Técnicamente es gratis: el motor de cajas vive en columnas de `contratos`, y
pagos/deudas/convenios/gestiones cuelgan solo de `contrato_id`. **Cambiar el titular no mueve un
peso.** Recrear el contrato obligaría a re-teclear cada cifra a mano.

## 🔴 El defecto que eso creaba, y cómo se pagó

Cambiar `cliente_id` a secas **reescribe la historia**: al que cede se le vacía la ficha y al que
recibe le aparecen pagos que nunca hizo.

**No era un lugar, eran cuatro**: `lineaTiempo.ts`, `FichaClienteView` (6 derivados + 2 KPIs → 7 de
9 pestañas se vaciaban), `HistorialPagosView` y el ranking de `ReportesView`.

**La solución reutiliza lo que ya existía:** `ventanas`/`enVentana` en `lineaTiempo.ts` resolvía
*"esta MOTO tuvo varios dueños"*. Se le agregó el hermano: *"este CONTRATO tuvo varios
arrendatarios"*. Las funciones puras (`contratosDeCliente`, `tramosDeTitular`, `esDeSuTramo`,
`titularEnFecha`) viven en `useCesiones.ts` porque las consumen 4 pantallas.

Detalles que costaron pensar:
- El titular original sale de `cesiones[0].cedente_id`, **no** de `contrato.cliente_id` (ese ya es
  el de hoy). Con dos cesiones encadenadas, el primero desaparecería.
- `tramosDeTitular` devuelve un **array**: un contrato puede volver a quien ya lo tuvo (A→B→A).
- Borde **semiabierto**: el día de la cesión es del que **recibe**. Si contara para los dos, esa
  plata se vería dos veces.
- La conversión a **hora de Colombia** vive dentro de `useCesiones`, no en cada pantalla: un pago
  de las 8 pm caía en el día siguiente y justo en el borde cambiaba de dueño.
- `cesiones` es **obligatoria** en `FuentesLT` a propósito → el compilador señaló las 3 pantallas
  que la necesitaban. Mapeo integral hecho por la máquina, no por memoria.

## Reglas del dueño (CERRADAS — no re-preguntar)

| | |
|---|---|
| ¿Dónde queda el contrato? | **Sigue donde iba** (cuota 14 de 52, con su ahorro y su deuda). No reinicia |
| ¿Con la moto retenida? | **Sí — es el caso más frecuente.** La cesión es lo que permite que salga a nombre de otro |
| ¿La cesión entrega la moto? | **No.** Sale aparte por Inmovilizaciones, con las reglas que ya tiene |
| ¿Qué exige el que recibe? | Todo lo de un cliente nuevo (papeles suyos y del acompañante, visita, charla) + acta + **pagaré con carta de instrucciones** + certificado |
| ¿Y la deuda? | **Pasa completa.** No se exige saldarla; solo que ambos la vean y se congela en el registro |
| ¿El que cede? | **Retirado**, puede volver después desde cero |

⚠️ Él corrigió dos veces mi lectura del caso, y las dos veces yo estaba adelantándome:
primero asumí que la moto estaba guardada *por el traspaso* (no: **por falta de pago**), y después
que la cesión debía entregarla (no: **va aparte**). La lección: cuando dice "noooo", **pedirle que
explique antes de seguir diseñando**.

## El bloqueo que él encontró (y que yo no había visto)

**No se podía ni REGISTRAR a quien recibe:** `ClientesView.tsx` exige base mínima de $100.000, pero
el cesionario **no paga base, la hereda**. El "arreglo" del mostrador —teclear un monto cualquiera—
causaba **tres defectos de plata a la vez**: entraba a la caja del día, se imprimía un recibo por
plata que nadie recibió, y esa base fantasma quedaba **reclamable**.

Solución: `clientes.ingreso_por_cesion` + selector *"¿Cómo ingresa este cliente?"*. La marca de
"pendiente" es **DERIVADA** (marcado + sin fila de cesión todavía) → **se apaga sola**. Alerta a
los **3 días** si la cesión no llega: es el control de que la opción no se use para saltarse el
cobro de una base real.

## Lo que BLOQUEA la cesión

Préstamo de reemplazo vivo · empalme abierto · liquidación abierta · **pagos sin confirmar**.
Ese último es el más silencioso: al confirmarlos mañana, `aplicar_pago_confirmado()` le llenaría
las cajas al cliente nuevo con la plata del anterior.

## Las 4 tablas "desalineadas" — NO se tocan

`liquidaciones`, `recepciones_vehiculo`, `acuerdos_tiempo_rodado`, `abonos_base` llevan
`cliente_id` propio y **se dejan como hecho histórico**.

> `contrato_id` responde *"¿a qué contrato afecta?"* y se mueve solo.
> `cliente_id` responde *"¿quién lo hizo / quién puso la plata / quién firmó?"* y **no se puede
> mover sin mentir.**

El peor sería `abonos_base`: reescribirlo haría que una devolución futura le pagara **la plata de
otro**. Está escrito como comentario en la migración para que nadie lo "arregle" creyendo que es
un bug.

## Un falso positivo que casi me hace perseguir un fantasma

Apareció en consola `cannot add postgres_changes callbacks for realtime:clientes-store after
subscribe()`. **Antes de culpar a mis cambios**: guardé lo no commiteado con `git stash` y el error
seguía igual; después compilé producción y salió **cero errores**. Era artefacto del servidor de
desarrollo recargando en caliente. **En dev, un error de consola no prueba nada hasta verificarlo
contra el build de producción.**

## 🔲 Lo que falta

- **La redacción jurídica del acta debe revisarla el abogado.** Las cifras sí están verificadas
  (salen del sistema); el texto legal es decisión de él.
- **P4 del análisis de convenios**: editar un convenio mal pactado en vez de borrarlo.
- `revertirCesion()` para ADMIN_PRINCIPAL — la fila ya guarda todo lo necesario. No es urgente.
- Sin probar en vivo: una **cesión real de punta a punta** (no había dos clientes elegibles).

Ver [[base-inicial-circuito-completo]] · [[convenios-revision-completa]].
