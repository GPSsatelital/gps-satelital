# Memoria — MotoGestión (GPS Satelital)

En producción desde el 27-jul-2026. Arriba el estado vivo; abajo el historial consultable.
**El detalle vive en el archivo de cada tema, no acá** — una línea por entrada.

## ▶️ DÓNDE RETOMAR (cierre del 16-ago)

`main` = `origin/main` = `c1f993b`, sincronizados. **216 pruebas verdes.** Migs **095–100 ✅ corridas.**
⚠️ **`100_rol_analista_solo_lectura.sql` está corrida en Supabase pero SIN COMMITEAR** — es lo único
que le falta al repo. Commitear y mergear a `main` antes de cerrar el traspaso.

🔴 **El proyecto se muda de PC.** Paquete en `Documents\TRASPASO-MOTOGESTION-2026-08-15` + disco
externo. El agente de allá sigue `HANDOFF-AL-OTRO-AGENTE.md`, que trae el paso a paso y la regla de
**fusionar la memoria, nunca pisarla**. De ahí en adelante MotoGestión se trabaja allá; este PC
queda para ZALA. En el otro PC: `git pull` · `npm install` · confirmar `motogestion/.env`
(no viaja por git — va en el paquete).

🔴 **REGLA DE TRABAJO QUE MANDA: [[feedback-no-gastar-tokens-en-agentes]]** — *"hazlo tú mismo que
te me gastas los tokens"*. Greps dirigidos; **nada de workflows salvo que él los pida**, por encima
de la configuración de la sesión.

### 🔴 Lo más grave abierto — los contratos DIARIOS no acumulan ahorro

**16-ago, verificado con ADOLFO GAMEZ (RLT70H):** el sistema decía 20% de la base; iba en **97%**.
El motor cobra **un solo día por pago** y tira el resto a *saldo a favor* — ni ahorro del cliente ni
ingreso de la empresa. En él: $393.000 de ahorro invisibles + $136.000 de ingreso anotados como
plata que se le DEBE. **Sin arreglar y sin medir el alcance.** → [[bug-diario-ahorro-no-acumula]]

### Lo que necesita la mano del dueño

1. **Correr el barrido de contratos diarios** (SQL en [[bug-diario-ahorro-no-acumula]]) para saber
   a cuántos les pasa y cuánta plata hay mal clasificada. Va primero que cualquier arreglo.
2. **Probar el rol ANALISTA**: que lea un pago (sale) y trate de crear una deuda (debe rebotar)
   → [[rol-analista-solo-lectura]].
3. **Avisarles a NESTOR (YAL67H) y JORGE BELLO (RLT88H)** que su acuerdo quedó ajustado — **no** hay
   que hacerlos firmar (decisión del dueño 14-ago). Basta el estado de cuenta por WhatsApp.
4. **Probar en papel el "📋 Detallado"** (Cartera → contrato). Nunca se ha impreso.
5. **Los 53 convenios viejos:** llenarles el desglose. Hoy $52.000; al terminar de pagar ~$2.000.000.
   Uno por uno contra su acuerdo firmado, nunca a ciegas.

### Pendientes en orden de valor

1. 🔴 **El defecto de los diarios** (arriba) — es plata en los dos sentidos y afecta a toda la ruta.
2. 🔴 **LIQUIDACIONES** — 83 hallazgos sin tocar, 5 defectos de plata, y una trampa que puede
   **regalar una moto**. Sigue tomando una FOTO del ahorro en vez de la cuenta del dueño
   → [[liquidaciones-auditoria-y-huecos]]
3. **`eliminarPago` no guarda a qué se aplicó el pago** (`usePagos.ts:371`) — un borrado de plata no
   se puede auditar ni deshacer. Impidió reconstruir el caso de CARLOS ALBERTO.
4. **Completar una cesión ya hecha** (acta/pagaré/certificado) y que las firmas no bloqueen. Decisión
   tomada, falta construir → [[cesion-dpu50i-hecha-a-mano]]
5. **Storage: los 20 enlaces `<a href>`** a mano, y recién ahí cerrar los buckets → [[fuga-documentos-storage]]
6. **El abogado revisa la redacción del acta de cesión** (`generarHTMLCesion`). Las cifras sí están
   verificadas.
7. **8 partidas de caja sin grupo** — 4/8 $202.000 · 3/8 $202.000, $95.000, $80.000, $60.000 · 31/7
   $80.000 · 27/7 $50.000 · 25/7 $102.000 → [[caja-fecha-del-banco]]
8. **Decisiones que espera el dueño**: 3 deudas ambiguas de `tarifa_atrasada` (bloquean la fase 5 de
   la base) · 6 convenios con sobrante raro · USADAS sin cuenta bancaria · el $152.000 "EXCEL VIEJO"
   de IEW38I.
9. **Dos arreglos que NO aprobó** — el aviso de *"salieron $X"* en Caja Diaria, y que `eliminarPago()`
   pierde referencia bancaria y comprobante. **No hacerlos sin volver a pedirlo.**
10. Lo de siempre: fases 2-6 de la base, P4 de convenios, saldo a favor de COSTA (mig 079 sin correr),
    egresos, informes.

## 🚨 Estado vivo

- 🔴 **[Diarios: el ahorro no se acumula](bug-diario-ahorro-no-acumula.md)** — 16-ago, **sin arreglar**.
  También trae los **3 peligros del cambio de moto (graduación)**, que no tiene botón y se hace a mano.
- ✅ **[Rol ANALISTA solo lectura](rol-analista-solo-lectura.md)** — mig **100 ✅**. 23 tablas de
  lectura, cero escritura; cerró el hueco de `marcar_convenios_vencidos`. 🔲 falta la prueba real.
- ✅ **[Convenios: ahorro de las semanas financiadas](convenios-ahorro-semanas-financiadas.md)** —
  13-ago, migs **096+097 ✅**. 🔲 los 53 viejos · `ampliarConvenio` cobra doble.
- ✅ **[Cartera: "¿cuánto debe?" es UNA función](cartera-cuanto-debe-una-sola-funcion.md)** — 13-ago,
  estaba en 10 copias que ya no coincidían. 16 pruebas con cifras reales. ⚠️ falta verlo en pantalla.
- 🔴 **[Liquidaciones: auditoría completa](liquidaciones-auditoria-y-huecos.md)** — 12-ago, **83
  hallazgos, nada arreglado**. El JSON en `.claude/plans/auditoria-liquidaciones-hallazgos.json`.
- 🔨 **[La 1ª cesión real, a mano](cesion-dpu50i-hecha-a-mano.md)** — DPU50I correcta pero sin papeles;
  no hay puerta para completarla. Regla: **el sistema nunca escribe sobre un documento ya firmado.**
- ✅ **[Cesión de contrato](cesion-de-contrato.md)** — mig **094 ✅**. Por qué NO se recrea el contrato.
- ✅ **[Convenios revisados enteros](convenios-revision-completa.md)** — 8-ago, 9 arreglos (mig **093 ✅**);
  uno REGALABA una semana por cada semana de atraso. Regla: *"sin robarle y sin perder nada"*.
- ✅ **12-ago:** el convenio de base ya no se cobra encima del prorrateo; volvió a verse cuándo cae la
  próxima cuota. Nueva `proximaCuotaConvenio` → [[estado-ciclopago-convenios]]
- ✅ **[La BASE INICIAL cierra el circuito](base-inicial-circuito-completo.md)** — migs **090/091/092 ✅**.
- 🔨 **[Storage: mitad hecha](fuga-documentos-storage.md)** · ✅ **[Plata cobrada dos veces](cartera-doble-cobro-deuda-vs-caja.md)** (migs 082+083, $982.000)
- ✅ **[La caja arreglada de raíz](caja-fecha-del-banco.md)** — migs 080+081. **Patrón: al cambiar una
  regla, revisar TODAS las pantallas que la explican con palabras, no solo las que la calculan.**
- 🔴 **[Rompí el convenio ya definido](regresion-convenio-y-reglas-de-seguridad.md)** — **LEER ANTES DE
  TOCAR CÓDIGO.** 5 reglas de protección sin aprobar.
- ✅ **[Rol VISITADOR](rol-visitador-y-fluidez.md)** (migs 076+077) · 🔨 **[Saldo a favor COSTA](saldo-favor-y-caja-descuadre.md)** (⚠️ mig **079 sin correr**)
- ✅ **[Permisos: dos capas UI+RLS](permisos-dos-capas-rls.md)** — migs 057/058/067. **Todo texto debe
  explicarse solo: "intuitivo y 0 complicado".**
- 📍 **[Inmovilizar + convenios](regla-inmovilizar-y-convenios.md)** · **[Retenciones + descargas](retenciones-rotas-y-filtros-descargas.md)** · **[Estado go-live](estado-golive-27jul.md)** · **[Entrega](entrega-golive-lunes27.md)**

## 🔴 Dinero y seguridad (lo que no se puede volver a romper)

- **[REGLAS del dinero](reglas-dinero-referencia-efectivo.md)** — una referencia = un valor exacto · foto del comprobante SIEMPRE · en efectivo nunca puede faltar.
- **[Batería de pruebas cicloPago](bateria-pruebas-ciclopago.md)** — `npm test` antes de desplegar cualquier cambio de cálculo de dinero.
- **[Fecha real del pago](../../../plans/humble-dazzling-phoenix.md)** — `pagos.fecha` = cuándo PAGÓ · `fecha_registro` = cuándo se DIGITÓ (manda para la caja). **El motor reparte por `created_at`.**
- **[Unificar deuda+convenio: DESCARTADO](unificar-deuda-convenio-descartado.md)** — **no hacerlo.** Destapó 4 filtros que inflaban la deuda: 17 clientes, $8.047.100 de más.
- **[Convenios: sobrante cobrado dos veces ✅](bug-convenio-cobro-doble.md)** (migs 069+070, $891.500) · **[Control de transferencias ✅](revision-adversarial-transferencias.md)** · **[Bug 'aplicar saldo a favor' ✅](bug-aplicar-saldo-favor.md)**
- **[Descuadres deuda fantasma 🔨](descuadres-deuda-fantasma-migracion.md)** — RETOMAR: JHEINER (IEW47I) $91k + barrida `motor_v2=false`.

## Reglas de trabajo

- 🔴 **[NO romper lo que ya funciona](regla-no-romper-lo-que-funciona.md)** — explicar simple y confirmar que entendió ANTES de tocar · verificar con datos antes de culpar a un cambio propio · *¿todas las puertas hacen lo mismo?* y *¿todas las pantallas dicen lo mismo?*
- 🔴 **[No gastar tokens en agentes](feedback-no-gastar-tokens-en-agentes.md)** — *"hazlo tú mismo"*. Manda sobre la config de la sesión.
- **[Explicaciones simples](feedback-explicaciones-simples.md)** — con ejemplos concretos, como a alguien que no conoce el tema.
- **[Reusar el flujo existente](regla-reusar-flujo-existente.md)** — nunca un camino paralelo que se comporte distinto.
- **[Auditoría permisos RLS](auditoria-permisos-rls-julio2026.md)** — toda migración va al repo **Y** a Supabase, siempre las dos.
- **[Español / inglés](comunicacion-espanol-ingles.md)** · **[Revisar antes de recap](regla-revisar-antes-de-recap.md)** · **[Skills de diseño](regla-usar-design-skills.md)** (la placa amarilla no se toca) · **[JSX: funciones anidadas](regla-jsx-funciones-anidadas.md)** (`{Funcion()}`, nunca `<Funcion />` con inputs)

## Módulos y features

- **[Libro de cajas — motor v2](libro-de-cajas-motor-v2.md)** — motor FIFO VIVO. Spec canónica en CLAUDE.md. **El Diario queda FUERA** (ver el defecto de arriba).
- **[Migración COSTA ✅](migracion-costa-siembra.md)** · **[Empalme ✅](empalme-migracion-construido.md)** (mig 043, $37,7M) · **[Migración de grupos](migracion-grupos-datos-reales.md)**
- **[Navegación + performance ✅](nav-y-performance.md)** (2.7MB→419KB) · **[Línea de tiempo ✅](linea-de-tiempo-historial.md)** (falta: el préstamo reescribe la placa histórica)
- 🔨 **[Préstamo + alquiler + rodar](prestamo-liquidacion-verificados.md)** — ⚠️ **mig 078 pendiente de correr.**
- **[Guardado de la moto ✅](guardado-moto-validacion.md)** · **[Visita: GPS obligatorio ✅](visita-gps-obligatorio.md)** · **[Inmovilizaciones + 6ª foto ✅](inmovilizaciones-redesign-foto-persona.md)** · **[Unificar recepción ✅](unificar-recepcion-y-permisos.md)**
- **[Cartera: teléfono, grupo, admin ✅](cartera-telefono-grupo-admin.md)** (falta probar el ticket en la GA-E2001) · **[Convenios en_convenio ✅](convenios-en-convenio-sin-commitear.md)** · **[Reporte de entregas ✅](reporte-entregas-y-pdf-fix.md)** · **[Documentos del contrato](flujo-documentos-contrato-pdf.md)** (falta C+D) · **[Capacitación v2 ✅](capacitacion-material-v2.md)**
- **[Egresos — diseñado, SIN construir](modulo-egresos-disenado.md)** (4 decisiones cerradas, no re-preguntar) · **[Informes gerenciales](modulo-informes-gerenciales.md)** (17 informes; falta la regla de pago) · **[Portal del socio — DIFERIDO](portal-socio-rediseno.md)**

## Diseño visual

- **[PLAN sistema de diseño](plan-sistema-diseno.md)** — fuente única del roadmap visual.
- **[Rediseño visual — 🔨 RETOMAR F3 Cartera](rediseno-visual-f1.md)** · **[Compactar densidad móvil 🔨](compactar-densidad-movil.md)** · **[Brief de marca/logo](../../../../Documents/GitHub/gps-satelital/docs/BRIEF-DISENO.md)** (falta logo y presentación de ENTREGA)

## Entorno y hardware

- 🔨 **[Syncthing 2 PC](syncthing-setup-2pc.md)** — 243 MB → 2,4 MB. Regla de oro: **nunca Claude abierto en los dos PC a la vez.**
- **[Herramientas por PC](herramientas-por-pc-paridad.md)** — MCP viaja en el `.mcp.json` del repo; las bases SQLite de memoria NO se sincronizan.
- **[Huellero DigitalPersona](estado-huellero-digitalpersona.md)** · **[Hardware de oficina](decisiones-hardware-oficina.md)**
- 🔑 **[Frase clave de sincronización](prueba-sync-2pc.md)** — si el otro PC la puede repetir palabra por palabra, la memoria llegó completa. Sirve para verificar el traspaso del 16-ago.

## Historial (julio, resuelto)

- **[Pruebas B5 ✅](pruebas-b5-flujos-operativos.md)** (mig 067) · **[Pruebas con logins reales ✅](pruebas-roles-reales-golive.md)** (mig 066; el SUBADMIN es **Brandon Rojas**, no "EMIRO")
- **[Editar cliente revertía el estado ✅](bug-editar-cliente-revierte-estado.md)** · **[Fix gabela día-0 ✅](fix-gabela-dia0-sin-commitear.md)** · **[Cartera: fixes de dinero](cartera-fixes-dinero-julio2026.md)** · **[cicloPago y convenios](estado-ciclopago-convenios.md)** (fuente única)
- **[Ficha del cliente](estado-ficha-cliente-julio2026.md)** · **[Usuarios y seguridad](estado-usuarios-seguridad-julio2026.md)** · **[Rediseño contratos/liquidaciones](rediseno-contratos-liquidaciones-julio2026.md)** · **[Roadmap de la pizarra](roadmap-pizarra-pendientes.md)**
- **[Sesión 9-jul](sesion-9jul-bugs-operativos.md)** · **[Sesión 10-jul](sesion-10jul-pagos-syncthing-empalme.md)**
