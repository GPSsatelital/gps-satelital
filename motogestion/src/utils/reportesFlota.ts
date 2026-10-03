// DÓNDE ESTÁ CADA MOTO (rediseño de Reportes, 2-oct-2026 · D-033 y D-034).
//
// Una sola respuesta para la pregunta del socio: "de mis motos, cuántas están trabajando y dónde
// están las demás". Cuenta MOTOS (las que se pueden contar en la calle y en el parqueadero), no
// contratos: por eso cada moto cae en un solo lugar y los lugares suman el total del grupo.
//
// - Trabajando: tiene un contrato activo y la moto anda con el cliente.
// - Con la moto en el taller: contrato activo pero la moto está guardada en la empresa (taller,
//   garantía, fiscalía, tránsito). El contrato sigue corriendo (regla del 30-jul) y en los reportes
//   va aparte, ni al día ni atrasado (D-034, pedido del 22-ago).
// - Retenida por no pagar: la moto de un contrato detenido que todavía no tiene otro cliente, esté en
//   el parqueadero, en el taller o en fiscalía (D-033). La que ya tiene otro cliente está trabajando.
// - En taller sin cliente / disponible: motos sin contrato vigente.

export type LugarMoto = "trabajando" | "tallerConCliente" | "retenida" | "tallerSinCliente" | "disponible";

export const LUGARES: Array<{ clave: LugarMoto; etiqueta: string; explica: string }> = [
  { clave: "trabajando", etiqueta: "Trabajando con cliente", explica: "Tiene contrato activo y la moto anda con el cliente." },
  { clave: "tallerConCliente", etiqueta: "Con la moto en el taller", explica: "El contrato sigue corriendo, pero la moto está en el taller, en garantía o en fiscalía." },
  { clave: "retenida", etiqueta: "Retenidas por no pagar", explica: "El contrato está detenido por falta de pago y la moto no tiene otro cliente todavía." },
  { clave: "tallerSinCliente", etiqueta: "En taller, sin cliente", explica: "Se está arreglando o está en trámite, y no tiene contrato." },
  { clave: "disponible", etiqueta: "Disponibles, sin cliente", explica: "Lista en el parqueadero para entregarla a un cliente nuevo." },
];

const GUARDADA = new Set(["Mantenimiento", "Garantia", "Fiscalia", "Transito", "Recuperada"]);

/** Dónde dice la base de datos que está la moto físicamente, en palabras. */
export function sitioFisico(estadoMoto: string | null | undefined): string {
  switch (estadoMoto) {
    case "Recuperada": return "en el parqueadero";
    case "Mantenimiento": return "en el taller";
    case "Garantia": return "en garantía";
    case "Fiscalia": return "en fiscalía";
    case "Transito": return "en tránsito";
    case "Disponible": return "marcada disponible";
    case "Reservada": return "reservada";
    case "Asignada": return "con el cliente";
    default: return estadoMoto ? estadoMoto.toLowerCase() : "sin estado";
  }
}

export function dondeEstaCadaMoto(
  motos: Array<{ id: string; estado: string | null | undefined }>,
  contratos: Array<{ id: string; moto_id: string | null | undefined; estado: string | null | undefined }>,
): Map<string, { lugar: LugarMoto; contratoId: string | null }> {
  const activo = new Map<string, string>();
  const detenido = new Map<string, string>();
  for (const c of contratos) {
    if (!c.moto_id) continue;
    if (c.estado === "Activo") activo.set(c.moto_id, c.id);
    else if (c.estado === "Suspendido") detenido.set(c.moto_id, c.id);
  }
  const res = new Map<string, { lugar: LugarMoto; contratoId: string | null }>();
  for (const m of motos) {
    // Vendida (mig 186): ya no es de la empresa — no está trabajando, ni guardada, ni disponible.
    if (m.estado === "Vendida") continue;
    const guardada = GUARDADA.has(m.estado ?? "");
    const act = activo.get(m.id);
    // Recogida por no pagar aunque el contrato no se haya detenido todavía: retenida, igual que en las filas de Reportes.
    if (act) { res.set(m.id, { lugar: m.estado === "Recuperada" ? "retenida" : guardada ? "tallerConCliente" : "trabajando", contratoId: act }); continue; }
    const det = detenido.get(m.id);
    if (det) { res.set(m.id, { lugar: "retenida", contratoId: det }); continue; }
    res.set(m.id, { lugar: guardada ? "tallerSinCliente" : "disponible", contratoId: null });
  }
  return res;
}
