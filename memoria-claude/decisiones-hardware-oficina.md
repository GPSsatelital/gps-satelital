---
name: decisiones-hardware-oficina
description: "Hardware comprado (impresora POS E2001, huellero DigitalPersona 4500, lápiz digital) y decisiones de arquitectura acordadas"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

Hardware que el usuario compró para la oficina (jul 2026):
- **Impresora térmica POS "E2001"** (modelo exacto sin confirmar; parece "Digital POS DIG-E200I"). Pendiente: probar `window.print()` del recibo de Cartera con papel térmico real y ajustar ancho (58/80mm). Probablemente no requiere código nuevo.
- **Lector de huellas HID DigitalPersona 4500** — ya conectado y con driver Non-WBF + app cliente instalados. Ver [[estado-huellero-digitalpersona]].
- **Lápiz digital (stylus)** — ya funciona sin cambios con `CanvasFirma`.

Decisiones de arquitectura acordadas con el usuario:
- Huella en **Android/móvil**: solo posible con app nativa (Capacitor + plugin Java/Kotlin, USB-OTG). WebAuthn NO sirve (nunca expone la imagen de la huella). **Diferido a propósito** — primero dejar completo y probado el flujo de PC.
- Si algún día se empaqueta con Capacitor: modo "remote URL" (WebView apuntando a Vercel en vivo), no bundle local — así los cambios de React/TS se reflejan sin reinstalar el APK.
- Flujo de uso del huellero: (1) tratamiento de datos al registrar cliente nuevo (PC oficina, secretaria) y (2) firma de Contrato + Pagaré en el wizard; el Certificado sigue siendo físico en papel.
