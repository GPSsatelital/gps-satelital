// REFERIDOS POR FECHA (pedido del dueño, 9-oct-2026): quiénes llegaron referidos en un período y
// quién los trajo, sin tener que abrir referidor por referidor.
//
// · Se cuentan por el día en que RECIBIERON LA MOTO (es cuando el referido cuenta para el premio y
//   cuando la nómina le paga al del equipo) o por el día en que SE REGISTRARON. El dueño pidió las
//   dos; por defecto, la moto.
// · Dos orígenes que no se mezclan: un CLIENTE que refirió (programa de premios: guantes,
//   intercomunicador, casco) y alguien del EQUIPO que lo trajo (`clientes.referido_por_funcionario`,
//   mig 153). Lo del equipo se paga en la nómina, como las visitas, y NO cuenta para premios
//   (decisión del dueño, 9-oct-2026: los 48 que trajeron los supervisores estaban sumando premios
//   con la cédula del supervisor).

export type ContarPor = "moto" | "registro";
export type PeriodoReferidos = "mes" | "mes_anterior" | "ult30" | "anio" | "personalizado";
export type OrigenReferido = "cliente" | "equipo";
/** "todos" · "clientes" · "equipo" · o el id de una persona del equipo. */
export type QuienLoTrajo = string;

export type ClienteReferido = {
  id: string;
  nombre: string;
  created_at: string;
  referido_por_cedula: string | null;
  referido_por_nombre: string | null;
  referido_por_funcionario: string | null;
};
export type ContratoReferido = { cliente_id: string; estado: string; fecha_entrega: string | null };

export type FilaReferido = {
  clienteId: string;
  nombre: string;
  origen: OrigenReferido;
  /** Nombre de quien lo refirió (cliente) o de quien lo trajo (equipo). */
  quien: string;
  funcionarioId: string | null;
  /** Día en que se registró (hora de Colombia). */
  registro: string;
  /** Ya recibió la moto (un contrato que salió de "En proceso"). */
  conMoto: boolean;
  /** Día de la primera entrega. null = sin moto, o un contrato viejo sin fecha de entrega. */
  recibioMoto: string | null;
};

/** Si lo trajo alguien del equipo, se paga en la nómina y no cuenta para premios. */
export function esDelEquipo(c: { referido_por_funcionario?: string | null }): boolean {
  return !!c.referido_por_funcionario;
}

/**
 * Una fila por cliente referido. Entra quien tiene la cédula de quien lo refirió o alguien del equipo
 * anotado; el que solo tiene el nombre sin cédula ya sale aparte en "Revisar" (sin cédula no cuenta).
 * `fechaLocal` convierte el `created_at` a la fecha de Colombia (va desde afuera: este archivo es puro).
 */
export function filasReferidos(
  clientes: ClienteReferido[],
  contratos: ContratoReferido[],
  nombreDelEquipo: (id: string) => string | null,
  fechaLocal: (timestamp: string) => string,
): FilaReferido[] {
  const entregas = new Map<string, { conMoto: boolean; fecha: string | null }>();
  for (const ct of contratos) {
    if (ct.estado === "En proceso") continue;
    const e = entregas.get(ct.cliente_id) ?? { conMoto: true, fecha: null };
    if (ct.fecha_entrega && (!e.fecha || ct.fecha_entrega < e.fecha)) e.fecha = ct.fecha_entrega;
    entregas.set(ct.cliente_id, e);
  }
  const filas: FilaReferido[] = [];
  for (const c of clientes) {
    const cedula = (c.referido_por_cedula ?? "").trim();
    const equipo = esDelEquipo(c);
    if (!cedula && !equipo) continue;
    const e = entregas.get(c.id);
    filas.push({
      clienteId: c.id,
      nombre: c.nombre.trim(),
      origen: equipo ? "equipo" : "cliente",
      quien: equipo
        ? (nombreDelEquipo(c.referido_por_funcionario!) ?? (c.referido_por_nombre ?? "").trim()) || "Alguien del equipo"
        : (c.referido_por_nombre ?? "").trim() || `C.C. ${cedula}`,
      funcionarioId: c.referido_por_funcionario ?? null,
      registro: fechaLocal(c.created_at),
      conMoto: !!e?.conMoto,
      recibioMoto: e?.fecha ?? null,
    });
  }
  return filas;
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Desde y hasta (incluidos) de cada período, contados desde `hoy` ("YYYY-MM-DD"). */
export function rangoDelPeriodo(
  periodo: PeriodoReferidos,
  hoy: string,
  personalizado?: { desde: string; hasta: string },
): { desde: string; hasta: string } {
  const d = new Date(hoy + "T12:00:00");
  if (periodo === "mes") return { desde: hoy.slice(0, 8) + "01", hasta: hoy };
  if (periodo === "mes_anterior") {
    return { desde: iso(new Date(d.getFullYear(), d.getMonth() - 1, 1)), hasta: iso(new Date(d.getFullYear(), d.getMonth(), 0)) };
  }
  if (periodo === "ult30") { const i = new Date(d); i.setDate(d.getDate() - 29); return { desde: iso(i), hasta: hoy }; }
  if (periodo === "anio") return { desde: `${hoy.slice(0, 4)}-01-01`, hasta: hoy };
  const p = personalizado ?? { desde: hoy, hasta: hoy };
  return p.desde <= p.hasta ? p : { desde: p.hasta, hasta: p.desde };
}

/** La fecha con que se cuenta cada fila. null = no entra (sin moto, contando por la moto). */
export function fechaQueCuenta(f: FilaReferido, contarPor: ContarPor): string | null {
  return contarPor === "moto" ? f.recibioMoto : f.registro;
}

export function filtrarReferidos(
  filas: FilaReferido[],
  o: { contarPor: ContarPor; desde: string; hasta: string; quien: QuienLoTrajo },
): FilaReferido[] {
  return filas
    .filter(f => {
      const fecha = fechaQueCuenta(f, o.contarPor);
      if (!fecha || fecha < o.desde || fecha > o.hasta) return false;
      if (o.quien === "todos") return true;
      if (o.quien === "clientes") return f.origen === "cliente";
      if (o.quien === "equipo") return f.origen === "equipo";
      return f.funcionarioId === o.quien;
    })
    .sort((a, b) => (fechaQueCuenta(b, o.contarPor) ?? "").localeCompare(fechaQueCuenta(a, o.contarPor) ?? "") || a.nombre.localeCompare(b.nombre));
}

export function resumenReferidos(filas: FilaReferido[]): { total: number; equipo: number; clientes: number } {
  const equipo = filas.filter(f => f.origen === "equipo").length;
  return { total: filas.length, equipo, clientes: filas.length - equipo };
}

/** Cuántos trajo cada persona del equipo (desde siempre), el que más primero. */
export function equipoPorPersona(filas: FilaReferido[]): Array<{ id: string; nombre: string; traidos: number; conMoto: number }> {
  const m = new Map<string, { id: string; nombre: string; traidos: number; conMoto: number }>();
  for (const f of filas) {
    if (f.origen !== "equipo" || !f.funcionarioId) continue;
    const x = m.get(f.funcionarioId) ?? { id: f.funcionarioId, nombre: f.quien, traidos: 0, conMoto: 0 };
    x.traidos++;
    if (f.conMoto) x.conMoto++;
    m.set(f.funcionarioId, x);
  }
  return [...m.values()].sort((a, b) => b.traidos - a.traidos || a.nombre.localeCompare(b.nombre));
}
