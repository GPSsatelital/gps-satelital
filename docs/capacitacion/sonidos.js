// Los efectos de sonido y la línea de tiempo de los videos (pedido del dueño, 7-oct): un timbre suave antes de cada paso y otro,
// más grave, antes de un "Ojo". Se hacen con WebAudio —no hay archivos de sonido— y suenan ANTES de la voz,
// nunca encima. Volumen medido contra la voz: pico de la voz ~0,52 · pico del timbre 0,10.
// Lo usan grabar-video.html (los MP4) y presentacion.html (el reproductor de las diapositivas).
window.SONIDOS = {
  ANTES_DE_LA_VOZ: 0.5, // segundos entre el timbre y la voz
  // La línea de tiempo de un video: portada, cada escena (timbre, voz, pausa) y cierre. La usan quien graba
  // y quien comprueba, para que los dos cuenten igual.
  linea(duraciones) {
    const PORTADA = 3.0, PAUSA = 0.7, CIERRE = 3.0;
    let t = PORTADA;
    const escenas = duraciones.map(d => { const e = { ini: t, voz: t + this.ANTES_DE_LA_VOZ, fin: t + this.ANTES_DE_LA_VOZ + d + PAUSA }; t = e.fin; return e; });
    return { PORTADA, CIERRE, escenas, total: t + CIERRE };
  },
  tocar(ac, destino, tipo, cuando) {
    const NOTAS = {
      inicio: [523.25, 659.25, 783.99], // do-mi-sol, subiendo: empieza el video
      paso: [783.99, 1174.66], // sol-re: paso siguiente
      ojo: [493.88, 392.0], // si-sol, bajando: atención
      fin: [783.99, 1046.5], // sol-do: terminó
    };
    const VOL = { inicio: 0.09, paso: 0.1, ojo: 0.12, fin: 0.09 }[tipo];
    (NOTAS[tipo] || []).forEach((f, i) => {
      const t = cuando + i * 0.13;
      // Una campanita: la nota y un armónico más suave, que se apagan solos
      [[f, VOL, "sine"], [f * 2, VOL * 0.25, "sine"]].forEach(([hz, vol, forma]) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = tipo === "ojo" ? "triangle" : forma;
        o.frequency.value = hz;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
        o.connect(g); g.connect(destino);
        o.start(t); o.stop(t + 0.6);
      });
    });
  },
};
