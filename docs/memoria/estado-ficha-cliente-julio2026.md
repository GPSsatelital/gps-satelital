---
name: estado-ficha-cliente-julio2026
description: "Estado de foto de perfil, firma/huella visibles, documento de autorización imprimible, y consolidación de recibo del acompañante en FichaClienteView — sesión 4 jul 2026"
metadata:
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

Trabajo del 4 jul 2026, commits `a40234c` → `54ed0a6` en `main`.

## Hallazgo crítico: ClienteDetalleSheet era código muerto

`ClienteDetalleSheet.tsx` (panel deslizante) nunca se abría en ningún lugar de la app desde que se creó (22 jun) — el `useState` que lo activaba nunca se seteaba. Se construyeron 3 features ahí (foto de perfil, firma/huella, imprimir documento) antes de notar que la pantalla real que el usuario usa con "Ver ficha completa" es `FichaClienteView.tsx` (con pestañas Resumen/Contrato/Pagos/Visitas/Documentos/Deudas/Convenios/Gestiones). Se eliminó el archivo completo y todo se trasladó a `FichaClienteView.tsx`.

**Lección para el futuro:** verificar siempre en el navegador, con la pantalla real que abre el botón del usuario, antes de dar por completada una feature de UI — no asumir por el nombre del componente. Ver [[regla-jsx-funciones-anidadas]] para otro patrón de bug similar (asumir sin verificar en el navegador).

## Features construidas (todas en FichaClienteView.tsx ahora)

- **Foto de perfil** (`FotoPerfil.tsx`): 📷 Cámara / 🖼 Galería, recorte automático a cuadrado centrado, vista previa antes de confirmar. Opcional. Se muestra en el círculo de la hero card.
- **Firma en modal fullscreen** (`CanvasFirma.tsx`, prop `modal`): canvas vertical 480×680 con Atrás/Repetir/Aceptar, reemplaza el canvas horizontal chico inline.
- **Firma y huella opcionales** al registrar/editar — visibles en ambos flujos (antes solo en registro), con pre-carga si ya existían.
- **Documento imprimible de autorización de datos** (`generarHTMLAutorizacionDatos()` en useDocumentos.ts): lista dinámica de categorías de datos autorizados según lo que el cliente realmente tenga capturado (foto, cédula, recibo, hoja de vida, antecedentes, licencia, huella, firma).
- **Un solo "Recibo público"** como requisito — se eliminó `recibo2` de `DocumentoFlags` en todo el código.
- **Acompañante no repite recibo si vive con el cliente** — columna `mismo_domicilio_acompanante`. Si "Sí": el checklist del acompañante solo pide cédula.

## Bug real corregido de paso

`guardarEdicion()` en ClientesView nunca subía a Storage la firma/huella si se volvían a capturar al editar un cliente existente — guardaba el `data:` URL crudo directo en la BD (solo funcionaba bien al crear cliente nuevo). Corregido con el mismo patrón de subida que usa la creación.

## Migraciones pendientes de confirmar (dadas al usuario, no confirmadas aún)

```sql
alter table public.clientes add column if not exists foto_perfil_url text;
alter table public.clientes add column if not exists mismo_domicilio_acompanante boolean default false;
```

## Corrección de documentación

CLAUDE.md decía que el acompañante requería antecedentes judiciales — el código nunca lo exigió. El usuario confirmó que se quitó ese requisito en una sesión anterior sin quedar documentado. Ya corregido: acompañante solo requiere cédula + recibo (o solo cédula si vive con el cliente).

## Pendiente de probar en navegador con login real
- Registrar/editar cliente con foto de perfil + firma (modal vertical) + huella
- "Ver ficha completa" → tab Documentos: miniaturas, botón imprimir, ambas migraciones aplicadas
- Selector "¿Vive en la misma dirección?" de punta a punta
