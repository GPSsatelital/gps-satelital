import type { NominaCobrador, GestionNomina } from "./nominaCobradores";
import { VALOR_CICLO, VALOR_ATRASADO, VALOR_RETENCION, totalesPorGrupo } from "./nominaCobradores";

// EL DESPRENDIBLE DE NÓMINA DE UN COBRADOR — pedido textual del dueño (22-ago): "debe ser un
// documento detallado para que cada cobrador o subadmin pueda verificar bien qué le están
// pagando". Por eso va renglón por renglón: placa · cliente · qué gestión · fecha · valor.
// El cobrador lo revisa contra su semana, y las firmas dejan constancia de la entrega.
//
// Colores en hex a propósito, NUNCA var(--…): se abre en ventana aparte, sin el CSS de la app.

function cop(n: number) {
  return `$${Math.round(n).toLocaleString("es-CO")}`;
}

function fechaCorta(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-CO", { weekday: "short", day: "2-digit", month: "short" });
}

function fechaLarga(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

const TIPO_LABEL: Record<GestionNomina["tipo"], string> = {
  ciclo: "Ciclo a tiempo",
  ciclo_atrasado: "Ciclo atrasado (30%)",
  prorrateo: "Prorrateo (primer cobro)",
  retencion: "Retención",
};

export function generarDesprendibleNomina(
  nomina: NominaCobrador,
  nombreCobrador: string,
  desde: string,
  hasta: string,
  quienPagaNombre: string,
) {
  const filas = nomina.renglones.map(r => `
    <tr>
      <td class="placa">${r.placa}</td>
      <td style="color:#64748b;font-size:10.5px">${r.grupo}</td>
      <td style="text-transform:uppercase">${r.cliente}</td>
      <td>${TIPO_LABEL[r.tipo]}</td>
      <td>${fechaCorta(r.fecha)}</td>
      <td class="num">${cop(r.valor)}</td>
    </tr>`).join("");

  // De qué portafolio sale la plata: cada gestión la paga el grupo dueño de la moto.
  const porGrupo = totalesPorGrupo(nomina.renglones);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Nómina ${nombreCobrador} — semana del ${desde}</title>
<style>
  @page { size: letter; margin: 12mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #0f172a; padding: 26px; }
  @media print { body { padding: 0; } }
  h1 { font-size: 18px; margin-bottom: 2px; }
  .sub { font-size: 12px; color: #64748b; margin-bottom: 4px; }
  .semana { font-size: 13px; font-weight: bold; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  th { background: #f1f5f9; text-align: left; padding: 5px 8px; border: 1px solid #e2e8f0; font-size: 11px; text-transform: uppercase; color: #475569; }
  td { padding: 4px 8px; border: 1px solid #e2e8f0; }
  tr { page-break-inside: avoid; }
  thead { display: table-header-group; }
  .placa { font-weight: bold; letter-spacing: 0.5px; }
  .num { text-align: right; font-weight: bold; white-space: nowrap; }
  .totales { width: 100%; max-width: 380px; margin-left: auto; border-collapse: collapse; margin-bottom: 14px; }
  .totales td { border: none; padding: 3px 8px; }
  .totales .num { font-size: 12px; }
  .total-final td { border-top: 2px solid #0f172a; font-size: 15px; font-weight: bold; padding-top: 6px; }
  .regla { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-size: 11px; color: #334155; line-height: 1.55; margin-bottom: 10px; }
  .cierre { page-break-inside: avoid; break-inside: avoid; }
  .firmas { display: flex; gap: 40px; margin-top: 40px; }
  .firmas > div { flex: 1; text-align: center; }
  .linea { border-top: 1px solid #0f172a; padding-top: 6px; font-weight: bold; text-transform: uppercase; }
  .rol { color: #64748b; font-weight: normal; font-size: 11px; }
</style>
</head>
<body>
  <h1>Liquidación de nómina — ${nombreCobrador.toUpperCase()}</h1>
  <div class="sub">Club de Moteros · Cartagena · Nómina de cobradores</div>
  <div class="semana">Semana del ${fechaLarga(desde)} al ${fechaLarga(hasta)}</div>

  <table>
    <thead>
      <tr><th>Placa</th><th>Grupo</th><th>Cliente</th><th>Gestión</th><th>Cuándo</th><th style="text-align:right">Valor</th></tr>
    </thead>
    <tbody>${filas}</tbody>
  </table>

  <table class="totales">
    ${nomina.ciclosATiempo > 0 ? `<tr><td>${nomina.ciclosATiempo} ciclo${nomina.ciclosATiempo === 1 ? "" : "s"} a tiempo × ${cop(VALOR_CICLO)}</td><td class="num">${cop(nomina.ciclosATiempo * VALOR_CICLO)}</td></tr>` : ""}
    ${nomina.prorrateos > 0 ? `<tr><td>${nomina.prorrateos} prorrateo${nomina.prorrateos === 1 ? "" : "s"} × ${cop(VALOR_CICLO)}</td><td class="num">${cop(nomina.prorrateos * VALOR_CICLO)}</td></tr>` : ""}
    ${nomina.ciclosAtrasados > 0 ? `<tr><td>${nomina.ciclosAtrasados} ciclo${nomina.ciclosAtrasados === 1 ? "" : "s"} atrasado${nomina.ciclosAtrasados === 1 ? "" : "s"} × ${cop(VALOR_ATRASADO)}</td><td class="num">${cop(nomina.ciclosAtrasados * VALOR_ATRASADO)}</td></tr>` : ""}
    ${nomina.retenciones > 0 ? `<tr><td>${nomina.retenciones} retenci${nomina.retenciones === 1 ? "ón" : "ones"} × ${cop(VALOR_RETENCION)}</td><td class="num">${cop(nomina.retenciones * VALOR_RETENCION)}</td></tr>` : ""}
    <tr class="total-final"><td>TOTAL A PAGAR</td><td class="num">${cop(nomina.total)}</td></tr>
  </table>

  ${porGrupo.length > 0 ? `<table class="totales" style="margin-top:-6px">
    <tr><td colspan="2" style="font-size:10.5px;color:#64748b;text-transform:uppercase;font-weight:bold">De qué portafolio sale</td></tr>
    ${porGrupo.map(g => `<tr><td>${g.grupo}</td><td class="num">${cop(g.total)}</td></tr>`).join("")}
  </table>` : ""}

  <div class="regla">
    <strong>Cómo se paga.</strong> Cada ciclo del cliente cobrado a tiempo vale ${cop(VALOR_CICLO)}
    (el semanal cada semana, el quincenal cada 15 días, el mensual al mes; el prorrateo del arranque
    vale completo). Un ciclo que entra atrasado vale el 30% (${cop(VALOR_ATRASADO)}). Retener una
    moto vale ${cop(VALOR_RETENCION)} (${cop(VALOR_CICLO)} + $10.000 por el trabajo de guardarla),
    una sola vez, la semana en que se retiene. Una moto en mora que ni pagó ni se retuvo no genera
    pago: no hubo gestión.
  </div>

  <div class="cierre">
    <div class="firmas">
      <div><div class="linea">${quienPagaNombre.toUpperCase()}<div class="rol">Quien paga — Club de Moteros</div></div></div>
      <div><div class="linea">${nombreCobrador.toUpperCase()}<div class="rol">Cobrador — recibí conforme, verifiqué el detalle</div></div></div>
    </div>
  </div>
</body>
</html>`;

  const ventana = window.open("", "_blank", "width=820,height=900");
  if (!ventana) return;
  ventana.document.write(html);
  ventana.document.close();
  ventana.focus();
  setTimeout(() => ventana.print(), 400);
}
