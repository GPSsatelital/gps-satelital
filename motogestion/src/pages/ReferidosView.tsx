import { useCallback, useEffect, useMemo, useState } from "react";
import { useClientes, type Cliente } from "../hooks/useClientes";
import { useContratos } from "../hooks/useContratos";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const PREMIOS = [
  { hito: 2,  premio: "Par de guantes de manejo", icon: "🧤" },
  { hito: 5,  premio: "Intercomunicador",          icon: "🎧" },
  { hito: 10, premio: "Casco",                     icon: "⛑️" },
  { hito: 17, premio: "Combo completo",            icon: "🎁" },
];

function calcularPremio(confirmados: number) {
  const entregados = PREMIOS.filter(p => confirmados >= p.hito);
  const siguiente = PREMIOS.find(p => confirmados < p.hito);
  return { entregados, siguiente };
}

function BarraProgreso({ actual, siguiente }: { actual: number; siguiente: number }) {
  const anterior = [...PREMIOS].reverse().find(p => actual >= p.hito)?.hito ?? 0;
  const pct = siguiente > anterior ? Math.min(100, Math.round(((actual - anterior) / (siguiente - anterior)) * 100)) : 100;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{actual} de {siguiente}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-hi))", transition: "width 0.4s" }} />
      </div>
      <div style={{ fontSize: 10, color: "var(--faint)", marginTop: 3 }}>Faltan {siguiente - actual} para el siguiente premio</div>
    </div>
  );
}

export default function ReferidosView() {
  const { profile } = useAuth();
  const { clientes } = useClientes();
  const { contratos } = useContratos();
  const esAdmin = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const [busqueda, setBusqueda] = useState("");
  const [entregando, setEntregando] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Un referido CUENTA cuando ya recibió su moto (regla del dueño). Un contrato "En proceso"
  // todavía no cuenta: el cliente puede echarse para atrás, no completar la base o no pasar
  // la visita. Cualquier otro estado significa que la moto sí salió en algún momento.
  const recibioMoto = useCallback(
    (clienteId: string) => contratos.some(ct => ct.cliente_id === clienteId && ct.estado !== "En proceso"),
    [contratos],
  );

  const referidores = useMemo(() => {
    // La lista se arma desde el dato "referido por" que quedó escrito en cada ficha, NO desde
    // la lista de clientes. Quien trae gente puede no ser cliente (un promotor, alguien que ya
    // se retiró) y así quedaba invisible por completo: caso JOHAN ROJAS, que refirió a MARLON
    // DAVID MUÑOZ y no aparecía en ninguna parte aunque el dato estaba bien guardado.
    const grupos = new Map<string, { cedula: string; nombre: string; referidos: Cliente[] }>();
    clientes.forEach(c => {
      const ced = (c.referido_por_cedula ?? "").trim();
      if (!ced) return;
      const g = grupos.get(ced) ?? { cedula: ced, nombre: "", referidos: [] };
      g.referidos.push(c);
      if (!g.nombre && c.referido_por_nombre) g.nombre = c.referido_por_nombre.trim();
      grupos.set(ced, g);
    });

    return [...grupos.values()]
      .map(g => {
        const cliente = clientes.find(c => c.cedula === g.cedula) ?? null;
        // El contador se CALCULA, no se guarda. La columna `referidos_confirmados` existe desde
        // la mig 010 pero NADA en todo el sistema le sumaba nunca: nació en 0 y murió en 0 para
        // todos, así que ningún premio se disparó jamás. Contarlo aquí arregla también el pasado
        // sin backfill, y no se puede volver a desincronizar porque no hay contador que mantener.
        const confirmados = g.referidos.filter(r => recibioMoto(r.id)).length;
        const { siguiente } = calcularPremio(confirmados);
        const premioEntregadoHasta = cliente?.premio_referidos_entregado ?? 0;
        // OJO: `calcularPremio().entregados` son en realidad los ALCANZADOS — no dice nada de si
        // se entregaron. Al usarlo para el chip "✓" el mismo premio salía a la vez como entregado
        // y como pendiente. Nunca se había visto porque el contador estaba clavado en 0 y nadie
        // alcanzaba ningún hito. Entregado = alcanzado Y marcado como entregado.
        const entregados = PREMIOS.filter(p => confirmados >= p.hito && p.hito <= premioEntregadoHasta);
        const premiosPendientesEntrega = PREMIOS.filter(p => confirmados >= p.hito && p.hito > premioEntregadoHasta);
        return {
          id: g.cedula,
          cedula: g.cedula,
          nombre: cliente?.nombre ?? g.nombre ?? "(sin nombre)",
          telefono: cliente?.telefono ?? "",
          esCliente: !!cliente,
          cliente,
          referidos: g.referidos,
          confirmados, entregados, siguiente, premiosPendientesEntrega,
        };
      })
      .sort((a, b) => b.confirmados - a.confirmados || b.referidos.length - a.referidos.length);
  }, [clientes, recibioMoto]);

  const pendientesEntrega = referidores.filter(r => r.premiosPendientesEntrega.length > 0);

  // Los que se quedan por fuera del conteo. Se DETECTAN y se muestran, nunca se juntan solos:
  // dos personas distintas pueden llamarse igual, y un premio entregado al que no era es plata
  // perdida. El dato se corrige en la ficha del cliente, que es donde debe quedar bien.
  const revisar = useMemo(() => {
    // (1) El mismo nombre escrito con cédulas distintas: la persona queda partida en pedazos y
    //     ningún pedazo alcanza el premio. Caso real: JOHAN ROJAS, 2 referidos repartidos 1 y 1.
    const porNombre = new Map<string, typeof referidores>();
    referidores.forEach(r => {
      const k = r.nombre.trim().toUpperCase();
      if (!k || k === "(SIN NOMBRE)") return;
      porNombre.set(k, [...(porNombre.get(k) ?? []), r]);
    });
    const partidos = [...porNombre.entries()]
      .filter(([, lista]) => lista.length > 1)
      .map(([nombre, lista]) => ({
        nombre,
        partes: lista,
        totalJunto: lista.reduce((a, r) => a + r.confirmados, 0),
        premioSiSeJunta: PREMIOS.filter(p => lista.reduce((a, r) => a + r.confirmados, 0) >= p.hito),
      }));

    // (2) Se escribió el nombre de quien refirió pero no la cédula. Regla del dueño: sin cédula
    //     NO cuenta (la cédula es la constancia y va en la carta de recomendación). Se listan
    //     igual para poder ir a completarlas, en vez de que se pierdan en silencio.
    const sinCedula = clientes
      .filter(c => (c.referido_por_nombre ?? "").trim() && !(c.referido_por_cedula ?? "").trim())
      .map(c => ({ cliente: c, refirio: (c.referido_por_nombre ?? "").trim() }));

    return { partidos, sinCedula };
  }, [referidores, clientes]);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return referidores;
    const q = busqueda.toLowerCase();
    return referidores.filter(r => r.nombre.toLowerCase().includes(q) || r.cedula.includes(q));
  }, [referidores, busqueda]);

  const kpis = useMemo(() => ({
    totalReferidores: referidores.length,
    referidosActivos: clientes.filter(c => c.referido_por_cedula && c.estado === "Activo").length,
    premiosPendientes: pendientesEntrega.length,
    hitosAlcanzados: referidores.reduce((a, r) => a + PREMIOS.filter(p => r.confirmados >= p.hito).length, 0),
  }), [referidores, clientes, pendientesEntrega]);

  async function marcarPremioEntregado(clienteId: string, hastaHito: number) {
    setEntregando(clienteId);
    const { error } = await supabase.from("clientes").update({ premio_referidos_entregado: hastaHito }).eq("id", clienteId);
    if (!error) setMsg("Premio registrado como entregado.");
    setEntregando(null);
    setTimeout(() => setMsg(null), 4000);
  }

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Programa de Referidos</h2>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>Seguimiento de referidos y premios por cliente.</div>
      </div>

      {msg && (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "var(--ok-soft)", border: "1px solid var(--ok-line)", color: "var(--ok-ink)", fontWeight: 700, fontSize: 13 }}>
          {msg}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total referidores", val: kpis.totalReferidores, bg: "var(--soft2)", color: "var(--muted2)" },
          { label: "Referidos activos", val: kpis.referidosActivos, bg: "var(--ok-soft)", color: "var(--ok-ink)" },
          { label: "Premios pendientes", val: kpis.premiosPendientes, bg: "var(--warn-soft)", color: "var(--warn-ink)" },
          { label: "Hitos alcanzados", val: kpis.hitosAlcanzados, bg: "var(--accent-soft3)", color: "var(--accent-ink)" },
        ].map(kpi => (
          <div key={kpi.label} style={{ flex: 1, minWidth: 110, background: kpi.bg, borderRadius: 14, padding: "16px 18px", border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: kpi.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color, marginTop: 6 }}>{kpi.val}</div>
          </div>
        ))}
      </div>

      {/* Hitos / Milestones */}
      <div style={{ background: "var(--card)", borderRadius: 16, padding: "20px 24px", marginBottom: 20, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 16 }}>Tabla de premios</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {PREMIOS.map(p => {
            const count = referidores.filter(r => r.confirmados >= p.hito).length;
            const entregados = referidores.filter(r => r.confirmados >= p.hito && (r.cliente?.premio_referidos_entregado ?? 0) >= p.hito).length;
            const pendientes = count - entregados;
            return (
              <div key={p.hito} style={{ flex: 1, minWidth: isMobile ? 140 : 160, padding: "18px 16px", borderRadius: 14, background: "var(--soft2)", border: "1px solid var(--line)", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{p.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{p.hito} referidos</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{p.premio}</div>
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{count} cliente{count !== 1 ? "s" : ""} alcanzaron</div>
                  {pendientes > 0 && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--warn-ink)", background: "var(--warn-soft)", padding: "3px 8px", borderRadius: 8 }}>
                      {pendientes} pendiente{pendientes > 1 ? "s" : ""} de entrega
                    </div>
                  )}
                  {entregados > 0 && (
                    <div style={{ fontSize: 11, color: "var(--ok-ink)", fontWeight: 600 }}>{entregados} entregado{entregados > 1 ? "s" : ""}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revisar — referidos que no están contando */}
      {(revisar.partidos.length > 0 || revisar.sinCedula.length > 0) && (
        <div style={{ background: "var(--bad-soft)", borderRadius: 16, padding: "20px 24px", marginBottom: 20, border: "1px solid var(--bad-line)" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--bad-ink)", marginBottom: 4 }}>
            ⚠️ Revisar — referidos que no están contando ({revisar.partidos.length + revisar.sinCedula.length})
          </div>
          <div style={{ fontSize: 12, color: "var(--bad-ink)", opacity: 0.85, marginBottom: 14, lineHeight: 1.5 }}>
            El sistema agrupa por cédula. Si quedó mal escrita o falta, esos referidos no le suman a nadie.
            Se corrige en la ficha del cliente, en el campo “Cédula de quien refirió”.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {revisar.partidos.map(p => (
              <div key={p.nombre} style={{ padding: "14px 16px", borderRadius: 12, background: "var(--card)", border: "1px solid var(--bad-line)" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                  {p.nombre} — aparece con {p.partes.length} cédulas distintas
                </div>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
                  {p.partes.map(parte => (
                    <div key={parte.cedula} style={{ fontSize: 12.5, color: "var(--muted2)" }}>
                      · <strong>{parte.cedula}</strong> → {parte.confirmados} referido{parte.confirmados !== 1 ? "s" : ""}
                      {parte.referidos.length > 0 && (
                        <span style={{ color: "var(--muted)" }}> ({parte.referidos.map(r => r.nombre).join(", ")})</span>
                      )}
                    </div>
                  ))}
                </div>
                {p.premioSiSeJunta.length > 0 && (
                  <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 10, background: "var(--warn-soft)", color: "var(--warn-ink)", fontSize: 12.5, fontWeight: 700, lineHeight: 1.45 }}>
                    Si es la misma persona son {p.totalJunto} referidos: ya ganó {p.premioSiSeJunta.map(x => `${x.icon} ${x.premio}`).join(" · ")}.
                    Corrige la cédula en la ficha del cliente que quedó mal.
                  </div>
                )}
              </div>
            ))}

            {revisar.sinCedula.length > 0 && (
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--card)", border: "1px solid var(--bad-line)" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                  Sin la cédula de quien refirió ({revisar.sinCedula.length}) — no cuentan para ningún premio
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, lineHeight: 1.45 }}>
                  La cédula es la constancia del referido y debe venir en la carta de recomendación. Consíguela y complétala en la ficha.
                </div>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
                  {revisar.sinCedula.map(({ cliente: c, refirio }) => (
                    <div key={c.id} style={{ fontSize: 12.5, color: "var(--muted2)" }}>
                      · <span style={{ textTransform: "uppercase" }}>{c.nombre}</span> dice que lo refirió <strong style={{ textTransform: "uppercase" }}>{refirio}</strong> — falta la cédula
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Premios pendientes de entrega */}
      {pendientesEntrega.length > 0 && (
        <div style={{ background: "var(--warn-soft2)", borderRadius: 16, padding: "20px 24px", marginBottom: 20, border: "1px solid var(--warn-line)" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--warn-ink)", marginBottom: 14 }}>
            Premios pendientes de entrega ({pendientesEntrega.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pendientesEntrega.map(({ id, nombre, cedula, cliente, esCliente, confirmados, premiosPendientesEntrega }) => (
              <div key={id} style={{ padding: "14px 16px", borderRadius: 12, background: "var(--card)", border: "1px solid var(--warn-line)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", color: "var(--text)" }}>{nombre}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{confirmados} referidos confirmados · C.C. {cedula}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {premiosPendientesEntrega.map(p => (
                      <span key={p.hito} style={{ padding: "4px 12px", borderRadius: 999, background: "var(--warn-soft)", color: "var(--warn-ink)", fontSize: 12, fontWeight: 700 }}>
                        {p.icon} {p.premio}
                      </span>
                    ))}
                  </div>
                </div>
                {/* La marca de "premio entregado" se guarda en la ficha del cliente. Si quien
                    refirió no es cliente, no hay ficha donde anotarla — se dice en vez de
                    mostrar un botón que no haría nada. El premio se le entrega igual. */}
                {esAdmin && (esCliente && cliente ? (
                  <button
                    disabled={entregando === cliente.id}
                    onClick={() => marcarPremioEntregado(cliente.id, premiosPendientesEntrega[premiosPendientesEntrega.length - 1].hito)}
                    style={{ padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer", background: "var(--accent)", color: "var(--card)", fontWeight: 700, fontSize: 13, opacity: entregando === cliente.id ? 0.6 : 1, whiteSpace: "nowrap" }}
                  >
                    {entregando === cliente.id ? "..." : "Marcar entregado"}
                  </button>
                ) : (
                  <div style={{ maxWidth: 230, padding: "8px 12px", borderRadius: 10, background: "var(--soft2)", border: "1px dashed var(--line2)", fontSize: 11.5, color: "var(--muted)", lineHeight: 1.45 }}>
                    Ganó el premio, pero <strong>no está registrado como cliente</strong>: no hay ficha
                    donde anotar la entrega. Regístralo en Clientes con la cédula {cedula} y aparece el botón.
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de referidores */}
      <div style={{ background: "var(--card)", borderRadius: 16, padding: "20px 24px", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>Todos los referidores ({referidores.length})</div>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o cédula..."
            style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13, width: isMobile ? "100%" : 240 }} />
        </div>

        {filtrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--faint)", fontSize: 13 }}>Sin resultados.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtrados.map(({ id, nombre, cedula, telefono, esCliente, referidos, confirmados, entregados, siguiente, premiosPendientesEntrega }) => (
              <div key={id} style={{
                borderRadius: 14,
                border: premiosPendientesEntrega.length > 0 ? "1px solid var(--warn-line)" : "1px solid var(--line)",
                background: premiosPendientesEntrega.length > 0 ? "var(--warn-soft2)" : "var(--soft2)",
                overflow: "hidden",
              }}>
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, textTransform: "uppercase", color: "var(--text)" }}>{nombre}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                        C.C. {cedula}{telefono ? ` · ${telefono}` : ""}
                        {!esCliente && (
                          <span style={{ marginLeft: 6, padding: "2px 8px", borderRadius: 999, background: "var(--soft)", color: "var(--muted2)", fontSize: 11, fontWeight: 700 }}>
                            No es cliente
                          </span>
                        )}
                      </div>

                      {/* Badges de premios */}
                      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ padding: "4px 12px", borderRadius: 999, background: "var(--accent-soft3)", color: "var(--accent-ink)", fontSize: 12, fontWeight: 700 }}>
                          {confirmados} referido{confirmados !== 1 ? "s" : ""}
                        </span>
                        {entregados.map(p => (
                          <span key={p.hito} style={{ padding: "4px 12px", borderRadius: 999, background: "var(--ok-soft)", color: "var(--ok-ink)", fontSize: 12, fontWeight: 700 }}>
                            {p.icon} {p.premio} ✓
                          </span>
                        ))}
                        {premiosPendientesEntrega.map(p => (
                          <span key={p.hito} style={{ padding: "4px 12px", borderRadius: 999, background: "var(--warn-soft)", color: "var(--warn-ink)", fontSize: 12, fontWeight: 700 }}>
                            {p.icon} {p.premio} pendiente
                          </span>
                        ))}
                      </div>

                      {/* Progress bar */}
                      {siguiente && <BarraProgreso actual={confirmados} siguiente={siguiente.hito} />}
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{referidos.length}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>referido{referidos.length !== 1 ? "s" : ""}</div>
                      <div style={{ fontSize: 11, color: "var(--ok-ink)", fontWeight: 700, marginTop: 2 }}>{referidos.filter(r => r.estado === "Activo").length} activos</div>
                    </div>
                  </div>
                </div>

                {/* Referidos del cliente */}
                {referidos.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--line)", padding: "12px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
                    {referidos.map(r => (
                      <div key={r.id} style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        background: r.estado === "Activo" ? "var(--ok-soft)" : "var(--card)",
                        border: `1px solid ${r.estado === "Activo" ? "var(--ok-line)" : "var(--line)"}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", color: "var(--text)" }}>{r.nombre}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>C.C. {r.cedula}</div>
                        </div>
                        <span style={{
                          padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: r.estado === "Activo" ? "var(--ok-soft)" : "var(--soft)",
                          color: r.estado === "Activo" ? "var(--ok-ink)" : "var(--muted)",
                        }}>
                          {r.estado === "Activo" ? "Confirmado" : r.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
