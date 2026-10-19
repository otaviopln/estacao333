/** @file Desenho do caso 3: vagões escuros, corredor, sala do engenheiro, jornal final e susto. */
import { SCREEN_H, SCREEN_W } from '../../core/config.js';
import { drops, gameState, player } from '../../core/state.js';
import { ctx, drawLine, drawSprite, drawText, pixelText, pixelTextScaled, rect } from '../../render/canvas.js';
import { darknessCtx, darknessMask, punchLight } from '../../render/darkness.js';
import { ARREST_PHOTO, NEWS_PHOTO } from '../../render/images.js';
import { fallAng, fallY, spriteRot } from '../../render/sprite-fx.js';
import { bench, carShell, drawDoor } from '../../render/wagon.js';
import { archShape } from '../../scenes/station.js';
import { BENTO, POLICE_PAL, runRows } from '../../sprites/characters.js';
import { ARL_PAL, ARL_ROWS, ENG_PAL, ENG_ROWS, ENG_SIT, GHOST, OBST, steamOn } from './data.js';
import { hideZone } from './logic.js';
import { state3 } from './state.js';

export function drawCut3() {
  if (gameState.cutscene === 0) {
    rect(0, 0, SCREEN_W, SCREEN_H, "#0a0918");
    rect(0, 112, SCREEN_W, 32, "#0b0a15");
    archShape(60, 16, 136, 100, "#17142a");
    archShape(72, 28, 112, 88, "#0b0a14");
    if ((gameState.clock * 5 | 0) % 3) rect(120, 50, 18, 44, "rgba(220,235,255,.16)");
    drawSprite(BENTO, POLICE_PAL, 92, 92, false);
    drawSprite(ENG_ROWS, ENG_PAL, 122, 92, false);
    for (const d of drops) rect(d.x, d.y, 1, 4, "rgba(150,170,230,.3)");
  } else if (gameState.cutscene === 1) {
    rect(0, 0, SCREEN_W, SCREEN_H, "#000");
    pixelTextScaled("DEPOIS", 90, 58, "#f1e6c8", 3);
  } else {
    drawNewspaper();
  }
  if (gameState.fadeIn > 0) rect(0, 0, SCREEN_W, SCREEN_H, `rgba(0,0,0,${Math.min(1, gameState.fadeIn * 2)})`);
}



const grayCache = /* @__PURE__ */ new Map();

/** Versão em tons de sépia de uma paleta, para a foto da prisão parecer impressa no jornal. */
function sepiaPal(pal) {
  if (grayCache.has(pal)) return grayCache.get(pal);
  const out = { __out: pal.__out };
  for (const k of Object.keys(pal)) {
    const v = pal[k];
    if (typeof v !== "string" || v[0] !== "#") continue;
    const n = parseInt(v.slice(1), 16), l = (n >> 16 & 255) * 0.3 + (n >> 8 & 255) * 0.59 + (n & 255) * 0.11;
    const c = (x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0");
    out[k] = "#" + c(l * 1.02 + 8) + c(l * 0.95 + 4) + c(l * 0.8);
  }
  grayCache.set(pal, out);
  return out;
}

function serif(size, weight) { ctx.font = `${weight || ""} ${size}px Georgia, "Times New Roman", serif`; }

function wrapLines(str, maxW) {
  const words = str.split(" "), lines = [];
  let cur = "";
  for (const w of words) { const test = cur ? cur + " " + w : w; if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test; }
  if (cur) lines.push(cur);
  return lines;
}

function paperText(str, x, y, maxW, size, lh, color, weight, align) {
  serif(size, weight);
  ctx.fillStyle = color;
  ctx.textAlign = align || "left";
  ctx.textBaseline = "alphabetic";
  const lines = wrapLines(str, maxW);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  ctx.textAlign = "left";
  return lines.length * lh;
}

/** Foto da prisão: policial levando o engenheiro algemado pelo túnel, em sépia e granulada. */
function arrestPhoto(x, y, w, h) {
  if (ARREST_PHOTO && ARREST_PHOTO.complete && ARREST_PHOTO.naturalWidth) { ctx.drawImage(ARREST_PHOTO, x, y, w, h); return; }
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  rect(x, y, w, h, "#3a342a");
  rect(x, y + h - 10, w, 10, "#2a2620");
  for (let k = 0; k < w; k += 9) rect(x + k, y, 1, h - 10, "#332e25");
  rect(x + w * 0.62, y + 3, 10, 6, "#8a7e64");
  drawSprite(BENTO, sepiaPal(POLICE_PAL), x + 10, y + h - 30, false);
  drawSprite(ENG_ROWS, sepiaPal(ENG_PAL), x + 24, y + h - 30, false);
  rect(x + 20, y + h - 17, 6, 1, "#c8bea4");
  rect(x + 34, y + h - 15, 3, 2, "#a8a090");
  const fl = ctx.createRadialGradient(x + w - 4, y + 4, 1, x + w - 4, y + 4, w * 0.8);
  fl.addColorStop(0, "rgba(255,248,225,.55)"); fl.addColorStop(1, "rgba(255,248,225,0)");
  ctx.fillStyle = fl; ctx.fillRect(x, y, w, h);
  for (let k = 0; k < 140; k++) { const gx = x + (k * 37.7 % w), gy = y + (k * 23.3 % h); rect(gx, gy, 0.5, 0.5, k % 2 ? "rgba(0,0,0,.35)" : "rgba(255,245,220,.18)"); }
  ctx.restore();
}

function drawNewspaper() {
  const t = gameState.clock;
  // muro de tijolos à noite, com um poste iluminando o recorte
  rect(0, 0, SCREEN_W, SCREEN_H, "#4a261c");
  for (let y = 0, r = 0; y < SCREEN_H; y += 7, r++) {
    rect(0, y, SCREEN_W, 1, "#2e140e");
    for (let x = (r % 2) * 11; x < SCREEN_W; x += 22) rect(x, y + 1, 1, 6, "#2e140e");
  }
  for (let k = 0; k < 50; k++) rect((k * 53) % SCREEN_W, (k * 37) % SCREEN_H, 3, 2, k % 3 ? "#5a2e22" : "#3a1a12");
  const lamp = ctx.createRadialGradient(128, 66, 8, 128, 66, 160);
  lamp.addColorStop(0, "rgba(255,214,150,.20)"); lamp.addColorStop(1, "rgba(0,0,0,.62)");
  ctx.fillStyle = lamp; ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.save();
  ctx.translate(128, 73);
  ctx.rotate(-0.028);
  const pw = 196, ph = 130, x0 = -pw / 2, y0 = -ph / 2;
  // papel amarelado, com borda rasgada e manchas
  rect(x0 + 3, y0 + 4, pw, ph, "rgba(0,0,0,.5)");
  ctx.fillStyle = "#e6dcc2";
  ctx.beginPath(); ctx.moveTo(x0, y0);
  for (let k = 0; k <= 40; k++) ctx.lineTo(x0 + pw * k / 40, y0 + (k % 2 ? 0.8 : 0));
  for (let k = 0; k <= 26; k++) ctx.lineTo(x0 + pw + (k % 2 ? -0.9 : 0), y0 + ph * k / 26);
  for (let k = 40; k >= 0; k--) ctx.lineTo(x0 + pw * k / 40, y0 + ph + (k % 3 ? 0 : -1.2));
  ctx.closePath(); ctx.fill();
  const age = ctx.createRadialGradient(0, 0, 30, 0, 0, 120);
  age.addColorStop(0, "rgba(120,90,40,0)"); age.addColorStop(1, "rgba(120,90,40,.32)");
  ctx.fillStyle = age; ctx.fillRect(x0, y0, pw, ph);
  for (const [sx, sy, sr] of [[60, -40, 9], [-80, 44, 7], [70, 50, 5]]) { ctx.fillStyle = "rgba(140,105,50,.13)"; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.2832); ctx.fill(); }
  const ink = "#231d18", soft = "#4a4036";
  // cabeçalho
  serif(13, "bold italic"); ctx.fillStyle = ink; ctx.textAlign = "center"; ctx.fillText("Diário da Estação", 0, y0 + 14); ctx.textAlign = "left";
  serif(3.4); ctx.fillStyle = soft; ctx.fillText("EDIÇÃO EXTRA", x0 + 6, y0 + 18.5);
  ctx.textAlign = "right"; ctx.fillText("ANO XLII · Nº 333 · R$ 3,00", x0 + pw - 6, y0 + 18.5); ctx.textAlign = "left";
  rect(x0 + 5, y0 + 20, pw - 10, 0.7, ink); rect(x0 + 5, y0 + 21.3, pw - 10, 0.3, ink);
  // manchete
  serif(11.5, "bold"); ctx.fillStyle = ink; ctx.textAlign = "center";
  ctx.fillText("FANTASMA DA ESTAÇÃO 42", 0, y0 + 33);
  ctx.fillText("ERA UM ENGENHEIRO", 0, y0 + 44.5);
  ctx.textAlign = "left";
  paperText("Detetive desvenda o mistério que aterrorizava o trem da plataforma 3 e encontra o responsável escondido nos túneis", 0, y0 + 51, pw - 30, 4.4, 5, soft, "italic", "center");
  rect(x0 + 5, y0 + 59, pw - 10, 0.4, soft);
  // foto do detetive (da capa) e foto da prisão
  const fx = x0 + 7, fy = y0 + 62, fw = 40, fh = 52;
  rect(fx - 0.8, fy - 0.8, fw + 1.6, fh + 1.6, ink);
  if (NEWS_PHOTO && NEWS_PHOTO.complete && NEWS_PHOTO.naturalWidth) ctx.drawImage(NEWS_PHOTO, fx, fy, fw, fh);
  else rect(fx, fy, fw, fh, "#3a342a");
  serif(3.3, "italic"); ctx.fillStyle = soft; ctx.fillText("O detetive responsável pelo caso.", fx, fy + fh + 4);
  const ax = x0 + pw - 7 - 62, ay = fy, aw = 62, ah = 40;
  rect(ax - 0.8, ay - 0.8, aw + 1.6, ah + 1.6, ink);
  arrestPhoto(ax, ay, aw, ah);
  paperText("O engenheiro Amaro Siqueira deixa o túnel algemado.", ax, ay + ah + 4, aw, 3.3, 3.8, soft, "italic");
  // texto da matéria, em coluna
  const cx = fx + fw + 5, cw = ax - cx - 5;
  const body = "Durante semanas, passageiros relataram uma figura pálida que surgia no escuro dos vagões. O caso terminou nesta madrugada: não havia fantasma algum. Segundo a investigação, um engenheiro demitido após vinte anos de empresa usava um projetor holográfico e um drone de choque, controlados de uma sala secreta nos túneis da obra da Estação 42. O vigia noturno, atingido por uma descarga, passa bem. Preso, o engenheiro disse que \"só queria ser lembrado\".";
  serif(3.5); ctx.fillStyle = ink;
  const lines = wrapLines(body, cw);
  lines.slice(0, 15).forEach((l, i) => ctx.fillText(l, cx, fy + 3 + i * 4.1));
  rect(cx - 2.5, fy, 0.3, 54, soft); rect(ax - 2.5, fy, 0.3, 54, soft);
  // pé da página e fita adesiva
  rect(x0 + 5, y0 + ph - 8, pw - 10, 0.3, soft);
  serif(3); ctx.fillStyle = soft; ctx.fillText("CIDADE · POLÍCIA · PÁGINA 3", x0 + 6, y0 + ph - 4);
  for (const [tx, ty, ta] of [[x0 + 4, y0 - 1, -0.5], [x0 + pw - 14, y0 - 1, 0.5]]) { ctx.save(); ctx.translate(tx + 6, ty + 2); ctx.rotate(ta); rect(-7, -2.5, 14, 5, "rgba(235,232,210,.7)"); ctx.restore(); }
  // granulado do papel
  for (let k = 0; k < 260; k++) rect(x0 + (k * 41.3 % pw), y0 + (k * 29.7 % ph), 0.5, 0.5, "rgba(60,45,25,.18)");
  ctx.restore();
  if (Math.sin(t * 7) > 0.93) rect(0, 0, SCREEN_W, SCREEN_H, "rgba(255,240,200,.07)");
  for (const d of drops) rect(d.x, d.y, 1, 4, "rgba(150,170,230,.16)");
}

function drawGhostSprite(x, feet, alpha, isChasing) {
  const top = feet - GHOST.length - 4 + Math.round(Math.sin(gameState.clock * 3) * 2);
  ctx.globalAlpha = alpha;
  for (let r = 0; r < GHOST.length; r++) {
    const off = Math.round(Math.sin(gameState.clock * 5 + r * 0.6) * (r > 12 ? 1.5 : 0.5)), row = GHOST[r];
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === ".") continue;
      rect(x + i + off, top + r, 1, 1, ch === "w" ? "#dfe9ff" : ch === "r" ? isChasing ? "#ff2a2a" : "#05060c" : "#05060c");
    }
  }
  ctx.globalAlpha = 1;
}

function c3Lamps() {
  if (state3.run.sec === "w1") return [[75, 1], [215, Math.sin(gameState.clock * 19) > -0.2 || Math.sin(gameState.clock * 2) > 0.6 ? 1 : 0], [300, 0], [450, 0]];
  if (state3.run.sec === "w2") return [[60, Math.sin(gameState.clock * 23) > 0 ? 1 : 0], [200, 1], [330, Math.sin(gameState.clock * 7) > 0.3 ? 1 : 0]];
  return [];
}

function creepyWall(Wd, dark) {
  for (const [x, y] of [[40, 40], [150, 60], [260, 44], [370, 62], [470, 50]]) if (x < Wd) for (let k = 0; k < 3; k++) drawLine(x + k * 3, y, x + k * 3 + 6, y + 10, "#14101c");
  for (let x = 60; x < Wd - 20; x += 60) {
    const sw = Math.round(Math.sin(gameState.clock * 1.3 + x) * 2);
    drawLine(x, 12, x + sw, 26, "#5a5a6a");
    rect(x + sw - 1, 26, 3, 3, "#7a7a8a");
  }
  ctx.globalCompositeOperation = "source-over";
  for (let k = 0; k < 6; k++) {
    const y = 120 + k * 3;
    for (let x = 0; x < Wd; x += 6) rect(x, y + Math.round(Math.sin(x * 0.05 + gameState.clock * 0.5 + k) * 1.5), 6, 3, "rgba(170,185,220,.035)");
  }
  if (dark) rect(dark, 0, Wd - dark, 144, "rgba(0,0,0,.45)");
}

function drawW1() {
  carShell([30, 110, 200, 276, 352, 430], "#15131f");
  bench(20, 160);
  bench(400, 470);
  rect(186, 10, 22, 4, "#3a3550");
  rect(190, 14, 14, 2, "#1b1726");
  rect(222, 26, 40, 24, "rgba(0,0,0,0)");
  for (const [hx, hy] of [[214, 30], [222, 34], [440, 30]]) {
    rect(hx, hy, 4, 5, "rgba(220,230,255,.35)");
    rect(hx, hy - 2, 1, 2, "rgba(220,230,255,.3)");
    rect(hx + 2, hy - 3, 1, 3, "rgba(220,230,255,.3)");
    rect(hx + 4, hy - 1, 1, 2, "rgba(220,230,255,.3)");
  }
  pixelTextScaled("42", 300, 58, "#6a1414", 2);
  for (let k = 0; k < 5; k++) rect(302 + k * 5, 68, 1, 4 + k * 7 % 6, "#6a1414");
  rect(296, 10, 1, 10 + Math.round(Math.sin(gameState.clock * 2) * 2), "#2a2a2a");
  if (gameState.clock * 6 % 3 < 0.2) {
    rect(295, 22, 3, 3, "#bff3ff");
  }
  rect(338, 40, 28, 60, "#3a3440");
  rect(339, 41, 26, 58, "#4a4352");
  rect(351, 41, 1, 58, "#2a2432");
  rect(346, 64, 2, 6, "#8a8aa0");
  rect(355, 64, 2, 6, "#8a8aa0");
  pixelText("ACHADOS", 338, 32, "#6a6070");
  rect(196, 122, 18, 6, "#c9c0a8");
  rect(198, 123, 10, 1, "#5a5040");
  creepyWall(gameState.worldWidth, 380);
  if (state3.run.phase === "hunt" || state3.run.phase === "out" || state3.run.phase === "corr" || state3.run.phase === "room") spriteRot(ARL_ROWS, ARL_PAL, 300, 122, Math.PI / 2, false);
  const A = state3.run.arl;
  if (state3.run.phase === "escape") {
    if (A.st === "run") {
      const fr = (gameState.clock * 12 | 0) % 2;
      drawSprite(runRows(ARL_ROWS, fr), ARL_PAL, A.x, 98 - fr, true);
      rect(A.x - 4, 108, 3, 2, "#ffe7a0");
      pixelText("CORRE!", A.x - 6, 86, "#ffd27a");
    } else if (A.st !== "gone" || true) spriteRot(ARL_ROWS, ARL_PAL, A.x + 6, Math.round(fallY(120, A.p)), fallAng(A.p), true);
    if (A.st === "taken" && gameState.clock * 12 % 2 < 1) rect(A.x - 2, 108, 22, 14, "rgba(150,220,255,.35)");
  }
}

function drawW2() {
  carShell([30, 110, 190, 270, 350], "#13101b");
  bench(20, 100);
  bench(160, 240);
  for (const cx of [120, 250]) {
    rect(cx, 96, 30, 32, "#5a4028");
    rect(cx, 96, 30, 1, "#7a5a38");
    rect(cx, 108, 30, 1, "#3a2818");
    rect(cx + 2, 98, 1, 28, "#3a2818");
    rect(cx + 27, 98, 1, 28, "#3a2818");
    rect(cx + 4, 84, 22, 12, "#6a4a30");
    rect(cx + 4, 84, 22, 1, "#8a6a40");
  }
  rect(300, 50, 32, 24, "#3a3f5a");
  rect(302, 52, 28, 10, "#10131f");
  rect(304, 54, 8, 1, gameState.clock % 1 < 0.5 ? "#ff3a3a" : "#5fe08a");
  rect(304, 57, 14, 1, "#5fe08a");
  const ang = gameState.clock * 3;
  ctx.globalCompositeOperation = "lighter";
  for (let k = 0; k < 30; k++) {
    const a = ang + k * 0.02;
    rect(210 + Math.cos(a) * k * 3, 16 + Math.abs(Math.sin(a)) * k * 2.4, 3, 3, `rgba(255,40,30,${0.05 * (1 - k / 30)})`);
  }
  ctx.globalCompositeOperation = "source-over";
  rect(206, 10, 8, 6, "#5a1a1a");
  rect(208, 12, 4, 3, gameState.clock * 3 % 1 < 0.5 ? "#ff3a2a" : "#8a1a1a");
  if (!state3.run.hatch) {
    rect(382, 36, 30, 64, "#4a5060");
    rect(383, 37, 28, 62, "#5a6070");
    rect(396, 60, 4, 8, "#c9a530");
    pixelText("MANUT", 384, 40, "#2a2e38");
  } else {
    rect(386, 40, 24, 60, "#050407");
    rect(388, 42, 20, 4, "#2a2a2a");
    for (let y = 48; y < 98; y += 8) rect(390, y, 16, 1, "#3a3a3a");
    rect(352, 36, 30, 64, "#4a5060");
    pixelText("MANUT", 354, 40, "#2a2e38");
  }
  rect(300, 116, 26, 12, "#6a3a8a");
  rect(300, 116, 26, 1, "#8a5aaa");
  rect(304, 112, 12, 4, "#2a5a7a");
  creepyWall(gameState.worldWidth, 0);
}

function drawCorrDoor() {
  const r3 = state3.run;
  if (!r3.doorBroken) {
    const sh = r3.doorShake > 0 ? Math.round(Math.sin(gameState.clock * 80) * 1.5) : 0;
    rect(0, 22, 18, 78, "#1a1814");
    rect(2 + sh, 24, 14, 76, "#4a4a52"); rect(2 + sh, 24, 14, 1, "#6a6a72");
    rect(5 + sh, 34, 8, 10, "#2a2a30"); rect(13 + sh, 62, 2, 5, "#c9a530");
    for (let y = 50; y < 98; y += 12) rect(3 + sh, y, 12, 1, "#3a3a42");
    if (r3.doorShake > 0) for (let k = 0; k < 4; k++) rect(16 + Math.random() * 6, 30 + Math.random() * 60, 1, 1, "#8a8070");
  } else {
    rect(0, 22, 3, 78, "#1a1814"); rect(15, 22, 3, 78, "#1a1814");
    rect(3, 24, 12, 76, "#0a0908");
    ctx.save(); ctx.translate(30, 124); ctx.rotate(-0.12); rect(-14, -3, 28, 5, "#4a4a52"); rect(-14, -3, 28, 1, "#6a6a72"); rect(-8, -2, 2, 3, "#2a2a30"); ctx.restore();
    for (const d of r3.debris || []) {
      if (d.t < 2) { d.t += 1 / 60; d.vy += 140 / 60; d.x += d.vx / 60; d.y = Math.min(127, d.y + d.vy / 60); if (d.y >= 127) { d.vx *= 0.8; d.vy = 0; } }
      rect(d.x, d.y, d.s, d.s * 0.6, "#5a5a62");
    }
  }
}

function drawCorr() {
  const Wd = gameState.worldWidth;
  rect(0, 0, Wd, 100, "#26221c");
  for (let y = 10; y < 100; y += 12) {
    rect(0, y, Wd, 1, "#1e1a15");
  }
  for (let x = 0; x < Wd; x += 34) rect(x, 0, 1, 100, "#1e1a15");
  drawCorrDoor();
  rect(0, 14, Wd, 4, "#4a3e30");
  rect(0, 22, Wd, 2, "#3a3026");
  for (let x = 20; x < Wd; x += 90) {
    rect(x, 40, 30, 14, "#c9a530");
    pixelText("42", x + 8, 44, "#15121c");
  }
  for (let x = 60; x < Wd; x += 120) {
    rect(x, 28, 5, 4, "#3a1a1a");
    rect(x + 1, 29, 3, 2, Math.sin(gameState.clock * 4 + x) > -0.5 ? "#ff3a2a" : "#5a1a1a");
  }
  rect(0, 100, Wd, 44, "#3a3020");
  for (let x = 0; x < Wd; x += 9) rect(x, 110 + x * 7 % 14, 5, 2, "#6a5a22");
  rect(0, 100, Wd, 2, "#5a4a2a");
  for (const o of OBST) {
    if (o.k === "low") {
      rect(o.x - 4, 128 - 10, 6, 10, "#4a4038");
      rect(o.x + o.w - 2, 128 - 14, 6, 14, "#4a4038");
      for (let k = 0; k < 10; k++) rect(o.x + k * (o.w / 10), 92 + k * 0.6, o.w / 10 + 1, 9, "#6a6a72");
      rect(o.x, 92, o.w, 1, "#8a8a94");
      rect(o.x + 4, 94, 2, 5, "#3a3a42");
      rect(o.x + o.w - 6, 97, 2, 5, "#3a3a42");
      const near = (o.x - player.x) * 1 > 6 && o.x - player.x < 46, crouching = state3.run.crouch || state3.run.crouchHold;
      if ((near && !crouching && gameState.clock * 3 % 1 < 0.7) || state3.run.blockT > 0) {
        pixelText("AGACHE", o.x - 8, 80, "#ffd27a");
        rect(o.x - 1, 87, 5, 1, "#ffd27a"); rect(o.x, 88, 3, 1, "#ffd27a"); rect(o.x + 1, 89, 1, 1, "#ffd27a");
      }
    } else if (o.k === "steam") {
      rect(o.x, 124, o.w, 4, "#5a5a62");
      rect(o.x + 5, 118, 6, 6, "#7a7a82");
      if (steamOn(o)) for (let k = 0; k < 10; k++) {
        const p = (gameState.clock * 2 + k * 0.1) % 1;
        rect(o.x + 2 + Math.sin(p * 9 + k) * 4, 122 - p * 44, 4 + p * 4, 4 + p * 4, `rgba(230,230,240,${0.6 * (1 - p)})`);
      }
      else if (gameState.clock * 4 % 1 < 0.3) rect(o.x + 7, 115, 2, 2, "rgba(230,230,240,.5)");
    } else {
      rect(o.x + 6, 10, 2, 30, "#2a2a2a");
      if (steamOn(o)) {
        let y = 40, x = o.x + 7;
        for (let k = 0; k < 8; k++) {
          const nx = o.x + 3 + Math.random() * o.w * 0.7, ny = y + 11;
          drawLine(x | 0, y, nx | 0, ny, "#9fe0ff");
          x = nx;
          y = ny;
        }
        rect(o.x, 124, o.w, 4, "rgba(160,230,255,.6)");
      } else if (gameState.clock * 5 % 1 < 0.2) rect(o.x + 6, 40, 3, 3, "#bff3ff");
    }
  }
  rect(736, 24, 22, 76, "#3a3a42");
  rect(738, 26, 18, 72, "#4a4a52");
  rect(752, 60, 3, 6, "#c9a530");
  rect(736, 98, 22, 2, "rgba(95,224,255,.7)");
}

function drawRoom() {
  rect(0, 0, gameState.worldWidth, 100, "#12121a");
  rect(0, 100, gameState.worldWidth, 44, "#1a1a22");
  rect(30, 30, 60, 40, "#2a2a2e");
  rect(32, 32, 56, 36, "#d9cdb0");
  pixelTextScaled("42", 48, 40, "#7a1a1a", 2);
  drawLine(36, 36, 80, 60, "#b33a2e");
  drawLine(40, 62, 84, 38, "#b33a2e");
  for (const [x, y] of [[40, 40], [70, 44], [60, 58]]) rect(x, y, 4, 4, "#e9e4f8");
  for (let k = 0; k < 3; k++) {
    rect(130 + k * 34, 34, 30, 22, "#0a0c12");
    rect(132 + k * 34, 36, 26, 18, k === 1 ? "#0f2a2a" : "#10141c");
    if (k === 1) {
      ctx.globalAlpha = 0.6;
      for (let r = 0; r < GHOST.length; r += 2) rect(140 + k * 34 - 34 + 34, 38 + r * 0.7, 8, 1, "#9fe0ff");
      ctx.globalAlpha = 1;
    } else for (let r = 0; r < 4; r++) rect(134 + k * 34, 38 + r * 4, (r * 7 + k * 5) % 20 + 4, 1, "#2a9a5a");
  }
  rect(120, 80, 120, 8, "#3a3026");
  rect(124, 88, 4, 40, "#2a2018");
  rect(232, 88, 4, 40, "#2a2018");
  rect(200, 72, 18, 6, "#5a5a62");
  rect(198, 70, 4, 2, "#3a3a3a");
  rect(216, 70, 4, 2, "#3a3a3a");
  for (let k = 0; k < 4; k++) drawLine(150 + k * 20, 88, 160 + k * 16, 128, "#1e1e24");
  drawSprite(ENG_SIT, ENG_PAL, 170, 74, true);
  rect(166, 88, 8, 5, "#2a2a34");
  rect(167, 89, 6, 3, gameState.clock % 0.5 < 0.25 ? "#5fe0ff" : "#3fc0e0");
  ctx.globalCompositeOperation = "lighter";
  for (let r = 0; r < 12; r++) rect(166 - r * 0.3, 76 + r, 12 + r * 0.6, 1, `rgba(95,224,255,${0.18 - r * 0.012})`);
  ctx.globalCompositeOperation = "source-over";
}

export function drawCase3() {
  if (!state3.run) return;
  if (state3.run.sec === "w1") drawW1();
  else if (state3.run.sec === "w2") drawW2();
  else if (state3.run.sec === "corr") drawCorr();
  else drawRoom();
  const G = state3.run.G;
  if (G.on && G.sec === state3.run.sec && state3.run.js <= 0) drawGhostSprite(Math.round(G.x) - 7, 124, 0.55 + 0.25 * Math.sin(gameState.clock * 9), G.st === "chase" || state3.run.sec === "corr");
  if (G.on && G.sec === state3.run.sec && G.alert > 0) rect(Math.round(G.x) - 2, 90, 4, 8, "#ff2a2a");
}

export function c3Doors() {
  const y = "#e8b04a", g = "#3fb36b";
  if (state3.run.sec === "w1") {
    drawDoor(0, "SAIDA", state3.run.phase === "escape" && gameState.clock * 4 % 2 < 1 ? "#ff6a4a" : g, false);
    drawDoor(gameState.worldWidth - 16, "VAGAO 2", state3.run.phase === "pre" ? "#5a5a62" : y, true);
  } else if (state3.run.sec === "w2") drawDoor(0, "VAGAO 1", y, false);
}

/** Viga redesenhada na frente do detetive enquanto ele passa por baixo, com poeira caindo. */
function drawLowFront() {
  if (state3.run.sec !== "corr") return;
  for (const o of OBST) {
    if (o.k !== "low" || player.x < o.x - 6 || player.x > o.x + o.w + 4) continue;
    for (let k = 0; k < 10; k++) rect(o.x + k * (o.w / 10), 92 + k * 0.6, o.w / 10 + 1, 9, "#6a6a72");
    rect(o.x, 92, o.w, 1, "#8a8a94");
    rect(o.x, 100.5, o.w, 1.2, "rgba(0,0,0,.35)");
    const c = gameState.clock;
    for (let k = 0; k < 4; k++) { const p = (c * 1.6 + k / 4) % 1; rect(o.x + 3 + (k * 7) % (o.w - 4), 102 + p * 18, 0.8, 0.8, `rgba(200,190,160,${0.7 * (1 - p)})`); }
    drawText("PASSANDO POR BAIXO", Math.round(player.x) - 22, 86, "#ffd27a", 3.2);
  }
}

export function drawC3Front() {
  drawLowFront();
  if (state3.run.hidden) {
    const z = state3.run.hidden, ex = Math.round(player.x) - 2;
    if (z.k === "bench") {
      rect(ex - 4, 97, 14, 3, "#05040a");
      if (gameState.clock * 0.6 % 3 > 0.15) {
        rect(ex, 98, 1, 1, "#e9f0ff");
        rect(ex + 3, 98, 1, 1, "#e9f0ff");
      }
    } else {
      if (gameState.clock * 0.6 % 3 > 0.15) {
        rect(z.x1 - 1, 88, 1, 1, "#e9f0ff");
        rect(z.x1 - 1, 86, 3, 1, "#2a2436");
      }
    }
  }
}

/** Placa luminosa de passagem sobre as portas entre vagões, desenhada por cima da escuridão. */
function drawC3DoorSigns(c) {
  const r = state3.run, Wd = gameState.worldWidth, t = gameState.clock;
  if (r.sec !== "w1" && r.sec !== "w2") return;
  const MAN = ["...XX.", "...XX.", ".XXXX.", "X.XX.X", "..XXX.", ".X..X.", "X....X"];
  const sign = (x, label, color, arrowDir) => {
    const red = color.indexOf("232,120") >= 0;
    const sx = x - c, w = label.length * 2.7 + 16, hh = 11, bx = sx - w / 2 + (x < 40 ? w / 2 - 4 : -(w / 2 - 4)), by = 25;
    if (bx > SCREEN_W || bx + w < 0) return;
    // falha de energia: a placa pisca e às vezes apaga, como uma lâmpada velha
    const n = Math.sin(t * 37 + x) * Math.sin(t * 11.3 + x * 0.7);
    const lit = n < 0.82 && !(t % 5.3 < 0.12), dim = n > 0.6 ? 0.55 : 1;
    const panel = red ? (lit ? "#8a2420" : "#2a0c0a") : (lit ? "#1c8a3e" : "#0a2412");
    const ink = red ? "#ffd8cc" : "#dcffe4";
    if (lit) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(bx + w / 2, by + hh / 2, 2, bx + w / 2, by + hh / 2, 30);
      g.addColorStop(0, red ? `rgba(255,80,60,${0.3 * dim})` : `rgba(70,255,120,${0.3 * dim})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(bx - 24, by - 20, w + 48, hh + 46);
      ctx.restore();
    }
    rect(bx - 1.2, by - 1.2, w + 2.4, hh + 2.4, "#121212");
    rect(bx, by, w, hh, panel);
    rect(bx, by, w, 0.6, lit ? (red ? "#c84a40" : "#3ec26a") : "#14301c");
    ctx.save(); ctx.globalAlpha = lit ? dim : 0.35;
    for (let r2 = 0; r2 < MAN.length; r2++) for (let k = 0; k < 6; k++) if (MAN[r2][k] === "X") rect(bx + 2.5 + k * 0.9, by + 1.8 + r2 * 1.05, 0.9, 1.05, ink);
    drawText(label, bx + 10 + (w - 10) / 2, by + 8, ink, 4.6, "center");
    ctx.restore();
    for (let yy = 0; yy < hh; yy += 1.2) rect(bx, by + yy, w, 0.35, "rgba(0,0,0,.18)");
    for (const [px, py] of [[0, 0], [w - 1, 0], [0, hh - 1], [w - 1, hh - 1]]) rect(bx + px, by + py, 1, 1, "#2a2a2a");
    if (arrowDir && r.phase === "hunt") for (let k = 0; k < 3; k++) {
      const ph = (t * 1.6 + k / 3) % 1, ax = x - c - arrowDir * (34 - ph * 22);
      drawText(arrowDir > 0 ? ">" : "<", ax, 127, `rgba(90,240,140,${0.25 + 0.6 * (1 - ph)})`, 6, "center");
    }
  };
  if (r.sec === "w1") {
    if (r.phase === "pre") sign(Wd - 10, "VAGÃO 2 · EMPERRADA", "rgba(232,120,90,1)", 0);
    else sign(Wd - 10, "VAGÃO 2  >", "rgba(110,240,150,1)", 1);
    sign(10, "SAÍDA", "rgba(110,240,150,1)", 0);
  } else sign(10, "<  VAGÃO 1", "rgba(110,240,150,1)", -1);
}

export function c3Fx() {
  const c = Math.round(gameState.cameraX * 4) / 4;
  darknessCtx.globalCompositeOperation = "source-over";
  darknessCtx.clearRect(0, 0, SCREEN_W, SCREEN_H);
  let a = state3.run.sec === "room" ? 0.9 : gameState.glassesOn ? 0.6 : 0.78;
  if (state3.run.flk > 0 && Math.sin(gameState.clock * 50) > 0) a = 0.96;
  darknessCtx.fillStyle = `rgba(2,2,8,${a})`;
  darknessCtx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  darknessCtx.globalCompositeOperation = "destination-out";
  if (!state3.run.hidden) {
    const px = player.x - c, py = state3.run.sec === "corr" && (state3.run.crouch || state3.run.crouchHold) ? 116 : 108;
    punchLight(px, py, 40, 0.35);
    punchLight(px, py, 28, 0.6);
    punchLight(px, py, 18, 0.85);
  } else {
    punchLight(player.x - c, 104, 16, 0.4);
  }
  for (const [lx, on] of c3Lamps()) if (on) {
    punchLight(lx - c + 15, 30, 34, 0.35);
    punchLight(lx - c + 15, 30, 20, 0.6);
  }
  // as portas entre vagões ficam iluminadas, para não se perderem no escuro
  if (state3.run.sec === "w1") { punchLight(gameState.worldWidth - 8 - c, 58, 30, 0.55); punchLight(8 - c, 58, 22, 0.4); }
  if (state3.run.sec === "w2") punchLight(8 - c, 58, 30, 0.55);
  if (state3.run.sec === "corr") for (let x = 60; x < gameState.worldWidth; x += 120) punchLight(x + 2 - c, 30, 20, 0.4);
  if (state3.run.sec === "corr") punchLight(746 - c, 96, 20, 0.5);
  if (state3.run.sec === "room") {
    punchLight(170 - c, 82, 22, 0.75);
    punchLight(166 - c, 46, 40, 0.35);
  }
  const G = state3.run.G;
  if (G.on && G.sec === state3.run.sec) punchLight(G.x - c, 108, 16, 0.25);
  if (state3.run.phase === "escape") punchLight(state3.run.arl.x + 6 - c, 108, 20, 0.4);
  ctx.drawImage(darknessMask, 0, 0);
  drawC3DoorSigns(c);
  if (G.on && G.sec === state3.run.sec && state3.run.phase !== "room") {
    const d = Math.max(0, 1 - Math.abs(G.x - player.x) / 180);
    if (d > 0) {
      const p = 0.25 * d * (0.6 + 0.4 * Math.sin(gameState.clock * 8));
      rect(0, 0, SCREEN_W, 6, `rgba(120,0,0,${p})`);
      rect(0, SCREEN_H - 6, SCREEN_W, 6, `rgba(120,0,0,${p})`);
      rect(0, 0, 6, SCREEN_H, `rgba(120,0,0,${p})`);
      rect(SCREEN_W - 6, 0, 6, SCREEN_H, `rgba(120,0,0,${p})`);
    }
  }
  if (state3.run.phase === "hunt" && !gameState.dialogLine && !gameState.choiceOpen) {
    const z = hideZone();
    if (state3.run.hidden) pixelText("ESCONDIDO", SCREEN_W / 2 - 18, SCREEN_H - 10, "#7fd6a0");
    else if (z && G.sec === state3.run.sec) pixelText("ESPACO: ESCONDER", SCREEN_W / 2 - 32, SCREEN_H - 10, "#9aa0c8");
    if (state3.run.tooLate > 0) { state3.run.tooLate -= 1 / 60; drawText("TARDE DEMAIS PARA SE ESCONDER!", SCREEN_W / 2, SCREEN_H - 18, "#ff6a6a", 5, "center"); }
  }
  if (state3.run.sec === "corr" && !gameState.dialogLine) pixelText(state3.run.crouch || state3.run.crouchHold ? "AGACHADO" : "CORRENDO", 4, 13, state3.run.crouch || state3.run.crouchHold ? "#ffd27a" : "#7fd6a0");
  if (state3.run.js > 0) {
    const k = 1 - state3.run.js;
    rect(0, 0, SCREEN_W, SCREEN_H, "#000");
    const s = Math.round(9 + k * 5), fx = 128 - 7 * s + Math.round((Math.random() - 0.5) * 6), fy = 72 - 6 * s + Math.round((Math.random() - 0.5) * 6);
    for (let r = 0; r < 12; r++) for (let i = 0; i < 14; i++) {
      const ch = GHOST[r][i];
      if (ch === ".") continue;
      rect(fx + i * s, fy + r * s, s, s, ch === "w" ? "#e9f0ff" : ch === "r" ? "#ff1a1a" : "#000");
    }
    if (state3.run.js > 0.85) rect(0, 0, SCREEN_W, SCREEN_H, "rgba(255,255,255,.7)");
  }
}
