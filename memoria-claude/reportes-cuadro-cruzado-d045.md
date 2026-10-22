---
name: reportes-cuadro-cruzado-d045
description: "Cuadro cobrador x grupo en Reportes (D-045, 8-oct-2026): Portafolios › Cruzado con 5 vistas, Flota con Motos/Paradas, Equipo solo enlace. Cómo se verificó que cuadra y la trampa del total de Flota."
metadata:
  node_type: memory
  type: project
  originSessionId: ecbda5fc-4619-4e95-b4dc-d59ba138caf2
  modified: 2026-10-08T15:41:05.265Z
---

Pedido del dueño el 8-oct: ver en Equipo las motos de cada cobrador por grupo y en Flota quién tiene las
de cada grupo. Se le propuso y aprobó (D-045) UN cuadro con lugar dueño en **Portafolios › Cruzado**
(vistas Motos, Paradas, Debe hoy, Recaudado, Cumplimiento + Excel de 5 hojas), el mismo en **Flota ›
Motos** solo con Motos/Paradas, y en **Equipo › Nómina** solo un enlace. Él preguntó "¿es lo más
práctico, óptimo y profesional?" y la respuesta honesta fue "casi": quitar la tabla repetida de Equipo.

**Cómo se probó que cuadra (8-oct):** leyendo en el navegador las cifras de Por grupo / Por cobrador /
Flota / Cobranza y comparándolas con las columnas y filas del cuadro: iguales cifra por cifra. Los Excel
se leyeron SIN bajarlos: se atrapa el Blob con `URL.createObjectURL` + `HTMLAnchorElement.prototype.click`
y se lee con `xlsx-js-style` (`.default`) importado de `/node_modules/.vite/deps/`; restaurar en `finally`.

**Trampa:** el total "Debe hoy" del Excel de Flota (moto por moto) NO es el de Cobranza: faltan los
clientes cuya moto ya tiene otro cliente (8-oct: 11 clientes, $14.271.500). El Excel lo dice en su leyenda.
Al comparar dos descargas en vivo, un pago puede entrar entre las dos (pasó: $202.000) — repetir antes de
llamarlo error.

**Manual v3 por preguntas (8-oct, 42e20d0):** 31 páginas, índice «¿Qué quiere saber?» (23 preguntas) que se arma
solo al imprimir, «Cómo llegar» en cada página. Lo que sirvió para no entregar mocho: `revisar-paginas.mjs`
(mide cada sección a A4 = 688×1009 px y le toma foto) + contar páginas del PDF contra secciones; y mirar
cada página: 4 señales cruzaban datos (tapaban una placa, tachaban «PDF») y hubo que re-apuntarlas. Ver
[[rediseno-toda-la-app-metodo-reportes]] · [[consultar-base-desde-el-navegador]] · [[manual-operacion-pdf]].
