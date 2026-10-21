/** @file Cenários do caso 0: o interior do carro do Departamento e o quarto 307 do Hotel Farol (cortes laterais). */
import { SCREEN_H, SCREEN_W } from "../../core/config.js";
import { gameState } from "../../core/state.js";
import { ctx, drawDisc, drawLine, drawSprite, drawText, glow, rect, vgrad } from "../../render/canvas.js";
import { npcPalette, npcRows, POLICE_PAL } from "../../sprites/characters.js";
import { CAR_W, ROOM_W } from "./data.js";
import { stateT } from "./state.js";

const DRIVER_ROWS = npcRows({ sit: true });
const DRIVER_STAND = npcRows({});
const ARREST_POLICE_ROWS = npcRows({});
const DRIVER_PAL = npcPalette({ u: "#10172c", t: "#a8704f", a: "#2a2a3a", A: "#1b1b28", g: "#e2dccb", x: "#15121c" });

const WINDOWS = [[10, 20, 34, 32], [50, 20, 72, 32], [130, 20, 70, 32]];
const WINDSHIELD = [208, 14, 122, 52];

/* ---------- paisagem lá fora ---------- */
function drawOutside(x, y, w, h, scroll, mode) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const cane = mode === "cane";
  vgrad(x, y, w, h, cane ? [[0, "#03040f"], [0.7, "#0a0d26"], [1, "#12183a"]] : [[0, "#04051a"], [0.6, "#101640"], [1, "#2a2a5a"]]);
  for (let k = 0; k < 12; k++) rect(x + (k * 29) % w, y + (k * 7) % 16, 1, 1, "rgba(255,255,255,.55)");
  if (cane) drawDisc(x + w * 0.7, y + 8, 3, "#cfd6e8");
  // serra ao longe (parallax lento)
  ctx.fillStyle = cane ? "#07091c" : "#10163a";
  ctx.beginPath(); ctx.moveTo(x, y + h);
  for (let i = 0; i <= 14; i++) ctx.lineTo(x + i * (w / 14), y + h - 10 - Math.abs(Math.sin((i * 1.7) + scroll * 0.002)) * 7);
  ctx.lineTo(x + w, y + h); ctx.fill();
  // objetos que passam (da direita para a esquerda)
  const period = cane ? 18 : 64;
  for (let i = -1; i < w / period + 2; i++) {
    const sx = Math.round(x + ((i * period - scroll * 0.9) % (w + period) + (w + period)) % (w + period) - period / 2);
    if (sx < x - 14 || sx > x + w + 14) continue;
    if (cane) {
      const sway = Math.sin(gameState.clock * 3 + i) * 1.2, hh = 28 + (i * 5 % 9);
      drawLine(sx, y + h - 6, sx + sway, y + h - 6 - hh, "#1a3a2a"); drawLine(sx + 1, y + h - 6, sx + 2 + sway, y + h - 4 - hh, "#245238");
      drawLine(sx + sway, y + h - 6 - hh, sx - 4 + sway, y + h - hh - 2, "#245238"); drawLine(sx + sway, y + h - 6 - hh, sx + 5 + sway, y + h - hh, "#245238");
    } else if (i % 3 === 0) { // mandacaru
      rect(sx, y + h - 22, 3, 18, "#1f4a34"); rect(sx - 4, y + h - 16, 4, 3, "#1f4a34"); rect(sx - 4, y + h - 20, 2, 5, "#1f4a34"); rect(sx + 3, y + h - 13, 4, 3, "#1f4a34"); rect(sx + 5, y + h - 18, 2, 6, "#1f4a34");
    } else if (i % 3 === 1) { // poste da cerca
      rect(sx, y + h - 16, 2, 12, "#3a2a1c"); drawLine(sx - 14, y + h - 14, sx + 16, y + h - 14, "#5a5a6a"); drawLine(sx - 14, y + h - 10, sx + 16, y + h - 10, "#5a5a6a");
    }
  }
  // acostamento
  rect(x, y + h - 6, w, 6, cane ? "#2a1e14" : "#15151f");
  for (let k = 0; k < w / 10 + 2; k++) rect(x + ((k * 10 - scroll * 1.6) % (w + 10) + w + 10) % (w + 10), y + h - 4, 5, 1, cane ? "#4a3626" : "#8a8a9a");
  ctx.restore();
}

function drawWindshield(x, y, w, h, scroll, mode) {
  const cane = mode === "cane";
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  vgrad(x, y, w, h, cane ? [[0, "#03040f"], [1, "#0c1030"]] : [[0, "#04051a"], [1, "#161c4a"]]);
  for (let k = 0; k < 10; k++) rect(x + (k * 37) % w, y + (k * 5) % 14, 1, 1, "rgba(255,255,255,.55)");
  const vx = x + w * 0.5, vy = y + 22;
  // pista em perspectiva
  ctx.fillStyle = cane ? "#2a1e14" : "#1c1c28";
  ctx.beginPath(); ctx.moveTo(vx - 2, vy); ctx.lineTo(vx + 2, vy); ctx.lineTo(x + w + 30, y + h); ctx.lineTo(x - 30, y + h); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 7; i++) {
    const p = ((i / 7 + scroll * 0.004) % 1), py = vy + p * p * (y + h - vy), pw = 0.5 + p * p * 3.5;
    rect(vx - pw / 2, py, pw, 1 + p * 3, cane ? "#4a3626" : "#d8d8e8");
  }
  // beira da estrada: canavial ou cerca
  for (let side = -1; side <= 1; side += 2) for (let i = 0; i < 8; i++) {
    const p = ((i / 8 + scroll * 0.0036) % 1), px = vx + side * (3 + p * p * 70), py = vy + p * p * (y + h - vy) - p * p * 12, s = 1 + p * 5;
    if (cane) rect(px - s / 2, py - s * 2.2, s, s * 2.2, "#1a3a2a"); else rect(px - s / 4, py - s * 1.4, Math.max(1, s / 2), s * 1.4, "#5a4a3a");
  }
  // faróis iluminando a pista
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgba(255,246,208,.10)"; ctx.beginPath(); ctx.moveTo(vx - 4, vy); ctx.lineTo(vx + 4, vy); ctx.lineTo(x + w - 6, y + h); ctx.lineTo(x + 6, y + h); ctx.closePath(); ctx.fill(); ctx.restore();
  if (!cane) { // luzes de uma cidade distante, com Jõao Pessoa ao fundo
    for (let k = 0; k < 8; k++) rect(vx - 22 + k * 6, vy - 1 + (k % 2), 1, 1, "#f2c46a");
  }
  ctx.restore();
}

/* ---------- interior ---------- */
function drawCarInterior() {
  const r = stateT.run;
  if (!r) return;
  const jitter = r.bump > 0 ? (Math.floor(gameState.clock * 30) % 2) : 0;
  // teto, laterais e painel da porta
  rect(0, 0, CAR_W, 14, "#16131e"); rect(0, 12, CAR_W, 2, "#2a2433");
  rect(0, 14, CAR_W, 86, "#2a2433");
  // janelas laterais com a paisagem
  WINDOWS.forEach(([x, y, w, h]) => { drawOutside(x, y + jitter, w, h, r.scroll, r.mode); rect(x - 1, y - 1, w + 2, 1, "#0c0b12"); rect(x - 1, y + h, w + 2, 2, "#0c0b12"); rect(x - 1, y - 1, 1, h + 2, "#0c0b12"); rect(x + w, y - 1, 1, h + 2, "#0c0b12"); });
  // colunas
  [[44, 20, 6, 36], [122, 20, 8, 36], [200, 14, 8, 52]].forEach(([x, y, w, h]) => { rect(x, y, w, h, "#1c1824"); rect(x, y, 1, h, "#3a3446"); });
  drawWindshield(WINDSHIELD[0], WINDSHIELD[1] + jitter, WINDSHIELD[2], WINDSHIELD[3], r.scroll, r.mode);
  rect(WINDSHIELD[0] - 1, WINDSHIELD[1] - 1, WINDSHIELD[2] + 2, 1, "#0c0b12");
  // friso cromado e painel inferior da porta
  rect(0, 54, CAR_W - 122, 2, "#8a7a5a"); rect(0, 56, 208, 44, "#3a2d3d"); rect(0, 56, 208, 1, "#5a4a5a");
  rect(0, 70, 208, 1, "#2a1f2c"); rect(20, 78, 22, 14, "#241a26"); for (let k = 0; k < 4; k++) rect(22, 80 + k * 3, 18, 1, "#4a3a4a");
  rect(130, 60, 38, 28, "#2e2431"); rect(131, 61, 36, 26, "#241a26"); // bolso da porta
  rect(100, 58, 14, 4, "#8a8a9e"); rect(100, 58, 14, 1, "#b8b8cc"); // maçaneta traseira
  // banco traseiro
  rect(8, 38, 16, 60, "#5a2434"); rect(8, 38, 2, 60, "#7a3448"); rect(8, 32, 14, 8, "#4a1c2a"); rect(9, 33, 12, 1, "#7a3448");
  rect(8, 88, 92, 10, "#6a2a3c"); rect(8, 88, 92, 2, "#8a3a50"); for (let k = 0; k < 6; k++) rect(18 + k * 14, 90, 1, 7, "#4a1c2a");
  rect(8, 98, 92, 2, "#2a0e16");
  // piso e tapete
  rect(0, 100, CAR_W, 44, "#1c1824"); rect(0, 100, CAR_W, 2, "#0c0b12");
  rect(10, 112, 290, 22, "#2a2030"); rect(12, 114, 286, 18, "#34283a");
  for (let x = 14; x < 296; x += 10) rect(x, 118, 4, 1, "#463a4e");
  // banco do motorista, volante e painel
  rect(206, 44, 16, 52, "#3a2434"); rect(206, 44, 2, 52, "#5a3a4e"); rect(207, 38, 13, 8, "#2e1c2a");
  rect(206, 90, 46, 9, "#4a2c3e"); rect(206, 90, 46, 2, "#6a4258"); rect(206, 99, 46, 2, "#1a0e16");
  drawSprite(DRIVER_ROWS, DRIVER_PAL, 224, 72, false);
  // volante inclinado
  drawLine(250, 70, 256, 82, "#0c0b12"); drawLine(251, 70, 257, 82, "#1c1c28"); rect(247, 68, 4, 3, "#2a2a3a");
  drawLine(246, 78, 252, 74, "#0c0b12");
  // painel de instrumentos e console
  rect(262, 68, 68, 32, "#15121c"); rect(262, 68, 68, 2, "#3a3448"); rect(262, 82, 68, 1, "#0c0b12");
  for (let k = 0; k < 5; k++) rect(268 + k * 8, 86, 5, 3, k % 2 ? "#2a2a3a" : "#1c1c28");
  drawDisc(278, 76, 5, "#0c0b12"); drawDisc(278, 76, 3, "#1c4a5a"); drawLine(278, 76, 280, 74, "#ff8a6a");
  // retrovisor
  rect(268, 14, 2, 6, "#0c0b12"); rect(262, 20, 20, 7, "#0c0b12"); rect(263, 21, 18, 5, "#4a5a7a"); rect(263, 21, 18, 1, "#7a8aaa");
  if ((gameState.clock % 4) < 0.35) { rect(270, 23, 2, 1, "#f2eed8"); rect(274, 23, 2, 1, "#f2eed8"); }
  // luz de teto e brilho do painel
  glow(150, 14, 46, 22, "rgba(255,226,160,.18)"); rect(140, 12, 20, 3, "#e9e2d0");
  glow(290, 62, 30, 16, "rgba(95,224,255,.16)");
  // escuridão do carro
  rect(0, 0, CAR_W, SCREEN_H, "rgba(6,4,16,.22)");
}


/* ===== quarto 307 do Hotel Farol ===== */
const DOOR = { x: 6, y: 26, w: 28 };

function drawHotelRoom() {
  const r = stateT.run, W = ROOM_W, clock = gameState.clock;
  // teto, parede com listras, rodapé, carpete
  rect(0, 0, W, 12, "#241f2c"); rect(0, 12, W, 2, "#3a3446");
  rect(0, 14, W, 86, "#4a4658");
  for (let x = 0; x < W; x += 12) rect(x, 14, 4, 86, "#524e64");
  rect(0, 74, W, 26, "#3a3548"); rect(0, 74, W, 2, "#6a5a4a"); rect(0, 96, W, 4, "#2a2430");
  rect(0, 100, W, 44, "#232846"); rect(0, 100, W, 2, "#0c0b18");
  for (let y = 104; y < 144; y += 8) for (let x = ((y / 8) % 2) * 12; x < W; x += 24) { rect(x, y, 10, 1, "#323a66"); rect(x + 4, y - 2, 2, 5, "#2c3358"); }
  // porta do corredor (abre durante a emboscada)
  const open = r.amb ? r.amb.door : 0;
  if (open > 0) { rect(DOOR.x, DOOR.y, DOOR.w, 74, "#e8d8a8"); rect(DOOR.x, DOOR.y, DOOR.w, 3, "#c8b888"); }
  const dw = Math.max(3, DOOR.w * (1 - open * 0.9));
  rect(DOOR.x - 2, DOOR.y - 2, DOOR.w + 4, 78, "#2a1810");
  rect(DOOR.x, DOOR.y, dw, 74, "#5a3a28"); rect(DOOR.x, DOOR.y, 2, 74, "#7a5238");
  if (dw > 12) { rect(DOOR.x + 4, DOOR.y + 6, dw - 8, 24, "#4a2e22"); rect(DOOR.x + 4, DOOR.y + 36, dw - 8, 30, "#4a2e22"); rect(DOOR.x + dw - 5, DOOR.y + 38, 2, 5, "#c8963a"); drawText("307", DOOR.x + dw / 2, DOOR.y + 18, "#e8b04a", 7, "center"); rect(DOOR.x + dw / 2 - 1, DOOR.y + 24, 2, 2, "#15121c"); }
  rect(DOOR.x, 98, DOOR.w, 2, r.amb && r.amb.door > 0.02 ? "#ffe9a8" : "#14111c"); // frestas de luz do corredor
  // quadro de avisos vazio (a planta de evacuação é a pista) e arandela
  rect(52, 24, 2, 8, "#3a3446"); rect(48, 20, 10, 5, "#8a6a3a"); rect(49, 18, 8, 3, "#f2c46a");
  // interruptor ao lado da porta
  rect(46, 40, 10, 14, "#cfc8b0"); rect(47, 41, 8, 12, "#e9e2d0"); rect(49, 43, 4, 8, "#b8b0a0"); rect(50, r.lightsOff ? 48 : 44, 2, 3, "#6a6a7a");
  // mala no chão
  rect(66, 114, 26, 14, "#3a2a24"); rect(66, 114, 26, 2, "#5a4034"); rect(76, 111, 6, 3, "#15121c"); rect(66, 120, 26, 1, "#241812"); rect(70, 116, 2, 10, "#c8963a");
  // cama
  rect(98, 99, 104, 3, "rgba(0,0,0,.35)");
  rect(98, 78, 4, 22, "#3a2418"); rect(100, 84, 98, 14, "#2a2a4a"); rect(100, 84, 98, 14, "#1e5a6a"); rect(100, 84, 98, 3, "#2a7a8a"); rect(100, 94, 98, 4, "#164a58");
  for (let x = 110; x < 196; x += 14) rect(x, 87, 1, 9, "#164a58");
  rect(100, 98, 98, 4, "#3a2418");
  rect(194, 66, 6, 36, "#3a2418"); rect(194, 66, 6, 3, "#5a3a28"); rect(176, 78, 18, 7, "#e9e2d0"); rect(176, 78, 18, 2, "#fff"); rect(178, 76, 12, 3, "#d6cdb4");
  // criado-mudo, telefone e abajur
  rect(200, 84, 24, 16, "#4a2e22"); rect(200, 84, 24, 2, "#7a4e34"); rect(204, 88, 16, 8, "#3a2418"); rect(210, 90, 4, 2, "#c8963a");
  rect(217, 70, 2, 14, "#8a7a3a"); rect(212, 62, 12, 9, "#e8c47a"); rect(212, 62, 12, 1, "#fff2c0");
  if (!r.lightsOff) glow(218, 70, 26, 16, "rgba(255,214,130,.28)");
  // janela com a orla de Tambaú
  const wx = 236, wy = 22, ww = 78, wh = 50;
  ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  vgrad(wx, wy, ww, wh, [[0, "#04051a"], [0.7, "#101640"], [1, "#2a2a5a"]]);
  for (let k = 0; k < 14; k++) rect(wx + (k * 31) % ww, wy + (k * 7) % 20, 1, 1, `rgba(255,255,255,${0.35 + 0.3 * Math.sin(clock * 2 + k)})`);
  drawDisc(wx + 58, wy + 10, 4, "#f2eed8"); glow(wx + 58, wy + 10, 24, 14, "rgba(200,210,255,.18)");
  rect(wx, wy + 30, ww, 8, "#0a1030"); for (let k = 0; k < 9; k++) rect(wx + 40 + k * 3 + Math.sin(clock * 3 + k) * 1.5, wy + 31 + (k % 3) * 2, 2, 1, "rgba(220,230,255,.5)");
  rect(wx, wy + 38, ww, 12, "#1a1824"); rect(wx, wy + 38, ww, 1, "#3a3a4e");
  [[8, 26], [24, 32]].forEach(([px, ph]) => { rect(wx + px + 4, wy + 38 - ph * 0.6, 1, ph * 0.6, "#05060f"); [[-6, 2], [-4, -1], [5, 2], [3, -1]].forEach(([dx, dy]) => drawLine(wx + px + 4, wy + 38 - ph * 0.6, wx + px + 4 + dx, wy + 38 - ph * 0.6 + dy, "#05060f")); });
  rect(wx + 40, wy + 20, 1, 20, "#15121c"); rect(wx + 38, wy + 18, 5, 2, "#15121c"); rect(wx + 36, wy + 20, 9, 2, "#ffe08a"); glow(wx + 40, wy + 22, 22, 14, "rgba(255,224,138,.35)");
  // o carro do Departamento estacionado na rua, com o motorista dentro
  rect(wx + 52, wy + 41, 22, 7, "#15151f"); rect(wx + 56, wy + 36, 13, 6, "#101018"); rect(wx + 58, wy + 37, 4, 4, "#243452"); rect(wx + 63, wy + 37, 5, 4, "#243452");
  rect(wx + 59, wy + 38, 2, 2, "#0c0b12"); drawDisc(wx + 57, wy + 48, 2, "#0c0b12"); drawDisc(wx + 70, wy + 48, 2, "#0c0b12");
  rect(wx + 74, wy + 43, 2, 2, "#fff6d0");
  ctx.restore();
  rect(wx - 3, wy - 3, ww + 6, 3, "#1a1018"); rect(wx - 3, wy + wh, ww + 6, 4, "#5a3a28"); rect(wx - 3, wy - 3, 3, wh + 6, "#1a1018"); rect(wx + ww, wy - 3, 3, wh + 6, "#1a1018");
  rect(wx + ww / 2 - 1, wy, 2, wh, "#1a1018");
  rect(wx - 10, wy - 5, 10, wh + 10, "#5a2030"); rect(wx + ww, wy - 5, 10, wh + 10, "#5a2030"); rect(wx - 12, wy - 7, ww + 24, 3, "#c8963a");
  // lustre central
  rect(150, 12, 2, 6, "#15121c"); rect(142, 18, 18, 5, "#e8d8a8"); if (!r.lightsOff) glow(151, 22, 60, 34, "rgba(255,226,160,.22)");
}

/** À frente do detetive: emboscada (motorista e equipe), escuridão do quarto e luz do corredor. */
export function drawTutorialFront() {
  const r = stateT.run;
  if (!r) return;
  if (r.place === "room") drawRoomFront(r);
}

function drawRoomFront(r) {
  const a = r.amb;
  // motorista entrando no escuro, com a pistola de silenciador
  if (a && a.driverX != null) {
    const x = Math.round(a.driverX), y = 100;
    rect(x + 1, 121, 12, 2, "rgba(0,0,0,.35)");
    drawSprite(DRIVER_STAND, DRIVER_PAL, x, y, false);
    if (!a.disarmed) { rect(x + 10, y + 14, 9, 2, "#15121c"); rect(x + 19, y + 14, 10, 2, "#2a2a34"); rect(x + 28, y + 14, 1, 2, "#0c0b12"); }
    else { rect(x + 6, y + 14, 5, 2, "#15121c"); }
  }
  if (a && a.disarmed) rect(a.gunX, 125, 14, 2, "#15121c");
  if (a && a.police) [6, 18].forEach((px) => drawSprite(ARREST_POLICE_ROWS, POLICE_PAL, px, 100, false));
  if (r.lightsOff) {
    rect(0, 0, ROOM_W, SCREEN_H, "rgba(3,5,16,.62)");
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(110,140,255,.05)"; ctx.beginPath(); ctx.moveTo(236, 26); ctx.lineTo(236, 72); ctx.lineTo(190, 118); ctx.lineTo(150, 112); ctx.closePath(); ctx.fill();
    if (a && a.door > 0.05) { ctx.fillStyle = `rgba(255,226,160,${0.16 * a.door})`; ctx.beginPath(); ctx.moveTo(34, 30); ctx.lineTo(34, 100); ctx.lineTo(150, 140); ctx.lineTo(120, 118); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    glow(20, 70, 30, 50, `rgba(255,226,160,${0.25 * (a ? a.door : 0)})`);
  }
}

/** Cartão final, escurecimento de transição e legendas, por cima de tudo. */
export function drawTutorialFx() {
  const r = stateT.run;
  if (!r) return;
  if (r.fade > 0) rect(0, 0, SCREEN_W, SCREEN_H, `rgba(0,0,0,${Math.min(1, r.fade)})`);
  if (r.trans) {
    const a = r.trans.phase === "out" ? Math.min(1, r.trans.t / 0.8) : Math.max(0, 1 - r.trans.t / 0.8);
    const cap = Math.max(0, Math.min(1, Math.min((r.trans.t + (r.trans.phase === "in" ? 0.8 : 0)) / 0.5, 1)));
    if (r.trans.phase === "in" || a > 0.4) {
      drawText("HOTEL FAROL · TAMBAÚ · JOÃO PESSOA", SCREEN_W / 2, 66, `rgba(241,230,200,${cap * (r.trans.phase === "in" ? a : 1)})`, 10, "center");
      drawText("22h12", SCREEN_W / 2, 78, `rgba(232,176,74,${cap * (r.trans.phase === "in" ? a : 1)})`, 8, "center");
    }
  }
  if (r.amb && r.amb.timeCard > 0) {
    drawText("2H50 DA MADRUGADA", SCREEN_W / 2, 70, `rgba(241,230,200,${Math.min(1, r.amb.timeCard)})`, 12, "center");
    drawText("O corredor está em silêncio.", SCREEN_W / 2, 82, `rgba(170,165,200,${Math.min(1, r.amb.timeCard)})`, 7, "center");
  }
  if (r.card > 0) {
    rect(0, 0, SCREEN_W, SCREEN_H, `rgba(0,0,0,${Math.min(1, r.card * 1.4)})`);
    const a = Math.max(0, Math.min(1, (r.card - 0.35) * 2));
    if (a > 0) {
      drawText("CASO 0", SCREEN_W / 2, 58, `rgba(232,176,74,${a})`, 12, "center");
      drawText("A CARONA SUSPEITA", SCREEN_W / 2, 74, `rgba(241,230,200,${a})`, 15, "center");
      rect(SCREEN_W / 2 - 40, 80, 80, 1, `rgba(232,176,74,${a})`);
      drawText("RESOLVIDO", SCREEN_W / 2, 94, `rgba(95,224,255,${a})`, 9, "center");
    }
  }
}

/** Cenário atual do caso 0. */
export function drawTutorialScene() {
  const r = stateT.run;
  if (!r) return;
  if (r.place === "room") drawHotelRoom(); else drawCarInterior();
}
