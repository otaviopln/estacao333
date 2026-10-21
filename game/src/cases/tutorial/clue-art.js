/** @file Arte (pixel art) das pistas do caso 0, registrada em `CLUE_ART`. */
import { gameState } from "../../core/state.js";
import { drawDisc, drawLine, glow, rect } from "../../render/canvas.js";

export const TUTORIAL_CLUE_ART = {
  "Copo de água na pia": (x, y) => {
    rect(x, y + 2, 12, 8, "#2a2a38"); rect(x + 1, y + 1, 10, 6, "#e9e2d0"); rect(x + 1, y + 1, 10, 1, "#b8b8cc");
    rect(x + 2, y + 2, 8, 1, "#c8d4e8"); rect(x + 6, y + 2, 1, 1, "#8a806a"); rect(x + 8, y + 3, 1, 1, "#8a806a");
    rect(x + 4, y + 5, 1, 2, "#d6cdb4"); rect(x + 7, y + 4, 1, 2, "#d6cdb4");
    rect(x + 1, y + 7, 10, 1, "#4a4a58"); rect(x + 1, y + 8, 10, 2, "#3a3a4a");
  },
  "Fechadura eletrônica": (x, y) => {
    rect(x, y, 12, 14, "#1c1c28"); rect(x, y, 12, 1, "#3a3a4e"); rect(x + 2, y + 2, 8, 4, "#0c0b12");
    rect(x + 3, y + 3, 6, 2, (gameState.clock * 2) % 2 < 1 ? "#5fe0ff" : "#1c4a5a");
    for (let k = 0; k < 6; k++) rect(x + 2 + (k % 3) * 3, y + 8 + Math.floor(k / 3) * 3, 2, 2, "#8a8a9e");
    rect(x + 9, y + 1, 2, 1, (gameState.clock * 3) % 2 < 1 ? "#ff3a2a" : "#5a1a14");
  },
  "Janela do quarto": (x, y) => {
    // brasa do cigarro do motorista e o brilho do cano, lá embaixo
    const on = (gameState.clock * 1.3) % 2 < 1.2;
    rect(x + 44, y + 40, 1, 1, on ? "#ff8a3a" : "#8a3a1a");
    if (on) glow(x + 44, y + 40, 8, 5, "rgba(255,138,58,.35)");
  },
  "Telefone do quarto": (x, y) => {
    rect(x, y + 4, 12, 5, "#15121c"); rect(x + 1, y + 2, 10, 2, "#2a2a38"); rect(x - 1, y + 1, 14, 2, "#15121c");
    rect(x + 5, y + 5, 2, 2, "#3a3a4a");
    if ((gameState.clock * 2) % 2 < 1) { rect(x + 9, y + 5, 2, 1, "#ff3a2a"); glow(x + 10, y + 5, 8, 5, "rgba(255,58,42,.35)"); }
  },
};
