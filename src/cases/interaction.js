/** @file Interação com hotspots: análise dos óculos, coleta de pistas e disparo da dedução. */
import { say } from '../core/dialog.js';
import { gameState } from '../core/state.js';
import { scanWorthy, startObjScan } from '../ui/glasses.js';
import { sendPrompt } from '../ui/pov.js';

export function interact(h) {
  if (gameState.glassesOn && !gameState.objScan && scanWorthy(h)) {
    startObjScan(h, () => interactNow(h));
    return;
  }
  interactNow(h);
}

function interactNow(h) {
  if (h.go) {
    h.go();
    return;
  }
  const first = h.n === 0, lines = h.talk[Math.min(h.n, h.talk.length - 1)];
  h.n++;
  say(lines, h.clue ? () => {
    if (first) gameState.cluesFound++;
    if (gameState.cluesFound === gameState.clueTotal && !gameState.caseSolved && !gameState.promptStarted) {
      gameState.promptStarted = true;
      say([["Óculos", "Memórias suficientes. Iniciando modo chat."]], sendPrompt);
    }
  } : null);
}
