import type { Pendiente } from "../hooks/usePendientes";

// La forma de un aviso tal como la dibujan la campana y AlertasView. Vivía en `useAlertas.ts`
// junto con el cálculo; ese archivo se borró el 10-sep-2026 cuando el cálculo se mudó al servidor
// (`public.pendientes`, migs 142-145) y las 430 líneas quedaron sin usar. Se dejó solo la forma,
// que es lo único que las pantallas siguen necesitando. Las REGLAS de cada aviso —cuándo aparece,
// con qué nivel, de quién es— viven ahora en la migración 144, y el cupo diario en la 145.
export type AlertaTipo =
  | "mora_critica" | "gabela" | "base_completada" | "soat_vence" | "tecno_vence"
  | "plazo_extra_vence" | "transferencia_pendiente" | "contrato_sin_activar" | "moto_retenida"
  | "traspaso_proximo" | "convenio_incumplido_3" | "convenio_por_vencer" | "moto_taller_demorada"
  | "validar_ubicacion_moto" | "promesa_pago_vence" | "prestamo_doc_vence"
  | "dinero_sin_identificar" | "cesion_pendiente" | "liquidacion_sin_firma";

export type Alerta = {
  id: string;
  tipo: AlertaTipo;
  nivel: "critico" | "alerta" | "info";
  titulo: string;
  detalle: string;
  clienteId?: string;
  contratoId?: string;
  motoId?: string;
  /** Los días que el servidor ya contó (de mora, o los que faltan para vencer si es negativo).
   *  Antes la pantalla los sacaba del texto con una expresión regular que no calzaba con ningún
   *  detalle real, así que el número nunca salía. Ahora viene como número y no hay que adivinarlo. */
  dias?: number | null;
};

// EL PUENTE ENTRE LA LISTA VIEJA Y LA NUEVA (10-sep-2026).
//
// Hasta hoy los 19 avisos se calculaban EN EL NAVEGADOR (`useAlertas`): se armaban al abrir la
// app y se borraban al cerrarla. Ahora viven en el servidor (`public.pendientes`, migs 142-145),
// con dueño, con el cupo diario y respetando la RLS. Falta que las pantallas los lean de allá.
//
// 🔴 POR QUÉ UN ADAPTADOR Y NO REESCRIBIR LAS PANTALLAS. La campana y AlertasView son 500 líneas
// que ya funcionan: pestañas, iconos, botones de WhatsApp y de llamar. Reescribirlas sería tocar
// código bueno para no ganar nada — y este proyecto ya pagó caro reemplazar lo que andaba. Se
// traduce el dato y las pantallas siguen dibujando exactamente igual.
//
// Los nombres de tipo cambiaron al pasar al servidor (la mora se partió en `recoleccion` y `mora`,
// el taller quedó `taller_demorado`…). Acá se devuelven a los nombres viejos para que los iconos,
// las etiquetas y las pestañas que ya existen sigan calzando sin tocarlas.

const TIPO_VIEJO: Record<string, AlertaTipo> = {
  recoleccion:            "mora_critica",
  mora:                   "mora_critica",
  gabela:                 "gabela",
  plazo_vencido:          "plazo_extra_vence",
  promesa_vencida:        "promesa_pago_vence",
  transferencia_pendiente:"transferencia_pendiente",
  dinero_sin_identificar: "dinero_sin_identificar",
  soat_vence:             "soat_vence",
  tecno_vence:            "tecno_vence",
  moto_retenida:          "moto_retenida",
  taller_demorado:        "moto_taller_demorada",
  prestamo_doc_vence:     "prestamo_doc_vence",
  validar_ubicacion_moto: "validar_ubicacion_moto",
  convenio_incumplido_3:  "convenio_incumplido_3",
  convenio_por_vencer:    "convenio_por_vencer",
  contrato_sin_activar:   "contrato_sin_activar",
  cesion_pendiente:       "cesion_pendiente",
  base_completada:        "base_completada",
  liquidacion_sin_firma:  "liquidacion_sin_firma",
  traspaso_proximo:       "traspaso_proximo",
};

export function pendienteComoAlerta(p: Pendiente): Alerta {
  return {
    id: p.clave,
    tipo: TIPO_VIEJO[p.tipo] ?? "mora_critica",
    nivel: p.nivel,
    titulo: p.titulo,
    detalle: p.detalle,
    clienteId: p.cliente_id ?? undefined,
    contratoId: p.contrato_id ?? undefined,
    motoId: p.moto_id ?? undefined,
    dias: p.dias,
  };
}

/** La lista completa, con lo urgente primero — que es como se leía la campana. */
export function comoAlertas(pendientes: Pendiente[]): Alerta[] {
  const orden = { critico: 0, alerta: 1, info: 2 } as const;
  return pendientes.map(pendienteComoAlerta).sort((a, b) => orden[a.nivel] - orden[b.nivel]);
}
