import { useMemo } from "react";
import type { Contrato } from "./useContratos";
import type { Cliente } from "./useClientes";
import type { Moto } from "./useMotos";
import type { Pago } from "./usePagos";

export type Alerta = {
  id: string;
  tipo: "mora_critica" | "base_completada" | "soat_vence" | "tecno_vence" | "gabela" | "plazo_extra_vence";
  nivel: "critico" | "alerta" | "info";
  titulo: string;
  detalle: string;
  clienteId?: string;
  contratoId?: string;
  motoId?: string;
};

export function useAlertas({
  contratos,
  clientes,
  motos,
  pagos,
}: {
  contratos: Contrato[];
  clientes: Cliente[];
  motos: Moto[];
  pagos: Pago[];
}): Alerta[] {
  return useMemo(() => {
    const alertas: Alerta[] = [];
    const hoy = new Date().toISOString().slice(0, 10);
    const en15 = new Date(); en15.setDate(en15.getDate() + 15);
    const en30 = new Date(); en30.setDate(en30.getDate() + 30);
    const iso15 = en15.toISOString().slice(0, 10);
    const iso30 = en30.toISOString().slice(0, 10);

    const contratosActivos = contratos.filter(c => c.estado === "Activo");

    // Mora crítica y gabela
    for (const c of contratosActivos) {
      const pagosC = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado");
      const ultimo = pagosC.sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
      const dias = ultimo
        ? Math.floor((new Date().getTime() - new Date(ultimo.fecha + "T00:00:00").getTime()) / 86400000)
        : 999;
      const cliente = clientes.find(cl => cl.id === c.cliente_id);
      const moto = motos.find(m => m.id === c.moto_id);
      const nombre = cliente?.nombre ?? "Sin nombre";
      const placa = moto?.placa ?? "";

      if (dias > 7) {
        alertas.push({
          id: `mora-critica-${c.id}`,
          tipo: "mora_critica",
          nivel: "critico",
          titulo: `Mora crítica — ${nombre.toUpperCase()}`,
          detalle: `${dias} días sin pago${placa ? ` · ${placa}` : ""} — requiere recolección`,
          clienteId: c.cliente_id,
          contratoId: c.id,
          motoId: c.moto_id ?? undefined,
        });
      } else if (dias > 2) {
        alertas.push({
          id: `mora-${c.id}`,
          tipo: "mora_critica",
          nivel: "alerta",
          titulo: `En mora — ${nombre.toUpperCase()}`,
          detalle: `${dias} días sin pago${placa ? ` · ${placa}` : ""}`,
          clienteId: c.cliente_id,
          contratoId: c.id,
        });
      } else if (dias === 2) {
        alertas.push({
          id: `gabela-${c.id}`,
          tipo: "gabela",
          nivel: "alerta",
          titulo: `Gabela — ${nombre.toUpperCase()}`,
          detalle: `Día de gabela${placa ? ` · ${placa}` : ""} — contactar hoy`,
          clienteId: c.cliente_id,
          contratoId: c.id,
        });
      }
    }

    // Base completada (contratos diarios)
    for (const c of contratosActivos) {
      if ((c.tipo_ruta === "diario" || c.forma_pago === "Diario") && !c.base_completada) {
        const ahorro = c.ahorro_acumulado ?? 0;
        const meta = c.base_inicial ?? 510000;
        if (ahorro >= meta) {
          const cliente = clientes.find(cl => cl.id === c.cliente_id);
          alertas.push({
            id: `base-${c.id}`,
            tipo: "base_completada",
            nivel: "info",
            titulo: `Base completada — ${(cliente?.nombre ?? "").toUpperCase()}`,
            detalle: `Ahorro: $${Math.round(ahorro).toLocaleString("es-CO")} — gestionar cambio de contrato`,
            clienteId: c.cliente_id,
            contratoId: c.id,
          });
        }
      }
    }

    // SOAT y tecnomecánica próximos a vencer
    for (const m of motos) {
      if (m.fecha_seguro && m.fecha_seguro <= iso30) {
        const nivel = m.fecha_seguro <= hoy ? "critico" : m.fecha_seguro <= iso15 ? "alerta" : "info";
        alertas.push({
          id: `soat-${m.id}`,
          tipo: "soat_vence",
          nivel,
          titulo: `SOAT vence — ${m.placa}`,
          detalle: `Vence el ${new Date(m.fecha_seguro + "T00:00:00").toLocaleDateString("es-CO")}`,
          motoId: m.id,
        });
      }
      if (m.fecha_tecnomecanica && m.fecha_tecnomecanica <= iso30) {
        const nivel = m.fecha_tecnomecanica <= hoy ? "critico" : m.fecha_tecnomecanica <= iso15 ? "alerta" : "info";
        alertas.push({
          id: `tecno-${m.id}`,
          tipo: "tecno_vence",
          nivel,
          titulo: `Tecnomecánica vence — ${m.placa}`,
          detalle: `Vence el ${new Date(m.fecha_tecnomecanica + "T00:00:00").toLocaleDateString("es-CO")}`,
          motoId: m.id,
        });
      }
    }

    // Ordenar: crítico > alerta > info
    const orden = { critico: 0, alerta: 1, info: 2 };
    return alertas.sort((a, b) => orden[a.nivel] - orden[b.nivel]);
  }, [contratos, clientes, motos, pagos]);
}
