# DERRAPES — dónde me equivoqué y qué lo evita ahora

> Registro de las veces que **afirmé algo que resultó falso**. No es autoflagelación: es que
> **cada derrape tiene que terminar en un candado**, o vuelve.

**Por qué existe** (23-sep-2026). Cuando me equivoco, se corrige y se sigue — pero no queda registro
del **patrón**, así que el mismo tipo de error regresa. Ese día me equivoqué **cinco veces** y las
cinco las cazó el dueño, no yo.

**Se llena en el cierre de cada sesión**, respondiendo: *"¿en qué me equivoqué hoy?"*. Si la
respuesta es "en nada", es sospechosa.

**Formato:**

```
### DD-mmm-AAAA · Qué afirmé
**Lo que dije:** …
**Lo que era verdad:** …
**Por qué me equivoqué:** la causa, no la excusa.
**Quién lo cazó:** …
**Qué lo evita ahora:** el candado concreto. Si no hay, se dice "todavía nada".
```

---

## Lo histórico (el peor)

### 7-sep-2026 · Reescribí dos disparadores "copiándolos" de una migración vieja
**Lo que dije:** que la mig 124 reconstruía los disparadores de convenios tal como estaban.
**Lo que era verdad:** los copié del archivo de la mig 099/098, y entre esa y hoy la **mig 116** les
había agregado la partitura y la marca `fuente='convenio'`. Las borré sin querer. **12 convenios
nacieron sin partitura y 11 cajas quedaron rotuladas como cobradas para la nómina.**
**Por qué me equivoqué:** confié en el archivo de una migración anterior en vez de leer la función
**viva** de la base.
**Quién lo cazó:** el dueño, tres días después, revisando un caso real (JOSE SANMARTIN).
**Qué lo evita ahora:** la regla de parchar con `pg_get_functiondef` (escrita, y aplicada en las
migs 165/166/167). 🔲 **Falta el candado de verdad:** la *foto de la plata* antes/después de cada
migración — `docs/ESTANDAR.md` sección L. Sin eso, esto puede repetirse.

---

## 23 de septiembre de 2026

### Dije que el movimiento en ceros era "solo cosmético"
**Lo que dije:** que la fila de saldo a favor con todo en cero solo afectaba el texto de la ficha, y
que *"el daño no es la plata"*.
**Lo que era verdad:** le estaba **trabando $59.000 a LUIS desde hacía 8 días**, y a RAFAEL $100.000.
El candado de la mig 160 contaba esa fila "en vuelo" por su valor completo.
**Por qué me equivoqué:** miré el efecto de la fila sobre el **saldo calculado** (donde suma cero) y
no sobre **quién más la lee**. No busqué todos los consumidores de ese dato.
**Quién lo cazó:** el dueño, al darle al botón en producción y ver *"solo quedan $0 disponibles"*.
**Qué lo evita ahora:** mig 167 + el chequeo #6 de coherencia. Y la regla: **antes de llamar algo
"cosmético", buscar quién más lee ese dato.**

### Recomendé el camino equivocado (mover la función a un RPC)
**Lo que dije:** que la solución correcta era mover `aplicarSaldoFavor` a un RPC en la base.
**Lo que era verdad:** el arreglo correcto era **una condición** en el candado existente — diez veces
más chico y sin tocar lógica de plata. El RPC habría sido reescribir código que funciona, empujado
por un defecto chico: exactamente la lección de la mig 124.
**Por qué me equivoqué:** salté a la solución "arquitectónicamente correcta" sin medir el costo
contra el tamaño del problema.
**Quién lo cazó:** el dueño, preguntando *"¿es el mejor camino?"*.
**Qué lo evita ahora:** la regla de **la segunda mirada** (`docs/ESTANDAR.md` sección I): antes de
construir algo que toque plata o arquitectura, escribo el caso **en contra** de mi propia propuesta.

### Reporté mal el saldo de dos clientes
**Lo que dije:** que LUIS tenía $0 de saldo y RAFAEL $8.500.
**Lo que era verdad:** $9.000 y $100.000. **La base estaba perfecta; mi consulta venía cortada.**
**Por qué me equivoqué:** Supabase entrega **máximo 1.000 filas** y **no avisa**. Pedí los ~3.000
pagos de la flota y me dio el primer tercio sin error.
**Quién lo cazó:** yo mismo, porque los números no cuadraban con lo que había medido antes — pero
solo después de habérselos dicho al dueño.
**Qué lo evita ahora:** la trampa y la función paginada quedaron en
[[consultar-base-desde-el-navegador]]. 🔲 **Falta:** un candado que avise cuando una consulta
devuelve exactamente 1.000 filas — riesgo T6 en `docs/RIESGOS.md`.

### Dije "la flota está limpia" con una revisión que tenía un punto ciego
**Lo que dije:** el 22-sep, que los 5 chequeos de coherencia daban todo en cero y la flota estaba sana.
**Lo que era verdad:** era cierto **solo para lo que esos chequeos miran**. Había dos clientes con la
plata trabada y ninguno de los cinco lo veía (la fórmula hace `entra − sale`, y en una fila vacía
los dos lados son cero).
**Por qué me equivoqué:** confundí *"los chequeos pasaron"* con *"no hay problemas"*.
**Quién lo cazó:** el dueño, al día siguiente, pidiendo revisar una placa al azar.
**Qué lo evita ahora:** el chequeo #6 (mig 167). Y la regla de decir siempre **qué NO cubre** una
verificación, no solo qué cubre.

### Escribí en mi propio plan que el CI "ya existía"
**Lo que dije:** en el plan del estándar — *"`.github/workflows/ci.yml` ya existe; se le agregan los
tres candados"*.
**Lo que era verdad:** **no hay carpeta `.github/` en este repo.** No existe ningún CI: las 668
pruebas solo corren si yo me acuerdo de correrlas a mano.
**Por qué me equivoqué:** lo di por cierto desde **otro** archivo de instrucciones (el del sistema de
diseño, que describe otro repositorio) sin verificarlo contra este. Es decir: **creí un documento en
vez de mirar** — el error exacto que ese plan pretende arreglar, cometido dentro del plan.
**Quién lo cazó:** yo, al verificar antes de cerrar — pero recién a la cuarta vuelta de revisión.
**Qué lo evita ahora:** la regla de **medir antes de afirmar**, aplicada también a lo que escribo en
un plan. Y `npm run arranque`, que reportará el estado real en vez de dejarlo a la memoria.

---

## 24 de septiembre de 2026

### Mi propio script de verificación me dio siete falsos negativos
**Lo que mostré:** una tabla con **7 ❌** al verificar que `CLAUDE.md` ya no tuviera frases falsas.
**Lo que era verdad:** las 7 estaban en **0**. El error era de mi script: `grep -c` devolvía el
número en su propia línea y mi comparación leía un texto de varias líneas en vez de un número.
**Por qué me equivoqué:** escribí la verificación de apuro, en una sola línea de shell, en vez de
hacerla de la manera aburrida y legible.
**Quién lo cazó:** yo, al mirar los números al lado de los ❌ — pero se los mostré mal primero.
**Qué lo evita ahora:** las verificaciones que importan salen de un script con nombre
(`arranque.mjs`, `cierre.mjs`), no de una línea improvisada.

### Dije que `CLAUDE.md` quedaría en ~940 líneas y quedó en 966
**Por qué:** no conté el encabezado nuevo que yo mismo estaba agregando.
**Qué lo evita ahora:** nada, y no hace falta — fue una estimación anunciada como tal, no un dato
presentado como medido. Queda como recordatorio de decir "estimo" cuando estimo.

### 🔴 Afirmé que cobrar los $308.000 de la base estaba mal, sin haber verificado la otra cara
**Lo que dije:** *"esos $308.000 son el ahorro que él debía guardar y nunca guardó… es plata suya,
no un servicio que la empresa le prestó. La empresa no perdió nada, así que no hay nada que
cobrarle."* Lo dije como un hecho, con el respaldo de que `CLAUDE.md` los llama *"ahorro inicial"*.
**Lo que era verdad:** el sistema trata esos $308.000 como **plata de la empresa** de forma
coherente, por los dos lados: si no los pagaste te los cobra, y si los pagaste **no te los devuelve
como ahorro** (35 clientes, **$3.528.000**, medido). **No era un error del código: era una regla que
yo no conocía**, y que apunta al revés de lo que afirmé.
La regla real resultó ser una tercera que no estaba en ninguna parte y solo vivía en la cabeza del
dueño: *"es de la empresa si termina el contrato satisfactoriamente; si liquida sin finalizar, hay
que devolvérselos"* (**D-023**).
**Por qué me equivoqué:** verifiqué **una sola cara** de la regla. Miré qué pasa cuando el cliente
**no** paga la base, y de ahí saqué una conclusión sobre qué ES esa plata — sin mirar nunca qué pasa
cuando **sí** la paga. Con una sola cara, dos reglas opuestas se ven idénticas.
**Qué casi costó:** si hubiéramos arreglado solo la liquidación, quedaba una injusticia visible —
al que **no** pagó se le perdona, y al que **sí** pagó nunca se le devuelve. Y peor: al no conocer
la regla completa, no habría aparecido que `cuentaLiquidacion()` **no mira el motivo** y le devuelve
todo el ahorro al que termina bien — **$8.043.000**, con YESID BARRAZA a cinco semanas.
**Quién lo cazó:** yo, pero solo porque el dueño me hizo hacer un paso más. Su pregunta
*"¿qué diferencia haría cada opción?"* me obligó a explicar el mecanismo en vez de repetir la
conclusión, y ahí salió.
**Qué lo evita ahora — regla nueva:** cuando una cifra puede ser *"del cliente"* o *"de la
empresa"*, **no alcanza con mirar el caso en que no se pagó.** Hay que medir las DOS caras —
qué pasa cuando entra la plata y qué pasa cuando no — y si las dos apuntan al mismo lado, **ese es
el criterio que el sistema ya tiene**, y hay que preguntarlo antes de cambiarlo, no después.
