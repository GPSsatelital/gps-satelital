---
name: syncthing-setup-2pc
description: "✅ Syncthing 2 PC + celular Android de anclaje MONTADO — .claude sincronizado entre PC #1, PC #2 y un celu que hace de buzón siempre disponible"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-07-30T14:20:30.866Z
---

## 🔧 29-jul: el `.stignore` estaba MUERTO — arreglado. 243 MB → 2,4 MB

**Lo que se creía vs. lo que era.** La nota de más abajo decía que el `.stignore` excluía
transcripts, `cache`, `shell-snapshots`, etc. **Nunca fue verdad.** El archivo real tenía 2 líneas
(`projects/.claude` y `projects/observer`) y **ninguna de las dos carpetas existe en el disco** —
o sea que no excluía absolutamente nada y viajaba todo. Medido con la API de Syncthing, no de memoria.

**Lo que estaba viajando de más:** 5 repositorios `.git` completos (~60 MB) dentro de
`plugins/marketplaces` — justo lo que la regla propia prohíbe — y 85 MB de transcripts, entre ellos
**un solo archivo de 55 MB que se reescribe entero a cada rato** (el de la sesión abierta). Esa era
la causa real de que el relevo tardara.

**Resultado del arreglo (verificado con `/rest/db/status`):** de **2.969 archivos / 242,9 MB** a
**332 archivos / 2,4 MB**. Se comprobó uno por uno que siguen viajando `settings.json`, `plans/`,
`skills/` y la memoria del proyecto, y que ya NO viajan los `.jsonl` ni `plugins/`.

- El `.stignore` **no se sincroniza** (es propio de cada PC). Quedó una copia lista para pegar en
  el otro equipo en `.claude\stignore-para-el-otro-pc.txt`, que sí viaja. **Falta aplicarla en
  el PC #1** — hasta que se haga, el ahorro es solo de un lado.
- Nada se borró: lo que deja de sincronizarse se queda quieto donde está.
- Truco de verificación que sirve para siempre: `GET /rest/db/ignores?folder=<id>` devuelve cómo
  entendió Syncthing el archivo (y confirma que `//` sí son comentarios), y `/rest/db/file?...`
  dice si una ruta puntual viaja o no. Se le pregunta al programa, no se adivina.

## 🧠 29-jul: claude-mem y MemPalace NO capturan nada en el PC #2 — decisión: NO sincronizar sus bases

Auditado a fondo (la mitad de los agentes murió por el límite de gasto, así que **quedó sin la
pasada adversarial**; los hallazgos de abajo sí tienen comando + salida real):

- **Los dos figuran como "instalados" pero su código no está acá.** `installed_plugins.json` sí
  viaja desde el PC #1, y por eso engaña. `plugins/cache/` solo tiene theme-factory y
  frontend-design (copiados a mano el 21-jul). Sus hooks corren, no encuentran el programa y mueren
  en silencio. **Cero bytes escritos en todo el PC.**
- **claude-mem** necesita `bun` (no instalado) y guarda en `CLAUDE_MEM_DATA_DIR` o `~/.claude-mem`.
  **MemPalace** es Python: necesita el paquete `mempalace` (no instalado, ni `uv` ni `pipx`) y
  guarda en `~/.mempalace/` (`chroma.sqlite3` + un WAL propio).
- **Los dos guardan FUERA de `C:\Users\USER\.claude`** — nunca iban a viajar por Syncthing.
- **Decisión del dueño (29-jul): NO sincronizar esas bases.** Son SQLite: un archivo copiado en
  mitad de una escritura no queda "a medias", queda **roto y se pierde entero**. Hoy el riesgo está
  contenido porque cada PC tendría la suya; compartirlas lo empeoraría. Un `.md` en cambio genera un
  `.sync-conflict` recuperable. **Si el PC #1 tiene contenido real en `~/.claude-mem`, se exporta a
  `.md` — se migra el contenido, no la base.**
- Evidencia de que no hacen falta: toda esta semana se trabajó en el PC #2 sin ellos y la
  continuidad la sostuvo sola la memoria `.md`.
- ⚠️ **Límite: nunca se pudo ver el PC #1 desde acá.** Lo que haya allá sigue sin medir.
- De paso: `codebase-memory` tampoco tiene nada indexado, y el `.claude.json` real (aprobaciones de
  MCP, historial) vive **fuera** de lo sincronizado — viajan sus backups pero no él.

## 📱 Celular de anclaje (buzón) — ✅ AGREGADO 16-jul
Un **Android** con **Syncthing-Fork** (Catfriend1) se agregó como TERCER nodo que guarda copia de `.claude` y hace de buzón: cada PC sincroniza contra el celu cuando esté prendido, así **los dos PC nunca necesitan coincidir**. Los tres quedaron mutuamente conectados y "Actualizado" (PC#1=DESKTOP-TVN22VH/U235A73, PC#2=DESKTOP-E6SNLHO/LX6PMSV, celu=OGXGJQD).
- **Uso del usuario:** no deja el celu 24/7; solo lo activa/sincroniza en los 2 relevos (al cerrar un PC y antes de abrir el otro). Funciona porque el celu guarda copia completa; solo debe estar en verde en cada relevo.
- **Gotchas resueltos (para repetir en otro celu):**
  1. iOS NO sirve (Syncthing no corre en background en iPhone) — solo Android.
  2. Descubrimiento local WiFi↔Ethernet no cruzó → se forzó **dirección directa** en el celu: `tcp://192.168.1.26:22000` (IP LAN del PC #2). Si cambian IPs, reajustar.
  3. El celu salía "deshabilitado" porque en Syncthing-Fork → Condiciones de ejecución estaba activo **"Respeta el ahorro de batería de Android"** → se DESMARCÓ. Dejar "Ejecutar con wifi" ✅.
  4. Al aceptar la carpeta pedía ruta → **crear/elegir una carpeta** (ej. `Claude` en almacenamiento interno) + permiso "administrar todos los archivos". Además Ajustes Android → Batería → Syncthing-Fork → "Sin restricciones".
  5. Franja amarilla "transferencias fallidas" = stale (de antes del permiso); se limpia con "Reescanear todo".

## ⚠️ Los PLUGINS y los MCP NO se sincronizan — se instalan por PC (aclarado 21-jul)
Al abrir Claude en el PC #2 faltaban frontend-design, theme-factory, claude-mem, MemPalace, Context7, codebase-memory, etc. **No es una falla de Syncthing — es por diseño.** Causas confirmadas:
1. **Plugins:** sí viajan `installed_plugins.json`, `known_marketplaces.json` y `marketplaces/` (código fuente), pero **NO `plugins/cache/`** (la copia instalada que Claude realmente carga) porque `cache` está en la lista de ignorados del plan de Syncthing — decisión correcta: es pesada, rutas >260 chars (rompe en Windows) y es por máquina, como `node_modules`. **Fix: en cada PC correr `/plugin` una vez e instalar los plugins** (rápido, el marketplace ya está local).
2. **Servidores MCP:** se configuran en `C:\Users\USER\.claude.json` — un archivo **suelto FUERA de la carpeta `.claude\`**, así que Syncthing nunca lo toca. En el PC #2 `mcpServers` está vacío. **Fix: copiar el bloque `mcpServers` desde el `.claude.json` del PC #1** (NO copiar el archivo entero: lleva oauthAccount, machineID, historial).
- **Regla:** Syncthing trae memoria/notas/settings/skills; los "programas" (Node, git, plugins, MCP, drivers) se instalan una vez por PC.

## ⚠️ RELEVO PENDIENTE (22-jul) — revisar al arrancar en el OTRO PC
El 22-jul se trabajó en los DOS PC sin relevo limpio (un PC tuvo un problema y no alcanzó a sincronizar `.claude`). El **código sí quedó a salvo**: el otro PC pusheó `8354f8f`+`985ba29` (placa más grande, Cartera Hoy compacta) y combinaron sin conflicto con lo de este PC (compactar Cartera/Inmovilizaciones + modo noche). **Al abrir el otro PC:** 1) esperar Syncthing en VERDE antes de abrir Claude; 2) `git pull`; 3) revisar si aparecieron archivos `*.sync-conflict-*` en `.claude/projects/.../memory/` (memoria editada en ambos lados el mismo día — probable en `rediseno-visual-f1.md`, `MEMORY.md`, `compactar-densidad-movil.md`): NO borrar, comparar y fusionar a mano; 4) si `git status` allá muestra cosas sin commitear, commitear+push.

## ✅ MONTAJE 2 PC COMPLETO (15-jul). Los dos PC quedan gemelos, tal cual el plan (Opción A, sin trucos frágiles).

## Estado final
- **PC #1** (device `DESKTOP-TVN22VH`, id U235A73): SyncTrayzor v2.1.2, usuario `USER`, `.claude` en `C:\Users\USER\.claude`.
- **PC #2** (device `DESKTOP-E6SNLHO`, id LX6PMSV): SyncTrayzor v2.1.2, **cuenta local nueva `USER`** creada (el usuario original era "Usuario" en español ≠ USER, rompía el requisito de ruta). Bajo la cuenta USER: `.claude` sincronizado a `C:\Users\USER\.claude` (2.523 archivos, ~157 MiB, "Actualizado" verde) + proyecto clonado en `C:\Users\USER\Documents\GitHub\gps-satelital` + `npm install` en `motogestion/` OK (git 2.55, node v24 ya estaban machine-wide).

## Cómo se resolvió el problema del usuario
PC #2 tenía usuario "Usuario" (español). Se creó cuenta local `USER` (`net user USER * /add` + admin) para que la ruta coincida y la memoria (que lleva la ruta en el nombre de carpeta) funcione. **La cuenta "Usuario" NO se borró** — dejarla de red de seguridad hasta rescatar cualquier archivo necesario; borrar después desde la cuenta USER si se quiere.

## También se reseteó config vieja de Syncthing (ambos PC)
La config previa era v52, incompatible con Syncthing 2.0.12 → se renombró la carpeta de config vieja (`AppData\Local\Syncthing` → `Syncthing_viejo`) para que arranque limpia. ⚠️ **Lo que decía esta línea sobre el `.stignore` era falso hasta el 29-jul** — ver la sección de arriba: se creyó excluido durante 2 semanas y no lo estaba.

## Git automático (hook SessionStart) — ✅ montado 15-jul
En `~/.claude/settings.json` (sincronizado, aplica a ambos PC) hay un hook SessionStart que corre
`git -C "C:/Users/USER/Documents/GitHub/gps-satelital" pull --ff-only` al abrir Claude — trae el
código del otro PC solo, sin recordárselo. `--ff-only` = seguro: si diverge/hay cambios locales/sin
internet, no toca nada y echa un aviso. El `git push`+merge a main al terminar ya era regla fija.
Resultado: git 100% hands-off; el usuario solo mira el verde de Syncthing antes de abrir Claude.
(El hook se activa desde la SIGUIENTE sesión, no la que ya estaba abierta al montarlo.)

## Rutina diaria (explicada al usuario)
- **Al empezar en un PC:** esperar "Actualizado" verde en Syncthing → abrir Claude (el pull lo hace el hook solo).
- **Al terminar/cambiar de PC:** cerrar Claude → contar ~10 seg (que terminen de escribirse las BD) → esperar verde → abrir en el otro.
- **REGLA DE ORO:** nunca Claude abierto en los 2 PC a la vez (SQLite claude-mem/mempalace se corrompen).
- Código por git (nunca `.git`/`node_modules` por Syncthing). Si aparece `*.sync-conflict-*`: no borrar, revisar (versionado Escalonado guarda copias).
- Claude corre en el PC donde se abre (sabe el hostname); la memoria sincronizada es el puente de contexto entre PCs.

Ver [[decisiones-hardware-oficina]]. Plan original en CLAUDE.md sección "PLAN SYNCTHING".
