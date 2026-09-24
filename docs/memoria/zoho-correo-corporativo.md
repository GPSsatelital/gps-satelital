---
name: zoho-correo-corporativo
description: "Correo corporativo del Club de Moteros en Zoho Mail (dominio clubmoteros.com en GoDaddy) — qué quedó configurado el 3-sep-2026, qué falta (MX/SPF/DKIM, Ángela, contabilidad@, plan pago) y cómo se conectan las cuentas de Google"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-03T17:52:39.043Z
---

# Correo corporativo en Zoho Mail (armado el 3-sep-2026 desde el Chrome del dueño)

**Dónde:** consola https://mailadmin.zoho.com · organización "club moteros" · dominio `clubmoteros.com`
(comprado en **GoDaddy**, registrador externo) · plan **Mail Free** (máx. 5 usuarios, 5 GB c/u,
SIN IMAP/POP: solo web y app de Zoho Mail).

## Lo que quedó hecho
- **Superadmin renombrado:** el dueño había creado `clubmoteros.contabilidad@` y no le gustó. Zoho
  NO deja editar el buzón; el camino fue: alias `gerencia@` con la casilla "Establecer como
  dirección de buzón" → en Seguridad → "Dirección de correo de inicio de sesión" marcarlo primario
  (estrella) → borrar el alias viejo. Ahora: **Gerencia Club Moteros <gerencia@clubmoteros.com>**,
  Superadministrador. Login: `gerencia@…` con la misma clave; el Gmail
  `clubmoteros.contabilidad@gmail.com` sigue como llave de entrada alterna.
- **4 usuarios** (formato `nombre.apellido@`, decisión del dueño; contraseñas temporales las tecleó
  él, con "forzar cambio en el primer inicio"): `brandon.rojas@` · `lumar.avendano@` ·
  `carlos.ariza@` · `carlos.alvarez@`. Son 4 de los 6 subadmins actuales. **Cupo gratis LLENO (5/5).**
- **Grupo** `adminflota@clubmoteros.com` ("Administración de Flota"): miembros = los 5 usuarios;
  "Todos" pueden escribirle (clientes/bancos); Streams no; los miembros NO envían "como" el grupo.

## DNS en GoDaddy — ✅ los 5 registros guardados (3-sep, tarde)
El dueño abrió GoDaddy logueado y Claude los agregó desde su Chrome. Quedaron 13 registros; los
nuevos son:
- `@ MX 10 mx.zoho.com` · `@ MX 20 mx2.zoho.com` · `@ MX 50 mx3.zoho.com` (TTL 30 min)
- `@ TXT v=spf1 include:zohomail.com ~all`
- `zoho._domainkey TXT v=DKIM1; k=rsa; p=MIIBIjANBgkq…IDAQAB` (clave 2048 bits, selector `zoho`)

🔴 **TRAMPA DE GODADDY (verificada en vivo):** su asistente "Crea registros MX → Zoho" propone
**`mx1.zoho.com`** para la prioridad 10, pero Zoho pide **`mx.zoho.com`** (sin el 1). Hay que
entrar a "Editar" en el paso 1 del asistente y corregirlo, o el buzón principal no recibe.
Otra trampa: en "Añadir un registro nuevo", al cambiar el **Tipo** se **borra el campo Valor** —
seleccionar TXT primero, escribir el valor después.

✅ **VERIFICADO EN ZOHO el mismo 3-sep** (propagó en minutos, no en horas): MX verde en los 3 ·
SPF "han apuntado correctamente" · DKIM "verificado correctamente" + **interruptor Situación
activado** y selector marcado con estrella (predeterminado) · el dominio pasó de "Pendiente de
apuntar registros MX" a **"Completado"**.

✅ **PROBADO DE VERDAD, no solo en pantallas:**
- **Entra correo externo:** llegó un mensaje de `mirito1234_@hotmail.com` a `gerencia@` y otro de
  Emiro Moreno a `lumar.avendano@` — o sea los buzones de los subadmins también reciben.
- **Sale correo:** Claude envió desde `gerencia@` a `clubmoteros.contabilidad@gmail.com`; quedó en
  Enviado con visto verde de entrega.
Ruta para repetir la verificación: Dominios → clubmoteros.com → Configuración de correo → MX / SPF
/ DKIM → "Configurar manualmente" → "Verificar".

## Lo que FALTA (en este orden)
1. **Ángela** (`angela.<apellido>@`) y **grupo `contabilidad@`** (Ángela + auxiliares + gerencia):
   requieren pasar a **Mail Lite** (~1 USD/usuario/mes) porque el cupo gratis está lleno. Ese día
   también Sergio (mientras tanto usa `gerencia@` — ojo: es la clave de superadmin) y los otros
   2 subadmins.
2. **Cuentas de Google** con el correo corporativo: cada persona crea su cuenta en Google con
   "Usar mi dirección de correo actual" (`brandon.rojas@clubmoteros.com`), sin Gmail → Drive,
   Docs, Play con identidad de la empresa. Google manda un código al correo → **solo funciona
   después del MX**. Claude no crea cuentas; se les da el paso a paso.

## Reglas que fijó el dueño
- Personas = `nombre.apellido@`; dependencias = **grupos** (no usuarios). Si alguien se va, se
  desactiva su usuario y el grupo se re-apunta.
- Direcciones en minúsculas (Zoho las normaliza; da igual cómo las escriban); las mayúsculas van
  en el nombre visible.
