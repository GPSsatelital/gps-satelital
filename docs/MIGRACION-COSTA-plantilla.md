# Migración COSTA — plantilla de siembra (lista para disparar)

**Estrategia (ya decidida):** *siembra mínima* + empalme abierto. No se hace la migración grande desde Excel. Se crea cliente + moto + contrato con las cifras en cero y **empalme abierto**; el ahorro/deuda de apertura se completan **con el cliente presente** en el primer cobro, desde el Panel de Empalme. Así COSTA opera desde el día 1 sin frenar nada.

---

## 1) Datos mínimos por cliente (esto es lo que hay que recoger)

Para que la moto/contrato existan y la cartera funcione el lunes, por **cada cliente** de COSTA:

| Dato | Ejemplo | Obligatorio |
|---|---|---|
| Placa | `IGC70I` | ✅ |
| Nombre completo | `JUAN PEREZ` | ✅ |
| Cédula | `1047...` | ✅ |
| Teléfono / WhatsApp | `3001234567` | ✅ |
| Forma de pago | `Semanal` / `Quincenal` / `Mensual` | ✅ |
| Día(s) de pago | Semanal: `Lunes`/`Miércoles` · Quincenal: `5 y 20` · Mensual: `15` | ✅ |
| Tarifa L-S y domingo | `27000` / `14000` | ✅ |
| Ahorro L-S y domingo | `4000` / `2000` | ✅ |
| Meses (plazo total) | `12` | ✅ |
| Fecha de entrega | `2025-11-10` | ✅ |
| Ahorro acumulado al corte | `380000` | ⚪ (va en el empalme, puede quedar 0 e ir con el cliente) |
| Deuda actual | `120000` | ⚪ (idem) |
| Saldo a favor | `0` | ⚪ |

> Las 4 últimas (ahorro/deuda/saldo) **NO son obligatorias para sembrar** — nacen en cero y se completan en el Panel de Empalme con el cliente delante. Los 10 primeros SÍ hacen falta.

---

## 2) Lo que necesito de ti para finalizar (2 cosas)

1. **La fecha de corte de COSTA** = su día de pago vigente (el punto desde el que arranca el conteo). Ej. si COSTA paga los lunes y arranca el lunes 27-jul → corte `2026-07-27`.
   - Con eso agrego COSTA a `CORTE_POR_GRUPO` (`motogestion/src/hooks/useContratos.ts`) y a la lógica de la mig 047, igual que PRADERA (1-jul) y RASTREADOR (6-jul).
2. **El Excel / listado** con los datos de arriba. Con eso genero el SQL real en bloque (formato `rastreador.sql`) y lo revisamos antes de correrlo.

---

## 3) Plantilla SQL de siembra (una por cliente — rellenar y repetir)

> Correr **todo el bloque de una sola vez** (`BEGIN … COMMIT` en una ejecución) en Supabase → SQL Editor. Reemplazar `<...>`. `<CORTE_COSTA>` es la fecha del punto 2.1.

```sql
begin;

-- ===== CLIENTE =====
with c as (
  insert into public.clientes
    (nombre, cedula, telefono, whatsapp, mismo_whatsapp, direccion,
     ruta_contrato, ingreso_inicial, estado)
  values
    ('<NOMBRE>', '<CEDULA>', '<TEL>', '<TEL>', true, '<DIRECCION>',
     'tiempo_definido', 0, 'Activo')
  returning id
),
-- ===== MOTO (grupo COSTA) =====
m as (
  insert into public.motos
    (placa, grupo, estado, condicion_ingreso, ubicacion_fisica)
  values
    ('<PLACA>', 'COSTA', 'Asignada', 'usada', 'con_cliente')
  returning id
)
-- ===== CONTRATO (empalme abierto, motor de cajas v2) =====
insert into public.contratos
  (cliente_id, moto_id, forma_pago, dia_pago, dias_pago_mes,
   valor_semanal, tarifa_diaria, tarifa_domingo, ahorro_diario, ahorro_domingo,
   meses, fecha_entrega, fecha_fin_contrato, tipo_ruta, estado,
   es_migrado, base_inicial, base_completada, ahorro_inicial,
   ahorro_apertura, ahorro_acumulado, empalme_cerrado,
   motor_v2, total_cajas, fecha_inicio_cajas, cajas_previas, cajas_pagadas,
   caja_actual_pagado, prorrateo_total, prorrateo_pagado, prorrateo_ahorro,
   ubicacion_moto_validada)
select
   c.id, m.id, '<FORMA_PAGO>', '<DIA_PAGO>', <DIAS_PAGO_MES_o_null>,
   <VALOR_SEMANAL>, <TARIFA_LS>, <TARIFA_DOM>, <AHORRO_LS>, <AHORRO_DOM>,
   <MESES>, '<FECHA_ENTREGA>', ('<FECHA_ENTREGA>'::date + <MESES>*30), 'tiempo_definido', 'Activo',
   true, 510000, false, 0,
   0, 0, false,                              -- ahorro_apertura=0, ahorro_acumulado=0, empalme ABIERTO
   true, <TOTAL_CAJAS>, '<CORTE_COSTA>', 0, 0, -- motor v2; cajas arrancan en el corte (previas=0 = simple)
   0, 0, 0, 0,
   true                                      -- ubicacion_moto_validada=true: es migrado, NO pide validar guardado
from c, m;

commit;
```

**Notas de los campos calculados:**
- `valor_semanal` = `6*(tarifa_ls + ahorro_ls) + (tarifa_dom + ahorro_dom)` — SIEMPRE el semanal base, aunque sea Quincenal/Mensual (el sistema calcula el total).
- `dias_pago_mes`: Semanal → `null` · Quincenal → `array[5,20]` · Mensual → `array[15]`.
- `total_cajas` (calendario real): Semanal → `round(meses*365/12/7)` (12m ≈ 52) · Quincenal → `meses*2` · Mensual → `meses`.
- `cajas_previas = 0` (siembra mínima simple): el cliente arranca "al día" desde el corte; lo consumido antes vive en el ahorro/deuda de apertura del empalme. *(Si quieres reflejar las semanas ya consumidas en el contador "va X de N", se calcula cajas_previas = cuotas entre la entrega y el corte — lo afinamos al generar el SQL real.)*
- `ubicacion_moto_validada = true`: los sembrados NO deben pedir la validación de "dónde se guarda la moto" (esa es para entregas nuevas). Igual criterio que el backfill de la mig 060.

---

## 4) Después de sembrar (el empalme, con el cliente)

Cada contrato queda con badge **⚠️ Empalme** en Cartera/Panel Hoy. En el **primer cobro**, con el cliente presente, en el detalle del contrato → **Panel de Empalme**:
1. Revisar/editar el **ahorro de apertura** (lo que traía) y registrar la **deuda de apertura** real.
2. Marcar los checks: deuda revisada · ahorro revisado · teléfono/cédula verificados.
3. Capturar la **autorización de datos** (firma + huella) si falta.
4. **Confirmar migración** (ADMIN/AP/SECRETARIA) → consolida el ahorro, cierra el empalme, quita el badge.

Detalle del mecanismo en la memoria `empalme-migracion-construido` y en `CLAUDE.md` (§ "PLAN EMPALME/MIGRACIÓN").
