---
name: unificar-recepcion-y-permisos
description: "✅ AMBOS EN PRODUCCIÓN: unificar recepción (botón 'Registrar novedad') + permisos detallados por acción (14/15 conectadas, árbol UI, migs 048/049 corridas). Falta probar en navegador."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

## ✅ Unificar recepción + retención — EN PRODUCCIÓN (11-jul, commit `ec9c3bd`)
`MotosView.tsx`: los botones separados "📋 Recepción" y "🚨 Retención" se reemplazaron por UNO solo **"🏍️ Registrar novedad"** (estilo primaryBtn) que abre un chooser "¿qué pasó con la moto?" y enruta al flujo correcto, **reutilizando lo que ya existe** (aditivo, no borró los flujos viejos):
- 🚚 Recolección por mora → `ModalRecoleccion` (solo habilitado si el contrato está en mora — se calcula con `calcularEstadoCartera` + pagos/convenios).
- 🤝 Entrega voluntaria → abre el modal de recepción actual preseteado a `entrega_voluntaria` (suspende contrato).
- ⚖️ Retención legal (Fiscalía/Tránsito/Garantía) → modal de retención actual.
- 📄 Liquidar/cerrar → `ModalIniciarLiquidacion` (sin bloqueo de 7 días).
- 📋 Solo recepción/registro → recepción simple.
Cada opción con aviso de consecuencia + se deshabilita con su razón si no aplica. **Liberar retención quedó como botón verde APARTE (Opción B elegida por el usuario), solo visible cuando la moto ya está retenida** (Salida Fiscalía / Liberar retención). Texto viejo de Garantía corregido ("no genera deuda" → el tiempo se cobra/rueda igual que Fiscalía/Tránsito). `tsc -b` + build limpios, merged a main. **Falta probar en navegador con login.**

## 🔨 Permisos detallados por usuario — EN CONSTRUCCIÓN (Opción A "mejorada", elegida por el usuario)

**Decisiones cerradas con el usuario:** Opción A (catálogo curado) **mejorada** con: rol=techo (override por persona recorta/amplía), 3 estados por acción (default/permitir/bloquear), **refuerzo REAL en la BD para las 3 acciones de plata** (registrar_efectivo, confirmar_transferencia, eliminar_pago), "¿por qué no puedo?" en botones bloqueados, y auditoría con nota al cambiar un permiso sensible. ADMIN_PRINCIPAL siempre todo. Parqueado (no construir): permisos con vencimiento, doble aprobación, perfiles reutilizables, límites por IP.

**Catálogo (15 acciones) en `src/lib/acciones.ts`:** registrar_efectivo·confirmar_transferencia·eliminar_pago (dbEnforced) · cerrar_caja · aplicar_saldo_favor · crear_contrato · editar_contrato · editar_deuda · crear_convenio · recolectar_moto · cambiar_grupo_moto · iniciar_liquidacion · aprobar_visita · lista_negra · editar_configuracion. (Se quitó "dar plazo/gabela" por bajo riesgo.)

**✅ FASE 1 EN PRODUCCIÓN (commit en main):** `src/lib/acciones.ts` (catálogo + DEFAULT_ACCIONES por rol + `calcularPuede(role, acciones, accion)`). AuthContext: `Profile.acciones` + helper `puede(accion)` en el contexto; `loadProfile` usa `select("*")` para tolerar que la columna `acciones` aún no exista. Sin efecto visible aún (usa defaults por rol). `tsc -b` exit 0 (⚠️ el typechecker del entorno tardó ~4 min, no segundos).

**DECISIÓN CLAVE (usuario eligió Opción 1):** los defaults por rol calzan con el COMPORTAMIENTO ACTUAL del código, NO con la regla escrita (que a veces es más estricta, ej. el código deja al ADMIN registrar efectivo aunque el CLAUDE.md diga que no). Así el wiring no cambia nada; el admin recorta por persona desde la UI. `DEFAULT_ACCIONES` en acciones.ts YA quedó auditado y alineado a esto (mismo mapa en la función SQL `_acciones_default`).

**✅ F2 (parcial) + F4 EN PRODUCCIÓN (commit en main):**
- F2 dinero: en `CobrosView` `registrar_efectivo`/`confirmar_transferencia`/`eliminar_pago` ya usan `puede(...)` (`puedePagoNormal`, `puedeConfirmarPago`, `puedeEliminarPago`). Verificado behavior-preserving (defaults calzan). `tsc` exit 0 (lento ~4min).
- F4: **migración `048_permisos_acciones.sql` escrita — ⚠️ EL USUARIO DEBE CORRERLA en Supabase.** Agrega `profiles.acciones jsonb`, `_acciones_default(role)`, `puede_accion(accion)` (misma lógica que el frontend) y un trigger BEFORE DELETE en `pagos` que refuerza `eliminar_pago`. registrar/confirmar NO se reforzaron en BD (riesgo: el INSERT de efectivo lo usan también cobro en campo del subadmin y pagos internos → necesita pase probado aparte).

**✅ F3 + F3.1 (rediseño UI) EN PRODUCCIÓN:** `SelectorPermisos` — ÁRBOL UNIFICADO: cada módulo es una casilla (ver pantalla) y debajo, anidadas, sus acciones sensibles como casillas simples (puede/no puede). Cada acción tiene `modulo` en acciones.ts. Casilla hereda del rol; guarda override solo si difiere (si vuelve al default, borra la excepción → sigue al rol). Mejoras: indicador "editado" en excepciones, contador "N personalizados" + botón "↺ volver a lo normal del rol", módulos sin acciones compactos abajo como chips, responsive 375px. (El `SelectorAcciones` viejo de 3 estados fue reemplazado; `SelectorAccesos` sigue en ModalCrear.) Carga/guarda `profiles.acciones` DIRECTO (la Edge Function `manage-users` NO está en el repo → se eligió camino (b) direct update en vez de tocar la edge fn). **Requiere migración `049_permisos_acciones_policy.sql`** (policies SELECT+UPDATE de profiles para ADMIN_PRINCIPAL, porque la RLS base solo deja ver/editar el perfil propio). ⚠️ EL USUARIO DEBE CORRER 049. `tsc` exit 0. **EL FEATURE YA ES USABLE** tras correr 048+049: el AP asigna permisos por persona; dinero gateado en frontend + eliminar_pago reforzado en BD.

**✅ F2 COMPLETO — 14 de 15 acciones conectadas (toma efecto al togglear):**
- Behavior-preserving (defaults calzan con lo que había): registrar_efectivo, confirmar_transferencia, eliminar_pago, editar_deuda (✏️ y +Registrar deuda), aplicar_saldo_favor (CobrosView) · crear_contrato, editar_contrato (ContratosView) · cerrar_caja (CajaView) · aprobar_visita (ClientesView PanelAprobacion — esAdmin ahora es puede()) · editar_configuracion (ConfiguracionView — solo la sección Mensajes WhatsApp; la gestión de usuarios de esa vista sigue con esAdmin).
- **ENDURECIMIENTO (Camino A, elegido por el usuario tras explicación):** estas 4 NO tenían gate de rol (hueco) y ahora sí: crear_convenio (CobrosView "+Crear convenio" con aviso si no puede · Inmovilizaciones 📝 Convenio) · recolectar_moto (Panel Hoy botón Recolección · MotosView router opciones recolección Y retención legal) · iniciar_liquidacion (ContratosView botón · MotosView router · Inmovilizaciones = esAdmin && puede, la regla local "a los 7d decide el ADMIN" se mantiene) · cambiar_grupo_moto (MotosView editar → select de grupo disabled con title). Defaults: convenio=SEC+ADMIN · recolectar/liquidar=ADMIN+SUBADMIN · grupo=ADMIN. NOTA: se quitó aplicar_saldo_favor del default de ADMIN (el gate real era solo esSecretaria).
- lista_negra: SIN conectar a propósito — no hay botón directo (se activa sola por liquidación); su casilla hoy no controla nada. ModalConvenio de CobroDiarioView es código muerto (nadie setea convenioId).

**🔲 FALTA (polish, baja prioridad):**
- **F5 "¿por qué no puedo?"** — parcialmente hecho (convenio en Cartera muestra aviso, router de novedad muestra motivoOff, select grupo con title). Falta en botones que simplemente desaparecen. — conectar `puede()` en: cerrar_caja (CajaView, esSecretaria), crear/editar_contrato + editar_deuda (ContratosView puedeCrear/esAdmin + ModalDeuda), crear_convenio (CobroDiario/CobrosView callers), recolectar_moto + cambiar_grupo_moto + iniciar_liquidacion (MotosView/Inmovilizaciones/ContratosView), aprobar_visita (ClientesView/PanelAprobacion esAdmin), lista_negra (ClientesView), editar_configuracion (ConfiguracionView). Behavior-preserving (defaults ya calzan). Baja prioridad (la seguridad real de plata ya está; esto solo esconde botones).
- **F4 resto** — reforzar en BD registrar_efectivo (INSERT efectivo, distinguir tipo_registro campo/interno) y confirmar_transferencia (UPDATE estado), CON PRUEBA del usuario.
- **F5 — "¿por qué no puedo?"**: tooltip/aviso de motivo en botones bloqueados.


**Estado actual del sistema:** `profiles.permisos` (jsonb `ViewKey[]`) controla SOLO **qué módulos/pantallas ve** cada usuario (casillas en UsuariosView → `SelectorAccesos`, catálogo en `src/lib/modulos.ts` `MODULOS_ASIGNABLES`, gate `puedeVer()` en App.tsx:421). NO hay control de ACCIONES dentro de una pantalla — esas reglas están fijas por rol en el código (`esSecretaria`, `role === "ADMIN_PRINCIPAL"`, etc.).

**Lo que pidió el usuario:** permisos "detallados" = control de acciones por usuario, no solo de módulos.

**Pregunta abierta (planteada, SIN responder — retomar aquí):** ¿Opción A o B?
- **A (recomendada):** catálogo curado de ~10-15 acciones sensibles (las que tocan plata o son irreversibles): registrar efectivo · confirmar transferencia · eliminar/anular pago · crear/editar contrato · editar deuda · iniciar liquidación · dar plazo extra · recolectar · aprobar visita/cliente. Rápido, entendible.
- **B:** totalmente granular (cada botón configurable) — trabajo enorme, pantalla gigante. No recomendado.

**Diseño pendiente tras elegir A:** definir el catálogo exacto de acciones + estructura en `profiles.permisos` (¿ampliar el jsonb a `{modulos:[], acciones:[]}` o columna nueva?) + helper `puede(accion)` en AuthContext + reemplazar los checks de rol dispersos por `puede()` donde aplique (mapeo integral: buscar `esSecretaria`/`role ===` en todo src) + UI de toggles de acciones en UsuariosView (SelectorAccesos ampliado) + defaults por rol. Ojo: `usuarios` sigue siendo exclusivo ADMIN_PRINCIPAL por construcción (App.tsx:425).

Relacionado: [[estado-usuarios-seguridad-julio2026]] (Usuarios exclusivo AP, trigger 031 protege role/permisos/grupo), [[inmovilizaciones-redesign-foto-persona]].
