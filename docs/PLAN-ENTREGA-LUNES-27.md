# Plan de entrega — Go-live lunes 27-jul-2026

**Objetivo:** el lunes 27 el sistema soporta TODA la operación (COSTA + PRADERA + RASTREADOR + USADAS) sin que ningún proceso a medias frene el negocio. Atención al cliente parada sábado y domingo para cerrar y verificar.

**Regla del cierre:** no buscamos perfección, buscamos que sea **seguro y operable**. Todo lo que no sea bloqueante va a *backlog gestionado* (lista controlada), no queda suelto.

**Alcance confirmado (22-jul):** los 4 grupos operan el lunes. **COSTA entra con SIEMBRA MÍNIMA + empalme abierto** (no migración grande) — las cifras se completan progresivamente operando, con el cliente presente en el primer cobro. Esto de-riesga el go-live: COSTA deja de ser bloqueante duro.

> **Decisión de arquitectura (COSTA):** no se hace una migración completa desde Excel. Se siembra lo mínimo para que la moto/cliente/contrato existan (placa, nombre, cédula, forma de pago, día de pago), con `empalme abierto`. El ahorro de apertura y la deuda se cargan en el Panel de Empalme durante el primer contacto — que es justo para lo que se construyó el empalme. Los datos técnicos de moto se completan cuando estén. El SQL se genera **cuando el usuario avise** que tiene los datos mínimos.

---

## 1. Camino crítico (lo que puede impedir operar el lunes)

| # | Bloqueante | Estado | Dueño | Límite |
|---|-----------|--------|-------|--------|
| B1 | **Siembra mínima de COSTA** (SQL corto: cliente+moto+contrato con empalme abierto) | 🟢 Bajo riesgo — cuando el usuario dé el ok con los datos mínimos | Usuario avisa → Claude genera SQL | Sáb 25 |
| B2 | **Verificar estado real de la BD** (todas las migraciones + Edge Function `manage-users` corridas en Supabase) | 🟡 Confirmar | Usuario verifica en Supabase | Jue 23 |
| B3 | **Prueba en navegador con login real** de los flujos de dinero (cobro oficina/campo/transferencia → confirmar → caja diaria por grupo) | 🟡 Sin probar integral | Claude + Usuario (credenciales) | Vie 24 |
| B4 | **Permisos por rol probados en la práctica** (cada login ve/hace solo lo suyo) | 🟡 Sin probar por rol | Usuario prueba con cada usuario | Sáb 25 |
| B5 | **Flujos operativos marcados "sin probar"** (recolección, liquidación, préstamo de reemplazo, empalme, convenio-para-recuperar) | 🟡 Sin probar | Claude + Usuario | Sáb 25 |
| B6 | **Hardware** (impresora GA-E2001 recibo real + lector de huella) | 🟡 Sin probar físico | Usuario en oficina | Dom 26 |

> Lo que NO es bloqueante (va a backlog): GPS real (sirena/apagado remoto), WhatsApp automático, reportes PDF/Excel exportables, APK Capacitor, portal del socio, y toda feature nueva.

---

## 2. Cronograma día a día

### Miércoles 22 – Jueves 23 — Cerrar y confirmar
- [ ] **Usuario:** enviar Excel de COSTA (ver §4 para el formato exacto de datos).
- [ ] **Usuario:** confirmar en Supabase que están corridas TODAS las migraciones (ver §3) y desplegada la Edge Function `manage-users`.
- [ ] **Claude:** cerrar bloqueantes de código que salgan de la auditoría (solo lo que impide operar).
- [ ] **Claude:** con el Excel, generar el SQL de COSTA (formato empalme: nace con `ahorro_apertura` + deudas de apertura + empalme abierto).

### Viernes 24 — Probar el dinero
- [ ] **Claude + Usuario:** prueba con login real del ciclo de dinero completo por cada rol.
- [ ] **Usuario:** correr el SQL de COSTA en Supabase (una sola ejecución, bloque completo). Verificar conteos.
- [ ] **Claude:** manuales por rol (borrador, `.docx`).

### Sábado 25 — Congelar (atención parada)
- [ ] **Usuario:** avisar a clientes que sábado/domingo no hay atención.
- [ ] **Usuario:** verificación integral con datos reales de COSTA migrado (cifras cuadran contra el arqueo).
- [ ] **Claude + Usuario:** probar B5 (recolección, liquidación, préstamo, empalme, convenio).
- [ ] **Claude:** manuales finales.

### Domingo 26 — Ensayo general
- [ ] **Usuario:** probar hardware (impresora + huella) en la oficina.
- [ ] **Claude + Usuario:** prueba punta a punta (un cliente completo: registro → contrato → cobro → recibo).
- [ ] **Claude:** presentaciones (`.pptx`): socialización con empleados + plan de trabajo.
- [ ] **Usuario:** ensayo con 1-2 funcionarios (que hagan un cobro real de prueba).
- [ ] **Claude:** plan de contingencia listo (ver §5).

### Lunes 27 — GO LIVE
- [ ] Operar normal. Soporte en caliente todo el día. Registrar cualquier problema en el backlog (no frenar la operación por algo menor).

---

## 3. Migraciones a confirmar en Supabase (B2)

El usuario debe confirmar que TODAS estas están aplicadas (SQL Editor → correr un `select` de prueba sobre cada columna/función nueva). Según el historial deberían estarlo, pero hay que **verificar**, no asumir:

- Base v2.0: `001`–`012`
- `013`–`029` (pagos, permisos, buckets, subadmin, visitas, GPS, multa, RLS hardening `026`, auditoría contratos, fecha fin, delete policy)
- `030` autorización datos · `031` días pago mes · `032` trigger ahorro+convenio
- `033`–`038` (correcciones de pagos, ahorro exacto, RLS recolección, checks, reconciliación, guard)
- `039`–`043` (mensajes WhatsApp, deuda/migrado, caja por grupo, visita→cliente, empalme)
- `045` **motor de cajas** (RPC + trigger v2) — CRÍTICO, es el corazón del dinero
- `048`–`057` (permisos por persona, políticas AP, convenios candado, motivo suspensión, préstamos, alquiler, PDF, LUMAR, auditoría permisos)
- **Edge Function `manage-users`** desplegada con el código actual.

**Acción:** si alguna NO está, se corre antes del viernes.

---

## 4. Datos MÍNIMOS para sembrar COSTA (B1)

COSTA no se migra completo: se siembra lo mínimo para que exista en el sistema y se completa operando. Por cada cliente, lo **imprescindible**:

| Campo | ¿Obligatorio para sembrar? |
|-------|---------------------------|
| placa | **Sí** (identifica la moto) |
| nombre + cédula | **Sí** (identifica al cliente) |
| teléfono/whatsapp | Sí (para cobro/WhatsApp) |
| grupo = COSTA | **Sí** |
| forma_pago + día(s) de pago | **Sí** (define la cartera y la mora) |
| tarifa | **Sí** (define la cuota) |
| fecha_entrega | Sí (ancla del contrato) |
| meses | Sí (plazo) |
| **ahorro de apertura** | **No al sembrar** — se completa en el Panel de Empalme, con el cliente |
| **deuda de apertura** | **No al sembrar** — se completa en el Panel de Empalme, con el cliente |
| datos técnicos moto (marca/motor/chasis/SOAT/tecno) | No — se completan después por MotosView |

**Cómo funciona:** el SQL crea cliente + moto + contrato con `empalme abierto` y ahorro/deuda en cero. La primera vez que el cliente viene a pagar, el funcionario abre el Panel de Empalme, verifica las cifras CON el cliente, las carga, y cierra el empalme. Cero riesgo de migrar una cifra mal — se acuerda cara a cara.

> El SQL se genera **cuando el usuario avise** que tiene la lista mínima. Puede ser en tandas (no hace falta todo junto).

---

## 5. Plan de contingencia (si algo falla el lunes)

- **Un flujo puntual falla** → registrarlo, seguir operando ese caso a mano (papel) y avisar a Claude para fix en caliente. NO frenar toda la operación por un caso.
- **Cifra migrada mal** → el Modal Editar Contrato (ADMIN/AP) corrige cualquier dato con auditoría. El empalme abierto permite ajustar apertura hasta cerrarlo.
- **Deploy roto** → `Ctrl+Shift+R` para chunk viejo; si es grave, Vercel permite rollback al deploy anterior en 1 clic.
- **Alguien no puede entrar / no ve su módulo** → ADMIN_PRINCIPAL ajusta permisos por persona en Usuarios en el momento.
- **Impresora/huella fallan** → ambos son opcionales para operar (el recibo se puede reenviar por WhatsApp; la huella no bloquea el registro). No son bloqueantes de la operación.

---

## 6. Entregables (documentos de esta entrega)

| # | Entregable | Archivo | Herramienta | Estado |
|---|-----------|---------|-------------|--------|
| 1 | Auditoría de procesos + gaps | este documento + `PROCESOS.md` | md | 🔨 en curso |
| 2 | Plan de migración / cierre | §2 y §4 de este doc | md | ✅ v1 |
| 3 | Plan de trabajo + delegación (RACI) | `DELEGACION-RACI.md` | md | 🔲 |
| 4 | Registro de riesgos | §5 + `RIESGOS.md` | md | 🔨 |
| 5 | Manuales por rol | `docs/manuales/*.docx` | docx | 🔲 |
| 6 | Presentaciones | `docs/presentaciones/*.pptx` | pptx | 🔲 |
