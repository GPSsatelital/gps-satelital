---
name: dos-cuentas-de-dias-mora
description: "Regla del dueño (9-sep-2026): en el sistema hay DOS cuentas de días y no se confunden — días EN MORA (desde el día que le tocaba pagar el ciclo y no lo completó; un abono no la reinicia, y es la que manda) y días DESDE SU ÚLTIMO PAGO (desde el último abono, cualquier abono la reinicia, es informativa). Cartera ordena por la primera, de mayor a menor, con las retenidas al final."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-09T14:17:46.155Z
---

# Las dos cuentas de días (9-sep-2026) — commit `667941b`

## La definición, dicha por el dueño
> "El tema de la mora es desde el día que tenía que hacer su último pago y no lo hizo o no lo ha
> completado. Y el último día de pago es desde el último día que abonó o realizó algún pago."

| | **Días en mora** | **Días desde su último pago** |
|---|---|---|
| Cuenta desde | El día que le tocaba pagar su ciclo y no lo completó | El último abono, del monto que sea |
| ¿Un abono parcial la reinicia? | **No** | **Sí** |
| Dónde vive | `diasEnMora()` · `zala.cliente.dias_mora` · `vencida_texto` | `diasSinPago` · `dias_sin_pago` · `dias_texto` |
| En pantalla | "6d en mora" · "En mora hace 6 días (desde el día que le tocaba pagar)" | "Último pago hace 13 días" |
| Para qué | **Manda:** recolección, orden de las listas, paso del protocolo | Informativa: se le nombra al cliente porque él la reconoce |

Ejemplo que las separa: quien debe 3 semanas y abonó $50.000 ayer lleva **1 día** desde su último
pago y **16 días** en mora.

## Lo que cambió en Cartera
- **La lista de Contratos se ordena por días en mora, de mayor a menor.** Antes salía en orden de
  creación del contrato: los "Al día" tapaban a los atrasados (fue lo que el dueño mostró en una
  captura). Verificado: 43d, 41d, 20d, 15d…
- **Las retenidas van al final**, aunque sean las que más días acumulan (había 3 con ~$2.4M
  encabezando la lista): a esas no se les sale a cobrar, la moto ya está en el patio y se gestionan
  desde Inmovilizaciones. Sus 59 filas taparían a los que sí se pueden cobrar hoy.
- **Su marca pasó de gris a naranja** (`--orange-ink` sobre `--orange-soft`), para ubicarlas de un
  vistazo ahora que están abajo. Naranja y no rojo ni amarillo, que ya significan mora y gabela.
- **"Xd sin pagar" era una etiqueta mentirosa**: mostraba los días desde el último pago con nombre
  de mora. Ahora dice "Xd en mora", y en gabela "día de gracia" en vez de un "0d" sin sentido.
- El panel Hoy desempata igual: entre los que aún tienen tarea pendiente, primero el de más mora.

## Dónde quedó escrito
`CLAUDE.md` (sección de cobros, antes del protocolo de mora) · `docs/DICCIONARIO-ESTADOS.md`
Parte 2 (filas C2 y C2b + tabla comparativa) · `zala.diccionario` ya lo decía bien desde la mig 126.

## 🔲 Notado y NO tocado (falta la palabra del dueño)
A las motos **retenidas** les sigue saliendo el badge **"P4: RECOLECCIÓN FÍSICA"**, que no tiene
sentido: la moto ya está recogida. Es ruido en una pantalla que ya tiene tres chips por tarjeta.

**Why:** un número correcto con la etiqueta equivocada es tan caro como un número malo — el
funcionario cobra o recoge con la información errada. Es la misma familia del defecto de
[[bucket-recoleccion-cuenta-dias-equivocados]], que salió el mismo día.
**How to apply:** al mostrar días en cualquier pantalla nueva, decir SIEMPRE cuál de las dos es.
Nunca "días sin pagar" a secas.
