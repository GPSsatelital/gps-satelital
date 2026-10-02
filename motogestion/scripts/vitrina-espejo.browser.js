// PRUEBA ESPEJO DE LA VITRINA — compara, contrato por contrato, lo que dice la pantalla
// (src/utils/cicloPago.ts: loQueDebe / calcularEstadoCartera / diasEnMora) contra lo que dice la
// base (zala.cliente, mig 126). Si un peso difiere, la vitrina NO se le entrega a ZALA.
//
// CÓMO SE CORRE: con el servidor de desarrollo arriba (npm run dev) y la app abierta y logueada
// como ADMIN / ADMIN_PRINCIPAL en http://localhost:5173, pegar TODO este archivo en la consola
// del navegador (F12 → Console) y esperar el resumen. No escribe nada: solo lee.
//
// Por qué en el navegador y no en vitest: la comparación necesita los datos REALES de producción
// con la sesión de un administrador, y el servidor de desarrollo sirve cicloPago.ts tal cual
// (import dinámico), así que la pantalla y la base se comparan con el MISMO código que corre.

(async () => {
  const cp = await import("/src/utils/cicloPago.ts");
  const URL_ = "https://jvfkprkjysjffhzjitgl.supabase.co/rest/v1/";
  const tokenKey = Object.keys(localStorage).find(k => k.startsWith("sb-") && k.endsWith("-auth-token"));
  const tok = JSON.parse(localStorage.getItem(tokenKey)).access_token;
  // La clave pública (anon) viene en el propio bundle; se lee del módulo de supabase de la app.
  const sb = await import("/src/lib/supabase.ts");
  const KEY = sb.supabase?.supabaseKey ?? sb.supabase?.["supabaseKey"];
  const H = { apikey: KEY, Authorization: "Bearer " + tok };
  const q = async (p) => { const r = await fetch(URL_ + p, { headers: H }); if (!r.ok) throw new Error(p + " → " + r.status + " " + (await r.text()).slice(0, 200)); return r.json(); };
  const rpc = async (fn, body) => { const r = await fetch(URL_ + "rpc/" + fn, { method: "POST", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify(body) }); if (!r.ok) throw new Error(fn + " → " + r.status + " " + (await r.text()).slice(0, 300)); return r.json(); };

  const hoyISO = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
  const hoy = new Date(hoyISO + "T00:00:00");

  const contratos = await q("contratos?estado=in.(Activo,Suspendido)&select=*");
  const ids = contratos.map(c => c.id);
  const porLotes = async (path) => { const out = []; for (let i = 0; i < ids.length; i += 50) { out.push(...await q(path.replace("{IDS}", ids.slice(i, i + 50).join(",")))); } return out; };
  // `created_at` va porque `faltaDelAcuerdo` corta los abonos por la firma del acuerdo con ese
  // campo (mig 132) — igual que la pantalla, que pasa el pago completo. Sin él, la prueba
  // ejercitaría el respaldo por `fecha` y no el camino real.
  const pagos = await porLotes("pagos?estado=eq.Confirmado&contrato_id=in.({IDS})&select=contrato_id,fecha,created_at,valor,aplicado_convenio,aplicado_saldo_favor,aplicado_deuda");
  const deudas = await porLotes("deudas?estado=eq.pendiente&contrato_id=in.({IDS})&select=contrato_id,monto,monto_pendiente,created_at");
  // El acuerdo QUE SE COBRA, igual que la pantalla (`elegirConvenioPorCobrar`) y la vitrina (mig 183):
  // el activo, y si no hay, el incumplido más viejo. Antes se cargaban solo los activos y la prueba
  // daba "0 diferencias" mientras la pantalla cobraba los vencidos y ZALA no (2-oct, D-036).
  const convenios = await q("convenios?estado=in.(activo,incumplido)&select=*");
  const elegido = (contratoId) => convenios.filter(x => x.contrato_id === contratoId)
    .sort((a, b) => (a.estado === "activo" ? 0 : 1) - (b.estado === "activo" ? 0 : 1) || a.created_at.localeCompare(b.created_at))[0] ?? null;
  const vitrina = await rpc("zala_vitrina", { p_vista: "cliente" });
  // Para la cola de recolección (mig 182): plazo extra vigente, estado de la moto y préstamo activo.
  const plazos = await q("gestiones_cobro?tipo=eq.plazo_extra&plazo_extra_fecha_limite=not.is.null&select=contrato_id,plazo_extra_fecha_limite");
  const motos = await q("motos?select=id,estado");
  const prestados = new Set((await q("prestamos_reemplazo?estado=eq.activo&select=contrato_id")).map(x => x.contrato_id));
  const plazoHasta = new Map();
  for (const g of plazos) if (!plazoHasta.has(g.contrato_id) || g.plazo_extra_fecha_limite > plazoHasta.get(g.contrato_id)) plazoHasta.set(g.contrato_id, g.plazo_extra_fecha_limite);
  const porContrato = new Map(vitrina.map(r => [r.contrato_id, r]));

  const num = (x) => x == null ? 0 : Number(x);
  const diffs = [];
  let comparados = 0, sinMotor = 0, sinFila = 0;
  for (const c of contratos) {
    const v = porContrato.get(c.id);
    if (!v) { sinFila++; continue; }
    if (c.forma_pago === "Diario" || !c.motor_v2) { sinMotor++; continue; }
    const pagosC = pagos.filter(p => p.contrato_id === c.id);
    const deudasC = deudas.filter(d => d.contrato_id === c.id);
    const cv = elegido(c.id);
    const lqd = cp.loQueDebe(c, pagosC, deudasC, cv, hoy);
    const cuotaConv = cp.cuotaConvenioDelPeriodo(cv, c, hoy);
    const cubierto = !!(cv?.cubre_periodo_hasta && cv.cubre_periodo_hasta >= hoyISO);
    // D-026: con las deudas, igual que las pantallas, para las semanas de más.
    const estado = cp.calcularEstadoCartera(c, pagosC, hoy, cuotaConv, cubierto, cv, deudasC);
    const dias = cp.diasEnMora(c, pagosC, hoy, cuotaConv, cubierto, cv, deudasC);
    const esperado = {
      debe_hoy: lqd.totalFalta, cuota_toca: lqd.cuota.toca, cuota_falta: lqd.cuota.falta,
      acuerdo_toca: lqd.acuerdo?.toca ?? 0, acuerdo_falta: lqd.acuerdo?.falta ?? 0,
      acuerdo_cuota_este_periodo: lqd.acuerdo?.cuotaDelPeriodo ?? 0,
      // En semanas de más la pantalla pone las deudas dentro de la semana (deudas.falta = 0) y la
      // vitrina conserva la columna con lo real; se compara contra el desglose del cierre (mig 175).
      deudas_falta: lqd.cierre ? lqd.cierre.debeDeudas : lqd.deudas.falta, saldo_a_favor: lqd.saldoAFavor,
      estado_cartera: estado, dias_mora: dias,
      en_semanas_de_mas: lqd.cierre ? 1 : 0, semana_de_mas: lqd.cierre?.semana ?? 0,
      semanas_de_mas: lqd.cierre?.semanas ?? 0, debe_para_terminar: lqd.cierre?.debeTotal ?? 0,
      // La misma regla del panel Hoy (vaARecoleccion) contra balde_hoy de la vitrina.
      recoleccion: c.estado === "Activo" && cp.vaARecoleccion({
        estado, diasMora: dias,
        plazoVigente: (plazoHasta.get(c.id) ?? "") >= hoyISO,
        estadoMoto: motos.find(m => m.id === c.moto_id)?.estado, conPrestada: prestados.has(c.id),
      }) ? 1 : 0,
    };
    comparados++;
    for (const [campo, ts] of Object.entries(esperado)) {
      const sql = campo === "estado_cartera" ? v[campo] : campo === "en_semanas_de_mas" ? (v[campo] ? 1 : 0)
        : campo === "recoleccion" ? (v.balde_hoy === "recoleccion" ? 1 : 0) : num(v[campo]);
      const igual = campo === "estado_cartera" ? sql === ts : Math.abs(sql - ts) < 0.5;
      if (!igual) diffs.push({ placa: v.placa, cliente: v.cliente, campo, pantalla: ts, base: campo === "recoleccion" ? sql : v[campo] });
    }
  }
  const porCampo = diffs.reduce((a, d) => { a[d.campo] = (a[d.campo] || 0) + 1; return a; }, {});
  console.log(`ESPEJO ${hoyISO}: ${comparados} contratos comparados · ${sinMotor} fuera del motor · ${sinFila} sin fila en la vitrina · ${diffs.length} diferencias`);
  console.log("por campo:", porCampo);
  console.table(diffs.slice(0, 60));
  window.__espejo = { comparados, sinMotor, sinFila, diffs, porCampo };
  return window.__espejo;
})();
