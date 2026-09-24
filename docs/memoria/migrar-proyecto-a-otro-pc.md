---
name: migrar-proyecto-a-otro-pc
description: "Trabajar en dos PC con el disco PY_ofc (D:). Un solo script multi-proyecto (sincronizar.ps1 traer/llevar) y dos .bat de doble clic en el disco. Syncthing se probó y FALLÓ. Reglas: Claude cerrado, usuario Windows USER, nunca Claude en dos PC a la vez."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-15T17:38:14.484Z
---

# Trabajar en dos PC con un disco (15-sep-2026)

**El disco:** `PY_ofc` = **D:**, 930 GB libres. Este PC se llama `DESKTOP-TVN22VH`.

Pedido del dueño: *"que todo lo que haga en un PC, cuando lo pase, el otro sepa exactamente lo que
se hizo y que haga como si fuera el mismo proyecto o PC"*.

## 🔴 Syncthing YA SE PROBÓ Y FALLÓ — no volver a recomendarlo

Palabras suyas: *"syncthing no me guardaba las memorias y perdía coherencia cuando pasaba de un pc
al otro"*. **Causa de fondo, no de configuración:** copia archivos MIENTRAS se escriben, y
`mempalace`/`claude-mem` son bases de datos que Claude tiene abiertas todo el tiempo. El disco SÍ
funciona porque la copia se hace con Claude **cerrado**.

## Lo construido

**En el repo** (`scripts/migracion/`, commits `4a1bbec` y `fec6a8c`): `sincronizar.ps1` — un solo
archivo, dos verbos (`traer` / `llevar`), **multi-proyecto**. Reemplazó a `empaquetar.ps1` y
`restaurar.ps1`, que quedaron borrados.

**En el disco** (`D:\TRABAJO-EN-DOS-PC\`): `1-TRAER.bat` · `2-LLEVAR.bat` (doble clic, sin escribir
nada; usan `%~d0`, así que sirven aunque en el otro PC el disco tenga otra letra) · `proyectos.txt`
· `LEEME-PRIMERO.txt` explicado paso a paso · `scripts\`.

**La lista de proyectos** (`proyectos.txt`, una línea `nombre | ruta`): un proyecto que no esté en
ese PC **se salta solo**. Por eso el segundo proyecto —que vive en el OTRO PC— se suma agregando su
línea allá, sin tocar nada acá.

**La carpeta de memorias se deduce de la ruta**: se cambian `:` y la barra invertida por `-`.

## Las tres guardas

1. 🔴 **Claude cerrado** — si está abierto, para. Es lo que evita el problema de Syncthing.
2. 🔴 **Usuario de Windows `USER`** en los dos PC — las memorias llevan la ruta en el nombre de la
   carpeta. El dueño confirmó que usará `USER`.
3. 🔴 **El candado** — `ESTADO.json` en el disco (qué PC lo dejó y cuándo) + marca local por PC. Si
   se intenta LLEVAR sin haber TRAÍDO el trabajo del otro PC, para y avisa.

## Detalles que costaron una prueba cada uno

- Los `.ps1` y el `LEEME-PRIMERO.txt` van con **BOM** (`utf-8-sig`): PowerShell 5.1 y el Bloc de
  notas leen como ANSI sin él y parten los acentos.
- Los mensajes de consola van **sin tildes** (la consola de Windows los rompe).
- 🔴 `/MIR` borra en el destino lo que no viene en el origen. Todo lo de `.claude` se copia con
  `/E` (agrega, nunca borra); solo `memory` va con `/MIR`. Sin eso, traer un disco armado a medias
  habría borrado las conversaciones del otro PC.

## Probado el 15-sep

Copia real al disco: **695 MB · 110 memorias · 3 conversaciones**, con `.git`, `.env`, los datos de
migración y el manual; verificado que **no** se cuelan `node_modules` ni los
`PEGAR-EN-SUPABASE-*.sql`. Candado probado en sus 3 casos.
🔲 **Falta el ciclo completo real** — no se puede probar desde dentro de Claude (el script exige
que esté cerrado).

## El otro proyecto

Vive en el OTRO PC. Acá solo quedan sus memorias huérfanas:
`C--Users-USER-asistente-autonomo` (20 memorias) y `C--Users-USER-Proyecto-Asistete-autonomo`
(2 memorias); la carpeta `C:\Users\USER\Proyecto Asistete autonomo` existe pero está **vacía**.
Cuando el dueño esté allá: agregar su línea a `proyectos.txt`.

## ✅ Cerrado (15-sep): los dos PEGAR-EN-SUPABASE ya se borraron

## ⚠️ Corrección: NO llevaban contraseñas (lo dije mal varias veces)

Yo dije varias veces que `PEGAR-EN-SUPABASE-147.sql` y `148` "llevan contraseñas". **Era falso** y
lo repetí sin verificarlo. Al decodificar los tokens: el 148 no tiene ninguna llave (el "SECRET"
que yo contaba era la palabra **SECRETARIA**), y el 147 solo trae la llave **anon**, que es pública
por diseño — viaja en el bundle del navegador de todos los clientes y está también en
`supabase/147_despertador_avisos.sql`, que sí está en GitHub. **No hay `service_role` en ningún
archivo del repo.** Los dos archivos son solo copias de trabajo de migraciones ya corridas: borrarlos
es orden, no seguridad.

Relacionado: [[herramientas-por-pc-paridad]] · [[syncthing-setup-2pc]] (el intento que falló).
