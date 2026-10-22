---
name: entrega-golive-lunes27
description: "Plan de entrega/go-live del sistema — lunes 27-jul-2026, todos los grupos operando. Docs, bloqueantes, estrategia COSTA y reglas nuevas."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-07-25T00:44:42.565Z
---

**Entrega prometida: lunes 27-jul-2026.** Objetivo: el sistema soporta TODA la operación (COSTA+PRADERA+RASTREADOR+USADAS) sin que procesos a medias frenen el negocio. Atención parada sáb 25 + dom 26 para cerrar/verificar.

## Documentos de entrega (en el repo, `docs/`)
- `docs/PLAN-ENTREGA-LUNES-27.md` — cronograma día a día, bloqueantes (B1-B6), contingencia, migraciones a confirmar, entregables.
- `docs/PROCESOS.md` — catálogo de los 16 procesos con flujo/variaciones/casos borde/estado go-live. Base de los manuales y de los bloqueantes.

## Reglas nuevas agregadas a CLAUDE.md esta sesión
- **REGLA DE ROL:** Claude actúa SIEMPRE como arquitecto/consultor experto — lidera el plan, anticipa riesgos, recomienda con postura (no menú neutro). No cambia la REGLA DE AUTORIZACIÓN.
- **REGLA DE SKILLS Y HERRAMIENTAS:** para cualquier tarea, evaluar/declarar primero qué skill/herramienta se adapta mejor (diseño→skills diseño, librerías→Context7, complejo→sequential-thinking, grande→Taskmaster/Superpowers, "¿dónde está X?"→codebase-memory, manuales→docx, presentaciones→pptx).

## Estrategia COSTA (decisión de arquitectura, de-riesga el go-live)
NO migración grande. **Siembra mínima** (cliente+moto+contrato con `empalme abierto`, ahorro/deuda en cero) → las cifras se completan progresivamente en el Panel de Empalme, con el cliente presente en el primer cobro. El SQL se genera CUANDO el usuario avise que tiene los datos mínimos (puede ser en tandas). El mecanismo de empalme (mig 043) está hecho justo para esto.

## Lectura de arquitecto: el riesgo #1 son las PERSONAS, no los datos
El código está maduro; con COSTA por empalme, el dato deja de ser el riesgo. El riesgo real es que los funcionarios no sepan operar → prioridad = manuales + ensayo antes del lunes.

## Bloqueantes reales (camino crítico)
- **B2** confirmar en Supabase TODAS las migraciones + Edge Function `manage-users` (sobre todo mig 045 motor de cajas). — Usuario.
- **B3** probar con login real el ciclo de dinero (cobro→confirmar→caja). — Claude+Usuario.
- **B4** permisos por rol probados con cada login. — Usuario.
- **B5** probar flujos construidos-sin-probar: recolección, liquidación, préstamo reemplazo, entrega-devolución, convenio-para-recuperar. — Claude+Usuario.
- **B6** hardware: impresora GA-E2001 + lector huella + PDF contrato. — Usuario oficina.
- COSTA = 🟢 bajo riesgo (siembra mínima cuando haya datos).

## Entregables — TODOS PRODUCIDOS ✅ (en el repo, `docs/`)
1. ✅ `PROCESOS.md` (16 procesos) · ✅ `PLAN-ENTREGA-LUNES-27.md` (cronograma+bloqueantes+contingencia).
2. ✅ `DELEGACION-RACI.md` (quién hace qué + escalamiento).
3. ✅ `RIESGOS.md` (personas/datos/técnicos/operativos + mitigación + plan B).
4. ✅ `docs/manuales/*.docx` (4 manuales: SECRETARIA, SUBADMIN, ADMIN, MECÁNICO) — generados con skill docx, generadores versionados en `docs/manuales/_generadores/`.
5. ✅ `docs/presentaciones/*.pptx` (01 socialización empleados + 02 plan de trabajo) — skill pptx, validadas OK, paleta identidad.

**Nota:** los .docx/.pptx no se pudieron renderizar a imagen en este PC (no hay LibreOffice/pandoc en Windows) — el usuario confirma el visual abriéndolos en Word/PowerPoint. Contenido completo y correcto; docx-js/pptxgenjs validados.

## Nuevos entregables (24-jul, sesión actual) — EN EL REPO + GitHub
- **`docs/presentaciones/03-Capacitacion-operativa.pptx`** (commit `53dea4d`) — deck de capacitación que enseña **cómo se hace cada proceso en la app** (era el gap principal): 17 slides (bienvenida, lo básico, roles, 7 procesos paso a paso, 5 reglas de oro, plan B, guion del ensayo, cierre). Generador en `docs/presentaciones/_generadores/gen-capacitacion.js` (pptxgenjs). ✅ **QA visual COMPLETA** (17 slides renderizados y revisados: sin overflow/overlap, marca consistente, acentos/emojis OK) + `validate.py` PASSED + markitdown OK. **Se instalaron en este PC (24-jul): Python 3.12 (`%LOCALAPPDATA%\Programs\Python\Python312\python.exe`) + LibreOffice (`C:\Program Files\LibreOffice\program\soffice.exe`) + pip: pymupdf/markitdown[pptx]/pillow/defusedxml/lxml.** → RESUELTA la limitación histórica de "no se puede render-QA .pptx/.docx en este PC". Flujo QA: `soffice --headless --convert-to pdf` → PyMuPDF renderiza a PNG (evita poppler) → Read las imágenes. OJO Windows: correr los scripts del skill con `python -X utf8` (validate.py falla con cp1252 sin eso).
- **`docs/MIGRACION-COSTA-plantilla.md`** (commit `6ce58d4`) — siembra COSTA lista para disparar: checklist de datos mínimos por cliente + plantilla SQL (motor v2 + empalme abierto + `ubicacion_moto_validada=true` en migrados). **Faltan 2 inputs del usuario:** (1) fecha de corte de COSTA (su día de pago vigente) → para agregar COSTA a `CORTE_POR_GRUPO` + mig 047; (2) el Excel/listado → para generar el SQL real.
- **Gaps de capacitación aún abiertos** (no bloqueantes): guía rápida de 1 página por rol (cheat sheet imprimible), manual del SOCIO (los otros 4 roles ya tienen .docx).

## LO QUE FALTA = la verificación real (no más documentos, sino PROBAR)
El paquete de entrega está completo. Lo que queda para el lunes es ejecutar la verificación B2-B6 + siembra COSTA, que depende del usuario (credenciales, Supabase, datos). Esa es la tarea #49 "Cerrar BLOQUEANTES".

## Backlog (NO bloqueante, no frena la operación)
GPS real (sirena/apagado), WhatsApp automático, reportes PDF/Excel exportables, APK Capacitor, portal del socio, tabla referidos si no existe.
