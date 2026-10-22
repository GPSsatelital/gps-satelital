---
name: estados-a-mano-y-evidencia-del-prestamo
description: "22-sep — se quitaron los cambios de estado a dedo, el menú de novedades ahora dice la consecuencia, y prestar/devolver un reemplazo exige 6 fotos + km (mig 164). Disparado por el caso JORDAN/DQL76I"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-22T18:03:45.676Z
---

# Los estados no se cambian a mano, y la prestada deja evidencia (22-sep-2026)

Commit `6becf1f` · mig **164 corrida y verificada** · 650 pruebas.

## El caso que lo destapó — JORDAN MARTINEZ, DQL76I

Trajo su moto **dañada**. Quien la recibió eligió **"Entrega voluntaria"** en el menú de
novedades — que **suspende el contrato**. Desde ahí, el botón de prestarle un reemplazo **ya no
podía salir** (exige contrato Activo), y el cliente quedó sin poder trabajar **estando al día**
(había pagado su base de $202.000 y el prorrateo de $109.000, exacto al peso).

🔑 **Lo que me equivoqué al diagnosticar, dos veces:**
1. Dije *"el sistema no tiene camino, hay que rediseñar el flujo"*. **Falso**: el camino existía y
   es **"🔧 Ingresar a taller"**, que NO suspende el contrato. El arreglo era de **palabras**, no
   de flujo.
2. Dije *"faltan $95.000"* del pago de $109.000, porque `aplicado_tarifa` salía en 0. **Falso**:
   el prorrateo vive en su **propia casilla** (`prorrateo_pagado` / `prorrateo_ahorro`), no en la
   de las semanas. Miré la columna equivocada. `loQueDebe()` decía `totalFalta: 0`.
   → **Antes de gritar que falta plata, preguntarle a `loQueDebe()`**, que es la fuente única.

## Lo que se construyó

### 1. Fuera los cambios de estado a dedo (pedido del dueño)
> *"que no hayan errores de clicks o intenciones no adecuadas que puedan entorpecer el sistema y
> su veracidad operativa"*

- **Motos**: se fue el `<select>` "Cambiar estado" — cambiaba el estado con UN clic, sin motivo ni
  rastro, y podía dejar la moto contradiciendo su contrato. Ahora es solo el dato + la nota.
- **Contratos**: se fueron "⏸️ Suspender contrato" y "↩️ Reactivar contrato". En su lugar, un
  cartel que dice **por cuál camino va cada caso** — para que nadie quede buscando el botón.
- **NO se tocó** lo que cambia estados como consecuencia de un flujo documentado: wizard,
  recolección, taller, liquidación, entrega, préstamo, cesión. Eso es el sistema andando.
- Si hay que mover un estado: **por base de datos, con el dueño, y queda el rastro.**
- 🔲 Pendiente declarado: bloquearlo **también en la base** necesita un candado que podría frenar
  los flujos buenos. Se dejó para hacerlo aparte, con pruebas.

### 2. El menú de novedades dice la CONSECUENCIA
Las descripciones en letra chica **ya existían**; lo que faltaba era que dijeran lo único que
importa: **si el contrato sigue cobrando o se suspende**.
- `"Entrega voluntaria del cliente"` → **`"El cliente para un tiempo"`**. El nombre viejo no
  distinguía *"me voy"* de *"se dañó"*, y ahí estaba la trampa.
- Lleva el desvío explícito: *"⚠️ Si la moto se dañó y quiere seguir trabajando, usa Ingresar a taller"*.

### 3. La moto prestada deja evidencia (mig 164)
Prestar era el **ÚNICO** momento del sistema en que una moto cambiaba de manos sin dejar nada.
Y es la moto de **OTRO SOCIO** la que se presta y se desgasta.
- **Prestar** pasa a 2 pasos: elegir la moto → **6 fotos guiadas + km + condición + daños**.
  🔑 **El swap de placa se hace AL FINAL**: si la subida falla, el préstamo no queda a medias.
- **Devolver** abre `ModalDevolverReemplazo`: lo mismo, y **compara el km con el de salida** →
  por primera vez se sabe cuánto rodó la prestada.
- Motivos con **nombre propio** (`prestamo_entrega` / `prestamo_devolucion`), no dentro de
  `'otro'`: ese atajo ya se pagó caro con el alquiler del reemplazo (mig 131).
- Los préstamos viejos no tienen km de salida → el modal lo **dice**, no inventa un número.

## Verificado en la pantalla, no solo en verde
Abrí Motos (el selector ya no está, sale la nota) · el menú de novedades (leí los textos nuevos) ·
el contrato de JORDAN (el cartel con los 4 caminos) · y el modal de préstamo hasta el paso 2
("faltan 6", el botón **bloqueado** sin fotos), cerrándolo sin guardar nada.
El check de la mig 164 se probó **insertando y borrando** una fila — y confirmando que quedaron 0.

> Método: [[consultar-base-desde-el-navegador]].
