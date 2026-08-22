import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { hoyISO } from "../utils/fecha";

export type MotivoLiquidacion = "cumplimiento" | "retiro_voluntario" | "incumplimiento";
export type EstadoLiquidacion = "iniciada" | "en_taller" | "calculada" | "documento_generado" | "firmada" | "cerrada";

export type DetalleDano = { concepto: string; monto: number };
/**
 * Un renglón de lo que se le descuenta al cliente.
 *
 * `monto` NEGATIVO = crédito a su favor. Suena raro dentro de algo llamado "deudas", pero es que
 * `total_deudas` siempre fue el neto: adentro va lo que rodó sin pagar MENOS su ahorro de esos
 * días MENOS lo que había prepagado. Antes solo se guardaba el neto y el desglose quedaba vacío,
 * así que el documento que el cliente FIRMA mostraba un total que no cuadraba con sus renglones
 * (caso ANTONIO: $108.000 sin explicación). Ahora cada peso del neto tiene su renglón.
 *
 * `auto` = lo puso el sistema al calcular, no una persona. Los formularios lo filtran: si se
 * precargaran, volver a guardar los sumaría dos veces.
 */
export type DetalleDeuda = { concepto: string; monto: number; auto?: boolean };

export type Liquidacion = {
  id: string;
  numero: string;
  contrato_id: string;
  cliente_id: string;
  moto_id: string | null;
  motivo: MotivoLiquidacion;
  estado: EstadoLiquidacion;
  ahorro_acumulado: number;
  saldo_favor: number;
  total_deudas: number;
  costo_danos: number;
  saldo_final: number;
  detalle_deudas: DetalleDeuda[];
  detalle_danos: DetalleDano[];
  /**
   * Desglose de la plata que ES del cliente (mig 109). Su suma es lo que se le devuelve antes de
   * descuentos. Antes esto era un solo número rotulado "Ahorro acumulado" que traía adentro la
   * base que entregó — y la base NO es ahorro. Vacío = liquidación vieja.
   */
  detalle_favor: DetalleDeuda[];
  observaciones_taller: string | null;
  nombre_responsable: string | null;
  cargo_responsable: string | null;
  documento_firmado_url: string | null;
  firma_cliente_url: string | null;
  huella_cliente_url: string | null;
  fecha_firma: string | null;
  taller_id: string | null;
  iniciada_por: string | null;
  cerrada_por: string | null;
  created_at: string;
  updated_at: string;
};

// El folio lo asigna la BD con una secuencia (mig 068): es atómico y nunca repite. Contarlo
// en el frontend (COUNT(*)+1) fallaba de dos formas: dos personas liquidando a la vez sacaban
// el mismo número, y si se borraba una liquidación el contador retrocedía y reusaba un folio
// ya impreso en un documento legal.
async function generarNumero(): Promise<string> {
  const { data, error } = await supabase.rpc("siguiente_numero_liquidacion");
  if (!error && typeof data === "string") return data;
  // Respaldo mientras la mig 068 no esté corrida: el UNIQUE de `numero` sigue siendo la red.
  const { count } = await supabase.from("liquidaciones").select("*", { count: "exact", head: true });
  return `LIQ-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

export function useLiquidaciones() {
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLiquidaciones = useCallback(async () => {
    const { data } = await supabase
      .from("liquidaciones")
      .select("*")
      .order("created_at", { ascending: false });
    setLiquidaciones((data ?? []) as Liquidacion[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLiquidaciones();
    const channel = supabase
      .channel(`liquidaciones-realtime-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "liquidaciones" }, fetchLiquidaciones)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchLiquidaciones]);

  async function iniciarLiquidacion(
    contratoId: string,
    clienteId: string,
    motoId: string | null,
    motivo: MotivoLiquidacion,
    iniciadaPor: string,
    ahorroAcumulado: number
  ) {
    // Guarda contra doble-inicio: si ya hay una liquidación abierta (no cerrada) para este
    // contrato, no se crea otra — evitaría una orden de taller duplicada y dos liquidaciones
    // compitiendo por el mismo contrato/moto. El usuario debe continuar la existente.
    const { data: abierta } = await supabase
      .from("liquidaciones")
      .select("id, numero, estado")
      .eq("contrato_id", contratoId)
      .neq("estado", "cerrada")
      .limit(1);
    if (abierta && abierta.length > 0) {
      return { error: `Ya existe una liquidación en curso para este contrato (${abierta[0].numero} — ${abierta[0].estado}). Continúala en el módulo de Liquidaciones en vez de iniciar otra.` };
    }

    // PRÉSTAMO DE REEMPLAZO ACTIVO: mientras dura el préstamo, contrato.moto_id apunta a la moto
    // PRESTADA (el préstamo hace el intercambio de placas). Liquidar así se comía la prestada —
    // orden de taller, "Mantenimiento" y hasta el traspaso caían sobre una moto de OTRO
    // portafolio — y la moto propia del cliente quedaba suelta, sin liquidar. La guarda va AQUÍ,
    // en el hook, para que aplique a las tres puertas de entrada (Contratos, Motos e
    // Inmovilizaciones), no solo a la que se acordó de revisar.
    const { data: prestamo } = await supabase
      .from("prestamos_reemplazo")
      .select("id")
      .eq("contrato_id", contratoId)
      .eq("estado", "activo")
      .limit(1);
    if (prestamo && prestamo.length > 0) {
      return { error: "Este contrato tiene un préstamo de reemplazo activo: la moto que anda usando el cliente es PRESTADA, no la suya. Primero devuelve la prestada (Cartera → Préstamos activos) — ahí mismo se resuelve el tiempo de la guardada — y después inicia la liquidación sobre la moto propia." };
    }

    const numero = await generarNumero();

    // Deudas automáticas desde el sistema (solo las pendientes/sin pagar) +
    // saldo restante del convenio activo — el encargado NO las reescribe a mano.
    // Solo deudas 'pendiente': las 'en_convenio' YA entran abajo como "Saldo pendiente de
    // convenio" — incluirlas aquí también las cobraría DOBLE en la liquidación.
    const { data: deudasPend } = await supabase
      .from("deudas")
      .select("concepto, descripcion, monto_pendiente")
      .eq("contrato_id", contratoId)
      .eq("estado", "pendiente");
    const detalleDeudas: DetalleDeuda[] = (deudasPend ?? []).map(d => ({
      concepto: d.descripcion || d.concepto,
      monto: d.monto_pendiente,
    }));
    // El convenio se trae esté 'activo' o 'incumplido'. Antes solo miraba 'activo', y ese era el
    // hueco más caro del módulo: las deudas metidas en un convenio quedan marcadas 'en_convenio'
    // (por eso no entran arriba, para no cobrarlas dos veces). Si el cliente dejaba de pagar, el
    // convenio pasaba a 'incumplido' y DESAPARECÍA de la liquidación — así que sus deudas estaban
    // escondidas dentro del convenio y el convenio escondido por su estado. Resultado: liquidaba
    // con $0 de deuda y se le devolvía TODO el ahorro. Y es justo el caso que más se liquida: la
    // regla dice "3er convenio incumplido → liquidación obligatoria".
    // 'cumplido' y 'renovado' NO entran: el primero ya se pagó, el segundo vive en su reemplazo.
    const { data: convenios } = await supabase
      .from("convenios")
      .select("deuda_total, cuota_por_periodo, cuotas_pagadas, estado")
      .eq("contrato_id", contratoId)
      .in("estado", ["activo", "incumplido"]);
    for (const cv of convenios ?? []) {
      const restante = Math.max(cv.deuda_total - cv.cuotas_pagadas * cv.cuota_por_periodo, 0);
      if (restante > 0) {
        detalleDeudas.push({
          concepto: cv.estado === "incumplido" ? "Saldo de convenio incumplido" : "Saldo pendiente de convenio",
          monto: restante,
        });
      }
    }
    const totalDeudas = detalleDeudas.reduce((acc, d) => acc + d.monto, 0);

    // La revisión de taller es obligatoria en toda liquidación: se crea una orden
    // REAL en el módulo de Taller (la ve el mecánico en su lista de siempre) y se
    // vincula a la liquidación — ya no se escribe el estado inválido "En taller".
    let tallerId: string | null = null;
    if (motoId) {
      const { data: orden } = await supabase.from("taller").insert({
        moto_id: motoId,
        estado_tecnico: "Pendiente",
        detalle: `Revisión por liquidación ${numero} — evaluar estado y daños para calcular el saldo`,
        costo: 0,
        fecha_ingreso: hoyISO(),
      }).select("id").single();
      tallerId = orden?.id ?? null;
      await supabase.from("motos").update({ estado: "Mantenimiento" }).eq("id", motoId);
    }

    const { error } = await supabase.from("liquidaciones").insert({
      numero,
      contrato_id: contratoId,
      cliente_id: clienteId,
      moto_id: motoId,
      motivo,
      estado: motoId ? "en_taller" : "iniciada",
      ahorro_acumulado: ahorroAcumulado,
      total_deudas: totalDeudas,
      detalle_deudas: detalleDeudas,
      taller_id: tallerId,
      iniciada_por: iniciadaPor,
    });
    if (error) return { error: error.message };

    return { error: null };
  }

  async function registrarRevisionTaller(
    liquidacionId: string,
    observaciones: string,
    detalleDanos: DetalleDano[],
    costoDanos: number,
    detalleDeudas: DetalleDeuda[],
    totalDeudas: number
  ) {
    const saldoFinal = 0; // se calcula aparte
    const { error } = await supabase.from("liquidaciones").update({
      estado: "calculada",
      observaciones_taller: observaciones,
      detalle_danos: detalleDanos,
      costo_danos: costoDanos,
      detalle_deudas: detalleDeudas,
      total_deudas: totalDeudas,
      saldo_final: saldoFinal,
    }).eq("id", liquidacionId);
    if (!error) await fetchLiquidaciones();
    return { error: error?.message ?? null };
  }

  // El saldo a favor entra en la cuenta igual que el ahorro (regla del dueño, 19-ago): es plata
  // que el cliente YA entregó. Va como parámetro propio y no sumado al ahorro para que la pantalla
  // no llame "ahorro" a un dinero que no lo es (mig 104).
  async function calcularSaldo(
    liquidacionId: string, ahorro: number, deudas: number, danos: number, saldoFavor = 0,
    detalleFavor: DetalleDeuda[] = [],
  ) {
    const saldo = ahorro + saldoFavor - deudas - danos;
    const { error } = await supabase.from("liquidaciones").update({
      ahorro_acumulado: ahorro,
      detalle_favor: detalleFavor,
      saldo_favor: saldoFavor,
      total_deudas: deudas,
      costo_danos: danos,
      saldo_final: saldo,
      estado: "calculada",
    }).eq("id", liquidacionId);
    if (!error) await fetchLiquidaciones();
    return { error: error?.message ?? null, saldo };
  }

  /**
   * Devuelve una liquidación del paso "documento generado" al del cálculo.
   *
   * Solo mientras el cliente NO haya firmado: después de eso el número está en un papel con su
   * firma y no se toca. Sin esto, imprimir el documento era un callejón sin salida — si al
   * revisarlo con el cliente aparecía un error, no había cómo devolverse.
   */
  /**
   * Corrige el motivo de una liquidación que todavía no se firma.
   *
   * El motivo decide TODO lo que pasa al cerrar: si el contrato queda Finalizado o Cancelado, si
   * la moto vuelve a la flota o pasa a ser del cliente, y cómo queda el cliente. Elegirlo mal y no
   * poder corregirlo obligaba a anular la liquidación entera — y anular tampoco existe.
   *
   * Solo hasta 'documento_generado': después el cliente firmó un papel que dice ese motivo.
   */
  async function cambiarMotivo(liquidacionId: string, motivo: MotivoLiquidacion) {
    const { error } = await supabase.from("liquidaciones")
      .update({ motivo })
      .eq("id", liquidacionId)
      .in("estado", ["iniciada", "en_taller", "calculada", "documento_generado"]);
    if (!error) await fetchLiquidaciones();
    return { error: error?.message ?? null };
  }

  async function volverACalcular(liquidacionId: string) {
    const { error } = await supabase.from("liquidaciones")
      .update({ estado: "calculada" })
      .eq("id", liquidacionId)
      .eq("estado", "documento_generado");   // candado: nunca desde 'firmada' ni 'cerrada'
    if (!error) await fetchLiquidaciones();
    return { error: error?.message ?? null };
  }

  async function marcarDocumentoGenerado(liquidacionId: string, nombreResponsable: string, cargoResponsable: string) {
    const { error } = await supabase.from("liquidaciones").update({
      estado: "documento_generado",
      nombre_responsable: nombreResponsable,
      cargo_responsable: cargoResponsable,
    }).eq("id", liquidacionId);
    if (!error) await fetchLiquidaciones();
    return { error: error?.message ?? null };
  }

  /**
   * Adjunta la firma a una liquidación YA CERRADA.
   *
   * Pasa de verdad: hay que cerrar la cuenta un día porque la moto se necesita, y el cliente
   * aparece al siguiente. Antes eso no tenía salida — cerrada quedaba "sin firma del cliente"
   * para siempre, aunque él viniera y firmara. Solo pega el documento: NO devuelve la liquidación
   * a "firmada", porque el cierre ya se aplicó (contrato, moto, deudas) y retroceder el estado
   * dejaría el módulo diciendo una cosa y la base otra.
   */
  async function adjuntarFirmaACerrada(liquidacionId: string, file: File) {
    const ext = file.name.split(".").pop();
    const path = `liquidaciones/${liquidacionId}/firmado.${ext}`;
    const { error: uploadError } = await supabase.storage.from("documentos").upload(path, file, { upsert: true });
    if (uploadError) return { error: uploadError.message };
    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
    const { error } = await supabase.from("liquidaciones")
      .update({ documento_firmado_url: data.publicUrl })
      .eq("id", liquidacionId);
    if (error) return { error: error.message };
    await fetchLiquidaciones();
    return { error: null };
  }

  /**
   * Firma en pantalla: guarda la firma, la huella y el documento FINAL ya armado con las dos
   * incrustadas. Deja la liquidación en 'firmada', igual que subir la foto del papel.
   *
   * El PDF va a `documento_firmado_url`, la misma columna de siempre: todo lo que ya la lee
   * —el botón de descargar, el aviso de "cerrada sin firma", el cierre— sigue funcionando sin
   * enterarse de que ahora puede venir de la pantalla en vez de la cámara.
   *
   * Si el PDF falla (html2canvas es delicado), NO se guarda nada a medias: se devuelve el error
   * y la liquidación se queda donde estaba, para poder reintentar o irse por el papel.
   */
  async function firmarDigital(
    liquidacionId: string,
    firmaDataUrl: string,
    huellaDataUrl: string | null,
    htmlFinal: string,
  ) {
    const subirDataUrl = async (dataUrl: string, nombre: string) => {
      const blob = await (await fetch(dataUrl)).blob();
      const path = `liquidaciones/${liquidacionId}/${nombre}`;
      const { error } = await supabase.storage.from("documentos").upload(path, blob, { upsert: true, contentType: blob.type || "image/png" });
      if (error) throw new Error(error.message);
      return supabase.storage.from("documentos").getPublicUrl(path).data.publicUrl;
    };

    try {
      const { htmlAPdfBlob } = await import("../utils/pdf");
      const pdf = await htmlAPdfBlob(htmlFinal);

      const firmaUrl = await subirDataUrl(firmaDataUrl, "firma.png");
      const huellaUrl = huellaDataUrl ? await subirDataUrl(huellaDataUrl, "huella.png") : null;

      const pathDoc = `liquidaciones/${liquidacionId}/firmado.pdf`;
      const { error: errDoc } = await supabase.storage.from("documentos")
        .upload(pathDoc, pdf, { upsert: true, contentType: "application/pdf" });
      if (errDoc) return { error: errDoc.message };
      const docUrl = supabase.storage.from("documentos").getPublicUrl(pathDoc).data.publicUrl;

      const { error } = await supabase.from("liquidaciones").update({
        estado: "firmada",
        documento_firmado_url: docUrl,
        firma_cliente_url: firmaUrl,
        huella_cliente_url: huellaUrl,
        fecha_firma: new Date().toISOString(),
      }).eq("id", liquidacionId);
      if (error) return { error: error.message };

      await fetchLiquidaciones();
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "No se pudo guardar la firma." };
    }
  }

  async function subirDocumentoFirmado(liquidacionId: string, file: File) {
    const ext = file.name.split(".").pop();
    const path = `liquidaciones/${liquidacionId}/firmado.${ext}`;
    const { error: uploadError } = await supabase.storage.from("documentos").upload(path, file, { upsert: true });
    if (uploadError) return { error: uploadError.message };

    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
    const { error } = await supabase.from("liquidaciones").update({
      estado: "firmada",
      documento_firmado_url: data.publicUrl,
    }).eq("id", liquidacionId);
    if (!error) await fetchLiquidaciones();
    return { error: error?.message ?? null };
  }

  /**
   * Cierra la liquidación. TODO en una sola función de la base (mig 105): o pasa todo, o no pasa
   * nada. Antes eran 4 escrituras sueltas desde el navegador y si se caía el internet a la mitad
   * quedaba la liquidación 'cerrada' con el contrato 'Activo' — el cliente que ya entregó la moto
   * seguía en el Panel Hoy con su cuota por cobrar.
   *
   * Además ahora SALDA: las deudas y el convenio que se cruzaron contra el ahorro quedan pagados,
   * el ahorro se pone en cero, y si no alcanzó, el faltante queda como UNA deuda viva para poder
   * cobrársela si vuelve (regla del dueño).
   */
  async function confirmarCierre(liquidacionId: string, cerradaPor: string, sigueConEmpresa = false) {
    const { data, error } = await supabase.rpc("cerrar_liquidacion", {
      p_liquidacion_id: liquidacionId,
      p_cerrada_por: cerradaPor,
      p_sigue_con_empresa: sigueConEmpresa,
    });
    if (error) return { error: error.message };
    await fetchLiquidaciones();
    const r = (data ?? {}) as { deuda_creada?: boolean; faltante?: number; estado_cliente?: string; lista_negra?: boolean };
    const avisos: string[] = [];
    if (r.deuda_creada) {
      avisos.push(`El ahorro no alcanzó: quedaron $${Math.round(r.faltante ?? 0).toLocaleString("es-CO")} como deuda del cliente, para cobrárselos si vuelve.`);
    }
    if (r.estado_cliente === "Aprobado") {
      avisos.push("El cliente quedó listo para su contrato nuevo — ya lo puedes elegir en el wizard.");
    }
    // Si quedó en lista negra pero se marcó que sigue, hay que decirlo: son dos cosas que se
    // contradicen y el funcionario tiene que enterarse ANTES de prometerle una moto.
    if (r.lista_negra && r.estado_cliente === "Aprobado") {
      avisos.push("⚠️ OJO: quedó en LISTA NEGRA por el saldo pendiente. Revísalo antes de entregarle otra moto.");
    }
    return { error: null, avisoDeuda: avisos.length > 0 ? avisos.join(" ") : null };
  }

  return {
    liquidaciones,
    loading,
    iniciarLiquidacion,
    registrarRevisionTaller,
    calcularSaldo,
    marcarDocumentoGenerado,
    volverACalcular,
    cambiarMotivo,
    subirDocumentoFirmado,
    adjuntarFirmaACerrada,
    firmarDigital,
    confirmarCierre,
  };
}
