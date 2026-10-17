/** @file Simulação do gás sonífero (partículas e intensidade da névoa). */
import { clamp01 } from '../../core/config.js';
import { SRC_VENT, VENTS } from './data.js';
import { state2 } from './state.js';

export function gasLevel() {
  if (!state2.run) return 0;
  if (state2.run.phase === "gas") return clamp01((state2.run.gt - 0.9) / 2.2);
  if (state2.run.phase === "mask") return 1;
  if (state2.run.phase === "clear") return Math.max(0, 1 - state2.run.ct / 4);
  return 0;
}

export function gasParticles(dt, rate) {
  if (!state2.run.gp) state2.run.gp = [];
  if (rate > 0) for (const vx of VENTS[state2.run.sec] || []) {
    const r = rate * (vx === SRC_VENT ? 1.6 : 1);
    state2.run["acc" + vx] = (state2.run["acc" + vx] || 0) + dt * r;
    while (state2.run["acc" + vx] >= 1) {
      state2.run["acc" + vx]--;
      state2.run.gp.push({ x: vx + 6 + Math.random() * 12, y: 14, vx: (Math.random() - 0.5) * 10, vy: 10 + Math.random() * 12, r: 1 + Math.random(), a: 0.5, floor: 104 + Math.random() * 18 });
    }
  }
  for (const p of state2.run.gp) {
    p.vy += 14 * dt;
    p.y += p.vy * dt;
    p.x += p.vx * dt;
    p.r = Math.min(6, p.r + dt * 2.2);
    if (p.y > p.floor) p.a -= dt * 1.2;
  }
  state2.run.gp = state2.run.gp.filter((p) => p.a > 0);
}
