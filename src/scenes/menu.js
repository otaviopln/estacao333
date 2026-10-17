/** @file Efeitos visuais da capa (chuva e relâmpago sobre a arte). */
import { SCREEN_H, SCREEN_W } from '../core/config.js';
import { drops, gameState } from '../core/state.js';
import { rect } from '../render/canvas.js';

export function drawMenu() {
  rect(0, 0, SCREEN_W, 4, "rgba(5,6,14,.35)");
  for (const d of drops) rect(d.x, d.y, 1, 4, "rgba(170,190,240,.38)");
  if (gameState.lightning > 0) rect(0, 0, SCREEN_W, SCREEN_H, "rgba(180,190,255,.14)");
}
