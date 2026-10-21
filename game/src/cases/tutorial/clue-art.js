/** @file Arte (pixel art) das pistas do caso 0, registrada em `CLUE_ART`. */
import { gameState } from "../../core/state.js";
import { drawDisc, drawLine, glow, rect } from "../../render/canvas.js";

export const TUTORIAL_CLUE_ART = {
  "Pasta do Departamento": (x, y) => {
    rect(x + 1, y + 10, 25, 2, "rgba(0,0,0,.3)");
    rect(x + 2, y, 10, 3, "#b88f4e"); rect(x, y + 2, 26, 9, "#c9a56a"); rect(x, y + 2, 26, 1, "#e0c288");
    rect(x + 3, y + 4, 20, 6, "#efe6cf"); rect(x + 5, y + 5, 10, 1, "#8a806a"); rect(x + 5, y + 7, 14, 1, "#8a806a");
    rect(x + 17, y + 4, 5, 3, "#b33a2e"); rect(x + 18, y + 5, 3, 1, "#efe6cf");
  },
  "Celular do motorista": (x, y) => {
    rect(x + 10, y + 16, 2, 6, "#0c0b12"); rect(x + 6, y + 15, 10, 3, "#1c1c28");
    rect(x + 3, y, 16, 17, "#0c0b12");
    const lit = (gameState.clock % 5) < 0.6;
    rect(x + 4, y + 1, 14, 14, lit ? "#2a6a9a" : "#101828");
    if (lit) { rect(x + 5, y + 3, 10, 2, "#efe6cf"); rect(x + 5, y + 6, 8, 2, "#efe6cf"); rect(x + 5, y + 9, 6, 2, "#8ac0e8"); glow(x + 11, y + 8, 14, 10, "rgba(120,190,255,.25)"); }
  },
  "Fechadura eletrônica": (x, y) => {
    rect(x, y, 12, 14, "#1c1c28"); rect(x, y, 12, 1, "#3a3a4e"); rect(x + 2, y + 2, 8, 4, "#0c0b12");
    rect(x + 3, y + 3, 6, 2, (gameState.clock * 2) % 2 < 1 ? "#5fe0ff" : "#1c4a5a");
    for (let k = 0; k < 6; k++) rect(x + 2 + (k % 3) * 3, y + 8 + Math.floor(k / 3) * 3, 2, 2, "#8a8a9e");
    rect(x + 9, y + 1, 2, 1, (gameState.clock * 3) % 2 < 1 ? "#ff3a2a" : "#5a1a14");
  },
  "Planta de evacuação": (x, y) => {
    rect(x, y, 24, 30, "#2a1b15"); rect(x + 1, y + 1, 22, 28, "#e9e2d0");
    [[3, 4, 18, 1], [3, 4, 1, 22], [20, 4, 1, 22], [3, 25, 18, 1], [3, 14, 8, 1], [11, 4, 1, 10], [14, 14, 6, 1]].forEach(([a, b, c, d]) => rect(x + a, y + b, c, d, "#5a5a6a"));
    drawLine(x + 6, y + 22, x + 6, y + 18, "#c8342a"); drawLine(x + 6, y + 18, x + 16, y + 18, "#c8342a"); drawLine(x + 16, y + 18, x + 16, y + 10, "#c8342a");
    ctxCircle(x + 16, y + 9, 3);
    rect(x + 4, y + 22, 3, 3, "#3a8a5a"); rect(x + 5, y + 6, 6, 1, "#c8342a"); rect(x + 6, y + 7, 4, 1, "#c8342a");
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

function ctxCircle(cx, cy, r) {
  for (let a = 0; a < 16; a++) { const ang = a / 16 * 6.2832; rect(Math.round(cx + Math.cos(ang) * r), Math.round(cy + Math.sin(ang) * r), 1, 1, "#c8342a"); }
  drawDisc(cx, cy, 0.5, "#c8342a");
}
