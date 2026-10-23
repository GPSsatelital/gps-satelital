---
name: regla-jsx-funciones-anidadas
description: Bug recurrente de React en este proyecto — callbacks/funciones recreadas en cada render rompen inputs (pierden foco) o interacciones continuas (canvas de firma se corta)
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

Si una función que retorna JSX está definida DENTRO de otro componente (para compartir closure/estado) y contiene inputs de texto, nunca invocarla como `<NombreFuncion />` — siempre como `{NombreFuncion()}`.

**Why:** React trata cada render como un "tipo" de componente nuevo (la función se recrea), remonta el subárbol completo y el input pierde el foco tras cada tecla (en celular se cierra el teclado). Pasó con `DetallePanel` de MotosView y `PanelDetalle` de CobrosView (corregido 2 jul 2026, commit `b7f5a70`).

**How to apply:** al agregar inputs de texto a cualquiera de los otros ~8 casos del mismo patrón en el proyecto (ChipsGrupo, ListaContratos, TarjetaCliente, CardAlerta, PagoCard, etc.), cambiar la invocación a llamada directa antes de que aparezca el bug.

**Variante del mismo bug de fondo (3 jul 2026, `CanvasFirma.tsx`, commit `f3757b5`):** no es solo JSX-como-tag — cualquier `useEffect` que dependa de una prop-callback recreada en cada render del padre (ej. `onChange` inline que hace `setState`) se vuelve a ejecutar en medio de una interacción continua (trazo de firma, drag, etc.), perdiendo estado local capturado en closures del efecto (`drawing`). Síntoma: "escribo un poco y se corta, hasta que suelto y vuelvo a tocar". Fix: enganchar listeners en un efecto con `[]` (una sola vez) y leer el callback más reciente desde un `ref` (`onChangeRef.current = onChange` en cada render, usado dentro de los handlers). Aplica a cualquier componente con canvas/drag continuo que reciba un callback inline del padre.

**Tercer caso, el más caro (23-oct-2026, `40cbc6e`):** `<PanelDetalle />` en `ContratosView` desmontaba el detalle del
contrato en CADA render — y con él las ventanas que viven adentro. En medio del rodado de OMAR (RMM66H), al grabar el video
la ventana volvía sola a «1. La cuenta» y perdía firma y video: cualquier pago que entraba por tiempo real o volver de la
cámara redibujaba la pantalla. Reproducido con el código viejo (paso 2 → paso 1) y comprobado con el arreglo (se queda en
el paso 2). **No es solo para inputs: cualquier panel anidado que contenga una ventana con pasos/estado debe llamarse como
función.** Los `<ChipsGrupo />` que quedan (Motos, Clientes) son botones sin estado: no les pasa.
