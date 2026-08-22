import type { Liquidacion } from "../hooks/useLiquidaciones";

// RECIBO DE EGRESO DE UNA LIQUIDACIÓN — la plata que la empresa le DEVUELVE al cliente.
//
// Se le envía al socio dueño del portafolio para explicarle por qué salió esa plata de lo suyo.
// A diferencia del premio de referidos (que se reparte entre varios portafolios), acá es UNO
// solo: la moto pertenece a un grupo y ese grupo paga completo.
//
// ⚠️ ESTE PAPEL NO MUEVE LA CAJA. Hoy el sistema no tiene dónde anotar lo que SALE — la tabla de
// egresos está diseñada pero sin construir (ver memoria modulo-egresos-disenado). El recibo lo
// dice en el pie, para que nadie lo lea como un movimiento ya registrado.
//
// Colores en hex a propósito, NUNCA var(--…): se abre en ventana aparte, sin el CSS de la app.

function cop(n: number) {
  return `$${Math.round(Math.abs(n)).toLocaleString("es-CO")}`;
}

function fechaLarga(iso: string) {
  const d = new Date(iso.length > 10 ? iso : iso + "T00:00:00");
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

const MOTIVO_LABEL: Record<string, string> = {
  cumplimiento: "Cumplimiento de contrato",
  retiro_voluntario: "Retiro voluntario del cliente",
  incumplimiento: "Retiro por incumplimiento",
};

export function generarReciboEgresoLiquidacion(
  liq: Liquidacion,
  cliente: { nombre: string; cedula?: string },
  moto: { placa?: string; grupo?: string } | null,
  entregadoPorNombre: string,
) {
  const grupo = moto?.grupo ?? "SIN PORTAFOLIO";
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Egreso liquidación ${liq.numero} — ${grupo}</title>
<style>
  /* Carta, igual que el documento de liquidación: es el papel que se usa acá. Sin esta regla el
     navegador asume A4 y el recibo puede partirse en dos hojas. */
  @page { size: letter; margin: 12mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #0f172a; padding: 30px; }
  @media print { body { padding: 0; } }
  h1 { font-size: 20px; margin-bottom: 2px; }
  .sub { font-size: 12px; color: #64748b; margin-bottom: 20px; }
  .portafolio { display: inline-block; padding: 5px 14px; border-radius: 999px; background: #0f172a; color: #ffffff; font-weight: bold; font-size: 13px; letter-spacing: 0.5px; }
  .monto { font-size: 32px; font-weight: bold; margin: 14px 0 2px; }
  .monto-lbl { font-size: 12px; color: #64748b; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
  td { padding: 8px 0; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  td.k { color: #64748b; width: 34%; }
  td.v { font-weight: bold; }
  .desglose { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
  .desglose td { padding: 6px 10px; border: 1px solid #e2e8f0; font-size: 12px; }
  .desglose .tot td { font-weight: bold; background: #f1f5f9; }
  .nota { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #334155; line-height: 1.5; margin-bottom: 18px; }
  .desglose tr, .nota { page-break-inside: avoid; break-inside: avoid; }
  /* Las dos firmas y el pie no se separan del recibo: es la constancia de que la plata se entregó. */
  .firma { margin-top: 44px; display: flex; gap: 40px; page-break-inside: avoid; break-inside: avoid; }
  .firma > div { flex: 1; }
  .firma p { margin-bottom: 3px; }
  .linea { border-top: 1px solid #0f172a; margin-bottom: 4px; }
  .pie { margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5; }
</style>
</head>
<body>
  <h1>Recibo de egreso — Liquidación de contrato</h1>
  <div class="sub">Club de Moteros · Cartagena · ${liq.numero}</div>

  <span class="portafolio">${grupo}</span>
  <div class="monto">${cop(liq.saldo_final)}</div>
  <div class="monto-lbl">Valor que sale de este portafolio</div>

  <table>
    <tr><td class="k">A quién se le entregó</td><td class="v" style="text-transform:uppercase">${cliente.nombre}</td></tr>
    ${cliente.cedula ? `<tr><td class="k">Cédula</td><td class="v">${cliente.cedula}</td></tr>` : ""}
    ${moto?.placa ? `<tr><td class="k">Moto</td><td class="v">${moto.placa}</td></tr>` : ""}
    <tr><td class="k">Motivo del cierre</td><td class="v">${MOTIVO_LABEL[liq.motivo] ?? liq.motivo}</td></tr>
    <tr><td class="k">Fecha de la liquidación</td><td class="v">${fechaLarga(liq.created_at)}</td></tr>
    <tr><td class="k">Entregado por</td><td class="v" style="text-transform:uppercase">${entregadoPorNombre}</td></tr>
  </table>

  <table class="desglose">
    ${liq.detalle_favor?.length
      ? liq.detalle_favor.map(d => `<tr><td>${d.concepto}</td><td style="text-align:right${d.monto < 0 ? ";color:#991b1b" : ""}">${d.monto < 0 ? "- " : ""}${cop(d.monto)}</td></tr>`).join("")
      : `<tr><td>Ahorro acumulado del cliente</td><td style="text-align:right">${cop(liq.ahorro_acumulado)}</td></tr>`}
    ${(liq.saldo_favor ?? 0) > 0 ? `<tr><td>Saldo a favor</td><td style="text-align:right">${cop(liq.saldo_favor)}</td></tr>` : ""}
    ${liq.detalle_deudas.map(d => {
      // Monto negativo = crédito del cliente (su ahorro de los días cobrados, lo prepagado).
      // Va con "+": si saliera restando, el recibo diría que del portafolio sale más de lo que sale.
      const credito = d.monto < 0;
      return `<tr><td>${credito ? d.concepto : `Deuda descontada: ${d.concepto}`}</td><td style="text-align:right${credito ? ";color:#166534" : ""}">${credito ? "+" : "-"} ${cop(d.monto)}</td></tr>`;
    }).join("")}
    ${liq.detalle_danos.map(d => `<tr><td>Daño descontado: ${d.concepto}</td><td style="text-align:right">- ${cop(d.monto)}</td></tr>`).join("")}
    <tr class="tot"><td>SALE DEL PORTAFOLIO</td><td style="text-align:right">${cop(liq.saldo_final)}</td></tr>
    ${(liq.base_trasladada ?? 0) > 0 ? `
    <tr><td style="padding-left:18px;color:#64748b">↳ Quedó como base de su moto nueva</td><td style="text-align:right">${cop(liq.base_trasladada ?? 0)}</td></tr>
    <tr><td style="padding-left:18px;color:#64748b">↳ Entregado en efectivo</td><td style="text-align:right">${cop(liq.saldo_final - (liq.base_trasladada ?? 0))}</td></tr>` : ""}
  </table>

  <div class="nota">
    <strong>Por qué lo paga ${grupo}.</strong>
    La plata que se le devuelve al cliente es el ahorro que él fue construyendo con cada pago
    mientras rodaba${moto?.placa ? ` la ${moto.placa}` : ""}. Esos pagos entraron al portafolio
    dueño de la moto, así que la devolución sale del mismo lado.
  </div>

  <div class="firma">
    <div>
      <div class="linea"></div>
      <p style="font-weight:bold;text-transform:uppercase">${entregadoPorNombre}</p>
      <p style="color:#64748b">Quien entrega — Club de Moteros</p>
    </div>
    <div>
      <div class="linea"></div>
      <p style="font-weight:bold;text-transform:uppercase">${cliente.nombre}</p>
      <p style="color:#64748b">Quien recibe</p>
    </div>
  </div>

  <div class="pie">
    El detalle completo de la cuenta está en el documento de liquidación ${liq.numero}, firmado por el cliente.<br/>
    Este recibo es el soporte de la salida de dinero; no reemplaza el registro contable del portafolio.
  </div>
</body>
</html>`;

  const ventana = window.open("", "_blank", "width=800,height=900");
  if (!ventana) return;
  ventana.document.write(html);
  ventana.document.close();
  ventana.focus();
  setTimeout(() => ventana.print(), 400);
}
