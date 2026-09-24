---
name: regresion-convenio-y-reglas-de-seguridad
description: "1-ago: rompí la regla de la última cuota del convenio al unificar. Cómo pasó, cómo se evita, y qué quedó sin corregir. LEER ANTES de tocar convenios o de refactorizar algo que funciona."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-05T03:17:49.062Z
---

# La vez que rompí algo que estaba definido hace tiempo

**El dueño lo dijo así:** *"me estás haciendo desastres en la aplicación con cosas que ya estaban
definidas hace mucho tiempo"* · *"si ya algo estaba bien definido vienes y me cambias las cosas"*.
Tenía razón. Esto queda escrito para que no se repita.

## La regla que rompí (ahora está en el código Y con pruebas)

> El cliente debía $345.000 y se le pone que pague de a $55.000 → **6 cuotas de $55.000 y la
> última de $15.000**. La cuota que teclea el funcionario **se respeta TAL CUAL**; la ÚLTIMA
> absorbe el resto. **Nunca un promedio.**

Al unificar el convenio de Cartera con el compartido, el compartido recalculaba la cuota
dividiendo ($345.000 ÷ 7 = $49.286) y salieron montos ponderados en toda la cartera: $54.125,
$92.364, $95.313. Arreglado en `35bb40d` con `repartirConvenio()` (función pura) + **9 pruebas**
que incluyen el caso exacto y el invariante `cuota × (n−1) + última === deuda`.

## 🔴 POR QUÉ PASÓ — esto es lo importante

1. **Comparé los dos formularios por lo que se VEÍA** (financiar semanas, fecha límite,
   previsualización) **y no por sus cálculos.**
2. **Borré `convUltimaCuota` porque el compilador dijo que no se usaba** — y no se usaba porque yo
   mismo había borrado el pedazo que la mostraba.
3. **Tomé el build en verde como prueba de equivalencia.** `tsc` y `npm test` avisan de
   **referencias rotas**, NO de **comportamiento perdido**.
4. **Desplegué ~15 veces sin que él viera nada en el medio**, así que los daños se apilaron antes
   de aparecer.
5. **Supuse en voz alta varias veces** (que el contrato era migrado, que había doble conteo, que
   el taller estaba conectado) y las tres veces me corrigió él. *"quitemos esas alucinaciones"*.

## Las 5 reglas que propuse (él NO las aprobó todavía — proponerlas de nuevo)

1. **No se reemplaza lo que funciona.** Si hay dos implementaciones y una anda bien, **se toca la
   otra**. Nunca migrar la buena al molde de la mala.
2. **Antes de borrar, escribir qué hacía cada bloque y dónde queda ahora.** Lo que no tenga
   reemplazo escrito, no se borra.
3. **En lógica de plata: escribir la prueba del comportamiento ACTUAL antes de tocar.**
4. **Un cambio de plata por despliegue**, y no se hace merge a `main` hasta que él confirme.
5. **No afirmar sin verificar.** Si no se comprobó contra el código o la base, se dice "no sé".

**Tarea que sale de esto:** hay reglas de negocio que viven SOLO dentro del código (como la de la
última cuota). Nadie las escribió nunca. Falta una pasada para sacarlas al CLAUDE.md con su prueba.

## ✅ 4-ago: YA SE SABE DE DÓNDE SALEN LAS CUOTAS FEAS (y no es este bug)

Con datos reales quedó claro: **la regla de la última cuota funciona**. Los convenios nuevos salen
exactos (JORGE 5×$100.000+$87.000 · FRAIRON 8×$50.000+$10.000 · DENILSON 8×$100.000+$49.000).

Las cuotas feas salen del **otro modo, "fijar por número de cuotas"**, que divide y ya:
433.000÷8 = $54.125 · 1.525.000÷16 = $95.313 · 1.016.000÷11 = $92.364. Los demás dan redondo de
casualidad. **Arreglo propuesto sin aprobar:** que ese modo redondee la cuota hacia arriba al
millar y la última absorba (con guarda si `cuota×(n−1) ≥ meta`). Detalle y tabla completa en
[[cartera-doble-cobro-deuda-vs-caja]], junto con dos cosas más que rompí al unificar: **el monto
de `metaFija` ya no queda bloqueado** (era la base faltante del wizard, calculada por el sistema) y
**el letrero dice "lo que tiene atrasado"**, falso para un cliente nuevo, además de "Podés" (voseo)
en un producto colombiano.

## 🔲 SIN CORREGIR — los convenios que se crearon con la cuota mal

De los 33 activos, **28 están bien** (creados desde Cartera con la lógica correcta). Los
candidatos son 5, y de esos **2 probablemente están bien**:

| Cliente | Placa | Debe | Cuotas | Guardada | Ya pagó | Rango real |
|---|---|---:|---:|---:|---:|---|
| ANDRY BREA | RLZ93H | 1.525.000 | 16 | 95.313 | **1** | 95.313–101.666 |
| ANDRES ESPINOZA | DQL84I | 1.016.000 | 11 | 92.364 | 0 | 92.364–101.600 |
| HOLMAN MARRUGO | YAT46H | 433.000 | 8 | 54.125 | 0 | 54.125–61.857 |
| DANIEL MILLAN | RLT87H | 737.000 | 22 | 33.500 | 0 | probablemente OK |
| LUIS ALFONSO TATIS | RMZ59H | 510.000 | 12 | 42.500 | 0 | probablemente OK |

- **ANDRY y ANDRES:** de los valores que él usa ($50/55/58/60/65/70/100k) el único que cabe es
  **$100.000** → serían 15×100.000 + última 25.000, y 10×100.000 + última 16.000.
- **HOLMAN:** caben $55.000, $58.000 y $60.000. **No se puede deducir, hay que preguntarle.**
- **DANIEL y LUIS ALFONSO:** la división da EXACTA (737.000÷22 y 510.000÷12), señal de que se
  fijó el NÚMERO de cuotas, no el valor. En ese modo repartir parejo es lo correcto.
- ⚠️ **ANDRY ya tiene 1 cuota abonada**: cambiarle la cuota le mueve la cuenta. Ese va con el
  recibo en mano.

**Quedó esperando que él confirme los montos. NO adivinar.**
Lista de pendientes completa para retomar: `.claude/plans/traspaso-3ago-mudanza-pc.md`.

## 🔲 Otra cosa que él señaló y quedó SIN verificar

Pantalla de HOLMAN: el convenio **se creó hoy** y el sistema ya le cobra la cuota del convenio
**ese mismo día**, aunque la semana ya quedó financiada dentro del convenio. Él lo ve mal.
Yo alcancé a ver `cuotaConvenioDelPeriodo` (cicloPago.ts): exige la cuota si el convenio se creó
**antes o el mismo día** en que arranca el período actual. **No se terminó de analizar si eso es
correcto o si debería arrancar el período siguiente.** Verificado sí: **los recuadros de ese panel
NO los toqué** (el diff de Cartera son 33 líneas agregadas y 199 borradas, todas del formulario).
