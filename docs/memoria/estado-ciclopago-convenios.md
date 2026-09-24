---
name: estado-ciclopago-convenios
description: "Estado del módulo cicloPago.ts (fuente única de lógica de pago) y los cambios a ModalConvenio y WizardContrato — Quincenal/Mensual, convenio obligatorio, recibo detallado"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

Trabajo completado el 3 jul 2026, commits `a7d65c3` y `39f4d39` en `main`.

## cicloPago.ts — fuente única de verdad

`src/utils/cicloPago.ts` es el módulo centralizado para TODA la lógica de ciclos de pago. Antes de agregar o modificar lógica de mora/prorrateo/período en cualquier vista, buscar ahí primero.

Funciones exportadas: `esDiaDePago`, `inicioPeriodoActual`, `proximoDiaPago`, `valorPeriodoReal`, `totalPagadoPeriodoActual`, `calcularEstadoCartera`, `calcularProrrateoInicial`, `estaEnProrrateo`, `formatDiaPago`.

Reglas de cálculo por tipo:
- **Semanal**: día de semana (Lunes=1 / Miércoles=3) — sin cambios respecto a lógica anterior
- **Quincenal/Mensual**: usa `contrato.dias_pago_mes: number[]` con `fecha.getDate()` + clamp de fin de mes (ej. día 30 en febrero → último día del mes)

## dias_pago_mes (migración 031 — aplicada ✅)

Columna `integer[]` en `contratos`. El usuario confirmó que la corrió ("listo ya lo corrí").

WizardContrato paso 1 (selector condicional):
- Semanal → botones Lunes / Miércoles (igual que antes)
- Quincenal → 2 date pickers con presets (5&20, 10&25, 15&30)
- Mensual → 1 date picker con presets

## Base inicial no editable (WizardContrato paso 1)

Ya no hay `<input>` para la base inicial. Se muestra como tarjeta de color de 2 líneas centradas:
- Línea 1: `$ X de $ Y` (lo que pagó vs lo requerido)
- Línea 2: `falta $ Z` (en amarillo) o `✅ suficiente` (en verde)

El valor siempre viene de `clientes.ingreso_inicial` (registro del cliente).

## ModalConvenio — siempre con meta

Rediseñado completo. Todos los convenios trabajan contra una meta total ("la idea de los convenios sí es llegar a la meta de pagar lo que deba").

Props nuevas: `metaFija?: number` (meta fija no editable), `motivoInicial?: string`, `obligatorio?: boolean` (oculta cerrar/cancelar).

Toggle "Fijar por N° de cuotas / Fijar por valor de cuota". Fórmula: `Math.ceil(meta / otro)`. Total nunca queda por debajo de la meta.

**Fix crítico**: el insert anterior usaba columnas inexistentes (`motivo`, `cuota_convenio`, `total_convenio`, `cuotas_totales`, `fecha_inicio`) — probablemente nunca guardaba en producción. Corregido.

## Convenio obligatorio cuando falta base inicial (WizardContrato)

Tras el insert exitoso del contrato en paso 1:
- Base suficiente → avanza directo a paso 2 (asignar moto)
- Base insuficiente → aparece `<ModalConvenio obligatorio metaFija={falta}>` sin poder cerrarlo. Solo avanza tras guardar.

**Pendiente de probar en real**: el usuario debe crear un contrato con base insuficiente y verificar que el modal aparece, guarda correctamente, y avanza al paso 2.

## Recibo detallado

`DatosRecibo` en CobrosView ampliado con: `debiaTotal`, `aplicadoTarifa`, `aplicadoDeuda`, `aplicadoConvenio`, `aplicadoSaldoFavor`, `pendienteDespues`, `convenioAbonado`, `convenioRestante`.

Sección "Detalle de su cuenta" en `#recibo-ticket` (impreso con `@media print`) y en `buildMsg()` (WhatsApp).

## Convenio "encima" + alivio de incluir la semana actual (8 jul 2026, commit `f5e5c08`→main `f419711`)
Modelo confirmado por el usuario: el convenio SIEMPRE va ENCIMA de la tarifa (paga tarifa + cuota del convenio hasta saldar — como su documento real "$X adicionales a su tarifa"). PERO al crear el convenio hay un **alivio de una sola vez**: casilla "Incluir la cuota de esta semana" → esa cuota se suma al total a financiar y **ese período no cuenta mora ni se cobra aparte** (queda dentro del convenio); arranca normal la próxima semana. NO es que descanse cada semana.
- **Mig ⚠️ REQUERIDA:** `alter table convenios add column if not exists cubre_periodo_hasta date;` — SIN ella NO se puede crear ningún convenio (el insert siempre manda esa columna).
- `cicloPago.calcularEstadoCartera`/`diasEnMora`: nuevo 5º param `periodoCubierto` → devuelve "al-dia" si true. Los 3 callers (CobrosView, InmovilizacionesView, useAlertas) computan `periodoCubierto = !!(convenioActivo?.cubre_periodo_hasta && >= hoy)` y lo pasan.
- El convenio se crea desde el **formulario inline de CobrosView** (ficha→Convenio), NO desde ModalConvenio (ese solo se usa en CobroDiarioView y en el wizard obligatorio). Se agregó la casilla en ambos. `crearConvenio` (useConvenios) acepta 8º param `cubrePeriodoHasta`.
- Convenio type: nueva prop `cubre_periodo_hasta: string | null`.

## Sesión 8 jul 2026 (parte 2) — convenio afinado + dinero en vivo + panel (todo en producción)
- **Alivio "incluir esta semana" ahora usa lo que FALTA del período** (`cuotaPendiente` = cuota − pagado), no la cuota completa. VICTOR pagó $100k → incluir suma solo $102k, total $821k (no $921k). La casilla solo sale si `cuotaPendiente > 0`. Commit `a523e30`.
- **Cuota ⇄ número de cuotas se calculan entre sí** en el form inline de CobrosView (toggle "N° de cuotas / Valor de la cuota"). El **sobrante queda en la última cuota** (`convUltimaCuota`). Muestra "N cuotas de $X · última: $Y · Total". `convCuotasCalc/convCuotaCalc/convTotal` derivados tras `cuotaPendiente`. Commit `c5afafc`.
- **Fecha límite automática**: useEffect avanza `convCuotasCalc` períodos con `proximoDiaPago` desde hoy → día de pago de la última cuota; editable. Monto a diferir se **precarga con la deuda** al abrir el form.
- **MoneyInput formatea EN VIVO** mientras se escribe (antes solo al salir del foco), preservando el cursor (`requestAnimationFrame` + conteo de dígitos). Aplica a TODOS los campos de dinero (todos usan MoneyInput). Los 2 `type=number` restantes son km, no dinero. Commit `753dd89`.
- **Panel de contrato con convenio arreglado** (bug de doble conteo): antes "Debe $921k" = cuota+conv+deuda completa. Ahora: con convenio, "a pagar este período" = cuota pendiente + cuota convenio (NO + deuda completa); la deuda se muestra como **saldo del convenio** (referencia). Si al día → "✓ Al día" / "Al día · convenio". Detalle muestra bloque "Próximo pago (cuota + convenio)". Fix en `totalPendiente` (detalle) y `debePagar` (Panel Hoy). Estilo UI actual intacto — **el rediseño visual completo (Claude Design) se hará DESPUÉS**, cuando la estructura/flujos estén listos (decisión del usuario). Commit `1bbfbed`. Mockup de referencia mostrado con visualize (no aplicado tal cual).

## Documento ACUERDO DE PAGO (PDF) — [[flujo-documentos-contrato-pdf]]
`generarHTMLAcuerdoPago(cliente, moto, deudas, convenio)` en useDocumentos.ts — calcado del doc real "Club Moteros de la Costa": tabla de deuda por concepto (mapa LABEL_CONCEPTO_DEUDA de ConceptoDeuda) + total (= convenio.deuda_total; la diferencia con las deudas registradas sale como "Cuota de período incluida") + compromiso "$cuota_por_periodo adicionales a su tarifa en N cuotas" + firma/huella del cliente (reutilizadas del registro). Se descarga en FichaClienteView tab Convenios (botón "⬇ Descargar acuerdo de pago (PDF)" con htmlAPdfBlob). **Sin probar con datos reales aún.**
