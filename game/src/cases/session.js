/** @file Entrar e sair de um caso (transição estação ↔ vagão). */
import { clamp, SCREEN_W } from '../core/config.js';
import { say } from '../core/dialog.js';
import { caseDone, caseSave, gameState, player } from '../core/state.js';
import { setAdvice } from '../ui/hud.js';
import { activateCase } from './progress.js';
import { CASES } from './registry.js';

/** Posição X do detetive na estação ao sair de cada trem (plataformas 1, 2 e 3). */
const PLATFORM_STOP_X = [225, 335, 445];

export function enterCase(i) {
  activateCase(i);
  const def = CASES[i];
  gameState.caseIndex = i;
  gameState.clueTotal = def.cl.length;
  gameState.scene = "case";
  player.tx = null;
  player.pending = null;
  gameState.cameraX = 0;
  gameState.fadeIn = 0.5;
  if (def.enter) {
    def.enter();
    return;
  }
  gameState.worldWidth = def.W;
  player.x = def.sx;
  player.dir = 1;
  const sv = caseSave[i];
  if (sv && (!def.started || def.started())) {
    gameState.hotspots = sv.hs;
    if (gameState.caseSolved && !gameState.adviceText) setAdvice(def.adv || "");
    def.enterBack();
    return;
  }
  gameState.cluesFound = 0;
  gameState.caseSolved = false;
  gameState.promptStarted = false;
  def.enterFresh();
}

export function welcomeBack() {
  say([["Óculos", "De volta ao vagão. Pistas encontradas: " + gameState.cluesFound + " de " + gameState.clueTotal + "." + (gameState.caseSolved ? " Caso já deduzido: siga a orientação no canto da tela." : "")]]);
}

export function exitCase() {
  if (gameState.scene !== "case") return;
  caseSave[gameState.caseIndex] = caseDone[gameState.caseIndex] ? null : { hs: gameState.hotspots, found: gameState.cluesFound, solved: gameState.caseSolved, chatOn: gameState.promptStarted };
  gameState.scene = "station";
  gameState.worldWidth = 640;
  gameState.hotspots = gameState.stationHotspots;
  player.x = PLATFORM_STOP_X[gameState.caseIndex];
  player.tx = null;
  player.pending = null;
  gameState.cameraX = clamp(player.x - SCREEN_W / 2, 0, gameState.worldWidth - SCREEN_W);
  gameState.fadeIn = 0.5;
}
