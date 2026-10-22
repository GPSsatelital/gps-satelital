---
name: saldo-favor-y-caja-descuadre
description: "30-jul — 73 pagos ($3.558.000) parados en saldo a favor, desglosados por causa contra la base; la caja SÍ los cuenta; el descuadre real son 2 pagos retro-fechados"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-01T00:15:07.940Z
---

# Análisis pedido por el dueño: "los dineros ingresados no cuadran mucho"

Disparado por DANIEL JOSE MILLAN (RLT87H): pagó $195.000 el 25-jul, quedó **100% en saldo a
favor**, y el contrato lo muestra debiendo la cuota del 27 con 3 días de vencida.

⚠️ **Regla que el dueño impuso acá y hay que respetar:** *"hay que desglosar bien eso antes de
implementar cualquier solución"*. Y antes me había parado en seco con **"¿por qué asumes?"** —
yo había deducido de una captura que el contrato era migrado con corte 27-jul y encima monté una
advertencia de plata duplicada. Nada de eso estaba verificado. **El desglose salió de consultas a
la base, no de deducciones.**

## Lo verificado en el código

**La caja NO pierde esa plata.** Todas las pantallas de caja/recaudo (CajaView, CobroDiarioView,
DashboardView, ReportesView, SocioDashboard) hacen lo mismo:

```ts
pagos.filter(p => fechaDeCaja(p) === dia && esPagoDeCaja(p)).reduce((s, p) => s + p.valor, 0)
```

Suman **`p.valor`** completo — nunca miran el reparto. `esPagoDeCaja` solo excluye los tipos
internos `adelanto_base` y `saldo_favor`, y **ninguno de los 73 pagos es de esos**. O sea: los
$195.000 de Daniel SÍ están contados en la caja del 27.
`fechaDeCaja(p) = p.fecha_registro || p.fecha` (el día que se DIGITÓ, no el que pagó el cliente).

## El desglose real ($3.558.000 en 73 pagos)

| Causa | Pagos | Contratos | Plata |
|---|---:|---:|---:|
| 1. contrato sin motor v2 | 2 | 1 | $46.000 |
| 3. pago ANTERIOR al inicio de cajas | 16 | 15 | $1.651.000 |
| 4. no había caja pendiente (adelantado) | 55 | 39 | $1.861.000 |

**Causa 3 = UN SOLO EVENTO, no un goteo.** Los 15 contratos son **COSTA**, los 15 con
`fecha_inicio_cajas = 2026-07-27` (el corte), todos los pagos del **25 o 26-jul**, todos digitados
el 27, y **los 16 quedaron 100% a saldo a favor** (cero a cuota). Son las transferencias del fin
de semana previo al arranque de COSTA: se digitaron con la fecha real del banco, anterior al día
en que nacen sus cajas, y el motor no tenía dónde meterlas
(mig 046: `if p_hoy < c.fecha_inicio_cajas then return cajas_previas`). **Sí están en la caja del
27** — el problema es solo que 15 clientes figuran debiendo con su plata guardada al lado.

**Causa 4 es casi toda normal**: vuelto de quien paga $205.000 con cuota de $202.000. Pero
adentro hay tres que revisar:
- **WILLIAM MARTINEZ (XZI02H) — $435.000 enteros a saldo a favor**, Quincenal. Es el pago que
  quedó pendiente de la migración de RASTREADOR.
- **YORJANIS HERAZO (IGC44I) — DOS pagos de $210.000**, misma fecha 27-jul, digitados el 28 con
  18 minutos de diferencia (16:17 y 16:35). Uno aplicó $202.000+$8.000, el otro se fue entero a
  saldo. **Cara de duplicado.**
- ADOLFO GAMEZ (RLT70H, **Diario**, causa 1): $23.000 clasificados como saldo a favor cuando en
  Diario ese sobrante sobre la tarifa de $27.000 debería ser **ahorro**. No traje
  `aplicado_ahorro` en la consulta → **sin verificar, no concluir**.

## El descuadre REAL: 2 pagos retro-fechados a un día ya cerrado

Únicos de la lista con `fecha_registro` anterior al día en que se creó la fila:

| Cliente | Placa | Valor | Digitado | Creado de verdad |
|---|---|---:|---|---|
| JADER PALOMINO | IEW55I | $35.000 | 26-jul | **29-jul 15:53** |
| JORGE ZABALETA | DQL77I | $52.000 | 26-jul | **29-jul 15:52** |

Un minuto entre ambos: es el cruce con *dinero sin dueño*, que hace esto
(`usePagos.ts:308`): `update({ fecha: match.fecha_banco, fecha_registro: match.fecha_banco })`.
**Eso se escribió el mismo 29-jul a pedido del dueño** ("la transferencia vieja debe entrar el día
que el dinero entró"). Cumple lo pedido, pero nadie discutió la consecuencia: la caja del 26 ya
estaba cerrada y ahora tiene $87.000 más. **No falta plata — sobra en un día ya contado.**
(JADER es el de la referencia M18871421 que abrió toda esta conversación.)

**DECISIÓN DE NEGOCIO PENDIENTE, es del dueño:** ¿una transferencia vieja entra a la caja del día
del banco (y entonces hay que poder reabrir/ajustar un cierre), o a la del día en que se digita
(y el cruce con el extracto se hace por `fecha`, no por `fecha_registro`)?

## 🔍 PISTA NUEVA sin resolver (vista el 30-jul a la noche en la app, con sesión real)

En el Historial de Pagos del 30-jul aparecen **dos de los 15 clientes de la causa 3** con un pago
nuevo **en EFECTIVO por un monto igual al que tienen parado**:

| Cliente | Placa | Pagó el 30-jul | Tiene parado en saldo a favor |
|---|---|---|---|
| DANIEL JOSE MILLAN | RLT87H | $195.000 efectivo | $195.000 |
| ALVARO VARGAS PINTO | RMM70H | $180.000 efectivo | $180.000 |

Lo de Daniel puede ser legítimo (le tocaba la caja del lun 27 y pagó hoy). **Pero Alvaro tiene
cuota de $195.000 y pagó $180.000** — que no es su cuota, es exactamente su saldo parado.

**❌ HIPÓTESIS DESCARTADA (misma noche, con la consulta a la base).** Yo sospeché que alguien
registraba pagos nuevos en efectivo en vez de usar "Aplicar". **Falso**: esos renglones ERAN los
movimientos internos de haber apretado Aplicar. Se ven como "Efectivo" porque `aplicarSaldoFavor`
los inserta con `metodo: "Efectivo"` hardcodeado. **Lección: no diagnosticar desde una lista de
pantalla; la consulta a la base lo aclaró en un minuto.**

**✅ ARREGLADO Y VERIFICADO EN VIVO (31-jul, commit `8bcfc21`).** Medido en producción al probarlo:
**35 movimientos internos por $6.849.500** se estaban declarando como ingreso real (mucho más que
los $862.500 que yo había estimado mirando solo los saldos a favor — la mayor parte son
`adelanto_base`, las semanas adelantadas de la base inicial). Ahora los totales los excluyen, los
movimientos siguen apareciendo en la lista con su etiqueta, y se muestran sumados en su propia
tarjeta ("🔄 Interno · no entró") que solo sale si hay alguno — así el que suma los renglones y no
le da el total sabe por qué. **De paso se confirmó en vivo el arreglo del `toISOString()`: hoy 31
de julio el rango sale `2026-07-01 → 2026-07-31`, válido.** El detalle del bug era:
`HistorialPagosView.tsx:134-145`
calcula TOTAL CONFIRMADO / EFECTIVO / TRANSFERENCIAS sobre `pagosFiltrados` **sin excluir los
movimientos internos** (no usa `esPagoDeCaja`, que sí importa en el archivo y sí se usa para el
badge). Resultado: **el Historial de Pagos declara más efectivo del que entró** — y como los
internos se insertan con `metodo:"Efectivo"`, inflan justo ese renglón. La Caja Diaria NO tiene
el problema (ella sí filtra), así que **las dos pantallas se contradicen** — esto es literalmente
el "los dineros ingresados no cuadran" del dueño. Solo con los 6 movimientos detectados el 30-jul
son **$862.500 de más**. Fix: agregar `.filter(esPagoDeCaja)` en `stats`.

## ✅ RESUELTO 31-jul — la "pista nueva" NO era doble conteo: era la PANTALLA mintiendo

Caso **RMB51H (EDWIN CABARCA, COSTA migrado)**, traído por el dueño con captura: veía dos pagos
de $195.000 y creyó *"se le dio en aplicar y lo contó nuevamente como otro pago"*.

**VERIFICADO EN LA APP EN VIVO (sesión real del dueño, no deducción):**
- Detalle del contrato: `CUOTA PERÍODO $195.000 / PAGADO PERÍODO $195.000` · va 43 de 104 cuotas ·
  ● Al día. El `PENDIENTE $560.000` es la **deuda de apertura** (otro balde), no la cuota.
- **Caja del 30-jul: EDWIN/RMB51H NO APARECE.** La caja lista los pagos uno por uno (37 nombres
  visibles: NESTOR MORENO, ADOLFO GAMEZ, JAINER HERRERA…) y él no está. Totales del 30:
  efectivo $1.097.000 (8) + transf. $3.889.000 (27) = $4.986.000 (35 confirmados).
  → **`esPagoDeCaja` hace su trabajo: el movimiento interno NO infla la caja.**
- Historia real del contrato (3 filas, no 2): **25/7** transferencia $195.000 ✅ → saldo a favor ·
  **27/7** transferencia $195.000 ❌ **RECHAZADA** (intento repetido, bien rechazado) ·
  **30/7** aplicar el saldo → cuota. **El cliente pagó UNA vez y se contó UNA vez.**

**LA FALLA REAL (de presentación, no de plata):** aplicar un saldo a favor inserta una fila con
`metodo='Efectivo', estado='Confirmado'` y el historial la mostraba **idéntica a un pago nuevo**
(`$195.000 · Efectivo · Confirmado`), sin decir que era interna. El sistema YA sabía hacerlo bien
para `adelanto_base` (tenía su etiqueta) — al `saldo_favor` se le olvidó.
**Fix (commit `24e806c`, en producción, verificado en vivo):** en el detalle del contrato y en
Historial de Pagos, los movimientos internos muestran `· movimiento interno` (en vez de "Efectivo")
+ etiqueta `🔄 Se usó el saldo a favor del cliente — NO es plata nueva, no entra a la caja`.
Usa `esPagoDeCaja(p)` como única fuente, así nunca se desincroniza de lo que hace la caja.

**Riesgo que esto evitaba:** que alguien "corrija" a mano un descuadre inexistente y ahí sí rompa
la plata. La hipótesis del 30-jul (que registraban pagos nuevos en vez de usar "Aplicar") sigue
**sin confirmar** para Daniel/Alvaro — pero ahora hay dos motivos verificados que la explicarían:
(1) el ADMIN no tiene la acción `aplicar_saldo_favor` en su paquete de rol → **no ve el botón**
(contradice el comentario de diseño de `acciones.ts:62`, que dice SECRETARIA+ADMIN); (2) hasta el
31-jul el botón fallaba con *"No tienes permiso para registrar pagos en efectivo"* para quien no
tuviera `registrar_efectivo` (arreglado con la mig 067, ver [[permisos-dos-capas-rls]]).
**Decisión del dueño (31-jul):** los permisos se asignan **por persona**, no por rol — así que NO se
tocó el default; él activa `aplicar_saldo_favor` a quien lo necesite desde Usuarios.

## ✅ 30-jul: "DEUDA PRIMERO" al aplicar el saldo a favor (commit `99de675`, en producción)

**El dueño lo definió así:** el crédito guardado debe tapar **primero la deuda vieja**, no la
semana en curso. Razón concreta: los pagos digitados con fecha anterior al corte del 27-jul
quedaron 100% en saldo a favor, y al aplicarlos cubrían una semana que el cliente **todavía no
había pagado**, dejando la deuda de apertura intacta.

**Alcance elegido (de 4 opciones):** SOLO el botón "Aplicar saldo a favor". Los pagos normales
siguen igual — cambiar el orden general habría hecho que quien paga su semana puntual quedara
figurando en mora hasta saldar la deuda vieja.

**Cómo se hizo, SIN tocar el motor ni correr migración:** `aplicarSaldoFavor` (usePagos.ts) hace
ahora **dos movimientos internos**: uno con reparto EXPLÍCITO contra la deuda y otro con el
sobrante para que el motor reparta como siempre. Funciona porque la mig 045 **solo re-reparte
cuando TODOS los `aplicado_*` vienen en cero**, y su rama de reparto explícito (líneas 264-293)
**igual baja las deudas** de la más antigua a la más nueva. Mismo mecanismo que ya usaba el cobro
para recuperar una moto retenida. Si el funcionario dirige el crédito a un convenio puntual
(`opts.convenioId`) manda su decisión, no la regla.

**Verificado en el código (no asumido):** la reversa de la mig 045 (líneas 296-315) **des-llena
las cajas en orden inverso** con el `aplicado_tarifa` guardado → borrar un movimiento mal aplicado
devuelve la semana Y el crédito. **NO se verificó** si la reversa también restaura una deuda ya
bajada (no aplica a estos casos, que tienen `aplicado_deuda = 0`).

**⚠️ Sin probar en vivo:** el dev server apunta a la BD de PRODUCCIÓN, así que apretar "Aplicar"
para probar habría creado movimientos reales sobre un cliente. Se dejó al dueño probarlo sobre un
contrato elegido.

## 🔨 31-jul: EL TEMA QUEDÓ ACOTADO A 11 CLIENTES — ACÁ SE RETOMA

**EL MÉTODO DEL DUEÑO PARA EL ARQUEO (dicho por él, es la clave de todo):** *"yo NO los incluyo
[los pagos anteriores al corte] y los pongo como deuda, para que cuando se les aplique el saldo a
favor se descuente de la deuda y ahí se emparejan y queda la cuenta bien"*. O sea: el arqueo
registra la **deuda completa**, el pago pre-corte entra al sistema y queda como saldo a favor, y
al aplicarlo los dos se cancelan. **El arreglo de "deuda primero" (`99de675`) hace exactamente
eso automáticamente** — método y sistema quedaron alineados.

**✅ DESCARTADO un problema de 180 contratos.** Se sospechó que a los migrados les faltaba la
semana adelantada (los nuevos nacen con la caja 1 pagada por la base; los migrados no, por spec:
*"Migrados: cajas desde su fecha de corte, sin caja 0 ni adelantada"*). **El dueño confirmó que
está bien**: el lunes 27 esos clientes SÍ debían esa semana y la pagaban del 27 en adelante, no la
traían adelantada. `cajas_previas` cuenta correcto. **La migración de COSTA no se toca.**

**⚠️ FALSO POSITIVO QUE CASI ME LLEVA:** ~20 contratos nuevos (los IGC) aparecían con "pago antes
del corte" de $202.000. **No es un error**: es el `adelanto_base`. Se reconoce al instante porque
`ahorro_apertura` = $308.000 y el pago = $202.000 → **$510.000, la base inicial**. Al filtrar
casos hay que excluir `tipo_registro = 'adelanto_base'` o la lista se infla de 11 a 30.

### La lista real: 11 contratos de COSTA, $984.000 parados

**GRUPO 1 — se emparejan solos (4 clientes, $397.000). Solo hay que darle "Aplicar":**

| Cliente | Placa | Saldo parado | Deuda | Al aplicar |
|---|---|---:|---:|---|
| JADER PALOMINO | IEW55I | $35.000 | $35.000 | cierra exacto |
| ELKIN MOYAR | IEW87I | $32.000 | $32.000 | cierra exacto |
| DAIRO ORTEGA | RMY46H | $195.000 | $225.000 | queda $30.000 |
| ALVARO VARGAS | RMM70H | $135.000 | $240.000 | queda $105.000 |

Que los dos primeros den clavado **confirma que el método del dueño funciona**.

**GRUPO 2 — les FALTA la deuda (7 clientes, $587.000). Hay que revisarlos contra el arqueo:**
EDWIN FONTALVO (RLY52H) $195.000 · NIHAYL ARISMENIDI (RML42H) $100.000 · ROGER VANEGAS (RMM68H)
$95.000 · JORGE ZABALETA (DQL77I) $52.000 · MEDARDO CAÑATE (DQG96I) $50.000 · DILSON DE LA ROSA
(RML47H) $50.000 · JHONFREDYS CANTILLO (DPU49I) $45.000 — **todos con `deuda_pendiente = 0`.**

Si el método es "pago afuera del arqueo + deuda adentro", a estos les falta el otro lado. O la
deuda nunca se registró (hay que ponerla y ahí se emparejan), o ya se pagó con lo abonado después
del 27 (y entonces el saldo es plata genuinamente extra). **⚠️ NO aplicarles el saldo antes de
saberlo**: sin deuda contra qué descontarse, se come la semana en curso — el enredo original.

**Acordado empezar por el Grupo 1**, que es un clic y cierra solo.

**Ofrecido y sin respuesta:** un botón de descarga a Excel con la hoja de conciliación de los 11,
para trabajarla al lado del arqueo en papel en vez de ir cliente por cliente en la pantalla.

## Consulta pendiente de correr (mide el tamaño del descuadre)

La lista de arriba solo mira pagos CON saldo a favor; los retro-fechados pueden existir también
sin él. Falta correr:

```sql
select cl.nombre, m.placa, p.fecha, to_jsonb(p)->>'fecha_registro' as dia_de_caja,
       (p.created_at at time zone 'America/Bogota')::date as dia_real, p.valor, p.metodo
from public.pagos p
join public.contratos c on c.id = p.contrato_id
join public.clientes cl on cl.id = c.cliente_id
left join public.motos m on m.id = c.moto_id
where coalesce(to_jsonb(p)->>'fecha_registro', p.fecha::text)::date
      < (p.created_at at time zone 'America/Bogota')::date
order by dia_de_caja;
```

## Dos bugs encontrados de paso (sin arreglar)

1. ✅ **ARREGLADO 30-jul (commit `32a0381`, en producción)** — `HistorialPagosView.isoMes()` usaba
   `new Date().toISOString()` (UTC): el **31 de cada mes después de las 7pm** `desde` saltaba al
   mes siguiente y quedaba mayor que `hasta` → **la pantalla se veía VACÍA una noche por mes**.
   Se detectó el 30 a la noche, o sea **un día antes de que reventara**. Ahora usa
   `hoyDate()`/`fechaISO()` y ancla al día 1 antes de mover el mes (así `setMonth` tampoco se
   pasa: 31 de junio no existe y rodaba a julio). De paso, `TarjetasLlavesView` marcaba la
   devolución vencida un día antes por la misma causa. Misma trampa de
   [[retenciones-rotas-y-filtros-descargas]].
   **Regla que salió de acá:** `toISOString()` NO siempre es bug — si la fecha viene de
   `hoyDate()` (medianoche local) da el día correcto. **Solo es bug cuando parte de `new Date()`**
   (ahora mismo, con hora). Hay ~36 usos en `src/`; los de `cicloPago.ts`, `ReportesView` y
   `useContratos` parten de fechas ancladas → **no se tocaron a propósito**: son lógica de plata
   y merecen su propio pase con pruebas. `MotoDetalleSheet.tsx` tiene 2 usos pero es código
   muerto (nadie lo importa) — confirmado otra vez.
2. **`CajaView.tsx:66`** filtra los pagos del día **sin exigir `estado === "Confirmado"`**,
   mientras Dashboard, Reportes y CobroDiario **sí** lo exigen → el mismo día puede dar totales
   distintos según la pantalla. Puede ser a propósito (el arqueo separa confirmado/pendiente):
   **preguntar antes de tocar.**

Ver [[reglas-dinero-referencia-efectivo]], [[libro-de-cajas-motor-v2]], [[migracion-costa-siembra]].
