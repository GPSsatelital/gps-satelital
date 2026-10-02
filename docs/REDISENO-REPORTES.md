# Rediseño de Reportes — diagnóstico (2-oct-2026)

## Avance

- **Parte 1 — Resumen: HECHA (2-oct).** Lo que quedó, medido en la app con los datos de septiembre:
  - Barra de filtros (período · grupo · cobrador) que manda sobre todo lo de abajo, con la línea
    "Viendo: …" y una franja flotante arriba cuando se baja en la pantalla.
  - Recaudado ($229.704.802 en septiembre, igual a la base) separado en empresa / ahorro / base y saldo
    a favor, más efectivo, transferencias y cobrado en la calle, y la comparación con el período anterior.
  - "Cómo están los clientes" con dos columnas: **hoy** y **al cierre del período**. La del cierre se
    reconstruye con la fecha de cada pago; contra las fotos guardadas coincide en 92 % a 100 % de los
    contratos. No incluye los diarios ni los contratos cerrados después de esa fecha (por eso el asterisco).
  - Antigüedad de la mora por tramos, recaudo por día / semana / mes según el período, cuenta por grupo
    (tocar un grupo filtra el reporte), los 8 que más pagaron, plata sin producir de las motos guardadas.
  - Todo número se toca: abre la lista de quiénes son (15 probados, todos con la cantidad correcta), y
    desde ahí "Abrir en Cartera" ya filtrada (Cartera acepta llegar con filtro y grupo) o descargar.
  - Sello "Cifras verificadas": los grupos suman el total, los cobradores suman el total, los estados
    suman los contratos vigentes.
  - Contraste: 0 textos ilegibles en modo oscuro y claro (119 medidos). Sin desbordes a 280/320/375 px.
- **Partes 2 a 4 — Cobranza, Equipo, Flota:** pendientes, cada una con dibujo aprobado antes.

Pedido del dueño (2-oct): *"organizar, optimizar, darle practicidad y dinamismo a la pantalla de reportes"*,
en 7 puntos: modo oscuro legible · las fechas aplican a todo · todo se puede tocar · el toque lleva a
donde corresponde con lo específico · filtros por grupo en cada pestaña · reestructurar para que sea
claro, explicado y veraz · nivel premium con ayudas visuales.

Todo lo de abajo está **medido en la app** (celular, 375 px, modo oscuro, datos del 2-oct), no supuesto.
Nada se ha cambiado todavía.

## 1. Modo oscuro — textos que no se leen

Escáner de contraste sobre cada texto de cada pestaña (mínimo para leer bien: 4,5 a 1; títulos grandes 3 a 1).

| Dónde | Qué | Contraste |
|---|---|---|
| Arriba de todo (sale en las 11 pestañas) | "Resumen operativo y financiero…" · "Recaudado hoy" | 1,1 a 1 |
| Nómina | botón "Cerrar y pagar" (letra del color del fondo) | 1,1 a 1 |
| Entregas | botón "Resumen" | 2,1 a 1 |
| Por admin / Por grupo | el porcentaje "36%" | 2,1 a 1 |
| Cartera | "57 en recolección" · "9 en liquidación, moto ya reasignada" | 2,6 y 2,4 a 1 |
| Todas | etiquetas pequeñas en gris (10-11 px): "Al día", "Gabela", "Total recaudado"… | 3,2 a 3,9 a 1 |

Textos que no pasan, por pestaña: Resumen 37 · Por admin 16 · Nómina 6 · Por grupo 14 · Visitas 7 ·
Cartera 130 · Convenios 33 · Flota 20 · Guardadas 4 · Entregas 9 · Exportar 9.

## 2. Las fechas — qué obedece al filtro y qué no

Comparado indicador por indicador con "Hoy" contra "Este año":

- **Sí cambian:** recaudado (total, efectivo, transferencias, en campo), cumplimiento del período,
  ranking de cobradores, visitas, entregas.
- **No cambian (son "foto de hoy", decisión D-029):** el bloque "Cómo están hoy" (motos, al día, gabela,
  en mora, retenidas) en Resumen, Por admin y Por grupo.
- **No tienen selector de fecha:** Cartera, Convenios, Flota, Guardadas (foto de hoy). Nómina tiene su
  propio selector de semana.
- **Confuso:** el conteo "HOY: 76 motos" de cada cobrador cambia con la fecha (76 → 75), porque suma
  contratos ya cerrados que pagaron en el período.
- **No obedece:** la gráfica "Recaudo diario — últimos 14 días" muestra siempre 14 días.

## 3 y 4. Qué se puede tocar y a dónde lleva

- **Se puede tocar hoy:** las tarjetas de grupo del Resumen (llevan a Motos del grupo), y los renglones
  de clientes y motos en Cartera, Flota, Guardadas y Entregas (llevan a la ficha).
- **No se puede tocar:** ningún número grande (recaudado, efectivo, transferencias, cumplimiento, al día,
  gabela, en mora, retenidas, deben hoy, convenios, flota, guardadas, visitas, entregas), ni los 3
  avisos de arriba (recolección, base, documentos), ni las gráficas.
- **Destinos que no aceptan llegar filtrados:** Cartera (no se puede abrir ya en "Mora" o en un grupo),
  Inmovilizaciones, Historial de pagos, Taller. Solo Clientes, Motos y Contratos aceptan un filtro.

## 5. Filtros por grupo y cobrador

- **Tienen** (grupo, cobrador, modalidad, estado): Por admin, Por grupo, Exportar.
- **Tienen el suyo:** Entregas (por grupo), Guardadas (agrupa por grupo / encargado / dónde).
- **No tienen:** Resumen, Visitas, Cartera, Convenios, Flota, Nómina.

## 6. Números que no cuadran dentro del mismo reporte

- **"En mora" dice 175** en Resumen, Por admin y Por grupo, **y 179** en la pestaña Cartera (y en Cartera
  de la app). La diferencia: 4 clientes con la moto en taller o garantía y el contrato activo, que el
  primero cuenta como "retenidas".
- Igual con **"Motos" 322** contra 331 contratos, y **"Retenidas" 45** contra 50.

## Preguntas para el dueño (una por una)

1. Lo que hoy es "foto de hoy" (en mora, al día, flota, convenios): si se elige "Mes anterior", ¿se
   muestra cómo estaban al cierre de ese mes, o se queda como foto de hoy bien marcada?
