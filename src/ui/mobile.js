/** @file Suporte a celular: tela cheia, controles de toque e aviso de orientação. */
import { gameState } from '../core/state.js';
import { fit, IS_TOUCH } from '../render/viewport.js';

const fsRoot = typeof document.documentElement !== "undefined" ? document.documentElement : null;

function fsSupported() {
  return !!fsRoot && !!(document.fullscreenEnabled || document.webkitFullscreenEnabled) && !!(fsRoot.requestFullscreen || fsRoot.webkitRequestFullscreen);
}

function fsIsFull() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

export function enterFullscreen() {
  if (!fsSupported() || fsIsFull()) return;
  const req = fsRoot.requestFullscreen || fsRoot.webkitRequestFullscreen;
  const p = req.call(fsRoot);
  const lock = () => { try { const o = screen.orientation; if (IS_TOUCH && o && o.lock) o.lock("landscape").catch(() => {}); } catch (e) {} };
  if (p && p.then) p.then(lock).catch(() => {}); else lock();
}

function exitFullscreen() {
  if (!fsIsFull()) return;
  (document.exitFullscreen || document.webkitExitFullscreen).call(document);
}

function toggleFullscreen() { if (fsIsFull()) exitFullscreen(); else enterFullscreen(); }

function sendTouchKey(type, key) {
  if (typeof KeyboardEvent === "undefined" || typeof dispatchEvent !== "function") return;
  dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, cancelable: true }));
}

function installTouchPad() {
  const pad = document.getElementById("touch");
  if (!pad || !pad.querySelectorAll) return;
  for (const b of pad.querySelectorAll("button[data-k]")) {
    const k = b.dataset.k;
    const press = (e) => { e.preventDefault(); e.stopPropagation(); if (b.classList.contains("down")) return; b.classList.add("down"); sendTouchKey("keydown", k); };
    const release = (e) => { if (e) e.preventDefault(); if (!b.classList.contains("down")) return; b.classList.remove("down"); sendTouchKey("keyup", k); };
    b.addEventListener("pointerdown", press);
    for (const ev of ["pointerup", "pointercancel", "pointerleave"]) b.addEventListener(ev, release);
    b.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  setInterval(() => { pad.classList.toggle("on", gameState.mode === "play" && gameState.cutscene < 0); }, 150);
}

export function installMobile() {
  if (!fsRoot || !fsRoot.classList) return;
  if (IS_TOUCH) fsRoot.classList.add("touch");
  const btn = document.getElementById("fsbtn");
  if (btn && btn.classList) {
    if (!fsSupported()) btn.classList.add("off");
    btn.addEventListener("click", (e) => { e.stopPropagation(); toggleFullscreen(); });
    btn.addEventListener("pointerdown", (e) => e.stopPropagation());
  }
  addEventListener("keydown", (e) => {
    if ((e.key === "f" || e.key === "F") && !e.repeat && !e.ctrlKey && !e.metaKey) toggleFullscreen();
  });
  const rot = document.getElementById("rotate");
  if (rot) rot.addEventListener("click", () => { fsRoot.classList.add("portrait-ok"); fit(); });
  installTouchPad();
  addEventListener("orientationchange", () => setTimeout(fit, 250));
}
