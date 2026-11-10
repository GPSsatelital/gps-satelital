import { useId, useState, type CSSProperties } from "react";
import CanvasFirma from "./CanvasFirma";
import LectorHuella from "./LectorHuella";
import FotoPerfil from "./FotoPerfil";
import { inputStyle, labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";
import type { EstadoFirmaHuella } from "../hooks/useEfectivoFirmaHuella";

// El recuadro de las ventanas que reciben efectivo en la oficina (D-065): si al cliente le falta la
// firma, la huella o la foto, se le toman aquí mismo. Si no se puede (el lector no lee, no hay
// cámara), solo el dueño autoriza ese día. La ventana que lo usa apaga su botón de registrar
// mientras `fh.bloquea`.

const caja: CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  background: "var(--warn-soft2)",
  border: "1px solid var(--warn-line)",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  boxSizing: "border-box",
};

const avisoOk: CSSProperties = {
  marginTop: 12,
  padding: "8px 12px",
  borderRadius: 10,
  background: "var(--ok-soft)",
  border: "1px solid var(--ok-line)",
  color: "var(--ok-ink)",
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.5,
};

const avisoError: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  background: "var(--bad-soft)",
  border: "1px solid var(--bad-line)",
  color: "var(--bad-ink)",
  fontSize: 13,
  lineHeight: 1.5,
};

/** `estilo` ajusta el margen de afuera a la ventana que lo usa. */
export default function FirmaHuellaEfectivo({ fh, estilo }: { fh: EstadoFirmaHuella; estilo?: CSSProperties }) {
  const idMotivo = useId();
  const [firma, setFirma] = useState<string | null>(null);
  const [firmadaEn, setFirmadaEn] = useState<string | null>(null);
  const [huella, setHuella] = useState<string | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [autorizando, setAutorizando] = useState(false);
  const [errorAutorizar, setErrorAutorizar] = useState<string | null>(null);
  const [sinAutorizacion, setSinAutorizacion] = useState(false);

  const { falta } = fh;
  const listoParaGuardar = (!falta.firma || !!firma) && (!falta.huella || !!huella) && (!falta.foto || !!foto);
  const textoGuardar = `Guardar ${falta.texto ?? ""}`;
  const ejemploMotivo = falta.huella
    ? "Ej.: el lector no lee; vuelve el lunes a ponerla"
    : falta.foto
      ? "Ej.: aquí no hay cámara; el supervisor le toma la foto"
      : "Ej.: el cliente no pudo firmar hoy";

  async function handleGuardar() {
    if (guardando) return;
    setGuardando(true);
    setErrorGuardar(null);
    try {
      const error = await fh.guardar(firma, firmadaEn, huella, foto);
      if (error) setErrorGuardar(error);
      else setGuardadoOk(true);
    } finally {
      setGuardando(false);
    }
  }

  async function handleAutorizar() {
    if (autorizando) return;
    setAutorizando(true);
    setErrorAutorizar(null);
    try {
      const error = await fh.autorizarHoy(motivo);
      if (error) setErrorAutorizar(error);
    } finally {
      setAutorizando(false);
    }
  }

  async function handleRevisar() {
    if (fh.revisando) return;
    setSinAutorizacion(false);
    const { autorizado } = await fh.revisar();
    if (!autorizado) setSinAutorizacion(true);
  }

  if (!fh.bloquea) {
    if (guardadoOk && !falta.texto) {
      return <div role="status" style={{ ...avisoOk, ...estilo }}>Quedó guardado. Ya puede registrar el pago.</div>;
    }
    if (fh.autorizadoHoy && falta.texto) {
      return (
        <div role="status" style={{ ...avisoOk, ...estilo }}>
          El dueño autorizó recibirle efectivo hoy sin {falta.texto}. Mañana se le vuelve a pedir.
        </div>
      );
    }
    return null;
  }

  return (
    <div role="group" aria-label="Lo que le falta al cliente" style={{ ...caja, ...estilo }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--warn-ink)", lineHeight: 1.4 }}>
          A <span style={{ textTransform: "uppercase" }}>{fh.clienteNombre || "este cliente"}</span> le falta {falta.texto}
        </div>
        <div style={{ fontSize: 13, color: "var(--text)", marginTop: 4, lineHeight: 1.5 }}>
          Para recibirle efectivo en la oficina, tómele ahora lo que falta. Por transferencia sí se le puede recibir.
        </div>
      </div>

      {(falta.firma || falta.huella) && (
        <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
          De acuerdo con la Ley 1581 de 2012, el cliente autoriza a Club Moteros Cartagena a recolectar, almacenar y
          tratar sus datos personales con fines de identificación, gestión del contrato de arrendamiento y cobro de cartera.
        </div>
      )}

      {falta.firma && (
        <div style={{ minWidth: 0 }}>
          <CanvasFirma
            label="Firma del cliente"
            modal
            opcional={false}
            onChange={(dataUrl) => {
              setFirma(dataUrl);
              setFirmadaEn(dataUrl ? new Date().toISOString() : null);
            }}
          />
        </div>
      )}

      {falta.huella && (
        <div style={{ minWidth: 0 }}>
          <LectorHuella label="Huella del cliente (índice derecho)" onChange={setHuella} />
        </div>
      )}

      {falta.foto && (
        <div style={{ minWidth: 0 }}>
          <FotoPerfil label="Foto del cliente" opcional={false} onChange={setFoto} />
        </div>
      )}

      {errorGuardar && <div role="alert" style={avisoError}>{errorGuardar}</div>}

      <button
        type="button"
        onClick={handleGuardar}
        disabled={guardando || !listoParaGuardar}
        style={{
          ...primaryBtn,
          width: "100%",
          minHeight: 44,
          opacity: guardando || !listoParaGuardar ? 0.6 : 1,
          cursor: guardando || !listoParaGuardar ? "not-allowed" : "pointer",
        }}
      >
        {guardando ? "Guardando..." : textoGuardar}
      </button>

      <div style={{ borderTop: "1px dashed var(--warn-line)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {fh.esDueno ? (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
              Autorizar solo hoy, sin {falta.texto}
            </div>
            <div>
              <label htmlFor={idMotivo} style={{ ...labelStyle, display: "block" }}>
                ¿Por qué se le recibe sin {falta.cuantas > 1 ? "ellas" : "ella"}?
              </label>
              <input
                id={idMotivo}
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder={ejemploMotivo}
                style={inputStyle}
              />
            </div>
            {errorAutorizar && <div role="alert" style={avisoError}>{errorAutorizar}</div>}
            <button
              type="button"
              onClick={handleAutorizar}
              disabled={autorizando || motivo.trim().length < 5}
              style={{
                ...secondaryBtn,
                width: "100%",
                minHeight: 44,
                opacity: autorizando || motivo.trim().length < 5 ? 0.6 : 1,
                cursor: autorizando || motivo.trim().length < 5 ? "not-allowed" : "pointer",
              }}
            >
              {autorizando ? "Autorizando..." : "Autorizar solo hoy"}
            </button>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
              Queda guardado quién, cuándo y por qué. Mañana se le vuelven a pedir.
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
              Si no se le puede tomar ahora, llame al dueño: él autoriza el pago de hoy desde su celular.
            </div>
            <button
              type="button"
              onClick={handleRevisar}
              disabled={fh.revisando}
              style={{
                ...secondaryBtn,
                width: "100%",
                minHeight: 44,
                opacity: fh.revisando ? 0.6 : 1,
                cursor: fh.revisando ? "not-allowed" : "pointer",
              }}
            >
              {fh.revisando ? "Revisando..." : "Ya autorizó: revisar de nuevo"}
            </button>
            {sinAutorizacion && !fh.revisando && (
              <div role="status" style={{ fontSize: 12, color: "var(--warn-ink)", lineHeight: 1.5 }}>
                Todavía no aparece la autorización de hoy.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
