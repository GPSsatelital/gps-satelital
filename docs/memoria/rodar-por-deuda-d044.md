---
name: rodar-por-deuda-d044
description: "Módulo nuevo (6/7-oct-2026, D-044, mig 191): rodar al final del contrato el TIEMPO que debe un cliente con más de $700.000, con recargo, documento firmado y video. En producción; sin usar todavía con un cliente."
metadata:
  node_type: memory
  type: project
  originSessionId: ecbda5fc-4619-4e95-b4dc-d59ba138caf2
  modified: 2026-10-08T23:04:33.114Z
---

Diseñado con el dueño pregunta por pregunta la noche del 6-oct y subido la madrugada del miércoles 7-oct
(día de cobro) con su autorización expresa: *"hagamos todo hoy, debemos dejar todo listo y bien hecho antes
de la presentación"*. Reglas completas en `docs/DECISIONES.md` → **D-044**.

**Lo esencial:**
- Solo contratos Activos y Semanales que deban más de $700.000; una vez por contrato; permiso
  `rodar_por_deuda` = solo ADMIN_PRINCIPAL (Sergio después de la capacitación, desde Usuarios).
- Solo se rueda TIEMPO (semanas atrasadas, `tarifa_atrasada`, `migracion`) en semanas completas; repuestos,
  préstamos, daños, alquiler de prestada, multas y lavadas NO ("las deudas de repuestos no se ruedan").
- Recargo: hasta 4 rodadas una más; desde la 5ª una más por cada 2 completas (6→8, 8→11, 10→14).
- Lo atrasado del acuerdo se corre al final del MISMO acuerdo (`periodos_exonerados`).
- Si se va antes: la liquidación cobra lo rodado sin recargo (`rodado_pendiente_liquidacion` → useLiquidaciones).

**Cómo está hecho (para no romperlo):** la cuenta de antes y después la hace `zala.cuenta_contrato` (la de la
vitrina), simulando el contrato con las semanas corridas; no hay fórmula de plata nueva. Candado: si al correr
las semanas la cuota no baja EXACTO lo corrido, ese contrato no se rueda (así se detuvo RAMON, contrato pasado
de su total). El rastro en `contratos_auditoria` lleva "exoneradas N" en el formato que lee la nómina.

**Errores míos de esa noche:** en plpgsql, `text[] || 'literal'` revienta ("malformed array literal") — hay
que escribir `'literal'::text`; y la variable de un `for i in` vive solo dentro del for.

**Pendiente:** `docs/PENDIENTES.md` → P1 (primer uso con el dueño, video en celular sin probar, cédula
"POR DEFINIR" de EXT59H, marca en Reportes, pasar a 'saldado').

**8-oct noche — plan de 3 piezas presentado, ESPERA «1» (las tres) o «2» (solo 1 y 2).** El dueño pidió
guardar antes de responder. El plan completo, con dónde va cada cosa y qué es "terminado", está en
PENDIENTES → P1 → RODAR POR DEUDA. Lo que medí y no hay que volver a buscar:
- No hay ningún rodado hecho (tabla vacía): nada cambia la cuenta de nadie hoy.
- "Terminó de pagar" = `cajas_pagadas >= total_cajas` (igual que los dos modales de liquidación).
- Nada pasa un rodado a `cobrado_en_liquidacion` (hallazgo = pieza 3). Estados de `liquidaciones` en
  minúscula (`cerrada`, `anulada`, mig 155).
- Trampa de la prueba: el `numero` por defecto usa `nextval`, que NO se deshace → usar 'ROD-PRUEBA'.
- `comoVa()` de ReportesView también alimenta el informe de socios: la marca saldría ahí (declararlo). Ver [[capacitacion-7oct]] ·
[[permiso-rodar-tiempo]] · [[zala-vitrina-lectura]] · [[feedback-preguntas-sin-ventana]].
