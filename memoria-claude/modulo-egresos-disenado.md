---
name: modulo-egresos-disenado
description: "Módulo de EGRESOS — diseñado y aprobado con el dueño el 1-ago-2026, SIN construir. Las decisiones ya están cerradas: no re-preguntar."
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-01T23:10:01.418Z
---

# Módulo de egresos — diseño cerrado, construcción pausada

El dueño pidió el módulo, se definió completo pregunta por pregunta, y **decidió pausarlo antes
de empezar** ("mejor dejémoslo ahí"). **Las decisiones de abajo ya están tomadas — al retomar NO
hay que volver a preguntarlas.**

## El hueco que resuelve

Hoy el sistema mide muy bien lo que ENTRA y **no tiene absolutamente nada para lo que SALE**.
Verificado: no existe tabla ni módulo de egresos/gastos. Lo único que se registra es
`taller.costo` y `taller.repuestos`, atado a una orden y **sin sumarse en ningún lado**.
Y `caja_diaria` **solo cuenta entradas**: si alguien paga algo con el efectivo del día, el arqueo
da de menos y no hay dónde explicarlo — conecta directo con los descuadres de caja de esta semana.

## Las 4 decisiones del dueño (cerradas)

1. **Para qué lo quiere: las CUATRO cosas.** Que la caja cuadre · utilidad por portafolio ·
   costo por moto · gasto total por categoría. Por eso va **UNA sola tabla** bien diseñada, no
   módulos sueltos que después no se puedan sumar (el error de `deudas` vs `convenios`).
2. **Taller: A MANO.** El costo de la orden NO genera egreso automático. ⚠️ Se le advirtió el
   riesgo (el costo queda como dato suelto y la utilidad sale inflada si nadie lo carga) y
   eligió igual. **Mitigación acordada:** al cerrar una orden con costo, un aviso *"Esta orden
   costó $X. ¿Registrar el egreso?"* con el formulario prellenado — no automático, pero no
   depende de la memoria.
3. **Gastos generales (nómina, arriendo, servicios): APARTE, sin repartir.** Cada portafolio
   muestra sus ingresos menos SUS gastos; los generales van en un bloque "Empresa". Simple y
   nadie discute el reparto.
4. **Control: doble, como las transferencias.** Registra SECRETARIA/ADMIN → confirma ADMIN o
   ADMIN_PRINCIPAL. Hasta que no se confirme no descuenta de la caja ni entra a informes.

## Tabla `egresos` (migración pendiente, sería la 080)

`fecha` / `fecha_registro` (la caja usa la 2ª, igual que pagos) · `categoria` (nómina, repuestos,
mantenimiento, soat, tecnomecánica, arriendo, servicios, combustible, comisiones, otro) ·
`descripcion` · `proveedor` · `monto` · `metodo` · `sale_de_caja` (bool: si descuenta del efectivo
del día) · `grupo` (COSTA/PRADERA/RASTREADOR/USADAS/**GENERAL**) · `moto_id` (opcional) ·
`taller_id` (ata el egreso a la orden que lo originó → se ve cuál ya se cargó, no se duplica) ·
**`tipo`: operativo | inversión** · `estado` (Pendiente/Confirmado) · `registrado_por` ·
`confirmado_por` · `comprobante_url`.

**🔑 `tipo` es lo más importante del diseño.** Comprar una moto de $6M **no es gasto, es
inversión**: si se contara como gasto, ese mes el portafolio mostraría pérdida y sería falso. La
utilidad se calcula SOLO con los operativos; las inversiones se muestran aparte.

## Fórmulas

- **Arqueo:** `efectivo esperado = pagos en efectivo del día − egresos en efectivo que salieron de caja`
- **Utilidad del portafolio:** `ingresos del grupo − egresos operativos confirmados del grupo`

## Mapeo integral (si falta uno, los números no cuadran entre pantallas)

Caja Diaria (el arqueo resta) · Reportes (utilidad por grupo + gasto por categoría) · Ficha de la
moto (gasto por placa) · Taller (el aviso al cerrar) · módulo Egresos nuevo · menú sección
**Cobros & Dinero** (móvil y escritorio) · acciones `registrar_egreso` y `confirmar_egreso` ·
RLS (que SUBADMIN y SOCIO no vean los egresos de la empresa).

## Fases acordadas

F1 tabla + registrar/listar/confirmar (incluyendo ya **tipo**, **anular con rastro** y
**proveedor**: baratos ahora, carísimos con mil egresos cargados) → F2 caja diaria → F3 informes
+ **egresos recurrentes** (nómina/arriendo listos para confirmar con un clic, o el módulo se
abandona a los dos meses) + aviso si una categoría se dispara vs. el mes anterior → F4 ficha de
moto + aviso del taller.

## Pendiente de decidir (quedó abierto)

- **¿La foto del comprobante es obligatoria?** Recomendado: obligatoria en transferencias y montos
  altos, opcional en efectivo menor. Si se exige siempre, la gente inventa fotos o no registra.
- **Egreso retro-fechado sobre una caja ya cerrada** — el mismo problema sin resolver que los
  pagos (ver [[saldo-favor-y-caja-descuadre]]). Aparece en F2.

## ⚠️ Trampa anotada para el futuro

El gasto de una moto **prestada** es del portafolio **dueño de la moto**, no del contrato que la
anda usando. El diseño guarda `moto_id` directo, así que sale bien. **Si alguien "mejora" esto
derivando el grupo desde el contrato, revive el error que ya se corrigió con el alquiler de las
prestadas** (ver [[prestamo-liquidacion-verificados]]).

**Descartado a propósito:** amortizar el SOAT entre 12 meses. Más correcto contablemente, pero
complica todo y no cambia ninguna decisión.
