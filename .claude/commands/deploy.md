---
description: Verifica (tsc+build+test) y despliega a producción (commit + push + merge a main)
---

Ejecutá el flujo de despliegue de MotoGestión, con este mensaje de commit: **$ARGUMENTS**

Pasos (parar y reportar si algo falla, NO commitear roto):

1. **Verificar** en `motogestion/`:
   - `npx tsc -b` (sin errores)
   - `npm run build` (debe pasar)
   - `npm test` (21+ tests en verde)
   Si CUALQUIERA falla → detené el despliegue, mostrá el error y NO sigas.

2. **Commit** en la raíz del repo:
   - `git add -A`
   - `git commit -q -m "$ARGUMENTS"` con el trailer:
     `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

3. **Push + merge a main** (regla obligatoria — Vercel solo despliega desde main):
   - `git push -q origin <rama-actual>`
   - `git checkout main -q && git pull origin main -q && git merge <rama-actual> -q && git push origin main -q && git checkout <rama-actual> -q`
   - Obtené la rama actual con `git branch --show-current` (no la hardcodees).

4. Reportá "✅ desplegado" con el hash del commit.

Si el mensaje ($ARGUMENTS) viene vacío, pedíselo al usuario antes de commitear.
