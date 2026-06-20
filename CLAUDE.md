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
- **Commits:** En español, descriptivos (`git commit -m "Agregar vista de mora con filtro por contrato"`)
- **Nombres:** Todos los nombres de personas → `textTransform: "uppercase"` en CSS
- **TypeScript:** Siempre resolver errores TS antes de hacer push. `npm run build` debe pasar.
- **Responsive:** Mobile-first. `useIsMobile()` = `window.innerWidth < 900`. Bottom tab bar en móvil, sidebar en desktop.

---

## ARQUITECTURA DE NAVEGACIÓN (App.tsx)

```
ViewKey = "dashboard" | "clientes" | "motos" | "contratos" | "cobros"
        | "taller" | "usuarios" | "liquidaciones" | "configuracion"

NavContext = { view: ViewKey; filter: string }
```

**Filtros especiales en MotosView:**
- `"retencion"` → muestra Fiscalía | Tránsito | Garantía
- `"grupo:COSTA"` / `"grupo:PRADERA"` / `"grupo:RASTREADOR"` → filtra por grupo

**Navegación desde Dashboard:** `onNavigate(view: ViewKey, filter?: string)`

**Mobile:** Bottom tab bar (Panel/Clientes/Cartera/Motos/☰Más) + `MasSheet` overlay
**Desktop:** Sidebar `#0f172a`, 240px expandido / 64px colapsado, grupos: OPERACIONES / FLOTA / FINANZAS / ADMINISTRACIÓN

---

## ESTRUCTURA DE ARCHIVOS

```
motogestion/src/
├── App.tsx                    # Shell principal, ViewKey, NavContext, Sidebar, MasSheet
├── contexts/AuthContext.tsx   # Sesión, profile, role, signOut
├── lib/supabase.ts            # Cliente singleton
├── hooks/
│   ├── useMotos.ts
│   ├── useClientes.ts
│   ├── useVisitas.ts
│   ├── useContratos.ts
│   ├── usePagos.ts
│   ├── useTaller.ts
│   └── useLiquidaciones.ts
└── pages/
    ├── Login.tsx
    ├── DashboardView.tsx      # Props: onNavigate(view, filter?)
    ├── ClientesView.tsx       # Props: initialFilter?
    ├── MotosView.tsx          # Props: initialFilter?
    ├── ContratosView.tsx      # Props: initialFilter?
    ├── CobrosView.tsx
    ├── TallerView.tsx
    ├── UsuariosView.tsx       # Solo ADMIN/ADMIN_PRINCIPAL
    ├── LiquidacionesView.tsx  # Solo ADMIN/ADMIN_PRINCIPAL
    └── ConfiguracionView.tsx  # Todos los roles
```

---

## BASE DE DATOS — TABLAS

### `profiles` — usuarios del sistema
`id` (=auth.users) | `nombre` | `role` | `created_at`
Roles: `ADMIN_PRINCIPAL` | `ADMIN` | `SUBADMIN` | `SECRETARIA` | `MECANICO`

### `motos` — flota
`id` | `placa` (UNIQUE) | `marca` | `modelo` | `grupo` (COSTA/PRADERA/RASTREADOR) | `estado` | `condicion_ingreso` (nueva/usada — inmutable) | `numero_motor` | `numero_chasis` | `cilindraje` | `fecha_seguro` | `fecha_tecnomecanica` | `propietario` | `observaciones` | `ubicacion_fisica` | `created_at` / `updated_at`

**Estados de moto:** `Disponible` | `Asignada` | `En taller` | `Garantía` | `Fiscalía` | `Tránsito` | `Recuperada`
> Fiscalía/Tránsito: congela la tarifa diaria. Garantía: no genera deuda al cliente.

### `clientes` — prospectos y clientes
`id` | `nombre` | `cedula` | `telefono` | `whatsapp` | `mismo_whatsapp` | `direccion` | `fuente_llegada` | `acompanante_nombre` | `acompanante_cedula` | `acompanante_telefono` | `documentos_cliente` (jsonb) | `documentos_acompanante` (jsonb) | `estado` | `excepcion_documental` | `excepcion_motivo` | `excepcion_plazo` | `lista_negra` | `motivo_lista_negra` | `created_at` / `updated_at`

**Flujo de estados (en orden):**
`En proceso` → `Listo para visita` → `Pendiente evaluación` → `Aprobado` → `Activo` → `En riesgo` / `En mora` → `Retirado` / `Rechazado` / `Lista negra`

**Documentos (jsonb):** `{ cedula, licencia, recibo1, recibo2, carta, antecedentes, hojaVida }` — cada uno: `{ ok: boolean, file: string }`

### `visitas` — visitas domiciliarias
`id` | `cliente_id` FK | `estado` (Pendiente/Realizada) | `resultado` (Aprobado/Rechazado) | `entrevista` (jsonb) | `fotos` (jsonb) | `ubicacion` ({lat, lng}) | `fecha`

### `contratos` — acuerdos de arriendo
`id` | `cliente_id` FK | `moto_id` FK nullable | `dia_pago` | `valor_semanal` | `meses` | `ahorro_inicial` | `fecha_entrega` | `firma_cliente` | `firma_responsable` | `estado` (En proceso/Activo/Finalizado/Cancelado)

**Modalidades:** `Diario` | `Semanal` | `Quincenal` | `Mensual`
**Flujo obligatorio:** Crear → firmar cliente → asignar moto → activar → moto pasa a "Asignada", cliente pasa a "Activo"

### `pagos` — cobros
`id` | `contrato_id` FK | `valor` | `metodo` (Efectivo/Transferencia) | `estado` (Confirmado/Pendiente/Rechazado) | `aplicado` (jsonb: {deuda, semana, ahorro, convenio, saldo}) | `fecha`

**Efectivo** → Confirmado inmediato. **Transferencia** → Pendiente hasta que ADMIN confirme.

### `taller` — mantenimiento
`id` | `moto_id` FK | `estado_tecnico` (Pendiente/En diagnóstico/En reparación/Listo para salida/Finalizado) | `detalle` | `costo` | `repuestos` | `fecha_ingreso` | `fecha_salida`

### `liquidaciones` — cierre de contratos
6 etapas: Iniciada → En taller → Calculada → Documento generado → Firmada → Cerrada
Número secuencial: `LIQ-0001`. Si `saldo_final < 0` → cliente a lista negra automáticamente.

### Tablas adicionales (migradas)
- `deudas` — tipo: tarifa_atrasada/daño_vehiculo/prestamo_repuesto/fotomulta
- `convenios` — máx 3 por contrato. Si incumple el 3ro → termina contrato
- `gestiones_cobro` — llamada/whatsapp/visita/apagado_moto/recuperacion
- `historial_ubicaciones` — rastro de movimiento físico de motos
- `recepciones_vehiculo` — cuando llega una moto a la empresa
- `acuerdos_tiempo_rodado` — días sin pago con moto en empresa

---

## REGLAS DE NEGOCIO CRÍTICAS

### Tarifas diarias (fijas, innegociables)
| Cliente | Lun–Sáb | Domingo |
|---------|---------|---------|
| Diario antiguo | $26.000 | $13.000 |
| Diario nuevo | $27.000 | $14.000 |
| Semanal | $31.000 | $16.000 |

### Base inicial: $510.000 (obligatoria para pasar a contrato semanal)
- $202.000 = primera semana adelantada
- $308.000 = ahorro inicial

### Orden de aplicación de cada pago
1. Cuota pactada del período (tarifa + ahorro)
2. Deuda pendiente
3. Cuota de convenio activo
4. Saldo a favor (queda reservado, no se aplica automáticamente)

### Mora y gabela
- 1 día de gracia (gabela) después del día de pago pactado
- Mora: cuando vence la gabela sin completar el pago total
- La tarifa sigue corriendo aunque no haya pagado (excepción: Fiscalía)

### Convenios
- Máximo 3 por contrato. No puede haber convenio sobre convenio activo.
- Si incumple el 3er convenio → liquidación obligatoria.
- Solo puede crear: ADMIN, ADMIN_PRINCIPAL y quien tenga función delegada.

### Grupos de motos
- Una moto pertenece a un solo grupo para siempre (inmutable desde registro)
- COSTA / PRADERA / RASTREADOR — portafolios de inversión independientes
- Cuentas, recaudo y estadísticas separadas por grupo

### Roles y lo que SOLO puede hacer ADMIN/ADMIN_PRINCIPAL
- Crear contratos, aprobar/rechazar clientes, aplicar excepciones documentales
- Confirmar transferencias pendientes, crear convenios, registrar préstamos
- Iniciar liquidaciones, cambiar estados sensibles de clientes

---

## PALETA DE COLORES (usar siempre estas)

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

## PATRONES DE CÓDIGO FRECUENTES

### Hook estándar
```ts
const { data, loading, error } = useEntidad();
// Retorna { error: string | null } en escrituras
```

### Layout responsive de dos columnas
```tsx
<div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
  <div style={{ flex: "1 1 340px" }}>Panel izquierdo</div>
  <div style={{ flex: "1 1 280px", minWidth: 0 }}>Panel derecho</div>
</div>
```

### Actualizar perfil de usuario
```ts
await supabase.from("profiles").update({ nombre: nombre.trim().toUpperCase() }).eq("id", profile.id)
```

### Realtime suscripción
```ts
const channel = supabase.channel("nombre").on("postgres_changes", { event: "*", schema: "public", table: "tabla" }, callback).subscribe();
return () => supabase.removeChannel(channel);
```

---

## ERRORES PASADOS — NO REPETIR

| Error | Solución |
|-------|---------|
| CSS Grid con `minmax(320px, 1fr)` causa overflow en móvil | Usar siempre flexbox con `flexWrap: "wrap"` |
| `tipo_contrato` no existe en tabla `contratos` | El campo se llama `forma_pago` |
| `"CLUB"` no es un GrupoMoto válido | Usar `"RASTREADOR" as GrupoMoto` como default |
| `import React` en archivos que no usan JSX directo | Importar solo lo necesario: `import { useState }` |
| Variables declaradas pero no usadas en destructuring | No incluir `ahorroDiario` si no se usa |
| sed embeds JSX como texto plano | Usar la herramienta Edit de Claude, nunca sed en JSX |
| Push a rama de trabajo sin merge a main | SIEMPRE hacer merge a main después de cada push |

---

## ESTADO ACTUAL DEL PROYECTO — v1.9

### Completado ✅
- Autenticación y 5 roles con RLS en DB
- Dashboard con KPIs, alertas y navegación filtrada
- Módulo Clientes (registro, documentos, visitas, aprobación, excepciones)
- Módulo Motos (registro, estados, grupos, retenciones, ubicación física)
- Módulo Contratos (Diario/Semanal/Quincenal/Mensual, flujo completo)
- Módulo Cartera/Cobros (pagos, deudas, convenios, gestiones)
- Módulo Taller
- Módulo Usuarios (crear cuentas, roles, badges)
- Módulo Liquidaciones (6 etapas, documento imprimible, lista negra)
- Módulo Configuración (cuenta, empresa, tarifas, estado del sistema, hoja de ruta)
- Diseño responsive (sidebar desktop + bottom tab bar móvil)
- PWA (instalar desde Chrome/Safari)
- Realtime en todas las tablas

### Pendiente 🔲 (en orden de prioridad)
1. **Cartera avanzada:** confirmar transferencias Nequi, vista de mora con acciones, desglose de pago visible
2. **Convenios y deudas:** UI para crear convenio, registrar deuda, historial por contrato
3. **Reportes:** exportar PDF/Excel por módulo
4. **Proceso diario → semanal:** transición automática cuando cliente completa $510.000
5. **Grupos/Admins:** asignación de motos por Admin, vista filtrada por admin
6. **Traspaso:** alerta 2 meses antes del vencimiento, paz y salvo
7. **Auditoría:** log de acciones por usuario
8. **GPS real:** apagar/prender moto desde sistema
9. **WhatsApp automático:** notificaciones de cobro y mora
10. **APK nativo** con Capacitor

### Migraciones SQL pendientes (ejecutar en Supabase SQL Editor en orden)
```
006_cartera_rediseno.sql    — tablas: deudas, convenios, gestiones_cobro
007_liquidaciones.sql       — tabla: liquidaciones; lista_negra en clientes
008_ubicaciones_recepciones.sql — historial_ubicaciones, recepciones_vehiculo, acuerdos_tiempo_rodado
```

---

## CÓMO TRABAJAR CONMIGO DE FORMA ÓPTIMA

### Por tipo de tarea
| Tipo | Cómo pedirlo |
|------|-------------|
| Feature nueva | Describir QUÉ necesita el usuario final, yo diseño e implemento |
| Bug | Decir síntoma exacto + módulo donde ocurre |
| Cambio visual | Enviar foto/screenshot de referencia o descripción de resultado esperado |
| Definición de negocio | Sesión de preguntas y respuestas → actualizo DOC_MAESTRO.md |
| Una sola tarea grande | Mejor que muchas pequeñas — mantengo contexto completo |

### Lo que nunca tienes que decirme de nuevo
- El stack (ya lo sé)
- Las convenciones de código (ya las aplico)
- La regla de deploy a main (ya la ejecuto automáticamente)
- La paleta de colores (ya la uso)
- El modelo de negocio de la empresa (ya lo entiendo)

### Lo que me ayuda a ser más preciso
- Mostrar capturas de pantalla del estado actual cuando algo no se ve bien
- Decir el nombre del módulo donde está el problema
- Si es un error TS/JS, pegar el mensaje exacto del error
