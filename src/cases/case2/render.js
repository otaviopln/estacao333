/** @file Desenho do caso 2: vagões, tripulação, gás, combate e HUD. */
import { clamp01, SCREEN_H, SCREEN_W } from '../../core/config.js';
import { drops, gameState, player } from '../../core/state.js';
import { ctx, drawDisc, drawLine, drawSprite, drawText, pixelText, pixelTextScaled, rect } from '../../render/canvas.js';
import { glint } from '../../render/clue-art.js';
import { fallAng, fallY, spriteRot } from '../../render/sprite-fx.js';
import { bench, carShell, drawDoor, drawNPC } from '../../render/wagon.js';
import { BENTO, POLICE_PAL, runRows } from '../../sprites/characters.js';
import { ARR, C2COV, C2NPC, COND2_PAL, COND_ROWS, POLICE_ROWS, SRC_VENT, WES_PAL, WES_ROWS } from './data.js';
import { gasLevel } from './gas.js';
import { state2 } from './state.js';
import { drawTribunal } from './tribunal.js';

export function drawCut2() {
  if (gameState.cutscene === 0) {
    rect(0, 0, SCREEN_W, SCREEN_H, "#0a0918");
    rect(130, 40, 100, 104, "#161333");
    for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) rect(138 + c * 22, 50 + r * 17, 12, 10, (c * 3 + r * 5 + (gameState.clock * 0.7 | 0)) % 4 ? "#d9a85a" : "#2a2640");
    pixelTextScaled("CENTRAL", 152, 26, "#e8b04a", 2);
    rect(0, 122, SCREEN_W, 22, "#0b0a15");
    drawSprite(BENTO, POLICE_PAL, 30, 100, false);
    drawSprite(WES_ROWS, WES_PAL, 56, 100, false);
    drawSprite(COND_ROWS, COND2_PAL, 80, 100, false);
    for (const d of drops) rect(d.x, d.y, 1, 4, "rgba(150,170,230,.35)");
  } else if (gameState.cutscene === 1) {
    rect(0, 0, SCREEN_W, SCREEN_H, "#000");
    pixelTextScaled("DIAS", 104, 44, "#f1e6c8", 3);
    pixelTextScaled("DEPOIS", 90, 72, "#e8b04a", 3);
  } else drawTribunal();
  if (gameState.fadeIn > 0) rect(0, 0, SCREEN_W, SCREEN_H, `rgba(0,0,0,${Math.min(1, gameState.fadeIn * 2)})`);
}

export function c2Doors() {
  const g = "#3fb36b", y = "#e8b04a";
  if (state2.run.sec === "a") {
    drawDoor(0, "SAIDA", g, false);
    drawDoor(gameState.worldWidth - 16, "VAGAO 2", y, true);
  } else if (state2.run.sec === "b") {
    drawDoor(0, "VAGAO 1", y, false);
    drawDoor(gameState.worldWidth - 16, "RESTRITO", state2.run.restOpen ? y : "#b33a2e", true);
  } else drawDoor(0, "VAGAO 2", y, false);
}

function drawGas() {
  if (!state2.run || !state2.run.gp) return;
  for (const p of state2.run.gp) rect(Math.round(p.x - p.r / 2), Math.round(p.y), Math.round(p.r), Math.round(p.r), `rgba(175,125,235,${Math.max(0, p.a)})`);
}

function coffeeArt(x) {
  rect(x + 2, 56, 22, 44, "#6e1f2c");
  rect(x + 4, 60, 18, 12, "#1b1726");
  rect(x + 6, 62, 14, 4, gameState.clock % 1.4 < 0.7 ? "#7fd6a0" : "#2f5a44");
  rect(x + 6, 76, 3, 2, "#e8b04a");
  rect(x + 11, 76, 3, 2, "#e8b04a");
  rect(x + 16, 76, 3, 2, "#b33a2e");
  rect(x + 6, 86, 14, 10, "#141124");
  rect(x + 11, 91, 4, 4, "#e2dccb");
}

function ventArt(x) {
  rect(x, 10, 24, 4, "#3a3f5a");
  for (let k = 0; k < 4; k++) rect(x + 2 + k * 6, 11, 3, 2, "#10131f");
  if (state2.run && (state2.run.phase === "gas" || state2.run.phase === "mask")) rect(x + 2, 14, 20, 1, "rgba(175,125,235,.6)");
}

function bubble(x, y, ch, c) {
  rect(x + 2, y, 8, 10, "#15121c");
  rect(x + 3, y + 1, 6, 8, "#f1e6c8");
  pixelText(ch, x + 5, y + 2, c || "#b33a2e");
}

function npcDraw2(n) {
  if (n.gone) return;
  const base = n.sit ? 98 : 120;
  if (n.p > 0 || n.sw > 0) {
    const ang = fallAng(n.p) + (n.sw > 0 ? Math.sin(gameState.clock * 9 + n.x) * 0.14 : 0);
    spriteRot(n.rows, n.pal, n.x + 6, Math.round(fallY(base, n.p)), ang, false);
    if (n.p >= 1 && (gameState.clock * 1.2 + n.x) % 2 < 1) pixelText("Z", n.x + 14, 106 - (gameState.clock * 6 | 0) % 3, "#b79aff");
    if (n.dz) bubble(n.x + 2, base - 38 + (n.sit ? 0 : 0), "?", "#3a3a8a");
    return;
  }
  if (n.walking || n.flee) {
    const fr = (gameState.clock * (n.flee ? 12 : 8) | 0) % 2;
    drawSprite(runRows(n.rows, fr), n.pal, n.x, 98 - fr, n.flee ? true : player.x < n.x + 6);
    if (n.flee) bubble(n.x + 2, 82, "!");
    if (!n.flee && n.walkTo !== null && Math.abs(n.walkTo - n.x) < 1) n.walking = false;
    return;
  }
  drawNPC(n);
  if (n.dz) bubble(n.x + 2, n.sit ? 60 : 84, "?", "#3a3a8a");
  if (n.otavio && state2.run.phase === "pre") {
    const x = n.x, y = 74;
    rect(x - 3, y + 9, 17, 6, "#3e2414");
    rect(x - 2, y + 10, 15, 4, "#2a3a7a");
    rect(x - 3, y + 15, 17, 6, "#6b4430");
    rect(x - 3, y + 15, 17, 1, "#8a5a40");
    rect(x + 1, y + 17, 2, 2, "#e8b04a");
    rect(x + 9, y + 17, 2, 2, "#e8b04a");
    rect(x + 4, y + 11, 5, 1, "#bff3ff");
    rect(x + 3, y + 12, 7, 1, "#e6fdff");
    rect(x + 4, y + 13, 5, 1, "#9fd8f0");
    rect(x + 5, y + 14, 3, 1, "#7fc0e0");
    glint(x + 9, y + 10, 0);
    glint(x + 3, y + 12, 1.6);
  }
  if (n.otavio && state2.run.phase === "gas" && state2.run.gt > 0.3 && state2.run.gt < 1.8) bubble(n.x, 60, "!");
}

function c2Npcs(sec) {
  const fightOn = ["standoff", "flee", "fight"].includes(state2.run.phase);
  C2NPC[sec].forEach((n) => {
    if (n.cond && (gameState.caseSolved || fightOn)) return;
    if (n.cop && fightOn) return;
    if (n.otavio && !n.sit && (state2.run.phase === "clear" || state2.run.phase === "inv")) return;
    if (n.otavio && state2.run.phase === "standoff") {
      drawSprite(n.rows, n.pal, n.x, 98, true);
      rect(n.x + 1, 96, 2, 1, "#c48a62");
      rect(n.x + 9, 96, 2, 1, "#c48a62");
      return;
    }
    npcDraw2(n);
  });
}

function gunPix(x, y, left) {
  rect(left ? x - 5 : x + 11, y, 5, 2, "#2a2a34");
  rect(left ? x - 1 : x + 11, y + 2, 1, 2, "#2a2a34");
}

function drawFightBack() {
  const fr = (gameState.clock * 12 | 0) % 2;
  if (state2.run.phase === "standoff") {
    drawSprite(WES_ROWS, WES_PAL, 70, 98, false);
    gunPix(70, 112, false);
    drawSprite(COND_ROWS, COND2_PAL, 118, 98, true);
    gunPix(118, 112, true);
    if (gameState.clock * 2 % 2 < 1) bubble(232, 62, "!");
    drawSprite(POLICE_ROWS, POLICE_PAL, 306, 100, true);
    return;
  }
  const F = state2.run.F;
  if (!F) return;
  const c = F.cop, ctop = c.st === "hide" ? 100 : 92;
  drawSprite(c.st === "run" ? runRows(POLICE_ROWS, fr) : POLICE_ROWS, POLICE_PAL, c.x, ctop - (c.st === "run" ? fr : 0), true);
  if (c.st === "out" || c.st === "back") gunPix(c.x, ctop + 14, true);
  if (c.st === "out" && c.tm > 0.3 && c.tm < 0.4) rect(c.x - 8, ctop + 13, 2, 3, "#fff1b8");
  for (const b of F.b) {
    if (b.st === "down") {
      drawSprite(b.rows.slice(0, 19), b.pal, b.x + 6, 105, false);
      rect(b.x + 9, 109, 3, 2, "#e9e4f8");
      rect(b.x + 9, 111, 3, 1, "#b33a2e");
      rect(b.x + 22, 121, 5, 2, "#2a2a34");
      continue;
    }
    if (b.st === "run") {
      drawSprite(runRows(b.rows, fr), b.pal, b.x, 102 - fr, F.esc);
      continue;
    }
    if (b.st === "hide") {
      drawSprite(b.rows, b.pal, b.x, 101, false);
      continue;
    }
    const top = 102 + (b.st === "hurt" ? 2 : 0);
    drawSprite(b.rows, b.pal, b.x, top, false);
    gunPix(b.x, top + 14, false);
    if (b.st === "hurt") rect(b.x + 3, top + 15, 2, 2, "#b33a2e");
    if (b.st === "rec" && b.tm > 0.25) rect(b.x + 16, top + 13, 2, 3, "#fff1b8");
  }
}

function coverArt(c) {
  const x = c.x, w = c.w, h = c.h, y = c.feet - h;
  rect(x - 1, c.feet - 1, w + 2, 2, "rgba(0,0,0,.3)");
  if (c.kind === "malas") {
    rect(x, y + 8, w, h - 8, "#7a3a2a");
    rect(x, y + 8, w, 1, "#9a5a3a");
    rect(x + 2, y, w - 4, 9, "#2a5a7a");
    rect(x + 2, y, w - 4, 1, "#4a7a9a");
    rect(x + 5, y - 1, 6, 1, "#2a2a2a");
    rect(x + 3, y + 12, w - 6, 1, "#5a2a1a");
  } else if (c.kind === "carrinho") {
    rect(x, y + 3, w, h - 7, "#c9a44a");
    rect(x, y + 3, w, 1, "#e8c86a");
    rect(x + 2, y + 8, w - 4, 1, "#a8843a");
    for (let k = 0; k < 4; k++) rect(x + 2 + k * 5, y - 2, 2, 5, ["#3a8ad0", "#e8653a", "#5fe08a", "#e8d14a"][k]);
    drawDisc(x + 4, y + h - 2, 2, "#2a2a2a");
    drawDisc(x + w - 4, y + h - 2, 2, "#2a2a2a");
    pixelText("AGUA", x + 3, y + 10, "#6b4430");
  } else if (c.kind === "limpeza") {
    rect(x, y + 6, w, h - 6, "#8a8aa0");
    rect(x, y + 6, w, 1, "#a8a8bc");
    rect(x + 2, y + 2, 8, 6, "#e8d14a");
    rect(x + w - 4, y - 10, 1, 16, "#8a6a4a");
    rect(x + w - 6, y - 11, 5, 2, "#c9c2a8");
    drawDisc(x + 4, y + h - 1, 2, "#2a2a2a");
    drawDisc(x + w - 4, y + h - 1, 2, "#2a2a2a");
  } else {
    rect(x, y + 6, w, h - 6, "#9a7a4a");
    rect(x + 3, y, w - 8, 8, "#b8945a");
    rect(x, y + 6, w, 1, "#c4a46a");
    rect(x + w / 2 - 1, y + 6, 2, h - 6, "#c9b890");
    rect(x + 5, y + 2, 6, 1, "#7a5a2a");
    pixelText("FRAGIL", x + 1, y + 12, "#5a3a1a");
  }
}

export function drawC2Front() {
  coverArt(C2COV[3]);
  const ot = C2NPC.b.find((n) => n.otavio);
  if (ot && !ot.sit && (state2.run.phase === "clear" || state2.run.phase === "inv")) npcDraw2(ot);
  const F = state2.run.F;
  if (!F) return;
  if (state2.run.phase === "fight" && F.on) {
    for (const b of F.b) if (b.st === "aim") {
      const x0 = b.x + 16, y0 = 112, x1 = b.tg === "cop" ? F.cop.x + 6 : player.x, y1 = b.tg === "cop" ? 98 : 118;
      for (let k = 0; k < 1; k += 0.04) {
        if ((k * 25 | 0) % 2) rect(Math.round(x0 + (x1 - x0) * k), Math.round(y0 + (y1 - y0) * k), 1, 1, "rgba(255,60,60,.85)");
      }
    }
  }
  for (const s of F.tr) {
    drawLine(Math.round(s.x0), Math.round(s.y0), Math.round(s.x1), Math.round(s.y1), s.c);
    if (s.spark) rect(s.x1 - 1, s.y1 - 1, 3, 3, "#fff1b8");
  }
  if (F.gun) {
    const k = F.gun.t / 0.75, sx = F.cop.x, sy = 96, gx = sx + (player.x - sx) * k, gy = sy + (118 - sy) * k - Math.sin(Math.PI * k) * 30, sp = (gameState.clock * 20 | 0) % 2;
    rect(Math.round(gx), Math.round(gy), sp ? 5 : 2, sp ? 2 : 5, "#2a2a34");
  }
  if (state2.run.phase === "fight" && F.out) rect(player.x - 11, 118, 5, 2, "#2a2a34");
}

function drawRestCar() {
  const Wd = gameState.worldWidth;
  rect(0, 0, Wd, 100, "#3e2c24");
  for (let x = 0; x < Wd; x += 12) rect(x, 10, 1, 76, "#34241e");
  rect(0, 0, Wd, 10, "#24180f");
  rect(0, 86, Wd, 14, "#2e2018");
  rect(0, 86, Wd, 1, "#5a4030");
  for (const lx of [60, 160, 260]) {
    rect(lx, 10, 1, 8, "#15100c");
    rect(lx - 5, 18, 11, 4, "#c96a2a");
    rect(lx - 3, 22, 7, 1, "#ffd27a");
    ctx.globalCompositeOperation = "lighter";
    for (let y = 23; y < 100; y++) {
      const w = 4 + (y - 23) * 0.45;
      rect(lx - w, y, w * 2, 1, "rgba(255,190,110,.03)");
    }
    ctx.globalCompositeOperation = "source-over";
  }
  rect(130, 24, 40, 26, "#1b120c");
  rect(132, 26, 36, 22, "#0c0a10");
  for (let k = 0; k < 3; k++) rect(134 + (gameState.clock * 30 + k * 14) % 34, 34 + k * 4, 3, 1, "#e8b04a");
  pixelText("DESCANSO", 98, 12, "#e8b04a");
  rect(30, 40, 38, 60, "#5a6070");
  rect(31, 41, 17, 58, "#6a7080");
  rect(50, 41, 17, 58, "#2a2e38");
  for (const hy of [50, 62]) {
    rect(54, hy, 2, 2, "#c0c0c8");
    rect(60, hy, 2, 2, "#c0c0c8");
  }
  rect(56, 74, 8, 6, "#3a3f4a");
  rect(36, 46, 6, 8, "#b33a2e");
  rect(80, 80, 70, 12, "#a8582a");
  rect(80, 92, 70, 8, "#8a4420");
  rect(78, 78, 4, 22, "#7a3a1a");
  rect(148, 78, 4, 22, "#7a3a1a");
  rect(118, 82, 24, 8, "#3a6a8a");
  rect(120, 84, 20, 1, "#5a8aaa");
  rect(160, 82, 76, 18, "#6b4430");
  rect(160, 80, 76, 3, "#8a5a40");
  rect(176, 58, 28, 22, "#c0c6d8");
  rect(178, 60, 24, 10, "#8a90a4");
  rect(184, 70, 12, 6, "#2a2a34");
  rect(186, 76, 8, 4, "#e9e4f8");
  rect(200, 62, 3, 3, gameState.clock % 1 < 0.5 ? "#ff3a3a" : "#5a1a1a");
  for (let k = 0; k < 3; k++) {
    const p = (gameState.clock * 0.7 + k * 0.33) % 1;
    rect(180 + k * 3 + Math.sin(p * 6) * 2, 56 - p * 12, 2, 2, `rgba(230,230,240,${0.5 * (1 - p)})`);
  }
  rect(214, 38, 22, 14, "#2a2a34");
  rect(216, 40, 12, 10, "#10131f");
  rect(230, 41, 4, 2, "#5fe08a");
  rect(244, 58, 18, 42, "#e9e4f8");
  rect(244, 74, 18, 1, "#c9c4d8");
  rect(259, 62, 1, 8, "#8a8aa0");
  rect(247, 61, 6, 5, "#f3d27a");
  rect(250, 64, 2, 1, "#b33a2e");
  rect(270, 26, 26, 18, "#15121c");
  rect(272, 28, 22, 14, "#2a7a3a");
  rect(272 + gameState.clock * 8 % 20, 33, 2, 2, "#f1f1f1");
  rect(282, 28, 1, 14, "#e9e4f8");
  rect(302, 90, 10, 10, "#8a5a3a");
  rect(300, 78, 4, 12, "#3a8a4a");
  rect(305, 74, 4, 16, "#4aa05a");
  rect(309, 80, 3, 10, "#3a8a4a");
  rect(0, 100, Wd, 44, "#4a3428");
  for (const y of [108, 118, 130]) rect(0, y, Wd, 1, "#3e2a20");
  rect(70, 112, 110, 18, "#7a2a2a");
  rect(72, 114, 106, 14, "#8a3a3a");
  for (let x = 74; x < 178; x += 6) rect(x, 120, 3, 1, "#c96a4a");
}

function drawC2A() {
  carShell([30, 110, 200, 276, 352], "#232a40");
  bench(20, 160);
  bench(190, 300);
  bench(320, 400);
  ventArt(48);
  ventArt(330);
  coffeeArt(164);
  rect(262, 68, 14, 8, "#d9d4c0");
  rect(262, 68, 14, 2, "#15121c");
  rect(264, 71, 10, 1, "#8a806a");
  rect(264, 73, 8, 1, "#8a806a");
  rect(116, 108, 3, 20, "#2a3a6a");
  rect(114, 108, 7, 3, "#3a4a8a");
  rect(117, 126, 2, 3, "#c9a44a");
  c2Npcs("a");
  drawGas();
}

function drawC2B() {
  carShell([30, 200, 262, 420], "#232a40");
  bench(20, 190);
  bench(220, 340);
  ventArt(236);
  ventArt(SRC_VENT);
  coffeeArt(352);
  rect(246, 68, 12, 8, "#c9c4d8");
  rect(246, 68, 12, 2, "#7a7a8a");
  rect(248, 71, 8, 3, "#e8b04a");
  c2Npcs("b");
  if (["standoff", "flee", "fight"].includes(state2.run.phase)) drawFightBack();
  C2COV.slice(0, 3).forEach(coverArt);
  drawGas();
}

function drawFog() {
  const g = gasLevel();
  if (g <= 0) return;
  const c = Math.round(gameState.cameraX * 4) / 4;
  for (let k = 0; k < 4; k++) for (let x = 0; x < SCREEN_W; x += 4) {
    const y = 108 + k * 7 + Math.sin((x + c) * 0.05 + gameState.clock * (0.6 + k * 0.25) + k) * 3;
    rect(x, y, 4, SCREEN_H - y, `rgba(${150 + k * 10},${105 + k * 8},${220},${(0.1 + 0.04 * k) * g})`);
  }
  if (state2.run.phase === "gas") {
    const d = clamp01((state2.run.gt - 3.6) / 0.8);
    if (d > 0) rect(0, 0, SCREEN_W, SCREEN_H, `rgba(10,6,18,${d})`);
  }
}

export function c2Fx() {
  drawFog();
  if (state2.run.phase === "gas" && state2.run.gt > 4.4) rect(0, 0, SCREEN_W, SCREEN_H, "#030208");
  if (state2.run.phase === "mask" && state2.run.faint > 0) rect(0, 0, SCREEN_W, SCREEN_H, `rgba(3,2,8,${Math.min(1, (1.6 - state2.run.faint) * 2)})`);
  if (gameState.cutscene >= 0 || gameState.choiceOpen) return;
  if (state2.run.phase === "mask" && !gameState.dialogLine && state2.run.faint <= 0) {
    pixelText("FILTRO", 4, 13, "#c9b8ff");
    rect(30, 14, 40, 3, "#2a2040");
    rect(30, 14, Math.round(40 * state2.run.filter / 100), 3, state2.run.filter < 25 ? "#ff6a8a" : "#b79aff");
  }
  if (["pre", "mask", "clear", "inv"].includes(state2.run.phase) && !gameState.caseSolved && !gameState.dialogLine) {
    const m = Math.floor(state2.run.arr / 60), sc = Math.floor(state2.run.arr % 60), late = state2.run.arr < 60;
    const str = "PRÓXIMA ESTAÇÃO EM " + m + ":" + (sc < 10 ? "0" : "") + sc;
    rect(4, 0.6, Math.max(0, (SCREEN_W - 8) * state2.run.arr / ARR), 1.2, late ? "#ff6a4a" : "#e8b04a");
    rect(SCREEN_W - 88, 2.2, 84, 6.6, "rgba(10,8,16,.65)");
    drawText(str, SCREEN_W - 6, 7.4, late && (gameState.clock * 3 % 1 < 0.6) ? "#ff8a6a" : "#ffd27a", 4.6, "right");
  }
  const F = state2.run.F;
  if (state2.run.phase === "fight" && F) {
    if (F.hurt > 0) rect(0, 0, SCREEN_W, SCREEN_H, `rgba(200,30,30,${F.hurt * 0.6})`);
    for (let i = 0; i < 4; i++) {
      const c = i < F.hp ? "#ff4a5a" : "#3a2030", x = 4 + i * 8;
      rect(x, 4, 2, 2, c);
      rect(x + 3, 4, 2, 2, c);
      rect(x, 6, 5, 2, c);
      rect(x + 1, 8, 3, 1, c);
      rect(x + 2, 9, 1, 1, c);
    }
    for (let i = 0; i < 6; i++) rect(38 + i * 3, 4, 2, 5, i < F.ammo ? "#e8b04a" : "#3a3428");
    if (F.on && !gameState.dialogLine) pixelText(F.rl > 0 ? "RECARREGANDO" : F.out ? "EXPOSTO" : "ABRIGADO", 60, 5, F.out ? "#ff8a6a" : "#7fd6a0");
    if (F.on && !gameState.dialogLine && !F.out) pixelText("TOQUE PARA SAIR", SCREEN_W / 2 - 30, SCREEN_H - 10, "#9aa0c8");
    if (F.msgT > 0) pixelText(F.msg, SCREEN_W / 2 - F.msg.length * 2, 30, "#ff8a6a");
  }
}

export function drawCase2() {
  if (!state2.run) return;
  if (state2.run.sec === "a") drawC2A();
  else if (state2.run.sec === "b") drawC2B();
  else drawRestCar();
}
