# MotoGestión — GPS Satelital Cartagena
**SaaS de gestión integral de flota de motos en arriendo**
Supabase: `jvfkprkjysjffhzjitgl` | Repo: `GPSsatelital/gps-satelital` | Producción: Vercel desde `main`

---

## REGLA DE AUTORIZACIÓN — OBLIGATORIO SIEMPRE

**Nunca implementar nada sin antes describir el plan y esperar confirmación explícita del usuario.**

### REGLA DE VERIFICACIÓN PREVIA — OBLIGATORIO SIEMPRE
Esto aplica también **dentro** de una tarea ya aprobada, no solo al inicio. Si al escribir un cambio surge una decisión con más de una interpretación válida (ej. "¿exactamente qué roles ven esto?", "¿este dato incluye o excluye tal caso?"), **detenerse y preguntar antes de escribir el código** — no implementar la primera interpretación y corregirla después si sale mal. Autocorregir sobre la marcha es señal de que faltó verificar antes de tocar el código.
- Ejemplo de error real: se escribió una condición de permisos usando `esSecretaria` sin verificar antes si ADMIN debía quedar incluido — resultó que sí, y hubo que corregir la condición ya escrita en vez de haber preguntado primero.

---

## REGLA DE CONTEXT7 — OBLIGATORIO SIEMPRE

Cuando la tarea o pregunta involucre cualquiera de estas librerías: **Supabase** (BD, auth, storage, RLS, realtime, políticas), **React** (hooks, contextos, renders), **TypeScript** (tipos, interfaces, generics) o **Vite** (build, env, PWA) — sugerir explícitamente al usuario:

> "💡 Esta pregunta involucra [librería]. Te sugiero agregar **'use context7'** a tu mensaje para que traiga la documentación actualizada y evitar que te dé una API desactualizada."

Indicar siempre: qué librería detecté, por qué conviene usarlo en ese caso puntual, y qué información específica traería.

---

## POLÍTICA DE HERRAMIENTAS MCP — OBLIGATORIO SIEMPRE

Objetivo: equilibrio entre consumo (tokens/tiempo) y calidad — priorizando que el resultado quede bien estructurado. Cada herramienta tiene un rol único para no duplicar esfuerzo entre ellas.

### Automáticas (no requieren acción del usuario)
- **claude-mem** — memoria de continuidad de sesión (qué se hizo, decisiones, hilo de la conversación). Hooks ya activos (SessionStart, PostToolUse, Stop).
- **MemPalace** — memoria de hechos/entidades a largo plazo (personas, proyectos, relaciones), NO continuidad conversacional (eso ya lo cubre claude-mem). Hooks de guardado ya activos. Solo consultar sus datos cuando la pregunta sea sobre "qué sabemos de X" — no en cada mensaje, para no duplicar con claude-mem.

### Bajo demanda — evaluar en cada tarea y sugerir (no forzar)
- **Context7**: cuando la tarea involucra Supabase, React, TypeScript o Vite. Sugerir con el formato ya definido en la regla de Context7.
- **Sequential-thinking**: solo en problemas realmente complejos con múltiples causas/partes interdependientes (ej. depurar un bug con varias causas posibles). Sugerir: "💡 Este problema tiene varias partes interdependientes, te sugiero usar sequential-thinking para razonarlo paso a paso."
- **Taskmaster**: solo cuando el trabajo tiene muchas etapas dependientes entre sí (ej. un módulo nuevo con varias fases). Sugerir: "💡 Esto tiene varias etapas dependientes, te sugiero usar Taskmaster para desglosarlo."
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

### codebase-memory — SIEMPRE ACTIVA (única de este grupo)
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

Después de cualquier `git push`, hacer merge inmediato a `main`:

```bash
git checkout main && git pull origin main && git merge claude/clever-turing-daklkq && git push origin main && git checkout claude/clever-turing-daklkq
```

Vercel despliega automáticamente solo desde `main`. Sin este paso, nada llega a producción.

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

### Protocolo de mora (escalación por respuesta, no por días fijos)
- **Día de pago** → mensaje WhatsApp durante la mañana
- **Día de gabela** (1 día sin pagar) → sigue el mensaje
- **Mora** (día siguiente a gabela) → gestión exhaustiva hasta que pague o se retenga la moto:
  1. **Mensaje** — si no hay contacto ni pago →
  2. **Llamada** — si no hay respuesta →
  3. **Apagado remoto o Recolección física** (vehículo detenido)
  - Los 3 pasos están disponibles desde el primer día de mora — el funcionario decide cuándo escalar según la respuesta obtenida, **puede pasar los 3 el mismo día** si no hay respuesta. No hay bloqueo por tiempo.
- **Plazo extra** (chance al cliente) → ADMIN, ADMIN_PRINCIPAL o SUBADMIN pueden otorgar 1-2 días adicionales con motivo escrito obligatorio. Mientras esté vigente, el contrato sale del balde "Recolección" (no se puede recolectar durante ese margen). Al vencer sin pago, vuelve automáticamente a la cola.
- **Recolección física** → al confirmarla: `contratos.estado → "Suspendido"`, `motos.estado → "Recuperada"`, y se crea automáticamente una deuda de **$20.000** (concepto `multa_recoleccion`, "Multa por recolección/inmovilización") — se cobra cada vez que se recolecta, no una sola vez de por vida.
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

### Fiscalía/Tránsito
- Congela la tarifa mientras dure — el tiempo retenido queda como deuda del cliente
- Garantía: NO genera deuda (culpa del fabricante)

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
| Trigger `enforce_profile_role_change()` desactualizado desde que existe ADMIN_PRINCIPAL | Solo bloqueaba cambios de `role` y solo exigía rol=`ADMIN` (nunca se actualizó al crear `ADMIN_PRINCIPAL`) — un ADMIN podía subirse a ADMIN_PRINCIPAL editando su fila directo contra la BD, sin pasar por la Edge Function. Tampoco protegía `permisos` (cualquiera podía auto-otorgarse acceso a cualquier módulo). Corregido en migración 031: ahora exige `ADMIN_PRINCIPAL` y cubre `role`+`permisos`+`grupo`. **Lección: cuando se agrega un rol nuevo a la jerarquía, hay que revisar TODOS los triggers/políticas RLS que comparan contra roles viejos, no solo el frontend.** |

---

## ESTADO ACTUAL — v2.1

### Completado ✅
- Autenticación y 5 roles con RLS
- Dashboard KPIs + selector de grupo + acciones rápidas
- Módulo Clientes (registro, documentos, visitas, aprobación, decisión final)
- Módulo Motos (registro, estados, grupos, retenciones, ubicación)
- Módulo Contratos + **WizardContrato 6 pasos** (`WizardContrato.tsx`)
- Módulo Cartera/Cobros (pagos, deudas, convenios, recibos WhatsApp)
- Módulo Taller, Usuarios, Liquidaciones, Configuración
- Responsive + PWA + Realtime
- Sistema de alertas completo (10+ tipos, campana, navegación al módulo)
- Confirmación de pagos: transferencia con foto, cobro en campo 2 pasos
- UX móvil: FAB, bottom tabs, botón atrás del celular interceptado
- Panel de recibo unificado (efectivo/transferencia/reenvío WhatsApp/imprimir)
- Visitas domiciliarias con fotos en Storage y GPS a Google Maps
- Accesos por usuario (`profiles.permisos` jsonb)

### Migraciones SQL aplicadas (carpeta `motogestion/supabase/`)
- `001`–`012`: base v2.0 ✅
- `013_pago_aplicado_base_inicial.sql` ✅
- `014_grupo_usadas_club.sql` ✅
- `015_pagos_campo_recibo.sql` ✅
- `016_profiles_permisos.sql` ✅
- `017_bucket_documentos.sql` ✅
- `019_fix_cliente_estado_trigger.sql` — corrige trigger para usar `mi_rol()` ✅
- `020_ahorro_domingo.sql` — agrega columna `ahorro_domingo` a contratos ✅
- `021_motos_subadmin.sql` — agrega `motos.subadmin_id` (sub-admin a cargo) ✅
- `022_visitas_asignacion.sql` — agrega `visitas.asignada_a` (sub-admin asignado a la visita) ✅
- `023_pagos_ubicacion.sql` — agrega `pagos.ubicacion` (GPS del cobro en campo) ✅
- `024_multa_recoleccion.sql` — agrega concepto `multa_recoleccion` a deudas ✅
- `025_clientes_visita_asignada.sql` — agrega `clientes.visita_asignada_a` ✅
- `026_rls_hardening.sql` — endurece RLS: el scope por rol (SUBADMIN/SOCIO/MECANICO) ahora se cumple también en la base de datos, no solo en el frontend ⚠️ **pendiente aplicar en Supabase**

### Pendientes manuales ⚠️
- Desplegar Edge Function: `supabase functions deploy manage-users`

### Reglas de cartera — CobrosView ✅
- **Contrato nuevo sin pagos:** `calcularEstadoCartera` y `calcEstadoCuenta` reciben `fecha_entrega`. Si `fecha_entrega >= inicioPeriodo` (último día de pago) → "Al día", no mora.
- **Pendiente en prorrateo:** Si el contrato está en período de prorrateo (entregado después del último día de pago, sin pagos), `cuotaPactada` usa `calcProrrateoInicial()` en vez de `valor_semanal`. Itera día a día detectando domingos igual que el wizard.
- **`calcProrrateoInicial`:** Misma lógica que `calcPrimerPago` del wizard — usa `tarifa_diaria + ahorro_diario` para L-S y `tarifa_domingo + ahorro_domingo` para domingos.
- **RLS contratos:** Políticas INSERT/UPDATE usan `public.mi_rol()` — roles permitidos: `ADMIN`, `ADMIN_PRINCIPAL`, `SECRETARIA`.

### Completado en WizardContrato paso 1 ✅
- 4 inputs directos: tarifa_ls, tarifa_dom, ahorro_ls, ahorro_dom
- Cálculo automático de valorSemanal, valorQuincenal, valorMensual
- Desglose visual por día (tabla L-S vs Domingo)
- Base inicial pre-cargada desde `clientes.ingreso_inicial`
- Tarjeta comparativa: pagó al registrarse | requerido | falta o suficiente
- Prorrateo día a día con detección de domingos
- Alerta de base solo cuando `form.cliente_id && valorSemanal > 0`
- MoneyInput con $ y separadores de mil
- `ahorro_domingo` guardado en BD al crear contrato

### Completado — SUBADMIN scope ✅
- Asignación de motos a sub-admin (`motos.subadmin_id`) + selector en MotosView (solo ADMIN/AP)
- Asignación de visitas a sub-admin (`visitas.asignada_a`) + selector en ClientesView/PanelAprobacion
- Filtrado global por `useScope()` en: MotosView, ContratosView, CobrosView, TallerView, LiquidacionesView, ClientesView, DashboardView, CampanaAlertas, BusquedaGlobal
- Reglas decididas: visitas se asignan (no pool); SUBADMIN no registra clientes; una moto = un sub-admin

### Completado — Panel HOY ✅
- Pestaña **"📋 Hoy"** (por defecto) en CobrosView, organizada por TAREA no por estado.
- Agrupa por urgencia sin duplicar: Recolección (mora real >3d) → Mora → Gabela → Pagan hoy. Solo muestra pendientes (Al día no aparece).
- Tareas como botones: Mensaje (abre WhatsApp + registra), Llamar (abre `tel:` + registra), Sirena (registra, 3 seg, GPS real pendiente), Recolección (registra orden).
- "Tarea hecha hoy" = existe gestión de ese tipo con `fecha=hoy` → check verde. Todo queda en `gestiones_cobro`.
- Hereda filtrado SUBADMIN (cada quien ve solo tareas de sus motos).

### Pendiente 🔲
- **Gestión de permisos por usuario (UsuariosView):**
  - Lista de usuarios con su rol actual
  - Al seleccionar un usuario → mostrar permisos activos e inactivos (toggle)
  - Permisos organizados por categoría (módulos, acciones, funciones específicas)
  - Jerarquía: ADMIN_PRINCIPAL puede todo → ADMIN → SECRETARIA → MECANICO → SOCIO
  - Permisos granulares por ViewKey + acciones específicas (registrar efectivo, crear contrato, etc.)
  - Base: `profiles.permisos` (jsonb) ya existe — expandir su estructura
- Integración GPS real (sirena + apagado remoto)
- WhatsApp automático
- Reportes exportables PDF/Excel
- APK nativo con Capacitor
- Recibo como imagen/PDF con logo

---

## PARA RETOMAR EN LA PRÓXIMA SESIÓN

**Estado del código:** `claude/clever-turing-daklkq` y `main` sincronizados. `npm run build` pasa. Árbol limpio. Último commit en main: `63c7aa8` (gestión de usuarios exclusiva de ADMIN_PRINCIPAL + cierra huecos de seguridad).

### 🔲 Pendiente — verificar despliegue de Usuarios/seguridad (5 jul 2026)
Se construyó e implementó en esta sesión (código en `main`, y el usuario confirmó haber hecho los 3 pasos de despliegue en Supabase: redesplegar `manage-users` con el código nuevo pegado en el Dashboard, y correr la migración SQL del trigger). **Falta verificar que quedó funcionando** — checklist para la próxima sesión o para que el usuario confirme:
1. SERGIO (ADMIN) ya no debe ver "Usuarios" en su menú.
2. FREDY (ADMIN_PRINCIPAL) sí debe seguir viéndolo.
3. Al editar un usuario, el campo "Correo electrónico" debe aparecer ya lleno con el correo real (confirma que la acción `list` nueva funciona).
4. Cambiar el correo de un usuario y guardar no debe dar error.
5. Resetear contraseña debe seguir funcionando igual que antes.
6. Sin errores nuevos en Supabase → Edge Functions → `manage-users` → Logs.
- **Sin confirmar:** si la función `create-user` (eliminada del código) todavía aparece desplegada en el Dashboard de Supabase — si aparece, hay que borrarla ahí manualmente (el código ya no existe en el repo).

### 🔲 Pendiente — 5 motos/contratos con tarifa placeholder (5 jul 2026)
Al buscar más casos del bug de RMZ48H (valor mensual metido en el campo semanal) se encontró un problema distinto y menor: 5 contratos con `tarifa_diaria`/`tarifa_domingo` en valores no redondos (`$27.857`, `$13.929` — resultado de dividir `valor_semanal / 7`, justo el patrón "total/7" que el sistema tiene prohibido). El `valor_semanal` en sí está bien, así que el cobro semanal no se ve afectado — solo importaría si se usa la tarifa exacta de un día o se hace prorrateo para estos contratos.

El usuario dio instrucciones sobre qué hacer con cada moto (no ejecutado aún, pendiente el paso a paso en la app):
- **RMZ65H** (KEINER ANDRES GOMEZ TORREZ) — ya no tiene conductor. Recomendado: pasar por Taller para revisión antes de "Disponible" (no directo).
- **RMZ64H** (DELCY JUDITH YEPES OCHOA) — guardada en Fiscalía. Cambiar `motos.estado` a "Fiscalía" desde MotosView — el contrato NO se cancela (Fiscalía congela tarifa, no cierra contrato).
- **RMZ69H** (JESUS ALBERTO BAYONA), **XYZ48H** (JOSE MANUEL VILLANUEVA), **YAL57H** (CAMILO BERROCAL GARCIA) — a "Disponible". Recomendado: Cancelar/Finalizar el contrato del cliente desde Contratos (no cambiar `motos.estado` directo por SQL) para no dejar el contrato "Activo" huérfano mientras la moto queda libre para otro cliente.
- Sin confirmar aún: si los contratos de estos 3 últimos clientes deben cerrarse formalmente o no — quedó pendiente la respuesta del usuario.

### ⚠️ Migraciones SQL pendientes de confirmar en Supabase (sesión 4 jul 2026)
```sql
-- 1. Foto de perfil del cliente
alter table public.clientes
  add column if not exists foto_perfil_url text;

-- 2. Acompañante vive en la misma dirección (no repite recibo)
alter table public.clientes
  add column if not exists mismo_domicilio_acompanante boolean default false;
```
Sin estas dos, guardar cliente con foto de perfil falla, y el selector "¿Vive en la misma dirección?" no persiste (vuelve a `false` siempre). La migración 030 (`autorizacion_datos_*`) del inicio de esta sesión sí fue confirmada por el usuario.

### Sesión 4 jul 2026 — resumen de lo construido
1. **Firma en modal de pantalla completa** (`CanvasFirma.tsx`, prop `modal`) — canvas vertical grande (480×680) con botones Atrás/Repetir/Aceptar, en vez del canvas horizontal chico inline. Usado en ClientesView (autorización de datos).
2. **Firma y huella ahora opcionales** al registrar/editar cliente — no bloquean el guardado, se pueden completar después. Visibles tanto en registro como en edición (antes solo en registro), con pre-carga (`valorInicial`) si ya existían.
3. **Bug real corregido:** `guardarEdicion()` en ClientesView nunca subía a Storage la firma/huella si se volvían a capturar al editar — guardaba el `data:` URL crudo en la BD. Ahora sube igual que al crear.
4. **🐛 Bug de arquitectura encontrado y corregido:** `ClienteDetalleSheet.tsx` (panel deslizante) **nunca se abría en ningún lugar de la app** desde que se creó (22 jun) — código muerto desde el día 1. Todo el trabajo de foto/firma/huella/imprimir se había hecho ahí primero y era invisible para el usuario. Se **eliminó el archivo completo** y se trasladó todo a `FichaClienteView.tsx` (la pantalla real de "Ver ficha completa", con pestañas Resumen/Contrato/Pagos/Visitas/Documentos/Deudas/Convenios/Gestiones). **Lección: verificar SIEMPRE en el navegador con la pantalla real que el usuario usa, no asumir cuál es el componente correcto por el nombre.**
5. **Foto de perfil del cliente** — nuevo componente `FotoPerfil.tsx`: botones 📷 Cámara / 🖼 Galería (con `capture="user"` para cámara frontal), recorte automático a cuadrado centrado vía `<canvas>`, vista previa antes de confirmar ("🔄 Elegir otra" / "✓ Usar esta foto"). Opcional. Se muestra en el círculo de la hero card de `FichaClienteView` (antes solo mostraba la inicial).
6. **Documento imprimible de autorización de datos** — `generarHTMLAutorizacionDatos()` en `useDocumentos.ts`, botón "🖨️ Imprimir documento" en la sección "Autorización de datos" del tab Documentos de `FichaClienteView`. Lista de categorías de datos autorizados **dinámica** según lo que el cliente realmente tenga: nombre/cédula/dirección/teléfono siempre, + foto de perfil, cédula, recibo, hoja de vida, antecedentes, licencia, huella (cada uno solo si existe), + firma siempre.
7. **Miniaturas de firma/huella con lightbox** en `FichaClienteView` (tab Documentos) — clic para ampliar en overlay de pantalla completa.
8. **Un solo "Recibo público"** como requisito — se eliminó `recibo2` de `DocumentoFlags`, `emptyDocs()`, `documentosListos()`, `DOCS_ACOMPANANTE`, checklist/resumen (ClientesView) y `DOC_LABELS` (FichaClienteView). Etiqueta renombrada de "Recibo 1/2" a "Recibo público".
9. **Acompañante no repite recibo si vive con el cliente** — nueva columna `mismo_domicilio_acompanante` (boolean). Selector Sí/No en el formulario. Si "Sí": el checklist del acompañante solo pide cédula (aviso visible "usa el mismo recibo público"). Propagado a `documentosAcompananteListos()`, `calcularEstado()`, `documentosFaltantes()` (afecta el estado "Inmovilización documentación incompleta") y el tab Documentos de FichaClienteView.
10. **Corrección de documentación:** el CLAUDE.md decía que el acompañante requería antecedentes judiciales — el código nunca lo exigió (`DOCS_ACOMPANANTE` solo pedía cédula+recibo). Confirmado por el usuario: se quitó ese requisito en una sesión anterior y no había quedado registrado. Ya corregido en la sección "Proceso completo de un cliente nuevo".

### Próximos pasos sugeridos 🔲
- Confirmar las 2 migraciones pendientes arriba.
- Probar en el navegador con login real: registrar/editar un cliente con foto de perfil, firma (modal vertical), huella, y verificar que "Ver ficha completa" → tab Documentos muestra todo correctamente + el botón de imprimir genera el documento bien.
- Probar el selector "¿Vive en la misma dirección?" de punta a punta: marcar Sí, verificar que no pide recibo del acompañante y que el estado pasa a "Listo para visita" solo con cédula del acompañante.
- Seguía pendiente de sesiones anteriores: primera prueba real del lector de huellas DigitalPersona en un segundo PC (diagnóstico de certificado TLS en curso, ver [[estado-huellero-digitalpersona]] en memoria), probar recibo impreso con la GA-E2001 real, probar convenio obligatorio en flujo real, completar datos de motos técnicos y contratos Pradera pendientes (RMZ69H, RMZ64H), migrar COSTA/RASTREADOR, revisar bucket `liquidaciones` inexistente en `useLiquidaciones.ts`, gestión de permisos por usuario (UsuariosView).

**Usuarios en producción:**
| Email | Nombre | Rol |
|---|---|---|
| brandon@hotmail.com | FREDY | ADMIN_PRINCIPAL |
| emiro@hotmail.com | SERGIO AGUAS | ADMIN |
| andres@hotmail.com | EMIRO | SUBADMIN |
| angela@hotmail.com | ANGELA | SECRETARIA |

**Estado de WizardContrato.tsx:** Paso 1 completamente corregido (Quincenal/Mensual con `dias_pago_mes`, base inicial no editable, convenio obligatorio si base incompleta). Pasos 2-6 sin cambios de lógica (paso 2 tiene confirm() antes de asignar; paso 6 tiene 5 fotos guiadas).

**Estado de cicloPago.ts:** `src/utils/cicloPago.ts` es la fuente única de verdad para cálculos de ciclo de pago. Antes de modificar lógica de mora/prorrateo/período en CUALQUIER vista, verificar primero si la función ya existe ahí.

**Migración 030 pendiente de confirmar:** columnas `autorizacion_datos_*` en `clientes` — sin esto, registrar cliente nuevo falla al guardar la firma. El usuario no confirmó si la corrió.

### Lo hecho en sesiones anteriores ✅
1. **SUBADMIN scope completo** — `motos.subadmin_id` (mig 021) + `visitas.asignada_a` (mig 022). Hook `useSubadminScope`/`useScope` + `SubadminScopeProvider` (envuelve TODO el layout, header incluido). Filtrado global en: Motos, Contratos, Cobros, Taller, Liquidaciones, Clientes, Dashboard, CampanaAlertas, BusquedaGlobal.
2. **Navegación reorganizada** — hoja Más (móvil) y sidebar (desktop) con MISMA taxonomía: Operaciones · Cobros & Dinero · Flota & Taller · Seguimiento · Administración.
3. **Cobro en campo completo** (mig 023 `pagos.ubicacion`) — GPS + foto opcional + recibo provisional WhatsApp + flujo 2 pasos (entregar → confirmar) + conciliación en Caja Diaria.
4. **Cartera reorganizada: 11 pestañas → 4 secciones** (Hoy · Contratos · Dinero · Historial). Listas dentro de recuadros con scroll propio. KPIs navegan a Contratos con filtro.

### Lo hecho en sesiones anteriores (cont.) ✅
5. **Panel Hoy rediseñado** — mismo diseño que la sección Contratos:
   - Chips de filtro: `Todos · 🚚 Recolec. · 🔴 Mora · 🟡 Gabela · 🔵 Pagan hoy` (con flexWrap, sin scroll lateral)
   - Buscador por nombre/placa
   - Lista dentro de recuadro con scroll (`maxHeight 56/62vh`)
   - Tarjetas siempre abiertas: nombre + placa + badge de estado + botones de tarea visibles directo
   - Pendientes primero (tarjetas con tareas sin hacer arriba; resueltas en gris/opaco abajo)
   - Monto "Debe pagar" visible en cada tarjeta
6. **Emojis en chips de Contratos** — `🔴 Mora · 🟡 Gabela · 🟢 Al día · 🔵 Pagan hoy` igual que en Hoy
7. **RLS hardening (mig 026)** — auditoría completa de Supabase encontró tablas sensibles abiertas (`USING(true)`). Se crearon funciones de scope reutilizables (`mi_rol()`, `mis_contratos_subadmin()`, etc.) y se blindaron políticas por rol en clientes/contratos/motos/deudas/convenios/gestiones_cobro/pagos/visitas/liquidaciones/caja_diaria/historial_ubicaciones/recepciones_vehiculo/acuerdos_tiempo_rodado. Aplicada en Supabase ✅.
8. **REGLA DE VERIFICACIÓN PREVIA** agregada a CLAUDE.md — cualquier decisión ambigua se pregunta ANTES de escribir código, incluso a mitad de tarea ya aprobada.
9. **Bugs de permisos reales corregidos en CobrosView** — SECRETARIA veía botón "Entregué a secretaria" que no le correspondía; SUBADMIN veía "Confirmar"/"Rechazar" pago (2 lugares) — ambos exclusivos de SECRETARIA/ADMIN/ADMIN_PRINCIPAL.
10. **Cobro en campo → modal flotante** — dejó de ser pestaña fija; ahora se abre desde botón "+" global o "💵 Cobrar" en cada tarjeta de Hoy.
11. **Pestaña "💵 Dinero" → "⏳ Por confirmar"** — 2 columnas (lado a lado en desktop, apiladas en móvil): Transferencias por confirmar (oculto a SUBADMIN) y Efectivo de campo por confirmar, cada una con buscador + scroll propio.
12. **Auditoría móvil 375px (parcial, pausada)** — `src/styles/shared.ts` creado (`card`/`inputStyle`/`labelStyle`/`primaryBtn`/`secondaryBtn`/`listaConScroll`). 2 bugs reales corregidos en Cartera: falta `boxSizing:"border-box"` (desborde de 32px) y `alignItems:"start"` sin condicional mobile (rompía columna en 375px). **Pendiente:** revisar el resto de pantallas (Motos, Usuarios, Liquidaciones, Configuración, Alertas, Inmovilizaciones, Reportes, Referidos, Importación, Caja, HistorialPagos, WizardContrato, Login, fichas).
13. **Migración de datos reales — grupo PRADERA** ✅:
    - Se eliminaron 177 registros de otros grupos (motos/contratos/clientes no-Pradera) por decisión del usuario — no había uso diario aún en esos grupos. **Nota importante:** el primer intento de borrado pareció exitoso (verificación mostró 52/52/52) pero el `COMMIT` se corrió como consulta separada y no se aplicó — quedó revertido en silencio. Se detectó días después porque volvían a aparecer 226-229 registros. Se corrigió regenerando el DELETE completo (orden correcto de FKs: pagos→gestiones_cobro→convenios→deudas→acuerdos_tiempo_rodado→recepciones_vehiculo→liquidaciones→visitas→historial_ubicaciones→taller→contratos→motos→clientes) como **un solo bloque `BEGIN...COMMIT` en una sola ejecución** — confirmado 52/52/52 real. **Regla para toda operación destructiva futura en Supabase SQL Editor: el script completo, incluyendo el `COMMIT;` final, debe pegarse y ejecutarse de una sola vez — nunca separar `BEGIN`/operación de un lado y `COMMIT` en una ejecución aparte.**
    - Tabla `referidos` (documentada en CLAUDE.md, sistema de premios) **no existe en la BD real** — la migración 010 nunca la creó o se perdió. Sin código en frontend que la use tampoco. Pendiente crear si se retoma el sistema de referidos.
    - Quedaron 52 motos/contratos/clientes de Pradera. De esos, **44 contratos corregidos** con datos reales (cédula, teléfono, whatsapp, forma_pago, tarifa_diaria/domingo, ahorro_diario/domingo, valor_semanal, meses, `ahorro_inicial`, `clientes.ingreso_inicial`, fecha_entrega, ahorro_acumulado) desde `MIGRACION_GPS_SATELITAL_v2 (1).xlsx` (hojas CONTRATOS_PRADERA + ARQUEO_PRADERA). Deuda de apertura insertada donde aplicaba (DEUDA_ACTUAL + saldo a favor negativo tratado como deuda adicional).
    - Script ejecutado y confirmado por el usuario ✅ (`motogestion/migracion_datos/update_pradera_v2.sql`, gitignored — contiene PII real).
    - **Limpieza post-migración (2 jul 2026):** se borraron TODOS los pagos, gestiones_cobro y caja_diaria (eran de una migración de prueba anterior — verificado 0/0/0). Se corrigieron los **nombres** de los 44 clientes (el script original actualizaba cédula/teléfono pero no `nombre`). Verificado: cero deudas residuales de prueba — solo existen las deudas de apertura del arqueo.
    - **Saneo final (2 jul 2026, verificado con query de 4 chequeos ✅):** deudas de apertura duplicadas eliminadas (el script v2 se corrió 2 veces — los UPDATE son idempotentes pero los INSERT de deudas se duplicaron), `RMZ47H.fecha_entrega` corregida a 2025-10-09 (el Excel traía 2026 por error de digitación), contrato RMZ67H reactivado (se canceló sin querer probando la app), migración 027 aplicada.
    - **FECHA DE CORTE DE MIGRACIÓN: 2026-07-01** — constante `FECHA_CORTE_MIGRACION` en `useContratos.ts`, con helper `diasDesdeUltimoPago()`. Ningún reloj de "días sin pago" arranca antes del corte; los saldos previos viven como deuda de apertura. Al migrar COSTA/RASTREADOR evaluar si la fecha se actualiza o se maneja por grupo.
    - **Pendiente:** 2 contratos sin tarifa/ahorro/base en el Excel — `RMZ69H` (JESUS DAVID SIERRA CASSIANI) y `RMZ64H` (DELCY JUDITH YEPES OCHOA) — faltan por completar cuando el usuario tenga esos datos.
    - **Pendiente:** datos técnicos de las 52 motos (marca, modelo, color, número de motor/chasis, cilindraje, SOAT, tecnomecánica) — hoja MOTOS_PRADERA llegó vacía, usuario aún no tiene esa info a la mano.
    - **Pendiente:** repetir el mismo proceso para grupos COSTA y RASTREADOR (aún no iniciado, deliberadamente diferido).

14. **Herramientas post-migración desplegadas a producción (2 jul 2026, commit `4b5025a` en main)** ✅:
    - **Fix prorrateo:** `estaEnProrrateo()` compartida — prorrateo solo si `fecha_entrega >= inicio del período` Y sin pagos (el código solo chequeaba "sin pagos" → los 44 migrados mostraban cuota de prorrateo falsa). Aplicada en los 5 puntos de CobrosView. Verificado en navegador: cuota real $195.000.
    - **Reloj "días sin pagar" con corte:** `diasDesdeUltimoPago()` usada en CobrosView y DashboardView (antes cada uno tenía su copia). Migrados muestran días desde el corte, no desde la entrega — entran a Recolección solo tras >3 días de mora real en el sistema nuevo, igual que cualquier cliente.
    - **Modal "Editar contrato"** (`ModalEditarContrato.tsx`, solo ADMIN/AP, cualquier estado) con historial de auditoría visible — tabla `contratos_auditoria` (mig 027): campo, valor anterior/nuevo, quién, cuándo. `editarContrato()`/`obtenerAuditoria()` en useContratos.
    - **Editar/eliminar deudas** desde detalle del contrato en Cartera (solo ADMIN/AP): concepto, descripción, monto original y pendiente — con auditoría en la misma tabla 027 y sincronización de estado (pendiente→pagada al llegar a $0; conserva en_convenio). Validación: pendiente ≤ original.
    - **Reactivar contrato** (botón para Cancelados) + confirmación en Cancelar (antes cancelaba con un solo clic — así fue el accidente de RMZ67H).
    - **Chips de filtro por grupo** (Todos/COSTA/PRADERA/RASTREADOR/USADAS) en MotosView, ContratosView, ClientesView (grupo vía contrato→moto) y CobrosView pestaña Contratos.
    - Lección de verificación: el fix de prorrateo y los duplicados de deudas solo se detectaron **verificando en el navegador con datos reales** (RMZ62H mostraba $105.000 y $780.000) — no bastaba tsc+build.

15. **Saneo final de datos + más fixes de "deuda/mora inventada vs real" (2 jul 2026, commits `9da833b`→`d727f44` en main)** ✅:
    - **Nombres corregidos** de los 44 clientes (el script de corrección tocó cédula/teléfono pero nunca `nombre` — quedaban los nombres de la BD de prueba anterior, ej. XYZ50H mostraba "JADER OROZCO PUENTE" en vez de "JHEFERSON GARCIA SILVA").
    - **Pagos/gestiones/caja de una migración de prueba anterior eliminados** (fechas 18-25 jun, placas de Pradera pero datos de ensayo, no reales) — verificado 0/0/0.
    - **`PLAZO_MESES` aclarado:** la columna del Excel (`contratos.meses`) es el **plazo TOTAL** del contrato desde `fecha_entrega` (igual que pide el wizard: "Duración (meses), máx. 24"), no tiempo restante. El sistema calcula solo la fecha de vencimiento real (`fecha_entrega + meses*30`, mismo criterio en `useAlertas.ts` para "traspaso próximo") — no hace falta recalcular nada para los 44 migrados, ya quedó bien con los datos del Excel.
    - **Bug "Vencido hace Xd" en ContratosView:** `calcularDiasHastaVencimiento` usaba solo 1 período de pago (7/15/30 días) en vez del plazo total — cualquier contrato con más antigüedad que un período quedaba marcado "vencido" para siempre, aunque estuviera al día. Corregido para usar `contrato.meses * 30` (igual que la alerta de traspaso). Confirmado: bug afectaba a CUALQUIER contrato semanal del sistema pasado su primera semana, no solo migrados — solo se hizo visible masivamente porque los 44 ya llevaban meses.
    - **Bug "Al día" ocultaba deuda pendiente:** de 4 lugares en Cartera que calculan "cuánto debe" (Panel Hoy, Cobro en campo, pestaña Contratos, detalle del contrato), 2 solo miraban la cuota de la semana e ignoraban `deudaContrato`/`cuotaConvenio` — un cliente con deuda de apertura podía verse "Al día" en verde. Corregidos para sumar siempre cuota + deuda + convenio, sin duplicar contra el chip "Total" ya existente (primer intento sí duplicó — corregido tras verificar en navegador).
    - **Informe de Reportes/Cartera usaba "deuda estimada" (días × tarifa) en vez de la deuda real** de la tabla `deudas` — mismo patrón repetido en `InmovilizacionesView` (mostraba "∞ días, crítica" a los 44 migrados) y `CobroDiarioView` (calculaba `deudaReal` pero nunca la mostraba). Las 3 corregidas para sumar la deuda real registrada + usar `diasDesdeUltimoPago()` con el corte de migración en vez del sentinel 999.
    - **Gap de diseño identificado (no resuelto, pendiente):** el sistema no tiene mecanismo para "rodar" el tiempo del contrato cuando la moto no estuvo en poder del cliente por causas ajenas (taller, fiscalía, tránsito, garantía, préstamo). Existe la tabla `acuerdos_tiempo_rodado` y el hook `crearAcuerdoTiempo()` (decisión `cobrar_ahora` vs `rodar_al_final`) pero **nunca se conectó a ningún botón** — código muerto. Regla de negocio acordada con el usuario: rueda tiempo SOLO si la moto no estuvo con el cliente por algo ajeno a él; NO rueda por simple atraso de pago teniendo la moto — eso lo debe resolver el protocolo de mora (mensaje→llamada→recolección), no una extensión de plazo. **Decisión para los 44 migrados:** no reconstruir histórico de tiempo rodado — si el usuario tiene la fecha/plazo real correcto de algún migrado, se ajusta directo por el Modal Editar Contrato (`meses`/`fecha_entrega`). El mecanismo de tiempo rodado solo se construye hacia adelante, para eventos nuevos de taller/retención.
    - **Idea de diseño acordada para cuando se construya "tiempo rodado":** agregar una columna real `fecha_fin_contrato` (o similar) en vez de seguir calculándola al vuelo (`fecha_entrega + meses*30`) — se calcula igual al crear el contrato, pero queda guardada y editable, y cuando el mecanismo de tiempo rodado la mueva, el cambio queda en `contratos_auditoria` (misma tabla que ya existe). Se construye junto con el mecanismo, no antes — así no queda una mitad sin usar.

16. **"Adjuntar documento" al contrato ya creado — construido (2 jul 2026, commit `e484bfb` en main)** ✅: el wizard solo capturaba contrato/pagaré/certificado al crear el contrato (gap real para los 44 migrados, que nunca pasaron por el wizard). Nuevo modal `ModalDocumentosContrato.tsx` en ContratosView (botón "📎 Documentos del contrato", visible para ADMIN, ADMIN_PRINCIPAL y SECRETARIA), con cámara/galería por cada uno de los 3 documentos. `adjuntarDocumentoContrato()` en `useContratos.ts` sube al bucket `documentos` (mismo ya usado por el wizard) y registra el cambio en `contratos_auditoria`. Verificado en navegador.

17. **"Tiempo rodado" construido y conectado (2 jul 2026, commit `2327692` en main)** ✅ — ⚠️ **falta correr la migración 028 en Supabase**:
    - **`contratos.fecha_fin_contrato`** (mig 028) — antes el vencimiento se recalculaba siempre al vuelo (`fecha_entrega + meses*30`); ahora es un dato real guardado, editable desde el Modal Editar Contrato ("Fecha real fin de contrato") y auditado. Backfill automático con la misma fórmula para los contratos existentes. `WizardContrato` la calcula y guarda al crear un contrato nuevo. `useAlertas.ts` (traspaso próximo) y `ContratosView` (badge de vencimiento) ya leen esta columna en vez de recalcular.
    - **Reglas de negocio acordadas con el usuario:** el tiempo rueda (se extiende `fecha_fin_contrato`) SOLO cuando la moto no estuvo en poder del cliente por algo ajeno a él (taller, fiscalía, tránsito, garantía) — nunca por simple atraso de pago con la moto en su poder (eso lo resuelve el protocolo de mora). La decisión "cobrar ahora vs rodar al final" la toma ADMIN/ADMIN_PRINCIPAL caso por caso (ej. según si el cliente tiene el dinero), y **siempre exige un documento firmado por el cliente** especificando el tiempo y el valor correspondiente, como respaldo legal de que su contrato no termina en la fecha que creía.
    - **`ModalResolverTiempoFueraServicio.tsx`** (nuevo) — se abre automáticamente (solo para ADMIN/AP) al finalizar una orden en `TallerView` o al liberar una retención en `MotosView` (Fiscalía/Tránsito/Garantía), si hay un contrato Activo para esa moto y pasaron días de por medio. Calcula días × tarifa, deja elegir cobrar (crea `deuda` tipo `tarifa_atrasada`) o rodar (extiende `fecha_fin_contrato` + registra en auditoría), y bloquea confirmar sin subir el documento firmado.
    - Usa la tabla `acuerdos_tiempo_rodado` y el hook `crearAcuerdoTiempo()`/`subirDocumentoAcuerdo()` que ya existían en el código desde antes pero nunca se habían conectado a ningún botón (código muerto).
    - **Fix de paso:** `subirDocumentoAcuerdo()` apuntaba a un bucket `liquidaciones` que **nunca se creó** (ninguna migración lo registra en `storage.buckets` — la subida fallaba en silencio). Cambiado al bucket `documentos` ya existente y con RLS. `useLiquidaciones.ts` referencia el mismo bucket inexistente — **pendiente de revisar** (no se tocó, fuera del alcance de esta tarea).
    - **Para los 44 migrados:** no hay eventos de taller/retención pendientes en el sistema nuevo — nada que resolver retroactivamente. Si el usuario sabe que a algún cliente en particular sí le pasó algo antes de existir el sistema (ej. RMZ62H — SIMON CORREA CANTILLO tuvo una semana en taller por accidente según la columna OBSERVACIONES del Excel de migración), se corrige directo la `fecha_fin_contrato` de ese contrato por el Modal Editar Contrato.

### Plan acordado para completar la migración (fases)
- **Fase 2 — completar datos por la app (sin más SQL masivo):** aprovechar el día de pago (miércoles) para completar documentos de cliente/acompañante (ClientesView), datos técnicos de motos (MotosView → ✏️ Editar datos), cifras de los contratos pendientes (Modal Editar contrato). **Gap conocido:** no existe forma de adjuntar documentos firmados (contrato/pagaré escaneado) a un contrato ya creado — el wizard solo los captura al crear. Pendiente construir "adjuntar documento" en el detalle.
- **Fase 3 — cartera clara:** cada cliente = cuota período + deuda de apertura + convenio. Semanas sin rodar/cobrar → deuda `tarifa_atrasada` o `acuerdos_tiempo_rodado`.
- **Fase 4 (pendiente de evaluar, el usuario dijo "después"):** estado de cuenta de apertura imprimible por cliente, para que firme aceptando su saldo del corte — respaldo legal de la cifra migrada.

### Migraciones ya aplicadas en Supabase por el usuario
- `021_motos_subadmin.sql` ✅ · `022_visitas_asignacion.sql` ✅ · `023_pagos_ubicacion.sql` ✅ · `026_rls_hardening.sql` ✅ · `027_contratos_auditoria.sql` ✅
- `028_fecha_fin_contrato.sql` ✅ · `029_documentos_delete_policy.sql` ✅ — verificadas en Supabase (2 jul 2026): columna existe, backfill aplicado, política de borrado activa.
- `031_dias_pago_mes.sql` ✅ — columna `dias_pago_mes integer[]` en `contratos`, aplicada por el usuario (3 jul 2026).

### Completado (2 jul 2026, commit `44fca9f` en main) ✅
- **Cancelar contrato mal gestionado**: botón "🗑️ Cancelar y eliminar" en el wizard — borra por completo (fila, fotos/firmas, libera moto) un intento "En proceso" nunca activado, en vez de dejarlo atascado como pasaba antes al solo cerrar el wizard. `eliminarContratoEnProceso()` en `useContratos.ts`.
- **Motos en mayúsculas**: placa, marca, modelo, color, cilindraje, N° motor, N° chasis (crear y editar) — excepto Observaciones y Propietario.
- **Dinero con formato en toda la app**: componente compartido `MoneyInput` (extraído del que ya existía en WizardContrato) aplicado en los 24 campos de dinero que quedaban con `<input type="number">` plano, repartidos en 8 archivos. `fmtMoney()` agregado a `shared.ts` para visualización (aunque ya era consistente en casi todo el código).

### Completado (2 jul 2026, commit `b7f5a70` en main) ✅ — bug real de React, no relacionado a mayúsculas/dinero
- **`MotosView.DetallePanel` y `CobrosView.PanelDetalle` perdían el foco al escribir una letra** — estaban definidos como funciones anidadas dentro del componente principal (`function DetallePanel() {...}`) e invocados como componente JSX (`<DetallePanel />`). Cada tecla actualizaba estado del componente padre → React recreaba la función → la trataba como un componente "nuevo" → remontaba todo el panel → el input perdía el foco después de cada letra (en el celular, el teclado se cerraba solo). **Corregido invocándolos como función directa** (`{DetallePanel()}` / `{PanelDetalle()}`) en vez de como tag JSX — evita que React los trate como un componente con identidad propia.
  - **Regla para el futuro:** si una función que retorna JSX está definida DENTRO de otro componente (para compartir su closure/estado), y contiene inputs de texto, **nunca invocarla como `<NombreFuncion />`** — siempre como `{NombreFuncion()}`. Si se invoca como tag JSX, React la trata como un tipo de componente distinto en cada render y la remonta.
  - Se revisaron los demás 8 casos del mismo patrón en el proyecto (`ChipsGrupo` en 3 archivos, `ListaContratos`, `PanelDetalle` de ContratosView, `TarjetaCliente`/`AccionesBtns` de CobroDiarioView, `CardAlerta`, `GroupLabel`/`DetailPanel` de BusquedaGlobal, `PagoCard` en 2 archivos) — ninguno tiene inputs de texto ligados a estado del padre, así que no sufren el mismo bug. Si se agrega un input de texto a cualquiera de esos en el futuro, aplicar la misma regla.
  - **MotosView adicional:** SOAT/Tecnomecánica en "Editar datos" eran texto libre en vez de `type="date"` — corregido para que abran el calendario nativo, igual que en "Registrar nueva moto".
- **ClientesView:** no había forma de quitar un documento subido por error (cámara/galería) — nuevo botón "🗑️ Quitar / volver a intentar" junto a "✔ Ver documento cargado".

### Diseño acordado — Proceso de entrega, documentos automáticos y hardware nuevo (2 jul 2026, en construcción)

**Hardware que el usuario ya compró:**
- Impresora térmica POS "E2001" (modelo exacto sin confirmar — parece similar a "Digital POS DIG-E200I", un modelo colombiano). **Pendiente:** confirmar marca/modelo exacto. Probablemente no requiere código nuevo — la mayoría de estas impresoras se instalan como impresora normal de Windows y la función `window.print()` que ya existe en el recibo de Cartera debería servir; falta ajustar el ancho del recibo a papel térmico (58/80mm) y probar con el equipo real.
- Lector de huellas **HID DigitalPersona 4500** (USB).
- Lápiz digital (stylus) para firma — **ya funciona sin cambios**, el canvas de firma actual (`CanvasFirma` en WizardContrato) responde a touch/mouse genérico, un stylus solo mejora la precisión.

**Investigación sobre el lector de huellas (con fuentes):**
- En **PC con Windows**: sí se integra a una app web, vía librería `@digitalpersona/fingerprint` / `@digitalpersona/devices` (clase `FingerprintReader`, eventos `DeviceConnected`/`SamplesAcquired`/`ErrorOccurred`, métodos `startAcquisition(sampleFormat, deviceUid)`/`stopAcquisition`). **Requiere que el usuario instale un cliente de HID en esa PC** ("HID DigitalPersona Workstation/Kiosk" o el gratuito "HID Authentication Device Client") — la librería se conecta a ese cliente local por WebSocket. Sin ese instalador, no funciona. Fuentes: [Tutorial oficial](https://hidglobal.github.io/digitalpersona-devices/tutorial.html) · [GitHub](https://github.com/hidglobal/digitalpersona-devices) · [npm @digitalpersona/fingerprint](https://www.npmjs.com/package/@digitalpersona/fingerprint).
  - **Sin verificar aún:** el formato exacto de la muestra capturada (`SampleFormat`) y cómo convertirla a una imagen guardable — la documentación pública no detalla esto completo. Se implementará con el patrón documentado (evento `SamplesAcquired` → extraer muestra) pero **necesita probarse con el lector físico real** antes de darlo por terminado — no se puede verificar sin el hardware conectado.
- En **Android**: SDK oficial existe pero **solo funciona dentro de una app nativa** (Java/Kotlin), nunca desde un navegador móvil normal. Requeriría empaquetar la app con **Capacitor** + un plugin nativo a medida (conexión física por USB-OTG). Fuente: [DigitalPersona Android SDK](https://sdk.hidglobal.com/developer-center/digitalpersona-touchchip).
  - **WebAuthn (huella nativa del celular) NO sirve para esto** — por diseño de seguridad, el navegador nunca puede leer la huella real, solo un "sí/no coincide" contra un dato ya guardado en ESE dispositivo. No sirve para capturar la huella de un cliente nuevo como evidencia.
  - **Decisión de arquitectura para cuando se construya (más adelante, proyecto aparte):** si se empaqueta con Capacitor, usar el modo "apunta a la web en vivo" (la app nativa carga la URL real de Vercel dentro de un WebView, no una copia local) — así todo cambio de React/TS se refleja al instante en la tablet igual que en la web, sin reconstruir/reinstalar la app cada vez. Solo el código nativo del puente de huella (Java/Kotlin) necesita reconstruirse cuando cambie, y eso es raro. La app ya depende de internet todo el tiempo (Supabase), así que este modo no le agrega ninguna limitación nueva.
  - **Decisión: no se empieza ahora.** Se prioriza dejar completo y probado el flujo de PC primero.

**Plan de las 4 piezas a construir en PC (fase actual):**
1. **Tratamiento de datos al registrar cliente nuevo** (ClientesView) ✅ **construido (2 jul 2026, commit `483e4e6` en main)** — sección "Autorización de tratamiento de datos" al final del formulario de registro, con firma (`CanvasFirma`, ahora componente compartido en `src/components/`). Bloquea el registro (`handleGuardar`) si no hay firma. **Falta confirmar que la migración 030 se corrió en Supabase.**
   - **Huella dactilar conectada (2 jul 2026)** ✅ — el usuario instaló el driver **Non-WBF** + la app cliente de HID en el PC de la oficina. Integración construida:
     - `public/websdk/websdk.client.ui.js` — script oficial de HID (copiado del sample `hidglobal/digitalpersona-sample-angularjs`, MIT; el paquete npm NO lo trae). Se carga con `<script>` normal en `index.html` — **nunca importarlo como módulo**. Es el puente navegador ↔ app local de HID.
     - `vite.config.ts` — alias `WebSdk` → `src/types/websdk-shim.ts` (shim vacío), porque `@digitalpersona/devices` hace `import 'WebSdk'` que Vite no puede resolver; el código real viene del script global. Typings ambient en `src/types/websdk.d.ts` (del mismo sample).
     - `src/components/LectorHuella.tsx` — usa `FingerprintReader` de `@digitalpersona/devices` (npm, ya instalado) con `SampleFormat.PngImage` (la huella llega como PNG en base64url → se convierte a dataURL, manejando string u objeto `{Data}`). Estados: conectando / sin-agente (app HID no corre) / sin-lector (USB desconectado) / esperando dedo / capturada (preview + botón repetir). Avisos de calidad vía `QualityReported`.
     - ClientesView: la huella es **opcional al guardar** (decisión: si el lector falla no se bloquea el registro — la firma sí sigue obligatoria); si se capturó se sube al bucket `documentos` (`{cedula}/autorizacion_datos_huella/huella_autorizacion.png`) → `clientes.autorizacion_datos_huella_url`.
     - ⚠️ **Pendiente primera prueba con el lector físico real** — no se pudo probar sin el hardware; abrir "Nuevo cliente" en el PC con el lector conectado y reportar qué muestra la sección de huella.
2. **Huella en Contrato y Pagaré** (WizardContrato pasos 3 y 4) — 🔲 pendiente. Reutilizar `LectorHuella` (ya existe); se conecta DESPUÉS de validar la primera captura real en ClientesView, para no duplicar un patrón sin probar. El Certificado (paso 5) sigue igual, es una foto de documento físico firmado en papel (no cambia).
3. **Confirmación antes de asignar moto** (WizardContrato paso 2) ✅ **construido** — `confirm()` con placa + marca/modelo + nombre del cliente antes de llamar `handleStep2`.
4. **Entrega con 5 fotos guiadas** (WizardContrato paso 6) ✅ **construido** — `fotos_entrega` pasó de array plano a objeto etiquetado por ángulo (`delantera`/`lateral_izquierdo`/`arriba`/`lateral_derecho`/`trasera`), cada slot con un ícono SVG chico (`IconoAngulo`) que marca con una flecha desde dónde tomar la foto. Bloquea "Activar contrato" si falta alguna de las 5. **No se pudo probar visualmente en el navegador** (requiere llegar al paso 6 completando 1-5 con datos válidos, y no había sesión de login disponible) — verificar en el primer uso real.

**Nota de mapeo:** el filtro por grupo (COSTA/PRADERA/RASTREADOR/USADAS) que se agregó a Motos/Contratos/Clientes/Cartera **no aplica** al selector de moto del wizard — el grupo es una propiedad fija de la moto, no algo que ayude a filtrar cuando ya se sabe qué placa específica se va a asignar. Se evaluó y se descartó a propósito, no es un olvido.

5. **Fix real reportado por el usuario (3 jul 2026, commit `f3757b5` en main): la firma se cortaba al escribir** — "escribo un poco y luego no me deja hasta que retiro el dedo y nuevamente pasa lo mismo". Causa: `CanvasFirma.tsx` enganchaba los listeners (`mousedown`/`mousemove`/`touchstart`/etc.) en un `useEffect` con `[onChange]` como dependencia. Cada trazo llama `onChange(dataUrl)` → el padre (ClientesView) hace `setState` → se crea una nueva función `onChange` en cada render → el efecto se vuelve a ejecutar (desengancha y reengancha listeners) **a mitad del trazo**, perdiendo la variable local `drawing` (capturada en el closure del efecto anterior). Mismo patrón de fondo que el bug de `DetallePanel`/`PanelDetalle` (ver ERRORES PASADOS), pero manifestado distinto: ahí perdía foco, aquí corta un trazo continuo. **Fix:** listeners enganchados una sola vez (`useEffect(..., [])`) + `onChange` leído desde un `ref` (`onChangeRef.current = onChange` en cada render, usado dentro de los handlers) en vez de la dependencia directa. ⚠️ No se pudo probar en navegador por falta de credenciales de login — pedir confirmación al usuario tras el deploy.

### Impresora POS térmica — recibo de pago imprimible ✅ (3 jul 2026, commit `5f8edb5` en main)
- Impresora confirmada por el usuario: aparece en Windows como **"GA-E2001"** (driver ya instalado, se ve en Configuración → Impresoras). No se identificó el modelo exacto en catálogos públicos (no es "Digital POS DIG-E200I" con certeza) — no importa para el código: **el ancho de papel (58/80mm) lo define el driver/propiedades de la impresora en Windows, no el CSS de la web.**
- `ReciboPanel` en `CobrosView.tsx` (único lugar del sistema con `DatosRecibo`/`ReciboPanel` — confirmado por grep, no hay que replicar en otro archivo): antes `window.print()` imprimía toda la pantalla (modal + fondo oscurecido) porque no había ninguna hoja `@media print`. Ahora:
  - El contenido a imprimir vive en `#recibo-ticket` (encabezado + tabla de datos + estado); todo lo demás (header del modal, botones, sección WhatsApp) tiene la clase `recibo-no-print`.
  - `@media print`: oculta todo (`visibility: hidden`) excepto `#recibo-ticket`, y esconde por completo (`display:none`) cualquier elemento `.recibo-no-print`.
  - Encabezado impreso: **"CLUB DE MOTEROS"** + el grupo de la moto (COSTA/PRADERA/RASTREADOR/USADAS) debajo — se agregó el campo `grupo` a `DatosRecibo`, tomado de `moto.grupo` en los 3 sitios donde se arma el recibo (pago en efectivo, confirmar pago campo, recibo desde historial).
  - Botón renombrado de "Imprimir / Guardar PDF" a "Imprimir recibo" (ya no ambiguo, ahora es literalmente eso).
- ⚠️ **Pendiente primera prueba con la impresora física real** — no se pudo verificar en este entorno (sin login ni impresora conectada). El usuario debe hacer un cobro de prueba en Cartera, tocar "🖨️ Imprimir recibo" y confirmar que sale bien alineado al ancho del papel de la GA-E2001.

### Migración pendiente de aplicar en Supabase ⚠️
```sql
alter table public.clientes
  add column if not exists autorizacion_datos_firma_url text,
  add column if not exists autorizacion_datos_huella_url text,
  add column if not exists autorizacion_datos_fecha timestamptz;
```

### Lo hecho en esta sesión ✅
18. **`src/utils/cicloPago.ts` — módulo único para ciclos de pago (3 jul 2026, commit `a7d65c3` en main):**
    - Reemplazó 5+ implementaciones duplicadas dispersas en CobrosView, DashboardView, CobroDiarioView, y otros archivos de display (BusquedaGlobal, ClienteDetalleSheet, ContratosView, FichaClienteView, FichaMotoView, useDocumentos).
    - **Semanal:** lógica sin cambios (día de semana Lunes/Miércoles). **Quincenal/Mensual:** usa `dias_pago_mes: number[]` (fechas reales del mes, ej. [15, 30]) con clamp de fin de mes para meses cortos.
    - Funciones exportadas: `esDiaDePago`, `inicioPeriodoActual`, `proximoDiaPago`, `valorPeriodoReal` (usa `valor_semanal` × períodos reales, nunca `total/7`), `totalPagadoPeriodoActual`, `calcularEstadoCartera`, `calcularProrrateoInicial`, `estaEnProrrateo`, `formatDiaPago` (devuelve "Lunes"/"Miércoles" o "Días 15 y 30" o "Día 15").
    - **Bug encontrado de paso:** `ModalConvenio.tsx` hacía insert en columnas inexistentes (`motivo`, `cuota_convenio`, `total_convenio`, `cuotas_totales`, `fecha_inicio`) — probablemente nunca guardaba nada en producción. Corregido con las columnas reales del schema.

19. **Días de pago libres para Quincenal y Mensual** (commit `a7d65c3`):
    - Nueva columna `contratos.dias_pago_mes integer[]` (mig 031, aplicada ✅ por el usuario).
    - WizardContrato paso 1: Semanal conserva botones Lunes/Miércoles; Quincenal → 2 date pickers con presets (5&20, 10&25, 15&30); Mensual → 1 date picker con presets. Validación: Quincenal exige 2 fechas distintas, Mensual exige 1.
    - Prorrateo funciona igual para los 3 tipos (itera día a día detectando domingos con `calcularProrrateoInicial` del módulo `cicloPago`).

20. **Base inicial no editable en WizardContrato paso 1** (commit `a7d65c3`):
    - Antes era un `<input>` editable. Ahora es una tarjeta de color con 2 líneas centradas: `$ X de $ Y` + `falta $Z` (amarillo si falta, verde si suficiente). El valor siempre viene de `clientes.ingreso_inicial` — el funcionario no puede modificarlo ahí.

21. **ModalConvenio rediseñado — todos los convenios trabajan con meta** (commit `39f4d39` en main):
    - Decisión del usuario: "la idea de los convenios sí es llegar a la meta de pagar lo que deba". El modal siempre apunta a un monto total.
    - Si viene prop `metaFija` (ej. base inicial incompleta): no editable. Si no viene (caso general): se precarga con la deuda pendiente registrada del contrato, editable.
    - Toggle "Fijar por N° de cuotas / Fijar por valor de cuota". El que no se fija se calcula solo con `Math.ceil(meta / otro)`. Total siempre ≥ meta (a lo sumo unos pesos arriba por redondeo).
    - Props nuevas: `metaFija?: number`, `motivoInicial?: string`, `obligatorio?: boolean`.
    - Fix de columnas: el insert ahora usa solo los campos reales del schema.

22. **Convenio obligatorio cuando falta base inicial** (commit `39f4d39`):
    - WizardContrato paso 1: tras el insert exitoso del contrato, si `ahorroEntregado < baseRequerida` → se muestra `<ModalConvenio obligatorio metaFija={baseRequerida - ahorroEntregado} motivoInicial="Base inicial incompleta...">` sin poder cerrarlo. Solo avanza al paso 2 (asignar moto) tras guardar el convenio.
    - Con base suficiente: pasa directo al paso 2, igual que antes.

23. **Recibo detallado con desglose de cuenta** (commit `39f4d39`):
    - `DatosRecibo` ampliado: `debiaTotal`, `aplicadoTarifa`, `aplicadoDeuda`, `aplicadoConvenio`, `aplicadoSaldoFavor`, `pendienteDespues`, `convenioAbonado`, `convenioRestante`.
    - Sección "Detalle de su cuenta" en `#recibo-ticket` (impreso) y en `buildMsg()` (WhatsApp): cuánto debía, qué cubrió el pago desglosado, cuánto queda, estado del convenio si aplica.

### Migración pendiente de aplicar en Supabase ⚠️
```sql
alter table public.clientes
  add column if not exists autorizacion_datos_firma_url text,
  add column if not exists autorizacion_datos_huella_url text,
  add column if not exists autorizacion_datos_fecha timestamptz;
```
*(mig 030 — requerida para que el registro de cliente nuevo guarde la firma de autorización)*

### Próximos pasos sugeridos 🔲
- **Correr/confirmar la migración 030** en Supabase (arriba) — sin esto, el registro de clientes nuevos falla al guardar la firma de autorización.
- **Primera prueba real del lector de huellas** en ClientesView → Nuevo cliente (PC de la oficina con el DigitalPersona 4500 conectado). Según resultado, conectar la huella también en Contrato/Pagaré (WizardContrato pasos 3-4) reutilizando `LectorHuella`.
- **Probar en el navegador real** las 5 fotos guiadas del paso 6 y la confirmación de moto del paso 2 (no se pudo verificar por falta de credenciales de login).
- **Probar recibo impreso con la impresora GA-E2001 real** — hacer un cobro de prueba en Cartera y confirmar alineación/ancho del ticket.
- **Probar convenio obligatorio en flujo real**: crear un contrato con base insuficiente y verificar que aparece el modal forzado, que el convenio guarda correctamente, y que avanza al paso 2.
- Completar datos de motos técnicos y los 2 contratos Pradera pendientes cuando el usuario los tenga (RMZ69H, RMZ64H — por el Modal Editar contrato, sin SQL).
- Migrar datos reales de COSTA y RASTREADOR (mismo proceso que Pradera).
- Revisar `useLiquidaciones.ts` — mismo bucket `liquidaciones` inexistente que se corrigió en tiempo rodado (#17), no se tocó por estar fuera del alcance de esa tarea.
- Estado de cuenta de apertura firmable (fase 4 — pendiente de evaluar).
- Retomar auditoría móvil 375px en las pantallas restantes.
- **Gestión de permisos por usuario (UsuariosView)** — lista de usuarios, toggle de permisos activos/inactivos por módulo, organizado por categoría, jerarquía por rol, base: `profiles.permisos` (jsonb).
- **Barra inferior por rol** — cada rol vería abajo sus 5 módulos más usados (ej. SUBADMIN: Panel·Cartera·Motos·Taller·Más).
- Integración GPS real (sirena/apagado) · WhatsApp automático · Reportes PDF/Excel · APK Capacitor.
