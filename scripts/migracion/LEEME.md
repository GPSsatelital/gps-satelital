# Trabajar en dos PC sin perder nada

El dueño trabaja el proyecto en dos PC y lo pasa con un disco (`PY_ofc`, 930 GB libres).
**Syncthing se probó y falló** — copiaba las memorias mientras Claude las escribía y se perdía la
coherencia. El disco funciona porque la copia se hace con Claude **cerrado**.

Lo que el dueño usa en el día a día está **en el disco**, no acá: dos archivos de doble clic
(`1-TRAER.bat`, `2-LLEVAR.bat`) y un `LEEME-PRIMERO.txt` explicado paso a paso. Acá vive la fuente
del script, versionada.

## El script

`sincronizar.ps1` — un solo archivo, dos verbos:

```powershell
sincronizar.ps1 traer   D:\      # al LLEGAR a un PC, antes de abrir Claude
sincronizar.ps1 llevar  D:\      # al TERMINAR, con Claude ya cerrado
```

**Sirve para varios proyectos.** La lista vive en el disco (`TRABAJO-EN-DOS-PC\proyectos.txt`), una
línea por proyecto (`nombre | ruta`). Un proyecto que no esté en el PC donde corre simplemente se
salta — por eso el segundo proyecto, que vive en el otro PC, se suma solo cuando se agregue su
línea allá.

Por cada proyecto mueve su carpeta y su carpeta de memorias, que Claude nombra con la ruta
convertida: se cambian `:` y la barra invertida por `-`. Y una sola vez, porque son del PC entero:
`plans`, `skills`, `agents`, `commands`, `plugins`, `settings.json`, `CLAUDE.md`, `.mempalace` y
`.claude-mem`.

## Las tres guardas

1. **Claude cerrado** — si está abierto, para. Copiar una base de datos que se está escribiendo es
   justo lo que rompía con Syncthing.
2. **Usuario `USER`** — las memorias llevan la ruta en el nombre de la carpeta; con otro usuario de
   Windows no se encuentran.
3. **El candado** — `ESTADO.json` en el disco dice qué PC lo dejó y cuándo; cada PC guarda qué
   versión trajo. Si se intenta LLEVAR sin haber TRAÍDO el trabajo del otro PC, para y avisa.

## Detalles que costaron una prueba

- Los `.ps1` van con **BOM** (`utf-8-sig`): PowerShell 5.1 los lee como ANSI sin él y parte los
  acentos. El `LEEME-PRIMERO.txt` también, para el Bloc de notas.
- Los mensajes de consola van **sin tildes**: la consola de Windows los muestra rotos.
- `/MIR` borra en el destino lo que no viene en el origen. Por eso todo lo de `.claude` se copia con
  `/E` (agrega, nunca borra) y solo `memory` va con `/MIR`, que sí debe ser espejo exacto. Sin esto,
  traer un disco armado a medias habría borrado las conversaciones del otro PC.
- Los `.bat` usan `%~d0` para la letra del disco: si en el otro PC es `E:` en vez de `D:`, funciona
  igual sin tocar nada.

## Probado el 15-sep-2026

Copia real al disco: **695 MB, 110 memorias**, las 3 conversaciones, `.git`, `.env` y el manual;
verificado que **no** se cuelan `node_modules` ni los `PEGAR-EN-SUPABASE-*.sql` (llevan
contraseñas). El candado probado en sus 3 casos. La guarda de "Claude cerrado" probada de verdad.

🔲 Falta que el dueño corra el ciclo completo: no se puede probar desde dentro de Claude, porque el
script exige que esté cerrado.
