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
- **Por grupo: HECHA (2-oct, tarde)**, con las reglas D-032 (lo pagado y lo recuperado solo con plata;
  lo que pasó a un acuerdo va aparte), D-033 (retenidas = contratos detenidos sin otro cliente, estén
  donde estén) y D-034 (contrato andando con la moto en el taller: aparte). Los grupos lado a lado
  (con su total), y el detalle del elegido: plata (empresa/ahorro/base, cuánto deja cada moto
  trabajando), cumplimiento, dónde están las motos (`dondeEstaCadaMoto`, suman el total) y cómo van
  pagando los que tienen la moto; todo se toca. Filtros: período, grupo, cobrador y modalidad (la
  modalidad que tenía la pantalla vieja no se perdió). Medido con septiembre: los 4 grupos suman
  $231.951.802; COSTA 226 motos = 172 + 2 + 24 + 2 + 26, y 172 = 69 + 0 + 103. En mora 166 y retenidas
  42 iguales en Resumen, Por admin, Por grupo y Flota. Contraste: 0 fallas en oscuro y claro (109
  textos). Sin desbordes a 375/320/280.
- **Por admin: HECHA (2-oct, tarde)**, con D-035 (a cada cobrador solo lo de sus motos desde que las
  tiene). Es la misma pieza de Por grupo (`PortafoliosReportes.tsx`) en la mirada del cobrador: los
  cobradores lado a lado (del que más cumplió al que menos) más una fila "de antes de que se asignaran
  las motos" para que sume el total; el detalle con cumplimiento, plata, motos, clientes y **lo que hizo
  en el período** (gestiones que registró: mensajes, llamadas, WhatsApp, recolecciones, sirenas, plazos,
  cobros en la calle). Botones: sus contratos, su nómina, Cartera (ahora filtra por cobrador:
  `;cobrador:<id>`), Excel. Septiembre: Ariza $44,8M, Alvarez $51,7M, Brandon $59,7M, Lumar $49M + $26,7M
  de antes de asignar = $232M. **Decisión de diseño mía, para que el dueño la vea:** al cobrador no se le
  compara la plata con el período anterior (sus motos cambian de un mes a otro: en septiembre se
  asignaron 200), ni en Por admin ni en el Resumen con un cobrador filtrado; para comparar cobradores
  está el cumplimiento. Contraste 0 fallas (125 textos), sin desbordes a 375/280.
- **Siguen:** Cobranza (cartera, convenios, recolección), Equipo (nómina, visitas) y Flota (flota,
  guardadas, entregas), cada una con dibujo aprobado antes.

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

## Revisión con agentes (2-oct, tarde)

Pedida por el dueño. 4 revisores (veracidad, negocio, uso y diseño, robustez) y un verificador por cada
uno que intentó tumbar cada hallazgo leyendo el código: 43 confirmados (muchos repetidos entre sí), 1
tumbado (visitas y recepciones sin páginas: hoy son 156 y 268, lejos de 1.000). Agrupados:

**Arreglo corto, hecho el 2-oct (tarde):** 1, 2, 3, 5 (textos), 9, 13 y 14, más la lista de los
selectores en modo noche (punto 8). Medido: septiembre $231.951.802 en 1.450 pagos, igual a la base;
$3.644.000 del acuerdo de base pasan de Empresa a Base (68 de 68 acuerdos iguales a
`base_pagada_en_acuerdo`); los 3 grupos suman el total; ningún pago sin repartir; con "En mora hoy"
marcado en Por admin el Resumen ya no cambia; la nómina dice "Cargando…" y no deja pagar ni imprimir
hasta tener todo. Hoy no hay ningún cierre de nómina guardado (0): el defecto 14 no alcanzó a pasarle a
nadie. Tampoco hay pagos registrados como `alquiler_reemplazo` (0): el punto 10 no mueve cifras hoy.
Quedan para la revisión de cada pantalla: 4, 6, 7, 8 (resto), 10, 11, 12 y los de C y D.

**A. Errores del Resumen subido hoy (chicos, arreglar primero)**
1. Filtros escondidos: Modalidad y Estado marcados en Por admin / Por grupo / Exportar recortan el
   Resumen (plata y estados) y la barra no lo dice ni deja quitarlos (ReportesView 843-848, 1560;
   BarraFiltros 47, 95-105). La tarjeta Por grupo no los usa: la misma pantalla se contradice.
2. Mientras carga o si se cae la señal: $0 con el sello verde "todo cuadra" (ReportesView 567, 693).
3. El sello se aprueba solo: "los cobradores suman el total" repite "los grupos suman el total" (misma
   base, 865/310); con filtro, recaudo = suma de grupos por construcción. Dice "clientes" y cuenta contratos.
4. "Abrir en Cartera" no lleva el cobrador (en recolección tampoco el grupo) y al volver, Reportes
   olvida período, filtros y pestaña (ReportesView 520, 1648-1650).
5. Textos de ayuda: dice que el ahorro siempre se devuelve (contradice D-023) y "fecha en que pagó" (el
   efectivo cuenta por el día en que se digitó) (ResumenReportes 108).
6. "Plata sin producir" suma motos cuyo contrato sigue cobrando (taller/garantía/fiscalía/tránsito, regla
   del 30-jul) y deja fuera las Disponibles quietas; usa tarifa L-S en domingo (ReportesView 1638-1640).
7. "vs período anterior" en "Este mes" compara días que no se parecen (1-2 oct jue-vie contra 1-2 sep
   mar-mié, día de cobro) (ReportesView 157).
8. Visual: barras de la gráfica muy delgadas para tocar; lista de los selectores con letra oscura en modo
   noche (BarraFiltros 22); en computador una sola columna estirada; la hoja no se cierra con Esc;
   "Recaudado hoy" de arriba no obedece filtros; las pestañas se mueven al tocarlas.

**B. Cifras que vienen de antes y afectan varias pestañas**
9. Lo pagado al acuerdo de base sale como "Empresa"; por D-023 y mig 177 es del cliente (reportesResumen 52).
10. El alquiler de la moto prestada se le suma al grupo de la moto original; la regla del 30-jul dice que
    es del grupo de la prestada (ReportesView 714).
11. Filtro por cobrador: se atribuye por quién tiene la moto HOY, no cuando se cobró; existe
    `motos.subadmin_asignado_desde` y no se usa (ReportesView 717).
12. "En mora" y "Retenidas" cuentan distinto según la pestaña (174/179, 23/46).
13. Pagos de a 1.000 ordenados solo por `created_at`, sin desempate: en el borde de una tanda uno puede
    repetirse y otro perderse. Es de toda la app (createTableStore 147).
14. Nómina: se puede "Cerrar y pagar" con datos a medias (si falla la consulta cae al método viejo sin
    avisar; al pasar de semana usa las cajas de la anterior) y puede salir "Pagado" con el cierre de otra
    semana (useNominaCierres 54-61, 119-121; ReportesView 591, 641-646, 2161). Un cierre no se edita.

**C. Ideas nuevas para directivos**
15. Por grupo: cuánto deja cada moto, cuántas trabajando, separar lo de la empresa.
16. Plata de los clientes que guarda la empresa (ahorro + base) y cuánto saldría si se liquidara hoy a
    los que están en riesgo.
17. Liquidaciones del período: cuántas, por qué, cuánto se devolvió y cuánto se perdió.
18. Tendencia: cumplimiento contra el mes anterior y quiénes se dañaron este mes.
19. Medir al cobrador justo: desde que tiene la moto, y promesas de pago cumplidas.

**D. Fondo**
20. Partir el archivo de 3.216 líneas, sacar las cuentas de plata a funciones con pruebas; cada pago que
    entra rehace las 11 pestañas; la hoja de detalle pinta miles de filas de una vez.
