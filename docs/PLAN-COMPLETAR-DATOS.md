# PLAN — Alimentar el sistema con la información que le falta

**Medido el 22-sep-2026** contra la base de producción. Pedido del dueño: *"hay que hacer un plan
y las estrategias para ya alimentar todo el sistema con toda la información que se necesita"*.

> **El hallazgo que ordena todo el plan:** hay **267 contratos activos** y **168 son migrados**.
> Y los **168 sin papeles son exactamente esos 168**. Los que entraron por el wizard están
> completos; **la mitad migrada del negocio no tiene nada en el sistema.**
> No es desorden: es que nunca se les pidió.

---

## Lo que falta hoy, con número

### 🔴 Papeles del cliente y del contrato

| Falta | Cuántos | De un total de |
|---|---|---|
| Contrato firmado escaneado | **168** | 267 activos |
| Pagaré firmado escaneado | **168** | 267 activos |
| Cliente sin **ningún** documento (cédula, recibo, hoja de vida…) | **207** | 323 activos |
| Cliente sin **firma de autorización de datos** | **82** | 323 activos |
| Cliente sin teléfono | **0** ✅ | — |

🔴 **Los 82 sin firma de autorización son un problema legal, no de orden.** Es el documento de
habeas data (Ley 1581) con el que la empresa se compromete a custodiar sus papeles — y el mismo
día que cerramos la bodega de archivos por esa ley, descubrimos que 82 clientes nunca la firmaron.

### 🟠 La flota

| Falta | Cuántas | De 372 motos |
|---|---|---|
| **Tarjeta de propiedad escaneada** | **371** | prácticamente ninguna la tiene |
| Datos técnicos (marca, modelo, motor, chasis) | 94 | |
| Fecha de SOAT | 97 | |
| Fecha de tecnomecánica | 94 | |

Sin fecha de SOAT no hay aviso de vencimiento: **97 motos pueden estar rodando vencidas y el
sistema no lo sabe.**

### 🟡 Cartera

| Falta | Cuántos | De |
|---|---|---|
| Acuerdos sin lista de qué financian | **56** | 145 vivos |
| Contratos con el plazo dudoso | **4** | JHON · JOSE LUIS · KENNY · DARGENIS |

---

## La estrategia: que el sistema lo pida, no que alguien se acuerde

Una campaña aparte —"esta semana subimos documentos"— se muere a los tres días. Lo que funciona
en este sistema ya está probado: **`public.pendientes`**. El trabajo aparece solo, con dueño, en
la pantalla de quien lo tiene que hacer.

### Fase 1 — Que el sistema sepa qué le falta a cada quien
Avisos nuevos en Mi Día, con dueño (el subadmin de esa moto, o ADMIN si no tiene):
- `sin_autorizacion_datos` — 🔴 arranca por acá: es legal
- `sin_documentos_cliente` · `sin_contrato_escaneado` · `sin_soat_registrado` · `sin_tarjeta_moto`

⚠️ **Con cupo diario**, como se hizo con las 192 validaciones de ubicación (mig 145): si salen
207 avisos el primer día, nadie mira ninguno. Cinco por persona por día.

### Fase 2 — Pedirlo en el momento en que el cliente está enfrente
El dato se consigue cuando la persona ya está ahí, no llamándola aparte. Los momentos que ya
existen:
- **Cuando paga** → si le falta la firma de autorización, que la pantalla lo diga ahí mismo.
- **Cuando se le hace un acuerdo** → ya firma; aprovechar para la autorización y la cédula.
- **Cuando entra la moto a taller** → aprovechar para la tarjeta de propiedad y el SOAT.
- **En la visita domiciliaria** → el visitador ya va con el celular.

### Fase 3 — Cerrarle la puerta a que vuelva a faltar
Que un contrato nuevo no pueda activarse sin sus papeles ya es así (el wizard los exige).
Falta lo mismo para lo que se edita después.

---

## El orden que recomiendo

| # | Qué | Por qué primero |
|---|---|---|
| 1 | **82 firmas de autorización** | Es ley, y es el único que expone legalmente a la empresa |
| 2 | **97 fechas de SOAT** | Una moto rodando sin SOAT es un problema el día del accidente |
| 3 | **4 contratos con plazo dudoso** | Es plata: entre $2M y $11M por contrato, en las dos direcciones |
| 4 | **56 acuerdos sin lista** | Bloquean cualquier corrección automática de cartera |
| 5 | 168 contratos y 207 clientes sin papeles | Es el más grande pero el menos urgente: se hace por goteo |
| 6 | 371 tarjetas de propiedad | Se va haciendo a medida que las motos pasen por taller |

---

## Lo que hay que definir con el dueño antes de construir

- ⚠️ **¿Quién sube qué?** El subadmin de la moto, la secretaria, o el que atienda ese día.
- ⚠️ **¿Cuántos avisos por persona por día?** (La propuesta es 5, como en validar ubicación.)
- ⚠️ **¿Se le puede exigir a un cliente migrado que firme la autorización?** Ya lleva meses
  rodando sin haberla firmado. ¿Se le pide en el próximo pago, o solo cuando venga por otra cosa?
- ⚠️ **¿Los 371 de la tarjeta de propiedad valen la pena?** Escanearlas todas es un trabajo
  grande. Si solo sirven para imprimirle la copia al conductor, quizá solo hace falta hacerlo
  cuando esa copia se pide.
