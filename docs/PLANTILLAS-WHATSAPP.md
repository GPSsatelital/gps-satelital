# Plantillas de WhatsApp — MotoGestión ↔ ZALA ↔ Meta

**Versión 1 (borrador para revisión) · 8 de septiembre de 2026**

Este documento es el acuerdo entre los dos proyectos sobre **qué mensajes existen, cómo se llaman
en Meta y qué variables lleva cada uno**. Sin él, MotoGestión manda texto que Meta no conoce y ZALA
no sabe qué plantilla usar.

- **MotoGestión** nunca manda un texto final. Manda: *"plantilla X, variables A, B, C"*.
- **ZALA** decide en el momento del envío: si la ventana de 24 horas está abierta, lo manda como
  texto normal; si está cerrada, lo manda como plantilla aprobada. **El cliente lee lo mismo.**
- **ZALA es quien registra las plantillas en Meta.** Este documento es lo que hay que registrar.

> ⚠️ **VERIFICADO el 8-sep contra la base: los textos reales NO son los del código.** Tres fueron
> editados desde Configuración el 7-jul-2026, con otra voz (tuteo, cercana, con emojis) — **esos son
> los que valen** y los borradores de abajo hay que reescribirlos con ese tono, con las
> conversaciones reales que va a pasar el dueño:
>
> - `dia_pago` (real): *"¡Hola, motero {nombre}! 🏍️ Bendiciones. Te saludamos de Club Moteros para
>   recordarte que hoy vence el plazo de tu pago. Realizarlo a tiempo te permite seguir disfrutando de
>   todos tus beneficios y rodar sin ninguna preocupación. 🏁 📌 Nota: Si ya pagaste, ¡muchas gracias
>   por tu puntualidad! Puedes ignorar este mensaje."*
> - `gabela` (real): *"¡Hola! {nombre} 🏁 En Club Moteros valoramos mucho que sigas con nosotros.
>   Notamos que tu fecha de pago fue ayer, ¡pero no te preocupes! Te damos el día de hoy como plazo
>   extra para que te pongas al día y evites cualquier reporte o pausa en el uso de tu vehículo.
>   ¡Hagamos que esa moto siga rodando! 🚀 Si ya realizaste el pago, por favor compártenos tu
>   comprobante para actualizar tu estado de inmediato."*
> - `mora` (real): *"Estimado {nombre}, miembro de Club Moteros 🚨 Tu cuenta presenta un saldo
>   pendiente {valor} y queremos ayudarte a evitar medidas incómodas. Es muy importante realizar tu
>   pago hoy mismo, ya que de lo contrario, el reglamento interno nos obliga a proceder con la
>   inmovilización y recolección del vehículo. 📑 ¡Queremos verte rodar tranquilo y con todo al día!
>   Comunícate ya mismo con nosotros para reportar tu pago o darte una solución rápida. 🤝"*
> - `recoleccion` y `recibo` (reales): siguen siendo los del código viejo y **todavía dicen "GPS
>   Satelital"** — hay que cambiarlos a Club Moteros.
> - `cuentas_pago`: no existía en la base (usaba el respaldo del código). La mig 133 la crea.
>
> Los tres reales usan `{nombre}` y `{valor}` pero no `{placa}` ni `{dias}`; el orden de variables
> sembrado en la mig 133 es provisional hasta que se aprueben los textos finales — en ese momento
> se ajusta la columna `variables` de cada fila, sin código. Y `{dias}` hoy viaja como número
> (`3`) porque el texto real de recolección ya trae la palabra ("{dias} días de mora"); si el texto
> final la quita, se cambia a "3 días" en un solo lugar (`diasTexto`, `utils/mensajeria.ts`).

---

## Reglas de Meta que hay que respetar

Estas condicionan cómo se escribe cada plantilla. Las confirma el proyecto ZALA, que es quien las
registra, pero las tuvimos en cuenta al redactar:

1. Una variable **no puede ir al principio ni al final** del cuerpo del mensaje.
2. **No puede haber dos variables pegadas** (`{{1}} {{2}}` sin texto en medio).
3. **Una variable no puede contener saltos de línea.** Esto es lo que obliga a rediseñar dos de
   nuestros mensajes actuales (ver más abajo).
4. Una variable **nunca puede ir vacía**. Si a veces no tenemos el dato, hace falta otra plantilla,
   no dejarla en blanco.
5. Categoría **UTILITY** para todas: son avisos de una cuenta existente, no publicidad. Es más
   barato y tiene menos riesgo de bloqueo que MARKETING.
6. Idioma: **es** (o `es_CO` si ZALA lo prefiere; hay que registrar una versión por idioma).

---

## Regla nueva de negocio: sin cifra verificada, no hay mensaje automático

Las plantillas de cobro llevan el monto. La vitrina (`zala.cliente.debe_hoy`) devuelve esa cifra ya
verificada — se comparó contra la pantalla contrato por contrato: **319 contratos, 0 diferencias**.

Cuando `debe_hoy` viene **vacío** (contratos diarios o sin motor de cajas), la vitrina lo dice sola:
*"la cuenta se consulta en la oficina"*. A esos contratos **no se les manda cobro automático**. Es
preferible que no reciban nada a que reciban una cifra inventada.

---

## Cómo se agregan y se cambian plantillas (la regla que evita el formato viejo)

**Pedido del dueño (8-sep), textual:** *"todo esto debe quedar bien contemplado en el proyecto por
si a futuro se hacen cambios así sean de formatos, ya el sistema sepa y no siga usando un formato
viejo."*

La regla es una sola: **ninguna pantalla del sistema nombra una plantilla de Meta.** Las pantallas
dicen `recibo`, `mora`, `gabela` — la clave estable. La base traduce esa clave a la plantilla que
esté vigente hoy.

| Dónde vive | Qué guarda |
|---|---|
| `mensajes_whatsapp.clave` | El tipo de mensaje. **Nunca cambia.** Es lo que el código conoce |
| `mensajes_whatsapp.plantilla_meta` | Cuál plantilla de Meta está vigente **ahora** para esa clave |
| `gestiones_cobro.plantilla_usada` | En cada mensaje enviado, **qué versión se usó** — congelada para siempre |

Consecuencias, que son exactamente lo que se pidió:

1. **Cambiar de formato es editar una fila.** Se registra `recibo_pago_v2` en Meta, se cambia la
   fila, y todo el sistema la usa al instante. Sin desplegar código.
2. **Es imposible mandar un formato viejo**, porque no hay ninguno escrito en el código. Si la fila
   está vacía o marcada como reemplazada, **el envío se bloquea con un aviso claro** en vez de
   mandar algo obsoleto.
3. **Queda el rastro histórico.** Dentro de un año se puede saber qué texto exacto recibió un
   cliente en septiembre, aunque la plantilla haya cambiado tres veces.
4. Mientras Meta aprueba la `_v2`, la `_v1` sigue vigente. **Nunca hay un hueco sin poder mandar.**

Es el mismo principio del catálogo de conceptos de deuda (`zala.conceptos_deuda`): *un tipo nuevo
es una fila, no desarrollo.*

> **Salvedad honesta:** esto aplica a cambiar el texto o la versión de un mensaje que ya existe. Un
> mensaje **nuevo que sale de un botón nuevo** (la citación a revisión, por ejemplo) sí necesita el
> botón. Lo que ya no necesita es tubería: se engancha a la que existe.

---

## Las 8 plantillas

### 1 · `cobro_dia_pago_v1` — el día que le toca pagar
Reemplaza a `dia_pago`.

```
Hola {{1}}, hoy le corresponde el pago de su moto {{2}}. El valor es {{3}}.
Puede pagar en la oficina o por transferencia; si transfiere, envíenos la foto
del comprobante con el número de referencia. Club Moteros Cartagena.
```

| Variable | Qué lleva | Ejemplo |
|---|---|---|
| `{{1}}` | Nombre del cliente | KEVIN ORTEGA |
| `{{2}}` | Placa | RLY45H |
| `{{3}}` | Lo que debe hoy | $202.000 |

---

### 2 · `cobro_gabela_v1` — el día de gracia
Reemplaza a `gabela`.

```
Hola {{1}}, ayer venció el pago de su moto {{2}} y hoy es su día de gracia.
Debe {{3}}. Por favor póngase al día hoy para no entrar en mora.
Club Moteros Cartagena.
```

| Variable | Qué lleva | Ejemplo |
|---|---|---|
| `{{1}}` | Nombre | KEVIN ORTEGA |
| `{{2}}` | Placa | RLY45H |
| `{{3}}` | Lo que debe | $202.000 |

---

### 3 · `cobro_mora_v1` — ya está en mora
Reemplaza a `mora`.

```
Hola {{1}}, su moto {{2}} lleva {{3}} sin pagar y debe {{4}}. Comuníquese hoy
con nosotros para ponerse al día o acordar un plan de pago.
Club Moteros Cartagena.
```

| Variable | Qué lleva | Ejemplo |
|---|---|---|
| `{{1}}` | Nombre | KEVIN ORTEGA |
| `{{2}}` | Placa | RLY45H |
| `{{3}}` | Días de mora, **con la palabra incluida** | 3 días · 1 día |
| `{{4}}` | Lo que debe | $404.000 |

> El día va con la palabra dentro de la variable (`"1 día"`, no `"1"`), porque si no la plantilla
> diría *"lleva 1 días"*. Es responsabilidad de MotoGestión mandarlo ya escrito.

---

### 4 · `aviso_recoleccion_v1` — último aviso antes de recoger
Reemplaza a `recoleccion`.

```
Hola {{1}}, su moto {{2}} presenta {{3}} de mora y una deuda de {{4}}. Si no
recibimos su pago hoy, procederemos con la recolección del vehículo.
Comuníquese con nosotros. Club Moteros Cartagena.
```

| Variable | Qué lleva | Ejemplo |
|---|---|---|
| `{{1}}` | Nombre | KEVIN ORTEGA |
| `{{2}}` | Placa | RLY45H |
| `{{3}}` | Días de mora con la palabra | 5 días |
| `{{4}}` | Lo que debe | $606.000 |

---

### 5 · `moto_retenida_v1` — NUEVA
No existe hoy. Sale de la decisión del dueño (8-sep): *"sí se le escribe, para hacerle gestión y
validar cuándo y si sacará nuevamente el vehículo"*.

```
Hola {{1}}, su moto {{2}} está en nuestras instalaciones. Para entregársela
nuevamente debe ponerse al día: {{3}}. Comuníquese con nosotros para acordar
cómo y cuándo la retira. Club Moteros Cartagena.
```

| Variable | Qué lleva | Ejemplo |
|---|---|---|
| `{{1}}` | Nombre | KEVIN ORTEGA |
| `{{2}}` | Placa | RLY45H |
| `{{3}}` | Lo que debe para recuperarla (multa + lavada + atrasado) | $222.000 |

---

### 6 · `acuse_comprobante_v1` — "recibimos su comprobante" · **NUEVA**
No existe hoy. Sale de la corrección del dueño (8-sep): *"si es por transferencia, lo que se le
envía es como un aviso de que se recibió el comprobante; y cuando ya se ingresa y confirma es que
se le envía [el recibo]"*.

**El hueco que tapa:** hoy el cliente que transfiere queda en el aire — manda su foto y no recibe
nada hasta que la secretaria confirma, que puede ser horas después. Esto le confirma que llegó.

```
Hola {{1}}, recibimos su comprobante de pago por {{2}} para la moto {{3}}.
Lo estamos verificando y le confirmamos apenas quede registrado.
Club Moteros Cartagena.
```

| Variable | Qué lleva | Ejemplo |
|---|---|---|
| `{{1}}` | Nombre | KEVIN ORTEGA |
| `{{2}}` | Valor que dice el comprobante | $202.000 |
| `{{3}}` | Placa | RLY45H |

> **No dice "su pago fue acreditado".** Dice que llegó y que se está verificando. La diferencia
> importa: un comprobante puede no cuadrar, ser de otro, o estar repetido.

---

### 7 · `recibo_pago_v1` — comprobante de pago confirmado · **REDISEÑADA**
Reemplaza a `recibo`. Se manda **cuando el pago queda confirmado**, no cuando llega la foto.

**Por qué cambia:** el mensaje de hoy mete todo el desglose dentro de un solo comodín
(`{detalle}`), que son varias líneas. **Meta no acepta saltos de línea dentro de una variable**, así
que tal como está no se puede registrar.

```
Club Moteros Cartagena confirma su pago. Recibo {{1}} del {{2}}. Cliente {{3}},
moto {{4}}. Valor recibido: {{5}}. Le queda pendiente: {{6}}.
Gracias por su pago.
```

| Variable | Qué lleva | Ejemplo |
|---|---|---|
| `{{1}}` | Folio | 001234 |
| `{{2}}` | Fecha del pago | 8 de septiembre |
| `{{3}}` | Nombre | KEVIN ORTEGA |
| `{{4}}` | Placa | RLY45H |
| `{{5}}` | Valor recibido | $202.000 |
| `{{6}}` | Lo que queda debiendo | $0 |

**El desglose detallado** (cuánto fue a cuota, a deuda, a convenio) **no cabe en la plantilla.**
Decisión del dueño (8-sep): va como **segundo mensaje de texto libre, solo si la ventana de 24 h
está abierta**. Como el cliente acaba de pagar y casi siempre acaba de escribir, en la práctica casi
siempre llegan los dos; y si la ventana está cerrada, al menos le llega el recibo básico.

#### `recibo_pago_v2` — la foto del recibo impreso (planeada, no para ahora)

Idea del dueño el mismo día: mandar **el mismo papel que sale de la impresora**, como imagen. Las
plantillas de Meta aceptan una imagen encima del texto, así que le llegaría el recibo completo —
con todo el desglose— sin límites de texto y **sin depender de la ventana de 24 horas**.

**Por qué no ahora:** hay que generar la imagen, guardarla y darle a ZALA una dirección de dónde
bajarla. Es un proyecto chico aparte (ya existe el ticket térmico como base, en
`src/components/TicketTermico.tsx`).

**Por qué no urge:** por la regla de versiones de arriba, el día que la imagen esté lista se cambia
la fila de `recibo` de `recibo_pago_v1` a `recibo_pago_v2` y todo el sistema la usa. **Cero código.**

---

### 8 · `cuentas_para_pagar_v1` — a qué cuenta transferir · **REDISEÑADA**
Reemplaza a `cuentas_pago`.

**Por qué cambia:** el mensaje de hoy mete la lista de cuentas en un comodín (`{cuentas}`), con
saltos de línea. Mismo problema que el recibo.

```
Hola {{1}}, para el pago de su moto {{2}} puede transferir a: {{3}}. Cuando
transfiera, envíenos la foto del comprobante con el número de referencia para
poder acreditarle el pago. Club Moteros Cartagena.
```

| Variable | Qué lleva | Ejemplo |
|---|---|---|
| `{{1}}` | Nombre | KEVIN ORTEGA |
| `{{2}}` | Placa | RLY45H |
| `{{3}}` | Las cuentas del grupo de SU moto, **en una sola línea** | Bancolombia ahorros 123-456789-01 a nombre de FREDY MORA |

> Si el portafolio tiene dos cuentas, van separadas por ` / ` en la misma línea. Nunca las de otro
> portafolio: la cuenta sale del grupo de la moto del contrato (regla ya implementada).

---

## Los textos con la voz real — versión 2 (8-sep, tras leer conversaciones reales)

Los borradores de arriba estaban en "usted" formal. **La empresa habla de tú, cálida, con
"Bendiciones", y firme en la regla.** Estos reemplazan a los de arriba; ver la voz completa en
`docs/GUIA-CONVERSACION-ZALA.md`. Respetan las reglas de Meta (ninguna variable al inicio ni al
final, ninguna pegada, ninguna con salto de línea). **Siguen siendo para aprobación del dueño.**

**1 · `dia_pago` → `cobro_dia_pago_v1`** · variables: nombre · placa · valor
```
¡Hola, {nombre}! Bendiciones 🏍️
Hoy es tu día de pago de la moto {placa}. Tu cuota de hoy es {valor}.
Puedes pagar en la oficina o por transferencia; si transfieres, envíanos la foto del comprobante con la placa y tu nombre.
Si ya pagaste, ¡gracias por tu puntualidad! Quedamos atentos.
```

**2 · `gabela` → `cobro_gabela_v1`** · variables: nombre · placa · valor
```
Hola, {nombre}. Bendiciones.
Tu pago de la moto {placa} venció ayer y hoy es tu día de gracia: tienes hasta hoy para ponerte al día con {valor} y no entrar en mora.
Si ya pagaste, envíanos el comprobante con la placa y tu nombre para actualizarte de inmediato. Quedamos atentos.
```
> `[dueño]` ¿Se pone la hora? Los chats dicen "hasta las 3 entran al sistema". Si es regla, va aquí:
> "tienes hasta las 3:00 p. m. de hoy".

**3 · `mora` → `cobro_mora_v1`** · variables: nombre · placa · dias · valor
```
Hola, {nombre}. Bendiciones.
Tu moto {placa} lleva {dias} días sin pago y hoy debes {valor}. Los pagos son los lunes; mientras el pago no se complete, tu cuenta sigue en mora.
Tienes hasta hoy para ponerte al día. Después de eso, el sistema puede apagar el vehículo en cualquier momento, y si en la hora siguiente no hay pago ni respuesta, se procede a recogerlo.
Escríbenos hoy para reportar tu pago o acordar cómo te pones al día. Quedamos atentos.
```
> Redacción acordada con el dueño (8-sep): límite claro para la oportunidad, sin prometer la hora del
> apagado; y el apagado no es la última instancia — la recolección sí.
> `{dias}` viaja como número; en mora siempre son 2 o más, así que "días" en plural nunca falla.

**4 · `recoleccion` → `aviso_recoleccion_v1`** · variables: nombre · placa · dias · valor
```
Hola, {nombre}. Bendiciones.
Tu moto {placa} lleva {dias} días en mora y debes {valor}. Se agotaron los plazos: por reglamento, el vehículo pasa a recolección, y eso genera un costo adicional de inmovilización.
Todavía puedes evitarlo hoy: envíanos el comprobante o escríbenos ahora para acordar el pago. Quedamos atentos.
```

**5 · `moto_retenida` → `moto_retenida_v1`** · variables: nombre · placa · valor
```
Hola, {nombre}. Bendiciones.
Tu moto {placa} está en nuestras instalaciones. Para entregártela nuevamente debes ponerte al día con {valor}; si no lo tienes completo, en la oficina podemos revisar un acuerdo de pago contigo.
Escríbenos para cuadrar cuándo la retiras. Quedamos atentos.
```

**6 · `acuse_comprobante` → `acuse_comprobante_v1`** · variables: nombre · valor · placa
```
Hola, {nombre}. Recibimos tu comprobante por {valor} para la moto {placa}. Lo estamos verificando; apenas quede registrado te confirmamos. Gracias.
```

**7 · `recibo` → `recibo_pago_v1`** · variables: nombre · folio · fecha · placa · valor · pendiente
```
¡Gracias por tu pago, {nombre}! Bendiciones.
Recibo {folio} del {fecha} · Moto {placa} · Valor recibido: {valor}.
Te queda pendiente: {pendiente}.
Club Moteros Cartagena.
```
> Los chats cierran con "Próximo pago el día LUNES 7 de septiembre" — a los clientes les sirve. Para
> una `_v2`: agregar `{proximo_pago}` (la vitrina ya lo tiene: `proximo_pago_fecha`).

**8 · `recibo_campo` → `recibo_campo_v1`** · variables: nombre · valor · placa · folio · fecha
```
Hola, {nombre}. Bendiciones.
Recibimos tu pago en efectivo de {valor} por la moto {placa} (recibo provisional {folio}, {fecha}). Queda pendiente de validación en caja; te confirmamos apenas se registre. Conserva este comprobante.
```

**9 · `cuentas_pago` → `cuentas_para_pagar_v1`** · variables: nombre · placa · cuentas
```
Hola, {nombre}. Estas son las cuentas para el pago de tu moto {placa}: {cuentas}.
Cuando transfieras, envíanos la foto del comprobante junto con la placa y tu nombre, para acreditarlo rápido. Quedamos atentos.
```
> `{cuentas}` en **una sola línea** para Meta ("Bancolombia Ahorros 000 (Titular) / Nequi 300 (Titular)").
> Como texto libre dentro de la ventana puede ir con viñetas. Pendiente en código: mandar la versión
> de una línea en `variables` y la de viñetas en `texto` (hoy van iguales).

**10 · `contacto_general` → `contacto_general_v1`** · variables: nombre · placa
```
Hola, {nombre}. Bendiciones. Te escribimos de Club Moteros Cartagena por un tema de tu moto {placa}. Por favor comunícate con nosotros por este medio. Quedamos atentos.
```

**Decisión del dueño sobre la firma (8-sep): NO se firma con el nombre del encargado.** Los mensajes
automáticos hablan como la empresa ("En Club Moteros…", "Quedamos atentos") y se refieren a áreas,
no a personas. Una persona se presenta con nombre y área **solo cuando toma la conversación** desde
Chatwoot ("Le habla Brandon, del área de cartera"). Razón: profesionalismo, que el cliente no le
cargue la culpa a un administrador, y que el funcionario pueda pedir tiempo cuando el proceso
depende de otra área. **Vocabulario:** nunca coloquial ("manito", "dale", "porfa", "chance");
correcto y sencillo, que lo entienda cualquiera.

**Al aprobar estos textos:** se actualiza `mensajes_whatsapp.texto` desde Configuración (o por SQL)
y, donde el orden de variables cambió respecto a la mig 133 (`recibo`, `recibo_campo`), la columna
`variables` — un `update` de dos filas. ZALA los registra en Meta con esos mismos nombres `_v1`.

---

## Tabla de correspondencia (lo que se guarda en la base)

`mensajes_whatsapp` gana dos columnas: `plantilla_meta` y el orden de las variables.

| Nuestra clave | Plantilla en Meta | Variables, en orden |
|---|---|---|
| `dia_pago` | `cobro_dia_pago_v1` | nombre · placa · valor |
| `gabela` | `cobro_gabela_v1` | nombre · placa · valor |
| `mora` | `cobro_mora_v1` | nombre · placa · dias · valor |
| `recoleccion` | `aviso_recoleccion_v1` | nombre · placa · dias · valor |
| `moto_retenida` | `moto_retenida_v1` | nombre · placa · valor |
| `acuse_comprobante` | `acuse_comprobante_v1` | nombre · valor · placa |
| `recibo` | `recibo_pago_v1` | folio · fecha · nombre · placa · valor · pendiente |
| `cuentas_pago` | `cuentas_para_pagar_v1` | nombre · placa · cuentas |

El texto editable en Configuración **se conserva**: sirve para que se vea cómo queda el mensaje y
para enviarlo tal cual cuando la ventana de 24 h está abierta. Lo que se agrega es a qué plantilla
de Meta corresponde.

---

---

## Las que vienen (pedidas, sin redactar)

El dueño las nombró el 8-sep al aprobar esta lista. **No se redactan todavía** porque dependen de
datos que MotoGestión aún no guarda; se agregan cuando exista de dónde sacar la fecha de revisión.

| Plantilla futura | Para qué | Qué falta antes |
|---|---|---|
| `citacion_revision_vehiculo_v1` | Citarlo a la revisión periódica de la moto | Dónde se marca que a una moto le toca revisión |
| `citacion_revision_electrico_v1` | Revisión del sistema eléctrico | Lo mismo |
| `citacion_revision_gps_v1` | Revisión del GPS | **El GPS no existe en la base**: no hay ni un campo (pedido del 2-sep, sin construir) |

Las tres son el mismo patrón: *"lo citamos a la oficina a una revisión rutinaria del vehículo"*.
Cuando se construya el registro de revisiones, se redactan y se enganchan a la tubería que ya
existirá — no hay que rehacer nada.

---

## Lo que falta decidir

1. **Los textos exactos**, palabra por palabra. Son lo que lee el cliente y es la voz de la empresa
   — los revisa el dueño antes de registrarlos en Meta, porque **una vez aprobados, cambiar el texto
   exige volver a pedir aprobación** (y por eso existe la regla de versiones de arriba).
2. **Confirmar los 6 textos actuales contra Configuración**, no contra el código (ver el aviso del
   principio).
3. **El idioma a registrar** (`es` o `es_CO`) — lo decide ZALA.
4. **Si se registran botones** (por ejemplo "Ya pagué" o "Hablar con un asesor"). No hace falta para
   arrancar; sería una `_v2`.

## Alcance acordado con los comprobantes (8-sep)

**Los comprobantes NO entran a MotoGestión por ahora.** Decisión del dueño: *"dejemos ahorita eso
manual, que le lleguen las fotos a los funcionarios y ya ellos mismos van reenviando las fotos al
grupo y que todo funcione como lo hace ahora; ya después miramos bien cómo lo integramos."*

Lo que sí se hace ahora, y todo vive en ZALA: el cliente manda la foto, **ZALA le pide placa y
nombre del titular si no vienen** (siempre, porque de un mismo número pueden pagar dos motos
distintas), le acusa recibo, y **se la reenvía en un solo chat al funcionario encargado**, con el
pie diciendo a qué moto, a qué cliente y a qué portafolio corresponde. El funcionario la reenvía a
su grupo y la secretaria la registra, igual que hoy.

Queda pendiente para más adelante: la lista de comprobantes dentro de la app, que es la que
garantizaría que ninguno se pierda.

### El WhatsApp de cada funcionario sale de MotoGestión

**Pedido del dueño (8-sep):** el número de WhatsApp de cada funcionario **se pide y se guarda en la
información de su usuario dentro de MotoGestión**, y de ahí lo saca ZALA. No en un archivo aparte.

| | |
|---|---|
| **Dónde se guarda** | `profiles.whatsapp` — creada en la mig 132 |
| **Dónde se captura** | Usuarios → editar usuario. Al lado del nombre y el rol (pantalla pendiente, Fase 1) |
| **Quién lo edita** | ADMIN_PRINCIPAL, igual que el resto del perfil |
| **Cómo lo lee ZALA** | `zala.cliente.encargado_whatsapp` y `encargado_id` — ya en la vitrina desde la mig 132 |

**Qué reemplaza:** el archivo `equipo.json` que el proyecto ZALA mantiene a mano para traducir
nombre → número. Ese archivo ya falló una vez, con «Lumar Avendaño Pineda» contra «Lumar Avendano
Pineda». Con el número saliendo de la misma base, el reparto deja de depender de que dos textos
coincidan letra por letra.

**Qué pasa cuando falta el dato** — tiene que ser visible, nunca fallar callado:

- Moto **sin encargado asignado** (`motos.subadmin_id` vacío) → el comprobante no tiene a dónde ir.
  ZALA lo deja marcado como sin destinatario y hay que asignarle encargado a esa moto.
- Encargado **sin WhatsApp registrado** → lo mismo. La pantalla de Usuarios debe dejar ver de un
  golpe a quién le falta el número.

## Decidido

- **Desglose del recibo:** segundo mensaje libre dentro de la ventana de 24 h (8-sep).
- **Foto del recibo impreso:** buena idea, queda como `recibo_pago_v2` para más adelante (8-sep).
- **Al cliente con la moto retenida sí se le escribe**, para gestionar cuándo la retira (8-sep).
- **Aprobación de envíos:** al principio solo ADMIN_PRINCIPAL; después se reparte por persona con
  el sistema de permisos que ya existe. Todo envío deja rastro de quién lo pidió (8-sep).

---

## Cómo quedó construida la tubería (Fase 1, 8-sep-2026)

**Una sola función para todos los mensajes:** `useEnvioMensaje().enviar()` (`src/hooks/useEnvioMensaje.ts`),
con las piezas puras y probadas en `src/utils/mensajeria.ts`. Los 8 sitios que abrían `wa.me` ahora
la llaman: Panel Hoy, Cobro Diario, Inmovilizaciones, recibo de pago, recibo de cobro en campo,
estado de cuenta, cuentas para pagar y la campana de alertas. El único que no pasa por ahí es el
enlace de Mis Visitas (abre el chat con un prospecto, sin texto: no es un mensaje de plantilla).

| Pieza | Qué hace |
|---|---|
| `mensajes_whatsapp.plantilla_meta` / `variables` / `activa` (mig 133) | La clave conoce su plantilla vigente en Meta y el orden de sus variables. **El código nunca nombra una plantilla.** |
| `gestiones_cobro.plantilla_usada` … `mensaje_estado` (mig 133) | Qué versión se usó (congelada) y qué pasó de verdad con el mensaje. Estados en `docs/DICCIONARIO-ESTADOS.md` §7b |
| Acciones `enviar_mensaje` y `enviar_masivo` (`src/lib/acciones.ts`) | Ningún rol las trae por defecto: solo ADMIN_PRINCIPAL, hasta que las reparta por persona en Usuarios |
| Edge Function `enviar-mensaje` | La única puerta hacia ZALA. Guarda la llave del lado del servidor y verifica el permiso con `puede_accion()` en la base |
| `profiles.whatsapp` (mig 132) + campo en Usuarios | El número de cada funcionario, para que ZALA le reenvíe comprobantes. La lista marca "Sin WhatsApp registrado" |
| Configuración → Mensajes | Bajo cada texto: a qué plantilla de Meta corresponde y sus variables en orden |
| **Envío masivo** (Fase 2) — Panel Hoy | El grupo lo definen el chip activo y el buscador. Botón "Enviar mensaje a los N de …" → ventana con nombre · placa · mensaje · valor → confirma → uno por uno por la misma tubería, con resultado por fila. Cada cliente recibe el mensaje de su balde (mismo mapa que `plantilla_hoy`). No repite a quien ya recibió mensaje hoy. Solo con permiso `enviar_masivo` y **solo con el canal oficial conectado** (deshabilitado si no) |

**El interruptor:** `VITE_ZALA_ENVIO=on` en el entorno de la app. Mientras no esté, todo sigue
abriendo WhatsApp como siempre — pero la gestión dice `abierto_whatsapp` ("se abrió WhatsApp; el
envío no está confirmado") en vez de "enviado". Con el interruptor puesto: solo quien tenga el
permiso envía, por ZALA, y **sin respaldo por wa.me** (ese fue el camino que bloqueó el número).

**Lo que ZALA tiene que implementar para que esto funcione** (su §6.1, con dos campos más):

```
POST {ZALA_URL}/api/enviar        cabecera X-Llave
{ "contrato_id": "…" | null,
  "telefono":    "573001234567",          ← ya normalizado
  "plantilla":   "cobro_mora_v1" | null,   ← la vigente para la clave; null = solo texto
  "variables":   ["KEVIN", "RLY45H", "3", "$404.000"],
  "texto":       "Hola KEVIN, …",          ← el mismo mensaje armado, para mandarlo como texto
                                            si la ventana de 24 h está abierta (sin gastar plantilla)
  "clave":       "mora",
  "quien_pide":  "correo@clubmoteros.com" }
→ { "id": "…", "estado": "en_cola" | "enviado" | "rechazado", "motivo": "…" }
```

**Secretos** (Supabase → Edge Functions → Secrets, nunca en el repo): `ZALA_URL`, `ZALA_LLAVE`.

**Para ponerla en marcha, en orden:** ✅ mig 133 · ✅ app desplegada (`a1437ee`) · ✅ WhatsApp de los
4 encargados registrado → cuando ZALA abra su API y Meta apruebe las plantillas: desplegar
`manage-users` y `enviar-mensaje` (el dueño entra una vez con `npx supabase login`, el resto por
comando) + secretos `ZALA_URL` / `ZALA_LLAVE` + `VITE_ZALA_ENVIO=on` en Vercel.

---

## Cómo arma ZALA la tanda del día (mig 134) — sin una sola cuenta de su lado

Desde la mig 134 la vitrina no solo da la cifra: **dice a quién escribir y con qué mensaje.** La
decisión la toma MotoGestión; ZALA la obedece.

```
1. select * from zala.cliente where cobro_automatico
2. por cada fila:  clave = plantilla_hoy          (dia_pago · gabela · mora · recoleccion)
3. select plantilla_meta, variables, texto from zala.plantillas where clave = …
4. variables desde LA MISMA FILA, en el orden que dice `variables`:
      nombre → cliente · placa → placa · valor → debe_hoy_texto · dias → dias_mora
5. enviar: plantilla si la ventana de 24 h está cerrada; `texto` con los comodines
   reemplazados si está abierta. El cliente lee lo mismo.
```

| Columna nueva en `zala.cliente` | Qué dice |
|---|---|
| `zala_puede_escribir` | Si se le puede escribir. **No** si está en lista negra o su número no sirve. A la moto retenida **sí** (decisión del dueño) |
| `no_escribir_porque` | El motivo, en palabras, cuando es `false` |
| `cobro_automatico` | Si entra en la tanda automática: puede escribir ∧ contrato Activo ∧ cifra verificada ∧ **sin plazo extra vigente ∧ sin promesa de pago pendiente** (un cobro automático contradiría lo que un funcionario ya acordó). La retenida no entra: a esa se le escribe a mano, como gestión |
| `plantilla_hoy` | La **clave** del mensaje de hoy. `moto_retenida` para las retenidas (fuera de la tanda automática, para el funcionario) |
| `debe_hoy_texto` | La cifra ya escrita: `$202.000`. Es `{valor}` |

`zala.plantillas` es la traducción clave → plantilla de Meta, con el texto editable y `activa`. Y
`zala.pagos` ganó `registrado_por` (quién digitó el pago), que ZALA pidió para cruzar comprobantes.

---

*Documento de MotoGestión. Su contraparte es `CONTRATO-CON-MOTOGESTION.md` en el repositorio de
ZALA. Ver también `docs/DICCIONARIO-ESTADOS.md` (la vitrina y sus columnas).*
