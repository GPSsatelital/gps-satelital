import { useEffect, useState, type CSSProperties } from "react";
import Placa from "./Placa";
import { useGrupos, cargarUsoGrupos, type Grupo, type UsoGrupo } from "../hooks/useGrupos";
import {
  COLORES_GRUPO, LARGO_MAX_GRUPO, NOMBRE_COLOR, esColorGrupo, normalizarNombreGrupo,
  problemaNombreGrupo, tonoDeColor, type ColorGrupo,
} from "../utils/grupos";
import { inputStyle } from "../styles/shared";

// Configuración → Grupos (D-067, mig 217). Solo la ve el Administrador principal, y la base lo
// vuelve a revisar en cada función: la pantalla no es la que protege.
//
// Lo que se puede hacer acá es exactamente lo que dejan las funciones de la base:
// · crear un grupo (nombre + color que no tenga otro grupo prendido);
// · cambiarle el color;
// · cambiarle el nombre SOLO si no se usa en nada (los que ya tienen motos, socio, cuentas o plata
//   se renombran con una migración, como USADAS → CAPITAL MOTOS);
// · apagarlo cuando ya no le quedan motos en la empresa, y volver a encenderlo.

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

function resumenUso(u: UsoGrupo | undefined): string {
  if (!u) return "";
  const partes: string[] = [];
  if (u.motos_empresa > 0) {
    partes.push(plural(u.motos_empresa, "moto", "motos") + (u.motos_vendidas > 0 ? ` (y ${plural(u.motos_vendidas, "vendida", "vendidas")})` : ""));
  } else if (u.motos_vendidas > 0) {
    partes.push(`Sin motos (${plural(u.motos_vendidas, "vendida", "vendidas")})`);
  }
  if (u.socios > 0) partes.push(plural(u.socios, "socio", "socios"));
  if (u.cuentas > 0) partes.push(plural(u.cuentas, "cuenta", "cuentas"));
  if (partes.length > 0) return partes.join(" · ");
  const historia = u.fotos + u.cajas + u.abonos + u.ingresos + u.premios;
  return historia > 0 ? "Sin motos · tiene plata o cierres de antes" : "Sin motos";
}

type Formulario =
  | { modo: "crear"; nombre: string; color: ColorGrupo | null }
  | { modo: "editar"; grupo: Grupo; nombre: string; color: ColorGrupo | null };

export default function SeccionGrupos({ estiloTarjeta, estiloTitulo }: { estiloTarjeta: CSSProperties; estiloTitulo: CSSProperties }) {
  const { grupos, loading, error: errorLista, crear, editar, apagar, encender } = useGrupos();
  const [uso, setUso] = useState<UsoGrupo[]>([]);
  const [form, setForm] = useState<Formulario | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Lo que usa cada grupo se vuelve a contar cada vez que la lista cambia (también si la cambió
  // otra persona o una migración).
  useEffect(() => {
    let vivo = true;
    cargarUsoGrupos().then(r => { if (vivo) setUso(r.data); });
    return () => { vivo = false; };
  }, [grupos]);

  const usoDe = (codigo: string) => uso.find(u => u.codigo === codigo);
  const prendidos = grupos.filter(g => g.activo);

  // El color de cada grupo prendido, menos el que se está editando: esos no se pueden escoger.
  const colorOcupadoPor = (color: ColorGrupo): string | null => {
    const codigoPropio = form?.modo === "editar" ? form.grupo.codigo : null;
    return prendidos.find(g => g.color === color && g.codigo !== codigoPropio)?.codigo ?? null;
  };

  function abrirCrear() {
    setError(null); setAviso(null);
    setForm({ modo: "crear", nombre: "", color: COLORES_GRUPO.find(c => !prendidos.some(g => g.color === c)) ?? null });
  }
  function abrirEditar(g: Grupo) {
    setError(null); setAviso(null);
    setForm({ modo: "editar", grupo: g, nombre: g.codigo, color: esColorGrupo(g.color) ? g.color : null });
  }

  async function ejecutar(accion: () => Promise<{ error: string | null }>, exito: string) {
    if (procesando) return;
    setProcesando(true);
    setError(null);
    try {
      const { error } = await accion();
      if (error) { setError(error); return; }
      setAviso(exito);
      setForm(null);
    } finally {
      setProcesando(false);
    }
  }

  const nombre = form ? normalizarNombreGrupo(form.nombre) : "";
  const problemaNombre = form ? problemaNombreGrupo(nombre) : null;
  const largo = [...nombre].length;
  const usoEditando = form?.modo === "editar" ? usoDe(form.grupo.codigo) : undefined;
  const sePuedeRenombrar = form?.modo === "crear" || !!usoEditando?.puede_renombrar;

  function guardar() {
    if (!form) return;
    if (problemaNombre) { setError(problemaNombre); return; }
    if (!form.color) { setError("Escoja un color."); return; }
    const color = form.color;
    if (form.modo === "crear") {
      ejecutar(() => crear(nombre, color), `Grupo ${nombre} creado.`);
      return;
    }
    const g = form.grupo;
    const cambios: { color?: string; nuevoCodigo?: string } = {};
    if (color !== g.color) cambios.color = color;
    if (sePuedeRenombrar && nombre !== g.codigo) cambios.nuevoCodigo = nombre;
    if (!cambios.color && !cambios.nuevoCodigo) { setForm(null); return; }
    ejecutar(() => editar(g.codigo, cambios), `Grupo ${cambios.nuevoCodigo ?? g.codigo} guardado.`);
  }

  function apagarGrupo(g: Grupo) {
    if (!confirm(`¿Apagar el grupo ${g.codigo}? Deja de ofrecerse para motos, socios y cuentas nuevas. Lo de antes no se borra y se puede volver a encender.`)) return;
    ejecutar(() => apagar(g.codigo), `Grupo ${g.codigo} apagado.`);
  }
  function encenderGrupo(g: Grupo) {
    ejecutar(() => encender(g.codigo), `Grupo ${g.codigo} encendido.`);
  }

  const btnLinea: CSSProperties = {
    flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--card)",
    color: "var(--text)", fontWeight: 600, fontSize: 13, cursor: "pointer",
  };
  const btnLleno: CSSProperties = {
    flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "var(--accent)",
    color: "var(--on-accent)", fontWeight: 600, fontSize: 13, cursor: procesando ? "not-allowed" : "pointer",
    opacity: procesando ? 0.6 : 1,
  };

  return (
    <div style={estiloTarjeta}>
      <div style={estiloTitulo}>🏷️ Grupos</div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
        Los portafolios de la empresa. Solo tú los creas o los cambias. El color es el mismo en todas las pantallas.
      </div>

      {aviso && !form && (
        <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: "var(--ok-ink)", background: "var(--ok-soft)", borderRadius: 8, padding: "8px 12px" }}>{aviso}</div>
      )}

      <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "12px" }}>
          <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 0 }}>
            {loading ? "Cargando…" : `${plural(grupos.length, "grupo", "grupos")} · ${plural(prendidos.length, "prendido", "prendidos")}`}
          </span>
          {form?.modo !== "crear" && (
            <button onClick={abrirCrear} style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 8, border: "none", background: "var(--accent)", color: "var(--on-accent)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              + Crear grupo
            </button>
          )}
        </div>
        {errorLista && <div style={{ padding: "8px 12px", fontSize: 12, color: "var(--bad-ink)" }}>No se pudo cargar la lista: {errorLista}</div>}
        {grupos.map(g => {
          const tono = tonoDeColor(g.color);
          const elegido = form?.modo === "editar" && form.grupo.codigo === g.codigo;
          return (
            <button key={g.codigo} onClick={() => abrirEditar(g)}
              style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", minWidth: 0, boxSizing: "border-box",
                padding: "12px", border: "none", borderTop: "1px solid var(--line)", textAlign: "left", cursor: "pointer",
                background: elegido ? "var(--soft)" : "transparent", opacity: g.activo ? 1 : 0.62, color: "inherit", font: "inherit",
              }}>
              <span style={{ width: 4, alignSelf: "stretch", borderRadius: 2, background: tono.solido, flex: "none" }} />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", textTransform: "uppercase" }}>{g.codigo}</span>
                <span style={{ display: "block", fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {resumenUso(usoDe(g.codigo))}
                </span>
              </span>
              <span style={{
                flex: "none", fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999,
                background: g.activo ? tono.suave : "var(--soft)", color: g.activo ? tono.letra : "var(--muted)",
                border: `1px solid ${g.activo ? tono.solido : "var(--line)"}`,
              }}>
                {g.activo ? (esColorGrupo(g.color) ? NOMBRE_COLOR[g.color] : g.color) : "Apagado"}
              </span>
            </button>
          );
        })}
      </div>

      {form && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 16, border: "1px solid var(--line)", background: "var(--card)" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
            {form.modo === "crear" ? "Crear grupo" : `Grupo ${form.grupo.codigo}`}
          </div>

          <label htmlFor="grupo-nombre" style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>Nombre</label>
          {sePuedeRenombrar ? (
            <>
              <div style={{ position: "relative" }}>
                <input id="grupo-nombre" value={form.nombre} autoComplete="off" placeholder="NUEVO GRUPO"
                  onChange={e => setForm({ ...form, nombre: e.target.value.toUpperCase() })}
                  style={{ ...inputStyle, paddingRight: 64, fontWeight: 600, textTransform: "uppercase" }} />
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: largo > LARGO_MAX_GRUPO ? "var(--bad-ink)" : "var(--muted)" }}>
                  {largo} de {LARGO_MAX_GRUPO}
                </span>
              </div>
              <div style={{ fontSize: 11, color: problemaNombre && form.nombre !== "" ? "var(--bad-ink)" : "var(--muted)", margin: "4px 0 12px" }}>
                {problemaNombre && form.nombre !== "" ? problemaNombre : "Mayúsculas, letras, números y un espacio entre palabras."}
              </div>
            </>
          ) : (
            <div style={{ marginBottom: 12 }}>
              <div style={{ ...inputStyle, background: "var(--soft)", fontWeight: 600, textTransform: "uppercase" }}>{form.grupo.codigo}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                Ya se usa ({resumenUso(usoEditando).toLowerCase()}): el nombre solo se cambia con una migración, para que no se pierda nada de lo que ya tiene.
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--soft)", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
            <Placa placa="ABC12D" size="sm" grupo={nombre || "NUEVO GRUPO"} />
            <span style={{ fontSize: 11, color: "var(--muted)", minWidth: 0 }}>Así se verá debajo de cada placa</span>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 8 }}>Color</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px 4px", marginBottom: 12 }}>
            {COLORES_GRUPO.map(c => {
              const tono = tonoDeColor(c);
              const ocupado = colorOcupadoPor(c);
              const sel = form.color === c;
              return (
                <button key={c} type="button" disabled={!!ocupado}
                  onClick={() => setForm({ ...form, color: c })}
                  aria-pressed={sel}
                  aria-label={`Color ${NOMBRE_COLOR[c]}${ocupado ? `, ya es de ${ocupado}` : ""}`}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 0,
                    background: "none", border: "none", padding: 0, cursor: ocupado ? "not-allowed" : "pointer",
                    opacity: ocupado ? 0.45 : 1, color: "inherit", font: "inherit",
                  }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: "50%", background: tono.solido, boxSizing: "border-box",
                    border: sel ? "3px solid var(--text)" : "2px solid var(--card)", outline: sel ? `2px solid ${tono.solido}` : "none",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--card)", fontSize: 15, fontWeight: 700,
                  }}>{sel ? "✓" : ""}</span>
                  <span style={{ fontSize: 10, color: "var(--muted)", textAlign: "center", lineHeight: 1.15 }}>
                    {NOMBRE_COLOR[c]}{ocupado && <><br />{ocupado}</>}
                  </span>
                </button>
              );
            })}
          </div>

          {form.modo === "editar" && !form.grupo.activo && prendidos.some(g => g.color === form.grupo.color) && (
            <div style={{ fontSize: 12, color: "var(--warn-ink)", background: "var(--warn-soft)", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
              Su color de antes ya lo tiene otro grupo. Guarde un color libre antes de encenderlo.
            </div>
          )}

          {error && <div style={{ marginBottom: 12, fontSize: 12, color: "var(--bad-ink)", background: "var(--bad-soft)", borderRadius: 8, padding: "8px 12px" }}>{error}</div>}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setForm(null); setError(null); }} style={btnLinea}>Cancelar</button>
            <button onClick={guardar} disabled={procesando} style={btnLleno}>
              {procesando ? "Guardando…" : form.modo === "crear" ? "Crear grupo" : "Guardar cambios"}
            </button>
          </div>

          {form.modo === "editar" && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
              {form.grupo.activo ? (
                usoEditando?.puede_apagar ? (
                  <button onClick={() => apagarGrupo(form.grupo)} disabled={procesando} style={{ ...btnLinea, width: "100%", color: "var(--bad-ink)" }}>
                    Apagar el grupo
                  </button>
                ) : (
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    Para apagarlo, primero pase sus {plural(usoEditando?.motos_empresa ?? 0, "moto", "motos")} a otro grupo.
                  </div>
                )
              ) : (
                <button onClick={() => encenderGrupo(form.grupo)} disabled={procesando} style={{ ...btnLinea, width: "100%" }}>
                  Encender el grupo
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
