/** @file Máscara de escuridão com 'buracos' de luz (usada nos túneis e no caso 3). */
import { SCREEN_H, SCREEN_W } from '../core/config.js';

export const darknessMask = document.createElement("canvas");

darknessMask.width = SCREEN_W;

darknessMask.height = SCREEN_H;

export const darknessCtx = darknessMask.getContext("2d");

export function punchLight(cx, cy, r, a) {
  const g = darknessCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, `rgba(0,0,0,${a})`);
  g.addColorStop(0.55, `rgba(0,0,0,${a * 0.55})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  darknessCtx.fillStyle = g;
  darknessCtx.fillRect(cx - r, cy - r, r * 2, r * 2);
}
