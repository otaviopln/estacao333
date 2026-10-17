/** @file Cenário compartilhado dos vagões: casco, bancos, postes, portas e passageiros. */
import { gameState, player } from '../core/state.js';
import { ctx, drawSprite, glow, pixelText, rect, vgrad } from './canvas.js';
import { softShadow } from './detective.js';

export function carShell(wins, tint) {
  const w = gameState.worldWidth, t = gameState.clock;
  rect(0, 0, w, 100, tint || "#2a2540");
  vgrad(0, 10, w, 90, [[0, "rgba(255,225,180,.10)"], [0.55, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,.28)"]]);
  rect(0, 0, w, 10, "#1a1730");
  rect(0, 9, w, 1, "#2e2850");
  rect(0, 10, w, 1, "#0d0b1a");
  rect(0, 13, w, 1, "#9a9ab4");
  rect(0, 14, w, 1, "#4b4a6e");
  rect(0, 5, w, 1, "#25204a");
  for (let x = 0; x < w; x += 40) {
    rect(x, 15, 1, 71, "#1c182f");
    rect(x + 1, 15, 1, 71, "rgba(255,255,255,.035)");
    for (const ry of [19, 82]) {
      rect(x + 3, ry, 1, 1, "#575377");
      rect(x + 36, ry, 1, 1, "#575377");
    }
  }
  rect(0, 86, w, 14, "#332c4d");
  rect(0, 86, w, 1, "#4a4068");
  rect(0, 87, w, 1, "rgba(255,255,255,.06)");
  rect(0, 98, w, 2, "#241f3a");
  for (const wx of wins) {
    rect(wx - 2, 22, 54, 32, "#141124");
    rect(wx - 2, 22, 54, 1, "#2b2750");
    rect(wx, 24, 50, 28, "#07060f");
    vgrad(wx, 24, 50, 28, [[0, "#0b0e26"], [1, "#1a1738"]]);
    for (let k = 0; k < 7; k++) {
      const fx = wx + ((k * 17 + t * 6) % 50 + 50) % 50;
      rect(fx, 44 + k % 3, 1, 1, k % 2 ? "#e8b04a" : "#a9bfff");
    }
    for (let k = 0; k < 4; k++) {
      const nx = wx + ((k * 23 - t * 38) % 50 + 50) % 50;
      rect(nx, 38 + k * 3, 4, 1, "rgba(255,200,110,.8)");
      rect(nx - 6, 38 + k * 3, 6, 1, "rgba(255,200,110,.25)");
    }
    rect(wx, 49, 50, 3, "#0a0914");
    ctx.save();
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = "#cfe0ff";
    ctx.beginPath();
    ctx.moveTo(wx + 8, 24);
    ctx.lineTo(wx + 20, 24);
    ctx.lineTo(wx + 8, 52);
    ctx.lineTo(wx - 4, 52);
    ctx.fill();
    ctx.restore();
    rect(wx - 2, 53, 54, 1, "#0a0914");
    rect(wx - 2, 54, 54, 1, "rgba(255,255,255,.07)");
  }
  rect(0, 100, w, 44, "#352f4a");
  vgrad(0, 100, w, 44, [[0, "rgba(255,230,190,.07)"], [1, "rgba(0,0,0,.30)"]]);
  for (const y of [106, 114, 124, 136]) rect(0, y, w, 1, "#2b2540");
  for (let x = 0; x < w; x += 8) rect(x, 101, 5, 1, "#d6aa45");
  for (let x = 6; x < w; x += 23) rect(x, 108 + x * 7 % 25, 3 + x % 4, 1, "rgba(0,0,0,.18)");
  for (let x = 40, i = 0; x < w - 30; x += 70, i++) {
    const fl = Math.sin(t * 31 + i * 5) > 0.985 ? 0.55 : 1;
    rect(x, 10, 34, 2, "#f2ecd2");
    rect(x - 1, 12, 36, 1, "rgba(255,240,200,.25)");
    glow(x + 17, 12, 40, 22, `rgba(255,228,170,${0.16 * fl})`);
    glow(x + 17, 112, 34, 9, `rgba(255,228,170,${0.09 * fl})`);
  }
  for (let x = 36; x < w - 20; x += 56) {
    const sw = Math.sin(t * 1.7 + x * 0.09) * 1.5;
    ctx.strokeStyle = "#6a6a84";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 14);
    ctx.lineTo(x + sw, 25);
    ctx.stroke();
    ctx.strokeStyle = "#b9b9d0";
    ctx.beginPath();
    ctx.ellipse(x + sw, 27, 1.8, 2.2, 0, 0, 6.2832);
    ctx.stroke();
  }
}

export function bench(x0, x1) {
  const w = x1 - x0;
  rect(x0, 74, w, 18, "#5e2a35");
  rect(x0, 74, w, 1, "#8a4658");
  rect(x0, 75, w, 1, "rgba(255,255,255,.10)");
  for (let x = x0 + 10; x < x1; x += 12) {
    rect(x, 76, 1, 15, "#4e2230");
    rect(x - 1, 83, 3, 1, "#7a3a48");
  }
  rect(x0, 92, w, 3, "#7a3a48");
  rect(x0, 92, w, 1, "#9a5060");
  rect(x0, 95, w, 5, "#3a1a22");
  rect(x0, 100, w, 3, "rgba(0,0,0,.28)");
  for (let x = x0 + 4; x < x1; x += 22) rect(x, 95, 2, 5, "#6a6a84");
  rect(x0 - 1, 74, 2, 19, "#7a3a48");
  rect(x1 - 1, 74, 2, 19, "#4e2230");
}

export function pole(x) {
  rect(x - 1, 12, 4, 88, "rgba(0,0,0,.15)");
  rect(x, 12, 2, 88, "#8a8aa0");
  rect(x, 12, 1, 88, "#c4c4d8");
  rect(x, 98, 2, 2, "#4a4a5e");
}

export function drawNPC(n) {
  const f = n.fix === false ? false : n.fixLeft ? true : player.x < n.x + 6;
  const top = n.sit ? 74 : 98;
  const by = Math.sin(gameState.clock * (n.sit ? 1.4 : 1.8) + n.x * 0.17) * 0.28;
  if (!n.sit) softShadow(n.x + 6, 120, 7, 0.3);
  drawSprite(n.rows, n.pal, n.x, top + by, f);
  if (n.prop) n.prop(n.x, top + by, f);
}

export function drawDoor(x, label, col, right) {
  rect(x, 22, 16, 78, "#141124");
  rect(x + 2, 24, 12, 76, "#1b1828");
  rect(x + 5, 36, 6, 12, "#0c0b16");
  rect(x + 3, 18, 10, 2, col);
  pixelText(label, right ? gameState.worldWidth - 2 - label.length * 4 : 1, 12, col);
}
