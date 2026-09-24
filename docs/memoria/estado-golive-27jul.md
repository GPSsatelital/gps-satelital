---
name: estado-golive-27jul
description: "PUNTO DE ENTRADA — estado al cierre del 26-jul, víspera del go-live. Qué quedó listo, qué falta y por dónde seguir (diseño de marca)"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-28T01:16:41.448Z
---

# 📍 Cierre del 26-jul-2026 (víspera del go-live)

> ⚠️ **DESACTUALIZADO en parte.** El go-live ya pasó y el 27-jul por la tarde se trabajó una jornada
> completa más: 6 commits (`d1ef2a4` → `90b1158`) y las migraciones **073, 074 y 075** corridas.
> Para el estado de HOY leer primero **[[retenciones-rotas-y-filtros-descargas]]**.
> Lo de abajo sigue siendo válido para los pendientes de negocio y el plan de marca.

Go-live: **lunes 27 de julio, 7:00 a.m.** Último commit de ESE día: `20ef291`.

## Estado: listo para operar
**13 commits · 8 migraciones corridas (064–071) · 15 bugs corregidos** — casi todos de plata,
permisos o flujos bloqueados. **$891.500 devueltos** a 11 clientes y **$8.047.100** de deuda
inflada corregida en la ficha de 17.

Bloqueantes del plan de entrega: **B1–B5 cerrados**. Falta solo **B6 (hardware)**, que es del
usuario: probar el recibo en la GA-E2001 (ojo: la placa ahora sale grande) y el lector de huella.

## 🔜 POR DONDE SEGUIR: diseño de marca
El usuario está trabajando en **Claude Design** (app aparte, no manejable desde aquí).

**Nombre oficial de la empresa: "Club Moteros Cartagena"** (NO "Club de Moteros" — se corrigió
en el brief el 26-jul, commit `fb074fb`). Sigla: **CMC**.

- Brief completo ya escrito y con el nombre correcto: **`docs/BRIEF-DISENO.md`** (empresa,
  4 portafolios, 6 roles, identidad real con tokens leídos de `index.css`, y las reglas para que
  lo hecho allá sea integrable: estilos en línea + variables CSS, **nunca Tailwind**).
- Configuración recomendada de la app: crear un *design system* propio con los tokens del brief
  (no usar "Modernist", que pelea con la identidad densa), Template `None` para logo y `Slides`
  para presentación, modelo Opus 5.
- **Ya existe un concepto de logo candidato** (el usuario lo compartió como imagen): emblema tipo
  insignia con silueta de moto de perfil en forma de escudo, efecto cromado/plateado con brillo
  neón verde en el contorno, "CMC" en cromado 3D debajo, "Club Moteros Cartagena" en texto negro
  plano debajo de eso. Se le dio un prompt para tomarlo como BASE (no rehacer desde cero) y
  producir: versión principal transparente, versión de línea sólida un color (obligatoria para
  el recibo térmico — el cromado y el neón no imprimen en térmica de 80mm), versión sobre fondo
  navy oscuro, solo-emblema para favicon/32px, y versión horizontal.
- Ya se entregaron los 3 prompts completos (logo con la imagen de referencia, marca de agua para
  documentos legales, plantilla de presentación en 7 láminas para entrega+capacitación) — están
  en el historial de la conversación, no hace falta rehacerlos, solo pedir que se repitan si se
  perdió el hilo.
- **Falta:** la **presentación de ENTREGA** (para dueño y socios — distinta de la socialización a
  empleados, que ya existe) construida con la plantilla una vez el logo esté listo.
- **Pregunta abierta sin responder:** si actualizar el nombre "CLUB DE MOTEROS" que la app YA
  IMPRIME hoy en producción (recibos térmicos, contratos, ficha del cliente — 5 archivos:
  `TicketTermico.tsx`, `CobrosView.tsx`, `ReportesView.tsx`, `useDocumentos.ts`,
  `LineaTiempo.tsx`) a "CLUB MOTEROS CARTAGENA". Se le preguntó y el usuario no respondió aún —
  **no tocar esos archivos sin confirmación explícita**, son documentos legales en producción.
- Ya existen y NO hay que rehacer: 4 manuales en Word por rol + 4 presentaciones
  (socialización, plan de trabajo, capacitación de 41 láminas, guías rápidas).

## 🆕 Día 1 de operación real (27-jul) — lo que salió operando
Encontrado usando la app con casos reales, no revisando código:
- **`8f955a0` — cerrar una liquidación le quitaba la moto al cliente nuevo.** Caso RLT70H: LUIS
  SANDON ya se liquidó en la vida real la semana pasada y la moto se le está entregando a ADOLFO
  GAMEZ; en la app se pone al día el papeleo. El cierre ponía la moto en 'Disponible' pisando la
  'Reservada' del contrato nuevo. Ahora solo libera si ningún otro contrato la usa (excepción:
  'cumplimiento' → 'En traspaso' siempre). Y el wizard **avisa** (no bloquea) si la moto tiene
  liquidación abierta; solo bloquea si es por cumplimiento.
  **Lección:** el candado duro que el usuario aprobó habría impedido la operación CORRECTA —
  el papeleo va detrás de la calle. Preguntar antes de bloquear.
- **`c408f04` (mig 072) — foto del extracto obligatoria** al registrar dinero sin identificar.
  Era el último punto donde entraba plata sin imagen de respaldo. Miniatura clicable en la lista.

## 🔲 Pendientes por orden de importancia
0. **Taller y liquidación piden la misma revisión DOS VECES** (encontrado el 27-jul, sin
   arreglar). La orden del mecánico queda 'Finalizado' y la liquidación sigue en etapa
   'en_taller' esperando que alguien reescriba lo mismo en su propio formulario
   (`registrarRevisionTaller`). El usuario se topó con esto en su primera liquidación real.
   **Es el pendiente más molesto del día a día.**
1. **Viernes:** correr el chequeo de la mig 070 (al final del archivo). Debe dar **CERO filas**.
   Si da algo, el reparto se rompió otra vez y hay clientes pagando doble.
2. **Enlaces firmados en Storage** — la enumeración ya está cerrada (mig 071), pero un link
   suelto todavía abre sin sesión. ~16 archivos. Ver [[fuga-documentos-storage]].
3. **Archivar en PDF los 17 acuerdos de pago** tal como se imprimen hoy (~2 h): es lo único
   irreversible del sistema.
4. Revisar **DQW26I — WILLINGTON GARCIA ($3.000)**: quedó fuera de la corrección de la mig 070
   porque su abono pudo ser legítimo.
5. Dos columnas huérfanas (`cubre_periodo_hasta`, `firma_url`) no están en ninguna migración:
   un `db reset` borraría producción en silencio.
6. `ModalDeuda.tsx:53` no valida `descripcion` → revienta con error crudo delante del cliente.
7. **Decisión abierta:** actualizar "CLUB DE MOTEROS" → "CLUB MOTEROS CARTAGENA" en los 5
   archivos donde la app YA lo imprime (`TicketTermico`, `CobrosView`, `ReportesView`,
   `useDocumentos`, `LineaTiempo`). Se preguntó y el usuario no respondió — **no tocar sin
   confirmación**, son documentos legales en producción.
8. Los archivos de Storage **no se pueden borrar** desde la app (sin policy de DELETE): al
   eliminar una partida de dinero sin identificar, su imagen queda huérfana. Conviene limpieza
   periódica. (Queda un PNG de prueba en `comprobantes/sin-identificar/PRUEBAFOTO1/`.)

## Para la capacitación (dos cosas que generan llamadas si nadie las explica)
- **No se puede recolectar** sin haber intentado antes mensaje + llamada + sirena.
- **La liquidación le crea una orden de taller al mecánico** que él debe cerrar; si no, la moto
  queda marcada "en taller" y aparece como varada.
- Si una pantalla se pone rara: **Ctrl+Shift+R**. No se pierde nada, un pago solo se guarda
  cuando la app confirma.

## Lecciones de la jornada (aplican a futuro)
- **Los bugs grandes los destapó el usuario preguntando** por lo que veía raro en pantalla
  ("¿y si la moto está en fiscalía?", "¿por qué aparece al día?", "¿qué son esos $5.000?").
  Ninguno salió de revisar código. **Tomar en serio cada extrañeza que reporte.**
- **Probar el peor caso, no razonarlo.** Prioricé mal la fuga de Storage por asumir que hacía
  falta el link exacto; bastaba con listar.
- **Verificar cambia el resultado:** cuatro arreglos míos estaban mal escritos y solo se vieron
  probando (la guarda del convenio al revés, el `setval` del folio, el filtro por nombre de
  política, el stub que habría borrado la función del motor).
- **Nunca tocar datos vivos teniendo sandbox** — lo hice una vez con un contrato real.
