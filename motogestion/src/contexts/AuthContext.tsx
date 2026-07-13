import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { calcularPuede, type AccionesUsuario } from "../lib/acciones";

export type Role = "ADMIN" | "ADMIN_PRINCIPAL" | "SECRETARIA" | "MECANICO" | "SUBADMIN" | "SOCIO";
export type GrupoSocio = "COSTA" | "PRADERA" | "RASTREADOR" | "USADAS";

export type Profile = {
  id: string;
  nombre: string;
  role: Role;
  grupo: GrupoSocio | null;
  permisos: string[] | null;
  // Overrides de acciones por persona ({ registrar_efectivo: "bloquear", ... }).
  // Ausente = usar el default del rol. Ver src/lib/acciones.ts.
  acciones: AccionesUsuario | null;
};

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  // ¿El usuario actual puede hacer esta acción sensible? (rol como techo + override por persona)
  puede: (accion: string) => boolean;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    // select("*") para tolerar que la columna `acciones` aún no exista (migración 048):
    // si falta, queda undefined → puede() usa el default del rol (comportamiento actual).
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data as Profile | null);
  }

  function puede(accion: string): boolean {
    if (!profile) return false;
    return calcularPuede(profile.role, profile.acciones, accion);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? traducirError(error.message) : null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signOut, puede }}>
      {children}
    </AuthContext.Provider>
  );
}

function traducirError(message: string) {
  if (message.includes("Invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (message.includes("User already registered")) return "Ya existe una cuenta con ese correo.";
  if (message.includes("Password should be at least")) return "La contraseña debe tener al menos 6 caracteres.";
  return message;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
