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
