# EL ESTÁNDAR DEL PROYECTO — secuencia, memoria y automejora

## Contexto

Pedido del dueño (23-sep-2026), textual:

> *"Que hagamos un estándar que nos permita siempre ir en la misma dirección y no incurrir en
> errores por tomas de decisiones diferentes en cada sesión… un camino muy bien trazado que se
> autoalimente y que no se pueda desviar… que cuando se arregla algo no se dañe otra cosa, y que en
> una sesión nueva no empieces a creer cosas que no son las que se pensaron en un principio."*
>
> *"Yo no tengo conocimientos de cómo funcionan las cosas ni de cómo vos hacés las cosas, así que
> debemos llevar una secuencia y memoria exacta… donde te automejores siempre, y las cosas que veas
> que puedan afectarnos en el futuro las digas para corregirlas."*
>
> *"El experto en el proyecto sos vos; yo solo soy el autor o creador intelectual."*
>
> Y: *"si las skills no estaban activas yo no me enteré, deja eso también como regla."*

Esa última frase cambia el diseño: **el estándar no puede depender de que él sepa cómo funciona
nada.** Tiene que funcionar solo, avisar solo, y explicarse en su idioma cuando algo falle.

---

## Diagnóstico

### Lo que ya está bien (no se toca, se construye encima)

El repo tiene documentación de primer nivel y hay que **reusarla, no duplicarla**:
`docs/PROCESOS.md` (cómo funciona cada proceso) · `docs/RIESGOS.md` · `docs/DELEGACION-RACI.md`
(quién hace qué) · `docs/DICCIONARIO-ESTADOS.md` · `docs/MAPA-FINANCIERO.md` ·
`docs/PENDIENTES.md`. Y el código tiene buena arquitectura: `createTableStore` (una tienda
compartida por tabla, con tiempo real y paginación) y funciones únicas como `loQueDebe()`.

**El problema no es falta de documentos. Son cuatro huecos precisos.**

### 🔴 Hueco 1 — Las decisiones no tienen casa

`PROCESOS.md` dice *cómo funciona*. `RIESGOS.md` dice *qué puede fallar*. `PENDIENTES.md` dice
*qué falta*. **Ningún archivo dice "esto se decidió el día X, así, por esta razón".**

Por eso las decisiones viven dispersas en prosa dentro de `CLAUDE.md`, en 125 archivos de memoria,
y en planes sueltos. **Y se pierden:** `CLAUDE.md` todavía ordena *"leer `sunny-brewing-island.md`
completo — 40+ decisiones de negocio confirmadas pregunta por pregunta"*, y **ese archivo ya no
existe**. Esas 40 decisiones que él cerró una por una no están en ningún lado.

Es, literalmente, *"en una sesión nueva empezás a creer cosas que no son las que se pensaron en un
principio"*.

### 🔴 Hueco 2 — La memoria vive fuera del repo

**125 archivos, 1,1 MB, en `C:\Users\USER\.claude\projects\…` — fuera de git.** Si ese disco falla
o al cambiar de PC (y Syncthing ya falló una vez), se pierde todo el porqué del proyecto. No hay
respaldo. Es el mismo accidente del plan perdido, pero 125 veces más grande.

### 🔴 Hueco 3 — El archivo de instrucciones es un diario y miente

`CLAUDE.md` tiene **1.426 líneas**; de la 989 al final son **437 líneas (31%)** de bitácora de
julio. Es lo primero que lee cada sesión nueva, y hoy afirma:

| Le dice a cada sesión nueva | La realidad |
|---|---|
| *"mig `026` ⚠️ pendiente aplicar"* · *"aplicadas: 001–029"* | Vamos por la **167** (171 archivos) |
| *"rama `claude/clever-turing-daklkq`"*, y manda hacer merge desde ahí | Se trabaja en **`main`**; esa rama no existe |
| *"falta desplegar `manage-users`"* | Hecho en julio |
| *"`codebase-memory` — SIEMPRE ACTIVA"* | **Hoy no conectó** (ni otras 4) |
| *"leer `sunny-brewing-island.md`"* | No existe |

Se actualiza **solo hacia adelante**: cada sesión agrega su bloque, nadie vuelve a podar el de
julio. Y nada avisa cuando una línea se vuelve falsa.

### 🔴 Hueco 4 — No hay bucle de automejora

Cuando me equivoco, se corrige y se sigue. No queda registro del **patrón**, así que el mismo tipo
de error vuelve. Hoy pasó **cuatro veces** (dije "es solo cosmético" cuando trababa plata;
recomendé un camino equivocado; reporté dos saldos mal por el tope de 1.000 filas de Supabase;
declaré "la flota está limpia" con una batería que tenía un punto ciego). Las cuatro las cazó él,
no yo.

### Las fallas históricas que todo esto explica

| Falla | Evidencia | Hueco que la causa |
|---|---|---|
| Se pierde una regla al tocar código | **Mig 124**: reescribí 2 disparadores copiándolos de la 099 y borré lo que la 116 les había puesto. 12 convenios rotos, detectado 3 días después | 1 y 4 |
| Dos implementaciones del mismo concepto se separan | `cajas_exigidas()` SQL ↔ `cajasExigidasHasta()` TS · `loQueDebe()` ↔ `zala.cliente` · el saldo a favor tiene **3 fórmulas** | 4 |
| Se arregla un caso y otros tienen lo mismo | LUIS → al medir apareció **RAFAEL** con lo mismo · ADOLFO sigue sin medirse desde el 19-sep | 4 |
| Código y campos zombis | `ClienteDetalleSheet` (3 features en código muerto) · `MotoDetalleSheet` · `fecha_fin_contrato` decorativa pero editable | 1 y 4 |
| Decisiones re-preguntadas | La regla de *"preguntar hasta que quede claro"* hubo que escribirla **dos veces** (19-sep y hoy) | 1 |

---

## La propuesta

**Principio: lo que se olvida, se repite. Por eso todo lo que pueda vivir en una máquina, vive en
una máquina. La prosa queda solo para lo que ninguna máquina puede revisar.**

Y un corolario que manda sobre el diseño: **él no tiene que saber cómo funciona nada.** Un comando
al arrancar, un comando al cerrar, y los candados le hablan en su idioma.

### Las cuatro capas, cada una con un dueño y una vida distinta

| Capa | Pregunta que responde | Dónde vive | ¿Puede envejecer? |
|---|---|---|---|
| **Especificación** | ¿Cómo funciona el negocio? | `CLAUDE.md` + `docs/PROCESOS.md` + `docs/DICCIONARIO-ESTADOS.md` | No: se corrige cuando cambia la regla |
| **Decisiones** 🆕 | ¿Qué se decidió, cuándo y por qué? | `docs/DECISIONES.md` — **solo se agrega, nunca se edita** | No: es historia sellada |
| **Estado** 🆕 | ¿Dónde estamos hoy? | `npm run arranque` (se **calcula**) + `docs/PENDIENTES.md` | **Imposible**: se recalcula cada vez |
| **Historia** 🆕 | ¿Qué pasó antes? | `docs/HISTORIAL.md` + la memoria respaldada | No: es pasado |

---

## 🔥 LO DE ESTA SESIÓN (pedido del dueño: *"hagamos lo que no pueda pasar de esta sesión"*)

Solo lo que, si esta máquina muere esta noche, se pierde para siempre:

1. **La memoria, dentro del repo.** 125 archivos, 1,1 MB, hoy fuera de git. Él ya aprobó guardarlos
   completos.
2. **Este plan, dentro del repo** → `docs/ESTANDAR.md`. Hoy vive en
   `C:\Users\USER\.claude\plans\` — **la misma carpeta donde se perdió `sunny-brewing-island.md`
   con sus 40 decisiones.** El plan para no perder cosas está guardado donde se pierden las cosas.
3. **`docs/DECISIONES.md` creado y sembrado** con las decisiones de esta semana, que todavía no
   están en ningún lado estable.
4. **`docs/DERRAPES.md`** con los cinco errores míos de hoy.
5. **`PENDIENTES.md`**: subir la llave de ZALA a P0.

Todo lo demás queda escrito acá y se retoma en la próxima sesión, en el orden de abajo.

---

### 0. EL RESPALDO DE LA BASE

✅ **Resuelto en parte: tienen el plan Pro de Supabase ($25)**, que trae **respaldo diario
automático con 7 días de retención**. No están sin red.

Quedan dos huecos reales:

1. 🔑 **Nunca se probó restaurar.** Un respaldo que nunca se restauró es una ilusión: no se sabe si
   sirve ni cuánto tarda. Se hace el simulacro **una vez** y se anota en el `RUNBOOK.md`.
2. ⚠️ **7 días es corto para esta clase de errores.** La mig 124 se descubrió **a los 3 días**; si
   hubiera tardado 8, el respaldo ya no la alcanzaba. Dos opciones: activar *Point-in-Time Recovery*
   (es un extra pagado de Supabase) o un respaldo propio semanal de las tablas de plata
   (`npm run respaldo`, gratis, y suficiente para reconstruir cifras).
   **Es decisión suya** — depende de cuánto valga poder volver a un punto exacto.

> Y una nota que cambia el diseño: él confirmó que **el proyecto lo va a poder intervenir alguien
> más**. Eso sube de importancia todo lo que sea legible sin conocerme: el runbook, las decisiones
> con su porqué, los procesos, y que los candados hablen claro cuando fallan.

### A. `docs/DECISIONES.md` — la pieza que falta (lo más importante del conocimiento)

Un registro **numerado, fechado y de solo agregar**. Nunca se edita una decisión: si cambia, se
escribe una nueva que dice *"reemplaza a la D-023"*. Así *"lo que se pensó en un principio"*
siempre se puede reconstruir, y se ve **por qué** cambió.

Formato de cada entrada (corto a propósito, o nadie lo escribe):

```
## D-041 · 23-sep-2026 · Aplicar saldo a favor cuando el cliente no debe nada
**Decidió:** el dueño.
**Qué se decidió:** no se deja; sale un aviso y no se crea nada.
**Por qué:** el movimiento quedaba en ceros y le trababa el saldo al cliente (LUIS, 8 días).
**Consecuencia aceptada:** ya no se puede adelantar una cuota del acuerdo con el saldo.
**Dónde vive:** `usePagos.aplicarSaldoFavor` (parámetro `debeHoy`) · mig 167.
**Reemplaza a:** —
```

**Se siembra** con las decisiones cerradas que hoy están dispersas: las de `CLAUDE.md`
(tarifa-primero, deuda-primero, rodar solo períodos completos, la multa de $30.000, las dos cuentas
de días…), las de las memorias, y las de esta semana. **Las 40+ del plan perdido se reconstruyen
hasta donde se pueda desde la memoria y el código, y lo que no se pueda se marca
`⚠️ no recuperado`** — sin inventar.

### B. La memoria, dentro del repo

`npm run memoria:respaldar` copia los 125 archivos a `docs/memoria/`. Git la protege, viaja con el
proyecto, y sobrevive a un disco muerto o a un cambio de PC. Se corre al cerrar cada sesión.

⚠️ **A definir antes de construir:** la memoria nombra clientes (LUIS, RAFAEL, cédulas de placa).
El repo es privado y `PENDIENTES.md` ya los nombra, así que es consistente — pero el manual en PDF
sí se dejó fuera de git a propósito por llevar datos de clientes. **Hay que confirmarlo con él.**

### C. `CLAUDE.md` = especificación, sin diario

- Las ~437 líneas de bitácora **se mudan** a `docs/HISTORIAL.md` (decisión suya): no se borra nada,
  solo sale de lo que las sesiones leen al arrancar.
- Antes de mudar, se rescata: lo que siga siendo trabajo va a `PENDIENTES.md`; lo que sea una
  decisión vigente va a `DECISIONES.md`. **Se entrega la lista bloque por bloque de qué fue adónde.**
- Se corrige la rama fantasma y la referencia al plan perdido.
- Encabezado nuevo: *"Este archivo es la ESPECIFICACIÓN: solo lo que no se vence. El estado sale de
  `npm run arranque`, lo que falta de `PENDIENTES.md`, lo que se decidió de `DECISIONES.md`, y lo
  que pasó de `HISTORIAL.md`. **Nada de bitácora acá.**"*
- **Regla de oro del corte:** si una frase puede volverse falsa sola con el paso del tiempo, no va
  en `CLAUDE.md`.

### D. Dos comandos que sostienen el hilo

**`npm run arranque`** — lo primero de cada sesión. Imprime, en su idioma:
1. **Herramientas**: cuáles no conectaron *(regla nueva que él pidió hoy)*. Si falta una que el
   proyecto da por activa, lo dice con todas las letras.
2. **Estado real**: rama, último commit, migraciones en el repo **y cuáles están aplicadas de
   verdad** (ver abajo), nº de pruebas, si el build pasa. Si algo no se puede probar dice
   **"no verificado"** — nunca adivina.
3. **Rumbo**: lo primero de `PENDIENTES.md` y las últimas 3 decisiones.

**`npm run cierre`** — lo último. Verifica que no quede nada suelto: memoria respaldada, pendientes
actualizados, decisiones del día registradas, pruebas en verde, enlaces de memoria sanos
*(hoy encontré 3 rotos)*, y nada sin commitear. Además **deja escrito cómo quedó la sesión**, para
que la siguiente sepa si esta terminó bien o se cortó a la mitad.

🔴 **Y los dos comandos NO dependen de que yo me acuerde: los dispara el sistema.** Claude Code
tiene *hooks* (`SessionStart` y `Stop`) — el mismo mecanismo que ya usa claude-mem en este equipo.
Se configura `npm run arranque` en `SessionStart` y el chequeo de cierre en `Stop`.

**Esto es lo más importante de todo el plan.** Sin los hooks, el protocolo es una regla escrita más
— y las reglas escritas son exactamente las que vienen fallando. Con los hooks, el arranque pasa
aunque yo lo olvide, aunque cambie el modelo, aunque la sesión empiece de cero.
- **Archivos:** `.claude/settings.json` (vía el skill `update-config`), `motogestion/scripts/arranque.mjs`,
  `motogestion/scripts/cierre.mjs`.

Y para que *"¿esta migración se corrió?"* deje de ser memoria: una migración nueva crea
`public.migraciones_aplicadas` y **cada migración futura se registra a sí misma** al final. Deja de
ser un recuerdo y pasa a ser una consulta.

### E. La automejora, con evidencia

**`docs/DERRAPES.md`** — cada vez que afirmo algo que resulta falso, queda una línea: qué afirmé,
qué era verdad, **por qué me equivoqué**, y **qué candado lo evita ahora**. Se siembra con los
cuatro de hoy.

No es autoflagelación: es que **cada derrape tiene que terminar en un candado**, o vuelve. Ejemplo
real de hoy: reporté dos saldos mal por el tope de 1.000 filas de Supabase → el candado fue anotar
la trampa y la función paginada en la memoria de cómo consultar la base.

**En el cierre de cada sesión respondo la pregunta "¿en qué me equivoqué hoy?".** Si la respuesta
es "en nada", es sospechosa: hoy fueron cuatro.

### F. La anticipación — `docs/RIESGOS.md` gana una sección técnica

Hoy `RIESGOS.md` cubre personas, datos y operación. Le falta **lo técnico, con disparador**: qué
funciona hoy pero no va a funcionar, y **cuándo**. Lo siembro con lo que ya vi midiendo:

| # | Riesgo | Se dispara cuando | Evidencia de hoy |
|---|---|---|---|
| T1 | **La memoria fuera del repo** | Un disco que falle o un cambio de PC | 125 archivos, 1,1 MB, sin respaldo |
| T2 | **La app descarga la base entera al navegador** | Al pasar de ~600 motos (la meta son **1.000**) | 54 llamadas al abrir; los pagos ya vienen en 3 tandas |
| T3 | **La vista de avisos se pone lenta** | Al crecer la flota | `pendientes_activos` tarda **1.180 ms** y se pide 2 veces |
| T4 | **Tres fórmulas del saldo a favor** | Cuando alguien toque una sola | `saldoAFavorDe` · `saldo_favor_actual` · el candado de la 160 |
| T5 | **`fecha_fin_contrato` decorativa pero editable** | Ya está pasando | 15 de 266 activos descuadrados |
| T6 | **El tope de 1.000 filas** | Cualquier consulta nueva que no pagine | Me mordió hoy midiendo |
| T7 | **`avisar` sin redesplegar** | Ya está pasando | Pantalla y celular dicen cosas distintas |
| T8 | 🔴 **Una llave de producción circuló por un chat y no se ha rotado** | **Ya está pasando** | Está en `PENDIENTES.md` como tarea de operación desde hace días. Una llave expuesta no es un pendiente: es una puerta abierta. Sube a P0 |

*(Lo bueno: no hay secretos versionados en el repo y `.env` está correctamente ignorado —
verificado.)*

**Regla:** cuando yo vea un riesgo nuevo, entra acá con su disparador. No espero a que él pregunte.

### G. Los candados automáticos (que el desvío sea imposible, no indeseable)

1. **Registro de espejos** — `src/utils/espejos.test.ts`: la lista de pares que deben moverse
   juntos (TS ↔ SQL ↔ vitrina), con la huella de ambos lados. Si cambia uno y no el otro,
   **`npm test` falla** y lo dice **en su idioma**: *"Cambiaste la cuenta de las semanas en la
   pantalla pero no en la base. Van a decir cosas distintas."* Mata la mig-124 y el hueco T4.
2. **Casos reales congelados** — `src/utils/casosReales.test.ts`: las cifras de LUIS, RAFAEL,
   KEVIN, ADOLFO, JORGE TOVAR tomadas de producción. Ya existe el patrón (`loQueDebe.test.ts`,
   `saldoFavor.test.ts`); esto lo vuelve la batería oficial.
3. **Código muerto** — `knip` en CI. Mata los `MotoDetalleSheet`.
4. 🔴 **CI — HAY QUE CREARLO, NO EXISTE.** Verificado: **no hay carpeta `.github/`** en este repo.
   Las 668 pruebas **solo corren si yo me acuerdo de correrlas a mano**; nada las corre al subir
   código. Sin esto, los otros tres candados son opcionales, y un candado opcional no es un candado.
   *(En una versión anterior de este plan escribí que el CI "ya existía". Era falso: lo di por
   cierto desde otro archivo de instrucciones sin verificarlo contra este repo. El error que este
   plan arregla, cometido dentro del plan — queda en `DERRAPES.md`.)*

### H. El protocolo de sesión (va en `CLAUDE.md`, corto)

**Arrancar:** `npm run arranque`. No creerle a ningún documento.
**Durante:**
- Todo defecto **se mide en la flota antes de cerrarlo** *(así apareció RAFAEL)*.
- **Nada se afirma sin medirlo.** Si no se midió: *"no verificado todavía"*.
- Toda decisión de negocio que él tome → `DECISIONES.md` **en el momento**, no al final.

**Cerrar:** `npm run cierre`, más el entregable en palabras suyas:
- La lista de *"qué significa terminado"*, acordada **antes** de empezar, respondida **una por una
  con el número real**.
- **Qué se tocó** de lo que ya funcionaba · **qué NO se tocó** · **qué se ve distinto** · **qué
  quedó sin probar**.
- **¿En qué me equivoqué hoy?** → `DERRAPES.md`.
- **¿Qué riesgo nuevo vi?** → `RIESGOS.md`.

**Precedencia, para que el estándar no estorbe cuando hay urgencia:** si hay plata mal contada de
un cliente **hoy**, eso manda sobre el protocolo. Se arregla primero y se registra después — pero
se registra, en el mismo día. Es la única excepción, y queda escrita para que no se vuelva la regla.

### I. La segunda mirada — contra mi propio criterio

Los candados atrapan errores mecánicos. **No atrapan un criterio equivocado**, y ese es mi punto
ciego más grande, porque él mismo dice que no puede revisarme.

Hoy hay prueba de las dos cosas: recomendé mover `aplicarSaldoFavor` a un RPC, él preguntó
*"¿es el mejor camino?"*, y al forzarme a argumentar **en contra de mi propia recomendación**
encontré el camino correcto — una condición en el candado, diez veces más chico y sin tocar plata.

**Regla:** antes de construir cualquier cosa que toque plata o arquitectura, escribo **el caso en
contra de mi propia propuesta** — qué la haría equivocada, qué sería más barato, qué se rompe si me
equivoco. Si el caso en contra gana, cambio. Dejar de depender de que él pregunte.

### J. `docs/RUNBOOK.md` — las maniobras ya probadas

Cada incidente se improvisa, y eso cuesta. **Hoy mismo perdí tres intentos** escribiendo el SQL
para destrabar a Luis: el primero chocó con el candado de `eliminar_pago`, el segundo con los
disparadores diferidos. Nada de eso estaba escrito: ya lo sabíamos y lo volvimos a aprender.

Se siembra con lo que ya está probado:
- **Correr SQL de corrección**: apagar `trg_enforce_eliminar_pago` dentro de la transacción,
  `set constraints all immediate` después de un DELETE, volver a prenderlo antes del `commit`.
- **La disciplina de la corrección a mano**: leer la función que hizo el daño e invertirla; parchar
  con `pg_get_functiondef`, nunca regenerar (mig 124); antes/después siempre; un `success` no
  prueba nada.
- **Consultar la base desde el navegador** con sus cuatro trampas (incluido el tope de 1.000 filas).
- **Medir la flota** antes de cerrar un defecto.

### 🔴 L. La prueba de no-regresión de plata — lo que habría atajado la mig 124

**El peor daño que le hice al proyecto fue una migración**, y ninguno de los candados anteriores lo
habría visto: la **mig 124** reescribió dos disparadores y borró en silencio lo que la 116 les había
puesto. 12 convenios nacieron rotos y 11 cajas quedaron mal rotuladas. Se descubrió **tres días
después**, mirando un caso real a mano.

Las pruebas de `npm test` corren en Node contra TypeScript. **Nada prueba las funciones de la
base** — y ahí es donde vive el motor del dinero.

**La maniobra, simple y barata:** antes de correr cualquier migración que toque plata, se guarda una
foto de las cifras clave de **los 362 contratos** (cajas pagadas, ahorro, saldo a favor, deuda,
cuotas de acuerdo). Después de correrla, se compara. **Cualquier peso que se haya movido sin que lo
pidiéramos aparece con nombre y placa.**

- `npm run foto:plata` → guarda `docs/fotos/AAAA-MM-DD-antes.json`
- `npm run foto:comparar` → lista las diferencias, o dice "nada se movió"

Es la única prueba que habría cazado la 124. Y la 166 y la 167 de esta semana también deberían
haber pasado por ahí.

### 🔴 M. Toda migración lleva escrita su vuelta atrás

**Medido: de las 171 migraciones, 0 dicen cómo deshacerse.** Cada una es una puerta de un solo
sentido. Si una rompe algo un lunes por la mañana, no hay plan B escrito — hay que improvisarlo con
la operación parada.

**Regla nueva:** toda migración futura lleva, al final y comentado, **el SQL exacto para deshacerla**
— o la frase *"no se puede deshacer, y por qué"*, que también es una respuesta válida y avisa antes,
no después. No se toca ninguna de las 171 viejas; esto es de acá en adelante.

Y en el `RUNBOOK.md`: revertir la app es un clic en Vercel; **revertir la base no lo es.** Esa
diferencia tiene que estar escrita antes de necesitarla.

### 🔴 N. Ventana de despliegue — no tocar cartera en día de pago

El negocio cobra **lunes y miércoles**. Un despliegue roto un lunes a las 7 de la mañana son
**300 clientes que no pueden pagar** y una operación parada. Hoy mismo desplegamos tres veces, y
fue martes por pura casualidad.

**Regla:** nada que toque el motor, cartera, pagos o el reparto se despliega **lunes ni miércoles
antes de las 6 de la tarde**, salvo que sea justamente para arreglar plata mal contada de hoy. El
resto de los días, normal.

Cuesta cero y evita el único desastre verdaderamente caro que puede tener este sistema.

### O. Dos cosas chicas que ahorran fricción

**Plantillas de "qué significa terminado".** Hoy la invento en cada tarea. Tres plantillas cortas en
`docs/PROCESOS.md` — arreglo de plata · pantalla nueva · migración — para que la lista salga igual
siempre y él la pueda exigir sin saber de código.

**Las reglas que solo viven en su cabeza.** `CLAUDE.md` avisa que *"una regla de negocio vieja puede
vivir SOLO dentro del código"*. Hay un caso peor: las que viven **solo en la cabeza del dueño** — por
ejemplo *"la multa es siempre $30.000, solo varía si hay que salir de la ciudad… hoy el sistema no
tiene dónde poner ese valor distinto"*. Ya existe `docs/PREGUNTAS-OPERATIVAS.md`, que es exactamente
su casa: **cuando yo encuentre una regla que no está escrita en ningún lado, va ahí antes de que se
pierda** — aunque en ese momento no se vaya a construir nada.

### K. Saber si el estándar sigue vivo — y podarlo

Un estándar que nadie mide se muere en silencio. `npm run arranque` muestra, de las últimas 5
sesiones: cuántas decisiones se registraron, cuántos derrapes, cuántos riesgos nuevos. **Si esos
números quedan en cero varias semanas, el estándar se abandonó** — y se ve, en vez de descubrirlo
tres meses después.

**Y al revés: un estándar que solo crece también se muere**, por burocracia. Cada tres meses se
revisa: **la pieza que no atajó nada en ese tiempo se elimina.** Esta misma sección incluida.

> **De paso, esto resuelve el riesgo del que no hablamos:** hoy todo el proyecto pasa por mí. Con
> las decisiones, el runbook, los procesos y los candados escritos y corriendo solos, **cualquier
> desarrollador —o cualquier herramienta— puede tomar el hilo sin empezar de cero.** El estándar es,
> además, el documento de entrega.

---

## Lo que NO se toca

El motor de reparto, `cicloPago.ts`, las migraciones ya corridas, ni una cifra de ningún cliente.
**Cero cambios de comportamiento en la aplicación.**

---

## Verificación

| # | Qué | Cómo se prueba | Qué se espera |
|---|---|---|---|
| 1 | `CLAUDE.md` no miente | Buscar `clever-turing-daklkq`, `pendiente aplicar`, `001`–`029`, `sunny-brewing-island` | **0 coincidencias** |
| 2 | No se perdió nada al mudar | Líneas de `CLAUDE.md` antes/después + las de `HISTORIAL.md`, y la lista bloque por bloque | La suma cuadra; ningún bloque sin destino |
| 3 | Las decisiones están | `DECISIONES.md` sembrado | Las de esta semana + las de `CLAUDE.md`, y las no recuperables **marcadas como tales** |
| 4 | La memoria sobrevive | `npm run memoria:respaldar` y `git status` | Los 125 archivos versionados |
| 5 | El estado no se puede escribir mal | `npm run arranque` | Dice rama y migración reales, y **avisa de las herramientas caídas** |
| 6 | El candado de espejos muerde | Cambiar a propósito un lado de un par | **Falla**, y se entiende sin saber programar |
| 7 | Los casos reales protegen | Romper a propósito una cuenta | **Falla** nombrando al cliente |
| 8 | El código muerto aparece | `npx knip` | Reporta al menos `MotoDetalleSheet` |
| 9 | La app no cambió | `npm test` + build + abrir Cartera | 668 pruebas verdes, pantallas idénticas |
| 10 | **El arranque corre solo** | Abrir una sesión nueva sin pedir nada | Aparece el estado y el aviso de herramientas caídas **sin que nadie lo invoque** |
| 11 | Una sesión cortada se detecta | Cerrar a la fuerza y abrir otra | La nueva avisa *"la anterior no cerró bien"* |
| 12 | El estándar sigue vivo | `npm run arranque` a las 5 sesiones | Muestra decisiones, derrapes y riesgos del período |
| 13 | **La foto de la plata caza una regresión** | Tomar la foto, correr a propósito un SQL que mueva una cifra, comparar | **Aparece el contrato** con nombre, placa y la diferencia |
| 14 | La foto no da falsas alarmas | Tomarla dos veces seguidas sin tocar nada | *"nada se movió"* |
| 15 | Las migraciones nuevas se pueden deshacer | Revisar la próxima migración que se escriba | Trae su SQL de vuelta atrás, o dice por qué no se puede |

---

## Orden de construcción

Cada paso se entrega y se verifica por separado. **Nada se acumula para el final.**

| # | Qué | Cuánto | Por qué en ese lugar | Si se salta… |
|---|---|---|---|---|
| **0** | 🔴 **Respaldo de la base** (+ el simulacro de restaurar) | Media sesión · una pregunta suya al panel de Supabase | Es lo único que protege **la plata**, no el conocimiento | Un error irreversible borra la historia de 300 clientes |
| 1 | `DECISIONES.md` + memoria respaldada en git | Media sesión | **Detiene la pérdida** de conocimiento que ya está ocurriendo | Se vuelven a evaporar decisiones, como las 40 del plan perdido |
| 2 | Cirugía a `CLAUDE.md` → `HISTORIAL.md` | Media sesión | La causa principal de que una sesión nueva crea cosas falsas | Cada sesión nueva arranca con datos de julio |
| 3 | `arranque` / `cierre` **+ los hooks** | Una sesión | Convierte el protocolo en algo que **pasa solo** | Todo el protocolo depende de que yo me acuerde — o sea, falla |
| 4 | Foto de la plata · vuelta atrás · ventana de despliegue | Una sesión | Protegen contra el **daño irreversible** | Otra mig 124 pasa sin que nadie la vea en 3 días |
| 5 | `RUNBOOK.md` · `DERRAPES.md` · riesgos técnicos | Media sesión | Barato; evita volver a aprender lo ya aprendido | Se siguen perdiendo intentos improvisando lo mismo |
| 6 | Los candados: casos reales → espejos → knip → **CI (hay que crearlo)** | Dos sesiones | Lo más caro, y solo rinde con lo anterior puesto | Las pruebas siguen corriendo solo si me acuerdo |
| 7 | **Recién ahí**, la auditoría técnica | Varias | Con el estándar puesto, para que sus hallazgos no se pierdan | Repetimos el plan perdido: hallazgos que nadie vuelve a mirar |

**Dependencias que importan:** el 6 sin el CI es decorativo. El 3 sin el 1 y el 2 arranca mostrando
datos falsos. Los demás son independientes: se pueden hacer en cualquier orden o dejar de lado.

**Aparte, y sin depender del plan:** reconectar las 5 herramientas caídas
(`codebase-memory`, `context7`, `sequential-thinking`, `mempalace`, `task-master`). Hoy trabajé sin
ellas — `codebase-memory` es la que sirve para *"¿dónde está esto y con qué se conecta?"*, y sin
ella busqué a mano, más lento y con más riesgo de que se me escape algo.

---

## Cómo sabrás, en un mes, que esto funcionó

Sin saber nada de código, por tres señales:

1. **Abrís una sesión y en cinco líneas sabés dónde estamos** — rama, migraciones, qué falta, qué se
   decidió último — sin preguntarme y sin que yo tenga que acordarme de contártelo.
2. **Cuando algo se rompe, el sistema lo dice antes que vos.** Hoy vos encontraste el saldo trabado
   de Luis mirando una pantalla. En un mes eso tiene que salir en Mi Día al día siguiente.
3. **No volvemos a discutir algo ya decidido.** Si aparece la duda, está en `DECISIONES.md` con
   fecha y motivo, y se cierra en un minuto.

Si al mes eso no pasa, el estándar no sirvió y hay que podarlo o cambiarlo — no insistir con él.
