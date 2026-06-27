import { useMemo } from "react";
import type { Profile } from "../contexts/AuthContext";
import type { Moto } from "./useMotos";
import type { Contrato } from "./useContratos";
import type { Visita } from "./useVisitas";

// Tipos mínimos para filtrar sin acoplar a la forma completa de cada hook
type ConClienteId = { id?: string; cliente_id?: string };
type ConContratoId = { contrato_id?: string | null };

export type SubadminScope = {
  esSubadmin: boolean;
  misMotoIds: Set<string>;
  misContratoIds: Set<string>;
  clienteIdsPermitidos: Set<string> | null; // null = sin restricción
  filtrarMotos: (motos: Moto[]) => Moto[];
  filtrarContratos: (contratos: Contrato[]) => Contrato[];
  filtrarVisitas: (visitas: Visita[]) => Visita[];
  // Filtros genéricos por id de cliente / id de contrato (sirven para clientes, pagos, deudas, etc.)
  filtrarPorCliente: <T extends ConClienteId>(lista: T[]) => T[];
  filtrarPorContrato: <T extends ConContratoId>(lista: T[]) => T[];
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

  const misContratoIds = useMemo(() => {
    if (!esSubadmin) return new Set<string>();
    return new Set(contratos.filter(c => c.moto_id != null && misMotoIds.has(c.moto_id)).map(c => c.id));
  }, [esSubadmin, contratos, misMotoIds]);

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

  function filtrarPorCliente<T extends ConClienteId>(lista: T[]): T[] {
    if (!esSubadmin || !clienteIdsPermitidos) return lista;
    return lista.filter(x => {
      const cid = x.cliente_id ?? x.id;
      return cid != null && clienteIdsPermitidos.has(cid);
    });
  }

  function filtrarPorContrato<T extends ConContratoId>(lista: T[]): T[] {
    if (!esSubadmin) return lista;
    return lista.filter(x => x.contrato_id != null && misContratoIds.has(x.contrato_id));
  }

  return {
    esSubadmin, misMotoIds, misContratoIds, clienteIdsPermitidos,
    filtrarMotos, filtrarContratos, filtrarVisitas, filtrarPorCliente, filtrarPorContrato,
  };
}
