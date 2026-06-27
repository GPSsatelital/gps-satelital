import { useMemo } from "react";
import type { Profile } from "../contexts/AuthContext";
import type { Moto } from "./useMotos";
import type { Contrato } from "./useContratos";
import type { Visita } from "./useVisitas";

export type SubadminScope = {
  esSubadmin: boolean;
  misMotoIds: Set<string>;
  filtrarMotos: (motos: Moto[]) => Moto[];
  filtrarContratos: (contratos: Contrato[]) => Contrato[];
  filtrarVisitas: (visitas: Visita[]) => Visita[];
  clienteIdsPermitidos: Set<string> | null; // null = sin restricción
};

export function useSubadminScope(
  profile: Profile | null,
  motos: Moto[],
  contratos: Contrato[],
): SubadminScope {
  const esSubadmin = profile?.role === "SUBADMIN";

  const misMotoIds = useMemo(() => {
    if (!esSubadmin || !profile) return new Set<string>();
    return new Set(motos.filter(m => m.subadmin_id === profile.id).map(m => m.id));
  }, [esSubadmin, profile, motos]);

  const clienteIdsPermitidos = useMemo(() => {
    if (!esSubadmin) return null;
    const ids = new Set<string>();
    contratos.forEach(c => {
      if (c.moto_id && misMotoIds.has(c.moto_id) && c.cliente_id) ids.add(c.cliente_id);
    });
    return ids;
  }, [esSubadmin, contratos, misMotoIds]);

  function filtrarMotos(lista: Moto[]): Moto[] {
    if (!esSubadmin) return lista;
    return lista.filter(m => misMotoIds.has(m.id));
  }

  function filtrarContratos(lista: Contrato[]): Contrato[] {
    if (!esSubadmin) return lista;
    return lista.filter(c => c.moto_id != null && misMotoIds.has(c.moto_id));
  }

  function filtrarVisitas(lista: Visita[]): Visita[] {
    if (!esSubadmin || !profile) return lista;
    return lista.filter(v => v.asignada_a === profile.id);
  }

  return { esSubadmin, misMotoIds, filtrarMotos, filtrarContratos, filtrarVisitas, clienteIdsPermitidos };
}
