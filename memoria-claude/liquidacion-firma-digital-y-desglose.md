---
name: liquidacion-firma-digital-y-desglose
description: "Liquidaciones 21-ago: firma+huella en pantalla con borrador previo, recibo de egreso por portafolio, y el arreglo del documento que mostraba cifras que no sumaban (mig 108)."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-08-22T19:24:29.192Z
---

# Liquidaciones: se firma en pantalla, y el documento por fin cuadra

## ✅ SUBIDO EL 22-AGO — commit `fcbb707` en main (lo corrió el dueño en PowerShell)

El clasificador de permisos siguió caído para git, así que **el dueño mismo corrió el comando**
(ojo: su botón Run abre PowerShell 5 — los comandos van con `;`, NUNCA con `&&`). Quedó en
producción: la base de los migrados (lee `base_inicial`, resta la semana, `detalle_favor`,
mig 108+109 ✅) + los 6 arreglos graves de la auditoría. **269 pruebas verdes.**
El `commit_msg_tmp.txt` de la raíz quedó sin borrar — limpiarlo en el próximo commit.

**Falta verificar en navegador** (el clasificador no dejó): los 6 arreglos — sobre todo el 375px
(lista→detalle→Volver) y que liquidar un contrato con préstamo activo rebote con su mensaje.

**ANTONIO (LIQ-0012) quedó listo para cerrar:** recalculado por la pantalla real = **$338.000 a
favor**, `detalle_favor` guardado y cuadrando, estado "calculada". Pasos: generar documento →
firmar (en pantalla, huella del registro) → cerrar con ☑ "sigue con la empresa" → pagarle →
recibo de egreso (COSTA). Antes de la firma: verificar sus $148.000 + $510.000 contra el arqueo
(su empalme sigue abierto).

Último commit subido: `8bfb44f` (tamaño carta). Mig **108 ✅ corrida**.

## El defecto que apareció al probar — cifras que no sumaban

Probando con ANTONIO MONTERROZA (LIQ-0012) el documento que iba a firmar decía:

```
Ahorro acumulado   $448.000
Daño: Lavada       - $10.000
SALDO FINAL        $330.000     ← faltaban $108.000 sin explicar
```

**Causa raíz — el total y su explicación vivían en sitios distintos.** `total_deudas` guardaba el
NETO que calcula `ajusteSalidaLedger` (lo que rodó sin pagar − su ahorro de esos días − lo
prepagado), pero `detalle_deudas` guardaba **solo lo que había escrito el funcionario**.
`registrarRevisionTaller` escribía el detalle crudo y después `calcularSaldo` **sobrescribía el
total** sin tocar el detalle. Le pasaba a TODA liquidación, no solo a la de ANTONIO.

**Arreglo:** `src/utils/desgloseLiquidacion.ts` — los dos salen de la misma función, con prueba
del invariante (`suma de renglones === total`). El saldo **no cambió** ($330.000): solo se hizo
visible lo que estaba mudo.

Dos trampas que quedaron protegidas con prueba:
- Los renglones del cálculo van marcados **`auto: true`** y `deudasEditables()` los filtra al
  precargar el formulario. Si se precargaran, volver a calcular los sumaría encima → **se le
  cobraría dos veces**. Hay una prueba que demuestra el doble cobro si se hace mal.
- **Monto negativo = crédito del cliente**, y se muestra con `+` en verde. Si saliera restando,
  el cliente vería que le restan su propio ahorro.

Y el mismo desglose se muestra **en pantalla**, no solo en el papel: ver "Total deudas $108.000"
con el formulario vacío le escondía al funcionario de dónde sale la cifra que el cliente firma.
Es la regla de *"¿todas las pantallas dicen lo mismo?"* de [[regla-no-romper-lo-que-funciona]].

## Firma y huella en pantalla

Orden que pidió el dueño: **primero ve la cuenta, después firma.**
1. Borrador con marca de agua y aviso ámbar arriba (*"copia de revisión, todavía NO está firmada"*).
   Se puede imprimir para que lo lea con calma.
2. Casilla de "ya lo revisó y está de acuerdo".
3. Firma con el canvas del wizard.
4. **Huella: la del registro** — decisión del dueño 21-ago, *"usa la misma huella del registro
   personal"*. Ya la dio una vez y es la misma persona. Solo se captura con el lector si nunca la
   dio (migrados viejos). Se baja a dataURL con `urlADataUrl` porque html2canvas ensucia el canvas
   con imágenes traídas por URL — mismo tratamiento que ya usaba `regenerarDocs`.

El PDF final se arma con las dos incrustadas y va a `documento_firmado_url`, **la columna de
siempre**: todo lo que ya la lee sigue funcionando sin enterarse.

🔴 **El camino de papel NO se quitó, y no se debe quitar.** El lector solo trabaja en el PC de la
oficina y ya falló antes ([[estado-huellero-digitalpersona]]). Si falla, se imprime y se sube la
foto. Quitarlo dejaría una liquidación trancada con el cliente ahí parado.

**Los tres modos (borrador / firmado / reimpresión) salen del MISMO armador** (`htmlLiquidacion`).
El borrador que el cliente lee no puede decir algo distinto de lo que firma.

## Reimprimir

Una liquidación **cerrada no se podía volver a imprimir** — el cliente que perdía su copia se
quedaba sin ella. Ahora sí, desde que hay cuenta calculada; si ya firmó, sale con su firma.

## Recibo de egreso por portafolio

Cuando la liquidación devuelve plata, sale del portafolio **dueño de la moto** (ANTONIO → COSTA,
$330.000). Mismo molde que el recibo de premios de referidos.

⚠️ **Es solo papel, y el recibo lo dice en el pie.** Decisión del dueño 21-ago: *"solo el papel,
por ahora"*. **La caja NO lo resta y la utilidad de COSTA queda $330.000 más alta de lo real**,
porque no existe tabla de egresos — está diseñada y pausada en [[modulo-egresos-disenado]]. Cuando
se construya, este recibo debe pasar a escribir ahí en vez de quedarse suelto.

## 🔴 DOS TRAMPAS que bloquean liquidar (halladas 21-ago, SIN resolver)

**1. La base de los migrados: 168 contratos donde se devolvería de más.**
El dueño ya dio la regla (21-ago): *"en la base si se cogen solo los 300, y las que aparezcan con
510 sabes que ahí habría que descontarle el equivalente a una semana"* — porque de esos $510.000,
~$202.000 pagaron su primera semana. **`cuentaLiquidacion` suma `ahorro_inicial` COMPLETO** para
los migrados, sin descontar la semana.

Se probó contra ANTONIO, que tiene base **$300.000** (ya neta) — y por eso pasó. Pero él es la
excepción. De **236 migrados vivos**: **168 con base ≥ $480.000** (bruta), 4 entre 250k y 480k,
64 en cero. **JOSUE (RML59H) tiene $510.000** y está en la lista para liquidar.

⚠️ El dueño advirtió también que **no siempre son $202.000: hay cuentas viejas de $195.000.**
No tocar sin que él decida cómo se resuelve. Hoy no hay prueba que cubra el caso de base bruta.

**2. ADOLFO GAMEZ (RLT70H) es DIARIO — le arrastra [[bug-diario-ahorro-no-acumula]].**
Verificado: `forma_pago = Diario`, `ahorro_acumulado = $100.000` e `ahorro_inicial = $100.000`
(iguales — es la trampa de `crearContrato()` que mete la base dentro del ahorro, ver
[[base-inicial-vs-ahorro-acumulado]]). Su ahorro ganado pagando figura en **$0**, cuando iba en el
**97% de la base**. Liquidarlo hoy le pagaría **~$393.000 de menos**. Va después del barrido.

## Hallazgos graves de la auditoría — 6 arreglados el 21-ago (misma sesión)

1. **Préstamo de reemplazo activo bloquea liquidar** — guarda en `iniciarLiquidacion` (el hook,
   así cubre las 3 puertas). Antes se comía la moto PRESTADA (el préstamo hace swap de
   `contrato.moto_id`) y dejaba suelta la del cliente. Regla: devolver la prestada primero.
2. **"En traspaso" es final** — `estadoMotoTrasLiberar` ya no puede bajar a "Disponible" una moto
   que es del cliente (pasaba al cerrar la orden de taller vinculada, después del cierre).
3. **Paz y Salvo solo con saldo ≥ 0** — doble candado (render + handler). Antes se imprimía "no
   debe nada" a un cliente en lista negra.
4. **Los errores salen en ROJO** — `msg` lleva `esError` explícito; antes se pintaba verde salvo
   que el texto contuviera la palabra "error", y un fallo de BD pasaba por éxito.
5. **Monto sin concepto bloquea** — antes un daño de $85.000 sin nombre se descartaba EN SILENCIO
   de la cuenta.
6. **375px** — patrón lista→detalle con "← Volver" (isMobile local, como las demás vistas).

**APLAZADO A PROPÓSITO — el convenio por cuotas completas** (`deuda_total − cuotas_pagadas ×
cuota` ignora los pesos abonados de la cuota en curso, hasta una cuota de menos para el cliente):
los pesos reales viven regados en `pagos.aplicado_convenio` a través de TODOS los convenios
históricos del contrato (cumplidos/renovados incluidos) — sumarlos a ciegas acreditaría de más.
El arreglo correcto es una columna `convenios.total_abonado` mantenida por el trigger de pagos,
y **tocar ese trigger "de paso" está prohibido**. Decidir con el dueño como tarea propia.

## 🔴🔴 LA REGLA MADRE DE LA BASE DE MIGRADOS (dueño, 22-ago tarde — MANDA sobre todo lo anterior)

**«El único valor que cuenta como base para los migrados es el que se coloca MANUALMENTE en el
campo "Ahorro inicial". Los datos del SQL eran PROYECCIONES; lo real es lo que permaneció o lo
que se cambió.»** Y sobre la semana adelantada: **«se le resta la semana completa, pero se le
devuelve lo que le haya sobrado»** — lo sobrado lo devuelve el ajuste de salida por DÍAS
(consumidos se cobran, no consumidos se devuelven), no el renglón de la base.

- Implementado 22-ago: `plataQueEsDelCliente` lee **`ahorro_inicial`** (el manual), resta el
  período completo del contrato. `base_inicial` queda de referencia (era la proyección).
- **JAVIER (XYZ54H), con el caso resuelto por el dueño**: dio $403.000 → base 403−202 = **$201.000**;
  los $107.000 que dejó de pagar reaparecen en el ajuste de días si su última semana los necesita.
- **Campo en CERO** (los 64 de COSTA sin confirmar): `baseSinConfirmar` — la proyección lo avisa
  en amarillo y NO inventa base; se confirma en el empalme antes de liquidar.
- ⚠️ **ANTONIO (IEW65I) ES CASO APARTE — NO RECALCULARLO.** El dueño ya le hizo las cuentas a
  mano: sus $300.000 del campo YA traen descontada la semana (dio 300, nunca alcanzó la
  adelantada). Con la regla nueva un recálculo le daría 300−202=98 (≈$246k total en vez de los
  ~$338k con que va su LIQ-0012). Cerrarlo como está; si alguien le da "calcular" otra vez, hay
  que reponer (o poner el campo en $502.000 para que la resta dé sus 300).

## base_inicial SOLO es confiable en COSTA — hallado el 22-ago con XYZ54H (JAVIER POSSO) [SUPERADO por la regla madre de arriba]

**BARRIDO HECHO (22-ago, tarde): RASTREADOR 28/28 limpio · PRADERA 7 torcidos, verificados uno
por uno contra `contratos_pradera.csv` — en los 7 la cifra buena es `ahorro_inicial` (Excel v2 +
correcciones de FREDY):** XYZ54H ($150k→403k, corrección del dueño 3-jul en la auditoría) ·
RMZ63H (416k→500k) · XYZ50H (450k→510k) · XYZ51H (400k→500k) · RMZ66H, YAL55H, DQF53I
(500k→510k). **SQL de corrección entregado al dueño** (insert a auditoría + update + verificación
que debe dar cero). **YAL54H con base $1.000.000 es REAL** (el Excel lo dice igual).
Al correr y verificar cero → freno levantado: los 236 migrados con base verificada.
**FRENO mientras tanto: no liquidar migrados de PRADERA.**

La proyección de JAVIER decía base $150.000 y "Editar contrato" $403.000. La verdad del repo:
- `base_inicial = 150.000` es **basura de la PRIMERA migración de PRADERA** (la de prueba). El
  script bueno (`update_pradera_v2.sql:243`) **nunca tocó `base_inicial`** — solo puso
  `ingreso_inicial = 510000` y `ahorro_inicial = 510000` (el Excel real: entregó $510.000).
- Alguien después editó `ahorro_inicial` 510.000 → 403.000 (ver `contratos_auditoria` — quién y
  por qué define cuál es la base buena de JAVIER).
- Mi verificación del campo `base_inicial` fue **contra el arqueo de COSTA únicamente** (163,
  calcado). PRADERA (45) y RASTREADOR (28) tienen otra procedencia: en PRADERA hay al menos 7
  donde base ≠ ahorro_inicial. Barrido pendiente contra los arqueos del repo
  (`migracion_datos/contratos_pradera.csv` y `rastreador.sql`).

Otros hallazgos de la misma revisión:
- **Cambiar el grupo de una moto NO deja rastro** (solo permiso ADMIN; sin auditoría). El letrero
  del corte cambiaría en silencio. Pendiente: auditoría de cambios de grupo.
- Los 5 últimos migrados (COSTA, DQL74I/DQL78I/IEW89I/IEW93I/IEW38I) salieron LIMPIOS: base
  510.000 y su propio `fecha_inicio_cajas` (los DQL: 10-ago) — el letrero del corte es de la
  CARTERA (27-jul), el reloj de cada contrato es el suyo.
- Pregunta del dueño *"¿solo hay la mitad de los pagos?"* → NO: los pagos pre-corte viven en el
  Excel viejo resumidos en las cifras de apertura; desde el corte está el 100% con desglose. El
  historial completo se ve en Cartera→contrato→Historial y en el "📋 Detallado".

## Cambiar `valor_semanal` NO reparte de nuevo — pero sí revalúa las cajas viejas

Pregunta del dueño (21-ago) al corregirle a JOSUE $195.000 → $202.000: *"al yo cambiar los pagos que
se repartieron en su momento, ¿se vuelven a redistribuir?"*

**No.** El reparto quedó congelado en los contadores (`cajas_pagadas`, `caja_actual_pagado`) y en
las columnas `aplicado_*` de cada pago. Cambiar la tarifa no dispara ningún reparto nuevo.

**Pero `ajusteSalidaLedger` (cicloPago.ts:874 y :897) multiplica las cajas por el valor de HOY**,
no por el que tenía cada caja cuando se pagó. JOSUE, medido: a favor pasó de $216.000 a $223.000.

En su caso está BIEN — sus campos diarios siempre dieron $202.000 (6×$31.000 + $16.000) y el
`valor_semanal` era el único desalineado; corregirlo dejó el contrato coherente.

⚠️ **Pero contradice el punto 10 de la spec del libro de cajas** (*"los cambios de tarifa solo
afectan cajas futuras — las selladas no se tocan"*). El día que se le suba la tarifa a alguien de
verdad a mitad de contrato, se le revalúan las semanas viejas al precio nuevo. Sin arreglar; hoy no
muerde porque nadie ha cambiado una tarifa en firme.

## La base de los migrados — ✅ ARREGLADO (21-ago, mig 109 corrida)

**Decisión del dueño:** se devuelve `base_inicial` MENOS el período que esa base pagó.

**El hallazgo grande al construirlo — el cálculo leía el campo EQUIVOCADO:**
- `ahorro_inicial` está REVUELTO: `gen_costa_sql.py` lo siembra en **0** y se llenó a medias
  después. **64 de COSTA siguen en cero** (se les devolvía ~$500.000 de menos, nada de base) y
  tiene valores que no existen en ningún arqueo ($515.000, $560.000, $880.000). A ANTONIO le
  contaba $300.000 habiendo entregado $510.000.
- **`base_inicial` es el campo BUENO**: verificado renglón por renglón contra `costa_rows.json`
  (el arqueo original) — 106×$510.000, 51×$500.000 y los 6 raros, calcado. Lleno en los 236
  migrados de los 3 grupos.

**Cómo quedó:** `plataQueEsDelCliente()` en `cuentaLiquidacion.ts` — UNA función para la
proyección Y la liquidación real (antes la real hacía su suma aparte). La resta usa el
`valorPeriodoReal` de cada contrato (las cuentas de $195.000 salen solas), con tope de no restar
más de lo entregado (hay un migrado con base $202.000 exactos). El desglose se guarda en
`liquidaciones.detalle_favor` (mig 109) y el documento lo imprime renglón por renglón; las
liquidaciones viejas (desglose vacío) se dibujan a la antigua. Pruebas: cuentaLiquidacion.test.ts
+ generarDocumentoLiquidacion.test.ts (el HTML real del documento suma exacto el saldo).

**ANTONIO verificado por la pantalla real: $338.000** (antes $330.000: el campo revuelto le
quitaba $210.000 de base y el cálculo no le restaba la semana — casi se compensaban, por eso el
error no saltaba a la vista).

⚠️ **10 contratos con base y semana DESPAREJADAS** (5 con base $500.000 + semana $202.000, 5 al
revés). **JOSUE (RML59H) quedó ahí**: su arqueo decía semana $195.000/moto USADA pero traía
tarifa+ahorro diarios que dan $202.000 — venía contradiciéndose solo. El dueño lo subió a
$202.000 el 21-ago. Revisar los 10 uno a uno antes de liquidarlos.

⚠️ Cambiar `valor_semanal` no re-reparte pagos, pero `ajusteSalidaLedger` revalúa las cajas al
precio de HOY (ver sección siguiente).

## (histórico) El diagnóstico anterior, superado por lo de arriba

**Los datos confirman la regla del dueño**, y la resta no necesita adivinar nada: es
`ahorro_inicial − valor_semanal`, con el valor de cada contrato. De 172 migrados con base:

| Base | Cuántos | Menos su semana |
|---|---|---|
| $510.000 | 98 | **$308.000** (96 de ellos) |
| $500.000 | 64 | **$305.000** (63 de ellos) — las cuentas viejas de $195.000 |
| otras | 10 | dispersas |

**159 de 172 caen exactos.** Es doble cobro: esa semana ya está contada como caja pagada en el
ledger, y devolver la base completa la entrega otra vez. JOSUE: se le devolverían $202.000 de más.

**Propuesta hecha al dueño el 21-ago (la dejó pendiente, NO aprobó):** arreglar el CÁLCULO, no el
dato — sumar la base que entregó y restar en renglón aparte la semana que esa base pagó. Así el
papel no miente (entregó $510.000 y lo dice), el cliente ve por qué no se le devuelve todo, y no se
tocan 159 filas de producción. **Los ~13 raros** (uno con base $800.000, otro cuya resta da $98.000)
huelen a error de digitación como el que él ya corrigió: revisarlos uno por uno antes de liquidarlos.

## Pendiente

- Terminar la liquidación de ANTONIO: generar documento → firmar → cerrar con ☑ *"sigue con la
  empresa"* → pagarle los $330.000.
- **Verificar sus $148.000 de ahorro + $300.000 de base contra el arqueo de COSTA antes de que
  firme** — su empalme sigue abierto.
- Después: RML59H (JOSUE), RLT70H (ADOLFO), XYZ54H.
- Las otras 10 liquidaciones en proceso tienen el desglose viejo (detalle sin los renglones del
  ajuste). Se arregla solo al volver a darle *"Registrar revisión y calcular"* — el saldo no cambia.
