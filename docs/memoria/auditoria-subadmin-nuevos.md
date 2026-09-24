---
name: auditoria-subadmin-nuevos
description: "Auditoría del rol SUBADMIN antes de dar de alta dos cobradores nuevos (2-sep-2026): qué ve, qué puede hacer, qué lo protege — y el hueco del plazo que se abrió ese mismo día."
metadata:
  node_type: memory
  type: project
---

# Validar el rol SUBADMIN antes de crear dos más (2-sep-2026)

Pedido del dueño: *"valida bien el tema de que vamos a crear dos usuarios más de subadmin,
quisiera ver que todo esté bien para empezar a crearlos y que los utilicen"*. Es la primera vez
que entran subadmins que NO son Brandon — hasta hoy el scope se probó con una sola persona.

## Qué ve un SUBADMIN — 9 módulos

`clientes · contratos · cobros · motos · taller · tarjetas_llaves · cobro_diario · alertas ·
inmovilizaciones` (`src/lib/modulos.ts:35`), más los de `MODULOS_SIEMPRE`: `dashboard ·
configuracion · ficha_cliente · ficha_moto`.

**Usuarios es de ADMIN_PRINCIPAL sin excepción** — `App.tsx` lo corta ANTES de mirar la lista de
accesos a medida, así que ni otorgándoselo a mano entraría.

## Qué PUEDE hacer — solo dos acciones

`SUBADMIN: ["recolectar_moto", "iniciar_liquidacion"]` (`src/lib/acciones.ts:99`).

NO registra efectivo · NO confirma transferencias · NO elimina pagos · **NO crea convenios** ·
NO crea ni edita contratos · NO edita clientes · NO aprueba visitas · NO cambia grupos de moto ·
NO cede contratos.

## ✅ EL HUECO — abierto y CERRADO el mismo día (2-sep), por mí

El botón "⏳ Dar plazo" de Retenidas usa `puedeDarPlazo` = rol ADMIN/AP/**SUBADMIN**, pero el
botón "📝 Convenio" de al lado usa `puede("crear_convenio")`, que el SUBADMIN **no tiene**.

Resultado: **el SUBADMIN no puede hacer el camino normal (convenio) pero SÍ la excepción (soltar
la moto debiendo)**. Está al revés.

Causa: al preguntarle al dueño se le ofreció "igual que el plazo extra de hoy" y él lo eligió por
consistencia — pero en Cartera el plazo extra solo **frena una recolección**, mientras que acá
**suelta una moto del patio**. No es el mismo riesgo y no se le advirtió en ese momento.
**Lección: cuando una opción se presenta como "igual que lo que ya existe", verificar que el
EFECTO sea igual, no solo el nombre.**

✅ **Cerrado (`85dbe07`): `puedeDarPlazo = puedeCrearConvenio`.** Son las dos salidas del mismo
problema —cómo suelto esta moto sin que me paguen todo— así que quien pueda una puede la otra.
Verificado en pantalla: los botones pasaron de **15 plazo vs 13 convenio** a **13 y 13**; ya no
puede existir un "Dar plazo" huérfano.

## Lo que de verdad protege: la RLS (verificada contra la BD real, 2-sep)

**Las 26 tablas tienen RLS activa — ninguna abierta.** Con scope de subadmin en la base:
`contratos` (4 políticas) · `pagos`, `deudas`, `convenios` (3 c/u) · `motos`, `clientes`,
`taller`, `liquidaciones`, `contratos_auditoria` (2 c/u) · `visitas`, `gestiones_cobro`,
`recepciones_vehiculo`, `historial_ubicaciones`, `nomina_cierres`, `cesiones_contrato`,
`acuerdos_tiempo_rodado`.

**Esto resuelve un susto:** `InmovilizacionesView`, `AlertasView` y `CobroDiarioView` — tres
pantallas que el SUBADMIN SÍ ve — **no aplican `useScope`** en el frontend, igual que
`FichaClienteView` y `FichaMotoView` (abiertas a todo rol por `MODULOS_SIEMPRE`). Salen filtradas
igual porque **la base no les entrega los datos ajenos**. Es la segunda capa haciendo su trabajo.
⚠️ Pero significa que esas 5 pantallas dependen 100% de la RLS: si alguien afloja una política,
no hay red abajo.

### Las 10 que van por rol — revisadas una por una (2-sep)

**Cerradas al SUBADMIN, correctas:** `abonos_base` · `caja_diaria` · `ingresos_no_identificados`
· `premios_referidos` · `cajas_llenadas` (esta última solo la usa `ReportesView`, que el SUBADMIN
no ve — verificado, no rompe nada).

✅ **`prestamos_llave_tarjeta` y `prestamos_reemplazo` — CERRADO con la mig 121** ✅ corrida y
verificada (4 políticas · 1 delete propio · 3 con scope, en cada tabla). Eran `ALL` para ADMIN/AP/SECRETARIA/SUBADMIN, SIN scope por moto. `ALL` incluye DELETE. Un SUBADMIN puede leer, crear, modificar y **borrar**
préstamos de motos que no son suyas. Alcanzable de verdad: `tarjetas_llaves` es módulo suyo, y
`prestamos_reemplazo` se lee desde Inmovilizaciones, Alertas, Cobro Diario, Dashboard y las dos
fichas — todas visibles para él. `TarjetasLlavesView` filtraba con `useScope`, pero **solo en la
pantalla: abajo no había red**. No era fuga de datos de clientes (eso ya estaba cerrado) — era
capacidad de **borrar rastro ajeno**.
Ahora: solo los préstamos de SUS motos, y **BORRAR es exclusivo de ADMIN/AP** (un préstamo es
rastro, no un borrador). En `prestamos_reemplazo` el scope mira **TRES columnas**, no una: la moto
prestada sale del pool y puede ser de otro cobrador, así que filtrar solo por contrato lo dejaría
sin ver que SU moto está prestada.

⚠️ **`cuentas_bancarias`: el SUBADMIN (y el VISITADOR) SÍ leen las cuentas de la empresa.** Parece
intencional —para reportar una transferencia hay que saber a qué cuenta— pero conviene que el dueño
lo sepa y lo confirme.

⚠️ **`mensajes_whatsapp`: `SELECT` con regla `true`** — cualquier autenticado lee las plantillas.
Riesgo bajo (son plantillas, no datos), pero es la única política `true` que queda en la base.

⚠️ **`profiles`: el SUBADMIN solo ve SU PROPIO perfil** (`auth.uid() = id`). No es hueco de
seguridad, pero puede dejar **nombres vacíos** donde la app muestra "registrado por", "asignada a"
o quién autorizó algo. Confirmar al probar con un subadmin real.

## Al crear los dos nuevos — checklist

1. Crearlos desde **Usuarios** (Edge Function `manage-users`), rol SUBADMIN.
2. **Asignarles sus motos**: Motos → editar → "sub-admin a cargo". Hay filtro "solo sin asignar".
   Sin motos asignadas **no ven nada** — es lo esperado, no un error.
3. **Entran solos a la nómina** — se agrupa por `motos.subadmin_id`, no hay que darlos de alta.
4. **Limitación conocida**: la gestión se atribuye al cobrador que tiene la moto HOY. Si se
   reparten las motos de Brandon, las semanas viejas de esas motos **se le pasan al nuevo**. Ver
   [[regla-nomina-cobradores]] — conviene repartir justo después de cerrar una semana.

Ver también [[permisos-dos-capas-rls]] · [[auditoria-permisos-rls-julio2026]] ·
[[pruebas-roles-reales-golive]] (el SUBADMIN real es **Brandon Rojas**).

## ✅ El estreno real: ERICK (DQG87I), 2-sep

El dueño usó el plazo el mismo día que se construyó, y quedó verificado contra la base:
plazo de 2 días con motivo *"Hasta el viernes"* (vence 2026-09-04) · moto **Asignada** ·
contrato **Activo** · **los $99.000 siguen `pendiente`** — no se perdonó nada · multa en $0.
🔲 **Falta ver que el viernes 4 la campana avise** si no pagó — es la parte que persigue la
excepción y todavía no se ha visto funcionar.

## Verificar un cambio de RLS sin poder entrar con el rol afectado

No hay login de SUBADMIN a mano, así que el scope nuevo no se probó desde su sesión. Lo que SÍ se
puede probar —y se hizo— es **que no se rompió a quien sí debe ver**: `mi_rol()` por RPC, lectura de
ambas tablas desde la sesión de ADMIN_PRINCIPAL (5 y 1 filas, sin error) y las dos pantallas que
las usan abiertas en el navegador (Inmovilizaciones y Tarjetas y Llaves, sin errores).
🔲 **Falta la prueba real desde una sesión SUBADMIN**: que solo vea los préstamos de sus motos y
que borrar le rebote. Hacerla cuando existan los usuarios nuevos.
