// Pantalla del VISITADOR: las visitas domiciliarias que le asignaron, y nada más.
//
// POR QUÉ ES UNA PANTALLA APARTE Y NO EL MÓDULO CLIENTES: el módulo Clientes muestra la ficha
// completa (cédula, los 6 documentos escaneados con enlace abrible, huella, firma, foto del rostro,
// lista negra, ingreso inicial) y no hay control por campo en ninguna capa — createTableStore hace
// select("*"), así que la fila entera llega al navegador aunque la pantalla no la pinte.
// Un visitador es un contratista por horas: solo debe ver a quién visitar y cómo llegar.
//
// El recorte NO vive acá: vive en la base. La función `mis_visitas_asignadas()` (mig 076) devuelve
// únicamente nombre, dirección y teléfono del titular más el contacto del acompañante, y el
// VISITADOR no tiene policy de lectura sobre `clientes`. Esta pantalla solo pinta lo que llega.
//
// Es trabajo de calle: se diseña para el celular a 375px.

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import ModalVisita from "../components/ModalVisita";
import { card, listaConScroll } from "../styles/shared";

type VisitaAsignada = {
  cliente_id: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  acompanante_nombre: string | null;
  acompanante_telefono: string | null;
  estado: string;
  visita_registrada: boolean;
};

export default function MisVisitasView() {
  const { profile } = useAuth();
  const [filas, setFilas] = useState<VisitaAsignada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitando, setVisitando] = useState<VisitaAsignada | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    const { data, error: err } = await supabase.rpc("mis_visitas_asignadas");
    if (err) setError(err.message);
    else { setError(null); setFilas((data ?? []) as VisitaAsignada[]); }
    setCargando(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const pendientes = filas.filter(f => !f.visita_registrada);
  const hechas = filas.filter(f => f.visita_registrada);

  const linkTel = (tel: string | null) => (tel ?? "").replace(/\D/g, "");

  function Tarjeta({ f }: { f: VisitaAsignada }) {
    const mapa = f.direccion ? `https://www.google.com/maps/search/${encodeURIComponent(f.direccion)}` : null;
    return (
      <div style={{ ...card, padding: "14px 16px", display: "grid", gap: 10, opacity: f.visita_registrada ? 0.65 : 1 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", textTransform: "uppercase" }}>{f.nombre}</div>
          {f.direccion && (
            <div style={{ fontSize: 13, color: "var(--muted2)", marginTop: 3 }}>📍 {f.direccion}</div>
          )}
        </div>

        {/* Los teléfonos van como enlaces `tel:` para marcar de una desde el celular. El del
            acompañante está acá a propósito: es a quién llamar si el titular no contesta. */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {f.telefono && (
            <a href={`tel:${linkTel(f.telefono)}`} style={chip("var(--ok-soft)", "var(--ok-ink)")}>
              📞 {f.telefono}
            </a>
          )}
          {f.whatsapp && f.whatsapp !== f.telefono && (
            <a href={`https://wa.me/57${linkTel(f.whatsapp)}`} target="_blank" rel="noreferrer" style={chip("var(--ok-soft)", "var(--ok-ink)")}>
              💬 WhatsApp
            </a>
          )}
          {mapa && (
            <a href={mapa} target="_blank" rel="noreferrer" style={chip("var(--accent-soft3)", "var(--accent-ink)")}>
              🗺️ Cómo llegar
            </a>
          )}
        </div>

        {f.acompanante_nombre && (
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 8, fontSize: 13, color: "var(--muted2)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Si no contesta, llamar a
            </div>
            <div style={{ marginTop: 3, textTransform: "uppercase", fontWeight: 600, color: "var(--text)" }}>{f.acompanante_nombre}</div>
            {f.acompanante_telefono && (
              <a href={`tel:${linkTel(f.acompanante_telefono)}`} style={{ ...chip("var(--soft)", "var(--muted2)"), marginTop: 5, display: "inline-block" }}>
                📞 {f.acompanante_telefono}
              </a>
            )}
          </div>
        )}

        {f.visita_registrada ? (
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ok-ink)" }}>✅ Visita registrada</div>
        ) : (
          <button
            onClick={() => setVisitando(f)}
            style={{ background: "var(--accent)", color: "var(--on-ink)", border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%" }}
          >
            🏠 Registrar visita
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Mis Visitas</h2>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          {cargando ? "Cargando..." : `${pendientes.length} por hacer · ${hechas.length} registrada${hechas.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      {error && (
        <div style={{ ...card, padding: "12px 16px", background: "var(--bad-soft)", border: "1px solid var(--bad-line)", color: "var(--bad-ink)", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
          No se pudieron cargar tus visitas: {error}
        </div>
      )}

      {!cargando && filas.length === 0 && !error && (
        <div style={{ ...card, textAlign: "center", padding: 48, color: "var(--muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
          <div style={{ fontWeight: 700, color: "var(--text)" }}>No tienes visitas asignadas</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Cuando el administrador te asigne una, aparece acá.</div>
        </div>
      )}

      {pendientes.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Por hacer</div>
          <div style={{ ...listaConScroll(isMobile), marginBottom: 18 }}>
            {pendientes.map(f => <Tarjeta key={f.cliente_id} f={f} />)}
          </div>
        </>
      )}

      {hechas.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Ya registradas</div>
          <div style={listaConScroll(isMobile)}>
            {hechas.map(f => <Tarjeta key={f.cliente_id} f={f} />)}
          </div>
        </>
      )}

      {visitando && (
        <ModalVisita
          clienteId={visitando.cliente_id}
          clienteNombre={visitando.nombre}
          // Se pasa explícito: el visitador no puede leer `clientes` para deducirlo.
          asignadaA={profile?.id ?? null}
          onClose={() => setVisitando(null)}
          onGuardada={() => { setVisitando(null); cargar(); }}
        />
      )}
    </div>
  );
}

function chip(bg: string, color: string): React.CSSProperties {
  return {
    background: bg, color, borderRadius: 999, padding: "6px 12px",
    fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap",
  };
}
