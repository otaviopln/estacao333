/** @file Primitivas de síntese (WebAudio): ruído, tons, estalos e laços agendados. */

/* Som ambiente: chuva com trovões na capa; gotas pingando e a música da sanfona na estação. */
let noiseBuf = null;

export function getNoise(ac) {
  if (noiseBuf) return noiseBuf;
  noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  const d = noiseBuf.getChannelData(0);
  let b = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b = 0.97 * b + 0.03 * w; d[i] = w * 0.6 + b * 2.2; }
  return noiseBuf;
}

export function tone(ac, dest, type, f, t0, dur, vol, attack, cutoff) {
  const o = ac.createOscillator(); o.type = type; o.frequency.value = f;
  const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + (attack || 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  if (cutoff) { const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = cutoff; o.connect(lp); lp.connect(g); } else o.connect(g);
  g.connect(dest); o.start(t0); o.stop(t0 + dur + 0.02);
}

export function noiseHit(ac, dest, t0, dur, vol, hp, lp) {
  const s = ac.createBufferSource(); s.buffer = getNoise(ac);
  const h = ac.createBiquadFilter(); h.type = "highpass"; h.frequency.value = hp;
  const l = ac.createBiquadFilter(); l.type = "lowpass"; l.frequency.value = lp;
  const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(h); h.connect(l); l.connect(g); g.connect(dest); s.start(t0, Math.random()); s.stop(t0 + dur + 0.02);
}

export const mf = (m) => 440 * Math.pow(2, (m - 69) / 12);

export function schedLoop(ac, makeStep, stepLen, vol) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  out.gain.setTargetAtTime(vol, ac.currentTime, 0.6);
  const st = { out, next: ac.currentTime + 0.1, i: 0 };
  st.timer = setInterval(() => {
    while (st.next < ac.currentTime + 0.3) { makeStep(st, st.next); st.next += stepLen; st.i++; }
  }, 70);
  return st;
}
