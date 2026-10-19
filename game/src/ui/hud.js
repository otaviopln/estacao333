/** @file HUD: orientação dos óculos no canto da tela e menu de opções. */
import { adviceEl, choicesEl } from '../core/dom.js';
import { gameState } from '../core/state.js';

export function setAdvice(message) {
  gameState.adviceText = message;
  adviceEl.textContent = message ? "ÓCULOS ▸ " + message : "";
  adviceEl.style.display = message ? "block" : "none";
}

export function showOpts(question, opts) {
  gameState.choiceOpen = true;
  choicesEl.innerHTML = '<div class="q">' + question + "</div>";
  gameState.choiceHandlers = [];
  opts.forEach((o, i) => {
    const b = document.createElement("button");
    b.textContent = i + 1 + ". " + o.t;
    const f = () => {
      gameState.choiceOpen = false;
      choicesEl.style.display = "none";
      o.f();
    };
    b.onclick = f;
    gameState.choiceHandlers.push(f);
    choicesEl.appendChild(b);
  });
  choicesEl.style.display = "flex";
}
