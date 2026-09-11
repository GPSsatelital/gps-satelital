import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// LOS DATOS SUELTOS DE CONFIGURACIÓN (mig 148) — clave y valor, nada más.
//
// Nace con el número de WhatsApp de ZALA y el saludo que se le manda. El dueño lo dijo así:
// *"el número ahorita es…"* — o sea que va a cambiar. Un número de teléfono quemado en el código
// es un despliegue cada vez que cambie, y el día que nadie esté disponible para desplegarlo, los
// avisos se van a un número que ya no es de nadie.
//
// Lo lee cualquiera con sesión (la app necesita el número para armar el enlace); lo cambian solo
// ADMIN y ADMIN_PRINCIPAL, y eso lo hace cumplir la RLS, no la pantalla.

export type Ajuste = { clave: string; valor: string; descripcion: string | null };

export function useAjustes() {
  const [ajustes, setAjustes] = useState<Ajuste[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    const { data } = await supabase.from("ajustes").select("clave, valor, descripcion");
    setAjustes((data ?? []) as Ajuste[]);
    setLoading(false);
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  /** El valor de un ajuste, o el de respaldo si todavía no está en la base. */
  function valor(clave: string, siNoEsta = ""): string {
    return ajustes.find(a => a.clave === clave)?.valor ?? siNoEsta;
  }

  async function guardar(clave: string, nuevo: string) {
    const { error } = await supabase.from("ajustes")
      .update({ valor: nuevo, updated_at: new Date().toISOString() })
      .eq("clave", clave);
    if (!error) await cargar();
    return { error: error?.message ?? null };
  }

  return { ajustes, loading, valor, guardar, recargar: cargar };
}

/**
 * El enlace que abre WhatsApp con el mensaje ya escrito para ZALA.
 *
 * Devuelve null si no hay número guardado: mejor que el botón no aparezca a que abra WhatsApp
 * sin destinatario y la persona crea que ya escribió.
 */
export function enlaceZala(numero: string, saludo: string, nombre: string): string | null {
  const limpio = numero.replace(/\D/g, "");
  if (limpio.length < 10) return null;
  const texto = saludo.replace(/\{nombre\}/g, nombre);
  return `https://wa.me/${limpio}?text=${encodeURIComponent(texto)}`;
}
