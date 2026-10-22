---
name: fix-gabela-dia0-sin-commitear
description: ✅ RESUELTO y desplegado — fix gabela día-0 + Diario meses=0 + auditoría de dinero (5 contratos camino-viejo reparados). Firma_cliente = sin acción.
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

✅ **TODO DESPLEGADO** (commit "fix: contrato Diario (meses NOT NULL) + estado 'gabela' no debe salir el mismo dia de pago", main = rama).

## Fixes desplegados (15-jul)
1. **Gabela día-0:** `estadoCarteraV2` marcaba "gabela" con 0 días = el MISMO día de pago. Corregido a secuencia clásica: día 0 = **al-dia** (paga hoy) · día 1 = gabela · 2+ = mora. Nuevo helper `prorrateoExigibleHoy()` (el prorrateo/Caja 0 no se exige antes de `fecha_inicio_cajas`). Verificado a mano con los 6 casos reales: JOSE ÁNGEL/JONATAN (prorrateo vence hoy) → paga hoy; SERAFIN/KEVIN/WILMER (venció Lun) → mora.
2. **Contrato Diario reventaba:** el wizard mandaba `meses=null` pero la columna es NOT NULL → error al crear. Ahora manda `0` (Diario no tiene plazo). Caso YORDAN.
3. **Resumen de entrega:** "Ahorro inicial $510.000" → "Entregó al iniciar $510.000" + "Base de ahorro $308.000". Rótulo "🎫 Primera semana adelantada" en el pago adelanto_base.

## Los 5 contratos "nacidos por el camino viejo" — ✅ REPARADOS por SQL
JONATAN (IGA80I), JOSE ÁNGEL (IGA82I), SERAFIN (IGC39I), KEVIN (IGC45I), WILMER (IGC41I): creados 9-11 jul ANTES del wizard v2 (motor_v2=false, sin cajas, 4 con ahorro inflado a $510k). Reparados: motor encendido, prorrateo día a día, apertura $308k, pago interno adelanto_base → ahorro $334k. El wizard YA crea bien (ESMEIRO 14-jul lo prueba) — grupo cerrado.

## Auditoría de dinero — 4 chequeos SQL (corridos 15-jul, en el historial del chat)
#1 pagos descuadrados · #2 convenios deuda sin marcar · #3 adelantada sin contar · #4 ahorro descuadrado. Solo #4 encontró los 4 inflados (ya reparados). Reusar estos chequeos periódicamente.

## firma_cliente = "falta firma" — SIN ACCIÓN (falsa alarma)
Se investigó marcar `firma_cliente=true` masivo, pero al ver la pantalla real: el letrero "⏳ Falta firma" **solo aparece en contratos "En proceso"** (donde ES correcto). Los Activos/migrados con firma_cliente=false NO muestran el letrero → no molesta. NO se corrió el UPDATE masivo (habría tocado 71 filas sin razón). Bien que el usuario frenó.

## Confirmado por el usuario
- ✅ mig 054 corrida · ✅ contrato Diario ya se puede crear · ✅ botón regenerar documentos funcionó.

## Pendientes (blindaje del motor)
1. **Batería de pruebas automáticas de `cicloPago.ts`** — comprometida como respuesta a "¿por qué siguen pasando estas cosas?" (funciones puras; testear día 0/gabela/mora/prorrateo/convenio/migrado antes de cada deploy). No hay runner en el proyecto (probablemente vitest).
2. **Panel "Auditoría de dinero" en Reportes** (solo ADMIN): los 4 chequeos a un clic.
3. Verificar en navegador: YORDAN Diario, JOSE ÁNGEL "paga hoy". Portal socio + migración COSTA diferidos.
