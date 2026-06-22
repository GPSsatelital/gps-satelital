# MotoGestión — GPS Satelital Cartagena
**SaaS de gestión integral de flota de motos en arriendo**
Supabase: `jvfkprkjysjffhzjitgl` | Repo: `GPSsatelital/gps-satelital` | Producción: Vercel desde `main`

---

## REGLA DE DESPLIEGUE — OBLIGATORIO SIEMPRE

Después de cualquier `git push`, hacer merge inmediato a `main`:

```bash
git checkout main && git pull origin main && git merge claude/clever-turing-daklkq && git push origin main && git checkout claude/clever-turing-daklkq
```

Vercel despliega automáticamente solo desde `main`. Sin este paso, nada llega a producción.

---

## STACK

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript |
| Build | Vite 8 |
| Base de datos | Supabase (Postgres + Auth + Realtime) |
| Deploy | Vercel — rama `main` |
| Estilos | CSS inline puro — **cero UI frameworks** |

---

## CONVENCIONES — NUNCA VIOLAR

- **Estilos:** Solo `style={{}}` inline. Nunca Tailwind, MUI, Bootstrap, etc.
- **Comentarios:** Solo cuando el WHY es no obvio. Nunca comentarios decorativos.
- **Features:** Exactamente lo pedido. Sin extras, sin abstracciones prematuras.
- **Commits:** En español, descriptivos
- **Nombres:** Todos los nombres de personas → `textTransform: "uppercase"` en CSS
- **TypeScript:** Siempre resolver errores TS antes de hacer push. `npm run build` debe pasar.
- **Responsive:** Mobile-first. `useIsMobile()` = `window.innerWidth < 900`. Bottom tab bar en móvil, sidebar en desktop.

---

## LA EMPRESA

**Nombre:** Club de moteros (nombre exacto y logo pendiente de recibir)
**Fundador/Arrendador legal:** FREDY MORA AVENDAÑO — C.C. 1.047.393.901
**Operación:** Cartagena y corregimientos (prohibido circular fuera de la ciudad)
**Flota actual:** ~350 motos | **Meta:** 1.000 motos
**Clientes activos:** ~300

### Estructura de socios y grupos
| Grupo | Dueño | Descripción |
|-------|-------|-------------|
| `RASTREADOR` | Fundador (Fredy Mora) | Su portafolio personal |
| `COSTA` | Socio 2 | Portafolio independiente |
| `PRADERA` | Socio 3 | Portafolio independiente |

Cada grupo es un **portafolio de inversión independiente** — estadísticas, recaudo y reportes separados. Los socios no operan el día a día, solo consultan sus números.

---

## ROLES Y PERMISOS

| Rol | Quién es | Qué puede hacer |
|-----|---------|-----------------|
| `ADMIN_PRINCIPAL` | Fundador + Admin general | Todo sin restricción |
| `ADMIN` | Admin jr (hasta 4, hoy 1) | Gestión de sus motos asignadas, reportar transferencias, ver pagos, gestión de cobro, NO registrar efectivo |
| `SECRETARIA` | Secretaria/aux contable | Registrar pagos efectivo, confirmar transferencias, visitas, registro clientes, gestión cobro |
| `MECANICO` | Mecánico de taller | Solo módulo taller |
| `SOCIO` | Los 3 socios | Solo lectura de dashboard de su grupo |

### Reglas críticas de permisos
- **Solo secretaria registra pagos en efectivo**
- **Admin jr** puede: reportar transferencias (foto comprobante), ver pagos, hacer gestión de cobro, reportar cobro en campo
- **Admin jr NO puede:** registrar efectivo, crear contratos (a menos que admin principal delegue)
- **Cobro en campo:** admin recupera efectivo → crea "reporte de cobro en campo" → secretaria confirma y registra
- Los socios tienen login propio pero solo ven dashboard de su grupo (rol `SOCIO`)

---

## ARQUITECTURA DE NAVEGACIÓN (App.tsx)

```
ViewKey = "dashboard" | "clientes" | "motos" | "contratos" | "cobros"
        | "taller" | "usuarios" | "liquidaciones" | "configuracion"
```

**Pendiente agregar:** `"reportes"` | `"caja"`

**Filtros especiales en MotosView:**
- `"retencion"` → muestra Fiscalía | Tránsito | Garantía
- `"grupo:COSTA"` / `"grupo:PRADERA"` / `"grupo:RASTREADOR"` → filtra por grupo

**Mobile:** Bottom tab bar (Panel/Clientes/Cartera/Motos/☰Más) + `MasSheet` overlay
**Desktop:** Sidebar `#0f172a`, 240px expandido / 64px colapsado

---

## PROCESO COMPLETO DE UN CLIENTE NUEVO

### Paso 1 — Registro inicial
- Se define desde el inicio la **ruta del cliente:**
  - `"diario"` → está ahorrando para completar base inicial ($510.000)
  - `"tiempo_definido"` → ya tiene la base y va a liberar moto (semanal/quincenal/mensual)
- Ingreso mínimo: **$100.000** (ideal: 55% de $510.000 = ~$280.500)
- Campo referido: nombre + cédula de quien refirió (válido solo cuando el nuevo cliente recibe su moto)

### Paso 2 — Documentos obligatorios
**Cliente:**
- Hoja de vida (con 2 referencias personales + 2 familiares)
- Copia cédula
- 2 recibos públicos (verificar dirección)
- Certificado de antecedentes
- Licencia de conducir (opcional)

**Acompañante (debe ser mujer — obligatorio):**
- Copia cédula
- 2 recibos públicos
- Certificado de antecedentes
- (NO necesita hoja de vida ni licencia)

### Paso 3 — Visita domiciliaria
- **Siempre obligatoria** antes de la entrega, sin excepción
- La realiza admin o persona designada
- Registra: fotos (cliente+funcionario, fachada), GPS automático
- Formulario: ¿vive ahí?, tiempo de residencia, tipo vivienda (propia/familiar/alquilada), composición familiar, estabilidad laboral, dudas del cliente, observación del visitador, recomendación
- Admin principal revisa y aprueba o rechaza

### Paso 4 — Firma de documentos (digital + físico)
Tres documentos auto-generados con datos del contrato, firmados en celular de empresa con lector biométrico USB:
1. **Contrato de arrendamiento** — datos del vehículo, canon, plazo, cláusulas
2. **Certificado de conocimiento** — cuestionario interactivo que el cliente responde para demostrar que entendió
3. **Pagaré + carta de instrucciones** — título valor como garantía legal

Todo: firma manuscrita en pantalla + huella biométrica USB + guardado en Supabase Storage + imprimible para físico.

### Paso 5 — Entrega de moto
- Inventario fotográfico del estado físico
- Kilometraje inicial registrado
- Checklist de condición

---

## SISTEMA DE REFERIDOS

| Referidos confirmados | Premio |
|----------------------|--------|
| 2 | Par de guantes de manejo |
| 5 | Intercomunicador |
| 10 | Casco |
| 17 | Combo completo |

**Referido confirmado** = cuando el nuevo cliente recibe su moto.
El sistema cuenta automáticamente y alerta cuando se alcanza cada hito.

---

## CONTRATOS Y TARIFAS

### Contrato DIARIO (ahorrando base inicial)
- Pago mínimo: **$50.000/día** L-S | **$25.000** domingo
- Tarifa empresa L-S: **$27.000** | Domingo: **$13.500** (~$14.000)
- Ahorro = lo que pague encima de la tarifa
- Sin fecha de vencimiento
- Al completar **$510.000** en ahorro → alerta al admin → ejecuta cambio manual → nuevo contrato firmado
- Al cambiar: moto puede ser la misma o nueva (casi siempre cambia a nueva)

### Contrato SEMANAL/QUINCENAL/MENSUAL (liberando moto)

**Días de pago disponibles: SOLO LUNES O MIÉRCOLES**
Si firma en otro día → prorrateo hasta el próximo día de pago asignado.

| Tipo | Valor semanal | Tarifa L-S | Ahorro L-S | Domingo |
|------|--------------|-----------|-----------|---------|
| Antiguo | $195.000 | $26.000 | $4.000 = $30.000/día | $15.000 |
| Nuevo (actual) | $202.000 | $27.000 | $4.000 = $31.000/día | $16.000 |

- **Quincenal:** 2 semanas + 1 día = 15 días
- **Mensual:** equivalente a 30 días
- Base inicial quincenal/mensual: $510.000 + adelanto adicional del período
- **Alerta 2 meses antes** del vencimiento → iniciar proceso de traspaso

### Base inicial: $510.000
- $202.000 = primera semana adelantada
- $308.000 = ahorro inicial
- **Regla:** "paga, consume, vuelve y paga" — siempre debe tener el período actual cubierto

---

## COBROS Y CARTERA

### Protocolo de mora (orden estricto)
1. **Día de pago** → mensaje WhatsApp/texto al cliente durante la mañana
2. **Día de gabela** → mensaje mañana + llamada + sirena máximo 5-10 segundos (solo con vehículo **detenido** en GPS)
3. **Apagado remoto** → solo con vehículo detenido · máximo 1 hora · luego reactivar y proceder a inmovilización física
4. **Mora** → aparece en lista de inmovilizaciones
5. **Plazo extra** → máximo 2 días adicionales, requiere motivo escrito en el sistema
6. **Sin cumplimiento** → orden de recolección física

### Recolección física
- Ubicación por GPS instalado en moto
- Apagado remoto disponible
- Sirena remota para alertar/ubicar

### Cuando se recupera una moto
- Cliente puede recuperarla pagando o haciendo convenio (si aplica)
- Después de **1 semana guardada** → va a taller para revisión
- Si la moto necesita ir a otro cliente → contrato anterior queda **"Suspendido"** mientras cliente firma liquidación → moto se reasigna → **la moto nunca deja de producir**

### Orden de aplicación de cada pago
1. Cuota pactada del período (tarifa + ahorro)
2. Deuda pendiente
3. Cuota de convenio activo
4. Saldo a favor (queda reservado, no se aplica automáticamente)

### Quién registra qué
| Acción | Quién |
|--------|-------|
| Registrar pago efectivo | Solo SECRETARIA |
| Reportar transferencia (foto comprobante) | ADMIN jr o SECRETARIA |
| Confirmar transferencia (verificar que entró) | SECRETARIA |
| Cobro en campo (efectivo recuperado en calle) | ADMIN crea reporte → SECRETARIA confirma |
| Ver historial de pagos | Todos |

### Convenios
- Máximo 3 por contrato durante toda su vida
- Siempre **encima** del pago normal — nunca lo reemplaza
- Plazo y cuotas definidos por admin según capacidad de pago del cliente
- 3er convenio incumplido → liquidación obligatoria

### Tipos de deuda
| Tipo | Quién autoriza |
|------|---------------|
| Tarifa atrasada | Automático |
| Daño al vehículo | Taller evalúa → Admin autoriza |
| Préstamo repuesto | Admin |
| Préstamo eventualidad | Admin |
| Fotomulta | Admin |

### Caja diaria
- La secretaria cierra la caja cada día
- Reporte: efectivo recibido + transferencias confirmadas + detalle por cliente
- Exportable: diario, semanal, mensual

---

## BASE DE DATOS — TABLAS

### `profiles` — usuarios del sistema
`id` (=auth.users) | `nombre` | `role` | `grupo` (para SOCIO) | `created_at`
Roles: `ADMIN_PRINCIPAL` | `ADMIN` | `SECRETARIA` | `MECANICO` | `SOCIO`

### `motos` — flota
`id` | `placa` (UNIQUE) | `marca` | `modelo` | `color` | `grupo` (COSTA/PRADERA/RASTREADOR) | `estado` | `condicion_ingreso` (nueva/usada) | `numero_motor` | `numero_chasis` | `cilindraje` | `fecha_seguro` | `fecha_tecnomecanica` | `propietario` | `observaciones` | `ubicacion_fisica` | `kilometraje_inicial` | `fotos_entrega` (jsonb) | `created_at` / `updated_at`

**Estados:** `Disponible` | `Asignada` | `En taller` | `Garantía` | `Fiscalía` | `Tránsito` | `Recuperada` | `Suspendida`

### `clientes` — prospectos y clientes
`id` | `nombre` | `cedula` | `telefono` | `whatsapp` | `mismo_whatsapp` | `direccion` | `fuente_llegada` | `ruta_contrato` (diario/tiempo_definido) | `referido_por_cedula` | `referido_por_nombre` | `referidos_confirmados` (int) | `acompanante_nombre` | `acompanante_cedula` | `acompanante_telefono` | `documentos_cliente` (jsonb) | `documentos_acompanante` (jsonb) | `estado` | `excepcion_documental` | `excepcion_motivo` | `excepcion_plazo` | `lista_negra` | `motivo_lista_negra` | `lista_negra_reversible` | `created_at` / `updated_at`

**Flujo de estados:**
`En proceso` → `Listo para visita` → `Pendiente evaluación` → `Aprobado` → `Activo` → `En riesgo` / `En mora` → `Retirado` / `Rechazado` / `Lista negra`

**Lista negra:** reversible si paga o por decisión del admin principal (`lista_negra_reversible: boolean`)

### `visitas` — visitas domiciliarias
`id` | `cliente_id` FK | `estado` | `resultado` | `entrevista` (jsonb completo) | `fotos` (jsonb) | `ubicacion` ({lat, lng}) | `fecha` | `realizada_por` (uuid FK profiles)

**Entrevista jsonb:**
```json
{
  "viveAlli": true,
  "tiempoResidencia": "3 años",
  "tipoVivienda": "Familiar",
  "composicionFamiliar": "Esposa e hijo",
  "estabilidadLaboral": "Mototaxista independiente",
  "dudasCliente": "...",
  "observaciones": "...",
  "recomendacion": "Aprobado"
}
```

### `contratos` — acuerdos de arriendo
`id` | `cliente_id` FK | `moto_id` FK nullable | `tipo_ruta` (diario/semanal/quincenal/mensual) | `dia_pago` (lunes/miercoles — solo para tiempo_definido) | `valor_periodo` | `tarifa_diaria` | `ahorro_diario` | `meses` | `base_inicial` | `ahorro_acumulado` | `base_completada` (boolean) | `fecha_entrega` | `firma_cliente` | `firma_responsable` | `huella_cliente_url` | `huella_acompanante_url` | `contrato_pdf_url` | `certificado_pdf_url` | `pagare_pdf_url` | `estado` (En proceso/Activo/Finalizado/Cancelado/Suspendido)

### `pagos` — cobros
`id` | `contrato_id` FK | `registrado_por` FK | `valor` | `metodo` (Efectivo/Transferencia) | `estado` (Confirmado/Pendiente/Rechazado) | `tipo_registro` (normal/campo/transferencia) | `comprobante_url` | `aplicado` (jsonb detallado) | `fecha`

### `taller` — mantenimiento
`id` | `moto_id` FK | `estado_tecnico` | `detalle` | `costo` | `repuestos` | `autorizado_por` | `fecha_ingreso` | `fecha_salida`

### `liquidaciones` — cierre de contratos
6 etapas: Iniciada → En taller → Calculada → Documento generado → Firmada → Cerrada
Si `saldo_final < 0` → cliente a lista negra automáticamente (reversible)

### Tablas adicionales
- `deudas` — tipo, monto, estado, autorizado_por
- `convenios` — máx 3 por contrato, cuotas, estado
- `gestiones_cobro` — llamada/whatsapp/sirena/visita/recoleccion/plazo_extra
- `historial_ubicaciones` — rastro físico de motos
- `recepciones_vehiculo` — llegada de moto a empresa
- `acuerdos_tiempo_rodado` — días sin pago con moto en empresa
- `caja_diaria` — cierre de caja por la secretaria
- `referidos` — seguimiento referido_por → nuevo_cliente → estado

---

## ALERTAS AUTOMÁTICAS DEL SISTEMA

| Evento | Cuándo | Para quién |
|--------|--------|-----------|
| Recordatorio de pago | Día de pago del cliente | WhatsApp al cliente |
| Gabela activa | Día siguiente sin pago | Admin + llamada + sirena |
| Cliente en mora | Vence gabela | Lista inmovilizaciones |
| SOAT próximo a vencer | 30, 15, 5 días antes | Admin principal |
| Tecnomecánica próxima | 30, 15, 5 días antes | Admin principal |
| Base inicial completada | Ahorro llega a $510.000 | Admin para ejecutar cambio |
| Premio referidos | Al confirmar referido 2/5/10/17 | Admin para entregar premio |
| Traspaso próximo | 2 meses antes de vencer contrato | Admin principal |
| 3er convenio incumplido | Al detectarse | Admin principal — liquidación |

---

## REGLAS DE NEGOCIO CRÍTICAS

### Principio rector
**La moto nunca debe dejar de producir.** Toda decisión operativa gira alrededor de esto.

### Tarifas (fijas, innegociables)
| Contrato | L-S | Domingo |
|---------|-----|---------|
| Diario antiguo | $26.000 | $13.000 |
| Diario nuevo | $27.000 | $14.000 |
| Semanal antiguo | $26.000 tarifa + $4.000 ahorro = $30.000 | $15.000 |
| Semanal nuevo | $27.000 tarifa + $4.000 ahorro = $31.000 | $16.000 |

### Días de pago semanal
**SOLO LUNES O MIÉRCOLES** — sin excepciones

### Fiscalía/Tránsito
- Congela la tarifa diaria mientras dure la retención
- El tiempo retenido queda como deuda del cliente
- Garantía: NO genera deuda (es culpa del fabricante)

### Lista negra
- Automática si liquidación = saldo negativo
- Reversible si paga o por decisión admin principal
- Al registrar cliente nuevo → validar contra lista negra

### GPS y control remoto (reglas estrictas del contrato de admin)
- **Sirena:** máximo 5-10 segundos, solo cuando el vehículo está **detenido** en la plataforma GPS
- **Apagado remoto:** solo con vehículo detenido · máximo 1 hora activo · luego reactivar y proceder físicamente
- **Perímetro:** máximo 1 hora de distancia de Cartagena — salida sin autorización → apagado inmediato + multa
- **Señales de empeño:** vehículo 2 días sin movimiento + dispositivo sin reportar + cliente paga solo por transferencia → inspección física obligatoria
- **Robo:** nunca acercarse sin acompañamiento policial — llamar a GPS + policía primero

### Garantía de fábrica
- No genera tarifa ni deuda para el cliente mientras dure
- Al salir de garantía: documento escrito firmado por cliente con fecha ingreso/salida/días → ajusta fecha de vencimiento del contrato
- El cliente puede tomar una moto temporal durante el tiempo en garantía

---

## PALETA DE COLORES

| Uso | Color |
|-----|-------|
| Azul principal | `#0284c7` |
| Verde éxito | `#166534` / fondo `#dcfce7` |
| Rojo error/mora | `#991b1b` / fondo `#fee2e2` |
| Amarillo alerta | `#92400e` / fondo `#fef3c7` |
| Fondo página | `#f1f5f9` |
| Texto principal | `#0f172a` |
| Texto secundario | `#334155` / `#64748b` |
| Sidebar | `#0f172a` |
| Sidebar activo | `rgba(56,189,248,0.15)` / texto `#38bdf8` |

---

## ERRORES PASADOS — NO REPETIR

| Error | Solución |
|-------|---------|
| CSS Grid con `minmax(320px, 1fr)` | Usar flexbox con `flexWrap: "wrap"` |
| `tipo_contrato` no existe | El campo se llama `forma_pago` |
| `"CLUB"` no es GrupoMoto válido | Usar `"RASTREADOR" as GrupoMoto` |
| `import React` sin usar JSX | Importar solo lo necesario |
| Variables no usadas en destructuring | No incluir lo que no se usa |
| sed embeds JSX como texto | Usar herramienta Edit de Claude, nunca sed en JSX |
| Push sin merge a main | SIEMPRE hacer merge a main después de cada push |

---

## ESTADO ACTUAL — v2.0

### Completado ✅
- Autenticación y 5 roles con RLS
- Dashboard con KPIs y navegación filtrada
- Módulo Clientes (registro básico, documentos, visitas, aprobación)
- Módulo Motos (registro, estados, grupos, retenciones, ubicación)
- Módulo Contratos (flujo completo básico)
- Módulo Cartera/Cobros (pagos básicos, deudas, convenios)
- Módulo Taller
- Módulo Usuarios
- Módulo Liquidaciones (6 etapas)
- Módulo Configuración
- Responsive + PWA + Realtime

### En implementación 🔨 (Fase 1 — datos reales)
1. **Rol SOCIO** + dashboard por grupo
2. **Clientes rediseño:** ruta diario/tiempo_definido, referidos, visita completa
3. **Firma digital:** 3 documentos auto-generados, huella biométrica, PDF
4. **Cobros rediseño:** vista diaria, protocolo mora, caja, reportes
5. **Migración Excel** → datos reales

### Pendiente 🔲
- Integración GPS real (sirena + apagado remoto)
- WhatsApp automático
- Reportes exportables PDF/Excel
- Inventario taller y repuestos
- APK nativo con Capacitor

---

## PLAN DE IMPLEMENTACIÓN (referencia)

Ver conversación del 22 de junio 2026 para el plan detallado completo con fases, semanas y orden de implementación.
