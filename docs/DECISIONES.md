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
