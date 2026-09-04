import { useMemo, useState, useEffect } from "react";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { useDeudas } from "../hooks/useDeudas";
import { useConvenios } from "../hooks/useConvenios";
import { usePagos, fechaDeCaja, esPagoDeCaja } from "../hooks/usePagos";
import { useAuth } from "../contexts/AuthContext";
import { calcularEstadoCartera, diasEnMora, cuotaConvenioDelPeriodo } from "../utils/cicloPago";
import { resumenFlota, entregasRecientes, vencimientosProximos, recaudoPorMes } from "../utils/portalSocio";
import { hoyISO, hoyDate, fmtFechaLarga } from "../utils/fecha";
import Placa from "../components/Placa";

// ═══════════════════════════════════════════════════════════════════════════════════════════
// EL PORTAL DEL SOCIO — rediseñado el 3-sep-2026.
//
// El socio es un INVERSIONISTA, no un operador. Su pregunta no es "¿a quién cobro hoy?" sino
// "¿mi plata está trabajando?". Antes esto era un panel de administrador en pequeño: KPIs de
// gestión, protocolo de mora, tabla de contratos.
//
// 🔴 LAS DOS CIFRAS QUE ANTES MENTÍAN (y por qué este archivo ya no calcula nada de plata):
//   1. La mora se sacaba con una regla propia — `diasSinPago > 2`. No sabía de día de pago, ni
//      de gabela, ni de convenios, ni de plazo extra. Un cliente AL DÍA en Cartera podía salirle
//      al socio en mora. Ahora sale de `calcularEstadoCartera`/`diasEnMora`, las mismas de
//      Cartera y de la campana. Mismo patrón que arregló [[cartera-cuanto-debe-una-sola-funcion]].
//   2. La "proyección mensual" era `tarifa × contratos × 26`. Ese número no existe en ningún otro
//      lado del sistema (los domingos valen distinto y se trabaja por período, no por días).
//      **Se eliminó**: no se le muestra al dueño de la plata una cifra que nadie puede confirmar.
//
// DECISIÓN DEL DUEÑO (3-sep): el socio SÍ ve nombres de sus clientes, incluida la lista de mora,
// pero **sin un solo botón** — no cobra, no edita, no registra. El filtro por grupo ya está
// garantizado en la BD (RLS), no solo acá.
// ═══════════════════════════════════════════════════════════════════════════════════════════

type GrupoMoto = "COSTA" | "PRADERA" | "RASTREADOR" | "USADAS";
type Seccion = "inicio" | "entregas" | "flota" | "recaudo";

const GRUPO_NOMBRE: Record<GrupoMoto, string> = {
  RASTREADOR: "Rastreador", COSTA: "Costa", PRADERA: "Pradera", USADAS: "Usadas Club",
};

const SECCIONES: Array<{ id: Seccion; label: string }> = [
  { id: "inicio", label: "Inicio" },
  { id: "entregas", label: "Entregas" },
  { id: "flota", label: "Flota" },
  { id: "recaudo", label: "Recaudo" },
];

const fmt = (n: number) => Math.round(n).toLocaleString("es-CO");
const ALTO_BARRA = 104;
const MES_CORTO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// ── Átomos de la pantalla ───────────────────────────────────────────────────────────────────
// Escala tipográfica del proyecto: 22 / 18 / 15 / 13 / 12 / 11. Grilla de 4px. Pesos 400-700.

const card: React.CSSProperties = {
  background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14,
  padding: 16, boxSizing: "border-box", minWidth: 0,
};

function Rotulo({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--muted)" }}>{children}</div>;
}

function Nota({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginTop: 6 }}>{children}</div>;
}

function Vacio({ children }: { children: React.ReactNode }) {
  return <div style={{ ...card, textAlign: "center", color: "var(--muted)", fontSize: 13, padding: 24, lineHeight: 1.6 }}>{children}</div>;
}

export default function SocioDashboard() {
  const { profile, signOut } = useAuth();
  const grupo = (profile?.grupo ?? "RASTREADOR") as GrupoMoto;

  const [seccion, setSeccion] = useState<Seccion>("inicio");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const { motos } = useMotos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { pagos } = usePagos();
  const { deudas } = useDeudas();
  const { convenios } = useConvenios();

  const hoy = hoyISO();
  const ahora = hoyDate();
  const inicioMes = hoy.slice(0, 7) + "-01";

  const misMotos = useMemo(() => motos.filter(m => m.grupo === grupo), [motos, grupo]);
  const idsMisMotos = useMemo(() => new Set(misMotos.map(m => m.id)), [misMotos]);

  /** Contratos de MIS motos (todos, no solo activos: las entregas viejas también son mías). */
  const misContratos = useMemo(
    () => contratos.filter(c => c.moto_id && idsMisMotos.has(c.moto_id)),
    [contratos, idsMisMotos],
  );
  const activos = useMemo(() => misContratos.filter(c => c.estado === "Activo"), [misContratos]);
  const idsActivos = useMemo(() => new Set(activos.map(c => c.id)), [activos]);

  // Plata que ENTRÓ de verdad. `esPagoDeCaja` deja fuera los movimientos internos (la semana
  // adelantada de la base y los saldos a favor aplicados): esa plata ya se contó cuando entró.
  const misPagos = useMemo(
    () => pagos.filter(p => idsActivos.has(p.contrato_id) && p.estado === "Confirmado" && esPagoDeCaja(p)),
    [pagos, idsActivos],
  );
  const entroEsteMes = misPagos.filter(p => fechaDeCaja(p) >= inicioMes).reduce((a, p) => a + p.valor, 0);

  // ── El estado de cada cliente, con la MISMA cuenta que Cartera ────────────────────────────
  const cuentas = useMemo(() => activos.map(c => {
    const pagosC = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado");
    const convenio = convenios.find(cv => cv.contrato_id === c.id && cv.estado === "activo") ?? null;
    const cuotaConv = cuotaConvenioDelPeriodo(convenio, c, ahora);
    const cubierto = !!(convenio?.cubre_periodo_hasta && convenio.cubre_periodo_hasta >= hoy);
    const estado = calcularEstadoCartera(c, pagosC, ahora, cuotaConv, cubierto, convenio);
    return {
      contrato: c,
      cliente: clientes.find(cl => cl.id === c.cliente_id),
      moto: motos.find(m => m.id === c.moto_id),
      estado,
      dias: estado === "mora" ? diasEnMora(c, pagosC, ahora, cuotaConv, cubierto, convenio) : 0,
      deuda: deudas.filter(d => d.contrato_id === c.id && d.estado === "pendiente").reduce((a, d) => a + d.monto_pendiente, 0),
    };
  }), [activos, pagos, convenios, clientes, motos, deudas, ahora, hoy]);

  const enMora = cuentas.filter(x => x.estado === "mora").sort((a, b) => b.dias - a.dias);
  const enGabela = cuentas.filter(x => x.estado === "gabela");
  const alDia = cuentas.filter(x => x.estado !== "mora" && x.estado !== "gabela");

  const flota = useMemo(() => resumenFlota(misMotos), [misMotos]);
  const entregas = useMemo(() => entregasRecientes(misContratos, 15), [misContratos]);
  const vencimientos = useMemo(() => vencimientosProximos(misMotos, hoy), [misMotos, hoy]);
  const porMes = useMemo(() => recaudoPorMes(misPagos.map(p => ({ fecha: fechaDeCaja(p), valor: p.valor })), hoy, 6), [misPagos, hoy]);

  const ancho = isMobile ? "100%" : 760;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", textAlign: "left" }}>
      {/* Encabezado: quién es, de qué grupo, y que aquí solo se mira */}
      <div style={{ background: "#0f172a", color: "#fff", padding: isMobile ? "14px 16px 0" : "18px 24px 0" }}>
        <div style={{ maxWidth: ancho, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, letterSpacing: -0.2 }}>Grupo {GRUPO_NOMBRE[grupo]}</div>
              <div style={{ fontSize: 12, opacity: 0.62, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {profile?.nombre} · solo lectura
              </div>
            </div>
            <button onClick={() => signOut()} style={{
              flexShrink: 0, padding: "7px 14px", borderRadius: 9, fontSize: 12, fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.22)", background: "transparent", color: "rgba(255,255,255,0.8)", cursor: "pointer",
            }}>Salir</button>
          </div>
          <div style={{ display: "flex", gap: 2, marginTop: 14 }}>
            {SECCIONES.map(s => (
              <button key={s.id} onClick={() => setSeccion(s.id)} style={{
                flex: 1, padding: "9px 0", border: "none", cursor: "pointer", fontSize: 12,
                borderRadius: "8px 8px 0 0", minWidth: 0,
                fontWeight: seccion === s.id ? 700 : 500,
                background: seccion === s.id ? "var(--bg)" : "transparent",
                color: seccion === s.id ? "var(--text)" : "rgba(255,255,255,0.55)",
              }}>{s.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: ancho, margin: "0 auto", padding: isMobile ? "16px 12px 32px" : "20px 24px 40px", display: "grid", gap: 14 }}>

        {seccion === "inicio" && (
          <>
            <div style={card}>
              <Rotulo>Entró este mes</Rotulo>
              <div style={{ fontSize: isMobile ? 32 : 36, fontWeight: 700, letterSpacing: -0.5, color: "var(--text)", fontVariantNumeric: "tabular-nums", marginTop: 4, lineHeight: 1.05 }}>
                $ {fmt(entroEsteMes)}
              </div>
              <Nota>
                De {flota.total} moto{flota.total === 1 ? "" : "s"},{" "}
                <b style={{ color: "var(--text)" }}>{flota.produciendo} está{flota.produciendo === 1 ? "" : "n"} produciendo</b>.
                {flota.paradas > 0 && <> Las otras {flota.paradas} no generaron nada.</>}
              </Nota>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ ...card, flex: 1 }}>
                <Rotulo>Produciendo</Rotulo>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--ok-ink)", fontVariantNumeric: "tabular-nums", marginTop: 5, lineHeight: 1 }}>{flota.produciendo}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>con cliente</div>
              </div>
              <div style={{ ...card, flex: 1 }}>
                <Rotulo>Paradas</Rotulo>
                <div style={{ fontSize: 28, fontWeight: 700, color: flota.paradas > 0 ? "var(--warn-ink)" : "var(--muted)", fontVariantNumeric: "tabular-nums", marginTop: 5, lineHeight: 1 }}>{flota.paradas}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, lineHeight: 1.4 }}>
                  {flota.motivos.length === 0 ? "ninguna" : flota.motivos.map(m => `${m.cuantas} ${m.motivo}`).join(" · ")}
                </div>
              </div>
            </div>

            <div style={card}>
              <Rotulo>Cómo van pagando</Rotulo>
              <Barra alDia={alDia.length} gabela={enGabela.length} mora={enMora.length} />
              <Nota>Se cuenta igual que en Cartera: mismo día de pago, misma gabela, contando el convenio.</Nota>
            </div>

            {enMora.length > 0 && (
              <div style={card}>
                <Rotulo>Quiénes están en mora</Rotulo>
                <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                  {enMora.map(x => (
                    <div key={x.contrato.id} style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <Placa placa={x.moto?.placa ?? "—"} size="sm" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {x.cliente?.nombre ?? "—"}
                        </div>
                        {x.deuda > 0 && <div style={{ fontSize: 11.5, color: "var(--muted)" }}>debe además $ {fmt(x.deuda)}</div>}
                      </div>
                      <div style={{ flexShrink: 0, textAlign: "right" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--bad-ink)", fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>{x.dias}</div>
                        <div style={{ fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase" }}>día{x.dias === 1 ? "" : "s"}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Nota>La empresa ya está gestionando cada caso. Aquí solo se informa.</Nota>
              </div>
            )}

            {entregas[0] && (
              <div>
                <Rotulo>Última entrega</Rotulo>
                <div style={{ marginTop: 8 }}>
                  <TarjetaEntrega c={entregas[0]} clientes={clientes} motos={motos} />
                </div>
              </div>
            )}
          </>
        )}

        {seccion === "entregas" && (
          entregas.length === 0
            ? <Vacio>Todavía no hay entregas registradas en este grupo.<br />Cuando se entregue una moto, aparecerá aquí con sus fotos.</Vacio>
            : <>
                <Nota>Las motos de tu grupo que se han entregado, de la más reciente a la más antigua.</Nota>
                {entregas.map(c => <TarjetaEntrega key={c.id} c={c} clientes={clientes} motos={motos} />)}
              </>
        )}

        {seccion === "flota" && (
          <>
            {vencimientos.length > 0 && (
              <div style={{ ...card, borderColor: "var(--warn-line)", background: "var(--warn-soft)" }}>
                <Rotulo>Papeles por vencer</Rotulo>
                <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                  {vencimientos.slice(0, 8).map((v, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "var(--warn-ink)", minWidth: 0 }}>
                      <Placa placa={v.placa} size="sm" />
                      <span style={{ flex: 1, minWidth: 0 }}>{v.que}</span>
                      <b style={{ flexShrink: 0 }}>{v.dias < 0 ? `vencido hace ${-v.dias} d` : v.dias === 0 ? "vence hoy" : `en ${v.dias} d`}</b>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {misMotos.length === 0
              ? <Vacio>Este grupo todavía no tiene motos registradas.</Vacio>
              : <div style={card}>
                  <Rotulo>Tus {misMotos.length} motos</Rotulo>
                  <div style={{ display: "grid", gap: 8, marginTop: 10, maxHeight: isMobile ? "58vh" : "64vh", overflowY: "auto" }}>
                    {misMotos.slice().sort((a, b) => a.placa.localeCompare(b.placa)).map(m => {
                      const cta = cuentas.find(x => x.moto?.id === m.id);
                      return (
                        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <Placa placa={m.placa} size="sm" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {cta?.cliente?.nombre ?? <span style={{ color: "var(--muted)" }}>sin cliente</span>}
                            </div>
                            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{m.marca} {m.modelo}</div>
                          </div>
                          <span style={{
                            flexShrink: 0, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999,
                            background: m.estado === "Asignada" ? "var(--ok-soft)" : "var(--soft2)",
                            color: m.estado === "Asignada" ? "var(--ok-ink)" : "var(--muted2)",
                          }}>{m.estado === "Asignada" ? "produciendo" : m.estado}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>}
          </>
        )}

        {seccion === "recaudo" && (
          <>
            <div style={card}>
              <Rotulo>Últimos 6 meses</Rotulo>
              <Meses datos={porMes} />
              <Nota>Solo plata que entró de verdad. No incluye la semana adelantada de la base ni los saldos a favor aplicados, que ya se contaron cuando entraron.</Nota>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ ...card, flex: 1 }}>
                <Rotulo>Este mes</Rotulo>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums", marginTop: 5 }}>$ {fmt(entroEsteMes)}</div>
              </div>
              <div style={{ ...card, flex: 1 }}>
                <Rotulo>Contratos activos</Rotulo>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums", marginTop: 5 }}>{activos.length}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── La barra de cómo van pagando ────────────────────────────────────────────────────────────
export function Barra({ alDia, gabela, mora }: { alDia: number; gabela: number; mora: number }) {
  const total = Math.max(alDia + gabela + mora, 1);
  const seg = (n: number, color: string) => n > 0
    ? <div key={color} style={{ width: `${(n / total) * 100}%`, background: color, height: "100%" }} />
    : null;
  const punto = (color: string) => <span style={{ width: 7, height: 7, borderRadius: 999, background: color, display: "inline-block", marginRight: 5 }} />;
  return (
    <>
      <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", background: "var(--line2)", marginTop: 10 }}>
        {seg(alDia, "var(--ok-ink)")}{seg(gabela, "var(--warn-ink)")}{seg(mora, "var(--bad-ink)")}
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "var(--muted2)", marginTop: 9 }}>
        <span>{punto("var(--ok-ink)")}{alDia} al día</span>
        <span>{punto("var(--warn-ink)")}{gabela} con un día</span>
        <span>{punto("var(--bad-ink)")}{mora} en mora</span>
      </div>
    </>
  );
}

// ── Las barras del recaudo por mes ──────────────────────────────────────────────────────────
export function Meses({ datos }: { datos: Array<{ mes: string; total: number }> }) {
  const max = Math.max(...datos.map(d => d.total), 1);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", marginTop: 12 }}>
      {datos.map((d, i) => {
        const ultimo = i === datos.length - 1;
        // Altura en PÍXELES, no en %: dentro de un item flex sin altura definida el porcentaje
        // no resuelve y las barras salían como rayas de 2px.
        const alto = d.total > 0 ? Math.max(Math.round((d.total / max) * ALTO_BARRA), 6) : 3;
        return (
          <div key={d.mes} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ultimo ? "var(--accent-ink)" : "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
              {d.total > 0 ? `${Math.round(d.total / 100000) / 10}M` : ""}
            </div>
            <div style={{ width: "100%", height: ALTO_BARRA, display: "flex", alignItems: "flex-end" }}>
              <div style={{
                width: "100%", borderRadius: "4px 4px 0 0", height: alto,
                background: ultimo ? "var(--accent)" : d.total > 0 ? "var(--accent-line)" : "var(--line2)",
              }} />
            </div>
            <div style={{ fontSize: 10.5, color: ultimo ? "var(--accent-ink)" : "var(--faint)", fontWeight: ultimo ? 700 : 500 }}>
              {MES_CORTO[Number(d.mes.slice(5, 7)) - 1]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── La tarjeta de una entrega: la carta de presentación del socio ───────────────────────────
// Fotos grandes, placa amarilla, nombre y lo pactado en tres datos. NADA técnico ni legal:
// sin enlaces a documentos, sin marcas de si falta un papel. Eso es del administrador.
export function TarjetaEntrega({ c, clientes, motos }: {
  c: { id: string; cliente_id: string; moto_id: string | null; fecha_entrega: string | null; forma_pago?: string | null; valor_semanal?: number | null; meses?: number | null };
  clientes: Array<{ id: string; nombre: string }>;
  motos: Array<{ id: string; placa: string; marca?: string | null; modelo?: string | null; fotos_entrega?: Record<string, string> | null }>;
}) {
  const cliente = clientes.find(x => x.id === c.cliente_id);
  const moto = motos.find(m => m.id === c.moto_id);
  const fotos = Object.values(moto?.fotos_entrega ?? {}).filter(Boolean) as string[];

  return (
    <div style={{ ...card, padding: 0, overflow: "hidden" }}>
      <div style={{ position: "relative", height: 168, background: "var(--soft2)" }}>
        {fotos[0]
          ? <img src={fotos[0]} alt={`Entrega de la moto ${moto?.placa ?? ""}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--faint)", fontSize: 12.5 }}>Sin fotos de la entrega</div>}
        <div style={{ position: "absolute", left: 12, bottom: 12 }}>
          <Placa placa={moto?.placa ?? "—"} size="md" />
        </div>
        {fotos.length > 1 && (
          <div style={{ position: "absolute", right: 12, bottom: 12, background: "rgba(15,23,42,0.72)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999 }}>
            {fotos.length} fotos
          </div>
        )}
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: 0.2 }}>{cliente?.nombre ?? "—"}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
          Entregada el {c.fecha_entrega ? fmtFechaLarga(c.fecha_entrega) : "—"}
          {moto?.marca ? ` · ${moto.marca} ${moto.modelo ?? ""}`.trimEnd() : ""}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)", flexWrap: "wrap" }}>
          <Pactado label="Paga cada" valor={c.forma_pago ?? "—"} />
          <Pactado label="Cuota" valor={c.valor_semanal ? `$ ${fmt(c.valor_semanal)}` : "—"} />
          <Pactado label="Por" valor={c.meses ? `${c.meses} meses` : "—"} />
        </div>
      </div>
    </div>
  );
}

function Pactado({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, color: "var(--muted)" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums", marginTop: 1 }}>{valor}</div>
    </div>
  );
}
