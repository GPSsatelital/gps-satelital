---
name: estado-huellero-digitalpersona
description: "Estado de la integración del lector de huellas HID DigitalPersona 4500 — qué quedó construido, decisión de huella opcional, y qué falta probar/conectar"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

Integración del lector de huellas HID DigitalPersona 4500 construida y desplegada el 2 jul 2026 (commit `2967d32`, en `main`). El usuario instaló en el PC de la oficina el driver **Non-WBF** + la app cliente de HID.

Piezas técnicas (detalle completo en CLAUDE.md, sección "Diseño acordado — Proceso de entrega..."):
- `public/websdk/websdk.client.ui.js` — script global de HID en `index.html` (NO viene en npm; se copió del sample `hidglobal/digitalpersona-sample-angularjs`). Nunca importarlo como módulo.
- Alias `WebSdk` → shim vacío en `vite.config.ts` + typings en `src/types/websdk.d.ts`.
- `src/components/LectorHuella.tsx` — `FingerprintReader` con `SampleFormat.PngImage`.
- ClientesView: huella **opcional** al guardar (decisión: fallo del lector no bloquea registro; la firma sí es obligatoria).

**Fix relacionado (3 jul 2026, commit `f3757b5`):** en la misma sección de tratamiento de datos, el usuario reportó que el canvas de firma (`CanvasFirma.tsx`, comparte componente con el huellero en el mismo formulario) se cortaba al escribir — "escribo un poco y no me deja hasta que retiro el dedo". Causa: `useEffect` con `[onChange]` como dependencia se reenganchaba a mitad del trazo porque el padre recreaba `onChange` en cada `setState`. Corregido con listeners enganchados una sola vez + `ref` para el callback. Ver [[regla-jsx-funciones-anidadas]] (mismo patrón de fondo, variante distinta). **No se pudo probar en navegador (sin credenciales de login) — pedir confirmación al usuario.**

**Migración 030 confirmada** por el usuario (4 jul 2026) — columnas `autorizacion_datos_*` ya existen en `clientes`.

**Diagnóstico de segundo PC en curso (4 jul 2026):** el usuario conectó el mismo lector DigitalPersona 4500 en un PC distinto al de la oficina original, con drivers Non-WBF instalados.
- En el primer navegador probado: error inmediato `CommunicationFailed` — el agente de HID no respondía en absoluto.
- Se verificó manualmente que el agente SÍ corre: `https://127.0.0.1:52181/get_connection` devuelve JSON válido con el endpoint dinámico (puerto distinto cada vez, ej. `51398`).
- En un segundo navegador probado: ya no da `CommunicationFailed`, pero se queda colgado en "Conectando..." indefinidamente sin resolver ni fallar.
- Hipótesis más probable: certificado TLS autofirmado del agente DpAgent nunca fue aceptado por el navegador en ese puerto/PC — el WebSocket queda colgado en silencio. Pasos de diagnóstico entregados al usuario: revisar consola F12 en la pantalla de "Nuevo cliente", y visitar manualmente `https://127.0.0.1:52181/get_connection` para aceptar la advertencia de certificado si aparece.
- **Sin resolver al cierre de esta sesión** — pendiente que el usuario reporte qué ve en la consola del navegador.

**Robustez completa (11 jul 2026) — ✅ FUNCIONANDO, confirmado por el usuario con caso real (huella del acompañante en edición):**
- `LectorHuella.tsx` tiene **cola global de órdenes al agente HID** (`enColaAgente`): serializa stop/start entre instancias — el stop del lector que se cierra ya no puede llegar después del start del que se abre (al cambiar Cliente↔Acompañante quedaba "verde pero mudo").
- Botón "🔄 Reintentar lectura" recrea la conexión completa sin recargar la página (useEffect re-ejecutable con contador `reintentos`).
- **Escalera de diagnóstico si vuelve a quedar mudo** (en orden): ① cerrar TODAS las demás pestañas/PWA de la app (otra pestaña con formulario abierto es dueña del lector y se roba las huellas); ② verificar que cargó la versión nueva (debe verse el botón Reintentar); ③ desconectar/reconectar el USB + Reintentar; reiniciar el agente HID o el PC (adquisición "fantasma" retenida); ④ si es un PC nuevo: instalar driver Non-WBF + app cliente HID (sin eso Windows retiene el lector: parpadea al tocar pero no entrega nada al navegador).

**Pendiente al iniciar la próxima sesión:**
1. Diagnóstico del certificado TLS en el segundo PC (ver arriba) — quedó sin cerrar; aplica también la escalera nueva.
2. Reutilizar `LectorHuella` en WizardContrato pasos 3-4 ya está hecho (huellas del registro se reúsan; `faltaHuella()` las exige). El Certificado (paso 5) sigue en papel.
3. Android/Capacitor para huella móvil: diferido a propósito, no empezar sin instrucción explícita. Ver [[decisiones-hardware-oficina]].
