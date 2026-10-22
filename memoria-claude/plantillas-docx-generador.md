---
name: plantillas-docx-generador
description: "Cómo se generan los formatos imprimibles (.docx/.pdf) del proyecto — carpeta docs/plantillas/, librería docx en un temp fuera del repo, render con Word por COM para verlos. Primer formato: acta de entrega de celular (4-sep-2026)."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-04T21:26:54.085Z
---

# Formatos imprimibles: `docs/plantillas/`

**Primer formato (4-sep-2026):** `ACTA-ENTREGA-TELEFONO.docx` + `.pdf` — acta en blanco para
entregar un celular corporativo a un colaborador: equipo (marca/modelo/serial/valor, IMEI 1 y 2
en casillas de 15 dígitos), SIM (operador/línea/ICCID 20 casillas), cuentas entregadas (correo
@clubmoteros.com, Google, WhatsApp, MotoGestión, GPS), 8 cláusulas (propiedad · uso · cuentas y
bloqueos · custodia · reposición con autorización de descuento · devolución · datos Ley 1581 ·
declaración), firmas de las dos partes + caja de huella, y en la página 3 el registro de
devolución. 3 páginas carta, Arial. **Sin comprometer al abogado: las cláusulas son estándar;
la de descuento de salario debe revisarla él.**

## Cómo se regenera
- Generador: `docs/plantillas/acta-entrega-telefono.js` (docx-js, todo en tablas con anchos DXA
  que suman 9972 = carta − márgenes 1134×2).
- La librería `docx` NO está en el proyecto a propósito (no meterle dependencias a la app): vive
  en `C:\Users\USER\AppData\Local\Temp\docxgen\node_modules`. Correr:
  `NODE_PATH=/c/Users/USER/AppData/Local/Temp/docxgen/node_modules node acta-entrega-telefono.js`
  (si el temp se borró: `npm install docx` ahí de nuevo).
- **Ver el resultado:** no hay LibreOffice en el PC; se exporta a PDF con **Word por COM**
  (`render.ps1` en el mismo temp: `Documents.Open` → `ExportAsFixedFormat(pdf, 17)`) y se
  rasteriza con `pdftoppm -jpeg -r 80` para mirar las páginas. Siempre mirar: la primera versión
  tenía una fila y una nota huérfanas al cambiar de página.
- Casillas de marcar como texto `[    ]` (nada de glifos raros: la regla global prohíbe emoji y
  ballot boxes, y así imprime igual en cualquier impresora).

**Why:** el dueño pidió el formato "rápido" el 4-sep para entregar los celulares con las cuentas
corporativas nuevas (Zoho + Google). Se dejó como documento versionado en `docs/` según CLAUDE.md.
**How to apply:** cualquier formato nuevo (acta de moto, paz y salvo impreso, etc.) sigue el mismo
molde: generador en `docs/plantillas/`, render con Word, mirar las páginas antes de entregar.
