---
name: taller-trabajo-y-cobro
description: "Taller (7-sep-2026): la orden anota QUÉ SE LE HIZO, cobra el arreglo al cliente (deuda ligada a la orden) y ya no suelta al pool la moto de un cliente en préstamo de reemplazo. Mig 125. Caso DQF56I / JOSE SANMARTIN. Pendientes: fechas con corrimiento UTC en TallerView, ubicación física no sigue al préstamo."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-07T15:54:21.669Z
---

# Taller: trabajo realizado + cobro al cliente + préstamo (7-sep-2026)

## El caso que lo destapó
**DQF56I** (COSTA) en taller desde el 4-sep ("Ruido en el motor", En diagnóstico, $0). Su cliente
**JOSE DEL CARMEN SANMARTIN** (semanal lunes, 19/104 cajas, 2 semanas atrasadas = $404.000) anda en
la **YAT46H** por préstamo de reemplazo activo desde el 4-sep, sin alquiler cobrado. El dueño pidió:
*"que pueda pasar todo el proceso de taller para entregarla nuevamente y que se le puedan colocar las
cosas que se le hicieron"* + *"no me da para colocar las deudas"*.

## Lo que estaba mal (verificado en código y en la base desde el navegador)
1. **Finalizar soltaba la moto al pool.** `estadoMotoTrasLiberar` busca contrato Activo con ese
   `moto_id`; durante el préstamo el contrato apunta a la PRESTADA → no encuentra → `Disponible`.
   La moto de un cliente quedaba libre para asignársela a otro. Botón decía "pasar a disponible".
2. **No había campo de trabajo realizado** (solo `detalle` = problema, `repuestos` texto, `costo`).
3. **El taller no sabía de deudas**: cobrar un daño era ir a Cartera a mano, sin rastro en la orden.
4. "Nueva orden" ofrecía motos que ya tenían orden abierta (órdenes duplicadas posibles).

## Lo construido (sin tocar motor de dinero ni el flujo de devolución)
- **Mig 125** `taller.trabajo_realizado text` + `taller.deuda_id uuid → deudas ON DELETE SET NULL`.
- `utils/taller.ts` (+11 pruebas): `contratoDeLaMoto()` (Activo/Suspendido directo, o por préstamo
  activo cuya moto original es esta) · `prestamoActivoDeOriginal()` · `anotarTrabajo()` (append con
  `[dd/mm/aaaa]`, nunca borra).
- `useTaller`: `finalizarProceso` devuelve `destino`; si hay préstamo activo con esta como original →
  `espera_devolucion` y la moto **se queda en Mantenimiento** (la devolución en Inmovilizaciones es la
  que la pone Asignada). `anotarTrabajoOrden`, `vincularDeuda`.
- `useDeudas.registrarDeuda` devuelve `{ error, id }` (`maybeSingle`: si RLS no deja leer la fila, el
  insert ya quedó y no se reporta error → evita duplicar por reintento).
- `ModalDeuda`: props opcionales `tipoInicial/valorInicial/descripcionInicial/onRegistrada` (sin
  ellas, igual que siempre).
- `TallerView`: fila Cliente (por `contratoDeLaMoto`) · aviso "su cliente anda en una prestada" ·
  bloques "Con qué entró" / "Qué se le hizo" · botón **"Registrar trabajo / repuestos"** (antes
  "+ Repuesto / costo") con textarea "¿Qué se le hizo?" · botón **"Cobrarle a JOSE"** (roles
  ADMIN/AP/SECRETARIA/SUBADMIN — decisión del dueño 7-sep; el mecánico no) que abre ModalDeuda
  precargada (daño_vehiculo, costo de la orden, "Taller DQF56I (fecha): problema — trabajo") y liga
  `taller.deuda_id`; chip "Cobrado al cliente $X" y el botón desaparece · **etiqueta del botón de
  finalizar dice la verdad** ("lista para devolvérsela a JOSE SANMARTIN" / "vuelve con X" / "queda
  disponible") · aviso al finalizar sin trabajo anotado · modal "Orden cerrada" con **"Ir a
  devolverla"** (`onNavigate("inmovilizaciones")`, prop nueva pasada desde App.tsx) · "Nueva orden"
  excluye motos con orden abierta · historial con columna "Qué se le hizo" · orden impresa con
  cliente, trabajo y cobrado · `FichaMotoView` pestaña Taller muestra el trabajo y "cobrado al cliente".
- Verificado en el navegador (preview logueado como Fredy, JS por texto porque la ventana estaba
  oculta): detalle de DQF56I muestra cliente JOSE, aviso de préstamo, los 4 botones y la etiqueta
  correcta; modal de trabajo con el campo nuevo; modal de deuda precargada; DQF56I ausente de
  "Nueva orden". tsc limpio · 487 pruebas · build OK.

## El camino de DQF56I ahora (lo hace el dueño)
1. Taller → orden DQF56I → "Registrar trabajo / repuestos" (qué se le hizo + repuestos + mano de obra).
2. Si el daño es culpa de JOSE → "Cobrarle a JOSE" (queda deuda ligada a la orden).
3. "Finalizar: lista para devolvérsela a JOSE SANMARTIN" → la moto NO se suelta.
4. "Ir a devolverla" → Inmovilizaciones → Préstamos activos → Devolver: contrato vuelve a DQF56I,
   YAT46H al pool, alquiler pendiente → deuda, y cobrar/rodar los días de taller.

## Segundo commit (7-sep, mismo día): dos defectos que solo se vieron al usarlo
- 🔴 **"Al darle en registrar trabajo no aparece nada"** (dueño). Las ventanas SÍ se abrían pero
  **detrás** del detalle flotante: el detalle usa `zIndex: 1000` (desde el 25-ago) y el `Modal`
  local del taller tenía 80 y `ModalDeuda` 300. Yo lo había "verificado" leyendo el texto del DOM,
  no mirando qué elemento quedaba encima — la lección de RENDER AND LOOK otra vez. Fix: `Modal`
  del taller a 1100 y prop opcional `zIndex` en `ModalDeuda` (default 300, el taller pasa 1100).
  Verificado con `document.elementFromPoint` a 375×812: título y campo de texto VISIBLES en las dos.
  Nota: esto también afectaba a "Cambiar estado" y al viejo "+ Repuesto / costo" desde el 25-ago.
- ✅ **Fechas un día atrás**: `fmtFechaCorta(iso)` nuevo en `utils/fecha.ts` (parse local) y
  `diasEnTaller(ingreso, salida, hoyISO)` puro en `utils/taller.ts` (+7 pruebas, 494 total).
  Verificado en pantalla: DQF56I "4/9/2026 · 3 días". `costoMes` compara "YYYY-MM" como texto.
- **Regla para verificar ventanas flotantes**: no basta con que el texto exista en el DOM; medir
  con `elementFromPoint` sobre el título y el primer campo, a 375 px, que lo que queda arriba sea
  la ventana misma.

## Pendientes / hallazgos NO tocados a propósito
- `MotosView` liberar retención con préstamo activo tiene el mismo hueco del punto 1 (va por
  `estadoMotoTrasLiberar` → Disponible). No se tocó.
- La ubicación física no sigue al préstamo (DQF56I "bodega" en taller; YAT46H "taller" estando
  Asignada). Igual que IEW64I.
- Repuestos siguen como texto plano y el costo como total (sin desglose mano de obra / repuestos).
- Motos de COSTA con marca/modelo "POR DEFINIR".

**Why:** el dueño necesitaba entregar DQF56I con rastro de lo hecho y de lo cobrado; el hueco del
préstamo podía regalarle la moto de un cliente a otro.
**How to apply:** toda salida de taller de una moto con préstamo activo va por la devolución, nunca
por "finalizar" solo; para cobrar un arreglo, el botón de la orden (deja `deuda_id`), no Cartera a mano.


## Evidencias y peticiones en la orden (12-sep-2026, mig 150, commit `60fc513`)

Pregunta del dueño: *"para ingresar una moto para taller por dónde se hace? ... las evidencias y
peticiones dónde se colocan?"*. Respuesta honesta: no había dónde, y **"Registrar novedad" no tenía
la opción de taller** — el funcionario le cambiaba el estado a mano en Motos y la moto quedaba
"En taller" **sin orden**: invisible para el mecánico, sin diagnóstico, sin costo y sin rastro.

**Lo construido** (él pidió "todo", y para las fotos eligió "las dos cosas"):
- **Mig 150** — `taller.fotos_entrada` · `fotos_salida` (las 6 guiadas, `{angulo: url}`) ·
  `fotos_libres` (`[{url, nota, fecha, por}]`) · `peticiones`
  (`[{id, texto, pedida_por, fecha, estado, resuelta_por, resuelta_fecha, nota}]`).
  Storage: bucket `documentos`, ruta `taller/{orden}/...`.
- **`components/ModalIngresoTaller.tsx`** — el formulario salió de TallerView y ahora lo usan los
  DOS lados. Se llevó también el shell `ModalTaller` y el `RepuestosEditor` (una sola fuente).
  `registrarIngreso` devuelve el `id` (las fotos se suben después, con `maybeSingle`).
- **Motos → Registrar novedad → "🔧 Ingresar a taller"**, de primera. Apagada con su motivo si la
  moto ya tiene orden abierta o está retenida por un tercero.
- Las 6 guiadas son **obligatorias** al entrar y al cerrar (`ModalCerrarOrden` las pide antes de
  finalizar: es la última vez que la moto está ahí). Las libres son opcionales, con nota.
- **Peticiones**: el mecánico pide, la oficina responde (Autorizar / No autorizar, mismos roles que
  cobran el arreglo). Queda quién y cuándo por los dos lados; nada se borra. Al cerrar avisa si
  quedan sin responder. La orden impresa las lleva.
- `utils/taller.ts`: `agregarPeticion` · `resolverPeticion` · `peticionesPendientes` (+6 pruebas).

**Detalle que se repite:** el `#root { text-align: center }` de la plantilla de Vite centra todo;
cada pantalla lo corrige local. Se puso `textAlign:"left"` en lo nuevo. El `DetallePanel` del
taller **ya venía centrado de antes** (se dejó igual a propósito, para no cambiarle el aspecto).

🔲 **Falta correr la mig 150.** Sin ella la orden se crea igual, pero las fotos no se guardan y
sale el aviso "la orden quedó creada, pero las fotos no se guardaron". Verificado en navegador a
283px: opción nueva, formulario completo, secciones del detalle con sus mensajes de vacío.
