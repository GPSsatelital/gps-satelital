// LO QUE VE EL SOCIO — la parte contable del portal, aparte de la pantalla para poder probarla.
//
// El socio es un INVERSIONISTA, no un operador: su pregunta no es "¿a quién cobro hoy?" sino
// "¿mi plata está trabajando?". Estas funciones responden eso y nada más.
//
// 🔴 REGLA QUE ESTE ARCHIVO NO PUEDE ROMPER: aquí NO se calcula mora ni deuda. Esas salen de
// `cicloPago` (`calcularEstadoCartera`, `diasEnMora`), las mismas que usa Cartera. El portal
// viejo tenía su propia regla ("más de 2 días sin pagar") y por eso podía mostrarle al socio en
// mora a un cliente que en Cartera estaba al día. Lo de acá es solo AGRUPAR y ORDENAR.

export type EstadoMotoSocio = string;

/** Una moto produce cuando está con un cliente. Todo lo demás es plata quieta. */
export const ESTADOS_PRODUCIENDO = ["Asignada"] as const;

/** Por qué está quieta, en palabras del dueño de la plata (no en jerga del sistema). */
export const MOTIVO_PARADA: Record<string, string> = {
  Disponible: "sin cliente",
  Reservada: "reservada",
  Mantenimiento: "en taller",
  Recuperada: "guardada",
  Suspendida: "guardada",
  Fiscalia: "en fiscalía",
  Transito: "en tránsito",
  Garantia: "en garantía",
  "En traspaso": "en traspaso",
};

export type ResumenFlota = {
  total: number;
  produciendo: number;
  paradas: number;
  /** Por qué están quietas, de la razón más común a la menos, ya en palabras del socio. */
  motivos: Array<{ motivo: string; cuantas: number }>;
};

export function resumenFlota(motos: Array<{ estado: EstadoMotoSocio }>): ResumenFlota {
  const produciendo = motos.filter(m => (ESTADOS_PRODUCIENDO as readonly string[]).includes(m.estado)).length;
  const conteo = new Map<string, number>();
  for (const m of motos) {
    if ((ESTADOS_PRODUCIENDO as readonly string[]).includes(m.estado)) continue;
    const motivo = MOTIVO_PARADA[m.estado] ?? "sin definir";
    conteo.set(motivo, (conteo.get(motivo) ?? 0) + 1);
  }
  const motivos = [...conteo.entries()]
    .map(([motivo, cuantas]) => ({ motivo, cuantas }))
    .sort((a, b) => b.cuantas - a.cuantas || a.motivo.localeCompare(b.motivo));
  return { total: motos.length, produciendo, paradas: motos.length - produciendo, motivos };
}

export type ContratoEntrega = {
  id: string;
  cliente_id: string;
  moto_id: string | null;
  fecha_entrega: string | null;
  estado: string;
};

/**
 * Las entregas recientes: la carta de presentación del socio. Solo contratos que de verdad se
 * entregaron (con fecha y con moto), de la más nueva a la más vieja.
 *
 * Se incluyen los contratos ya cerrados a propósito: una moto entregada en junio que hoy está
 * liquidada SIGUE siendo una entrega que pasó, y el socio la vio en su momento. Ocultarla le
 * cambiaría la historia.
 */
export function entregasRecientes<T extends ContratoEntrega>(contratos: T[], limite = 12): T[] {
  return contratos
    .filter(c => !!c.fecha_entrega && !!c.moto_id && c.estado !== "En proceso" && c.estado !== "Cancelado")
    .sort((a, b) => (b.fecha_entrega ?? "").localeCompare(a.fecha_entrega ?? ""))
    .slice(0, limite);
}

/** Cuántas entregas se muestran por página en el portal del socio. Con 6 se bajan 6 portadas a la vez. */
export const ENTREGAS_POR_PAGINA = 6;

/**
 * Parte una lista en páginas (8-oct-2026, pedido del dueño: «un límite por páginas para que no cargue
 * tantas fotos al mismo tiempo»). Una página fuera de rango se lleva a la más cercana, para que una
 * lista que se encoge no deje al socio en una página vacía.
 */
export function paginar<T>(lista: T[], pagina: number, porPagina: number) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina));
  const actual = Math.min(Math.max(1, Math.floor(pagina) || 1), totalPaginas);
  const inicio = (actual - 1) * porPagina;
  return {
    items: lista.slice(inicio, inicio + porPagina),
    pagina: actual,
    totalPaginas,
    desde: lista.length ? inicio + 1 : 0,
    hasta: Math.min(inicio + porPagina, lista.length),
    total: lista.length,
  };
}

/**
 * La entrega más nueva de cada moto. `entregas` viene de la más nueva a la más vieja
 * (`entregasRecientes`), así que la primera que aparece de cada moto es la última que se hizo.
 */
export function ultimaEntregaDeCadaMoto(entregas: ContratoEntrega[]): Map<string, string> {
  const ultima = new Map<string, string>();
  for (const c of entregas) if (c.moto_id && !ultima.has(c.moto_id)) ultima.set(c.moto_id, c.id);
  return ultima;
}

// El orden en que se toman las 6 fotos de la entrega, con la de la persona primero: es la portada.
const ORDEN_PORTADA = ["persona", "delantera", "lateral_izquierdo", "arriba", "lateral_derecho", "trasera"];

/**
 * Las fotos de ESTA entrega, con la de la persona y la moto primero (8-oct-2026, pedido del dueño:
 * «que salga de portada la foto donde esté la moto más la persona que se entregó»).
 *
 * Las fotos se guardan en la MOTO, no en el contrato: si la moto se volvió a entregar, sus fotos ya
 * son de la entrega nueva. Medido el 8-oct en PRADERA: 6 de 22 tarjetas mostraban las fotos de otro
 * cliente (la de junio de IEW47I salía con las fotos de la entrega del 26-sep). Con la cara de la
 * persona de portada, eso pondría a un cliente con el nombre de otro. El archivo lleva el contrato en
 * su camino (`entregas/{contrato}/{foto}.jpg`, ver `WizardContrato`): si dice otro contrato, no es de
 * esta entrega. Si el camino no lo dice, se aceptan solo si es la última entrega de la moto.
 */
export function fotosDeLaEntrega(
  contratoId: string,
  fotos: Record<string, string> | null | undefined,
  esLaUltimaDeLaMoto: boolean,
): string[] {
  const propias = Object.entries(fotos ?? {}).filter(([, url]) => {
    if (!url) return false;
    const enCamino = url.match(/\/entregas\/([0-9a-f-]{36})\//i);
    return enCamino ? enCamino[1].toLowerCase() === contratoId.toLowerCase() : esLaUltimaDeLaMoto;
  });
  const lugar = (clave: string) => {
    const i = ORDEN_PORTADA.indexOf(clave);
    return i < 0 ? ORDEN_PORTADA.length : i;
  };
  return propias.sort((a, b) => lugar(a[0]) - lugar(b[0])).map(([, url]) => url);
}

export type VencimientoProximo = { placa: string; que: string; fecha: string; dias: number };

/**
 * SOAT y tecnomecánica que se vencen pronto. Es la única "alerta" que le importa a un
 * inversionista: si se le vence el seguro a una moto, esa moto no puede rodar.
 * `dias` negativo = ya está vencida.
 */
export function vencimientosProximos(
  motos: Array<{ placa: string; fecha_seguro?: string | null; fecha_tecnomecanica?: string | null }>,
  hoyISO: string,
  dentroDeDias = 45,
): VencimientoProximo[] {
  const hoy = Date.parse(hoyISO + "T12:00:00");
  const out: VencimientoProximo[] = [];
  for (const m of motos) {
    for (const [que, fecha] of [["SOAT", m.fecha_seguro], ["Tecnomecánica", m.fecha_tecnomecanica]] as const) {
      if (!fecha) continue;
      const t = Date.parse(fecha.slice(0, 10) + "T12:00:00");
      if (Number.isNaN(t)) continue;
      const dias = Math.round((t - hoy) / 86400000);
      if (dias <= dentroDeDias) out.push({ placa: m.placa, que, fecha: fecha.slice(0, 10), dias });
    }
  }
  // Lo más urgente primero: lo ya vencido arriba.
  return out.sort((a, b) => a.dias - b.dias || a.placa.localeCompare(b.placa));
}

/** Suma por mes (últimos N meses) para la tendencia del recaudo. Devuelve del más viejo al más nuevo. */
export function recaudoPorMes(
  pagos: Array<{ fecha: string; valor: number }>,
  hoyISO: string,
  meses = 6,
): Array<{ mes: string; total: number }> {
  const out: Array<{ mes: string; total: number }> = [];
  const [y, m] = hoyISO.split("-").map(Number);
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, (m - 1) - i, 1));
    out.push({ mes: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`, total: 0 });
  }
  const idx = new Map(out.map((x, i) => [x.mes, i]));
  for (const p of pagos) {
    const k = p.fecha.slice(0, 7);
    const i = idx.get(k);
    if (i !== undefined) out[i].total += p.valor;
  }
  return out;
}
