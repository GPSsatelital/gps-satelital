---
name: excedente-base-a-saldo-favor
description: "El EXCEDENTE de la base inicial (lo que el cliente dio de más) pasa a saldo a favor — mig 156, 16-sep-2026. La base y el ahorro NO se tocan. Se calcula desde ahorro_inicial, NUNCA desde ahorro_apertura."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-16T21:13:44.982Z
---

# El excedente de la base pasa a saldo a favor (16-sep-2026, `08d2045`, mig 156 ✅)

Regla del dueño, cerrada **después de un intento que hubo que revertir**:
*"ni la base ni el ahorro se pueden usar para nada según lo ya establecido; lo único que se puede
usar son los saldos a favor que el cliente dé de más, y en los casos que dan más de lo que debían
haber dado en la base inicial y les queda ahí"*.

La base entregada se parte en tres y **solo la tercera se mueve**:
1. El período adelantado — ya se consumió pagando su primera semana.
2. El ahorro de la base: **$308.000** ($305.000 en los de tarifa vieja). 🔒 INTOCABLE.
3. El **EXCEDENTE** — lo que dio por encima. Esto sí.

## 🔴 SE CALCULA DESDE `ahorro_inicial`, NUNCA DESDE `ahorro_apertura`

En los migrados la apertura trae la mezcla del arqueo y **no reconcilia** con lo entregado:
PEDRO FLOREZ (IEW90I) figura con **$66.000 de apertura** —menos que los $308.000 sagrados— aunque
entregó $560.000. Desde ahí su excedente daría **negativo**.

**Por poco lo repito:** mi primera consulta listó 30 migrados con "excedentes" de hasta
**$2.971.000** que en realidad eran sus **ahorros de meses**. La señal de que medía mal: ni INGRID
ni PEDRO salían en esa lista, y eran justamente los dos casos. Es el mismo error que el dueño ya
había atajado con *"¿no estás confundiendo ahorros normales con ahorros de base inicial?"*.

| Caso | Entregó | Debía | Excedente |
|---|---|---|---|
| INGRID URBINA (XZN82H) | $900.000 | $510.000 | **$390.000** |
| PEDRO FLOREZ (IEW90I) | $560.000 | $510.000 | **$50.000** |

## Cómo quedó

- **Adónde va:** `contratos.saldo_favor_apertura`, que es de donde `saldoAFavorDe()` ya lee. Se usa
  con las reglas de saldo a favor **que ya existen y están probadas** — no se le inventó a la plata
  un camino nuevo.
- **El rastro** (*"que el sistema siempre sepa de dónde sale todo"*): fila en `abonos_base` con tipo
  propio `traslado_saldo` + renglón en `contratos_auditoria` con el antes y el después.
- **La caja NO lo cuenta:** no entró ni salió un peso, la plata ya estaba adentro y solo cambió de
  bolsillo. Mismo trato que `retencion` — si sumara, la caja diría que entró plata que no llegó.
- **Por partes**, y lo ya movido se descuenta. Permiso propio `mover_excedente_base`
  (SECRETARIA + ADMIN + AP), con espejo SQL anclado.
- La cuenta vive en `src/utils/excedenteBase.ts` con **15 pruebas**, incluida la que fija que NO se
  calcule desde la apertura.

**Verificado en pantalla con INGRID:** el recuadro dice "$390.000 · Entregó $900.000 y debía
$510.000. Su base de $308.000 no se toca", y pedir $500.000 responde *"Solo puedes pasar hasta
$390.000 — el resto es la base, y la base no se toca"* sin guardar nada.

Relacionado: [[base-inicial-vs-ahorro-acumulado]] · [[base-inicial-circuito-completo]] ·
[[reglas-dinero-referencia-efectivo]]
