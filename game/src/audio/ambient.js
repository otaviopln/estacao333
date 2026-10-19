/** @file Som ambiente: chuva e trovões na capa; gotas, chuva abafada e sanfona na estação. */
import { gameState, player } from '../core/state.js';
import { SANFONEIRO } from '../scenes/station-life.js';
import { audioInit } from './context.js';
import { getNoise } from './synth.js';

const ambi = { rain: null, station: null, lastLightning: 0, unlocked: false };

function fadeOut(node, ac, then) {
  node.gain.setTargetAtTime(0, ac.currentTime, 0.4);
  setTimeout(then, 1800);
}

/* ---------- capa: chuva pesada, trovões e um grave sombrio ---------- */
function rainStart(ac) {
  if (ambi.rain) return;
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  out.gain.setTargetAtTime(0.5, ac.currentTime, 1.2);
  const src = ac.createBufferSource(); src.buffer = getNoise(ac); src.loop = true;
  const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 350;
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200;
  const g = ac.createGain(); g.gain.value = 0.16;
  src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(out); src.start();
  const lfo = ac.createOscillator(); lfo.frequency.value = 0.13; const lg = ac.createGain(); lg.gain.value = 0.05; lfo.connect(lg); lg.connect(g.gain); lfo.start();
  const drone = ac.createOscillator(); drone.type = "sawtooth"; drone.frequency.value = 43.6;
  const d2 = ac.createOscillator(); d2.type = "sawtooth"; d2.frequency.value = 46.2;
  const dl = ac.createBiquadFilter(); dl.type = "lowpass"; dl.frequency.value = 140;
  const dg = ac.createGain(); dg.gain.value = 0.05;
  drone.connect(dl); d2.connect(dl); dl.connect(dg); dg.connect(out); drone.start(); d2.start();
  ambi.rain = { out, nodes: [src, lfo, drone, d2] };
}

/** Trovão: estrondo grave que rola e some. Na estação chega mais abafado e com atraso (está longe). */
function thunderInto(ac, dest, peak, cutoff, delay) {
  const src = ac.createBufferSource(); src.buffer = getNoise(ac);
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = cutoff;
  const g = ac.createGain(); const t0 = ac.currentTime + delay;
  g.gain.setValueAtTime(0.0001, ac.currentTime); g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.18);
  g.gain.exponentialRampToValueAtTime(peak * 0.35, t0 + 0.9);
  g.gain.exponentialRampToValueAtTime(peak * 0.6, t0 + 1.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.6);
  src.connect(lp); lp.connect(g); g.connect(dest); src.start(); src.stop(t0 + 3.8);
}

function thunder(ac) {
  if (!ambi.rain) return;
  thunderInto(ac, ambi.rain.out, 0.9, 180, 0.25);
}

function rainStop(ac) {
  if (!ambi.rain) return;
  const r = ambi.rain; ambi.rain = null;
  fadeOut(r.out, ac, () => r.nodes.forEach((n) => { try { n.stop(); } catch (e) {} }));
}

/* ---------- estação: gotas e a sanfona do Seu Zé ---------- */
// Melodia original em ré menor, com cromatismo e trítono: clima de filme noir com mistério.
const ZE_MEL = [[62, 1], [65, 0.5], [69, 0.5], [68, 1], [69, 1], [65, 0.5], [64, 0.5], [62, 1], [61, 1], [0, 1],
  [62, 0.5], [65, 0.5], [70, 1], [69, 0.5], [67, 0.5], [65, 1], [64, 0.5], [65, 0.5], [64, 0.5], [61, 0.5], [62, 2],
  [69, 1], [72, 0.5], [70, 0.5], [69, 1], [68, 1], [67, 0.5], [65, 0.5], [64, 1], [63, 1], [0, 1],
  [62, 0.5], [64, 0.5], [65, 0.5], [68, 0.5], [69, 1], [61, 1], [62, 3], [0, 1]];

const ZE_BASS = [[38, [50, 53, 57]], [45, [49, 52, 55]], [38, [50, 53, 57]], [43, [50, 55, 58]], [46, [50, 53, 58]], [45, [49, 52, 55]], [38, [50, 53, 57]], [45, [49, 52, 55]]];

function reed(ac, dest, m, t0, dur, vol, bright) {
  const f = 440 * Math.pow(2, (m - 69) / 12);
  const o1 = ac.createOscillator(); o1.type = "square"; o1.frequency.value = f;
  const o2 = ac.createOscillator(); o2.type = "sawtooth"; o2.frequency.value = f * 1.004;
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = bright;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.05);
  g.gain.setValueAtTime(vol * 0.85, Math.max(t0 + 0.06, t0 + dur - 0.08)); g.gain.linearRampToValueAtTime(0, t0 + dur);
  const trem = ac.createOscillator(); trem.frequency.value = 5.6; const tg = ac.createGain(); tg.gain.value = vol * 0.18; trem.connect(tg); tg.connect(g.gain);
  o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(dest);
  [o1, o2, trem].forEach((o) => { o.start(t0); o.stop(t0 + dur + 0.05); });
}

function stationStart(ac) {
  if (ambi.station) return;
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const pan = ac.createStereoPanner ? ac.createStereoPanner() : null;
  const music = ac.createGain(); music.gain.value = 0;
  if (pan) { music.connect(pan); pan.connect(out); } else music.connect(out);
  const dly = ac.createDelay(); dly.delayTime.value = 0.32; const fb = ac.createGain(); fb.gain.value = 0.22;
  music.connect(dly); dly.connect(fb); fb.connect(dly); dly.connect(out);
  out.gain.setTargetAtTime(1, ac.currentTime, 0.8);
  // chuva lá fora, abafada pelas paredes da estação
  const rsrc = ac.createBufferSource(); rsrc.buffer = getNoise(ac); rsrc.loop = true;
  const rhp = ac.createBiquadFilter(); rhp.type = "highpass"; rhp.frequency.value = 220;
  const rlp = ac.createBiquadFilter(); rlp.type = "lowpass"; rlp.frequency.value = 1150;
  const rg = ac.createGain(); rg.gain.value = 0.065;
  rsrc.connect(rhp); rhp.connect(rlp); rlp.connect(rg); rg.connect(out); rsrc.start();
  const st = { out, music, pan, rain: rsrc, next: ac.currentTime + 0.4, i: 0, bar: 0, beat: 0 };
  const beat = 60 / 76;
  st.timer = setInterval(() => {
    if (ambi.station !== st) return;
    while (st.next < ac.currentTime + 0.3) {
      const [m, b] = ZE_MEL[st.i % ZE_MEL.length];
      const swing = b === 0.5 && st.beat % 1 === 0 ? 1.15 : b === 0.5 ? 0.85 : 1;
      const dur = b * beat * swing;
      if (m) reed(ac, music, m, st.next, dur * 0.95, 0.07, 2100);
      const whole = Math.floor(st.beat);
      if (Math.abs(st.beat - whole) < 1e-6) {
        const [root, chord] = ZE_BASS[Math.floor(whole / 4) % ZE_BASS.length];
        if (whole % 2 === 0) reed(ac, music, root, st.next, beat * 0.45, 0.06, 600);
        else chord.forEach((c) => reed(ac, music, c, st.next, beat * 0.35, 0.025, 1200));
      }
      st.beat += b; st.next += dur; st.i++;
    }
  }, 80);
  ambi.station = st;
}

function stationStop(ac) {
  if (!ambi.station) return;
  const st = ambi.station; ambi.station = null;
  clearInterval(st.timer);
  fadeOut(st.out, ac, () => { try { st.rain.stop(); st.out.disconnect(); } catch (e) {} });
}

/** Chamado a cada quadro: decide o que deve tocar. */
export function ambientAudio() {
  const ac = gameState.audioCtx;
  if (!ac || !ambi.unlocked) return;
  const cover = gameState.mode === "menu" || gameState.mode === "fade" && gameState.fadeTimer < 0.5;
  const station = gameState.mode === "play" && gameState.scene === "station" && gameState.cutscene < 0 && !gameState.finaleClock;
  if (cover) rainStart(ac); else rainStop(ac);
  if (station) stationStart(ac); else stationStop(ac);
  if (gameState.lightning > 0 && ambi.lastLightning <= 0) {
    if (ambi.rain) thunder(ac);
    else if (ambi.station && Math.random() < 0.6) thunderInto(ac, ambi.station.out, 0.32, 140, 0.4 + Math.random() * 1.2);
  }
  ambi.lastLightning = gameState.lightning;
  const st = ambi.station;
  if (st) {
    // a música vem da sanfona: mais alta perto do Seu Zé e do lado em que ele está
    const dx = SANFONEIRO.x + 6 - player.x, near = Math.max(0, 1 - Math.abs(dx) / 300);
    st.music.gain.setTargetAtTime(0.1 + 0.35 * near * near, ac.currentTime, 0.15);
    if (st.pan) st.pan.pan.setTargetAtTime(Math.max(-0.8, Math.min(0.8, dx / 160)), ac.currentTime, 0.15);
  }
}

export function installAmbient() {
  const unlock = () => { audioInit(); ambi.unlocked = !!gameState.audioCtx; };
  for (const ev of ["pointerdown", "keydown", "touchstart"]) addEventListener(ev, unlock, { passive: true });
}


/** O áudio já foi liberado por um gesto do usuário (política de autoplay)? */
export function isAudioUnlocked() {
  return ambi.unlocked;
}
