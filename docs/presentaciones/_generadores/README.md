# Generadores de las presentaciones

## Capacitación (lo que se usa hoy)
- `contenido-capacitacion.json` — **el contenido** (día a día por rol + casos). Editable
  sin tocar código: cambia un texto aquí y regenera.
- `gen-capacitacion-v2.js` — arma el deck de capacitación (41 láminas).
- `gen-guias-rol.js` — arma las guías rápidas de 1 página por rol (para imprimir).
- `_visual-lib.js` — componentes visuales (pantalla ilustrada, ejemplo, advertencia, ficha de caso).

Regenerar:
```
cd docs/presentaciones
node _generadores/gen-capacitacion-v2.js 03-Capacitacion-operativa.pptx
node _generadores/gen-guias-rol.js Guias-rapidas-por-rol.pptx
```

Verificar (opcional): `validate.py` del skill pptx + render a PDF con LibreOffice.

## Anteriores
- `gen-presentaciones.js` — decks 01 (socialización) y 02 (plan de trabajo).
- `gen-capacitacion.js` — versión vieja del deck de capacitación (reemplazada por v2).
