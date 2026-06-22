import type { Contrato } from "./useContratos";
import type { Cliente } from "./useClientes";
import type { Moto } from "./useMotos";

export type TipoDocumento = "contrato" | "certificado" | "pagare";

function fmt(n: number) {
  return Math.round(n).toLocaleString("es-CO");
}

function fmtFecha(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

export function generarHTMLContrato(contrato: Contrato, cliente: Cliente, moto: Moto | null): string {
  const hoy = fmtFecha(new Date().toISOString().slice(0, 10));
  const esDiario = contrato.forma_pago === "Diario" || contrato.tipo_ruta === "diario";

  return `
    <div style="font-family:Arial,sans-serif;font-size:12px;color:#0f172a;padding:32px;max-width:680px;margin:auto">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:18px;font-weight:800;text-transform:uppercase;letter-spacing:1px">GPS Satelital Cartagena</div>
        <div style="font-size:14px;font-weight:700;margin-top:6px">CONTRATO DE ARRENDAMIENTO DE VEHÍCULO</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">Cartagena de Indias, ${hoy}</div>
      </div>

      <div style="margin-bottom:16px">
        <strong>ARRENDADOR:</strong> FREDY MORA AVENDAÑO · C.C. 1.047.393.901 · Cartagena de Indias
      </div>

      <div style="margin-bottom:16px">
        <strong>ARRENDATARIO:</strong> ${cliente.nombre.toUpperCase()} · C.C. ${cliente.cedula}<br/>
        Dirección: ${cliente.direccion ?? "—"} · Tel: ${cliente.telefono ?? "—"}
      </div>

      ${moto ? `
      <div style="margin-bottom:16px">
        <strong>VEHÍCULO:</strong> ${moto.marca} ${moto.modelo} · Placa: <strong>${moto.placa}</strong><br/>
        Motor: ${moto.numero_motor ?? "—"} · Chasis: ${moto.numero_chasis ?? "—"}
      </div>
      ` : ""}

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:16px">
        <strong>CONDICIONES ECONÓMICAS</strong><br/><br/>
        Modalidad: <strong>${contrato.forma_pago}</strong><br/>
        ${esDiario
          ? `Canon diario (L-S): <strong>$ ${fmt(contrato.tarifa_diaria ?? 27000)}</strong> · Domingo: <strong>$ ${fmt(contrato.tarifa_domingo ?? 14000)}</strong>`
          : `Canon por período: <strong>$ ${fmt(contrato.valor_semanal)}</strong> · Día de pago: <strong>${contrato.dia_pago}</strong>`
        }<br/>
        ${contrato.meses ? `Duración: <strong>${contrato.meses} meses</strong><br/>` : ""}
        Ahorro inicial entregado: <strong>$ ${fmt(contrato.ahorro_inicial)}</strong><br/>
        Base total requerida: <strong>$ 510.000</strong>
      </div>

      <div style="margin-bottom:16px;font-size:11px;line-height:1.7">
        <strong>CLÁUSULAS PRINCIPALES:</strong><br/>
        1. El arrendatario se compromete a pagar puntualmente el canon acordado en la modalidad establecida.<br/>
        2. El vehículo solo puede circular dentro del perímetro urbano de Cartagena de Indias y corregimientos. Salir sin autorización expresa del arrendador genera multa de $ 50.000 y apagado remoto inmediato.<br/>
        3. El arrendatario es responsable de cualquier daño, multa o retención del vehículo durante el período de arrendamiento.<br/>
        4. El arrendador podrá usar sirena (máx. 10 seg con vehículo detenido) y apagado remoto (máx. 1 hora) como herramientas de gestión de mora.<br/>
        5. En caso de mora superior a 2 días de gabela, se procederá a recuperación física del vehículo.<br/>
        6. Vehículos retenidos por Fiscalía o Tránsito generan deuda al arrendatario por los días inmovilizados.<br/>
        7. El incumplimiento reiterado (3er convenio incumplido) genera liquidación obligatoria del contrato.<br/>
        8. El arrendatario declara conocer y aceptar el Certificado de Conocimiento firmado en esta misma fecha.
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:48px">
        <div style="text-align:center">
          <div style="border-top:1px solid #0f172a;padding-top:8px;font-size:11px">
            FREDY MORA AVENDAÑO<br/>C.C. 1.047.393.901<br/>Arrendador
          </div>
        </div>
        <div style="text-align:center">
          <div style="border-top:1px solid #0f172a;padding-top:8px;font-size:11px">
            ${cliente.nombre.toUpperCase()}<br/>C.C. ${cliente.cedula}<br/>Arrendatario
          </div>
        </div>
      </div>
    </div>
  `;
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
  const hoy = fmtFecha(new Date().toISOString().slice(0, 10));
  const esDiario = contrato.forma_pago === "Diario" || contrato.tipo_ruta === "diario";

  const respuestas: Record<string, string> = {
    valor_periodo: esDiario
      ? `$ ${fmt(contrato.tarifa_diaria ?? 27000)} de lunes a sábado, $ ${fmt(contrato.tarifa_domingo ?? 14000)} el domingo`
      : `$ ${fmt(contrato.valor_semanal)} cada ${contrato.forma_pago?.toLowerCase()}`,
    dia_pago: esDiario ? "Cada día" : contrato.dia_pago,
  };

  const preguntas = PREGUNTAS_CERTIFICADO.map(p => ({
    ...p,
    respuesta: p.respuesta ?? respuestas[p.clave] ?? "—",
  }));

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

      ${preguntas.map((p, i) => `
        <div style="margin-bottom:14px;padding:12px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0">
          <div style="font-weight:700;margin-bottom:4px">${i + 1}. ${p.pregunta}</div>
          <div style="color:#166534;font-style:italic">R/ ${p.respuesta}</div>
        </div>
      `).join("")}

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

export function generarHTMLPagare(contrato: Contrato, cliente: Cliente): string {
  const hoy = fmtFecha(new Date().toISOString().slice(0, 10));
  const valorBase = contrato.base_inicial ?? 510000;
  const cuotas = contrato.meses ?? 12;

  return `
    <div style="font-family:Arial,sans-serif;font-size:12px;color:#0f172a;padding:32px;max-width:680px;margin:auto">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:18px;font-weight:800;text-transform:uppercase;letter-spacing:1px">GPS Satelital Cartagena</div>
        <div style="font-size:14px;font-weight:700;margin-top:6px">PAGARÉ EN BLANCO CON CARTA DE INSTRUCCIONES</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">Cartagena de Indias, ${hoy}</div>
      </div>

      <div style="border:2px solid #0f172a;border-radius:8px;padding:18px;margin-bottom:20px">
        <div style="font-size:13px;font-weight:700;margin-bottom:10px">PAGARÉ</div>
        <p style="line-height:1.8">
          Yo, <strong>${cliente.nombre.toUpperCase()}</strong>, identificado(a) con C.C. <strong>${cliente.cedula}</strong>, domiciliado en Cartagena de Indias, me comprometo a pagar incondicionalmente a la orden de <strong>FREDY MORA AVENDAÑO</strong>, C.C. 1.047.393.901, la suma de <strong>PESOS COLOMBIANOS</strong> que se indique en la correspondiente carta de instrucciones, en el lugar y fecha que allí se establezca.
        </p>
        <p style="line-height:1.8">
          Este pagaré se firma en blanco y será diligenciado por el tenedor legítimo de conformidad con la carta de instrucciones que se anexa, la cual forma parte integral del presente título valor.
        </p>
      </div>

      <div style="font-size:12px;margin-bottom:20px">
        <strong>CARTA DE INSTRUCCIONES</strong><br/><br/>
        El presente pagaré podrá ser diligenciado por <strong>FREDY MORA AVENDAÑO</strong> o quien represente sus derechos en los siguientes casos:<br/><br/>
        1. Cuando el arrendatario incumpla el pago del canon por más de <strong>15 días calendario</strong>.<br/>
        2. Por daños al vehículo no cubiertos por garantía de fábrica, según valoración del taller.<br/>
        3. Por multas o fotomultas generadas durante el período de arrendamiento.<br/>
        4. Por valor de la base pendiente ($ ${fmt(valorBase)}) si el contrato termina sin completarla.<br/><br/>
        El monto máximo a llenar será el equivalente a <strong>${cuotas} cuotas</strong> de arrendamiento más los perjuicios causados.
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:48px">
        <div style="text-align:center">
          <div style="border-top:1px solid #0f172a;padding-top:8px;font-size:11px">
            ${cliente.nombre.toUpperCase()}<br/>C.C. ${cliente.cedula}<br/>Deudor
          </div>
        </div>
        <div style="text-align:center">
          <div style="border-top:1px solid #0f172a;padding-top:8px;font-size:11px">
            Acompañante / Codeudor<br/>C.C. ${cliente.acompanante_cedula ?? "—"}<br/>${(cliente.acompanante_nombre ?? "—").toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function getPreguntas() {
  return PREGUNTAS_CERTIFICADO;
}
