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
  const pagos = await porLotes("pagos?estado=eq.Confirmado&contrato_id=in.({IDS})&select=contrato_id,fecha,valor,aplicado_convenio,aplicado_saldo_favor");
  const deudas = await porLotes("deudas?estado=eq.pendiente&contrato_id=in.({IDS})&select=contrato_id,monto,monto_pendiente");
  const convenios = await q("convenios?estado=eq.activo&select=*");
  const vitrina = await rpc("zala_vitrina", { p_vista: "cliente" });
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
    const cv = convenios.find(x => x.contrato_id === c.id) ?? null;
    const lqd = cp.loQueDebe(c, pagosC, deudasC, cv, hoy);
    const cuotaConv = cp.cuotaConvenioDelPeriodo(cv, c, hoy);
    const cubierto = !!(cv?.cubre_periodo_hasta && cv.cubre_periodo_hasta >= hoyISO);
    const estado = cp.calcularEstadoCartera(c, pagosC, hoy, cuotaConv, cubierto, cv);
    const dias = cp.diasEnMora(c, pagosC, hoy, cuotaConv, cubierto, cv);
    const esperado = {
      debe_hoy: lqd.totalFalta, cuota_toca: lqd.cuota.toca, cuota_falta: lqd.cuota.falta,
      acuerdo_toca: lqd.acuerdo?.toca ?? 0, acuerdo_falta: lqd.acuerdo?.falta ?? 0,
      acuerdo_cuota_este_periodo: lqd.acuerdo?.cuotaDelPeriodo ?? 0,
      deudas_falta: lqd.deudas.falta, saldo_a_favor: lqd.saldoAFavor,
      estado_cartera: estado, dias_mora: dias,
    };
    comparados++;
    for (const [campo, ts] of Object.entries(esperado)) {
      const sql = campo === "estado_cartera" ? v[campo] : num(v[campo]);
      const igual = campo === "estado_cartera" ? sql === ts : Math.abs(sql - ts) < 0.5;
      if (!igual) diffs.push({ placa: v.placa, cliente: v.cliente, campo, pantalla: ts, base: v[campo] });
    }
  }
  const porCampo = diffs.reduce((a, d) => { a[d.campo] = (a[d.campo] || 0) + 1; return a; }, {});
  console.log(`ESPEJO ${hoyISO}: ${comparados} contratos comparados · ${sinMotor} fuera del motor · ${sinFila} sin fila en la vitrina · ${diffs.length} diferencias`);
  console.log("por campo:", porCampo);
  console.table(diffs.slice(0, 60));
  window.__espejo = { comparados, sinMotor, sinFila, diffs, porCampo };
  return window.__espejo;
})();
