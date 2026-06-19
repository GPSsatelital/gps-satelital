# DOC MAESTRO — MotoGestión SaaS
**GPS Satelital Cartagena**
**Última actualización:** 18 de junio de 2026
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
| `ADMIN_PRINCIPAL` | Dueño / Director. Acceso total. | Todos + Usuarios |
| `ADMIN` | Administrador operativo. Aprueba, crea contratos, confirma pagos. | Todos + Usuarios |
| `SUBADMIN` | Supervisión parcial. Sin acceso a Usuarios. | Dashboard, Clientes, Motos, Contratos, Cartera, Taller |
| `SECRETARIA` | Registro de clientes, pagos, visitas. | Dashboard, Clientes, Motos, Contratos, Cartera, Taller |
| `MECANICO` | Solo gestión de taller. | Dashboard, Taller |

### Restricciones importantes
- Solo `ADMIN` y `ADMIN_PRINCIPAL` pueden crear contratos.
- Solo `ADMIN` y `ADMIN_PRINCIPAL` pueden aprobar/rechazar clientes.
- Solo `ADMIN` y `ADMIN_PRINCIPAL` pueden aplicar excepciones documentales.
- Solo `ADMIN` y `ADMIN_PRINCIPAL` ven el módulo de Usuarios.
- `MECANICO` solo ve Dashboard y Taller.
- Los usuarios **no pueden registrarse solos** — un ADMIN los crea desde el módulo de Usuarios.

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
| `estado` | text | Disponible / Reservada / Asignada / Mantenimiento / Recuperada |
| `observaciones` | text | |
| `created_at` / `updated_at` | timestamptz | Auto |

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

**Opciones de forma de pago:** Semanal / Diario

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

## 9. ESTADO ACTUAL DEL PROYECTO

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

### 🔄 Pendiente / Plan de trabajo

#### PRIORIDAD ALTA
- [ ] **Reportes y exportación** — PDF o Excel de cartera, contratos activos, mora
- [ ] **Notificaciones** — alertas de vencimiento (SOAT, tecno, plazo de docs)
- [ ] **Historial de pagos por cliente** — vista consolidada del estado financiero de cada contrato
- [ ] **Módulo GPS** — integración con dispositivos GPS satelital instalados en motos

#### PRIORIDAD MEDIA
- [ ] **Subadmin por grupos** — cada SUBADMIN gestiona solo su grupo de motos (CLUB / PRADERA / COSTA)
- [ ] **Foto de documentos en Supabase Storage** — actualmente solo se guarda el nombre del archivo
- [ ] **Foto de visita en Supabase Storage** — idem
- [ ] **Recuperación de motos** — módulo para registrar proceso de recuperación (estado "Recuperada")
- [ ] **Liquidación de contratos** — proceso formal de cierre y devolución de ahorro
- [ ] **Historial de cambios de estado** — audit log de quién cambió qué y cuándo

#### PRIORIDAD BAJA
- [ ] **Dashboard avanzado** — gráficas de recaudo, mora por semana, motos por estado
- [ ] **Módulo de nómina** — pago a empleados vinculados a la operación
- [ ] **App móvil nativa** — versión PWA o React Native
- [ ] **Multi-empresa** — soporte para varias sedes o empresas desde la misma plataforma

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

## 12. HISTORIAL DE VERSIONES

| Fecha | Versión | Cambios |
|-------|---------|---------|
| Jun 2026 | v1.0 | Scaffold inicial: Auth, Motos, estructura base |
| Jun 2026 | v1.1 | Módulo Clientes con documentos, visitas y aprobación |
| Jun 2026 | v1.2 | Módulo Contratos con flujo completo |
| Jun 2026 | v1.3 | Módulo Cartera/Cobros con aplicación automática de pagos |
| Jun 2026 | v1.4 | Módulo Taller, Dashboard, seguridad por roles en DB |
| Jun 2026 | v1.5 | Usuarios con 5 roles, navegación por rol, móvil responsive, Dashboard compacto, búsqueda en cartera, Forma de pago Semanal/Diario en contratos |

---

*Documento generado y mantenido como referencia técnica del proyecto MotoGestión.*
*Actualizar este archivo con cada nuevo módulo o cambio significativo.*
