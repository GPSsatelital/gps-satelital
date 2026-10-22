---
name: fecha-fin-y-semanas-una-sola-verdad
description: "La fecha de fin de contrato es decorativa y las semanas son las que cobran — dos verdades que se contradicen. Investigación del 22-sep, spec CONFIRMADO con el dueño, sin construir todavía"
metadata:
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-23T01:30:23.668Z
---

# La fecha de fin dice una cosa y el sistema cobra otra (22-sep-2026)

🔨 **INVESTIGADO Y ACORDADO — NO CONSTRUIDO.** El dueño confirmó el comportamiento pero **no
alcanzó a aprobar la lista de implementación**. Antes de escribir código: repetirle los 7 puntos
de abajo y esperar el sí.

## La pregunta que lo destapó

Él: ***"¿cómo puede ser que se le muestre algo y se le cobre otra cosa?"***

## La respuesta: el sistema cambió de opinión y quedaron dos verdades

- **Antes** el contrato terminaba **por tiempo**: entrega + N meses. La fecha mandaba.
- **Con el libro de cajas** la regla pasó a ser: *"el contrato termina al llenar la caja N, por
  **pagos realizados**, NO por tiempo transcurrido"*. **Las semanas mandan.**
- Pero `fecha_fin_contrato` **no se quitó ni se marcó como decorativa**: quedó visible y editable,
  con pinta de importante. En la documentación dice *"queda informativa"* — o sea, **un letrero**.

Y la gente la ha estado editando **creyendo que cambiaba el contrato**. No cambia nada.

## Lo medido (22-sep, producción)

- **358 contratos** no-Diario revisados. **2** con `total_cajas` que no cuadra con `meses` — y
  **son exactamente los 2 a los que alguien les editó `meses`**. Correlación perfecta:
  **la causa es editar.** `editarContrato` hace un `update` plano y no recalcula nada.
- **266 activos** revisados por fecha: **15** con `fecha_fin_contrato` que no cuadra.
  **7 son legítimos** (tienen semanas rodadas, y rodar mueve la fecha a propósito). Quedan **8**.
- De esos 8, **4 fueron editados a mano en agosto, en la misma tanda del empalme** (Brandon y
  FREDY). No fue descuido: **alguien se sentó a escribir la fecha real de cada contrato migrado**
  y la metió en un campo que no cobra nada.

🔑 **La prueba de que el cálculo estaba bien:** en YESID y DAYSI la fecha que tenían **ANTES** de
la edición era casi exactamente la que sale de las semanas (26-oct-2026 exacto · 30-mar vs 3-abr).
**La edición fue el error, no el cálculo.**

## ✅ Lo que el dueño CONFIRMÓ

### 1. La fecha NO se mueve por atrasos — solo al RODAR
| Qué pasa | ¿Se mueve? |
|---|---|
| Se atrasa 3 semanas | **No** — sigue debiendo lo mismo, tendrá que ponerse al día |
| Se pone al día / paga adelantado | **No** |
| **Se le rueda una semana** (con documento firmado) | **Sí, una semana** |

Textual: *"que la fecha en la que vaya a terminar no se vaya recalculando con las semanas
atrasadas, sino solo cuando el cliente rueda la semana y firma el documento, para que sea
consciente de que terminará ese tiempo firmado después — **por eso la regla es que solo se pueda
rodar una semana completa**"*.

### 2. Cliente ve UNA fecha, funcionario ve LAS DOS
- **Cliente** (ficha y documentos impresos): una sola, la de hoy con las rodadas incluidas.
- **Funcionario**: *"Pactado 16/07/2028 · Con 2 rodadas: 30/07/2028"*.

### 3. Al editar el plazo: mostrar impacto Y BLOQUEAR
Mostrar antes de guardar: meses, semanas y fecha, antes → después, más cuántas lleva pagadas.
Y **no dejar guardar** si el plazo nuevo deja menos semanas de las que ya pagó.
Textual: *"que muestre el impacto y que diga que esa acción no es posible por lo que ha pagado
más semanas de las que le aparece"*. Si algún día hay que hacerlo igual → otra conversación, con
devolución de por medio.

## 🔲 Los 7 puntos que FALTA aprobar antes de construir

1. **Cadena única**: `meses` (lo pactado) → `semanas` (lo que se cobra) → `fecha` (solo resultado).
2. La fecha **se calcula**: el día en que las exigidas alcanzan `total_cajas`. Deja de editarse.
3. Comportamiento de la fecha = punto ✅1 de arriba.
4. Cliente una fecha / funcionario dos = punto ✅2.
5. Editar el plazo: impacto + bloqueo = punto ✅3.
6. **Se quita poder editar la fecha de fin a mano.**
7. **Aviso nuevo** de coherencia si los tres datos se separan, + **NO se toca** el motor, la mora,
   las 12 rodadas existentes, ni plata de nadie.

## 🔲 Los 4 contratos con el plazo dudoso

| Placa | Cliente | Qué pasa | Espera a |
|---|---|---|---|
| **IEW88I** | JHON NAIDER | meses 11→22 (SERGIO) pero `total_cajas` quedó en 48. Si 22 es lo bueno, **$9.696.000 que nunca se le van a exigir** | SERGIO |
| **XZN84H** | JOSE LUIS JULIO | meses 22→21 (SERGIO) y total quedó en 96. Le cobraría 5 semanas de más | SERGIO |
| **RMM69H** | KENNY | La fecha escrita (27-abr-2028) dice 24 meses, su campo dice 18. Serían **+27 semanas ($5.454.000)**. **No tiene contrato escaneado** | el papel del archivo |
| **RLZ83H** | DARGENIS | Su teoría (typo 2026 por 2027) da 14-ago-2027; las semanas dan 1-nov-2027. **No cuadra por 11 semanas**: o su total son 80 y no 91, o sus `cajas_previas` (24) están 11 cortas | revisar aparte |

✅ **YESID (RLT72H) y DAYSI (DQL73I) se arreglan solos** cuando la fecha se calcule: mandan las
semanas, y su fecha vuelve sola a la que tenían antes de la edición.

Relacionado: [[libro-de-cajas-motor-v2]] · [[prestamo-liquidacion-verificados]] (el mecanismo de
rodar y `cajas_exoneradas`) · [[candado-saldo-favor-dos-clics]] (la sesión que llevó hasta acá).
