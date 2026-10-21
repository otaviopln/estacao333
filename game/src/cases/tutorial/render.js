/** @file Cenários do caso 0: carro visto de fora trafegando por rodovia intermunicipal e o quarto 307 do Hotel Farol (cortes laterais). */
import { SCREEN_H, SCREEN_W } from "../../core/config.js";
import { gameState } from "../../core/state.js";
import { ctx, drawDisc, drawLine, drawSprite, drawText, glow, rect, vgrad } from "../../render/canvas.js";
import { npcPalette, npcRows, POLICE_PAL } from "../../sprites/characters.js";
import { CAR_W, ROOM_W } from "./data.js";
import { stateT } from "./state.js";

const DRIVER_STAND = npcRows({});
const ARREST_POLICE_ROWS = npcRows({});
const DRIVER_PAL = npcPalette({ u: "#10172c", t: "#a8704f", a: "#2a2a3a", A: "#1b1b28", g: "#e2dccb", x: "#15121c" });

/* ===== carro visto de fora na rodovia intermunicipal ===== */

function drawHighway(x, y, w, h, scroll) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  // céu noturno
  vgrad(x, y, w, h * 0.45, [[0, "#03040f"], [0.5, "#0a0d26"], [1, "#12183a"]]);
  // estrelas
  for (let k = 0; k < 40; k++) rect(x + (k * 73) % w, y + (k * 11) % (h * 0.45), 1, 1, `rgba(255,255,255,${0.3 + 0.3 * Math.sin(gameState.clock * 1.5 + k)})`);
  // serra ao longe
  ctx.fillStyle = "#07091c";
  ctx.beginPath(); ctx.moveTo(x, y + h * 0.45);
  for (let i = 0; i <= 14; i++) ctx.lineTo(x + i * (w / 14), y + h * 0.45 - 10 - Math.abs(Math.sin((i * 1.7) + scroll * 0.002)) * 7);
  ctx.lineTo(x + w, y + h * 0.45); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.fill();
  // rodovia (perspectiva da direita para a esquerda)
  ctx.fillStyle = "#10163a";
  ctx.beginPath(); ctx.moveTo(x, y + h * 0.62); ctx.lineTo(x + w, y + h * 0.62); ctx.lineTo(x + w + 20, y + h); ctx.lineTo(x - 20, y + h); ctx.closePath(); ctx.fill();
  // faixa central branca (tracejada, passando da direita para a esquerda)
  ctx.strokeStyle = "#d8d8e8"; ctx.lineWidth = 1.5;
  ctx.setLineDash([24, 24]);
  const dashOffset = (scroll * 0.7) % 48;
  ctx.beginPath(); ctx.moveTo(x - dashOffset, y + h * 0.62); ctx.lineTo(x + w + 48 - dashOffset, y + h * 0.62); ctx.stroke();
  ctx.setLineDash([]);
  // acostamento
  rect(x, y + h - 6, w, 6, "#15151f");
  for (let k = 0; k < w / 10 + 2; k++) rect(x + ((k * 10 - scroll * 1.6) % (w + 10) + w + 10) % (w + 10), y + h - 4, 5, 1, "#8a8a9a");
  // vegetação na beira da estrada
  for (let i = -1; i < w / 64 + 2; i++) {
    const sx = Math.round(x + ((i * 64 - scroll * 0.9) % (w + 64) + (w + 64)) % (w + 64) - 32);
    if (sx < x - 14 || sx > x + w + 14) continue;
    rect(sx, y + h - 22, 3, 18, "#1f4a34"); rect(sx - 4, y + h - 16, 4, 3, "#1f4a34"); rect(sx + 3, y + h - 13, 4, 3, "#1f4a34");
  }
  ctx.restore();
}

function drawCarExterior() {
  const r = stateT.run;
  if (!r) return;
  const jitter = r.bump > 0 ? (Math.floor(gameState.clock * 30) % 2) : 0;
  // rodovia passando
  drawHighway(0, 20, CAR_W, 96, r.scroll);
  // mato/grama na borda inferior
  rect(0, 100, CAR_W, 44, "#1c1824"); rect(0, 100, CAR_W, 2, "#0c0b12");
  rect(10, 112, 290, 22, "#2a2030"); rect(12, 114, 286, 18, "#34283a");
  for (let x = 14; x < 296; x += 10) rect(x, 118, 4, 1, "#463a4e");
  // carro SUV visto de lado, trafegando da esquerda para a direita
  const g = 100; // nível do chão
  const cx = 40 + Math.sin(gameState.clock * 0.5) * 2; // leve balanço
  rect(cx - 2, g - 1, 80, 3, "rgba(0,0,0,.4)");
  rect(cx, g - 22, 76, 15, "#1a1a26"); rect(cx, g - 22, 76, 2, "#3a3a4e"); rect(cx + 2, g - 9, 72, 2, "#0c0b12");
  rect(cx + 8, g - 36, 56, 15, "#16151f"); rect(cx + 8, g - 36, 56, 2, "#34344a"); rect(cx + 64, g - 30, 6, 9, "#16151f");
  [[cx + 11, 12], [cx + 26, 14], [cx + 43, 17]].forEach(([wx, ww], i) => { rect(wx, g - 33, ww, 10, "#243452"); rect(wx, g - 33, ww, 4, "#33496e"); rect(wx, g - 33, 1, 10, "#0c0b12"); if (i === 2) { drawDisc(wx + 10, g - 27, 2, "#0c0b12"); rect(wx + 8, g - 31, 5, 2, "#0c0b12"); } });
  rect(cx + 24, g - 34, 2, 14, "#0c0b12"); rect(cx + 41, g - 34, 2, 14, "#0c0b12");
  rect(cx + 34, g - 18, 4, 1, "#5a5a70"); rect(cx + 52, g - 18, 4, 1, "#5a5a70");
  rect(cx + 8, g - 38, 56, 1, "#5a5a70"); rect(cx + 10, g - 39, 52, 1, "#3a3a4e");
  rect(cx - 1, g - 19, 2, 5, "#ff3a2a"); glow(cx, g - 17, 9, 5, "rgba(255,60,40,.5)");
  rect(cx + 74, g - 19, 3, 4, "#fff6d0"); glow(cx + 78, g - 17, 14, 8, "rgba(255,246,208,.7)");
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = "rgba(255,246,208,.10)"; ctx.beginPath(); ctx.moveTo(cx + 77, g - 18); ctx.lineTo(cx + 140, g - 28); ctx.lineTo(cx + 140, g - 2); ctx.closePath(); ctx.fill(); ctx.restore();
  rect(cx + 30, g - 22, 16, 3, "#e9e2d0"); drawText("OFD-3C33", cx + 38, g - 19.6, "#15121c", 3.4, "center");
  [cx + 16, cx + 60].forEach((wx) => {
    drawDisc(wx, g - 6, 6, "#0c0b12"); drawDisc(wx, g - 6, 3, "#5a5a70");
    const a = r.t * 40; rect(wx + Math.cos(a) * 2, g - 6 + Math.sin(a) * 2, 1, 1, "#e9e2d0"); rect(wx - Math.cos(a) * 2, g - 6 - Math.sin(a) * 2, 1, 1, "#e9e2d0");
  });
  // escuridão noturna sobre a cena
  rect(0, 0, CAR_W, SCREEN_H, "rgba(6,4,16,.30)");
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
  // quadro de avisos vazio e arandela
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
  if (r.place === "room") drawHotelRoom(); else drawCarExterior();
}
