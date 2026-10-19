/** @file Progresso por caso: salvar/carregar estado vivo, porcentagem, 'deixado de lado'. */
import { caseDone, gameState } from '../core/state.js';
import { setAdvice } from '../ui/hud.js';
import { CASES } from './registry.js';

export const CASE_TITLES = ["O sumiço da violinista", "A Lágrima do Sertão", "O fantasma da Estação 42"];

const caseLive = [null, null, null];

export const setAside = [false, false, false];

export let currentCase = -1;

function saveLive(i) {
  caseLive[i] = { found: gameState.cluesFound, solved: gameState.caseSolved, chatOn: gameState.promptStarted, advice: gameState.adviceText };
}

function loadLive(i) {
  const s = caseLive[i] || { found: 0, solved: false, chatOn: false, advice: "" };
  gameState.cluesFound = s.found;
  gameState.caseSolved = s.solved;
  gameState.promptStarted = s.chatOn;
  setAdvice(s.advice);
}

export function activateCase(i) {
  if (gameState.caseIndex !== i) {
    saveLive(gameState.caseIndex);
    loadLive(i);
    gameState.caseIndex = i;
    gameState.clueTotal = CASES[i].cl.length;
  }
  currentCase = i;
  setAside[i] = false;
}

function liveOf(i) {
  if (gameState.caseIndex === i) return { found: gameState.cluesFound, solved: gameState.caseSolved };
  return caseLive[i] || { found: 0, solved: false };
}

export function isStarted(i) {
  return !caseDone[i] && !!(CASES[i].started && CASES[i].started());
}

export function caseProgress(i) {
  if (caseDone[i]) return 100;
  if (!isStarted(i) || !CASES[i].progress) return 0;
  const { found, solved } = liveOf(i);
  return Math.max(0, Math.min(99, Math.round(CASES[i].progress(found, solved))));
}

export function caseSolvedFor(i) {
  return liveOf(i).solved;
}

export function finishCase(i) {
  if (currentCase === i) currentCase = -1;
  setAside[i] = false;
}

export function boardText(i) {
  if (caseDone[i]) return "100%";
  if (!isStarted(i)) return "---";
  return caseProgress(i) + "%";
}

export function resetProgress() {
  caseLive.fill(null);
  setAside.fill(false);
  currentCase = -1;
}
