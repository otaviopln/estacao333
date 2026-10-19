/** @file Arte (pixel art) das pistas do caso 1, registrada em `CLUE_ART`. */
import { gameState } from '../../core/state.js';
import { drawLine, rect } from '../../render/canvas.js';

export const CASE1_CLUE_ART = {
  "Estojo do violino": (x, y) => {
    rect(x, y + 1, 26, 4, "#3e1e10");
    rect(x + 1, y + 2, 24, 2, "#5a2e1a");
    rect(x, y + 5, 26, 8, "#5a2e1a");
    rect(x + 1, y + 5, 24, 5, "#8a2a3a");
    rect(x + 3, y + 6, 7, 3, "#4e1420");
    rect(x + 10, y + 7, 3, 1, "#4e1420");
    rect(x + 13, y + 6, 6, 3, "#4e1420");
    rect(x + 19, y + 7, 6, 1, "#4e1420");
    rect(x + 2, y + 10, 2, 2, "#e8b04a");
    rect(x + 22, y + 10, 2, 2, "#e8b04a");
    rect(x, y + 12, 26, 1, "#2a140a");
  },
  "Bilhete de metrô": (x, y) => {
    rect(x + 1, y + 5, 15, 7, "rgba(0,0,0,.35)");
    rect(x, y + 4, 14, 7, "#f1e6c8");
    rect(x, y + 4, 14, 2, "#b33a2e");
    rect(x + 2, y + 8, 1, 1, "#2a2233");
    rect(x + 4, y + 8, 1, 1, "#2a2233");
    rect(x + 7, y + 7, 5, 1, "#8a806a");
    rect(x + 9, y + 8, 4, 2, "#7a4f8a");
  },
  "Pôster do concerto": (x, y) => {
    rect(x + 2, y + 2, 16, 7, "#e9dfc2");
    rect(x + 2, y + 2, 16, 2, "#b33a2e");
    rect(x + 7, y + 5, 3, 3, "#15121c");
    rect(x + 10, y + 6, 4, 1, "#15121c");
    for (let k = 0; k < 7; k++) rect(x + 18, y + 2 + k, 1, 1, k % 2 ? "#e9dfc2" : "rgba(0,0,0,0)");
    rect(x + 21, y + 3, 15, 6, "#e9dfc2");
    rect(x + 21, y + 3, 15, 1, "#b33a2e");
    for (let k = 0; k < 6; k++) rect(x + 21, y + 3 + k, 1, 1, k % 2 ? "#352f4a" : "#e9dfc2");
    rect(x + 24, y + 5, 9, 1, "#8a806a");
    rect(x + 24, y + 7, 6, 1, "#8a806a");
  },
  "Luz de emergência": (x, y) => {
    rect(x, y + 2, 26, 4, "#3a3550");
    rect(x + 2, y + 6, 22, 2, "#1b1726");
    rect(x + 3, y + 8, 3, 3, "#b33a2e");
    rect(x + 8, y + 8, 2, 4, "#8a2a2a");
    rect(x + 15, y + 8, 3, 2, "#b33a2e");
    rect(x + 20, y + 8, 2, 3, "#8a2a2a");
    rect(x + 12, y + 8, 1, 5, "#2a2233");
    if (gameState.clock * 7 % 2 < 0.25) {
      rect(x + 11, y + 13, 3, 1, "#fff1b8");
      rect(x + 12, y + 12, 1, 3, "#5fe0ff");
    }
  },
  "Painel da porta": (x, y) => {
    rect(x + 1, y + 1, 16, 24, "#4a4268");
    rect(x + 2, y + 2, 14, 22, "#5c5380");
    for (let k = 0; k < 12; k += 2) rect(x + 3 + k, y + 4, 1, 2, "#15121c");
    for (let k = 1; k < 12; k += 2) rect(x + 3 + k, y + 4, 1, 2, "#e8b04a");
    rect(x + 8, y + 9, 2, 4, "#3a3550");
    rect(x + 7, y + 13, 4, 7, "#b33a2e");
    rect(x + 6, y + 19, 6, 2, "#d9483a");
    drawLine(x + 3, y + 10, x + 6, y + 15, "#e9e4f8");
    drawLine(x + 12, y + 9, x + 15, y + 14, "#e9e4f8");
    drawLine(x + 4, y + 17, x + 6, y + 21, "#e9e4f8");
    rect(x + 13, y + 21, 2, 2, gameState.clock % 1 < 0.5 ? "#ff3a3a" : "#5a1a1a");
  },
  "Mancha na janela": (x, y) => {
    const c = "#0b0907";
    rect(x + 3, y + 7, 6, 6, c);
    rect(x + 3, y + 3, 1, 4, c);
    rect(x + 5, y + 2, 1, 5, c);
    rect(x + 7, y + 3, 1, 4, c);
    rect(x + 9, y + 5, 1, 3, c);
    rect(x + 2, y + 9, 1, 3, c);
    rect(x + 5, y + 13, 1, 5, c);
    rect(x + 8, y + 13, 1, 3, c);
    rect(x + 4, y + 8, 1, 1, "#5a5040");
    rect(x + 6, y + 4, 1, 1, "#5a5040");
  },
};
