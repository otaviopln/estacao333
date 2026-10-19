/** @file Arte (pixel art) das pistas do caso 2, registrada em `CLUE_ART`. */
import { gameState } from '../../core/state.js';
import { drawDisc, rect } from '../../render/canvas.js';

export const CASE2_CLUE_ART = {
  "Perfurador de bilhetes": (x, y) => {
    rect(x + 1, y + 3, 10, 2, "#9aa0b4");
    rect(x + 1, y + 6, 10, 2, "#7a8094");
    rect(x + 9, y + 2, 2, 7, "#c0c6d8");
    rect(x + 1, y + 2, 3, 2, "#b33a2e");
    rect(x + 1, y + 6, 3, 2, "#b33a2e");
    rect(x + 10, y + 4, 1, 1, "#15121c");
  },
  "Câmera de segurança": (x, y) => {
    rect(x + 7, y, 3, 4, "#2a2a34");
    rect(x + 2, y + 4, 13, 6, "#3a3a48");
    rect(x + 2, y + 4, 13, 1, "#5a5a6a");
    rect(x + 12, y + 5, 6, 6, "#e86aa0");
    rect(x + 13, y + 6, 2, 1, "#ffb0d0");
    rect(x + 14, y + 11, 2, 2, "#e86aa0");
    rect(x + 3, y + 6, 1, 1, gameState.clock % 1 < 0.5 ? "#ff3a3a" : "#5a1a1a");
  },
  "Cafeteira da tripulação": (x, y) => {
    rect(x + 30, y + 14, 5, 8, "#e9dfc2");
    rect(x + 30, y + 14, 5, 1, "#c9b890");
    rect(x + 31, y + 16, 3, 2, "#7a4a2a");
    rect(x - 2, y + 15, 5, 7, "#e9dfc2");
    rect(x - 2, y + 15, 5, 1, "#c9b890");
    rect(x + 8, y - 6, 6, 5, "#3a3f4a");
    rect(x + 9, y - 5, 2, 1, "#9fd0e8");
    rect(x + 15, y - 6, 6, 5, "#3a3f4a");
    rect(x + 16, y - 5, 2, 1, "#9fd0e8");
    rect(x + 11, y - 8, 8, 1, "#8a6a4a");
  },
  "Máscara de gás": (x, y) => {
    rect(x + 3, y + 2, 10, 7, "#3a3f4a");
    rect(x + 4, y + 3, 3, 2, "#9fd0e8");
    rect(x + 9, y + 3, 3, 2, "#9fd0e8");
    drawDisc(x + 8, y + 8, 2, "#5a5f6a");
    rect(x + 7, y + 8, 2, 1, "#2a2a34");
    rect(x, y + 4, 3, 1, "#2a2a34");
    rect(x + 13, y + 4, 3, 1, "#2a2a34");
    rect(x + 5, y + 1, 2, 1, "#b33a2e");
  },
  "Maleta vazia": (x, y) => {
    rect(x, y + 1, 26, 4, "#3e2414");
    rect(x + 1, y + 2, 24, 2, "#2a3a7a");
    rect(x, y + 5, 26, 8, "#6b4430");
    rect(x + 1, y + 5, 24, 5, "#2a3a7a");
    rect(x + 10, y + 6, 5, 3, "#1a2450");
    rect(x + 11, y + 9, 3, 1, "#1a2450");
    rect(x + 2, y + 10, 2, 2, "#e8b04a");
    rect(x + 22, y + 10, 2, 2, "#e8b04a");
  },
  "Bilhete do agiota": (x, y) => {
    rect(x + 1, y + 2, 10, 7, "#d9d4c0");
    rect(x + 2, y + 3, 1, 1, "#b8b098");
    rect(x + 8, y + 6, 2, 1, "#b8b098");
    rect(x + 4, y + 3, 4, 3, "#b33a2e");
    rect(x + 5, y + 4, 1, 1, "#d9d4c0");
    rect(x + 7, y + 4, 1, 1, "#d9d4c0");
    rect(x + 4, y + 7, 4, 1, "#4a3a3a");
  },
  "Assento vazio": (x, y) => {
    rect(x + 2, y + 18, 12, 3, "#4e2230");
    rect(x + 3, y + 17, 10, 1, "#6a2a3a");
    rect(x + 5, y + 21, 6, 2, "#e8b04a");
    rect(x + 6, y + 21, 4, 1, "#c4507a");
  },
};
