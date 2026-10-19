/** @file Rotação/queda de sprites (desmaios, quedas). */
import { pixColor, rect } from './canvas.js';

export function spriteRot(rows, pal, px, py, ang, flip) {
  const L = rows.length, w = rows[0].length, ca = Math.cos(ang), sa = Math.sin(ang), cx = w / 2, Rr = Math.ceil(Math.hypot(w, L)) + 1;
  for (let dy = -Rr; dy <= Rr; dy++) for (let dx = -Rr; dx <= Rr; dx++) {
    const sx = dx * ca + dy * sa, sy = -dx * sa + dy * ca, i = Math.floor(sx + cx), r = Math.floor(sy + L);
    if (i < 0 || i >= w || r < 0 || r >= L) continue;
    const ch = rows[r][flip ? w - 1 - i : i];
    if (ch === ".") continue;
    rect(px + dx, py + dy, 1, 1, pixColor(pal, ch));
  }
}

export function fallAng(p) {
  return p < 0.82 ? Math.PI / 2 * Math.pow(p / 0.82, 2) : Math.PI / 2 * (1 + 0.07 * Math.sin((p - 0.82) / 0.18 * Math.PI));
}

export function fallY(base, p) {
  return base + (122 - base) * Math.pow(Math.min(1, p / 0.82), 2);
}
