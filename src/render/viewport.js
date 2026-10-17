/** @file Escala do canvas pixelado para a janela e detecção de dispositivo de toque. */
import { RENDER_SCALE, SCREEN_H, SCREEN_W } from '../core/config.js';
import { canvas } from './canvas.js';

export const gameEl = document.getElementById("game");

export const IS_TOUCH = typeof matchMedia === "function" && (matchMedia("(pointer: coarse)").matches || "ontouchstart" in globalThis);

export const labelEl = document.getElementById("label");

export function fit() {
  const full = typeof document.fullscreenElement !== "undefined" && !!(document.fullscreenElement || document.webkitFullscreenElement);
  const fill = IS_TOUCH || full;
  const r = Math.min(document.body.clientWidth / SCREEN_W, document.body.clientHeight / SCREEN_H) * (fill ? 1 : 0.98);
  const s = r >= 2 && !fill ? Math.floor(r) : Math.max(r, 0.5);
  gameEl.style.width = SCREEN_W * s + "px";
  gameEl.style.height = SCREEN_H * s + "px";
  gameEl.style.setProperty("--s", s);
  canvas.style.imageRendering = SCREEN_W * s >= SCREEN_W * RENDER_SCALE * 1.5 ? "pixelated" : "auto";
}

addEventListener("resize", fit);

if (typeof document.addEventListener === "function") {
  document.addEventListener("fullscreenchange", fit);
  document.addEventListener("webkitfullscreenchange", fit);
}

fit();
