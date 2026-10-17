/** @file Tema de violino sintetizado (túnel do caso 1). */
import { gameState } from '../core/state.js';
import { audioInit } from './context.js';

let mus = null;

const MEL = [
  [69, 2],
  [72, 1],
  [76, 1],
  [74, 2],
  [72, 1],
  [71, 1],
  [69, 2],
  [64, 2],
  [65, 2],
  [69, 1],
  [72, 1],
  [71, 2],
  [69, 1],
  [68, 1],
  [69, 4],
  [0, 1],
  [72, 2],
  [74, 1],
  [76, 1],
  [77, 2],
  [76, 1],
  [74, 1],
  [72, 2],
  [71, 2],
  [69, 3],
  [68, 1],
  [69, 4],
  [0, 2]
];

export function startMusic() {
  audioInit();
  if (!gameState.audioCtx || mus) return;
  const master = gameState.audioCtx.createGain();
  master.gain.value = 0;
  const dly = gameState.audioCtx.createDelay();
  dly.delayTime.value = 0.27;
  const fb = gameState.audioCtx.createGain();
  fb.gain.value = 0.38;
  const wet = gameState.audioCtx.createGain();
  wet.gain.value = 0.5;
  master.connect(gameState.audioCtx.destination);
  master.connect(dly);
  dly.connect(fb);
  fb.connect(dly);
  dly.connect(wet);
  wet.connect(gameState.audioCtx.destination);
  mus = { master, next: gameState.audioCtx.currentTime + 0.2, i: 0 };
  mus.timer = setInterval(schedMusic, 80);
}

function schedMusic() {
  if (!mus) return;
  const beat = 60 / 66;
  while (mus.next < gameState.audioCtx.currentTime + 0.4) {
    const [m, b] = MEL[mus.i % MEL.length], dur = b * beat;
    if (m) violinNote(m, mus.next, dur);
    mus.next += dur;
    mus.i++;
  }
}

function violinNote(m, t0, dur) {
  const f = 440 * Math.pow(2, (m - 69) / 12);
  const o = gameState.audioCtx.createOscillator();
  o.type = "sawtooth";
  o.frequency.value = f;
  const o2 = gameState.audioCtx.createOscillator();
  o2.type = "triangle";
  o2.frequency.value = f * 1.003;
  const lfo = gameState.audioCtx.createOscillator();
  lfo.frequency.value = 5.5;
  const lg = gameState.audioCtx.createGain();
  lg.gain.setValueAtTime(0, t0);
  lg.gain.linearRampToValueAtTime(f * 0.012, t0 + 0.35);
  lfo.connect(lg);
  lg.connect(o.frequency);
  lg.connect(o2.frequency);
  const flt = gameState.audioCtx.createBiquadFilter();
  flt.type = "lowpass";
  flt.frequency.value = 1800;
  flt.Q.value = 0.8;
  const g = gameState.audioCtx.createGain();
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(0.22, t0 + 0.09);
  g.gain.setValueAtTime(0.2, Math.max(t0 + 0.1, t0 + dur - 0.12));
  g.gain.linearRampToValueAtTime(0, t0 + dur + 0.05);
  o.connect(flt);
  o2.connect(flt);
  flt.connect(g);
  g.connect(mus.master);
  [o, o2, lfo].forEach((x) => {
    x.start(t0);
    x.stop(t0 + dur + 0.1);
  });
}

export function musicVol(v) {
  if (mus) mus.master.gain.setTargetAtTime(v, gameState.audioCtx.currentTime, 0.25);
}

export function stopMusic() {
  if (!mus) return;
  const m = mus;
  mus = null;
  clearInterval(m.timer);
  m.master.gain.setTargetAtTime(0, gameState.audioCtx.currentTime, 0.4);
  setTimeout(() => {
    try {
      m.master.disconnect();
    } catch (e) {
    }
  }, 2500);
}
