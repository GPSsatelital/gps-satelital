import { useEffect } from "react";
import { textoDelEnvio } from "../utils/mensajeria";
import type { ResultadoEnvio } from "../utils/mensajeria";

// EL AVISO DE "CÓMO LE FUE AL MENSAJE" (11-sep-2026).
//
// Antes era el cuadro gris del navegador (`alert`), igualito para todo: para "enviado", para
// "quedó en cola" y para "no se pudo". Palabras del dueño: *"se ven solo como un texto y a los
// funcionarios les da pereza leer"*. Y tenía razón — un aviso que hay que leer para saber si algo
// salió bien es un aviso que nadie lee, y el día que falle un envío nadie se entera.
//
// Ahora el COLOR dice el resultado antes de leer:
//   verde   = salió.
//   amarillo = está esperando turno (cola de aprobación, o se abrió WhatsApp y falta darle enviar).
//   rojo    = no salió y hay que hacer algo.
//
// 🔴 EL VERDE Y EL AMARILLO SE VAN SOLOS; EL ROJO SE QUEDA hasta que lo cierren. Si el error se
// desvaneciera igual que el éxito, el funcionario seguiría de largo creyendo que el cliente ya
// tiene su mensaje. Un fallo tiene que estorbar.

const TONOS = {
  ok:     { fondo: "var(--ok-soft)",   linea: "var(--ok-line)",   tinta: "var(--ok-ink)",   icono: "✓" },
  espera: { fondo: "var(--warn-soft)", linea: "var(--warn-line)", tinta: "var(--warn-ink)", icono: "⏳" },
  mal:    { fondo: "var(--bad-soft)",  linea: "var(--bad-line)",  tinta: "var(--bad-ink)",  icono: "!" },
} as const;

export type AvisoDeEnvio = { nombre: string; r: ResultadoEnvio };

export default function AvisoEnvio({ aviso, onCerrar, isMobile }: {
  aviso: AvisoDeEnvio | null;
  onCerrar: () => void;
  isMobile: boolean;
}) {
  const datos = aviso ? textoDelEnvio(aviso.nombre, aviso.r) : null;
  const seVaSolo = datos ? datos.tono !== "mal" : false;

  useEffect(() => {
    if (!aviso || !seVaSolo) return;
    const t = setTimeout(onCerrar, 5000);
    return () => clearTimeout(t);
  }, [aviso, seVaSolo, onCerrar]);

  if (!aviso || !datos) return null;
  const t = TONOS[datos.tono];

  return (
    <div
      role={datos.tono === "mal" ? "alert" : "status"}
      onClick={onCerrar}
      style={{
        position: "fixed", left: 12, right: 12, bottom: isMobile ? 88 : 24, zIndex: 300,
        margin: "0 auto", maxWidth: 460, cursor: "pointer", textAlign: "left",
        background: t.fondo, border: `1px solid ${t.linea}`, color: t.tinta,
        borderRadius: 14, padding: "13px 15px",
        boxShadow: "0 6px 24px rgba(0,0,0,.25)",
        display: "flex", gap: 12, alignItems: "flex-start",
      }}>
      <span aria-hidden="true" style={{
        flexShrink: 0, width: 24, height: 24, borderRadius: "50%",
        background: t.tinta, color: t.fondo,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 700, lineHeight: 1,
      }}>{t.icono}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700 }}>{datos.titulo}</span>
        <span style={{ display: "block", fontSize: 12.5, marginTop: 2, lineHeight: 1.45, textTransform: "none" }}>
          {datos.detalle}
        </span>
        {datos.tono === "mal" && (
          <span style={{ display: "block", fontSize: 11.5, marginTop: 6, opacity: .8 }}>
            Toca para cerrar.
          </span>
        )}
      </span>
    </div>
  );
}
