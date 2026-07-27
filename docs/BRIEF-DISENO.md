# Brief de diseño — MotoGestión / Club de Moteros

> **Para quién es este documento:** para una herramienta o diseñador que va a trabajar la
> identidad de marca, piezas gráficas y propuestas de interfaz **fuera** del código del sistema.
> Está escrito para que lo que se produzca allá **se pueda integrar aquí sin reescribirlo**.
>
> Léelo completo antes de proponer nada. La sección **"Reglas para que el trabajo sea
> integrable"** no es opcional: si no se respeta, el resultado no sirve por bonito que sea.

---

## 1. La empresa

**Club de Moteros** — Cartagena de Indias, Colombia. Arriendo de motos a conductores que
trabajan con ellas (domicilios, mototaxi, mensajería). No es venta ni leasing: el cliente **paga
por usar la moto** y, según la modalidad, va acumulando un ahorro que puede terminar en la
propiedad del vehículo.

- **Fundador y arrendador legal:** Fredy Mora Avendaño
- **Operación:** Cartagena y corregimientos (prohibido circular fuera de la ciudad)
- **Flota:** ~266 motos · **Meta: 1.000**
- **Clientes activos:** ~269

### Los cuatro portafolios
La flota no es de un solo dueño. Está dividida en **cuatro grupos de inversión independientes**,
cada uno con sus propias cuentas, recaudo y reportes:

| Grupo | Dueño |
|---|---|
| `RASTREADOR` | El fundador (portafolio personal) |
| `COSTA` | Socio 2 |
| `PRADERA` | Socio 3 |
| `USADAS` | El club (motos usadas) |

**Esto importa para el diseño:** cada grupo tiene un color asignado y aparece por todas partes.
Un informe mal atribuido es plata mal repartida entre socios.

### El principio rector del negocio
> **La moto nunca debe dejar de producir.**

Todo el sistema gira alrededor de eso: si una moto está parada (taller, fiscalía, mora,
retención), hay un flujo para resolverlo rápido.

---

## 2. El producto

**MotoGestión** es la aplicación web que reemplazó el papel y las cuentas a mano. Cubre el
negocio completo: ingreso del cliente, contrato, entrega de la moto, cobro diario, mora,
retención, taller, liquidación y reportes a los socios.

- **Se usa en el celular** la mayor parte del tiempo (cobradores en la calle) y en computador en
  la oficina.
- **Arranca en operación real el lunes 27 de julio de 2026.**
- Es una herramienta de **trabajo denso**, no una app de consumo: pantallas con muchos datos,
  listas largas, plata en cada fila. La prioridad es **leer rápido y no equivocarse**, no
  impresionar.

---

## 3. Quién la usa y qué hace cada uno

Esto define el tono de cada pieza: no es lo mismo hablarle a un socio inversionista que a un
cobrador en moto bajo el sol.

| Rol | Quién es | Qué hace en el sistema |
|---|---|---|
| **ADMIN_PRINCIPAL** | El fundador | Ve y puede todo. Decide excepciones. |
| **ADMIN** | Encargado de toda la operación (una persona) | Todo lo operativo. **No registra efectivo.** |
| **SUBADMIN** | Admin junior, hasta 4 personas | **Solo ve las motos que tiene asignadas.** Cobra en la calle, persigue mora, recolecta. No registra efectivo ni clientes. |
| **SECRETARIA** | Auxiliar contable en la oficina | **La única que registra efectivo.** Confirma transferencias, cierra la caja del día. |
| **MECANICO** | Mecánico del taller | Solo el módulo de taller. |
| **SOCIO** | Los 3 socios inversionistas | Solo lectura del panel de su grupo. |

### El día a día, en una frase por rol
- **La secretaria** abre la caja, recibe pagos en efectivo, confirma las transferencias que
  reportan los cobradores, y al final del día cuadra y cierra la caja **de cada grupo por
  separado**.
- **El cobrador (subadmin)** sale con una lista de a quién le toca pagar hoy y a quién hay que
  perseguir. Cobra, toma foto del comprobante, y entrega la plata a la secretaria.
- **El admin** vigila la mora, autoriza recolecciones, decide convenios y liquidaciones.
- **El socio** entra a ver cuánto produjo su portafolio.

---

## 4. La identidad visual que YA existe (no se reemplaza, se extiende)

El sistema ya tiene una identidad definida y en uso. **No es un lienzo en blanco.** Lo que se
diseñe debe convivir con esto.

### 4.1 La firma: la placa amarilla
El elemento que hace la app inconfundible es que **toda placa de moto se muestra como una placa
colombiana real**: fondo amarillo, letras negras gruesas, borde negro.

```
Amarillo:  #FFD100     (fijo — NO cambia en modo noche)
Letras:    #111111
Borde:     2px sólido #111111
Peso:      900
Sombra interior: inset 0 -2px 0 rgba(0,0,0,0.22)
```

Es el punto cálido que guía el ojo en una pantalla llena de datos. **Cualquier pieza de marca
debería conversar con ese amarillo**, no pelear con él.

### 4.2 Paleta

**Modo día**
```
Fondo página     #f1f5f9      Texto           #0f172a
Tarjetas         #ffffff      Texto tenue     #64748b
Superficie oscura#0f172a      Líneas          #e2e8f0
Acento (cian)    #0284c7      Acento fuerte   #38bdf8
Verde (bien)     #16a34a      Rojo (mora)     #dc2626
Ámbar (alerta)   #d97706      Violeta         #7c3aed
```

**Modo noche** (la app tiene los dos, y el nocturno es el que más se usa en la calle)
```
Tarjetas         #1b2a45      Texto           #ecf2fb
Superficie suave #222f4e      Texto tenue     #90a4c2
Acento (cian)    #38bdf8      Líneas          #33456a
```

**Colores de los cuatro portafolios** (aparecen en informes, caja y fichas):
COSTA = cian · PRADERA = verde · RASTREADOR = ámbar · USADAS = violeta

### 4.3 Tipografía
- **Interfaz:** Inter. Números con `tabular-nums` (la plata tiene que alinearse en columnas).
- **Documentos impresos** (recibos, contratos, liquidaciones): Arial, a propósito.
- **Escala fija:** 22 / 18 / 15 / 13 / 12 / 11 px. Pesos 400/500/600/700. Nada de 800/900
  (excepto la placa, que es 900 por diseño).

### 4.4 Espaciado y movimiento
- Grilla de **4px** (4/8/12/16/24). No valores sueltos.
- Animación con **restraint**. El exceso de movimiento hace que se vea "generado por máquina".

---

## 5. Qué se necesita diseñar

### Prioridad 1 — Marca
1. **Logo de Club de Moteros.** Hoy **no existe**. Debe funcionar en:
   - la esquina superior de la app (espacio reducido, sobre navy oscuro)
   - los recibos impresos en papel térmico de 80 mm, **en blanco y negro puro**
   - documentos legales (contrato, pagaré, paz y salvo)
   - versión mínima (favicon / ícono de la app en el celular)
2. **Marca de agua** para documentos legales impresos: contrato, pagaré, liquidación, paz y
   salvo. Debe leerse el texto por encima sin estorbar.
3. **Aplicación de marca**: cómo se ve el encabezado del recibo térmico, del contrato y de una
   presentación.

### Prioridad 2 — Piezas de comunicación
4. **Plantilla de presentación** (para socios y para capacitación), coherente con la app.
5. **Diplomas / certificados** de capacitación para los funcionarios (opcional pero suma).

### Prioridad 3 — Propuestas de interfaz
6. Mejoras visuales a pantallas existentes. **Ver restricciones en la sección 6.**

---

## 6. Reglas para que el trabajo sea INTEGRABLE

> Esta es la sección que decide si el trabajo sirve o hay que rehacerlo. El sistema tiene
> convenciones técnicas fijas y **no van a cambiar** para acomodar una propuesta.

### 6.1 Lo que NUNCA se puede tocar
- **La estructura funcional**: flujos, navegación, lógica de negocio, fórmulas de dinero,
  permisos por rol. El diseño es sobre lo visual, nunca sobre cómo funciona el negocio.
- **La placa amarilla** como firma. Se puede refinar, no reemplazar.
- **Modo día y modo noche**: toda propuesta debe funcionar en los dos.
- **375 px de ancho** es el tamaño de referencia obligatorio. Si no se ve bien ahí, no sirve.

### 6.2 Convenciones técnicas del código (críticas para poder pegar el trabajo)
El sistema está hecho en **React + TypeScript**, y usa:

- **Estilos en línea puros** — `style={{ }}`. **CERO Tailwind, MUI, Bootstrap o cualquier
  framework de CSS.** Una propuesta entregada en Tailwind hay que traducirla entera a mano.
- **Colores por variable CSS**, nunca escritos a mano: `var(--accent)`, `var(--bad-ink)`,
  `var(--card)`. Escribir `#0284c7` directo rompe el modo noche.
- **Componentes existentes que se deben reutilizar** en vez de dibujar equivalentes:
  - `<Placa placa="ABC12D" size="sm|md|lg" />` — toda placa
  - `<ListBox>` + `<ItemLista>` — toda lista (recuadro con scroll propio + fila estándar)
  - `<Btn>`, `<Badge>`, `<Chip>` — botones, etiquetas de estado y filtros
  - Estilos compartidos: `card`, `inputStyle`, `primaryBtn`, `secondaryBtn`
- **Movimiento** con `framer-motion` (ya instalado).

### 6.3 Cómo entregar para que se pueda empalmar
Ordenado de más a menos útil:

1. **Especificación en texto + imagen de referencia.** Colores por su variable, medidas en px de
   la grilla de 4, tipografía por tamaño y peso, y los ocho estados de cada componente
   (normal, hover, activo, deshabilitado, cargando, vacío, error, foco).
2. **Assets exportados**: logo en SVG (y PNG a 512 px), marca de agua en PNG con transparencia,
   favicon.
3. **HTML/CSS de referencia** — sirve como guía visual, pero **se va a traducir a estilos en
   línea**. No entregar componentes de React con clases de Tailwind esperando que se peguen.

**Regla práctica:** entre una maqueta preciosa en un framework ajeno y una especificación clara
en texto, **la especificación vale más**, porque es la que sí se puede aplicar.

---

## 7. Atajos y advertencias (lo que ya aprendimos construyéndolo)

Esto ahorra vueltas. Son cosas que ya nos costaron tiempo:

1. **Las herramientas de diseño genéricas van a proponer cosas que no aplican.** Algunas
   "prohíben Inter" o piden mucho aire entre elementos. Esta es una **app operativa densa**: el
   funcionario necesita ver 20 filas de un vistazo, no 6 tarjetas espaciosas. Ignorar cualquier
   consejo que contradiga la identidad de arriba.
2. **El modo noche es el caso principal, no el secundario.** Se usa en la calle, de noche, con
   brillo alto. Todo debe probarse ahí primero.
3. **La plata manda en la jerarquía.** En cualquier fila, el monto es lo que el ojo debe
   encontrar primero, después el nombre, después el resto. Números siempre alineados.
4. **El recibo térmico es blanco y negro puro, sin grises.** Los grises salen borrosos en papel
   térmico. Cualquier logo debe tener una versión de línea sólida que aguante eso.
5. **Los nombres de personas van en mayúsculas** en toda la interfaz. Es convención del sistema.
6. **Bug recurrente de maquetación:** un elemento dentro de una fila flexible se desborda si no
   lleva `minWidth: 0`. Nos pasó tres veces. Si una propuesta tiene columnas, avisarlo.
7. **Verificar a 375 px con medición real**, no a ojo en una captura: la densidad de pantalla del
   dispositivo puede engañar.

---

## 8. Lo que ya está hecho (no rehacer)

En `docs/` del repositorio ya existen:
- **4 manuales en Word**, uno por rol (Admin, Subadmin, Secretaria, Mecánico)
- **4 presentaciones**: socialización a empleados, plan de trabajo/go-live, capacitación
  operativa (41 láminas) y guías rápidas por rol
- Todo se genera desde `docs/presentaciones/_generadores/` — el contenido vive en un archivo
  de datos, así que **rediseñar la plantilla no obliga a reescribir el contenido**.

**Lo que NO existe y hace falta:** el logo, la marca de agua, y la presentación de **entrega**
(la que se le muestra al dueño y a los socios, distinta de la de capacitación).

---

## 9. Cómo se mide que el trabajo quedó bien

- ¿Funciona en modo día **y** noche?
- ¿Se ve bien a 375 px de ancho?
- ¿El logo sobrevive impreso en blanco y negro a 80 mm?
- ¿Conversa con el amarillo de la placa en vez de pelear con él?
- ¿La especificación permite aplicarlo con estilos en línea y variables CSS, sin traducir un
  framework entero?
- Y la prueba final: **si se le quita el nombre a la pieza, ¿se reconoce que es de esta
  empresa?** Si podría ser de cualquier otra, falta trabajo.
