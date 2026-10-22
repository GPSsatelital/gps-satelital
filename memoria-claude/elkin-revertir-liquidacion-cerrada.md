---
name: elkin-revertir-liquidacion-cerrada
description: "✅ HECHA el 17-sep-2026. Se revirtió a mano la liquidación CERRADA LIQ-0048 de ELKIN CARDALES (DPU43I) como excepción autorizada. El método reusable: leer cerrar_liquidacion() de la mig 111 e invertirla línea por línea, en vez de reconstruir a ojo."
metadata:
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-17T14:10:50.469Z
---

# Revertir la liquidación CERRADA de ELKIN CARDALES — ✅ HECHA (17-sep-2026)

## El caso

ELKIN liquidó por incumplimiento, la liquidación quedó **cerrada** (LIQ-0048, 9-sep) y después dijo
que quería seguir y pagando. El sistema no contempla deshacer un cierre.

**Mi recomendación como arquitecto fue contrato NUEVO, no revertir** (el cierre mueve plata de
verdad; lo suyo se trae con `saldo_favor_apertura` / deuda de apertura, que para eso existen).
**El dueño decidió revertir, sabiéndolo:** *"que no sea algo para hacer siempre, pero podemos solo
en este caso y por esta vez"*. Se hizo como **SQL a mano**, NO como función del sistema.
🔴 **Si vuelve a pasar con otro cliente: la respuesta sigue siendo contrato nuevo.**

## 🔑 EL MÉTODO — esto es lo reusable

No reconstruí a ojo qué había cambiado: **encontré la función que hizo el daño y la invertí línea
por línea**. Es `cerrar_liquidacion()` en `supabase/111_cierre_no_choca_guardian_clientes.sql`.

Hace **9 cosas**; en el caso de ELKIN solo aplicaron **6**. Las otras 3 no se dispararon y por eso
no había nada escondido que deshacer:
- no creó deuda del faltante (`saldo_final` salió **a favor** de él, +$433.000);
- no cerró convenios (no tenía);
- no lo puso en lista negra (solo pasa con saldo negativo).

Saberlo **leyendo la función** en vez de suponerlo es la diferencia entre una reversa cerrada y una
que deja cabos. Mismo espíritu que la lección de la mig 124: la verdad está en la función viva.

⚠️ El guardián `enforce_cliente_estado_change()` bloquea cambiar `clientes.estado` a mano. Se pasa
con la señal que el propio sistema ya tiene: `select set_config('app.cierre_liquidacion','1',true);`
dentro de la transacción (se borra sola al terminar).

## 🔴 Los tres hallazgos que cambiaron la reversa

**1. La placa estaba cambiada — por poco le reviento el contrato a otro.**
El dueño dijo **XZI13H**; esa es de **LUIS ÁNGEL BERMÚDEZ COLÓN**. ELKIN tiene un solo contrato en
su vida: **DPU43I**. → *Una placa dicha de memoria se cruza contra el cliente ANTES de tocar nada.*

**2. Yo tenía mal el reparto del ahorro.** Había anotado apertura 448.000 + acumulado **412.000**.
Falso: el acumulado real era **$104.000**. Los $860.000 se arman así, y todo cierra al peso:

| De dónde salen los $860.000 | |
|---|---|
| Base entregada menos su semana adelantada ($510.000 − $202.000) | $308.000 |
| Ahorro que traía de antes (apertura, empalme 31-jul) | $448.000 |
| Ahorro ganado con su único pago (21-ago) | $104.000 |

La prueba: su ÚNICO pago fue $820.000 → $12.000 a la deuda vieja (337.000 → **325.000**, que es
exactamente lo que dice el papel) + $808.000 = **4 cajas** de $202.000 (18 → 22 ✓) × $26.000 de
ahorro = **$104.000** ✓. Y el papel dice *"Ahorro que ganó pagando $552.000"* = 448.000 + 104.000 ✓.

**3. No estaba al día: estaba RETENIDO.** `motivo_suspension='mora'` + multa del 30-ago. Entonces
"como si nunca se hubiera liquidado" **no** era devolverle la moto: era dejarlo *Suspendido* con la
moto *Recuperada* y debiendo. El dueño lo confirmó: *"como estaba, retenido y debiendo"*.
Así cae parado en el flujo que ya existe y no se le perdona la multa.

## Lo que quedó (verificado antes/después, las 7 filas)

| | Antes | Después |
|---|---|---|
| Contrato `6b264cae…` | Cancelado | **Suspendido** |
| `ahorro_apertura` / `ahorro_acumulado` | 0 / 0 | **448000 / 104000** |
| Moto DPU43I `f640e07c…` | Disponible | **Recuperada** |
| Cliente `03e8aa31…` | Retirado | **Activo** |
| LIQ-0048 `bc775214…` | cerrada | **anulada** + motivo (no se borró) |
| Deuda "EXCEL VIEJO" | pagada $0 | **pendiente $325.000** |
| Deuda multa recolección | pagada $0 | **pendiente $30.000** |
| Orden de taller `124acf23…` | Pendiente, sin salida | **Finalizada** con nota de anulación |

`ahorro_inicial` ($510.000) y las cajas (22/104) **no las tocó el cierre** — no había que restaurarlas.
Rastro en `contratos_auditoria` (4 renglones) + `anulada_motivo` con la autorización del dueño.
Sin cambio de código: fue solo data. No hubo commit ni despliegue.

## 🔲 Lo que sigue, del lado del dueño

ELKIN aparece en **Inmovilizaciones → Motos retenidas**. Para recuperar la DPU43I:
paga la **multa de $30.000**, se le hace **convenio por los $325.000** y se entrega con el botón
"Entregar retenida" de siempre. Le vuelve el badge **"⚠️ Empalme"** (su empalme nunca se cerró, así
estaba antes — no es un defecto).

Relacionado: [[liquidaciones-auditoria-y-huecos]] · [[liquidaciones-definicion-cerrada]] ·
[[regla-esencia-y-rastro]] · [[regla-no-romper-lo-que-funciona]]
