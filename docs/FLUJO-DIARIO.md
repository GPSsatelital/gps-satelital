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

*Documento vivo. Se completa con el día de la secretaria y el del administrador antes de construir.*
