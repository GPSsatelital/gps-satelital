// Las tres listas de SOLO MIRAR del auxiliar administrativo (D-095, mig 226): motos, contratos y
// taller. Salen de funciones de la base que devuelven únicamente las columnas aprobadas en el dibujo
// del 24-nov (sin plata, sin totales): el auxiliar no puede leer las tablas. Tocar una fila no abre
// nada, a propósito; lo que haga se le habilitará moto por moto cuando un supervisor lo pida.
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { ListBox, ItemLista } from "../components/ListaEstandar";
import { Badge } from "../components/atomos";
import { inputStyle } from "../styles/shared";
import { fmtFechaCorta, hoyISO } from "../utils/fecha";
import { diasEnTaller } from "../utils/taller";

export type ListaAuxiliar = "motos" | "contratos" | "taller";

type MotoAux = { placa: string; marca: string | null; modelo: string | null; color: string | null; grupo: string | null; estado: string | null };
type ContratoAux = { placa: string | null; cliente: string; inicio: string | null; fin: string | null };
type TallerAux = { placa: string; grupo: string | null; estado_tecnico: string | null; fecha_ingreso: string | null; por_liquidacion: boolean };

const FUNCION: Record<ListaAuxiliar, string> = { motos: "aux_motos", contratos: "aux_contratos", taller: "aux_taller" };
const BUSCAR: Record<ListaAuxiliar, string> = {
  motos: "Buscar placa, marca o modelo",
  contratos: "Buscar placa o cliente",
  taller: "Buscar placa",
};
const VACIA: Record<ListaAuxiliar, string> = {
  motos: "No hay motos para mostrar.",
  contratos: "No hay contratos activos ni suspendidos.",
  taller: "No hay motos en el taller.",
};

function useIsMobile() {
  const [v, setV] = useState(window.innerWidth < 900);
  useEffect(() => {
    const h = () => setV(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return v;
}

// Sin tildes, sin mayúsculas y sin espacios: «rlz 95h» encuentra la RLZ95H.
function normal(s: string | null | undefined): string {
  return (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "");
}

export default function AuxiliarListasView({ que }: { que: ListaAuxiliar }) {
  const isMobile = useIsMobile();
  const [filas, setFilas] = useState<unknown[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buscar, setBuscar] = useState("");

  useEffect(() => {
    let vivo = true;
    setCargando(true); setError(null); setBuscar("");
    supabase.rpc(FUNCION[que]).then(({ data, error }) => {
      if (!vivo) return;
      if (error) setError(error.message);
      setFilas((data ?? []) as unknown[]);
      setCargando(false);
    });
    return () => { vivo = false; };
  }, [que]);

  const q = normal(buscar);
  const hoy = hoyISO();

  const items = useMemo(() => {
    if (que === "motos") {
      return (filas as MotoAux[])
        .filter(m => !q || normal(m.placa).includes(q) || normal(`${m.marca ?? ""}${m.modelo ?? ""}`).includes(q))
        .map(m => (
          <ItemLista
            key={m.placa}
            placa={m.placa}
            grupo={m.grupo}
            titulo={[m.marca, m.modelo].filter(Boolean).join(" ") || "—"}
            subtitulo={[m.color, m.estado].filter(Boolean).join(" · ")}
          />
        ));
    }
    if (que === "contratos") {
      return (filas as ContratoAux[])
        .filter(c => !q || normal(c.placa).includes(q) || normal(c.cliente).includes(q))
        .map((c, i) => (
          <ItemLista
            key={`${c.placa ?? "sin-moto"}-${i}`}
            placa={c.placa ?? undefined}
            titulo={c.cliente}
            subtitulo={`Inicio ${fmtFechaCorta(c.inicio)} · Fin ${fmtFechaCorta(c.fin)}`}
          />
        ));
    }
    return (filas as TallerAux[])
      .filter(t => !q || normal(t.placa).includes(q))
      .map((t, i) => {
        const dias = diasEnTaller(t.fecha_ingreso, null, hoy);
        return (
          <ItemLista
            key={`${t.placa}-${i}`}
            placa={t.placa}
            grupo={t.grupo}
            titulo={t.estado_tecnico ?? "—"}
            subtitulo={t.fecha_ingreso ? `Entró hace ${dias} día${dias !== 1 ? "s" : ""}` : "Sin fecha de entrada"}
            right={t.por_liquidacion ? <Badge tone="bad">Por liquidación</Badge> : undefined}
          />
        );
      });
  }, [filas, que, q, hoy]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <input
        type="search"
        value={buscar}
        onChange={e => setBuscar(e.target.value)}
        placeholder={BUSCAR[que]}
        style={{ ...inputStyle, boxSizing: "border-box", width: "100%" }}
      />
      <ListBox isMobile={isMobile}>
        {cargando ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Cargando…</div>
        ) : error ? (
          <div style={{ padding: 16, color: "var(--bad-ink)", fontSize: 13 }}>No se pudo cargar la lista: {error}</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            {q ? "Nada coincide con lo que buscas." : VACIA[que]}
          </div>
        ) : items}
      </ListBox>
      <div style={{ fontSize: 12, color: "var(--muted)" }}>
        👁 Solo para ver{que === "contratos" ? " · sin plata" : ""}
      </div>
    </div>
  );
}
