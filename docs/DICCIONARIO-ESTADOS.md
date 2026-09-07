# Diccionario de estados de MotoGestión

**Estado del documento: BORRADOR (4-sep-2026), pendiente de corrección del dueño.**

## Para qué sirve

Este documento es el catálogo de **todo lo que puede estar en algún estado** dentro de
MotoGestión: clientes, contratos, motos, pagos, deudas, convenios, y las cuentas que el sistema
calcula. Tiene dos usos:

1. Es la fuente de la tabla `zala.diccionario`, que ZALA lee **antes** de responder cualquier
   cosa. Regla: **si no está aquí, no existe para ZALA.**
2. Es el documento de estados que nunca se escribió. Sirve para capacitar a una persona nueva
   igual que para el bot.

Cómo leerlo:

- **Valor en el sistema** = exactamente lo que está guardado en la base de datos (respetar
  mayúsculas y tildes; el sistema los compara letra por letra).
- **En palabras del negocio** = cómo lo dice la operación. Lo que está entre corchetes
  `[dueño]` es un borrador que el dueño debe confirmar o corregir.
- `[verificar]` = algo que hay que comprobar en el código o en la base antes de darlo por
  cierto.
- **ZALA** = si ZALA necesita este dato para conversar con un cliente (sí / no / solo interno).

Inventario levantado el 4-sep-2026 a partir de las migraciones `supabase/000` a `124` y de los
tipos de `src/hooks/*.ts` y `src/utils/*.ts`.

---

## Parte 1 — Estados que viven en una tabla

### 1. Cliente — `clientes.estado`

La vida de un cliente, desde que llega hasta que se va. Es el **embudo de ingreso** más el
cierre; la mora del día a día **no** vive aquí (ver Parte 2).

| Valor en el sistema | En palabras del negocio | Quién lo pone | Quién lo quita | ZALA |
|---|---|---|---|---|
| `En proceso` | Se registró, le faltan papeles | El registro del cliente | Cuando completa los documentos | no |
| `Listo para visita` | Papeles completos, falta la visita a la casa | Documentos completos (cliente y acompañante) | Cuando se registra la visita | no |
| `Pendiente evaluación` | Ya se hizo la visita, falta que el admin decida | El registro de la visita (trigger 042, automático) | Aprobar o rechazar | no |
| `Aprobado` | Puede firmar contrato | El admin, tras la visita | Al activar el contrato | no |
| `Rechazado` | No se le entrega moto | El admin, con motivo | No sale de ahí (salvo decisión manual) | no |
| `Activo` | Tiene moto y se le cobra | Paso 6 del wizard (entrega) | La liquidación | sí |
| `Retirado` | Se fue: liquidado por retiro o incumplimiento, o devolvió la base antes de tener moto, o cedió su contrato | `cerrar_liquidacion`, devolución de base, cesión | Un contrato nuevo | sí |
| `Egresado` | Terminó de pagar y se llevó la moto | `cerrar_liquidacion` con motivo `cumplimiento` | — | sí |
| `Lista negra` | Quedó debiendo al liquidar; no se le vuelve a dar moto | Liquidación con saldo negativo | Decisión del admin principal (reversible) | sí |
| `En seguimiento` | **Pendiente de definir** (decisión del dueño 4-sep: se conservan para no perderlos). Hoy **ningún código lo escribe** `[verificado 4-sep]` | nadie | — | no, hasta que se defina |
| `En riesgo` | **Pendiente de definir.** Ídem: existe, nadie lo pone | nadie | — | no, hasta que se defina |
| `En mora` | **Pendiente de definir.** Ídem. **La mora real se calcula, no se guarda aquí** (Parte 2, C1). ZALA no debe leer la mora de este campo | nadie | — | no, hasta que se defina |
| `Inmovilización documentación incompleta` | **Pendiente de definir.** Ídem `[verificar si el cálculo del embudo lo produce]` | — | — | no, hasta que se defina |

Datos que acompañan al estado y que ZALA sí necesita:

| Campo | Qué es | ZALA |
|---|---|---|
| `lista_negra` (sí/no) + `lista_negra_reversible` | Marca aparte del estado; puede estar en lista negra y el estado decir otra cosa | sí |
| `ruta_contrato` = `diario` / `tiempo_definido` | Con qué tipo de contrato entró | interno |
| `ingreso_inicial` | Lo que pagó de base al registrarse | interno |
| `whatsapp`, `telefono`, `mismo_whatsapp` | Por dónde se le escribe | sí |
| `referido_por_*`, `referidos_confirmados` | Sistema de referidos (premios en 2 / 5 / 10 / 17) | no |

### 2. Contrato — `contratos.estado`

| Valor en el sistema | En palabras del negocio | Quién lo pone | Quién lo quita | ZALA |
|---|---|---|---|---|
| `En proceso` | Wizard sin terminar; la moto NO se ha entregado. Se puede **borrar por completo** | Paso 1 del wizard | Paso 6 (pasa a Activo) o eliminar | no |
| `Activo` | La moto está con el cliente y se cobra | Paso 6 del wizard; reactivar | Suspender o liquidar | sí |
| `Suspendido` | La moto **no está con el cliente** pero el contrato sigue vivo. `motivo_suspension` dice por qué: `mora` (se recogió) o `temporal` (él la entregó por incapacidad u otro motivo) | Recolección; entrega voluntaria | Devolverle la moto (vuelve a Activo) o liquidar | sí |
| `Finalizado` | Cerrado por liquidación `[verificar en cerrar_liquidacion qué motivo da Finalizado y cuál Cancelado]` | `cerrar_liquidacion` | — | sí |
| `Cancelado` | Cerrado por liquidación (retiro / incumplimiento) `[verificar]`. Los `En proceso` **no** pasan a Cancelado: se borran | `cerrar_liquidacion` | Reactivar (botón, solo admin) | sí |

Datos del contrato que definen cómo se cobra:

| Campo | Qué es | ZALA |
|---|---|---|
| `forma_pago` = `Diario` / `Semanal` / `Quincenal` / `Mensual` | Cada cuánto paga. **Los Diario están fuera del motor de cajas** | sí |
| `dia_pago` (`Lunes` / `Miércoles`) o `dias_pago_mes` (ej. `{15,30}`) | Qué día le toca | sí |
| `valor_semanal` | Valor de la semana BASE (para quincenal/mensual el total se calcula, no se guarda) | sí |
| `tarifa_diaria`, `tarifa_domingo`, `ahorro_diario`, `ahorro_domingo` | Cómo se arma el día (L-S y domingo valen distinto; nunca total/7) | interno |
| `motor_v2` (sí/no) | Si el contrato va por el libro de cajas. Hoy: todos los de tiempo definido | interno |
| `total_cajas`, `cajas_pagadas`, `caja_actual_pagado`, `cajas_previas`, `cajas_exoneradas` | El libro de cajas: cuántas debe llenar en total, cuántas llenó, cuánto lleva de la actual, cuántas se le rodaron | sí (como "va X de N") |
| `prorrateo_total`, `prorrateo_pagado`, `fecha_inicio_cajas` | La caja 0 (los días sueltos hasta el primer día de pago) | interno |
| `es_migrado`, `empalme_cerrado` | Vino del sistema viejo; si el empalme no está cerrado, sus cifras de apertura aún se revisan | interno |
| `ahorro_acumulado`, `ahorro_apertura` | Lo que ha ahorrado (nuevo + el que traía) | `[dueño]` |
| `saldo_favor_apertura` | Saldo a favor que traía | sí |
| `fecha_entrega`, `fecha_fin_contrato` | Cuándo recibió la moto; fin **informativo** (el contrato termina por cajas llenas, no por fecha) | sí |
| `meses` | Plazo total pactado | sí |
| `base_completada` (solo Diario) | Llegó a los $510.000 de ahorro; toca graduarlo | interno |

### 3. Moto — `motos.estado`

| Valor en el sistema | En palabras del negocio | Quién lo pone | Quién lo quita | ZALA |
|---|---|---|---|---|
| `Disponible` | Sin cliente, lista para entregar | Registro; liberar; liquidar | Wizard paso 2 | no |
| `Reservada` | El wizard la apartó, aún no se entrega | Wizard paso 2 | Paso 6 o cancelar | no |
| `Asignada` | Con el cliente, produciendo | Wizard paso 6; reactivar; liberar con contrato activo | Todo lo demás | sí |
| `Mantenimiento` | En taller. Puede tener contrato Activo ("varada") o no | Ingreso a taller | Salida de taller (vuelve al estado anterior) | sí |
| `Recuperada` | **Retenida** (palabra principal de la operación, confirmada 4-sep; también se dice "guardada" e "inmovilizada": ZALA entiende las tres y dice *retenida*). Se recogió por mora o el cliente la entregó; el contrato queda Suspendido | Recolección; recepción | Devolverla; liquidar; reasignar | sí |
| `Fiscalia` | Retenida por la Fiscalía | Registrar retención (con `retencion_fecha`, `retencion_numero_caso`) | Liberar retención | sí |
| `Transito` | En los patios de tránsito | Ídem | Ídem | sí |
| `Garantia` | En garantía del concesionario | Ídem | Ídem | sí |
| `En traspaso` | Terminó de pagar; los papeles están pasando al cliente | `cerrar_liquidacion` por cumplimiento | Traspaso completado | sí |

Ojo con la moto:

| Campo | Qué es | Problema conocido |
|---|---|---|
| `ubicacion_fisica` = `con_cliente` / `bodega` / `oficina` / `taller` / `patios_transito` / `fiscalia` / `otro` | Dónde está físicamente | **Se puede desalinear del estado** (caso IEW64I: `Asignada` + `bodega`). ZALA no debe usarlo para decidir si la moto está con el cliente |
| `retencion_fecha`, `retencion_numero_caso`, `retencion_detalle` | La retención legal abierta | **Se borran al liberar**: una retención pasada no deja rastro aquí |
| `subadmin_id` | El encargado de la moto (quién la cobra) | Sin encargado = nadie la persigue |
| `grupo` = `COSTA` / `PRADERA` / `RASTREADOR` / `USADAS` / `OTRO` | De qué socio es la plata | — |
| `condicion_ingreso` = `nueva` / `usada` | — | — |
| `fecha_seguro`, `fecha_tecnomecanica` | Vencimientos de papeles | — |

### 4. Pago — `pagos`

| Campo | Valor en el sistema | En palabras del negocio | ZALA |
|---|---|---|---|
| `estado` | `Confirmado` | Cuenta. Es plata que entró | sí |
| | `Pendiente` | Esperando confirmación: transferencia sin verificar, o efectivo de campo que el cobrador aún no entregó | sí ("recibimos tu comprobante, está en verificación") |
| | `Rechazado` | No vale. No se cuenta | sí |
| `metodo` | `Efectivo` / `Transferencia` | (`Nequi` existe en la base vieja, no se usa) | sí |
| `tipo_registro` | `normal` | Pagado en la oficina | interno |
| | `campo` | Cobrado en la calle por un cobrador; doble control con `entregado_caja` | interno |
| | `transferencia` | Con foto de comprobante y `referencia` (una referencia = un valor exacto) | interno |
| | `adelanto_base` | **Interno**: la semana adelantada de la base. Se ve en el historial pero **no es plata del día** | no |
| | `alquiler_reemplazo` | Alquiler de la moto prestada ($27.000/día). Entra a caja pero **no toca las cajas del contrato** | sí |
| | `saldo_favor` | **Interno**: aplicación de un saldo a favor. No es plata nueva | no |
| `fecha` / `fecha_registro` | Cuándo PAGÓ / cuándo se DIGITÓ | El motor reparte por `created_at` | sí / interno |
| `aplicado_*` (`tarifa`, `ahorro`, `deuda`, `convenio`, `saldo_favor`, `multa`, `lavada`) | A qué se fue cada peso del pago | Informativo; lo escribe el motor | interno |
| `comprobante_url`, `referencia`, `ubicacion` (GPS del cobro en campo) | Pruebas | interno |

Plata que llegó sin saber de quién es (`ingresos_no_identificados`, mig 064): `pendiente` (no se
sabe de quién) / `asignado` (ya se casó con un pago). `[verificar nombre exacto de la tabla]`

### 5. Deuda — `deudas`

| Campo | Valor en el sistema | En palabras del negocio | ZALA |
|---|---|---|---|
| `estado` | `pendiente` | Se cobra hoy, aparte de la cuota | sí |
| | `en_convenio` | Entró a un convenio: **se cobra por la cuota del convenio, no aparte**. `convenio_id` dice a cuál (mig 124) | sí, pero como parte del convenio |
| | `pagada` | Saldada | no |
| `concepto` | `multa_recoleccion` | $20.000 por recogerla. **Se cobra de primera** | sí |
| | `lavada` | $15.000. **Se cobra de segunda**, tras la multa | sí |
| | `tarifa_atrasada` | Semanas viejas registradas como deuda (contratos sin motor o casos manuales) | sí |
| | `migracion` | Deuda de apertura del arqueo del sistema viejo | sí |
| | `daño_vehiculo`, `prestamo_repuesto`, `prestamo_eventualidad`, `fotomulta`, `otro` | Lo que dice el nombre | sí |
| `monto` / `monto_pendiente` | Lo original / lo que falta | sí (solo el pendiente) |

### 6. Convenio — `convenios`

| Campo | Valor en el sistema | En palabras del negocio | ZALA |
|---|---|---|---|
| `estado` | `activo` | Corre: cada período se le suma la cuota del convenio encima de la cuota normal | sí |
| | `cumplido` | **No es confiable como "terminado": vuelve a `activo` con cada pago** `[verificado en el trigger]` | interno |
| | `incumplido` | Se le vencieron cuotas sin pagar. El tercero obliga a liquidar | sí |
| | `renovado` | Se reemplazó por otro | no |
| `cuota_por_periodo` | Lo que paga de convenio cada período. **Se arrastra**: si abonó $40.000 de $100.000, la semana siguiente debe $160.000 | sí |
| `deuda_total` | El total pactado. Nunca se le exige más que esto | sí |
| `cubre_periodo_hasta` | Hasta esa fecha las semanas están **financiadas dentro del convenio**: no se cobra cuota normal aparte | sí |
| `created_at` | Desde cuándo corre. **No corre durante el prorrateo** | interno |
| `periodos_exonerados` | Cuotas del convenio que se le rodaron | interno |
| Regla | Máximo 3 por contrato. Siempre encima del pago normal, nunca lo reemplaza | sí |

### 7. Gestión de cobro — `gestiones_cobro.tipo`

Lo que un cobrador hizo con un cliente. **El botón es el registro.**

| Valor en el sistema | En palabras del negocio | ZALA |
|---|---|---|
| `mensaje_recordatorio` | Se le mandó el mensaje del día de pago / gabela / mora | interno |
| `whatsapp`, `llamada` | Lo que dice | interno |
| `sirena` | Se le sonó la alarma (moto detenida) | interno |
| `visita` | Se fue hasta donde está | interno |
| `plazo_extra` | Se le dio plazo. Trae `plazo_extra_dias`, `plazo_extra_motivo`, `plazo_extra_fecha_limite`. **Mientras está vigente, sale de Recolección**. Solo lo da MotoGestión, nunca ZALA | sí (informar el plazo) `[dueño]` |
| `recoleccion` | Se recogió la moto | interno |
| `cobro_campo` | Se le cobró en la calle | interno |
| `otro` | — | — |
| `fecha_compromiso` (en cualquier gestión) | Prometió pagar el día X | sí `[dueño]` |

### 8. Visita domiciliaria — `visitas`

| Campo | Valor | Significado |
|---|---|---|
| `estado` | `Pendiente` / `Completada` / `Realizada` | `[verificar: Completada y Realizada parecen lo mismo]` |
| `resultado` | `Aprobado` / `Rechazado` / `Repetir` / vacío | Lo que dijo el admin |
| `asignada_a` | A qué visitador / subadmin le tocó | — |
| `ubicacion_moto_resultado` (mig 060) | `coincide` / `no_coincide` | Si la moto se guarda donde dijo |

ZALA: no.

### 9. Taller — `taller.estado_tecnico`

`Pendiente` → `En diagnóstico` → `En reparación` → `Listo para salida` → `Finalizado`.
Al finalizar, si hay contrato activo y pasaron días, el admin decide **cobrar o rodar** ese tiempo.
ZALA: solo "está en taller".

### 10. Liquidación — `liquidaciones`

| Campo | Valor | Significado |
|---|---|---|
| `motivo` | `cumplimiento` | Terminó de pagar: cliente `Egresado`, moto `En traspaso` |
| | `retiro_voluntario` | Se va antes de terminar |
| | `incumplimiento` | Se le quita por no pagar |
| `estado` | `iniciada` → `en_taller` → `calculada` → `documento_generado` → `firmada` → `cerrada` | Las 6 etapas. Solo `cerrada` mueve el contrato, la moto y el cliente |
| `saldo_final` | Si es negativo → lista negra | — |

ZALA: solo "está en proceso de liquidación".

### 11. Recepción de la moto — `recepciones_vehiculo`

| Campo | Valor | Significado |
|---|---|---|
| `motivo` | `retencion_mora` / `entrega_voluntaria` / `liquidacion` / `nuevo_registro` / `otro` | Por qué llegó la moto a la empresa |
| `condicion_general` | `buena` / `regular` / `mala` | Cómo llegó |
| `lavado` | sí / no / vacío (no se preguntó) | Si se mandó a lavar → deuda `lavada` |
| `llave_entregada` | sí / no / vacío | **`no` = el cliente se quedó con una llave**: pedírsela al devolver, cobrársela si liquida |

### 12. Préstamos

| Tabla | Estado | Significado |
|---|---|---|
| `prestamos_reemplazo` | `activo` / `cerrado` | Se le prestó otra moto mientras la suya está guardada. Se cobra **aparte** a $27.000/día; su contrato sigue contando normal |
| `prestamos_doc` (`tipo` = `llave` / `tarjeta`) | `prestado` / `devuelto` | Se le prestó una llave o la tarjeta de propiedad para un trámite |

### 13. Otros

| Tabla | Valores | Significado |
|---|---|---|
| `acuerdos_tiempo_rodado.decision` | `cobrar_ahora` / `rodar_al_final` | Qué se decidió con el tiempo que la moto estuvo fuera de servicio. Rodar = solo períodos completos |
| `abonos_base.tipo` | `abono` / `devolucion` / `retencion` | Movimientos de la base inicial antes del contrato |
| `cesiones_contrato` | cedente → cesionario, `fecha` | Un cliente le pasó su contrato a otro. El cedente queda `Retirado` |
| `cajas_llenadas.fuente` | `pago` / `convenio` | Por cuál camino se llenó cada caja |
| `nomina_cierres` | una fila por semana y cobrador, congelada | No es de ZALA |
| `profiles.role` | `ADMIN_PRINCIPAL` / `ADMIN` / `SUBADMIN` / `SECRETARIA` / `MECANICO` / `SOCIO` / `VISITADOR` / `ANALISTA` | Quién es quién |

---

## Parte 2 — Estados que se CALCULAN (no viven en ninguna tabla)

Esta es la parte que ZALA **no puede ver hoy** con ninguna llave, porque solo existe en el código
de la pantalla (`src/utils/cicloPago.ts` y compañía). Es la razón de la vitrina.

| # | Nombre | Valores | De dónde sale | Lo que ZALA hace hoy en su lugar |
|---|---|---|---|---|
| C1 | **Estado de cartera** | `al-dia` / `gabela` / `mora` | `calcularEstadoCartera`: día de pago, gabela de 1 día, cuota del convenio, período cubierto, caja exigida sin llenar (motor v2). Los Diario tienen su propia regla | Cuenta días desde el último pago |
| C2 | **Días en mora** | número | `diasEnMora`: desde la caja MÁS VIEJA sin llenar, menos la gabela | Ídem |
| C3 | **Cuánto debe hoy** | `cuota {toca, pagado, falta}` + `acuerdo {toca, pagado, falta, cuotaDelPeriodo}` + `deudas {toca, pagado, falta}` + `totalFalta` + `saldoAFavor` | `loQueDebe()` — la única función. **El saldo a favor se muestra, nunca se resta** | Suma tablas a mano (Kevin, Andry) |
| C4 | **Cuota del convenio de este período** | monto o 0 | `cuotaConvenioDelPeriodo`: 0 durante el prorrateo, 0 si el período está cubierto | No lo sabe |
| C5 | **Balde del día** | `Recolección` / `Mora` / `Gabela` / `Pagan hoy` / `Al día` | Panel Hoy: Recolección = mora de más de 3 días **sin plazo extra vigente** | No lo sabe |
| C6 | **Plazo extra vigente** | sí / no + fecha límite | Última gestión `plazo_extra` con `fecha_limite >= hoy` | No lo sabe |
| C7 | **Paso del protocolo** | mensaje → llamada → sirena / apagado → recolección | Qué gestiones se hicieron hoy | No lo sabe |
| C8 | **Empalme pendiente** | sí / no | `es_migrado` y no `empalme_cerrado` | No lo sabe |
| C9 | **Falta convenio** | sí / no | Migrado confirmado + deuda + sin convenio | No lo sabe |
| C10 | **Tiempo guardado sin resolver** | N días + tramos | `tiempoGuardado.ts`: recepciones + préstamos + retención abierta, menos lo ya resuelto en `acuerdos_tiempo_rodado` | No lo sabe |
| C11 | **Por qué está retenida** | por mora / temporal (él la entregó) / varada en taller / en préstamo | Inmovilizaciones: `motivo_suspension` + estado de la moto + préstamos | No lo sabe |
| C12 | **Se quedó con una llave** | sí / no | Última recepción con `llave_entregada = false` | No lo sabe |
| C13 | **Papeles por vencer** | días (negativo = vencido) | `fecha_seguro`, `fecha_tecnomecanica` contra hoy | — |
| C14 | **Va X de N cajas** | números | `cajas_pagadas` / `total_cajas` (+ prorrateo) | — |
| C15 | **Base inicial** | requerida / pagada / falta | `$308.000 + valor del período` contra `ingreso_inicial` + abonos | — |
| C16 | **Las 19 alertas** | `mora_critica`, `gabela`, `base_completada`, `soat_vence`, `tecno_vence`, `plazo_extra_vence`, `transferencia_pendiente`, `contrato_sin_activar`, `moto_retenida`, `traspaso_proximo`, `convenio_incumplido_3`, `convenio_por_vencer`, `moto_taller_demorada`, `validar_ubicacion_moto`, `promesa_pago_vence`, `prestamo_doc_vence`, `dinero_sin_identificar`, `cesion_pendiente` | `useAlertas`, al vuelo, **sin dueño ni estado** (el motor de pendientes está en diseño) | — |
| C17 | **Encargado** | nombre | `motos.subadmin_id` → `profiles.nombre` | — |

**La regla que manda sobre todo esto:** el número que se cobra siempre resta lo ya pagado; si ya
pagó, dice $0. "Le falta por pagar", "total del acuerdo" y "deuda registrada" son tres cosas
distintas y no comparten etiqueta.

---

## Parte 3 — Preguntas para el dueño

Cada respuesta cambia una fila de arriba. Se responden de a una.

1. ~~Vocabulario de la moto recogida.~~ **Respondido 4-sep:** la palabra es **retenida**;
   "guardada" e "inmovilizada" también se usan y se aceptan como sinónimos. En la base sigue
   diciendo `Recuperada`; la vitrina traduce.
2. ~~Los cuatro estados del cliente que nadie escribe.~~ **Respondido 4-sep:** se dejan en el
   diccionario para que no se pierdan y **se definen después**. Mientras tanto, ZALA no los usa.
3. **Deuda en convenio.** Cuando un cliente pregunta cuánto debe, ¿ZALA dice solo la cuota del
   convenio, o también "y tienes $X pendientes dentro del convenio"?
4. **Encargado.** ¿ZALA puede decir "tu cobrador es Brandon"?
5. **Saldo a favor.** ¿ZALA lo menciona ("tienes $30.000 a favor") o solo lo ve la oficina?
6. **Plazo extra y promesa de pago.** ZALA nunca los da. Pero si ya existen, ¿los informa
   ("tienes plazo hasta el viernes")?
7. **`Finalizado` vs `Cancelado`** en el contrato: confirmar qué motivo de liquidación da cada
   uno `[verificar en cerrar_liquidacion]`.

---

## Parte 5 — La vitrina (esquema `zala`, migración 126)

Lo único que ZALA puede ver. Cinco vistas y una tabla, todas de solo lectura, con el resultado
ya cocinado y en palabras del negocio. El catálogo columna por columna vive en la tabla
`zala.diccionario` (es la fuente; este documento la resume):

| Vista | Una fila por | Lo que trae |
|---|---|---|
| `zala.cliente` | contrato vivo (Activo o Suspendido) | **`debe_hoy`** (la cifra, ya resta lo pagado) y su desglose `cuota_falta` + `acuerdo_falta` + `deudas_falta`; `debe_hoy_detalle` en palabras; `estado_cartera` (al-dia / gabela / mora) y `estado_texto`; `dias_mora`; `balde_hoy`; `plazo_extra_vigente`; `proximo_pago_fecha/monto`; `ultimo_pago_*`; `pagos_por_confirmar`; `saldo_a_favor` (se muestra, nunca se resta); su moto (`placa`, `su_moto_estado`, `placa_que_usa`, `en_prestamo`); `encargado`; `va_cajas` de `total_cajas`. Los Diario traen `debe_hoy` en null: su cuenta se consulta en la oficina |
| `zala.moto` | moto | `estado` en palabras, `cliente`, `encargado`, `prestamo`, `retencion_fecha`, `en_taller_desde`, SOAT y tecnomecánica con días |
| `zala.pagos` | pago de los últimos 120 días | fecha de pago, valor, método, `estado_texto` (confirmado / en verificación / rechazado), `es_plata_real` |
| `zala.convenios` | acuerdo vigente o incumplido | cuota, total pactado, abonado, `exigido_a_hoy`, `falta_a_hoy`, próxima cuota, semanas cubiertas, deudas que entraron |
| `zala.deudas` | deuda pendiente o en convenio | `que_es` en palabras, `falta`, `estado_texto` |
| `zala.diccionario` | columna | `significado`, `valores`, **`zala_lo_dice`** (sí / no / solo si pregunta / por confirmar), `confirmado_por_dueno` |

**Cómo se calcula:** las funciones `zala.*` son el espejo SQL de `cicloPago.ts` (`loQueDebe`,
`faltaDelAcuerdo`, `cuotaConvenioDelPeriodo`, `periodosConvenioExigidos`, `desgloseExigible`,
`diasEnMoraV2`, `calcularEstadoCartera`) y del balde del panel Hoy. La exigencia de cajas no se
duplica: se reusa `public.cajas_exigidas`, la del motor. La prueba espejo
(`motogestion/scripts/vitrina-espejo.browser.js`) compara pantalla y base contrato por contrato.

**Quién entra:** el rol `zala_lector` (USAGE en `zala`, SELECT en sus vistas, nada más). Nace sin
contraseña; la pone el dueño a mano. Desde la app, `public.zala_vitrina('cliente')` devuelve la
vista como JSON solo a ADMIN / ADMIN_PRINCIPAL / ANALISTA (para la prueba y los informes).

**Pendiente de la palabra del dueño** (marcado `por confirmar` en el diccionario): si ZALA
menciona el saldo a favor, el nombre del encargado, el plazo extra y la promesa de pago.
Recomendación cargada: saldo a favor y encargado sí (informativo); plazo y promesa solo si ya
existen y nunca como oferta.

## Parte 4 — Regla de ahora en adelante

Toda función nueva que cree un estado, un valor posible o una cifra que se muestre, entrega
**tres cosas** en la misma migración o commit:

1. Su fila en este documento y en `zala.diccionario`.
2. Su columna (o valor) en la vista de `zala` que corresponda.
3. Su caso en la prueba espejo (`loQueDebe()` de la pantalla contra `zala.cliente` de la base).

Sin las tres, la tarea no se cierra.
