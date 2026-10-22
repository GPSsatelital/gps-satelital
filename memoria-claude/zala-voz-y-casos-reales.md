---
name: zala-voz-y-casos-reales
description: "8-sep-2026: el dueño pasó 4 conversaciones reales de WhatsApp para sacar la voz y los casos que ZALA enfrenta. Resultado: docs/GUIA-CONVERSACION-ZALA.md (17 casos, siempre/nunca, columnas de la vitrina por caso, 6 preguntas al dueño) y la versión 2 de los 10 textos en docs/PLANTILLAS-WHATSAPP.md (tuteo, Bendiciones, firme). Regla: ningún dato de cliente en documentos ni memoria."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-09T04:54:44.257Z
---

# La voz de Club Moteros y los casos reales (8-sep-2026)

## Qué pasó
El dueño pasó 4 exportaciones de chats de WhatsApp (agosto–septiembre 2026) "para que veas los
casos reales a los que la IA se va a enfrentar": la atención actual "le falta contenido y
profesionalismo natural; que sientan que hablan con una persona real y muy profesional, respetando
los procesos y políticas de la empresa". Se leyeron completas, **se extrajo solo tono y situaciones,
y se borraron los archivos temporales**. Ningún nombre, placa, teléfono ni cuenta quedó escrito.

## Lo que mostraron (lo importante)
1. **"¿Cuánto debo?" es la pregunta más repetida y la peor respondida** ("estás debiendo mucho
   más", "ven a la oficina", o silencio). Es exactamente lo que `debe_hoy_texto` +
   `debe_hoy_detalle` resuelven. Nada vale más para ZALA que responder esa cifra.
2. **El apagado llega sin aviso previo ese día** → conflicto (cliente en la vía con pasajero, moto
   que "prende y se apaga" por batería). El mensaje de mora debe avisar con hora.
3. **Los clientes ya mandan placa + nombre con la foto**; un recibo con la placa mal (una letra)
   descuadró dos semanas → ZALA debe comparar la placa leída con la del contrato.
4. **La voz real es tuteo cálido + "Bendiciones" + regla firme** ("los pagos son los lunes y hoy
   es martes"; "una semana completa no, uno o dos días"). Mis borradores en usted formal eran la
   voz equivocada. Lo que NO es la voz: "peor las penas", "el tiempo es suyo caballero", 😑.
5. Casos que se repiten: pagar mañana (apps pagan martes / festivo), mándame el Nequi, mitad
   Nequi mitad efectivo, acuerdo de pago, abonos parciales ("es un avance" vs "no cubre ni una
   semana"), "denme una semana", enfermedad (piden incapacidad), comprobante a otro número,
   "¿quién es mi administrador?", moto que no prende tras el encendido, revisión periódica.
6. **Multa de inmovilización = $30.000 SIEMPRE** (dueño, 8-sep); solo varía si toca salir de la
   ciudad. Mi deducción "$35.000 = 20 + 15" era errada. ✅ Verificado: `MULTA_RECOLECCION = 30000`
   en `utils/inmovilizacion.ts` — el sistema cobra bien. CLAUDE.md ya corregido a $30.000.
7. Horarios dichos en los chats (sin confirmar como regla): oficina 8–12 y 2–5; "hasta las 3
   entran los pagos al sistema" / "después de las 3 no hay quien encienda la moto".

## Las 6 reglas — respuestas del dueño (8-sep, noche)
1. **Hora límite = presión, no regla.** Lo que importa es que pague hoy. ZALA no dice "después de las 3 no entra".
2. **Plazo máximo 1–2 días, solo el encargado.** Confirmado.
3. **Abonos parciales: sí, siempre** — y en el MISMO mensaje se le dice cuánto le falta y que sigue en
   mora hasta completar (ZALA lo hace con `debe_hoy`).
4. **Incapacidad = solo para el archivo — CONFIRMADO.** No cambia la cuenta. **La salida real que
   ZALA sí puede ofrecer: dejar la moto guardada en la empresa; las semanas COMPLETAS guardadas se
   ruedan** (entrega temporal + rodar períodos completos, ya existe).
5. **Firma: NO.** El bot habla como EMPRESA y por ÁREAS (cartera, caja, taller, zona): profesionalismo,
   que no le carguen la culpa al administrador, y que el funcionario pueda pedir tiempo cuando depende
   de otra área. **La persona se presenta con nombre y área solo cuando toma la conversación** desde
   Chatwoot. **Nunca coloquialismos** (manito, dale, porfa, chance); correcto y sencillo. Tuteo se conserva.
6. **Aviso del apagado — acordado:** "tienes hasta hoy; después el sistema puede apagar en cualquier
   momento, y si en la hora siguiente no hay pago ni respuesta, se procede a recogerlo". Sin "chance"
   ni "última oportunidad": **el apagado no es la última instancia; la recolección sí** (aviso →
   apagado → 1 h → retener). Textos de mora y recolección ajustados en el doc.

## 🔴 Regla final del dueño (8-sep, noche): SIEMPRE DE USTED
"Cambia a que no tutee sino que siempre hable con respeto hacia usted." Los 10 textos v2 y todas las
respuestas modelo de la guía van de usted. Mig 135 (`135_textos_plantillas_v2_usted.sql`) pone los 10
textos definitivos en `mensajes_whatsapp` y corrige `variables` de recibo/recibo_campo — **correrla =
aprobarlos**. ✅ **El dueño la corrió el 8-sep**: 10 filas actualizadas, ninguna tutea, orden de
variables correcto. Los textos del 7-jul (que tuteaban) quedaron reemplazados. Falta la **mig 134**.

## Los 5 ajustes finales del dueño (8-sep, cierre) — commit `38228ad`
1. **El nombre, corto:** "Jose Alberto", no "JOSE ALBERTO DORIA RODRIGUEZ". Dos primeras palabras,
   mayúscula inicial, las partículas (de/del/la) no cuentan. `nombreCorto()` (app) y
   `zala.nombre_corto()` → `cliente_corto` (vitrina) son **espejo: se tocan los dos o ninguno**.
2. **Dos cifras de días, marcadas** (él eligió "las dos" tras ver la trampa del abono parcial):
   `{dias}` = desde su último pago registrado — la reinicia un abono; `{vencida}` = lo que lleva
   vencida la cuota — esa no. Ejemplo: abonó ayer y debe 3 semanas → "hace 1 día / 16 días vencida".
   Las dos viajan con la palabra adentro ("20 días"), Meta no la deja afuera.
3. **El plazo se ofrece SOLO en la gabela** ("le podemos dar el día de hoy"). **En mora ya no se da
   más tiempo**: se informa el estado + advertencia de que desde ese día el apagado y la recolección
   pueden pasar en cualquier momento + "póngase al día para seguir rodando tranquilo".
4. **Moto retenida: invitar, no imponer.** "Queremos verlo rodando nuevamente… cuéntenos cómo desea
   proceder"; la plata se conversa en la oficina. Ya no lleva `{valor}`.
5. **Palabras:** "realizar" mejor que "hacer"; "el día de hoy", no "hoy" a secas.

Dos decisiones mías dentro de esto, para revisar: se quitó **"Los pagos son los lunes"** del texto
de mora (falso para miércoles/quincenales/mensuales), y **un mensaje al que le falte un dato ya no
sale por ningún canal** — antes el respaldo por `wa.me` lo mandaba con el hueco. Caso que obliga:
el que **nunca registró un pago** (el texto nombra "su último pago"): la app lo bloquea con aviso en
palabras y la vitrina lo saca de la tanda (`plantilla_hoy` null + `cobro_automatico` false).

## Lo entregado
- `docs/GUIA-CONVERSACION-ZALA.md`: la voz (8 reglas), siempre/nunca, **17 casos** con respuesta
  modelo + columna de la vitrina + a quién escala, tabla dato→columna, **6 preguntas al dueño**
  (hora límite, plazo máximo, abonos, incapacidad, firmar con el encargado, aviso previo al apagado).
- `docs/PLANTILLAS-WHATSAPP.md`: **versión 2 de los 10 textos** con la voz real; `recibo` y
  `recibo_campo` cambian el orden de variables (al aprobar: update de 2 filas en `variables`).
  Recomendación fuerte: `{encargado}` en dia_pago/mora/moto_retenida.
- Pendiente de código chico: `cuentas_pago` debe mandar `{cuentas}` en una sola línea en
  `variables` (Meta) y con viñetas en `texto` (ventana) — hoy van iguales.

**Why:** ZALA solo suena real si copia la voz que ya tiene la empresa y responde la cifra exacta;
sin la guía, la IA improvisa plazos, cifras o tonos que la empresa no usa.
**How to apply:** los textos v2 esperan aprobación del dueño; después van a `mensajes_whatsapp`
(Configuración) y ZALA los registra en Meta. Ver [[zala-integracion-mensajes-plan]].
