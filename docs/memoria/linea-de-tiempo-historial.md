---
name: linea-de-tiempo-historial
description: "Línea de tiempo por cliente y por moto (pestaña Historial) — construida, verificada y con 10 correcciones adversariales"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-09-23T01:34:50.593Z
---

# Línea de tiempo / Historial (25-jul-2026) — EN PRODUCCIÓN

Pedido del usuario: *"un historial por persona, cliente, contrato o moto donde se pueda saber toda la línea de tiempo y los eventos… y que se diga lo más claro a qué aplica cada cosa en las fechas que aplican, todo bien masticado para que el funcionario entienda y no haya errores con los clientes"*.

## Qué es (commits `abdde0b` + `8fb4687`)
- **`src/utils/lineaTiempo.ts`** — `construirLineaTiempo({clienteId|motoId}, fuentes)` une ~20 tipos de evento de 10 fuentes (pagos con desglose, deudas, convenios, gestiones, visitas, taller, préstamos tarjeta/llave, contrato creado/entrega/empalme/validación guardado, cliente registrado) + `agruparPorMes` + `desglosarPago`.
- **`src/components/LineaTiempo.tsx`** — resumen arriba (va en cuota X de N · pagos hechos · ahorro · veces recogida), filtros por categoría, agrupado por mes, botón **Imprimir**.
- Integrado: **FichaClienteView** (pestaña nueva "🕘 Historial") y **FichaMotoView** (dentro del tab "Historial"). En modo moto se omiten registro/visitas del cliente (ruido).
- **Fix de paso:** al tipo `Pago` le faltaban `aplicado_prorrateo` y `aplicado_base_inicial` (existen en BD desde mig 013/045 y el insert las escribía) → pagos a prorrateo/base salían "sin desglose".

## Reglas clave (no romper)
- **Desglose de pago** calcado de CobrosView: columnas `aplicado_*` con respaldo al jsonb legacy `aplicado`, **pero el ahorro usa `??` y NO `||`** ($0 es real con tarifa-primero).
- **El ahorro NO se imprime** (misma decisión que el estado de cuenta) — en pantalla sí. Se marca con `interno: true` en la línea de desglose.
- **Las gestiones de cobranza son `interno: true`** → no van en el papel que recibe el cliente (sirena, recolección, plazos, notas del funcionario).
- **Fechas:** los timestamptz se convierten con `fechaISO()` (America/Bogota). NUNCA `slice(0,10)` sobre un timestamptz — manda al día siguiente todo lo de después de las 7pm.
- **`cobro_campo` se omite de gestiones**: el pago ya cuenta ese dinero, la gestión lo duplicaba.
- **Alquiler de reemplazo**: sus `aplicado_*` están en 0 A PROPÓSITO (mig 053) → `desglosarPago` devuelve `[]`, no "pago antiguo".
- **Saldo a favor**: el título usa `Math.abs(aplicado_saldo_favor)` (consumo real), no `p.valor` (crédito enviado).
- **Ventana de tiempo**: taller y tarjeta/llave solo se atribuyen al cliente si caen entre su `fecha_entrega` y la entrega al siguiente cliente de esa moto.

## Verificado en producción
ALEJANDRO NIETO (17 pagos): *"Pagó $105.000 → Cubrió cuota $90.000 · Abonó a la deuda $15.000 · De la cuota, ahorro $26.000"*. Ficha de moto OK. 0 errores de consola.

## 🔲 Conocido sin arreglar
Si un contrato tuvo **préstamo de moto de reemplazo**, el vínculo moto↔contrato usa `contratos.moto_id` (puntero vivo que el swap cambia), así que la historia puede atribuirse a la placa actual en vez de la que tenía en ese momento. Arreglarlo requiere reconstruir con `prestamos_reemplazo` (fecha_inicio/fecha_fin).

Ver [[nav-y-performance]], [[libro-de-cajas-motor-v2]].
