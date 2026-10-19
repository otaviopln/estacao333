/** @file Registro da arte (pixel art) das pistas — cada caso registra a sua em `CLUE_ART` — e o brilho que marca pistas não coletadas. */
import { gameState } from '../core/state.js';
import { rect } from './canvas.js';

/**
 * Registro nome-da-pista -> função que a desenha em (x, y).
 * Cada caso registra a sua arte (`Object.assign(CLUE_ART, CASEN_CLUE_ART)` em caseN/index.js).
 * @type {Record<string, (x: number, y: number) => void>}
 */
export const CLUE_ART = {};

export function glint(x, y, ph) {
  const p = (gameState.clock + ph) % 3.2;
  if (p > 0.45) return;
  const a = 1 - Math.abs(p - 0.22) / 0.23;
  rect(x, y, 1, 1, `rgba(255,255,255,${a})`);
  rect(x - 1, y, 1, 1, `rgba(255,250,220,${a * 0.7})`);
  rect(x + 1, y, 1, 1, `rgba(255,250,220,${a * 0.7})`);
  rect(x, y - 1, 1, 1, `rgba(255,250,220,${a * 0.7})`);
  rect(x, y + 1, 1, 1, `rgba(255,250,220,${a * 0.7})`);
  if (a > 0.6) {
    rect(x - 2, y, 1, 1, `rgba(255,250,220,${a * 0.4})`);
    rect(x + 2, y, 1, 1, `rgba(255,250,220,${a * 0.4})`);
    rect(x, y - 2, 1, 1, `rgba(255,250,220,${a * 0.4})`);
    rect(x, y + 2, 1, 1, `rgba(255,250,220,${a * 0.4})`);
  }
}

export function drawClues() {
  for (const h of gameState.hotspots) {
    if (!h.clue) continue;
    const art = CLUE_ART[h.name];
    if (art) art(h.x, h.y);
    if (h.n === 0) glint(h.x + h.w - 2, h.y + 2, h.x * 0.37 % 3.2);
  }
}
