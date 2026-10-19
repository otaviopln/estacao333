/**
 * Ponto de entrada: liga os módulos e inicia o laço do jogo.
 * Nenhuma regra de jogo mora aqui — apenas composição.
 */
import './cases/index.js'; // registra os 3 casos em CASES (efeito colateral intencional)
import { installAmbient } from './audio/ambient.js';
import { boardText, caseProgress } from './cases/progress.js';
import { CASES } from './cases/registry.js';
import { openBoard, requestCase } from './cases/selection.js';
import { enterCase, exitCase } from './cases/session.js';
import { advance } from './core/dialog.js';
import { caseDone, gameState, player } from './core/state.js';
import { installFocusGuards, installInputHandlers } from './game/input.js';
import { installFinaleInput, installPlayButton, resetToMenu, startGame } from './game/lifecycle.js';
import { startLoop } from './game/loop.js';
import { installAchievements } from './platform/achievements.js';
import { installCover } from './ui/cover.js';
import { installMobile } from './ui/mobile.js';
import { povAdvance, startPOV } from './ui/pov.js';

installFocusGuards();
installFinaleInput();
installInputHandlers();
installAmbient();
installCover();
installPlayButton();
installMobile();
installAchievements();
startLoop();

// Gancho opcional para testes automatizados (ver tests/): só atua se o ambiente o definir.
if (typeof globalThis.__ESTACAO_TEST__ === 'function') {
  globalThis.__ESTACAO_TEST__({
    G: gameState, player, CASES, enterCase, startGame, resetToMenu, advance, povAdvance, startPOV, exitCase, caseDone,
    progress: { caseProgress, requestCase, openBoard, boardText },
  });
}
