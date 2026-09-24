---
name: huecos-garantia-y-deuda-al-convenio
description: "Dos huecos encontrados el 3-sep-2026 leyendo código — (1) garantía/fiscalía/tránsito no dejan recepción, así que el detector de tiempo guardado sin resolver no las ve; (2) ampliarConvenio sube el convenio pero NO marca la deuda, cobrándola dos veces"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-03T22:55:06.866Z
---

# Dos huecos de plata encontrados el 3-sep-2026 (reportados por el dueño, verificados en código)

## 1. El tiempo de GARANTÍA (y fiscalía/tránsito) no se puede rodar ni aparece como pendiente

**Síntoma del dueño:** *"las motos que salen por garantía no me está dando la opción de rodarles el
tiempo... y no me sale en donde se coloca el tiempo pendiente por resolver"*. Él mismo aclaró que
quizá no le hicieron el registro, pero pidió verificar si el registro existía y el sistema no lo
tuvo en cuenta. **Lo segundo es lo cierto: aunque se registre bien, el sistema no lo cuenta.**

**Causa raíz (verificada):**
- `useMotos.registrarRetencion()` solo hace `update` sobre `motos` (`estado`, `retencion_fecha`,
  `retencion_numero_caso`, `retencion_detalle`). **NO inserta en `recepciones_vehiculo`.**
- `utils/tiempoGuardado.ts` (`tiempoGuardadoPendiente` / `tiempoGuardadoSinResolver`) es la red que
  atrapa el tiempo sin resolver, y es **DERIVADA de `recepciones_vehiculo`**: busca un destino
  distinto de `con_cliente` seguido de una entrega. Sin recepción, para esa red la moto nunca
  estuvo guardada → no sale en Cartera (`CobrosView:2513`).
- La única ventana de cobrar/rodar para retenciones es `MotosView.abrirResolverTiempoSiAplica()`,
  que **solo se dispara en el instante de "Salida de retención"** y exige `esAdminOSuperior` +
  `retencion_fecha` + un contrato **Activo apuntando a esa moto** + `dias > 0`. Si en ese momento
  no se cumple algo (contrato suspendido, o un préstamo de reemplazo que hizo swap del `moto_id`),
  el caso se evapora sin dejar huella.

**CASO REAL IEW64I (ARMANDO JIMENEZ PEÑA), consultado el 3-sep:** `retencion_fecha` NULL,
`recepciones` 0, `acuerdos_de_tiempo` 0, moto Asignada, contrato Activo hasta 2028-06-13.
**Nunca se registró la entrada a garantía** — el dueño tenía razón. No hay nada que reconstruir:
hay que resolverlo a mano (cobrar días como deuda, o rodar `fecha_fin_contrato` desde el Modal
Editar Contrato, que audita). Falta que el dueño diga cuántos días estuvo parada.

### ✅ ARREGLADO 3-sep — commit `6c9401b` (solo TS, SIN migración)
🔴 **CORRECCIÓN a lo que dije dos veces:** primero afirmé "nunca se registró"; el dueño insistió
("¿estás seguro?") y tenía razón. Mi consulta miraba 3 cajones (retención, recepciones, acuerdos)
y faltaban 4. **El registro SÍ existía: fue un PRÉSTAMO DE REEMPLAZO**, no una garantía —
27-ago→3-sep, se guardó la IEW64I y se prestó la RMY55H. **Lección: antes de decir "no hay
registro", barrer TODAS las tablas** (`historial_ubicaciones`, `recepciones_vehiculo`, `taller`,
`prestamos_reemplazo`, `contratos_auditoria`, `acuerdos_tiempo_rodado`) con un UNION ordenado por
fecha. La consulta quedó en el historial de esa sesión.

**El arreglo no inventa recepciones falsas:** le enseña a la red a leer los rastros que YA existen.
`tramosDePrestamos()` (fecha_inicio/fecha_fin) y `tramoDeRetencion()` (`motos.retencion_fecha`),
parámetro `extras` opcional en las dos funciones. Con varias fuentes manda el tramo **más
reciente**; con empate gana el que sigue abierto. Conectado en `CobrosView` (pre-paso del convenio)
y `ContratosView` (lista). 22 pruebas en ese archivo (12 nuevas con las fechas reales de ARMANDO);
457 en total.

🔲 **SIGUE SIN CUBRIRSE: la retención ya LIBERADA.** `liberarRetencion` pone `retencion_fecha = null`
y no queda cuándo entró. Las abiertas se ven; las cerradas en el pasado, no. Se cierra el día que
registrar/liberar una retención deje también sus recepciones.

⚠️ **Anomalía sin resolver en IEW64I:** `estado = 'Asignada'` pero `ubicacion_fisica = 'bodega'`.
O no se la han entregado, o al devolver el reemplazo no se actualizó la ubicación.

## 2. "Agregar deuda al convenio" cobra dos veces

**Pedido del dueño:** que las deudas registradas por fuera se puedan meter al convenio, queden
incluidas, sin perder el rastro ni la información con la que nacieron, y marcadas para siempre.

### ✅ CONSTRUIDO 3-sep — mig 124 (commit `2030f40`, SQL ✅ CORRIDA Y VERIFICADA)
**Verificación en producción: 78 deudas `en_convenio`, 78 enlazadas, 0 sin enlazar.** El informe
nuevo (qué financia cada convenio, con nombre y placa) devolvió 40 convenios activos: **14 en
exactamente $308.000 con 0 deudas adentro = los de BASE INICIAL incompleta** (correcto, no financian
deuda registrada sino el ahorro que faltó al entrar), y 16 con deudas reales. ⚠️ La consulta suma
`d.monto` (original), no `monto_pendiente`: por eso algunos muestran una deuda mayor que el convenio
(entró solo el saldo). Para comparar, usar `sum(d.monto_pendiente)`.
🔴 **CORRECCIÓN a lo que dije primero: el cobro doble al ampliar YA estaba arreglado** por la
mig 098 (13-ago). Lo afirmé mal antes de leer las migraciones. Lo que faltaba era el RASTRO.
- `deudas.convenio_id` + índice + backfill; `convenio_marca_contemplado` (099) y
  `convenio_ampliado_marca_deudas` (098) recreadas idénticas salvo que ahora escriben el enlace.
  **No mueve un peso.** Trae consulta que lista qué financia cada convenio con nombre y placa.
- `ModalAmpliarConvenio`: casillas en vez de monto a mano. La selección es un **prefijo** (más
  vieja primero) porque el disparador marca en ese orden: antes se escribía $50.000 pensando en
  una multa reciente y el motor marcaba otra deuda. El monto libre queda para deuda no registrada
  y avisa cuáles arrastraría. `utils/deudasAlConvenio.ts` + 18 pruebas (445 totales).
- 🔴 **NO se construyó devolver la deuda a 'pendiente' al incumplir** (aunque el dueño lo aprobó):
  los abonos viven en `pagos.aplicado_convenio` y **no bajan `deudas.monto_pendiente`**, así que
  devolver la deuda entera mientras el convenio conserva su saldo **cobraría dos veces**. Falta
  decidir qué pasa con el saldo del convenio incumplido. Ojo además: 'cumplido' NO debe devolver
  nada (la deuda se pagó) y flipa a 'activo' y de vuelta con cada pago — un trigger por "salir de
  activo" recobrarraría deudas ya pagadas.

**Lo que pasaba antes de la 124 (verificado):** `ModalAmpliarConvenio` lista las deudas sueltas y deja escribir
un monto; `useConvenios.ampliarConvenio()` sube `deuda_total`/`numero_cuotas`/`fecha_limite` y deja
rastro en `contratos_auditoria` — pero **no toca la tabla `deudas`**. La deuda sigue `pendiente`:
la misma plata queda contada dentro del convenio Y como deuda suelta. Es el defecto de
[[unificar-deuda-convenio-descartado]] (17 clientes, $8.047.100) entrando por otra puerta.
Al **crear** un convenio sí se marcan `en_convenio` — el hueco es solo al **agregar después**.

**Diseño acordado con el dueño (3-sep):**
- Elegir las deudas con casillas, no escribir un monto suelto: lo que sube el convenio y lo que se
  marca incluido salen del mismo cálculo y no pueden discrepar.
- Marcarlas `en_convenio` al agregarlas, y **guardar a CUÁL convenio entraron** (hoy `deudas` no
  tiene esa columna: solo el estado). Necesario para reportes y para el punto siguiente.
- Conservar intactos concepto, descripción, monto original y fecha.
- 🔴 **Decisión del dueño:** si el convenio se incumple o se cancela, **la deuda vuelve a ser suelta
  y exigible**, con su monto y fecha originales, y el sistema recuerda que estuvo en ese convenio.
  Esto resuelve de paso el pendiente #4 de [[unificar-deuda-convenio-descartado]] (hoy quedan
  `en_convenio` para siempre y un convenio nuevo las volvería a cubrir).

**Regla al construir:** toca plata → pruebas del comportamiento ACTUAL primero, función leída viva,
espejo pantalla↔motor. Ver [[regla-no-romper-lo-que-funciona]] y [[cartera-cuanto-debe-una-sola-funcion]].
