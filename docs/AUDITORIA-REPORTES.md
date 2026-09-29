# Auditoría del módulo Reportes

Pedido del dueño (29-sep-2026): *"que todo lo que pase o se haga ahí, todo lo que muestre sea veraz y
efectivo"*. Notaba filtros que no respetan las fechas y cifras que no coinciden al cambiar filtros o
tocar botones.

**Método:** leer de dónde sale cada número en `src/pages/ReportesView.tsx` y medirlo contra la base
con los datos reales (sesión del dueño en el navegador, mismas funciones de la app, consultas
paginadas). La verdad de "en mora" y "días de mora" es la de Cartera, el Panel y ZALA
(`calcularEstadoCartera` / `diasEnMora`, espejo `zala.cliente`).

Bloque 1: pestañas de plata (Resumen, Por admin, Por grupo, Cartera, Convenios, Nómina, Exportar).
Bloque 2 (pendiente): Visitas, Flota, Guardadas, Entregas.

---

## Bloque 1 — medido el martes 29-sep-2026

Verificado antes: el módulo SÍ carga todos los pagos (3.332; `createTableStore` pagina de a 1.000).
Los estados de moto en la base van sin tilde (`Fiscalia`, `Garantia`), igual que el código: no hay
defecto ahí.

| # | Gravedad | Lo que muestra Reportes | La verdad (medida) |
|---|---|---|---|
| 1 | Grave | "En mora" = **187** contratos (Recaudo por grupo, pestaña Cartera, impresión). Cuenta "más de 2 días desde el último pago". | **65** en mora (Cartera, Panel, ZALA). 135 que Reportes marca en mora no lo están; 13 que sí lo están, Reportes no los ve. Viola la regla de las DOS CUENTAS de días. |
| 2 | Grave | Aviso rojo: "**50** contratos en mora crítica (+7 días) — requieren recolección". Cuenta "más de 7 días desde el último pago". | La cola real de Recolección tiene **58** (más de 3 días con la cuota vencida, regla del 9-sep). No son los mismos contratos. |
| 3 | Grave | Por admin / Por grupo / Exportar / PDF: al cambiar la fecha, "Al día", "% al día" y el ranking de cobradores **no cambian**. Este mes: 209 al día (77%), ranking 94·91·71·45. Mes anterior: **idéntico**. | El estado sale siempre de HOY (`calcularEstadoCartera(..., hoy)`). Solo cambian el recaudo y el reparto parcial / no pagó, que mezcla el estado de hoy con la plata del período. |
| 4 | Grave | Tres "recaudado" distintos para septiembre: Resumen **$213.572.302** · Por admin / Por grupo **$212.537.102** · suma de "Recaudo por grupo" **$200.275.102**. | Entraron $213.572.302. A los grupos les faltan **$13.297.200**: $12.262.000 de clientes con contrato suspendido (pagan para recuperar la moto), $724.200 de cancelados, $311.000 de finalizados. A Por admin le faltan los $1.035.200 de cancelados y finalizados. |
| 5 | Media | Dos comparaciones "vs anterior" para el mismo mes: Resumen "▲15%" (agosto completo, $185.895.500) y Por admin "▲28%" (1 al 29 de agosto y solo contratos de hoy, $166.397.500). | Una sola comparación, con la misma regla. |
| 6 | Media | "% al día": pantalla **77%** (209 de 273, sin retenidas); PDF gerencial y hoja Resumen del Excel **64%** (209 de 327, con retenidas). | Un solo porcentaje (el de la pantalla, sin retenidas, es la regla del 22-ago). |
| 7 | Media | "Días mora" en Por admin, Por grupo, antigüedad de la mora y Excel = días desde el último pago. | De los 65 en mora, en **53** el número no coincide con Cartera. Ej.: LUIS DAVID JIMENEZ (RMZ63H) reporte 4 días, real 19; FRANCISCO MARTINEZ (IGC38I) reporte 11, real 7. |
| 8 | Media | Los botones de fecha salen en TODAS las pestañas. | Cartera y Convenios son "a hoy" y Nómina tiene su propio selector de semana: ahí tocar "Mes anterior" no cambia nada. |
| 9 | Baja | "Proyección mensual" **$191.230.000**, cuando en septiembre ya entraron $213.572.302. | La cuenta es tarifa (sin ahorro) × 26 días × contratos activos: siempre queda por debajo. |
| 10 | Baja | Pestaña Cartera: "Deuda total". | Solo suma las deudas sueltas; no incluye semanas atrasadas ni acuerdos. La etiqueta promete más de lo que suma. |

**Convenios:** usa la misma cuenta que Cartera (`reporteConvenios` → `faltaDelAcuerdo`); leyendo el
código no encontré diferencia de cálculo. Solo le aplica el hallazgo 8.
**Nómina:** tiene el defecto de las semanas rodadas ya anotado en PENDIENTES (P1) y el hallazgo 8.
Por ser la plata de los cobradores y tener semanas cerradas y congeladas, merece su propia pasada.
**De paso, fuera de Reportes:** YHAN CARLOS MIRANDA (YAL55H) sale "en mora" con 0 días de mora en
Cartera y ZALA (la mora viene del acuerdo y el contador de días solo mira semanas). Revisar aparte.

### La causa de fondo
Reportes tiene **sus propias copias** de "en mora", "días" y "recaudado", separadas de las de
Cartera. Es la misma lección de `loQueDebe()`: la misma cuenta escrita en dos lugares se separa sola.

### El arreglo propuesto (sin aprobar todavía)
1. **Mora y días:** Reportes usa las mismas funciones que Cartera (`calcularEstadoCartera`,
   `diasEnMora`). La cuenta de "días desde el último pago" queda solo donde se nombre así.
2. **Recaudado:** una sola definición (todo lo que entró a caja en el período), y cada peso asignado
   a un grupo y a un cobrador (también el de suspendidos, cancelados y finalizados), para que las
   partes sumen el total.
3. **Fechas:** decidir con el dueño qué significa "al día" en un período pasado (pregunta abierta).
4. **Botones de fecha:** que no aparezcan en las pestañas que no los usan, o que digan "a hoy".
5. **Un solo "% al día" y un solo "vs anterior"** en pantalla, Excel, PDF e impresión.

---

## Bloque 1 — ARREGLADO el martes 29-sep-2026

Decisión del dueño para los períodos: **"cuánto cumplió ese período"** (D-029). Las cuentas nuevas
viven en `src/utils/reportesCifras.ts` (`estadoHoy`, `cumplimientoDelPeriodo`,
`contratosConPlazoVigente`, `pctCumplimiento`) con 15 pruebas en `reportesCifras.test.ts`.

**Medido en la app, con los datos reales, después del arreglo:**

| Qué | Antes | Después | Contra qué se comprobó |
|---|---|---|---|
| En mora (pestaña Cartera, impresión) | 187 | **65** | ZALA: 65 contrato por contrato, **0 diferencias de días y de plata** |
| Aviso de recolección | 50 | **58** | La cola de Cartera: 58 |
| Suma de "Recaudo por grupo" (septiembre) | $200.275.102 | **$213.572.302** | Total recaudado: $213.572.302 |
| Recaudado en Por admin / Por grupo | $212.537.102 | **$213.572.302** | Total recaudado (la suma de los 4 cobradores da lo mismo) |
| "vs anterior" | Resumen ▲15% · Por admin ▲28% | **▲20% en los dos** ($177.344.500, 1 al 29 de agosto) | La misma función en las dos pestañas |
| Cumplimiento y ranking al cambiar la fecha | No cambiaban | Este mes **77%** (81·77·77·74) · Mes anterior **78%** (81·80·76·75) · Semana pasada **76%** (95·83·68·59) | Pantalla, en los 3 rangos |
| Botones de fecha | En todas las pestañas | Solo donde se usan; en Cartera, Convenios, Nómina, Flota y Guardadas una nota dice "a hoy" | Pantalla |
| Impresión | Mezclaba las dos cuentas | Total $213.572.302 = suma de grupos · 65 en mora con sus días reales | Capturada sin imprimir |
| Celular (375 px) | — | Sin nada que se salga; el nombre del cobrador ya no se corta | Pantalla |

**Qué significa cada cifra ahora:**
- **Cumplimiento del período:** de lo que vencía en el período (semanas + los días antes del primer
  pago + cuotas de acuerdo), cuánto quedó pagado al cierre, aunque se haya adelantado antes. Si un
  cliente paga de más, se le cuenta hasta el 100% de lo suyo; lo demás va en "recuperó atrasos".
  Ejemplo real: KATIA (RNK57H) en septiembre vencía $1.099.000, cubrió $817.000 y le faltaron
  $282.000, que es exactamente lo que Cartera dice que debe hoy.
- **Al día / gabela / en mora:** de HOY, la cuenta de Cartera. No cambian con la fecha, y la
  pantalla lo dice ("CÓMO ESTÁN HOY").

**Límites conocidos (medidos):**
- Para saber cuántas semanas tenía pagadas un cliente en una fecha pasada, la cuenta va hacia atrás
  desde el contador de hoy con la fecha de cada pago. Comparada con el registro del sistema
  (`cajas_llenadas`) al 14 y al 21 de septiembre: en 49 de 52 diferencias la causa es solo la fecha
  (el día que pagó vs. el día que la oficina lo confirmó); 3 contratos con ajustes a mano difieren
  en menos de una semana.
- Con semanas rodadas, la curva se corre también hacia atrás (el mismo modelo del motor, D-028).
- Las motos en taller, garantía o fiscalía con el contrato activo: en Por admin / Por grupo cuentan
  como **retenidas** (regla del 22-ago); en la pestaña Cartera y el Resumen, como en Cartera. Hoy es
  un solo caso: REGINALDO ANTONIO RODRIGUEZ (IEW53I), ver PENDIENTES.
- El Excel y el PDF se revisaron por código (usan las mismas variables que la pantalla); no se
  descargaron.
