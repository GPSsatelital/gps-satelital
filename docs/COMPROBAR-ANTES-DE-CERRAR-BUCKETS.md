# ✅ La bodega de archivos quedó cerrada — 21-sep-2026

Los 2 depósitos de Supabase Storage (`documentos` y `comprobantes`) están **en privado**.
Un enlace viejo —reenviado por WhatsApp, guardado en el historial del navegador— **ya no abre
nada**. Son los documentos de identidad de 269 clientes, cada uno con una autorización firmada
donde la empresa se compromete a custodiarlos (Ley 1581 de 2012).

Este archivo nació como una lista de 28 casillas para marcar a mano. **No hizo falta:** se
comprobó midiendo, contra la base y los archivos reales de producción, con la bodega ya cerrada.
Queda como el registro de qué se probó y cómo, por si algún día hay que repetirlo.

---

## La prueba que importa

| | Resultado |
|---|---|
| **El enlace viejo** (el que viajaba por WhatsApp) | **400 — muerto** |
| **El camino nuevo** (enlace firmado) | **200 · image/jpeg · 783.675 bytes** |

Misma cédula, mismo archivo. El de afuera no entra; la app sí.

## Las 6 piezas del mecanismo

| Pieza | Con qué se probó | Resultado |
|---|---|---|
| `abrirDocumento` — los 19 enlaces | cédula real de un cliente | abre `object/sign` |
| `descargarDocumento` | la misma | baja `object/sign` con `?download` |
| `ImgPrivada` — fotos en pantalla | foto de entrega de **DQW27I** | **cargó completa: 3060 × 4080 px en 3,2 s** |
| `urlADataUrl` — embudo de los 11 PDF | firma real | dataURL de 26 KB |
| `htmlAPdfBlob` — todos los PDF | firma real | PDF de **23 KB** (no la hoja en blanco de 3 KB) |
| `firmarImagenesHtml` — las ventanas de impresión | ver la tabla de abajo | 0 direcciones viejas |

## Los 8 documentos, generados con clientes reales

Se llamó a la **función que corre cuando se aprieta el botón**, no a la plantilla, y se leyó
el HTML que escribió.

| Documento | Con quién | Imágenes | Direcciones viejas | Firmadas |
|---|---|---|---|---|
| Autorización de tratamiento de datos | MARTHA ALVAREZ | 2 | **0** | 2 |
| Acuerdo de pago (convenio) | JAIDER FERRER | 2 | **0** | 2 |
| Liquidación *(`imprimirLiquidacion`)* | ANTONIO MONTERROZA | 2 | **0** | 2 |
| Acuerdo de tiempo *(`imprimirAcuerdoTiempo`)* | — | 2 | **0** | 2 |
| Contrato | con firmas reales | 2 | **0** | 2 |
| Resumen de entrega | IGC62I | 6 fotos | **0** | 6 |
| Tarjeta de propiedad *(2 caras)* | moto de prueba | 2 | **0** | 2 |
| SOAT | moto de prueba | 1 | **0** | 1 |

> La tarjeta y el SOAT se probaron montando `ModalDocumentosMoto` con una moto armada a mano:
> **ninguna moto de la flota tiene todavía la tarjeta escaneada**, así que no había dato real.
> Cuando empiecen a escanearlas, el camino ya está probado.

## Lo que hace falta para que esto siga funcionando

1. **Cualquier `<img>` nueva que muestre un archivo del cliente usa `ImgPrivada`**, nunca `<img>` a
   secas. Las `<img>` crudas que quedan en el código son vistas previas de la cámara (locales).
2. **Cualquier enlace nuevo a un documento** usa `abrirDocumento` / `descargarDocumento`.
3. **Cualquier documento nuevo que se imprima** pasa su HTML por `firmarImagenesHtml` antes de
   escribirlo, y **abre la ventana ANTES del `await`** o el navegador la bloquea por emergente.
4. Los PDF no necesitan nada: `htmlAPdfBlob` firma solo.

## 🔄 Si algún día hay que reabrir

No se pierde ningún archivo, solo cambia una bandera:

```sql
update storage.buckets set public = true where id in ('documentos', 'comprobantes');
```

---

## Las otras dos puertas que se cerraron el mismo día

Aparecieron al auditar los permisos **antes** de cerrar, y ninguna la cerraba este paso:

- **mig 161** — 5 políticas de lectura `PERMISSIVE` se sumaban entre sí y anulaban la exclusión del
  VISITADOR: con su usuario podía descargar los documentos de los 269 clientes.
- **mig 162 + el interruptor** — `mi_rol()` devuelve vacío si la persona no tiene perfil, y
  `NULL IS DISTINCT FROM 'VISITADOR'` es **verdadero**. Con el registro de Supabase **abierto**,
  cualquiera en internet podía crearse una cuenta y entrar. Nadie alcanzó a hacerlo.

Detalle completo del caso y cómo auditar `pg_policies` sin equivocarse:
memoria `fuga-documentos-storage`.
