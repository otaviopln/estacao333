/** @file Cena do tribunal (final do caso 2). */
import { SCREEN_H, SCREEN_W } from '../../core/config.js';
import { gameState } from '../../core/state.js';
import { ctx, drawDisc, drawLine, drawSprite, pixelText, rect } from '../../render/canvas.js';
import { npcPalette, npcRows, POLICE_PAL } from '../../sprites/characters.js';
import { COND2_PAL, COND_ROWS, OT_STAND, OTAVIO_PAL, POLICE_ROWS, WES_PAL, WES_ROWS } from './data.js';

const JUIZA = npcRows({ hair: "long", glasses: true }).slice(0, 17);

const JUIZA_PAL = npcPalette({ u: "#3a2418", t: "#c99670", a: "#15121c", A: "#0c0a10", g: "#e9e4f8", x: "#c9a44a" });

let gavelT = 0;

let lastLine = null;

export function drawTribunal() {
  if (gameState.dialogLine !== lastLine) {
    lastLine = gameState.dialogLine;
    if (gameState.dialogLine && (gameState.dialogLine[1].includes("culpados") || gameState.dialogLine[1].includes("encerrada"))) gavelT = 0.5;
  }
  if (gavelT > 0) gavelT -= 1 / 60;
  rect(0, 0, SCREEN_W, SCREEN_H, "#2a1a12");
  rect(0, 0, SCREEN_W, 60, "#d9cdb0");
  for (let x = 0; x < SCREEN_W; x += 32) rect(x, 0, 1, 60, "#c9bc9a");
  rect(0, 58, SCREEN_W, 3, "#8a5a32");
  rect(0, 61, SCREEN_W, 51, "#5a3a22");
  for (let x = 0; x < SCREEN_W; x += 16) {
    rect(x, 61, 1, 51, "#4a2e1a");
    rect(x + 3, 66, 10, 40, "#63412a");
  }
  for (const wx of [12, 214]) {
    rect(wx, 8, 30, 40, "#8ab0c8");
    rect(wx + 14, 8, 2, 40, "#e9e4d8");
    rect(wx, 26, 30, 2, "#e9e4d8");
    rect(wx - 2, 6, 34, 2, "#8a5a32");
  }
  ctx.globalCompositeOperation = "lighter";
  for (let y = 48; y < 130; y++) {
    const s = (y - 48) * 0.5;
    rect(14 + s, y, 26, 1, "rgba(255,240,200,.025)");
    rect(212 - s, y, 26, 1, "rgba(255,240,200,.025)");
  }
  ctx.globalCompositeOperation = "source-over";
  drawDisc(128, 22, 13, "#8a6a2a");
  drawDisc(128, 22, 11, "#2a4a8a");
  rect(127, 13, 2, 16, "#e8c86a");
  rect(119, 16, 18, 1, "#e8c86a");
  drawLine(120, 17, 117, 24, "#e8c86a");
  drawLine(120, 17, 123, 24, "#e8c86a");
  rect(116, 24, 8, 1, "#e8c86a");
  drawLine(136, 17, 133, 24, "#e8c86a");
  drawLine(136, 17, 139, 24, "#e8c86a");
  rect(132, 24, 8, 1, "#e8c86a");
  rect(123, 29, 10, 2, "#e8c86a");
  rect(196, 10, 1, 60, "#8a8a8a");
  rect(197, 12, 20, 14, "#2a9a4a");
  for (let dy = -4; dy <= 4; dy++) {
    const w = 16 - Math.abs(dy) * 3;
    rect(207 - w / 2, 19 + dy, w, 1, "#e8d14a");
  }
  drawDisc(207, 19, 3, "#2a3a9a");
  rect(204, 19, 7, 1, "#e9e4f8");
  rect(60, 54, 136, 8, "#6b4430");
  rect(60, 54, 136, 1, "#8a5a40");
  drawSprite(JUIZA, JUIZA_PAL, 122, 37, false);
  const up = gavelT > 0.25;
  rect(141, up ? 44 : 50, 2, 7, "#5a3a22");
  rect(138, up ? 41 : 48, 8, 4, "#7a4a2a");
  if (gavelT > 0 && gavelT < 0.25) {
    rect(136, 52, 2, 1, "#fff1b8");
    rect(146, 52, 2, 1, "#fff1b8");
  }
  rect(56, 62, 144, 40, "#6b4430");
  rect(56, 62, 144, 2, "#8a5a40");
  for (let x = 64; x < 196; x += 22) rect(x, 68, 16, 28, "#5a3822");
  rect(112, 72, 32, 9, "#e9dfc2");
  pixelText("JUIZA", 118, 74, "#3a2418");
  rect(0, 112, SCREEN_W, 32, "#3a2418");
  for (let x = 0; x < SCREEN_W; x += 12) rect(x, 112, 1, 32, "#32200f");
  rect(8, 100, 58, 6, "#6b4430");
  rect(10, 106, 4, 10, "#4a2e1a");
  rect(60, 106, 4, 10, "#4a2e1a");
  drawSprite(COND_ROWS.slice(0, 15), COND2_PAL, 16, 86, false);
  rect(20, 95, 4, 1, "#e9e4f8");
  drawSprite(WES_ROWS.slice(0, 15), WES_PAL, 38, 86, false);
  rect(40, 97, 6, 2, "#e9e4f8");
  rect(28, 98, 6, 1, "#c0c0c8");
  rect(50, 98, 6, 1, "#c0c0c8");
  drawSprite(POLICE_ROWS, POLICE_PAL, 2, 80, false);
  rect(190, 100, 58, 6, "#6b4430");
  rect(192, 106, 4, 10, "#4a2e1a");
  rect(242, 106, 4, 10, "#4a2e1a");
  rect(204, 98, 10, 2, "#e9e4f8");
  drawSprite(OT_STAND.slice(0, 15), OTAVIO_PAL, 220, 86, true);
  rect(0, 128, SCREEN_W, 4, "#5a3822");
  rect(0, 128, SCREEN_W, 1, "#7a5a3a");
  const crowd = [[20, "#e9e4f8", "#8a3a5a"], [44, "#3a2a20", "#4a6a8a"], [68, "#d9d9e0", "#5a7a5a"], [150, "#15121c", "#3a8a5a"], [174, "#2a1a14", "#e2dccb"], [198, "#2a2436", "#6d7456"]];
  crowd.forEach(([x, hc, bc], i) => {
    rect(x, 132, 12, 12, bc);
    drawDisc(x + 6, 128, 5, hc);
    if (i === 5) {
      rect(x - 1, 122, 14, 2, "#2a2436");
      rect(x + 2, 119, 8, 3, "#2a2436");
    }
  });
  if (gavelT > 0) rect(0, 0, SCREEN_W, SCREEN_H, `rgba(255,240,200,${gavelT * 0.08})`);
}
