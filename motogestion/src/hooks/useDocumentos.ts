import type { Contrato } from "./useContratos";
import type { Cliente } from "./useClientes";
import type { Moto } from "./useMotos";
import { formatDiaPago } from "../utils/cicloPago";
import { hoyISO } from "../utils/fecha";
import { pesosALetras } from "../utils/numeroLetras";

export type TipoDocumento = "contrato" | "certificado" | "pagare";

// Firmas y huellas para incrustar en el PDF congelado. Todas opcionales: en la vista
// previa del wizard van vacías (rayas en blanco); en el documento final van las imágenes.
export type FirmasDoc = {
  firmaCliente?: string | null;
  huellaCliente?: string | null;
  firmaAcompanante?: string | null;
  huellaAcompanante?: string | null;
  folio?: string | null;      // No. de contrato / folio (en blanco si no se define)
  selloFecha?: string | null; // "Firmado digitalmente el ..." para el pie
};

function fmt(n: number) {
  return Math.round(n).toLocaleString("es-CO");
}

function fmtFecha(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

// Raya en blanco para los campos que el sistema no captura (el contrato autoriza al
// arrendador a llenarlos a mano después).
const BLANK = `<span style="display:inline-block;border-bottom:1px solid #0f172a;min-width:120px">&nbsp;</span>`;

// Caja de firma manuscrita (imagen) o raya en blanco.
function cajaFirma(url?: string | null): string {
  return url
    ? `<img src="${url}" style="max-width:280px;max-height:110px;object-fit:contain;display:block;margin:0 auto" />`
    : `<div style="height:90px"></div>`;
}

// Caja de huella (imagen) o recuadro vacío.
function cajaHuella(url?: string | null): string {
  return url
    ? `<img src="${url}" style="width:100px;height:125px;object-fit:contain;display:block;margin:0 auto;border:1px solid #cbd5e1;border-radius:4px" />`
    : `<div style="width:100px;height:125px;border:1px dashed #cbd5e1;border-radius:4px;margin:0 auto"></div>`;
}

export function generarHTMLContrato(contrato: Contrato, cliente: Cliente, moto: Moto | null, firmas: FirmasDoc = {}): string {
  const hoy = fmtFecha(hoyISO());
  const canon = contrato.valor_semanal || contrato.tarifa_diaria || 0;
  const inicio = contrato.fecha_entrega ? fmtFecha(contrato.fecha_entrega) : BLANK;
  // Fecha de finalización siempre en blanco: el contrato se prorroga/extiende
  // automáticamente (cláusula TERCERA, parágrafo de prórroga), así que fijar una
  // fecha de fin sería engañoso. Se llena a mano si algún día se cierra.
  const fin = BLANK;
  const duracion = contrato.meses ? `${contrato.meses} MESES` : BLANK;
  const acomp = (cliente.acompanante_nombre ?? "").toUpperCase();
  const acompCC = cliente.acompanante_cedula ?? "";

  // Bloque del vehículo (se repite en el encabezado y en la cláusula PRIMERA).
  const bloqueVehiculo = `
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin:8px 0">
      <tr>
        <td style="padding:3px 6px;width:50%"><strong>Clase de vehículo:</strong> MOTOCICLETA</td>
        <td style="padding:3px 6px"><strong>Marca:</strong> ${moto?.marca ?? BLANK}</td>
      </tr>
      <tr>
        <td style="padding:3px 6px"><strong>Modelo:</strong> ${moto?.modelo ?? BLANK}</td>
        <td style="padding:3px 6px"><strong>Color:</strong> ${moto?.color ?? BLANK}</td>
      </tr>
      <tr>
        <td style="padding:3px 6px"><strong>Placa:</strong> ${moto?.placa ?? BLANK}</td>
        <td style="padding:3px 6px"><strong>Cilindraje:</strong> ${moto?.cilindraje ?? BLANK}</td>
      </tr>
      <tr>
        <td style="padding:3px 6px"><strong>No. Chasis:</strong> ${moto?.numero_chasis ?? BLANK}</td>
        <td style="padding:3px 6px"><strong>No. Motor:</strong> ${moto?.numero_motor ?? BLANK}</td>
      </tr>
      <tr>
        <td style="padding:3px 6px"><strong>Sitio matrícula:</strong> ${moto?.lugar_matricula ?? BLANK}</td>
        <td style="padding:3px 6px"><strong>Servicio:</strong> ${BLANK}</td>
      </tr>
    </table>`;

  const clausula = (titulo: string, cuerpo: string) =>
    `<div style="margin-bottom:11px;text-align:justify;page-break-inside:avoid"><strong>${titulo}</strong> ${cuerpo}</div>`;

  return `
    <div style="font-family:Arial,sans-serif;font-size:11px;color:#0f172a;line-height:1.55;padding:28px;max-width:720px;margin:auto">
      <div style="text-align:center;margin-bottom:8px">
        <div style="font-size:15px;font-weight:800">CONTRATO DE ARRENDAMIENTO DE VEHÍCULO AUTOMOTOR No. ${firmas.folio ?? BLANK}</div>
      </div>

      <div style="margin-bottom:8px"><strong>LUGAR Y FECHA DEL CONTRATO:</strong> Cartagena de Indias, ${hoy}</div>

      <div style="margin-bottom:6px"><strong>ARRENDADOR:</strong> FREDY MORA AVENDAÑO · C.C. 1.047.393.901</div>
      <div style="margin-bottom:10px">
        <strong>ARRENDATARIOS:</strong><br/>
        NOMBRE: ${cliente.nombre.toUpperCase()} &nbsp;·&nbsp; C.C. ${cliente.cedula}<br/>
        NOMBRE: ${acomp || BLANK} &nbsp;·&nbsp; C.C. ${acompCC || BLANK}
      </div>

      <div style="font-weight:700;margin-bottom:2px">BIEN OBJETO DEL CONTRATO</div>
      ${bloqueVehiculo}

      <div style="margin:10px 0;text-align:justify">
        Desde ya el arrendatario autoriza al arrendador a llenar los espacios en blanco de este documento.
        El presente contrato de arrendamiento de vehículo se celebra entre <strong>FREDY MORA AVENDAÑO</strong>,
        persona natural, con domicilio principal en esta ciudad, identificado con C.C. No. 1.047.393.901, quien se
        denominará <strong>el arrendador</strong>, y el(los) señor(es) arrendatario(s):
        <strong>${cliente.nombre.toUpperCase()}</strong>, identificado(a) con la C.C. ${cliente.cedula}
        Y ${acomp || BLANK} identificado(a) ${acompCC || BLANK}, quienes se denominarán <strong>el arrendatario</strong>.
      </div>

      <div style="margin:8px 0">
        <strong>PRECIO o CANON:</strong> ($ ${fmt(canon)}) valor en letras: ${pesosALetras(canon)}.<br/>
        <strong>TÉRMINO DE DURACIÓN DEL CONTRATO:</strong> ${duracion}<br/>
        <strong>FECHA DE INICIACIÓN DEL CONTRATO:</strong> ${inicio}<br/>
        <strong>FECHA DE FINALIZACIÓN DEL CONTRATO:</strong> ${fin}
      </div>

      <div style="margin:10px 0">Además de las anteriores estipulaciones, las partes de común acuerdo convienen las siguientes cláusulas:</div>

      ${clausula("PRIMERA. OBJETO DEL CONTRATO:", `Mediante el presente contrato, EL ARRENDADOR concede a EL ARRENDATARIO el goce del bien mueble en calidad de arrendamiento de un vehículo automotor que se relaciona a continuación: ${bloqueVehiculo}`)}

      ${clausula("SEGUNDA. RECIBO Y ESTADO Y DESTINACIÓN:", `EL ARRENDATARIO declara que ha recibido el bien mueble vehículo objeto de este contrato conforme al inventario que se anexa. Los arrendatarios utilizarán el bien mueble vehículo conforme a las reglas de tránsito y para usos de buenas costumbres y moral. Lo destinarán para el funcionamiento y tareas de apoyo de movilización en la ciudad, mensajería o paseo turístico; en fin, un uso exclusivo de tareas propias administrativas, laborales o de diversión que en ningún caso puede reñir con las normas jurídicas, las buenas costumbres y la moral.<br/><br/><strong>PARÁGRAFO PRIMERO:</strong> EL ARRENDATARIO no podrá darle uso indebido, ni ceder, ni transferir, ni manipular, ni someter a cambio de piezas, reparación o mantenimiento al bien mueble vehículo sin la autorización escrita del ARRENDADOR. Se considera que lesionan los intereses de EL ARRENDADOR si este se destina para actividades que riñan con la moral, las buenas costumbres, la ley y, en una palabra, si se cambia la destinación aquí descrita. El incumplimiento de estas obligaciones dará derecho a EL ARRENDADOR para dar por terminado este contrato y exigir la entrega del vehículo, o en caso de cesión o subarriendo celebrar un nuevo contrato con los usuarios reales sin necesidad de requerimientos judiciales o privados, a los cuales renuncia expresamente EL ARRENDATARIO. Renuncia en forma expresa a cualquier reclamación o indemnización a reparaciones o mantenimientos no autorizados por el arrendador.<br/><br/><strong>PARÁGRAFO SEGUNDO:</strong> Si por disposición sobreviniente de la autoridad municipal competente o disposición judicial o legal no fuere posible continuar dándole al bien mueble vehículo el uso específico para el que fue tomado en arrendamiento, por existir impedimentos de orden legal, judicial o administrativo para desarrollar la actividad principal, podrán las partes dar por terminado de inmediato el contrato unilateralmente en cualquier momento a partir de que se les notifique la respectiva decisión legal, administrativa o judicial; en todo caso queda a voluntad del arrendatario presentar los respectivos recursos ante la autoridad competente. En este caso el arrendador estará obligado a recibir el bien mueble vehículo una vez sea notificado por el arrendatario y no habrá lugar a indemnización alguna o retribuciones de ninguna clase, ni cláusula penal, salvo el incumplimiento de las obligaciones propias de este contrato.`)}

      ${clausula("TERCERA. TÉRMINO DEL CONTRATO:", `El término de duración de este contrato será de ${duracion}, contados a partir del ${inicio} y hasta ${fin}.<br/><br/><strong>PARÁGRAFO PRIMERO — Prórroga:</strong> si con seis (6) horas de anticipación al vencimiento del presente contrato ninguna de las partes ha comunicado a la otra su intención de darlo por terminado por medio de comunicación por cualquier medio tecnológico, se entenderá prorrogado en forma sucesiva y automática por un periodo igual y así sucesivamente, y será responsable el arrendatario por los cánones causados en las fechas sucesivas. En caso de que el arrendatario comunique la terminación del contrato debe entregar el bien mueble vehículo en las instalaciones del arrendador o en el lugar que este indique, en un horario máximo de 10:59 p.m. o a las 6:30 a.m. del día inmediatamente siguiente.<br/><br/><strong>PARÁGRAFO SEGUNDO:</strong> Es de exclusiva responsabilidad del arrendatario las infracciones de tránsito que cometiere con el bien mueble vehículo arrendado en los tiempos en que tenga la tenencia del vehículo, inclusive por fuera de los horarios establecidos en el presente contrato.`)}

      ${clausula("CUARTA. ESTADO JURÍDICO DEL BIEN ARRENDADO:", `EL ARRENDADOR entrega el vehículo materia de este contrato libre de litigios judiciales. Se deja constancia de que el vehículo se entrega en las condiciones que aparecen en las fotos anexas, que tiene seguro obligatorio vigente y certificado de emisión de gases, y para ello se entregan la LICENCIA DE TRÁNSITO, SEGURO OBLIGATORIO Y CERTIFICADO DE EMISIÓN DE GASES. EL ARRENDATARIO, al momento de la entrega del vehículo a la terminación del contrato, además de las condiciones generales descritas en el inventario, debe entregar el vehículo lavado o limpio.`)}

      ${clausula("QUINTA. CANON:", `Las partes pactan como canon por el alquiler ($ ${fmt(canon)}) valor en letras: ${pesosALetras(canon)}; y para garantizar los gastos que por negligencia de este sean ocasionados al vehículo, se dejará en depósito la suma de $ ${BLANK} valor en letras ${BLANK} moneda legal colombiana, los cuales se cancelarán con la firma del presente contrato. Este depósito se entregará al arrendatario una vez haya terminado el contrato más 15 días, mientras se revisa el sistema de foto multas en las oficinas de tránsito.`)}

      ${clausula("SEXTA. PROHIBICIONES:", `Queda expresamente prohibido a EL ARRENDATARIO: 1. Transportar o permitir transportar en el vehículo materiales u objetos perjudiciales a la salubridad, conservación y seguridad del mismo. 2. Transportar o permitir transportar en el vehículo armas, explosivos, drogas ilícitas o sustancias alucinógenas. 3. Destinar el vehículo para los fines prohibidos contemplados en el literal B del parágrafo del Art. 3.º del Decreto 180 de 1998 y el Art. 34 de la Ley 30 de 1986, y los demás que establezca la ley y el presente contrato. 4. Conducir el vehículo bajo los efectos del alcohol o sustancias psicoactivas.`)}

      ${clausula("SÉPTIMA. GASTOS:", `Los gastos tales como aceites, filtros, impuestos, seguros, mano de obra y, en fin, todos aquellos que sean necesarios para el buen funcionamiento y tránsito del automotor serán asumidos por cuenta del ARRENDADOR. Los repuestos, la mano de obra y la reparación que requiera el automotor por mal manejo, imprudencia o negligencia derivada del mal uso que haga del mismo EL ARRENDATARIO estarán totalmente a su cargo.<br/><br/><strong>PARÁGRAFO PRIMERO:</strong> Cualquier seguridad accesoria o implemento adicional que EL ARRENDATARIO instale en el vehículo no lo podrá retirar y pasará a la propiedad de EL ARRENDADOR; en este evento EL ARRENDATARIO renuncia expresamente a reclamar el reembolso de los gastos efectuados, así mismo renuncia a ejercer el derecho de retención o a pedir indemnización alguna con ocasión de tales mejoras y/o adaptaciones. Lo anterior sin perjuicio de que de común acuerdo se determine otra cosa.<br/><br/><strong>PARÁGRAFO SEGUNDO:</strong> En caso de que se hagan modificaciones y adecuaciones y con estas se cause perjuicio al vehículo, EL ARRENDATARIO y sus fiadores deberán responder por los mismos, sin perjuicio del cobro de las demás obligaciones derivadas del presente contrato. En todo caso, cuando a juicio de EL ARRENDADOR las modificaciones y adecuaciones no sean convenientes para el vehículo, podrá exigir su retiro, debiendo EL ARRENDATARIO entregar el vehículo sin esas modificaciones y adecuaciones. El incumplimiento de lo aquí expresado será igualmente causa de terminación del contrato, quedando EL ARRENDATARIO obligado al pago de las penas expresadas y estipuladas en el presente contrato.<br/><br/><strong>PARÁGRAFO TERCERO:</strong> Igualmente será causa de terminación del presente contrato si EL ARRENDATARIO diere motivo por mera negligencia a que el vehículo sufra desperfectos o deterioros, o que no ejecute las reparaciones que por ley y este contrato le corresponden.`)}

      ${clausula("OCTAVA. COMPROMISOS:", `El presente contrato se celebra en consideración a la persona, a las calidades y a las solicitudes que hiciera el arrendatario con anterioridad a la firma de este contrato, quien además presentó documentación correspondiente que da fe de que sabe conducir vehículos motocicletas, según lo certifica el tránsito mediante licencia o pase No. ${BLANK}. Por tanto, el arrendatario se compromete con el ARRENDADOR a que el vehículo objeto del presente contrato no podrá ser subarrendado y será conducido exclusiva y únicamente por EL ARRENDATARIO, quien toma el vehículo únicamente para las actividades descritas en el objeto del presente contrato.`)}

      ${clausula("NOVENA. ENTREGA:", `La entrega del vehículo por parte del ARRENDADOR a EL ARRENDATARIO se efectuará por cualquiera de las formas de entrega previstas en la ley civil, momento en el cual EL ARRENDATARIO deberá hacer una revisión exhaustiva del mismo y deberá indicar los daños, rayones, averías, faltantes y demás imperfectos que presente; luego de lo cual se entenderá que el vehículo fue entregado en perfectas condiciones. Por lo tanto, cualquier daño que no se hubiere advertido de manera expresa, escrita y formal al momento de la entrega correrá por cuenta de EL ARRENDATARIO, quien deberá asumir las gestiones para la reparación de los daños de acuerdo con la cláusula séptima de este contrato.`)}

      ${clausula("DÉCIMA. RESTITUCIÓN:", `EL ARRENDATARIO se obliga, a la terminación del contrato, a devolver el bien mueble vehículo en el mismo estado en que se recibió, salvo el deterioro proveniente del tiempo y uso legítimos. Si el vehículo no se entregare en las condiciones en que fue entregado, el ARRENDADOR podrá descontar de las sumas consignadas por depósito y, si no alcanzare a cubrir los gastos, EL ARRENDATARIO deberá cancelar en forma inmediata y en efectivo el valor restante. Así mismo EL ARRENDATARIO es responsable por hurto y daños no cubiertos por la respectiva póliza de seguros durante el tiempo en que lo haya tenido en su poder, y por lo que suceda en cualquier momento de abandono del vehículo sin que el ARRENDADOR lo hubiese recibido a satisfacción. EL ARRENDATARIO es exclusivo responsable de transitar por zonas de la ciudad de alto riesgo. Está completamente prohibido al ARRENDATARIO circular fuera de la ciudad y sus corregimientos.`)}

      ${clausula("DÉCIMA PRIMERA. SINIESTRO:", `Durante la vigencia de este contrato el vehículo cuenta con póliza de seguro obligatorio SOAT; los gastos por daños al vehículo serán por cuenta del ARRENDATARIO. En caso de ser retenido el vehículo por cualquier autoridad competente debido a causas imputables a EL ARRENDATARIO, será a su cargo el servicio de grúa, parqueo, multas y demás, así como la gestión para la devolución y entrega del vehículo. Mientras el vehículo se encuentre inmovilizado, los cánones que se causen los deberá cancelar el arrendatario. El arrendatario es exclusivo responsable por las infracciones de tránsito en el tiempo que estuviere el vehículo en su tenencia y deberá comunicarlas al arrendador.`)}

      ${clausula("DÉCIMA SEGUNDA. GARANTÍA:", `El arrendatario, para garantizar el cumplimiento de las obligaciones aquí consignadas, firmará a favor del arrendador un pagaré con carta de instrucciones.`)}

      ${clausula("DÉCIMA TERCERA. DOCUMENTOS ANEXOS:", `Son parte integrante de este contrato: el pagaré, la carta de instrucciones, fotocopia de la cédula del arrendatario, copia de la licencia de tránsito, copia de los documentos del vehículo, certificado de cámara de comercio y copia de este contrato.`)}

      ${clausula("DÉCIMA CUARTA. IMPUESTOS Y GASTOS:", `El valor de los derechos fiscales y demás gastos que cause el otorgamiento de este contrato, de sus prórrogas o renovaciones, o de sus cesiones, serán a cargo de EL ARRENDATARIO.`)}

      ${clausula("DÉCIMA QUINTA. MÉRITO EJECUTIVO:", `Con el lleno de los requisitos legales, cualesquiera de las obligaciones derivadas de este contrato, y en especial la de pagar el canon de arrendamiento, los daños en el vehículo imputables al ARRENDATARIO y la cláusula penal, podrán ser exigidos ejecutivamente por EL ARRENDADOR, constituyéndose en título el presente contrato. En cuanto a reparaciones, multas, parqueaderos u otros conexos, si EL ARRENDADOR se viere obligado a pagar por el incumplimiento de EL ARRENDATARIO, el primero podrá repetir lo pagado contra el segundo por la vía ejecutiva, mediante la presentación de las facturas o comprobantes debidamente cancelados, sin necesidad de estar certificados, solo con la constancia de que EL ARRENDADOR asumió el pago, y en caso de que exista certificación, conjuntamente con el presente contrato prestarán mérito ejecutivo. En cuanto a los daños y reparaciones del vehículo, si EL ARRENDADOR se viere obligado a pagar por el incumplimiento de EL ARRENDATARIO, podrá igualmente repetir lo pagado por la vía ejecutiva en los mismos términos; todo lo anterior sin necesidad de requerimiento previo para constituir en mora tanto a EL ARRENDATARIO como a sus fiadores, constitución a la cual renuncian expresamente.`)}

      ${clausula("CLÁUSULAS ADICIONALES:", `EL ARRENDATARIO autoriza al ARRENDADOR: 1. A llenar los espacios en blanco de este contrato. 2. A hacer las inspecciones y visitas en cualquier tiempo a fin de constatar el estado y conservación del vehículo. 3. Son parte integrante de este contrato los documentos que entrega el ARRENDATARIO para garantizar la solvencia: fotocopia de cédula de ARRENDATARIO y COARRENDATARIO. 4. En caso de que el ARRENDATARIO no entregue el vehículo en las instalaciones descritas y se generen gastos por recogida del vehículo, estos gastos serán a cargo del ARRENDATARIO. 5. En caso de que el ARRENDATARIO no pague los cánones en las fechas establecidas, estas moras generarán cargos de cobranza adicionales.`)}

      <div style="margin:14px 0;text-align:justify">
        En constancia de aceptación de lo anterior, se firma voluntariamente por las partes el día ${hoy}, y anula todo contrato,
        convención o convenio anterior, dejándolo sin efectos, relativo al arrendamiento del vehículo objeto del presente contrato.
      </div>

      <div style="margin-top:24px;page-break-inside:avoid">
        <div style="font-weight:700;margin-bottom:6px">ARRENDADOR</div>
        <div style="display:flex;gap:16px;align-items:flex-end">
          <div style="flex:1;text-align:center">
            ${cajaFirma(null)}
            <div style="border-top:1px solid #0f172a;padding-top:4px;font-size:10px">FREDY MORA AVENDAÑO<br/>C.C. 1.047.393.901 · Firma</div>
          </div>
        </div>
      </div>

      <div style="margin-top:20px;page-break-inside:avoid">
        <div style="font-weight:700;margin-bottom:6px">ARRENDATARIOS</div>
        <div style="display:flex;gap:16px">
          ${bloqueFirmaHuella(cliente.nombre, cliente.cedula, firmas.firmaCliente, firmas.huellaCliente)}
          ${bloqueFirmaHuella(acomp, acompCC, firmas.firmaAcompanante, firmas.huellaAcompanante)}
        </div>
      </div>

      ${firmas.selloFecha ? `<div style="margin-top:18px;font-size:9px;color:#64748b;text-align:center;border-top:1px dashed #cbd5e1;padding-top:6px">${firmas.selloFecha}</div>` : ""}
    </div>
  `;
}

// Bloque de un firmante: firma manuscrita + huella + nombre/cédula. Reutilizado en
// contrato y pagaré (los dos exigen firma + huella de ambos arrendatarios/deudores).
function bloqueFirmaHuella(nombre: string, cedula: string, firma?: string | null, huella?: string | null): string {
  return `
    <div style="flex:1;text-align:center">
      <div style="display:flex;gap:8px;align-items:flex-end;justify-content:center">
        <div style="flex:1">${cajaFirma(firma)}</div>
        <div>${cajaHuella(huella)}</div>
      </div>
      <div style="border-top:1px solid #0f172a;padding-top:4px;font-size:10px;margin-top:2px">
        ${(nombre || "").toUpperCase() || BLANK}<br/>C.C. ${cedula || BLANK}<br/>Firma / Huella
      </div>
    </div>`;
}

const PREGUNTAS_CERTIFICADO = [
  { pregunta: "¿Cuál es el valor que debe pagar cada período?", clave: "valor_periodo" },
  { pregunta: "¿Cuál es su día de pago?", clave: "dia_pago" },
  { pregunta: "¿Qué pasa si no paga el día acordado?", clave: "consecuencia_mora", respuesta: "Primero se envía un mensaje, luego se hace una llamada. Si no paga, la moto puede ser recuperada." },
  { pregunta: "¿Hasta dónde puede circular con el vehículo?", clave: "perimetro", respuesta: "Solo dentro del perímetro urbano de Cartagena y sus corregimientos." },
  { pregunta: "¿Quién es responsable si la moto recibe una multa o es retenida?", clave: "responsabilidad", respuesta: "El arrendatario es responsable de todas las multas y retenciones durante el arrendamiento." },
  { pregunta: "¿Cuándo queda liberada la moto a su nombre?", clave: "liberacion", respuesta: "Cuando acumule el ahorro total de $ 510.000 y haya cumplido el plazo del contrato." },
];

export function generarHTMLCertificado(contrato: Contrato, cliente: Cliente): string {
  const hoy = fmtFecha(hoyISO());
  const esDiario = contrato.forma_pago === "Diario" || contrato.tipo_ruta === "diario";

  const tarifaLS = fmt(contrato.tarifa_diaria ?? 27000);
  const tarifaDomingo = fmt(contrato.tarifa_domingo ?? 14000);
  const diaPago = esDiario ? "Cada día (lunes a domingo)" : formatDiaPago(contrato);

  const preguntasEspecificas = [
    {
      pregunta: "¿Cuánto es el canon diario de lunes a sábado?",
      respuestaCorrecta: `$ ${tarifaLS}`,
    },
    {
      pregunta: "¿Cuánto es el canon del domingo?",
      respuestaCorrecta: `$ ${tarifaDomingo}`,
    },
    {
      pregunta: "¿Qué pasa si sale del perímetro de Cartagena sin autorización?",
      respuestaCorrecta: "Multa de $ 50.000 y apagado remoto inmediato del vehículo",
    },
    {
      pregunta: "¿Cuánto tiempo máximo puede estar el apagado remoto activo?",
      respuestaCorrecta: "Máximo 1 hora. Luego se reactiva y se procede a recuperación física.",
    },
    {
      pregunta: "¿Cuál es el día de pago acordado?",
      respuestaCorrecta: diaPago,
    },
  ];

  return `
    <div style="font-family:Arial,sans-serif;font-size:12px;color:#0f172a;padding:32px;max-width:680px;margin:auto">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:18px;font-weight:800;text-transform:uppercase;letter-spacing:1px">GPS Satelital Cartagena</div>
        <div style="font-size:14px;font-weight:700;margin-top:6px">CERTIFICADO DE CONOCIMIENTO DEL CONTRATO</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">Cartagena de Indias, ${hoy}</div>
      </div>

      <div style="margin-bottom:16px;font-size:12px">
        Yo, <strong>${cliente.nombre.toUpperCase()}</strong>, C.C. <strong>${cliente.cedula}</strong>, certifico que entendí completamente las condiciones del contrato de arrendamiento firmado en esta fecha, respondiendo correctamente las siguientes preguntas:
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:10px 12px;border:1px solid #cbd5e1;text-align:left;width:5%">#</th>
            <th style="padding:10px 12px;border:1px solid #cbd5e1;text-align:left;width:40%">Pregunta</th>
            <th style="padding:10px 12px;border:1px solid #cbd5e1;text-align:left;width:30%">Respuesta del cliente</th>
            <th style="padding:10px 12px;border:1px solid #cbd5e1;text-align:left;width:25%;color:#166534">Respuesta correcta</th>
          </tr>
        </thead>
        <tbody>
          ${preguntasEspecificas.map((p, i) => `
            <tr>
              <td style="padding:10px 12px;border:1px solid #cbd5e1;font-weight:700">${i + 1}</td>
              <td style="padding:10px 12px;border:1px solid #cbd5e1">${p.pregunta}</td>
              <td style="padding:10px 12px;border:1px solid #cbd5e1">&nbsp;</td>
              <td style="padding:10px 12px;border:1px solid #cbd5e1;color:#166534;font-style:italic">${p.respuestaCorrecta}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div style="margin-top:24px;font-size:11px;color:#64748b">
        Declaro que esta información me fue explicada de manera clara y que la firmé de forma libre y voluntaria.
      </div>

      <div style="text-align:center;margin-top:48px">
        <div style="display:inline-block;border-top:1px solid #0f172a;padding-top:8px;font-size:11px;min-width:200px">
          ${cliente.nombre.toUpperCase()}<br/>C.C. ${cliente.cedula}<br/>Firma del arrendatario
        </div>
      </div>
    </div>
  `;
}

// Pagaré EN BLANCO + carta de instrucciones. Por diseño legal, los montos, intereses y
// fechas se dejan en blanco al firmar y solo se llenan si el deudor incumple (art. 622
// C. de Comercio). Al firmar solo se completan los deudores, el acreedor, la ciudad, la
// fecha y las firmas/huellas de ambos deudores.
export function generarHTMLPagare(_contrato: Contrato, cliente: Cliente, firmas: FirmasDoc = {}): string {
  const hoy = fmtFecha(hoyISO());
  const acomp = (cliente.acompanante_nombre ?? "").toUpperCase();
  const acompCC = cliente.acompanante_cedula ?? "";

  return `
    <div style="font-family:Arial,sans-serif;font-size:11px;color:#0f172a;line-height:1.55;padding:28px;max-width:720px;margin:auto">
      <div style="text-align:center;margin-bottom:10px">
        <div style="font-size:15px;font-weight:800">PAGARÉ No. ${BLANK}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:10px">
        <tr>
          <td style="border:1px solid #cbd5e1;padding:5px"><strong>Valor:</strong> ($ ${BLANK})</td>
          <td style="border:1px solid #cbd5e1;padding:5px"><strong>Interés mensual por plazo:</strong> ${BLANK} %</td>
          <td style="border:1px solid #cbd5e1;padding:5px"><strong>Interés mensual por mora:</strong> ${BLANK} %</td>
        </tr>
        <tr>
          <td style="border:1px solid #cbd5e1;padding:5px"><strong>Fecha de creación:</strong> ${hoy}</td>
          <td style="border:1px solid #cbd5e1;padding:5px"><strong>Fecha de primera cuota:</strong> ${BLANK}</td>
          <td style="border:1px solid #cbd5e1;padding:5px"><strong>Fecha de vencimiento:</strong> ${BLANK}</td>
        </tr>
        <tr>
          <td style="border:1px solid #cbd5e1;padding:5px"><strong>Ciudad de creación:</strong> Cartagena de Indias</td>
          <td style="border:1px solid #cbd5e1;padding:5px" colspan="2"><strong>Ciudad donde se efectuará el pago:</strong> ${BLANK}</td>
        </tr>
      </table>

      <div style="margin:8px 0">
        <strong>LOS DEUDORES:</strong><br/>
        Nombre del deudor: ${cliente.nombre.toUpperCase()} — Identificación: C.C. ${cliente.cedula}<br/>
        Nombre del deudor: ${acomp || BLANK} — Identificación: C.C. ${acompCC || BLANK}
      </div>

      <div style="margin:8px 0">
        <strong>EL ACREEDOR:</strong> FREDY MORA AVENDAÑO, persona natural, con domicilio principal en esta ciudad,
        identificado con C.C. 1.047.393.901 de Becerril (Cesar).
      </div>

      <div style="text-align:justify;margin:8px 0">
        Nosotros, ${cliente.nombre.toUpperCase()} y ${acomp || BLANK}, identificados como aparece al pie de nuestras
        correspondientes firmas, nos comprometemos de acuerdo con las siguientes declaraciones:
      </div>

      <div style="text-align:justify;margin:6px 0"><strong>PRIMERA — Objeto:</strong> Que por virtud del presente título valor (pagaré) pagaremos incondicionalmente, en la ciudad de ${BLANK}, a la orden de FREDY MORA AVENDAÑO, persona natural con domicilio principal en esta ciudad, identificado con C.C. 1.047.393.901 de Becerril, o a quien represente sus derechos, la suma de ($ ${BLANK}) junto con los intereses señalados en la cláusula tercera de este documento.</div>

      <div style="text-align:justify;margin:6px 0"><strong>SEGUNDA — Plazo:</strong> Que pagaremos la suma indicada en la cláusula anterior mediante instalamentos mensuales sucesivos, en ${BLANK} cuotas, correspondientes cada una a la cantidad de ($ ${BLANK}) más los intereses corrientes sobre el saldo, a partir del día ${BLANK} del mes de ${BLANK} del año ${BLANK}.</div>

      <div style="text-align:justify;margin:6px 0"><strong>TERCERA — Intereses:</strong> Que sobre la suma debida reconoceremos intereses equivalentes al ${BLANK} % mensual sobre el saldo de capital insoluto, los cuales se liquidarán y pagarán mes vencido junto con la cuota mensual correspondiente. En caso de mora, reconoceremos intereses moratorios del 2% mensual. PARÁGRAFO: En caso de que la tasa de interés corriente y/o moratorio pactada sobrepase los topes máximos permitidos por las disposiciones comerciales, dichas tasas se ajustarán mensualmente a los máximos legales.</div>

      <div style="text-align:justify;margin:6px 0"><strong>CUARTA — Cláusula aclaratoria:</strong> EL ACREEDOR podrá declarar insubsistentes los plazos de esta obligación o de las cuotas pendientes de pago, estén o no vencidas, y exigir el pago total e inmediato judicial o extrajudicialmente cuando EL DEUDOR incumpla cualquiera de las obligaciones derivadas del presente documento, así sea de manera parcial, por muerte de EL DEUDOR, o cuando este se declare en proceso de liquidación obligatoria o convoque a concurso de acreedores.</div>

      <div style="text-align:justify;margin:6px 0"><strong>QUINTA — Impuesto de timbre:</strong> Los gastos originados por concepto de impuesto de timbre correrán a cargo de EL DEUDOR. <strong>SEXTA — Sanciones:</strong> En caso de incumplimiento parcial o total de la obligación aquí pactada, el(los) deudor(es) cancelarán los gastos correspondientes a: honorarios de abogados en cuantía del 20% del valor total adeudado, costas y gastos del proceso, honorarios de secuestres y demás emolumentos que se acrediten siquiera sumariamente.</div>

      <div style="margin-top:22px;page-break-inside:avoid">
        <div style="font-weight:700;margin-bottom:6px">EL(LOS) DEUDOR(ES) — Firmas y huellas</div>
        <div style="display:flex;gap:16px">
          ${bloqueFirmaHuella(cliente.nombre, cliente.cedula, firmas.firmaCliente, firmas.huellaCliente)}
          ${bloqueFirmaHuella(acomp, acompCC, firmas.firmaAcompanante, firmas.huellaAcompanante)}
        </div>
      </div>

      <div style="text-align:center;margin:26px 0 10px;font-weight:800;font-size:13px">CARTA DE INSTRUCCIONES ANEXA A PAGARÉ CON ESPACIOS EN BLANCO</div>

      <div style="text-align:justify;margin:8px 0">
        Nosotros, ${cliente.nombre.toUpperCase()} y ${acomp || BLANK}, identificados como aparece al pie de nuestras firmas,
        autorizamos a FREDY MORA AVENDAÑO, persona natural con domicilio principal en esta ciudad, identificado con
        C.C. 1.047.393.901, o a quien represente sus derechos, para que, haciendo uso de las facultades conferidas por el
        artículo 622 del Código de Comercio, llene los espacios que se han dejado en blanco en el pagaré No. ${BLANK} adjunto,
        para lo cual deberá ceñirse a las siguientes instrucciones:
      </div>

      <div style="margin:6px 0">1. El monto será igual al valor de todas las obligaciones exigibles que a cargo nuestro y en favor de FREDY MORA AVENDAÑO (C.C. 1.047.393.901), o a quien represente sus derechos, existan al momento de ser llenados los espacios.</div>
      <div style="margin:6px 0">2. Los espacios en blanco se llenarán cuando ocurra cualquiera de las siguientes circunstancias:<br/>
        &nbsp;&nbsp;a. Se deje de pagar una suma de dinero por concepto de las cuotas pactadas.<br/>
        &nbsp;&nbsp;b. Se deje de pagar la suma por concepto de capital.<br/>
        &nbsp;&nbsp;c. Por concepto de los intereses causados por mora o capital.<br/>
        &nbsp;&nbsp;d. Se deje de pagar las sumas del contrato accesorio anexo al pagaré.</div>
      <div style="margin:6px 0">3. La fecha será aquella en que se llenen los espacios dejados en blanco.</div>

      <div style="margin:10px 0">Firmado en la ciudad de Cartagena de Indias, el ${hoy}.</div>

      <div style="margin-top:18px;page-break-inside:avoid">
        <div style="font-weight:700;margin-bottom:6px">Firmas y huellas</div>
        <div style="display:flex;gap:16px">
          ${bloqueFirmaHuella(cliente.nombre, cliente.cedula, firmas.firmaCliente, firmas.huellaCliente)}
          ${bloqueFirmaHuella(acomp, acompCC, firmas.firmaAcompanante, firmas.huellaAcompanante)}
        </div>
      </div>

      ${firmas.selloFecha ? `<div style="margin-top:18px;font-size:9px;color:#64748b;text-align:center;border-top:1px dashed #cbd5e1;padding-top:6px">${firmas.selloFecha}</div>` : ""}
    </div>
  `;
}

export function getPreguntas() {
  return PREGUNTAS_CERTIFICADO;
}

// Paz y Salvo — se genera cuando el cliente CUMPLE su contrato de tiempo definido:
// constancia de que no debe nada y de que la moto pasa a ser suya (la transferencia
// es automática, sin pago adicional — el ahorro acumulado durante el contrato fue
// "comprando" la moto). El cambio de titularidad ante tránsito se tramita aparte.
export function generarHTMLPazYSalvo(contrato: Contrato, cliente: Cliente, moto: Moto | null): string {
  const hoy = fmtFecha(hoyISO());
  return `
    <div style="font-family:Arial,sans-serif;font-size:12px;color:#0f172a;padding:32px;max-width:680px;margin:auto">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:18px;font-weight:800;text-transform:uppercase;letter-spacing:1px">GPS Satelital Cartagena</div>
        <div style="font-size:14px;font-weight:700;margin-top:6px">PAZ Y SALVO — CUMPLIMIENTO DE CONTRATO</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">Cartagena de Indias, ${hoy}</div>
      </div>

      <div style="margin-bottom:16px;line-height:1.8">
        <strong>GPS Satelital Cartagena</strong> (arrendador: FREDY MORA AVENDAÑO, C.C. 1.047.393.901) hace constar que
        <strong>${cliente.nombre.toUpperCase()}</strong>, identificado(a) con C.C. <strong>${cliente.cedula}</strong>,
        cumplió a cabalidad su contrato de arrendamiento con opción de adquisición
        ${contrato.fecha_entrega ? `iniciado el ${fmtFecha(contrato.fecha_entrega)}` : ""}, y se encuentra
        <strong>A PAZ Y SALVO</strong> por todo concepto con esta empresa.
      </div>

      ${moto ? `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:16px">
        <strong>VEHÍCULO QUE SE TRANSFIERE:</strong><br/><br/>
        Placa: <strong>${moto.placa}</strong> · ${moto.marca} ${moto.modelo}<br/>
        Motor: ${moto.numero_motor ?? "—"} · Chasis: ${moto.numero_chasis ?? "—"}
      </div>
      ` : ""}

      <div style="margin-bottom:16px;line-height:1.8">
        En consecuencia, el vehículo descrito pasa a ser de propiedad del cliente sin pago adicional alguno,
        quedando pendiente únicamente el trámite de cambio de titularidad ante el organismo de tránsito,
        que las partes se comprometen a adelantar.
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:48px">
        <div style="text-align:center">
          <div style="border-top:1px solid #0f172a;padding-top:8px;font-size:11px">
            FREDY MORA AVENDAÑO<br/>C.C. 1.047.393.901<br/>Arrendador
          </div>
        </div>
        <div style="text-align:center">
          <div style="border-top:1px solid #0f172a;padding-top:8px;font-size:11px">
            ${cliente.nombre.toUpperCase()}<br/>C.C. ${cliente.cedula}<br/>Cliente
          </div>
        </div>
      </div>
    </div>
  `;
}

// ACUERDO DE PAGO (convenio) — calcado del documento real de Club Moteros de la Costa.
// Tabla de deuda por concepto (de las deudas registradas del cliente) + compromiso de
// pagar una cuota adicional a la tarifa hasta saldar. Firma + huella del cliente
// (reutilizadas del registro — antes la huella se hacía a mano en papel).
const LABEL_CONCEPTO_DEUDA: Record<string, string> = {
  tarifa_atrasada: "Saldo tarifas atrasadas",
  daño_vehiculo: "Restauración del vehículo",
  multa_recoleccion: "Multa por inmovilización",
  prestamo_repuesto: "Préstamo para compra de repuestos",
  prestamo_eventualidad: "Préstamo por eventualidad",
  fotomulta: "Fotomultas",
  otro: "Otros conceptos",
};

export function generarHTMLAcuerdoPago(
  cliente: Cliente,
  moto: Moto | null,
  deudas: Array<{ concepto: string; monto_pendiente: number }>,
  convenio: { deuda_total: number; cuota_por_periodo: number; numero_cuotas: number; firma_url?: string | null },
  // Fecha de terminación del contrato (aproximada) para que el cliente sepa hasta cuándo
  // va su contrato; si fue modificada alguna vez, el documento lo aclara.
  finContrato?: { fecha: string | null; modificada: boolean },
): string {
  const hoy = fmtFecha(hoyISO());
  // Agrupa las deudas pendientes por concepto.
  const porConcepto = new Map<string, number>();
  for (const d of deudas) {
    porConcepto.set(d.concepto, (porConcepto.get(d.concepto) ?? 0) + (d.monto_pendiente ?? 0));
  }
  const sumDeudas = [...porConcepto.values()].reduce((a, v) => a + v, 0);
  const filas: Array<{ label: string; valor: number }> = [];
  for (const [concepto, valor] of porConcepto) {
    if (valor > 0) filas.push({ label: LABEL_CONCEPTO_DEUDA[concepto] ?? concepto, valor });
  }
  // Si el convenio incluyó la cuota del período (queda financiada), la diferencia aparece
  // como una fila más para que el total del documento coincida con el convenio.
  const incluido = convenio.deuda_total - sumDeudas;
  if (incluido > 0) filas.push({ label: "Cuota de período incluida en el acuerdo", valor: incluido });
  const total = convenio.deuda_total;

  return `
    <div style="font-family:Arial,sans-serif;font-size:12px;color:#0f172a;line-height:1.55;padding:32px;max-width:700px;margin:auto">
      <div style="text-align:center;margin-bottom:18px">
        <div style="font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:1px">Club Moteros de la Costa</div>
      </div>
      <div style="margin-bottom:14px">Cartagena, ${hoy}.</div>
      <div style="text-align:center;font-size:15px;font-weight:800;margin:18px 0">ACUERDO DE PAGO</div>

      <div style="margin-bottom:6px"><strong>PLACA MOTOCICLETA:</strong> ${moto?.placa ?? "—"}</div>
      <div style="margin-bottom:6px"><strong>CONDUCTOR:</strong> ${cliente.nombre.toUpperCase()}</div>
      ${finContrato?.fecha ? `
      <div style="margin-bottom:6px"><strong>FECHA DE TERMINACIÓN (APROXIMADA) DEL CONTRATO:</strong> ${fmtFecha(finContrato.fecha)}</div>
      ${finContrato.modificada ? `<div style="margin-bottom:6px;font-size:11px;color:#334155"><em>Nota: la fecha de terminación fue ajustada durante la vigencia del contrato; la fecha aproximada vigente es la indicada arriba.</em></div>` : ""}` : ""}

      <div style="font-weight:700;text-align:center;margin:16px 0 6px">DEUDA PENDIENTE</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:18px">
        <thead>
          <tr style="background:#dbeafe">
            <th style="padding:8px 10px;border:1px solid #94a3b8;text-align:left">CONCEPTO</th>
            <th style="padding:8px 10px;border:1px solid #94a3b8;text-align:right;width:30%">VALOR</th>
          </tr>
        </thead>
        <tbody>
          ${filas.map(f => `
            <tr>
              <td style="padding:7px 10px;border:1px solid #cbd5e1">${f.label}</td>
              <td style="padding:7px 10px;border:1px solid #cbd5e1;text-align:right">$ ${fmt(f.valor)}</td>
            </tr>`).join("")}
          <tr style="background:#dbeafe;font-weight:800">
            <td style="padding:8px 10px;border:1px solid #94a3b8">TOTAL</td>
            <td style="padding:8px 10px;border:1px solid #94a3b8;text-align:right">$ ${fmt(total)}</td>
          </tr>
        </tbody>
      </table>

      <div style="text-align:justify;margin-bottom:14px">
        Se realiza acuerdo de pago con el/la señor(a) <strong>${cliente.nombre.toUpperCase()}</strong> con
        C.C. <strong>${cliente.cedula}</strong>, el cual se compromete a realizar un pago de
        <strong>$ ${fmt(convenio.cuota_por_periodo)} adicionales a su tarifa</strong> (en ${convenio.numero_cuotas} cuotas)
        hasta saldar la deuda pendiente.
      </div>

      <div style="text-align:justify;margin-bottom:14px">
        Ante cualquier incumplimiento de este acuerdo, se procederá con la recolección del vehículo y la posible
        terminación del contrato.
      </div>

      <div style="margin:20px 0 30px">Acepto cabalmente.</div>

      <div style="display:flex;gap:24px;align-items:flex-end;margin-top:20px">
        <div style="flex:1;text-align:center">
          ${cajaFirma(convenio.firma_url ?? cliente.autorizacion_datos_firma_url)}
          <div style="border-top:1px solid #0f172a;padding-top:6px;font-size:11px">
            ${cliente.nombre.toUpperCase()}<br/>C.C. ${cliente.cedula} · Firma
          </div>
        </div>
        <div style="text-align:center">
          <div style="font-size:10px;color:#64748b;margin-bottom:4px">Huella</div>
          ${cajaHuella(cliente.autorizacion_datos_huella_url)}
        </div>
      </div>
    </div>
  `;
}

// ─── Estado de cuenta del cliente (general — cualquier cliente, no solo migrados) ───
// Los NÚMEROS los calcula la vista que llama (CobrosView/FichaCliente) con las mismas
// funciones de cicloPago que usan el panel y el recibo — aquí solo se presentan, para
// que el documento nunca diga una cifra distinta a la de la pantalla.
export type DatosEstadoCuenta = {
  cuotaPeriodo: number;          // valor del período (semana/quincena/mes o día)
  diaPagoLabel: string;          // "Miércoles", "Días 5 y 20", etc.
  estadoLabel: string;           // "Al día" | "Gabela" | "En mora" ...
  debeHoy: number;               // total exigible hoy (cuota pendiente + deuda/convenio)
  ahorroTotal: number;
  apertura?: { viejo: number; nuevo: number } | null; // solo migrado con empalme abierto
  // Ahorro generado pagando (suma de aplicado_ahorro de pagos confirmados) y a cuántos
  // ciclos COMPLETOS equivale — refuerza la regla: el ahorro se gana completando períodos.
  ahorroCiclos?: { monto: number; ciclos: number } | null;
  deudas: Array<{ concepto: string; pendiente: number }>;
  convenio?: { total: number; cuota: number; pagadas: number; numero: number; fechaLimite: string } | null;
  saldoFavor: number;
  pagosRecientes: Array<{ fecha: string; valor: number; metodo: string }>;
  inicioContrato?: string | null; // fecha_entrega
  finContrato?: { fecha: string | null; modificada: boolean };
  // Motor v2: avance del contrato por cuotas pagadas ("va X de N")
  cajas?: { pagadas: number; total: number } | null;
};

// Compacto a propósito: imprime bien en la térmica de 80mm (GA-E2001) y se ve limpio
// también en hoja carta o en pantalla.
export function generarHTMLEstadoCuenta(cliente: Cliente, moto: Moto | null, d: DatosEstadoCuenta): string {
  const linea = (l: string, v: string, fuerte = false) =>
    `<div style="display:flex;justify-content:space-between;gap:8px;${fuerte ? "font-weight:800" : ""}"><span>${l}</span><span style="text-align:right">${v}</span></div>`;
  const sep = `<div style="border-top:1px dashed #94a3b8;margin:8px 0"></div>`;
  return `
    <div style="font-family:'Courier New',monospace;font-size:12px;color:#000;max-width:280px;margin:0 auto;padding:8px">
      <div style="text-align:center;font-weight:800">CLUB DE MOTEROS</div>
      <div style="text-align:center;font-size:11px">ESTADO DE CUENTA · ${fmtFecha(hoyISO())}</div>
      ${sep}
      <div style="font-weight:800;text-transform:uppercase">${cliente.nombre}</div>
      <div>CC ${cliente.cedula}${moto ? ` · ${moto.placa}` : ""}</div>
      ${sep}
      ${d.inicioContrato ? linea("Inicio de contrato", fmtFecha(d.inicioContrato)) : ""}
      ${d.cajas ? linea("Avance del contrato", `${d.cajas.pagadas} de ${d.cajas.total} cuotas`, true) : ""}
      ${linea("Cuota por período", `$ ${fmt(d.cuotaPeriodo)}`)}
      ${linea("Día de pago", d.diaPagoLabel)}
      ${linea("Estado", d.estadoLabel)}
      ${linea("DEBE HOY", `$ ${fmt(d.debeHoy)}`, true)}
      ${sep}
      ${linea("Ahorro total", `$ ${fmt(d.ahorroTotal)}`, true)}
      ${d.apertura ? linea("· Traía (corte)", `$ ${fmt(d.apertura.viejo)}`) + linea("· Nuevo (sistema)", `$ ${fmt(d.apertura.nuevo)}`) : ""}
      ${d.ahorroCiclos && d.ahorroCiclos.monto > 0 ? linea("· Ganado pagando", `$ ${fmt(d.ahorroCiclos.monto)} (${d.ahorroCiclos.ciclos} ciclo${d.ahorroCiclos.ciclos === 1 ? "" : "s"} compl.)`) : ""}
      ${d.saldoFavor > 0 ? linea("Saldo a favor", `$ ${fmt(d.saldoFavor)}`) : ""}
      ${d.deudas.length > 0 ? sep + `<div style="font-weight:800">DEUDAS PENDIENTES</div>` +
        d.deudas.map(x => linea(LABEL_CONCEPTO_DEUDA[x.concepto] ?? x.concepto, `$ ${fmt(x.pendiente)}`)).join("") +
        linea("Total deudas", `$ ${fmt(d.deudas.reduce((a, x) => a + x.pendiente, 0))}`, true) : ""}
      ${d.convenio ? sep + `<div style="font-weight:800">ACUERDO DE PAGO</div>` +
        linea("Total acuerdo", `$ ${fmt(d.convenio.total)}`) +
        linea("Cuota", `$ ${fmt(d.convenio.cuota)}`) +
        linea("Va en", `${d.convenio.pagadas}/${d.convenio.numero} cuotas`) +
        linea("Fecha límite", fmtFecha(d.convenio.fechaLimite)) : ""}
      ${d.pagosRecientes.length > 0 ? sep + `<div style="font-weight:800">ÚLTIMOS PAGOS</div>` +
        d.pagosRecientes.map(p => linea(`${fmtFecha(p.fecha)} ${p.metodo === "Efectivo" ? "💵" : "🏦"}`, `$ ${fmt(p.valor)}`)).join("") : ""}
      ${d.finContrato?.fecha ? sep + linea("Fin de contrato (aprox.)", fmtFecha(d.finContrato.fecha)) +
        (d.finContrato.modificada ? `<div style="font-size:10px">* fecha ajustada durante el contrato</div>` : "") : ""}
      ${sep}
      <div style="text-align:center;font-size:10px">Documento informativo · GPS Satelital Cartagena</div>
    </div>`;
}

// Versión texto plano del estado de cuenta, para enviar por WhatsApp.
export function armarTextoEstadoCuenta(cliente: Cliente, moto: Moto | null, d: DatosEstadoCuenta): string {
  const l: string[] = [
    "📋 *ESTADO DE CUENTA — CLUB DE MOTEROS*",
    `Cliente: ${cliente.nombre}`,
    ...(moto ? [`Placa: ${moto.placa}`] : []),
    `Fecha: ${fmtFecha(hoyISO())}`,
    "",
    ...(d.inicioContrato ? [`Inicio de contrato: ${fmtFecha(d.inicioContrato)}`] : []),
    ...(d.cajas ? [`Avance: ${d.cajas.pagadas} de ${d.cajas.total} cuotas pagadas`] : []),
    `Cuota por período: $${fmt(d.cuotaPeriodo)} (paga ${d.diaPagoLabel})`,
    `Estado: ${d.estadoLabel}`,
    `*Debe hoy: $${fmt(d.debeHoy)}*`,
    "",
    `Ahorro total: $${fmt(d.ahorroTotal)}`,
  ];
  if (d.ahorroCiclos && d.ahorroCiclos.monto > 0) l.push(`Ahorro ganado pagando: $${fmt(d.ahorroCiclos.monto)} (${d.ahorroCiclos.ciclos} ciclo${d.ahorroCiclos.ciclos === 1 ? "" : "s"} completos)`);
  if (d.saldoFavor > 0) l.push(`Saldo a favor: $${fmt(d.saldoFavor)}`);
  if (d.deudas.length > 0) {
    l.push("", "*Deudas pendientes:*");
    for (const x of d.deudas) l.push(`· ${LABEL_CONCEPTO_DEUDA[x.concepto] ?? x.concepto}: $${fmt(x.pendiente)}`);
  }
  if (d.convenio) l.push("", `Acuerdo de pago: $${fmt(d.convenio.total)} en cuotas de $${fmt(d.convenio.cuota)} (va ${d.convenio.pagadas}/${d.convenio.numero})`);
  if (d.finContrato?.fecha) l.push("", `Fin de contrato (aprox.): ${fmtFecha(d.finContrato.fecha)}`);
  l.push("", "GPS Satelital Cartagena");
  return l.join("\n");
}

export function generarHTMLAutorizacionDatos(cliente: Cliente): string {
  const fechaAutorizacion = cliente.autorizacion_datos_fecha
    ? fmtFecha(cliente.autorizacion_datos_fecha.slice(0, 10))
    : fmtFecha(hoyISO());

  const categorias = [
    "Nombre completo",
    "Número de cédula",
    "Dirección de residencia",
    "Número de teléfono",
  ];
  if (cliente.foto_perfil_url) categorias.push("Fotografía de perfil (rostro)");
  const docs = cliente.documentos_cliente;
  // docs puede venir incompleto ({}) en clientes migrados por SQL → clave faltante = no cargado.
  if (docs.cedula?.ok) categorias.push("Documento de identificación (cédula)");
  if (docs.recibo1?.ok) categorias.push("Recibo de servicios públicos");
  if (docs.hojaVida?.ok) categorias.push("Hoja de vida");
  if (docs.antecedentes?.ok) categorias.push("Antecedentes judiciales");
  if (docs.licencia?.ok) categorias.push("Licencia de conducción");
  if (cliente.autorizacion_datos_huella_url) categorias.push("Huella dactilar");
  categorias.push("Firma manuscrita digital");

  return `
    <div style="font-family:Arial,sans-serif;font-size:12px;color:#0f172a;padding:32px;max-width:680px;margin:auto">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:18px;font-weight:800;text-transform:uppercase;letter-spacing:1px">GPS Satelital Cartagena</div>
        <div style="font-size:14px;font-weight:700;margin-top:6px">AUTORIZACIÓN DE TRATAMIENTO DE DATOS PERSONALES</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">Cartagena de Indias, ${fechaAutorizacion}</div>
      </div>

      <div style="margin-bottom:16px;line-height:1.7">
        De acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013, yo, <strong>${cliente.nombre.toUpperCase()}</strong>,
        identificado(a) con C.C. <strong>${cliente.cedula}</strong>, domiciliado(a) en ${cliente.direccion ?? "—"},
        autorizo de manera libre, previa, expresa e informada a <strong>GPS Satelital Cartagena</strong> (arrendador: FREDY MORA
        AVENDAÑO, C.C. 1.047.393.901) a recolectar, almacenar, usar y tratar mis datos personales, con la finalidad
        de gestionar mi contrato de arrendamiento de vehículo, verificar mi identidad y gestionar el cobro de cartera.
      </div>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:20px">
        <strong>Datos autorizados para tratamiento:</strong>
        <ul style="margin:8px 0 0;padding-left:18px;line-height:1.8">
          ${categorias.map(c => `<li>${c}</li>`).join("")}
        </ul>
      </div>

      <div style="margin-bottom:24px;line-height:1.7;font-size:11px;color:#334155">
        Entiendo que puedo conocer, actualizar, rectificar y solicitar la supresión de mis datos personales en
        cualquier momento, de conformidad con la ley, dirigiéndome directamente a GPS Satelital Cartagena.
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
        <div>
          <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:6px">Firma registrada</div>
          ${cliente.autorizacion_datos_firma_url
            ? `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:8px;background:white"><img src="${cliente.autorizacion_datos_firma_url}" style="width:100%;max-height:140px;object-fit:contain;display:block" /></div>`
            : `<div style="border:1px dashed #cbd5e1;border-radius:8px;padding:20px;text-align:center;color:#94a3b8;font-size:11px">Sin firma registrada</div>`
          }
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:6px">Huella registrada</div>
          ${cliente.autorizacion_datos_huella_url
            ? `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:8px;background:white;text-align:center"><img src="${cliente.autorizacion_datos_huella_url}" style="max-width:100px;max-height:120px;object-fit:contain;display:inline-block" /></div>`
            : `<div style="border:1px dashed #cbd5e1;border-radius:8px;padding:20px;text-align:center;color:#94a3b8;font-size:11px">Sin huella registrada</div>`
          }
        </div>
      </div>

      <div style="text-align:center;margin-top:32px">
        <div style="display:inline-block;border-top:1px solid #0f172a;padding-top:8px;font-size:11px;min-width:220px">
          ${cliente.nombre.toUpperCase()}<br/>C.C. ${cliente.cedula}<br/>Titular de los datos
        </div>
      </div>
    </div>
  `;
}
