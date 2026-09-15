# Mover MotoGestión a otro PC sin perder nada

Dos scripts: uno empaqueta en la memoria USB, el otro restaura en el PC nuevo.
Probados el 15-sep-2026 contra una carpeta de prueba: 109 memorias, 240 MB (sin plugins ni
conversaciones), sin `node_modules` y sin los archivos que llevan contraseñas.

---

## Antes de nada: las dos reglas que no se pueden saltar

**1. El usuario de Windows tiene que llamarse `USER` en los dos PC.**
Las memorias se guardan en una carpeta cuyo nombre ES la ruta del proyecto:
`C--Users-USER-Documents-GitHub-gps-satelital`. Si el otro PC tiene otro usuario, Claude
buscará una carpeta con otro nombre y **no encontrará ninguna memoria**. El script de
restaurar se niega a seguir si detecta un usuario distinto, para que nadie lo descubra tarde.

**2. Nunca Claude abierto en los dos PC a la vez.**
Las memorias (`mempalace`, `claude-mem`) son bases de datos. Dos programas escribiendo a la
vez las corrompen. Se trabaja en uno, se cierra, se pasa la memoria, se abre en el otro.

---

## Para llevar (en el PC donde vienes trabajando)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\migracion\empaquetar.ps1 -Destino E:\
```

Cambia `E:\` por la letra de tu memoria. Tarda unos minutos.

Si quieres un paquete más liviano:

| Opción | Qué deja fuera | Ahorra |
|---|---|---|
| `-SinPlugins` | Los plugins de Claude (se reinstalan solos) | 171 MB |
| `-SinConversaciones` | El historial completo de las conversaciones | ~350 MB |

Las **memorias siempre viajan** — son 952 KB y son lo importante.

El script avisa si hay trabajo sin guardar en git antes de copiar.

---

## Para instalar (en el PC nuevo)

1. Conecta la memoria y **cierra Claude por completo**.
2. Desde la carpeta del paquete:

```powershell
powershell -ExecutionPolicy Bypass -File repo\scripts\migracion\restaurar.ps1
```

3. Abre una consola en `C:\Users\USER\Documents\GitHub\gps-satelital\motogestion` y corre:

```bash
npm install
```

4. Abre Claude. Las memorias tienen que estar ahí.

El script guarda una copia de lo que hubiera en ese PC antes de sobreescribir
(`C:\Users\USER\RESPALDO-ANTES-DE-RESTAURAR-<fecha>`), por si acaso.

**Falta instalar a mano, una sola vez por PC:** Node.js, Git y Claude Code. Y los drivers si
ese PC va a usar el lector de huellas o la impresora térmica.

---

## Qué viaja y qué no

| Viaja | Se queda |
|---|---|
| El código con toda su historia de git | `node_modules` (se regenera con `npm install`) |
| Las 109 memorias del proyecto | `dist` (se regenera al compilar) |
| Las conversaciones completas | `PEGAR-EN-SUPABASE-*.sql` (llevan contraseñas y ya se usaron) |
| Planes, skills y ajustes de Claude | La caché y la telemetría |
| MemPalace y claude-mem | |
| Las claves de Supabase (`.env`) | |
| Los datos de migración y el manual en PDF (no están en GitHub) | |

---

## Para dos PC fijos, hay algo mejor que la USB

Syncthing sincroniza la carpeta `.claude` entre los dos por internet, sin USB y sin acordarse
de copiar. El código ya viaja por GitHub. Sigue valiendo la regla de un PC a la vez.
El diseño está en la memoria `syncthing-setup-2pc`.
