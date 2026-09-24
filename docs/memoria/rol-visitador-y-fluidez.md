---
name: rol-visitador-y-fluidez
description: "Sesión 28-jul tarde — rol VISITADOR construido (migs 076/077 ⚠️ 077 SIN CORRER), y diagnóstico medido de por qué la app no refresca sola"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-31T22:42:21.418Z
---

# 28-jul-2026 (tarde) — commits `7c8bb4a` → `b4845f4`

## ✅ 30-jul: LA INFRAESTRUCTURA DEL VISITADOR QUEDÓ CERRADA

Migs **076 y 077 corridas y verificadas** (076 → 2/1/1 · 077 → 1/2/1) y **`manage-users`
redesplegado**: ya se pueden crear usuarios con rol VISITADOR y registrar visitas.

**Cómo se cayó en producción:** un funcionario en la calle, con la visita a medio llenar (fotos
+ GPS ya tomados), recibió *"Could not find the 'realizada_por' column of 'visitas' in the schema
cache"*. Se desbloqueó con el `alter table ... add column` suelto **+ `notify pgrst, 'reload
schema'`** — ese notify es imprescindible: el error es de la caché de PostgREST, no de Postgres,
y sin él sigue fallando un rato aunque la columna ya exista.

**Trampa que costó un rato:** el código de la Edge Function es TypeScript y va en
`/functions`, NO en el SQL Editor (`/sql`). Pegarlo en el SQL Editor da
`42601: syntax error at or near "//"` y no ejecuta nada. Link directo que sirve:
`https://supabase.com/dashboard/project/jvfkprkjysjffhzjitgl/functions`.
No hay CLI de Supabase instalada en el PC #2, y montarla pedía token+login: se hizo por el panel.

**⚠️ Probado por el dueño "al parecer bien", NO verificado a fondo.** Quedó sin comprobar con una
sesión real de VISITADOR lo que es el corazón del diseño: que Storage le devuelva vacío, que
`select * from clientes` le devuelva vacío, y que solo vea las 7 columnas de sus visitas
asignadas. El dueño decidió cerrar y arreglar lo que salga.

**Falta construir (herramientas para el ADMIN, no para el visitador):** el **informe de pago por
visitador** (por persona y rango: hechas · pagables · pendientes de validar · sin resolver) —
recomendado primero, porque se le paga por visita y hoy habría que contarlas a mano — y la
**pantalla de validaciones pendientes** (lista por antigüedad; la campana ya avisa, así que es
incómodo, no ciego).

## ⚠️ LO PRIMERO AL RETOMAR

1. **✅ 30-jul: la COLUMNA ya se creó** — reventó en la calle exactamente como estaba previsto
   ("Could not find the 'realizada_por' column of 'visitas' in the schema cache", un funcionario
   con la visita a medio registrar). Se corrió suelto el `alter table ... add column realizada_por`
   + `notify pgrst, 'reload schema'` (ese notify hace falta: el error es de la caché de PostgREST,
   sin él sigue fallando un rato aunque la columna ya exista). **Registrar visitas ya funciona.**

   ⚠️ **PERO el RESTO de la mig 077 sigue SIN correr**: la política de storage para `guardados/`,
   `mis_reverificaciones()`, `registrar_guardado_visitador()` y el drop de la política UPDATE
   duplicada de `visitas` (esa última es un hueco real: un ADMIN con `aprobar_visita` BLOQUEADO
   igual puede editar visitas por consola). Nada de eso bloquea la operación normal — solo el
   flujo del VISITADOR.
   Comprobar después de correrla entera: debe dar **1, 2, 1**
   ```sql
   select
     (select count(*) from information_schema.columns
        where table_name='visitas' and column_name='realizada_por') as columna_creada,
     (select count(*) from pg_proc
        where proname in ('mis_reverificaciones','registrar_guardado_visitador')) as funciones_nuevas,
     (select count(*) from pg_policies where tablename='visitas' and cmd='UPDATE') as politicas_update;
   ```
2. **Redesplegar la Edge Function `manage-users`.** Sin eso no se puede crear el primer VISITADOR
   ("Rol inválido"). Se despliega aparte del build de Vite.
3. La **mig 076 ✅ ya corrió** y verificó 2/1/1.

## El rol VISITADOR (construido, falta probarlo con un usuario real)

**Lo que definió el dueño:** ve **solo las visitas que le asignen** y de cada una **solo nombre,
dirección y teléfono del titular + nombre y teléfono del acompañante** (a quién llamar si el
titular no contesta). Se le paga **por visita completada, condicionada a que después se confirme
que la moto sí duerme ahí** — y **se paga por dejar el dato CIERTO, no por acertar de una**: si
sale ❌ y él va, encuentra el lugar real y lo documenta, esa visita queda pagada.

**Por qué NO se pudo configurar y hubo que construir:** un SUBADMIN con acceso solo a Clientes ve
la ficha COMPLETA (cédula, 6 documentos con enlace abrible, huella, firma, foto del rostro, lista
negra, ingreso inicial). **No hay control por campo en ninguna capa** — `createTableStore` hace
`select("*")`, la fila entera llega al navegador aunque la pantalla no la pinte.

**La idea central: el VISITADOR no tiene lectura sobre `clientes`.** En vez de recortarle la ficha,
no se le da. `mis_visitas_asignadas()` (security definer) le devuelve solo esas 7 columnas. El
recorte vive en la BD, no en la pantalla.

**Dos huecos de seguridad cerrados de paso (estaban contenidos solo porque las sesiones eran de
gente de confianza — y eso cambia al contratar por horas):**
- **Storage abierto**: la 071 dejó `select` sobre los 5 buckets a TODO `authenticated`, sin mirar
  rol ni dueño. Las carpetas se nombran con la cédula → listar la raíz daba el directorio de los
  270 clientes. Ahora el VISITADOR queda excluido, solo sube bajo `visitas/` y `guardados/`, y no
  puede sobrescribir archivos ajenos.
- **INSERT de visitas sin scope**: se podía insertar una visita para CUALQUIER `cliente_id`, y
  `mis_clientes_subadmin()` incluye `visitas.asignada_a` → eso **regalaba acceso permanente** a la
  ficha de ese cliente. Escalada real.

**Flujo de re-verificación (mig 077):** cuando el admin marca ❌ *no coincide*, le rebota al
visitador en su pantalla, arriba de todo. `registrar_guardado_visitador()` valida que él haya hecho
esa visita y **solo** escribe `guardado_lugar` — no se le abre la tabla `contratos`.
`ModalRegistrarGuardado` ganó **nombre y teléfono del encargado del lugar**, para poder ir a
preguntar sin el cliente.

**Archivos clave:** `src/pages/MisVisitasView.tsx` (nueva) · `supabase/076` y `077` ·
`src/lib/modulos.ts` (módulo `mis_visitas`) · `App.tsx` (⚠️ el corte explícito para VISITADOR va
ANTES del `return true` de `accesoPorRol`, que abre 6 módulos a cualquier rol sin lista de permisos).

**Falta del plan:** la **pantalla de validaciones pendientes** para el admin y el **informe de pago**
(por persona y rango: hechas · pagables · pendientes de validar · sin resolver).

## ✅ 31-jul: EL PASO 1 DEL REFRESCO QUEDÓ HECHO (commit `70f4518`, en producción)

Todo en `createTableStore.ts`, sin migración. Los tres arreglos:
1. **Cambio incremental**: se aplica lo que ya viene en el aviso del realtime (insert/update/
   delete) en vez de re-descargar la tabla. Antes confirmar 5 pagos bajaba **5 × 359 KB**.
2. **Re-sincroniza al volver a la app** (`visibilitychange` + `focus`) — pero **solo si la caché
   lleva +60s sin refrescarse**. 🔑 Sin ese tope, cada vez que el usuario cambia de app y vuelve
   se bajarían las 10 tablas (1,7 MB): carísimo con datos móviles, que es como trabajan los
   cobradores. **Si alguien quita ese tope, rompe justo lo que se vino a arreglar.**
3. **Re-sincroniza al reconectar el canal**: se detecta `CHANNEL_ERROR/TIMED_OUT/CLOSED` y al
   volver a `SUBSCRIBED` se pide la tabla, porque supabase-js reconecta pero **no reproduce** lo
   que se perdió. Más refetches de respaldo agrupados a 300 ms.

**Red de seguridad (la parte importante):** ante cualquier duda —aviso raro, fila sin `id`, o un
UPDATE de una fila que no teníamos porque recién se hace visible por RLS— **no se inventa nada**:
se pide la tabla completa. Lento antes que mostrar plata que no es.

La lógica que puede pintar un dato falso se extrajo a una función pura exportada
(`aplicarCambioALista`) con **9 pruebas** — 50 en total. Así se prueba sin tocar producción.

Verificado en la app con sesión real: mismos números que antes (242 = 115 + 1 + 126), sin errores.

## ✅ 31-jul: PASO 2 — ventana de 120 días en `gestiones_cobro` (commit `4df14b0`)

`gestiones_cobro` es la que MÁS crece (~36.000 filas/año con 1.000 motos, contra ~20.000 de
`pagos`). 5 de las 7 pantallas que la usan solo miran lo de hoy → ventana de 120 días. Las 2 que
sí necesitan la historia (**ficha del cliente y ficha de la moto**) llaman `cargarHistorialCompleto()`
al montarse; sin eso dirían que el cliente no tiene historia anterior — regresión visible.

🔑 **`pagos` se dejó COMPLETA a propósito.** De ahí salen el ahorro acumulado, el estado de cuenta,
el historial, los reportes y la caja de cualquier día pasado: **casi todo necesita el historial
entero**, así que una ventana solo produciría sumas cortas que nadie notaría. Windowearla necesita
otra solución (agregados en el servidor o carga por contrato), no este mecanismo. **No la recortes
sin resolver eso antes.**

**Defecto encontrado AL PROBAR EN EL NAVEGADOR (no se habría visto de otra forma):** al volver a
la app se pedía **cada tabla DOS veces** — `focus` y `visibilitychange` disparan los dos, ninguno
sabía del otro, y `ultimoFetch` recién se actualiza cuando llega la respuesta, así que el segundo
pasaba el chequeo de caché vieja. 20 consultas en vez de 10, justo lo que se vino a evitar.
Corregido con candado de consulta-en-curso + número de secuencia que descarta respuestas viejas.

**Verificado en vivo:** 12 consultas al abrir (UNA por tabla) · `gestiones_cobro?…&created_at=gte.2026-04-02`
· eventos de foco con caché fresca → 0 consultas · sin errores.

## 🔨 El diagnóstico que originó todo esto (medido el 28-jul)

**La queja:** "no se actualiza sola o demora cuando queda mucho tiempo abierta; no hay fluidez
entre lo que se hace y lo que se refleja".

**Son DOS problemas distintos:**

1. **Se queda pegada.** El canal de realtime se muere (celular bloqueado, PC suspendido,
   wifi→datos, reinicio de Supabase). supabase-js reconecta **pero no reproduce lo que se perdió**,
   así que la caché queda vieja para siempre hasta recargar. Y **nada refresca al volver a la app**
   — verificado: cero `visibilitychange`/`focus` en todo `src/` (solo lo tiene `AvisoActualizacion`).
2. **Falta fluidez en lo propio.** Guardar → aviso del servidor → **re-descarga de la tabla
   COMPLETA** → recién se ve. Tres viajes. De **41 funciones que escriben, solo 1** refresca sin
   esperar (`eliminarConvenio`).

**Todo se arregla en UN archivo, `src/hooks/createTableStore.ts`** (por donde pasan las 10 tablas):
refrescar al enfocar/volver · refrescar al reconectar el canal · aplicar el cambio al instante en
vez de re-descargar · agrupar refrescos (5 cambios = 1 refresco).

### Los números REALES (medidos el 28-jul con la app en producción)

| Tabla | Filas | Peso | Crece con |
|---|---:|---:|---|
| clientes | 272 | 413 KB | la flota (techo ~1.000) |
| pagos | 466 | 359 KB | 📈 **sin techo** |
| contratos | 263 | 340 KB | la flota |
| gestiones_cobro | 817 | 320 KB | 📈 **sin techo** |
| motos | 272 | 245 KB | la flota |
| resto | 147 | 75 KB | — |
| **TOTAL** | **2.229** | **1,71 MB** | |

**Conclusión con datos:** 1,71 MB al abrir está sano — el problema NO es el peso, es el refresco.
Dato que aprieta: **cada pago confirmado re-descarga los 359 KB de `pagos`**; cinco pagos seguidos
= 1,8 MB para ver cinco renglones. Eso ES la falta de fluidez.

**Corrección a lo que dije antes:** NO hay que paginar todo. `clientes`, `contratos` y `motos`
están topadas por el tamaño de la flota (~3,7 MB con 1.000 motos y ahí se quedan). Las únicas sin
techo son **`pagos` y `gestiones_cobro`**: con 1.000 motos serían ~20.000 y ~36.000 filas al año →
**unos 55 MB en dos años**, bajados cada vez que un cobrador abre la app con datos móviles.

**Plan acordado:** Paso 1 = el arreglo de refresco (un archivo, va ya). Paso 2 = ventana de fechas
**solo en esas dos tablas**, antes de crecer a las 1.000 (es más fácil acotar 466 pagos que 20.000).
Toca el motor de mora y los informes, así que va con pruebas.

## Patrón que ya mordió TRES veces esta semana

Columnas que el código escribe, el repo declara, y **la base no tiene**: `convenios.cubre_periodo_hasta`
y `firma_url` (mig 073) · las 3 de retención de motos (074) · `visitas.realizada_por` (077).
**Pendiente ofrecido y sin respuesta:** una revisión que compare de una vez todo lo que el código
escribe contra lo que la base tiene, en vez de descubrirlas cuando algo revienta.

Ver [[regla-inmovilizar-y-convenios]], [[retenciones-rotas-y-filtros-descargas]], [[nav-y-performance]].
