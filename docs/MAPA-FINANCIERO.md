# El mapa financiero de MotoGestión

**De dónde sale cada peso, a dónde va, dónde queda anotado — y dónde se pierde el rastro.**
Auditoría del 23-ago-2026, hecha sobre el código vivo (migraciones 001–115) y los casos reales
rastreados peso por peso (GEOVANNY DPU58I, ADOLFO RLT70H, ANTONIO IEW65I, XYZ54H, JOSUE RML59H).

> La regla que pidió el dueño y que gobierna este documento:
> **"Cada peso debe conservar su esencia aunque cambie de envoltorio.** El sistema debe saber de
> dónde salen las cosas, hacia dónde van, y en dónde quedaron — y aunque esté en un lado, que siga
> siendo lo que en su esencia era."

---

## 1. Los conceptos (qué clases de plata existen)

| Concepto | Qué es | Dónde vive |
|---|---|---|
| **Caja / semana** | El período del contrato ($202.000 sem. nuevo). Se exige el día de pago que la inicia. | `contratos.cajas_pagadas` + `caja_actual_pagado` |
| **Tarifa** | La parte de la empresa dentro de cada caja ($176.000 de $202.000) | dentro de `aplicado_tarifa` |
| **Ahorro** | La parte del cliente dentro de cada caja ($26.000). Tarifa-primero: los ÚLTIMOS pesos de la caja son ahorro. | `aplicado_ahorro` (informativo) + `contratos.ahorro_acumulado` |
| **Prorrateo (caja 0)** | Los días sueltos entre la entrega y el primer día de pago | `prorrateo_total/pagado` + `aplicado_prorrateo` |
| **Base inicial** | Lo que el cliente entrega al ENTRAR ($510.000 = $308.000 ahorro + semana adelantada). En migrados: el campo MANUAL `ahorro_inicial` (REGLA MADRE, 22-ago). | `clientes.ingreso_inicial` → `contratos.ahorro_inicial` |
| **Deuda** | Cobro puntual registrado (multa, daño, migración, tarifa atrasada…) | tabla `deudas` (monto / monto_pendiente / estado) |
| **Convenio** | Financiación de atraso: semanas viejas + deudas, pagadero en cuotas | tabla `convenios` + deudas en estado `en_convenio` |
| **Saldo a favor** | Excedente que queda RESERVADO — nunca se aplica solo | Σ `aplicado_saldo_favor` + `saldo_favor_apertura` |
| **Alquiler de reemplazo** | Moto prestada a $27.000/día — caja diaria sí, motor NO, portafolio de la prestada | `tipo_registro='alquiler_reemplazo'` |
| **Cajas exoneradas (rodar)** | Períodos completos que se corren al final (moto guardada) — se deben igual, más tarde | `contratos.cajas_exoneradas` (mig 078) |
| **Liquidación** | El cierre: ahorro + base − días − deudas − daños, con 3 destinos | `liquidaciones.*` (ver §3) |

## 2. Las puertas de entrada (`pagos.tipo_registro`)

| Tipo | Quién / cómo | Particularidad |
|---|---|---|
| `normal` | Efectivo en oficina (SECRETARIA) | — |
| `transferencia` | Foto del comprobante → SECRETARIA confirma | fecha real ≠ fecha de digitación |
| `campo` | ADMIN/SUBADMIN con GPS → 2 pasos (entrega → confirma) | queda Pendiente aunque sea efectivo |
| `adelanto_base` | INTERNO del wizard: la semana adelantada de la base | EXCLUIDO de caja diaria y recaudo |
| `saldo_favor` | INTERNO: consume crédito ya existente | `aplicado_saldo_favor` NEGATIVO |
| `alquiler_reemplazo` | Cobro diario de la moto prestada | caja diaria SÍ, reparto del motor NO |

**El reparto** (trigger `aplicar_pago_confirmado`, mig 045 y sucesoras) respeta el `aplicado` explícito
de la pantalla; si todo viene en 0, reparte FIFO: **caja más vieja exigida → deuda (más antigua
primero) → convenio → saldo a favor**. Las reversas (rechazar/eliminar) deshacen en orden inverso.

## 3. El libro por capas (dónde queda anotado)

1. **`pagos.aplicado_*`** — el desglose de CADA pago en 7 columnas excluyentes (tarifa, ahorro,
   prorrateo, deuda, convenio, saldo_favor, base_inicial) + el jsonb viejo `aplicado`
   (`{deuda, semana, ahorro, convenio, saldo}`) que las pantallas usan de respaldo. **Al corregir
   por SQL hay que escribir LAS DOS.**
2. **`contratos`** — los acumuladores del ledger (cajas, ahorro, prorrateo, exoneradas, previas).
3. **`cajas_llenadas`** (vigía, mig 112) — qué caja se llenó, cuándo y por qué **fuente**
   (`pago` | `convenio`). Nació el 22-ago-2026: sin histórico anterior.
4. **`deudas`** — pendiente → en_convenio → pagada. El motor baja `monto_pendiente` con rastro.
5. **`convenios`** — total, cuota, cuotas_pagadas + el **retrato** (mig 067/099:
   `cajas_pagadas_previas`, `caja_actual_pagado_previo`, `cajas_pagadas_marcadas`) que permite
   DESHACER. ~52 convenios viejos no tienen retrato (su borrado está bloqueado a propósito).
6. **`liquidaciones`** — `detalle_favor` y `detalle_deudas` (el documento renglón por renglón),
   `base_trasladada` (mig 114), `saldo_para_nueva` + `contrato_destino_id` (mig 115: el saldo
   viaja CON ORIGEN y no se puede reclamar dos veces).
7. **`contratos_auditoria`** — cambios manuales, correcciones por datos, y el claim del saldo
   ("$X — viene de la liquidación LIQ-####").
8. **`caja_diaria`** — cierres del día: TOTALES + jsonb `detalle`. No es un ledger de movimientos.

## 4. Dónde la esencia SE CONSERVA (lo que ya funciona bien)

- Cada peso de un pago vive en UNA columna — no puede pagar dos cosas a la vez (por eso la nómina
  no puede pagar doble por construcción).
- El saldo de una liquidación viaja al contrato nuevo **con su origen escrito** (mig 115).
- Las deudas bajan con rastro y se restauran si el pago se anula.
- El vigía registra desde el 22-ago quién llenó cada caja y con qué fuente.
- Los convenios nuevos guardan retrato: se sabe qué marcaron y se puede deshacer.
- La fecha real del pago y la fecha de digitación son campos distintos; la caja usa la suya.

## 5. Dónde la esencia SE PIERDE (los huecos, en orden de gravedad)

1. 🔴 **El convenio es una bolsa opaca.** Al firmarse se sabe QUÉ financió (semanas marcadas +
   deudas en_convenio + total), pero **no guarda el desglose en pesos**, y cuando entra una cuota
   **no se traduce** a lo que amortiza (¿la semana del 3-ago? ¿la deuda de migración? ¿la multa?).
   Consecuencias en cadena:
   - La nómina no puede pagarle al cobrador según la esencia de lo que cobró (caso GEOVANNY).
   - **Las deudas `en_convenio` NUNCA pasan a `pagada`**: cuando el convenio se cumple, nadie les
     avisa — quedan con su `monto_pendiente` intacto para siempre (verificado: ninguna migración
     hace esa transición; hoy no estalla porque las pantallas las excluyen por estado).
   - El estado de cuenta no puede decirle al cliente "de tu convenio ya cubriste X semanas y $Y
     de tu deuda vieja".
2. 🔴 **El registro dirigido no tiene candado.** Si un funcionario marca un pago "al convenio"
   teniendo el cliente la semana corriente descubierta, el motor obedece y se salta el orden
   sagrado (semana primero). En GEOVANNY no hizo daño (su semana estaba contemplada) — pero la
   puerta está abierta. El dueño está de acuerdo en principio con el candado (23-ago), con la
   excepción del flujo de moto retenida que dirige a propósito.
3. 🔴 **`eliminarPago` no guarda a qué se aplicó** (`usePagos.ts:371`) — un borrado de plata no se
   puede auditar ni deshacer (impidió reconstruir el caso CARLOS ALBERTO).
4. **La plata que SALE no existe en el sistema.** Egresos diseñados sin construir: las
   devoluciones de liquidación, gastos y premios solo viven en papel (el recibo de egreso lo
   advierte en su pie). La caja solo suma entradas.
5. **53 convenios viejos sin desglose ni retrato** — hoy muestran $52.000 y al terminar serán
   ~$2.000.000; hay que llenarlos uno por uno contra su acuerdo firmado (pendiente del dueño).
6. **El cambio de grupo de una moto no deja rastro** — la plata histórica del portafolio se
   reinterpreta en silencio (salió con XYZ54H).
7. **Los estados del cliente no tienen histórico** (Activo → En mora → … se pisa).
8. **8 partidas de caja sin grupo** + `caja_diaria` guarda totales, no movimientos.
9. **El préstamo de reemplazo reescribe la placa histórica** en la línea de tiempo.
10. **Nómina — regla del paquete pendiente de confirmar** (23-ago): semana + convenio = UNA
    gestión = UN renglón ($7.500 a tiempo / $2.250 tarde / $0 incompleto). Recomendada; sin dale.

## 6. La solución de fondo recomendada: el convenio con PARTITURA

La pieza que cierra el hueco 1 (y arrastra el 5 y la mitad del 10): al firmar un convenio, guardar
su **partitura** — el desglose en pesos de qué financia, en orden:

```
convenios.partitura (jsonb):
[ { "tipo": "semana",  "ref": "caja 21 (lun 3-ago)", "monto": 2000   },
  { "tipo": "semana",  "ref": "caja 22 (lun 10-ago)", "monto": 202000 },
  { "tipo": "deuda",   "ref": "<id deuda migracion>", "monto": 521000 },
  { "tipo": "ajuste",  "ref": "redondeo de cuotas",   "monto": 200000 } ]
```

Cada peso que entra al convenio **amortiza la partitura en orden** (FIFO, igual que las cajas).
Con eso, automáticamente:
- cada cuota SABE qué es en esencia → la nómina puede pagar la gestión según lo que de verdad se
  cobró, y el desprendible lo puede explicar;
- cuando la parte de una deuda queda cubierta → su `monto_pendiente` baja y pasa a `pagada`
  (se cierra el cabo suelto de las en_convenio eternas);
- el estado de cuenta del cliente puede contar el convenio renglón por renglón;
- los 53 convenios viejos se llenan escribiéndoles su partitura (el mismo trabajo manual ya
  pendiente, pero con un lugar donde quedar).

**Orden de construcción propuesto** (cada paso aprobable por separado, ninguno toca lo que anda):
1. Nómina con la regla del paquete (solo el informe — no toca motor). *Decisión pendiente.*
2. Candado semana-primero en el registro dirigido (aviso + reparto correcto; excepción retenidas).
3. Partitura en convenios NUEVOS (columna + escribirla al firmar + amortización al entrar plata
   + transición en_convenio→pagada).
4. Partitura de los 53 viejos (manual, dueño con el acuerdo firmado en la mano).
5. Egresos (ya diseñado, 4 decisiones cerradas — es la otra mitad del "control absoluto": hoy
   solo se controla lo que ENTRA).

---
*Actualizar este documento cuando cambie el motor de reparto, se construya la partitura o los
egresos. Fuentes: CLAUDE.md (spec libro de cajas), migs 045/054/067/078/082/093/098/099/112/114/115,
`cicloPago.ts`, `loQueDebe`, `cuentaLiquidacion.ts`, `nominaCobradores.ts`.*
