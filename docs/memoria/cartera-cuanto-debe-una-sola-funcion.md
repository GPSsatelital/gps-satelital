---
name: cartera-cuanto-debe-una-sola-funcion
description: "12/13-ago-2026: '¿cuánto debe hoy?' estaba escrito en 10 copias que no coincidían. Ahora es UNA función (loQueDebe) con 16 pruebas. Caso LIBINTO. Plan completo ejecutado."
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-27T21:18:35.986Z
---

# Cartera: "¿cuánto debe?" — una sola función, de una vez por todas

Pedido del dueño, 12-ago: *"que cartera quede funcionando perfecto de una vez por todas"*, con la
condición de **no cambiar nada hasta proponer bien el plan**. Plan en
`.claude/plans/cartera-cuanto-debe.md`. **Las 4 fases quedaron hechas y desplegadas.**

## El caso que lo destapó

**LIBINTO PATERNINA (XZT89H)** pagó **$302.000** el lunes 10: $202.000 su semana + **$100.000 la
cuota del acuerdo**. El motor repartió bien y el contador subió a 1 de 11. Pero la pantalla
**le seguía cobrando los mismos $100.000**.

## La causa real (no era el motor)

El "debe hoy" sumaba tres partes. Dos descontaban lo pagado; **la cuota del convenio no**.
La prueba de que era solo esa: el **estado** (al día / mora) sí lo descontaba — por eso el mismo
panel decía *"al día"* y *"debe $100.000"* al mismo tiempo. **La verdad y la pantalla se contradecían.**

Y la causa de fondo: **esa cuenta estaba escrita en 10 lugares** (9 en `CobrosView` + 1 en
`CobroDiarioView`) **que ya no coincidían entre sí**. Por eso "se dañaba con cada cambio": cada
arreglo tocaba una copia y dejaba nueve diciendo otra cosa.

## Cómo quedó

🔑 **`loQueDebe()` en `src/utils/cicloPago.ts` — única fuente.** Devuelve el **desglose**, no solo
el total: `cuota` · `acuerdo` · `deudas`, cada uno con `toca` / `pagado` / `falta`. El número grande
y el recuadro que lo explica salen del **mismo objeto**, así que **no pueden contradecirse** — que
era exactamente el defecto.

- **Las 10 pantallas** pasan por ella. Grep final: **cero sumas crudas** de la cuota del convenio.
- **`loQueDebe.test.ts`, 16 pruebas** con las cifras REALES de LIBINTO en producción. Si alguien le
  cambia la cuenta a uno de esos clientes, `npm test` lo caza antes de producción.
- **Recuadro "De dónde sale"** en el detalle: qué le tocaba · qué pagó · qué le falta, siempre en
  ese orden. No aparece en prorrateo.
- **Las 3 reglas quedaron escritas en el CLAUDE.md** (sección "REGLAS DE LAS CIFRAS DE PLATA").

## Reglas del dueño (cerradas, NO re-preguntar)

1. **"Le falta por pagar" = solo lo que falta.** Si ya pagó, **$0**.
2. **El acuerdo se ARRASTRA:** cuota $100.000, abonó $40.000 → la semana siguiente **$160.000**.
   Nunca más que el `deuda_total` pactado.
3. **El saldo a favor se MUESTRA, nunca se resta solo** — se aplica a mano.
4. Junto al número, el desglose de tres preguntas.

## Detalles técnicos que importan

- **Los 2 contratos Diario entran por un parámetro de opciones**, no por import: su tarifa del día
  se calcula en `usePagos.ts`, que arrastra Supabase, y `cicloPago.ts` es **puro a propósito** (por
  eso las pruebas corren sin base). Se comportan idénticos a antes.
- `periodosConvenioExigidos()` **pregunta período por período** a `cuotaConvenioDelPeriodo` en vez
  de reimplementar la regla — así el prorrateo, `cubre_periodo_hasta` y las semanas financiadas
  siguen respetándose sin duplicar lógica.
- Borré 4 variables muertas **verificando antes con grep** que nadie más las leyera: borrar algo
  "que el compilador da por muerto" ya causó una regresión acá en agosto.

## ✅ Secuela: el desglose no cuadraba con su propio total (27-ago, `f69be10`)

Lo destapó el dueño mirando a **MARLON (RNG53H)**: *"¿por qué carajo dice que debe dos semanas?"*.
El número grande cobraba **dos** cajas, pero el recuadro *"De dónde sale"* decía **una sola cuota**.

**Causa:** en `loQueDebe()` el campo `toca` de la cuota traía el valor de **una** caja aunque
hubiera varias exigidas. `falta` sí las contaba todas — por eso el total estaba bien y la
explicación no. **Exactamente el defecto que este archivo nació para matar**, sobreviviendo en un
campo del mismo objeto:

```ts
const toca = exigibles.length > 0 || prorrateoTotal > 0
  ? prorrateoTotal + exigibles.length * valorCaja   // TODAS las exigidas, no una
  : valorCaja;
cuota = { toca, pagado: Math.max(toca - falta, 0), falta };
```

🔑 **Lección:** sacar el número y su explicación del mismo objeto **no basta** si un campo de ese
objeto se calcula con otra regla. La prueba tiene que exigir que **`toca − pagado = falta`** cierre,
no solo que el total dé bien.

## ⚠️ Lo que NO se hizo

**No se vio en pantalla.** El panel del navegador renderiza la app en miniatura y los clics no caen.
Está cubierto por prueba automática con cifras reales, pero **falta que él mire LIBINTO** en la
lista y en el detalle. Es la verificación pendiente.

Ver [[regla-no-romper-lo-que-funciona]] · [[estado-ciclopago-convenios]] · [[bug-convenio-cobro-doble]].
