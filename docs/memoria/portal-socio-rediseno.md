---
name: portal-socio-rediseno
description: Pendiente — rediseño completo del portal del socio (inversionista) por fases
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

El portal del SOCIO (`src/pages/SocioDashboard.tsx`) **nunca se ha trabajado de fondo** — se va a
reestructurar como un portal de inversionista de nivel. Diseño aprobado en concepto (14-jul-2026),
**construcción DIFERIDA** (parkeado por el usuario para no dejar cosas a medias; hay trabajo acumulado primero).

**Filosofía:** solo lectura, tranquilizador y bonito ("mi inversión trabajando"); estrictamente su
grupo (RLS ya lo garantiza); móvil primero; cero operativo (no cobra/edita).

**4 secciones propuestas (construir por fases, empezando por Entregas):**
1. 🏠 Inicio — panorama de inversión (motos produciendo vs paradas, recaudo del mes, cartera al día/mora, ahorro acumulado camino al traspaso).
2. 🛵 Entregas recientes — carta de presentación: cliente + moto + resumen de lo pactado + **fotos de entrega grandes**, SIN links de documentos ni ✓/✗ (nada técnico/legal). Es lo que el usuario más quiere.
3. 🏍️ Flota — sus motos, estado de cada una, SOAT/tecno próximos.
4. 📈 Recaudo — tendencia del dinero en el tiempo.

**Futuro:** ROI por moto + tiempo de recuperación; traspasos (graduados); descargar reporte propio.

**Nota técnica:** hoy `App.tsx:477` → `if (role==="SOCIO") return <SocioDashboard/>` (no entra a Reportes ni al layout normal). El rediseño vive dentro de ese componente, filtrado por `profile.grupo`.

## ✅ CONSTRUIDO 3-sep-2026 — commit `b9c39f1` (solo TS, SIN migración)

**Decisión del dueño (3-sep):** el socio ve **números Y NOMBRES** de sus clientes (incluida la
lista de mora), pero **sin un solo botón** — no cobra, no edita, no registra. Se descartó ocultar
nombres. Motivo suyo: quiere que el socio conozca a su gente y pueda preguntarle por un caso.

**🔴 DOS CIFRAS QUE HOY MIENTEN en `SocioDashboard.tsx` (verificado leyendo el código, 3-sep):**
1. **La mora se calcula aparte**: `const enMora = estadosPorContrato.filter(e => e.diasSinPago > 2)`
   — regla propia de "más de 2 días", NO usa `calcularEstadoCartera`/`loQueDebe`. No sabe de día de
   pago, gabela, convenios ni plazo extra. **Un cliente al día en Cartera puede salirle en mora al
   socio.** Es el defecto de las 10 copias ([[cartera-cuanto-debe-una-sola-funcion]]) por otra puerta.
2. **La proyección mensual es inventada**: `tarifaPromedio * contratosActivos.length * 26`. Ese
   número no existe en ningún otro lado del sistema (los domingos valen distinto; se trabaja con
   `valor_semanal`/período, nunca días × tarifa).
Ambas se arreglan como parte del rediseño: ninguna cifra se calcula en el portal, todas salen de
las funciones únicas que ya usan Cartera y Caja.

**Lo que quedó:** 4 secciones — **Inicio** (entró este mes · produciendo vs paradas CON el motivo
en palabras del socio · barra de cómo van pagando · lista de mora con nombre+placa+días · última
entrega) · **Entregas** (foto grande, placa amarilla `<Placa size=md>`, nombre y lo pactado en 3
datos; SIN documentos ni marcas legales) · **Flota** (motos + SOAT/tecno por vencer) · **Recaudo**
(6 meses). Ruteo intacto: `App.tsx:576`. `utils/portalSocio.ts` + 19 pruebas (476 en total).

🔴 **DOS DEFECTOS DE CRAFT que solo aparecieron al renderizar** (las pruebas y tsc pasaban):
1. **Todo el texto salía CENTRADO** — `#root { text-align: center }` en `index.css` lo hereda TODA
   la app. En un panel de cifras se lee mal. Se corrigió con `textAlign:"left"` en la raíz del
   portal. ⚠️ El resto de la app sigue heredándolo.
2. **Las barras de meses salían como rayas de 2px** — `height` en % NO resuelve dentro de un item
   flex sin altura definida. Ahora se calcula en píxeles (`ALTO_BARRA`). Vale para cualquier
   gráfico de barras nuevo del proyecto.
Verificado a 375px en día y noche con Chrome headless, cero desbordes → [[verificar-ui-sin-browser-pane]].

🔲 **Falta probar con un login de SOCIO real** (no había credenciales).

**Aspecto:** la maqueta usa iconos dibujados en vez de emojis; el dueño aún no decidió si se
cambian en todo el portal o se mantienen por familiaridad.

Relacionado: el reporte de Entregas para admins ya existe en Reportes ([[MEMORY]] — pestaña Entregas de ReportesView). El de socios reusa la misma data pero con presentación distinta (sin docs).
