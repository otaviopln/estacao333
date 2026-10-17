/** @file Cutscene do chat dos óculos (primeira pessoa) que deduz o caso. */
import { CASES } from '../cases/registry.js';
import { say } from '../core/dialog.js';
import { povA, povEl, povH, povMem, povU } from '../core/dom.js';
import { gameState } from '../core/state.js';
import { setAdvice } from './hud.js';

let pov = null;

povEl.onclick = () => povAdvance();

export function sendPrompt() {
  say(CASES[gameState.caseIndex].povN || [["", "Os óculos entram em modo chat. A câmera passa para o ponto de vista do detetive."]], startPOV);
}

export function startPOV() {
  const c = CASES[gameState.caseIndex], ord = c.ord || c.mem.map((_, i) => i), full = c.pfx + ord.map((i) => c.mem[i][2] + c.mem[i][1]).join("") + "?";
  let acc = c.pfx.length;
  const ends = [];
  ord.forEach((i) => {
    acc += (c.mem[i][2] + c.mem[i][1]).length;
    ends[i] = acc;
  });
  pov = { full, reply: c.dir, n: 0, r: 0, ends, ready: false };
  gameState.cutscene = 3;
  gameState.fadeIn = 0.5;
  povMem.innerHTML = "";
  c.mem.forEach((m) => {
    const li = document.createElement("li");
    li.textContent = m[0];
    povMem.appendChild(li);
  });
  povU.textContent = "";
  povA.style.display = "none";
  povH.style.display = "none";
  povEl.style.display = "block";
  fitPov(c, full);
}

function fitPov(c, full) {
  povU.textContent = "DETETIVE ▸ " + full;
  povA.textContent = "ÓCULOS ▸ " + c.dir;
  povA.style.display = "block";
  povH.style.display = "block";
  for (const el of [document.getElementById("povL"), document.getElementById("povR")]) {
    let fs = 5.5;
    el.style.fontSize = "calc(var(--s)*" + fs + "px)";
    while (fs > 3.4 && el.scrollHeight > el.clientHeight + 1) {
      fs -= 0.25;
      el.style.fontSize = "calc(var(--s)*" + fs.toFixed(2) + "px)";
    }
  }
  povU.textContent = "";
  povA.textContent = "";
  povA.style.display = "none";
  povH.style.display = "none";
}

export function povTick(dt) {
  if (!pov) return;
  if (!pov.ready) {
    if (pov.n < pov.full.length) pov.n = Math.min(pov.full.length, pov.n + dt * 38);
    else if (pov.r < pov.reply.length) pov.r = Math.min(pov.reply.length, pov.r + dt * 45);
    else pov.ready = true;
  }
  povU.textContent = "DETETIVE ▸ " + pov.full.slice(0, pov.n | 0);
  Array.from(povMem.children).forEach((li, i) => {
    li.className = pov.n >= pov.ends[i] ? "on" : "";
  });
  const fullyTyped = pov.n >= pov.full.length;
  povA.style.display = fullyTyped ? "block" : "none";
  povA.textContent = fullyTyped ? "ÓCULOS ▸ " + pov.reply.slice(0, pov.r | 0) : "";
  povH.style.display = pov.ready ? "block" : "none";
}

export function povAdvance() {
  if (!pov) return;
  if (!pov.ready) {
    pov.n = pov.full.length;
    pov.r = pov.reply.length;
    return;
  }
  const c = CASES[gameState.caseIndex];
  pov = null;
  povEl.style.display = "none";
  gameState.cutscene = -1;
  gameState.caseSolved = true;
  gameState.fadeIn = 0.4;
  setAdvice(c.adv);
}

/** A fala do detetive ainda está sendo "digitada" na cutscene do chat? */
export function isPovTyping() {
  return !!pov && !pov.ready && pov.n < pov.full.length;
}
