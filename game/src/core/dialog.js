/** @file Fila de diálogos com efeito de digitação (`say`) e avanço de falas (`advance`). */
import { dlg, txtEl, whoEl } from './dom.js';
import { personalize, playerName } from './profile.js';
import { gameState } from './state.js';

export const DETECTIVE = "Detetive";

const GLASSES = "Óculos";

const MEMORY = "Memória";

export function say(lines, fn) {
  gameState.dialogQueue = lines.slice();
  gameState.dialogAfter = fn || null;
  nextLine();
}

function nextLine() {
  if (!gameState.dialogQueue.length) {
    gameState.dialogLine = null;
    dlg.style.display = "none";
    const f = gameState.dialogAfter;
    gameState.dialogAfter = null;
    if (f) f();
    return;
  }
  const wasOpen = !!gameState.dialogLine;
  const [speaker, line] = gameState.dialogQueue.shift();
  gameState.dialogLine = [speaker, personalize(line)];
  gameState.dialogShown = 0;
  const who = gameState.dialogLine[0];
  const isGlasses = who === GLASSES || who === MEMORY;
  whoEl.textContent = isGlasses ? "◈ " + (who === MEMORY ? "MEMÓRIA REGISTRADA" : "ÓCULOS") : who === DETECTIVE ? playerName() : who;
  txtEl.textContent = "";
  const kind = !who ? "narr" : isGlasses ? "glass" : "";
  const changed = !wasOpen || dlg.dataset.kind !== kind;
  dlg.className = kind;
  dlg.dataset.kind = kind;
  dlg.style.display = "block";
  if (changed) {
    dlg.classList.remove("enter");
    void dlg.offsetWidth;
    dlg.classList.add("enter");
  }
}

export function advance() {
  if (!gameState.dialogLine) return;
  if (gameState.dialogShown < gameState.dialogLine[1].length) {
    gameState.dialogShown = gameState.dialogLine[1].length;
  } else nextLine();
}
