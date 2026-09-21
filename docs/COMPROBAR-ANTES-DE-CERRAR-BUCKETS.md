# Comprobar antes de cerrar la bodega de archivos

**Qué se va a hacer:** poner en privado los 5 depósitos de Supabase Storage, para que un enlace
viejo —reenviado por WhatsApp, guardado en el historial del navegador— **deje de abrir la cédula
de un cliente sin sesión**. Son 269 clientes con autorización de tratamiento de datos firmada.

**Por qué hay que comprobar primero:** cerrar la bodega rompe cualquier pantalla o documento que
todavía use la dirección vieja. Pedir la llave firmada funciona **igual** con la puerta abierta,
así que todo el código ya se pasó sin romper nada — pero hay que verlo con los ojos antes de
cerrar. **Al revés se rompen imágenes en producción, en vivo y sin aviso.**

> **Regla:** si una sola de estas casillas falla, **no se cierra**. Se avisa qué falló y se arregla.

---

## 1. Documentos que se IMPRIMEN (lo más importante — es papel que se le entrega al cliente)

Acá el defecto sería que el documento salga **sin la firma o sin la huella**, y no avisa.

- [ ] **Contrato** — abrir un contrato ya firmado e imprimirlo. Se tiene que ver la firma del
      cliente y su huella.
- [ ] **Pagaré** — lo mismo.
- [ ] **Liquidación firmada** — Liquidaciones → una cerrada → imprimir. Firma y huella presentes.
- [ ] **Acuerdo de pago (convenio)** — Ficha del cliente → imprimir el acuerdo. Firma del cliente,
      su huella, y si tiene acompañante, las de ella también.
- [ ] **Autorización de tratamiento de datos** — Ficha del cliente → pestaña Documentos →
      "Imprimir documento". Firma y huella registradas.
- [ ] **Tarjeta de propiedad (2 caras en una hoja)** — Motos → Documentos de la moto → imprimir.
      Las dos caras se ven, no salen en blanco.
- [ ] **SOAT** — misma pantalla, botón de al lado.
- [ ] **Recibo térmico con firma** — un recibo que lleve firma de quien recibe.
- [ ] **Resumen de entrega** — Reportes → Entregas → "ver resumen" de una entrega. Se ven las
      6 fotos de la moto.

## 2. Vistas previas en pantalla (antes de firmar)

- [ ] **Acuerdo de pago dentro del modal de convenio** — botón "👁 Ver acuerdo de pago". La huella
      del registro se ve.
- [ ] **Firmar una liquidación** — la huella del registro aparece en el paso de la huella.
- [ ] **Firmar un acuerdo de tiempo** (rodar/cobrar) — lo mismo.

## 3. Fotos y documentos en pantalla

- [ ] **Ficha del cliente** → pestaña Documentos: cédula, recibo, hoja de vida — abren y se ven.
- [ ] **Ficha del cliente** → las dos fotos de la visita (fachada y cliente+funcionario).
- [ ] **Clientes** → panel de aprobación: el checklist de documentos abre cada papel.
- [ ] **Documentos del contrato** (📎) — "Ver" y "Descargar" funcionan.
- [ ] **Documentos de la moto** — la miniatura se ve.
- [ ] **Taller** → una orden: fotos de entrada, fotos del daño y fotos de salida.
- [ ] **Liquidaciones** → "Ver documento firmado".
- [ ] **Contratos** → "Ver documento firmado" de una liquidación y de un acuerdo.
- [ ] **Mi Día** → una tarea cumplida: sus fotos y su firma.
- [ ] **Referidos** → foto de un premio entregado.
- [ ] **Tarjetas y llaves** → foto de un préstamo.
- [ ] **Reportes** → entregas: las miniaturas de las fotos.
- [ ] **Portal del SOCIO** → la foto de entrega de una moto.
- [ ] **Foto de perfil** de un cliente que tenga.
- [ ] **Firma guardada** de un cliente (al editarlo, aparece la que ya tenía).

---

## Después: cerrar

Cuando TODAS las casillas estén marcadas, se corre el SQL que pone los 5 depósitos en privado.
**No está en este archivo a propósito** — se pega en el chat en el momento, para que no se corra
por error antes de tiempo.

Si algo se rompe después de cerrar, se vuelve a abrir con el SQL inverso: es reversible en
segundos, no hay pérdida de datos.
