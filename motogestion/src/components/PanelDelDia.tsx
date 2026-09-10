import { useMemo } from "react";
import type { ViewKey } from "../App";
import { card, fmtMoney } from "../styles/shared";
import { useColaUbicacion } from "../hooks/useColaUbicacion";
import type { Pendiente } from "../hooks/usePendientes";

// EL DÍA DEL DUEÑO — fase 4 de docs/FLUJO-DIARIO.md.
//
// Sus palabras: los tres bloques EN ORDEN — la plata → lo que espera su decisión → lo que sale mal.
// Ese orden no es decorativo: es cómo él revisa el negocio, y por eso la pantalla se arma así y no
// como una lista de avisos revueltos (que es lo que era la campana, con 431 encima).
//
// 🔴 CADA CIFRA DICE QUÉ PREGUNTA RESPONDE (regla de las cifras de plata). Acá:
//   · "Vencido sin cobrar" = la cuota y el acuerdo VENCIDOS de los que están en mora. NO incluye
//     las deudas registradas ni las multas — esa sería otra cifra, con otro nombre.
//   · Solo se suman `recoleccion` y `mora`, que son excluyentes entre sí. Sumar también el plazo
//     y la promesa vencidos contaría dos veces al mismo cliente.

export default function PanelDelDia({
  pendientes, onNavegar,
}: {
  pendientes: Pendiente[];
  onNavegar?: (v: ViewKey) => void;
}) {
  // La fila de validaciones de ubicación no cabe en la lista de pendientes (solo salen 5 por
  // persona, mig 145). El total va acá para que la deuda de trabajo baje a la vista y no se
  // vuelva a olvidar por dos años, que es lo que llevaba la más vieja.
  const { total: porValidar } = useColaUbicacion();

  const d = useMemo(() => {
    const de = (...tipos: string[]) => pendientes.filter(p => tipos.includes(p.tipo));
    const plata = (ps: Pendiente[]) => ps.reduce((s, p) => s + (p.monto ?? 0), 0);

    const enMora = de("recoleccion", "mora");
    const porConfirmar = de("transferencia_pendiente");
    const sinIdentificar = de("dinero_sin_identificar");

    return {
      enMora, porConfirmar, sinIdentificar,
      moraPlata: plata(enMora),
      confirmarPlata: plata(porConfirmar),
      niPlata: plata(sinIdentificar),
      traspaso: de("traspaso_proximo").length,
      liquidar: de("convenio_incumplido_3").length,
      graduar: de("base_completada").length,
      cesion: de("cesion_pendiente").length,
      sinActivar: de("contrato_sin_activar").length,
      recoleccion: de("recoleccion").length,
      papelesVencidos: de("soat_vence", "tecno_vence").filter(p => (p.dias ?? 0) < 0).length,
      retenidas: de("moto_retenida").length,
      taller: de("taller_demorado").length,
    };
  }, [pendientes]);

  const decisiones = d.traspaso + d.liquidar + d.graduar + d.cesion + d.sinActivar;
  const alarmas = d.recoleccion + d.papelesVencidos + d.retenidas + d.taller + (porValidar > 0 ? 1 : 0);

  return (
    // textAlign explícito: `#root` hereda `text-align: center` de la plantilla de Vite.
    <div style={{ ...card, padding: 0, overflow: "hidden", marginBottom: 14, textAlign: "left" }}>
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>El día</div>
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2, lineHeight: 1.45 }}>
          La plata, lo que espera tu decisión, y lo que va mal.
        </div>
      </div>

      {/* 1 — LA PLATA */}
      <Bloque titulo="La plata">
        <Renglon
          etiqueta="Vencido sin cobrar"
          nota={`${d.enMora.length} ${d.enMora.length === 1 ? "cliente" : "clientes"} · cuota y acuerdo vencidos`}
          cifra={fmtMoney(d.moraPlata)}
          tono={d.enMora.length > 0 ? "bad" : "ok"}
          onClick={() => onNavegar?.("cobros")}
        />
        <Renglon
          etiqueta="Esperando que la secretaria confirme"
          nota={`${d.porConfirmar.length} ${d.porConfirmar.length === 1 ? "pago" : "pagos"} · entró pero no cuenta hasta que ella diga sí`}
          cifra={fmtMoney(d.confirmarPlata)}
          tono={d.porConfirmar.length > 0 ? "warn" : "ok"}
          onClick={() => onNavegar?.("cobros")}
        />
        <Renglon
          etiqueta="En el banco sin dueño"
          nota={`${d.sinIdentificar.length} ${d.sinIdentificar.length === 1 ? "consignación" : "consignaciones"} · nadie las ha reclamado`}
          cifra={fmtMoney(d.niPlata)}
          tono={d.sinIdentificar.length > 0 ? "warn" : "ok"}
          onClick={() => onNavegar?.("caja")}
        />
      </Bloque>

      {/* 2 — LO QUE ESPERA SU DECISIÓN */}
      <Bloque titulo={`Espera tu decisión${decisiones > 0 ? ` (${decisiones})` : ""}`}>
        {decisiones === 0 && <Vacio texto="Nada esperando por ahora." />}
        <Item n={d.liquidar} texto="para liquidar — tercer acuerdo incumplido" tono="bad" onClick={() => onNavegar?.("liquidaciones")} />
        <Item n={d.traspaso} texto="contratos que terminan en menos de 2 meses" tono="warn" onClick={() => onNavegar?.("contratos")} />
        <Item n={d.graduar} texto="terminaron de ahorrar la base — hay que graduarlos" tono="ok" onClick={() => onNavegar?.("contratos")} />
        <Item n={d.cesion} texto="entraron por cesión y la cesión no llega" tono="warn" onClick={() => onNavegar?.("clientes")} />
        <Item n={d.sinActivar} texto="contratos armados que nunca se activaron" tono="warn" onClick={() => onNavegar?.("contratos")} />
      </Bloque>

      {/* 3 — LO QUE VA MAL */}
      <Bloque titulo={`Lo que va mal${alarmas > 0 ? ` (${alarmas})` : ""}`} ultimo>
        {alarmas === 0 && <Vacio texto="Nada encendido." />}
        <Item n={d.recoleccion} texto="para recoger — se agotaron los plazos" tono="bad" onClick={() => onNavegar?.("cobros")} />
        <Item n={d.papelesVencidos} texto="motos rodando con SOAT o tecno VENCIDA" tono="bad" onClick={() => onNavegar?.("motos")} />
        <Item n={d.retenidas} texto="motos retenidas (fiscalía, tránsito, garantía)" tono="bad" onClick={() => onNavegar?.("inmovilizaciones")} />
        <Item n={d.taller} texto="motos paradas en el taller hace más de una semana" tono="warn" onClick={() => onNavegar?.("taller")} />
        <Item n={porValidar} texto="motos sin validar dónde duermen — van 5 por día a cada encargado" tono="warn" />
      </Bloque>
    </div>
  );
}

function Bloque({ titulo, children, ultimo }: { titulo: string; children: React.ReactNode; ultimo?: boolean }) {
  return (
    <div style={{ borderBottom: ultimo ? "none" : "1px solid var(--line)" }}>
      <div style={{
        padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: .4,
        textTransform: "uppercase", color: "var(--muted2)", background: "var(--soft2)",
      }}>
        {titulo}
      </div>
      {children}
    </div>
  );
}

function Vacio({ texto }: { texto: string }) {
  return <div style={{ padding: "12px", fontSize: 12.5, color: "var(--muted)" }}>{texto}</div>;
}

function Renglon({ etiqueta, nota, cifra, tono, onClick }: {
  etiqueta: string; nota: string; cifra: string; tono: "ok" | "warn" | "bad"; onClick?: () => void;
}) {
  const tinta = tono === "bad" ? "var(--bad-ink)" : tono === "warn" ? "var(--warn-ink)" : "var(--muted)";
  return (
    <button onClick={onClick} style={{
      display: "flex", width: "100%", gap: 10, alignItems: "center", textAlign: "left",
      padding: "10px 12px", background: "transparent", border: "none",
      borderBottom: "1px solid var(--line)", cursor: onClick ? "pointer" : "default",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{etiqueta}</div>
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2, lineHeight: 1.45 }}>{nota}</div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: tinta, whiteSpace: "nowrap" }}>{cifra}</div>
    </button>
  );
}

function Item({ n, texto, tono, onClick }: { n: number; texto: string; tono: "ok" | "warn" | "bad"; onClick?: () => void }) {
  if (n === 0) return null;
  const fondo = tono === "bad" ? "var(--bad-soft)" : tono === "warn" ? "var(--warn-soft)" : "var(--ok-soft)";
  const tinta = tono === "bad" ? "var(--bad-ink)" : tono === "warn" ? "var(--warn-ink)" : "var(--ok-ink)";
  return (
    <button onClick={onClick} style={{
      display: "flex", width: "100%", gap: 9, alignItems: "center", textAlign: "left",
      padding: "9px 12px", background: "transparent", border: "none",
      borderBottom: "1px solid var(--line)", cursor: onClick ? "pointer" : "default",
    }}>
      <span style={{
        fontSize: 12, fontWeight: 700, background: fondo, color: tinta,
        borderRadius: 8, padding: "3px 9px", minWidth: 30, textAlign: "center", flexShrink: 0,
      }}>{n}</span>
      <span style={{ fontSize: 12.5, color: "var(--text)", lineHeight: 1.4 }}>{texto}</span>
    </button>
  );
}
