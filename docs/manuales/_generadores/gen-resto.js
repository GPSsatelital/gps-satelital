const { H1, H2, P, step, bullet, info, warn, danger, ok, build } = require("./_manual-lib.js");
const DIR = "C:/Users/USER/Documents/GitHub/gps-satelital/docs/manuales/";

// ─────────────────────────── SUBADMIN (cobrador / admin jr) ───────────────────────────
const subadmin = [
  H1("1. Bienvenida"),
  P("Este manual te explica cómo usar el sistema en tu trabajo diario en la calle. Tú gestionas el día a día de LAS MOTOS QUE TIENES ASIGNADAS: cobras, haces las visitas que te asignan, y persigues la mora."),
  P("Lo más importante que debes saber:"),
  bullet("Solo ves y gestionas TUS motos asignadas. Es normal: no verás las de otros cobradores."),
  bullet("Tú NO registras pagos en la oficina, NO confirmas pagos, NO creas contratos y NO registras clientes. Eso es de la secretaria y el administrador."),
  bullet("Tú SÍ cobras en la calle (cobro en campo), haces las visitas asignadas y gestionas la mora de tus motos."),
  info("Si la lista te sale vacía", ["No es un error: si no tienes motos o visitas asignadas, no verás nada. El administrador te asigna las motos y las visitas."]),
  H2("Cómo entrar"),
  step(1, "Abre el programa en el navegador y entra con tu correo y contraseña."),
  step(2, "Si algo se ve raro tras un cambio, presiona Ctrl + Shift + R para refrescar."),

  H1("2. Hacer una visita asignada"),
  P("Antes de entregar una moto, hay que visitar al cliente en su casa. El administrador te asigna las visitas."),
  step(1, "Entra a «Clientes». Verás las visitas que te tocan."),
  step(2, "Abre la del cliente y toca «Registrar visita»."),
  step(3, "Llena la entrevista, toma las fotos de la casa y deja que el sistema guarde la ubicación (GPS)."),
  step(4, "Guarda. El cliente pasa solo a «Pendiente evaluación» para que el administrador apruebe."),

  H1("3. Cobrar en la calle (cobro en campo)"),
  P("Cuando recoges efectivo o te muestran una transferencia fuera de la oficina:"),
  step(1, "Entra a «Cartera». Toca el botón «+» y elige «Cobro en campo» (o el botón «💵 Cobrar» de la tarjeta del cliente en el panel «Hoy»)."),
  step(2, "Busca al cliente (solo aparecen los tuyos). El sistema muestra cuánto «Debe pagar»."),
  step(3, "Escribe el monto, deja que capture la ubicación GPS, y toma la foto si aplica."),
  step(4, "Registra. Se genera un recibo provisional que puedes enviar por WhatsApp."),
  step(5, "Cuando entregues el efectivo a la secretaria, marca «Entregué a secretaria». Ella lo confirma.", true),
  ok("Doble control", ["Tu cobro queda como «Pendiente» hasta que la secretaria lo confirme al recibir el efectivo. Es una protección para todos: tu trabajo queda registrado con GPS, hora y foto."]),

  H1("4. Perseguir la mora (protocolo)"),
  P("Cuando un cliente tuyo no paga, se sigue un protocolo. En el panel «Hoy» de Cartera verás tus tareas del día ordenadas por urgencia (Recolección, Mora, Gabela, Pagan hoy)."),
  P("Los pasos, en orden, desde el primer día de mora:"),
  step(1, "Mensaje: toca «Mensaje» — abre WhatsApp con el texto y queda registrado que lo hiciste."),
  step(2, "Llamada: toca «Llamar» — abre el teléfono y queda registrado."),
  step(3, "Sirena / apagado: toca «Sirena» — último aviso, solo con la moto detenida."),
  P("Puedes hacer los tres el mismo día si no hay respuesta. No hay que esperar días entre uno y otro."),
  warn("El botón de Recolección está bloqueado hasta que hagas los 3 pasos", ["El sistema exige que ya intentaste mensaje + llamada + sirena antes de dejarte recolectar. Es a propósito: primero se agota la gestión."]),

  H1("5. Recolectar una moto"),
  P("Si agotaste la gestión y el cliente no paga ni responde, recoges la moto. La evidencia se registra al llegar a la bodega, no en la calle."),
  step(1, "En el panel «Hoy», toca «Recolección» en la tarjeta del cliente."),
  step(2, "Elige el destino (bodega / oficina / taller)."),
  step(3, "Toma las 6 fotos guiadas (incluida la de la persona con la moto), el kilometraje y anota los daños."),
  step(4, "Guarda. El sistema suspende el contrato, marca la moto como «Recuperada» y crea la multa de $20.000 automáticamente."),
  P("La moto queda en «Inmovilizaciones → Retenidas». El cliente la recupera pagando la multa + lo atrasado (o un convenio)."),

  H1("6. Devolver una moto retenida"),
  P("Cuando el cliente paga lo que debe para recuperar su moto:"),
  step(1, "Entra a «Inmovilizaciones → Retenidas» y abre su caso."),
  step(2, "Cobra: primero la multa; si le queda atrasado, se puede hacer un convenio por el resto."),
  step(3, "Cuando el botón «✓ Entregar» se habilite, tócalo: toma las 6 fotos de entrega y el kilometraje."),
  step(4, "Guarda. El contrato vuelve a «Activo» y la moto a «Asignada»."),

  H1("7. Qué NO hace el cobrador (y a quién acudir)"),
  bullet("Registrar pagos en efectivo en la oficina → Secretaria."),
  bullet("Confirmar pagos o transferencias → Secretaria."),
  bullet("Crear contratos, asignar motos, registrar clientes → Administrador / Administrador principal."),
  bullet("Iniciar una liquidación (tras 7 días de retención) → Administrador."),

  H1("8. Solución a problemas comunes"),
  P("«No veo un cliente / una moto»: probablemente no está asignada a ti. Pídele al administrador que revise tus motos asignadas."),
  P("«La pantalla se ve rara»: Ctrl + Shift + R."),
  P("«Un cliente mío aparece en mora pero ya pagó»: verifica que la secretaria haya confirmado su pago; si es un cobro tuyo de campo, puede estar «Pendiente» hasta que ella lo confirme."),
];

// ─────────────────────────── ADMIN (encargado de la operación) ───────────────────────────
const admin = [
  H1("1. Bienvenida"),
  P("Como Administrador, ves TODA la operación y la gestionas: contratos, motos, cartera, liquidaciones. Eres el responsable de que la flota siga produciendo."),
  P("Una regla clave: el Administrador NO registra efectivo en la oficina (eso es de la secretaria). Todo lo demás de la operación sí lo puedes hacer."),
  H2("Cómo entrar"),
  step(1, "Entra con tu correo y contraseña."),
  step(2, "El «Panel» te muestra el pulso del día: recaudo, clientes activos, motos en campo, mora, contratos. Usa el selector de grupo para ver cada portafolio (COSTA/PRADERA/RASTREADOR/USADAS)."),

  H1("2. Crear un contrato (asistente de 6 pasos)"),
  P("Solo para clientes «Aprobados» (con visita hecha)."),
  step(1, "Entra a «Contratos» y toca «+»."),
  step(2, "Paso 1 — Datos: elige el cliente, la modalidad (Diario/Semanal/Quincenal/Mensual), las 4 tarifas (tarifa L-S, tarifa domingo, ahorro L-S, ahorro domingo), el día de pago y los meses. La base inicial se pre-llena con lo que el cliente ya pagó."),
  step(3, "Si la base está incompleta, el sistema te obliga a crear un convenio antes de seguir."),
  step(4, "Paso 2 — Moto: elige una moto Disponible (confirma la placa)."),
  step(5, "Pasos 3-5 — Firmas del contrato y el pagaré (con huella si el lector está) y foto del certificado."),
  step(6, "Paso 6 — Entrega: kilometraje + 6 fotos guiadas + checklist. Al activar, la moto queda «Asignada» y el cliente «Activo»."),
  warn("No inventes las tarifas", ["El funcionario ingresa los 4 valores reales; el sistema calcula el resto. Nunca dividas el total entre 7 — los días no valen lo mismo (el domingo es más barato)."]),

  H1("3. Aprobar visitas y clientes"),
  step(1, "Entra a «Clientes» → filtro «Pendiente evaluación»."),
  step(2, "Revisa la visita (fotos, entrevista, ubicación) y los documentos."),
  step(3, "Aprueba o rechaza. Al aprobar, el cliente queda listo para contrato."),
  P("También asignas las visitas a los cobradores (SUBADMIN) desde aquí, y las motos a cada cobrador desde «Motos»."),

  H1("4. Gestionar la cartera y la mora"),
  P("En «Cartera» ves toda la operación: quién debe, quién está en mora, quién paga hoy. El panel «Hoy» ordena las tareas por urgencia."),
  P("Puedes otorgar un plazo extra (1-2 días con motivo escrito) a un cliente en mora; mientras esté vigente, no se puede recolectar su moto."),

  H1("5. Iniciar una liquidación (cerrar un contrato)"),
  P("La liquidación es el único camino real para cerrar un contrato con actividad. Los botones rápidos «Cancelar» solo sirven para contratos «En proceso» que nunca se activaron."),
  step(1, "Desde «Contratos» o desde «Inmovilizaciones», toca «Iniciar liquidación»."),
  step(2, "Elige el motivo: cumplimiento (el cliente terminó y se lleva la moto), retiro voluntario, o incumplimiento (mora)."),
  step(3, "El sistema crea una orden de taller y trae las deudas automáticamente."),
  step(4, "Tras la revisión de taller, se calcula el saldo (ahorro − deudas − daños), se firma y se cierra."),
  danger("Regla de los 7 días", ["Una moto retenida por mora solo se puede liquidar/reasignar después de 7 días. El sistema lo bloquea hasta entonces."]),

  H1("6. Tiempo fuera de servicio (taller, fiscalía, tránsito, garantía)"),
  P("Cuando una moto estuvo parada por causa ajena al cliente, al liberarla el sistema te pregunta qué hacer con ese tiempo:"),
  bullet("Cobrar (lo normal): el tiempo parado queda como deuda del cliente."),
  bullet("Rodar (excepción): extiende la fecha de fin del contrato, con un documento firmado por el cliente."),
  P("La prioridad SIEMPRE es cobrar. Rodar es la excepción, porque alarga el contrato y la empresa deja de ganar ese período."),

  H1("7. Qué NO hace el Administrador"),
  bullet("Registrar efectivo en la oficina → Secretaria (es un control: quien maneja la operación no maneja la caja)."),
  bullet("Crear usuarios o cambiar accesos → Administrador principal (FREDY)."),

  H1("8. Solución a problemas comunes"),
  P("«Un contrato aparece “vencido” pero está al día»: revisa la fecha de fin real en el Modal Editar Contrato; el vencimiento se calcula por el plazo total, no por un solo período."),
  P("«Una cifra migrada está mal»: corrígela en el Modal Editar Contrato (queda registro de quién y cuándo)."),
  P("«La pantalla se ve rara tras un cambio»: Ctrl + Shift + R."),
];

// ─────────────────────────── MECÁNICO ───────────────────────────
const mecanico = [
  H1("1. Bienvenida"),
  P("Como Mecánico, tu trabajo en el sistema es sencillo: solo usas el módulo «Taller». Ahí ves las motos que entran a mantenimiento, registras lo que les haces, y las das de salida."),
  H2("Cómo entrar"),
  step(1, "Entra con tu correo y contraseña. Verás directamente lo tuyo."),

  H1("2. Ver las órdenes de taller"),
  P("En «Taller» ves dos listas: las motos activas (en proceso) y el historial (finalizadas). Cada moto muestra su estado: Pendiente, En diagnóstico, En reparación, Listo para salida."),

  H1("3. Ingresar una moto al taller"),
  step(1, "Toca «Registrar ingreso»."),
  step(2, "Elige la moto y describe el estado técnico y el motivo."),
  step(3, "Guarda. La moto queda «En taller» (Mantenimiento)."),

  H1("4. Registrar diagnóstico, reparación y repuestos"),
  step(1, "Abre la orden de la moto."),
  step(2, "Toca «Cambiar estado» para moverla (En diagnóstico → En reparación → Listo para salida)."),
  step(3, "Toca «+ Repuesto / costo» para anotar cada repuesto usado y su costo."),

  H1("5. Finalizar la orden"),
  step(1, "Cuando la moto esté lista, toca «Finalizar y pasar a disponible»."),
  step(2, "La moto vuelve sola a su estado correcto: «Asignada» si tiene un contrato activo esperándola, o «Disponible» si no."),
  info("No tienes que decidir el estado de la moto", ["El sistema sabe si la moto tenía un cliente esperándola y la manda al estado correcto automáticamente."]),

  H1("6. Qué NO hace el Mecánico"),
  P("Todo lo demás del sistema (clientes, contratos, cobros, liquidaciones) es de otros roles. Si una orden de taller viene de una liquidación, el administrador la gestiona; tú solo registras el trabajo técnico."),

  H1("7. Problemas comunes"),
  P("«No veo una moto que debería estar en taller»: avísale al administrador; puede que aún no se haya registrado el ingreso."),
  P("«La pantalla se ve rara»: Ctrl + Shift + R."),
];

Promise.all([
  build("SUBADMIN (Cobrador)", "Cómo gestionar tus motos, cobrar en la calle y perseguir la mora — paso a paso.", subadmin, DIR + "Manual-SUBADMIN.docx"),
  build("ADMIN (Administrador)", "Cómo gestionar toda la operación: contratos, motos, cartera y liquidaciones — paso a paso.", admin, DIR + "Manual-ADMIN.docx"),
  build("MECANICO", "Cómo usar el módulo de taller — paso a paso.", mecanico, DIR + "Manual-MECANICO.docx"),
]).then(() => console.log("Listos los 3 manuales."));
