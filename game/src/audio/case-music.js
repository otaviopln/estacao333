/** @file Trilhas dos casos (elevador, trem em movimento, ação) e chiado do gás — dirigidas por `CaseDefinition.audioCues()`. */
import { CASES } from '../cases/registry.js';
import { gameState } from '../core/state.js';
import { isAudioUnlocked } from './ambient.js';
import { getNoise, mf, noiseHit, schedLoop, tone } from './synth.js';

/* ---------- trilhas dos casos: elevador (caso 1), trem andando e ação (caso 2) ---------- */
const caseAud = { elev: null, train: null, action: null, car: null };

function stopLoop(key) {
  const st = caseAud[key], ac = gameState.audioCtx;
  if (!st || !ac) return;
  caseAud[key] = null; clearInterval(st.timer);
  st.out.gain.setTargetAtTime(0, ac.currentTime, 0.4);
  setTimeout(() => { try { st.out.disconnect(); if (st.noise) st.noise.stop(); if (st.eng) st.eng.stop(); } catch (e) {} }, 1800);
}

// caso 1: "música de elevador" em bossa nova suave (vibrafone, baixo e chocalho)
const ELEV_CHORDS = [[48, [64, 67, 71, 74]], [45, [64, 67, 72, 76]], [50, [65, 69, 72, 76]], [43, [65, 71, 74, 77]]];

const ELEV_MEL = [76, 0, 74, 72, 0, 74, 0, 0, 72, 0, 69, 67, 0, 69, 0, 0, 77, 0, 76, 74, 0, 72, 0, 0, 74, 0, 72, 71, 0, 67, 0, 0];

function elevStart(ac) {
  if (caseAud.elev) return;
  const step = 60 / 104 / 2;
  caseAud.elev = schedLoop(ac, (st, t0) => {
    const k = st.i % 32, bar = Math.floor(st.i / 8) % 4, [root, ch] = ELEV_CHORDS[bar];
    if (k % 8 === 0) tone(ac, st.out, "triangle", mf(root - 12), t0, step * 2.6, 0.09, 0.01, 500);
    if (k % 8 === 3) tone(ac, st.out, "triangle", mf(root - 5), t0, step * 1.6, 0.06, 0.01, 500);
    if (k % 8 === 2 || k % 8 === 5) ch.forEach((c) => tone(ac, st.out, "sine", mf(c), t0, step * 2.2, 0.018, 0.02));
    if (ELEV_MEL[k]) { tone(ac, st.out, "sine", mf(ELEV_MEL[k]), t0, step * 3, 0.04, 0.01); tone(ac, st.out, "sine", mf(ELEV_MEL[k]) * 4, t0, step * 0.8, 0.006, 0.005); }
    noiseHit(ac, st.out, t0, 0.05, k % 2 ? 0.012 : 0.02, 5000, 12000);
  }, step, 0.55);
}

// caso 2: trem em movimento (ronco grave contínuo + batidas dos trilhos)
function trainStart(ac) {
  if (caseAud.train) return;
  const beat = 0.56;
  const st = schedLoop(ac, (s, t0) => {
    const k = s.i % 4;
    if (k === 0 || k === 1) { noiseHit(ac, s.out, t0 + (k ? 0.11 : 0), 0.12, 0.12, 60, 700); tone(ac, s.out, "sine", 70, t0 + (k ? 0.11 : 0), 0.12, 0.08); }
  }, beat, 0.45);
  const src = ac.createBufferSource(); src.buffer = getNoise(ac); src.loop = true;
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 260;
  const g = ac.createGain(); g.gain.value = 0.22;
  const lfo = ac.createOscillator(); lfo.frequency.value = 0.4; const lg = ac.createGain(); lg.gain.value = 0.05; lfo.connect(lg); lg.connect(g.gain); lfo.start();
  src.connect(lp); lp.connect(g); g.connect(st.out); src.start();
  st.noise = src;
  caseAud.train = st;
}


// caso 0 (tutorial): dentro do carro — motor grave, ruído de pista e os "tum-tum" das emendas do asfalto
function carStart(ac) {
  if (caseAud.car) return;
  const st = schedLoop(ac, (s, t0) => {
    tone(ac, s.out, "sine", 62, t0, 0.14, 0.07, 0.004);
    if (s.i % 2) tone(ac, s.out, "sine", 58, t0 + 0.12, 0.12, 0.05, 0.004);
  }, 0.74, 0.5);
  const src = ac.createBufferSource(); src.buffer = getNoise(ac); src.loop = true;
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420;
  const g = ac.createGain(); g.gain.value = 0.2;
  src.connect(lp); lp.connect(g); g.connect(st.out); src.start();
  const eng = ac.createOscillator(); eng.type = "sawtooth"; eng.frequency.value = 47;
  const el = ac.createBiquadFilter(); el.type = "lowpass"; el.frequency.value = 150;
  const eg = ac.createGain(); eg.gain.value = 0.07;
  eng.connect(el); el.connect(eg); eg.connect(st.out); eng.start();
  st.noise = src; st.eng = eng;
  caseAud.car = st;
}

// caso 2: trilha de ação do tiroteio (bateria, baixo e cordas staccato)
const ACT_BASS = [40, 40, 52, 40, 43, 40, 47, 45];

const ACT_STAB = [[64, 67, 71], 0, 0, [64, 67, 71], 0, [65, 69, 72], 0, [62, 66, 69]];

function actionStart(ac) {
  if (caseAud.action) return;
  const step = 60 / 148 / 2;
  caseAud.action = schedLoop(ac, (st, t0) => {
    const k = st.i % 16, bar = Math.floor(st.i / 16) % 2;
    if (k % 4 === 0 || k === 14) { tone(ac, st.out, "sine", 120, t0, 0.18, 0.5, 0.003); tone(ac, st.out, "sine", 55, t0, 0.22, 0.4, 0.003); }
    if (k % 8 === 4) noiseHit(ac, st.out, t0, 0.16, 0.32, 900, 6000);
    noiseHit(ac, st.out, t0, 0.04, k % 2 ? 0.05 : 0.08, 7000, 14000);
    const b = ACT_BASS[(k >> 1) % 8] + (bar ? -2 : 0);
    if (k % 2 === 0) tone(ac, st.out, "sawtooth", mf(b), t0, step * 0.9, 0.09, 0.005, 700);
    const s = ACT_STAB[(k >> 1) % 8];
    if (s && k % 2 === 0) s.forEach((m) => tone(ac, st.out, "sawtooth", mf(m + (bar ? -2 : 0)), t0, step * 0.7, 0.03, 0.004, 2600));
  }, step, 0.5);
}

const NO_CUES = { loops: [], gas: null };

/**
 * Liga/desliga as trilhas conforme o caso atual pede (`CaseDefinition.audioCues()`).
 * Nomes de loops conhecidos: 'elevator', 'train', 'action', 'car'.
 */
export function caseMusic() {
  const ac = gameState.audioCtx;
  if (!ac || !isAudioUnlocked()) return;
  const inCase = gameState.mode === "play" && gameState.scene === "case" && gameState.cutscene < 0;
  const def = inCase ? CASES[gameState.caseIndex] : null;
  const cues = (def && def.audioCues && def.audioCues()) || NO_CUES;
  if (cues.loops.includes("elevator")) elevStart(ac); else stopLoop("elev");
  if (cues.loops.includes("train")) trainStart(ac); else stopLoop("train");
  if (cues.loops.includes("action")) actionStart(ac); else stopLoop("action");
  if (cues.loops.includes("car")) carStart(ac); else stopLoop("car");
  gasAudio(ac, cues.gas);
}

/* ---------- caso 2: chiado do gás sonífero saindo das ventilações ---------- */
let gasAud = null, lastGasPhase = null;

/** @param gas `null` ou `{ phase, near }` (near = 0..1: proximidade da grade de onde o gás sai). */
function gasAudio(ac, gas) {
  const phase = gas ? gas.phase : null;
  const on = phase === "gas" || phase === "mask";
  if (phase === "gas" && lastGasPhase !== "gas") {
    // estouro inicial: o registro abre e o gás sai sob pressão
    noiseHit(ac, ac.destination, ac.currentTime, 0.6, 0.45, 1500, 9000);
    tone(ac, ac.destination, "sine", 85, ac.currentTime, 0.35, 0.3, 0.004);
  }
  lastGasPhase = phase;
  if (on && !gasAud) {
    const src = ac.createBufferSource(); src.buffer = getNoise(ac); src.loop = true;
    const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 4200; bp.Q.value = 0.6;
    const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1800;
    const g = ac.createGain(); g.gain.value = 0;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.7; const lg = ac.createGain(); lg.gain.value = 0.02; lfo.connect(lg); lg.connect(g.gain); lfo.start();
    src.connect(hp); hp.connect(bp); bp.connect(g); g.connect(ac.destination); src.start();
    gasAud = { src, g, lfo };
  }
  if (gasAud) {
    let v = 0;
    if (phase === "gas") v = 0.22;
    else if (phase === "mask") {
      // com a máscara, o chiado fica mais forte perto da grade de onde o gás está saindo
      v = 0.04 + 0.16 * gas.near;
    }
    gasAud.g.gain.setTargetAtTime(v, ac.currentTime, 0.25);
    if (!on) {
      const a = gasAud; gasAud = null;
      setTimeout(() => { try { a.src.stop(); a.lfo.stop(); } catch (e) {} }, 1500);
    }
  }
}
