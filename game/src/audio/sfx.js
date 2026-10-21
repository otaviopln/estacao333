/** @file Efeitos sonoros pontuais: apagão do trem, rato, tiroteio, porta arrombada, ronco do trem e sons do final do jogo. */
import { gameState } from '../core/state.js';
import { audioInit } from './context.js';
import { getNoise, mf, noiseHit, tone } from './synth.js';

/* ---------- sons das luzes do trem (apagão do caso 1) ---------- */
export function lightsFlickerSfx() {
  audioInit();
  const ac = gameState.audioCtx;
  if (!ac) return;
  const t0 = ac.currentTime;
  const hum = ac.createOscillator(); hum.type = "square"; hum.frequency.value = 120;
  const hl = ac.createBiquadFilter(); hl.type = "lowpass"; hl.frequency.value = 900;
  const hg = ac.createGain(); hg.gain.setValueAtTime(0.0001, t0);
  for (let k = 0; k < 9; k++) { const tk = t0 + k * 0.075 + Math.random() * 0.03; hg.gain.setValueAtTime(k % 2 ? 0.0001 : 0.06, tk); }
  hg.gain.setValueAtTime(0.0001, t0 + 0.72);
  hum.connect(hl); hl.connect(hg); hg.connect(ac.destination); hum.start(t0); hum.stop(t0 + 0.75);
  for (let k = 0; k < 7; k++) noiseHit(ac, ac.destination, t0 + Math.random() * 0.68, 0.025 + Math.random() * 0.03, 0.18 + Math.random() * 0.15, 1500, 9000);
}

export function lightsOffSfx() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  const t0 = ac.currentTime;
  noiseHit(ac, ac.destination, t0, 0.22, 0.55, 40, 500);
  tone(ac, ac.destination, "sine", 95, t0, 0.5, 0.45, 0.004);
  const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(880, t0); o.frequency.exponentialRampToValueAtTime(45, t0 + 0.9);
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400;
  const g = ac.createGain(); g.gain.setValueAtTime(0.07, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.95);
  o.connect(lp); lp.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + 1);
  tone(ac, ac.destination, "triangle", 2600, t0 + 0.12, 0.25, 0.05, 0.002);
}

export function lightsOnSfx() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  const t0 = ac.currentTime;
  for (let k = 0; k < 3; k++) noiseHit(ac, ac.destination, t0 + k * 0.09, 0.03, 0.22, 2000, 9000);
  const o = ac.createOscillator(); o.type = "square"; o.frequency.setValueAtTime(55, t0); o.frequency.exponentialRampToValueAtTime(120, t0 + 0.5);
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700;
  const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.07, t0 + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.1);
  o.connect(lp); lp.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + 1.15);
}

export function ratSqueak() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  const t0 = ac.currentTime;
  for (let k = 0; k < 2 + (Math.random() * 2 | 0); k++) {
    const s = t0 + k * 0.09, f = 3200 + Math.random() * 1600;
    const o = ac.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(f, s); o.frequency.exponentialRampToValueAtTime(f * 1.35, s + 0.03); o.frequency.exponentialRampToValueAtTime(f * 0.8, s + 0.06);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.05, s + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.07);
    o.connect(g); g.connect(ac.destination); o.start(s); o.stop(s + 0.08);
  }
}

/* ---------- sons do tiroteio ---------- */
function sfxOut(pan) {
  const ac = gameState.audioCtx;
  if (!ac) return null;
  const g = ac.createGain();
  if (ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(ac.destination); }
  else g.connect(ac.destination);
  const dly = ac.createDelay(); dly.delayTime.value = 0.085; const fb = ac.createGain(); fb.gain.value = 0.22;
  g.connect(dly); dly.connect(fb); fb.connect(dly); dly.connect(ac.destination);
  setTimeout(() => { try { g.disconnect(); dly.disconnect(); } catch (e) {} }, 1500);
  return g;
}

/** Disparo: estalo de ruído + um "tum" grave. det = mais perto e alto; bandit/cop = mais distantes. */
export function gunshot(kind) {
  audioInit();
  const ac = gameState.audioCtx;
  if (!ac) return;
  const cfg = kind === "det" ? { peak: 0.85, lp: 5200, pan: 0.35 } : kind === "cop" ? { peak: 0.5, lp: 3600, pan: 0.15 } : { peak: 0.62, lp: 3000, pan: -0.45 };
  const out = sfxOut(cfg.pan), t0 = ac.currentTime;
  if (!out) return;
  const src = ac.createBufferSource(); src.buffer = getNoise(ac);
  const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 160;
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(cfg.lp, t0); lp.frequency.exponentialRampToValueAtTime(700, t0 + 0.25);
  const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(cfg.peak, t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
  src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(out); src.start(t0, Math.random()); src.stop(t0 + 0.35);
  const o = ac.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(140, t0); o.frequency.exponentialRampToValueAtTime(40, t0 + 0.14);
  const og = ac.createGain(); og.gain.setValueAtTime(cfg.peak * 0.9, t0); og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
  o.connect(og); og.connect(out); o.start(t0); o.stop(t0 + 0.18);
}

/** Bala batendo em metal/cobertura. */
export function ricochet(delay) {
  const ac = gameState.audioCtx;
  if (!ac) return;
  const out = sfxOut(Math.random() * 0.6 - 0.3), t0 = ac.currentTime + (delay || 0.04);
  if (!out) return;
  const f = 2200 + Math.random() * 1400;
  const o = ac.createOscillator(); o.type = "triangle"; o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 0.45, t0 + 0.22);
  const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.24);
  o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + 0.26);
}

/** Clique seco (arma vazia) e estalos da recarga. */
export function gunClick(n) {
  const ac = gameState.audioCtx;
  if (!ac) return;
  const out = sfxOut(0.35);
  if (!out) return;
  for (let k = 0; k < (n || 1); k++) {
    const t0 = ac.currentTime + k * 0.16;
    const o = ac.createOscillator(); o.type = "square"; o.frequency.setValueAtTime(1800 - k * 500, t0);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.08, t0 + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.035);
    o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + 0.04);
  }
}

/* ---------- porta do corredor arrombada pelo fantasma ---------- */
export function doorKnock() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  noiseHit(ac, ac.destination, ac.currentTime, 0.2, 0.6, 30, 380);
  tone(ac, ac.destination, "sine", 72, ac.currentTime, 0.28, 0.5, 0.003);
}

export function doorCrash() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  const t0 = ac.currentTime;
  noiseHit(ac, ac.destination, t0, 0.5, 0.8, 40, 2500);
  tone(ac, ac.destination, "sine", 60, t0, 0.45, 0.6, 0.003);
  for (let k = 0; k < 6; k++) noiseHit(ac, ac.destination, t0 + 0.05 + Math.random() * 0.4, 0.04, 0.3, 1200, 6000);
  tone(ac, ac.destination, "triangle", 1900, t0 + 0.08, 0.35, 0.08, 0.002);
}

export function trainRumble(delay) {
  const ac = gameState.audioCtx;
  if (!ac) return;
  const t0 = ac.currentTime + (delay || 0);
  for (let k = 0; k < 8; k++) noiseHit(ac, ac.destination, t0 + k * 0.45 + (k % 2) * 0.1, 0.14, 0.14 * (k < 4 ? (k + 1) / 4 : (8 - k) / 4), 50, 600);
  const s = ac.createBufferSource(); s.buffer = getNoise(ac);
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 200;
  const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.35, t0 + 1.4); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 4);
  s.connect(lp); lp.connect(g); g.connect(ac.destination); s.start(t0); s.stop(t0 + 4.1);
}

/* ---------- sons do final do jogo ---------- */
export function clockTick(big) {
  const ac = gameState.audioCtx;
  if (!ac) return;
  noiseHit(ac, ac.destination, ac.currentTime, big ? 0.06 : 0.03, big ? 0.5 : 0.22, 2500, 9000);
  tone(ac, ac.destination, "sine", big ? 900 : 1300, ac.currentTime, big ? 0.25 : 0.08, big ? 0.12 : 0.05, 0.002);
  if (big) tone(ac, ac.destination, "sine", 220, ac.currentTime, 0.8, 0.12, 0.004);
}

export function stationChime() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  [[72, 0], [76, 0.35], [79, 0.7], [84, 1.05]].forEach(([m, d]) => tone(ac, ac.destination, "sine", mf(m), ac.currentTime + d, 1.3, 0.08, 0.01));
}

export function metalCreak() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  const t0 = ac.currentTime;
  const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(180, t0); o.frequency.linearRampToValueAtTime(140, t0 + 0.9);
  const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900; bp.Q.value = 6;
  const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.06, t0 + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1);
  o.connect(bp); bp.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + 1.05);
}

export function tarpFall() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  const t0 = ac.currentTime;
  const s = ac.createBufferSource(); s.buffer = getNoise(ac);
  const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.setValueAtTime(2400, t0); bp.frequency.exponentialRampToValueAtTime(500, t0 + 0.8);
  const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
  s.connect(bp); bp.connect(g); g.connect(ac.destination); s.start(t0); s.stop(t0 + 1);
  noiseHit(ac, ac.destination, t0 + 0.85, 0.35, 0.4, 40, 400);
}

export function redBeep() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  tone(ac, ac.destination, "square", 880, ac.currentTime, 0.12, 0.03, 0.002, 2000);
}

export function train04Horn() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  const t0 = ac.currentTime;
  for (const f of [98, 116.5, 146.8]) {
    const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.06, t0 + 0.3); g.gain.setValueAtTime(0.06, t0 + 1.6); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.4);
    o.connect(lp); lp.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + 2.5);
  }
}

export function train04Brake() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  const t0 = ac.currentTime;
  const o = ac.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(3400, t0); o.frequency.exponentialRampToValueAtTime(2200, t0 + 1.2);
  const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.05, t0 + 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.3);
  o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + 1.35);
  noiseHit(ac, ac.destination, t0 + 1.1, 1.4, 0.3, 2500, 9000);
}

/* ---------- prólogo: telefone, fogos de São João e o carro ---------- */
/** Telefone de disco: duas campainhas alternando ~25 vezes por segundo, durante 1 s. */
export function phoneRing() {
  audioInit();
  const ac = gameState.audioCtx;
  if (!ac) return;
  const t0 = ac.currentTime;
  for (let k = 0; k < 25; k++) tone(ac, ac.destination, "square", k % 2 ? 1380 : 1720, t0 + k * 0.04, 0.03, 0.05, 0.002, 4200);
}

export function receiverPickup() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  noiseHit(ac, ac.destination, ac.currentTime, 0.05, 0.3, 300, 3000);
  tone(ac, ac.destination, "sine", 140, ac.currentTime, 0.12, 0.12, 0.003);
}

/** Fogos distantes (a festa de São João lá fora): assobio subindo e estouro abafado. */
export function firework() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  const t0 = ac.currentTime;
  const o = ac.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(700, t0); o.frequency.exponentialRampToValueAtTime(2200, t0 + 0.4);
  const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.018, t0 + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.42);
  o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + 0.45);
  noiseHit(ac, ac.destination, t0 + 0.42, 0.45, 0.2, 90, 1400);
  tone(ac, ac.destination, "sine", 70, t0 + 0.42, 0.3, 0.12, 0.004);
}

export function carBrake() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  const t0 = ac.currentTime;
  noiseHit(ac, ac.destination, t0, 0.7, 0.1, 2200, 7000);
  const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(900, t0); o.frequency.exponentialRampToValueAtTime(380, t0 + 0.7);
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800;
  const g = ac.createGain(); g.gain.setValueAtTime(0.025, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.72);
  o.connect(lp); lp.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + 0.75);
}

export function carDoor() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  noiseHit(ac, ac.destination, ac.currentTime, 0.09, 0.4, 100, 1100);
  tone(ac, ac.destination, "sine", 90, ac.currentTime, 0.2, 0.3, 0.003);
  tone(ac, ac.destination, "sine", 1900, ac.currentTime + 0.05, 0.05, 0.05, 0.002);
}

/** Motor acelerando: o carro chega, ou parte, na rua. */
export function engineRev(up) {
  const ac = gameState.audioCtx;
  if (!ac) return;
  const t0 = ac.currentTime;
  const o = ac.createOscillator(); o.type = "sawtooth";
  o.frequency.setValueAtTime(up ? 46 : 92, t0); o.frequency.exponentialRampToValueAtTime(up ? 98 : 40, t0 + 1.6);
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 380;
  const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.13, t0 + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.7);
  o.connect(lp); lp.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + 1.75);
  noiseHit(ac, ac.destination, t0, 1.5, 0.06, 80, 700);
}

/** Aviso suave de que um passo do tutorial foi cumprido. */
export function tutorialDing() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  [[84, 0], [88, 0.09]].forEach(([m, d]) => tone(ac, ac.destination, "sine", mf(m), ac.currentTime + d, 0.35, 0.05, 0.005));
}

/** Fechadura eletrônica do hotel: bipe agudo + estalo da trava. */
export function lockBeep() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  const t0 = ac.currentTime;
  tone(ac, ac.destination, "square", 1760, t0, 0.07, 0.05, 0.002, 5000);
  tone(ac, ac.destination, "square", 2200, t0 + 0.1, 0.09, 0.05, 0.002, 5000);
  noiseHit(ac, ac.destination, t0 + 0.32, 0.05, 0.35, 400, 2600);
}

/** Interruptor de luz. */
export function switchClick() {
  const ac = gameState.audioCtx;
  if (!ac) return;
  noiseHit(ac, ac.destination, ac.currentTime, 0.03, 0.4, 1500, 5000);
  tone(ac, ac.destination, "square", 300, ac.currentTime, 0.03, 0.06, 0.001, 2000);
}
