/** @file Desenho e animação do detetive (andar, óculos, poeira dos passos). */
import { activeCase } from '../cases/registry.js';
import { gameState } from '../core/state.js';
import { detectiveSkin } from '../sprites/detective-skins.js';
import { ctx, drawSprite, rect } from './canvas.js';

const puffs = [];

let lastPhase = -1;

export function softShadow(x, feet, rx, alpha) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, feet - 0.4, rx, rx * 0.26, 0, 0, 6.2832);
  ctx.fill();
}

export function drawDetective(x, feet, dir, moving, walk) {
  const t = gameState.clock;
  const phase = moving ? Math.floor(walk / 0.12) % 4 : -1;
  const skin = detectiveSkin();
  const s = moving ? [skin.a, skin.idle, skin.b, skin.idle][phase] : skin.idle;
  const bob = moving ? phase % 2 ? -0.5 : 0 : Math.sin(t * 2.2) * 0.25;
  if (moving && (phase === 0 || phase === 2) && lastPhase !== phase) {
    puffs.push({ x: x - dir * 3, y: feet - 0.8, t0: t, vx: -dir * (3 + Math.random() * 3) });
  }
  lastPhase = moving ? phase : -1;
  softShadow(x, feet, 6.5 + (bob < 0 ? -0.5 : 0), 0.36);
  drawSprite(s, skin.pal, x - 6, feet - s.length + bob, dir < 0);
  const gx = x - 6, gy = feet - s.length + 5 + bob;
  const px = (col, row, c) => rect(dir < 0 ? gx + 11 - col : gx + col, row, 1, 1, c);
  if (gameState.glassesOn) {
    px(4, gy, "#2a2a3c");
    px(5, gy, "#2a2a3c");
    px(6, gy, "#5fe0ff");
    px(7, gy, t % 2.5 < 0.12 ? "#d8f8ff" : "#6fe4ff");
    px(8, gy, "#ff8a3a");
    px(9, gy, "#2a2a3c");
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(95,224,255,.12)";
    ctx.beginPath();
    ctx.arc(dir < 0 ? gx + 11 - 7 + 0.5 : gx + 7 + 0.5, gy + 0.5, 2.2, 0, 6.2832);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  } else px(8, gy + 7, "#3a8aa0");
  const ac = activeCase();
  if (ac && ac.drawPlayerAccessory) ac.drawPlayerAccessory(px, gy);
  for (let i = puffs.length - 1; i >= 0; i--) {
    const p = puffs[i], k = (t - p.t0) / 0.55;
    if (k >= 1 || k < 0) {
      puffs.splice(i, 1);
      continue;
    }
    ctx.fillStyle = `rgba(190,182,205,${0.32 * (1 - k)})`;
    ctx.beginPath();
    ctx.arc(p.x + p.vx * k * 0.5, p.y - k * 2.2, 0.7 + k * 1.7, 0, 6.2832);
    ctx.fill();
  }
}
