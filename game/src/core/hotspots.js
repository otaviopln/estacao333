/** @file Busca do hotspot (objeto/pessoa interativa) sob um ponto do cenário. */
import { gameState } from './state.js';

export function hit(wx, y) {
  for (let i = gameState.hotspots.length - 1; i >= 0; i--) {
    const h = gameState.hotspots[i];
    if (wx >= h.x && wx < h.x + h.w && y >= h.y && y < h.y + h.h) return h;
  }
  return null;
}
