/** @file Cutscene genérica de encerramento (três atos) e seu desenho. */
import { say } from '../core/dialog.js';
import { caseDone, gameState } from '../core/state.js';
import { drawHolo } from '../game/render.js';
import { setAdvice } from '../ui/hud.js';
import { finishCase } from './progress.js';
import { CASES } from './registry.js';
import { exitCase } from './session.js';

export function startCut() {
  const c = CASES[gameState.caseIndex].cut;
  gameState.cutscene = 0;
  gameState.fadeIn = 0.5;
  say(c.a, () => {
    gameState.cutscene = 1;
    gameState.fadeIn = 0.5;
    say(c.card, () => {
      gameState.cutscene = 2;
      gameState.fadeIn = 0.5;
      say(c.b, () => {
        gameState.cutscene = -1;
        caseDone[gameState.caseIndex] = true;
        finishCase(gameState.caseIndex);
        setAdvice("");
        exitCase();
        say([["Óculos", "Caso " + (gameState.caseIndex + 1) + " encerrado." + (caseDone.every(Boolean) ? " Todos os casos foram resolvidos." : " Os outros casos esperam no quadro de partidas.")]]);
      });
    });
  });
}

export function drawCut() {
  if (gameState.cutscene === 3) {
    drawHolo();
    return;
  }
  CASES[gameState.caseIndex].drawCut();
}
