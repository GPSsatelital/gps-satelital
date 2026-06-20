# DOC MAESTRO — MotoGestión SaaS
**GPS Satelital Cartagena**
**Última actualización:** 19 de junio de 2026 — v1.9
**Estado del proyecto:** En desarrollo activo

---

## 1. DESCRIPCIÓN GENERAL

**MotoGestión** es una aplicación web SaaS para la gestión integral de una flota de motocicletas en arriendo. Cubre el ciclo completo: desde el registro y aprobación de clientes, pasando por la firma de contratos y asignación de motos, hasta el control de pagos semanales/diarios, seguimiento de cartera y mantenimiento técnico (taller).

### Objetivo del sistema
Reemplazar el control manual en hojas de cálculo por una plataforma digital centralizada, accesible en tiempo real desde cualquier dispositivo (escritorio y móvil), con control de roles por perfil de usuario.

### Tecnología
| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript |
| Build | Vite 8 |
| Backend / Base de datos | Supabase (Postgres + Auth + Realtime + Edge Functions) |
| Hosting | Vercel (deploy automático desde rama `main`) |
| Repositorio | GitHub: `GPSsatelital/gps-satelital` |
| Cliente HTTP/DB | `@supabase/supabase-js` v2 |
| Estilos | CSS inline puro (sin frameworks) |

---

## 2. ROLES Y PERMISOS

El sistema tiene 5 roles. Cada rol determina qué módulos ve y qué acciones puede realizar.

| Rol | Descripción | Módulos visibles |
|-----|-------------|-----------------|
| `ADMIN_PRINCIPAL` | Dueño / Director. Acceso total. Único que puede delegar funciones especiales. | Todos + Usuarios + Configuración |
| `ADMIN` | Administrador operativo (Admin 1, 2, 3, 4). Gestiona las motos que le asigne el Admin Principal. | Todos + Usuarios |
| `SUBADMIN` | Supervisión parcial. Sin acceso a Usuarios. | Dashboard, Clientes, Motos, Contratos, Cartera, Taller |
| `SECRETARIA` | Secretaria / Aux. Contable. Registro de clientes, pagos, visitas. Es el mismo rol. | Dashboard, Clientes, Motos, Contratos, Cartera, Taller |
| `MECANICO` | Solo gestión de taller. | Dashboard, Taller |

### Modelo de Admins
- El `ADMIN_PRINCIPAL` puede tener hasta 4 Admins operativos (Admin 1, 2, 3, 4)
- Cada Admin gestiona las motos que el Admin Principal le asigne — de cualquier grupo, de forma mixta
- Un Admin puede tener motos de varios grupos simultáneamente
- El Admin solo ve y gestiona sus motos asignadas (cobrar, administrar, retener, etc.)
- Las funciones especiales (crear convenios, aprobar préstamos, etc.) se delegan individualmente por el Admin Principal

### Restricciones importantes
- Solo `ADMIN` y `ADMIN_PRINCIPAL` pueden crear contratos.
- Solo `ADMIN` y `ADMIN_PRINCIPAL` pueden aprobar/rechazar clientes.
- Solo `ADMIN` y `ADMIN_PRINCIPAL` pueden aplicar excepciones documentales.
- Solo `ADMIN_PRINCIPAL` puede delegar funciones especiales a otros usuarios.
- `MECANICO` solo ve Dashboard y Taller.
- Los usuarios **no pueden registrarse solos** — un ADMIN los crea desde el módulo de Usuarios.
- El sistema registra **auditoría completa** de cada acción: quién hizo qué, cuándo y desde dónde.

---

## 2B. GRUPOS DE MOTOS

Los grupos son portafolios de inversión independientes dentro de la empresa. Cada grupo representa un socio o tipo de activo diferente.

### Reglas de grupos
- Una moto pertenece a **un solo grupo para siempre** desde que se registra hasta que deja de ser activo
- Los grupos tienen **estadísticas, cuentas, cálculos y reportes separados**
- El Admin Principal ve todos los grupos; los Admins ven solo las motos que se les asignaron (de cualquier grupo)
- Los cálculos de rentabilidad, recaudo y mora se generan **por grupo de forma independiente**

### Grupos actuales
| Grupo | Descripción |
|-------|-------------|
| `COSTA` | Portafolio Costa |
| `PRADERA` | Portafolio Pradera |
| `RASTREADOR` | Portafolio Rastreador (mismo funcionamiento, distinto nombre) |
| Otros | Se pueden agregar nuevos grupos según crezca la operación |

> **Nota:** Todas las motos tienen dispositivo GPS instalado para identificación y seguridad, independientemente del grupo.

---

## 3. ARQUITECTURA DEL SISTEMA

```
NAVEGADOR (React 19 + TypeScript)
│
├── App.tsx ──→ AuthProvider (contexto de sesión y rol)
│                    │
│                    └── Shell (navegación + vistas por rol)
│                         ├── DashboardView
│                         ├── ClientesView
│                         ├── MotosView
│                         ├── ContratosView
│                         ├── CobrosView (Cartera)
│                         ├── TallerView
│                         └── UsuariosView (solo ADMIN)
│
└── supabase.ts (cliente único)
      ├── Auth — login, logout, sesión
      ├── DB — queries REST sobre 7 tablas
      ├── Realtime — suscripciones en tiempo real
      └── Edge Functions — create-user (service role)

SUPABASE (cloud)
├── auth.users — cuentas de acceso
├── profiles — nombre y rol por usuario
├── motos — flota de vehículos
├── clientes — prospectos y clientes activos
├── visitas — visitas domiciliarias
├── contratos — acuerdos de arriendo
├── pagos — historial de cobros
└── taller — mantenimiento técnico
```

---

## 4. BASE DE DATOS — TABLAS

### 4.1 `profiles`
Perfil de cada usuario del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid PK | Igual al id de `auth.users` |
| `nombre` | text | Nombre completo |
| `role` | text | ADMIN / ADMIN_PRINCIPAL / SECRETARIA / MECANICO / SUBADMIN |
| `created_at` | timestamptz | Automático |

**Trigger:** Al crear usuario en Supabase Auth → se crea automáticamente el perfil.

---

### 4.2 `motos`
Flota de vehículos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid PK | Auto |
| `placa` | text UNIQUE | Placa del vehículo (mayúsculas) |
| `grupo` | text | CLUB / PRADERA / COSTA |
| `marca` | text | |
| `modelo` | text | |
| `numero_motor` | text | |
| `numero_chasis` | text | |
| `lugar_matricula` | text | |
| `cilindraje` | text | |
| `fecha_seguro` | date | Vencimiento SOAT |
| `fecha_tecnomecanica` | date | Vencimiento tecno |
| `propietario` | text | |
| `numero_serie` | text | |
| `estado` | text | Ver tabla de estados abajo |
| `condicion_ingreso` | text | `nueva` / `usada` — se define al registrar por primera vez |
| `grupo` | text | `COSTA` / `PRADERA` / `RASTREADOR` / otro — inmutable |
| `observaciones` | text | |
| `created_at` / `updated_at` | timestamptz | Auto |

#### Estados de motos
| Estado | Descripción | Quién lo asigna |
|--------|-------------|-----------------|
| `Disponible` | Lista para asignar. Puede ser nueva (compra directa) o usada (ya estuvo con cliente) | Sistema / Admin |
| `Asignada` | Tiene cliente y contrato activo | Sistema (al activar contrato) |
| `En taller` | En revisión o reparación interna | Admin / Mecánico |
| `Garantía` | En el concesionario por defecto de fábrica — fechas + motivo + detalles | Admin |
| `Fiscalía` | Retenida por Fiscalía — fecha retención, # caso, fecha salida estimada, detalles | Admin |
| `Tránsito` | Retenida por autoridad de tránsito — fechas + motivos | Admin |
| `Recuperada` | Recuperada de cliente por incumplimiento — en proceso de re-asignación | Admin |

> **Regla importante:** Al registrar una moto por primera vez se debe especificar si es **Nueva** (directo de compra) o **Usada** (ya fue asignada anteriormente o viene de otra fuente). Este campo es inmutable.

---

### 4.3 `clientes`
Prospectos y clientes activos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid PK | Auto |
| `nombre` | text | |
| `cedula` | text | |
| `direccion` | text | |
| `fuente_llegada` | text | Cómo llegó al negocio |
| `telefono` | text | |
| `mismo_whatsapp` | boolean | ¿El teléfono tiene WhatsApp? |
| `whatsapp` | text | Si es diferente al teléfono |
| `acompanante_nombre` | text | |
| `acompanante_cedula` | text | |
| `acompanante_telefono` | text | |
| `documentos_cliente` | jsonb | `{ cedula, licencia, recibo1, recibo2, carta, antecedentes, hojaVida }` |
| `documentos_acompanante` | jsonb | Misma estructura |
| `estado` | text | Ver estados abajo |
| `excepcion_documental` | boolean | Si se permite continuar sin todos los docs |
| `excepcion_motivo` | text | Por qué se aprobó la excepción |
| `excepcion_plazo` | date | Fecha límite para entregar los docs |
| `created_at` / `updated_at` | timestamptz | Auto |

**Estados del cliente (en orden de flujo):**
1. `En proceso` — registrado, sin documentos completos
2. `Listo para visita` — documentos completos
3. `Pendiente evaluación` — visita domiciliaria realizada
4. `Aprobado` — ADMIN aprobó la visita
5. `Activo` — tiene contrato activo
6. `En seguimiento` — cliente observado
7. `En riesgo` — señales de incumplimiento
8. `En mora` — pagos atrasados
9. `Rechazado` — no aprobado
10. `Retirado` — retirado voluntariamente
11. `Lista negra` — bloqueado definitivamente
12. `Inmovilización documentación incompleta` — excepción vencida sin docs

**Estructura de cada documento:**
```json
{ "ok": true, "file": "nombre_archivo.jpg" }
```

---

### 4.4 `visitas`
Visitas domiciliarias realizadas por el equipo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid PK | Auto |
| `cliente_id` | uuid FK | → clientes (cascade delete) |
| `estado` | text | Pendiente / Realizada |
| `resultado` | text | Aprobado / Rechazado / null |
| `entrevista` | jsonb | `{ viveAlli, tiempoResidencia, estabilidadLaboral, tipoVivienda, recomendacion, observaciones }` |
| `fotos` | jsonb | `{ clienteFuncionario, fachada }` (nombres de archivo) |
| `ubicacion` | jsonb | `{ lat, lng }` — coordenadas GPS |
| `fecha` | date | Fecha de la visita |
| `created_at` | timestamptz | Auto |

---

### 4.5 `contratos`
Acuerdos de arriendo entre cliente y empresa.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid PK | Auto |
| `cliente_id` | uuid FK | → clientes |
| `moto_id` | uuid FK nullable | → motos |
| `dia_pago` | text | Lunes / Martes / ... / Domingo |
| `valor_semanal` | numeric | Cuota semanal pactada |
| `meses` | int | Duración del contrato |
| `ahorro_inicial` | numeric | Depósito inicial |
| `fecha_entrega` | date | Fecha de entrega de la moto |
| `firma_cliente` | boolean | ¿Firmó el cliente? |
| `firma_responsable` | boolean | ¿Firmó el responsable de la empresa? |
| `estado` | text | En proceso / Activo / Finalizado / Cancelado |
| `created_at` | timestamptz | Auto |

---

### 4.6 `pagos`
Registro de todos los cobros.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid PK | Auto |
| `contrato_id` | uuid FK | → contratos |
| `valor` | numeric | Monto recibido |
| `metodo` | text | Efectivo / Transferencia |
| `estado` | text | Confirmado / Pendiente / Rechazado |
| `aplicado` | jsonb | `{ deuda, semana, ahorro, convenio, saldo }` |
| `fecha` | date | Fecha del pago |
| `created_at` | timestamptz | Auto |

**Lógica de aplicación automática (en orden):**
1. **Deuda atrasada** — base de $50.000
2. **Semana actual** — `valor_semanal` del contrato
3. **Ahorro** — hasta $30.000 por semana
4. **Saldo a favor** — lo que sobre

**Nota:** Transferencias quedan en `Pendiente` hasta que ADMIN las confirme. Solo los pagos `Confirmado` afectan la cartera.

---

### 4.7 `taller`
Control de mantenimiento técnico.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid PK | Auto |
| `moto_id` | uuid FK | → motos |
| `estado_tecnico` | text | Pendiente / En diagnóstico / En reparación / Listo para salida / Finalizado |
| `detalle` | text | Descripción del trabajo |
| `costo` | numeric | Costo del mantenimiento |
| `repuestos` | text | Lista de repuestos usados |
| `fecha_ingreso` | date | Entrada al taller |
| `fecha_salida` | date | Salida (se llena al finalizar) |
| `created_at` | timestamptz | Auto |

---

## 5. MÓDULOS DEL SISTEMA

### 5.1 Panel General (Dashboard)
**Archivo:** `src/pages/DashboardView.tsx`
**Acceso:** Todos los roles

Resumen visual en tiempo real con 5 tarjetas:
- **Motos**: disponibles, asignadas, en mantenimiento, total flota
- **Clientes**: en aprobación, activos, en riesgo/mora, total
- **Contratos**: activos, en proceso, total
- **Cartera**: transferencias pendientes, recaudado en la semana
- **Taller**: motos en proceso

Cada fila es clickeable y navega al módulo correspondiente.

---

### 5.2 Clientes
**Archivo:** `src/pages/ClientesView.tsx`
**Acceso:** Todos los roles (edición restringida por rol)

**Funciones:**
- Registrar cliente nuevo (datos, contacto, acompañante, documentos)
- Subir/fotografiar documentos obligatorios (7 por cliente + 7 por acompañante)
- Filtrar: todos / pendientes de aprobación
- Buscar por nombre, cédula o teléfono
- Ver detalle en panel lateral (desktop) o modal inferior (móvil)
- Registrar visita domiciliaria (fotos, GPS, entrevista)
- Semáforo de riesgo en vista de pendientes
- Aplicar excepción documental (solo ADMIN, requiere motivo + plazo)
- Cambiar estados (solo ADMIN)

---

### 5.3 Motos
**Archivo:** `src/pages/MotosView.tsx`
**Acceso:** Todos los roles (registrar/cambiar estado solo ADMIN)

**Funciones:**
- Ver flota completa con estado
- Buscar por placa, marca o modelo
- Registrar moto nueva (placa, grupo, datos técnicos, vencimientos)
- Cambiar estado manualmente
- Ver detalle: datos técnicos, vencimientos, observaciones

---

### 5.4 Contratos
**Archivo:** `src/pages/ContratosView.tsx`
**Acceso:** Todos pueden ver, solo ADMIN puede crear/modificar

**Flujo obligatorio:**
1. Crear contrato → cliente debe estar `Aprobado`
2. Firmar cliente (`firma_cliente = true`)
3. Asignar moto disponible (requiere firma previa)
4. Activar contrato → moto pasa a `Asignada`, cliente pasa a `Activo`
5. Cancelar si es necesario → moto regresa a `Disponible`

**Modalidades de pago (forma de cobro):**
| Modalidad | Descripción |
|-----------|-------------|
| `Diario` | Se cobra cada día |
| `Semanal` | Se cobra cada semana |
| `Quincenal` | Se cobra cada 15 días |
| `Mensual` | Se cobra cada mes |

> La tarifa diaria es **la misma para todos**. Solo cambia la frecuencia de cobro y acumulación.

**Base inicial:** $510.000 — obligatoria y fija para todos los contratos. Se debe completar antes de entregar la moto.

**Meses del contrato:** Se define al crear el contrato según acuerdo.

**Alerta de traspaso:** El sistema notifica **2 meses antes** de que venza el contrato para iniciar el proceso legal de traspaso del vehículo al nombre del cliente.

**Motivos de terminación del contrato:**
| Motivo | Qué pasa con el ahorro |
|--------|----------------------|
| Terminación exitosa | Pasa a la empresa como pago de venta; se genera paz y salvo; inicia traspaso |
| Devolución voluntaria | Se entrega al cliente menos deudas y daños |
| Recuperación por mora | Admin decide caso a caso |
| Incumplimiento de convenios | Admin decide caso a caso |
| Causales del contrato (delitos, etc.) | Admin decide caso a caso |

---

### 5.5 Cartera (Cobros)
**Archivo:** `src/pages/CobrosView.tsx`
**Acceso:** Todos los roles

**Funciones:**
- Ver resumen: pagan hoy, en mora, en gabela, transferencias pendientes
- Registrar pago con búsqueda de contrato por placa o nombre
- Ver aplicación automática del pago antes de confirmar
- Historial de pagos (contrato, cliente, moto, valor, estado)
- Confirmar / rechazar transferencias pendientes (solo ADMIN)
- Detalle de cartera por contrato

---

### 5.6 Taller
**Archivo:** `src/pages/TallerView.tsx`
**Acceso:** Todos pueden ver, MECANICO puede actualizar estados, ADMIN puede todo

**Funciones:**
- Ver resumen: por estado técnico
- Registrar ingreso (seleccionar moto, estado inicial, detalle, costo, repuestos)
- Actualizar estado técnico progresivamente
- Finalizar proceso (moto regresa a `Disponible`)

---

### 5.7 Usuarios
**Archivo:** `src/pages/UsuariosView.tsx`
**Acceso:** Solo ADMIN y ADMIN_PRINCIPAL

**Funciones:**
- Ver equipo actual con rol y color de badge
- Crear usuario con nombre, email, contraseña temporal y rol
- Los usuarios no pueden registrarse solos desde el login

---

## 6. FLUJOS OPERATIVOS

### 6.1 Flujo completo de un cliente nuevo
```
SECRETARIA registra cliente
    ↓
Sube documentos (7 obligatorios cliente + acompañante)
    ↓ (automático cuando todos los docs están)
Estado: "Listo para visita"
    ↓
SECRETARIA realiza visita domiciliaria (foto, GPS, entrevista)
    ↓
Estado: "Pendiente evaluación"
    ↓
ADMIN revisa semáforo de riesgo y aprueba o rechaza
    ↓ (si aprueba)
Estado: "Aprobado"
    ↓
ADMIN crea contrato → firma cliente → asigna moto → activa contrato
    ↓
Estado cliente: "Activo" | Estado moto: "Asignada"
    ↓
Inicia flujo de pagos semanales/diarios
```

### 6.2 Flujo de pago semanal
```
SECRETARIA selecciona contrato activo (busca por placa o nombre)
    ↓
Ingresa valor recibido y método (Efectivo / Transferencia)
    ↓
Sistema aplica automáticamente: deuda → semana → ahorro → saldo
    ↓
Efectivo → estado "Confirmado" de inmediato
Transferencia → estado "Pendiente" (no afecta cartera hasta confirmar)
    ↓
ADMIN confirma o rechaza transferencias pendientes
```

### 6.3 Flujo de taller
```
ADMIN / MECANICO registra ingreso de moto
    ↓
Estado moto: "Mantenimiento"
    ↓
MECANICO actualiza estado técnico (diagnóstico → reparación → listo)
    ↓
Finalizar proceso
    ↓
Estado moto: "Disponible" | Fecha salida registrada
```

---

## 7. SEGURIDAD

### Row Level Security (RLS) — Supabase
Todas las tablas tienen RLS activado. Las políticas controlan qué puede hacer cada usuario según su rol.

### Triggers de seguridad en la DB
| Trigger | Tabla | Función |
|---------|-------|---------|
| `enforce_profile_role_change` | profiles | Nadie puede escalar su propio rol |
| `enforce_cliente_estado_change` | clientes | Solo ADMIN cambia estados sensibles |
| `trg_motos_updated_at` | motos | Mantiene `updated_at` |
| `trg_clientes_updated_at` | clientes | Mantiene `updated_at` |
| `on_auth_user_created` | auth.users | Crea perfil automático al registrar usuario |

### Edge Function: `create-user`
- Solo ejecutable con token de usuario ADMIN
- Usa `service_role` key para crear usuarios en Supabase Auth
- Crea usuario + perfil con nombre y rol

---

## 8. ESTRUCTURA DE ARCHIVOS

```
motogestion/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx          # Sesión, perfil, rol
│   ├── hooks/
│   │   ├── useMotos.ts
│   │   ├── useClientes.ts
│   │   ├── useVisitas.ts
│   │   ├── useContratos.ts
│   │   ├── usePagos.ts
│   │   └── useTaller.ts
│   ├── lib/
│   │   └── supabase.ts              # Cliente Supabase (singleton)
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── DashboardView.tsx
│   │   ├── MotosView.tsx
│   │   ├── ClientesView.tsx
│   │   ├── ContratosView.tsx
│   │   ├── CobrosView.tsx
│   │   └── TallerView.tsx
│   │   └── UsuariosView.tsx
│   ├── App.tsx                      # Shell + navegación
│   └── main.tsx
├── supabase/
│   ├── 000_profiles.sql
│   ├── 001_motos.sql
│   ├── 002_clientes.sql
│   ├── 003_contratos_pagos_taller.sql
│   ├── 004_roles_seguridad.sql
│   ├── 005_usuarios.sql
│   └── functions/
│       └── create-user/
│           └── index.ts
└── package.json
```

---

## 9. MÓDULO DE CARTERA — DEFINICIÓN COMPLETA

### 9.1 Modelo de negocio (esencia)
MotoGestión opera bajo un modelo de **alquiler con ahorro y venta posterior**:
- El cliente alquila una moto pagando una tarifa diaria o semanal
- Simultáneamente acumula un ahorro con cada pago
- Al completar el contrato, el ahorro acumulado equivale a la compra de la moto
- Si el contrato se liquida anticipadamente, el ahorro (descontando deudas y daños) se devuelve al cliente en efectivo

---

### 9.2 Tipos de contrato

#### Contrato DIARIO
- Cliente nuevo que aún no tiene base inicial completa
- Está ahorrando para llegar a **$510.000** (base inicial)
- Paga tarifa diaria fija + ahorro variable
- No tiene tiempo definido de contrato
- Cuando completa los $510.000 → el sistema lo notifica y el funcionario ejecuta el paso a contrato semanal
- La base se divide: **$202.000** = primera semana adelantada / **$308.000** = ahorro inicial

#### Contrato SEMANAL
- Se activa cuando el cliente completó la base inicial de $510.000
- Tiene tiempo definido, cuota semanal fija, todas las condiciones pactadas
- Al final del contrato el ahorro acumulado pasa a la empresa como pago de venta de la moto
- El cliente recibe paz y salvo y puede hacer el traspaso del vehículo

#### Regla de inicio con caso especial
- Puede darse que un cliente empiece el contrato semanal sin completar los $510.000
- En ese caso se activa un convenio de pago por el valor faltante de la base inicial
- Debe quedar documentado como caso especial aprobado por ADMIN

---

### 9.3 Conceptos de cobro

#### Tarifa (ingreso de la empresa)
Lo que le corresponde a la empresa por cada día que el cliente tiene la moto en su poder. Es **fija e innegociable**.

| Tipo de cliente | Lunes a Sábado | Domingo |
|----------------|---------------|---------|
| Diario (antiguo) | $26.000 | $13.000 |
| Diario (nuevo) | $27.000 | $14.000 |
| Semanal | $31.000/día | $16.000 |

**Regla del domingo:** siempre es la mitad de la tarifa de L–S.

- La tarifa sigue corriendo mientras el cliente tenga la moto, aunque no haya pagado
- Si la moto está en Fiscalía, la tarifa se **congela** (no corre) mientras dure la retención
- Es la base de la proyección de ingresos de la empresa — no puede cambiar

#### Cuota Pactada (obligación del cliente por período)
El valor total que el cliente se compromete a pagar por período según el contrato. **No cambia durante la vigencia del contrato.**

Incluye:
- **Tarifa** del período (ingreso de la empresa)
- **Ahorro** del período (acumulado para el cliente, usado al liquidar)

Modalidades:
| Modalidad | Período | Ejemplo cuota |
|-----------|---------|---------------|
| Diario | Cada día | $37.000–$50.000 |
| Semanal | Cada semana | $100.000–$150.000 |
| Quincenal | Cada 15 días | Equivalente × 15 días |
| Mensual | Cada mes | Equivalente × 30 días |

El ahorro ya está incluido en la cuota pactada — el cliente no puede separarlo ni decidir no pagarlo.

#### Saldo
El sistema lleva un saldo corriente por contrato:
- **Saldo a favor**: el cliente pagó más de su cuota pactada → queda guardado en su cuenta hasta que él decida usarlo o el ADMIN lo aplique
- **Saldo en contra**: el cliente pagó menos → se acumula como deuda de tarifa

El saldo a favor **no se aplica automáticamente** — queda reservado hasta que se tome la decisión de utilizarlo.

---

### 9.3B Tipos de contrato por duración

#### Contrato DIARIO — duración indefinida
- El cliente paga cada día mientras tenga la moto
- No tiene fecha de vencimiento ni número de meses definido
- Se termina cuando el cliente decide devolver la moto o por mora/incumplimiento
- La tarifa diaria es la cuota pactada total (no hay ahorro estructurado en la cuota)

#### Contratos SEMANAL / QUINCENAL / MENSUAL — duración definida
- Tienen un número de meses pactado y fecha de entrega
- La cuota del período ya incluye tarifa + ahorro
- El sistema calcula equivalencias diarias para prorrateos y liquidaciones:

| Campo | Fórmula |
|-------|---------|
| `cuota_diaria` | cuota_período ÷ días_período |
| `tarifa_diaria` | 26k o 27k (fija, lo que le corresponde a la empresa) |
| `ahorro_diario` | cuota_diaria − tarifa_diaria |

#### Prorrateo
Aplica cuando la moto estuvo con el cliente pero el pago no cubrió todos los días del período:
- Se cobra `cuota_diaria × días_sin_cubrir`
- Incluye tarifa + ahorro (igual que la cuota normal)

#### Liquidación (terminación de contrato)
Cuando el contrato termina (por cualquier causa) y quedan días pendientes:
- Solo se cobra la **tarifa diaria × días con moto** (sin ahorro)
- El ahorro acumulado se usa para saldar deudas primero, el remanente se devuelve al cliente

---

### 9.4 Orden de aplicación de cada pago
Todo pago se aplica en este orden estricto:

1. **Cuota pactada del período** (tarifa + ahorro incluidos)
2. **Deuda pendiente** — si tiene deuda acumulada fuera de la cuota
3. **Cuota de convenio** — si tiene convenio activo
4. **Saldo a favor** — el sobrante queda guardado, no se aplica automáticamente a períodos futuros

El sistema muestra el desglose completo de cada pago: cuánto fue a cuota, cuánto a deuda, cuánto a convenio y cuánto quedó como saldo a favor.

---

### 9.5 Gabela y mora

#### Día de gabela
- Todos los clientes (diario y semanal) tienen **1 día de gracia** después del día de pago pactado
- Ejemplo: día de pago = lunes → gabela = martes → mora desde el miércoles
- La mora aplica cuando al vencer el día de gabela **no se ha completado el total** a pagar (no solo si no pagó nada)

#### Estados de cobro
| Estado | Descripción |
|--------|-------------|
| **Al día** | Completó el pago antes o en el día de gabela |
| **En gabela** | Está en el día de gracia, aún no ha completado el pago |
| **En mora** | Venció el día de gabela sin completar el pago |

#### Acciones al entrar en mora
1. El sistema marca automáticamente al cliente en mora
2. Se activan acciones manuales por el funcionario asignado:
   - Llamada telefónica al cliente
   - Mensaje de WhatsApp de recordatorio/aviso
   - Si no responde: apagar moto remotamente (GPS — manual por ahora)
   - Activar sirena remotamente (GPS — manual por ahora)
   - Ir a recuperar el vehículo físicamente
3. Toda acción queda registrada en el historial del cliente

**Nota:** La retención aplica siempre que entre en mora, no solo cuando hay convenio activo.

---

### 9.6 Tipos de deuda

Toda deuda es igual en términos de reglas (puede entrar a convenio), pero debe quedar registrada con su origen específico:

| Tipo | Descripción |
|------|-------------|
| **Tarifa atrasada** | Días o semanas sin pagar la tarifa del vehículo |
| **Daños al vehículo** | Detectados en taller al devolver la moto |
| **Préstamo repuestos** | La empresa prestó dinero para comprar repuestos |
| **Préstamo eventualidad** | Retención por entidad pública, emergencia, etc. |
| **Fotomulta** | Multas de tránsito a cargo del cliente |

**Importante:**
- Toda deuda debe cobrarse inmediatamente salvo que se apruebe un convenio
- En caso de liquidación o terminación de contrato, la deuda se descuenta del ahorro acumulado
- Los préstamos solo los puede aprobar ADMIN o quien tenga habilitada esa función
- Todo movimiento queda registrado con: concepto, monto, fecha, quién lo registró y por qué

---

### 9.7 Convenios de pago

Un convenio permite diferir una deuda en cuotas que se suman al pago normal del cliente.

#### Reglas del convenio
1. **No puede haber convenio sobre convenio** — debe estar terminado o no existir uno activo para crear uno nuevo
2. **Máximo 3 convenios por contrato** durante toda su duración
3. **Si incumple el 3er convenio** → terminación automática del contrato y liquidación
4. Si llega una deuda nueva mientras hay convenio activo por concepto diferente al pago → se puede **renovar el convenio absorbiendo la deuda nueva**, sin contar como convenio adicional (sigue siendo el mismo número)
5. El sistema muestra claramente en el cobro del día cuánto corresponde al convenio y por qué concepto

#### Quién puede crear un convenio
- ADMIN, ADMIN_PRINCIPAL y quien tenga habilitada esa función

#### Qué define el convenio
- Número de cuotas fijo
- Fecha límite para saldar
- Monto de la cuota extra por período
- Concepto de la deuda

---

### 9.8 Paso de contrato diario a semanal

1. El cliente completa los $510.000 de base inicial
2. El sistema detecta el hito y **notifica al funcionario**
3. El funcionario ejecuta el cambio desde el sistema
4. El sistema:
   - Liquida el contrato diario
   - Transfiere los fondos a favor como base inicial del nuevo contrato
   - Registra la moto como "en taller" para revisión
   - Si hay daños detectados en taller → la deuda pasa al nuevo contrato
5. La empresa asigna una moto nueva (normalmente)
6. Se crea el contrato semanal con todas las condiciones definidas

**Regla de la semana adelantada:** El principio es "paga, consume, vuelve y paga". Siempre debe tener la semana actual cubierta ($202.000) antes de consumirla.

---

### 9.9B Motos retenidas — Fiscalía / Tránsito / Garantía

#### Fiscalía
- Estado: `Fiscalía`
- Registrar: fecha de retención, # caso, fecha de salida estimada, detalles / motivo
- La **tarifa diaria se congela** en el sistema mientras está retenida
- El tiempo retenido **queda como deuda del cliente** (la empresa deja de operar ese activo)
- El Admin decide si aplicar la deuda inmediatamente o al momento de la liquidación

#### Tránsito
- Estado: `Tránsito`
- Registrar: fechas, motivos
- Misma regla de tarifa que Fiscalía

#### Garantía
- Estado: `Garantía`
- Registrar: fechas, motivos, detalles del defecto
- La moto está en el concesionario por defecto de fábrica
- No genera deuda para el cliente (no es culpa suya)
- Los gastos son asumidos por la empresa / garantía del fabricante

---

### 9.9C Proceso de Traspaso (al terminar contrato exitosamente)

1. El sistema alerta al Admin **2 meses antes** de que venza el contrato — **"Alerta de inicio de traspaso"**
2. El Admin inicia el proceso de traspaso desde el sistema
3. El cliente asume los costos del traspaso (notaría, impuestos, etc.)
4. La empresa acompaña y gestiona el proceso legal
5. Al completarse: moto queda a nombre del cliente, contrato cierra como `Finalizado`
6. El sistema genera el **paz y salvo** definitivo

---

### 9.9 Cierre y liquidación de contrato

#### Liquidación anticipada (por decisión del cliente o por incumplimiento)
1. Se registra el motivo de cierre
2. La moto va a taller para revisión
3. Si hay daños → se calcula el costo y se descuenta del ahorro
4. Se descuenta cualquier deuda pendiente del ahorro
5. Se genera **documento de liquidación** con todos los rubros detallados
6. El saldo restante se entrega al cliente en efectivo
7. El cliente queda en el historial como "contrato liquidado"

#### Contrato cumplido exitosamente
1. El ahorro acumulado pasa a la empresa como pago de venta de la moto
2. Se genera **paz y salvo**
3. La moto queda disponible para traspaso al cliente
4. El cliente queda en el historial como "contrato finalizado"

#### Tipos de incumplimiento (a definir en detalle más adelante)
- Mora reiterada
- Incumplimiento del 3er convenio
- Daños graves al vehículo
- Otros (a documentar)

---

### 9.10 Métodos de pago

| Método | Confirmación | Efecto en cartera |
|--------|-------------|-------------------|
| Efectivo | Automática al registrar | Inmediato |
| Nequi (transferencia) | Manual por ADMIN o SECRETARIA | Solo al confirmar |

- Las transferencias llegan por WhatsApp como comprobante
- El funcionario las registra en el sistema como "pendiente"
- Al confirmar → afecta la cartera
- Al rechazar → queda en historial como rechazado

---

### 9.11 Vista diaria de cartera (resumen)

El módulo debe mostrar al abrir:
- **Total recaudado hoy** — suma de pagos confirmados del día
- **Cuántos pagaron hoy** — número de clientes que pagaron
- **Pagan hoy** — lista de clientes con pago pendiente para hoy
- **En gabela** — clientes en día de gracia
- **En mora** — clientes con pago vencido

Al seleccionar un cliente de la lista se debe ver:
- Historial de pagos
- Estado actual (al día / gabela / mora)
- Deuda pendiente y convenio activo si aplica
- Acciones disponibles: registrar pago, llamar, enviar WhatsApp, registrar gestión

---

### 9.12 Acciones de cobro desde el sistema

| Acción | Quién puede | Cuándo |
|--------|------------|--------|
| Registrar pago | SECRETARIA, ADMIN | Siempre |
| Confirmar transferencia | SECRETARIA, ADMIN | Cuando hay pendiente |
| Crear convenio | ADMIN + habilitados | Cuando hay deuda |
| Registrar préstamo | ADMIN + habilitados | Por solicitud |
| Registrar gestión de cobro | Todos | En mora |
| Apagar moto (GPS) | Manual por ahora | En mora |
| Activar sirena (GPS) | Manual por ahora | En mora |
| Liquidar contrato | ADMIN | Al cierre |

---

### 9.13 Cambios requeridos en base de datos

Para implementar todo lo anterior se necesitan los siguientes cambios en la DB:

#### Tabla `contratos` — campos nuevos
- `tipo_contrato` (text): "diario" | "semanal"
- `tarifa_diaria` (numeric): tarifa fija del vehículo por día
- `tarifa_domingo` (numeric): tarifa del domingo
- `base_inicial` (numeric): monto de base inicial (default 510.000)
- `base_completada` (boolean): si completó la base inicial
- `ahorro_acumulado` (numeric): total de ahorro del cliente a la fecha
- `semana_adelantada_cubierta` (boolean): si tiene la semana actual cubierta

#### Tabla `deudas` — nueva tabla
- `id` (uuid PK)
- `contrato_id` (uuid FK)
- `concepto` (text): tarifa_atrasada / daño_vehiculo / prestamo_repuesto / prestamo_eventualidad / fotomulta / otro
- `descripcion` (text): detalle del origen
- `monto` (numeric)
- `monto_pendiente` (numeric)
- `estado` (text): pendiente / en_convenio / pagada
- `registrado_por` (uuid FK profiles)
- `created_at` (timestamptz)

#### Tabla `convenios` — nueva tabla
- `id` (uuid PK)
- `contrato_id` (uuid FK)
- `numero_convenio` (int): 1, 2 o 3 (máximo 3 por contrato)
- `deuda_total` (numeric): monto total a diferir
- `cuota_por_periodo` (numeric): cuota extra por pago
- `numero_cuotas` (int)
- `cuotas_pagadas` (int)
- `fecha_limite` (date)
- `estado` (text): activo / cumplido / incumplido / renovado
- `concepto` (text): descripción de por qué se creó
- `aprobado_por` (uuid FK profiles)
- `created_at` (timestamptz)

#### Tabla `gestiones_cobro` — nueva tabla
- `id` (uuid PK)
- `contrato_id` (uuid FK)
- `tipo` (text): llamada / whatsapp / visita / apagado_moto / sirena / recuperacion / otro
- `resultado` (text): descripción de lo que pasó
- `registrado_por` (uuid FK profiles)
- `fecha` (date)
- `created_at` (timestamptz)

#### Tabla `pagos` — campos nuevos
- `aplicado_tarifa` (numeric): cuánto fue a tarifa
- `aplicado_deuda` (numeric): cuánto fue a deuda
- `aplicado_convenio` (numeric): cuánto fue a convenio
- `aplicado_ahorro` (numeric): cuánto fue a ahorro
- `aplicado_saldo` (numeric): saldo a favor restante
- `convenio_id` (uuid FK nullable): si este pago abonó a un convenio

---

## 10. ESTADO ACTUAL DEL PROYECTO — VERSIÓN ANTERIOR

> **Nota:** La sección de estado actual se mantiene abajo. El módulo de Cartera será rediseñado según la definición de la sección 9.

## 11. ESTADO ACTUAL DEL PROYECTO

### ✅ Módulos completados y desplegados
- [x] Autenticación con Supabase Auth
- [x] Sistema de roles (5 roles con permisos diferenciados)
- [x] Dashboard con resumen en tiempo real y navegación
- [x] Módulo de Motos (CRUD completo + estados)
- [x] Módulo de Clientes (registro, documentos, visitas, semáforo, excepciones)
- [x] Módulo de Contratos (flujo completo: crear → firmar → asignar → activar)
- [x] Módulo de Cartera/Cobros (pagos, aplicación automática, historial)
- [x] Módulo de Taller (ingresos, estados, finalización)
- [x] Módulo de Usuarios (crear cuentas por ADMIN)
- [x] Diseño responsive (desktop + móvil con bottom-sheet)
- [x] Realtime en todas las tablas

### 🔄 Plan de trabajo — Actualizado v1.9

> **Nota:** Los puntos de cartera, ciclo del cliente y manejo contable están **parcialmente definidos** y requieren más sesiones de definición antes de implementar completamente.

---

#### FASE 1 — BASE OPERATIVA (en curso)
- [x] Autenticación y roles
- [x] Módulo Clientes
- [x] Módulo Motos
- [x] Módulo Contratos
- [x] Módulo Cartera básico
- [x] Módulo Taller
- [x] Módulo Liquidaciones (6 etapas)
- [x] Módulo Ubicaciones de motos
- [x] PWA (instalar desde móvil)
- [x] Datos de prueba cargados

---

#### FASE 2 — CARTERA COMPLETA (prioridad máxima — esencia del negocio)
- [ ] **Definir ciclo completo de cartera** (sesión de definición pendiente)
- [ ] **Confirmar / rechazar transferencias** (Nequi/Daviplata pendientes de ADMIN)
- [ ] **Registrar deudas** — daños, préstamos, multas, tarifa atrasada
- [ ] **Crear y gestionar convenios** de pago (máx 3 por contrato)
- [ ] **Vista de mora** con acciones de cobro (llamar, WhatsApp, gestión)
- [ ] **Aplicación automática del pago** con desglose visible (tarifa → deuda → convenio → ahorro)
- [ ] **Retención por Fiscalía/Tránsito** — congela tarifa, registra deuda
- [ ] **Quincenal y Mensual** — nuevas modalidades de pago
- [ ] **Estadísticas por grupo** — recaudo, mora, rentabilidad separada por grupo

#### FASE 3 — CICLO COMPLETO DEL CLIENTE
- [ ] **Definir ciclo completo** de llegada a cierre (sesión pendiente)
- [ ] **Fuentes de llegada** del cliente (referido, redes, directo, etc.)
- [ ] **Documentos requeridos** (definir lista exacta)
- [ ] **Proceso de traspaso** — alerta 2 meses antes + flujo legal
- [ ] **Paz y salvo** automático al terminar exitosamente
- [ ] **Lista negra** — validación al registrar cliente nuevo

#### FASE 4 — GRUPOS Y ADMINS
- [ ] **Asignación de motos a Admins** desde el Admin Principal
- [ ] **Vista filtrada por Admin** — cada Admin ve solo sus motos
- [ ] **Reportes por grupo** — estadísticas independientes por portafolio
- [ ] **Delegación de funciones** — el Admin Principal habilita funciones especiales por usuario

#### FASE 5 — MOTOS AVANZADO
- [ ] **Garantía** — registrar con concesionario, fechas, detalles
- [ ] **Fiscalía / Tránsito** — registrar retención, calcular deuda
- [ ] **Condición de ingreso** (nueva / usada) al registrar
- [ ] **Recuperación de motos** — proceso formal de recuperación por mora

#### FASE 6 — REPORTES Y AUDITORÍA
- [ ] **Auditoría de usuarios** — rastro de cada acción en el sistema
- [ ] **Reportes exportables** — PDF/Excel por módulo
- [ ] **Dashboard avanzado** — gráficas por grupo, mora semanal, recaudo
- [ ] **Alertas** — SOAT, tecno, contratos próximos a vencer, traspaso

#### FASE 7 — INTEGRACIONES
- [ ] **GPS real** — apagar/activar sirena desde el sistema
- [ ] **WhatsApp automático** — notificaciones de pago, mora
- [ ] **Módulo de nómina** — pagos a funcionarios

---

## 10. CONVENCIONES DE CÓDIGO

### Estilos
- Todo CSS es inline con objetos `React.CSSProperties`
- Se usan variables de estilo compartidas dentro de cada archivo:
  ```ts
  const card: React.CSSProperties = { background: "white", borderRadius: 16, ... }
  const inputStyle: React.CSSProperties = { ... }
  const primaryBtn: React.CSSProperties = { ... }
  ```
- Paleta de colores:
  - Azul principal: `#0284c7`
  - Verde: `#166534` / `#dcfce7`
  - Rojo: `#991b1b` / `#fee2e2`
  - Amarillo: `#92400e` / `#fef3c7`
  - Fondo: `#f1f5f9`
  - Texto: `#0f172a` / `#334155` / `#64748b`

### Hooks
- Cada entidad tiene su hook (`useMotos`, `useClientes`, etc.)
- El hook maneja: estado, loading, error, carga inicial, realtime y funciones de escritura
- Siempre retornan `{ error: string | null }` en operaciones de escritura

### Nomenclatura
- Componentes: PascalCase (`ClientesView`, `DashboardView`)
- Funciones: camelCase (`handleCrear`, `cargarClientes`)
- Tipos: PascalCase (`Cliente`, `ContratoEstado`)
- Archivos: PascalCase para componentes, camelCase para hooks

---

## 11. DESPLIEGUE

### Flujo de trabajo
1. Desarrollo y cambios en rama `claude/...` (rama de trabajo)
2. Push a GitHub
3. Pull Request hacia `main`
4. Merge → Vercel despliega automáticamente en producción

### Variables de entorno requeridas en Vercel
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### Comandos útiles
```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Compilar para producción
npm run build

# Verificar tipos TypeScript
npx tsc --noEmit
```

---

## 12. MÓDULO DE LIQUIDACIONES

### Flujo de 6 etapas
1. **Iniciada** — Admin abre liquidación desde contrato activo. Elige motivo. Moto pasa a "En taller" automáticamente.
2. **En taller** — Formulario de revisión: observaciones, daños detallados, deudas pendientes.
3. **Calculada** — Sistema calcula: `ahorro_acumulado − total_deudas − costo_daños = saldo_final`.
4. **Documento generado** — Sistema imprime documento con firma de empresa ya incluida (nombre + cargo del responsable predefinido). Cliente debe firmar físicamente.
5. **Firmada** — Funcionario sube foto/scan del documento firmado. Queda en Supabase Storage.
6. **Cerrada** — Contrato → "Finalizado". Si `saldo_final < 0`, cliente queda en **lista negra** automáticamente.

### Motivos de liquidación
- `cumplimiento` — Cliente completó el contrato correctamente
- `retiro_voluntario` — Cliente decide retirarse
- `incumplimiento` — Empresa retira por incumplimiento grave

### Reglas
- Solo ADMIN y ADMIN_PRINCIPAL pueden iniciar liquidación
- Número secuencial: `LIQ-0001`, `LIQ-0002`, etc.
- Lista negra: campo `lista_negra = true` en `clientes`, con `motivo_lista_negra` detallado
- Documento imprimible generado con `window.print()` — sin dependencias externas
- Documento firmado subido a bucket `liquidaciones` en Supabase Storage

### Tablas involucradas
- `liquidaciones` (nueva): id, numero, contrato_id, cliente_id, moto_id, motivo, estado, ahorro_acumulado, total_deudas, costo_danos, saldo_final, detalle_deudas (jsonb), detalle_danos (jsonb), observaciones_taller, nombre_responsable, cargo_responsable, documento_firmado_url, iniciada_por, cerrada_por
- `clientes`: nuevos campos `lista_negra` (boolean), `motivo_lista_negra` (text)

### Archivos
- `motogestion/supabase/007_liquidaciones.sql`
- `motogestion/src/hooks/useLiquidaciones.ts`
- `motogestion/src/utils/generarDocumentoLiquidacion.ts`
- `motogestion/src/pages/LiquidacionesView.tsx`

---

## 13. MÓDULO DE UBICACIONES Y RECEPCIONES DE VEHÍCULOS

### Ubicaciones físicas posibles
| Código | Descripción |
|--------|-------------|
| `con_cliente` | Con el cliente, en uso |
| `bodega` | Guardada en bodega física |
| `oficina` | En las instalaciones de la empresa |
| `taller` | En revisión o reparación |
| `patios_transito` | Retenida por autoridades de tránsito |
| `fiscalia` | Retenida por fiscalía |
| `otro` | Otro lugar (especificar en detalle) |

### Reglas
- La ubicación cambia **manualmente** por admin o usuario con permiso delegado
- Cambio automático solo cuando se activa un contrato → `con_cliente`
- **Cada cambio queda registrado** en `historial_ubicaciones` con: fecha, quién lo hizo, ubicación anterior, nueva, motivo
- Al registrar una moto nueva, se debe especificar su ubicación inicial

### Formulario de recepción de vehículo
Se registra cuando una moto llega a la empresa. Campos:
- Motivo: retención por mora / entrega voluntaria / liquidación / nuevo registro / otro
- Condición general: buena / regular / mala
- Descripción de daños visibles
- Kilómetros actuales
- Ubicación física donde queda almacenada
- Quien recibe (usuario del sistema) + nombre de quien entrega
- Fotos (evidencias)
- Observaciones

### Acuerdos de tiempo rodado
Cuando el cliente deja la moto en la empresa (voluntariamente o por mora) y no paga durante ese período:
- Admin decide: **cobrar ahora** o **rodar al final del contrato**
- El contrato se mide en **pagos, no en tiempo calendario** → los días sin pagar extienden el contrato
- Se genera documento formal con: fechas, valores, motivo, nueva fecha estimada de cierre
- Documento se imprime → cliente firma → funcionario sube scan → queda en historial del cliente

### Tablas
- `historial_ubicaciones` (nueva): moto_id, ubicacion_anterior, ubicacion_nueva, detalle, motivo, registrado_por, created_at
- `recepciones_vehiculo` (nueva): moto_id, contrato_id, cliente_id, motivo, condicion_general, descripcion_danos, kilometros, ubicacion_destino, quien_recibe, nombre_entrega, fotos (jsonb), observaciones
- `acuerdos_tiempo_rodado` (nueva): contrato_id, cliente_id, moto_id, recepcion_id, dias_en_empresa, valor_por_dia, total_a_cobrar, decision, fecha_entrada, fecha_salida, nueva_fecha_fin_contrato, documento_firmado_url, creado_por
- `motos`: nuevos campos `ubicacion_fisica` (text), `detalle_ubicacion` (text)

### Archivos
- `motogestion/supabase/008_ubicaciones_recepciones.sql`
- `motogestion/src/hooks/useUbicaciones.ts`
- MotosView actualizado con panel de ubicación, historial y formulario de recepción

---

## 14. PLAN DE TRABAJO — ESTADO ACTUAL

### Completado ✅
- [x] Autenticación y roles (5 roles, RLS en DB)
- [x] Módulo Clientes (registro, documentos, visitas, aprobación, lista negra)
- [x] Módulo Motos (registro, estado, ubicación física, historial, recepciones)
- [x] Módulo Contratos (semanal/diario, flujo de activación, firmas)
- [x] Módulo Cartera/Cobros (tarifas, deudas, convenios, gestiones, ahorro)
- [x] Módulo Taller
- [x] Dashboard compacto con navegación
- [x] Módulo Usuarios (crear, roles, badges)
- [x] Módulo Liquidaciones (flujo 6 etapas, documento imprimible, lista negra)
- [x] Rastreo de ubicación física de motos
- [x] Formulario de recepción de vehículos
- [x] Acuerdos de tiempo rodado (tabla lista)

### Pendiente 🔲
- [ ] Módulo de Reportes (exportar PDF/Excel por módulo)
- [ ] Módulo de Configuración (ajustes generales + reportes)
- [ ] Permisos delegados (admin puede asignar funciones específicas a usuarios)
- [ ] Auditoría de usuarios (log de movimientos por usuario)
- [ ] PWA (instalar app en celular desde Chrome)
- [ ] APK nativo con Capacitor (después de PWA)
- [ ] Proceso formal de recuperación de motos
- [ ] Integración GPS dispositivo (actualmente manual)
- [ ] Módulo de migración de datos existentes (consolidación inicial)
- [ ] Módulo de transición diario → semanal (cuando cliente completa base inicial)
- [ ] Subida de fotos en formulario de recepción (actualmente guarda URLs)

### Migraciones SQL pendientes de ejecutar en Supabase
Para que el sistema funcione completamente, ejecutar en orden en el SQL Editor de Supabase:
1. `006_cartera_rediseno.sql` — tablas: deudas, convenios, gestiones_cobro
2. `007_liquidaciones.sql` — tabla: liquidaciones; campos lista_negra en clientes
3. `008_ubicaciones_recepciones.sql` — tablas: historial_ubicaciones, recepciones_vehiculo, acuerdos_tiempo_rodado; campos ubicacion_fisica en motos

---

## 15. HISTORIAL DE VERSIONES

| Fecha | Versión | Cambios |
|-------|---------|---------|
| Jun 2026 | v1.0 | Scaffold inicial: Auth, Motos, estructura base |
| Jun 2026 | v1.1 | Módulo Clientes con documentos, visitas y aprobación |
| Jun 2026 | v1.2 | Módulo Contratos con flujo completo |
| Jun 2026 | v1.3 | Módulo Cartera/Cobros con aplicación automática de pagos |
| Jun 2026 | v1.4 | Módulo Taller, Dashboard, seguridad por roles en DB |
| Jun 2026 | v1.5 | Usuarios con 5 roles, navegación por rol, móvil responsive, Dashboard compacto |
| Jun 2026 | v1.6 | Cartera rediseñada: deudas, convenios, gestiones, tarifas diario/semanal |
| Jun 2026 | v1.7 | Módulo Liquidaciones completo con documento imprimible y lista negra |
| Jun 2026 | v1.8 | Rastreo ubicación física de motos, recepciones de vehículos, historial de movimientos |

---

*Documento generado y mantenido como referencia técnica del proyecto MotoGestión.*
*Rama de desarrollo: `claude/clever-turing-daklkq` → producción: `main` → Vercel*
*Actualizar este archivo con cada nuevo módulo o cambio significativo.*
