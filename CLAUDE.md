# MotoGestión — GPS Satelital Cartagena
**SaaS de gestión integral de flota de motos en arriendo**
Supabase: `jvfkprkjysjffhzjitgl` | Repo: `GPSsatelital/gps-satelital` | Producción: Vercel desde `main`

---

## REGLA DE AUTORIZACIÓN — OBLIGATORIO SIEMPRE

**Nunca implementar nada sin antes describir el plan y esperar confirmación explícita del usuario.**

---

## REGLA DE CONTEXT7 — OBLIGATORIO SIEMPRE

Cuando la tarea o pregunta involucre cualquiera de estas librerías: **Supabase** (BD, auth, storage, RLS, realtime, políticas), **React** (hooks, contextos, renders), **TypeScript** (tipos, interfaces, generics) o **Vite** (build, env, PWA) — sugerir explícitamente al usuario:

> "💡 Esta pregunta involucra [librería]. Te sugiero agregar **'use context7'** a tu mensaje para que traiga la documentación actualizada y evitar que te dé una API desactualizada."

Indicar siempre: qué librería detecté, por qué conviene usarlo en ese caso puntual, y qué información específica traería.

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

#### Checklist obligatoria al corregir un bug de CÁLCULO (cuotas, mora, deuda, prorrateo, tarifas)
Antes de dar el fix por terminado:
1. `grep` del campo de BD o variable involucrada (ej. `valor_semanal`, `cuotaPactada`) en **todo `src/`**, no solo en el archivo donde se detectó el bug.
2. Listar explícitamente en el chat **cada lugar** donde aparece ese cálculo (archivo + línea).
3. Confirmar uno por uno cuáles aplican el mismo fix y cuáles no (con su razón).
4. Solo entonces aplicar el fix en todos los sitios confirmados y correr `tsc --noEmit`.
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
**Cliente:** hoja de vida, cédula, 2 recibos públicos, antecedentes, licencia (opcional)
**Acompañante (mujer — obligatorio):** cédula, 2 recibos públicos, antecedentes

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

### Protocolo de mora (orden estricto)
1. **Día de pago** → mensaje WhatsApp durante la mañana
2. **Día de gabela** → mensaje + llamada + sirena máx 5-10 seg (vehículo **detenido**)
3. **Apagado remoto** → solo detenido · máx 1 hora · luego proceder a inmovilización física
4. **Mora** → aparece en lista de inmovilizaciones
5. **Plazo extra** → máx 2 días adicionales, requiere motivo escrito
6. **Sin cumplimiento** → orden de recolección física

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
- **Sobre qué contratos:** cualquier contrato activo (no limitante), pero la lista **destaca mora/gabela arriba**.
- **Flujo 2 pasos (doble control):** funcionario registra → marca "entregué a caja" (`entregado_caja`) → SECRETARIA confirma en Caja (`estado=Confirmado`).
- **En el momento del cobro:** referencia "Debe pagar" (cuota período + deuda + convenio) · captura **GPS** (`pagos.ubicacion` jsonb, mig 023) · **foto opcional** (reúsa `pagos.comprobante_url`) · **recibo provisional** por WhatsApp.
- **Dos entradas (misma puerta):** botón "+" global (busca cliente) y botón "💵 Cobrar" en cada tarjeta del panel Hoy.
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

**Estado del código:** `claude/clever-turing-daklkq` y `main` sincronizados. `npm run build` pasa. Árbol limpio.

**Usuarios en producción:**
| Email | Nombre | Rol |
|---|---|---|
| brandon@hotmail.com | FREDY | ADMIN_PRINCIPAL |
| emiro@hotmail.com | SERGIO AGUAS | ADMIN |
| andres@hotmail.com | EMIRO | SUBADMIN |
| angela@hotmail.com | ANGELA | SECRETARIA |

**Estado de WizardContrato.tsx:** Paso 1 completamente corregido. Pasos 2-6 sin cambios.

### Lo hecho en sesiones anteriores ✅
1. **SUBADMIN scope completo** — `motos.subadmin_id` (mig 021) + `visitas.asignada_a` (mig 022). Hook `useSubadminScope`/`useScope` + `SubadminScopeProvider` (envuelve TODO el layout, header incluido). Filtrado global en: Motos, Contratos, Cobros, Taller, Liquidaciones, Clientes, Dashboard, CampanaAlertas, BusquedaGlobal.
2. **Navegación reorganizada** — hoja Más (móvil) y sidebar (desktop) con MISMA taxonomía: Operaciones · Cobros & Dinero · Flota & Taller · Seguimiento · Administración.
3. **Cobro en campo completo** (mig 023 `pagos.ubicacion`) — GPS + foto opcional + recibo provisional WhatsApp + flujo 2 pasos (entregar → confirmar) + conciliación en Caja Diaria.
4. **Cartera reorganizada: 11 pestañas → 4 secciones** (Hoy · Contratos · Dinero · Historial). Listas dentro de recuadros con scroll propio. KPIs navegan a Contratos con filtro.

### Lo hecho en esta sesión ✅
5. **Panel Hoy rediseñado** — mismo diseño que la sección Contratos:
   - Chips de filtro: `Todos · 🚚 Recolec. · 🔴 Mora · 🟡 Gabela · 🔵 Pagan hoy` (con flexWrap, sin scroll lateral)
   - Buscador por nombre/placa
   - Lista dentro de recuadro con scroll (`maxHeight 56/62vh`)
   - Tarjetas siempre abiertas: nombre + placa + badge de estado + botones de tarea visibles directo
   - Pendientes primero (tarjetas con tareas sin hacer arriba; resueltas en gris/opaco abajo)
   - Monto "Debe pagar" visible en cada tarjeta
6. **Emojis en chips de Contratos** — `🔴 Mora · 🟡 Gabela · 🟢 Al día · 🔵 Pagan hoy` igual que en Hoy

### Migraciones ya aplicadas en Supabase por el usuario
- `021_motos_subadmin.sql` ✅ · `022_visitas_asignacion.sql` ✅ · `023_pagos_ubicacion.sql` ✅

### Próximos pasos sugeridos 🔲
- **Gestión de permisos por usuario (UsuariosView)** — lista de usuarios, toggle de permisos activos/inactivos por módulo, organizado por categoría, jerarquía por rol, base: `profiles.permisos` (jsonb).
- **Barra inferior por rol** — cada rol vería abajo sus 5 módulos más usados (ej. SUBADMIN: Panel·Cartera·Motos·Taller·Más).
- Integración GPS real (sirena/apagado) · WhatsApp automático · Reportes PDF/Excel · APK Capacitor.
