---
name: regla-revisar-antes-de-recap
description: "REGLA — al iniciar/retomar, revisar git+memoria FRESCA antes de decir \"en qué vamos\"; no fiarse de la memoria de la conversación"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

**REGLA (pedida por el usuario 21-jul):** al retomar o cuando el usuario pregunte "¿en qué íbamos?" / "¿qué fue lo último?", **NO contestar de memoria de la conversación** — REVISAR primero el estado real.

**Why:** con Syncthing + 2 PC, el trabajo se hace en sesiones distintas (a veces en el otro PC). La memoria de ESTA conversación puede estar días atrasada. Pasó el 21-jul: Claude insistía que "lo último fue la batería de pruebas (16-jul)" cuando en realidad lo último era el **rediseño visual F3 (21-jul)** hecho en el PC #2 — la memoria estaba fresca en disco (Syncthing la sincronizó) pero Claude no la leyó.

**How to apply — al iniciar/retomar:**
1. Si el hook SessionStart dice **"[git-auto] pull no aplicado / rama divergida"** → ES LA SEÑAL de que el código local está atrasado. **Sincronizar el git ANTES de trabajar** (`git fetch` + poner la rama al día con origin/main).
2. **Leer la memoria por fecha de modificación** (`ls -t memory/*.md`) y `git log origin/main --oneline` para ver el trabajo REAL más reciente — no asumir por la conversación.
3. Recién entonces decir "en qué vamos". Syncthing sincroniza los ARCHIVOS; leerlos frescos es responsabilidad de Claude.

Syncthing SÍ resuelve la frescura de los archivos (memoria .md, y el código vía git). El eslabón que faltaba era esta disciplina de revisar antes de responder.
