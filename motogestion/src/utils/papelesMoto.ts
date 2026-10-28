// SIN PAPELES AL DÍA NO SE ENTREGA LA MOTO (pedido del dueño, 27-oct-2026; respuestas del 28-oct):
// - vencido, sin fecha o con la fecha mal escrita → no se puede entregar, y NADIE se lo salta:
//   primero se corrige la fecha en Motos.
// - vence dentro de DIAS_AVISO días → se entrega, pero con aviso para renovarlo.
// Aplica al contrato nuevo (paso 2 y paso 6) y a la moto prestada de reemplazo. Una sola regla
// para los tres lugares, para que no puedan decir cosas distintas.

export const DIAS_AVISO = 15;

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function fechaPapel(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d}-${MESES[m - 1]}-${y}`;
}

function diasEntre(desde: string, hasta: string): number {
  const a = new Date(desde.slice(0, 10) + "T12:00:00");
  const b = new Date(hasta.slice(0, 10) + "T12:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export interface EstadoPapel {
  papel: "SOAT" | "Tecnomecánica";
  estado: "falta" | "mal" | "vencido" | "pronto" | "ok";
  fecha: string | null;
  /** Días que faltan para que venza (0 = vence hoy). Solo con fecha válida. */
  dias: number | null;
}

function revisar(papel: EstadoPapel["papel"], fecha: string | null | undefined, hoy: string): EstadoPapel {
  if (!fecha) return { papel, estado: "falta", fecha: null, dias: null };
  const y = Number(fecha.slice(0, 4));
  if (!/^\d{4}-\d{2}-\d{2}/.test(fecha) || y < 2000 || y > 2100) return { papel, estado: "mal", fecha, dias: null };
  const dias = diasEntre(hoy, fecha);
  if (dias < 0) return { papel, estado: "vencido", fecha, dias };
  if (dias <= DIAS_AVISO) return { papel, estado: "pronto", fecha, dias };
  return { papel, estado: "ok", fecha, dias };
}

function del(p: EstadoPapel["papel"]) { return p === "SOAT" ? "del SOAT" : "de la tecnomecánica"; }

export interface RevisionPapeles {
  puedeEntregar: boolean;
  /** Por qué no se puede entregar (rojo). */
  bloqueos: string[];
  /** Se puede entregar, pero hay que renovar pronto (amarillo). */
  avisos: string[];
  papeles: EstadoPapel[];
}

export function papelesMoto(
  moto: { fecha_seguro: string | null; fecha_tecnomecanica: string | null },
  hoy: string,
): RevisionPapeles {
  const papeles = [revisar("SOAT", moto.fecha_seguro, hoy), revisar("Tecnomecánica", moto.fecha_tecnomecanica, hoy)];
  const bloqueos: string[] = [];
  const avisos: string[] = [];
  for (const p of papeles) {
    if (p.estado === "falta") bloqueos.push(`Falta la fecha ${del(p.papel)}`);
    else if (p.estado === "mal") bloqueos.push(`La fecha ${del(p.papel)} está mal escrita (${p.fecha})`);
    else if (p.estado === "vencido") bloqueos.push(`${p.papel} ${p.papel === "SOAT" ? "vencido" : "vencida"} el ${fechaPapel(p.fecha!)}`);
    else if (p.estado === "pronto") {
      const cuando = p.dias === 0 ? "vence hoy" : p.dias === 1 ? "vence mañana" : `vence en ${p.dias} días`;
      avisos.push(`${p.papel === "SOAT" ? "El SOAT" : "La tecnomecánica"} ${cuando} (${fechaPapel(p.fecha!)})`);
    }
  }
  return { puedeEntregar: bloqueos.length === 0, bloqueos, avisos, papeles };
}

/** Una línea para mostrar debajo de la placa cuando los papeles están bien. */
export function resumenPapeles(r: RevisionPapeles): string {
  const s = r.papeles[0], t = r.papeles[1];
  return `SOAT ${s.fecha ? fechaPapel(s.fecha) : "—"} · Tecno ${t.fecha ? fechaPapel(t.fecha) : "—"}`;
}

/** El texto del bloqueo, con dónde arreglarlo. */
export function textoBloqueo(placa: string, r: RevisionPapeles): string {
  return `No se puede entregar ${placa}: ${r.bloqueos.join(" · ")}. Actualice la fecha en Motos › ${placa} › Editar.`;
}
