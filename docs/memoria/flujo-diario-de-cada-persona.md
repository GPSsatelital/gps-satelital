---
name: flujo-diario-de-cada-persona
description: "Escrito con el dueño el 9/10-sep-2026 en docs/FLUJO-DIARIO.md: el día del subadmin (oficina y teléfono, salir es la EXCEPCIÓN — durante meses se supuso que hacían ruta de cobro), la secretaria (primero lo que espera confirmación; la caja de transferencias se cierra al día siguiente), Sergio (supervisar a los demás primero) y el dueño (plata → decisiones → alarmas). Más el diseño de las tareas asignadas y el orden de construcción en 5 fases."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-10T19:13:35.693Z
---

# El día de cada persona (9/10-sep-2026) — `docs/FLUJO-DIARIO.md`

Es el paso que **nunca se había hecho** y que tenía parado el motor de pendientes: sin esto la
pantalla se construye adivinando. Y se venía adivinando mal.

## 🔴 El hallazgo que tira abajo lo que se suponía

**El día del subadmin es de OFICINA Y TELÉFONO. Salir a la calle es la excepción** — solo para
buscar una moto: no pagó, no cumplió una cita, o emergencia (robo). Durante meses se supuso que
hacían una ruta de cobro; el borrador que le presenté empezaba preguntando "¿por dónde arranca su
recorrido?" y la respuesta fue que no hay recorrido.

**El panel no es una ruta: es una lista de pendientes con un orden.** Su mañana: validar pendientes
→ llamar y escribir primero → las tareas asignadas → las que le vayan asignando durante el día.

Vocabulario: el dueño les dice **subadmin o administradores** (ZALA los llama "encargado"). En las
pantallas va la palabra de él.

## Las tareas asignadas — lo que pidió construir
> *"¿Podemos agregar algo donde se le monten tareas específicas diferentes a las del día a día, y
> que las marquen como cumplidas y si es caso dejar evidencias dependiendo de cuál sea la tarea?"*

- **Asignan** ADMIN_PRINCIPAL y ADMIN; **la secretaria más adelante** → montarlo sobre el permiso
  por persona que ya existe (`acciones.ts` + `puede()`): dárselo a Ángela = marcar una casilla.
- **Evidencias:** foto · ubicación · comentario · firma, y dijo *"abierto a más posibilidades"* →
  guardarlas **como datos, no clavadas en el código**.
- 🔴 **"No se pudo" es un estado APARTE de "cumplida"**, con motivo obligatorio, y **vuelve a quien
  la asignó** con aviso: para que nadie marque cumplido lo que no hizo y el que la mandó se entere
  el mismo día. Mockup aprobado: arriba lo del sistema, abajo lo asignado, lo cumplido tachado con
  su hora y su evidencia.

## Los otros tres
- **Secretaria:** lo primero es **lo que espera confirmación** (esa plata entró de verdad pero no
  cuenta hasta que ella decida). Al cerrar: nada sin confirmar y el efectivo de los subadmin
  recibido. 🔴 **La caja de TRANSFERENCIAS se cierra al día siguiente**, cuando ya entraron las de
  la noche. ⚠️ Sin verificar cómo cierra hoy `CajaView`/`useCaja` — no darlo por hecho.
- **Sergio (ADMIN):** *"tiene su propia lista, pero el trabajo principal es supervisar el trabajo de
  los demás admins"*. Su panel se lee **al revés**: primero cómo van los demás. Ver por persona qué
  le falta, qué no hizo, qué se le venció — **hoy no existe en ninguna pantalla**.
- **El dueño:** los tres bloques **en orden**: la plata → lo que espera su decisión → lo que sale mal.

## El cimiento, y por qué manda el orden
Las 19 alertas se calculan **en el navegador** (`useAlertas`), **sin dueño ni estado**. No se pueden
asignar, no se sabe qué quedó sin hacer, Sergio no puede supervisar lo que no queda registrado, y
**no puede haber notificaciones ni APK** porque sin la app abierta no hay quién avise.

Fases: **1** tareas + "Mi día" del subadmin · **2** las alertas mudadas al servidor con dueño y
estado · **3** panel de Sergio · **4** panel del dueño · **5** notificaciones y APK.

## ✅ FASE 1 CONSTRUIDA (10-sep) — mig 140 corrida · `7de002e`

`public.tareas` + permiso `asignar_tarea` + pantalla **Mi Día** (`MiDiaView`, `useTareas`,
`ModalAsignarTarea`, `ModalResolverTarea`). Capa nueva: no toca ninguna tabla existente.

- **Las reglas viven en la BASE, no en la pantalla:** el motivo del "no se pudo" lo exige un CHECK;
  crear exige el permiso **y** firmar con el propio id (nadie asigna a nombre de otro); **no hay
  DELETE** — una tarea se CANCELA, para que quede el rastro de que se pidió.
- 🔴 **Al correr la mig 140 el enganche del permiso FALLÓ, y estuvo bien que fallara:** la
  `_acciones_default` viva tenía `ceder_contrato` y `entregar_premio`, que la mig 048 no conocía.
  Se reescribió desde `pg_get_functiondef` de la base viva (regla de la mig 124) y la verificación
  comprueba que esas dos **siguen vivas**. Espejo obligatorio: `DEFAULT_ACCIONES` en `acciones.ts`.
- **"No se pudo" es un camino de primera clase**, al lado de "La cumplí": si la única salida visible
  fuera "cumplida", la gente marcaría cumplido lo que no hizo.
- **El cobro del día NO se duplicó** en Mi Día: se enlaza a Cartera. Dos copias de la misma lista es
  como nacen las dos verdades que este proyecto ya pagó caro. Se unen en la fase 2.
- Navegación en los DOS menús (sidebar + hoja Más), y `mi_dia` en `MODULOS_SIEMPRE`: esconderla por
  permisos dejaría a alguien con trabajo montado y sin dónde verlo.
- ✅ **Probado en PRODUCCIÓN por mí** (con el navegador del dueño): montar una tarea, verla en "Las
  que mandé", cancelarla. La base quedó limpia — la de prueba se canceló.
- 🔴 **Lo que destapó esa prueba (mig 141):** `public.tareas` **nació fuera de la publicación
  `supabase_realtime`**, así que se creaba la tarea, el formulario cerraba sin error y la lista
  seguía vacía hasta recargar. **A toda tabla NUEVA que se vea en pantalla hay que meterla a la
  publicación a mano.** Es el mismo daño que costó el cobro duplicado del saldo a favor: si la
  pantalla no refleja lo que acabas de hacer, la persona lo vuelve a hacer. Arreglado por los dos
  lados: la migración, y `useTareas` refresca tras CADA escritura sin esperar el aviso del servidor.
  ✅ **Mig 141 corrida y el arreglo verificado en producción**: al montar la segunda tarea de prueba
  apareció al instante, sin recargar, y al cancelarla desapareció sola. Base limpia.
- 🔲 **Falta probar con un usuario SUBADMIN real** (crear una tarea y que él la resuelva): se
  verificó la pantalla y la validación sin escribir en la base.

## ✅ FASE 2 CONSTRUIDA (10-sep) — migs 142 y 143 · `1d8f5d0`

`public.pendientes` (vista) + `public.pendientes_atendidos` (tabla chica) + `usePendientes` +
el bloque de pendientes en **Mi Día**.

🔴 **LA DECISIÓN QUE MANDA: no se guardan las alertas como filas.** El documento decía "mudarlas al
servidor con dueño y estado", que suena a materializarlas — y eso habría creado un SEGUNDO lugar
donde vive la verdad: guardar "Nelson está en mora" obliga a acordarse de borrarlo cuando pague. Se
separó: **lo que se DEDUCE se calcula** (la vista, imposible de desincronizar) y **lo que no se
deduce se guarda** (quién lo atendió, por DÍA: lo atendido hoy vuelve mañana si sigue vigente).

- **Se reusó la calculadora de la vitrina.** De las 19 alertas, **11 ya tenían su cálculo hecho y
  verificado** en `zala.*` (espejo del TS, 322 contratos, 0 diferencias). La mig 142 cubre 9.
  Faltan 8: base completada · contrato sin activar · cesión · validar ubicación · doc de préstamo ·
  dinero sin identificar · traspaso próximo · convenio incumplido (el conteo de 3).
- ✅ **Espejo verificado antes de tocar pantallas:** mora 85 + recolección 42 = **127** = el chip
  Mora de Cartera; gabela **25** = 25; por confirmar **4** = 4. Recién ahí se conectó Mi Día.
- 🔴 **`security_invoker = true`** en la vista: respeta la RLS que YA existe, así el SUBADMIN ve
  solo lo suyo sin un segundo juego de permisos. Requiere PG15+ (verificado).
- 🔴 **Choque que destapó (mig 143):** `permission denied for schema zala`. La vista corre con los
  permisos del usuario y `zala` está cerrado a todos menos a `zala_lector`. Se abrió la puerta
  ANGOSTA: `usage` + `execute` sobre funciones (cálculo puro que corre con los permisos del que
  llama), **NUNCA `select` sobre las vistas** — `zala.cliente/moto/pagos` siguen solo para el lector.
  La alternativa (copiar las funciones a `public`) habría sido una TERCERA copia de la cuenta.
- **`usePendientes` NO usa el store de tiempo real**: una VISTA no emite avisos de cambio. Se pide
  al abrir la pantalla y al volver a ella.
- **Hallazgo operativo:** el trabajo está desbalanceado — Lumar 77 pendientes, Carlos Álvarez 53,
  Brandon 52, Carlos Ariza 27. Y **20 motos con SOAT VENCIDO circulando** (+20 por vencer, 4 tecno
  vencidas, 12 paradas en taller >7 días): riesgo legal que estaba enterrado entre 431 avisos.
- 🔲 **La campana y AlertasView NO se tocaron**: siguen con `useAlertas` en el navegador. Se cambian
  cuando Mi Día esté probado con un subadmin — hay que conservar una contra la cual comparar.
- ✅ **Seguridad verificada:** `has_table_privilege('authenticated', …)` sobre `zala.cliente`,
  `zala.moto` y `zala.pagos` da **false** en las tres. La puerta quedó angosta.

## ✅ FASE 2 COMPLETA + FASES 3 y 4 (10-sep) — mig 144 · `f47c063`

**Los 19 avisos ya viven en el servidor.** La 142 dejó 9; la 144 sube los 10 que faltaban (base
completada · contrato sin activar · cesión · validar ubicación · doc de préstamo · dinero sin
identificar · moto retenida · traspaso · 3er acuerdo incumplido · acuerdo por vencer).

- **Columna `monto`**: sin ella el panel del dueño solo puede decir "4 pagos", nunca "$1.240.000".
  🔴 En los avisos de cobro es **la cuota y el acuerdo VENCIDOS**, no la deuda total — y solo suma
  `recoleccion` + `mora`, que son excluyentes (sumar plazo/promesa contaría dos veces al mismo).
- **Niveles alineados con la campana a propósito** (SOAT/tecno en 4 escalones, transferencia info
  el día 1, taller info hasta los 15): para poder comparar aviso por aviso ANTES de apagar la vieja.
- **3 diferencias que se dejan**: la mora respeta el plazo extra y cuenta días vencida (mig 136);
  plazo/promesa se callan si hoy está al día; el taller mira la ORDEN abierta, no `motos.estado`.
- 🔴 **Se acabaron los avisos huérfanos**: moto sin subadmin → el aviso pasa al rol ADMIN. Antes no
  le salían a NADIE en su lista.
- **Fase 3 `PanelEquipo`** (ADMIN/AP): por persona — por hacer, urgentes, tareas vencidas, hechos
  hoy. Ordenado por quién tiene más. Muestra a quien **no tiene nada** (Johan David Rojas).
- **Fase 4 `PanelDelDia`** (AP): plata → decisiones → alarmas, en ese orden porque así lo pidió.
- **Mi Día agrupa en 4 frentes** (cobro · plata · motos · contratos): con 19 tipos, una sola pila
  dejaba el cobro de la mañana revuelto con un SOAT por vencer.
- ✅ **Migs 144 y 145 CORRIDAS y verificadas en pantalla** (`397353a`). Espejo contra la campana:
  433 en la vista vs 428 en la campana, y mora/gabela/por-confirmar dan exactamente lo de Cartera.
  Cero huérfanos. **Falta apagar `useAlertas`** — se deja prendida para tener contra qué medir.

## 🔴 EL CUPO DIARIO (mig 145) — lo que destapó contar los avisos

Al contar los 19 tipos: **`validar_ubicacion_moto` eran 192 — el 44% de los 433**, más que mora
(85), recolección (39) y SOAT (40) juntos. Nace con la entrega y **no se va hasta que alguien la
revise en el GPS**; nadie lo hizo nunca. De 322 contratos activos, **192 sin validar, la más vieja
de 838 días**. Brandon 62 · Carlos Ariza 53 · Carlos Álvarez 46 · Lumar 31.

Palabras del dueño: *"esas tareas hay que hacerlas, no sé cómo podríamos hacer para que no
estorben pero que tampoco se dejen de hacer"*. La respuesta: **cupo diario de 5 por encargado.**
- Vista nueva `public.validar_ubicacion_cola` = la fila completa con su turno. **Una sola fuente**
  para el cupo Y para el "quedan N": si salieran de lados distintos, terminarían diciendo cifras
  distintas (el defecto de las dos cuentas de la mora). `pendientes` toma `turno <= 5`.
- **Turno:** primero las entregadas hace ≤7 días (ahí la revisión sirve de verdad), después las
  más viejas primero. Al marcarla desaparece **de verdad** (queda quién y cuándo), no es un
  "atendido" que vuelve mañana. A 5/día queda limpio en 3 semanas.
- ✅ Verificado: 433 → **261** pendientes · validar 192 → **20** en la lista · la fila sigue en 192.
- 🔴 **Hueco que iba de la mano:** el botón de marcarla era solo ADMIN/AP, pero el aviso es del
  encargado de la moto. Le salía la tarea a diario **sin nada con qué cerrarla**. El dueño
  confirmó que **los subadmin sí entran al GPS** → se le abrió `PanelGuardadoMoto`. La RLS ya se
  lo permitía desde la mig 035, acotado a SUS contratos: solo faltaba mostrarlo.
- 🐛 **`#root { text-align: center }`** viene de la plantilla de Vite y **toda la app lo hereda**;
  cada pantalla lo pelea con `textAlign` explícito. Los paneles nuevos salían centrados. Se
  corrigió solo en lo nuevo — tocar el CSS global movería texto de pantallas que ya se ven bien.

**Fase 5 (notificaciones/APK) tiene su cimiento listo.**

**Why:** el motor de pendientes llevaba meses parado porque nadie había escrito qué hace cada
persona en su día; se iba a construir sobre una suposición equivocada (la ruta de cobro).
**How to apply:** las decisiones de `docs/FLUJO-DIARIO.md` **no se vuelven a preguntar**. Lo que
sigue abierto está marcado ahí: si la tarea va sobre una moto/cliente o puede ser suelta, la fecha
límite, y si los demás roles también tienen "Mi día". Ver [[flujo-operativo-y-pendientes]].
