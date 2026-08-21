-- 108 — Firma y huella digitales de la liquidación.
--
-- Hasta ahora la única constancia era `documento_firmado_url`: la FOTO del papel que el cliente
-- firmaba a mano. Eso obliga a imprimir, firmar, fotografiar y subir — y si la foto sale mal o
-- nadie la sube, la liquidación queda cerrada "SIN FIRMA del cliente" para siempre.
--
-- Ahora el cliente puede firmar en pantalla (mismo canvas del wizard) y poner su huella con el
-- lector. El documento final se arma con las dos incrustadas y se guarda en PDF, que sigue
-- viviendo en `documento_firmado_url` — así todo lo que ya lee esa columna sigue funcionando
-- igual, sin tocar nada.
--
-- Estas dos columnas guardan la firma y la huella POR SEPARADO, además de dentro del PDF. No es
-- duplicado inútil: el PDF es una imagen aplanada, y si mañana hay que reimprimir el documento
-- o pelear una reclamación, se necesita el trazo original.
--
-- El camino de papel NO se elimina: el lector de huella solo trabaja en el PC de la oficina y ya
-- ha fallado antes. Si falla, se imprime y se sube la foto como siempre.

alter table public.liquidaciones
  add column if not exists firma_cliente_url text,
  add column if not exists huella_cliente_url text,
  add column if not exists fecha_firma timestamptz;

comment on column public.liquidaciones.firma_cliente_url is
  'Firma capturada en pantalla. El PDF de documento_firmado_url ya la trae incrustada; esta es el trazo original.';
comment on column public.liquidaciones.huella_cliente_url is
  'Huella del lector DigitalPersona. Opcional: si el lector no responde se firma igual.';
comment on column public.liquidaciones.fecha_firma is
  'Cuándo firmó el cliente. Distinto de updated_at, que se mueve con cualquier edición.';
