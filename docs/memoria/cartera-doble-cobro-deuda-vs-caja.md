---
name: cartera-doble-cobro-deuda-vs-caja
description: "TEMA VIVO 4-ago: la semana atrasada se registra a mano como DEUDA y el motor la sigue exigiendo como CAJA — misma plata cobrada dos veces. Acá se retoma."
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-05T22:12:24.049Z
---

# Plata cobrada dos veces — ✅ CERRADO el 5-ago-2026

**Todo arreglado y corrido en producción.** Quedó una sola cosa pendiente, al final del archivo.

## ✅ Lo que se hizo el 5-ago (migs 082 y 083 ✅ corridas)

| | |
|---|---|
| **mig 082** | Al firmar un convenio, las semanas financiadas que **aún no han llegado** también quedan marcadas. Antes solo se marcaban las ya vencidas: la futura llegaba, el motor la exigía y el siguiente pago se la tragaba. |
| **mig 083** | La **multa de recolección se cobra de PRIMERA** entre las deudas (regla del dueño). Aplicada con un script que LEE la función de la propia base y solo le cambia los `order by` — porque la función viva **no era igual a la del repo** (la viva filtra `estado='pendiente'`; el 045 dice `estado <> 'pagada'`). Pegar la del archivo habría revertido eso en silencio. |
| **Inmovilizaciones** | El convenio para recuperar la moto ahora incluye **las deudas viejas**; solo la multa se exige en efectivo. Antes exigía TODAS las deudas de contado y dejaba sin salida a quien arrastra una deuda grande. |
| **5 convenios corregidos** | ANDRY −$195.000 · DIONICIO −$195.000 · FRANCISCO −$195.000 · JAIDER −$202.000 · LUIS FELIPE −$195.000. **$982.000 en total.** |
| **3 cuotas redondeadas** | HOLMAN $55.000 · ANDRY $96.000 · ANDRES $93.000. |
| **LIBINTO (XZT89H)** | Sus $20.000 estaban puestos en la deuda equivocada; se devolvieron a la multa. |

**Cómo se corrigieron los 5 — la decisión importa:** NO se movió plata de "semana" a "convenio" ni se
les quitó ahorro. Esa semana la pagaron **con plata real**, así que la caja está bien llena y el
ahorro se lo ganaron. Lo que estaba mal era que **el convenio también les cobraba esa semana** — así
que se le quitó al convenio y se corrió su cobertura una semana atrás. Un solo UPDATE por cliente,
sin tocar pagos, cajas, ahorro ni deudas. Cada fila con guarda `deuda_total = <valor esperado>`.

## ✅ mig 086 — con la moto RETENIDA, la multa se cobra antes que las cuotas

La 083 puso la multa de primera **entre las deudas**, pero el reparto llega a las deudas solo
después de llenar las cuotas atrasadas — y una moto retenida por mora SIEMPRE las tiene. La plata
nunca alcanzaba a llegar a la multa.

**Las 16 motos retenidas tenían sus $20.000 intactos.** La única forma de cobrar una multa era
entrar por Inmovilizaciones (que manda el pago dirigido); cobrar desde Cartera —lo natural— dejaba
la moto trabada por más que el cliente pagara. Caso: JOSE ENRIQUE CHIRINOS (IEW50I) pagó $200.000
y el motor los mandó completos a cuotas.

Ahora, si el contrato está `Suspendido`, lo primero que cubre el pago es la multa. Un contrato
normal no cambia. **Ojo con el detalle que casi se escapa:** el bloque de deudas hacía
`v_ap_deuda := v_monto - v_resto` (asigna), así que pisaba lo abonado a la multa — hubo que
pasarlo a sumar.

**Cómo se rehizo el pago de JOSE ENRIQUE sin tocar nada a mano:** rechazar → poner los
`aplicado_*` en CERO (no en null: `aplicado_ahorro` es NOT NULL) → volver a confirmar. El motor
recalcula todo solo. Quedó $20.000 a multa + $180.000 a cuotas + $4.000 de ahorro.

🔴 **Decisión del dueño sobre los pagos VIEJOS: se dejan como están.** Rehacer un pago de hace
semanas es peligroso — al re-aplicarlo el motor reparte contra el estado de HOY, no el de
entonces, y puede caer en cajas distintas. De aquí en adelante la regla lo resuelve sola: el
próximo abono de cada cliente paga su multa. Y para destrabar una ya, se cobra desde
Inmovilizaciones.
⚠️ **Trampa de mi propia consulta**: la primera versión buscaba pagos de contratos suspendidos
HOY, sin verificar que el pago fuera POSTERIOR a la creación de la multa — sacaba 20 pagos, la
mayoría de cuando el cliente todavía tenía la moto. Siempre comparar contra `deudas.created_at`.

## 🔲 LO ÚNICO QUE QUEDÓ PENDIENTE

**Separar los ingresos por multa en la caja diaria.** Pedido del dueño. Necesita una casilla nueva
en `pagos` que anote cuánto de cada pago fue a una multa, y **volver a tocar el motor** — se
aplazó a propósito para no hacerle dos cirugías el mismo día. Hacerlo con el mismo método de la
083 (leer la función de la base, no transcribirla).

---

# Cómo se descubrió (4-ago) — el diagnóstico, por si vuelve a aparecer algo parecido

## El hallazgo

El dueño reportó: *"un convenio que hice hoy incluyendo la que se le venció y se la está cobrando"*.
Caso: **JORGE BELLO (RLT88H)**, convenio del 4-ago por $587.000.

Primero deduje mal —le dije que había escrito el monto sumado a mano— y **los datos me
desmintieron**: su deuda registrada es $587.000 EXACTOS, igual al convenio. Nadie escribió de más.

**Lo que de verdad pasa:** los $190.000 de la semana atrasada están registrados como una fila en
`deudas`. Y una deuda y una caja son **dos cuadernos distintos**:
- la **caja** de esa semana sigue vacía → el motor exige los $195.000;
- la **deuda** de $190.000 entró al convenio → también se cobra.
La misma plata en los dos lados.

**Y el dueño explicó por qué pasa, sin saber que era la causa:**
> *"El de DENILSON fue porque había que ajustarle la deuda pero como no me salía en cartera me
> tocó colocarla a mano."*

La semana atrasada **no aparece como "deuda" en Cartera** —porque no lo es, es una caja sin
llenar— así que el funcionario la registra a mano para poder meterla en un convenio. Desde ese
momento se cobra doble. **No es que la gente trabaje mal: el sistema no ofrece la forma correcta,
así que usan la que sí funciona.** Va a seguir pasando hasta que se arregle.

## 🔲 LA CONSULTA QUE FALTA (pegar en el chat, nunca como archivo)

```sql
select cl.nombre, m.placa,
       cv.concepto              as motivo_convenio,
       cv.deuda_total, cv.cubre_periodo_hasta,
       d.concepto               as concepto_deuda,
       d.descripcion, d.monto, d.monto_pendiente, d.estado,
       d.created_at::date       as deuda_creada
from public.convenios cv
join public.contratos c on c.id = cv.contrato_id
join public.clientes cl on cl.id = c.cliente_id
left join public.motos m on m.id = c.moto_id
left join public.deudas d on d.contrato_id = cv.contrato_id
where cv.estado = 'activo'
  and m.placa in ('RLT88H', 'IEW54I', 'RLY54H')
order by cl.nombre, d.created_at;
```
**Qué se busca:** si a JORGE le aparece una deuda de ~$190.000 creada el 4-ago con concepto
`tarifa_atrasada`, queda probado — y recién ahí se sabe a cuánta gente le pasó.

## Lo que SÍ quedó verificado (no re-investigar)

- **El mecanismo `cubre_periodo_hasta` funciona.** Cuando el convenio se lleva la semana adentro
  vía el selector 0/1/2, se guarda la fecha y las cajas de ese período dejan de exigirse
  (`CobrosView` ~1570, `calcularEstadoCartera`, alertas y dashboard lo respetan).
  Prueba viva: DENILSON tiene `2026-08-10`; ALBERT, JORGI, SIMON y JUAN CARLOS OSPINO tienen una
  diferencia igual a UNA semana exacta con la marca puesta. El camino bueno existe y sirve.
- **FRAIRON CASTILLA (IEW54I) NO tiene nada roto.** Deuda registrada $0, convenio $410.000, y su
  base completa sería $308.000 + $202.000 = $510.000: entregó $100.000, le faltan $410.000
  exactos. Es el convenio automático del wizard. La marca vacía ahí es lo CORRECTO.
- **La cuota del convenio NO se cobra "enseguida" por error.** `cuotaConvenioDelPeriodo` solo la
  exige si el convenio se creó en o antes del inicio del período. Los del martes 4 (período que
  arrancó el lunes 3) no la cobran esa semana. Funciona bien.
- ⚠️ **LUIS ALFONSO y ELKIN** tienen cobertura hasta el 3-ago, que ya venció: se crearon el sábado
  1 y "1 semana" cubrió la que iba corriendo (27-jul→2-ago). **Falta que el dueño diga si su
  intención era cubrir la semana SIGUIENTE** — si sí, hay que cambiar la regla.

## ⚠️ Defecto de la consulta que se usó (no repetirlo)

La columna `deuda_registrada` suma `monto_pendiente` de HOY, no lo que había al crear el convenio.
Los convenios de julio que ya abonaron salen con una diferencia inflada que **no significa nada**.
Sirve solo para los de esta semana. Para juzgar los viejos hay que mirar `deudas.created_at`.

## 🔲 Clientes nuevos "con convenio": es a propósito, falta decidir

El wizard **crea un convenio obligatorio** si la base inicial quedó incompleta
(`WizardContrato.tsx:337`, motivo *"Base inicial incompleta al crear el contrato"*). Para semanal
la base es `$308.000 + la semana` = $510.000; casi nadie la completa, así que **casi todo cliente
nuevo sale con convenio**. Hoy eso además cuenta para la mora y le cobra cuota cada semana.

**El dueño no ha respondido cuál quiere:** (A) está bien, solo bloquear el monto otra vez ·
(B) que el wizard no lo cree solo · (C) que lo cree pero sin cuota semanal.

## ✅ 5-ago (`a76c475`): TRES ARREGLOS DESPLEGADOS — lo que no dependía de él

1. **Cuotas redondas al fijar el NÚMERO de cuotas.** Sube al millar y la última absorbe. Solo toca
   las que hacen falta: si la división ya da una cifra de a $500 ($33.500, $42.500, $48.000) la
   deja igual. Guarda: si redondear dejaría la última en cero, vuelve a la división exacta.
   5 pruebas con los casos reales (HOLMAN → $55.000, ANDRY → $96.000, ANDRES → $93.000).
2. **El monto de la base inicial vuelve a estar bloqueado** (prop `metaBloqueada`, solo el wizard).
   En Inmovilizaciones sigue ajustable a propósito. Textos corregidos por puerta (`metaNota`) y
   "Podés" → "Puedes".
3. **Aviso en el formulario de deuda** cuando el contrato tiene cuotas sin llenar: dice cuánto ya
   le está cobrando el sistema y manda a financiarlas por el convenio. **Ataca la causa raíz** del
   cobro doble en el punto exacto donde se comete. No bloquea.

⚠️ **Sin probar en el navegador**: la sesión se cerró y no hay credenciales. Lo verificado son las
99 pruebas, `tsc` y el build. **Falta abrir el formulario de deuda de un cliente con cuotas
atrasadas y ver el recuadro rojo**, y el convenio a 375px.

## 🔴 Dos cosas que YO rompí al unificar la ventana (✅ ya arregladas arriba)

1. **`metaFija` ya no bloquea el monto.** Antes, el convenio del wizard traía la cifra de la base
   faltante **bloqueada**. Ahora viene puesta pero editable, así que alguien puede bajarla y dejar
   al cliente debiendo menos base de la que debe. Es de plata.
2. **El letrero miente para clientes nuevos:** dice *"Sugerido: $X — lo que tiene atrasado"*, y un
   cliente nuevo no tiene nada atrasado, le falta base. Además dice **"Podés"** (voseo argentino)
   en un producto colombiano: va "Puedes".

## 🔲 Los convenios con cuota no redonda — YA SE SABE POR QUÉ

La regla de la última cuota **sí quedó bien** (JORGE 5×$100.000+$87.000 · FRAIRON 8×$50.000+$10.000
· DENILSON 8×$100.000+$49.000, todos exactos).

Los feos salen del OTRO modo, **"fijar por número de cuotas"**, que divide y ya:
| Cliente | Cuenta | Cuota |
|---|---|---:|
| HOLMAN (YAT46H) | 433.000 ÷ 8 | $54.125 |
| ANDRY (RLZ93H) | 1.525.000 ÷ 16 | $95.313 |
| ANDRES (DQL84I) | 1.016.000 ÷ 11 | $92.364 |
Los demás dan redondo de casualidad (480.000÷10, 737.000÷22, 510.000÷12).

**Arreglo propuesto y sin aprobar:** que ese modo redondee la cuota **hacia arriba al millar** y la
última absorba el resto — mismo principio. ANDRY quedaría 15×$96.000 + última $85.000.
Guarda necesaria: si redondear hace que `cuota×(n−1) ≥ meta`, caer a la división exacta.
⚠️ **ANDRY ya tiene una cuota abonada**: ese se toca con el recibo delante.

Ver [[regresion-convenio-y-reglas-de-seguridad]] y [[regla-inmovilizar-y-convenios]].
