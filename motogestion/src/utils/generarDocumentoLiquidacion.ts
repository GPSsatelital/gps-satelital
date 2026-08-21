import type { Liquidacion } from "../hooks/useLiquidaciones";

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

export function generarDocumentoLiquidacion(
  liq: Liquidacion,
  cliente: Cliente,
  moto: Moto | null
) {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Liquidación ${liq.numero}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #0f172a; padding: 40px; }
  h1 { font-size: 22px; text-align: center; margin-bottom: 4px; }
  .subtitulo { text-align: center; font-size: 13px; color: #64748b; margin-bottom: 24px; }
  .seccion { margin-bottom: 20px; }
  .seccion h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #0284c7; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px; }
  .fila { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .fila span:first-child { color: #64748b; }
  .fila span:last-child { font-weight: 600; }
  .tabla { width: 100%; border-collapse: collapse; margin-top: 6px; }
  .tabla th, .tabla td { padding: 6px 10px; border: 1px solid #e2e8f0; text-align: left; font-size: 12px; }
  .tabla th { background: #f8fafc; font-weight: 700; }
  .total-row td { font-weight: 700; background: #f1f5f9; }
  .saldo-positivo { color: #166534; font-size: 18px; font-weight: 800; }
  .saldo-negativo { color: #991b1b; font-size: 18px; font-weight: 800; }
  .explica { margin-top: 12px; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11.5px; line-height: 1.55; color: #334155; }
  .explica p { margin-bottom: 6px; }
  .explica p:last-child { margin-bottom: 0; }
  .firmas { display: flex; gap: 40px; margin-top: 60px; }
  .firma-box { flex: 1; border-top: 1px solid #334155; padding-top: 8px; text-align: center; font-size: 12px; }
  .numero-liq { position: absolute; top: 40px; right: 40px; font-size: 12px; color: #64748b; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="numero-liq">${liq.numero} · ${new Date(liq.created_at).toLocaleDateString("es-CO")}</div>
<h1>Club Moteros Cartagena</h1>
<p class="subtitulo">DOCUMENTO DE LIQUIDACIÓN DE CONTRATO</p>

<div class="seccion">
  <h2>Datos del cliente</h2>
  <div class="fila"><span>Nombre</span><span>${cliente.nombre}</span></div>
  ${cliente.cedula ? `<div class="fila"><span>Cédula</span><span>${cliente.cedula}</span></div>` : ""}
  ${cliente.telefono ? `<div class="fila"><span>Teléfono</span><span>${cliente.telefono}</span></div>` : ""}
</div>

${moto ? `<div class="seccion">
  <h2>Vehículo</h2>
  ${moto.marca ? `<div class="fila"><span>Marca</span><span>${moto.marca}</span></div>` : ""}
  ${moto.modelo ? `<div class="fila"><span>Modelo</span><span>${moto.modelo}</span></div>` : ""}
  ${moto.placa ? `<div class="fila"><span>Placa</span><span>${moto.placa}</span></div>` : ""}
</div>` : ""}

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
      ${liq.detalle_deudas.map((d) => `<tr><td>Deuda: ${d.concepto}</td><td>- ${cop(d.monto)}</td></tr>`).join("")}
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

<div class="firmas">
  <div class="firma-box">
    <p>${liq.nombre_responsable ?? "________________________"}</p>
    <p>${liq.cargo_responsable ?? "Responsable Club Moteros Cartagena"}</p>
    <p style="margin-top:4px;color:#64748b">Por la empresa</p>
  </div>
  <div class="firma-box">
    <p>________________________</p>
    <p>${cliente.nombre}</p>
    <p style="margin-top:4px;color:#64748b">El cliente</p>
  </div>
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
