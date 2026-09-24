---
name: retenciones-rotas-y-filtros-descargas
description: "Sesión 27-jul — retenciones de motos estaban rotas (migs 074/075, probadas) + las 3 descargas del sistema unificadas con selector de columnas, filtros y hojas opcionales"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-28T23:30:00.942Z
---

# 27-jul-2026 — TODO EN PRODUCCIÓN Y VERIFICADO (6 commits, `d1ef2a4` → `90b1158`)

> El trabajo del **28-jul** (regla de inmovilizar, tope de convenios) está en
> [[regla-inmovilizar-y-convenios]].

Migraciones **073, 074 y 075 ✅ corridas** por el usuario. No queda SQL pendiente de esta sesión.

---

## 1. Retenciones de motos: estaban ROTAS (arreglado y probado end-to-end)

**El bug:** `motos` no tenía `retencion_fecha` / `retencion_numero_caso` / `retencion_detalle`, y
`registrarRetencion()` las escribía en el MISMO update que el estado → Postgres rechaza la
instrucción completa → **ni el estado se guardaba**. Y era la única puerta: el desplegable
"Cambiar estado" no ofrece Fiscalía/Tránsito/Garantía. O sea: **hasta hoy era imposible registrar
que una moto estaba retenida**. ⚠️ Vale preguntarle al usuario si alguna moto se fue a Fiscalía
en estos días sin quedar registrada.

**La trampa escondida:** al crear las columnas, `liberarRetencion` empezaba a funcionar y **pisaba**
el "En taller" que la salida de Fiscalía acababa de poner (dos updates seguidos, ganaba el segundo)
→ la moto habría salido a la calle sin revisión, con la pantalla diciendo lo contrario. Por eso la
migración NO se podía correr sola.

**Cómo quedó:** `liberarRetencion(id, destino)` con destino OBLIGATORIO (el compilador obliga a
decidirlo) y todo en UN update. Los 3 motivos abren la MISMA ventana; antes Fiscalía tenía la suya
y Tránsito/Garantía un `confirm()` que se comportaba distinto. **Decisión del dueño: el funcionario
elige** si pasa a taller o vuelve a operar. Las motos retenidas ya NO aparecen en la lista del
mecánico (decisión del dueño: cerrar esa puerta, no backdatear la orden).

**Mig 075 = candado en la BD:** trigger que limpia `retencion_*` cuando el estado deja de ser
Fiscalía/Tránsito/Garantía. Se hizo así y no parcheando llamadores porque hay ~11 sitios que
cambian `motos.estado` (p.ej. `useLiquidaciones.ts:132`) y basta olvidar uno.

**Probado en navegador con ZZC02T:** retener → badge + fecha + n° caso ✅ · salida eligiendo taller
→ queda **En taller** ✅ · salida eligiendo operar → **Disponible** ✅ · candado: cambiando el estado
por el desplegable la marca se borró sola ✅ · retenida no aparece en Taller (0 de 270) ✅.

**Bug aparte del mismo archivo:** editar una moto sin SOAT/tecnomecánica **perdía TODA la edición**
(cadena vacía a columna `date` → 22007). Afectaba justo a las migradas por SQL. Al crear ya se
normalizaba `|| null`; al editar no. Verificado con ZZC02T.

---

## 2. Las 3 descargas del sistema, unificadas

Componente único **`src/components/ModalDescargar.tsx`** + motor en **`src/utils/exportar.ts`**
(antes enterrado sin `export` dentro de ReportesView).

**Regla que pidió el dueño, textual:** *"que dé solo el resultado que se le marque y no los que
quiere o los que se programan solos"*. Su queja era sobre el Excel de REPORTES: 12 columnas fijas
+ 5 hojas anexadas siempre, arrays literales en el código.

Lo que ofrece la ventana:
- **Columnas como casillas**; datos personales (cédula/teléfono/dirección) en bloque aparte 🔒 y
  **desmarcados**. Nunca enlaces de Storage (un link en un Excel reenviado abre sin sesión).
- **Filtros desplegables** dentro de la ventana, con conteo en vivo. Opciones calculadas de las
  filas reales, para no ofrecer un valor que dé cero.
- **"Bajar todo" es opt-in**, nunca el default (evita "bajé 40 y me trajo 350").
- **Hojas extra como casillas, todas apagadas** (decisión del dueño).
- Aviso sobre 2.000 filas · anti-doble-clic · la leyenda impresa describe lo que REALMENTE trae.

Dónde está: **Historial de Pagos** (20 col · Grupos/Método/Estado/Tipo) · **Motos** (33 col ·
Grupos/Estados/Encargado) · **Reportes** Por admin y Por grupo (12 col · Grupos/Cobrador/Estado de
pago/Modalidad + las 5 hojas).

Para no perder calidad: una columna puede devolver una **celda rica** (`CeldaX`) — el estado sigue
saliendo verde/ámbar/rojo dentro del Excel — y existe la prop `nota` para la leyenda de estados.

**Se quitó el TOTAL GENERAL** del informe viejo a propósito: con filtros dentro de la ventana, un
total fijo mentiría. 🔲 **Ofrecido al usuario y sin respuesta:** volver a ponerlo pero calculado
sobre lo filtrado.

---

## 3. Seguridad y limpieza que salió de paso

- **Historial de Pagos era la ÚNICA pantalla de dinero sin `useScope()`** — un SUBADMIN con acceso
  al módulo veía TODOS los pagos. Cerrado.
- **Acción `exportar_datos`** (default ADMIN + ADMIN_PRINCIPAL, ajustable por persona). Conectada
  también a los 4 puntos de salida de Reportes que no pedían nada. Honestidad: esconde el botón,
  no es un muro; lo que protege de verdad es el scope y la RLS.
- **`grupoDePago()` extraída** a `usePrestamos.ts` (estaba copiada 3 veces). CajaView y
  CobroDiarioView ahora la importan. **Siempre pasa por `motoDelPortafolio`** — con un préstamo
  activo la plata es del socio de la moto ORIGINAL. ⚠️ Dashboard y las tarjetas de recaudo por
  grupo de Reportes TODAVÍA no lo usan: el archivo nuevo puede no cuadrar contra esas dos pantallas
  y **el que estaría bien es el archivo**.
- **CSV arreglado**: separador `;` (con coma, Excel es-CO abría todo en la columna A) + comillas
  con escape (una coma en un texto libre corría las columnas) + los nombres ya no se mutilan.
- Nombre de la empresa → **"Club Moteros Cartagena"** en los 7 lugares (recibos, acuerdo de pago,
  estado de cuenta, línea de tiempo, informes).
- `ModalDeuda` (Cobro Diario): pedía la descripción como "opcional" siendo NOT NULL → reventaba con
  un 23502 crudo delante del cliente. Y guardaba `registrado_por: null` — deudas sin autor.
- **Mig 073**: declara `convenios.cubre_periodo_hasta` y `firma_url`, que solo existían en la base
  viva. Sin ellas, reconstruir la BD dejaba a todos los clientes con convenio en falsa mora.

---

## ⚠️ TRAMPA CONOCIDA para la próxima descarga que se agregue

Usar **`hoyISO()`** para el nombre del archivo, NUNCA `toISOString()`: después de las 7pm da la
fecha de MAÑANA (Colombia es UTC−5). Ya pasó en esta sesión (`motos-2026-07-28` siendo 27).

## Nota de entorno

El navegador de prueba dejó de nombrar bien las descargas a mitad de sesión (quedaban como `.tmp`
en Downloads o en Temp). Truco que sí funciona: **listar los archivos ANTES, descargar, y hacer
`comm -13`** para ver cuál es el nuevo. Para verificar estilos de un `.xlsx`, la librería NO los
devuelve al leer — hay que **descomprimir el archivo y mirar `xl/styles.xml`**.

Ver [[estado-golive-27jul]], [[permisos-dos-capas-rls]], [[prestamo-liquidacion-verificados]].
