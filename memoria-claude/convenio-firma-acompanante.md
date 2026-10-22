---
name: convenio-firma-acompanante
description: "La acompañante puede firmar el acuerdo de pago como CODEUDORA SOLIDARIA (mig 151, 12-sep-2026). Casilla opcional en ModalConvenio, nombre y cédula congelados, párrafo y caja de firma en el documento impreso."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-15T17:34:54.091Z
---

# La acompañante firma el acuerdo como codeudora solidaria (12-sep-2026)

Pedido del dueño: *"al iniciar un convenio salga una opción para que la acompañante también pueda
firmar un convenio igual que como si fuera el titular"*. Al preguntarle en qué calidad, eligió
**CODEUDORA SOLIDARIA** (no testigo): responde por la deuda en las mismas condiciones que él.

**Mig 151** — `convenios.firma_acompanante_url` · `acompanante_nombre` · `acompanante_cedula`.
El nombre y la cédula se guardan **congelados al firmar**, no se leen del cliente: el papel que
firmó hace seis meses tiene que seguir diciendo quién firmó aunque después le editen los datos.

## 🔴 BASTA CON LA FIRMA DE UNO DE LOS DOS (misma tarde, segunda decisión)

El dueño probó y dijo: *"la idea es que si uno no está, el otro también pueda hacer el proceso por
él"*. El botón de crear el acuerdo estaba `disabled` mientras no hubiera firma **del titular** — sin
él no había forma de cerrarlo. Ahora se habilita con **cualquiera de las dos** firmas.

Si firma **solo ella**: el acuerdo dice que suscribe *"en representación del titular"*, imprime solo
su caja de firma y **no** imprime la de él. 🔴 Ojo con la trampa que se evitó: la caja del titular
caía al respaldo `cliente.autorizacion_datos_firma_url` (su firma del registro), y habría impreso
un acuerdo que parecía firmado por alguien que no estaba. Sin marca de pendiente ni línea en blanco
(decisión suya: "firma ella y ya").

**LA HUELLA TAMBIÉN ES INTERCAMBIABLE** (tercera decisión del mismo día): *"que la huella funcione
con la que ella registró como si fuera él… ambos en este caso es como si fueran lo mismo"*. La regla
del 28-jul sigue viva — sin huella no hay acuerdo — pero se cumple con la que haya registrada de
**cualquiera de los dos**. El aviso rojo que bloqueaba solo sale si NINGUNO la tiene; si la tiene
solo ella, sale uno verde que lo explica.

🔴 **Dato del barrido (12-sep): 96 de 317 clientes con contrato NO tienen huella registrada** — a
ese 30% el sistema les bloquea el convenio. De esos 96, solo **1** tiene la huella de la acompañante
(BRAYAN ROMERO / NORELIS ROMERO, RLZ79H), así que este cambio desbloquea uno. El cuello de botella
real son los 95 restantes: hay que registrarles la huella a ellos o a su acompañante.

**LA MARCA DE QUIÉN FIRMÓ** (*"hay que marcarlo para que se sepa"*): no hizo falta columna nueva —
se sabe por cuál de las dos firmas quedó guardada. `src/utils/convenioFirmas.ts` (5 pruebas) con
`quienFirmoConvenio()` y `marcaDeFirma()`; la línea sale en Cartera (panel del convenio) y en la
ficha del cliente. Si firmó solo el titular no se dice nada, como siempre.

**En `ModalConvenio`:** casilla **opcional**, y solo aparece si ese cliente tiene acompañante
registrada (sin nombre no hay a quién pedirle la firma). Muestra su nombre, cédula y si tiene
huella — la huella **no bloquea** (a diferencia de la del titular, requisito desde el 28-jul).
Su firma sube al bucket `documentos` ANTES del insert: si falla la subida, el convenio no se crea.
El insert **solo manda las columnas nuevas si de verdad firmó**, para que el convenio de siempre
siga funcionando aunque la mig 151 no esté corrida.

**En el acuerdo impreso** (`generarHTMLAcuerdoPago`): un párrafo que la nombra como codeudora
solidaria y una segunda caja de firma + huella. Sin su firma, el papel sale idéntico a como salía.

Verificado en el navegador con DPU48I (DAIRO GOMEZ / NOEMI PEDROZA): botón deshabilitado sin
ninguna firma, habilitado firmando solo ella, y los tres casos del documento comprobados contra el
HTML generado (solo él / los dos / solo ella).
✅ **Mig 151 corrida el 15-sep-2026** (las 3 columnas verificadas). El código llevaba desde el
12-sep en producción: los convenios normales funcionaban, pero si la acompañante firmaba el
guardado habría fallado por columna inexistente — quedó tapado antes de que pasara.
🔲 Falta firmar un acuerdo real de punta a punta con una acompañante.

Relacionado: [[convenios-revision-completa]] · [[mapa-financiero-y-partitura]] ·
[[liquidacion-firma-digital-y-desglose]].
