# Delegación de funciones — quién hace qué

Para que el sistema opere solo después del lunes, cada proceso tiene un responsable claro. Esta tabla evita el "¿y esto quién lo hace?" que frena la operación.

**Roles:** AP = Administrador Principal (Fredy) · ADM = Administrador (Sergio) · SEC = Secretaria (Ángela) · SUB = Cobrador/Subadmin (Emiro/otros) · MEC = Mecánico · SOC = Socio.

| Proceso / acción | AP | ADM | SEC | SUB | MEC | SOC |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Registrar cliente nuevo + documentos | ✔ | ✔ | **✔** | — | — | — |
| Hacer visita domiciliaria | — | ✔ | — | **✔** | — | — |
| Aprobar/rechazar visita y cliente | ✔ | **✔** | — | — | — | — |
| Crear contrato (wizard) + asignar moto | ✔ | **✔** | — | — | — | — |
| Asignar motos a un cobrador | **✔** | ✔ | — | — | — | — |
| Registrar pago EN EFECTIVO (oficina) | — | — | **✔** | — | — | — |
| Cobrar en la calle (cobro en campo) | ✔ | ✔ | — | **✔** | — | — |
| Confirmar transferencia / cobro de campo | ✔ | ✔ | **✔** | — | — | — |
| Gestionar mora (mensaje/llamada/sirena) | ✔ | ✔ | — | **✔** | — | — |
| Recolectar una moto (con evidencia) | ✔ | ✔ | — | **✔** | — | — |
| Otorgar plazo extra en mora | ✔ | **✔** | — | ✔ | — | — |
| Crear convenio de pago | ✔ | ✔ | **✔** | — | — | — |
| Devolver moto retenida (al pagar) | ✔ | ✔ | — | **✔** | — | — |
| Iniciar liquidación / cerrar contrato | ✔ | **✔** | — | inicia | — | — |
| Resolver tiempo fuera de servicio (cobrar/rodar) | **✔** | ✔ | — | — | — | — |
| Ingresar/gestionar taller | — | ✔ | — | — | **✔** | — |
| Cerrar la caja diaria | ✔ | ✔ | **✔** | — | — | — |
| Completar migración/empalme (con cliente) | ✔ | ✔ | **✔** | — | — | — |
| Editar contrato / corregir cifras | **✔** | ✔ | — | — | — | — |
| Eliminar un pago | **✔** | — | — | — | — | — |
| Crear usuarios / cambiar accesos | **✔** | — | — | — | — | — |
| Ver dashboard de su grupo (solo lectura) | — | — | — | — | — | **✔** |

> **Negrita** = responsable principal. ✔ = puede hacerlo. "inicia" = puede iniciar pero no cerrar.

## Reglas de control (por qué está repartido así)
- **La secretaria maneja la caja, el administrador maneja la operación.** Quien decide sobre las motos no toca el efectivo de la oficina → control cruzado.
- **Todo cobro de campo pasa por dos manos:** el cobrador registra (con GPS/foto), la secretaria confirma al recibir el efectivo.
- **Solo el Administrador Principal** elimina pagos y cambia accesos → nada sensible se hace sin dejar rastro.
- **El cobrador solo ve lo suyo** → cada quien responde por sus motos.

## Cadena de escalamiento (a quién acudir)
1. Duda operativa del día → Administrador (Sergio).
2. Problema de accesos, cifras a corregir, o algo que no cuadra en el dinero → Administrador Principal (Fredy).
3. Falla del sistema (algo no funciona, error en pantalla) → registrar el caso y avisar al soporte técnico; mientras tanto, resolver ese caso a mano y seguir operando (no frenar todo).
