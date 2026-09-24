---
name: permisos-dos-capas-rls
description: Patrón bug — un permiso por persona puede estar tapado por (1) candado de rol viejo en la UI y/o (2) política RLS con roles fijos; caso LUMAR resuelto 17-jul
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-31T04:37:51.219Z
---

**Síntoma:** se le da un permiso a un usuario en Usuarios → acciones (`profiles.acciones` override "permitir") pero la opción no aparece o falla al guardar.

**Caso real (LUMAR, SUBADMIN, crear_convenio — 17-jul):** el permiso estaba bien guardado, pero lo tapaban DOS capas construidas ANTES del sistema de permisos (mig 048):
1. **UI:** la pestaña Convenio de CobrosView tenía `!esAdmin ? "Solo administradores..."` POR ENCIMA del chequeo `puede("crear_convenio")` — el permiso conectado detrás de una puerta cerrada. Fix commit `228a576`: la puerta ahora ES `puedeCrearConvenio` (cubre defaults + overrides). De paso destapó a SECRETARIA (debía poder por diseño y tampoco podía).
2. **BD:** política RLS "Convenios: creacion por staff de oficina" (mig 026) con roles quemados (ADMIN/AP/SECRETARIA). Fix mig 056: políticas ADITIVAS (OR permisivo, nadie pierde nada) basadas en `public.puede_accion()` + scope `mis_contratos_subadmin()` para convenios insert/update y deudas update.

**Cómo diagnosticar rápido:** (a) `select nombre, role, acciones from profiles where nombre ilike '%X%'` — ¿override guardado? (b) el usuario DEBE refrescar la app (los permisos se cargan al iniciar sesión); (c) leer el mensaje exacto de la pantalla — cada rama tiene su texto; si el texto no está en la cadena del permiso, hay un candado de rol viejo aguas arriba (grep del texto exacto).

## ✅ AUDITORÍA COMPLETA HECHA (17-jul) — mig 057 corrida + fix UI (commit 7fcf4c8)
Cruce de las 16 acciones vs pg_policies real + mapeo de candados de UI (agente Explore).
- **Mig 057 Frente A (aditiva, corrida ✅):** políticas `puede_accion()` + scope subadmin en liquidaciones insert/select, taller insert, acuerdos_tiempo_rodado all, contratos insert, caja_diaria all, visitas update, pagos delete, mensajes_whatsapp all, deudas delete. **Arregló bug real:** SUBADMIN tiene `iniciar_liquidacion` por default pero liquidaciones/taller eran solo-staff → iniciar liquidación como SUBADMIN fallaba en BD.
- **Mig 057 Frente B (seguridad, corrida ✅):** trigger `enforce_confirmar_pago` — cambiar el ESTADO de un pago (UPDATE) exige `puede_accion('confirmar_transferencia')` también en BD (antes SUBADMIN podía confirmar/rechazar por consola: su política de UPDATE de pagos es amplia por el flujo entregado_caja). No toca INSERT (efectivo confirma automático) ni entregado_caja; `auth.uid() is null` (SQL Editor/sistema) pasa libre.
- **Fix UI:** aprobar/repetir visita + decisión final en ficha del cliente (`DetalleClienteContenido`) usan `puede("aprobar_visita")` en vez de rol quemado.

## ✅ 3ª TANDA (25-jul, víspera go-live) — migs 058 + 067 CORRIDAS por el usuario ("success")
Disparador: el usuario activó `editar_contrato` a un SUBADMIN y no podía; y una captura mostró el alert
**"No tienes permiso para registrar pagos en efectivo"** al tocar **Aplicar saldo a favor** (no era la deuda,
como se creyó al principio — el botón de saldo está pegado a la zona de Deudas en el detalle de Cartera).

**NUEVO PATRÓN DE BUG (3º, distinto a los 2 de arriba): la BD exige la acción EQUIVOCADA.**
El trigger `enforce_registrar_efectivo` (mig 066) pedía `registrar_efectivo` a TODO insert en pagos con
`metodo='Efectivo' + estado='Confirmado'`. Pero hay movimientos que nacen así y **NO son plata nueva**:
`tipo_registro='saldo_favor'` (consume crédito ya existente; la UI lo gatea con `aplicar_saldo_favor`) y
`'adelanto_base'` (semana adelantada del wizard; UI lo gatea con `crear_contrato`). El propio código ya lo
sabía — `usePagos.esPagoDeCaja()` los excluye del recaudo — la BD era la única que no.
**Fix mig 067:** cada `tipo_registro` exige SU acción (saldo_favor→aplicar_saldo_favor, adelanto_base→
crear_contrato, resto incl. alquiler_reemplazo→registrar_efectivo). NO se eximieron (eximir = hueco: se
podría marcar un contrato pagado sin plata); se apuntó el candado bien + mensajes de error específicos.
**Mig 058:** `editar_contrato` — `contratos_auditoria` insert/select + update de contratos por
`puede_accion('editar_contrato')` con scope subadmin. Sin esto el UPDATE pasaba pero la fila de auditoría
fallaba (la auditoría era solo ADMIN desde mig 027) → el SUBADMIN nunca podía guardar.

**Fixes de UI de la misma tanda** (commit `9fdd16e`): `ContratosView` botón Editar salía de un bloque
gateado por `puedeCrear||puedeDocumentos` (el SUBADMIN NUNCA lo veía) → ahora `puedeEditar`;
`InmovilizacionesView` liquidar exigía `esAdmin &&` el permiso (en MotosView no) → solo el permiso;
`CobroDiarioView` usaba `esSecretaria` de rol y no pedía permiso para deuda/convenio → `puede()`;
`CobrosView` panel transferencias por rol → `puedeConfirmarPago`; `FichaClienteView` eliminar convenio
por rol → `puede("crear_convenio")`. (Cierra los pendientes 1 y 2 de la lista de abajo.)

**Estado del catálogo:** 15/16 acciones conectadas a un botón. `lista_negra` sigue sin control en UI
A PROPÓSITO (se activa sola cuando una liquidación cierra en rojo; no hay botón que conectar).

**Los 3 patrones a revisar SIEMPRE que un permiso "no funcione":**
1. Candado de rol viejo en la UI **aguas arriba** del `puede()` (grep del texto exacto del mensaje).
2. Política RLS con roles quemados (mig anterior a 048) → agregar política ADITIVA con `puede_accion()`.
3. **La BD exige otra acción distinta a la que pide la pantalla** (este caso) → alinear el trigger/política.

## Pendientes de la auditoría (decisiones del usuario, NO tomadas aún)
1. **CobroDiarioView** registra efectivo gateado por `esSecretaria` sin `puede("registrar_efectivo")` — contradicción vieja: regla "solo secretaria registra efectivo" vs default de ADMIN que incluye registrar_efectivo. Preguntar antes de tocar.
2. **Panel transferencias por confirmar** (CobrosView ~2844) escondido a no-SECRETARIA/ADMIN por rol — probablemente intencional (SUBADMIN jamás confirma plata); ahora además el trigger B lo refuerza. Preguntar si debe seguir el permiso.
3. **Acciones sin catalogar** (solo rol, sin `puede()`): avanzar/cerrar liquidación (LiquidacionesView esAdmin), eliminar convenio (FichaCliente rol), cerrar empalme (PanelEmpalme esSecretaria||esAdmin), plazo_extra (ModalGestion rol), gestión usuarios (ConfiguracionView esAdmin), asignar subadmin/visita. Catalogarlas = otra tanda.
4. **Trigger `enforce_cliente_estado_change`** sigue con roles quemados A PROPÓSITO (el wizard cambia estados; alinearlo requiere estudiar ese flujo — no arriesgado en 057).
- **Prueba de humo pendiente de confirmar:** SECRETARIA confirma transferencia · efectivo normal · "entregué a secretaria" · SUBADMIN inicia liquidación.

## B4 go-live — mapa de permisos EFECTIVOS de los 6 usuarios reales (leído de la BD 24-jul)
Módulos = `profiles.permisos` a medida MANDA (si es array, gana sobre el default de rol); solo `usuarios` tiene candado duro AP en `puedeVer` (App.tsx:443). `importacion` NO tiene candado duro → un permiso a medida puede otorgarlo a no-AP. Acciones = `DEFAULT_ACCIONES[rol]` + overrides `profiles.acciones` (`calcularPuede`).
- **FREDY** (ADMIN_PRINCIPAL): todo (bypass). **SERGIO AGUAS** (ADMIN): todos menos Caja/Usuarios, **CON Importación**; acciones={} → defaults ADMIN (incl. `registrar_efectivo`, sin confirmar_transferencia/cerrar_caja/aplicar_saldo/eliminar_pago). **ANGELA** (SECRETARIA): módulos amplios (sin Usuarios/Importación); defaults SECRETARIA + overrides `editar_deuda`+`cambiar_grupo_moto`. **Brandon Rojas** + **Lumar Avendaño** (SUBADMIN): módulos filtrados por SUS motos incl. liquidaciones; defaults `recolectar_moto`+`iniciar_liquidacion`; LUMAR además override `editar_deuda`+`crear_convenio`. **Pradera** (SOCIO/PRADERA): solo su dashboard.
- **Decisión del usuario (24-jul):** los permisos elevados de SERGIO (Importación + registrar_efectivo pese a la regla "ADMIN no registra efectivo") se **DEJAN configurables** vía el selector de Usuarios & Roles — el AP los ajusta cuando quiera, NO se hardcodea bloqueo. No es bug.
- **SUBADMIN + liquidaciones NO es desajuste de dos capas:** mig 057 ya alineó la RLS (inicia liquidación de SUS contratos + la lee; avanzar/cerrar = staff). Verificar solo el handoff SUBADMIN inicia → ADMIN cierra.
- **B4 = del lado del usuario:** verificar con cada login (checklist entregado). No requiere cambio de código.
