---
name: bug-diario-ahorro-no-acumula
description: Los contratos DIARIOS no acumulan ahorro — el motor cobra un solo dia por pago y tira el resto a saldo a favor. Decision 22-ago; no mas diarios (wizard sin la opcion), motor NO se toca; ADOLFO se corrige por datos y se gradua.
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-24T02:35:44.546Z
---

# Los contratos DIARIOS no acumulan ahorro — y la empresa no cobra lo que ganó

**Encontrado el 16-ago-2026**, al preguntar el dueño cómo hacerle el cambio de moto a ADOLFO
ANTONIO GAMEZ BADILLO (CC 72211954, RLT70H, COSTA), que según él **ya había completado su base**.

El sistema decía que iba en **$100.000 de $510.000 (20%)** y `base_completada = false`.
**El dueño tenía razón y el sistema estaba mal: ADOLFO iba en $493.000 — el 97%.**

## Los números de ADOLFO (verificados contra la BD, no estimados)

Contrato `9e87ec9d-4268-42aa-8271-1a164b56ea58` · entrega 27-jul · 14 pagos confirmados ·
`motor_v2 = false` · sin deudas · sin convenios.

| | Debió ser | El sistema anotó |
|---|---:|---:|
| Tarifa (de la empresa) | **$487.000** | $351.000 |
| Ahorro (del cliente) | **$393.000** | **$0** |
| Saldo a favor | **$0** | $529.000 |
| | $880.000 | $880.000 |

La plata está toda adentro — **está mal clasificada.** De esos $529.000 de "saldo a favor",
$393.000 son ahorro del cliente y $136.000 son ingreso que la empresa ya se ganó.
**Ni un peso es saldo a favor de verdad.**

Ahorro real = $100.000 (lo que entregó al registrarse) + $393.000 = **$493.000 de $510.000.**
Le faltaban **$17.000** — un día de pago.

## La causa (verificada en el código)

El motor de reparto (`aplicar_pago_confirmado`) reparte contra **cajas semanales**, y **el Diario
quedó fuera de ese motor a propósito** (spec del libro de cajas: *"Diario queda FUERA"*;
mig 045:161 `if v_contrato.motor_v2 and v_contrato.forma_pago <> 'Diario'`).

Sin cajas donde caer, cada pago diario hace esto:
1. cobra la tarifa de **UN solo día** ($27.000), sin importar cuántos días cubra el pago,
2. y **todo el resto cae al último cajón: saldo a favor.**

Y como `aplicado_ahorro` llega en **0 explícito** (no `null`), el motor lo respeta y **nunca**
entra al cálculo por proporción del `elsif` (mig 045:402-405). Cero ahorro, siempre.

### El ejemplo que lo prueba — el pago del 4-ago

Pagó **$125.000**, que cubren domingo 2 ($25.000) + lunes 3 ($50.000) + martes 4 ($50.000).

| | Empresa | Ahorro | Saldo a favor |
|---|---:|---:|---:|
| Lo correcto | $68.000 | $57.000 | $0 |
| Lo que anotó | $27.000 | $0 | $98.000 |

Cobró **un día de tres**. Ese patrón se repite en los 14 pagos: `aplicado_tarifa` es
**exactamente $27.000** en todos, y el sobrante siempre a saldo a favor.

## Las dos caras del daño

- **Al cliente:** su ahorro dice 20% cuando va en 97%. **La alerta "🎯 Base completada" no iba a
  saltar nunca**, así que nadie se habría enterado de que ya puede graduarse.
- **A la empresa:** reconoció $351.000 de ingreso cuando ganó $487.000. Los $136.000 de diferencia
  quedan marcados como **saldo a favor = plata que el sistema dice que le DEBE al cliente.**
  Si ADOLFO liquidara, se le devolvería plata que ya es de la empresa.

## ✅ Decisión del dueño (22-ago-2026): no más diarios — el motor NO se toca

El barrido se corrió y solo quedaban **2 diarios vivos**: ADOLFO (RLT70H, $610.000 mal
clasificados) y BASANTA (RMY55H, **0 pagos** — entregó la moto hace mucho sin reportarse, su
LIQ-0003 está atascada en revisión de taller; sus días rodados sin pagar se cargan A MANO como
deuda en esa revisión porque el diario no tiene motor que los calcule).

Textual: *"ya diarios no habrán más y para el de adolfo está programado el cambio de moto y mejor
sería hacerle sus verdaderas cuentas para liquidar y cambiarlo a semanal como debe ser"*.

- **Wizard sin "Diario"** desde el commit `06ed027` del 22-ago (la ruta diaria arranca Semanal).
- **ADOLFO ✅ CORREGIDO — el dueño corrió el SQL el 23-ago y la verificación dio exacta**
  (tarifa 652.000 · ahorro 393.000 · saldo_favor 0 · acumulado 493.000). Queda: el REMATE de los
  pagos que entren después del 22-ago (mini-SQL el día de la graduación, misma regla) → liquidar
  → "sigue con la empresa" → contrato Semanal. El SQL llevó un seguro: se frena si el conteo de
  pagos ya no es 17. Detalle del cálculo original: camina los 17 pagos día a día con tarifa-primero
  (L-S $27.000 / dom $14.000). Resultado al corte 22-ago: tarifa $652.000 (de $663.000 de 26 días
  rodados 28-jul→22-ago → debe $11.000 de hoy sábado), ahorro nuevo $393.000, saldo a favor $0,
  `ahorro_acumulado = $493.000` (faltan $17.000 para la base). ⚠️ Los pagos que entren DESPUÉS de
  correr el SQL vuelven a quedar mal (el motor sigue igual) — el día de la graduación se remata con
  un mini-SQL de los pagos nuevos. Luego: liquidar con el flujo nuevo → [[graduacion-cambio-moto-flujo]].

### La tabla del SQL de ADOLFO (por si hay que regenerarlo sin el chat)

El SQL hace 3 cosas EN ESTE ORDEN dentro de un solo `begin…commit`: ① insert en
`contratos_auditoria` con la foto de ANTES (sumas agregadas), ② update de los 17 pagos con estos
valores (t=aplicado_tarifa, a=aplicado_ahorro; deuda/convenio/saldo_favor/prorrateo=0 y el jsonb
`aplicado = {deuda:0, semana:t, ahorro:a, convenio:0, saldo:0}` — el jsonb TAMBIÉN, porque las
pantallas lo usan de respaldo cuando la columna es 0), ③ `ahorro_acumulado=493000` en el contrato
`9e87ec9d-4268-42aa-8271-1a164b56ea58`. Verificado: el trigger del motor solo salta con `update of
estado`, así que tocar los aplicado_* NO re-reparte.

| pago id | fecha | valor | t | a |
|---|---|---:|---:|---:|
| 02bf2317-575c-47d8-b5f2-4dfc87af984a | 28-jul | 27.000 | 27.000 | 0 |
| c2091959-1bc1-4d75-b499-bbd73c42e4d1 | 28-jul | 23.000 | 0 | 23.000 |
| ba5d5712-1d4a-4b0d-a405-03a9148d68f2 | 29-jul | 50.000 | 27.000 | 23.000 |
| d52514be-a1fc-468f-a593-bc28b113c8af | 30-jul | 50.000 | 27.000 | 23.000 |
| 9fda7ef5-d805-4d28-ac33-2c41ee24e29e | 31-jul | 50.000 | 27.000 | 23.000 |
| 63254deb-8f17-4a8b-abfd-b12a50d48477 | 1-ago | 50.000 | 27.000 | 23.000 |
| 1289373d-0be3-44cf-8b69-98815bbb2b89 | 4-ago | 125.000 | 68.000 | 57.000 |
| 06c4c62b-d7f7-4df5-b2d6-4774b9aa0cc6 | 6-ago | 100.000 | 54.000 | 46.000 |
| 3e3c2004-cfbf-484f-b537-ab18fb0d1002 | 8-ago | 50.000 | 50.000 | 0 |
| cc3523f6-ae0f-42e8-b094-9ae280450415 | 11-ago | 125.000 | 72.000 | 53.000 |
| b2f3a21b-99c7-490c-a246-5f74b34979cc | 12-ago | 100.000 | 27.000 | 73.000 |
| cc7af4a5-c99b-4901-ad22-03596963a811 | 13-ago | 50.000 | 27.000 | 23.000 |
| eeda9b10-97c1-4e2a-9301-1bfe70f9e84e | 14-ago | 50.000 | 27.000 | 23.000 |
| dd24cae6-d88d-4bc2-9119-85a39530f39e | 15-ago | 30.000 | 27.000 | 3.000 |
| ad8b627e-ef38-4355-8181-e6453b8187a6 | 19-ago | 75.000 | 75.000 | 0 |
| 427ad9c2-523a-4497-8f85-3ead963c62c5 | 21-ago | 60.000 | 60.000 | 0 |
| 15a4f92f-5c5a-4525-a138-89ffcb0fb81a | 22-ago | 30.000 | 30.000 | 0 |

Totales: t=652.000 · a=393.000 · suma=1.045.000 ✓. Domingos del rango: 2, 9 y 16 de agosto.
⚠️ Si ADOLFO pagó otra vez ANTES de correr el SQL, la tabla ya no sirve tal cual — rehacer el
recorrido desde el 22-ago con los pagos nuevos (misma regla tarifa-primero).

El barrido original, por si aparece otro diario escondido:

```sql
select c.nombre, m.placa, m.grupo, ct.fecha_entrega,
       ct.ahorro_acumulado                       as ahorro_que_marca,
       sum(p.valor)                              as ha_pagado,
       sum(coalesce(p.aplicado_tarifa,0))        as reconocido_empresa,
       sum(coalesce(p.aplicado_ahorro,0))        as reconocido_ahorro,
       sum(coalesce(p.aplicado_saldo_favor,0))   as mal_clasificado
from public.contratos ct
join public.clientes c on c.id = ct.cliente_id
left join public.motos m on m.id = ct.moto_id
left join public.pagos p on p.contrato_id = ct.id and p.estado = 'Confirmado'
where ct.forma_pago = 'Diario' and ct.estado in ('Activo','Suspendido')
group by c.nombre, m.placa, m.grupo, ct.fecha_entrega, ct.ahorro_acumulado
order by mal_clasificado desc nulls last;
```

**La regla correcta está en CLAUDE.md y no cambia:** *"Cada pago: ahorro = pago − tarifa del día"*
($27.000 L-S · $14.000 domingo). El arreglo tiene que cobrar la tarifa de **todos los días que
cubre el pago**, no de uno.

⚠️ Método obligatorio si se toca: leer la función **de la base viva** con `pg_get_functiondef()`,
nunca transcribirla del repo (lo destapó la mig 083), y escribir la prueba del comportamiento
ACTUAL antes de cambiar nada.

## Lo otro que salió: el cambio de moto (graduación) no existe

El dueño preguntó cómo hacerle el cambio de moto a ADOLFO. **No hay ningún botón.** Cuando la base
se completa el sistema solo muestra la alerta y el letrero verde *"🎯 Base completada — listo para
nuevo contrato"* (`ContratosView.tsx:532`). El flujo Diario→tiempo definido está marcado como
diferido desde hace meses. Hoy se hace a mano, y tiene **tres trampas**:

1. 🔴 **Regalar la moto.** Al cerrar el contrato viejo por Liquidación, el motivo viene por defecto
   en **"Cumplimiento"**, que manda la moto a **"En traspaso"** (sale de la flota, es del cliente)
   e imprime Paz y Salvo. Para una graduación eso está mal — **el motivo correcto es "Retiro
   voluntario"**, que la devuelve a *Disponible*.
2. 🔴 **Contar el ahorro dos veces.** El ahorro vive en el contrato viejo. Si se crea el nuevo con
   la base escrita a mano y el viejo conserva la suya, el cliente queda con el doble en el sistema
   y se le pagaría dos veces al liquidar. **Hay que moverlo, no copiarlo.**
3. 🟡 **El orden.** Si se liquida primero, el cliente queda *Egresado*/*Retirado* y el wizard solo
   acepta clientes en *Aprobado* → queda trancado. **Primero el contrato nuevo, después cerrar el
   viejo.** No es opinión: `useLiquidaciones.ts:254-262` no le cambia el estado al cliente si tiene
   otro contrato activo, y el comentario pone de ejemplo textual *"graduación Diario→tiempo
   definido"*. Quien lo escribió previó este caso, pero solo dejó lista esa mitad.

**A ADOLFO no se le hizo el cambio todavía**, a propósito: con su cuenta mal escrita y $529.000
marcados como devolvibles, liquidar ese contrato era peligroso. Primero se endereza la cuenta.

**Why:** es plata real, en los dos sentidos — al cliente no se le reconoce su ahorro y a la empresa
se le anota como deuda un ingreso que ya se ganó. Y afecta a todos los de ruta diaria, no a uno.

**How to apply:** antes de tocar cualquier cosa de contratos diarios (ahorro, base, graduación,
liquidación), leer esto. El barrido va primero; el arreglo del motor va después y con permiso
explícito. Relacionado: [[libro-de-cajas-motor-v2]] · [[base-inicial-circuito-completo]] ·
[[liquidaciones-auditoria-y-huecos]] · [[bateria-pruebas-ciclopago]].
