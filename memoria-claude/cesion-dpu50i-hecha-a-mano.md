---
name: cesion-dpu50i-hecha-a-mano
description: "12-ago-2026: primera cesión real (DPU50I, JHONATAN→YEANPIER) hecha por SQL para no frenar la entrega. Qué quedó pendiente y los 2 huecos del módulo que la obligaron."
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-13T00:05:01.876Z
---

# La primera cesión real — DPU50I, hecha a mano (12-ago-2026)

**Verificada punto por punto y correcta.** Pero hubo que hacerla por SQL, y eso destapó dos huecos
del módulo que yo mismo construí el 11-ago. Ver [[cesion-de-contrato]] para el diseño.

## Cómo quedó (12 comprobaciones en verde)

| | |
|---|---|
| Titular | **YEANPIER ALEJANDRO CHIRINOS MEDINA** (era JHONATAN FERNANDEZ ORDOÑEZ) |
| Ahorro | **$512.000** — intacto |
| Cuota | **20 de 104** — intacta |
| Condiciones | $202.000 · Semanal · Lunes — **sin cambiar** |
| Deuda que asume | $669.000 · Saldo a favor $42.000 |
| JHONATAN | **Retirado**, historial completo |
| Contrato / moto | siguen **Suspendido / Recuperada** (la moto se entrega aparte) |

Los 3 pagos del contrato no se movieron. Retrato congelado y rastro de auditoría, ambos escritos.

## 🔲 LO QUE QUEDÓ PENDIENTE

**Los papeles: acta, pagaré y certificado están en `null`.** El motivo del registro lo dice
textual: *"PENDIENTE subir"*. Y hoy **no hay por dónde subirlos** — solo se pueden adjuntar al
CREAR la cesión, y esta ya está hecha.

## 🔴 Los 2 huecos del módulo que esto destapó

1. **No existe puerta para completar una cesión ya hecha.** Hay que construirla, con marca de
   "faltan papeles" hasta que estén — igual que ya funciona con los documentos del contrato.
2. **Las firmas y los 3 papeles son requisito bloqueante**, y en la práctica el acta llega por
   WhatsApp y el cliente firma después. Decisión del dueño: **que no bloqueen**; pasan a ser
   pendientes marcados. Sin construir.

**Defecto ya arreglado (commit `1e92766`):** el botón "Ceder contrato" quedaba `disabled` sin decir
qué faltaba — el funcionario lo tocaba y "no hacía nada". Ahora lista en palabras lo que falta, y
`puedeSeguir` se deriva de esa misma lista para que no pueda apagarse por algo no listado.

## El empalme: por qué hubo que cerrarlo a mano

El contrato era migrado con **empalme abierto**, y eso bloquea ceder. El panel de empalme exige
**firma + huella** del cedente (`PanelEmpalme.tsx:33`) y **JHONATAN no tenía ninguna de las dos
registradas** — ni podía venir.

Se cerró con SQL replicando `cerrar_empalme()`: consolidó $460.000 de apertura + $52.000 acumulado
= **$512.000**, y el rastro dice *"empalme_cerrado (sin huella - cedente no pudo asistir)"*.

**⚠️ Se selló sin que JHONATAN viera el acta con las cifras llenas** — él firmó el formato en
blanco. Decisión del dueño tomada a conciencia, con el cliente esperando.

**La regla que quedó para adelante:** el acta se imprime DESDE el sistema (`generarHTMLCesion`, ya
sale con las cifras reales), se manda, y el cliente firma VIENDO sus números. Un acta firmada en
blanco no confirma nada y legalmente es débil.

🔴 **Y una regla que no se negocia: el sistema NUNCA escribe valores sobre un documento ya
firmado.** Sería fabricar prueba, y pondría en duda todos los demás documentos firmados. Las cifras
quedan probadas por el retrato congelado en `cesiones_contrato`, que es aparte del escaneo.

## Detalles útiles verificados

- `clientes.ruta_contrato` ("diario"/"tiempo_definido") **NO afecta la cesión**: solo pre-selecciona
  la forma de pago en el wizard de contrato NUEVO, y la cesión no pasa por ahí. Yeanpier quedó
  marcado "diario" por error de registro — es solo una etiqueta en su ficha.
- Desde el editor SQL, `mi_rol()` devuelve null y el trigger `enforce_cliente_estado_change` **no
  se dispara** (`null not in (...)` da NULL, y el `if` no entra). Por eso los cambios de estado de
  cliente sí pasan desde ahí.
- **Yeanpier arranca debiendo $157.000 más de lo que recibe en ahorro.** Está dentro de la regla
  del dueño (la deuda pasa completa), pero conviene que él lo sepa con claridad.
