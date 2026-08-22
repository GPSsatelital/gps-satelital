import type { Liquidacion } from "../hooks/useLiquidaciones";

// EL DOCUMENTO DE LIQUIDACIÓN, EN TRES MODOS, DESDE UN SOLO HTML.
//
//   · borrador  → marca de agua "BORRADOR", firmas en blanco. Es lo que el cliente LEE antes.
//   · firmado   → con la firma y la huella incrustadas. Es lo que se guarda y vale.
//   · reimpresión → el mismo firmado, cuando haya que volver a sacarlo.
//
// Es UN solo armador para los tres: si cada modo tuviera su copia, el borrador que el cliente
// revisa podría decir una cosa y el que firma otra — y acá el número se FIRMA.
//
// Colores en hex a propósito, NUNCA var(--…): esto se abre en ventana aparte (sin el CSS de la
// app) y también pasa por html2canvas, que revienta con "unsupported color function var".

type Cliente = { nombre: string; cedula?: string; telefono?: string };
type Moto = { marca?: string; modelo?: string; placa?: string };

const MOTIVO_LABEL: Record<string, string> = {
  cumplimiento: "Cumplimiento de contrato",
  retiro_voluntario: "Retiro voluntario del cliente",
  incumplimiento: "Retiro por incumplimiento",
};

function cop(n: number) {
  return `$${Math.abs(n).toLocaleString("es-CO")}`;
}

/**
 * Un renglón de descuento. Monto NEGATIVO = plata que se le SUMA al cliente, y se muestra con
 * "+" en verde: si saliera con "−" como los demás, el cliente vería que le restan su propio
 * ahorro y la tabla no cuadraría con el saldo final.
 *
 * El rótulo "Deuda:" solo va en lo que escribió una persona. Los renglones del cálculo ya se
 * explican solos ("Días que rodó y no pagó") y llamarlos "Deuda:" sería decir mal qué son.
 */
function renglon(d: { concepto: string; monto: number; auto?: boolean }) {
  const credito = d.monto < 0;
  const etiqueta = d.auto ? d.concepto : `Deuda: ${d.concepto}`;
  return `<tr><td>${etiqueta}</td><td style="${credito ? "color:#166534" : ""}">${credito ? "+" : "-"} ${cop(d.monto)}</td></tr>`;
}

export type OpcionesDocumento = {
  /** Marca de agua "BORRADOR" y aviso de que todavía no vale. */
  borrador?: boolean;
  /** dataURL o URL de la firma capturada en pantalla. */
  firmaUrl?: string | null;
  /** dataURL o URL de la huella capturada con el lector. */
  huellaUrl?: string | null;
  /** Fecha en que firmó, para el pie del documento. */
  fechaFirma?: string | null;
};

export function htmlLiquidacion(
  liq: Liquidacion,
  cliente: Cliente,
  moto: Moto | null,
  opts: OpcionesDocumento = {}
) {
  const { borrador = false, firmaUrl = null, huellaUrl = null, fechaFirma = null } = opts;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Liquidación ${liq.numero}</title>
<style>
  /* Tamaño CARTA: es el papel que se usa acá. Todo el documento tiene que caber en UNA hoja —
     antes la constancia y las firmas se iban a una segunda página casi vacía. Carta (279mm) es
     más corta que A4 (297mm), así que si cabe en carta cabe también en el PDF, que se arma en A4. */
  @page { size: letter; margin: 12mm; }
  /* El espacio se aprieta acá, en la hoja de siempre — NO dentro de @media print. El PDF que se
     guarda al firmar se arma con html2canvas, que renderiza en modo PANTALLA: cualquier ahorro
     que viva solo en @media print no lo ve, y el PDF sale con el tamaño viejo. */
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #0f172a; padding: 26px; position: relative; }
  h1 { font-size: 20px; text-align: center; margin-bottom: 2px; }
  .subtitulo { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 14px; }
  .seccion { margin-bottom: 12px; }
  .seccion h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0284c7; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 7px; }
  /* Los datos van en DOS columnas: uno debajo de otro gastaba media hoja en cuatro renglones. */
  .datos { display: flex; flex-wrap: wrap; gap: 2px 28px; }
  .fila { display: flex; justify-content: space-between; gap: 14px; margin-bottom: 4px; flex: 1 1 44%; min-width: 0; }
  .fila span:first-child { color: #64748b; }
  .fila span:last-child { font-weight: 600; text-align: right; }
  .tabla { width: 100%; border-collapse: collapse; margin-top: 6px; }
  .tabla th, .tabla td { padding: 6px 10px; border: 1px solid #e2e8f0; text-align: left; font-size: 12px; }
  .tabla th { background: #f8fafc; font-weight: 700; }
  .total-row td { font-weight: 700; background: #f1f5f9; }
  .saldo-positivo { color: #166534; font-size: 18px; font-weight: 800; }
  .saldo-negativo { color: #991b1b; font-size: 18px; font-weight: 800; }
  .explica { margin-top: 10px; padding: 9px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11.5px; line-height: 1.5; color: #334155; }
  .explica p { margin-bottom: 5px; }
  .explica p:last-child { margin-bottom: 0; }
  /* Una liquidación normal cabe en UNA hoja carta. Una con muchos renglones (varias deudas +
     varios daños) necesita dos, y eso está bien — lo que no puede pasar es que corte mal:
     una fila de plata partida por la mitad, o la firma sola en una hoja aparte. */
  .cierre { page-break-inside: avoid; break-inside: avoid; }
  .explica, .seccion, .tabla tr { page-break-inside: avoid; break-inside: avoid; }
  .tabla thead { display: table-header-group; }   /* el encabezado se repite en la 2ª hoja */
  .firmas { display: flex; gap: 26px; margin-top: 26px; align-items: flex-end; }
  .firma-box { flex: 1; text-align: center; font-size: 12px; }
  .firma-trazo { height: 50px; display: flex; align-items: flex-end; justify-content: center; }
  .firma-trazo img { max-height: 48px; max-width: 100%; }
  .firma-linea { border-top: 1px solid #334155; padding-top: 8px; }
  .huella-box { width: 110px; text-align: center; font-size: 11px; color: #64748b; }
  .huella-cuadro { width: 92px; height: 92px; margin: 0 auto 5px; border: 1px solid #334155; border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .huella-cuadro img { max-width: 100%; max-height: 100%; }
  .constancia { margin-top: 18px; font-size: 11px; color: #475569; line-height: 1.55; text-align: justify; }
  .numero-liq { position: absolute; top: 40px; right: 40px; font-size: 12px; color: #64748b; }
  .marca-borrador { position: absolute; top: 42%; left: 0; width: 100%; text-align: center; font-size: 90px; font-weight: 800; color: #e2e8f0; letter-spacing: 14px; transform: rotate(-22deg); z-index: 0; }
  .aviso-borrador { border: 2px dashed #b45309; background: #fef3c7; color: #92400e; border-radius: 8px; padding: 10px 14px; margin-bottom: 20px; font-size: 12px; font-weight: 700; text-align: center; }
  .contenido { position: relative; z-index: 1; }
  /* Al imprimir manda el margen de @page; el padding del body lo sumaría encima y comería
     otros 80px de alto, que es justo lo que hacía que no cupiera en una hoja. */
  @media print { body { padding: 0; } .numero-liq { top: 0; right: 0; } }
</style>
</head>
<body>
${borrador ? `<div class="marca-borrador">BORRADOR</div>` : ""}
<div class="contenido">
<div class="numero-liq">${liq.numero} · ${new Date(liq.created_at).toLocaleDateString("es-CO")}</div>
<h1>Club Moteros Cartagena</h1>
<p class="subtitulo">DOCUMENTO DE LIQUIDACIÓN DE CONTRATO</p>

${borrador ? `<div class="aviso-borrador">
  Esta es una copia de revisión. Todavía NO está firmada y no tiene valor.<br/>
  Léala con calma: si algo no le cuadra, dígalo antes de firmar.
</div>` : ""}

<div class="seccion">
  <h2>Datos del cliente${moto ? " y del vehículo" : ""}</h2>
  <div class="datos">
    <div class="fila"><span>Nombre</span><span>${cliente.nombre}</span></div>
    ${cliente.cedula ? `<div class="fila"><span>Cédula</span><span>${cliente.cedula}</span></div>` : ""}
    ${cliente.telefono ? `<div class="fila"><span>Teléfono</span><span>${cliente.telefono}</span></div>` : ""}
    ${moto?.placa ? `<div class="fila"><span>Placa</span><span>${moto.placa}</span></div>` : ""}
    ${moto?.marca ? `<div class="fila"><span>Marca</span><span>${moto.marca}</span></div>` : ""}
    ${moto?.modelo ? `<div class="fila"><span>Modelo</span><span>${moto.modelo}</span></div>` : ""}
  </div>
</div>

<div class="seccion">
  <h2>Motivo de liquidación</h2>
  <div class="fila"><span>Motivo</span><span>${MOTIVO_LABEL[liq.motivo] ?? liq.motivo}</span></div>
  ${liq.observaciones_taller ? `<div class="fila"><span>Observaciones taller</span><span>${liq.observaciones_taller}</span></div>` : ""}
</div>

<div class="seccion">
  <h2>Liquidación financiera</h2>
  <table class="tabla">
    <thead><tr><th>Concepto</th><th>Valor</th></tr></thead>
    <tbody>
      <tr><td>Ahorro acumulado</td><td>${cop(liq.ahorro_acumulado)}</td></tr>
      ${(liq.saldo_favor ?? 0) > 0 ? `<tr><td>Saldo a favor (plata suya sin usar)</td><td>${cop(liq.saldo_favor)}</td></tr>` : ""}
      ${liq.detalle_deudas.map((d) => renglon(d)).join("")}
      ${liq.detalle_danos.map((d) => `<tr><td>Daño: ${d.concepto}</td><td>- ${cop(d.monto)}</td></tr>`).join("")}
      <tr class="total-row"><td>SALDO FINAL</td><td class="${liq.saldo_final >= 0 ? "saldo-positivo" : "saldo-negativo"}">${liq.saldo_final >= 0 ? cop(liq.saldo_final) : `(${cop(liq.saldo_final)}) — CLIENTE DEBE`}</td></tr>
    </tbody>
  </table>

  <div class="explica">
    <p><strong>Cómo se hizo esta cuenta.</strong> Se sumó todo lo que es del cliente —su ahorro
    acumulado${(liq.saldo_favor ?? 0) > 0 ? ", su saldo a favor" : ""}— y se le descontó lo que
    debía: los días que usó la moto y no pagó, sus deudas registradas, lo que le faltaba de su
    acuerdo de pago, y los daños que se le atribuyen.</p>
    <p><strong>Hasta qué día se contó.</strong> Solo se le cobró hasta el día en que la moto
    volvió a la empresa. Los días que la moto estuvo guardada en la bodega NO se le cobraron.</p>
    ${liq.saldo_final >= 0
      ? `<p><strong>Resultado.</strong> A favor del cliente: se le entregan ${cop(liq.saldo_final)}.</p>`
      : `<p><strong>Resultado.</strong> El ahorro no alcanzó a cubrir lo que debía. Queda pendiente
         ${cop(liq.saldo_final)}, que continúa como deuda a su nombre.</p>`}
    ${liq.detalle_danos.length > 0
      ? `<p><strong>Sobre los daños.</strong> Solo se cobra lo que el cliente dañó. El desgaste
         normal del uso —frenos, aceite, llantas— lo asume la empresa y no aparece aquí.</p>` : ""}
  </div>
</div>

<div class="cierre">
<div class="firmas">
  <div class="firma-box">
    <div class="firma-trazo"></div>
    <div class="firma-linea">
      <p style="font-weight:700;text-transform:uppercase">${liq.nombre_responsable ?? "________________________"}</p>
      <p style="color:#64748b">${liq.cargo_responsable ?? "Responsable Club Moteros Cartagena"}</p>
      <p style="margin-top:4px;color:#64748b">Por la empresa</p>
    </div>
  </div>
  <div class="firma-box">
    <div class="firma-trazo">${firmaUrl ? `<img src="${firmaUrl}" alt="Firma del cliente"/>` : ""}</div>
    <div class="firma-linea">
      <p style="font-weight:700;text-transform:uppercase">${cliente.nombre}</p>
      ${cliente.cedula ? `<p style="color:#64748b">C.C. ${cliente.cedula}</p>` : ""}
      <p style="margin-top:4px;color:#64748b">El cliente</p>
    </div>
  </div>
  <div class="huella-box">
    <div class="huella-cuadro">${huellaUrl ? `<img src="${huellaUrl}" alt="Huella del cliente"/>` : ""}</div>
    <p>Huella del cliente</p>
  </div>
</div>

<p class="constancia">
  Con su firma y su huella el cliente declara que revisó esta cuenta renglón por renglón, que está
  de acuerdo con las cifras aquí detalladas, que recibe a satisfacción el saldo que le corresponde
  y que no queda ninguna reclamación pendiente por este contrato.
  ${fechaFirma ? `Firmado el ${new Date(fechaFirma).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}.` : ""}
</p>
</div>
</div>
</body>
</html>`;
}

/** Abre el documento en una ventana aparte y manda a imprimir. */
export function imprimirLiquidacion(
  liq: Liquidacion,
  cliente: Cliente,
  moto: Moto | null,
  opts: OpcionesDocumento = {}
) {
  const ventana = window.open("", "_blank", "width=800,height=900");
  if (!ventana) return;
  ventana.document.write(htmlLiquidacion(liq, cliente, moto, opts));
  ventana.document.close();
  ventana.focus();
  setTimeout(() => ventana.print(), 400);
}

/** Nombre viejo, conservado para no romper las llamadas que ya existen. */
export const generarDocumentoLiquidacion = imprimirLiquidacion;
