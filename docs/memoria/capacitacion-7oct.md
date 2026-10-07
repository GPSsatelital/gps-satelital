---
name: capacitacion-7oct
description: "Capacitación del equipo del 7-oct-2026 (7 a 8 a.m.): 5 presentaciones por tema + guion + 4 videos MP4 con voz, todo desde docs/capacitacion/contenido.js. Cómo se regenera y qué no se sube."
metadata:
  node_type: memory
  type: project
  originSessionId: ecbda5fc-4619-4e95-b4dc-d59ba138caf2
  modified: 2026-10-07T06:02:10.918Z
---

Pedido del dueño la noche del 6-oct: diapositivas "entendibles, dinámicas y atractivas que hasta un niño
que apenas sepa leer lo entienda", su guion ("lo que tengo que decir y cómo presentar"), y videos tutoriales
con voz e imágenes para lo difícil. Temas: (1) el día del administrador, (2) liquidaciones para la
secretaria, (3) taller/garantía/préstamo/rodar, (4) el módulo nuevo de rodar por deuda, (5) ceder un
contrato (lo agregó después). Después pidió: *"dámelas separadas por temas"*.

**Dónde:** `docs/capacitacion/` — `tema-1…5-*.html` (una por tema), `presentacion.html` (las 55),
`guion*.html` + `GUION-CAPACITACION.pdf`, `videos/*.mp4`. Todo sale de **`contenido.js`** (mismo texto en
diapositivas, guion y voz). README de la carpeta = cómo regenerar.

**Cómo se hizo (reusable):**
- Fotos reales con `motogestion/scripts/manual/capturas-capacitacion.mjs` (misma máquina que el manual de
  Reportes; solo abre pantallas; pestañas con contador se tocan con `clicPestana`, nunca un botón de acción).
- Voz: Windows trae **"Microsoft Laura"** (OneCore, español de España) por WinRT desde PowerShell (`voz.ps1`);
  la voz vieja de System.Speech es Helena. No hay voz colombiana instalada.
- Videos MP4 sin ffmpeg: `grabar-video.html` dibuja en un canvas y graba con MediaRecorder
  (`video/mp4;codecs=avc1…` sí lo soporta este Chrome 152) en Chrome sin ventana con
  `--autoplay-policy=no-user-gesture-required`. Salen MP4 fragmentados: se reproducen de corrido pero no
  dejan saltar a un segundo exacto (para revisar cuadros hay que reproducir, no buscar).
- Revisión: fotos de cada diapositiva con `chrome --headless --screenshot` a 1600x900, y un barrido JS que
  mide si algo se sale del cuadro (salió 1 de 55).

**No se suben** (datos de clientes): `img/`, `audio/`, `videos/`, `*.pdf`. Ver [[rodar-por-deuda-d044]] ·
[[manual-operacion-pdf]] · [[capacitacion-material-v2]].
