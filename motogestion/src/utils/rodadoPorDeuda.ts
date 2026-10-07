// RODAR POR DEUDA (D-044, mig 191). La CUENTA vive en la base (`calcular_rodado_por_deuda`, hecha con
// la misma función de la vitrina): aquí solo van los tipos, la regla de las semanas de más (para
// mostrarla y probarla), lo que el cliente dice en el video y el documento que firma.
//
// Colores en hex en el documento, NUNCA var(--…): se imprime en ventana aparte y html2canvas no
// entiende las variables de la app.

export type DeudaRodable = { deuda_id: string; concepto: string; que_es?: string; descripcion: string | null; pendiente: number };
export type DeudaRodada = { deuda_id: string; concepto: string; descripcion: string | null; monto: number; completa: boolean };

export type CalculoRodado = {
  puede: boolean;
  razones: string[];
  avisos: string[];
  contrato_id: string;
  cliente_id?: string;
  cliente?: string;
  cedula?: string | null;
  placa?: string;
  grupo?: string;
  valor_semana?: number;
  hoy?: string;
  antes?: { cuotas: number; acuerdo: number; deudas: number; total: number; estado: string | null; dias_mora: number | null };
  prorrateo?: number;
  cuotas_rodables?: number;
  deudas_tiempo?: DeudaRodable[];
  deudas_no_rodables?: DeudaRodable[];
  tiempo_total?: number;
  cajas_corridas?: number;
  deudas_rodadas?: DeudaRodada[];
  monto_deudas_rodadas?: number;
  semanas_rodadas?: number;
  semanas_extra?: number;
  semanas_a_cobrar?: number;
  monto_rodado?: number;
  monto_a_cobrar?: number;
  sobrante?: number;
  acuerdo?: {
    convenio_id: string; numero: number | null; cuota: number; falta_antes: number; periodos_corridos: number;
    monto_corrido: number; fecha_limite_antes: string | null; fecha_limite_despues: string | null;
  } | null;
  despues?: { cuotas: number; acuerdo: number; deudas: number; total: number; estado: string | null; dias_mora: number | null };
  total_cajas_antes?: number;
  total_cajas_despues?: number;
  exoneradas_antes?: number;
  exoneradas_despues?: number;
  fecha_fin_antes?: string | null;
  fecha_fin_aprox?: string | null;
};

export type RodadoPorDeuda = {
  id: string; numero: string; contrato_id: string; cliente_id: string | null; fecha: string; creado_por: string;
  valor_semana: number; debia_total: number; semanas_rodadas: number; semanas_extra: number; semanas_a_cobrar: number;
  monto_rodado: number; monto_a_cobrar: number; sobrante: number; queda_debiendo: number;
  acuerdo_periodos_corridos: number; acuerdo_monto_corrido: number;
  fecha_fin_antes: string | null; fecha_fin_aprox: string | null;
  documento_url: string; firma_cliente_url: string; firma_acompanante_url: string | null; video_url: string;
  estado: "vigente" | "saldado" | "cobrado_en_liquidacion" | "anulado";
  deudas_rodadas: DeudaRodada[];
  created_at: string;
};

/** Las semanas que paga al final por N semanas rodadas (D-044): hasta 4, una más; desde la 5ª, una
 *  más por cada 2 completas. 3→4 · 4→5 · 5→6 · 6→8 · 7→9 · 8→11 · 10→14. Espejo de la mig 191. */
export function semanasACobrar(rodadas: number): number {
  if (rodadas <= 0) return 0;
  const extra = rodadas <= 4 ? 1 : 1 + Math.floor((rodadas - 4) / 2);
  return rodadas + extra;
}

export const pesos = (n: number | null | undefined) => `$${Math.round(n ?? 0).toLocaleString("es-CO")}`;

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
/** "7 de octubre de 2026" */
export function fechaLarga(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} de ${MESES[m - 1]} de ${a}`;
}

const sem = (n: number) => `${n} ${n === 1 ? "semana" : "semanas"}`;

/** Lo que el cliente dice en el video, con sus cifras. La fecha del día va de primero (pedido del dueño). */
export function textoDeclaracion(c: CalculoRodado, hoyISO: string): string {
  return `Hoy, ${fechaLarga(hoyISO)}, yo, ${(c.cliente ?? "").toUpperCase()}, con cédula ${c.cedula ?? "—"}, `
    + `acepto que se me ruedan ${sem(c.semanas_rodadas ?? 0)} que debo al final de mi contrato, `
    + `que al final pagaré ${sem(c.semanas_a_cobrar ?? 0)}, `
    + `que mi contrato termina aproximadamente el ${fechaLarga(c.fecha_fin_aprox)}, `
    + `y que la empresa no cubre el SOAT ni la tecnomecánica durante ese tiempo extra.`;
}

export type OpcionesDocRodado = { borrador?: boolean; firmaCliente?: string | null; firmaAcompanante?: string | null; acompanante?: string | null; fechaFirma?: string | null; numero?: string | null };

/** El documento del rodado: lo lee el cliente (borrador) y lo firma (firmado → PDF). */
export function htmlRodadoPorDeuda(c: CalculoRodado, o: OpcionesDocRodado = {}): string {
  const n = c.semanas_rodadas ?? 0, cobrar = c.semanas_a_cobrar ?? 0, extra = c.semanas_extra ?? 0;
  const noRodadas = (c.deudas_no_rodables ?? []).filter(d => d.pendiente > 0);
  const ac = c.acuerdo && c.acuerdo.periodos_corridos > 0 ? c.acuerdo : null;
  const firma = (img: string | null | undefined, nombre: string, rol: string, cedula?: string | null) => `
    <div class="firma-box">
      <div class="firma-trazo">${img ? `<img src="${img}" alt="Firma"/>` : ""}</div>
      <div class="firma-linea">
        <p style="font-weight:700;text-transform:uppercase">${nombre}</p>
        ${cedula ? `<p style="color:#64748b">C.C. ${cedula}</p>` : ""}
        <p style="margin-top:4px;color:#64748b">${rol}</p>
      </div>
    </div>`;
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/>
<title>Acuerdo de rodado por deuda — ${c.placa ?? ""}</title>
<style>
  @page { size: letter; margin: 12mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #0f172a; padding: 26px; position: relative; }
  @media print { body { padding: 0; } }
  h1 { font-size: 19px; text-align: center; margin-bottom: 2px; }
  .subtitulo { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 18px; }
  .datos { display: flex; flex-wrap: wrap; gap: 2px 28px; margin-bottom: 14px; }
  .fila { display: flex; justify-content: space-between; gap: 14px; flex: 1 1 44%; min-width: 0; margin-bottom: 4px; }
  .fila span:first-child { color: #64748b; }
  .fila span:last-child { font-weight: 600; text-align: right; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; font-size: 12.5px; }
  td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
  td:last-child { text-align: right; font-weight: 600; white-space: nowrap; }
  .clausulas { line-height: 1.6; font-size: 12.5px; }
  .clausulas li { margin: 0 0 9px 18px; }
  .destacado { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin: 12px 0; font-size: 13px; line-height: 1.5; }
  .advertencia { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 10px 14px; margin: 12px 0; font-size: 12.5px; color: #78350f; line-height: 1.5; }
  .cierre { page-break-inside: avoid; break-inside: avoid; }
  .firmas { display: flex; gap: 22px; margin-top: 30px; align-items: flex-end; flex-wrap: wrap; }
  .firma-box { flex: 1 1 180px; text-align: center; font-size: 12px; }
  .firma-trazo { height: 96px; display: flex; align-items: flex-end; justify-content: center; }
  .firma-trazo img { max-height: 92px; max-width: 100%; }
  .firma-linea { border-top: 1px solid #334155; padding-top: 8px; }
  .constancia { margin-top: 14px; font-size: 11px; color: #475569; line-height: 1.55; text-align: justify; }
  .marca-borrador { position: absolute; top: 42%; left: 0; width: 100%; text-align: center; font-size: 90px; font-weight: 800; color: #e2e8f0; letter-spacing: 14px; transform: rotate(-22deg); z-index: 0; }
  .aviso-borrador { border: 2px dashed #b45309; background: #fef3c7; color: #92400e; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; font-size: 12px; font-weight: 700; text-align: center; }
  .contenido { position: relative; z-index: 1; }
</style></head>
<body>
${o.borrador ? `<div class="marca-borrador">BORRADOR</div>` : ""}
<div class="contenido">
<h1>Club Moteros Cartagena</h1>
<p class="subtitulo">ACUERDO DE RODADO POR DEUDA${o.numero ? ` · ${o.numero}` : ""}</p>
${o.borrador ? `<div class="aviso-borrador">Esta es una copia de revisión. Todavía NO está firmada y no tiene valor.<br/>Léala con calma: si algo no le cuadra, dígalo antes de firmar.</div>` : ""}

<div class="datos">
  <div class="fila"><span>Cliente</span><span style="text-transform:uppercase">${c.cliente ?? ""}</span></div>
  ${c.cedula ? `<div class="fila"><span>Cédula</span><span>${c.cedula}</span></div>` : ""}
  <div class="fila"><span>Placa</span><span>${c.placa ?? ""}</span></div>
  <div class="fila"><span>Fecha</span><span>${fechaLarga(c.hoy)}</span></div>
  <div class="fila"><span>Valor de la semana</span><span>${pesos(c.valor_semana)}</span></div>
</div>

<table>
  <tr><td>Lo que el cliente debía hoy</td><td>${pesos(c.antes?.total)}</td></tr>
  <tr><td>Semanas completas que se ruedan al final del contrato</td><td>${sem(n)} (${pesos(c.monto_rodado)})</td></tr>
  <tr><td>Semanas que pagará al final (incluye ${sem(extra)} de recargo)</td><td>${sem(cobrar)} (${pesos(c.monto_a_cobrar)})</td></tr>
  <tr><td>Lo que queda debiendo hoy y debe pagar ya</td><td>${pesos(c.despues?.total)}</td></tr>
  <tr><td>Fecha aproximada de fin del contrato</td><td>${fechaLarga(c.fecha_fin_antes)} pasa al ${fechaLarga(c.fecha_fin_aprox)}</td></tr>
</table>

<div class="clausulas"><ol>
  <li>El cliente debía <strong>${pesos(c.antes?.total)}</strong>. De esa deuda, lo que corresponde a <strong>tiempo de uso de la moto</strong>
    (semanas atrasadas del contrato y tarifas atrasadas) suma <strong>${pesos(c.tiempo_total)}</strong>.</li>
  <li>De común acuerdo, <strong>${sem(n)} completas</strong> (${pesos(c.monto_rodado)}) <strong>se ruedan al final del contrato</strong>:
    desde hoy no se le cobran ni le aparecen en mora. <strong>No se perdonan: se pagan al final.</strong></li>
  <li>Por el desgaste extra de la moto durante ese tiempo adicional, al final el cliente pagará
    <strong>${sem(cobrar)}</strong> en lugar de ${sem(n)}: ${sem(extra)} de recargo. Son semanas normales, de ${pesos(c.valor_semana)} cada una.</li>
  ${(c.sobrante ?? 0) > 0 ? `<li>Lo de tiempo que no alcanza a ser una semana completa (<strong>${pesos(c.sobrante)}</strong>) no se rueda: el cliente lo paga hoy.</li>` : ""}
  ${noRodadas.length ? `<li>Las deudas que no son tiempo <strong>no se ruedan</strong> y las sigue debiendo:
    ${noRodadas.map(d => `${d.que_es ?? d.concepto}${d.descripcion ? ` (${d.descripcion})` : ""}: ${pesos(d.pendiente)}`).join("; ")}.</li>` : ""}
  ${ac ? `<li>Su <strong>acuerdo de pago #${ac.numero ?? ""}</strong> sigue con su cuota de ${pesos(ac.cuota)}. Lo que tenía atrasado
    (${pesos(ac.monto_corrido)}) se corre al final del mismo acuerdo, que ahora vence el <strong>${fechaLarga(ac.fecha_limite_despues)}</strong>.</li>` : ""}
  <li>El contrato termina aproximadamente el <strong>${fechaLarga(c.fecha_fin_aprox)}</strong>. Es una fecha aproximada:
    el contrato termina cuando se completan todos los pagos; si el cliente se atrasa, la fecha se corre.</li>
  <li>Si el cliente entrega la moto antes de terminar, en la liquidación se le cobran las semanas rodadas que no haya pagado
    (sin el recargo).</li>
  <li>Este rodado se hace una sola vez por contrato.</li>
</ol></div>

<div class="advertencia"><strong>Importante:</strong> durante el tiempo extra que se alarga el contrato por este rodado,
  <strong>la empresa no cubre el SOAT ni la revisión tecnomecánica</strong> de la moto. Si alguno vence en ese tiempo,
  su pago corre por cuenta del cliente.</div>

<div class="destacado">En resumen: hoy queda debiendo <strong>${pesos(c.despues?.total)}</strong>, y al final de su contrato
  paga <strong>${sem(cobrar)}</strong> más, que terminan aproximadamente el <strong>${fechaLarga(c.fecha_fin_aprox)}</strong>.</div>

<div class="cierre">
<div class="firmas">
  ${firma(null, "Club Moteros Cartagena", "Por la empresa")}
  ${firma(o.firmaCliente, c.cliente ?? "", "El cliente", c.cedula)}
  ${o.acompanante ? firma(o.firmaAcompanante, o.acompanante, "Acompañante") : ""}
</div>
<p class="constancia">Con su firma el cliente declara que leyó este acuerdo, que lo entiende y que está de acuerdo.
  Además dejó grabada su aceptación en video, diciendo la fecha del día.
  ${o.fechaFirma ? `Firmado el ${fechaLarga(o.fechaFirma)}.` : ""}</p>
</div>
</div>
</body></html>`;
}
