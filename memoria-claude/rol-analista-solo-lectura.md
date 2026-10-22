---
name: rol-analista-solo-lectura
description: "Rol ANALISTA (mig 100) — ve las 23 tablas, no escribe en ninguna. Para un asistente de IA que consulta la base directo. Corrida 16-ago."
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-18T15:51:47.244Z
---

# Rol ANALISTA — ve todo, no toca nada (mig 100 ✅ corrida 16-ago-2026)

Pedido del dueño: una cuenta de solo lectura para **un asistente de análisis que él está
diseñando**. Decisión suya: el asistente **consulta la base directo por la API REST**, no entra por
la app. Por eso **la app no se tocó** — todo es SQL.

## 🔴 La regla que hace que esto signifique algo

El asistente entra con la **`anon key` + login de ese usuario**. **NUNCA con la `service_role
key`**: esa se salta TODAS las políticas y convertiría al "solo lectura" en un administrador con
permiso de borrar. Si alguien la usa "porque es más fácil", todo el trabajo queda sin efecto.

## Por qué es seguro por construcción (no por cuidado)

Cada política de escritura de este sistema **nombra explícitamente** los roles que pueden
(`mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'...)`). Un rol que no está en ninguna de esas
listas **no puede escribir en ninguna parte** — y tampoco podrá en las tablas que se creen mañana,
porque nadie lo va a agregar. No dependemos de acordarnos de bloquearlo: dependemos de nunca
haberlo autorizado.

Por eso el trabajo real fue **abrirle la lectura**, no cerrarle la escritura. Y eso se hizo
**agregando** una política por tabla, **sin modificar ni una sola de las existentes**.

## Qué hace la mig 100

1. `ANALISTA` agregado al `profiles_role_check`.
2. Una política `"Analista: solo lectura"` en **las 23 tablas** (en bucle, para que la condición
   sea idéntica en todas). Dos merecen nota porque su lectura NO es por rol sino por acción, y una
   política nueva era la única forma de que las lea sin darle un permiso que implica escritura:
   `contratos_auditoria` (`puede_accion('editar_contrato')`) y `liquidaciones`
   (`puede_accion('iniciar_liquidacion')`).
3. **Cerró el único hueco real**: `marcar_convenios_vencidos()` la podía llamar cualquiera con
   sesión, **no tenía ningún control de rol** y ESCRIBE (marca convenios como incumplidos, y 3
   incumplidos = liquidación obligatoria). Ahora exige ADMIN/AP/SECRETARIA/SUBADMIN — que son
   exactamente los que la llaman hoy al abrir Cartera, **así que para ellos no cambió nada**.

`profiles` se incluyó a propósito: ahí no hay claves ni correos (viven en `auth.users`), solo
nombre y rol. Sin ella el asistente lee *"lo registró 8f3a-91c2-…"* en vez de *"lo registró
ANGELA"*.

## Auditoría de las funciones que se saltan el candado (16-ago)

De las 30 `security definer`, casi todas son de disparador (Postgres no deja llamarlas directo) y
las demás validan por dentro: `cerrar_empalme` exige ADMIN/AP/SECRETARIA ·
`registrar_guardado_visitador` exige haber hecho ESA visita · `siguiente_numero_liquidacion` solo
saca un folio. **La única sin control era `marcar_convenios_vencidos`, y ya quedó cerrada.**

## Estado

- ✅ Mig 100 corrida. Verificado: **23 políticas creadas** y el usuario con credencial `ANALISTA`.
- ✅ Usuario creado por el dueño en Authentication (correo y clave los eligió él).
- 🔲 **Falta la prueba final:** que el asistente lea un pago (debe salir) y trate de crear una deuda
  (debe rebotar con *row-level security*). **Si la crea, hay que parar.** Se le dejó al dueño un
  snippet de consola del navegador que pide la clave con `prompt()` para no escribirla en ningún
  lado.

## Dos cosas que NO cubre

- **Storage** (cédulas escaneadas, firmas, huellas) es otra puerta con sus propias políticas. Este
  rol no la abre. Es una decisión aparte.
- **La app**: el rol no existe en el `Role` de `AuthContext` ni en `DEFAULT_ACCIONES`/
  `ACCESOS_SUGERIDOS`, a propósito. **No entrar a la app con esa cuenta** — no se rompe, pero se ve
  una pantalla vacía sin sentido.

## ⚠️ Trampa al crear la cuenta

`handle_new_user` hace que un usuario nuevo **nazca como SECRETARIA**
(`coalesce(raw_user_meta_data->>'role','SECRETARIA')`) — el rol que registra efectivo, confirma
transferencias y cierra caja. **Crear el usuario y correr el UPDATE del rol tienen que ir seguidos,
en la misma sentada.**

## Falla propia que quedó registrada

La primera consulta de radiografía contaba las políticas por comando (`r`/`a`/`w`/`d`) y **no vio
las `for all`**, así que 7 tablas (`caja_diaria`, `prestamos_*`, `recepciones_vehiculo`…) salieron
como *"0 / 0"* y parecieron abiertas. **No lo estaban** — tienen su política `for all` bien cerrada.
Al contar políticas hay que incluir `polcmd = '*'`, o se reportan huecos que no existen.

**Why:** es la puerta por la que un programa externo va a leer los datos de ~300 personas reales.
Que "solo lectura" sea de verdad depende de dos cosas: de estas políticas y de que nadie use la
service_role key.

**How to apply:** si algún día el asistente necesita ver algo que no ve, se agrega la tabla a la
lista de la mig 100 y se corre de nuevo — **nunca** se le da un rol de escritura ni la llave
maestra. Relacionado: [[permisos-dos-capas-rls]] · [[auditoria-permisos-rls-julio2026]] ·
[[fuga-documentos-storage]].
