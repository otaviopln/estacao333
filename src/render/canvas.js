/** @file Primitivas de desenho em pixel art: retângulos, linhas, discos, sprites com contorno, fonte bitmap e gradientes. */
import { RENDER_SCALE, SCREEN_H, SCREEN_W } from '../core/config.js';

export const canvas = document.getElementById("c");

export const ctx = canvas.getContext("2d");

canvas.width = SCREEN_W * RENDER_SCALE;

canvas.height = SCREEN_H * RENDER_SCALE;

const snap = (v) => Math.round(v * RENDER_SCALE) / RENDER_SCALE;

export function rect(x, y, w, h, c) {
  ctx.fillStyle = c;
  const x0 = snap(x), y0 = snap(y);
  ctx.fillRect(x0, y0, snap(x + w) - x0, snap(y + h) - y0);
}

export function drawText(str, x, y, color, size = 4, align = "left") {
  ctx.font = size + "px VT323, ui-monospace, monospace";
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

export function drawLine(x0, y0, x1, y1, c) {
  x0 |= 0;
  y0 |= 0;
  x1 |= 0;
  y1 |= 0;
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (; ; ) {
    rect(x0, y0, 1, 1, c);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) {
      e += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      e += dx;
      y0 += sy;
    }
  }
}

export function drawDisc(cx, cy, r, c) {
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r + r * 0.6) rect(cx + dx, cy + dy, 1, 1, c);
}

const shadeCache = /* @__PURE__ */ new Map();

function shade(hex, k = 0.78) {
  const key = hex + k;
  if (!shadeCache.has(key)) {
    const n = parseInt(hex.slice(1), 16), f = (v) => Math.round(v * k).toString(16).padStart(2, "0");
    shadeCache.set(key, "#" + f(n >> 16 & 255) + f(n >> 8 & 255) + f(n & 255));
  }
  return shadeCache.get(key);
}

export function pixColor(pal, ch) {
  if (pal[ch]) return pal[ch];
  if (ch === "T") return pal.t ? shade(pal.t) : pal.A;
  return SPR_FALL[ch] || pal.A;
}

const OUTLINE = "#0c0a12";

function drawOutline(rows, x, y, flip) {
  const w = rows[0].length, h = rows.length, solid = (r, i) => r >= 0 && r < h && i >= 0 && i < (rows[r] || "").length && rows[r][i] !== ".";
  for (let r = -1; r <= h; r++) for (let i = -1; i <= w; i++) {
    if (solid(r, i)) continue;
    if (solid(r - 1, i) || solid(r + 1, i) || solid(r, i - 1) || solid(r, i + 1)) rect(flip ? x + (w - 1 - i) : x + i, y + r, 1, 1, OUTLINE);
  }
}

export function drawSprite(rows, pal, x, y, flip) {
  const w = rows[0].length;
  if (pal.__out) drawOutline(rows, x, y, flip);
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === ".") continue;
      rect(flip ? x + (w - 1 - i) : x + i, y + r, 1, 1, pixColor(pal, ch));
    }
  }
}

const SPR_FALL = { x: "#15121c", l: "#9fd0e8", p: "#2b2a3c", m: "#d9d9d9" };

const FONT = {
  "0": "111101101101111",
  "1": "010110010010111",
  "2": "111001111100111",
  "3": "111001111001111",
  "4": "101101111001001",
  "5": "111100111001111",
  "6": "111100111101111",
  "7": "111001001001001",
  "8": "111101111101111",
  "9": "111101111001111",
  "A": "010101111101101",
  "B": "110101110101110",
  "C": "111100100100111",
  "D": "110101101101110",
  "E": "111100111100111",
  "H": "101101111101101",
  "I": "111010010010111",
  "L": "100100100100111",
  "O": "111101101101111",
  "P": "111101111100100",
  "R": "110101110101101",
  "J": "001001001101111",
  "X": "101101010101101",
  "Q": "111101101111001",
  "Z": "111001010100111",
  "F": "111100110100100",
  "N": "101111111101101",
  "G": "111100101101111",
  "V": "101101101101010",
  "M": "101111101101101",
  "U": "101101101101111",
  "S": "111100111001111",
  "T": "111010010010010",
  "?": "111001011000010",
  "!": "010010010000010",
  "%": "101001010100101",
  "-": "000000111000000",
  ".": "000000000000010",
  ":": "000010000010000"
};

export function pixelText(s, x, y, c) {
  let cx = x;
  for (const ch of s) {
    const g = FONT[ch];
    if (g) {
      for (let i = 0; i < 15; i++) if (g[i] === "1") rect(cx + i % 3, y + (i / 3 | 0), 1, 1, c);
    }
    cx += 4;
  }
}

export function pixelTextScaled(str, x, y, c, k) {
  let cx = x;
  for (const ch of str) {
    const g = FONT[ch];
    if (g) {
      for (let i = 0; i < 15; i++) if (g[i] === "1") rect(cx + i % 3 * k, y + (i / 3 | 0) * k, k, k, c);
    }
    cx += 4 * k;
  }
}

export function vgrad(x, y, w, h, stops) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

export function glow(cx, cy, rx, ry, rgba) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, rgba);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
  ctx.restore();
}
