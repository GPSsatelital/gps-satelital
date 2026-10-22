---
name: reporte-entregas-y-pdf-fix
description: "Sesión 14-jul — reporte de Entregas, bug del PDF en blanco arreglado, mig 055, botón regenerar"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

**Sesión 14-jul-2026 — TODO EN PRODUCCIÓN (main = rama, commits sueltos merged).**

## Bug GRANDE destapado y arreglado: PDFs de contrato/pagaré salían SIEMPRE en blanco
- **Causa raíz doble:** (1) las columnas `contratos.contrato_pdf_url/pagare_pdf_url/certificado_pdf_url` **nunca se crearon en la BD** — el `alter` de la mig 010 no se corrió; Supabase rechaza el update a columna inexistente EN SILENCIO (no lanza, el código no revisa `.error`) → ningún contrato guardaba docs NI firma (el paso 5 del wizard bundlea `certificado_pdf_url + firma_cliente:true` en un update que fallaba completo → `firma_cliente` quedó false en TODOS los del wizard). **Mig `055_contratos_pdf_urls.sql` ✅ corrida** crea las 3 columnas. (2) `htmlAPdfBlob` usaba html2pdf.js, que re-clona el contenido FUERA de pantalla y lo capturaba en blanco (3058 bytes = hoja A4 vacía, idéntico en todos).
- **Fix del generador (`src/utils/pdf.ts`):** ahora captura DIRECTO con `html2canvas` el elemento montado en pantalla y arma el PDF con `jsPDF` (multipágina por franjas A4). **Verificado en preview: PDF pasó de 3 KB en blanco a ~2.4 MB con contenido legible.** (html2canvas y jspdf ya venían en node_modules como deps de html2pdf.js.)
- **Recuperación de PDFs viejos:** los 5 que tenían PDF en storage se recuperaron los links por SQL (cruce con `storage.objects`), pero ESOS archivos estaban en blanco (3058 bytes) → hay que regenerarlos.
- **Botón "🔄 Regenerar documentos en blanco"** (Reportes → Entregas, solo ADMIN/AP): `src/utils/regenerarDocs.ts` — busca entregados con firmas guardadas + PDF <5KB y los regenera con las FIRMAS REALES del Storage (`firmas/{id}/contrato.png`, `contrato_acompanante.png`, `pagare*.png`) + huellas de la ficha (`clientes.autorizacion_datos_huella_url` / `acompanante_huella_url`). **Nadie re-firma.** Los 7 contratos con firmas completas se regeneran; JOSE ANGEL/JONATAN (IGA82I/IGA80I) NO tienen firmas → se suben a mano o re-firman. ⚠️ FALTA que el usuario apriete el botón en producción y confirme.

## Reporte de Entregas (Reportes → pestaña 🛵 Entregas) — para socios
- Lista motos entregadas por rango+grupo, con estado de docs ✓/✗, fotos (miniaturas+lightbox), KPIs, botón imprimir general.
- **"📄 Resumen" por contrato:** `generarHTMLResumenEntrega` (useDocumentos) — 1 página: lo pactado (modalidad, día pago, cuota, tarifa, plazo, base, ahorro, km) + fotos SIN recortar (object-fit:contain, 3 col, el usuario aprobó) SIN links de documentos. Nombre por defecto al guardar PDF = `Rep_entrega (placa)(nombre)` (vía `<title>`).
- Reporte general ahora trae modalidad/cuota/día pago/plazo (antes solo ✓/✗).
- `Moto` type: se tiparon `kilometraje_inicial` y `fotos_entrega` (venían en `*` sin tipar).

## Permiso nuevo
- Acción **`editar_cliente`** en el catálogo (`acciones.ts`) — controlable por usuario. Default: SECRETARIA+ADMIN+AP (SUBADMIN no, se le habilita por persona). Candado en el botón "Actualizar datos / documentos" de ClientesView + respaldo en guardarEdicion. Antes NO tenía control.

## Pendiente inmediato de este hilo
- **Firma opción B (SQL rápido, NO hecho):** marcar `firma_cliente=true` en los ya entregados que tengan fotos de entrega (o certificado), para limpiar los badges "⏳ falta firma" que quedaron falsos por el bug. Decisión del usuario: opción B (los que tienen fotos).
- Probar en navegador: botón regenerar, "📄 Resumen", nombre del archivo.

## UI de Cartera (✅ desplegado 15-jul)
- Pestañas reordenadas: **"🌎 Todos"** (antes Contratos) va PRIMERA y es la default; **"📋 Para hacer hoy"** (antes Hoy) va segunda; luego Confirmar, Historial. Barra de pestañas + chips de filtro envuelven (flexWrap) — sin scroll lateral en móvil.

## Reverso de empalme cerrado por error (patrón, por si repite)
`cerrar_empalme()` (mig 043) consolida `ahorro_apertura`→`ahorro_acumulado` (apertura=0) + `empalme_cerrado=true`, y GUARDA los valores originales en `contratos_auditoria` (campo='empalme_cerrado', valor_anterior='apertura=X + acumulado=Y'). Para reversar: `ahorro_apertura=X`, `ahorro_acumulado = greatest(acumulado_actual − X, 0)` (restar la apertura, NO poner en 0 — así no se pierde ahorro nuevo), `empalme_cerrado=false`, `_por`/`_fecha`=null, con guard `and empalme_cerrado=true`. Caso hecho: LINETH CASTELLAR (XZN22H, apertura $560.000).
