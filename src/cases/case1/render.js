/** @file Desenho do caso 1: vagões, cabine, túnel e finais. */
import { SCREEN_H, SCREEN_W } from '../../core/config.js';
import { drops, gameState, player } from '../../core/state.js';
import { ctx, drawDisc, drawLine, drawSprite, pixelText, pixelTextScaled, rect } from '../../render/canvas.js';
import { darknessCtx, darknessMask, punchLight } from '../../render/darkness.js';
import { drawDetective } from '../../render/detective.js';
import { bench, carShell, drawDoor, drawNPC, pole } from '../../render/wagon.js';
import { archShape } from '../../scenes/station.js';
import { BENTO, npcRows, POLICE_PAL } from '../../sprites/characters.js';
import { C1NPC, CLARA, CLARA_PAL, CLARA_SIT, KID_PAL, KIDS, TLAMPS } from './data.js';
import { state1 } from './state.js';

export function drawCut1() {
  if (gameState.cutscene === 2 && state1.run && state1.run.ending) {
    drawEnding(state1.run.ending);
    if (gameState.fadeIn > 0) rect(0, 0, SCREEN_W, SCREEN_H, `rgba(0,0,0,${Math.min(1, gameState.fadeIn * 2)})`);
    return;
  }
  if (gameState.cutscene === 0) {
    rect(0, 0, SCREEN_W, SCREEN_H, "#0a0918");
    rect(130, 40, 100, 104, "#161333");
    for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) rect(138 + c * 22, 50 + r * 17, 12, 10, (c * 3 + r * 5 + (gameState.clock * 0.7 | 0)) % 4 ? "#d9a85a" : "#2a2640");
    pixelTextScaled("CENTRAL", 152, 26, "#e8b04a", 2);
    rect(0, 122, SCREEN_W, 22, "#0b0a15");
    drawSprite(BENTO, POLICE_PAL, 40, 100, false);
    for (let k = 0; k < 8; k++) if ((gameState.clock * 8 | 0) % 8 === k) rect(66 + k * 8, 96 - k * 4, 3, 3, "#5fe0ff");
    for (const d of drops) rect(d.x, d.y, 1, 4, "rgba(150,170,230,.35)");
  } else if (gameState.cutscene === 1) {
    rect(0, 0, SCREEN_W, SCREEN_H, "#000");
    pixelTextScaled("2 HORAS", 82, 44, "#f1e6c8", 3);
    pixelTextScaled("DEPOIS", 90, 72, "#e8b04a", 3);
  } else {
    rect(0, 0, SCREEN_W, SCREEN_H, "#0d0b18");
    archShape(40, 10, 176, 134, "#17142a");
    archShape(52, 22, 152, 122, "#0b0a14");
    rect(0, 118, SCREEN_W, 26, "#201c33");
    rect(0, 126, SCREEN_W, 2, "#4a4568");
    drawDisc(128, 40, 5, "#f3d27a");
    drawSprite(CLARA_SIT, CLARA_PAL, 114, 93, false);
    rect(117, 109, 10, 3, "#8a4a22");
    rect(126, 108, 5, 1, "#3a2418");
    drawSprite(BENTO, POLICE_PAL, 176, 96, true);
    rect(140, 104, 36, 10, "rgba(255,240,180,.08)");
  }
  if (gameState.fadeIn > 0) rect(0, 0, SCREEN_W, SCREEN_H, `rgba(0,0,0,${Math.min(1, gameState.fadeIn * 2)})`);
}

export function c1Doors() {
  const g = "#3fb36b", y = "#e8b04a";
  if (state1.run.sec === "tras") {
    drawDoor(0, "SAIDA", gameState.caseSolved && gameState.clock * 2 % 2 < 1 ? "#9dffb0" : g, false);
    drawDoor(gameState.worldWidth - 16, "FRENTE", y, true);
  } else if (state1.run.sec === "frente") {
    drawDoor(0, "TRAS", y, false);
    drawDoor(gameState.worldWidth - 16, "CABINE", y, true);
  } else if (state1.run.sec === "tunel") drawDoor(0, "SAIDA", g, false);
  else drawDoor(0, "VAGAO", y, false);
}

function drawRear() {
  carShell([30, 110, 260, 340]);
  bench(20, 170);
  bench(280, 400);
  pole(186);
  pole(268);
  rect(196, 40, 14, 22, "#4a4268");
  rect(197, 41, 12, 20, "#5c5380");
  rect(199, 44, 8, 2, "#e8b04a");
  rect(199, 48, 6, 1, "#d9d4e8");
  rect(199, 51, 7, 1, "#d9d4e8");
  rect(199, 54, 5, 1, "#d9d4e8");
  C1NPC.tras.forEach(drawNPC);
}

function drawFront() {
  carShell([24, 92, 272, 338]);
  bench(20, 130);
  bench(300, 396);
  pole(170);
  rect(138, 10, 26, 4, "#3a3550");
  rect(140, 14, 22, 3, "#1b1726");
  if (!state1.run.vanished) {
    rect(141, 17, 20, 3, Math.sin(gameState.clock * 3) > 0 ? "#ff8a6a" : "#b33a2e");
  } else {
    for (const [sx, sy] of [[144, 126], [150, 129], [156, 125], [161, 128]]) rect(sx, sy, 1, 1, "#bfe4ff");
  }
  rect(208, 22, 50, 78, "#141124");
  rect(210, 24, 22, 74, "#3a3a52");
  rect(234, 24, 22, 74, "#3a3a52");
  rect(232, 24, 2, 74, "#141124");
  rect(214, 30, 14, 16, "#0c0b16");
  rect(238, 30, 14, 16, "#0c0b16");
  pixelText("TRILHOS", 219, 52, "#7a7090");
  if (state1.run.vanished) {
    rect(231, 24, 4, 74, "#050409");
    rect(232, 30, 2, 60, "#0f1a14");
  }
  rect(192, 52, 14, 22, "#4a4268");
  rect(193, 53, 12, 20, "#5c5380");
  rect(198, 56, 3, 10, "#e8b04a");
  rect(197, 66, 5, 3, "#b33a2e");
  C1NPC.frente.forEach(drawNPC);
  if (!state1.run.vanished) {
    const x = state1.run.vx, f = true;
    rect(x - 1, 119, 14, 2, "rgba(0,0,0,.3)");
    drawSprite(CLARA, CLARA_PAL, x, 98, f);
    rect(x - 3, 104, 5, 14, "#6b3a22");
    rect(x - 3, 104, 5, 1, "#8a5a32");
    rect(x - 2, 110, 3, 1, "#e8b04a");
    if (state1.run.ev === 1 && state1.run.evT < 1.7) {
      const b = state1.run.evT < 0.15 ? Math.round((0.15 - state1.run.evT) * 30) : 0, by = 86 - b;
      rect(x + 2, by, 8, 10, "#15121c");
      rect(x + 3, by + 1, 6, 8, "#f1e6c8");
      rect(x + 5, by + 2, 2, 4, "#b33a2e");
      rect(x + 5, by + 7, 2, 1, "#b33a2e");
      rect(x + 5, by + 10, 2, 1, "#15121c");
    }
  }
}

function drawCab() {
  rect(0, 0, gameState.worldWidth, 100, "#232a3a");
  rect(0, 0, gameState.worldWidth, 10, "#161c28");
  rect(0, 86, gameState.worldWidth, 14, "#2a3448");
  rect(0, 86, gameState.worldWidth, 1, "#3a4a66");
  rect(180, 18, 74, 62, "#141a24");
  rect(184, 22, 66, 54, "#05070c");
  for (let k = 0; k < 6; k++) {
    rect(206 - k * 4, 76 - k * 0, 1, 1, "#2a3040");
  }
  drawLine(200, 76, 214, 48, "#3a4050");
  drawLine(234, 76, 220, 48, "#3a4050");
  rect(214, 48, 7, 1, "#3a4050");
  rect(226, 34, 6, 10, "#1b1f2a");
  rect(227, 35, 4, 4, gameState.clock % 1.2 < 0.8 ? "#ff3a3a" : "#6a1a1a");
  rect(227, 39, 4, 4, "#1a2a1a");
  rect(90, 62, 90, 24, "#3a3f5a");
  rect(96, 58, 40, 6, "#2a2e44");
  for (let k = 0; k < 8; k++) rect(100 + k * 4, 66, 2, 2, ["#e8b04a", "#5fe08a", "#b33a2e", "#5fe0ff"][k % 4]);
  rect(100, 72, 30, 6, "#10131f");
  rect(102, 74, (Math.sin(gameState.clock * 2) * 0.5 + 0.5) * 24 | 0, 2, "#5fe08a");
  rect(150, 64, 3, 14, "#8a8aa0");
  rect(148, 62, 7, 3, "#b33a2e");
  rect(58, 44, 14, 12, "#2a2a34");
  rect(60, 46, 6, 4, "#10131f");
  rect(68, 46, 2, 2, gameState.clock % 1 < 0.5 ? "#e8653a" : "#5a2a1a");
  rect(70, 40, 1, 4, "#8a8aa0");
  rect(82, 30, 10, 12, "#e9dfc2");
  rect(83, 31, 8, 7, "#5fa0d0");
  rect(83, 36, 8, 2, "#e8d39a");
  rect(85, 34, 1, 1, "#15121c");
  rect(88, 34, 1, 1, "#15121c");
  rect(140, 70, 6, 10, "#c9d4e4");
  rect(140, 70, 6, 2, "#3a5a9a");
  rect(141, 68, 4, 2, "#2a3550");
  rect(0, 100, gameState.worldWidth, 44, "#2e3550");
  for (const y of [106, 114, 124, 136]) rect(0, y, gameState.worldWidth, 1, "#262b44");
  C1NPC.cab.forEach((n) => {
    rect(n.x - 1, 119, 14, 2, "rgba(0,0,0,.3)");
    drawSprite(n.rows, n.pal, n.x, 98, false);
  });
}

export function drawCase1() {
  if (!state1.run) return;
  if (state1.run.sec === "tras") drawRear();
  else if (state1.run.sec === "frente") drawFront();
  else if (state1.run.sec === "tunel") drawTunnel();
  else drawCab();
}

function drawViolin(x, y, flip, playing) {
  const X = (dx) => flip ? x + 11 - dx : x + dx, bo = playing ? Math.round(Math.sin(gameState.clock * 4) * 3) : 0;
  rect(Math.min(X(8), X(11)), y + 10, 4, 3, "#8a4a22");
  drawLine(X(12), y + 11, X(16), y + 9, "#3a2418");
  drawLine(X(5 + bo), y + 8, X(14 + bo), y + 17, "#d9d0b0");
}

function tLampOn(lx) {
  return lx !== 300 || Math.sin(gameState.clock * 17) > -0.3 || Math.sin(gameState.clock * 2.3) > 0.6;
}

/** Ratos (maiores, com olhos que brilham no escuro) e baratas perto da violinista. Também cruzam o caminho do detetive. */
export const RAT_RUNS = [[4.2, 0, -1, 121, 90, 560], [5.6, 2.1, 1, 124, 70, 400], [7.4, 4.7, -1, 118, 115, 600], [6.3, 1.2, 1, 126, 85, 250]];

export function ratPos(run, t) {
  const [period, off, dir, y, sp, from] = run, p = (t + off) % period, len = 200, dur = len / sp;
  if (p > dur) return null;
  return { x: from + dir * p * sp, y, dir, p };
}

function drawRat(x, y, dir, fr) {
  const X = (dx) => dir < 0 ? x - dx : x + dx, L = (a, b) => Math.min(X(a), X(b));
  rect(L(0, 11), y - 1, 12, 5, "#5e5866"); rect(L(1, 9), y - 2, 9, 1, "#6e6878");
  rect(L(10, 14), y - 1, 5, 4, "#6a6472"); rect(X(15), y + 1, 1, 1, "#d8a8a8");
  rect(X(11), y - 3, 2, 2, "#8a7a86");
  rect(X(13), y, 1, 1, "#ff5a5a");
  rect(L(-7, -1), y + 1, 7, 1, "#9a8a8e"); rect(L(-10, -7), y + 2, 3, 1, "#9a8a8e");
  rect(X(2 + fr * 2), y + 4, 2, 1, "#2a2830"); rect(X(8 - fr * 2), y + 4, 2, 1, "#2a2830");
}

function drawSewerCritters() {
  const t = gameState.clock, fr = (t * 18 | 0) % 2;
  for (const run of RAT_RUNS) { const r = ratPos(run, t); if (r) drawRat(r.x, r.y, r.dir, fr); }
  for (let k = 0; k < 6; k++) {
    const ph = t * 0.45 + k * 1.3, bx = 462 + k * 14 + Math.sin(ph * 2.3) * 7, by = 62 + ((ph * 16 + k * 9) % 40);
    rect(bx, by, 3, 2, "#4a2c16"); rect(bx, by + 2, 3, 1, "#2a180c"); rect(bx - 1, by - 1, 1, 1, "#6a4a28"); rect(bx + 3, by - 1, 1, 1, "#6a4a28");
    rect(bx - 1, by + 1, 1, 1, "#2a180c"); rect(bx + 3, by + 1, 1, 1, "#2a180c");
  }
}

/** Olhos vermelhos dos ratos brilhando por cima da escuridão. */
function drawCritterEyes(c) {
  if (state1.run.ending) return;
  const t = gameState.clock;
  for (const run of RAT_RUNS) {
    const r = ratPos(run, t);
    if (!r) continue;
    const ex = (r.dir < 0 ? r.x - 13 : r.x + 13) - c;
    rect(ex - 0.5, r.y - 0.5, 2, 2, "rgba(255,60,60,.35)"); rect(ex, r.y, 1, 1, "#ff6a6a");
  }
}

function drawTunnel() {
  const Wd = gameState.worldWidth;
  rect(0, 0, Wd, 100, "#1c1b21");
  rect(0, 0, Wd, 8, "#0e0e12");
  for (let y = 8, r = 0; y < 100; y += 10, r++) {
    rect(0, y, Wd, 1, "#141418");
    for (let x = r % 2 * 10; x < Wd; x += 20) rect(x, y + 1, 1, 9, "#141418");
  }
  rect(0, 13, Wd, 4, "#3a3430");
  rect(0, 13, Wd, 1, "#4e463e");
  rect(0, 20, Wd, 2, "#2c2824");
  for (let x = 20; x < Wd; x += 60) rect(x, 12, 3, 6, "#4a423a");
  for (let x = 0; x < Wd; x += 46) {
    drawLine(x, 26, x + 23, 30, "#151515");
    drawLine(x + 23, 30, x + 46, 26, "#151515");
  }
  rect(40, 40, 30, 12, "#c9a530");
  rect(40, 40, 30, 1, "#e8d070");
  pixelText("SETOR 4", 42, 43, "#15121c");
  rect(150, 14, 6, 10, "#5a4e44");
  rect(148, 22, 10, 2, "#6b5e52");
  for (let k = 0; k < 4; k++) {
    const p = (gameState.clock * 0.8 + k * 0.25) % 1;
    rect(152 + Math.sin(p * 6 + k) * 3, 24 + p * 14, 2 + p * 3, 2 + p * 3, `rgba(200,200,210,${0.35 * (1 - p)})`);
  }
  rect(196, 36, 48, 64, "#26242c");
  archShape(200, 40, 40, 60, "#060608");
  rect(222, 52, 8, 6, "#3a3a3a");
  rect(226, 54, 1, 2, "#c9a530");
  rect(330, 46, 16, 22, "#4a4a3a");
  rect(331, 47, 14, 20, "#5a5a48");
  rect(336, 56, 4, 8, "#b33a2e");
  rect(334, 63, 8, 1, "#2a2a2a");
  pixelText("4", 338, 49, "#15121c");
  rect(380, 28, 3, 72, "#3a3a42");
  for (let k = 0; k < 6; k++) rect(384 + k * 4, 30 + k, 1, 70 - k, "#5a5a62");
  rect(384, 48, 22, 1, "#5a5a62");
  rect(392, 98, 5, 3, "#8a7a3a");
  rect(462, 26, 98, 74, "#2b2218");
  rect(462, 26, 98, 1, "#4a3a28");
  rect(505, 8, 1, 18, "#151515");
  rect(501, 26, 9, 3, "#3a3430");
  rect(503, 29, 5, 2, "#ffd27a");
  rect(520, 98, 26, 22, "#5a3e22");
  rect(520, 98, 26, 1, "#7a5a32");
  rect(520, 108, 26, 1, "#3e2a16");
  rect(546, 108, 12, 12, "#2a5a8a");
  rect(548, 106, 8, 2, "#3a6aaa");
  rect(490, 104, 22, 16, "#6b4a2a");
  rect(490, 104, 22, 1, "#8a6a3a");
  rect(490, 111, 22, 1, "#4a3218");
  for (const lx of TLAMPS) {
    rect(lx - 3, 24, 7, 7, "#2a2a2a");
    rect(lx - 2, 25, 5, 5, tLampOn(lx) ? "#ffd27a" : "#3a2e1a");
    rect(lx, 23, 1, 1, "#2a2a2a");
    if (lx === 300 && !tLampOn(lx) && gameState.clock * 9 % 1 < 0.3) rect(lx + 3, 32, 1, 1, "#fff1b8");
  }
  rect(0, 100, Wd, 44, "#232120");
  rect(0, 103, Wd, 2, "#35302b");
  for (const y of [112, 122]) rect(0, y, Wd, 1, "#1c1a19");
  rect(0, 136, Wd, 8, "#10161e");
  for (let k = 0; k < 12; k++) rect((k * 53 + gameState.clock * 12) % Wd, 138 + k % 3, 4, 1, "#22303e");
  rect(420, 124, 32, 4, "#1c2a3a");
  if (gameState.clock * 0.7 % 1 < 0.1) rect(434, 125, 4, 1, "#4a6a8a");
  if (state1.run.rat > 0) {
    const rx = 220 - (1 - state1.run.rat) * 130;
    rect(rx, 124, 6, 3, "#5a5a62");
    rect(rx + 5, 123, 2, 2, "#5a5a62");
    rect(rx + 6, 123, 1, 1, "#ff6a6a");
    rect(rx - 4, 125, 4, 1, "#8a7a7a");
  }
  if (!state1.run.ending) drawSewerCritters();
  if (!state1.run.ending || state1.run.ending === "c") {
    const cx = 494, top = 86;
    drawSprite(CLARA_SIT, CLARA_PAL, cx, top, true);
    drawViolin(cx, top, true, !state1.run.stopPlay || state1.run.ending === "c");
    rect(487, 110, 6, 10, "#4a2414");
    rect(487, 110, 6, 1, "#6b3a22");
    if (state1.run.met && state1.run.meetT > 0.2 && state1.run.meetT < 1.1) {
      const by = top - 12;
      rect(cx + 2, by, 8, 10, "#15121c");
      rect(cx + 3, by + 1, 6, 8, "#f1e6c8");
      rect(cx + 5, by + 2, 2, 4, "#b33a2e");
      rect(cx + 5, by + 7, 2, 1, "#b33a2e");
    }
  }
}

export function tunnelDark() {
  const c = Math.round(gameState.cameraX * 4) / 4;
  darknessCtx.globalCompositeOperation = "source-over";
  darknessCtx.clearRect(0, 0, SCREEN_W, SCREEN_H);
  darknessCtx.fillStyle = gameState.glassesOn ? "rgba(2,4,10,.72)" : "rgba(2,2,6,.9)";
  darknessCtx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  darknessCtx.globalCompositeOperation = "destination-out";
  const px = player.x - c;
  punchLight(px, 108, 46, 0.35);
  punchLight(px, 108, 34, 0.6);
  punchLight(px, 108, 24, 0.9);
  for (const lx of TLAMPS) if (tLampOn(lx)) {
    punchLight(lx - c, 34, 34, 0.35);
    punchLight(lx - c, 34, 20, 0.6);
  }
  punchLight(505 - c, 90, 70, 0.45);
  punchLight(505 - c, 90, 50, 0.75);
  ctx.drawImage(darknessMask, 0, 0);
  drawCritterEyes(c);
  if (gameState.glassesOn) {
    for (let x = 30, k = 0; x < 466; x += 7, k++) {
      const sx = x - c;
      if (sx < -4 || sx > SCREEN_W + 4) continue;
      const a = 0.35 + 0.45 * Math.max(0, Math.sin(gameState.clock * 3 - k * 0.5));
      rect(sx, 123 + (k % 2 ? 3 : 0), 2, 1, `rgba(79,184,255,${a})`);
      rect(sx + 2, 122 + (k % 2 ? 3 : 0), 1, 1, `rgba(170,230,255,${a})`);
    }
  }
  if (state1.run.blk > 0) rect(0, 0, SCREEN_W, SCREEN_H, `rgba(0,0,0,${state1.run.blk > 1 ? (1.2 - state1.run.blk) * 5 : 0.97})`);
}

function drawEnding(k) {
  if (k === "a") {
    rect(0, 0, SCREEN_W, SCREEN_H, "#140a10");
    rect(0, 112, SCREEN_W, 32, "#4a2a18");
    rect(0, 112, SCREEN_W, 2, "#6b4430");
    ctx.globalCompositeOperation = "lighter";
    for (let y = 0; y < 114; y++) {
      const w = 8 + y * 0.32;
      rect(128 - w, y, w * 2, 1, "rgba(255,230,170,.05)");
    }
    ctx.globalCompositeOperation = "source-over";
    for (let x = 0; x < 40; x += 6) {
      rect(x, 0, 6, SCREEN_H, x / 6 % 2 ? "#7a1a26" : "#5a1220");
      rect(SCREEN_W - 6 - x, 0, 6, SCREEN_H, x / 6 % 2 ? "#7a1a26" : "#5a1220");
    }
    rect(0, 0, SCREEN_W, 8, "#5a1220");
    drawSprite(CLARA, CLARA_PAL, 122, 90, false);
    drawViolin(122, 90, false, true);
    for (let i = 0; i < 12; i++) {
      drawDisc(12 + i * 21, 140, 6, "#0a0608");
      if (((gameState.clock * 6 | 0) + i) % 3 === 0) rect(10 + i * 21, 128, 1, 1, "#f1e6c8");
    }
  } else if (k === "b") {
    ["#2a1a3a", "#5a2a4a", "#a84a4a", "#e8844a", "#f3c27a"].forEach((c, i) => rect(0, i * 17, SCREEN_W, 17, c));
    drawDisc(128, 86, 14, "#fff1b8");
    rect(0, 86, SCREEN_W, 58, "#2a2440");
    rect(0, 86, SCREEN_W, 1, "#4a4068");
    for (let x = 0; x < SCREEN_W; x += 8) rect(x, 90, 5, 1, "#d6aa45");
    rect(150, 72, 2, 14, "#1a1630");
    rect(146, 70, 10, 3, "#1a1630");
    const cx = 60 + gameState.clock * 9 % 150;
    rect(cx - 1, 127, 14, 2, "rgba(0,0,0,.35)");
    drawSprite(CLARA, CLARA_PAL, cx, 106, false);
    rect(cx - 3, 112, 5, 13, "#6b3a22");
    drawDetective(32, 128, 1, false, 0);
  } else {
    rect(0, 0, SCREEN_W, 110, "#3a5a4a");
    rect(0, 110, SCREEN_W, 34, "#6b4a30");
    for (let x = 0; x < SCREEN_W; x += 16) rect(x, 110, 1, 34, "#5a3e28");
    rect(68, 12, 120, 48, "#6b4430");
    rect(70, 14, 116, 44, "#1f3a2a");
    pixelText("MUSICA", 104, 22, "#e9e4d8");
    for (let k2 = 0; k2 < 4; k2++) {
      rect(84 + k2 * 24, 38 + k2 % 2 * 4, 2, 6, "#e9e4d8");
      drawDisc(84 + k2 * 24, 44 + k2 % 2 * 4, 1, "#e9e4d8");
    }
    drawSprite(CLARA, CLARA_PAL, 122, 88, false);
    drawViolin(122, 88, false, true);
    [14, 36, 58, 166, 188].forEach((x, i) => {
      drawSprite(KIDS[i % 3], KID_PAL[i % 3], x, 96, x > 128);
    });
    const ana = C1NPC.frente.find((n) => n.name === "Professora Ana");
    drawSprite(npcRows({ hair: "short", glasses: true, dress: true }), ana.pal, 226, 88, true);
    if (gameState.clock * 2 % 1 < 0.6) rect(229, 96, 1, 2, "#9fd0e8");
  }
}
