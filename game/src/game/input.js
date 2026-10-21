/** @file Entrada do jogador: teclado, mouse/toque no canvas e atalhos globais. */
import { activeCase, CASES } from '../cases/registry.js';
import { clamp, SCREEN_H, SCREEN_W } from '../core/config.js';
import { advance } from '../core/dialog.js';
import { fbtn, flb, frb, gbtn } from '../core/dom.js';
import { hit } from '../core/hotspots.js';
import { gameState, keys, mouse, player } from '../core/state.js';
import { canvas } from '../render/canvas.js';
import { coverPanelOpen } from '../ui/cover.js';
import { toggleGlasses } from '../ui/glasses.js';
import { povAdvance } from '../ui/pov.js';
import { profileFormOpen } from '../ui/profile-form.js';
import { requestStart, resetToMenu } from './lifecycle.js';

function toCanvas(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width * SCREEN_W, y: (e.clientY - r.top) / r.height * SCREEN_H };
}

export function installInputHandlers() {
  addEventListener("keydown", (e) => {
    const ac = activeCase();
    if (ac && ac.onKeyDown) ac.onKeyDown(e);
  }, true);
  fbtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ac = activeCase();
    if (ac && ac.onActionButton) ac.onActionButton();
  });
  addEventListener("keyup", (e) => CASES.forEach((c) => c.onKeyUp && c.onKeyUp(e)));
  [[flb, "l"], [frb, "r"]].forEach(([b, k]) => {
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      keys[k] = true;
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => b.addEventListener(ev, () => {
      keys[k] = false;
    }));
  });
  gbtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleGlasses();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "q" || e.key === "Q") toggleGlasses();
  });
  addEventListener("pageshow", (e) => {
    if (e.persisted) resetToMenu();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") resetToMenu();
  });
  canvas.addEventListener("pointermove", (e) => {
    const p = toCanvas(e);
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.in = true;
  });
  canvas.addEventListener("pointerleave", () => {
    mouse.in = false;
  });
  canvas.addEventListener("pointerdown", (e) => {
    if (gameState.audioCtx && gameState.audioCtx.state === "suspended") gameState.audioCtx.resume();
    const p = toCanvas(e);
    mouse.x = p.x;
    mouse.y = p.y;
    if (gameState.mode === "menu") return;
    if (gameState.mode === "play") {
      const ac = activeCase();
      if (ac && ac.onPointer && ac.onPointer(p)) return;
    }
    if (gameState.mode !== "play" || gameState.inputLocked) return;
    if (gameState.dialogLine) {
      advance();
      return;
    }
    const wx = p.x + gameState.cameraX, h = hit(wx, p.y);
    if (h) {
      player.tx = clamp(h.wx, 12, gameState.worldWidth - 12);
      player.pending = h;
    } else {
      player.tx = clamp(wx, 12, gameState.worldWidth - 12);
      player.pending = null;
    }
  });
  addEventListener("keydown", (e) => {
    const k = e.key;
    if (["ArrowLeft", "ArrowRight", " ", "Enter"].includes(k)) e.preventDefault();
    if (gameState.cutscene === 3) {
      if (k === "e" || k === "E" || k === " " || k === "Enter") povAdvance();
      return;
    }
    if (gameState.choiceOpen) {
      if (k >= "1" && k <= "3" && gameState.choiceHandlers[k - 1]) gameState.choiceHandlers[k - 1]();
      return;
    }
    if (gameState.mode === "menu") {
      if ((k === "Enter" || k === " ") && !coverPanelOpen() && !profileFormOpen()) requestStart();
      return;
    }
    if (k === "ArrowLeft" || k === "a" || k === "A") keys.l = true;
    if (k === "ArrowRight" || k === "d" || k === "D") keys.r = true;
    if (k === "e" || k === "E" || k === " " || k === "Enter") {
      if (gameState.mode !== "play" || gameState.inputLocked) return;
      if (gameState.dialogLine) {
        advance();
        return;
      }
      let best = null, bd = 28;
      for (const h of gameState.hotspots) {
        const d = Math.abs(h.wx - player.x);
        if (d < bd) {
          bd = d;
          best = h;
        }
      }
      if (best) {
        player.tx = best.wx;
        player.pending = best;
      }
    }
  });
  addEventListener("keyup", (e) => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") keys.l = false;
    if (k === "ArrowRight" || k === "d" || k === "D") keys.r = false;
  });
}

/**
 * Evita que Espaço/Enter "cliquem" no último botão focado (ex.: ÓCULOS) durante o jogo
 * e que o Espaço role a página.
 */
export function installFocusGuards() {
  addEventListener('keydown', (e) => {
    const focused = document.activeElement;
    if ((e.key === ' ' || e.key === 'Enter') && focused && focused.tagName === 'BUTTON' && gameState.mode === 'play') focused.blur();
  }, true);
  addEventListener('keyup', (e) => { if (e.key === ' ' && gameState.mode === 'play') e.preventDefault(); }, true);
}
