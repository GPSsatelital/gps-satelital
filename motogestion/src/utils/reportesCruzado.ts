// EL CUADRO CRUZADO de Reportes (pedido del dueño, 8-oct-2026): cada cobrador en cada grupo, con cinco
// vistas (motos, paradas, lo que se debe hoy, lo recaudado y el cumplimiento del período).
//
// No inventa ninguna cuenta. Recibe las mismas filas que ya usan Flota (motos), Cobranza (lo que se
// debe) y Portafolios (pagos y cumplimiento), y solo las reparte en casillas. Por eso cada columna
// tiene que dar lo mismo que "Por grupo" y cada fila lo mismo que "Por cobrador": `verificarCuadro`
// lo compara contra esas pantallas y la tarjeta avisa si un día no cuadran.
import { pctCumplimiento, type Cumplimiento } from "./reportesCifras";

export type VistaCruzado = "motos" | "paradas" | "debe" | "recaudado" | "cumplimiento";
export const VISTAS_CRUZADO: Array<{ clave: VistaCruzado; etiqueta: string; delPeriodo: boolean }> = [
  { clave: "motos", etiqueta: "Motos", delPeriodo: false },
  { clave: "paradas", etiqueta: "Paradas", delPeriodo: false },
  { clave: "debe", etiqueta: "Debe hoy", delPeriodo: false },
  { clave: "recaudado", etiqueta: "Recaudado", delPeriodo: true },
  { clave: "cumplimiento", etiqueta: "Cumplimiento", delPeriodo: true },
];

/** Qué cuenta cada vista, en palabras: lo dice la ayuda de la tarjeta y la leyenda del Excel. */
export function explicaVista(vista: VistaCruzado, periodo: string): string {
  return {
    motos: "Cuántas motos tiene a cargo cada cobrador en cada grupo. Son las mismas de Flota: todas menos las vendidas.",
    paradas: "Motos que hoy no están trabajando con un cliente: en el taller, retenidas o disponibles sin cliente.",
    debe: "Lo que deben hoy sus clientes: semanas, acuerdos y deudas. Es la misma cuenta de Cobranza.",
    recaudado: `Lo que pagaron sus motos del ${periodo}, desde el día en que son de ese cobrador. Lo pagado antes va en "Antes de asignar".`,
    cumplimiento: `De lo que se les vencía a sus clientes del ${periodo}, cuánto se pagó con plata. Verde: 85 % o más. Amarillo: 70 a 84 %. Rojo: menos de 70 %. No cuentan las motos retenidas ni las del taller.`,
  }[vista];
}

/** Las motos que no tienen cobrador (motos.subadmin_id vacío). */
export const SIN_COBRADOR = "__none__";
/** D-035: lo que pagaron las motos ANTES de ser de su cobrador de hoy. No es de nadie (el sistema no
 *  guarda quién la tenía): va en su propia fila, así la columna del grupo sigue sumando todo. */
export const ANTES_DE_ASIGNAR = "__antes__";

export type MotoCruzado = { grupo: string; cobrador: string; trabajando: boolean };
export type FilaCruzado = {
  grupo: string;
  cobrador: string;
  /** Contrato ya cerrado que solo aporta su plata: no debe nada ni cuenta para el cumplimiento. */
  cerrado: boolean;
  debeHoy: number;
  /** El cumplimiento visto desde el grupo (todo el período)… */
  cum: Cumplimiento;
  /** …y visto desde el cobrador: desde el día en que la moto es suya (D-035). */
  cumSuyo: Cumplimiento;
  /** Puede contar para el cumplimiento: ni retenida, ni con la moto en el taller, ni cerrada. */
  evaluable: boolean;
};
export type PagoCruzado = { grupo: string; cobrador: string; valor: number; antesDeAsignar: boolean };

/** `valor` null = no hay nada que medir (cumplimiento sin cobros vencidos). `n` = cuántas motos,
 *  contratos o pagos hay detrás del número: lo que sale al tocarlo. */
export type CeldaCruzado = { valor: number | null; n: number };
export type FilaCuadro = { clave: string; celdas: Record<string, CeldaCruzado>; total: CeldaCruzado };
export type CuadroCruzado = {
  vista: VistaCruzado;
  grupos: string[];
  filas: FilaCuadro[];
  totalGrupo: Record<string, CeldaCruzado>;
  total: CeldaCruzado;
};

const VACIA: CeldaCruzado = { valor: 0, n: 0 };

/**
 * Arma el cuadro de una vista. `grupos` da las columnas y su orden; las filas son los cobradores que
 * aparecen en los datos, en el orden de `ordenCobradores` (los que no estén ahí van al final por
 * clave), y después "Sin cobrador" y "Antes de asignar".
 */
export function cuadroCruzado(
  vista: VistaCruzado,
  datos: { motos: MotoCruzado[]; filas: FilaCruzado[]; pagos: PagoCruzado[] },
  grupos: string[],
  ordenCobradores: string[] = [],
): CuadroCruzado {
  // Lo que cuenta cada vista, como una lista de "aportes" (grupo, fila, valor). Las vistas que suman
  // (todas menos el cumplimiento) se resuelven igual; el cumplimiento es un porcentaje y va aparte.
  type Aporte = { grupo: string; fila: string; valor: number };
  let aportes: Aporte[] = [];
  if (vista === "motos") aportes = datos.motos.map(m => ({ grupo: m.grupo, fila: m.cobrador, valor: 1 }));
  else if (vista === "paradas") aportes = datos.motos.filter(m => !m.trabajando).map(m => ({ grupo: m.grupo, fila: m.cobrador, valor: 1 }));
  else if (vista === "debe") aportes = datos.filas.filter(f => !f.cerrado && f.debeHoy > 0).map(f => ({ grupo: f.grupo, fila: f.cobrador, valor: f.debeHoy }));
  else if (vista === "recaudado") aportes = datos.pagos.map(p => ({ grupo: p.grupo, fila: p.antesDeAsignar ? ANTES_DE_ASIGNAR : p.cobrador, valor: p.valor }));

  const presentes = vista === "cumplimiento"
    ? datos.filas.filter(f => f.evaluable && f.cumSuyo.medible).map(f => f.cobrador)
    : aportes.map(a => a.fila);
  // Los mismos renglones en todas las vistas: cambiar de vista no mueve a nadie de lugar. "Antes de
  // asignar" solo existe en lo recaudado.
  const todas = new Set([...presentes, ...datos.motos.map(m => m.cobrador), ...datos.filas.map(f => f.cobrador)]);
  if (vista === "recaudado" && aportes.some(a => a.fila === ANTES_DE_ASIGNAR)) todas.add(ANTES_DE_ASIGNAR);
  else todas.delete(ANTES_DE_ASIGNAR);
  const pos = (k: string) => k === SIN_COBRADOR ? 1e6 : k === ANTES_DE_ASIGNAR ? 1e6 + 1 : (ordenCobradores.indexOf(k) + 1 || 1e5);
  const claves = [...todas].sort((a, b) => pos(a) - pos(b) || a.localeCompare(b));

  if (vista === "cumplimiento") {
    // Cada casilla y el total de cada cobrador, desde el cobrador (D-035): lo mismo que "Por cobrador".
    // El total de cada grupo, desde el grupo: lo mismo que "Por grupo". Un porcentaje no se suma: cada
    // total se calcula sobre sus propias filas.
    const suyas = datos.filas.filter(f => f.evaluable && f.cumSuyo.medible);
    const delGrupo = datos.filas.filter(f => f.evaluable && f.cum.medible);
    const celdaSuya = (fs: FilaCruzado[]): CeldaCruzado => ({ valor: pctCumplimiento(fs.map(f => f.cumSuyo)), n: fs.length });
    const celdaGrupo = (fs: FilaCruzado[]): CeldaCruzado => ({ valor: pctCumplimiento(fs.map(f => f.cum)), n: fs.length });
    return {
      vista, grupos,
      filas: claves.map(k => {
        const mias = suyas.filter(f => f.cobrador === k);
        return { clave: k, celdas: Object.fromEntries(grupos.map(g => [g, celdaSuya(mias.filter(f => f.grupo === g))])), total: celdaSuya(mias) };
      }),
      totalGrupo: Object.fromEntries(grupos.map(g => [g, celdaGrupo(delGrupo.filter(f => f.grupo === g))])),
      total: celdaGrupo(delGrupo),
    };
  }

  const suma = (as: Aporte[]): CeldaCruzado => as.length ? { valor: as.reduce((s, a) => s + a.valor, 0), n: as.length } : VACIA;
  return {
    vista, grupos,
    filas: claves.map(k => {
      const mias = aportes.filter(a => a.fila === k);
      return { clave: k, celdas: Object.fromEntries(grupos.map(g => [g, suma(mias.filter(a => a.grupo === g))])), total: suma(mias) };
    }),
    totalGrupo: Object.fromEntries(grupos.map(g => [g, suma(aportes.filter(a => a.grupo === g))])),
    total: suma(aportes),
  };
}

/**
 * Compara el cuadro contra lo que muestran las otras pantallas ("Por grupo", "Por cobrador"). Devuelve
 * las diferencias en palabras; vacío = cuadra. Solo se compara lo que se pasa: una pantalla que no
 * tiene esa cifra no se inventa.
 */
export function verificarCuadro(
  cuadro: CuadroCruzado,
  esperado: { porGrupo?: Record<string, number | null>; porCobrador?: Record<string, number | null> },
  nombre: (cobrador: string) => string = k => k,
): string[] {
  const dif: string[] = [];
  const igual = (a: number | null, b: number | null) => (a ?? 0) === (b ?? 0) || (a !== null && b !== null && Math.abs(a - b) < 1);
  for (const [g, v] of Object.entries(esperado.porGrupo ?? {})) {
    const c = cuadro.totalGrupo[g]?.valor ?? 0;
    if (!igual(c, v)) dif.push(`${g}: el cuadro dice ${c ?? "—"} y "Por grupo" ${v ?? "—"}`);
  }
  for (const [k, v] of Object.entries(esperado.porCobrador ?? {})) {
    const c = cuadro.filas.find(f => f.clave === k)?.total.valor ?? 0;
    if (!igual(c, v)) dif.push(`${nombre(k)}: el cuadro dice ${c ?? "—"} y "Por cobrador" ${v ?? "—"}`);
  }
  return dif;
}
