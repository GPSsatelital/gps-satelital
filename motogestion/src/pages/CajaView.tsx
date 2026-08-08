import { useEffect, useMemo, useState } from "react";
import ImgPrivada from "../components/ImgPrivada";
import { usePagos, esPagoDeCaja, fechaDeCaja } from "../hooks/usePagos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos, type GrupoMoto } from "../hooks/useMotos";
import { useCaja, cierreDesactualizado } from "../hooks/useCaja";
import { useIngresosNoIdentificados, normalizarRef, pagoQueYaLaReclama, sinIdentificarDelDia, sinIdentificarSinGrupoDelDia } from "../hooks/useIngresosNoIdentificados";
import { useAbonosBase, basesDelDia } from "../hooks/useAbonosBase";
import { useCuentasBancarias, grupoDeCuenta } from "../hooks/useCuentasBancarias";
import { usePrestamos, grupoDePago as grupoDePagoCompartido } from "../hooks/usePrestamos";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { hoyISO, hoyDate } from "../utils/fecha";
import { COLOR_GRUPO } from "../styles/shared";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

const DIAS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const GRUPOS: GrupoMoto[] = ["COSTA", "PRADERA", "RASTREADOR", "USADAS"];

export default function CajaView() {
  const hoyDefault = hoyISO();
  const [fecha, setFecha] = useState(hoyDefault);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [cerrando, setCerrando] = useState(false);
  const [notas, setNotas] = useState("");
  // Arqueo del cierre (mig 064): la plata real contra la registrada.
  const [efectivoContado, setEfectivoContado] = useState("");
  const [bancoReportado, setBancoReportado] = useState("");
  // Alta de una transferencia que entró al banco y nadie reclamó.
  const [openNI, setOpenNI] = useState(false);
  const [guardandoNI, setGuardandoNI] = useState(false);
  const [errorNI, setErrorNI] = useState<string | null>(null);
  // `cuenta_id` = a qué cuenta cayó, que es lo que la secretaria está leyendo del extracto.
  // El grupo ya NO se hereda del filtro de la pantalla: se deduce de la cuenta cuando se puede.
  const [formNI, setFormNI] = useState({ fecha_banco: "", monto: "", referencia: "", nota: "", cuenta_id: "" });
  // Foto del extracto: obligatoria, igual que en cualquier transferencia. Es la prueba de que
  // esa plata entró, para el día que aparezca el dueño meses después.
  const [comprobanteNI, setComprobanteNI] = useState<File | null>(null);
  const [fotoAmpliadaNI, setFotoAmpliadaNI] = useState<string | null>(null);
  const [msgCierre, setMsgCierre] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filtroGrupo, setFiltroGrupo] = useState<"todos" | GrupoMoto>("todos");
  const [grupoACerrar, setGrupoACerrar] = useState<GrupoMoto | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const { profile, puede } = useAuth();
  // Permiso por persona (default = SECRETARIA, igual que antes "solo la secretaria cierra caja").
  const puedeCerrarCaja = puede("cerrar_caja");

  const { pagos, confirmarPago, subirComprobante } = usePagos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { prestamos } = usePrestamos();
  const { cerrarCaja, cajaDia } = useCaja();
  const { pendientes: pendientesNI, registrar: registrarNI, eliminar: eliminarNI } = useIngresosNoIdentificados();
  const { abonos: abonosBase } = useAbonosBase();
  const { activas: cuentasActivas } = useCuentasBancarias();

  const pagosDia = useMemo(() =>
    // esPagoDeCaja: los pagos internos (adelanto de base) NO entran a la caja diaria.
    // fechaDeCaja = el día en que se DIGITÓ (no aquel en que el cliente pagó): así el arqueo
    // cuadra con la plata que hoy está en la mano y un pago reportado tarde no altera un cierre viejo.
    pagos.filter(p => fechaDeCaja(p) === fecha && esPagoDeCaja(p)).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [pagos, fecha]
  );

  function getInfo(contratoId: string) {
    const c = contratos.find(ct => ct.id === contratoId);
    const cl = clientes.find(cl => cl.id === c?.cliente_id);
    const m = motos.find(m => m.id === c?.moto_id);
    return { nombre: cl?.nombre ?? "—", placa: m?.placa ?? "—" };
  }

  // Grupo de un pago: fuente única en usePrestamos (pago → contrato → moto del PORTAFOLIO → grupo).
  // Recibe el pago entero, no solo el contrato, porque el alquiler de una moto prestada le entra al
  // portafolio de ESA moto y no al del contrato (ver motoDelPortafolio).
  function grupoDePago(p: { contrato_id: string; tipo_registro?: string | null }): GrupoMoto | null {
    return grupoDePagoCompartido(p.contrato_id, contratos, motos, prestamos, p.tipo_registro) as GrupoMoto | null;
  }

  // Vista filtrada por el chip de grupo (para los KPIs y las listas). El CIERRE siempre
  // usa el día completo, sin importar el filtro (ver resumenDia más abajo).
  const pagosDiaVista = useMemo(() =>
    filtroGrupo === "todos" ? pagosDia : pagosDia.filter(p => grupoDePago(p) === filtroGrupo),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagosDia, filtroGrupo, contratos, motos]
  );

  function calcResumen(lista: typeof pagosDia) {
    const conf = lista.filter(p => p.estado === "Confirmado");
    const efectivo = conf.filter(p => p.metodo === "Efectivo").reduce((s, p) => s + p.valor, 0);
    const transfer = conf.filter(p => p.metodo === "Transferencia").reduce((s, p) => s + p.valor, 0);
    const pend = lista.filter(p => p.estado === "Pendiente");
    // Multas de recolección cobradas (mig 085): va DENTRO del total —es plata que entró igual—
    // pero se muestra aparte porque no es del arriendo: es el costo de ir a buscar la moto.
    const multas = conf.reduce((s, p) => s + (p.aplicado_multa ?? 0), 0);
    return { efectivo, transfer, total: efectivo + transfer, multas, pendientes: pend, totalPendiente: pend.reduce((s, p) => s + p.valor, 0), confirmados: conf.length };
  }

  // resumen = lo que se muestra (filtrado por grupo). resumenDia = día completo (referencia).
  const resumen = useMemo(() => calcResumen(pagosDiaVista), [pagosDiaVista]);
  const resumenDia = useMemo(() => calcResumen(pagosDia), [pagosDia]);

  // Cada grupo se cierra por aparte; en la vista "Todos" no hay ninguno seleccionado.
  const grupoEnVista = filtroGrupo === "todos" ? null : filtroGrupo;
  // Plata que SÍ entró al banco este día y todavía no tiene dueño. Se muestra aparte del
  // recaudo, nunca dentro: al aparecer el dueño se registra como pago y entra a ESTE mismo día.
  const niDelDiaVista = sinIdentificarDelDia(pendientesNI, fecha, grupoEnVista);
  const niSinGrupoDelDia = sinIdentificarSinGrupoDelDia(pendientesNI, fecha);
  // Plata de BASES INICIALES movida este día (mig 091). Va en renglón propio, nunca dentro de
  // "Cobrado a clientes": no es cobro de arriendo, es lo que el cliente entrega para arrancar.
  // Pero SÍ está en la gaveta, así que el arqueo tiene que contarla o el día nunca cuadra —
  // era justo lo que faltaba para que la caja calzara con el efectivo real.
  const basesDelDiaVista = basesDelDia(abonosBase, fecha, grupoEnVista);
  const basesSinGrupoDelDia = basesDelDia(abonosBase.filter(a => !a.grupo), fecha);

  function resumenDeGrupo(grupo: GrupoMoto) {
    return calcResumen(pagosDia.filter(p => grupoDePago(p) === grupo));
  }
  // Cuántos grupos (con dinero) ya están cerrados hoy.
  const gruposConDinero = resumenPorGrupoSafe();
  function resumenPorGrupoSafe() { return GRUPOS.filter(g => pagosDia.some(p => grupoDePago(p) === g && p.estado === "Confirmado")); }
  const gruposCerrados = gruposConDinero.filter(g => cajaDia(fecha, g));

  // Desglose por cada grupo (siempre del día completo — es el cuadro nuevo por portafolio).
  const resumenPorGrupo = useMemo(() => {
    return GRUPOS.map(g => {
      const lista = pagosDia.filter(p => grupoDePago(p) === g);
      const r = calcResumen(lista);
      return { grupo: g, ...r, count: r.confirmados };
    }).filter(x => x.total > 0 || x.pendientes.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagosDia, contratos, motos]);

  const pagosEfectivo = useMemo(() => pagosDiaVista.filter(p => p.estado === "Confirmado" && p.metodo === "Efectivo"), [pagosDiaVista]);
  const pagosTransfer = useMemo(() => pagosDiaVista.filter(p => p.estado === "Confirmado" && p.metodo === "Transferencia"), [pagosDiaVista]);

  // Nombres de los funcionarios (para la conciliación de cobros en campo)
  const [nombresPorId, setNombresPorId] = useState<Record<string, string>>({});
  useEffect(() => {
    supabase.from("profiles").select("id, nombre").then(({ data }) => {
      const map: Record<string, string> = {};
      (data ?? []).forEach((p: { id: string; nombre: string }) => { map[p.id] = p.nombre; });
      setNombresPorId(map);
    });
  }, []);

  // Conciliación: efectivo cobrado en campo, agrupado por funcionario
  const conciliacionCampo = useMemo(() => {
    const campo = pagosDiaVista.filter(p => p.tipo_registro === "campo");
    const porPersona: Record<string, { nombre: string; total: number; count: number; pendienteEntregar: number; pendienteConfirmar: number }> = {};
    campo.forEach(p => {
      const id = p.registrado_por ?? "—";
      if (!porPersona[id]) porPersona[id] = { nombre: nombresPorId[id] ?? "Funcionario", total: 0, count: 0, pendienteEntregar: 0, pendienteConfirmar: 0 };
      porPersona[id].total += p.valor;
      porPersona[id].count += 1;
      if (!p.entregado_caja) porPersona[id].pendienteEntregar += p.valor;
      if (p.estado === "Pendiente") porPersona[id].pendienteConfirmar += p.valor;
    });
    return Object.values(porPersona).sort((a, b) => b.total - a.total);
  }, [pagosDiaVista, nombresPorId]);

  const fechaObj = new Date(fecha + "T00:00:00");
  const fechaDisplay = `${DIAS[fechaObj.getDay()]} ${fechaObj.getDate()} de ${MESES[fechaObj.getMonth()]} ${fechaObj.getFullYear()}`;

  async function handleConfirmar(id: string) {
    if (!confirm("¿Confirmar este pago? Quedará registrado como confirmado en la caja.")) return;
    setConfirmando(id);
    await confirmarPago(id);
    setConfirmando(null);
  }

  function abrirCierre(grupo: GrupoMoto) {
    setGrupoACerrar(grupo);
    setMsgCierre(null);
    // El arqueo es de ESTE grupo: si quedaran valores del cierre anterior (o de uno cancelado),
    // el descuadre saldría calculado contra cifras de otra caja.
    // Si el día YA se cerró y se está actualizando, se traen sus cifras de arqueo: el guardado
    // es un upsert, así que dejarlas vacías las pisaría con null y se perdería el conteo que
    // ya se había hecho con la plata en la mano.
    const previo = cajaDia(fecha, grupo);
    setEfectivoContado(previo?.efectivo_contado != null ? String(Math.round(previo.efectivo_contado)) : "");
    setBancoReportado(previo?.banco_reportado != null ? String(Math.round(previo.banco_reportado)) : "");
    setNotas("");
    setShowModal(true);
  }

  /**
   * Arqueo: efectivo y banco se comparan CADA UNO POR SU LADO. Sumarlos antes de comparar
   * dejaría que un faltante de efectivo se tape con un sobrante del banco y el día saldría
   * "cuadrado" — justo lo que el arqueo existe para detectar.
   * Un campo vacío significa "no se contó": ese lado no se da por bueno, se marca sin verificar.
   */
  // `sinDueno`: la plata que entró al banco ese día y nadie ha reclamado. El extracto SÍ la
  // trae, así que hay que sumarla a lo esperado; si no, el arqueo la reporta como sobrante
  // todos los días aunque ya esté anotada, y esa alarma permanente deja de leerse.
  // `bases`: la plata de bases iniciales movida ese día. NO es cobro de arriendo, pero SÍ está
  // en la gaveta (o en el banco si transfirieron), así que lo esperado tiene que incluirla o el
  // día nunca cuadra. Era exactamente lo que faltaba: se registraban clientes nuevos y la
  // secretaria terminaba con más efectivo del que el sistema decía.
  function calcArqueo(
    efectivo: number, transfer: number, sinDueno = 0,
    bases: { efectivo: number; transfer: number } = { efectivo: 0, transfer: 0 },
  ) {
    const hayEf = efectivoContado !== "";
    const hayBc = bancoReportado !== "";
    return {
      hayEf, hayBc,
      difEf: hayEf ? Number(efectivoContado) - (efectivo + bases.efectivo) : null,
      difBc: hayBc ? Number(bancoReportado) - (transfer + sinDueno + bases.transfer) : null,
      verificado: hayEf || hayBc,
      completo: hayEf && hayBc,
    };
  }

  async function handleCerrarCaja() {
    if (!puedeCerrarCaja || !grupoACerrar) return;
    const g = grupoACerrar;
    setCerrando(true);
    setMsgCierre(null);
    // Cada grupo se cierra por aparte: solo los pagos de ese portafolio.
    const r = resumenDeGrupo(g);
    // Si ya estaba cerrado, esto es una ACTUALIZACIÓN: queda escrito de cuánto a cuánto se movió,
    // porque el upsert pisa la cifra vieja y si no se anota nadie sabría que cambió.
    const previo = cajaDia(fecha, g);
    const arq = calcArqueo(r.efectivo, r.transfer, sinIdentificarDelDia(pendientesNI, fecha, g), basesDelDia(abonosBase, fecha, g));
    const detalle = pagosDia
      .filter(p => p.estado === "Confirmado" && grupoDePago(p) === g)
      .map(p => {
        const { nombre, placa } = getInfo(p.contrato_id);
        return { placa, nombre, valor: p.valor, metodo: p.metodo, grupo: g };
      });
    const { error } = await cerrarCaja({
      fecha,
      grupo: g,
      efectivo: r.efectivo,
      transferencias: r.transfer,
      total: r.total,
      detalle,
      cerradoPor: profile?.id ?? null,
      // El detalle de los dos lados va en las notas para que quede rastro escrito; las cifras
      // crudas (efectivo_contado/banco_reportado vs efectivo_total/transferencias_total)
      // permiten recalcular ambas diferencias en cualquier informe futuro.
      notas: [
        notas.trim(),
        previo ? `Actualizado: se había cerrado en $${fmt(previo.total)} y ahora son $${fmt(r.total)}` : "",
        arq.verificado
          ? `Arqueo — efectivo: ${arq.hayEf ? `$${fmt(arq.difEf!)}` : "sin verificar"}; banco: ${arq.hayBc ? `$${fmt(arq.difBc!)}` : "sin verificar"}`
          : "",
      ].filter(Boolean).join(" | ") || undefined,
      // Arqueo: si no lo llenaron, se guarda null (el cierre queda como antes).
      efectivoContado: efectivoContado === "" ? null : Number(efectivoContado),
      bancoReportado: bancoReportado === "" ? null : Number(bancoReportado),
      // `diferencia` = descuadre de la CAJA FÍSICA (el que señala plata faltante). Nunca la
      // suma de los dos lados: eso neteaba un faltante contra un sobrante y daba 0.
      diferencia: arq.difEf,
    });
    setCerrando(false);
    setShowModal(false);
    if (error) {
      setMsgCierre(`Error: ${error}`);
    } else {
      setMsgCierre(previo ? `Caja de ${g} actualizada — $${fmt(r.total)}` : `Caja de ${g} cerrada — $${fmt(r.total)}`);
      setNotas(""); setEfectivoContado(""); setBancoReportado("");
      setGrupoACerrar(null);
    }
  }

  function PagoCard({ p, showConfirm }: { p: typeof pagosDia[0]; showConfirm?: boolean }) {
    const { nombre, placa } = getInfo(p.contrato_id);
    const hora = p.created_at ? new Date(p.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "—";
    return (
      <div style={{
        background: "var(--card)",
        borderRadius: 12,
        padding: "12px 16px",
        border: "1px solid var(--line)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {nombre}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{placa} · {hora}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>${fmt(p.valor)}</div>
          {showConfirm && (
            <button onClick={() => handleConfirmar(p.id)} disabled={confirmando === p.id}
              style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--accent)", color: "var(--card)", opacity: confirmando === p.id ? 0.7 : 1, whiteSpace: "nowrap" }}>
              {confirmando === p.id ? "..." : "Confirmar"}
            </button>
          )}
        </div>
      </div>
    );
  }

  const seccionEfectivo = (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--ok-ink)", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Efectivo recibido
        </div>
        <span style={{ background: "var(--ok-soft)", color: "var(--ok-ink)", fontWeight: 700, fontSize: 12, padding: "3px 10px", borderRadius: 999 }}>
          {pagosEfectivo.length} pagos
        </span>
      </div>
      {pagosEfectivo.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 16px", background: "var(--card)", borderRadius: 12, color: "var(--faint)", fontSize: 13 }}>
          Sin pagos en efectivo
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pagosEfectivo.map(p => <PagoCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );

  const seccionTransfer = (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--accent-ink)", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Transferencias confirmadas
        </div>
        <span style={{ background: "var(--accent-soft3)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 12, padding: "3px 10px", borderRadius: 999 }}>
          {pagosTransfer.length} pagos
        </span>
      </div>
      {pagosTransfer.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 16px", background: "var(--card)", borderRadius: 12, color: "var(--faint)", fontSize: 13 }}>
          Sin transferencias confirmadas
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pagosTransfer.map(p => <PagoCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );

  const seccionPendientes = resumen.pendientes.length > 0 && (
    <div style={{ background: "var(--warn-soft2)", border: "1px solid var(--warn-line)", borderRadius: 16, padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--warn-ink)", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Pendientes de confirmar
        </div>
        <span style={{ background: "var(--warn-soft)", color: "var(--warn-ink)", fontWeight: 700, fontSize: 12, padding: "3px 10px", borderRadius: 999 }}>
          ${fmt(resumen.totalPendiente)}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {resumen.pendientes.map(p => <PagoCard key={p.id} p={p} showConfirm={puedeCerrarCaja} />)}
      </div>
    </div>
  );

  const seccionConciliacionCampo = conciliacionCampo.length > 0 && (
    <div style={{ background: "var(--ok-soft)", border: "1px solid var(--ok-line)", borderRadius: 16, padding: "16px 20px" }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--ok-ink)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
        💵 Cobros en campo — efectivo a recibir por funcionario
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {conciliacionCampo.map((p, i) => (
          <div key={i} style={{ background: "var(--card)", borderRadius: 12, padding: "10px 14px", border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", color: "var(--text)" }}>{p.nombre}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ok-ink)" }}>${fmt(p.total)}</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              {p.count} cobro(s)
              {p.pendienteEntregar > 0 && <span style={{ color: "var(--warn-ink)", fontWeight: 700 }}> · Pendiente entregar: ${fmt(p.pendienteEntregar)}</span>}
              {p.pendienteConfirmar > 0 && <span style={{ color: "var(--accent-ink)", fontWeight: 700 }}> · Sin confirmar: ${fmt(p.pendienteConfirmar)}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const resumenFooter = (
    <div style={{ background: "var(--ink)", borderRadius: 16, padding: "20px 24px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 }}>
        Resumen del día
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 11, color: "var(--faint)" }}>Efectivo</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ok)", marginTop: 2 }}>${fmt(resumen.efectivo)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 11, color: "var(--faint)" }}>Transferencias</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-line)", marginTop: 2 }}>${fmt(resumen.transfer)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 11, color: "var(--faint)" }}>Cobrado a clientes</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--on-ink)", marginTop: 2 }}>${fmt(resumen.total)}</div>
          {/* Va DENTRO del cobrado, no aparte: esa plata sí entró. Se destaca porque no es
              arriendo — es lo que costó ir a buscar la moto, y el dueño quiere verlo solo. */}
          {resumen.multas > 0 && (
            <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700, marginTop: 4 }}>
              🔒 De eso, multas de recolección: ${fmt(resumen.multas)}
            </div>
          )}
        </div>
      </div>
      {/* Plata que SÍ entró al banco ese día y todavía no tiene dueño. Va en su propio renglón,
          nunca dentro del cobrado: el día que el cliente la reclame se registra como pago y entra
          al recaudo de este mismo día. Si estuviera arriba, quedaría contada dos veces. */}
      {niDelDiaVista > 0 && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed rgba(255,255,255,0.15)", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <div style={{ fontSize: 11, color: "var(--faint)" }}>+ Entró al banco sin dueño</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fbbf24", marginTop: 2 }}>${fmt(niDelDiaVista)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <div style={{ fontSize: 11, color: "var(--faint)" }}>Total que llegó al banco</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--on-ink)", marginTop: 2 }}>${fmt(resumen.total + niDelDiaVista)}</div>
          </div>
          <div style={{ flexBasis: "100%", fontSize: 11.5, color: "var(--faint)", lineHeight: 1.45 }}>
            Esa plata está en la cuenta pero nadie la ha reclamado, así que no está abonada a ningún
            cliente. Cuando aparezca el dueño se registra como pago y pasa arriba, a este mismo día.
            {grupoEnVista == null && niSinGrupoDelDia > 0 && ` De ella, $${fmt(niSinGrupoDelDia)} todavía no se sabe de cuál grupo es.`}
          </div>
        </div>
      )}
      {resumen.pendientes.length > 0 && (
        <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
          <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700 }}>
            {resumen.pendientes.length} transferencia{resumen.pendientes.length > 1 ? "s" : ""} pendiente{resumen.pendientes.length > 1 ? "s" : ""} de confirmar — ${fmt(resumen.totalPendiente)}
          </span>
        </div>
      )}
    </div>
  );

  // Cada grupo se cierra por aparte. En la vista "Todos" el cierre se hace desde la
  // tarjeta de cada grupo; en una vista filtrada, este botón cierra ese grupo.
  const cajaGrupoVista = grupoEnVista ? cajaDia(fecha, grupoEnVista) : null;
  // Mismo aviso que en la tarjeta del grupo: el cierre firmado ya no coincide con la caja real.
  const difCierreVista = cierreDesactualizado(cajaGrupoVista, resumen);
  const botonCerrar = puedeCerrarCaja && (
    <div>
      {msgCierre && (
        <div style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: msgCierre.startsWith("Error") ? "var(--bad-soft)" : "var(--ok-soft)", color: msgCierre.startsWith("Error") ? "var(--bad-ink)" : "var(--ok-ink)" }}>
          {msgCierre}
        </div>
      )}
      {grupoEnVista ? (
        cajaGrupoVista ? (
          difCierreVista ? (
            <div>
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", fontSize: 12.5, color: "var(--warn-ink)", fontWeight: 600, lineHeight: 1.5 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>⚠️ Este cierre cambió</div>
                Se firmó en <strong>${fmt(cajaGrupoVista.total)}</strong> y hoy el día tiene <strong>${fmt(resumen.total)}</strong>.
                {" "}{difCierreVista.total > 0
                  ? `Entraron $${fmt(difCierreVista.total)} más después de cerrarlo`
                  : difCierreVista.total < 0
                    ? `Salieron $${fmt(Math.abs(difCierreVista.total))} después de cerrarlo`
                    : "Cambió el reparto entre efectivo y transferencias"}
                : casi siempre es una transferencia que el banco recibió este día y alguien digitó después.
              </div>
              <button
                onClick={() => abrirCierre(grupoEnVista)}
                style={{ marginTop: 10, width: "100%", padding: "14px 20px", borderRadius: 12, border: "none", background: "var(--warn-ink)", color: "var(--card)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                Actualizar cierre — ${fmt(resumen.total)}
              </button>
            </div>
          ) : (
            <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--ok-soft)", border: "1px solid var(--ok-line)", fontSize: 13, fontWeight: 700, color: "var(--ok-ink)", textAlign: "center" }}>
              ✓ Caja de {grupoEnVista} cerrada — ${fmt(cajaGrupoVista.total)}
            </div>
          )
        ) : (
          <button
            onClick={() => abrirCierre(grupoEnVista)}
            disabled={resumen.total === 0}
            style={{ width: "100%", padding: "14px 20px", borderRadius: 12, border: "none", background: resumen.total === 0 ? "var(--line)" : COLOR_GRUPO[grupoEnVista], color: resumen.total === 0 ? "var(--faint)" : "var(--card)", fontSize: 14, fontWeight: 700, cursor: resumen.total === 0 ? "not-allowed" : "pointer" }}
          >
            Cerrar caja de {grupoEnVista} — ${fmt(resumen.total)}
          </button>
        )
      ) : (
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--soft)", fontSize: 12, color: "var(--muted3)", fontWeight: 600, textAlign: "center" }}>
          Cada grupo se cierra por aparte desde su tarjeta de arriba.
          {gruposConDinero.length > 0 && (
            <div style={{ marginTop: 4, fontWeight: 700, color: "var(--text)" }}>
              {gruposCerrados.length} de {gruposConDinero.length} grupos cerrados
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Hero */}
      <div style={{ background: "var(--card)", borderRadius: 16, padding: "20px 24px", marginBottom: 20, border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              Caja del
            </div>
            <h2 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "var(--text)" }}>{fechaDisplay}</h2>
            {grupoEnVista ? (
              cajaGrupoVista && (
                <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "var(--ok-soft)", border: "1px solid var(--ok-line)" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ok-ink)" }}>Caja de {grupoEnVista} cerrada</span>
                </div>
              )
            ) : gruposConDinero.length > 0 && (
              <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: gruposCerrados.length === gruposConDinero.length ? "var(--ok-soft)" : "var(--warn-soft)", border: `1px solid ${gruposCerrados.length === gruposConDinero.length ? "var(--ok-line)" : "var(--warn-line)"}` }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: gruposCerrados.length === gruposConDinero.length ? "var(--ok-ink)" : "var(--warn-ink)" }}>
                  {gruposCerrados.length} de {gruposConDinero.length} grupos cerrados
                </span>
              </div>
            )}
          </div>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13, color: "var(--text)" }} />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 100, background: "var(--ok-soft)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ok-ink)", textTransform: "uppercase" }}>Efectivo</div>
            <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: "var(--ok-ink)", marginTop: 4 }}>${fmt(resumen.efectivo)}</div>
            <div style={{ fontSize: 11, color: "var(--ok-ink)", opacity: 0.7, marginTop: 2 }}>{pagosEfectivo.length} pagos</div>
          </div>
          <div style={{ flex: 1, minWidth: 100, background: "var(--accent-soft3)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-ink)", textTransform: "uppercase" }}>Transferencias</div>
            <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: "var(--accent-ink)", marginTop: 4 }}>${fmt(resumen.transfer)}</div>
            <div style={{ fontSize: 11, color: "var(--accent-ink)", opacity: 0.7, marginTop: 2 }}>{pagosTransfer.length} pagos</div>
          </div>
          <div style={{ flex: 1, minWidth: 120, background: "var(--ink)", borderRadius: 12, padding: "14px 16px" }}>
            {/* "Cobrado a clientes", no "Total general": desde que se muestra aparte la plata que
                entró al banco sin dueño, esta cifra ya no es el total de nada. Mismo nombre que
                en el Resumen del día — dos nombres para el mismo número confunden. */}
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase" }}>Cobrado a clientes</div>
            <div style={{ fontSize: isMobile ? 22 : 30, fontWeight: 700, color: "var(--on-ink)", marginTop: 4 }}>${fmt(resumen.total)}</div>
            <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>{resumen.confirmados} confirmados{filtroGrupo !== "todos" ? ` · ${filtroGrupo}` : ""}</div>
          </div>
          {/* El total DE VERDAD que llegó al banco. Estaba solo en el Resumen del día, abajo, y
              el número que todo el mundo mira es este de arriba: había que bajar la pantalla para
              enterarse de que además entró plata sin dueño. Solo aparece cuando la hay. */}
          {niDelDiaVista > 0 && (
            <div style={{ flex: 1, minWidth: 120, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--warn-ink)", textTransform: "uppercase" }}>Llegó al banco</div>
              <div style={{ fontSize: isMobile ? 22 : 30, fontWeight: 700, color: "var(--warn-ink)", marginTop: 4 }}>${fmt(resumen.total + niDelDiaVista)}</div>
              <div style={{ fontSize: 11, color: "var(--warn-ink)", opacity: 0.85, marginTop: 2 }}>+ ${fmt(niDelDiaVista)} sin dueño</div>
            </div>
          )}
          {/* BASES INICIALES en renglón propio (mig 091). No es cobro de arriendo — es lo que el
              cliente entrega para arrancar su proceso — así que nunca va dentro de "Cobrado a
              clientes". Pero SÍ está en la gaveta, y el arqueo ya la cuenta. Antes esta plata no
              aparecía en ninguna parte y el efectivo del día jamás cuadraba. */}
          {basesDelDiaVista.total !== 0 && (
            <div style={{ flex: 1, minWidth: 120, background: "var(--accent-soft4)", border: "1px solid var(--accent-line)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-ink)", textTransform: "uppercase" }}>Bases iniciales</div>
              <div style={{ fontSize: isMobile ? 22 : 30, fontWeight: 700, color: "var(--accent-ink)", marginTop: 4 }}>${fmt(basesDelDiaVista.total)}</div>
              <div style={{ fontSize: 11, color: "var(--accent-ink)", opacity: 0.85, marginTop: 2 }}>
                {basesDelDiaVista.efectivo !== 0 && <>efectivo ${fmt(basesDelDiaVista.efectivo)}</>}
                {basesDelDiaVista.efectivo !== 0 && basesDelDiaVista.transfer !== 0 && " · "}
                {basesDelDiaVista.transfer !== 0 && <>transf. ${fmt(basesDelDiaVista.transfer)}</>}
                {grupoEnVista === null && basesSinGrupoDelDia.total !== 0 && <> · aún sin portafolio</>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chips de filtro por grupo (portafolio) */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {(["todos", ...GRUPOS] as const).map(g => (
          <button
            key={g}
            onClick={() => setFiltroGrupo(g)}
            style={{
              border: "none", borderRadius: 999, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
              background: filtroGrupo === g ? (g === "todos" ? "var(--text)" : COLOR_GRUPO[g as GrupoMoto]) : "var(--soft)",
              color: filtroGrupo === g ? "var(--card)" : "var(--muted2)",
            }}
          >
            {g === "todos" ? "Todos" : g}
          </button>
        ))}
      </div>

      {/* Resumen por grupo (portafolios) — solo en la vista "Todos" */}
      {filtroGrupo === "todos" && resumenPorGrupo.length > 0 && (
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
            📊 Recaudo por grupo
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {resumenPorGrupo.map(g => {
              const cerrada = cajaDia(fecha, g.grupo);
              // Entró (o salió) plata de este día DESPUÉS de haberlo cerrado.
              const difCierre = cierreDesactualizado(cerrada, g);
              return (
                <div
                  key={g.grupo}
                  style={{ border: `1px solid ${COLOR_GRUPO[g.grupo]}33`, borderLeft: `4px solid ${COLOR_GRUPO[g.grupo]}`, borderRadius: 12, padding: "12px 14px", background: "var(--soft2)" }}
                >
                  <div onClick={() => setFiltroGrupo(g.grupo)} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: COLOR_GRUPO[g.grupo], textTransform: "uppercase" }}>{g.grupo}</span>
                      {cerrada && (difCierre
                        ? <span style={{ fontSize: 11, fontWeight: 700, color: "var(--warn-ink)", background: "var(--warn-soft)", padding: "2px 8px", borderRadius: 999 }}>⚠️ El cierre cambió</span>
                        : <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ok-ink)", background: "var(--ok-soft)", padding: "2px 8px", borderRadius: 999 }}>✓ Cerrada</span>
                      )}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>${fmt(g.total)}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                      Efectivo ${fmt(g.efectivo)} · Transf. ${fmt(g.transfer)}
                      <br />{g.count} pago{g.count !== 1 ? "s" : ""}{g.pendientes.length > 0 ? ` · ${g.pendientes.length} pend.` : ""}
                    </div>
                    {sinIdentificarDelDia(pendientesNI, fecha, g.grupo) > 0 && (
                      <div style={{ fontSize: 11.5, color: "var(--warn-ink)", fontWeight: 700, marginTop: 4 }}>
                        + ${fmt(sinIdentificarDelDia(pendientesNI, fecha, g.grupo))} entró al banco sin dueño
                      </div>
                    )}
                  </div>
                  {difCierre && (
                    <div style={{ marginTop: 10, padding: "9px 11px", borderRadius: 10, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", fontSize: 11.5, color: "var(--warn-ink)", fontWeight: 600, lineHeight: 1.45 }}>
                      Se cerró en <strong>${fmt(cerrada!.total)}</strong> y hoy este día tiene <strong>${fmt(g.total)}</strong>.
                      {" "}{difCierre.total > 0
                        ? `Entraron $${fmt(difCierre.total)} más después de cerrarlo`
                        : difCierre.total < 0
                          ? `Salieron $${fmt(Math.abs(difCierre.total))} después de cerrarlo`
                          : "Cambió el reparto entre efectivo y transferencias"}
                      {" "}— casi siempre es una transferencia que el banco recibió este día y se digitó después.
                      {" "}Vuelve a cerrarlo para que la cifra firmada sea la de verdad.
                    </div>
                  )}
                  {puedeCerrarCaja && (!cerrada ? g.total > 0 : !!difCierre) && (
                    <button
                      onClick={() => abrirCierre(g.grupo)}
                      style={{ marginTop: 10, width: "100%", padding: "8px 12px", borderRadius: 8, border: "none", background: cerrada ? "var(--warn-ink)" : COLOR_GRUPO[g.grupo], color: "var(--card)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      {cerrada ? `Actualizar cierre de ${g.grupo}` : `Cerrar caja de ${g.grupo}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--line2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>Cobrado a clientes — todos los grupos</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>${fmt(resumenDia.total)}</span>
          </div>
        </div>
      )}

      {/* Aviso cuando se está viendo un grupo filtrado */}
      {filtroGrupo !== "todos" && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: `${COLOR_GRUPO[filtroGrupo]}14`, border: `1px solid ${COLOR_GRUPO[filtroGrupo]}33`, fontSize: 13, color: COLOR_GRUPO[filtroGrupo], fontWeight: 700 }}>
          Viendo solo el grupo {filtroGrupo}. Cada grupo se cierra por aparte.
        </div>
      )}

      {/* Dinero que entró al banco y nadie reportó como suyo */}
      <div style={{ marginBottom: 20, background: "var(--card)", borderRadius: 16, padding: isMobile ? "14px 12px" : "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>💰 Dinero sin identificar</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Transferencias que entraron al banco y ningún cliente ha reclamado. Cuando aparezca el dueño, se cruza por su número de referencia.
            </div>
          </div>
          {puedeCerrarCaja && (
            <button onClick={() => { setFormNI({ fecha_banco: fecha, monto: "", referencia: "", nota: "", cuenta_id: "" }); setErrorNI(null); setOpenNI(true); }}
              style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "var(--warn-ink)", color: "var(--card)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              + Registrar transferencia sin identificar
            </button>
          )}
        </div>
        {pendientesNI.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--faint)", padding: "10px 0" }}>No hay dinero sin identificar. ✓</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {pendientesNI.map(i => {
              const dias = Math.round((hoyDate().getTime() - new Date(i.fecha_banco + "T00:00:00").getTime()) / 86400000);
              // El cruce automático solo mira hacia adelante. Si el pago se registró ANTES de
              // que se anotara esta partida, nadie las junta nunca y queda figurando sin dueño.
              const yaPagado = pagoQueYaLaReclama(i, pagos);
              const infoPago = yaPagado ? getInfo(yaPagado.contrato_id) : null;
              return (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
                  padding: "10px 12px", borderRadius: 10,
                  background: yaPagado ? "var(--bad-soft)" : "var(--warn-soft)",
                  border: `1px solid ${yaPagado ? "var(--bad-line)" : "var(--warn-line)"}` }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--warn-ink)" }}>${fmt(i.monto)} · ref. {i.referencia}</div>
                    <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 2 }}>
                      Entró el {new Date(i.fecha_banco + "T00:00:00").toLocaleDateString("es-CO")}
                      {dias > 0 && ` · hace ${dias} día${dias === 1 ? "" : "s"}`}
                      {i.grupo ? ` · ${i.grupo}` : " · sin grupo"}
                      {i.nota ? ` · ${i.nota}` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {i.comprobante_url && (
                      <ImgPrivada src={i.comprobante_url} onClick={() => setFotoAmpliadaNI(i.comprobante_url)}
                        title="Ver el extracto del banco"
                        style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: "1px solid var(--warn-line)" }} />
                    )}
                    {puedeCerrarCaja && (
                      <button onClick={async () => {
                        if (!confirm("¿Eliminar esta partida? Úsalo solo si se registró por error.")) return;
                        await eliminarNI(i.id);
                      }} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--card)", color: "var(--muted2)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        Eliminar
                      </button>
                    )}
                  </div>
                  {yaPagado && infoPago && (
                    <div style={{ flexBasis: "100%", minWidth: 0, boxSizing: "border-box", padding: "9px 11px", borderRadius: 9, background: "var(--card)", border: "1px solid var(--bad-line)", fontSize: 11.5, color: "var(--bad-ink)", fontWeight: 600, lineHeight: 1.5 }}>
                      ⚠️ Esta misma referencia ya está registrada como pago de{" "}
                      <strong style={{ textTransform: "uppercase" }}>{infoPago.nombre}</strong>
                      {infoPago.placa !== "—" ? ` (${infoPago.placa})` : ""} por <strong>${fmt(yaPagado.valor)}</strong>
                      {yaPagado.estado === "Pendiente" ? ", pendiente de confirmar" : ""}.
                      {" "}Si es la misma plata, esta partida sobra y se puede eliminar.
                      {" "}No se está cobrando dos veces —esto no suma en la caja— pero mientras siga aquí figura como dinero sin dueño y sigue alertando.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Conciliación de cobros en campo por funcionario */}
      {seccionConciliacionCampo && (
        <div style={{ marginBottom: 20 }}>
          {seccionConciliacionCampo}
        </div>
      )}

      {/* Pendientes */}
      {resumen.pendientes.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {seccionPendientes}
        </div>
      )}

      {/* Two-column on desktop */}
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "var(--ok-soft)", borderRadius: 16, padding: "16px 20px" }}>{seccionEfectivo}</div>
          <div style={{ background: "var(--accent-soft2)", borderRadius: 16, padding: "16px 20px" }}>{seccionTransfer}</div>
          {resumenFooter}
          <div style={{ marginTop: 4 }}>{botonCerrar}</div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--ok-soft)", borderRadius: 16, padding: "16px 20px" }}>{seccionEfectivo}</div>
            <div style={{ background: "var(--accent-soft2)", borderRadius: 16, padding: "16px 20px" }}>{seccionTransfer}</div>
          </div>
          <div style={{ width: 300, flexShrink: 0, position: "sticky", top: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            {resumenFooter}
            {botonCerrar}
            {!puedeCerrarCaja && (
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--warn-soft)", fontSize: 12, color: "var(--warn-ink)", fontWeight: 600 }}>
                Solo la secretaria puede cerrar la caja.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal confirmación cierre — por grupo */}
      {showModal && grupoACerrar && (() => {
        const rc = resumenDeGrupo(grupoACerrar);
        // En efectivo NUNCA puede faltar (ni sobrar): se recibe en la mano y se confirma en el
        // acto. Cualquier diferencia bloquea el cierre — hay que hallar el error antes.
        // El extracto del banco trae también la plata sin dueño de ese día: sin sumarla, el
        // arqueo la reportaría como sobrante aunque ya esté anotada en la bolsa.
        const niGrupoModal = sinIdentificarDelDia(pendientesNI, fecha, grupoACerrar);
        // Las bases de ese grupo tambien estan en la gaveta: sin sumarlas el arqueo las
        // reportaria como sobrante y el efectivo nunca cuadraria.
        const basesGrupoModal = basesDelDia(abonosBase, fecha, grupoACerrar);
        const arqModal = calcArqueo(rc.efectivo, rc.transfer, niGrupoModal, basesGrupoModal);
        const efectivoDescuadrado = arqModal.difEf !== null && arqModal.difEf !== 0;
        // Este día ya se había cerrado: no es un cierre nuevo, es corregir la cifra firmada.
        const previoModal = cajaDia(fecha, grupoACerrar);
        const difModal = cierreDesactualizado(previoModal, rc);
        return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--card)", borderRadius: 20, padding: 28, maxWidth: 420, width: "100%" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: COLOR_GRUPO[grupoACerrar] }}>
              {previoModal ? `Actualizar cierre de ${grupoACerrar}` : `Cerrar caja de ${grupoACerrar}`}
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--muted)" }}>{fechaDisplay}</p>
            {previoModal && (
              <div style={{ marginBottom: 16, padding: "11px 13px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", fontSize: 12.5, color: "var(--warn-ink)", fontWeight: 600, lineHeight: 1.5 }}>
                Este día ya se había cerrado en <strong>${fmt(previoModal.total)}</strong>.
                {difModal
                  ? <> Ahora son <strong>${fmt(rc.total)}</strong>: al confirmar, esa pasa a ser la cifra del día y queda anotado el cambio.</>
                  : <> Las cifras no cambiaron; puedes volver a guardarlo si solo quieres corregir el arqueo.</>}
                {(previoModal.efectivo_contado != null || previoModal.banco_reportado != null) && (
                  <> Los valores del arqueo vienen del cierre anterior — revísalos antes de confirmar.</>
                )}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, background: "var(--ok-soft)", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ok-ink)", textTransform: "uppercase" }}>Efectivo</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ok-ink)" }}>${fmt(rc.efectivo)}</div>
              </div>
              <div style={{ flex: 1, background: "var(--accent-soft3)", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-ink)", textTransform: "uppercase" }}>Transferencias</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent-ink)" }}>${fmt(rc.transfer)}</div>
              </div>
            </div>
            <div style={{ background: COLOR_GRUPO[grupoACerrar], borderRadius: 12, padding: "12px 14px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>{previoModal ? "Nuevo total del día" : "Total a cerrar"} — {grupoACerrar}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#ffffff" }}>${fmt(rc.total)}</div>
            </div>
            {rc.pendientes.length > 0 && (
              <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: "var(--warn-soft2)", border: "1px solid var(--warn-line)", fontSize: 12, color: "var(--warn-ink)", fontWeight: 600 }}>
                Ojo: {grupoACerrar} tiene {rc.pendientes.length} pago(s) pendiente(s) sin confirmar (${fmt(rc.totalPendiente)}) que no entran en este cierre.
              </div>
            )}
            {/* Arqueo: comparar lo registrado contra la plata real. Antes el cierre solo
                sumaba lo que ya estaba en el sistema, así que un sobrante era invisible. */}
            <div style={{ marginBottom: 14, padding: "12px 14px", borderRadius: 12, background: "var(--soft2)", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", marginBottom: 10 }}>
                Arqueo — compara con la plata real (opcional)
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>Efectivo contado</label>
                  <input inputMode="numeric" value={efectivoContado} onChange={e => setEfectivoContado(e.target.value.replace(/\D/g, ""))}
                    placeholder={String(Math.round(rc.efectivo))}
                    style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>Según el banco</label>
                  <input inputMode="numeric" value={bancoReportado} onChange={e => setBancoReportado(e.target.value.replace(/\D/g, ""))}
                    placeholder={String(Math.round(rc.transfer + niGrupoModal))}
                    style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13 }} />
                </div>
              </div>
              {/* La cuenta del banco es una sola para todos los grupos: si aquí se escribe el
                  total del extracto, el mismo dinero se compararía otra vez en cada grupo. */}
              <div style={{ fontSize: 11, color: "var(--faint)", marginTop: -4, lineHeight: 1.45 }}>
                Del banco, anota <strong>solo las transferencias de {grupoACerrar}</strong> — no el total del extracto del día.
                {niGrupoModal > 0 && (
                  <> Incluye los <strong>${fmt(niGrupoModal)}</strong> que entraron sin dueño: el sistema ya los tiene en cuenta y no te los va a marcar como sobrante.</>
                )}
              </div>
              {(() => {
                const a = calcArqueo(rc.efectivo, rc.transfer, niGrupoModal, basesGrupoModal);
                if (!a.verificado) return null;
                const faltaEfectivo = a.difEf !== null && a.difEf < 0;
                const cuadraTodo = a.completo && a.difEf === 0 && a.difBc === 0;
                return (
                  <div style={{
                    fontSize: 12, borderRadius: 8, padding: "8px 10px", fontWeight: 600, display: "grid", gap: 4,
                    background: cuadraTodo ? "var(--ok-soft)" : faltaEfectivo ? "var(--bad-soft)" : "var(--warn-soft)",
                    color: cuadraTodo ? "var(--ok-ink)" : faltaEfectivo ? "var(--bad-ink)" : "var(--warn-ink)",
                  }}>
                    {cuadraTodo && <div>✓ Cuadra exacto: el efectivo y el banco, cada uno por su lado.</div>}
                    {a.difEf !== null && a.difEf !== 0 && (
                      <div>
                        ⛔ <strong>Efectivo: {a.difEf > 0 ? `sobran $${fmt(a.difEf)}` : `faltan $${fmt(Math.abs(a.difEf))}`}</strong>
                        {a.difEf < 0
                          ? " — hay pagos registrados que no están en la plata real."
                          : " — hay plata en la caja que no está registrada como pago."}
                        {" "}El efectivo se recibe en la mano: tiene que cuadrar exacto. <strong>No se puede cerrar</strong> hasta hallar la diferencia.
                      </div>
                    )}
                    {a.difBc !== null && a.difBc !== 0 && (
                      <div>
                        <strong>Banco:</strong> {a.difBc > 0 ? `sobran $${fmt(a.difBc)}` : `faltan $${fmt(Math.abs(a.difBc))}`}
                        {a.difBc > 0 && " — plata que nadie reportó: regístrala abajo en “Dinero sin identificar” con su referencia."}
                      </div>
                    )}
                    {!a.completo && (
                      <div>⚠️ <strong>{a.hayEf ? "El banco" : "El efectivo"} no se verificó</strong> — este cierre no confirma esa plata.</div>
                    )}
                  </div>
                );
              })()}
            </div>

            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Notas del cierre (opcional)..."
              rows={2}
              style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13, resize: "vertical", marginBottom: 14 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)", color: "var(--muted2)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Cancelar
              </button>
              {/* El efectivo se recibe en la mano y se confirma en el acto: si no cuadra, no es
                  una nota al pie, es una alarma. La caja no se cierra hasta encontrar el error
                  (o el dinero). El banco sí deja cerrar: un sobrante ahí es plata por identificar. */}
              <button onClick={handleCerrarCaja} disabled={cerrando || efectivoDescuadrado}
                title={efectivoDescuadrado ? "El efectivo contado no cuadra con lo registrado" : undefined}
                style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "var(--ok-ink)", color: "var(--card)", fontWeight: 700, fontSize: 13, cursor: (cerrando || efectivoDescuadrado) ? "not-allowed" : "pointer", opacity: (cerrando || efectivoDescuadrado) ? 0.5 : 1 }}>
                {cerrando ? "Guardando..." : efectivoDescuadrado ? "El efectivo no cuadra" : previoModal ? "Actualizar cierre" : "Confirmar cierre"}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Alta de una transferencia que entró al banco y nadie reclamó */}
      {/* Visor del extracto guardado (clic en la miniatura de una partida) */}
      {fotoAmpliadaNI && (
        <div onClick={() => setFotoAmpliadaNI(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.85)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "zoom-out" }}>
          <ImgPrivada src={fotoAmpliadaNI} style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12 }} />
        </div>
      )}

      {openNI && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setOpenNI(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--card)", borderRadius: 20, padding: 24, maxWidth: 420, width: "100%", boxSizing: "border-box" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: "var(--text)" }}>Transferencia sin identificar</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "var(--muted)" }}>
              Plata que aparece en el banco y ningún cliente ha reportado. Al guardarla con su referencia, cuando el dueño aparezca el sistema la reconoce sola.
            </p>
            <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>¿Qué día entró al banco?</label>
                <input type="date" value={formNI.fecha_banco} max={hoyISO()}
                  onChange={e => setFormNI(f => ({ ...f, fecha_banco: e.target.value }))}
                  style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>Monto</label>
                <input inputMode="numeric" value={formNI.monto} placeholder="$ 0"
                  onChange={e => setFormNI(f => ({ ...f, monto: e.target.value.replace(/\D/g, "") }))}
                  style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>N° de referencia</label>
                <input value={formNI.referencia} placeholder="El número de la transacción en el extracto"
                  onChange={e => setFormNI(f => ({ ...f, referencia: e.target.value }))}
                  style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>Foto del extracto del banco *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "var(--accent)", color: "var(--card)", fontWeight: 700, fontSize: 13 }}>
                    📷 Cámara
                    <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                      onChange={e => setComprobanteNI(e.target.files?.[0] ?? null)} />
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 13 }}>
                    🖼 Galería
                    <input type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => setComprobanteNI(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
                {comprobanteNI && <div style={{ fontSize: 12, color: "var(--ok-ink)", marginTop: 4 }}>✓ {comprobanteNI.name}</div>}
                <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 4 }}>
                  Es la prueba de que ese dinero entró. Cuando aparezca el dueño —quizá meses después— la referencia sola no basta.
                </div>
              </div>
              {/* El hecho que se lee del extracto es la CUENTA. El grupo es una deducción y el
                  sistema la hace solo cuando esa cuenta pertenece a un único portafolio. */}
              <div>
                <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>¿A cuál cuenta entró?</label>
                <select value={formNI.cuenta_id}
                  onChange={e => setFormNI(f => ({ ...f, cuenta_id: e.target.value }))}
                  style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13, background: "var(--card)", color: "var(--text)" }}>
                  <option value="">No sé / no aparece en la lista</option>
                  {cuentasActivas.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.banco}{c.tipo ? ` ${c.tipo}` : ""} · {c.numero} — {c.grupos.join(" · ")}
                    </option>
                  ))}
                </select>
                {(() => {
                  const cta = cuentasActivas.find(c => c.id === formNI.cuenta_id);
                  const g = grupoDeCuenta(cta);
                  if (!cta) {
                    return cuentasActivas.length === 0 ? (
                      <div style={{ fontSize: 11, color: "var(--warn-ink)", marginTop: 4 }}>
                        Todavía no hay cuentas registradas — se agregan en Configuración → Cuentas bancarias.
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 4 }}>
                        Si no lo marcas, la partida queda sin grupo hasta que aparezca el dueño.
                      </div>
                    );
                  }
                  return g ? (
                    <div style={{ fontSize: 11.5, color: "var(--ok-ink)", marginTop: 4, fontWeight: 600 }}>
                      Esa cuenta es solo de <strong>{g}</strong>: la partida queda marcada de ese grupo.
                    </div>
                  ) : (
                    <div style={{ fontSize: 11.5, color: "var(--warn-ink)", marginTop: 4, fontWeight: 600, lineHeight: 1.45 }}>
                      Esa cuenta la comparten {cta.grupos.join(" y ")}: no se puede saber de cuál es
                      esta plata hasta que el cliente la reclame. Queda sin grupo, que es la verdad.
                    </div>
                  );
                })()}
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>Nota (opcional)</label>
                <input value={formNI.nota} placeholder="Ej. dice “JOSE P.” en el extracto"
                  onChange={e => setFormNI(f => ({ ...f, nota: e.target.value }))}
                  style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13 }} />
              </div>
            </div>
            {errorNI && <div style={{ marginBottom: 12, fontSize: 12.5, color: "var(--bad-ink)", background: "var(--bad-soft)", borderRadius: 8, padding: "8px 10px" }}>{errorNI}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setOpenNI(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)", color: "var(--muted2)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Cancelar
              </button>
              <button
                disabled={guardandoNI}
                onClick={async () => {
                  if (guardandoNI) return;
                  const monto = Number(formNI.monto);
                  if (!formNI.fecha_banco) { setErrorNI("Indica qué día entró al banco."); return; }
                  // El `max` del input no bloquea una fecha escrita a mano.
                  if (formNI.fecha_banco > hoyISO()) { setErrorNI("La fecha no puede ser futura — revisa el año en el extracto."); return; }
                  if (!monto || monto <= 0) { setErrorNI("Escribe el monto."); return; }
                  if (!formNI.referencia.trim()) { setErrorNI("Escribe el número de referencia — es lo que permite cruzarla después."); return; }
                  if (!comprobanteNI) { setErrorNI("Sube la foto del extracto donde aparece esta transferencia."); return; }
                  setGuardandoNI(true); setErrorNI(null);
                  try {
                    // Se guarda bajo la referencia normalizada: así la carpeta es rastreable
                    // cuando aparezca el dueño (no hay contrato al que colgarla todavía).
                    const { url, error: upErr } = await subirComprobante(
                      comprobanteNI, `sin-identificar/${normalizarRef(formNI.referencia)}`,
                    );
                    if (upErr) { setErrorNI("Error subiendo la foto: " + upErr); return; }
                    // El grupo sale de la CUENTA, no del filtro que la pantalla tenga puesto:
                    // antes una plata de PRADERA quedaba marcada COSTA solo porque la secretaria
                    // estaba mirando COSTA. Si la cuenta es compartida, queda null a propósito.
                    const cuentaSel = cuentasActivas.find(c => c.id === formNI.cuenta_id) ?? null;
                    const { error } = await registrarNI({
                      fecha_banco: formNI.fecha_banco, monto, referencia: formNI.referencia,
                      grupo: grupoDeCuenta(cuentaSel),
                      cuenta_id: cuentaSel?.id ?? null,
                      nota: formNI.nota.trim() || undefined,
                      registrado_por: profile?.id ?? null,
                      comprobante_url: url,
                    });
                    if (error) { setErrorNI(error); return; }
                    setOpenNI(false);
                    setComprobanteNI(null);
                  } finally { setGuardandoNI(false); }
                }}
                style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: "var(--warn-ink)", color: "var(--card)", fontWeight: 700, fontSize: 13, cursor: guardandoNI ? "not-allowed" : "pointer", opacity: guardandoNI ? 0.6 : 1 }}>
                {guardandoNI ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
