---
name: sesion-10jul-pagos-syncthing-empalme
description: "Sesión 10 jul — 4 puntos de pago con confirmación+duplicado, auto-update PWA, plan Syncthing 2 PC, empalme en definición"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

Sesión 10 jul 2026. Todo lo de código desplegado a main/producción.

**Hecho:**
- **Auto-update multi-dispositivo** ✅: `AvisoActualizacion.tsx` (chequeo cada 60s+focus del bundle del index.html → aviso "🔄 versión nueva" con botón; opción A: no recarga solo) + `vite:preloadError` en main.tsx recarga 1 vez (guard anti-bucle). Sin service worker.
- **Confirmación + aviso duplicado en los 4 puntos de pago** ✅: `ModalConfirmarPago.tsx` reutilizable (monto, método efectivo/transferencia con colores, aviso amarillo si mismo monto+contrato+día, advierte no bloquea). Puntos: detalle contrato (solo efectivo), "💰 Pagar" (ambos métodos), Cobro Diario, y **cobro en campo** (`handleCampoSubmit`, 4º flujo que el usuario detectó preguntando "¿en cobrar en campo también quedó?"). Pago duplicado real ya borrado por el usuario.

**Plan EMPALME (migrar clientes/motos restantes, ej. COSTA) — EN DEFINICIÓN, retomar preguntas una por una:**
Decidido: SQL en bloque · corte por grupo (corteMigracionGrupo) · ahorro viejo separado (`ahorro_apertura` editable) del nuevo (`ahorro_acumulado`) mientras el empalme está abierto, display suma ambos · al cerrar: se consolidan (apertura→acumulado, rastro en contratos_auditoria) y el indicador desaparece · deudas de apertura editables hasta cerrar, luego bloqueadas.
FALTA: checklist para poder cerrar el empalme, quién cierra, dónde vive la pantalla/indicador.

**Plan SYNCTHING (2 PC mismo entorno) — diseñado, el usuario lo monta a mano:**
Sincronizar SOLO `C:\Users\USER\.claude`; código por git. Mismo usuario Windows USER y misma ruta en ambos. `.stignore`: shell-snapshots, todos, statsig, downloads, cache, *.log, *.lock, *.tmp, projects/**/*.jsonl (memory/ SÍ viaja). File Versioning Staggered. REGLA DE ORO: nunca los 2 PC con Claude abierto a la vez (SQLite de claude-mem/mempalace se corrompe); cerrar→verde→abrir. Instalar por PC: Node, git, Claude CLI, npm install, drivers HID/GA-E2001.

**Siguen pendientes de antes:** robustez lector huella + huella opcional en wizard ([[sesion-9jul-bugs-operativos]]); unificar Recepción/Retención (plan aprobado); fotos de daños libres en ModalRecoleccion; doc tratamiento datos acompañante (parqueado).
