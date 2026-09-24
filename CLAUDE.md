# MotoGestión — GPS Satelital Cartagena
**SaaS de gestión integral de flota de motos en arriendo**
Supabase: `jvfkprkjysjffhzjitgl` | Repo: `GPSsatelital/gps-satelital` | Producción: Vercel desde `main`

---

## 📖 QUÉ ES ESTE ARCHIVO — leer antes de escribirle una línea

Este archivo es **LA ESPECIFICACIÓN**: cómo funciona el negocio, las reglas, las fórmulas, los
permisos, las convenciones. **Solo lo que no se vence.**

🔴 **REGLA DE ORO: si una frase puede volverse falsa sola con el paso del tiempo, NO VA ACÁ.**

*"La tarifa del domingo se redondea al millar hacia arriba"* → se queda: es verdad hoy y en cinco años.
*"Vamos por la migración 029"* → no va: fue verdad un día.

**Cada cosa tiene su casa, y ninguna es esta:**

| Qué buscás | Dónde está |
|---|---|
| Dónde estamos hoy (rama, migraciones, pruebas) | **Se mide al arrancar**, no se lee de ningún documento |
| Qué falta hacer | `docs/PENDIENTES.md` |
| Qué se decidió, cuándo y por qué | `docs/DECISIONES.md` *(solo se agrega, nunca se edita)* |
| Qué pasó antes | `docs/HISTORIAL.md` · `docs/memoria/` |
| Cómo trabajamos y por qué | `docs/ESTANDAR.md` |
| En qué me equivoqué y qué lo evita | `docs/DERRAPES.md` |

> **Por qué existe esta regla** (24-sep-2026, decisión D-019): este archivo llegó a 1.426 líneas
> porque cada sesión le agregaba su bitácora y nadie podaba. El 31% era diario de julio, y le
> decía a cada sesión nueva que íbamos por la migración 029 —vamos por la 167—, que se trabajaba
> en una rama que ya no existe, y que faltaban por construir cosas que hacía meses estaban hechas.
> Eso es exactamente *"en una sesión nueva empezás a creer cosas que no son"*.

---

## REGLA DE AUTORIZACIÓN — OBLIGATORIO SIEMPRE

**Nunca implementar nada sin antes describir el plan y esperar confirmación explícita del usuario.**

### REGLA DE VERIFICACIÓN PREVIA — OBLIGATORIO SIEMPRE
Esto aplica también **dentro** de una tarea ya aprobada, no solo al inicio. Si al escribir un cambio surge una decisión con más de una interpretación válida (ej. "¿exactamente qué roles ven esto?", "¿este dato incluye o excluye tal caso?"), **detenerse y preguntar antes de escribir el código** — no implementar la primera interpretación y corregirla después si sale mal. Autocorregir sobre la marcha es señal de que faltó verificar antes de tocar el código.
- Ejemplo de error real: se escribió una condición de permisos usando `esSecretaria` sin verificar antes si ADMIN debía quedar incluido — resultó que sí, y hubo que corregir la condición ya escrita en vez de haber preguntado primero.

---

## REGLA DE NO ROMPER LO QUE YA FUNCIONA — OBLIGATORIO SIEMPRE
*(pedida por el dueño el 5-ago-2026, después de que un cambio "de paso" rompiera la regla de la última cuota de los convenios y de perder días rehaciendo cosas que ya estaban definidas)*

### 1. Explicar en palabras sencillas, y confirmar que se entendió — ANTES de tocar nada
No basta con describir el plan: hay que **asegurarse de que el dueño lo entendió**. Si respondió
"no entendí", el problema es de la explicación, no de él — se explica otra vez, más simple,
**con un ejemplo concreto o un dibujo de cómo se vería la pantalla**, y solo se avanza cuando él
confirma. Nunca implementar sobre una explicación que quedó a medias.
- Prohibido: menús de opciones abstractas sin ejemplo. Sirve: "el formulario tendría esta línea
  más: [dibujo]", "son 4 alcancías y hoy el sistema adivina en cuál va la plata".

### 2. Lo que ya está hecho y funciona NO se cambia ni se supone
- **No se reemplaza lo que anda.** Si hay dos formas de hacer algo y una funciona bien, se toca
  la otra. Nunca migrar la buena al molde de la mala.
- **No se "mejora" de paso** nada que no se haya pedido, aunque parezca obvio.
- **No se supone cómo funciona algo ya construido**: se abre el código o se consulta la BD y se
  verifica. Una regla de negocio vieja puede vivir SOLO dentro del código, sin estar escrita.
- **El build en verde NO es prueba de que el comportamiento se conservó.** `tsc` y `npm test`
  avisan de referencias rotas, no de reglas perdidas. Antes de tocar lógica de plata, escribir la
  prueba del comportamiento ACTUAL.

### 3. En CADA arreglo, declarar qué se tocó de lo que ya existía
Todo cambio se entrega diciendo explícitamente:
- **qué se tocó** de lo que ya estaba funcionando (y por qué había que tocarlo),
- **qué NO se tocó** aunque estuviera cerca,
- **qué puede verse distinto** en pantalla a partir de ahora.
Si un arreglo no toca nada existente, también se dice: *"esto no cambia nada de lo que ya había"*.

### 4. Antes de culpar a un cambio propio, verificar con datos
Cuando algo aparece roto, revisar **fechas y evidencia** antes de concluir. Vale igual en los dos
sentidos: no asumir que un defecto viejo lo causó un cambio nuevo, ni descartar que sí lo hizo.
- Ejemplo real: 9 de 12 convenios con el defecto de las semanas financiadas se firmaron ANTES del
  cambio sospechoso — el disparador que fallaba era de la migración 054, de dos semanas antes.

---

## REGLA DE LA VITRINA (ZALA) — OBLIGATORIO SIEMPRE
*(aprobada por el dueño el 4-sep-2026; construida el 7-sep, mig 126)*

ZALA (el bot de cobranza por WhatsApp) **solo lee el esquema `zala`** con el rol `zala_lector`.
Nunca tablas crudas, nunca `service_role`. La vitrina es el espejo SQL de la calculadora de la
pantalla (`src/utils/cicloPago.ts`), y `zala.diccionario` es lo que ZALA lee primero:
**si no está en el diccionario, no existe para ZALA.**

Toda función nueva que cree un **estado**, un **valor posible** o una **cifra que se muestre**
entrega tres cosas en la misma migración o commit, o la tarea no se cierra:
1. Su fila en `docs/DICCIONARIO-ESTADOS.md` y en `zala.diccionario` (con `zala_lo_dice`).
2. Su columna o valor en la vista de `zala` que corresponda.
3. Si toca plata o estado de cartera: su caso en la prueba espejo
   (`motogestion/scripts/vitrina-espejo.browser.js`), que compara `loQueDebe()` contra `zala.cliente`
   contrato por contrato. **Un peso de diferencia = no se despliega.**

Si se toca `cicloPago.ts` (cuota, acuerdo, estado, días de mora, próximo pago) hay que tocar la
función espejo en `zala` y volver a correr la prueba. Misma disciplina que `repartoPago.ts` ↔ motor.

---

## REGLA DE ROL — OBLIGATORIO SIEMPRE

Actuar **SIEMPRE como el arquitecto de software experto y consultor del proyecto**, no como un ejecutor pasivo que espera instrucciones. Esto significa:
- **Liderar el planteamiento:** proponer el plan, el orden, la arquitectura y la estrategia de migración/entrega por iniciativa propia — no esperar a que el usuario lo arme.
- **Anticipar problemas a futuro:** señalar riesgos, casos borde y consecuencias aunque no me los pregunten.
- **Recomendar el mejor camino con criterio profesional:** dar una recomendación clara (no un menú de opciones sin postura), explicando el porqué.
- **Traducir lo que el usuario pide a lo que el negocio necesita:** si hay una forma más simple, más segura o menos riesgosa de lograr el objetivo, proponerla.

El usuario decide; Claude asesora con criterio experto y voz propia. Esto NO cambia la REGLA DE AUTORIZACIÓN: liderar el plan no es implementar sin permiso — se propone y se espera confirmación antes de tocar código o la BD.

---

## REGLA DE CONTEXT7 — OBLIGATORIO SIEMPRE

Cuando la tarea o pregunta involucre cualquiera de estas librerías: **Supabase** (BD, auth, storage, RLS, realtime, políticas), **React** (hooks, contextos, renders), **TypeScript** (tipos, interfaces, generics) o **Vite** (build, env, PWA) — sugerir explícitamente al usuario:

> "💡 Esta pregunta involucra [librería]. Te sugiero agregar **'use context7'** a tu mensaje para que traiga la documentación actualizada y evitar que te dé una API desactualizada."

Indicar siempre: qué librería detecté, por qué conviene usarlo en ese caso puntual, y qué información específica traería.

---

## REGLA DE SKILLS Y HERRAMIENTAS — OBLIGATORIO SIEMPRE

Para CUALQUIER tarea, **evaluar primero qué skill/habilidad o herramienta MCP se adapta mejor y usarla**, en vez de improvisar a mano. La elección se declara al inicio de la tarea. Guía rápida:
- **Diseño/UI** (color, tipografía, layout, componentes, animación) → skills de diseño (`interface-design`, `design-review`, `design-component`, `design-tokens`, `apply-aesthetic`, `redesign`, `a11y-audit`…) + mostrar mockup antes de implementar. Ver sección "SISTEMA DE DISEÑO".
- **Documentación de librerías** (Supabase, React, TypeScript, Vite) → Context7 (sugerir "use context7").
- **Problema complejo con varias causas interdependientes** → sequential-thinking.
- **Trabajo grande multi-etapa dependiente** (módulo nuevo, migración, rediseño de varias pantallas, planes de entrega) → el plan va a `docs/PENDIENTES.md` y las decisiones a `docs/DECISIONES.md`; Superpowers solo si hace falta spec formal + revisión adversarial.
- **"¿dónde está X / cómo se conecta con otros módulos?"** → codebase-memory (grafo indexado) antes de grep manual.
- **Redacción de UI/copys** → `ux-writing`.
- **Documentos/manuales/presentaciones** → estructurar como entregables versionados en el repo (carpeta `docs/`), no sueltos en el chat.

Esto NO cambia la REGLA DE AUTORIZACIÓN: implementar código o tocar la BD sigue requiriendo plan + confirmación explícita, sin importar qué herramienta se use por debajo. Elegir bien la herramienta es parte de hacer el trabajo profesional; usar la equivocada (o ninguna) por defecto es el error a evitar.

---

## POLÍTICA DE HERRAMIENTAS MCP — OBLIGATORIO SIEMPRE

Objetivo: equilibrio entre consumo (tokens/tiempo) y calidad — priorizando que el resultado quede bien estructurado. Cada herramienta tiene un rol único para no duplicar esfuerzo entre ellas.

### Automáticas (no requieren acción del usuario)
- **claude-mem** — memoria de continuidad de sesión (qué se hizo, decisiones, hilo de la conversación). Hooks ya activos (SessionStart, PostToolUse, Stop).
- **MemPalace** — memoria de hechos/entidades a largo plazo (personas, proyectos, relaciones), NO continuidad conversacional (eso ya lo cubre claude-mem). Hooks de guardado ya activos. Solo consultar sus datos cuando la pregunta sea sobre "qué sabemos de X" — no en cada mensaje, para no duplicar con claude-mem.

### Bajo demanda — evaluar en cada tarea y sugerir (no forzar)
- **Context7**: cuando la tarea involucra Supabase, React, TypeScript o Vite. Sugerir con el formato ya definido en la regla de Context7.
- **Sequential-thinking**: solo en problemas realmente complejos con múltiples causas/partes interdependientes (ej. depurar un bug con varias causas posibles). Sugerir: "💡 Este problema tiene varias partes interdependientes, te sugiero usar sequential-thinking para razonarlo paso a paso."
- ~~**Taskmaster**~~: **quitado el 24-sep** (decisión D-021). Nunca se usó, nunca conectaba, y `docs/PENDIENTES.md` hace lo mismo con la ventaja de que el dueño lo puede leer.
- **Superpowers**: la disciplina base (brainstorm→plan→revisión) ya la cubren la REGLA DE AUTORIZACIÓN y la REGLA DE MAPEO INTEGRAL de este archivo. Usarlo por iniciativa propia (sin que el usuario lo pida) solo cuando esas reglas nativas se queden cortas — ej. rediseño de un módulo completo con múltiples pantallas afectadas, o una feature nueva grande con muchas decisiones de arquitectura donde conviene su spec formal y revisión adversarial. No usarlo en fixes, ajustes puntuales, o features de tamaño normal — ahí el flujo nativo ya es suficiente y más rápido.

**Regla general:** no usar ninguna de estas en tareas simples o puntuales (fixes de una línea, preguntas de negocio, ajustes de UI menores) — ahí solo agregan overhead sin beneficio.

### Frontend Design (plugin oficial de Anthropic)
El estilo visual actual (paleta, tipografía, componentes) **no es intocable** — se puede replantear y mejorar. Usarlo tanto para proponer mejoras visuales a pantallas existentes como para diseñar pantallas nuevas.

**Lo que SÍ se puede cambiar:** colores, tipografía, espaciados, animaciones, composición visual — cualquier decisión puramente estética.

**Lo que NUNCA se puede tocar al aplicar este plugin:**
- La estructura funcional del sistema (flujos, navegación, lógica de negocio, fórmulas, permisos por rol)
- Las convenciones técnicas ya fijas: `style={{}}` inline puro (cero Tailwind/MUI/Bootstrap), mobile-first con `useIsMobile()`
- Cualquier cambio visual sigue pasando por la REGLA DE AUTORIZACIÓN — proponer el cambio y esperar confirmación antes de aplicarlo, especialmente si toca muchas pantallas (mapeo integral)

### Theme Factory (paleta/tipografía)
Genera referencia de paleta de colores y tipografía (temas preseleccionados o a medida) — NO se auto-aplica al código. Traducir manualmente el tema elegido al sistema de estilos inline existente (mismas reglas de protección que Frontend Design arriba). Usar en conjunto con Frontend Design: Theme Factory define qué colores/fuentes, Frontend Design decide cómo se componen visualmente.

### codebase-memory — se consulta SIEMPRE (única de este grupo)
> ⚠️ **"Siempre" es la intención, no un hecho: hay que VERIFICAR que conectó al arrancar la sesión.**
> El 23-sep no conectó ninguna de cinco herramientas y este archivo la daba por activa — se trabajó
> a ciegas sin avisar. Desde entonces, **toda sesión empieza reportando qué herramientas están
> caídas** (decisión D-017). Si `codebase-memory` no está, se busca con `grep` y **se dice**.

A diferencia de las demás herramientas bajo demanda, esta se consulta **siempre por defecto**, sin evaluar caso por caso — consultarla es barato y nunca perjudica. Para cualquier pregunta de "¿dónde está X en todo el proyecto?" o "¿cómo se conecta este módulo con otros?", usar primero el grafo indexado de `codebase-memory` en vez de `grep`/`Explore` archivo por archivo (gasta muchos menos tokens). Si el grafo no tiene la respuesta o parece desactualizado, recién ahí usar grep manual y re-indexar (`index_repository`) sin necesidad de preguntar — es una acción segura y de bajo costo.

### Autonomía delegada (no requiere confirmación previa)
- Elegir qué MCP de memoria consultar según el tipo de pregunta
- Decidir cuándo usar codebase-memory vs grep
- Re-indexar codebase-memory cuando se detecte desactualizado

Esto NO cambia la REGLA DE AUTORIZACIÓN: implementar código o tocar la base de datos sigue requiriendo plan + confirmación explícita, sin excepción, sin importar qué herramienta se use por debajo.

---

## REGLA DE PREGUNTAS — OBLIGATORIO SIEMPRE

**Hacer las preguntas UNA POR UNA (nunca varias juntas), y siempre ofreciendo opciones para autoseleccionar la respuesta.**

---

## REGLA DE SQL — OBLIGATORIO SIEMPRE

**Nunca enviar archivos SQL para descargar. Siempre pegar el código SQL directamente en el chat como bloque de código para copiar y pegar.**

---

## REGLA DE DESPLIEGUE — OBLIGATORIO SIEMPRE

**Vercel despliega automáticamente solo desde `main`. Sin llegar a `main`, nada llega a producción.**

Hoy se trabaja **directo sobre `main`**, así que basta con:

```bash
git push origin main
```

Si alguna vez se trabaja en otra rama, hay que volver a `main` y traerla:

```bash
git checkout main && git pull origin main && git merge <la-rama> && git push origin main
```

> ⚠️ **Ventana de despliegue (decisión del 23-sep):** el negocio cobra **lunes y miércoles**. Nada
> que toque el motor, cartera, pagos o el reparto se despliega esos días **antes de las 6 de la
> tarde**, salvo que sea justamente para arreglar plata mal contada de hoy.

---

## PROTOCOLO ANTES DE IMPLEMENTAR — OBLIGATORIO SIEMPRE

Antes de escribir cualquier línea de código, declarar explícitamente:
1. **Qué regla de negocio aplica** (citar la sección de este archivo)
2. **Qué campos de BD involucra** (tabla.campo)
3. **Cómo se conecta con otros módulos** (ver sección CONEXIONES)
4. **Qué fórmula usa** (ver sección FÓRMULAS)

El usuario confirma antes de codificar. Esto evita implementar cosas sin sentido o desconectadas.

### REGLA DE MAPEO INTEGRAL — OBLIGATORIO SIEMPRE
**Antes de cualquier cambio, mapear TODOS los paneles/vistas/componentes que tocan el mismo dato y verificar cómo se relacionan.** No basta con cambiar el aspecto puntual: un cambio o filtro debe quedar integrado en TODO el sistema (dashboard, campana de alertas, búsqueda global, fichas, listas, KPIs, etc.), no solo donde se pensó primero.
- Ejemplo de error: filtrar contratos por SUBADMIN en CobrosView pero olvidar el Dashboard, la campana de alertas y la búsqueda global → datos inconsistentes según la pantalla.
- Mecánica: `grep` de los hooks involucrados (`useMotos`, `useContratos`, `useClientes`, `useAlertas`, etc.) en TODAS las vistas → confirmar cuáles cargan el dato y cuáles ya aplican la regla.

#### Checklist obligatoria antes de cerrar CUALQUIER tarea (cálculos, funciones, validaciones, permisos, textos, lo que sea)
No basta con que la tarea funcione donde se probó. Antes de darla por terminada:
1. `grep` de la lógica/función/variable/condición involucrada en **todo `src/`**, no solo en el archivo donde se hizo el cambio — buscar si está duplicada o repetida en otro componente.
2. Listar explícitamente en el chat **cada lugar** donde aparece esa misma lógica (archivo + línea).
3. Confirmar uno por uno cuáles deben recibir el mismo cambio y cuáles no (con su razón).
4. Solo entonces aplicar el cambio en todos los sitios confirmados y correr `tsc --noEmit`.
- Ejemplo de error real: se corrigió el cálculo de prorrateo en el panel de detalle, el modal de pago rápido y el cobro en campo, pero quedaron sueltos la lista de Contratos, el panel Hoy y la pantalla de referencia del formulario de campo — mismo bug visible en 3 pantallas más después de "terminado" el fix.

---

## REGLAS DE LAS CIFRAS DE PLATA — OBLIGATORIO SIEMPRE
*(cerradas con el dueño el 12-ago-2026, después de que LIBINTO pagara $302.000 y la pantalla le
siguiera cobrando los mismos $100.000 del convenio. Pedido textual: "que cartera quede funcionando
perfecto de una vez por todas".)*

### 1. Cada cifra dice QUÉ PREGUNTA responde — y no se mezclan
"Le falta por pagar", "Total del acuerdo" y "Deuda registrada" son tres cosas distintas y **no
pueden compartir etiqueta**. El defecto de LIBINTO fue exactamente ese: el número decía *"le falta
por pagar"* pero traía adentro la cuota **completa** del acuerdo, ya pagada.
- **La cifra que se cobra siempre resta lo ya pagado.** Si ya pagó, dice **$0**.
- El monto **pactado** puede seguir mostrándose (el chip "Convenio: $100.000/período" está bien),
  pero entonces la etiqueta debe decir cuánto **vale**, no cuánto **debe** — y conviene marcar
  "· ya pagada" para que nadie lo lea como pendiente.

### 2. Antes de cambiar cómo se calcula **O CÓMO SE MUESTRA** una cifra: buscarla en todo `src/`
La checklist de arriba ya obliga a esto para el **cálculo**. Se extiende a **lo que se muestra**:
un número correcto explicado con la etiqueta equivocada es un defecto igual de caro — el
funcionario le cobra de más a un cliente que ya pagó.
- Caso real: *"¿cuánto debe hoy?"* estaba escrito en **10 lugares** (9 en `CobrosView` + 1 en
  `CobroDiarioView`) y **no coincidían entre sí**. Cada arreglo tocaba una y dejaba nueve diciendo
  otra cosa. Por eso "se dañaba con cada cambio".
- 🔴 **Hoy existe UNA sola función: `loQueDebe()` en `src/utils/cicloPago.ts`.** Devuelve el
  desglose completo (`cuota` · `acuerdo` · `deudas`, cada uno con `toca`/`pagado`/`falta`), no solo
  el total — así el número grande y el recuadro que lo explica salen del **mismo objeto** y no
  pueden contradecirse. **Ninguna pantalla vuelve a sumar la cuota del convenio a mano.**
- Está protegida por `src/utils/loQueDebe.test.ts` con las cifras REALES de producción. Si alguien
  le cambia la cuenta a uno de esos clientes, `npm test` lo caza antes de llegar a producción.

### 3. Nunca quitar un dato de la vista sin reponerlo
Si un campo cambia de significado, el dato viejo se muestra en otro lado — no se borra y ya.
- Caso real (12-ago): el formulario de convenios pasó de *"Fecha del primer pago"* (a mano) a
  *"Fecha límite"* (calculada). El cambio era correcto — sin él nacía un convenio ya vencido — pero
  **se quitó de la vista un dato que el dueño usaba a diario** y hubo que reponerlo aparte.

### Reglas de negocio que aplican al cálculo (cerradas, NO re-preguntar)
- **La cuota del acuerdo se ARRASTRA.** Cuota $100.000, abonó $40.000 → la semana siguiente le tocan
  **$160.000**. Nunca se le exige más que el `deuda_total` pactado.
- **El saldo a favor se MUESTRA, nunca se resta solo** — se aplica a mano.
- **El convenio de base no se cobra encima del prorrateo**: el primer día de pago solo se cobra lo
  que rodó; el acuerdo arranca el siguiente período completo.

---

## STACK

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript |
| Build | Vite 8 |
| Base de datos | Supabase (Postgres + Auth + Realtime) |
| Deploy | Vercel — rama `main` |
| Estilos | CSS inline puro — **cero UI frameworks** |

---

## CONVENCIONES — NUNCA VIOLAR

- **Estilos:** Solo `style={{}}` inline. Nunca Tailwind, MUI, Bootstrap, etc.
- **Comentarios:** Solo cuando el WHY es no obvio. Nunca comentarios decorativos.
- **Features:** Exactamente lo pedido. Sin extras, sin abstracciones prematuras.
- **Commits:** En español, descriptivos
- **Nombres:** Todos los nombres de personas → `textTransform: "uppercase"` en CSS
- **TypeScript:** Siempre resolver errores TS antes de hacer push. `npm run build` debe pasar.
- **Responsive:** Mobile-first. `useIsMobile()` = `window.innerWidth < 900`. Bottom tab bar en móvil, sidebar en desktop.
- **Tamaño de referencia móvil — OBLIGATORIO SIEMPRE:** **375px de ancho** (iPhone SE / el celular angosto más común) es el estándar contra el que se prueba cualquier pantalla o ajuste móvil. Si se ve bien a 375px, se ve bien en cualquier celular más ancho hasta el punto de quiebre (900px). Todo cambio de UI se verifica visualmente a este ancho antes de darlo por terminado.
- **Estilos compartidos — OBLIGATORIO SIEMPRE:** Usar `src/styles/shared.ts` (`card`, `inputStyle`, `labelStyle`, `primaryBtn`, `secondaryBtn`, `listaConScroll(isMobile)`) en vez de redefinir estos estilos en cada pantalla. Cualquier lista nueva usa `listaConScroll(isMobile)` para quedar dentro de un recuadro con su propio scroll — nunca una lista debe poder ocupar toda la pantalla sin límite.
- **Bug recurrente de flexbox que desborda en móvil — verificar siempre:** un elemento dentro de un `display:"flex"` (fila o columna) puede desbordar el contenedor aunque tenga `width:"100%"`, porque por defecto un ítem flex no se encoge más allá del ancho de su propio contenido (`min-width:auto` implícito). Pasó 3 veces en la misma sesión (columnas de Cartera, botones de acción de Alertas/Inmovilizaciones, tarjetas de la lista de Clientes). **Siempre agregar `minWidth: 0` explícito** a cualquier hijo directo de un contenedor flex que deba encogerse al espacio disponible (y `boxSizing:"border-box"` si además tiene padding). Verificar con medición real en el navegador (`getBoundingClientRect`), no solo capturas de pantalla — el DPR del dispositivo puede hacer que una captura se vea mal sin que sea un bug real.
- **Botones que crean/guardan registros (anti-doble-clic) — OBLIGATORIO SIEMPRE:** Todo botón que inserte o guarde en la BD (registrar, crear, guardar, confirmar excepción, etc.) DEBE:
  1. Tener un estado `procesando`/`guardando` (`useState(false)`).
  2. Al inicio del handler: `if (procesando) return;` y luego `setProcesando(true)` envuelto en `try { ... } finally { setProcesando(false) }`.
  3. En el botón: `disabled={procesando}` + texto dinámico que muestra la orden en curso (`{procesando ? "Guardando..." : "Guardar"}`) + `opacity: procesando ? 0.6 : 1`.
  - Excepción: updates idempotentes (fijan un estado fijo) NO requieren guarda porque no duplican registros.
- **Inputs de foto/archivo:** dos botones separados `[📷 Cámara]` (con `capture="environment"`) y `[🖼 Galería]` (sin capture). Android no permite ambos en un solo input.

---

## SISTEMA DE DISEÑO — OBLIGATORIO SIEMPRE (definido 22-jul-2026)

Antes de tocar CUALQUIER cosa visual (color, tipografía, layout, componente, animación): **invocar los skills de diseño** para fundamentar la decisión, y **mostrar mockup/preview** (herramienta visualize) ANTES de implementar. No improvisar a ojo.

**Skills de diseño del proyecto (instalados 22-jul, usar según el caso):**
- **`interface-design`** — arquitecto/guardián de craft para dashboards/SaaS (NUESTRO caso). Es el principal.
- **`design-review`** — auditar una pantalla (6 dimensiones + Nielsen + score) antes/después de construir.
- **`design-component`** — especificar un componente (anatomía, variantes, 8 estados, tokens, a11y) antes de codear.
- **`design-tokens`** / **`apply-aesthetic`** (138 sistemas: linear/stripe/vercel…) / **`redesign`** (mejorar sin romper) / **`ux-writing`** / **`a11y-audit`** / **`design-code`** / **`design-qa`** — según la tarea.
- `frontend-design` / `theme-factory` (oficiales de Anthropic) como apoyo de dirección estética.
- **OJO:** estos skills están pensados para UI genérica/producto. **Nuestra identidad LOCKED manda** (placa amarilla, navy, Inter para densidad operativa) — se adaptan a las necesidades de ESTE sistema, no imponen un genérico. Ignorar cualquier consejo suyo que contradiga la identidad (ej. algunos "prohíben Inter" — no aplica a apps operativas densas).

### Identidad (LOCKED — se refina, no se reemplaza)
- **Firma:** la **placa amarilla colombiana** (`src/components/Placa.tsx`, amarillo `#FFD100`) — es lo que hace la app inconfundible. Todo render de placa usa `<Placa>` (listas=`sm`, detalles=`lg`). Nunca placa como texto plano.
- **Paleta:** navy + cyan (día = paleta clara actual, noche = navy). Tokens día/noche en `src/index.css` (`:root[data-theme=light|dark]`). Texto sobre `--ink` usa `--on-ink` (nunca `--card`, que es navy en noche).

### Tipografía
- Fuente UI = **Inter** (`--font-ui` en index.css, cargada en index.html). Documentos IMPRESOS (useDocumentos/TallerView/liquidación) siguen en Arial a propósito.
- `font-variant-numeric: tabular-nums` global (la plata aliña en columnas).
- Escala fija: **22 / 18 / 15 / 13 / 12 / 11 px**. Pesos **400/500/600/700** (nada de 800/900).

### Componentes = ÚNICA FUENTE (no dibujar filas/listas a mano)
- **`src/components/ListaEstandar.tsx`** → `ListBox` (recuadro con scroll, **58vh/64vh** via `listaConScroll`) + `ItemLista` (fila estándar: placa · título uppercase · subtítulo muted · `right`=badges/monto · `extra`=barra/chips · `rielColor`=color del estado · seleccionado · onClick). **TODA lista nueva DEBE usarlos.**
- Estilos compartidos en `src/styles/shared.ts` (`card`, `inputStyle`, `listaConScroll`, etc.).
- Al agregar UI: reutilizar el flujo/componente que YA existe, nunca un atajo paralelo (ver ERRORES PASADOS).
- OJO: varias vistas tienen listas **móvil Y desktop separadas** — al estandarizar, revisar y arreglar LAS DOS.

### Espaciado y átomos
- Grilla de **4px** (4/8/12/16/24). No 5/6/7/9/11 sueltos.
- Pendiente crear: componentes únicos `Badge`, `Chip`, `Btn` (hoy cada vista tiene el suyo).

### Movimiento
- **`framer-motion`** (instalado). Usar con **restraint** (entrada de listas, hojas/modales, transición de vista, micro-interacciones de estado). El exceso de animación hace que se vea "generado por IA".

### Verificación visual
- Siempre a **375px** (mobile-first). `npm run build` + `npm test` + preview logueado antes de dar por cerrado.

> Estado del rediseño y plan por fases (A: Cartera→ItemLista · B: tokens de átomos · C: plata-primero · D: framer-motion · E: resto de pantallas): ver memoria `compactar-densidad-movil` y `rediseno-visual-f1`.

---

## LA EMPRESA

**Nombre:** Club de moteros (nombre exacto y logo pendiente de recibir)
**Fundador/Arrendador legal:** FREDY MORA AVENDAÑO — C.C. 1.047.393.901
**Operación:** Cartagena y corregimientos (prohibido circular fuera de la ciudad)
**Flota actual:** ~350 motos | **Meta:** 1.000 motos
**Clientes activos:** ~300

### Estructura de socios y grupos
| Grupo | Dueño | Descripción |
|-------|-------|-------------|
| `RASTREADOR` | Fundador (Fredy Mora) | Su portafolio personal |
| `COSTA` | Socio 2 | Portafolio independiente |
| `PRADERA` | Socio 3 | Portafolio independiente |
| `USADAS` | Club | Motos usadas, 4º portafolio |

Cada grupo es un **portafolio de inversión independiente** — estadísticas, recaudo y reportes separados.

---

## ROLES Y PERMISOS

| Rol | Quién es | Qué puede hacer |
|-----|---------|-----------------|
| `ADMIN_PRINCIPAL` | Fundador + Admin general (dueño y jefe de todo) | Todo sin restricción · ve TODO |
| `ADMIN` | Encargado de toda la operación (una sola persona) | Todo de la operación · ve TODO · NO registra efectivo |
| `SUBADMIN` | Admin jr (hasta 4) — gestiona su grupo de motos asignadas en el día a día | **Solo ve/actúa sobre SUS motos asignadas** y las visitas que le asignen · gestión de cobro · NO registra efectivo, NO registra clientes, NO elige motos |
| `SECRETARIA` | Secretaria/aux contable | Registrar pagos efectivo, confirmar transferencias, visitas, registro clientes, gestión cobro |
| `MECANICO` | Mecánico de taller | Solo módulo taller |
| `SOCIO` | Los 3 socios | Solo lectura de dashboard de su grupo |

> ⚠️ **Jerarquía real (corrección):** El `ADMIN` NO es "admin jr". `ADMIN` = encargado de toda la operación (ve todo). El **admin jr es el `SUBADMIN`** (filtrado por sus motos). Orden: ADMIN_PRINCIPAL → ADMIN → SUBADMIN → SECRETARIA → MECANICO.

### SUBADMIN — filtrado global por motos asignadas (ver sección dedicada abajo)
- `motos.subadmin_id` define qué motos gestiona cada SUBADMIN (lo asigna ADMIN/ADMIN_PRINCIPAL en MotosView).
- `visitas.asignada_a` define qué visitas debe hacer cada SUBADMIN (lo asigna ADMIN/ADMIN_PRINCIPAL en ClientesView → PanelAprobacion).
- El SUBADMIN NO registra clientes: el embudo de ingreso (registro, documentos) lo hacen SECRETARIA/ADMIN/ADMIN_PRINCIPAL. El SUBADMIN solo hace las visitas que le asignen y, una vez existe contrato sobre su moto, gestiona ese cliente.

### Reglas críticas de permisos
- **Solo secretaria registra pagos en efectivo**
- **SUBADMIN (admin jr) NO puede:** registrar efectivo, crear contratos, registrar clientes, elegir motos (a menos que admin principal delegue)
- **Cobro en campo:** admin/subadmin recupera efectivo → crea "reporte de cobro en campo" → secretaria confirma y registra
- Trigger `enforce_cliente_estado_change()` usa `public.mi_rol()` (no `current_role()`) para verificar rol real

---

## ARQUITECTURA DE NAVEGACIÓN (App.tsx)

```
ViewKey = "dashboard" | "clientes" | "motos" | "contratos" | "cobros"
        | "taller" | "usuarios" | "liquidaciones" | "configuracion"
```

**Pendiente agregar:** `"reportes"` | `"caja"`

**Mobile:** Bottom tab bar (Panel/Clientes/Cartera/Motos/Contratos/☰Más) + `MasSheet` overlay
**Desktop:** Sidebar `#0f172a`, 240px expandido / 64px colapsado

### Secciones de navegación (móvil `MasSheet` y desktop `SIDE_GROUPS` — MISMA taxonomía)
- **OPERACIONES** (solo desktop; en móvil son tabs fijas abajo): Clientes · Contratos · Cartera & Cobros
- **COBROS & DINERO**: Cobro Diario · Historial Pagos · Caja Diaria
- **FLOTA & TALLER**: Motos (solo desktop) · Taller · Liquidaciones
- **SEGUIMIENTO**: Alertas · Inmovilizaciones · Reportes · Referidos
- **ADMINISTRACIÓN**: Usuarios · Configuración · Importación Excel
- La hoja Más (móvil) agrupa por estas secciones; cada sección se oculta si el rol no tiene ningún módulo visible (`puedeVer`). Contratos NO va en Más (está fijo en la barra inferior).
- Al agregar un módulo nuevo: ubicarlo en su sección tanto en `SIDE_GROUPS` (desktop) como en `secciones` del `MasSheet` (móvil) para mantener consistencia.

---

## FÓRMULAS Y CÁLCULOS EXACTOS

### Tarifa diaria y domingo
La tarifa del domingo NO es tarifa/2 exacta. Se redondea al millar hacia arriba:
```
tarifaDomingo = Math.ceil(tarifaDiaria / 2 / 1000) * 1000
```
Tabla de valores resultantes:
| Tarifa L-S | Domingo |
|-----------|---------|
| $26.000 | $13.000 |
| $27.000 | $14.000 |
| $28.000 | $14.000 |
| $30.000 | $15.000 |
| $32.000 | $16.000 |
| $35.000 | $18.000 |
| $40.000 | $20.000 |

### Desglose del período semanal (CRÍTICO — no dividir entre 7)
Los 7 días de la semana NO valen lo mismo. El desglose correcto para contrato $202.000 / tarifa $27.000:

| Días | Tarifa empresa | Ahorro cliente | Pago día | Subtotal |
|------|---------------|----------------|----------|----------|
| L–S (6 días) | $27.000 | $4.000 | $31.000 | $186.000 |
| Domingo (1 día) | $14.000 | $2.000 | $16.000 | $16.000 |
| **Total semana** | **$176.000** | **$26.000** | | **$202.000** |

**Regla general:**
- Ahorro L-S = pago_dia_LS - tarifa_LS
- Ahorro domingo = pago_dom - tarifa_dom
- Total semana = 6 × pago_dia_LS + pago_dom
- **NUNCA mostrar ni calcular como total/7** — esa cifra no tiene significado real

### Prorrateo hasta primer día de pago (CRÍTICO)
El día de entrega NO se incluye. El primer día de pago SÍ se incluye.
Si hay un domingo en el rango → cobrar `pagoDiaDom` ese día, no `pagoDiaLS`.
**Implementación correcta — iterar día a día:**
```ts
function calcPrimerPago(fecha, dia, pagoDiaLS, pagoDiaDom) {
  const base = new Date(fecha + "T00:00:00");
  const dow = base.getDay();
  const target = dia === "Lunes" ? 1 : 3;
  const dias = ((target - dow + 7) % 7) || 7;
  let total = 0;
  for (let i = 1; i <= dias; i++) {
    const d = new Date(base); d.setDate(d.getDate() + i);
    total += d.getDay() === 0 ? pagoDiaDom : pagoDiaLS;
  }
  ...
}
```
**NUNCA** multiplicar cuotaDiaria × dias sin detectar domingos.

### Base inicial requerida
```
Semanal:   $308.000 + valorSemanal
Quincenal: $308.000 + valorQuincenal  (= 2×valorSemanal + pagoDiaLS)
Mensual:   $308.000 + valorMensual    (= 4×valorSemanal + 2×pagoDiaLS)
Diario:    $0 (no aplica — están ahorrando)
```
El día extra de quincenal/mensual es un día L-S completo (`pagoDiaLS = tarifaLS + ahorroLS`), NO total/7.
Desglose: $308.000 = ahorro requerido | el resto = período(s) adelantados.
**No mostrar el aviso de base hasta que `valorSemanal > 0` Y haya cliente seleccionado.**

### Inputs del wizard paso 1 — 4 valores directos
El funcionario ingresa directamente (no hay dropdowns inventados):
- `tarifa_ls`: tarifa L-S por día (ej. $27.000)
- `tarifa_dom`: tarifa domingo (ej. $14.000)
- `ahorro_ls`: ahorro L-S por día (ej. $4.000)
- `ahorro_dom`: ahorro domingo (ej. $2.000)
El sistema calcula todo lo demás: `pagoDiaLS`, `pagoDiaDom`, `valorSemanal`, `valorQuincenal`, `valorMensual`.

### Campo `ahorro_domingo` en BD
- Tabla `contratos` tiene columna `ahorro_domingo numeric default 0` (migración 020)
- Se guarda junto con `tarifa_diaria`, `tarifa_domingo`, `ahorro_diario` al crear contrato

### Ahorro acumulado (contrato diario)
- Cada pago: ahorro = pago - tarifa del día
- Al llegar a $510.000 acumulados → `base_completada = true` → alerta al admin

---

## CONEXIONES ENTRE MÓDULOS — FLUJO DE DATOS

Esta sección es CRÍTICA. Antes de tocar cualquier módulo, verificar si afecta a otro.

### Cliente → Contrato
- `clientes.ingreso_inicial` → pre-llena `contratos.ahorro_inicial` en WizardContrato paso 1
- `clientes.ruta_contrato` (`"diario"` / `"tiempo_definido"`) → pre-selecciona `contratos.forma_pago` en wizard
- `clientes.estado` → cambia a `"Activo"` cuando se activa el contrato (wizard paso 6)
- Al crear contrato: validar que `clientes.estado === "Aprobado"` (no crear para estados anteriores)

### Contrato → Moto
- Wizard paso 2 (asignar moto): `motos.estado` → `"Reservada"`
- Wizard paso 6 (activar): `motos.estado` → `"Asignada"`, se guarda `motos.kilometraje_inicial` y `motos.fotos_entrega`
- Suspender contrato: `motos.estado` → `"Recuperada"`
- Cancelar/Finalizar contrato: `motos.estado` → `"Disponible"`

### Pago → Contrato (contrato diario)
- Cada pago registrado en CobrosView actualiza `contratos.ahorro_acumulado`
- Si `ahorro_acumulado >= 510000` → `contratos.base_completada = true` → alerta automática

### Contrato → Liquidación
- Liquidación inicia desde un contrato activo/suspendido
- Si `liquidaciones.saldo_final < 0` → `clientes.lista_negra = true` automáticamente

### Taller → Moto
- Ingreso al taller: `motos.estado` → `"En taller"`
- Salida del taller: `motos.estado` → estado anterior (`"Disponible"` / `"Recuperada"` / `"Asignada"`)

### Visita → Cliente
- Visita aprobada por admin → habilita cambiar `clientes.estado` a `"Aprobado"`
- Sin visita aprobada: no se puede crear contrato

### Referido → Cliente
- `referidos.estado` cambia a `"confirmado"` cuando el nuevo cliente recibe su moto (wizard paso 6)
- Al confirmar: `clientes.referidos_confirmados` del referidor se incrementa → verifica hitos de premios

---

## SEGURIDAD — RLS (Row Level Security) EN SUPABASE

**El filtrado por rol se hace en DOS capas, no solo una:**
1. **Frontend** (`useScope()`) — oculta/filtra en la pantalla, mejora la experiencia
2. **RLS en Postgres** (migración `026_rls_hardening.sql`) — la capa real de seguridad. Sin esto, cualquiera con sesión abierta podía consultar Supabase directo (devtools del navegador) y ver datos de otros roles/subadmins, sin importar lo que la pantalla mostrara

**Nunca confiar solo en el filtrado del frontend para proteger datos sensibles — siempre debe existir la política RLS equivalente.**

### Funciones de scope reutilizables (una sola fuente de verdad en SQL)
- `public.mi_rol()` / `public.mi_grupo()` — rol y grupo del usuario actual
- `public.mis_moto_ids_subadmin()` / `public.mis_contratos_subadmin()` / `public.mis_clientes_subadmin()` — scope del SUBADMIN
- `public.mis_moto_ids_socio()` / `public.mis_contratos_socio()` / `public.mis_clientes_socio()` — scope del SOCIO (por `grupo`)

Si el scope cambia algún día, se edita **una sola función**, no cada política suelta — mismo principio que la REGLA DE MAPEO INTEGRAL, aplicado a SQL.

### Matriz de acceso por tabla (post-migración 026)
| Tabla | ADMIN/ADMIN_PRINCIPAL | SECRETARIA | SUBADMIN | SOCIO | MECANICO |
|---|---|---|---|---|---|
| `clientes`, `contratos`, `deudas`, `convenios`, `pagos` | Todo | Todo | Solo lo suyo (por moto) | Solo su grupo | Sin acceso |
| `motos` (lectura) | Todo | Todo | Solo las suyas | Solo su grupo | Todo (taller) |
| `gestiones_cobro`, `visitas` | Todo | Todo | Solo lo suyo | Sin acceso | Sin acceso |
| `liquidaciones`, `caja_diaria`, `historial_ubicaciones`, `recepciones_vehiculo`, `acuerdos_tiempo_rodado` | Todo | Todo | Sin acceso | Sin acceso | Sin acceso |

### Pendiente (deferido intencionalmente)
`motos` INSERT/UPDATE y toda la tabla `taller` siguen abiertas a cualquier autenticado — se endurecen cuando se rediseñe el módulo de taller e integración con la operación diaria.

---

## SUBADMIN — SCOPE Y FILTRADO GLOBAL (arquitectura)

El SUBADMIN solo ve/gestiona lo relacionado con **sus motos asignadas**. Esto aplica a TODO el sistema (ver REGLA DE MAPEO INTEGRAL).

### Anclas en BD
- `motos.subadmin_id` (migración 021) → moto a cargo de un sub-admin (null = sin asignar). Una moto = un solo sub-admin.
- `visitas.asignada_a` (migración 022) → sub-admin que debe realizar la visita.

### Hook central: `useSubadminScope(profile, motos, contratos)` → `useScope()` (contexto)
- Archivo: `src/hooks/useSubadminScope.ts` + `src/contexts/SubadminScopeContext.tsx` (proveedor envuelve todas las vistas en App.tsx).
- Calcula: `esSubadmin`, `misMotoIds`, `misContratoIds`, `clienteIdsPermitidos`.
- Expone filtros: `filtrarMotos`, `filtrarContratos`, `filtrarVisitas`, `filtrarPorCliente`, `filtrarPorContrato`.
- Para roles ≠ SUBADMIN los filtros devuelven la lista completa (sin restricción).

### Cadena de filtrado (la moto es el ancla)
```
misMotoIds = motos donde subadmin_id === yo
  → misContratoIds = contratos cuyo moto_id ∈ misMotoIds
    → clienteIdsPermitidos = clientes de esos contratos
    → pagos/convenios/deudas filtrados por contrato_id ∈ misContratoIds
  → taller filtrado por moto_id ∈ misMotoIds
visitas filtradas por asignada_a === yo (NO por moto — el prospecto aún no tiene moto)
```

### Vistas/componentes que aplican el scope (mantener sincronizadas SIEMPRE)
| Lugar | Qué filtra |
|-------|-----------|
| `MotosView` | `filtrarMotos` + selector de asignación de sub-admin (solo ADMIN/AP) |
| `ContratosView` | `filtrarContratos` |
| `CobrosView` | `filtrarContratos` |
| `TallerView` | `filtrarMotos` (taller por moto_id) |
| `LiquidacionesView` | `filtrarMotos` |
| `ClientesView` | clientes por `clienteIdsPermitidos` (+ pool intake) · `filtrarVisitas` · selector asignación visita |
| `DashboardView` | motos/contratos/clientes/pagos/convenios/taller filtrados → KPIs y alertas |
| `CampanaAlertas` (🔔) | mismas entradas filtradas → alertas filtradas |
| `BusquedaGlobal` | recibe clientes/motos/contratos ya filtrados desde App.tsx |

> Al agregar una vista nueva o un módulo que cargue motos/contratos/clientes/pagos/alertas, **DEBE** aplicar `useScope()`. Si no, el SUBADMIN verá datos de otros.

---

## PROCESO COMPLETO DE UN CLIENTE NUEVO

### Paso 1 — Registro inicial (`ClientesView`)
- Define `ruta_contrato`: `"diario"` o `"tiempo_definido"`
- Registra `ingreso_inicial` (mínimo $100.000, ideal $280.500 = 55% de $510.000)
- **Este `ingreso_inicial` se pre-carga en el wizard de contrato como `ahorro_inicial`**

### Paso 2 — Documentos obligatorios
**Cliente:** hoja de vida, cédula, recibo público, antecedentes, licencia (opcional)
**Acompañante (mujer — obligatorio):** cédula, recibo público

### Paso 3 — Visita domiciliaria
- Siempre obligatoria antes de la entrega
- Admin aprueba o rechaza → habilita/bloquea creación de contrato

### Paso 4 — Wizard de contrato (`WizardContrato.tsx`) — 6 pasos
1. **Datos**: cliente (solo Aprobados sin contrato activo), modalidad, tarifa, valor período, día pago, meses, base inicial (pre-llenada con `ingreso_inicial`), fecha entrega
2. **Moto**: lista de Disponibles con búsqueda → asigna y pone "Reservada"
3. **Firma contrato**: documento + checkbox leído + canvas firma → Storage `firmas/{id}/contrato.png`
4. **Firma pagaré**: ídem → `firmas/{id}/pagare.png`
5. **Foto certificado**: foto del documento físico → `certificados/{id}/` → `firma_cliente=true`
6. **Entrega**: km inicial + fotos estado (múltiples) + checklist 8 ítems → activa contrato, moto "Asignada", cliente "Activo"

### Paso 5 — Operación normal
Pagos en CobrosView → recibos WhatsApp → gestión de mora si aplica

---

## SISTEMA DE REFERIDOS

| Referidos confirmados | Premio |
|----------------------|--------|
| 2 | Par de guantes de manejo |
| 5 | Intercomunicador |
| 10 | Casco |
| 17 | Combo completo |

**Referido confirmado** = cuando el nuevo cliente recibe su moto (wizard paso 6 completado).

---

## CONTRATOS Y TARIFAS

### Contrato DIARIO (ahorrando base inicial)
- Pago mínimo: **$50.000/día** L-S | **$25.000** domingo
- Tarifa empresa L-S: **$27.000** | Domingo: **$14.000**
- Ahorro = pago - tarifa del día
- Sin fecha de vencimiento
- Al completar **$510.000** en ahorro → alerta → admin ejecuta cambio → nuevo contrato

### Contrato SEMANAL/QUINCENAL/MENSUAL (liberando moto)

**Días de pago: SOLO LUNES O MIÉRCOLES — sin excepciones**
Si firma en otro día → prorrateo hasta el próximo día de pago.

| Tipo | Total período | Tarifa L-S | Ahorro L-S | Domingo |
|------|--------------|-----------|-----------|---------|
| Antiguo | $195.000/sem | $26.000 | $4.000 → $30.000/día | $15.000 |
| Nuevo (actual) | $202.000/sem | $27.000 | $4.000 → $31.000/día | $16.000 |

- **Quincenal:** 2 semanas + 1 día = 15 días
- **Mensual:** 4 semanas + 2 días = 30 días
- **Alerta 2 meses antes** del vencimiento → iniciar proceso de traspaso

### Base inicial: $510.000 total
- $202.000 = primera semana adelantada
- $308.000 = ahorro inicial
- **Regla:** "paga, consume, vuelve y paga" — siempre debe tener el período actual cubierto

---

## COBROS Y CARTERA

### Estructura del módulo Cartera (CobrosView) — 4 secciones ✅
De 11 pestañas en scroll horizontal → **4 secciones** por propósito (no por estado):
| Sección | Qué muestra | Sub-navegación interna |
|---------|-------------|------------------------|
| 📋 **Hoy** (default) | Tareas del día por urgencia (Recolección→Mora→Gabela→Pagan hoy) + resumen efectivo recogido | — (lista en recuadro con scroll) |
| 📁 **Contratos** | Lista navegable de toda la cartera | Chips: Todos/Mora/Gabela/Al día/Pagan hoy + buscador (recuadro con scroll) |
| 💵 **Dinero** | Confirmar pagos + cobrar en campo | Sub-chips: Por confirmar / Cobrar en campo |
| 🧾 **Historial** | Todos los pagos con filtros | (recuadro con scroll) |
- **Los KPIs** (Pagan hoy/Recaudado/Gabela/Mora) navegan a Contratos con el filtro puesto (o a Historial).
- **Listas dentro de recuadros** (`maxHeight ~64vh + overflowY:auto`) para que no ocupen toda la pantalla.
- Mora/Gabela/Pagan-hoy/Recolección/Protocolo ya NO son pestañas: viven dentro de **Hoy** (tareas) o como **filtro de Contratos**. Cero funcionalidad perdida.

### 🔴 LAS DOS CUENTAS DE DÍAS — no se confunden (regla del dueño, 9-sep-2026)
- **Días en mora** (`diasEnMora()` · `zala.cliente.dias_mora`): desde el día que le tocaba pagar su
  ciclo y **no lo pagó o no lo completó**. Un abono parcial **NO** la reinicia. **Es la que manda:**
  decide quién entra a Recolección (>3 días), ordena la lista de Cartera y el panel Hoy, y marca el
  paso del protocolo. En pantalla: *"6d en mora"*.
- **Días desde su último pago** (`diasSinPago` · `zala.cliente.dias_sin_pago`): desde el último
  abono confirmado, del monto que sea. **Cualquier abono la reinicia.** Es informativa; se le nombra
  al cliente en el mensaje porque él la reconoce. En pantalla: *"Último pago hace 13 días"*.
- Quien debe 3 semanas y abonó ayer lleva **1 día** desde su último pago y **16 en mora**. Nunca
  usar una donde va la otra ni etiquetar una con el nombre de la otra (fue el defecto de
  *"Xd sin pagar"*, que mostraba la segunda con nombre de la primera). Detalle en
  `docs/DICCIONARIO-ESTADOS.md` → Parte 2.

### Protocolo de mora (escalación por respuesta, no por días fijos)
- **Día de pago** → mensaje WhatsApp durante la mañana
- **Día de gabela** (1 día sin pagar) → sigue el mensaje
- **Mora** (día siguiente a gabela) → gestión exhaustiva hasta que pague o se retenga la moto:
  1. **Mensaje** — si no hay contacto ni pago →
  2. **Llamada** — si no hay respuesta →
  3. **Apagado remoto o Recolección física** (vehículo detenido)
  - Los 3 pasos están disponibles desde el primer día de mora — el funcionario decide cuándo escalar según la respuesta obtenida, **puede pasar los 3 el mismo día** si no hay respuesta. No hay bloqueo por tiempo.
- **Plazo extra** (chance al cliente) → ADMIN, ADMIN_PRINCIPAL o SUBADMIN pueden otorgar 1-2 días adicionales con motivo escrito obligatorio. Mientras esté vigente, el contrato sale del balde "Recolección" (no se puede recolectar durante ese margen). Al vencer sin pago, vuelve automáticamente a la cola.
- **Recolección física** → al confirmarla: `contratos.estado → "Suspendido"`, `motos.estado → "Recuperada"`, y se crea automáticamente una deuda de **$30.000** (concepto `multa_recoleccion`, "Multa por recolección/inmovilización"; constante `MULTA_RECOLECCION` en `utils/inmovilizacion.ts`) — se cobra cada vez que se recolecta, no una sola vez de por vida. **Regla del dueño (8-sep-2026): la multa es siempre $30.000; solo varía si hay que salir de la ciudad** — hoy el sistema no tiene dónde poner ese valor distinto (pendiente chico). La lavada ($15.000) va aparte y se cobra junto con la multa.
- **Devolver la moto** → el cliente la recupera solo cuando salda **toda deuda pendiente del contrato** (multa + cuota atrasada que se registre como deuda `tarifa_atrasada`). Se gestiona desde Inmovilizaciones → sección "Motos retenidas".
- **Si el cliente se demora mucho en resolver** → el ADMIN/ADMIN_PRINCIPAL puede reasignar la moto a otro cliente (la moto nunca debe dejar de producir) — finaliza el contrato anterior a la fecha de retención y libera la moto para un nuevo contrato.

### Orden de aplicación de cada pago
1. Cuota pactada del período (tarifa + ahorro)
2. Deuda pendiente
3. Cuota de convenio activo
4. Saldo a favor (queda reservado, no se aplica automáticamente)

### Quién registra qué
| Acción | Quién |
|--------|-------|
| Registrar pago efectivo | Solo SECRETARIA |
| Reportar transferencia (foto comprobante) | ADMIN jr o SECRETARIA |
| Confirmar transferencia | SECRETARIA |
| Cobro en campo | ADMIN/ADMIN_PRINCIPAL/SUBADMIN recupera efectivo → SECRETARIA confirma |
| Ver historial de pagos | Todos |

### Cobro en campo — flujo y reglas (implementado ✅)
- **Quién:** ADMIN, ADMIN_PRINCIPAL, SUBADMIN (no SECRETARIA — ella cobra en oficina).
- **Sobre qué contratos:** ADMIN/ADMIN_PRINCIPAL ven cualquier contrato activo; **SUBADMIN solo los de sus clientes asignados** (mismo scope que el resto del sistema — ver SUBADMIN SCOPE). Si no tiene nada asignado, la lista de búsqueda sale vacía a propósito. La lista **destaca mora/gabela arriba**.
- **Flujo 2 pasos (doble control):** funcionario registra → marca "entregué a secretaria" (`entregado_caja`) → SECRETARIA confirma (`estado=Confirmado`). Confirmar/rechazar un pago (en cualquier pantalla) es acción exclusiva de SECRETARIA/ADMIN/ADMIN_PRINCIPAL — nunca visible para SUBADMIN.
- **En el momento del cobro:** referencia "Debe pagar" (cuota período + deuda + convenio) · captura **GPS** (`pagos.ubicacion` jsonb, mig 023) · **foto opcional** (reúsa `pagos.comprobante_url`) · **recibo provisional** por WhatsApp.
- **Dos entradas (misma puerta), ambas abren la misma ventana flotante:** botón "+" global (busca cliente) y botón "💵 Cobrar" en cada tarjeta del panel Hoy.
- **Pestaña "⏳ Por confirmar"** (antes "💵 Dinero"): separada en 2 bloques siempre visibles — 🏦 Transferencias por confirmar y 💵 Efectivo de campo por confirmar — cada uno con su propio recuadro de scroll.
- **Conciliación:** resumen "recogiste hoy $X" en panel Hoy (por persona) + en **Caja Diaria** resumen por funcionario (total, pendiente entregar, sin confirmar).
- `pagos.tipo_registro="campo"`, `forzarPendiente=true` (queda Pendiente aunque sea efectivo).

### Convenios
- Máximo 3 por contrato
- Siempre encima del pago normal — nunca lo reemplaza
- 3er convenio incumplido → liquidación obligatoria

---

## BASE DE DATOS — TABLAS Y CAMPOS CLAVE

### `clientes`
`id` | `nombre` | `cedula` | `telefono` | `whatsapp` | `mismo_whatsapp` | `direccion` | `fuente_llegada` | `ruta_contrato` (diario/tiempo_definido) | **`ingreso_inicial`** (número — lo que pagó al registrarse) | `referido_por_cedula` | `referido_por_nombre` | `referidos_confirmados` | `acompanante_*` | `documentos_cliente` (jsonb) | `documentos_acompanante` (jsonb) | `estado` | `excepcion_*` | `lista_negra` | `lista_negra_reversible` | `created_at`

**Estados:** `En proceso` → `Listo para visita` → `Pendiente evaluación` → `Aprobado` → `Activo` → `En riesgo` / `En mora` → `Retirado` / `Rechazado` / `Lista negra`

### `motos`
`id` | `placa` (UNIQUE) | `marca` | `modelo` | `color` | `grupo` (COSTA/PRADERA/RASTREADOR/USADAS) | `estado` | `condicion_ingreso` | `numero_motor` | `numero_chasis` | `cilindraje` | `fecha_seguro` | `fecha_tecnomecanica` | `propietario` | `observaciones` | **`subadmin_id`** FK→profiles (sub-admin a cargo) | `ubicacion_fisica` | `kilometraje_inicial` | `fotos_entrega` (jsonb) | `created_at`

**Estados:** `Disponible` | `Asignada` | `En taller` | `Garantía` | `Fiscalía` | `Tránsito` | `Recuperada` | `Suspendida`

### `contratos`
`id` | `cliente_id` FK | `moto_id` FK nullable | `forma_pago` (Diario/Semanal/Quincenal/Mensual) | `dia_pago` | `valor_semanal` | `tarifa_diaria` | `tarifa_domingo` | `ahorro_diario` | **`ahorro_domingo`** | `meses` | **`ahorro_inicial`** (pre-cargado desde `clientes.ingreso_inicial`) | `ahorro_acumulado` | `base_completada` | `base_inicial` | `fecha_entrega` | `firma_cliente` | `firma_responsable` | `contrato_pdf_url` | `certificado_pdf_url` | `pagare_pdf_url` | `estado` (En proceso/Activo/Finalizado/Cancelado/Suspendido)

### `pagos`
`id` | `contrato_id` FK | `registrado_por` FK | `valor` | `metodo` (Efectivo/Transferencia) | `estado` (Confirmado/Pendiente/Rechazado) | `tipo_registro` (normal/campo/transferencia) | `comprobante_url` (transferencia o foto de cobro en campo) | `aplicado` (jsonb) | `entregado_caja` | `folio` | **`ubicacion`** (jsonb {lat,lng} — GPS del cobro en campo, mig 023) | `fecha`

### `visitas`
`id` | `cliente_id` FK | `estado` | `resultado` | `entrevista` (jsonb) | `fotos` (jsonb) | `ubicacion` ({lat, lng}) | `fecha` | `realizada_por` FK | **`asignada_a`** FK→profiles (sub-admin asignado a la visita)

### `liquidaciones`
6 etapas: Iniciada → En taller → Calculada → Documento generado → Firmada → Cerrada
Si `saldo_final < 0` → `clientes.lista_negra = true` automáticamente (reversible)

### `taller`
`id` | `moto_id` FK | `estado_tecnico` | `detalle` | `costo` | `repuestos` | `autorizado_por` | `fecha_ingreso` | `fecha_salida`

### Tablas adicionales
`deudas` | `convenios` (máx 3/contrato) | `gestiones_cobro` | `historial_ubicaciones` | `recepciones_vehiculo` | `acuerdos_tiempo_rodado` | `caja_diaria` | `referidos`

### `profiles` — usuarios del sistema
`id` (=auth.users) | `nombre` | `role` | `grupo` (para SOCIO) | `permisos` (jsonb — lista de ViewKeys) | `created_at`

---

## ALERTAS AUTOMÁTICAS

| Evento | Cuándo | Para quién |
|--------|--------|-----------|
| Mora / gabela | Día siguiente sin pago | Admin |
| SOAT / Tecno próximos | 30, 15, 5 días antes | Admin principal |
| Base inicial completada | `ahorro_acumulado >= $510.000` | Admin |
| Premio referidos | Referido 2/5/10/17 confirmado | Admin |
| Traspaso próximo | 2 meses antes de vencer | Admin principal |
| 3er convenio incumplido | Al detectarse | Admin principal |
| Transferencias pendientes | Pagos sin confirmar | Secretaria |
| Contratos sin activar | En proceso > N días | Admin |

---

## REGLAS DE NEGOCIO CRÍTICAS

### Principio rector
**La moto nunca debe dejar de producir.**

### Moto guardada + préstamo de reemplazo — REGLA DEL DUEÑO (30-jul-2026)
Aplica **en TODOS los casos en que la moto del cliente queda guardada** (garantía, taller, fiscalía,
tránsito):
1. **El contrato original NO se pausa: sigue contando normal.** El cliente sigue debiendo su cuota
   del período como cualquier otro. No hay suspensión ni congelamiento.
2. **La moto prestada se cobra APARTE**, a su tarifa normal de **$27.000/día**. El préstamo es una
   oportunidad para que no quede sin trabajar, no un reemplazo gratis de su contrato.
3. O sea: durante el préstamo el cliente paga **las dos cosas** — su cuota del contrato + el
   alquiler diario de la prestada. Se registra como `tipo_registro='alquiler_reemplazo'`: entra a
   la caja pero NO toca el ledger de cajas (no le adelanta semanas).
4. **El contrato es por PAGOS COMPLETADOS, no por tiempo transcurrido** (spec del libro de cajas):
   que pague ahora o después no cambia cuánto debe en total. Pero **la meta siempre es que pague de
   una y extender el contrato lo menos posible** — rodar es la última opción.

### Cobro del alquiler de la prestada (regla del dueño, 30-jul-2026)
- **Se cobra ENSEGUIDA, todos los días** — como todo en la empresa. Es gestión del funcionario: si
  cobra bien cada día, el cliente nunca se atrasa.
- Si igual se atrasa, **queda como deuda** y el funcionario **le hace un convenio**. No se pierde.
- **No bloquea la devolución** de su moto propia: esa es la de su contrato y la sigue pagando.
- **La cuenta de la prestada NUNCA se mezcla con la del contrato original.** El ingreso del alquiler
  pertenece al portafolio de la moto PRESTADA (es la que se desgasta), no al de la original.

### Recuperar la moto propia después de estar guardada (regla del dueño, 30-jul-2026)
1. Se le cobra **lo que debía de ANTES de guardarla**. Eso no se rueda nunca.
2. **Lo ÚNICO que se puede ofrecer rodar al final es el tiempo que la moto estuvo guardada.**
3. 🔴 **Rodar SOLO por períodos COMPLETOS.** Nunca días sueltos: *"rodar 3 días de una semana
   descuadra muchas lógicas y cuentas"*. Si estuvo guardada 3 días, no se rueda nada.

✅ **RESUELTO 31-jul (mig 078 `cajas_exoneradas`).** Antes las dos opciones estaban rotas:
"rodar" solo movía `fecha_fin_contrato` — que es informativa — así que **el botón no hacía nada**
y las cajas se seguían exigiendo; y "cobrar" creaba una deuda de días × tarifa **encima** de las
cajas que el contrato ya venía exigiendo (doble cobro).

Ahora:
- **Rodar exonera CAJAS de verdad**: `contratos.cajas_exoneradas` se resta de `cajas_exigidas()`.
  Se resta **ANTES del tope de `total_cajas`** — si fuera después, las exigidas nunca pasarían de
  (total − exoneradas) y **el contrato jamás podría terminar**. Restando antes, la curva de
  exigencia se corre N períodos y con el tiempo vuelve a alcanzar `total_cajas`: el cliente paga
  las mismas cajas, N períodos más tarde. Hay prueba automática que lo protege.
- **Solo períodos completos**, según la regla 3. Si no completa uno, la opción no aparece.
- **"Cobrar" ya no se ofrece** en contratos con motor: la ventana explica que esas semanas ya
  están exigidas y que cobrarlas aparte sería cobrar dos veces. Los contratos v1 conservan el
  flujo viejo.
- `cajas_exigidas()` (SQL) y `cajasExigidasHasta()` (TS) son espejo exacto: **si se toca una hay
  que tocar la otra**, o la pantalla dirá una cosa y el motor de reparto otra.

### Fiscalía/Tránsito/Garantía — tiempo fuera de servicio
- El tiempo que la moto está fuera de servicio (fiscalía, tránsito, garantía, taller) **por defecto se COBRA** al cliente — el tiempo retenido queda como deuda. Existe la opción de **rodar** ese tiempo (extender la fecha de fin del contrato) en vez de cobrarlo, decisión del ADMIN caso por caso, pero **la prioridad es siempre cobrar** (rodar alarga el contrato, la empresa deja de ganar ese período y genera gastos de gestión extra).
- **Garantía se trata igual que Fiscalía/Tránsito** (corrección: antes decía "NO genera deuda por ser culpa del fabricante" — ya no aplica). El contrato es por tiempo transcurrido/pagos; sin importar de quién sea la culpa de la falla, el tiempo parado se cobra o se rueda como cualquier otro.
- Mecanismo: `ModalResolverTiempoFueraServicio` (cobrar_ahora vs rodar_al_final) — ya existe.

### Lista negra
- Automática si liquidación = saldo negativo
- Reversible si paga o por decisión admin principal
- Al registrar cliente nuevo → validar contra lista negra

### GPS y control remoto
- **Sirena:** máx 5-10 seg, solo con vehículo **detenido**
- **Apagado remoto:** solo detenido · máx 1 hora · luego proceder físicamente
- **Señales de empeño:** 2 días sin movimiento + dispositivo sin reportar + paga solo transferencia → inspección

---

## PALETA DE COLORES

| Uso | Color |
|-----|-------|
| Azul principal | `#0284c7` |
| Verde éxito | `#166534` / fondo `#dcfce7` |
| Rojo error/mora | `#991b1b` / fondo `#fee2e2` |
| Amarillo alerta | `#92400e` / fondo `#fef3c7` |
| Fondo página | `#f1f5f9` |
| Texto principal | `#0f172a` |
| Texto secundario | `#334155` / `#64748b` |
| Sidebar | `#0f172a` |
| Sidebar activo | `rgba(56,189,248,0.15)` / texto `#38bdf8` |

---

## ERRORES PASADOS — NO REPETIR

| Error | Solución |
|-------|---------|
| CSS Grid con `minmax(320px, 1fr)` | Usar flexbox con `flexWrap: "wrap"` |
| `tipo_contrato` no existe | El campo se llama `forma_pago` |
| `"CLUB"` no es GrupoMoto válido | Grupos válidos: `COSTA` `PRADERA` `RASTREADOR` `USADAS` `OTRO` |
| Insert a columna inexistente | Agregar migración .sql y avisar al usuario |
| `import React` sin usar JSX | Importar solo lo necesario |
| sed embeds JSX como texto | Usar herramienta Edit de Claude, nunca sed en JSX |
| Push sin merge a main | SIEMPRE hacer merge a main después de cada push |
| Tarifa domingo = tarifa/2 exacta | Usar `Math.ceil(tarifa/2/1000)*1000` |
| Cuota diaria = total/7 | Los 7 días NO son iguales — L-S ≠ domingo |
| `ahorro_inicial` del wizard vacío | Pre-cargar desde `clientes.ingreso_inicial` |
| Mostrar alerta de base antes de cliente/valor | Solo mostrar cuando `form.cliente_id && valorSemanal > 0` |
| Trigger `enforce_cliente_estado_change` con `current_role()` | Usar `mi_rol()` — retorna el rol real de la app, no el de Postgres |
| Prorrateo sin detectar domingos | Iterar día a día con `getDay() === 0` — domingos tienen precio diferente |
| Día extra quincenal/mensual calculado como total/7 | El día extra es `pagoDiaLS` completo (tarifa + ahorro L-S) |
| Inventar valores de dropdown para tarifas | Pedir los 4 valores directos al funcionario: tarifa_ls, tarifa_dom, ahorro_ls, ahorro_dom |
| `ahorro_domingo` faltante en BD | Migración 020 agrega la columna — aplicar en Supabase SQL Editor |
| Contrato nuevo aparece en mora | Pasar `fecha_entrega` a `calcularEstadoCartera` y `calcEstadoCuenta` — si entrega >= inicio período → Al día |
| Pendiente muestra período completo en contrato nuevo | Usar `calcProrrateoInicial()` cuando `enProrrateo === true` — aplica tanto en panel detalle como en lista |
| "Xd sin pagar" aparece aunque esté al día | Agregar condición `c.estadoCartera !== "al-dia"` antes de mostrar el texto |
| RLS contratos bloqueando insert | Políticas usaban `current_role()` — corregir a `public.mi_rol()` con roles ADMIN, ADMIN_PRINCIPAL, SECRETARIA |
| `useScope()` fuera del `SubadminScopeProvider` → app no abre (throw) | El provider debe envolver TODO el layout (header incluido), no solo el contenido. `CampanaAlertas` y `BusquedaGlobal` viven en el header → si usan `useScope`, deben estar dentro del provider. Verificar el árbol de render, no solo el archivo. |
| Canvas de firma se corta a medio trazo | `useEffect` con `[onChange]` como dependencia se reengancha en cada trazo (el padre recrea `onChange` en cada `setState`), perdiendo el estado `drawing` del closure anterior. Enganchar listeners en `useEffect(..., [])` una sola vez y leer el callback desde un `ref` actualizado en cada render. |
| `ModalConvenio` insert fallaba silenciosamente | El insert usaba columnas inexistentes en `convenios` (`motivo`, `cuota_convenio`, `total_convenio`, `cuotas_totales`, `fecha_inicio`). Antes de insertar en cualquier tabla, verificar el schema real contra las migraciones — nunca inventar nombres de columnas. |
| Quincenal/Mensual calculaban mora incorrectamente | Usaban la misma lógica que Semanal (día de semana) con `valor_semanal` — completamente incorrecto para contratos de 15/30 días. La solución fue `cicloPago.ts` con `dias_pago_mes` (fechas reales del mes) y período natural entre días de pago consecutivos. |
| Componente `ClienteDetalleSheet.tsx` — todo el trabajo hecho ahí era invisible para el usuario | Nunca se abría en ningún lugar de la app (el `useState` que lo activaba nunca se seteaba) — código muerto desde que se creó, semanas antes. Se construyeron 3 features completas ahí (foto de perfil, firma/huella, imprimir documento) antes de notar que la pantalla real era `FichaClienteView.tsx`. **Regla: antes de agregar UI a un componente de "detalle de cliente", verificar en el navegador con la pantalla real que abre el botón que el usuario usa ("Ver ficha completa"), no asumir por el nombre del archivo cuál es el correcto.** |
| Documentos del acompañante comparados contra los 6 requisitos del cliente en FichaClienteView | El tab Documentos mostraba "✗ Hoja de vida", "✗ Carta", etc. en rojo para el acompañante aunque nunca se le exigieron — usaba `DOC_LABELS` completo para ambas secciones. Cada persona (cliente/acompañante) debe compararse contra SU PROPIA lista de documentos requeridos, no una lista compartida. |
| `valor_semanal` con el total del período metido directo (RMZ48H) | Para Quincenal/Mensual el campo SIEMPRE debe llevar el valor semanal BASE — el sistema calcula el total con `4×valor_semanal + 2×pagoDiaLS`. Si se mete el total mensual ahí, se vuelve a multiplicar y sale ~4x inflado ($3.420.000 en vez de $840.000). Fix: `ModalEditarContrato` ahora muestra una vista previa en vivo del total calculado para detectar el error antes de guardar. |
| **Mig 124 reescribió dos triggers de convenios "copiándolos de la mig 099/098" y borró lo que la 116 les había agregado** (la partitura y la marca `fuente='convenio'` de las cajas financiadas). 12 convenios nacieron sin partitura y 11 cajas quedaron rotuladas como cobradas para la nómina. Se detectó 3 días después, al revisar un caso real (JOSE SANMARTIN). Corregido en mig 127. | **Una función que se vuelve a escribir se copia SIEMPRE de `pg_get_functiondef` de la base VIVA, nunca del archivo de una migración anterior**: entre esa migración y hoy pudo haber otras que la tocaron. Y después de correrla, verificar con un caso real que lo que la función hacía ANTES lo siga haciendo (acá: que el convenio nuevo tenga partitura). |
| Trigger `enforce_profile_role_change()` desactualizado desde que existe ADMIN_PRINCIPAL | Solo bloqueaba cambios de `role` y solo exigía rol=`ADMIN` (nunca se actualizó al crear `ADMIN_PRINCIPAL`) — un ADMIN podía subirse a ADMIN_PRINCIPAL editando su fila directo contra la BD, sin pasar por la Edge Function. Tampoco protegía `permisos` (cualquiera podía auto-otorgarse acceso a cualquier módulo). Corregido en migración 031: ahora exige `ADMIN_PRINCIPAL` y cubre `role`+`permisos`+`grupo`. **Lección: cuando se agrega un rol nuevo a la jerarquía, hay que revisar TODOS los triggers/políticas RLS que comparan contra roles viejos, no solo el frontend.** |

---

### Reglas de cartera — CobrosView ✅
- **Contrato nuevo sin pagos:** `calcularEstadoCartera` y `calcEstadoCuenta` reciben `fecha_entrega`. Si `fecha_entrega >= inicioPeriodo` (último día de pago) → "Al día", no mora.
- **Pendiente en prorrateo:** Si el contrato está en período de prorrateo (entregado después del último día de pago, sin pagos), `cuotaPactada` usa `calcProrrateoInicial()` en vez de `valor_semanal`. Itera día a día detectando domingos igual que el wizard.
- **`calcProrrateoInicial`:** Misma lógica que `calcPrimerPago` del wizard — usa `tarifa_diaria + ahorro_diario` para L-S y `tarifa_domingo + ahorro_domingo` para domingos.
- **RLS contratos:** Políticas INSERT/UPDATE usan `public.mi_rol()` — roles permitidos: `ADMIN`, `ADMIN_PRINCIPAL`, `SECRETARIA`.


### Completado — Panel HOY ✅
- Pestaña **"📋 Hoy"** (por defecto) en CobrosView, organizada por TAREA no por estado.
- Agrupa por urgencia sin duplicar: Recolección (**más de 3 días con la CUOTA VENCIDA** — `diasMora`, no días desde el último pago; decisión del dueño 9-sep-2026, ver mig 136) → Mora → Gabela → Pagan hoy. Solo muestra pendientes (Al día no aparece).
- Tareas como botones: Mensaje (abre WhatsApp + registra), Llamar (abre `tel:` + registra), Sirena (registra, 3 seg, GPS real pendiente), Recolección (registra orden).
- "Tarea hecha hoy" = existe gestión de ese tipo con `fecha=hoy` → check verde. Todo queda en `gestiones_cobro`.
- Hereda filtrado SUBADMIN (cada quien ve solo tareas de sus motos).


---

## 🫀 ESPECIFICACIÓN "LIBRO DE CAJAS" — MOTOR DE DINERO v2 (APROBADA 11-JUL-2026, ✅ EN PRODUCCIÓN)
**Definición cerrada con el usuario pregunta por pregunta — NO re-preguntar nada de esto. Reemplaza el modelo de "ventana del período actual" de cicloPago v1.**
1. **Modelo:** cada contrato de tiempo definido = fila de CAJAS (períodos). Caja semanal $202.000 = $176.000 empresa + $26.000 ahorro. **Diario queda FUERA** (lógica actual). Deudas registradas y convenios siguen aparte.
2. **N total de cajas:** se captura `meses`; N = **calendario real** (12m=52 sem, 21m=91, 24m=104; quincenas/meses por fechas reales). **El contrato termina al llenar la caja N (por pagos realizados, NO por tiempo transcurrido)**; `fecha_fin_contrato` queda informativa. Contador "va X de N" visible en detalle/estado de cuenta/documentos.
3. **Nacimiento (nuevos):** Caja 0 = prorrateo (día a día, domingos aparte, se paga el primer día de pago). Caja 1 = semana adelantada: **nace PAGADA con la base**, registrada como **pago interno visible** en el historial (tipo especial, $176.000 cuota + $26.000 ahorro) **EXCLUIDO de caja diaria y recaudo**. De $510.000: $308.000 → ahorro_apertura + $202.000 → Caja 1. Base incompleta: tarifa-primero (primero los $176.000, luego ahorro). **Migrados:** cajas desde su fecha de corte, sin caja 0 ni adelantada.
4. **FIFO:** todo peso de cuota llena la caja MÁS VIEJA incompleta. Orden: cajas → deuda → convenio. Cada caja entrega su ahorro AL LLENARSE, sin importar cuándo (dentro de la caja rige tarifa-primero: los últimos $26.000 son ahorro). **NADIE pierde ahorro como castigo** — el que no paga enfrenta mora→retención→liquidación. Reversas (rechazar/eliminar) des-llenan cajas en orden inverso.
5. **Excedente:** saldo a favor por defecto; se aplica a cajas futuras SOLO por decisión manual (secretaria/cliente).
6. **Mora:** cada caja se exige el día de pago que la INICIA ("paga hoy lo que consumes desde hoy") + 1 día de gabela. En mora = existe caja exigida sin llenar; pagar la actual con una vieja abierta NO saca de mora. Días de mora = desde la más vieja.
7. **Rodar** (taller/fiscalía/decisión admin con doc firmado): el rango queda exonerado de EXIGENCIA pero las cajas NO se perdonan — se corren y se pagan al final (contrato por pagos, no por tiempo). Prioridad: cobrar; rodar es excepción.
8. **Convenios:** semanas financiadas dentro del convenio ganan su ahorro **al cumplirse el convenio completo**; si incumple → retención/liquidación cobran lo pendiente (el ahorro no se borra por castigo, simplemente no existe hasta que la plata entre).
9. **Salida (retiro/liquidación):** se cobra hasta el día en que entregó la moto (última caja prorrateada por días consumidos); lo prepagado NO consumido se DEVUELVE en la liquidación (entra al saldo final).
10. **Cambios de tarifa/plan:** solo afectan cajas futuras — las selladas no se tocan (ACUMULADORES incrementales, no fórmula que reescribe historia). Campos nuevos en contratos: total_cajas, cajas_pagadas, caja_actual_pagado, prorrateo_total/pagado (diseño en construcción, mig 045).
11. **MEJORA ESTRUCTURAL:** el reparto de pagos SE MUDA A LA BASE DE DATOS (RPC/trigger única fuente). El frontend solo dice "registra $X" — pestañas viejas no pueden volver a repartir mal (causa raíz de los bugs JORGE/ALEJANDRO/DEIMER del 10-11 jul).
- **Ejemplo canónico (entendido y confirmado por el usuario):** entrega jueves 2 → Caja 0 prorrateo vie 3–mié 8 se paga el mié 8 · Caja 1 (mié 8–mar 14) cubierta por la adelantada · mié 15 paga la Caja 2 → "siempre tiene la semana que consume ya pagada".
- **Orden de construcción:** F1 motor BD (mig 045 + RPC + trigger v2) → F2 cicloPago v2 (fechas puras: N calendario real, cajasExigidasHasta, prorrateo) → F3 wizard (308/adelantada/pago interno + N visible) → F4 pantallas de cobro llaman al RPC (quitar reparto local de los 5 puntos) → F5 mora/estado ledger en todas las vistas → F6 SQL inicialización de cajas para los contratos existentes → F7 liquidación (prorrateo de salida + devolución) y documentos. Probar cada fase antes de seguir.

