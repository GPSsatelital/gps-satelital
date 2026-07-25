import { useMemo } from "react";
import { hoyISO, hoyDate } from "../utils/fecha";
import { calcularEstadoCartera, diasEnMora, cuotaConvenioDelPeriodo } from "../utils/cicloPago";
import { ahorroTotal, type Contrato } from "./useContratos";
import type { Cliente } from "./useClientes";
import type { Moto } from "./useMotos";
import type { Pago } from "./usePagos";
import type { Convenio } from "./useConvenios";
import type { Gestion } from "./useGestiones";
import type { PrestamoDoc } from "./usePrestamosDoc";

export type AlertaTipo =
  | "mora_critica"
  | "gabela"
  | "base_completada"
  | "soat_vence"
  | "tecno_vence"
  | "plazo_extra_vence"
  | "transferencia_pendiente"
  | "contrato_sin_activar"
  | "moto_retenida"
  | "traspaso_proximo"
  | "convenio_incumplido_3"
  | "convenio_por_vencer"
  | "moto_taller_demorada"
  | "validar_ubicacion_moto"
  | "promesa_pago_vence"
  | "prestamo_doc_vence";

export type Alerta = {
  id: string;
  tipo: AlertaTipo;
  nivel: "critico" | "alerta" | "info";
  titulo: string;
  detalle: string;
  clienteId?: string;
  contratoId?: string;
  motoId?: string;
};

function diasEntre(desde: string, hasta: string): number {
  return Math.floor(
    (new Date(hasta + "T00:00:00").getTime() - new Date(desde + "T00:00:00").getTime()) / 86400000
  );
}

function addDays(base: Date, n: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function useAlertas({
  contratos,
  clientes,
  motos,
  pagos,
  convenios = [],
  gestiones = [],
  prestamosDoc = [],
}: {
  contratos: Contrato[];
  clientes: Cliente[];
  motos: Moto[];
  pagos: Pago[];
  convenios?: Convenio[];
  gestiones?: Gestion[];
  prestamosDoc?: PrestamoDoc[];
}): Alerta[] {
  return useMemo(() => {
    const alertas: Alerta[] = [];
    const hoy = hoyISO();
    const ahora = hoyDate();

    const iso5  = addDays(ahora,  5);
    const iso15 = addDays(ahora, 15);
    const iso30 = addDays(ahora, 30);
    const iso60 = addDays(ahora, 60);

    const contratosActivos = contratos.filter(c => c.estado === "Activo");

    // ── 1. MORA CRÍTICA / MORA / GABELA ──────────────────────────────────────
    // Usa la fuente única de cartera (calcularEstadoCartera/diasEnMora) — antes contaba
    // días crudos desde el último pago, y un cliente de día miércoles al día generaba
    // alerta de "mora" los lunes/martes (mismo falso positivo que tenía el Panel Hoy).
    for (const c of contratosActivos) {
      const pagosC = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado");
      const convenioActivo = convenios.find(cv => cv.contrato_id === c.id && cv.estado === "activo");
      const cuotaConvenio = cuotaConvenioDelPeriodo(convenioActivo, c, ahora);
      const periodoCubierto = !!(convenioActivo?.cubre_periodo_hasta && convenioActivo.cubre_periodo_hasta >= hoy);
      const estadoCartera = calcularEstadoCartera(c, pagosC, ahora, cuotaConvenio, periodoCubierto);
      const cliente = clientes.find(cl => cl.id === c.cliente_id);
      const moto = motos.find(m => m.id === c.moto_id);
      const nombre = cliente?.nombre ?? "Sin nombre";
      const placa = moto?.placa ?? "";

      if (estadoCartera === "mora") {
        const dias = diasEnMora(c, pagosC, ahora, cuotaConvenio, periodoCubierto);
        if (dias > 3) {
          alertas.push({
            id: `mora-critica-${c.id}`,
            tipo: "mora_critica",
            nivel: "critico",
            titulo: `Mora crítica — ${nombre.toUpperCase()}`,
            detalle: `${dias} días de mora${placa ? ` · ${placa}` : ""} — requiere recolección`,
            clienteId: c.cliente_id,
            contratoId: c.id,
            motoId: c.moto_id ?? undefined,
          });
        } else {
          alertas.push({
            id: `mora-${c.id}`,
            tipo: "mora_critica",
            nivel: "alerta",
            titulo: `En mora — ${nombre.toUpperCase()}`,
            detalle: `${dias} día${dias !== 1 ? "s" : ""} de mora${placa ? ` · ${placa}` : ""}`,
            clienteId: c.cliente_id,
            contratoId: c.id,
            motoId: c.moto_id ?? undefined,
          });
        }
      } else if (estadoCartera === "gabela") {
        alertas.push({
          id: `gabela-${c.id}`,
          tipo: "gabela",
          nivel: "alerta",
          titulo: `Gabela — ${nombre.toUpperCase()}`,
          detalle: `Día de gabela${placa ? ` · ${placa}` : ""} — contactar hoy`,
          clienteId: c.cliente_id,
          contratoId: c.id,
          motoId: c.moto_id ?? undefined,
        });
      }
    }

    // ── 2. BASE COMPLETADA (contratos diarios) ────────────────────────────────
    for (const c of contratosActivos) {
      if ((c.tipo_ruta === "diario" || c.forma_pago === "Diario") && !c.base_completada) {
        const ahorro = ahorroTotal(c);
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

    // ── 3. SOAT Y TECNOMECÁNICA PRÓXIMOS A VENCER ────────────────────────────
    for (const m of motos) {
      if (m.fecha_seguro && m.fecha_seguro <= iso30) {
        const nivel: Alerta["nivel"] = m.fecha_seguro <= hoy ? "critico" : m.fecha_seguro <= iso5 ? "critico" : m.fecha_seguro <= iso15 ? "alerta" : "info";
        const diasRestantes = diasEntre(hoy, m.fecha_seguro);
        alertas.push({
          id: `soat-${m.id}`,
          tipo: "soat_vence",
          nivel,
          titulo: `SOAT ${diasRestantes < 0 ? "VENCIDO" : "próximo a vencer"} — ${m.placa}`,
          detalle: diasRestantes < 0
            ? `Venció hace ${Math.abs(diasRestantes)} días — ${new Date(m.fecha_seguro + "T00:00:00").toLocaleDateString("es-CO")}`
            : `Vence en ${diasRestantes} días — ${new Date(m.fecha_seguro + "T00:00:00").toLocaleDateString("es-CO")}`,
          motoId: m.id,
        });
      }
      if (m.fecha_tecnomecanica && m.fecha_tecnomecanica <= iso30) {
        const nivel: Alerta["nivel"] = m.fecha_tecnomecanica <= hoy ? "critico" : m.fecha_tecnomecanica <= iso5 ? "critico" : m.fecha_tecnomecanica <= iso15 ? "alerta" : "info";
        const diasRestantes = diasEntre(hoy, m.fecha_tecnomecanica);
        alertas.push({
          id: `tecno-${m.id}`,
          tipo: "tecno_vence",
          nivel,
          titulo: `Tecnomecánica ${diasRestantes < 0 ? "VENCIDA" : "próxima a vencer"} — ${m.placa}`,
          detalle: diasRestantes < 0
            ? `Venció hace ${Math.abs(diasRestantes)} días — ${new Date(m.fecha_tecnomecanica + "T00:00:00").toLocaleDateString("es-CO")}`
            : `Vence en ${diasRestantes} días — ${new Date(m.fecha_tecnomecanica + "T00:00:00").toLocaleDateString("es-CO")}`,
          motoId: m.id,
        });
      }
    }

    // ── 4. TRANSFERENCIAS PENDIENTES DE CONFIRMAR ─────────────────────────────
    const pendientes = pagos.filter(p => p.estado === "Pendiente");
    for (const p of pendientes) {
      const contrato = contratos.find(c => c.id === p.contrato_id);
      const cliente = clientes.find(cl => cl.id === contrato?.cliente_id);
      const moto = motos.find(m => m.id === contrato?.moto_id);
      const diasEsperando = Math.floor((ahora.getTime() - new Date(p.fecha + "T00:00:00").getTime()) / 86400000);
      alertas.push({
        id: `transferencia-${p.id}`,
        tipo: "transferencia_pendiente",
        nivel: diasEsperando >= 2 ? "alerta" : "info",
        titulo: `Transferencia pendiente${cliente ? ` — ${cliente.nombre.toUpperCase()}` : ""}`,
        detalle: `$${Math.round(p.valor).toLocaleString("es-CO")} · ${diasEsperando === 0 ? "hoy" : `hace ${diasEsperando} día${diasEsperando !== 1 ? "s" : ""}`}${moto ? ` · ${moto.placa}` : ""} — confirmar o rechazar`,
        clienteId: contrato?.cliente_id,
        contratoId: p.contrato_id,
        motoId: contrato?.moto_id ?? undefined,
      });
    }

    // ── 5. CONTRATOS EN PROCESO SIN ACTIVAR (>3 días) ────────────────────────
    for (const c of contratos.filter(ct => ct.estado === "En proceso")) {
      const diasEnProceso = Math.floor((ahora.getTime() - new Date(c.created_at).getTime()) / 86400000);
      if (diasEnProceso >= 3) {
        const cliente = clientes.find(cl => cl.id === c.cliente_id);
        alertas.push({
          id: `contrato-sin-activar-${c.id}`,
          tipo: "contrato_sin_activar",
          nivel: diasEnProceso >= 7 ? "alerta" : "info",
          titulo: `Contrato sin activar — ${(cliente?.nombre ?? "Sin nombre").toUpperCase()}`,
          detalle: `${diasEnProceso} días en proceso — verificar firma y asignación de moto`,
          clienteId: c.cliente_id,
          contratoId: c.id,
        });
      }
    }

    // ── 5b. VALIDAR DÓNDE SE GUARDA LA MOTO (post-entrega, persiste hasta validar) ──
    // Aparece desde el día de la entrega y NO se quita hasta que el admin la marca. El GPS
    // del vehículo está en la plataforma externa (no en la app) → validación manual asistida.
    // `!== false` (no solo falsy): antes de correr la mig 060 el campo es undefined en todos
    // los contratos y NO debe dispararse; los migrados/existentes quedan en true por el backfill.
    for (const c of contratosActivos) {
      if (c.ubicacion_moto_validada !== false) continue;
      if (!c.fecha_entrega || diasEntre(c.fecha_entrega, hoy) < 0) continue;
      const cliente = clientes.find(cl => cl.id === c.cliente_id);
      const moto = c.moto_id ? motos.find(m => m.id === c.moto_id) : null;
      const dias = diasEntre(c.fecha_entrega, hoy);
      alertas.push({
        id: `validar-ubicacion-moto-${c.id}`,
        tipo: "validar_ubicacion_moto",
        nivel: dias >= 3 ? "alerta" : "info",
        titulo: `Validar dónde se guarda la moto — ${(cliente?.nombre ?? "Sin nombre").toUpperCase()}`,
        detalle: `${moto?.placa ?? "Moto"} entregada${dias === 0 ? " hoy" : ` hace ${dias} día${dias !== 1 ? "s" : ""}`} — revisa en el GPS que duerma donde declaró y márcalo`,
        clienteId: c.cliente_id,
        contratoId: c.id,
        motoId: c.moto_id ?? undefined,
      });
    }

    // ── 5c. PLAZO EXTRA / PROMESA DE PAGO VENCIDOS (recordatorio de compromisos) ────
    // Antes dependían de la memoria del funcionario. Se RECUERDA el compromiso (plazo extra o
    // promesa de pago) que venció en los últimos 15 días — ventana acotada para que no sea ruido
    // eterno. NO se filtra por "pagó algo": un abono parcial o la cuota rutinaria del período
    // NO significan que cumplió el compromiso (los abonos parciales son la norma). Se toma la
    // gestión MÁS RECIENTE (gestiones ya vienen ordenadas created_at desc). `gestiones` opcional.
    const hace15 = addDays(ahora, -15);
    for (const c of contratosActivos) {
      const gsC = gestiones.filter(g => g.contrato_id === c.id);
      if (gsC.length === 0) continue;
      const nombre = (clientes.find(cl => cl.id === c.cliente_id)?.nombre ?? "Sin nombre").toUpperCase();
      const base = { clienteId: c.cliente_id, contratoId: c.id, motoId: c.moto_id ?? undefined };
      const plazoFL = gsC.find(g => g.tipo === "plazo_extra" && g.plazo_extra_fecha_limite)?.plazo_extra_fecha_limite;
      if (plazoFL && plazoFL <= hoy && plazoFL >= hace15) {
        alertas.push({ id: `plazo-vence-${c.id}`, tipo: "plazo_extra_vence", nivel: "alerta", titulo: `Plazo extra vencido — ${nombre}`, detalle: `El plazo que le diste venció el ${plazoFL} — verifica si ya pagó o gestiona`, ...base });
      }
      const promesaFC = gsC.find(g => g.fecha_compromiso)?.fecha_compromiso;
      if (promesaFC && promesaFC <= hoy && promesaFC >= hace15) {
        alertas.push({ id: `promesa-vence-${c.id}`, tipo: "promesa_pago_vence", nivel: "alerta", titulo: `Promesa de pago vencida — ${nombre}`, detalle: `Prometió pagar el ${promesaFC} — verifica si ya pagó o gestiona`, ...base });
      }
    }

    // ── 5d. TARJETA/LLAVE PRESTADA SIN DEVOLVER ──────────────────────────────
    // El préstamo se registra con la fecha en que el cliente debe devolverla; si esa fecha
    // llegó y sigue "prestado", se avisa al funcionario para que se la pida. Persiste hasta
    // que se marque devuelta.
    for (const p of prestamosDoc.filter(x => x.estado === "prestado" && x.fecha_devolucion_esperada && x.fecha_devolucion_esperada <= hoy)) {
      const moto = motos.find(m => m.id === p.moto_id);
      const que = p.tipo === "tarjeta" ? "la tarjeta de propiedad" : "la copia de la llave";
      alertas.push({
        id: `prestamo-doc-${p.id}`,
        tipo: "prestamo_doc_vence",
        nivel: "alerta",
        titulo: `Debe devolver ${que} — ${moto?.placa ?? ""}`,
        detalle: `${p.prestado_a} debía devolverla el ${p.fecha_devolucion_esperada} — pedírsela`,
        motoId: p.moto_id,
      });
    }

    // ── 6. MOTOS RETENIDAS (Fiscalía / Tránsito / Garantía) ──────────────────
    for (const m of motos.filter(mo => ["Fiscalia", "Transito", "Garantia"].includes(mo.estado))) {
      const contrato = contratosActivos.find(c => c.moto_id === m.id);
      const cliente = clientes.find(cl => cl.id === contrato?.cliente_id);
      alertas.push({
        id: `retenida-${m.id}`,
        tipo: "moto_retenida",
        nivel: "critico",
        titulo: `Moto retenida — ${m.placa}`,
        detalle: `Estado: ${m.estado}${cliente ? ` · ${cliente.nombre.toUpperCase()}` : ""} — la moto no está produciendo`,
        clienteId: contrato?.cliente_id,
        contratoId: contrato?.id,
        motoId: m.id,
      });
    }

    // ── 7. TRASPASO PRÓXIMO (2 meses antes del vencimiento) ──────────────────
    // fecha_fin_contrato es la fecha real guardada (corregible a mano, o movida por
    // "tiempo rodado") — antes se recalculaba siempre desde fecha_entrega + meses,
    // ignorando cualquier corrección o extensión ya registrada.
    for (const c of contratosActivos) {
      if (!c.fecha_fin_contrato && (!c.meses || !c.fecha_entrega)) continue;
      const fechaVenc = c.fecha_fin_contrato ?? addDays(new Date(c.fecha_entrega! + "T00:00:00"), c.meses! * 30);
      if (fechaVenc <= iso60 && fechaVenc >= hoy) {
        const cliente = clientes.find(cl => cl.id === c.cliente_id);
        const moto = motos.find(m => m.id === c.moto_id);
        const diasRestantes = diasEntre(hoy, fechaVenc);
        alertas.push({
          id: `traspaso-${c.id}`,
          tipo: "traspaso_proximo",
          nivel: diasRestantes <= 15 ? "alerta" : "info",
          titulo: `Traspaso próximo — ${(cliente?.nombre ?? "").toUpperCase()}`,
          detalle: `Contrato vence en ${diasRestantes} días (${new Date(fechaVenc + "T00:00:00").toLocaleDateString("es-CO")})${moto ? ` · ${moto.placa}` : ""} — iniciar proceso de renovación`,
          clienteId: c.cliente_id,
          contratoId: c.id,
          motoId: c.moto_id ?? undefined,
        });
      }
    }

    // ── 8. 3er CONVENIO INCUMPLIDO → LIQUIDACIÓN OBLIGATORIA ─────────────────
    for (const c of contratosActivos) {
      const convContrato = convenios.filter(cv => cv.contrato_id === c.id);
      const incumplidos = convContrato.filter(cv => cv.estado === "incumplido");
      if (incumplidos.length >= 3 || (convContrato.length >= 3 && incumplidos.length >= 1 && convContrato[convContrato.length - 1]?.estado === "incumplido")) {
        const cliente = clientes.find(cl => cl.id === c.cliente_id);
        alertas.push({
          id: `convenio3-${c.id}`,
          tipo: "convenio_incumplido_3",
          nivel: "critico",
          titulo: `Liquidación obligatoria — ${(cliente?.nombre ?? "").toUpperCase()}`,
          detalle: `3er convenio incumplido — iniciar proceso de liquidación inmediatamente`,
          clienteId: c.cliente_id,
          contratoId: c.id,
        });
      }
    }

    // ── 9. CONVENIO ACTIVO PRÓXIMO A VENCER (≤3 días) ────────────────────────
    for (const cv of convenios.filter(cv => cv.estado === "activo")) {
      if (!cv.fecha_limite) continue;
      const dias = diasEntre(hoy, cv.fecha_limite);
      if (dias >= 0 && dias <= 3) {
        const contrato = contratos.find(c => c.id === cv.contrato_id);
        const cliente = clientes.find(cl => cl.id === contrato?.cliente_id);
        alertas.push({
          id: `convenio-vence-${cv.id}`,
          tipo: "convenio_por_vencer",
          nivel: dias === 0 ? "critico" : "alerta",
          titulo: `Convenio vence ${dias === 0 ? "HOY" : `en ${dias} día${dias !== 1 ? "s" : ""}`} — ${(cliente?.nombre ?? "").toUpperCase()}`,
          detalle: `Convenio #${cv.numero_convenio} · $${Math.round(cv.cuota_por_periodo).toLocaleString("es-CO")}/período · límite ${new Date(cv.fecha_limite + "T00:00:00").toLocaleDateString("es-CO")}`,
          clienteId: contrato?.cliente_id,
          contratoId: cv.contrato_id,
        });
      }
    }

    // ── 10. MOTOS EN TALLER >7 DÍAS SIN SALIDA ───────────────────────────────
    for (const m of motos.filter(mo => mo.estado === "Mantenimiento")) {
      const diasEnTaller = m.updated_at
        ? Math.floor((ahora.getTime() - new Date(m.updated_at).getTime()) / 86400000)
        : 0;
      if (diasEnTaller >= 7) {
        alertas.push({
          id: `taller-demorada-${m.id}`,
          tipo: "moto_taller_demorada",
          nivel: diasEnTaller >= 15 ? "alerta" : "info",
          titulo: `Moto demorada en taller — ${m.placa}`,
          detalle: `${diasEnTaller} días en taller sin registrar salida — verificar estado`,
          motoId: m.id,
        });
      }
    }

    // Ordenar: crítico > alerta > info
    const orden = { critico: 0, alerta: 1, info: 2 };
    return alertas.sort((a, b) => orden[a.nivel] - orden[b.nivel]);
  }, [contratos, clientes, motos, pagos, convenios, gestiones, prestamosDoc]);
}
