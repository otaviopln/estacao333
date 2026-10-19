/** @file Arte (pixel art) das pistas do caso 3, registrada em `CLUE_ART`. */
import { gameState } from '../../core/state.js';
import { drawDisc, drawLine, rect } from '../../render/canvas.js';

export const CASE3_CLUE_ART = {
  "Crachá antigo": (x, y) => {
    drawLine(x + 7, y, x + 2, y + 3, "#3a6aaa");
    drawLine(x + 7, y, x + 12, y + 3, "#3a6aaa");
    rect(x + 2, y + 3, 11, 8, "#e9e4f8");
    rect(x + 3, y + 4, 4, 4, "#8a8090");
    rect(x + 4, y + 5, 2, 2, "#c99670");
    rect(x + 8, y + 5, 4, 1, "#5a5a6a");
    rect(x + 2, y + 9, 11, 2, "#b33a2e");
  },
  "USB no painel": (x, y) => {
    rect(x + 14, y + 10, 5, 3, "#c0c0c8");
    rect(x + 19, y + 9, 8, 5, "#2a6aca");
    rect(x + 19, y + 9, 8, 1, "#5a9aea");
    rect(x + 25, y + 11, 1, 1, gameState.clock % 0.6 < 0.3 ? "#5fe08a" : "#ff3a3a");
  },
  "Pegadas de bota": (x, y) => {
    for (let k = 0; k < 5; k++) {
      const px = x + 2 + k * 11, py = y + (k % 2 ? 7 : 2);
      rect(px, py, 5, 3, "#c9a530");
      rect(px + 6, py, 2, 3, "#c9a530");
      rect(px + 1, py + 1, 3, 1, "#a8862a");
      rect(px + 5, py + 3, 1, 1, "#d9b840");
    }
  },
  "Lâmpada do teto": (x, y) => {
    rect(x + 8, y, 6, 4, "#3a3550");
    rect(x + 9, y + 4, 4, 2, "#8a8aa0");
    const on = Math.sin(gameState.clock * 19) > 0.2 || Math.sin(gameState.clock * 3) > 0.7;
    rect(x + 12, y + 6, 5, 5, on ? "#fff1b8" : "#6a5a3a");
    rect(x + 15, y + 10, 3, 3, on ? "#fff1b8" : "#6a5a3a");
  },
  "Cheiro de ozônio": (x, y) => {
    const ph = gameState.clock * 3 % 1;
    for (let k = 0; k < 3; k++) {
      const bx = x + 3 + k * 7, by = y + 4 + (k * 5 + (gameState.clock * 4 | 0)) % 9;
      drawLine(bx, by, bx + 2, by + 2, "#9fe0ff");
      drawLine(bx + 2, by + 2, bx, by + 4, "#9fe0ff");
    }
    if (ph < 0.15) {
      rect(x + 10, y + 8, 1, 1, "#ffffff");
      rect(x + 9, y + 9, 3, 1, "#bff3ff");
    }
  },
  "Bilhete assustador": (x, y) => {
    rect(x, y, 10, 8, "#d9c48a");
    rect(x + 1, y + 2, 8, 1, "#6a1414");
    rect(x + 1, y + 4, 6, 1, "#6a1414");
    rect(x + 2, y + 6, 5, 1, "#6a1414");
  },
  "Projetor escondido": (x, y) => {
    rect(x, y, 18, 6, "#2a2a34");
    drawDisc(x + 9, y + 7, 3, "#1a1a22");
    drawDisc(x + 9, y + 7, 1, gameState.clock % 1 < 0.6 ? "#9fe0ff" : "#2a5a6a");
  },
};
