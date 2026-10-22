---
name: bug-diario-ahorro-no-acumula
description: Los contratos DIARIOS no acumulan ahorro — el motor cobra un solo dia por pago y tira el resto a saldo a favor. Verificado con ADOLFO (16-ago). SIN ARREGLAR.
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-18T15:51:14.796Z
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

## 🔲 Estado: SIN ARREGLAR — y sin medir

**Nada tocado.** El arreglo toca el motor de reparto, que es la pieza más delicada del sistema, y
el dueño no lo ha autorizado. Antes de proponer nada falta lo primero:

**Correr el barrido para saber a cuántos les pasa y cuánta plata hay mal clasificada:**

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
