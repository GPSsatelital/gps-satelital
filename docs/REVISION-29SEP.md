# Revisión del 29-sep-2026 (tanda 1: solo medir)

Pedido del dueño: revisar todo lo pendiente "bien hecho, no importa si te demoras". Tanda 1 = medir
y dejar cada tema listo para decidir; tanda 2 = decidir uno por uno y arreglar lo aprobado.
Reportes (Excel/PDF, bloque 2) y la nómina están en `docs/AUDITORIA-REPORTES.md`.

---

## MELISSA BELLO (LIQ-0056) — la cuenta peso a peso

**Lo que pasó:** contrato quincenal (días 10 y 25), base $743.000. Entregó $404.000 el 3-sep; el resto
($339.000) quedó en el acuerdo de base. Devolvió la moto el **11-sep** (entrega voluntaria, a bodega).
La liquidación del 14-sep le cobró el acuerdo de base entero y cerró en **−$174.000**, con deuda y
lista negra.

**Con la regla D-023** (al que se va antes no se le cobra la base que no puso), el acuerdo no se cobra.
Recalculado con el código de hoy y la fecha real de entrega (11-sep):

| | Monto |
|---|---|
| Pagó (todo fue a su primera quincena) | $404.000 |
| Días que tuvo la moto (del 3 al 11 de sep, 9 días), a precio de día | $264.000 |
| — de eso, tarifa de la empresa | $230.000 |
| — de eso, ahorro suyo | $34.000 |
| **Pagó y no alcanzó a usar** | **$140.000** |
| Ahorro que el sistema le reconoce | $25.000 |
| **Lo que da la fórmula de hoy** | **+$165.000 a su favor** |
| **Lo exacto (todo lo que no es tarifa de la empresa es suyo): $404.000 − $230.000** | **+$174.000 a su favor** |

- **¿Se cuenta dos veces el ahorro?** No. Pasa lo contrario: cuando el cliente se va habiendo pagado
  por adelantado, la fórmula le devuelve el ahorro que anotó el libro ($25.000) y no el ahorro de los
  días que de verdad usó ($34.000). Le quedan debiendo $9.000. Hay que medir si le pasa a otras
  liquidaciones antes de tocar la fórmula.
- Revisado y descartado: el primer día de pago (10-sep) aparece en el prorrateo y en la primera
  quincena, pero eso compensa el día de la entrega, que no se cobra. Suman exactamente los 9 días que
  tuvo la moto. No hay cobro de más.
- **Si se corrige:** su liquidación pasa de −$174.000 a **+$174.000** (o +$165.000 con la fórmula de hoy);
  se anula la deuda de $174.000, sale de lista negra y la empresa le debe esa plata. Método JORDAN/
  RICARDO: SQL con guardas, pegado por el dueño.

---

## Los 6 clientes "en mora" con 0 días (antes: "el caso de YHAN")

No es uno solo. Hoy son 6, y los 6 deben **solo cuotas del acuerdo** (la semana al día, sin deudas):

| Cliente | Placa | Debe del acuerdo |
|---|---|---|
| REINEL CASTRO GARCIA | XYZ53H | $280.000 |
| EMILIANO CASTELLANOS SALAS | YAW72H | $124.000 |
| YHAN CARLOS MIRANDA RODRIGUEZ | YAL55H | $84.000 |
| JESUS MALDONADO RODRIGUEZ | YAL64H | $80.000 |
| DEIMER BERRIO | RMZ61H | $40.000 |
| NORMA GELIS OCHOA | YAW70H | $2.000 |

**La causa:** el estado ("en mora") sí mira el acuerdo, pero el contador de días solo mira las semanas.
Resultado: salen en mora con 0 días y **nunca llegan a recolección**, deban lo que deban.
**Por decidir con el dueño:** ¿los días de mora cuentan también desde la cuota del acuerdo vencida?
Si sí, entran al protocolo como cualquiera (y NORMA entraría a recolección por $2.000: ¿hay un mínimo?).

---

## Saldos a favor — dónde se ven hoy y cuánto hay (medido el 29-sep)

**Cuánto hay:** 95 clientes tienen saldo a favor, **$5.157.702** en total (34 con menos de $10.000,
29 entre $10.000 y $50.000, 23 entre $50.000 y $200.000, 9 con más de $200.000).
- **70 deben algo hoy** y tienen saldo: aplicándolo se cubrirían **$3.483.202** de lo que deben.
- **10 están en la cola de recolección** teniendo plata a favor (ej. VICTOR BANQUEZ RLZ86H: $266.000 a
  favor, debe $390.000).
- **5 quedarían al día solo con su saldo** (ej. JAIME ANDRES ACEVEDO RMY88H: $265.500 a favor, debe
  $195.000, sale en gabela; YEANPIER CHIRINOS DPU50I: $246.000 a favor, debe $68.000).

**Dónde se ve hoy:** solo al abrir el detalle del cliente en Cartera (recuadro "Saldo a favor" con el
botón "Aplicar a lo que debe", y la línea "Además tiene $X a favor, sin usar"). También en liquidación,
cesión, editar contrato, historial de pagos y la vitrina de ZALA.
**Dónde NO se ve:** la lista de Cartera, las tarjetas del panel Hoy (donde trabaja el cobrador), Mi Día,
Cobro Diario y la ficha del cliente.

**La regla que no cambia (del dueño):** el saldo a favor se MUESTRA, nunca se resta solo; se aplica a
mano. La propuesta es de visibilidad, no de aplicarlo automáticamente.

---

## Hallazgo nuevo (29-sep): tiempo rodado registrado dos veces

De 73 registros de `acuerdos_tiempo_rodado`, **7 rangos quedaron repetidos**, con 1 a 4 minutos de
diferencia (el mismo botón dos veces):
- 6 son "cobrar ahora" en contratos con motor, que ya no crean deuda: solo queda el registro repetido
  (YAL54H ×3, IEW62I, XZI06H —además tiene un "rodar" del mismo rango—, RMY53H, RMZ63H, IGC56I).
- 🔴 **JESUS RAFAEL QUIÑONEZ (RMU62H):** rodado DOS veces por el mismo tiempo (23-ago al 18-sep): a las
  16:01 `cajas_exoneradas` 0 → 3 y a las 16:04 3 → 6 (y la fecha de fin corrida dos veces). Debían ser 3.
  Hoy sale al día debiendo $140.000; con 3 rodadas debería ~3 semanas más (~$606.000). La plata no se
  pierde (se correría al final), pero hoy se le deja de cobrar.
- **Falta un candado:** el registro de rodar tiempo no impide repetir el mismo rango (mismo caso que la
  devolución de base, mig 172).

---

## Tanda 2 — decisiones del dueño (29-sep)

1. **MELISSA BELLO:** primero el taller confirma si la moto RMZ65H tuvo daños y cierra la orden (abierta
   desde el 14-sep); después se corrige su liquidación a **+$165.000 menos los daños, si hubo** (la
   fórmula del ahorro, los $9.000, se mide aparte).
2. **Moto guardada sin moto prestada (REGINALDO IEW53I):** **no entra a recolección.** Sigue en mora y
   con mensajes y llamadas; se le sigue cobrando.
3. **Mora solo por el acuerdo (los 6):** los días de mora **cuentan desde la cuota del acuerdo más vieja
   sin pagar**, y a recolección **solo si debe al menos una cuota completa del acuerdo**.
4. **Nómina y tiempo rodado:** pendiente de respuesta (opción A "como estaba ese día" recomendada).
