# Plantillas de WhatsApp — MotoGestión ↔ ZALA ↔ Meta

**Versión 1 (borrador para revisión) · 8 de septiembre de 2026**

Este documento es el acuerdo entre los dos proyectos sobre **qué mensajes existen, cómo se llaman
en Meta y qué variables lleva cada uno**. Sin él, MotoGestión manda texto que Meta no conoce y ZALA
no sabe qué plantilla usar.

- **MotoGestión** nunca manda un texto final. Manda: *"plantilla X, variables A, B, C"*.
- **ZALA** decide en el momento del envío: si la ventana de 24 horas está abierta, lo manda como
  texto normal; si está cerrada, lo manda como plantilla aprobada. **El cliente lee lo mismo.**
- **ZALA es quien registra las plantillas en Meta.** Este documento es lo que hay que registrar.

> ⚠️ **Antes de registrar nada en Meta:** los textos de abajo son los que están en el código como
> respaldo (`MENSAJES_DEFAULT` en `src/hooks/useMensajesWhatsapp.ts`). Si alguien los editó desde
> Configuración → Mensajes de WhatsApp, **los reales son los de la base** (`mensajes_whatsapp`).
> Hay que abrir esa pantalla y confirmar uno por uno antes de darlos por buenos.

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

*Documento de MotoGestión. Su contraparte es `CONTRATO-CON-MOTOGESTION.md` en el repositorio de
ZALA. Ver también `docs/DICCIONARIO-ESTADOS.md` (la vitrina y sus columnas).*
