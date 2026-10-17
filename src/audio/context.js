/** @file Criação/retomada do AudioContext (política de autoplay dos navegadores). */
import { gameState } from '../core/state.js';

export function audioInit() {
  if (!gameState.audioCtx) {
    try {
      gameState.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      gameState.audioCtx = null;
    }
  }
  if (gameState.audioCtx && gameState.audioCtx.state === "suspended") gameState.audioCtx.resume();
}
