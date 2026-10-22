---
name: bateria-pruebas-ciclopago
description: "Batería de pruebas automáticas del motor de dinero (cicloPago) con Vitest — correr `npm test` antes de desplegar cambios de cálculo"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

**Existe una batería de pruebas del motor de dinero: `motogestion/src/utils/cicloPago.test.ts` (Vitest, instalado 16-jul).**

**Why:** el motor de cajas v2 es lo más complejo y sus bugs de fechas (gabela día-0, prorrateo prematuro, convenio doble, contratos nacidos mal) se venían descubriendo EN PRODUCCIÓN con clientes reales (JULIO, ESMEIRO, los 5 del camino viejo). El usuario preguntó "¿por qué siguen pasando estas cosas?" — la respuesta de fondo era la falta de pruebas automáticas.

**How to apply:**
- **Correr `npm test` (en `motogestion/`) ANTES de desplegar CUALQUIER cambio en `cicloPago.ts`** — y ojalá en cualquier cambio de cálculo de dinero. Son 21 pruebas, corren en <1s. Si algo falla, NO desplegar hasta arreglar.
- Comandos: `npm test` (corre una vez) · `npm run test:watch` (modo continuo).
- **Cada vez que se arregle un bug de dinero nuevo, agregar su caso como prueba** — así la red crece. Los casos son funciones puras de `cicloPago`, fáciles de testear: se arma un `ContratoCiclo` y se verifica el resultado en fechas concretas.
- Cubre hoy: prorrateoExigibleHoy, estadoCarteraV2 (secuencia día-pago→gabela→mora), cajasExigidasHasta, huecoCuotasHoy, valorPeriodoReal, calcularEstadoCartera con periodoCubierto. Fixtures reales: ESMEIRO (IGC50I), SERAFIN (IGC39I).
- Verificado que detecta regresiones: al reintroducir el bug del gabela día-0, la prueba falló correctamente.

Relacionado: [[fix-gabela-dia0-sin-commitear]] (los bugs que motivaron esto), [[libro-de-cajas-motor-v2]].
