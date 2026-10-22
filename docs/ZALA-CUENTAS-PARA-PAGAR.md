# ZALA — las cuentas para pagar (21-oct-2026)

Para quien maneja ZALA. Dos cambios del lado de ZALA, después de que MotoGestión corra su
migración 200 (`zala.cuentas_pago`).

## El problema, medido en MotoGestión

1. **La protección contra celulares bloquea las cuentas Nequi de la empresa.** `/api/enviar`
   responde `fallo` con el motivo *"las variables llevan datos que no salen por WhatsApp:
   telefono: 3128317132"*. Un Nequi **es** un número de celular. Desde el 15-sep falló todo mensaje
   de cuentas (`cuentas_para_pagar_v1`) que lleva un solo Nequi:

   | Grupo | Cuenta | Fallos |
   |---|---|---|
   | PRADERA | Nequi 3009569084 | 2 (15-sep) |
   | RASTREADOR | Nequi 3044192404 | 5 (19-sep a 5-oct) |
   | COSTA | Nequi 3128317132 | 2 (16 y 21-oct) |

   Escribirlo con un espacio («312 8317132») también lo bloquea: parece que la protección quita
   todo lo que no es número antes de mirar. Los mensajes de COSTA con dos cuentas pasaban porque los
   dos números juntos dan 21 dígitos, que no parecen un celular. Desde el 9-oct COSTA tiene una
   sola cuenta encendida y también falla.

2. **ZALA no tenía de dónde leer las cuentas.** Ninguna vista de `zala` las traía y `zala_lector`
   no puede abrir `cuentas_bancarias`. Si un cliente escribe «mándeme el Nequi», ZALA contesta con
   una lista propia, que puede seguir teniendo la **Bancolombia de COSTA (78400006116), que el
   dueño apagó y ya no se le debe dar a nadie**.

## Lo que ya hizo MotoGestión: `zala.cuentas_pago` (mig 200)

Una fila por grupo, **solo con las cuentas encendidas** en Configuración → Cuentas bancarias.
Si el dueño apaga o enciende una cuenta allá, esta lista cambia en ese instante.

| Columna | Qué es |
|---|---|
| `grupo` | COSTA · PRADERA · RASTREADOR (USADAS no sale: no tiene cuenta) |
| `cuentas_texto` | El texto listo, igual al `{cuentas}` que manda la app: `Nequi ahorros 3128317132 (Yeiner acosta)` |
| `cuentas` | Cada cuenta por separado: banco, tipo, número, titular |
| `numeros` | Los números solo con dígitos: `{3128317132}` |

## Cambio 1 — que la protección deje pasar las cuentas de la empresa

Antes de rechazar un número con forma de celular en las variables, mirar si está en
`zala.cuentas_pago.numeros`. Si está, es una cuenta de la empresa y se deja pasar. Cualquier otro
celular se sigue bloqueando igual que hoy.

```sql
select distinct unnest(numeros) as numero from zala.cuentas_pago;
```

Comparar con los dígitos del número detectado (sin espacios, guiones ni puntos). Conviene leer la
lista en cada envío o refrescarla seguido: si el dueño apaga una cuenta, deja de ser de la empresa.

## Cambio 2 — las cuentas en la conversación salen solo de MotoGestión

Cuando un cliente pide las cuentas o «el Nequi», ZALA contesta con el `cuentas_texto` de la fila de
**su** grupo (`zala.cliente.grupo` de su contrato), y **borra cualquier lista de cuentas propia**.
Si su grupo no tiene fila, no tiene cuenta: que se comunique con la oficina. Nunca las cuentas de
otro grupo.

## Cómo probar que quedó bien

Desde MotoGestión, Cartera → un cliente de COSTA → enviar cuentas. Tiene que llegar, y en su
historial quedar «enviado». Repetir con uno de PRADERA y uno de RASTREADOR. En la base:

```sql
select created_at, mensaje_estado, mensaje_motivo, variables_usadas
  from public.gestiones_cobro
 where plantilla_usada = 'cuentas_para_pagar_v1'
 order by created_at desc
 limit 10;
```
