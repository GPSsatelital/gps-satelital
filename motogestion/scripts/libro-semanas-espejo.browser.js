// PRUEBA ESPEJO DEL LIBRO DE SEMANAS (9-oct-2026) — arma el libro de cada contrato con los datos
// REALES y lo compara contra lo que dicen el contrato y Cartera:
//   · semanas pagadas del libro = `cajas_pagadas` · la de a medias = `caja_actual_pagado`
//   · las que debe = exigidas − pagadas, CADA UNA con la misma fecha de `desgloseExigible` (Cartera)
//   · días de la más vieja que debe = `diasEnMoraV2` · la próxima fecha = la de Cartera
// Si algo difiere, el libro diría una cosa y Cartera otra: no se sube.
//
// CÓMO SE CORRE: con `npm run dev` y la app abierta como ADMIN / ADMIN_PRINCIPAL, en la consola:
//   const m = await import('/scripts/libro-semanas-espejo.browser.js'); await m.medir()
// No escribe nada: solo lee.

export async function medir() {
  const lib = await import("/src/utils/libroSemanas.ts?t=" + Date.now());
  const cp = await import("/src/utils/cicloPago.ts");
  const { supabase } = await import("/src/lib/supabase.ts");
  // Supabase devuelve máximo 1.000 filas sin avisar: todo por páginas.
  async function todos(tabla, cols, filtro) {
    let out = [], desde = 0;
    for (let i = 0; i < 30; i++) {
      let q = supabase.from(tabla).select(cols).range(desde, desde + 999);
      if (filtro) q = filtro(q);
      const { data, error } = await q;
      if (error) throw error;
      out = out.concat(data || []);
      if (!data || data.length < 1000) break;
      desde += 1000;
    }
    return out;
  }
  const hoyISO = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
  const hoy = new Date(hoyISO + "T00:00:00");
  const cs = await todos("contratos", "*,motos(placa)", q => q.in("estado", ["Activo", "Suspendido"]));
  const pagos = await todos("pagos", "id,contrato_id,fecha,created_at,estado,valor,metodo,tipo_registro,aplicado_tarifa,aplicado_prorrateo", q => q.eq("estado", "Confirmado"));
  const acuerdos = await todos("acuerdos_tiempo_rodado", "contrato_id,decision,fecha_entrada,fecha_salida,dias_en_empresa", q => q.eq("decision", "rodar_al_final"));
  const llen = await todos("cajas_llenadas", "contrato_id,caja_numero,fecha,created_at");
  const rodD = await todos("rodados_por_deuda", "contrato_id,numero,created_at,cajas_corridas,estado");
  const by = arr => { const m = new Map(); arr.forEach(x => { if (!m.has(x.contrato_id)) m.set(x.contrato_id, []); m.get(x.contrato_id).push(x); }); return m; };
  const P = by(pagos), A = by(acuerdos), L = by(llen), R = by(rodD);

  let n = 0, errores = 0, conDetalle = 0, conFechas = 0;
  const fallas = [], avisoYaDebia = [], avisoRepetido = [];
  for (const c of cs) {
    if (!c.motor_v2 || c.forma_pago === "Diario") continue;
    n++;
    let l;
    try {
      l = lib.construirLibro(c, P.get(c.id) || [], hoy, { acuerdos: A.get(c.id) || [], rodadosDeuda: R.get(c.id) || [], llenadas: L.get(c.id) || [] });
    } catch (e) { errores++; fallas.push({ placa: c.motos?.placa, error: String(e) }); continue; }
    if (l.detallePagos) conDetalle++;
    if (l.fechasPagadas) conFechas++;
    if (l.avisos.some(a => a.includes("ya debía"))) avisoYaDebia.push(c.motos?.placa);
    if (l.avisos.some(a => a.includes("más de una vez"))) avisoRepetido.push(c.motos?.placa);
    const sem = l.filas.filter(f => f.tipo === "semana");
    const antes = l.filas.find(f => f.tipo === "antes")?.semanas ?? 0;
    const pagadas = c.cajas_pagadas ?? 0, enCurso = c.caja_actual_pagado ?? 0;
    const exig = cp.cajasExigidasHasta(c, hoy);
    const mal = [];
    const pagadasLibro = antes + sem.filter(s => s.estado === "pagada").length;
    if (pagadasLibro !== pagadas) mal.push(`pagadas ${pagadasLibro} vs ${pagadas}`);
    const medias = sem.find(s => s.estado === "a_medias");
    if (enCurso > 0 && (!medias || medias.pagado !== enCurso)) mal.push(`a medias ${medias?.pagado} vs ${enCurso}`);
    const deben = sem.filter(s => (s.estado === "debe" || s.estado === "a_medias") && s.numero <= exig);
    if (Math.max(exig - pagadas, 0) !== deben.length) mal.push(`deben ${deben.length} vs ${Math.max(exig - pagadas, 0)}`);
    const prorPend = Math.max((c.prorrateo_total ?? 0) - (c.prorrateo_pagado ?? 0), 0);
    if (deben[0] && prorPend === 0) { const dm = cp.diasEnMoraV2(c, hoy); if (dm !== deben[0].diasVencida) mal.push(`días ${deben[0].diasVencida} vs mora ${dm}`); }
    const des = cp.desgloseExigible(c, hoy);
    const prox = sem.find(s => s.estado === "proxima");
    if (prox && des.proximaFecha && prorPend === 0 && prox.seExige !== des.proximaFecha) mal.push(`próxima ${prox.seExige} vs ${des.proximaFecha}`);
    const fc = des.periodos.map(p => p.fecha).join(","), fl = deben.map(s => s.seExige).join(",");
    if (fc !== fl) mal.push(`fechas que debe: libro ${fl} vs Cartera ${fc}`);
    if (mal.length) fallas.push({ placa: c.motos?.placa, mal });
  }
  const r = { hoy: hoyISO, pagosLeidos: pagos.length, contratos: n, errores, conDiferencias: fallas.length,
    conDetallePagos: conDetalle, conFechasPagadas: conFechas, avisoYaDebia, avisoRepetido, fallas: fallas.slice(0, 20) };
  console.log(`LIBRO ${hoyISO}: ${n} contratos · ${errores} errores · ${fallas.length} con diferencias`);
  return r;
}
