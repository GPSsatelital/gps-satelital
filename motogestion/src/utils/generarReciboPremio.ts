import type { PremioReferido, RepartoPremio } from "../hooks/usePremiosReferidos";

// Recibo de egreso del programa de referidos, UNO por portafolio: es lo que se le envía al socio
// para explicarle por qué salió esa plata de su portafolio.
//
// Colores en hex a propósito, NUNCA var(--…): esto se abre en una ventana aparte que no tiene el
// CSS de la app, así que las variables de tema no existen ahí y el texto saldría sin color. Es el
// mismo error que reventó la generación del PDF del contrato ("unsupported color function var").

function cop(n: number) {
  return `$${Math.round(n).toLocaleString("es-CO")}`;
}

function fechaLarga(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

export function generarReciboPremio(
  premio: PremioReferido,
  fila: RepartoPremio,
  entregadoPorNombre: string,
) {
  const otros = premio.reparto.filter(r => r.grupo !== fila.grupo);
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Egreso premio referidos — ${fila.grupo}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #0f172a; padding: 40px; }
  h1 { font-size: 20px; margin-bottom: 2px; }
  .sub { font-size: 12px; color: #64748b; margin-bottom: 20px; }
  .portafolio { display: inline-block; padding: 5px 14px; border-radius: 999px; background: #0f172a; color: #ffffff; font-weight: bold; font-size: 13px; letter-spacing: 0.5px; }
  .monto { font-size: 32px; font-weight: bold; margin: 14px 0 2px; }
  .monto-lbl { font-size: 12px; color: #64748b; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
  td { padding: 8px 0; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  td.k { color: #64748b; width: 34%; }
  td.v { font-weight: bold; }
  .nota { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #334155; line-height: 1.5; margin-bottom: 18px; }
  .firma { margin-top: 44px; }
  .firma p { margin-bottom: 3px; }
  .linea { border-top: 1px solid #0f172a; width: 230px; margin-bottom: 4px; }
  .pie { margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
  <h1>Recibo de egreso — Programa de referidos</h1>
  <div class="sub">Club de Moteros · Cartagena</div>

  <span class="portafolio">${fila.grupo}</span>
  <div class="monto">${cop(fila.monto)}</div>
  <div class="monto-lbl">Valor que sale de este portafolio</div>

  <table>
    <tr><td class="k">A quién se le entregó</td><td class="v" style="text-transform:uppercase">${premio.nombre_referidor}</td></tr>
    <tr><td class="k">Cédula</td><td class="v">${premio.cedula_referidor}</td></tr>
    <tr><td class="k">Por qué</td><td class="v">Refirió a ${fila.referidos.map(r => r.toUpperCase()).join(", ")}${fila.referidos.length === 1 ? "" : ""}</td></tr>
    <tr><td class="k">Premio entregado</td><td class="v">${premio.premio} (${premio.hito} referidos)</td></tr>
    <tr><td class="k">Forma</td><td class="v">${premio.forma === "dinero" ? "Dinero en efectivo" : "Artículo físico"}</td></tr>
    ${premio.forma === "dinero" && premio.monto_por_referido
      ? `<tr><td class="k">Acordado por referido</td><td class="v">${cop(premio.monto_por_referido)}</td></tr>` : ""}
    <tr><td class="k">Costo total del premio</td><td class="v">${cop(premio.costo_total)}</td></tr>
    <tr><td class="k">Fecha de entrega</td><td class="v">${fechaLarga(premio.fecha)}</td></tr>
    <tr><td class="k">Entregado por</td><td class="v" style="text-transform:uppercase">${entregadoPorNombre}</td></tr>
  </table>

  <div class="nota">
    <strong>Cómo se calculó este valor.</strong>
    El premio costó ${cop(premio.costo_total)} y lo pagan los portafolios de los ${premio.hito} clientes
    que ${premio.nombre_referidor.toUpperCase()} refirió, según cuántos puso cada uno.
    A ${fila.grupo} le corresponden ${fila.referidos.length} de ${premio.hito}: <strong>${cop(fila.monto)}</strong>.
    ${otros.length > 0
      ? `El resto lo asumen ${otros.map(o => `${o.grupo} (${cop(o.monto)})`).join(" y ")}.`
      : "Es el único portafolio involucrado, por eso asume el total."}
  </div>

  ${premio.nota ? `<div class="nota"><strong>Observación:</strong> ${premio.nota}</div>` : ""}

  <div class="firma">
    <div class="linea"></div>
    <p style="font-weight:bold;text-transform:uppercase">${entregadoPorNombre}</p>
    <p style="color:#64748b">Quien entrega — Club de Moteros</p>
  </div>

  <div class="pie">
    La constancia fotográfica de la entrega está guardada en el sistema, en Referidos → historial de entregas.
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
