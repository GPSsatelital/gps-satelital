---
name: pruebas-roles-reales-golive
description: "Pruebas B3+B4 con logins reales (26-jul, víspera go-live) — 2 huecos de seguridad reales encontrados y cerrados; mig 066 corrida"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-26T21:38:54.574Z
---

Pruebas con los logins REALES (no con FREDY) el 26-jul-2026, víspera del go-live.
Bloqueantes B3 (flujos de dinero) y B4 (permisos por rol) del plan de entrega.

## ✅ ANGELA (SECRETARIA) — todo pasó
- Mig 065 con su rol: ve los nombres de los sub-admin ✅
- Referencia visible en la tarjeta de "Por confirmar" ✅
- **Cruce al confirmar** (el embudo de `usePagos.confirmarPago`): partida → `asignado` ✅
- **Reversa al rechazar**: la partida vuelve sola a `pendiente` con `pago_id` nulo ✅
- Cruce al registrar: banner verde, monto exacto, fecha del banco adoptada y bloqueada ✅
- Menú correcto: sin Usuarios ni Importación, con Caja Diaria y Cobro Diario ✅
- **Bonus de seguridad:** intentar borrar pagos como ANGELA lo bloquea la RLS (exclusivo AP) ✅

## 🔴 BRANDON ROJAS (SUBADMIN, bdavidrojasp@gmail.com, 18 motos) — 2 HUECOS REALES
Ojo: el SUBADMIN de producción es **Brandon Rojas**, no "EMIRO" como decía la doc vieja.

Lo que SÍ funcionó: RLS impecable (18 contratos / 18 motos / 27 clientes / bolsa 0 —
verificado consultando Supabase directo, no solo la pantalla), chip con su propio nombre,
sin botón de cerrar caja, Caja sin datos ajenos.

**Hueco 1 — podía registrar EFECTIVO confirmado** (violaba "solo secretaria registra efectivo"):
- UI: el botón "💰 Pagar" de cada tarjeta de Cartera abría el modal **sin candado** (el "+"
  flotante sí estaba protegido con `puedePagoNormal`; ese camino quedó por fuera) y el modal
  ofrecía Efectivo por defecto.
- BD: el INSERT de un pago Efectivo/Confirmado **pasó** — el trigger de la mig 057 solo cubre
  el UPDATE de estado, y el efectivo nace ya Confirmado.
- **Arreglado** (commit `6a33a28`): UI fuerza Transferencia sin el permiso (option disabled +
  aviso + guarda en los 2 handlers + `useEffect` que cubre todas las puertas) y **mig 066**
  (espejo de 057 para INSERT) ✅ **corrida por el usuario**.

**Hueco 2 — el caché sobrevivía al cambio de usuario:** al entrar Brandon en la misma pestaña
donde había estado ANGELA, vio los KPIs de TODA la operación ($12M en mora, 40 contratos) hasta
recargar. Los stores de `createTableStore` viven a nivel de módulo y no se limpian con la sesión.
**Arreglado**: `signOut()` ahora hace `window.location.reload()`. Crítico porque en la oficina
comparten PC.

## Limpieza
Los 3 pagos de prueba borrados con FREDY y verificado que los 3 contratos quedaron **idénticos**
a la foto previa (cajas, ahorro, prorrateo), bolsa vacía, ninguna caja cerrada por error.

## Lección para el futuro
Probar con el login real del rol restringido encuentra lo que la revisión de código no ve: los
dos huecos existían desde antes y ninguna auditoría estática los había marcado. **Cuando se
agregue un botón que abra un flujo de dinero, verificar QUIÉN puede verlo — no basta con que
el camino "principal" esté protegido.**
