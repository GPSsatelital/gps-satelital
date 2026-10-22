---
name: bug-editar-cliente-revierte-estado
description: "✅ RESUELTO — \"visita registrada pero cliente no pasa a Pendiente evaluación\" tiene DOS causas; la 2ª (editar revierte el estado) se arregló 16-jul"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
---

Síntoma reportado (recurrente): **"le registré la visita al cliente pero no pasó a Pendiente evaluación / Pendiente aprobación"**. Este síntoma tiene **DOS causas distintas** — revisar ambas:

## Causa 1 — el trigger de BD (ya resuelta, mig 042)
`trg_visita_mueve_cliente` (`after insert on visitas`, security definer) mueve el cliente de `Listo para visita → Pendiente evaluación`. Si NO estuviera activo, el único que mueve es el frontend y la RLS lo bloquea en silencio para un SUBADMIN. Verificar activo: `select tgname, tgenabled from pg_trigger where tgname='trg_visita_mueve_cliente'` (tgenabled='O' = ok). Ver [[sesion-9jul-bugs-operativos]].

## Causa 2 — editar el cliente REVERTÍA el estado (resuelta 16-jul, commit 39605cf)
`ClientesView.tsx` handler de edición (`guardarEdicion`): al editar datos/documentos recalculaba `estado` con `calcularEstado()` (que solo mira documentos → devuelve "Listo para visita" si están completos). Usaba una lista `estadosFijos` para NO recalcular, pero **olvidaba "Pendiente evaluación" y "Egresado"** → un cliente con visita ya hecha, al editarlo (corregir foto/teléfono/doc), volvía a "Listo para visita" y **desaparecía de la cola de aprobación**. La visita seguía guardada, por eso parecía que "no avanzó".
- Caso real: JEFFENSON MONTERO MOLINA (16-jul). Solo él estaba afectado.
- **Fix (robusto, no lista negra):** invertir la lógica → recalcular por documentos SOLO si `estado === "En proceso" || "Listo para visita"` (la etapa documental); cualquier estado más avanzado se respeta tal cual. Así ningún estado futuro queda suelto.
- **Lección:** cualquier punto que recalcule `clientes.estado` desde los documentos puede silenciosamente retroceder el embudo. Al crear un cliente arranca en "En proceso" (ok); el riesgo está en el path de **edición**.

## Nota de entorno
Se trabajó en el **PC #2** (DESKTOP-E6SNLHO, nuevo): git no tenía identidad → se configuró local (`GPSsatelital` / gpssatelitalcartagena@gmail.com). Este PC clona `main` directo, así que el commit fue directo a `main` (sin rama feature) — Vercel deploya desde main igual.
