---
name: rediseno-toda-la-app-metodo-reportes
description: El dueño pidió (2-oct-2026) llevar a TODA la app lo que se hizo en Reportes; el método pantalla por pantalla y el orden propuesto
metadata:
  node_type: memory
  type: project
  originSessionId: ecbda5fc-4619-4e95-b4dc-d59ba138caf2
  modified: 2026-10-03T05:01:58.187Z
---

El 2-oct-2026, al ver Reportes rediseñado, el dueño pidió: *"eso mismo que hicimos ahí lo vamos a
hacer en todas las partes y pantallas de toda la aplicación o sistema; eso era lo que hacía falta, hay
que optimizar y mejorar todo el sistema así"*. Y: *"terminemos primero todo lo de reportes"*.

**Why:** Reportes pasó de 11 pestañas con emojis, textos ilegibles en modo noche y cifras que no
cuadraban entre pantallas, a 5 secciones donde todo se toca, todo cuadra por dos caminos y está
explicado para directivos sin conocimiento técnico. Él quiere ese nivel en todo.

**How to apply — el método (no saltarse pasos, uno por pantalla):**
1. Medir con datos reales en el navegador (sesión del dueño): qué dice, si es verdad, si cuadra con
   las otras pantallas, contraste en los dos modos, desbordes a 280/375, emojis.
2. Explicarle en palabras sencillas lo encontrado + dibujo (visualize) → su sí.
3. Construir con las mismas piezas: `Tarjeta`/`boton`/`plata` de `ResumenReportes`, `HojaDetalle`
   (ahora con `encabezado` y `acciones`), `BarraFiltros` (`soloHoy`, `textoFijo`, `sinGrupo`), tokens,
   lucide, cero emojis. Cada número abre su lista.
4. Probar: contraste 0 fallas (medidor en localStorage `__contraste`), sin desbordes, `npx vitest run`,
   `npm run build`, captura a 375. Declarar qué se tocó y qué no.
5. Subir solo con su sí.

**Orden propuesto (aún sin confirmar por él):** Cartera y Cobros → Panel → Mi Día → Clientes y su
ficha → Contratos → Motos y su ficha → Caja, Historial de pagos y Cobro diario → Liquidaciones → las
demás (Inmovilizaciones, Taller, Tarjetas y llaves, Alertas, Referidos, Usuarios, Configuración).

Detalle de lo hecho en Reportes: `docs/REDISENO-REPORTES.md`. Relacionado: [[plan-sistema-diseno]],
[[rediseno-visual-f1]], [[feedback-preguntar-hasta-que-quede-claro]].
