# El día de cada persona — y las tareas que se le montan

> Escrito con el dueño el 9/10-sep-2026. **Es el paso previo al motor de pendientes y al panel
> "Mi día".** Sin esto la pantalla se construye adivinando: durante meses el sistema supuso que el
> subadmin salía a hacer una ruta de cobro, y no es así.

---

## 1 · El subadmin (o administrador)

**Así les dice el dueño: subadmin o administradores.** Son Brandon, Lumar, Carlos Álvarez y Carlos
Ariza — los que tienen motos asignadas (`motos.subadmin_id`). ZALA los llama "encargado"; en las
pantallas se usa la palabra del dueño.

### 🔴 Su día es de oficina y teléfono. Salir es la EXCEPCIÓN.

> *«Ellos por lo general solo salen a la calle si necesitan buscar una moto, ya sea porque no ha
> pagado o porque se le citó y no cumplió la cita, o en su defecto porque sea una emergencia de
> robo o algo así.»*

Eso tira abajo la idea de "ruta del día". **El panel no es un recorrido: es una lista de pendientes
con un orden.** Salir a la calle es una tarea puntual, no la forma normal del día.

### El orden de su mañana, dicho por el dueño

1. **Validar su lista de pendientes** — lo primero al abrir.
2. **Llamar y escribir** a los que toca. Antes que nada.
3. **Los demás pendientes que ya tiene asignados.**
4. **Los que le asignen durante el día** — la lista no es estática.

### Lo que el sistema ya hace hoy

Panel Hoy filtrado a sus motos, en cuatro grupos (Recolección · Mora · Gabela · Pagan hoy), con lo
que debe cada uno y cuatro botones: Mensaje, Llamar, Sirena, Cobrar. Cobro en campo con GPS y
recibo. Visitas asignadas. Al cerrar, marca el efectivo como entregado y la secretaria confirma.

**Lo que falta es el punto 3 y 4: no hay dónde ponerle a alguien una tarea puntual.**

---

## 2 · Las tareas asignadas (pedido del dueño, 10-sep)

> *«¿Podemos agregar algo donde se le monten tareas específicas diferentes a las del día a día, y
> que las marquen como cumplidas y si es caso dejar evidencias dependiendo de cuál sea la tarea?»*

Son las tareas que **no** genera el sistema: recoger una tarjeta de propiedad, ir a buscar una moto
que no cumplió la cita, verificar una dirección, llevar algo al taller.

### Decisiones cerradas

| Punto | Decisión | Por qué |
|---|---|---|
| **Quién asigna** | Por ahora **ADMIN_PRINCIPAL y ADMIN**. La secretaria más adelante. | Va sobre el sistema de permisos por persona que ya existe (`acciones.ts` + `puede()`): darle el permiso a Ángela será marcar una casilla en Usuarios, sin tocar código. |
| **Evidencias** | **Foto · Ubicación · Comentario escrito · Firma del cliente**, y el dueño dijo *"abierto a más posibilidades"*. | Se guardan **como datos, no clavadas en el código**, para poder agregar tipos nuevos sin rehacer el módulo. Cada tarea dice cuál(es) exige. |
| **Cuando no se puede** | Estado **"no se pudo"** aparte de "cumplida", con **motivo obligatorio**, y **vuelve a quien la asignó** con aviso. | Para que nadie marque cumplido lo que no hizo, y para que el que la mandó se entere **el mismo día** en vez de descubrirlo tarde. |

### Cómo se ve (aprobado en mockup)

Una pantalla con dos bloques: arriba **lo que el sistema arma solo** (llamar y escribir a los de
cobro), abajo **las tareas que le asignaron**. Cada tarea muestra quién se la pidió, para cuándo, y
qué evidencia exige. Lo cumplido se queda tachado y en gris con la hora y su evidencia — así al
final del día se ve **lo que hizo**, no solo lo que le falta.

### 🔲 Sin cerrar todavía

- ¿La tarea va siempre sobre una moto o un cliente, o puede ser suelta? (propuesta: **opcional**).
- ¿Fecha límite obligatoria? ¿A quién se le avisa cuando se vence?
- ¿Los demás roles (secretaria, mecánico, visitador) también tienen "Mi día"? Su flujo diario
  **todavía no se ha escrito** — este documento solo cubre al subadmin.

---

## 3 · La secretaria (Ángela)

### Lo primero al abrir: **lo que está esperando confirmación**

Las transferencias con comprobante y el efectivo que los subadmin entregaron. Es lo que está
**detenido esperando que ella diga sí o no** — y mientras no lo confirme, esa plata no cuenta en
ninguna cuenta: entró de verdad, pero el sistema no la ve. Por eso es lo primero.

### Lo que NO se puede quedar sin hacer al cerrar

1. **Confirmar todo lo que quedó pendiente** — ni una transferencia ni un efectivo de campo sin
   resolver. Lo que queda sin confirmar queda en el limbo.
2. **Recibir el efectivo de los subadmin** — que cada uno haya entregado físicamente lo que
   recogió y ella lo haya recibido. Si alguien se va con la plata en el bolsillo, al día siguiente
   nadie sabe cuánto era.

### 🔴 La caja de transferencias se cierra AL DÍA SIGUIENTE

> *«Yo pienso que el cerrar la caja, por lo menos lo de transferencias, lo cierre al día siguiente,
> cuando ya hayan ingresado todos los pagos que entran por la noche.»*

El efectivo se cuadra el mismo día, pero **las transferencias siguen llegando de noche**: cerrar la
caja de transferencias antes de que entren deja el día corto y el siguiente inflado. Se enlaza con
la regla de la fecha del banco (ver la memoria `caja-fecha-del-banco`).

⚠️ **Sin verificar contra el código:** falta revisar cómo cierra hoy `CajaView` / `useCaja` y si ya
distingue efectivo de transferencias. No dar por hecho que funciona así.

---

## 4 · El administrador (Sergio)

> *«Tiene su propia lista, pero el trabajo principal es supervisar el trabajo de los demás admins:
> él cuida que todo marche y se haga bien.»*

**Su panel se lee al revés que el de un subadmin: primero cómo van los DEMÁS, después lo suyo.**

Necesita ver, por persona: qué le falta, qué no hizo, qué se le venció, qué marcó "no se pudo".
**Eso hoy no existe en ninguna pantalla** — no hay forma de ver el trabajo de alguien más sin
entrar contrato por contrato.

Su lista propia son las decisiones que solo él toma: aprobar visitas, autorizar recolecciones,
revisar liquidaciones, resolver el tiempo que una moto estuvo guardada.

---

## 5 · El administrador principal (el dueño)

Los tres bloques, **en este orden**:

1. **La plata** — cuánto entró hoy y en la semana, por portafolio. Si la operación está produciendo.
2. **Lo que espera su decisión** — lo que nadie más puede resolver: aprobar tandas de mensajes,
   autorizar recolecciones, revisar liquidaciones, decidir excepciones. Si él no lo toca, se queda.
3. **Lo que está saliendo mal** — motos guardadas sin producir, clientes disparados en mora, cosas
   trabadas hace días, gente que no hizo su trabajo.

---

## 6 · Lo que esto implica para construir

### 🔴 El problema de fondo: hoy los pendientes viven en el navegador

Las 19 alertas se calculan **en el navegador, al vuelo** (`useAlertas`), y **no tienen dueño ni
estado**: nadie sabe quién debe resolverlas ni si alguien ya las atendió. Sin la app abierta, no
existen. Por eso:

- No se le puede **asignar** una alerta a nadie.
- No se puede saber qué **quedó sin hacer** ayer.
- Sergio no puede supervisar lo que no queda registrado.
- **Y no puede haber notificaciones ni APK**: si nadie tiene la app abierta, no hay quién avise.

**Los pendientes tienen que mudarse al servidor.** Es el cimiento de todo lo demás.

### Orden propuesto

| Fase | Qué | Por qué en ese orden |
|---|---|---|
| **1** | Tabla de tareas + asignarlas + "Mi día" del subadmin | Es lo que el dueño pidió y lo que hoy no existe de ninguna forma |
| **2** | Los pendientes del sistema (las 19 alertas) mudados al servidor, con dueño y estado | Sin esto no hay supervisión ni notificaciones |
| **3** | El panel de Sergio: cómo va cada persona | Necesita que la fase 2 esté hecha |
| **4** | El panel del dueño: plata → decisiones → alarmas | Se arma con lo de las fases anteriores |
| **5** | Notificaciones y APK | Último: sin pendientes en el servidor no hay nada que notificar |

---

## 7 · Lo construido (10-sep-2026)

### Fase 1 — Las tareas · mig 140 y 141
`public.tareas` + el permiso `asignar_tarea` + la pantalla **Mi día**. Las reglas viven en la BASE,
no en la pantalla: el motivo del "no se pudo" lo exige un CHECK, crear exige el permiso **y** firmar
con el propio id, y no hay DELETE — una tarea se CANCELA, para que quede el rastro de que se pidió.

### Fase 2 — Los pendientes en el servidor · migs 142, 143 y 144
`public.pendientes` (una VISTA) + `public.pendientes_atendidos` (una tabla chica).

🔴 **No se guardan las alertas como filas.** Guardar "Nelson está en mora" obliga a acordarse de
borrarlo cuando pague, y ahí nace un segundo lugar donde vive la verdad. Se separó en dos:
- **Lo que se DEDUCE de los datos → se calcula** (la vista). Imposible de desincronizar.
- **Lo que NO se deduce → se guarda**, y es poquito: quién lo atendió, y por DÍA. Lo atendido hoy
  vuelve mañana si sigue vigente.

Los **19 avisos** ya están en el servidor con su dueño. Cada uno le toca **a una persona**
(`dueno_id`, el encargado de la moto) o **a un puesto** (`dueno_rol`: las transferencias son de la
secretaria). Si la moto no tiene encargado, el aviso pasa al rol ADMIN en vez de quedar huérfano.

Se reusó la **calculadora de la vitrina** (`zala.*`), que ya es espejo verificado de `cicloPago.ts`.
Escribir la mora otra vez habría sido una tercera versión de la misma cuenta.

### Fase 3 — Cómo va el equipo (Sergio) · `PanelEquipo`
Arriba de su propia lista: por persona, cuánto le falta hoy, cuántos urgentes, cuántas tareas tiene
y cuántas se le vencieron, y cuánto resolvió hoy. Ordenado por quién tiene más encima, que es lo que
destapa el desbalance. Muestra también a quien **no tiene nada asignado** — eso tampoco se veía.

### Fase 4 — El día del dueño · `PanelDelDia`
Los tres bloques en el orden que él pidió: **la plata** (vencido sin cobrar · esperando confirmación
· en el banco sin dueño) → **lo que espera su decisión** (liquidar, traspasos, graduar, cesiones,
contratos sin activar) → **lo que va mal** (recolección, papeles vencidos, retenidas, taller).

🔴 **Cada cifra dice qué pregunta responde.** "Vencido sin cobrar" es **la cuota y el acuerdo
vencidos**, no la deuda total del cliente — esa incluiría las deudas registradas y las multas, y
sería otra cifra con otro nombre. Y solo se suman `recoleccion` y `mora`, que son excluyentes:
sumar además el plazo y la promesa vencidos contaría dos veces al mismo cliente.

### Lo que queda de esta sección
- **Apagar la campana vieja** (`useAlertas` en el navegador). Se deja prendida a propósito hasta
  comparar aviso por aviso contra la vista: hay que conservar una contra la cual medir.
- **Fase 5 — notificaciones y APK.** Ya tiene su cimiento: los pendientes existen sin que nadie
  tenga la app abierta.

---

*Escrito con el dueño el 9/10-sep-2026. Las decisiones de aquí no se vuelven a preguntar.*
