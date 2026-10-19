/** @file Fim de jogo do caso 2: reinício por tempo esgotado e desistência. */
import { say } from '../../core/dialog.js';
import { caseSave, gameState } from '../../core/state.js';
import { setAdvice } from '../../ui/hud.js';
import { enterCase, exitCase } from '../session.js';
import { state2 } from './state.js';

export function c2Fail() {
  gameState.inputLocked = false;
  state2.run.camFix = null;
  say([["Óculos", "O trem chegou à próxima estação. No tumulto do desembarque, os ladrões sumiram com o diamante."], ["Óculos", "Recomeçando a investigação."]], () => {
    state2.run = null;
    caseSave[1] = null;
    gameState.cluesFound = 0;
    gameState.caseSolved = false;
    gameState.promptStarted = false;
    setAdvice("");
    enterCase(1);
  });
}

export function abandonCase2() {
  state2.run.camFix = null;
  setAdvice("");
  exitCase();
  caseSave[1] = null;
  state2.run = null;
  gameState.cluesFound = 0;
  gameState.caseSolved = false;
  gameState.promptStarted = false;
  say([["Óculos", "O caso 2 vai recomeçar do zero quando você voltar à plataforma 2."]]);
}
