---
name: candados-contra-repetir-d054
description: "Cómo se resolvieron las acciones repetidas (D-054/D-055, 23-oct-2026): candados en la base, botones, y la causa real (pantallas que no se enteraban)"
metadata:
  node_type: memory
  type: project
  originSessionId: f3e3a9ce-80c4-4776-8f6c-f340eaf96d8c
  modified: 2026-10-24T01:13:48.586Z
---

**23-oct-2026.** Pedido del dueño del 10-oct: «todo botón bloqueado contra doble clic y que las peticiones no se envíen dos veces».

Lo que se MIDIÓ (y cambió el plan): las copias NO eran doble toque.
- 9 decisiones de tiempo guardado repetidas (1 s a 4 min). 8 salieron de Inmovilizaciones › Devolver moto: la moto seguía saliendo «retenida · por resolver» después de resolverla y entregarla, y se hacía todo otra vez. 2 casos fueron dos personas a la vez.
- Causa de fondo: `useUbicaciones` tenía una copia por pantalla (14) y `recepciones_vehiculo`, `acuerdos_tiempo_rodado`, `historial_ubicaciones` no estaban en `supabase_realtime`.
- Botones: de 64 que guardan, 63 ya se bloqueaban y 59 decían «Guardando…». Mi primera cifra («40-50 sin bloqueo») salió de una búsqueda gruesa que contaba funciones internas → **medir botón por botón antes de anunciar** (ver [[feedback-preguntar-hasta-que-quede-claro]]).

Lo hecho: migs 203 (tiempo guardado, referencia de transferencia) y 204 (recepción 30 min, abono base 10 min, una liquidación abierta, deuda 10 min), cada una con la prueba adentro; los 5 botones + `src/botonesQueGuardan.test.ts`; `useUbicaciones` sobre `createTableStore` + mig 205.

**Why:** el candado que protege plata va en la BASE (igual que [[candado-saldo-favor-dos-clics]]); el botón solo frena el toque rápido.
**How to apply:** un trigger nuevo de candado compara solo contra filas de OTRA operación (`created_at is distinct from now()`), y la prueba guarda una fila «de hace 1 minuto» y otra enseguida. Ojo: `recepciones_vehiculo.quien_recibe` es uuid (la 204 falló la primera vez por tratarlo como texto). Pendiente con el dueño: JORGE BELLO / JESUS QUIÑONEZ rodados dos veces (ver PENDIENTES arriba).
