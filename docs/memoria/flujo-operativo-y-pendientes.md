---
name: flujo-operativo-y-pendientes
description: "Diseño en conversación del MOTOR DE PENDIENTES para MotoGestión (2-sep-2026) + las correcciones del dueño a los ejemplos copiados del documento ZALA + 3 pedidos nuevos (lavado $15.000, llaves/copia, revisión GPS con citación). Nada construido aún."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-03T15:39:49.317Z
---

# Flujo operativo y motor de pendientes (2-sep-2026) — EN DISEÑO, nada construido

## De dónde viene

El dueño trajo el documento del proyecto **ZALA** (cobranza por WhatsApp Cloud API, 32.330 líneas
de Python, ya corriendo: 93 cobros el 2-sep, 59% leídos). Decisión tomada con él ese día:
**ZALA = la boca y los oídos (chat + leer comprobantes) · MotoGestión = el cerebro (cuentas, reglas
Y los pendientes)**. Una sola calculadora. ZALA muestra y avisa; el pendiente vive en MotoGestión.

Hallazgo técnico que motivó todo: `loQueDebe()` **solo existe en TS**, no hay versión SQL, y **no
hay ni una vista SQL** en el proyecto → ZALA hoy recalcula montos a mano (ya descuadró a Kevin y
Andry). Pendiente de diseño: exponer lecturas estables (RPC/vistas) para que ZALA nunca calcule.

## El motor de pendientes — la idea (aprobada en concepto, sin construir)

Hoy `useAlertas` tiene **19 tipos, calculados al vuelo (`useMemo`), sin dueño ni estado** — se
esfuman solos sin dejar rastro y no se puede contar "cuántas se quedaron sin atender".

Un pendiente = tarjeta con 6 cosas: tipo · de quién (cliente/contrato/moto) · **responsable (UNA
persona, nunca "el equipo")** · nació · vence · estado (abierto / en gestión / resuelto / no se
pudo) + la constancia. **El botón ES el registro.** Nace solo, se asigna solo (`motos.subadmin_id`;
sin encargado → fila "SIN DUEÑO", la que importa), se cierra a mano / solo (pagó) / por vencimiento
(sube a Sergio). **Tipo nuevo = fila de configuración, no desarrollo.** Las 19 alertas se convierten
en tipos; el panel Hoy y `gestiones_cobro` no se tiran: el pendiente manda a hacer la gestión, la
gestión es la constancia. Construir por fases, empezando por UN tipo con Brandon usándolo de verdad.

## 🔴 Correcciones del dueño a mis ejemplos (copiados del doc ZALA sin verificar)

1. **"Pedir tarjeta y llaves al retener" — NO existe.** La tarjeta de propiedad **nunca se le
   entrega al cliente**; las llaves **casi siempre las entrega**. Lo único que importa es el caso
   contrario: cuando NO entregó la llave y hubo que ir con la copia → eso sí hay que marcarlo
   (ver pedido 2 abajo).
2. **"Visitar para cobrar" — NO existe.** *"Aquí no se visita para cobrar; aquí si se visita es
   para retener."* El flujo real: **apagar la moto + sonar la alarma → si no responde, se va a
   buscar y listo.** No hay paso intermedio de visita. **Refinado por el dueño el mismo día: el
   único paso intermedio posible es DAR UN PLAZO** (si el cliente responde y se compromete) — y ya
   existe como `plazo_extra`, que mientras está vigente saca al contrato de Recolección. O sea:
   mensaje (ZALA) → apagar + alarma → [plazo, si lo pide y se le concede] → vence sin pagar → retener.
3. **"Registrar comprobante" como pendiente** — cuestionado: *"¿por qué tendría que registrarlo si
   eso ya lo hace una persona?"*. ZALA sabe que entró porque lee el WhatsApp (Cloud API + visión).
   El pendiente solo tendría valor si se están quedando fotos SIN registrar; si Ángela no deja
   pasar ninguna, sobra. **Pregunta abierta para el dueño**, no decisión mía.

**Lección:** cuando una fuente externa (documento, otro sistema) trae ejemplos de negocio, son
hipótesis hasta que el dueño las confirme. Verificar contra la operación real, no contra el papel.

## 🔴 El hallazgo del dueño: NUNCA se definió el flujo de actividades

Textual: *"eso lo debimos haber dejado por ahí antes en alguna parte del proyecto y nunca definimos
ese flujo de las actividades que debían hacer y solo nos centramos en las funciones del sistema en
general."* CLAUDE.md tiene un "Protocolo de mora" (mensaje → llamada → apagado/recolección) pero es
una lista de funciones, no el día a día de cada persona. **Antes de construir pendientes hay que
escribir ese flujo** (qué hace Brandon un lunes, qué hace el martes con el que no pagó, qué hace
Ángela con un comprobante…). Ese flujo ES la especificación de los tipos de pendiente.

## Pedidos nuevos del dueño (2-sep) — para diseñar, NO construidos

1. **Lavado $15.000** — en los formularios de ingreso de novedades de motos, un botón/selección
   "¿hay que mandarla a lavar?" → crea una deuda de $15.000 **marcada aparte** para que la caja
   diaria la saque separada, igual que hoy se separan las inmovilizaciones (multa `multa_recoleccion`).
   Probablemente = nuevo concepto en `deudas` + su renglón propio en `CajaView`.
2. **¿Entregó con llaves o hubo que llevar la copia?** — selección en el mismo ingreso de novedad.
   Sirve para dos cosas: al devolverle la moto, **pedirle la copia**; y si termina liquidando,
   **cobrársela**.
3. **Revisión del GPS** — donde se marque que a una moto le toca revisión del dispositivo:
   - cuando el sistema ya sepa que toca, avisar en un lugar **muy visible**;
   - **alerta flotante** cuando la moto está **retenida** y alguien entra a revisar las cuentas —
     para aprovechar que la moto está en la empresa;
   - también cuando se revisan las cuentas del cliente (moto en la calle), la misma ventana
     flotante con un **botón "enviar citación por WhatsApp"** invitándolo a la oficina a una
     "revisión rutinaria del vehículo". (Encaja con el GPS que MotoGestión aún no tiene: no existe
     ni el campo.)

4. **Recordatorio "volver a llamar en X horas"** (2-sep, tarde) — cuando una gestión termina en
   "quedamos en volver a llamar", el sistema debe **recordarle al funcionario a las X horas** que
   llame. Hoy NO existe: `fecha_compromiso` es "prometió pagar el día X" (día, no horas; alerta en
   `useAlertas:290`). Es el mejor ejemplo de que el motor de pendientes necesita **vencimiento por
   horas, no solo por días**.

**Aclaración del dueño (2-sep):** el plazo **NUNCA lo da ZALA** — vive en MotoGestión, máximo 1-2
días, y notifica al vencer. Ya es así (`plazo_extra`); ZALA solo conversa. Coherente con el doc
ZALA: *"Nunca: prometer plazos o rebajas"*.

**Confirmado por el dueño (2-sep):** la lectura de "llaves o copia" es correcta — A) entregó con
su llave · B) no la entregó y el funcionario fue con la copia de la empresa → el cliente se quedó
con una llave: pedírsela al devolverle la moto, o cobrársela si liquida. **Precio de la llave: sin
definir.** El dueño dijo *"arranquemos con el que mejor te parezca"* → se eligió empezar por estos
dos pedidos del formulario (concretos, confirmados), y la "receta" del flujo en una sesión aparte.

## Cómo está hoy lo que tocan los pedidos 1 y 2 (verificado en código, 2-sep)

- **`lavada` ya es concepto de deuda** (mig 095, 12-ago; "🧼 Lavada del vehículo" en `ModalDeuda`,
  filtros de Cartera y `cuentaLiquidacion`). Falta el **botón en los formularios de novedad** que la
  cree sola a $15.000, y **separarla en caja**.
- **La caja separa las multas por `pagos.aplicado_multa`** (mig 085): `min(aplicado_deuda,
  multa_pendiente_antes)` — funciona SOLO porque la multa se cobra de PRIMERA entre las deudas
  (mig 083). Para separar la lavada igual: (a) cobrarla también de primera, justo después de la
  multa, y (b) un `aplicado_lavada` análogo. ⚠️ Toca `aplicar_pago_confirmado`; la mig 119
  reescribió la función completa → las anclas de la 085 pueden no servir, leer la función viva.
- **La multa se crea en 3 sitios** (= los formularios donde irían lavado y llaves):
  `ModalRecoleccion.tsx:117` (mora) · `MotosView.tsx:438` (recepción/entrega voluntaria) ·
  `ModalIniciarLiquidacion.tsx:166`.
- **`recepciones_vehiculo`** (mig 008) no tiene columna de llave ni de lavado → migración nueva:
  `llave_entregada boolean` (null = no se preguntó) y `lavado boolean`.

## ✅ CONSTRUIDO la madrugada del 3-sep: pedidos 1 y 2 (botones), SIN tocar el motor

Decisiones del dueño esa noche: **la lavada se cobra de primera, junto con la multa** (orden
`multa → lavada → deudas viejas`) · **la llave se marca y se pide, pero NO se cobra todavía** (valor
sin definir) · **botones primero, motor después** — mi recomendación, aceptada: los botones dan valor
mañana y no tocan plata; el motor se hace fresco al inicio de una sesión, con pruebas, y para
entonces ya habrá lavadas reales contra las cuales verificar la caja.

Lo hecho (tsc limpio · 421 pruebas · ⚠️ **mig 122 pendiente de correr** — solo 2 columnas):
- `supabase/122_recepcion_lavado_llave.sql`: `recepciones_vehiculo.lavado boolean` y
  `llave_entregada boolean`, NULL = no se preguntó (a lo viejo no se le inventa un dato).
- `VALOR_LAVADA = 15000` en `utils/inmovilizacion.ts`, al lado de `MULTA_RECOLECCION`.
- **UN componente** `components/PreguntasRecepcion.tsx` para los 3 formularios
  ([[regla-reusar-flujo-existente]]): "🧼 ¿Hay que mandarla a lavar?" (No / Sí — $15.000) y
  "🔑 ¿Cómo llegó la llave?" (entregó la suya / hubo que ir con la copia). Si marca lavar → nace la
  deuda `lavada` (concepto de la mig 095) por `registrarDeuda`, igual que nace la multa.
- Conectado en `ModalRecoleccion` (mora: llave OBLIGATORIA — es el caso en que el cliente no
  está), `ModalIniciarLiquidacion` (llave obligatoria; la lavada se crea ANTES de
  `iniciarLiquidacion` para que entre en su detalle) y `MotosView` recepción (llave solo se
  pregunta en entrega_voluntaria/liquidación; la lavada se cobra al contrato Activo/Suspendido de
  la moto y si no hay, se anota y avisa que no hay a quién cobrar).
- `InmovilizacionesView`: `MotoRetenida.seFueConCopia` (= `llave_entregada === false` de la
  recepción que ya elige `recepcionDelContrato`) → chip amarillo "🔑 Se quedó con una llave" en la
  tarjeta, y se pasa a `ModalEntregaDevolucion`.
- `ModalEntregaDevolucion`: si `seFueConCopia`, recuadro rojo arriba de las fotos con "✓ Ya me la
  entregó / ✕ No la trajo" (obligatorio); si no la trajo, `confirm()` antes de soltar la moto. El
  rastro queda en la MISMA fila de la entrega: `llave_entregada` true/false + texto en
  observaciones. No se reescribe la recepción original.

**Estado al cerrar (3-sep, ~08:00):** tsc limpio · **421 pruebas** · verificación ESTÁTICA hecha
(componente en los 3 formularios, deuda en los 3, `llave_entregada` llega al insert y a la entrega,
`recepcionDelContrato` devuelve la más reciente). Se agregó en Motos la misma validación de llave
que en los otros dos formularios y el reset de la respuesta al cambiar el motivo. **✅ En `main` (`7c512ab`,
push 3-sep ~09:00)** · `vite build` OK · **verificado a 375px día y noche** con Chrome headless
(modal 360px, 312 útiles, cero desbordes en los 3 escenarios) porque el Browser pane estaba
bloqueado → [[verificar-ui-sin-browser-pane]]. ✅ **Mig 122 corrida** (3-sep, verificada: 2 columnas boolean nullable).
🔲 Primer uso real: Motos → Registrar novedad → responder las 2 preguntas y ver que nace la deuda.

## ✅ CONSTRUIDO 3-sep (mañana): el MOTOR de la lavada — mig 123 (commit `c8571e8`, SQL ✅ corrida: conteos 3·2·4·1)

Plan aprobado por el dueño con una pregunta previa: **con la moto retenida, la lavada va junto con
la multa ANTES de la semana** ("la moto se lavó porque se recogió: es un costo de la retención").
- `pagos.aplicado_lavada` (informativo) + 6 anclas en `aplicar_pago_confirmado` con conteo estricto
  (método 085): cobrar `multa → lavada → demás por antigüedad` (3 sitios) · anular al revés (2) ·
  retenida: `concepto in ('multa_recoleccion','lavada')` antes de las cajas (1) · anotar
  `aplicado_lavada = min(aplicado_deuda − aplicado_multa, lavada pendiente ANTES)` en las 4 salidas.
  Funciona SOLO porque la lavada va segunda — si el orden cambia, la cuenta miente.
- **Sin recálculo hacia atrás** (decisión mía, explicada): las lavadas viejas se pagaron con el
  orden viejo; inventarles cifra tocaría cajas ya cerradas.
- Espejo `repartoPago.ts`: `ordenarDeudasReparto`, `separarMultaYLavada`, `esLavada`,
  `deudasRestantes` en el resultado (para probar a cuál deuda llegó cada peso) · paso 0 de suspendido
  incluye la lavada · **6 pruebas nuevas, 427 en total, las 421 viejas sin moverse**.
- Pantallas: `CajaView` "🧼 De eso, lavadas: $X" bajo la línea de multas · `CobrosView` desglose del
  historial ("Deuda $X · de eso multa $Y y lavada $Z") y hoja detallada. `repartirPagoV2` no tiene
  llamadores en producción: es espejo/spec.
- Verificación: tsc + 427 pruebas + `vite build`. Lo visual (línea de caja) solo aparece con una
  lavada pagada de verdad después de correr la mig 123.

**Lo que NO se hizo a propósito:** el cobro de la llave en liquidación (sin valor) · `lineaTiempo.ts`
no modela recepciones, así que el rastro de la llave vive en la tarjeta de retenidas y en la ficha
de la moto, no en la línea de tiempo.

Ver también [[auditoria-subadmin-nuevos]] · [[regla-esencia-y-rastro]] · [[feedback-resumen-final-para-nino]].
