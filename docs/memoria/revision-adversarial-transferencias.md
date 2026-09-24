---
name: revision-adversarial-transferencias
description: Control de transferencias (mig 064) — revisión adversarial de 20 defectos; bloques A-E COMPLETOS y en producción. Falta probar con logins reales (secretaria/subadmin)
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-09-24T15:17:40.531Z
---

# ✅ COMPLETO — A, B, C, D y E en producción. Falta PROBAR con los logins reales.

Revisión adversarial (24 agentes, 25-jul-2026) sobre la Fase 2 del plan `humble-dazzling-phoenix`
(⚠️ **ese archivo se perdió** — 2º caso de un plan desaparecido de `.claude/plans/`; lo que quedó
de él es la regla de las tres fechas del pago, en el índice de memoria):
**20 defectos confirmados, 4 bloqueantes**. Los 3 más graves los verifiqué contra el código real
antes de tocar nada — eran ciertos. Reglas de negocio en [[reglas-dinero-referencia-efectivo]].

## Commits (todo frontend + hook, **sin SQL nuevo**)
- `1e438d9` — bloques A-D (cruce, fecha, arqueo, visibilidad de la referencia)
- `2d2888e` — reglas del usuario (referencia = valor exacto · efectivo no cierra si no cuadra)
- `e0ce2fb` — bloque E (Cobro Diario + cruce mudado al embudo de confirmación)

`tsc`, `npm test` (21 ✓) y build limpios en cada uno.

## Qué quedó

**Cruce con el dinero sin dueño**
- **Una referencia = UN valor exacto.** Si el monto no es idéntico al del extracto → bloquea en
  **las dos direcciones**, con casilla de visto bueno solo tras revisar la foto. El visto bueno
  se invalida al cambiar valor o referencia. *(Mi primera versión dejaba pasar el pago menor
  guardando el resto — el usuario lo corrigió: eso es señal de algo raro, no un abono parcial.)*
- `asignarAPago` exige `estado=pendiente` + `pago_id is null` (candado anti doble-uso). Si falla:
  *"el pago SÍ quedó registrado — NO lo vuelvas a registrar"*.
- **El cruce vive en `usePagos.confirmarPago`** (`cruzarConDineroSinDuenio`), no en cada pantalla:
  es el único embudo por el que pasan TODAS las transferencias y siempre lo opera SECRETARIA/ADMIN
  (los únicos con permiso RLS sobre `ingresos_no_identificados`). Cubre los 4 puntos de
  confirmación y evita que un punto de registro futuro reabra el hueco. Compara referencia
  **normalizada** + **monto exacto**.
- `rechazarPago` y `eliminarPago` devuelven la partida a `pendiente` (`liberarDineroSinDuenio`) —
  antes quedaba `asignado` con `pago_id` nulo, invisible para siempre.

**Fecha del pago:** referencia y fecha se limpian al cambiar de cliente / registrar / botón atrás.
Si el cruce deja de aplicar, la fecha adoptada vuelve a hoy. El calendario se **bloquea** cuando
la fecha viene del extracto. Rango (no futura, máx 60 días) validado en el handler.

**Arqueo de caja:** **dos diferencias independientes** (efectivo y banco) — antes se sumaban y un
faltante de efectivo se tapaba con un sobrante del banco mostrando *"✓ Cuadra exacto"*. Campo
vacío = *"no se verificó"*. Valores limpiados al abrir otro grupo. **El efectivo no deja cerrar
si no cuadra** (botón deshabilitado). El banco sí deja cerrar. `caja_diaria.diferencia` guarda el
descuadre de caja física, nunca la suma neteada.

**Cobro Diario:** foto del comprobante **obligatoria** (era la vía del ADMIN/SUBADMIN en la calle
sin ningún respaldo — para ellos el método arranca en Transferencia). Referencia y comprobante ya
no se heredan del cliente anterior.

**Visibilidad:** la referencia se ve en "⏳ Por confirmar" y en el historial, roja si repetida.
El aviso de "no está en el dinero sin identificar" dejó de ser alarma amarilla: saltaba en casi
todos los pagos normales y por eso dejaba de leerse cuando importaba.

## Verificado en navegador (datos de prueba creados y borrados; nada real alterado)
pago mayor/menor → ⛔ bloqueado con la casilla · referencia que deja de cruzar → fecha vuelve a
hoy · referencia repetida → ⛔ con nombre del cliente, no abre la confirmación · arqueo −100k
efectivo/+100k banco → los dos por separado · abrir otro grupo → campos en blanco · Cobro Diario
sin foto → bloquea · referencia limpia al cambiar de cliente · matching del cruce (normalizado +
monto exacto) probado con `ABC 123-456` vs `abc123456`.

## 🔲 PENDIENTE al retomar
1. **Probar con los logins reales** (ANGELA secretaria / EMIRO subadmin): confirmar una
   transferencia con referencia que cruce → la partida debe pasar a `asignado`; rechazarla → debe
   volver a `pendiente`. Yo lo verifiqué por lógica, no con un pago real (para no mover cajas de
   contratos vivos con el go-live encima).
2. **Decisión abierta:** el arqueo del banco se pide **por grupo**, pero el extracto es una sola
   cuenta para los 4 portafolios. Resuelto con un aviso (*"anota solo las transferencias de este
   grupo"*); la alternativa es un arqueo bancario único del día, aparte de los cierres por grupo.
3. Menores sin hacer: `normalizarRef` borra puntos y guiones (`123-45` cruza con `12345`); la
   importación masiva inserta transferencias sin referencia; `cobrarNota` de Cobro Diario se
   captura y nunca se envía.
4. Mejora futura: insert del pago + asignación en un **RPC transaccional** (mismo criterio del
   motor v2: "el reparto lo hace la BD").
