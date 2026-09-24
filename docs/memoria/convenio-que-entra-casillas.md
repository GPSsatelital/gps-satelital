---
name: convenio-que-entra-casillas
description: "7-sep-2026 (mig 128): el total del acuerdo de pago ya NO se escribe a mano. La base dice qué entra (rpc convenio_que_entra), el formulario lo lista con casillas por deuda, el total se suma solo, y el trigger se niega a firmar por menos de lo que envuelve. Nace del caso ESTARLIS ($368.000 pactado, $563.000 adentro). Regla corregida: 0 semanas financiadas = ninguna marcada."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-07T17:35:35.025Z
---

# El acuerdo se suma, no se escribe (mig 128, 7-sep-2026)

## De dónde viene
ESTARLIS CHIQUILLO: Lumar firmó por $368.000 y el trigger metió $563.000 (2 semanas $250.000 +
migración $313.000). Se corrigió a mano (ampliado a $563.000, 6 cuotas, vence 19-oct, auditado).
El dueño preguntó lo de fondo: *"¿por qué se puede escribir un valor a mano?"* → *"directamente por
el convenio creo que no; las deudas nacen por donde se crean las deudas."*

## Cómo quedó
- **`public.convenio_que_entra(contrato, cubre_hasta)`** (rpc, security invoker): semanas que la
  base va a asumir + deudas pendientes (con id, concepto, descripción, monto, fecha) + lo que hay
  en otro convenio. **La pantalla le pregunta a la base**; no calcula por su lado.
- **`public.convenio_semanas_que_entran(c, cubre_hasta)`**: la cuenta de semanas sacada del
  trigger. Regla única: entran las cajas que EMPIEZAN antes de `cubre_periodo_hasta`
  (`cajas_exigidas(c, cubre − 1)`); **NULL = ninguna**. Antes la rama `else` marcaba todas las
  exigidas menos la actual (sobre-marcaba al financiar 1 de 3, y con 0 marcaba igual). Medido antes:
  solo 2 de 44 sin `cubre` habían marcado por esa vía (el defecto de agosto ya conocido).
- **`convenios.deudas_incluidas uuid[]`**: la base marca `en_convenio` SOLO esas. `null` = todas
  (acuerdos viejos / rutas que no manden lista). El formulario manda siempre la lista (vacía si
  ninguna).
- **Cinturón** en `convenio_marca_contemplado` (AFTER INSERT): si Σ(semanas + deudas envueltas) >
  `deuda_total` → `raise exception` con el desglose → no queda ni el acuerdo ni las deudas tocadas.
  El renglón de sobrante se llama ahora "Monto pactado sin deuda registrada (ver motivo)".
- **ModalConvenio**: se fue el `MoneyInput` del monto. Lista "Qué entra al acuerdo": semanas
  (bloqueadas, según el selector), deudas con casilla (todas marcadas; desmarcar = por fuera, con
  aviso), y el monto del sistema (solo wizard, `metaFija` bloqueado). Total = `sumarLoQueEntra` ·
  botón "Firmar acuerdo por $X" · `cubre_periodo_hasta` guardado = el mismo con que se preguntó.
  Inmovilizaciones ya no pasa `metaFija` (la multa nunca está: el botón sale con la multa pagada).
  Wizard sigue igual (`metaFija` + `metaBloqueada` + `sinFinanciarSemanas`).
- `utils/convenioQueEntra.ts` (+10 pruebas: ESTARLIS, JOSE, base inicial, casillas, cinturón).
- Mig 128 trae un candado de arranque: verifica con `pg_get_functiondef` que la función viva sea la
  de la 127 (marca `app.fuente_caja` + `convenio_id = new.id`) antes de reescribirla.

## Verificado (7-sep)
tsc · 504 pruebas · build · mig 128 corrida: columna 1, funciones 1/1, los 12 acuerdos del 4-sep
dan "igual" (la función nueva cuenta las semanas igual que lo firmado) · rpc para EFREN YAL56H ·
en el navegador a 375px con EFREN: semanas 28 (faltaba $62.000) + 29 ($202.000) + migración
$161.500 = **$425.500**; sin la deuda $264.000 (aviso "por fuera"); con 0 semanas $161.500; casilla
medida ENCIMA con `elementFromPoint`; cerrado sin firmar.

## Pendiente
- 🔲 Fila `deudas_incluidas` en `zala.diccionario` (vista convenios, `zala_lo_dice = no`).
- 🔲 Primer acuerdo real firmado con la ventana nueva: revisar que nazca con partitura, cajas
  'convenio' y `deudas_incluidas` lleno.
- El tema que sigue (dueño): [[deudas-etiquetadas-a-donde-va-la-plata]].

**Why:** una etiqueta escrita a mano puede quedar corta y la plata se pierde en silencio; sumando
lo que entra, no existe etiqueta aparte del contenido.
**How to apply:** cualquier puerta nueva que cree convenios manda `deudas_incluidas` y respeta el
rpc; si el cinturón salta, el error de la base dice exactamente cuánto falta.
