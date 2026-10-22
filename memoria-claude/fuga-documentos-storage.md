---
name: fuga-documentos-storage
description: Fuga de datos personales — sin sesión se podían LISTAR las 269 cédulas y bajar los documentos. Enumeración cerrada 26-jul; enlaces firmados listos 21-sep; FALTA cerrar los buckets
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-09-21T22:51:43.187Z
---

# 🔴 Fuga de datos personales — enumeración CERRADA, enlaces firmados PENDIENTES

Encontrada al retomar los pendientes "post go-live". Yo la había priorizado mal: asumí que
hacía falta el link exacto de cada archivo. **Falso** — se podía listar todo.

## Lo que estaba expuesto (comprobado, no teórico)
Con solo la clave anónima —que **viaja dentro del bundle de la app**, visible en las
herramientas del navegador— y **sin iniciar sesión**:
1. `POST /storage/v1/object/list/documentos` → devolvía las carpetas = **las cédulas de los
   269 clientes**
2. Listar dentro de una → nombres exactos de archivo
3. `GET /object/public/...` → descarga real (bajé un PNG de 18.659 bytes)

Contenido: cédulas, recibos públicos, hojas de vida, antecedentes, huellas, firmas y las fotos
con la **cara** de cada cliente. En Colombia: **Ley 1581 de 2012 (habeas data)**, agravado
porque hay autorizaciones de tratamiento firmadas comprometiéndose a custodiarlos.

**Causa:** `017_bucket_documentos.sql` creó la política de SELECT `to public` — y `public`
incluye al rol `anon`. El bucket `comprobantes` tenía otra política equivalente con otro nombre.

## ✅ Cerrado (mig 071, corrida 26-jul)
Todas las políticas de SELECT anónimo sobre `storage.objects` eliminadas (buscadas por
`pg_policies` en vez de por nombre — la primera versión falló en `comprobantes` porque yo
adiviné mal el nombre). Lectura solo `to authenticated`.

⚠️ **Corrección del 21-sep: son 2 buckets, no 5** (lo de "5" venía de esta nota y estaba mal).
`storage.buckets` devuelve exactamente `documentos` (63 usos en el código: cédulas, recibos,
firmas, huellas, fotos de moto, PDF) y `comprobantes` (2 usos). Ninguna parte del código apunta
a un bucket inexistente — el viejo pendiente del bucket `liquidaciones` ya no existe.

**Verificado:** listar sin sesión = **0 filas** · listar con sesión = OK ·
firma, huella, comprobante y foto de recepción **siguen cargando (200)** en la app.

## 🔨 Enlaces firmados — MITAD HECHA (8-ago, commit `ffb251d`)

Los buckets siguen **públicos**, así que **un link suelto todavía se abre sin sesión** (reenviado
por WhatsApp, historial del navegador). Ya no se puede enumerar, pero la exposición no es cero.

**El inventario real resultó más grande que la estimación de arriba:** 21 puntos que generan URL
y **35 puntos de visualización en 20 archivos** (no 16).

### La decisión de arquitectura que lo hizo viable

Las URLs públicas **ya están guardadas en la base** (miles de filas: `comprobante_url`,
`firma_url`, `documentos_cliente`, `fotos`…). Reescribirlas sería una migración enorme.
En vez de eso: **se firma AL MOSTRAR** — de la URL guardada se saca el camino del archivo y se
pide un enlace temporal. Cero migración de datos.

- `src/lib/storagePrivado.ts` — `partesDeUrlStorage` · `urlFirmada` (60 min) · `abrirDocumento`
  (abre la pestaña ANTES de firmar, o el navegador la bloquea por emergente).
  Si la firma falla devuelve la URL original: mientras los buckets sigan públicos eso funciona.
- `src/components/ImgPrivada.tsx` — reemplazo directo de `<img>`, con guarda `vivo` para no
  pintar la imagen de un cliente sobre la de otro.

### ✅ Hecho: las 15 `<img>`
`ModalDocumentosMoto` · `CajaView` · `ClientesView` · `CobrosView` · `FichaClienteView` ·
`FirmaModal` · `ReportesView`.

### ✅ Hecho: los 19 enlaces `<a href>` (19 y 21-sep, `1fc87c7` + `0e1954a`)
**A MANO, archivo por archivo** — se intentó con una expresión regular y **rompió JSX**: el
patrón `href=\{([^}]+)\}` cortó en el `}` de adentro de `` `${url}?download` ``. Revertido con
`git checkout`, nada llegó a producción.

Patrón usado: se **conserva** el `<a>` (cero cambios de estilo) y se agrega
`onClick={e => { e.preventDefault(); abrirDocumento(url) }}`. Se agregó `descargarDocumento`
para los 2 enlaces de "Descargar" que llevaban `?download` pegado a la URL pública.

Archivos: `FichaClienteView` · `ModalDocumentosContrato` · `ModalDocumentosMoto` ·
`ReportesView` · `LiquidacionesView` · `ContratosView` · `MiDiaView` · `ReferidosView` ·
`TarjetasLlavesView` · `ClientesView` (los 6 últimos, 21-sep — se me habían pasado).

Quedan 2 `<a href>` crudos y **ninguno es un documento**: "Cómo llegar" de `MisVisitasView`
(Google Maps) y el de WhatsApp.

### ✅ Hecho: las IMÁGENES de los documentos (21-sep, `c099039`)

**El hallazgo que evitó un desastre:** convertir los enlaces NO alcanzaba. Al inventariar todo el
código antes de cerrar aparecieron ~25 sitios más que bajaban la imagen por la URL pública — y el
peor fallaba **en silencio**: `urlADataUrl` tiene `catch { return null }` y quien la llama pinta el
recuadro vacío. Cerrar la bodega ese día habría hecho que **contratos, pagarés y liquidaciones
salieran impresos SIN FIRMA**, sin que nadie se enterara.

Dos embudos cubrieron casi todo:
- **`urlADataUrl`** (11 puntos de llamada) — firma antes de bajar. Cubre contrato, pagaré,
  liquidación, acuerdo de tiempo, las huellas del registro y `regenerarDocs`.
- **`htmlAPdfBlob`** — por ahí pasan TODOS los PDF.

Para lo que no pasa por esos dos: **`firmarImagenesHtml(html)`** — recibe el HTML ya armado y
cambia toda URL de Storage por su firmada. Los documentos se arman con plantillas de TEXTO, así
que `ImgPrivada` no sirve ahí. Usada en `imprimirLiquidacion` · `imprimirAcuerdoTiempo` ·
`imprimirDocumento` (autorización de datos, acuerdo de pago) · tarjeta de propiedad · SOAT ·
resumen de entrega.

⚠️ **Regla al usarla: abrir la ventana de impresión ANTES del `await`**, o el navegador la bloquea
por emergente.

**`<HtmlFirmado>`** (componente nuevo) para la vista previa del acuerdo dentro de `ModalConvenio`
—el archivo más delicado del proyecto—: su única dependencia es el `html`, que es un **string**,
así que React lo compara por valor y no hay bucle de render. Meterle un efecto con las
dependencias reales (arreglos derivados) sí lo habría hecho.

La parte que de verdad podía fallar (el RECORTE de la URL dentro del HTML) vive aparte en
`lib/urlsEnHtml.ts` —sin importar supabase, para poder probarla— con **9 pruebas**.

### ✅ CERRADO DE VERDAD — los 2 buckets en privado (21-sep)

**La prueba que importa, medida en producción con la bodega ya cerrada:**
el **enlace viejo devuelve 400** · el **camino nuevo devuelve 200 · image/jpeg · 783.675 bytes**.
Misma cédula, mismo archivo: el de afuera no entra, la app sí.

Se comprobó **midiendo**, no marcando casillas: las 6 piezas del mecanismo (abrir · descargar ·
`ImgPrivada` — cargó una foto de 3060×4080 en 3,2 s · `urlADataUrl` · `htmlAPdfBlob` de 23 KB, no
la hoja en blanco de 3 KB · `firmarImagenesHtml`) y **8 documentos generados con clientes reales**,
llamando a la función que corre al apretar el botón y leyendo el HTML que escribe: autorización de
datos · acuerdo de pago · liquidación · acuerdo de tiempo · contrato · resumen de entrega (6 fotos)
· tarjeta de propiedad · SOAT. **Cero direcciones públicas en los ocho.**
Registro completo: `docs/COMPROBAR-ANTES-DE-CERRAR-BUCKETS.md`.

> **Cómo se probó sin tocar la app:** `import()` dinámico de los módulos desde la consola del
> navegador con la sesión real (`/src/lib/storagePrivado.ts`, `/src/utils/pdf.ts`, …), y un espía
> temporal sobre `window.open` que captura lo que `document.write` escribe. React se importa desde
> `/node_modules/.vite/deps/react.js` (el especificador `react` pelado no resuelve en la consola).
> ⚠️ Al terminar **hay que devolver `window.open` al nativo** — recargar la página es lo más seguro.
> ⚠️ Y no medir una foto grande con un `setTimeout` corto: `naturalWidth` ya trae valor mientras
> `complete` sigue en falso. Esperar el evento, no el reloj — casi reporto un falso defecto.

**Reversible en segundos, sin pérdida de datos:**
`update storage.buckets set public = true where id in ('documentos','comprobantes');`

**Para que siga cerrado:** toda `<img>` nueva de un archivo del cliente usa `ImgPrivada`; todo
enlace nuevo usa `abrirDocumento`/`descargarDocumento`; todo documento nuevo que se imprima pasa
por `firmarImagenesHtml` **abriendo la ventana ANTES del `await`**. Los PDF no necesitan nada.

## 🔴 LA TERCERA PUERTA, la peor (encontrada el 21-sep · migs 161 y 162)

Al auditar los permisos ANTES de cerrar los buckets aparecieron **dos puertas más**, y ninguna la
cerraba el cierre de los buckets. Son de gente **con sesión**, no del de afuera con un enlace.

### a) Las políticas permisivas se suman (mig 161)
Sobre `storage.objects` había **5 políticas de SELECT, todas `PERMISSIVE`**. En Postgres las
permisivas se combinan con **OR**: basta que una diga sí. La que excluía al VISITADOR quedaba
**anulada** por otras dos que abrían la puerta a cualquiera con sesión. Se borraron esas dos más
2 fantasma (buckets `certificados` y `firmas`, que no existen). Queda **una**.

### b) `mi_rol()` devuelve NULL, y `NULL IS DISTINCT FROM 'X'` es TRUE (mig 162)
Las 3 políticas del bucket `documentos` decían `mi_rol() IS DISTINCT FROM 'VISITADOR'`.
`mi_rol()` es `select role from profiles where id = auth.uid()` → **NULL si no hay perfil**.
Y en SQL `NULL IS DISTINCT FROM 'VISITADOR'` = **TRUE**. O sea: **quien no tiene perfil pasaba.**

🔴 **Y el registro de usuarios de Supabase estaba ABIERTO.** Cualquier persona en internet podía
crearse una cuenta (la llave anónima viaja en el bundle), quedar sin perfil, y **listar y descargar
los 269 documentos de identidad** — y sobreescribirlos. Nadie había entrado todavía (`auth.users`
sin fila en `profiles` = 0). Peor: *Confirm email* también estaba apagado, así que ni siquiera
hacía falta confirmar un correo.

✅ **APAGADO el 21-sep** (Authentication → Sign In / Providers → *Allow new users to sign up*).
*Allow anonymous sign-ins* ya estaba apagado — era la otra puerta posible al mismo filtro.
La mig 162 es el cinturón: exige `mi_rol() is not null`.

> **Al crear un proyecto de Supabase para una app interna: apagar el registro el día uno.** Viene
> abierto de fábrica, y una app de operación no tiene ningún caso de uso donde alguien se registre
> solo — los usuarios los crea el dueño.

### Lo que NO estaba expuesto (verificado, no supuesto)
`clientes` · `contratos` · `pagos` · `deudas` · `convenios` **sí exigen rol** para leer (migs 026 y
037 hicieron su trabajo). Y **no hay política de INSERT sobre `profiles`**, así que una cuenta sin
perfil **no puede crearse uno ni ponerse rol**: no había escalada. La exposición era **solo los
archivos** + 3 tablas sin valor (número de ZALA, textos de mensajes, quién atendió qué).

### 🔑 CÓMO AUDITAR ESTO BIEN (me equivoqué dos veces en el camino)
1. **Un INSERT no tiene `qual`.** Su condición vive en `with_check`. Filtrar por `qual is null`
   lista TODAS las de insertar y parece una catástrofe que no existe. Pedir **las dos columnas**.
2. **En un UPDATE con `using` y sin `with check`, Postgres aplica el `using` a las dos cosas.**
   Un `with_check: null` con un `qual` real **está protegido**, no abierto.
3. En UPDATE con varias políticas, los `using` se juntan con OR y los `with_check` también,
   **por separado**. Para juzgar si alguien puede modificar una fila hay que revisar los dos lados.
4. `qual = 'true'` con un `with_check` que **no mira la fila** (solo el rol) funciona como puerta
   de rol — descuidado, no hueco. Caso de `contratos` UPDATE "staff de oficina".

## Lección
Un bucket "público" en Supabase no solo permite leer con el link: **permite LISTAR** si la
política de SELECT incluye al rol `public`. Al crear cualquier bucket, la política de lectura
debe ser `to authenticated` desde el día uno.
