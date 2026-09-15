import type { NominaCobrador, GestionNomina, MotoSinGestion } from "./nominaCobradores";
import { VALOR_CICLO, VALOR_ATRASADO, VALOR_RETENCION, totalesPorGrupo, TEXTO_SIN_GESTION } from "./nominaCobradores";

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
  cuota_convenio: "Convenio de retenida (30%)",
  visita: "Visita domiciliaria",
};

/**
 * El HTML del desprendible. Vive aparte de `generarDesprendibleNomina` para poder PROBARLO:
 * abrir una ventana e imprimir no se puede verificar en una prueba, pero el papel que firma el
 * cobrador sí — y es plata. (15-sep-2026)
 */
export function htmlDesprendibleNomina(
  nomina: NominaCobrador,
  nombreCobrador: string,
  desde: string,
  hasta: string,
  quienPagaNombre: string,
  /**
   * EL REVERSO (15-sep-2026): las motos asignadas que NO generaron gestión, con su motivo.
   * Va en el papel y no solo en la pantalla porque el desprendible es lo que el cobrador firma
   * y con lo que reclama: si solo dice lo que se le paga, no puede discutir lo que NO se le pagó.
   */
  extra?: { sinGestion?: MotoSinGestion[]; motosAsignadas?: number },
) {
  const sinGestion = extra?.sinGestion ?? [];
  const motosAsignadas = extra?.motosAsignadas ?? 0;
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
  .conteo { font-size: 11.5px; color: #475569; margin: -12px 0 16px; }
  .no-pago-titulo { font-size: 12.5px; font-weight: bold; color: #92400e; margin: 4px 0 6px; }
  .motivo { background: #fffbeb; font-size: 11px; font-weight: bold; color: #92400e; text-transform: uppercase; }
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
  ${motosAsignadas > 0 ? `<div class="conteo">${motosAsignadas} motos asignadas · ${motosAsignadas - sinGestion.length} con gestión · ${sinGestion.length} sin gestión</div>` : ""}

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
    ${nomina.cuotasConvenio > 0 ? `<tr><td>${nomina.cuotasConvenio} semana${nomina.cuotasConvenio === 1 ? "" : "s"} de convenio de retenida × ${cop(VALOR_ATRASADO)}</td><td class="num">${cop(nomina.cuotasConvenio * VALOR_ATRASADO)}</td></tr>` : ""}
    ${nomina.retenciones > 0 ? `<tr><td>${nomina.retenciones} retenci${nomina.retenciones === 1 ? "ón" : "ones"} × ${cop(VALOR_RETENCION)}</td><td class="num">${cop(nomina.retenciones * VALOR_RETENCION)}</td></tr>` : ""}
    <tr class="total-final"><td>TOTAL A PAGAR</td><td class="num">${cop(nomina.total)}</td></tr>
  </table>

  ${porGrupo.length > 0 ? `<table class="totales" style="margin-top:-6px">
    <tr><td colspan="2" style="font-size:10.5px;color:#64748b;text-transform:uppercase;font-weight:bold">De qué portafolio sale</td></tr>
    ${porGrupo.map(g => `<tr><td>${g.grupo}</td><td class="num">${cop(g.total)}</td></tr>`).join("")}
  </table>` : ""}

  ${sinGestion.length > 0 ? `
  <div class="no-pago-titulo">No se pagó — ${sinGestion.length} moto${sinGestion.length === 1 ? "" : "s"} de las asignadas</div>
  <table>
    <thead>
      <tr><th>Placa</th><th>Grupo</th><th>Cliente</th><th style="text-align:right">Valor</th></tr>
    </thead>
    <tbody>${
      // Agrupadas por motivo, y las que no tienen cliente al final: son las que no son gestión.
      [...new Set(sinGestion.map(f => f.motivo))]
        .sort((a, b) => Number(a === "sin_contrato") - Number(b === "sin_contrato"))
        .map(mv => {
          const lista = sinGestion.filter(f => f.motivo === mv);
          // El motivo va UNA vez, en la fila que encabeza el grupo. Repetirlo en cada renglón
          // llenaba el papel de la misma frase cinco veces seguidas.
          return `<tr><td colspan="4" class="motivo">${lista.length} · ${TEXTO_SIN_GESTION[mv]}</td></tr>` +
            lista.map(f => `
              <tr>
                <td class="placa">${f.placa}</td>
                <td style="color:#64748b;font-size:10.5px">${f.grupo}</td>
                <td style="text-transform:uppercase">${f.cliente}</td>
                <td class="num" style="color:#94a3b8">${cop(0)}</td>
              </tr>`).join("");
        }).join("")
    }</tbody>
  </table>` : ""}

  <div class="regla">
    <strong>Cómo se paga.</strong> Cada ciclo del cliente cobrado a tiempo vale ${cop(VALOR_CICLO)}
    (el semanal cada semana, el quincenal cada 15 días, el mensual al mes; el prorrateo del arranque
    vale completo). Un ciclo que entra atrasado vale el 30% (${cop(VALOR_ATRASADO)}). El cliente con
    convenio debe su semana y la cuota del convenio como UN solo paquete: el ciclo se paga cuando el
    paquete completo entra (si una parte llegó tarde, vale el 30%; mientras falte algo, no se paga) —
    las cuotas del convenio no se pagan por separado, y las adelantadas dejan cubiertas las semanas
    que vienen. Una moto retenida cuyo cliente sigue pagando su convenio vale el 30% por semana.
    Retener una moto vale ${cop(VALOR_RETENCION)} (${cop(VALOR_CICLO)} + $10.000 por el trabajo de
    guardarla), una sola vez, la semana en que se retiene. Una moto en mora que ni pagó ni se retuvo
    no genera pago: no hubo gestión.
  </div>

  <div class="cierre">
    <div class="firmas">
      <div><div class="linea">${quienPagaNombre.toUpperCase()}<div class="rol">Quien paga — Club de Moteros</div></div></div>
      <div><div class="linea">${nombreCobrador.toUpperCase()}<div class="rol">Cobrador — recibí conforme, verifiqué el detalle</div></div></div>
    </div>
  </div>
</body>
</html>`;

  return html;
}

export function generarDesprendibleNomina(
  ...args: Parameters<typeof htmlDesprendibleNomina>
) {
  const ventana = window.open("", "_blank", "width=820,height=900");
  if (!ventana) return;
  ventana.document.write(htmlDesprendibleNomina(...args));
  ventana.document.close();
  ventana.focus();
  setTimeout(() => ventana.print(), 400);
}
