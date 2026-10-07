// Rearma un MP4 "en pedazos" (fragmentado, como lo graba Chrome) en un MP4 normal de una sola pieza, con el
// índice al principio. Sin esto PowerPoint, Windows y muchos celulares leen "dura 0 segundos" y no lo
// reproducen (7-oct-2026). No vuelve a comprimir nada: solo cambia el orden y escribe el índice.
// Uso: node rearmar-mp4.mjs entrada.mp4 salida.mp4
import { readFileSync, writeFileSync } from "node:fs";

export function rearmar(b) {
  const cajas = (o, e) => {
    const r = [];
    while (o + 8 <= e) {
      let s = b.readUInt32BE(o), h = 8;
      const t = b.toString("latin1", o + 4, o + 8);
      if (s === 1) { s = Number(b.readBigUInt64BE(o + 8)); h = 16; } else if (s === 0) s = e - o;
      r.push({ t, o, s, ini: o + h, fin: o + s });
      o += s;
    }
    return r;
  };
  const hija = (c, t) => cajas(c.ini, c.fin).find(x => x.t === t);
  const hijas = (c, t) => cajas(c.ini, c.fin).filter(x => x.t === t);
  const raiz = cajas(0, b.length);
  const moov = raiz.find(c => c.t === "moov");
  if (!moov) throw new Error("no tiene índice (moov)");

  // Las pistas (video y audio) y sus valores por defecto
  const pistas = new Map();
  for (const trak of hijas(moov, "trak")) {
    const tkhd = hija(trak, "tkhd"), mdia = hija(trak, "mdia"), mdhd = hija(mdia, "mdhd");
    const id = b[tkhd.ini] ? b.readUInt32BE(tkhd.ini + 20) : b.readUInt32BE(tkhd.ini + 12);
    const escala = b[mdhd.ini] ? b.readUInt32BE(mdhd.ini + 20) : b.readUInt32BE(mdhd.ini + 12);
    const tipo = b.toString("latin1", hija(mdia, "hdlr").ini + 8, hija(mdia, "hdlr").ini + 12);
    pistas.set(id, { id, trak, tkhd, mdia, mdhd, escala, tipo, muestras: [], trozos: [], inicio: null, def: {} });
  }
  const mvex = hija(moov, "mvex");
  for (const trex of mvex ? hijas(mvex, "trex") : []) {
    const p = pistas.get(b.readUInt32BE(trex.ini + 4));
    if (p) p.def = { dur: b.readUInt32BE(trex.ini + 12), tam: b.readUInt32BE(trex.ini + 16), flags: b.readUInt32BE(trex.ini + 20) };
  }

  // Cada pedazo (moof) dice dónde están sus muestras dentro del mdat que lo sigue
  for (const moof of raiz.filter(c => c.t === "moof")) {
    let finAnterior = moof.o;
    for (const traf of hijas(moof, "traf")) {
      const tfhd = hija(traf, "tfhd");
      const ff = b.readUInt32BE(tfhd.ini) & 0xffffff;
      const p = pistas.get(b.readUInt32BE(tfhd.ini + 4));
      if (!p) throw new Error("pedazo de una pista que no existe");
      let q = tfhd.ini + 8, base;
      if (ff & 0x1) { base = Number(b.readBigUInt64BE(q)); q += 8; } else base = (ff & 0x20000) ? moof.o : finAnterior;
      if (ff & 0x2) q += 4;
      const dur = (ff & 0x8) ? b.readUInt32BE((q += 4) - 4) : p.def.dur;
      const tam = (ff & 0x10) ? b.readUInt32BE((q += 4) - 4) : p.def.tam;
      const flagsDef = (ff & 0x20) ? b.readUInt32BE((q += 4) - 4) : p.def.flags;
      const tfdt = hija(traf, "tfdt");
      const tiempo = tfdt ? (b[tfdt.ini] ? Number(b.readBigUInt64BE(tfdt.ini + 4)) : b.readUInt32BE(tfdt.ini + 4)) : null;
      if (p.inicio === null) p.inicio = tiempo ?? 0;
      let puntero = base;
      for (const trun of hijas(traf, "trun")) {
        const v = b[trun.ini], tf = b.readUInt32BE(trun.ini) & 0xffffff;
        const n = b.readUInt32BE(trun.ini + 4);
        let r = trun.ini + 8;
        if (tf & 0x1) { puntero = base + b.readInt32BE(r); r += 4; }
        let primeraFlags = null;
        if (tf & 0x4) { primeraFlags = b.readUInt32BE(r); r += 4; }
        const trozo = { pista: p.id, desde: puntero, cuantas: n, bytes: 0 };
        for (let i = 0; i < n; i++) {
          const m = { dur, tam, flags: i === 0 && primeraFlags !== null ? primeraFlags : flagsDef, cto: 0 };
          if (tf & 0x100) { m.dur = b.readUInt32BE(r); r += 4; }
          if (tf & 0x200) { m.tam = b.readUInt32BE(r); r += 4; }
          if (tf & 0x400) { m.flags = b.readUInt32BE(r); r += 4; }
          if (tf & 0x800) { m.cto = v ? b.readInt32BE(r) : b.readUInt32BE(r); r += 4; }
          trozo.bytes += m.tam;
          p.muestras.push(m);
        }
        if (trozo.desde + trozo.bytes > b.length) throw new Error("un pedazo apunta fuera del archivo");
        if (n) p.trozos.push(trozo);
        puntero += trozo.bytes;
      }
      finAnterior = puntero;
    }
  }

  // Escribir cajas
  const caja = (t, ...partes) => { const c = Buffer.concat(partes); const h = Buffer.alloc(8); h.writeUInt32BE(8 + c.length); h.write(t, 4, "latin1"); return Buffer.concat([h, c]); };
  const llena = (t, v, f, ...partes) => { const x = Buffer.alloc(4); x.writeUInt32BE(((v << 24) | f) >>> 0); return caja(t, x, ...partes); };
  const u32 = arr => { const x = Buffer.alloc(4 * arr.length); arr.forEach((n, i) => x.writeUInt32BE(n >>> 0, i * 4)); return x; };
  const i32 = arr => { const x = Buffer.alloc(4 * arr.length); arr.forEach((n, i) => x.writeInt32BE(n, i * 4)); return x; };
  const copia = c => Buffer.from(b.subarray(c.o, c.fin));
  const conDuracion = (c, enV1, enV0, valor) => { const x = copia(c); const h = c.ini - c.o; if (x[h]) x.writeBigUInt64BE(BigInt(valor), h + enV1); else x.writeUInt32BE(valor, h + enV0); return x; };

  const ESCALA = 1000; // la del mvhd original de Chrome
  const escalaPelicula = b[hija(moov, "mvhd").ini] ? b.readUInt32BE(hija(moov, "mvhd").ini + 20) : b.readUInt32BE(hija(moov, "mvhd").ini + 12);
  const lista = [...pistas.values()].filter(p => p.muestras.length);
  for (const p of lista) {
    p.duracion = p.muestras.reduce((s, m) => s + m.dur, 0);
    p.durPeli = Math.round(p.duracion * (escalaPelicula || ESCALA) / p.escala);
  }
  const todos = lista.flatMap(p => p.trozos).sort((x, y) => x.desde - y.desde);

  function armarMoov(desplazamientos) {
    const traks = lista.map(p => {
      const stts = [];
      for (const m of p.muestras) { const u = stts[stts.length - 1]; if (u && u[1] === m.dur) u[0]++; else stts.push([1, m.dur]); }
      const stsc = [];
      p.trozos.forEach((t, i) => { const u = stsc[stsc.length - 1]; if (!u || u[1] !== t.cuantas) stsc.push([i + 1, t.cuantas, 1]); });
      const conCto = p.muestras.some(m => m.cto !== 0);
      const ctts = [];
      if (conCto) for (const m of p.muestras) { const u = ctts[ctts.length - 1]; if (u && u[1] === m.cto) u[0]++; else ctts.push([1, m.cto]); }
      const sinc = [];
      p.muestras.forEach((m, i) => { if (!(m.flags & 0x10000)) sinc.push(i + 1); });
      const stbl = caja("stbl",
        copia(hija(hija(hija(p.mdia, "minf"), "stbl"), "stsd")),
        llena("stts", 0, 0, u32([stts.length, ...stts.flat()])),
        ...(conCto ? [llena("ctts", 1, 0, u32([ctts.length]), i32(ctts.flat()))] : []),
        ...(p.tipo === "vide" && sinc.length < p.muestras.length ? [llena("stss", 0, 0, u32([sinc.length, ...sinc]))] : []),
        llena("stsc", 0, 0, u32([stsc.length, ...stsc.flat()])),
        llena("stsz", 0, 0, u32([0, p.muestras.length, ...p.muestras.map(m => m.tam)])),
        llena("stco", 0, 0, u32([p.trozos.length, ...p.trozos.map(t => desplazamientos.get(t))])));
      const minf = hija(p.mdia, "minf");
      const minfNueva = caja("minf", ...cajas(minf.ini, minf.fin).filter(c => c.t !== "stbl").map(copia), stbl);
      const mdia = caja("mdia", conDuracion(p.mdhd, 24, 16, p.duracion), ...cajas(p.mdia.ini, p.mdia.fin).filter(c => !["mdhd", "minf"].includes(c.t)).map(copia), minfNueva);
      // Si una pista arranca después de la otra, una lista de edición lo dice (aquí arrancan juntas: 0)
      const retraso = Math.round((p.inicio || 0) * (escalaPelicula || ESCALA) / p.escala);
      const edts = retraso > 0 ? [caja("edts", llena("elst", 0, 0, u32([2, retraso, 0xffffffff, 0x00010000, p.durPeli, 0, 0x00010000])))] : [];
      return caja("trak", conDuracion(p.tkhd, 28, 20, p.durPeli + retraso), ...edts, mdia);
    });
    const mvhd = hija(moov, "mvhd");
    const total = Math.max(...lista.map(p => p.durPeli + Math.round((p.inicio || 0) * (escalaPelicula || ESCALA) / p.escala)));
    return caja("moov", conDuracion(mvhd, 24, 16, total), ...traks);
  }

  const ftyp = caja("ftyp", Buffer.from("isom", "latin1"), u32([0x200]), Buffer.from("isomiso2avc1mp41", "latin1"));
  const provisional = new Map(todos.map(t => [t, 0]));
  const tamMoov = armarMoov(provisional).length;
  let pos = ftyp.length + tamMoov + 8;
  const despl = new Map();
  for (const t of todos) { despl.set(t, pos); pos += t.bytes; }
  const moovFinal = armarMoov(despl);
  if (moovFinal.length !== tamMoov) throw new Error("el índice cambió de tamaño");
  const datos = Buffer.concat(todos.map(t => b.subarray(t.desde, t.desde + t.bytes)));
  const mdatH = Buffer.alloc(8); mdatH.writeUInt32BE(8 + datos.length); mdatH.write("mdat", 4, "latin1");
  return {
    archivo: Buffer.concat([ftyp, moovFinal, mdatH, datos]),
    resumen: lista.map(p => ({ pista: p.tipo === "vide" ? "video" : p.tipo === "soun" ? "audio" : p.tipo, muestras: p.muestras.length, segundos: +(p.duracion / p.escala).toFixed(2), saltos: p.muestras.filter(m => !(m.flags & 0x10000)).length })),
  };
}

if (process.argv[1] && process.argv[1].endsWith("rearmar-mp4.mjs") && process.argv.length >= 4) {
  const { archivo, resumen } = rearmar(readFileSync(process.argv[2]));
  writeFileSync(process.argv[3], archivo);
  console.log(JSON.stringify(resumen), (archivo.length / 1048576).toFixed(1) + " MB");
}
