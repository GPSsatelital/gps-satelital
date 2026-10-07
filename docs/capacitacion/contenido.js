// LA CAPACITACIÓN DEL 7-OCT-2026 — todo el contenido en un solo lugar.
// De aquí salen las diapositivas (presentacion.html), el guion de quien presenta (guion.html) y la voz
// de los videos (hacer-audio.mjs). Si se cambia un texto, se cambia AQUÍ y sale igual en los tres.
//
// Señales sobre las fotos: [x, y, ancho, alto] en % de la foto. Las fotos son de la app real
// (scripts/manual/capturas-capacitacion.mjs) y NO se suben al repositorio: llevan datos de clientes.
window.CAP = {
  titulo: "MotoGestión, paso a paso",
  fecha: "7 de octubre de 2026",

  slides: [
    // ─────────────────────────────── APERTURA ───────────────────────────────
    { tipo: "portada", min: 1,
      notas: "Buenos días a todos y gracias por venir temprano. Esta hora es para una sola cosa: que todos hagamos las cosas igual y bien en la app. Vamos a ver cinco temas con pantallas de verdad y videos cortos. Les pido algo: si algo no queda claro, me interrumpen. Es mejor preguntar hoy que equivocarse mañana con la plata de un cliente." },

    { tipo: "agenda", titulo: "Lo que vamos a ver hoy", min: 1,
      items: [
        { n: 1, icono: "sol", t: "El día del administrador", d: "Lo primero que se hace al llegar" },
        { n: 2, icono: "doc", t: "Liquidaciones", d: "Cerrar la cuenta de quien entrega la moto" },
        { n: 3, icono: "llave", t: "Taller, préstamo y rodar el tiempo", d: "Cuando la moto se guarda" },
        { n: 4, icono: "calendario", t: "Nuevo: rodar por deuda", d: "Para pocos clientes con deudas grandes" },
        { n: 5, icono: "ceder", t: "Ceder un contrato", d: "Pasarlo completo a otra persona" },
      ],
      notas: "Este es el orden. Arrancamos con el día a día, que es lo que más hacemos, y terminamos con lo nuevo. Cada tema tiene un video corto de un minuto que muestra el paso a paso en la app." },

    { tipo: "reglas", titulo: "Tres cosas que valen para todo", min: 1,
      items: [
        { icono: "check", t: "Si no quedó en la app, no pasó.", d: "Cada llamada, cobro, firma y foto se registra en el momento." },
        { icono: "reloj", t: "La fecha real manda.", d: "Se escribe el día en que pasó, no el día en que se registra." },
        { icono: "alerta", t: "Ante la duda, pare y pregunte.", d: "Una decisión mal tomada con plata cuesta días arreglarla." },
      ],
      notas: "Estas tres reglas las vamos a ver repetidas en todos los temas. La primera: si no está en la app, para la empresa no pasó; si usted llamó y no lo anotó, nadie sabe que llamó. La segunda: la fecha real; ya nos ha costado plata registrar con la fecha del día y no con la del hecho. La tercera: preguntar toma dos minutos; arreglar una liquidación mal cerrada toma días." },

    // ─────────────────────────────── TEMA 1 ───────────────────────────────
    { tipo: "seccion", n: 1, titulo: "El día del administrador", sub: "Lo primero que hace cada administrador al llegar", min: 0.5,
      notas: "Primer tema: cómo arranca el día cada administrador." },

    { tipo: "frase", tema: 1, icono: "telefono", min: 1,
      frase: "Su día es de oficina y teléfono. Salir a la calle es la excepción.",
      sub: "Solo se sale a buscar una moto: no pagó, no cumplió la cita, o hay una emergencia.",
      notas: "Esto es importante entenderlo: el trabajo del administrador no es una ruta de cobro. Es una lista de pendientes que se trabaja desde la oficina y el teléfono. A la calle se sale solo cuando hay que ir por una moto." },

    { tipo: "pasos", tema: 1, titulo: "El orden de la mañana", min: 1.5,
      pasos: [
        { icono: "lista", t: "Abrir Mi Día", d: "Sus tareas y lo que tiene pendiente." },
        { icono: "telefono", t: "Llamar y escribir", d: "Cartera › Para hacer hoy, en orden." },
        { icono: "check", t: "Las tareas asignadas", d: "Lo que le montaron: buscar una moto, recoger un papel." },
        { icono: "reloj", t: "Lo que llegue en el día", d: "La lista cambia: revísela varias veces." },
      ],
      notas: "Cuatro pasos, siempre en este orden. Primero Mi Día, para ver qué le toca. Segundo, llamar y escribir: eso es lo que más plata trae, por eso va antes que todo. Tercero, las tareas que le asignaron. Y cuarto, lo que vaya llegando: la lista no es fija." },

    { tipo: "pantalla", tema: 1, titulo: "Cartera › Para hacer hoy", img: "t1-05-para-hacer-hoy.png", min: 2,
      marcas: [
        { r: [29.5, 20.2, 36.4, 3.8], t: "Toque «Para hacer hoy»: salen solo los clientes que hay que trabajar hoy." },
        { r: [3, 28.6, 71, 7.4], t: "Vaya en orden: Recolección, Mora, Gabela y Pagan hoy." },
        { r: [7.5, 65, 85, 11.5], t: "«34d en mora»: días desde el día que debía pagar. Un abono no los reinicia." },
        { r: [9.5, 84.9, 55, 9.4], t: "Cada botón deja registro: Mensaje, Llamar, Sirena, Recolección, Cobrar." },
      ],
      ojo: "«Días en mora» no es lo mismo que «días desde su último pago». Al cliente se le dice desde cuándo está en mora.",
      notas: "Esta es la pantalla principal del administrador. Número 1: el botón Para hacer hoy. Número 2: se trabaja en orden, primero los que hay que recoger, después mora, gabela y los que pagan hoy. Número 3: los días en mora cuentan desde el día que le tocaba pagar; si abonó un poquito, no se reinician. Número 4: cada botón deja anotado que usted lo hizo. Pregunta para ustedes: ¿por qué creen que se empieza por recolección?" },

    { tipo: "pantalla", tema: 1, titulo: "Qué hace cada botón", opcional: true, img: "t1-06-tarea-botones.png", min: 1.5,
      marcas: [
        { r: [7.5, 30.5, 57, 7.2], t: "«Debe pagar»: la cifra que se le dice al cliente, con su detalle." },
        { r: [9.5, 38.6, 61, 4.2], t: "Mensaje abre WhatsApp. Llamar marca. Cobrar registra el cobro en la calle con foto, ubicación y recibo." },
      ],
      ojo: "Nunca le diga al cliente una cifra que no salga en la pantalla.",
      notas: "La cifra en rojo es lo que debe hoy, con el detalle debajo: cuota más acuerdo. Esa es la única cifra que se le dice. Si el cliente pregunta otra cosa, se busca en la app, no se calcula de memoria. Cuando se cobra en la calle, la plata queda por confirmar hasta que la secretaria la recibe." },

    { tipo: "tabla", tema: 1, titulo: "El protocolo de mora", min: 2,
      columnas: ["Cuándo", "Qué se hace", "Qué se le dice"],
      filas: [
        ["Día de pago", "Mensaje en la mañana", "«Hoy es su día de pago: $202.000. ¿Le confirmo el pago?»"],
        ["Gabela (1 día)", "Otro mensaje", "«Ayer se venció su semana. Hoy todavía está a tiempo.»"],
        ["Mora", "Mensaje → Llamada → Apagado o recolección", "«Está en mora desde el lunes. Necesitamos el pago hoy para no recoger la moto.»"],
      ],
      pie: "En mora, los tres pasos se pueden hacer el mismo día si no contesta. Plazo extra: 1 o 2 días, con el motivo escrito. Sirena máximo 10 segundos y apagado máximo 1 hora, siempre con la moto detenida.",
      notas: "Este es el protocolo. No hay que esperar días entre un paso y otro: si no contesta el mensaje, se llama; si no contesta la llamada, se apaga o se recoge. El plazo extra existe, pero con motivo escrito, y mientras está vigente la moto no se recoge. Y la sirena y el apagado, solo con la moto quieta: con la moto andando es un peligro." },

    { tipo: "pantalla", tema: 1, titulo: "La secretaria: lo primero es confirmar", img: "t1-07-confirmar.png", min: 1.5,
      marcas: [
        { r: [66.5, 20.2, 26.5, 3.8], t: "«Confirmar»: lo que está esperando que ella diga sí o no." },
        { r: [11, 49, 81.5, 23], t: "Revise el comprobante: fecha, valor y referencia del banco." },
        { r: [11, 80.4, 63.5, 4], t: "«Confirmar recibido» solo si la plata está en el banco. Si no, «Rechazar»." },
      ],
      ojo: "Mientras no se confirme, esa plata no cuenta en ninguna cuenta.",
      notas: "Para la secretaria, lo primero de la mañana es esta pestaña. Esa plata ya entró pero la app no la cuenta hasta que ella la confirme. Por eso no se puede dejar para la tarde: el cliente aparece en mora aunque ya pagó." },

    { tipo: "comparar", tema: 1, titulo: "Al terminar el día", min: 1,
      izq: { titulo: "El administrador", tono: "info", items: ["Entrega a la secretaria el efectivo que cobró y lo marca como entregado.", "Cada tarea queda «cumplida» o «no se pudo», con el motivo."] },
      der: { titulo: "La secretaria", tono: "info", items: ["Nada queda sin confirmar.", "Recibe el efectivo de cada administrador.", "La caja de transferencias se cierra al día siguiente, cuando ya entraron las de la noche."] },
      notas: "Así se cierra el día. El efectivo nunca se va para la casa: se entrega el mismo día. Y si una tarea no se pudo hacer, se marca «no se pudo» con el motivo: eso no es malo, lo malo es marcar cumplido lo que no se hizo." },

    { tipo: "lista", tema: 1, titulo: "Errores que no se pueden repetir", opcional: true, tono: "mal", min: 1,
      items: [
        "Cobrar y no registrarlo en el momento.",
        "Llevarse el efectivo a la casa.",
        "Prometerle al cliente algo que la app no dice: plazos o descuentos.",
        "Marcar «cumplida» una tarea que no se hizo. Para eso está «No se pudo».",
      ],
      notas: "Estos cuatro errores ya nos han pasado. Cada uno termina en un cliente diciendo «yo sí pagué» o «a mí me dijeron», y en horas de trabajo para arreglarlo." },

    // ─────────────────────────────── TEMA 2 ───────────────────────────────
    { tipo: "seccion", n: 2, titulo: "Liquidaciones", sub: "Cerrar la cuenta de un cliente que entrega la moto. La hace la secretaria.", min: 0.5,
      notas: "Segundo tema: las liquidaciones. Ángela, este es su tema; los demás, pongan atención porque ustedes inician muchas." },

    { tipo: "tabla", tema: 2, titulo: "Primero: el motivo correcto", min: 1.5,
      columnas: ["Motivo", "Cuándo se usa", "Cómo termina"],
      filas: [
        ["Retiro voluntario", "El cliente entrega la moto, o va a cambiar de moto.", "Contrato Finalizado · moto Disponible"],
        ["Incumplimiento", "No pagó y hubo que recogerle la moto.", "Contrato Cancelado · moto Disponible"],
        ["Cumplimiento", "Pagó todas sus semanas.", "La moto pasa a ser de él · Paz y salvo"],
      ],
      pie: "«Cumplimiento» le entrega la moto al cliente. Solo va ahí el que terminó de pagar de verdad.",
      notas: "Lo primero es el motivo, porque el motivo decide cómo termina todo. El que más cuidado necesita es Cumplimiento: ese le entrega la moto. Si hay la menor duda, se pregunta. Y mientras no se cierre, el motivo se puede cambiar." },

    { tipo: "frase", tema: 2, icono: "calendario", min: 1,
      frase: "La fecha en que se recibió la moto manda sobre todo.",
      sub: "Se cobra hasta ese día. Caso real: una fecha corrida 3 días le quitó $93.000 al cliente.",
      notas: "Si la moto llegó el lunes y se registra el viernes, la app le cobra al cliente cuatro días que no tuvo la moto. Por eso la recepción, con sus 6 fotos y la fecha real, se hace el mismo día que llega la moto." },

    { tipo: "pasos", tema: 2, titulo: "Los 7 pasos", min: 2,
      pasos: [
        { icono: "moto", t: "Recibir la moto", d: "Motos › Registrar novedad. 6 fotos y la fecha real." },
        { icono: "doc", t: "Iniciar", d: "Desde Contratos o Inmovilizaciones." },
        { icono: "llave", t: "Revisión del taller", d: "La hace el mecánico." },
        { icono: "lista", t: "Calcular", d: "Daños uno por uno. Revise las deudas." },
        { icono: "doc", t: "Documento", d: "Quién firma por la empresa y su cargo." },
        { icono: "firma", t: "Firma", d: "En pantalla, con huella." },
        { icono: "check", t: "Cerrar", d: "El punto sin retorno." },
      ],
      notas: "Estos son los siete pasos. La liquidación se puede parar en cualquiera y seguir después: nada se pierde. Arriba siempre hay una barra con bolitas que dice en qué paso va." },

    { tipo: "pantalla", tema: 2, titulo: "La cuenta: revísela antes de seguir", img: "liq-05-cuenta.png", min: 2,
      marcas: [
        { r: [11, 23.2, 54.5, 4], t: "El motivo. Se puede cambiar mientras no se cierre." },
        { r: [7, 40, 85.5, 16.5], t: "Ahorro menos deudas menos daños = saldo. Verde: a favor del cliente. Rojo: debe." },
        { r: [7, 61.8, 88, 16.2], t: "El día en que se guardó la moto. Revíselo antes de calcular." },
      ],
      ojo: "El costo del taller (aceite, frenos, mantenimiento) lo paga la empresa. Al cliente solo se le cobran los daños.",
      notas: "Esta es la cuenta. Número 1, el motivo. Número 2, el saldo: verde es plata para el cliente, rojo es lo que debe. Número 3, la fecha: si está mal, el saldo está mal. Y ojo: el mantenimiento no se le cobra al cliente; solo los daños, uno por uno. Si un número le extraña, pare: casi siempre es la fecha o un daño mal escrito." },

    { tipo: "pantalla", tema: 2, titulo: "La firma del cliente", img: "liq-08-firma-opciones.png", min: 2,
      marcas: [
        { r: [7, 20.5, 86, 5.4], t: "Lo normal: el cliente lee la cuenta y firma en pantalla, con su huella." },
        { r: [7, 41.6, 79, 17.4], t: "Si el lector falla o prefiere papel: imprimir, firma a mano, y subir la foto." },
        { r: [10.8, 74.4, 79, 5], t: "Si no viene y la moto se necesita: «Cerrar sin firma»." },
      ],
      ojo: "Nunca suba el documento sin firmar: la empresa queda sin respaldo.",
      notas: "Primero el cliente lee la cuenta; solo cuando está de acuerdo, firma. Lo normal es en pantalla con huella. Si no se puede, está el camino del papel. Y el tercero, cerrar sin firma, es para un caso especial que vemos en la siguiente." },

    { tipo: "comparar", tema: 2, titulo: "«Cerrar sin firma»: cuándo sí y cuándo no", min: 2,
      izq: { titulo: "Sí se vale", tono: "bien", items: ["La moto se necesita hoy para otro cliente.", "Ya le mandó el documento y quedó en devolverlo firmado.", "El cliente está lejos o no contesta hace días."] },
      der: { titulo: "No se vale", tono: "mal", items: ["El cliente está ahí: que firme.", "No ha revisado la fecha ni el saldo.", "Solo por afán.", "El cliente SIGUE con la empresa porque va a cambiar de moto."] },
      notas: "Cerrar sin firma es una salida para cuando el cliente no puede venir. El último punto en rojo es nuevo y muy importante: si el cliente sigue con nosotros porque le vamos a dar otra moto, no se cierra sin firma. Esta semana pasó: se cerró sin firma, el cliente quedó como Retirado y no aparecía para hacerle el contrato nuevo. Hubo que arreglarlo a mano." },

    { tipo: "pantalla", tema: 2, titulo: "Cuando el cliente llega después a firmar", img: "liq-10-cerrada-sin-firma.png", min: 1.5,
      marcas: [
        { r: [3.5, 65.4, 93, 26.5], t: "En la lista sale con el letrero «Falta firma». Adentro, este aviso amarillo." },
        { r: [7, 81.6, 86, 5.4], t: "Toque «Firmar en pantalla»: firma con el dedo y huella con el lector." },
      ],
      ojo: "Firmar después no cambia ni un peso: solo se le pega el papel que faltaba.",
      notas: "Una liquidación sin firma no queda así para siempre. Cuando el cliente aparece, se busca la que tiene el letrero Falta firma, se abre, y Firmar en pantalla. Pueden hacerlo sin miedo: no mueve el contrato, ni la moto, ni la cuenta. Recomendación: una vez por semana, revisen la lista buscando el letrero amarillo." },

    { tipo: "frase", tema: 2, icono: "usuarios", min: 1.5,
      frase: "Si el cliente sigue con la empresa, marque «Sigue con la empresa» antes de cerrar.",
      sub: "Su saldo se reparte: base de la moto nueva, a favor del contrato nuevo, o en efectivo. Esa casilla solo sale al cerrar con la firma.",
      notas: "Cuando liquidamos la moto vieja para darle otra, al confirmar el cierre se marca la casilla Sigue con la empresa. Así su saldo pasa a la base de la moto nueva y el cliente aparece para el contrato nuevo. Sin esa casilla queda Retirado. Por eso, en ese caso, la liquidación se cierra con el cliente presente y firmando." },

    { tipo: "pantalla", tema: 2, titulo: "Así se ve una bien cerrada", opcional: true, img: "liq-12-cerrar.png", min: 1,
      marcas: [
        { r: [7, 35.2, 85.5, 16.8], t: "El saldo final: aquí, $157.000 a favor del cliente." },
        { r: [3.5, 71, 93, 10.4], t: "En verde: «Liquidación cerrada», con el documento firmado para descargar." },
      ],
      notas: "Así se ve cuando quedó bien: todas las bolitas en verde, el aviso verde y el documento firmado para descargar o reimprimir. Si quedó saldo a favor y se le entrega plata, sale el recibo de egreso." },

    { tipo: "lista", tema: 2, titulo: "Lo que nunca se hace", tono: "mal", min: 1.5,
      items: [
        "Cerrar sin mirar la fecha de recibo. Cada día corrido son unos $31.000 del cliente.",
        "Subir el documento sin firmar.",
        "Elegir «Cumplimiento» sin que haya terminado de pagar.",
        "Cobrarle al cliente el costo del taller. Solo los daños.",
        "Decirle un número al cliente antes de calcular.",
        "Dar Paz y salvo a quien quedó debiendo.",
        "Dejar abierta una liquidación del contrato equivocado: se anula.",
      ],
      notas: "Estas siete son las que más daño hacen. Ante la duda, no se cierra: preguntar toma dos minutos." },

    { tipo: "video", tema: 2, video: "v1", titulo: "Video: cerrar sin firma y firmar después", min: 1.5,
      notas: "Ahora veamos todo esto en un video de un minuto. Si quieren, después lo repetimos." },

    // ─────────────────────────────── TEMA 3 ───────────────────────────────
    { tipo: "seccion", n: 3, titulo: "Taller, préstamo y rodar el tiempo", sub: "Cuando la moto de un cliente queda guardada", min: 0.5,
      notas: "Tercer tema: qué hacemos cuando la moto de un cliente queda guardada, por taller, por garantía, o porque él la entrega." },

    { tipo: "pantalla", tema: 3, titulo: "Registrar novedad: elija bien qué pasó", img: "t3-01-motos-novedad.png", min: 2.5,
      marcas: [
        { r: [8, 16.5, 84, 12.6], t: "Ingresar a taller: se dañó y el cliente SIGUE. Su contrato sigue cobrando y se le puede prestar otra." },
        { r: [8, 30.1, 84, 12.6], t: "Inmovilizar: está en mora. Se suspende el contrato y se cobra la multa de $30.000." },
        { r: [8, 43.8, 84, 14.6], t: "El cliente para un tiempo (entrega voluntaria): se suspende y NO se le presta otra." },
        { r: [8, 59.3, 84, 12.8], t: "Retención legal: Fiscalía, Tránsito o garantía. El contrato sigue." },
      ],
      ojo: "Dónde: Motos › la moto › Registrar novedad. Elegir mal la situación cambia cuánto debe el cliente.",
      notas: "Todo empieza aquí: Motos, la moto, Registrar novedad. Hay seis situaciones y cada una hace algo distinto con el contrato. Taller: el cliente sigue, sigue pagando su semana y le podemos prestar otra. Inmovilizar: es por mora. El cliente para un tiempo: esa es la entrega voluntaria; se suspende y no hay préstamo. Y retención legal, donde va la garantía. Pregunta: si un cliente dice «me voy a mi pueblo un mes», ¿cuál escojo?" },

    { tipo: "pantalla", tema: 3, titulo: "Ingresar a taller", img: "t3-03-taller-nueva.png", min: 1.5,
      marcas: [
        { r: [10, 38.6, 80, 21.8], t: "¿Cómo llegó? La trajo el cliente: sin costo. Se fue a buscar: $30.000." },
        { r: [10, 62, 80, 12], t: "Con qué entró: el problema, en palabras." },
        { r: [10, 76.4, 80, 14], t: "Las 6 fotos: la prueba de cómo llegó." },
      ],
      ojo: "La fecha de ingreso es el día en que llegó de verdad.",
      notas: "Se dice cómo llegó, con qué problema y se toman las seis fotos. Las fotos nos protegen: si después aparece un daño, ellas dicen si ya venía." },

    { tipo: "frase", tema: 3, icono: "escudo", min: 1,
      frase: "La garantía se trata igual que Fiscalía y Tránsito.",
      sub: "El contrato sigue corriendo. El tiempo parado se cobra; rodarlo es la excepción, y la decide el administrador. Anote el número de caso.",
      notas: "Aunque la falla sea del fabricante, el contrato sigue. La prioridad siempre es cobrar. Rodar el tiempo existe, pero es una excepción y la decide el administrador." },

    { tipo: "tabla", tema: 3, titulo: "Préstamo de moto: dos motos, dos cobros", min: 2,
      columnas: ["", "Cómo funciona"],
      filas: [
        ["Su contrato", "Sigue normal: paga su semana de siempre."],
        ["La moto prestada", "$27.000 por día, aparte, todos los días."],
        ["Si no paga el alquiler", "Queda como deuda y se le hace un acuerdo. No le impide recuperar su moto."],
        ["Las cuentas", "Nunca se mezclan: el alquiler es del socio dueño de la moto prestada."],
      ],
      pie: "Se presta primero una moto Disponible. Una retenida por mora no: su dueño puede pagar y pedirla.",
      notas: "Esto es lo que más preguntan los clientes. Le prestamos otra moto para que no deje de trabajar, pero no es gratis: paga su semana más 27 mil pesos diarios por la prestada. Ese alquiler se cobra todos los días; si se atrasa, queda como deuda con acuerdo. Y las cuentas nunca se mezclan." },

    { tipo: "pantalla", tema: 3, titulo: "Prestar moto de reemplazo", opcional: true, img: "t3-07-prestar-modal.png", min: 1.5,
      marcas: [
        { r: [5, 5.4, 90, 8.6], t: "De quién es y cuál moto está en el taller." },
        { r: [5, 21, 90, 16.4], t: "El consejo: presta primero las disponibles." },
        { r: [5, 44.2, 90, 44.4], t: "La lista de motos para prestar. Se escoge una y se sigue al paso 2." },
      ],
      ojo: "Dónde: Inmovilizaciones › Varadas › Prestar reemplazo.",
      notas: "El préstamo se hace desde Inmovilizaciones, en las motos varadas. Se escoge la moto, se dice cómo sale, y la app cambia las placas sola. Para devolverla, en la misma pantalla está Préstamos activos." },

    { tipo: "pantalla", tema: 3, titulo: "Al salir del taller: resolver el tiempo", img: "t3-09-resolver-tiempo.png", min: 2,
      marcas: [
        { r: [9, 35.2, 82, 11], t: "Solo se ruedan semanas COMPLETAS. Los días sueltos se quedan en su semana." },
        { r: [9, 48.4, 82, 17.6], t: "Se guardó el / Se devolvió el: las fechas reales." },
      ],
      ojo: "Lo que debía de ANTES de guardar la moto no se rueda nunca. Rodar exige documento firmado.",
      notas: "Cuando la moto sale, se resuelve el tiempo que estuvo guardada: se cobra o se rueda. Rodar es pasar esas semanas al final del contrato: no se perdonan, se pagan después. Solo semanas completas: tres días sueltos no se ruedan. Y lo que debía antes, eso se cobra siempre." },

    { tipo: "tabla", tema: 3, titulo: "En la vida real: qué decirle al cliente", min: 2,
      columnas: ["Momento", "Lo que se le dice"],
      filas: [
        ["La moto entra al taller", "«Su semana sigue corriendo. Si quiere seguir trabajando, le prestamos otra a $27.000 diarios, que se pagan cada día.»"],
        ["Garantía", "«Su moto quedó en garantía con el caso número tal. Su contrato sigue. El tiempo parado se cobra, o se corre al final si el administrador lo autoriza.»"],
        ["Le devolvemos su moto", "«Aquí está su moto. Devuélvanos la prestada. Las semanas que estuvo guardada se cobran o se corren al final; para correrlas, firma un papel.»"],
      ],
      notas: "Estas tres frases las pueden usar tal cual. Lo importante es que el cliente sepa desde el primer día que su contrato sigue y que la prestada se paga aparte. Así no hay sorpresas." },

    { tipo: "video", tema: 3, video: "v2", titulo: "Video: moto al taller con préstamo", min: 1.5,
      notas: "Veamos el recorrido completo en un video." },

    // ─────────────────────────────── TEMA 4 ───────────────────────────────
    { tipo: "seccion", n: 4, titulo: "Nuevo: rodar por deuda", sub: "Para unos pocos clientes con deudas grandes", min: 0.5,
      notas: "Cuarto tema, y es nuevo: quedó listo anoche." },

    { tipo: "frase", tema: 4, icono: "calendario", min: 1,
      frase: "La deuda no se perdona: se corre al final del contrato, con un poco más por el desgaste de la moto.",
      sub: "Así deja de salirle en mora hoy, y se le cobra después.",
      notas: "A algunos clientes la deuda les creció tanto que no la van a poder pagar de una. En vez de perderlos, la pasamos al final del contrato. No es un regalo: se paga después, y con un recargo, porque la moto trabaja más tiempo y se desgasta más." },

    { tipo: "lista", tema: 4, titulo: "Para quién es", tono: "bien", min: 1,
      items: [
        "Contrato activo y semanal, con la moto trabajando.",
        "Debe más de $700.000.",
        "Una sola vez por contrato.",
        "Lo hace solo el dueño. A Sergio se le activa después de esta capacitación.",
      ],
      pie: "No es para motos retenidas, ni para clientes en liquidación.",
      notas: "Es para pocos: no se le ofrece a todo el mundo. Una sola vez por contrato, porque si se repite deja de ser una ayuda y se vuelve la costumbre de no pagar. Los administradores no lo hacen; si creen que un cliente lo necesita, lo proponen." },

    { tipo: "comparar", tema: 4, titulo: "Qué se rueda y qué no", min: 1.5,
      izq: { titulo: "Sí se rueda (es tiempo)", tono: "bien", items: ["Semanas atrasadas del contrato.", "Tarifa atrasada.", "Deuda de migración (del Excel viejo)."] },
      der: { titulo: "No se rueda (es plata)", tono: "mal", items: ["Repuestos y préstamos.", "Daños del vehículo.", "Alquiler de la moto prestada.", "Multa de recolección y lavada."] },
      pie: "Lo atrasado de un acuerdo de pago se corre al final del mismo acuerdo, que sigue con su cuota.",
      notas: "La regla es fácil: se rueda lo que es tiempo, es decir, semanas que usó la moto y no pagó. Lo que es plata prestada o gastada se sigue cobrando en plata. Y si tiene un acuerdo, el acuerdo sigue; lo atrasado del acuerdo se pasa al final del mismo acuerdo." },

    { tipo: "tabla", tema: 4, titulo: "Cuántas semanas paga al final", min: 1.5,
      columnas: ["Semanas rodadas", "3", "4", "5", "6", "7", "8", "10"],
      filas: [["Paga al final", "4", "5", "6", "8", "9", "11", "14"]],
      pie: "Hasta 4 semanas: una más. Después: una más por cada 2 completas. Solo semanas completas; lo que sobra se paga ese mismo día.",
      notas: "Así se cuenta el recargo. Hasta cuatro semanas, una más. De ahí en adelante, una más por cada dos. Son semanas normales, con su ahorro. Y solo semanas completas: si sobra un pedazo que no alcanza a ser semana, ese se paga ese mismo día." },

    { tipo: "pantalla", tema: 4, titulo: "La cuenta la hace la app", img: "t4-03-rodado-cuenta-2.png", min: 2,
      marcas: [
        { r: [6, 15.6, 88, 11], t: "Lo que le queda debiendo después de rodar: se cobra en el momento." },
        { r: [6, 40.6, 88, 12], t: "Semanas rodadas y lo que paga al final, con el recargo." },
        { r: [6, 53.4, 88, 6], t: "La fecha de fin, antes y después." },
        { r: [6, 62.6, 88, 13], t: "Lo que no se rueda: lo sigue debiendo." },
        { r: [6, 76.8, 88, 11.8], t: "La advertencia del SOAT y la tecnomecánica." },
      ],
      ojo: "Dónde: Contratos › el contrato › «Rodar por deuda».",
      notas: "Nadie hace cuentas a mano: la app muestra cuánto debe hoy, cuánto le queda, cuántas semanas se ruedan, cuántas paga al final y la nueva fecha de fin. Y le recuerda decirle al cliente lo del SOAT y la tecnomecánica." },

    { tipo: "pantalla", tema: 4, titulo: "Documento, firma y video", img: "t4-05-rodado-documento.png", min: 1.5,
      marcas: [
        { r: [6, 23.4, 88, 43], t: "El cliente lee el documento completo." },
        { r: [6, 68.4, 88, 20], t: "Marca que lo leyó y firma. Si tiene acompañante, firma también." },
      ],
      ojo: "Después graba un video de máximo 1 minuto. Sin video no se guarda.",
      notas: "Primero el documento: el cliente lo lee y firma. Después el video: la app le pone en pantalla lo que tiene que decir, con sus cifras." },

    { tipo: "frase", tema: 4, icono: "video", min: 1.5, cita: true,
      frase: "«Hoy, 7 de octubre de 2026, yo, [NOMBRE], con cédula [___], acepto que se me ruedan [8] semanas que debo, que al final pagaré [11], que mi contrato termina aproximadamente el [fecha], y que la empresa no cubre el SOAT ni la tecnomecánica durante ese tiempo extra.»",
      sub: "Que se oiga clara la fecha del día y las cifras.",
      notas: "Esto es lo que dice el cliente en el video, mirando a la cámara. Lo más importante es la fecha del día y las cifras. Si se equivoca, se graba otra vez: hay un botón para repetir." },

    { tipo: "lista", tema: 4, titulo: "Advertencias", tono: "alerta", min: 1.5,
      items: [
        "Lo que sobra se cobra ese mismo día. Si no, sigue en mora por ese pedazo.",
        "Revise la cédula del cliente antes: sale en el documento.",
        "Si el contrato tiene el «empalme abierto», revise primero que su deuda esté bien.",
        "Si se va antes de terminar, en la liquidación se le cobran las semanas rodadas, sin el recargo.",
        "Una sola vez por contrato.",
      ],
      notas: "Cinco advertencias. La primera es la más importante: si no paga lo que sobra ese día, sigue saliendo en mora. La segunda: anoche vimos un cliente con la cédula «POR DEFINIR»; eso hay que corregirlo antes. La tercera: algunos contratos de la migración todavía pueden cambiar su deuda; se revisa primero." },

    { tipo: "video", tema: 4, video: "v3", titulo: "Video: rodar por deuda", min: 1.5,
      notas: "El recorrido completo, en un minuto." },

    // ─────────────────────────────── TEMA 5 ───────────────────────────────
    { tipo: "seccion", n: 5, titulo: "Ceder un contrato", sub: "Pasar el contrato completo a otra persona", min: 0.5,
      notas: "Último tema: ceder un contrato." },

    { tipo: "lista", tema: 5, titulo: "Qué pasa con una cesión", tono: "info", min: 1.5,
      items: [
        "El contrato NO se hace de nuevo: sigue en la semana donde iba.",
        "Pasa todo: ahorro, semanas pagadas y deudas.",
        "Quien entrega queda Retirado. Puede volver después, desde cero.",
        "La moto NO se entrega con la cesión: sale aparte, por Inmovilizaciones.",
      ],
      notas: "Ceder es cuando un cliente le pasa su contrato a otra persona. El que recibe sigue exactamente donde iba el otro: misma semana, mismo ahorro, misma deuda. El que entrega renuncia a su ahorro y queda retirado. Y la moto no sale con la cesión: se entrega aparte." },

    { tipo: "pantalla", tema: 5, titulo: "Quien recibe: lo mismo que un cliente nuevo", img: "t5-05-ceder-requisitos.png", min: 1.5,
      marcas: [
        { r: [6, 20.2, 88, 5.4], t: "Se escoge quién recibe." },
        { r: [6, 26.2, 88, 24.6], t: "Aprobado, documentos completos, acompañante, visita aprobada, no estar en lista negra y no tener otro contrato." },
      ],
      ojo: "Si algo sale en rojo, no deja ceder. Se arregla primero en la ficha del cliente.",
      notas: "El que recibe pasa por todo lo de un cliente nuevo: registro, documentos, acompañante y visita. La app le dice qué le falta, en rojo, y no deja ceder hasta que esté todo en verde. Para registrarlo, en Clientes se elige que ingresa por cesión: no paga base, la hereda." },

    { tipo: "pantalla", tema: 5, titulo: "Lo que bloquea una cesión", opcional: true, img: "t5-01-ceder.png", min: 1,
      marcas: [
        { r: [6, 44.6, 88, 12.6], t: "Ejemplo real: el empalme abierto. La app dice qué hacer." },
      ],
      ojo: "También bloquean: una moto prestada, una liquidación abierta y pagos sin confirmar.",
      notas: "Hay cuatro cosas que no dejan ceder: una moto prestada activa, el empalme abierto, una liquidación abierta, y pagos sin confirmar. Ese último es importante: si se confirma un pago después de ceder, esa plata le llenaría las semanas al cliente nuevo." },

    { tipo: "pasos", tema: 5, titulo: "Paso a paso", min: 2,
      pasos: [
        { icono: "doc", t: "Abrir", d: "Contratos › el contrato › Ceder contrato." },
        { icono: "lista", t: "Revisar", d: "«Lo que se traspasa», con los dos." },
        { icono: "impresora", t: "Imprimir el acta", d: "Y que la firmen los tres." },
        { icono: "usuarios", t: "Elegir quién recibe", d: "Todo en verde." },
        { icono: "firma", t: "Firmas en pantalla", d: "Quien entrega y quien recibe." },
        { icono: "camara", t: "Subir los papeles", d: "Acta, pagaré y certificado." },
        { icono: "moto", t: "Entregar la moto", d: "Aparte, por Inmovilizaciones." },
      ],
      notas: "Siete pasos. El acta se imprime desde la misma ventana y la firman los tres. Después se firman en la pantalla los dos clientes, y se suben fotos de los tres papeles firmados. Al final, la moto se entrega por Inmovilizaciones, como cualquier moto retenida." },

    { tipo: "tabla", tema: 5, titulo: "Quién firma qué", min: 1.5,
      columnas: ["Documento", "Quién firma", "Ojo"],
      filas: [
        ["Acta de cesión", "Quien entrega, quien recibe y el arrendador (Fredy Mora)", "Tres copias. Los dos clientes ponen su huella."],
        ["Pagaré con carta de instrucciones", "Quien recibe", "Es su respaldo de la deuda que asume."],
        ["Certificado", "Quien recibe", "El mismo de un contrato nuevo."],
        ["En la pantalla", "Quien entrega y quien recibe", "Firma con el dedo; la huella es opcional."],
      ],
      notas: "Esta tabla resume quién firma qué. El acta la firman los tres, en tres copias: una para cada uno. El pagaré y el certificado los firma solo el que recibe." },

    { tipo: "pantalla", tema: 5, titulo: "El acta de cesión", opcional: true, img: "t5-06-acta.png", ancho: true, min: 1.5,
      marcas: [
        { r: [7.5, 11, 85, 10.4], t: "Quién es quién: arrendador, quien entrega, quien recibe y la moto." },
        { r: [7.5, 22.2, 85, 13], t: "El estado de cuenta: semana, cuota, ahorro y la deuda que asume quien recibe." },
        { r: [7.5, 86, 70, 2.6], t: "Se firma en tres ejemplares." },
      ],
      notas: "El acta dice quién es quién, el estado de cuenta, y las cláusulas: el contrato no se acaba, quien entrega renuncia a su ahorro, y las multas de antes de hoy son de quien entrega." },

    { tipo: "tabla", tema: 5, titulo: "Qué decirle a cada uno", opcional: true, min: 1.5,
      columnas: ["A quién", "Lo que se le dice"],
      filas: [
        ["Quien entrega", "«Usted entrega el contrato con su ahorro; no lo puede reclamar después. Queda retirado y puede volver más adelante, desde cero.»"],
        ["Quien recibe", "«Usted sigue donde iba él: en la semana tal, y asume la deuda de tanto. Las multas de antes de hoy son de él; las de después, suyas.»"],
      ],
      notas: "Que los dos lo oigan claro, delante de los dos, antes de firmar." },

    { tipo: "video", tema: 5, video: "v4", titulo: "Video: ceder un contrato", min: 1.5,
      notas: "Y el último video." },

    // ─────────────────────────────── CIERRE ───────────────────────────────
    { tipo: "tabla", titulo: "¿Dónde busco...?", min: 2,
      columnas: ["Quiero...", "Voy a..."],
      filas: [
        ["Ver lo que tengo que hacer hoy", "Mi Día · Cartera › Para hacer hoy"],
        ["Confirmar una transferencia", "Cartera › Confirmar"],
        ["Meter una moto al taller", "Motos › la moto › Registrar novedad"],
        ["Prestar o recibir una moto prestada", "Inmovilizaciones › Varadas · Préstamos activos"],
        ["Cobrar o rodar el tiempo guardado", "Contratos › el contrato › Resolver tiempo guardado"],
        ["Hacer una liquidación", "Contratos › Iniciar liquidación · Más › Liquidaciones"],
        ["Rodar por deuda", "Contratos › el contrato › Rodar por deuda"],
        ["Ceder un contrato", "Contratos › el contrato › Ceder contrato"],
      ],
      notas: "Esta es la hoja para tener a mano: lo que quiero hacer y dónde se hace. Se la vamos a dejar impresa." },

    { tipo: "reglas", titulo: "Las reglas de oro", min: 1.5,
      items: [
        { icono: "check", t: "Si no está en la app, no pasó.", d: "" },
        { icono: "reloj", t: "La fecha real manda.", d: "" },
        { icono: "plata", t: "Nunca se dice una cifra que no salga en la pantalla.", d: "" },
        { icono: "firma", t: "Nada se firma sin leerlo.", d: "" },
        { icono: "plata", t: "El efectivo se entrega el mismo día.", d: "" },
        { icono: "alerta", t: "Ante la duda, pare y pregunte.", d: "" },
      ],
      notas: "Si se acuerdan solo de esto, ya ganamos. Seis reglas que cuidan la plata de la empresa y la de los clientes." },

    { tipo: "cierre", min: 3,
      notas: "Eso es todo. ¿Preguntas? Pregunten todo lo que necesiten: no hay preguntas tontas cuando hay plata de por medio. Los videos y esta presentación quedan para repasar." },
  ],

  // ─────────────────────────────── LOS VIDEOS ───────────────────────────────
  // Cada escena: la foto, dónde se acerca (r, en %), y lo que dice la voz. La voz sale de
  // hacer-audio.mjs con la voz del computador; el subtítulo es el mismo texto.
  videos: {
    v1: { titulo: "Cerrar sin firma y firmar después", escenas: [
      { img: "liq-08-firma-opciones.png", r: [7, 20.5, 86, 5.4], voz: "Cuando la cuenta está lista, lo normal es que el cliente la lea, y firme aquí, en pantalla, con su firma y su huella." },
      { img: "liq-08-firma-opciones.png", r: [7, 41.6, 79, 17.4], voz: "Si el lector de huella no responde, o el cliente prefiere papel, imprima o descargue el documento. Él firma a mano, y usted sube la foto con Cámara o con Galería." },
      { img: "liq-09-cerrar-sin-firma.png", r: [10.8, 61.2, 79, 5], voz: "Si el cliente no va a venir, y la moto se necesita para otro cliente, use Cerrar sin firma. Solo en ese caso. Nunca por afán." },
      { img: "liq-10-cerrada-sin-firma.png", r: [3.5, 65.4, 93, 26.5], voz: "La liquidación queda cerrada, con este aviso amarillo: sin firma del cliente. En la lista sale con el letrero Falta firma, para que no se olvide." },
      { img: "liq-10-cerrada-sin-firma.png", r: [7, 81.6, 86, 5.4], voz: "Cuando el cliente aparezca, abra su liquidación y toque Firmar en pantalla. Firmar después no cambia ni un peso de la cuenta." },
      { img: "liq-12-cerrar.png", r: [3.5, 71, 93, 10.4], voz: "Así se ve cuando quedó completa: liquidación cerrada, en verde, con el documento firmado para descargar." },
      { img: "liq-09-cerrar-sin-firma.png", r: [10.8, 61.2, 79, 5], alerta: true, voz: "Ojo. Si el cliente sigue con la empresa, porque va a cambiar de moto, no use cerrar sin firma. Que firme en ese momento, y marque la casilla: sigue con la empresa." },
    ] },
    v2: { titulo: "Moto al taller con préstamo", escenas: [
      { img: "t3-01-motos-novedad.png", r: [8, 16.5, 84, 12.6], voz: "Si la moto de un cliente se daña, y él quiere seguir trabajando, vaya a Motos, busque la moto, y toque Registrar novedad. Elija: Ingresar a taller." },
      { img: "t3-03-taller-nueva.png", r: [10, 38.6, 80, 21.8], voz: "Diga cómo llegó la moto. Si la trajo el cliente, no tiene costo. Si hubo que ir a buscarla, se cobran treinta mil pesos." },
      { img: "t3-03-taller-nueva.png", r: [10, 62, 80, 28.4], voz: "Escriba con qué problema entró, y tome las seis fotos. Son la prueba de cómo llegó." },
      { img: "t3-06-prestar-boton.png", r: [7.5, 48, 39, 3.8], voz: "Para que siga trabajando, vaya a Inmovilizaciones, a las motos varadas, y toque Prestar reemplazo." },
      { img: "t3-07-prestar-modal.png", r: [5, 44.2, 90, 44.4], voz: "Escoja primero una moto disponible. Recuerde: son dos cobros. Su semana de siempre, más veintisiete mil pesos diarios por la prestada, que se cobran todos los días." },
      { img: "t3-08-prestamos-activos.png", r: [3, 83, 94, 9.4], voz: "Cuando su moto sale del taller, se recibe la prestada, en Préstamos activos." },
      { img: "t3-09-resolver-tiempo.png", r: [9, 35.2, 82, 30.8], voz: "Y se resuelve el tiempo que su moto estuvo guardada: se cobra, o se rueda al final, solo por semanas completas, y con documento firmado. La prioridad siempre es cobrar." },
    ] },
    v3: { titulo: "Rodar por deuda", escenas: [
      { img: "t4-01-contrato.png", r: [7, 51.2, 86, 5.4], voz: "Rodar por deuda es nuevo. Lo hace solo el dueño, para pocos clientes que deben más de setecientos mil pesos. Se abre en Contratos, en el contrato del cliente." },
      { img: "t4-02-rodado-cuenta.png", r: [6, 30, 88, 15.2], voz: "La app hace la cuenta sola: cuánto debe hoy, y cuánto le queda debiendo después de rodar. Eso que queda, se cobra ese mismo día." },
      { img: "t4-03-rodado-cuenta-2.png", r: [6, 40.6, 88, 12], voz: "Se ruedan solo semanas completas de tiempo. Al final paga un poco más: hasta cuatro semanas, una más. Después, una más por cada dos." },
      { img: "t4-03-rodado-cuenta-2.png", r: [6, 62.6, 88, 13], voz: "Lo que no es tiempo, como repuestos, préstamos, daños o multas, no se rueda: lo sigue debiendo." },
      { img: "t4-05-rodado-documento.png", r: [6, 23.4, 88, 43], voz: "El cliente lee el documento completo, y firma en la pantalla." },
      { img: "t4-05-rodado-documento.png", r: [6, 68.4, 88, 20], voz: "Después graba un video corto, de máximo un minuto, diciendo la fecha de hoy, que acepta el rodado, cuántas semanas pagará al final, la nueva fecha de fin, y que la empresa no cubre el SOAT ni la tecnomecánica en ese tiempo extra." },
      { img: "t4-03-rodado-cuenta-2.png", r: [6, 76.8, 88, 11.8], voz: "Al guardar, todo queda registrado en el contrato: el documento, el video y las cifras. Y si el cliente se va antes, la liquidación le cobra lo rodado." },
    ] },
    v4: { titulo: "Ceder un contrato", escenas: [
      { img: "t4-01-contrato.png", r: [7, 67.8, 86, 5.4], voz: "Para ceder un contrato, abra el contrato en Contratos, y toque: Ceder contrato a otro cliente." },
      { img: "t5-03-ceder-ok.png", r: [6, 21.5, 88, 27], voz: "Aquí está lo que pasa al nuevo cliente: la semana donde va, la cuota, el ahorro, y la deuda. Revíselo con los dos." },
      { img: "t5-03-ceder-ok.png", r: [10, 42, 80, 5], voz: "Imprima el acta. La firman tres: quien entrega, quien recibe, y el arrendador. En tres copias." },
      { img: "t5-06-acta.png", r: [7.5, 11, 85, 24.2], voz: "El acta dice quién entrega, quién recibe, la moto, y el estado de cuenta. Quien recibe asume la deuda completa." },
      { img: "t5-05-ceder-requisitos.png", r: [6, 20.2, 88, 30.6], voz: "Elija quién recibe. Debe cumplir todo lo de un cliente nuevo: aprobado, documentos, acompañante y visita. Si algo sale en rojo, no deja ceder." },
      { img: "t5-03-ceder-ok.png", r: [6, 60.4, 88, 19.6], voz: "Faltan las firmas en pantalla de los dos, y subir el acta firmada, el pagaré con carta de instrucciones, y el certificado." },
      { img: "t5-03-ceder-ok.png", r: [6, 21.5, 88, 27], voz: "Al confirmar, el contrato queda a nombre del nuevo cliente. La moto se le entrega aparte, por Inmovilizaciones." },
    ] },
  },
};
