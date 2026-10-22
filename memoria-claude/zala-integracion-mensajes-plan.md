---
name: zala-integracion-mensajes-plan
description: "Plan aprobado 8-sep-2026 para integrar MotoGestión con ZALA/Chatwoot. Fases 0, 1 (tubería única de envío), 2 (envío masivo desde el Panel Hoy) y 2b (los 10 textos aprobados, mig 135) HECHAS y desplegadas; migs 133, 134 y 135 corridas. Falta antes de prender: decidir el criterio de recolección, la contraseña de zala_lector, y que ZALA monte /api/enviar y registre los textos en Meta. Decisiones cerradas: el botón manda solo por ZALA; comprobantes siguen manuales; aprobación = permisos por persona; el número del funcionario vive en profiles.whatsapp."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-10T14:03:21.707Z
---

# Integración MotoGestión ↔ ZALA — plan aprobado (8-sep-2026)

## De dónde viene
El proyecto ZALA mandó su "Contrato con MotoGestión" (PDF, 8-sep). Lo analicé: 3 errores en su doc
(`empalme_cerrado` NO es señal de cuentas cuadradas — la señal es la prueba espejo; `contratos.en_lista_negra`
y `por_plantilla` **no existen**, la lista negra vive en `clientes.lista_negra`; `pagos.monto` es `pagos.valor`).
Reparto acordado con el dueño: **MotoGestión = cerebro (cuentas, reglas, tareas, registro) · ZALA = motor del
canal (Meta, horario Ley 2300, plantillas, leer comprobantes) · Chatwoot = bandeja para conversar.** No son lo mismo.

## Lo que encontré en el código (8 sitios que abren `wa.me`)
Panel Hoy (`CobrosView:1017`) abre WhatsApp y **anota "enviado" sin saberlo**; Inmovilizaciones (`:646`) y Cobro
Diario (`:277`) abren y **no anotan nada**; Alertas, recibo de campo y estado de cuenta mandan **texto escrito en el
código**, fuera de `mensajes_whatsapp` (Meta jamás los aprobaría). Las alertas (`useAlertas`, 19 tipos) se calculan
**en el navegador**: sin app abierta no hay quién decida nada → sin eso no puede haber notificaciones.

## La pieza clave: plantilla + variables, nunca texto final
La ventana de 24 h **la abre el CLIENTE cuando escribe** (no la empresa). Fuera de ella solo salen plantillas
aprobadas por Meta. Por eso MotoGestión manda `{plantilla, variables}` y ZALA decide (texto si ventana abierta,
plantilla si no); el cliente lee lo mismo. Reglas de Meta: variable ni al inicio ni al final, no dos pegadas,
**sin saltos de línea dentro de una variable** (obliga a rediseñar recibo y cuentas_pago), nunca vacía, UTILITY.
**Versiones = datos:** `mensajes_whatsapp.plantilla_meta` dice cuál está vigente; `gestiones_cobro.plantilla_usada`
congela la usada. Ninguna pantalla nombra una plantilla de Meta. Cambiar formato = editar una fila.

## Decisiones del dueño (8-sep) — NO re-preguntar
1. **El botón manda solo por ZALA** (mi recomendación aceptada): Chatwoot no rellena el cuadro por URL, un envío a
   mano no deja rastro, el masivo sería imposible, y la regla de 24 h solo funciona si lo manda ZALA. Al lado, enlace
   "ver conversación" a Chatwoot.
2. **Dentro de MotoGestión:** estado del último mensaje (llegó/leyó/falló), si respondió y su última frase, botones.
   La conversación completa queda en Chatwoot. **Cuánto se trae adentro sigue abierto** — depende de la API de ZALA,
   que aún no existe; no bloquea nada.
3. **Al de la moto retenida SÍ se le escribe** (gestionar cuándo la retira) → plantilla nueva `moto_retenida_v1`.
4. **Aprobación:** primero solo ADMIN_PRINCIPAL; después cada quien bajo su responsabilidad. **Sin cola nueva:** dos
   acciones en `acciones.ts` (`enviar_mensaje`, `enviar_masivo`) y el sistema de permisos por persona que ya existe.
   Todo envío guarda quién pidió, quién aprobó, qué contestó Meta.
5. **Comprobantes: NO entran a la app por ahora** (siguen manuales). ZALA pide **siempre placa + titular** (de un
   mismo número pagan dos motos), acusa recibo, y reenvía al encargado **en un solo chat** rotulado con moto/cliente/
   portafolio. Lo único nuestro: `profiles.whatsapp` (mig 132) + `encargado_id`/`encargado_whatsapp` en la vitrina.
   Reemplaza el `equipo.json` de ZALA (falló por una tilde). Si falta encargado o número → visible, nunca callado.
6. **Ventana de 24 h de los funcionarios:** cada uno saluda al número de ZALA en la mañana desde su WhatsApp asignado
   → su ventana abierta todo el día para recibir comprobantes. Será la primera tarea de "Mi día" (botón `wa.me` al
   número propio: seguro, es interno). Para clientes: **botones en la plantilla** ("Ya pagué") abren la ventana.
7. **Recibo:** acuse al llegar el comprobante (`acuse_comprobante_v1`, nuevo) ≠ recibo al confirmar (`recibo_pago_v1`).
   Desglose detallado = segundo mensaje libre solo con ventana abierta. **Foto del recibo impreso = `recibo_pago_v2`,
   después** (generar imagen + storage + URL). Estado de cuenta por WhatsApp: solo con ventana abierta, si no avisa.
8. **Mensaje de alertas** → `contacto_general_v1` sin el detalle variable (Meta no aprueba un cuerpo que sea una variable).
9. **Los textos del doc son borrador**: el dueño los ve "no del todo profesionales"; **va a pasar conversaciones reales**
   para sacar el tono (usar solo el tono, ningún dato de cliente queda escrito). **Verificar los 6 actuales contra
   Configuración**, no contra el código, antes de que ZALA los registre en Meta.
10. **Vienen después:** citación a revisión periódica (vehículo / eléctrico / GPS) — sin dónde leer la fecha aún.

## Las fases (orden aprobado)
0 ✅ `docs/PLANTILLAS-WHATSAPP.md` (10 plantillas, reglas de Meta, versionado, alcance de comprobantes).
1 ✅ **CONSTRUIDA 8-sep (tsc limpio, 532 tests, build OK) — pendiente de correr mig 133 y desplegar.** `useEnvioMensaje.enviar()`
  + `utils/mensajeria.ts` (13 pruebas: `normalizarWhatsapp`, `ordenarVariables`, `decidirCanal`, `diasTexto`) reemplaza los
  8 `wa.me` (Mis Visitas se deja: abre chat sin texto). Mig 133: `mensajes_whatsapp.plantilla_meta/variables/activa` + 5 claves
  nuevas (`moto_retenida`, `acuse_comprobante`, `recibo_campo`, `contacto_general`, `cuentas_pago`) sembradas SIN tocar textos;
  `gestiones_cobro.plantilla_usada/variables_usadas/mensaje_id/mensaje_estado/mensaje_motivo/aprobado_por`. Acciones
  `enviar_mensaje`/`enviar_masivo` sin default en ningún rol (no toca `_acciones_default` SQL). Edge Function `enviar-mensaje`
  (permiso vía `puede_accion`, secretos `ZALA_URL`/`ZALA_LLAVE`, 503 si faltan). `manage-users` acepta/lista `whatsapp`.
  Configuración muestra plantilla Meta + variables; Usuarios: campo WhatsApp (editar y crear) + marca "Sin WhatsApp registrado".
  Recibo: si el pago está Pendiente manda `acuse_comprobante`, si Confirmado `recibo` (corrección del dueño). Interruptor
  `VITE_ZALA_ENVIO=on`; sin él, `wa.me` con `mensaje_estado='abierto_whatsapp'` (honesto). Con él y sin permiso: bloqueado, sin
  respaldo. **Hallazgo:** los textos reales de la base (dia_pago/gabela/mora, editados 7-jul) tienen otra voz (tuteo, emojis) —
  los borradores del doc hay que reescribirlos con ese tono; `recoleccion`/`recibo` aún dicen "GPS Satelital".
  ✅ Mig 133 corrida (10 claves; los textos del 7-jul intactos) · ✅ desplegada en `a1437ee` · ✅ verificado en navegador a 375px:
  Usuarios (campo en crear y editar, 11 marcados "Sin WhatsApp") y Configuración (10 mensajes con "Plantilla en Meta").
  El WhatsApp se LEE y GUARDA directo de `profiles` (como `acciones`, policy mig 049) para no depender de la Edge Function.
  🔲 Edge Functions SIN redesplegar (el dueño no tiene el CLI `supabase`; la otra vez pegó el código en el panel): `manage-users`
  solo hace falta para que `create` guarde el número; `enviar-mensaje` solo cuando ZALA conecte. Alternativa: `npx supabase`.
  ✅ WhatsApp de los 4 encargados registrado por el dueño el 8-sep (verificado: 0 contratos con encargado sin número;
  Emiro y Fredy comparten 3105522232; Ángela, Johan, Julio y el ANALISTA sin número). ⚠️ HMR de `useGestiones.ts` deja la app en blanco en dev ("cannot add
  postgres_changes callbacks after subscribe" del `createTableStore`) — recargar; no pasa en producción.
2 ✅ **CONSTRUIDA 8-sep** — envío masivo desde el Panel Hoy: el grupo lo definen el chip (Recolección/Mora/Gabela/Pagan hoy)
  y el buscador (sin casillas por tarjeta, a propósito); botón "📨 Enviar mensaje a los N de …" → `ModalEnvioMasivo` (lista con
  nombre · placa · plantilla · valor, confirma, manda uno por uno con 250 ms, resultado por fila, resumen). Cada uno recibe la
  clave de SU balde (`claveParaBalde`, mismo mapa que `plantilla_hoy`). No repite a quien ya tiene `mensaje_recordatorio` hoy.
  Solo `puede("enviar_masivo")` (hoy solo AP) y **solo con `VITE_ZALA_ENVIO=on`** — sin ZALA el botón se ve deshabilitado con
  el porqué. El scope del SUBADMIN ya viene filtrado en `resumenContratos`. 534 tests. **Desplegada en `bc7d556`**;
  verificada a 375px (113 de 181 sin mensaje hoy, 68 ya con mensaje — los botones individuales ya dejan rastro).
2b ✅ **LOS 10 TEXTOS, APROBADOS Y VIVOS (mig 135 corrida 8/9-sep).** Verificado: 10 filas al día,
  ninguna tutea, orden de `variables` correcto. Voz cerrada con el dueño: **siempre de usted**, voz
  de empresa por áreas (sin firma personal), sin coloquialismos, "realizar" mejor que "hacer", "el
  día de hoy" y no "hoy" a secas. Detalles de negocio metidos en los textos: **la gabela OFRECE** el
  día ("le podemos dar"), **la mora ya no da plazo** (informa + advierte que el apagado y la
  recolección pueden pasar en cualquier momento), **la retenida invita** a volver a rodar sin
  imponer la cifra, **el nombre va corto** ("Jose Alberto") y **los días van en DOS cifras**
  (`{dias}` desde el último pago · `{vencida}` lo que lleva vencida la cuota) más **`{dia_pago}`**
  con el día de ESE cliente ("los lunes", "los días 15 y 30 de cada mes") en vez de la frase falsa
  "los pagos son los lunes". Todo el detalle en [[zala-voz-y-casos-reales]].
  **Regla nueva de la tubería:** un mensaje al que le falte un dato **no sale por ningún canal**
  (antes el respaldo `wa.me` lo mandaba con el hueco); explica en palabras qué falta. Caso que la
  obliga: el que nunca registró un pago y el texto nombra "su último pago" → ese va para llamada, y
  la vitrina lo saca de la tanda. Commits `38228ad`, `99998d0`, `5727725`, `adf3348`; 541 pruebas.
3 🔲 Pendientes en el servidor (tabla con dueño/vence/estado; empezar por plazo y promesa) + panel "Mi día".
4 🔲 Ver la respuesta del cliente (API de ZALA + decisión pendiente).
5 🔲 Notificaciones + APK (solo funcionarios, todos Android; socios iPhone → web en pantalla de inicio — ojo: el
  `apple-touch-icon` es SVG y iOS lo ignora, hace falta PNG). Antes: cascarón de prueba (fotos, GPS, botón atrás).

## ✅ 9-sep — TEXTOS DEFINITIVOS y ZALA CONECTADA (migs 137 · 138 · 139 corridas)

**ZALA ya lee la vitrina.** Sus dos pruebas pasaron (323 · permission denied), leyeron el
diccionario entero y su `/api/enviar` ya existe — en `https://chat.clubmoteros.com`, no en la
dirección que decía el plan. **Nunca tuvieron la `service_role`**: entraban con `anon` + la sesión
del dueño, y ese acceso viejo se retira ahora.

- **mig 137:** `cobro_mora_v1` estaba OCUPADO en Meta (otra plantilla aprobada, con otro texto) →
  la nuestra es **`cobro_mora_v2`**. Meta no deja repetir nombre e idioma ni reusar uno borrado en
  un mes. Más las 13 columnas que ZALA veía pero nadie había documentado (por nuestra regla, para
  ella no existían).
- **mig 138 — `cliente.cuenta_confiable`:** a quién se le puede decir la CIFRA. `true` por tres
  razones, y las tres significan lo mismo (**el cliente ya vio ese número**): nació en MotoGestión ·
  tiene acuerdo firmado · **tiene el empalme cerrado**. Medido: **178 sí, 145 no** de 323. El
  migrado sin ninguna recibe el mensaje **sin número** — y eso le da al funcionario un motivo
  concreto para cerrar empalmes: cada uno que cierre, ese cliente empieza a recibir su cifra solo.
  Historia: el dueño primero dijo "arrancar con un grupo chico" (49 sin convenio), después decidió
  incluir los convenios *porque se firman con el cliente*, y al final también los empalmes cerrados.
- **mig 139 — la regla del emoji:** uno al inicio en los **amables** (día de pago 🏍️ · recibo ✅ ·
  recibo de campo 🧾 · comprobante 👍 · cuentas 🏦) y **ninguno** en mora, recolección, moto
  retenida, gabela y contacto general: ahí un emoji le quita peso al mensaje que necesita tenerlo.
  Va **antes del saludo**, así ninguna variable queda al inicio.
- **Los 3 cambios de redacción del dueño:** "Le recordamos que hoy es su día de pago…" · "Su
  **plazo** de la moto venció ayer" · "Le recomendamos colocarse al día lo más pronto posible".
- 🔴 **Todo esto se cerró ANTES de que ZALA registrara en Meta, a propósito: una plantilla aprobada
  NO se edita** — hay que crear otra versión con otro nombre y esperar aprobación otra vez.
- **`origen` en cada envío** (`individual` | `masivo`): decisión del dueño — los individuales salen
  directo, los masivos entran a su cola de aprobación, y cuando el sistema esté consolidado los
  masivos también saldrán directo (bandera del lado de ellos, nosotros no tocamos nada).
  Lo pone `useEnvioMensaje`, `ModalEnvioMasivo` manda "masivo", la Edge Function lo reenvía.

**Chip `⚠️ Empalme` en Cartera** (`4abf06c`), nacido de mirar la tanda real: en RECOLECCIÓN son
mayoría los que NO pueden recibir la cifra (26 sin contra 21 con) — los que más deben son los
migrados viejos, al revés de lo que conviene. Y estaban concentrados: **16 de los 30 primeros son de
un solo encargado**, o sea que es una tarea de una semana, no un problema repartido. Los 30 primeros
suman **$14.470.500**.
El chip lista a los que ESPERAN el empalme para recibir su número: migrado ∧ sin empalme cerrado ∧
**sin convenio** — la misma cuenta que `cuenta_confiable = false` (144 hoy; app y vitrina coinciden).
🔴 **El `!convenioActivo` no sobra:** hay 69 con empalme pendiente que YA reciben la cifra porque el
convenio lo firmaron ellos; sin ese filtro el chip marcaba 214 y le decía al funcionario que estaban
bloqueados cuando no lo estaban (se vio al probarlo en el navegador, no en el código).
Ordenado por PLATA (no por días: es lista de trabajo), amarillo (no rojo: no es alerta), con una
línea que explica qué se hace y qué gana el cliente. Se vacía sola.

## ✅ 9-sep noche — EL CANAL QUEDÓ CONECTADO Y PROBADO DE PUNTA A PUNTA

- **Edge Functions desplegadas** (`npx supabase login` lo corrió el dueño una vez; el token queda en
  su equipo y desde ahí despliego yo sin pedirle nada): `enviar-mensaje` y `manage-users`.
  🔴 **La función vieja `create-user` seguía VIVA desde junio sin código en el repo** — se borró tras
  verificar que ninguna línea la llamaba. Era una puerta abierta que nadie podía revisar.
- **Secretos puestos por el dueño:** `ZALA_URL = https://chat.clubmoteros.com` y `ZALA_LLAVE`.
  ⚠️ **La llave pasó por el chat: hay que pedirle a ZALA una nueva cuando todo esté andando.**
  Verificación sin ver valores: `npx supabase secrets list` (muestra nombres y huellas).
- **`VITE_ZALA_ENVIO=on` en Vercel** + redespliegue. Cómo saber si tomó, sin mandar nada: la barra
  de envío masivo del Panel Hoy deja de decir *"Canal oficial aún no conectado"*.
- 🔴 **Su API lee `tanda` (booleano), no `origen`.** Se corrigió en la Edge Function; sin eso TODO
  les habría llegado marcado como envío suelto y los masivos se saltarían la aprobación del dueño.
  También distingue ahora: 400/401 = petición mal armada (error nuestro, no se anota gestión) vs
  200 con `ok:false` y estado `fallo` = sí hubo envío y su resultado va al historial del cliente.
- ✅ **PRUEBA REAL (10-sep 00:39–01:17):** seis intentos quedaron en `gestiones_cobro` con
  `mensaje_estado = fallo` y motivo *«cobro_mora_v2» no está aprobada por Meta*. Eso demuestra el
  camino completo —app → función → llave → ZALA → validación → respuesta— **sin que a ningún
  cliente le llegara nada**. Solo falta que Meta apruebe.
- 🔴 **El botón se había quedado MUDO** (`8fd9755`): mientras el respaldo abría WhatsApp, esa ventana
  ERA la señal; con el canal oficial el envío ocurre por debajo y solo se avisaba cuando faltaba
  número o permiso. El dueño: *"le doy click y no me aparece nada"*. Y en los datos se ve el daño:
  un cliente con DOS intentos a 11 segundos, alguien tocando otra vez porque no veía respuesta.
  `textoDelEnvio()` en `utils/mensajeria.ts` = una sola forma de decirlo para las 6 puertas; Panel
  Hoy con aviso flotante, las demás con aviso normal. **Un mensaje a un cliente no puede salir en
  silencio.**

## 🔴 Antes de prender el envío (cierre del 8/9-sep)
1. ✅ Criterio de recolección → [[bucket-recoleccion-cuenta-dias-equivocados]]. ✅ Contraseña de
   `zala_lector` puesta y candado verificado. ✅ ZALA conectada y leyendo.
2. 🔲 **Que Meta apruebe las 10 plantillas** (lo hace ZALA leyendo `zala.plantillas`; nunca
   transcritas). Los valores salen de `zala.cliente`: nombre = `cliente_corto`, valor =
   `debe_hoy_texto`, dias = `dias_texto`, vencida = `vencida_texto`, dia_pago = `dia_pago_frase`.
   **Si un campo viene vacío, ese cliente no se envía.**
3. 🔲 **El dueño corre `npx supabase login` UNA vez** y yo despliego `enviar-mensaje` y
   `manage-users`; se cargan los secretos `ZALA_URL` (= `https://chat.clubmoteros.com`) y
   `ZALA_LLAVE`; se prende `VITE_ZALA_ENVIO=on` en Vercel.
4. **Chico:** alinear el formato de la plata ("$ 685.000" en la vitrina vs "$685.000" en la app).

**Why:** el dueño quiere todo desde MotoGestión, con rastro real de quién hizo qué, y sin cosas de más. La APK sin
pendientes en servidor no notifica nada; los comprobantes en la app se dejaron para después a propósito.
**How to apply:** no reabrir las 10 decisiones; Fase 1 no depende del texto final de las plantillas, solo de la
estructura. Ver [[zala-vitrina-lectura]] (mig 132) y [[regla-esencia-y-rastro]].
