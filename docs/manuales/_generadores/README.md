# Generadores de los manuales (.docx)

Los manuales por rol se generan con scripts de Node usando el paquete `docx`.

## Cómo regenerar
1. Necesitas Node + el paquete `docx` (`npm install docx`).
2. Corre los scripts desde una carpeta donde `require('docx')` resuelva:
   - `gen-secretaria.js` → Manual-SECRETARIA.docx
   - `gen-resto.js` (usa `_manual-lib.js`) → Manual-SUBADMIN / ADMIN / MECANICO.docx
3. Los .docx salen en `docs/manuales/`.

`_manual-lib.js` tiene el formato compartido (portada, índice, estilos, recuadros) para que todos los manuales se vean iguales.
