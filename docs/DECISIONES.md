# DECISIONES — qué se decidió, cuándo y por qué

> 🔴 **Este archivo SOLO SE AGREGA. Nunca se edita una decisión ya escrita.**
> Si una decisión cambia, se escribe una **nueva** que dice a cuál reemplaza. Así siempre se puede
> reconstruir *qué se pensó en un principio* y **por qué** cambió.

**Por qué existe** (23-sep-2026). `PROCESOS.md` dice *cómo funciona*, `RIESGOS.md` *qué puede
fallar*, `PENDIENTES.md` *qué falta*. Ningún archivo decía **"esto se decidió el día X, así, por
esta razón"** — así que las decisiones vivían dispersas en prosa y en planes sueltos. Y se
perdieron: `CLAUDE.md` todavía manda leer un plan con *"40+ decisiones confirmadas pregunta por
pregunta"* que **ya no existe**. Este archivo es para que eso no vuelva a pasar.

**Formato** — corto a propósito, o nadie lo escribe:

```
## D-000 · DD-mmm-AAAA · Título en una línea
**Decidió:** quién.
**Qué se decidió:** una o dos frases.
**Por qué:** el caso real que lo disparó.
**Consecuencia aceptada:** lo que se pierde o cambia (si aplica).
**Dónde vive:** archivo, función o migración.
**Reemplaza a:** D-XXX (o —).
```

⚠️ **Siembra incompleta.** Acá están las decisiones de esta semana y las reglas madre del dinero.
**Faltan las de junio a agosto**, que hay que rescatar de `CLAUDE.md`, de `docs/memoria/` y del
código. Está en `PENDIENTES.md`. Las del plan perdido que no se puedan reconstruir se marcarán
`⚠️ no recuperada` — sin inventar.

---

## Las reglas madre del dinero (sembradas el 23-sep desde `CLAUDE.md` y la memoria)

### D-001 · 30-jul-2026 · El crédito viejo salda primero lo viejo
**Decidió:** el dueño.
**Qué se decidió:** al aplicar un saldo a favor, primero baja la **deuda**, después la cuota.
**Por qué:** los pagos digitados con fecha anterior al corte de migración quedaban 100% en saldo a
favor, y al aplicarlos tapaban una semana que el cliente todavía no había pagado.
**Dónde vive:** `usePagos.aplicarSaldoFavor` (la rama de deuda, antes del reparto del motor).
**Reemplaza a:** —

### D-002 · 30-jul-2026 · Rodar tiempo: solo períodos COMPLETOS
**Decidió:** el dueño.
**Qué se decidió:** si a un cliente se le rueda tiempo, se rueda por semanas enteras. Nunca días
sueltos.
**Por qué:** textual — *"rodar 3 días de una semana descuadra muchas lógicas y cuentas"*.
**Consecuencia aceptada:** si la moto estuvo guardada 3 días, no se rueda nada.
**Dónde vive:** `contratos.cajas_exoneradas` · `ModalResolverTiempoFueraServicio` · mig 078.
**Reemplaza a:** —

### D-003 · 10-jul-2026 · Tarifa primero, ahorro de último
**Decidió:** el dueño (*"la lógica correcta que debimos hacer desde un principio"*).
**Qué se decidió:** cada peso que entra a la cuota cubre primero la parte de la empresa; solo los
**últimos** pesos son ahorro del cliente. Un abono parcial da $0 de ahorro.
**Por qué:** el reparto proporcional daba cifras torcidas ($13.333 de ahorro en un abono parcial).
**Dónde vive:** `calcularAhorroAplicado` en `cicloPago.ts`.
**Reemplaza a:** el reparto proporcional anterior (sin número; queda solo como respaldo para pagos
viejos sin `aplicado_ahorro`).

### D-004 · 12-ago-2026 · El saldo a favor se MUESTRA, nunca se resta solo
**Decidió:** el dueño.
**Qué se decidió:** el saldo a favor se ve al lado de lo que debe, pero **no se descuenta
automáticamente**. Se aplica a mano.
**Por qué:** la cifra que se cobra tiene que ser la que el funcionario le pide al cliente; mezclar
el saldo la volvía ambigua.
**Dónde vive:** `loQueDebe()` → `saldoAFavor` va aparte de `totalFalta`.
**Reemplaza a:** —

### D-005 · 8-sep-2026 · La multa de recolección es siempre $30.000
**Decidió:** el dueño.
**Qué se decidió:** $30.000 cada vez que se recolecta (no una sola vez de por vida). Solo varía si
hay que salir de la ciudad.
**Consecuencia aceptada:** ⚠️ hoy el sistema **no tiene dónde poner** ese valor distinto — sigue
pendiente.
**Dónde vive:** `MULTA_RECOLECCION` en `utils/inmovilizacion.ts`.
**Reemplaza a:** —

### D-006 · 9-sep-2026 · Las DOS cuentas de días no se mezclan
**Decidió:** el dueño.
**Qué se decidió:** *"días en mora"* (desde que le tocaba pagar y no lo hizo; **un abono parcial no
la reinicia**) manda para recolección y orden de la lista. *"Días desde su último pago"* es
informativa y **cualquier abono la reinicia**. Nunca usar una donde va la otra.
**Por qué:** la pantalla decía *"Xd sin pagar"* mostrando la segunda con el nombre de la primera.
**Dónde vive:** `diasEnMora()` · `zala.cliente.dias_mora` · `docs/DICCIONARIO-ESTADOS.md` parte 2.
**Reemplaza a:** —

---

## Septiembre 2026

### D-007 · 21-sep-2026 · CESAR (ZHO34G) y RAMON (RLI25H) quedan en pausa
**Decidió:** el dueño — textual: *"dejalos quietos"*.
**Qué se decidió:** no se retoman sus correcciones de tiempo rodado sin que él los saque de la pausa.
**Por qué:** necesitan que el cliente venga para reconstruir cuánto tiempo no tuvo la moto.
**Dónde vive:** `docs/PENDIENTES.md` P0, marcado ⏸️.
**Reemplaza a:** —

### D-008 · 22-sep-2026 · Los estados no se cambian a mano
**Decidió:** el dueño.
**Qué se decidió:** se quitan de la pantalla todos los controles que movían un estado a dedo (el
selector de Motos y los 2 botones de Contratos). Si hay que cambiar un estado, se hace por SQL con
él presente.
**Por qué:** textual — *"para que no hayan errores de clicks o intenciones no adecuadas que puedan
entorpecer el sistema y su veracidad operativa"*.
**Consecuencia aceptada:** un cambio legítimo de estado ahora requiere una sesión, no un clic.
**Dónde vive:** `MotosView` · `ContratosView` · [[estados-a-mano-y-evidencia-del-prestamo]].
**Reemplaza a:** —

### D-009 · 22-sep-2026 · El saldo a favor no puede ser negativo
**Decidió:** el dueño — *"¿por qué siquiera debería existir la posibilidad de que haya saldo a favor
negativo si se supone que saldo a favor es porque es A FAVOR?"*.
**Qué se decidió:** un candado en la base deshace cualquier operación que deje el saldo en rojo.
**Por qué:** KEVIN (RLY45H) estuvo **tres semanas en −$195.000** y la pantalla mostraba "$0", porque
el cálculo termina en `Math.max(0)`.
**Consecuencia aceptada:** rechazar o borrar un pago cuyo sobrante el cliente ya gastó **queda
bloqueado**, y hay que deshacer primero el uso del sobrante.
**Dónde vive:** mig 166 (`trg_saldo_favor_no_negativo`, diferido) · `saldo_favor_actual()`.
**Reemplaza a:** —

### D-010 · 22-sep-2026 · La empresa asume la semana de KEVIN ($195.000)
**Decidió:** el dueño.
**Qué se decidió:** no se le cobran los $195.000 que faltaban. Se exonera una caja
(`cajas_exoneradas 0→1`, `total_cajas 100→99`).
**Por qué:** se le había dicho que debía $600.000, pagó $795.000 para quedar tranquilo hasta el 27,
y el error fue nuestro. Textual: *"ya no se le puede decir que debe más"*. No requiere firma porque
el contrato termina el mismo día.
**Dónde vive:** SQL a mano, con rastro en `contratos_auditoria`.
**Reemplaza a:** —

### D-011 · 22-sep-2026 · La fecha de fin de contrato: las cuatro reglas
**Decidió:** el dueño.
**Qué se decidió:**
1. La fecha **solo se mueve al rodar** una semana con documento firmado. **No** se mueve por
   atrasos ni por pagar adelantado.
2. El **cliente ve una** fecha; el **funcionario ve las dos** (*"Pactado … · Con N rodadas: …"*).
3. Al editar el plazo: **mostrar el impacto y BLOQUEAR** si el cliente ya pagó más semanas de las
   que quedarían.
4. Manda la cuenta de las semanas, no la fecha escrita.
**Por qué:** *"¿cómo puede ser que se le muestre algo y se le cobre otra cosa?"*. Medido: 15 de 266
activos con la fecha descuadrada; 2 contratos con las semanas mal, los 2 únicos a los que alguien
editó los meses.
**Dónde vive:** 🔲 **sin construir.** La lista de 7 puntos de implementación **no está aprobada**.
`docs/PENDIENTES.md` P1 · [[fecha-fin-y-semanas-una-sola-verdad]].
**Reemplaza a:** —

### D-012 · 23-sep-2026 · No se aplica saldo a favor si el cliente no debe nada
**Decidió:** el dueño (eligió *"no dejar, y avisar por qué"* entre tres opciones).
**Qué se decidió:** si no hay nada pendiente que cubrir, el botón no crea nada y sale un aviso.
**Por qué:** el movimiento quedaba con todo en cero y el candado de la mig 160 lo contaba "en vuelo"
por su valor completo — **LUIS (IEW57I) estuvo 8 días sin poder usar sus $59.000** y RAFAEL
(DPU52I) 1 día con $100.000, mientras la ficha se los mostraba.
**Consecuencia aceptada:** ya **no se puede adelantar** con el saldo una cuota del acuerdo que
todavía no se le exige.
**Dónde vive:** `usePagos.aplicarSaldoFavor` (parámetro `debeHoy`, obligatorio) · mig 167.
**Reemplaza a:** —

### D-013 · 23-sep-2026 · Se arregla el candado, no se reescribe `aplicarSaldoFavor`
**Decidió:** el dueño, al preguntar *"¿es el mejor camino?"*.
**Qué se decidió:** en vez de mover la función a un RPC en la base, se le agrega **una condición** al
candado de la mig 160: que no descuente las filas donde el motor no aplicó nada.
**Por qué:** el RPC significaba reescribir en SQL lógica de plata que funciona (deuda-primero, saldo
dirigido a un convenio) empujado por un defecto chico. Es la lección de la mig 124.
**Consecuencia aceptada:** la raíz (que la función trabaje en dos tiempos) **queda abierta** en
`PENDIENTES.md`, para hacerse por su propio mérito y con calma.
**Dónde vive:** mig 167.
**Reemplaza a:** —

### D-014 · 23-sep-2026 · El número grande de un movimiento de saldo muestra las dos cifras
**Decidió:** el dueño (eligió la "Forma 3" entre tres dibujos).
**Qué se decidió:** cuando un movimiento cubre menos de lo que se mandó a aplicar, la tarjeta dice
**"$50.000 de $59.000"**, y debajo *de dónde vino*, *cuánto volvió a guardarse* y *cuánto queda*.
**Por qué:** la tarjeta decía "$59.000" arriba y "Convenio $50.000" abajo — **los $9.000 restantes no
aparecían en ninguna parte y nada decía de qué pago salió esa plata**.
**Dónde vive:** `src/utils/saldoFavor.ts` (`rastroSaldoFavor`, FIFO) · `CobrosView` · `lineaTiempo`.
**Reemplaza a:** —

---

## Decisiones sobre CÓMO TRABAJAMOS (no son del negocio, pero mandan igual)

### D-015 · 19-sep-2026 · Preguntar hasta que los dos entendamos lo mismo
**Decidió:** el dueño.
**Qué se decidió:** antes de construir, repetirle el plan **con sus números** y esperar el sí.
Preguntar el **porqué**, no solo el qué.
**Por qué:** hubo que escribir esta regla **dos veces** (19-sep y 23-sep) — señal de que no se
estaba cumpliendo.
**Dónde vive:** [[feedback-preguntar-hasta-que-quede-claro]].
**Reemplaza a:** —

### D-016 · 23-sep-2026 · Que no quede mocho
**Decidió:** el dueño — *"lo que no quiero es que ya yo piense que algo está listo y vamos a ver que
no"*.
**Qué se decidió:** **antes** de escribir la primera línea se acuerda qué significa TERMINADO, como
lista medible. Al cerrar se responde **una por una con el número real**, más lo que **no** quedó
cubierto.
**Por qué:** ese mismo día dije dos veces algo que resultó falso, y lo cazó él.
**Dónde vive:** [[feedback-nada-queda-mocho]] · el protocolo de cierre en `docs/ESTANDAR.md`.
**Reemplaza a:** —

### D-017 · 23-sep-2026 · Avisar al arrancar qué herramientas no conectaron
**Decidió:** el dueño — *"si las skills no estaban activas yo no me enteré, deja eso también como
regla"*.
**Qué se decidió:** toda sesión empieza reportando qué herramientas están caídas, en especial las
que el proyecto da por activas.
**Por qué:** ese día no conectaron **cinco** (`codebase-memory`, `context7`, `sequential-thinking`,
`mempalace`, `task-master`) y `CLAUDE.md` declara `codebase-memory` como *"SIEMPRE ACTIVA"*.
**Dónde vive:** `docs/ESTANDAR.md` → protocolo de arranque.
**Reemplaza a:** —

### D-018 · 23-sep-2026 · La memoria se respalda completa dentro del repo
**Decidió:** el dueño (eligió guardarla completa, con nombres de clientes).
**Qué se decidió:** los 125 archivos de memoria se copian a `docs/memoria/` y viajan en git.
**Por qué:** vivían solo en `C:\Users\USER\.claude\…`, sin respaldo. En esa misma carpeta ya se
perdió `sunny-brewing-island.md` con 40+ decisiones.
**Consecuencia aceptada:** el repo contiene nombres de clientes y montos — igual que
`PENDIENTES.md`, y el repo es privado.
**Dónde vive:** `npm run memoria:respaldar` · `docs/memoria/`.
**Reemplaza a:** —

### D-022 · 24-sep-2026 · Con acuerdo, la semana y la cuota del acuerdo son UNA sola cosa
**Decidió:** el dueño.
**Qué se decidió:** para un cliente con acuerdo activo, lo que se le exige cada día de pago es
**un conjunto**: la semana **+** la cuota del acuerdo — *"es como si su tarifa cambiara"*. Dentro
del conjunto se cobra **primero la semana y después el acuerdo**. Si el pago no alcanza, lo que
falte **se arrastra** al siguiente pago.
Textual: *"tomarlo como un conjunto para los que tienen convenio… y que si queda faltando algo que
se complete con el siguiente pago, pero que quede detallado ese movimiento de dónde se completó, y
creo que también los pagos digan qué cubre y de qué fecha a qué fecha"*.
**Por qué:** medido el 24-sep — **31 clientes están pagando y NADA llega a su acuerdo**. El motor
reparte las semanas vencidas primero, así que mientras haya una semana atrasada el acuerdo nunca
recibe. YAL68H pagó **$1.664.000 en 10 pagos** desde julio y su acuerdo sigue en cero. Los primeros
vencen el **12 y el 19 de octubre**, y al tercer acuerdo incumplido va liquidación obligatoria —
se estaría castigando a quien sí paga.
**Alcance:** ⚠️ **SOLO DE AQUÍ EN ADELANTE.** No se re-reparte ni un peso de lo ya pagado.
**Consecuencia aceptada:** las semanas avanzan un poco más lento (con $250.000 hoy avanza 1,24
semanas; con la regla nueva avanza 1), así que los contratos se alargan algo. La misma plata entra,
más tarde — coherente con que el contrato es **por pagos, no por tiempo**.
**Incluye además:** que cada pago diga **qué cubre y de qué fecha a qué fecha**, y que cuando una
cuota se complete con un pago posterior quede escrito de dónde salió ([[regla-esencia-y-rastro]]).
**Dónde vive:** 🔲 **sin construir.** Toca el motor de reparto — lo más delicado del sistema.
**Reemplaza a:** el orden de aplicación de `CLAUDE.md` (cuota → deuda → convenio → saldo) **solo
para los contratos con acuerdo activo**. Sin acuerdo, todo sigue igual.

### D-020 · 24-sep-2026 · Las herramientas se instalan en la máquina, no se bajan al arrancar
**Decidió:** el arquitecto (decisión técnica), tras el pedido del dueño de arreglar las caídas.
**Qué se decidió:** los servidores MCP se configuran apuntando al **programa instalado**, nunca a
`npx`, que los resuelve y descarga en cada arranque.
**Por qué:** medido — `context7` tardaba **34 segundos** en arrancar con `npx` y el límite son 30, así
que **nunca conectaba**. Instalado: **1 segundo**. `sequential-thinking` pasó de 7 s a 0 s. El único
que venía funcionando (`codebase-memory`) era justamente el único ya instalado.
**De paso:** `context7`, `codebase-memory` y `sequential-thinking` estaban declarados **dos veces**
(en `.claude.json` y en `.mcp.json`). Se dejó una sola declaración por servidor.
**Dónde vive:** `.mcp.json` (proyecto) · `~/.claude.json` (usuario). Copias de seguridad con fecha.
**Reemplaza a:** —

### D-021 · 24-sep-2026 · Se quita `task-master-ai`
**Decidió:** el dueño — *"no lo necesitamos"*.
**Qué se decidió:** sale de la configuración. El paquete queda instalado por si algún día se quiere
volver a poner.
**Por qué:** era para partir trabajos grandes en tareas numeradas con dependencias. **Nunca se usó**,
y el proyecto terminó resolviendo lo mismo mejor con `docs/PENDIENTES.md` — que además **el dueño
puede leer**, mientras que las tareas de Task Master viven en archivos que solo lee la máquina. Eso
contradice la regla de que él no dependa de que yo le traduzca. Además nunca conectaba: a los 20
segundos seguía inicializándose y buscaba su configuración en una carpeta que no existe.
**Consecuencia aceptada:** si algún día hace falta un desglose con dependencias, se hace a mano en
`PENDIENTES.md` o se vuelve a conectar.
**Dónde vive:** quitado de `~/.claude.json`.
**Reemplaza a:** la línea de `CLAUDE.md` que lo sugería para *"trabajo grande multi-etapa
dependiente"* — 🔲 hay que quitarla en el paso 2 del estándar.

### D-019 · 23-sep-2026 · `CLAUDE.md` es la especificación; la bitácora se muda
**Decidió:** el dueño.
**Qué se decidió:** las ~437 líneas de bitácora de julio salen de `CLAUDE.md` y se mudan a
`docs/HISTORIAL.md`. **No se borra nada.** Regla de oro: *si una frase puede volverse falsa sola con
el paso del tiempo, no va en `CLAUDE.md`*.
**Por qué:** ese 31% del archivo le dice hoy a cada sesión nueva que vamos por la migración 029
(vamos por la 167), que se trabaja en una rama que no existe, y que lea un plan borrado.
**Dónde vive:** 🔲 **pendiente de ejecutar** — `docs/ESTANDAR.md` paso 2.
**Reemplaza a:** —

### D-023 · 24-sep-2026 · 🔴 El ahorro es de la empresa SOLO si el contrato termina bien
**Decidió:** el dueño.
**Qué se decidió, textual:** *"es de la empresa si termina el contrato satisfactoriamente; o si
liquida sin finalizar, hay que devolvérselos"*.

O sea, **el ahorro es la alcancía con la que el cliente compra la moto**:
- **Llega al final y se lleva la moto** → esa alcancía ya se gastó comprándola. **Es de la empresa.**
- **Se va antes de terminar** → no compró nada. **La alcancía es suya y se le devuelve.**

Aplica a **todo** el ahorro: los **$308.000** de la base inicial **y** los $26.000 que deja cada
semana pagada.

**Por qué importa tanto:** de esta regla salen tres defectos que hoy están vivos, y apuntan para
lados opuestos. Medido el 24-sep:

| Cara de la regla | Qué hace el sistema hoy | Plata |
|---|---|---|
| Termina bien → es de la empresa | `cuentaLiquidacion()` **no mira el motivo ni una vez**: le devuelve todo el ahorro igual al que pagó sus 104 semanas y al que entregó la moto a los 7 días | **$8.043.000** en riesgo (YESID BARRAZA a 5 semanas con $3.801.000) · ya pasó una vez: ANGELICA PACHECO, LIQ-0007, $340.000 |
| Se va antes → se le devuelve | La liquidación **cobra** como deuda el convenio de base no pagado | **$2.289.000** en 7 liquidaciones |
| Se va antes → se le devuelve | Pagar el convenio de base **no suma al ahorro** del cliente | **$3.528.000** en 35 clientes |

**Consecuencia aceptada:** al que se va sin terminar y nunca pagó su convenio de base **no se le
cobra nada** por eso — cobrárselo sería cobrarle algo que en el mismo acto habría que devolverle.
Neto cero. (Es lo que destrabó a JORDAN: su saldo real es **+$64.000**, no −$244.000.)

**Dónde vive:** 🔲 **el código NO está arreglado.** Hoy solo se corrigió **un** caso a mano
(JORDAN / LIQ-0073, 24-sep, 7 de 7 verificado, 1 sola cifra movida en 362 contratos). Los tres
arreglos quedaron en `docs/PENDIENTES.md` → P0.
**Corrige la lectura de:** `CLAUDE.md`, que llama a los $308.000 *"ahorro inicial"* sin decir bajo
qué condición son del cliente. La plata es suya **condicionalmente**, y esa condición faltaba.
**Reemplaza a:** —

### D-024 · 24-sep-2026 · Se descarta el aviso «acuerdo sin recibir» (la mig 169)
**Decidió:** el arquitecto, con el sí del dueño.
**Qué se decidió:** **NO** correr la migración 169, y **borrarla del repo**. Queda solo esta
entrada como memoria de por qué.
**Por qué:** el aviso se escribió **antes** de tener el arreglo de fondo. Con la **mig 171** ya
corrida (D-022), el problema que el aviso iba a señalar **se arregla solo desde el próximo pago**.
Medido el 24-sep, de los **34 casos** que habría mostrado:
- **20 ya salían avisados** por la rama `acuerdo_sin_pagos` que ya existe (*"Acuerdo sin un solo
  peso — firmó hace N días y no ha entrado nada"*) o por `acuerdo_incumplido`.
- Los **14 restantes** son acuerdos recién firmados donde el cliente pagó **una semana exacta
  ($202.000)** y vencen en **39 a 83 días**: con el motor arreglado, el próximo pago ya les entra.

Sumar 34 avisos —20 duplicados— sobre los **351** que ya tiene la pantalla es **ruido que tapa lo
importante**.
**Consecuencia aceptada:** un cliente cuyo acuerdo no reciba por otra razón no tendrá un aviso
propio; lo cubre `acuerdo_sin_pagos`. Si algún día hace falta el matiz de *"está pagando y aun así
no le entra"*, se **mejora esa rama**, no se agrega otra al lado.
**La excepción que sí queda viva:** **RAUL GOMEZ SAN MARTIN** — su acuerdo vence el **12-oct** y
el arreglo no alcanza a salvarlo. Anotado en `PENDIENTES.md` → P0.
**Verificación pendiente:** el **1-oct**, comprobar que los 14 ya tienen abonos. Si no, el motor
necesita otra mirada.
**Regla que deja:** **un aviso nuevo se agrega solo después de medir cuántos casos NO cubre uno que
ya existe.** Acá eran 14 de 34, y de esos 14 ninguno necesitaba el aviso.
**Reemplaza a:** —

### D-025 · 25-sep-2026 · Las herramientas se configuran en el repo, no en cada máquina
**Decidió:** el arquitecto, con el pedido del dueño de *"dejar todo funcionando bien"*.
**Qué se decidió:** el arranque de las herramientas queda resuelto en **dos ajustes versionados**,
no en pasos manuales por PC:
- `.claude/settings.json` → **`"MCP_TIMEOUT": "120000"`**
- `.claude/settings.json` → **`enabledMcpjsonServers: [codebase-memory, context7, sequential-thinking]`**
- `mempalace` sale de `.mcp.json`: **ya viene como plugin** y estaba declarada dos veces.

**Por qué — eran DOS problemas distintos con el mismo síntoma**, y por eso el intento del 24-sep
(hacerlas más rápidas quitando `npx`) no alcanzó:

1. **Se pelean la máquina al arrancar.** Medido el 25-sep, el mismo servidor solo vs. acompañado:
   `codebase-memory` **132 ms → 13.198 ms** (100 veces más lento) · `sequential-thinking`
   **567 ms → 21.405 ms**. `superpowers` cruzaba los 30 s por defecto aunque solo arranca en 4,3 s.
   **No estaban rotas: no les daba el tiempo.**
2. **Las de `.mcp.json` nunca se aprobaron.** `claude mcp list` las mostraba
   *"⏸ Pendiente de aprobación"* — `enabledMcpjsonServers` estaba vacío desde siempre.
   Las que sí funcionaban (`codebase-memory`, `sequential-thinking`) era **porque además estaban
   declaradas en el `~/.claude.json` global**, que no pide aprobación.

**Cómo se comprobó:** `claude mcp list` antes y después. Antes: 2 pendientes de aprobación y
superpowers caída. Después: **las 6 conectadas, cero pendientes.**
**Consecuencia aceptada:** abrir una sesión puede tardar unos segundos más, porque ahora espera a
que arranquen todas en vez de rendirse a los 30 s.
**Regla que deja:** **cuando una herramienta no conecta, leer el registro antes de teorizar** —
`%LOCALAPPDATA%\claude-cli-nodejs\Cache\<proyecto>\mcp-logs-<nombre>\`. Ahí dice si fue tiempo,
si se murió, o si nunca la dejaron arrancar. Y **`claude mcp list` da el estado real de cada una**
sin tener que abrir una sesión nueva.
**Reemplaza a:** el arreglo del 24-sep (quitar `npx`), que era correcto pero solo la mitad.

### D-026 · 25-sep-2026 · 🔴 Nadie termina debiendo: se le agregan semanas hasta quedar al día
**Decidió:** el dueño.
**Qué se decidió, textual:** *"para cuando el tiempo del contrato termine y aún siga debiendo, se
debe colocar más tiempo en semanas dependiendo de lo que tiene pendiente hasta que quede
totalmente al día"*. Y de las dos formas que se le mostraron, eligió la **A**:
- **Sigue pagando su semana normal** (la misma de siempre, ej. YESID $235.000) y **todo va a lo
  que debe** (acuerdo + deudas). No se le cobra arriendo por esas semanas de más.
- **Cuando queda en $0**, recién ahí se liquida por cumplimiento y la moto pasa a ser suya.
- Descartada la **B** (pagar solo la cuota del acuerdo, $60.000): tardaba más del doble.

**Por qué:** D-023 (el ahorro del que termina pagó la moto) dejó al descubierto que el ahorro
tapaba las deudas en silencio. Sin esta regla, quien termina debiendo sale con liquidación
**negativa**, y el cierre lo manda a **lista negra** y no deja imprimir el Paz y Salvo — a alguien
que sí terminó su contrato. Caso con el que se decidió: YESID simulado a 65/65 → −$147.000.

**A quién le toca (medido el 25-sep):** YESID BARRAZA (60/65, debe $256.000 → 2 semanas de más) ·
LUIS FERNANDO SOLANO (98/104, debe **$1.455.200** → 8 semanas a $195.000) · RAMON BARON (ya
terminó, $1.509.000, en pausa por el dueño). JOSE GOMEZ y CESAR terminan en $0.
**Dónde vive:** 🔲 **el código NO lo hace todavía.** Hoy, al llenar la última semana, el sistema
deja de pedir la semana y solo cobra la cuota del acuerdo — es decir, hace la B. Plan en
`docs/PENDIENTES.md` → P0. **Fecha límite real: ~26-oct**, cuando YESID paga su semana 65.
**Reemplaza a:** —

### D-027 · 26-sep-2026 · Cómo se ven y se cobran las semanas de más (completa D-026)
**Decidió:** el dueño, pregunta por pregunta.
**Qué se decidió:**
- **Las semanas de más se cobran igual que cualquier semana:** gabela, mora, mensajes, llamada y
  recolección si no paga.
- **El pago va en el orden de siempre:** primero las deudas sueltas, después el acuerdo.
- **Opción A para la pantalla:** el número grande es lo que se le cobra ESA semana (su semana
  normal, o lo que falte si es menos) y debajo va *"Todavía debe $X en total"*. Se descartó la B
  (el total en grande): el cobrador vería una cifra que no le toca cobrar esa semana, y el número y
  la mora dirían cosas distintas.
- **Aprobó el plan de 4 pasos** ("listo dale") y quedó construido el mismo día: migs 173·174·175
  + `semanaDeCierre()` en `cicloPago.ts`.
**Por qué:** D-026 decía QUÉ (nadie termina debiendo); faltaba CÓMO se cobra y cómo se ve.
**Dónde vive:** `cicloPago.ts` (`semanaDeCierre`, `loQueDebe.cierre`, `etiquetaSemanaDeMas`) ·
`zala.semana_de_cierre()` · `zala.cuenta_contrato` · `zala.cliente` · `docs/DICCIONARIO-ESTADOS.md` C18.
**Reemplaza a:** —

### D-028 · 28-sep-2026 · Los días de mora saltan las semanas rodadas, y se subió en día de cobro
**Decidió:** el dueño, después de ver los casos de ORLANDO, LUIS ARMANDO, ELKIN y KEVIN.
**Qué se decidió:**
- **La mora cuenta desde la fecha corrida por las semanas rodadas**, igual que el monto. Si a un
  cliente se le rodaron N semanas, la semana más vieja que debe se le exige N semanas más tarde.
  Así nadie queda "en mora desde" un día en que la moto estaba en nuestra bodega o una semana que
  la empresa asumió (KEVIN, D-010).
- **Se subió el lunes en horas de cobro**, como excepción a la ventana del lunes y el miércoles.
  Se le explicaron los riesgos (Cartera sin abrir un rato, dos versiones a la vez, el número que
  cambia a media jornada) y eligió "apenas pase las pruebas": ese día a 6 clientes los estaba
  marcando en mora y a 4 les salió el mensaje de mora de ZALA.
- **JORGE LUIS TOVAR (ZIB64G)** pasa de $55.000 a $250.000 en pantalla y en ZALA: su semana
  estaba saltada (sin fecha) y solo se le cobraba el acuerdo. Es lo que exige el motor y lo que él
  pagó el lunes anterior. Único caso en los 371 contratos con motor.
**Por qué:** rodar (mig 078) ya restaba las semanas del CUÁNTO, pero no del DESDE CUÁNDO. El
monto y los días de un mismo cliente se contradecían ("debe 1 semana" y "13 días en mora").
**Dónde vive:** `cicloPago.ts` (`diasEnMoraV2`, `desgloseExigible`) · `zala.dias_en_mora_v2` y
`zala.cuenta_contrato` (mig 180) · `moraConSemanasRodadas.test.ts`. Espejo 325/0, foto de la plata 0.
**Reemplaza a:** —

### D-029 · 29-sep-2026 · En Reportes, un período se mide por cuánto se cumplió; el estado es de hoy
**Decidió:** el dueño, entre tres opciones (cumplimiento del período · cómo quedó cada cliente al
cierre · dejar el estado de hoy aclarado).
**Qué se decidió:**
- Al elegir un período, cada cobrador y cada grupo muestra su **cumplimiento**: de lo que vencía en
  ese período (semanas y cuotas de acuerdo), cuánto quedó pagado. El ranking de cobradores se ordena
  por eso y cambia con la fecha.
- **Si un cliente paga de más, cuenta hasta el 100% de lo suyo**; el resto sale aparte como
  "recuperó atrasos", para que un cliente que se pone al día no tape a otro que no pagó.
- Al día / gabela / en mora son **de hoy**, con la misma cuenta de Cartera, y la pantalla lo dice.
- Toda la plata del período queda en algún grupo y en algún cobrador (también la de clientes con la
  moto retenida y la de contratos ya cerrados): las partes suman el total.
**Por qué:** la auditoría del 29-sep (`docs/AUDITORIA-REPORTES.md`): cambiar la fecha no movía el
"al día" ni el ranking, había tres cifras de recaudado para el mismo mes, y "en mora" decía 187
cuando eran 65.
**Dónde vive:** `src/utils/reportesCifras.ts` · `src/pages/ReportesView.tsx`.
**Reemplaza a:** —

### D-030 · 2-oct-2026 · Días de mora del conjunto, recolección sin mínimo y la moto guardada no se recoge
**Decidió:** el dueño, en tres pasos (29-sep, 1-oct y 2-oct).
**Qué se decidió:**
- **Moto guardada** (taller, garantía, fiscalía, tránsito) y el cliente **sin moto prestada**: no
  entra a recolección, porque no hay moto que recoger. Sigue en mora, con mensajes y llamadas. En
  Cartera el paso del protocolo dice "Llamada (moto guardada)", y con plazo extra vigente no dice
  "Recolección física", para que el letrero coincida con la cola.
- **Con acuerdo, los días de mora se cuentan sobre el CONJUNTO** (semana + cuota del acuerdo, la
  misma idea de D-022): se suma todo lo que le falta y se mira desde cuándo lo debe.
- **Sin mínimo de plata para recolección**: lo que lleve más de 3 días de mora va, sean $2.000 o
  $200.000. Textual: *"si le faltaron $2.000 no pagó completo, y tienen que guardarlo o que
  cancele; no tendría que pasar al siguiente pago debiendo"*. Reemplaza el mínimo de una cuota que
  se había elegido el 29-sep.
**Por qué:** REGINALDO (IEW53I) estaba en la cola con la moto en garantía. REINEL (XYZ53H) debía 5
cuotas del acuerdo y cada día de pago salía "al día"; varios salían "en mora con 0 días". Contar
el acuerdo por separado tampoco servía: antes del 24-sep el motor metía la plata en las semanas y
el acuerdo no recibía nada, y JAIDER (YAC80H) habría salido con 58 días cuando como conjunto son 9.
**Medido el 2-oct:** la cola de recolección pasó de 36 a 55 (entran 21, salen REGINALDO y JAIRO
MARIMON). Ni un peso cambia. Pantalla y vitrina: 330 contratos, 0 diferencias.
**Dónde vive:** `diasDelConjunto` y `vaARecoleccion` en `src/utils/cicloPago.ts` · mig 182
(`zala.dias_conjunto`, `zala.se_puede_recolectar`) · pruebas en `src/utils/recoleccionYAcuerdo.test.ts`.
**Reemplaza a:** el mínimo de una cuota del acuerdo (decisión del 29-sep, nunca subida).

### D-031 · 2-oct-2026 · La nómina paga cada semana según cómo estaba el día del cobro, y trae todos los registros
**Decidió:** el dueño (opción A, 30-sep) y el arreglo de las 1.000 filas (2-oct).
**Qué se decidió:**
- Una semana rodada se exige más tarde. La nómina lo respeta **desde el día en que se registró la
  rodada**: lo cobrado antes sigue como estaba ese día (atrasado = $3.750); lo cobrado después, con
  la fecha corrida. Las fechas salen de `acuerdos_tiempo_rodado` y de la semana que asumió la empresa
  (KEVIN, 22-sep).
- La nómina trae los registros de cajas llenadas **por páginas**: Supabase entrega máximo 1.000 sin
  avisar, y desde la semana del 31-ago la pantalla y el desprendible mostraban mucho menos de lo real
  (Brandon, semana del 21-sep: $57.500 en vez de $402.500).
**Medido:** 5 semanas (24-ago a 27-sep), por las rodadas: Brandon +$11.250, Carlos Alvarez +$15.000,
Carlos Ariza +$7.500, Lumar −$3.750. Desprendibles impresos de la semana del 21-sep: renglones y
totales iguales a la pantalla ($2.017.500). Cuesta ~1 segundo más al abrir la pestaña Nómina.
**Dónde vive:** `src/utils/nominaCobradores.ts` (`rodadasDesdeRegistros`, `exoneradasAlDia`) ·
`src/hooks/useRodadas.ts` · `src/hooks/useCajasLlenadas.ts`.
**Reemplaza a:** —

### D-032 · 2-oct-2026 · En Reportes, "se pagó" y "se recuperó" cuentan solo plata; lo que pasó a un acuerdo va aparte
**Decidió:** el dueño (opción A).
**Qué se decidió:** una semana que se pasa a un acuerdo **no cuenta como pagada** en el cumplimiento
ni como "atrasos recuperados". Solo cuenta lo que se pagó con plata. Lo que pasó a un acuerdo se
muestra aparte ("pasado a acuerdo"), y el acuerdo cuenta a medida que el cliente paga sus cuotas.
**Por qué:** en septiembre, Por grupo decía "se cubrió $189.237.300" y "se recuperaron $55.070.300 de
atrasos": $244 millones cuando entraron $231.951.802. Las semanas financiadas por acuerdos firmados
en el período (el 1-oct, dos acuerdos se llevaron 5 semanas sin que entrara un peso) contaban como
llenadas. Lo pagado y lo recuperado nunca deben sumar más de lo que entró.
**Dónde vive:** 🔲 por construir — `cumplimientoDelPeriodo` en `src/utils/reportesCifras.ts`
(`llenasA` resta las `cajas_financiadas`, pero las cuenta como llenadas dentro del período).
**Reemplaza a:** precisa D-029 (el período se mide por cumplimiento): el cumplimiento es con plata.

### D-033 · 2-oct-2026 · "Retenidas" son las motos de contratos detenidos por no pagar que no tienen otro cliente, estén donde estén
**Decidió:** el dueño (opción A).
**Qué se decidió:** en Reportes, "retenidas por no pagar" = las motos de los contratos detenidos
(suspendidos) que todavía no tienen otro cliente, estén en el parqueadero, en el taller o en
fiscalía; al tocar el número se ve dónde está cada una. Las que ya trabajan con otro cliente cuentan
como "trabajando" (producen) y el cliente viejo sale aparte como "en liquidación".
**Medido el 2-oct:** 50 contratos detenidos → motos: 23 en el parqueadero, 16 en el taller, 1 en
fiscalía, 1 marcada disponible, 9 ya con otro cliente. Retenidas = 41, en liquidación = 9. Antes Flota
decía 23 (solo el parqueadero), el Resumen 50 y Por admin / Por grupo 45-46.
**Dónde vive:** 🔲 por construir — las filas de `baseGestion` en `ReportesView.tsx` y Flota.
**Reemplaza a:** —

### D-034 · 2-oct-2026 · El cliente con contrato andando y la moto en el taller va aparte: ni al día ni atrasado
**Decidió:** el dueño (opción A), confirmando su pedido del 22-ago (commit 642d478).
**Qué se decidió:** en Reportes, el cliente cuyo contrato sigue corriendo pero tiene la moto guardada
en la empresa (taller, garantía, fiscalía, tránsito) sale en su propia línea, "con la moto en el
taller", con lo que debe a la vista. No cuenta como atrasado ni entra al porcentaje del cobrador.
Sigue debiendo su semana (regla del 30-jul): esto es cómo se cuenta en los reportes, no cuánto debe.
**Por qué:** sin la moto no puede producir, y contarlo como atrasado le dañaba el porcentaje al
cobrador. El Resumen nuevo (3955e28) los contaba como atrasados — error mío del 2-oct: lo di por
decidido sin revisar el pedido del 22-ago. Medido el 2-oct: 4 clientes.
**Dónde vive:** 🔲 por construir — `baseGestion` y el Resumen en `ReportesView.tsx`.
**Reemplaza a:** —

### D-035 · 2-oct-2026 · A cada cobrador se le cuenta solo lo de sus motos desde que las tiene
**Decidió:** el dueño (opción A).
**Qué se decidió:** en Reportes, la plata y el cumplimiento de una moto cuentan para su cobrador
**desde la fecha en que se la asignaron** (`motos.subadmin_asignado_desde`). Lo que esa moto pagó
antes sale aparte ("además entraron $X de antes de que fueran suyas"), y lo que se le vencía antes
tampoco entra en su porcentaje. Los totales de la empresa y de cada grupo no cambian: esa plata entró.
**Por qué:** a 200 de las 346 motos con cobrador se les asignó su cobrador actual en septiembre. Ese
mes, $26.898.200 se le contaban a un cobrador que todavía no tenía la moto (Carlos Alvarez
$11.537.000, Carlos Ariza $11.588.200, Lumar $3.773.000). El sistema no guarda quién la tenía antes
(mig 058: solo la asignación actual), así que esa plata no se le puede atribuir a nadie.
**Dónde vive:** 🔲 por construir — filas de `baseGestion` y Por admin en `ReportesView.tsx`.
**Reemplaza a:** el aviso de Por admin "todo su recaudo aparece en el cobrador de ahora".

### D-036 · 2-oct-2026 · Las deudas de un acuerdo se quedan dentro de él aunque se venza
**Decidió:** el dueño ("si hazla").
**Qué se decidió:** cuando un acuerdo se incumple, sus deudas NO vuelven a cobrarse aparte: siguen
dentro del acuerdo, y lo que se cobra es lo que le falta al acuerdo (la regla del 17-sep, mig 157: el acuerdo vencido se sigue cobrando). ZALA ve el acuerdo vencido igual que la app.
**Por qué:** la mig 130 (7-sep) devolvía las deudas a 'pendiente' y las migs 157-159 (17-sep) seguían
cobrando el acuerdo: desde el 17-sep se cobraban las dos cosas. Medido el 2-oct: 6 clientes con
$2.718.000 de más (ARISMEL MUÑOZ RMY48H: $889.000 en vez de $447.000). Nadie había pagado todavía a
esas deudas devueltas.
**Dónde vive:** mig 183 (`convenio_incumplido_devuelve_deudas`, las 6 deudas, `zala.cliente`).
**Reemplaza a:** la mig 130 en su mitad "al incumplirse, las deudas vuelven a cobrarse".

### D-037 · 2-oct-2026 · Las semanas de cada cobrador, desde el 14-sep y con las motos que ya tenía
**Decidió:** el dueño (pidió mi recomendación y la aprobó: "Sí, y arregla la fecha").
**Qué se decidió:** en Nómina, "de cuántas motos le generaron pago" cuenta solo las motos que el
cobrador **ya tenía al empezar esa semana** (`motos.subadmin_asignado_desde`; sin fecha = de antes de
la mig 058). Las semanas de cada cobrador, juntas, se muestran **desde el 14 de septiembre** (las
últimas 6). Las semanas viejas se siguen viendo una por una, con un aviso de que se calculan con el
cobrador de hoy. Y en Motos, volver a escoger el **mismo** cobrador ya no le cambia la fecha.
La plata de la nómina no cambia: sigue saliendo de `nominaSemanaDetallada`.
**Por qué:** entre el 7 y el 13-sep se les puso fecha nueva a 176 de las 346 motos con cobrador, y no
se sabe si cambiaron de cobrador o se guardaron otra vez con el mismo (`asignarSubadmin` ponía la
fecha de hoy aunque el cobrador fuera el mismo). Según esas fechas, Carlos Alvarez y Carlos Ariza no
tenían motos antes del 7-sep, y la nómina de agosto, vista hoy, les contaba 41 y 43. Desde el 14-sep
el 93% de las motos ya tenía su cobrador de hoy.
**Dónde vive:** `EquipoReportes.tsx` + `ReportesView.tsx` (Equipo) · `useMotos.asignarSubadmin`.
**Reemplaza a:** "motos asignadas" contadas con las de hoy en cualquier semana.

### D-038 · 2-oct-2026 · Aprobar al cliente aprueba su visita
**Decidió:** el dueño ("Las dos cosas").
**Qué se decidió:** una visita hecha que no quedó marcada, cuyo cliente ya se aprobó (o ya recibió su
moto), cuenta como **aprobada** en Reportes, con la nota "se aprobó el cliente, no la visita". Si el
cliente sigue en "Pendiente evaluación", la visita sale como **esperando decisión**. Y desde ahora,
"Aprobar cliente" en la decisión final también marca la visita como aprobada. Las visitas viejas no
se tocan en la base: Reportes las lee con esta regla.
**Por qué:** hay dos botones para aprobar. "Aprobar visita" marca la visita; "Decisión final → Aprobar
cliente" aprobaba al cliente sin marcarla. Medido el 2-oct: 8 visitas sin resultado; 7 con la moto ya
entregada (MIGUEL ANGEL DIAZ, JAVIER POSSO, MARIA CONCEPCION TORRES, EVER LUIS DE LA ROSA, MANUEL
MENDOZA, MARGARITA LABIOSA, ROIMAN VILLALBA) y ORLANDO JAVIER FRANCO esperando la decisión. El pago
de esas visitas en la nómina estaba bien: la regla no pide resultado, se paga al entregar la moto.
**Dónde vive:** `resultadoDeVisita` en `ReportesView.tsx` (pantalla, Excel e impresión) ·
`DetalleClienteContenido` en `ClientesView.tsx`.
**Reemplaza a:** "sin anotar el resultado" para visitas cuyo cliente ya se aprobó.

### D-039 · 2-oct-2026 · Las motos vendidas se dan de baja, no se borran
**Decidió:** el dueño ("Darlas de baja", "Se vendieron", "cerrarlo y darlo de baja enseguida, que no
siga saliendo en las cuentas ni en ningún lugar que no deba", "Sí, hazlo así").
**Qué se decidió:** una moto que la empresa vende pasa al estado **"Vendida"**: sin cobrador, sin
fechas de SOAT ni tecno (quedan escritas en la nota), y sale de la lista de Motos (con un filtro
"Vendidas" para encontrarla), de la Flota y los Reportes, del Panel, del portal del socio, de la
nómina y de las listas para escoger moto. Su historia —contratos, pagos, liquidaciones— se queda y
se sigue viendo con la placa. Primeras: XYZ51H y YAV66H (PRADERA). El contrato de JESUS DAVID
SABALLET (YAV66H, suspendido) se cerró y él pasó a Retirado; sus $260.500 de deuda de migración
quedan anotados en el contrato cerrado, como los de los otros 20 clientes que salieron debiendo.
Las 14 semanas que el sistema le exigía a su contrato suspendido ($2.828.000) NO se anotan como deuda
(el dueño: "dejarlo así, eso no es del todo cierto"); al cerrar el contrato dejaron de contarse, y
"lo que se debe hoy" bajó $3.088.500 en total.
**Por qué:** borrarlas se llevaba la historia (el contrato y los pagos de BLEIMER, la LIQ-0053). Y
los avisos de SOAT del servidor no miran el estado de la moto: XYZ51H habría avisado en noviembre.
**Dónde vive:** mig 186 · `enLaEmpresa` en `useMotos.ts` · `dondeEstaCadaMoto` las salta.
**Reemplaza a:** la propuesta "Fuera de la empresa" de PENDIENTES (2-oct).

### D-040 · 5-oct-2026 · Se descarga donde se está viendo, y lo que baja es lo que se ve
**Decidió:** el dueño ("es lo más práctico, profesional y funcional?" → "Sí, con el ajuste").
**Qué se decidió:** cada sección de Reportes tiene su Excel y su PDF al lado del "Viendo:", con los
mismos filtros y las mismas cifras de la pantalla; ya no hay una pestaña "Descargar" aparte. Grupo y
cobrador se marcan de a varios y se combinan. El Excel sale en bloques: con un cobrador escogido, por
grupo; con un grupo, por cobrador (se puede cambiar). El PDF abre con la sección donde se está marcada
y las demás a un toque. Reportes recuerda pestaña, período y filtros al volver.
**Por qué:** "que la información quede centralizada y separada como estaba antes" — un supervisor
con motos de varios grupos tiene que poder ver solo lo suyo, y un grupo con varios supervisores
también. Y el informe estaba en otra pestaña, lejos de lo que se estaba mirando.
**Dónde vive:** `DescargarSeccion.tsx` · `BarraFiltros.tsx` · `EXCEL_DE_TAB` y `bloquesPor` en
`ReportesView.tsx`.
**Reemplaza a:** la pestaña Descargar del 2-oct y los botones de descarga sueltos de cada pantalla.

### D-041 · 6-oct-2026 · Los manuales señalan con números al borde y una línea, no con recuadros
**Decidió:** el dueño. Pidió señales "más gráficas, que hasta un niño que apenas sabe leer lo entienda";
vio una muestra con recuadros rojos y dijo "que se vea más profesional y no tan empachado"; con la
segunda muestra: "Sí, así en todas".
**Qué se decidió:** en las fotos del manual, cada cosa que se explica lleva un número azul oscuro al
borde de la foto con una línea fina hasta ella, y el mismo número en el texto; el botón que hay que
tocar lleva un anillo azul. La foto queda limpia: sin recuadros ni letreros encima.
**Por qué:** que se entienda sin leer mucho, sin que la foto quede cargada.
**Dónde vive:** `docs/manual-reportes/` (estilos `.call` y `.anillo`) · las medidas las toma
`capturas-reportes.mjs` (`SENALES`) y las pinta `poner-senales.mjs`. Los manuales que vengan, igual.

### D-042 · 6-oct-2026 · ANDRÉS BALLESTAS: se le perdona la deuda vieja y sigue con otra moto
**Decidió:** el dueño ("se le va a condonar la deuda para que quede al día", "A. Empieza de cero",
"cerremos en 0 y que los 150 queden ahí para la siguiente moto").
**Qué se decidió:** su liquidación LIQ-0032 se cierra en $0. Lo que debía al guardar la moto
($1.339.000: acuerdo y tarifas del sistema viejo) se perdona, cruzado con su ahorro ($910.000) y su
base ($300.000); los retrovisores ($35.000) tampoco se le cobran en la liquidación. Sigue con la empresa:
los $150.000 que dio el 6-oct son la base de su moto nueva. Su transferencia de $35.000 del 6-oct quedó
sin registrar a propósito.
**Por qué:** se le va a entregar otra moto y el dueño prefirió dejarlo al día que cobrarle una deuda
que el sistema nunca tuvo registrada (entró con COSTA sin empalme).
**Dónde vive:** el historial de su contrato (`contratos_auditoria`, notas del 6-oct) · mig 188 ·
`docs/PENDIENTES.md` (falta su firma). Es una decisión de UN caso, no una regla para los demás.

### D-043 · 6-oct-2026 · El cuaderno de la cartera: cada noche se anota cuánto se debía
**Decidió:** el dueño ("La cartera en una fecha pasada"; ante las dos formas de lograrlo: "Las dos
(Recomendado)"; y "Sí, empieza por el paso 1").
**Qué se decidió:** Reportes → Cobranza → Cartera va a poder mostrar cómo estaba la cartera un día
pasado, con un cuadrito "Día". Se hace de dos maneras:
1. **El cuaderno de cada noche** (hecho, mig 190): a las 11:55 p.m. de Colombia la base copia, contrato
   por contrato, lo que debía ese día (cuotas, acuerdo, deudas), su plata a favor y cómo iba (al día,
   gabela, mora, taller, retenida, en liquidación). Copia la MISMA cuenta de la pantalla
   (`zala.cliente` = `loQueDebe()`), no una nueva. Desde el 6-oct, cada día queda exacto.
2. **La cuenta hacia atrás** (pendiente, paso 2): solo para el 31-ago y el 30-sep, con la marca
   "calculado después (aproximado)". Antes de guardarla se compara contra las fotos de la plata del 24 y
   25-sep; si salen muchos mal, no se guarda. Antes del 22-ago no se puede (no hay `cajas_llenadas`).
**Lo que no sabe, y se dice en la pantalla:** anota lo que la app sabía esa noche (un pago de ese día
confirmado al otro día sale como no pagado), y los contratos Diario no traen cifra (hoy solo ADOLFO).
**Por qué:** la app nunca guardaba cómo quedaba la cartera cada noche; sin cuaderno, un día pasado solo
se puede sacar hacia atrás y aproximado. Cada noche sin cuaderno es un día que ya no se ve exacto.
**Dónde vive:** `supabase/190_cartera_del_dia.sql` (tabla `cartera_del_dia`, `anotar_cartera_del_dia()`,
`cartera_fechas()`, reloj `cartera-cada-noche`) · la pantalla en la rama `wip/cartera-del-dia`
(`useCarteraDelDia.ts`, `utils/carteraDelDia.ts`, `ReportesView.tsx`, `CobranzaReportes.tsx`,
`BarraFiltros.tsx`). Quién lo lee: los mismos que pueden ver ese contrato (la regla de `contratos`).
ZALA no lo lee.

### D-044 · 6-oct-2026 · Rodar por deuda: a unos pocos clientes que deben más de $700.000
**Decidió:** el dueño, pregunta por pregunta, la noche del 6-oct ("solo semanas completas" · "siempre
una más hasta la 4ta y de ahí en adelante por cada dos más una adicional" · "semanas normales" · "si se va
antes se le cobra lo rodado sin el recargo" · "las deudas de repuestos no se ruedan en tiempo" · "solo yo o
Sergio ya después de la capacitación" · "también debe decir en el video la fecha del día").
**Qué se decidió:**
1. **Para qué:** que a unos pocos clientes con deudas grandes no les siga saliendo esa deuda en mora; se
   les cobra al final del contrato, con un poco más por el desgaste extra de la moto.
2. **A quién:** solo contratos **Activos y semanales**, que deban **más de $700.000** en total. Ni retenidos
   ni en liquidación. **Una sola vez por contrato.** No a CESAR (ZHO34G) ni a RAMON (RLI25H), que están quietos.
3. **Qué se rueda: solo lo que es TIEMPO** — semanas atrasadas del contrato, deudas de `tarifa_atrasada` y
   de `migracion`. **NO se ruedan** (son plata y se siguen cobrando en plata): préstamo de repuesto,
   préstamo por eventualidad, daño del vehículo, alquiler de la moto prestada (su cuenta nunca se mezcla),
   multa de recolección y lavada.
4. **Solo semanas completas:** lo rodable se pasa a semanas enteras del valor semanal; lo que sobra (menos
   de una semana) lo paga ahora.
5. **Las cuotas atrasadas del acuerdo de pago** no se pasan a las semanas del final: se **corren al final
   del mismo acuerdo** (mecanismo `periodos_exonerados`, mig 118), que sigue andando con su cuota.
6. **La regla de las semanas de más:** hasta 4 semanas rodadas, **una más**; desde la 5ª, **una más por
   cada 2 semanas completas** (el par incompleto no suma). 3→4 · 4→5 · 5→6 · 6→8 · 7→9 · 8→11 · 10→14.
7. **Son semanas normales** (con su ahorro, igual que cualquier semana).
8. **Si se va antes de terminar:** en la liquidación se le cobra lo rodado, **sin el recargo** (esas
   semanas las usó; el recargo era por usar la moto más tiempo).
9. **Quién:** permiso nuevo "Rodar por deuda", de entrada **solo ADMIN_PRINCIPAL**; a Sergio se le prende
   después de la capacitación, desde Usuarios.
10. **Documento** con las cifras, la fecha aproximada de fin y la advertencia de que **la empresa no cubre
    SOAT ni tecnomecánica durante el tiempo extra**; lo firma el cliente (y su acompañante si tiene).
11. **Video obligatorio** (máximo 1 minuto), grabado en la app, donde el cliente dice **la fecha del día**,
    que acepta el rodado, cuántas semanas debía, cuántas pagará y la fecha aproximada de fin.
12. **Rastro:** ficha del cliente, historial del contrato (quién, cuándo, cifras, documento, video) y marca
    en Reportes.
**Por qué así:** usa los dos mecanismos probados desde agosto (`cajas_exoneradas` y `periodos_exonerados`)
y no toca la cuenta de los demás clientes; lo único nuevo es pasar deudas de tiempo a semanas del final.
**Dónde vive:** `supabase/191_rodado_por_deuda.sql` (tabla `rodados_por_deuda`, `calcular_rodado_por_deuda`, `aplicar_rodado_por_deuda`, `rodado_pendiente_liquidacion`, vista `zala.rodado`) · `ModalRodadoPorDeuda.tsx` (Contratos → el contrato → «Rodar por deuda») · `utils/rodadoPorDeuda.ts` (documento, lo que dice el video, la regla 4→5 con pruebas) · la liquidación agrega lo rodado sin pagar (`useLiquidaciones`).
**Medido el 6-oct con la vista previa:** 9 de los 10 contratos activos que deben más de $700.000 se pueden rodar; RAMON BARON (RLI25H) no (su contrato ya pasó su total de semanas: el candado lo detiene; además está quieto).
**Subida de madrugada del miércoles 7-oct (día de cobro):** autorizada por el dueño ("hagamos todo hoy, debemos dejar todo listo y bien hecho antes de la presentación"). El módulo no cambia ninguna cuenta hasta que alguien lo usa, y de entrada solo él puede usarlo.

### D-045 · 8-oct-2026 · Cada cobrador en cada grupo: un cuadro, con un lugar dueño
**Decidió:** el dueño ("hazlo así"), después de pedir que se viera en Equipo las motos de cada uno por
grupo y en Flota quién tiene las de cada grupo, y de preguntar si era "lo más práctico, óptimo y
profesional".
**Qué se decidió:**
1. **Un solo cuadro** cobradores × grupos, con un selector de vista: Motos, Paradas, Debe hoy (de hoy),
   Recaudado y Cumplimiento (del período escogido). Cada vista dice de qué fecha es.
2. **Su lugar dueño es Portafolios › Cruzado** (pestaña nueva), con las 5 vistas y su Excel (una hoja por
   vista). **Flota › Motos** lo muestra solo con Motos y Paradas. **Equipo › Nómina no lo repite**: en
   "Por cobrador" lleva un enlace «Ver sus motos por grupo».
3. **No hay cuentas nuevas:** reparte las mismas filas de Flota, Cobranza y Portafolios. Lo pagado antes
   de que la moto fuera del cobrador de hoy (D-035) va en su propio renglón, «Antes de asignar».
4. **Tiene que cuadrar:** cada columna da lo mismo que "Por grupo" y cada fila lo mismo que "Por cobrador".
   La tarjeta compara Motos/Paradas contra Flota y Debe hoy contra Cobranza, y avisa si no cuadran.
5. El Excel de Flota trae dos columnas más: **Debe hoy** y **Días en mora**, del cliente que tiene la moto.
**Por qué así:** cada pregunta con un lugar dueño evita tablas repetidas que empujan lo demás en el
celular; una sola pieza en dos pantallas no puede dar dos cifras distintas.
**Medido el 8-oct, al construirlo:** las 5 vistas cuadraron cifra por cifra con Portafolios (por grupo y
por cobrador), Flota y Cobranza. El total "Debe hoy" del Excel de Flota es menor que el de Cobranza en
$14.271.500: son 11 clientes cuya moto ya tiene otro cliente (10 en liquidación y 1 retenida); el archivo
lo explica en su leyenda.
**Dónde vive:** `utils/reportesCruzado.ts` (+ 13 pruebas) · `components/reportes/CuadroCruzado.tsx` ·
`ReportesView` (pestaña `cruzado`, `abrirCeldaCruzado`, `excelCruzado`, columnas nuevas de `excelFlotaMotos`).
**Reemplaza a:** —

### D-046 · 8-oct-2026 · Al liquidar, al cliente se le da todo lo que es justo, y explicado
**Decidió:** el dueño, revisando la liquidación de BRADER GUZMAN WATSON (YAL65H, LIQ-0078): *"todo lo que en
realidad sea justo de él hay que dárselo, pero todo debe quedar bien explicado"*.
**Qué se decidió:**
1. **Lo abonado de verdad a un acuerdo se descuenta**, aunque no complete una cuota. (La liquidación contaba
   solo cuotas completas: a BRADER le ignoraba $8.000.)
2. **Una semana rodada no se cobra como "días que usó la moto"**: estaba guardada en la empresa. (La cuenta de
   salida recorre el calendario y no miraba las rodadas. Cierra la pregunta abierta desde el 29-sep,
   `docs/REVISION-29SEP.md`.)
3. **El ahorro de las semanas metidas en un acuerdo se le devuelve** cuando la liquidación le cobra ese acuerdo
   entero: con su ahorro está pagando esas semanas. (Regla del 13-ago: el ahorro se gana al pagar el acuerdo.)
4. **El cliente recibe la explicación por escrito**: sus pagos uno por uno, qué pasó con cada acuerdo, lo que
   ahorró y cómo queda (estado de cuenta de una página, `docs/estados-de-cuenta/`, fuera de git).
**El caso que lo destapó:** BRADER, sistema −$447.500 → justo −$237.500 ($8.000 + $176.000 neto de la semana
rodada + $26.000). Sus dos acuerdos cuadran al peso: el primero ($943.500, 8-ago) se rehízo el 8-sep y el
nuevo ($1.008.500) reunió lo que ya debía por fuera (semana 30 y lavada): antes debía $1.012.500, después
$1.008.500.
**Falta:** que el sistema lo haga solo (PENDIENTES P0) — medir antes cuántas liquidaciones lo tienen.
**Reemplaza a:** —

### D-047 · 9-oct-2026 · Lo que trae el equipo se paga en la nómina y no suma premios de referidos
**Decidió:** el dueño, al ver que cinco supervisores salían con premios pendientes en Referidos: *"para ellos
los referidos se manejan de otra manera y se les pagan aparte como en las visitas en la nómina"*.
**Qué se decidió:**
1. **Si a un cliente lo trajo alguien del equipo** (`clientes.referido_por_funcionario`, mig 153), ese referido
   **no cuenta para el programa de premios** (guantes, intercomunicador, casco, combo). Se paga en la nómina
   ($30.000 cuando el cliente recibe la moto), como hasta hoy.
2. **Referidos tiene una lista por fecha**, contando por el día en que el referido **recibió la moto** (por
   defecto: es cuando cuenta y cuando paga la nómina) o por el día en que **se registró** — el dueño pidió las
   dos. Se filtra por quién lo trajo: clientes, equipo o cada supervisor.
**El caso que lo destapó:** los 48 clientes que trajeron los supervisores también estaban anotados con la
cédula del supervisor como "referido por". Así Lumar y Johan llegaban al casco, Carlos Alvarez al
intercomunicador, Brandon y Carlos Ariza a los guantes. No se había entregado ninguno. Con la regla: 40
personas que refieren (antes 48), 49 referidos (antes 97), 8 premios alcanzados (antes 18), todos guantes.
**Dónde vive:** `utils/referidosPorFecha.ts` (+ 9 pruebas) · `components/ReferidosPorFecha.tsx` ·
`ReferidosView` (`esDelEquipo` en el conteo de premios, en "sin cédula" y en "referidos activos").
**Reemplaza a:** —

### D-048 · 9-oct-2026 · En Reportes vuelven a salir los que pagaron una parte
**Decidió:** el dueño: *"vamos a colocar como antes que salgan los que pagaron parcial"* (escogió la regla "1" y el
lugar "1").
**Qué se decidió:**
1. Los que están **en mora hoy** (la misma cuenta de Cartera) se parten según el período escogido:
   **Parcial** = entró plata suya en el período · **No pagó** = no entró nada. El saldo a favor aplicado no cuenta
   como plata que entra. No cambia quién está en mora ni sus días.
2. Sale en **la pantalla** (Resumen → «Cómo están los clientes»: «Pagaron una parte» y «No pagaron nada», debajo de
   «En mora», hoy y al cierre del período), en **el Excel** por cobrador y por grupo (columna «Estado hoy» y hoja
   Resumen) y en **el PDF** del informe (tabla de estados y la lista completa de mora, con lo que pagó).
**El caso que lo destapó:** su Excel de Carlos Alvarez del 9-oct decía «En mora» igual para RAFAEL VEGA, que pagó
$244.000 y le faltan $3.000, que para JOSE JOSE LARA, que no pagó nada. Medido el 9-oct: 132 en mora → esta semana
83 Parcial y 49 No pagó; este mes 114 y 18.
**De paso:** el aviso «N en la cola de recolección» leía la fila de estados por su lugar (`estadosR[3]`); con la
fila nueva habría dicho 83 en vez de 37. Ahora la busca por su nombre.
**Reemplaza a:** la mora sin partir del 29-sep (`b1c2e53`), solo en cuanto a mostrar si pagó algo.

### D-049 · 10-oct-2026 · El acuerdo se cobra antes que las deudas sueltas (solo pagos nuevos)
**Decidió:** el dueño: *"ya para todos el reparto de un pago debe ser primero a la semana, después a lo que pactó
de convenio para que queden juntos y ya de último las deudas y demás que ya definimos"*. Escogió **dejar lo ya
repartido como está** y cambiar solo los pagos de ahora en adelante (se le mostró qué pasaría rehaciendo todo:
semanas, ahorro, recibos, nómina y liquidaciones cerradas dejarían de cuadrar; lo que debe cada uno no cambia).
**Qué se decidió:** orden de cada pago = semana → su cuota del acuerdo (D-022, ya así desde el 24-sep) → **las
cuotas del acuerdo que quedaron atrasadas** → deudas sueltas (multa → lavada → antiguas) → saldo a favor. Con la
moto retenida, la multa y la lavada siguen primero. También en las semanas de más (D-026 no había fijado el orden).
**El caso que lo destapó:** JUAN CARLOS LEAL (YAL68H): 8 cuotas del acuerdo atrás porque de agosto al 25-sep su
plata se repartió con la regla vieja (todas las semanas primero); desde el 30-sep ya va semana + cuota. El dueño:
lo de él se deja así (se le va a rodar o resolver aparte). Medido el 10-oct: 136 con acuerdo, 43 con cuotas atrás
sin su semana, 4 de ellos con deudas sueltas (JONATHAN KENDRI, LIBINTO PATERNINA, JARLIN ORTIZ, OSVALDO MONCARIS).
**Dónde vive:** mig 197 (parche de la función viva `aplicar_pago_confirmado`, con prueba de JONATHAN adentro) ·
espejo `repartirPagoV2` en `src/utils/repartoPago.ts` (+3 pruebas, 3 actualizadas).
**Reemplaza a:** el orden «cajas → deuda → convenio» de la especificación del 11-jul y el de D-022 (deudas antes
del acuerdo atrasado).

### D-050 · 22-oct-2026 · Rodar por deuda: se puede rodar TODO, también el acuerdo entero (sin construir)
**Decidió:** el dueño, con el caso de OMAR AGUSTIN RODRIGUEZ BUSTO (RMM66H): *"vamos a rodar todo hasta lo que no
se ha vencido del convenio, todas las deudas son todas"* · recargo: «1» = sobre todo, con la regla de siempre ·
*"la huella siempre debe ir"*.
**Qué se decidió:** además del rodado de D-044 (semanas atrasadas + cuotas atrasadas del acuerdo corridas al final
del mismo acuerdo), se puede rodar en un solo conjunto **lo que le falta al acuerdo completo** (también las cuotas
que no han vencido): el acuerdo se cierra y todo pasa a semanas al final del contrato, con el recargo de siempre
sobre el total. El documento del rodado lleva **la huella** del registro del cliente (sin huella no se firma); la
firma del acompañante es opcional. Con Omar (cifras del 22-oct): $3.064.000 → 15 semanas, al final paga 21.
**Por qué:** que al cliente le quede solo su semana desde el lunes siguiente, sin la cuota del acuerdo encima.
**Estado:** NO construido (se paró para migrar el proyecto al disco). Diseño y lo medido en `docs/PENDIENTES.md`
(bloque rojo de arriba). Omar firma cuando esté listo.
**Reemplaza a:** D-044 punto 5 (las cuotas del acuerdo se corrían al final del mismo acuerdo), solo cuando se
escoge rodar todo.

### D-051 · 21/22-oct-2026 · Las cuentas para pagar salen de MotoGestión; COSTA solo el Nequi
**Decidió:** el dueño: *"coloca que solo mande el nequi de costa, que la cuenta bancolombia no la mande"*,
*"solo muéstrale lo que te digo"* y *"terminemos lo de las cuentas para que ZALA quede bien"*.
**Qué se decidió:** ZALA lee las cuentas de `zala.cuentas_pago` (solo las encendidas en Configuración → Cuentas
bancarias; apagar una la saca al instante) y no de una lista propia. COSTA: solo Nequi 3128317132 (Yeiner Acosta);
la Bancolombia 78400006116 queda apagada.
**Dónde vive:** mig 200 · `docs/ZALA-CUENTAS-PARA-PAGAR.md` (los dos cambios que faltan del lado de ZALA: que su
protección deje pasar los `numeros` de la vista y que conteste con ella). Escribir el Nequi con un espacio no
sirvió (probado con JOHAN ANDRES PEREZ el 21-oct).

### D-052 · 23-oct-2026 · Rodar todo: el pedazo que sobra se rueda si es de $100.000 o más
**Decidió:** el dueño, con el caso de OMAR AGUSTIN (RMM66H), al construir D-050: *"lo ideal es que cuando el cliente
llegue a hacer esa gestión lo que le sobre debe cancelarlo entonces dejémoslo más equitativo y que se le ruede la
semana cuando sea 100 o más y cuando sea menor a 100 que los pague el mismo día de la gestión o que le quede como
saldo negativo"* · y antes: *"agreguémosle solo la adicional o la que quedó mocha"* (la semana del pedazo no suma
recargo) · *"Confirmo la regla así"*.
**Qué se decidió (rodar todo):** (1) se suma todo lo que debe en tiempo, como un solo conjunto: semanas atrasadas +
lo que le falta al acuerdo entero + deudas de tiempo sueltas; (2) se cuentan las semanas completas; (3) el recargo sale
de esas semanas completas, con la tabla de D-044; (4) el pedazo que sobra: **$100.000 o más → una semana completa
más, sin recargo**; menos de $100.000 → lo paga el día de la gestión o le queda como deuda pendiente; (5) el mínimo de
$700.000 se mide con todo lo que debe. Si se corre una semana que estaba a medio pagar, lo ya abonado pasa a su
próxima semana (no se cobra dos veces).
**Con Omar:** debe $3.064.000 → 15 completas, sobran $139.000 → 16 rodadas + 6 de recargo = **22 al final**; hoy $0;
su próxima semana $147.000 (los $48.000 que ya tenía abonados pasan ahí); al final paga $8.000 más de lo que debía.
⚠️ En el chat del 23-oct le dije primero «el lunes $195.000 y $56.000 de más»: estaba mal, contaba dos veces sus
$48.000. Lo correcto es lo de esta línea.
**Dónde vive:** mig 201 (`_calcular_rodado_todo`, `calcular_rodado_por_deuda(…, p_todo)`,
`aplicar_rodado_por_deuda(…, p_todo)`; el acuerdo queda en estado `rodado`) · `ModalRodadoPorDeuda` (botón «Rodar
todo», huella del registro obligatoria) · `htmlRodadoPorDeuda` · pruebas en `rodadoPorDeuda.test.ts`.
**Reemplaza a:** D-044 «solo semanas completas; lo que sobra se paga ahora», solo cuando se escoge rodar todo.

### D-053 · 23-oct-2026 · Acta de entrega: paso final del wizard, con las firmas del contrato
**Decidió:** el dueño: *"cuando se entrega un vehículo por primera vez se genere un documento como un acta de
entrega y un breve resumen del contrato y sus políticas más importantes, que lo firmen como paso final del
wizard, y que quede en los documentos para descargarlo"* · *"que el acta quede con las firmas iniciales para que
no sean tantas firmas"* → escogió «1»: las del contrato (paso 3) · *"y que salga también la información del
acompañante"* · aprobó la lista de 10 condiciones con el punto del ahorro según D-023.
**Qué se decidió:** paso 7 del wizard. El acta (lo que recibe, cliente y acompañante con sus datos, lo pactado,
las 10 condiciones, checklist, 6 fotos, firmas del contrato + huellas del registro) se guarda en PDF ANTES de
activar el contrato; sin acta guardada el contrato no se activa. Solo entregas nuevas: las viejas quedan sin acta.
**Dónde vive:** mig 202 (`contratos.acta_entrega_pdf_url`) · `generarHTMLActaEntrega` y `condicionesActaEntrega`
en `useDocumentos.ts` · `WizardContrato` paso 7 · Documentos del contrato, ficha del cliente y Reportes → Entregas
(chip que no cuenta para «documentos completos») · pruebas en `actaEntrega.test.ts`.

### D-054 · 23-oct-2026 · Candados contra repetir: en la base Y en el botón
**Decidió:** el dueño (pedido del 10-oct: *"todo botón bloqueado contra doble clic y que las peticiones no se envíen
dos veces"*); el 23-oct propuso *"que los botones digan cargando mientras hace el proceso"* y escogió «1»: las dos cosas.
**Por qué las dos:** medido el 23-oct, las copias NO fueron doble toque: el botón de tiempo guardado ya se bloqueaba
y aun así hubo 9 decisiones repetidas (de 1 s a 4 min; dos personas a la vez en 2 casos), y una transferencia de
$195.000 registrada dos veces con la misma referencia 70 s después (BRAZON, 13-oct). El botón frena el toque rápido;
solo la base frena la segunda vez, la otra persona y la misma consignación.
**Qué se decidió:** (1) el tiempo guardado se resuelve UNA vez por contrato y fechas; cambiar la decisión, un
administrador; (2) una referencia de transferencia, un solo pago (se RECHAZA, como el saldo a favor; de 3.158
referencias nunca hubo un uso legítimo doble); (3) después: recepción, abonos a la base, liquidación y deudas a
mano; (4) un solo botón de guardar para toda la app que dice «Guardando…» y se bloquea. Las copias que ya existen
no se tocan solas: las decide la oficina.
**Dónde vive:** mig 203 (`tiempo_guardado_una_vez`, `referencia_una_vez`) y mig 204 (`recepcion_una_vez` 30 min,
`abono_base_una_vez` 10 min, `liquidacion_una_abierta`, `deuda_una_vez` 10 min), cada una con su prueba adentro.

### D-055 · 23-oct-2026 · Recepciones y tiempo guardado: una sola lista que se entera al momento
**Decidió:** el dueño: *"haz el arreglo así: la lista compartida que se refresca al guardar y la migración que prende el
aviso en las 3 tablas"*.
**Por qué:** 8 de las 9 decisiones de tiempo guardado repetidas salieron de Inmovilizaciones › Devolver moto. JORGE BELLO
(RLT88H, 2-oct, Sergio): resolvió 10:33:24 p.m., entregó 10:34:29, y repitió las dos cosas 10:34:46 y 10:35:54. La moto
seguía saliendo «retenida · tiempo por resolver» porque (1) cada una de las 14 pantallas que leen estas tablas tenía su
propia copia y la que guardaba solo refrescaba la suya, y (2) la base no avisaba: `recepciones_vehiculo`,
`acuerdos_tiempo_rodado` e `historial_ubicaciones` no estaban en `supabase_realtime` (medido el 23-oct).
**Qué se decidió:** las tres tablas pasan al store compartido (`createTableStore`, el mismo de pagos y contratos) y cada
escritura lo refresca antes de devolver; la mig 205 prende el aviso para los demás celulares.
**Dónde vive:** `useUbicaciones.ts` · mig 205. Los candados de la mig 203/204 siguen frenando la repetición en la base.

### D-056 · 27-oct-2026 · La primera cuota del acuerdo se guarda al firmar; la nómina cuenta cuotas igual que Cartera
**Decidió:** el dueño: *"cuando se firma el acuerdo, ¿no se dice ahí mismo cuándo le toca cancelar la siguiente tarifa?
Debe ser igual a eso"* y *"Sí, apruebo los 4 puntos"*.
**Por qué:** DQL76I (EVER LUIS DE LA ROSA, cobrador Carlos Ariza) pagó completo cada lunes y la nómina le pagaba las
semanas como atrasadas o "no pagó". La nómina contaba las cuotas del acuerdo por su cuenta (semanas desde la firma) y no
sabía del prorrateo ni de las semanas cubiertas: a 91 de 201 contratos con acuerdo les pedía una cuota de más. En 10
semanas, $956.250 menos a los cuatro cobradores. La fecha límite tenía el mismo defecto: a 72 de 171 acuerdos les quedó
una semana corta y 11 se marcaron INCUMPLIDOS el 27-oct con su última cuota el 2-nov.
**Qué se decidió:** (1) `convenios.fecha_primera_cuota`: la ventana del acuerdo la propone con la cuenta de Cartera y se
puede cambiar; Cartera, nómina y ZALA cobran desde la guardada. (2) La fecha límite se cuenta desde la primera cuota.
(3) Los acuerdos existentes se rellenan con la fecha que Cartera ya cobraba (1.338 cuentas comparadas: lo que debe cada
cliente no cambia) y a los 72 se les alarga la fecha límite; los 30 que la tenían más tarde no se tocan. (4) Los 11
vuelven a activo. Sin fecha guardada, un acuerdo firmado en día de pago empieza el día de pago siguiente (antes Cartera
lo cobraba ese mismo día; 0 casos al decidirlo).
**Dónde vive:** `cicloPago.ts` (`cuotaConvenioDelPeriodo`, `primeraCuotaConvenio`, `ultimaCuotaConvenio`,
`periodosConvenioCorridos`) · `nominaCobradores.ts` · `ModalConvenio.tsx` · mig 206 (columna, ZALA, relleno, límites, los 11).
**Queda aparte:** el papel firmado del acuerdo todavía no imprime la primera cuota; `ModalAmpliarConvenio` y el motor al
recuperar un incumplido (mig 093) siguen calculando su fecha límite desde hoy.

### D-057 · 27-oct-2026 · Nómina: el día en que pagó el cliente, precorte, corte los miércoles y pago el 15 y el 30
**Decidió:** el dueño: *"se hará un precorte los días actuales y se hará un corte definitivo semanalmente los miércoles
dando plazo a lunes y martes para ingresar los pagos que hagan falta, así nadie pierde nada; los funcionarios cerrarán o
firmarán cada semana pero los pagos serán quincenales los 15 y los 30 de cada mes"*.
**Por qué:** en la semana del 19-oct, de 98 pagos "atrasados", 29 eran transferencias pagadas dentro de la semana y
confirmadas el lunes siguiente o después: la nómina contaba el día de la confirmación (`cajas_llenadas.fecha`), no el
día en que pagó el cliente. $108.750 de menos solo esa semana. Los otros 69 eran atrasos reales.
**Qué se decidió:**
1. Si fue a tiempo o atrasado lo decide el día en que pagó el cliente (`pagos.fecha`). El renglón se paga en la semana
   en que pagó; si esa semana ya está cerrada para ese supervisor, en la de la confirmación (nadie lo pierde).
   `cajas_llenadas.pago_id` dice qué pago llenó cada semana (mig 207, sin tocar el motor).
2. Arranca con la semana del 26-oct (`INICIO_CORTES_NOMINA`); las anteriores se pagaron por fuera y cuentan como cerradas.
3. Lunes y martes: precorte (se ve, no se cierra; avisa las transferencias sin confirmar). Miércoles: corte definitivo y
   firma de cada supervisor ("revisé y estoy de acuerdo"). Si un supervisor no está de acuerdo, su semana no se cierra
   hasta aclarar.
4. Cada 15 y 30 se pagan las semanas ya cerradas que no se hayan pagado. El día no lo fija el sistema: se registra el día
   en que se paga (el mismo 15/30, o un día antes o después) y entran las cerradas hasta ese día.
5. Cierran y registran el pago ADMIN y ADMIN_PRINCIPAL (como hoy).
**Dónde vive:** `nominaCobradores.ts` (`fechaReal`, `ubicar`, `semanaCerrada`, `INICIO_CORTES_NOMINA`) · mig 207. Los
puntos 3 y 4 (precorte, corte del miércoles, pago quincenal) se construyen aparte.

### D-058 · 31-oct-2026 · Nómina: también las semanas de antes del 26-oct se cuentan con el día en que pagó el cliente
**Decidió:** el dueño, al revisar la nómina de BRANDON (semanas del 12 y del 19-oct): *«sí corrígelo»*.
**Por qué:** la mig 207 (D-057) guardó qué pago llenó cada semana solo desde el 26-oct. Para las de antes, la nómina
seguía usando el día en que se CONFIRMÓ el pago: una transferencia pagada dentro de su semana y confirmada después salía
atrasada ($3.750 en vez de $7.500). Ej.: DPU42I pagó el 14 y se confirmó el 21; IEW83I pagó el 15 y se confirmó el 20;
RMY88H pagó el 16 y se confirmó el 19. Verificado semana por semana con la regla del dueño: si el pago primero completó
una semana anterior, esa sigue atrasada (RMY88H: su semana del 5-oct sigue en $3.750).
**Qué se decidió:** completar el pago de las semanas llenadas antes del 26-oct con el mismo método de la mig 207 (el pago
anotado en el mismo instante o el último anotado antes). Si un pago aparece en dos momentos separados (más de 10 min),
solo cuenta el primero. Cada una queda marcada (`pago_deducido`) y se puede deshacer.
**Efecto:** 2.237 semanas corregidas; 758 siguen sin pago (629 del corte de migración, 124 adelantadas con la base, 5
dudosas) y ninguna le paga al supervisor. Del 24-ago al 25-oct: Ariza +$161.250 · Alvarez +$105.000 · Lumar +$101.250
· Brandon +$97.500 (+$465.000). Brandon: semana del 12-oct $387.500 → $395.000, del 19-oct $466.250 → $503.750 (visto
en la pantalla). La semana del 26-oct no cambia.
**Dónde vive:** mig 209 (`cajas_llenadas.pago_deducido`). El código de la nómina no cambió.
**Ojo:** esas semanas se pagaron por fuera. Lo que dice la app ahora menos lo que se le pagó a cada uno es lo que falta;
no sumarle encima el Excel del 30-oct («lo que faltó antes del 26-oct»), que ya incluía parte de esta misma causa.

### D-059 · 31-oct-2026 · Pagos anotados en desorden: aviso al confirmar y nómina en el orden en que pagó el cliente
**Decidió:** el dueño, al revisar la nómina de BRANDON: *«sí, las dos partes»* y *«listo súbelo»*.
**Por qué:** PEDRO FLOREZ (IEW90I) pagó su semana del 12-oct el 14 y el 15, y la del 19-oct el 21 y el 23 (comprobantes
del Nequi COSTA). La oficina anotó primero las transferencias nuevas. El motor llena siempre la semana más vieja con lo
que se confirma primero, y un pago solo llena las semanas que ya se cobraban a su fecha (mig 119): la plata del 14 y el
15 cayó a saldo a favor, el cliente apareció debiendo hasta que se aplicó a mano el 27, y la nómina vio las dos semanas
atrasadas ($3.750 + $3.750) cuando el cliente pagó todo a tiempo ($7.500 + $7.500).
**Qué se decidió:**
1. **Aviso al confirmar una transferencia** (no bloquea, la secretaria decide; el efectivo nunca lo muestra porque
   siempre es de hoy). Caso A: hay otra transferencia más vieja sin confirmar del mismo contrato → «confirme primero la
   más vieja». Caso B: ya se confirmó un pago más nuevo que llenó semanas → «esta plata puede quedar como saldo a favor;
   aplíquelo desde el detalle del cliente». Si cancela, no se confirma ni se imprime recibo.
2. **La nómina cuenta la plata en el orden de los días en que pagó el cliente**, solo en los contratos con pagos
   anotados en desorden (un pago que cayó a saldo a favor después de que se anotó uno más nuevo). La regla del dueño se
   mantiene: la plata primero completa la semana más vieja que falte. El saldo a favor aplicado cuenta con el día del
   pago que lo generó; el del cuaderno, con el día en que se aplicó. Las semanas que cubrió un acuerdo cuentan solo la
   parte que fue plata (su partitura). Dónde se paga cada renglón no cambia (semana cerrada → semana en que se anotó).
**Efecto:** 29 contratos con desorden; 62 semanas cambian. Del 24-ago al 1-nov: Lumar +$41.250 · Alvarez +$37.500 ·
Brandon +$18.750 · Ariza +$18.750 (+$116.250); nadie baja. Semana del 26-oct (la primera que se cierra en la app, el
4-nov): Brandon +$7.500, Alvarez +$3.750, Lumar +$3.750. Brandon: 19-oct $503.750 → $507.500, 26-oct $588.750 →
$596.250. Medido con el código real y visto en la pantalla.
**Dónde vive:** `semanasEnOrdenDePago()` en `nominaCobradores.ts` · `avisoOrdenDelPago()` en `ordenDelPago.ts`, que
llama `confirmarPago()` en `usePagos.ts` (el embudo de los 3 botones de Cartera y el de Caja Diaria). Sin migración.
**Ojo:** lo de antes del 26-oct se pagó por fuera, igual que en D-058: lo que dice la app menos lo pagado es lo que falta.

### D-060 · 31-oct-2026 · Nómina de CARLOS ARIZA: la semana de ARNOL, la hora de las retenciones, la cuota de retenida y las etiquetas
**Decidió:** el dueño, al revisar la nómina de Ariza (semanas del 12 y del 19-oct, 26 motos): *«Sí, los 4»*.
**Qué encontró la revisión:** 7 motos ya salían pagadas (arreglo del 30-oct, la última cuota del acuerdo). 11 de
Ariza decían «No pagó su semana» en la semana del 12 y sus clientes sí pagaron: se confirmó el lunes 19 y se les paga
en la del 19 (a Brandon le pasaba con 9, a Lumar con 7, a Alvarez con 6). Varias estaban bien por las reglas (paquete
con acuerdo, atrasadas, adelantadas, quincenal). Y tres errores de verdad:
1. **ARNOL ESPRIELLA (IEW93I):** el borrado del 8-oct (copia de un doble toque) le restó una semana que sí pagó. Lo
   que pagó para semanas suma $1.622.000 y su ahorro trae 8 semanas, pero el contador decía 7 ($1.421.000). Pagó dos
   veces: la transferencia del 2-oct es real (comprobante No. 0000032600) y él paga una vez por semana, siempre.
2. **La hora de las retenciones:** se fechaban con el día de Londres (la base guarda UTC). Las 4 que hizo Ariza el
   sábado 25-oct entre 7 y 9:30 p.m. (IGC51I, IGC53I, RML58H, RLT86H) quedaban en la semana del 26; las del domingo
   11-oct en la noche (DPU46I, RMM71H), en la del 12.
3. **La cuota de acuerdo de una retenida** se pagaba también en semanas en que la moto todavía no estaba retenida
   (el estado "Suspendido" es el de hoy). Esas cuotas ya iban dentro de su semana. 9 casos, $33.750.
**Qué se decidió:**
1. Devolverle la semana a ARNOL (mig 210, con guardas y rastro en la auditoría).
2. La retención se fecha con el día de Colombia (`diaColombia`).
3. La retención cubre lo que el cliente PAGÓ en su semana (`pagadoEl`), no lo que se confirmó en ella: no se come una
   semana pagada antes (IGC53I y RML58H pagaron la suya el 17), y lo que pagó en su semana para recuperarla no se paga
   aparte aunque se confirme después.
4. La cuota de una retenida cuenta solo desde el día en que se retuvo la moto (sin registro de la retención, como antes).
5. Las motos que no generaron pago dicen la verdad: «Pagó el 16 de oct y se confirmó el 19 de oct: se le paga en la
   semana del 19 al 25 de oct», «Pagó la semana el 7 de oct y la cuota del acuerdo el 16 de oct…», «Esta semana ya la
   tenía pagada: la pagó por adelantado el 1 de oct», «Quincenal: esta semana no le tocaba pagar», y «Retenida» solo
   desde la semana en que la retuvieron. En la pantalla y en el desprendible.
**Efecto medido con el código real (24-ago a 1-nov):** Ariza +$15.000 (semana del 5-oct +$42.500, 12-oct −$38.750,
19-oct +$77.500, 26-oct −$66.250, y ±$3.750 en dos semanas viejas) · Lumar −$7.500 · Brandon −$7.500 (cuotas de
retenida de RML49H y RMU62H) · Alvarez −$3.750. Cuando se corra la mig 210, Ariza +$18.750 más (ARNOL a tiempo desde
la semana del 5-oct). Semana del 12-oct de Ariza: $618.750 → $580.000; la de Brandon sigue en $395.000. Visto en la
pantalla a 375 px y en el desprendible.
**Dónde vive:** `nominaCobradores.ts` (`diaColombia`, `pagadoEl`, motivos `pago_otra_semana`, `adelantada`,
`no_tocaba`), `ReportesView.tsx`, `generarDesprendibleNomina.ts`, mig 210.
**Ojo:** la semana del 26-oct es la primera que se cierra en la app: a Ariza le bajan ahí $66.250 porque las 4
retenciones del sábado 25 pasan a la semana del 19, que se paga por fuera; hay que sumárselas a lo que le falta.
YAL58H (Lumar, semana del 28-sep): una cuota del 30-sep, el día en que le devolvieron la moto tras una retención
anterior, ya no cuenta ($3.750); no hay registro de cuándo termina una retención para decidirlo mejor.


**Corrección a D-060 (31-oct, misma tarde):** el 25-oct fue **domingo**, no sábado. Las 4 retenciones de Ariza fueron el domingo 25 entre las 7 y las 9:30 de la noche: en hora de Londres ya era el lunes 26, por eso saltaban a la semana siguiente. La prueba automática se corrigió para usar un domingo en la noche (con un sábado el error no se veía).

### D-061 · 2-nov-2026 · El libro de asignaciones: la nómina le paga a quien tenía la moto ese día
**Decidió:** el dueño, el día en que entró WILINTON MORA y se le iban a pasar motos con la semana del 26-oct sin
cerrar: *«Libro de asignaciones»* · *«Del que la recibe»* · *«dale a la que recomiendas»*.
**Por qué:** `motos.subadmin_id` guarda solo el supervisor de HOY. La nómina le paga cada moto al que la tiene hoy: si
una moto cambia de supervisor antes de cerrarse su semana, lo de esa semana se le va al nuevo y se le quita al que la
trabajó. No quedaba registro de quién la tenía antes.
**Qué se decidió:**
1. Un libro (`motos_asignaciones`, mig 211): un renglón por cada supervisor que tuvo cada moto, desde y hasta cuándo.
   Lo escribe solo un disparador cada vez que cambia `motos.subadmin_id`, con la hora y quién lo hizo.
2. La nómina le paga cada renglón a quien tenía la moto el día en que el cliente pagó; la retención, a quien la tenía
   en ese momento. Visitas y referidos no cambian.
3. **El día del cambio cuenta para el que RECIBE la moto**: se mira quién la tenía al final de ese día.
4. Antes del primer renglón del libro, la moto es del primero que aparece en él (como hasta hoy).
5. Reportes → Por admin (D-035, «Antes de asignar») también usará el libro, después del cierre del miércoles 4-nov.
**Efecto:** mig 211 corrida el 2-nov a las 2:20 p. m. y verificada: 400 motos = 400 renglones abiertos, 0 que no
coinciden con `motos`, disparador prendido y ninguna moto pasada entre la foto de la 1:33 p. m. y la corrida. Leído
también desde la app con la sesión del dueño (400). Hasta que suba el cambio de la nómina, la nómina sigue igual.
**Dónde vive:** mig 211 (`motos_asignaciones`, `anotar_asignacion_moto()`). La foto de la 1:33 p. m., con fechas:
`docs/informes-nomina/asignaciones-antes-2nov-2026.txt` (carpeta privada, ignorada por git).
**Ojo:** NHT27I y NHT95I pasaron a Wilinton a las 12:05, antes de la foto: el libro las tiene de él desde ahí
(contratos nuevos del 29 y el 31-oct; no le dejaron nómina a nadie). Mientras no suba el cambio de la nómina, no cerrar
la semana del 26-oct a ningún supervisor que haya entregado o recibido motos.

### D-062 · 2-nov-2026 · La tarjeta «Referido por» se llena sola cuando lo trajo alguien del equipo
**Decidió:** el dueño, el 2-nov: *«al seleccionarlo en la tarjeta de referido opcional salga ya el nombre y cedula de
la persona que se selecciono»*; el plan, con *«Sí, apruebo»*.
**Por qué:** la oficina escribía a mano el nombre y la cédula de la persona del equipo. De los 73 clientes que trajo el
equipo, 8 llevan una cédula distinta de la que más se repite para esa persona, y una misma cédula aparece como la de
tres supervisores. La app no guardaba la cédula de la gente del equipo.
**Qué se decidió:**
1. La cédula de cada persona del equipo se guarda una vez, en Usuarios (campo «Cédula», solo para SUBADMIN y
   VISITADOR: los que salen en «¿Alguien del equipo lo trajo?»). Vive en una tabla aparte, `equipo_cedulas` (mig 212),
   y no en `profiles`, porque la secretaria —que es la que registra clientes— no puede leer los perfiles de los demás,
   y así la cédula tiene sus propias reglas: la escribe solo el ADMIN_PRINCIPAL; la leen el ADMIN_PRINCIPAL, el ADMIN y
   la SECRETARIA. Un supervisor no ve ninguna, ni la suya.
2. En el formulario del cliente (el mismo para registrar y para editar): al escoger a la persona, la tarjeta sale con
   su nombre en mayúscula y su cédula, y no se puede cambiar a mano; para cambiarla se escoge otra persona. «Nadie»
   deja la tarjeta vacía. Si la persona todavía no tiene cédula guardada, sale el nombre y la cédula se escribe a mano,
   como antes, con un aviso que lo dice. A quien no puede leer las cédulas le pasa lo mismo, pero sin el aviso.
3. Las tarjetas de los clientes ya registrados no se tocan: la app no cambia sola ninguna. Una tarjeta vieja que
   coincide con lo guardado sale bloqueada; una que no coincide queda como estaba y se puede corregir a mano. Corregir
   las 8 que tienen otra cédula es una decisión aparte.
4. No toca plata, nómina ni premios (lo del equipo ya no cuenta para premios, D-047).
**Efecto:** mientras la mig 212 no esté corrida y las cédulas no estén guardadas, el formulario funciona como antes. Probado
en la app a 375 px, de noche y de día, con una cédula de prueba puesta solo en la pantalla (no se guardó nada): la
tarjeta sale llena y bloqueada, con el aviso; «Nadie» la deja vacía; sin cédula guardada sale el nombre y la cédula
queda para escribirla. Contraste medido de la tarjeta bloqueada: 11,78 de noche y 16,3 de día; el aviso, 6,97 y 6,49.
10 pruebas nuevas (`referidoEquipo.test.ts`).
**Dónde vive:** mig 212 (`equipo_cedulas`, sus 4 reglas y una prueba adentro: si un supervisor alcanza a leer o a
escribir una cédula, la migración se deshace sola) · `src/utils/referidoEquipo.ts` · `src/hooks/useCedulasEquipo.ts` ·
Usuarios (`ModalEditar`) · Clientes (`renderClienteForm`).
**Ojo:** primero se corre la mig 212 y después se escriben las cédulas; al revés, Usuarios dice «Usuario guardado, pero
falló guardar la cédula». Las cédulas del equipo son datos personales: no van en el repo ni en el chat.

**Mig 212 corrida (2-nov, 4:11 p. m.):** dio tabla 1 · rls true · reglas 4 · cedulas 0, así que la prueba de adentro pasó:
el supervisor de la prueba no vio ni escribió ninguna cédula, y la secretaria (hay 1) y el dueño sí la vieron. Leída
también desde la app con la sesión del dueño: 0 cédulas, sin error. Anotada en `migraciones_aplicadas`.

**Subido el 2-nov a las 4:23 p. m. (2e3d428), un día antes de lo planeado (D-061 y D-062):** el dueño pidió *«sube todo
hoy mismo si no daña nada»*. Era lunes de cobro y antes de las 6, pero nada de lo subido toca el motor, la cartera, los
pagos ni el reparto: la nómina con el libro (D-061), la tarjeta del referido y su frase (D-062) y documentos. Y publicar
no le recarga la app a nadie: sale el aviso «Hay una versión nueva de la app» con su botón. Antes de subir: tipos sin
errores, armado bien y 1.058 pruebas en verde. Después: comprobado en la versión publicada que la pantalla de clientes
trae la tarjeta nueva y que Reportes lee el libro.

### D-063 · 3-nov-2026 · Reportes: las motos guardadas por supervisor
**Decidió:** el dueño, el 3-nov: *«hagamos porfa en reportes de las motos que están guardadas o retenidas por categoría
de supervisor»* · *«lo del valor o plata que se pierde no es necesario»* · *«Sí, constrúyelo»*.
**Por qué:** Guardadas decía cuántas motos están quietas y cuántos días llevan, pero no de qué supervisor son. Para
pedirle cuentas a cada uno había que revisar la lista moto por moto.
**Qué se decidió:**
1. En Reportes → Flota → Guardadas, un cuadro «Por supervisor · hoy»: una fila por supervisor que tenga motos guardadas
   (por nombre), «Sin supervisor» al final y el Total. Cada fila dice cuántas motos y cuántos días suman, y debajo las
   tres clases de la lista: por no pagar, taller con cliente y taller sin cliente.
2. Si aplica, dos líneas más por fila: cuántas llevan más de 30 días (y cuántos días lleva la más vieja) y cuántas
   tienen la liquidación abierta.
3. Tocar un número deja en la lista de abajo solo esas motos, con el aviso «Mostrando…» y el botón «Ver todas».
4. El supervisor es el que tiene la moto HOY (`motos.subadmin_id`), no el libro de asignaciones: el libro es para la
   nómina (D-061) y aquí la pregunta es de quién son hoy.
5. «Con liquidación abierta» se cuenta con la regla de Inmovilizaciones (ni cerrada ni anulada): son 21, no las 6 que
   dije al principio con otra cuenta (DERRAPES, 3-nov). No se llama «En liquidación» porque en el Resumen de Reportes
   ese nombre ya cuenta otra cosa (diccionario C19).
6. Sin atajo a Motos: allá «Sin supervisor» son 79 motos (todas, no solo las guardadas) y la ficha de la moto no deja
   asignar supervisor, así que el atajo llevaría a otra cuenta.
7. Sin la plata que se deja de ganar (el dueño no la quiso). En la lista y en el Excel de Guardadas, «Sin cobrador»
   pasa a decir «Sin supervisor».
**Efecto:** medido en la app con la sesión del dueño, el 3-nov: 55 motos y 846 días, igual que el recuadro de arriba
(44 por no pagar, 5 en taller con cliente, 6 en taller sin cliente); 9 con más de 30 días (la más vieja, 87); 21 con
liquidación abierta, 20 de ellas sin supervisor. Las 26 cifras que se pueden tocar dan exactamente las motos de la
lista. 19 motos no tienen fecha de entrada y no suman días. 6 pruebas nuevas; 1.064 en verde.
**Dónde vive:** `guardadasPorSupervisor()` en `src/utils/reportesFlota.ts` (con sus pruebas) · `CuadroPorSupervisor`
en `src/components/reportes/FlotaReportes.tsx` · `ReportesView` (la lista de Guardadas ahora lee las liquidaciones) ·
diccionario C26.
**No toca:** plata, nómina, Motos, la ficha de la moto, Inmovilizaciones ni el Resumen. ZALA no lo usa.

### D-064 · 5-nov-2026 · Rodar por deuda: el mínimo baja a $500.000 hasta el 30 de noviembre
**Decidió:** el dueño, el 5-nov: *«baja el límite de 700 a 500 por este mes»*; y a la propuesta (las dos formas de
rodar, hasta el 30-nov, y el 1-dic vuelve sola a $700.000): *«Sí, así»*.
**Por qué:** necesitan rodar a varios clientes ya, y el mínimo de $700.000 (D-044, D-052) dejaba por fuera a los que
deben entre $500.000 y $700.000.
**Qué se decidió:**
1. Hasta el 30-nov-2026 se puede rodar a quien deba más de $500.000, en «Solo lo atrasado» y en «Rodar todo». El resto
   de la regla no cambia: una sola vez por contrato, solo semanales, el recargo y el pedazo de $100.000.
2. El 1-dic-2026 vuelve sola a $700.000: la fecha está escrita en la base y en la app. Ese día no hay que correr nada.
3. El botón de Contratos y el permiso en Usuarios dicen el mínimo del día. El manual de rodar sigue diciendo $700.000:
   es la regla de siempre, la que vuelve en diciembre.
**Dónde vive:** `public.rodado_minimo()` (mig 214), que leen `_calcular_rodado_por_deuda` y `_calcular_rodado_todo` ·
su espejo `minimoRodado()` en `src/utils/rodadoPorDeuda.ts` (con su prueba) · `ContratosView` · `acciones.ts`.
**No toca:** las cifras, las semanas, el recargo, las demás razones para no rodar, pagos, Cartera ni ZALA.

### D-066 · 7-nov-2026 · Acta de entrega y recibo cada vez que la moto cambia de manos
*(D-065 queda para el bloqueo del efectivo sin firma o huella, aprobado el 6-nov y todavía sin anotar.)*
**Decidió:** el dueño, el 7-nov. Lo pidió así: *«un documento legal de entrega y recepción del vehículo [...] donde
diga la modalidad de alquiler con opción de compra, para quitar cualquier responsabilidad como empresa de lo que el
conductor hizo o no con el vehículo»*, y después: *«que quede el tiempo, las condiciones y todo claro para que si hay
algún inconveniente legal se pueda demostrar quién fue responsable del vehículo y en qué tiempo; en el sistema los
clientes solo firmarán y ya el resto lo hace o lo genera el sistema»*. Eligió, una por una: un solo papel por cada
cambio de manos; firmarlo cada vez que la moto vuelve y también cada vez que sale (*«que se le dé especie de un recibo
o algo así a los clientes»*); el resumen final (*«parece que sí»*); y agregarle la línea de la modalidad al acta de
entrega del contrato (*«Sí, agregarla»*).
**Por qué:** la moto cambia de manos en siete momentos y solo la entrega del contrato deja un papel firmado. En el
retiro voluntario y en la mora la moto llega por lo menos 7 días antes de la liquidación: un papel firmado solo en la
liquidación dejaba esos días sin prueba, y muchas veces el cliente ya no está para firmar. Un papel no le quita a la
empresa toda la responsabilidad (eso lo decide la ley), pero prueba quién tenía la moto y desde cuándo.
**Qué se decidió:**
1. Un solo papel, «Acta de entrega y recibo de motocicleta», numerado, que arma el sistema; el cliente solo firma. Se
   firma cada vez que la moto vuelve a la empresa (recolección por mora, entrega voluntaria, liquidación con el
   contrato activo, devolución de una prestada) y cada vez que sale hacia el cliente (devolverle su moto después de una
   recolección, prestarle una de reemplazo). La entrega del contrato conserva su propia acta.
2. Dice: quién entrega y quién recibe, la moto, el contrato y la modalidad (arrendamiento con opción de adquisición);
   el estado (km, daños, llave, las 6 fotos y la lista de chequeo de la entrega, más placa, licencia de tránsito, SOAT,
   casco y lo que el cliente deje en la moto), comparado con la vez anterior; el tiempo que la tuvo el cliente; que en
   ese tiempo él responde por la moto (cláusulas tercera, décima y décima primera del contrato) y que las multas con
   fecha de ese tiempo son suyas aunque lleguen después; desde cuándo la cuida la empresa, o él si es una entrega; que
   no es un paz y salvo; dónde se hizo (la ubicación del aparato), la hora del sistema y un código de verificación.
3. Firma: el cliente, con el dedo en la pantalla y la huella de su registro; por la empresa, el nombre de quien
   registra y la hora. Si el cliente no firma, el papel dice por qué (se negó, la entregó otra persona, no había nadie)
   y queda firmado por la empresa, con las fotos.
4. El cliente recibe su copia por WhatsApp o en el tiquete impreso. El acta no se edita: si tiene un error se anula con
   motivo y se hace otra, y la anulada sigue a la vista.
5. Al acta de entrega del contrato se le agrega: «Se entrega en arrendamiento con opción de adquisición. Desde este
   momento y hasta que la devuelva, la moto queda bajo su tenencia y su responsabilidad». Solo para los contratos que
   se firmen de ahí en adelante: las actas ya firmadas no se tocan.
6. Quedó por fuera, como opcional: tomar la huella en vivo con el lector cuando el cambio se hace en la oficina.
**Dónde va a vivir (por construir):** una tabla nueva de actas (mig 216) · las seis ventanas donde la moto cambia de
manos · el armador del acta junto a los demás documentos en `src/hooks/useDocumentos.ts` · el tiquete en
`src/components/TicketTermico.tsx` · «Documentos del contrato».
**No toca:** las cifras, la cartera, el reparto, el cálculo de la liquidación ni ZALA.
**Falta:** que un abogado revise el texto antes de usarlo. El contrato firmado se llama «de arrendamiento» y no menciona
la opción de adquisición, y hay que confirmar si basta con la huella del registro.

### D-067 · 7-nov-2026 · Los grupos o portafolios se crean y se administran desde la app
**Decidió:** el dueño, el 7-nov, una pregunta a la vez. Lo pidió pensando en lo que viene: *«al de usadas le vamos a
cambiar el nombre y vamos a crear uno totalmente nuevo»*. Eligió que a un grupo se le pueda crear, cambiar el color y
apagar, y que nunca se borre; que lo haga solo el Administrador principal; que cada grupo lleve solo nombre corto y
color; que un grupo con motos no se pueda apagar; y que el nombre se corrija desde la pantalla solo mientras el grupo
esté vacío (*«Sí, así»*). USADAS se va a llamar CAPITAL MOTOS: cuando se le preguntó si el que cambiaba era RASTREADOR,
contestó *«solo el de usadas»*. Aprobó el plan completo el mismo día (*«Sí, apruebo»*).
**Por qué:** los grupos están escritos a mano en unos 20 archivos y en las reglas de la base. Para un socio nuevo había
que tocar código y escribir una migración, y una lista fija olvidada dejaba una pantalla sin el grupo nuevo, con sumas
que no dan el total. Cambiarle el nombre a USADAS a mano era cambiar el mismo texto en sus motos, su cuenta, las fotos
diarias de Cartera y el premio de referidos, con el riesgo de dejar uno a medias.
**Qué se decidió:**
1. La tabla de grupos es la única lista. El nombre corto es también lo que se guarda en cada moto, cuenta y perfil: no
   hay un código interno aparte. Las reglas de la base apuntan a esa tabla, así que no se puede guardar un grupo que no
   exista.
2. A un grupo se le puede crear, cambiar el color, apagar y encender. Nunca se borra. Lo hace solo el Administrador
   principal, y el candado está en la base, no solo en la pantalla.
3. Desde la pantalla, el nombre se corrige solo mientras el grupo esté vacío: sin motos, socio, cuentas, plata, fotos de
   Cartera ni premios. Un grupo con motos se renombra con una migración, como se hizo con CLUB a RASTREADOR en la 009.
   Lo que ya se imprimió queda con el nombre viejo.
4. Un grupo se apaga solo cuando no le quedan motos en la empresa (las vendidas no cuentan). Apagado no sale para
   escoger en una moto nueva, un cambio de grupo, un socio nuevo ni una cuenta nueva. Lo que ya tiene se sigue viendo.
5. El nombre lleva hasta 14 caracteres, en mayúsculas: letras, números y un espacio entre palabras. Se había dicho 12 y
   se subió para que quepa CAPITAL MOTOS, que tiene 13. Debajo de la placa cabe: las placas ya miden entre 66 y 87 px
   según sus letras y el nombre mide 80. La placa no se toca.
6. El color sale de una paleta de 8 (azul, verde, ámbar, naranja, violeta, aguamarina, magenta y gris; ni rojo ni el
   amarillo de la placa) y no se repite entre grupos prendidos. Para arrancar: RASTREADOR azul, COSTA verde, PRADERA
   ámbar y CAPITAL MOTOS naranja. Cada grupo tiene un solo color en todas las pantallas.
7. USADAS pasa a llamarse CAPITAL MOTOS con la migración 218: sus 14 motos, su cuenta, las fotos diarias de Cartera y el
   nombre en el premio de referidos ya entregado. La plata del premio no se toca. RASTREADOR no cambia.
8. La app deja de escoger un grupo sola (hoy pone RASTREADOR): en una moto nueva y en un socio nuevo hay que escogerlo,
   y en el Excel un grupo que no existe rechaza esa fila con el motivo.
9. Cada cambio queda en un historial: quién, cuándo, qué, antes y después.
**Dónde va a vivir (por construir):** las migraciones 217 (el módulo) y 218 (USADAS) · la función `manage-users` · una
sección Grupos en Configuración · los unos 20 archivos que hoy tienen la lista escrita a mano. La lista completa, el
orden y las 8 pruebas de terminado están en `docs/PENDIENTES.md`, bloque P3.
**No toca:** ninguna cifra de plata, lo que ve cada socio, las fechas de corte de la migración ni lo que ya se imprimió.
**Falta:** construirlo después del bloqueo del efectivo (D-065) y del acta (D-066), ya en el otro PC. Cambiar una moto de
grupo sigue sin dejar rastro y es un pendiente aparte.

### D-068 · 7-nov-2026 · El acta de entrega y recibo no lleva el nombre ni la cédula del arrendador
**Decidió:** el dueño, el 7-nov, al revisar la copia de revisión del acta: *«por lo que el que se les va a imprimir creo
que ellos no deberían tener esa información»*. Eligió «Amarrada al contrato».
**Por qué:** el cliente lee el acta en la pantalla antes de firmar. El acta no pierde fuerza: dice el número del
contrato, y el contrato dice quién es el arrendador, con su cédula. Y si algún contrato llega a tener otro arrendador
(por ejemplo con los grupos, D-067), la frase sigue siendo cierta sin tocarla.
**Qué se decidió:** el acta dice «CLUB MOTEROS CARTAGENA, en nombre del arrendador del contrato N.º …, recibe la
motocicleta…» (o «le entrega»). Con la moto prestada, que va aparte del contrato, dice solo «CLUB MOTEROS CARTAGENA».
Una prueba avisa si el nombre o la cédula vuelven a aparecer en el acta.
**No toca:** el contrato, el pagaré, el paz y salvo ni la autorización de datos, que lo siguen nombrando como hasta hoy.
**Falta:** que el abogado lo confirme cuando revise el texto del acta (D-066).

### D-069 · 7-nov-2026 · Acta de entrega y recibo: la ubicación no es obligatoria y la lista se contesta completa
**Decidió:** el dueño, el 7-nov, antes de dibujar la parte de la firma. Eligió «Se intenta y, si no sale, se guarda
igual» y «Tiene que contestar todos».
**Qué se decidió:**
1. Al guardar el acta se pide la ubicación del teléfono. Si no sale (el computador de la oficina muchas veces no
   puede), el acta se guarda igual y el papel dice «El teléfono no dio la ubicación». En la visita y en el guardado de
   la moto sigue siendo obligatoria, como hasta hoy.
2. Los 13 puntos de la lista de chequeo se contestan todos, con Sí o No: mientras falte alguno, el botón de guardar
   queda apagado y la ventana dice cuántos faltan.
**Por qué:** la moto no puede esperar a que salga la señal, y las fotos, la hora y la firma siguen probando el cambio
de manos. La lista completa no deja huecos en el papel.

### D-070 · 7-nov-2026 · Acta de entrega y recibo: cuando la moto sale, el papel no habla de lo que el cliente dejó
**Decidió:** el dueño, el 7-nov, al meter el acta en las ventanas donde la moto sale hacia el cliente. Eligió «Que no
salga».
**Qué se decidió:**
1. Cuando la moto SALE (se le devuelve su moto o se le presta otra), el papel no trae el renglón «Lo del cliente que
   quedó en la moto». Ese renglón sigue saliendo cuando la moto vuelve a la empresa.
2. La llave, cuando la moto sale, se dice así: «Se entrega con la llave»; y si el cliente se había ido con una copia la
   vez anterior, «Devolvió la llave que se había quedado» o «No devolvió la llave que se había quedado».
**Por qué:** cuando la moto sale no hay nada del cliente guardado en ella, y un renglón vacío confunde al que firma.
**No toca:** el acta cuando la moto vuelve (recolección, entrega voluntaria, liquidación, devolución de la prestada),
que sigue diciendo lo que el cliente dejó en la moto y si entregó su llave.

### D-071 · 7-nov-2026 · Acta en Motos → «Registrar recepción»: solo cuando la moto viene de un cliente
**Decidió:** el dueño, el 7-nov. Eligió «Acta si viene de un cliente».
**Qué se decidió:** en Motos → «Registrar recepción» el acta se hace cuando el motivo es «Entrega voluntaria»,
«Liquidación de contrato» u «Otro motivo» y la moto tiene un contrato Activo. Con «Nuevo registro» (la moto que entra
por primera vez a la empresa) nunca se hace.
**Por qué:** el acta prueba que la moto pasó de las manos del cliente a la empresa. Sin un contrato activo no hay
cliente que la entregue ni que firme.
**No toca:** la recepción, que se guarda igual que antes con cualquier motivo.
**Falta:** con «Otro motivo» la ventana no pregunta por la llave, así que el papel dice «No se preguntó». Lo mismo
pasa al devolver la moto prestada. Queda por preguntarle al dueño si se agrega esa pregunta.

### D-072 · 7-nov-2026 · Los botones de mensaje esperan con la pantalla tapada y no mandan dos veces
**Decidió:** el dueño, el 7-nov: *«que no permita que presionen el botón varias veces y que obligue sí o sí a
esperar»*. Aprobó el dibujo («Sí, hazlo»).
**Por qué:** con el canal oficial el mensaje sale por debajo y la pantalla no reacciona mientras tanto. El funcionario
vuelve a tocar el botón, y cada toque podía ser otro mensaje al cliente y otra gestión anotada.
**Qué se decidió:**
1. Mientras sale un mensaje, una ventana tapa toda la pantalla y dice «Enviando mensaje… a {el cliente}». No se puede
   tocar nada hasta que termine; después sale la tarjeta de siempre (verde, amarilla o roja).
2. El mismo mensaje pedido otra vez mientras va saliendo (el doble toque) sale una sola vez. Uno distinto sí sale: el
   recibo «a los dos números» sigue mandando a los dos.
3. Si el canal no contesta en 30 segundos, la ventana avisa y deja cerrarse a mano, para que la pantalla nunca quede
   trabada. El mensaje sigue su camino y el candado de ese mensaje no se suelta hasta que conteste.
4. El candado va dentro de la tubería única (`useEnvioMensaje`), no en cada botón: cubre los 8 botones sueltos sin
   tocar las pantallas. La tanda masiva queda como estaba, con su candado y su barra de avance.
**No toca:** por dónde sale el mensaje, qué plantilla usa, qué se anota en la gestión ni la tarjeta del resultado.

### D-065 · 6-nov-2026 (la foto, 10-nov) · El efectivo de la oficina exige la firma, la huella y la foto del cliente
*(Va después de la D-072 porque se anotó el 10-nov; el número se había guardado el 7-nov, ver la nota de la D-066.)*
**Decidió:** el dueño. El 5-nov pidió que no se pudiera registrar efectivo en la oficina a un cliente sin la firma y la
huella de la autorización de datos; el 6-nov aprobó el plan («Sí, que lo construya»); el 10-nov sumó la foto de perfil:
*«lo de la foto también, no importa que haya que estar autorizando»*.
**Qué se decidió:**
1. En las cuatro ventanas que reciben efectivo en la oficina (Cartera → Registrar pago, Cobro Diario → Cobrar,
   Inmovilizaciones → Cobrar para recuperar y → Cobrar alquiler), si al cliente le falta la firma, la huella o la foto,
   el botón de registrar se apaga y sale un recuadro para tomárselas ahí mismo. Se guardan igual que en Clientes →
   Editar (la misma carpeta y los mismos campos).
2. Si no se puede (el lector no lee, el computador no tiene cámara), solo el dueño autoriza a ese cliente ese día, con
   el motivo escrito. Queda guardado quién, cuándo y por qué, y nadie lo puede editar ni borrar. Los demás ven «llame
   al dueño» y un botón para revisar de nuevo. Al otro día se le vuelve a pedir.
3. No frena el cobro en campo (el cliente no está), las transferencias, el saldo a favor ni la semana adelantada.
4. El candado de verdad está en la base (mig 215, `trg_enforce_registro_firma_huella`); la pantalla solo evita llegar
   hasta él. Su espejo es `src/utils/firmaHuellaEfectivo.ts`: si se cambia uno, se cambia el otro.
5. «Cobrar alquiler» dejó de ser un `confirm()` y pasó a ser una ventana, porque el pago puede frenarse y antes el
   error de la base no se mostraba (se perdía sin aviso).
**Por qué:** la firma es la autorización expresa para guardar los datos (Ley 1581) y la huella es el dato biométrico que
esa firma autoriza. La foto la sumó el dueño sabiendo que el computador de la oficina no la toma con cámara (sí desde
un archivo) y que habrá que autorizar más seguido.
**Medido el 10-nov:** de 361 clientes con contrato vigente, a 118 les falta algo (a 59 solo la foto y a 52 las tres).
De los 127 que pagaron efectivo en la oficina en los últimos 30 días, a 29 les faltaba algo (a 6, la firma o la huella).
**No toca:** Clientes → Editar ni el registro de clientes, donde la foto sigue siendo opcional.
**Ojo:** Importación Excel → «Pagos históricos» (solo el dueño) mete efectivo de la oficina: con la 215 corrida, los
pagos de clientes a los que les falta algo se frenan. No se tocó.

### D-085 · 11-nov-2026 · La moto prestada que se devuelve el mismo día no se cobra
*(Número tomado en la copia aparte de la revisión de la RMM72H. Pasó por la D-075 y la D-076, que ya eran de la sesión
de la pizarra de los supervisores; por eso es la D-085. El renglón del historial de RAFAEL que quedó en la base dice
«D-075»: se refiere a esta.)*
**Decidió:** el dueño, al revisar la RMM72H (RAFAEL ANGEL LOPEZ PIÑA): *«no se le debería cobrar nada porque el mismo día
la devolvió; cobraría si pasa al día siguiente con la moto»*.
**Qué se decidió:**
1. El alquiler de la moto prestada se cuenta por días de calendario entre el día en que se prestó y el día en que se
   devolvió. Si la devuelve el mismo día: $0. Si pasa al día siguiente con ella: 1 día ($27.000). Prestada el lunes y
   devuelta el miércoles: 2 días.
2. Se cuenta hasta el día en que de verdad la devolvió, no hasta el día en que alguien la registra en el sistema.
**Por qué:** RAFAEL devolvió la RML54H el 26-oct, el mismo día del préstamo (a las 6:52 p. m. entró al taller «No
prende», la trajo él), pero la devolución se registró el 30-oct y el sistema le cobró 4 días ($108.000).
**Cambia lo que había:** hasta hoy el sistema cobraba mínimo 1 día (`Math.max(1, …)` en `cuentaAlquiler`,
`InmovilizacionesView.tsx`). Medido el 11-nov: de los 12 préstamos que ha habido, ninguno se devolvió el mismo día,
así que la regla nueva solo le cambia la cuenta a RAFAEL.
**Hecho el 11-nov:** la deuda de RAFAEL, corregida con el SQL que corrió el dueño. **Falta:** que la ventana «Devolver la moto prestada» pregunte
qué día la devolvió. El código no está hecho.

### D-086 · 11-nov-2026 · Una moto no se entrega a un cliente nuevo si la liquidación del cliente anterior no está cerrada
*(Número tomado en la copia aparte de la revisión de la RMM72H y del taller. Primero quedó como D-077, que ya era de la
sesión de la pizarra (Recolección con 2 días en mora); por eso es la D-086. El commit 1ec786f, el archivo de la
migración 222 y su nota en `migraciones_aplicadas` dicen «D-077»: se refieren a esta.)*
**Decidió:** el dueño, al revisar las motos que aparecían en el taller andando en la calle: *«que no deje entregar una
moto sin haber liquidado el contrato que tenía antes»*. Cuando le dije que la firma demoraba, me corrigió: *«¿se te olvidó
que se puede cerrar sin firma?»* (es así desde la mig 148).
**Qué se decidió:**
1. Para entregar una moto a un cliente nuevo, la liquidación del cliente anterior de esa moto tiene que estar **cerrada**,
   con firma o sin ella. Empezada no basta.
2. **Nadie se puede saltar el candado**, ni el dueño. Si el cliente anterior reclama la cuenta después, la liquidación
   cerrada se puede devolver, como se hizo con la LIQ-0032.
3. Las 10 motos que hoy ya andan con un cliente nuevo y la cuenta del anterior abierta no se tocan con el candado: se le
   pasa a la oficina la lista de las 8 liquidaciones abiertas para cerrarlas, sin crear un aviso nuevo. Las 2 sin
   liquidación (RNG55H y XZO72H) esperan a que liquidar ya no mande al taller una moto que tiene otro cliente.
**Por qué:** medido el 11-nov, de 64 entregas desde el 11-sep (motos que ya habían tenido otro cliente), solo 22 se
hicieron con la liquidación anterior cerrada. Las otras se cerraron 13 días después en el caso típico, hasta 39, o
siguen abiertas. Lo que demora es la cuenta en la oficina, no la firma: de 34 cierres tardíos, 29 se hicieron sin firma, y
las 8 abiertas ya tienen la revisión del taller terminada (la LIQ-0005, desde el 10-ago).
**Cuentan como "cliente anterior":** cualquier contrato de esa moto que esté Suspendido (cliente con la moto retenida y sin
liquidar), cualquier liquidación de un contrato de esa moto que no esté cerrada ni anulada, y un contrato Cancelado o
Finalizado con pagos y sin liquidación. No cuentan los contratos que nunca recibieron un pago y no tienen liquidación.
**Hecho el 11-nov:** construido y publicado (commit 1ec786f; la mig 222 la corrió el dueño a las 5:24 p. m.). Desde
ese commit, liquidar el contrato viejo de una moto que ya tiene otro cliente no la manda al taller, así que la RNG55H
y la XZO72H ya se pueden liquidar.
