/** @file Áudio do caso 3: zumbido, batimentos, grito e música de perseguição. */
import { audioInit } from '../../audio/context.js';
import { gameState, player } from '../../core/state.js';
import { state3 } from './state.js';

let amb = null;

export function ambStart() {
  audioInit();
  if (!gameState.audioCtx || amb) return;
  const g = gameState.audioCtx.createGain();
  g.gain.value = 0;
  g.connect(gameState.audioCtx.destination);
  g.gain.setTargetAtTime(0.05, gameState.audioCtx.currentTime, 1);
  const f = gameState.audioCtx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 180;
  f.connect(g);
  const o1 = gameState.audioCtx.createOscillator();
  o1.type = "sawtooth";
  o1.frequency.value = 55;
  o1.connect(f);
  o1.start();
  const o2 = gameState.audioCtx.createOscillator();
  o2.type = "sawtooth";
  o2.frequency.value = 58.3;
  o2.connect(f);
  o2.start();
  amb = { g, o: [o1, o2], next: gameState.audioCtx.currentTime + 4, beat: 0 };
}

export function ambStop() {
  chaseStop();
  if (!amb) return;
  const a = amb;
  amb = null;
  a.g.gain.setTargetAtTime(0, gameState.audioCtx.currentTime, 0.4);
  setTimeout(() => {
    a.o.forEach((o) => {
      try {
        o.stop();
      } catch (e) {
      }
    });
  }, 1500);
}

export function noiseBurst(dur, vol, f0, f1) {
  if (!gameState.audioCtx) return;
  const n = gameState.audioCtx.sampleRate * dur | 0, b = gameState.audioCtx.createBuffer(1, n, gameState.audioCtx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = gameState.audioCtx.createBufferSource();
  s.buffer = b;
  const bp = gameState.audioCtx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 3;
  bp.frequency.setValueAtTime(f0, gameState.audioCtx.currentTime);
  bp.frequency.linearRampToValueAtTime(f1, gameState.audioCtx.currentTime + dur);
  const g = gameState.audioCtx.createGain();
  g.gain.setValueAtTime(vol, gameState.audioCtx.currentTime);
  g.gain.linearRampToValueAtTime(0, gameState.audioCtx.currentTime + dur);
  s.connect(bp);
  bp.connect(g);
  g.connect(gameState.audioCtx.destination);
  s.start();
}

export function screamSound() {
  if (!gameState.audioCtx) return;
  noiseBurst(0.7, 0.6, 3e3, 600);
  const o = gameState.audioCtx.createOscillator();
  o.type = "square";
  o.frequency.setValueAtTime(900, gameState.audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(140, gameState.audioCtx.currentTime + 0.7);
  const g = gameState.audioCtx.createGain();
  g.gain.setValueAtTime(0.18, gameState.audioCtx.currentTime);
  g.gain.linearRampToValueAtTime(0, gameState.audioCtx.currentTime + 0.75);
  o.connect(g);
  g.connect(gameState.audioCtx.destination);
  o.start();
  o.stop(gameState.audioCtx.currentTime + 0.8);
}

function thump() {
  if (!gameState.audioCtx) return;
  const o = gameState.audioCtx.createOscillator();
  o.frequency.value = 58;
  const g = gameState.audioCtx.createGain();
  g.gain.setValueAtTime(1e-4, gameState.audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.35, gameState.audioCtx.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(1e-4, gameState.audioCtx.currentTime + 0.18);
  o.connect(g);
  g.connect(gameState.audioCtx.destination);
  o.start();
  o.stop(gameState.audioCtx.currentTime + 0.2);
}

/* ---------- música de perseguição: violinos em tremolo, staccato e dissonantes ---------- */
let chase = null;

const CHASE_LOW = [50, 50, 51, 50, 50, 50, 53, 52, 50, 50, 51, 50, 56, 55, 53, 51];

const CHASE_HIGH = [74, 0, 75, 0, 74, 80, 0, 79, 74, 0, 75, 0, 81, 80, 79, 77];

function chaseNote(m, t0, dur, vol, bright) {
  const ac = gameState.audioCtx, f = 440 * Math.pow(2, (m - 69) / 12);
  const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
  const o2 = ac.createOscillator(); o2.type = "sawtooth"; o2.frequency.value = f * 1.006;
  const flt = ac.createBiquadFilter(); flt.type = "bandpass"; flt.frequency.value = bright; flt.Q.value = 0.9;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
  o.connect(flt); o2.connect(flt); flt.connect(g); g.connect(chase.master);
  o.start(t0); o2.start(t0); o.stop(t0 + dur + 0.02); o2.stop(t0 + dur + 0.02);
}

function chaseStart() {
  audioInit();
  const ac = gameState.audioCtx;
  if (!ac || chase) return;
  const master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
  const dly = ac.createDelay(); dly.delayTime.value = 0.19; const fb = ac.createGain(); fb.gain.value = 0.25;
  master.connect(dly); dly.connect(fb); fb.connect(dly); dly.connect(ac.destination);
  chase = { master, next: ac.currentTime + 0.05, i: 0 };
  master.gain.setTargetAtTime(0.5, ac.currentTime, 0.15);
  chase.timer = setInterval(() => {
    if (!chase) return;
    const step = 60 / 152 / 4;
    while (chase.next < ac.currentTime + 0.25) {
      const k = chase.i % 16, bar = Math.floor(chase.i / 16) % 4;
      chaseNote(CHASE_LOW[k] + (bar === 2 ? 1 : bar === 3 ? -2 : 0), chase.next, step * 0.9, 0.11, 900);
      if (CHASE_HIGH[k]) chaseNote(CHASE_HIGH[k] + (bar === 2 ? 1 : 0), chase.next, step * 1.6, 0.06, 2600);
      if (k === 0) chaseNote(38, chase.next, step * 14, 0.09, 300);
      chase.next += step; chase.i++;
    }
  }, 60);
}

function chaseStop() {
  if (!chase) return;
  const c = chase; chase = null;
  clearInterval(c.timer);
  c.master.gain.setTargetAtTime(0, gameState.audioCtx.currentTime, 0.35);
  setTimeout(() => { try { c.master.disconnect(); } catch (e) {} }, 2000);
}

let chaseCalm = 0;

function chaseUpdate(dt) {
  const r = state3.run, G = r && r.G;
  const hot = !!(G && G.on && r.js <= 0 && gameState.scene === "case" && gameState.caseIndex === 2 &&
    (r.phase === "escape" || r.sec === "corr" || r.phase === "hunt" && G.sec === r.sec && (G.st === "chase" || G.alert > 0)));
  if (hot) { chaseCalm = 1.2; chaseStart(); }
  else if (chase) { chaseCalm -= dt; if (chaseCalm <= 0) chaseStop(); }
}

export function ambTick(dt) {
  chaseUpdate(dt);
  if (!amb) return;
  if (gameState.audioCtx.currentTime > amb.next) {
    amb.next = gameState.audioCtx.currentTime + 5 + Math.random() * 7;
    noiseBurst(0.5, 0.08, 300 + Math.random() * 400, 120);
  }
  const G = state3.run && state3.run.G, near = G && G.on && G.sec === state3.run.sec ? Math.max(0, 1 - Math.abs(G.x - player.x) / 220) : 0;
  if (near > 0) {
    amb.beat -= dt;
    if (amb.beat <= 0) {
      amb.beat = 0.9 - near * 0.5;
      thump();
      setTimeout(thump, 140);
    }
  }
}
