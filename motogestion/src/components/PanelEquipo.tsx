import { useMemo } from "react";
import { card } from "../styles/shared";
import { useEquipo } from "../hooks/useEquipo";
import { useColaUbicacion } from "../hooks/useColaUbicacion";
import { tareaVencida, type Tarea } from "../hooks/useTareas";
import type { Pendiente, Atendido } from "../hooks/usePendientes";

// CÓMO VA EL EQUIPO — fase 3 de docs/FLUJO-DIARIO.md.
//
// Palabras del dueño sobre Sergio: *"tiene su propia lista, pero el trabajo principal es
// supervisar el trabajo de los demás admins"*. Por eso su pantalla se lee AL REVÉS que la de un
// subadmin: primero cómo van los demás, después lo suyo.
//
// Hasta hoy esto no existía en ninguna pantalla. Los avisos se calculaban en el navegador de cada
// quien y se borraban al cerrar la app: no había forma de saber quién tenía qué, ni qué quedó sin
// hacer ayer. Ahora los pendientes viven en el servidor (migs 142/144) y las tareas en una tabla
// (mig 140), así que por primera vez se puede mirar el trabajo de todos en un solo lugar.
//
// Los pendientes de un PUESTO (dueno_rol) se le cuentan a cada persona que tenga ese cargo —
// porque le tocan a cualquiera de ellas. Si nadie ocupa el puesto, sale como fila aparte: es
// trabajo que nadie va a reclamar.

const ROL_CORTO: Record<string, string> = {
  ADMIN_PRINCIPAL: "Dueño",
  ADMIN: "Admin",
  SUBADMIN: "Admin jr",
  SECRETARIA: "Secretaria",
  MECANICO: "Mecánico",
  VISITADOR: "Visitador",
  ANALISTA: "Analista",
  SOCIO: "Socio",
};

type Fila = {
  id: string;
  nombre: string;
  rol: string;
  porHacer: number;
  criticos: number;
  atendidosHoy: number;
  tareasPend: number;
  tareasVencidas: number;
  porValidar: number;
  huerfano: boolean;
};

export default function PanelEquipo({
  pendientes, atendidos, tareas, activo,
}: {
  pendientes: Pendiente[];
  atendidos: Atendido[];
  tareas: Tarea[];
  activo: boolean;
}) {
  const { equipo, loading } = useEquipo(activo);
  // La fila de validaciones de ubicación va aparte: en la lista de pendientes solo salen 5 por
  // persona (el cupo diario, mig 145), así que el total solo se ve acá. Es lo que permite notar
  // que alguien lleva días sin mover su cupo.
  const { faltanDe } = useColaUbicacion(activo);

  const { filas, sinNadie } = useMemo(() => {
    const hechas = new Set(atendidos.map(a => a.clave));
    const rolesOcupados = new Set(equipo.map(p => p.role));

    const filas: Fila[] = equipo
      // El mecánico y el socio no tienen lista de trabajo en el sistema: no se supervisan acá.
      .filter(p => !["MECANICO", "SOCIO"].includes(p.role))
      .map(p => {
        const suyos = pendientes.filter(pe => pe.dueno_id === p.id || (pe.dueno_rol && pe.dueno_rol === p.role));
        const porHacer = suyos.filter(pe => !hechas.has(pe.clave));
        const misTareas = tareas.filter(t => t.asignada_a === p.id && t.estado === "pendiente");
        return {
          id: p.id,
          nombre: p.nombre,
          rol: ROL_CORTO[p.role] ?? p.role,
          porHacer: porHacer.length,
          criticos: porHacer.filter(pe => pe.nivel === "critico").length,
          atendidosHoy: atendidos.filter(a => a.atendido_por === p.id).length,
          tareasPend: misTareas.length,
          tareasVencidas: misTareas.filter(tareaVencida).length,
          porValidar: faltanDe(p.id),
          huerfano: p.role === "SUBADMIN" && suyos.length === 0 && misTareas.length === 0,
        };
      })
      .sort((a, b) => b.porHacer - a.porHacer || a.nombre.localeCompare(b.nombre));

    // Trabajo dirigido a un puesto que hoy no ocupa nadie: no le va a aparecer a ninguna persona.
    const sinNadie = pendientes.filter(pe => pe.dueno_rol && !rolesOcupados.has(pe.dueno_rol));

    return { filas, sinNadie };
  }, [equipo, pendientes, atendidos, tareas, faltanDe]);

  if (!activo || loading || filas.length === 0) return null;

  return (
    <div style={{ ...card, padding: 0, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Cómo va el equipo</div>
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2, lineHeight: 1.45 }}>
          Lo que le falta hoy a cada quien, y lo que ya resolvió.
        </div>
      </div>

      <div>
        {filas.map(f => (
          <div key={f.id} style={{
            padding: "10px 12px", borderBottom: "1px solid var(--line)",
            display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
            borderLeft: `3px solid ${f.tareasVencidas > 0 || f.criticos > 0 ? "var(--bad)" : "transparent"}`,
          }}>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", textTransform: "uppercase" }}>{f.nombre}</div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                {f.rol}
                {f.huerfano && <span style={{ color: "var(--warn-ink)", fontWeight: 600 }}> · sin motos ni tareas asignadas</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Cifra n={f.porHacer} que="por hacer" tono={f.porHacer === 0 ? "ok" : "neutro"} />
              {f.criticos > 0 && <Cifra n={f.criticos} que="urgentes" tono="bad" />}
              {f.tareasPend > 0 && <Cifra n={f.tareasPend} que={f.tareasPend === 1 ? "tarea" : "tareas"} tono="neutro" />}
              {f.tareasVencidas > 0 && <Cifra n={f.tareasVencidas} que="vencidas" tono="bad" />}
              {f.porValidar > 0 && <Cifra n={f.porValidar} que="por validar" tono="neutro" />}
              <Cifra n={f.atendidosHoy} que="hechos hoy" tono={f.atendidosHoy > 0 ? "ok" : "neutro"} />
            </div>
          </div>
        ))}

        {sinNadie.length > 0 && (
          <div style={{ padding: "10px 12px", background: "var(--bad-soft)", color: "var(--bad-ink)", fontSize: 12, lineHeight: 1.45 }}>
            Hay {sinNadie.length} pendiente{sinNadie.length === 1 ? "" : "s"} dirigido{sinNadie.length === 1 ? "" : "s"} a un
            puesto que nadie ocupa ({[...new Set(sinNadie.map(p => ROL_CORTO[p.dueno_rol!] ?? p.dueno_rol))].join(", ")}).
            No le van a aparecer a ninguna persona.
          </div>
        )}
      </div>
    </div>
  );
}

function Cifra({ n, que, tono }: { n: number; que: string; tono: "ok" | "bad" | "neutro" }) {
  const fondo = tono === "ok" ? "var(--ok-soft)" : tono === "bad" ? "var(--bad-soft)" : "var(--soft2)";
  const tinta = tono === "ok" ? "var(--ok-ink)" : tono === "bad" ? "var(--bad-ink)" : "var(--muted)";
  return (
    <span style={{
      fontSize: 11, background: fondo, color: tinta, borderRadius: 999,
      padding: "4px 9px", whiteSpace: "nowrap", fontWeight: 600,
    }}>
      {n} {que}
    </span>
  );
}
