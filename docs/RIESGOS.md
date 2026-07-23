# Registro de riesgos — go-live y operación

Como arquitecto, estos son los problemas que PUEDEN presentarse, ordenados por impacto, con su mitigación (cómo lo prevenimos) y su plan B (qué hacemos si pasa igual).

**P** = Probabilidad · **I** = Impacto. (A=Alto, M=Medio, B=Bajo)

## Riesgos de PERSONAS (el mayor riesgo real)

| # | Riesgo | P | I | Mitigación | Plan B |
|---|--------|---|---|------------|--------|
| R1 | Los funcionarios no saben usar el sistema el lunes | A | A | Manuales por rol + ensayo el domingo con cada uno haciendo un caso real | Acompañamiento en caliente el lunes; una persona guía a las demás |
| R2 | Alguien registra mal un pago (monto/cliente equivocado) | M | A | Ventana de confirmación + aviso de duplicado + recibo que se revisa | AP elimina el pago (queda rastro) y se re-registra |
| R3 | Resistencia al cambio ("antes era en papel") | M | M | Mostrar que el sistema les ahorra trabajo (reparto automático, recibos) | Convivencia papel+sistema los primeros días, migrando gradual |

## Riesgos de DATOS

| # | Riesgo | P | I | Mitigación | Plan B |
|---|--------|---|---|------------|--------|
| R4 | Cifra de COSTA migrada mal (ahorro/deuda) | B | M | Siembra mínima + empalme: las cifras se cargan CON el cliente presente, no a ciegas | Modal Editar Contrato corrige con auditoría; empalme abierto permite ajustar |
| R5 | Falsa mora / deuda fantasma (bugs viejos) | B | A | Ya corregidos (semana calendario, deuda que no bajaba, prorrateo migrados); motor de cajas en la BD | Verificar el caso puntual; corregir cifra si hace falta |
| R6 | Un cliente pierde su ahorro por un error | B | A | El ahorro se entrega al llenar la caja; reversas des-llenan en orden; nadie pierde ahorro como castigo | Reconstruir desde el historial de pagos (todo queda registrado) |

## Riesgos TÉCNICOS

| # | Riesgo | P | I | Mitigación | Plan B |
|---|--------|---|---|------------|--------|
| R7 | Una migración SQL no está corrida en Supabase | M | A | Verificar TODAS antes del viernes (B2), sobre todo la 045 (motor de cajas) | Correrla en el momento; el bloque completo de una sola ejecución |
| R8 | Deploy roto / pantalla en blanco tras un cambio | B | M | No desplegar cambios grandes el fin de semana; auto-aviso de versión nueva | Ctrl+Shift+R; si es grave, rollback de Vercel al deploy anterior (1 clic) |
| R9 | Flujo construido-sin-probar falla en real (recolección, liquidación, préstamo) | M | M | Probarlos en navegador con login antes del lunes (B5) | Resolver ese caso a mano y avisar para fix en caliente; no frena el resto |
| R10 | Varios cobrando a la vez se pisan (carrera) | B | A | El reparto de pagos vive en la BD (RPC/trigger), fuente única — ya resuelto de arquitectura | — |
| R11 | Impresora o lector de huella fallan | M | B | Ambos son opcionales para operar | Recibo por WhatsApp; la huella no bloquea el registro |
| R12 | Se pierde internet (el sistema depende de la nube) | M | A | — | Cobrar en papel mientras vuelve; registrar en el sistema al reconectar |

## Riesgos OPERATIVOS

| # | Riesgo | P | I | Mitigación | Plan B |
|---|--------|---|---|------------|--------|
| R13 | Un proceso nuevo (caso raro) no está contemplado y frena la atención | M | M | Catálogo de procesos cubre los casos conocidos; regla: no frenar todo por un caso | Resolver ese caso a mano, anotarlo, y agregarlo al backlog para construirlo después |
| R14 | Permisos mal configurados: alguien ve/hace lo que no debe | B | M | Dos capas (frontend + RLS en BD); probar con cada login (B4) | AP ajusta permisos por persona en el momento |
| R15 | La caja no cuadra al cierre | M | M | Cierre por grupo + resumen por funcionario; confirmar transferencias/campo antes de cerrar | Revisar los pagos "sin confirmar" del día; el historial muestra cada movimiento |

## Principio rector ante cualquier problema
> **La operación no se detiene por un caso puntual.** Si algo falla, se resuelve ESE caso a mano (papel), se registra, y se sigue atendiendo. Lo que falló se anota en el backlog y se corrige después — nunca se frena todo el negocio por un proceso a medias.
